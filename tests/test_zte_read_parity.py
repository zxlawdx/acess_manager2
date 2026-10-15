"""Structural, synthetic protocol fixtures; no physical P1 validation claim."""
import json
from types import SimpleNamespace
import pytest
from apps.access_manager.infrastructure.providers.zte import ZTEProvider
from apps.access_manager.infrastructure.zte.discovery.profile_runtime import parse_objects,read_feature,ReadFailure,state,reset_read_state
from apps.access_manager.infrastructure.zte.discovery.compatibility import scan
from apps.access_manager.application.services.wifi_environment import ChannelAnalyzer,collect_environment
from apps.access_manager.application.services.profiles import ProfileService,JsonProfileRepository
from apps.access_manager.infrastructure.profiles.zte import ZTEProfileTranslator
from apps.access_manager.domain.profiles import NetworkProfile
from tests.h3601p_support import Client,xml

RADIO={'_InstID':'radio1','Band':'2.4GHz','Channel':'6','AutoChannelEnabled':'0',
       'BandWidth':'20MHz','Standard':'b,g,n,ax','TxPower':'100%','CountryCode':'BRI',
       'RadioStatus':'1','SideBand':'None','SGIEnabled':'1','BeaconInterval':'100',
       'SSIDIsolationEnable':'0','MUMIMOEnable':'1','UPLinkMUMIMO':'1','DownLinkMUMIMO':'0',
       'UPLinkOFDMA':'1','DownLinkOFDMA':'1','TWTSupport':'1','SpatialReuse':'0',
       'QosType':'WMM','WorkMode':'ap','RtsCts':'2347','DTIM':'1','PreambleType':'long'}
TABLE={'Band':'2.4GHz','BandWidth':'20MHz','CountryCode':'BRI','ChannelList':'1,2,3,4,5,6,7,8,9,10,11'}

def radio_payload(table=True):
    first=xml('OBJ_WLANSETTING_ID',[RADIO])
    if not table:return first
    second=xml('OBJ_CHANNEL_ID',[TABLE,{**TABLE,'Band':'5GHz','BandWidth':'80MHz','ChannelList':'36,40'},{**TABLE,'CountryCode':'OTHER','ChannelList':'12,13'}])
    return first.replace('</ajax_response_xml_root>',second.split('<ajax_response_xml_root>',1)[1])

class ParityDevice(Client):
    def __init__(self,*args,**kwargs):
        super().__init__(*args,**kwargs)
        self.responses.update({'wlan_wlanbasicadconf_lua.lua':radio_payload(),
            'wlan_wlansssidconf_lua.lua':xml('OBJ_WLANAP_ID',[{'_InstID':'ssid1','ESSID':'Synthetic','Band':'2.4GHz','Enable':'1'}]),
            'wan_internetstatus_lua.lua':xml('ID_WAN_COMFIG',[{'ConnStatus':'Connected','WANCName':'WAN','IPAddress':'192.0.2.1','GateWay':'192.0.2.254','DNS1':'192.0.2.53','UpTime':'100','RemainLeaseTime':'200','ConnError':'ERROR_NONE'}]),
            'status_lan_info_lua.lua':xml('OBJ_PON_PORT_BASIC_STATUS_ID',[{'Port':'LAN1','Status':'Up','Speed':'1000 Mbps'}]),
            'dns_localdns_lua.lua':xml('OBJ_DNS_ID',[{'SerIPAddress1':'192.0.2.53','DomainName':''}]),
            'Localnet_LanMgrIpv4_DHCPBasicCfg_lua.lua':xml('OBJ_Br0AndDhcpsHosCfg_ID',[{'ServerEnable':'1','MinAddress':'192.0.2.10','MaxAddress':'192.0.2.200','LeaseTime':'86400'}])})


def provider():
    p=ZTEProvider(ParityDevice);p.connect('example.invalid','u','p');return p


def test_radio_all_legacy_fields_and_table_share_one_read():
    p=provider();before=p.client.calls.count(('data','wlan_wlanbasicadconf_lua.lua'))
    r=p.get_wifi_radios()[0]
    assert r['auto_channel'] is False and r['enabled'] is True and r['channel']==6
    assert r['bandwidth']=='20MHz' and r['standard']=='b,g,n,ax'
    assert r['sgi'] is True and r['beacon_interval']==100 and r['ssid_isolation'] is False
    assert r['mu_mimo'] is True and r['uplink_mu_mimo'] is True and r['downlink_mu_mimo'] is False
    assert r['uplink_ofdma'] is True and r['downlink_ofdma'] is True
    assert r['twt'] is True and r['spatial_reuse'] is False
    assert (r['qos_type'],r['work_mode'],r['rts_cts'],r['dtim'],r['preamble_type'])==('WMM','ap',2347,1,'long')
    assert p.get_available_channels('2.4GHz','20MHz','BRI')[0]['channels']==list(range(1,12))
    assert p.get_available_channels('2.4GHz','40MHz','BRI')==[]
    assert p.client.calls.count(('data','wlan_wlanbasicadconf_lua.lua'))==before
    assert p.capabilities.get('wifi_channels').read.value=='SUPPORTED'
    assert not p.capabilities.get('wifi_radio').writable


def test_radio_without_table_or_optional_booleans_does_not_invent():
    p=provider();reset_read_state(p.client)
    p.client.responses['wlan_wlanbasicadconf_lua.lua']=xml('OBJ_WLANSETTING_ID',[{'Band':'5GHz','Channel':'44'}])
    r=p.get_wifi_radios()[0]
    assert r['sgi'] is None and r['auto_channel'] is None and r['enabled'] is None
    assert p.get_available_channels()==[]
    assert p.capabilities.get('wifi_radio').read.value=='SUPPORTED'
    assert p.capabilities.get('wifi_channels').read.value=='PARTIAL'


def test_json_variants_use_same_strict_parser_and_error_policy():
    payload=json.dumps({'OBJ_ACCESSDEV_ID':{'Instance':[{'path':'host1','parameters':{'MACAddress':'02:00:00:00:00:01','HostName':'Synthetic'}}]}})
    assert parse_objects(payload,('OBJ_ACCESSDEV_ID',))['OBJ_ACCESSDEV_ID'][0]['_InstID']=='host1'
    assert parse_objects(payload.encode(),('OBJ_ACCESSDEV_ID',))['OBJ_ACCESSDEV_ID'][0]['HostName']=='Synthetic'
    with pytest.raises(ReadFailure,match='firmware'):
        parse_objects(json.dumps({'IF_ERRORSTR':'SessionTimeout','OBJ_ACCESSDEV_ID':{'Instance':[]}}),('OBJ_ACCESSDEV_ID',))
    with pytest.raises(ReadFailure):parse_objects(json.dumps({'Unrelated':{'Instance':[{'x':'y'}]}}),('OBJ_ACCESSDEV_ID',))


def test_wrong_schema_is_cached_and_unrelated_radio_shape_never_promotes():
    c=Client();c.responses['wlan_wlanbasicadconf_lua.lua']=xml('OBJ_WLANSETTING_ID',[{'Unrelated':'x'}])
    for _ in range(2):
        with pytest.raises(ReadFailure):read_feature(c,'wifi_radios')
    assert c.calls.count(('data','wlan_wlanbasicadconf_lua.lua'))==1


def test_scan_is_bounded_and_support_report_has_no_values():
    c=ParityDevice();r=scan(c,max_endpoints=2)
    assert len([call for call in c.calls if call[0]=='data'])==2
    assert r['compatibility_scan']['best_matching_profile']=='H288A-like'
    text=json.dumps(r)
    for private in ('192.0.2.','Device-A','02:00:','Synthetic','fe80::'):assert private not in text
    c=Client();c.responses['accessdev_ssiddev_lua.lua']=404;c.responses['wlan_client_stat_lua.lua']=404
    r=scan(c);assert r['compatibility_scan']['tied_profiles']==['H288A-like','F6640-like']


def test_neighbor_scan_normalizes_without_breaking_radio_and_redacts_report():
    p=provider()
    p.client.responses['tot_wlan_wlan_profile_lua.lua']=xml('OBJ_WLANGETNEBAP_ID',[{'Essid':'PrivateNeighbor','MacAddr':'02:00:00:00:00:fe','Signal':'-40','Noise':'-90','Channel':'6','ScndChannel':'0','AuthMode':'WPA2'}])
    scan_result=p.get_wifi_neighbor_scan('2.4GHz')
    assert scan_result['available'] is True and scan_result['networks'][0]['channel']=='6'
    assert p.capabilities.get('wifi_radio').read.value=='SUPPORTED'
    q=SimpleNamespace(wifi_channels=p.get_available_channels,wifi_neighbor_scan=p.get_wifi_neighbor_scan)
    result=collect_environment(q,p.get_wifi_radios())[0]
    assert result['channel_analysis']['best_channel']==1
    assert result['channel_analysis']['recommendation']['action']['channel']==1
    text=json.dumps(result)
    assert 'PrivateNeighbor' not in text and '02:00:00:00:00:fe' not in text


@pytest.mark.parametrize('band,neighbors,current,auto,confirmed,recommends',[
    ('2.4GHz',[{'channel':6,'signal':-40}],6,False,True,True),
    ('2.4GHz',[{'channel':5,'signal':-40}],6,False,True,True),
    ('5GHz',[{'channel':36,'signal':-40}],36,False,True,True),
    ('2.4GHz',[{'channel':6,'signal':-90}],6,False,True,False),
    ('2.4GHz',[{'channel':6,'signal':-40}],6,True,True,False),
    ('2.4GHz',[{'channel':6,'signal':-40}],6,False,False,False),
    ('2.4GHz',[{'channel':6,'signal':-40}],6,None,True,False),
])
def test_channel_analyzer_canonical_rules(band,neighbors,current,auto,confirmed,recommends):
    r=ChannelAnalyzer().analyze(band=band,radio={'channel':current,'auto_channel':auto},neighbors=neighbors,available_channels=[{'band':band,'channels':[1,6,11] if '2.4' in band else [36,44]}],scan_confirmed=confirmed)
    assert bool(r['recommendation']) is recommends
    if not confirmed:assert r['best_channel'] is None
    if auto is None:assert r['auto_channel'] is None


def test_no_firmware_destinations_no_recommendation():
    r=ChannelAnalyzer().analyze(band='5GHz',radio={'channel':36,'auto_channel':False},neighbors=[{'channel':36,'signal':-20}],available_channels=[])
    assert r['best_channel'] is None and r['recommendation']=={}


def test_profile_migration_preview_crud_and_skip_writes(tmp_path):
    path=tmp_path/'profiles.json'
    original={'Legacy':{'description':'Keep custom','wifi':{'2.4GHz':{'auto_channel':True,'channel':None,'sgi':False,'beacon_interval':100}},'dns':{'hosts':[{'nome':'example','ip':'192.0.2.3'}]},'dhcp':{'lease_time':3600}}}
    path.write_text(json.dumps(original));before=path.read_bytes()
    repo=JsonProfileRepository(path);profile=repo.get('Legacy')
    assert profile.name=='Legacy' and profile.wifi['radios'][0]['sgi'] is False
    assert path.read_bytes()==before
    p=provider();sessions=SimpleNamespace(provider=p)
    q=SimpleNamespace(wifi_radios=p.get_wifi_radios,dns=p.get_dns)
    service=ProfileService(sessions,None,repo,{'zte':ZTEProfileTranslator()},q)
    preview=service.preview('Legacy');op=preview['operations'][0]
    assert op['will_apply'] is False
    assert service.apply('Legacy')['applied']==0
    change=next(c for c in op['changes'] if c['field']=='Canal')
    assert change['current']==6 and change['desired']=='Automático'
    assert repo.save(profile).wifi['2.4GHz']['beacon_interval']==100
    assert repo.get('Legacy').description=='Keep custom'
    assert repo.delete('Legacy') is True and repo.list()==[]


def test_wan_dhcp_dns_and_management_evidence_stay_read_only():
    p=provider();wan=p.get_wan()[0]
    assert wan['uptime_seconds']=='100' and wan['remain_lease_time']=='200'
    assert wan['connection_error']=='ERROR_NONE' and wan['dns1']=='192.0.2.53'
    assert p.get_dhcp()['basic']['MinAddress']=='192.0.2.10'
    assert p.get_dns()['ipv4_1']=='192.0.2.53'
    report=p.compatibility_scan()
    assert 'dns' in report['validated_features']
    assert all(not cap['enabled']['write'] for cap in p.capabilities.public().values())


def test_native_radio_writer_reads_writes_and_requires_readback(monkeypatch):
    from apps.access_manager.infrastructure.zte.protocol.zte_configuration import zte_wlan_channel_configuration as wlan
    import xml.etree.ElementTree as ET
    class Native:
        def __init__(self,apply):self.events=[];self.current=dict(RADIO);self.apply=apply
        def get_view(self,*args,**kwargs):self.events.append('view')
        def get_menu(self,*args,**kwargs):self.events.append('read');return xml('OBJ_WLANSETTING_ID',[self.current])
        def _validar_resposta(self,payload):pass
        def _parse_instances(self,payload):return parse_objects(payload,('OBJ_WLANSETTING_ID',))
    def post(client,tag,fields):
        client.events.append('write')
        if client.apply:client.current.update(dict(fields))
        return '<ajax_response_xml_root><IF_ERRORSTR>SUCC</IF_ERRORSTR></ajax_response_xml_root>'
    monkeypatch.setattr(wlan,'post_menu',post)
    for apply in (True,False):
        client=Native(apply);r=wlan.set_radio_config(client,'2.4GHz',{'tx_power':'80%'})
        assert [e for e in client.events if e in {'read','write'}]==['read','write','read']
        assert r['verified'] is apply and r['uncertain'] is not apply


def test_dhcp_configuration_survives_missing_lease_read():
    p=provider();reset_read_state(p.client)
    for tag in ('dhcp4s_dhcphostinfo_m.lua','accessdev_landevs_lua.lua','accessdev_ssiddev_lua.lua'):p.client.responses[tag]=404
    assert p.get_dhcp()['configuration_available'] is True
    assert p.capabilities.get('dhcp').read.value=='SUPPORTED'


def test_shape_exports_unknown_nodes_without_values():
    from apps.access_manager.infrastructure.zte.discovery.compatibility import structure
    payload=xml('OBJ_NEW_FIRMWARE_ID',[{'HostName':'Do not export','MACAddress':'02:00:00:00:00:02'}])
    r=structure(payload,('OBJ_ACCESSDEV_ID',))
    assert r=={'nodes_seen':{'OBJ_NEW_FIRMWARE_ID':1},'unknown_nodes':['OBJ_NEW_FIRMWARE_ID']}
    assert 'Do not export' not in str(r)
