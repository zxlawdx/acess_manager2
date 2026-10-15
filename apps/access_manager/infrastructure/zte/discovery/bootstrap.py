"""Optional identity after authentication; failures are structural evidence.

No auth algorithm, writes, arbitrary tag probes or customer payload storage.
"""
from dataclasses import dataclass
import html
import logging
import re
import xml.etree.ElementTree as ET
from urllib.parse import parse_qs, urlsplit
from requests import HTTPError, RequestException, Timeout
from .profiles import H3601P_V9, allowed_roots, select_profile
from .profile_runtime import ReadFailure, is_login_view, parse_objects, state, validate_client_objects


logger=logging.getLogger(__name__)

def failure_category(error):
    if isinstance(error, HTTPError):
        code=getattr(error.response,'status_code',None)
        return {401:'http_401',403:'http_403',404:'http_404'}.get(code,'http_error')
    if isinstance(error, ReadFailure):return error.category
    if isinstance(error, ET.ParseError):return 'invalid_xml'
    if isinstance(error, Timeout):return 'network_timeout'
    if isinstance(error, RequestException):return 'network_error'
    if 'sessiontimeout' in str(error).lower() or 'view necessária' in str(error).lower():
        return 'session_expired_or_context_missing'
    return 'device_info_unavailable'


def read_direct_identity(client):
    from ..protocol.device import ZTE
    payload=client.get_menu('devmgr_statusmgr_lua.lua',_request_timeout=4)
    objects=parse_objects(payload,('OBJ_DEVINFO_ID','OBJ_CPUMEMUSAGE_ID','OBJ_POWERONTIME_ID'))
    info=ZTE.device_info_from_objects(objects)
    def populated(value):
        return any(populated(v) for v in value.values()) if isinstance(value,dict) else value not in (None,'')
    if not populated(info):
        raise ReadFailure('valid_empty')
    return info


def announced_tags(payload,limit=16):
    """Inventory only. Even an advertised name does not authorize a request."""
    names=set(re.findall(r'_tag=([A-Za-z][A-Za-z0-9_]{0,63}(?:\.lua)?)(?=[&\s\"\'<>]|$)',html.unescape(payload or '')))
    blocked=re.compile(r'login|logout|modeswitch|switchlang|reboot|reset|apply|delete|save|remove|upload|restore|password|token|(?:^|_)set(?:_|$)|(?:^|_)add(?:_|$)',re.I)
    return [{'tag':tag,'type':'menuData' if tag.endswith('.lua') else 'menuView',
             'status':'advertised_not_probed'} for tag in sorted(names) if not blocked.search(tag)][:limit]


def profile_signature(client):
    from .compatibility import scan
    report = scan(client)
    return (H3601P_V9 if report['validated_features'] else None), report


@dataclass
class Bootstrap:
    info: dict
    profile: object
    reader: str | None
    report: dict


def identify(client,model_hint,footer_reader):
    probes={};info={};reader=None;source='unknown';profile_source=None
    try:
        info=client.device_status() or {}
        status='validated' if info else 'valid_empty'
        probes['device_info_standard']={'status':status}
        if info:reader='standard'
        if info.get('modelo'):source='structured_status'
    except Exception as error:
        reason=failure_category(error)
        probes['device_info_standard']={'status':reason}
        logger.info('zte.identify.device_info_unavailable status=%s',reason)
        params=parse_qs(urlsplit(getattr(getattr(error,'response',None),'url','') or '').query)
        is_view=params.get('_type',['menuView'])[0]=='menuView'
        if is_view:probes['statusMgr_view']={'status':reason}
        if reason=='http_404' and is_view:
            try:
                info=read_direct_identity(client);reader='direct'
                probes['device_info_direct']={'status':'validated'}
                if info.get('modelo'):source='structured_direct'
            except Exception as direct_error:
                probes['device_info_direct']={'status':failure_category(direct_error)}
                logger.info('zte.identify.direct_device_info_failed status=%s',failure_category(direct_error))
    structured=reader is not None
    if not info.get('modelo'):
        try:
            footer=footer_reader(client,fetch=False)
            probes['authenticated_root_html']={'status':'identified' if footer else 'no_identity'}
            if footer:info.update(footer);source='HTML_DETECTED'
        except Exception as error:
            probes['authenticated_root_html']={'status':failure_category(error)}
    if not info.get('modelo') and model_hint:
        info['modelo']=model_hint;source='model_hint_unconfirmed'
    model=info.get('modelo') or 'ZTE'
    profile=select_profile(model,info.get('firmware') or info.get('firmware_extendido'))
    if profile:
        profile_source='model_hint_unconfirmed' if source=='model_hint_unconfirmed' else 'model_identity'
        _,scan_report=profile_signature(client);probes.update(scan_report)
    elif not info.get('modelo') or model=='ZTE':
        profile,signature=profile_signature(client);probes.update(signature)
        if profile:profile_source=source='endpoint_signature'
    info.update(modelo=model,identification_source=source)
    identified=source in {'structured_status','structured_direct','HTML_DETECTED'} and model!='ZTE'
    report={'authentication':'success','identity':{'source':source,'model':model,
            'firmware':info.get('firmware') or info.get('firmware_extendido'),
            'device_info_status':probes.get('device_info_direct',probes.get('device_info_standard',{})).get('status'),
            'device_status_available':structured},
        'profile_selection':{'name':profile.name if profile else None,'source':profile_source,
                             'evidence':'validated_shared_endpoint_signature' if profile_source=='endpoint_signature' else 'identity_candidate' if profile else 'not_identified'},
        'connection_states':['AUTHENTICATED']+(['IDENTIFIED'] if identified else [])+(['PROFILE_SELECTED'] if profile else [])+(['FEATURES_VALIDATED'] if profile_source=='endpoint_signature' else []),
        'bootstrap_probes':probes,
        'advertised_tags':announced_tags(getattr(client,'authenticated_root_html',''))}
    return Bootstrap(info,profile,reader,report)
