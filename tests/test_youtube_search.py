from apps.access_manager.infrastructure.youtube import extract_youtube_results


def test_extract_youtube_results_reads_video_renderers_without_network():
    page = 'var ytInitialData = ' + '{"contents":{"videoRenderer":{"videoId":"dQw4w9WgXcQ","title":{"runs":[{"text":"Teste"}]},"ownerText":{"runs":[{"text":"Canal"}]},"lengthText":{"simpleText":"3:32"},"thumbnail":{"thumbnails":[{"url":"https://i.ytimg.com/test.jpg"}]}}}};'
    assert extract_youtube_results(page) == [{'videoId': 'dQw4w9WgXcQ', 'title': 'Teste', 'channel': 'Canal', 'duration': '3:32', 'thumbnail': 'https://i.ytimg.com/test.jpg'}]


def test_extract_youtube_results_rejects_missing_or_invalid_ids():
    assert extract_youtube_results('no initial data here') == []
    assert extract_youtube_results('var ytInitialData = {"videoRenderer":{"videoId":"bad"}};') == []
