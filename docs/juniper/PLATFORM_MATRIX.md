# Juniper platform matrix

| Family | Junos | Subscriber lookup | PPPoE | NETCONF | Evidence |
|---|---|---|---|---|---|
| MX204 | Classic | Candidate, runtime shape required | Official Feature Explorer lists platform-specific baseline | If enabled | Research; synthetic fixture labeled 24.2R1, not physical |
| MX240/MX480/MX960 | Classic | Official user-name filter; runtime validation required | MPC/MIC/license/release dependent | If enabled | Research only for these models |
| vMX | Classic | Lab candidate; do not inherit physical MX feature claims | Target/release proof pending | If enabled | Not physically validated |
| MX | Evolved | Separate release/schema awareness | Platform-specific | If enabled | Research only; no CUPS schema mixed into classic parser |
| BNG CUPS | Controller / UP | No dedicated CUPS parser delivered | No claim | No claim | RESEARCH_ONLY |
| SRX | Junos | Not assumed BNG | PPPoE client/server semantics must be distinguished | If enabled | Facts/interface reads may work; runtime dependent |
| EX/QFX | Junos | Not assumed BNG | Not assumed | If enabled | Facts/interface workspace remains independent |

No real target model/release was supplied. Facts are read at connection; an MX name permits only a cheap read probe, not blanket support. SUPPORTED means a compatible runtime response, with fixture/automated evidence recorded separately; it is never a PHYSICALLY_VALIDATED claim. Optional reads stay PARTIAL until compatible output; writes remain UNKNOWN.
