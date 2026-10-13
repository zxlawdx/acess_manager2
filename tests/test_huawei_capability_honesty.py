from apps.access_manager.infrastructure.providers.huawei import HuaweiProvider
from apps.access_manager.infrastructure.huawei.profiles import HuaweiEG8041X7Profile


def test_only_provider_wired_huawei_writes_are_enabled():
    p=HuaweiProvider(); p.profile=HuaweiEG8041X7Profile(); p.model='EG8041X7-10'
    caps=p._build_caps()
    for feature in ('wifi','wifi_radio','dns','dhcp','dmz','tr069','firewall_level','upnp'):
        assert caps.get(feature).write.value == 'SUPPORTED'
        assert caps.get(feature).public()['enabled']['write'] is True
    for feature in ('ipv4_filter','wan_config','sntp'):
        assert caps.get(feature).write.value in {'PARTIAL','UNSUPPORTED'}
        assert caps.get(feature).public()['enabled']['write'] is False
