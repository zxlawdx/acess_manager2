from __future__ import annotations

import ipaddress
import re
import time
from dataclasses import dataclass
from typing import Any, Callable

from apps.access_manager.domain.capabilities import (
    Capability,
    EvidenceLevel as E,
    SupportStatus as S,
)
from apps.access_manager.infrastructure.huawei.captured import (
    HuaweiCapturedFeatureService,
    _record_domain,
    parse_huawei_js_records,
    DHCP_SERVER_PAGE,
    DNS_PAGE,
    ETH_INFO_PAGE,
    LAN_USER_DEV_PAGE,
    OPTICAL_PAGE,
    USER_DEVICE_PAGE,
    WAN_CACHE_PAGE,
    WAN_INFO_PAGE,
    WLAN_ADV_API_PAGE,
    WLAN_ADV_COMMON_PAGE,
    WLAN_ASSOC_PAGE,
    WLAN_INFO_PAGE,
    WLAN_LIST_PAGE,
)
from apps.access_manager.infrastructure.huawei.mapped_surface import HuaweiMappedSurfaceService
from apps.access_manager.infrastructure.huawei.protocol.diagnostic_result import (
    decode_huawei_diagnostic_result,
)
from apps.access_manager.infrastructure.huawei.registry import resolve_huawei_model_knowledge


@dataclass(frozen=True)
class ProbeResult:
    feature: str
    ok: bool
    evidence: str
    value: Any = None
    error_type: str | None = None


class HuaweiEG8041FamilyRuntime:
    """Evidence-driven AMP/BBSP runtime migrated from the legacy EG8041 family.

    The runtime intentionally does not inherit the X7 operational profile for X6.
    It proves the AMP/BBSP + WLAN object graph first, then promotes read
    capabilities only after successful live reader execution. Write support is
    exposed only where the migrated provider has a concrete implementation and
    the legacy evidence supports the family semantics.
    """

    MODELS = frozenset({"EG8041X6-10", "EG8041X7-10"})
    DEVICE_PAGE = "/html/ssmp/deviceinfo/deviceinfo.asp"
    DIAGNOSTICS_PAGE = "/html/bbsp/maintenance/diagnosecommon.asp"
    PING_RESULT_PATH = "/html/bbsp/maintenance/GetPingResult.asp"
    PING_DNS_PATH = "/html/bbsp/maintenance/GetPingDnsResult.asp"
    TRACE_RESULT_PATH = "/html/bbsp/maintenance/GetRouteResult.asp"
    PING_ACTION = (
        "/html/bbsp/maintenance/complex.cgi?"
        "x=InternetGatewayDevice.IPPingDiagnostics&"
        "RUNSTATE_FLAG=Ping&"
        "RequestFile=html/bbsp/maintenance/diagnosecommon.asp"
    )
    WLAN_PSK_PROTECT_PAGE = "/html/amp/wlanadv/wlanpskprotect.asp"
    TRACE_ACTION = (
        "/html/bbsp/maintenance/complex.cgi?"
        "x=InternetGatewayDevice.TraceRouteDiagnostics&"
        "RUNSTATE_FLAG=Traceroute&"
        "RequestFile=html/bbsp/maintenance/diagnosecommon.asp"
    )

    def __init__(self, client, *, model: str, firmware: str | None = None) -> None:
        self.client = client
        self.model = model
        self.firmware = firmware
        self.captured = HuaweiCapturedFeatureService(client, model=model)
        self.mapped = HuaweiMappedSurfaceService(client, model=model)
        self.knowledge = resolve_huawei_model_knowledge(model)
        self.family_descriptor: dict[str, Any] = {
            "protocol_family": "unknown",
            "firmware_family": "unknown",
            "cfg_mode": None,
            "compatible": False,
            "model": model,
            "evidence": [],
        }
        self.probes: dict[str, ProbeResult] = {}
        self._characterize_family()
        if self.family_descriptor["compatible"]:
            self._probe_reads()

    @staticmethod
    def _safe_cfg_mode(source: str) -> str | None:
        for pattern in (
            r"\bCfgMode\s*(?:=|:)\s*['\"]?([A-Za-z0-9_-]+)",
            r"\bX_HW_CfgMode\s*(?:=|:)\s*['\"]?([A-Za-z0-9_-]+)",
        ):
            match = re.search(pattern, str(source or ""), re.I)
            if match:
                return match.group(1).upper()
        return None

    def _wifi_family_signature(self) -> tuple[bool, list[str]]:
        pages: list[str] = []
        for band in ("2.4GHz", "5GHz"):
            _display, _instance, _basic, advanced = self.captured._wifi_pages(band)
            pages.append(advanced)
        chunks: list[str] = []
        records: list[dict[str, Any]] = []
        for page in (*pages, WLAN_LIST_PAGE, WLAN_ADV_COMMON_PAGE, WLAN_ADV_API_PAGE):
            try:
                html, parsed = self.captured._records(page)
            except Exception:
                continue
            chunks.append(html)
            records.extend(parsed)
        combined = "\n".join(chunks)
        domains = {_record_domain(item) for item in records}
        signatures = (
            "InternetGatewayDevice.LANDevice.1.WLANConfiguration.1",
            "InternetGatewayDevice.LANDevice.1.WLANConfiguration.5",
            "InternetGatewayDevice.LANDevice.1.WiFi.Radio.1",
            "InternetGatewayDevice.LANDevice.1.WiFi.Radio.2",
        )
        evidence = []
        for signature in signatures:
            if signature in combined or any(
                domain == signature or domain.startswith(signature + ".")
                for domain in domains
            ):
                evidence.append(f"object:{signature}")
        return len(evidence) == len(signatures), evidence

    def _characterize_family(self) -> None:
        proto = getattr(self.client, "protocol_descriptor", lambda: {})() or {}
        protocol_family = str(proto.get("family") or proto.get("protocol_family") or "unknown")
        evidence = [str(x) for x in proto.get("evidence") or () if x]
        cfg_mode = None
        try:
            device_source = self.client.get_page(self.DEVICE_PAGE)
            cfg_mode = self._safe_cfg_mode(device_source)
            if cfg_mode:
                evidence.append(f"cfg-mode:{cfg_mode}")
        except Exception:
            pass
        signature_ok = False
        if protocol_family == "amp_bbsp":
            try:
                signature_ok, signature_evidence = self._wifi_family_signature()
                evidence.extend(signature_evidence)
            except Exception:
                signature_ok = False
        known_family = self.model in self.MODELS or cfg_mode == "BREBG2"
        compatible = bool(protocol_family == "amp_bbsp" and signature_ok and known_family)
        self.family_descriptor = {
            "protocol_family": protocol_family,
            "firmware_family": "BREBG2-like" if compatible else "unknown",
            "cfg_mode": cfg_mode,
            "compatible": compatible,
            "model": self.model,
            "evidence": list(dict.fromkeys(evidence)),
        }

    _READ_SURFACES = {
        "wan": (WAN_INFO_PAGE, WAN_CACHE_PAGE),
        "optical": (OPTICAL_PAGE,),
        "wifi": (WLAN_LIST_PAGE,),
        "wifi_radio": (WLAN_ADV_COMMON_PAGE, WLAN_ADV_API_PAGE),
        "lan": (ETH_INFO_PAGE,),
        "clients": (USER_DEVICE_PAGE, LAN_USER_DEV_PAGE, WLAN_INFO_PAGE, WLAN_ASSOC_PAGE),
        "dhcp": (DHCP_SERVER_PAGE,),
        "dns": (DNS_PAGE,),
    }

    def _surface_available(self, feature: str) -> bool:
        """Prove a read surface even when the normalized result is legitimately empty.

        Empty station/LAN lists are valid states.  A successful authenticated read of
        a feature-specific endpoint is therefore evidence that the reader exists; it
        must not be downgraded to UNKNOWN solely because zero rows were returned.
        """
        for path in self._READ_SURFACES.get(feature, ()):
            try:
                if path in {LAN_USER_DEV_PAGE, WLAN_ASSOC_PAGE}:
                    source = self.client.post_read(path, {}, referer=USER_DEVICE_PAGE if path == LAN_USER_DEV_PAGE else WLAN_INFO_PAGE)
                else:
                    source = self.client.get_page(path)
            except Exception:
                continue
            if source is not None:
                return True
        return False

    @staticmethod
    def _meaningful_probe_value(feature: str, value: Any) -> bool:
        if feature in {"wan", "wifi", "wifi_radio", "lan", "clients"}:
            return isinstance(value, list) and bool(value)
        if feature == "device":
            return isinstance(value, dict) and any(
                value.get(key) not in (None, "")
                for key in ("modelo", "model", "firmware", "hardware", "uptime")
            )
        if feature == "optical":
            return isinstance(value, dict) and any(
                value.get(key) not in (None, "")
                for key in ("rx", "tx", "rx_power", "tx_power", "temperature", "voltage")
            )
        if feature == "dhcp":
            basic = value.get("basic", {}) if isinstance(value, dict) else {}
            return any(
                basic.get(key) not in (None, "")
                for key in ("ServerEnable", "MinAddress", "MaxAddress", "LeaseTime", "IPAddr", "SubnetMask")
            )
        if feature == "dns":
            if not isinstance(value, dict):
                return False
            return any(value.get(key) not in (None, "", []) for key in ("domain_name", "ipv4_1", "ipv4_2", "ipv6_1", "ipv6_2", "hosts", "_search_rows"))
        if feature == "dmz":
            return isinstance(value, dict) and bool(value.get("available"))
        if feature in {"tr069", "firewall_level"}:
            return isinstance(value, dict) and bool(value) and any(v not in (None, "", [], {}) for k, v in value.items() if k not in {"warnings", "capabilities"})
        return value not in (None, "", [], {})

    def _probe(self, feature: str, reader: Callable[[], Any]) -> None:
        try:
            value = reader()
        except Exception as exc:
            self.probes[feature] = ProbeResult(
                feature=feature,
                ok=False,
                evidence="runtime_probe_failed",
                error_type=type(exc).__name__,
            )
            return
        if not self._meaningful_probe_value(feature, value):
            if self._surface_available(feature):
                self.probes[feature] = ProbeResult(
                    feature=feature,
                    ok=True,
                    evidence="runtime_surface_probe_empty_state",
                    value=value,
                )
                return
            self.probes[feature] = ProbeResult(
                feature=feature,
                ok=False,
                evidence="runtime_probe_empty_or_unproven",
                value=value,
            )
            return
        physical = bool(
            self.knowledge
            and feature in set(self.knowledge.physically_validated_features)
        )
        self.probes[feature] = ProbeResult(
            feature=feature,
            ok=True,
            evidence=(
                "LOCAL_FIRMWARE_OBSERVED+runtime_probe"
                if physical
                else "runtime_probe"
            ),
            value=value,
        )

    def _probe_reads(self) -> None:
        for feature, reader in (
            ("device", self.captured.device_status),
            ("wan", self.captured.wan_status),
            ("optical", self.captured.optical_status),
            ("wifi", self.captured.wifi_networks),
            ("wifi_radio", self.captured.wifi_radios),
            ("lan", self.captured.lan_ports),
            ("clients", self.clients),
            ("dhcp", self.captured.dhcp_status),
            ("dns", self.captured.dns_status),
            ("dmz", self.captured.dmz_status),
            ("tr069", self.captured.tr069_management_status),
            ("firewall_level", self.captured.firewall_level_status),
        ):
            self._probe(feature, reader)
        try:
            channels = {
                "2.4ghz": self.captured.wifi_channels("2.4GHz", country="BR"),
                "5ghz": self.captured.wifi_channels("5GHz", country="BR"),
            }
            self.probes["wifi_channel_discovery"] = ProbeResult(
                feature="wifi_channel_discovery",
                ok=True,
                evidence=(
                    "LOCAL_FIRMWARE_OBSERVED+runtime_probe"
                    if self.model == "EG8041X6-10"
                    else "runtime_probe"
                ),
                value=channels,
            )
        except Exception as exc:
            self.probes["wifi_channel_discovery"] = ProbeResult(
                feature="wifi_channel_discovery",
                ok=False,
                evidence="runtime_probe_failed",
                error_type=type(exc).__name__,
            )
        try:
            reboot_page = self.mapped.read_feature("reboot")
            self.probes["reboot_surface"] = ProbeResult(
                feature="reboot_surface",
                ok=bool(reboot_page.get("available")),
                evidence="mapped_page_probe",
                value=reboot_page,
            )
        except Exception as exc:
            self.probes["reboot_surface"] = ProbeResult(
                feature="reboot_surface",
                ok=False,
                evidence="runtime_probe_failed",
                error_type=type(exc).__name__,
            )

    @staticmethod
    def _normalize_mac(value: object) -> str:
        compact = re.sub(r"[^0-9A-Fa-f]", "", str(value or ""))
        if len(compact) != 12:
            return ""
        return ":".join(compact[i:i+2] for i in range(0, 12, 2)).upper()

    @staticmethod
    def _merge_known(base: dict[str, Any], incoming: dict[str, Any]) -> dict[str, Any]:
        result = dict(base)
        for key, value in incoming.items():
            if value in (None, "", [], {}):
                continue
            if result.get(key) in (None, "", [], {}):
                result[key] = value
            elif key in {"status", "online"}:
                result[key] = value
        return result

    _WIFI_SECRET_FIELDS = (
        "PreSharedKey", "KeyPassphrase", "WPAKey", "WPA2Key",
        "WPA3Key", "PSK", "Key",
    )

    @staticmethod
    def _valid_wifi_secret(value: object) -> str:
        text = str(value or "").strip()
        if not text or text.startswith("InternetGatewayDevice."):
            return ""
        if set(text) <= {"*", "•", "·"}:
            return ""
        if 8 <= len(text) <= 63:
            return text
        if len(text) == 64 and all(char in "0123456789abcdefABCDEF" for char in text):
            return text
        return ""

    def _wifi_password_for_band(self, band: str) -> str:
        _display, instance, _page, _advanced = self.captured._wifi_pages(band)
        record, records = self.captured._wifi_basic_record(band)
        base_domain = f"InternetGatewayDevice.LANDevice.1.WLANConfiguration.{instance}"
        psk_domain = f"{base_domain}.PreSharedKey.1"
        try:
            protected = self.client.get_page(self.WLAN_PSK_PROTECT_PAGE)
            for item in parse_huawei_js_records(protected):
                domain = _record_domain(item)
                if domain == base_domain or domain.startswith(base_domain + ".PreSharedKey."):
                    records.append(item)
        except Exception:
            pass
        candidates = [record, *records]
        candidates.sort(key=lambda row: 0 if _record_domain(row) == psk_domain else 1 if _record_domain(row) == base_domain else 2)
        for row in candidates:
            domain = _record_domain(row)
            if domain not in {"", base_domain, psk_domain} and not domain.startswith(base_domain + ".PreSharedKey."):
                continue
            for key in self._WIFI_SECRET_FIELDS:
                secret = self._valid_wifi_secret(row.get(key))
                if secret:
                    return secret
            constructor = str(row.get("_constructor") or "").casefold()
            if "preshared" in constructor or "psk" in constructor:
                for value in reversed(row.get("_args") or []):
                    secret = self._valid_wifi_secret(value)
                    if secret:
                        return secret
        return ""

    def wifi_networks(self, *, reveal_password: bool = False) -> list[dict[str, Any]]:
        networks = [dict(row) for row in self.captured.wifi_networks(reveal_password=False)]
        if not reveal_password:
            return networks
        revealed = 0
        for row in networks:
            password = self._wifi_password_for_band(str(row.get("banda") or ""))
            row["password"] = password
            row["password_hidden"] = not bool(password)
            revealed += int(bool(password))
        if networks and not revealed:
            raise RuntimeError("Este firmware/login não expôs a senha Wi-Fi atual para leitura.")
        return networks

    def wan_status(self) -> list[dict[str, Any]]:
        """Normalize the richer legacy WAN semantics without inventing fields."""
        rows = []
        ppp = {row.get("id"): row for row in self.captured.pppoe_status(reveal_password=False)}
        for raw in self.captured.wan_status() or []:
            row = dict(raw)
            domain = str(row.get("id") or "")
            service = str(row.get("services") or "")
            row.update({
                "object_path": domain,
                "display_name": row.get("nome") or domain,
                "connection_type": row.get("wan_type") or ("PPPoE" if "WANPPPConnection" in domain else "IP"),
                "service_type": service,
                "ipv4": row.get("ip") or "",
                "dns": [value for value in (row.get("dns1"), row.get("dns2")) if value],
                "default_route": bool(row.get("gateway")),
                "pppoe_username": (ppp.get(domain) or {}).get("username") or "",
                "pppoe_status": row.get("status") if (row.get("wan_type") == "PPPoE" or "WANPPPConnection" in domain) else "",
            })
            rows.append(row)
        return rows

    def clients(self) -> list[dict[str, Any]]:
        lan = list(self.captured.lan_clients() or [])
        wifi = list(self.captured.wifi_clients() or [])
        merged: dict[str, dict[str, Any]] = {}
        anonymous: list[dict[str, Any]] = []
        for rows, connection_type in ((lan, "lan"), (wifi, "wifi")):
            for row in rows:
                mac = self._normalize_mac(row.get("mac"))
                normalized = {
                    "hostname": row.get("hostname") or "",
                    "ip": row.get("ip") or row.get("ipv4") or "",
                    "ipv4": row.get("ipv4") or row.get("ip") or "",
                    "ipv6": row.get("ipv6") or "",
                    "mac": mac,
                    "interface": row.get("interface") or "",
                    "connection_type": row.get("connection_type") or connection_type,
                    "status": row.get("status") if row.get("status") not in (None, "") else row.get("online", ""),
                    "online": row.get("online") if row.get("online") is not None else row.get("status", ""),
                    "lease": row.get("lease") or "",
                    "ssid": row.get("ssid") or row.get("radio") or "",
                    "band": row.get("band") or row.get("banda") or "",
                    "rssi": row.get("rssi") if row.get("rssi") is not None else "",
                    "snr": row.get("snr") if row.get("snr") is not None else "",
                    "rx_rate": row.get("rx_rate") if row.get("rx_rate") is not None else "",
                    "tx_rate": row.get("tx_rate") if row.get("tx_rate") is not None else "",
                    "rx_bytes": row.get("rx_bytes") if row.get("rx_bytes") is not None else "",
                    "tx_bytes": row.get("tx_bytes") if row.get("tx_bytes") is not None else "",
                }
                if mac:
                    merged[mac] = self._merge_known(merged.get(mac, {}), normalized)
                else:
                    key = "|".join(
                        str(normalized.get(k) or "").strip().lower()
                        for k in ("ip", "hostname", "interface", "connection_type")
                    )
                    if key.strip("|"):
                        prior = next((x for x in anonymous if x.get("_dedup_key") == key), None)
                        if prior is None:
                            normalized["_dedup_key"] = key
                            anonymous.append(normalized)
                        else:
                            prior.update(self._merge_known(prior, normalized))
        result = list(merged.values())
        for row in anonymous:
            row.pop("_dedup_key", None)
            result.append(row)
        return result

    def traffic(self) -> dict[str, Any]:
        wan_rows = list(self.wan_status() or [])
        lan_rows = list(self.captured.lan_ports() or [])
        counter_keys = (
            "rx_bytes", "tx_bytes", "rx_packets", "tx_packets",
            "BytesReceived", "BytesSent", "PacketsReceived", "PacketsSent",
        )
        observed = []
        for source, rows in (("wan", wan_rows), ("lan", lan_rows)):
            for row in rows:
                counters = {k: row.get(k) for k in counter_keys if row.get(k) not in (None, "")}
                if counters:
                    observed.append({"source": source, "identity": row.get("id") or row.get("port") or row.get("nome") or "", "counters": counters})
        return {
            "supported": bool(observed),
            "partial": not bool(observed),
            "sources": observed,
            "wan": wan_rows,
            "lan": lan_rows,
            "reason": None if observed else "legacy_runtime_exposes_wan_lan_surfaces_but_active_counter_fields_were_not_observed",
        }

    @staticmethod
    def _status_evidence(probe: ProbeResult | None, feature: str, model: str) -> E:
        if not probe or not probe.ok:
            return E.UNKNOWN
        if "LOCAL_FIRMWARE_OBSERVED" in probe.evidence:
            return E.PHYSICALLY_VALIDATED
        if model == "EG8041X6-10" and feature in {"wifi", "wifi_radio", "wan", "device"}:
            return E.FIXTURE_VALIDATED
        return E.IMPLEMENTED

    def capabilities(self) -> list[Capability]:
        out: list[Capability] = []
        for feature in ("device", "wan", "optical", "wifi", "wifi_radio", "lan", "clients", "dhcp", "dns", "dmz", "tr069", "firewall_level"):
            probe = self.probes.get(feature)
            read = S.SUPPORTED if probe and probe.ok else S.UNKNOWN
            write = S.UNKNOWN
            if feature in {"wifi", "wifi_radio"} and probe and probe.ok:
                # The X6 legacy runtime explicitly routes the shared AMP/BBSP
                # mutation surface through read-back. It is implemented, but
                # not labelled physically validated merely from X7 evidence.
                write = S.SUPPORTED
            elif self.model == "EG8041X7-10" and feature in {"dhcp", "dns", "dmz", "tr069", "firewall_level"} and probe and probe.ok:
                write = S.SUPPORTED
            out.append(Capability(
                feature,
                read,
                write,
                self._status_evidence(probe, feature, self.model),
                source=f"eg8041_runtime:{probe.evidence if probe else 'not_probed'}",
            ))
        channel = self.probes.get("wifi_channel_discovery")
        out.append(Capability(
            "wifi_channel_discovery",
            S.SUPPORTED if channel and channel.ok else S.UNKNOWN,
            S.UNSUPPORTED,
            self._status_evidence(channel, "wifi_channel_discovery", self.model),
            source=f"eg8041_runtime:{channel.evidence if channel else 'not_probed'}",
        ))
        # Native ping/traceroute were physically exercised on local X6/X7.
        diag_physical = bool(self.model in self.MODELS and self.knowledge and {"diagnostics.ping", "diagnostics.traceroute"}.issubset(set(self.knowledge.physically_validated_features)))
        out.append(Capability(
            "diagnostics",
            S.SUPPORTED if diag_physical else S.UNKNOWN,
            S.SUPPORTED if diag_physical else S.UNKNOWN,
            E.PHYSICALLY_VALIDATED if diag_physical else E.UNKNOWN,
            source="eg8041_native_ping_traceroute",
        ))
        traffic = self.traffic()
        out.append(Capability(
            "traffic",
            S.SUPPORTED if traffic["supported"] else S.PARTIAL,
            S.UNSUPPORTED,
            E.IMPLEMENTED if traffic["supported"] else E.FIXTURE_VALIDATED,
            source="eg8041_wan_lan_counter_sources",
        ))
        reboot_probe = self.probes.get("reboot_surface")
        out.append(Capability(
            "reboot",
            S.SUPPORTED if reboot_probe and reboot_probe.ok else S.UNKNOWN,
            S.UNKNOWN,
            E.IMPLEMENTED if reboot_probe and reboot_probe.ok else E.UNKNOWN,
            destructive=True,
            source="mapped_reboot_page_only_no_proven_writer",
        ))
        return out

    @staticmethod
    def _diagnostic_complete(state: str) -> bool:
        value = str(state or "").strip().casefold()
        return bool(value and "complete" in value and "err" not in value and "error" not in value)

    @classmethod
    def _diagnostic_terminal_failure(cls, state: str) -> bool:
        value = str(state or "").strip().casefold()
        if not value or any(x in value for x in ("requested", "doing", "running", "none", "start")):
            return False
        if cls._diagnostic_complete(state):
            return False
        return any(x in value for x in ("err", "error", "fail", "exceeded"))

    @classmethod
    def _diagnostic_terminal(cls, state: str) -> bool:
        return cls._diagnostic_complete(state) or cls._diagnostic_terminal_failure(state)

    def _poll_diagnostic(self, path: str, *, deadline_seconds: float) -> tuple[str, str, bool]:
        deadline = time.monotonic() + max(1.0, float(deadline_seconds))
        last_output = ""; last_state = ""
        while True:
            remaining = deadline - time.monotonic()
            if remaining <= 0:
                return last_output, last_state or "Timeout", False
            try:
                source = self.client.post_read(path, {}, referer=self.DIAGNOSTICS_PAGE)
            except Exception:
                time.sleep(min(1.0, max(0.0, remaining)))
                continue
            output, state = decode_huawei_diagnostic_result(source)
            if output: last_output = output
            if state: last_state = state
            if self._diagnostic_terminal(last_state):
                return last_output, last_state, True
            time.sleep(min(1.0, max(0.0, deadline - time.monotonic())))

    @staticmethod
    def _parse_ping_output(output: str, *, requested_count: int) -> dict[str, Any]:
        text = str(output or "")
        transmitted = received = loss = None
        minimum = average = maximum = None
        def number(value: str) -> float:
            return float(str(value).replace(",", "."))
        packet = re.search(r"(\d+)\s+packets?\s+transmitted\s*[,;]?\s*(\d+)\s+(?:packets?\s+)?received", text, re.I | re.S)
        if packet:
            transmitted, received = int(packet.group(1)), int(packet.group(2))
        loss_match = re.search(r"(\d+(?:[.,]\d+)?)\s*%\s*(?:packet\s+)?loss", text, re.I)
        if loss_match:
            loss = number(loss_match.group(1)); loss = int(loss) if float(loss).is_integer() else loss
        rtt = re.search(r"(?:round-trip|rtt)[^=\n]*=\s*(\d+(?:[.,]\d+)?)\s*/\s*(\d+(?:[.,]\d+)?)\s*/\s*(\d+(?:[.,]\d+)?)", text, re.I)
        if rtt:
            minimum, average, maximum = map(number, rtt.groups())
        if transmitted is None and received is not None:
            transmitted = requested_count
        if received is None and transmitted is not None and loss is not None:
            received = max(0, int(round(transmitted * (100.0 - float(loss)) / 100.0)))
        failure = max(0, transmitted - received) if transmitted is not None and received is not None else None
        return {"sucesso": received, "falha": failure, "perda_percentual": loss, "minimo_ms": minimum, "medio_ms": average, "maximo_ms": maximum}

    @staticmethod
    def _parse_traceroute_hops(output: str) -> list[dict[str, Any]]:
        hops=[]
        for raw_line in str(output or "").splitlines():
            line=raw_line.strip(); match=re.match(r"^(\d+)\s+(.+)$", line)
            if not match: continue
            number=int(match.group(1)); body=match.group(2).strip()
            latencies=[float(x) for x in re.findall(r"(\d+(?:\.\d+)?)\s*ms", body, re.I)]
            address_match=re.search(r"(?:(?:\d{1,3}\.){3}\d{1,3}|(?:[0-9a-f]{0,4}:){2,}[0-9a-f:]+)", body, re.I)
            hops.append({"numero":number,"ip":address_match.group(0) if address_match else "","latencias_ms":latencies,"timeout":"*" in body and not latencies,"linha":body})
        return hops

    @staticmethod
    def _parse_resolved_ip(source: str) -> str | None:
        for candidate in re.findall(r"[0-9A-Fa-f:.]+", str(source or "")):
            value = candidate.strip(".:")
            try:
                ipaddress.ip_address(value)
            except ValueError:
                continue
            return value
        return None

    def ping(self, config: dict[str, Any]) -> dict[str, Any]:
        values=dict(config or {}); host=str(values.get("host") or "").strip()
        if not host: raise ValueError("Informe o destino do ping.")
        count=max(1,int(values.get("count") or 4)); data_size=max(32,int(values.get("data_size") or 56)); timeout_ms=max(1000,int(values.get("timeout") or 5000)); interface=str(values.get("interface") or "").strip()
        payload={"x.Host":host,"x.DiagnosticsState":"Requested","x.NumberOfRepetitions":str(count),"x.DSCP":str(values.get("dscp") or 0),"x.DataBlockSize":str(data_size),"x.Timeout":str(timeout_ms),"RUNSTATE_FLAG.value":"START"}
        if interface: payload["x.Interface"]=interface
        submitted=self.mapped.write_request(self.PING_ACTION,payload,referer=self.DIAGNOSTICS_PAGE,token_page=self.DIAGNOSTICS_PAGE)
        if submitted.get("accepted") is False:
            raise RuntimeError("A ONT Huawei recusou o início do ping.")
        output,state,complete=self._poll_diagnostic(self.PING_RESULT_PATH,deadline_seconds=min(60.0,max(12.0,(count*timeout_ms/1000.0)+5.0)))
        stats=self._parse_ping_output(output,requested_count=count)
        resolved_ip=None
        try:
            resolved_ip=self._parse_resolved_ip(self.client.post_read(self.PING_DNS_PATH,{},referer=self.DIAGNOSTICS_PAGE))
        except Exception:
            pass
        success=bool(complete and not self._diagnostic_terminal_failure(state) and (stats.get("sucesso") or 0)>0)
        return {"provider":"huawei","host":host,"target":host,"resolved_ip":resolved_ip,"interface":interface,"diagnostics_state":state,"resultado":output,"verified":complete,"success":success,"uncertain":not complete,**stats}

    def _active_ppp_internet_interface(self) -> str:
        candidates=[]
        for item in self.wan_status() or []:
            domain=str(item.get("id") or "")
            if "WANPPPConnection" not in domain: continue
            status=str(item.get("status") or "").strip().casefold()
            if status not in {"1","up","online","connected","linkup"}: continue
            searchable=" ".join(str(item.get(k) or "") for k in ("nome","services","wan_type")).casefold()
            score=2 if "internet" in searchable else 0
            if "tr069" in searchable: score += 1
            candidates.append((score,domain))
        if not candidates:
            raise RuntimeError("Nenhuma WAN PPP de Internet ativa foi identificada para o traceroute.")
        candidates.sort(key=lambda x:x[0],reverse=True)
        return candidates[0][1]

    def traceroute(self, config: dict[str, Any]) -> dict[str, Any]:
        values=dict(config or {}); host=str(values.get("host") or "").strip()
        if not host: raise ValueError("Informe o destino do traceroute.")
        interface=str(values.get("interface") or "").strip() or self._active_ppp_internet_interface(); data_size=max(38,int(values.get("data_size") or 38)); timeout_ms=max(2000,int(values.get("timeout") or 5000))
        payload={"x.Interface":interface,"x.X_HW_ProtocolType":"0","x.DiagnosticsState":"Requested","x.Host":host,"x.DataBlockSize":str(data_size),"RUNSTATE_FLAG.value":"START"}
        submitted=self.mapped.write_request(self.TRACE_ACTION,payload,referer=self.DIAGNOSTICS_PAGE,token_page=self.DIAGNOSTICS_PAGE)
        if submitted.get("accepted") is False:
            raise RuntimeError("A ONT Huawei recusou o início do traceroute.")
        output,state,complete=self._poll_diagnostic(self.TRACE_RESULT_PATH,deadline_seconds=min(60.0,max(20.0,(timeout_ms/1000.0)+15.0)))
        success=bool(complete and not self._diagnostic_terminal_failure(state))
        return {"provider":"huawei","host":host,"target":host,"interface":interface,"protocol":"AUTO","protocol_code":"0","diagnostics_state":state,"hops":self._parse_traceroute_hops(output),"resultado":output,"verified":complete,"success":success,"uncertain":not complete}
