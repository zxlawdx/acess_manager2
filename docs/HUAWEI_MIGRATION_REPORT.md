# Huawei Migration Report

## EG8041X6-10 priority runtime

A dedicated evidence-driven runtime was added for `EG8041X6-10` / `EG8041X7-10`. Selection requires authenticated `amp_bbsp` evidence plus the expected WLAN object graph; model name alone does not grant support. The runtime restores Wi-Fi/WAN readers, native ping/traceroute, client merging, counter-source traffic, channel discovery, and on-demand Wi-Fi-key reading.

The runtime preserves explicit HTTPS port 80. It does not normalize HTTPS to 443.

## Capability policy

`UNKNOWN` now means “not proven for this active runtime”. `UNSUPPORTED` is reserved for negative evidence. `PARTIAL` does not authorize writes. The X6 regression suite specifically prevents Wi-Fi/WAN from returning `UNSUPPORTED` when the supplied fixtures prove those surfaces.

## Writes

Wi-Fi mutation paths are wired through the shared AMP/BBSP captured service. This pass does **not** claim new physical write validation on the live X6: the inherited registry itself says the mutation surface is captured but per-operation physical effect/read-back still needs confirmation.

Reboot is intentionally **not** fabricated. The supplied legacy proves a reboot page/surface but does not prove a production X6 reboot writer with verification semantics; therefore `reboot.write = UNKNOWN`.

## Remaining Huawei evidence gaps

X6-specific DHCP, DNS, optical and physical LAN fixtures were not present in the supplied local fixture set. The parsers/readers are migrated and runtime-probed, but absence of returned state remains `UNKNOWN`, not `UNSUPPORTED`. Broader Huawei families present in the legacy still require the same provider-level parity review; this report does not declare all Huawei complete.
