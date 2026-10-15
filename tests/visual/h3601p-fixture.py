"""UI test data generated through the real provider with synthetic XML only."""
import json
import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[2]))
from tests.h3601p_support import Client,xml
from apps.access_manager.infrastructure.providers.zte import ZTEProvider
from apps.access_manager.domain.presentation import device_view,wan_view
p=ZTEProvider(Client);p.connect('router','u','p');c=p.client
c.responses.update({
 'status_lan_info_lua.lua':xml('OBJ_PON_PORT_BASIC_STATUS_ID',[{'_InstID':'LAN1','Status':'Up','Speed':'1000 Mbps'},{'_InstID':'LAN2','Status':'Down'}]),
 'wan_internetstatus_lua.lua':xml('ID_WAN_COMFIG',[{'WANCName':'Internet','ConnStatus':'Connected','IPAddress':'192.0.2.254'}]),
 'wlan_wlansssidconf_lua.lua':xml('OBJ_WLANAP_ID',[{'_InstID':'1','ESSID':'Documentation-WiFi','Enable':'1','Band':'2.4GHz'}]),
 'wlan_wlanbasicadconf_lua.lua':xml('OBJ_WLANSETTING_ID',[{'_InstID':'1','Band':'2.4GHz','Channel':'6'},{'_InstID':'2','Band':'5GHz','Channel':'36'}])})
data={'/api/device':device_view(p.get_device_info()),'/api/device/clients':p.get_clients(),'/api/device/lan':p.get_lan(),'/api/device/wan':[wan_view(r) for r in p.get_wan()],'/api/device/wifi/ssids':p.get_wifi_networks(),'/api/device/wifi/radios':p.get_wifi_radios()}
data['/api/session']={'connected':True,'session':{'vendor':'zte','model':'H3601P','firmware':'V9.0.0P1_MUL','capabilities':p.capabilities.public()}}
print(json.dumps(data))
