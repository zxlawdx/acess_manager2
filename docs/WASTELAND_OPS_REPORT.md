# Wasteland Ops 3D e Terminal de campo

Implementação na branch `feat/wasteland-ops`, a partir da main atual com as correções de release e ciclo de vida do atendimento já existentes. Backend, protocolos Huawei/ZTE/Juniper, writers e workflows de release foram preservados.

## Entrega

O login oferece Terminal, Aero, Access World 3D, Voxel e **Wasteland Ops 3D**. O modo `wasteland` usa o tema `terminal`; pode ser selecionado também depois da conexão. Na interface convencional nenhum renderer Three.js é carregado. O novo bundle é local e independente de Aero/Voxel.

| Componente | Implementação |
| --- | --- |
| Terminal 2D | Hierarquia com Space Mono local, títulos uppercase/tracking moderado, foco visível, prefixo SYS:// e status com barra de sinal. Logs mantêm tracking normal; botões não recebem automaticamente brackets de CLI. CSS restrito ao Terminal. |
| View model | Decoração da lista canônica de rotas/capabilities. Nomes e assets de campo não duplicam regras de negócio. Atendimento é uma ação real da UI, sem routeId fictício. |
| Ambiente | Terreno com grão procedural, sucata/rochas instanciadas, shelters, torres, antenas/dishes, cabos, skyline, CRTs verdes, luz de fim de tarde, fog e poeira. Geometrias e materiais compartilhados, LOD e frustum culling. |
| Operador | Personagem procedural original, mochila/display/antena e rig idle/walk/run. GLTFLoader/LoadingManager opcional por `data-wasteland-model`; padrão não busca GLB ausente. Cápsula é fallback de construção. |
| Interações | Proximidade/E e raycast próximo abrem painéis reais já existentes. T abre um menu de terminais/rotas, não uma shell arbitrária. |
| Atendimento | O mesmo store, painel, texto humano, notas, botão de limpeza e política perguntar/manter/limpar ao desconectar. Não existe um registro separado para o mundo. Modal pausa o renderer e fechar retoma a navegação. Sair do mundo mantém o atendimento. |
| Telemetria | WAN/clientes usam somente o snapshot da sessão atual. Latência/perda usam o último ping registrado na sessão. Zero é preservado; ausências ficam “Não coletada/Não testada”. Não há medição contínua inventada nem novo polling. |
| Áudio | Hum original de equipamento, sintetizado localmente após gesto explícito. Volume/mute compartilhados com os controles existentes; pausa ao ocultar/sair e proteção contra resume tardio. Música local existente permanece disponível. |

## Mapas e controles

Router/ONT usa as rotas reais de overview, WAN, Wi-Fi, clientes, LAN, DHCP/DNS, diagnóstico, perfis e gerenciamento, conforme capabilities. Juniper usa BNG, assinantes, sessões, interfaces, diagnóstico e demais rotas efetivamente registradas. CPE Gate só aparece quando a ação existente de CPE tem contexto disponível. Não há Wi-Fi residencial no mapa Juniper; não foram inventadas rotas NAT/Mesh. DHCP e DNS continuam no painel combinado existente.

WASD move; Shift corre; Espaço pula; arrastar olha; E interage; T abre o terminal de rotas; V alterna câmera; M oculta/mostra mapa; L abre atendimento; Esc fecha terminal/painel ou volta à interface. O personagem tem colisão básica de footprints e terreno/limites, sem crafting ou destruição.

## Perfis de qualidade

| Perfil | DPR máximo | Sombras | Poeira | Rochas/props | Distância/fog |
| --- | --- | --- | --- | --- | --- |
| Baixo | 1 | desligadas | 12 | 24 | 90 |
| Médio | 1,5 | 1024 | 48 | 64 | 125 |
| Alto | 2 | 2048 | 100 | 120 | 165 |

Ao sair o RAF é cancelado; ao pausar/ocultar a página não se renderiza. Troca de contexto/experiência e unload descartam recursos, listeners, geometrias/texturas e áudio conforme o ciclo existente. Posição/câmera/visitas ficam em cache apenas em memória por sessão e experiência.

## Validação

- `python tools/sync_frontend.py` e `--check`: aprovados.
- `npm test`: **96 testes aprovados**, incluindo quatro novos testes de registry/capabilities, presets, login/credenciais/atendimento e áudio sem autoplay/race após saída. A navegação de teclado foi atualizada para cinco opções.
- `python -m pytest -q`: **535 testes e 30 subtestes aprovados**.
- `python manage.py collectstatic --no-tailwind`: zero erros.
- `git diff --check`: sem erros.
- `tests/visual/wasteland.cjs`: **23 checks**; login, Router/Juniper, E/painel real, T, V, M, L, atendimento/nota/política, áudio/mute/volume, presets, movimento, restauração e parada após saída, falha de carregamento e perda de contexto WebGL. Sem erros JavaScript. A requisição abortada no caso de fallback é deliberada.
- `tests/visual/aero.cjs`: **138 checks de regressão** aprovados, incluindo todas as rotas Juniper, Aero, áudio e Terminal.

Resoluções: 1366×768, 1600×900, 1920×1080. Chromium com SwiftShader, fixtures sintéticas. O botão de conectar foi verificado dentro do viewport de login. Capturas revisadas e distribuídas em WebP sem perdas. `qa/wasteland/checks.json` contém os cenários.

## Capturas

| Tela | 1366×768 | 1600×900 | 1920×1080 |
| --- | --- | --- | --- |
| Login de cinco experiências | [1366](qa/wasteland/login-1366.webp) | [1600](qa/wasteland/login-1600.webp) | [1920](qa/wasteland/login-1920.webp) |
| Wasteland Router | [1366](qa/wasteland/world-router-1366.webp) | [1600](qa/wasteland/world-router-1600.webp) | [1920](qa/wasteland/world-router-1920.webp) |
| Painel de diagnóstico real | [1366](qa/wasteland/real-diagnostics-panel-1366.webp) | [1600](qa/wasteland/real-diagnostics-panel-1600.webp) | [1920](qa/wasteland/real-diagnostics-panel-1920.webp) |
| Terminal de rotas | [1366](qa/wasteland/field-terminal-1366.webp) | [1600](qa/wasteland/field-terminal-1600.webp) | [1920](qa/wasteland/field-terminal-1920.webp) |
| Atendimento compartilhado | [1366](qa/wasteland/service-1366.webp) | [1600](qa/wasteland/service-1600.webp) | [1920](qa/wasteland/service-1920.webp) |
| Interface Terminal | [1366](qa/wasteland/terminal-interface-1366.webp) | [1600](qa/wasteland/terminal-interface-1600.webp) | [1920](qa/wasteland/terminal-interface-1920.webp) |
| Wasteland Juniper | [1366](qa/wasteland/world-juniper-1366.webp) | [1600](qa/wasteland/world-juniper-1600.webp) | [1920](qa/wasteland/world-juniper-1920.webp) |

## Referências e limites

Os dois previews fornecidos orientaram a estética; seus payloads mockados e import por CDN não foram levados para produção. Three.js 0.180.0 e Space Mono seguem locais e com seus avisos de licença existentes. Cenário, operador, textura e hum são procedurais próprios. Nenhum asset, fonte, música, marca ou personagem de franquia foi adicionado.

Não houve validação com equipamentos físicos, WebView nativo Windows ou benchmark em GPU real nesta rodada. Os testes de build são frontend/collectstatic e contratos de empacotamento do backend; não foi gerado um novo executável nativo neste patch. O workflow nativo existente fica preservado para o próximo build/release.

O cenário é uma navegação operacional inicial com geometria low-poly. A câmera evita oclusão pelas estações; colisão não cobre toda sucata decorativa; não há física de jogo completa, interiores de bunkers, crafting ou mundo destrutível. O hum é simples, não uma trilha/ambiente sonoro completo. Nenhum GLB custom foi fornecido para validação; a representação procedural é o padrão testado. O HUD mostra última coleta/ping e não garante saúde atual da rede.

## Arquivos alterados

- `.gitignore`
- `apps/access_manager/static/css/field-ops.css`
- `apps/access_manager/static/js/runtime.js`
- `apps/access_manager/static/js/ui/login.js`
- `apps/access_manager/static/js/wasteland-runtime.js`
- `apps/access_manager/static/js/wasteland/audio.js`
- `apps/access_manager/static/js/wasteland/environment.js`
- `apps/access_manager/static/js/wasteland/metadata.js`
- `apps/access_manager/static/js/wasteland/player.js`
- `apps/access_manager/static/js/wasteland/renderer.js`
- `apps/access_manager/static/js/world/bridge.js`
- `apps/access_manager/static/js/world/regions.js`
- `apps/access_manager/templates/index.html`
- `docs/FRUTIGER_WORLD.md`
- `docs/THIRD_PARTY_ASSETS.md`
- `docs/WASTELAND_OPS_REPORT.md`
- `tests/frontend/service-voxel.test.cjs`
- `tests/frontend/wasteland.test.cjs`
- `tests/visual/wasteland.cjs`
- `tools/sync_frontend.py`

Evidências: 21 capturas WebP e `checks.json` em `docs/qa/wasteland`.
