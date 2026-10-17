# Relatório — Aero, login multimodo, mundo dinâmico e áudio local

Implementação incremental no Access Manager existente, preservando o Vela e os protocolos/API de Huawei, ZTE e Juniper. A branch experimental e o PR original foram mantidos. Nenhum backend, parser ou writer foi reimplementado.

## Tema e login

O ThemeProvider aplica tokens ao documento e às superfícies do shell Vela, inclusive ao dialog fora da app-shell. O Aero tem tipografia Segoe/Tahoma, navegação SVG glossy, tabelas claras, botões com volume, inputs claros, status legíveis, drawers/modais e scrollbars azuis. A decoração CLI é removida apenas da apresentação e restaurada ao voltar ao Terminal; valores de formulário e consoles raw não são reescritos. Matrix fica restrito ao login Terminal.

O login oferece Terminal (padrão), Frutiger Aero e Access World 3D, com seleção por teclado, persistência e detecção WebGL. O layout deixa o formulário acessível por scroll quando necessário e cabe na resolução padrão de desktop. A autenticação recebe o payload original; tema/experiência não são credenciais. A senha Wi-Fi agora abre mascarada, com Mostrar/Ocultar, Copiar e Fechar; o valor é limpo ao fechar.

## Registro dinâmico Router × Juniper

A sidebar e o mundo usam os mesmos IDs e metadados das views registradas. O adaptador do mundo filtra família e capabilities existentes; capabilities UNKNOWN/UNSUPPORTED não inventam acesso. A disponibilidade de leitura não habilita uma escrita.

| Contexto | Regiões/ícones | Regra |
| --- | --- | --- |
| Huawei/ZTE | Visão geral, clientes, tráfego, Wi-Fi, WAN, LAN, DHCP/DNS, diagnósticos, perfis e gerenciamento | Apenas rotas aplicáveis; features técnicas dependem das capabilities atuais |
| Juniper BNG | Hub BNG, busca/sessão PPPoE, interfaces/LACP/óptica, AAA, roteamento do assinante, probes, chassis/sistema/logs | Nenhum Wi-Fi/SSID/DHCP doméstico remapeado para uma página sem relação |
| CPE de assinante selecionado | Acessar CPE | Ação existente do workspace de sessão, disponível com IPv4 observado; mantém contexto do contrato |
| Mesh / NAT | Superfícies existentes de gerenciamento | Não ganharam uma aba/região fictícia quando não há rota própria registrada |

O total de visitas e o minimapa derivam do conjunto aplicável, sem denominador fixo. Posição, câmera, zoom e visitas ficam em memória por sessão/família, sem IP em localStorage. Os mundos têm props técnicos diferentes: ambiente residencial/natureza e skyline/racks BNG. GLB opcional mantém fallback procedural, com SVG/orb para ícones. Árvores suavizadas, água com ondas discretas e reflexos de ambiente gerado, transições e respeito a movimento reduzido.

## Áudio local

O AudioManager possui canais master/music/ambient/ui/sfx, volume, mute, loop, fade e preferências. Sem faixa, o estado é silencioso: “Nenhuma música instalada”. Importação OGG/MP3/WAV usa object URL local e não faz upload. A música da Nintendo não foi incluída, baixada nem usada como nome de uma faixa inexistente.

Para instalar sua própria faixa legalmente obtida:

1. Copie `aero_bgm.ogg` ou `.mp3` para `apps/access_manager/static/audio/user/`.
2. No `manifest.json` adjacente, configure `{"track":"aero_bgm.ogg","title":"Minha música","regions":{}}`.
3. Execute `python manage.py collectstatic --no-tailwind`.
4. Entre no mundo e clique em Reproduzir. Também pode usar Escolher música sem copiar arquivos.

Arquivos de áudio do usuário estão no gitignore. Importação pela UI precisa ser repetida após reiniciar; nenhum conteúdo ou caminho pessoal é persistido. Trocar de painel dentro do mundo preserva a música; sair do mundo/ocultar a janela pausa.

## Validação

- 535 testes Python e 30 subtestes passaram.
- 76 testes de frontend passaram, incluindo registro/filtro de regiões, ação CPE contextual, seleção/login/credenciais, label reversível, áudio local sem autoplay e limpeza da senha Wi-Fi.
- Build dos dois bundles e verificação reproduzível passaram.
- `collectstatic --no-tailwind` do Vela passou sem erros.
- Matriz visual: 138 verificações em 1366×768, 1600×900 e 1920×1080; Router, todas as rotas Juniper registradas, CPE drawer, tabelas, previews, senha, traceroute, varredura, sidebar compacta, mundos adaptáveis, importação WAV e regressão Terminal.
- Teste WebGL separado: movimento real via teclado, proximidade, abertura da view de tráfego existente, retorno à mesma posição, qualidade e saída; layout de 780px, perda de contexto e fallback quando WebGL não pode ser criado.

As capturas usam exclusivamente fixtures sintéticas. O teste exclui consoles raw e a prévia deliberada do Terminal no seletor do login da checagem de cores de Aero. WebP sem perdas preserva os pixels dos PNGs originais. O teste usa Chromium por software; não é medição de GPU física nem validação do WebView nativo no Windows.

## Capturas revisadas

| Área | 1366×768 | 1600×900 | 1920×1080 |
| --- | --- | --- | --- |
| cpe-drawer | [ver](qa/aero-patch/cpe-drawer-1366.webp) | [ver](qa/aero-patch/cpe-drawer-1600.webp) | [ver](qa/aero-patch/cpe-drawer-1920.webp) |
| juniper-juniperDiagnostics | [ver](qa/aero-patch/juniper-juniperDiagnostics-1366.webp) | [ver](qa/aero-patch/juniper-juniperDiagnostics-1600.webp) | [ver](qa/aero-patch/juniper-juniperDiagnostics-1920.webp) |
| juniper-juniperInterfaces | [ver](qa/aero-patch/juniper-juniperInterfaces-1366.webp) | [ver](qa/aero-patch/juniper-juniperInterfaces-1600.webp) | [ver](qa/aero-patch/juniper-juniperInterfaces-1920.webp) |
| juniper-juniperOverview | [ver](qa/aero-patch/juniper-juniperOverview-1366.webp) | [ver](qa/aero-patch/juniper-juniperOverview-1600.webp) | [ver](qa/aero-patch/juniper-juniperOverview-1920.webp) |
| juniper-subscribers | [ver](qa/aero-patch/juniper-subscribers-1366.webp) | [ver](qa/aero-patch/juniper-subscribers-1600.webp) | [ver](qa/aero-patch/juniper-subscribers-1920.webp) |
| login-aero | [ver](qa/aero-patch/login-aero-1366.webp) | [ver](qa/aero-patch/login-aero-1600.webp) | [ver](qa/aero-patch/login-aero-1920.webp) |
| login-terminal | [ver](qa/aero-patch/login-terminal-1366.webp) | [ver](qa/aero-patch/login-terminal-1600.webp) | [ver](qa/aero-patch/login-terminal-1920.webp) |
| login-world3d | [ver](qa/aero-patch/login-world3d-1366.webp) | [ver](qa/aero-patch/login-world3d-1600.webp) | [ver](qa/aero-patch/login-world3d-1920.webp) |
| neighbor-scan | [ver](qa/aero-patch/neighbor-scan-1366.webp) | [ver](qa/aero-patch/neighbor-scan-1600.webp) | [ver](qa/aero-patch/neighbor-scan-1920.webp) |
| profile-preview | [ver](qa/aero-patch/profile-preview-1366.webp) | [ver](qa/aero-patch/profile-preview-1600.webp) | [ver](qa/aero-patch/profile-preview-1920.webp) |
| router-clients | [ver](qa/aero-patch/router-clients-1366.webp) | [ver](qa/aero-patch/router-clients-1600.webp) | [ver](qa/aero-patch/router-clients-1920.webp) |
| router-completeDiagnostics | [ver](qa/aero-patch/router-completeDiagnostics-1366.webp) | [ver](qa/aero-patch/router-completeDiagnostics-1600.webp) | [ver](qa/aero-patch/router-completeDiagnostics-1920.webp) |
| router-dhcpdns | [ver](qa/aero-patch/router-dhcpdns-1366.webp) | [ver](qa/aero-patch/router-dhcpdns-1600.webp) | [ver](qa/aero-patch/router-dhcpdns-1920.webp) |
| router-diagnostics | [ver](qa/aero-patch/router-diagnostics-1366.webp) | [ver](qa/aero-patch/router-diagnostics-1600.webp) | [ver](qa/aero-patch/router-diagnostics-1920.webp) |
| router-lan | [ver](qa/aero-patch/router-lan-1366.webp) | [ver](qa/aero-patch/router-lan-1600.webp) | [ver](qa/aero-patch/router-lan-1920.webp) |
| router-management | [ver](qa/aero-patch/router-management-1366.webp) | [ver](qa/aero-patch/router-management-1600.webp) | [ver](qa/aero-patch/router-management-1920.webp) |
| router-overview | [ver](qa/aero-patch/router-overview-1366.webp) | [ver](qa/aero-patch/router-overview-1600.webp) | [ver](qa/aero-patch/router-overview-1920.webp) |
| router-profiles | [ver](qa/aero-patch/router-profiles-1366.webp) | [ver](qa/aero-patch/router-profiles-1600.webp) | [ver](qa/aero-patch/router-profiles-1920.webp) |
| router-traffic | [ver](qa/aero-patch/router-traffic-1366.webp) | [ver](qa/aero-patch/router-traffic-1600.webp) | [ver](qa/aero-patch/router-traffic-1920.webp) |
| router-wan | [ver](qa/aero-patch/router-wan-1366.webp) | [ver](qa/aero-patch/router-wan-1600.webp) | [ver](qa/aero-patch/router-wan-1920.webp) |
| router-wifi | [ver](qa/aero-patch/router-wifi-1366.webp) | [ver](qa/aero-patch/router-wifi-1600.webp) | [ver](qa/aero-patch/router-wifi-1920.webp) |
| sidebar-collapsed | [ver](qa/aero-patch/sidebar-collapsed-1366.webp) | [ver](qa/aero-patch/sidebar-collapsed-1600.webp) | [ver](qa/aero-patch/sidebar-collapsed-1920.webp) |
| terminal-cpe | [ver](qa/aero-patch/terminal-cpe-1366.webp) | [ver](qa/aero-patch/terminal-cpe-1600.webp) | [ver](qa/aero-patch/terminal-cpe-1920.webp) |
| terminal-subscribers | [ver](qa/aero-patch/terminal-subscribers-1366.webp) | [ver](qa/aero-patch/terminal-subscribers-1600.webp) | [ver](qa/aero-patch/terminal-subscribers-1920.webp) |
| traceroute | [ver](qa/aero-patch/traceroute-1366.webp) | [ver](qa/aero-patch/traceroute-1600.webp) | [ver](qa/aero-patch/traceroute-1920.webp) |
| wifi-password | [ver](qa/aero-patch/wifi-password-1366.webp) | [ver](qa/aero-patch/wifi-password-1600.webp) | [ver](qa/aero-patch/wifi-password-1920.webp) |
| world-juniper | [ver](qa/aero-patch/world-juniper-1366.webp) | [ver](qa/aero-patch/world-juniper-1600.webp) | [ver](qa/aero-patch/world-juniper-1920.webp) |
| world-router | [ver](qa/aero-patch/world-router-1366.webp) | [ver](qa/aero-patch/world-router-1600.webp) | [ver](qa/aero-patch/world-router-1920.webp) |

## Arquivos alterados

- `.gitignore`
- `README.md`
- `apps/access_manager/static/audio/user/manifest.json`
- `apps/access_manager/static/css/aero.css`
- `apps/access_manager/static/css/login-experiences.css`
- `apps/access_manager/static/css/world.css`
- `apps/access_manager/static/js/core/routes.js`
- `apps/access_manager/static/js/matrix-bg.js`
- `apps/access_manager/static/js/runtime.js`
- `apps/access_manager/static/js/ui/login.js`
- `apps/access_manager/static/js/ui/theme.js`
- `apps/access_manager/static/js/workspaces/app.js`
- `apps/access_manager/static/js/workspaces/views/juniper.js`
- `apps/access_manager/static/js/workspaces/views/wifi.js`
- `apps/access_manager/static/js/world-runtime.js`
- `apps/access_manager/static/js/world/audio.js`
- `apps/access_manager/static/js/world/bridge.js`
- `apps/access_manager/static/js/world/controller.js`
- `apps/access_manager/static/js/world/icon-metadata.js`
- `apps/access_manager/static/js/world/icons.js`
- `apps/access_manager/static/js/world/regions.js`
- `apps/access_manager/static/js/world/renderer.js`
- `apps/access_manager/templates/index.html`
- `docs/FRUTIGER_WORLD.md`
- `docs/THIRD_PARTY_ASSETS.md`
- `docs/qa/aero-patch/checks.json`
- `tests/frontend/aero-world.test.cjs`
- `tests/frontend/runtime.test.cjs`
- `tests/frontend/world.test.cjs`
- `tests/visual/aero-fixtures.cjs`
- `tests/visual/aero.cjs`
- `tests/visual/world.cjs`
- `docs/AERO_WORLD_PATCH_REPORT.md`
- `docs/qa/aero-patch/*.webp`: 84 capturas revisadas nas três resoluções.

## Limites restantes

O mascote continua procedural; nenhum GLB de terceiros foi incluído sem obter o asset e conferir a licença. A água usa ambiente gerado e ondas discretas, sem reflexão planar real-time/caustics. Não há colisão física completa com props, swimming ou câmera por raycast em todos os obstáculos. O movimento é por teclado/mouse; não há controle touch/gamepad. A configuração `regions` do áudio prepara o slot, mas não há troca automática de trilha por região neste patch. Importação local não persiste o arquivo após reiniciar. Confirmação em Windows/WebView nativo e em equipamentos reais continua pendente.

As regras de protocolo/capability/writer, busca Juniper e handoff CPE continuam sendo as existentes. Detalhes de uso e arquitetura: [FRUTIGER_WORLD.md](FRUTIGER_WORLD.md).
