from __future__ import annotations

from apps.access_manager.infrastructure import youtube


class FakeResponse:
    def __init__(self, payload):
        self._payload = payload

    def raise_for_status(self):
        return None

    def json(self):
        return self._payload


class FakeSession:
    def __init__(self):
        self.calls = []

    def get(self, url, **kwargs):
        self.calls.append((url, kwargs))
        if url == youtube._INVIDIOUS_DIRECTORY:
            return FakeResponse([
                ['inv.example.test', {'api': True, 'uri': 'https://inv.example.test'}],
            ])
        if url == 'https://inv.example.test/api/v1/search':
            return FakeResponse([
                {
                    'type': 'video',
                    'title': 'Criando jogos no Blender',
                    'videoId': 'dQw4w9WgXcQ',
                    'author': 'Canal Teste',
                    'lengthSeconds': 125,
                    'videoThumbnails': [
                        {'url': '//i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg'},
                    ],
                },
            ])
        raise AssertionError(f'URL inesperada: {url}')


def test_invidious_search_normalizes_proxy_results():
    session = FakeSession()
    results = youtube._search_invidious(session, 'Criando jogos', 8)

    assert results == [
        {
            'videoId': 'dQw4w9WgXcQ',
            'title': 'Criando jogos no Blender',
            'channel': 'Canal Teste',
            'duration': '2:05',
            'thumbnail': 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
        }
    ]
    _, search_kwargs = session.calls[-1]
    assert search_kwargs['params']['type'] == 'video'
    assert search_kwargs['params']['region'] == 'BR'


def test_invidious_directory_ignores_instances_without_api():
    class DirectorySession:
        def get(self, url, **kwargs):
            assert url == youtube._INVIDIOUS_DIRECTORY
            return FakeResponse([
                ['disabled.test', {'api': False, 'uri': 'https://disabled.test'}],
                ['working.test', {'api': True, 'uri': 'https://working.test'}],
            ])

    instances = youtube._discover_invidious(DirectorySession())
    assert 'https://disabled.test' not in instances
    assert instances[0] == 'https://working.test'
