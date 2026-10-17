# Atendimento em texto humano

A cópia padrão agora passa por `service/human-formatter.js`. O formatador usa adaptadores explícitos para identificação, conexão/CPE, WAN, óptica, clientes, assinantes, Routing Engines, interfaces, ping, traceroute e alterações de configuração. Objetos desconhecidos não são serializados no texto operacional.

## Interface e exportação

- **Copiar atendimento** respeita o formato selecionado: resumo operacional (padrão), linha do tempo ou texto corrido.
- **Detalhes técnicos / JSON** e **Copiar detalhes técnicos** são opções explícitas e secundárias.
- **Exportar TXT** usa o mesmo formato humano da prévia. Ao selecionar o modo técnico, o botão passa a **Exportar JSON técnico**.
- Senhas continuam no atendimento atual em memória. A opção de incluir senhas controla prévia, cópia e exportação em todos os formatos; permanece desmarcada ao abrir o painel.
- A timeline usa horário e frases, sem nome de rota, ID de sessão interno ou payload. O texto segue a sequência das operações e separa leituras, alterações e testes.

## Correções semânticas

RX/TX aceitam o primeiro valor numérico finito entre `rx_power_dbm`, `rx_dbm`, `rxPower`, `rx`, `rx_power` e os equivalentes de TX. Valores ausentes são omitidos; não se gera “Não disponível dBm”. O exemplo -22.8399 passa a -22.84 dBm. Zero é uma medida válida.

Leituras Juniper transportadas por POST são tratadas como leituras. Recursos são resumidos por slot, interfaces por contagem de estados e até três links ativos relevantes. A consulta de assinante usa somente sessões confirmadas; candidatos NOT_FOUND e falhas parciais não viram uma declaração de assinante offline.

Leituras repetidas são deduplicadas pelo conteúdo semântico. Mudanças de medida continuam aparecendo, inclusive dentro de 30 segundos. O acesso CPE e sua seleção de contexto não geram duas descrições do mesmo acesso. Alterações mostram apenas campos operacionais conhecidos, sem converter objetos arbitrários em texto. Escrita sem confirmação de leitura e falha mantêm essa limitação explícita.

A estrutura interna de eventos continua disponível. O modo técnico serializa os eventos já retidos e sanitizados; ele não restaura raw output ou credenciais removidas pela política anterior de captura.

## Exemplo e evidências

[Texto gerado para Juniper/CPE](qa/human-service/example.txt) e [fixture de entrada](../tests/fixtures/service-log/juniper-cpe.cjs). O exemplo reproduz os schemas normalizados existentes e o cenário do prompt, com identidade/endereço sintéticos; não representa uma nova conexão com equipamento físico. O [snapshot esperado](../tests/fixtures/service-log/juniper-cpe-human.txt) é verificado por teste.

| Tema | 1366×768 | 1600×900 | 1920×1080 |
| --- | --- | --- | --- |
| Aero | [Captura](qa/human-service/human-aero-1366.webp) | [Captura](qa/human-service/human-aero-1600.webp) | [Captura](qa/human-service/human-aero-1920.webp) |
| Terminal | [Captura](qa/human-service/human-terminal-1366.webp) | [Captura](qa/human-service/human-terminal-1600.webp) | [Captura](qa/human-service/human-terminal-1920.webp) |

## Validação

- Frontend: 91 testes aprovados; sete novos casos semânticos e regressões da auditoria de senha.
- Backend: 535 testes e 30 subtestes aprovados.
- Navegador: seis cenários (dois temas × três resoluções), com cópia pelo botão, resumo/timeline/texto corrido, download TXT real e cópia técnica com JSON válido. Nenhum erro JavaScript. Ver `qa/human-service/checks.json`.
- Build e verificação dos bundles: aprovados.
- `collectstatic --no-tailwind`: sem erros.
- `git diff --check`: sem erros.

A integração de clipboard foi verificada no navegador com um destino de cópia de teste. O download TXT foi lido de volta e seu conteúdo foi validado. WebView Windows e equipamentos físicos não foram executados nesta rodada. Nenhum protocolo, endpoint ou writer foi alterado.

## Arquivos alterados

- `apps/access_manager/static/js/service/human-formatter.js`
- `apps/access_manager/static/js/service/model.js`
- `apps/access_manager/static/js/service/panel.js`
- `apps/access_manager/static/js/shared/forms.js` (associa o endpoint ao evento estruturado)
- `apps/access_manager/static/js/runtime.js` (bundle sincronizado)
- `tests/frontend/human-service.test.cjs`
- `tests/frontend/service-voxel.test.cjs`
- `tests/fixtures/service-log/juniper-cpe.cjs`
- `tests/fixtures/service-log/juniper-cpe-human.txt`
- `tests/visual/human-service.cjs`
- `.gitignore` (capturas PNG intermediárias)
- Este relatório, exemplo TXT, checks e seis capturas WebP em `docs/qa/human-service`.
