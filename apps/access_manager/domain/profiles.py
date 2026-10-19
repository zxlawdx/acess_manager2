from __future__ import annotations

from copy import deepcopy
from dataclasses import dataclass, field
from typing import Any


@dataclass(frozen=True)
class NetworkProfile:
    """Provider-neutral configuration intent.

    A profile stores desired state, never device endpoints or protocol payloads.
    Unknown top-level fields are retained in ``extensions`` and flattened again
    by ``to_dict`` so migrations/model-specific metadata survive round trips.
    """

    name: str
    description: str = ""
    wifi: dict[str, Any] = field(default_factory=dict)
    dns: dict[str, Any] = field(default_factory=dict)
    dhcp: dict[str, Any] = field(default_factory=dict)
    wan: dict[str, Any] = field(default_factory=dict)
    firewall: dict[str, Any] = field(default_factory=dict)
    extensions: dict[str, Any] = field(default_factory=dict, repr=False)

    @classmethod
    def from_dict(cls, value: dict[str, Any]) -> "NetworkProfile":
        value = dict(value or {})
        wifi = deepcopy(value.get('wifi') or {})
        if not isinstance(wifi.get('radios'), list) and not isinstance(wifi.get('radio'), dict):
            legacy = [
                {**deepcopy(config), 'band': band}
                for band, config in wifi.items()
                if band in {'2.4GHz', '5GHz'} and isinstance(config, dict)
            ]
            if legacy:
                wifi['radios'] = legacy
        known = {'name', 'description', 'wifi', 'dns', 'dhcp', 'wan', 'firewall', 'extensions'}
        extensions = deepcopy(value.get('extensions') or {})
        extensions.update({key: deepcopy(item) for key, item in value.items() if key not in known})
        return cls(
            name=str(value.get("name") or "").strip(),
            description=str(value.get("description") or "").strip(),
            wifi=wifi,
            dns=deepcopy(value.get("dns") or {}),
            dhcp=deepcopy(value.get("dhcp") or {}),
            wan=deepcopy(value.get("wan") or extensions.pop("wan", {}) or {}),
            firewall=deepcopy(value.get("firewall") or extensions.pop("firewall", {}) or {}),
            extensions=extensions,
        )

    def to_dict(self) -> dict[str, Any]:
        return {
            **deepcopy(self.extensions),
            "name": self.name,
            "description": self.description,
            "wifi": deepcopy(self.wifi),
            "dns": deepcopy(self.dns),
            "dhcp": deepcopy(self.dhcp),
            "wan": deepcopy(self.wan),
            "firewall": deepcopy(self.firewall),
        }


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
