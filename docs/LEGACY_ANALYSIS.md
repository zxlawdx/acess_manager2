# LEGACY_ANALYSIS

## Escopo

Auditoria estática do ZIP recebido. O projeto contém **488 arquivos no ZIP original**. O bootstrap real usa `VelaApp(settings_module="config.settings", bridge_class=ZTEBridge)`, registra `apps.zte_manager` e chama `app.run()`. Nenhum `manifest.json` foi encontrado no ZIP; portanto a nova aplicação não inventa um.

## 1. Arquitetura atual

O legado já possui separações parciais (`application/`, `infrastructure/huawei`, `presentation/api`, adapters), mas ainda mantém o domínio dentro de `apps.zte_manager`, um `app.js` grande, `ZTEService` de alta responsabilidade e estados globais/por sessão de escrita.

## 2. Endpoints encontrados

A análise estática separa paths HTTP de recursos lógicos ThinkLua. O inventário completo e a matriz de mutations estão em `ENDPOINT_MIGRATION_MATRIX.md`.

## 3. Protocolos encontrados

- ZTE ThinkLua/menuView/menuData com sessão, `_sessionTOKEN`, RSA/Check e módulos de configuração especializados.
- Huawei RandCount + `/login.cgi`.
- Huawei RandString + session token.
- Huawei `/api/webserver/SesTokenInfo` + `/api/system/user_login`.
- Huawei AMP/BBSP/SSMP com parsers de construtores JavaScript.
- Transportes Huawei de afinidade TCP e single-write onde a evidência exige.

## 4. Modelos/famílias observados

ZTE: F670L, F6600P, F6201B e famílias de descoberta adicionais. Huawei: EG8041X7-10, EG8041X6-10, EG8145V5, HN8010TS, HG8145X6, HG8245H, HG8347R, HG8010H/EG8010H e outros itens de registry/research.

## 5. Autenticações

A autenticação é mantida no protocolo de cada fabricante. Não há fallback cross-vendor após uma sessão ativa. O orçamento de submissão de credenciais Huawei foi preservado.

## 6. Parsers

- ZTE XML `ajax_response_xml_root` + pares `ParaName`/`ParaValue`.
- Huawei JS constructors, escapes/hex e respostas AMP/BBSP.
- Parsers específicos para telemetria/óptica e formulários capturados.

## 7. Operações READ

Device, WAN/PPPoE, Wi-Fi, clientes, LAN, DHCP/DNS, óptica, diagnósticos e superfícies avançadas aparecem no legado em níveis diferentes de evidência.

## 8. Operações WRITE

A análise AST encontrou **215 métodos com semântica de mutation**. Nem todo método representa uma operação fisicamente homologada; a nova arquitetura separa `SupportStatus` de `EvidenceLevel`.

## 9. Operações destrutivas

Reboot é management normal quando suportado. Factory reset, firmware update e restore permanecem de alto risco e não são promovidos por inferência.

## 10. Fixtures e testes

O ZIP contém diretório `tests/fixtures` e uma suíte extensa Python/Node. Um baseline reduzido executado nesta reconstrução resultou em **42 passed / 7 failed**; 6 falhas ocorreram por ausência do pacote `vela` no ambiente e 1 por contrato legado que procura decorators no composition root antigo.

## 11. Código reutilizável

Foram portados como conhecimento de infraestrutura: protocolos ZTE ThinkLua, autenticações/transports/parsers Huawei, feature services Huawei capturados e writers F6201B comprovados por fixture/teste.

## 12. Código descartável

Não foram portados como arquitetura: `ZTEService`, `DeviceService`, `app.js` monolítico, controles Lab/writes globais, roteamento UI por modelo e composition root legado.

## 13. Dívidas arquiteturais

- `writes_enabled` aparece em múltiplas camadas/testes.
- Huawei possui um controller `huawei_lab.py`.
- `ZTEService` concentra sessão, modelos, operações, histórico, diagnóstico e compatibilidade.
- O frontend legado ainda carrega um `app.js` de milhares de linhas.

## 14. Vazamentos entre fabricantes

O legado melhorou esse isolamento, mas ainda possui nomes/pacote raiz ZTE para toda a aplicação e compatibilidades que tornam fácil um fallback indevido. O novo projeto aplica testes de import boundary.

## 15. Nova arquitetura

`Presentation -> Application -> Domain <- Infrastructure`, com `ProviderRouter`, `SessionManager`, `CapabilitySet` e providers Huawei/ZTE independentes. Deployment não é autorização de escrita; é destino para firmware/feature sem evidência suficiente.
