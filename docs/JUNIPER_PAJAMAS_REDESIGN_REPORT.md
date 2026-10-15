# Access Manager — redesign Juniper inspirado no Pajamas

## Estado e escopo

Branch `feat/juniper-bng`, continuação de `09959b16d7855f3f3444d2527d9349053099b1bf`. Sem reset, reclone ou merge em main. Referências lidas: PROMPT_REDIRECT_ACCESS_MANAGER_JUNIPER_PAJAMAS e o HTML 04_gitlab_pajamas_full fornecidos pelo usuário. O HTML serviu como referência de hierarquia e proporções; seu JS, dados, logo, raposa, branding e dependências não foram incorporados.

Mudanças somente no frontend, testes visuais/comportamentais e documentação. Nenhum provider, transporte, domínio, contrato de API ou capability foi alterado. Huawei/ZTE mantêm sua apresentação existente; o novo estilo fica sob `.juniper-shell` / `.juniper-surface`.

## Arquivos e componentes

- `static/css/juniper.css`: tokens e regras comuns do módulo; topbar, sidebar, grupos, tabelas, painel lateral, tabs, drawer, key/value, estados, modal e responsividade.
- `static/js/shared/juniper-ui.js`: DataTable, KeyValue, Status, Tabs, EmptyState e Drawer reutilizáveis.
- `workspaces/views/juniper.js`: 21 páginas reais, busca/lista/detalhe, seleção persistente, filtros locais, detalhe completo com tabs, leituras sob demanda, overview e handoff usando APIs existentes.
- `workspaces/app.js`: registro das rotas, grupos recolhíveis, abertura do grupo ativo, aria-current, breadcrumbs clicáveis e isolamento visual do módulo. Correção de prefill tardio para não sobrescrever host já digitado; inspeção SSH conectada usa endpoint da sessão.
- `shared/ui.js`: limpeza da classe do drawer ao reutilizar o modal existente.
- `templates/index.html`: asset CSS local, identificação do módulo e Ajuda funcional. Topbar/sidebar globais continuam pertencendo ao shell Vela.
- `static/js/runtime.js`: bundle sincronizado.
- `tests/frontend/runtime.test.cjs`: regressões comportamentais; testes anteriores de detalhe atualizados para o painel lateral.
- `tests/visual/juniper-pajamas_driver.py` e `juniper-pajamas-native.cjs`: execução Vela real e verificação de todas as rotas, nas três resoluções.
- `docs/screenshots/juniper-pajamas/`: capturas e qa.json desta rodada; capturas anteriores preservadas.

## Linguagem visual e UX

Topbar 48 px, fundo #29263B; sidebar 230 px, clara; workspace com padding interno 20/26 px. Sem margem entre shell e WebView. Containers com bordas discretas, raio 6 px, sem sombras grandes. Inputs 36 px, botões compactos, linhas de tabela aproximadamente 38 px. Valores técnicos em monospace; status com dot discreto.

Tokens: fundo #FBFAFD, sidebar #F6F3FB, superfície #FFFFFF, texto #18171D, secundário #626168, terciário #7B7683; bordas #DCDCDE/#ECECEF, hover #FAF9FF, seleção #F1EDFC. Primário próprio do Access Manager #8B3DFF, hover #7A32E5, suave #F1EAFE. Estados #108548/#B86E00/#C91C00/#1F75CB. Cor semântica restrita a status/alertas/ações.

A busca mantém tabela à esquerda e detalhe à direita, com seleção visível. Detalhes/Serviço/Rede trocam conteúdo no mesmo painel. A página completa usa Resumo/PPPoE/AAA/Accounting/Serviços/Roteamento/Diagnóstico. IPv6, DNS, child sessions e demais atributos normalizados continuam acessíveis no expansível avançado. Filtros dinâmicos retornados pelo BNG continuam consultáveis em Serviços. A resposta antiga de uma aba não pode sobrescrever a aba atual.

Interface, LACP e óptica abrem drawer de 440 px, com scroll interno e lanes preservadas. Acessar CPE usa drawer com contexto PPPoE/contrato/MAC, IPv4 protegido, credenciais próprias e ações sempre no rodapé. Host key continua em modal de decisão, centralizado na WebView, com servidor, algoritmo, fingerprints e alerta em português para chave alterada; sem confiança automática.

O prototype sugere métricas de sessões globais, mas a API atual não fornece essas métricas normalizadas. A overview usa apenas facts/RE/interfaces reais; não foi copiado nenhum número, assinante, IP ou hostname do HTML. Nenhum gráfico foi inventado. Não há asset ou biblioteca remota nova.

## Matriz de navegação e conteúdo

QA = execução nas resoluções 1366×768, 1600×900 e 1920×1080 no Vela/Qt real, com API Bottle real e transportes remotos sintéticos.

| Rota | Navegação | Conteúdo real reutilizado | QA |
|---|---|---|---|
| juniperOverview | Visão geral | Facts, RE e interfaces; erros secundários independentes | 3 tamanhos |
| subscribers | Buscar assinante | Lookup/candidatos, filtro por estado, tabela e detalhe fresco | 3 tamanhos |
| juniperSubscriber | Sessão PPPoE | Sessão selecionada, resumo e tabs; atributos avançados | 3 tamanhos |
| juniperAccounting | Accounting | Accounting da sessão, famílias e contadores acumulados | 3 tamanhos |
| juniperServices | Serviços | Service sessions/shaping/filtros retornados; sem plano inventado | 3 tamanhos |
| juniperInterfaces | Interfaces | Inventário e detalhe sob demanda em drawer | 3 tamanhos |
| juniperLacp | LACP | Seleção de interface, reader LACP e drawer | 3 tamanhos |
| juniperOptics | Óptica | Seleção de interface, módulo e lanes em drawer | 3 tamanhos |
| juniperRouting | Roteamento | Route/FIB da sessão; falhas independentes | 3 tamanhos |
| juniperRadius | RADIUS | Profiles/servidores/portas/status retornados | 3 tamanhos |
| juniperAuth | Autenticação | Contadores acumulados AAA | 3 tamanhos |
| juniperAaaAccounting | Accounting AAA | Contadores acumulados AAA accounting | 3 tamanhos |
| juniperDynamic | Dynamic Requests | Contadores acumulados dynamic requests | 3 tamanhos |
| juniperPppoe | PPPoE diagnóstico | Detalhe PPPoE do assinante selecionado | 3 tamanhos |
| juniperLockout | Lockout | Correlação por MAC do reader existente | 3 tamanhos |
| juniperDiagnostics | Ping / Traceroute | Formulário e resultado estruturado existentes | 3 tamanhos |
| juniperLogs | Logs | Página explícita de indisponibilidade: API sem leitor de logs | 3 tamanhos, sem dados simulados |
| juniperSystem | Routing Engine | RE, CPU/memória/temperatura/load retornados | 3 tamanhos |
| juniperFpc | FPC / Chassis | Reader FPC existente | 3 tamanhos |
| juniperEnvironment | Ambiente | Sensores/estado existentes | 3 tamanhos |
| juniperHardware | Hardware | Inventário chassis existente | 3 tamanhos |

Páginas por assinante exigem seleção explícita; sem ela oferecem Buscar assinante. Nenhuma escolhe arbitrariamente a primeira sessão. Voltar ao assinante preserva consulta e seleção, com refresh controlado. Grupos da sidebar usam details/summary, conservam seu estado ao navegar e abrem o grupo da rota ativa.

## Testes e QA

- `python -m pytest -q`: **464 passed + 30 subtests passed**; suíte completa incluindo Huawei/ZTE, sessões independentes, host trust e parsers.
- `npm test`: **44 passed**, incluindo grupos/rotas, seleção, filtros, tabs, resposta antiga, contexto após navegação, limpeza de senha no drawer, empty state, atributos avançados, filtros de serviços e endpoint correto no modal SSH.
- `python tools/sync_frontend.py --check`, `python manage.py collectstatic --no-tailwind` e `git diff --check` passaram.
- Vela real: driver executa `manage.py runapp`, API Bottle e Qt WebEngine; apenas Junos/ZTE e a inspeção de chave no QA são sintéticos. **21 rotas × 3 resoluções** com navegação/conteúdo, grupo ativo, shell nas bordas e ausência de overflow horizontal no shell. Também handoff CPE/retorno, sessão Juniper preservada, modal central e drawer junto à borda direita com footer visível.
- Capturas revisadas de overview, busca/detalhe, sessão completa, accounting, serviços, interfaces, LACP, óptica, RADIUS, diagnóstico, sistema, CPE e host key. Comparadas às proporções/estrutura do HTML de referência.
- Não houve autenticação física no MX204 nem execução Windows/WebView2 nesta rodada. Os dados das capturas são sintéticos. O backend continua sujeito às limitações físicas já documentadas.

## Pendências e limites explícitos

Logs possui navegação funcional, mas não há leitor na API existente; a página informa isso. Busca MAC/Session ID não foi adicionada: o backend atual aceita contrato/username/IP, portanto a UI não promete formatos extras. Raw CLI/XML não é exportado pelo backend e não foi inventado um accordion vazio. Não foi criado usuário/hostname/avatar fictício para a topbar. Campos/counters ausentes continuam indisponíveis; não foram fabricados RX/TX/errors/drops ou métricas globais.

Permanecem as pendências anteriores de capturas completas do alvo, Windows, path automático comprovado e leitura avançada. Writes continuam bloqueados; nenhuma evidência/capability foi promovida. A migração integral não foi declarada concluída.

Perfis preservados: SHA256 `0c04d0a57d4ba19f9fcbdd91534f11252cc4ce1a8a76a29db9ffcab3b820e3de`.
