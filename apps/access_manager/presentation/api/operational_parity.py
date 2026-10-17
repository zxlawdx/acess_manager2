from __future__ import annotations

import json
from datetime import datetime, timezone

from apps.access_manager.presentation.api.common import api, body, queries, safe
from apps.access_manager.runtime import data_dir


@api.post("/device/diagnostics/wifi-neighbors")
def diagnostic_wifi_neighbors(context=None):
    """Return the same RF evidence used by the complete diagnostic.

    The service reads each radio once, uses only the firmware channel table and
    a confirmed neighbour scan, and therefore never invents a writable channel.
    """
    from apps.access_manager.application.services.wifi_environment import collect_environment

    def run():
        radios = queries.wifi_radios()
        return {
            "radios": radios,
            "wifi_environment": collect_environment(queries, radios),
        }

    return safe(run)


@api.post("/device/diagnostics/full/export-file")
def full_diagnostic_export_file(context=None):
    """Persist a diagnostic export where the desktop WebView can really save it.

    Blob/object-URL downloads are not reliable in every pywebview backend. The
    existing export service remains the source of the report; this endpoint only
    writes its validated payload to the Access Manager data directory.
    """
    from apps.access_manager.composition import full_diagnostics

    def run():
        request = dict(body(context) or {})
        fmt = str(request.get("format") or "json").strip().lower()
        if fmt not in {"json", "csv"}:
            raise ValueError("Formato de exportação inválido.")

        exported = full_diagnostics.export({**request, "format": fmt})
        history_id = int(request.get("id"))
        stamp = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
        filename = f"access-manager-diagnostic-{history_id}-{stamp}.{fmt}"
        directory = data_dir() / "exports"
        directory.mkdir(parents=True, exist_ok=True)
        target = directory / filename

        if fmt == "json":
            target.write_text(
                json.dumps(exported["data"], ensure_ascii=False, indent=2),
                encoding="utf-8",
            )
        else:
            target.write_text(str(exported["content"]), encoding="utf-8", newline="")

        return {
            "filename": filename,
            "format": fmt,
            "saved_path": str(target.resolve()),
        }

    return safe(run)
