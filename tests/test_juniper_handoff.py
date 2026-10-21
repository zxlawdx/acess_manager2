"""Contract tests: independent session ownership and no credential persistence."""
from types import SimpleNamespace
from threading import RLock
import json
import pytest
from apps.access_manager.application.infrastructure_sessions import InfrastructureSessions
from apps.access_manager.infrastructure.juniper.errors import JuniperError
from apps.access_manager.infrastructure.juniper import parsers
from apps.access_manager.infrastructure.juniper.output import JunosCommandResult
from apps.access_manager.infrastructure.juniper.settings import JuniperSettings
from apps.access_manager.infrastructure.juniper.trust import HostTrust
from apps.access_manager.domain.infrastructure_errors import InfrastructureSessionError


class Manager:
    def __init__(self):
        self.online=False;self.closed=0;self.operation_lock=RLock();self.calls=[]
        self.session=SimpleNamespace(session_id='infra-1')
        self.row={'session_id':'123','username':'brd_0001','ipv4_address':'192.0.2.10','contract':'0001'}
        self.provider=SimpleNamespace(get_subscriber=lambda identity:dict(self.row))
    def connect(self,*args,**kwargs):self.calls.append((args,kwargs));self.online=True;return self.status()
    def disconnect(self):self.closed+=1;self.online=False
    def status(self):return {'connected':self.online,'session':{'session_id':'infra-1'} if self.online else None}


def setup():
    device,infra=Manager(),Manager();sessions=InfrastructureSessions(device,infra)
    sessions.connect('example.invalid','ad-user','ad-password',vendor='juniper')
    return sessions,device,infra


def config():return {'app_session_id':'infra-1','session_id':'123','username':'brd_0001','ipv4_address':'192.0.2.10'}


def login(draft,**changes):
    return {**draft,'source_host':draft['host'],'username':'cpe-user','password':'cpe-password',**changes}


def test_independent_sessions_return_and_disconnect():
    sessions,device,infra=setup();draft=sessions.draft(config())
    assert not {'password','username'} & draft.keys()
    result=sessions.connect_cpe(login(draft))
    assert result['infrastructure']['connected'] and result['device']['connected']
    assert infra.closed==0 and device.calls[-1][0][1:]==('cpe-user','cpe-password')
    sessions.select('infrastructure');sessions.disconnect()
    assert not infra.online and device.online and sessions.active is device
    assert sessions.context is None


def test_device_disconnect_preserves_infrastructure():
    sessions,device,infra=setup();sessions.connect_cpe(login(sessions.draft(config())))
    sessions.disconnect()
    assert infra.online and not device.online and sessions.active is infra


@pytest.mark.parametrize('change',[{'username':'brd_2'},{'ipv4_address':'192.0.2.20'},{'session_id':'124'}])
def test_stale_identity_never_reaches_cpe(change):
    sessions,device,infra=setup();draft=sessions.draft(config());infra.row.update(change)
    # Real provider rejects a changed ID. Coordinator also independently checks it.
    with pytest.raises(InfrastructureSessionError):sessions.connect_cpe(login(draft))
    assert not device.calls and infra.online


@pytest.mark.parametrize('port',[0,65536,True,'1;show',''])
def test_bad_port(port):
    sessions,device,infra=setup()
    with pytest.raises(ValueError):sessions.connect_cpe(login(sessions.draft(config()),port=port))
    assert not device.calls


def test_https_vendor_and_edited_address_are_explicit():
    sessions,device,infra=setup();sessions.connect_cpe(login(sessions.draft(config()),port=443,protocol='https',vendor='zte',host='192.0.2.20',edit_host=True))
    args,options=device.calls[-1]
    assert args[0]=='192.0.2.20:443' and options['https'] and options['vendor']=='zte'


def test_cpe_auth_failure_does_not_close_infrastructure():
    sessions,device,infra=setup()
    def fail(*args,**kwargs):raise PermissionError('rejected')
    device.connect=fail
    with pytest.raises(PermissionError):sessions.connect_cpe(login(sessions.draft(config())))
    assert infra.online and sessions.active is infra


def test_settings_are_nonsecret_and_success_only(tmp_path):
    settings=JuniperSettings(tmp_path/'connection.json')
    settings.save({'default_host':'example.invalid','ssh_port':50022,'password':'secret','username':'ad'})
    assert settings.read()['last_successful_host']==''
    settings.save({},successful_host='success.invalid')
    settings.save({'ssh_port':22,'token':'secret'})
    assert settings.read()['last_successful_host']=='success.invalid'
    assert not any(word in settings.path.read_text() for word in ('secret','password','username','token'))


def test_physical_described_shapes_are_aggregated_without_id_collision():
    # Constructed from supplied field/style descriptions, NOT a captured XML fixture.
    xml='''<subscribers-information xmlns:j="urn:junos:test">
    <subscriber j:style="detail"><user-name>brd_0001</user-name><session-id>123</session-id><access-type>PPPoE</access-type><interface>pp0.1</interface></subscriber>
    <subscriber j:style="extensive"><ip-address>192.0.2.10</ip-address><profile>dynamic</profile><profile-version>1</profile-version></subscriber>
    <subscriber j:style="service-session"><session-id>456</session-id><service-name>shaping</service-name><bandwith_in>200M</bandwith_in></subscriber>
    <subscriber><user-name>brd_0001</user-name><session-id>789</session-id><access-type>DHCP</access-type><underlying-session-id>123</underlying-session-id></subscriber>
    </subscribers-information>'''
    rows=parsers.subscribers(xml)
    assert len(rows)==1
    row=rows[0]
    assert row['session_id']=='123' and row['username']=='brd_0001' and row['ipv4_address']=='192.0.2.10'
    assert row['service_sessions'][0]['id']=='456' and row['service_sessions'][0]['bandwidth_in']=='200M'
    assert row['children'][0]['session_id']=='789'


def test_count_zero_and_daemon_not_found():
    assert parsers.subscribers('<subscribers-information><subscriber style="count"><number-of-subscribers>0</number-of-subscribers></subscriber></subscribers-information>')==[]
    assert parsers.subscribers('<rpc-reply xmlns:xnm="urn:xnm"><xnm:error><source-daemon>authd</source-daemon><message>No such subscriber</message></xnm:error></rpc-reply>')==[]


def test_terminal_normalization_and_text_fallback():
    text='\x1b[32mUser Name: brd_0001\x1b[0m\r\nSession ID: 123\r\nType: PPPoE\r\nIP Address: 192.0.2.10\r\nuser@bng> '
    rows=parsers.subscribers(JunosCommandResult('ssh',text))
    assert rows[0]['username']=='brd_0001' and rows[0]['session_id']=='123'
    assert 'brd_0001' not in repr(JunosCommandResult('ssh',text))
    with pytest.raises(JuniperError):parsers.subscribers(JunosCommandResult('netconf',text))
    with pytest.raises(JuniperError) as error:parsers.subscribers(text+'\n---(more 20%)---')
    assert error.value.code=='PAGINATED_INCOMPLETE'
    with pytest.raises(JuniperError):parsers.subscribers('<subscribers-information>broken')


def test_trust_requires_explicit_confirmation_and_endpoint_identity(tmp_path,monkeypatch):
    import paramiko
    trust=HostTrust(tmp_path/'known_hosts');key=paramiko.RSAKey.generate(1024)
    info={'host':'example.invalid','port':50022,'fingerprint':trust.fingerprint(key),'previous_fingerprints':[],'status':'HOST_KEY_UNKNOWN'}
    monkeypatch.setattr(trust,'probe',lambda *args:(info,key))
    with pytest.raises(ValueError):trust.accept(info)
    assert not trust.path.exists()
    trust.accept({**info,'confirm':True})
    assert trust.trusted('example.invalid',50022)==[key]
    assert trust.trusted('other.invalid',50022)==[] and trust.trusted('example.invalid',22)==[]
    with pytest.raises(JuniperError):trust.accept({**info,'fingerprint':'different','confirm':True})


def test_read_intents_use_native_rpcs_with_distinct_identifiers():
    import xml.etree.ElementTree as ET
    from apps.access_manager.infrastructure.juniper.requests import request,native_rpc
    assert ET.fromstring(native_rpc(request('aaa',value='123'))).tag=='get-aaa-subscriber-by-session-id'
    assert ET.fromstring(native_rpc(request('pppoe',value='pp0.456'))).findtext('interface-name')=='pp0.456'
    for feature,value in [('accounting','123'),('route','192.0.2.10'),('fib','192.0.2.10'),('lockout','demux0.1'),('filter','dynamic_filter-pp0.1-in')]:
        assert native_rpc(request(feature,value=value))
    with pytest.raises(ValueError):request('filter',value='filter|show configuration')


def test_accounting_family_counters_are_cumulative_not_bitrate():
    result=parsers.accounting('<subscribers-information><subscriber><family>inet</family><input-bytes>1000</input-bytes><output-bytes>2000</output-bytes></subscriber><subscriber><family>inet6</family><input-bytes>3000</input-bytes></subscriber></subscribers-information>')
    assert len(result['samples'])==2 and result['samples'][1]['family']=='inet6'
    assert result['samples'][0]['cumulative'] and result['bitrate_mbps'] is None


def test_lockout_correlates_mac_not_segment_total():
    xml='<pppoe-lockout-information><total-clients-in-lockout>4</total-clients-in-lockout><client><client-id>aa:bb:cc:dd:ee:ff</client-id><elapsed-time>30</elapsed-time></client></pppoe-lockout-information>'
    assert parsers.lockout(xml,'11:22:33:44:55:66')['subscriber_match'] is False
    assert parsers.lockout(xml,'AA-BB-CC-DD-EE-FF')['subscriber_match'] is True
    assert parsers.lockout(xml)['subscriber_match'] is None


def test_fib_internal_interface_is_not_an_automatic_health_failure():
    data=parsers.fib('<forwarding-table-information><route-table-entry><rt-destination>192.0.2.10</rt-destination><netif>demux0.999</netif></route-table-entry></forwarding-table-information>')
    assert data['entries'][0]['interfaces']==['demux0.999']
    assert not data['underlying_interface_equality_required']


def test_filter_counter_has_no_invented_drop_semantics():
    data=parsers.firewall_filter('<firewall-information><filter-information><policer><policer-name>p1</policer-name><packet-count>100</packet-count><byte-count>1000</byte-count></policer></filter-information></firewall-information>')
    assert data['counters'][0]['packets']=='100' and 'drops' not in data['counters'][0]


def test_infrastructure_bus_stays_on_juniper_when_cpe_is_selected():
    from apps.access_manager.application.queries.device import DeviceQueryBus
    from apps.access_manager.domain.capabilities import Capability,CapabilitySet,SupportStatus as S
    sessions,device,infra=setup()
    infra.provider.vendor='juniper'
    infra.provider.capabilities=CapabilitySet([Capability('subscriber_detail',S.SUPPORTED)])
    sessions.connect_cpe(login(sessions.draft(config())))
    result=DeviceQueryBus(sessions).infrastructure('subscriber_detail','get_subscriber',{'session_id':'123','app_session_id':'infra-1'})
    assert result['username']=='brd_0001' and sessions.active is device


def test_radius_never_exports_shared_secret():
    xml='<radius-servers-information><radius-server><profile-name>access</profile-name><server-address>192.0.2.1</server-address><status>UP</status><authentication-port>1812</authentication-port><shared-secret>private</shared-secret></radius-server></radius-servers-information>'
    rows=parsers.radius(xml)
    assert rows[0]['status']=='UP' and rows[0]['authentication_port']=='1812'
    assert 'private' not in json.dumps(rows) and 'secret' not in json.dumps(rows)


def test_historical_aaa_rejects_do_not_invent_current_incident():
    result=parsers.aaa_statistics('<aaa-module-statistics><requests>90000000</requests><rejects>8000000</rejects><timeouts>10000</timeouts></aaa-module-statistics>')
    assert result['cumulative'] and result['current_incident'] is None
    assert result['counters']['rejects']=='8000000'


def test_lacp_preserves_returned_member_state():
    rows=parsers.lacp('<lacp-interface-information><lag-lacp-protocol><name>et-0/0/0</name><lacp-mux-state>Collecting distributing</lacp-mux-state><lacp-synchronization>Yes</lacp-synchronization></lag-lacp-protocol></lacp-interface-information>')
    assert rows[0]['interface']=='et-0/0/0' and rows[0]['synchronization']=='Yes'


def test_multilane_optics_keeps_module_separate_from_lanes():
    lanes=''.join(f'<optics-diagnostics-lane-values><lane-index>{n}</lane-index><laser-output-power>{n+1} mW</laser-output-power><laser-rx-optical-power>{n+2} mW</laser-rx-optical-power></optics-diagnostics-lane-values>' for n in range(4))
    rows=parsers.optics('<interface-information><physical-interface><name>et-0/0/0</name><optics-diagnostics><module-temperature>35 C</module-temperature><module-temperature-high-alarm>off</module-temperature-high-alarm>'+lanes+'</optics-diagnostics></physical-interface></interface-information>')
    assert len(rows[0]['lanes'])==4 and rows[0]['lanes'][3]['tx_power']=='4 mW'
    assert rows[0]['temperature']=='35 C' and 'tx_power' not in rows[0]
    assert rows[0]['module_alarm_warning_thresholds']['module-temperature-high-alarm']=='off'


def test_chassis_fpc_and_environment_missing_values_stay_absent():
    assert parsers.fpc('<fpc-information><fpc><slot>0</slot><state>Online</state></fpc></fpc-information>')[0]['cpu_utilization'] is None
    assert parsers.environment('<environment-information><environment-item><name>Fan</name><status>OK</status></environment-item></environment-information>')[0]['temperature'] is None


def test_health_intents_are_explicit_and_closed():
    from tests.test_juniper import provider
    p=provider();before=len(p.transport.calls)
    p.transport.responses['radius']='<radius-servers-table><radius-server><server-address>192.0.2.1</server-address><status>UP</status></radius-server></radius-servers-table>'
    result=p.get_juniper_health({'kind':'radius'})
    assert result['data'][0]['status']=='UP' and len(p.transport.calls)==before+1
    with pytest.raises(ValueError):p.get_juniper_health({'kind':'show configuration'})


def test_junos_prompt_and_release_framing_do_not_corrupt_xml():
    xml='<subscribers-information><subscriber><user-name>brd_1</user-name><session-id>1</session-id></subscriber></subscribers-information>'
    result=parsers.subscribers(JunosCommandResult('ssh','Last login: yesterday\n--- JUNOS 23.4R2-S5.6\n'+xml+'\n{master:0}\nu@bng>'))
    assert result[0]['session_id']=='1'
    with pytest.raises(JuniperError):parsers.subscribers(JunosCommandResult('ssh','unrecognized preamble\n'+xml))


def test_port_reachability_is_workstation_tcp_and_not_subscriber_offline(monkeypatch):
    import socket
    sessions,device,infra=setup();draft=sessions.draft(config())
    calls=[]
    monkeypatch.setattr(socket,'create_connection',lambda address,timeout:(calls.append((address,timeout)) or SimpleNamespace(close=lambda:None)))
    result=sessions.probe_cpe(login(draft,port=443))
    assert result['status']=='CPE_PORT_REACHABLE' and calls==[(('192.0.2.10',443),3)]
    def refused(*args,**kwargs):raise ConnectionRefusedError()
    monkeypatch.setattr(socket,'create_connection',refused)
    result=sessions.probe_cpe(login(draft))
    assert result['status']=='CPE_PORT_UNREACHABLE' and result['subscriber_offline'] is None and infra.online
    assert not device.calls
