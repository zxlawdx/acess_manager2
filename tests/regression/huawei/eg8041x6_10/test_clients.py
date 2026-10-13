from apps.access_manager.infrastructure.huawei.eg8041_runtime import HuaweiEG8041FamilyRuntime
class C:
    def protocol_descriptor(self): return {'family':'amp_bbsp'}
    def get_page(self,path): raise RuntimeError(path)
def test_dedup_helpers_normalize_mac():
    assert HuaweiEG8041FamilyRuntime._normalize_mac('aa-bb-cc-dd-ee-ff')=='AA:BB:CC:DD:EE:FF'
