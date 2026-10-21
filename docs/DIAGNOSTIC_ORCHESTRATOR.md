# Diagnostic orchestrator — initial integrated delivery

This branch continues `feat/configuration-ux-wifi-standard` without replacing its working tree. It delivers an initial, read-only vertical slice, **not the complete six-phase roadmap**.

## Runtime path

Subscriber input → focused BNG lookup → verified CPE handoff (if present) → existing CPE readers → one snapshot → `domain/triage.py` → attendance text.

`DiagnosticOrchestrator` is composed once in `composition.py`. It has one job worker and two source workers. One unfinished job is permitted at a time; identical active queries return the same job ID. Completed job retention is bounded to 20. No additional device polling loop runs in the backend.

POST `/infrastructure/diagnostics/start` with `query` returns a job ID and current progress. POST `/infrastructure/diagnostics/progress` with `id` reads partial source results. POST `/infrastructure/diagnostics/cancel` requests cancellation. The subscribers screen exposes these operations with two attendance copy actions.

## Budgets and freshness

Huawei command budget: 8 seconds including lock wait; output: 1 MiB and 256 pager continuations. Interactive pager handling does not reset the command deadline. Initial connectivity is confirmed using `display clock`; facts collection is optional and can degrade to PARTIAL. Global orchestration collection budget: 25 seconds. Subscriber lookup cache: 4 seconds, scoped to infrastructure application session and normalized query. Cached output preserves its original `observed_at`; progress events have their own timestamps.

Cancellation is cooperative between sources and between existing CPE readers. An already-running legacy CPE request cannot be forcibly stopped by this service. On budget expiry the partial result becomes visible, but a new job remains blocked until outstanding readers finish. This preserves boundedness and prevents concurrent reads against the same ONT; it is **not a hard end-to-end timeout guarantee**. Source TTL configuration, infrastructure health caching, and comprehensive per-reader cancellation remain pending.

## Identity and evidence

An independently connected CPE is not evidence about the requested subscriber. CPE collection requires the existing BNG handoff context, matching application session, subscriber session, username and management IPv4. Ambiguous matches do not pick an arbitrary subscriber. Unavailable data remains UNKNOWN. A failed lookup never means OFFLINE.

Safe CPE section projection reuses `safe_sections`; no raw configuration enters the snapshot. Technical and customer summaries come from collected triage output. No LLM or fabricated reader is used. DNS configuration is not a DNS reachability measurement. This orchestrator does not run active ICMP, TCP, TLS or MTU probes; the existing full-diagnostic service remains available independently.

## Observations

Process-local bounded history stores explicit ONLINE/OFFLINE transitions only. Repeated reads do not create transitions. Three distinct currently offline subscribers on the same observed S-VLAN and infrastructure session within five minutes produce a possible collective incident with medium confidence. This heuristic cannot confirm a network outage. No topological relationship is invented. History is not durable and does not recover disconnects occurring between reads.

## Remaining roadmap

Adaptive AAA reads, configurable multi-source plans, first-class recommendation codes, persistent operational history, separate DNS UDP/TCP tests, IPv6 protocol diagnosis, DHCP/ARP/ND, QoS counters, MTU/MSS/PMTUD, pool/LAG/routing health and application playbooks are not implemented by this slice. The UI includes a compact path summary; detailed clickable per-node views and dedicated card layout remain pending.
