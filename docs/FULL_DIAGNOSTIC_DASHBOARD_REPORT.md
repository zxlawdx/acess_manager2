# Access Manager — Diagnóstico completo

## Entrega

Evolução da aba existente, preservando Diagnóstico simples e o shell Vela. Base main `b36c8fc838762386a2e7b54513036ae27533606b`, com PR #8 integrado; branch `feat/full-diagnostic-dashboard`. Nenhum inventário geral ou provider foi reiniciado.

A tela segue a hierarquia do prompt fornecido: header com equipamento real, cinco métricas, saúde/conectividade lado a lado, traceroute visual, Wi-Fi expansível, recursos/alertas, histórico e evidências opcionais. Fonts DM Sans/Space Mono e renderer SVG locais; nenhuma biblioteca/CDN nova. Apenas o Markdown foi anexado nesta rodada; não foi disponibilizado o HTML/Canva para comparação lado a lado. Tokens e composição explicitados nele foram usados como referência forte.

## Arquivos e componentes

- `application/services/full_diagnostic.py`: agregador e DTO normalizado, testes isolados, regras puras de RSSI/alertas, export.
- `composition.py` e `presentation/api/device.py`: instanciação e rotas config/run/history/export.
- `infrastructure/history.py`: consulta da tabela existente diagnostic_run, sem schema paralelo.
- `static/js/workspaces/views/complete-diagnostics.js`: painel, retestes incrementais, histórico/filtros, chart SVG e download.
- `static/css/app.css`: estilos limitados ao painel dentro do shell global.
- `static/js/services/api.js` e runtime gerado: escopo/abort e preservação de cache para consultas do diagnóstico.
- Testes Python/HTTP/DOM e fixtures/capturas de QA atualizados.

## Execução e origem

Um único serviço reutiliza DeviceQueryBus/DeviceCommandBus. As consultas ONT mantêm operation_lock: menus e tokens do firmware são stateful; executar esses reads em threads independentes corromperia o contexto. HTTPS do computador corre em paralelo às operações da ONT, com timeout, stream=True e sem redirects/baixe de corpo. Uma falha é isolada; erros de capability permanecem UNKNOWN, falhas de transporte mensuráveis aparecem como falha do teste específico. Lock próprio impede duas execuções concorrentes e o ID da sessão de entrada impede executar numa ONT recém-trocada.

| Teste | Origem e contrato |
|---|---|
| Ping | ONT Huawei/ZTE, via writer diagnóstico já integrado; sent/received/loss/min/avg/max normalizados |
| DNS | Lookup nativo quando o provider/capability o permite, distinto dos DNS configurados; Huawei sem fluxo integrado permanece indisponível |
| HTTP/HTTPS | Computador do técnico, endpoint HTTPS centralizado; tempo de resposta HTTP, não RTT da ONT |
| Gateway | Ping da ONT para gateway observado na WAN; sem gateway não há endereço inventado |
| Internet | Ping da ONT para alvo configurável; mede alcance desse alvo, não disponibilidade global |
| Traceroute | ONT; hops e timeout preservados; perda por hop não inferida de asteriscos |
| PC comparativo / velocidade | Ferramentas existentes mantidas em expansão; TCP do PC e speedtest não são confundidos com tráfego atual |

## Dados, gráfico e persistência

Valores importantes violetas; CPU/memória usam barras apenas com percentuais reais; uptime é textual. Tráfego usa uma fonte WAN identificada, sem somar WAN/LAN/WLAN. RSSI médio usa apenas associações com dados e regras >=−50 Excelente, >=−60 Muito bom, >=−67 Bom, >=−75 Regular, abaixo Fraco. Alarmes: perda >2% e RSSI médio <−75 dBm, além de falha específica de conectividade; ausência de dados não gera estado saudável.

Execuções completas e retestes são persistidos automaticamente em diagnostic_run. Histórico filtra por período/resultado e por host/vendor; serial conhecido separa equipamentos no mesmo endereço. Sem serial, o agrupamento por endereço é limitado e não prova identidade física. Query limita últimos 7 dias/1000 execuções. O SVG usa exclusivamente amostras de latência/perda completas ou retestes Ping, timestamps reais e pontos medidos; liga pontos sem inventar amostras intermediárias. Períodos sem cobertura ficam desabilitados. Não há série de referência fictícia nem cálculo de disponibilidade contínua com testes pontuais.

Reteste atualiza a linha escolhida e, para Ping, métricas/alertas necessários; preserva demais painéis e página. Resultados misturados de retestes não são exportados como se fossem uma única coleta: selecione uma execução persistida no histórico para exportar. JSON e CSV retornam apenas whitelist normalizada, sem raw nativo, senha, cookie, token, cabeçalhos ou session ID. CSV neutraliza fórmulas. Export revalida associação ao equipamento atual.

## Métricas indisponíveis

Disponibilidade contínua não é calculada em nenhum provider. Latência de DNS não é inferida do tempo de API. Tráfego aguarda duas amostras válidas; CPU/memória/armazenamento/temperatura aparecem indisponíveis quando não retornados. RSSI/SNR/interferência/Mesh dependem dos campos observados. Huawei sem DNS lookup integrado não recebe falso sucesso. Contadores de sessões só aparecem quando query NAT retorna dado comprovado (ZTE handler conntrack); firmware lido não vira “atualizado”. Não foram inventados writers adicionais por causa do painel.

## Validação

- `python -m pytest -q`: **295 passed, 30 subtests passed**.
- `npm test`: **28 passed**.
- Chromium nas três resoluções: navegação/overflow e polling mantendo DOM/cards/SVG/scroll passaram.
- Vela real `sync_frontend` → `collectstatic --no-tailwind` → `manage.py runapp` com pywebview/Qt offscreen em **1366×768, 1600×900, 1920×1080**: shell, resize/maximize, modal, navegação tardia e painel passaram.
- Fixtures de equipamento sintéticas apenas nos testes. Sem novo teste físico nem Windows/WebView2. Aviso externo Tailwind do framework preexistente; sem erros JS do Access Manager.
- Capturas de topo/gráfico/traceroute/recursos-alertas/histórico em `docs/screenshots/vela/diagnostic-dashboard-*-{1366,1600,1920}.png`.
