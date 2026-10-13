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
