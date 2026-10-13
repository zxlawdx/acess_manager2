from __future__ import annotations
from dataclasses import dataclass
import re
from typing import Any

from apps.access_manager.infrastructure.huawei.protocol.errors import HuaweiArchitectureError
from apps.access_manager.infrastructure.huawei.protocol.negotiating_client import HuaweiTransportError, HuaweiTransportFailure

try:
    from requests import exceptions as req
except ImportError:
    req = None

SAFE_WORDS = re.compile(r"^[\wÀ-ÿ .,;:()!?áàâãéêíóôõúçñ\-]{1,180}$", re.UNICODE)
SENSITIVE = re.compile(r"(?:https?://|/api/|\\|<|>|\{|\}|=|\b(?:password|passwd|token|credential|senha|secret|traceback|post|put|get|delete|cookie)\b)", re.I)

@dataclass(frozen=True)
class PublicFailure:
    code: str
    type: str
    message: str
    retryable: bool = False
    def envelope(self) -> dict[str, Any]:
        return {"error": self.message, "type": self.type, "code": self.code, "retryable": self.retryable}

def _safe_text(error: BaseException, fallback: str) -> str:
    value = str(error).strip()
    if not value or not SAFE_WORDS.fullmatch(value) or SENSITIVE.search(value):
        return fallback
    return value

def classify(error: BaseException) -> PublicFailure | None:
    if isinstance(error, HuaweiArchitectureError):
        return PublicFailure(error.code, error.category, error.public_message, bool(error.retryable))
    if isinstance(error, HuaweiTransportError):
        mapping = {
            HuaweiTransportFailure.NETWORK_ERROR: PublicFailure("NETWORK_ERROR", "connection", "Não foi possível alcançar a ONT.", True),
            HuaweiTransportFailure.TLS_ERROR: PublicFailure("TLS_ERROR", "connection", "Não foi possível estabelecer TLS com a ONT.", True),
            HuaweiTransportFailure.AUTH_REJECTED: PublicFailure("AUTH_REJECTED", "authentication", "A ONT rejeitou a autenticação.", True),
            HuaweiTransportFailure.AUTH_PROTOCOL_MISMATCH: PublicFailure("AUTH_PROTOCOL_MISMATCH", "unconfirmed", "O fluxo de autenticação desta Huawei não foi reconhecido.", False),
            HuaweiTransportFailure.SESSION_EXPIRED: PublicFailure("SESSION_EXPIRED", "session", "A sessão Huawei expirou. Reconecte-se ao equipamento.", True),
        }
        return mapping.get(error.code, PublicFailure("OPERATION_STATE", "state", "Não foi possível concluir esta operação com a sessão atual."))
    if isinstance(error, TimeoutError) or (req and isinstance(error, req.Timeout)):
        return PublicFailure("TIMEOUT", "timeout", "O equipamento não respondeu dentro do tempo esperado. Tente novamente.", True)
    if isinstance(error, (ConnectionError, BrokenPipeError)) or (req and isinstance(error, req.ConnectionError)):
        return PublicFailure("NETWORK_UNREACHABLE", "connection", "A comunicação falhou. Verifique se o equipamento está acessível.", True)
    if isinstance(error, PermissionError):
        return PublicFailure("OPERATION_FORBIDDEN", "permission", "A operação não está disponível para a capability ativa.", False)
    if isinstance(error, ValueError):
        return PublicFailure("INVALID_INPUT", "validation", _safe_text(error, "Verifique os dados informados e tente novamente."), False)
    if isinstance(error, RuntimeError):
        return PublicFailure("OPERATION_STATE", "state", _safe_text(error, "Não foi possível concluir esta operação com a sessão atual."), False)
    return None

def public_error(error: BaseException) -> dict[str, Any]:
    failure = classify(error)
    if failure is not None:
        return failure.envelope()
    return {"error": "Ocorreu uma falha inesperada.", "type": "internal", "code": "INTERNAL_ERROR", "retryable": False}
