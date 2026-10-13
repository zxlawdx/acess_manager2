import json
from threading import RLock
from types import SimpleNamespace
import pytest
from apps.access_manager.application.services.full_diagnostic import FullDiagnosticService,build_alerts,rssi_quality
from apps.access_manager.infrastructure.history import HistoryRepository

@pytest.fixture(params=["huawei","zte"])
def setup(tmp_path,request):
    history=HistoryRepository(tmp_path/'diag.sqlite')
    session=SimpleNamespace(model='EG8041X6-10',vendor=SimpleNamespace(value=request.param),host='192.168.100.1')
    manager=SimpleNamespace(session=session,operation_lock=RLock(),_history_session=None)
    query=SimpleNamespace(device=lambda:{'model':session.model,'cpu_percent':0,'uptime_seconds':900,'password':'hidden'},wan=lambda:[{'gateway':'192.168.1.1'}],optical=lambda:{},wifi_ssids=lambda:[{'ssid':'Test','band':'5GHz','password':'hidden'}],wifi_radios=lambda:[{'band':'5GHz','channel':36}],clients=lambda:[{'band':'5GHz','rssi':-80,'snr':19}],lan=lambda:[],dhcp=lambda:{},dns=lambda:{},traffic=lambda:{'sources':[{'source':'wan','rx_mbps':10,'tx_mbps':None}]},mesh=lambda:{'nodes':[]},nat_sessions=lambda:{'active':12})
    calls=[]
    def ping(c):calls.append(c);return {'target':c['host'],'sent':4,'received':3,'loss_percent':25,'avg_ms':8,'advanced':{'cookie':'secret'}}
    commands=SimpleNamespace(ping=ping,dns_lookup=lambda c:{'addresses':['1.1.1.1'],'token':'secret'},traceroute=lambda c:{'hops':[{'number':1,'host':'192.168.1.1','latencies_ms':[1,2]},{'number':2,'timeout':True,'latencies_ms':[]}]})
    service=FullDiagnosticService(manager,query,commands,history,http_test=lambda:{'origin':'host_access_manager','status':'success','duration_ms':3,'target':'https://example.test'})
    return service,query,commands,calls,manager

def test_actual_buses_aggregate_persist_normalize_without_secrets(setup):
    service,q,c,calls,m=setup;r=service.run({})
    assert len(calls)==3 and calls[1]['host']=='192.168.1.1'
    assert r['latency_ms']==8 and r['packet_loss_percent']==25 and r['availability_percent'] is None
    assert r['wifi_quality']['label']=='Fraco' and r['wifi_quality']['avg_rssi']==-80
    assert r['traceroute'][1]['status']=='timeout' and r['traceroute'][1]['loss_percent'] is None
    assert r['resources']['cpu_percent']==0 and r['resources'].get('memory_percent') is None
    assert len(r['alerts'])==2 and r['history_id']
    assert service.history_rows({'hours':24})[0]['history_id']==r['history_id']
    exported=service.export({'id':r['history_id']})
    text=json.dumps(exported)
    for forbidden in ('password','cookie','token','session_id','authorization','hidden','secret'):assert forbidden not in text
    assert service.export({'id':r['history_id'],'format':'csv'})['content'].startswith('Data,Equipamento')

def test_partial_failures_keep_other_panels_and_unknown_is_not_failure(setup):
    service,q,c,_,_=setup
    def unsupported(*a):raise RuntimeError('Writer desconhecido')
    q.dhcp=unsupported;c.dns_lookup=unsupported
    r=service.run({})
    assert r['status']=='warning' # Measured packet loss still present.
    assert next(t for t in r['connectivity'] if t['id']=='dns')['status']=='unknown'
    assert r['resources']['cpu_percent']==0 and r['section_errors']['dhcp']

def test_retest_only_requested_test_no_full_reader_or_trace(setup):
    service,q,c,calls,_=setup
    q.device=lambda:pytest.fail('Retest must not collect system')
    c.traceroute=lambda c:pytest.fail('Retest must not trace')
    r=service.run({'test':'ping'})
    assert len(calls)==1 and len(r['connectivity'])==1 and r['test_type']=='ping'

def test_run_lock_invalid_targets_and_filter_validation(setup):
    service,*_=setup
    service.running.acquire()
    with pytest.raises(RuntimeError):service.run({})
    service.running.release()
    for config in ({'target':'x;rm'},{'test':'arbitrary'}):
        with pytest.raises(ValueError):service.run(config)
    with pytest.raises(ValueError):service.history_rows({'hours':2})
    with pytest.raises(ValueError):service.history_rows({'status':'unknown'})

def test_history_filters_scope_and_exports_do_not_cross_devices(setup):
    s,q,c,_,m=setup;r=s.run({})
    assert s.history_rows({'status':'success'})==[]
    assert s.history_rows({'status':'warning'})[0]['history_id']==r['history_id']
    m.session.host='192.168.100.2'
    assert s.history_rows({})==[]
    with pytest.raises(ValueError):s.export({'id':r['history_id']})

@pytest.mark.parametrize('value,label',[(None,None),(-50,'Excelente'),(-60,'Muito bom'),(-67,'Bom'),(-75,'Regular'),(-76,'Fraco')])
def test_rssi_rules(value,label):assert rssi_quality(value)==label

def test_alert_rules_absence_is_not_success():
    assert build_alerts({'wifi_quality':{},'connectivity':[]})==[]
    assert build_alerts({'packet_loss_percent':2,'wifi_quality':{'avg_rssi':-75}})==[]

def test_session_change_before_execution_cannot_operate_new_equipment(setup):
    service,q,c,calls,m=setup;m.session.session_id='new'
    with pytest.raises(ValueError):service.run({'session_id':'old'})
    assert calls==[]

def test_unknown_numbers_and_hops_never_become_zero_or_failure():
    from apps.access_manager.application.services.full_diagnostic import normalize_ping,normalize_hops
    p,status=normalize_ping({'loss_percent':'NaN','avg_ms':'-1'})
    assert p['loss_percent'] is None and p['avg_ms'] is None and status=='unknown'
    assert normalize_hops({'hops':[{'number':2,'timeout':True}]})[0]['status']=='timeout'

def test_http_runs_on_host_without_body_download_or_redirect(monkeypatch):
    from apps.access_manager.application.services import full_diagnostic as module
    calls=[]
    class Response:
        status_code=204
        def __enter__(self):return self
        def __exit__(self,*args):pass
    def get(url,**options):calls.append((url,options));return Response()
    monkeypatch.setattr(module.requests,'get',get)
    service=FullDiagnosticService(None,None,None,None)
    result=service._http()
    assert result['origin']=='host_access_manager' and result['status']=='success'
    assert calls[0][1]=={'stream':True,'timeout':(3,5),'allow_redirects':False}

def test_real_transport_error_is_failure_but_unsupported_stays_unknown(setup):
    service,q,c,_,_=setup
    def failed(*a):raise ConnectionError()
    c.ping=failed
    result=service.run({'test':'internet'})
    assert result['connectivity'][0]['status']=='failure'

def test_known_serial_history_does_not_mix_replacement_router_at_same_ip(setup):
    service,q,c,_,m=setup
    m.session.metadata={'device_identity':'ONT-A'}
    first=service.run({});assert service.history_rows({})[0]['history_id']==first['history_id']
    m.session.metadata['device_identity']='ONT-B'
    assert service.history_rows({})==[]
    with pytest.raises(ValueError):service.export({'id':first['history_id']})
