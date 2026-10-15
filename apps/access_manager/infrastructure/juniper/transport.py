"""NETCONF preferred, explicitly allowed SSH/XML fallback. No local shell."""
import socket
import time
from dataclasses import dataclass
from threading import RLock
import paramiko
from .errors import JuniperError
from .requests import validate_request

@dataclass(frozen=True)
class Timeouts:
    connect:int=8
    rpc:int=8
    lookup:int=24


def classify(error,transport):
    from ncclient.transport.errors import AuthenticationError,SSHUnknownHostError
    from ncclient.operations.errors import TimeoutExpiredError
    if isinstance(error,(AuthenticationError,paramiko.AuthenticationException)):return JuniperError('AUTHENTICATION_FAILED')
    if isinstance(error,(paramiko.BadHostKeyException,SSHUnknownHostError)):return JuniperError('HOST_KEY_UNTRUSTED')
    if isinstance(error,(socket.timeout,TimeoutError,TimeoutExpiredError)):return JuniperError('CONNECTION_TIMEOUT')
    if 'known_hosts' in str(error) or 'not found in known_hosts' in str(error):return JuniperError('HOST_KEY_UNTRUSTED')
    return JuniperError('NETCONF_UNAVAILABLE' if transport=='netconf' else 'SSH_UNAVAILABLE')

class JuniperTransport:
    def __init__(self,timeouts=None):
        self.timeouts=timeouts or Timeouts();self.client=None;self.kind=None;self.lock=RLock()
    @property
    def connected(self):return self.client is not None
    def connect(self,host,username,password,*,mode='netconf',port=None):
        if mode not in {'netconf','ssh','auto'}:raise ValueError('Transporte Juniper inválido.')
        with self.lock:
            self.close()
            if mode in {'netconf','auto'}:
                try:
                    from ncclient import manager
                    self.client=manager.connect(host=host,port=port or 830,username=username,password=password,
                        hostkey_verify=True,allow_agent=False,look_for_keys=False,timeout=self.timeouts.connect,
                        device_params={'name':'junos'})
                    self.kind='netconf';self.client.timeout=self.timeouts.rpc
                    return
                except Exception as error:
                    mapped=classify(error,'netconf')
                    if mode!='auto' or mapped.code in {'AUTHENTICATION_FAILED','HOST_KEY_UNTRUSTED'}:raise mapped from None
            client=paramiko.SSHClient();client.load_system_host_keys();client.set_missing_host_key_policy(paramiko.RejectPolicy())
            try:
                client.connect(hostname=host,port=port if mode=='ssh' and port else 22,username=username,password=password,
                    timeout=self.timeouts.connect,banner_timeout=self.timeouts.connect,auth_timeout=self.timeouts.connect,
                    allow_agent=False,look_for_keys=False)
                self.client=client;self.kind='ssh'
            except Exception as error:
                client.close();raise classify(error,'ssh') from None
    def execute(self,item,timeout=None):
        validate_request(item)
        with self.lock:
            if not self.connected:raise JuniperError('SSH_UNAVAILABLE')
            limit=max(.1,min(timeout or self.timeouts.rpc,self.timeouts.rpc))
            try:
                if self.kind=='netconf':
                    self.client.timeout=limit
                    reply=self.client.command(item.command,format='xml')
                    # JunosDeviceHandler transforms replies into NCElement;
                    # generic handlers return RPCReply instead.
                    return reply.data_xml if hasattr(reply,'data_xml') else reply.xml
                # Paramiko sends a remote command, never a local shell. Every
                # argument is validated before the sole fixed output pipeline.
                _,stdout,stderr=self.client.exec_command(item.command+' | display xml | no-more',timeout=limit)
                channel=stdout.channel;deadline=time.monotonic()+limit;output=bytearray();errors=bytearray()
                while True:
                    if channel.recv_ready():output.extend(channel.recv(65536))
                    if channel.recv_stderr_ready():errors.extend(channel.recv_stderr(65536))
                    if len(output)+len(errors)>4*1024*1024:channel.close();raise JuniperError('COMMAND_ERROR')
                    if channel.exit_status_ready() and not channel.recv_ready() and not channel.recv_stderr_ready():break
                    if time.monotonic()>=deadline:channel.close();raise JuniperError('CONNECTION_TIMEOUT')
                    time.sleep(.01)
                status=channel.recv_exit_status();channel.close()
                text=output.decode('utf-8','replace')
                if status or errors:
                    if b'permission' in bytes(errors).lower() or b'permission' in bytes(output).lower():raise JuniperError('PERMISSION_DENIED')
                    raise JuniperError('COMMAND_ERROR')
                return text
            except JuniperError:raise
            except Exception as error:
                # ncclient RPC errors can contain private XML; export tags only.
                tag=getattr(error,'tag',None)
                if tag:raise JuniperError('PERMISSION_DENIED' if tag=='access-denied' else 'RPC_ERROR') from None
                raise classify(error,self.kind) from None
    def close(self):
        client,self.client=self.client,None
        if client is not None:
            try:
                if self.kind=='netconf':client.close_session()
                else:client.close()
            except Exception:pass
        self.kind=None
