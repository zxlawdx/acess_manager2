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
        self.responses['traceroute']='<traceroute-results><hop><ttl-value>1</ttl-value><probe-result><ip-address>192.0.2.1</ip-address><rtt>1000</rtt></probe-result></hop></traceroute-results>'

if __name__=='__main__':
    with tempfile.TemporaryDirectory(prefix='access-manager-juniper-') as directory:
        os.environ['ACCESS_MANAGER_DATA_DIR']=directory
        import apps.access_manager.composition as composition
        composition.juniper_provider.transport_factory=Transport
        runpy.run_path('tests/visual/native_driver.py',run_name='__main__')
