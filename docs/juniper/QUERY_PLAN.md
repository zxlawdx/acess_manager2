# Juniper query plan

| Feature | Query | When | Cache | Cost / bound | Fallback |
|---|---|---|---|---|---|
| Facts | show version | Connect | Session facts | One RPC | NETCONF or explicitly allowed SSH/XML |
| Uptime | show system uptime | Connect/overview | No stale subscriber cache | One optional RPC | Partial facts remain available |
| Subscriber capability | client-type pppoe count | Connect on MX candidate | Capability result | One aggregate count, no inventory | PARTIAL / permission evidence |
| Contract/user/IP | filtered show subscribers extensive | Search/refresh | None | 1 or 3 sequential queries, 24-second budget | Per-candidate timeout/error; never global dump |
| Session | show subscribers id ID extensive | Open/refresh details | None | One RPC | Session absent is distinct |
| PPPoE | selected interface detail | Detail button | None | Fresh selected session + detail | Independent read failure |
| AAA | selected session-id detail | Detail button | None | Fresh selected session + detail | Independent privilege/schema failure |
| Interface inventory | terse | Page open | None | One request, XML limited to 4 MiB on parse | No automatic extensive inventory |
| Interface counters | selected interface extensive | Detail open | None | One request | Missing counters stay null |
| Hardware | chassis hardware | System page | None | One request | Independent error |
| CPU/memory | chassis routing-engine | Manual button | None | One request | Missing readings stay null |
| Ping/trace | fixed finite probes | Manual form | None | 4 packets / 8 hops, RPC timeout 8 seconds | Timeout is not no-loss/no-route evidence |

Timeouts: connect/banner/auth 8 seconds, RPC/read 8 seconds; subscriber lookup total budget 24 seconds. Explicit auto mode may attempt NETCONF then SSH, so connect can use both connection budgets. Optional connect reads have their own bounded RPC budgets. One reused session and RLock serialize operations. No per-candidate extra connections, polling, background futures or query history.

Cancel/navigation aborts the browser request and ignores stale results; an already-issued device RPC may run until its bounded timeout. Disconnect closes transport and clears provider facts/capabilities; selected subscribers are view-local and removed on navigation/disconnect. No remote NETCONF activation, configuration load/commit, RADIUS change, lockout clear or mutation retry.

## Handoff and physical-response correction — 2026-10-15

The first response remains the filtered lookup, without automatic enrichment. Each candidate is independent, carries its rows and safe failure code, and an errored candidate makes the aggregate incomplete. Duplicate username sessions keep distinct IDs. Consecutive detail/extensive/service styles aggregate by identity; DHCP children attach only through underlying-session-id.

Every detail/enrichment re-reads the selected parent ID and checks username. CPE draft creation and CPE connect each re-read ID/user/IPv4 and reject stale context. Infrastructure query routing does not follow the selected CPE workspace. Returning to subscriber retains the query in memory and performs a fresh lookup.

Enrichment is operator-triggered, one requested section at a time, under the existing bounded transport and infrastructure lock. No per-prefix AAA/PPPoE calls, global subscriber dump or background inventory sweep. Route/FIB do not compare internal interface equality; lockout correlates the selected MAC; accounting remains cumulative without invented Mbps.

Output detection separates transport, normalized framing, XML, recognized CLI text, empty/error/banner/unknown. Only subscriber label-oriented text has fallback; malformed XML and NETCONF text are not silently accepted. Pagination is an explicit incomplete-response error. Raw payloads stay transient and are not returned by the API.

Pending: advanced MAC/interface search UI, full text dialect coverage, automatic evidence-based physical path assembly, configurable accounting sampling/delta UI, per-reader full target captures and Windows execution.
