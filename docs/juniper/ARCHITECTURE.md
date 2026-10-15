# Juniper integration architecture

Baseline branch `fix/zte-h3601p-v9`, commit `8d115beacc3c85bad191a6f6109e4bde4b9541a4`; clean tree. Juniper work continues from this committed baseline.

The existing application uses independent Huawei/ZTE providers, CapabilitySet read/write gates, SessionManager with a per-session RLock, DeviceQueryBus/DeviceCommandBus, Vela/Bottle API and an esbuild JavaScript workspace. Huawei/ZTE use HTTP protocols. Paramiko is already a dependency; lxml is present through runtime dependencies; ncclient is absent.

Add an infrastructure provider rather than an ONT subclass. Explicit Juniper selection routes before HTTP fingerprinting. Vendor-neutral infrastructure query methods use the same operation lock. A Juniper workspace uses the global sidebar/topbar and existing dialogs/tables; CPE Wi-Fi/DHCP/DNS/optical pages are not presented for Juniper. No subscriber queries or results are persisted.

Transport choice: ncclient 0.7.0 for standard NETCONF framing/session management, reusing Paramiko; Paramiko CLI fallback with XML output. PyEZ is not needed for this scope. NETCONF is preferred; an explicitly selected auto mode falls back only on transport unavailability, never on rejected credentials/host keys. Known-host verification is mandatory. No remote service activation/configuration.

Default behavior is read-only. No target model, release, management host or credentials were supplied. Physical and Windows validation cannot be claimed. P0 reads, fixtures and Vela QA precede any mutation work; disconnect/reconnect remain UNKNOWN until their independent prerequisites are met.
