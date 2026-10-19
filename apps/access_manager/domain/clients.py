"""Merge inventory without dropping association telemetry or inventing status."""
import re


def merge_clients(lan, wifi, *, identity_fallback=False):
    merged, anonymous = {}, []
    for kind, rows in (("Ethernet", lan), ("Wi-Fi", wifi)):
        for item in rows or []:
            row = dict(item)
            compact = re.sub(r"[^0-9a-f]", "", str(row.get("mac") or "").lower())
            row.setdefault("connection_type", kind)
            mac = ":".join(compact[i:i+2] for i in range(0, 12, 2)).upper() if len(compact)==12 else None
            identity=mac
            if identity is None and identity_fallback:
                if row.get('id'):identity='id:'+str(row.get('source_endpoint') or '')+':'+str(row['id'])
                elif row.get('ip') or row.get('ipv4'):identity='ip:'+str(row.get('ip') or row.get('ipv4'))
            if identity is None:
                anonymous.append(row)
                continue
            current = merged.setdefault(identity, {})
            for key, value in row.items():
                if value not in (None, "", [], {}):
                    if kind == "Wi-Fi" or current.get(key) in (None, "", [], {}):
                        current[key] = value
            if mac:current["mac"] = mac
    return [*merged.values(), *anonymous]


def normalize_clients(rows):
    result = []
    for row in rows or []:
        item = dict(row)
        kind = str(item.get('connection_type') or '').lower()
        item['connection_type'] = {'lan':'Ethernet','ethernet':'Ethernet','wifi':'Wi-Fi','wi-fi':'Wi-Fi','mesh':'Mesh'}.get(kind, item.get('connection_type'))
        raw = next((item[k] for k in ('CurrentMode', 'wifi_standard_raw', 'sta_mode', 'Mode', 'Standard', 'OperatingStandard', 'PhyMode', 'PHYMode', 'mode', 'modo') if item.get(k) not in (None, '')), None)
        item.update(normalize_wifi_standard(raw))
        for target, aliases in {'bandwidth': ('largura',), 'connected_time': ('connect_time', 'tempo_conectado', 'conectado_desde')}.items():
            if not item.get(target):
                item[target] = next((item[k] for k in aliases if item.get(k) is not None), None)
        result.append(item)
    return result


def normalize_wifi_standard(raw):
    """Only a single reported station mode is evidence; mixed radio modes aren't."""
    value = str(raw or '').strip().lower().replace('802.11', '').replace('wi-fi ', 'wifi')
    aliases = {'b': ('b', None), 'g': ('g', None), 'n': ('n', 4), 'ht': ('n', 4), 'n/ht': ('n', 4),
               'ac': ('ac', 5), 'vht': ('ac', 5), 'ax': ('ax', 6), 'he': ('ax', 6),
               'be': ('be', 7), 'eht': ('be', 7)}
    mode, generation = aliases.get(value, (None, None))
    return {'wifi_standard_raw': raw, 'wifi_standard': '802.11' + mode if mode else None,
            'wifi_generation': generation, 'wifi_mode_family': {'n': 'N', 'ac': 'AC', 'ax': 'AX', 'be': 'BE'}.get(mode, mode.upper() if mode else None)}
