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
