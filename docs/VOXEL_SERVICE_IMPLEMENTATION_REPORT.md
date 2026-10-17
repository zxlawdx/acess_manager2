# Voxel World e atendimento vivo — relatório de implementação

Data: 17/10/2026. Branch de publicação: `feat/voxel-service-log`. Implementação publicada em PR, sem merge deste patch em `main`.

## Resultado

- Aero: controles nativos com `color-scheme: light`, opções claras, Mostrar glossy, foco consistente e quatro cards de login. O atendimento usa os mesmos tokens/seletores centrais dos demais diálogos. O cabeçalho reserva espaço para todas as ações em desktops menores.
- Atendimento atual: modelo em memória iniciado na conexão, transições Juniper/CPE preservadas, linha do tempo e resumo operacional, observações editáveis, cópia simples/Markdown e exportação TXT. Acesso pela topbar e pelos dois mundos. Desconexão completa/unload descartam o conteúdo.
- Observação automática: leituras de identificação, clientes, WAN e óptica; diagnósticos, alterações, gerenciamento, ações Juniper/CPE, captura/aplicação de perfis. Respostas repetidas de leitura são agrupadas por janela de 30 s. Tráfego, histórico, previews e polling não geram ruído. Raw output e credenciais são removidos do registro genérico.
- Diagnóstico por cliente: detalhes reais, atualização da tabela quando habilitada, ping ao IP observado somente com capability de diagnóstico, rádio/canal correspondente quando disponível. Associação, métricas RF e ping permanecem evidências separadas. Falta de resposta não vira afirmação de falta de internet. Há ações para adicionar ao atendimento e abrir a região Clientes no mundo.
- Auditoria de senha: ao editar SSID, consulta o endpoint de revelação existente e captura o valor anterior quando disponível. Registra nome/ID do SSID, valores anterior/novo, sessão, tela de origem e resultado. Uma resposta tardia ainda registra o resultado da operação na tela original, sem sobrescrever o workspace atual. Falha não é apresentada como alteração confirmada. Senhas ficam mascaradas; exibição/cópia/exportação completa exigem marcar a opção local. Não há persistência automática desses segredos.
- Voxel World: quarto card de login e seletor pós-login. Bundle Three.js separado, carregado sob demanda. Terreno procedural em chunks 12×12 com InstancedMesh, streaming incremental e descarte de chunks, colisão básica, técnico próprio em blocos, terceira/primeira pessoa, minimapa, scanner, raycast próximo e presets de qualidade. Router e Juniper usam o mesmo registro de rotas/capabilities do Mundo 3D Aero. Nenhuma rota NAT/Mesh ou localização física de cliente foi inventada.

## Controles

WASD para mover; Shift para correr; Espaço para pular; arrastar para olhar; E para interagir por proximidade; F para scanner; V para câmera; duplo clique em estrutura próxima para raycast; Esc para fechar scanner/painel ou voltar à interface. O scanner abre as telas reais registradas.

## Validação

| Verificação | Resultado |
| --- | --- |
| Build `python tools/sync_frontend.py` e `--check` | concluídos; bundles sincronizados |
| Frontend `npm test` | 84 testes; inclui auditoria tardia/falha, máscara, redaction, fallback e chunks |
| Backend `python -m pytest -q` | 535 testes e 30 subtestes aprovados |
| `python manage.py collectstatic --no-tailwind` | zero erros |
| `git diff --check` | sem erros |
| Regressão `tests/visual/aero.cjs` | 138 checks, três resoluções |
| `tests/visual/voxel-service.cjs` | 21 checks, três resoluções, sem erros JavaScript |

Resoluções: 1366×768, 1600×900 e 1920×1080. Testes visuais usam Chromium/SwiftShader e fixtures sintéticas Huawei/Juniper. As capturas novas foram inspecionadas, incluindo correções após encontrar herança Terminal no atendimento e sobreposição do cabeçalho/HUD. Os checks incluem entrada pelo Voxel sem carregar o bundle Aero, movimento, scanner, painel real, retorno, troca de qualidade, layout Juniper sem Wi-Fi residencial, diagnóstico e captura de senha mascarada/completa por escolha explícita. `docs/qa/voxel-service/checks.json` registra os cenários.

## Evidências

As imagens são WebP sem perdas, derivadas de capturas do navegador. Senhas de teste nunca são mostradas nas capturas do registro.

| Tela | 1366×768 | 1600×900 | 1920×1080 |
| --- | --- | --- | --- |
| Login com quatro experiências | [1366](qa/voxel-service/login-voxel-1366.webp) | [1600](qa/voxel-service/login-voxel-1600.webp) | [1920](qa/voxel-service/login-voxel-1920.webp) |
| Voxel Router | [1366](qa/voxel-service/voxel-router-1366.webp) | [1600](qa/voxel-service/voxel-router-1600.webp) | [1920](qa/voxel-service/voxel-router-1920.webp) |
| Scanner | [1366](qa/voxel-service/voxel-scanner-1366.webp) | [1600](qa/voxel-service/voxel-scanner-1600.webp) | [1920](qa/voxel-service/voxel-scanner-1920.webp) |
| Diagnóstico do cliente | [1366](qa/voxel-service/client-diagnostic-1366.webp) | [1600](qa/voxel-service/client-diagnostic-1600.webp) | [1920](qa/voxel-service/client-diagnostic-1920.webp) |
| Atendimento com senhas mascaradas | [1366](qa/voxel-service/service-masked-1366.webp) | [1600](qa/voxel-service/service-masked-1600.webp) | [1920](qa/voxel-service/service-masked-1920.webp) |
| Voxel Juniper | [1366](qa/voxel-service/voxel-juniper-1366.webp) | [1600](qa/voxel-service/voxel-juniper-1600.webp) | [1920](qa/voxel-service/voxel-juniper-1920.webp) |
| Atendimento Juniper | [1366](qa/voxel-service/service-juniper-1366.webp) | [1600](qa/voxel-service/service-juniper-1600.webp) | [1920](qa/voxel-service/service-juniper-1920.webp) |

## Limitações e próximos passos

1. Não houve acesso a equipamentos físicos nem validação do WebView nativo Windows nesta rodada. Escritas, ping, reveal-password e handoff dependem das capabilities e respostas reais do firmware. As capturas são dados sintéticos, não comprovação de hardware.
2. O mundo é uma navegação procedural inicial: colisão por footprints de estruturas/terreno/limites, sem destruição, crafting, física completa ou câmera com colisão de cenário. Prédios técnicos usam geometrias simples. Água é um plano translúcido nos presets médio/alto, sem reflexos físicos. Não houve benchmark de GPU real; FPS de SwiftShader não representa o alvo de produção.
3. Dados que o firmware não expõe (senha antiga, RSSI/SNR, uptime, rádio, ARP/lease) não são fabricados. O fallback usa a tabela real de clientes; não adiciona endpoints ARP/lease. Somente formulários com valor anterior conhecido têm antes/depois explícito; outras ações registram parâmetros e resultados retornados.
4. O atendimento é temporário. Para preservá-lo, copie/exporte antes de encerrar a conexão. Exportação completa pode conter senhas por escolha explícita do técnico. A identidade do técnico aparece como não informada se a sessão não a fornece.
5. O mapa indica acesso às funções; “Localizar no mundo” leva à região Clientes, sem afirmar posição física do dispositivo. O scanner lista regiões, não executa uma varredura de rede em segundo plano.
6. Não foram importados assets externos. Todos os blocos, personagens e previews são procedurais próprios. Referências consultadas e política de licença estão em `THIRD_PARTY_ASSETS.md`.

## Arquivos

- `.gitignore`
- `apps/access_manager/static/css/aero.css`
- `apps/access_manager/static/css/login-experiences.css`
- `apps/access_manager/static/css/world.css`
- `apps/access_manager/static/js/mesh-port-forwarding.js`
- `apps/access_manager/static/js/operational-parity.js`
- `apps/access_manager/static/js/runtime.js`
- `apps/access_manager/static/js/service/client-diagnostic.js`
- `apps/access_manager/static/js/service/model.js`
- `apps/access_manager/static/js/service/panel.js`
- `apps/access_manager/static/js/services/api.js`
- `apps/access_manager/static/js/shared/forms.js`
- `apps/access_manager/static/js/ui/login.js`
- `apps/access_manager/static/js/voxel-runtime.js`
- `apps/access_manager/static/js/voxel/renderer.js`
- `apps/access_manager/static/js/voxel/terrain.js`
- `apps/access_manager/static/js/workspaces/app.js`
- `apps/access_manager/static/js/workspaces/views/clients.js`
- `apps/access_manager/static/js/world/bridge.js`
- `apps/access_manager/templates/index.html`
- `docs/FRUTIGER_WORLD.md`
- `docs/THIRD_PARTY_ASSETS.md`
- `docs/VOXEL_SERVICE_IMPLEMENTATION_REPORT.md`
- `tests/frontend/service-voxel.test.cjs`
- `tests/visual/voxel-service.cjs`
- `tools/sync_frontend.py`

Evidências adicionais: 21 imagens em `docs/qa/voxel-service/*.webp` e o respectivo `checks.json`. Backend, protocolos, writers, parsing e contratos de endpoints não foram alterados.
