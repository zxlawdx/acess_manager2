import json
from types import SimpleNamespace

from apps.access_manager.application.services.profiles import AttendantProfileRepository, ProfileService
from apps.access_manager.domain.capabilities import Capability, CapabilitySet, SupportStatus
from apps.access_manager.domain.profiles import NetworkProfile


def test_unknown_profile_fields_survive_round_trip():
    profile = NetworkProfile.from_dict({
        'name': 'X',
        'wifi': {'radios': [{'band': '5GHz', 'rts_cts': 2346}]},
        'model_extensions': {'custom': 1},
    })
    assert profile.to_dict()['model_extensions'] == {'custom': 1}
    assert profile.to_dict()['wifi']['radios'][0]['rts_cts'] == 2346


def test_attendant_repository_migrates_flat_profiles_without_deleting_data(tmp_path):
    path = tmp_path / 'profiles.json'
    path.write_text(json.dumps({'Configuração principal': {'description': 'legado', 'wifi': {}, 'dns': {}, 'dhcp': {}}}), encoding='utf-8')
    sessions = SimpleNamespace(session=SimpleNamespace(attendant='ana'))
    repo = AttendantProfileRepository(path, sessions)
    assert [p.name for p in repo.list()] == ['Configuração principal']
    raw = json.loads(path.read_text(encoding='utf-8'))
    assert raw['_schema'] == 2
    assert raw['attendants']['ana']['profiles']['Configuração principal']['description'] == 'legado'


def test_profiles_are_scoped_per_current_attendant(tmp_path):
    sessions = SimpleNamespace(session=SimpleNamespace(attendant='ana'))
    repo = AttendantProfileRepository(tmp_path / 'profiles.json', sessions)
    repo.save(NetworkProfile.from_dict({'name': 'Ana', 'wifi': {}, 'dns': {}, 'dhcp': {}}))
    sessions.session = SimpleNamespace(attendant='bruno')
    assert repo.list() == []
    repo.save(NetworkProfile.from_dict({'name': 'Bruno', 'wifi': {}, 'dns': {}, 'dhcp': {}}))
    sessions.session = SimpleNamespace(attendant='ana')
    assert [p.name for p in repo.list()] == ['Ana']


def test_capture_current_is_draft_and_keeps_full_radio_and_dns_fields(tmp_path):
    capabilities = CapabilitySet([
        Capability('wifi_radio', read=SupportStatus.SUPPORTED),
        Capability('wifi', read=SupportStatus.SUPPORTED),
        Capability('dns', read=SupportStatus.SUPPORTED),
        Capability('dhcp', read=SupportStatus.SUPPORTED),
    ])
    provider = SimpleNamespace(vendor='huawei', model='EG8041X7-10', capabilities=capabilities)
    sessions = SimpleNamespace(provider=provider, session=SimpleNamespace(attendant='ana'))
    queries = SimpleNamespace(
        wifi_radios=lambda: [{'band':'5GHz','channel':36,'bandwidth':'80MHz','standard':'11ax','country':'BR','tx_power':'100%','sgi':False,'beacon_interval':100,'rts_cts':2346,'dtim':1,'airtime_fairness':False,'band_steering':False,'bandwidth_code':'4'}],
        wifi_ssids=lambda: [{'id':'1','ssid':'Casa','enabled':True,'password':'must-not-leak'}],
        dns=lambda: {'domain_name':'lan','ipv4_1':'1.1.1.1','ipv6_1':'2606:4700:4700::1111','hosts':[{'name':'router','ip':'192.168.1.1'}]},
        dhcp=lambda: {'enabled':True,'min_address':'192.168.1.2','max_address':'192.168.1.200'},
    )
    repo = AttendantProfileRepository(tmp_path / 'profiles.json', sessions)
    service = ProfileService(sessions, SimpleNamespace(), repo, {}, queries=queries)
    draft = service.capture()
    radio = draft['wifi']['radios'][0]
    assert radio['beacon_interval'] == 100 and radio['rts_cts'] == 2346 and radio['band_steering'] is False
    assert draft['dns']['ipv6_1'] == '2606:4700:4700::1111'
    assert 'password' not in json.dumps(draft).lower()
    assert repo.list() == []  # capture never overwrites or saves automatically


def test_dns_parser_rejects_wrong_ip_family(tmp_path):
    import pytest
    sessions = SimpleNamespace(provider=SimpleNamespace(), session=SimpleNamespace(attendant='ana'))
    service = ProfileService(sessions, SimpleNamespace(), AttendantProfileRepository(tmp_path/'profiles.json', sessions), {})
    with pytest.raises(ValueError, match='IPv4'):
        service.save({'name':'bad','dns':{'ipv4_1':'2606:4700:4700::1111'},'wifi':{},'dhcp':{}})
