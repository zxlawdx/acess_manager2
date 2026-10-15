"""Closed read-only command catalogue; frontend submits intent, never CLI."""
from dataclasses import dataclass
import re
import ipaddress
from apps.access_manager.domain.subscribers import SubscriberQuery

@dataclass(frozen=True)
class OperationalRequest:
    command:str
    feature:str


def identifier(value,kind):
    value=str(value or '')
    patterns={'session':r'[0-9]{1,32}','interface':r'[A-Za-z][A-Za-z0-9_.:/-]{0,126}',
              'filter':r'[A-Za-z0-9_][A-Za-z0-9_.-]{0,254}',
              'routing_instance':r'[A-Za-z0-9_][A-Za-z0-9_.:-]{0,126}'}
    if not re.fullmatch(patterns[kind],value):raise ValueError('Identificador Junos inválido.')
    return value

CATALOG={'facts':'show version','uptime':'show system uptime','chassis':'show chassis hardware',
         'interfaces':'show interfaces "[aeglx]*" media','resources':'show chassis routing-engine',
         'subscriber_probe':'show subscribers client-type pppoe count',
         'radius':'show network-access aaa radius-servers detail',
         'aaa_authentication':'show network-access aaa statistics authentication detail',
         'aaa_accounting':'show network-access aaa statistics accounting detail',
         'aaa_dynamic':'show network-access aaa statistics dynamic-requests',
         'fpc':'show chassis fpc','environment':'show chassis environment'}

def request(feature,*,value=None):
    if feature in {'ping','traceroute'}:
        config=value or {}
        try:address=str(ipaddress.ip_address(str(config.get('target') or '')))
        except ValueError:raise ValueError('Informe um endereço IP para o diagnóstico.') from None
        ri=config.get('routing_instance')
        suffix=' routing-instance '+identifier(ri,'routing_instance') if ri else ''
        command=f'ping {address} count 4 wait 1 no-resolve' if feature=='ping' else f'traceroute {address} ttl 8 wait 1 no-resolve'
        return OperationalRequest(command+suffix,feature)
    if feature in CATALOG:return OperationalRequest(CATALOG[feature],feature)
    if feature=='subscriber_username':
        query=SubscriberQuery.parse(value)
        if query.kind!='PPPOE_USERNAME':raise ValueError('Usuário PPPoE inválido.')
        return OperationalRequest(f'show subscribers user-name {query.value} extensive',feature)
    if feature=='subscriber_address':
        query=SubscriberQuery.parse(value)
        if query.kind not in {'IPV4','IPV6'}:raise ValueError('Endereço IP inválido.')
        return OperationalRequest(f'show subscribers address {query.value} extensive',feature)
    if feature=='lacp':return OperationalRequest(f'show lacp interfaces {identifier(value,"interface")} extensive',feature)
    if feature=='optics':return OperationalRequest(f'show interfaces diagnostics optics {identifier(value,"interface")}',feature)
    if feature=='accounting':return OperationalRequest(f'show subscribers id {identifier(value,"session")} accounting-statistics',feature)
    if feature=='lockout':return OperationalRequest(f'show pppoe lockout {identifier(value,"interface")}',feature)
    if feature=='filter':return OperationalRequest(f'show firewall filter {identifier(value,"filter")}',feature)
    if feature in {'route','fib'}:
        address=str(ipaddress.IPv4Address(value))
        return OperationalRequest(f'show route exact {address}/32 extensive' if feature=='route' else f'show route forwarding-table destination {address}',feature)
    if feature=='subscriber_detail':return OperationalRequest(f'show subscribers id {identifier(value,"session")} extensive',feature)
    if feature=='pppoe':return OperationalRequest(f'show pppoe interfaces {identifier(value,"interface")} detail',feature)
    if feature=='aaa':return OperationalRequest(f'show network-access aaa subscribers session-id {identifier(value,"session")} detail',feature)
    if feature=='interface':return OperationalRequest(f'show interfaces {identifier(value,"interface")} extensive',feature)
    raise ValueError('Consulta Juniper não reconhecida.')


def validate_request(item):
    if not isinstance(item,OperationalRequest):raise ValueError('Consulta tipada obrigatória.')
    # A second boundary prevents forged command objects reaching exec_command.
    if item.command in CATALOG.values():return
    patterns=(r'show lacp interfaces [A-Za-z][A-Za-z0-9_.:/-]{0,126} extensive',r'show interfaces diagnostics optics [A-Za-z][A-Za-z0-9_.:/-]{0,126}',r'show subscribers id [0-9]{1,32} accounting-statistics',r'show pppoe lockout [A-Za-z][A-Za-z0-9_.:/-]{0,126}',
        r'show firewall filter [A-Za-z0-9_][A-Za-z0-9_.-]{0,254}',r'show route exact [0-9.]+/32 extensive',r'show route forwarding-table destination [0-9.]+',r'ping [0-9a-fA-F:.]+ count 4 wait 1 no-resolve(?: routing-instance [A-Za-z0-9_][A-Za-z0-9_.:-]{0,126})?',
        r'traceroute [0-9a-fA-F:.]+ ttl 8 wait 1 no-resolve(?: routing-instance [A-Za-z0-9_][A-Za-z0-9_.:-]{0,126})?',r'show subscribers user-name (?:brd|cdy|364)_[0-9]{1,64} extensive',
        r'show subscribers address [0-9a-fA-F:.]+ extensive',r'show subscribers id [0-9]{1,32} extensive',
        r'show pppoe interfaces [A-Za-z][A-Za-z0-9_.:/-]{0,126} detail',
        r'show network-access aaa subscribers session-id [0-9]{1,32} detail',
        r'show interfaces [A-Za-z][A-Za-z0-9_.:/-]{0,126} extensive')
    if not any(re.fullmatch(p,item.command) for p in patterns):raise ValueError('Comando fora do catálogo de leitura.')


def native_rpc(item):
    """RPC names/parameters supplied by physical display-xml-rpc evidence."""
    validate_request(item)
    import xml.etree.ElementTree as ET
    tokens=item.command.split()
    spec=None
    if item.feature in {'subscriber_username','subscriber_address','subscriber_detail'}:
        name={'subscriber_username':'user-name','subscriber_address':'address','subscriber_detail':'id'}[item.feature]
        spec=('get-subscribers',{name:tokens[3],'extensive':None})
    elif item.feature=='pppoe':spec=('get-pppoe-interface-information',{'interface-name':tokens[3],'detail':None})
    elif item.feature=='aaa':spec=('get-aaa-subscriber-by-session-id',{'id':tokens[5],'detail':None})
    if item.feature=='accounting':spec=('get-subscribers',{'id':tokens[3],'accounting-statistics':None})
    elif item.feature=='lockout':spec=('get-pppoe-lockout-information',{'underlying-interface-name':tokens[3]})
    elif item.feature=='filter':spec=('get-firewall-filter-information',{'filtername':tokens[3]})
    elif item.feature=='route':spec=('get-route-information',{'destination':tokens[3],'extensive':None,'exact':None})
    elif item.feature=='fib':spec=('get-forwarding-table-information',{'destination':tokens[4]})
    if item.feature=='radius':spec=('get-radius-servers-table',{'detail':None})
    elif item.feature.startswith('aaa_'):
        flag={'aaa_authentication':'authentication','aaa_accounting':'accounting','aaa_dynamic':'dynamic-requests'}[item.feature]
        spec=('get-aaa-module-statistics',{flag:None,**({'detail':None} if item.feature!='aaa_dynamic' else {})})
    if spec is None:return None
    root=ET.Element(spec[0])
    for name,value in spec[1].items():ET.SubElement(root,name).text=value
    return ET.tostring(root,encoding='unicode')
