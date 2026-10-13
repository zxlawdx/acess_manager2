from __future__ import annotations
import os, sys
from pathlib import Path

def project_root() -> Path:
    return Path(__file__).resolve().parents[2]

def data_dir() -> Path:
    custom = os.getenv("ACCESS_MANAGER_DATA_DIR")
    if custom:
        path = Path(custom).expanduser()
    elif getattr(sys, "frozen", False):
        base = Path(os.getenv("LOCALAPPDATA", Path.home())) if sys.platform == "win32" else Path.home()/".local"/"share"
        path = base / "access-manager"
    else:
        path = project_root()/"data"
    path.mkdir(parents=True, exist_ok=True)
    return path
