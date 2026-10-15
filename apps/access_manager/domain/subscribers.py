"""Typed subscriber search intents; contract identifiers are never integers."""
from dataclasses import dataclass,field
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

    def public(self):
        match=re.fullmatch(r'(brd|cdy|364)_([0-9]+)',self.username or '')
        return {**self.attributes,'username':self.username,'contract':match[2] if match else None,
                'prefix':match[1] if match else None,'session_id':self.session_id,'state':self.state,
                'interface':self.interface,'ipv4_address':self.ipv4_address,
                'ipv6_addresses':self.ipv6_addresses,'ipv6_prefixes':self.ipv6_prefixes}
