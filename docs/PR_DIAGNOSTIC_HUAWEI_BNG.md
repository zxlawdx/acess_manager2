# Draft PR: Add initial read-only Huawei BNG diagnostic orchestration

Base: `feat/configuration-ux-wifi-standard`
Head: `feat/diagnostic-orchestrator-huawei-bng`

An attendant can start a focused subscriber diagnosis from the existing subscriber screen. The new experimental Huawei NetEngine SSH provider collects system and label-based subscriber data through a closed command grammar; unknown output and permission failures do not become offline conclusions. One bounded orchestration job combines verified subscriber/CPE evidence with the existing triage engine and exposes progressive partial results, cancellation and attendance copy actions.

The change preserves independent Juniper/CPE sessions and existing Junos implementations behind a neutral read-intent adapter. It adds address-scope classification, evidence-backed CGNAT/offline/QoS comparisons, bounded local session observations, tentative S-VLAN incident correlation, nonsecret endpoint preferences and optional in-memory AD reuse through the API.

## Validation

- `python -m pytest -q`: 635 passed, 30 subtests passed.
- `npm test`: 127 passed.
- `python tools/sync_frontend.py --check`: passed.
- `git diff --check`: passed.
- No physical device or production account was accessed.

## Deliberate limits

This is an initial vertical slice, not completion of the six-phase roadmap. All Huawei fixtures are synthetic and physical validation is pending. AAA failure readers, QoS counters, routing/pool/LAG health, advanced DNS/MTU/IPv6 tests and application playbooks are not enabled. The global collection budget exposes partial results but cannot forcibly cancel in-flight legacy CPE requests. Reuse of AD credentials and endpoint profile management currently have API flows only. Per-node diagnostic drilldowns and visual responsive QA remain pending.

Review the five diagnostic/security documents for exact command support, compatibility mapping and remaining work. Keep this PR in draft until the intended scope and physical-validation plan are reviewed. Do not merge automatically.
