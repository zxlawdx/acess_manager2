# Forensic Legacy Report

## Scope

Trees audited:

- `access_manager_legacy/`: behavioral source of truth.
- `access_manager_next/`: migration target.

The extraction is mechanical first (AST, textual endpoint scanning, HTTP-call scanning, auth/parser/model/test/fixture scanning) and the generated raw inventories live in `artifacts/`. Unknown static fields remain explicit instead of being guessed.

## Mechanical inventory

| Metric | Legacy | Next after this pass |
| --- | ---: | ---: |
| Files scanned | 488 | 194 |
| Python symbols | 3474 | 1137 |
| Device endpoint occurrences | 970 | 864 |
| Unique device endpoint literals | 468 | 506 |
| HTTP calls found by AST | 183 | 30 |
| Auth-term hits | 1305 | 611 |
| Protocol/auth pattern families | 7 | 7 |
| Model identifiers observed | 52 | 29 |
| Read-like Python symbols | 483 | 175 |
| Write-like Python symbols | 188 | 111 |
| Parser evidence hits | 3712 | 1376 |
| Fixtures | 45 | 22 |
| Test files | 182 | 54 |
| Tests | 717 | 85 |

`models` means unique model-like identifiers present in source/tests/fixtures; it is not a claim that every identifier is a production-supported model.

## Auth and protocol families

The Huawei protocol enum in the legacy declares four non-unknown protocol families: `amp_bbsp`, `asp_config`, `api_sestoken`, and `mobile_cpe`. Its auth-flow enum declares five non-unknown auth lifecycles: `rand_count`, `rand_string_session_token`, `api_ses_token`, `rand_cookie_hash`, and `scram_cpe`. ZTE ThinkLua is catalogued separately. The mechanical pattern scanner reports 7 pattern families because it intentionally inventories challenge/login markers independently of the runtime enums.

## EG8041X6-10 evidence

The legacy registry binds `EG8041X6-10` to AMP/BBSP, BREBG2-like firmware, RandCount, explicit `webui:https:80`, WLANConfiguration.1/5, WiFi.Radio.1/2, device information, Wi-Fi, WAN and native diagnostics. The local fixture set includes HTTPS bootstrap, auth, device, both Wi-Fi bands, channel lists, WAN, ping and traceroute captures.

No X6-specific fixture was found for DHCP, DNS, optical, Ethernet LAN counters or a production reboot writer. Those gaps are reported as `UNKNOWN` where runtime proof is absent; they are not converted to `UNSUPPORTED`.

## Generated evidence

See `docs/forensics/` and `artifacts/legacy_*.json`. `LEGACY_DEVICE_ENDPOINTS.md` contains a field-expanded endpoint catalogue; unknown values are explicitly marked `UNKNOWN_STATIC`/runtime-dependent instead of fabricated.
