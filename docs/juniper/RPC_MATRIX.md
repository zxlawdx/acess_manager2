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
