"""Interactive fixtures derived from user-provided VRP format, identifiers redacted."""
from collections import deque
from pathlib import Path
from types import SimpleNamespace
import socket
import pytest
import paramiko
from apps.access_manager.infrastructure.huawei_bng.transport import HuaweiBngTransport, PROMPT, MAX_RESPONSE_BYTES
from apps.access_manager.infrastructure.huawei_bng.commands import request, ReadCommand
from apps.access_manager.infrastructure.huawei_bng.errors import BngError
from apps.access_manager.infrastructure.huawei_bng.provider import HuaweiNetEngineBngProvider


class Shell:
    closed=False
    eof_received=False
    def __init__(self,prompt='<BNG-REDACTED>',responses=None):
        self.prompt=prompt.encode()
        self.ready=deque([b'Info: The max number of VTY users is ...\r\n'+self.prompt])
        self.responses=responses or {}
        self.pending=deque()
        self.sent=[]
    def settimeout(self,value): self.timeout=value
    def sendall(self,data):
        self.sent.append(data)
        if data==' ':
            if self.pending: self.ready.extend(self.pending.popleft())
        else:
            command=data.rstrip('\n')
            self.pending=deque(self.responses.get(command,[[command.encode()+b'\r\n2026-10-21 01:00:00\r\n'+self.prompt]]))
            if self.pending: self.ready.extend(self.pending.popleft())
    def recv_ready(self): return bool(self.ready)
    def recv(self,size): return self.ready.popleft()
    def close(self): self.closed=True


def connect(monkeypatch,shell,*,failure=None,shell_error=None):
    calls={}
    class SSH:
        def load_system_host_keys(self): calls['known_hosts']=True
        def set_missing_host_key_policy(self,p): calls['policy']=p
        def connect(self,**options):
            calls['options']=options
            if failure: raise failure
        def invoke_shell(self,**options):
            calls['shell']=options
            if shell_error: raise shell_error
            shell.closed=False
            return shell
        def get_transport(self): return SimpleNamespace(is_active=lambda:True,is_authenticated=lambda:True)
        def close(self): calls['closed']=True
    monkeypatch.setattr(paramiko,'SSHClient',SSH)
    monkeypatch.setattr(socket,'create_connection',lambda *a,**kw:SimpleNamespace(close=lambda:None))
    transport=HuaweiBngTransport()
    transport.connect('bng.example.invalid','operator','never-log-this')
    return transport,calls


@pytest.mark.parametrize('prompt',['<BNG-REDACTED>','<Huawei>','[BNG-REDACTED]','[~BNG-REDACTED]'])
def test_prompt_and_verified_interactive_connection(monkeypatch,prompt):
    shell=Shell(prompt)
    transport,calls=connect(monkeypatch,shell)
    assert 'PROMPT_DETECTED' in transport.states
    assert isinstance(calls['policy'],paramiko.RejectPolicy)
    assert calls['known_hosts'] and not calls['options']['allow_agent']
    assert calls['options']['transport_factory']
    assert transport.execute(request('health'))=='2026-10-21 01:00:00'
    transport.close();assert shell.closed and calls['closed']


@pytest.mark.parametrize('bad',['some <hostname> data','<hostname> trailing','[a] data','<partial','<a]'])
def test_false_prompts(bad): assert PROMPT.search(bad) is None


def test_split_pager_multiple_pages_and_terminal_cleanup(monkeypatch):
    shell=Shell(responses={'display version':[
        [b'display version\r\n\x1b[32mline 1\x1b[0m\r\n---- Mo',b're ----'],
        [b'\x08'*14+b' '*14+b'\x08'*14+b'\r\nline 2\r\n----More----'],
        [b'\r\nline 3\r\n<BNG-',b'REDACTED>'],
    ]})
    transport,_=connect(monkeypatch,shell)
    result=transport.execute(request('system'))
    assert all(line in result for line in ['line 1','line 2','line 3'])
    assert shell.sent==['display version\n',' ',' ']
    assert not any(char in result for char in ['\x1b','\x08','\r'])
    assert 'More' not in result and '<BNG' not in result and 'display version' not in result
    assert transport.last_operation['pages']==2


def test_real_format_fixture_provider_health_before_paginated_facts(monkeypatch):
    fixture=(Path(__file__).parent/'fixtures/huawei_bng/version_paginated.txt').read_bytes()
    first,last=fixture.split(b'---- More ----')
    shell=Shell(responses={'display version':[[first+b'---- More ----'],[last]]})
    transport,_=connect(monkeypatch,shell)
    provider=HuaweiNetEngineBngProvider(lambda:transport)
    # The fake SSH handshake reuses this shell; reset its banner for provider.connect.
    shell.ready.append(b'<BNG-REDACTED>')
    result=provider.connect('bng.example.invalid','operator','never-log-this')
    assert shell.sent[:2]==['display clock\n','display version\n']
    assert result['model']=='NetEngine 8000' and result['firmware']=='V800R025C00SPC500'
    assert 'CONNECTED' in provider.connection_metadata()['connection_states']
    assert provider.connected
    provider.disconnect();assert shell.closed


def test_missing_facts_does_not_invalidate_operational_connection():
    class Transport:
        connected=True
        states=[]
        def connect(self,*a,**kw): pass
        def execute(self,item):
            if item.feature=='system': raise BngError('PARSE_UNKNOWN',stage='facts')
            return '2026-10-21 01:00:00'
        def close(self): self.connected=False
    provider=HuaweiNetEngineBngProvider(Transport)
    result=provider.connect('bng.example.invalid','u','private')
    assert provider.connected and result.get('model') is None
    assert provider.get_system()['feature_states']['system']=='PARSE_UNKNOWN'


@pytest.mark.parametrize('pager,code,stage',[(False,'COMMAND_TIMEOUT','read_until_prompt'),(True,'PAGINATION_TIMEOUT','pagination')])
def test_bounded_command_and_pager_timeouts_close_only_unfinished_shell(monkeypatch,pager,code,stage):
    shell=Shell(responses={'display version':[[b'---- More ----' if pager else b'partial output']]})
    transport,_=connect(monkeypatch,shell)
    with pytest.raises(BngError) as error: transport.execute(request('system'),timeout=.02)
    assert (error.value.code,error.value.stage)==(code,stage)
    assert shell.closed and transport.connected


def test_initial_prompt_timeout(monkeypatch):
    shell=Shell();shell.ready.clear()
    transport=HuaweiBngTransport()
    transport.client=SimpleNamespace(invoke_shell=lambda **kw:shell,close=lambda:None)
    with pytest.raises(BngError) as error:transport._open_shell(.02)
    assert error.value.code=='PROMPT_TIMEOUT' and error.value.stage=='prompt'
    assert shell.closed


@pytest.mark.parametrize('payload',['; reboot','\nreset','| include password'])
def test_invalid_command_never_reaches_shell(monkeypatch,payload):
    shell=Shell();transport,_=connect(monkeypatch,shell)
    with pytest.raises(ValueError): transport.execute(ReadCommand('system',payload))
    assert not shell.sent


def test_output_limit_and_channel_closed(monkeypatch):
    shell=Shell(responses={'display version':[[b'x'*(MAX_RESPONSE_BYTES+1)]]})
    transport,_=connect(monkeypatch,shell)
    with pytest.raises(BngError,match='RESPONSE_TOO_LARGE'):transport.execute(request('system'))
    assert shell.closed


def test_connect_timeout_stage(monkeypatch):
    def fail(*a,**kw): raise socket.timeout('never-log-this')
    monkeypatch.setattr(socket,'create_connection',fail)
    with pytest.raises(BngError) as error: HuaweiBngTransport().connect('bng.example.invalid','u','never-log-this')
    assert (error.value.code,error.value.stage)==('CONNECT_TIMEOUT','connect')
    assert 'never-log-this' not in str(error.value)


@pytest.mark.parametrize('failure,code',[(paramiko.AuthenticationException('Authentication timeout.'),'AUTH_TIMEOUT'),(paramiko.AuthenticationException('denied'),'AUTHENTICATION_FAILED'),(socket.timeout(),'SSH_BANNER_TIMEOUT')])
def test_ssh_and_auth_failure_stages(monkeypatch,failure,code):
    with pytest.raises(BngError) as error:connect(monkeypatch,Shell(),failure=failure)
    assert error.value.code==code
    assert error.value.stage==('authentication' if code.startswith('AUTH') else 'ssh_banner')


def test_shell_failure_stage(monkeypatch):
    with pytest.raises(BngError) as error:connect(monkeypatch,Shell(),shell_error=RuntimeError('private'))
    assert (error.value.code,error.value.stage)==('SHELL_FAILED','shell')
    assert 'private' not in str(error.value)


def test_shell_negotiation_deadline(monkeypatch):
    from apps.access_manager.infrastructure.huawei_bng import transport as module
    class ExpiredTimer:
        def __init__(self,timeout,callback): self.callback=callback
        def start(self): self.callback()
        def cancel(self): pass
    monkeypatch.setattr(module,'Timer',ExpiredTimer)
    with pytest.raises(BngError) as error:connect(monkeypatch,Shell())
    assert (error.value.code,error.value.stage)==('SHELL_TIMEOUT','shell')


def test_closed_channel_and_cancellation(monkeypatch):
    from threading import Event
    shell=Shell(responses={'display version':[]})
    transport,_=connect(monkeypatch,shell)
    shell.eof_received=True
    with pytest.raises(BngError,match='CHANNEL_CLOSED'):transport.execute(request('system'))
    event=Event();event.set()
    with pytest.raises(BngError,match='CANCELLED'):transport.execute(request('health'),cancel=event)


def test_safe_stage_in_public_error_and_session_log(monkeypatch,caplog):
    from apps.access_manager.application.error_policy import public_error
    from apps.access_manager.application.session_manager import SessionManager
    error=BngError('COMMAND_TIMEOUT',stage='read_until_prompt')
    result=public_error(error)
    assert result['stage']=='read_until_prompt' and result['retryable']
    class Provider:
        def connect(self,*a,**kw): raise error
    manager=SessionManager(None,{'huawei_bng':Provider()})
    with pytest.raises(BngError): manager.connect('bng.example.invalid','operator','never-log-this',vendor='huawei_bng')
    assert 'code=COMMAND_TIMEOUT stage=read_until_prompt' in caplog.text
    assert 'never-log-this' not in caplog.text


def test_backspace_edit_preserves_facts():
    from apps.access_manager.infrastructure.huawei_bng.transport import clean_output
    assert clean_output('display version\nVersion 8.25X\x080\n<BNG-REDACTED>\n','display version')=='Version 8.250'


def test_repeated_pager_is_not_resent_without_new_marker(monkeypatch):
    # A page split into small reads must send precisely one continuation.
    shell=Shell(responses={'display version':[[b'one\n---- More ----'],[b'\npart',b'ial',b'\n<BNG-REDACTED>']]})
    transport,_=connect(monkeypatch,shell)
    assert 'partial' in transport.execute(request('system'))
    assert shell.sent.count(' ')==1


def test_command_does_not_accept_unrelated_prompt_in_output(monkeypatch):
    shell=Shell(responses={'display version':[[b'text\n<OTHER>\n',b'actual data\n<BNG-REDACTED>']]})
    transport,_=connect(monkeypatch,shell)
    result=transport.execute(request('system'))
    assert '<OTHER>' in result and 'actual data' in result


def test_optional_facts_timeout_preserves_authenticated_provider():
    class Transport:
        connected=True
        def connect(self,*a,**kw): pass
        def execute(self,item):
            if item.feature=='system':raise BngError('PAGINATION_TIMEOUT',stage='pagination')
            return '2026-10-21 01:00:00'
        def close(self):self.connected=False
    provider=HuaweiNetEngineBngProvider(Transport)
    provider.connect('bng.example.invalid','u','private')
    assert provider.connected
    assert provider.get_operation_log()[-1]['stage']=='pagination'
