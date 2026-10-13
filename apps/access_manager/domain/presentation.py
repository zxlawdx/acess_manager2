"""Human presentation contracts. Provider protocol fields stay in advanced."""
import re


def value(row, *names):
    for name in names:
        v = row.get(name)
        if v is not None and v != '':
            if isinstance(v,str) and re.search(r'\bgetValue\s*\(',v):
                continue
            return v
    return None


def dhcp_view(data):
    basic=data.get('basic') or data
    return {'enabled': boolean(value(basic,'ServerEnable','enabled')),
            'lan_ip':value(basic,'IPAddr','lan_ip'), 'mask':value(basic,'SubnetMask','SubMask','mask'),
            'pool_start':value(basic,'MinAddress','pool_start'), 'pool_end':value(basic,'MaxAddress','pool_end'),
            'lease_seconds':value(basic,'LeaseTime','lease_time'),
            'dns1':value(basic,'DNSServer1','dns1'), 'dns2':value(basic,'DNSServer2','dns2'),
            'leases':data.get('leases') or [], 'reservations':[{'id':value(r,'id','_InstID'),'name':value(r,'name','Name'),'ip':value(r,'ip','IPAddr','IPAddress'),'mac':value(r,'mac','MACAddr','MACAddress')} for r in data.get('reservations') or []], 'advanced':data}


def boolean(v):
    if v is None:return None
    if v is True or str(v).lower() in ('1','true','enabled','enable','up'):return True
    if v is False or str(v).lower() in ('0','false','disabled','disable','down'):return False
    return None


def wan_view(row):
    return {'name':value(row,'nome','name','display_name'), 'status':value(row,'status','connection_status'),
            'connection_type':value(row,'wan_type','connection_type','tipo'),
            'ipv4':value(row,'ip','ipv4'), 'ipv6':value(row,'ipv6','ipv6_address'),
            'gateway':value(row,'gateway'), 'vlan':value(row,'vlan','vlan_id'),
            'username':value(row,'username','pppoe_username'), 'service':value(row,'services','service'),
            'dns':value(row,'dns','DNSServers') or [v for v in [row.get('dns1'),row.get('dns2')] if v],
            'mtu':value(row,'mtu'), 'nat':boolean(value(row,'nat','nat_enabled')),
            'uptime':value(row,'uptime','uptime_seconds'), 'prefix':value(row,'ipv6_prefix','prefix'),
            'rx_bytes':value(row,'rx_bytes'), 'tx_bytes':value(row,'tx_bytes'), 'advanced':row}


def device_view(row):
    cpu=value(row,'cpu_percent','cpu_usage')
    if cpu is None and not isinstance(row.get('cpu'),dict):cpu=row.get('cpu')
    return {'manufacturer':value(row,'fabricante','manufacturer','vendor'),
            'model':value(row,'modelo','model'), 'firmware':value(row,'firmware','firmware_extendido'),
            'hardware':value(row,'hardware'), 'serial':value(row,'serial'),
            'uptime_seconds':value(row,'uptime_segundos','uptime_seconds','uptime'),
            'cpu_percent':cpu,
            'memory_percent':value(row,'memoria_percent','memory_percent','memory_usage'),
            'temperature_c':value(row,'temperatura_cpu','temperature_c','temperature'),
            'flash_percent':value(row,'flash_usado_percent','flash_percent'), 'advanced':row}
