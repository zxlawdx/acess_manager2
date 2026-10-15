# Credential lifecycle

Corporate AD username/password authenticate directly to Junos through SSH/NETCONF. No LDAP SDK is involved. The browser clears the AD password field after success or failure and clears the request object's password after the attempt. Inputs use autocomplete=off for infrastructure credentials. The server passes credentials into transport setup, without saving them in session metadata, history, profiles or connection preferences. Closing the transport clears the owning reference; no password-based reconnect is scheduled.

CPE credentials are entered in a separate, initially empty modal. No AD credential is copied. The CPE password field is cleared before awaiting authentication and the request object is cleared in finally. Existing Huawei/ZTE clients retain their established session authentication lifecycle. Disconnect releases their provider as before.

Persistent files: juniper-connection.json contains version, default_host, last_successful_host, ssh_port, netconf_port, preferred_transport only. juniper-known-hosts contains public host keys, never credentials. Failed login does not promote the host. Existing profiles.json is untouched.

Host trust is explicit and scoped to host/port. An unauthenticated key-exchange probe presents SHA256 fingerprint; acceptance requires confirmation and an unchanged fingerprint/previous-key list on a second probe. Changed own-store keys fail closed. SSH can reuse system known_hosts when no own trust entry exists; an own-store entry takes precedence. NETCONF receives an explicitly pinned key when present and otherwise retains ncclient verification. No AutoAddPolicy or hostkey_verify=False.

Raw command output stays in a repr-hidden in-memory JunosCommandResult. Only normalized allowlisted fields and safe errors cross the API. CLI/XML credentials or arbitrary remote exception strings are not exported. Tests cover secret-free settings, API responses and AD failure cleanup.

Limits: Python/JavaScript cannot guarantee zeroization of immutable string copies. No Windows SSH/known_hosts execution was performed in this round. Host-key confirmation must use a trusted external source; seeing a fingerprint does not prove server identity.
