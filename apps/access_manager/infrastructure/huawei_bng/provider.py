"""Huawei BNG provider: focused reads only; no subscriber inventory fallback."""
from collections import deque
import time
import logging
from apps.access_manager.domain.capabilities import Capability, CapabilitySet, SupportStatus as S, EvidenceLevel as E
from apps.access_manager.domain.subscribers import SubscriberQuery
from . import parsers
from .commands import request
from .transport import HuaweiBngTransport
from .errors import BngError


class HuaweiNetEngineBngProvider:
    vendor = 'huawei_bng'

    def __init__(self, transport_factory=HuaweiBngTransport):
        self.transport_factory=transport_factory
        self.transport=None
        self.host=self.model=self.firmware=None
        self._facts={}
        self._caps=CapabilitySet()
        self._operations=deque(maxlen=100)
        self.feature_states={}

    @property
    def connected(self): return bool(self.transport and self.transport.connected)

    @property
    def capabilities(self): return self._caps

    def _read(self, feature, parser, value=None):
        if not self.connected: raise BngError('SSH_UNAVAILABLE')
        logging.getLogger(__name__).info('infrastructure_read vendor=huawei_bng feature=%s transport=vrp_ssh',feature)
        started=time.monotonic()
        status='UNKNOWN'
        failure=None
        try:
            result=parser(self.transport.execute(request(feature,value)))
            status='SUPPORTED'
            return result
        except BngError as error:
            failure=error
            status=error.code
            raise
        finally:
            self.feature_states[feature]=status
            capname='device' if feature=='system' else feature
            if status in {'PERMISSION_DENIED','UNSUPPORTED','REQUIRES_PRIVILEGED_MODE'}:
                caps={name:self._caps.get(name) for name in self._caps.public()}
                caps[capname]=Capability(capname,S(status),S.UNSUPPORTED,E.FIXTURE_VALIDATED,source='runtime_result')
                self._caps=CapabilitySet(caps.values())
            self._operations.append({'feature':feature,'status':status,
                'elapsed_ms':round((time.monotonic()-started)*1000,2),'timestamp':time.time(),
                'stage':getattr(failure,'stage',None)})

    def connect(self, host, username, password, *, port=None, ssh_port=22, **options):
        from apps.access_manager.infrastructure.common.endpoint import normalize_ssh_target
        host, port=normalize_ssh_target(host, port, default_port=ssh_port)
        self.disconnect()
        self.transport=self.transport_factory()
        try:
            self.transport.connect(host,username,password,port=port)
            self.host=host
            self._read('health',parsers.clock)
            if hasattr(self.transport,'states'): self.transport.states.append('CONNECTED')
            try:
                self._facts=self._read('system',parsers.system)
            except BngError:
                if not self.connected: raise
                self._facts={'validation':'PHYSICAL_VALIDATION_PENDING'}
            self.model=self._facts.get('model');self.firmware=self._facts.get('firmware')
            self._caps=CapabilitySet(Capability(name,S.PARTIAL,S.UNSUPPORTED,E.FIXTURE_VALIDATED,
                source='PHYSICAL_VALIDATION_PENDING') for name in ('device','subscriber_lookup','subscriber_detail'))
            return {**self._facts,'protocol_family':'vrp_ssh','mode':'partial'}
        except Exception:
            self.disconnect()
            raise

    def connection_metadata(self):
        return {'device_role':'infrastructure','scheme':'ssh',
                'connection_states':list(getattr(self.transport,'states',[])),
                'facts_status':self.feature_states.get('system','UNKNOWN'),
                'transport_active':self.connected}

    def get_system(self): return {**self._facts,'feature_states':dict(self.feature_states)}
    def get_device_info(self): return self.get_system()

    def lookup_subscribers(self, query):
        q=SubscriberQuery.parse(query)
        rows=[];results=[]
        for candidate in q.candidates:
            try:
                if q.kind not in {'PPPOE_USERNAME','CONTRACT_NUMBER','USER_ID'}:
                    raise BngError('PHYSICAL_VALIDATION_PENDING')
                row=self._read('subscriber_detail' if q.kind=='USER_ID' else 'subscriber_lookup',parsers.subscriber,candidate)
                if (q.kind=='USER_ID' and row['user_id']!=candidate) or (q.kind!='USER_ID' and row['username']!=candidate):
                    raise BngError('IDENTITY_MISMATCH')
                rows.append(row)
                results.append({'candidate':candidate,'status':'FOUND'})
            except BngError as error:
                results.append({'candidate':candidate,'status':'UNKNOWN','code':error.code})
        return {'query':q.value,'query_type':q.kind,'sessions':rows,'candidates':results,
                'complete':all(r['status']=='FOUND' for r in results),'status':'FOUND' if rows else 'UNKNOWN'}

    def get_subscriber(self, session_id):
        row=self._read('subscriber_detail',parsers.subscriber,session_id)
        if row['user_id']!=str(session_id): raise BngError('IDENTITY_MISMATCH')
        return row

    def get_operation_log(self): return list(self._operations)

    def disconnect(self):
        if self.transport: self.transport.close()
        self.transport=None
        self.host=self.model=self.firmware=None
        self._facts={};self._caps=CapabilitySet();self.feature_states={};self._operations.clear()

    def _pending(self): raise BngError('PHYSICAL_VALIDATION_PENDING')
    def get_interfaces(self): return self._pending()
    def get_interface(self,name): return self._pending()
    def get_health(self,config): return self._pending()
    def diagnostic(self,config): return self._pending()
    def get_link(self,config): return self._pending()
    def get_chassis(self): return self._pending()
    def get_resources(self): return self._pending()
    def subscriber_context(self,config): return self._pending()
