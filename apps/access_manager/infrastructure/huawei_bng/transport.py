"""Verified interactive VRP SSH with a closed command grammar and pager support."""
from collections import deque
import re
import socket
import time
from threading import Event, RLock, Timer
import paramiko
from .commands import validate
from .errors import BngError

ANSI = re.compile(r'\x1b(?:\[[0-?]*[ -/]*[@-~]|\][^\x07\x1b]*(?:\x07|\x1b\\))')
PAGER = re.compile(r'-{4}\s*More\s*-{4}', re.I)
PROMPT = re.compile(r'(?m)^(?:<[A-Za-z0-9_.:/@()~*-]{1,128}>|\[[A-Za-z0-9_.:/@()~*-]{1,128}\])[ \t]*\Z')
MAX_RESPONSE_BYTES = 1024 * 1024
MAX_PAGES = 256


def terminal_text(raw):
    """Detection view preserves pager occurrences even when VRP erases them."""
    return ANSI.sub('', raw.decode('utf-8', 'replace')).replace('\x08', '').replace('\r', '').replace('\x00', '')


def clean_output(text, command):
    text = re.sub(r'\x08+ +\x08+', '', PAGER.sub('', text))
    visible=[]
    for char in text:
        if char=='\x08':
            if visible and visible[-1]!='\n': visible.pop()
        else: visible.append(char)
    lines = ''.join(visible).strip('\n \t').splitlines()
    if lines and PROMPT.fullmatch(lines[-1].strip()): lines.pop()
    # Strip only the exact command echo. Never remove an arbitrary first line.
    if lines and lines[0].strip() == command: lines.pop(0)
    return '\n'.join(line.rstrip() for line in lines).strip()


class HuaweiBngTransport:
    def __init__(self):
        self.client = None
        self.shell = None
        self.prompt = None
        self.lock = RLock()
        self.read_times = deque(maxlen=10)
        self.states = []
        self.stage = 'connect'
        self.last_operation = None

    @property
    def connected(self):
        transport = self.client.get_transport() if self.client else None
        return bool(transport and transport.is_active() and transport.is_authenticated())

    def _mark(self, stage, state=None):
        self.stage = stage
        if state and state not in self.states: self.states.append(state)

    def connect(self, host, username, password, *, port=22):
        if not isinstance(port, int) or isinstance(port, bool) or not 1 <= port <= 65535:
            raise ValueError('Porta inválida.')
        with self.lock:
            self.close()
            self.states = []
            self._mark('connect')
            client = paramiko.SSHClient()
            endpoint_socket = None
            try:
                client.load_system_host_keys()
                from apps.access_manager.infrastructure.common.ssh_trust import HostTrust, EndpointTrustPolicy
                client.set_missing_host_key_policy(EndpointTrustPolicy(HostTrust(), host, port))
                endpoint_socket = socket.create_connection((host, port), timeout=8)
                self._mark('ssh_banner', 'TCP_CONNECTED')
                owner = self

                class ObservedTransport(paramiko.Transport):
                    def start_client(self, *args, **kwargs):
                        result = super().start_client(*args, **kwargs)
                        owner._mark('host_key', 'SSH_CONNECTED')
                        return result

                    def auth_password(self, *args, **kwargs):
                        owner._mark('authentication')
                        return super().auth_password(*args, **kwargs)

                client.connect(hostname=host, port=port, username=username, password=password,
                               sock=endpoint_socket, transport_factory=ObservedTransport,
                               timeout=8, auth_timeout=8, banner_timeout=8, channel_timeout=8,
                               allow_agent=False, look_for_keys=False)
                self.client = client
                self._mark('shell', 'AUTHENTICATED')
                self._open_shell(8)
            except Exception as error:
                stage = getattr(error, 'stage', None) or self.stage
                client.close()
                if endpoint_socket: endpoint_socket.close()
                self.client = self.shell = None
                self.prompt = None
                if isinstance(error, BngError): raise
                from apps.access_manager.domain.infrastructure_errors import SshTrustError
                if isinstance(error, SshTrustError): raise BngError(error.code, stage='host_key') from None
                if isinstance(error, paramiko.BadHostKeyException): code = 'HOST_KEY_CHANGED'; stage = 'host_key'
                elif isinstance(error, paramiko.AuthenticationException):
                    stage = 'authentication'
                    code = 'AUTH_TIMEOUT' if 'timeout' in str(error).lower() else 'AUTHENTICATION_FAILED'
                elif isinstance(error, (TimeoutError, socket.timeout)) or 'timed out' in str(error).lower() or 'timeout' in str(error).lower():
                    code = {'connect':'CONNECT_TIMEOUT','ssh_banner':'SSH_BANNER_TIMEOUT',
                            'authentication':'AUTH_TIMEOUT','shell':'SHELL_TIMEOUT'}.get(stage, 'SSH_TIMEOUT')
                else: code = 'SSH_UNAVAILABLE'
                raise BngError(code, stage=stage) from None

    def _open_shell(self, timeout):
        deadline = time.monotonic() + timeout
        self._mark('shell')
        expired = Event()
        client = self.client
        def abort_shell():
            expired.set()
            client.close()  # Bounds invoke_shell/PTY negotiation as well as open_session.
        timer = Timer(timeout, abort_shell)
        timer.daemon = True
        timer.start()
        try:
            self.shell = client.invoke_shell(width=160, height=48)
            if expired.is_set(): raise BngError('SHELL_TIMEOUT', stage='shell')
        except Exception as error:
            timed_out=expired.is_set() or isinstance(error,(TimeoutError,socket.timeout))
            raise BngError('SHELL_TIMEOUT' if timed_out else 'SHELL_FAILED', stage='shell') from None
        finally:
            timer.cancel()
        self._mark('prompt', 'SHELL_OPEN')
        try:
            banner,_ = self._read_until_prompt(deadline, initial=True)
            self.prompt=PROMPT.search(terminal_text(banner.encode()).rstrip('\n \t')).group(0).strip()
        except Exception:
            self.shell.close()
            self.shell=None
            raise
        self._mark('command', 'PROMPT_DETECTED')

    def _read_until_prompt(self, deadline, *, initial=False, cancel=None):
        output = bytearray()
        handled = 0
        pages = 0
        waiting_page = False
        while True:
            if cancel and cancel.is_set(): raise BngError('CANCELLED', stage='read_until_prompt')
            left = deadline - time.monotonic()
            if left <= 0:
                raise BngError('PROMPT_TIMEOUT' if initial else 'PAGINATION_TIMEOUT' if waiting_page else 'COMMAND_TIMEOUT',
                               stage='prompt' if initial else 'pagination' if waiting_page else 'read_until_prompt')
            if self.shell.recv_ready():
                data = self.shell.recv(65536)
                if not data: raise BngError('CHANNEL_CLOSED', stage='read_until_prompt')
                output.extend(data)
                waiting_page = False
                if len(output) > MAX_RESPONSE_BYTES: raise BngError('RESPONSE_TOO_LARGE', stage='read_until_prompt')
                text = terminal_text(output)
                for marker in PAGER.finditer(text):
                    if marker.end() <= handled: continue
                    pages += 1
                    if pages > MAX_PAGES: raise BngError('PAGINATION_LIMIT', stage='pagination')
                    left=deadline-time.monotonic()
                    if left<=0: raise BngError('PAGINATION_TIMEOUT',stage='pagination')
                    self.shell.settimeout(left)
                    self.shell.sendall(' ')
                    handled = marker.end()
                    waiting_page = True
                # A partial line such as '<example' cannot end a read.
                candidate = text.rstrip('\n \t')
                prompt=PROMPT.search(candidate)
                if prompt and (initial or prompt.group(0).strip()==self.prompt):
                    return ANSI.sub('',output.decode('utf-8','replace')).replace('\r','').replace('\x00',''), pages
            elif self.shell.closed or getattr(self.shell, 'eof_received', False):
                raise BngError('CHANNEL_CLOSED', stage='read_until_prompt')
            else:
                time.sleep(min(.01, left))

    def execute(self, item, *, timeout=8, cancel=None):
        validate(item)  # Includes fixed commands; validates before touching SSH.
        if isinstance(timeout, bool) or not 0 < timeout <= 30: raise ValueError('Timeout inválido.')
        started = time.monotonic()
        deadline = started + timeout
        if not self.lock.acquire(timeout=timeout): raise BngError('COMMAND_TIMEOUT', stage='session_lock')
        pages = 0
        try:
            if cancel and cancel.is_set(): raise BngError('CANCELLED', stage='command')
            if not self.connected: raise BngError('SSH_UNAVAILABLE', stage='command')
            current = time.monotonic()
            if len(self.read_times) == 10 and current - self.read_times[0] < 1:
                raise BngError('RATE_LIMITED', stage='command')
            self.read_times.append(current)
            if self.shell is None or self.shell.closed:
                left=deadline-time.monotonic()
                if left<=0: raise BngError('COMMAND_TIMEOUT',stage='command')
                self._open_shell(left)
            left = deadline - time.monotonic()
            if left <= 0: raise BngError('COMMAND_TIMEOUT', stage='command')
            self.shell.settimeout(left)
            self.shell.sendall(item.command + '\n')
            try:
                text, pages = self._read_until_prompt(deadline, cancel=cancel)
            except Exception:
                # Never let an unfinished command contaminate a later reader.
                self.shell.close()
                self.shell = None
                raise
            lower = text.lower()
            if 'permission' in lower or 'not authorized' in lower: raise BngError('PERMISSION_DENIED', stage='command')
            if 'unrecognized command' in lower or 'incomplete command' in lower: raise BngError('UNSUPPORTED', stage='command')
            if re.search(r'(?mi)^\s*(?:Error:|%\s*Error)',text): raise BngError('COMMAND_FAILED',stage='command')
            self._mark('command', 'COMMAND_OK')
            return clean_output(text, item.command)
        except BngError:
            raise
        except (TimeoutError, socket.timeout):
            if self.shell: self.shell.close(); self.shell = None
            raise BngError('COMMAND_TIMEOUT', stage='command') from None
        except Exception:
            if self.shell: self.shell.close(); self.shell = None
            raise BngError('SSH_UNAVAILABLE', stage='command') from None
        finally:
            self.last_operation = {'feature':item.feature, 'elapsed_ms':round((time.monotonic()-started)*1000,2), 'pages':pages}
            self.lock.release()

    def close(self):
        with self.lock:
            if self.shell: self.shell.close()
            if self.client: self.client.close()
            self.client = self.shell = None
            self.prompt = None
