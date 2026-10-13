from __future__ import annotations
from dataclasses import dataclass, asdict
from enum import StrEnum

class SupportStatus(StrEnum):
    SUPPORTED = "SUPPORTED"
    PARTIAL = "PARTIAL"
    UNKNOWN = "UNKNOWN"
    UNSUPPORTED = "UNSUPPORTED"

class EvidenceLevel(StrEnum):
    IMPLEMENTED = "IMPLEMENTED"
    SOURCE_CONFIRMED = "SOURCE_CONFIRMED"
    FIRMWARE_CONFIRMED = "FIRMWARE_CONFIRMED"
    DOCUMENTED = "DOCUMENTED"
    SOURCE_FOUND = "SOURCE_FOUND"
    FIXTURE_VALIDATED = "FIXTURE_VALIDATED"
    AUTOMATED_TESTED = "AUTOMATED_TESTED"
    PHYSICALLY_VALIDATED = "PHYSICALLY_VALIDATED"
    RESEARCH_ONLY = "RESEARCH_ONLY"
    UNKNOWN = "UNKNOWN"

@dataclass(frozen=True)
class Capability:
    name: str
    read: SupportStatus = SupportStatus.UNKNOWN
    write: SupportStatus = SupportStatus.UNKNOWN
    evidence: EvidenceLevel = EvidenceLevel.UNKNOWN
    destructive: bool = False
    source: str | None = None

    @property
    def readable(self) -> bool:
        return self.read in {SupportStatus.SUPPORTED, SupportStatus.PARTIAL}

    @property
    def writable(self) -> bool:
        # PARTIAL is evidence that some sub-surface exists, not permission to
        # execute an undifferentiated mutation. Split supported sub-operations
        # into their own capabilities instead of silently enabling PARTIAL.
        return self.write == SupportStatus.SUPPORTED

    def public(self) -> dict:
        data = asdict(self)
        data["read"] = self.read.value
        data["write"] = self.write.value
        data["evidence"] = self.evidence.value
        data["enabled"] = {"read": self.read == SupportStatus.SUPPORTED, "write": self.write == SupportStatus.SUPPORTED}
        return data

class CapabilitySet:
    def __init__(self, values=()): self._items = {item.name: item for item in values}
    def get(self, name: str) -> Capability:
        return self._items.get(name, Capability(name=name))
    def require_read(self, name: str) -> None:
        cap=self.get(name)
        if not cap.readable: raise CapabilityUnavailable(name, "read", cap.read.value)
    def require_write(self, name: str) -> None:
        cap=self.get(name)
        if not cap.writable: raise CapabilityUnavailable(name, "write", cap.write.value)
    def public(self) -> dict[str, dict]: return {name: item.public() for name,item in sorted(self._items.items())}

class CapabilityUnavailable(RuntimeError):
    def __init__(self, feature: str, operation: str, state: str):
        super().__init__(f"Capability {feature}.{operation} is {state}")
        self.feature, self.operation, self.state = feature, operation, state
