# ADR 0001: one application-scoped context

## Status
Accepted.

## Context
Historically `composition.py` instantiated many providers, sessions and services as module globals. That made import order part of application behavior and made stateful provider lifetimes difficult to reason about.

## Decision
The composition root owns one lazy `ApplicationContext`. Construction is explicit in `build_context()`, access is through `get_context()`, and shutdown is centralized in `close_context()`.

Existing module-level names are retained temporarily through module `__getattr__` so this refactor can be incremental rather than a big-bang rewrite.

## Consequences
New code receives dependencies explicitly or accesses the application context at a presentation boundary. Stateful providers are created once and closed together. Compatibility aliases can be removed after presentation modules stop importing them directly.
