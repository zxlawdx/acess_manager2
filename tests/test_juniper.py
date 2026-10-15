"""Synthetic structures based on official CLI field/YANG catalogs, not captures."""
from pathlib import Path
from types import SimpleNamespace
from threading import RLock
import pytest
from apps.access_manager.domain.subscribers import SubscriberQuery
from apps.access_manager.infrastructure.juniper import parsers
from apps.access_manager.infrastructure.juniper.errors import JuniperError
from apps.access_manager.infrastructure.juniper.requests import request,OperationalRequest,validate_request
from apps.access_manager.infrastructure.providers.juniper import JuniperProvider
from apps.access_manager.application.error_policy import public_error
ROOT=Path(__file__).parent/'fixtures/juniper'
def fixture(name):return (ROOT/(name+'.xml')).read_text()

class FakeTransport:
    def __init__(self):self.connected=False;self.kind='netconf';self.calls=[];self.responses={}
    def connect(self,*args,**kwargs):self.connected=True
    def close(self):self.connected=False
    def execute(self,item,**kwargs):
        self.calls.append(item.command)
        if item.feature in self.responses:
            result=self.responses[item.feature]
            if isinstance(result,Exception):raise result
            return result
        if item.feature=='facts':return fixture('facts')
        if item.feature=='uptime':return '<system-uptime-information xmlns:junos="urn:junos"><system-booted-time><time-length junos:seconds="900">15 minutes</time-length></system-booted-time></system-uptime-information>'
        if item.feature=='subscriber_probe':return '<subscribers-information><subscriber-count>2</subscriber-count></subscribers-information>'
        if item.feature=='subscriber_username':return fixture('subscribers') if 'brd_000123' in item.command else fixture('empty')
        if item.feature=='subscriber_detail':
            import xml.etree.ElementTree as ET
            root=parsers.parse(fixture('subscribers'));container=next(root.iter('subscribers-information'))
            for child in list(container):
                if parsers.first(child,'session-id')!=item.command.split()[3]:container.remove(child)
            return ET.tostring(root,encoding='unicode')
        if item.feature in {'pppoe','aaa'}:return fixture(item.feature)
        if item.feature in {'interfaces','interface'}:return '<interface-information><physical-interface><name>xe-0/0/0</name><admin-status>up</admin-status><oper-status>up</oper-status><logical-interface><name>xe-0/0/0.300</name><address-family><interface-address><ifa-local>192.0.2.1/30</ifa-local></interface-address></address-family></logical-interface></physical-interface></interface-information>'
        if item.feature=='chassis':return '<chassis-inventory><chassis><name>Chassis</name><description>MX204</description><serial-number>SYNTHETIC</serial-number></chassis></chassis-inventory>'
        raise AssertionError(item.feature)

def provider():
    p=JuniperProvider(FakeTransport);p.connect('example.invalid','synthetic','not-real');return p

@pytest.mark.parametrize('query,candidates',[
 ('12345',('brd_12345','cdy_12345','364_12345')),('000123',('brd_000123','cdy_000123','364_000123')),
 ('brd_12345',('brd_12345',)),('cdy_12345',('cdy_12345',)),('364_000123',('364_000123',)),
 ('192.0.2.1',('192.0.2.1',)),('2001:db8::1',('2001:db8::1',))])
def test_queries(query,candidates):assert SubscriberQuery.parse(query).candidates==candidates

@pytest.mark.parametrize('query',['brd_','abc_123','123;show configuration','brd_1|show','../','1\nshow version','$(id)','１２３'])
def test_invalid_queries(query):
    with pytest.raises(ValueError):SubscriberQuery.parse(query)

@pytest.mark.parametrize('state',['Active','Init','Configured','Terminating'])
def test_structured_multiple_dual_stack_and_absence(state):
    rows=parsers.subscribers(fixture('subscribers').replace('Active',state))
    assert len(rows)==2 and rows[0]['username']==rows[1]['username']
    a,b=rows;assert a['contract']=='000123' and a['prefix']=='brd' and a['state']==state
    assert a['ipv6_addresses']==['2001:db8::10','fe80::10'] and a['delegated_prefix']=='2001:db8:100::/56'
    assert a['nat_public_ip']=='198.51.100.10' and a['stacked_vlan_id']=='200'
    assert b['mac_address'] is None and b['primary_dns'] is None and b['effective_shaping_rate'] is None
    assert b['ipv6_addresses']==[] and b['ipv6_prefixes']==[]


def test_no_match_and_errors_are_distinct_and_sanitized():
    assert parsers.subscribers(fixture('empty'))==[]
    with pytest.raises(JuniperError) as info:parsers.subscribers(fixture('permission'))
    assert info.value.code=='PERMISSION_DENIED' and 'private' not in str(public_error(info.value))
    for payload in ('<rpc-reply><output>not xml data</output></rpc-reply>','<wrong/>','<!DOCTYPE x [<!ENTITY x "x">]><x>&x;</x>'):
        with pytest.raises(JuniperError):parsers.subscribers(payload)
    with pytest.raises(JuniperError) as info:parsers.parse('<rpc-reply><rpc-error><error-tag>operation-failed</error-tag></rpc-error></rpc-reply>')
    assert info.value.code=='RPC_ERROR'


def test_lookup_is_filtered_keeps_sessions_and_does_not_load_aaa():
    p=provider();assert p.capabilities.get('subscriber_lookup').read.value=='PARTIAL'
    assert p.capabilities.get('subscriber_count').read.value=='SUPPORTED'
    p.transport.calls=[];r=p.lookup_subscribers('000123')
    assert r['complete'] is True and len(r['sessions'])==2
    assert p.transport.calls==[f'show subscribers user-name {prefix}_000123 extensive' for prefix in ('brd','cdy','364')]
    assert r['candidates'][0]['status']=='FOUND' and r['candidates'][1]['status']=='NOT_FOUND'
    assert all(not c['enabled']['write'] for c in p.capabilities.public().values())


def test_partial_timeout_never_becomes_offline():
    p=provider();p.transport.responses['subscriber_username']=JuniperError('CONNECTION_TIMEOUT')
    r=p.lookup_subscribers('123');assert r['complete'] is False and r['status']=='ERROR'
    assert all(c['status']=='TIMEOUT' for c in r['candidates'])
    assert p.connected


def test_no_result_is_not_customer_nonexistence():
    r=provider().lookup_subscribers('999');assert r['status']=='NOT_FOUND' and r['sessions']==[]


def test_ignored_filter_is_an_error_not_other_customer_exposure():
    p=provider();p.transport.responses['subscriber_username']=fixture('subscribers')
    r=p.lookup_subscribers('999');assert r['sessions']==[] and r['complete'] is False


def test_details_and_lazy_aaa_pppoe_require_current_selected_identity():
    p=provider();p.transport.calls=[]
    assert p.get_subscriber('205')['ipv4_address']=='192.0.2.11'
    result=p.subscriber_context({'session_id':'100','username':'brd_000123','kind':'pppoe'})
    assert result['data']['underlying_interface']=='demux0.100'
    assert p.transport.calls[-2:]==['show subscribers id 100 extensive','show pppoe interfaces pp0.3221226000 detail']
    result=p.subscriber_context({'session_id':'100','username':'brd_000123','kind':'aaa'})
    assert result['data']['accounting']=='Started'
    with pytest.raises(JuniperError) as info:p.subscriber_context({'session_id':'100','username':'cdy_000123','kind':'aaa'})
    assert info.value.code=='STALE_SESSION'
    assert not any(command.startswith(('clear ','request ','set ')) for command in p.transport.calls)


def test_facts_interfaces_chassis_and_cleanup():
    p=provider();assert p.model=='mx204' and p.firmware=='24.2R1'
    assert p.get_device_info()['uptime_seconds']==900
    rows=p.get_juniper_interfaces();assert rows[0]['name']=='xe-0/0/0' and rows[1]['name']=='xe-0/0/0.300'
    assert rows[0]['oper_state']=='up' and rows[1]['oper_state'] is None
    assert p.get_juniper_chassis()[0]['serial']=='SYNTHETIC'
    transport=p.transport;p.disconnect();assert not transport.connected and not p.connected
    assert p.capabilities.public()=={} and p.get_device_info()=={}


def test_non_bng_is_still_a_device_and_permission_does_not_become_unsupported():
    class NonBNG(FakeTransport):
        def __init__(self):super().__init__();self.responses['facts']=fixture('facts').replace('mx204','qfx5120');self.responses['subscriber_username']=JuniperError('PERMISSION_DENIED')
    p=JuniperProvider(NonBNG);p.connect('example.invalid','u','p')
    assert p.get_device_info()['family']=='EX/QFX'
    assert p.lookup_subscribers('1')['candidates'][0]['code']=='PERMISSION_DENIED'
    assert p.get_juniper_interfaces()

@pytest.mark.parametrize('kind,value',[('subscriber_detail','1;reboot'),('interface','xe-0/0/0 | show configuration'),('aaa','$(id)'),('pppoe','pp0.1\nclear')])
def test_typed_command_injection_rejection(kind,value):
    with pytest.raises(ValueError):request(kind,value=value)
    with pytest.raises(ValueError):validate_request(OperationalRequest('show version; reboot','facts'))


def test_api_real_vela_lookup_and_stale_device_guard(monkeypatch):
    from tests.test_vela_http_parity import http
    from vela.core.api_router import ApiRouter
    from vela.core.api_server import ApiServer
    from apps.access_manager.application.session_manager import SessionManager
    from apps.access_manager.application.queries.device import DeviceQueryBus
    from apps.access_manager.presentation.api import session as session_api,infrastructure as infra_api
    p=JuniperProvider(FakeTransport)
    class Router:
        def decide(self,*a,**kwargs):pytest.fail('Juniper must not use HTTP fingerprint')
    sessions=SessionManager(Router(),{'juniper':p});queries=DeviceQueryBus(sessions)
    monkeypatch.setattr(session_api,'sessions',sessions);monkeypatch.setattr(infra_api,'queries',queries)
    router=ApiRouter();router.post('/session')(session_api.connect);router.post('/infrastructure/subscribers/lookup')(infra_api.subscriber_lookup)
    server=ApiServer(router,port=0,docs_enabled=False);server.register_routes()
    _,response=http(server.app,'POST','/api/session',{'host':'example.invalid','vendor':'juniper','username':'u','password':'private','transport':'ssh'})
    assert response['connected'] is True and response['session']['vendor']=='juniper'
    assert 'private' not in str(response)
    _,result=http(server.app,'POST','/api/infrastructure/subscribers/lookup',{'query':'000123','app_session_id':sessions.session.session_id})
    assert len(result['sessions'])==2
    _,error=http(server.app,'POST','/api/infrastructure/subscribers/lookup',{'query':'000123','app_session_id':'old'})
    assert error['error']['code']=='STALE_SESSION'


def test_netconf_and_explicit_ssh_fallback_preserve_host_verification(monkeypatch):
    from apps.access_manager.infrastructure.juniper.transport import JuniperTransport
    from ncclient import manager
    import paramiko
    calls=[]
    class Manager:
        timeout=8
        def command(self,command,format):calls.append(('command',command,format));return SimpleNamespace(xml=fixture('facts'))
        def close_session(self):calls.append(('close',))
    def connect(**kwargs):calls.append(('connect',kwargs));return Manager()
    monkeypatch.setattr(manager,'connect',connect)
    t=JuniperTransport();t.connect('example.invalid','u','not-real');assert t.execute(request('facts'))==fixture('facts');t.close()
    assert calls[0][1]['hostkey_verify'] is True and calls[0][1]['allow_agent'] is False
    assert calls[1]==('command','show version','xml') and calls[-1]==('close',)
    class SSH:
        def load_system_host_keys(self):calls.append(('known-hosts',))
        def set_missing_host_key_policy(self,policy):assert isinstance(policy,paramiko.RejectPolicy)
        def connect(self,**kwargs):calls.append(('ssh',kwargs))
        def close(self):pass
    monkeypatch.setattr(paramiko,'SSHClient',SSH)
    def unavailable(**kwargs):raise OSError('connection refused')
    monkeypatch.setattr(manager,'connect',unavailable)
    t=JuniperTransport();t.connect('example.invalid','u','not-real',mode='auto');assert t.kind=='ssh';assert calls[-1][1]['port']==22;t.close()
    def rejected(**kwargs):raise paramiko.AuthenticationException('private credentials')
    monkeypatch.setattr(manager,'connect',rejected)
    before=len(calls)
    with pytest.raises(JuniperError) as info:JuniperTransport().connect('example.invalid','u','not-real',mode='auto')
    assert info.value.code=='AUTHENTICATION_FAILED' and len(calls)==before
    assert 'private' not in str(info.value)


def test_ssh_exec_is_bounded_xml_and_no_local_shell(monkeypatch):
    from apps.access_manager.infrastructure.juniper.transport import JuniperTransport
    class Channel:
        def __init__(self):self.data=fixture('facts').encode();self.closed=False
        def recv_ready(self):return bool(self.data)
        def recv(self,count):value=self.data[:count];self.data=self.data[count:];return value
        def recv_stderr_ready(self):return False
        def exit_status_ready(self):return not self.data
        def recv_exit_status(self):return 0
        def close(self):self.closed=True
    channel=Channel();calls=[]
    class SSH:
        def exec_command(self,command,**kwargs):calls.append(command);return None,SimpleNamespace(channel=channel),None
    t=JuniperTransport();t.client=SSH();t.kind='ssh'
    assert parsers.facts(t.execute(request('facts')))['model']=='mx204'
    assert calls==['show version | display xml | no-more'] and channel.closed
    with pytest.raises(ValueError):t.execute(OperationalRequest('clear network-access aaa subscriber username brd_1','facts'))
    assert len(calls)==1


def test_invalid_target_and_failed_detection_cleanup():
    for value in ('http://example.invalid','host;reboot','bad host','user@host'):
        with pytest.raises(ValueError):JuniperProvider.target(value,None)
    assert JuniperProvider.target('[2001:db8::1]:830',None)==('2001:db8::1',830)
    assert JuniperProvider.target('2001:db8::1',None)==('2001:db8::1',None)
    class WrongDevice(FakeTransport):
        def execute(self,item,**kwargs):return '<rpc-reply><output>not Junos</output></rpc-reply>'
    t=WrongDevice();p=JuniperProvider(lambda:t)
    with pytest.raises(JuniperError):p.connect('example.invalid','u','p')
    assert not p.connected and not t.connected and p.capabilities.public()=={}


def test_bounded_diagnostics_preserve_routing_instance_and_source():
    p=provider();p.transport.responses['ping']='<ping-results><ping-summary><packets-sent>4</packets-sent><packets-received>4</packets-received><packet-loss>0</packet-loss></ping-summary></ping-results>'
    result=p.juniper_diagnostic({'kind':'ping','target':'192.0.2.10','routing_instance':'SUBSCRIBERS'})
    assert result['origin']=='juniper' and result['packets_sent']=='4'
    assert p.transport.calls[-1]=='ping 192.0.2.10 count 4 wait 1 no-resolve routing-instance SUBSCRIBERS'
    assert p.capabilities.get('juniper_ping').read.value=='SUPPORTED'
    assert p.capabilities.get('juniper_traceroute').read.value=='PARTIAL'
    for value in ('RI;reboot','RI|show','$(id)'):
        with pytest.raises(ValueError):request('ping',value={'target':'192.0.2.1','routing_instance':value})
    command=request('traceroute',value={'target':'2001:db8::1'});validate_request(command)
    assert command.command=='traceroute 2001:db8::1 ttl 8 wait 1 no-resolve'
    result=parsers.diagnostic('<traceroute-results><hop><ttl-value>1</ttl-value><probe-result><ip-address>192.0.2.1</ip-address><rtt>1000</rtt></probe-result></hop></traceroute-results>')
    assert result['hops'][0]['addresses']==['192.0.2.1']


def test_evolved_routing_instance_is_not_assumed_equivalent():
    p=provider();p._facts['os']='Junos OS Evolved'
    with pytest.raises(JuniperError) as info:p.juniper_diagnostic({'kind':'ping','target':'192.0.2.1','routing_instance':'SUBSCRIBERS'})
    assert info.value.code=='UNSUPPORTED_PLATFORM'


def test_resources_missing_numbers_stay_missing():
    result=parsers.resources('<route-engine-information><route-engine><slot>0</slot><cpu-idle>85</cpu-idle></route-engine></route-engine-information>')
    assert result[0]['cpu_idle_percent']=='85' and result[0]['memory_used_percent'] is None


def test_actual_ncclient_junos_reply_wrapper(monkeypatch):
    from ncclient.xml_ import NCElement
    from ncclient.operations.rpc import RPCReply
    from ncclient.devices.junos import JunosDeviceHandler
    from apps.access_manager.infrastructure.juniper.transport import JuniperTransport
    reply=NCElement(RPCReply(fixture('facts')),JunosDeviceHandler({}).transform_reply())
    assert not hasattr(reply,'xml') and hasattr(reply,'data_xml')
    t=JuniperTransport();t.kind='netconf';t.client=SimpleNamespace(command=lambda *a,**kwargs:reply)
    assert parsers.facts(t.execute(request('facts')))['model']=='mx204'
