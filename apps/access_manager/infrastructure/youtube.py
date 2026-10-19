from __future__ import annotations

import json
import re
from urllib.parse import quote_plus

import requests

_ASSIGNMENT = re.compile(r'(?:var\s+ytInitialData|ytInitialData|window\["ytInitialData"\])\s*=\s*')
_VIDEO_ID = re.compile(r'^[A-Za-z0-9_-]{11}$')
_WEB_CLIENT_VERSION = '2.20260708.00.00'
_VIDEO_SEARCH_PARAMS = 'EgIQAfABAQ=='
_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/155 Safari/537.36'


def _text(node):
    if not isinstance(node, dict):
        return ''
    if isinstance(node.get('simpleText'), str):
        return node['simpleText']
    return ''.join(str(run.get('text', '')) for run in node.get('runs', []) if isinstance(run, dict))


def _video(renderer):
    video_id = str(renderer.get('videoId') or '')
    if not _VIDEO_ID.fullmatch(video_id):
        return None
    thumbs = ((renderer.get('thumbnail') or {}).get('thumbnails') or [])
    thumbnail = next((str(item.get('url')) for item in reversed(thumbs) if isinstance(item, dict) and item.get('url')), '')
    if not thumbnail:
        thumbnail = f'https://i.ytimg.com/vi/{video_id}/hqdefault.jpg'
    return {
        'videoId': video_id,
        'title': _text(renderer.get('title')) or 'Vídeo do YouTube',
        'channel': _text(renderer.get('ownerText')) or _text(renderer.get('shortBylineText')) or _text(renderer.get('longBylineText')),
        'duration': _text(renderer.get('lengthText')),
        'thumbnail': thumbnail,
    }


def extract_youtube_results_data(data, limit: int = 8):
    results, seen = [], set()
    stack = [data]
    cap = max(1, min(int(limit), 20))
    while stack and len(results) < cap:
        current = stack.pop()
        if isinstance(current, dict):
            renderer = current.get('videoRenderer')
            if isinstance(renderer, dict):
                item = _video(renderer)
                if item and item['videoId'] not in seen:
                    seen.add(item['videoId'])
                    results.append(item)
            stack.extend(reversed(list(current.values())))
        elif isinstance(current, list):
            stack.extend(reversed(current))
    return results


def extract_youtube_results(page: str, limit: int = 8):
    match = _ASSIGNMENT.search(page or '')
    if not match:
        return []
    try:
        data, _ = json.JSONDecoder().raw_decode(page[match.end():])
    except (TypeError, ValueError, json.JSONDecodeError):
        return []
    return extract_youtube_results_data(data, limit=limit)


def _configure_session(session):
    session.headers.update({
        'User-Agent': _USER_AGENT,
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.7',
    })
    # Avoid the consent interstitial when the fallback HTML endpoint is used.
    try:
        session.cookies.set('SOCS', 'CAI', domain='.youtube.com', secure=True)
    except Exception:
        pass
    return session


def _search_innertube(session, query: str, limit: int):
    payload = {
        'context': {
            'client': {
                'clientName': 'WEB',
                'clientVersion': _WEB_CLIENT_VERSION,
                'hl': 'pt-BR',
                'gl': 'BR',
            },
        },
        'query': query,
        # Same videos-only filter used by mature YouTube clients such as yt-dlp.
        'params': _VIDEO_SEARCH_PARAMS,
    }
    response = session.post(
        'https://www.youtube.com/youtubei/v1/search?prettyPrint=false',
        json=payload,
        timeout=(3.5, 8),
        headers={
            'Content-Type': 'application/json',
            'Origin': 'https://www.youtube.com',
            'Referer': 'https://www.youtube.com/',
            'X-YouTube-Client-Name': '1',
            'X-YouTube-Client-Version': _WEB_CLIENT_VERSION,
        },
    )
    response.raise_for_status()
    data = response.json()
    results = extract_youtube_results_data(data, limit=limit)
    if not results:
        raise ValueError('A resposta do YouTube não trouxe vídeos pesquisáveis.')
    return results


def _search_html(session, query: str, limit: int):
    response = session.get(
        'https://www.youtube.com/results?search_query=' + quote_plus(query) + '&hl=pt-BR&sp=' + quote_plus(_VIDEO_SEARCH_PARAMS),
        timeout=(3.5, 8),
    )
    response.raise_for_status()
    results = extract_youtube_results(response.text, limit=limit)
    if not results:
        raise ValueError('A página de busca do YouTube não trouxe vídeos pesquisáveis.')
    return results


def search_youtube(query: str, limit: int = 8):
    query = str(query or '').strip()
    if len(query) < 2:
        raise ValueError('Digite pelo menos 2 caracteres para pesquisar no YouTube.')

    session = _configure_session(requests.Session())
    errors = []
    try:
        # The old implementation scraped only /results HTML. That endpoint is
        # frequently consented, throttled or served without ytInitialData in
        # embedded/desktop runtimes. Use YouTube's own InnerTube search first,
        # then keep the HTML path only as a compatibility fallback.
        for strategy in (_search_innertube, _search_html):
            try:
                return strategy(session, query, limit)
            except (requests.RequestException, ValueError, TypeError, json.JSONDecodeError) as exc:
                errors.append(exc)
    finally:
        try:
            session.close()
        except Exception:
            pass

    if errors:
        raise RuntimeError('Não foi possível consultar a pesquisa do YouTube.') from errors[-1]
    return []
