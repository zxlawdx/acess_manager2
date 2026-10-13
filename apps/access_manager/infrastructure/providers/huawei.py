from __future__ import annotations

import re

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
                }.get(name, name)
                wired = {
                    "wifi", "wifi_radio", "dns", "dhcp", "dmz", "tr069",
                    "firewall_level",
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
        return CapabilitySet(merged.values())

    def _need(self):
        if not self.connected:
            raise RuntimeError("Huawei session is not connected")

    def get_device_info(self):
        self._need()
        return self.captured.device_status()

    def get_clients(self):
        self._need()
        if self.runtime is not None:
            return self.runtime.clients()
        # Generic fallback still deduplicates by normalized MAC where possible.
        rows = list(self.captured.lan_clients()) + list(self.captured.wifi_clients())
        merged = {}
        anonymous = []
        for row in rows:
            compact = re.sub(r"[^0-9A-Fa-f]", "", str(row.get("mac") or ""))
            if len(compact) == 12:
                mac = ":".join(compact[i:i+2] for i in range(0, 12, 2)).upper()
                current = merged.setdefault(mac, {"mac": mac})
                for key, value in row.items():
                    if value not in (None, "", [], {}) and current.get(key) in (None, "", [], {}):
                        current[key] = value
            else:
                anonymous.append(row)
        return [*merged.values(), *anonymous]

    def get_wifi(self, reveal_password: bool = False):
        self._need()
        networks = (
            self.runtime.wifi_networks(reveal_password=reveal_password)
            if self.runtime is not None
            else self.captured.wifi_networks(reveal_password=reveal_password)
        )
        return {
            "networks": networks,
            "radios": self.captured.wifi_radios(),
        }

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
        return {
            "supported": False,
            "partial": True,
            "sources": [],
            "reason": "no_counter_source_proven_for_active_huawei_runtime",
        }

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
        # Do not turn the presence of reboot.asp into a production mutation.
        # The legacy EG8041 tree maps the page but does not contain a proven
        # X6/X7 writer. UNKNOWN therefore remains the correct write state.
        self.capabilities.require_write("reboot")
        raise RuntimeError("Huawei reboot writer is not proven for this active runtime")
