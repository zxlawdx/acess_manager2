from __future__ import annotations

from .common import api, body


@api.post('/media/youtube/search')
def youtube_search(context=None):
    from apps.access_manager.infrastructure.youtube import search_youtube
    query = str(body(context).get('query') or '').strip()
    if len(query) < 2:
        return {'success': False, 'error': {'code': 'INVALID_QUERY', 'message': 'Digite pelo menos 2 caracteres para pesquisar no YouTube.', 'type': 'validation', 'retryable': False}}
    try:
        return {'success': True, 'results': search_youtube(query, limit=8)}
    except Exception:
        return {'success': False, 'error': {'code': 'YOUTUBE_SEARCH_UNAVAILABLE', 'message': 'Não foi possível pesquisar no YouTube agora. Verifique a internet ou cole a URL de um vídeo.', 'type': 'media', 'retryable': True}}
