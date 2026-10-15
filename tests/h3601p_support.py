from pathlib import Path
from requests import HTTPError, Response
from apps.access_manager.infrastructure.zte.discovery.profiles import H3601P_V9
from apps.access_manager.infrastructure.zte.discovery.profile_runtime import reset_read_state
ROOT=Path(__file__).parent/'fixtures/zte/h3601p'
def fixture(name='public_variant_accessdev'):return (ROOT/(name+'.xml')).read_text()
def xml(root,rows):
 import xml.etree.ElementTree as ET
 top=ET.Element('ajax_response_xml_root');obj=ET.SubElement(top,root)
 for row in rows:
  inst=ET.SubElement(obj,'Instance')
  for k,v in row.items():ET.SubElement(inst,'ParaName').text=k;ET.SubElement(inst,'ParaValue').text=str(v)
 return ET.tostring(top,encoding='unicode')
class Client:
 def __init__(self,*a,**k):
  self.calls=[];self.logins=0;self.read_profile=H3601P_V9;self.profile_fingerprint={};self.responses={
   'accessdev_ssiddev_lua.lua':fixture(), 'accessdev_landevs_lua.lua':fixture('valid_empty'),
   'dhcp4s_dhcphostinfo_m.lua':fixture('public_variant_dhcp')}
 def login(self):self.logins+=1;reset_read_state(self);return True
 def logout(self):reset_read_state(self)
 def device_status(self):return {'modelo':'ZXHN H3601P','firmware':'V9.0.0P1_MUL'}
 def get_view(self,tag,**kwargs):self.calls.append(('view',tag));self._menu_context=tag;return '<div>status</div>'
 def get_menu(self,tag,**kwargs):
  self.calls.append(('data',tag));value=self.responses.get(tag,404)
  if isinstance(value,list):value=value.pop(0)
  if isinstance(value,int):
   r=Response();r.status_code=value;raise HTTPError(response=r)
  return value
 def lan_clients(self):
  from apps.access_manager.infrastructure.zte.discovery.profile_runtime import clients
  return clients(self,'lan_clients')
 def wifi_clients(self):
  from apps.access_manager.infrastructure.zte.discovery.profile_runtime import clients
  return clients(self,'wifi_clients')
