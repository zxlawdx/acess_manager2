# Juniper operational/RPC matrix

Runtime NETCONF uses ncclient Junos `<command format="xml">CLI</command>` and parses structured XML. SSH fallback uses the same closed command catalog plus fixed `| display xml | no-more`. No user-supplied CLI or local shell. Native RPC names below are reference mappings, not release-specific RPC captures. No target was available for `| display xml rpc`.

| Feature | CLI | RPC/XML | Main fields | Platform/release | Evidence |
|---|---|---|---|---|---|
| Facts | show version | command wrapper; native tag pending target capture | model, release, hostname | Junos; fixtures MX204 24.2R1 namespace only | Research + automated |
| Uptime | show system uptime | command wrapper / system-uptime-information | system-booted-time seconds attribute | Classic/Evolved differ | Synthetic + automated |
| Subscriber probe | show subscribers client-type pppoe count | command wrapper; get-subscribers catalog | known subscriber count envelope | MX candidate only | Synthetic + automated |
| Contract lookup | show subscribers user-name PREFIX_digits extensive | command wrapper; get-subscribers/user-name/display in official YANG | subscriber records | M120/M320/MX; target unknown | Synthetic + automated |
| Address lookup | show subscribers address IP extensive | command wrapper; get-subscribers/address | IPv4/IPv6 records | Target unknown | Implemented; query validation tested |
| Session detail | show subscribers id ID extensive | command wrapper; get-subscribers/id | distinct session, addressing, policy | Target unknown | Synthetic + automated |
| PPPoE detail | show pppoe interfaces INTERFACE detail | command wrapper; get-pppoe-interface-information catalog | state, remote-mac, underlying-interface-name | Junos candidate | Synthetic + automated |
| AAA detail | show network-access aaa subscribers session-id ID detail | command wrapper; get-aaa-subscriber-table native options pending | AAA state, accounting, uptime | CLI option since 17.3 | Synthetic + automated |
| Interfaces | show interfaces terse; show interfaces NAME extensive | command wrapper; get-interface-information documented | admin/link/address/counters | Per returned schema | Synthetic + automated |
| Chassis | show chassis hardware | command wrapper; get-chassis-inventory documented | hierarchical component rows | Family-dependent | Synthetic + automated |
| RE resources | show chassis routing-engine | command wrapper / route-engine-information | CPU idle, memory, temperature, load | Per returned schema | Synthetic + automated |
| Ping | ping IP count 4 wait 1 no-resolve [routing-instance RI] | command wrapper / ping-results | packets/loss, reported RTT | Evolved RI restricted | Synthetic + automated |
| Trace | traceroute IP ttl 8 wait 1 no-resolve [routing-instance RI] | command wrapper / traceroute-results | hop/address/reported RTT | Schema-dependent | Synthetic + automated |
| Disconnect/reconnect | clear network-access aaa subscriber session-id ID [reconnect] | Not implemented/promoted | Requires current device/session/IP identity and read-back | Unknown target/privilege | RESEARCH_ONLY |

Unrecognized XML or ASCII-only `<output>` fails explicitly, never becomes a successful empty list. Versioned namespaces are removed structurally; unknown fields are not returned raw. Actual native RPC capture is a remaining physical task.

## MX204 supplied physical evidence and current adapter — 2026-10-15

These native RPC names replace earlier speculative catalog entries. NETCONF dispatches typed XML for these requests; other existing facts/health reads retain the bounded XML command adapter when no native mapping is supplied. SSH sends each validated command atomically with `| display xml | no-more`.

| Intent | Native RPC | Parameters |
|---|---|---|
| Subscriber username | get-subscribers | user-name, extensive |
| Selected subscriber | get-subscribers | id, extensive |
| Subscriber IPv4 | get-subscribers | address, extensive |
| Accounting | get-subscribers | id, accounting-statistics |
| PPPoE | get-pppoe-interface-information | interface-name, detail |
| AAA selected ID | **get-aaa-subscriber-by-session-id** | id, detail |
| Exact IPv4 route | get-route-information | destination /32, exact, extensive |
| FIB | get-forwarding-table-information | destination |
| Firewall filter | get-firewall-filter-information | filtername from current subscriber only |
| Lockout | get-pppoe-lockout-information | underlying-interface-name |
| RADIUS | get-radius-servers-table | detail |
| AAA counters | get-aaa-module-statistics | authentication/detail, accounting/detail, dynamic-requests |

LACP, optics, FPC and environment use closed read-only CLI catalog commands with XML output. No generic command endpoint, direct firewall policer command, clear, set, commit, CoA or subscriber mutation was added. Full device response schemas still require target replay; command-level manual evidence is not app-level validation.
