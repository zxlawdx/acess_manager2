from apps.access_manager.application.session_manager import SessionManager
from apps.access_manager.application.provider_router import ProviderDecision
from apps.access_manager.domain.capabilities import Capability, CapabilitySet, SupportStatus

class Router:
    def decide(self,*a,**k): return ProviderDecision('zte','test')
class P:
    vendor='zte'; connected=False
    def __init__(self,mode): self.mode=mode; self._caps=CapabilitySet([Capability('device',read=SupportStatus.SUPPORTED)])
    @property
    def capabilities(self): return self._caps
    def connect(self,*a,**k): self.connected=True; return {'model':'NEW-ZTE','mode':self.mode}
    def disconnect(self): self.connected=False

def test_unknown_authenticated_runtime_can_enter_deployment_workspace():
    p=P('deployment'); s=SessionManager(Router(),{'zte':p})
    result=s.connect('x','u','p')
    assert result['session']['mode']=='deployment'

def test_session_normalizes_explicit_https_url_and_preserves_port():
    p=P('supported'); s=SessionManager(Router(),{'zte':p})
    calls=[]
    original=p.connect
    def capture(host,*args,**kwargs):
        calls.append((host,kwargs.get('https')))
        return original(host,*args,**kwargs)
    p.connect=capture
    s.connect('https://192.168.1.1:80','u','p')
    assert calls == [('192.168.1.1:80', True)]


def test_session_https_flag_is_forwarded_for_plain_host():
    p=P('supported'); s=SessionManager(Router(),{'zte':p})
    calls=[]
    original=p.connect
    def capture(host,*args,**kwargs):
        calls.append((host,kwargs.get('https')))
        return original(host,*args,**kwargs)
    p.connect=capture
    s.connect('192.168.1.1','u','p',https=True)
    assert calls == [('192.168.1.1', True)]
