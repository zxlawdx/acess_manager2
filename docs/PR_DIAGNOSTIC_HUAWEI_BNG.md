# Huawei/Juniper provider isolation

Huawei BNG is not implemented as a Juniper mode.

- Huawei BNG no longer reuses Juniper routes/views as its runtime identity.
- Common SSH trust and endpoint validation were moved to neutral infrastructure modules.
- Huawei reads dispatch exclusively through HuaweiNetEngineBngProvider.
- Juniper-only readers no longer act as fallback for Huawei.
- Frontend renders provider-specific infrastructure workspaces.
- Cross-provider command execution is covered by regression tests.

The existing interactive VRP shell, SPACE continuation, learned prompt, response/deadline limits and granular failures remain intact. Trust storage migrates prior fingerprints without accepting unknown keys. Settings are separated per provider, and stale session errors belong to the application/domain boundary.

Advanced Huawei AAA, QoS counters, health readers and application playbooks remain pending. No production device was accessed. Physical validation of the automated integration remains pending.

PR #36 and its later pagination successor #38 were already merged when this follow-up began. Continue on the existing feature branch and submit these new changes as a draft against main; do not merge automatically.
