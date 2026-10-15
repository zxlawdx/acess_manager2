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
        self.responses['radius']='<radius-servers-table><radius-server><profile-name>access</profile-name><server-address>192.0.2.200</server-address><status>UP</status></radius-server></radius-servers-table>'
        self.responses['lacp']='<lacp-interface-information><lag-lacp-protocol><name>et-0/0/0</name><lacp-mux-state>Collecting distributing</lacp-mux-state></lag-lacp-protocol></lacp-interface-information>'
        self.responses['optics']='<interface-information><physical-interface><name>et-0/0/0</name><optics-diagnostics><module-temperature>35 C</module-temperature><optics-diagnostics-lane-values><lane-index>0</lane-index><laser-rx-optical-power>1 mW</laser-rx-optical-power></optics-diagnostics-lane-values></optics-diagnostics></physical-interface></interface-information>'
        self.responses['accounting']='<subscribers-information><subscriber><family>inet</family><input-bytes>1000</input-bytes><output-bytes>2000</output-bytes></subscriber></subscribers-information>'
        self.responses['route']='<route-information><route-table><rt><rt-destination>192.0.2.10/32</rt-destination><rt-entry><protocol-name>Access-internal</protocol-name><active-tag>*</active-tag></rt-entry></rt></route-table></route-information>'
        self.responses['fib']='<forwarding-table-information><route-table-entry><rt-destination>192.0.2.10</rt-destination><netif>demux0.200</netif></route-table-entry></forwarding-table-information>'
        self.responses['lockout']='<pppoe-lockout-information><total-clients-in-lockout>0</total-clients-in-lockout></pppoe-lockout-information>'
        for name in ('aaa_authentication','aaa_accounting','aaa_dynamic'):
            self.responses[name]='<aaa-module-statistics><requests>1000</requests><accepts>900</accepts><rejects>100</rejects></aaa-module-statistics>'
        self.responses['fpc']='<fpc-information><fpc><slot>0</slot><state>Online</state></fpc></fpc-information>'
        self.responses['environment']='<environment-information><environment-item><name>Fan</name><status>OK</status></environment-item></environment-information>'
        self.responses['traceroute']='<traceroute-results><hop><ttl-value>1</ttl-value><probe-result><ip-address>192.0.2.1</ip-address><rtt>1000</rtt></probe-result></hop></traceroute-results>'

if __name__=='__main__':
    with tempfile.TemporaryDirectory(prefix='access-manager-juniper-') as directory:
        os.environ['ACCESS_MANAGER_DATA_DIR']=directory
        import apps.access_manager.composition as composition
        composition.juniper_provider.transport_factory=Transport
        from tests.visual.bootstrap_driver import BootstrapDevice
        composition.zte_provider.client_factory=BootstrapDevice
        composition.router._huawei_probe=lambda *a,**kw:False
        from apps.access_manager.infrastructure.juniper.trust import HostTrust
        HostTrust.inspect=lambda self,host,port:{'host':host,'port':int(port),'fingerprint':'SHA256:SYNTHETIC-UI-ONLY','previous_fingerprints':['SHA256:PREVIOUS-SYNTHETIC'],'status':'HOST_KEY_CHANGED','algorithm':'ssh-ed25519'}
        runpy.run_path('tests/visual/native_driver.py',run_name='__main__')
