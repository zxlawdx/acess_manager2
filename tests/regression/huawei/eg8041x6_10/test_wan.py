from .test_runtime_parity import FixtureClient
from apps.access_manager.infrastructure.huawei.eg8041_runtime import HuaweiEG8041FamilyRuntime
def test_wan_fixture_is_parsed():
    rows=HuaweiEG8041FamilyRuntime(FixtureClient(),model='EG8041X6-10').captured.wan_status()
    assert isinstance(rows,list) and rows

def test_wan_runtime_restores_legacy_normalized_fields():
    rows=HuaweiEG8041FamilyRuntime(FixtureClient(),model='EG8041X6-10').wan_status()
    assert rows
    row=rows[0]
    assert 'object_path' in row and 'connection_type' in row and 'service_type' in row
    assert 'dns' in row and isinstance(row['dns'],list)
