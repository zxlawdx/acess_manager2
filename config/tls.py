from __future__ import annotations

import logging

_logger = logging.getLogger("access_manager.tls")
_injected = False


def enable_system_trust_store() -> bool:
    """Make Python HTTPS clients trust the operating system CA store.

    On Windows this uses CryptoAPI through ``truststore``. This matters on
    managed/corporate networks where HTTPS inspection is trusted by Windows
    and the embedded Qt browser, but Python's bundled/certifi CA set does not
    know the local root certificate.

    This is an application bootstrap hook, so using truststore's global
    injection is intentional. It must run before requests/urllib3/yt-dlp are
    imported so their SSL contexts inherit the native trust store.
    """
    global _injected
    if _injected:
        return True
    try:
        import truststore

        truststore.inject_into_ssl()
        _injected = True
        return True
    except Exception as exc:  # pragma: no cover - defensive startup fallback
        _logger.warning("Native TLS trust store unavailable: %s", exc)
        return False
