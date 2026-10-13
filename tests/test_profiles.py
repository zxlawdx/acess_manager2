from pathlib import Path

from apps.access_manager.application.services.profiles import JsonProfileRepository, ProfileService
from apps.access_manager.domain.capabilities import Capability, CapabilitySet, EvidenceLevel, SupportStatus
from apps.access_manager.domain.profiles import NetworkProfile
from apps.access_manager.infrastructure.profiles import HuaweiProfileTranslator, ZTEProfileTranslator


class FakeProvider:
    vendor = "huawei"
    model = "EG8041X7-10"
    capabilities = CapabilitySet([
        Capability("wifi", write=SupportStatus.SUPPORTED, evidence=EvidenceLevel.PHYSICALLY_VALIDATED),
        Capability("wifi_radio", write=SupportStatus.PARTIAL, evidence=EvidenceLevel.FIXTURE_VALIDATED),
        Capability("dns", write=SupportStatus.SUPPORTED, evidence=EvidenceLevel.PHYSICALLY_VALIDATED),
        Capability("dhcp", write=SupportStatus.UNSUPPORTED),
    ])


class FakeSessions:
    provider = FakeProvider()


class FakeCommands:
    def __init__(self):
        self.calls = []

    def execute(self, feature, method, *args, **kwargs):
        self.calls.append((feature, method, args, kwargs))
        return {"verified": True}


def sample_profile():
    return NetworkProfile.from_dict({
        "name": "Bancada",
        "wifi": {
            "ssids": [{"id": 1, "ssid": "Lab", "channel": 6}],
            "radio": {"band": "2.4GHz", "power": 100},
        },
        "dns": {"primary": "1.1.1.1"},
        "dhcp": {"enabled": True},
    })


def test_profile_is_provider_neutral_and_translator_has_no_endpoints():
    profile = sample_profile()
    assert "/" not in repr(profile.to_dict())
    for translator in (HuaweiProfileTranslator(), ZTEProfileTranslator()):
        operations = translator.translate(profile)
        assert {op.feature for op in operations} == {"wifi", "wifi_radio", "dns", "dhcp"}
        assert all("/html/" not in repr(op.public()) and "thinklua" not in repr(op.public()).lower() for op in operations)


def test_preview_enables_only_supported_writes(tmp_path: Path):
    commands = FakeCommands()
    service = ProfileService(FakeSessions(), commands, JsonProfileRepository(tmp_path/"profiles.json"), {"huawei": HuaweiProfileTranslator()})
    preview = service.preview(sample_profile())
    status = {item["feature"]: item["will_apply"] for item in preview["operations"]}
    assert status == {"wifi": True, "wifi_radio": False, "dns": True, "dhcp": False}
    assert preview["applicable"] == 2
    assert preview["skipped"] == 2


def test_apply_never_executes_partial_or_unsupported_operations(tmp_path: Path):
    commands = FakeCommands()
    service = ProfileService(FakeSessions(), commands, JsonProfileRepository(tmp_path/"profiles.json"), {"huawei": HuaweiProfileTranslator()})
    result = service.apply(sample_profile())
    assert result["applied"] == 2
    assert result["skipped"] == 2
    assert result["failed"] == 0
    assert [call[0] for call in commands.calls] == ["wifi", "dns"]


def test_json_repository_round_trip(tmp_path: Path):
    repo = JsonProfileRepository(tmp_path/"profiles.json")
    repo.save(sample_profile())
    assert repo.get("Bancada").wifi["ssids"][0]["ssid"] == "Lab"
    assert [p.name for p in repo.list()] == ["Bancada"]
    assert repo.delete("Bancada") is True
    assert repo.get("Bancada") is None

def test_persisted_profile_rejects_wifi_password(tmp_path: Path):
    commands = FakeCommands()
    service = ProfileService(FakeSessions(), commands, JsonProfileRepository(tmp_path/'profiles.json'), {'huawei': HuaweiProfileTranslator()})
    import pytest
    with pytest.raises(ValueError, match='Secrets are not persisted'):
        service.save({'name':'unsafe','wifi':{'ssids':[{'id':1,'password':'supersecret'}]}})
    assert not (tmp_path/'profiles.json').exists()


def test_multiple_radios_dns_addresses_and_legacy_power_are_translated():
    profile=NetworkProfile.from_dict({'name':'Dual','wifi':{'radios':[{'band':'2.4GHz','channel':'6'},{'band':'5GHz','power':100}]},'dns':{'servers':['1.1.1.1','8.8.8.8','2606:4700:4700::1111']}})
    ops=HuaweiProfileTranslator().translate(profile)
    assert len(ops)==3
    assert ops[1].args[0]['tx_power']==100 and 'power' not in ops[1].args[0]
    assert ops[2].args[0]=={'ipv4_1':'1.1.1.1','ipv4_2':'8.8.8.8','ipv6_1':'2606:4700:4700::1111'}


def test_dns_profile_does_not_silently_drop_excess_or_send_empty_config():
    import pytest
    with pytest.raises(ValueError):ZTEProfileTranslator().translate(NetworkProfile.from_dict({'name':'Too many','dns':{'servers':['1.1.1.1','8.8.8.8','9.9.9.9']}}))
    assert ZTEProfileTranslator().translate(NetworkProfile.from_dict({'name':'Empty','dns':{'servers':[]}}))==[]


def test_transient_profile_password_is_applied_without_persistence(tmp_path):
    commands=FakeCommands();repository=JsonProfileRepository(tmp_path/'profiles.json')
    service=ProfileService(FakeSessions(),commands,repository,{'huawei':HuaweiProfileTranslator()})
    service.save({'name':'Temporary','wifi':{'ssids':[{'id':'1','ssid':'Home'}]}})
    result=service.apply('Temporary',secrets={'1':'temporary-secret'})
    assert result['applied']==1
    assert commands.calls[0][2][1]['password']=='temporary-secret'
    assert 'temporary-secret' not in repository.path.read_text()


def test_profile_preview_reports_current_and_desired_values(tmp_path):
    class Q:
        def wifi(self):return {'networks':[{'id':'1','ssid':'Before','ativo':False}], 'radios':[]}
    service=ProfileService(FakeSessions(),FakeCommands(),JsonProfileRepository(tmp_path/'profiles.json'),{'huawei':HuaweiProfileTranslator()},queries=Q())
    preview=service.preview({'name':'Diff','wifi':{'ssids':[{'id':'1','ssid':'After','enabled':True}]}})
    changes=preview['operations'][0]['changes']
    assert changes[0]['current']=='Before' and changes[0]['desired']=='After'
    assert changes[1]['current']=='Não' and changes[1]['desired']=='Sim'


def test_uncertain_profile_result_is_not_counted_as_applied(tmp_path):
    class Commands:
        def execute(self,*args,**kw):return {'success':False,'uncertain':True}
    service=ProfileService(FakeSessions(),Commands(),JsonProfileRepository(tmp_path/'profiles.json'),{'huawei':HuaweiProfileTranslator()})
    result=service.apply({'name':'Uncertain','wifi':{'ssids':[{'id':'1','ssid':'Home'}]}})
    assert result['uncertain']==1 and result['applied']==0 and result['verified']==0
