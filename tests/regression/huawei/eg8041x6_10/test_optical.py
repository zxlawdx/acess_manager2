from apps.access_manager.domain.capabilities import SupportStatus as S
from .test_runtime_parity import FixtureClient
from apps.access_manager.infrastructure.huawei.eg8041_runtime import HuaweiEG8041FamilyRuntime
def test_missing_optical_fixture_is_unknown_not_false_unsupported():
    caps={x.name:x for x in HuaweiEG8041FamilyRuntime(FixtureClient(),model='EG8041X6-10').capabilities()}
    assert caps['optical'].read==S.UNKNOWN
