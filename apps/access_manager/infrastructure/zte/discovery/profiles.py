"""Firmware candidates, never grants of support or write permission.

H3601P sources: Sentinel P2_VN1 (MIT), stock ZTE documentation and
the existing ThinkLua catalog. Independent implementation; no imported code.
"""
from dataclasses import dataclass
import re
from .multimodel import ReadEndpoint


@dataclass(frozen=True)
class DeviceProfile:
    name: str
    supports_pon: bool
    wan_type: str
    candidates: dict[str, tuple[ReadEndpoint, ...]]


def endpoint(tag, root, view='localNetStatus', params=()):
    return ReadEndpoint(view, tag, root, params)


H3601P_V9 = DeviceProfile('h3601p_v9', False, 'ethernet', {
    'wifi_clients': (
        endpoint('accessdev_ssiddev_lua.lua', 'OBJ_ACCESSDEV_ID'),
        endpoint('wlan_client_stat_lua.lua', 'OBJ_WLAN_AD_ID'),
    ),
    'lan_clients': (endpoint('accessdev_landevs_lua.lua', 'OBJ_ACCESSDEV_ID'),),
    'dhcp_leases': (
        endpoint('dhcp4s_dhcphostinfo_m.lua', 'OBJ_DHCPHOSTINFO_ID'),
        endpoint('accessdev_landevs_lua.lua', 'OBJ_ACCESSDEV_ID'),
        endpoint('accessdev_ssiddev_lua.lua', 'OBJ_ACCESSDEV_ID'),
    ),
    'wan': (endpoint('wan_internetstatus_lua.lua', 'ID_WAN_COMFIG', 'ethWanStatus',
                     (('TypeUplink', '2'), ('pageType', '1'))),),
    'lan_ports': (endpoint('status_lan_info_lua.lua', 'OBJ_PON_PORT_BASIC_STATUS_ID'),),
    'wifi_ssids': (endpoint('wlan_wlansssidconf_lua.lua', 'OBJ_WLANAP_ID', 'wlanBasic'),),
    'wifi_radios': (endpoint('wlan_wlanbasicadconf_lua.lua', 'OBJ_WLANSETTING_ID', 'wlanBasic'),),
})


def select_profile(model, firmware=None):
    # Anchored identity: H3600P, H3601PE and H3610 must never collide.
    compact = re.sub(r'[^A-Z0-9]', '', str(model or '').upper())
    if compact in {'H3601P', 'ZXHNH3601P', 'ZTEH3601P', 'ZTEZXHNH3601P'}:
        return H3601P_V9
    return None


def fingerprint(model, firmware, extended=None, hardware=None):
    version = str(firmware or '')
    evidence = {'V9.0.0P1_MUL': 'owner_ui_observed',
                'V9.0.0P2_VN1': 'public_implementation',
                'V9.0.0P3_MUL': 'brief_ui_reference_unverified'}.get(version, 'unconfirmed_variant')
    return dict(model=model, firmware=firmware, firmware_extended=extended,
                hardware=hardware, variant_evidence=evidence,
                v9=bool(re.match(r'^V9\.', version, re.I)))


def allowed_roots(feature, candidate):
    if feature == 'wifi_clients':
        return ('OBJ_ACCESSDEV_ID', 'OBJ_WLAN_AD_ID')
    if feature == 'dhcp_leases' and candidate.tag == 'accessdev_ssiddev_lua.lua':
        return ('OBJ_ACCESSDEV_ID','OBJ_WLAN_AD_ID','OBJ_DHCPHOSTINFO_ID')
    if feature in {'lan_clients', 'dhcp_leases'}:
        return (candidate.root, 'OBJ_DHCPHOSTINFO_ID')
    return (candidate.root,)
