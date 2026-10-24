from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class AppDefinition:
    """Metadata owned by the consumer app, ready for Vela AppConfig migration."""

    name: str
    module: str
    api_module: str
    routes_module: str
    static_dirs: tuple[str, ...] = ()
    reloadable_modules: tuple[str, ...] = ()
    persistent_modules: tuple[str, ...] = ()


ACCESS_MANAGER_APP = AppDefinition(
    name="access_manager",
    module="apps.access_manager",
    api_module="apps.access_manager.api",
    routes_module="apps.access_manager.urls",
    static_dirs=("apps/access_manager/static",),
    reloadable_modules=(
        "apps.access_manager.views",
        "apps.access_manager.presentation",
    ),
    persistent_modules=(
        "apps.access_manager.application",
        "apps.access_manager.domain",
        "apps.access_manager.infrastructure",
        "apps.access_manager.composition",
    ),
)
