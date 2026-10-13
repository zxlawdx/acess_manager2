from vela.core.app import VelaApp
from apps.access_manager.bridge import AccessManagerBridge
INSTALLED_APPS=["apps.access_manager"]
def run():
    app=VelaApp(settings_module="config.settings",bridge_class=AccessManagerBridge)
    for app_name in INSTALLED_APPS: app.register_app(app_name)
    app.run()
