# Access Manager — relatório de execução

Continuação do working tree `feat/provider-parity-round2`, sobre main `8c6dea5c5b24069c5442a11ccf48baa569dde5b7`, sem reiniciar auditoria ou alterar o SOURCE. NetPulse permanece somente como referência visual e nos nomes históricos dos documentos.

## Entregas desta rodada

- Hosts DNS: leitura normalizada, adicionar/editar com validação de endereço/nome, capability por operação e UI dedicada. Huawei reutiliza os writers capturados de criação/edição/exclusão. ZTE reutiliza `_upsert_host` e confirmação por leitura, em F670L/F6600P. Exclusão ZTE e renomeação que exija exclusão continuam bloqueadas: não existe writer comprovado no legado. F6201B não recebe uma capability de escrita inventada.
- Reservas DHCP: CRUD via writers existentes dos dois providers, normalização de MAC/IPv4, confirmação de exclusão e campos permitidos por provider. Huawei não recebe um campo nome que seu writer não suporta. Escritas DHCP/DNS X6 permanecem UNKNOWN; as evidências X7 não são transferidas para X6.
- DHCP/DNS, WAN e dispositivo usam contratos de apresentação com rótulos humanos; caminhos internos ficam em Avançado. Strings `getValue(...)` são excluídas do DNS.
- Huawei: contadores `stPacketInfo` e `WaninfoStats`, validação de domínio/assinatura, bytes/pacotes/erros/descartes quando presentes; associações com SSID, banda, hostname, RSSI e SNR somente reconhecidos. Fontes ausentes não viram zero.
- Tráfego: RX/TX em Mbps por diferença de contadores, sem taxas falsas no primeiro ponto/reset; persistência SQLite por sessão, retenção de sete dias e limite de volume, agregação temporal. Polling incremental com cancelamento ao sair da página, uma requisição em andamento, cards e gráficos preservados, fontes temporariamente ausentes marcadas. Interfaces não são somadas.
- Rádio: canal/largura/padrão/potência em comboboxes. Opções vêm de selects HTML ou metadados de canal existentes; ausência de evidência deixa campo desabilitado. SGI Huawei não é anunciado como editável pelo writer capturado.
- Perfis: múltiplos rádios/SSIDs, opções observadas, DNS IPv4/IPv6 (até dois por família, limite real do writer), DHCP, preview atual/desejado, preservação de campos e redes não observados. Segredos transitórios no apply, nunca persistidos. Resultado incerto não conta como verificado.
- Gerenciamento: campos humanos DMZ/UPnP/TR-069/firewall, confirmação de reboot, telemetria disponível e histórico com outcomes diferenciados. Respostas técnicas recolhidas.
- Capabilities e Implantação removidas da sidebar operacional, serviços internos preservados.
- Visão Geral/topologia representa gateway e grupos/clientes por conexão/banda observada. Não inventa nós Mesh ou relações de backhaul.

## Evidências e validação

As implementações funcionais do SOURCE `1623bce8717b9b92683cd3904f9c2bd378da400c` foram reutilizadas. Divergências Huawei foram confrontadas com capturas/testes legados, ONTWatch `41e4369a8554ed5b861640d121ea5ffec60392b5` e huawei-ont-stats `9430d6fb053f8788d8c190ea0c47adbe9a52f9e9`. Fixtures novas são sintéticas e identificadas, derivadas dessas assinaturas.

- Suíte Python completa e regressões do SOURCE: 138 passed, 2 subtests passed.
- 11 testes DOM do runtime compilado, incluindo CRUD DNS, perfis, enums, capabilities e identidade dos cards de tráfego.
- Testes HTTP integrados usando o ApiServer/Bottle real do Vela: prefixo `/api`, JSON, contrato normalizado, criação/exclusão e bloqueio de capability UNKNOWN.
- Chromium portátil real, sem erros JavaScript, em 1366×768, 1600×900 e 1920×1080: navegação de todas as views operacionais, overflow, modal de rádio e drawer. Polling verificado por identidade de página/card/SVG, ausência de remoção do card, evolução de pontos e scroll preservado.
- Screenshots em `docs/screenshots/`. Dados são fixtures de QA, sem fallback fictício em produção.
- Runtime sincronizado, collectstatic e diff check. Não houve validação física em ONT nesta rodada.

## Bloqueios e trabalho restante

1. Exclusão de host DNS ZTE: falta implementação/evidência protocolar no SOURCE; não foi inventada. X6 DHCP/DNS: falta prova específica de escrita. Opções de rádio ausentes nas respostas reais não são preenchidas com listas arbitrárias.
2. Mesh: faltam relações reais entre nós/backhaul. Topologia mantém somente relações observadas.
3. Persistência de tráfego é consultada na sessão ativa; consulta histórica entre sessões/dispositivos ainda não existe. Ranking depende de contadores individuais retornados pelo firmware.
4. Paridade integral das 177 rotas continua aberta: WAN CRUD, regras de firewall, port-forward, QoS, SNTP, WPS/agendas/band steering, frota/jobs/agentes/monitor/incidentes/drift, backup/restore e outras superfícies seguem na matriz. Leitura WAN/LAN não implica esses writers completos.
5. QA de layout usa Chromium real com respostas sintéticas. Disponibilidade e sucesso de escrita em equipamento físico ainda exigem capturas específicas; não se declara paridade física completa.

## Atualização: liberação por endpoint (2026-10-13)

A pedido do usuário, o bloqueio por modelo X6 foi substituído por disponibilidade da página autenticada na sessão. Os writers BBSP existentes de DHCP, DNS, reservas DHCP e hosts DNS (inclusive exclusão) ficam habilitados no X6 quando suas páginas correspondentes respondem. Página upstream DNS não habilita CRUD de hosts; cada superfície tem probe próprio. Writers mantêm validação e readback; disponibilidade não equivale a validação física. As afirmações anteriores de X6 sempre UNKNOWN foram superadas por esta regra.

Regressão após alteração: 57 testes passaram (X6, providers, HTTP Vela e writers capturados). Ausência de endpoint conserva UNKNOWN. Não houve nova alteração de frontend nem necessidade de repetir QA visual.

ZTE: `dns_hostname_lua.lua` possui implementação de Apply para upsert, mas não há endpoint/ação de exclusão comprovada no código legado. Essa operação continua indisponível. Mesh: o endpoint `easymeshTopo.asp` já está catalogado para leitura; o limite de representação vem da ausência de relações reconhecidas, não de uma trava de escrita a remover.

## Atualização: shell Vela e Perfis

Branch `fix/vela-shell-profile-layout`, sobre main `8e4a551` após os PRs anteriores. Corrigida a colisão de CSS global `main` com o host `#vela-page`: shell e wrappers agora ocupam a WebView sem padding externo; espaçamento em page-content, scroll no workspace, sidebar/topbar globais. Editor de Perfis sem SSIDs individuais, DHCP condicionado ao writer, rádios/DNS globais, header/ações fixos e conteúdo rolável; intenção técnica antiga preservada no backend.

13 testes DOM e QA Chromium em três resoluções passaram. QA adicional na WebView real pywebview/Qt offscreen pelo fluxo manage.py/runapp passou nas três resoluções, incluindo resize/maximize, bordas, overflow e modal. Dados de equipamento sintéticos; Windows/WebView2 não foi executado. Relatório e referências: VELA_SHELL_LAYOUT_REPORT.md; screenshots reais da WebView em docs/screenshots/vela. Backend de equipamento não foi alterado nesta etapa.

## Atualização: navegação, cache e valores técnicos

Branch fix/navigation-latency-technical-values sobre main 148365e. Geração/abort centralizados impedem render/erro/modal de navegação antiga; Wi-Fi e Perfis abrem imediatamente e carregam componentes em background. Cache por sessão em memória (15 s, revalidação após 3 s), sem secrets, invalidado após escrita. Formulários dirty preservados. Readers de SSIDs/rádios separados, memo Huawei limitado à operação e view de opções ZTE sem duplicação. Writer/protocolo não foi refeito. Valores técnicos roxos; status verdes/vermelhos e títulos preservados.

Suíte Python: 143 + 2 subtestes. QA no Vela/pywebview/Qt real, três resoluções, reproduziu os bugs anteriores e confirmou a correção. Cenário controlado 2 s: Wi-Fi shell 2003→1,9 ms; SSIDs 2003→104 ms; reabertura 2002→1,4 ms; Novo Perfil 2013→4,9 ms. Nenhuma medição física nova. Relatório: NAVIGATION_PERFORMANCE_REPORT.md; números exatos: performance-before.json/performance-after.json.

## Rodada do relatório integral — 2026-10-13

Base `aad35f0` (PR #6 integrado), branch `feat/report-runtime-integration`. Os dois anexos PROMPT_IMPLEMENTACAO_TOTAL_COM_RELATORIO_HUAWEI_ZTE (1)(1)/(1)(2) são idênticos; relatório usado como evidência, sem nova auditoria geral.

Implementado nesta rodada:

- Probes ThinkLua de tráfego WAN/LAN/WLAN independentes de modelo. Contexto por superfície: ethWanStatus → eth_interface_status → wan_internet (TypeUplink=2/pageType=1), localNetStatus → eth_lanstatus e localNetStatus → wlan_status. IDs de instância para identidade e joins de SSID/banda, nunca posição/nome. Contadores inválidos/negativos ausentes, zero válido; IDs duplicados ambíguos descartados. Falhas parciais preservam outras fontes e fallback legado. WAN status ausente não descarta contador válido. Nenhum somatório WAN/LAN/WLAN nem Mbps calculado de total acumulado. Fonte: ZTE-Exporter 4bdcffd0b4362514fc7500bb47b4560f794ace6b (protocolo, não cópia de código).
- Diagnóstico completo operacional: coleta progressiva de sistema, WAN, óptica, SSIDs, rádios, clientes, LAN, DHCP, DNS, tráfego e topologia existente. GETs forçados atuais, sequenciais por contexto da sessão, ping automático ao solicitar coleta; traceroute/DNS lookup opcionais. Falhas isoladas; navegação obsoleta não escreve na view atual. Segunda amostra de tráfego pelo sampler existente. Sem limiares ópticos genéricos nem relações Mesh inferidas.
- DNS lookup ZTE e descoberta de servidores AIS de speed test integrados via CommandBus/API, writers legados sem retry de POST. Capabilities nativas F670L/F6600P disponíveis para teste; outras famílias UNKNOWN. DNS lookup valida hostname e elimina request/token interno do retorno. Descoberta não inicia medição e não expõe session_id transitório.
- UPnP Huawei conectado ao provider para perfis com writer mapeado. Leitura identifica exatamente MainUPnP/SlvUPnP; mudança parcial preserva estado não solicitado. Uma submissão; confirmação específica dos dois objetos, inclusive quando a verificação genérica do legado aceita só um Enable. Formato desconhecido não vira false e não permite payload incompleto. Capability SUPPORTED não exige validação física nova.
- Cards de tráfego mostram rótulo/SSID; identidade técnica fica em details. Polling incremental, gráfico e sessão preservados.

Validação: suíte Python 162 passed + 2 subtests; DOM 24 passed. Chromium e fluxo Vela real manage.py/runapp com pywebview/Qt em 1366×768, 1600×900, 1920×1080. Fixtures sintéticas de equipamento; nenhuma validação física ou Windows/WebView2 nova. Shell, resize/maximize, overflow, modal, navegação tardia e coleta completa exercitados. Capturas novas em docs/screenshots/vela/complete-diagnostics-*.png. Sync/collectstatic/node syntax e diff check. Aviso externo Tailwind indisponível preexistente, sem erro JS do app.

A implementação integral do relatório NÃO está concluída. Continuam pendentes integração provider/API/UI dos 14 full forms F6201B (núcleo funcional já migrado), WAN CRUD, SNTP, IPv4 filters, avançados Wi-Fi, backup/restore/firmware/reset, velocidade nativa efetiva e probes Mesh adicionais. Huawei affinity já estava presente e foi preservada, não reimplementada nesta rodada. Endpoint conhecido sem formato completo não recebeu writer inventado; limitação registrada na matriz.
