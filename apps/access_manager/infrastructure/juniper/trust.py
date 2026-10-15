"""Explicit endpoint-scoped SSH trust; probing never authenticates a user."""
import base64
import hashlib
import socket
from threading import RLock
import paramiko
from apps.access_manager.runtime import data_dir
from .errors import JuniperError


class HostTrust:
    _lock = RLock()

    def __init__(self, path=None):
        self.path = path or data_dir() / 'juniper-known-hosts'

    @staticmethod
    def endpoint(host, port):
        # Always port-scoped, including port 22.
        return f'[{host}]:{port}'

    @staticmethod
    def fingerprint(key):
        return 'SHA256:' + base64.b64encode(hashlib.sha256(key.asbytes()).digest()).decode().rstrip('=')

    def keys(self):
        keys = paramiko.HostKeys()
        if self.path.exists(): keys.load(str(self.path))
        return keys

    def trusted(self, host, port):
        entry = self.keys().lookup(self.endpoint(host, port))
        return list(entry.values()) if entry else []

    def probe(self, host, port):
        from apps.access_manager.infrastructure.providers.juniper import JuniperProvider
        host, port = JuniperProvider.target(host, port)
        if port is None: raise ValueError('Informe a porta SSH.')
        connection = socket.create_connection((host, port), timeout=8)
        transport = paramiko.Transport(connection)
        try:
            transport.start_client(timeout=8)
            key = transport.get_remote_server_key()
            prior = self.trusted(host, port)
            matched = any(key == k for k in prior)
            return {'host': host, 'port': port, 'fingerprint': self.fingerprint(key),
                    'previous_fingerprints': [self.fingerprint(k) for k in prior],
                    'algorithm': key.get_name(),
                    'status': 'HOST_KEY_TRUSTED' if matched else 'HOST_KEY_CHANGED' if prior else 'HOST_KEY_UNKNOWN'}, key
        finally:
            transport.close()
            connection.close()

    def inspect(self, host, port):
        return self.probe(host, port)[0]

    def accept(self, config):
        if config.get('confirm') is not True: raise ValueError('Confirme a chave do servidor.')
        with self._lock:
            info, key = self.probe(config.get('host'), config.get('port'))
            if info['fingerprint'] != config.get('fingerprint') or info['previous_fingerprints'] != config.get('previous_fingerprints', []):
                raise JuniperError('HOST_KEY_UNTRUSTED')
            keys = self.keys()
            endpoint = self.endpoint(info['host'], info['port'])
            if endpoint in keys: del keys[endpoint]
            keys.add(endpoint, key.get_name(), key)
            self.path.parent.mkdir(parents=True, exist_ok=True)
            temporary = self.path.with_suffix('.tmp')
            keys.save(str(temporary))
            temporary.replace(self.path)
            return {**info, 'status': 'HOST_KEY_TRUSTED'}


class EndpointTrustPolicy(paramiko.RejectPolicy):
    def __init__(self, trust, host, port):
        self.trust, self.host, self.port = trust, host, port

    def missing_host_key(self, client, hostname, key):
        expected_keys=self.trust.trusted(self.host,self.port)
        if not any(key == expected for expected in expected_keys):
            raise JuniperError('HOST_KEY_CHANGED' if expected_keys else 'HOST_KEY_UNKNOWN')
