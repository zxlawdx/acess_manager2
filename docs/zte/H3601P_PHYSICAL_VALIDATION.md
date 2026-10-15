
## Functional parity round — 2026-10-15

Baseline `fix/zte-h3601p-v9` / `d0c795d21f54a54feda8d1717d265148d5e65ba7`. Continued the existing tree without reset, reclone or branch replacement.

The two-signature all-or-nothing bootstrap is replaced with independent bounded structural discovery. Valid-empty counts; one validated feature can select a read strategy. H288A-like/F6640-like scores and ties never manufacture model identity. Public UNKNOWN bus checks remain intact. Missing endpoints and wrong schemas are session-local negative evidence; view 404 alone no longer rules out a known menuData endpoint.

Radio normalization preserves all canonical fields including AutoChannelEnabled and advanced flags; missing flags stay null. OBJ_CHANNEL_ID shares a short-lived payload with radio reads and filters band/width/country without default channel tables. Public wifi_channels query and optional neighbor-scan capability are wired. ChannelAnalyzer is ported from the legacy service; no scan/no firmware destinations/Auto/no meaningful gain means no recommendation. Full diagnosis has Canais Wi-Fi, RF-only neighbor measurements, findings and JSON/CSV summaries.

Profile preview now reads radios directly, shows current manual 6 versus desired Automático, skips unknown writers, and reads legacy band-key profiles losslessly without changing storage on read. Native radio POST acceptance now requires a subsequent read-back before verified=true. DNS hosts with legacy nome remain recognized. Profile editor continues to exclude individual SSIDs and retain fixed header/footer.

WAN preserves DNS, uptime, remaining lease, errors and observed counters. DHCP leases/config fail independently. DNS, hosts, DMZ, UPnP, TR-069 and firewall have known, isolated read candidates; manual compatibility scan is available in full diagnostic tools and refreshes UI capabilities. Management may attempt PARTIAL reads; writes still require SUPPORTED.

Validation: **394 Python tests + 30 subtests passed**, **33 frontend tests passed**, frontend build/check and collectstatic successful. Native QA executes real `manage.py runapp`, Vela/Bottle endpoints and Qt WebEngine (Chromium), with only synthetic router transport and temporary app data. Nine pages checked at **1366×768, 1600×900, 1920×1080**. Shell edges, no horizontal shell/workspace overflow, modal centering/fixed actions and polling page/card/SVG/scroll/focus preservation passed. No app JS exceptions; existing framework Tailwind warning remains unrelated. Screenshots and QA JSON: `docs/screenshots/zte-parity/`.

Physical validation remains **not performed** for the new readers/writers. Only the owner's prior authentication success/statusMgr 404 is physical evidence. P1_MUL endpoint/form/token compatibility, neighbor availability, management features and Mesh relationships remain real unknowns. No Windows WebView2 run occurred in this Linux Qt environment. No H3601P write was promoted. Mesh discovery remains an independent pending feature; clients never depend on topo_lua.

`data/profiles.json` SHA256 remains `0c04d0a57d4ba19f9fcbdd91534f11252cc4ce1a8a76a29db9ffcab3b820e3de`. No change to main, no merge or force-push.

---

# H3601P P1_MUL — evidência física e pendências

## Log físico fornecido pelo proprietário

Fonte: prompt corretivo `PROMPT_CORRIGIR_H3601P_STATUSMGR_404_ACCESS_MANAGER`, recebido nesta rodada. O log veio do ambiente Windows do proprietário; não representa teste físico executado neste host de desenvolvimento. Não foram gravados host, IP, porta, usuário, senha, cookies ou tokens.

Modelo/firmware observados no GUI: ZXHN H3601P / V9.0.0P1_MUL.

| Etapa | Resultado físico relatado | Estado |
|---|---|---|
| login_entry GET | HTTP 200, token recebido | PHYSICALLY OBSERVED / owner log |
| login_token GET | HTTP 200, challenge recebido | PHYSICALLY OBSERVED / owner log |
| login_entry POST | HTTP 200, sem erro de login | PHYSICALLY OBSERVED / success |
| root refresh | HTTP 200, contexto recebido | PHYSICALLY OBSERVED |
| menuView statusMgr | HTTP 404 | PHYSICALLY OBSERVED / view ausente |
| menuData devmgr_statusmgr_lua.lua direto | Não testado no aparelho | Pendente |
| localNetStatus | Não alcançado no teste físico relatado | Pendente |
| accessdev_ssiddev_lua.lua | Não alcançado no teste físico relatado | Pendente |
| accessdev_landevs_lua.lua | Não alcançado no teste físico relatado | Pendente |

O patch anterior abortava após o 404 se não encontrasse footer/model_hint. A correção preserva a autenticação, tenta o device-info direto uma vez e permite assinatura limitada ou modo deployment autenticado. Nenhuma capability de clientes P1 recebeu evidência física nova.

## Reteste após esta correção

1. Feche o app e atualize a branch existente: `git pull --ff-only origin fix/zte-h3601p-v9`.
2. Preserve `data/profiles.json`. Não recrie/reset a branch. Este patch não altera esse arquivo.
3. Use o Python já funcional: `python manage.py collectstatic --no-tailwind`, depois `python manage.py runapp`.
4. Conecte no aparelho, sem exigir model_hint. Se só a assinatura for reconhecida, a identidade mostrada deve ser ZTE, não H3601P inventado.
5. Verifique `GET /api/device/runtime/diagnostic` ou execute, separadamente, `python tools/zte_probe_h3601p.py --host <endereco>`: senha sem echo; saída estrutural sanitizada, sem hint H3601P forçado.
6. Compare Clientes com o GUI localmente. Não publique nomes, IPs, MACs ou credenciais reais.

Não é necessário ativar `.venv` inexistente, instalar Node/npm ou reconstruir frontend: nenhum source frontend mudou. Se outra branch exigir build, siga seus requisitos próprios.

Log esperado: login OK → statusMgr 404 → tentativa menuData devmgr_statusmgr uma vez → resultado classificado → localNetStatus → primários accessdev LAN/WLAN quando identidade continuar ausente → sessão conectada. Se localNetStatus também falhar, sessão continua em deployment; tags anunciadas seguras aparecem no diagnóstico sem serem automaticamente chamadas.

## Histórico anterior ao log do proprietário

O registro abaixo documenta o estado inicial, antes desta nova evidência; as pendências de payload/clients P1 continuam válidas.

# Registro inicial: validação física ainda não executada

Device
- Model alvo: ZXHN H3601P.
- Firmware alvo: V9.0.0P1_MUL.
- Hardware: não fornecido por captura real.
- Access mode: não fornecido; sem endereço/sessão alcançável nesta execução.

Login / WLAN / LAN / WAN / Wi-Fi / LAN ports
- result: NOT TESTED on physical P1_MUL.
- endpoint/root/client count: não medidos.
- matches GUI: não comparado.
- evidence: somente testes automatizados com XML sintético e fontes públicas P2.

Optical: UNSUPPORTED por papel Ethernet. Writes: não testados e não habilitados pelo perfil.

## Executar no computador que alcança o roteador

```powershell
python tools/zte_probe_h3601p.py --host <endereco-do-roteador>
# acrescente --https somente se este for o transporte usado pelo GUI
```

Usuário pode ser digitado; senha é solicitada sem echo. Não existe argumento de senha. `--output estrutura.json` grava somente o relatório sanitizado. O probe usa login existente, somente os três grupos de listas conhecidos, sem POST de configuração. Não exporta IP, MAC, hostname, SSID, serial, senha, token ou cookie.

Para validar contagem e conteúdo, compare localmente Clientes no Access Manager com as listas WLAN/LAN da Home: mesmas MACs/IPv4/IPv6/classificação; aparelhos de nome igual com MAC diferente permanecem separados. Lease DHCP offline não deve aparecer como online. Não publique dados reais no relatório.

Se não corresponder: DevTools → Network → Preserve log → Fetch/XHR; navegar Home/listas LAN/WLAN/Internet/Rede local. Registrar apenas método, _type, _tag, view anterior, status, content-type, roots e nomes de campos não sensíveis. Não commitar HAR/XML cru. `probe` exporta estrutura, não fixture de dados; a criação futura de fixture P1 exige anonimização explícita e revisão de tokens/credenciais/clientes antes de salvar.

Se scripts reais estiverem disponíveis, inventariar somente strings de rotas conhecidas. Não foram fornecidos assets P1; nenhum endpoint adicional por banda foi inventado.
