"""Synthetic VRP examples, explicitly not physical validation fixtures."""
import pickle
import pytest
from apps.access_manager.domain.subscribers import SubscriberQuery
from apps.access_manager.domain.addressing import classify_address
from apps.access_manager.domain.infrastructure import InfrastructureCredentialSession
from apps.access_manager.infrastructure.huawei_bng.commands import request, validate, ReadCommand
from apps.access_manager.infrastructure.huawei_bng.parsers import subscriber, system
from apps.access_manager.infrastructure.huawei_bng.errors import BngError
from apps.access_manager.infrastructure.huawei_bng.provider import HuaweiNetEngineBngProvider
from apps.access_manager.domain.triage import evaluate_snapshot

SYNTHETIC = '''
User name : brd_00042
User ID : 42
User state : Online
Domain : example.invalid
Interface : Eth-Trunk7.20
Physical interface : 100GE0/1/0
PeVlan : 200
CeVlan : 20
IP address : 100.64.0.42
Gateway : 192.0.2.1
Primary DNS : 192.0.2.53
MAC address : 00:11:22:33:44:55
'''

@pytest.mark.parametrize('text,kind', [('00042','CONTRACT_NUMBER'),('brd_42','PPPOE_USERNAME'),('cdy_42','PPPOE_USERNAME'),('364_42','PPPOE_USERNAME'),('user@example.invalid','PPPOE_USERNAME'),('192.0.2.1','IPV4'),('2001:db8::1','IPV6'),('00:11:22:33:44:55','MAC'),('user-id:42','USER_ID'),('serial:HWTC12345678','ONT_SERIAL')])
def test_query_types(text,kind): assert SubscriberQuery.parse(text).kind==kind

@pytest.mark.parametrize('text',['; reboot','foo| include password','foo\nreset x','foo bar','-x','192.0.2.999'])
def test_injection_rejected(text):
    with pytest.raises(ValueError): SubscriberQuery.parse(text)
    with pytest.raises(ValueError): request('subscriber_lookup',text)

@pytest.mark.parametrize('ip,kind',[('100.64.0.0','CGNAT_SHARED'),('100.127.255.255','CGNAT_SHARED'),('100.128.0.0','PUBLIC_IPV4'),('10.0.0.1','RFC1918_PRIVATE'),('192.0.2.1','DOCUMENTATION'),('fc00::1','IPV6_ULA'),('fe80::1','IPV6_LINK_LOCAL'),('::1','RESERVED'),(None,'UNKNOWN')])
def test_addressing(ip,kind): assert classify_address(ip)==kind


def test_closed_command_grammar():
    validate(request('subscriber_lookup','brd_42'))
    validate(request('subscriber_detail','42'))
    for command in ['reboot','display access-user user-id 42; reboot','display access-user username foo | include password']:
        with pytest.raises(ValueError): validate(ReadCommand('subscriber_detail',command))
    with pytest.raises(ValueError): request('diagnose')


def test_parse_evidence_only():
    row=subscriber(SYNTHETIC)
    assert row['contract']=='00042'
    assert row['outer_vlan']==200 and row['inner_vlan']==20
    assert row['dns_v4']==['192.0.2.53']
    assert row['auth_state'] is None and row['rate_down'] is None
    assert subscriber(SYNTHETIC.replace('User state : Online',''))['state'] is None
    with pytest.raises(BngError): subscriber('No users found')
    with pytest.raises(BngError): subscriber('permission denied')
    assert system('Huawei NetEngine 8000 M8 V800R025C00SPC500')['validation']=='PHYSICAL_VALIDATION_PENDING'


def test_credential_not_serializable_and_revocable():
    credential=InfrastructureCredentialSession('operator','never-print-me')
    assert 'never-print-me' not in repr(credential)
    with pytest.raises(TypeError): pickle.dumps(credential)
    credential.revoke()
    with pytest.raises(RuntimeError): credential.connect(None,'example.invalid')


class Transport:
    connected=True
    def connect(self,*args,**kwargs): pass
    def close(self): self.connected=False
    def execute(self,item):
        if item.feature=='health': return '2026-10-21 01:00:00'
        if item.feature=='system': return 'Huawei NetEngine 8000 M8 V800R025C00SPC500'
        return SYNTHETIC


def test_provider_partial_and_identity_protection():
    provider=HuaweiNetEngineBngProvider(Transport)
    provider.connect('example.invalid','operator','never-print-me')
    assert provider.get_subscriber('42')['username']=='brd_00042'
    with pytest.raises(BngError,match='IDENTITY_MISMATCH'): provider.get_subscriber('43')
    result=provider.lookup_subscribers('00042')
    assert len(result['sessions'])==1 and not result['complete']
    assert provider.lookup_subscribers('192.0.2.1')['status']=='UNKNOWN'
    assert 'never-print-me' not in str(provider.get_operation_log())
    provider.disconnect()
    assert not provider.connected


def test_triage_bng_no_invented_online_or_qos():
    snapshot={'subscriber':subscriber(SYNTHETIC)}
    result=evaluate_snapshot(snapshot).public()
    assert 'CGNAT_SHARED' in [i['code'] for i in result['issues']]
    assert 'PPPOE_OFFLINE' not in [i['code'] for i in result['issues']]
    assert result['partial']
    snapshot['subscriber'].update(state='OFFLINE',rate_down=50)
    snapshot['expected_down_mbps']=100
    codes={i['code'] for i in evaluate_snapshot(snapshot).public()['issues']}
    assert {'PPPOE_OFFLINE','QOS_RATE_LIMIT_TOO_LOW'}<=codes


def test_endpoint_preferences_reject_secrets(tmp_path):
    from apps.access_manager.infrastructure.settings import InfrastructureSettings
    settings=InfrastructureSettings(tmp_path/'endpoints.json')
    row={'id':'base-a','label':'Base A','vendor':'huawei_bng','host':'example.invalid'}
    with pytest.raises(ValueError): settings.save([{**row,'password':'never-store-me'}])
    assert not settings.path.exists()
    assert settings.save([row])[0]['ssh_port']==22
    assert settings.read()[0]['auth']=='ad'


def test_shared_runtime_identity_reused_and_revoked():
    from apps.access_manager.application.infrastructure_sessions import InfrastructureSessions
    calls=[]
    class Manager:
        operation_lock=__import__('threading').RLock()
        def connect(self,host,username,password,**options):calls.append((host,username,password))
        def status(self): return {'connected':True}
        def disconnect(self): pass
    manager=Manager();sessions=InfrastructureSessions(Manager(),manager)
    sessions.set_credential('operator','never-store-me')
    for host in ['a.example.invalid','b.example.invalid']:
        sessions.connect_with_credential(host,vendor='huawei_bng')
    assert len(calls)==2
    sessions.disconnect()
    with pytest.raises(ValueError):sessions.connect_with_credential('example.invalid',vendor='huawei_bng')


def test_permission_denied_keeps_its_capability_state():
    class Denied(Transport):
        def execute(self,item):
            if item.feature not in {'system','health'}: raise BngError('PERMISSION_DENIED')
            return super().execute(item)
    provider=HuaweiNetEngineBngProvider(Denied)
    provider.connect('example.invalid','operator','synthetic')
    with pytest.raises(BngError):provider.get_subscriber('42')
    assert provider.capabilities.public()['subscriber_detail']['read']=='PERMISSION_DENIED'
    assert not provider.capabilities.get('subscriber_detail').readable
