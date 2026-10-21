"""Safe, bounded read telemetry. Values/raw XML/credentials are never recorded."""
from contextvars import ContextVar
import json
import logging
import re
import xml.etree.ElementTree as ET
from .output import JunosCommandResult, detect

from apps.access_manager.infrastructure.common.observability import operation
logger = logging.getLogger('access_manager.juniper.read')
FIELDS = {'request_id','feature','transport','host','port','logical_command','elapsed_ms','lock_wait_ms',
          'response_bytes','output_format','xml_root','exit_status','error_code','retryable','status','timestamp'}


def emit(event, record):
    safe={key:value for key,value in record.items() if key in FIELDS}
    logger.info('%s %s', event, json.dumps(safe, ensure_ascii=True, separators=(',',':')))


def shape(payload):
    raw=payload.raw if isinstance(payload,JunosCommandResult) else payload
    if isinstance(raw,bytes):raw=raw.decode('utf-8','replace')
    if not isinstance(raw,str):return {}
    result={'response_bytes':len(raw.encode('utf-8')),'output_format':detect(raw.strip()),'xml_root':None,
            'exit_status':getattr(payload,'exit_status',None)}
    if len(raw.encode('utf-8'))>4*1024*1024 or re.search(r'<!DOCTYPE|<!ENTITY',raw,re.I):return result
    if result['output_format']=='xml':
        try:
            root=ET.fromstring(raw)
            tag=lambda n:n.tag.rsplit('}',1)[-1] if re.fullmatch(r'[A-Za-z_][A-Za-z0-9_.:-]{0,100}',n.tag.rsplit('}',1)[-1]) else 'unknown'
            result['xml_root']=tag(root)
            result['children']=[tag(child) for child in list(root)[:24]]
        except (ET.ParseError,ValueError):pass
    return result
