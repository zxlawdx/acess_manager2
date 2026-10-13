from apps.access_manager.domain.capabilities import SupportStatus as S
from .test_runtime_parity import FixtureClient
from apps.access_manager.infrastructure.huawei.eg8041_runtime import HuaweiEG8041FamilyRuntime
def test_missing_dhcp_fixture_is_unknown_not_unsupported():
    caps={x.name:x for x in HuaweiEG8041FamilyRuntime(FixtureClient(),model='EG8041X6-10').capabilities()}
    assert caps['dhcp'].read==S.UNKNOWN and caps['dhcp'].write==S.UNKNOWN


def test_x6_shared_writers_enabled_only_for_available_endpoints():
    from apps.access_manager.infrastructure.huawei.captured import DHCP_SERVER_PAGE, DHCP_STATIC_PAGE, DNS_PAGE, DNS_HOSTS_PAGE
    client=FixtureClient()
    client.pages.update({page:'<html><body>Authenticated empty configuration</body></html>' for page in (DHCP_SERVER_PAGE,DHCP_STATIC_PAGE,DNS_PAGE,DNS_HOSTS_PAGE)})
    runtime=HuaweiEG8041FamilyRuntime(client,model='EG8041X6-10')
    caps={c.name:c for c in runtime.capabilities()}
    for feature in ('dhcp','dhcp_reservations','dns','dns_hosts','dns_hosts_delete'):
        assert caps[feature].read==S.SUPPORTED
        assert caps[feature].write==S.SUPPORTED
        assert caps[feature].evidence.value!='PHYSICALLY_VALIDATED'


def test_x6_host_writers_do_not_follow_upstream_dns_endpoint():
    from apps.access_manager.infrastructure.huawei.captured import DNS_PAGE
    client=FixtureClient()
    client.pages[DNS_PAGE]='<html><body>DNS settings</body></html>'
    caps={c.name:c for c in HuaweiEG8041FamilyRuntime(client,model='EG8041X6-10').capabilities()}
    assert caps['dns'].write==S.SUPPORTED
    assert caps['dns_hosts'].write==S.UNKNOWN
    assert caps['dns_hosts_delete'].write==S.UNKNOWN
