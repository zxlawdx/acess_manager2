import {mountWorldBridge} from '../world/bridge.js';
import {request,beginView,scopeActive,isCancelled,currentScope} from '../services/api.js';
import {store} from '../core/store.js';
import * as juniper from './views/juniper.js';
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
import {esc,toast,dialog} from '../shared/ui.js';
import {patchHTML} from '../shared/patch.js';

let mountedRoot = null;
let workspace = null;
let connectionBusy=false;
let infrastructureSettings={};
const viewStates=new Map();

const meta = {juniperOverview:['JUNIPER','Visão geral'],subscribers:['JUNIPER','Assinantes PPPoE'],juniperInterfaces:['JUNIPER','Interfaces'],juniperSystem:['JUNIPER','Sistema'],juniperDiagnostics:['JUNIPER','Diagnóstico'],
  overview:['VISÃO OPERACIONAL','Visão geral'], clients:['VISÃO OPERACIONAL','Clientes'],
  traffic:['VISÃO OPERACIONAL','Tráfego'], wifi:['REDE','Wi-Fi e SSIDs'], wan:['REDE','WAN'],
  lan:['REDE','LAN'], dhcpdns:['REDE','DHCP e DNS'], diagnostics:['OPERAÇÕES','Diagnóstico'],
  completeDiagnostics:['OPERAÇÕES','Diagnóstico completo'], profiles:['OPERAÇÕES','Perfis'], management:['OPERAÇÕES','Gerenciamento'],
  capabilities:['AVANÇADO','Capabilities'], deployment:['AVANÇADO','Implantação']
};
Object.assign(meta,Object.fromEntries(Object.entries(juniper.titles).map(([key,[group,title]])=>[key,[`Infraestrutura / Juniper / ${group}`,title]])));
meta.subscribers[1]='Assinantes PPPoE';
const juniperRoutes=Object.fromEntries(Object.keys(juniper.titles).map(key=>[key,juniper.routeView(key)]));
const views = {
  ...juniperRoutes,overview, clients, wifi, profiles, management, capabilities, completeDiagnostics,
  traffic, diagnostics:{render:misc.diagnostics,mount:misc.mountDiagnostics}, deployment:{render:misc.deployment},
  wan:{render:network.wan}, lan:{render:network.lan}, dhcpdns:{render:network.dhcpdns,mount:network.mountDhcpDns}
};

function syncContext() {
  const s = store.session?.session;
  const connected=Boolean(store.session?.connected);
  const infrastructure=s?.vendor==='juniper';
  document.querySelector('.app-shell').classList.toggle('juniper-shell',infrastructure);
  document.querySelector('#action-dialog').classList.toggle('juniper-surface',infrastructure);
  document.querySelectorAll('#sidebar .nav,#sidebar .nav-group,#sidebar .juniper-nav-group').forEach(element=>{element.hidden=infrastructure?!element.hasAttribute('data-juniper-nav'):element.hasAttribute('data-juniper-nav')});
  document.querySelector('#login-page').hidden=connected;
  document.querySelector('.app-shell').hidden=!connected;
  let back=document.querySelector('#return-subscriber');
  if(!back){back=document.createElement('button');back.id='return-subscriber';back.className='button';back.textContent='Voltar ao assinante';document.querySelector('#disconnect-button').before(back);back.onclick=async()=>{try{const s=await request('/api/session/select',{method:'POST',body:JSON.stringify({kind:'infrastructure'})});store.setSession(s);store.setCapabilities(s.session?.capabilities||{});syncContext();await render('subscribers')}catch(e){toast(e.message)}}}
  back.hidden=infrastructure||!store.session?.infrastructure?.connected;
  const disconnect = document.querySelector('#disconnect-button');
  const updated = document.querySelector('#ctx-updated');
  if (disconnect) disconnect.disabled = !s;
  if (updated) updated.textContent = s?.updated_at ? `Atualizado ${new Date(s.updated_at).toLocaleTimeString()}` : '—';
}

async function render(name = store.view,background=false) {
  if(store.session?.session?.vendor==='juniper'&&!Object.hasOwn(juniperRoutes,name))name='juniperOverview';
  else if(store.session?.session?.vendor!=='juniper'&&Object.hasOwn(juniperRoutes,name))name='overview';
  const scope=background?currentScope():beginView(name);
  if(!background){views[store.view]?.unmount?.();const d=document.querySelector('#action-dialog');if(d?.open)d.close()}
  const state={generation:scope.generation,loading:true,error:null};viewStates.set(name,state);scope.controller.signal.addEventListener('abort',()=>{state.loading=false},{once:true});
  store.view = name;
  document.querySelectorAll('.nav').forEach(b => {const active=b.dataset.view===name;b.classList.toggle('active',active);if(active){b.setAttribute('aria-current','page');const group=b.closest('details');if(group)group.open=true}else b.removeAttribute('aria-current')});
  const [kicker,title] = meta[name] || meta.overview;
  const kickerEl = document.querySelector('#page-kicker');
  const titleEl = document.querySelector('#page-title');
  if(kickerEl){if(Object.hasOwn(juniperRoutes,name))kickerEl.innerHTML=`<button class="j-crumb" data-juniper-route="juniperOverview">Infraestrutura</button> / <button class="j-crumb" data-juniper-route="juniperOverview">Juniper</button> / ${esc(juniper.titles[name][0])}`;else kickerEl.textContent=kicker}
  if (titleEl) titleEl.textContent = title;
  document.querySelector('.page-heading').hidden=['overview','traffic','completeDiagnostics'].includes(name);

  if (!store.session?.connected && name !== 'profiles') {
    state.loading=false;
    workspace.innerHTML = '<div class="empty-state"><strong>Nenhum equipamento conectado</strong><span>Conecte-se para carregar este workspace.</span></div>';
    return;
  }

  if(!background)document.querySelector('.app-main').scrollTop=0;
  let waitTimer;
  if(!background){
    workspace.innerHTML=Object.hasOwn(juniperRoutes,name)?'<section class="panel j-wait" role="status"><p data-wait-label>Consultando Juniper…</p><div class="skeleton"></div><button class="button" data-cancel-wait>Cancelar espera</button></section>':'<section class="panel" role="status"><p class="muted">Carregando dados…</p><div class="skeleton"></div><div class="skeleton"></div></section>';
    const cancel=workspace.querySelector('[data-cancel-wait]');
    if(cancel){waitTimer=setTimeout(()=>{if(scopeActive(scope)&&state.loading){const label=workspace.querySelector('[data-wait-label]');if(label)label.textContent='A consulta ainda está em andamento…'}},4000);cancel.onclick=()=>{scope.controller.abort();clearTimeout(waitTimer);workspace.innerHTML='<section class="panel j-wait"><p>Espera cancelada. O comando remoto pode continuar em execução.</p><button class="button" data-resume-read>Consultar novamente</button></section>';workspace.querySelector('[data-resume-read]').onclick=()=>render(name)}}
  }
  try {
    const view = views[name] || views.overview;
    const html=await view.render();
    if(!scopeActive(scope))return;
    state.loading=false;clearTimeout(waitTimer);
    if(background)patchHTML(workspace,html);else workspace.innerHTML=html;
    view.mount?.();
  } catch (e) {
    clearTimeout(waitTimer);
    if(!scopeActive(scope)||isCancelled(e))return;
    state.loading=false;state.error=e.message;
    clearTimeout(waitTimer);
    if(Object.hasOwn(juniperRoutes,name)){workspace.innerHTML=juniper.errorMarkup(e);juniper.wireRetry(workspace,()=>render(name))}
    else workspace.innerHTML = `<div class="notice danger" role="alert">${esc(e.message)}</div>`;
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
    ...(fd.get('vendor')==='juniper'?{vendor:'juniper',transport:fd.get('transport')||'netconf',port:fd.get('port')||null,ssh_port:fd.get('ssh_port'),netconf_port:fd.get('netconf_port')}:{}),
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
    if(payload.vendor==='juniper'){infrastructureSettings={...infrastructureSettings,last_successful_host:payload.host,ssh_port:payload.ssh_port,netconf_port:payload.netconf_port,preferred_transport:payload.transport}}
    store.setCapabilities(s.session?.capabilities || {});
    syncContext();

    // Login is hidden after authentication; credentials never enter the dashboard.
    const password = form.querySelector('[name="password"]');
    if (password) password.value = '';

    toast(`Conectado via ${payload.vendor==='juniper'?(s.session.protocol_family||'SSH'):(payload.https ? 'HTTPS' : 'HTTP')} em ${s.session.model || s.session.vendor || payload.host}.`);
    await render('overview');
  } catch (err) {
    // Infrastructure credentials are never retained after an attempt.
    document.querySelector('#connection-feedback').textContent=err?.message||'Não foi possível conectar ao equipamento.';
    document.querySelector('#connection-status').textContent='Conexão não confirmada';
    toast(err?.message || 'Não foi possível conectar ao equipamento.');
    console.error('[Access Manager] Falha de conexão:', err);
  } finally {
    connectionBusy=false;
    if(payload.vendor==='juniper')form.elements.password.value='';
    payload.password='';
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

  mountWorldBridge({store,navigate:name=>render(name),suspend:()=>{views[store.view]?.unmount?.();beginView('world')},resume:()=>render(store.view)});

  const oldNav=document.querySelectorAll('[data-juniper-nav]');oldNav.forEach(n=>n.remove());
  document.querySelector('#sidebar').insertAdjacentHTML('afterbegin',juniper.navigation.map(([group,items],index)=>`<details class="juniper-nav-group" data-juniper-nav hidden ${index<2?'open':''}><summary>${esc(group)}</summary>${items.map(([route,label])=>`<button class="nav" data-juniper-nav data-view="${route}" hidden><span>${esc(label)}</span></button>`).join('')}</details>`).join(''));
  document.querySelector('#juniper-help').onclick=()=>dialog('Ajuda · Juniper / Junos BNG','<p>Busque o contrato, selecione uma sessão e consulte detalhes sem sair da lista. Leituras avançadas são feitas sob demanda.</p><p>O acesso ao CPE usa credenciais separadas. Voltar ao assinante mantém a sessão Juniper; portas inacessíveis não confirmam assinante offline.</p>');
  document.addEventListener('juniper-navigate',event=>render(event.detail));
  document.addEventListener('click',event=>{const b=event.target.closest('[data-juniper-route]');if(b)render(b.dataset.juniperRoute)});
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
  try{infrastructureSettings=await request('/api/infrastructure/settings')}catch{}
  const syncVendor=event=>{const juniper=form.elements.vendor.value==='juniper';document.querySelector('#juniper-connection').hidden=!juniper;form.querySelector('.https-toggle').hidden=juniper;
   document.querySelector('#login-page').classList.toggle('infrastructure-login',juniper);document.querySelector('#action-dialog').classList.toggle('juniper-surface',juniper);
   form.elements.password.autocomplete=juniper?'off':'current-password';form.elements.username.autocomplete=juniper?'off':'username';
   form.querySelector('[for=connection-host]').textContent=juniper?'Servidor':'IP ou IP:porta';
   form.querySelector('[for=connection-user]').textContent=juniper?'Usuário AD':'Usuário';form.querySelector('[for=connection-password]').textContent=juniper?'Senha AD':'Senha';
   if(juniper){if(event?.type==='change'||!form.elements.host.value)form.elements.host.value=infrastructureSettings.last_successful_host||infrastructureSettings.default_host||'';form.elements.ssh_port.value=infrastructureSettings.ssh_port||22;form.elements.netconf_port.value=infrastructureSettings.netconf_port||830;form.elements.transport.value=infrastructureSettings.preferred_transport||'ssh'}
   document.querySelector('.connection-security').textContent=juniper?'Use sua conta corporativa no Junos. A senha é descartada após cada tentativa.':'As credenciais são usadas na sessão com o equipamento. Selecione HTTPS quando disponível.'};
  form.elements.vendor.onchange=syncVendor;syncVendor();
  document.querySelector('#inspect-host-key').onclick=async()=>{
   try{const info=await request('/api/infrastructure/host-key',{method:'POST',body:JSON.stringify({host:store.session?.connected&&store.session.session?.vendor==='juniper'?store.session.session.host:form.elements.host.value,port:form.elements.transport.value==='netconf'?form.elements.netconf_port.value:form.elements.ssh_port.value})});
    const d=dialog('Identidade SSH do servidor',`<div class="j-trust-body"><div class="j-trust-alert ${info.status==='HOST_KEY_CHANGED'?'changed':''}" role="alert"><strong>${info.status==='HOST_KEY_CHANGED'?'A chave SSH apresentada pelo servidor mudou':info.status==='HOST_KEY_TRUSTED'?'Chave SSH reconhecida':'Primeiro acesso a este servidor'}</strong><p>Compare a impressão digital com uma fonte confiável antes de aceitar. Uma chave alterada bloqueia a conexão.</p></div><dl class="j-kv"><div><dt>Servidor</dt><dd>${esc(info.host)}:${esc(info.port)}</dd></div><div><dt>Algoritmo</dt><dd>${esc(info.algorithm||'—')}</dd></div><div><dt>Fingerprint apresentado</dt><dd>${esc(info.fingerprint)}</dd></div>${info.previous_fingerprints.length?`<div><dt>Fingerprints anteriores</dt><dd>${info.previous_fingerprints.map(esc).join(', ')}</dd></div>`:''}</dl></div>`,`<button class="button primary" data-trust-key>Confirmei a identidade — confiar nesta chave</button>`);
    d.querySelector('[data-trust-key]').onclick=async event=>{event.currentTarget.disabled=true;try{await request('/api/infrastructure/host-key/trust',{method:'POST',body:JSON.stringify({...info,confirm:true})});d.close();toast('Chave confiável para este servidor e porta.')}catch(e){toast(e.message);if(d.open)event.currentTarget.disabled=false}};
   }catch(e){toast(e.message)}
  };

  document.querySelector('[data-toggle-password]').onclick=e=>{const input=form.elements.password;input.type=input.type==='password'?'text':'password';e.currentTarget.textContent=input.type==='password'?'Mostrar':'Ocultar'};

  const disconnect = document.querySelector('#disconnect-button');
  if (disconnect) {
    disconnect.onclick = async () => {
      let remaining;
      try { remaining=await request('/api/session', {method:'DELETE'}); }
      finally {
        store.setSession(remaining?.session?remaining:{connected:false, session:null});
        store.setCapabilities(remaining?.session?.capabilities||{});
        views[store.view]?.unmount?.();beginView('login');
        form.elements.password.value='';form.elements.password.type='password';
        document.querySelector('[data-toggle-password]').textContent='Mostrar';
        document.querySelector('#connection-status').textContent='Pronto para conectar';
        syncContext();
        render(store.view);
      }
    };
  }

  document.addEventListener('session-selected',event=>{store.setSession(event.detail);store.setCapabilities(event.detail.session?.capabilities||{});syncContext();render('overview')});
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
