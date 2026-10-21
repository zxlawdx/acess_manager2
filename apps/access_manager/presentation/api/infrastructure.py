"""Infrastructure read intentions follow the existing POST-body API pattern."""
from .common import *

@api.post('/infrastructure/subscribers/lookup')
def subscriber_lookup(context=None):return safe(lambda:queries.infrastructure('subscriber_lookup','lookup_subscribers',body(context)))

@api.post('/infrastructure/subscribers/detail')
def subscriber_detail(context=None):return safe(lambda:queries.infrastructure('subscriber_detail','get_subscriber',body(context)))

@api.post('/infrastructure/subscribers/context')
def subscriber_context(context=None):
    config=body(context)
    return safe(lambda:queries.infrastructure('subscriber_context','subscriber_context',config))

@api.post('/infrastructure/interfaces')
def infrastructure_interfaces(context=None):return safe(lambda:queries.infrastructure('interfaces','get_interfaces',body(context)))

@api.post('/infrastructure/interfaces/detail')
def infrastructure_interface(context=None):return safe(lambda:queries.infrastructure('interface','get_interface',body(context)))

@api.post('/infrastructure/system')
def infrastructure_system(context=None):return safe(lambda:queries.infrastructure('device','get_system',body(context)))

@api.post('/infrastructure/chassis')
def infrastructure_chassis(context=None):return safe(lambda:queries.infrastructure('chassis','get_chassis',body(context)))

@api.post('/infrastructure/resources')
def infrastructure_resources(context=None):return safe(lambda:queries.infrastructure('resources','get_resources',body(context)))

@api.post('/infrastructure/diagnostics')
def infrastructure_diagnostics(context=None):return safe(lambda:queries.infrastructure('diagnostics','diagnostic',body(context)))

@api.post('/infrastructure/health')
def infrastructure_health(context=None):return safe(lambda:queries.infrastructure('health','get_health',body(context)))

@api.post('/infrastructure/interfaces/link')
def infrastructure_link(context=None):return safe(lambda:queries.infrastructure('link','get_link',body(context)))

@api.post('/infrastructure/operations')
def infrastructure_operations(context=None):return safe(lambda:queries.infrastructure('device','get_operation_log',body(context)))

@api.post('/infrastructure/diagnostics/start')
def diagnostic_start(context=None):
    from apps.access_manager.composition import diagnostic_orchestrator
    return safe(lambda:diagnostic_orchestrator.start(body(context).get('query')))

@api.post('/infrastructure/diagnostics/progress')
def diagnostic_progress(context=None):
    from apps.access_manager.composition import diagnostic_orchestrator
    return safe(lambda:diagnostic_orchestrator.progress(body(context).get('id')))

@api.post('/infrastructure/diagnostics/cancel')
def diagnostic_cancel(context=None):
    from apps.access_manager.composition import diagnostic_orchestrator
    return safe(lambda:diagnostic_orchestrator.cancel(body(context).get('id')))
