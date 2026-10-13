# Access Manager — referências visuais aplicadas

Base main `09e6fce` (PR #9 integrado), branch `feat/direct-visual-references`. Alteração dos arquivos-fonte e regeneração do bundle; providers, protocolos, writers e sessão do backend preservados.

## Mapa de referências

| Referência | Fonte conferida | Aplicação |
|---|---|---|
| A | Texto colado (2)(10).txt — Conectar ao equipamento | Card isolado em duas colunas, conteúdo/form/status/botão e SVG abstrato portado da referência. IP ou IP:porta, usuário, senha, Mostrar/Ocultar, HTTPS e endpoint real /api/session. Sem sidebar/dashboard enquanto desconectado. |
| B | Texto colado(20261013-111224).txt e captura image(20261013-101443).png | Diagnóstico completo existente preservado; adaptados títulos de 21px, badge do equipamento, linhas de conectividade como cards, Wi-Fi em grid expansível e base visual compartilhada. Histórico/testes/export continuam reais. Sem importar mocks ou SDKs. |
| C | Capturas image(20261013-100415).png / hierarquia do prompt | Visão Geral: header com modelo real, cinco métricas, Fluxo de tráfego + Resumo, WAN/Wi-Fi/Alertas, CPU/Sinal e Topologia. Nenhum Gateway Principal, endereço, alerta ou limiar óptico fictício. |
| D | Captura image(20261013-100407).png | Tráfego: gráfico grande azul/violeta com áreas, grid e tooltip escuro; ranking lateral; múltiplos sparklines removidos como composição principal. Interface selecionável sem somar WAN/LAN/WLAN. |

## Arquivos e componentes

`templates/index.html`, `static/js/workspaces/app.js`, views `overview.js`, `traffic.js`, `complete-diagnostics.js`, novo `shared/traffic-chart.js`, `app.css`, `tokens.css` e `runtime.js`; testes frontend/QA e documentos atualizados. Base comum am-panel/am-metric/am-dashboard-split/am-section-head/am-toolbar, tokens e fontes locais DM Sans/Space Mono.

O formulário antigo foi removido do workspace. Login e shell têm visibilidade exclusiva por sessão; sidebar e dashboard estão ocultos por atributo hidden sem sessão. Sucesso limpa senha e oculta login; logout cancela o escopo anterior, limpa a senha e retorna ao card. IP/usuário/senha/modelo/HTTPS/Conectar não permanecem no topo do dashboard. O topbar conserva contexto real e Desconectar. Os cabeçalhos globais são ocultos nas views com header próprio para evitar duplicação.

## Gráficos e polling

Visão Geral e Tráfego compartilham renderer SVG local alimentado por /api/device/traffic e pelos endpoints existentes de histórico. Séries guardadas por UUID de sessão, timestamps reais, RX azul/TX violeta e curvas visuais entre pontos medidos. Lacunas não são convertidas em zero nem conectadas como amostras existentes. Áreas só usam segmentos observados; histórico tardio mescla pontos sem apagar amostras recém-coletadas. Trocar interface não remonta a página. Consumo do card superior é uma fonte WAN comprovada; um contador Wi-Fi não vira consumo WAN.

Polling a cada 5 s atualiza textos, atributos SVG, opções necessárias e linhas de ranking. Nunca substitui workspace.innerHTML durante polling; mantém DOM de página/card/SVG, scroll e foco. Scope/generation/AbortController e cancelamento de timer na saída preservados. Reads da Visão Geral usam Promise.allSettled; falha de uma superfície não derruba a tela.

Ranking considera apenas source client/wifi_client com ambos os contadores individuais disponíveis e numéricos; soma RX/TX do mesmo cliente, não fontes sobrepostas. Total parcial não recebe zero fictício. Sem evidência, exibe Consumo por cliente não disponível neste equipamento. SSIDs, sinal, CPU e óptica ausentes continuam indisponíveis; não há Mesh/backhaul inferido.

## Validação

- npm ci; sync_frontend; collectstatic --no-tailwind executados.
- Python: 295 passed + 30 subtests. Frontend: 31 passed.
- Chromium real: 1366×768, 1600×900, 1920×1080; navegação, overflow e polling incremental passaram.
- Vela real: manage.py/runapp com pywebview/Qt offscreen, API de equipamento sintética somente nos testes. Verificados login isolado, autenticação/logout, shell, resize/maximize, modal, respostas tardias, navegação e polling sem trocar página/card/SVG/scroll/foco.
- Screenshots pedidos em docs/screenshots/vela: login, overview, traffic, complete-diagnostics para 1366, 1600, 1920.
- Sem novo teste físico ou Windows/WebView2. Aviso CDN Tailwind preexistente do framework não é dependência introduzida nesta implementação. Nenhum CDN/Canva SDK, mocks ou dados demonstrativos foram portados para produção.

As capturas de referência foram inspecionadas e comparadas à composição implementada; textos demonstrativos foram substituídos por leituras reais ou indisponibilidade explícita. A migração integral conserva pendências já registradas; esta rodada modifica as quatro superfícies visuais solicitadas.
