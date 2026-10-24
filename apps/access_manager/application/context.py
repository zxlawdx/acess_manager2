from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any

LOGGER = logging.getLogger(__name__)


@dataclass(slots=True)
class ApplicationContext:
    """Application-scoped state assembled by the composition root."""

    history: Any
    device_sessions: Any
    infrastructure_sessions: Any
    sessions: Any
    commands: Any
    queries: Any
    profiles: Any
    artifacts: Any
    full_diagnostics: Any
    mesh_port_forwarding: Any
    diagnostic_orchestrator: Any

    def close(self) -> None:
        """Best-effort deterministic cleanup of stateful device sessions."""
        try:
            self.sessions.revoke_credential()
        except Exception:
            LOGGER.exception("Could not revoke infrastructure credential during shutdown")
        for manager in (self.device_sessions, self.infrastructure_sessions):
            try:
                if manager.status().get("connected"):
                    manager.disconnect()
            except Exception:
                LOGGER.exception("Could not close provider session during shutdown")
