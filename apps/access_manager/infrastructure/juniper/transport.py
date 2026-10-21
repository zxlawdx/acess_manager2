"""NETCONF preferred, explicitly allowed SSH/XML fallback. No local shell."""
import socket
import time
from dataclasses import dataclass
from threading import RLock
import paramiko
from .errors import JuniperError
from .requests import validate_request, native_rpc
from .output import JunosCommandResult, normalize, detect
from apps.access_manager.infrastructure.common.ssh_trust import HostTrust, EndpointTrustPolicy
from apps.access_manager.domain.infrastructure_errors import SshTrustError

@dataclass(frozen=True)
class Timeouts:
    connect:int=8
    rpc:int=8
    lookup:int=24


def classify(error,transport):
    if isinstance(error,SshTrustError): return JuniperError(error.code)
    from ncclient.transport.errors import AuthenticationError,SSHUnknownHostError
    from ncclient.operations.errors import TimeoutExpiredError
    if isinstance(error,(AuthenticationError,paramiko.AuthenticationException)):return JuniperError('AUTHENTICATION_FAILED')
    if isinstance(error,paramiko.BadHostKeyException):return JuniperError('HOST_KEY_CHANGED')
    if isinstance(error,SSHUnknownHostError):return JuniperError('HOST_KEY_UNKNOWN')
    if isinstance(error,(socket.timeout,TimeoutError,TimeoutExpiredError)):return JuniperError('CONNECTION_TIMEOUT')
    if 'known_hosts' in str(error) or 'not found in known_hosts' in str(error):return JuniperError('HOST_KEY_UNTRUSTED')
    return JuniperError('NETCONF_UNAVAILABLE' if transport=='netconf' else 'SSH_UNAVAILABLE')

FEATURE_TIMEOUTS={
 'facts':8,'uptime':8,'subscriber_username':24,'subscriber_address':24,'subscriber_detail':24,
 'interfaces':20,'interface':15,'lacp':15,'optics':15,'radius':15,'aaa_authentication':15,
 'aaa_accounting':15,'aaa_dynamic':15,'accounting':20,'route':12,'fib':12,'pppoe':12,'aaa':12,'lockout':12,
}
MAX_RESPONSE_BYTES=4*1024*1024

def read_timeout(feature,timeout=None,default=8):
    import math
    value=float(timeout if timeout is not None else FEATURE_TIMEOUTS.get(feature,default))
    if not math.isfinite(value) or value<=0:raise ValueError('Timeout inválido.')
    return min(value,120)  # Explicit hard safety budget, never silently capped at rpc=8.

class JuniperTransport:
    def __init__(self,timeouts=None):
        self.timeouts=timeouts or Timeouts();self.client=None;self.kind=None;self.host=None;self.port=None;self.lock=RLock()
    @property
    def connected(self):
        client=self.client
        if client is None:return False
        if self.kind=='netconf':return bool(getattr(client,'connected',True))
        channel=client.get_transport()
        return channel is not None and channel.is_active() and channel.is_authenticated()
    def connect(self,host,username,password,*,mode='netconf',port=None,ssh_port=22,netconf_port=830):
        if mode not in {'netconf','ssh','auto'}:raise ValueError('Transporte Juniper inválido.')
        with self.lock:
            self.close()
            if mode in {'netconf','auto'}:
                try:
                    from ncclient import manager
                    trusted=HostTrust().trusted(host,port if mode=='netconf' and port else netconf_port)
                    pinned={'hostkey_b64':trusted[0].get_base64()} if trusted else {}
                    self.client=manager.connect(host=host,port=port if mode=='netconf' and port else netconf_port,username=username,password=password,
                        hostkey_verify=True,allow_agent=False,look_for_keys=False,timeout=self.timeouts.connect,
                        device_params={'name':'junos'},**pinned)
                    self.host=host;self.port=port if mode=='netconf' and port else netconf_port
                    self.kind='netconf';self.client.timeout=self.timeouts.rpc
                    return
                except Exception as error:
                    mapped=classify(error,'netconf')
                    if mode!='auto' or mapped.code in {'AUTHENTICATION_FAILED','HOST_KEY_UNTRUSTED','HOST_KEY_UNKNOWN','HOST_KEY_CHANGED'}:raise mapped from None
            client=paramiko.SSHClient();trust=HostTrust();ssh_endpoint_port=port if mode=='ssh' and port else ssh_port
            if not trust.trusted(host,ssh_endpoint_port):client.load_system_host_keys()
            client.set_missing_host_key_policy(EndpointTrustPolicy(trust,host,ssh_endpoint_port))
            try:
                client.connect(hostname=host,port=port if mode=='ssh' and port else ssh_port,username=username,password=password,
                    timeout=self.timeouts.connect,banner_timeout=self.timeouts.connect,auth_timeout=self.timeouts.connect,
                    allow_agent=False,look_for_keys=False)
                self.client=client;self.kind='ssh';self.host=host;self.port=ssh_endpoint_port
                client.get_transport().set_keepalive(30)
            except JuniperError:
                client.close();raise
            except Exception as error:
                client.close();raise classify(error,'ssh') from None
    def execute(self,item,timeout=None):
        validate_request(item)
        started=time.monotonic()
        with self.lock:
            if not self.connected:raise JuniperError('SSH_UNAVAILABLE')
            limit=read_timeout(item.feature,timeout,self.timeouts.rpc)
            try:
                if self.kind=='netconf':
                    self.client.timeout=limit
                    rpc=native_rpc(item)
                    if rpc:
                        from ncclient.xml_ import to_ele
                        reply=self.client.dispatch(to_ele(rpc))
                    else:reply=self.client.command(item.command,format='xml')
                    # JunosDeviceHandler transforms replies into NCElement;
                    # generic handlers return RPCReply instead.
                    text=reply.data_xml if hasattr(reply,'data_xml') else reply.xml
                    if len(text.encode('utf-8'))>MAX_RESPONSE_BYTES:raise JuniperError('RESPONSE_TOO_LARGE',response_bytes=len(text.encode('utf-8')))
                    return JunosCommandResult('netconf',text,detect(normalize(text)),item.feature,int((time.monotonic()-started)*1000))
                # Paramiko sends a remote command, never a local shell. Every
                # argument is validated before the sole fixed output pipeline.
                _,stdout,stderr=self.client.exec_command(item.command+' | display xml | no-more',timeout=limit)
                channel=stdout.channel;deadline=time.monotonic()+limit;output=bytearray();errors=bytearray()
                while True:
                    if channel.recv_ready():output.extend(channel.recv(65536))
                    if channel.recv_stderr_ready():errors.extend(channel.recv_stderr(65536))
                    if len(output)+len(errors)>MAX_RESPONSE_BYTES:channel.close();raise JuniperError('RESPONSE_TOO_LARGE',response_bytes=len(output)+len(errors))
                    if channel.exit_status_ready() and not channel.recv_ready() and not channel.recv_stderr_ready():break
                    if getattr(channel,'closed',False) and not channel.recv_ready() and not channel.exit_status_ready():raise JuniperError('SSH_UNAVAILABLE',response_bytes=len(output)+len(errors))
                    if time.monotonic()>=deadline:channel.close();raise JuniperError('CONNECTION_TIMEOUT',response_bytes=len(output)+len(errors))
                    time.sleep(.01)
                status=channel.recv_exit_status();channel.close()
                text=output.decode('utf-8','replace')
                if status or errors:
                    if not self.connected:raise JuniperError('SSH_UNAVAILABLE',response_bytes=len(output)+len(errors),exit_status=status)
                    if b'permission' in bytes(errors).lower() or b'permission' in bytes(output).lower():raise JuniperError('PERMISSION_DENIED')
                    raise JuniperError('SSH_COMMAND_FAILED',response_bytes=len(output)+len(errors),exit_status=status)
                text=normalize(text,item.command+' | display xml | no-more')
                return JunosCommandResult('ssh',text,detect(text),item.feature,int((time.monotonic()-started)*1000),status)
            except JuniperError:raise
            except Exception as error:
                # ncclient RPC errors can contain private XML; export tags only.
                tag=getattr(error,'tag',None)
                if tag:raise JuniperError('PERMISSION_DENIED' if tag=='access-denied' else 'RPC_ERROR') from None
                raise classify(error,self.kind) from None
            finally:
                if 'channel' in locals():channel.close()
    def close(self):
        client,self.client=self.client,None
        if client is not None:
            try:
                if self.kind=='netconf':client.close_session()
                else:client.close()
            except Exception:pass
        self.kind=None
