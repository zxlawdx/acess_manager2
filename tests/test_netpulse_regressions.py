from types import SimpleNamespace
from threading import RLock
import pytest
from apps.access_manager.domain.clients import merge_clients
from apps.access_manager.domain.diagnostics import normalize_diagnostic
from apps.access_manager.application.services.traffic import TrafficSampler
from apps.access_manager.application.commands.device import DeviceCommandBus
from apps.access_manager.application.queries.device import DeviceQueryBus
from apps.access_manager.infrastructure.providers.zte import ZTEProvider
from test_provider_contract_surface import FakeZTE


def test_mac_dedup_retains_wifi_telemetry_and_unknown_status():
    rows=merge_clients([{'mac':'aabbccddeeff','hostname':'PC','ip':'192.168.1.3','interface':'LAN1'}],
                       [{'mac':'AA:BB:CC:DD:EE:FF','ssid':'Home','rssi':-52,'snr':27,'rx_rate':300,'band':'5GHz'}])
    assert len(rows)==1
    assert rows[0]['hostname']=='PC'
    assert rows[0]['ssid']=='Home' and rows[0]['connection_type']=='Wi-Fi'
    assert rows[0]['snr']==27 and rows[0]['rx_rate']==300
    assert 'online' not in rows[0] and 'status' not in rows[0]


def test_unknown_macs_are_not_collapsed():
    assert len(merge_clients([{'hostname':'x'},{'hostname':'y'}],[]))==2


class RevealZTE(FakeZTE):
    def wifi_networks(self,reveal_password=False):
        return [{'id':'1','password':'real-secret' if reveal_password else '********','password_hidden':not reveal_password}]
    def channel_status(self): return []


def test_zte_reveal_contract_is_on_demand_not_a_snapshot():
    p=ZTEProvider(client_factory=RevealZTE);p.connect('x','u','p')
    bus=DeviceQueryBus(SimpleNamespace(provider=p))
    assert bus.wifi()['networks'][0]['password_hidden']
    assert bus.wifi_reveal()['networks'][0]['password']=='real-secret'
    assert bus.wifi()['networks'][0]['password']=='********'


def test_ping_normalization_keeps_missing_data_unknown_and_zero_valid():
    d=normalize_diagnostic('ping',{'host':'x','sucesso':'4','falha':'0','minimo_ms':'0','medio_ms':'1.2'})
    assert d['sent']==4 and d['loss_percent']==0 and d['min_ms']==0
    assert d['max_ms'] is None
    empty=normalize_diagnostic('ping',{})
    assert empty['sent'] is None and empty['loss_percent'] is None


def test_traceroute_native_huawei_and_zte_share_contract():
    h=normalize_diagnostic('traceroute',{'hops':[{'numero':1,'ip':'192.168.1.1','latencias_ms':[1,2],'timeout':False}]})
    z=normalize_diagnostic('traceroute',{'resultado':'1 192.168.1.1 1 ms 2 ms\n2 * * *'})
    assert h['hops'][0]['number']==z['hops'][0]['number']==1
    assert z['hops'][1]['timeout'] is True
    assert z['hops'][1]['latencies_ms']==[]


def test_traffic_rate_resets_and_session_isolation():
    times=iter([0,2,4,6]);sampler=TrafficSampler(clock=lambda:next(times))
    def sample(session,n):return sampler.sample(session,{'sources':[{'source':'wan','identity':'1','counters':{'rx_bytes':n,'tx_bytes':0}}]})['sources'][0]
    assert sample('a',0)['rx_mbps'] is None
    assert sample('a',2_000_000)['rx_mbps']==8
    reset=sample('a',1);assert reset['rx_mbps'] is None and reset['counter_reset']
    assert sample('b',3_000_000)['rx_mbps'] is None


def test_read_retry_reopens_view_once_and_never_masks_unrelated_failure():
    p=ZTEProvider(client_factory=FakeZTE);p.connect('x','u','p');calls=[]
    def reader():
        calls.append(1)
        if len(calls)==1:raise RuntimeError('SessionTimeout')
        return {'modelo':'F670L'}
    p.client.device_status=reader
    assert p.get_device_info()['modelo']=='F670L' and len(calls)==2
    p.client.device_status=lambda:(_ for _ in ()).throw(RuntimeError('bad parser'))
    with pytest.raises(RuntimeError,match='bad parser'):p.get_device_info()


def test_management_bus_checks_capability_before_dispatch():
    p=ZTEProvider(client_factory=FakeZTE);p.connect('x','u','p');seen=[]
    p.client.dmz_status=lambda:[{'_InstID':'dmz1','Enable':'1','InternalClient':'192.168.1.8','WANCViewName':'wan1'}]
    p.client.set_dmz=lambda config:seen.append(config) or {'verified':True}
    bus=DeviceCommandBus(SimpleNamespace(provider=p,operation_lock=RLock()))
    assert bus.set_dmz({'enabled':False})['verified']
    assert seen==[{'id':'dmz1','enabled':False,'internal_client':'192.168.1.8','wan':'wan1'}]
    p.model='unknown';p._caps=p._build_caps()
    with pytest.raises(Exception):bus.set_dmz({'enabled':True})
    assert len(seen)==1


def test_operation_history_redacts_secrets_and_does_not_claim_verification(tmp_path):
    from apps.access_manager.infrastructure.history import HistoryRepository
    history=HistoryRepository(tmp_path/'history.sqlite3')
    p=ZTEProvider(client_factory=FakeZTE);p.connect('x','u','p')
    p.client.set_dns=lambda config:{'success':True,'password':'sensitive-result'}
    sessions=SimpleNamespace(provider=p,history=history,_history_session=None)
    DeviceCommandBus(sessions).set_dns({'password':'sensitive-input'})
    change=history.recent()['changes'][0]
    assert change['outcome']=='accepted'
    assert change['after_json']['password']=='[REDACTED]'
    assert 'sensitive-' not in history.path.read_bytes().decode('latin1')
