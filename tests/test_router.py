from apps.access_manager.application.provider_router import ProviderRouter
def test_hint_routes_huawei_without_probe():
    called=[]; r=ProviderRouter(huawei_probe=lambda *a,**k: called.append(1) or False,huawei_models={'EG8041X7-10'}); d=r.decide('192.168.1.1',model_hint='EG8041X7-10'); assert d.vendor=='huawei'; assert called==[]
def test_non_huawei_defaults_to_zte():
    r=ProviderRouter(huawei_probe=lambda *a,**k: False,huawei_models=set()); assert r.decide('192.168.1.1').vendor=='zte'
