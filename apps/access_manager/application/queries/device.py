from contextlib import nullcontext
import time
import logging
from apps.access_manager.domain.presentation import dhcp_view, wan_view, device_view
from apps.access_manager.domain.clients import normalize_clients
from dataclasses import dataclass, field
from apps.access_manager.application.services.traffic import TrafficSampler
@dataclass
class DeviceQueryBus:
    sessions: object
    sampler: TrafficSampler = field(default_factory=TrafficSampler)
    def execute(self, feature, method, *args, **kwargs):
        started=time.perf_counter()
        try:
            with getattr(self.sessions, 'operation_lock', nullcontext()):
                acquired=time.perf_counter()
                p=self.sessions.provider
                p.capabilities.require_read(feature)
                result = getattr(p,method)(*args,**kwargs)
                support = getattr(self, 'support_reports', None)
                if support and not kwargs.get('reveal_password'):
                    support.record_read(feature, result)
                return result
        finally:
            logging.getLogger(__name__).debug("read.%s.%s total_ms=%.1f lock_wait_ms=%.1f",feature,method,(time.perf_counter()-started)*1000,(locals().get('acquired',time.perf_counter())-started)*1000)
    def surface_catalog(self): return self.execute('configuration_surfaces','surface_catalog')
    def surface_read(self, feature): return self.execute('configuration_surfaces','surface_read',feature)
    def speedtest_poll(self, identity): return self.execute('speedtest','speedtest_poll',identity)
    def firmware(self): return self.execute('firmware','get_firmware')
    def accounts(self): return self.execute('accounts','get_accounts')
    def compatibility_scan(self): return self.execute('runtime_diagnostic','compatibility_scan')
    def runtime_diagnostic(self): return self.execute('runtime_diagnostic','runtime_diagnostic')
    def device(self):
        with getattr(self.sessions, 'operation_lock', nullcontext()):
            result=device_view(self.execute('device','get_device_info'))
            session=self.sessions.session
            if session is not None and result.get('serial'):session.metadata['device_identity']=str(result['serial'])
            return result
    def clients(self): return normalize_clients(self.execute('clients','get_clients'))
    def wifi(self): return self.execute('wifi','get_wifi')
    def wifi_ssids(self): return self.execute('wifi','get_wifi_networks')
    def wifi_radios(self): return self.execute('wifi_radio','get_wifi_radios')
    def wifi_channels(self, band=None, bandwidth=None, country=None): return self.execute('wifi_channels','get_available_channels',band=band,bandwidth=bandwidth,country=country)
    def wifi_neighbor_scan(self, band): return self.execute('wifi_neighbor_scan','get_wifi_neighbor_scan',band)
    def wifi_reveal(self): return {'networks':self.execute('wifi','get_wifi_networks',reveal_password=True)}
    def wan(self):
        data=self.execute('wan','get_wan')
        return [wan_view(r) for r in (data if isinstance(data,list) else [data])]
    def lan(self): return self.execute('lan','get_lan')
    def dhcp(self):
        result=dhcp_view(self.execute('dhcp','get_dhcp'))
        result['reservation_fields']=getattr(self.sessions.provider,'reservation_fields',())
        return result
    def dns(self):
        data=self.execute('dns','get_dns')
        return {**data,'hosts':[{'id':r.get('id'),'name':r.get('name') or r.get('nome'),'ip':r.get('ip')} for r in data.get('hosts',[])],'host_rename':getattr(self.sessions.provider,'dns_host_rename',False)}
    def optical(self):
        from apps.access_manager.domain.optical import normalize_optical
        return normalize_optical(self.execute('optical','get_optical'))
    def nat_sessions(self): return self.execute('nat_sessions','get_nat_sessions')
    def mesh(self): return self.execute('mesh_read','get_mesh')
    def traffic(self):
        with getattr(self.sessions, 'operation_lock', nullcontext()):
            data = self.execute('traffic','get_traffic')
            session = self.sessions.session
            sampled=self.sampler.sample(session.session_id, data)
            history=getattr(self.sessions,'history',None)
            if history is not None:
                try: history.save_traffic(session.session_id,sampled['sources'],time.time(),host=session.host,identifier=session.metadata.get('device_identity'),vendor=session.vendor.value)
                except Exception: logging.getLogger(__name__).exception('Traffic history persistence failed')
            return sampled

    def dmz(self): return self.execute('dmz','get_dmz')
    def upnp(self): return self.execute('upnp','get_upnp')
    def tr069(self): return self.execute('tr069','get_tr069')
    def firewall(self):
        feature = 'firewall_level' if self.sessions.provider.vendor == 'huawei' else 'firewall'
        return self.execute(feature,'get_firewall')

    def traffic_history(self, seconds=3600):
        with getattr(self.sessions, 'operation_lock', nullcontext()):
            session=self.sessions.session
            if session is None: raise RuntimeError('No active device session')
            history=getattr(self.sessions,'history',None)
            return history.traffic_history(session.session_id,time.time()-max(60,min(int(seconds),7*86400))) if history else []

    def device_traffic_history(self, config):
        import time
        history=getattr(self.sessions,'history',None)
        if history is None:return []
        until=min(float(config.get('until',time.time())),time.time())
        since=max(float(config.get('since',until-3600)),until-7*86400)
        import math
        if not math.isfinite(since) or not math.isfinite(until) or since>=until:raise ValueError('Intervalo inválido')
        return history.traffic_by_device(host=config.get('host'),identifier=config.get('identifier'),since=since,until=until)

    def infrastructure(self,feature,method,config=None):
        config=config or {}
        manager=getattr(self.sessions,'infrastructure',self.sessions)
        from uuid import uuid4
        from apps.access_manager.infrastructure.juniper.observability import operation
        started=time.perf_counter();request_id=uuid4().hex
        try:
            with manager.operation_lock:
                acquired=time.perf_counter()
                token=operation.set({'request_id':request_id,'lock_wait_ms':round((acquired-started)*1000,2)})
                try:
                    if manager.provider.vendor!='juniper':raise ValueError('Consulta exclusiva do workspace Juniper.')
                    if config.get('app_session_id') and config['app_session_id']!=manager.session.session_id:
                        from apps.access_manager.infrastructure.juniper.errors import JuniperError
                        raise JuniperError('STALE_SESSION')
                    args=() if method in {'get_juniper_system','get_juniper_interfaces','get_juniper_chassis','get_juniper_resources','get_operation_log'} else (config.get('query'),) if method=='lookup_subscribers' else (config.get('session_id'),) if method=='get_subscriber' else (config.get('name'),) if method=='get_juniper_interface' else (config,)
                    manager.provider.capabilities.require_read(feature)
                    result = getattr(manager.provider,method)(*args)
                    support = getattr(self, 'support_reports', None)
                    if support and self.sessions.active is manager and method != 'get_operation_log':
                        report = support.active()
                        if report:
                            key = feature
                            report['current_snapshot'][key] = __import__('apps.access_manager.infrastructure.support_reports',fromlist=['sanitize']).sanitize(result)
                            support.event(report, 'diagnostic' if method == 'juniper_diagnostic' else 'measurement', feature, method, result=result)
                    return result
                finally:operation.reset(token)
        finally:
            elapsed=(time.perf_counter()-started)*1000
            wait=(locals().get('acquired',time.perf_counter())-started)*1000
            logging.getLogger(__name__).info('juniper.operation request_id=%s feature=%s elapsed_ms=%.2f lock_wait_ms=%.2f',request_id,feature,elapsed,wait)
