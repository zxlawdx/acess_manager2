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
| Radios | wlanBasic | wlan_wlanbasicadconf_lua.lua | OBJ_WLANSETTING_ID | Não testado | Candidato legado |
| Topology | mmTopology | topo_lua.lua | não necessário | Não testado | 404 descrito no Sentinel; não chamado pelo perfil |
| Optical | — | — | — | UNSUPPORTED por papel Ethernet | Não é ONT GPON |
| Writes | — | — | — | UNKNOWN | DOM e leitura não validam POST |

`profiles.py` alimenta tanto multimodel quanto o runtime. Cache local: candidato por feature, 404 por tag, contexto atual. Reconexão/login/logout e mudança de firmware limpam escolhas. Timeout de transporte máximo 5 s por chamada de perfil, orçamento de tentativa de 12 s; login reaproveita os timeouts existentes de autenticação. A primeira consulta descobre, refresh reutiliza o candidato selecionado.

Falhas: session_expired, login_page_instead_of_data, http_404, http_403, http_error, network_timeout/network_error, invalid_xml, wrong_schema, firmware_error. Sucesso: validated/valid_empty. O diagnóstico contém tag, view, roots, contagem e duração, sem XML ou valores de clientes.
