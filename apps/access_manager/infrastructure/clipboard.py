from __future__ import annotations

import time
from typing import Any

try:
    import pyperclip
except Exception:  # pragma: no cover - import failure handled at runtime
    pyperclip = None  # type: ignore


class ClipboardError(RuntimeError):
    pass


MAX_CLIPBOARD_CHARS = 2_000_000
_CLIPBOARD_RETRY_DELAYS = (0.0, 0.03, 0.08, 0.15)


def copy_text(value: Any) -> None:
    """Copy text through the desktop backend instead of QtWebEngine Clipboard API.

    QtWebEngine clipboard ownership has produced native crashes in packaged
    Windows builds on some machines. Keep clipboard ownership in Python and
    retry briefly because the Win32 clipboard may be locked momentarily by
    another process.
    """
    text = "" if value is None else str(value)
    if not text:
        raise ClipboardError("Texto vazio.")
    if len(text) > MAX_CLIPBOARD_CHARS:
        raise ClipboardError("Texto grande demais para copiar com segurança.")
    if pyperclip is None:
        raise ClipboardError("Backend de clipboard indisponível.")

    last_error: Exception | None = None
    for delay in _CLIPBOARD_RETRY_DELAYS:
        if delay:
            time.sleep(delay)
        try:
            pyperclip.copy(text)
            return
        except Exception as exc:  # Windows clipboard can be transiently busy
            last_error = exc

    raise ClipboardError(
        f"Não foi possível copiar para a área de transferência: {last_error}"
    ) from last_error
