# Infrastructure provider boundaries

Huawei BNG is not implemented as a Juniper mode.

## Shared contracts

`domain/infrastructure.py` defines the neutral read contract. The application dispatcher accepts only its closed set of neutral intentions: system, interfaces, interface detail, health, diagnostics, link, chassis, resources, subscriber context/lookup/detail and operation log. Each call goes to the selected provider's corresponding method. The application never chooses a `get_juniper_*` fallback or builds vendor CLI.

`common/endpoint.py` validates endpoints for both providers. `common/ssh_trust.py` owns fingerprint storage and trust policy with neutral `SshTrustError`. Existing fingerprints are migrated once from `juniper-known-hosts` to `infrastructure-known-hosts`; both providers thereafter share that authoritative file. Legacy `juniper.trust` exports thin compatibility adapters for external callers only. Huawei imports neither those adapters nor Juniper errors.

`common/settings.py` stores nonsecret preferences in separate provider files. `/infrastructure/settings/huawei_bng` exposes SSH-only Huawei preferences; `/infrastructure/settings/juniper` exposes Junos preferences. The old unqualified `/infrastructure/settings` is a documented Junos compatibility endpoint. A Huawei session never uses it for its preferences. No password is persisted.

`common/observability.py` owns the shared request context. `InfrastructureSessionError` owns stale application-session failures. Provider errors share the domain infrastructure error boundary, while keeping their own safe messages/codes.

## Provider adapters

Juniper's neutral methods adapt to existing Junos readers inside `JuniperProvider`. Existing Juniper capability aliases remain for compatibility with its advanced workspace. Shared capabilities also have neutral aliases (interfaces, interface_detail, health, chassis, resources, diagnostics, link, subscriber_context). The Junos command grammar and NETCONF/XML parsers are unchanged.

Huawei's neutral methods execute only its `display clock`, `display version`, and focused `display access-user` grammar. Advanced readers without physical validation return PHYSICAL_VALIDATION_PENDING directly, with no method lookup or command fallback to Juniper. Interactive VRP shell/pager handling and failure stages are preserved.

## Presentation

`views/huaweiBng.js` owns Huawei BNG routes, overview, subscriber lookup/detail and diagnostic entry. `views/juniper.js` owns Junos routes and advanced views. A Huawei route can never resolve through `juniperRoutes`.

`views/infrastructure.js` shares the neutral request envelope, progressive diagnosis/attendance and verified CPE handoff. The shared drawer primitive lives in `shared/infrastructure-ui.js`. CSS infrastructure-shell/surface and login fields are neutral; semantic juniper-shell/surface classes are assigned only to Junos sessions. Huawei uses its own navigation and VRP labels. Existing j-* component class names remain presentational compatibility identifiers, not provider routing.

## Isolation checks

Regression tests intercept both providers' command streams, exercise neutral routes through Vela HTTP, check Huawei import boundaries, stale errors and trust/settings isolation, and assert Huawei rendering does not fetch Junos-only sections. No physical Huawei access was performed; PHYSICAL_VALIDATION_PENDING remains applicable.
