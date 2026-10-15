
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

# Access Manager — H3601P V9: correção de bootstrap

## Rodada atual: statusMgr 404

Base preservada: branch `fix/zte-h3601p-v9`, commit `99e7d1fa0cc72de7e6757700ee0263b350907345`. Não houve troca para main, reset, recriação de branch ou alteração de `data/profiles.json`. O hash desse arquivo foi comparado antes/depois. A alteração local mencionada no computador do proprietário não foi descartada; o patch remoto também não toca o arquivo.

### Root cause / antes

Login ThinkLua já era bem-sucedido. `connect` ainda propagava a falha em device_status quando o footer não identificava o modelo e não existia hint. Assim, a view statusMgr 404 impedia selecionar qualquer perfil e abortava POST /session.

### Depois

- Autenticação permanece obrigatória e separada da identificação. Login False/HTTP 401 na autenticação falha com `AUTH_REJECTED`, sem sessão deployment falsa. Não foram alterados SHA256, tokens, RSA, login_need_refresh ou refresh do protocolo.
- Consulta normal de device-info permanece para outros ZTE. Apenas se a view retornar 404, tenta devmgr_statusmgr_lua.lua diretamente uma vez, validando XML/roots conhecidos com o normalizador existente.
- HTML autenticado já armazenado e model_hint continuam opcionais. Ausência dos dois não lança erro de conexão.
- Sem identidade: localNetStatus + primários accessdev_ssiddev/accessdev_landevs, no máximo três GET para assinatura. Sem brute force, fallback adicional ou reautenticação no bootstrap. Dois payloads válidos são necessários, mesmo quando vazios.
- Assinatura seleciona estratégia de leitura, nunca inventa ModelName ou versão. Sessão permanece ZTE, profile h3601p_v9, source endpoint_signature, mode partial. Se não houver correspondência, permanece autenticada em deployment, sem capabilities/write fictícios.
- Device-info passa a ser opcional após conectar: retorna a melhor identidade disponível, profile/source/device_status_available; não repete uma view 404 em cada GET /device e não apresenta CPU/uptime antigos como leitura atual. Native ZTE conserva o retry de leitura existente e não mascara erros de parser não relacionados.
- Capabilities e metadata de sessão refletem os estados separados. Device PARTIAL quando status estruturado não existe; clients SUPPORTED somente após validação. Optical UNKNOWN para modelo inferido por assinatura, sem leitura PON; H3601P identificado permanece UNSUPPORTED. Writers não foram liberados.
- Diagnóstico inclui authentication, identity, profile_selection, connection_states, bootstrap_probes e tags seguras anunciadas. Sem host, porta, credenciais, payloads ou dados de clientes. Tags anunciadas não são automaticamente executadas; ações conhecidas são excluídas.
- Probe CLI não força model_hint H3601P e também exporta diagnóstico de ZTE desconhecido autenticado.

### Evidência P1_MUL

Login/token/refresh: HTTP 200 / sucesso no log físico do proprietário. statusMgr menuView: HTTP 404 no mesmo log. Device-info direto, localNetStatus e clientes LAN/WLAN ainda não foram alcançados no teste físico fornecido. Nenhum endpoint de clientes P1 foi promovido a fisicamente validado.

### Testes desta correção

- Regressão inicial reproduzida como teste falhando com HTTPError antes de alterar o bootstrap.
- **28 testes focados de bootstrap aprovados**: casos obrigatórios, assinatura vazia/múltipla, limites, classes HTTP/HTML/schema, auth rejeitada, diagnóstico sanitizado, APIs reais Vela/Bottle e preservação de modelos anteriores.
- **375 testes Python + 30 subtestes aprovados; 0 falhas e 0 skips.**
- **32 testes frontend aprovados**, sem alterar source/bundle frontend e sem exigir rebuild.
- collectstatic --no-tailwind e manage.py runapp validados no Vela/Qt real, 1366×768, 1600×900 e 1920×1080.
- QA nativo usa POST /session, GET /device, GET /device/clients e diagnóstico reais, sem interceptar fetch; somente o transporte do roteador é sintético. Sessão por assinatura conecta, mostra dois clientes/IPv6 sem identidade falsa; unknown permanece conectado; autenticação rejeitada continua no login.
- Evidências em `docs/screenshots/zte-bootstrap/qa.json` e capturas próprias dessa rodada. Dados da aplicação isolados em diretório temporário, preservando perfis do usuário.
- F670L, F6600P, F6201B e H3600P: matriz anterior e leituras normais preservadas por testes explícitos + suíte inteira. Uma regressão de retry encontrada no primeiro passe foi corrigida sem mudar o teste antigo.
- Windows físico após a correção: não executado aqui. Não substituir esse limite pelo QA Qt offscreen.

### Arquivos e referências

`discovery/bootstrap.py`, provider ZTE, extração reutilizável de device-info na facade, validação compartilhada do profile runtime, erro tipado no boundary, metadata de sessão, probe CLI e testes específicos. Nenhum source de UI, login protocol, writer ou arquivo de perfis alterado.

Referência conceitual reaberta: juacas/zte_tracker, `custom_components/zte_tracker/zteclient/zte_client.py` (query_router_details/get_router_details opcional e erro isolado) e `custom_components/zte_tracker/support_bundle.py` (probes limitadas, tags anunciadas e categorização estrutural). Revisão consultada da pesquisa: f1911857e2dc2b5da8dc5b891d4ffd67d6e5c832. Licença GPL-3.0; nenhum código copiado, Home Assistant não foi transplantado.

### Reteste no Windows

```powershell
git pull --ff-only origin fix/zte-h3601p-v9
python manage.py collectstatic --no-tailwind
python manage.py runapp
```

A branch já existe no computador do proprietário. Não recriar com switch -c, não resetar, não descartar profiles.json e não presumir que .venv existe. Nenhum npm ci/sync_frontend é necessário para este patch backend.

Esperado: login OK → statusMgr 404 → tentativa direta de device-info → identidade ou assinatura limitada → sessão conectada. Se nenhuma leitura corresponder, deployment autenticado com diagnóstico, não falha inesperada. Para saída sanitizada, usar separadamente `tools/zte_probe_h3601p.py` com o endereço local do aparelho; senha sem echo.

## Histórico do patch anterior (99e7d1f)

Os resultados e pendências abaixo descrevem a rodada anterior, antes do log físico e desta correção.

# Access Manager — H3601P V9

## Baseline e branch

Base: `feat/direct-visual-references`, `740638e1ba215246c16c77f7f91a5468e15c2a8b`, working tree inicialmente limpo. Branch `fix/zte-h3601p-v9`. Commits de implementação: `git log --oneline 740638e1ba215246c16c77f7f91a5468e15c2a8b..fix/zte-h3601p-v9`. Nenhum merge na main ou nas variantes visuais.

## Causa e correção

O catálogo não mapeava H3601P; provider/facade usavam clientes legados diretamente e o Wi-Fi fixava wlan_client_stat com OBJ_WLAN_AD_ID. O parser pressupunha um cliente por Instance. Optical era anunciado genericamente para ZTE.

Perfil explícito `h3601p_v9` centraliza candidatos compartilhados com multimodel. O runtime real, a facade e discovery usam o mesmo reader H3601P; outras famílias mantêm caminhos antigos. Detecção usa identificação estruturada, footer estrito apenas como fallback, ou hint sem inventar firmware/prova de suporte. Modelo, versão estendida, hardware e sufixo de operadora permanecem na fingerprint sanitizada.

WLAN: accessdev_ssiddev → wlan_client_stat. LAN: accessdev_landevs. DHCP: dhcp4s hostinfo → listas accessdev. A ausência de topo_lua não interfere. DHCP apenas enriquece dispositivos já observados por identidade; não acrescenta leases conhecidos como clientes ativos. Falha WLAN isolada conserva LAN e sessão, com aviso humano.

menuView faz parte do protocolo, com cache de contexto atual. Login/relogin/logout e firmware alterado limpam caches. READ reautentica uma vez; nenhum retry de WRITE. XML valida sessão, envelope, IF_ERRORID/STR, roots e shape; lista vazia correta é aceita. Parser suporta namespaces, registros completos, fragmentados, aliases/qualificadores e IPv6 link-local/múltiplo. Dedup por MAC; fallback opcional por identificador com origem/IP somente no H3601P, nunca hostname. Fonte é metadata sem raw de cliente.

## Capabilities e UI

Device: leitura identificada; hint sozinho PARTIAL. Clientes/LAN/WAN/Wi-Fi: PARTIAL até shape válido; promovidos por feature quando a sessão confirma, sem alegar validação física. DHCP é inventário de leases, não writer/configuração comprovados. Optical UNSUPPORTED e Overview não consulta nem exibe erro óptico. Mesh/traffic PARTIAL, sem enlaces/contadores inventados. Todos os writes H3601P ficam UNKNOWN, incluindo manutenção/configuração; guardas de comando impedem mutação. A sessão pública reflete capabilities atuais ao consultar status.

UI existente recebe IPv6 em tabela/drawer/busca e continua renderizando exatamente o número de portas retornado. Sem redesign. O teste usa duas LAN e dois clientes de nome igual, IPv4/IPv6 e MACs diferentes.

## Validação

- Python: **347 testes + 30 subtestes**, todos aprovados; 0 falhas, 0 skips.
- Frontend: **32 aprovados**.
- Build: sync_frontend, --check e collectstatic --no-tailwind.
- Chromium: navegação/overflow/drawer/polling em 1366×768, 1600×900, 1920×1080.
- Vela real / pywebview Qt offscreen: suite existente e QA H3601P nas três resoluções; sem erros JS de aplicação; XML sintético passa pelo provider para gerar os dados de teste. IPv6, dois clientes distintos, duas LAN e zero requests ópticos confirmados.
- Capturas: `docs/screenshots/zte-h3601p/`. Arquivos de fixtures em `tests/fixtures/zte/h3601p` declaram explicitamente origem estrutural pública P2 e ausência de captura P1.
- F670L/F6600P: regressões ópticas/writers e endpoint legado; H3600P continua h288a; demais ZTE/Huawei cobertos pela suíte inteira.
- Windows/WebView2: não executado. P1_MUL físico: não executado. Aviso CDN Tailwind preexistente do Vela; maximize offscreen 796×796, os três tamanhos definidos explicitamente.

## Executar

```powershell
git fetch origin fix/zte-h3601p-v9:refs/remotes/origin/fix/zte-h3601p-v9
git switch --track origin/fix/zte-h3601p-v9
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python tools\sync_frontend.py
python manage.py collectstatic --no-tailwind
python manage.py runapp
```

Se a branch já existir localmente: `git switch fix/zte-h3601p-v9`, depois `git pull --ff-only`. Probe separado: `python tools/zte_probe_h3601p.py --host <host>`, senha sem echo.

## Limites reais

Não é suporte integral fisicamente validado. Clientes reais P1 e comparação com GUI continuam pendentes de executar o probe/app no equipamento. Tags WAN/SSID/rádio/LAN são candidatos ainda não confirmados no P1. Sem captura de POST/token/Check/read-back, writers continuam fechados. Sem assets reais, nenhum candidato por banda, sufixo de root ou relação Mesh foi inventado.

Documentos: H3601P_RESEARCH, ENDPOINT_MATRIX, EVIDENCE_MATRIX, PHYSICAL_VALIDATION e WEB_ASSET_SCAN neste diretório; PARITY_MATRIX e checkpoint atualizados.
