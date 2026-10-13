from types import SimpleNamespace
from urllib.parse import parse_qsl
from unittest.mock import patch
import pytest
from apps.access_manager.infrastructure.configuration_adapters import OperationalConfigurations, NATIVE, HuaweiMapped, BOOLS
from apps.access_manager.infrastructure.zte.protocol.device import ZTE
from apps.access_manager.infrastructure.huawei.profiles import HuaweiEG8041X7Profile
from tests.test_zte_counter_surfaces import xml

class Router:
    _parse_instances=staticmethod(ZTE._parse_instances)
    _validar_resposta=staticmethod(ZTE._validar_resposta)
    def __init__(self,spec):
        self.spec=spec;self.rows=[{'_InstID':'1',**{k:'0' for k in spec.fields}}];self.posts=[];self.views=[];self.base_url='http://router';self.session_tmp_token='initial';self.public_key_pem=None;self.integrity_check=False;self.session=self;self.apply_state=True
    def get_view(self,view,**kwargs):
        self.views.append(view);self.session_tmp_token='fresh-'+str(len(self.views));return ''
    def get_menu(self,tag,**kwargs):return xml({self.spec.object_key:self.rows})
    def post(self,url,**kwargs):
        self.posts.append(kwargs);body=dict(parse_qsl(kwargs['data'],keep_blank_values=True));assert body['_sessionTOKEN']==self.session_tmp_token;assert kwargs['allow_redirects'] is False
        if self.apply_state:
            if body['IF_ACTION']=='Delete':self.rows=[]
            elif body['_InstID']=='-1':self.rows.append({'_InstID':'2',**{k:body[k] for k in self.spec.fields}})
            else:self.rows[0].update({k:body[k] for k in self.spec.fields})
        return SimpleNamespace(text=xml({}),status_code=200,url=url,raise_for_status=lambda:None)

def owner(router):
    obj=SimpleNamespace(vendor='zte',model='F670L',_need=lambda:router,_is_f6201b=lambda:False)
    return obj,OperationalConfigurations(obj)

@pytest.mark.parametrize('feature',list(NATIVE))
def test_each_gateway_has_live_shape_preview_one_post_and_readback(feature):
    spec,_,_,_=NATIVE[feature];c=Router(spec);_,engine=owner(c)
    view=engine.inspect(c,feature);raw=next(k for k in spec.fields if k in {'Alias','Name'} or k in BOOLS)
    key='field_'+str(spec.fields.index(raw));value='1' if raw in BOOLS else 'changed'
    proposal=engine.preview(c,'router',feature,'1',{key:value});assert c.posts==[]
    result=engine.apply(c,'router',proposal['nonce'],'APLICAR');assert result['verified'];assert len(c.posts)==1;assert c.rows[0][raw]==value
    with pytest.raises(ValueError):engine.apply(c,'router',proposal['nonce'],'APLICAR')
    assert len(c.posts)==1

@pytest.mark.parametrize('feature',[k for k,v in NATIVE.items() if v[3]])
def test_gateway_delete_compares_actual_absence(feature):
    c=Router(NATIVE[feature][0]);_,e=owner(c);p=e.preview(c,'router',feature,'1',{},'delete');r=e.apply(c,'router',p['nonce'],'APLICAR');assert r['verified'] and len(c.posts)==1 and c.rows==[]

def test_gateway_acknowledgement_is_not_a_verified_state():
    c=Router(NATIVE['qos_shaper'][0]);c.apply_state=False;_,e=owner(c);p=e.preview(c,'router','qos_shaper','1',{'field_3':'new'});r=e.apply(c,'router',p['nonce'],'APLICAR');assert r['uncertain'] and not r['verified'];assert len(c.posts)==1

def test_timeout_cannot_reuse_nonce_or_retry():
    c=Router(NATIVE['qos_shaper'][0]);_,e=owner(c);p=e.preview(c,'router','qos_shaper','1',{'field_3':'new'})
    def timeout(*a,**kw):c.posts.append(kw);raise TimeoutError()
    c.post=timeout;r=e.apply(c,'router',p['nonce'],'APLICAR');assert r['uncertain'];assert len(c.posts)==1
    with pytest.raises(ValueError):e.apply(c,'router',p['nonce'],'APLICAR')
    assert len(c.posts)==1

def test_stale_state_wrong_host_expired_preview_and_bad_confirmation_never_post():
    for failure in ['changed','host','expired','confirmation']:
        c=Router(NATIVE['qos_shaper'][0]);_,e=owner(c);e.clock=lambda:0;p=e.preview(c,'router','qos_shaper','1',{'field_3':'new'})
        if failure=='changed':c.rows[0]['Alias']='external'
        if failure=='expired':e.clock=lambda:121
        with pytest.raises((ValueError,RuntimeError)):e.apply(c,'different' if failure=='host' else 'router',p['nonce'],'NO' if failure=='confirmation' else 'APLICAR')
        assert c.posts==[]

def test_unknown_field_and_missing_object_do_not_create_a_writer():
    c=Router(NATIVE['qos_shaper'][0]);_,e=owner(c)
    with pytest.raises(ValueError):e.preview(c,'router','qos_shaper','1',{'arbitrary':'value'})
    c.get_menu=lambda *a,**k:xml({})
    with pytest.raises(RuntimeError):e.inspect(c,'qos_shaper')
    assert c.posts==[]

def test_huawei_time_object_keeps_other_fields_and_compares_readback():
    state={'Enable':'0','X_HW_SynInterval':'30','X_HW_WanName':'WAN1'};posts=[]
    def page(*a):return 'function Time(domain,Enable,X_HW_SynInterval,X_HW_WanName){this.domain=domain;this.Enable=Enable;this.X_HW_SynInterval=X_HW_SynInterval;this.X_HW_WanName=X_HW_WanName;}var t=new Time("InternetGatewayDevice.Time","'+state['Enable']+'","'+state['X_HW_SynInterval']+'","'+state['X_HW_WanName']+'");'
    def write(operation,payload):posts.append((operation,payload));state.update({k.split('.',1)[1]:v for k,v in payload.items()});return {'success':True,'accepted':True}
    obj=SimpleNamespace(vendor='huawei',profile=HuaweiEG8041X7Profile(),client=SimpleNamespace(get_page=page),mapped=SimpleNamespace(write_feature=write));e=OperationalConfigurations(obj)
    d=e.inspect(obj.client,'sntp_general');assert d['instances'][0]['fields'][0]['value']=='0'
    p=e.preview(obj.client,'router','sntp_general','captured',{'field_0':'1'});r=e.apply(obj.client,'router',p['nonce'],'APLICAR')
    assert r['verified'];assert posts==[('sntp_general',{'x.Enable':'1','x.X_HW_SynInterval':'30','x.X_HW_WanName':'WAN1'})]

def test_huawei_mapped_graph_must_match_exact_domain_not_any_enable_record():
    obj=SimpleNamespace(client=SimpleNamespace(get_page=lambda p:'function State(domain,Enable){this.domain=domain;this.Enable=Enable;}var x=new State("InternetGatewayDevice.Unrelated","1");'))
    with pytest.raises(RuntimeError):HuaweiMapped(obj,'sntp_general','sntp').read()

def test_service_ports_preserves_indexed_vector_in_one_post():
    spec=SimpleNamespace(fields=('ServName','ServPort'),object_key='OBJ_FW_SERVPORT_ID')
    c=Router(spec);c.rows=[{'_InstID':'1','ServName':'HTTP','ServPort':'80'},{'_InstID':'2','ServName':'SSH','ServPort':'22'}];_,engine=owner(c)
    p=engine.preview(c,'router','service_ports','1',{'field_0':'8080'})
    def post(*args,**kwargs):
        body=dict(parse_qsl(kwargs['data'],keep_blank_values=True));c.posts.append(body)
        assert body['_InstNum']=='2' and body['_InstID_0']=='1' and body['_InstID_1']=='2'
        assert body['ServName_0']=='HTTP' and body['ServPort_0']=='8080'
        assert body['ServName_1']=='SSH' and body['ServPort_1']=='22'
        c.rows[0]['ServPort']='8080'
        return SimpleNamespace(text=xml({}),status_code=200,url=args[0],raise_for_status=lambda:None)
    c.post=post;r=engine.apply(c,'router',p['nonce'],'APLICAR');assert r['verified'] and len(c.posts)==1
    with pytest.raises(ValueError):engine.preview(c,'router','service_ports','1',{'field_0':'0'})
