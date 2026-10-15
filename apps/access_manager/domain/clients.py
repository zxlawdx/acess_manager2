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
        result.append(item)
    return result
