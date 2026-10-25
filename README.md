# Access Manager

Migração em andamento do `zxlawdx/acess_manager`, com interface NetPulse e protocolos ZTE/Huawei existentes. A matriz em `docs/NETPULSE_MIGRATION_MATRIX.md` registra também as superfícies ainda pendentes: esta versão não representa paridade completa com as 177 rotas do legado.

## Executar

```powershell
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py collectstatic --no-tailwind
python manage.py runapp
```

O runtime compilado e as fontes estão versionados; executar a aplicação não exige instalar Node. Para editar o frontend:

```bash
npm ci
python tools/sync_frontend.py
python manage.py collectstatic --no-tailwind
```

`runtime.js` é gerado dos módulos de `static/js`: não o edite diretamente. O template usa o helper `static()` do Vela, e as rotas Python não duplicam `/api`.

## Arquitetura

O composition root da aplicação fica em `apps/access_manager/composition.py`; `config/wsgi.py` monta apenas o runtime Vela. A estrutura segue `presentation -> application -> domain -> infrastructure`, com providers e sessões stateful pertencendo ao `ApplicationContext` e seleção de vendor centralizada pelo registry/router.

Veja [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) para boundaries, lifecycle, nomenclatura e regras de dependência. Novos módulos de domínio não devem importar Vela/Bottle/WebView e a presentation não deve acessar implementações de fabricante diretamente.

## Validar

```bash
python -m pytest -q
npm ci
npm test
python tools/sync_frontend.py --check
```

A escrita depende da sessão e da capability do provider. Uma leitura comprovada não habilita escrita desconhecida. O histórico SQLite reutiliza o repository e a redação de segredos do legado. Diagnósticos, taxas e detalhes de clientes usam respostas reais; fixtures só existem em testes.

Limitações e evidências: `docs/NETPULSE_EXECUTION_REPORT.md`.

## Terminal, Frutiger Aero e Access World 3D

Escolha a experiência no login ou altere o tema e o modo após conectar. O Aero inclui variantes próprias para tabelas, controles, modais e drawers. O mundo deriva suas regiões das rotas reais e capabilities de Huawei/ZTE ou Juniper, mantendo os mesmos painéis técnicos. Música é opcional e local; nenhuma faixa é distribuída. Instruções, suporte a GLB, áudio e limites: [docs/FRUTIGER_WORLD.md](docs/FRUTIGER_WORLD.md). Evidências: [docs/AERO_WORLD_PATCH_REPORT.md](docs/AERO_WORLD_PATCH_REPORT.md).

## Interações, rádio e arena

O menu do Mundo 3D inclui HUD imersivo, Network Ops, Router Rumble, playlist local por pasta, falas configuráveis e TV com player oficial do YouTube. Controles e limites: [docs/WORLD3D_INTERACTIONS.md](docs/WORLD3D_INTERACTIONS.md). Pesquisa e licenças: [docs/research/WORLD3D_INTERACTIONS_MEDIA_COMBAT.md](docs/research/WORLD3D_INTERACTIONS_MEDIA_COMBAT.md).
