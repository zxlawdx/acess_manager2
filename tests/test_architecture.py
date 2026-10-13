from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def test_no_global_write_or_lab_gate():
    forbidden=('writes_enabled','lab_enabled','requires_lab','experimental_enabled')
    roots=[ROOT/'apps/access_manager']
    text='\n'.join(p.read_text(encoding='utf-8') for r in roots for p in r.rglob('*.py'))
    assert all(word not in text for word in forbidden)
def test_presentation_does_not_import_vendor_protocols():
    text='\n'.join(p.read_text(encoding='utf-8') for p in (ROOT/'apps/access_manager/presentation').rglob('*.py'))
    assert 'infrastructure.huawei' not in text and 'infrastructure.zte' not in text
def test_vendors_do_not_import_each_other():
    h='\n'.join(p.read_text(encoding='utf-8') for p in (ROOT/'apps/access_manager/infrastructure/huawei').rglob('*.py'))
    z='\n'.join(p.read_text(encoding='utf-8') for p in (ROOT/'apps/access_manager/infrastructure/zte').rglob('*.py'))
    assert 'infrastructure.zte' not in h
    assert 'infrastructure.huawei' not in z
