from .common import *
from apps.access_manager.infrastructure.juniper.settings import JuniperSettings
juniper_settings=JuniperSettings()
@api.post("/session")
def connect(context=None):
    d=body(context)
    def attempt():
        options={}
        if d.get('vendor')=='juniper':
            settings=juniper_settings.read()
            options={'vendor':'juniper','transport':d.get('transport') or settings['preferred_transport'],
                     'port':d.get('port'), 'ssh_port':d.get('ssh_port') or settings['ssh_port'],
                     'netconf_port':d.get('netconf_port') or settings['netconf_port']}
        result=sessions.connect(d.get('host') or d.get('ip'),d.get('username',''),d.get('password',''),
                                https=bool(d.get('https')),model_hint=d.get('model_hint'),attendant=d.get('attendant'),**options)
        if options and result.get('connected'):
            try:juniper_settings.save({'ssh_port':options['ssh_port'],'netconf_port':options['netconf_port'],
                                      'preferred_transport':options['transport']},successful_host=result['session']['host'])
            except OSError:pass  # A read-only settings directory must not invalidate authentication.
        return result
    return safe(attempt)

@api.get("/session")
def status(context=None): return sessions.status()
@api.delete("/session")
def disconnect(context=None): sessions.disconnect(); return {'success':True, **sessions.status()}

@api.post('/session/select')
def select(context=None): return safe(lambda: sessions.select(body(context).get('kind')))

@api.post('/infrastructure/subscribers/cpe-draft')
def cpe_draft(context=None): return safe(lambda: sessions.draft(body(context)))

@api.post('/infrastructure/subscribers/connect-cpe')
def connect_cpe(context=None): return safe(lambda: sessions.connect_cpe(body(context)))

@api.get('/infrastructure/settings')
def connection_settings(context=None): return safe(juniper_settings.read)

@api.post('/infrastructure/settings')
def save_connection_settings(context=None): return safe(lambda: juniper_settings.save(body(context)))

@api.post('/infrastructure/host-key')
def inspect_host_key(context=None):
    from apps.access_manager.infrastructure.juniper.trust import HostTrust
    d=body(context)
    return safe(lambda: HostTrust().inspect(d.get('host'),d.get('port')))

@api.post('/infrastructure/host-key/trust')
def trust_host_key(context=None):
    from apps.access_manager.infrastructure.juniper.trust import HostTrust
    return safe(lambda: HostTrust().accept(body(context)))

@api.post('/infrastructure/subscribers/cpe-port')
def probe_cpe_port(context=None):return safe(lambda:sessions.probe_cpe(body(context)))
