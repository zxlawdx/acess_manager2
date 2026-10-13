from __future__ import annotations
import ipaddress
from dataclasses import dataclass
from typing import Callable

@dataclass(frozen=True)
class ProviderDecision:
    vendor: str
    reason: str

class ProviderRouter:
    def __init__(self, *, huawei_probe: Callable[..., bool], huawei_models: set[str] | None = None):
        self._huawei_probe = huawei_probe
        self._huawei_models = {self._compact(x) for x in (huawei_models or set())}
    @staticmethod
    def _compact(value: str | None) -> str: return ''.join(ch for ch in str(value or '').upper() if ch.isalnum())
    @staticmethod
    def _probeable(host: str) -> bool:
        raw=str(host).replace('http://','').replace('https://','').split('/')[0].split(':')[0]
        try: ip=ipaddress.ip_address(raw)
        except ValueError: return True
        nets=[ipaddress.ip_network('10.0.0.0/8'),ipaddress.ip_network('172.16.0.0/12'),ipaddress.ip_network('192.168.0.0/16'),ipaddress.ip_network('100.64.0.0/10')]
        return any(ip in n for n in nets)
    def decide(self, host: str, *, model_hint: str | None = None, https: bool = False) -> ProviderDecision:
        if self._compact(model_hint) in self._huawei_models: return ProviderDecision('huawei','model_hint')
        if self._probeable(host) and self._huawei_probe(host, https=https): return ProviderDecision('huawei','fingerprint')
        return ProviderDecision('zte','default_non_huawei')
