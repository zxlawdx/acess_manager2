from __future__ import annotations

from pathlib import Path

from apps.access_manager.domain.capabilities import SupportStatus as S
from apps.access_manager.infrastructure.huawei.eg8041_runtime import HuaweiEG8041FamilyRuntime
from apps.access_manager.infrastructure.huawei.protocol.diagnostic_result import decode_huawei_diagnostic_result

FIX = Path("tests/fixtures/huawei/eg8041x6_10_local")


def fixture(name: str) -> str:
    return (FIX / name).read_text(encoding="utf-8")


class FixtureClient:
    def __init__(self):
        self.pages = {
            "/html/ssmp/deviceinfo/deviceinfo.asp": fixture("device_brebg2.asp"),
            "/html/amp/wlanbasic/WlanBasic.asp?2G": fixture("wifi_2g.asp"),
            "/html/amp/wlanbasic/WlanBasic.asp?5G": fixture("wifi_5g.asp"),
            "/html/amp/wlanadv/WlanAdvance.asp?2G": fixture("wifi_2g.asp"),
            "/html/amp/wlanadv/WlanAdvance.asp?5G": fixture("wifi_5g.asp"),
            "/html/amp/common/wlan_list.asp": fixture("wifi_2g.asp") + "\n" + fixture("wifi_5g.asp"),
            "/html/amp/wlanadv/wlanadvance_com_api.asp": fixture("wifi_2g.asp") + "\n" + fixture("wifi_5g.asp"),
            "/html/amp/wlanadv/wlanadvance_api.asp": fixture("wifi_2g.asp") + "\n" + fixture("wifi_5g.asp"),
            "/html/bbsp/common/wan_list_info.asp": fixture("wan_list.asp"),
            "/html/bbsp/common/wan_list_cache_wan.asp": fixture("wan_list.asp"),
            "/html/amp/common/WlanChannel.asp?1=1": fixture("channels_2g.asp") + "\n" + fixture("channels_5g.asp"),
        }

    def protocol_descriptor(self):
        return {"family": "amp_bbsp", "auth_flow": "rand_count", "evidence": ["endpoint:/asp/GetRandCount.asp"]}

    def get_page(self, path):
        if path in self.pages:
            return self.pages[path]
        raise RuntimeError(f"fixture-missing:{path}")

    def post_read(self, path, data=None, referer=None):
        if path in self.pages:
            return self.pages[path]
        raise RuntimeError(f"fixture-missing:{path}")


def test_family_runtime_requires_amp_bbsp_and_exact_wlan_object_graph():
    runtime = HuaweiEG8041FamilyRuntime(FixtureClient(), model="EG8041X6-10")
    assert runtime.family_descriptor["compatible"] is True
    evidence = runtime.family_descriptor["evidence"]
    assert any("WLANConfiguration.1" in row for row in evidence)
    assert any("WiFi.Radio.2" in row for row in evidence)


def test_x6_wifi_and_wan_reads_are_not_downgraded_to_unsupported():
    runtime = HuaweiEG8041FamilyRuntime(FixtureClient(), model="EG8041X6-10")
    caps = {item.name: item for item in runtime.capabilities()}
    assert caps["wifi"].read == S.SUPPORTED
    assert caps["wifi_radio"].read == S.SUPPORTED
    assert caps["wan"].read == S.SUPPORTED
    assert caps["wifi"].write == S.SUPPORTED
    assert caps["reboot"].write == S.UNKNOWN


def test_x6_fixture_wifi_contains_both_bands():
    runtime = HuaweiEG8041FamilyRuntime(FixtureClient(), model="EG8041X6-10")
    networks = runtime.captured.wifi_networks()
    bands = {row.get("banda") for row in networks}
    assert "2.4GHz" in bands
    assert "5GHz" in bands


def test_x6_concatenated_traceroute_and_ping_frames_decode_safely():
    trace, trace_state = decode_huawei_diagnostic_result(fixture("diagnostic_traceroute_concat.txt"))
    ping, ping_state = decode_huawei_diagnostic_result(fixture("diagnostic_ping_function_wrapper.txt"))
    assert trace_state == "Complete"
    assert "8.8.8.8" in trace
    assert ping_state == "Complete"
    assert "4 packets transmitted" in ping


def test_lan_layer3_fallback_never_fabricates_duplex_semantics(monkeypatch):
    runtime = HuaweiEG8041FamilyRuntime(FixtureClient(), model="EG8041X6-10")
    captured = runtime.captured
    monkeypatch.setattr(captured, "_records", lambda *pages: ("", []))
    monkeypatch.setattr(captured, "layer3_status", lambda: {"ports": [{"port": 1, "enabled": True}]})
    rows = captured.lan_ports()
    assert rows[0]["admin_state"] == "enabled"
    assert rows[0]["link_state"] == "unknown"
    assert rows[0]["duplex"] == ""
    assert rows[0]["duplex"] != "L3 admin"


def test_client_dedup_prefers_mac_and_merges_wifi_metadata(monkeypatch):
    runtime = HuaweiEG8041FamilyRuntime(FixtureClient(), model="EG8041X6-10")
    monkeypatch.setattr(runtime.captured, "lan_clients", lambda: [{
        "hostname": "pc", "ip": "192.168.1.10", "mac": "aa-bb-cc-dd-ee-ff", "interface": "LAN1"
    }])
    monkeypatch.setattr(runtime.captured, "wifi_clients", lambda: [{
        "hostname": "pc", "ip": "192.168.1.10", "mac": "AA:BB:CC:DD:EE:FF", "ssid": "Casa", "band": "5GHz", "rssi": "-51", "snr": "38"
    }])
    rows = runtime.clients()
    assert len(rows) == 1
    assert rows[0]["mac"] == "AA:BB:CC:DD:EE:FF"
    assert rows[0]["ssid"] == "Casa"
    assert rows[0]["band"] == "5GHz"
    assert rows[0]["rssi"] == "-51"
