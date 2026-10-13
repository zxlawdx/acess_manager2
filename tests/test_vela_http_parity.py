"""Exercise real Vela/Bottle HTTP parsing and prefixing with a test provider."""
import io
import json
from types import SimpleNamespace
from threading import RLock
from wsgiref.util import setup_testing_defaults
from vela.core.api_router import ApiRouter
from vela.core.api_server import ApiServer
from apps.access_manager.domain.capabilities import Capability,CapabilitySet,SupportStatus as S
from apps.access_manager.application.commands.device import DeviceCommandBus
from apps.access_manager.application.queries.device import DeviceQueryBus
from apps.access_manager.presentation.api import device as endpoints


def http(app, method, path, payload=None):
    environ={};setup_testing_defaults(environ)
    data=json.dumps(payload).encode() if payload is not None else b''
    environ.update(REQUEST_METHOD=method,PATH_INFO=path,CONTENT_TYPE='application/json',CONTENT_LENGTH=str(len(data)))
    environ['wsgi.input']=io.BytesIO(data)
    statuses=[]
    body=b''.join(app(environ,lambda status,headers,exc_info=None:statuses.append(status)))
    return statuses[0],json.loads(body)


class Provider:
    capabilities=CapabilitySet([Capability('device',S.SUPPORTED),Capability('dhcp',S.SUPPORTED,S.SUPPORTED),Capability('dns',S.SUPPORTED,S.UNKNOWN)])
    def get_device_info(self):return {'modelo':'EG8041X6-10','cpu_percent':0}
    def get_dhcp(self):return {'basic':{'ServerEnable':'1','MinAddress':'192.168.1.10','MaxAddress':'192.168.1.99'}}
    def set_dhcp(self,config):self.applied=config;return {'verified':True}
    def set_dns(self,config):raise AssertionError('Unknown writer must not run')


def server(monkeypatch):
    p=Provider();sessions=SimpleNamespace(provider=p,operation_lock=RLock())
    monkeypatch.setattr(endpoints,'queries',DeviceQueryBus(sessions))
    monkeypatch.setattr(endpoints,'commands',DeviceCommandBus(sessions))
    router=ApiRouter()
    router.get('/device')(endpoints.device)
    router.get('/device/dhcp')(endpoints.dhcp_read)
    router.post('/device/dhcp')(endpoints.dhcp)
    router.post('/device/dns')(endpoints.dns)
    api=ApiServer(router,port=0,docs_enabled=False)
    api.register_routes()
    return api.app,p


def test_vela_http_reads_normalized_dhcp_and_decodes_write_body(monkeypatch):
    app,p=server(monkeypatch)
    status,data=http(app,'GET','/api/device/dhcp')
    assert status.startswith('200') and data['enabled'] is True
    assert data['pool_start']=='192.168.1.10'
    _,result=http(app,'POST','/api/device/dhcp',{'lease_time':'86400'})
    assert result['verified'] is True and p.applied=={'lease_time':'86400'}


def test_vela_http_does_not_enable_unknown_dns_writer(monkeypatch):
    app,_=server(monkeypatch)
    _,result=http(app,'POST','/api/device/dns',{'ipv4_1':'1.1.1.1'})
    assert result['success'] is False and result['error']['code']
