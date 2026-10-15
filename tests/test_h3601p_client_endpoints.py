from apps.access_manager.infrastructure.zte.discovery.profile_runtime import clients,state
from apps.access_manager.infrastructure.zte.discovery.multimodel import read_clients
from apps.access_manager.infrastructure.providers.zte import ZTEProvider
from tests.h3601p_support import Client,fixture,xml

def test_primary_and_cache():
 c=Client();c.responses['wlan_client_stat_lua.lua']=fixture('public_variant_wlan')
 assert len(read_clients(c,'H3601P','wifi_clients'))==2
 clients(c,'wifi_clients')
 assert c.calls==[('view','localNetStatus'),('data','accessdev_ssiddev_lua.lua'),('data','accessdev_ssiddev_lua.lua')]

def test_404_fallback_not_reprobed():
 c=Client();c.responses['accessdev_ssiddev_lua.lua']=404;c.responses['wlan_client_stat_lua.lua']=fixture('public_variant_wlan')
 assert len(clients(c,'wifi_clients'))==2;clients(c,'wifi_clients')
 assert c.calls.count(('data','accessdev_ssiddev_lua.lua'))==1
 assert 'accessdev_ssiddev_lua.lua' in state(c)['missing']

def test_wrong_root_fallback_and_valid_empty_cache():
 c=Client();c.responses['accessdev_ssiddev_lua.lua']=xml('OBJ_OTHER',[]);c.responses['wlan_client_stat_lua.lua']=fixture('valid_empty')
 assert clients(c,'wifi_clients')==[]
 assert state(c)['diagnostics']['wifi_clients']['status']=='valid_empty'
 assert state(c)['selected']['wifi_clients'].tag=='wlan_client_stat_lua.lua'

def test_provider_runtime_merges_enrichment_without_offline_leases():
 p=ZTEProvider(Client);p.connect('router','u','p');r=p.get_clients()
 assert len(r)==2;assert all(x['connection_type']=='Wi-Fi' for x in r)
 assert len({x['mac'] for x in r})==2
 assert not any(x.get('hostname')=='Offline-lease' for x in r)
 assert p.capabilities.get('clients').read.value=='SUPPORTED'

def test_partial_failure_does_not_disconnect():
 p=ZTEProvider(Client);p.connect('router','u','p')
 p.client.responses['accessdev_ssiddev_lua.lua']=404
 p.client.responses['accessdev_landevs_lua.lua']=fixture()
 r=p.get_clients();assert len(r)==2;assert p.connected
 assert 'Wi-Fi' in r[0]['collection_warnings'][0]
 assert p.capabilities.get('clients').read.value=='PARTIAL'

def test_real_facade_routes_h3601p_and_preserves_f670l_endpoint():
 from apps.access_manager.infrastructure.zte.protocol.device import ZTE
 from apps.access_manager.infrastructure.zte.discovery.profiles import H3601P_V9
 c=ZTE('router','u','p');calls=[]
 c.get_view=lambda tag,**kw:calls.append(('view',tag))
 c.get_menu=lambda tag,**kw:(calls.append(('data',tag)) or fixture('public_variant_wlan'))
 c.read_profile=H3601P_V9;assert len(c.wifi_clients())==2
 assert calls[-1][1]=='accessdev_ssiddev_lua.lua'
 c.read_profile=None;assert len(c.wifi_clients())==2
 assert calls[-1][1]=='wlan_client_stat_lua.lua'

def test_probe_exports_shape_only():
 from tools.zte_probe_h3601p import collect
 p=ZTEProvider(Client);p.connect('router','u','p');text=str(collect(p))
 for secret in ('Device-A','Lease-A','192.0.2','fe80::','02:00:00','raw','password'):
  assert secret not in text
