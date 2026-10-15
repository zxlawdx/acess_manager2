"""Actual Vela runapp, provider, buses and SQLite; synthetic remote router only."""
import os
import runpy
import sys
import tempfile
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[2]))
from tests.test_provider_contract_surface import FakeZTE

class Router(FakeZTE):
    def __init__(self,*args,**kwargs):
        super().__init__(*args,**kwargs)
        self.networks=[{'id':'1','ssid':'Synthetic QA 2.4G','banda':'2.4GHz','ativo':True,'broadcast':True,'password':'QA_OLD_WIFI_24'}, {'id':'5','ssid':'Synthetic QA 5G','banda':'5GHz','ativo':True,'broadcast':True,'password':'QA_OLD_WIFI_5'}]
    def wifi_networks(self,reveal_password=False):
        return [{**r,'password':r['password'] if reveal_password else '********','password_hidden':not reveal_password} for r in self.networks]
    def set_ssid_config(self,ssid_id,config):
        row=next(r for r in self.networks if r['id']==str(ssid_id));row.update(config)
        return {'success':True,'verified':True}
    def wifi_clients(self): return [{'hostname':'TV Sala','mac':'02:00:00:00:00:01','ip':'192.0.2.10','ssid':'Synthetic QA 5G','banda':'5GHz','rssi':-78,'snr':18,'channel':44},{'hostname':'TV Sala','mac':'02:00:00:00:00:02','ip':'192.0.2.11','ssid':'Synthetic QA 2.4G','banda':'2.4GHz','rssi':-50,'snr':35,'channel':6}]
    def lan_clients(self): return []
    def lan_ports(self): return [{'port':'LAN1','status':'Up','speed':'1G','duplex':'Full'},{'port':'LAN2','status':'Up','speed':'100M','duplex':'Full','expected_speed_bps':1000000000},{'port':'LAN3','status':'Down'}]
    def optical_status(self): return {'rx':-18.7,'tx':2.1,'pon':'Online','los':False,'temperature':43,'thresholds':{'critical_low':-28,'warning_low':-24}}
    def wan_status(self): return [{'name':'WAN Internet','status':'Connected','ip':'192.0.2.1','gateway':'192.0.2.254','dns':'192.0.2.53','vlan':100}]
    def dhcp_status(self): return {'enabled':True,'pool_start':'192.0.2.10','pool_end':'192.0.2.200','lease_time':86400}
    def dns_status(self): return {'ipv4_1':'1.1.1.1','ipv6_1':'2606:4700:4700::1111','hosts':[]}
    def channel_status(self): return []
    def ping(self,config): return {'sent':4,'received':4,'loss_percent':0,'avg_ms':4}
    def device_status(self): return {'modelo':'F670L','firmware':'SYNTHETIC-QA','cpu_percent':24,'memory_percent':37,'uptime':3600}

if __name__=='__main__':
    with tempfile.TemporaryDirectory(prefix='access-manager-support-qa-') as directory:
        os.environ['ACCESS_MANAGER_DATA_DIR']=directory
        import apps.access_manager.composition as composition
        composition.zte_provider.client_factory=Router
        composition.router._huawei_probe=lambda *a,**kw:False
        runpy.run_path('tests/visual/native_driver.py',run_name='__main__')
