"""Namespace-neutral Junos XML parsing, explicit whitelists and no raw export."""
import re
import xml.etree.ElementTree as ET
from apps.access_manager.domain.subscribers import SubscriberSession
from .errors import JuniperError


def parse(payload):
    if not isinstance(payload,(str,bytes)) or len(payload)>4*1024*1024:raise JuniperError('COMMAND_ERROR')
    if re.search(br'<!DOCTYPE|<!ENTITY',payload,re.I) if isinstance(payload,bytes) else re.search(r'<!DOCTYPE|<!ENTITY',payload,re.I):raise JuniperError('COMMAND_ERROR')
    try:root=ET.fromstring(payload)
    except (ET.ParseError,ValueError):raise JuniperError('COMMAND_ERROR') from None
    for node in root.iter():node.tag=node.tag.rsplit('}',1)[-1]
    error=next(iter(root.iter('rpc-error')),None)
    if error is not None:
        tag=error.findtext('error-tag')
        raise JuniperError('PERMISSION_DENIED' if tag=='access-denied' else 'DEVICE_BUSY' if tag in {'in-use','resource-denied'} else 'RPC_ERROR')
    output=first(root,'output')
    if output and re.search(r'permission denied|not authorized',output,re.I):raise JuniperError('PERMISSION_DENIED')
    if next(iter(root.iter('error')),None) is not None:raise JuniperError('COMMAND_ERROR')
    return root


def first(node,*names):
    for name in names:
        for child in node.iter(name):
            value=(child.text or '').strip()
            if value:return value
    return None


def values(node,*names):
    return list(dict.fromkeys((child.text or '').strip() for name in names for child in node.iter(name) if (child.text or '').strip()))


def require(root,*names):
    if not any(next(iter(root.iter(name)),None) is not None for name in names):raise JuniperError('COMMAND_ERROR')


def facts(payload):
    root=parse(payload);require(root,'software-information')
    model=first(root,'product-model');version=first(root,'junos-version')
    packages=[first(p,'comment') for p in root.iter('package-information')]
    if not version:
        for description in packages:
            match=re.search(r'JUNOS.*?\[([^\]]+)\]',description or '',re.I)
            if match:version=match[1];break
    if not model or not version:raise JuniperError('UNSUPPORTED_PLATFORM')
    return {'manufacturer':'Juniper','model':model,'firmware':version,'hostname':first(root,'host-name'),
            'family':'MX' if re.match(r'^(?:v?mx)',model,re.I) else 'SRX' if model.lower().startswith('srx') else 'EX/QFX' if model.lower().startswith(('ex','qfx')) else 'Junos',
            'os':'Junos OS Evolved' if any('evolved' in (x or '').lower() for x in [version,*packages]) else 'Junos OS',
            'serial':first(root,'serial-number'),'uptime_seconds':None,'device_role':'infrastructure','bng_mode':None}

FIELDS={
 'type':('subscriber-type','client-type'), 'ipv4_netmask':('ip-netmask',),
 'ipv6_user_prefix':('ipv6-user-prefix',),'delegated_prefix':('ipv6-delegated-prefix','delegated-prefix'),
 'primary_dns':('primary-dns','primary-dns-address'),'secondary_dns':('secondary-dns','secondary-dns-address'),
 'ipv6_primary_dns':('ipv6-primary-dns','primary-ipv6-dns'),'ipv6_secondary_dns':('ipv6-secondary-dns','secondary-ipv6-dns'),
 'logical_system':('logical-system',),'routing_instance':('routing-instance',),
 'interface_type':('interface-type',),'underlying_interface':('underlying-interface',),
 'mac_address':('mac-address','remote-mac-address'),'vlan_id':('vlan-id',),'stacked_vlan_id':('stacked-vlan-id',),
 'pppoe_session_id':('pppoe-session-id',),'radius_accounting_id':('radius-accounting-id','accounting-session-id'),
 'dynamic_profile_name':('dynamic-profile-name','dynamic-profile'),'dynamic_profile_version':('dynamic-profile-version',),
 'login_time':('login-time',),'session_uptime':('session-uptime','uptime'),
 'agent_circuit_id':('agent-circuit-id','agent-circuit-identifier'),'agent_remote_id':('agent-remote-id','agent-remote-identifier'),
 'interface_set':('interface-set',),'input_filter':('input-filter','ipv4-input-filter-name'),
 'output_filter':('output-filter','ipv4-output-filter-name'),'ipv6_input_filter':('ipv6-input-filter-name',),
 'ipv6_output_filter':('ipv6-output-filter-name',),'effective_shaping_rate':('effective-shaping-rate',),
 'actual_upstream_rate':('actual-upstream-data-rate',),'actual_downstream_rate':('actual-downstream-data-rate',),
 'adjusted_downstream_rate':('adjusted-downstream-data-rate',),'session_timeout':('session-timeout',),
 'idle_timeout':('idle-timeout',),'accounting':('accounting-state',),
 'nat_pool':('nat-pool',),'nat_public_ip':('nat-public-ip-address',),'nat_port_block':('nat-port-block',),
 'nat_allocation_time':('napt-block-allocation-time',),
}


def subscribers(payload):
    root=parse(payload);require(root,'subscribers-information','subscriber-information')
    result=[]
    # Each subscriber stays a separate record, even for repeated usernames.
    for node in root.iter('subscriber'):
        attrs={key:first(node,*tags) for key,tags in FIELDS.items()}
        attrs['service_sessions']=[{'id':first(s,'service-session-id'),'name':first(s,'service-session-name')} for s in node.findall('service-session')]
        attrs['raw_capability_metadata']={'format':'junos_xml','accounting_statistics_unavailable':True}
        result.append(SubscriberSession(username=first(node,'user-name','username'),
            session_id=first(node,'session-id'),state=first(node,'state','subscriber-state'),
            interface=first(node,'interface','interface-name'),ipv4_address=first(node,'ip-address','ipv4-address'),
            ipv6_addresses=values(node,'ipv6-address'),ipv6_prefixes=values(node,'ipv6-prefix'),attributes=attrs).public())
    return result


def uptime(payload):
    root=parse(payload);require(root,'system-uptime-information')
    for parent in root.iter('system-booted-time'):
        for node in parent.iter('time-length'):
            for key,value in node.attrib.items():
                if key.rsplit('}',1)[-1]=='seconds' and str(value).isdigit():return int(value)
    return None


def chassis(payload):
    root=parse(payload);require(root,'chassis-inventory')
    return [{'name':first(n,'name'),'description':first(n,'description'),'serial':first(n,'serial-number'),'part_number':first(n,'part-number')} for n in root.iter() if n.tag in {'chassis','chassis-module','chassis-sub-module'}]


def interfaces(payload):
    root=parse(payload);require(root,'interface-information')
    output=[]
    for node in root.iter():
        if node.tag not in {'physical-interface','logical-interface'}:continue
        # Do not inherit a logical child's state/name/counters as physical data.
        scalar=lambda *tags:next(((n.text or '').strip() for tag in tags for n in node.findall(tag) if (n.text or '').strip()),None)
        output.append({'name':scalar('name'),'admin_state':scalar('admin-status'),'oper_state':scalar('oper-status'),
            'description':scalar('description'),'mtu':scalar('mtu'),'speed':scalar('speed'),'duplex':scalar('link-mode'),
            'mac':scalar('current-physical-address'),'last_flapped':scalar('interface-flapped'),
            'input_bytes':first(node.find('traffic-statistics'),'input-bytes') if node.find('traffic-statistics') is not None else None,
            'output_bytes':first(node.find('traffic-statistics'),'output-bytes') if node.find('traffic-statistics') is not None else None,
            'addresses':values(node,'ifa-local')})
    return output


def pppoe(payload):
    root=parse(payload);require(root,'pppoe-interface-information','pppoe-information')
    fields={'logical_interface':('interface-name','interface'),'state':('state','session-state'),
        'session_id':('session-id','pppoe-session-id'),'remote_mac':('remote-mac','remote-mac-address'),
        'session_uptime':('session-uptime','uptime'),'dynamic_profile':('dynamic-profile',),
        'underlying_interface':('underlying-interface','underlying-interface-name'),'service_name':('service-name',),'ac_name':('ac-name',),
        'agent_circuit_id':('agent-circuit-id',),'agent_remote_id':('agent-remote-id',)}
    return {key:first(root,*tags) for key,tags in fields.items()}


def aaa(payload):
    root=parse(payload);require(root,'aaa-subscriber-information','aaa-subscribers-information','aaa-subscriber-table-details')
    return {key:first(root,*tags) for key,tags in {'session_id':('session-id',),'username':('user-name','username','stripped-username'),
        'state':('authentication-state',),'accounting':('accounting-state',),'accounting_session_id':('accounting-session-id',),
        'session_uptime':('session-uptime',),'routing_instance':('routing-instance',)}.items()}


def diagnostic(payload):
    root=parse(payload);require(root,'ping-results','traceroute-results')
    return {'packets_sent':first(root,'packets-sent'),'packets_received':first(root,'packets-received'),
            'packet_loss_reported':first(root,'packet-loss'),'rtt_average_reported':first(root,'rtt-average'),
            'hops':[{'hop':first(h,'ttl-value'),'addresses':values(h,'ip-address'),
                     'rtt_reported':values(h,'rtt')} for h in root.iter('hop')]}


def resources(payload):
    root=parse(payload);require(root,'route-engine-information')
    return [{key:first(node,*tags) for key,tags in {'slot':('slot',),'state':('mastership-state',),
        'cpu_idle_percent':('cpu-idle',),'memory_used_percent':('memory-buffer-utilization',),
        'temperature':('temperature',),'load_average_1':('load-average-one',),
        'load_average_5':('load-average-five',),'load_average_15':('load-average-fifteen',)}.items()} for node in root.iter('route-engine')]
