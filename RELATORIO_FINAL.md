# RELATÓRIO FINAL

Consulte `docs/EXECUTION_REPORT.md` para o estado de implementação/evidência e `docs/ENDPOINT_MIGRATION_MATRIX.md` para o inventário técnico completo.

## Resultado objetivo

- projeto novo separado do legado;
- Vela preservado como runtime;
- Domain/Application/Infrastructure/Presentation separados;
- Huawei/ZTE isolados por provider;
- `ProviderRouter`, `DeviceSession` e capabilities por feature;
- sem Lab/global write gate no runtime novo;
- writers já ligados são operações normais e capability-driven;
- profiles provider-neutral com preview/apply;
- frontend novo modular e responsivo;
- matriz de endpoints/resources/mutations produzida;
- suíte: **58 passed + 2 subtests**;
- limitações físicas/runtime Vela documentadas sem alegação falsa.
## Correção pós-validação em Windows — assets Vela e prefixo da API

Após o primeiro boot real no Windows, foi identificado que o template novo apontava para `/static/apps/access_manager/...`, mas o Vela serve os artefatos coletados em `__vela__/static/<path>` e o `collectstatic` grava o namespace como `access_manager/...`. O template foi corrigido para usar o helper oficial `{{ static('...') }}`.

Os logs do boot também expuseram uma duplicação de prefixo (`/api/api/...`): o `ApiServer` do Vela adiciona `/api` automaticamente. Os decorators foram corrigidos para declarar apenas `/session`, `/device/...` e `/profiles/...`, mantendo os endpoints públicos finais em `/api/...`. Foram adicionados testes de regressão para os dois casos.

