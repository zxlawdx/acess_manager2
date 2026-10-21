from __future__ import annotations
from threading import RLock
import logging
from urllib.parse import urlsplit
from apps.access_manager.domain.models import DeviceSession, SessionMode, Vendor

logger = logging.getLogger(__name__)

class SessionManager:
    def __init__(self, router, providers: dict[str, object], history=None):
        self.router, self.providers = router, providers
        self.history = history
        self._history_session = None
        self._provider = None
        self._session = None
        self._lock = RLock()
    @property
    def operation_lock(self): return self._lock
    @property
    def session(self): return self._session
    @property
    def provider(self):
        if self._provider is None: raise RuntimeError('No active device session')
        return self._provider
    @staticmethod
    def _normalize_target(host, https=False):
        raw=str(host or '').strip().rstrip('/')
        if not raw:
            raise ValueError('host is required')
        if '://' in raw:
            parsed=urlsplit(raw)
            if parsed.scheme.lower() not in {'http','https'} or not parsed.hostname:
                raise ValueError('host must use HTTP or HTTPS')
            https = parsed.scheme.lower() == 'https'
            hostname = parsed.hostname
            if ':' in hostname and not hostname.startswith('['):
                hostname=f'[{hostname}]'
            raw = hostname + (f':{parsed.port}' if parsed.port is not None else '')
        return raw, bool(https)

    def connect(self, host, username, password, *, https=False, model_hint=None, attendant=None, vendor=None, **kwargs):
        with self._lock:
            self.disconnect()
            if vendor in {'juniper','huawei_bng'}:
                host=str(host or '').strip()
                from apps.access_manager.application.provider_router import ProviderDecision
                decision=ProviderDecision(vendor,'explicit_infrastructure_selection')
            else:
                host, https = self._normalize_target(host, https=https)
                if vendor in {'huawei','zte'}:
                    from apps.access_manager.application.provider_router import ProviderDecision
                    decision=ProviderDecision(vendor,'explicit_cpe_selection')
                else:
                    decision=self.router.decide(host,model_hint=model_hint,https=https)
            logger.info(
                "device_connect_requested host=%s transport=%s model_hint=%s",
                host, kwargs.get("transport","ssh") if vendor in {"juniper","huawei_bng"} else "https" if https else "http", bool(model_hint),
            )
            logger.info("provider_selected vendor=%s reason=%s", decision.vendor, decision.reason)
            provider=self.providers[decision.vendor]
            try:
                result=provider.connect(host, username, password, https=https, model_hint=model_hint, **kwargs)
            except Exception as exc:
                logger.warning(
                    "device_connect_failed vendor=%s exception=%s code=%s stage=%s",
                    decision.vendor, type(exc).__name__, getattr(exc,"code",None), getattr(exc,"stage",None),
                )
                raise
            caps=provider.capabilities.public()
            requested_mode=str(result.get('mode') or '').lower()
            if requested_mode in {item.value for item in SessionMode}:
                mode=SessionMode(requested_mode)
            else:
                mode = SessionMode.SUPPORTED if any(v['read']=='SUPPORTED' or v['write']=='SUPPORTED' for v in caps.values()) else SessionMode.PARTIAL
            vendor=Vendor(decision.vendor)
            self._provider=provider
            self._session=DeviceSession(vendor=vendor,host=(getattr(provider,'host',host) if decision.vendor in {'juniper','huawei_bng'} else host),provider=type(provider).__name__,model=result.get('model'),firmware=result.get('firmware'),protocol_family=result.get('protocol_family'),mode=mode,attendant=attendant,capabilities=caps,metadata={'route_reason': decision.reason,'scheme':'https' if https else 'http','https':bool(https)})
            if self.history is not None:
                try:
                    self._history_session = self.history.start_session(host=host, attendant=attendant, device={'modelo': self._session.model, 'firmware': self._session.firmware})
                except Exception:
                    logger.exception('Could not persist session history')
            logger.info("device_connect_succeeded vendor=%s model=%s mode=%s", decision.vendor, self._session.model or 'unknown', mode.value)
            return self.status()
    def disconnect(self):
        with self._lock:
            if self.history is not None and self._history_session:
                try: self.history.end_session(self._history_session)
                except Exception: logger.exception('Could not close session history')
                self._history_session = None
            if self._provider is not None:
                try: self._provider.disconnect()
                finally: self._provider=None; self._session=None
    def status(self):
        if self._session is not None and self._provider is not None:
            self._session.capabilities=self._provider.capabilities.public()
            metadata=getattr(self._provider,'connection_metadata',None)
            if callable(metadata):
                self._session.metadata.update(metadata())
                self._session.model=self._provider.model
                self._session.firmware=self._provider.firmware
        return {'connected': self._provider is not None and bool(getattr(self._provider,'connected',False)), 'session': self._session.public() if self._session else None}
