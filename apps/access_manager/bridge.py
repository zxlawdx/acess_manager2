from __future__ import annotations

import re
import threading
from urllib.parse import parse_qs, quote_plus, urlparse

from vela.core.bridge import BaseBridge

_VIDEO_ID = re.compile(r"^[A-Za-z0-9_-]{11}$")
_ALLOWED_YOUTUBE_HOSTS = {
    "youtube.com",
    "www.youtube.com",
    "m.youtube.com",
    "youtu.be",
    "www.youtube-nocookie.com",
}


def _youtube_reference(value: str):
    """Return a normalized YouTube selection or None for unrelated links."""
    raw = str(value or "").strip()
    if _VIDEO_ID.fullmatch(raw):
        return {"value": raw, "videoId": raw, "list": ""}
    try:
        parsed = urlparse(raw)
    except (TypeError, ValueError):
        return None
    host = (parsed.hostname or "").lower()
    if parsed.scheme != "https" or host not in _ALLOWED_YOUTUBE_HOSTS:
        return None
    parts = [part for part in parsed.path.split("/") if part]
    query = parse_qs(parsed.query)
    video_id = ""
    if host == "youtu.be" and parts:
        video_id = parts[0]
    elif parsed.path == "/watch":
        video_id = (query.get("v") or [""])[0]
    elif parts and parts[0] in {"shorts", "live", "embed"} and len(parts) > 1:
        video_id = parts[1]
    playlist = (query.get("list") or [""])[0]
    if video_id and not _VIDEO_ID.fullmatch(video_id):
        return None
    if not video_id and not playlist:
        return None
    return {"value": raw, "videoId": video_id, "list": playlist}


class _YouTubeSearchBridge:
    """Bridge exposed only to the secondary YouTube search window."""

    def __init__(self, owner):
        self.owner = owner
        self.window = None

    def select_video(self, value: str):
        selected = _youtube_reference(value)
        if not selected or not selected.get("videoId"):
            return {"ok": False, "error": "O link selecionado não é um vídeo do YouTube."}

        # Return to JavaScript before closing the window that originated this
        # bridge call. Emitting from a worker also avoids blocking Qt's bridge
        # thread while the main Access Manager window receives the event.
        def deliver():
            try:
                self.owner.emit("youtube:selected", selected)
            finally:
                window = self.window
                if window is not None:
                    try:
                        window.destroy()
                    except Exception:
                        pass

        threading.Thread(target=deliver, daemon=True).start()
        return {"ok": True, **selected}


class AccessManagerBridge(BaseBridge):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._youtube_search_window = None
        self._youtube_search_bridge = None

    def _reload_app_modules(self):
        return

    def _install_youtube_picker(self, window):
        """Intercept clicks on real YouTube video links before they play here."""
        script = r"""
(() => {
  if (window.__accessManagerYouTubePickerInstalled) return true;
  window.__accessManagerYouTubePickerInstalled = true;
  const videoHref = (target) => {
    const anchor = target?.closest?.('a[href]');
    if (!anchor) return null;
    let url;
    try { url = new URL(anchor.href, location.href); } catch { return null; }
    const host = url.hostname.toLowerCase();
    if (!['youtube.com','www.youtube.com','m.youtube.com','youtu.be','www.youtube-nocookie.com'].includes(host)) return null;
    const parts = url.pathname.split('/').filter(Boolean);
    const video = host === 'youtu.be'
      ? parts[0]
      : url.pathname === '/watch'
        ? url.searchParams.get('v')
        : ['shorts','live','embed'].includes(parts[0])
          ? parts[1]
          : null;
    return /^[A-Za-z0-9_-]{11}$/.test(video || '') ? url.href : null;
  };
  document.addEventListener('click', async (event) => {
    const href = videoHref(event.target);
    if (!href) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    try {
      await window.pywebview.api.select_video(href);
    } catch (error) {
      console.error('Access Manager YouTube picker:', error);
    }
  }, true);
  return true;
})();
"""
        try:
            window.evaluate_js(script)
        except Exception as exc:
            self.logger.warning(f"Não foi possível instalar seletor do YouTube: {exc}")

    def open_youtube_search(self, query: str):
        """Open YouTube's real search UI in a secondary native WebView.

        The backend search endpoints remain as browser/headless fallbacks. In
        the desktop build this path deliberately uses QtWebEngine's own network
        stack, which is also the stack already capable of loading YouTube video
        playback in Access Manager.
        """
        query = str(query or "").strip()
        if len(query) < 2:
            return {"ok": False, "error": "Digite pelo menos 2 caracteres para pesquisar no YouTube."}
        try:
            import webview
        except Exception as exc:
            return {"ok": False, "error": f"WebView nativa indisponível: {exc}"}

        search_url = "https://www.youtube.com/results?search_query=" + quote_plus(query)

        # Reuse an existing search window when possible.
        window = self._youtube_search_window
        if window is not None:
            try:
                window.load_url(search_url)
                window.show()
                return {"ok": True, "mode": "native-youtube", "url": search_url}
            except Exception:
                self._youtube_search_window = None
                self._youtube_search_bridge = None

        try:
            picker = _YouTubeSearchBridge(self)
            window = webview.create_window(
                "YouTube — Access Manager",
                url=search_url,
                width=1180,
                height=760,
                js_api=picker,
                resizable=True,
                frameless=False,
                easy_drag=False,
            )
            picker.window = window
            self._youtube_search_window = window
            self._youtube_search_bridge = picker

            def loaded():
                self._install_youtube_picker(window)

            def closed():
                if self._youtube_search_window is window:
                    self._youtube_search_window = None
                    self._youtube_search_bridge = None

            window.events.loaded += loaded
            window.events.closed += closed
            return {"ok": True, "mode": "native-youtube", "url": search_url}
        except Exception as exc:
            self.logger.warning(f"Falha ao abrir busca nativa do YouTube: {exc}")
            return {"ok": False, "error": "Não foi possível abrir a busca real do YouTube nesta janela."}
