import pytest
from apps.access_manager.infrastructure.providers.huawei import HuaweiProvider
from apps.access_manager.infrastructure.huawei.profiles import HuaweiEG8041X7Profile

class Mapped:
    def __init__(self, mismatch=False):
        self.main=False;self.slave=True;self.posts=[];self.mismatch=mismatch
    def read_feature(self, feature):
        return {'pages':[{'records':[{'domain':'InternetGatewayDevice.X_HW_MainUPnP','Enable':str(int(self.main))}, {'domain':'InternetGatewayDevice.X_HW_SlvUPnP','Enable':str(int(self.slave))}]}]}
    def write_feature(self, feature, payload):
        self.posts.append((feature,payload));self.main=payload['x.Enable']=='1'
        if not self.mismatch:self.slave=payload['y.Enable']=='1'
        return {'accepted':True,'success':True,'verified':True}

def provider(mapped):
    p=HuaweiProvider();p.profile=HuaweiEG8041X7Profile();p.model='EG8041X7-10';p._caps=p._build_caps();p.mapped=mapped;return p

def test_partial_state_change_preserves_other_state_and_posts_once():
    m=Mapped();p=provider(m);assert p.get_upnp()['enabled'] is None
    result=p.set_upnp({'main_enabled':True})
    assert result['verified'] and not result['uncertain']
    assert m.posts==[('upnp',{'x.Enable':'1','y.Enable':'1'})]

def test_readback_must_match_both_objects_not_one_shared_enable_key():
    m=Mapped(mismatch=True);result=provider(m).set_upnp({'enabled':False})
    assert result['verified'] is False and result['uncertain'] is True
    assert len(m.posts)==1

@pytest.mark.parametrize('payload',[{}, {'enabled':'false'}, {'x.Enable':'1'}])
def test_invalid_payload_never_posts(payload):
    m=Mapped()
    with pytest.raises(ValueError):provider(m).set_upnp(payload)
    assert m.posts==[]

def test_unrecognized_page_does_not_infer_false_or_submit():
    m=Mapped();m.read_feature=lambda feature:{'pages':[{'records':[]}]}
    p=provider(m);assert p.get_upnp()['enabled'] is None
    with pytest.raises(RuntimeError):p.set_upnp({'enabled':True})
    assert m.posts==[]
