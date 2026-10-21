"""Vendor-neutral read contracts. No CLI strings cross this boundary."""
from typing import Protocol


class InfrastructureProvider(Protocol):
    def get_system(self) -> dict: ...
    def get_interfaces(self) -> list: ...
    def get_interface(self, name: str) -> dict: ...
    def get_health(self, config: dict) -> dict: ...
    def diagnostic(self, config: dict) -> dict: ...


class BngProvider(Protocol):
    vendor: str

    def get_system(self) -> dict: ...
    def lookup_subscribers(self, query: str) -> dict: ...
    def get_subscriber(self, session_id: str) -> dict: ...
    def disconnect(self) -> None: ...


class InfrastructureCredentialSession:
    """Runtime-only credential; deliberately neither serializable nor printable."""
    __slots__ = ('_username', '_password')

    def __init__(self, username, password):
        self._username, self._password = username, password

    def __repr__(self):
        return '<InfrastructureCredentialSession redacted>'

    def __reduce__(self):
        raise TypeError('Runtime credentials cannot be serialized')

    def connect(self, transport, host, **options):
        if self._password is None:
            raise RuntimeError('Credencial revogada.')
        return transport.connect(host, self._username, self._password, **options)

    def revoke(self):
        self._username = self._password = None
