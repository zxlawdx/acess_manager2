from __future__ import annotations
from dataclasses import dataclass

@dataclass
class DeviceCommandBus:
    sessions: object
    def execute(self, feature: str, method: str, *args, **kwargs):
        provider=self.sessions.provider
        provider.capabilities.require_write(feature)
        target=getattr(provider, method)
        return target(*args, **kwargs)
    def reboot(self): return self.execute('reboot','reboot')
    def set_ssid(self, ssid_id, config): return self.execute('wifi','set_ssid_config',ssid_id,config)
    def set_wifi_radio(self, config): return self.execute('wifi_radio','set_wifi_radio',config)
    def set_dns(self, config): return self.execute('dns','set_dns',config)
    def set_dhcp(self, config): return self.execute('dhcp','set_dhcp',config)
    def ping(self, config): return self.execute('diagnostics','ping',config)
    def traceroute(self, config): return self.execute('diagnostics','traceroute',config)
