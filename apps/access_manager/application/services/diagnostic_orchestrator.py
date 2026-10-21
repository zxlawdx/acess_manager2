"""Single bounded diagnostic queue; reuses provider sessions and existing triage.

CPE data is read only after a verified subscriber-to-CPE handoff. Sources use
separate locks, never multiple polling loops for the same ONT. No active probes.
"""
from collections import OrderedDict
from concurrent.futures import ThreadPoolExecutor, wait
from copy import deepcopy
from datetime import datetime, timezone
from threading import Event, RLock
import time
import logging
from uuid import uuid4
from apps.access_manager.domain.subscribers import SubscriberQuery
from apps.access_manager.domain.triage import evaluate_snapshot
from apps.access_manager.application.queries.device import DeviceQueryBus
from .full_diagnostic import safe_sections


def now(): return datetime.now(timezone.utc).isoformat()


class DiagnosticOrchestrator:
    def __init__(self, sessions):
        self.sessions=sessions
        self.lock=RLock()
        self.jobs=OrderedDict()
        self.pool=ThreadPoolExecutor(max_workers=1,thread_name_prefix='diagnostic')
        self.sources=ThreadPoolExecutor(max_workers=2,thread_name_prefix='diagnostic-source')
        self.cache={}
        from .subscriber_observations import SubscriberObservations
        self.observations=SubscriberObservations()

    def start(self, query):
        parsed=SubscriberQuery.parse(query)
        query=('user-id:' if parsed.kind=='USER_ID' else 'serial:' if parsed.kind=='ONT_SERIAL' else '')+parsed.value
        with self.lock:
            # Do not enqueue work behind a source still unwinding a timeout.
            for job in self.jobs.values():
                if not job['finished']:
                    if job['query']==query: return self._public(job)
                    raise RuntimeError('Já existe um diagnóstico em execução.')
            identity=uuid4().hex
            job={'id':identity,'query':query,'status':'RUNNING','started_at':now(),
                 'events':[],'sources':{},'result':None,'finished':False,'cancel':Event()}
            self.jobs[identity]=job
            while len(self.jobs)>20: self.jobs.popitem(last=False)
            self.pool.submit(self._run,job)
            return self._public(job)

    def _public(self, job):
        return deepcopy({k:v for k,v in job.items() if k!='cancel'})

    def progress(self, identity):
        with self.lock: return self._public(self.jobs[identity])

    def cancel(self, identity):
        with self.lock: self.jobs[identity]['cancel'].set()
        return self.progress(identity)

    def _event(self, job, source, status, data=None):
        with self.lock:
            logging.getLogger(__name__).info('diagnostic.source id=%s source=%s status=%s',job['id'],source,status)
            job['events'].append({'source':source,'status':status,'timestamp':now()})
            job['sources'][source]={'status':status,'timestamp':now(),'data':data}

    def _bng(self, job):
        manager=self.sessions.infrastructure
        with manager.operation_lock:
            if job['cancel'].is_set(): return
            if manager.session is None:
                self._event(job,'bng','UNKNOWN'); return
            key=(manager.session.session_id,job['query'])
            cached=self.cache.get(key)
            if cached and time.monotonic()-cached[0]<4:
                self._event(job,'bng','CACHED',deepcopy(cached[1])); return
            result=manager.provider.lookup_subscribers(job['query'])
            result['app_session_id']=manager.session.session_id
            result['observed_at']=now()
            result['provider']=manager.provider.vendor
            self.cache={key:(time.monotonic(),deepcopy(result))}
            self._event(job,'bng','OK' if result.get('complete') else 'PARTIAL',result)

    def _cpe(self, job):
        manager=self.sessions.devices
        # Pair against a handoff verified from the BNG session, not merely the
        # fact that an unrelated device happens to be connected in the app.
        with self.sessions.operation_lock, manager.operation_lock:
            context=self.sessions.context or {}
            bng=job['sources'].get('bng',{}).get('data') or {}
            matches=[r for r in bng.get('sessions',[]) if r.get('username')==context.get('subscriber_username')
                     and r.get('session_id')==context.get('subscriber_session_id')]
            if manager.session is None or not matches or context.get('app_session_id')!=bng.get('app_session_id'):
                self._event(job,'cpe','UNKNOWN');return
            from urllib.parse import urlsplit
            target=urlsplit('//'+manager.session.host).hostname
            if target!=matches[0].get('ipv4_address'):
                self._event(job,'cpe','UNKNOWN');return
            bus=DeviceQueryBus(manager)
            sections={};errors={}
            for name, method in (('system','device'),('optical','optical'),('wan','wan'),('lan','lan'),('clients','clients'),('dns','dns')):
                if job['cancel'].is_set(): break
                try: sections[name]=getattr(bus,method)()
                except Exception: errors[name]='UNKNOWN'
            clean=safe_sections(sections)
            clean['device']=clean.pop('system',{})
            clean['errors']=errors
            self._event(job,'cpe','PARTIAL' if errors else 'OK',clean)

    def _source(self, job, name, fn):
        try: fn(job)
        except Exception as error:
            from apps.access_manager.infrastructure.huawei_bng.errors import BngError
            self._event(job,name,error.code if isinstance(error,BngError) else 'UNKNOWN')

    def _run(self, job):
        deadline=time.monotonic()+25
        futures=[]
        try:
            # Subscriber identity is a dependency; independent future sources
            # can be scheduled on the two-worker pool after this first read.
            future=self.sources.submit(self._source,job,'bng',self._bng)
            futures.append(future)
            done,_=wait([future],timeout=max(0,deadline-time.monotonic()))
            if not done:
                job['cancel'].set();self._event(job,'bng','TIMEOUT')
            elif not job['cancel'].is_set():
                future=self.sources.submit(self._source,job,'cpe',self._cpe)
                futures.append(future)
                done,_=wait([future],timeout=max(0,deadline-time.monotonic()))
                if not done:
                    job['cancel'].set();self._event(job,'cpe','TIMEOUT')
            with self.lock:
                snapshot=deepcopy(job['sources'].get('cpe',{}).get('data') or {})
                bng=deepcopy(job['sources'].get('bng',{}).get('data') or {})
            rows=bng.get('sessions',[])
            snapshot['subscriber']=rows[0] if len(rows)==1 else None
            snapshot['source_revision']=job['id']
            snapshot['subscriber_observed_at']=bng.get('observed_at')
            observation={'history':[],'incident':None}
            if snapshot['subscriber']:
                observation=self.observations.observe(snapshot['subscriber'],source=bng.get('app_session_id'))
            snapshot['incident']=observation['incident']
            snapshot['subscriber_history']=observation['history']
            snapshot['errors']={**snapshot.get('errors',{}),**{k:v['status'] for k,v in job['sources'].items() if v['status'] not in {'OK','CACHED'}}}
            triage=evaluate_snapshot(snapshot).public()
            technical='\n'.join([i['title']+'. '+(i.get('suggested_action') or '') for i in triage['issues']]) or 'Dados insuficientes para localizar a falha.'
            with self.lock:
                job['result']={'snapshot':snapshot,'triage':triage,'attendance':{'technical':technical,
                    'customer':'A análise está parcial; precisamos validar os pontos indicados no atendimento.' if triage['partial'] else technical}}
                job['status']='CANCELLED' if job['cancel'].is_set() else 'COMPLETE'
        except Exception:
            with self.lock: job['status']='ERROR'
        finally:
            # Preserve boundedness even when a legacy CPE reader cannot yet
            # cancel an in-flight request. No second job may race that reader.
            wait(futures)
            with self.lock: job['finished']=True
