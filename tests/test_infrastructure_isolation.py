"""Vendor boundaries through real providers and the real Vela HTTP adapter."""
import ast
from pathlib import Path
from types import SimpleNamespace
from threading import RLock
import pytest
import paramiko
from apps.access_manager.infrastructure.common.endpoint import normalize_ssh_target
from apps.access_manager.domain.infrastructure_errors import InfrastructureSessionError,SshTrustError
from apps.access_manager.infrastructure.common.ssh_trust import HostTrust,EndpointTrustPolicy
from apps.access_manager.infrastructure.huawei_bng.provider import HuaweiNetEngineBngProvider
from apps.access_manager.infrastructure.providers.juniper import JuniperProvider
from apps.access_manager.application.session_manager import SessionManager
from apps.access_manager.application.queries.device import DeviceQueryBus
from tests.test_huawei_bng import SYNTHETIC
from tests.test_juniper import FakeTransport


class VrpFixtureTransport:
    connected=False
    def __init__(self): self.commands=[]
    def connect(self,*args,**kwargs): self.connected=True
    def close(self): self.connected=False
    def execute(self,item):
        self.commands.append(item.command)
        assert item.command.startswith('display ')
        if item.feature=='health':return '2026-10-21 01:00:00'
        if item.feature=='system':return 'Huawei NetEngine 8000 M8 V800R025C00SPC500'
        return SYNTHETIC


@pytest.mark.parametrize('vendor',['huawei_bng','juniper'])
def test_real_api_dispatch_is_vendor_exclusive(monkeypatch,vendor):
    from tests.test_vela_http_parity import http
    from vela.core.api_router import ApiRouter
    from vela.core.api_server import ApiServer
    from apps.access_manager.presentation.api import infrastructure as api,session as session_api
    provider=HuaweiNetEngineBngProvider(VrpFixtureTransport) if vendor=='huawei_bng' else JuniperProvider(FakeTransport)
    sessions=SessionManager(None,{vendor:provider})
    sessions.connect('example.invalid','operator','not-a-secret',vendor=vendor,transport='ssh')
    bus=DeviceQueryBus(sessions)
    monkeypatch.setattr(api,'queries',bus)
    monkeypatch.setattr(HostTrust,'inspect',lambda self,host,port:{'host':host,'port':port,'status':'HOST_KEY_UNKNOWN'})
    router=ApiRouter()
    for route,fn in [('system',api.infrastructure_system),('subscribers/lookup',api.subscriber_lookup),('subscribers/detail',api.subscriber_detail),('diagnostics',api.infrastructure_diagnostics),('chassis',api.infrastructure_chassis),('resources',api.infrastructure_resources),('subscribers/context',api.subscriber_context),('host-key',session_api.inspect_host_key)]:router.post('/infrastructure/'+route)(fn)
    server=ApiServer(router,port=0,docs_enabled=False);server.register_routes()
    def post(route,data=None):return http(server.app,'POST','/api/infrastructure/'+route,{'app_session_id':sessions.session.session_id,**(data or {})})[1]
    assert post('system')['model']
    query='brd_00042' if vendor=='huawei_bng' else '000123'
    assert post('subscribers/lookup',{'query':query})['sessions']
    identity='42' if vendor=='huawei_bng' else '100'
    assert post('subscribers/detail',{'session_id':identity})['session_id']==identity
    for path in ['diagnostics','chassis','resources','subscribers/context']:
        result=post(path,{'kind':'ping','target':'192.0.2.1','session_id':identity})
        if vendor=='huawei_bng':assert result['error']['code']=='PHYSICAL_VALIDATION_PENDING'
    assert post('host-key',{'host':'example.invalid','port':22})['status']=='HOST_KEY_UNKNOWN'
    stale=post('system',{'app_session_id':'previous-session'})
    assert stale['error']['code']=='STALE_SESSION' and 'Juniper' not in stale['error']['message']
    commands=provider.transport.commands if vendor=='huawei_bng' else provider.transport.calls
    assert commands
    if vendor=='huawei_bng':assert all(command.startswith('display ') for command in commands)
    else:assert all(not command.startswith('display ') for command in commands)


def test_huawei_dispatch_never_requests_junos_attribute():
    class Spy(HuaweiNetEngineBngProvider):
        def __getattr__(self,name):
            if 'juniper' in name:pytest.fail('Cross-provider method lookup: '+name)
            raise AttributeError(name)
    provider=Spy(VrpFixtureTransport);provider.connect('example.invalid','u','p')
    manager=SimpleNamespace(provider=provider,session=SimpleNamespace(session_id='one'),operation_lock=RLock())
    bus=DeviceQueryBus(manager)
    for method in ['get_interfaces','get_interface','get_health','diagnostic','get_link','get_chassis','get_resources','subscriber_context']:
        with pytest.raises(Exception) as error:bus.infrastructure('neutral',method,{})
        assert error.value.code=='PHYSICAL_VALIDATION_PENDING'
    with pytest.raises(InfrastructureSessionError):bus.infrastructure('device','get_system',{'app_session_id':'old'})


def test_huawei_import_graph_has_no_juniper_dependency():
    root=Path(__file__).parents[1]/'apps/access_manager/infrastructure/huawei_bng'
    for path in root.glob('*.py'):
        tree=ast.parse(path.read_text())
        for node in ast.walk(tree):
            if isinstance(node,ast.ImportFrom):assert 'juniper' not in (node.module or '')
            if isinstance(node,ast.Import):assert all('juniper' not in item.name for item in node.names)
    source=(root.parents[1]/'application/services/infrastructure_reads.py').read_text()
    assert 'get_juniper' not in source


@pytest.mark.parametrize('host,port,expected',[('example.invalid',22,('example.invalid',22)),('[2001:db8::1]:2222',None,('2001:db8::1',2222)),('2001:db8::1',None,('2001:db8::1',None))])
def test_shared_endpoint(host,port,expected):
    assert normalize_ssh_target(host,port)==expected
    assert JuniperProvider.target(host,port)==expected


def test_shared_trust_preserves_legacy_pins(monkeypatch,tmp_path):
    from apps.access_manager.infrastructure.common import ssh_trust
    monkeypatch.setattr(ssh_trust,'data_dir',lambda:tmp_path)
    key=paramiko.RSAKey.generate(1024)
    keys=paramiko.HostKeys();keys.add('[example.invalid]:22',key.get_name(),key)
    keys.save(str(tmp_path/'juniper-known-hosts'))
    trust=HostTrust()
    assert trust.trusted('example.invalid',22)==[key]
    EndpointTrustPolicy(trust,'example.invalid',22).missing_host_key(None,'example.invalid',key)
    with pytest.raises(SshTrustError) as error:EndpointTrustPolicy(trust,'unknown.invalid',22).missing_host_key(None,'unknown.invalid',key)
    assert error.value.code=='HOST_KEY_UNKNOWN'


def test_preferences_separate_vendors(tmp_path):
    from apps.access_manager.infrastructure.common.settings import ConnectionPreferences
    juniper=ConnectionPreferences(tmp_path/'j.json',vendor='juniper')
    huawei=ConnectionPreferences(tmp_path/'h.json',vendor='huawei_bng')
    juniper.save({'preferred_transport':'netconf','netconf_port':830,'ssh_port':2222})
    assert huawei.read()['ssh_port']==22
    assert huawei.read()['preferred_transport']=='ssh' and 'netconf_port' not in huawei.read()
    with pytest.raises(ValueError):huawei.save({'preferred_transport':'netconf'})
    huawei.save({'default_host':'huawei.example.invalid','ssh_port':2200,'password':'not-persisted'})
    assert 'not-persisted' not in huawei.path.read_text()
    assert juniper.read()['preferred_transport']=='netconf'
