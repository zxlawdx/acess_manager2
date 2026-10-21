"""One infrastructure and one device session, sharing the existing bus interface."""
from threading import RLock
import ipaddress
import time
from apps.access_manager.infrastructure.juniper.errors import JuniperError


class InfrastructureSessions:
    def __init__(self, devices, infrastructure):
        self.devices = devices
        self.infrastructure = infrastructure
        self.credential = None
        self.active = devices
        self.operation_lock = RLock()
        self.context = None

    def __getattr__(self, name):
        return getattr(self.active, name)

    def set_credential(self, username, password):
        from apps.access_manager.domain.infrastructure import InfrastructureCredentialSession
        with self.operation_lock:
            if self.credential: self.credential.revoke()
            self.credential = InfrastructureCredentialSession(username,password)

    def revoke_credential(self):
        with self.operation_lock:
            if self.credential: self.credential.revoke()
            self.credential = None

    def connect_with_credential(self, host, **options):
        with self.operation_lock:
            if options.get('vendor') not in {'juniper','huawei_bng'} or self.credential is None:
                raise ValueError('Credencial de infraestrutura indisponível.')
            return self.credential.connect(self,host,**options)

    def connect(self, host, username, password, **options):
        with self.operation_lock:
            manager = self.infrastructure if options.get('vendor') in {'juniper','huawei_bng'} else self.devices
            result = manager.connect(host, username, password, **options)
            self.active = manager
            if manager is self.infrastructure:
                self.context = None
            return self.status()

    def disconnect(self):
        with self.operation_lock:
            self.active.disconnect()
            if self.active is self.infrastructure:
                self.context = None
                self.revoke_credential()
            other = self.devices if self.active is self.infrastructure else self.infrastructure
            if other.status()['connected']:
                self.active = other

    def status(self):
        return {**self.active.status(), 'infrastructure': self.infrastructure.status(),
                'device': self.devices.status(), 'subscriber_context': self.context}

    def select(self, kind):
        with self.operation_lock:
            manager = {'infrastructure': self.infrastructure, 'device': self.devices}.get(kind)
            if manager is None or not manager.status()['connected']:
                raise ValueError('Sessão indisponível.')
            self.active = manager
            return self.status()

    def draft(self, config):
        with self.operation_lock, self.infrastructure.operation_lock:
            status = self.infrastructure.status()
            if not status['connected'] or config.get('app_session_id') != status['session']['session_id']:
                raise JuniperError('STALE_SESSION')
            row = self.infrastructure.provider.get_subscriber(config.get('session_id'))
            if row['session_id'] != config.get('session_id') or row['username'] != config.get('username') or row['ipv4_address'] != config.get('ipv4_address'):
                raise JuniperError('STALE_SESSION')
            try:
                host = str(ipaddress.IPv4Address(row['ipv4_address']))
            except (ValueError, TypeError):
                raise ValueError('Assinante sem IPv4 de gerenciamento.') from None
            self.context = {'source': getattr(self.infrastructure.provider,'vendor','juniper') + '_subscriber', 'contract': row.get('contract'),
                            'subscriber_username': row['username'], 'subscriber_session_id': row['session_id'],
                            'host': host, 'port': 80, 'protocol': 'auto', 'vendor': 'auto',
                            'app_session_id': status['session']['session_id'], 'refreshed_at': time.time(),'reachability':'SUBSCRIBER_IP_RESOLVED'}
            return dict(self.context)

    def connect_cpe(self, config):
        with self.operation_lock:
            # The client cannot substitute a different subscriber between draft and login.
            draft = self.draft({'app_session_id': config.get('app_session_id'),
                                'session_id': config.get('subscriber_session_id'),
                                'username': config.get('subscriber_username'),
                                'ipv4_address': config.get('source_host')})
            port = config.get('port', 80)
            if isinstance(port, bool) or not str(port).isdigit() or not 1 <= int(port) <= 65535:
                raise ValueError('Porta inválida.')
            protocol = config.get('protocol', 'auto')
            vendor = config.get('vendor', 'auto')
            if protocol not in {'auto', 'http', 'https'} or vendor not in {'auto', 'huawei', 'zte'}:
                raise ValueError('Protocolo ou fabricante inválido.')
            host = draft['host']
            if config.get('edit_host'):
                host = str(ipaddress.IPv4Address(config.get('host')))
            https = protocol == 'https' or (protocol == 'auto' and int(port) == 443)
            return self.connect(f'{host}:{int(port)}', config.get('username', ''), config.get('password', ''),
                                https=https, vendor=None if vendor == 'auto' else vendor)

    def probe_cpe(self, config):
        import socket
        with self.operation_lock:
            draft=self.draft({'app_session_id':config.get('app_session_id'),
                              'session_id':config.get('subscriber_session_id'),
                              'username':config.get('subscriber_username'),
                              'ipv4_address':config.get('source_host')})
            port=config.get('port',80)
            if isinstance(port,bool) or not str(port).isdigit() or not 1<=int(port)<=65535:
                raise ValueError('Porta inválida.')
            host=str(ipaddress.IPv4Address(config.get('host'))) if config.get('edit_host') else draft['host']
            try:
                connection=socket.create_connection((host,int(port)),timeout=3)
                connection.close()
                return {'status':'CPE_PORT_REACHABLE','origin':'workstation','host':host,'port':int(port)}
            except OSError as error:
                reason='TIMEOUT' if isinstance(error,TimeoutError) else 'CONNECTION_REFUSED' if isinstance(error,ConnectionRefusedError) else 'NETWORK_ERROR'
                return {'status':'CPE_PORT_UNREACHABLE','origin':'workstation','host':host,'port':int(port),
                        'reason':reason,'subscriber_offline':None}
