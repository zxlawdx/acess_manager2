(function accessManagerRuntime() {
  'use strict';

  const root = document.querySelector('.app-shell');
  if (!root || root.dataset.runtimeMounted === 'true') return;
  root.dataset.runtimeMounted = 'loading';

  const esc = (value) => String(value ?? '—').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

  const pick = (obj, ...keys) => {
    for (const key of keys) {
      const value = obj && obj[key];
      if (value !== undefined && value !== null && value !== '') return value;
    }
    return '—';
  };

  const badge = (value, kind = 'info') => `<span class="badge ${kind}">${esc(value)}</span>`;
  const metric = (label, value, detail = '') => `<article class="metric"><label>${esc(label)}</label><strong>${esc(value)}</strong>${detail ? `<small>${esc(detail)}</small>` : ''}</article>`;
  const kv = (data) => {
    const items = Object.entries(data || {}).filter(([, v]) => v !== undefined && v !== null && typeof v !== 'object');
    return `<div class="kv-grid">${items.map(([k, v]) => `<div class="kv"><label>${esc(k.replaceAll('_', ' '))}</label><span>${esc(typeof v === 'boolean' ? (v ? 'Sim' : 'Não') : v)}</span></div>`).join('')}</div>`;
  };
  const table = (columns, rows, empty = 'Nenhum registro encontrado') => {
    if (!Array.isArray(rows) || !rows.length) return `<div class="empty-state"><span>${esc(empty)}</span></div>`;
    return `<div class="panel"><table class="data-table"><thead><tr>${columns.map((c) => `<th>${esc(c.label)}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${columns.map((c) => `<td>${c.render ? c.render(r) : esc(pick(r, ...(c.keys || [c.key])))}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  };

  async function request(path, options = {}) {
    const url = new URL(path, window.location.origin);
    const response = await fetch(url, {
      credentials: 'same-origin',
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    const text = await response.text();
    let data = {};
    if (text) {
      try { data = JSON.parse(text); }
      catch (_) { data = {raw: text}; }
    }
    if (!response.ok) {
      throw new Error(data?.error?.message || data?.message || `HTTP ${response.status} ao acessar ${url.pathname}`);
    }
    if (data?.success === false) {
      throw new Error(data?.error?.message || 'Falha na operação');
    }
    return data;
  }

  function toast(message) {
    const host = document.querySelector('#toast-region');
    if (!host) return;
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = message;
    host.append(el);
    setTimeout(() => el.remove(), 3600);
  }

  function dialog(title, content, actions = '') {
    const d = document.querySelector('#action-dialog');
    const body = document.querySelector('#dialog-body');
    if (!d || !body) return null;
    body.innerHTML = `<div class="dialog-inner"><div class="dialog-header"><h2 id="dialog-title">${esc(title)}</h2><button class="icon-button" data-close-dialog aria-label="Fechar">×</button></div>${content}${actions ? `<div class="dialog-footer">${actions}</div>` : ''}</div>`;
    const close = d.querySelector('[data-close-dialog]');
    if (close) close.onclick = () => d.close();
    d.showModal();
    return d;
  }

  const store = {
    session: null,
    capabilities: {},
    view: 'overview',
    setSession(value) {
      this.session = value;
      renderContext();
    },
    setCapabilities(value) {
      this.capabilities = value || {};
      document.dispatchEvent(new CustomEvent('capabilities'));
    },
  };
  window.__amStore = store;

  function renderContext() {
    const s = store.session && store.session.session;
    const vendor = document.querySelector('#ctx-vendor');
    const model = document.querySelector('#ctx-model');
    const host = document.querySelector('#ctx-host');
    const status = document.querySelector('#ctx-status');
    if (vendor) vendor.textContent = s?.vendor?.toUpperCase() || '—';
    if (model) model.textContent = s?.model || 'Sem equipamento';
    const scheme = s?.metadata?.scheme;
    if (host) host.textContent = s?.host ? (scheme ? `${scheme}://${s.host}` : s.host) : '—';
    const online = Boolean(store.session && store.session.connected);
    if (status) {
      status.textContent = online ? '● Online' : '○ Desconectado';
      status.style.color = online ? 'var(--success)' : '';
    }
  }

  function cap(feature) {
    return store.capabilities?.[feature] || {read: 'UNKNOWN', write: 'UNKNOWN', enabled: {read: false, write: false}, evidence: 'UNKNOWN'};
  }
  const capBadge = (state) => badge(state, state === 'SUPPORTED' ? 'ok' : (state === 'PARTIAL' || state === 'UNKNOWN') ? 'warn' : 'bad');

  const views = {
    async overview() {
      const [device, wan, optical, clients] = await Promise.all([
        request('/api/device'),
        request('/api/device/wan'),
        request('/api/device/optical').catch(() => null),
        request('/api/device/clients'),
      ]);
      const w = Array.isArray(wan) ? (wan[0] || {}) : (wan || {});
      const o = optical || {};
      return `<div class="grid">${metric('Internet', pick(w, 'status', 'connection_status', 'Status'))}${metric('IP WAN', pick(w, 'ip', 'ipv4', 'IPAddress'))}${metric('Clientes', Array.isArray(clients) ? clients.length : '—')}${metric('RX óptico', pick(o, 'rx', 'rx_power', 'RxPower', 'rx_dbm'), 'dBm quando disponível')}</div><div class="split"><section class="panel"><div class="panel-header"><h2>Equipamento</h2>${badge(pick(device, 'fabricante', 'vendor', 'manufacturer'))}</div>${kv(device)}</section><section class="panel"><div class="panel-header"><h2>WAN</h2></div>${kv(w)}</section></div>`;
    },
    async clients() {
      const rows = await request('/api/device/clients');
      return table([
        {label: 'Status', render: (r) => badge(pick(r, 'status', 'estado', 'online') === false ? 'Offline' : 'Online', pick(r, 'status', 'estado', 'online') === false ? 'bad' : 'ok')},
        {label: 'Hostname', keys: ['hostname', 'HostName', 'nome']},
        {label: 'IP', keys: ['ip', 'IPAddr', 'IPAddress']},
        {label: 'MAC', keys: ['mac', 'MACAddr', 'MACAddress']},
        {label: 'Conexão', keys: ['connection_type', 'tipo', 'interface']},
        {label: 'SSID / porta', keys: ['ssid', 'SSID', 'port', 'porta']},
        {label: 'Band', keys: ['band', 'banda']},
        {label: 'RSSI', keys: ['rssi', 'RSSI']},
      ], rows, 'Nenhum cliente retornado pelo firmware.');
    },
    async traffic() {
      const d = await request('/api/device/traffic');
      const sources = Array.isArray(d?.sources) ? d.sources : [];
      const rows = sources.map((r) => ({source:r.source, identity:r.identity, ...(r.counters || {})}));
      return `<section class="panel"><div class="panel-header"><h2>Tráfego</h2><span class="muted">${d?.supported ? 'Contadores ativos' : 'Fonte parcial'}</span></div>${d?.reason ? `<div class="notice warning">${esc(d.reason)}</div>` : ''}</section>${table([{label:'Fonte',keys:['source']},{label:'Interface/cliente',keys:['identity']},{label:'RX bytes',keys:['rx_bytes','BytesReceived']},{label:'TX bytes',keys:['tx_bytes','BytesSent']},{label:'RX packets',keys:['rx_packets','PacketsReceived']},{label:'TX packets',keys:['tx_packets','PacketsSent']}], rows, 'Nenhum contador ativo retornado; as superfícies WAN/LAN continuam disponíveis abaixo.')}${d?.wan ? objectPanel('WAN / contadores', Array.isArray(d.wan) ? (d.wan[0] || {}) : d.wan) : ''}${d?.lan ? objectPanel('LAN / contadores', Array.isArray(d.lan) ? (d.lan[0] || {}) : d.lan) : ''}`;
    },
    async wifi() {
      const data = await request('/api/device/wifi');
      const nets = Array.isArray(data) ? data : (data?.networks || []);
      const radios = data?.radios || [];
      const editButton = (r) => {
        const id = pick(r, 'id', '_InstID', 'ssid_id');
        const edit = cap('wifi').enabled?.write ? `<button class="button" data-edit-ssid="${esc(id)}" data-current-ssid="${esc(pick(r, 'ssid', 'ESSID', 'name'))}">Editar</button>` : '<span class="muted">Somente leitura</span>';
        const reveal = cap('wifi').enabled?.read ? `<button class="button" data-reveal-wifi="${esc(id)}">Ver senha</button>` : '';
        return `<div class="inline-actions">${reveal}${edit}</div>`;
      };
      return `<section class="panel"><div class="panel-header"><h2>Redes Wi-Fi</h2><span class="muted">Escrita: ${esc(cap('wifi').write)}</span></div></section>${table([
        {label: 'SSID', keys: ['ssid', 'ESSID', 'name']},
        {label: 'Band', keys: ['band', 'banda', 'WLANViewName']},
        {label: 'Ativo', render: (r) => String(pick(r, 'enabled', 'Enable'))},
        {label: 'Canal', keys: ['channel', 'canal']},
        {label: 'Clientes', keys: ['clients', 'client_count']},
        {label: '', render: editButton},
      ], nets, 'Nenhum SSID retornado.')}<section class="panel"><div class="panel-header"><h2>Rádios</h2></div>${Array.isArray(radios) && radios.length ? radios.map((r) => `<div style="margin-bottom:8px">${kv(r)}</div>`).join('') : '<span class="muted">Sem dados de rádio.</span>'}</section>`;
    },
    async wan() {
      const d = await request('/api/device/wan');
      if (Array.isArray(d)) return table([
        {label: 'Status', keys: ['status', 'connection_status']},
        {label: 'Serviço', keys: ['service', 'ServiceList']},
        {label: 'VLAN', keys: ['vlan', 'VLANID']},
        {label: 'IPv4', keys: ['ip', 'IPAddress']},
        {label: 'Gateway', keys: ['gateway', 'Gateway']},
        {label: 'DNS', keys: ['dns', 'DNSServers']},
      ], d);
      return objectPanel('WAN', d);
    },
    async lan() {
      const d = await request('/api/device/lan');
      return table([
        {label: 'Porta', keys: ['port', 'porta', 'name']},
        {label: 'Estado', keys: ['status', 'state', 'estado']},
        {label: 'Speed', keys: ['speed', 'velocidade']},
        {label: 'Duplex', keys: ['duplex']},
        {label: 'Cliente', keys: ['client', 'cliente', 'mac']},
      ], Array.isArray(d) ? d : (d?.ports || []), 'Nenhuma porta LAN foi fornecida pelo firmware.');
    },
    async dhcpdns() {
      const [dhcp, dns] = await Promise.all([request('/api/device/dhcp'), request('/api/device/dns')]);
      return `<div class="split">${objectPanel('DHCP', dhcp?.basic || dhcp)}${objectPanel('DNS', dns)}</div>`;
    },
    async diagnostics() {
      const enabled = cap('diagnostics').enabled?.write;
      return `<section class="panel"><div class="panel-header"><div><h2>Diagnóstico</h2><span class="muted">Provider-neutral; o backend seleciona o protocolo do equipamento.</span></div>${capBadge(cap('diagnostics').write)}</div><div class="split"><form id="ping-form" class="form-grid"><div class="field"><label>Ping</label><input name="host" value="8.8.8.8" required></div><div class="field"><label>Repetições</label><input name="count" type="number" min="1" max="20" value="4"></div><button class="button primary" type="submit" ${enabled?'':'disabled'}>Executar ping</button></form><form id="trace-form" class="form-grid"><div class="field"><label>Traceroute</label><input name="host" value="8.8.8.8" required></div><button class="button primary" type="submit" ${enabled?'':'disabled'}>Executar traceroute</button></form></div><div id="diagnostic-result" class="panel muted">O resultado será exibido aqui.</div></section>`;
    },
    async profiles() {
      const rows = await request('/api/profiles');
      return `<section class="panel"><div class="panel-header"><div><h2>Perfis</h2><span class="muted">Intenção provider-neutral; endpoints não são armazenados.</span></div><button class="button primary" id="new-profile">Novo perfil</button></div></section>${table([
        {label: 'Nome', keys: ['name']},
        {label: 'Descrição', keys: ['description']},
        {label: 'Wi-Fi', render: (r) => Object.keys(r.wifi || {}).join(', ') || '—'},
        {label: 'DNS', render: (r) => Object.keys(r.dns || {}).length ? 'Configurado' : '—'},
        {label: '', render: (r) => `<div class="inline-actions"><button class="button" data-preview-profile="${esc(r.name)}">Preview</button><button class="button primary" data-apply-profile="${esc(r.name)}">Aplicar</button></div>`},
      ], rows, 'Nenhum perfil salvo.')}`;
    },
    async management() {
      const reboot = cap('reboot');
      return `<section class="panel"><div class="panel-header"><div><h2>Gerenciamento</h2><span class="muted">Operações de manutenção do provider ativo.</span></div></div><div class="capability-row"><strong>Reiniciar equipamento</strong>${capBadge(reboot.read)}${capBadge(reboot.write)}<button id="reboot-button" class="button danger" ${reboot.enabled?.write ? '' : 'disabled'}>Reiniciar</button></div><div class="notice warning">Factory reset, firmware update e restore só aparecem em fluxo dedicado e com evidência suficiente.</div></section>`;
    },
    async capabilities() {
      const rows = Object.entries(store.capabilities || {});
      return `<section class="panel"><div class="panel-header"><div><h2>Capabilities</h2><span class="muted">Suporte e evidência são estados separados.</span></div></div>${rows.length ? rows.map(([name, c]) => `<div class="capability-row"><strong>${esc(name)}</strong>${capBadge(c.read)}${capBadge(c.write)}<span class="muted">${esc(c.evidence)}${c.source ? ` · ${esc(c.source)}` : ''}</span></div>`).join('') : '<div class="empty-state"><span>Sem capabilities na sessão.</span></div>'}</section>`;
    },
    async deployment() {
      return '<section class="panel"><div class="panel-header"><h2>Implantação</h2></div><div class="notice warning">Workspace destinado a modelo/firmware desconhecido ou capability candidata. Ele não é uma autorização de escrita para operações já suportadas.</div></section>';
    },
  };

  const objectPanel = (title, data) => `<section class="panel"><div class="panel-header"><h2>${esc(title)}</h2></div>${kv(Array.isArray(data) ? (data[0] || {}) : (data || {}))}</section>`;

  const meta = {
    overview: ['VISÃO OPERACIONAL', 'Visão geral'], clients: ['VISÃO OPERACIONAL', 'Clientes'],
    traffic: ['VISÃO OPERACIONAL', 'Tráfego'], wifi: ['REDE', 'Wi-Fi e SSIDs'], wan: ['REDE', 'WAN'],
    lan: ['REDE', 'LAN'], dhcpdns: ['REDE', 'DHCP e DNS'], diagnostics: ['OPERAÇÕES', 'Diagnóstico'],
    profiles: ['OPERAÇÕES', 'Perfis'], management: ['OPERAÇÕES', 'Gerenciamento'],
    capabilities: ['AVANÇADO', 'Capabilities'], deployment: ['AVANÇADO', 'Implantação'],
  };

  let workspace = null;

  function syncContext() {
    const s = store.session && store.session.session;
    const disconnect = document.querySelector('#disconnect-button');
    const updated = document.querySelector('#ctx-updated');
    if (disconnect) disconnect.disabled = !s;
    if (updated) updated.textContent = s?.updated_at ? `Atualizado ${new Date(s.updated_at).toLocaleTimeString()}` : '—';
  }

  async function render(name = store.view) {
    store.view = name;
    document.querySelectorAll('.nav').forEach((b) => b.classList.toggle('active', b.dataset.view === name));
    const [kicker, title] = meta[name] || meta.overview;
    const kickerEl = document.querySelector('#page-kicker');
    const titleEl = document.querySelector('#page-title');
    if (kickerEl) kickerEl.textContent = kicker;
    if (titleEl) titleEl.textContent = title;

    if (!store.session?.connected && name !== 'profiles') {
      workspace.innerHTML = '<div class="empty-state"><strong>Nenhum equipamento conectado</strong><span>Conecte-se para carregar este workspace.</span></div>';
      return;
    }

    workspace.innerHTML = '<div class="panel muted">Carregando…</div>';
    try {
      workspace.innerHTML = await (views[name] || views.overview)();
      mountCurrentView(name);
    } catch (error) {
      workspace.innerHTML = `<div class="notice danger" role="alert">${esc(error?.message || 'Falha ao carregar a tela.')}</div>`;
    }
  }

  function mountCurrentView(name) {
    if (name === 'wifi') {
      document.querySelectorAll('[data-reveal-wifi]').forEach((btn) => {
        btn.onclick = async () => {
          btn.disabled = true;
          try {
            const data = await request('/api/device/wifi/reveal-password', {method:'POST', body:'{}'});
            const rows = Array.isArray(data) ? data : (data?.networks || []);
            const row = rows.find((item) => String(pick(item,'id','_InstID','ssid_id')) === String(btn.dataset.revealWifi));
            if (!row || !row.password) throw new Error('O firmware/login não expôs a senha deste SSID.');
            const d = dialog('Senha Wi-Fi', `<div class="kv-grid"><div class="kv"><label>SSID</label><span>${esc(pick(row,'ssid','ESSID','name'))}</span></div><div class="kv"><label>Senha</label><span style="user-select:all">${esc(row.password)}</span></div></div><div class="notice warning">A senha foi lida sob demanda da sessão autenticada e não é mantida no snapshot normal da tela.</div>`);
            d?.addEventListener('close', () => { if (d) d.querySelector('#dialog-body'); }, {once:true});
          } catch (error) { toast(error.message); }
          finally { btn.disabled = false; }
        };
      });
      document.querySelectorAll('[data-edit-ssid]').forEach((btn) => {
        btn.onclick = () => {
          const id = btn.dataset.editSsid;
          const current = btn.dataset.currentSsid === '—' ? '' : btn.dataset.currentSsid;
          const d = dialog('Editar SSID', `<form id="ssid-form" class="form-grid"><input type="hidden" name="ssid_id" value="${esc(id)}"><div class="field"><label>Nome da rede</label><input name="ssid" value="${esc(current)}" maxlength="32"></div><div class="field"><label>Nova senha (opcional)</label><input name="password" type="password" minlength="8" maxlength="63" autocomplete="new-password"></div><div class="field"><label><input name="enabled" type="checkbox" checked> SSID habilitado</label></div><div class="field"><label><input name="broadcast" type="checkbox" checked> Broadcast habilitado</label></div><div class="dialog-footer"><button class="button" type="button" data-cancel>Cancelar</button><button class="button primary" type="submit">Aplicar</button></div></form>`);
          if (!d) return;
          const form = d.querySelector('#ssid-form');
          form.querySelector('[data-cancel]').onclick = () => d.close();
          form.onsubmit = async (event) => {
            event.preventDefault();
            const fd = new FormData(form);
            const config = {ssid: String(fd.get('ssid') || ''), enabled: fd.get('enabled') === 'on', broadcast: fd.get('broadcast') === 'on'};
            const password = String(fd.get('password') || '');
            if (password) config.password = password;
            try {
              await request('/api/device/wifi/ssid', {method: 'POST', body: JSON.stringify({ssid_id: id, config})});
              d.close(); toast('Alteração enviada e validada pelo provider.');
              document.dispatchEvent(new CustomEvent('refresh-view'));
            } catch (error) { toast(error.message); }
          };
        };
      });
    }

    if (name === 'diagnostics') {
      const output = document.querySelector('#diagnostic-result');
      const run = async (path, payload) => {
        if (output) output.innerHTML = '<span class="muted">Executando…</span>';
        try {
          const result = await request(path, {method:'POST', body:JSON.stringify(payload)});
          if (output) output.innerHTML = `<pre>${esc(JSON.stringify(result, null, 2))}</pre>`;
        } catch (error) {
          if (output) output.innerHTML = `<div class="notice danger">${esc(error.message)}</div>`;
        }
      };
      const ping = document.querySelector('#ping-form');
      if (ping) ping.onsubmit = (event) => { event.preventDefault(); const fd=new FormData(ping); run('/api/device/diagnostics/ping',{host:String(fd.get('host')||''),count:Number(fd.get('count')||4)}); };
      const trace = document.querySelector('#trace-form');
      if (trace) trace.onsubmit = (event) => { event.preventDefault(); const fd=new FormData(trace); run('/api/device/diagnostics/traceroute',{host:String(fd.get('host')||'')}); };
    }

    if (name === 'management') {
      const button = document.querySelector('#reboot-button');
      if (button && !button.disabled) {
        button.onclick = () => {
          const d = dialog('Reiniciar equipamento?', '<p>A conexão ficará indisponível temporariamente. O Access Manager não repetirá o comando automaticamente se a resposta cair.</p>', '<button class="button" data-cancel>Cancelar</button><button class="button danger" data-confirm>Reiniciar</button>');
          if (!d) return;
          d.querySelector('[data-cancel]').onclick = () => d.close();
          d.querySelector('[data-confirm]').onclick = async () => {
            try { await request('/api/device/reboot', {method: 'POST', body: '{}'}); d.close(); toast('Reboot solicitado. O estado pode ficar temporariamente incerto.'); }
            catch (error) { toast(error.message); }
          };
        };
      }
    }

    if (name === 'profiles') {
      const add = document.querySelector('#new-profile');
      if (add) add.onclick = () => {
        const d = dialog('Novo perfil', '<form id="profile-form" class="form-grid"><div class="field"><label>Nome</label><input name="name" required></div><div class="field"><label>Descrição</label><input name="description"></div><div class="field"><label>DNS primário</label><input name="dns1" placeholder="1.1.1.1"></div><div class="field"><label>DNS secundário</label><input name="dns2" placeholder="8.8.8.8"></div><div class="dialog-footer"><button class="button" type="button" data-cancel>Cancelar</button><button class="button primary" type="submit">Salvar</button></div></form>');
        if (!d) return;
        const form = d.querySelector('#profile-form');
        form.querySelector('[data-cancel]').onclick = () => d.close();
        form.onsubmit = async (event) => {
          event.preventDefault();
          const fd = new FormData(form); const dns = {};
          if (fd.get('dns1')) dns.ipv4_1 = fd.get('dns1');
          if (fd.get('dns2')) dns.ipv4_2 = fd.get('dns2');
          try {
            await request('/api/profiles', {method: 'POST', body: JSON.stringify({name: fd.get('name'), description: fd.get('description'), dns})});
            d.close(); toast('Perfil salvo.'); document.dispatchEvent(new CustomEvent('refresh-view'));
          } catch (error) { toast(error.message); }
        };
      };
      document.querySelectorAll('[data-preview-profile]').forEach((button) => button.onclick = async () => {
        try {
          const p = await request('/api/profiles/preview', {method: 'POST', body: JSON.stringify({name: button.dataset.previewProfile})});
          dialog('Preview do perfil', `<div class="notice">${p.applicable} operação(ões) serão aplicadas; ${p.skipped} serão ignoradas por capability.</div>${p.operations.map((o) => `<div class="capability-row"><strong>${esc(o.label)}</strong><span>${esc(o.feature)}</span><span>${esc(o.support)}</span><span>${o.will_apply ? 'Aplicar' : 'Pular'}</span></div>`).join('')}`);
        } catch (error) { toast(error.message); }
      });
      document.querySelectorAll('[data-apply-profile]').forEach((button) => button.onclick = async () => {
        try {
          const r = await request('/api/profiles/apply', {method: 'POST', body: JSON.stringify({name: button.dataset.applyProfile})});
          toast(`Perfil: ${r.applied} aplicado(s), ${r.skipped} pulado(s), ${r.failed} falha(s).`);
        } catch (error) { toast(error.message); }
      });
    }
  }

  function normalizeConnectionPayload(form) {
    const fd = new FormData(form);
    return {
      host: String(fd.get('host') || '').trim(),
      username: String(fd.get('username') || '').trim(),
      password: String(fd.get('password') || ''),
      https: Boolean(form.querySelector('[name="https"]')?.checked),
      model_hint: String(fd.get('model_hint') || '').trim() || null,
    };
  }

  async function connectFromForm(event) {
    event.preventDefault();
    event.stopPropagation();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const button = document.querySelector('#connect-button');
    const originalLabel = button?.textContent || 'Conectar';
    const payload = normalizeConnectionPayload(form);
    if (button) { button.disabled = true; button.textContent = 'Conectando…'; }
    console.info('[Access Manager] Iniciando conexão', {host: payload.host, https: payload.https, model_hint: payload.model_hint});
    try {
      const session = await request('/api/session', {method: 'POST', body: JSON.stringify(payload)});
      if (!session?.connected || !session?.session) throw new Error('A API não confirmou uma sessão autenticada no equipamento.');
      store.setSession(session);
      store.setCapabilities(session.session?.capabilities || {});
      syncContext();
      const password = form.querySelector('[name="password"]');
      if (password) password.value = '';
      toast(`Conectado via ${payload.https ? 'HTTPS' : 'HTTP'} em ${session.session.model || session.session.vendor || payload.host}.`);
      await render(session.session?.mode === 'deployment' ? 'deployment' : 'overview');
    } catch (error) {
      console.error('[Access Manager] Falha de conexão:', error);
      toast(error?.message || 'Não foi possível conectar ao equipamento.');
      if (workspace) workspace.innerHTML = `<div class="notice danger" role="alert"><strong>Não foi possível conectar.</strong><br>${esc(error?.message || 'Verifique IP, transporte e credenciais.')}</div>`;
    } finally {
      if (button) { button.disabled = false; button.textContent = originalLabel; }
    }
  }

  async function mountApp() {
    workspace = document.querySelector('#workspace');
    if (!workspace) throw new Error('Workspace do Access Manager não foi encontrado.');

    document.querySelectorAll('.nav').forEach((button) => {
      button.onclick = () => { document.querySelector('#sidebar')?.classList.remove('open'); render(button.dataset.view); };
    });
    const mobileNav = document.querySelector('#mobile-nav');
    if (mobileNav) mobileNav.onclick = () => document.querySelector('#sidebar')?.classList.toggle('open');

    const form = document.querySelector('#connect-form');
    if (!form) throw new Error('Formulário de conexão não foi encontrado.');
    form.addEventListener('submit', connectFromForm);

    const disconnect = document.querySelector('#disconnect-button');
    if (disconnect) disconnect.onclick = async () => {
      try { await request('/api/session', {method: 'DELETE'}); }
      finally { store.setSession({connected: false, session: null}); store.setCapabilities({}); syncContext(); render(store.view); }
    };

    document.addEventListener('refresh-view', () => render(store.view));

    try {
      const current = await request('/api/session');
      store.setSession(current);
      store.setCapabilities(current.session?.capabilities || {});
      syncContext();
      await render(current.connected ? (current.session?.mode === 'deployment' ? 'deployment' : 'overview') : store.view);
    } catch (error) {
      console.error('[Access Manager] Falha ao consultar sessão inicial:', error);
      await render(store.view);
    }

    root.dataset.runtimeMounted = 'true';
    console.info('[Access Manager] Frontend clássico inicializado sem ES modules.');
  }

  mountApp().catch((error) => {
    root.dataset.runtimeMounted = 'failed';
    console.error('[Access Manager] Falha ao iniciar frontend:', error);
    const target = document.querySelector('#workspace');
    if (target) target.innerHTML = `<div class="notice danger" role="alert"><strong>Falha ao iniciar o frontend.</strong><br>${esc(error?.message || 'Erro desconhecido.')}</div>`;
  });
})();
