from dataclasses import dataclass
@dataclass
class DeviceQueryBus:
    sessions: object
    def execute(self, feature, method, *args, **kwargs):
        p=self.sessions.provider; p.capabilities.require_read(feature); return getattr(p,method)(*args,**kwargs)
    def device(self): return self.execute('device','get_device_info')
    def clients(self): return self.execute('clients','get_clients')
    def wifi(self): return self.execute('wifi','get_wifi')
    def wifi_reveal(self): return self.execute('wifi','get_wifi',reveal_password=True)
    def wan(self): return self.execute('wan','get_wan')
    def lan(self): return self.execute('lan','get_lan')
    def dhcp(self): return self.execute('dhcp','get_dhcp')
    def dns(self): return self.execute('dns','get_dns')
    def optical(self): return self.execute('optical','get_optical')
    def traffic(self): return self.execute('traffic','get_traffic')
