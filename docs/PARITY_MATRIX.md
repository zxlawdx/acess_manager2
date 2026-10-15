# Parity Matrix

> Matriz funcional revisada. A matriz mecânica ampla continua derivável pelos scripts em `tools/forensics/`; esta tabela não transforma ausência de fixture em `UNSUPPORTED`.

| Feature | Legacy | Next | Model | Legacy Evidence | Next Evidence | Status |
| --- | --- | --- | --- | --- | --- | --- |
| auth/session + HTTPS:80 | YES | YES | EG8041X6-10 | infrastructure/huawei/{protocol.py,auth.py,affinity_client.py}; fixture http_bootstrap.html | infrastructure/huawei/protocol/* + tests/regression/huawei/eg8041x6_10/test_auth.py | PARITY |
| device info | YES | YES | EG8041X6-10 | huawei_captured_features.py::device_status + device_brebg2.asp | huawei/captured.py::device_status + HuaweiEG8041FamilyRuntime + test_device_info.py | PARITY |
| clients dedup/enrichment | YES | YES | EG8041X6-10 | huawei_captured_features.py::{lan_clients,wifi_clients} | HuaweiEG8041FamilyRuntime.clients + test_clients.py + test_runtime_parity.py | PARITY_AUTOMATED |
| wifi.read | YES | YES | EG8041X6-10 | huawei_eg8041_family_provider.py + wifi_2g.asp/wifi_5g.asp | HuaweiEG8041FamilyRuntime.wifi_networks + test_wifi_read.py | PARITY |
| wifi.password.read-on-demand | YES | YES | EG8041 family | huawei_eg8041_family_provider.py::_wifi_password_for_band | HuaweiEG8041FamilyRuntime._wifi_password_for_band + POST /device/wifi/reveal-password + test_wifi_read.py | PARITY_AUTOMATED |
| wifi.write | YES | YES | EG8041X6-10 | shared AMP/BBSP mutation surface + family provider read-back | HuaweiProvider.set_ssid_config/set_wifi_radio + test_wifi_write.py | MIGRATED_NOT_PHYSICALLY_REVALIDATED |
| wan.read | YES | YES | EG8041X6-10 | huawei_captured_features.py::wan_status + wan_list.asp | HuaweiEG8041FamilyRuntime.wan_status + test_wan.py | PARITY |
| lan.read/parser | YES | YES | EG8041 family | huawei_captured_features.py::lan_ports | captured.py::lan_ports; Layer3 fallback separated from duplex + test_lan.py | PARITY_AUTOMATED |
| dhcp.read/write | YES | RUNTIME-PROBED | EG8041X6-10 | huawei_captured_features.py::dhcp_status/set_dhcp_basic | captured.py + runtime probe + test_dhcp.py | UNKNOWN_EVIDENCE_GAP |
| dns.read/write | YES | RUNTIME-PROBED | EG8041X6-10 | huawei_captured_features.py::dns_status/set_dns | captured.py + runtime probe + test_dns.py | UNKNOWN_EVIDENCE_GAP |
| traffic | COUNTER SURFACES | COUNTER SURFACES | EG8041X6-10 | WAN/LAN counter fields; no dedicated normalized X6 traffic fixture found | HuaweiEG8041FamilyRuntime.traffic + test_traffic.py | PARITY_PARTIAL |
| optical.read | YES | RUNTIME-PROBED | EG8041X6-10 | huawei_captured_features.py::optical_status | captured.py + runtime probe + test_optical.py | UNKNOWN_EVIDENCE_GAP |
| diagnostics ping/traceroute | YES | YES | EG8041X6-10 | diagnostic fixtures + local registry physical validation | HuaweiEG8041FamilyRuntime.{ping,traceroute}; API routes; active frontend; test_diagnostics.py | PARITY |
| reboot.write | NOT PROVEN | UNKNOWN | EG8041X6-10 | reboot page/surface mapped, but no proven production writer/read-back for X6 | reboot.read surface probe; reboot.write UNKNOWN; test_reboot.py | NO_FALSE_CLAIM |
| ZTE diagnostics | YES | YES | F670L/F6600P/F6201B | zte_configuration diagnostics + F6201B captured diagnostics | ZTEProvider diagnostics write promoted for known models + test_zte_provider.py | PARITY_AUTOMATED |
| ZTE traffic | YES COUNTERS | YES COUNTERS | ZTE families | WAN/LAN/Wi-Fi RX/TX counter fields | ZTEProvider.get_traffic uses WAN/LAN/Wi-Fi counter sources | MIGRATED_NOT_FIXTURE_COMPLETE |


## ZTE H3601P V9 — compatibilidade adicional

Perfil próprio, menu context/cache/re-auth, clientes LAN/WLAN/DHCP normalizados (IPv6 e dedup), roots/Style A/B validados. P1_MUL físico não testado; fixtures estruturais P2 públicas e sintéticas. WAN/LAN/Wi-Fi são candidatos com promoção por shape da sessão. Optical UNSUPPORTED por papel Ethernet; writes UNKNOWN. Não representa migração integral concluída. Ver docs/zte/H3601P_IMPLEMENTATION_REPORT.md.


## Juniper infrastructure patch (feat/juniper-bng)

Independent provider + explicit connection, NETCONF/SSH XML, three-prefix filtered subscriber lookup (leading zeros, multi-session), IPv4/IPv6, selected-session PPPoE/AAA, interfaces/chassis/RE resources and finite ping/traceroute implemented. Evidence: synthetic XML + 39 focused tests, full 433 Python + 30 subtests, 36 frontend, real Vela/Qt QA at three sizes. No physical Juniper or Windows runtime validation. Disconnect/reconnect remain UNKNOWN and unimplemented; optional logs/lockout/optics/route/ARP/RADIUS/CUPS remain research only. See `JUNIPER_INTEGRATION_REPORT.md` and `juniper/` for exact boundaries.

2026-10-15 — Juniper MX204: handoff Juniper+CPE, parser XML/CLI, leitores lazy e health descritos em JUNIPER_INTEGRATION_REPORT.md e juniper/CAPABILITY_MATRIX.md. 464 Python +30 subtestes, 37 frontend; QA Vela Qt três tamanhos com transporte remoto sintético. Evidência manual fornecida pelo usuário não equivale a execução física do agente. Advanced MAC/interface, path automático e Windows ainda pendentes; nenhum write novo habilitado.
