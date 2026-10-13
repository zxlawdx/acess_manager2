from pathlib import Path
from apps.access_manager.infrastructure.huawei.telemetry import counter_records, association_records, HuaweiTelemetryReader
from apps.access_manager.infrastructure.huawei.captured import HuaweiCapturedFeatureService, WLAN_LIST_PAGE, WLAN_ASSOC_PAGE, DNS_PAGE
from apps.access_manager.domain.presentation import dhcp_view, wan_view
from apps.access_manager.infrastructure.history import HistoryRepository
from apps.access_manager.infrastructure.radio_options import radio_options

FIX=Path(__file__).parent/'fixtures/huawei/ontwatch'


def test_observed_schemas_normalize_wlan_and_wan_byte_direction():
    rows=counter_records((FIX/'telemetry.asp').read_text())
    assert rows[0]['source']=='wifi' and rows[0]['counters']['rx_bytes']==250000
    assert rows[0]['counters']['tx_packets']==1000
    assert rows[1]['source']=='wan' and rows[1]['counters']['rx_bytes']==16000
    assert rows[1]['counters']['tx_bytes']==8000
    assert rows[1]['counters']['rx_discard']==2


def test_unknown_constructor_or_invalid_domain_does_not_invent_counters():
    assert counter_records("new SomeOtherSchema('IGD.1',1,2,3,4);")==[]
    assert counter_records("new stPacketInfo('OtherDomain',1,2,3,4);")==[]
    assert counter_records("new stPacketInfo('InternetGatewayDevice.LANDevice.1.WLANConfiguration.5',-1,2,3,4);")==[]


def test_definition_free_huawei_association_preserves_fields_and_ssid():
    source=(FIX/'associated.asp').read_text()
    class Client:
        def get_page(self,path):
            if path==WLAN_LIST_PAGE:return source
            if path==WLAN_ASSOC_PAGE:return source
            raise RuntimeError('not available')
        def post_read(self,*args,**kw):raise RuntimeError('not available via POST')
    service=HuaweiCapturedFeatureService(Client(),model='EG8041X6-10')
    service._lan_client_records=lambda:[]
    rows=service.wifi_clients()
    assert len(rows)==1
    assert rows[0]['hostname']=='phone-law'
    assert rows[0]['ssid']=='LAW_5G' and rows[0]['band']=='5GHz'
    assert str(rows[0]['rssi'])=='-57' and str(rows[0]['snr'])=='35'
    assert str(rows[0]['rx_rate'])=='866'
    assert rows[0]['status']=='Associated'


def test_named_constructor_is_not_replaced_by_positional_schema():
    source="function stAssociatedDevice(a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p){this.Domain=a;this.MACAddress=b;this.SignalStrength=f;} "+(FIX/'associated.asp').read_text()
    assert association_records(source)==[]


def test_dns_templates_are_not_configuration():
    source='''function DNS(d,n,s,i){this.Domain=d;this.DomainName=n;this.DNSServer=s;this.Interface=i;}
    new DNS(CurrentDomain,getValue("DSLDomainName"),getValue("DNSServer"),getValue("WanNameList"));
    new DNS('InternetGatewayDevice.X_HW_DNS.SearList.1','','1.1.1.1','wan1');'''
    service=HuaweiCapturedFeatureService(object(),model='EG8041X6-10')
    from apps.access_manager.infrastructure.huawei.captured import parse_huawei_js_records
    service._records=lambda *pages:(source,parse_huawei_js_records(source))
    data=service.dns_status()
    assert data['ipv4_1']=='1.1.1.1' and len(data['_search_rows'])==1
    assert 'getValue' not in str(data)


def test_viewmodels_keep_unknown_separate_and_hide_protocol_paths():
    d=dhcp_view({'basic':{'ServerEnable':'0','IPAddr':'192.168.1.1','MinAddress':'192.168.1.10','MaxAddress':'192.168.1.99','DNSServer1':'getValue("DNS")'}})
    assert d['enabled'] is False and d['dns1'] is None
    assert d['lan_ip']=='192.168.1.1' and d['pool_end']=='192.168.1.99'
    w=wan_view({'id':'InternetGatewayDevice.WANDevice.1','nome':'Internet','nat':'0'})
    assert w['nat'] is False and 'id' not in w and w['advanced']['id']


def test_traffic_persistence_survives_reopen_and_is_session_scoped(tmp_path):
    path=tmp_path/'history.sqlite3'
    repo=HistoryRepository(path)
    source={'source':'wan','identity':'1','counters':{'rx_bytes':100},'rx_mbps':None}
    repo.save_traffic('a',[source],1000000)
    repo.save_traffic('b',[source],1000001)
    reopened=HistoryRepository(path)
    assert len(reopened.traffic_history('a',0))==1
    assert reopened.traffic_history('a',0)[0]['timestamp']==1000000
    assert reopened.traffic_history('unknown',0)==[]
    repo.save_traffic('a',[source],1000000+8*86400)
    assert len(repo.traffic_history('a',0))==1


def test_options_are_only_values_observed_in_device_html():
    opts=radio_options('<select id="Channel"><option value="36">36</option><option value="40">40</option></select><select id="TransmitPower"><option value="100">100%</option></select>')
    assert [r['value'] for r in opts['channel']]==['36','40']
    assert opts['tx_power'][0]=={'value':'100','label':'100%'}
    assert 'bandwidth' not in opts and radio_options('')=={}


def test_device_view_keeps_zero_cpu_and_does_not_average_partial_cores():
    from apps.access_manager.domain.presentation import device_view
    assert device_view({'cpu_percent':0})['cpu_percent']==0
    assert device_view({'cpu':{'cpu1':'20','cpu2':None}})['cpu_percent'] is None


def test_huawei_reservation_adapter_preserves_capture_signature_and_blocks_x6():
    from apps.access_manager.infrastructure.providers.huawei import HuaweiProvider
    from apps.access_manager.infrastructure.huawei.profiles import HuaweiEG8041X7Profile
    from apps.access_manager.domain.capabilities import CapabilityUnavailable
    import pytest
    p=HuaweiProvider();p.model='EG8041X7-10';p.profile=HuaweiEG8041X7Profile();p._caps=p._build_caps()
    calls=[]
    class Captured:
        def create_dhcp_reservation(self,**kw):calls.append(('create',kw));return {'verified':True}
        def update_dhcp_reservation(self,identifier,**kw):calls.append(('update',identifier,kw));return {'verified':True}
        def delete_dhcp_reservation(self,identifier):calls.append(('delete',identifier));return {'verified':True}
    p.captured=Captured()
    assert p.save_dhcp_reservation({'ip':'192.168.1.2','mac':'AA:BB:CC:DD:EE:FF'})['verified']
    p.save_dhcp_reservation({'id':'1','ip':'192.168.1.3','mac':'AA:BB:CC:DD:EE:FF'})
    p.delete_dhcp_reservation('1')
    assert calls[1]==('update','1',{'ip':'192.168.1.3','mac':'AA:BB:CC:DD:EE:FF'})
    p.profile=None;p._caps=p._build_caps()
    with pytest.raises(CapabilityUnavailable):p.save_dhcp_reservation({'ip':'192.168.1.2','mac':'AA:BB:CC:DD:EE:FF'})


def test_reservation_bus_validates_input_and_requires_delete_confirmation():
    from apps.access_manager.application.commands.device import DeviceCommandBus
    from apps.access_manager.domain.capabilities import Capability,CapabilitySet,SupportStatus as S
    from types import SimpleNamespace
    import pytest
    class P:
        capabilities=CapabilitySet([Capability('dhcp_reservations',S.SUPPORTED,S.SUPPORTED)])
        calls=[]
        def save_dhcp_reservation(self,config):self.calls.append(config);return {'verified':True}
        def delete_dhcp_reservation(self,identifier):self.calls.append(identifier);return {'verified':True}
    p=P();bus=DeviceCommandBus(SimpleNamespace(provider=p))
    with pytest.raises(ValueError):bus.save_reservation({'ip':'not-ip','mac':'wrong'})
    with pytest.raises(ValueError):bus.delete_reservation({'id':'1'})
    assert p.calls==[]
    bus.save_reservation({'ip':'192.168.1.2','mac':'aabbccddeeff'})
    assert p.calls[0]['mac']=='AA:BB:CC:DD:EE:FF'


def test_zte_dns_host_upsert_uses_existing_writer_and_readback(monkeypatch):
    from apps.access_manager.infrastructure.providers.zte import ZTEProvider
    from apps.access_manager.infrastructure.zte.protocol.zte_configuration import zte_dns
    from test_provider_contract_surface import FakeZTE
    import pytest
    p=ZTEProvider(client_factory=FakeZTE);p.connect('x','u','p')
    p.client.dns_status=lambda:{'hosts':[{'id':'1','nome':'printer','ip':'192.168.1.2'}]}
    seen=[]
    monkeypatch.setattr(zte_dns,'_upsert_host',lambda client,host:seen.append(host) or {'success':True})
    monkeypatch.setattr(zte_dns,'_wait_host_applied',lambda client,name,ip:{'nome':name,'ip':ip})
    result=p.save_dns_host({'id':'1','name':'printer','ip':'192.168.1.3'})
    assert result['verified'] is True and seen==[{'nome':'printer','ip':'192.168.1.3'}]
    with pytest.raises(ValueError):p.save_dns_host({'id':'1','name':'renamed','ip':'192.168.1.3'})
    assert not p.capabilities.get('dns_hosts_delete').writable


def test_huawei_dns_host_crud_requires_wired_capability():
    from apps.access_manager.infrastructure.providers.huawei import HuaweiProvider
    from apps.access_manager.infrastructure.huawei.profiles import HuaweiEG8041X7Profile
    p=HuaweiProvider();p.profile=HuaweiEG8041X7Profile();p.model='EG8041X7-10';p._caps=p._build_caps()
    seen=[]
    class Captured:
        def create_dns_host(self,**kw):seen.append(('create',kw));return {'verified':True}
        def update_dns_host(self,identifier,**kw):seen.append(('update',identifier,kw));return {'verified':True}
        def delete_dns_host(self,identifier):seen.append(('delete',identifier));return {'verified':True}
    p.captured=Captured()
    p.save_dns_host({'name':'printer','ip':'192.168.1.2'})
    p.save_dns_host({'id':'1','name':'printer','ip':'192.168.1.3'})
    p.delete_dns_host('1')
    assert seen[1]==('update','1',{'domain_name':'printer','ip':'192.168.1.3'})
    assert p.capabilities.get('dns_hosts_delete').writable


def test_traffic_history_aggregates_rates_but_keeps_last_counter(monkeypatch,tmp_path):
    import time
    repo=HistoryRepository(tmp_path/'history.sqlite3')
    repo.save_traffic('a',[{'source':'wan','identity':'1','rx_mbps':2,'tx_mbps':None,'counters':{'rx_bytes':2000}}],19000)
    repo.save_traffic('a',[{'source':'wan','identity':'1','rx_mbps':4,'tx_mbps':None,'counters':{'rx_bytes':1}}],19005)
    monkeypatch.setattr(time,'time',lambda:20000)
    rows=repo.traffic_history('a',16400)
    assert len(rows)==1 and rows[0]['rx_mbps']==3
    assert rows[0]['tx_mbps'] is None
    assert rows[0]['counters']['rx_bytes']==1


def test_zte_radio_options_use_current_width_channel_list_and_observed_widths():
    from apps.access_manager.infrastructure.providers.zte import ZTEProvider
    from test_provider_contract_surface import FakeZTE
    class ZTE(FakeZTE):
        def wifi_networks(self):return []
        def channel_status(self):return [{'banda':'5GHz','largura':'80','pais':'BRI','canal':'36'}]
        def get_view(self,*a,**k):return '<select id="Standard"><option value="ac">802.11ac</option></select>'
        def available_channels(self,**kw):return [{'largura':'80','canais':[36,40]},{'largura':'160','canais':[36]}]
    p=ZTEProvider(client_factory=ZTE);p.connect('x','u','p')
    options=p.get_wifi()['radios'][0]['options']
    assert [v['value'] for v in options['channel']]==['36','40']
    assert [v['value'] for v in options['bandwidth']]==['80','160']
    assert options['standard']==[{'value':'ac','label':'802.11ac'}]
    assert 'tx_power' not in options
