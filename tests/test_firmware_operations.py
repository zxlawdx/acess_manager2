from types import SimpleNamespace
from unittest.mock import patch
import pytest
from apps.access_manager.infrastructure.zte.firmware_operations import FactoryReset, conntrack_status
from apps.access_manager.infrastructure.zte.protocol.device import ZTE
from tests.test_zte_counter_surfaces import xml

class Client:
    _parse_instances=staticmethod(ZTE._parse_instances)
    _validar_resposta=staticmethod(ZTE._validar_resposta)
    integrity_check=False
    public_key_pem=None
    def __init__(self):
        self.html="db_resetmgr_lua.lua template_ResetManag Btn_reset var _sessionTmpToken='fresh';"
        self.response=xml({'OBJ_CONNTRACK_ID':[{'ConntrackMax':'8192','ConntrackUsed':'0'}]})
    def get_view(self,*args,**kw):return self.html
    def get_menu(self,*args,**kw):return self.response

def test_conntrack_returns_counts_without_inventing_individual_flows():
    assert conntrack_status(Client())=={'capacity':8192,'active':0,'entries_available':False,'entries':[]}

@pytest.mark.parametrize('rows',[[],[{'ConntrackMax':'1'}],[{'ConntrackMax':'1','ConntrackUsed':'NaN'}],[{'ConntrackMax':'1','ConntrackUsed':'-1'}]])
def test_missing_or_invalid_nat_count_is_unavailable(rows):
    c=Client();c.response=xml({'OBJ_CONNTRACK_ID':rows})
    with pytest.raises(RuntimeError):conntrack_status(c)

@pytest.mark.parametrize('failure',['host','expired','word','changed_form'])
def test_reset_rejects_invalid_proposal_before_any_mutation(failure):
    c=Client();e=FactoryReset(clock=lambda:0);p=e.preview(c,'host')
    if failure=='expired':e.clock=lambda:121
    if failure=='changed_form':c.html='unrelated form'
    with patch('apps.access_manager.infrastructure.zte.firmware_operations.post_menu') as post:
        with pytest.raises((ValueError,RuntimeError)):e.apply(c,'other' if failure=='host' else 'host',p['nonce'],'NO' if failure=='word' else 'RESETAR')
        assert post.call_count==0
        with pytest.raises(ValueError):e.apply(c,'host',p['nonce'],'RESETAR')

def test_reset_timeout_consumes_proposal_and_never_retries():
    c=Client();e=FactoryReset();p=e.preview(c,'host')
    with patch('apps.access_manager.infrastructure.zte.firmware_operations.post_menu',side_effect=TimeoutError()) as post:
        r=e.apply(c,'host',p['nonce'],'RESETAR')
        assert r['uncertain'] and not r['verified'] and r['expected_session_loss']
        assert post.call_count==1
        assert post.call_args.args[1:] == ('db_resetmgr_lua.lua',[('IF_ACTION','Reset'),('Btn_reset','')])
        assert c.session_tmp_token=='fresh'
        with pytest.raises(ValueError):e.apply(c,'host',p['nonce'],'RESETAR')
        assert post.call_count==1

def test_reset_preview_requires_observed_token_and_template():
    c=Client();e=FactoryReset()
    for html in ['db_resetmgr_lua.lua template_ResetManag Btn_reset',"var _sessionTmpToken='x'"]:
        c.html=html
        with pytest.raises(RuntimeError):e.preview(c,'host')
        assert e.pending is None
