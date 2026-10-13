(function accessManagerBootstrap() {
  "use strict";

  const current = document.currentScript;
  if (!current || !current.src) return;

  // A rota Vela pode ser reaberta sem recarregar o shell. Evita montar duas vezes.
  const root = document.querySelector('.app-shell');
  if (!root || root.dataset.frontendBootstrapped === 'true') return;
  root.dataset.frontendBootstrapped = 'loading';

  const moduleUrl = new URL('./workspaces/app.js', current.src).href;

  // Intercepta o submit imediatamente. Assim, mesmo se um import modular falhar,
  // o navegador não navega/recarrega a rota e não apaga as credenciais digitadas.
  const form = document.querySelector('#connect-form');
  let emergencyHandler = null;
  if (form) {
    emergencyHandler = function (event) {
      event.preventDefault();
    };
    form.addEventListener('submit', emergencyHandler);
  }

  import(moduleUrl)
    .then(function (mod) {
      if (typeof mod.mountApp !== 'function') {
        throw new Error('O módulo principal não exporta mountApp().');
      }
      return mod.mountApp();
    })
    .then(function () {
      if (form && emergencyHandler) form.removeEventListener('submit', emergencyHandler);
      root.dataset.frontendBootstrapped = 'true';
    })
    .catch(function (error) {
      root.dataset.frontendBootstrapped = 'failed';
      console.error('[Access Manager] Falha ao iniciar frontend:', error);
      const workspace = document.querySelector('#workspace');
      if (workspace) {
        workspace.innerHTML = '<div class="notice danger" role="alert"><strong>Falha ao iniciar o frontend.</strong><br>' +
          'Abra o console da WebView para detalhes. O formulário foi bloqueado para evitar recarregar e apagar os campos.</div>';
      }
    });
})();
