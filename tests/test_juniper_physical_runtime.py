"""PHYSICAL_CAPTURE_SHAPE tests, not live MX204/Windows execution."""
from pathlib import Path
from types import SimpleNamespace
import json
import logging
import threading
import time
import pytest
from apps.access_manager.infrastructure.juniper import parsers
from apps.access_manager.infrastructure.juniper.errors import JuniperError
from apps.access_manager.infrastructure.juniper.requests import request,CATALOG
from apps.access_manager.infrastructure.juniper.transport import JuniperTransport,FEATURE_TIMEOUTS,MAX_RESPONSE_BYTES
from apps.access_manager.infrastructure.juniper.output import JunosCommandResult
from tests.test_juniper import provider,fixture

ROOT=Path(__file__).parent/'fixtures/juniper'
def physical(name):return (ROOT/f'mx204_23_4_{name}.xml').read_text()


def test_radius_sequential_profiles_ports_and_available_status():
    rows=parsers.radius(physical('radius_servers'))
    assert len(rows)==4
    assert [(r['profile'],r['address']) for r in rows]==[('ACCESS-TEST','192.0.2.111'),('ACCESS-TEST','192.0.2.110'),('ACCESS-OTHER','192.0.2.110'),('ACCESS-OTHER','192.0.2.112')]
    assert all((r['status'],r['authentication_port'],r['preauthentication_port'],r['accounting_port'])==('UP','1812','1812','1813') for r in rows)
    assert parsers.radius('<radius-servers-table><radius-server><server-address>192.0.2.1</server-address><status>UP</status></radius-server></radius-servers-table>')[0]['status']=='UP'
    with pytest.raises(JuniperError) as error:parsers.radius('<aaa-module-radius-servers-information><unexpected/></aaa-module-radius-servers-information>')
    assert error.value.code=='XML_SHAPE_UNSUPPORTED'


def test_authentication_physical_aliases():
    result=parsers.aaa_authentication(physical('aaa_authentication'))
    assert result['counters']['no_available_server']=='7302'
    assert result['counters']['invalid_credentials']=='49156458'
    assert result['current_incident'] is None and result['cumulative']
    assert 'processed_ok' not in result['counters']


def test_accounting_has_its_own_schema_and_all_returned_counters():
    counters=parsers.aaa_accounting(physical('aaa_accounting'))['counters']
    expected={'requests':'828718519','request_success':'828718519','request_failures':'0','acct_on_requests':'5526','start_requests':'9057669','interim_requests':'761602463','stop_requests':'58114940','response_success':'827952167','response_failures':'3592','requests_pending':'2','retransmissions':'2383703','timeouts':'762758'}
    assert all(counters[k]==v for k,v in expected.items())
    assert not {'accepts','rejects','invalid_credentials','processed_ok','silent_drops'} & counters.keys()


def test_dynamic_statistics_physical_shape_remains_cumulative():
    result=parsers.aaa_dynamic(physical('aaa_dynamic'))
    assert result['counters']=={'requests':'6450760','processed_ok':'620237','processed_initial':'0','processing_error':'5821051','silent_drops':'9467'}
    assert result['current_incident'] is None


def test_subscriber_acc_aliases_keep_families_and_precision():
    result=parsers.accounting(physical('subscriber_accounting'))
    assert [r['family'] for r in result['samples']]==['inet','inet6']
    assert result['samples'][0]['input_bytes']=='4000' and result['samples'][1]['output_bytes']=='6500'
    assert result['bitrate_mbps'] is None
    huge=physical('subscriber_accounting').replace('4000','18446744073709551615')
    assert parsers.accounting(huge)['samples'][0]['input_bytes']=='18446744073709551615'


def test_lacp_groups_actor_partner_state_and_info_by_member():
    groups=parsers.lacp(physical('lacp_ae1'));assert len(groups)==1
    group=groups[0];assert group['aggregate']=='ae1'
    assert [m['interface'] for m in group['members']]==['et-0/0/0','et-0/0/1','et-0/0/2']
    for member in group['members']:
        for role in ('actor','partner'):
            assert all(member[role][key] is True for key in ('collecting','distributing','synchronization','aggregation'))
            assert member[role]['timeout']=='Slow' and member[role]['port_key']=='17'
        assert member['actor']['system_id']!=member['partner']['system_id']


def test_optics_module_and_lane_alarms_warnings_thresholds_preserved():
    row=parsers.optics(physical('optics_et_0_0_0'))[0]
    assert row['temperature']=='35 C' and row['voltage']=='3.3 V' and len(row['lanes'])==4
    assert row['module_alarm_warning_thresholds']['module-temperature-high-alarm-threshold']=='80 C'
    for lane in row['lanes']:
        assert lane['bias_current']=='30 mA' and lane['tx_power']=='-2 dBm' and lane['rx_power']=='-3 dBm'
        assert lane['alarm_warning_thresholds']['laser-rx-power-low-warning']=='off'
        assert lane['alarm_warning_thresholds']['laser-rx-power-low-alarm-threshold']=='-10 dBm'
    assert 'rx_power' not in row


@pytest.mark.parametrize('parser',[parsers.aaa_authentication,parsers.aaa_accounting,parsers.aaa_dynamic])
def test_unknown_metric_shape_is_not_silent_success(parser):
    with pytest.raises(JuniperError) as error:parser('<aaa-module-statistics><unexpected>123</unexpected></aaa-module-statistics>')
    assert error.value.code=='XML_SHAPE_UNSUPPORTED'


class Channel:
    def __init__(self,data=None):self.data=data or fixture('facts').encode();self.closed=False
    def recv_ready(self):return bool(self.data)
    def recv(self,size):result,self.data=self.data[:size],self.data[size:];return result
    def recv_stderr_ready(self):return False
    def exit_status_ready(self):return not self.data
    def recv_exit_status(self):return 0
    def close(self):self.closed=True


def ssh_transport(channel=None):
    calls=[];channel=channel or Channel()
    def execute(command,**options):calls.append((command,options));return None,SimpleNamespace(channel=channel),None
    t=JuniperTransport();t.kind='ssh';t.client=SimpleNamespace(exec_command=execute,get_transport=lambda:SimpleNamespace(is_active=lambda:True,is_authenticated=lambda:True))
    return t,calls,channel


@pytest.mark.parametrize('feature,value,expected',[('facts',None,8),('radius',None,15),('interfaces',None,20),('optics','et-0/0/0',15),('subscriber_username','brd_1',24)])
def test_feature_timeout_reaches_real_transport_boundary(feature,value,expected):
    t,calls,channel=ssh_transport();t.execute(request(feature,value=value))
    assert calls[0][1]['timeout']==expected and channel.closed


def test_requested_24_seconds_is_not_capped_to_8_ssh_or_netconf():
    t,calls,_=ssh_transport();t.execute(request('facts'),timeout=24)
    assert calls[0][1]['timeout']==24
    t=JuniperTransport();t.kind='netconf';t.client=SimpleNamespace(connected=True,command=lambda *args,**kwargs:SimpleNamespace(xml=fixture('facts')))
    t.execute(request('facts'),timeout=24);assert t.client.timeout==24


@pytest.mark.parametrize('kind',['ssh','netconf'])
def test_response_limit_has_distinct_code(kind):
    payload=b'x'*(MAX_RESPONSE_BYTES+1)
    if kind=='ssh':t,_,channel=ssh_transport(Channel(payload))
    else:
        t=JuniperTransport();t.kind='netconf';t.client=SimpleNamespace(connected=True,command=lambda *a,**kw:SimpleNamespace(xml=payload.decode()))
    with pytest.raises(JuniperError) as error:t.execute(request('facts'))
    assert error.value.code=='RESPONSE_TOO_LARGE'
    if kind=='ssh':assert channel.closed


@pytest.mark.parametrize('payload,code',[('', 'EMPTY_RESPONSE'),('<wrong/>','XML_SHAPE_UNSUPPORTED'),('<broken','XML_PARSE_ERROR'),('syntax error','COMMAND_UNSUPPORTED'),('error: daemon refused','CLI_COMMAND_ERROR')])
def test_parser_error_taxonomy(payload,code):
    with pytest.raises(JuniperError) as error:parsers.radius(payload)
    assert error.value.code==code


def test_structured_read_logs_are_correlated_and_contain_no_payload_or_secrets(caplog):
    p=provider();p.transport.responses['radius']=JunosCommandResult('ssh',physical('radius_servers').replace('ACCESS-TEST','private-value-not-for-logs'))
    caplog.set_level(logging.DEBUG,logger='access_manager.juniper.read')
    p.get_juniper_health({'kind':'radius'})
    records=[json.loads(r.message.split(' ',1)[1]) for r in caplog.records if r.message.startswith(('juniper.read.start ','juniper.read.finish '))]
    assert len(records)==2 and records[0]['request_id']==records[1]['request_id']
    assert {'feature','host','port','logical_command','elapsed_ms','lock_wait_ms','response_bytes','output_format','xml_root','exit_status','error_code','retryable'}<=records[-1].keys()
    assert records[-1]['response_bytes']>0 and records[-1]['xml_root']=='rpc-reply'
    assert 'private-value-not-for-logs' not in caplog.text and '<rpc-reply' not in caplog.text
    p.transport.responses['radius']='<rpc-reply><unknown>secret-password</unknown></rpc-reply>'
    with pytest.raises(JuniperError) as error:p.get_juniper_health({'kind':'radius'})
    assert error.value.request_id and error.value.code=='XML_SHAPE_UNSUPPORTED'
    assert 'secret-password' not in caplog.text and 'xml_root' in caplog.text
    assert p.connection_metadata()['transport_active'] and not p.connection_metadata()['last_transport_failure']
    p.disconnect();assert p.get_operation_log()==[]


def test_transport_failure_degrades_and_success_recovers_without_relogin():
    p=provider();p.transport.responses['radius']=JuniperError('CONNECTION_TIMEOUT')
    with pytest.raises(JuniperError):p.get_juniper_health({'kind':'radius'})
    assert p.connection_metadata()['last_transport_failure'] and p.connected
    p.transport.responses['radius']=physical('radius_servers');p.get_juniper_health({'kind':'radius'})
    assert not p.connection_metadata()['last_transport_failure']


def test_bus_measures_lock_wait_and_propagates_request_context(caplog):
    from apps.access_manager.application.queries.device import DeviceQueryBus
    p=provider();p.transport.responses['radius']=physical('radius_servers')
    lock=threading.RLock();sessions=SimpleNamespace(provider=p,operation_lock=lock,session=SimpleNamespace(session_id='test'))
    results=[];caplog.set_level(logging.INFO)
    with lock:
        thread=threading.Thread(target=lambda:results.append(DeviceQueryBus(sessions).infrastructure('juniper_health','get_juniper_health',{'kind':'radius','app_session_id':'test'})))
        thread.start();time.sleep(.025)
    thread.join(timeout=2);assert len(results)==1
    record=p.get_operation_log()[-1];assert record['lock_wait_ms']>=15
    assert any(record['request_id'] in r.message and 'juniper.operation' in r.message for r in caplog.records)


def test_infrastructure_inventory_excludes_dynamic_and_never_executes_global_terse():
    p=provider();rows=p.get_juniper_interfaces()
    assert [r['name'] for r in rows]==['xe-0/0/0']
    assert CATALOG['interfaces']!='show interfaces terse' and 'media' in CATALOG['interfaces']
    assert 'show interfaces terse' not in p.transport.calls


def test_actual_port_and_session_health_are_exposed_without_credentials():
    from tests.test_juniper import FakeTransport
    class SSH(FakeTransport):
        def connect(self,*args,**kwargs):self.connected=True;self.kind='ssh';self.port=kwargs['ssh_port']
    p=__import__('apps.access_manager.infrastructure.providers.juniper',fromlist=['JuniperProvider']).JuniperProvider(SSH)
    p.connect('example.invalid','ad-user','ad-password',transport='ssh',ssh_port=50022)
    metadata=p.connection_metadata();assert metadata['port']==50022 and metadata['scheme']=='ssh'
    assert metadata['session_authenticated'] and metadata['transport_active']
    assert 'password' not in json.dumps(metadata) and 'ad-user' not in json.dumps(metadata)


def test_parser_response_proves_transport_recovered_even_after_previous_timeout():
    p=provider();p.transport.responses['radius']=JuniperError('CONNECTION_TIMEOUT')
    with pytest.raises(JuniperError):p.get_juniper_health({'kind':'radius'})
    p.transport.responses['radius']='<rpc-reply><unknown/></rpc-reply>'
    with pytest.raises(JuniperError) as error:p.get_juniper_health({'kind':'radius'})
    assert error.value.code=='XML_SHAPE_UNSUPPORTED'
    assert not error.value.health['last_transport_failure'] and error.value.health['transport_active']


@pytest.mark.parametrize('kind,name',[('lacp','all'),('lacp','pp0.1'),('optics','all'),('optics','demux0.1'),('optics','et-*')])
def test_link_reads_cannot_expand_into_global_inventory(kind,name):
    p=provider();before=len(p.transport.calls)
    with pytest.raises(ValueError):p.get_juniper_link({'kind':kind,'name':name})
    assert len(p.transport.calls)==before


def test_public_api_error_contains_correlated_safe_code_and_health():
    from apps.access_manager.presentation.api.common import safe
    p=provider();p.transport.responses['radius']='<rpc-reply><unknown>private-secret</unknown></rpc-reply>'
    result=safe(lambda:p.get_juniper_health({'kind':'radius'}))
    assert result['error']['code']=='XML_SHAPE_UNSUPPORTED' and result['error']['type']=='parser'
    assert result['error']['request_id']==p.get_operation_log()[-1]['request_id']
    assert result['error']['health']['transport_active']
    assert 'private-secret' not in json.dumps(result)


def test_connect_logs_never_include_ad_credentials(caplog):
    from tests.test_juniper import FakeTransport
    from apps.access_manager.infrastructure.providers.juniper import JuniperProvider
    caplog.set_level(logging.INFO)
    p=JuniperProvider(FakeTransport);p.connect('example.invalid','secret-ad-user','secret-ad-pass')
    assert 'secret-ad-user' not in caplog.text and 'secret-ad-pass' not in caplog.text


def test_counter_text_is_not_treated_as_a_valid_numeric_counter():
    with pytest.raises(JuniperError) as error:parsers.aaa_authentication('<aaa-module-authentication-statistics><requests>not-a-counter</requests></aaa-module-authentication-statistics>')
    assert error.value.code=='XML_SHAPE_UNSUPPORTED'


def test_interface_row_limit_is_logged_as_read_failure_not_success():
    p=provider();p.transport.responses['interfaces']='<interface-information>'+''.join(f'<physical-interface><name>ae{n}</name></physical-interface>' for n in range(513))+'</interface-information>'
    with pytest.raises(JuniperError) as error:p.get_juniper_interfaces()
    assert error.value.code=='RESPONSE_TOO_LARGE'
    assert p.get_operation_log()[-1]['status']=='error' and p.get_operation_log()[-1]['error_code']=='RESPONSE_TOO_LARGE'
