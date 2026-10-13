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
