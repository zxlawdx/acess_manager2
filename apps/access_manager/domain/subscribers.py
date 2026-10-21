"""Typed subscriber search intents; contract identifiers are never integers."""
from dataclasses import dataclass,field,asdict
import ipaddress
import re

PREFIXES=('brd','cdy','364')

@dataclass(frozen=True)
class SubscriberQuery:
    kind:str
    value:str
    candidates:tuple[str,...]

    @classmethod
    def parse(cls,value):
        text=str(value or '').strip()
        if re.fullmatch(r'[0-9]{1,64}',text):return cls('CONTRACT_NUMBER',text,tuple(f'{p}_{text}' for p in PREFIXES))
        if re.fullmatch(r'(brd|cdy|364)_[0-9]{1,64}',text):return cls('PPPOE_USERNAME',text,(text,))
        if re.fullmatch(r'user-id:[0-9]{1,12}',text):
            return cls('USER_ID',text[8:],(text[8:],))
        if re.fullmatch(r'(?:[0-9a-fA-F]{2}[:-]){5}[0-9a-fA-F]{2}',text):
            mac=text.lower().replace('-',':')
            return cls('MAC',mac,(mac,))
        if re.fullmatch(r'serial:[A-Za-z0-9]{8,32}',text):
            return cls('ONT_SERIAL',text[7:],(text[7:],))
        if text in {'brd_','cdy_','364_'}: raise ValueError('Usuário PPPoE incompleto.')
        if re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9_.@-]{0,127}',text) and not re.fullmatch(r'[0-9.]+',text):
            return cls('PPPOE_USERNAME',text,(text,))
        try:
            address=ipaddress.ip_address(text)
            return cls('IPV4' if address.version==4 else 'IPV6',str(address),(str(address),))
        except ValueError:raise ValueError('Informe um contrato numérico, usuário brd_, cdy_, 364_ ou endereço IP válido.') from None

@dataclass(frozen=True)
class SubscriberSession:
    username:str|None=None
    session_id:str|None=None
    state:str|None=None
    interface:str|None=None
    ipv4_address:str|None=None
    ipv6_addresses:list[str]=field(default_factory=list)
    ipv6_prefixes:list[str]=field(default_factory=list)
    attributes:dict=field(default_factory=dict)

    user_id:str|None=None
    domain:str|None=None
    access_type:str|None=None
    physical_interface:str|None=None
    mac:str|None=None
    outer_vlan:int|None=None
    inner_vlan:int|None=None
    ipv4_netmask:str|None=None
    gateway_ipv4:str|None=None
    delegated_ipv6_prefixes:list[str]=field(default_factory=list)
    dns_v4:list[str]=field(default_factory=list)
    dns_v6:list[str]=field(default_factory=list)
    login_time:str|None=None
    uptime:str|None=None
    accounting_id:str|None=None
    auth_state:str|None=None
    accounting_state:str|None=None
    authorization_state:str|None=None
    pool_name:str|None=None
    routing_instance:str|None=None
    qos_profile:str|None=None
    rate_down:float|None=None
    rate_up:float|None=None
    source_device:str|None=None
    source_site:str|None=None

    def public(self):
        match=re.fullmatch(r'(brd|cdy|364)_([0-9]+)',self.username or '')
        return {**self.attributes,**{k:v for k,v in asdict(self).items() if k!='attributes'},'username':self.username,'contract':match[2] if match else None,
                'prefix':match[1] if match else None,'session_id':self.session_id,'state':self.state,
                'interface':self.interface,'ipv4_address':self.ipv4_address,
                'ipv6_addresses':self.ipv6_addresses,'ipv6_prefixes':self.ipv6_prefixes}
