# Access Manager — concorrência, latência e valores técnicos

## Problema reproduzido

A navegação anterior fazia `workspace.innerHTML = await view.render()` sem verificar se a aba ainda era ativa. Wi-Fi esperava uma leitura combinada de redes/rádios/opções; o editor de Perfil aguardava essa mesma leitura antes de abrir o dialog. Uma resposta atrasada substituía o workspace de outra aba, e um modal antigo podia abrir após sair de Perfis.

A reprodução e a comparação usaram o runtime de main `148365e` como baseline, a mesma WebView Qt real do Vela e respostas sintéticas com latência controlada. O baseline foi carregado apenas no processo de QA, sem modificar código de produção nem dados de equipamento.

## Resultado medido

| Fluxo | Antes | Depois |
|---|---:|---:|
| Estrutura Wi-Fi visível | 2002,7 ms | 1,9 ms |
| SSIDs visíveis | 2002,7 ms | 103,8 ms |
| Reabrir Wi-Fi | 2001,8 ms | 1,4 ms |
| Abrir Novo Perfil | 2012,6 ms | 4,9 ms |
| Resposta Wi-Fi sobre WAN | Reproduzida | Impedida |
| Modal atrasado sobre outra aba | Reproduzido | Impedido |

Latência do cenário: endpoint combinado anterior e rádios = 2000 ms; SSIDs separado = 100 ms. O novo shell/modal aparecem antes das respostas. Não houve medição em ONT física. JSONs exatos: performance-before.json e performance-after.json. O número total de HTTP requests do cenário não é diretamente menor: dividir a leitura em componentes permite antecipar SSIDs sem esperar rádios; cache evita novas leituras na reabertura recente.

## Correção estrutural

- Toda navegação cria uma geração e um AbortController central no API service; view anterior e filhos de modal são invalidados. O render verifica a geração antes de alterar workspace/mount/erro. Estado de loading/erro/geração fica separado por view.
- GETs obsoletos são abortados; uma verificação adicional ignora respostas mesmo quando o transporte não atende ao abort. AbortError não produz toast. A navegação fecha o dialog da aba anterior.
- O cancelamento do frontend não interrompe nem desfaz operações no equipamento. Writers não são cancelados/repetidos automaticamente; seus resultados obsoletos deixam de manipular a UI e seguem registrados pelo backend. Não se introduziu retry de escrita.
- Wi-Fi abre a estrutura imediatamente. SSIDs e rádios possuem regiões e leituras independentes; cada componente aparece/erra separadamente. Atualizar revalida localmente, sem substituir o workspace inteiro.
- Perfis mostra Novo Perfil mesmo enquanto sua lista está carregando. O modal abre sincronicamente; dados básicos/DNS/DHCP aparecem de imediato e somente rádios/opções são buscados em background. Não lê clientes, tráfego, WAN, histórico ou senha para construir o formulário.
- Capabilities são reutilizadas da sessão. Não foi acrescentado prefetch de rádio pesado; a sessão/runtime já possui probes e prefetch não deve disputar o lock com Overview.

## Cache e preservação de edição

Cache somente em memória, isolado pelo UUID de sessão, máximo 15 s. Até 3 s reutiliza sem chamada; entre 3 e 15 s apresenta snapshot e revalida. SSIDs/rádios e lista de perfis possuem callbacks locais; WAN/LAN/DHCP/DNS/Gerenciamento usam patch incremental após revalidação. Requests idênticas em andamento são deduplicadas dentro do mesmo scope. Troca de sessão ou escrita invalida snapshots; revisão impede uma leitura anterior à escrita de repopular cache obsoleto.

Senha/token/secret/authorization e campos equivalentes são removidos recursivamente antes do cache. Revelação Wi-Fi é somente sob demanda e nunca cacheada. Nenhum localStorage/sessionStorage/arquivo contém snapshots ou senhas. POSTs de leitura (preview, diagnóstico, histórico de tráfego e reveal) não invalidam configurações por engano.

Dialogs têm scope próprio, cancelado ao fechar. Atualizações de leitura não percorrem seus formulários. O patch preserva raiz, scroll e inputs focados/dirty; o editor de Perfil deixa de substituir rádios após edição. Nome/DNS/pool digitados não são repopulados por metadata. Ao salvar antes de carregar opções, intenção de rádio antiga é preservada.

## Otimização de leitura existente

- APIs novas `/api/device/wifi/ssids` e `/api/device/wifi/radios` reutilizam readers existentes. O endpoint combinado continua disponível.
- Perfis usa somente `/wifi/radios`; reveal usa somente a leitura de redes, sem custo de rádios.
- ZTE consulta a view de opções básica uma vez para os dois rádios (antes uma por rádio).
- Huawei memoriza páginas GET bem-sucedidas somente durante a leitura de rádios. Páginas AMP comuns não são requisitadas outra vez para a segunda banda. O memo é thread-local e descartado em finally; nenhuma página é retida entre operações ou usada por writers/readback. Exceções não são cacheadas, preservando tentativas existentes.
- Protocolos, endpoints de mutation, autenticação e confirmação de escrita permanecem funcionais. Leituras de equipamento mantêm o operation_lock: requests HTTP independentes partem em paralelo, mas não se paraleliza um protocolo com estado compartilhado.
- Encontrado e corrigido erro de formulário: combo de rádio enviava markup HTML no payload. Agora envia somente o valor escolhido, com regressão específica.

## Timing de desenvolvimento

`window.__AM_DEBUG__ = true` habilita measures/console com nome de etapa e duração, sem dados, payloads ou secrets. Estágios: wifi.load.ssids, wifi.load.radios, wifi.load.total, profiles.modal.open e profiles.options.ready; API também registra tempos de leitura. Clientes não são buscados pela tela Wi-Fi; capabilities/context vêm do estado da sessão. No backend, logging DEBUG de DeviceQueryBus informa tempo total e espera pelo lock, sem argumentos/credenciais. Com debug desligado, não se acumulam entradas performance.measure durante polling.

## Semântica visual

Token único `--technical-value: #624098`, classes tech-value/tech-rate/tech-address/tech-radio-value. Helpers de métricas, campos e tabelas aplicam roxo a IP/DNS/MAC/VLAN/MTU, bytes, taxas, rádio, latência, números e demais configurações técnicas. Aplicado a Overview, Clientes, Tráfego, Wi-Fi, WAN, LAN, DHCP/DNS, Diagnóstico, Perfis e Gerenciamento. Conectado/online/ativo continuam verdes; offline/falha vermelhos; indisponível cinza. Page titles e labels mantêm a paleta anterior. Não se usa cor como único sinal de status.

Contraste calculado WCAG: 7,76:1 no branco e 7,15:1 no background #f6f5f9 (supera AA para texto normal). Screenshots da WebView real foram inspecionados.

## Validação e limites

- 143 testes Python + 2 subtestes: suíte completa após mudanças de leitura; memo Huawei, view ZTE única e contratos HTTP Vela dos endpoints separados.
- 22 testes DOM do runtime compilado: regressões de navegação atrasada, erro obsoleto, cancelamento, modal imediato/fechado, snapshot sem segredos, cache quente, SSIDs progressivos, formulário dirty, payload de combo e cores semânticas.
- Chromium portátil nas três resoluções: navegação/overflow/drawer/modal e estabilidade do polling (cards/SVG/scroll/pontos).
- Fluxo real manage.py/runapp → shell HTTP Vela → pywebview/Qt → bridge/rota reais, em Linux Qt offscreen: comparação antes/depois, race com respostas que ignoram abort, modal imediato, três resoluções (1366×768, 1600×900, 1920×1080), resize/maximize e shell/modal preservados.
- Dados de ONT são fixtures sintéticas; Windows/WebView2 e latência física de Huawei/ZTE não foram testados. O aviso preexistente da CDN Tailwind do shell não impediu o layout local; nenhum erro JS do Access Manager.
- sync_frontend, collectstatic, compileall, node --check e diff check. Artefatos de QA em docs/screenshots e docs/screenshots/vela.
