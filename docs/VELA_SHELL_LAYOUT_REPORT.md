# Access Manager — shell Vela e editor de perfis

## Causa e correção

O Vela fixado em `175d54f8b8997c70ea34bb302acce038944c2d56` cria uma janela pywebview redimensionável, carrega `/__vela__/shell?entry=/` e usa a bridge para inserir o fragmento da rota em `<main id="vela-page">`. A rota do Access Manager usa `layout="blank"`, com topbar/sidebar do framework desativadas.

O CSS do app estilava o seletor global `main` com padding e altura `calc(100vh - 58px)`. Esse seletor atingia tanto o workspace do app quanto o `main` externo do Vela. O wrapper externo recebia o espaçamento reservado ao conteúdo e criava a moldura. O QA antigo carregava o fragmento diretamente em um body; portanto, não exercitava essa colisão estrutural.

A correção preserva a inicialização Vela/HTTP/bridge e a janela nativa. Não foram encontrados offsets internos na configuração da janela, max-width ou container centralizador no shell do app. O template continua um fragmento conforme o router, sem um segundo documento HTML.

- Shell global: `.app-shell` → `.app-topbar` e grid sidebar/workspace. Topbar e sidebar persistem enquanto o workspace muda.
- Seletores de estrutura agora são `.app-main` e `.app-sidebar`; não estilam os wrappers do framework.
- `html/body` e a cadeia `#vela-root → #vela-main → #vela-page` ocupam a área útil, sem margem/padding. O host blank tem overflow controlado e não depende das classes Tailwind para dimensões.
- O grid recebe altura do host real e usa `minmax(0,1fr)`. Sidebar e workspace ocupam o restante do shell, sem offsets de página.
- Padding apenas em `.page-content`; rolagem vertical no workspace. Nenhum `margin-left` ou largura compensatória foi acrescentado ao shell.
- Dialog nativo permanece na top layer da WebView; não é posicionado em relação ao workspace.

## Referências consultadas antes da alteração

- [Vela README da versão usada](https://github.com/zxlawdx/Vela-framework/blob/175d54f8b8997c70ea34bb302acce038944c2d56/README.md): settings, wsgi, router blank, templates e launcher.
- [Vela RUNTIME](https://github.com/zxlawdx/Vela-framework/blob/175d54f8b8997c70ea34bb302acce038944c2d56/docs/RUNTIME.md).
- Código instalado `vela/core/window.py`, `app.py`, `shell.html`, `bridge.py` e `template_engine/engine.py`: ciclo janela → shell HTTP → bridge → fragmento.
- [DFD Studio settings](https://github.com/zxlawdx/DFD-Studio/blob/main/config/settings.py), [wsgi](https://github.com/zxlawdx/DFD-Studio/blob/main/config/wsgi.py), [template](https://github.com/zxlawdx/DFD-Studio/blob/main/apps/dfd/templates/dfd/index.html) e [CSS](https://github.com/zxlawdx/DFD-Studio/blob/main/apps/dfd/static/css/app.css): shell único, topbar persistente, corpo flex com min-height zero e scroll interno.
- [Docker-Manager settings](https://github.com/zxlawdx/Docker-Manager/blob/main/config/settings.py), [wsgi](https://github.com/zxlawdx/Docker-Manager/blob/main/config/wsgi.py), [template](https://github.com/zxlawdx/Docker-Manager/blob/main/apps/dockerflow/templates/studio.html) e [CSS](https://github.com/zxlawdx/Docker-Manager/blob/main/apps/dockerflow/static/css/studio.css): estilos isolados, estrutura global própria e layout sem dependência de Tailwind. Seu root fixo foi referência de isolamento; aqui preservou-se a cadeia de tamanho do host Vela.

## Perfis

O editor remove inteiramente a seção de SSIDs individuais. Nome/senha/broadcast/WPS/isolamento continuam na tela Wi-Fi e SSIDs. A lista de perfis mostra rádios em vez de nomes de redes.

Editor: nome/descrição, DNS IPv4/IPv6 com adicionar/remover e limite de dois por família já imposto pelo provider, rádios observados com incluir/canal/largura/padrão/potência/país/canal automático, DHCP somente com capability de escrita (pool, lease e DNS). Selects exibem rótulos das opções observadas; opções ausentes permanecem desabilitadas.

Dados técnicos de perfis antigos, incluindo SSIDs, continuam preservados ao salvar; backend, preview/apply e writers não foram removidos. Header e rodapé ficam fora de `.profile-content`, que é a única região de scroll do editor. O submit no rodapé usa `form="profile-form"`.

## Validação

- `sync_frontend.py`, `collectstatic --no-tailwind`, runtime sincronizado e diff check.
- 13 testes DOM passaram; testes novos verificam ausência de SSIDs no editor, preservação de intenção antiga, rodapé fora do conteúdo e DHCP condicionado à escrita.
- Chromium portátil: navegação das views, overflow, drawer/modal e polling em 1366×768, 1600×900 e 1920×1080.
- Fluxo Vela real: `manage.py runapp` inicialmente falhou por ausência de GTK/Qt. Backend PySide6/qtpy e bibliotecas libXtst/libxkbfile foram instalados apenas no ambiente de QA, sem novas dependências do produto.
- `tests/visual/native_driver.py` executa o manage.py/runapp real com pywebview/Qt, servidor Vela, bridge real e rota blank. Um controlador localhost existe somente no processo de teste para chamar resize/restore/maximize nativos. `native.cjs` usa CDP de Qt, sem substituir bridge/router/shell; respostas de APIs de equipamento são fixtures sintéticas no teste, sem acesso a ONT.
- Qt offscreen nativo: três resoluções passaram, topbar x/y=0, sidebar x=0/bottom=altura útil, shell right/bottom=viewport, padding do host=0, sem overflow horizontal; todas as views; modal centralizado na WebView; conteúdo efetivamente rolou sem mover header/rodapé. Maximize no display offscreen de 800×800 produziu viewport 796×796 e manteve as bordas.
- Screenshots `docs/screenshots/vela/shell-*`, `profile-*` e `profile-scroll-*` foram capturados da WebView Qt real e inspecionados.
- Nenhum erro JS do Access Manager. O shell do Vela gerou o aviso preexistente `tailwind is not defined` por CDN indisponível neste ambiente; o layout corrigido funcionou sem Tailwind.
- Limite: não foi executado Windows/WebView2. A causa reproduzida é no DOM/CSS do wrapper Vela, mas confirmação específica na máquina Windows continua necessária. Qt offscreen não comprova aparência da barra de título nativa Windows.

Para repetir QA nativo, inicie `tests/visual/native_driver.py` no ambiente Qt com `QTWEBENGINE_REMOTE_DEBUGGING=9222` e execute `npm run test:visual:native`. O controlador de teste escuta apenas 127.0.0.1:9223. O fluxo normal do produto permanece:

```powershell
.\.venv\Scripts\Activate.ps1
python tools\sync_frontend.py
python manage.py collectstatic --no-tailwind
python manage.py runapp
```
