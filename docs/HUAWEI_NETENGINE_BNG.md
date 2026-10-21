# Huawei NetEngine BNG

Target supplied in the implementation brief: NetEngine 8000 M8, VRP 8.250, V800R025C00SPC500. This branch has **no physical validation** against that device. Tests use explicitly synthetic text, not captured production output.

Select `Huawei NetEngine — BNG (experimental)` at login, or POST `/session` with vendor `huawei_bng`, host, username, password and optional SSH port. It is distinct from the Huawei ONT HTTP provider. Rejected host keys must be inspected and accepted through the existing infrastructure trust workflow; automatic trust is never enabled.

## Closed whitelist

| Intent | Command | Validation |
| --- | --- | --- |
| System | `display version` | fixed literal |
| Username | `display access-user username <username>` | ASCII username grammar; no whitespace/operators |
| Detail | `display access-user user-id <id>` | 1–12 decimal digits |

Numeric contracts retain leading zeros and expand to the existing brd/cdy/364 candidates. `user-id:42` explicitly selects a User ID. IP, MAC and serial inputs are recognized but Huawei command execution for them is PHYSICAL_VALIDATION_PENDING; there is no inventory fallback. Arbitrary usernames are now accepted, including names beyond the three contract prefixes.

Only label/value subscriber detail is parsed. Required fields: User name and User ID. Supported optional labels include User state, Domain, Interface, Physical interface, PeVlan, CeVlan, IP address, Gateway, Primary/Secondary DNS and IPv6 address. Missing fields remain null/empty. An absent User state never becomes ONLINE. More than one user block, malformed addressing and unknown shapes fail closed. Identity is checked against the requested username or ID.

Pagination is detected and rejected as incomplete. The transport does not attempt screen-length changes or send arbitrary continuation input. Accounts/outputs requiring pagination need physical testing before support can be expanded.

## Required redacted captures

Collect `display version`, focused username and User ID output, including an explicitly absent user and permission errors. Confirm exact label spelling, tables versus detail blocks, field units and pagination behavior. Never commit real usernames, hosts, passwords, RADIUS secrets or full configuration.

Pool, Eth-Trunk, interfaces, routing summaries, BGP, OSPF, BFD, transceivers, AAA failure records, QoS and subscriber traffic readers are not validated or enabled. No commands for those features are inferred from other VRP versions. Obtain exact permitted read-only commands and redacted outputs before adding their parsers. Privileged diagnose/debugging mode is never entered.
