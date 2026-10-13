# EXECUTION REPORT — Access Manager Next

## Estado desta reconstrução

Esta entrega cria um projeto novo e separado. O ZIP legado permaneceu intacto e foi usado como fonte técnica de endpoints, protocolos, autenticações, parsers, fixtures e comportamento. A arquitetura antiga não foi usada como composition root da aplicação nova.

### Evidência executada nesta sessão

- `python -m pytest -q`: **58 passed + 2 subtests passed**.
- `python -m compileall`: **green**.
- `node --check` em todos os módulos JavaScript: **green**.
- varredura do novo runtime por `writes_enabled`, `lab_enabled`, `requires_lab`, `experimental_enabled`, `lab_mode`, `huawei_lab`: **0 ocorrências**.
- projeto legado, em baseline reduzido: **42 passed / 7 failed**; seis falhas eram ausência do pacote `vela` no ambiente e uma era um teste legado de decorators já incompatível com a modularização do próprio legado.

## Estrutura e arquitetura

Fluxo principal:

```text
Vela UI
  ↓
provider-neutral local API
  ↓
Application Query/Command Bus
  ↓
SessionManager + CapabilitySet
  ↓
ProviderRouter
  ↓
HuaweiProvider | ZTEProvider | Deployment context
  ↓
protocol/auth/parser/transport do fabricante
  ↓
ONT / roteador
```

Huawei e ZTE não chamam serviços um do outro. O frontend não conhece AMP/BBSP, ThinkLua, `/f6201b/*` ou endpoints físicos.

## Writes

Não existe segundo estado global para liberar escrita. O gate é:

```text
active session + selected provider + feature.write == SUPPORTED
```

`PARTIAL` é visível como evidência, mas não é executado automaticamente. Isso evita usar `PARTIAL` como um "talvez funcione" silencioso.

### Produção já ligada ao novo provider

**ZTE F670L/F6600P (ThinkLua)**: writers nativos do protocolo migrado são representados como `SUPPORTED` para o conjunto já mapeado pelo legado, incluindo Wi-Fi/radio, WPS, UPnP, DHCP/DNS, WAN, firewall, TR-069 e reboot.

**ZTE F6201B**: SSID/Wi-Fi e DNS foram ligados pelos writers capturados, com preflight, one-shot mutation e read-back. As outras superfícies capturadas permanecem `PARTIAL` até serem ligadas a commands/provider específicos; não existe botão Lab para as operações já suportadas.

**Huawei EG8041X7-10**: Wi-Fi/SSID, radio, DHCP, DNS, DMZ, TR-069 e firewall-level estão ligados ao provider. Outras mutations existentes no material legado são preservadas como conhecimento e `PARTIAL` quando ainda não existe um command/provider novo que as execute com contrato/teste correspondente.

**Huawei reboot**: não foi promovido. O próprio legado classifica os fluxos encontrados para HG8245H/Phase-3 como pendentes de validação física. Promovê-lo apenas para preencher o botão violaria a regra de evidência.

## Endpoint migration matrix

`ENDPOINT_MIGRATION_MATRIX.md` separa:

- **277** pares arquivo/path HTTP encontrados nas camadas de equipamento;
- **227** pares arquivo/resource ThinkLua;
- **201** funções candidatas a mutation na varredura AST restrita às camadas de equipamento, com método, resource/path, payload visível, token/session, read-back estático e destino arquitetural quando inferível.

A presença na matriz não equivale a `SUPPORTED`; capability e evidence continuam separadas.

## Profiles

Implementado modelo provider-neutral (`NetworkProfile`), repository JSON, tradutores Huawei/ZTE, preview e apply.

- perfil guarda intenção, não endpoint;
- secrets persistentes são recusados;
- preview cruza intenção com capabilities;
- apply executa somente `SUPPORTED`;
- sem retry cego;
- resumo retorna `applied`, `skipped`, `failed`.

## Traffic

O domínio de telemetria normalizada e cálculo de `delta_bytes / delta_time`, incluindo counter reset, está implementado/testado. A fonte de counters de tráfego ainda **não foi promovida** em todos os runtimes ativos: os providers retornam estado explícito quando a fonte normalizada não está comprovada.

## Frontend / UX

Frontend novo modular em ES modules, sem `app.js` monolítico e sem page reload. Implementado:

- device context bar;
- sidebar operacional/rede/operações/avançado;
- overview estruturado;
- clientes em tabela;
- Wi-Fi/SSID com edição capability-driven;
- WAN, LAN, DHCP/DNS;
- profiles com preview/apply;
- management com reboot somente quando suportado;
- capabilities separando read/write/evidence;
- deployment workspace informativo;
- desktop-first + adaptação mobile;
- foco visível e semântica básica de dialog/status.

## Vela

O bootstrap foi mantido no formato real usado pelo projeto e confirmado contra o framework pinado: `VelaApp(settings_module=..., bridge_class=...)`, `register_app()` e `app.run()`.

O **boot gráfico real não foi executado** neste ambiente porque o shell não conseguiu resolver `github.com` ao instalar o Vela e também não possui as dependências do framework (`pywebview`, `bottle`, `waitress`). Portanto, não há alegação de `runapp`/`collectstatic` executados aqui.

## Pendências reais

1. Executar `collectstatic` + `runapp` em ambiente com Vela/dependências disponíveis e registrar o boot test real.
2. Testar mutations contra hardware de bancada antes de elevar evidence para `PHYSICALLY_VALIDATED` onde o legado não fornece essa prova.
3. Ligar ao novo command/provider as superfícies Huawei atualmente `PARTIAL` (por exemplo UPnP/SNTP/WAN config/IPv4 filter e outras capturas) sem copiar controllers Lab.
4. Ligar as 14 estratégias de formulário F6201B já preservadas em `f6201b_full_forms.py`/`f6201b_workbench.py` a use cases explícitos e testes de contrato antes de promover suas capabilities.
5. Conectar counters reais de tráfego por runtime ao domínio normalizado.
6. Evoluir Deployment para protocol inspector/capture assistant completo; o workspace atual não é um bypass de segurança e não promove mutation por hipótese.
7. Criar testes E2E gráficos no Vela real e validação em 1366×768, 1920×1080 e mobile.

## Hardware ainda necessário para claims físicos

Somente testes automatizados/fixtures foram executados nesta sessão. Para qualquer nova promoção `PHYSICALLY_VALIDATED`, usar o equipamento/firmware exato correspondente, começando pelos runtimes que ainda aparecem como `PARTIAL`/deployment. Não inferir validação física de um modelo para outro.

## Conclusão de honestidade

A nova base arquitetural, providers principais, capabilities, profiles, frontend modular e regressões migradas estão implementados e automatizadamente testados. A entrega **não declara** que todos os endpoints do legado já foram reexpostos nem que todos os modelos foram fisicamente revalidados. O material não integrado permanece inventariado e não é escondido atrás de um falso "concluído".
## Correção pós-validação em Windows — assets Vela e prefixo da API

Após o primeiro boot real no Windows, foi identificado que o template novo apontava para `/static/apps/access_manager/...`, mas o Vela serve os artefatos coletados em `__vela__/static/<path>` e o `collectstatic` grava o namespace como `access_manager/...`. O template foi corrigido para usar o helper oficial `{{ static('...') }}`.

Os logs do boot também expuseram uma duplicação de prefixo (`/api/api/...`): o `ApiServer` do Vela adiciona `/api` automaticamente. Os decorators foram corrigidos para declarar apenas `/session`, `/device/...` e `/profiles/...`, mantendo os endpoints públicos finais em `/api/...`. Foram adicionados testes de regressão para os dois casos.

