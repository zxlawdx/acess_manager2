"""Namespace-neutral Junos XML parsing, explicit whitelists and no raw export."""
import re
import xml.etree.ElementTree as ET
from apps.access_manager.domain.subscribers import SubscriberSession
from .errors import JuniperError
from .output import unpack


def parse(payload):
    payload, output_format = unpack(payload)
    if output_format == 'error_text':
        if 'no such subscriber' in payload.lower():raise JuniperError('SUBSCRIBER_NOT_FOUND')
        if 'permission' in payload.lower():raise JuniperError('PERMISSION_DENIED')
        raise JuniperError('COMMAND_UNSUPPORTED')
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
    error=next(iter(root.iter('error')),None)
    if error is not None:
        message=(first(error,'message') or '').lower()
        if 'no such subscriber' in message:raise JuniperError('SUBSCRIBER_NOT_FOUND')
        if 'permission' in message or 'not authorized' in message:raise JuniperError('PERMISSION_DENIED')
        if 'syntax' in message or 'unknown command' in message:raise JuniperError('COMMAND_UNSUPPORTED')
        raise JuniperError('REMOTE_ERROR')
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
 'type':('access-type','subscriber-type','client-type'), 'ipv4_netmask':('ip-netmask',),
 'ipv6_user_prefix':('ipv6-user-prefix',),'delegated_prefix':('ipv6-delegated-prefix','delegated-prefix'),
 'primary_dns':('primary-dns','primary-dns-address'),'secondary_dns':('secondary-dns','secondary-dns-address'),
 'ipv6_primary_dns':('ipv6-primary-dns','primary-ipv6-dns'),'ipv6_secondary_dns':('ipv6-secondary-dns','secondary-ipv6-dns'),
 'logical_system':('logical-system',),'routing_instance':('routing-instance',),
 'interface_type':('interface-type',),'underlying_interface':('underlying-interface',),
 'mac_address':('mac-address','remote-mac-address'),'vlan_id':('vlan-id',),'stacked_vlan_id':('stacked-vlan-id',),
 'pppoe_session_id':('pppoe-session-id',),'radius_accounting_id':('radius-accounting-id','accounting-session-id'),
 'dynamic_profile_name':('profile','dynamic-profile-name','dynamic-profile'),'dynamic_profile_version':('profile-version','dynamic-profile-version'),
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


def _subscriber_row(node):
    direct=lambda *tags:next(((n.text or '').strip() for tag in tags for n in node.findall(tag) if (n.text or '').strip()),None)
    # Direct fields only: nested service IDs must never become the parent ID.
    attrs={key:first(node,*tags) for key,tags in FIELDS.items()}
    attrs.update({key:first(node,tag) for key,tag in {
        'underlying_session_id':'underlying-session-id','pfe_flow_id':'pfe-flow-id',
        'ip_pool':'ip-address-pool','ipv6_pool':'ipv6-address-pool',
        'accounting_interval':'accounting-interval'}.items()})
    attrs['dns_ipv4']=values(node,'primary-dns-address','secondary-dns-address')
    attrs['dns_ipv6']=values(node,'domain-name-server-inet6')
    attrs['service_sessions']=[]
    attrs['children']=[]
    attrs['subscriber_session_id']=direct('session-id')
    return SubscriberSession(username=direct('user-name','username'),
        session_id=direct('session-id'),state=direct('state','subscriber-state'),
        interface=first(node,'interface','interface-name'),ipv4_address=first(node,'ip-address','ipv4-address'),
        ipv6_addresses=values(node,'ipv6-address'),ipv6_prefixes=values(node,'ipv6-prefix'),attributes=attrs).public()


def _service(node):
    return {key:first(node,*tags) for key,tags in {
        'id':('service-session-id','session-id'),'name':('service-session-name','service-name','profile'),
        'state':('state','service-state'),'family':('family','service-family'),
        'bandwidth_in':('bandwith_in','bandwidth-in'),'bandwidth_out':('bandwith_out','bandwidth-out'),
        'burst_in':('burst_in',),'burst_out':('burst_out',),
        'input_filter':('ipv4-input-filter-name','input-filter'),
        'output_filter':('ipv4-output-filter-name','output-filter'),
        'ipv6_input_filter':('ipv6-input-filter-name',),'ipv6_output_filter':('ipv6-output-filter-name',),
        'policer_in':('policer_in',),'policer_out':('policer_out',)}.items()}


def subscribers(payload):
    text,kind=unpack(payload)
    if kind=='cli_text':return subscribers_text(text)
    try:root=parse(payload)
    except JuniperError as error:
        if error.code=='SUBSCRIBER_NOT_FOUND':return []
        raise
    require(root,'subscribers-information','subscriber-information')
    result=[];last=None
    for node in root.iter('subscriber'):
        style=next((v for k,v in node.attrib.items() if k.rsplit('}',1)[-1]=='style'),'')
        if style=='count':continue
        if style=='service-session':
            parent_id=first(node,'underlying-session-id')
            parent=next((r for r in result if r['session_id']==parent_id),None) if parent_id else last
            if parent is None:raise JuniperError('COMMAND_ERROR')
            parent['service_sessions'].append(_service(node));continue
        row=_subscriber_row(node)
        if not row['session_id'] and not row['username']:
            # Extensive is a continuation only when a preceding identity exists.
            if style=='extensive' and last is not None:
                for k,v in row.items():
                    if v not in (None,'',[]):last[k]=v
                continue
            raise JuniperError('COMMAND_ERROR')
        existing=next((r for r in result if row['session_id'] and r['session_id']==row['session_id']),None)
        if existing is None and style=='extensive' and last is not None and (not row['username'] or row['username']==last['username']) and (not row['session_id'] or not last['session_id']):existing=last
        if existing is not None:
            for k,v in row.items():
                if v not in (None,'',[]):existing[k]=v
            last=existing
        else:result.append(row);last=row
        last['service_sessions'].extend(_service(n) for n in node.findall('service-session'))
    # DHCPv6 children remain attached to their proven PPPoE parent only.
    parents={r['session_id']:r for r in result if str(r.get('type','')).lower()=='pppoe'}
    output=[]
    for row in result:
        parent=parents.get(row.get('underlying_session_id'))
        if parent is not None:parent['children'].append(row)
        else:output.append(row)
    return output


def subscribers_text(text):
    """Dedicated label-based fallback; unknown table layouts are rejected."""
    if re.search(r'number of subscribers\s*:\s*0\b',text,re.I):return []
    aliases={'user name':'user-name','username':'user-name','type':'access-type','access type':'access-type',
        'session id':'session-id','state':'state','ip address':'ip-address','interface':'interface',
        'underlying interface':'underlying-interface','mac address':'mac-address',
        'routing instance':'routing-instance','login time':'login-time','vlan id':'vlan-id',
        'stacked vlan id':'stacked-vlan-id','dynamic profile':'profile'}
    nodes=[];node=None
    for line in text.splitlines():
        match=re.match(r'^\s*([A-Za-z][A-Za-z0-9 /_-]+):\s*(.*?)\s*$',line)
        if not match:continue
        key=aliases.get(match[1].lower())
        if not key:continue
        if node is None or (key=='user-name' and node.find('user-name') is not None):
            node=ET.Element('subscriber');nodes.append(node)
        ET.SubElement(node,key).text=match[2]
    if not nodes or any(not first(n,'user-name') or not first(n,'session-id') for n in nodes):
        raise JuniperError('COMMAND_ERROR')
    return [_subscriber_row(n) for n in nodes]


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
            'underlying_interface':scalar('underlying-interface'),'description':scalar('description'),'mtu':scalar('mtu'),'speed':scalar('speed'),'duplex':scalar('link-mode'),
            'mac':scalar('current-physical-address'),'last_flapped':scalar('interface-flapped'),
            'input_bytes':first(node.find('traffic-statistics'),'input-bytes') if node.find('traffic-statistics') is not None else None,
            'output_bytes':first(node.find('traffic-statistics'),'output-bytes') if node.find('traffic-statistics') is not None else None,
            'addresses':values(node,'ifa-local')})
    return output


def pppoe(payload):
    root=parse(payload);require(root,'pppoe-interface-information','pppoe-information')
    fields={'logical_interface':('interface-name','interface'),'state':('state','session-state'),
        'pppoe_session_id':('pppoe-session-id','session-id'), 'session_id':('pppoe-session-id','session-id'),'remote_mac':('remote-mac','remote-mac-address'),
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


def accounting(payload):
    root=parse(payload);require(root,'subscribers-information','subscriber-information')
    # Preserve family boundaries. Never turn cumulative values into Mbps.
    rows=[]
    for node in root.iter():
        if not any(node.find(key) is not None for key in ('input-bytes','output-bytes','input-packets','output-packets')):continue
        counters={key:((node.findtext(key.replace('_','-')) or '').strip() or None) for key in ('input_bytes','output_bytes','input_packets','output_packets')}
        if any(v is not None for v in counters.values()):
            rows.append({'family':first(node,'family','address-family'),'cumulative':True,**counters})
    return {'samples':rows,'bitrate_mbps':None}


def route(payload):
    root=parse(payload);require(root,'route-information')
    return {'routes':[{'destination':first(n,'rt-destination'),'protocol':first(n,'protocol-name'),
        'active':next(iter(n.iter('active-tag')),None) is not None,
        'interfaces':values(n,'via'),'next_hops':values(n,'to')} for n in root.iter('rt')]}


def fib(payload):
    root=parse(payload);require(root,'forwarding-table-information')
    return {'entries':[{'destination':first(n,'rt-destination','destination-prefix'),
        'type':first(n,'rt-type'),'interfaces':values(n,'nh-local-interface','nh-interface-name','netif'),
        'next_hops':values(n,'nh-address')} for n in root.iter('route-table-entry')],
        'underlying_interface_equality_required':False}


def firewall_filter(payload):
    root=parse(payload);require(root,'firewall-information','filter-information')
    return {'counters':[{'name':first(n,'policer-name','counter-name'),
        'packets':first(n,'packet-count'),'bytes':first(n,'byte-count'),
        'semantics':'cumulative_counter_action_unconfirmed'} for n in root.iter()
        if n.tag in {'policer','counter'}]}


def lockout(payload,mac=None):
    root=parse(payload);require(root,'pppoe-lockout-information')
    canonical=lambda value:re.sub(r'[^0-9a-f]','',str(value or '').lower())
    matches=[]
    for node in root.iter():
        client=node.find('client-id')
        if client is not None and mac and canonical(client.text)==canonical(mac):
            matches.append({key:first(node,key.replace('_','-')) for key in ('client_id','current_time','elapsed_time','next_time')})
    return {'scope':'underlying_interface','total_clients_in_lockout':first(root,'total-clients-in-lockout'),
            'subscriber_mac':mac,'subscriber_match':bool(matches) if mac else None,'matches':matches}


def radius(payload):
    root=parse(payload);require(root,'radius-servers-information','radius-servers-table','radius-server-information')
    rows=[]
    for node in root.iter():
        if node.tag not in {'radius-server','radius-server-entry','server'}:continue
        row={key:first(node,*tags) for key,tags in {
            'profile':('profile-name','profile'),'address':('server-address','address'),
            'status':('status','server-status'),'authentication_port':('authentication-port','auth-port'),
            'preauthentication_port':('preauthentication-port',),'accounting_port':('accounting-port',)}.items()}
        if row['address']:rows.append(row)
    return rows


def aaa_statistics(payload):
    root=parse(payload);require(root,'aaa-module-statistics','aaa-statistics-information','aaa-module-statistics-information')
    names=('requests','accepts','rejects','radius-failures','no-available-server','invalid-credentials',
        'timeouts','processed-ok','processing-error','silent-drops')
    return {'cumulative':True,'current_incident':None,
            'counters':{name.replace('-','_'):first(root,name) for name in names}}


def lacp(payload):
    root=parse(payload);require(root,'lacp-interface-information')
    rows=[]
    for node in root.iter():
        if node.tag not in {'lag-lacp-protocol','lacp-interface','lacp-member'}:continue
        rows.append({key:first(node,*tags) for key,tags in {
            'interface':('name','interface-name'),'mux_state':('lacp-mux-state','mux-state'),
            'collecting':('lacp-collecting','collecting'),'distributing':('lacp-distributing','distributing'),
            'synchronization':('lacp-synchronization','synchronization'),
            'aggregation':('lacp-aggregation','aggregation')}.items()})
    return rows


def optics(payload):
    root=parse(payload);require(root,'interface-information','optics-diagnostics-information')
    measures={'temperature':('module-temperature',),'voltage':('module-voltage',),
        'bias_current':('laser-bias-current',),'tx_power':('laser-output-power','laser-output-power-dbm'),
        'rx_power':('laser-rx-optical-power','laser-rx-optical-power-dbm','laser-receiver-power')}
    result=[]
    for node in root.iter('physical-interface'):
        lanes=[]
        for lane in node.iter('optics-diagnostics-lane-values'):
            lanes.append({'lane':first(lane,'lane-index'),**{key:first(lane,*tags) for key,tags in measures.items()}})
        # Module values and each lane are distinct; never choose a lane as a module reading.
        diagnostics=node.find('optics-diagnostics')
        direct=lambda tag:((diagnostics.findtext(tag) or '').strip() or None) if diagnostics is not None else None
        alarms={child.tag:(child.text or '').strip() for child in (diagnostics if diagnostics is not None else [])
                if re.fullmatch(r'[a-z0-9-]+-(?:alarm|warning|threshold)',child.tag) and not list(child)}
        result.append({'interface':node.findtext('name'),'temperature':direct('module-temperature'),
            'voltage':direct('module-voltage'),'lanes':lanes,'module_alarm_warning_thresholds':alarms})
    return result


def fpc(payload):
    root=parse(payload);require(root,'fpc-information')
    return [{key:first(n,*tags) for key,tags in {'slot':('slot',),'state':('state',),
        'cpu_utilization':('cpu-total',),'memory_utilization':('memory-heap-utilization',)}.items()} for n in root.iter('fpc')]


def environment(payload):
    root=parse(payload);require(root,'environment-information')
    return [{key:first(n,*tags) for key,tags in {'name':('name',),'class':('class',),
        'status':('status',),'temperature':('temperature',)}.items()} for n in root.iter('environment-item')]
