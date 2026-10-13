from __future__ import annotations
import re
from apps.access_manager.domain.capabilities import Capability, CapabilitySet, EvidenceLevel as E, SupportStatus as S
from apps.access_manager.infrastructure.zte.protocol.device import ZTE
from apps.access_manager.infrastructure.zte.f6201b.f6201b_writes import F6201BWrites
from apps.access_manager.infrastructure.zte.f6201b.f6201b_dns_writes import F6201BDNS
from apps.access_manager.infrastructure.zte.f6201b.f6201b_diagnostics import F6201BDiagnostics

class ZTEProvider:
    vendor='zte'
    def __init__(self, client_factory=ZTE):
        self.client_factory=client_factory; self.client=None; self.host=None; self.model=None; self.firmware=None; self._caps=CapabilitySet(); self._f6201b_wifi=F6201BWrites(); self._f6201b_dns=F6201BDNS(); self._f6201b_diag=F6201BDiagnostics()
    @property
    def connected(self): return self.client is not None
    @property
    def capabilities(self): return self._caps
    @staticmethod
    def _compact(x): return re.sub(r'[^A-Z0-9]+','',str(x or '').upper())
    def connect(self, host, username, password, *, https=False, model_hint=None, **_):
        self.disconnect(); c=self.client_factory(host,username,password,https=https); c.login(); info=c.device_status(); self.client=c; self.host=host; self.model=info.get('modelo') or model_hint or 'ZTE'; self.firmware=info.get('firmware') or info.get('firmware_extendido'); self._caps=self._build_caps(); known=any(x in self._compact(self.model) for x in ('F670L','F6600P','F6201B')); return {'vendor':'zte','model':self.model,'firmware':self.firmware,'protocol_family':'thinklua','capabilities':self._caps.public(),'mode':'supported' if known else 'deployment'}
    def disconnect(self):
        if self.client is not None:
            try: self.client.logout()
            except Exception: pass
        self.client=None; self.host=None; self.model=None; self.firmware=None; self._caps=CapabilitySet(); self._f6201b_wifi.clear(); self._f6201b_dns.clear()
    def _build_caps(self):
        compact=self._compact(self.model)
        is_f6201b='F6201B' in compact
        is_native=any(x in compact for x in ('F670L','F6600P'))
        known=is_f6201b or is_native
        ev=E.AUTOMATED_TESTED if known else E.IMPLEMENTED

        items=[
            Capability('device',S.SUPPORTED,S.UNKNOWN,ev),
            Capability('wan',S.SUPPORTED,S.UNKNOWN,ev),
            Capability('clients',S.SUPPORTED,S.UNKNOWN,ev),
            Capability('traffic',S.PARTIAL,S.UNKNOWN,E.FIXTURE_VALIDATED,source='zte_wan_lan_client_counters'),
            Capability('diagnostics',S.SUPPORTED,S.SUPPORTED if known else S.UNKNOWN,ev,source='legacy_ping_traceroute_runtime'),
            Capability('lan',S.SUPPORTED,S.UNKNOWN,ev),
            Capability('optical',S.SUPPORTED,S.UNKNOWN,ev),
        ]

        generic=['wifi','wifi_radio','wifi_power','wifi_schedule','wps','upnp',
                 'band_steering','dhcp','dhcp_reservations','dns','dmz',
                 'port_forwarding','mesh','wan_config','firewall','qos','sntp','tr069']
        if is_native:
            for name in generic:
                items.append(Capability(name,S.SUPPORTED,S.SUPPORTED,ev,source='legacy_thinklua_protocol'))
        elif is_f6201b:
            # Only the writers actually wired through captured, guarded forms
            # are promoted. Other captured surfaces remain PARTIAL until their
            # provider command/read-back path is integrated and tested.
            items.extend([
                Capability('wifi',S.SUPPORTED,S.SUPPORTED,E.AUTOMATED_TESTED,source='f6201b_captured_ssid_writer'),
                Capability('dns',S.SUPPORTED,S.SUPPORTED,E.AUTOMATED_TESTED,source='f6201b_captured_dns_writer'),
            ])
            for name in [x for x in generic if x not in {'wifi','dns'}]:
                items.append(Capability(name,S.SUPPORTED,S.PARTIAL,E.FIXTURE_VALIDATED,source='f6201b_captured_surface_not_yet_wired'))
        else:
            for name in generic:
                items.append(Capability(name,S.SUPPORTED,S.UNKNOWN,E.IMPLEMENTED,source='unidentified_zte_runtime_no_negative_proof'))

        # Reboot is a normal command only for model families whose native
        # writer is already mapped. F6201B captured reboot is not proven here.
        items.append(Capability(
            'reboot',S.SUPPORTED,S.SUPPORTED if is_native else S.UNKNOWN,ev,
            destructive=True,source='zte_device_management.reboot' if is_native else 'writer_not_proven_for_active_model'
        ))
        items.extend([Capability('dns_hosts',S.SUPPORTED if is_native else S.UNKNOWN,S.SUPPORTED if is_native else S.UNKNOWN,E.IMPLEMENTED,source='legacy_dns_host_upsert_readback'),Capability('dns_hosts_delete',S.UNKNOWN,S.UNKNOWN,E.UNKNOWN,source='delete_writer_not_proven')])
        items.extend([Capability('dns_lookup',S.SUPPORTED if is_native else S.UNKNOWN,S.SUPPORTED if is_native else S.UNKNOWN,E.AUTOMATED_TESTED,source='legacy_nslookup_request_poll'),Capability('speedtest_discovery',S.SUPPORTED if is_native else S.UNKNOWN,S.SUPPORTED if is_native else S.UNKNOWN,E.IMPLEMENTED,source='legacy_ais_speedtest_server_discovery')])
        return CapabilitySet(items)
    def _need(self):
        if self.client is None: raise RuntimeError('ZTE session is not connected')
        return self.client
    def _is_f6201b(self): return 'F6201B' in self._compact(self.model)
    def _read(self, method):
        # Read-only retry reopens the view through the existing reader. Never
        # retry writes: a dropped response can already have applied a command.
        reader = getattr(self._need(), method)
        try:
            return reader()
        except RuntimeError as error:
            if 'SessionTimeout' not in str(error) and 'view necessária' not in str(error):
                raise
            return reader()
    def get_device_info(self): return self._read('device_status')
    def get_clients(self):
        from apps.access_manager.domain.clients import merge_clients
        return merge_clients(self._need().lan_clients(), self._need().wifi_clients())
    def get_wifi(self, reveal_password=False):
        return {'networks':self.get_wifi_networks(reveal_password),'radios':self.get_wifi_radios()}
    def get_wifi_networks(self, reveal_password=False):
        from apps.access_manager.infrastructure.radio_options import radio_options
        c=self._need()
        networks=self._f6201b_wifi.list_ssids(c) if self._is_f6201b() and not reveal_password else (c.wifi_networks(reveal_password=True) if reveal_password else c.wifi_networks())
        return networks
    def get_wifi_radios(self):
        from apps.access_manager.infrastructure.radio_options import radio_options
        c=self._need()
        radios=c.channel_status()
        try: observed_options=radio_options(c.get_view('wlanBasic',Menu3Location=0))
        except Exception: observed_options={}
        for r in radios if isinstance(radios,list) else []:
            options=dict(observed_options)
            try:
                channels=c.available_channels(band=r.get('banda'),country=r.get('pais'))
                current_width=str(r.get('largura') or '')
                options['channel']=[{'value':str(n),'label':str(n)} for group in channels if not current_width or str(group.get('largura'))==current_width for n in group.get('canais',[])]
                widths=list(dict.fromkeys(str(g.get('largura')) for g in channels if g.get('largura') is not None))
                if widths:options.setdefault('bandwidth',[{'value':w,'label':w} for w in widths])
            except Exception: pass
            r['options']=options
        return radios
    def get_wan(self): return self._read('wan_status')
    def get_lan(self): return self._read('lan_ports')
    def get_dhcp(self): return self._read('dhcp_status')
    def get_dns(self): return self._f6201b_dns.read(self._need()) if self._is_f6201b() else self._need().dns_status()
    def get_optical(self): return self._need().optical_status()
    def get_traffic(self):
        c=self._need()
        legacy_errors=[]
        def read_legacy(method):
            try: return list(getattr(c,method)() or [])
            except Exception:
                legacy_errors.append(method)
                return []
        wan=read_legacy('wan_status')
        lan=read_legacy('lan_ports')
        wifi=read_legacy('wifi_clients')
        sources=[]
        keys=('rx_bytes','tx_bytes','rx_packets','tx_packets','rx_errors','tx_errors','rx_discard','tx_discard')
        for source, rows in (('wan',wan),('lan',lan),('wifi_client',wifi)):
            for row in rows:
                counters={k:row.get(k) for k in keys if row.get(k) not in (None,'')}
                if counters:
                    sources.append({'source':source,'identity':row.get('id') or row.get('port') or row.get('mac') or row.get('nome') or '', 'counters':counters})
        from apps.access_manager.infrastructure.zte.traffic import read_counter_surfaces
        probes = read_counter_surfaces(c) if hasattr(c, 'get_view') and hasattr(c, 'get_menu') else {'sources': [], 'unavailable_scopes': ['wan', 'lan', 'wifi']}
        scopes = {row['source'] for row in probes['sources']}
        sources = probes['sources'] + [row for row in sources if row['source'] not in scopes]
        return {
            'unavailable_scopes': probes['unavailable_scopes'],
            'legacy_unavailable': legacy_errors,
            'supported':bool(sources),
            'partial':bool(probes['unavailable_scopes']),
            'sources':sources,
            'wan':wan,
            'lan':lan,
            'wifi_clients':wifi,
            'reason':None if sources else 'legacy_zte_counter_surfaces_returned_no_active_counters',
        }
    def set_ssid_config(self, ssid_id, config):
        self.capabilities.require_write('wifi'); c=self._need()
        if self._is_f6201b(): return self._f6201b_wifi.apply_changes(c,host=self.host,firmware=self.firmware or '',ssid_id=ssid_id,config=config,original_post=c.session.post)
        return c.set_ssid_config(ssid_id, config)
    def set_wifi_radio(self, config):
        self.capabilities.require_write('wifi_radio'); values=dict(config or {}); band=values.pop('band', values.pop('banda', None))
        if not band: raise ValueError('band is required for Wi-Fi radio configuration')
        return self._need().set_radio_config(band, values)
    def set_dns(self, config):
        self.capabilities.require_write('dns'); c=self._need()
        if self._is_f6201b(): return self._f6201b_dns.apply_changes(c,host=self.host,firmware=self.firmware or '',changes=config,original_post=c.session.post)
        return c.set_dns(config)
    def set_dhcp(self, config): self.capabilities.require_write('dhcp'); return self._need().set_dhcp_basic(config)
    def set_wps(self, config):
        self.capabilities.require_write('wps'); values=dict(config or {}); band=values.get('band') or values.get('banda'); mode=values.get('mode')
        if band is None or mode is None: raise ValueError('band and mode are required for WPS')
        return self._need().set_wps(band, mode)
    def set_upnp(self, config): self.capabilities.require_write('upnp'); return self._need().set_upnp(config)
    def set_radio_power(self, config):
        self.capabilities.require_write('wifi_power'); values=dict(config or {}); band=values.get('band') or values.get('banda'); enabled=values.get('enabled')
        if band is None or enabled is None: raise ValueError('band and enabled are required for radio power')
        return self._need().set_radio_power(band, bool(enabled))
    def set_wifi_schedule(self, config): self.capabilities.require_write('wifi_schedule'); return self._need().set_wifi_schedule(config)
    def set_band_steering(self, config): self.capabilities.require_write('band_steering'); return self._need().set_band_steering(config)
    def set_dmz(self, config):
        self.capabilities.require_write('dmz')
        current = self.get_dmz()
        if not current.get('available'): raise RuntimeError('DMZ form is not available in this session')
        values = {k: current.get(k) for k in ('id','enabled','internal_client','wan')}
        values.update(config)
        return self._need().set_dmz(values)
    def set_tr069(self, config): self.capabilities.require_write('tr069'); return self._need().set_tr069_management(config)
    def reboot(self): self.capabilities.require_write('reboot'); return self._need().reboot()
    def ping(self, config):
        if self._is_f6201b(): return self._f6201b_diag.execute(self._need(), kind='ping', config=config, original_post=self._need().session.post)
        return self._need().ping(config)
    def traceroute(self, config):
        if self._is_f6201b(): return self._f6201b_diag.execute(self._need(), kind='traceroute', config=config, original_post=self._need().session.post)
        return self._need().traceroute(config)

    def get_dmz(self):
        rows = self._need().dmz_status()
        row = rows[0] if isinstance(rows, list) and rows else rows if isinstance(rows, dict) else {}
        enabled = row.get('enabled', row.get('Enable'))
        return {'available': bool(row), 'id': row.get('id') or row.get('_InstID'),
                'enabled': None if enabled is None else enabled is True or str(enabled)=='1',
                'internal_client': row.get('internal_client', row.get('InternalClient')),
                'wan': row.get('wan', row.get('WANCViewName'))}
    def get_upnp(self): return self._need().upnp_status()
    def get_tr069(self):
        result = self._need().tr069_management_status()
        return {'available': result.get('available'), 'url': (result.get('server') or {}).get('URL'), 'advanced': result}
    def get_firewall(self): return self._need().firewall_management_status()
    def set_firewall(self, config):
        self.capabilities.require_write('firewall'); return self._need().set_firewall_management(config)

    reservation_fields=('name','ip','mac')
    def save_dhcp_reservation(self, config):
        self.capabilities.require_write('dhcp_reservations'); return self._need().save_dhcp_reservation(config)
    def delete_dhcp_reservation(self, identifier):
        self.capabilities.require_write('dhcp_reservations'); return self._need().delete_dhcp_reservation(identifier)

    dns_host_rename=False
    def save_dns_host(self, config):
        self.capabilities.require_write('dns_hosts')
        from apps.access_manager.infrastructure.zte.protocol.zte_configuration import zte_dns
        if config.get('id'):
            row=next((r for r in self.get_dns().get('hosts',[]) if str(r.get('id'))==str(config['id'])),None)
            if not row: raise ValueError('Host DNS não encontrado')
            if row.get('nome')!=config['name']: raise ValueError('Renomear exige remover o host antigo; remoção não foi comprovada neste contrato')
        result=zte_dns._upsert_host(self._need(),{'nome':config['name'],'ip':config['ip']})
        actual=zte_dns._wait_host_applied(self._need(),config['name'],config['ip'])
        return {**result,'verified':True,'after':actual}

    def dns_lookup(self, config):
        self.capabilities.require_write('dns_lookup')
        values=dict(config or {})
        if set(values)-{'hostname'}: raise ValueError('Unsupported DNS lookup option')
        hostname=str(values.get('hostname') or '').strip().rstrip('.')
        if not hostname or len(hostname)>253 or not all(re.fullmatch(r'[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?',label) for label in hostname.split('.')):
            raise ValueError('Nome DNS inválido')
        result=self._need().nslookup(hostname)
        return {'success':result.get('success'), 'hostname':hostname,
                'hostname_returned':result.get('hostname_returned'),
                'addresses':result.get('addresses'), 'message':result.get('message')}

    def discover_speedtest(self):
        self.capabilities.require_write('speedtest_discovery')
        result=self._need().native_speedtest_servers()
        return {'servers':result.get('servers') or []}
