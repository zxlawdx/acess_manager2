# Juniper MX204 integration — 2026-10-15

## Branch and preserved state

Continued the existing `feat/juniper-bng` working tree at `18c0e52785f698577836ebf7f22f1d03790009a9`. No reset, reclone, branch replacement or main merge. Product remains **Access Manager**. Existing Huawei/ZTE readers, writers and saved profiles remain in place.

## Architecture and delivered workflow

`InfrastructureSessions` coordinates exactly one Juniper SessionManager and one existing CPE SessionManager. Device buses retain their existing interface; infrastructure reads always route to the Juniper manager. JuniperProvider has no Huawei/ZTE dependency. CPE connect and either session's disconnect preserve the other session. The topbar offers Return to subscriber, preserving the query and refreshing the results.

Login is compact, without the CPE illustration, and uses Server / AD user / AD password. SSH and NETCONF ports are separate. Versioned preferences persist only default host, successful host, ports and transport; failure does not promote a host. AD password is cleared after every attempt. The explicit SSH fingerprint flow stores public keys by host and port, rejects changed keys and retains strict verification. See juniper/CREDENTIAL_LIFECYCLE.md.

A selected subscriber is re-read before CPE draft creation and again before connection. ID/user/IP mismatch is rejected. The draft has read-only IPv4 with an explicit edit option, port validation, protocol/manufacturer selectors and separate CPE credentials. Optional TCP reachability is from the workstation, not the BNG; a closed management port does not mean PPPoE offline. Draft freshness is shown.

## Reader and parser corrections

- SSH sends one validated command per exec channel with XML/no-more. In-memory JunosCommandResult separates transport, format, elapsed time and repr-hidden raw output.
- Known prompt/ANSI/CR/backspace framing is normalized. Pagination fails explicitly. Recognized subscriber CLI labels have a dedicated fallback. Malformed XML and NETCONF text do not fall back blindly.
- Detail/extensive/service-session records aggregate by identity; DHCP children attach through parent ID. Subscriber/service/PPPoE IDs remain separate. Profile/version, DNS, pools, MAC, VLAN, agent IDs and service shaping are preserved when returned.
- Count-zero and No such subscriber normalize to not found. Permission, unsupported command and remote daemon failures are distinct safe errors. Candidate failures do not erase successful prefixes or confirm absence.
- Native RPCs cover get-subscribers, get-aaa-subscriber-by-session-id, PPPoE, accounting, route, FIB, filter, lockout, RADIUS and AAA module counters. Closed catalog CLI/XML covers the remaining health readers; see RPC_MATRIX.md.
- Subscriber accounting, route/FIB, lockout and returned filter counters are lazy. No guessed filter names, direct policer command, inferred drops, invented bitrate, FIB/interface equality rule or lockout from another MAC.
- System offers explicit RADIUS/AAA/FPC/environment reads. Interface details offer LACP and lane-preserving optics. Unknown shapes fail rather than inventing healthy data. No historical AAA-total threshold is an incident rule.

## Files

New: application/infrastructure_sessions.py; infrastructure/juniper/output.py, settings.py, trust.py; tests/test_juniper_handoff.py; tests/visual/juniper-mx204_driver.py and juniper-mx204-native.cjs; design, credential and capability documents; screenshots/QA JSON.

Updated: composition, existing SessionManager, query bus, Juniper request/parser/transport/provider modules, session/infrastructure API, existing login/template/workspace/dialog/CSS and generated runtime.js; Juniper, execution, migration and recovery reports. No new parallel app shell or CPE backend replacement.

## Validation

- **464 Python tests passed, 30 subtests passed** (`python -m pytest -q`). Includes 31 new contract/parser tests, transport and API regressions and existing Huawei/ZTE suite.
- **37 frontend tests passed** (`npm test`), including AD failure cleanup and no browser storage.
- Frontend sync/check, collectstatic --no-tailwind, compileall and git diff --check passed.
- Real `manage.py runapp`, Vela/Bottle and Qt WebEngine: **1366×768, 1600×900, 1920×1080**. Login fits 1366×768; shell touches WebView edges, modal centered, no horizontal shell overflow. Five infrastructure pages, multiple sessions, PPPoE/AAA, RADIUS, LACP/optics, CPE ZTE handoff, Return to subscriber and independent disconnects passed. New artifacts: `docs/screenshots/juniper-mx204/`.
- Remote Junos/CPE transports are synthetic in automated QA; no new agent physical login or Windows/WebView2 run. User-supplied MX204 manual observations are recorded separately in PHYSICAL_VALIDATION.md.

## Evidence and remaining work

Manual MX204/Junos 23.4R2-S5.6 evidence supplied by the user supersedes older no-target assumptions. Complete raw captures were not included for every health/schema variant. New constructed XML tests are not physical fixtures. Runtime read support is shape-gated with fixture evidence; this run does not promote PHYSICALLY_VALIDATED.

Still pending: full sanitized target XML replay for every reader, advanced MAC/interface lookup UI, automatic proven pp0→demux→ae→member path assembly, broader CLI-text dialect coverage, configured accounting cadence/delta chart, persistent subscriber history, protocol-auto negotiation beyond HTTP/HTTPS-by-port, timeout configuration UI and Windows acceptance. Unknown/changed-key tests cover local trust logic, not a Windows live SSH server. No IPv6-only CPE handoff is claimed.

Writes remain UNKNOWN/blocked: subscriber disconnect/reconnect, CoA, service/firewall modifications. CGNAT public mapping and direct policer reads remain unconfirmed. Ping/traceroute were preserved; corrupted manual paste is not treated as unsupported evidence. Migration is not declared complete.

## MX204 operator steps

Fetch/select `feat/juniper-bng`; activate `.venv`; install requirements; run `python tools/sync_frontend.py`, `python manage.py collectstatic --no-tailwind`, `python manage.py runapp`. Select Juniper, enter the authorized server, select SSH/XML and configure the actual SSH port in Advanced (50022 in the supplied environment, not a product default). Verify/trust the fingerprint externally, then authenticate with AD credentials. Search a test contract, select its actual session, compare IP/state/pp0/IDs, open details and choose Access CPE. Use separate CPE credentials, verify Return to subscriber and independent disconnects. Full target checklist: `docs/juniper/PHYSICAL_VALIDATION.md`.

Profiles SHA256 remains `0c04d0a57d4ba19f9fcbdd91534f11252cc4ce1a8a76a29db9ffcab3b820e3de`.

## Atualização visual posterior — Pajamas adaptado

O frontend desta integração recebeu novo shell Juniper, 21 rotas, detalhes laterais e tabs, com drawers para CPE/interfaces e modal SSH preservado. Backend e contratos acima permanecem intactos. Resultado atual: 464 Python +30 subtestes, 44 frontend e QA Vela/Qt três resoluções com transportes sintéticos. Relatório atual de UI/arquivos/matriz por rota/capturas e limites: [JUNIPER_PAJAMAS_REDESIGN_REPORT.md](JUNIPER_PAJAMAS_REDESIGN_REPORT.md). Sem nova validação física ou Windows.
