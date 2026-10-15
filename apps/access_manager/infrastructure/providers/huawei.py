from __future__ import annotations

import re
from apps.access_manager.infrastructure.configuration_adapters import OperationalConfigurations

from apps.access_manager.domain.capabilities import (
    Capability,
    CapabilitySet,
    EvidenceLevel as E,
    SupportStatus as S,
)
from apps.access_manager.infrastructure.huawei.protocol.affinity_client import (
    HuaweiAffinityNegotiatingWebClient,
)
from apps.access_manager.infrastructure.huawei.protocol.detector import HuaweiDetector
from apps.access_manager.infrastructure.huawei.captured import HuaweiCapturedFeatureService
from apps.access_manager.infrastructure.huawei.mapped_surface import HuaweiMappedSurfaceService
from apps.access_manager.infrastructure.huawei.ipv4_filter import HuaweiIPv4FilterService
from apps.access_manager.infrastructure.huawei.profiles import (
    HuaweiUnknownProfile,
    resolve_huawei_profile,
)
from apps.access_manager.infrastructure.huawei.registry import resolve_huawei_model_knowledge
from apps.access_manager.infrastructure.huawei.eg8041_runtime import HuaweiEG8041FamilyRuntime


class HuaweiProvider:
    vendor = "huawei"

    def __init__(self, client_factory=HuaweiAffinityNegotiatingWebClient):
        self._surfaces=OperationalConfigurations(self)
        self.client_factory = client_factory
        self.client = None
        self.model = None
        self.firmware = None
        self.profile = None
        self.captured = None
        self.mapped = None
        self.ipv4 = None
        self.runtime: HuaweiEG8041FamilyRuntime | None = None
        self._caps = CapabilitySet()

    @property
    def connected(self):
        return self.client is not None

    @property
    def capabilities(self):
        return self._caps

    @staticmethod
    def looks_like_huawei(host: str, https: bool = False) -> bool:
        try:
            return HuaweiAffinityNegotiatingWebClient.looks_like_huawei(
                host, https=https
            )
        except Exception:
            return False

    @staticmethod
    def known_models() -> set[str]:
        return {
            "EG8041X7-10", "EG8041X6-10", "EG8145V5", "HN8010TS",
            "HG8245H", "HG8347R", "HG8145X6", "HG8010H", "EG8010H",
            "EG8021V5",
        }

    def connect(
        self,
        host,
        username,
        password,
        *,
        https=False,
        model_hint=None,
        **_,
    ):
        self.disconnect()
        client = self.client_factory(
            host=host,
            username=username,
            password=password,
            https=https,
        )
        client.login()
        detection = HuaweiDetector.detect_authenticated(client)
        detected = detection.model or model_hint or "Huawei"
        profile = (
            resolve_huawei_profile(detected, unknown=True)
            or HuaweiUnknownProfile(detected)
        )
        self.client = client
        self.model = profile.model if profile.key != "huawei_unknown" else detected
        self.profile = profile
        self.firmware = getattr(detection, "firmware", None)
        self.captured = HuaweiCapturedFeatureService(client, model=self.model)
        self.mapped = HuaweiMappedSurfaceService(client, model=self.model)
        self.ipv4 = HuaweiIPv4FilterService(
            client,
            model=self.model,
            capability=profile.ipv4_filter,
        )

        # The legacy EG8041 family was selected from authenticated protocol and
        # object-graph evidence, not from a marketing model name alone.
        if self.model in HuaweiEG8041FamilyRuntime.MODELS:
            candidate = HuaweiEG8041FamilyRuntime(
                client,
                model=self.model,
                firmware=self.firmware,
            )
            if candidate.family_descriptor.get("compatible"):
                self.runtime = candidate
                self.captured = candidate.captured
                self.mapped = candidate.mapped

        self._caps = self._build_caps()
        proto = getattr(client, "protocol_descriptor", lambda: {})() or {}
        family = (
            self.runtime.family_descriptor
            if self.runtime is not None
            else None
        )
        supported_mode = bool(
            profile.key != "huawei_unknown"
            or (family and family.get("compatible"))
        )
        return {
            "vendor": "huawei",
            "model": self.model,
            "firmware": self.firmware,
            "protocol_family": proto.get("protocol_family") or proto.get("family"),
            "family": family,
            "capabilities": self._caps.public(),
            "mode": "supported" if supported_mode else "deployment",
        }

    def disconnect(self):
        self._surfaces.clear()
        if self.client is not None:
            try:
                self.client.close()
            except Exception:
                pass
        self.client = None
        self.model = None
        self.firmware = None
        self.profile = None
        self.captured = None
        self.mapped = None
        self.ipv4 = None
        self.runtime = None
        self._caps = CapabilitySet()

    def _build_caps(self):
        # UNKNOWN means "not proven for this active runtime". It is deliberately
        # different from UNSUPPORTED, which requires negative evidence.
        items = [
            Capability("device", S.SUPPORTED, S.UNSUPPORTED, E.AUTOMATED_TESTED, source="huawei_detector"),
            Capability("clients", S.UNKNOWN, S.UNSUPPORTED, E.UNKNOWN, source="runtime_not_probed"),
            Capability("traffic", S.UNKNOWN, S.UNSUPPORTED, E.UNKNOWN, source="runtime_not_probed"),
            Capability("diagnostics", S.UNKNOWN, S.UNKNOWN, E.UNKNOWN, source="runtime_not_probed"),
            Capability("lan", S.UNKNOWN, S.UNKNOWN, E.UNKNOWN, source="runtime_not_probed"),
            Capability("wan", S.UNKNOWN, S.UNKNOWN, E.UNKNOWN, source="runtime_not_probed"),
            Capability("wifi", S.UNKNOWN, S.UNKNOWN, E.UNKNOWN, source="runtime_not_probed"),
            Capability("wifi_radio", S.UNKNOWN, S.UNKNOWN, E.UNKNOWN, source="runtime_not_probed"),
            Capability("dhcp", S.UNKNOWN, S.UNKNOWN, E.UNKNOWN, source="runtime_not_probed"),
            Capability("dns", S.UNKNOWN, S.UNKNOWN, E.UNKNOWN, source="runtime_not_probed"),
            Capability("optical", S.UNKNOWN, S.UNSUPPORTED, E.UNKNOWN, source="runtime_not_probed"),
            Capability("reboot", S.UNKNOWN, S.UNKNOWN, E.UNKNOWN, destructive=True, source="no_negative_proof"),
        ]

        items.append(Capability('configuration_surfaces',S.SUPPORTED,S.SUPPORTED,E.FIXTURE_VALIDATED,source='mapped_runtime_operational_adapters'))
        items.append(Capability('mesh_read',S.SUPPORTED,S.UNKNOWN,E.SOURCE_CONFIRMED,source='mapped_easymesh_read_only'))
        from apps.access_manager.infrastructure.huawei.reboot import supported as reboot_supported
        if reboot_supported(self.client,self.model):items.append(Capability('reboot',S.SUPPORTED,S.SUPPORTED,E.SOURCE_CONFIRMED,destructive=True,source='hg8245h_auth_family_reboot'))
        items.append(Capability('runtime_diagnostic',S.SUPPORTED,S.UNKNOWN,E.SOURCE_CONFIRMED,source='mapped_read_inventory'))
        profile = self.profile
        if profile is not None:
            for name, spec in profile.captured_features.items():
                read = S.SUPPORTED if spec.get("read") else S.UNKNOWN
                writable = bool(
                    spec.get("write")
                    or spec.get("update")
                    or spec.get("create")
                    or spec.get("delete")
                )
                canonical = {
                    "wifi_basic": "wifi",
                    "wifi_radio": "wifi_radio",
                    "tr069_url": "tr069",
                    "dhcp_static": "dhcp_reservations",
                    "dns_host": "dns_hosts",
                }.get(name, name)
                wired = {
                    "wifi", "wifi_radio", "dns", "dhcp", "dmz", "tr069",
                    "firewall_level", "dhcp_reservations", "dns_hosts", "upnp",
                }
                write = (
                    S.SUPPORTED
                    if writable and canonical in wired
                    else S.PARTIAL
                    if writable
                    else S.UNKNOWN
                )
                ev = (
                    E.PHYSICALLY_VALIDATED
                    if spec.get("verified")
                    else E.FIXTURE_VALIDATED
                )
                items.append(
                    Capability(
                        canonical,
                        read,
                        write,
                        ev,
                        source=f"huawei_profile:{profile.key}",
                    )
                )

            host_spec=profile.captured_features.get('dns_host') or {}
            items.append(Capability('dns_hosts_delete',S.SUPPORTED if host_spec.get('read') else S.UNKNOWN,S.SUPPORTED if host_spec.get('delete') and host_spec.get('verified') else S.UNKNOWN,E.AUTOMATED_TESTED,source='captured_dns_host_delete_writer'))

            ipv = profile.ipv4_filter
            items.append(
                Capability(
                    "ipv4_filter",
                    S.SUPPORTED if ipv.read else S.UNKNOWN,
                    S.PARTIAL if any((ipv.create, ipv.update, ipv.delete)) else S.UNKNOWN,
                    E.PHYSICALLY_VALIDATED if ipv.verified else E.UNKNOWN,
                    source="writer_exists_not_exposed_by_provider_command",
                )
            )

        if self.runtime is not None:
            items.extend(self.runtime.capabilities())

        # Registry improves evidence/context, but never grants a mutation by
        # itself. The live runtime/probe remains authoritative.
        _knowledge = resolve_huawei_model_knowledge(self.model)

        rank = {S.UNSUPPORTED: 0, S.UNKNOWN: 1, S.PARTIAL: 2, S.SUPPORTED: 3}
        erank = {
            E.SOURCE_FOUND: 0, E.DOCUMENTED: 1, E.SOURCE_CONFIRMED: 2, E.FIRMWARE_CONFIRMED: 3,
            E.UNKNOWN: 0,
            E.RESEARCH_ONLY: 1,
            E.IMPLEMENTED: 2,
            E.FIXTURE_VALIDATED: 3,
            E.AUTOMATED_TESTED: 4,
            E.PHYSICALLY_VALIDATED: 5,
        }
        merged = {}
        for item in items:
            old = merged.get(item.name)
            if old is None:
                merged[item.name] = item
                continue
            merged[item.name] = Capability(
                item.name,
                item.read if rank[item.read] >= rank[old.read] else old.read,
                item.write if rank[item.write] >= rank[old.write] else old.write,
                item.evidence if erank[item.evidence] >= erank[old.evidence] else old.evidence,
                item.destructive or old.destructive,
                item.source if erank[item.evidence] >= erank[old.evidence] else old.source,
            )
        merged['wifi_password_read'] = Capability('wifi_password_read',S(self.wifi_password_read_status),S.UNSUPPORTED,E.SOURCE_CONFIRMED,source='eg8041_runtime_targeted_wlan_reader' if self.wifi_password_read_status=='PARTIAL' else 'credential_reader_not_proven')
        return CapabilitySet(merged.values())

    def _need(self):
        if not self.connected:
            raise RuntimeError("Huawei session is not connected")

    def get_device_info(self):
        self._need()
        if str(getattr(self.client,'auth_flow',''))=='api_ses_token':
            import xml.etree.ElementTree as ET
            root=ET.fromstring(self.client.get_page('/api/system/deviceinfo'))
            if root.tag!='response':raise RuntimeError('Resposta de identidade API não reconhecida')
            names={'model':('DeviceName','ProductName','ModelName'),'firmware':('SoftwareVersion',),'hardware':('HardwareVersion',),'serial':('SerialNumber',),'uptime_seconds':('Uptime',)}
            return {**{key:next((root.findtext(n) for n in tags if root.findtext(n)),None) for key,tags in names.items()},'manufacturer':'Huawei'}
        return self.captured.device_status()

    def get_clients(self):
        self._need()
        if self.runtime is not None:
            return self.runtime.clients()
        from apps.access_manager.domain.clients import merge_clients
        return merge_clients(self.captured.lan_clients(), self.captured.wifi_clients())

    @property
    def wifi_password_read_status(self):
        # EG8041 runtime has a targeted WLAN passphrase reader; captured/X6
        # surfaces deliberately return hidden values.
        return 'PARTIAL' if self.runtime is not None and hasattr(self.runtime, '_wifi_password_for_band') else 'UNKNOWN'

    def get_wifi(self, reveal_password: bool = False):
        return {'networks':self.get_wifi_networks(reveal_password), 'radios':self.get_wifi_radios()}

    def get_wifi_networks(self, reveal_password: bool = False):
        self._need()
        networks = (
            self.runtime.wifi_networks(reveal_password=reveal_password)
            if self.runtime is not None
            else self.captured.wifi_networks(reveal_password=reveal_password)
        )
        return networks

    def get_wifi_radios(self):
        self._need()
        with self.captured.read_snapshot():
            return self._read_wifi_radios()

    def _read_wifi_radios(self):
        self._need()
        from apps.access_manager.infrastructure.radio_options import radio_options
        radios=self.captured.wifi_radios()
        for r in radios:
            options={}
            band=r.get('banda') or r.get('band')
            try:
                page='/html/amp/wlanadv/WlanAdvance.asp?'+('5G' if '5' in str(band) else '2G')
                options.update(radio_options(self.captured._page(page)))
                choices=self.captured.wifi_channels(band=band,bandwidth=r.get('largura'),country=r.get('pais') or 'BR')
                options['channel']=[{'value':str(n),'label':str(n)} for group in choices if group.get('source')=='firmware' for n in group.get('canais',[])]
            except Exception: pass
            r['options']=options
            r['sgi_write']=False
        return radios

    def get_wan(self):
        self._need()
        if self.runtime is not None:
            return self.runtime.wan_status()
        return self.captured.wan_status()

    def get_lan(self):
        self._need()
        return self.captured.lan_ports()

    def get_dhcp(self):
        self._need()
        return self.captured.dhcp_status()

    def get_dns(self):
        self._need()
        return self.captured.dns_status()

    def get_optical(self):
        self._need()
        return self.captured.optical_status()

    def get_traffic(self):
        self._need()
        if self.runtime is not None:
            return self.runtime.traffic()
        from apps.access_manager.infrastructure.huawei.telemetry import HuaweiTelemetryReader
        sources = HuaweiTelemetryReader(self.captured).traffic()
        return {'supported':bool(sources),'partial':not bool(sources),'sources':sources}

    def set_ssid_config(self, ssid_id, config):
        self.capabilities.require_write("wifi")
        return self.captured.set_ssid_config(ssid_id, config)

    def set_wifi_radio(self, config):
        self.capabilities.require_write("wifi_radio")
        values = dict(config or {})
        band = values.pop("band", values.pop("banda", None))
        if not band:
            raise ValueError("band is required for Wi-Fi radio configuration")
        return self.captured.set_wifi_radio(band, values)

    def set_dns(self, config):
        self.capabilities.require_write("dns")
        return self.captured.set_dns(config)

    def set_dhcp(self, config):
        self.capabilities.require_write("dhcp")
        return self.captured.set_dhcp_basic(config)

    def set_dmz(self, config):
        self.capabilities.require_write("dmz")
        return self.captured.set_dmz(config)

    def set_tr069(self, config):
        self.capabilities.require_write("tr069")
        return self.captured.set_management_tr069(config)

    def set_firewall(self, config):
        self.capabilities.require_write("firewall_level")
        return self.captured.set_management_firewall(config)

    def ping(self, config):
        self.capabilities.require_write("diagnostics")
        if self.runtime is None:
            raise RuntimeError("No native Huawei diagnostic runtime is proven for this session")
        return self.runtime.ping(config)

    def traceroute(self, config):
        self.capabilities.require_write("diagnostics")
        if self.runtime is None:
            raise RuntimeError("No native Huawei diagnostic runtime is proven for this session")
        return self.runtime.traceroute(config)

    def reboot(self):
        from apps.access_manager.infrastructure.huawei.reboot import reboot
        self.capabilities.require_write('reboot')
        return reboot(self.client,self.model)

    def get_dmz(self):
        self._need(); return self.captured.dmz_status()
    def get_tr069(self):
        self._need()
        result = self.captured.tr069_management_status()
        return {'url': (result.get('server') or {}).get('URL'), 'advanced': result}
    def get_firewall(self):
        self._need()
        result = self.captured.firewall_level_status()
        firewall = result.get('firewall') or {}
        enabled = firewall.get('Enable')
        return {'enabled': None if enabled in (None, '') else str(enabled) == '1', 'level': firewall.get('AdvancedLevel'), 'advanced': result}

    reservation_fields=('ip','mac')
    def save_dhcp_reservation(self, config):
        self.capabilities.require_write('dhcp_reservations')
        if config.get('name'): raise ValueError('Nome não é gravável no formulário DHCP Static Huawei capturado')
        values={'ip':config['ip'],'mac':config['mac']}
        if config.get('id'): return self.captured.update_dhcp_reservation(config['id'],**values)
        return self.captured.create_dhcp_reservation(**values)
    def delete_dhcp_reservation(self, identifier):
        self.capabilities.require_write('dhcp_reservations')
        return self.captured.delete_dhcp_reservation(identifier)

    dns_host_rename=True
    def save_dns_host(self, config):
        self.capabilities.require_write('dns_hosts')
        values={'ip':config['ip'],'domain_name':config['name']}
        if config.get('id'): return self.captured.update_dns_host(config['id'],**values)
        return self.captured.create_dns_host(**values)
    def delete_dns_host(self, identifier):
        self.capabilities.require_write('dns_hosts_delete')
        return self.captured.delete_dns_host(identifier)

    def get_upnp(self):
        from apps.access_manager.domain.presentation import boolean
        data=self.mapped.read_feature('upnp')
        states={}
        for page in data.get('pages') or []:
            for row in page.get('records') or []:
                domain=row.get('domain') or row.get('Domain')
                for key,suffix in (('main_enabled','X_HW_MainUPnP'),('slave_enabled','X_HW_SlvUPnP')):
                    if domain=='InternetGatewayDevice.'+suffix:
                        states[key]=boolean(row.get('Enable'))
        main,slave=states.get('main_enabled'),states.get('slave_enabled')
        return {'available':main is not None and slave is not None,
                'enabled':main if main is not None and main==slave else None,
                'main_enabled':main,'slave_enabled':slave}

    def set_upnp(self, config):
        self.capabilities.require_write('upnp')
        values=dict(config or {})
        if set(values)-{'enabled','main_enabled','slave_enabled'}:
            raise ValueError('Unsupported UPnP field')
        if not values or any(type(v) is not bool for v in values.values()):
            raise ValueError('UPnP requires boolean states')
        current=self.get_upnp()
        if not current['available']:
            raise RuntimeError('UPnP object graph not recognized in this session')
        main=values.get('main_enabled',values.get('enabled',current['main_enabled']))
        slave=values.get('slave_enabled',values.get('enabled',current['slave_enabled']))
        result=self.mapped.write_feature('upnp',{'x.Enable':'1' if main else '0','y.Enable':'1' if slave else '0'})
        if result.get('accepted') or result.get('success'):
            try:
                after=self.get_upnp()
                verified=after['available'] and after['main_enabled']==main and after['slave_enabled']==slave
                result={**result,'success':bool(verified),'verified':bool(verified),'uncertain':not verified}
            except Exception as error:
                result={**result,'success':False,'verified':False,'uncertain':True,'readback_error':type(error).__name__}
        return result

    def surface_catalog(self): return self._surfaces.catalog()
    def surface_read(self, feature): return self._surfaces.inspect(self.client,feature)
    def surface_preview(self, config): return self._surfaces.preview(self.client,str(getattr(self.client,'host','')),config['feature'],config['instance'],config.get('changes') or {},config.get('action','update'))
    def surface_apply(self, config): return self._surfaces.apply(self.client,str(getattr(self.client,'host','')),config['nonce'],config.get('confirmation'))

    def get_mesh(self):
        from apps.access_manager.domain.mesh import normalize_mesh
        data=self.mapped.read_feature('easymesh_topology')
        nodes=[]
        for page in data.get('pages') or []:
            for row in page.get('records') or []:
                if row.get('NodeID'):nodes.append(row)
        return normalize_mesh({'available':bool(nodes),'nodes':nodes})

    def runtime_diagnostic(self):
        from apps.access_manager.infrastructure.huawei.mapped_surface import HUAWEI_MAPPED_FEATURES
        profile=self.profile
        result={}
        for feature,spec in (profile.captured_features if profile else {}).items():
            if not spec.get('read') or feature not in HUAWEI_MAPPED_FEATURES:continue
            # Whitelisted service reads use their existing implementation.
            # No generic externally selected path or POST payload is accepted.
            data=self.mapped.read_feature(feature)
            result[HUAWEI_MAPPED_FEATURES[feature]['label']]={'available':data.get('available',False),'record_count':sum(p.get('record_count',0) for p in data.get('pages',[])),'partial':data.get('partial',False)}
        return {'read_only':True,'sections':result}
