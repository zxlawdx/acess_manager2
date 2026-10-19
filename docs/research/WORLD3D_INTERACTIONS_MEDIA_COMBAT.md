# Mundo 3D: referências, licenças e decisões

Pesquisa realizada em 19/10/2026. APIs GitHub: metadata, árvores de arquivos e os arquivos indicados abaixo. Uma licença ausente no metadata não equivale a domínio público. Não houve cópia de código de aplicação dos projetos de referência.

## Arquitetura encontrada e baseline

Vela 0.2.2 / pywebview, shell HTTP Bottle, Three.js 0.180.0 carregado sob demanda, PlayerController próprio, três bundles (Aero/Voxel/Wasteland), HTMLAudio com WebAudio e preferências localStorage existentes. Sem Electron e sem engine de física instalada. Baseline: 99 testes frontend; 538 testes Python + 30 subtests. O primeiro pytest exigiu instalar as dependências do projeto.

## Repositórios inspecionados

| Projeto | Arquivo/arquitetura consultado | Licença observada | Reuso, risco e decisão |
|---|---|---|---|
| [keysforthewin/thisoffice](https://github.com/keysforthewin/thisoffice) | README.md | Não identificada no metadata | Referência de escritório, câmera, foco em monitores e estado visual; licença não identificada no metadata. Não copiar código nem modelos. |
| [ChingAmazing/OpenHome3D-html](https://github.com/ChingAmazing/OpenHome3D-html) | scripts/build-manifest.mjs | MIT | Adotar catálogo pequeno com GLB e proveniência. Quatro modelos Kenney com licença própria CC0 foram selecionados; nenhum código de aplicação copiado. |
| [dandacompany/deskrpg](https://github.com/dandacompany/deskrpg) | LICENSE.md | NOASSERTION | LICENSE.md usa Sustainable Use License e restrições de distribuição/comercialização. Somente referência de layout e NPC; não copiar. |
| [chrislaupama/threejs-game-studio](https://github.com/chrislaupama/threejs-game-studio) | references/interaction.md | MIT | Separar input semântico, raycast central, lista de picking e descarte. Implementação própria integrada ao renderer existente. |
| [takeokunn/ts-minecraft](https://github.com/takeokunn/ts-minecraft) | docs/explanations/game-mechanics/core-features/physics-system.md | MIT | Referência de sistemas modulares e movimento. Não substituir o mundo nem o controller atual por um motor voxel novo. |
| [zimkk/mynecraft](https://github.com/zimkk/mynecraft) | src/player/Raycast.ts | MIT | Raycast.ts usa travessia DDA para voxels. Nosso ambiente usa meshes GLB, portanto Three.Raycaster é mais adequado. |
| [goldfire/howler.js](https://github.com/goldfire/howler.js) | examples/player/player.js | MIT | examples/player/player.js organiza índice, transporte, seek e avanço no fim. HTMLAudio/WebAudio atual já atende; manter e estender, sem dependência Howler. |
| [y-lohse/inkjs](https://github.com/y-lohse/inkjs) | README.md | MIT | Histórias compiladas e choices são úteis para narrativa longa; falas por trigger não precisam do compilador Ink. JSON validado internamente. |
| [YarnSpinnerTool/YarnSpinner](https://github.com/YarnSpinnerTool/YarnSpinner) | YarnSpinner/Dialogue.cs | MIT | Dialogue.cs separa runner e callbacks; DSL/VM C# não encaixa no runtime Vela JS. Regras locais e seleção/cooldown próprios. |
| [AbdullahAsaadGhaliHamza/Dialogue-Tree-Editor](https://github.com/AbdullahAsaadGhaliHamza/Dialogue-Tree-Editor) | README.md | MIT | Referência de edição local, falantes e condições. Não executar expressões livres nem incorporar editor inteiro. |
| [dimforge/rapier.js](https://github.com/dimforge/rapier.js) | src.ts/control/character_controller.ts | Apache-2.0 | Character controller WASM robusto; repositório indica migração para dimforge/rapier/typescript. Evitar WASM e inicialização extra para este conjunto reduzido de props. |
| [larvuz2/physics-character-controller](https://github.com/larvuz2/physics-character-controller) | src/character.js | Não identificada no metadata | src/character.js mantém estado de movimento e fallback. Licença não confirmada; não copiar. Reutilizar PlayerController do Access Manager. |
| [pmndrs/cannon-es](https://github.com/pmndrs/cannon-es) | readme.md | MIT | Única engine de física adicionada: 0.20.0, MIT. Simulação local da bola, chão, impulsos e gravidade. Colisão de jogador usa AABBs simples. |
| [isaac-mason/recast-navigation-js](https://github.com/isaac-mason/recast-navigation-js) | packages/recast-navigation-three/README.md | MIT | Navmesh é excessivo para uma rota curta sem obstáculos. Não adicionar WASM; NPC usa rota e aproximação limitadas. |
| [kmangutov/threejs-arena](https://github.com/kmangutov/threejs-arena) | src/player.ts | Não identificada no metadata | src/player.ts evidencia separação de controller, colliders e cenário. Licença não identificada; implementação de combate própria, sem reutilizar modelos Mixamo. |
| [shorepine/kenney](https://github.com/shorepine/kenney) | Metadata; tentativa de árvore recursiva | NOASSERTION | Metadata consultado; árvore recursiva não disponível pela ferramenta. Preferir origem oficial e espelho OpenHome com LICENSE por pack. Não importar acervo inteiro. |
| [GeorgeQLe/assets-kaykit-3d-props](https://github.com/GeorgeQLe/assets-kaykit-3d-props) | LICENSES/KayKit-CC0-License.txt | Não identificada no metadata | LICENSES/KayKit-CC0-License.txt confirma CC0 para coleção. Opção para expansão; móveis Kenney menores selecionados nesta entrega. |
| [GeorgeQLe/assets-kaykit-3d-characters](https://github.com/GeorgeQLe/assets-kaykit-3d-characters) | LICENSES/KayKit-CC0-License.txt | Não identificada no metadata | Árvore inclui Rig_Medium_CombatMelee.glb e licença CC0. Retargeting de rig humano para corpo de roteador não é direto; animações próprias em membros procedurais preservam estilo e tamanho. |
| [GeorgeQLe/assets-kaykit-3d-environments](https://github.com/GeorgeQLe/assets-kaykit-3d-environments) | Metadata; tentativa de árvore recursiva | Não identificada no metadata | Metadata consultado; árvore recursiva não retornou arquivos. Não presumir validação de cada pack; usar páginas oficiais antes de ingestão. |

## Acervos e animações

| Fonte | Licença / formato | Decisão e riscos |
|---|---|---|
| [Kenney Furniture](https://kenney.nl/assets/furniture-kit) | CC0, GLB via espelho com LICENSE | Usar desk, chairDesk, kitchenCoffeeMachine e plantSmall1 (total 75.620 bytes, 1.054 triângulos). Catálogo, hashes e script de ingestão no projeto. |
| [KayKit](https://kaylousberg.itch.io/kaykit-character-animations) | CC0, animações humanoides | Comparado com animações procedurais: exigiria retargeting para o roteador; não incorporar packs. |
| [Quaternius Universal Animation Library](https://quaternius.com/packs/universalanimationlibrary.html) e [Library 2](https://quaternius.com/packs/universalanimationlibrary2.html) | CC0 | Candidatos para humanoides futuros. Conferir rig/clips antes de importar; nesta entrega o roteador tem membros próprios. |
| [OpenGameArt SoulsLike](https://opengameart.org/content/humanoid-soulslike-animations) | CC0, ataques/dano | Pesquisado para socos e reações. Conversão e retargeting não justificam adicionar pack a um personagem procedural. |
| [Voxel Office](https://airdinghy.itch.io/voxel-office-pack) | CC0 | Alternativa de estilo; não misturar packs sem necessidade. |
| [Omie Office](https://omies-assets.itch.io/omies-assets-office-set) | CC0 | Alternativa para escritório; não incluído. |
| Office Low Poly / MrEliptik | Busca encontrou referência, sem confirmação individual de licença/arquivo | Não incluído; não tratar resultado de busca como autorização de uso. |
| [Home/Office](https://synofplay.itch.io/low-poly-home-set-living-and-home-office) | CC0 anunciado na página | Alternativa; não incluído. |
| [Grab3D WiFi Router](https://grab3d.com/models/electronics/wifi-router/) | CC0, GLB/FBX anunciado | Corpo comercial realista não era necessário; roteador próprio com LEDs e membros articulados, sem dependência de download externo. |

## Documentação oficial

- [Three.js Raycaster](https://threejs.org/docs/#api/en/core/Raycaster): picking no centro, distância limitada a partir do jogador e resolução de filhos para raiz registrada.
- [PointerLockControls](https://threejs.org/examples/?q=pointer#misc_controls_pointerlock): captura somente após gesto explícito; arrastar permanece como fallback. Pausa libera captura.
- [AnimationMixer](https://threejs.org/docs/#api/en/animation/AnimationMixer): manter avatar GLB atual. Roteador usa máquina de estados e poses procedurais próprias.
- [YouTube IFrame API](https://developers.google.com/youtube/iframe_api_reference) e [parâmetros](https://developers.google.com/youtube/player_parameters): player oficial, origin, controles preservados e fallback externo. Erro 153 pode ocorrer por identificação/referrer em WebViews.

## Decisões de integração

- O app não oferece bridge nativa de seleção de pasta. Reusar o mecanismo existente de input file, com seleção múltipla e webkitdirectory (Chromium/WebView2/QtWebEngine); sem showDirectoryPicker obrigatório, Electron ou upload de arquivos.
- Biblioteca opcional em IndexedDB, blobs locais; localStorage versionado apenas para settings e posição. Ao desmarcar lembrança, apagar a biblioteca persistida. Sem autoplay após restauração.
- TV: painel de mídia em foco dentro do app, fallback previsto no prompt. Não capturar iframe nem aplicar VideoTexture; CSS3D/overlay em perspectiva não foi adotado porque oclusão e controles confiáveis têm prioridade.
- Três cenas no mesmo renderer Aero; Voxel/Wasteland continuam com seus próprios renderers. Cenários e modelos são criados sob demanda, com descarte na troca. Os quatro GLBs são carregados só no escritório; objetos procedurais mantêm interação se falharem.
- Combate puro, local, sem import de API de equipamento. Eventos transportam somente nomes de triggers. Nenhum dado pessoal do cliente é usado no personagem.

