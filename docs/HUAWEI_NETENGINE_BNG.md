# Huawei NetEngine BNG

Target supplied in the implementation brief: NetEngine 8000 M8, VRP 8.250, V800R025C00SPC500. This branch has **no physical validation** against that device. Tests use explicitly synthetic text, not captured production output.

Select `Huawei NetEngine — BNG (experimental)` at login, or POST `/session` with vendor `huawei_bng`, host, username, password and optional SSH port. It is distinct from the Huawei ONT HTTP provider. Rejected host keys must be inspected and accepted through the existing infrastructure trust workflow; automatic trust is never enabled.

## Closed whitelist

| Intent | Command | Validation |
| --- | --- | --- |
| Health | `display clock` | fixed literal; initial command check |
| System | `display version` | fixed literal; optional facts after health |
| Username | `display access-user username <username>` | ASCII username grammar; no whitespace/operators |
| Detail | `display access-user user-id <id>` | 1–12 decimal digits |

Numeric contracts retain leading zeros and expand to the existing brd/cdy/364 candidates. `user-id:42` explicitly selects a User ID. IP, MAC and serial inputs are recognized but Huawei command execution for them is PHYSICAL_VALIDATION_PENDING; there is no inventory fallback. Arbitrary usernames are now accepted, including names beyond the three contract prefixes.

SSH uses an interactive VRP shell. Only label/value subscriber detail is parsed. Required fields: User name and User ID. Supported optional labels include User state, Domain, Interface, Physical interface, PeVlan, CeVlan, IP address, Gateway, Primary/Secondary DNS and IPv6 address. Missing fields remain null/empty. An absent User state never becomes ONLINE. More than one user block, malformed addressing and unknown shapes fail closed. Identity is checked against the requested username or ID.

Pagination is handled in the transport: a recognized `---- More ----` sends one SPACE and reading continues to the learned prompt. Split markers, ANSI and backspace erasure are covered by fixtures. No screen-length changes, privileged modes or arbitrary continuation input are used. Output is bounded to 1 MiB and 256 pages. A timed-out command closes its unfinished shell; a subsequent read opens a fresh shell on the authenticated SSH connection. Physical validation of this automated path remains pending.

## Required redacted captures

Collect `display version`, focused username and User ID output, including an explicitly absent user and permission errors. Confirm exact label spelling, tables versus detail blocks, field units and pagination behavior. Never commit real usernames, hosts, passwords, RADIUS secrets or full configuration.

Pool, Eth-Trunk, interfaces, routing summaries, BGP, OSPF, BFD, transceivers, AAA failure records, QoS and subscriber traffic readers are not validated or enabled. No commands for those features are inferred from other VRP versions. Obtain exact permitted read-only commands and redacted outputs before adding their parsers. Privileged diagnose/debugging mode is never entered.


## Interactive connection correction

The user manually confirmed Paramiko authentication, `invoke_shell()`, a hostname-specific VRP prompt and paginated `display version`. The earlier implementation used an exec channel, waited for command termination and never sent SPACE. It could time out before detecting the pager, then invalidate the login because facts were mandatory.

The new sequence is TCP → verified SSH/AD → interactive shell → detected VRP prompt → `display clock` → CONNECTED → optional paginated facts. Facts/parse failures retain a partial authenticated connection when the SSH transport remains active. A complete SSH failure still invalidates the session. Generic NetEngine 8000 output does not prove the M8 submodel; the parser reports M8 only when explicitly present.

Command reads use an absolute deadline including lock wait, shell recovery and sending. TCP, banner, AD authentication and shell negotiation have independent 8-second limits. The shell watchdog also bounds PTY/shell negotiation. Command/prompt/pagination failures report their own static code and stage. The provider and SessionManager log only safe metadata, never the raw output, password or exception string.

The fixture `tests/fixtures/huawei_bng/version_paginated.txt` is based on the user's supplied output format, with a redacted hostname and an explicit placeholder for omitted lines. It is not a complete physical capture or proof of successful automated operation on production.
