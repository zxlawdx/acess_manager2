# Endpoints H3601P V9

Todos os candidatos são READ, por sessão autenticada. Root presente vazio é válido. HTTP 200 com HTML/login/erro/objeto errado não confirma suporte.

| Feature | menuView | menuData ordenado | Roots permitidos | P1_MUL | P2_VN1 / origem |
|---|---|---|---|---|---|
| WLAN clients | localNetStatus | accessdev_ssiddev_lua.lua; wlan_client_stat_lua.lua | OBJ_ACCESSDEV_ID / OBJ_WLAN_AD_ID | Não testado | Principal confirmado no código Sentinel; segundo compatibilidade legada |
| LAN clients | localNetStatus | accessdev_landevs_lua.lua | OBJ_ACCESSDEV_ID / OBJ_DHCPHOSTINFO_ID | Não testado | Código público Sentinel |
| DHCP known hosts | localNetStatus | dhcp4s_dhcphostinfo_m.lua; accessdev_landevs_lua.lua; accessdev_ssiddev_lua.lua | OBJ_DHCPHOSTINFO_ID; OBJ_ACCESSDEV_ID; OBJ_WLAN_AD_ID no fallback WLAN | Não testado | Candidatos públicos Sentinel |
| WAN | ethWanStatus | wan_internetstatus_lua.lua + TypeUplink=2/pageType=1 | ID_WAN_COMFIG | Não testado | Candidato do catálogo Access Manager/zte_tracker; não confirmação H3601P |
| LAN ports | localNetStatus | status_lan_info_lua.lua | OBJ_PON_PORT_BASIC_STATUS_ID | Não testado | Candidato legado; nome do objeto não transforma Ethernet em PON |
| SSIDs | wlanBasic | wlan_wlansssidconf_lua.lua | OBJ_WLANAP_ID | Não testado | Candidato legado |
| Radios | wlanBasic | wlan_wlanbasicadconf_lua.lua | OBJ_WLANSETTING_ID + optional OBJ_CHANNEL_ID | Não testado | Candidato legado |
| Topology | mmTopology | topo_lua.lua | não necessário | Não testado | 404 descrito no Sentinel; não chamado pelo perfil |
| Optical | — | — | — | UNSUPPORTED por papel Ethernet | Não é ONT GPON |
| Writes | — | — | — | UNKNOWN | DOM e leitura não validam POST |

`profiles.py` alimenta tanto multimodel quanto o runtime. Cache local: candidato por feature, 404 por tag, contexto atual. Reconexão/login/logout e mudança de firmware limpam escolhas. Timeout de transporte máximo 5 s por chamada de perfil, orçamento de tentativa de 12 s; login reaproveita os timeouts existentes de autenticação. A primeira consulta descobre, refresh reutiliza o candidato selecionado.

Falhas: session_expired, login_page_instead_of_data, http_404, http_403, http_error, network_timeout/network_error, invalid_xml, wrong_schema, firmware_error. Sucesso: validated/valid_empty. O diagnóstico contém tag, view, roots, contagem e duração, sem XML ou valores de clientes.


## Nova evidência P1_MUL — bootstrap

| Feature | P1_MUL | Evidência |
|---|---|---|
| login_entry GET | 200 | Log físico fornecido pelo proprietário |
| login_token GET | 200 | Log físico fornecido pelo proprietário |
| login_entry POST | 200 / success | Log físico fornecido pelo proprietário |
| root refresh | 200 | Log físico fornecido pelo proprietário |
| statusMgr menuView | 404 | Log físico fornecido pelo proprietário; não invalida login |
| devmgr_statusmgr_lua.lua direto | Não testado fisicamente | Novo fallback READ, uma tentativa após view 404 |
| localNetStatus | Não alcançado no log físico | Pendente de reteste |
| accessdev_ssiddev_lua.lua | Não alcançado no log físico | Pendente de reteste |
| accessdev_landevs_lua.lua | Não alcançado no log físico | Pendente de reteste |

Sem identidade, a assinatura usa apenas localNetStatus + os dois primários acima (três GET adicionais; quatro contando device-info direto). Nenhum fallback WLAN, DHCP de desempate, relogin ou tag anunciada arbitrária entra no bootstrap. Dois payloads válidos, incluindo `valid_empty`, são necessários para selecionar a estratégia compartilhada. O modelo continua ZTE. Ausência de assinatura conserva deployment autenticado e recursos UNKNOWN, com device PARTIAL e diagnóstico legível.

A assinatura compartilhada não prova uplink Ethernet: optical continua UNKNOWN nesse caso; somente uma identidade H3601P reconhecida mantém UNSUPPORTED por papel do modelo. Nenhuma leitura PON é despachada quando a capability é UNKNOWN.

## Parity additions (automated structural fixtures; P1 physical status unchanged)

| Feature | Endpoint/profile | Read | Write | Evidence | Test |
|---|---|---|---|---|---|
| clients | Shared accessdev / WLAN AD | Independently validated; PARTIAL on one list | n/a | Synthetic fixtures | bootstrap, client endpoints |
| wifi_ssids | wlan_wlansssidconf / OBJ_WLANAP | Shape validated | UNKNOWN | Synthetic | zte_read_parity |
| wifi_radio | wlan_wlanbasicadconf / OBJ_WLANSETTING | All canonical fields | UNKNOWN H3601P | Synthetic | zte_read_parity |
| wifi_channels | Same payload / OBJ_CHANNEL | SUPPORTED only when root observed; otherwise PARTIAL | n/a | Synthetic | zte_read_parity |
| wifi_neighbor_scan | wlanStaScanAP or wlanBasic; 3 canonical tags; APGetFrom | Optional independent read | n/a | Synthetic | zte_read_parity |
| wan | ethWanStatus / wan_internetstatus | Status, uptime, lease, error, DNS, observed counters | UNKNOWN | Synthetic | zte_read_parity |
| lan | status_lan_info | Actual returned ports | UNKNOWN | Synthetic | capabilities, zte_read_parity |
| dhcp | Known leases + Localnet_LanMgrIpv4_DHCPBasicCfg | Independent leases/config | UNKNOWN | Synthetic | zte_read_parity |
| dns | dns / dns_localdns, dns_hostname / ALLDNSHOST | Known independent candidates | UNKNOWN | Synthetic | zte_read_parity |
| management | dmz/upnp/remoteMgr/firewall canonical tags | Independent candidates, promotion after shape | UNKNOWN | Synthetic Vela QA | parity-native |
| diagnostics | Existing ping/trace/nslookup | Existing implementation, not H-promoted | UNKNOWN H3601P | Existing regressions | migrated diagnostic suite |
| mesh | Existing no-fabricated-edge fallback | No proven H edges | UNKNOWN | Not physically tested | clients remain independent |
| optical | None for identified H3601P | UNSUPPORTED known Ethernet H; UNKNOWN shared strategy | Blocked | Model gate regression | capabilities |

Scanner reports strategy scores/ties, nodes/counts/format, unknown object names and fixed error categories. It never returns response values. Advertised tags remain inventory-only.
