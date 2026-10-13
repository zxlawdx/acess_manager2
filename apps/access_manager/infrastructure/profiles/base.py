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

        radio = wifi.get("radio")
        if isinstance(radio, dict) and radio:
            operations.append(ProfileOperation(
                feature="wifi_radio",
                method="set_wifi_radio",
                args=(dict(radio),),
                label="Wi-Fi radio",
            ))

        if profile.dns:
            operations.append(ProfileOperation(
                feature="dns",
                method="set_dns",
                args=(dict(profile.dns),),
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
