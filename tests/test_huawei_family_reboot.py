from types import SimpleNamespace
import pytest
from apps.access_manager.infrastructure.huawei.reboot import reboot,supported

@pytest.mark.parametrize('flow',['rand_count','api_ses_token'])
def test_hg8245h_family_reboot_submits_once_without_redirect_replay(flow):
    posts=[]
    def post(url,**kw):posts.append((url,kw));return SimpleNamespace(status_code=200,text='<response>OK</response>')
    client=SimpleNamespace(auth_flow=flow,base_url='http://router',timeout=10,url=lambda p:'http://router'+p,get_page=lambda p:'current-page',extract_token=lambda p:'private-token',session=SimpleNamespace(headers={'__RequestVerificationToken':'private-api-token'},post=post))
    result=reboot(client,'HG8245H');assert result['submitted'] and result['verified'] is False
    assert len(posts)==1 and posts[0][1]['allow_redirects'] is False
    assert 'private' not in str(result)
    if flow=='rand_count':assert 'ResetBoard' in posts[0][0] and posts[0][1]['data']=={'x.X_HW_Token':'private-token'}
    else:assert posts[0][0].endswith('/api/system/reboot') and '<Reboot>1</Reboot>' in posts[0][1]['data']

def test_reboot_is_not_universal_by_model_or_manufacturer():
    client=SimpleNamespace(auth_flow='rand_count')
    assert not supported(client,'EG8041X7-10')
    with pytest.raises(RuntimeError):reboot(client,'EG8041X7-10')

def test_reboot_timeout_is_ambiguous_not_a_second_request():
    posts=[]
    def fail(*a,**kw):posts.append(kw);raise TimeoutError()
    c=SimpleNamespace(auth_flow='rand_count',timeout=10,url=lambda p:p,get_page=lambda p:'page',extract_token=lambda p:'secret',session=SimpleNamespace(post=fail))
    assert reboot(c,'HG8245H')['uncertain'] and len(posts)==1
