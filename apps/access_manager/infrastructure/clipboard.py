from __future__ import annotations

from typing import Any

try:
    import pyperclip
except Exception:  # pragma: no cover - import failure handled at runtime
    pyperclip = None  # type: ignore


class ClipboardError(RuntimeError):
    pass


MAX_CLIPBOARD_CHARS = 2_000_000


def copy_text(value: Any) -> None:
    """Copy text through the desktop backend instead of QtWebEngine Clipboard API.

    The packaged Qt/WebEngine build has shown native crashes when
    navigator.clipboard.writeText() is triggered from some Juniper tables.
    AtendeClip already uses pyperclip successfully in the same desktop context,
    so Access Manager keeps clipboard ownership in Python as well.
    """
    text = "" if value is None else str(value)
    if not text:
        raise ClipboardError("Texto vazio.")
    if len(text) > MAX_CLIPBOARD_CHARS:
        raise ClipboardError("Texto grande demais para copiar com segurança.")
    if pyperclip is None:
        raise ClipboardError("Backend de clipboard indisponível.")

    try:
        pyperclip.copy(text)
    except Exception as exc:
        raise ClipboardError(f"Não foi possível copiar para a área de transferência: {exc}") from exc
