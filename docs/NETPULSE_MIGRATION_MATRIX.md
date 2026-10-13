# Access Manager — matriz de migração

Origem: zxlawdx/acess_manager; destino: zxlawdx/acess_manager2. Cada endpoint abaixo é evidência de uma superfície no legado, não de validação física.
Origem fixada em `1623bce8717b9b92683cd3904f9c2bd378da400c`; destino baseline `2ddeadf6a340ec574eae9616eb0d0654e44959e4`.

Esta matriz registra 177 rotas do SOURCE. Rotas sem mapeamento revisado ficam PENDENTE mesmo que existam fragmentos do protocolo no TARGET. Não há afirmação de paridade completa.

| Comportamento | Origem | Destino | Evidência nesta execução |
|---|---|---|---|
| Identidade Access Manager | referência visual anexada | tokens.css/app.css, fontes locais e template Vela | Chromium real em três resoluções, screenshots |
| Senha Wi-Fi ZTE | model/zte_configuration/zte_wifi.py | providers/zte.py + query wifi_reveal | regressão de argumento e teste DOM sob demanda |
| Clientes Huawei/ZTE | runtimes e leitores existentes | adapters, normalização, filtros e drawer | fixtures existentes, dedup MAC e teste DOM |
| Topologia | clientes reais | overview.js/clients.js | DOM; Mesh por nós ainda pendente |
| Tráfego | contadores WAN/LAN/clientes já portados | TrafficSampler + traffic.js | taxa, reset, SQLite/agregação por sessão; polling sem remoção de cards/gráficos/scroll |
| Diagnósticos | resultados nativos Huawei/ZTE | domain/diagnostics.py + shared/diagnostics.js | estatísticas, timeout, DOM |
| Sessão ZTE / views | ThinkLua menuView/menuData | operation_lock e retry de leitura | retry único; sem repetição de escrita |
| Histórico | repositories/history_repository.py, operations/redaction.py | infrastructure/history.py, domain/redaction.py | teste do SOURCE portado; regressão de segredos/outcome |
| Perfis | serviços provider-neutral existentes | formulário editar/excluir/preview/aplicar | múltiplos rádios/DNS/DHCP, preview, segredos transitórios e testes DOM/backend |



| Método | Rota legado | Arquivo origem | Função | Estado nesta branch |
|---|---|---|---|---|
| post | /system/backup | presentation/api/capabilities.py | export_configuration_backup | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| get | /device/capabilities | presentation/api/capabilities.py | capability_catalog | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /device/capabilities/probe | presentation/api/capabilities.py | capability_probe | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| get | /huawei/ipv4-filters | presentation/api/capabilities.py | huawei_ipv4_filters | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| get | /huawei/session-snapshot | presentation/api/capabilities.py | huawei_session_snapshot | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /huawei/session-snapshot/warm | presentation/api/capabilities.py | huawei_session_snapshot_warm | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /huawei/ipv4-filters/create | presentation/api/capabilities.py | huawei_ipv4_filter_create | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /huawei/ipv4-filters/update | presentation/api/capabilities.py | huawei_ipv4_filter_update | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /huawei/ipv4-filters/delete | presentation/api/capabilities.py | huawei_ipv4_filter_delete | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /huawei/features/update | presentation/api/capabilities.py | huawei_feature_update | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| get | /huawei/mapped | presentation/api/capabilities.py | huawei_mapped_catalog | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /huawei/mapped/read | presentation/api/capabilities.py | huawei_mapped_read | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /huawei/mapped/write | presentation/api/capabilities.py | huawei_mapped_write | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| get | /discovery/bootstrap | presentation/api/capabilities.py | discovery_bootstrap | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| get | /multimodel/catalog | presentation/api/capabilities.py | multimodel_catalog | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /multimodel/diagnostic | presentation/api/capabilities.py | multimodel_diagnostic | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /multimodel/mesh | presentation/api/capabilities.py | multimodel_mesh | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /multimodel/probe | presentation/api/capabilities.py | multimodel_probe | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| get | /features/shape | presentation/api/capabilities.py | feature_shape | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| get | /features/read | presentation/api/capabilities.py | read_feature | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| get | /device/status | presentation/api/devices.py | device_status | /device — leitura existente e composição parcial de overview |
| get | /device/optical | presentation/api/devices.py | optical_status | /device/optical — reader existente; fixtures |
| get | /device/accounts | presentation/api/devices.py | account_status | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /device/password | presentation/api/devices.py | change_admin_password | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /device/reboot | presentation/api/devices.py | reboot_device | /device/reboot — ZTE suportado; Huawei UNKNOWN preservado |
| post | /diagnostics/ping | presentation/api/diagnostics.py | ping | /device/diagnostics/ping — resultado normalizado e renderizado; fixtures/DOM |
| post | /diagnostics/traceroute | presentation/api/diagnostics.py | traceroute | /device/diagnostics/traceroute — resultado normalizado e saltos; fixtures |
| post | /diagnostics/automatic | presentation/api/diagnostics.py | automatic_diagnostic | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| get | /diagnostics/support/progress | presentation/api/diagnostics.py | support_diagnostic_progress | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /diagnostics/support | presentation/api/diagnostics.py | support_diagnostic | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /diagnostics/support/f6201b | presentation/api/diagnostics.py | support_diagnostic_f6201b | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /diagnostics/remediate | presentation/api/diagnostics.py | remediate_diagnostic | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| get | /diagnostics/workstation | presentation/api/diagnostics.py | workstation_diagnostic | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /diagnostics/speedtest | presentation/api/diagnostics.py | speedtest | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /diagnostics/attendance | presentation/api/diagnostics.py | generate_attendance | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /history/snapshot | presentation/api/diagnostics.py | capture_snapshot | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| get | /history | presentation/api/diagnostics.py | history | PARCIAL: /device/history — repository portado; API recente e UI de mudanças; demais fluxos pendentes |
| get | /f6201b/write/status | presentation/api/f6201b.py | f6201b_write_status | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| get | /f6201b/write/ssids | presentation/api/f6201b.py | f6201b_write_ssids | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /f6201b/write/preview | presentation/api/f6201b.py | f6201b_write_preview | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /f6201b/write/apply | presentation/api/f6201b.py | f6201b_write_apply | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /f6201b/write/update | presentation/api/f6201b.py | f6201b_write_update | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| get | /f6201b/wan/summary | presentation/api/f6201b.py | f6201b_wan_summary | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| get | /f6201b/dns/status | presentation/api/f6201b.py | f6201b_dns_status | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /f6201b/dns/preview | presentation/api/f6201b.py | f6201b_dns_preview | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /f6201b/dns/apply | presentation/api/f6201b.py | f6201b_dns_apply | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /f6201b/dns/update | presentation/api/f6201b.py | f6201b_dns_update | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| get | /f6201b/workbench/catalog | presentation/api/f6201b.py | f6201b_workbench_catalog | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /f6201b/workbench/inspect | presentation/api/f6201b.py | f6201b_workbench_inspect | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /f6201b/workbench/preview | presentation/api/f6201b.py | f6201b_workbench_preview | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /f6201b/workbench/apply | presentation/api/f6201b.py | f6201b_workbench_apply | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /f6201b/workbench/update | presentation/api/f6201b.py | f6201b_workbench_update | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| get | /multimodel/mapped-routes | presentation/api/f6201b.py | mapped_f6201b_routes | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /multimodel/mapped-inspect | presentation/api/f6201b.py | inspect_mapped_f6201b_route | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /f6201b/profile/preview | presentation/api/f6201b.py | f6201b_profile_preview | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /f6201b/profile/apply-saved | presentation/api/f6201b.py | f6201b_profile_apply_saved | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /f6201b/profile/apply | presentation/api/f6201b.py | f6201b_profile_apply | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| get | /huawei/lab | presentation/api/huawei_lab.py | huawei_lab_status | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /huawei/lab/mode | presentation/api/huawei_lab.py | huawei_lab_mode | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /huawei/lab/write | presentation/api/huawei_lab.py | huawei_lab_write | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /huawei/lab/reboot | presentation/api/huawei_lab.py | huawei_lab_reboot | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| get | /management/backups | presentation/api/management_artifacts.py | management_backups | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /management/backups/create | presentation/api/management_artifacts.py | management_backup_create | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /management/backups/compare | presentation/api/management_artifacts.py | management_backup_compare | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /management/backups/restore | presentation/api/management_artifacts.py | management_backup_restore | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| get | /management/firmware | presentation/api/management_artifacts.py | management_firmware | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /management/firmware/register | presentation/api/management_artifacts.py | management_firmware_register | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| get | /management/firmware/status | presentation/api/management_artifacts.py | management_firmware_status | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /management/firmware/upgrade | presentation/api/management_artifacts.py | management_firmware_upgrade | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| get | /management/acs | presentation/api/management_artifacts.py | management_acs_status | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /management/acs/configure | presentation/api/management_artifacts.py | management_acs_configure | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| get | /management/acs/discover | presentation/api/management_artifacts.py | management_acs_discover | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /management/acs/parameters | presentation/api/management_artifacts.py | management_acs_parameters | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /management/zero-touch | presentation/api/management_artifacts.py | management_zero_touch | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| get | /management/inventory | presentation/api/management_core.py | management_inventory | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /management/inventory/sync | presentation/api/management_core.py | management_inventory_sync | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /management/inventory/update | presentation/api/management_core.py | management_inventory_update | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| get | /management/profiles | presentation/api/management_core.py | management_profiles | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /management/profiles/save | presentation/api/management_core.py | management_profile_save | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /management/drift | presentation/api/management_core.py | management_drift | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /management/drift/remediate | presentation/api/management_core.py | management_drift_remediate | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /management/batch | presentation/api/management_core.py | management_batch_create | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| get | /management/batch | presentation/api/management_core.py | management_batch_jobs | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| get | /management/batch/job | presentation/api/management_core.py | management_batch_job | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| get | /management/agents | presentation/api/management_core.py | management_agents | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /management/agents/save | presentation/api/management_core.py | management_agent_save | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /management/agents/test | presentation/api/management_core.py | management_agent_test | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| get | /management/remote/sessions | presentation/api/management_core.py | management_remote_sessions | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /management/remote/open | presentation/api/management_core.py | management_remote_open | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /management/remote/close | presentation/api/management_core.py | management_remote_close | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /management/gateway/bufferbloat | presentation/api/management_core.py | management_gateway_bufferbloat | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /management/gateway/command | presentation/api/management_core.py | management_gateway_command | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /management/monitor/start | presentation/api/management_core.py | management_monitor_start | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| get | /management/monitor/status | presentation/api/management_core.py | management_monitor_status | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /management/monitor/stop | presentation/api/management_core.py | management_monitor_stop | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| get | /management/topology | presentation/api/management_core.py | management_topology | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| get | /management/incidents | presentation/api/management_core.py | management_incidents | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /management/incidents/correlate | presentation/api/management_core.py | management_incidents_correlate | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| get | /management/network | presentation/api/management_network.py | management_network_overview | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| get | /management/mesh | presentation/api/management_network.py | management_mesh_status | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /management/mesh/configure | presentation/api/management_network.py | management_mesh_configure | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /management/mesh/pair | presentation/api/management_network.py | management_mesh_pair | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| get | /management/qos | presentation/api/management_network.py | management_qos | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /management/qos/save | presentation/api/management_network.py | management_qos_save | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /management/qos/delete | presentation/api/management_network.py | management_qos_delete | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| get | /management/firewall | presentation/api/management_network.py | management_firewall | /device/firewall — reader integrado, Huawei restrito a nível global |
| post | /management/firewall/update | presentation/api/management_network.py | management_firewall_update | /device/firewall — writer existente integrado |
| get | /management/firewall/rules | presentation/api/management_network.py | management_firewall_rules | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /management/firewall/rules/save | presentation/api/management_network.py | management_firewall_rule_save | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /management/firewall/rules/delete | presentation/api/management_network.py | management_firewall_rule_delete | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /management/firewall/filter-global | presentation/api/management_network.py | management_filter_global | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| get | /management/sntp | presentation/api/management_network.py | management_sntp | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /management/sntp/update | presentation/api/management_network.py | management_sntp_update | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| get | /tr069/providers | presentation/api/management_network.py | list_tr069_providers | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /tr069/providers/save | presentation/api/management_network.py | save_tr069_provider | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /tr069/providers/delete | presentation/api/management_network.py | delete_tr069_provider | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| get | /tr069/setup | presentation/api/management_network.py | tr069_setup | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /tr069/providers/apply | presentation/api/management_network.py | apply_tr069_provider | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| get | /management/tr069 | presentation/api/management_network.py | management_tr069 | /device/tr069 — reader integrado |
| post | /management/tr069/update | presentation/api/management_network.py | management_tr069_update | /device/tr069 — writer existente integrado; Huawei somente URL ACS |
| get | /management/wan | presentation/api/management_network.py | management_wan | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /management/wan/create | presentation/api/management_network.py | management_wan_create | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /management/wan/update | presentation/api/management_network.py | management_wan_update | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /management/wan/delete | presentation/api/management_network.py | management_wan_delete | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /management/wan/action | presentation/api/management_network.py | management_wan_action | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /management/bridge | presentation/api/management_network.py | management_bridge | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| get | /upnp | presentation/api/network.py | upnp_status | /device/upnp — reader ZTE integrado; Huawei permanece desconhecido |
| post | /upnp/update | presentation/api/network.py | set_upnp | /device/upnp — writer ZTE integrado; controle de capability |
| get | /dns/status | presentation/api/network.py | dns_status | /device/dns — reader já portado; UI integrada; fixtures existentes |
| post | /dns/update | presentation/api/network.py | set_dns | /device/dns — writer existente; formulário de alterações parciais |
| get | /network/dhcp | presentation/api/network.py | dhcp_status | /device/dhcp — reader existente; leases/reservas exibidos |
| post | /network/dhcp/update | presentation/api/network.py | update_dhcp | /device/dhcp — writer existente; capability preservada |
| post | /network/dhcp/reservation/save | presentation/api/network.py | save_dhcp_reservation | /device/dhcp/reservations POST — create/update dos writers legados Huawei/ZTE; validação e testes HTTP/DOM; X6 UNKNOWN |
| post | /network/dhcp/reservation/delete | presentation/api/network.py | delete_dhcp_reservation | /device/dhcp/reservations DELETE — writers legados, confirmação e capability; X6 UNKNOWN |
| get | /network/port-forwarding | presentation/api/network.py | port_forwarding_status | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /network/port-forwarding/save | presentation/api/network.py | save_port_forward | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /network/port-forwarding/delete | presentation/api/network.py | delete_port_forward | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| get | /network/dmz | presentation/api/network.py | dmz_status | /device/dmz — adapter normalizado e leitura adicionada |
| post | /network/dmz/update | presentation/api/network.py | update_dmz | /device/dmz — writer reutilizado; preserva WAN/cliente/ID |
| get | /configuration/current | presentation/api/profiles.py | current_configuration | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| get | /profiles | presentation/api/profiles.py | profiles | PARCIAL: /profiles — lista/CRUD do mecanismo novo; equivalência do formato legado ainda pendente |
| post | /profiles/get | presentation/api/profiles.py | get_profile | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /profiles/save | presentation/api/profiles.py | save_profile | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /profiles/named/list | presentation/api/profiles.py | list_named_presets | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /profiles/named/get | presentation/api/profiles.py | get_named_preset | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /profiles/named/save | presentation/api/profiles.py | save_named_preset | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /profiles/named/delete | presentation/api/profiles.py | delete_named_preset | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /profiles/named/apply | presentation/api/profiles.py | apply_named_preset | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /profiles/capture | presentation/api/profiles.py | capture_profile | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /profiles/apply | presentation/api/profiles.py | apply_profile | /profiles/apply — preview, capability, segredos transitórios e resultados incertos; formato legado ainda parcial |
| get | /health | presentation/api/system.py | health | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| get | /desktop/capabilities | presentation/api/system.py | desktop_capabilities | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /desktop/clipboard | presentation/api/system.py | desktop_clipboard | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /connect | presentation/api/system.py | connect | /session POST — sessão existente preservada; testes login |
| post | /disconnect | presentation/api/system.py | disconnect | /session DELETE — sessão existente preservada |
| get | /connection/status | presentation/api/system.py | connection_status | /session GET — contrato de sessão existente |
| get | /debug/security | presentation/api/system.py | security_status | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| get | /wan/status | presentation/api/wan.py | wan_status | /device/wan — leitura normalizada Huawei/ZTE, campos humanos e Avançado; CRUD WAN pendente |
| get | /wan/pppoe | presentation/api/wan.py | pppoe_status | /device/wan — leitura da conexão PPPoE; alterações completas pendentes |
| get | /clients/wifi | presentation/api/wan.py | wifi_clients | /device/clients — dedup e SSID/banda/hostname/RSSI/SNR quando reconhecidos |
| get | /clients/lan | presentation/api/wan.py | lan_clients | /device/clients — clientes LAN observados, sem inventar porta/pai |
| get | /clients/telemetry | presentation/api/wan.py | client_telemetry | PARCIAL: /device/clients e /device/traffic — somente métricas presentes no firmware |
| get | /lan/ports | presentation/api/wan.py | lan_ports | /device/lan — leitura/link/duplex/negociação; UI e fixtures |
| get | /wifi/networks | presentation/api/wifi.py | wifi_networks | /device/wifi — leitura existente; revelação sob demanda via POST dedicado |
| post | /wifi/network/update | presentation/api/wifi.py | set_wifi_network | /device/wifi/ssid — writer existente; envio só de campos alterados; DOM |
| get | /wifi/radios | presentation/api/wifi.py | get_radios | /device/wifi — seção radios do contrato existente |
| get | /wifi/channels | presentation/api/wifi.py | get_channels | /device/wifi — options por rádio a partir do HTML/metadados existentes, sem fallback inventado |
| post | /wifi/radio/update | presentation/api/wifi.py | set_radio | /device/wifi/radio — writer existente e controles na UI |
| get | /wifi/power | presentation/api/wifi.py | wifi_power_status | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /wifi/power/update | presentation/api/wifi.py | set_wifi_power | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| get | /wifi/schedule | presentation/api/wifi.py | wifi_schedule_status | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /wifi/schedule/update | presentation/api/wifi.py | set_wifi_schedule | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| get | /wifi/wps | presentation/api/wifi.py | wifi_wps_status | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /wifi/wps/update | presentation/api/wifi.py | set_wifi_wps | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| get | /wifi/band-steering | presentation/api/wifi.py | band_steering_status | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /wifi/band-steering/update | presentation/api/wifi.py | set_band_steering | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |
| post | /wifi/band-steering/configure | presentation/api/wifi.py | configure_band_steering | PENDENTE — exige adaptar serviço/contrato, UI e testes; presença de protocolo no destino não é paridade operacional |

## Superfícies adicionadas na rodada 2

| Superfície | Contrato destino | Estado/evidência |
|---|---|---|
| Hosts DNS Huawei | /device/dns/hosts POST/DELETE | Writers capturados create/update/delete; validação, capability, API e testes; X6 bloqueado |
| Hosts DNS ZTE | /device/dns/hosts POST | F670L/F6600P upsert e readback; renomear/excluir bloqueado sem writer comprovado |
| Tráfego histórico | /device/traffic/history POST | SQLite por sessão, retenção/agregação e testes de isolamento |
| Huawei stPacketInfo/WaninfoStats | /device/traffic | Contadores reconhecidos, RX/TX Mbps; fixtures derivadas das referências |
| Gerenciamento | endpoints /device existentes | Campos humanos, telemetria e histórico; sem ampliar capabilities |
| Navegação operacional | sidebar | Capabilities/Implantação internas, ocultas; testes DOM |

A tabela das rotas históricas preserva pendências fora deste escopo. Leitura suportada não implica escrita ou validação física. Ver NETPULSE_EXECUTION_REPORT.md para bloqueios por firmware.

## Atualização: liberação por endpoint (2026-10-13)

A pedido do usuário, o bloqueio por modelo X6 foi substituído por disponibilidade da página autenticada na sessão. Os writers BBSP existentes de DHCP, DNS, reservas DHCP e hosts DNS (inclusive exclusão) ficam habilitados no X6 quando suas páginas correspondentes respondem. Página upstream DNS não habilita CRUD de hosts; cada superfície tem probe próprio. Writers mantêm validação e readback; disponibilidade não equivale a validação física. As afirmações anteriores de X6 sempre UNKNOWN foram superadas por esta regra.

Regressão após alteração: 57 testes passaram (X6, providers, HTTP Vela e writers capturados). Ausência de endpoint conserva UNKNOWN. Não houve nova alteração de frontend nem necessidade de repetir QA visual.

ZTE: `dns_hostname_lua.lua` possui implementação de Apply para upsert, mas não há endpoint/ação de exclusão comprovada no código legado. Essa operação continua indisponível. Mesh: o endpoint `easymeshTopo.asp` já está catalogado para leitura; o limite de representação vem da ausência de relações reconhecidas, não de uma trava de escrita a remover.

## Atualização: shell Vela e Perfis

Branch `fix/vela-shell-profile-layout`, sobre main `8e4a551` após os PRs anteriores. Corrigida a colisão de CSS global `main` com o host `#vela-page`: shell e wrappers agora ocupam a WebView sem padding externo; espaçamento em page-content, scroll no workspace, sidebar/topbar globais. Editor de Perfis sem SSIDs individuais, DHCP condicionado ao writer, rádios/DNS globais, header/ações fixos e conteúdo rolável; intenção técnica antiga preservada no backend.

13 testes DOM e QA Chromium em três resoluções passaram. QA adicional na WebView real pywebview/Qt offscreen pelo fluxo manage.py/runapp passou nas três resoluções, incluindo resize/maximize, bordas, overflow e modal. Dados de equipamento sintéticos; Windows/WebView2 não foi executado. Relatório e referências: VELA_SHELL_LAYOUT_REPORT.md; screenshots reais da WebView em docs/screenshots/vela. Backend de equipamento não foi alterado nesta etapa.

## Atualização: navegação, cache e valores técnicos

Branch fix/navigation-latency-technical-values sobre main 148365e. Geração/abort centralizados impedem render/erro/modal de navegação antiga; Wi-Fi e Perfis abrem imediatamente e carregam componentes em background. Cache por sessão em memória (15 s, revalidação após 3 s), sem secrets, invalidado após escrita. Formulários dirty preservados. Readers de SSIDs/rádios separados, memo Huawei limitado à operação e view de opções ZTE sem duplicação. Writer/protocolo não foi refeito. Valores técnicos roxos; status verdes/vermelhos e títulos preservados.

Suíte Python: 143 + 2 subtestes. QA no Vela/pywebview/Qt real, três resoluções, reproduziu os bugs anteriores e confirmou a correção. Cenário controlado 2 s: Wi-Fi shell 2003→1,9 ms; SSIDs 2003→104 ms; reabertura 2002→1,4 ms; Novo Perfil 2013→4,9 ms. Nenhuma medição física nova. Relatório: NAVIGATION_PERFORMANCE_REPORT.md; números exatos: performance-before.json/performance-after.json.

## Delta do relatório integral (base aad35f0)

| Superfície | Estado após esta rodada | Evidência / limite |
|---|---|---|
| Tráfego ZTE H3600P-style | Reader integrado com probes + fallback | Fonte pinada ZTE-Exporter; testes de protocolo/joins/ausência; hardware local pendente |
| Diagnóstico completo | Sidebar + coleta progressiva integrada | Reads existentes, ping, trace/lookup opcionais; falhas parciais e geração de navegação |
| DNS lookup ZTE nativo | Provider/CommandBus/API/UI disponíveis | Fluxo legado; hostname validado; F6201B/Huawei UNKNOWN nesta integração |
| Speed test AIS | Descoberta de servidores disponível | Fluxo legado; start/medição ainda não integrados; não universal por fabricante |
| UPnP Huawei | Writer/provider e UI Gerenciamento conectados | Mapped writer + estados por domínio + readback de ambos; perfis comprovados |
| Huawei affinity | Preservado existente | Afinidade TCP já conectada antes desta rodada; nenhuma alegação de nova implementação |
| F6201B 14 full forms | Núcleo migrado; integração operacional pendente | Preview/nonce/full payload/readback presentes; falta provider/API/UI completa |
| Huawei WAN/SNTP/IPv4 filters | Integração adicional pendente | Núcleos mapeados presentes; não liberar payload genérico a qualquer firmware |
| DHCP/DNS estáticos X6 | Disponível por probes, anterior | Sem gate de teste físico; mantendo leitores/writers anteriores |
| ZTE excluir host DNS | UNKNOWN | Writer/ação de exclusão ainda não comprovado; Apply não prova Delete |
| Mesh | Relações não comprovadas continuam ausentes | Nenhum parent/backhaul deduzido por nomes/modelos |
| Reset/backup/restore/firmware | Integração pendente | Não inventar multipart/configuração/ação; confirmação de alto impacto necessária na UI |
| Windows/WebView2 e hardware | Validação pendente | Qt real + dados sintéticos não equivalem a equipamento físico ou Windows |
