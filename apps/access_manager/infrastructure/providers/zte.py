from __future__ import annotations
from apps.access_manager.infrastructure.zte.firmware_operations import FactoryReset, conntrack_status
from apps.access_manager.infrastructure.zte.native_speedtest import NativeSpeedtest
from apps.access_manager.infrastructure.configuration_adapters import OperationalConfigurations
import re
from apps.access_manager.domain.capabilities import Capability, CapabilitySet, EvidenceLevel as E, SupportStatus as S
from apps.access_manager.infrastructure.zte.protocol.device import ZTE
from apps.access_manager.infrastructure.zte.f6201b.f6201b_writes import F6201BWrites
from apps.access_manager.infrastructure.zte.f6201b.f6201b_dns_writes import F6201BDNS
from apps.access_manager.infrastructure.zte.f6201b.f6201b_diagnostics import F6201BDiagnostics

class ZTEProvider:
    vendor='zte'
    def __init__(self, client_factory=ZTE):
        self._surfaces=OperationalConfigurations(self);self._speedtest=NativeSpeedtest();self._reset=FactoryReset()
        self.client_factory=client_factory; self.client=None; self.host=None; self.model=None; self.firmware=None; self._caps=CapabilitySet(); self._f6201b_wifi=F6201BWrites(); self._f6201b_dns=F6201BDNS(); self._f6201b_diag=F6201BDiagnostics()
    @property
    def connected(self): return self.client is not None
    @property
    def capabilities(self): return self._caps
    @staticmethod
    def _compact(x): return re.sub(r'[^A-Z0-9]+','',str(x or '').upper())
    def connect(self, host, username, password, *, https=False, model_hint=None, **_):
        from apps.access_manager.infrastructure.zte.discovery.profiles import select_profile, fingerprint
        from apps.access_manager.infrastructure.zte.discovery.profile_runtime import reset_read_state
        self.disconnect()
        c=self.client_factory(host,username,password,https=https)
        if c.login() is False:
            raise RuntimeError('Falha na autenticação ZTE.')
        try:
            info=c.device_status()
        except Exception:
            info=self._footer_identity(c)
            if not info and select_profile(model_hint):
                info={'modelo':model_hint,'identification_source':'model_hint_unconfirmed'}
            if not info:raise
        if not info.get('modelo'):
            try:info={**info,**self._footer_identity(c)}
            except Exception:pass  # Empty status remains deployment on unknown families.
            if not info.get('modelo') and select_profile(model_hint):
                info.update(modelo=model_hint,identification_source='model_hint_unconfirmed')
        self.client=c;self.host=host;self.model=info.get('modelo') or model_hint or 'ZTE'
        self.firmware=info.get('firmware') or info.get('firmware_extendido')
        self._identity=info
        self._profile=select_profile(self.model,self.firmware)
        c.read_profile=self._profile
        if self._profile:
            reset_read_state(c)
            c.profile_fingerprint=fingerprint(self.model,self.firmware,info.get('firmware_extendido'),info.get('hardware'))
        self._caps=self._build_caps()
        if self._profile:self._refresh_profile_caps()
        known=(self._profile is not None and info.get('identification_source')!='model_hint_unconfirmed') or any(x in self._compact(self.model) for x in ('F670L','F6600P','F6201B'))
        return {'vendor':'zte','model':self.model,'firmware':self.firmware,'protocol_family':'thinklua',
                'profile':self._profile.name if self._profile else None,
                'capabilities':self._caps.public(),'mode':'supported' if known else 'deployment'}

    @staticmethod
    def _footer_identity(client):
        from apps.access_manager.infrastructure.zte.discovery.profile_runtime import is_login_view
        html=getattr(client,'authenticated_root_html','')
        if not html and hasattr(client,'session') and hasattr(client.session,'get'):
            response=client.session.get(client.base_url+'/',timeout=10)
            response.raise_for_status();html=response.text
        match=re.search(r'ZXHN\s+H3601P\s+(V9\.[0-9A-Za-z_.-]+)',html,re.I)
        if match and re.search(r'ZTE\s+Corporation',html,re.I) and not is_login_view(html):
            return {'modelo':'ZXHN H3601P','firmware':match[1],'identification_source':'HTML_DETECTED'}
        return {}

    def _refresh_profile_caps(self):
        if not getattr(self,'_profile',None):return
        from apps.access_manager.infrastructure.zte.discovery.profile_runtime import state
        observed=state(self._need())['diagnostics']
        mapping={'wan':['wan'],'clients':['lan_clients','wifi_clients'],'lan':['lan_ports'],
                 'wifi':['wifi_ssids'],'wifi_radio':['wifi_radios'],'dhcp':['dhcp_leases']}
        safe=[]
        for name in self._caps.public():
            old=self._caps.get(name)
            if name=='optical':read=S.UNSUPPORTED
            elif name=='device':read=S.PARTIAL if self._identity.get('identification_source')=='model_hint_unconfirmed' else S.SUPPORTED
            elif name=='runtime_diagnostic':read=S.SUPPORTED
            elif name in mapping:
                read=S.SUPPORTED if all(observed.get(k,{}).get('status') in {'validated','valid_empty'} for k in mapping[name]) else S.PARTIAL
            elif name in {'mesh','mesh_read','traffic'}:read=S.PARTIAL
            else:read=S.UNKNOWN
            safe.append(Capability(name,read,S.UNSUPPORTED if name=='optical' else S.UNKNOWN,
                        E.AUTOMATED_TESTED if read==S.SUPPORTED else E.RESEARCH_ONLY,
                        old.destructive,source='h3601p_v9_shape_validated_reads_no_writers'))
        self._caps=CapabilitySet(safe)

    def _profile_objects(self, feature):
        from apps.access_manager.infrastructure.zte.discovery.profile_runtime import read_feature
        try:return read_feature(self._need(),feature)[0]
        finally:self._refresh_profile_caps()

    def disconnect(self):
        if self.client is not None:
            try: self.client.logout()
            except Exception: pass
        self._profile=None;self._identity={}
        self._surfaces.clear();self._speedtest.clear();self._reset.clear()
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
                Capability('dhcp',S.SUPPORTED,S.SUPPORTED,E.FIXTURE_VALIDATED,source='f6201b_complete_captured_dhcp'),
                Capability('wifi_radio',S.SUPPORTED,S.SUPPORTED,E.FIXTURE_VALIDATED,source='f6201b_complete_captured_rf'),
            ])
            for name in [x for x in generic if x not in {'wifi','dns','dhcp','wifi_radio'}]:
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
        items.append(Capability('configuration_surfaces',S.SUPPORTED,S.SUPPORTED,E.FIXTURE_VALIDATED,source='known_schema_operational_adapters'))
        items.append(Capability('speedtest',S.SUPPORTED,S.SUPPORTED,E.SOURCE_CONFIRMED,source='legacy_ais_start_and_poll'))
        items.append(Capability('mesh_read',S.SUPPORTED,S.UNKNOWN,E.SOURCE_CONFIRMED,source='legacy_netsphere_probe'))
        for name in ('backup','restore','firmware','accounts'):items.append(Capability(name,S.SUPPORTED,S.SUPPORTED,E.SOURCE_CONFIRMED,destructive=name in {'restore','firmware'},source='legacy_management_workflows'))
        items.append(Capability('runtime_diagnostic',S.SUPPORTED,S.UNKNOWN,E.SOURCE_CONFIRMED,source='ported_model_shape_probe'))
        items.append(Capability('factory_reset',S.SUPPORTED,S.SUPPORTED,E.FIRMWARE_CONFIRMED,destructive=True,source='recognized_reset_template_handler'))
        items.append(Capability('nat_sessions',S.SUPPORTED,S.UNKNOWN,E.FIRMWARE_CONFIRMED,source='conntrack_counts_only'))
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
    def get_device_info(self):
        try:
            info=self._read('device_status')
            if getattr(self,'_profile',None) and not info.get('modelo'):return dict(self._identity)
            if getattr(self,'_profile',None):
                from apps.access_manager.infrastructure.zte.discovery.profile_runtime import reset_read_state
                from apps.access_manager.infrastructure.zte.discovery.profiles import fingerprint
                firmware=info.get('firmware') or info.get('firmware_extendido')
                if firmware and firmware!=self.firmware:
                    self.firmware=firmware;reset_read_state(self._need())
                self._identity=info
                self._need().profile_fingerprint=fingerprint(self.model,self.firmware,info.get('firmware_extendido'),info.get('hardware'))
                self._refresh_profile_caps()
            return info
        except Exception:
            if getattr(self,'_profile',None):return dict(self._identity)
            raise
    def get_clients(self):
        from apps.access_manager.domain.clients import merge_clients
        if not getattr(self,'_profile',None):
            return merge_clients(self._need().lan_clients(), self._need().wifi_clients())
        from apps.access_manager.infrastructure.zte.discovery.profile_runtime import clients, ReadFailure
        collections=[];warnings=[]
        for kind in ('lan_clients','wifi_clients'):
            try:collections.append(clients(self._need(),kind))
            except ReadFailure:
                collections.append([])
                warnings.append('Clientes Wi-Fi indisponíveis neste firmware.' if kind=='wifi_clients' else 'Clientes LAN indisponíveis neste firmware.')
        result=merge_clients(*collections,identity_fallback=True)
        if result:
            try:
                leases=clients(self._need(),'dhcp_leases')
                by_mac={self._compact(r.get('mac')):r for r in leases if r.get('mac')}
                for row in result:
                    lease=by_mac.get(self._compact(row.get('mac')), {})
                    for k in ('hostname','ip','ipv4','ipv6','ipv6_addresses'):
                        if row.get(k) in (None,'',[]):row[k]=lease.get(k)
            except ReadFailure:pass
        self._refresh_profile_caps()
        if len(warnings)==2:
            raise ReadFailure('clients_unavailable')
        for row in result:
            if warnings:row['collection_warnings']=warnings
        return result
    def get_wifi(self, reveal_password=False):
        return {'networks':self.get_wifi_networks(reveal_password),'radios':self.get_wifi_radios()}
    def get_wifi_networks(self, reveal_password=False):
        from apps.access_manager.infrastructure.radio_options import radio_options
        c=self._need()
        if getattr(self,'_profile',None):
            if reveal_password:raise RuntimeError('Revelação de senha não comprovada neste firmware.')
            objects=self._profile_objects('wifi_ssids')
            return [{'id':r.get('_InstID'),'ssid':r.get('ESSID'),'enabled':None if r.get('Enable') is None else r['Enable']=='1','band':r.get('Band'),'broadcast':None if r.get('SSIDAdvertisementEnabled') is None else r['SSIDAdvertisementEnabled']=='1'} for r in objects.get('OBJ_WLANAP_ID',[])]
        networks=self._f6201b_wifi.list_ssids(c) if self._is_f6201b() and not reveal_password else (c.wifi_networks(reveal_password=True) if reveal_password else c.wifi_networks())
        return networks
    def get_wifi_radios(self):
        from apps.access_manager.infrastructure.radio_options import radio_options
        c=self._need()
        if getattr(self,'_profile',None):
            objects=self._profile_objects('wifi_radios')
            return [{'id':r.get('_InstID'),'banda':r.get('Band'),'canal':r.get('Channel'),'largura':r.get('BandWidth'),'padrao':r.get('Standard'),'potencia':r.get('TxPower'),'pais':r.get('CountryCode')} for r in objects.get('OBJ_WLANSETTING_ID',[])]
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
    def get_wan(self):
        if not getattr(self,'_profile',None):return self._read('wan_status')
        objects=self._profile_objects('wan')
        return [{k:r.get(v) for k,v in {'id':'_InstID','name':'WANCName','status':'ConnStatus','connection_type':'TransType','ipv4':'IPAddress','gateway':'GateWay','vlan':'VLANID','uptime_seconds':'UpTime'}.items()} for r in objects.get('ID_WAN_COMFIG',[])]
    def get_lan(self):
        if not getattr(self,'_profile',None):return self._read('lan_ports')
        from apps.access_manager.infrastructure.zte.protocol.zte_configuration.zte_lan import _normalize_speed
        objects=self._profile_objects('lan_ports')
        return [{'id':r.get('_InstID'),'port':r.get('Port') or r.get('IFName') or r.get('_InstID'),'link_state':r.get('Status'),'speed':_normalize_speed(r.get('Speed')),'duplex':r.get('Duplex'),'rx_bytes':r.get('InBytes'),'tx_bytes':r.get('OutBytes')} for r in objects.get('OBJ_PON_PORT_BASIC_STATUS_ID',[])]
    def get_dhcp(self):
        if getattr(self,'_profile',None):
            from apps.access_manager.infrastructure.zte.discovery.profile_runtime import clients
            try:return {'leases':clients(self._need(),'dhcp_leases'),'reservations':[],'configuration_available':False}
            finally:self._refresh_profile_caps()
        if self._is_f6201b():
            from apps.access_manager.infrastructure.zte.f6201b.f6201b_dhcp import status
            return status(self._need())
        return self._read('dhcp_status')
    def get_dns(self): return self._f6201b_dns.read(self._need()) if self._is_f6201b() else self._need().dns_status()
    def get_optical(self):
        self.capabilities.require_read('optical')
        return self._need().optical_status()
    def get_traffic(self):
        if getattr(self,'_profile',None):
            rows=self.get_lan()
            return {'sources':[{'source':'lan','identity':r.get('id'),'counters':{k:r[k] for k in ('rx_bytes','tx_bytes') if r.get(k) not in (None,'')}} for r in rows if r.get('rx_bytes') not in (None,'') or r.get('tx_bytes') not in (None,'')], 'partial':True}
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
        if self._is_f6201b():
            from apps.access_manager.infrastructure.configuration_adapters import NativeRadio
            driver=NativeRadio(self);driver.read();raw=next((r for r in driver.raw if r.get('Band')==band),None)
            if raw is None:raise ValueError('Rádio não encontrado')
            mapping={k:f'field_{i}' for i,k in enumerate(driver.fields)}
            if set(values)-set(mapping):raise ValueError('Campo de rádio fora da captura F6201B')
            changes={mapping[k]:('1' if v else '0') if type(v) is bool else str(v) for k,v in values.items()}
            proposal=self._surfaces.preview(self._need(),self.host,'wifi_advanced',raw['_InstID'],changes)
            return self._surfaces.apply(self._need(),self.host,proposal['nonce'],'APLICAR')
        return self._need().set_radio_config(band, values)
    def set_dns(self, config):
        self.capabilities.require_write('dns'); c=self._need()
        if self._is_f6201b(): return self._f6201b_dns.apply_changes(c,host=self.host,firmware=self.firmware or '',changes=config,original_post=c.session.post)
        return c.set_dns(config)
    def set_dhcp(self, config):
        self.capabilities.require_write('dhcp')
        if self._is_f6201b():
            from apps.access_manager.infrastructure.zte.f6201b.f6201b_dhcp import change
            forms=self._surfaces.f6201b
            return change(forms.workbench,self._need(),config=config,host=self.host,revision=forms.revision,attendant='access-manager',original_post=self._need().session.post)
        return self._need().set_dhcp_basic(config)
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
        self._speedtest.servers=result.get('servers') or []
        return {'servers':self._speedtest.servers}

    def surface_catalog(self): return self._surfaces.catalog()
    def surface_read(self, feature): return self._surfaces.inspect(self._need(),feature)
    def surface_preview(self, config): return self._surfaces.preview(self._need(),self.host,config['feature'],config['instance'],config.get('changes') or {},config.get('action','update'))
    def surface_apply(self, config):
        self.capabilities.require_write('configuration_surfaces')
        return self._surfaces.apply(self._need(),self.host,config['nonce'],config.get('confirmation'))

    def speedtest_start(self, config):
        self.capabilities.require_write('speedtest')
        return self._speedtest.start(self._need(),config.get('server_url'))
    def speedtest_poll(self, identity): return self._speedtest.poll(self._need(),identity)

    def get_mesh(self):
        if getattr(self,'_profile',None):
            return {'nodes':[],'links':[],'available':False,'source':'synthesized_access_devices','reason':'Relações Mesh não comprovadas; clientes não implicam enlaces Mesh.'}
        from apps.access_manager.domain.mesh import normalize_mesh
        return normalize_mesh(self._need().mesh_status())

    def export_backup(self): return self._need().export_user_configuration(device=self.get_device_info())
    def restore_backup(self, path):
        self.capabilities.require_write('restore')
        try: return self._need().restore_configuration(path)
        except Exception as error:return {'success':False,'uncertain':True,'error_type':type(error).__name__,'message':'Restore sem confirmação. Não reenviar automaticamente; confira o equipamento.'}
    def upload_firmware(self, path):
        self.capabilities.require_write('firmware')
        try:return self._need().upload_firmware(path)
        except Exception as error:return {'success':False,'uncertain':True,'error_type':type(error).__name__,'message':'Upload sem confirmação. Não reenviar automaticamente; confira o equipamento.'}
    def get_firmware(self):
        data=self._need().firmware_management_status()
        return {'available':bool(data.get('objects')), 'states':[{k:v for k,v in row.items() if k in {'State','Status','Progress','Version','Error'}} for rows in data.get('objects',{}).values() for row in rows]}
    def get_accounts(self): return self._need().account_status()

    def runtime_diagnostic(self):
        if getattr(self,'_profile',None):
            from apps.access_manager.infrastructure.zte.discovery.profile_runtime import diagnostic
            return diagnostic(self._need())
        from apps.access_manager.infrastructure.zte.discovery.diagnostic import diagnostic
        return diagnostic(self._need(),self.model,include_clients=False)

    def factory_reset_preview(self): return self._reset.preview(self._need(),self.host)
    def factory_reset_apply(self, config):
        self.capabilities.require_write('factory_reset')
        return self._reset.apply(self._need(),self.host,config.get("nonce"),config.get("confirmation"))
    def get_nat_sessions(self): return conntrack_status(self._need())
