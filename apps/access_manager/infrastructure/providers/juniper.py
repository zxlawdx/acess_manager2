"""Infrastructure provider for Junos; no dependency on CPE protocol surfaces."""
import logging
import ipaddress
import time
from urllib.parse import urlsplit
from apps.access_manager.domain.capabilities import Capability,CapabilitySet,SupportStatus as S,EvidenceLevel as E
from apps.access_manager.domain.subscribers import SubscriberQuery
from apps.access_manager.infrastructure.juniper import parsers
from apps.access_manager.infrastructure.juniper.transport import JuniperTransport
from apps.access_manager.infrastructure.juniper.requests import request,identifier
from apps.access_manager.infrastructure.juniper.errors import JuniperError

logger=logging.getLogger(__name__)

class JuniperProvider:
    vendor='juniper'
    def __init__(self,transport_factory=JuniperTransport):
        self.transport_factory=transport_factory;self.transport=None;self.host=None;self.model=None;self.firmware=None
        self._facts={};self._caps=CapabilitySet();self._evidence={}
    @property
    def connected(self):return self.transport is not None and self.transport.connected
    @property
    def capabilities(self):return self._caps
    def _set_cap(self,name,status,*,source=None):
        caps={key:self._caps.get(key) for key in self._caps.public()}
        caps[name]=Capability(name,status,S.UNKNOWN,E.FIXTURE_VALIDATED if status==S.SUPPORTED else E.RESEARCH_ONLY,source=source or 'junos_runtime_shape')
        self._caps=CapabilitySet(caps.values())
    def _read(self,feature,parser,*,value=None,timeout=None):
        if not self.connected:raise JuniperError('SSH_UNAVAILABLE')
        try:
            result=parser(self.transport.execute(request(feature,value=value),timeout=timeout))
            self._evidence[feature]={'status':'validated','format':'xml'}
            return result
        except JuniperError as error:
            self._evidence[feature]={'status':'ERROR_THIS_RUN','code':error.code}
            logger.info('juniper.rpc.error feature=%s code=%s',feature,error.code)
            raise
    @staticmethod
    def target(host,port):
        text=str(host or '').strip()
        if not text or len(text)>253 or any(c in text for c in '\r\n /@;|&<>`$'):raise ValueError('Host Juniper inválido.')
        try:ipaddress.ip_address(text);hostname=text
        except ValueError:
            parsed=urlsplit('ssh://'+text)
            hostname=parsed.hostname
            if not hostname:raise ValueError('Host Juniper inválido.')
            if parsed.port is not None:
                if port not in (None,''):raise ValueError('Informe a porta em apenas um campo.')
                port=parsed.port
        if port not in (None,''):
            try:port=int(port)
            except (TypeError,ValueError):raise ValueError('Porta inválida.') from None
            if not 1<=port<=65535:raise ValueError('Porta inválida.')
        return hostname,port or None
    def connect(self,host,username,password,*,transport='netconf',port=None,**_):
        self.disconnect();host,port=self.target(host,port)
        client=self.transport_factory()
        try:
            logger.info('juniper.connect transport=%s',transport)
            client.connect(host,username,password,mode=transport,port=port)
            self.transport=client;self.host=host
            self._facts=self._read('facts',parsers.facts)
            self.model=self._facts['model'];self.firmware=self._facts['firmware']
            for name in ('device','juniper_uptime','juniper_interfaces','juniper_interface','juniper_chassis','juniper_aaa','juniper_pppoe','juniper_ping','juniper_traceroute','juniper_resources','subscriber_lookup','subscriber_detail','subscriber_count'):
                self._set_cap(name,S.SUPPORTED if name=='device' else S.PARTIAL)
            for name in ('subscriber_disconnect','subscriber_reconnect'):
                self._set_cap(name,S.UNKNOWN,source='mutation_not_validated')
            try:self._facts['uptime_seconds']=self._read('uptime',parsers.uptime);self._set_cap('juniper_uptime',S.SUPPORTED)
            except JuniperError:pass
            # A bounded aggregate count, never a subscriber inventory dump.
            if self._facts['family']=='MX':
                try:
                    root=self._read('subscriber_probe',parsers.parse)
                    parsers.require(root,'subscribers-summary','subscribers-information','subscriber-information','subscriber-summary-information')
                    self._set_cap('subscriber_count',S.SUPPORTED)
                except JuniperError as error:
                    if error.code=='PERMISSION_DENIED':self._evidence['subscriber_lookup']={'status':'SUPPORTED_BUT_FORBIDDEN','code':error.code}
            logger.info('juniper.detect family=%s',self._facts['family'])
            return {'vendor':'juniper','model':self.model,'firmware':self.firmware,'protocol_family':'junos_'+client.kind,'mode':'partial'}
        except Exception:
            client.close();self.transport=None;self._facts={};self._caps=CapabilitySet();raise
    def connection_metadata(self):
        return {'scheme':self.transport.kind if self.transport else None,'device_role':'infrastructure',
                'family':self._facts.get('family'),'junos_os':self._facts.get('os'),
                'connection_states':['AUTHENTICATED','IDENTIFIED','READY'] if self.connected else []}
    def get_device_info(self):return dict(self._facts)
    def get_juniper_system(self):
        result=dict(self._facts)
        try:result['uptime_seconds']=self._read('uptime',parsers.uptime)
        except JuniperError:pass
        result['capabilities']=self.capabilities.public();result['evidence']=dict(self._evidence)
        return result
    def lookup_subscribers(self,query):
        q=SubscriberQuery.parse(query);deadline=time.monotonic()+getattr(getattr(self.transport,'timeouts',None),'lookup',24);results=[];sessions=[]
        for candidate in q.candidates:
            try:
                left=deadline-time.monotonic()
                if left<=0:raise JuniperError('CONNECTION_TIMEOUT')
                feature='subscriber_address' if q.kind in {'IPV4','IPV6'} else 'subscriber_username'
                rows=self._read(feature,parsers.subscribers,value=candidate,timeout=left)
                # If a firmware ignores its username filter, don't expose or
                # aggregate other customers from the returned payload.
                if feature=='subscriber_username':
                    if any(row['username']!=candidate for row in rows):raise JuniperError('COMMAND_ERROR')
                else:rows=[row for row in rows if candidate in [row['ipv4_address'],*row['ipv6_addresses']]]
                results.append({'candidate':candidate,'status':'FOUND' if rows else 'NOT_FOUND','count':len(rows)})
                sessions.extend(rows);self._set_cap('subscriber_lookup',S.SUPPORTED)
            except JuniperError as error:
                results.append({'candidate':candidate,'status':'TIMEOUT' if error.code=='CONNECTION_TIMEOUT' else 'UNSUPPORTED' if error.code=='UNSUPPORTED_PLATFORM' else 'ERROR','code':error.code,'message':error.public_message})
        # Do not deduplicate by username: duplicate sessions are legitimate.
        complete=all(r['status'] in {'FOUND','NOT_FOUND'} for r in results)
        logger.info('juniper.subscriber.lookup candidates=%s sessions=%s complete=%s',len(results),len(sessions),complete)
        return {'query':q.value,'query_type':q.kind,'candidates':results,'sessions':sessions,'complete':complete,
                'status':'FOUND' if sessions else 'NOT_FOUND' if complete else 'ERROR'}
    def get_subscriber(self,session_id):
        identity=identifier(session_id,'session')
        rows=self._read('subscriber_detail',parsers.subscribers,value=identity)
        selected=[row for row in rows if row['session_id']==identity]
        if len(selected)!=1:raise JuniperError('STALE_SESSION' if selected else 'SUBSCRIBER_NOT_FOUND')
        self._set_cap('subscriber_detail',S.SUPPORTED);return selected[0]
    def subscriber_context(self,config):
        # Re-read the selected session before enriching; never apply an old
        # interface/AAA identifier to a replacement subscriber session.
        row=self.get_subscriber(config.get('session_id'))
        if config.get('username')!=row['username']:raise JuniperError('STALE_SESSION')
        kind=config.get('kind')
        if kind=='pppoe':value=row['interface'];parser=parsers.pppoe;cap='juniper_pppoe'
        elif kind=='aaa':value=row['session_id'];parser=parsers.aaa;cap='juniper_aaa'
        else:raise ValueError('Detalhe Juniper inválido.')
        data=self._read(kind,parser,value=value);self._set_cap(cap,S.SUPPORTED)
        return {'session_id':row['session_id'],'kind':kind,'data':data}
    def get_juniper_interfaces(self):
        rows=self._read('interfaces',parsers.interfaces);self._set_cap('juniper_interfaces',S.SUPPORTED);return rows
    def get_juniper_interface(self,name):
        rows=self._read('interface',parsers.interfaces,value=name);self._set_cap('juniper_interface',S.SUPPORTED);return rows
    def juniper_diagnostic(self,config):
        kind=config.get('kind')
        if kind not in {'ping','traceroute'}:raise ValueError('Diagnóstico Juniper inválido.')
        if self._facts.get('os')=='Junos OS Evolved' and config.get('routing_instance') and (kind=='ping' and config['routing_instance']!='mgmt_junos'):
            raise JuniperError('UNSUPPORTED_PLATFORM')
        result=self._read(kind,parsers.diagnostic,value=config)
        self._set_cap('juniper_'+kind,S.SUPPORTED)
        return {'kind':kind,'origin':'juniper','hostname':self._facts.get('hostname'),
                'target':config.get('target'),'routing_instance':config.get('routing_instance'),**result}
    def get_juniper_resources(self):
        result=self._read('resources',parsers.resources);self._set_cap('juniper_resources',S.SUPPORTED);return result
    def get_juniper_chassis(self):
        rows=self._read('chassis',parsers.chassis);self._set_cap('juniper_chassis',S.SUPPORTED);return rows
    def disconnect(self):
        if self.transport:self.transport.close()
        self.transport=None;self.host=None;self.model=None;self.firmware=None;self._facts={};self._evidence={};self._caps=CapabilitySet()
