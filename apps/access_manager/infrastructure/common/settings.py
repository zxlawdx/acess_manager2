"""Versioned nonsecret connection preferences; no credentials accepted by the schema."""
import json
from pathlib import Path
from threading import RLock
from apps.access_manager.runtime import data_dir


class ConnectionPreferences:
    def __init__(self, path=None, *, vendor='juniper'):
        if vendor not in {'juniper','huawei_bng'}:raise ValueError('Provider inválido.')
        self.vendor=vendor
        self.path = Path(path) if path else data_dir() / (vendor+'-connection.json')
        self.lock = RLock()

    def read(self):
        defaults = {'version': 1, 'default_host': '', 'last_successful_host': '',
                    'ssh_port': 22, 'netconf_port': 830, 'preferred_transport': 'ssh'}
        if self.vendor=='huawei_bng':
            defaults.pop('netconf_port');defaults['preferred_transport']='ssh'
        try:
            saved = json.loads(self.path.read_text())
            if saved.get('version') == 1:
                defaults.update({k: saved[k] for k in defaults if k in saved})
        except (OSError, ValueError, TypeError):
            pass
        if self.vendor=='huawei_bng': defaults['preferred_transport']='ssh'
        return defaults

    def save(self, config, *, successful_host=None):
        from apps.access_manager.infrastructure.common.endpoint import normalize_ssh_target
        with self.lock:
            current = self.read()
            for name in (('ssh_port',) if self.vendor=='huawei_bng' else ('ssh_port','netconf_port')):
                if name in config:
                    _, port = normalize_ssh_target('example.invalid', config[name])
                    if port is None: raise ValueError('Porta obrigatória.')
                    current[name] = port
            if 'preferred_transport' in config:
                if config['preferred_transport'] not in ({'ssh'} if self.vendor=='huawei_bng' else {'ssh','netconf','auto'}):
                    raise ValueError('Transporte inválido.')
                current['preferred_transport'] = config['preferred_transport']
            if 'default_host' in config:
                current['default_host'] = normalize_ssh_target(config['default_host'], None)[0] if config['default_host'] else ''
            if successful_host is not None:
                current['last_successful_host'] = normalize_ssh_target(successful_host, None)[0]
            self.path.parent.mkdir(parents=True, exist_ok=True)
            temporary = self.path.with_suffix('.tmp')
            temporary.write_text(json.dumps(current, indent=2)+'\n')
            temporary.replace(self.path)
            return current
