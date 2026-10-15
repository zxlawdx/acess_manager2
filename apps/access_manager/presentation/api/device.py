from .common import *
@api.get("/device")
def device(context=None): return safe(queries.device)
@api.get("/device/clients")
def clients(context=None): return safe(queries.clients)
@api.get("/device/wifi")
def wifi(context=None): return safe(queries.wifi)
@api.get("/device/wifi/ssids")
def wifi_ssids(context=None): return safe(queries.wifi_ssids)
@api.get("/device/wifi/channels")
def wifi_channels(context=None): return safe(queries.wifi_channels)

@api.get("/device/wifi/radios")
def wifi_radios(context=None): return safe(queries.wifi_radios)
@api.post("/device/wifi/reveal-password")
def wifi_reveal_password(context=None): return safe(queries.wifi_reveal)
@api.get("/device/wan")
def wan(context=None): return safe(queries.wan)
@api.get("/device/traffic")
def traffic(context=None): return safe(queries.traffic)
@api.get("/device/lan")
def lan(context=None): return safe(queries.lan)
@api.get("/device/dhcp")
def dhcp_read(context=None): return safe(queries.dhcp)
@api.get("/device/dns")
def dns_read(context=None): return safe(queries.dns)
@api.get("/device/optical")
def optical(context=None): return safe(queries.optical)
@api.get("/device/capabilities")
def capabilities(context=None): return safe(lambda: sessions.provider.capabilities.public())
@api.post("/device/reboot")
def reboot(context=None):
    def run():
        if body(context).get('confirm') is not True:raise ValueError('Confirme explicitamente o reboot')
        return commands.reboot()
    return safe(run)
@api.post("/device/wifi/ssid")
def wifi_ssid(context=None):
    d=body(context); return safe(lambda: commands.set_ssid(d['ssid_id'],d.get('config') or {}))
@api.post("/device/wifi/radio")
def wifi_radio(context=None): return safe(lambda: commands.set_wifi_radio(body(context)))
@api.post("/device/dns")
def dns(context=None): return safe(lambda: commands.set_dns(body(context)))
@api.post("/device/dhcp")
def dhcp(context=None): return safe(lambda: commands.set_dhcp(body(context)))

@api.post("/device/diagnostics/ping")
def diagnostic_ping(context=None): return safe(lambda: commands.ping(body(context)))

@api.post("/device/diagnostics/traceroute")
def diagnostic_traceroute(context=None): return safe(lambda: commands.traceroute(body(context)))

@api.get("/device/dmz")
def dmz_read(context=None): return safe(queries.dmz)
@api.post("/device/dmz")
def dmz_write(context=None): return safe(lambda: commands.set_dmz(body(context)))

@api.get("/device/upnp")
def upnp_read(context=None): return safe(queries.upnp)
@api.post("/device/upnp")
def upnp_write(context=None): return safe(lambda: commands.set_upnp(body(context)))

@api.get("/device/tr069")
def tr069_read(context=None): return safe(queries.tr069)
@api.post("/device/tr069")
def tr069_write(context=None): return safe(lambda: commands.set_tr069(body(context)))

@api.get("/device/firewall")
def firewall_read(context=None): return safe(queries.firewall)
@api.post("/device/firewall")
def firewall_write(context=None): return safe(lambda: commands.set_firewall(body(context)))

@api.get("/device/history")
def operation_history(context=None):
    from apps.access_manager.composition import history
    return safe(history.recent)

@api.post("/device/traffic/history")
def traffic_history(context=None): return safe(lambda: queries.traffic_history(body(context).get('seconds',3600)))

@api.post("/device/dhcp/reservations")
def reservation_save(context=None): return safe(lambda: commands.save_reservation(body(context)))
@api.delete("/device/dhcp/reservations")
def reservation_delete(context=None): return safe(lambda: commands.delete_reservation(body(context)))

@api.post("/device/dns/hosts")
def dns_host_save(context=None): return safe(lambda: commands.save_dns_host(body(context)))
@api.delete("/device/dns/hosts")
def dns_host_delete(context=None): return safe(lambda: commands.delete_dns_host(body(context)))

@api.post("/device/diagnostics/dns-lookup")
def diagnostic_dns_lookup(context=None): return safe(lambda: commands.dns_lookup(body(context)))

@api.post("/device/diagnostics/speedtest-discovery")
def speedtest_discovery(context=None): return safe(commands.discover_speedtest)

@api.get("/device/configuration/catalog")
def surface_catalog(context=None): return safe(queries.surface_catalog)
@api.post("/device/configuration/read")
def surface_read(context=None): return safe(lambda: queries.surface_read(body(context)['feature']))
@api.post("/device/configuration/preview")
def surface_preview(context=None): return safe(lambda: commands.surface_preview(body(context)))
@api.post("/device/configuration/apply")
def surface_apply(context=None): return safe(lambda: commands.surface_apply(body(context)))

@api.post("/device/diagnostics/speedtest/start")
def speedtest_start(context=None): return safe(lambda: commands.speedtest_start(body(context)))
@api.post("/device/diagnostics/speedtest/poll")
def speedtest_poll(context=None): return safe(lambda: queries.speedtest_poll(body(context)['run_id']))

@api.get("/device/mesh")
def mesh_read(context=None): return safe(queries.mesh)
@api.post("/device/traffic/device-history")
def device_traffic_history(context=None): return safe(lambda: queries.device_traffic_history(body(context)))

@api.get("/device/firmware/status")
def firmware_status(context=None): return safe(queries.firmware)
@api.get("/device/accounts")
def accounts(context=None): return safe(queries.accounts)
@api.get("/management/artifacts")
def artifact_list(context=None):
    from apps.access_manager.composition import artifacts
    return safe(artifacts.repository.list)
@api.post("/management/artifacts/backup")
def artifact_backup(context=None):
    from apps.access_manager.composition import artifacts
    return safe(artifacts.backup)
@api.post("/management/artifacts/upload")
def artifact_upload(context=None):
    from apps.access_manager.composition import artifacts
    return safe(lambda: artifacts.upload(body(context)))
@api.post("/management/artifacts/download")
def artifact_download(context=None):
    from apps.access_manager.composition import artifacts
    return safe(lambda: artifacts.repository.download(body(context)['id']))
@api.post("/management/artifacts/apply")
def artifact_apply(context=None):
    from apps.access_manager.composition import artifacts
    return safe(lambda: artifacts.apply(body(context)))

@api.post("/device/diagnostics/collection")
def diagnostic_collection(context=None): return safe(lambda: commands.save_collection(body(context)))
@api.post("/device/diagnostics/workstation")
def workstation(context=None):
    from apps.access_manager.application.services.workstation_path_diagnostic import WorkstationPathDiagnostic
    return safe(lambda: WorkstationPathDiagnostic().run())

@api.get("/device/runtime/diagnostic")
def runtime_diagnostic(context=None): return safe(queries.runtime_diagnostic)

@api.get("/device/nat/sessions")
def nat_sessions(context=None): return safe(queries.nat_sessions)

@api.post("/device/factory-reset/preview")
def factory_reset_preview(context=None): return safe(commands.factory_reset_preview)

@api.post("/device/factory-reset/apply")
def factory_reset_apply(context=None): return safe(lambda: commands.factory_reset_apply(body(context)))

@api.get("/device/diagnostics/full/config")
def full_diagnostic_config(context=None):
    from apps.access_manager.composition import full_diagnostics
    return safe(full_diagnostics.config)
@api.post("/device/diagnostics/full/run")
def full_diagnostic_run(context=None):
    from apps.access_manager.composition import full_diagnostics
    return safe(lambda: full_diagnostics.run(body(context)))
@api.post("/device/diagnostics/full/history")
def full_diagnostic_history(context=None):
    from apps.access_manager.composition import full_diagnostics
    return safe(lambda: full_diagnostics.history_rows(body(context)))
@api.post("/device/diagnostics/full/export")
def full_diagnostic_export(context=None):
    from apps.access_manager.composition import full_diagnostics
    return safe(lambda: full_diagnostics.export(body(context)))

@api.post("/device/runtime/compatibility")
def compatibility_scan(context=None): return safe(queries.compatibility_scan)
