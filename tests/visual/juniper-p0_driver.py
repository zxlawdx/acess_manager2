"""Real Vela/Bottle/WebView; replace only the remote Junos transport."""
import os
import sys
import runpy
import tempfile
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[2]))
from tests.test_juniper import FakeTransport

class Transport(FakeTransport):
    def __init__(self):
        super().__init__()
        self.responses['resources']='<route-engine-information><route-engine><slot>0</slot><mastership-state>master</mastership-state><cpu-idle>85</cpu-idle><memory-buffer-utilization>42</memory-buffer-utilization></route-engine></route-engine-information>'
        self.responses['ping']='<ping-results><ping-summary><packets-sent>4</packets-sent><packets-received>4</packets-received><packet-loss>0</packet-loss></ping-summary></ping-results>'
        fixtures=Path('tests/fixtures/juniper')
        self.responses['facts']=(fixtures/'facts.xml').read_text().replace('24.2R1','23.4R2-S5.6')
        for feature,name in {'radius':'radius_servers','lacp':'lacp_ae1','optics':'optics_et_0_0_0','accounting':'subscriber_accounting','aaa_authentication':'aaa_authentication','aaa_accounting':'aaa_accounting','aaa_dynamic':'aaa_dynamic'}.items():
            self.responses[feature]=(fixtures/('mx204_23_4_'+name+'.xml')).read_text()
        self.responses['interfaces']='<interface-information>'+''.join('<physical-interface><name>'+name+'</name><admin-status>up</admin-status><oper-status>up</oper-status><speed>100Gbps</speed><mtu>9216</mtu></physical-interface>' for name in ('ae1','et-0/0/0','et-0/0/1','et-0/0/2','pp0','demux0'))+'</interface-information>'
        self.responses['route']='<route-information><route-table><rt><rt-destination>192.0.2.10/32</rt-destination><rt-entry><protocol-name>Access-internal</protocol-name><active-tag>*</active-tag></rt-entry></rt></route-table></route-information>'
        self.responses['fib']='<forwarding-table-information><route-table-entry><rt-destination>192.0.2.10</rt-destination><netif>demux0.200</netif></route-table-entry></forwarding-table-information>'
        self.responses['lockout']='<pppoe-lockout-information><total-clients-in-lockout>0</total-clients-in-lockout></pppoe-lockout-information>'
        self.responses['fpc']='<fpc-information><fpc><slot>0</slot><state>Online</state></fpc></fpc-information>'
        self.responses['environment']='<environment-information><environment-item><name>Fan</name><status>OK</status></environment-item></environment-information>'
        self.responses['traceroute']='<traceroute-results><hop><ttl-value>1</ttl-value><probe-result><ip-address>192.0.2.1</ip-address><rtt>1000</rtt></probe-result></hop></traceroute-results>'

    scenario=None
    def connect(self,*args,**kwargs):
        self.connected=True;self.kind='ssh';self.port=int(kwargs.get('ssh_port') or 50022)
    def execute(self,item,**kwargs):
        if item.feature=='radius' and Transport.scenario:
            scenario,Transport.scenario=Transport.scenario,None
            from apps.access_manager.infrastructure.juniper.errors import JuniperError
            if scenario=='timeout':raise JuniperError('CONNECTION_TIMEOUT')
            if scenario=='parser':return '<rpc-reply><unknown>PRIVATE-DO-NOT-LOG</unknown></rpc-reply>'
            if scenario=='slow':
                import time
                time.sleep(5)
        return super().execute(item,**kwargs)

if __name__=='__main__':
    with tempfile.TemporaryDirectory(prefix='access-manager-juniper-') as directory:
        os.environ['ACCESS_MANAGER_DATA_DIR']=directory
        import apps.access_manager.composition as composition
        composition.juniper_provider.transport_factory=Transport
        from tests.visual.bootstrap_driver import BootstrapDevice
        composition.zte_provider.client_factory=BootstrapDevice
        composition.router._huawei_probe=lambda *a,**kw:False
        from vela.api import api
        @api.post('/__qa__/scenario')
        def scenario(context=None):
            from apps.access_manager.presentation.api.common import body
            Transport.scenario=body(context).get('kind')
            return {'success':True}

        from apps.access_manager.infrastructure.juniper.trust import HostTrust
        HostTrust.inspect=lambda self,host,port:{'host':host,'port':int(port),'fingerprint':'SHA256:SYNTHETIC-UI-ONLY','previous_fingerprints':['SHA256:PREVIOUS-SYNTHETIC'],'status':'HOST_KEY_CHANGED','algorithm':'ssh-ed25519'}
        runpy.run_path('tests/visual/native_driver.py',run_name='__main__')
