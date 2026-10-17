# Legacy parity and native release audit

This audit is intentionally written before the implementation is merged. The legacy application is the functional reference; Access Manager 2 keeps its provider-neutral architecture, capabilities and Vela shell.

## TRIAGEM

| Feature | legado | Access Manager 2 antes | estado | implementação desta branch |
|---|---|---|---|---|
| Estado do diagnóstico | `supportDiagnosticState`, dashboard/full separados | alertas pontuais dentro da view | PARCIAL | `TriageResult`, `TriageIssue` e `TriageEvidence` em domínio puro |
| Snapshot do dashboard | quick dashboard evita operações invasivas/concorrentes | Overview fazia a própria coleta | PARCIAL | Overview passa **o mesmo snapshot** ao motor; triagem não toca provider/ONT |
| LAN | 10/100 Mbps e negociação degradada | sem triagem | FALTANDO | distingue `NO_LINK` de `DEGRADED_LINK`, usa expected speed quando disponível |
| DNS | distingue lookup da ONT de resolução do PC | diagnóstico completo já possui lookup nativo | PARCIAL | regra aceita somente evidência com origem ONT/device; resolução workstation não prova saúde da ONT |
| WAN | estado, endereço/gateway | cards | PARCIAL | WAN down vira CRITICAL; dados ausentes continuam UNKNOWN |
| GPON | RX/TX/LOS e faixa | card óptico | PARCIAL | RX + LOS; thresholds do snapshot/modelo têm precedência, fallback legado -27..-8 dBm |
| Wi-Fi | rádio/SSID/RSSI | cards + clientes | PARCIAL | rádio/SSID OFF e RSSI médio usando limites recuperados do legado |
| Recursos | CPU/RAM/temperatura quando existem | cards | PARCIAL | cobertura reportada; ausência de métrica nunca vira falha |
| Capabilities | comportamento por modelo | CapabilitySet | EXISTENTE | `UNSUPPORTED` e `UNKNOWN` entram na cobertura sem inventar falha |
| Diagnóstico completo | mantém sessão e executa testes ativos | existente | EXISTENTE | botão da triagem navega à view existente sem reconectar |

### Decisão de concorrência

A triagem automática é uma função pura sobre um snapshot já coletado. A view pode ampliar a coleta do próprio dashboard (por exemplo LAN/DNS), mas **não existe segundo polling de triagem**. Operações ativas como ping, traceroute e DNS lookup nativo continuam no Diagnóstico completo; quando um snapshot já contém evidência de DNS lookup da ONT, a regra é avaliada. Isso preserva o lock/sessão dos adapters stateful.

## CONFIGURAÇÃO PADRÃO

| Feature | legado | Access Manager 2 antes | estado | implementação desta branch |
|---|---|---|---|---|
| Perfis por atendente | ProfileRepository por operador | `profiles.json` global | FALTANDO | schema v2 por `session.attendant`, com migração do JSON plano |
| Perfil ativo | sim | não | FALTANDO | `active` por atendente e endpoint `/profiles/active` |
| Capturar atual | readers → draft → revisão | não | FALTANDO | `/profiles/capture`; lê Wi-Fi/DNS/DHCP e **não salva** |
| Wi-Fi 2.4/5 GHz | canal/largura/standard/país/potência/beacon/SGI | campos principais | PARCIAL | editor cobre todos esses campos e preserva opções/capability do modelo |
| Extras Huawei | RTS/CTS, DTIM, airtime fairness, band steering, bandwidth_code | translator preservava dados, UI não | PARCIAL | round-trip preservado e editor mostra extras presentes no modelo/draft |
| DNS | domínio, IPv4 1/2, IPv6 1/2 | lista genérica de servers | PARCIAL | campos explícitos + `ipaddress.ip_address` no backend |
| Static DNS hosts | CRUD | editor básico | PARCIAL | adicionar/editar/remover no draft/profile, sem sobrescrever valores existentes |
| Apply por etapa | legado retorna steps e para após falha | AM2 já usa best-effort | PARCIAL | mantém semântica AM2 best-effort por capability e expõe `steps` SUCCESS/FAILED/UNSUPPORTED/UNCERTAIN; **não declara rollback** |
| Campos desconhecidos | variantes de modelo | top-level descartado | FALHA | `NetworkProfile.extensions` preserva unknown fields e os achata no round-trip |
| Credenciais | não persistir | bloqueio já existente | EXISTENTE | mantido; captura também filtra senha/PSK/token |

### Semântica de apply

O legado interrompe o apply na primeira falha. O Access Manager 2 já foi desenhado como best-effort provider-neutral por capability. Esta branch mantém esse comportamento atual para evitar inventar atomicidade/rollback inexistente, mas passa a apresentar cada etapa e seu resultado real. Uma falha em DNS, por exemplo, não pode resultar apenas em “Perfil aplicado”.

## DISTRIBUIÇÃO

| Item | legado | Vela 0.2.2 | DFD Studio | AM2 antes | decisão |
|---|---|---|---|---|---|
| Engine | PyInstaller cru | PyInstaller via `buildapp` | PyInstaller | Vela app sem release | **`buildapp` primeiro** |
| Python | 3.12 | suportado | 3.12 | 3.12 no validate | 3.12 |
| Windows | nativo | suportado | nativo | faltando | `windows-latest` |
| Linux | nativo | Qt6 recomendado | Ubuntu + Qt6 | faltando | Ubuntu 24.04 + Qt6 |
| doctor | não | `doctor --gui qt6` | checks próprios | faltando | obrigatório antes do build |
| dry-run | não | `buildapp --dry-run` | não | faltando | obrigatório |
| self-test | sim | integrado + CLI | sim | faltando em release | executar o binário congelado em cada runner |
| verificação física | sim | manifesto/recursos | sim | faltando | manifesto, template, runtime.js, CSS e config reais |
| checksum | sim | ZIP `.sha256` | sim | faltando | SHA-256 do arquivo publicado |
| tag | `v*` | workflow gerado `v*` | `v*` | faltando | requisito AM2: **qualquer tag `*`** |
| release | idempotente | artifacts | após os dois builds | faltando | `gh release upload --clobber`, somente após Windows + Linux |

### Dependências dinâmicas aprendidas com o legado

O legado comprovou problemas de coleta com `config`, `apps`, Vela, pywebview, pydantic/pydantic_core, cryptography, platformdirs, setuptools/jaraco/more_itertools e Qt/WebEngine. O pin atual do Vela é preservado. A toolchain de release instala explicitamente as dependências de build Qt6/PyInstaller compatíveis; somente será criado spec customizado se um build real comprovar que `buildapp` não coleta um recurso necessário.

### PASS de plataforma

Este documento não marca Windows ou Linux como PASS por inspeção de YAML. A plataforma só pode ser chamada de PASS quando o job nativo executar o executável congelado com `--self-test`, verificar fisicamente o bundle e publicar o artifact correspondente.
