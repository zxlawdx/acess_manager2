# Access Manager — checkpoint de recuperação

Data: 2026-10-13. Branch: `feat/provider-parity-round2`. Base main: `8c6dea5c5b24069c5442a11ccf48baa569dde5b7` (PRs #1 e #2 integrados).

## Estado preservado

Hosts DNS e reservas DHCP integrados nos adapters/API/UI, usando writers legados; exclusão ZTE DNS e escritas Huawei X6 não comprovadas continuam bloqueadas. Contadores Huawei e associações enriquecidas, contratos humanos de DHCP/DNS/WAN/dispositivo, opções de rádio observadas, perfis com múltiplos rádios/DNS/DHCP/preview, Gerenciamento/telemetria/histórico e sidebar operacional concluídos dentro das capabilities existentes. Topologia não inventa Mesh.

## Validação final

- `python -m pytest -q`: **138 passed, 2 subtests passed**.
- `npm test`: **11 passed**.
- `npm run test:visual`: **1366×768, 1600×900, 1920×1080 passaram**, sem erros JavaScript; navegador Chromium real com fixtures sintéticas.
- Polling real em cada resolução: preservou página, card, SVG e scroll; não removeu card e acrescentou pontos ao gráfico.
- `sync_frontend.py --check`, collectstatic, compileall, node --check e git diff --check passaram.
- Screenshots em docs/screenshots. Nenhum teste físico novo foi alegado.

## Retomada sem reiniciar

Usar NETPULSE_EXECUTION_REPORT.md e NETPULSE_MIGRATION_MATRIX.md. SOURCE intacto em ../acess_manager; referências ONTWatch/huawei-ont-stats já consultadas em ../references. Não reclonar nem refazer inventário. Dependências Python foram reinstaladas porque o runtime da sessão havia sido restaurado sem elas; repositórios existentes foram preservados.

Pendências específicas: obter writer comprovado de exclusão DNS ZTE, capturas de escrita X6, relações Mesh/backhaul e validação física. Fora desta rodada continuam rotas legadas de WAN CRUD, regras firewall/QoS/port-forward/SNTP/WPS/agendas, frota/monitor/backup e outras já marcadas na matriz.

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

## Atualização: integração do relatório integral

Branch feat/report-runtime-integration, base aad35f0 (main com PR #6). Working tree anterior preservado, sem reclone/auditoria repetida. Anexos (1)(1)/(1)(2) idênticos.

Novos arquivos: infrastructure/zte/traffic.py; workspaces/views/complete-diagnostics.js. Provider ZTE ligado a probes WAN/LAN/WLAN por IDs; DNS lookup/discovery speedtest no CommandBus/API/UI. UPnP Huawei integrado com preservação de estado parcial e verificação por ambos os objetos. Sidebar Diagnóstico completo progressivo, reads forçados, ping e opcionais. Shell/Perfis/latência anteriores preservados.

Suíte atual: 162 Python + 2 subtests; 24 DOM. QA Chromium e Vela real Qt três resoluções, dados sintéticos; nenhuma validação física/Windows nova. Capturas complete-diagnostics-*.

Próximas pendências independentes: integrar F6201B full_forms/workbench (14 formulários) sem inventar campos ausentes; Huawei SNTP/WAN/IPv4filters; gerenciamento backup/restore/firmware/reset e speed start comprovados; Wi-Fi avançado; Mesh somente relações observadas. A migração integral continua pendente e não deve ser declarada concluída. Preservar afinidade TCP Huawei existente e política sem retry de mutations. ZTE DNS Delete continua sem writer comprovado.

## Rodada de fechamento — conjunto 1

Base main 236518f (PR #7 integrado), branch feat/research-implementation-closure. 14 FullCapturedForms e 7 estratégias simples F6201B ligadas por OperationalConfigurations → provider → API configuration/catalog/read/preview/apply → Gerenciamento. Campos frontend têm IDs neutros e labels humanas; nonce/estado privado ficam no backend. Confirmar APLICAR antes da mutation; formato condicional ausente continua erro concreto do preflight. Testes funcionais portados do legado: captured_form substitui o contrato antigo supervised_lab; dummy writes_enabled não é alterado e não interfere no transporte funcional.

Suíte até aqui: 189 passed + 30 subtests. NativeGateway adapters para port-forward/SNTP/firewall/QoS e adapters mapeados Huawei adicionados; falta ampliar testes desses adapters, diagnóstico de speedtest, gerenciamento/artefatos/histórico, revisão dirigida de todas as evidências e QA final. Não publicar nem declarar fechamento antes desses conjuntos.

## Rodada de fechamento — conjunto 2 (em andamento)

OperationalConfigurations inclui agora gateway ZTE com preview/merge/readback para port-forwarding, SNTP, filtros IP/MAC/global e QoS; drivers funcionais WAN CRUD, TR-069 ampliado, admin password e rádio avançado. F6201B RF usa ordenação exata da captura, AutoChRange=0 somente no firmware exato documentado, demais campos ausentes não são inventados. Huawei inclui mapped SNTP/DST/DSCP/política MAC/serviços LAN/WAN e IPv4 filtering; campos não presentes no writer não são habilitados por semelhança.

NativeSpeedtest divide start único/poll de leitura; artefatos locais com IDs opacos/SHA/metadata, export/restore/firmware ZTE usam fluxo do legado (POST de permissão separado da mutation do upload). Cliente POST não segue redirects, evitando replay 307/308. Reboot HG8245H separado por rand_count/api_ses_token; demais famílias dependem de evidência própria. Contratos óptico/Mesh e binding de tráfego UUID→host/identificador acrescentados. Próximo: testes novos de adapters/artefatos/speedtest/histórico, integração de UI Diagnóstico, verificação dirigida do resto da matriz e closure completo.

## Retomada de fechamento — 2026-10-13

Branch `feat/research-implementation-closure`, base main `236518f2e017a14b6042458667c7d4a53638a1b2`. Working tree preservado após desconexão do runtime. Entregas e limites dos 30 conjuntos estão detalhados em [RESEARCH_IMPLEMENTATION_CLOSURE.md](RESEARCH_IMPLEMENTATION_CLOSURE.md); esse registro atualiza o estado dos conjuntos anteriores sem apagar as pendências da migração integral.

14 full forms F6201B, adapters operacionais ZTE/Huawei, speedtest start/poll, backup/restore/firmware ZTE, reboot Huawei por família, Wi-Fi avançado comprovado, discovery, normalização óptica/Mesh, histórico entre sessões e UI correspondente integrados localmente. Acrescentados ALG, acesso remoto IPv4/IPv6, Telnet, portas administrativas em vetor e reset de fábrica com fingerprint de formulário/nonce/RESETAR. NAT fornece somente contadores comprovados.

Validação atual: Python 269 passed + 30 subtests; DOM 25 passed; frontend sync, collectstatic --no-tailwind, compileall e diff check passaram. QA Chromium e WebView Vela real Qt/offscreen passou em 1366×768, 1600×900 e 1920×1080: bordas, overflow, modal, navegação e resize/maximize. Polling Chromium preservou cards/SVG/página/scroll. Sem teste físico ou Windows novo. Nenhum novo PR publicado até este checkpoint; alterações na branch local. A migração integral NÃO está concluída; limites concretos estão no closure.

## Diagnóstico completo — evolução do painel

Branch feat/full-diagnostic-dashboard, base main b36c8fc (PR #8 integrado). A tela de coleta anterior foi reorganizada no painel solicitado. FullDiagnosticService reutiliza buses e histórico diagnostic_run; execuções/retestes reais, HTTPS explícito do host em paralelo, resultados normalizados, gráficos de amostras persistidas, filtros por equipamento/período/status e export JSON/CSV sem secrets. UNKNOWN não vira falha nem sucesso. Shell/Diagnóstico simples preservados. Relatório: FULL_DIAGNOSTIC_DASHBOARD_REPORT.md.

Validação: 295 Python + 30 subtests, 28 DOM; Chromium e Vela real Qt nas três resoluções, dados de equipamento sintéticos. Capturas diagnostic-dashboard-* em docs/screenshots/vela. Nenhuma validação física/Windows nova; migração integral continua com as pendências de RESEARCH_IMPLEMENTATION_CLOSURE.md.

## Referências diretas — Login / Overview / Tráfego / Diagnóstico completo

Branch feat/direct-visual-references, base main 09e6fce com PR #9 integrado. HTMLs A/B e capturas C/D conferidos. Login separado do shell, credenciais removidas do dashboard. Overview com hierarquia completa da referência; Tráfego com gráfico principal e ranking lateral; renderer SVG/polling compartilhado; Diagnóstico completo adaptado à referência HTML B. Fontes locais, nenhum mock/CDN novo, backend preservado.

Validação: 295 Python + 30 subtests; 31 frontend; Chromium e Vela real Qt nas três resoluções. Capturas login/overview/traffic/complete-diagnostics em docs/screenshots/vela. Detalhes: DIRECT_VISUAL_REFERENCES_REPORT.md. Dados de equipamento sintéticos nos testes; nenhum teste físico/Windows novo.
