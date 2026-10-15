# P0 — reparo do runtime Juniper físico

Branch: `feat/juniper-bng`.

Commit inicial: `4076ef612788ec26b7b27c86615fface397b1423`.

Commit final de implementação: `c5f8dfa7e44eb60bf29c01141e81dc6053371da1`.

Commit final de código + testes + capturas: `b73d1795d9d0526311b99e53391feb173df21070`. A publicação inclui um commit de documentação subsequente; seu hash é o HEAD que contém este relatório.

## Bugs reproduzidos e causas

| Sintoma | Causa reproduzida | Correção |
|---|---|---|
| RADIUS físico rejeitado | Root aaa-module-radius-servers-information e filhos sequenciais, sem radius-server por registro | Percurso sequencial com perfil corrente, flush no próximo servidor/perfil e available-status |
| Autenticação com campos ausentes | Aliases físicos rejects-no-server / rejects-invalid-credentials não reconhecidos | Aliases físicos prioritários e schema de Authentication próprio |
| Accounting AAA genérico | Parser de Authentication misturava métricas de outros readers | Parser específico para requests/responses, Start/Interim/Stop, pending e retransmissions |
| Dynamic Requests incompatível com root físico | Root aaa-module-dynamic-requests-statistics não reconhecido | Parser próprio com processed-initial e counters cumulativos |
| Accounting do assinante sem valores | acc-* e estilo accounting-ipv6 ignorados | Aliases acc-* e família inet/inet6 pelo style, preservando contadores como strings decimais |
| LACP vazio/incompatível | Parser não lia lag-lacp-state / lag-lacp-info | Aggregate e membros agrupados, Actor/Partner associados por interface e role |
| Timeout solicitado 24 limitado a 8 | min(timeout, rpc) na execução | Política por feature; timeout explícito respeitado até orçamento máximo explícito de 120 s |
| Erros indistintos | COMMAND_ERROR usado para parse, shape, size e execução | Códigos próprios e ApiError preservando code/type/retryable/status/request_id |
| Online após erro SSH | Frontend guardava estado antigo | Metadata distingue autenticação/transporte/última falha; topbar Degradado para transporte, sem desconectar na primeira falha |
| LACP/óptica lentos antes de consultar | Inventário global era pré-requisito | Forms de consulta específica, sugestões limitadas já observadas e nenhuma busca automática de inventário nessas páginas |
| Inventário com pp0/demux | show interfaces terse global | Consulta de mídia com filtro fixo documentado, somente nomes físicos/agregados/loopback e limite de 512 linhas |
| Counters visualmente distantes | KV genérico usando toda a largura | j-counter-table com largura limitada, valores à direita, monospace e labels pt-BR |
| Tab em desacordo com sidebar | Estado global anterior prevalecia na reentrada da rota | Rota dedicada sempre aplica tab canônica; página genérica preserva sua navegação interna |
| Porta customizada omitida | Metadata não carregava porta efetiva | Porta real guardada no transporte/provider/sessão; endpoint canônico na topbar |

## Parsers físicos implementados

RADIUS, AAA Authentication, AAA Accounting, AAA Dynamic Requests, accounting do assinante e LACP aceitam as estruturas fornecidas no anexo `Markdown colado(20261015-105226).md`. Formatos legados continuam explicitamente testados; estruturas desconhecidas e counters não numéricos não viram sucesso vazio. Valores decimais permanecem strings, evitando perda de precisão de 64 bits no JavaScript.

Óptica preserva módulo/temperatura/tensão e cada lane, incluindo bias/TX/RX e alarmes/warnings/thresholds por módulo e lane. A UI não escolhe uma lane como leitura do módulo. LACP apresenta tabela por membro com Actor/Partner e detalhes avançados vinculados à interface.

Não foi adicionado nenhum write, CoA, clear, set, commit ou alteração de capability para escrita.

## Timeouts e limites

| Feature | Segundos padrão |
|---|---:|
| Facts / uptime | 8 |
| Subscriber username / address / selected ID | 24 |
| Interfaces / accounting do assinante | 20 |
| Interface / LACP / optics / RADIUS / três readers AAA | 15 |
| Route / FIB / PPPoE / AAA subscriber / lockout | 12 |

O lookup mantém seu orçamento total de 24 s; não multiplica o timeout por prefixo. O pedido explícito timeout=24 chega intacto ao SSH e NETCONF. Não há retry automático. Leitura retryable oferece ação explícita na UI.

Resposta máxima continua **4 MiB**, verificada no SSH, NETCONF e parser. Excesso retorna RESPONSE_TOO_LARGE. Inventário máximo de 512 interfaces físicas/agregadas/loopback é aplicado dentro do parser para que a telemetria registre a falha corretamente. Não foi aumentado o teto para aceitar dumps gigantes.

## Inventário e consultas específicas

O catálogo substitui o dump global por `show interfaces "[aeglx]*" media`, seguido da saída XML/no-more fixa. O filtro é constante do produto, não input do usuário. Remove pp0/demux do escopo de consulta; o normalizador mantém apenas ae, et, xe, ge e lo, sem unidades lógicas. Interfaces de assinante continuam acessíveis por seu contexto específico.

A sintaxe de wildcard operacional e a opção media foram verificadas nas referências oficiais abaixo. **Este comando novo não foi executado pelo agente no MX204 físico.** Se a release/conta rejeitar a sintaxe, o erro permanece explícito; não existe fallback para dump global. LACP/óptica funcionam por nome específico independentemente desse inventário. Sugestões no input vêm apenas da lista limitada já observada; é possível informar uma interface válida diretamente.

- [Junos CLI Operational Mode Overview](https://www.juniper.net/documentation/us/en/software/junos/cli/topics/topic-map/junos-cli-operational-overview.html)
- [show interfaces](https://www.juniper.net/documentation/us/en/software/junos/cli-reference/topics/ref/command/show-interfaces-gigabit-ethernet.html)
- [Understanding Interfaces / wildcard characters](https://www.juniper.net/documentation/us/en/software/junos/interfaces-fundamentals/interfaces-ethernet-switches/topics/topic-map/switches-interface-understanding.html)

O backend recusa escopos amplos como all, pp0 e demux0 nas leituras específicas; LACP aceita aeN e óptica aceita uma porta física et/xe/ge, sem wildcard de usuário.

## Observability

`observability.py` fornece contexto de operação via ContextVar e logging JSON sanitizado. Cada leitura emite juniper.read.start e finish/error com request_id, feature, transport, host, port, logical_command, elapsed_ms, lock_wait_ms, response_bytes, output_format, xml_root, exit_status, error_code e retryable. request_id correlaciona os subreads ao DeviceQueryBus.infrastructure e seu log de duração/lock wait.

DEBUG de parser registra somente root/nomes de filhos, limitados; não valores de XML. Erros de execução não exportam exception text remoto. Senhas AD/CPE, tokens/cookies/Authorization e XML bruto não são registrados. Testes de caplog e a execução QA verificaram ausência de credenciais e do marcador privado inserido no XML malformado.

Um deque de no máximo 100 operações pertence ao provider da sessão e é limpo ao desconectar. Endpoint read-only `/infrastructure/operations`, protegido pela sessão Juniper/capability de leitura e guard de app_session_id, abastece Diagnóstico → Logs. A UI mostra hora, feature, duração, espera pelo lock, formato, resultado e referência; não mostra XML bruto. Não é um leitor de syslog remoto.

## Erros e estado da sessão

Códigos adicionados: XML_PARSE_ERROR, XML_SHAPE_UNSUPPORTED, EMPTY_RESPONSE, CLI_COMMAND_ERROR, SSH_COMMAND_FAILED e RESPONSE_TOO_LARGE. CONNECTION_TIMEOUT, SSH_UNAVAILABLE, NETCONF_UNAVAILABLE, PERMISSION_DENIED, COMMAND_UNSUPPORTED, RPC_ERROR e DEVICE_BUSY mantêm semântica própria. COMMAND_ERROR permanece apenas para compatibilidade.

ApiError preserva code/type/retryable/status/request_id/health. Erro Juniper da API inclui referência e metadata segura. Metadata distingue session_authenticated, transport_active, last_read_failed, last_read_code e last_transport_failure. Uma resposta recebida prova transporte novamente ativo mesmo quando seu parser falha; parser não significa offline. Lookup parcialmente falho e facts com leitura secundária falha preservam health no resultado, evitando limpar degradação por um sucesso HTTP agregado.

A UI apresenta consulta em andamento, mensagem após 4 s e Cancelar espera. Cancelar aborta somente a espera do navegador; o comando já enviado pode terminar no BNG. Cancelamento não agenda nova tentativa. Retry é explícito e não aparece para XML_SHAPE_UNSUPPORTED. O timeout de canal continua limitando o trabalho remoto.

## UI

Contadores de Authentication/Accounting/Dynamic usam schemas próprios, labels pt-BR, números alinhados e formato local sem converter uint64 para Number. Nenhum total histórico vira alarme de incidente. Roteamento se chama Roteamento do assinante e identifica explicitamente Route/FIB da sessão selecionada. Rotas dedicadas restabelecem sua tab canônica ao serem selecionadas novamente.

Topbar exibe host e porta reais da metadata, inclusive IPv6 com colchetes. Falha de transporte sinaliza Degradado; falha de parser mantém transporte ativo com erro no contexto. A separação Juniper/CPE e as funcionalidades Huawei/ZTE foram preservadas.

## Fixtures físicas sanitizadas

Sete arquivos `tests/fixtures/juniper/mx204_23_4_*.xml`: radius_servers, aaa_authentication, aaa_accounting, aaa_dynamic, subscriber_accounting, lacp_ae1, optics_et_0_0_0. Proveniência em `tests/fixtures/juniper/PHYSICAL_SHAPES.md`.

São **PHYSICAL_SHAPE_SANITIZED / PHYSICAL_CAPTURE_SHAPE**: transcrições de trechos físicos fornecidos pelo usuário, com sanitização e complementação determinística das omissões. Não são anunciadas como capturas integrais. Valores de linhas/lanes adicionais são dados de teste explicitamente documentados.

## Testes e QA

- Backend: **502 passed + 30 subtests passed**, incluindo os 464 anteriores. Regressões de RADIUS sequencial, aliases, schemas, roles LACP, acc-*, óptica, timeouts SSH/NETCONF, limite de bytes/linhas, taxonomia, request ID, logs sem secrets, lock wait, estado recuperado e API segura.
- Frontend: **50 passed**, incluindo error metadata, schema e números exatos, estado degradado/recuperado, porta customizada, tabs canônicas, ausência de inventário em LACP/óptica, retry/cancel e toda a regressão Huawei/ZTE anterior.
- sync_frontend, sync_frontend --check, collectstatic --no-tailwind, compileall e git diff --check passaram.
- Vela QA: driver baseado no QA Pajamas existente, **21 rotas × 1366×768, 1600×900, 1920×1080**, com Vela/Bottle/Qt WebEngine reais. Fixtures físicas sanitizadas passam pelo provider/parser reais; somente os transportes remotos Junos/ZTE e probe de host key são sintéticos.
- QA inclui counters, RADIUS, interfaces, consulta direta LACP/óptica, roteamento, PPPoE/Lockout, logs, timeout/degradação, parser sem retry infinito, loading/cancel, CPE handoff/retorno, modais/drawers, shell e overflow. Capturas revisadas em `docs/screenshots/juniper-p0-runtime/`; qa.json registra resultados e proveniência.
- **AUTOMATED_FIXTURE_VALIDATED:** sim. **VELA_VALIDATED:** sim (Linux Qt/offscreen).
- **Windows: NOT TESTED. WINDOWS_VALIDATED: não.**
- **Physical MX204 — novo código: NOT TESTED. PHYSICALLY_EXECUTED: não.** As observações manuais do equipamento são fornecidas pelo usuário; não houve nova autenticação do agente.

## Arquivos alterados

Juniper parsers/requests/transport/output/errors e novo observability.py; provider Juniper; DeviceQueryBus.infrastructure, metadata de SessionManager e error_policy; common API error envelope e rota operations; frontend api.js/store.js/app.js/juniper.js, juniper.css e runtime gerado; testes Python/frontend, fixtures/proveniência e driver/harness/screenshots Vela. Documentos de execução, recuperação e evidência atualizados. Nenhum provider Huawei/ZTE reescrito.

## Limitações restantes

Executar o patch no MX204 e no Windows continua necessário. Conferir no alvo o filtro de inventário por wildcard/media e todos os campos omitidos dos trechos enviados. Bulk-CoA opcional não foi inventado. Logs da aplicação são efêmeros e limitados à sessão; syslog do BNG continua fora de escopo. Cancelar espera não cancela um comando remoto iniciado. Não há retry automático, writes, CGNAT mapping ou inferência de CPE offline por falha isolada. A migração integral não foi declarada concluída.

Perfis SHA256 preservado: `0c04d0a57d4ba19f9fcbdd91534f11252cc4ce1a8a76a29db9ffcab3b820e3de`.

## Teste no alvo

Selecionar feat/juniper-bng, ativar o venv, instalar requirements se necessário, executar sync_frontend, collectstatic --no-tailwind e manage.py runapp. Conectar ao endpoint autorizado com a porta SSH configurada, preservando verificação da chave. Confirmar RADIUS/profiles, os três schemas AAA, accounting do assinante, aeN em LACP e uma porta física em Óptica. Em Logs, comparar referência/duração/formato/erro com o console. Conferir topbar host:porta, abas dedicadas e CPE independente. Se o inventário filtrado for rejeitado, usar leitura específica e anexar somente XML sanitizado/código de erro; não liberar dump global ou host-key bypass.
