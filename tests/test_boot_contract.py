from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def test_vela_boot_contract_matches_legacy_usage():
    text=(ROOT/'config/wsgi.py').read_text(); assert 'VelaApp(' in text and 'register_app' in text and 'app.run()' in text
def test_static_and_template_exist():
    assert (ROOT/'apps/access_manager/templates/index.html').exists(); assert (ROOT/'apps/access_manager/static/css/tokens.css').exists(); assert (ROOT/'apps/access_manager/static/js/workspaces/app.js').exists(); assert (ROOT/'apps/access_manager/static/js/runtime.js').exists()

def test_template_uses_vela_static_helper_not_hardcoded_static_paths():
    template=(ROOT/'apps/access_manager/templates/index.html').read_text(encoding='utf-8')
    assert "{{ static('access_manager/css/tokens.css') }}" in template
    assert "{{ static('access_manager/css/app.css') }}" in template
    assert "{{ static('access_manager/js/runtime.js') }}" in template
    assert '/static/apps/access_manager/' not in template


def test_api_decorators_do_not_duplicate_vela_api_prefix():
    api_root=ROOT/'apps/access_manager/presentation/api'
    for path in api_root.glob('*.py'):
        source=path.read_text(encoding='utf-8')
        assert '@api.get("/api/' not in source
        assert '@api.post("/api/' not in source
        assert '@api.put("/api/' not in source
        assert '@api.delete("/api/' not in source


def test_template_uses_classic_runtime_and_exposes_https_selector():
    template=(ROOT/'apps/access_manager/templates/index.html').read_text(encoding='utf-8')
    assert "{{ static('access_manager/js/runtime.js') }}" in template
    assert 'name="https"' in template
    assert 'type="checkbox"' in template
    # Vela routes are HTML fragments; the shell owns the document element.
    assert '<!doctype html>' not in template.lower()
    assert '<html' not in template.lower()
    assert '<body' not in template.lower()


def test_runtime_has_no_dynamic_module_boot_and_owns_connect_submit():
    source=(ROOT/'apps/access_manager/static/js/runtime.js').read_text(encoding='utf-8').replace(chr(34), chr(39))
    assert 'import(' not in source
    assert "form.addEventListener('submit', connectFromForm)" in source
    assert "request('/api/session', { method: 'POST'" in source
    assert "name=\"https\"" in (ROOT/'apps/access_manager/templates/index.html').read_text(encoding='utf-8')
