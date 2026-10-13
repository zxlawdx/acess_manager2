# ARCHITECTURE

## Fluxo

```text
Vela UI -> Device API -> Query/Command Bus -> SessionManager -> Provider -> Protocol -> CPE/ONT
```

Huawei e ZTE implementam contratos comuns, mas não importam um ao outro. O frontend conhece somente `/api/session` e `/api/device/*`. Capabilities são por feature e não existe estado global de escrita.

## Regras

1. Session válida + provider correto + capability suportada = operação disponível.
2. Mutation não recebe retry cego. Writers portados preservam read-back/nonce interno quando a captura original exige.
3. EvidenceLevel não é SupportStatus.
4. Deployment é engenharia/homologação, não autorização para features suportadas.
