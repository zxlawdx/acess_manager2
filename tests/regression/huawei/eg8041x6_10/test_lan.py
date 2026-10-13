from .test_runtime_parity import FixtureClient
from apps.access_manager.infrastructure.huawei.eg8041_runtime import HuaweiEG8041FamilyRuntime
def test_lan_never_uses_duplex_sentinel(monkeypatch):
    r=HuaweiEG8041FamilyRuntime(FixtureClient(),model='EG8041X6-10')
    monkeypatch.setattr(r.captured,'_records',lambda *p:('',[]))
    monkeypatch.setattr(r.captured,'layer3_status',lambda:{'ports':[{'port':1,'enabled':True}]})
    row=r.captured.lan_ports()[0]
    assert row['duplex']=='' and row['admin_state']=='enabled' and row['link_state']=='unknown'
