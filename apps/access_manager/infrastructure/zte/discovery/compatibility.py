"""Bounded structural discovery inside the authenticated provider.

No query-bus bypass for callers, no POST, no values in the support report.
Shared endpoint scores identify strategies, never hardware models.
"""
import time
import logging
import json
import re
import xml.etree.ElementTree as ET
logger=logging.getLogger(__name__)
from requests import HTTPError
from .profiles import H3601P_V9, allowed_roots
from .profile_runtime import ReadFailure, is_login_view, parse_objects, state, validate_feature_objects

FEATURES = ('wifi_clients','lan_clients','wan','lan_ports','wifi_ssids','wifi_radios','dhcp_leases')


def structure(payload, known_roots):
    """Only fixed-grammar object names and record counts, including unknowns."""
    nodes={}
    try:
        if payload.lstrip().startswith('{'):
            document=json.loads(payload)
            if not isinstance(document,dict):return {}
            document=document.get('ajax_response_xml_root',document)
            for name,value in document.items():
                if re.fullmatch(r'(?:OBJ_|ID_)[A-Z0-9_]{1,80}|ALLDNSHOST',name):
                    instances=value.get('Instance',[]) if isinstance(value,dict) else []
                    nodes[name]=len(instances) if isinstance(instances,list) else 1 if isinstance(instances,dict) else 0
        else:
            for node in ET.fromstring(payload):
                name=node.tag.rsplit('}',1)[-1]
                if re.fullmatch(r'(?:OBJ_|ID_)[A-Z0-9_]{1,80}|ALLDNSHOST',name):nodes[name]=len(node.findall('Instance'))
    except (ValueError,TypeError,ET.ParseError):return {}
    return {'nodes_seen':nodes,'unknown_nodes':[name for name in nodes if name not in known_roots]}


def scan(client, *, max_endpoints=8, budget_seconds=12, features=FEATURES):
    from .bootstrap import failure_category
    deadline = time.monotonic() + min(20, max(.1, budget_seconds))
    remaining = max(1, min(int(max_endpoints), 18))
    logger.info('zte.bootstrap.start read_only=true max_endpoints=%s',remaining)
    reads = state(client)
    probes, views, validated = {}, {}, []
    scores = {'H288A-like':0, 'F6640-like':0}
    for feature in features:
        for candidate in H3601P_V9.candidates[feature]:
            if remaining <= 0 or time.monotonic() >= deadline: break
            key = candidate.tag
            if key in reads['missing'] or (candidate.view,key,candidate.params) in reads['missing']: continue
            if candidate.view not in views or (views[candidate.view]['status']=='available' and getattr(client,'_menu_context',None)!=candidate.view):
                try:
                    page = client.get_view(candidate.view, _request_timeout=max(.1,min(2,deadline-time.monotonic())))
                    if is_login_view(page): raise ReadFailure('session_expired')
                    if candidate.view=='wlanBasic':
                        from apps.access_manager.infrastructure.radio_options import radio_options
                        reads['form_options']=radio_options(page)
                    views[candidate.view] = {'status':'available'}
                    client._menu_context = candidate.view
                except Exception as error:
                    category = failure_category(error)
                    views[candidate.view] = {'status':category}
                    # Missing menuView is not proof that menuData is missing.
                    if category != 'http_404': break
            elif views[candidate.view]['status'] not in {'available','http_404'}:
                break
            if time.monotonic() >= deadline: break
            remaining -= 1
            logger.info('zte.probe.%s tag=%s',feature,candidate.tag)
            shape={}
            try:
                payload = client.get_menu(candidate.tag, _request_timeout=max(.1,min(2,deadline-time.monotonic())), **dict(candidate.params))
                shape=structure(payload,allowed_roots(feature,candidate))
                objects = parse_objects(payload, allowed_roots(feature,candidate))
                if feature=='wifi_radios' and candidate.root not in objects: raise ReadFailure('wrong_schema')
                validate_feature_objects(feature,objects)
                count = sum(len(rows) for rows in objects.values())
                detail = {'tag':candidate.tag,'view':candidate.view,'roots':list(objects),
                          'records':count,'status':'validated' if count else 'valid_empty',
                          'format':'json' if payload.lstrip().startswith('{') else 'xml',**shape}
                reads['selected'][feature] = candidate
                reads['payloads'][feature] = (time.monotonic(),objects,candidate)
                reads['diagnostics'][feature] = detail
                probes[feature] = dict(detail)
                validated.append(feature)
                logger.info('zte.capability.validated feature=%s records=%s',feature,count)
                if feature == 'lan_clients':
                    for name in scores:scores[name] += 1
                elif feature == 'wifi_clients':
                    scores['F6640-like' if 'OBJ_WLAN_AD_ID' in objects else 'H288A-like'] += 2
                break
            except Exception as error:
                reason = failure_category(error)
                probes[feature] = {'tag':candidate.tag,'view':candidate.view,'status':reason,**shape}
                reads['diagnostics'][feature] = dict(probes[feature])
                if reason == 'http_404':reads['missing'].add(key)
                if reason == 'wrong_schema':reads['missing'].add((candidate.view,key,candidate.params))
                if reason in {'session_expired','login_page_instead_of_data','http_401','http_403'}:break
    logger.info('zte.profile.score h288a_like=%s f6640_like=%s',scores['H288A-like'],scores['F6640-like'])
    best_score = max(scores.values())
    tied = [name for name,score in scores.items() if score == best_score] if best_score else []
    return {'compatibility_scan':{'read_only':True,'profile_scores':scores,
        'best_matching_profile':tied[0] if len(tied)==1 else None,
        'tied_profiles':tied if len(tied)>1 else [],'endpoints':probes,'views':views,
        'remaining_endpoints':remaining,'elapsed_ms':round((time.monotonic()-(deadline-min(20,max(.1,budget_seconds))))*1000)},
        'validated_features':validated}
