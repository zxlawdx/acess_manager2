from contextlib import nullcontext
from apps.access_manager.domain.clients import normalize_clients
from dataclasses import dataclass, field
from apps.access_manager.application.services.traffic import TrafficSampler
@dataclass
class DeviceQueryBus:
    sessions: object
    sampler: TrafficSampler = field(default_factory=TrafficSampler)
    def execute(self, feature, method, *args, **kwargs):
        with getattr(self.sessions, 'operation_lock', nullcontext()):
            p=self.sessions.provider
            p.capabilities.require_read(feature)
            return getattr(p,method)(*args,**kwargs)
    def device(self): return self.execute('device','get_device_info')
    def clients(self): return normalize_clients(self.execute('clients','get_clients'))
    def wifi(self): return self.execute('wifi','get_wifi')
    def wifi_reveal(self): return self.execute('wifi','get_wifi',reveal_password=True)
    def wan(self): return self.execute('wan','get_wan')
    def lan(self): return self.execute('lan','get_lan')
    def dhcp(self): return self.execute('dhcp','get_dhcp')
    def dns(self): return self.execute('dns','get_dns')
    def optical(self): return self.execute('optical','get_optical')
    def traffic(self):
        with getattr(self.sessions, 'operation_lock', nullcontext()):
            data = self.execute('traffic','get_traffic')
            session = self.sessions.session
            return self.sampler.sample(session.session_id, data)

    def dmz(self): return self.execute('dmz','get_dmz')
    def upnp(self): return self.execute('upnp','get_upnp')
    def tr069(self): return self.execute('tr069','get_tr069')
    def firewall(self):
        feature = 'firewall_level' if self.sessions.provider.vendor == 'huawei' else 'firewall'
        return self.execute(feature,'get_firewall')
