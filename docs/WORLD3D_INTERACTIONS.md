# Access World: interações, música e Router Rumble

O modo continua no Vela / pywebview, com o mesmo backend e painéis técnicos. No login ou na barra da sessão, escolha Mundo 3D. O menu apresenta os cenários Frutiger Aero, Network Ops e Router Rumble. Voxel e Wasteland permanecem disponíveis; os cenários novos e raycast de objetos estão no renderer Mundo 3D.

## Controles

| Controle | Ação |
|---|---|
| WASD / setas | Andar |
| Shift / espaço | Correr / pular |
| Arrastar mouse | Olhar |
| Duplo clique no canvas | Capturar mouse, quando permitido pelo runtime |
| V | Primeira / terceira pessoa |
| E / F | Interação principal / secundária do objeto no centro da tela |
| H / Tab | Alternar HUD |
| M | Rádio / biblioteca |
| Esc | Fechar foco ou painel; abrir menu do mundo |
| J / K | Soco leve / forte (somente arena) |
| B / Q / T | Bloquear / esquivar / provocar (somente arena) |
| R | Revanche (somente arena) |

O menu fica no canto inferior direito mesmo com o HUD oculto. A barra compacta reaparece ao apontar para a borda superior no modo automático. O menu tem saída explícita para a interface normal. A primeira entrada mostra instruções, sem repetir o tutorial nas próximas entradas.

## Objetos

Aproxime-se, olhe para o objeto e pressione E quando houver destaque. No escritório: cadeira, terminal, rádio, TV, porta, interruptor, cafeteira, quadro, lixeira, pacote coletável, bola, NPC e portais. F na bola aplica impulso; E pega/solta. Andar também empurra a bola. Sentar prende a posição; mover/Space levanta. O roteador anda numa rota curta e olha para o jogador. Os terminais existentes continuam abrindo rotas reais, respeitando as capabilities da sessão.

Na primeira pessoa o crosshair/raycast determina o alvo. Na terceira pessoa, a seleção prefere objetos próximos dentro do cone de direção do personagem e usa o raycast como fallback, evitando que móveis entre a câmera e o avatar roubem a interação. A distância de uso continua limitada a partir do jogador. NPCs, móveis e combate são locais. Apenas a ação explícita Usar computador / terminal abre a interface técnica.

## Músicas

M ou rádio abre o player. Escolha arquivos ou uma pasta. MP3, OGG, WAV, M4A, AAC, FLAC e WebM são indexados; os codecs efetivos dependem da WebView. É possível incluir subpastas, ordenar, avançar/voltar, repetir faixa/lista, embaralhar e ajustar volume/progresso. Uma faixa inválida é pulada, com limite para não entrar em loop infinito de erros.

O app já usava input file e não expunha um seletor nativo de diretórios. A seleção múltipla e `webkitdirectory` reaproveitam a WebView Chromium, sem criar endpoints de upload nem adicionar Electron. Se o seletor de pasta do runtime não funcionar, Escolher músicas permite selecionar vários arquivos.

Por padrão a biblioteca vive somente na execução atual. “Lembrar biblioteca e posição” guarda os blobs em IndexedDB, neste dispositivo, sem envio ao servidor. A restauração nunca começa a tocar sozinha. Desmarcar a opção ou Limpar biblioteca apaga os blobs guardados. Preferências ficam em `accessManager.world.settings` (version 1), com normalização de valores antigos/inválidos. Os controles de volume/qualidade atuais continuam com suas chaves anteriores.

## Falas

Menu → Falas do NPC permite escolher trigger/categoria, habilitar, editar/adicionar/remover frases, pesos, sequência ou aleatório, cooldown, filtro de palavrões e preview. TTS é opcional, depende das vozes do sistema e nunca impede o balão de funcionar. Texto é atribuído com `textContent`, sem HTML ou avaliação de comandos.

Triggers de conexão, diagnósticos e cópia do atendimento recebem somente nomes de eventos. RSSI abaixo de -75 dBm e potência RX fora de -27 a -8 dBm produzem alertas visuais aproximados a partir da última coleta; são indicadores lúdicos, não substituem a análise técnica. Os dados de clientes não são usados para nomear o NPC. A arena ignora telemetria real.

## YouTube

E na TV ou Menu → TV abre a busca de mídia dentro do Access Manager e libera o mouse enquanto o painel está em foco. O campo aceita uma pesquisa textual do YouTube ou uma URL/ID/playlist. Pesquisas passam pelo endpoint local `/api/media/youtube/search`, que retorna resultados com título, canal, duração e miniatura; isso evita depender de CORS direto na WebView.

Ao escolher um resultado, a IFrame Player API oficial é montada na superfície da televisão modelada no cenário por `CSS3DRenderer`, alinhada à câmera do mundo. O vídeo não é reproduzido em uma tela separada do painel. Fechar a busca devolve o controle ao mundo sem destruir o player, então o vídeo continua na TV 3D. Controles e branding do YouTube são preservados; não há download, extração de stream ou captura do vídeo para textura WebGL.

A pesquisa sem chave usa a página pública de resultados do YouTube e pode precisar de ajuste se o formato externo mudar. Falha de rede/API, vídeos com embed desativado, CSP e erro 153 de identificação da WebView ainda podem impedir reprodução; colar uma URL/ID diretamente e Abrir no navegador permanecem como alternativas.

## Arena e performance

Router Rumble é opt-in, com vida, combo, bloqueio, esquiva, dano, queda, provocação, vitória/derrota e revanche. A arena entra em terceira pessoa por padrão e reposiciona o jogador dentro do alcance inicial. O roteador é um alvo interativo: E executa soco leve e F golpe forte; J/K fazem as mesmas ações, enquanto B/Q/T controlam defesa/esquiva/provocação. O HUD também oferece botões equivalentes e mostra distância, vida e cooldown. Golpes fora de alcance não causam dano.

As ações de combate são isoladas por tratamento de erro para uma falha de UI, TTS ou callback não encerrar o renderer/WebView. O oponente se aproxima e sinaliza ataques antes de atingir. Não há sangue. Não existe import de serviços de equipamentos no módulo de combate. O sistema emite apenas triggers de diálogo e nenhuma ação da arena dispara comandos reais no equipamento conectado.

O roteador é um modelo procedural próprio; pernas, braços e antenas são animados por estado. As bibliotecas CC0 humanoides foram pesquisadas, mas não adicionadas por exigirem retargeting e trazerem geometria desnecessária. Modelos de escritório Kenney são carregados sob demanda, somente quatro GLBs com 75,6 KB no total; fallback procedural preserva interações se falharem. O motor físico único é Cannon ES para bola/gravidade; o jogador mantém o controller existente com colliders simples. Não há navmesh: as rotas curtas do NPC não exigem Recast.

| Qualidade | DPR máximo | Sombras | Partículas Aero |
|---|---:|---|---:|
| Baixa | 1 | Não | 12 |
| Média | 1,5 | 1024 | 28 |
| Alta | 2 | 2048 | 50 |

O debug opcional mostra FPS, draw calls, triângulos, assets e quantidade de geometrias. São contadores do renderer, não medição de VRAM em bytes. Nenhum pós-processamento extra foi introduzido. Objetos fora da cena ficam ocultos; props e GLBs são descartados/recarregados na troca. Os bundles continuam carregados só ao entrar em cada experiência.

## Manutenção e validação

`world/experience.js` cuida da UI; `settings.js`, `playlist.js`, `dialogue.js`, `interactions.js` e `combat.js` têm regras testáveis sem WebGL. `environment.js` declara cenários e objetos, usa a registry central e controla física/poses. `renderer.js` continua responsável por câmera e renderização WebGL/CSS3D. `bridge.js` conecta tudo à sessão atual.

```bash
npm ci
npm test
python -m pytest -q
python tools/world3d_assets.py
python tools/sync_frontend.py
python tools/sync_frontend.py --check
python manage.py collectstatic --no-tailwind
node tests/visual/world-interactions.cjs
```

O smoke visual usa Chromium com WebGL e fixtures de equipamento, sem chamar roteadores reais. A variável `ACCESS_MANAGER_CHROMIUM` pode selecionar o executável local e `ACCESS_MANAGER_BROWSER_LIBS` suas bibliotecas. Evidências e limitações estão em `docs/qa/world-interactions/REPORT.md`.

No CI, o smoke verifica layout/contraste e comportamento sem gravar imagens. Para registrar capturas explicitamente, execute com `ACCESS_MANAGER_QA_SCREENSHOTS=1`; `ACCESS_MANAGER_QA_SCREENSHOTS=0` desativa somente a gravação. A lógica de teste permanece a mesma.