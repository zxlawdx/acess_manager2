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
        from apps.access_manager.infrastructure.juniper.errors import JuniperError
        extra={'request_id':exc.request_id,'health':getattr(exc,'health',None)} if isinstance(exc,JuniperError) else {}
        return {'success':False,'error':{'code':failure['code'],'message':failure['error'],'type':failure['type'],'retryable':failure['retryable'],**extra}}


@api.post('/system/clipboard')
def copy_to_system_clipboard(context=None):
    from apps.access_manager.infrastructure.clipboard import ClipboardError, copy_text

    data = body(context)
    try:
        copy_text(data.get('text', ''))
        return {'success': True}
    except ClipboardError as exc:
        return {
            'success': False,
            'error': {
                'code': 'CLIPBOARD_UNAVAILABLE',
                'message': str(exc),
                'type': 'clipboard',
                'retryable': True,
            },
        }
