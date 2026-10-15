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
              'routing_instance':r'[A-Za-z0-9_][A-Za-z0-9_.:-]{0,126}'}
    if not re.fullmatch(patterns[kind],value):raise ValueError('Identificador Junos inválido.')
    return value

CATALOG={'facts':'show version','uptime':'show system uptime','chassis':'show chassis hardware',
         'interfaces':'show interfaces terse','resources':'show chassis routing-engine',
         'subscriber_probe':'show subscribers client-type pppoe count'}

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
    if feature=='subscriber_detail':return OperationalRequest(f'show subscribers id {identifier(value,"session")} extensive',feature)
    if feature=='pppoe':return OperationalRequest(f'show pppoe interfaces {identifier(value,"interface")} detail',feature)
    if feature=='aaa':return OperationalRequest(f'show network-access aaa subscribers session-id {identifier(value,"session")} detail',feature)
    if feature=='interface':return OperationalRequest(f'show interfaces {identifier(value,"interface")} extensive',feature)
    raise ValueError('Consulta Juniper não reconhecida.')


def validate_request(item):
    if not isinstance(item,OperationalRequest):raise ValueError('Consulta tipada obrigatória.')
    # A second boundary prevents forged command objects reaching exec_command.
    if item.command in CATALOG.values():return
    patterns=(r'ping [0-9a-fA-F:.]+ count 4 wait 1 no-resolve(?: routing-instance [A-Za-z0-9_][A-Za-z0-9_.:-]{0,126})?',
        r'traceroute [0-9a-fA-F:.]+ ttl 8 wait 1 no-resolve(?: routing-instance [A-Za-z0-9_][A-Za-z0-9_.:-]{0,126})?',r'show subscribers user-name (?:brd|cdy|364)_[0-9]{1,64} extensive',
        r'show subscribers address [0-9a-fA-F:.]+ extensive',r'show subscribers id [0-9]{1,32} extensive',
        r'show pppoe interfaces [A-Za-z][A-Za-z0-9_.:/-]{0,126} detail',
        r'show network-access aaa subscribers session-id [0-9]{1,32} detail',
        r'show interfaces [A-Za-z][A-Za-z0-9_.:/-]{0,126} extensive')
    if not any(re.fullmatch(p,item.command) for p in patterns):raise ValueError('Comando fora do catálogo de leitura.')
