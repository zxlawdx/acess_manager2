# NetPulse — checkpoint de integração

A migração integral solicitada ainda não está concluída. Esta branch contém uma integração operacional testada e a matriz explícita das superfícies do legado ainda pendentes. O SOURCE foi preservado sem alterações.

## Implementado nesta branch

- Paleta canônica do anexo (#f6f5f9, #292b40, #7053ad, #527bb9, #16865b), cards claros e fontes DM Sans/Space Mono locais, com licenças OFL.
- Overview conserva respostas disponíveis quando outra superfície falha; topologia agrupada a partir dos clientes observados.
- Clientes: tabela/cards/topologia, busca, filtros de conexão/banda/SSID, drawer com campos técnicos; status ausente continua desconhecido.
- Provider ZTE aceita reveal_password, reaproveita o decoder legado e mantém snapshots normais mascarados. Senha revelada é removida do DOM ao fechar o diálogo.
- Wi-Fi: edição de SSID/senha/estado/broadcast/isolamento e rádio canal/auto/largura/padrão/potência/país/SGI, somente na capability de escrita existente. Campos não observados não são enviados. Backend mantém validações de firmware e campos.
- WAN mostra campos disponíveis e reserva IDs/object graph para Avançado. LAN separa habilitação, link, velocidade, duplex e negociação.
- DHCP/DNS: leituras independentes, leases/reservas e formulários ligados aos writers existentes. Nenhum parser Huawei/ZTE foi movido para o frontend.
- Ping/traceroute normalizados no backend; estatísticas e saltos na UI; resposta técnica em details fechado.
- Taxas calculadas por diferença de contadores; primeiro ponto/reset/sessão nova sem taxa fictícia. Histórico gráfico limitado às amostras desta sessão. WAN e LAN não são somadas.
- Gerenciamento: DMZ, UPnP ZTE, TR-069, nível de firewall e reboot conforme capabilities. Huawei TR-069 só expõe escrita de URL ACS e firewall só nível global. Reboot usa confirmação. DMZ ZTE preserva campos não editados.
- Histórico SQLite e redação de segredos copiados/adaptados do SOURCE; outcomes attempted/accepted/verified/uncertain/failed preservam diferença entre comando enviado e verificado.
- Perfis: criar/editar DNS e descrição sem descartar configurações existentes, excluir, preview e aplicação. Editor completo de Wi-Fi/DHCP de perfil ainda pendente.
- Runtime clássico gerado por esbuild a partir dos módulos, com script de sincronização/check. Vela collectstatic preservado; aplicação usa o runtime compilado versionado e não precisa de Node em execução.

## Validação

- Baseline: 85 passed + 2 subtests.
- Após alterações: 95 passed + 2 subtests; 5 testes DOM do runtime compilado.
- compileall, node --check, diff --check e sync_frontend --check.
- collectstatic sem erros; comparação do runtime source/servido.
- Dependência Vela pinada instalada neste ambiente.
- Testes DOM usam fixtures exclusivamente em tests/frontend; produção não possui fallback fictício.
- Não houve teste físico em ONT/roteador. Evidência física histórica dos providers foi preservada, sem alegar nova validação física.
- Inspeção visual, responsividade real e screenshots não realizados: download do Chromium retornou arquivo inválido. DOM não prova layout.

## Pendências para a migração integral

- Matriz de 177 rotas: rotas sem mapeamento revisado permanecem PENDENTE.
- Inventário/frota, batch/jobs, agentes, acesso remoto, monitor, incidentes, drift, backup/restore e demais superfícies CPE: serviços e persistência do SOURCE ainda precisam ser adaptados e testados no contrato do destino.
- CRUD completo de WAN, reservas DHCP, hosts DNS, redirecionamento, QoS, SNTP, regras de firewall, Mesh/configuração/pareamento, agenda/WPS/band steering: há partes do protocolo portadas, mas integração completa de API/UI/regressões ainda não realizada.
- Topologia Mesh por nó/backhaul não implementada; não se inventam pais/links a partir de clientes planos.
- Ranking de consumo e histórico temporal persistente ainda não implementados. Gráficos atuais só representam amostragem observada na sessão.
- Não há cobertura HTTP integrada de todos os novos endpoints nem teste físico dos writers.
- UI preserva a paleta/linguagem visual, mas ainda precisa de comparação visual completa contra o protótipo anexado.

## Retomada

Continuar nesta branch e usar NETPULSE_MIGRATION_MATRIX.md; não reiniciar inventário. Antes de declarar conclusão, completar as pendências, suíte/HTTP/QA visual e revisão comportamental contra SOURCE.
