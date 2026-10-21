# Infrastructure provider architecture

`domain/infrastructure.py` defines provider-neutral read contracts and a runtime credential object. `InfrastructureSessions` retains the existing independent device/infrastructure sessions. Explicit vendors `juniper` and `huawei_bng` bypass HTTP fingerprinting.

Public `/infrastructure/system`, `/interfaces`, `/interfaces/detail`, `/health`, `/diagnostics` and `/interfaces/link` dispatch neutral read intentions through `application/services/infrastructure_reads.py`. The compatibility adapter maps those intentions onto existing Junos readers and capabilities. Existing Juniper methods and route paths remain available; this is a gradual migration, not a duplicated Junos implementation.

Subscriber lookup/detail already have neutral method names. Huawei implements only focused username/User ID reads and system identification. Other neutral health readers return PHYSICAL_VALIDATION_PENDING for Huawei. Public error codes distinguish permission denial, unsupported command, pagination, unknown parser shape, identity mismatch and transport failure.

`SupportStatus` now preserves PERMISSION_DENIED and REQUIRES_PRIVILEGED_MODE. Such capabilities are never readable or writable. Huawei records per-feature runtime outcome and a bounded metadata-only operation log. Initial supported read surfaces are PARTIAL with FIXTURE_VALIDATED evidence and PHYSICAL_VALIDATION_PENDING source; passing synthetic tests is not physical validation.

The `InfrastructureProvider` protocol describes the target neutral health surface; existing Junos implementations currently fulfill it through the application adapter, rather than renamed native methods. `BngProvider` describes the common focused subscriber contract. Advanced methods remain future work.
