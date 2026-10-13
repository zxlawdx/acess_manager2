from __future__ import annotations
from vela.api import api
from apps.access_manager.composition import sessions,commands,queries
from apps.access_manager.application.error_policy import public_error

def body(context):
    if context is None: return {}
    if isinstance(context,dict): return context.get('json') or context.get('body') or context
    return getattr(context,'json',None) or {}

def safe(fn):
    try: return fn()
    except Exception as exc:
        failure=public_error(exc)
        return {'success':False,'error':{'code':failure['code'],'message':failure['error'],'type':failure['type'],'retryable':failure['retryable']}}
