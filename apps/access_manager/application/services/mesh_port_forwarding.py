from __future__ import annotations

from contextlib import nullcontext
from ipaddress import IPv4Address
import re


# Legacy remote-access contract (acess_manager): remote_port defaults to 80.
# A Mesh node receives the next port in the sequence and the effective target
# is therefore WAN_DO_MESH:81. Keep this constant explicit so the rule cannot
# silently drift when UI defaults change.
LEGACY_DEFAULT_REMOTE_PORT = 80
MESH_PORT_OFFSET = 1
MESH_REMOTE_PORT = LEGACY_DEFAULT_REMOTE_PORT + MESH_PORT_OFFSET


class MeshPortForwardingService:
    """Fail-closed Mesh port-forwarding orchestration.

    The target is never inferred from a LAN address supplied by the caller.
    Instead, the caller selects an IP/MAC pair currently observed by the
    connected equipment and this service confirms that pair again immediately
    before preview/apply.  The write is only reported as complete when the ZTE
    writer returns its post-write readback containing the exact expected rule.
    """

    def __init__(self, sessions):
        self.sessions = sessions

    @staticmethod
    def _mac(value) -> str | None:
        compact = re.sub(r"[^0-9a-f]", "", str(value or "").lower())
        if len(compact) != 12:
            return None
        return ":".join(compact[i:i + 2] for i in range(0, 12, 2)).upper()

    @staticmethod
    def _ipv4(value) -> str:
        raw = str(value or "").strip()
        if not raw:
            raise ValueError(
                "O WAN IP do nó Mesh não foi confirmado. A regra não será criada."
            )
        try:
            return str(IPv4Address(raw))
        except ValueError:
            raise ValueError("WAN IP do nó Mesh inválido.") from None

    def _provider(self):
        provider = self.sessions.provider
        if getattr(provider, "vendor", None) != "zte":
            raise RuntimeError(
                "Encaminhamento Mesh validado está disponível somente no writer ZTE comprovado."
            )
        provider.capabilities.require_read("clients")
        provider.capabilities.require_write("port_forwarding")
        return provider

    @staticmethod
    def _client_ip(row) -> str | None:
        raw = row.get("ip") or row.get("ipv4")
        try:
            return str(IPv4Address(str(raw))) if raw else None
        except ValueError:
            return None

    def _confirmed_target(self, provider, config):
        wan_ip = self._ipv4(config.get("mesh_wan_ip"))
        wan_mac = self._mac(config.get("mesh_wan_mac"))
        if not wan_mac:
            raise ValueError(
                "O MAC da interface WAN do nó Mesh é obrigatório para confirmar o destino."
            )

        rows = provider.get_clients() or []
        for row in rows:
            if self._client_ip(row) == wan_ip and self._mac(row.get("mac")) == wan_mac:
                return {
                    "wan_ip": wan_ip,
                    "wan_mac": wan_mac,
                    "hostname": row.get("hostname") or row.get("name"),
                    "connection_type": row.get("connection_type"),
                }

        raise ValueError(
            "O Access Manager não conseguiu confirmar esse WAN IP/MAC do nó Mesh "
            "na leitura atual. Nenhuma regra foi criada; LAN IP não é usado como fallback."
        )

    @staticmethod
    def _forward_config(target, config):
        return {
            "name": str(config.get("name") or "Access Manager Mesh").strip(),
            "enabled": True,
            "protocol": "TCP",
            "external_port": MESH_REMOTE_PORT,
            "external_port_end": MESH_REMOTE_PORT,
            "internal_client": target["wan_ip"],
            "internal_port": MESH_REMOTE_PORT,
            "internal_port_end": MESH_REMOTE_PORT,
            "remote_host": "",
            "remote_host_end": "",
            "description": "Mesh WAN - legacy remote port + 1",
        }

    @staticmethod
    def _rule_matches(row, target_ip: str) -> bool:
        def text(name):
            value = row.get(name)
            return "" if value is None else str(value).strip()

        enabled = text("Enable")
        protocol = text("Protocol").upper()
        return (
            text("InternalClient") == target_ip
            and text("ExternalPort") == str(MESH_REMOTE_PORT)
            and text("ExternalPortEndRange") in {"", str(MESH_REMOTE_PORT)}
            and text("InternalPort") == str(MESH_REMOTE_PORT)
            and text("InternalPortEndRange") in {"", str(MESH_REMOTE_PORT)}
            and protocol in {"TCP", "TCP/UDP", "TCPUDP"}
            and enabled in {"1", "TRUE", "ON"}
        )

    def candidates(self):
        with getattr(self.sessions, "operation_lock", nullcontext()):
            provider = self._provider()
            seen = set()
            result = []
            for row in provider.get_clients() or []:
                wan_ip = self._client_ip(row)
                wan_mac = self._mac(row.get("mac"))
                if not wan_ip or not wan_mac:
                    continue
                identity = (wan_ip, wan_mac)
                if identity in seen:
                    continue
                seen.add(identity)
                result.append({
                    "wan_ip": wan_ip,
                    "wan_mac": wan_mac,
                    "hostname": row.get("hostname") or row.get("name"),
                    "connection_type": row.get("connection_type"),
                })
            return {
                "base_port": LEGACY_DEFAULT_REMOTE_PORT,
                "mesh_port": MESH_REMOTE_PORT,
                "candidates": result,
                "safety": "WAN IP + MAC precisam ser confirmados ao vivo; não existe fallback para LAN IP.",
            }

    def preview(self, config):
        with getattr(self.sessions, "operation_lock", nullcontext()):
            provider = self._provider()
            target = self._confirmed_target(provider, config or {})
            return {
                "success": True,
                "confirmed": True,
                "base_port": LEGACY_DEFAULT_REMOTE_PORT,
                "mesh_port": MESH_REMOTE_PORT,
                "target": target,
                "effective_destination": f"{target['wan_ip']}:{MESH_REMOTE_PORT}",
                "rule": self._forward_config(target, config or {}),
            }

    def apply(self, config):
        config = dict(config or {})
        if config.get("confirm_mesh_wan") is not True:
            raise ValueError(
                "Confirme explicitamente que o cliente selecionado é o WAN do nó Mesh."
            )

        with getattr(self.sessions, "operation_lock", nullcontext()):
            provider = self._provider()
            target = self._confirmed_target(provider, config)
            values = self._forward_config(target, config)

            # Port-forwarding is a proven ThinkLua writer only on the native ZTE
            # protocol families currently advertised as writable by capability.
            protocol = provider._need()
            writer = getattr(protocol, "save_port_forward", None)
            if not callable(writer):
                raise RuntimeError("Writer de encaminhamento de porta indisponível.")

            result = writer(values)
            if not isinstance(result, dict) or result.get("success") is not True:
                raise RuntimeError(
                    "O writer do equipamento não confirmou a gravação da regra Mesh."
                )

            # ThinkLuaCrudGateway.save returns a fresh readback in `items`.
            # Only that readback can turn an attempted write into a completed one.
            readback = result.get("items")
            if not isinstance(readback, list):
                raise RuntimeError(
                    "O writer respondeu sem readback verificável; a gravação ficou não confirmada."
                )
            persisted = next(
                (row for row in readback if self._rule_matches(row, target["wan_ip"])),
                None,
            )
            if persisted is None:
                raise RuntimeError(
                    "O writer respondeu, mas a regra Mesh não apareceu no readback do equipamento."
                )

            return {
                "success": True,
                "verified": True,
                "writer_confirmed": True,
                "base_port": LEGACY_DEFAULT_REMOTE_PORT,
                "mesh_port": MESH_REMOTE_PORT,
                "target": target,
                "effective_destination": f"{target['wan_ip']}:{MESH_REMOTE_PORT}",
                "rule": persisted,
            }
