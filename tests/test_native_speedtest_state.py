from types import SimpleNamespace
from unittest.mock import patch
import pytest
from apps.access_manager.infrastructure.zte.native_speedtest import NativeSpeedtest
from tests.test_zte_counter_surfaces import xml
from apps.access_manager.infrastructure.zte.protocol.device import ZTE

class Client:
    _parse_instances=staticmethod(ZTE._parse_instances)
    _validar_resposta=staticmethod(ZTE._validar_resposta)
    def __init__(self):self.calls=[];self.state='0'
    def get_view(self,*a,**k):self.calls.append(('view',a,k))
    def get_menu(self,*a,**k):self.calls.append(('get',a,k));return xml({'OBJ_SPEEDTEST_DIAGNOSE_ID':[{'State':self.state,'DownRate':'123.4','UpRate':'10.2','Percntage':'50'}]})

def test_one_start_then_only_get_poll_no_session_token_exported():
    c=Client();e=NativeSpeedtest(clock=lambda:0);e.servers=[{'name':'test','url':'https://test.example/'}]
    with patch('apps.access_manager.infrastructure.zte.native_speedtest.post_menu',return_value='<ajax_response_xml_root><sessionId>private-run</sessionId></ajax_response_xml_root>') as post:
        # Inject only token extraction, retaining the actual start request.
        with patch('apps.access_manager.infrastructure.zte.native_speedtest._session_value',return_value='private-run'):
            start=e.start(c,e.servers[0]['url']);assert start['status']=='running'
        for _ in range(3):assert e.poll(c,start['run_id'])['status']=='running'
        c.state='2';r=e.poll(c,start['run_id']);assert r['status']=='finished';assert r['download_mbps']==123.4
        assert post.call_count==1
        assert 'private-run' not in str(r)
        assert post.call_args.args[2]==[('IF_ACTION','SpeedtestDIAG'),('Url','https://test.example/')]

def test_start_timeout_is_uncertain_and_does_not_post_again():
    c=Client();e=NativeSpeedtest();e.servers=[{'url':'x'}]
    with patch('apps.access_manager.infrastructure.zte.native_speedtest.post_menu',side_effect=TimeoutError()) as post:
        r=e.start(c,'x');assert r['uncertain'];assert e.poll(c,r['run_id'])['status']=='uncertain'
        with pytest.raises(RuntimeError):e.start(c,'x')
        assert post.call_count==1

def test_poll_deadline_and_session_identity_validation_are_read_only():
    c=Client();e=NativeSpeedtest(clock=lambda:0);e.run={'id':'id','started':0,'complete':False,'token':'private','server':{}}
    with pytest.raises(ValueError):e.poll(c,'other')
    e.clock=lambda:121;assert e.poll(c,'id')['status']=='timeout';assert c.calls==[]

def test_caller_cannot_start_arbitrary_server():
    c=Client();e=NativeSpeedtest();e.servers=[{'url':'known'}]
    with pytest.raises(ValueError):e.start(c,'other')
    assert c.calls==[]
