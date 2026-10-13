# Access Manager Next

Nova implementação multivendor do Access Manager, construída separadamente do legado. O legado é fonte de conhecimento de protocolo; a aplicação nova possui contratos, providers e UI próprios.

## Desenvolvimento

```powershell
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py collectstatic --no-tailwind
python manage.py runapp
```

## Testes

```bash
python -m pytest -q
```

Não existe modo Lab nem estado global de autorização de escrita. A disponibilidade é derivada da sessão ativa + provider + capability da feature.

## Evidência desta entrega

- 56 testes + 2 subtests verdes no ambiente de reconstrução;
- compileall verde;
- sintaxe de todos os módulos JS validada com Node;
- sem `writes_enabled`/Lab gate no novo runtime;
- relatório detalhado em `docs/EXECUTION_REPORT.md`.

O boot Vela real requer instalar a dependência pinada de `requirements.txt`; o ambiente de reconstrução não teve acesso de rede no shell para baixá-la.
## Correção de integração Vela — assets e API

Os templates usam `{{ static('...') }}` para gerar URLs servidas pelo Vela em `__vela__/static/...`. Não use `/static/apps/...` diretamente. As rotas decoradas da API também são declaradas sem o prefixo `/api`, pois o `ApiServer` do Vela adiciona esse prefixo automaticamente.

