from __future__ import annotations
from contextlib import nullcontext
import logging
from dataclasses import dataclass
from apps.access_manager.domain.diagnostics import normalize_diagnostic

@dataclass
class DeviceCommandBus:
    sessions: object
    def execute(self, feature: str, method: str, *args, **kwargs):
        with getattr(self.sessions, 'operation_lock', nullcontext()):
            provider=self.sessions.provider
            provider.capabilities.require_write(feature)
            target=getattr(provider, method)
            history = getattr(self.sessions, 'history', None)
            def record(result, outcome):
                if history is None: return
                try:
                    history.save_change(getattr(self.sessions, '_history_session', None), operation=method, target=feature, before=None, after=result, success=outcome=='verified', outcome=outcome)
                except Exception:
                    logging.getLogger(__name__).exception('Could not persist operation history')
            try:
                result = target(*args, **kwargs)
            except Exception as error:
                record({'error_type': type(error).__name__}, 'uncertain')
                raise
            outcome = 'attempted'
            if isinstance(result, dict):
                if result.get('uncertain'): outcome = 'uncertain'
                elif result.get('success') is False: outcome = 'failed'
                elif result.get('verified') is True: outcome = 'verified'
                elif result.get('success') is True: outcome = 'accepted'
            record(result, outcome)
            return result
    def reboot(self): return self.execute('reboot','reboot')
    def set_ssid(self, ssid_id, config): return self.execute('wifi','set_ssid_config',ssid_id,config)
    def set_wifi_radio(self, config): return self.execute('wifi_radio','set_wifi_radio',config)
    def set_dns(self, config): return self.execute('dns','set_dns',config)
    def set_dhcp(self, config): return self.execute('dhcp','set_dhcp',config)
    def ping(self, config): return normalize_diagnostic('ping', self.execute('diagnostics','ping',config))
    def traceroute(self, config): return normalize_diagnostic('traceroute', self.execute('diagnostics','traceroute',config))

    def set_dmz(self, config): return self.execute('dmz','set_dmz',config)
    def set_upnp(self, config): return self.execute('upnp','set_upnp',config)
    def set_tr069(self, config): return self.execute('tr069','set_tr069',config)
    def set_firewall(self, config):
        feature = 'firewall_level' if self.sessions.provider.vendor == 'huawei' else 'firewall'
        return self.execute(feature,'set_firewall',config)

    def save_reservation(self, config):
        from ipaddress import IPv4Address
        import re
        values=dict(config)
        values['ip']=str(IPv4Address(str(values.get('ip') or '')))
        mac=str(values.get('mac') or '')
        if not re.fullmatch(r'(?:[0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}|[0-9A-Fa-f]{12}',mac):
            raise ValueError('MAC inválido')
        compact=re.sub(r'[:-]','',mac).upper()
        values['mac']=':'.join(compact[i:i+2] for i in range(0,12,2))
        return self.execute('dhcp_reservations','save_dhcp_reservation',values)
    def delete_reservation(self, config):
        if config.get('confirm') is not True: raise ValueError('Confirme a exclusão da reserva')
        if not config.get('id'): raise ValueError('ID da reserva é obrigatório')
        return self.execute('dhcp_reservations','delete_dhcp_reservation',str(config['id']))

    def save_dns_host(self, config):
        from ipaddress import ip_address
        values=dict(config);values['ip']=str(ip_address(str(values.get('ip') or '')))
        if not str(values.get('name') or '').strip(): raise ValueError('Nome do host DNS é obrigatório')
        return self.execute('dns_hosts','save_dns_host',values)
    def delete_dns_host(self, config):
        if config.get('confirm') is not True or not config.get('id'): raise ValueError('Informe o ID e confirme a exclusão')
        return self.execute('dns_hosts_delete','delete_dns_host',str(config['id']))
