"""Bootstrap regressions based on owner-observed login OK / statusMgr 404.

All addresses/client values are synthetic, never physical P1 payloads.
"""
from requests import Response, HTTPError
from apps.access_manager.infrastructure.providers.zte import ZTEProvider
from tests.h3601p_support import Client


def http_error(code=404,kind='menuView',tag='statusMgr'):
    response=Response();response.status_code=code
    response.url=f'http://example.invalid/?_type={kind}&_tag={tag}'
    return HTTPError(response=response)


class Status404(Client):
    authenticated_root_html='<html><div>Authenticated shell</div></html>'
    def device_status(self):
        self.calls.append(('view','statusMgr'))
        raise http_error()


def test_statusmgr_404_without_hint_or_footer_keeps_authenticated_session():
    p=ZTEProvider(Status404)
    result=p.connect('example.invalid','test','not-a-real-password')
    assert p.connected
    assert result['authenticated'] is True
    assert result['model']=='ZTE'
    assert result['profile']=='h3601p_v9'
    assert p.client.logins==1
    assert p.runtime_diagnostic()['bootstrap_probes']['statusMgr_view']['status']=='http_404'

import pytest
from tests.h3601p_support import fixture,xml
from apps.access_manager.infrastructure.zte.discovery.bootstrap import announced_tags
from apps.access_manager.infrastructure.zte.protocol.errors import ZTEAuthenticationError


class DirectIdentity(Status404):
    def __init__(self,*a,**k):
        super().__init__(*a,**k)
        self.responses['devmgr_statusmgr_lua.lua']=xml('OBJ_DEVINFO_ID',[{'ModelName':'ZXHN H3601P','SoftwareVer':'V9.0.0P1_MUL','HardwareVer':'test-hardware'}])


def test_direct_device_info_after_missing_view_selects_actual_identity():
    p=ZTEProvider(DirectIdentity);r=p.connect('example.invalid','u','p')
    assert r['model']=='ZXHN H3601P';assert r['firmware']=='V9.0.0P1_MUL'
    assert r['profile']=='h3601p_v9'
    assert r['identification_source']=='structured_direct'
    assert p.client.calls[:2]==[('view','statusMgr'),('data','devmgr_statusmgr_lua.lua')]
    assert p.get_device_info()['firmware']=='V9.0.0P1_MUL'
    assert p.client.calls.count(('view','statusMgr'))==1
    assert p.client.logins==1


def test_footer_after_both_404_keeps_device_partial_and_discovers_reads():
    class Footer(Status404):
        authenticated_root_html='<footer>ZTE Corporation · ZXHN H3601P V9.0.0P1_MUL</footer>'
    p=ZTEProvider(Footer);r=p.connect('example.invalid','u','p')
    assert r['identification_source']=='HTML_DETECTED'
    assert r['profile']=='h3601p_v9'
    assert p.capabilities.get('device').read.value=='PARTIAL'
    assert p.capabilities.get('clients').read.value=='SUPPORTED'
    before=list(p.client.calls)
    assert p.get_device_info()['device_status_available'] is False
    assert p.client.calls==before


def test_unknown_remains_connected_with_unknown_capabilities_and_no_writers():
    class Unknown(Status404):
        def __init__(self,*a,**k):
            super().__init__(*a,**k);self.responses={}
    p=ZTEProvider(Unknown);r=p.connect('example.invalid','u','p')
    assert p.connected;assert r['mode']=='deployment';assert r['model']=='ZTE'
    assert r['firmware'] is None and r['profile'] is None
    assert p.capabilities.get('device').read.value=='PARTIAL'
    assert p.capabilities.get('clients').read.value=='UNKNOWN'
    assert p.capabilities.get('optical').read.value=='UNKNOWN'
    assert all(not item['enabled']['write'] for item in p.capabilities.public().values())
    before=list(p.client.calls);assert p.get_device_info()['modelo']=='ZTE';assert p.client.calls==before
    assert p.client.logins==1


def test_auth_failure_still_fails_before_any_probe():
    class Rejected(Client):
        instance=None
        def __init__(self,*a,**k):super().__init__(*a,**k);Rejected.instance=self
        def login(self):return False
    p=ZTEProvider(Rejected)
    with pytest.raises(ZTEAuthenticationError):p.connect('example.invalid','u','p')
    assert not p.connected;assert Rejected.instance.calls==[]


@pytest.mark.parametrize('model',['F670L','F6600P','F6201B','H3600P'])
def test_identified_other_zte_keeps_existing_capability_matrix(model):
    class Normal(Client):
        def device_status(self):return {'modelo':model,'firmware':'test-version'}
    p=ZTEProvider(Normal);r=p.connect('example.invalid','u','p')
    assert r['model']==model;assert p.client.calls==[]
    assert p.capabilities.public()==p._build_caps().public()


@pytest.mark.parametrize('wifi,lan',[(fixture('valid_empty'),fixture('valid_empty')),(fixture(),fixture('valid_empty'))])
def test_two_valid_signatures_including_empty_select_strategy_not_model(wifi,lan):
    class Signature(Status404):
        def __init__(self,*a,**k):
            super().__init__(*a,**k);self.responses['accessdev_ssiddev_lua.lua']=wifi;self.responses['accessdev_landevs_lua.lua']=lan
    p=ZTEProvider(Signature);r=p.connect('example.invalid','u','p')
    assert r['model']=='ZTE';assert r['firmware'] is None
    assert r['identification_source']=='endpoint_signature';assert r['mode']=='partial'
    assert p.capabilities.get('clients').read.value=='SUPPORTED'
    assert p.capabilities.get('optical').read.value=='UNKNOWN'
    assert 'IDENTIFIED' not in r['connection_metadata']['connection_states']
    assert p.client.calls[:5]==[('view','statusMgr'),('data','devmgr_statusmgr_lua.lua'),('view','localNetStatus'),('data','accessdev_ssiddev_lua.lua'),('data','accessdev_landevs_lua.lua')]
    assert len([c for c in p.client.calls[2:] if c[0]=='data'])<=8
    before=len(p.client.calls);p.get_clients()
    assert ('data','accessdev_ssiddev_lua.lua') in p.client.calls[before:]
    assert not any(tag=='wlan_client_stat_lua.lua' for _,tag in p.client.calls)


def test_one_valid_empty_signature_keeps_partial_client_reads():
    class One(Status404):
        def __init__(self,*a,**k):
            super().__init__(*a,**k);self.responses['accessdev_ssiddev_lua.lua']=fixture('valid_empty');self.responses['accessdev_landevs_lua.lua']=404
    p=ZTEProvider(One);r=p.connect('example.invalid','u','p')
    assert r['profile']=='h3601p_v9';assert r['model']=='ZTE';assert r['mode']=='partial'
    assert p.capabilities.get('clients').read.value=='PARTIAL'


@pytest.mark.parametrize('bad,status',[(404,'http_404'),(403,'http_403'),(401,'http_401'),('<html>login</html>','login_page_instead_of_data'),('SessionTimeout','session_expired'),(xml('OBJ_OTHER',[]),'wrong_schema'),(xml('OBJ_DEVINFO_ID',[]),'valid_empty')])
def test_direct_probe_failures_are_classified_and_not_retried(bad,status):
    class DirectFailure(Status404):
        def __init__(self,*a,**k):super().__init__(*a,**k);self.responses['devmgr_statusmgr_lua.lua']=bad
    p=ZTEProvider(DirectFailure);p.connect('example.invalid','u','p')
    assert p.runtime_diagnostic()['bootstrap_probes']['device_info_direct']['status']==status
    assert p.client.calls.count(('data','devmgr_statusmgr_lua.lua'))==1
    assert p.client.logins==1


def test_localnet_view_404_can_still_validate_known_menu_data():
    class NoView(Status404):
        def get_view(self,tag,**kwargs):self.calls.append(('view',tag));raise http_error(tag=tag)
    p=ZTEProvider(NoView);r=p.connect('example.invalid','u','p')
    assert r['mode']=='partial'
    assert p.runtime_diagnostic()['bootstrap_probes']['compatibility_scan']['views']['localNetStatus']['status']=='http_404'
    assert p.capabilities.get('clients').read.value=='SUPPORTED'


def test_diagnostics_and_advertised_inventory_do_not_export_payloads_or_probe_actions():
    tags=announced_tags(' '.join(f'?_tag={tag}&x=1' for tag in ['localNetStatus','accessdev_ssiddev_lua.lua','reboot','factory_reset','apply','delete','logout','login','modeswitch','switchlang']))
    assert {r['tag'] for r in tags}=={'localNetStatus','accessdev_ssiddev_lua.lua'}
    assert {r['type'] for r in tags}=={'menuView','menuData'}
    p=ZTEProvider(Status404);p.connect('example.invalid','private-user','private-password')
    report=str(p.runtime_diagnostic())
    for value in ('example.invalid','private-user','private-password','Device-A','192.0.2.10','02:00:00','fe80::1'):
        assert value not in report


def api_server(monkeypatch,client_factory=Status404):
    from vela.core.api_router import ApiRouter
    from vela.core.api_server import ApiServer
    from apps.access_manager.application.session_manager import SessionManager
    from apps.access_manager.application.queries.device import DeviceQueryBus
    from apps.access_manager.application.provider_router import ProviderDecision
    from apps.access_manager.presentation.api import session as session_api,device as device_api
    class Router:
        def decide(self,*a,**k):return ProviderDecision('zte','test')
    p=ZTEProvider(client_factory);sessions=SessionManager(Router(),{'zte':p})
    monkeypatch.setattr(session_api,'sessions',sessions)
    monkeypatch.setattr(device_api,'queries',DeviceQueryBus(sessions))
    router=ApiRouter();router.post('/session')(session_api.connect)
    router.get('/device')(device_api.device);router.get('/device/clients')(device_api.clients)
    router.get('/device/runtime/diagnostic')(device_api.runtime_diagnostic)
    server=ApiServer(router,port=0,docs_enabled=False);server.register_routes()
    return server.app,p


def test_real_vela_http_session_device_clients_and_diagnostic_after_404(monkeypatch):
    from tests.test_vela_http_parity import http
    app,p=api_server(monkeypatch)
    status,result=http(app,'POST','/api/session',{'host':'example.invalid','username':'u','password':'p'})
    assert status.startswith('200');assert result['connected'] is True
    assert result['session']['metadata']['authenticated'] is True
    assert result['session']['metadata']['profile']=='h3601p_v9'
    status,device=http(app,'GET','/api/device');assert status.startswith('200')
    assert device['model']=='ZTE';assert device['firmware'] is None
    assert device['advanced']['device_status_available'] is False
    before=len(p.client.calls)
    status,clients=http(app,'GET','/api/device/clients')
    assert status.startswith('200') and len(clients)==2
    assert ('data','accessdev_ssiddev_lua.lua') in p.client.calls[before:]
    status,report=http(app,'GET','/api/device/runtime/diagnostic')
    assert report['authentication']=='success'
    assert report['bootstrap_probes']['statusMgr_view']['status']=='http_404'
    assert p.client.logins==1


def test_real_vela_http_authentication_error_is_typed_not_internal(monkeypatch):
    from tests.test_vela_http_parity import http
    class Rejected(Client):
        def login(self):return False
    app,p=api_server(monkeypatch,Rejected)
    _,error=http(app,'POST','/api/session',{'host':'example.invalid','password':'private'})
    assert error['success'] is False
    assert error['error']['code']=='AUTH_REJECTED'
    assert error['error']['type']=='authentication'
    assert not p.connected


def test_signature_uses_secondary_wifi_without_reauthentication():
    class PrimaryMissing(Status404):
        def __init__(self,*a,**k):
            super().__init__(*a,**k);self.responses['accessdev_ssiddev_lua.lua']=404
            self.responses['wlan_client_stat_lua.lua']=fixture('public_variant_wlan')
    p=ZTEProvider(PrimaryMissing);r=p.connect('example.invalid','u','p')
    assert r['profile']=='h3601p_v9'
    assert ('data','wlan_client_stat_lua.lua') in p.client.calls
    assert p.runtime_diagnostic()['bootstrap_probes']['compatibility_scan']['best_matching_profile']=='F6640-like'
    assert p.client.logins==1


def test_bootstrap_device_details_with_only_null_fields_is_not_valid_identity():
    class EmptyDetails(Status404):
        def __init__(self,*a,**k):
            super().__init__(*a,**k);self.responses['devmgr_statusmgr_lua.lua']=xml('OBJ_CPUMEMUSAGE_ID',[{'UnrelatedField':'x'}])
    p=ZTEProvider(EmptyDetails);p.connect('example.invalid','u','p')
    assert p.runtime_diagnostic()['bootstrap_probes']['device_info_direct']['status']=='valid_empty'


def test_auth_http_401_is_not_converted_to_authenticated_unknown():
    class Unauthorized(Client):
        def login(self):raise http_error(401,'loginData','login_entry')
    p=ZTEProvider(Unauthorized)
    with pytest.raises(ZTEAuthenticationError):p.connect('example.invalid','u','p')
    assert not p.connected


def test_structure_probe_preserves_unknown_bootstrap_diagnostic():
    from tools.zte_probe_h3601p import collect
    class Unknown(Status404):
        def __init__(self,*a,**k):super().__init__(*a,**k);self.responses={}
    p=ZTEProvider(Unknown);p.connect('example.invalid','u','p')
    report=collect(p);assert report['authentication']=='success'
    assert report['profile'] is None
    assert report['bootstrap_probes']['statusMgr_view']['status']=='http_404'


def test_missing_optional_status_does_not_present_stale_cpu_or_uptime():
    p=ZTEProvider(DirectIdentity);p.connect('example.invalid','u','p')
    p._identity.update(cpu_percent=80,uptime_segundos=100)
    p.client.responses['devmgr_statusmgr_lua.lua']=404
    result=p.get_device_info()
    assert result['modelo']=='ZXHN H3601P'
    assert result['device_status_available'] is False
    assert 'cpu_percent' not in result and 'uptime_segundos' not in result
