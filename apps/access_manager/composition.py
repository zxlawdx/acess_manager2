from apps.access_manager.application.provider_router import ProviderRouter
from apps.access_manager.application.session_manager import SessionManager
from apps.access_manager.application.commands.device import DeviceCommandBus
from apps.access_manager.application.queries.device import DeviceQueryBus
from apps.access_manager.infrastructure.providers.huawei import HuaweiProvider
from apps.access_manager.infrastructure.providers.zte import ZTEProvider
from apps.access_manager.infrastructure.providers.deployment import DeploymentProvider
from apps.access_manager.application.services.profiles import AttendantProfileRepository, ProfileService
from apps.access_manager.infrastructure.profiles import HuaweiProfileTranslator, ZTEProfileTranslator
from apps.access_manager.runtime import data_dir
from apps.access_manager.infrastructure.history import HistoryRepository
history=HistoryRepository()

from apps.access_manager.infrastructure.providers.juniper import JuniperProvider
from apps.access_manager.infrastructure.huawei_bng.provider import HuaweiNetEngineBngProvider
juniper_provider=JuniperProvider()
huawei_bng_provider=HuaweiNetEngineBngProvider()
huawei_provider=HuaweiProvider(); zte_provider=ZTEProvider(); deployment_provider=DeploymentProvider()
router=ProviderRouter(huawei_probe=HuaweiProvider.looks_like_huawei,huawei_models=HuaweiProvider.known_models())
from apps.access_manager.application.infrastructure_sessions import InfrastructureSessions
device_sessions=SessionManager(router,{'huawei':huawei_provider,'zte':zte_provider,'deployment':deployment_provider},history=history)
infrastructure_sessions=SessionManager(router,{'juniper':juniper_provider,'huawei_bng':huawei_bng_provider})
sessions=InfrastructureSessions(device_sessions,infrastructure_sessions)
commands=DeviceCommandBus(sessions); queries=DeviceQueryBus(sessions)

profiles=ProfileService(
    sessions=sessions,
    commands=commands,
    queries=queries,
    repository=AttendantProfileRepository(data_dir()/"profiles.json", sessions),
    translators={"huawei": HuaweiProfileTranslator(), "zte": ZTEProfileTranslator()},
)

from apps.access_manager.infrastructure.artifacts import ManagementArtifacts
artifacts=ManagementArtifacts(sessions,commands)

from apps.access_manager.application.services.full_diagnostic import FullDiagnosticService
full_diagnostics=FullDiagnosticService(sessions,queries,commands,history)

from apps.access_manager.application.services.mesh_port_forwarding import MeshPortForwardingService
mesh_port_forwarding=MeshPortForwardingService(sessions)

from apps.access_manager.application.services.diagnostic_orchestrator import DiagnosticOrchestrator
diagnostic_orchestrator=DiagnosticOrchestrator(sessions)

import atexit
atexit.register(sessions.revoke_credential)
