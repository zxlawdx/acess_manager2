# Secure infrastructure access

## Credentials

Normal login passes credentials to SSH and does not persist them. Opt-in runtime reuse is available through POST `/infrastructure/credentials` with username/password. Subsequent POST `/session` requests may use `use_runtime_credential: true` with explicit infrastructure vendor and endpoint. This API-only reuse flow has no frontend checkbox yet.

The credential object is excluded from status, repr and serialization. Replacing it revokes the previous reference; DELETE `/infrastructure/credentials`, explicit infrastructure disconnect and process exit revoke it. A CPE disconnect does not revoke an independent infrastructure session. Python memory cannot guarantee cryptographic zeroization of immutable strings. Credentials are never written to preferences, diagnostic records, query strings or transport error messages.

The neutral `/infrastructure/endpoints` preference API accepts an allowlist of endpoint fields. Unknown fields (including password/token keys) are rejected. A maximum of 32 endpoint profiles is accepted. Hosts entered at runtime may be persisted as user preferences; no production hosts are shipped or committed.

## SSH

Paramiko SSH verifies OS-known host keys and the existing endpoint trust policy. No AutoAddPolicy, local shell, system-view, diagnose, debugging, reset, clear, cut access-user, shutdown, undo, commit, save or reboot path is implemented. No command text is accepted from the API. Every command object is reconstructed and validated before dispatch.

Read channels close on completion, timeout, cancellation, pagination, parser-independent command failure and output limit. Connections disable key-agent and private-key discovery. Operational errors export fixed codes, never exception payloads or raw remote output. The per-provider ring log contains feature, status, elapsed time and timestamp only.

The orchestration service limits concurrent work; the transport serializes commands. Huawei transport rejects more than ten reads in a rolling one-second interval. A configurable shared per-endpoint rate limiter across independent transport instances and full structured parser/cache metrics remain pending. Existing CPE reader limits still apply. No operational production queries or physical tests were executed during implementation.
