# API

A API pública é provider-neutral. O frontend não chama endpoints reais da ONT/roteador.

## Session

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/session` | autenticar, detectar provider/runtime e criar `DeviceSession` |
| GET | `/api/session` | consultar contexto da sessão |
| DELETE | `/api/session` | desconectar e limpar estado transitório |

## Device reads

| Method | Path | Capability |
|---|---|---|
| GET | `/api/device` | `device.read` |
| GET | `/api/device/clients` | `clients.read` |
| GET | `/api/device/wifi` | `wifi.read` |
| GET | `/api/device/wan` | `wan.read` |
| GET | `/api/device/lan` | `lan.read` |
| GET | `/api/device/dhcp` | `dhcp.read` |
| GET | `/api/device/dns` | `dns.read` |
| GET | `/api/device/optical` | `optical.read` |
| GET | `/api/device/traffic` | `traffic.read` |
| GET | `/api/device/capabilities` | sessão ativa |

## Device mutations

| Method | Path | Capability |
|---|---|---|
| POST | `/api/device/wifi/ssid` | `wifi.write == SUPPORTED` |
| POST | `/api/device/wifi/radio` | `wifi_radio.write == SUPPORTED` |
| POST | `/api/device/dns` | `dns.write == SUPPORTED` |
| POST | `/api/device/dhcp` | `dhcp.write == SUPPORTED` |
| POST | `/api/device/reboot` | `reboot.write == SUPPORTED` |

`PARTIAL` não é permissão de mutation genérica. Uma sub-operação parcial deve ganhar capability/command próprio quando estiver integrada.

## Profiles

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/profiles` | listar perfis |
| POST | `/api/profiles` | salvar intenção sem secrets |
| DELETE | `/api/profiles` | remover perfil |
| POST | `/api/profiles/preview` | traduzir para provider e mostrar o que será aplicado/pulado |
| POST | `/api/profiles/apply` | executar apenas operações `SUPPORTED` |

## Error envelope

Falhas conhecidas passam por `application.error_policy.public_error` e são expostas sem credenciais/token/cookie. Mutation não recebe retry cego na camada de API.
