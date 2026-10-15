from .common import *
@api.post("/session")
def connect(context=None):
    d=body(context); return safe(lambda: sessions.connect(d.get('host') or d.get('ip'),d.get('username',''),d.get('password',''),https=bool(d.get('https')),model_hint=d.get('model_hint'),attendant=d.get('attendant'),**({'vendor':'juniper','transport':d.get('transport') or 'netconf','port':d.get('port')} if d.get('vendor')=='juniper' else {})))
@api.get("/session")
def status(context=None): return sessions.status()
@api.delete("/session")
def disconnect(context=None): sessions.disconnect(); return {'success':True}
