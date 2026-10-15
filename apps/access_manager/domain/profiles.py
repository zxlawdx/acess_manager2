from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any


@dataclass(frozen=True)
class NetworkProfile:
    """Provider-neutral configuration intent.

    A profile stores desired state, never device endpoints or protocol payloads.
    Vendor translators are responsible for turning this intent into application
    commands supported by the active provider.
    """

    name: str
    description: str = ""
    wifi: dict[str, Any] = field(default_factory=dict)
    dns: dict[str, Any] = field(default_factory=dict)
    dhcp: dict[str, Any] = field(default_factory=dict)

    @classmethod
    def from_dict(cls, value: dict[str, Any]) -> "NetworkProfile":
        wifi=dict(value.get('wifi') or {})
        if not isinstance(wifi.get('radios'),list) and not isinstance(wifi.get('radio'),dict):
            legacy=[{**config,'band':band} for band,config in wifi.items() if band in {'2.4GHz','5GHz'} and isinstance(config,dict)]
            if legacy:wifi['radios']=legacy
        return cls(
            name=str(value.get("name") or "").strip(),
            description=str(value.get("description") or "").strip(),
            wifi=wifi,
            dns=dict(value.get("dns") or {}),
            dhcp=dict(value.get("dhcp") or {}),
        )

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass(frozen=True)
class ProfileOperation:
    feature: str
    method: str
    args: tuple[Any, ...] = ()
    kwargs: dict[str, Any] = field(default_factory=dict)
    label: str = ""

    def public(self) -> dict[str, Any]:
        return {
            "feature": self.feature,
            "method": self.method,
            "args": list(self.args),
            "kwargs": dict(self.kwargs),
            "label": self.label or self.method,
        }
