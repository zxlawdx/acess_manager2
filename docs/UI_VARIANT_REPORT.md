# UI Variant — human-motion-experiment

- Branch: `ui/human-motion-experiment`.
- Base: `feat/direct-visual-references` em `740638e1ba215246c16c77f7f91a5468e15c2a8b`.
- Commit desta variante: `git log --oneline 740638e..ui/human-motion-experiment` (a documentação integra o próprio commit).
- Stack: Vela, pywebview/Qt, módulos JavaScript compilados com esbuild, CSS e SVG locais. Não há framework novo nem biblioteca de animação.

## Mudanças e limites

Tradução semântica das cores claras existentes para o escuro: fundos, superfícies, bordas, texto, estados, formulários, gráficos, diálogos e tooltips. Claro/escuro/sistema compartilham os mesmos componentes e geometria. A preferência persiste localmente, acompanha mudanças do sistema apenas em Sistema e sincroniza outras janelas. Topbar de 58 px e sidebar de 224 px preservadas. A tipografia real do baseline é DM Sans/Space Mono; foi preservada, apesar de o briefing mencionar Inter.

LAN recebeu desenho RJ45 original, estados ativo/desconectado/não detectado, velocidade textual sem inferir unidades, cliente quando informado e tabela técnica preservada. Atualização de cinco segundos e botão manual reutilizam `/api/device/lan`, cancelam na navegação e preservam nós. Não existem LED ou tráfego simulados: pulso de 240 ms exige aumento de contador da mesma porta; reset não é atividade. Mudanças de link têm transição de 240 ms. Esta variante também destaca por 240 ms valores realmente alterados e por 180 ms novas linhas inseridas em tabelas. Um MutationObserver limitado ao workspace observa texto e linhas, sem medir layout, buscar dados ou alterar scroll. A primeira renderização não simula alterações. Mudanças em valores ópticos, WAN e Wi-Fi seguem os elementos reais existentes, sem interpolação numérica fabricada. Modais abrem em 150 ms e drawers em 160 ms, com deslocamento de 3/6 px. Reduced motion remove o feedback e cancela marcações em andamento. Reduced motion desativa transições e pulsos.

Cabeçalhos mais compactos, separação do título da página, foco de linha por teclado e tratamento coordenado de velocidade/cliente nas portas complementam o tema. Foco visível, autofill, campos somente leitura/desabilitados/inválidos, cabeçalhos e hover de tabelas recebem tokens. Capabilities têm texto humano e mantêm o enum em título. Contratos, autenticação, protocolos, writers, rotas, perfis e ações críticas permanecem iguais. Nenhum fixture entra no runtime de produção.

A branch foi criada diretamente do baseline, sem merge ou cherry-pick da variante A. Os papéis de tema e o componente LAN comuns foram aplicados como alterações independentes sobre esse baseline.

## Pesquisa aplicada

Ver [UX_REFERENCE_SCAN.md](UX_REFERENCE_SCAN.md): Cockpit/Beszel/Maybe orientaram a separação entre preferência e tema resolvido; Twenty e o template desktop orientaram papéis semânticos sem alterar medidas. Referências foram conceituais; nenhum componente externo foi copiado. Beszel/Uptime Kuma orientaram estados discretos de monitoramento e Plane/Twenty orientaram hierarquia e foco contextual; nenhum efeito imita atividade não observada. Rejeitados glassmorphism, neon, gradientes decorativos, redesign do shell e animação contínua de telemetria.

## QA

- Python: **295 testes + 30 subtestes** aprovados.
- Frontend: **36 testes** aprovados, incluindo tema, LAN e reduced motion.
- `python tools/sync_frontend.py`, `python manage.py collectstatic --no-tailwind` e verificação de sincronização.
- Chromium: navegação de todas as páginas, overflow, drawer e estabilidade de polling em três resoluções.
- **Vela real / pywebview Qt**: `manage.py runapp` via driver nativo; 1366×768, 1600×900, 1920×1080; claro e escuro. Shell sem margem externa; tabelas, LAN, WAN, Wi-Fi, clientes, histórico, formulário e drawer. Persistência, preferência do sistema, contraste do texto secundário LAN >= 4.5 e reduced motion verificados.
- QA nativo existente também passou: resize/maximize, modal com ações fixas, latência controlada, navegação e ausência de respostas obsoletas. Polling conserva cards, gráficos, scroll e foco.
- Evidências: [screenshots/variants/human-motion-experiment](screenshots/variants/human-motion-experiment), com `qa.json` e capturas específicas do histórico de operações em cada tema/resolução. Dados de roteador sintéticos **somente nos testes**; janela, WebView e bridge reais. Não foi teste físico em Huawei/ZTE nem execução Windows. Qt offscreen informa maximize 796×796; os três tamanhos foram definidos explicitamente. Aviso CDN Tailwind preexistente do framework não é erro do Access Manager.

Não há denominador óptico real para inventar barra percentual; os valores e estados existentes são preservados. Histórico de Gerenciamento não é streaming de logs. Sem telemetria por porta, o LED não pulsa.

## Arquivos

`static/css/{tokens,app}.css`, `static/js/{entry,runtime}.js`, `shared/{theme,lan-ports,motion,ui}.js`, `workspaces/app.js`, `views/{network,complete-diagnostics}.js`, `templates/index.html`, testes frontend e QA nativo. Todos sob `apps/access_manager` quando aplicável. Build gera `runtime.js` a partir dos módulos; não editar o bundle manualmente.

## Como executar

```powershell
git switch ui/human-motion-experiment
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python tools\sync_frontend.py
python manage.py collectstatic --no-tailwind
python manage.py runapp
```

Testes: `python -m pytest -q`, `npm ci`, `npm test`, `npm run check`. QA automatizado requer Chromium portátil e dependências Qt; `node tests/visual/variants-native.cjs` conecta ao driver de teste em 9222/9223, não a uma porta extra de produção.
