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


def test_search_youtube_prefers_innertube_without_touching_html(monkeypatch):
    calls = {}

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

    monkeypatch.setattr(youtube.requests, 'Session', FakeSession)
    results = youtube.search_youtube('Criando jogos', limit=8)

    assert results[0]['videoId'] == 'dQw4w9WgXcQ'
    assert calls['post'][0].endswith('/youtubei/v1/search?prettyPrint=false')
    assert calls['post'][1]['json']['query'] == 'Criando jogos'
    assert calls['post'][1]['json']['params'] == youtube._VIDEO_SEARCH_PARAMS
    assert calls['post'][1]['headers']['X-YouTube-Client-Name'] == '1'
    assert calls['closed'] is True
