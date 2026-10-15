# Juniper capability and evidence matrix — 2026-10-15

Physical source is the user's final MX204 prompt: manual SSH/CLI observations on MX204 Junos 23.4R2-S5.6. The agent did not authenticate to that device. The supplied text gives commands, RPCs, field names and selected snippets; it is not a complete raw XML capture set.

| Area | Code / tests | Runtime policy | Evidence / remaining gap |
|---|---|---|---|
| Facts, SSH custom port, NETCONF | Implemented | Facts required; unknown keys rejected | Fixture/transport tests; manual SSH evidence supplied |
| Subscriber username / IPv4 / selected ID | Implemented | Lookup PARTIAL until recognized response | Described XML styles, count zero, xnm:error tests; target app replay pending |
| PPPoE / AAA | Implemented | Independent lazy reads | Native RPC names from supplied physical evidence; exact complete target XML still needed |
| Accounting / route / FIB / lockout / filter | Implemented, lazy | PARTIAL; successful shape promotes individual reader | Constructed structural tests; no app/device execution claimed |
| Service shaping / child DHCPv6 | Aggregation implemented | Only returned fields | Distinct IDs, bandwith_in/out, parent-child tests; all target field nesting not captured |
| RADIUS / global AAA / FPC / environment | Explicit section reads | Health remains PARTIAL | Allowlist parsers and constructed tests; complete target schemas pending |
| LACP / multi-lane optics | Explicit interface reads | PARTIAL until recognized response | Constructed parser tests and native UI QA; target XML comparison pending |
| Subscriber → CPE | Implemented | Fresh selected ID/user/IP required twice | Unit tests + real Vela/API/UI with synthetic remote transports |
| Path topology | Interface underlying field available | No inferred OLT/ONU or invented links | Automatic pp0→demux→ae→members assembly still pending |
| Advanced MAC/interface search | Not exposed | Not advertised supported | Child association parser exists; advanced search workflow pending |
| CGNAT mapping / direct policer read | Not implemented | UNKNOWN | Pool name is not mapping proof; direct policer command not validated |
| Ping / traceroute | Existing bounded readers preserved | Research/fixture evidence | Manual paste failures do not establish unsupported status |
| Disconnect / reconnect / CoA / shaping writes | Not implemented | UNKNOWN / blocked | Separate authorized physical mutation validation required |

No reader is marked PHYSICALLY_VALIDATED by this agent run. SUPPORTED is a runtime shape result carrying FIXTURE_VALIDATED evidence, not a physical acceptance claim. Missing/unknown shapes fail explicitly and do not become offline subscribers.
