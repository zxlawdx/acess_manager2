import os

APP_TITLE="Access Manager"
APP_VERSION=os.environ.get("ACCESS_MANAGER_VERSION", "0.0.0-dev")
APP_AUTHOR="zxlawdx"
APP_DESCRIPTION="Gerenciamento técnico multi-vendor de acesso e CPE"
ENTRY_ROUTE="/"
WINDOW_WIDTH=1480
WINDOW_HEIGHT=920
LAYOUT={"sidebar":False,"topbar":False,"theme":"light"}
DEBUG=False
API={"enabled":True,"host":"127.0.0.1","port":8765,"auto_port":True}
SHELL_MODE="http"
STATIC_ROOT="staticfiles"
