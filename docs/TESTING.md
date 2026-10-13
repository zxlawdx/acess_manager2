# TESTING

## Resultado da suíte nova

A suíte da reconstrução cobre:

- boundaries/import isolation Huawei ↔ ZTE;
- ausência de `writes_enabled`, `lab_enabled`, `requires_lab` e equivalentes no novo runtime;
- capabilities por feature;
- `ProviderRouter` e sessão;
- normalização/cálculo de tráfego e counter reset;
- regressões migradas de Huawei auth/transport/parser/redaction;
- builder WLAN ZTE;
- comandos de reboot ZTE;
- profiles provider-neutral, preview e apply por capability;
- contrato estático de bootstrap Vela.

Última execução local nesta entrega: **56 passed + 2 subtests passed**.

## Baseline legado

O recorte executado no projeto original resultou em **42 passed / 7 failed**. Seis falhas são `ModuleNotFoundError: vela` no ambiente de execução; uma é um teste legado que procura decorators apenas no antigo composition root depois da modularização.

## Limitação de boot real

O ambiente desta execução não conseguiu instalar o Vela pinado em GitHub porque não possui resolução de rede no shell (`Could not resolve host: github.com`). Por isso o boot gráfico real e `collectstatic/runapp` **não são declarados como executados**. O formato do bootstrap foi preservado a partir do uso real encontrado no legado, e a suíte valida o contrato estaticamente.
