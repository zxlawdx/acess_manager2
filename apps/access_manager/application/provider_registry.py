from __future__ import annotations

from collections.abc import Iterator, Mapping

from apps.access_manager.domain.provider import DeviceProvider


class ProviderRegistry(Mapping[str, DeviceProvider]):
    """Small explicit registry used by sessions instead of vendor conditionals."""

    def __init__(self) -> None:
        self._providers: dict[str, DeviceProvider] = {}

    @staticmethod
    def _key(vendor: str) -> str:
        key = str(vendor or "").strip().lower()
        if not key:
            raise ValueError("provider vendor is required")
        return key

    def register(self, vendor: str, provider: DeviceProvider) -> None:
        key = self._key(vendor)
        if key in self._providers:
            raise ValueError(f"provider already registered: {key}")
        self._providers[key] = provider

    def __getitem__(self, vendor: str) -> DeviceProvider:
        return self._providers[self._key(vendor)]

    def __iter__(self) -> Iterator[str]:
        return iter(self._providers)

    def __len__(self) -> int:
        return len(self._providers)

    def as_dict(self) -> dict[str, DeviceProvider]:
        return dict(self._providers)
