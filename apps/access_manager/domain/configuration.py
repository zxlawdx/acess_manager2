"""Protocol-independent validation for configuration intent."""
from ipaddress import ip_address
import re

WAN_LIMITS = {'vlan_id': (1, 4094), 'priority': (0, 7), 'mtu': (576, 1500), 'mru': (576, 1500)}

def validate_wan(changes):
    for key, value in changes.items():
        if isinstance(value, (dict, list)) or len(str(value)) > 4096:
            raise ValueError('Valor de configuração inválido: ' + key)
        if key in {'enabled','nat','default_gateway','forward','vlan_enabled','pass_through','prefix_delegation','slaac','gua','pd'} and not isinstance(value,bool) and str(value) not in {'0','1'}:
            raise ValueError('Estado booleano inválido: ' + key)
        if key=='vlan_id' and str(changes.get('vlan_enabled')) in {'0','False','false'} and str(value) in {'','0'}:continue
        if key in WAN_LIMITS:
            minimum, maximum = WAN_LIMITS[key]
            if not str(value).isdigit() or not minimum <= int(value) <= maximum:
                raise ValueError('Valor fora do intervalo: ' + key)
        if value and key in {'ip_address', 'subnet_mask', 'gateway', 'dns1', 'dns2', 'dns3', 'ipv6_dns1', 'ipv6_dns2', 'ipv6_dns3', 'ipv6_gateway'}:
            address = ip_address(str(value))
            if address.version != (6 if key.startswith('ipv6_') else 4):
                raise ValueError('Família IP inválida: ' + key)
        if key == 'password' and (not str(value).strip() or re.fullmatch(r'[•*●·]+', str(value))):
            raise ValueError('Informe uma senha real ou desmarque para preservar')
