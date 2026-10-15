import pytest
from apps.access_manager.infrastructure.providers.zte import ZTEProvider
from apps.access_manager.domain.capabilities import CapabilityUnavailable
from tests.h3601p_support import Client,xml

def test_reads_discovered_no_pon_or_inherited_writers():
 p=ZTEProvider(Client);r=p.connect('router','u','p')
 assert r['profile']=='h3601p_v9';assert ('data','accessdev_ssiddev_lua.lua') in p.client.calls
 assert p.capabilities.get('optical').read.value=='UNSUPPORTED'
 for cap in p.capabilities.public().values():assert cap['enabled']['write'] is False
 with pytest.raises(CapabilityUnavailable):p.get_optical()
 with pytest.raises(CapabilityUnavailable):p.reboot()
 with pytest.raises(CapabilityUnavailable):p.set_ssid_config('1',{'ssid':'x'})
 assert p.capabilities.get('wifi').read.value=='PARTIAL'

def test_port_count_no_topology_dependency():
 p=ZTEProvider(Client);p.connect('router','u','p')
 p.client.responses['status_lan_info_lua.lua']=xml('OBJ_PON_PORT_BASIC_STATUS_ID',[{'_InstID':'LAN1','Status':'Up','Speed':'1000 Mbps'},{'_InstID':'LAN2','Status':'Down'}])
 from apps.access_manager.infrastructure.zte.discovery.profile_runtime import reset_read_state
 reset_read_state(p.client) # new fixture represents a fresh firmware/session
 assert len(p.get_lan())==2;assert p.capabilities.get('lan').read.value=='SUPPORTED'
 assert not p.get_mesh()['links'];assert not any('topo_lua' in tag for _,tag in p.client.calls)
 assert '02:00' not in str(p.runtime_diagnostic())
@pytest.mark.parametrize('model',['F670L','F6600P'])
def test_ont_optical_and_writes_preserved(model):
 p=ZTEProvider();p.model=model
 assert p._build_caps().get('optical').read.value=='SUPPORTED'
 assert p._build_caps().get('wifi').writable

def test_hint_is_not_identity_or_endpoint_proof():
 class Hinted(Client):
  def device_status(self):raise RuntimeError('missing status')
 p=ZTEProvider(Hinted);result=p.connect('router','u','p',model_hint='H3601P')
 assert result['mode']=='deployment';assert p.firmware is None
 assert p.capabilities.get('device').read.value=='PARTIAL'
 assert p.capabilities.get('clients').read.value=='SUPPORTED'

def test_precise_footer_fallback_without_firmware_fabrication():
 class Footer(Client):
  authenticated_root_html='<footer>ZTE Corporation · ZXHN H3601P V9.0.0P1_MUL</footer>'
  def device_status(self):raise RuntimeError('missing status')
 p=ZTEProvider(Footer);p.connect('router','u','p')
 assert p.firmware=='V9.0.0P1_MUL'
 assert p.get_device_info()['identification_source']=='HTML_DETECTED'

def test_empty_device_schema_still_uses_precise_footer():
 class Empty(Client):
  authenticated_root_html='<footer>ZTE Corporation ZXHN H3601P V9.0.0P1_MUL</footer>'
  def device_status(self):return {}
 p=ZTEProvider(Empty);r=p.connect('router','u','p')
 assert r['profile']=='h3601p_v9';assert p.firmware=='V9.0.0P1_MUL'

 assert p.get_device_info()['firmware']=='V9.0.0P1_MUL'
