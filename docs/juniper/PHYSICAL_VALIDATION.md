# Physical validation provenance — 2026-10-15

The user supplied manual device evidence in PROMPT_FINAL_JUNIPER_MX204_ACCESS_MANAGER: MX204, Junos 23.4R2-S5.6, SSH on a custom port. This supersedes the previous report's statement that no target model/release or physical observations were supplied.

The supplied evidence confirms manual read commands for subscriber username/ID/IPv4, PPPoE, AAA, accounting, route/FIB, firewall filter counters, lockout, RADIUS/AAA statistics, LACP, optics and chassis. SSH host-key changes were observed. No agent device login, live subscriber lookup, Windows/WebView2 run or physical end-to-end CPE handoff occurred in this round.

The prompt contains field descriptions, RPC snippets and count-zero / No such subscriber fragments, rather than complete captured responses for every reader. New tests are constructed sanitized structures derived from those descriptions; they must not be labeled captured XML fixtures. Full sanitized target XML is still required to accept every release-specific nested shape.

Local acceptance: real manage.py runapp, real Vela/Bottle API, Qt WebEngine on Linux/offscreen; remote Junos transport and CPE HTTP client only are synthetic. Three resolutions, subscriber handoff, independent sessions, return, RADIUS/LACP/optics UI and shell geometry passed. See docs/screenshots/juniper-mx204/qa.json.

## Target acceptance procedure

1. Fetch and select feat/juniper-bng; preserve local profiles. Activate the Windows venv and install requirements.txt.
2. Run python tools/sync_frontend.py; python manage.py collectstatic --no-tailwind; python manage.py runapp.
3. Select Juniper. Enter the authorized server; choose SSH/XML, expand advanced settings and enter the environment's SSH port (50022 in the supplied evidence). Product defaults do not hardcode that port or the private IP. NETCONF uses its own configurable port, initially 830.
4. Use Verify SSH key; compare the SHA256 fingerprint with a trusted administrator/source. Explicitly accept only after verification. A changed key must be revalidated; do not bypass mismatch handling.
5. Authenticate with corporate username/password. Verify the password field is cleared. Search an authorized test contract, preserving zeros; compare all three candidate outcomes with the CLI.
6. Select the actual session when multiple sessions exist. Compare IPv4, pp0, MAC, parent ID, service ID and PPPoE ID. Open AAA/PPPoE, accounting, route/FIB, filters and lockout separately; collect sanitized full XML on any shape error.
7. Choose Access CPE. Confirm current IPv4, protocol, port and manufacturer; enter separate CPE credentials. Verify Juniper remains connected, then Return to subscriber. Test CPE-only disconnect, Juniper-only disconnect, changed IP/session and CPE authentication failure.
8. Open System health and Interfaces/LACP/optics where authorized. Compare lanes, counters and alarms to returned device data. No total AAA reject count alone is an incident; no policer counter alone is a drop count.
9. Validate Windows WebView2 at 1366×768, 1600×900 and 1920×1080, including resize/maximize, modal, shell boundaries and scrolling. This step remains unexecuted here.

Writes, CGNAT public mapping and direct policer reads remain outside physical acceptance. Ping/traceroute remain unvalidated physically, not declared unsupported.
