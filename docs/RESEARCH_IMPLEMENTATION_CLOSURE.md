# Access Manager — fechamento de implementação do relatório

Branch `feat/research-implementation-closure`, base `236518f2e017a14b6042458667c7d4a53638a1b2` (PR #7 integrado). Retomada do working tree preservado. Origem funcional: `zxlawdx/acess_manager` em `1623bce8717b9b92683cd3904f9c2bd378da400c`. Este documento distingue implementação disponível de paridade integral; não declara validação física.

## Estado por conjunto solicitado

| Conjunto | Entrega nesta branch | Limite ou pendência concreta |
|---|---|---|
| 1. F6201B14 | 14 full forms e 7 estratégias ligados ao provider/API/UI de Gerenciamento, preview e readback | Formulário incompleto impede escrita; nenhuma ação Add/Delete deduzida de Apply |
| 2. WAN Huawei CRUD | Update do grafo PPP/address/prefix capturado | Add/Delete e outras instâncias não têm payload/domínio comprovado; não usar `.1` para qualquer WAN |
| 3. SNTP | ZTE gateway; Huawei sincronização/DST por objetos exatos | Campos não retornados pela captura Huawei não são fabricados |
| 4. IPv4 filter Huawei | Reader/CRUD legado conectado ao dispatcher | Enable/ação fora do contrato mutável não são inventados |
| 5. Wi-Fi avançado Huawei | Campos suportados pelo writer capturado de rádio e SSID | OFDMA/TWT/MU-MIMO sem writer capturado continuam indisponíveis |
| 6. Wi-Fi avançado ZTE | Rádio legado, RF F6201B completo, WPS Disabled/PBC, agenda, steering e parâmetros separados | Opções só do firmware; PIN não ganhou writer |
| 7. Speedtest | ZTE start único, polling GET, deadline, estado final e taxas; Huawei seção mapeada | Latência ausente permanece null; estado nativo não é tratado como sucesso universal |
| 8. Backup | Export legado ZTE e repositório local com SHA/metadados/download | Huawei: página mapeada não comprova fluxo binário completo |
| 9. Restore | Upload legado ZTE com compatibilidade e confirmação forte | Huawei: falta contrato de upload/validação do arquivo |
| 10. Firmware | Upload legado ZTE, status conhecido e resultado incerto quando necessário | Huawei: falta fluxo binário comprovado |
| 11. Factory reset | ZTE handler Reset reconhecido por template/token, nonce por host/TTL e RESETAR | Outras famílias sem template reconhecido são recusadas; Huawei sem writer específico |
| 12. Reboot Huawei | HG8245H rand_count/API ses-token portados, POST único | Outras famílias precisam de payload/token próprios |
| 13. Mesh ZTE | Reader legado normalizado | Configurações de roaming não comprovam relações pai/backhaul/nós |
| 14. Mesh Huawei | Página easymesh reconhecida e nós com identificadores explícitos | Sem relação reconhecida, não desenhar ligação inferida |
| 15. NAT sessions | Contadores ConntrackMax/ConntrackUsed por handler comprovado | Handler não fornece lista individual IP/porta/protocolo |
| 16. NAT loopback / ALG | ALG oito flags do handler, sujeito ao objeto real | Loopback básico capturado não comprova NAT hairpin; writer específico pendente |
| 17. FEC/BER/alarmes | Contrato aceita valores explícitos reconhecidos | Capturas atuais não têm contadores FEC/BER; null, não zero |
| 18. Óptica completa | RX/TX/temperatura/bias/estado disponíveis normalizados | Tensão genérica não convertida universalmente para V; escala depende do firmware |
| 19. Port forwarding | CRUD ZTE via gateway funcional e readback | Huawei sem payload comprovado equivalente |
| 20. Firewall | ZTE regras IP/MAC/políticas; Huawei IPv4 e nível existente | Não equiparar nível global com writer arbitrário de regras |
| 21. QoS | ZTE queue/shaper/policer; Huawei DSCP→P-bit capturado | Outras políticas Huawei sem writer específico |
| 22. TR-069 | Adapter ZTE completo com credenciais mascaradas; F6201B full form; Huawei existente | Segredo alterado exige verificar autenticação, não comparar máscara |
| 23. Remote management | Regras ZTE IPv4/IPv6, Telnet LAN/WAN, portas administrativas em vetor completo | Modelo SSH conhecido sem transporte HTTP comprovado não ganha endpoint inventado |
| 24. Accounts/admin password | Leitura nativa sem senhas e troca da conta autenticada | Não se declara CRUD de contas inexistente nem readback de senha |
| 25. Support/workstation | Coleta completa progressiva, diagnóstico PC explícito, snapshot normalizado e perfis/preview existentes | Remediação automática integral não implementada; não aplicar limiares ópticos universais |
| 26. Histórico entre sessões | Binding UUID→host/serial e agregação SQLite por período/dispositivo | Identidade só quando observada; seleção por host não prova serial físico |
| 27. Ranking clientes | Conserva contadores individuais quando retornados | Tabela completa de metadados/direções ainda precisa de join comprovado; não distribuir tráfego do rádio por cliente |
| 28. Huawei mapped surfaces | Dispatcher usa operação conhecida, página/token e domínio exato | Endpoint/página mapeada sem campos completos não habilita payload inventado |
| 29. Runtime discovery | Serviços multimodel/diagnóstico portados, modelo autenticado sem override do operador | Discovery de leitura não promove writers desconhecidos |
| 30. Artefatos de gerenciamento | IDs opacos, SHA revalidado, origem de metadados, backup/import/download/apply | Declaração do operador não comprova cabeçalho/compatibilidade binária |

## Fluxo comum

Provider → query/command bus com lock → API Vela → UI operacional. Configurações conhecidas exigem leitura da forma atual, preview com diff mascarado, nonce vinculado ao host e TTL, confirmação APLICAR, uma mutation e readback específico. Reset exige RESETAR e não promete readback durante queda de sessão. POST não segue redirects para evitar replay 307/308. Upload de permissão e upload binário são fases distintas, não dois envios da configuração.

Perfis mantêm parâmetros globais de rádio, múltiplos DNS, hosts DNS e DHCP suportado. SSIDs individuais não retornaram ao editor. Shell global, navegação com cancelamento/generation e polling incremental anteriores preservados.

## Evidência adicional dirigida

Firmware ThinkLua de `Blinko1987/F6107A-telnet-root-on-AIS-fiber`, commit `7d328a8a2a00da2f09d2a76ba6696def3fc79992`: handlers `db_resetmgr_lua.lua`, `firewall_conntrack_lua.lua`, `firewall_alg_lua.lua`, `firewall_ipv4service_lua.lua`, `firewall_ipv6service_lua.lua`, `firewall_portservice_lua.lua`, `telnet_lua.lua`, templates/JS e `dmenu.lua`. A forma deve ser reconhecida na sessão; não se assume compatibilidade só pelo nome do modelo. O handler de portas exige `_InstNum` e campos indexados para todas as instâncias visíveis.

## Validação desta retomada

- Python: **269 passed, 30 subtests passed**.
- Frontend DOM: **25 passed**.
- Sync frontend e collectstatic sem Tailwind: passaram.
- QA Chromium e fluxo manage.py/runapp com Qt/offscreen: três resoluções passaram, sem erros JS do Access Manager. Bibliotecas gráficas restauradas após desconexão. Resize/maximize, shell, modal com header/ações fixos, cancelamento e respostas tardias verificados. Polling preservou DOM/SVG/scroll no Chromium. Aviso Tailwind CDN do framework preexistente observado; não é erro JS do app.
- Não houve teste físico novo nem execução Windows/WebView2. Não declarar migração integral concluída: limites e pendências acima continuam rastreados.
