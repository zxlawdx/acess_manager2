"""Evidence based findings. Missing measurements never become zero or faults."""
from copy import deepcopy
import math
import re

DEFAULT_THRESHOLDS = {'rssi_excellent': -55, 'rssi_good': -67, 'rssi_attention': -74,
                      'rssi_weak': -79, 'snr_warning': None, 'cpu_warning': None,
                      'memory_warning': None, 'temperature_warning': None,
                      'ethernet_expected_bps': None, 'optical': None}


def number(value):
    try:
        result = float(value)
        return result if math.isfinite(result) else None
    except (TypeError, ValueError):
        return None


def speed(value):
    raw = value
    match = re.fullmatch(r'\s*([\d.]+)\s*([kmg]?)\s*(?:b(?:it)?(?:p|/)?s)?\s*', str(value), re.I)
    bps = None
    if match:
        factor = {'': 1, 'k': 1000, 'm': 1000000, 'g': 1000000000}[match[2].lower()]
        # Bare port speeds in existing providers are Mbps, explicit bps has its own field.
        bps = int(float(match[1]) * (factor if match[2] else 1000000))
    display = None if bps is None else f'{bps / (1e9 if bps >= 1e9 else 1e6):g} {"Gbps" if bps >= 1e9 else "Mbps"}'
    return {'speed_bps': bps, 'speed_display': display, 'raw': raw}


def rssi_quality(value, thresholds=None):
    t = {**DEFAULT_THRESHOLDS, **(thresholds or {})}
    value = number(value)
    if value is None: return 'unknown'
    for key, label in [('rssi_excellent', 'excellent'), ('rssi_good', 'good'),
                       ('rssi_attention', 'attention'), ('rssi_weak', 'weak')]:
        if value >= t[key]: return label
    return 'critical'


def identity(row):
    mac = re.sub('[^0-9a-f]', '', str(row.get('mac') or '').lower())
    return mac if len(mac) == 12 else str(row.get('id') or row.get('native_id') or '')


def rows(value, *keys):
    if isinstance(value, list): return value
    if isinstance(value, dict):
        for key in keys:
            if isinstance(value.get(key), list): return value[key]
    return []


def evaluate(snapshot, thresholds=None, model_thresholds=None):
    data = deepcopy(snapshot)
    t = {**DEFAULT_THRESHOLDS, **(thresholds or {})}
    findings = []
    def finding(code, severity, category, subject, title, evidence):
        findings.append(dict(code=code, severity=severity, category=category, subject=subject,
                             title=title, detail=title, evidence=evidence))
    optical = data.get('optical', {})
    if isinstance(optical, dict) and optical.get('capability') != 'UNSUPPORTED':
        limits = optical.get('thresholds') or model_thresholds or t['optical']
        rx = number(optical.get('rx_dbm'))
        optical['classification'] = 'unknown'
        if rx is not None and isinstance(limits, dict):
            low, high = number(limits.get('critical_low')), number(limits.get('critical_high'))
            warning_low, warning_high = number(limits.get('warning_low')), number(limits.get('warning_high'))
            severity = 'unknown' if all(v is None for v in (low, high, warning_low, warning_high)) else 'critical' if (low is not None and rx <= low) or (high is not None and rx >= high) else 'warning' if (warning_low is not None and rx <= warning_low) or (warning_high is not None and rx >= warning_high) else 'ok'
            optical['classification'] = severity
            if severity in {'warning','critical'}: finding('OPTICAL_RX_' + severity.upper(), severity, 'optical', 'pon', 'Potência óptica fora da faixa configurada', {'rx_dbm': rx, 'thresholds': limits})
        for alarm in ('los', 'lof'):
            if str(optical.get(alarm)).lower() in {'true', '1', 'yes', 'sim', 'active'}:
                finding('OPTICAL_' + alarm.upper(), 'critical', 'optical', 'pon', f'Alarme {alarm.upper()} ativo', {alarm: optical[alarm]})
    clients = rows(data.get('wifi'), 'clients')
    for row in clients:
        rssi = row.get('rssi_dbm', row.get('rssi'))
        row['quality'] = rssi_quality(rssi, t)
        subject = identity(row)
        if row['quality'] in {'attention', 'weak', 'critical'}:
            severity = 'critical' if row['quality'] == 'critical' else 'warning'
            finding('WIFI_RSSI_' + severity.upper(), severity, 'wifi', subject, 'Sinal Wi-Fi abaixo do recomendado', {'rssi_dbm': number(rssi), 'band': row.get('band', row.get('banda'))})
        snr = number(row.get('snr_db', row.get('snr')))
        if snr is not None and t['snr_warning'] is not None and snr < t['snr_warning']:
            finding('WIFI_LOW_SNR', 'warning', 'wifi', subject, 'SNR abaixo da faixa configurada', {'snr_db': snr})
    for row in rows(data.get('ethernet'), 'ports', 'interfaces'):
        normalized = speed(row.get('speed', row.get('velocidade')))
        if row.get('speed_bps') is not None:
            bps = number(row['speed_bps'])
            normalized = {'speed_bps': bps, 'raw': row.get('speed'), 'speed_display': f'{bps / (1e9 if bps >= 1e9 else 1e6):g} {"Gbps" if bps >= 1e9 else "Mbps"}' if bps is not None else None}
        row.update(normalized)
        active = str(row.get('link', row.get('status', row.get('up')))).lower() in {'up', 'true', '1', 'online', 'connected', 'ativo'}
        expected = number(row.get('expected_speed_bps', t['ethernet_expected_bps']))
        subject = str(row.get('id') or row.get('name') or row.get('port') or '')
        if active and expected and row['speed_bps'] is not None and row['speed_bps'] < expected:
            finding('ETHERNET_NEGOTIATION_LOW', 'warning', 'ethernet', subject, 'Negociação abaixo da velocidade esperada; avaliar equipamento remoto, cabo ou porta', {'speed_bps': row['speed_bps'], 'expected_speed_bps': expected})
        if active and str(row.get('duplex')).lower() in {'half', 'half duplex', 'half-duplex'}:
            finding('ETHERNET_HALF_DUPLEX', 'warning', 'ethernet', subject, 'Porta ativa em Half Duplex', {'duplex': row['duplex']})
    resources = data.get('resources', {})
    for field, limit_key, code in [('cpu', 'cpu_warning', 'CPU'), ('memory', 'memory_warning', 'MEMORY'), ('temperature', 'temperature_warning', 'TEMPERATURE')]:
        value = number(resources.get({'cpu':'cpu_percent','memory':'memory_percent','temperature':'temperature_c'}[field],resources.get(field)))
        if value is not None and t[limit_key] is not None and value >= t[limit_key]:
            finding('DEVICE_HIGH_' + code, 'warning', 'resources', 'device', 'Recurso acima do limite configurado', {field: value, 'threshold': t[limit_key]})
    data['findings'] = findings
    data['status'] = 'problems' if any(f['severity'] == 'critical' for f in findings) else 'attention' if findings else 'partial' if data.get('unavailable') else 'normal'
    data['visit_suggestion'] = any(f['code'].startswith('OPTICAL_') and f['severity'] == 'critical' for f in findings)
    return data


def compare(initial, final):
    changes = []
    for category in ('optical', 'ethernet', 'wan', 'dhcp', 'dns', 'resources'):
        if initial.get(category) != final.get(category):
            changes.append({'category': category, 'before': initial.get(category), 'after': final.get(category)})
    before = {identity(row): row for row in rows(initial.get('wifi'), 'clients') if identity(row)}
    after = {identity(row): row for row in rows(final.get('wifi'), 'clients') if identity(row)}
    for key in sorted(before.keys() | after.keys()):
        if before.get(key) != after.get(key):
            changes.append({'category': 'wifi', 'subject': key, 'before': before.get(key), 'after': after.get(key)})
    return changes


class SupportSession(dict):
    """JSON-compatible report entity with a credential-safe developer representation."""
    def __repr__(self):
        return '<SupportSession>'
    __str__ = __repr__
