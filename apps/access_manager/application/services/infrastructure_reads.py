"""Public read intentions mapped onto existing vendor implementations.

The compatibility adapter keeps Junos-specific methods internal until their
callers migrate. A missing Huawei reader reports pending physical validation.
"""
from apps.access_manager.infrastructure.huawei_bng.errors import BngError


READS={
    'get_system':('device','get_system','none'),
    'get_interfaces':('juniper_interfaces','get_juniper_interfaces','none'),
    'get_interface':('juniper_interface','get_juniper_interface','name'),
    'get_health':('juniper_health','get_juniper_health','config'),
    'diagnostic':(None,'juniper_diagnostic','config'),
    'get_link':(None,'get_juniper_link','config'),
}


def read(provider, intent, config):
    capability, legacy, shape=READS[intent]
    if provider.vendor=='huawei_bng':
        if intent!='get_system': raise BngError('PHYSICAL_VALIDATION_PENDING')
        provider.capabilities.require_read('device')
        return provider.get_system()
    if capability is None: capability='juniper_'+str(config.get('kind'))
    provider.capabilities.require_read(capability)
    args=() if shape=='none' else (config.get('name'),) if shape=='name' else (config,)
    return getattr(provider,legacy)(*args)
