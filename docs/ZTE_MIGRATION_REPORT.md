# ZTE Migration Report

The `next` tree already contains the migrated ThinkLua protocol/configuration modules and F6201B captured writer/diagnostic code. This pass corrected provider-level regressions rather than rewriting those protocols.

Changes in this pass:

- known ZTE families now expose diagnostics as command-capable, so ping/traceroute are not blocked by a read-only capability;
- ZTE traffic now consumes WAN, LAN and Wi-Fi-client RX/TX counters already parsed by the migrated protocol;
- unproven writes on unidentified ZTE or F6201B reboot are `UNKNOWN`, not `UNSUPPORTED`;
- F6201B Wi-Fi/DNS captured writers remain the only F6201B writers promoted to `SUPPORTED`; other captured surfaces stay `PARTIAL` until an exact command/read-back path is proven.

This is not a claim of complete ZTE parity for every legacy workbench/management surface. The forensic inventories preserve the remaining legacy symbols/endpoints for subsequent provider wiring.
