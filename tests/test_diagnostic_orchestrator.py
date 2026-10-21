from threading import RLock, Event
from types import SimpleNamespace
import time
import pytest
from apps.access_manager.application.services.diagnostic_orchestrator import DiagnosticOrchestrator
from apps.access_manager.application.services.subscriber_observations import SubscriberObservations


def make(provider):
    manager=SimpleNamespace(operation_lock=RLock(),provider=provider,session=SimpleNamespace(session_id='infra-1'))
    sessions=SimpleNamespace(infrastructure=manager,devices=SimpleNamespace(operation_lock=RLock(),session=None),context=None,operation_lock=RLock())
    return DiagnosticOrchestrator(sessions)


def complete(service, identity):
    deadline=time.monotonic()+2
    while time.monotonic()<deadline:
        result=service.progress(identity)
        if result['finished']: return result
        time.sleep(.005)
    pytest.fail('diagnostic failed to complete')


def close(service):
    service.pool.shutdown(wait=True)
    service.sources.shutdown(wait=True)


def test_partial_source_preserves_bng_evidence_and_cache():
    class Provider:
        vendor='huawei_bng'
        calls=0
        def lookup_subscribers(self,query):
            self.calls+=1
            return {'sessions':[{'username':'brd_1','state':'ONLINE','ipv4_address':'100.64.0.1'}],'complete':True}
    provider=Provider();service=make(provider)
    try:
        first=complete(service,service.start('brd_1')['id'])
        assert first['result']['snapshot']['subscriber']['state']=='ONLINE'
        assert first['result']['triage']['partial']
        assert first['sources']['cpe']['status']=='UNKNOWN'
        second=complete(service,service.start('brd_1')['id'])
        assert provider.calls==1 and second['sources']['bng']['status']=='CACHED'
        assert first['result']['snapshot']['subscriber_observed_at']==second['result']['snapshot']['subscriber_observed_at']
    finally: close(service)


def test_failure_never_invents_offline():
    class Provider:
        def lookup_subscribers(self,query): raise RuntimeError('a secret must not appear')
    service=make(Provider())
    try:
        result=complete(service,service.start('brd_1')['id'])
        assert result['result']['snapshot']['subscriber'] is None
        assert 'secret' not in str(result)
        assert not result['result']['triage']['issues']
    finally: close(service)


def test_requests_deduplicate_and_reject_second_customer():
    gate=Event()
    class Provider:
        vendor='juniper'
        def lookup_subscribers(self,query):
            gate.wait(1)
            return {'sessions':[],'complete':False}
    service=make(Provider())
    try:
        first=service.start('brd_1')
        assert service.start('brd_1')['id']==first['id']
        with pytest.raises(RuntimeError): service.start('brd_2')
        service.cancel(first['id']);gate.set()
        assert complete(service,first['id'])['status']=='CANCELLED'
    finally: gate.set();close(service)


def test_local_correlation_counts_distinct_current_states_only():
    clock=[1000]
    observations=SubscriberObservations(lambda:clock[0])
    base={'state':'OFFLINE','outer_vlan':200}
    for _ in range(7): assert observations.observe({**base,'username':'one'},source='bng')['incident'] is None
    observations.observe({**base,'username':'two'},source='bng')
    result=observations.observe({**base,'username':'three'},source='bng')
    assert result['incident']['count']==3
    assert result['incident']['kind']=='INFERENCE'
    observations.observe({**base,'username':'one','state':'ONLINE'},source='bng')
    assert observations.observe({**base,'username':'three'},source='bng')['incident'] is None
    clock[0]+=400
    assert observations.observe({**base,'username':'four'},source='bng')['incident'] is None
