"""Verified SSH, serialized reads, bounded output and cooperative cancellation."""
import time
from collections import deque
from threading import RLock
import paramiko
from .commands import validate
from .errors import BngError


class HuaweiBngTransport:
    def __init__(self):
        self.client = None
        self.lock = RLock()
        self.read_times = deque(maxlen=10)

    @property
    def connected(self):
        transport = self.client.get_transport() if self.client else None
        return bool(transport and transport.is_active() and transport.is_authenticated())

    def connect(self, host, username, password, *, port=22):
        if not isinstance(port, int) or isinstance(port, bool) or not 1 <= port <= 65535:
            raise ValueError('Porta inválida.')
        client = paramiko.SSHClient()
        client.load_system_host_keys()
        from apps.access_manager.infrastructure.juniper.trust import HostTrust, EndpointTrustPolicy
        client.set_missing_host_key_policy(EndpointTrustPolicy(HostTrust(),host,port))
        try:
            client.connect(hostname=host, port=port, username=username, password=password,
                           timeout=8, auth_timeout=8, banner_timeout=8,
                           allow_agent=False, look_for_keys=False)
        except Exception as error:
            client.close()
            from apps.access_manager.infrastructure.juniper.errors import JuniperError
            if isinstance(error,JuniperError): raise BngError(error.code) from None
            code = 'AUTHENTICATION_FAILED' if isinstance(error, paramiko.AuthenticationException) else 'HOST_KEY_CHANGED' if isinstance(error, paramiko.BadHostKeyException) else 'SSH_UNAVAILABLE'
            raise BngError(code) from None
        self.client = client

    def execute(self, item, *, timeout=8, cancel=None):
        validate(item)
        if not 0 < timeout <= 30: raise ValueError('Timeout inválido.')
        deadline = time.monotonic() + timeout
        if not self.lock.acquire(timeout=timeout): raise BngError('TIMEOUT')
        channel = None
        try:
            if cancel and cancel.is_set(): raise BngError('CANCELLED')
            if not self.connected: raise BngError('SSH_UNAVAILABLE')
            current=time.monotonic()
            if len(self.read_times)==10 and current-self.read_times[0]<1:
                raise BngError('RATE_LIMITED')
            self.read_times.append(current)
            left = deadline - time.monotonic()
            if left <= 0: raise BngError('TIMEOUT')
            channel = self.client.get_transport().open_session(timeout=left)
            channel.settimeout(left)
            channel.exec_command(item.command)
            output = bytearray()
            while True:
                if cancel and cancel.is_set(): raise BngError('CANCELLED')
                if time.monotonic() >= deadline: raise BngError('TIMEOUT')
                if channel.recv_ready(): output.extend(channel.recv(65536))
                if channel.recv_stderr_ready(): output.extend(channel.recv_stderr(65536))
                if len(output) > 1024 * 1024: raise BngError('RESPONSE_TOO_LARGE')
                if channel.exit_status_ready() and not channel.recv_ready() and not channel.recv_stderr_ready(): break
                if channel.closed and not channel.exit_status_ready(): raise BngError('INCOMPLETE_RESPONSE')
                time.sleep(.01)
            text = output.decode('utf-8', 'replace').replace('\r', '')
            lower = text.lower()
            if 'permission' in lower or 'not authorized' in lower: raise BngError('PERMISSION_DENIED')
            if '---- more ----' in lower or '----more----' in lower: raise BngError('PAGINATED_INCOMPLETE')
            if 'unrecognized command' in lower or 'incomplete command' in lower: raise BngError('UNSUPPORTED')
            if channel.recv_exit_status(): raise BngError('COMMAND_FAILED')
            return text
        except BngError:
            raise
        except Exception:
            raise BngError('SSH_UNAVAILABLE') from None
        finally:
            if channel: channel.close()
            self.lock.release()

    def close(self):
        with self.lock:
            if self.client: self.client.close()
            self.client = None
