from __future__ import annotations

from copy import deepcopy
import getpass
from ipaddress import ip_address
import json
from dataclasses import dataclass
from pathlib import Path
from typing import Protocol

from apps.access_manager.domain.capabilities import SupportStatus
from apps.access_manager.domain.redaction import _is_secret
from apps.access_manager.domain.configuration import validate_wan
from apps.access_manager.domain.profiles import NetworkProfile, ProfileOperation


class ProfileTranslator(Protocol):
    def translate(self, profile: NetworkProfile) -> list[ProfileOperation]: ...


class ProfileRepository(Protocol):
    def list(self) -> list[NetworkProfile]: ...
    def get(self, name: str) -> NetworkProfile | None: ...
    def save(self, profile: NetworkProfile) -> NetworkProfile: ...
    def delete(self, name: str) -> bool: ...


class JsonProfileRepository:
    """Legacy/simple repository retained for compatibility and unit tests."""

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
        return [NetworkProfile.from_dict({"name": key, **value}) for key, value in sorted(self._read().items())]

    def get(self, name: str) -> NetworkProfile | None:
        value = self._read().get(name)
        return NetworkProfile.from_dict({"name": name, **value}) if value else None

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


class AttendantProfileRepository:
    """Persist profiles per current attendant while migrating the old flat JSON.

    The active CPE session carries ``attendant``. When no device is connected,
    the local OS account is used only as an editing scope; no fixed operator
    name is embedded in the application.
    """

    SCHEMA = 2

    def __init__(self, path: Path, sessions: object):
        self.path = path
        self.sessions = sessions

    @property
    def attendant(self) -> str:
        session = getattr(self.sessions, "session", None)
        value = getattr(session, "attendant", None) if session is not None else None
        value = str(value or "").strip()
        return value or str(getpass.getuser() or "local").strip() or "local"

    def _raw(self) -> dict:
        if not self.path.exists():
            return {"_schema": self.SCHEMA, "attendants": {}}
        try:
            value = json.loads(self.path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            return {"_schema": self.SCHEMA, "attendants": {}}
        return value if isinstance(value, dict) else {"_schema": self.SCHEMA, "attendants": {}}

    def _write(self, data: dict) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        tmp = self.path.with_suffix(self.path.suffix + ".tmp")
        tmp.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        tmp.replace(self.path)

    def _document(self) -> dict:
        raw = self._raw()
        if raw.get("_schema") == self.SCHEMA and isinstance(raw.get("attendants"), dict):
            return raw
        # Previous Access Manager 2 versions stored {profile_name: payload}.
        # Move that data into the current attendant's scope without deleting it.
        legacy = {
            str(name): deepcopy(value)
            for name, value in raw.items()
            if not str(name).startswith("_") and isinstance(value, dict)
        }
        active = next(iter(sorted(legacy)), None)
        migrated = {
            "_schema": self.SCHEMA,
            "attendants": {
                self.attendant: {"active": active, "profiles": legacy}
            } if legacy else {},
        }
        self._write(migrated)
        return migrated

    def _scope(self, data: dict, *, create: bool = False) -> dict:
        attendants = data.setdefault("attendants", {})
        if create:
            return attendants.setdefault(self.attendant, {"active": None, "profiles": {}})
        return attendants.get(self.attendant) or {"active": None, "profiles": {}}

    def list(self) -> list[NetworkProfile]:
        data = self._document()
        profiles = self._scope(data).get("profiles") or {}
        return [NetworkProfile.from_dict({"name": key, **value}) for key, value in sorted(profiles.items())]

    def get(self, name: str) -> NetworkProfile | None:
        value = (self._scope(self._document()).get("profiles") or {}).get(name)
        return NetworkProfile.from_dict({"name": name, **value}) if isinstance(value, dict) else None

    def save(self, profile: NetworkProfile) -> NetworkProfile:
        if not profile.name:
            raise ValueError("Profile name is required")
        data = self._document()
        scope = self._scope(data, create=True)
        profiles = scope.setdefault("profiles", {})
        profiles[profile.name] = profile.to_dict()
        if not scope.get("active"):
            scope["active"] = profile.name
        self._write(data)
        return profile

    def delete(self, name: str) -> bool:
        data = self._document()
        scope = self._scope(data, create=True)
        profiles = scope.setdefault("profiles", {})
        if name not in profiles:
            return False
        del profiles[name]
        if scope.get("active") == name:
            scope["active"] = next(iter(sorted(profiles)), None)
        self._write(data)
        return True

    def active(self) -> str | None:
        return self._scope(self._document()).get("active")

    def set_active(self, name: str) -> str:
        data = self._document()
        scope = self._scope(data, create=True)
        if name not in (scope.get("profiles") or {}):
            raise KeyError(f"Unknown profile: {name}")
        scope["active"] = name
        self._write(data)
        return name


@dataclass
class ProfileService:
    sessions: object
    commands: object
    repository: ProfileRepository
    translators: dict[str, ProfileTranslator]
    queries: object = None

    def list(self) -> list[dict]:
        return [profile.to_dict() for profile in self.repository.list()]

    def state(self) -> dict:
        active = self.repository.active() if hasattr(self.repository, "active") else None
        attendant = getattr(self.repository, "attendant", None)
        return {"attendant": attendant, "active": active, "profiles": self.list()}

    def activate(self, name: str) -> dict:
        if not hasattr(self.repository, "set_active"):
            raise RuntimeError("Active profile is not supported by this repository")
        return {"active": self.repository.set_active(name), "attendant": getattr(self.repository, "attendant", None)}

    @staticmethod
    def _find_secret(value, path="profile"):
        forbidden = {"password", "wifi_password", "psk", "passphrase", "pppoe_password", "authorization", "cookie", "token", "csrf"}
        if isinstance(value, dict):
            for key, item in value.items():
                normalized = str(key).strip().lower()
                if normalized in forbidden or _is_secret(normalized):
                    return f"{path}.{key}"
                found = ProfileService._find_secret(item, f"{path}.{key}")
                if found:
                    return found
        elif isinstance(value, list):
            for index, item in enumerate(value):
                found = ProfileService._find_secret(item, f"{path}[{index}]")
                if found:
                    return found
        return None

    @staticmethod
    def _validate_dns(dns: dict) -> None:
        for key in ("ipv4_1", "ipv4_2", "ipv6_1", "ipv6_2"):
            value = str(dns.get(key) or "").strip()
            if not value:
                continue
            parsed = ip_address(value)
            expected = 6 if key.startswith("ipv6") else 4
            if parsed.version != expected:
                raise ValueError(f"{key} deve conter um endereço IPv{expected}")
        servers = dns.get("servers")
        if isinstance(servers, list):
            groups = {4: 0, 6: 0}
            for value in servers:
                groups[ip_address(str(value)).version] += 1
            if any(count > 2 for count in groups.values()):
                raise ValueError("Até dois DNS IPv4 e dois IPv6 podem ser salvos")
        for host in dns.get("hosts") or []:
            name = str(host.get("name") or host.get("nome") or "").strip()
            if not name:
                raise ValueError("Nome do host DNS é obrigatório")
            ip_address(str(host.get("ip") or ""))

    def save(self, data: dict) -> dict:
        secret_path = self._find_secret(data)
        if secret_path:
            raise ValueError(f"Secrets are not persisted in profiles: {secret_path}")
        profile = NetworkProfile.from_dict(data)
        if not profile.name:
            raise ValueError("Nome do perfil é obrigatório")
        self._validate_dns(profile.dns)
        for connection in profile.wan.get('connections') or []:
            if not isinstance(connection,dict) or not connection.get('id') or not isinstance(connection.get('config'),dict):raise ValueError('Selecione a conexão WAN e sua configuração')
            if any(key in connection['config'] for key in ('username','password')):raise ValueError('Credenciais PPPoE não são persistidas em profiles')
            validate_wan(connection['config'])
        if 'enabled' in profile.firewall and not isinstance(profile.firewall['enabled'],bool):raise ValueError('Firewall habilitado deve ser booleano')
        if profile.firewall and (set(profile.firewall)-{'enabled','level'} or profile.firewall.get('level','Low') not in {'Low','Middle','High'}):raise ValueError('Nível de firewall inválido')
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

    def capture(self, name: str = "") -> dict:
        """Create an editable draft from current readers without saving it."""
        if self.queries is None:
            raise RuntimeError("Leituras do equipamento indisponíveis")
        provider = self.sessions.provider

        def readable(feature: str) -> bool:
            return provider.capabilities.get(feature).read != SupportStatus.UNSUPPORTED

        def read(feature: str, method: str, default):
            if not readable(feature):
                return deepcopy(default)
            try:
                return getattr(self.queries, method)()
            except Exception:
                return deepcopy(default)

        raw_radios = read("wifi_radio", "wifi_radios", [])
        radios = []
        for item in raw_radios if isinstance(raw_radios, list) else (raw_radios or {}).get("radios", []):
            if not isinstance(item, dict):
                continue
            radio = {
                key: deepcopy(value)
                for key, value in item.items()
                if key not in {"options", "password", "psk", "passphrase"} and not str(key).startswith("_")
            }
            aliases = {"banda": "band", "canal": "channel", "largura": "bandwidth", "padrao": "standard", "potencia": "tx_power", "pais": "country", "canal_automatico": "auto_channel"}
            for old, new in aliases.items():
                if new not in radio and old in radio:
                    radio[new] = radio[old]
            if radio:
                radios.append(radio)

        raw_ssids = read("wifi", "wifi_ssids", [])
        ssids = []
        for item in raw_ssids if isinstance(raw_ssids, list) else (raw_ssids or {}).get("networks", []):
            if not isinstance(item, dict) or item.get("id") is None:
                continue
            allowed = ("id", "ssid", "enabled", "ativo", "broadcast", "isolation", "band", "banda")
            ssids.append({key: deepcopy(item[key]) for key in allowed if key in item})

        dns = read("dns", "dns", {})
        dns = deepcopy(dns) if isinstance(dns, dict) else {}
        dns.pop("host_rename", None)
        for key in list(dns):
            if str(key).lower() in {"password", "token", "cookie", "authorization"}:
                dns.pop(key, None)
        hosts = []
        for host in dns.get("hosts") or []:
            if isinstance(host, dict) and host.get("ip"):
                hosts.append({"name": host.get("name") or host.get("nome") or "", "ip": host.get("ip")})
        dns["hosts"] = hosts

        dhcp = read("dhcp", "dhcp", {})
        dhcp = deepcopy(dhcp) if isinstance(dhcp, dict) else {}
        dhcp.pop("reservation_fields", None)

        firewall=read('firewall','firewall',{})
        firewall={key:firewall[key] for key in ('enabled','level') if key in firewall and firewall[key] is not None and (key!='level' or firewall[key] in {'Low','Middle','High'})} if isinstance(firewall,dict) else {}
        wan={'connections':[]}
        try:
            surface=next((r['id'] for r in self.queries.surface_catalog() if r['id'] in {'wan_crud','wan_connection'}),None)
            if surface:
                for row in self.queries.surface_read(surface).get('instances',[]):
                    if row['id']=='new':continue
                    config={f['intent_key']:f['value'] for f in row['fields'] if f.get('intent_key') and f.get('value') is not None and not f.get('secret') and f['intent_key']!='username'}
                    wan['connections'].append({'id':row['id'],'config':config})
        except Exception:
            pass
        def without_secrets(value):
            if isinstance(value,dict):return {k:without_secrets(v) for k,v in value.items() if not _is_secret(k)}
            if isinstance(value,list):return [without_secrets(v) for v in value]
            return value
        return NetworkProfile.from_dict({
            "wan":wan,"firewall":firewall,
            "name": str(name or "").strip(),
            "description": "Capturado do equipamento atual; revise antes de salvar.",
            "wifi": {"radios": radios, "ssids": ssids},
            "dns": without_secrets(dns),
            "dhcp": without_secrets(dhcp),
            "capture": {
                "vendor": getattr(provider, "vendor", None),
                "model": getattr(provider, "model", None),
                "saved": False,
            },
        }).to_dict()

    def preview(self, value: str | dict | NetworkProfile, *, _transient=False) -> dict:
        profile = self._profile(value)
        if not _transient and self._find_secret(profile.to_dict()):
            raise ValueError('Use secrets temporários somente ao aplicar; o perfil não pode conter segredos')
        self._validate_dns(profile.dns)
        for connection in profile.wan.get('connections') or []:
            validate_wan(connection.get('config') or {})
        provider = self.sessions.provider
        translator = self.translators.get(provider.vendor)
        if translator is None:
            raise RuntimeError(f"No profile translator for provider {provider.vendor}")

        operations = translator.translate(profile)
        result = []
        current_cache = {}
        labels = {
            'ssid': 'SSID', 'enabled': 'Habilitado', 'broadcast': 'Broadcast', 'isolation': 'Isolamento',
            'channel': 'Canal', 'auto_channel': 'Canal automático', 'bandwidth': 'Largura',
            'standard': 'Padrão', 'tx_power': 'Potência', 'country': 'País', 'sgi': 'SGI',
            'beacon_interval': 'Beacon interval', 'rts_cts': 'RTS/CTS', 'dtim': 'DTIM',
            'airtime_fairness': 'Airtime fairness', 'band_steering': 'Band steering',
            'bandwidth_code': 'Código de largura', 'domain_name': 'Domínio',
            'min_address': 'Início do pool', 'max_address': 'Fim do pool', 'lease_time': 'Lease',
            'ipv4_1': 'DNS IPv4 1', 'ipv4_2': 'DNS IPv4 2', 'ipv6_1': 'DNS IPv6 1', 'ipv6_2': 'DNS IPv6 2',
            'password': 'Senha',
        }

        def display(value):
            if value is None:
                return 'Não disponível'
            if isinstance(value, bool):
                return 'Sim' if value else 'Não'
            if isinstance(value, list):
                return f'{len(value)} registros'
            if isinstance(value, dict):
                return 'Configuração' if value else 'Sem configuração'
            return value

        for op in operations:
            if op.feature not in current_cache:
                try:
                    reader = {'wifi': 'wifi', 'wifi_radio': 'wifi_radios', 'dns': 'dns', 'dns_hosts': 'dns', 'dhcp': 'dhcp', 'firewall':'firewall'}.get(op.feature)
                    current_cache[op.feature] = getattr(self.queries, reader)() if self.queries is not None and reader else None
                except Exception:
                    current_cache[op.feature] = None
            current = current_cache[op.feature] or {}
            if op.method=='set_profile_wan':
                try:
                    surface=next(r['id'] for r in self.queries.surface_catalog() if r['id'] in {'wan_crud','wan_connection'})
                    current_cache['wan_rows']=current_cache.get('wan_rows') or self.queries.surface_read(surface).get('instances',[])
                    row=next(r for r in current_cache['wan_rows'] if str(r['id'])==str(op.args[0]['id']))
                    current={f['intent_key']:f['value'] for f in row['fields'] if f.get('intent_key') and not f.get('secret')}
                except Exception:
                    current={}
            config = op.args[0]['config'] if op.method=='set_profile_wan' else op.args[-1] if op.args and isinstance(op.args[-1], dict) else {}
            if op.feature == 'dns_hosts':
                current = next((r for r in current.get('hosts', []) if r.get('name') == config.get('name')), {})
            if op.feature == 'wifi':
                current = next((r for r in current.get('networks', []) if str(r.get('id')) == str(op.args[0])), {})
            if op.feature == 'wifi_radio':
                current = next((r for r in (current if isinstance(current, list) else current.get('radios', [])) if (r.get('band') or r.get('banda')) == config.get('band')), {})
            aliases = {
                'channel': 'canal', 'bandwidth': 'largura', 'standard': 'padrao', 'tx_power': 'potencia',
                'country': 'pais', 'auto_channel': 'canal_automatico', 'min_address': 'pool_start',
                'max_address': 'pool_end', 'lease_time': 'lease_seconds', 'ssid': 'ssid', 'enabled': 'ativo',
            }
            changes = []
            for key, desired in config.items():
                old = current.get(key, current.get(aliases.get(key, '')))
                changes.append({
                    'field': labels.get(key, key.replace('_', ' ')),
                    'current': 'Oculta' if 'password' in key else display(old),
                    'desired': 'Será alterada' if 'password' in key else 'Automático' if key == 'channel' and config.get('auto_channel') is True else display(desired),
                    'current_known': old is not None,
                })
            cap = provider.capabilities.get(op.feature)
            available=True
            if op.method=='set_profile_wan':
                available=bool(current) and hasattr(provider,'set_profile_wan')
            result.append({
                **op.public(),
                "impact":"Pode interromper a conexão" if op.feature in {'configuration_surfaces','firewall','dns','dhcp'} else "Altera a rede Wi-Fi",
                "requires_transient_secret":False,
                "transient_secret_policy":"Senha PPPoE opcional; informe uma nova credencial se o firmware não preservar a atual" if op.method=="set_profile_wan" else "Senha Wi-Fi opcional" if op.feature=="wifi" else "Não exige",

                "changes": changes,
                "support": cap.write.value if available else "UNSUPPORTED",
                "will_apply": cap.write == SupportStatus.SUPPORTED and available,
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
        profile = self._profile(value)
        if self._find_secret(profile.to_dict()):raise ValueError('Use o campo de secrets temporários separado do perfil')
        if secrets:
            if not isinstance(secrets, dict):
                raise ValueError('Senhas temporárias devem ser um mapa de SSID')
            secrets = {str(k): str(v) for k, v in secrets.items()}
            data = profile.to_dict()
            wifi = dict(data.get('wifi') or {})
            ssids = [dict(s) for s in wifi.get('ssids') or []]
            known = {str(s.get('id')) for s in ssids} | {'wan:'+str(c['id']) for c in profile.wan.get('connections') or []}
            if set(str(k) for k in secrets) - known:
                raise ValueError('SSID de senha temporária não pertence ao perfil')
            for ssid in ssids:
                if str(ssid.get('id')) in secrets:
                    ssid['password'] = str(secrets[str(ssid['id'])])
            wifi['ssids'] = ssids
            data['wifi'] = wifi
            wan=deepcopy(data.get('wan') or {})
            for connection in wan.get('connections') or []:
                key='wan:'+str(connection['id'])
                if key in secrets:
                    validate_wan({'password':secrets[key]})
                    connection['config']['password']=secrets[key]
            data['wan']=wan
            profile = NetworkProfile.from_dict(data)
        preview = self.preview(profile,_transient=True)
        applied: list[dict] = []
        skipped: list[dict] = []
        failed: list[dict] = []
        uncertain: list[dict] = []
        steps: list[dict] = []

        # AM2 keeps its existing best-effort semantics: independent capabilities
        # continue after a failed writer. No rollback is claimed when none exists.
        for item in preview["operations"]:
            if not item["will_apply"]:
                detail = {"feature": item["feature"], "label": item["label"], "reason": item["support"]}
                skipped.append(detail)
                steps.append({**detail, "status": "UNSUPPORTED"})
                continue
            try:
                result = self.commands.execute(item["feature"], item["method"], *item["args"], **item["kwargs"])
                if isinstance(result, dict) and result.get('uncertain'):
                    detail = {'feature': item['feature'], 'label': item['label'], 'result': result}
                    uncertain.append(detail)
                    steps.append({**detail, 'status': 'UNCERTAIN'})
                elif isinstance(result, dict) and result.get('success') is False:
                    detail = {'feature': item['feature'], 'label': item['label'], 'message': 'O equipamento não confirmou a operação', 'result': result}
                    failed.append(detail)
                    steps.append({**detail, 'status': 'FAILED'})
                else:
                    detail = {"feature": item["feature"], "label": item["label"], "result": result}
                    applied.append(detail)
                    steps.append({**detail, 'status': 'SUCCESS'})
            except Exception as exc:
                detail = {
                    "feature": item["feature"], "label": item["label"],
                    "error": type(exc).__name__, "message": "Falha na operação com segredo temporário" if secrets else str(exc),
                }
                failed.append(detail)
                steps.append({**detail, 'status': 'FAILED'})

        return {
            "profile": preview["profile"]["name"],
            "vendor": preview["vendor"],
            "model": preview["model"],
            "applied": len(applied),
            "skipped": len(skipped),
            "failed": len(failed),
            "uncertain": len(uncertain),
            "verified": sum(1 for item in applied if isinstance(item.get('result'), dict) and item['result'].get('verified') is True),
            "steps": steps,
            "details": {"applied": applied, "skipped": skipped, "failed": failed, "uncertain": uncertain},
        }
