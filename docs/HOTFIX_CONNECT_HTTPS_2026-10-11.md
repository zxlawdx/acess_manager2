# Hotfix — conexão + seletor HTTPS

## Sintomas observados

- a tela carregava com CSS, mas ao enviar credenciais o formulário fazia navegação nativa para `/`, limpando os campos e sem abrir sessão;
- o seletor de transporte HTTPS presente no legado não havia sido migrado para a nova tela de conexão.

## Causa

A página do Access Manager é injetada pelo shell Vela. O frontend principal era carregado diretamente como `script type="module"` na página injetada. No runtime reportado, o módulo não chegou a montar os handlers do formulário. Sem `preventDefault()`, o browser executava o submit HTML nativo e a própria rota `/` era recarregada.

## Correções

1. O template passou a ser um fragmento Vela, sem `html/head/body` próprios.
2. Foi adicionado `bootstrap.js` clássico, que o Vela executa da mesma forma que o frontend legado.
3. O bootstrap intercepta o submit antes de importar o frontend modular, impedindo reload mesmo se um import falhar.
4. `app.js` agora exporta `mountApp()` e mantém a arquitetura modular.
5. A API frontend ganhou tratamento robusto para HTTP/JSON inválido.
6. O formulário agora inclui seletor `HTTPS` e envia booleano explícito.
7. `SessionManager` normaliza `http://` / `https://` digitados no host e preserva porta explícita, inclusive HTTPS na porta 80.
8. A sessão pública registra `metadata.scheme`/`metadata.https` para a UI mostrar como o equipamento foi acessado.
9. Em erro de autenticação/conexão, os campos não são resetados; somente a senha é limpa após sucesso.

## Regressões

- template fragment + bootstrap clássico;
- seletor HTTPS presente;
- submit nativo bloqueado antes do módulo terminar de carregar;
- `https://host:80` vira host `host:80` + `https=True`;
- flag HTTPS de host simples é repassada ao provider.

## Resultado local

`62 passed, 2 subtests passed`.
