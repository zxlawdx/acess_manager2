from copy import deepcopy
from types import SimpleNamespace
import pytest
from apps.access_manager.domain.clients import normalize_clients
from apps.access_manager.domain.profiles import NetworkProfile
from apps.access_manager.infrastructure.configuration_adapters import OperationalConfigurations, NativeWan
from apps.access_manager.application.services.profiles import ProfileService, JsonProfileRepository
from apps.access_manager.infrastructure.profiles import ZTEProfileTranslator
from apps.access_manager.domain.capabilities import Capability, CapabilitySet, SupportStatus as S, EvidenceLevel as E

@pytest.mark.parametrize('raw,generation,standard',[('ac',5,'802.11ac'),('ax',6,'802.11ax'),('HE',6,'802.11ax'),('n',4,'802.11n'),('HT',4,'802.11n'),('be',7,'802.11be'),('EHT',7,'802.11be'),('b',None,'802.11b'),('g',None,'802.11g'),('b,g,n,ax',None,None),('unknown',None,None),(None,None,None)])
def test_station_mode_is_normalized_conservatively(raw,generation,standard):
    row=normalize_clients([{'CurrentMode':raw,'router_standard':'ax'}])[0]
    assert row['wifi_generation']==generation
    assert row['wifi_standard']==standard
    assert row['wifi_standard_raw']==raw

@pytest.mark.parametrize('alias',['Mode','sta_mode','Standard','OperatingStandard','PhyMode','PHYMode','modo'])
def test_station_aliases(alias):
    assert normalize_clients([{alias:'ax'}])[0]['wifi_generation']==6
    assert normalize_clients([{alias:'ax','CurrentMode':'ac'}])[0]['wifi_generation']==5

@pytest.mark.parametrize('field,value',[('vlan_id',0),('vlan_id',4095),('priority',8),('priority',-1),('mtu','invalid'),('mru',1501),('ip_address','bad'),('dns1','2001:db8::1'),('ipv6_dns1','192.0.2.1'),('password','••••'),('password','******'),('password','')])
def test_wan_rejects_invalid_intent(field,value):
    with pytest.raises(ValueError):NativeWan.validate({field:value})

class WanRouter:
    def __init__(self):self.rows=[{'_InstID':'wan1','WANCName':'internet','VLANID':'20','Priority':'0','Password':'real-test-only','MTU':'1492'}];self.posts=[]
    def wan_configurations(self):return deepcopy(self.rows)
    def update_wan(self,identity,config):
        from apps.access_manager.infrastructure.zte.protocol.zte_configuration.zte_management import _WAN_API_MAP
        self.posts.append((identity,config));self.rows[0].update({_WAN_API_MAP[k]:str(v) for k,v in config.items()});return {'success':True}

def engine():
    router=WanRouter();owner=SimpleNamespace(vendor='zte',model='F670L',_need=lambda:router,_is_f6201b=lambda:False)
    return router,OperationalConfigurations(owner)

def test_wan_preview_apply_readback_and_nonce_never_repeats_write():
    r,e=engine();view=e.inspect(r,'wan_crud');row=view['instances'][0]
    password=next(f for f in row['fields'] if f.get('intent_key')=='password');assert password['value'] is None and password['secret']
    field=next(f for f in row['fields'] if f.get('intent_key')=='vlan_id')
    p=e.preview(r,'router','wan_crud','wan1',{field['key']:'2000'});assert not r.posts
    assert e.apply(r,'router',p['nonce'],'APLICAR')['verified']
    assert r.posts==[('wan1',{'vlan_id':'2000'})]
    with pytest.raises(ValueError):e.apply(r,'router',p['nonce'],'APLICAR')
    assert len(r.posts)==1

def test_wan_secret_readback_is_not_secret_verification():
    r,e=engine();row=e.inspect(r,'wan_crud')['instances'][0];f=next(f for f in row['fields'] if f.get('intent_key')=='password')
    with pytest.raises(ValueError):e.preview(r,'router','wan_crud','wan1',{f['key']:'****'})
    p=e.preview(r,'router','wan_crud','wan1',{f['key']:'temporary-test-only'})
    result=e.apply(r,'router',p['nonce'],'APLICAR');assert not result['verified'] and result['manual_verification']
    assert 'temporary-test-only' not in str(result)

def service(tmp_path):
    r,e=engine();caps=CapabilitySet([Capability(k,read=S.SUPPORTED,write=S.SUPPORTED,evidence=E.FIXTURE_VALIDATED) for k in ('configuration_surfaces','firewall')])
    p=SimpleNamespace(vendor='zte',capabilities=caps,model='F670L',set_profile_wan=lambda c:None)
    q=SimpleNamespace(surface_catalog=e.catalog,surface_read=lambda feature:e.inspect(r,feature),firewall=lambda:{'enabled':True,'level':'Middle','password':'must-not-capture'})
    calls=[];commands=SimpleNamespace(execute=lambda *args,**kwargs:(calls.append(args) or {'verified':True}))
    return ProfileService(SimpleNamespace(provider=p),commands,JsonProfileRepository(tmp_path/'profiles.json'),{'zte':ZTEProfileTranslator()},q),calls

def test_profile_roundtrip_capture_and_independent_wan_firewall(tmp_path):
    s,calls=service(tmp_path);draft=s.capture('captured');assert draft['firewall']=={'enabled':True,'level':'Middle'}
    assert 'password' not in str(draft['wan']).lower()
    s.save(draft);assert s.repository.get('captured').wan['connections'][0]['config']['vlan_id']=='20'
    preview=s.preview('captured');assert len(preview['operations'])==2 and preview['applicable']==2
    result=s.apply('captured',secrets={'wan:wan1':'one-time-test-only'});assert result['applied']==2
    assert calls[0][2]['config']['password']=='one-time-test-only'
    assert 'one-time-test-only' not in (tmp_path/'profiles.json').read_text()

@pytest.mark.parametrize('secret',['password','pppoe_password','admin_password','cookie','token','psk','senha'])
def test_profiles_reject_nested_secrets(tmp_path,secret):
    s,_=service(tmp_path)
    with pytest.raises(ValueError):s.save({'name':'unsafe','wan':{'connections':[{'id':'wan1','config':{secret:'never'}}]}})
    assert not (tmp_path/'profiles.json').exists()

def test_dns_preset_validates_v4_and_v6(tmp_path):
    s,_=service(tmp_path)
    saved=s.save({'name':'DNS custom','description':'operator configured','dns_preset':'Filtro adulto','dns':{'ipv4_1':'192.0.2.53','ipv6_1':'2001:db8::53'}})
    assert saved['dns_preset']=='Filtro adulto'
    with pytest.raises(ValueError):s.save({'name':'bad','dns':{'ipv4_1':'not-an-ip'}})
    with pytest.raises(ValueError):s.save({'name':'bad','dns':{'ipv4_1':'2001:db8::1'}})

def test_old_profile_retains_extensions_and_new_optional_intents():
    p=NetworkProfile.from_dict({'name':'old','wifi':{'5GHz':{'channel':36}},'site':'x'})
    assert p.wifi['radios'][0]['band']=='5GHz'
    assert p.to_dict()['site']=='x' and p.wan=={} and p.firewall=={}

@pytest.mark.parametrize('level',['Low','Middle','High'])
def test_firewall_raw_enums_are_retained_in_profile(tmp_path,level):
    s,_=service(tmp_path)
    p=s.save({'name':level,'firewall':{'enabled':True,'level':level}})
    assert p['firewall']['level']==level
    with pytest.raises(ValueError):s.save({'name':'invalid','firewall':{'level':'arbitrary'}})
    with pytest.raises(ValueError):s.save({'name':'invalid','firewall':{'enabled':'banana'}})

def test_unavailable_wan_is_skipped_without_stopping_firewall(tmp_path):
    s,calls=service(tmp_path);del s.sessions.provider.set_profile_wan
    s.save({'name':'mixed','wan':{'connections':[{'id':'wan1','config':{'vlan_id':'2000'}}]},'firewall':{'level':'Low'}})
    result=s.apply('mixed')
    assert result['skipped']==1 and result['applied']==1
    assert [c[1] for c in calls]==['set_firewall']

def test_inline_profile_secrets_cannot_bypass_transient_channel(tmp_path):
    s,_=service(tmp_path)
    value={'name':'unsafe','wan':{'connections':[{'id':'wan1','config':{'password':'must-be-separate'}}]}}
    with pytest.raises(ValueError):s.preview(value)
    with pytest.raises(ValueError):s.apply(value)
