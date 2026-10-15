import {request,beginView,scopeActive,isCancelled,currentScope} from '../services/api.js';
import {store} from '../core/store.js';
import * as overview from './views/overview.js';
import * as clients from './views/clients.js';
import * as wifi from './views/wifi.js';
import * as network from './views/network.js';
import * as profiles from './views/profiles.js';
import * as management from './views/management.js';
import * as capabilities from './views/capabilities.js';
import * as traffic from './views/traffic.js';
import * as misc from './views/misc.js';
import * as completeDiagnostics from './views/complete-diagnostics.js';
import {esc,toast} from '../shared/ui.js';
import {patchHTML} from '../shared/patch.js';

let mountedRoot = null;
let workspace = null;
let connectionBusy=false;
const viewStates=new Map();

const meta = {
  overview:['VISÃO OPERACIONAL','Visão geral'], clients:['VISÃO OPERACIONAL','Clientes'],
  traffic:['VISÃO OPERACIONAL','Tráfego'], wifi:['REDE','Wi-Fi e SSIDs'], wan:['REDE','WAN'],
  lan:['REDE','LAN'], dhcpdns:['REDE','DHCP e DNS'], diagnostics:['OPERAÇÕES','Diagnóstico'],
  completeDiagnostics:['OPERAÇÕES','Diagnóstico completo'], profiles:['OPERAÇÕES','Perfis'], management:['OPERAÇÕES','Gerenciamento'],
  capabilities:['AVANÇADO','Capabilities'], deployment:['AVANÇADO','Implantação']
};
const views = {
  overview, clients, wifi, profiles, management, capabilities, completeDiagnostics,
  traffic, diagnostics:{render:misc.diagnostics,mount:misc.mountDiagnostics}, deployment:{render:misc.deployment},
  wan:{render:network.wan}, lan:{render:network.lan,mount:network.mountLan}, dhcpdns:{render:network.dhcpdns,mount:network.mountDhcpDns}
};

function syncContext() {
  const s = store.session?.session;
  const connected=Boolean(store.session?.connected);
  document.querySelector('#login-page').hidden=connected;
  document.querySelector('.login-theme').hidden=connected;
  document.querySelector('.app-shell').hidden=!connected;
  const disconnect = document.querySelector('#disconnect-button');
  const updated = document.querySelector('#ctx-updated');
  if (disconnect) disconnect.disabled = !s;
  if (updated) updated.textContent = s?.updated_at ? `Atualizado ${new Date(s.updated_at).toLocaleTimeString()}` : '—';
}

async function render(name = store.view,background=false) {
  const scope=background?currentScope():beginView(name);
  if(!background){views[store.view]?.unmount?.();const d=document.querySelector('#action-dialog');if(d?.open)d.close()}
  const state={generation:scope.generation,loading:true,error:null};viewStates.set(name,state);scope.controller.signal.addEventListener('abort',()=>{state.loading=false},{once:true});
  store.view = name;
  document.querySelectorAll('.nav').forEach(b => b.classList.toggle('active', b.dataset.view === name));
  const [kicker,title] = meta[name] || meta.overview;
  const kickerEl = document.querySelector('#page-kicker');
  const titleEl = document.querySelector('#page-title');
  if (kickerEl) kickerEl.textContent = kicker;
  if (titleEl) titleEl.textContent = title;
  document.querySelector('.page-heading').hidden=['overview','traffic','completeDiagnostics'].includes(name);

  if (!store.session?.connected && name !== 'profiles') {
    state.loading=false;
    workspace.innerHTML = '<div class="empty-state"><strong>Nenhum equipamento conectado</strong><span>Conecte-se para carregar este workspace.</span></div>';
    return;
  }

  if(!background)document.querySelector('.app-main').scrollTop=0;
  if(!background)workspace.innerHTML='<section class="panel" role="status"><p class="muted">Carregando dados…</p><div class="skeleton"></div><div class="skeleton"></div></section>';
  try {
    const view = views[name] || views.overview;
    const html=await view.render();
    if(!scopeActive(scope))return;
    state.loading=false;
    if(background)patchHTML(workspace,html);else workspace.innerHTML=html;
    view.mount?.();
  } catch (e) {
    if(!scopeActive(scope)||isCancelled(e))return;
    state.loading=false;state.error=e.message;
    workspace.innerHTML = `<div class="notice danger" role="alert">${esc(e.message)}</div>`;
  }
}

function normalizeConnectionPayload(form) {
  const fd = new FormData(form);
  const host = String(fd.get('host') || '').trim();
  const username = String(fd.get('username') || '').trim();
  const password = String(fd.get('password') || '');
  const modelHint = String(fd.get('model_hint') || '').trim();
  const https = Boolean(form.querySelector('[name="https"]')?.checked);

  return {
    host,
    username,
    password,
    https,
    model_hint: modelHint || null,
  };
}

async function connectFromForm(event) {
  event.preventDefault();
  const form = event.currentTarget;
  if (connectionBusy || !form.reportValidity()) return;
  connectionBusy=true;
  document.querySelector('#connection-feedback').textContent='';
  document.querySelector('#connection-status').textContent='Conectando…';

  const button = document.querySelector('#connect-button');
  const originalLabel = button?.textContent || 'Conectar';
  const payload = normalizeConnectionPayload(form);

  if (button) {
    button.disabled = true;
    button.textContent = 'Conectando…';
  }

  try {
    const s = await request('/api/session', {method:'POST', body:JSON.stringify(payload)});
    if (!s?.connected || !s?.session) {
      throw new Error('A API não confirmou uma sessão autenticada no equipamento.');
    }

    store.setSession(s);
    store.setCapabilities(s.session?.capabilities || {});
    syncContext();

    // Login is hidden after authentication; credentials never enter the dashboard.
    const password = form.querySelector('[name="password"]');
    if (password) password.value = '';

    toast(`Conectado via ${payload.https ? 'HTTPS' : 'HTTP'} em ${s.session.model || s.session.vendor || payload.host}.`);
    await render('overview');
  } catch (err) {
    // Em erro, nenhum campo é resetado. Isso evita redigitar IP/usuário/senha
    // ao testar HTTP vs HTTPS ou corrigir apenas uma credencial.
    document.querySelector('#connection-feedback').textContent=err?.message||'Não foi possível conectar ao equipamento.';
    document.querySelector('#connection-status').textContent='Conexão não confirmada';
    toast(err?.message || 'Não foi possível conectar ao equipamento.');
    console.error('[Access Manager] Falha de conexão:', err);
  } finally {
    connectionBusy=false;
    if (button) {
      button.disabled = false;
      button.textContent = originalLabel;
    }
  }
}

export async function mountApp() {
  const root = document.querySelector('.app-shell');
  if (!root) throw new Error('Shell do Access Manager não foi encontrado.');
  if (mountedRoot === root) return;
  mountedRoot = root;
  window.__amStore = store;
  workspace = document.querySelector('#workspace');
  if (!workspace) throw new Error('Workspace do Access Manager não foi encontrado.');

  document.querySelectorAll('.nav').forEach(b => {
    b.onclick = () => {
      document.querySelector('#sidebar')?.classList.remove('open');
      render(b.dataset.view);
    };
  });

  const mobileNav = document.querySelector('#mobile-nav');
  if (mobileNav) mobileNav.onclick = () => document.querySelector('#sidebar')?.classList.toggle('open');

  const form = document.querySelector('#connect-form');
  if (!form) throw new Error('Formulário de conexão não foi encontrado.');
  form.addEventListener('submit', connectFromForm);
  document.querySelector('[data-toggle-password]').onclick=e=>{const input=form.elements.password;input.type=input.type==='password'?'text':'password';e.currentTarget.textContent=input.type==='password'?'Mostrar':'Ocultar'};

  const disconnect = document.querySelector('#disconnect-button');
  if (disconnect) {
    disconnect.onclick = async () => {
      try { await request('/api/session', {method:'DELETE'}); }
      finally {
        store.setSession({connected:false, session:null});
        store.setCapabilities({});
        views[store.view]?.unmount?.();beginView('login');
        form.elements.password.value='';form.elements.password.type='password';
        document.querySelector('[data-toggle-password]').textContent='Mostrar';
        document.querySelector('#connection-status').textContent='Pronto para conectar';
        syncContext();
        render(store.view);
      }
    };
  }

  document.addEventListener('refresh-view', () => render(store.view));
  let refreshTimer;
  document.addEventListener('snapshot-updated',event=>{if(event.detail.generation!==currentScope()?.generation||['wifi','profiles','traffic','overview','completeDiagnostics'].includes(store.view))return;clearTimeout(refreshTimer);const scope=currentScope();refreshTimer=setTimeout(()=>{if(scopeActive(scope))render(store.view,true)},16)});

  try {
    const s = await request('/api/session');
    store.setSession(s);
    store.setCapabilities(s.session?.capabilities || {});
    syncContext();
    await render(s.connected?(currentScope()?store.view:'overview'):store.view);
  } catch (error) {
    console.error('[Access Manager] Falha ao consultar sessão inicial:', error);
    await render(store.view);
  }
}
