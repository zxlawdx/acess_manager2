import time
import pytest
from apps.access_manager.domain.optical import normalize_optical
from apps.access_manager.domain.mesh import normalize_mesh
from apps.access_manager.infrastructure.history import HistoryRepository

def test_absent_optical_errors_are_unknown_not_zero():
    d=normalize_optical({'rx_power_dbm':'-22.5','tx_power_dbm':'NaN','current_ma':'2.3','voltage':3300})
    assert d['rx_dbm']==-22.5 and d['tx_dbm'] is None and d['bias_ma']==2.3
    assert d['voltage_v'] is None # HG8010H documents mV; no universal conversion.
    for key in ['fec_corrected','fec_uncorrectable','ber','los','lof','alarm_state']:assert d[key] is None

def test_mesh_does_not_manufacture_parent_or_backhaul():
    d=normalize_mesh({'available':True,'role':'controller_when_enabled','nodes':[{'NodeID':'node1','Band':'5GHz'}]})
    assert d['nodes']==[{'id':'node1','parent':None,'backhaul':None,'band':'5GHz','rssi':None,'clients':None}]
    assert normalize_mesh({'available':False,'enabled':False})['enabled'] is None

def test_history_can_join_sessions_by_address_or_confirmed_identifier(tmp_path):
    repo=HistoryRepository(tmp_path/'history.sqlite');now=time.time()
    for session,host,serial,rate in [('one','router','A',1),('two','router','A',3),('other','different','B',9)]:
        repo.save_traffic(session,[{'source':'wan','identity':'stable','rx_mbps':rate,'tx_mbps':None}],now,host=host,identifier=serial,vendor='zte')
    rows=repo.traffic_by_device(identifier='A',since=now-60,until=now+1)
    assert len(rows)==1 and rows[0]['rx_mbps']==2 and rows[0]['tx_mbps'] is None
    assert repo.traffic_by_device(host='different',since=now-60,until=now+1)[0]['rx_mbps']==9
    with pytest.raises(ValueError):repo.traffic_by_device(since=now-60,until=now+1)
