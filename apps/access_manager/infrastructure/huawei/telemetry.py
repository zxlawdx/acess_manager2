"""Read-only Huawei schemas evidenced in legacy HG8145X6, ONTWatch and ONT stats.

Explicit schemas are a fallback only for definition-free constructor replies;
shape, object domain and numeric fields must match before consuming a record.
They do not prove model compatibility or enable any writer.
"""
import re
from apps.access_manager.infrastructure.huawei.captured import parse_huawei_js_records

WLAN_DOMAIN = re.compile(r'^InternetGatewayDevice\.LANDevice\.\d+\.WLANConfiguration\.(\d+)(?:\..*)?$')
WAN_DOMAIN = re.compile(r'^InternetGatewayDevice\.WANDevice\.\d+\.WANConnectionDevice\.\d+\.WAN(?:IP|PPP)Connection\.\d+(?:\.Stats)?$')


def numeric(value):
    try:
        return int(str(value))
    except (TypeError, ValueError):
        return None


def ssid_inventory(source):
    out = {}
    for row in parse_huawei_js_records(source):
        args = row.get('_args') or []
        if row.get('_constructor') != 'stWlanInfo' or len(args) < 6:
            continue
        match = WLAN_DOMAIN.fullmatch(str(args[0]))
        if match and str(args[5]) in ('2.4GHz', '5GHz', '2.4G', '5G'):
            out[int(match.group(1))] = {'ssid': str(args[2]), 'band': str(args[5])}
    return out


def association_records(source):
    out = []
    for row in parse_huawei_js_records(source):
        args = row.get('_args') or []
        if row.get('_constructor') != 'stAssociatedDevice' or len(args) < 16:
            continue
        match = WLAN_DOMAIN.fullmatch(str(args[0]))
        if not match or not re.fullmatch(r'(?:[0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}',str(args[1])):
            continue
        values = [numeric(x) for x in args[2:9]]
        if values[3] is None or not -130 <= values[3] <= 0 or (values[5] is not None and not 0 <= values[5] <= 100):
            continue
        # Constructor definitions take precedence over positional fallback.
        if any(k in row for k in ('MACAddress','AssociatedDeviceMACAddress','RSSI','SignalStrength')):
            continue
        out.append({'Domain':str(args[0]), 'AssociatedDeviceMACAddress':str(args[1]),
                    'HostName':str(args[14]), 'IPAddress':str(args[13]),
                    'RxRate':values[1], 'TxRate':values[2], 'RSSI':values[3], 'SNR':values[5],
                    'Interface':'WLAN'+match.group(1), 'Status':'Associated',
                    '_constructor':'stAssociatedDevice', 'wlan_index':int(match.group(1))})
    return out


def counter_records(source):
    out = []
    for row in parse_huawei_js_records(source):
        args = row.get('_args') or []
        kind = row.get('_constructor')
        if kind == 'stPacketInfo' and len(args) >= 5 and WLAN_DOMAIN.fullmatch(str(args[0])):
            mapping = {'tx_bytes':1,'tx_packets':2,'rx_bytes':3,'rx_packets':4}
            scope = 'wifi'
        elif kind == 'WaninfoStats' and len(args) >= 11 and WAN_DOMAIN.fullmatch(str(args[0])):
            mapping = {'tx_bytes':1,'rx_bytes':2,'tx_packets':3,'rx_packets':4,'tx_discard':7,'rx_discard':8,'tx_errors':9,'rx_errors':10}
            scope = 'wan'
        else:
            continue
        counters = {key:numeric(args[index]) for key,index in mapping.items()}
        if (counters.get('rx_bytes') is None and counters.get('tx_bytes') is None) or any(v is not None and v < 0 for v in counters.values()):
            continue
        out.append({'source':scope,'identity':str(args[0]),'counters':{k:v for k,v in counters.items() if v is not None},'evidence':'observed_constructor_schema'})
    return out


class HuaweiTelemetryReader:
    def __init__(self, captured): self.captured = captured
    def traffic(self):
        sources = []
        for path in ('/html/amp/wlaninfo/wlaninfo.asp', '/html/bbsp/common/get_wan_list_ipwanstat.asp', '/html/bbsp/common/get_wan_list_pppwanstat.asp'):
            try: sources.extend(counter_records(self.captured._page(path)))
            except Exception: continue
        return sources
