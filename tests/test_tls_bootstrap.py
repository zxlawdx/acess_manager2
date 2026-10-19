from __future__ import annotations

import sys
from types import SimpleNamespace

import config.tls as tls


def test_native_trust_store_is_injected_once(monkeypatch):
    calls = []
    monkeypatch.setitem(
        sys.modules,
        'truststore',
        SimpleNamespace(inject_into_ssl=lambda: calls.append('inject')),
    )
    monkeypatch.setattr(tls, '_injected', False)

    assert tls.enable_system_trust_store() is True
    assert tls.enable_system_trust_store() is True
    assert calls == ['inject']


def test_manage_bootstraps_tls_before_importing_vela():
    source = open('manage.py', encoding='utf-8').read()
    assert source.index('enable_system_trust_store()') < source.index('from vela.cli.commands import CommandRunner')


def test_frozen_launcher_bootstraps_tls_before_importing_vela():
    source = open('config/wsgi.py', encoding='utf-8').read()
    assert source.index('enable_system_trust_store()') < source.index('from vela.core.app import VelaApp')
