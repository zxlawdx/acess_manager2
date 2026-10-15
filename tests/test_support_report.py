from copy import deepcopy
from threading import RLock
from types import SimpleNamespace
import json
import logging
import pytest
from apps.access_manager.domain.triage import evaluate, rssi_quality, speed, compare
from apps.access_manager.domain.capabilities import Capability, CapabilitySet, SupportStatus as S
from apps.access_manager.infrastructure.history import HistoryRepository
from apps.access_manager.infrastructure.support_reports import SupportReportRepository
from apps.access_manager.application.services.support_report import SupportReportService
from apps.access_manager.application.commands.device import DeviceCommandBus
from apps.access_manager.application.queries.device import DeviceQueryBus


@pytest.mark.parametrize('value,quality',[(-50,'excellent'),(-55,'excellent'),(-56,'good'),(-67,'good'),(-68,'attention'),(-74,'attention'),(-75,'weak'),(-79,'weak'),(-80,'critical'),(None,'unknown')])
def test_rssi(value,quality): assert rssi_quality(value)==quality

@pytest.mark.parametrize('value,expected',[('10M',10**7),('100M',10**8),('1000M',10**9),('1G',10**9),('2.5 Gbps',2500000000),('5G',5*10**9),('10G',10**10),('unknown',None)])
def test_speed(value,expected):
    result=speed(value);assert result['speed_bps']==expected;assert result['raw']==value

@pytest.mark.parametrize('rx,status',[(-18,'ok'),(-25,'warning'),(-30,'critical')])
def test_optical_limits(rx,status):
    data=evaluate({'optical':{'rx_dbm':rx,'thresholds':{'critical_low':-28,'warning_low':-24}}})
    assert data['optical']['classification']==status

def test_optical_unsupported_unknown_and_priority():
    assert evaluate({'optical':{'capability':'UNSUPPORTED'}})['findings']==[]
    assert evaluate({'optical':{'rx_dbm':-50}})['findings']==[]
    assert evaluate({'optical':{'rx_dbm':-30,'thresholds':{'critical_low':-35}}}, {'optical':{'critical_low':-28}})['optical']['classification']=='ok'
    assert evaluate({'optical':{'los':True}})['visit_suggestion']

def test_lan_findings_need_expected_speed_and_actual_half():
    ports=[{'id':'1','link':'up','speed':'1G','duplex':'Full','expected_speed_bps':10**9}, {'id':'2','link':'up','speed':'100M','expected_speed_bps':10**9}, {'id':'3','link':'up','speed':'100M','duplex':'Half'}, {'id':'4','link':'down','speed':'10M','expected_speed_bps':10**9}]
    result=evaluate({'ethernet':ports})
    assert [(f['code'],f['subject']) for f in result['findings']]==[('ETHERNET_NEGOTIATION_LOW','2'),('ETHERNET_HALF_DUPLEX','3')]
    assert not evaluate({'ethernet':[{'link':'up','speed':'100M'}]})['findings']

def test_same_hostname_clients_are_compared_by_mac():
    before={'wifi':{'clients':[{'hostname':'same','mac':'aa:bb:cc:dd:ee:01','rssi':-78},{'hostname':'same','mac':'aa:bb:cc:dd:ee:02','rssi':-50}]}}
    after=deepcopy(before);after['wifi']['clients'][0]['rssi']=-66
    assert len(compare(before,after))==1
    assert compare(before,after)[0]['subject']=='aabbccddee01'

class Provider:
    vendor='zte'
    wifi_password_read_status='SUPPORTED'
    def __init__(self):
        self.passwords={'1':'SECRET_OLD_123','5':'OTHER_OLD_123'}
        self.masked=False;self.unavailable=False;self.fail=False;self.writes=0
        self.capabilities=CapabilitySet([Capability(n,S.SUPPORTED,S.SUPPORTED) for n in ('device','clients','wifi','wifi_radio','lan','wan','dhcp','dns','optical','diagnostics')])
    def get_device_info(self): return {'model':'test','password':'ADMIN_SECRET','csrf':'TOKEN_SECRET'}
    def get_clients(self): return [{'mac':'aa:bb:cc:dd:ee:01','hostname':'same','rssi':-76,'connection_type':'Wi-Fi'},{'mac':'aa:bb:cc:dd:ee:02','hostname':'same','rssi':-50,'connection_type':'Wi-Fi'}]
    def get_wifi_networks(self,reveal_password=False):
        return [dict(id=k,ssid='Home-'+k,band='2.4GHz' if k=='1' else '5GHz',password=None if self.unavailable else '********' if self.masked or not reveal_password else v,password_hidden=not reveal_password) for k,v in self.passwords.items()]
    def set_ssid_config(self,ssid_id,config):
        self.writes+=1
        if self.fail: raise ValueError('Write failed')
        self.passwords[ssid_id]=config.get('password',self.passwords[ssid_id]);return {'success':True,'verified':False}
    def get_lan(self): return [{'id':'1','link':'up','speed':'1G','duplex':'Full'}]
    def get_wan(self): return [{'status':'Online','ip':'192.0.2.1','password':'ADMIN_SECRET'}]
    def get_dhcp(self): return {'enabled':True,'pool_start':'192.168.1.10','pool_end':'192.168.1.99'}
    def get_dns(self): return {'ipv4_1':'1.1.1.1','hosts':[]}
    def get_optical(self): return {'rx':-18}
    def ping(self,config): return {'sent':4,'received':4}

@pytest.fixture
def workflow(tmp_path):
    history=HistoryRepository(tmp_path/'operations.sqlite3');p=Provider()
    session=SimpleNamespace(session_id='test',host='192.0.2.1',vendor=SimpleNamespace(value='zte'),model='test',firmware='1',attendant='Ana',metadata={})
    sessions=SimpleNamespace(provider=p,session=session,history=history,_history_session=None,operation_lock=RLock())
    q=DeviceQueryBus(sessions);c=DeviceCommandBus(sessions);service=SupportReportService(sessions,q,SupportReportRepository(history))
    q.support_reports=c.support_reports=service
    return service,c,q,p,sessions

def test_initial_current_final_and_manual_result(workflow):
    service,c,q,p,sessions=workflow
    first=service.start({});initial=deepcopy(first['initial_snapshot'])
    c.ping({'host':'example.invalid'});c.set_ssid('1',{'ssid':'new'})
    service.note({'text':'Observação do atendente'})
    with pytest.raises(ValueError): service.finish({})
    done=service.finish({'result':'partially_resolved'})
    assert done['initial_snapshot']==initial
    assert done['final_snapshot'] and done['current_snapshot']==done['final_snapshot']
    assert done['result']=='partially_resolved'
    assert any(e['type']=='diagnostic' for e in done['events'])
    assert any(e['type']=='configuration_change' for e in done['events'])
    assert done['notes'][0]['source']=='attendant'
    assert service.active() is None

@pytest.mark.parametrize('masked,unavailable,status',[(False,False,'SUPPORTED'),(True,False,'MASKED_BY_DEVICE'),(False,True,'UNAVAILABLE')])
def test_wifi_history_and_exports_no_other_secrets(workflow,masked,unavailable,status,caplog):
    service,c,q,p,sessions=workflow
    caplog.set_level(logging.DEBUG)
    service.start({});p.masked=masked;p.unavailable=unavailable
    c.set_ssid('1',{'password':'SECRET_NEW_456'})
    raw=service.repository.get(app_session_id='test');event=next(e for e in raw['events'] if e['type']=='wifi_password_change')
    assert event['old_password_status']==status
    assert event['old_password']==('SECRET_OLD_123' if status=='SUPPORTED' else None)
    assert event['new_password']=='SECRET_NEW_456'
    assert event['verified']==(status=='SUPPORTED')
    public=json.dumps(service.detail());assert 'SECRET_NEW_456' not in public
    credentials=service.credentials(raw['id'],event['id']);assert credentials['new_password']=='SECRET_NEW_456'
    for fmt in ('txt','json','html'):
        content=service.export({'id':raw['id'],'format':fmt})['content']
        assert 'SECRET_NEW_456' in content
        if status=='SUPPORTED': assert 'SECRET_OLD_123' in content
        assert 'ADMIN_SECRET' not in content and 'TOKEN_SECRET' not in content
    for secret in ('SECRET_OLD_123','SECRET_NEW_456','ADMIN_SECRET','TOKEN_SECRET'):
        assert secret not in caplog.text and secret not in repr(service)
        assert secret not in json.dumps(sessions.history.recent())
    assert 'SECRET' not in json.dumps(service.repository.recent())
    assert p.writes==1
    # Generic events reference the credential event; full passphrases occur once each.
    encoded=json.dumps(raw);assert encoded.count('SECRET_NEW_456')==1

def test_multiple_ssids_and_failed_write_do_not_claim_password_applied(workflow):
    service,c,q,p,sessions=workflow;service.start({})
    c.set_ssid('1',{'password':'NEW_24_TEST'});c.set_ssid('5',{'password':'NEW_5_TEST'})
    p.fail=True
    with pytest.raises(RuntimeError):c.set_ssid('1',{'password':'FAILED_NEW_TEST'})
    events=[e for e in service.repository.get(app_session_id='test')['events'] if e['type']=='wifi_password_change']
    assert [(e['ssid_id'],e['band'],e['new_password']) for e in events[:2]]==[('1','2.4GHz','NEW_24_TEST'),('5','5GHz','NEW_5_TEST')]
    assert events[1]['old_password']=='OTHER_OLD_123'
    assert events[2]['status']=='failed' and events[2]['new_password'] is None and not events[2]['verified']

def test_unknown_reader_never_attempts_reveal(workflow):
    service,c,q,p,sessions=workflow;service.start({});p.wifi_password_read_status='UNKNOWN'
    c.set_ssid('1',{'password':'SECRET_NEW_456'})
    e=next(e for e in service.repository.get(app_session_id='test')['events'] if e['type']=='wifi_password_change')
    assert e['old_password'] is None and e['old_password_status']=='UNAVAILABLE' and not e['verified']

def test_binding_and_reopening_and_html_escape(workflow):
    service,c,q,p,sessions=workflow;first=service.start({})
    c.set_ssid('1',{'password':'<script>alert(1)</script>'})
    html=service.export({'id':first['id'],'format':'html'})['content']
    assert '<script>' not in html and '&lt;script&gt;' in html
    sessions.session.session_id='other';assert service.active() is None
    assert service.detail(first['id'])['id']==first['id']
    reopened=SupportReportService(sessions,q,service.repository)
    assert reopened.detail(first['id'])['id']==first['id']

def test_meaningful_reads_are_coalesced_and_collect_does_not_flood(workflow):
    service,c,q,p,sessions=workflow;service.start({})
    initial=len(service.active()['events']);q.optical();q.optical()
    assert len(service.active()['events'])==initial
    service.refresh();assert len(service.active()['events'])==initial+1


def test_credential_domain_repr_and_exception_are_safe(workflow,caplog):
    service,c,q,p,sessions=workflow;service.start({})
    def fail(ssid_id, config): raise ValueError(config['password'])
    p.set_ssid_config=fail
    with pytest.raises(RuntimeError) as error: c.set_ssid('1',{'password':'SECRET_NEW_456'})
    assert 'SECRET_NEW_456' not in str(error.value)
    assert 'SECRET_OLD_123' not in repr(service.repository.get(app_session_id='test'))
    assert 'SECRET_OLD_123' not in caplog.text


def test_juniper_triage_is_bng_not_ont(workflow):
    service,c,q,p,sessions=workflow
    sessions.session.vendor.value='juniper';p.vendor='juniper'
    p.get_juniper_system=lambda:{'model':'mx204'}
    p.get_juniper_interfaces=lambda:[]
    p.capabilities=CapabilitySet([Capability(n,S.SUPPORTED) for n in ('device','juniper_interfaces')])
    result=service.triage.collect()
    assert result['kind']=='bng'
    assert result['optical']=={'capability':'UNSUPPORTED'}
    assert result['wifi']=={'capability':'UNSUPPORTED'}
    assert not result['findings']


def test_configured_snr_resources_and_partial_are_not_implicit_faults():
    data={'wifi':{'clients':[{'mac':'aa:bb:cc:dd:ee:01','rssi':-50,'snr':10}]},'resources':{'cpu_percent':95,'memory_percent':96,'temperature_c':80}}
    assert evaluate(data)['findings']==[]
    findings=evaluate(data,{'snr_warning':20,'cpu_warning':90,'memory_warning':90,'temperature_warning':75})['findings']
    assert {f['code'] for f in findings}=={'WIFI_LOW_SNR','DEVICE_HIGH_CPU','DEVICE_HIGH_MEMORY','DEVICE_HIGH_TEMPERATURE'}
    assert evaluate({'unavailable':{'wan':'UNKNOWN'}})['status']=='partial'


def test_wrong_report_cannot_finish_or_add_note_to_active_session(workflow):
    service,c,q,p,sessions=workflow;service.start({})
    with pytest.raises(ValueError):service.finish({'id':'wrong','result':'resolved'})
    with pytest.raises(ValueError):service.note({'id':'wrong','text':'note'})
    assert service.active()['status']=='active'


def test_unrecognized_threshold_shape_does_not_classify_rx_as_normal():
    result=evaluate({'optical':{'rx_dbm':-18,'thresholds':{'unknown_firmware_field':-24}}})
    assert result['optical']['classification']=='unknown'
    assert result['findings']==[]
