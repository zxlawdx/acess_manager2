import apps.access_manager.infrastructure.youtube as youtube
from apps.access_manager.infrastructure.youtube import extract_youtube_results, extract_youtube_results_data


def test_extract_youtube_results_reads_video_renderers_without_network():
    page = 'var ytInitialData = ' + '{"contents":{"videoRenderer":{"videoId":"dQw4w9WgXcQ","title":{"runs":[{"text":"Teste"}]},"ownerText":{"runs":[{"text":"Canal"}]},"lengthText":{"simpleText":"3:32"},"thumbnail":{"thumbnails":[{"url":"https://i.ytimg.com/test.jpg"}]}}}};'
    assert extract_youtube_results(page) == [{'videoId': 'dQw4w9WgXcQ', 'title': 'Teste', 'channel': 'Canal', 'duration': '3:32', 'thumbnail': 'https://i.ytimg.com/test.jpg'}]


def test_extract_youtube_results_rejects_missing_or_invalid_ids():
    assert extract_youtube_results('no initial data here') == []
    assert extract_youtube_results('var ytInitialData = {"videoRenderer":{"videoId":"bad"}};') == []


def test_extract_youtube_results_data_reads_innertube_video_renderer():
    data = {
        'contents': {
            'twoColumnSearchResultsRenderer': {
                'primaryContents': {
                    'sectionListRenderer': {
                        'contents': [{
                            'itemSectionRenderer': {
                                'contents': [{
                                    'videoRenderer': {
                                        'videoId': 'dQw4w9WgXcQ',
                                        'title': {'runs': [{'text': 'Resultado InnerTube'}]},
                                        'shortBylineText': {'runs': [{'text': 'Canal Teste'}]},
                                        'lengthText': {'simpleText': '4:05'},
                                        'thumbnail': {'thumbnails': []},
                                    },
                                }],
                            },
                        }],
                    },
                },
            },
        },
    }
    assert extract_youtube_results_data(data) == [{
        'videoId': 'dQw4w9WgXcQ',
        'title': 'Resultado InnerTube',
        'channel': 'Canal Teste',
        'duration': '4:05',
        'thumbnail': 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    }]


def test_search_youtube_prefers_proxy_index_before_ytdlp(monkeypatch):
    calls = {}
    expected = [{
        'videoId': 'dQw4w9WgXcQ',
        'title': 'Criando jogos',
        'channel': 'Canal proxy',
        'duration': '10:05',
        'thumbnail': 'https://i.ytimg.com/test.jpg',
    }]

    class FakeCookies:
        def set(self, *args, **kwargs):
            calls['cookie'] = (args, kwargs)

    class FakeSession:
        def __init__(self):
            self.headers = {}
            self.cookies = FakeCookies()

        def close(self):
            calls['closed'] = True

    def proxy_search(session, query, limit):
        calls['proxy'] = (session, query, limit)
        return expected

    def forbidden_ytdlp(*args, **kwargs):
        raise AssertionError('yt-dlp must not run when proxy/index search succeeds')

    monkeypatch.setattr(youtube.requests, 'Session', FakeSession)
    monkeypatch.setattr(youtube, '_search_invidious', proxy_search)
    monkeypatch.setattr(youtube, '_search_ytdlp', forbidden_ytdlp)

    results = youtube.search_youtube('Criando jogos', limit=8)

    assert calls['proxy'][1:] == ('Criando jogos', 8)
    assert calls['closed'] is True
    assert results == expected


def test_search_youtube_falls_back_to_ytdlp_when_proxy_index_fails(monkeypatch):
    calls = {}

    class FakeCookies:
        def set(self, *args, **kwargs):
            calls['cookie'] = (args, kwargs)

    class FakeSession:
        def __init__(self):
            self.headers = {}
            self.cookies = FakeCookies()

        def close(self):
            calls['closed'] = True

    def fail_proxy(session, query, limit):
        calls['proxy'] = (query, limit)
        raise RuntimeError('proxy/index temporarily unavailable')

    def ytdlp_search(query, limit):
        calls['ytdlp'] = (query, limit)
        return [{
            'videoId': 'dQw4w9WgXcQ',
            'title': 'Criando jogos',
            'channel': 'Canal yt-dlp',
            'duration': '10:05',
            'thumbnail': 'https://i.ytimg.com/test.jpg',
        }]

    monkeypatch.setattr(youtube.requests, 'Session', FakeSession)
    monkeypatch.setattr(youtube, '_search_invidious', fail_proxy)
    monkeypatch.setattr(youtube, '_search_ytdlp', ytdlp_search)

    results = youtube.search_youtube('Criando jogos', limit=8)

    assert calls['proxy'] == ('Criando jogos', 8)
    assert calls['ytdlp'] == ('Criando jogos', 8)
    assert calls['closed'] is True
    assert results[0]['channel'] == 'Canal yt-dlp'


def test_search_youtube_falls_back_to_innertube_after_proxy_and_ytdlp_fail(monkeypatch):
    calls = {}

    def fail_proxy(session, query, limit):
        raise RuntimeError('proxy/index temporarily unavailable')

    def fail_ytdlp(query, limit):
        raise RuntimeError('yt-dlp temporarily unavailable')

    class FakeCookies:
        def set(self, *args, **kwargs):
            calls['cookie'] = (args, kwargs)

    class FakeResponse:
        text = ''

        def raise_for_status(self):
            return None

        def json(self):
            return {
                'contents': {
                    'videoRenderer': {
                        'videoId': 'dQw4w9WgXcQ',
                        'title': {'simpleText': 'Criando jogos'},
                        'ownerText': {'runs': [{'text': 'Canal'}]},
                        'lengthText': {'simpleText': '10:00'},
                    },
                },
            }

    class FakeSession:
        def __init__(self):
            self.headers = {}
            self.cookies = FakeCookies()

        def post(self, url, **kwargs):
            calls['post'] = (url, kwargs)
            return FakeResponse()

        def get(self, *args, **kwargs):
            raise AssertionError('HTML fallback must not run when InnerTube succeeds')

        def close(self):
            calls['closed'] = True

    monkeypatch.setattr(youtube, '_search_invidious', fail_proxy)
    monkeypatch.setattr(youtube, '_search_ytdlp', fail_ytdlp)
    monkeypatch.setattr(youtube.requests, 'Session', FakeSession)
    results = youtube.search_youtube('Criando jogos', limit=8)

    assert results[0]['videoId'] == 'dQw4w9WgXcQ'
    assert calls['post'][0].endswith('/youtubei/v1/search?prettyPrint=false')
    assert calls['post'][1]['json']['query'] == 'Criando jogos'
    assert calls['post'][1]['json']['params'] == youtube._VIDEO_SEARCH_PARAMS
    assert calls['closed'] is True
