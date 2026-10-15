"""Versioned nonsecret connection preferences; no credentials accepted by the schema."""
import json
from pathlib import Path
from threading import RLock
from apps.access_manager.runtime import data_dir


class JuniperSettings:
    def __init__(self, path=None):
        self.path = Path(path) if path else data_dir() / 'juniper-connection.json'
        self.lock = RLock()

    def read(self):
        defaults = {'version': 1, 'default_host': '', 'last_successful_host': '',
                    'ssh_port': 22, 'netconf_port': 830, 'preferred_transport': 'ssh'}
        try:
            saved = json.loads(self.path.read_text())
            if saved.get('version') == 1:
                defaults.update({k: saved[k] for k in defaults if k in saved})
        except (OSError, ValueError, TypeError):
            pass
        return defaults

    def save(self, config, *, successful_host=None):
        from apps.access_manager.infrastructure.providers.juniper import JuniperProvider
        with self.lock:
            current = self.read()
            for name in ('ssh_port', 'netconf_port'):
                if name in config:
                    _, port = JuniperProvider.target('example.invalid', config[name])
                    if port is None: raise ValueError('Porta obrigatória.')
                    current[name] = port
            if 'preferred_transport' in config:
                if config['preferred_transport'] not in {'ssh', 'netconf', 'auto'}:
                    raise ValueError('Transporte inválido.')
                current['preferred_transport'] = config['preferred_transport']
            if 'default_host' in config:
                current['default_host'] = JuniperProvider.target(config['default_host'], None)[0] if config['default_host'] else ''
            if successful_host is not None:
                current['last_successful_host'] = JuniperProvider.target(successful_host, None)[0]
            self.path.parent.mkdir(parents=True, exist_ok=True)
            temporary = self.path.with_suffix('.tmp')
            temporary.write_text(json.dumps(current, indent=2)+'\n')
            temporary.replace(self.path)
            return current
