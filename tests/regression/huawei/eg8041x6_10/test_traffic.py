from .test_runtime_parity import FixtureClient
from apps.access_manager.infrastructure.huawei.eg8041_runtime import HuaweiEG8041FamilyRuntime
def test_traffic_uses_real_wan_lan_surfaces_not_old_placeholder():
    result=HuaweiEG8041FamilyRuntime(FixtureClient(),model='EG8041X6-10').traffic()
    assert 'wan' in result and 'lan' in result and 'sources' in result
    assert result.get('reason')!='normalized_counter_source_not_proven_for_active_huawei_runtime'
