# Hotfix — frontend não iniciava / botão Conectar não chegava à API

## Sintoma observado

A interface carregava com CSS, HTTPS aparecia, mas o workspace mostrava `Falha ao iniciar o frontend` e o botão **Conectar** não produzia autenticação no equipamento.

Os logs do Vela registravam as rotas `/api/session`, porém não havia execução de `POST /api/session` após o clique. Portanto a falha ocorria antes da camada de provider/Huawei/ZTE.

## Causa

O bootstrap anterior era um script clássico que dependia de `import(moduleUrl)` para carregar `workspaces/app.js`. A WebView usada pelo runtime Vela não completou esse carregamento modular no cenário real do aplicativo. O handler de submit definitivo nunca era registrado.

## Correção

- removido o bootstrap dinâmico da rota;
- adicionado `static/js/runtime.js` como runtime clássico autocontido;
- removida a dependência de `import()`/ES modules no caminho de execução da WebView;
- o formulário agora registra `submit -> connectFromForm` diretamente;
- `POST /api/session` é executado pelo runtime clássico;
- HTTP/HTTPS e porta explícita continuam preservados;
- os campos permanecem preenchidos quando a conexão falha;
- senha é limpa apenas após sessão autenticada;
- adicionados logs sanitizados de seleção de provider e falha/sucesso da conexão;
- os módulos antigos permanecem no projeto como fonte modular, mas não são necessários para inicializar a WebView.

## Validação local

- `pytest -q`: 62 passed + 2 subtests
- `node --check apps/access_manager/static/js/runtime.js`: OK
- `python -m compileall` para `session_manager.py`: OK

A validação física da autenticação continua dependendo do equipamento acessível na rede do operador.
