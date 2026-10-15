# ZTE Tracker porting notes

Reviewed reference: juacas/zte_tracker `f1911857e2dc2b5da8dc5b891d4ffd67d6e5c832`. H3601P is not an official model in that revision. Protocol similarities never establish exact hardware identity.

| Models reviewed | Read strategy in reference | Decision here |
|---|---|---|
| F6640, F6645P, F680 | wlan_client_stat + OBJ_WLAN_AD; accessdev_landevs + OBJ_ACCESSDEV | Existing fallback, independently shape validated |
| F6600P, F6745Q | F6640 clients; explicit optical opt-in | Preserve native F6600P; no inferred H3601P optical |
| F8748 | F6640 + model-specific WAN counters | Parse counters only if returned; no invented rates |
| H288A, H169A, H3600P, H3640, H6645P, H6745 | accessdev_ssiddev + accessdev_landevs / OBJ_ACCESSDEV | Shared compatibility strategy, not H3601P identity |
| H168A | Same tags, OBJ_LOCALNETWORK_STATUS_ACCESSDEV_ID | Audited; new root not promoted or silently accepted |
| H388X | H288A clients, alternate wan_internet_lua | Existing catalog retained; not guessed for P1 |
| H2640 | H288A clients, DSL root and reboot security distinction | Existing catalog; no DSL or reboot assumption for H3601P |
| E2631, SR7410, SR7110 | vueData tags and separate authentication | Audited; intentionally not folded into ThinkLua bootstrap |

## Mechanisms adapted independently

- `zte_client.py`: optional identity/WAN failures, explicit optical opt-in, JSON Instance/parameters/path variant. One central parser produces the same normalized objects for JSON and XML. No permissive unknown-node fallback.
- `support_bundle.py`: known read-only probes, shared ownership scores, ties, per-feature status, bounded execution. Our bootstrap uses at most eight menuData attempts and a 12-second deadline, requests limited to two seconds each. Views are additional requests inside the same time budget. Manual scan: 18 menuData attempts, 20 seconds maximum, no arbitrary tag requests.
- `support_shape.py` and `diagnostics.py`: export names/counts/status, never record values. Unknown object names use a restricted object-name grammar. Advertised tags are inventoried through the existing safety filter, not executed blindly.
- `coordinator.py` and `const.py`: stateful session reuse and optional failure isolation. Keep Access Manager session locking and its bounded read retry; do not import Home Assistant coordinator/entity scheduling or default credentials.
- README/CHANGELOG/support-bundle tests: JSON dialect, H168A distinct root, WAN-view priming, shared-endpoint score ambiguity, router-error versus valid-empty distinction.

## Intentional limits

No third-party GPL code was transplanted. No Home Assistant entities, registry, HACS, scheduler, raw ARP listener, automatic reboot or new login algorithm. No endpoint brute force. Unknown advertised tags remain inventory only. The scanner covers the known ThinkLua candidate catalog, not all Vue/TR-181 payload dialects. A recognized partial strategy can make independent reads available while all H3601P writers stay UNKNOWN.

## Canonical legacy ports

Access Manager legacy revision `1623bce8717b9b92683cd3904f9c2bd378da400c`: full channel_status mapping, available_channels filtering, optional neighbor scan candidate order, and ChannelAnalyzer strategy. Existing low-level radio builder remains canonical; accepted POST now performs one read-back and remains uncertain when it cannot confirm the resulting state.
