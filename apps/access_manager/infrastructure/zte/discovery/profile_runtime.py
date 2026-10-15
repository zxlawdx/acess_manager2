"""Session-local, bounded, read-only ThinkLua candidate selection."""
import json
import ipaddress
import re
import time
import xml.etree.ElementTree as ET
from requests import HTTPError, Timeout, RequestException
from .profiles import allowed_roots


class ReadFailure(RuntimeError):
    def __init__(self, category):
        self.category = category
        super().__init__('Este firmware não disponibilizou a leitura pelo método conhecido.')



def is_login_view(payload):
    return bool(re.search(r'''SessionTimeout|login_need_refresh|(?:id|name)\s*=\s*["'](?:Frm_Username|Frm_Password|login_username|login_password)["']|<form[^>]+(?:id|name)=["']login''', payload or '', re.I))

def reset_read_state(zte):
    zte._profile_reads = {'selected': {}, 'missing': set(), 'diagnostics': {}, 'payloads': {}, 'form_options': {}}
    zte._menu_context = None


def state(zte):
    if not hasattr(zte, '_profile_reads'):
        reset_read_state(zte)
    return zte._profile_reads


def parse_objects(payload, roots):
    if isinstance(payload,bytes):payload=payload.decode('utf-8','replace')
    if re.search(r'SessionTimeout|login_need_refresh|<html\b|<form[^>]+login', payload or '', re.I):
        raise ReadFailure('login_page_instead_of_data' if re.search(r'<html\b', payload or '', re.I) else 'session_expired')
    if isinstance(payload, (str, bytes)) and payload.lstrip().startswith(('{', '[') if isinstance(payload, str) else (b'{', b'[')):
        try:
            document = json.loads(payload)
        except (ValueError, TypeError):
            raise ReadFailure('invalid_json') from None
        if not isinstance(document, dict):
            raise ReadFailure('wrong_schema')
        document = document.get('ajax_response_xml_root', document)
        if not isinstance(document, dict):
            raise ReadFailure('wrong_schema')
        # Adapt the documented Instance/parameters/path variant to the same
        # strict XML parser. Arbitrary objects never become accepted roots.
        tree = ET.Element('ajax_response_xml_root')
        for name, value in document.items():
            if name not in roots and name not in {'IF_ERRORSTR','IF_ERRORID'}:
                continue
            node = ET.SubElement(tree, name)
            if name.startswith('IF_ERROR'):
                node.text = str(value) if value is not None else ''
                continue
            instances = value.get('Instance') if isinstance(value, dict) else None
            if isinstance(instances, dict): instances = [instances]
            if not isinstance(instances, list):
                raise ReadFailure('wrong_schema')
            for record in instances:
                if not isinstance(record, dict): raise ReadFailure('wrong_schema')
                fields = record.get('parameters', {k:v for k,v in record.items() if k != 'path'})
                if not isinstance(fields, dict): raise ReadFailure('wrong_schema')
                fields = dict(fields)
                if record.get('path') is not None: fields['_InstID'] = record['path']
                instance = ET.SubElement(node, 'Instance')
                for key, value in fields.items():
                    if isinstance(value, (dict, list)): raise ReadFailure('wrong_schema')
                    ET.SubElement(instance, 'ParaName').text = str(key)
                    ET.SubElement(instance, 'ParaValue').text = '' if value is None else str(int(value)) if isinstance(value,bool) else str(value)
        payload = ET.tostring(tree, encoding='unicode')
    try:
        root = ET.fromstring(payload)
    except (ET.ParseError, TypeError):
        raise ReadFailure('invalid_xml') from None
    for node in root.iter():
        node.tag = node.tag.rsplit('}', 1)[-1]
    if root.tag != 'ajax_response_xml_root':
        raise ReadFailure('wrong_schema')
    error = (root.findtext('IF_ERRORSTR') or '').strip()
    if error.lower() in {'sessiontimeout', 'login', 'unauthorized'}:
        raise ReadFailure('session_expired')
    if (root.findtext('IF_ERRORID') or '0').strip() not in {'0', '0000'} or error.upper() not in {'', 'SUCC', 'SUCCESS', 'OK', '0'}:
        raise ReadFailure('firmware_error')
    containers = [n for n in root if n.tag in roots]
    if not containers:
        raise ReadFailure('wrong_schema')
    objects = {}
    for container in containers:
        rows, fragments = [], {}
        def flush():
            if fragments:
                rows.append(dict(fragments)); fragments.clear()
        for instance in container.findall('Instance'):
            fields = {}
            children = list(instance)
            for i, child in enumerate(children[:-1]):
                if child.tag == 'ParaName' and children[i+1].tag == 'ParaValue':
                    fields[(child.text or '').strip()] = children[i+1].text or ''
            if not fields:
                raise ReadFailure('wrong_schema')
            if len(fields) == 1:
                # A repeated field starts a new fragmented record. Never
                # overwrite a second client's MAC/name while aggregating.
                if {k.rsplit('.',1)[-1].casefold() for k in fields} & {k.rsplit('.',1)[-1].casefold() for k in fragments}:
                    flush()
                fragments.update(fields)
            else:
                flush(); rows.append(fields)
        flush()
        objects.setdefault(container.tag, []).extend(rows)
    return objects


def validate_client_objects(objects):
    rows=[row for values in objects.values() for row in values]
    keys={'macaddress','macaddr','mac','ipaddress','ipaddr','ip','hostname','devicename','name'}
    if any(not {k.rsplit('.',1)[-1].casefold() for k in row}.intersection(keys) for row in rows):
        raise ReadFailure('wrong_schema')


def validate_feature_objects(feature, objects):
    if feature.endswith('clients') or feature == 'dhcp_leases':
        validate_client_objects(objects)
        return
    signatures={'wifi_radios':{'Band','Channel','AutoChannelEnabled','RadioStatus'},
        'wifi_ssids':{'ESSID','SSID','Enable'},'wan':{'WANCName','ConnStatus','IPAddress'},
        'lan_ports':{'Port','IFName','Status','Speed'},'dns':{'DomainName','SerIPAddress1','SerIPv6Address1'},
        'dns_hosts':{'HostName','IPAddress'},'dhcp_config':{'ServerEnable','MinAddress','IPAddr'},
        'dmz':{'Enable','InternalClient'},'upnp':{'EnableUPnPIGD'},'tr069':{'URL','Enable'},
        'firewall':{'Level','Enable'},'neighbor_24':{'Essid','Channel','Signal'},'neighbor_5':{'Essid','Channel','Signal'}}
    required={key.casefold() for key in signatures.get(feature,set())}
    # Empty recognized containers are valid. Nonempty unrelated records cannot
    # promote a feature merely because a root name happened to match.
    for name,rows in objects.items():
        if name=='OBJ_CHANNEL_ID':continue
        if any(not required.intersection(k.rsplit('.',1)[-1].casefold() for k in row) for row in rows):raise ReadFailure('wrong_schema')


def _session_failure(error):
    return isinstance(error, ReadFailure) and error.category in {'session_expired', 'login_page_instead_of_data'}


def read_feature(zte, feature):
    profile = zte.read_profile
    candidates = profile.candidates[feature]
    cached = state(zte)['payloads'].get(feature)
    if feature == 'wifi_radios' and cached and time.monotonic()-cached[0] < 2:
        return cached[1], cached[2]
    deadline = time.monotonic() + 12
    for attempt in range(2):
        data = state(zte)
        selected = data['selected'].get(feature)
        ordered = ([selected] if selected else []) + [c for c in candidates if c != selected]
        last = 'wrong_schema'
        try:
            for candidate in ordered:
                if candidate.tag in data['missing'] or (candidate.view,candidate.tag,candidate.params) in data['missing']:
                    last = 'http_404'; continue
                started = time.monotonic()
                if started >= deadline:raise ReadFailure('network_timeout')
                try:
                    if getattr(zte, '_menu_context', None) != candidate.view:
                        try:
                            view = zte.get_view(candidate.view, _request_timeout=max(.1,min(5,deadline-time.monotonic())))
                        except HTTPError as error:
                            if getattr(error.response,'status_code',None) != 404: raise
                            view = ''  # Some firmware serves menuData without its view.
                        if is_login_view(view):
                            raise ReadFailure('session_expired')
                        if candidate.view=='wlanBasic':
                            from apps.access_manager.infrastructure.radio_options import radio_options
                            data['form_options']=radio_options(view)
                        zte._menu_context = candidate.view
                    params=dict(candidate.params)
                    if feature.startswith('neighbor_') and getattr(zte,'session_tmp_token',None):params['_sessionTOKEN']=zte.session_tmp_token
                    payload = zte.get_menu(candidate.tag, _request_timeout=max(.1,min(5,deadline-time.monotonic())), **params)
                    objects = parse_objects(payload, allowed_roots(feature, candidate))
                    if feature=='wifi_radios' and candidate.root not in objects:raise ReadFailure('wrong_schema')
                    rows = [(name, r) for name, values in objects.items() for r in values]
                    validate_feature_objects(feature,objects)
                    data['payloads'][feature] = (time.monotonic(), objects, candidate)
                    data['selected'][feature] = candidate
                    data['diagnostics'][feature] = {'tag': candidate.tag, 'view': candidate.view,
                        'roots': list(objects), 'records': len(rows),
                        'status': 'validated' if rows else 'valid_empty',
                        'elapsed_ms': round((time.monotonic()-started)*1000, 1)}
                    return objects, candidate
                except HTTPError as e:
                    status = getattr(e.response, 'status_code', None)
                    last = 'http_404' if status == 404 else 'http_403' if status == 403 else 'http_error'
                    if status == 404:
                        data['missing'].add(candidate.tag)
                except Timeout:
                    last = 'network_timeout'
                except RequestException:
                    last = 'network_error'
                except ReadFailure as e:
                    if _session_failure(e):
                        raise
                    last = e.category
                    if last == 'wrong_schema': data['missing'].add((candidate.view,candidate.tag,candidate.params))
                data['selected'].pop(feature, None)
                data['diagnostics'][feature] = {'tag':candidate.tag, 'status':last}
            raise ReadFailure(last)
        except ReadFailure as e:
            if not _session_failure(e) or attempt:
                state(zte)['diagnostics'].setdefault(feature,{})['status'] = e.category
                raise
            reset_read_state(zte)
            if not zte.login():
                raise ReadFailure('session_expired') from None
    raise ReadFailure('session_expired')


def clients(zte, feature):
    objects, candidate = read_feature(zte, feature)
    result = []
    for name, rows in objects.items():
        for raw in rows:
            aliases={k.rsplit('.',1)[-1].casefold():v for k,v in raw.items()}
            def first(*keys):
                return next((aliases[k.casefold()] for k in keys if aliases.get(k.casefold()) not in (None,'')),None)
            ip = first('IPAddress','IPAddr','IP')
            ipv6 = first('IPV6Address','IPv6Address','IPv6Addr')
            addresses = []
            for value in re.split(r'[,;\s]+', ipv6 or ''):
                try:
                    if ipaddress.ip_address(value).version == 6:
                        addresses.append(value)
                except ValueError:
                    pass
            kind = 'Wi-Fi' if feature == 'wifi_clients' else 'Ethernet' if feature == 'lan_clients' else None
            result.append(dict(hostname=first('HostName','Hostname','DeviceName','Name'),
                mac=first('MACAddress','MACAddr','MacAddr','MAC'),ip=ip,ipv4=ip,
                ipv6=ipv6,ipv6_addresses=list(dict.fromkeys(addresses)),
                id=first('_InstID','InstanceID','ID'),connection_type=kind,
                interface=first('Interface','Layer2Interface','InterfaceName','PhyPortName','Port'),
                ssid=first('ESSID','SSID'),band=first('Band'),rssi=first('RSSI'),snr=first('SNR'),
                rx_rate=first('RxRate'),tx_rate=first('TxRate'),link_time=first('LinkTime'),
                rx_bytes=first('RXBytes'),tx_bytes=first('TXBytes'),
                noise=first('Noise'),mode=first('Mode'),bandwidth=first('BandWidth','Bandwidth'),mcs=first('MCS'),connect_time=first('ConnectTime'),
                source_endpoint=candidate.tag,source_object=name,source_kind=feature,
                presence='known_lease' if feature == 'dhcp_leases' else 'observed_access_list'))
    return result


def diagnostic(zte):
    # Never return raw values, client identifiers, secrets or exception text.
    return dict(profile=zte.read_profile.name, protocol='thinklua',
                fingerprint=getattr(zte,'profile_fingerprint',{}),
                menu_context=getattr(zte,'_menu_context',None),
                read_endpoints=dict(state(zte)['diagnostics']),
                missing_cached_endpoints=sorted({item if isinstance(item,str) else item[1] for item in state(zte)['missing']}))


def probe_profile(zte, *, max_endpoints=4, start=0):
    features=list(zte.read_profile.candidates)
    start=max(0,min(int(start),len(features)))
    end=min(start+max(1,min(int(max_endpoints),10)),len(features))
    endpoints={}
    for feature in features[start:end]:
        try:
            objects,candidate=read_feature(zte,feature)
            endpoints[feature]={'available':True,'tag':candidate.tag,
                'structure':{name:{'records':len(rows)} for name,rows in objects.items()}}
        except ReadFailure as error:
            endpoints[feature]={'available':False,'reason':error.category}
    return {'model':getattr(zte,'profile_fingerprint',{}).get('model') or 'ZTE','family':zte.read_profile.name,'read_only':True,
            'supported':any(e['available'] for e in endpoints.values()),
            'endpoints':endpoints,'next_offset':end,'total_candidates':len(features),
            'candidate_features':[{'feature':f,'status':'not_tested','writable':False} for f in features if f not in endpoints]}
