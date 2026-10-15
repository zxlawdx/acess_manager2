# Scanner de referências de UX — Access Manager

Pesquisa dirigida anterior à implementação. Nenhum componente externo foi transplantado: conceitos foram reimplementados com CSS/SVG/JS locais. Branches partem do mesmo baseline `740638e1ba215246c16c77f7f91a5468e15c2a8b`, árvore já integrada ao main pelo PR #10; main não será alterado. Cada link aponta a evidência consultada; licenças não são uma declaração genérica de compatibilidade para cópia.

| Projeto / revisão consultada | Observação concreta | Aplicável / onde | Licença observada | Decisão |
|---|---|---|---|---|
| [Cockpit](https://github.com/cockpit-project/cockpit/blob/9401f45ccecea79f9d940a7da67731d5c3c8b572/pkg/lib/cockpit-dark-theme.ts) | Preferência explícita prevalece sobre sistema, listener de aparência; variáveis e breakpoints separados do conteúdo | Ambas: resolução do tema e shell sem alterar geometria | SPDX LGPL-2.1-or-later nos arquivos lidos; repositório com várias licenças | Adotar o comportamento conceitual, nenhum código copiado |
| [Beszel](https://github.com/henrygd/beszel/blob/fb85013d2267519abb2366a9698873e21c38ede4/internal/site/src/components/theme-provider.tsx) | Tema escolhido separado do tema resolvido; localStorage + sistema | Ambas: Claro/Escuro/Sistema, persistência e mesma UI | MIT | Reimplementar em JS existente, sem React |
| [Uptime Kuma](https://github.com/louislam/uptime-kuma/blob/b092505f894d66669b67f46e1da72b51016eceab/src/components/settings/Appearance.vue) | Aparência é preferência de operação, tema aplicado ao shell; estados de serviço explícitos | Ambas: seletor compacto; status LAN por texto + LED | MIT | Não copiar heartbeat contínuo: LED só com medição |
| [Netdata](https://github.com/netdata/netdata/blob/6ad3116a8ad54edcf5f0220f85f192d9b8ebbd58/docs/dashboards-and-charts/themes.md) | Light e Dark apresentados como aparências do mesmo monitor; documentação e screenshots | Ambas: mesmas escalas/gráficos nos temas | GPL-3.0 do agente; UI pode ter termos próprios | Referência de comportamento, nenhum asset/código importado |
| [Plane](https://github.com/makeplane/plane/tree/4605f0078fdcf7016cea646ea50c4b825efd9fac/apps/web/components/appearance) | Catálogo separa aparência/tema dos workflows; seleção de modo como configuração | Parcial: hierarquia e selected/focus, principalmente B | AGPL-3.0 em LICENSE.txt | Referência conceitual; não importar editor/sidebar/productivity workflows |
| [Twenty](https://github.com/twentyhq/twenty/blob/c3ba1401f45dbc35bf5ed3d48c4ddc2e58f2bb15/packages/twenty-ui/src/theme/constants/ThemeDark.ts) | Shape do dark tipado pelo light; tamanhos de modal/ícone/espaçamento não são uma nova UI | Ambas: tradução semântica e estados comuns; B: foco e linhas | LICENSE raiz: AGPLv3 com arquivos Enterprise e pacotes MIT; twenty-ui listado MIT | Somente organização conceitual dos tokens; não importar pacote |
| [Maybe](https://github.com/maybe-finance/maybe/blob/77b5469832758d1cbee1a940f3012a1ae1c74cd3/app/javascript/controllers/theme_controller.js) | Tema no elemento raiz, preferência do usuário e listener do sistema com lifecycle | Ambas: um controller, sem duplicar componentes | AGPL-3.0 | Adotar lifecycle conceitual, não copiar Stimulus |
| [Tauri Desktop Template](https://github.com/mihasm/tauri-desktop-template/blob/378cb803ae8ce211c24bf7e28a08d0c7ac4b07c4/src/styles/themes.css) | Paletas isoladas, superfícies base/inset/elevada, settings compactos | Ambas: tokens; B: microinteração contida | MIT | Não migrar Vela para Tauri, não importar shell de três painéis |

## Ideias rejeitadas

Glassmorphism, blur decorativo, neon/glow permanente, cards maiores, gradientes sem função, animação elástica, reordenação da navegação, título/window chrome customizados, trocar tipografia por suposição, LED com tráfego inventado, limiares ópticos genéricos, importar bibliotecas pesadas de motion. Tema não transforma unsupported em erro ou link DOWN em defeito.

## Auditoria do baseline (antes das alterações)

1. Stack: Vela 0.2.2, Python separado da apresentação; JS modular → esbuild IIFE runtime.js; CSS próprio.
2. Tema: somente claro, sem persistência/toggle; tokens em tokens.css e cores literais nas extensões app.css.
3. Fonte real: DM Sans e Space Mono locais. O prompt cita Inter, mas o light existente é a verdade; fontes mantidas.
4. Topbar 58px/sidebar 224px; CSS Grid full WebView; login isolado sem sessão; nenhuma margem externa.
5. Componentes compartilhados: ui.js (badge/table/metric/dialog/toast), presentation.js, forms.js, patch.js, traffic-chart.js.
6. Tabelas: clientes/WAN/LAN/DHCP/histórico, panel+table; colunas e contrato preserváveis.
7. Cards: am-panel, diagnostic-panel, panel, metric; geometria existente mantida em A.
8. Formulários: input/select/bool/options observadas; falta cobertura global de read-only/autofill/textarea no dark.
9. Modais/drawers: dialog nativo e childScope; actions fixas em Perfis, limpeza de senhas, drawer em clientes.
10. Tooltips: title e tooltip do gráfico; mensagens obrigatórias devem ficar visíveis, não só tooltip.
11. Toasts: região aria-live, temporários; não alteram sessão.
12. Loading: skeleton, disabled e texto; requests com beginView/scope/generation/AbortController; preservar.
13. Capabilities: SUPPORTED/PARTIAL/UNKNOWN/UNSUPPORTED diferenciados no domínio; UI tem rótulos técnicos em capBadge. Pode traduzir rótulo visual mantendo o contrato.
14. LAN: somente tabela, sem componente físico, campos port/link_state/admin_state/speed/client/mac/rx_bytes/tx_bytes. Nenhum writer novo necessário.
15. Óptica: valores reais em overview/diagnóstico; sem denominador/limiar universal de potência. Não inventar barra percentual.
16. WAN: link/status normalizado, tabela e detalhes; sem máquina de conexão nova.
17. Wi-Fi: readers separados, seletores com opções reais, dirty form e cache; sem mudança de writers.
18. Clientes: inventário, filtros/cards/topologia/drawer; relações conhecidas, sem Mesh deduzido.
19. Logs: não existe página de log em streaming; Gerenciamento possui histórico real. Testar essa superfície, não criar endpoint/página fake.
20. Ícones: texto e SVG locais; sem biblioteca remota.
21. Responsividade: breakpoints existentes, shell/mobile nav, overflow no workspace/tabelas e modais limitados à viewport.
22. Testes: Python, DOM jsdom, Chromium Playwright e WebView Qt real via manage.py/runapp; fixtures só em tests.
23. Build confirmado: npm ci; python tools/sync_frontend.py; python manage.py collectstatic --no-tailwind; python manage.py runapp.
24. Portas/status/activity só podem ser derivados dos campos existentes; estado ausente = Não detectado, admin desativado não equivale a link DOWN.
25. Ações críticas: confirmações e readback já existem; não tocar/resetar regras por estética.
26. Performance: polling incremental em gráfico, cache e locks de firmware no backend; nenhum componente novo deve remontar a página.
27. Tema e motion devem funcionar offline e respeitar prefers-reduced-motion.

Limite da pesquisa: observação de arquivos/documentação oficiais e revisão de componentes, não alegação de auditoria exaustiva de todos os projetos ou autoria manual de cada linha.
