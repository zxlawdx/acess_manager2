from __future__ import annotations
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from enum import StrEnum
from typing import Any
from uuid import uuid4

class Vendor(StrEnum):
    HUAWEI = "huawei"
    ZTE = "zte"
    JUNIPER = "juniper"
    DEPLOYMENT = "deployment"

class SessionMode(StrEnum):
    SUPPORTED = "supported"
    PARTIAL = "partial"
    DEPLOYMENT = "deployment"

@dataclass
class DeviceSession:
    vendor: Vendor
    host: str
    provider: str
    model: str | None = None
    firmware: str | None = None
    protocol_family: str | None = None
    mode: SessionMode = SessionMode.PARTIAL
    attendant: str | None = None
    capabilities: dict[str, dict] = field(default_factory=dict)
    session_id: str = field(default_factory=lambda: uuid4().hex)
    updated_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    metadata: dict[str, Any] = field(default_factory=dict)

    def public(self) -> dict[str, Any]: return asdict(self)

@dataclass(frozen=True)
class TrafficSample:
    timestamp: float
    rx_bytes: int | None = None
    tx_bytes: int | None = None
    rx_packets: int | None = None
    tx_packets: int | None = None
    errors: int | None = None
    drops: int | None = None

@dataclass(frozen=True)
class TrafficRate:
    rx_bytes_per_second: float | None
    tx_bytes_per_second: float | None
    counter_reset: bool = False
