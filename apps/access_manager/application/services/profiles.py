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
        for op in operations:
            cap = provider.capabilities.get(op.feature)
            result.append({
                **op.public(),
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

    def apply(self, value: str | dict | NetworkProfile) -> dict:
        preview = self.preview(value)
        applied: list[dict] = []
        skipped: list[dict] = []
        failed: list[dict] = []

        for item in preview["operations"]:
            if not item["will_apply"]:
                skipped.append({"feature": item["feature"], "label": item["label"], "reason": item["support"]})
                continue
            try:
                result = self.commands.execute(
                    item["feature"], item["method"], *item["args"], **item["kwargs"]
                )
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
            "details": {"applied": applied, "skipped": skipped, "failed": failed},
        }
