"""Composition root for Access Manager application dependencies.

The module exposes compatibility attributes (``sessions``, ``queries``...) through
``__getattr__`` so existing presentation modules keep working while the real state
lives in one explicit :class:`ApplicationContext` instance.
"""

from __future__ import annotations

import atexit
from threading import RLock

from apps.access_manager.application.commands.device import DeviceCommandBus
from apps.access_manager.application.context import ApplicationContext
from apps.access_manager.application.infrastructure_sessions import InfrastructureSessions
from apps.access_manager.application.provider_registry import ProviderRegistry
from apps.access_manager.application.provider_router import ProviderRouter
from apps.access_manager.application.queries.device import DeviceQueryBus
from apps.access_manager.application.services.diagnostic_orchestrator import DiagnosticOrchestrator
from apps.access_manager.application.services.full_diagnostic import FullDiagnosticService
from apps.access_manager.application.services.mesh_port_forwarding import MeshPortForwardingService
from apps.access_manager.application.services.profiles import (
    AttendantProfileRepository,
    ProfileService,
)
from apps.access_manager.infrastructure.artifacts import ManagementArtifacts
from apps.access_manager.infrastructure.history import HistoryRepository
from apps.access_manager.infrastructure.huawei_bng.provider import HuaweiNetEngineBngProvider
from apps.access_manager.infrastructure.profiles import HuaweiProfileTranslator, ZTEProfileTranslator
from apps.access_manager.infrastructure.providers.deployment import DeploymentProvider
from apps.access_manager.infrastructure.providers.huawei import HuaweiProvider
from apps.access_manager.infrastructure.providers.juniper import JuniperProvider
from apps.access_manager.infrastructure.providers.zte import ZTEProvider
from apps.access_manager.runtime import data_dir

_CONTEXT: ApplicationContext | None = None
_CONTEXT_LOCK = RLock()
_COMPAT_NAMES = frozenset(ApplicationContext.__dataclass_fields__)


def build_context() -> ApplicationContext:
    """Build all stateful dependencies once, without hiding vendor selection logic."""
    history = HistoryRepository()

    device_providers = ProviderRegistry()
    huawei_provider = HuaweiProvider()
    device_providers.register("huawei", huawei_provider)
    device_providers.register("zte", ZTEProvider())
    device_providers.register("deployment", DeploymentProvider())

    infrastructure_providers = ProviderRegistry()
    infrastructure_providers.register("juniper", JuniperProvider())
    infrastructure_providers.register("huawei_bng", HuaweiNetEngineBngProvider())

    router = ProviderRouter(
        huawei_probe=HuaweiProvider.looks_like_huawei,
        huawei_models=HuaweiProvider.known_models(),
    )
    device_sessions = __import__(
        "apps.access_manager.application.session_manager",
        fromlist=["SessionManager"],
    ).SessionManager(router, device_providers, history=history)
    infrastructure_sessions = __import__(
        "apps.access_manager.application.session_manager",
        fromlist=["SessionManager"],
    ).SessionManager(router, infrastructure_providers)
    sessions = InfrastructureSessions(device_sessions, infrastructure_sessions)
    commands = DeviceCommandBus(sessions)
    queries = DeviceQueryBus(sessions)

    profiles = ProfileService(
        sessions=sessions,
        commands=commands,
        queries=queries,
        repository=AttendantProfileRepository(data_dir() / "profiles.json", sessions),
        translators={"huawei": HuaweiProfileTranslator(), "zte": ZTEProfileTranslator()},
    )
    artifacts = ManagementArtifacts(sessions, commands)
    full_diagnostics = FullDiagnosticService(sessions, queries, commands, history)
    mesh_port_forwarding = MeshPortForwardingService(sessions)
    diagnostic_orchestrator = DiagnosticOrchestrator(sessions)

    return ApplicationContext(
        history=history,
        device_sessions=device_sessions,
        infrastructure_sessions=infrastructure_sessions,
        sessions=sessions,
        commands=commands,
        queries=queries,
        profiles=profiles,
        artifacts=artifacts,
        full_diagnostics=full_diagnostics,
        mesh_port_forwarding=mesh_port_forwarding,
        diagnostic_orchestrator=diagnostic_orchestrator,
    )


def get_context() -> ApplicationContext:
    global _CONTEXT
    with _CONTEXT_LOCK:
        if _CONTEXT is None:
            _CONTEXT = build_context()
        return _CONTEXT


def close_context() -> None:
    global _CONTEXT
    with _CONTEXT_LOCK:
        context, _CONTEXT = _CONTEXT, None
    if context is not None:
        context.close()


def __getattr__(name: str):
    if name in _COMPAT_NAMES:
        return getattr(get_context(), name)
    raise AttributeError(name)


atexit.register(close_context)
