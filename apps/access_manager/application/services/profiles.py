from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Protocol

from apps.access_manager.domain.capabilities import SupportStatus
from apps.access_manager.domain.profiles import NetworkProfile, ProfileOperation


class ProfileTranslator(Protocol):
    def translate(self, profile: NetworkProfile) -> list[ProfileOperation]: ...


class ProfileRepository(Protocol):
    def list(self) -> list[NetworkProfile]: ...
    def get(self, name: str) -> NetworkProfile | None: ...
    def save(self, profile: NetworkProfile) -> NetworkProfile: ...
    def delete(self, name: str) -> bool: ...


class JsonProfileRepository:
    def __init__(self, path: Path):
        self.path = path

    def _read(self) -> dict[str, dict]:
        if not self.path.exists():
            return {}
        try:
            raw = json.loads(self.path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            return {}
        return raw if isinstance(raw, dict) else {}

    def _write(self, data: dict[str, dict]) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        tmp = self.path.with_suffix(self.path.suffix + ".tmp")
        tmp.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        tmp.replace(self.path)

    def list(self) -> list[NetworkProfile]:
        return [NetworkProfile.from_dict(value) for _, value in sorted(self._read().items())]

    def get(self, name: str) -> NetworkProfile | None:
        value = self._read().get(name)
        return NetworkProfile.from_dict(value) if value else None

    def save(self, profile: NetworkProfile) -> NetworkProfile:
        if not profile.name:
            raise ValueError("Profile name is required")
        data = self._read()
        data[profile.name] = profile.to_dict()
        self._write(data)
        return profile

    def delete(self, name: str) -> bool:
        data = self._read()
        if name not in data:
            return False
        del data[name]
        self._write(data)
        return True


@dataclass
class ProfileService:
    sessions: object
    commands: object
    repository: ProfileRepository
    translators: dict[str, ProfileTranslator]
    queries: object = None

    def list(self) -> list[dict]:
        return [profile.to_dict() for profile in self.repository.list()]

    def save(self, data: dict) -> dict:
        forbidden = {"password", "wifi_password", "psk", "passphrase", "pppoe_password", "authorization", "cookie", "token", "csrf"}
        def find_secret(value, path="profile"):
            if isinstance(value, dict):
                for key, item in value.items():
                    normalized=str(key).strip().lower()
                    if normalized in forbidden or normalized.endswith("password") or normalized.endswith("token"):
                        return f"{path}.{key}"
                    found=find_secret(item, f"{path}.{key}")
                    if found: return found
            elif isinstance(value, list):
                for index, item in enumerate(value):
                    found=find_secret(item, f"{path}[{index}]")
                    if found: return found
            return None
        secret_path=find_secret(data)
        if secret_path:
            raise ValueError(f"Secrets are not persisted in profiles: {secret_path}")
        profile = NetworkProfile.from_dict(data)
        return self.repository.save(profile).to_dict()

    def delete(self, name: str) -> dict:
        return {"deleted": self.repository.delete(name), "name": name}

    def _profile(self, value: str | dict | NetworkProfile) -> NetworkProfile:
        if isinstance(value, NetworkProfile):
            return value
        if isinstance(value, dict):
            return NetworkProfile.from_dict(value)
        profile = self.repository.get(value)
        if profile is None:
            raise KeyError(f"Unknown profile: {value}")
        return profile

    def preview(self, value: str | dict | NetworkProfile) -> dict:
        profile = self._profile(value)
        provider = self.sessions.provider
        translator = self.translators.get(provider.vendor)
        if translator is None:
            raise RuntimeError(f"No profile translator for provider {provider.vendor}")

        operations = translator.translate(profile)
        result = []
        current_cache={}
        labels={'ssid':'SSID','enabled':'Habilitado','broadcast':'Broadcast','isolation':'Isolamento','channel':'Canal','auto_channel':'Canal automático','bandwidth':'Largura','standard':'Padrão','tx_power':'Potência','country':'País','min_address':'Início do pool','max_address':'Fim do pool','lease_time':'Lease','ipv4_1':'DNS IPv4 1','ipv4_2':'DNS IPv4 2','ipv6_1':'DNS IPv6 1','ipv6_2':'DNS IPv6 2','password':'Senha'}
        def display(value):
            if value is None:return 'Não disponível'
            if isinstance(value,bool):return 'Sim' if value else 'Não'
            if isinstance(value,list):return f'{len(value)} registros'
            if isinstance(value,dict):return 'Configuração' if value else 'Sem configuração'
            return value
        for op in operations:
            if op.feature not in current_cache:
                try:
                    reader={'wifi':'wifi','wifi_radio':'wifi','dns':'dns','dns_hosts':'dns','dhcp':'dhcp'}.get(op.feature)
                    current_cache[op.feature]=getattr(self.queries,reader)() if self.queries is not None and reader else None
                except Exception:current_cache[op.feature]=None
            current=current_cache[op.feature] or {}
            config=op.args[-1] if op.args and isinstance(op.args[-1],dict) else {}
            if op.feature=='dns_hosts':current=next((r for r in current.get('hosts',[]) if r.get('name')==config.get('name')), {})
            if op.feature=='wifi':current=next((r for r in current.get('networks',[]) if str(r.get('id'))==str(op.args[0])),{})
            if op.feature=='wifi_radio':current=next((r for r in current.get('radios',[]) if (r.get('band') or r.get('banda'))==config.get('band')), {})
            aliases={'channel':'canal','bandwidth':'largura','standard':'padrao','tx_power':'potencia','country':'pais','auto_channel':'canal_automatico','min_address':'pool_start','max_address':'pool_end','lease_time':'lease_seconds','ssid':'ssid','enabled':'ativo'}
            changes=[]
            for key,desired in config.items():
                old=current.get(key,current.get(aliases.get(key,'')))
                changes.append({'field':labels.get(key,key.replace('_',' ')),'current':'Oculta' if 'password' in key else display(old),'desired':'Será alterada' if 'password' in key else display(desired),'current_known':old is not None})
            cap = provider.capabilities.get(op.feature)
            result.append({
                **op.public(),
                "changes": changes,
                "support": cap.write.value,
                "will_apply": cap.write == SupportStatus.SUPPORTED,
                "evidence": cap.evidence.value,
                "source": cap.source,
            })
        return {
            "profile": profile.to_dict(),
            "vendor": provider.vendor,
            "model": getattr(provider, "model", None),
            "operations": result,
            "applicable": sum(1 for item in result if item["will_apply"]),
            "skipped": sum(1 for item in result if not item["will_apply"]),
        }

    def apply(self, value: str | dict | NetworkProfile, secrets=None) -> dict:
        profile=self._profile(value)
        if secrets:
            if not isinstance(secrets,dict):raise ValueError('Senhas temporárias devem ser um mapa de SSID')
            secrets={str(k):str(v) for k,v in secrets.items()}
            # Passwords are supplied for this application only, never saved.
            data=profile.to_dict();wifi=dict(data.get('wifi') or {})
            ssids=[dict(s) for s in wifi.get('ssids') or []]
            known={str(s.get('id')) for s in ssids}
            if set(str(k) for k in secrets)-known:raise ValueError('SSID de senha temporária não pertence ao perfil')
            for ssid in ssids:
                if str(ssid.get('id')) in secrets:ssid['password']=str(secrets[str(ssid['id'])])
            wifi['ssids']=ssids;data['wifi']=wifi;profile=NetworkProfile.from_dict(data)
        preview = self.preview(profile)
        applied: list[dict] = []
        skipped: list[dict] = []
        failed: list[dict] = []
        uncertain: list[dict] = []

        for item in preview["operations"]:
            if not item["will_apply"]:
                skipped.append({"feature": item["feature"], "label": item["label"], "reason": item["support"]})
                continue
            try:
                result = self.commands.execute(
                    item["feature"], item["method"], *item["args"], **item["kwargs"]
                )
                if isinstance(result,dict) and result.get('uncertain'):
                    uncertain.append({'feature':item['feature'],'label':item['label'],'result':result})
                elif isinstance(result,dict) and result.get('success') is False:
                    failed.append({'feature':item['feature'],'label':item['label'],'message':'O equipamento não confirmou a operação','result':result})
                else:
                    applied.append({"feature": item["feature"], "label": item["label"], "result": result})
            except Exception as exc:
                # Do not retry mutations. The provider/writer owns any explicit
                # read-back logic and an uncertain result must remain uncertain.
                failed.append({
                    "feature": item["feature"],
                    "label": item["label"],
                    "error": type(exc).__name__,
                    "message": str(exc),
                })

        return {
            "profile": preview["profile"]["name"],
            "vendor": preview["vendor"],
            "model": preview["model"],
            "applied": len(applied),
            "skipped": len(skipped),
            "failed": len(failed),
            "uncertain": len(uncertain),
            "verified": sum(1 for item in applied if isinstance(item.get('result'),dict) and item['result'].get('verified') is True),
            "details": {"applied": applied, "skipped": skipped, "failed": failed, "uncertain": uncertain},
        }
