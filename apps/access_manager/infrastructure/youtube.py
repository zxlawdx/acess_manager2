from __future__ import annotations

import json
import re
from urllib.parse import quote_plus

import requests

_ASSIGNMENT = re.compile(r'(?:var\s+ytInitialData|ytInitialData|window\["ytInitialData"\])\s*=\s*')
_VIDEO_ID = re.compile(r'^[A-Za-z0-9_-]{11}$')


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
    return {'videoId': video_id, 'title': _text(renderer.get('title')) or 'Vídeo do YouTube', 'channel': _text(renderer.get('ownerText')) or _text(renderer.get('shortBylineText')), 'duration': _text(renderer.get('lengthText')), 'thumbnail': thumbnail}


def extract_youtube_results(page: str, limit: int = 8):
    match = _ASSIGNMENT.search(page or '')
    if not match:
        return []
    try:
        data, _ = json.JSONDecoder().raw_decode(page[match.end():])
    except (TypeError, ValueError, json.JSONDecodeError):
        return []
    results, seen = [], set()
    stack = [data]
    while stack and len(results) < max(1, min(int(limit), 20)):
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


def search_youtube(query: str, limit: int = 8):
    query = str(query or '').strip()
    if len(query) < 2:
        raise ValueError('Digite pelo menos 2 caracteres para pesquisar no YouTube.')
    response = requests.get('https://www.youtube.com/results?search_query=' + quote_plus(query) + '&hl=pt-BR', timeout=(3.5, 8), headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/155 Safari/537.36', 'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.7'})
    response.raise_for_status()
    return extract_youtube_results(response.text, limit=limit)
