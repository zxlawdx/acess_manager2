from pathlib import Path
from apps.access_manager.infrastructure.huawei.captured import parse_huawei_js_records
FIX=Path('tests/fixtures/huawei/eg8041x6_10_local')
def test_device_fixture_identifies_x6():
    source=(FIX/'device_brebg2.asp').read_text()
    assert 'EG8041X6-10' in source and parse_huawei_js_records(source)
