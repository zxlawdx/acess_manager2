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

  function toast(message) {
    const host = document.querySelector('#toast-region');
    if (!host || !message) return;
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = message;
    host.append(el);
    window.setTimeout(() => el.remove(), 3600);
  }

  async function copyThroughDesktopBackend(value) {
    const text = String(value ?? '');
    if (!text) return false;
    try {
      const response = await fetch(new URL('/api/system/clipboard', window.location.origin), {
        method: 'POST',
        credentials: 'same-origin',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({text})
      });
      const data = await response.json().catch(() => ({}));
      return Boolean(response.ok && data?.success !== false);
    } catch (_) {
      return false;
    }
  }

  /* QtWebEngine in the packaged Windows build has crashed when some Juniper
     table copy buttons call navigator.clipboard.writeText(). Intercept those
     clicks in the capture phase before the view-level onclick runs and copy
     through the Python desktop backend instead. This mirrors the proven
     AtendeClip pyperclip path and keeps the WebView out of native clipboard
     ownership. */
  document.addEventListener('click', async (event) => {
    const button = event.target.closest?.('[data-copy-juniper]');
    if (!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (button.disabled) return;
    button.disabled = true;
    try {
      const ok = await copyThroughDesktopBackend(button.dataset.copyJuniper);
      toast(ok ? 'Copiado.' : 'Não foi possível copiar.');
    } finally {
      button.disabled = false;
    }
  }, true);

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
