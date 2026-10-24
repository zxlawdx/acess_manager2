from __future__ import annotations

import ast
from pathlib import Path

from apps.access_manager.app import ACCESS_MANAGER_APP
from apps.access_manager.application.provider_registry import ProviderRegistry

ROOT = Path(__file__).resolve().parents[1]
APP = ROOT / "apps" / "access_manager"


def _imports(path: Path) -> set[str]:
    imports: set[str] = set()
    tree = ast.parse(path.read_text(encoding="utf-8"), filename=str(path))
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            imports.update(alias.name for alias in node.names)
        elif isinstance(node, ast.ImportFrom) and node.module:
            imports.add(node.module)
    return imports


def test_domain_does_not_depend_on_framework_or_webview():
    forbidden = ("vela", "bottle", "webview", "pywebview")
    offenders = []
    for path in (APP / "domain").rglob("*.py"):
        for imported in _imports(path):
            if imported.split(".", 1)[0] in forbidden:
                offenders.append(f"{path.relative_to(ROOT)} -> {imported}")
    assert offenders == []


def test_presentation_does_not_import_vendor_infrastructure():
    offenders = []
    for path in (APP / "presentation").rglob("*.py"):
        for imported in _imports(path):
            if imported.startswith(
                (
                    "apps.access_manager.infrastructure.huawei",
                    "apps.access_manager.infrastructure.zte",
                    "apps.access_manager.infrastructure.huawei_bng",
                    "apps.access_manager.infrastructure.providers.juniper",
                )
            ):
                offenders.append(f"{path.relative_to(ROOT)} -> {imported}")
    assert offenders == []


def test_vendors_do_not_import_each_other():
    huawei = "\n".join(
        path.read_text(encoding="utf-8")
        for path in (APP / "infrastructure" / "huawei").rglob("*.py")
    )
    zte = "\n".join(
        path.read_text(encoding="utf-8")
        for path in (APP / "infrastructure" / "zte").rglob("*.py")
    )
    assert "infrastructure.zte" not in huawei
    assert "infrastructure.huawei" not in zte


def test_app_definition_marks_stateful_layers_persistent():
    assert ACCESS_MANAGER_APP.module == "apps.access_manager"
    assert "apps.access_manager.infrastructure" in ACCESS_MANAGER_APP.persistent_modules
    assert "apps.access_manager.application" in ACCESS_MANAGER_APP.persistent_modules


def test_provider_registry_rejects_duplicate_vendor():
    registry = ProviderRegistry()
    provider = object()
    registry.register("huawei", provider)
    try:
        registry.register("HUAWEI", provider)
    except ValueError as exc:
        assert "already registered" in str(exc)
    else:
        raise AssertionError("duplicate provider registration must fail")


def test_no_legacy_global_write_or_lab_gate():
    forbidden = ("writes_enabled", "lab_enabled", "requires_lab", "experimental_enabled")
    text = "\n".join(path.read_text(encoding="utf-8") for path in APP.rglob("*.py"))
    assert all(word not in text for word in forbidden)
