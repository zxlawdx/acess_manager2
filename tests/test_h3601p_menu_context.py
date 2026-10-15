import pytest
from apps.access_manager.infrastructure.zte.discovery.profile_runtime import clients,ReadFailure,state
from tests.h3601p_support import Client,fixture

def test_expiration_reauth_once_and_reprime():
 c=Client();c.responses['accessdev_ssiddev_lua.lua']=['SessionTimeout',fixture()]
 assert len(clients(c,'wifi_clients'))==2;assert c.logins==1
 assert c.calls==[('view','localNetStatus'),('data','accessdev_ssiddev_lua.lua')]*2

def test_expiration_is_bounded():
 c=Client();c.responses['accessdev_ssiddev_lua.lua']='SessionTimeout'
 with pytest.raises(ReadFailure):clients(c,'wifi_clients')
 assert c.logins==1;assert len(c.calls)==4

def test_context_switch_and_logout_reset():
 c=Client();clients(c,'wifi_clients');c.get_view('ethWanStatus');clients(c,'wifi_clients')
 assert c.calls.count(('view','localNetStatus'))==2
 c.logout();assert not state(c)['selected'];assert c._menu_context is None

def test_real_login_refresh_resets_context_without_changing_auth_flow():
 from apps.access_manager.infrastructure.zte.protocol.device import ZTE
 from unittest.mock import Mock
 c=ZTE('router','u','p');c._menu_context='localNetStatus'
 c._profile_reads={'selected':{'wifi_clients':'old'},'missing':{'old'},'diagnostics':{}}
 def response(text='',data=None):
  r=Mock();r.text=text;r.json.return_value=data;return r
 c.session=Mock()
 c.session.get.side_effect=[response(data={'sess_token':'private-session'}),response('<ajax_response_xml_root>challenge</ajax_response_xml_root>'),response('<html></html>')]
 c.session.post.return_value=response(data={'login_need_refresh':True,'sess_token':'private-new'})
 assert c.login() is True;assert c._menu_context is None
 assert not c._profile_reads['selected'];assert not c._profile_reads['missing']
 assert c.session.post.call_count==1

def test_firmware_change_invalidates_choices():
 from apps.access_manager.infrastructure.providers.zte import ZTEProvider
 p=ZTEProvider(Client);p.connect('router','u','p');p.get_clients()
 assert state(p.client)['selected']
 p.client.device_status=lambda:{'modelo':'H3601P','firmware':'V9.0.0P2_VN1'}
 p.get_device_info();assert not state(p.client)['selected']
 assert p.runtime_diagnostic()['fingerprint']['firmware']=='V9.0.0P2_VN1'

def test_configuration_password_control_is_not_a_login_page():
 c=Client();c.get_view=lambda *a,**kw:'<form id="WLANSSIDConf"><input type="password" name="KeyPassphrase"></form>'
 assert len(clients(c,'wifi_clients'))==2;assert c.logins==0
