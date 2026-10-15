# ZTE parity audit — current branch, 2026-10-15

Baseline: `fix/zte-h3601p-v9`, `d0c795d`. This audit precedes implementation. P1_MUL physical evidence is limited to successful authentication and `statusMgr` menuView HTTP 404. No other endpoint is physically confirmed. A shared protocol signature never establishes a model identity.

Sources: local canonical `../acess_manager/apps/zte_manager/` (protocol, ThinkLua adapter, profile/capability/automatic/support services); current provider/discovery/query/profile/full-diagnostic services and frontend; juacas/zte_tracker revision `f1911857e2dc2b5da8dc5b891d4ffd67d6e5c832` (client, support_bundle, support_shape, coordinator, diagnostics, const, README, CHANGELOG and support bundle tests). Tracker is GPL-3.0: protocol concepts only, no code transplant. Legacy code already exists in the current protocol layer; reuse its behavior.

| Feature | zte_tracker | Legacy Access Manager | Current baseline | H3601P P1_MUL | Action |
|---|---|---|---|---|---|
| Login | Challenge/session reuse | Implemented | Working authentication | Login confirmed | Preserve |
| Device info | Optional details, JSON/XML | Structured reader | Optional bootstrap, direct fallback | statusMgr 404 | Preserve partial identity |
| WLAN clients | H288A/F6640 profiles | Implemented | Two-signature bootstrap gate | Pending | Promote individual validated reads |
| LAN clients | Shared accessdev root | Implemented | Same gate | Pending | Independent evidence |
| WAN | Status, uptime, lease, error | Rich normalizer | Reduced H reader | Pending | Restore fields |
| Wi-Fi SSIDs | Client profiles | Complete reader | H whitelist | Pending | Preserve independent read |
| Radio/current channel | Not profile editor | Complete channel_status | H reduced fields | Pending | Connect full normalization |
| Available channels | n/a | OBJ_CHANNEL_ID | Dropped H root | Pending | Shared payload, public query |
| Neighbor scan | n/a | Complete optional reader | Protocol exists, no provider feature | Pending | Bounded optional capability |
| ChannelAnalyzer | n/a | Weighted overlap/co-channel | Missing | Not physical | Port canonical rules |
| LAN ports | Profile dependent | Implemented | Dynamic H port reader | Pending | Keep observed count |
| DHCP | Access list | Leases/config/writer | H leases only | Pending | Keep writes unpromoted |
| DNS | WAN DNS | Complete reader/writer | UNKNOWN H | Pending | Separate read/write evidence |
| Ping/traceroute/nslookup | Not editor | Implemented | Guarded protocol | Pending | No blind promotion |
| Mesh | Optional topology/fallback | Partial | H no proven links | Pending | Do not infer edges |
| Reboot | Implemented | Implemented | Guarded | Not tested | No physical claim |
| Optical | Opt-in model families | ONT reader | H model gated | Not applicable known H3601P | Preserve gate |
| Profiles | n/a | Radio/DNS intents | CRUD/preview/apply, radio preview uses combined Wi-Fi | Pending | Dedicated radio read, lossless inputs |
| Wi-Fi diagnostic | n/a | Collector + analyzer | interference=None | Pending | Add safe channel summary |
| Support bundle | Bounded shapes/scoring/ties | Shape gateway | Limited runtime diagnostic | Pending | Independent bounded scanner |
| JSON response | Common XML-like tree | XML | XML profile parser | Pending | Central format adaptation |
| Session reuse | Optional failure isolation | Stateful ThinkLua | Existing retry/menu context | Pending | Serialize, cache negative schemas |

## Findings and constraints

- One valid endpoint must select a protocol strategy without requiring the other client list, WAN or topology.
- UNKNOWN remains blocked on public buses. Internal read-only discovery determines individual capabilities first.
- H radio simplification discards AutoChannelEnabled and advanced fields although canonical protocol methods already contain their mapping.
- A channel table must be filtered by reported band, width and country; no regional defaults.
- Legacy analyzer requires confirmed neighbors and firmware destinations, suppresses recommendations in Auto and below 15 points improvement.
- Saved profiles must remain untouched by fixtures or QA. Tests use temporary repositories/data directories.
- Writers need independent form/security/read-back evidence; a successful reader does not authorize POST.
- External physical access/captures are absent. Synthetic structural fixtures are automated evidence only.

## Functional parity round — 2026-10-15

Baseline `fix/zte-h3601p-v9` / `d0c795d21f54a54feda8d1717d265148d5e65ba7`. Continued the existing tree without reset, reclone or branch replacement.

The two-signature all-or-nothing bootstrap is replaced with independent bounded structural discovery. Valid-empty counts; one validated feature can select a read strategy. H288A-like/F6640-like scores and ties never manufacture model identity. Public UNKNOWN bus checks remain intact. Missing endpoints and wrong schemas are session-local negative evidence; view 404 alone no longer rules out a known menuData endpoint.

Radio normalization preserves all canonical fields including AutoChannelEnabled and advanced flags; missing flags stay null. OBJ_CHANNEL_ID shares a short-lived payload with radio reads and filters band/width/country without default channel tables. Public wifi_channels query and optional neighbor-scan capability are wired. ChannelAnalyzer is ported from the legacy service; no scan/no firmware destinations/Auto/no meaningful gain means no recommendation. Full diagnosis has Canais Wi-Fi, RF-only neighbor measurements, findings and JSON/CSV summaries.

Profile preview now reads radios directly, shows current manual 6 versus desired Automático, skips unknown writers, and reads legacy band-key profiles losslessly without changing storage on read. Native radio POST acceptance now requires a subsequent read-back before verified=true. DNS hosts with legacy nome remain recognized. Profile editor continues to exclude individual SSIDs and retain fixed header/footer.

WAN preserves DNS, uptime, remaining lease, errors and observed counters. DHCP leases/config fail independently. DNS, hosts, DMZ, UPnP, TR-069 and firewall have known, isolated read candidates; manual compatibility scan is available in full diagnostic tools and refreshes UI capabilities. Management may attempt PARTIAL reads; writes still require SUPPORTED.

Validation: **394 Python tests + 30 subtests passed**, **33 frontend tests passed**, frontend build/check and collectstatic successful. Native QA executes real `manage.py runapp`, Vela/Bottle endpoints and Qt WebEngine (Chromium), with only synthetic router transport and temporary app data. Nine pages checked at **1366×768, 1600×900, 1920×1080**. Shell edges, no horizontal shell/workspace overflow, modal centering/fixed actions and polling page/card/SVG/scroll/focus preservation passed. No app JS exceptions; existing framework Tailwind warning remains unrelated. Screenshots and QA JSON: `docs/screenshots/zte-parity/`.

Physical validation remains **not performed** for the new readers/writers. Only the owner's prior authentication success/statusMgr 404 is physical evidence. P1_MUL endpoint/form/token compatibility, neighbor availability, management features and Mesh relationships remain real unknowns. No Windows WebView2 run occurred in this Linux Qt environment. No H3601P write was promoted. Mesh discovery remains an independent pending feature; clients never depend on topo_lua.

`data/profiles.json` SHA256 remains `0c04d0a57d4ba19f9fcbdd91534f11252cc4ce1a8a76a29db9ffcab3b820e3de`. No change to main, no merge or force-push.
