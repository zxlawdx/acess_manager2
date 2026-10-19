import pytest
from apps.access_manager.infrastructure.zte.discovery.profile_runtime import parse_objects,clients,ReadFailure
from tests.h3601p_support import Client,fixture,xml
@pytest.mark.parametrize('name',['public_variant_accessdev','public_variant_fragmented','public_variant_wlan'])
def test_styles_namespace_roots_and_distinct_macs(name):
 c=Client();c.responses['accessdev_ssiddev_lua.lua']=fixture(name)
 rows=clients(c,'wifi_clients');assert len(rows)==2
 assert rows[0]['hostname']==rows[1]['hostname'];assert rows[0]['mac']!=rows[1]['mac']
 assert rows[0]['ipv6_addresses']==['fe80::1','2001:db8::1'];assert rows[0]['connection_type']=='Wi-Fi'
 assert 'raw' not in rows[0];assert rows[0]['source_endpoint']=='accessdev_ssiddev_lua.lua'
@pytest.mark.parametrize('payload,reason',[
 ('<html><form>login</form></html>','login_page_instead_of_data'),
 ('SessionTimeout','session_expired'),('<bad','invalid_xml'),
 (xml('OBJ_OTHER',[]),'wrong_schema'),
 ('<ajax_response_xml_root><IF_ERRORID>1</IF_ERRORID><OBJ_ACCESSDEV_ID/></ajax_response_xml_root>','firmware_error'),
 ('<ajax_response_xml_root><IF_ERRORSTR>FAIL</IF_ERRORSTR><OBJ_ACCESSDEV_ID/></ajax_response_xml_root>','firmware_error')])
def test_invalid_shapes(payload,reason):
 with pytest.raises(ReadFailure) as e:parse_objects(payload,('OBJ_ACCESSDEV_ID',))
 assert e.value.category==reason

def test_safe_root_matching():
 with pytest.raises(ReadFailure):parse_objects(xml('OBJ_ACCESSDEV_ID_EVIL',[]),('OBJ_ACCESSDEV_ID',))

def test_aliases_and_lan_origin():
 c=Client();c.responses['accessdev_landevs_lua.lua']=xml('OBJ_ACCESSDEV_ID',[{'DeviceName':'A','MacAddr':'02:00:00:00:00:05','IP':'192.0.2.1','IPv6Addr':'fe80::5','Interface':'LAN1'}])
 r=clients(c,'lan_clients')[0];assert r['connection_type']=='Ethernet';assert r['ipv6']=='fe80::5';assert r['interface']=='LAN1'

def test_identity_fallback_never_uses_hostname_or_merges_different_macs():
 from apps.access_manager.domain.clients import merge_clients
 assert len(merge_clients([{'hostname':'Same','id':'a'}],[{'hostname':'Same','id':'b'}],identity_fallback=True))==2
 assert len(merge_clients([{'ip':'192.0.2.1','hostname':'A'}],[{'ip':'192.0.2.1','rssi':-40}],identity_fallback=True))==1
 assert len(merge_clients([{'ip':'192.0.2.1','mac':'02:00:00:00:00:01'}],[{'ip':'192.0.2.1','mac':'02:00:00:00:00:02'}],identity_fallback=True))==2

def test_qualified_public_fields_and_case_aliases_keep_fragment_boundaries():
 c=Client();c.responses['accessdev_ssiddev_lua.lua']=xml('OBJ_ACCESSDEV_ID',[{'Device.1.hostname':'A'},{'Device.1.macaddr':'02:00:00:00:00:01'},{'Device.1.ipaddr':'192.0.2.1'},{'Device.2.hostname':'B'},{'Device.2.macaddr':'02:00:00:00:00:02'}])
 r=clients(c,'wifi_clients');assert len(r)==2;assert r[0]['hostname']=='A';assert r[1]['hostname']=='B'

def test_current_mode_precedes_generic_mode_and_reaches_domain():
 from apps.access_manager.domain.clients import normalize_clients
 c=Client();c.responses['accessdev_ssiddev_lua.lua']=xml('OBJ_WLAN_AD_ID',[{'MACAddress':'02:00:00:00:00:03','CurrentMode':'ac','Mode':'ax','RSSI':'-52','RxRate':'144'}])
 rows=normalize_clients(clients(c,'wifi_clients'))
 assert rows[0]['wifi_generation']==5
 assert rows[0]['wifi_standard_raw']=='ac'
