from __future__ import annotations

from apps.access_manager.domain.profiles import NetworkProfile, ProfileOperation


class BaseProfileTranslator:
    """Translate only provider-neutral intent into application command names."""

    def translate(self, profile: NetworkProfile) -> list[ProfileOperation]:
        operations: list[ProfileOperation] = []
        wifi = profile.wifi or {}

        for item in wifi.get("ssids") or []:
            if not isinstance(item, dict) or item.get("id") is None:
                continue
            ssid_id = item.get("id")
            config = {key: value for key, value in item.items() if key != "id"}
            if config:
                operations.append(ProfileOperation(
                    feature="wifi",
                    method="set_ssid_config",
                    args=(ssid_id, config),
                    label=f"SSID {ssid_id}",
                ))

        radios = wifi.get('radios')
        if not isinstance(radios,list):
            radios=[wifi.get('radio')] if isinstance(wifi.get('radio'),dict) else []
        for radio in radios:
            if isinstance(radio,dict) and radio:
                values=dict(radio)
                if 'power' in values:values.setdefault('tx_power',values.pop('power'))
                operations.append(ProfileOperation(feature='wifi_radio',method='set_wifi_radio',args=(values,),label='Rádio '+str(radio.get('band') or 'Wi-Fi')))

        if profile.dns:
            from ipaddress import ip_address
            dns=dict(profile.dns)
            if 'primary' in dns: dns['ipv4_1']=dns.pop('primary')
            if 'secondary' in dns: dns['ipv4_2']=dns.pop('secondary')
            servers=dns.pop('servers',None)
            if servers is not None:
                groups={4:[],6:[]}
                for item in servers:
                    parsed=ip_address(str(item));groups[parsed.version].append(str(parsed))
                if any(len(values)>2 for values in groups.values()):
                    raise ValueError('Até dois DNS IPv4 e dois IPv6 podem ser aplicados por este perfil')
                for version,values in groups.items():
                    for index,item in enumerate(values,1):dns[f'ipv{version}_{index}']=item
            if dns:
                operations.append(ProfileOperation(
                    feature="dns",
                    method="set_dns",
                    args=(dns,),
                    label="DNS",
                ))

        if profile.dhcp:
            operations.append(ProfileOperation(
                feature="dhcp",
                method="set_dhcp",
                args=(dict(profile.dhcp),),
                label="DHCP",
            ))

        return operations
