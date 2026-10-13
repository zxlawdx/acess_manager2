(() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // apps/access_manager/static/js/services/api.js
  function parseResponseBody(text) {
    if (!text) return {};
    try {
      return JSON.parse(text);
    } catch (_) {
      return { raw: text };
    }
  }
  async function request(path, options = {}) {
    const { scope = defaultScope(path, options), forceRefresh = false, ...fetchOptions } = options;
    const method = String(options.method || "GET").toUpperCase(), read = method === "GET";
    if (!scopeActive(scope)) throw cancelled();
    const canCache = read && cachedPaths.has(path);
    sessionKey();
    const entry = canCache ? snapshots.get(path) : null;
    if (!forceRefresh && entry && Date.now() - entry.time < 15e3) {
      if (Date.now() - entry.time > 3e3) request(path, { ...options, scope, forceRefresh: true }).then(() => {
        if (scopeActive(scope)) document.dispatchEvent(new CustomEvent("snapshot-updated", { detail: { path, generation: scope?.generation } }));
      }).catch(() => {
      });
      return clone(entry.data);
    }
    const key2 = cacheSession + ":" + (scope?.identity ?? "global") + ":" + path;
    if (canCache && pending.has(key2)) return pending.get(key2);
    const start = performance.now(), epoch = revision;
    const work = (async () => {
      const url = new URL(path, window.location.origin);
      const res = await fetch(url, { credentials: "same-origin", ...fetchOptions, signal: read ? fetchOptions.signal || scope?.controller.signal : fetchOptions.signal, headers: { "Content-Type": "application/json", ...options.headers || {} } });
      const text = await res.text(), data = parseResponseBody(text);
      if (!read && !["/api/device/wifi/reveal-password", "/api/device/traffic/history", "/api/profiles/preview", "/api/device/diagnostics/ping", "/api/device/diagnostics/traceroute"].includes(path)) clearSnapshots();
      if (!scopeActive(scope) || canCache && epoch !== revision) throw cancelled();
      if (!res.ok) throw new Error(data?.error?.message || data?.message || `HTTP ${res.status} ao acessar ${url.pathname}`);
      if (data?.success === false) throw new Error(data?.error?.message || "Falha na operação");
      if (canCache) {
        const safe = clean(data);
        snapshots.set(path, { time: Date.now(), data: safe });
        return clone(safe);
      }
      return data;
    })().catch((e) => {
      if (!scopeActive(scope) || isCancelled(e)) throw cancelled();
      throw e;
    }).finally(() => {
      if (pending.get(key2) === work) pending.delete(key2);
      timing(path.startsWith("/api/device/wifi") ? "wifi.load." + (path.split("/").at(-1) === "wifi" ? "total" : path.split("/").at(-1)) : path + ".load", start);
    });
    if (canCache) pending.set(key2, work);
    return work;
  }
  var generation = 0;
  var active = null;
  var cacheSession = null;
  var revision = 0;
  var scopeId = 0;
  var clone = (value) => JSON.parse(JSON.stringify(value));
  var snapshots = /* @__PURE__ */ new Map();
  var pending = /* @__PURE__ */ new Map();
  var cachedPaths = /* @__PURE__ */ new Set(["/api/device", "/api/device/wifi", "/api/device/wifi/ssids", "/api/device/wifi/radios", "/api/device/wan", "/api/device/lan", "/api/device/dhcp", "/api/device/dns", "/api/profiles", "/api/device/dmz", "/api/device/upnp", "/api/device/tr069", "/api/device/firewall"]);
  var cancelled = () => Object.assign(new Error(""), { name: "AbortError" });
  var isCancelled = (e) => e?.name === "AbortError";
  function beginView(name) {
    active?.controller.abort();
    active = { name, generation: ++generation, identity: ++scopeId, controller: new AbortController() };
    return active;
  }
  function currentScope() {
    return active;
  }
  function defaultScope(path, options) {
    if (path === "/api/session") return null;
    const dialog2 = document.querySelector("#action-dialog");
    return String(options.method || "GET").toUpperCase() !== "GET" && dialog2?.open ? dialog2._requestScope : currentScope();
  }
  function scopeActive(scope) {
    return !scope || !scope.controller.signal.aborted && scope.generation === generation;
  }
  function childScope() {
    const parent = active, scope = { generation: parent?.generation ?? generation, identity: ++scopeId, controller: new AbortController() };
    parent?.controller.signal.addEventListener("abort", () => scope.controller.abort(), { once: true });
    return scope;
  }
  function clearSnapshots() {
    revision++;
    snapshots.clear();
    pending.clear();
  }
  function sessionKey() {
    const key2 = window.__amStore?.session?.session?.session_id ?? "disconnected";
    if (cacheSession !== key2) {
      clearSnapshots();
      cacheSession = key2;
    }
    return key2;
  }
  function clean(value) {
    if (Array.isArray(value)) return value.map(clean);
    if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).filter(([k]) => !/(password|passwd|senha|secret|token|authorization)/i.test(k)).map(([k, v]) => [k, clean(v)]));
    return value;
  }
  function cached(path) {
    sessionKey();
    const entry = snapshots.get(path);
    return entry && Date.now() - entry.time < 15e3 ? clone(entry.data) : null;
  }
  function timing(label, start) {
    const duration = performance.now() - start;
    if (window.__AM_DEBUG__) {
      performance.measure?.(label, { start, end: performance.now() });
      console.debug("[Access Manager timing]", label, duration.toFixed(1) + " ms");
    }
    return duration;
  }
  function loadResource(path, { scope = currentScope(), data, error, refresh = false } = {}) {
    const entry = cached(path);
    if (entry !== null && scopeActive(scope)) data(entry);
    return request(path, { scope, forceRefresh: refresh || entry === null || Date.now() - (snapshots.get(path)?.time || 0) > 3e3 }).then((value) => {
      if (scopeActive(scope)) data(value);
    }).catch((e) => {
      if (scopeActive(scope) && !isCancelled(e)) error?.(e);
    });
  }

  // apps/access_manager/static/js/core/store.js
  var store = { session: null, capabilities: {}, view: "overview", setSession(v) {
    this.session = v;
    renderContext();
  }, setCapabilities(v) {
    this.capabilities = v || {};
    document.dispatchEvent(new CustomEvent("capabilities"));
  } };
  function renderContext() {
    const s = store.session?.session;
    document.querySelector("#ctx-vendor").textContent = s?.vendor?.toUpperCase() || "—";
    document.querySelector("#ctx-model").textContent = s?.model || "Sem equipamento";
    const scheme = s?.metadata?.scheme;
    document.querySelector("#ctx-host").textContent = s?.host ? scheme ? `${scheme}://${s.host}` : s.host : "—";
    const online = Boolean(store.session?.connected);
    const status2 = document.querySelector("#ctx-status");
    status2.textContent = online ? "● Online" : "○ Desconectado";
    status2.style.color = online ? "var(--success)" : "";
  }

  // apps/access_manager/static/js/workspaces/views/overview.js
  var overview_exports = {};
  __export(overview_exports, {
    mount: () => mount2,
    render: () => render2
  });

  // apps/access_manager/static/js/shared/ui.js
  var esc = (value) => String(value ?? "—").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  var pick = (obj, ...keys) => {
    for (const k of keys) {
      const v = obj?.[k];
      if (v !== void 0 && v !== null && v !== "") return v;
    }
    return "—";
  };
  function badge(value, kind = "info") {
    return `<span class="badge ${kind}">${esc(value)}</span>`;
  }
  var technicalLabel = (label) => /IP|MAC|DNS|VLAN|MTU|Mbps|latência|perda|enviados|recebidos|mínimo|médio|máximo|RX|TX|RSSI|SNR|banda|canal|largura|padrão|potência|país|velocidade|bytes|lease|uptime|tempo|memória|CPU|RAM|temperatura|máscara|pool|gateway|prefixo|firmware|hardware|serial|clientes|óptico/i.test(label);
  function valueClass(value, technical = true) {
    const text = String(value ?? "");
    if (!text || /^(—|Não disponível|Aguardando|Sem dados|Não configurado)/i.test(text)) return "muted";
    if (/^(online|ativo|conectado|connected|up|associado|associated|habilitado|saudável|verificado)$/i.test(text)) return "value-success";
    if (/^(offline|erro|falha|desconectado|disconnected|down|sem link)$/i.test(text)) return "value-danger";
    return technical ? "tech-value" : "";
  }
  function valueMarkup(value, label = "") {
    const v = Array.isArray(value) ? value.join(", ") || "Não disponível" : value ?? "Não disponível";
    return `<span class="${valueClass(v, technicalLabel(label))}">${esc(v)}</span>`;
  }
  function metric(label, value, detail = "") {
    return `<article class="metric"><label>${esc(label)}</label><strong class="${valueClass(value)}">${esc(value)}</strong>${detail ? `<small>${esc(detail)}</small>` : ""}</article>`;
  }
  function kv(data) {
    const items = Object.entries(data || {}).filter(([, v]) => v !== void 0 && v !== null && typeof v !== "object");
    return `<div class="kv-grid">${items.map(([k, v]) => `<div class="kv"><label>${esc(k.replaceAll("_", " "))}</label><span>${valueMarkup(typeof v === "boolean" ? v ? "Ativo" : "Inativo" : v, k)}</span></div>`).join("")}</div>`;
  }
  function table(columns2, rows2, empty = "Nenhum registro encontrado") {
    if (!Array.isArray(rows2) || !rows2.length) return `<div class="empty-state"><span>${esc(empty)}</span></div>`;
    return `<div class="panel"><table class="data-table"><thead><tr>${columns2.map((c) => `<th>${esc(c.label)}</th>`).join("")}</tr></thead><tbody>${rows2.map((r) => `<tr>${columns2.map((c) => `<td>${c.render ? technicalLabel(c.label) ? `<span class="tech-value">${c.render(r)}</span>` : c.render(r) : valueMarkup(pick(r, ...c.keys || [c.key]), c.label)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  }
  function cap(feature) {
    return window.__amStore?.capabilities?.[feature] || { read: "UNKNOWN", write: "UNKNOWN", enabled: { read: false, write: false }, evidence: "UNKNOWN" };
  }
  function capBadge(state) {
    const kind = state === "SUPPORTED" ? "ok" : state === "PARTIAL" || state === "UNKNOWN" ? "warn" : "bad";
    return badge(state, kind);
  }
  function toast(message) {
    if (!message) return;
    const host = document.querySelector("#toast-region");
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = message;
    host.append(el);
    setTimeout(() => el.remove(), 3600);
  }
  function dialog(title, content, actions = "") {
    const d = document.querySelector("#action-dialog");
    d._requestScope?.controller.abort();
    if (d.open) d.close();
    d.classList.remove("drawer", "profile-dialog");
    const scope = childScope();
    d._requestScope = scope;
    document.querySelector("#dialog-body").innerHTML = `<div class="dialog-inner"><div class="dialog-header"><h2 id="dialog-title">${esc(title)}</h2><button class="icon-button" data-close-dialog aria-label="Fechar">×</button></div>${content}${actions ? `<div class="dialog-footer">${actions}</div>` : ""}</div>`;
    d.querySelector("[data-close-dialog]").onclick = () => d.close();
    d.onclose = () => {
      if (d.open || d._requestScope !== scope) return;
      scope.controller.abort();
      document.querySelector("#dialog-body").replaceChildren();
    };
    d.addEventListener("input", (e) => {
      e.target.dataset.dirty = "true";
      const form = e.target.closest("form");
      if (form) form.dataset.dirty = "true";
    }, { signal: d._requestScope.controller.signal });
    d.showModal();
    return d;
  }

  // apps/access_manager/static/js/shared/presentation.js
  var unavailable = "Não disponível";
  var bool = (v) => v === true ? "Ativo" : v === false ? "Inativo" : unavailable;
  function formatBytes(v) {
    if (v == null || v === "") return unavailable;
    let x = Number(v), i = 0;
    const units = ["B", "KiB", "MiB", "GiB", "TiB"];
    if (!Number.isFinite(x)) return unavailable;
    while (x >= 1024 && i < 4) {
      x /= 1024;
      i++;
    }
    return `${x.toFixed(i ? 2 : 0)} ${units[i]}`;
  }
  function fields(items) {
    return `<div class="human-fields">${items.map(([label, value]) => `<div class="human-field"><span class="muted">${esc(label)}</span><strong>${valueMarkup(value, label)}</strong></div>`).join("")}</div>`;
  }
  function uptime(v) {
    if (v == null || v === "") return "—";
    const n = Number(v);
    if (!Number.isFinite(n)) return String(v);
    const days = Math.floor(n / 86400), hours = Math.floor(n % 86400 / 3600), minutes = Math.floor(n % 3600 / 60);
    return `${days ? days + "d " : ""}${hours}h ${minutes}min`;
  }
  var linkStatus = (v) => ({ connected: "Conectado", disconnected: "Desconectado", up: "Ativo", down: "Sem link", unknown: "Desconhecido", associated: "Associado", enabled: "Habilitado", disabled: "Desabilitado", "1": "Ativo", "0": "Inativo" })[String(v ?? "").toLowerCase()] || v || "Não disponível";

  // apps/access_manager/static/js/workspaces/views/clients.js
  var clients_exports = {};
  __export(clients_exports, {
    mount: () => mount,
    mountDetails: () => mountDetails,
    render: () => render,
    topology: () => topology
  });
  var rows = [];
  var status = (r) => {
    const v = pick(r, "status", "estado", "online");
    if (v === "—") return badge("Não disponível");
    if (v === false || /^(offline|disconnected|false|0)$/i.test(String(v))) return badge("Offline", "bad");
    if (v === true || /^(online|connected|associated|up|true|1)$/i.test(String(v))) return badge("Online", "ok");
    return badge(linkStatus(v));
  };
  var connection = (r) => pick(r, "connection_type", "tipo", "interface");
  var band = (r) => pick(r, "band", "banda");
  var columns = [{ label: "Status", render: status }, { label: "Hostname", render: (r) => `<button class="icon-button" data-client="${rows.indexOf(r)}">${esc(pick(r, "hostname", "nome"))}</button>` }, { label: "IP", keys: ["ip"] }, { label: "MAC", keys: ["mac"] }, { label: "Conexão", render: connection }, { label: "SSID / porta", keys: ["ssid", "port", "interface"] }, { label: "Banda", render: band }, { label: "RSSI", keys: ["rssi"] }, { label: "SNR", keys: ["snr"] }, { label: "RX / TX", render: (r) => `${esc(pick(r, "rx_rate"))} / ${esc(pick(r, "tx_rate"))}` }];
  function cards(data) {
    return `<div class="client-cards">${data.map((r) => `<button class="client-card" data-client="${rows.indexOf(r)}"><strong>${esc(pick(r, "hostname", "nome"))}</strong><span class="mono tech-address">${esc(pick(r, "ip"))}</span><small>${esc(connection(r))} · ${esc(band(r))}</small>${status(r)}</button>`).join("")}</div>`;
  }
  function topology(data, device = "Equipamento", register = true) {
    if (register) rows = data;
    const groups = /* @__PURE__ */ new Map();
    for (const r of data) {
      const c = String(connection(r)).toLowerCase();
      const b = String(band(r));
      let key2 = /mesh/.test(c) ? "Mesh" : /wi.fi|wlan|wifi/.test(c) ? /2[.,]4/.test(b) ? "Wi-Fi 2.4 GHz" : /5/.test(b) ? "Wi-Fi 5 GHz" : "Wi-Fi — banda não disponível" : /ethernet|lan|eth/.test(c) ? "Ethernet" : "Conexão não disponível";
      if (!groups.has(key2)) groups.set(key2, []);
      groups.get(key2).push(r);
    }
    return `<section class="panel"><h2>Topologia da rede</h2><div class="topology-root">${esc(device)}</div><div class="topology-branches">${[...groups].map(([k, v]) => `<div class="topology-branch"><h3>${esc(k)} · ${v.length}</h3>${cards(v)}</div>`).join("")}</div>${data.length ? "" : '<p class="muted">Nenhum cliente observado nesta sessão.</p>'}</section>`;
  }
  function mountDetails() {
    document.querySelectorAll("[data-client]").forEach((btn) => btn.onclick = () => {
      const r = rows[Number(btn.dataset.client)];
      if (!r) return;
      const data = { Hostname: pick(r, "hostname", "nome"), IP: pick(r, "ip"), MAC: pick(r, "mac"), Conexão: connection(r), Interface: pick(r, "interface", "port"), SSID: pick(r, "ssid"), Banda: band(r), RSSI: pick(r, "rssi"), SNR: pick(r, "snr"), "RX bytes": pick(r, "rx_bytes"), "TX bytes": pick(r, "tx_bytes"), "Taxa RX": pick(r, "rx_rate"), "Taxa TX": pick(r, "tx_rate"), Fabricante: pick(r, "manufacturer"), Estado: linkStatus(pick(r, "status", "online")), Lease: pick(r, "lease") };
      const d = dialog("Detalhes do cliente", kv(data));
      d.classList.add("drawer");
      d.addEventListener("close", () => {
        if (!d.open) d.classList.remove("drawer");
      }, { once: true });
    });
  }
  async function render() {
    rows = await request("/api/device/clients");
    if (!Array.isArray(rows)) rows = [];
    const ssids = [...new Set(rows.map((r) => r.ssid).filter(Boolean))];
    return `<section class="panel"><div class="toolbar"><input id="client-search" placeholder="Buscar hostname, IP ou MAC" aria-label="Buscar clientes"><select id="client-filter" aria-label="Conexão"><option value="">Todas as conexões</option><option>Wi-Fi</option><option>Ethernet</option><option>Mesh</option></select><select id="client-band" aria-label="Banda"><option value="">Todas as bandas</option><option value="2.4">2.4 GHz</option><option value="5">5 GHz</option></select><select id="client-ssid" aria-label="SSID"><option value="">Todos os SSIDs</option>${ssids.map((s) => `<option>${esc(s)}</option>`).join("")}</select><select id="client-view" aria-label="Visualização"><option value="table">Tabela</option><option value="cards">Cards</option><option value="topology">Topologia</option></select></div><div id="client-results"></div></section>`;
  }
  function mount() {
    const paint2 = () => {
      const q = document.querySelector("#client-search").value.toLowerCase(), type = document.querySelector("#client-filter").value, b = document.querySelector("#client-band").value, ssid = document.querySelector("#client-ssid").value, view = document.querySelector("#client-view").value;
      const filtered = rows.filter((r) => (!q || [r.hostname, r.ip, r.mac].some((v) => String(v || "").toLowerCase().includes(q))) && (!type || String(connection(r)).includes(type)) && (!b || String(band(r)).replace(",", ".").includes(b)) && (!ssid || r.ssid === ssid));
      const all = rows;
      document.querySelector("#client-results").innerHTML = view === "table" ? table(columns, filtered) : view === "cards" ? cards(filtered) : topology(filtered, "Equipamento", false);
      rows = all;
      mountDetails();
    };
    document.querySelectorAll("#client-search,#client-filter,#client-band,#client-ssid,#client-view").forEach((e) => e.addEventListener("input", paint2));
    paint2();
  }

  // apps/access_manager/static/js/workspaces/views/overview.js
  async function render2() {
    const scope = currentScope();
    const endpoints = ["/api/device", "/api/device/wan", "/api/device/optical", "/api/device/clients", "/api/device/traffic"];
    const results = await Promise.allSettled(endpoints.map((p) => request(p)));
    if (!scopeActive(scope)) throw cancelled();
    const [device, wan2, optical, clients, traffic] = results.map((r) => r.status === "fulfilled" ? r.value : null);
    const w = Array.isArray(wan2) ? wan2[0] || {} : wan2 || {}, o = optical || {}, d = device || {};
    const failed = results.map((r, i) => r.status === "rejected" ? `<div class="notice warning">${esc(["Equipamento", "WAN", "Óptica", "Clientes", "Tráfego"][i])}: ${esc(r.reason.message)}</div>` : "").join("");
    const rx = o.rx ?? o.rx_power ?? o.rx_dbm;
    const streams = (traffic?.sources || []).filter((s) => s.source === "wan");
    const latest = streams[0];
    const currentRate = latest?.rx_mbps == null ? "—" : `${Number(latest.rx_mbps).toFixed(2)} Mbps`;
    const percent = (v) => v == null ? "—" : `${v}%`;
    return `${failed}<div class="grid">${metric("Internet", linkStatus(w.status))}${metric("IP WAN", w.ipv4 ?? "—")}${metric("Clientes", Array.isArray(clients) ? clients.length : "—")}${metric("RX óptico", rx == null ? "—" : `${rx} dBm`)}${metric("CPU", percent(d.cpu_percent))}${metric("RAM", percent(d.memory_percent))}${metric("Tráfego WAN RX", currentRate)}${metric("Uptime", uptime(d.uptime_seconds))}</div><div class="split"><section class="panel"><div class="panel-header"><h2>Equipamento</h2>${badge(d.manufacturer)}</div>${fields([["Modelo", d.model], ["Firmware", d.firmware], ["Hardware", d.hardware], ["Serial", d.serial], ["Temperatura", d.temperature_c == null ? null : d.temperature_c + " °C"], ["Uptime", uptime(d.uptime_seconds)]])}<details><summary>Detalhes técnicos</summary>${kv(d.advanced || {})}</details></section><section class="panel"><h2>WAN</h2>${fields([["Estado", linkStatus(w.status)], ["Tipo", w.connection_type], ["IPv4", w.ipv4], ["Gateway", w.gateway], ["VLAN", w.vlan], ["DNS", w.dns]])}</section></div>${Array.isArray(clients) ? topology(clients, d.model) : ""}`;
  }
  var mount2 = mountDetails;

  // apps/access_manager/static/js/workspaces/views/wifi.js
  var wifi_exports = {};
  __export(wifi_exports, {
    mount: () => mount3,
    render: () => render3
  });

  // apps/access_manager/static/js/shared/patch.js
  function patchHTML(host, html) {
    const template = document.createElement("template");
    template.innerHTML = html;
    const patch = (parent, next) => {
      for (let i = 0; i < next.childNodes.length || i < parent.childNodes.length; i++) {
        const a = parent.childNodes[i], b = next.childNodes[i];
        if (!b) {
          a.remove();
          i--;
          continue;
        }
        if (!a) {
          parent.append(b.cloneNode(true));
          continue;
        }
        if (a.nodeType !== b.nodeType || a.nodeName !== b.nodeName) {
          a.replaceWith(b.cloneNode(true));
          continue;
        }
        if (a.nodeType === 3) {
          if (a.textContent !== b.textContent) a.textContent = b.textContent;
          continue;
        }
        if (a.nodeType !== 1) continue;
        const input = a.matches("input,select,textarea"), dirty = input && (a.dataset.dirty === "true" || a === document.activeElement), value = a.value, checked = a.checked;
        if (a.matches("form") && a.dataset.dirty === "true") continue;
        for (const attr of [...a.attributes]) if (!b.hasAttribute(attr.name) && attr.name !== "data-dirty") a.removeAttribute(attr.name);
        for (const attr of b.attributes) if (a.getAttribute(attr.name) !== attr.value) a.setAttribute(attr.name, attr.value);
        patch(a, b);
        if (dirty) {
          a.value = value;
          a.checked = checked;
        }
      }
    };
    patch(host, template.content);
  }

  // apps/access_manager/static/js/shared/forms.js
  function editConfig(title, path, fields2, extra = {}) {
    const supported = fields2.filter((f) => f.value !== void 0 && f.value !== null && f.value !== "—");
    const d = dialog(title, `<form class="form-grid">${supported.map((f) => `<div class="field"><label>${esc(f.label)}</label>${f.options ? `<select name="${esc(f.key)}" ${f.options.length ? "" : "disabled"}><option value="${esc(f.value)}">${esc(f.value)}</option>${f.options.filter((o) => String(o.value) !== String(f.value)).map((o) => `<option value="${esc(o.value)}">${esc(o.label)}</option>`).join("")}</select>` : f.type === "bool" ? `<select name="${esc(f.key)}"><option value="true" ${f.value === true || f.value === "1" ? "selected" : ""}>Ativo</option><option value="false" ${f.value === false || f.value === "0" ? "selected" : ""}>Inativo</option></select>` : `<input name="${esc(f.key)}" value="${esc(f.value)}" type="${f.type || "text"}">`}</div>`).join("")}<div class="dialog-footer"><button class="button primary">Aplicar alterações</button></div></form>`);
    const form = d.querySelector("form");
    const original = new FormData(form);
    form.onsubmit = async (e) => {
      e.preventDefault();
      const values = new FormData(form), config = {};
      for (const f of supported) {
        if (values.get(f.key) !== original.get(f.key)) {
          const v = values.get(f.key);
          config[f.key] = f.options ? String(v) : f.type === "bool" ? v === "true" : f.type === "number" ? Number(v) : String(v);
        }
      }
      if (!Object.keys(config).length) {
        toast("Nenhuma alteração.");
        return;
      }
      const payload = extra.ssid_id ? { ssid_id: extra.ssid_id, config } : { ...extra, ...config };
      const b = form.querySelector("button");
      b.disabled = true;
      try {
        const result = await request(path, { method: "POST", scope: d._requestScope, body: JSON.stringify(payload) });
        toast(result?.verified === true ? "Alteração confirmada por leitura do equipamento." : "Comando enviado; consulte o estado atualizado.");
        d.close();
        document.dispatchEvent(new CustomEvent("refresh-view"));
      } catch (err) {
        toast(err.message);
      } finally {
        b.disabled = false;
      }
    };
  }

  // apps/access_manager/static/js/workspaces/views/wifi.js
  var networks = [];
  var radios = [];
  function contents() {
    return `<section class="panel"><h2>Redes Wi-Fi</h2></section>${table([{ label: "SSID", keys: ["ssid"] }, { label: "Banda", keys: ["band", "banda"] }, { label: "Ativo", render: (r) => esc(bool(r.enabled ?? r.ativo)) }, { label: "Broadcast", render: (r) => esc(bool(r.broadcast)) }, { label: "Segurança", keys: ["security", "seguranca"] }, { label: "Ações", render: (r) => `<div class="inline-actions"><button class="button" data-reveal-wifi="${esc(r.id)}">Ver senha</button><button class="button" data-edit-ssid="${networks.indexOf(r)}" ${cap("wifi").enabled?.write ? "" : "disabled"}>Editar</button></div>` }], networks)}<section class="panel"><h2>Rádios</h2>${radios.map((r, i) => `<article class="panel"><h3>${esc(pick(r, "band", "banda"))}</h3>${fields([["Estado", bool(r.enabled ?? r.radio_ativo)], ["Canal", r.channel ?? r.canal], ["Automático", bool(r.auto_channel ?? r.canal_automatico)], ["Largura", r.bandwidth ?? r.largura], ["Padrão", r.standard ?? r.padrao], ["Potência", r.tx_power ?? r.potencia], ["País", r.country ?? r.pais], ["SGI", bool(r.sgi)]])}<details><summary>Avançado</summary>${kv(r)}</details><button class="button" data-edit-radio="${i}" ${cap("wifi_radio").enabled?.write ? "" : "disabled"}>Editar rádio</button></article>`).join("") || '<p class="muted">Sem dados de rádio.</p>'}</section>`;
  }
  function wire() {
    document.querySelectorAll("[data-reveal-wifi]").forEach((b) => b.onclick = async () => {
      b.disabled = true;
      try {
        const d = await request("/api/device/wifi/reveal-password", { method: "POST", body: "{}" });
        const r = (Array.isArray(d) ? d : d.networks || []).find((r2) => String(r2.id) === b.dataset.revealWifi);
        if (!r?.password || r.password_hidden === true) throw new Error("Senha não disponível neste firmware/login.");
        dialog("Senha Wi-Fi", `<p>${esc(r.ssid)}</p><p class="mono" style="user-select:all">${esc(r.password)}</p>`);
      } catch (err) {
        toast(err.message);
      } finally {
        b.disabled = false;
      }
    });
    document.querySelectorAll("[data-edit-ssid]").forEach((b) => b.onclick = () => {
      const r = networks[Number(b.dataset.editSsid)];
      editConfig("Editar SSID", "/api/device/wifi/ssid", [{ key: "ssid", label: "Nome da rede", value: r.ssid }, { key: "password", label: "Nova senha (opcional)", value: "", type: "password" }, { key: "enabled", label: "SSID habilitado", value: r.enabled ?? r.ativo, type: "bool" }, { key: "broadcast", label: "Broadcast", value: r.broadcast, type: "bool" }, { key: "isolation", label: "Isolamento", value: r.isolation ?? r.isolamento, type: "bool" }], { ssid_id: r.id });
    });
    document.querySelectorAll("[data-edit-radio]").forEach((b) => b.onclick = () => {
      const r = radios[Number(b.dataset.editRadio)];
      editConfig("Editar rádio", "/api/device/wifi/radio", [{ key: "channel", options: r.options?.channel || [], label: "Canal", value: r.channel ?? r.canal }, { key: "auto_channel", label: "Canal automático", value: r.auto_channel ?? r.canal_automatico, type: "bool" }, { key: "bandwidth", options: r.options?.bandwidth || [], label: "Largura", value: r.bandwidth ?? r.largura }, { key: "standard", options: r.options?.standard || [], label: "Padrão", value: r.standard ?? r.padrao }, { key: "tx_power", options: r.options?.tx_power || [], label: "Potência", value: r.tx_power ?? r.potencia }, { key: "country", options: r.options?.country || [], label: "País", value: r.country ?? r.pais }, { key: "sgi", label: "SGI", value: r.sgi_write === false ? void 0 : r.sgi, type: "bool" }], { band: r.band ?? r.banda });
    });
  }
  function render3() {
    networks = [];
    radios = [];
    return `<section class="panel"><div class="panel-header"><h2>Redes Wi-Fi</h2><button class="button" id="wifi-refresh">Atualizar</button></div><div id="wifi-ssids" role="status"><p class="muted">Carregando SSIDs…</p><div class="skeleton"></div></div></section><section class="panel"><h2>Rádios</h2><div id="wifi-radios" role="status"><p class="muted">Carregando opções de rádio…</p><div class="skeleton"></div></div></section>`;
  }
  function mount3() {
    const scope = currentScope(), start = performance.now();
    const boundary = '<section class="panel"><h2>Rádios</h2>';
    const paint2 = (part, value) => {
      if (part === "ssids") networks = Array.isArray(value) ? value : value?.networks || [];
      else radios = Array.isArray(value) ? value : value?.radios || [];
      const html = contents(), split = html.indexOf(boundary), host = document.querySelector("#wifi-" + part);
      if (!host) return;
      patchHTML(host, part === "ssids" ? html.slice(html.indexOf("</section>") + 10, split) : html.slice(split + boundary.length, -10));
      host.removeAttribute("role");
      wire();
      timing("wifi.load." + part, start);
    };
    const load = (part, refresh = false) => loadResource("/api/device/wifi/" + part, { scope, refresh, data: (d) => paint2(part, d), error: (e) => {
      const host = document.querySelector("#wifi-" + part);
      if (host) host.innerHTML = `<div class="notice warning">${esc(e.message)}</div>`;
    } });
    document.querySelector("#wifi-refresh").onclick = () => Promise.allSettled([load("ssids", true), load("radios", true)]);
    Promise.allSettled([load("ssids"), load("radios")]).then(() => timing("wifi.load.total", start));
  }

  // apps/access_manager/static/js/workspaces/views/network.js
  var dhcpData;
  var dnsData;
  async function wan() {
    const data = await request("/api/device/wan");
    return data.map((r) => `<section class="panel"><h2>${esc(r.name || "Conexão WAN")}</h2><div class="split"><article><h3>Status da conexão</h3>${fields([["Estado", r.status], ["Tipo", r.connection_type], ["IPv4", r.ipv4], ["IPv6", r.ipv6], ["Gateway", r.gateway], ["VLAN", r.vlan]])}</article><article><h3>Autenticação e rede</h3>${fields([["Usuário PPPoE", r.username], ["Serviço", r.service], ["DNS", r.dns], ["MTU", r.mtu], ["NAT", bool(r.nat)], ["Uptime", r.uptime], ["Prefixo IPv6", r.prefix]])}</article></div>${fields([["Recebido", formatBytes(r.rx_bytes)], ["Enviado", formatBytes(r.tx_bytes)]])}<details><summary>Detalhes técnicos</summary>${kv(r.advanced || {})}</details></section>`).join("");
  }
  async function lan() {
    const d = await request("/api/device/lan");
    return table([{ label: "Porta", keys: ["port", "porta", "name"] }, { label: "Habilitada", render: (r) => esc(typeof r.enabled === "boolean" ? r.enabled ? "Sim" : "Não" : linkStatus(r.admin_state)) }, { label: "Link", render: (r) => {
      const raw = pick(r, "link_state", "status", "state", "estado");
      const label = linkStatus(raw);
      return badge(label, /^(up|1|connected)$/i.test(String(raw)) ? "ok" : "info");
    } }, { label: "Velocidade", keys: ["speed", "velocidade"] }, { label: "Duplex", render: (r) => esc({ full: "Full duplex", half: "Half duplex", auto: "Automático" }[String(r.duplex || "").toLowerCase()] || r.duplex || "Não disponível") }, { label: "Negociação", keys: ["autonegotiation", "negotiation"] }, { label: "Cliente / MAC", keys: ["client", "mac"] }, { label: "RX bytes", keys: ["rx_bytes"] }, { label: "TX bytes", keys: ["tx_bytes"] }, { label: "Erros RX/TX", render: (r) => `${esc(pick(r, "rx_errors"))}/${esc(pick(r, "tx_errors"))}` }], Array.isArray(d) ? d : d?.ports || []);
  }
  async function dhcpdns() {
    const scope = currentScope();
    const results = await Promise.allSettled([request("/api/device/dhcp"), request("/api/device/dns")]);
    if (!scopeActive(scope)) throw cancelled();
    dhcpData = results[0].status === "fulfilled" ? results[0].value : null;
    dnsData = results[1].status === "fulfilled" ? results[1].value : null;
    return `<div class="split">${dhcpData ? `<section class="panel"><h2>DHCP</h2>${fields([["Servidor", bool(dhcpData.enabled)], ["IP da LAN", dhcpData.lan_ip], ["Máscara", dhcpData.mask], ["Início do pool", dhcpData.pool_start], ["Fim do pool", dhcpData.pool_end], ["Lease (segundos)", dhcpData.lease_seconds], ["DNS primário", dhcpData.dns1], ["DNS secundário", dhcpData.dns2]])}</section>` : '<section class="panel">DHCP não disponível nesta sessão.</section>'}${dnsData ? `<section class="panel"><h2>DNS</h2>${fields([["Domínio", dnsData.domain_name], ["DNS IPv4 primário", dnsData.ipv4_1], ["DNS IPv4 secundário", dnsData.ipv4_2], ["DNS IPv6 primário", dnsData.ipv6_1], ["DNS IPv6 secundário", dnsData.ipv6_2]])}</section>` : '<section class="panel">DNS não disponível nesta sessão.</section>'}</div><div class="toolbar"><button class="button" id="edit-dhcp" ${dhcpData && cap("dhcp").enabled?.write ? "" : "disabled"}>Editar DHCP</button><button class="button" id="edit-dns" ${dnsData && cap("dns").enabled?.write ? "" : "disabled"}>Editar DNS</button></div>${table([{ label: "Hostname", keys: ["hostname", "Name", "name"] }, { label: "IP", keys: ["ip", "IPAddr", "IPAddress"] }, { label: "MAC", keys: ["mac", "MACAddr", "MACAddress"] }], dhcpData?.leases || [], "Nenhum lease retornado.")}<section class="panel"><div class="panel-header"><h2>Reservas DHCP</h2><button id="new-reservation" class="button" ${cap("dhcp_reservations").enabled?.write ? "" : "disabled"}>Adicionar</button></div></section>${table([{ label: "Reserva", keys: ["name", "Name"] }, { label: "IP", keys: ["ip", "IPAddr"] }, { label: "MAC", keys: ["mac", "MACAddr"] }, { label: "Ações", render: (r) => cap("dhcp_reservations").enabled?.write ? `<div class="inline-actions"><button class="button" data-edit-reservation="${esc(r.id)}">Editar</button><button class="button danger" data-delete-reservation="${esc(r.id)}">Excluir</button></div>` : "Somente leitura" }], dhcpData?.reservations || [], "Nenhuma reserva retornada.")}${dnsHosts()}`;
  }
  function mountDhcpDns() {
    mountReservations();
    mountDnsHosts();
    document.querySelector("#edit-dns").onclick = () => editConfig("Editar DNS", "/api/device/dns", [{ key: "domain_name", label: "Domínio", value: dnsData.domain_name }, { key: "ipv4_1", label: "DNS IPv4 primário", value: dnsData.ipv4_1 }, { key: "ipv4_2", label: "DNS IPv4 secundário", value: dnsData.ipv4_2 }, { key: "ipv6_1", label: "DNS IPv6 primário", value: dnsData.ipv6_1 }, { key: "ipv6_2", label: "DNS IPv6 secundário", value: dnsData.ipv6_2 }]);
    document.querySelector("#edit-dhcp").onclick = () => {
      const d = dhcpData;
      editConfig("Editar DHCP", "/api/device/dhcp", [{ key: "enabled", label: "Servidor DHCP", value: d.enabled, type: "bool" }, { key: "min_address", label: "Início do pool", value: d.pool_start }, { key: "max_address", label: "Fim do pool", value: d.pool_end }, { key: "lease_time", label: "Lease (segundos)", value: d.lease_seconds }, { key: "dns1", label: "DNS primário", value: d.dns1 }, { key: "dns2", label: "DNS secundário", value: d.dns2 }]);
    };
  }
  function mountReservations() {
    const edit2 = (row = {}) => {
      const available = dhcpData.reservation_fields || [];
      const d = dialog(row.id ? "Editar reserva" : "Adicionar reserva", `<form class="form-grid">${available.map((key2) => `<div class="field"><label>${{ name: "Nome", ip: "IP", mac: "MAC" }[key2]}</label><input name="${key2}" value="${esc(row[key2] || "")}" ${key2 === "name" ? "" : "required"}></div>`).join("")}<button class="button primary">Salvar</button></form>`);
      const f = d.querySelector("form");
      f.onsubmit = async (e) => {
        e.preventDefault();
        const payload = Object.fromEntries(new FormData(f));
        if (row.id) payload.id = row.id;
        const b = f.querySelector("button");
        b.disabled = true;
        try {
          const result = await request("/api/device/dhcp/reservations", { method: "POST", body: JSON.stringify(payload) });
          toast(result.verified ? "Reserva verificada." : "Comando enviado.");
          d.close();
          document.dispatchEvent(new CustomEvent("refresh-view"));
        } catch (err) {
          toast(err.message);
        } finally {
          b.disabled = false;
        }
      };
    };
    {
      const b = document.querySelector("#new-reservation");
      if (b) b.onclick = () => edit2();
    }
    document.querySelectorAll("[data-edit-reservation]").forEach((b) => b.onclick = () => edit2(dhcpData.reservations.find((r) => String(r.id) === b.dataset.editReservation)));
    document.querySelectorAll("[data-delete-reservation]").forEach((b) => b.onclick = () => {
      const d = dialog("Excluir reserva?", `<p>O endereço reservado será removido.</p>`, `<button class="button danger" data-confirm>Excluir</button>`);
      d.querySelector("[data-confirm]").onclick = async (e) => {
        e.currentTarget.disabled = true;
        try {
          await request("/api/device/dhcp/reservations", { method: "DELETE", body: JSON.stringify({ id: b.dataset.deleteReservation, confirm: true }) });
          d.close();
          document.dispatchEvent(new CustomEvent("refresh-view"));
        } catch (err) {
          toast(err.message);
        }
      };
    });
  }
  function dnsHosts() {
    return `<section class="panel"><div class="panel-header"><h2>Hosts DNS estáticos</h2><button id="new-dns-host" class="button" ${dnsData && cap("dns_hosts").enabled?.write ? "" : "disabled"}>Adicionar</button></div><p class="muted">Nomes locais associados a IPs; estes registros não são servidores DNS upstream.</p></section>${table([{ label: "Nome", keys: ["name"] }, { label: "IP", keys: ["ip"] }, { label: "Ações", render: (r) => `<div class="inline-actions"><button class="button" data-edit-host="${esc(r.id)}" ${cap("dns_hosts").enabled?.write ? "" : "disabled"}>Editar</button><button class="button danger" data-delete-host="${esc(r.id)}" ${cap("dns_hosts_delete").enabled?.write ? "" : "disabled"}>Excluir</button></div>` }], dnsData?.hosts || [], "Nenhum host DNS estático retornado.")}`;
  }
  function mountDnsHosts() {
    const edit2 = (row = {}) => {
      const d = dialog("Host DNS estático", `<form class="form-grid"><div class="field"><label>Nome</label><input name="name" value="${esc(row.name || "")}" ${row.id && !dnsData.host_rename ? "readonly" : ""} required></div><div class="field"><label>IP</label><input name="ip" value="${esc(row.ip || "")}" required></div><button class="button primary">Salvar</button></form>`);
      const f = d.querySelector("form");
      f.onsubmit = async (e) => {
        e.preventDefault();
        const payload = Object.fromEntries(new FormData(f));
        if (row.id) payload.id = row.id;
        const b = f.querySelector("button");
        b.disabled = true;
        try {
          const result = await request("/api/device/dns/hosts", { method: "POST", body: JSON.stringify(payload) });
          toast(result.verified ? "Host DNS verificado." : "Comando enviado.");
          d.close();
          document.dispatchEvent(new CustomEvent("refresh-view"));
        } catch (err) {
          toast(err.message);
        } finally {
          b.disabled = false;
        }
      };
    };
    {
      const b = document.querySelector("#new-dns-host");
      if (b) b.onclick = () => edit2();
    }
    document.querySelectorAll("[data-edit-host]").forEach((b) => b.onclick = () => edit2(dnsData.hosts.find((r) => String(r.id) === b.dataset.editHost)));
    document.querySelectorAll("[data-delete-host]").forEach((b) => b.onclick = () => {
      const d = dialog("Excluir host DNS?", `<p>O registro local será removido.</p>`, `<button class="button danger" data-confirm>Excluir</button>`);
      d.querySelector("[data-confirm]").onclick = async (e) => {
        e.currentTarget.disabled = true;
        try {
          await request("/api/device/dns/hosts", { method: "DELETE", body: JSON.stringify({ id: b.dataset.deleteHost, confirm: true }) });
          d.close();
          document.dispatchEvent(new CustomEvent("refresh-view"));
        } catch (err) {
          toast(err.message);
        }
      };
    });
  }

  // apps/access_manager/static/js/workspaces/views/profiles.js
  var profiles_exports = {};
  __export(profiles_exports, {
    mount: () => mount4,
    render: () => render4
  });
  var profiles = [];
  function contents2() {
    return `<section class="panel"><div class="panel-header"><h2>Perfis</h2><button class="button primary" id="new-profile">Novo perfil</button></div></section>${table([{ label: "Nome", keys: ["name"] }, { label: "Descrição", keys: ["description"] }, { label: "Rádios", render: (r) => esc((r.wifi?.radios || (r.wifi?.radio ? [r.wifi.radio] : [])).map((r2) => r2.band).join(", ") || "—") }, { label: "DNS", render: (r) => Object.keys(r.dns || {}).length ? "Configurado" : "—" }, { label: "Ações", render: (r) => `<div class="inline-actions"><button class="button" data-edit-profile="${esc(r.name)}">Editar</button><button class="button" data-preview-profile="${esc(r.name)}">Preview / aplicar</button><button class="button danger" data-delete-profile="${esc(r.name)}">Excluir</button></div>` }], profiles, "Nenhum perfil salvo.")}`;
  }
  var field = (label, name, value = "") => `<div class="field"><label>${label}</label><input name="${name}" value="${esc(value ?? "")}"></div>`;
  function choice(label, name, value, options) {
    return `<div class="field"><label>${label}</label><select name="${name}" ${options?.length ? "" : "disabled"}><option value="${esc(value ?? "")}">${esc((options || []).find((o) => String(o.value) === String(value))?.label ?? value ?? "Não disponível")}</option>${(options || []).filter((o) => String(o.value) !== String(value)).map((o) => `<option value="${esc(o.value)}">${esc(o.label)}</option>`).join("")}</select></div>`;
  }
  async function edit(profile = {}) {
    const opened = performance.now();
    let radiosReady = false;
    const savedRadios = profile.wifi?.radios || (profile.wifi?.radio ? [profile.wifi.radio] : []);
    let radios2 = [];
    const dns = profile.dns || {}, servers = dns.servers || [dns.ipv4_1 || dns.primary, dns.ipv4_2 || dns.secondary, dns.ipv6_1, dns.ipv6_2].filter(Boolean);
    const dhcpWritable = Boolean(cap("dhcp").enabled?.write);
    const d = dialog(profile.name ? "Editar perfil" : "Novo perfil", `<div class="profile-content"><form id="profile-form"><section class="profile-section"><div class="form-grid">${field("Nome", "name", profile.name)}${field("Descrição", "description", profile.description)}</div></section><section class="profile-section"><h3>DNS estáticos</h3><p class="muted">Até dois endereços IPv4 e dois IPv6, conforme o contrato do provider.</p><div id="profile-dns-list">${(servers.length ? servers : [""]).map((s) => `<div class="toolbar"><input name="dns-server" value="${esc(s)}" aria-label="Servidor DNS"><button type="button" class="button" data-remove-dns>Remover</button></div>`).join("")}</div><button class="button" type="button" id="add-profile-dns">Adicionar DNS</button></section><div id="profile-radios"><section class="profile-section" role="status"><h3>Rádios</h3><p class="muted">Carregando canal, largura, padrão, potência e país…</p><div class="skeleton"></div></section></div>${dhcpWritable ? `<section class="profile-section"><h3>DHCP</h3><div class="form-grid">${field("Início do pool", "pool-start", profile.dhcp?.min_address)}${field("Fim do pool", "pool-end", profile.dhcp?.max_address)}${field("Lease time (segundos)", "lease", profile.dhcp?.lease_time)}${field("DNS primário do DHCP", "dhcp-dns1", profile.dhcp?.dns1)}${field("DNS secundário do DHCP", "dhcp-dns2", profile.dhcp?.dns2)}</div></section>` : ""}</form></div>`, `<button type="button" class="button" data-cancel-profile>Cancelar</button><button type="submit" form="profile-form" class="button primary" id="save-profile">Salvar perfil</button>`);
    d.classList.add("profile-dialog");
    d.addEventListener("close", () => {
      if (!d.open) d.classList.remove("profile-dialog");
    }, { once: true });
    d.querySelector("[data-cancel-profile]").onclick = () => d.close();
    const form = d.querySelector("form");
    if (profile.name) form.querySelector('[name="name"]').readOnly = true;
    timing("profiles.modal.open", opened);
    const paintRadios = (value) => {
      if (!d.open) return;
      const host = d.querySelector("#profile-radios");
      if (host.querySelector('[data-dirty="true"]')) return;
      radios2 = Array.isArray(value) ? [...value] : value?.radios || [];
      for (const saved of savedRadios) if (!radios2.some((r) => (r.band ?? r.banda) === saved.band)) radios2.push({ ...saved, options: {} });
      radiosReady = true;
      patchHTML(host, ` ${radios2.map((r, i) => {
        const band2 = r.band ?? r.banda, stored = savedRadios.find((s) => s.band === band2);
        return `<section class="profile-section"><h3>Rádio ${esc(band2)}</h3><label class="profile-include"><input type="checkbox" name="include-radio-${i}" ${stored ? "checked" : ""}> Incluir no perfil</label><div class="form-grid">${[["Canal", "channel", r.channel ?? r.canal], ["Largura", "bandwidth", r.bandwidth ?? r.largura], ["Padrão", "standard", r.standard ?? r.padrao], ["Potência", "tx_power", r.tx_power ?? r.potencia], ["País", "country", r.country ?? r.pais]].map(([label, key2, current]) => choice(label, `${key2}-${i}`, stored?.[key2] ?? current, r.options?.[key2] || [])).join("")}${choice("Canal automático", `auto_channel-${i}`, stored?.auto_channel ?? r.auto_channel ?? r.canal_automatico, [{ value: "true", label: "Automático" }, { value: "false", label: "Manual" }])}</div></section>`;
      }).join("") || '<section class="profile-section"><p class="muted">Conecte um equipamento para carregar os rádios e suas opções.</p></section>'}`);
      timing("profiles.options.ready", opened);
    };
    loadResource("/api/device/wifi/radios", { scope: d._requestScope, data: paintRadios, error: (e) => {
      if (!d.open) return;
      paintRadios(savedRadios);
      const note = document.createElement("p");
      note.className = "notice warning";
      note.textContent = e.message;
      d.querySelector("#profile-radios").prepend(note);
    } });
    const wireRemove = () => d.querySelectorAll("[data-remove-dns]").forEach((b) => b.onclick = () => b.parentElement.remove());
    wireRemove();
    d.querySelector("#add-profile-dns").onclick = () => {
      if (d.querySelectorAll('[name="dns-server"]').length >= 4) {
        toast("O provider suporta até dois DNS por família de IP.");
        return;
      }
      d.querySelector("#profile-dns-list").insertAdjacentHTML("beforeend", '<div class="toolbar"><input name="dns-server" aria-label="Servidor DNS"><button type="button" class="button" data-remove-dns>Remover</button></div>');
      wireRemove();
    };
    form.onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(form), wifi = { ...profile.wifi }, dhcp = { ...profile.dhcp };
      if (radiosReady) {
        wifi.radios = radios2.flatMap((r, i) => {
          if (!fd.get(`include-radio-${i}`)) return [];
          const band2 = r.band ?? r.banda, out = { ...savedRadios.find((s) => s.band === band2) || {}, band: band2 };
          for (const k of ["channel", "bandwidth", "standard", "tx_power", "country"]) {
            const v = fd.get(`${k}-${i}`);
            if (v != null && v !== "") out[k] = String(v);
          }
          const auto = fd.get(`auto_channel-${i}`);
          if (auto === "true" || auto === "false") out.auto_channel = auto === "true";
          return [out];
        });
        delete wifi.radio;
      }
      if (dhcpWritable) for (const [input, key2] of [["pool-start", "min_address"], ["pool-end", "max_address"], ["lease", "lease_time"], ["dhcp-dns1", "dns1"], ["dhcp-dns2", "dns2"]]) {
        const v = String(fd.get(input) || "").trim();
        if (v) dhcp[key2] = v;
        else delete dhcp[key2];
      }
      const nextDns = { ...dns, servers: fd.getAll("dns-server").map((v) => String(v).trim()).filter(Boolean) };
      if (nextDns.servers.filter((v) => v.includes(":")).length > 2 || nextDns.servers.filter((v) => !v.includes(":")).length > 2) {
        toast("Limite do provider: dois DNS IPv4 e dois IPv6.");
        return;
      }
      for (const k of ["primary", "secondary", "ipv4_1", "ipv4_2", "ipv6_1", "ipv6_2"]) delete nextDns[k];
      const payload = { ...profile, name: String(fd.get("name") || "").trim(), description: fd.get("description"), wifi, dns: nextDns, dhcp }, b = d.querySelector("#save-profile");
      b.disabled = true;
      try {
        await request("/api/profiles", { method: "POST", scope: d._requestScope, body: JSON.stringify(payload) });
        d.close();
        toast("Perfil salvo.");
        document.dispatchEvent(new CustomEvent("refresh-view"));
      } catch (err) {
        toast(err.message);
      } finally {
        b.disabled = false;
      }
    };
  }
  function wire2() {
    document.querySelector("#new-profile").onclick = () => edit();
    document.querySelectorAll("[data-edit-profile]").forEach((b) => b.onclick = () => edit(profiles.find((p) => p.name === b.dataset.editProfile)));
    document.querySelectorAll("[data-delete-profile]").forEach((b) => b.onclick = () => {
      const d = dialog("Excluir perfil?", `<p>${esc(b.dataset.deleteProfile)}</p>`, `<button class="button danger" data-confirm>Excluir</button>`);
      d.querySelector("[data-confirm]").onclick = async (e) => {
        e.currentTarget.disabled = true;
        try {
          await request("/api/profiles", { method: "DELETE", body: JSON.stringify({ name: b.dataset.deleteProfile }) });
          d.close();
          document.dispatchEvent(new CustomEvent("refresh-view"));
        } catch (err) {
          toast(err.message);
        }
      };
    });
    document.querySelectorAll("[data-preview-profile]").forEach((b) => b.onclick = async () => {
      try {
        const p = await request("/api/profiles/preview", { method: "POST", body: JSON.stringify({ name: b.dataset.previewProfile }) });
        const d = dialog("Preview do perfil", `<p>${p.applicable} operação(ões) serão aplicadas; ${p.skipped} serão ignoradas por suporte.</p>${table([{ label: "Operação", keys: ["label"] }, { label: "Suporte", keys: ["support"] }, { label: "Resultado", render: (o) => o.will_apply ? "Aplicar" : "Pular" }], p.operations)}${p.operations.map((o) => `<section class="panel"><h3>${esc(o.label)}</h3>${table([{ label: "Campo", keys: ["field"] }, { label: "Atual", keys: ["current"] }, { label: "Novo", keys: ["desired"] }], o.changes || [])}</section>`).join("")}${(p.profile?.wifi?.ssids || []).map((s) => `<div class="field"><label>Nova senha de ${esc(s.ssid || s.id)} (opcional, não salva)</label><input type="password" data-transient-ssid="${esc(s.id)}" autocomplete="new-password" minlength="8"></div>`).join("")}`, `<button class="button primary" data-apply ${p.applicable ? "" : "disabled"}>Aplicar perfil</button>`);
        d.querySelector("[data-apply]").onclick = async (e) => {
          e.currentTarget.disabled = true;
          try {
            const secrets = {};
            for (const input of d.querySelectorAll("[data-transient-ssid]")) if (input.value) secrets[input.dataset.transientSsid] = input.value;
            const r = await request("/api/profiles/apply", { method: "POST", body: JSON.stringify({ name: b.dataset.previewProfile, secrets }) });
            toast(`Perfil: ${r.applied} comando(s) enviado(s), ${r.verified || 0} verificado(s), ${r.skipped} pulado(s), ${r.failed} falha(s), ${r.uncertain || 0} incerto(s).`);
            d.close();
          } catch (err) {
            toast(err.message);
            e.currentTarget.disabled = false;
          }
        };
      } catch (err) {
        toast(err.message);
      }
    });
  }
  function render4() {
    profiles = [];
    return `<section class="panel"><div class="panel-header"><h2>Perfis</h2><button class="button primary" id="new-profile">Novo perfil</button></div></section><div id="profile-list" role="status"><div class="panel"><p class="muted">Carregando perfis…</p><div class="skeleton"></div></div></div>`;
  }
  function mount4() {
    wire2();
    loadResource("/api/profiles", { data: (value) => {
      profiles = Array.isArray(value) ? value : [];
      const host = document.querySelector("#profile-list");
      if (!host) return;
      const html = contents2();
      patchHTML(host, html.slice(html.indexOf("</section>") + 10));
      host.removeAttribute("role");
      wire2();
    }, error: (e) => {
      const host = document.querySelector("#profile-list");
      if (host) host.innerHTML = `<div class="notice warning">${esc(e.message)}</div>`;
    } });
  }

  // apps/access_manager/static/js/workspaces/views/management.js
  var management_exports = {};
  __export(management_exports, {
    mount: () => mount5,
    render: () => render5
  });
  var definitions = [{ feature: "dmz", title: "DMZ", fields: [["enabled", "Habilitado", "bool"], ["internal_client", "IP do cliente"]] }, { feature: "upnp", title: "UPnP", fields: [["enabled", "Habilitado", "bool"]] }, { feature: "tr069", title: "TR-069", fields: [["url", "URL ACS"]] }, { feature: "firewall", title: "Firewall", fields: [["enabled", "Habilitado", "bool"], ["level", "Nível"]] }];
  var loaded = {};
  function presentation(feature, data) {
    const rows2 = { dmz: [["Estado", bool(data.enabled)], ["Cliente", data.internal_client || "Não configurado"], ["WAN", data.wan]], upnp: [["Estado", bool(data.enabled)]], tr069: [["Servidor ACS", data.url]], firewall: [["Estado", bool(data.enabled)], ["Nível", data.level]] };
    return fields(rows2[feature] || []) + `<details><summary>Avançado</summary>${kv(data)}</details>`;
  }
  var featureCap = (f) => f === "firewall" && (cap("firewall_level").enabled?.read || cap("firewall_level").enabled?.write) ? cap("firewall_level") : cap(f);
  async function render5() {
    const scope = currentScope();
    loaded = {};
    const results = await Promise.allSettled(definitions.map((d) => featureCap(d.feature).enabled?.read ? request("/api/device/" + d.feature) : Promise.resolve(null)));
    const history = await request("/api/device/history").catch(() => null);
    if (!scopeActive(scope)) throw cancelled();
    const reboot = cap("reboot");
    const device = await request("/api/device").catch(() => null);
    if (!scopeActive(scope)) throw cancelled();
    return `<section class="panel"><h2>Telemetria do equipamento</h2>${device ? fields([["Tempo ligado", uptime(device.uptime_seconds)], ["CPU", device.cpu_percent == null ? null : device.cpu_percent + " %"], ["Memória", device.memory_percent == null ? null : device.memory_percent + " %"], ["Temperatura", device.temperature_c == null ? null : device.temperature_c + " °C"]]) : '<p class="muted">Telemetria não disponível.</p>'}</section><section class="panel"><h2>Manutenção</h2><div class="capability-row"><strong>Reiniciar equipamento</strong>${capBadge(reboot.read)}${capBadge(reboot.write)}<button id="reboot-button" class="button danger" ${reboot.enabled?.write ? "" : "disabled"}>Reiniciar</button></div></section><div class="split">${definitions.map((d, i) => {
      const result = results[i];
      const value = result.status === "fulfilled" ? result.value : null;
      if (value) loaded[d.feature] = value;
      return `<section class="panel"><div class="panel-header"><h2>${d.title}</h2>${capBadge(featureCap(d.feature).write)}</div>${value ? presentation(d.feature, value) : `<p class="muted">${result.status === "rejected" ? esc(result.reason.message) : "Leitura não comprovada nesta sessão."}</p>`}<button class="button" data-config="${d.feature}" ${value && value.available !== false && featureCap(d.feature).enabled?.write ? "" : "disabled"}>Editar</button></section>`;
    }).join("")}</div><section class="panel"><h2>Histórico de operações</h2>${history ? table([{ label: "Data", keys: ["created_at"] }, { label: "Operação", keys: ["operation"] }, { label: "Alvo", keys: ["target"] }, { label: "Resultado", keys: ["outcome"] }], (history.changes || []).map((row) => ({ ...row, created_at: row.created_at ? new Date(row.created_at).toLocaleString("pt-BR") : null, outcome: { attempted: "Solicitado", accepted: "Aceito", verified: "Verificado", uncertain: "Sem confirmação", failed: "Falhou" }[row.outcome] || row.outcome }))) : '<p class="muted">Histórico não disponível.</p>'}</section>`;
  }
  function mount5() {
    document.querySelectorAll("[data-config]").forEach((b2) => b2.onclick = () => {
      const definition = definitions.find((d) => d.feature === b2.dataset.config), data = loaded[definition.feature];
      editConfig("Editar " + definition.title, "/api/device/" + definition.feature, definition.fields.map(([key2, label, type]) => ({ key: key2, label, type, value: data[key2] })));
    });
    const b = document.querySelector("#reboot-button");
    if (!b || b.disabled) return;
    b.onclick = () => {
      const d = dialog("Reiniciar equipamento?", `<p>A conexão ficará indisponível temporariamente.</p>`, `<button class="button" data-cancel>Cancelar</button><button class="button danger" data-confirm>Reiniciar</button>`);
      d.querySelector("[data-cancel]").onclick = () => d.close();
      d.querySelector("[data-confirm]").onclick = async (e) => {
        e.currentTarget.disabled = true;
        try {
          await request("/api/device/reboot", { method: "POST", body: "{}" });
          d.close();
          toast("Reboot solicitado. Aguarde a reconexão.");
        } catch (err) {
          toast(err.message);
        }
      };
    };
  }

  // apps/access_manager/static/js/workspaces/views/capabilities.js
  var capabilities_exports = {};
  __export(capabilities_exports, {
    render: () => render6
  });
  async function render6() {
    const caps = window.__amStore?.capabilities || {};
    const rows2 = Object.entries(caps);
    return `<section class="panel"><div class="panel-header"><div><h2>Capabilities</h2><span class="muted">Suporte e evidência são estados separados.</span></div></div>${rows2.length ? rows2.map(([name, c]) => `<div class="capability-row"><strong>${esc(name)}</strong>${capBadge(c.read)}${capBadge(c.write)}<span class="muted">${esc(c.evidence)}${c.source ? ` · ${esc(c.source)}` : ""}</span></div>`).join("") : '<div class="empty-state"><span>Sem capabilities na sessão.</span></div>'}</section>`;
  }

  // apps/access_manager/static/js/workspaces/views/traffic.js
  var traffic_exports = {};
  __export(traffic_exports, {
    mount: () => mount6,
    render: () => render7,
    unmount: () => unmount
  });
  var histories = /* @__PURE__ */ new Map();
  var session = null;
  var timer = null;
  var generation2 = 0;
  var seconds = 300;
  var key = (s) => s.source + ":" + s.identity;
  var rate = (v) => v == null ? "Aguardando amostra" : `${Number(v).toFixed(2)} Mbps`;
  function remember(s) {
    const k = key(s), h = histories.get(k) || [];
    h.push({ ...s, timestamp: s.timestamp || Date.now() / 1e3 });
    histories.set(k, h.slice(-2e3));
  }
  function card(s) {
    return `<section class="panel" data-stream="${esc(key(s))}"><h3>${esc({ wan: "WAN", lan: "LAN", wifi: "Wi-Fi", wifi_client: "Cliente Wi-Fi" }[s.source] || s.source)}</h3><p class="muted mono">${esc(s.identity)}</p><div class="grid">${[["Taxa RX", "rx_mbps"], ["Taxa TX", "tx_mbps"], ["Recebido", "rx_bytes"], ["Enviado", "tx_bytes"]].map(([label, k]) => `<article class="metric"><label>${label}</label><strong class="tech-value" data-value="${k}"></strong></article>`).join("")}</div><p data-sample-status class="muted"></p><svg class="sparkline" viewBox="0 0 600 140" role="img" aria-label="Taxas RX e TX"><polyline data-rx></polyline><polyline data-tx class="upload"></polyline></svg><p class="muted" data-chart-label></p><div class="human-fields">${["rx_packets", "tx_packets", "rx_errors", "tx_errors", "rx_discard", "tx_discard"].map((k) => `<div class="human-field"><span>${{ rx_packets: "Pacotes RX", tx_packets: "Pacotes TX", rx_errors: "Erros RX", tx_errors: "Erros TX", rx_discard: "Descartes RX", tx_discard: "Descartes TX" }[k]}</span><strong class="tech-value" data-value="${k}"></strong></div>`).join("")}</div></section>`;
  }
  function setText(el, value) {
    if (el) {
      if (el.textContent !== value) el.textContent = value;
      if (el.matches("[data-value]")) el.classList.toggle("muted", /^(Não disponível|Aguardando)/.test(value));
    }
  }
  function paint(d) {
    const host = document.querySelector("#traffic-streams");
    if (!host) return;
    const sources = d?.sources || [];
    setText(document.querySelector("#traffic-status"), sources.length ? "Amostras atualizadas." : "Nenhum contador ativo observado nesta sessão.");
    const active2 = new Set(sources.map(key));
    for (const el of host.children) {
      if (!active2.has(el.dataset.stream)) setText(el.querySelector("[data-sample-status]"), "Fonte não observada na última leitura; valores anteriores.");
    }
    for (const s of sources) {
      remember(s);
      let el = [...host.children].find((e) => e.dataset.stream === key(s));
      if (!el) {
        host.insertAdjacentHTML("beforeend", card(s));
        el = host.lastElementChild;
      }
      for (const node of el.querySelectorAll("[data-value]")) {
        const name = node.dataset.value, v = name.endsWith("_mbps") ? rate(s[name]) : name.endsWith("_bytes") ? formatBytes(s.counters?.[name]) : String(s.counters?.[name] ?? "Não disponível");
        setText(node, v);
      }
      setText(el.querySelector("[data-sample-status]"), s.counter_reset ? "Contador reiniciado; aguardando amostra." : "");
      plot(el, s);
    }
    const ranked = sources.filter((s) => ["client", "wifi_client"].includes(s.source)).filter((s) => s.counters?.rx_bytes != null || s.counters?.tx_bytes != null).sort((a, b) => Number(b.counters?.rx_bytes || 0) + Number(b.counters?.tx_bytes || 0) - (Number(a.counters?.rx_bytes || 0) + Number(a.counters?.tx_bytes || 0)));
    setText(document.querySelector("#traffic-ranking"), ranked.length ? ranked.slice(0, 5).map((s) => `${s.identity}: ${formatBytes(Number(s.counters?.rx_bytes || 0) + Number(s.counters?.tx_bytes || 0))}`).join(" · ") : "Ranking de clientes não disponível: o firmware não retornou contadores individuais.");
  }
  function plot(el, s) {
    const cutoff = Date.now() / 1e3 - seconds;
    const h = (histories.get(key(s)) || []).filter((v) => v.timestamp >= cutoff);
    const max = Math.max(1, ...h.flatMap((v) => [v.rx_mbps || 0, v.tx_mbps || 0]));
    const points = (k) => h.flatMap((v, i) => v[k] == null ? [] : [`${i * 600 / Math.max(1, h.length - 1)},${130 - v[k] * 120 / max}`]).join(" ");
    el.querySelector("[data-rx]").setAttribute("points", points("rx_mbps"));
    el.querySelector("[data-tx]").setAttribute("points", points("tx_mbps"));
    setText(el.querySelector("[data-chart-label]"), `RX azul · TX violeta · escala ${max.toFixed(2)} Mbps · ${h.length} pontos · médias por intervalo no histórico`);
  }
  async function render7() {
    const id = window.__amStore?.session?.session?.session_id;
    if (id !== session) {
      session = id;
      histories.clear();
    }
    return `<section class="panel"><div class="panel-header"><h2>Tráfego</h2><div class="toolbar"><select id="traffic-period" aria-label="Período"><option value="300">Últimos minutos</option><option value="3600">1 hora</option><option value="86400">24 horas</option></select><button class="button" id="traffic-refresh">Atualizar amostra</button></div></div><p class="muted" id="traffic-status">Aguardando leitura.</p><p class="muted">Contadores por interface; WAN/LAN/Wi-Fi não são somados.</p></section><div id="traffic-streams"></div><section class="panel"><h3>Consumo acumulado por cliente</h3><p id="traffic-ranking" class="muted"></p></section>`;
  }
  function mount6() {
    const token = ++generation2;
    let busy = false;
    const poll = async () => {
      if (token !== generation2 || busy) return;
      busy = true;
      try {
        const d = await request("/api/device/traffic");
        if (token === generation2) paint(d);
      } catch (err) {
        if (token === generation2) setText(document.querySelector("#traffic-status"), err.message);
      } finally {
        busy = false;
        if (token === generation2) {
          clearTimeout(timer);
          timer = setTimeout(poll, 5e3);
        }
      }
    };
    document.querySelector("#traffic-refresh").onclick = poll;
    const period = document.querySelector("#traffic-period");
    period.value = String(seconds);
    period.onchange = async () => {
      seconds = Number(period.value);
      try {
        const rows2 = await request("/api/device/traffic/history", { method: "POST", body: JSON.stringify({ seconds }) });
        if (token !== generation2) return;
        histories.clear();
        for (const r of rows2) remember(r);
        for (const el of document.querySelector("#traffic-streams").children) {
          const h = histories.get(el.dataset.stream);
          if (h?.length) plot(el, h.at(-1));
        }
      } catch (err) {
        setText(document.querySelector("#traffic-status"), err.message);
      }
    };
    poll();
  }
  function unmount() {
    generation2++;
    clearTimeout(timer);
  }

  // apps/access_manager/static/js/shared/diagnostics.js
  function diagnosticResult(d) {
    const technical = `<details><summary>Ver resposta técnica</summary><pre>${esc(JSON.stringify(d.advanced || d, null, 2))}</pre></details>`;
    const head = `<h3>${esc(d.target || "Destino não disponível")}</h3><p>${esc(d.status)} · ${esc(d.interface || "Interface não disponível")} · ${esc(d.protocol || "Protocolo não disponível")}</p>`;
    if (d.kind === "traceroute") return head + table([{ label: "Hop", keys: ["number"] }, { label: "IP / host", render: (r) => esc(r.host || "*") }, ...[0, 1, 2].map((i) => ({ label: `Latência ${i + 1}`, render: (r) => r.latencies_ms?.[i] != null ? `${esc(r.latencies_ms[i])} ms` : "*" })), { label: "Status", render: (r) => r.timeout ? "Timeout" : "Resposta recebida" }], d.hops || [], "Nenhum salto foi fornecido pelo equipamento.") + technical;
    return head + `<div class="grid">${[["Enviados", "sent"], ["Recebidos", "received"], ["Perda (%)", "loss_percent"], ["Mínimo (ms)", "min_ms"], ["Médio (ms)", "avg_ms"], ["Máximo (ms)", "max_ms"]].map(([label, key2]) => metric(label, d[key2] ?? "Não disponível")).join("")}</div>` + technical;
  }

  // apps/access_manager/static/js/workspaces/views/misc.js
  async function diagnostics() {
    const c = cap("diagnostics");
    const enabled = Boolean(c.enabled?.write);
    return `<section class="panel"><div class="panel-header"><div><h2>Diagnóstico</h2><span class="muted">Execute testes a partir do equipamento conectado.</span></div></div>
    <div class="split">
      <form id="ping-form" class="form-grid"><h3>Ping</h3><div class="field"><label>Destino</label><input name="host" value="8.8.8.8" required></div><div class="field"><label>Repetições</label><input name="count" type="number" min="1" max="20" value="4"></div><button class="button primary" ${enabled ? "" : "disabled"}>Executar ping</button></form>
      <form id="trace-form" class="form-grid"><h3>Traceroute</h3><div class="field"><label>Destino</label><input name="host" value="8.8.8.8" required></div><button class="button primary" ${enabled ? "" : "disabled"}>Executar traceroute</button></form>
    </div>
    <div id="diagnostic-result" class="panel"><span class="muted">${enabled ? "Pronto para executar." : `Capability diagnostics.write = ${esc(c.write)}.`}</span></div>
  </section>`;
  }
  function mountDiagnostics() {
    const out = document.querySelector("#diagnostic-result");
    const wire3 = (selector, path) => {
      const form = document.querySelector(selector);
      if (!form || !out) return;
      form.onsubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const payload = { host: String(fd.get("host") || "") };
        if (fd.get("count")) payload.count = Number(fd.get("count"));
        out.innerHTML = '<span class="muted">Executando…</span>';
        try {
          const result = await request(path, { method: "POST", body: JSON.stringify(payload) });
          out.innerHTML = diagnosticResult(result);
        } catch (err) {
          out.innerHTML = `<div class="notice danger">${esc(err.message)}</div>`;
          toast(err.message);
        }
      };
    };
    wire3("#ping-form", "/api/device/diagnostics/ping");
    wire3("#trace-form", "/api/device/diagnostics/traceroute");
  }
  async function deployment() {
    return `<section class="panel"><div class="panel-header"><h2>Implantação</h2></div><div class="notice warning">Workspace destinado a modelo/firmware desconhecido ou capability candidata. Ele não é uma autorização de escrita para operações já suportadas.</div></section>`;
  }

  // apps/access_manager/static/js/workspaces/app.js
  var mountedRoot = null;
  var workspace = null;
  var viewStates = /* @__PURE__ */ new Map();
  var meta = {
    overview: ["VISÃO OPERACIONAL", "Visão geral"],
    clients: ["VISÃO OPERACIONAL", "Clientes"],
    traffic: ["VISÃO OPERACIONAL", "Tráfego"],
    wifi: ["REDE", "Wi-Fi e SSIDs"],
    wan: ["REDE", "WAN"],
    lan: ["REDE", "LAN"],
    dhcpdns: ["REDE", "DHCP e DNS"],
    diagnostics: ["OPERAÇÕES", "Diagnóstico"],
    profiles: ["OPERAÇÕES", "Perfis"],
    management: ["OPERAÇÕES", "Gerenciamento"],
    capabilities: ["AVANÇADO", "Capabilities"],
    deployment: ["AVANÇADO", "Implantação"]
  };
  var views = {
    overview: overview_exports,
    clients: clients_exports,
    wifi: wifi_exports,
    profiles: profiles_exports,
    management: management_exports,
    capabilities: capabilities_exports,
    traffic: traffic_exports,
    diagnostics: { render: diagnostics, mount: mountDiagnostics },
    deployment: { render: deployment },
    wan: { render: wan },
    lan: { render: lan },
    dhcpdns: { render: dhcpdns, mount: mountDhcpDns }
  };
  function syncContext() {
    const s = store.session?.session;
    const disconnect = document.querySelector("#disconnect-button");
    const updated = document.querySelector("#ctx-updated");
    if (disconnect) disconnect.disabled = !s;
    if (updated) updated.textContent = s?.updated_at ? `Atualizado ${new Date(s.updated_at).toLocaleTimeString()}` : "—";
  }
  async function render8(name = store.view, background = false) {
    const scope = background ? currentScope() : beginView(name);
    if (!background) {
      views[store.view]?.unmount?.();
      const d = document.querySelector("#action-dialog");
      if (d?.open) d.close();
    }
    const state = { generation: scope.generation, loading: true, error: null };
    viewStates.set(name, state);
    scope.controller.signal.addEventListener("abort", () => {
      state.loading = false;
    }, { once: true });
    store.view = name;
    document.querySelectorAll(".nav").forEach((b) => b.classList.toggle("active", b.dataset.view === name));
    const [kicker, title] = meta[name] || meta.overview;
    const kickerEl = document.querySelector("#page-kicker");
    const titleEl = document.querySelector("#page-title");
    if (kickerEl) kickerEl.textContent = kicker;
    if (titleEl) titleEl.textContent = title;
    if (!store.session?.connected && name !== "profiles") {
      state.loading = false;
      workspace.innerHTML = '<div class="empty-state"><strong>Nenhum equipamento conectado</strong><span>Conecte-se para carregar este workspace.</span></div>';
      return;
    }
    if (!background) workspace.innerHTML = '<section class="panel" role="status"><p class="muted">Carregando dados…</p><div class="skeleton"></div><div class="skeleton"></div></section>';
    try {
      const view = views[name] || views.overview;
      const html = await view.render();
      if (!scopeActive(scope)) return;
      state.loading = false;
      if (background) patchHTML(workspace, html);
      else workspace.innerHTML = html;
      view.mount?.();
    } catch (e) {
      if (!scopeActive(scope) || isCancelled(e)) return;
      state.loading = false;
      state.error = e.message;
      workspace.innerHTML = `<div class="notice danger" role="alert">${esc(e.message)}</div>`;
    }
  }
  function normalizeConnectionPayload(form) {
    const fd = new FormData(form);
    const host = String(fd.get("host") || "").trim();
    const username = String(fd.get("username") || "").trim();
    const password = String(fd.get("password") || "");
    const modelHint = String(fd.get("model_hint") || "").trim();
    const https = Boolean(form.querySelector('[name="https"]')?.checked);
    return {
      host,
      username,
      password,
      https,
      model_hint: modelHint || null
    };
  }
  async function connectFromForm(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const button = document.querySelector("#connect-button");
    const originalLabel = button?.textContent || "Conectar";
    const payload = normalizeConnectionPayload(form);
    if (button) {
      button.disabled = true;
      button.textContent = "Conectando…";
    }
    try {
      const s = await request("/api/session", { method: "POST", body: JSON.stringify(payload) });
      if (!s?.connected || !s?.session) {
        throw new Error("A API não confirmou uma sessão autenticada no equipamento.");
      }
      store.setSession(s);
      store.setCapabilities(s.session?.capabilities || {});
      syncContext();
      const password = form.querySelector('[name="password"]');
      if (password) password.value = "";
      toast(`Conectado via ${payload.https ? "HTTPS" : "HTTP"} em ${s.session.model || s.session.vendor || payload.host}.`);
      await render8("overview");
    } catch (err) {
      toast(err?.message || "Não foi possível conectar ao equipamento.");
      console.error("[Access Manager] Falha de conexão:", err);
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = originalLabel;
      }
    }
  }
  async function mountApp() {
    const root2 = document.querySelector(".app-shell");
    if (!root2) throw new Error("Shell do Access Manager não foi encontrado.");
    if (mountedRoot === root2) return;
    mountedRoot = root2;
    window.__amStore = store;
    workspace = document.querySelector("#workspace");
    if (!workspace) throw new Error("Workspace do Access Manager não foi encontrado.");
    document.querySelectorAll(".nav").forEach((b) => {
      b.onclick = () => {
        document.querySelector("#sidebar")?.classList.remove("open");
        render8(b.dataset.view);
      };
    });
    const mobileNav = document.querySelector("#mobile-nav");
    if (mobileNav) mobileNav.onclick = () => document.querySelector("#sidebar")?.classList.toggle("open");
    const form = document.querySelector("#connect-form");
    if (!form) throw new Error("Formulário de conexão não foi encontrado.");
    form.addEventListener("submit", connectFromForm);
    const disconnect = document.querySelector("#disconnect-button");
    if (disconnect) {
      disconnect.onclick = async () => {
        try {
          await request("/api/session", { method: "DELETE" });
        } finally {
          store.setSession({ connected: false, session: null });
          store.setCapabilities({});
          syncContext();
          render8(store.view);
        }
      };
    }
    document.addEventListener("refresh-view", () => render8(store.view));
    let refreshTimer;
    document.addEventListener("snapshot-updated", (event) => {
      if (event.detail.generation !== currentScope()?.generation || ["wifi", "profiles", "traffic"].includes(store.view)) return;
      clearTimeout(refreshTimer);
      const scope = currentScope();
      refreshTimer = setTimeout(() => {
        if (scopeActive(scope)) render8(store.view, true);
      }, 16);
    });
    try {
      const s = await request("/api/session");
      store.setSession(s);
      store.setCapabilities(s.session?.capabilities || {});
      syncContext();
      await render8(s.connected ? currentScope() ? store.view : "overview" : store.view);
    } catch (error) {
      console.error("[Access Manager] Falha ao consultar sessão inicial:", error);
      await render8(store.view);
    }
  }

  // apps/access_manager/static/js/entry.js
  var root = document.querySelector(".app-shell");
  if (root && root.dataset.runtimeMounted !== "true") {
    root.dataset.runtimeMounted = "true";
    mountApp().catch((error) => {
      console.error("[Access Manager]", error);
      root.dataset.runtimeMounted = "failed";
    });
  }
})();
