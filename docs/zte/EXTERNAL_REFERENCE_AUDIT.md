# External reference audit

| Repository / revision | Files reviewed | Idea used | Code copied? | License / ownership |
|---|---|---|---|---|
| juacas/zte_tracker / f1911857e2dc2b5da8dc5b891d4ffd67d6e5c832 | zteclient/zte_client.py | Profile families, optional readers, JSON protocol shape | No; independent implementation | GPL-3.0 reference only |
| Same | support_bundle.py, support_shape.py | Bounded structural discovery, scores/ties, no values | No | GPL-3.0 reference only |
| Same | coordinator.py, diagnostics.py, const.py | Session reuse, failure isolation, redaction policy | No | GPL-3.0 reference only |
| Same | README.md, CHANGELOG.md, tests/test_support_bundle.py | Documented dialects and failure cases | No | GPL-3.0 reference only |
| zxlawdx/acess_manager / 1623bce8717b9b92683cd3904f9c2bd378da400c | model/zte.py; zte_configuration/{zte_wlan_channel_configuration,zte_support_diagnostics,zte_clients,zte_connection_status,zte_wifi,zte_lan,zte_dns,zte_wan_config,zte_diagnostics}.py | Canonical input/output, fields, tags, builders and validation | Existing project protocol retained; channel behavior adapted | User's canonical project |
| Same | services/{profile_service,automatic_diagnostic_service,support_diagnostic_service,zte_service,capability_service}.py; model/device_adapters/thinklua.py | Profile semantics, diagnostics, channel strategy, capability boundaries | ChannelAnalyzer ported from canonical project | User's canonical project |
| zxlawdx/acess_manager2 / d0c795d baseline | provider, discovery, query/command, full diagnostic/profile services, contracts and views | Integration boundary and regression baseline | Existing working tree continued | Current project |

The requested tests/test_zte_client.py URL returned HTTP 404 at the pinned revision. Client behavior was reviewed in zte_client.py and the available 30 KB support-bundle test suite. This is a source-file availability gap, not evidence of device incompatibility.

Reference links: https://github.com/juacas/zte_tracker/tree/f1911857e2dc2b5da8dc5b891d4ffd67d6e5c832 and https://github.com/zxlawdx/acess_manager/tree/1623bce8717b9b92683cd3904f9c2bd378da400c . No real P1_MUL request payload, credentials or private client data was available or exported.
