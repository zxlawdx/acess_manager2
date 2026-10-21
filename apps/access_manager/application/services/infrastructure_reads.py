"""Closed neutral intentions. Each provider owns capability checks and adaptation."""
READS={
    'get_system':'none','get_interfaces':'none','get_interface':'name',
    'get_health':'config','diagnostic':'config','get_link':'config',
    'get_chassis':'none','get_resources':'none','subscriber_context':'config',
    'lookup_subscribers':'query','get_subscriber':'session_id','get_operation_log':'none',
}


def read(provider,intent,config):
    if intent not in READS: raise ValueError('Consulta de infraestrutura não permitida.')
    key=READS[intent]
    args=() if key=='none' else (config,) if key=='config' else (config.get(key),)
    return getattr(provider,intent)(*args)
