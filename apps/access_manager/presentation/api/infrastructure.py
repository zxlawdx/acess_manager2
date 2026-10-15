"""Infrastructure read intentions follow the existing POST-body API pattern."""
from .common import *

@api.post('/infrastructure/subscribers/lookup')
def subscriber_lookup(context=None):return safe(lambda:queries.infrastructure('subscriber_lookup','lookup_subscribers',body(context)))

@api.post('/infrastructure/subscribers/detail')
def subscriber_detail(context=None):return safe(lambda:queries.infrastructure('subscriber_detail','get_subscriber',body(context)))

@api.post('/infrastructure/subscribers/context')
def subscriber_context(context=None):
    config=body(context)
    return safe(lambda:queries.infrastructure('juniper_pppoe' if config.get('kind')=='pppoe' else 'juniper_aaa','subscriber_context',config))

@api.post('/infrastructure/interfaces')
def infrastructure_interfaces(context=None):return safe(lambda:queries.infrastructure('juniper_interfaces','get_juniper_interfaces',body(context)))

@api.post('/infrastructure/interfaces/detail')
def infrastructure_interface(context=None):return safe(lambda:queries.infrastructure('juniper_interface','get_juniper_interface',body(context)))

@api.post('/infrastructure/system')
def infrastructure_system(context=None):return safe(lambda:queries.infrastructure('device','get_juniper_system',body(context)))

@api.post('/infrastructure/chassis')
def infrastructure_chassis(context=None):return safe(lambda:queries.infrastructure('juniper_chassis','get_juniper_chassis',body(context)))

@api.post('/infrastructure/resources')
def infrastructure_resources(context=None):return safe(lambda:queries.infrastructure('juniper_resources','get_juniper_resources',body(context)))

@api.post('/infrastructure/diagnostics')
def infrastructure_diagnostics(context=None):return safe(lambda:queries.infrastructure('juniper_'+str(body(context).get('kind')),'juniper_diagnostic',body(context)))
