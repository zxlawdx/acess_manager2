import pytest
from apps.access_manager.infrastructure.providers.zte import ZTEProvider

class Client:
    def __init__(self): self.calls=[]
    def nslookup(self, hostname):
        self.calls.append(hostname)
        return {'success':True,'addresses':'1.2.3.4','request':{'_sessionTOKEN':'secret'}}
    def native_speedtest_servers(self):
        self.calls.append('discover')
        return {'session_id':'internal','servers':[{'name':'Server','url':'https://test.example/'}]}

def provider(model='F670L'):
    p=ZTEProvider();p.client=Client();p.model=model;p._caps=p._build_caps();return p

def test_lookup_wired_without_physical_gate_and_filters_internal_payload():
    p=provider()
    assert p.capabilities.get('dns_lookup').public()['enabled']['write']
    result=p.dns_lookup({'hostname':'example.com'})
    assert result['addresses']=='1.2.3.4'
    assert 'request' not in result
    assert p.client.calls==['example.com']

@pytest.mark.parametrize('name',['','-bad.example','http://example.com','name;reboot','a..b','a'*64+'.example'])
def test_bad_hostname_never_reaches_transport(name):
    p=provider()
    with pytest.raises(ValueError): p.dns_lookup({'hostname':name})
    assert p.client.calls==[]

def test_unknown_family_does_not_invent_native_diagnostic_support():
    p=provider('F6201B')
    assert p.capabilities.get('dns_lookup').write.value=='UNKNOWN'
    with pytest.raises(Exception): p.dns_lookup({'hostname':'example.com'})
    assert p.client.calls==[]

def test_server_discovery_does_not_leak_transient_session():
    p=provider();result=p.discover_speedtest()
    assert list(result)==['servers']
    assert p.client.calls==['discover']
