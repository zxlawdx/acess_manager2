# Access Manager architecture

Access Manager follows the common Vela consumer layout without forcing every feature into a class.

```text
Vela runtime / HTTP / WebView
        |
Presentation (views, API, bridge)
        |
Application (commands, queries, services, sessions)
        |
Domain (models, capabilities, provider contracts)
        |
Infrastructure (Huawei/ZTE/Juniper/BNG adapters, persistence, transports)
```

## Composition root

`config/wsgi.py` creates the Vela runtime only. `apps/access_manager/composition.py` is the application composition root and owns one lazy `ApplicationContext`.

Stateful objects (device sessions, authenticated providers and infrastructure sessions) live in that context. Presentation code may still import historical names such as `sessions` from `composition`; those names are compatibility aliases resolved from the context and should not be used by new code.

## Boundaries

- `domain/` must not import Vela, Bottle or WebView.
- `presentation/` delegates to application services and must not import vendor protocol implementations.
- `infrastructure/` may depend on external libraries and domain/application contracts.
- provider selection is centralized by `ProviderRouter` + `ProviderRegistry`; vendor conditionals must not spread through UI code.
- credentials belong to the session/context lifecycle and must not be persisted in profiles.

## Naming

- `*_service.py`: application orchestration/use cases.
- `*_provider.py` or provider package: device/platform behavior.
- `*_client.py`: protocol transport.
- `*_parser.py`: raw response parsing.
- `*_repository.py`: application persistence.

## Tests

`tests/test_architecture.py` scans imports with Python AST and fails if the domain starts depending on Vela/WebView or presentation starts depending directly on vendor infrastructure.
