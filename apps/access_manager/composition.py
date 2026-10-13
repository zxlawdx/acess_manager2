from apps.access_manager.application.provider_router import ProviderRouter
from apps.access_manager.application.session_manager import SessionManager
from apps.access_manager.application.commands.device import DeviceCommandBus
from apps.access_manager.application.queries.device import DeviceQueryBus
from apps.access_manager.infrastructure.providers.huawei import HuaweiProvider
from apps.access_manager.infrastructure.providers.zte import ZTEProvider
from apps.access_manager.infrastructure.providers.deployment import DeploymentProvider
from apps.access_manager.application.services.profiles import JsonProfileRepository, ProfileService
from apps.access_manager.infrastructure.profiles import HuaweiProfileTranslator, ZTEProfileTranslator
from apps.access_manager.runtime import data_dir
from apps.access_manager.infrastructure.history import HistoryRepository
history=HistoryRepository()

huawei_provider=HuaweiProvider(); zte_provider=ZTEProvider(); deployment_provider=DeploymentProvider()
router=ProviderRouter(huawei_probe=HuaweiProvider.looks_like_huawei,huawei_models=HuaweiProvider.known_models())
sessions=SessionManager(router,{'huawei':huawei_provider,'zte':zte_provider,'deployment':deployment_provider},history=history)
commands=DeviceCommandBus(sessions); queries=DeviceQueryBus(sessions)

profiles=ProfileService(
    sessions=sessions,
    commands=commands,
    queries=queries,
    repository=JsonProfileRepository(data_dir()/"profiles.json"),
    translators={"huawei": HuaweiProfileTranslator(), "zte": ZTEProfileTranslator()},
)
