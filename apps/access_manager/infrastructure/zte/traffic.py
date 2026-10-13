"""Read-only ThinkLua counter probes, independent of the advertised model.

Protocol reference: cristianat98/ZTE-Exporter, commit 4bdcffd0b4362514fc7500bb47b4560f794ace6b.
No cumulative totals are converted to rates here; the session sampler owns that.
"""
import re
import xml.etree.ElementTree as ET
from requests.exceptions import RequestException


def _counter(value):
    text = str(value).strip() if value is not None else ''
    return int(text) if re.fullmatch(r'[0-9]+', text) else None


def _objects(client, script, **params):
    xml = client.get_menu(script, **params)
    root = ET.fromstring(xml)
    if root.tag != 'ajax_response_xml_root':
        raise ValueError('Unrecognized counter response')
    error = (root.findtext('IF_ERRORSTR') or '').strip()
    if error not in ('', 'SUCC', 'SUCCESS', 'OK'):
        raise ValueError('Counter probe rejected')
    return client._parse_instances(xml)


def _index(rows):
    # Ambiguous identities must not attach another interface's metadata.
    result = {}
    for row in rows:
        identity = row.get('_InstID')
        if identity:
            result[identity] = row if identity not in result else None
    return result


def _sources(rows, scope, fields, aps=None, bands=None):
    result = []
    for identity, row in _index(rows).items():
        if row is None:
            continue
        counters = {key: _counter(row.get(field)) for key, field in fields.items()}
        if not any(value is not None for value in counters.values()):
            continue
        item = {'source': scope, 'identity': identity, 'counters': counters}
        if scope == 'wifi':
            ap = (aps or {}).get(identity) or {}
            radio = (bands or {}).get(row.get('WLANViewName')) or {}
            if ap.get('ESSID'):
                item['ssid'] = ap['ESSID']
            if radio.get('Band'):
                item['band'] = radio['Band']
            item['label'] = ap.get('ESSID') or 'Wi-Fi'
        else:
            item['label'] = row.get('AliasName') or scope.upper()
        result.append(item)
    return result


def read_counter_surfaces(client):
    sources, unavailable = [], []
    fields = {'rx_bytes': 'BytesReceived', 'tx_bytes': 'BytesSent'}
    for scope, view, script in (
        ('wan', 'ethWanStatus', 'eth_interface_status_lua.lua'),
        ('lan', 'localNetStatus', 'eth_lanstatus_lua.lua'),
        ('wifi', 'localNetStatus', 'wlan_status_lua.lua'),
    ):
        try:
            # Each surface establishes its own context. WAN's second request
            # deliberately follows its interface request without another view.
            client.get_view(view)
            data = _objects(client, script)
            if scope == 'wan':
                try:
                    _objects(client, 'wan_internet_lua.lua', TypeUplink=2, pageType=1)
                except (ValueError, RuntimeError, OSError, RequestException):
                    unavailable.append('wan_status')
            if scope == 'wifi':
                rows = _sources(data.get('OBJ_WLANCONFIGDRV_ID', []), scope,
                    {'rx_bytes': 'TotalBytesReceived', 'tx_bytes': 'TotalBytesSent',
                     'rx_packets': 'TotalPacketsReceived', 'tx_packets': 'TotalPacketsSent'},
                    _index(data.get('OBJ_WLANAP_ID', [])),
                    _index(data.get('OBJ_WLANSETTING_ID', [])))
            else:
                rows = _sources(data.get('OBJ_ETH_ID', []), scope, fields)
            if not rows:
                unavailable.append(scope)
            sources.extend(rows)
        except (ValueError, RuntimeError, ET.ParseError, OSError, RequestException):
            unavailable.append(scope)
    return {'sources': sources, 'unavailable_scopes': unavailable}
