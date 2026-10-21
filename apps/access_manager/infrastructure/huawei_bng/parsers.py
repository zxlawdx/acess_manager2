"""Conservative label parsers; unknown or tabular shapes fail closed.

Synthetic fixtures validate mechanics only, not a particular VRP release.
"""
import ipaddress
import re
from apps.access_manager.domain.subscribers import SubscriberSession
from .errors import BngError


def labels(text):
    result = {}
    for line in text.splitlines():
        match = re.match(r'^\s*([A-Za-z][A-Za-z0-9 /()_-]*?)\s*:\s*(.*?)\s*$', line)
        if match: result[re.sub(r'[^a-z0-9]', '', match[1].lower())] = match[2]
    return result


def system(text):
    firmware = re.search(r'V\d{3}R\d{3}C\d{2}(?:SPC\d+)?', text)
    model = re.search(r'NetEngine\s*8000\s*M8\b', text, re.I)
    if not firmware or not model: raise BngError('PARSE_UNKNOWN')
    return {'manufacturer': 'Huawei', 'model': 'NetEngine 8000 M8',
            'firmware': firmware[0], 'validation': 'PHYSICAL_VALIDATION_PENDING'}


def subscriber(text):
    if len(re.findall(r'^\s*User\s*ID\s*:',text,re.M|re.I))!=1: raise BngError('PARSE_UNKNOWN')
    d = labels(text)
    username = d.get('username')
    uid = d.get('userid')
    if not username or not uid or not re.fullmatch(r'[0-9]{1,12}', uid):
        # Absence is not proof of OFFLINE, including empty or unfamiliar output.
        raise BngError('PARSE_UNKNOWN')
    def addresses(*keys):
        values=[]
        for key in keys:
            value=d.get(key)
            if value and value not in {'-', '--'}:
                try: values.append(str(ipaddress.ip_address(value)))
                except ValueError: raise BngError('PARSE_UNKNOWN') from None
        return values
    v4=addresses('ipaddress','ipv4address')
    gw=addresses('gateway','gatewayaddress')
    if any(':' in a for a in v4+gw): raise BngError('PARSE_UNKNOWN')
    dns=addresses('primarydns','secondarydns','primarydnsserver','secondarydnsserver')
    def vlan(key):
        value=d.get(key)
        if value in {None,'-','--'}: return None
        if not value.isdigit() or not 0 <= int(value) <= 4094: raise BngError('PARSE_UNKNOWN')
        return int(value)
    state=d.get('userstate',d.get('state'))
    state=state.upper() if state and state.upper() in {'ONLINE','OFFLINE'} else None
    return SubscriberSession(username=username,user_id=uid,session_id=uid,state=state,
        domain=d.get('domain'),access_type=d.get('accesstype'),interface=d.get('interface'),
        physical_interface=d.get('physicalinterface'),mac=d.get('macaddress'),
        outer_vlan=vlan('pevlan'),inner_vlan=vlan('cevlan'),
        ipv4_address=v4[0] if v4 else None,gateway_ipv4=gw[0] if gw else None,
        dns_v4=[a for a in dns if ':' not in a],dns_v6=[a for a in dns if ':' in a],
        ipv6_addresses=addresses('ipv6address')).public()
