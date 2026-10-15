# Triagem técnica e relatório de atendimento — Access Manager

## Base e escopo

Implementado em `feat/support-triage-report`, a partir da `main` remota `3b39db41af7f7bddee27886093e24c2576b489c0`, que já contém o PR #12 Juniper. Nenhum reset, reclone ou reimplementação dos providers. `data/profiles.json` permanece com SHA256 `0c04d0a57d4ba19f9fcbdd91534f11252cc4ce1a8a76a29db9ffcab3b820e3de`.

A navegação ATENDIMENTO / Triagem / Relatório compartilha o shell existente de CPE e Juniper. Não altera writers, opções de rádio, transporte Junos, coordenação de sessões ou polling de tráfego. A coleta usa os leitores normalizados e capabilities existentes; não há mocks em produção.

## Arquitetura

- `domain/triage.py`: thresholds, normalização de velocidade, identidade por MAC/ID, findings e comparação; `SupportSession` é um mapping JSON com `repr` e `str` seguros.
- `application/services/support_report.py`: `TriageService` coleta por capability; `SupportReportService` inicia, atualiza, finaliza, mantém snapshots, notas e eventos, revela credenciais sob demanda e exporta.
- `infrastructure/support_reports.py`: tabela dedicada `support_report`, índice por app session, no mesmo SQLite de `HistoryRepository`. A listagem extrai somente metadados via SQLite.
- `domain/support_export.py`: apresentação TXT/HTML por seções; JSON conserva estrutura.
- `presentation/api/support.py`: rotas `/support/current`, `/history`, `/start`, `/triage`, `/detail`, `/note`, `/finish`, `/credentials`, `/export` no namespace API Vela existente.
- `static/js/workspaces/views/support.js`: tabelas, resumo, achados, timeline, observações, resultado, histórico e Mostrar/Copiar por senha; usa componentes globais e escopo de navegação existentes.

Não há nova aplicação, sistema de autenticação ou design system. O acesso segue a API local Vela existente.

## Sessão, eventos e snapshots

O atendimento persiste ID, app session ID, device/IP/vendor/model/firmware, atendente, início/atualização/fim, status, snapshots inicial/atual/final, eventos, achados, notas e resultado. Há no máximo um atendimento ativo por sessão de equipamento. Uma nova conexão não herda o atendimento anterior. Relatórios antigos continuam acessíveis pelo histórico.

`start` executa triagem e salva cópias independentes do snapshot inicial e atual. Atualizações não modificam o inicial. Finalização exige resultado escolhido: `resolved`, `partially_resolved`, `visit_referral`, `no_fault`, `followup`. Faz nova coleta, salva snapshot final e comparação estruturada. Leituras individuais que falham ficam explicitamente parciais; não se copia uma leitura antiga como se fosse uma medição nova. Não há resolução automática ou criação de OS.

O mecanismo central é conectado aos `DeviceCommandBus` / `DeviceQueryBus`. Diagnósticos executados no command bus e alterações entram no relatório; uma leitura anterior e read-back são coletados quando há reader mapeado. O writer continua sendo executado uma única vez. A falha de escrita gera resultado não confirmado, sem declarar que o novo estado foi aplicado. O resultado genérico só é marcado verificado quando o writer retornou verificação explícita; a senha tem confirmação independente por igualdade exata.

Consultas relevantes atualizam o snapshot atual quando a medição muda. A coleta completa suspende eventos individuais para gerar um único evento de triagem. Polling de tráfego, histórico de tráfego e revelação de senha não geram eventos. `FullDiagnosticService` e coleta de diagnóstico também emitem eventos. Consultas Juniper do bus de infraestrutura alimentam apenas o relatório da sessão BNG selecionada; o histórico técnico de operações continua separado.

Eventos carregam timestamp, tipo, feature, resumo, status e, quando aplicável, antes/solicitado/depois, resultado e verificação. O evento genérico referencia a alteração Wi-Fi por `wifi_change_ids`, sem repetir as senhas. Observações manuais têm `source=attendant`; não são medições. A UI consulta o relatório ativo a cada cinco segundos, altera o conteúdo apenas quando `updated_at` muda e adia atualização durante edição de observação ou exibição de uma senha. Não há polling remoto da ONT por esse timer.

## Findings e thresholds

Cada achado tem `code`, `severity`, `category`, `subject`, `title`, `detail`, `evidence`. Severidades: info/warning/critical/ok. A saúde é normal/attention/problems/partial. UNKNOWN ou medição ausente não viram zero ou critical.

Configuração central: `DEFAULT_THRESHOLDS` em `domain/triage.py`; overrides por `TriageService(..., thresholds=...)` / `SupportReportService(..., thresholds=...)`. Nenhum threshold genérico óptico, SNR, CPU, memória, temperatura ou velocidade LAN esperada é habilitado sem configuração/evidência.

| Medição | Regra |
| --- | --- |
| RSSI | ≥ −55 excelente; −56 a −67 bom; −68 a −74 atenção; −75 a −79 fraco; ≤ −80 crítico |
| RSSI baixo | `WIFI_RSSI_WARNING` ou `WIFI_RSSI_CRITICAL` |
| SNR | `WIFI_LOW_SNR` somente com `snr_warning` configurado |
| RX óptico | Thresholds do device > modelo fornecido ao avaliador > override genérico configurado > unknown |
| LOS/LOF | Apenas flag afirmativa real produz `OPTICAL_LOS` / `OPTICAL_LOF` |
| CPU/memória/temperatura | `DEVICE_HIGH_CPU/MEMORY/TEMPERATURE` somente com limite configurado |
| Ethernet | `ETHERNET_NEGOTIATION_LOW` somente com link ativo e velocidade esperada comprovada/configurada |
| Duplex | `ETHERNET_HALF_DUPLEX` somente com link ativo e Half informado |

Velocidades 10M, 100M, 1000M, 1G, 2.5G, 5G, 10G são normalizadas em bps/display, preservando o bruto; números sem unidade dos leitores LAN existentes são Mbps. `speed_bps` explícito conserva unidade. Uma porta down não é um defeito por padrão. Uma negociação de 100 Mbps não prova defeito de cabo nem que o hardware seja gigabit.

Clientes com mesmo hostname continuam distintos por MAC/ID. Comparação inicial/final também usa MAC/ID; clientes sem ambos não são arbitrariamente associados. Não se infere causalidade entre configuração e nova medição. DNS público/privado não gera alerta de qualidade.

Potência, temperatura, tensão, bias, estado PON/registro e alarmes ópticos aparecem somente se retornados pelo provider. Equipamentos sem PON mostram Não aplicável / UNSUPPORTED. Em Juniper a triagem é BNG: facts, interfaces e contexto do assinante, enriquecidos por consultas PPPoE/AAA/RADIUS/rotas/shaping/lockout/policer realizadas nas telas existentes. Não se apresenta potência óptica de ONT por associação ao BNG. O handoff para Huawei/ZTE tem atendimento independente.

## Histórico de senha Wi-Fi

A exceção explícita desta tarefa é implementada somente no evento `wifi_password_change`. Antes de `set_ssid_config`, lê-se a configuração e tenta-se o reader de revelação já existente somente com status SUPPORTED/PARTIAL comprovado para o runtime. ID do SSID é a chave; SSID e banda são metadados do mesmo registro. Nome de rede não associa credenciais entre bandas.

| Provider/runtime | Capability `wifi_password_read` | Senha anterior |
| --- | --- | --- |
| ZTE Lua nativo F670L/F6600P/F6201B | PARTIAL | Reader explícito legado; só salva valor legível realmente retornado |
| ZTE perfis descobertos, H3601P e família desconhecida | UNKNOWN | Não tenta revelar nem inventa valor |
| Huawei runtime EG8041 compatível | PARTIAL | Reader WLAN/PreSharedKey específico já implementado; só salva valor real |
| Huawei captured/X6/outros sem runtime comprovado | UNKNOWN | Indisponível; não promove por vendor/modelo apenas |
| Juniper | Não aplicável | Não existe writer Wi-Fi no BNG |

Esses estados não constituem nova validação física. Mesmo em PARTIAL, o dispositivo pode não devolver a senha. `old_password_status` do evento distingue SUPPORTED (valor retornado), UNAVAILABLE e MASKED_BY_DEVICE. `********`, bullets ou máscaras equivalentes não são senhas anteriores válidas.

A nova senha vem do pedido efetivamente enviado ao writer. Em retorno bem-sucedido, permanece no evento e nas exportações mesmo que o firmware masque o read-back. `verified=true` exige valor em texto, não mascarado, igual ao solicitado. Caso contrário: Não verificável pelo firmware. Em falha/resultado incerto, registra-se a falha sem apresentar a nova senha como aplicada.

Há um evento específico por alteração/SSID. Campos: ID/timestamp/type/feature/ssid_id/ssid/band/old_password/new_password/old_password_status/status/verified/verification_note. O evento genérico inclui só referências; snapshots e resultados genéricos passam por sanitização. Não há senha em lista de histórico, toast, URL, nome de arquivo ou cache genérico.

## Segurança e exportação

`HistoryRepository` genérico continua usando sua redação original. A tabela dedicada aplica sanitização recursiva e permite exclusivamente old/new Wi-Fi e o status no evento específico criado pelo serviço. Senha admin/AD/Juniper/sistema, cookies, Authorization, tokens, CSRF, chaves, dados internos, saídas brutas e headers não entram no relatório. Valores Wi-Fi não são escritos em logging/DEBUG/telemetria. Falhas de alteração de senha recebem mensagem pública fixa, sem propagar o texto de erro potencialmente sensível do writer. `SupportSession` não revela conteúdo em repr/str.

A tela de detalhe recebe presença/status, não o valor das senhas. Mostrar e Copiar consultam `/support/credentials` via POST com IDs no body. Cada botão copia somente o seu valor; feedback: Senha copiada. Ocultar e sair da tela removem a exibição. Não há localStorage para senhas. O relatório específico persiste credenciais completas por requisito; não há criptografia de banco adicionada nesta rodada.

TXT/HTML têm seções de identificação, estado inicial, problemas, diagnósticos/alterações, credenciais Wi-Fi, estado final, comparação, observações e conclusão/pendências. JSON mantém o modelo. Os três contêm as senhas Wi-Fi completas quando disponíveis. HTML escapa todos os conteúdos e usa documento próprio; não executa SSIDs, observações ou senhas como markup. O filename contém somente prefixo fixo e ID gerado. PDF não foi implementado: a base não tinha exportador PDF limpo para esse relatório. O HTML pode ser aberto para impressão externa.

## Validação automatizada e visual

- **539 testes Python + 30 subtestes**, incluindo 37 casos novos de triagem, lifecycle, credenciais, logs, exports, isolamento e BNG.
- **53 testes frontend**, incluindo triagem, navegação BNG, revelar/copiar/ocultar e ausência de credencial no histórico/toast.
- `sync_frontend.py`, `--check`, `collectstatic --no-tailwind`, `git diff --check`.
- QA pelo fluxo real `manage.py runapp`, API Bottle e Qt WebEngine Chromium, com dados isolados e somente roteador remoto sintético; sem fetch interception.
- **1366×768, 1600×900, 1920×1080**: iniciar atendimento, fibra/Wi-Fi/LAN, alterar senha pela tela Wi-Fi existente, relatório mascarado, revelação individual, finalizar com resultado manual e exportar TXT/JSON/HTML. Snapshot inicial imutável; topbar/side alinhadas; sem overflow horizontal no shell/workspace; modal centralizado na WebView. Nenhum erro JS do app. Capturas/asserções: `docs/screenshots/support-report/`; harness: `tests/visual/support_driver.py`, `support-native.cjs`.

Os testes de logs comprovam que OLD/NEW Wi-Fi aparecem no relatório e não em caplog; admin/CSRF não aparecem no relatório nem nos logs. Testes adicionais cobrem fonte de threshold óptico, RX normal/atenção/crítico/unsupported, RSSI, SNR configurado, recursos, LAN full/half/down, múltiplos SSIDs, writer único, read-back mascarado/falha, repr seguro e HTML escapado.

## Limites e pendências honestas

Não houve autenticação/teste físico novo em Huawei/ZTE/MX204 nem execução Windows/WebView2. As pendências anteriores da migração continuam na matriz; não se promoveu exclusão DNS, writes de firmware não comprovados ou relações Mesh sem evidência. Thresholds específicos de modelos não foram inventados. A sugestão de visita atual cobre alarmes ópticos críticos; detecção de negociação persistentemente anormal e queda física WAN precisa de contexto/provas adicionais, portanto não há recomendação automática nesses casos. O BNG não executa uma varredura de todos os assinantes/AAA ao iniciar atendimento: conserva o contexto selecionado e registra as consultas explícitas existentes.

A conclusão normalmente exige a sessão do equipamento ainda conectada; falhas individuais de leitura geram snapshot parcial. Encerramento de atendimento antigo após desconexão, política de retenção de relatórios e criptografia em repouso não foram adicionados. O relatório não transforma medições incompletas em conclusões definitivas.

## Commits e arquivos desta entrega

Commit de implementação: `f99e6d7a7d2e7d7d212d3c49d15fc9a5e886ae42`. Commit de testes/capturas: `bc26f31b2cc1516308f2c96fd66e7f6b883bf736`. O HEAD da branch contém esta documentação. A main permanece no commit inicial informado acima.

Arquivos de código criados/alterados:

- `apps/access_manager/api.py`
- `apps/access_manager/application/commands/device.py`
- `apps/access_manager/application/queries/device.py`
- `apps/access_manager/application/services/full_diagnostic.py`
- `apps/access_manager/application/services/support_report.py`
- `apps/access_manager/composition.py`
- `apps/access_manager/domain/support_export.py`
- `apps/access_manager/domain/triage.py`
- `apps/access_manager/infrastructure/providers/huawei.py`
- `apps/access_manager/infrastructure/providers/zte.py`
- `apps/access_manager/infrastructure/support_reports.py`
- `apps/access_manager/presentation/api/support.py`
- `apps/access_manager/static/css/app.css`
- `apps/access_manager/static/js/runtime.js`
- `apps/access_manager/static/js/services/api.js`
- `apps/access_manager/static/js/workspaces/app.js`
- `apps/access_manager/static/js/workspaces/views/support.js`
- `apps/access_manager/templates/index.html`

Testes criados/alterados: `tests/test_support_report.py`, `tests/frontend/runtime.test.cjs`, `tests/visual/support_driver.py`, `tests/visual/support-native.cjs`. Capturas e JSON de QA: `docs/screenshots/support-report/`. Documentação: este arquivo, `NETPULSE_EXECUTION_REPORT.md`, `NETPULSE_MIGRATION_MATRIX.md`, `RECOVERY_CHECKPOINT.md`.
