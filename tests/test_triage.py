from apps.access_manager.domain.triage import TriageStatus, evaluate_snapshot


def caps(**states):
    return {name: {'read': state} for name, state in states.items()}


def base(**overrides):
    value = {
        'source_revision': 'rev-1',
        'device': {'cpu_percent': 10},
        'wan': [{'status': 'up', 'ipv4': '100.64.0.2', 'gateway': '100.64.0.1'}],
        'lan': [],
        'dns': {'ipv4_1': '1.1.1.1'},
        'optical': {'rx_dbm': -20, 'los': False},
        'wifi': [],
        'radios': [],
        'clients': [],
        'errors': {},
    }
    value.update(overrides)
    return value


CAPS = caps(device='SUPPORTED', wan='SUPPORTED', lan='SUPPORTED', dns='SUPPORTED',
            optical='SUPPORTED', wifi='SUPPORTED', wifi_radio='SUPPORTED', dns_lookup='SUPPORTED')


def issue_codes(result):
    return {item['code'] for item in result.public()['issues']}


def test_lan_10_mbps_is_warning_but_no_link_is_not_degraded():
    result = evaluate_snapshot(base(lan=[
        {'port': 1, 'link_state': 'up', 'speed': '10 Mbps', 'expected_mbps': 1000},
        {'port': 2, 'link_state': 'down', 'speed': '10 Mbps', 'expected_mbps': 1000},
    ]), capabilities=CAPS)
    assert 'LAN_DEGRADED_1' in issue_codes(result)
    assert 'LAN_DEGRADED_2' not in issue_codes(result)
    assert result.status == TriageStatus.WARNING


def test_lan_100_only_warns_when_expected_is_gigabit():
    normal = evaluate_snapshot(base(lan=[{'port': 1, 'link_state': 'up', 'speed': 100}]), capabilities=CAPS)
    degraded = evaluate_snapshot(base(lan=[{'port': 1, 'link_state': 'up', 'speed': 100, 'expected_mbps': 1000}]), capabilities=CAPS)
    assert 'LAN_DEGRADED_1' not in issue_codes(normal)
    assert 'LAN_DEGRADED_1' in issue_codes(degraded)


def test_dns_configured_and_ont_lookup_failure_is_warning():
    result = evaluate_snapshot(base(dns_lookup={'origin': 'ont', 'success': False, 'status': 'failure'}), capabilities=CAPS)
    assert 'DNS_ONT_LOOKUP_FAILED' in issue_codes(result)


def test_workstation_dns_success_does_not_clear_or_prove_ont_dns():
    result = evaluate_snapshot(base(dns_lookup={'origin': 'workstation', 'success': True, 'addresses': ['1.1.1.1']}), capabilities=CAPS)
    assert 'DNS_ONT_LOOKUP_FAILED' not in issue_codes(result)
    assert result.coverage['dns_lookup'] == 'UNKNOWN'
    assert result.partial is True


def test_optical_normal_is_ok_and_out_of_range_warns_or_critical():
    normal = evaluate_snapshot(base(), capabilities=CAPS)
    bad = evaluate_snapshot(base(optical={'rx_dbm': -31, 'los': False}), capabilities=CAPS)
    assert 'GPON_RX_OUT_OF_RANGE' not in issue_codes(normal)
    assert 'GPON_RX_OUT_OF_RANGE' in issue_codes(bad)
    assert bad.status in {TriageStatus.WARNING, TriageStatus.CRITICAL}


def test_missing_temperature_is_not_critical():
    result = evaluate_snapshot(base(device={'cpu_percent': 15, 'temperature_c': None}), capabilities=CAPS)
    assert result.status != TriageStatus.CRITICAL
    assert not any(item['category'] == 'RECURSOS' for item in result.public()['issues'])


def test_wan_disconnected_is_critical():
    result = evaluate_snapshot(base(wan=[{'status': 'down'}]), capabilities=CAPS)
    assert result.status == TriageStatus.CRITICAL
    assert 'WAN_DISCONNECTED' in issue_codes(result)


def test_snapshot_error_is_partial_not_automatic_failure():
    result = evaluate_snapshot(base(errors={'dns': 'timeout'}, dns=None), capabilities=CAPS)
    assert result.partial is True
    assert result.coverage['dns'] == 'UNKNOWN'
    assert result.status == TriageStatus.UNKNOWN


def test_unsupported_capability_is_reported_as_coverage_not_failure():
    value = dict(CAPS)
    value['optical'] = {'read': 'UNSUPPORTED'}
    result = evaluate_snapshot(base(optical=None), capabilities=value)
    assert result.coverage['optical'] == 'UNSUPPORTED'
    assert result.status != TriageStatus.CRITICAL


def test_wifi_rssi_uses_legacy_thresholds_and_missing_rssi_is_not_error():
    weak = evaluate_snapshot(base(clients=[{'rssi': -82}]), capabilities=CAPS)
    absent = evaluate_snapshot(base(clients=[{'rssi': None}]), capabilities=CAPS)
    assert 'WIFI_RSSI_LOW' in issue_codes(weak)
    assert 'WIFI_RSSI_LOW' not in issue_codes(absent)
