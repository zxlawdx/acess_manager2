import pytest

from apps.access_manager.application.services.mesh_port_forwarding import (
    LEGACY_DEFAULT_REMOTE_PORT,
    MESH_REMOTE_PORT,
    MeshPortForwardingService,
)


class Caps:
    def require_read(self, _feature):
        return None

    def require_write(self, _feature):
        return None


class Protocol:
    def __init__(self, result=None):
        self.calls = []
        self.result = result

    def save_port_forward(self, config):
        self.calls.append(dict(config))
        if self.result is not None:
            return self.result
        return {
            "success": True,
            "items": [
                {
                    "Enable": "1",
                    "Protocol": "TCP",
                    "ExternalPort": "81",
                    "ExternalPortEndRange": "81",
                    "InternalClient": config["internal_client"],
                    "InternalPort": "81",
                    "InternalPortEndRange": "81",
                }
            ],
        }


class Provider:
    vendor = "zte"

    def __init__(self, clients=None, protocol=None):
        self.capabilities = Caps()
        self._clients = clients or []
        self.protocol = protocol or Protocol()

    def get_clients(self):
        return list(self._clients)

    def _need(self):
        return self.protocol


class Sessions:
    def __init__(self, provider):
        self.provider = provider


def service(*, clients=None, protocol=None):
    provider = Provider(clients=clients, protocol=protocol)
    return MeshPortForwardingService(Sessions(provider)), provider


def mesh_client(ip="192.168.1.20", mac="AA:BB:CC:DD:EE:FF"):
    return {
        "hostname": "mesh-agent",
        "ip": ip,
        "mac": mac,
        "connection_type": "Ethernet",
    }


def request(ip="192.168.1.20", mac="AA:BB:CC:DD:EE:FF", **extra):
    return {
        "mesh_wan_ip": ip,
        "mesh_wan_mac": mac,
        **extra,
    }


def test_mesh_port_is_legacy_default_plus_one():
    assert LEGACY_DEFAULT_REMOTE_PORT == 80
    assert MESH_REMOTE_PORT == 81
    assert MESH_REMOTE_PORT == LEGACY_DEFAULT_REMOTE_PORT + 1


def test_preview_uses_confirmed_mesh_wan_and_port_81():
    subject, _ = service(clients=[mesh_client()])

    result = subject.preview(request())

    assert result["confirmed"] is True
    assert result["effective_destination"] == "192.168.1.20:81"
    assert result["rule"]["internal_client"] == "192.168.1.20"
    assert result["rule"]["external_port"] == 81
    assert result["rule"]["internal_port"] == 81


def test_missing_mesh_wan_rejects_and_does_not_call_writer():
    protocol = Protocol()
    subject, _ = service(clients=[mesh_client()], protocol=protocol)

    with pytest.raises(ValueError, match="WAN IP"):
        subject.apply({
            "mesh_wan_mac": "AA:BB:CC:DD:EE:FF",
            "confirm_mesh_wan": True,
        })

    assert protocol.calls == []


def test_lan_ip_is_never_used_as_fallback():
    protocol = Protocol()
    subject, _ = service(clients=[mesh_client()], protocol=protocol)

    with pytest.raises(ValueError, match="WAN IP"):
        subject.apply({
            "lan_ip": "192.168.1.20",
            "mesh_wan_mac": "AA:BB:CC:DD:EE:FF",
            "confirm_mesh_wan": True,
        })

    assert protocol.calls == []


def test_unobserved_wan_ip_mac_pair_rejects_before_write():
    protocol = Protocol()
    subject, _ = service(clients=[mesh_client()], protocol=protocol)

    with pytest.raises(ValueError, match="não conseguiu confirmar"):
        subject.apply(request(ip="192.168.1.99", confirm_mesh_wan=True))

    assert protocol.calls == []


def test_apply_requires_explicit_mesh_wan_confirmation():
    protocol = Protocol()
    subject, _ = service(clients=[mesh_client()], protocol=protocol)

    with pytest.raises(ValueError, match="Confirme explicitamente"):
        subject.apply(request())

    assert protocol.calls == []


def test_writer_without_matching_readback_is_not_completed():
    protocol = Protocol({
        "success": True,
        "items": [{
            "Enable": "1",
            "Protocol": "TCP",
            "ExternalPort": "81",
            "InternalClient": "192.168.1.99",
            "InternalPort": "81",
        }],
    })
    subject, _ = service(clients=[mesh_client()], protocol=protocol)

    with pytest.raises(RuntimeError, match="não apareceu no readback"):
        subject.apply(request(confirm_mesh_wan=True))

    assert len(protocol.calls) == 1


def test_confirmed_writer_readback_completes_rule():
    protocol = Protocol()
    subject, _ = service(clients=[mesh_client()], protocol=protocol)

    result = subject.apply(request(confirm_mesh_wan=True))

    assert result["success"] is True
    assert result["verified"] is True
    assert result["writer_confirmed"] is True
    assert result["effective_destination"] == "192.168.1.20:81"
    assert len(protocol.calls) == 1
    assert protocol.calls[0]["internal_client"] == "192.168.1.20"
    assert protocol.calls[0]["external_port"] == 81
    assert protocol.calls[0]["internal_port"] == 81
