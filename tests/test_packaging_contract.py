from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]


def test_settings_expose_build_version_without_hardcoding_tag():
    text = (ROOT/'config'/'settings.py').read_text(encoding='utf-8')
    assert 'APP_TITLE="Access Manager"' in text
    assert 'ACCESS_MANAGER_VERSION' in text
    assert 'APP_VERSION=' in text


def test_release_uses_vela_native_builds_for_every_tag_and_self_tests():
    text = (ROOT/'.github'/'workflows'/'release.yml').read_text(encoding='utf-8')
    assert re.search(r"tags:\s*\n\s*- ['\"]\*['\"]", text)
    assert 'windows-latest' in text and 'ubuntu-24.04' in text
    assert text.count('python manage.py buildapp --gui qt6 --installer') >= 2
    assert text.count('python manage.py buildapp --dry-run') >= 3
    # Linux executes the frozen binary explicitly. On Windows, Vela buildapp
    # already performs the frozen self-test internally; running the GUI EXE a
    # second time in Actions caused the false-negative fixed by PR #23.
    assert text.count('--self-test') >= 1
    assert 'buildapp --gui qt6 --installer already performs the frozen runtime' in text
    assert 'Locate validated Windows bundle' in text
    assert '.vela-app.json' in text
    assert 'actions/upload-artifact@v4' in text
    assert 'actions/download-artifact@v4' in text
    assert 'sha256' in text.lower()
    assert 'gh release upload' in text and '--clobber' in text


def test_release_does_not_embed_operational_credentials_or_hardware_targets():
    text = (ROOT/'.github'/'workflows'/'release.yml').read_text(encoding='utf-8').lower()
    for forbidden in ('zerotier', 'pppoe_password', 'ssh_private_key', '192.168.100.', '10.200.'):
        assert forbidden not in text


def test_validate_workflow_keeps_existing_core_contract():
    text = (ROOT/'.github'/'workflows'/'validate.yml').read_text(encoding='utf-8')
    for required in (
        "python-version: '3.12'", "node-version: '24'", 'python tools/sync_frontend.py --check',
        'python -m pytest -q', 'npm test', 'node tests/visual/terminal-theme.cjs',
        'python manage.py collectstatic --no-tailwind',
    ):
        assert required in text


def test_runtime_data_is_outside_frozen_bundle():
    text=(ROOT/'apps'/'access_manager'/'runtime.py').read_text(encoding='utf-8')
    assert 'LOCALAPPDATA' in text
    assert '.local' in text and 'share' in text
    assert 'ACCESS_MANAGER_DATA_DIR' in text
