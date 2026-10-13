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
    def dns_lookup(self, config): return self.execute('dns_lookup','dns_lookup',config)
    def discover_speedtest(self): return self.execute('speedtest_discovery','discover_speedtest')
    def surface_preview(self, config):
        with getattr(self.sessions,'operation_lock',nullcontext()):
            self.sessions.provider.capabilities.require_write('configuration_surfaces')
            return self.sessions.provider.surface_preview(config)
    def surface_apply(self, config): return self.execute('configuration_surfaces','surface_apply',config)
    def speedtest_start(self, config): return self.execute('speedtest','speedtest_start',config)
    def factory_reset_preview(self):
        with getattr(self.sessions,'operation_lock',nullcontext()):
            self.sessions.provider.capabilities.require_write('factory_reset')
            return self.sessions.provider.factory_reset_preview()
    def factory_reset_apply(self, config): return self.execute('factory_reset','factory_reset_apply',config)
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

    def save_collection(self, config):
        from apps.access_manager.domain.redaction import redact_sensitive
        with getattr(self.sessions,'operation_lock',nullcontext()):
            session=self.sessions.session
            if session is None or str(config.get('session_id'))!=str(session.session_id):raise ValueError('A coleta pertence a outra sessão')
            history=getattr(self.sessions,'history',None)
            if history is None:raise RuntimeError('Histórico local indisponível')
            def clean(value):
                if isinstance(value,dict):return {k:clean(v) for k,v in redact_sensitive(value).items() if k!='advanced' and not k.startswith('_')}
                if isinstance(value,list):return [clean(v) for v in value]
                return value
            allowed={'system','wan','optical','wifi','radios','clients','lan','dhcp','dns','traffic','mesh','ping','trace','lookup'}
            data={k:clean(v) for k,v in (config.get('sections') or {}).items() if k in allowed}
            identity=history.save_snapshot(getattr(self.sessions,'_history_session',None),'complete_diagnostics',{'source':'ui_collection','device':{'host':session.host,'model':session.model,'firmware':session.firmware},'sections':data})
            return {'success':True,'snapshot_id':identity}
