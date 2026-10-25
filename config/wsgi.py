from config.tls import enable_system_trust_store

enable_system_trust_store()

from vela.core.app import VelaApp

from apps.access_manager.app import ACCESS_MANAGER_APP
from apps.access_manager.bridge import AccessManagerBridge
from apps.access_manager.composition import close_context


def create_app() -> VelaApp:
    """Build the Vela runtime; business dependencies live in the app composition root."""
    app = VelaApp(settings_module="config.settings", bridge_class=AccessManagerBridge)
    app.register_app(ACCESS_MANAGER_APP.module)
    return app


def run() -> None:
    app = create_app()
    try:
        app.run()
    finally:
        close_context()
