from apps.access_manager.domain.capabilities import SupportStatus as S
from .test_runtime_parity import FixtureClient
from apps.access_manager.infrastructure.huawei.eg8041_runtime import HuaweiEG8041FamilyRuntime
def test_wifi_read_supported_from_family_fixture():
    caps={x.name:x for x in HuaweiEG8041FamilyRuntime(FixtureClient(),model='EG8041X6-10').capabilities()}
    assert caps['wifi'].read==S.SUPPORTED and caps['wifi_radio'].read==S.SUPPORTED

def test_wifi_password_is_only_revealed_on_explicit_read(monkeypatch):
    runtime=HuaweiEG8041FamilyRuntime(FixtureClient(),model='EG8041X6-10')
    base='InternetGatewayDevice.LANDevice.1.WLANConfiguration.1'
    record={'Domain':base,'SSID':'Casa','Enable':'1'}
    psk={'Domain':base+'.PreSharedKey.1','PreSharedKey':'SenhaTeste123'}
    monkeypatch.setattr(runtime.captured,'_wifi_basic_record',lambda band:(record,[record,psk]) if band=='2.4GHz' else ({},[]))
    normal=runtime.wifi_networks(reveal_password=False)
    assert normal and normal[0]['password']=='' and normal[0]['password_hidden'] is True
    revealed=runtime.wifi_networks(reveal_password=True)
    assert revealed[0]['password']=='SenhaTeste123'
    assert revealed[0]['password_hidden'] is False
