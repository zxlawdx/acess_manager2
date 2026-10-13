"""Merge inventory without dropping association telemetry or inventing status."""
import re


def merge_clients(lan, wifi):
    merged, anonymous = {}, []
    for kind, rows in (("Ethernet", lan), ("Wi-Fi", wifi)):
        for item in rows or []:
            row = dict(item)
            compact = re.sub(r"[^0-9a-f]", "", str(row.get("mac") or "").lower())
            row.setdefault("connection_type", kind)
            if len(compact) != 12:
                anonymous.append(row)
                continue
            mac = ":".join(compact[i:i+2] for i in range(0, 12, 2)).upper()
            current = merged.setdefault(mac, {})
            for key, value in row.items():
                if value not in (None, "", [], {}):
                    if kind == "Wi-Fi" or current.get(key) in (None, "", [], {}):
                        current[key] = value
            current["mac"] = mac
    return [*merged.values(), *anonymous]


def normalize_clients(rows):
    result = []
    for row in rows or []:
        item = dict(row)
        kind = str(item.get('connection_type') or '').lower()
        item['connection_type'] = {'lan':'Ethernet','ethernet':'Ethernet','wifi':'Wi-Fi','wi-fi':'Wi-Fi','mesh':'Mesh'}.get(kind, item.get('connection_type'))
        result.append(item)
    return result
