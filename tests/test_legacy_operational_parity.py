import json
from pathlib import Path
from types import SimpleNamespace

from apps.access_manager.application.queries.device import DeviceQueryBus
from apps.access_manager.domain.presentation import wan_view


def test_wan_view_accepts_legacy_pppoe_field_names():
    row = wan_view({"UserName": "brd_12345", "ServList": "INTERNET", "ConnStatus": "Connected"})
    assert row["username"] == "brd_12345"
    assert row["service"] == "INTERNET"


def test_zte_radio_query_restores_proven_standard_choices_when_parser_only_has_current_value():
    sessions = SimpleNamespace(provider=SimpleNamespace(vendor="zte"))
    bus = DeviceQueryBus(sessions)
    bus.execute = lambda *args, **kwargs: [
        {
            "band": "2.4GHz",
            "standard": "b,g,n",
            "options": {"standard": [{"value": "b,g,n", "label": "b,g,n"}]},
        },
        {
            "band": "5GHz",
            "standard": "a,n,ac",
            "options": {"standard": [{"value": "a,n,ac", "label": "a,n,ac"}]},
        },
    ]

    rows = bus.wifi_radios()
    options_24 = {item["value"] for item in rows[0]["options"]["standard"]}
    options_5 = {item["value"] for item in rows[1]["options"]["standard"]}

    assert {"b", "g", "n", "b,g,n"}.issubset(options_24)
    assert {"a", "n", "ac", "a,n,ac"}.issubset(options_5)


def test_profile_zte_wan_reuses_cached_raw_payload_for_pppoe_username(monkeypatch):
    client = object()
    provider = SimpleNamespace(vendor="zte", _profile=object(), _need=lambda: client)
    sessions = SimpleNamespace(provider=provider)
    bus = DeviceQueryBus(sessions)
    bus.execute = lambda *args, **kwargs: [
        {"id": "wan-1", "name": "1_INTERNET_R_VID_2000", "status": "Connected"}
    ]

    from apps.access_manager.infrastructure.zte.discovery import profile_runtime

    monkeypatch.setattr(
        profile_runtime,
        "state",
        lambda _: {
            "payloads": {
                "wan": (
                    0,
                    {
                        "ID_WAN_COMFIG": [
                            {
                                "_InstID": "wan-1",
                                "UserName": "cdy_12345",
                                "ServList": "INTERNET",
                            }
                        ]
                    },
                    None,
                )
            }
        },
    )

    result = bus.wan()[0]
    assert result["username"] == "cdy_12345"
    assert result["service"] == "INTERNET"


def test_wifi_neighbour_endpoint_reuses_complete_diagnostic_environment(monkeypatch):
    from apps.access_manager.presentation.api import operational_parity

    radios = [{"band": "2.4GHz", "channel": 6}]
    monkeypatch.setattr(operational_parity.queries, "wifi_radios", lambda: radios)
    monkeypatch.setattr(
        "apps.access_manager.application.services.wifi_environment.collect_environment",
        lambda queries, received: [{"band": "2.4GHz", "channel_analysis": {"best_channel": 1}}],
    )

    result = operational_parity.diagnostic_wifi_neighbors({"json": {}})
    assert result["radios"] == radios
    assert result["wifi_environment"][0]["channel_analysis"]["best_channel"] == 1


def test_durable_export_writes_validated_report_to_data_directory(tmp_path, monkeypatch):
    from apps.access_manager.presentation.api import operational_parity
    from apps.access_manager import composition

    class FakeDiagnostics:
        def export(self, config):
            assert config["id"] == 77
            assert config["format"] == "json"
            return {"filename": "old.json", "data": {"history_id": 77, "status": "success"}}

    monkeypatch.setattr(composition, "full_diagnostics", FakeDiagnostics())
    monkeypatch.setattr(operational_parity, "data_dir", lambda: tmp_path)

    result = operational_parity.full_diagnostic_export_file({"json": {"id": 77, "format": "json"}})
    target = Path(result["saved_path"])
    assert target.parent == tmp_path / "exports"
    assert target.exists()
    assert json.loads(target.read_text(encoding="utf-8"))["history_id"] == 77
