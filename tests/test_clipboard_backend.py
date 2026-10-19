from types import SimpleNamespace

import pytest

from apps.access_manager.infrastructure import clipboard


def test_clipboard_backend_delegates_to_pyperclip(monkeypatch):
    copied = []
    monkeypatch.setattr(clipboard, 'pyperclip', SimpleNamespace(copy=copied.append))
    clipboard.copy_text('192.0.2.10')
    assert copied == ['192.0.2.10']


def test_clipboard_backend_rejects_empty_text(monkeypatch):
    monkeypatch.setattr(clipboard, 'pyperclip', SimpleNamespace(copy=lambda value: None))
    with pytest.raises(clipboard.ClipboardError, match='Texto vazio'):
        clipboard.copy_text('')


def test_clipboard_backend_wraps_provider_errors(monkeypatch):
    def fail(_value):
        raise RuntimeError('locked')
    monkeypatch.setattr(clipboard, 'pyperclip', SimpleNamespace(copy=fail))
    with pytest.raises(clipboard.ClipboardError, match='área de transferência'):
        clipboard.copy_text('test')
