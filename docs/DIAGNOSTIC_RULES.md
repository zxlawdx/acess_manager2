# Evidence-based diagnostic rules

The existing pure `domain/triage.py` remains the decision engine. The frontend does not implement competing diagnostic rules. Existing CPE optical, LAN and Wi-Fi rules are retained.

New rules:

| Evidence | Finding | Action |
| --- | --- | --- |
| Explicit BNG state OFFLINE | PPPOE_OFFLINE | Validate optical access, VLAN and AAA; cause remains unknown |
| Subscriber IPv4 in 100.64.0.0/10 | CGNAT_SHARED | Explain that ONT forwarding does not guarantee external access |
| Applied downstream Mbps below manually supplied expected Mbps | QOS_RATE_LIMIT_TOO_LOW | Check applied profile |
| Three distinct locally observed offline subscribers sharing S-VLAN/source in 300 seconds | POSSIBLE_COLLECTIVE_INCIDENT | Escalate for network validation |

QoS expected speed must be supplied by a caller or an integrated commercial source; this branch does not infer a plan or parse Huawei QoS counters. No diagnosis infers NAT location from shared addressing. Failed lookup, missing telemetry, IA_NA absence, traceroute stars and a single ordinary ping do not establish a fault.

`TriageEvidence` adds optional observation timestamp, reader, confidence and FACT/INFERENCE kind while retaining existing value/origin fields for compatibility. Subscriber facts identify the subscriber detail reader. Incident evidence is INFERENCE with medium confidence. Existing CPE evidence remains tied to its snapshot readers; full per-device/site/freshness expansion is pending.

IP scope classification distinguishes CGNAT shared, RFC1918, IPv4 documentation/link-local/loopback/reserved/public and IPv6 global/ULA/link-local. Invalid values are UNKNOWN.

Customer attendance text stays partial when coverage is missing. Copying a summary does not imply that any recommended remediation was executed.
