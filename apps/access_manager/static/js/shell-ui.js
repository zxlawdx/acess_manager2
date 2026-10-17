(function accessManagerShellUI() {
  'use strict';

  const root = document.documentElement;
  const shell = document.querySelector('.app-shell');
  const sidebar = document.querySelector('#sidebar');
  const navToggle = document.querySelector('#mobile-nav');
  const disconnect = document.querySelector('#disconnect-button');
  if (!shell || !sidebar || !navToggle) return;

  const desktop = window.matchMedia('(min-width: 781px)');
  const darkPreference = window.matchMedia('(prefers-color-scheme: dark)');
  const SIDEBAR_KEY = 'access-manager.sidebar-collapsed';
  const THEME_KEY = 'access-manager.theme';

  function safeRead(key) {
    try { return window.localStorage.getItem(key); } catch (_) { return null; }
  }

  function safeWrite(key, value) {
    try { window.localStorage.setItem(key, value); } catch (_) {}
  }

  function navLabel(button) {
    return button.querySelector('span')?.textContent?.trim() || button.textContent?.trim() || 'Navegação';
  }

  function decorateNavigation() {
    sidebar.querySelectorAll('.nav').forEach((button) => {
      const label = navLabel(button);
      button.title = label;
      if (!button.getAttribute('aria-label')) button.setAttribute('aria-label', label);
    });
  }

  function syncNavigationToggle() {
    const collapsed = desktop.matches && shell.classList.contains('sidebar-collapsed');
    const open = !desktop.matches && sidebar.classList.contains('open');
    navToggle.setAttribute('aria-controls', 'sidebar');
    navToggle.setAttribute('aria-expanded', String(desktop.matches ? !collapsed : open));
    navToggle.setAttribute(
      'aria-label',
      desktop.matches
        ? (collapsed ? 'Expandir navegação' : 'Recolher navegação')
        : (open ? 'Fechar navegação' : 'Abrir navegação')
    );
    navToggle.title = navToggle.getAttribute('aria-label');
  }

  function applyStoredSidebarState() {
    if (!desktop.matches) {
      shell.classList.remove('sidebar-collapsed');
      syncNavigationToggle();
      return;
    }
    const collapsed = safeRead(SIDEBAR_KEY) === 'true';
    shell.classList.toggle('sidebar-collapsed', collapsed);
    sidebar.classList.remove('open');
    syncNavigationToggle();
  }

  /* app.js already owns the mobile drawer through onclick. This listener adds
     the desktop compact state without replacing that existing handler. */
  navToggle.addEventListener('click', () => {
    if (desktop.matches) {
      shell.classList.toggle('sidebar-collapsed');
      sidebar.classList.remove('open');
      safeWrite(SIDEBAR_KEY, String(shell.classList.contains('sidebar-collapsed')));
    }
    window.requestAnimationFrame(syncNavigationToggle);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || desktop.matches || !sidebar.classList.contains('open')) return;
    sidebar.classList.remove('open');
    syncNavigationToggle();
    navToggle.focus();
  });

  document.addEventListener('click', (event) => {
    if (desktop.matches || !sidebar.classList.contains('open')) return;
    if (sidebar.contains(event.target) || navToggle.contains(event.target)) return;
    sidebar.classList.remove('open');
    syncNavigationToggle();
  });

  desktop.addEventListener?.('change', applyStoredSidebarState);

  const themeButton = document.createElement('button');
  themeButton.type = 'button';
  themeButton.className = 'button secondary shell-theme-toggle';
  themeButton.setAttribute('aria-label', 'Alternar tema claro e escuro');
  themeButton.title = 'Alternar tema claro e escuro';

  function requestedTheme() {
    const stored = safeRead(THEME_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    return darkPreference.matches ? 'dark' : 'light';
  }

  function applyTheme(theme, persist) {
    const next = theme === 'dark' ? 'dark' : 'light';
    root.dataset.theme = next;
    root.style.colorScheme = next;
    themeButton.textContent = next === 'dark' ? 'Tema: escuro' : 'Tema: claro';
    themeButton.setAttribute('aria-pressed', String(next === 'dark'));
    if (persist) safeWrite(THEME_KEY, next);
  }

  themeButton.addEventListener('click', () => {
    applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', true);
  });

  if (disconnect?.parentNode) disconnect.parentNode.insertBefore(themeButton, disconnect);
  applyTheme(requestedTheme(), false);

  darkPreference.addEventListener?.('change', (event) => {
    if (!safeRead(THEME_KEY)) applyTheme(event.matches ? 'dark' : 'light', false);
  });

  function syncConnectionA11y() {
    const status = document.querySelector('#ctx-status');
    if (!status) return;
    const text = status.textContent?.replace(/[●○]/g, '').trim() || 'Estado desconhecido';
    status.setAttribute('aria-label', `Estado da conexão: ${text}`);
  }

  const status = document.querySelector('#ctx-status');
  if (status) {
    new MutationObserver(syncConnectionA11y).observe(status, {
      childList: true,
      characterData: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-health']
    });
  }

  new MutationObserver(() => {
    decorateNavigation();
    syncNavigationToggle();
  }).observe(sidebar, {childList: true, subtree: true});

  decorateNavigation();
  applyStoredSidebarState();
  syncConnectionA11y();
})();
