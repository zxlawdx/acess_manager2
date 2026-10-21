from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from enum import StrEnum
import math
import re
from typing import Any


class TriageStatus(StrEnum):
    OK = "OK"
    INFO = "INFO"
    WARNING = "WARNING"
    CRITICAL = "CRITICAL"
    UNKNOWN = "UNKNOWN"
    UNSUPPORTED = "UNSUPPORTED"


@dataclass(frozen=True)
class TriageEvidence:
    source: str
    key: str
    value: Any
    expected: Any = None
    origin: str = "device_snapshot"
    timestamp: str | None = None
    command_or_reader: str | None = None
    confidence: str | None = None
    kind: str = "FACT"

    def public(self) -> dict[str, Any]:
        return asdict(self)


@dataclass(frozen=True)
class TriageIssue:
    code: str
    category: str
    severity: TriageStatus
    title: str
    description: str
    evidence: tuple[TriageEvidence, ...] = ()
    suggested_action: str | None = None

    def public(self) -> dict[str, Any]:
        data = asdict(self)
        data["severity"] = self.severity.value
        data["evidence"] = [item.public() for item in self.evidence]
        return data


@dataclass(frozen=True)
class TriageResult:
    status: TriageStatus
    issues: tuple[TriageIssue, ...]
    checked_at: str
    partial: bool
    source_revision: str | None = None
    coverage: dict[str, str] = field(default_factory=dict)

    def public(self) -> dict[str, Any]:
        return {
            "status": self.status.value,
            "issues": [item.public() for item in self.issues],
            "checked_at": self.checked_at,
            "partial": self.partial,
            "source_revision": self.source_revision,
            "coverage": dict(self.coverage),
        }


def _number(value: Any) -> float | None:
    if value is None or isinstance(value, bool):
        return None
    if isinstance(value, (int, float)):
        value = float(value)
        return value if math.isfinite(value) else None
    match = re.search(r"-?\d+(?:[.,]\d+)?", str(value))
    if not match:
        return None
    try:
        result = float(match.group(0).replace(",", "."))
    except ValueError:
        return None
    return result if math.isfinite(result) else None


def _capability_state(capabilities: dict[str, Any], feature: str) -> TriageStatus:
    cap = capabilities.get(feature) or {}
    state = str(cap.get("read") or "UNKNOWN").upper()
    if state == "UNSUPPORTED":
        return TriageStatus.UNSUPPORTED
    if state in {"SUPPORTED", "PARTIAL"}:
        return TriageStatus.OK
    return TriageStatus.UNKNOWN


def _link_is_down(row: dict[str, Any]) -> bool:
    value = str(
        row.get("link_state")
        or row.get("status")
        or row.get("link")
        or row.get("state")
        or ""
    ).strip().casefold()
    return value in {
        "down", "no_link", "no link", "sem link", "disconnected", "desconectado",
        "inactive", "inativo", "not connected", "unplugged", "off",
    }


def _link_is_up(row: dict[str, Any]) -> bool:
    value = str(
        row.get("link_state")
        or row.get("status")
        or row.get("link")
        or row.get("state")
        or ""
    ).strip().casefold()
    return value in {"up", "link", "linked", "connected", "conectado", "active", "ativo", "on"}


def _severity_result(issues: list[TriageIssue], partial: bool) -> TriageStatus:
    severities = {item.severity for item in issues}
    if TriageStatus.CRITICAL in severities:
        return TriageStatus.CRITICAL
    if TriageStatus.WARNING in severities:
        return TriageStatus.WARNING
    if TriageStatus.INFO in severities:
        return TriageStatus.INFO
    return TriageStatus.UNKNOWN if partial else TriageStatus.OK


def evaluate_snapshot(
    snapshot: dict[str, Any],
    *,
    capabilities: dict[str, Any] | None = None,
    checked_at: str | None = None,
    source_revision: str | None = None,
) -> TriageResult:
    """Evaluate an already-collected device snapshot without probing the device.

    The dashboard owns collection. This function is intentionally pure so that
    triage cannot create a second polling loop or race stateful ONT sessions.
    Missing measurements never become failures.
    """
    capabilities = capabilities or snapshot.get("capabilities") or {}
    errors = snapshot.get("errors") or {}
    issues: list[TriageIssue] = []
    coverage: dict[str, str] = {}

    def mark(feature: str, data: Any) -> None:
        if feature in errors:
            coverage[feature] = TriageStatus.UNKNOWN.value
            return
        cap = _capability_state(capabilities, feature)
        if cap == TriageStatus.UNSUPPORTED:
            coverage[feature] = cap.value
        elif data is None:
            coverage[feature] = TriageStatus.UNKNOWN.value
        else:
            coverage[feature] = TriageStatus.OK.value

    # WAN -----------------------------------------------------------------
    wan_raw = snapshot.get("wan")
    mark("wan", wan_raw)
    wan_rows = wan_raw if isinstance(wan_raw, list) else [wan_raw] if isinstance(wan_raw, dict) else []
    wan = next((row for row in wan_rows if isinstance(row, dict)), None)
    if wan:
        state = str(wan.get("status") or wan.get("state") or "").strip().casefold()
        if state in {"down", "disconnected", "desconectado", "inactive", "failed", "error"}:
            issues.append(TriageIssue(
                "WAN_DISCONNECTED", "WAN", TriageStatus.CRITICAL,
                "WAN desconectada",
                "A interface WAN informou estado desconectado nesta coleta.",
                (TriageEvidence("wan", "status", wan.get("status") or wan.get("state"), "up"),),
                "Verificar autenticação, link e parâmetros da WAN antes de reiniciar o equipamento.",
            ))

    # LAN -----------------------------------------------------------------
    lan = snapshot.get("lan")
    mark("lan", lan)
    rows = lan if isinstance(lan, list) else (lan.get("ports") if isinstance(lan, dict) else [])
    for index, row in enumerate(rows or []):
        if not isinstance(row, dict) or _link_is_down(row):
            # NO_LINK is not a degraded link.
            continue
        speed = _number(row.get("speed") or row.get("speed_mbps") or row.get("rate"))
        if speed is None:
            continue
        port = row.get("port") or row.get("name") or row.get("id") or index + 1
        expected = _number(
            row.get("expected_speed") or row.get("expected_mbps")
            or row.get("max_speed") or row.get("max_mbps")
        )
        degraded = speed <= 10 or (speed <= 100 and expected is not None and expected >= 1000)
        if degraded:
            issues.append(TriageIssue(
                f"LAN_DEGRADED_{port}", "LAN", TriageStatus.WARNING,
                f"Porta LAN {port} negociando a {speed:g} Mbps",
                "A porta possui link, porém negociou abaixo da velocidade esperada.",
                (TriageEvidence("lan", "speed_mbps", speed, expected),),
                "Validar cabo, conectores, placa de rede e negociação da porta.",
            ))
        duplex = str(row.get("duplex") or "").strip().casefold()
        if _link_is_up(row) and duplex in {"half", "half-duplex", "meio", "meia"}:
            issues.append(TriageIssue(
                f"LAN_HALF_DUPLEX_{port}", "LAN", TriageStatus.WARNING,
                f"Porta LAN {port} em half-duplex",
                "A porta está com link ativo, mas a negociação de duplex é degradada.",
                (TriageEvidence("lan", "duplex", row.get("duplex"), "full"),),
                "Verificar cabeamento e negociação automática nas duas pontas.",
            ))

    # DNS -----------------------------------------------------------------
    dns = snapshot.get("dns")
    mark("dns", dns)
    configured = False
    if isinstance(dns, dict):
        configured = any(dns.get(key) for key in ("ipv4_1", "ipv4_2", "ipv6_1", "ipv6_2", "primary", "secondary"))
        configured = configured or bool(dns.get("servers"))
    lookup = snapshot.get("dns_lookup")
    if lookup is not None:
        origin = str((lookup or {}).get("origin") or "ont").casefold() if isinstance(lookup, dict) else "ont"
        # Workstation resolution never proves the ONT resolver health.
        if origin in {"ont", "device", "router", "firmware"}:
            success = (lookup or {}).get("success") if isinstance(lookup, dict) else None
            status = str((lookup or {}).get("status") or "").casefold() if isinstance(lookup, dict) else ""
            addresses = (lookup or {}).get("addresses") if isinstance(lookup, dict) else None
            failed = success is False or status in {"failed", "failure", "error", "timeout"}
            if addresses == [] and (success is not None or status):
                failed = True
            if configured and failed:
                issues.append(TriageIssue(
                    "DNS_ONT_LOOKUP_FAILED", "DNS", TriageStatus.WARNING,
                    "DNS configurado, mas o lookup da ONT falhou",
                    "Há servidor DNS configurado/recebido, porém a resolução executada ou observada na ONT não foi confirmada.",
                    (
                        TriageEvidence("dns", "configured", True, True),
                        TriageEvidence("dns_lookup", "status", status or success, "success", origin=origin),
                    ),
                    "Executar o diagnóstico DNS completo da ONT e validar os servidores configurados.",
                ))
            coverage["dns_lookup"] = TriageStatus.OK.value if not failed else TriageStatus.WARNING.value
        else:
            coverage["dns_lookup"] = TriageStatus.UNKNOWN.value
    else:
        coverage["dns_lookup"] = (
            TriageStatus.UNSUPPORTED.value
            if _capability_state(capabilities, "dns_lookup") == TriageStatus.UNSUPPORTED
            else TriageStatus.UNKNOWN.value
        )

    # GPON / optical ------------------------------------------------------
    optical = snapshot.get("optical")
    mark("optical", optical)
    if isinstance(optical, dict):
        los = optical.get("los")
        registration = str(optical.get("registration_status") or optical.get("status") or "").casefold()
        if los is True or registration in {"los", "down", "offline", "unregistered", "desregistrado"}:
            issues.append(TriageIssue(
                "GPON_LOS", "GPON", TriageStatus.CRITICAL,
                "Perda de sinal óptico / registro GPON indisponível",
                "A coleta da ONT indica LOS ou ausência de registro óptico.",
                (TriageEvidence("optical", "los", los if los is not None else registration, False),),
                "Verificar potência, conectores, fibra e estado de registro na OLT.",
            ))
        rx = _number(optical.get("rx_dbm") if "rx_dbm" in optical else optical.get("rx"))
        if rx is not None:
            thresholds = snapshot.get("triage_thresholds") or {}
            optical_thresholds = thresholds.get("optical") or {}
            minimum = _number(optical_thresholds.get("rx_min"))
            maximum = _number(optical_thresholds.get("rx_max"))
            # Legacy fallback; model-specific values supplied by an adapter win.
            minimum = -27.0 if minimum is None else minimum
            maximum = -8.0 if maximum is None else maximum
            if rx < minimum or rx > maximum:
                severe = rx < minimum - 3 or rx > maximum + 3
                issues.append(TriageIssue(
                    "GPON_RX_OUT_OF_RANGE", "GPON",
                    TriageStatus.CRITICAL if severe else TriageStatus.WARNING,
                    f"Potência óptica RX fora da faixa ({rx:g} dBm)",
                    "A potência recebida está fora da faixa operacional utilizada para este snapshot.",
                    (TriageEvidence("optical", "rx_dbm", rx, f"{minimum:g}..{maximum:g}"),),
                    "Inspecionar atenuação e conectores; confirmar o limiar específico do modelo quando disponível.",
                ))

    # Wi-Fi ---------------------------------------------------------------
    radios = snapshot.get("radios")
    wifi = snapshot.get("wifi")
    clients = snapshot.get("clients")
    mark("wifi_radio", radios)
    mark("wifi", wifi)
    if isinstance(radios, list):
        for row in radios:
            if not isinstance(row, dict):
                continue
            enabled = row.get("enabled", row.get("radio_ativo"))
            if enabled is False:
                band = row.get("band") or row.get("banda") or "Wi-Fi"
                issues.append(TriageIssue(
                    f"WIFI_RADIO_OFF_{band}", "WI-FI", TriageStatus.INFO,
                    f"Rádio {band} desligado",
                    "O rádio foi reportado como desativado pelo equipamento.",
                    (TriageEvidence("radios", "enabled", False, True),),
                    "Confirmar se o rádio deveria estar ativo para este atendimento.",
                ))
    if isinstance(wifi, list):
        for row in wifi:
            if not isinstance(row, dict):
                continue
            enabled = row.get("enabled", row.get("ativo"))
            if enabled is False:
                ssid = row.get("ssid") or row.get("id") or "SSID"
                issues.append(TriageIssue(
                    f"WIFI_SSID_OFF_{ssid}", "WI-FI", TriageStatus.INFO,
                    f"SSID {ssid} desativado",
                    "A rede sem fio existe na configuração, mas está desativada.",
                    (TriageEvidence("wifi", "enabled", False, True),),
                ))
    values = []
    if isinstance(clients, list):
        values = [value for row in clients if isinstance(row, dict) and (value := _number(row.get("rssi"))) is not None]
    if values:
        average = sum(values) / len(values)
        thresholds = snapshot.get("triage_thresholds") or {}
        warning = _number((thresholds.get("wifi") or {}).get("rssi_warning")) or -70.0
        bad = _number((thresholds.get("wifi") or {}).get("rssi_bad")) or -80.0
        if average < warning:
            issues.append(TriageIssue(
                "WIFI_RSSI_LOW", "WI-FI", TriageStatus.CRITICAL if average < bad else TriageStatus.WARNING,
                f"RSSI médio baixo ({average:.1f} dBm)",
                "O sinal médio das associações Wi-Fi está abaixo do limiar desta coleta.",
                (TriageEvidence("clients", "avg_rssi", round(average, 1), f">= {warning:g} dBm"),),
                "Validar banda, distância, interferência e posicionamento antes de alterar potência/canal.",
            ))

    # Resources: only coverage. No invented universal temperature/CPU limit.
    device = snapshot.get("device")
    mark("device", device)
    if isinstance(device, dict):
        resource_values = [device.get("cpu_percent"), device.get("memory_percent"), device.get("temperature_c")]
        coverage["resources"] = TriageStatus.OK.value if any(value is not None for value in resource_values) else TriageStatus.UNKNOWN.value

    subscriber = snapshot.get("subscriber")
    if "subscriber" in snapshot:
        coverage["subscriber"] = "OK" if subscriber else "UNKNOWN"
    if isinstance(subscriber, dict):
        from apps.access_manager.domain.addressing import classify_address
        def evidence(key, expected=None):
            return TriageEvidence("bng", key, subscriber.get(key), expected,
                origin="subscriber_detail", timestamp=snapshot.get("subscriber_observed_at") or checked_at,
                command_or_reader="subscriber_detail", confidence="high")
        state = str(subscriber.get("state") or "").upper()
        if state == "OFFLINE":
            issues.append(TriageIssue("PPPOE_OFFLINE", "PPPOE", TriageStatus.CRITICAL,
                "Sessão PPPoE offline", "O BNG informou estado offline; a causa ainda não foi estabelecida.",
                (evidence("state", "ONLINE"),), "Validar acesso óptico, VLAN e autenticação AAA."))
        if classify_address(subscriber.get("ipv4_address")) == "CGNAT_SHARED":
            issues.append(TriageIssue("CGNAT_SHARED", "IP", TriageStatus.INFO,
                "IPv4 compartilhado via CGNAT",
                "Port forwarding somente na ONT não garante acessibilidade direta da Internet. A localização do NAT não foi determinada.",
                (evidence("ipv4_address"),), "Explicar CGNAT e verificar alternativas de acesso externo."))
        expected = _number(snapshot.get("expected_down_mbps"))
        applied = _number(subscriber.get("rate_down"))
        if expected is not None and applied is not None and applied < expected:
            issues.append(TriageIssue("QOS_RATE_LIMIT_TOO_LOW", "QOS", TriageStatus.WARNING,
                "Velocidade aplicada abaixo da esperada", "Comparação com a velocidade informada neste atendimento, em Mbps.",
                (evidence("rate_down", expected),), "Verificar o perfil QoS aplicado no concentrador."))

    incident = snapshot.get("incident")
    if isinstance(incident, dict) and incident.get("code") == "POSSIBLE_COLLECTIVE_INCIDENT":
        issues.append(TriageIssue("POSSIBLE_COLLECTIVE_INCIDENT", "INFRASTRUCTURE", TriageStatus.WARNING,
            "Possível incidente coletivo", f"{incident['count']} assinantes relacionados nas observações locais. Não confirma uma massiva.",
            (TriageEvidence("local_observations", "outer_vlan", incident.get("outer_vlan"),
                confidence="medium", kind="INFERENCE"),), "Escalar à equipe de rede para validar o domínio de falha."))

    partial = bool(errors) or any(value in {TriageStatus.UNKNOWN.value, TriageStatus.UNSUPPORTED.value} for value in coverage.values())
    status = _severity_result(issues, partial)
    return TriageResult(
        status=status,
        issues=tuple(issues),
        checked_at=checked_at or datetime.now(timezone.utc).isoformat(),
        partial=partial,
        source_revision=source_revision or snapshot.get("source_revision"),
        coverage=coverage,
    )
