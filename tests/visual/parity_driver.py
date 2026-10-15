"""Real Vela API and WebView; isolated data and synthetic router transport."""
import os
from pathlib import Path
import runpy
import sys
import tempfile
sys.path.insert(0,str(Path(__file__).resolve().parents[2]))
from tests.test_zte_read_parity import ParityDevice,RADIO,xml

class Device(ParityDevice):
    def __init__(self,*args,**kwargs):
        super().__init__(*args,**kwargs)
        payload=self.responses['wlan_wlanbasicadconf_lua.lua']
        second=xml('OBJ_WLANSETTING_ID',[{**RADIO,'_InstID':'radio2','Band':'5GHz','Channel':'36','AutoChannelEnabled':'1','BandWidth':'80MHz','Standard':'a,n,ac,ax'}])
        self.responses['wlan_wlanbasicadconf_lua.lua']=payload.replace('</ajax_response_xml_root>',second.split('<ajax_response_xml_root>',1)[1])
        self.responses.update({
            'tot_wlan_wlan_profile_lua.lua':xml('OBJ_WLANGETNEBAP_ID',[{'Channel':'6','Signal':'-40','Noise':'-90','Essid':'SyntheticNeighbor','MacAddr':'02:00:00:00:00:fe'}]),
            'firewall_dmz_lua.lua':xml('OBJ_FWDMZ_ID',[{'Enable':'0','InternalClient':''}]),
            'upnp_upnp_lua.lua':xml('OBJ_UPNPCONFIG_ID',[{'EnableUPnPIGD':'1'}]),
            'tr069_remotemgr_lua.lua':xml('OBJ_MANAGESERVER_ID',[{'URL':'https://example.invalid/acs'}]),
            'firewall_config_lua.lua':xml('OBJ_FWLEVEL_ID',[{'Enable':'1','Level':'Middle'}])})
    def get_view(self,tag,**kwargs):
        super().get_view(tag,**kwargs)
        return '<select name="Standard"><option value="b,g,n,ax">b/g/n/ax</option></select><select name="TxPower"><option value="80%">80%</option><option value="100%">100%</option></select>' if tag=='wlanBasic' else '<div>synthetic view</div>'

if __name__=='__main__':
    with tempfile.TemporaryDirectory(prefix='access-manager-parity-') as directory:
        os.environ['ACCESS_MANAGER_DATA_DIR']=directory
        import apps.access_manager.composition as composition
        composition.zte_provider.client_factory=Device
        composition.router._huawei_probe=lambda *a,**kwargs:False
        composition.full_diagnostics.http_test=lambda:{'status':'unknown','origin':'host_access_manager','duration_ms':None,'error':'External network disabled for deterministic QA.'}
        composition.profiles.save({'name':'Synthetic QA','wifi':{'radios':[{'band':'2.4GHz','channel':None,'auto_channel':True,'bandwidth':'20MHz','standard':'b,g,n,ax','tx_power':'100%'},{'band':'5GHz','auto_channel':True,'bandwidth':'80MHz'}]}})
        runpy.run_path('tests/visual/native_driver.py',run_name='__main__')
