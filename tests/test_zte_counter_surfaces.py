import xml.etree.ElementTree as ET
from apps.access_manager.infrastructure.zte.traffic import read_counter_surfaces
from apps.access_manager.infrastructure.zte.protocol.device import ZTE


def xml(objects):
    root = ET.Element('ajax_response_xml_root')
    for name, rows in objects.items():
        obj = ET.SubElement(root, name)
        for row in rows:
            instance = ET.SubElement(obj, 'Instance')
            for key, value in row.items():
                ET.SubElement(instance, 'ParaName').text = key
                ET.SubElement(instance, 'ParaValue').text = str(value)
    return ET.tostring(root, encoding='unicode')


class Client:
    _parse_instances = staticmethod(ZTE._parse_instances)
    def __init__(self, responses):
        self.responses, self.calls = responses, []
    def get_view(self, view):
        self.calls.append(('view', view))
    def get_menu(self, script, **params):
        self.calls.append(('menu', script, params))
        return self.responses.get(script, '<html>Not supported</html>')


def test_order_and_stable_wifi_joins_and_zero():
    c = Client({
        'eth_interface_status_lua.lua': xml({'OBJ_ETH_ID': [{'_InstID': 'wan1', 'BytesReceived': 0, 'BytesSent': 12}]}),
        'wan_internet_lua.lua': xml({'ID_WAN_COMFIG': []}),
        'eth_lanstatus_lua.lua': xml({'OBJ_ETH_ID': [{'_InstID': 'lan1', 'BytesReceived': 42, 'AliasName': 'LAN 1'}]}),
        'wlan_status_lua.lua': xml({
            'OBJ_WLANCONFIGDRV_ID': [{'_InstID': 'ap2', 'WLANViewName': 'radio1', 'TotalBytesReceived': 100}, {'_InstID': 'ap1', 'TotalBytesSent': 0}],
            'OBJ_WLANAP_ID': [{'_InstID': 'ap1', 'ESSID': 'Other'}, {'_InstID': 'ap2', 'ESSID': 'Home'}],
            'OBJ_WLANSETTING_ID': [{'_InstID': 'radio1', 'Band': '5GHz'}],
        }),
    })
    result = read_counter_surfaces(c)
    assert result['unavailable_scopes'] == []
    rows = {r['identity']: r for r in result['sources']}
    assert rows['wan1']['counters']['rx_bytes'] == 0
    assert rows['ap2']['ssid'] == 'Home' and rows['ap2']['band'] == '5GHz'
    assert 'band' not in rows['ap1']
    assert c.calls[:3] == [('view', 'ethWanStatus'), ('menu', 'eth_interface_status_lua.lua', {}), ('menu', 'wan_internet_lua.lua', {'TypeUplink': 2, 'pageType': 1})]
    assert c.calls[3] == ('view', 'localNetStatus')
    assert c.calls[5] == ('view', 'localNetStatus')


def test_invalid_ambiguous_and_missing_identity_never_become_zero():
    c = Client({'eth_lanstatus_lua.lua': xml({'OBJ_ETH_ID': [
        {'_InstID': 'a', 'BytesReceived': '-1', 'BytesSent': 'getValue(...)'},
        {'_InstID': 'b', 'BytesReceived': 10}, {'_InstID': 'b', 'BytesReceived': 20},
        {'BytesReceived': 9}, {'_InstID': 'c', 'BytesReceived': 4, 'BytesSent': 'NaN'},
    ]})})
    result = read_counter_surfaces(c)
    assert [r['identity'] for r in result['sources']] == ['c']
    assert result['sources'][0]['counters']['tx_bytes'] is None
    assert result['unavailable_scopes'] == ['wan', 'wifi']


def test_rejected_probe_does_not_block_independent_scopes():
    c = Client({'eth_lanstatus_lua.lua': '<ajax_response_xml_root><IF_ERRORSTR>SessionTimeout</IF_ERRORSTR></ajax_response_xml_root>',
        'wlan_status_lua.lua': xml({'OBJ_WLANCONFIGDRV_ID': [{'_InstID': 'ap1', 'TotalBytesSent': 5}]})})
    result = read_counter_surfaces(c)
    assert result['sources'][0]['identity'] == 'ap1'
    assert result['unavailable_scopes'] == ['wan', 'lan']

def test_wan_status_failure_preserves_valid_counters():
    c=Client({'eth_interface_status_lua.lua':xml({'OBJ_ETH_ID':[{'_InstID':'wan1','BytesSent':0}]})})
    result=read_counter_surfaces(c)
    assert result['sources'][0]['counters']['tx_bytes']==0
    assert 'wan_status' in result['unavailable_scopes']
