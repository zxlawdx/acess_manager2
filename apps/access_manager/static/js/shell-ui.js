(function accessManagerShellUI() {
  'use strict';

  const root = document.documentElement;
  const shell = document.querySelector('.app-shell');
  const sidebar = document.querySelector('#sidebar');
  const navToggle = document.querySelector('#mobile-nav');
  if (!shell || !sidebar || !navToggle) return;

  /* The terminal design system is intentionally dark-only. Remove ambiguity
     from previously persisted light/dark preferences without touching any
     application/session state. */
  root.dataset.theme = 'terminal';
  root.style.colorScheme = 'dark';
  try { window.localStorage.removeItem('access-manager.theme'); } catch (_) {}
  document.querySelector('.shell-theme-toggle')?.remove();

  const desktop = window.matchMedia('(min-width: 781px)');
  const SIDEBAR_KEY = 'access-manager.sidebar-collapsed';

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

  /* app.js still owns the mobile drawer click. This additional listener only
     manages the persistent compact desktop state. */
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

  /* Juniper navigation is inserted dynamically after mountApp(); re-decorate it
     without coupling this shell controller to the infrastructure module. */
  new MutationObserver(() => {
    decorateNavigation();
    syncNavigationToggle();
  }).observe(sidebar, {childList: true, subtree: true});

  decorateNavigation();
  applyStoredSidebarState();
  syncConnectionA11y();
})();
