from pathlib import Path
from apps.access_manager.infrastructure.huawei.protocol.negotiating_client import _endpoint_from_input, parse_huawei_https_bootstrap
FIX=Path('tests/fixtures/huawei/eg8041x6_10_local')
def test_https_port_80_is_preserved():
    ep=_endpoint_from_input('https://100.64.160.146:80')
    assert ep.scheme=='https' and ep.port==80 and ep.base_url=='https://100.64.160.146:80'
def test_http_bootstrap_to_https_80_is_evidence():
    assert parse_huawei_https_bootstrap((FIX/'http_bootstrap.html').read_text())==80
