from __future__ import annotations

import sys
from types import SimpleNamespace
from urllib.parse import parse_qs, urlparse

from apps.access_manager.bridge import AccessManagerBridge, _youtube_reference


def test_youtube_reference_accepts_real_video_links_and_rejects_other_hosts():
    watch = _youtube_reference('https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PL123456789012')
    assert watch['videoId'] == 'dQw4w9WgXcQ'
    assert watch['list'] == 'PL123456789012'
    assert _youtube_reference('https://youtu.be/dQw4w9WgXcQ')['videoId'] == 'dQw4w9WgXcQ'
    assert _youtube_reference('https://www.youtube.com/shorts/dQw4w9WgXcQ')['videoId'] == 'dQw4w9WgXcQ'
    assert _youtube_reference('https://youtube.com.evil.test/watch?v=dQw4w9WgXcQ') is None
    assert _youtube_reference('javascript:alert(1)') is None


def test_open_youtube_search_uses_real_youtube_page_in_secondary_webview(monkeypatch):
    created = {}

    class Hook:
        def __init__(self):
            self.handlers = []

        def __iadd__(self, handler):
            self.handlers.append(handler)
            return self

    class FakeWindow:
        def __init__(self):
            self.events = SimpleNamespace(loaded=Hook(), closed=Hook())
            self.loaded = []
            self.shown = False

        def load_url(self, url):
            self.loaded.append(url)

        def show(self):
            self.shown = True

        def evaluate_js(self, code):
            return True

    def create_window(title, url=None, **kwargs):
        created.update(title=title, url=url, kwargs=kwargs)
        window = FakeWindow()
        created['window'] = window
        return window

    monkeypatch.setitem(sys.modules, 'webview', SimpleNamespace(create_window=create_window))

    bridge = AccessManagerBridge()
    result = bridge.open_youtube_search('Criando jogos')

    assert result['ok'] is True
    assert result['mode'] == 'native-youtube'
    parsed = urlparse(created['url'])
    assert parsed.scheme == 'https'
    assert parsed.netloc == 'www.youtube.com'
    assert parsed.path == '/results'
    assert parse_qs(parsed.query)['search_query'] == ['Criando jogos']
    assert created['kwargs']['js_api'] is bridge._youtube_search_bridge
    assert created['window'].events.loaded.handlers
    assert created['window'].events.closed.handlers

    reused = bridge.open_youtube_search('python blender')
    assert reused['ok'] is True
    assert created['window'].shown is True
    assert parse_qs(urlparse(created['window'].loaded[-1]).query)['search_query'] == ['python blender']
