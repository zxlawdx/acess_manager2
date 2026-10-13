# PROFILES

## Modelo provider-neutral

`NetworkProfile` guarda **intenção**, nunca endpoint, token ou payload específico de fabricante. O formato atual suporta:

- `wifi.ssids[]`: `id` + campos desejados do SSID;
- `wifi.radio`: intenção de rádio;
- `dns`;
- `dhcp`.

## Tradução

`HuaweiProfileTranslator` e `ZTEProfileTranslator` transformam a intenção em `ProfileOperation` usando apenas nomes de comandos da aplicação (`set_ssid_config`, `set_wifi_radio`, `set_dns`, `set_dhcp`). AMP/BBSP/ThinkLua permanecem dentro dos providers/protocolos.

## Preview e apply

`ProfileService.preview()` cruza cada operação com a `CapabilitySet` da sessão. Somente `write == SUPPORTED` recebe `will_apply=true`. `PARTIAL` e `UNSUPPORTED` são pulados automaticamente.

`ProfileService.apply()` executa apenas as operações aprovadas pelo preview e **não faz retry** em falha. O resultado retorna `applied`, `skipped`, `failed` e detalhes por operação. O read-back continua no writer/provider concreto, porque só essa camada conhece a semântica do equipamento.

## Persistência

Os perfis são armazenados como JSON no diretório de dados da aplicação. Credenciais, cookies, tokens, senha PPPoE e segredos de sessão não fazem parte do modelo.

## API

- `GET /api/profiles`
- `POST /api/profiles`
- `DELETE /api/profiles`
- `POST /api/profiles/preview`
- `POST /api/profiles/apply`

## Evidência

A arquitetura e o gating por capability são `AUTOMATED_TESTED`. Isso **não** significa que cada combinação profile × firmware foi fisicamente validada; a evidência da mutation continua sendo a capability do provider ativo.
