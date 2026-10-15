# Access Manager — Juniper integration report

## Baseline

- Initial branch: `fix/zte-h3601p-v9`; initial commit `8d115beacc3c85bad191a6f6109e4bde4b9541a4`.
- Initial working tree: clean; implementation branch: `feat/juniper-bng`.
- No reset/reclone, no merge into main, no change to saved profiles.

## Existing architecture and integration

Independent Huawei/ZTE providers, SessionManager/RLock, CapabilitySet, query/command buses, Vela/Bottle API and esbuild workspace were preserved. Juniper is an infrastructure provider, not an ONT subclass. Explicit Juniper selection bypasses HTTP CPE fingerprinting. Existing Huawei/ZTE connection normalization remains covered by regression tests.

Implementation:

- `domain/subscribers.py`: typed search query, contract resolver and normalized subscriber model. Numeric identifiers stay strings; known usernames remain lowercase.
- `infrastructure/juniper/{transport,requests,parsers,errors}.py`: ncclient NETCONF, verified-host SSH/XML fallback, closed read-only query catalog, safe XML and normalized public errors.
- `infrastructure/providers/juniper.py`: lifecycle/facts, per-feature capabilities, filtered lookup, fresh selected-session detail, optional PPPoE/AAA, interface/chassis/resources and diagnostics.
- `presentation/api/infrastructure.py`: nine read-intent endpoints, using the existing query bus and session identity/operation lock.
- Existing session API accepts explicit `vendor=juniper`, `transport=netconf|auto|ssh`, optional port. Host keys must already be trusted in known_hosts. Auto fallback is explicit and never follows rejected credentials/host keys.
- `static/js/workspaces/views/juniper.js`: Overview, Assinantes PPPoE, Interfaces, Sistema and Diagnóstico, all inside the existing global Vela shell. CPE Wi-Fi/DHCP/optical menus are hidden for infrastructure sessions. No subscriber data/history persisted.

API (POST bodies follow existing app contracts): `/api/infrastructure/subscribers/{lookup,detail,context}`, `/api/infrastructure/interfaces`, `/api/infrastructure/interfaces/detail`, `/api/infrastructure/{system,chassis,resources,diagnostics}`. Frontend sends query/session/kind intentions, never CLI. Device app_session_id guards against a response/request crossing to a replacement connection.

## Subscriber behavior

`000123` queries exactly `brd_000123`, `cdy_000123`, `364_000123`, sequentially on one connection. Full usernames query only themselves. IPv4/IPv6 inputs use a typed address filter. No global subscriber inventory is downloaded for search. Per-candidate FOUND/NOT_FOUND/TIMEOUT/ERROR distinguishes absence from incomplete lookup. Returned unrelated usernames are rejected rather than exposing another customer or reporting confirmed absence.

Repeated usernames retain distinct sessions. Detail is selected by subscriber Session ID; PPPoE and AAA are separate lazy calls after fresh session/username validation. Namespaces are version-neutral. Absent scalar fields stay null; IPv6 addresses/prefixes remain lists; reported service/policy/NAT fields are whitelisted. Accounting statistics are marked unavailable unless independently supported; no zero-traffic inference or shaping-to-commercial-plan translation.

Facts identify model/release/family/OS when returned. Non-BNG devices can still use independent facts/interfaces. MX permits a cheap count probe; a model name alone does not grant every feature. Read permissions, schema mismatch, RPC error and timeout remain distinct. Optional features start PARTIAL, successful compatible responses promote only their own read capability. New writes remain UNKNOWN.

## Operations and mutations

- Ping: fixed four packets, typed IPv4/IPv6 and optional RI, explicit Juniper origin.
- Traceroute: fixed eight-hop maximum, typed IP/RI, bounded timeout. Reported RTT is not silently converted to milliseconds without a confirmed unit contract.
- CPU/memory/chassis/interface details: manual, no aggressive polling or process dump.
- Disconnect/reconnect: **not implemented or promoted**. Prompt requires Windows/Vela validation before mutation, plus real platform/release/permission and a tested read-before-write/read-back path; those prerequisites are absent. No clear/set/request/commit operation is in the transport allowlist. No lockout clear or configuration editor.

## Evidence matrix

| Feature | Research | Fixture | Automated | Physical |
|---|---:|---:|---:|---:|
| Contract resolution / three prefixes / leading zeros | Yes | Yes | Yes | No |
| NETCONF / Junos NCElement reply | Yes | Yes | Yes | No |
| Explicit SSH/XML fallback / host-key rejection | Yes | Transport mocks | Yes | No |
| Facts / namespace variation / missing values | Yes | Yes | Yes | No |
| Subscriber lookup / multiple sessions / partial errors | Yes | Yes | Yes | No |
| IPv4 / IPv6 query and collections | Yes | Yes | Yes | No |
| PPPoE / AAA selected detail | Yes | Yes | Yes | No |
| Interfaces / chassis / RE resources | Yes | Yes | Yes | No |
| Ping / traceroute parsing and typed queries | Yes | Yes | Yes | No |
| Disconnect / reconnect | Yes | No | Not delivered | No |
| Windows runtime | Dependency audit | n/a | Wheel availability only | Not executed |

Fixtures are synthetic shapes informed by official documentation/catalogs. `mx204` and `24.2R1` in fixtures are not an owner's detected device. Native per-release `display xml rpc` captures remain pending.

## Tests and QA

Actual results:

- `python -m pytest tests/test_juniper.py -q`: **39 passed**.
- `python -m pytest -q`: **433 passed + 30 subtests**; includes Huawei/ZTE regression suite.
- `npm test`: **36 passed**; includes explicit Juniper login, workspace isolation, duplicate sessions and incomplete search UI.
- `python tools/sync_frontend.py --check`: passed.
- `python manage.py collectstatic --no-tailwind`: no errors.
- `python tests/visual/juniper_driver.py` with Qt offscreen + `node tests/visual/juniper-native.cjs`: real Vela/Bottle API and Qt WebEngine, only remote Junos transport mocked. Five pages at **1366×768, 1600×900, 1920×1080**; lookup with two sessions, PPPoE/AAA lazy loading, CPU/memory, interfaces, ping, detail centering, shell alignment and no horizontal overflow passed. Screenshots/QA JSON in `docs/screenshots/juniper/`.
- ZTE bootstrap native regression at the same three sizes: actual Vela/Bottle with synthetic router transport; clients/IPv6, authenticated-unknown and rejected-login behavior passed. This regression did not overwrite baseline committed screenshots.
- No app JavaScript exceptions observed by native QA (existing framework Tailwind warning filtered).
- Windows dependency audit: ncclient 0.7.0 pure-Python wheel built; Windows x64 CPython 3.12 dependency wheels available. **Actual Windows/WebView2 execution remains unperformed.**

## Remaining real limitations

No physical Juniper, management credentials, model/release or test subscriber was supplied. Physical acceptance and Windows execution are pending, so the complete acceptance checklist is not claimed. Unknown XML dialects fail explicitly instead of becoming empty successes. No SSH text-only parser fallback, multi-BNG inventory, logs, lockout, optics/DOM, route/ARP correlation or RADIUS health reader was delivered. CUPS has no dedicated parser; Evolved differences are not treated as proven classic parity. Target-native RPC capture/privilege verification is required. Existing remote RPCs may finish within their bounded timeout after browser cancellation; stale results are ignored.

Saved profiles SHA256 unchanged: `0c04d0a57d4ba19f9fcbdd91534f11252cc4ce1a8a76a29db9ffcab3b820e3de`.
