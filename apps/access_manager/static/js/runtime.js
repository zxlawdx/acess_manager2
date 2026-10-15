(() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // apps/access_manager/static/js/services/api.js
  function parseResponseBody(text2) {
    if (!text2) return {};
    try {
      return JSON.parse(text2);
    } catch (_) {
      return { raw: text2 };
    }
  }
  async function request(path2, options = {}) {
    const { scope = defaultScope(path2, options), forceRefresh = false, ...fetchOptions } = options;
    const method = String(options.method || "GET").toUpperCase(), read2 = method === "GET";
    if (!scopeActive(scope)) throw cancelled();
    const canCache = read2 && cachedPaths.has(path2);
    sessionKey();
    const entry = canCache ? snapshots.get(path2) : null;
    if (!forceRefresh && entry && Date.now() - entry.time < 15e3) {
      if (Date.now() - entry.time > 3e3) request(path2, { ...options, scope, forceRefresh: true }).then(() => {
        if (scopeActive(scope)) document.dispatchEvent(new CustomEvent("snapshot-updated", { detail: { path: path2, generation: scope?.generation } }));
      }).catch(() => {
      });
      return clone(entry.data);
    }
    const key = cacheSession + ":" + (scope?.identity ?? "global") + ":" + path2;
    if (canCache && pending.has(key)) return pending.get(key);
    const start = performance.now(), epoch = revision;
    const work = (async () => {
      const url = new URL(path2, window.location.origin);
      const res = await fetch(url, { credentials: "same-origin", ...fetchOptions, signal: read2 ? fetchOptions.signal || scope?.controller.signal : fetchOptions.signal, headers: { "Content-Type": "application/json", ...options.headers || {} } });
      const text2 = await res.text(), data = parseResponseBody(text2);
      if (!read2 && !["/api/device/wifi/reveal-password", "/api/device/traffic/history", "/api/profiles/preview", "/api/device/diagnostics/ping", "/api/device/diagnostics/traceroute", "/api/device/diagnostics/dns-lookup", "/api/device/diagnostics/speedtest-discovery", "/api/device/configuration/read", "/api/device/configuration/preview", "/api/device/factory-reset/preview", "/api/device/diagnostics/speedtest/poll", "/api/device/diagnostics/workstation", "/api/device/diagnostics/full/run", "/api/device/diagnostics/full/history", "/api/device/diagnostics/full/export", "/api/device/traffic/device-history", "/api/management/artifacts/download"].includes(path2)) clearSnapshots();
      if (!scopeActive(scope) || canCache && epoch !== revision) throw cancelled();
      if (!res.ok) throw new Error(data?.error?.message || data?.message || `HTTP ${res.status} ao acessar ${url.pathname}`);
      if (data?.success === false) throw new Error(data?.error?.message || "Falha na operação");
      if (canCache) {
        const safe = clean(data);
        snapshots.set(path2, { time: Date.now(), data: safe });
        return clone(safe);
      }
      return data;
    })().catch((e) => {
      if (!scopeActive(scope) || isCancelled(e)) throw cancelled();
      throw e;
    }).finally(() => {
      if (pending.get(key) === work) pending.delete(key);
      timing(path2.startsWith("/api/device/wifi") ? "wifi.load." + (path2.split("/").at(-1) === "wifi" ? "total" : path2.split("/").at(-1)) : path2 + ".load", start);
    });
    if (canCache) pending.set(key, work);
    return work;
  }
  var generation = 0;
  var active = null;
  var cacheSession = null;
  var revision = 0;
  var scopeId = 0;
  var clone = (value2) => JSON.parse(JSON.stringify(value2));
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
  function defaultScope(path2, options) {
    if (path2 === "/api/session") return null;
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
    const key = window.__amStore?.session?.session?.session_id ?? "disconnected";
    if (cacheSession !== key) {
      clearSnapshots();
      cacheSession = key;
    }
    return key;
  }
  function clean(value2) {
    if (Array.isArray(value2)) return value2.map(clean);
    if (value2 && typeof value2 === "object") return Object.fromEntries(Object.entries(value2).filter(([k]) => !/(password|passwd|senha|secret|token|authorization)/i.test(k)).map(([k, v]) => [k, clean(v)]));
    return value2;
  }
  function cached(path2) {
    sessionKey();
    const entry = snapshots.get(path2);
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
  function loadResource(path2, { scope = currentScope(), data, error, refresh = false } = {}) {
    const entry = cached(path2);
    if (entry !== null && scopeActive(scope)) data(entry);
    return request(path2, { scope, forceRefresh: refresh || entry === null || Date.now() - (snapshots.get(path2)?.time || 0) > 3e3 }).then((value2) => {
      if (scopeActive(scope)) data(value2);
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
    const status3 = document.querySelector("#ctx-status");
    status3.textContent = online ? "● Online" : "○ Desconectado";
    status3.style.color = online ? "var(--success)" : "";
  }

  // apps/access_manager/static/js/shared/ui.js
  var esc = (value2) => String(value2 ?? "—").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  var pick = (obj, ...keys) => {
    for (const k of keys) {
      const v = obj?.[k];
      if (v !== void 0 && v !== null && v !== "") return v;
    }
    return "—";
  };
  function badge(value2, kind = "info") {
    return `<span class="badge ${kind}">${esc(value2)}</span>`;
  }
  var technicalLabel = (label) => /IP|MAC|DNS|VLAN|MTU|Mbps|latência|perda|enviados|recebidos|mínimo|médio|máximo|RX|TX|RSSI|SNR|banda|canal|largura|padrão|potência|país|velocidade|bytes|lease|uptime|tempo|memória|CPU|RAM|temperatura|máscara|pool|gateway|prefixo|firmware|hardware|serial|clientes|óptico/i.test(label);
  function valueClass(value2, technical = true) {
    const text2 = String(value2 ?? "");
    if (!text2 || /^(—|Não disponível|Aguardando|Sem dados|Não configurado)/i.test(text2)) return "muted";
    if (/^(online|ativo|conectado|connected|up|associado|associated|habilitado|saudável|verificado)$/i.test(text2)) return "value-success";
    if (/^(offline|erro|falha|desconectado|disconnected|down|sem link)$/i.test(text2)) return "value-danger";
    return technical ? "tech-value" : "";
  }
  function valueMarkup(value2, label = "") {
    const v = Array.isArray(value2) ? value2.join(", ") || "Não disponível" : value2 ?? "Não disponível";
    return `<span class="${valueClass(v, technicalLabel(label))}">${esc(v)}</span>`;
  }
  function metric(label, value2, detail = "") {
    return `<article class="metric"><label>${esc(label)}</label><strong class="${valueClass(value2)}">${esc(value2)}</strong>${detail ? `<small>${esc(detail)}</small>` : ""}</article>`;
  }
  function kv(data) {
    const items = Object.entries(data || {}).filter(([, v]) => v !== void 0 && v !== null && typeof v !== "object");
    return `<div class="kv-grid">${items.map(([k, v]) => `<div class="kv"><label>${esc(k.replaceAll("_", " "))}</label><span>${valueMarkup(typeof v === "boolean" ? v ? "Ativo" : "Inativo" : v, k)}</span></div>`).join("")}</div>`;
  }
  function table(columns2, rows3, empty2 = "Nenhum registro encontrado") {
    if (!Array.isArray(rows3) || !rows3.length) return `<div class="empty-state"><span>${esc(empty2)}</span></div>`;
    return `<div class="panel"><table class="data-table"><thead><tr>${columns2.map((c) => `<th>${esc(c.label)}</th>`).join("")}</tr></thead><tbody>${rows3.map((r) => `<tr>${columns2.map((c) => `<td>${c.render ? technicalLabel(c.label) ? `<span class="tech-value">${c.render(r)}</span>` : c.render(r) : valueMarkup(pick(r, ...c.keys || [c.key]), c.label)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
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
    d.classList.remove("drawer", "profile-dialog", "juniper-dialog", "j-drawer");
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
    return `<div class="human-fields">${items.map(([label, value2]) => `<div class="human-field"><span class="muted">${esc(label)}</span><strong>${valueMarkup(value2, label)}</strong></div>`).join("")}</div>`;
  }
  function uptime(v) {
    if (v == null || v === "") return "—";
    const n = Number(v);
    if (!Number.isFinite(n)) return String(v);
    const days = Math.floor(n / 86400), hours = Math.floor(n % 86400 / 3600), minutes = Math.floor(n % 3600 / 60);
    return `${days ? days + "d " : ""}${hours}h ${minutes}min`;
  }
  var linkStatus = (v) => ({ connected: "Conectado", disconnected: "Desconectado", up: "Ativo", down: "Sem link", unknown: "Desconhecido", associated: "Associado", enabled: "Habilitado", disabled: "Desabilitado", "1": "Ativo", "0": "Inativo" })[String(v ?? "").toLowerCase()] || v || "Não disponível";

  // apps/access_manager/static/js/shared/juniper-ui.js
  var button = (label, route) => `<button class="button" data-juniper-route="${esc(route)}">${esc(label)}</button>`;
  var empty = (title, description = "") => `<div class="j-empty"><strong>${esc(title)}</strong><p>${esc(description)}</p></div>`;
  var status = (value2) => `<span class="j-status ${/^(active|ativo|up|online|session up)$/i.test(value2 || "") ? "ok" : ""}"><i></i>${esc({ Active: "Ativo", Online: "Online" }[value2] || value2 || "Não disponível")}</span>`;
  var kv2 = (items) => `<dl class="j-kv">${items.map(([label, value2]) => `<div><dt>${esc(label)}</dt><dd>${esc(Array.isArray(value2) ? value2.join(", ") || "—" : value2 ?? "—")}</dd></div>`).join("")}</dl>`;
  function drawer(title, content, actions = "") {
    const d = dialog(title, `<div class="j-drawer-content">${content}</div>`, actions);
    d.classList.add("j-drawer");
    return d;
  }
  function tabs(items, active2, attribute = "data-j-tab") {
    return `<div class="j-tabs" role="tablist">${items.map(([id, label]) => `<button type="button" role="tab" aria-selected="${id === active2}" ${attribute}="${esc(id)}" class="${id === active2 ? "active" : ""}">${esc(label)}</button>`).join("")}</div>`;
  }
  function dataTable(columns2, rows3, selectAttribute = "") {
    if (!rows3?.length) return empty("Nenhum registro retornado", "A ausência de dados não confirma falha no equipamento.");
    return `<div class="j-table-scroll"><table class="data-table"><thead><tr>${columns2.map(([label]) => `<th scope="col">${esc(label)}</th>`).join("")}</tr></thead><tbody>${rows3.map((row, index) => `<tr ${selectAttribute ? `${selectAttribute}="${index}"` : ""}>${columns2.map(([, render10]) => `<td>${render10(row, index)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  }

  // apps/access_manager/static/js/workspaces/views/juniper.js
  var session = () => store.session?.session;
  var read = (path2, data = {}, scope = currentScope()) => request("/api/infrastructure/" + path2, { scope, method: "POST", body: JSON.stringify({ ...data, app_session_id: session()?.session_id }) });
  var go = (route) => document.dispatchEvent(new CustomEvent("juniper-navigate", { detail: route }));
  var copy = (value2) => value2 == null ? "—" : `<code>${esc(value2)}</code><button class="icon-button" data-copy-juniper="${esc(value2)}" aria-label="Copiar ${esc(value2)}" title="Copiar valor"><svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true"><rect x="5" y="5" width="9" height="9" rx="1"/><path d="M3 11H2V2h9v1"/></svg></button>`;
  function wireCopy(root2 = document) {
    root2.querySelectorAll("[data-copy-juniper]").forEach((b) => b.onclick = async () => {
      try {
        await navigator.clipboard.writeText(b.dataset.copyJuniper);
        toast("Copiado.");
      } catch {
        toast("Não foi possível copiar.");
      }
    });
  }
  var sourceId = null;
  var query = "";
  var selected = null;
  var rows = [];
  var candidates = [];
  var controller = null;
  var generation2 = 0;
  var selectionGeneration = 0;
  var tabGeneration = 0;
  var tab = "summary";
  var lastSubscriberRoute = null;
  function ensureContext() {
    if (sourceId !== session()?.session_id) {
      sourceId = session()?.session_id;
      query = "";
      selected = null;
      rows = [];
      candidates = [];
      tab = "summary";
      lastSubscriberRoute = null;
    }
  }
  var navigation = [
    ["Visão geral", [["juniperOverview", "Visão geral"]]],
    ["Assinantes", [["subscribers", "Buscar assinante"], ["juniperSubscriber", "Sessão PPPoE"], ["juniperAccounting", "Accounting"], ["juniperServices", "Serviços"]]],
    ["Infraestrutura", [["juniperInterfaces", "Interfaces"], ["juniperLacp", "LACP"], ["juniperOptics", "Óptica"], ["juniperRouting", "Roteamento"]]],
    ["AAA", [["juniperRadius", "RADIUS"], ["juniperAuth", "Autenticação"], ["juniperAaaAccounting", "Accounting AAA"], ["juniperDynamic", "Dynamic Requests"]]],
    ["Diagnóstico", [["juniperPppoe", "PPPoE"], ["juniperLockout", "Lockout"], ["juniperDiagnostics", "Ping / Traceroute"], ["juniperLogs", "Logs"]]],
    ["Sistema", [["juniperSystem", "Routing Engine"], ["juniperFpc", "FPC / Chassis"], ["juniperEnvironment", "Ambiente"], ["juniperHardware", "Hardware"]]]
  ];
  var titles = Object.fromEntries(navigation.flatMap(([group, items]) => items.map(([id, label]) => [id, [group, label]])));
  var labels = { username: "Usuário PPPoE", contract: "Contrato", state: "Estado", interface: "Interface", underlying_interface: "Underlying", session_id: "Subscriber Session ID", subscriber_session_id: "Subscriber Session ID", pppoe_session_id: "PPPoE Session ID", id: "Service Session ID", mac_address: "MAC", ipv4_address: "IPv4", ipv6_addresses: "IPv6", ipv6_prefixes: "Prefixos IPv6", routing_instance: "Routing instance", dynamic_profile_name: "Perfil dinâmico", bandwidth_in: "Shaping IN", bandwidth_out: "Shaping OUT", input_bytes: "Input bytes", output_bytes: "Output bytes", input_packets: "Input packets", output_packets: "Output packets", radius_accounting_id: "RADIUS Accounting ID", profile: "Profile", address: "Servidor", authentication_port: "Auth port", accounting_port: "Accounting port", preauthentication_port: "Preauth port", cumulative: "Contadores acumulados", current_incident: "Incidente atual", subscriber_offline: "Assinante offline", subscriber_match: "MAC do assinante localizado", total_clients_in_lockout: "Clientes em lockout neste segmento", semantics: "Semântica", bitrate_mbps: "Mbps (requer amostras)", temperature: "Temperatura", voltage: "Tensão", lanes: "Lanes", lane: "Lane", tx_power: "TX", rx_power: "RX", bias_current: "Bias", slot: "Slot", cpu_idle_percent: "CPU idle (%)", memory_used_percent: "Memória (%)", status: "Estado", mux_state: "MUX", synchronization: "Sync", name: "Nome" };
  function value(v) {
    return v === true ? "Sim" : v === false ? "Não" : v ?? "—";
  }
  function detailData(data) {
    if (Array.isArray(data)) {
      if (!data.length) return empty("Nenhum registro retornado");
      if (data.every((x) => x && typeof x === "object" && !Array.isArray(x))) {
        const keys = [...new Set(data.flatMap(Object.keys))].filter((k) => data.some((x) => x[k] != null && typeof x[k] !== "object"));
        return dataTable(keys.map((k) => [labels[k] || k.replaceAll("_", " "), (row) => esc(value(row[k]))]), data) + data.filter((x) => Object.values(x).some((v) => v && typeof v === "object")).map((x) => detailData(Object.fromEntries(Object.entries(x).filter(([, v]) => v && typeof v === "object")))).join("");
      }
      return `<p>${esc(data.join(", "))}</p>`;
    }
    if (data && typeof data === "object") {
      const entries = Object.entries(data).filter(([k]) => !["raw_capability_metadata", "underlying_interface_equality_required", "semantics"].includes(k));
      return kv2(entries.filter(([, v]) => v == null || typeof v !== "object").map(([k, v]) => [labels[k] || k.replaceAll("_", " "), value(v)])) + entries.filter(([, v]) => v && typeof v === "object").map(([k, v]) => `<section class="j-section"><h3>${esc(labels[k] || k.replaceAll("_", " "))}</h3>${detailData(v)}</section>`).join("");
    }
    return `<p>${esc(value(data))}</p>`;
  }
  var panel = (title, content, actions = "") => `<section class="panel j-panel"><div class="j-panel-header"><h2>${esc(title)}</h2>${actions}</div>${content}</section>`;
  function selectedRequired() {
    return empty("Selecione um assinante", "Busque o contrato, usuário PPPoE ou IP e escolha a sessão correta.") + button("Buscar assinante", "subscribers");
  }
  async function overview() {
    ensureContext();
    const results = await Promise.allSettled([read("system"), read("resources"), read("interfaces")]);
    const data = results[0].status === "fulfilled" ? results[0].value : null;
    if (!data) throw results[0].reason;
    const resources = results[1].status === "fulfilled" ? results[1].value : [], interfaces2 = results[2].status === "fulfilled" ? results[2].value : [];
    const re = resources[0], idle = Number(re?.cpu_idle_percent), cpu = re?.cpu_idle_percent != null && Number.isFinite(idle) ? `${100 - idle}%` : "—";
    return `<div class="j-intro"><div><h2>Juniper ${esc(data.model)}</h2><p>${esc(data.hostname || "—")} · ${esc(session()?.host)} · Junos ${esc(data.firmware || "—")}</p></div><div>${button("Buscar assinante", "subscribers")}<button class="button" data-j-refresh>Atualizar</button><button class="button" data-j-identity>Identidade SSH</button></div></div><div class="j-metrics">${[["Conexão", store.session?.connected ? "Online" : "Desconectado"], ["Routing Engine", re?.state || "—"], ["CPU", cpu], ["Memória", re?.memory_used_percent != null ? `${re.memory_used_percent}%` : "—"], ["Tempo ligado", uptime(data.uptime_seconds)]].map(([k, v]) => `<div><span>${esc(k)}</span><strong>${esc(v)}</strong></div>`).join("")}</div><div class="j-overview-grid">${panel("Infraestrutura", dataTable([["Interface", (r) => copy(r.name)], ["Admin", (r) => esc(r.admin_state)], ["Link", (r) => status(r.oper_state)]], interfaces2), button("Ver interfaces", "juniperInterfaces"))}${panel("AAA / RADIUS", `<p>Estado dos servidores e contadores sob demanda.</p><div class="j-link-list">${button("Servidores RADIUS", "juniperRadius")}${button("Autenticação", "juniperAuth")}${button("Accounting", "juniperAaaAccounting")}${button("Dynamic Requests", "juniperDynamic")}</div>`)}${panel("Identidade do equipamento", kv2([["Modelo", data.model], ["Junos", data.firmware], ["Família", data.family], ["Transporte", session()?.protocol_family]]))}</div>`;
  }
  function subscribers() {
    ensureContext();
    return `<div class="j-subscriber-grid"><section class="panel j-panel"><div class="j-panel-header"><h2>Assinantes</h2><span id="subscriber-count">${rows.length} resultados</span></div><form id="subscriber-search" class="j-toolbar"><label class="sr-only" for="subscriber-query">Contrato / usuário PPPoE / IP</label><input id="subscriber-query" name="query" required maxlength="80" value="${esc(query)}" placeholder="Buscar contrato, usuário PPPoE ou IP"><button class="button primary" type="submit">Buscar</button><button class="button" type="button" id="subscriber-cancel" disabled>Cancelar</button><button class="button" type="button" data-toggle-filters aria-expanded="false">Filtros</button></form><div id="subscriber-filters" class="j-toolbar" hidden><label>Estado <select id="subscriber-state"><option value="">Todos</option>${[...new Set(rows.map((r) => r.state).filter(Boolean))].map((s) => `<option>${esc(s)}</option>`).join("")}</select></label><button class="button" data-clear-filter>Limpar filtro</button></div><p id="subscriber-status" class="j-inline-status" role="status">${query ? "Atualizando a consulta…" : "Informe um contrato. Prefixos brd_, cdy_ e 364_; zeros preservados."}</p><div id="subscriber-candidates"></div><div id="subscriber-results"></div></section><aside id="subscriber-detail" class="panel j-detail" aria-label="Detalhes do assinante">${empty("Nenhuma sessão selecionada", "Escolha uma linha para consultar detalhes sem sair da lista.")}</aside></div>`;
  }
  function unmountSubscribers() {
    controller?.abort();
    controller = null;
    generation2++;
    selectionGeneration++;
    tabGeneration++;
  }
  function drawResults() {
    const host = document.querySelector("#subscriber-results");
    if (!host) return;
    const filter = document.querySelector("#subscriber-state")?.value;
    const visible = rows.filter((r) => !filter || r.state === filter);
    document.querySelector("#subscriber-count").textContent = `${visible.length} resultados`;
    document.querySelector("#subscriber-candidates").innerHTML = candidates.length ? `<details class="j-candidates" open><summary>Candidatos consultados</summary>${dataTable([["Candidato", (r) => `<code>${esc(r.candidate)}</code>`], ["Resultado", (r) => esc({ FOUND: "Encontrado", NOT_FOUND: "Não encontrado", TIMEOUT: "Tempo esgotado", ERROR: "Erro" }[r.status] || r.status)], ["Detalhe", (r) => esc(r.message || "—")]], candidates)}</details>` : "";
    host.innerHTML = dataTable([["Usuário", (r) => `<button class="j-text-button" data-subscriber="${esc(r.session_id)}">${esc(r.username)}</button>`], ["Estado", (r) => status(r.state)], ["IPv4", (r) => copy(r.ipv4_address)], ["MAC", (r) => `<code>${esc(r.mac_address || "—")}</code>`], ["Interface", (r) => `<code>${esc(r.interface || "—")}</code>`], ["Session ID", (r) => `<code>${esc(r.session_id)}</code>`], ["Uptime", (r) => esc(r.session_uptime || r.login_time || "—")]], visible);
    host.querySelectorAll("[data-subscriber]").forEach((b) => {
      b.closest("tr").classList.toggle("is-selected", b.dataset.subscriber === selected?.session_id);
      b.onclick = () => selectSubscriber(b.dataset.subscriber);
    });
    wireCopy(host);
  }
  function mountSubscribers() {
    const form = document.querySelector("#subscriber-search"), scope = currentScope(), cancel = document.querySelector("#subscriber-cancel"), message = document.querySelector("#subscriber-status");
    drawResults();
    document.querySelector("[data-toggle-filters]").onclick = (e) => {
      const f = document.querySelector("#subscriber-filters");
      f.hidden = !f.hidden;
      e.currentTarget.setAttribute("aria-expanded", String(!f.hidden));
    };
    document.querySelector("#subscriber-state").onchange = drawResults;
    document.querySelector("[data-clear-filter]").onclick = () => {
      document.querySelector("#subscriber-state").value = "";
      drawResults();
    };
    cancel.onclick = () => {
      controller?.abort();
      generation2++;
      message.textContent = "Busca cancelada.";
      cancel.disabled = true;
      form.querySelector("[type=submit]").disabled = false;
    };
    form.onsubmit = async (e) => {
      e.preventDefault();
      query = form.elements.query.value;
      controller?.abort();
      controller = new AbortController();
      const run = ++generation2, b = form.querySelector("[type=submit]");
      b.disabled = true;
      cancel.disabled = false;
      message.textContent = "Consultando BNG…";
      try {
        const result = await request("/api/infrastructure/subscribers/lookup", { scope, signal: controller.signal, method: "POST", body: JSON.stringify({ query, app_session_id: session()?.session_id }) });
        if (!scopeActive(scope) || run !== generation2) return;
        rows = result.sessions;
        candidates = result.candidates;
        message.textContent = (result.complete ? "" : "Busca incompleta. Não foi possível confirmar ausência em todos os prefixos. ") + (rows.length ? `${rows.length} sessão(ões) encontrada(s).` : result.complete ? "Nenhuma sessão ativa encontrada nesta consulta." : "Não foi possível confirmar ausência de sessão.");
        const select = document.querySelector("#subscriber-state"), old = select.value;
        select.innerHTML = '<option value="">Todos</option>' + [...new Set(rows.map((r) => r.state).filter(Boolean))].map((s) => `<option>${esc(s)}</option>`).join("");
        select.value = old;
        drawResults();
        if (selected) {
          const match = rows.find((r) => r.session_id === selected.session_id && r.username === selected.username);
          if (match) await selectSubscriber(match.session_id);
          else {
            selected = null;
            document.querySelector("#subscriber-detail").innerHTML = empty("A sessão anterior não está nesta consulta", "Selecione uma sessão atual.");
          }
        }
      } catch (error) {
        if (scopeActive(scope) && run === generation2 && !isCancelled(error)) message.textContent = error.message;
      } finally {
        if (scopeActive(scope) && run === generation2) {
          b.disabled = false;
          cancel.disabled = true;
        }
      }
    };
    if (query) queueMicrotask(() => form.requestSubmit());
  }
  async function selectSubscriber(id) {
    const run = ++selectionGeneration;
    const scope = currentScope(), host = document.querySelector("#subscriber-detail");
    host.innerHTML = '<p class="j-inline-status">Consultando sessão…</p>';
    try {
      const row = await read("subscribers/detail", { session_id: id }, scope);
      if (!scopeActive(scope) || run !== selectionGeneration) return;
      selected = row;
      drawResults();
      renderSideDetail();
    } catch (e) {
      if (scopeActive(scope) && run === tabGeneration) host.innerHTML = `<p role="alert">${esc(e.message)}</p>`;
    }
  }
  function renderSideDetail(active2 = "details") {
    const host = document.querySelector("#subscriber-detail");
    if (!host || !selected) return;
    const row = selected;
    host.innerHTML = `<div class="j-panel-header"><div><h2>${esc(row.username)}</h2>${status(row.state)}</div><button class="icon-button" data-close-detail aria-label="Recolher detalhes" title="Recolher detalhes">×</button></div>${tabs([["details", "Detalhes"], ["service", "Serviço"], ["network", "Rede"]], active2, "data-side-tab")}<div class="j-detail-body">${active2 === "service" ? detailData(row.service_sessions || []) : active2 === "network" ? kv2([["IPv6", row.ipv6_addresses], ["Underlying", row.underlying_interface], ["VLAN / S-VLAN", [row.vlan_id, row.stacked_vlan_id].filter(Boolean).join(" / ")], ["Routing instance", row.routing_instance]]) : kv2([["IPv4", row.ipv4_address], ["MAC", row.mac_address], ["Interface", row.interface], ["Subscriber Session ID", row.session_id], ["PPPoE Session ID", row.pppoe_session_id]])}</div><div class="j-detail-actions"><button class="button primary" data-access-cpe ${row.ipv4_address ? "" : "disabled"}>Acessar CPE</button>${button("Abrir sessão", "juniperSubscriber")}${button("Diagnóstico", "juniperPppoe")}</div>`;
    host.querySelectorAll("[data-side-tab]").forEach((b) => b.onclick = () => renderSideDetail(b.dataset.sideTab));
    host.querySelector("[data-close-detail]").onclick = () => {
      host.innerHTML = empty("Detalhes recolhidos", "Selecione uma linha para abrir novamente.");
    };
    host.querySelector("[data-access-cpe]").onclick = () => accessCpe(row);
  }
  var subscriberTabs = [["summary", "Resumo"], ["pppoe", "PPPoE"], ["aaa", "AAA"], ["accounting", "Accounting"], ["services", "Serviços"], ["routing", "Roteamento"], ["diagnostic", "Diagnóstico"]];
  function subscriberPage(initial2) {
    ensureContext();
    if (initial2 && lastSubscriberRoute !== store.view) tab = initial2;
    lastSubscriberRoute = store.view;
    if (!selected) return selectedRequired();
    return panel(selected.username, `<p>${status(selected.state)} · <code>${esc(selected.interface || "—")}</code></p>${tabs(subscriberTabs, tab)}<div id="subscriber-full-content"></div>`, `<div><button class="button" data-refresh-selected>Atualizar</button><button class="button primary" data-access-cpe>Acessar CPE</button></div>`);
  }
  async function context(kind, extra = {}) {
    return read("subscribers/context", { session_id: selected.session_id, username: selected.username, kind, ...extra });
  }
  async function renderSubscriberTab() {
    const run = ++tabGeneration;
    const host = document.querySelector("#subscriber-full-content"), scope = currentScope();
    if (!host) return;
    host.innerHTML = '<p class="j-inline-status">Consultando sessão…</p>';
    try {
      let html = "";
      if (tab === "summary") html = kv2(Object.entries(selected).filter(([k, v]) => ["contract", "username", "state", "ipv4_address", "mac_address", "interface", "underlying_interface", "session_id", "pppoe_session_id", "radius_accounting_id", "login_time"].includes(k)).map(([k, v]) => [labels[k] || k, v]));
      else if (tab === "services") {
        const filters = [...new Set([selected.input_filter, selected.output_filter, selected.ipv6_input_filter, selected.ipv6_output_filter, ...(selected.service_sessions || []).flatMap((s) => [s.input_filter, s.output_filter, s.ipv6_input_filter, s.ipv6_output_filter])].filter(Boolean))];
        html = '<p class="muted">Shaping aplicado; não confirma plano comercial.</p>' + detailData(selected.service_sessions || []) + filters.map((name) => `<button class="button" data-service-filter="${esc(name)}">Contadores: ${esc(name)}</button>`).join("") + '<div id="service-filter-result"></div>';
      } else if (tab === "routing") {
        const [route, fib] = await Promise.allSettled([context("route"), context("fib")]);
        html = [["Rota", route], ["Forwarding", fib]].map(([title, result]) => `<h3>${title}</h3>${result.status === "fulfilled" ? detailData(result.value.data) : `<p role="alert">${esc(result.reason.message)}</p>`}`).join("");
      } else {
        const kind = tab === "diagnostic" ? "lockout" : tab;
        const result = await context(kind);
        html = (kind === "accounting" ? '<p class="muted">Contadores acumulados IPv4 / IPv6; sem taxa instantânea inferida.</p>' : "") + detailData(kind === "pppoe" && result.data?.pppoe_session_id ? Object.fromEntries(Object.entries(result.data).filter(([k]) => k !== "session_id")) : result.data);
      }
      if (tab === "summary") {
        const primary = /* @__PURE__ */ new Set(["contract", "username", "state", "ipv4_address", "mac_address", "interface", "underlying_interface", "session_id", "pppoe_session_id", "radius_accounting_id", "login_time"]);
        html += `<details class="j-advanced"><summary>Endereçamento e atributos avançados</summary>${detailData(Object.fromEntries(Object.entries(selected).filter(([k]) => !primary.has(k) && k !== "service_sessions")))}</details>`;
      }
      if (scopeActive(scope) && run === tabGeneration) {
        host.innerHTML = html;
        host.querySelectorAll("[data-service-filter]").forEach((b) => b.onclick = async () => {
          b.disabled = true;
          try {
            const result = await context("filter", { filter: b.dataset.serviceFilter });
            if (scopeActive(scope) && run === tabGeneration) document.querySelector("#service-filter-result").innerHTML = detailData(result.data);
          } catch (e) {
            if (scopeActive(scope) && run === tabGeneration) document.querySelector("#service-filter-result").textContent = e.message;
          } finally {
            if (scopeActive(scope) && run === tabGeneration) b.disabled = false;
          }
        });
      }
    } catch (e) {
      if (scopeActive(scope) && run === tabGeneration) host.innerHTML = `<p role="alert">${esc(e.message)}</p>`;
    }
  }
  function mountSubscriberPage() {
    if (!selected) return;
    document.querySelectorAll("[data-j-tab]").forEach((b) => b.onclick = () => {
      tab = b.dataset.jTab;
      document.querySelectorAll("[data-j-tab]").forEach((x) => {
        x.classList.toggle("active", x === b);
        x.setAttribute("aria-selected", String(x === b));
      });
      renderSubscriberTab();
    });
    document.querySelector("[data-access-cpe]").onclick = () => accessCpe(selected);
    document.querySelector("[data-refresh-selected]").onclick = async () => {
      try {
        const row = await read("subscribers/detail", { session_id: selected.session_id });
        selected = row;
        go(store.view);
      } catch (e) {
        toast(e.message);
      }
    };
    renderSubscriberTab();
  }
  async function interfaces(kind = null) {
    ensureContext();
    const result = await read("interfaces");
    return panel(kind === "lacp" ? "LACP" : kind === "optics" ? "Óptica" : "Interfaces Junos", `<p class="j-inline-status">Selecione uma interface para consultar ${kind === "lacp" ? "LACP" : kind === "optics" ? "valores por lane" : "estado e contadores"}. Leituras sob demanda.</p>${dataTable([["Interface", (r, i) => `<button class="j-text-button" data-junos-interface="${esc(r.name)}" data-link-page="${kind || ""}">${esc(r.name)}</button>`], ["Admin", (r) => esc(r.admin_state || "—")], ["Link", (r) => status(r.oper_state)], ["Speed", (r) => esc(r.speed || "—")], ["MTU", (r) => esc(r.mtu || "—")], ["Endereços", (r) => esc((r.addresses || []).join(", ") || "—")]], result)}`);
  }
  function mountInterfaces() {
    document.querySelectorAll("[data-junos-interface]").forEach((b) => b.onclick = async () => {
      const scope = currentScope();
      try {
        const name = b.dataset.junosInterface, kind = b.dataset.linkPage;
        const result = await read(kind ? "interfaces/link" : "interfaces/detail", kind ? { name, kind } : { name }, scope);
        if (!scopeActive(scope)) return;
        const d = drawer(name, detailData(kind ? result.data : result) + `<div class="inline-actions"><button class="button" data-link-kind="lacp">LACP</button><button class="button" data-link-kind="optics">Óptica por lane</button></div><div id="link-read-result"></div>`);
        d.querySelectorAll("[data-link-kind]").forEach((x) => x.onclick = async () => {
          const drawerScope = d._requestScope;
          x.disabled = true;
          try {
            const r = await read("interfaces/link", { name, kind: x.dataset.linkKind }, d._requestScope);
            if (d.open && d._requestScope === drawerScope) d.querySelector("#link-read-result").innerHTML = detailData(r.data);
          } catch (e) {
            if (d.open && d._requestScope === drawerScope) d.querySelector("#link-read-result").textContent = e.message;
          } finally {
            if (d.open) x.disabled = false;
          }
        });
      } catch (e) {
        toast(e.message);
      }
    });
  }
  async function health(kind) {
    const result = await read("health", { kind });
    return panel(titles[store.view]?.[1] || "Saúde", `${kind.startsWith("aaa_") ? '<p class="j-inline-status">Contadores acumulados. O total histórico não confirma incidente atual.</p>' : ""}${detailData(result.data)}`);
  }
  async function system(kind = "resources") {
    const data = await read(kind);
    return panel(kind === "resources" ? "Routing Engine" : "Hardware / chassis", detailData(data));
  }
  function mountCommon() {
    document.querySelectorAll("[data-j-identity]").forEach((b) => b.onclick = () => document.querySelector("#inspect-host-key").click());
    document.querySelectorAll("[data-j-refresh]").forEach((b) => b.onclick = () => go(store.view));
    wireCopy();
  }
  function routeView(route) {
    const map = { juniperOverview: [overview, mountCommon], subscribers: [subscribers, mountSubscribers, unmountSubscribers], juniperSubscriber: [() => subscriberPage("summary"), mountSubscriberPage], juniperAccounting: [() => subscriberPage("accounting"), mountSubscriberPage], juniperServices: [() => subscriberPage("services"), mountSubscriberPage], juniperRouting: [() => subscriberPage("routing"), mountSubscriberPage], juniperPppoe: [() => subscriberPage("pppoe"), mountSubscriberPage], juniperLockout: [() => subscriberPage("diagnostic"), mountSubscriberPage], juniperInterfaces: [() => interfaces(), mountInterfaces], juniperLacp: [() => interfaces("lacp"), mountInterfaces], juniperOptics: [() => interfaces("optics"), mountInterfaces], juniperRadius: [() => health("radius")], juniperAuth: [() => health("aaa_authentication")], juniperAaaAccounting: [() => health("aaa_accounting")], juniperDynamic: [() => health("aaa_dynamic")], juniperSystem: [() => system()], juniperFpc: [() => health("fpc")], juniperEnvironment: [() => health("environment")], juniperHardware: [() => system("chassis")], juniperDiagnostics: [diagnostics, mountDiagnostics], juniperLogs: [() => panel("Logs", empty("Leitor de logs indisponível", "A API atual não fornece logs Juniper. Nenhuma saída foi simulada."))] };
    const [render10, mount8, unmount] = map[route];
    return { render: render10, mount: mount8, unmount };
  }
  function diagnostics() {
    return `<section class="panel"><h2>Diagnóstico a partir do Juniper</h2><p class="muted">Origem: Juniper da sessão conectada. Selecione a routing instance explicitamente quando necessário.</p><form id="juniper-diagnostic-form" class="form-grid"><div class="field"><label>Destino IPv4 / IPv6</label><input name="target" required placeholder="192.0.2.10"></div><div class="field"><label>Routing instance (opcional)</label><input name="routing_instance" maxlength="127"></div><div class="field"><label>Teste</label><select name="kind"><option value="ping">Ping — 4 pacotes</option><option value="traceroute">Traceroute — até 8 saltos</option></select></div><button class="button primary" type="submit">Executar no Juniper</button></form><div id="juniper-diagnostic-result" role="status"></div></section>`;
  }
  function mountDiagnostics() {
    const form = document.querySelector("#juniper-diagnostic-form"), scope = currentScope();
    form.onsubmit = async (event) => {
      event.preventDefault();
      const button2 = form.querySelector("button");
      button2.disabled = true;
      try {
        const result = await read("diagnostics", Object.fromEntries(new FormData(form)), scope);
        if (scopeActive(scope)) document.querySelector("#juniper-diagnostic-result").innerHTML = fields([["Origem", "Juniper " + (result.hostname || "")], ["Destino", result.target], ["Routing instance", result.routing_instance], ["Enviados", result.packets_sent], ["Recebidos", result.packets_received], ["Perda reportada", result.packet_loss_reported], ["RTT médio (formato do firmware)", result.rtt_average_reported]]) + table([{ label: "Salto", keys: ["hop"] }, { label: "Endereços", render: (r) => esc(r.addresses.join(", ")) }, { label: "RTT reportado", render: (r) => esc(r.rtt_reported.join(", ")) }], result.hops || []);
      } catch (e) {
        if (scopeActive(scope)) document.querySelector("#juniper-diagnostic-result").textContent = e.message;
      } finally {
        button2.disabled = false;
      }
    };
  }
  async function accessCpe(row) {
    try {
      const draft = await read("subscribers/cpe-draft", { session_id: row.session_id, username: row.username, ipv4_address: row.ipv4_address });
      const d = drawer("Acessar CPE", `<p><strong>${esc(draft.subscriber_username)}</strong> · via Juniper</p><p>Contrato ${esc(draft.contract || "—")} · MAC <code>${esc(row.mac_address || "—")}</code></p><p class="muted">Atualizado ${esc(new Date(draft.refreshed_at * 1e3).toLocaleTimeString())}</p><p class="muted">IP localizado no BNG. O acesso de gerenciamento parte deste computador e pode depender de rota, ACL ou porta habilitada.</p><form id="cpe-handoff" class="form-grid"><div class="field"><label>IPv4</label><input name="host" value="${esc(draft.host)}" readonly required><label><input type="checkbox" name="edit_host"> Editar endereço explicitamente</label></div><div class="field"><label>Porta</label><input name="port" type="number" min="1" max="65535" value="80" required></div><div class="field"><label>Protocolo</label><select name="protocol"><option value="auto">Automático (HTTP; HTTPS na porta 443)</option><option value="http">HTTP</option><option value="https">HTTPS</option></select></div><div class="field"><label>Fabricante</label><select name="vendor"><option value="auto">Automático</option><option value="huawei">Huawei</option><option value="zte">ZTE</option></select></div><div class="field"><label>Usuário do CPE</label><input name="username" autocomplete="off" required></div><div class="field"><label>Senha do CPE</label><input name="password" type="password" autocomplete="off" required></div><p id="cpe-feedback" role="status"></p></form>`, `<button class="button" type="button" data-probe-cpe>Verificar porta</button><button class="button primary" type="submit" form="cpe-handoff">Conectar ao CPE</button>`);
      d.classList.add("juniper-dialog");
      const drawerScope = d._requestScope;
      const form = d.querySelector("form");
      form.elements.edit_host.onchange = () => {
        form.elements.host.readOnly = !form.elements.edit_host.checked;
      };
      d.querySelector("[data-probe-cpe]").onclick = async (event) => {
        const button2 = event.currentTarget;
        button2.disabled = true;
        try {
          const values = Object.fromEntries(new FormData(form));
          delete values.password;
          delete values.username;
          const result = await request("/api/infrastructure/subscribers/cpe-port", { method: "POST", body: JSON.stringify({ ...draft, ...values, source_host: draft.host, edit_host: form.elements.edit_host.checked }) });
          if (d.open && d._requestScope === drawerScope) d.querySelector("#cpe-feedback").textContent = result.status === "CPE_PORT_REACHABLE" ? "Porta TCP acessível a partir deste computador. Autenticação ainda não testada." : "Porta inacessível a partir deste computador. Isso não confirma que o assinante esteja offline.";
        } catch (e) {
          if (d.open && d._requestScope === drawerScope) d.querySelector("#cpe-feedback").textContent = e.message;
        } finally {
          if (d.open) button2.disabled = false;
        }
      };
      form.onsubmit = async (event) => {
        event.preventDefault();
        const button2 = d.querySelector("[type=submit]");
        button2.disabled = true;
        const payload = { ...draft, ...Object.fromEntries(new FormData(form)), source_host: draft.host, edit_host: form.elements.edit_host.checked };
        form.elements.password.value = "";
        try {
          const result = await request("/api/infrastructure/subscribers/connect-cpe", { method: "POST", body: JSON.stringify(payload) });
          d.close();
          document.dispatchEvent(new CustomEvent("session-selected", { detail: result }));
        } catch (error) {
          if (d.open && d._requestScope === drawerScope) d.querySelector("#cpe-feedback").textContent = `Acesso de gerenciamento não confirmado: ${error.message} Isso não confirma que o assinante esteja offline.`;
        } finally {
          payload.password = "";
          if (d.open) button2.disabled = false;
        }
      };
    } catch (error) {
      toast(error.message);
    }
  }

  // apps/access_manager/static/js/workspaces/views/overview.js
  var overview_exports = {};
  __export(overview_exports, {
    mount: () => mount2,
    render: () => render2
  });

  // apps/access_manager/static/js/workspaces/views/clients.js
  var clients_exports = {};
  __export(clients_exports, {
    mount: () => mount,
    mountDetails: () => mountDetails,
    render: () => render,
    topology: () => topology
  });
  var rows2 = [];
  var status2 = (r) => {
    const v = pick(r, "status", "estado", "online");
    if (v === "—") return badge("Não disponível");
    if (v === false || /^(offline|disconnected|false|0)$/i.test(String(v))) return badge("Offline", "bad");
    if (v === true || /^(online|connected|associated|up|true|1)$/i.test(String(v))) return badge("Online", "ok");
    return badge(linkStatus(v));
  };
  var connection = (r) => pick(r, "connection_type", "tipo", "interface");
  var band = (r) => pick(r, "band", "banda");
  var columns = [{ label: "Status", render: status2 }, { label: "Hostname", render: (r) => `<button class="icon-button" data-client="${rows2.indexOf(r)}">${esc(pick(r, "hostname", "nome"))}</button>` }, { label: "IPv4", keys: ["ip", "ipv4"] }, { label: "IPv6", keys: ["ipv6"] }, { label: "MAC", keys: ["mac"] }, { label: "Conexão", render: connection }, { label: "SSID / porta", keys: ["ssid", "port", "interface"] }, { label: "Banda", render: band }, { label: "RSSI", keys: ["rssi"] }, { label: "SNR", keys: ["snr"] }, { label: "RX / TX", render: (r) => `${esc(pick(r, "rx_rate"))} / ${esc(pick(r, "tx_rate"))}` }];
  function cards(data) {
    return `<div class="client-cards">${data.map((r) => `<button class="client-card" data-client="${rows2.indexOf(r)}"><strong>${esc(pick(r, "hostname", "nome"))}</strong><span class="mono tech-address">${esc(pick(r, "ip"))}</span><small>${esc(connection(r))} · ${esc(band(r))}</small>${status2(r)}</button>`).join("")}</div>`;
  }
  function topology(data, device = "Equipamento", register = true) {
    if (register) rows2 = data;
    const groups = /* @__PURE__ */ new Map();
    for (const r of data) {
      const c = String(connection(r)).toLowerCase();
      const b = String(band(r));
      let key = /mesh/.test(c) ? "Mesh" : /wi.fi|wlan|wifi/.test(c) ? /2[.,]4/.test(b) ? "Wi-Fi 2.4 GHz" : /5/.test(b) ? "Wi-Fi 5 GHz" : "Wi-Fi — banda não disponível" : /ethernet|lan|eth/.test(c) ? "Ethernet" : "Conexão não disponível";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(r);
    }
    return `<section class="panel"><h2>Topologia da rede</h2><div class="topology-root">${esc(device)}</div><div class="topology-branches">${[...groups].map(([k, v]) => `<div class="topology-branch"><h3>${esc(k)} · ${v.length}</h3>${cards(v)}</div>`).join("")}</div>${data.length ? "" : '<p class="muted">Nenhum cliente observado nesta sessão.</p>'}</section>`;
  }
  function mountDetails() {
    document.querySelectorAll("[data-client]").forEach((btn) => btn.onclick = () => {
      const r = rows2[Number(btn.dataset.client)];
      if (!r) return;
      const data = { Hostname: pick(r, "hostname", "nome"), IPv4: pick(r, "ip", "ipv4"), IPv6: pick(r, "ipv6_addresses", "ipv6"), MAC: pick(r, "mac"), Conexão: connection(r), Interface: pick(r, "interface", "port"), SSID: pick(r, "ssid"), Banda: band(r), RSSI: pick(r, "rssi"), SNR: pick(r, "snr"), "RX bytes": pick(r, "rx_bytes"), "TX bytes": pick(r, "tx_bytes"), "Taxa RX": pick(r, "rx_rate"), "Taxa TX": pick(r, "tx_rate"), Fabricante: pick(r, "manufacturer"), Estado: linkStatus(pick(r, "status", "online")), Lease: pick(r, "lease") };
      const d = dialog("Detalhes do cliente", kv(data));
      d.classList.add("drawer");
      d.addEventListener("close", () => {
        if (!d.open) d.classList.remove("drawer");
      }, { once: true });
    });
  }
  async function render() {
    rows2 = await request("/api/device/clients");
    if (!Array.isArray(rows2)) rows2 = [];
    const ssids = [...new Set(rows2.map((r) => r.ssid).filter(Boolean))];
    const warnings = [...new Set(rows2.flatMap((r) => r.collection_warnings || []))];
    return `${warnings.map((w) => `<p class="notice warning">${esc(w)}</p>`).join("")}<section class="panel"><div class="toolbar"><input id="client-search" placeholder="Buscar hostname, IP ou MAC" aria-label="Buscar clientes"><select id="client-filter" aria-label="Conexão"><option value="">Todas as conexões</option><option>Wi-Fi</option><option>Ethernet</option><option>Mesh</option></select><select id="client-band" aria-label="Banda"><option value="">Todas as bandas</option><option value="2.4">2.4 GHz</option><option value="5">5 GHz</option></select><select id="client-ssid" aria-label="SSID"><option value="">Todos os SSIDs</option>${ssids.map((s) => `<option>${esc(s)}</option>`).join("")}</select><select id="client-view" aria-label="Visualização"><option value="table">Tabela</option><option value="cards">Cards</option><option value="topology">Topologia</option></select></div><div id="client-results"></div></section>`;
  }
  function mount() {
    const paint = () => {
      const q = document.querySelector("#client-search").value.toLowerCase(), type = document.querySelector("#client-filter").value, b = document.querySelector("#client-band").value, ssid = document.querySelector("#client-ssid").value, view = document.querySelector("#client-view").value;
      const filtered = rows2.filter((r) => (!q || [r.hostname, r.ip, r.ipv6, r.mac].some((v) => String(v || "").toLowerCase().includes(q))) && (!type || String(connection(r)).includes(type)) && (!b || String(band(r)).replace(",", ".").includes(b)) && (!ssid || r.ssid === ssid));
      const all = rows2;
      document.querySelector("#client-results").innerHTML = view === "table" ? table(columns, filtered) : view === "cards" ? cards(filtered) : topology(filtered, "Equipamento", false);
      rows2 = all;
      mountDetails();
    };
    document.querySelectorAll("#client-search,#client-filter,#client-band,#client-ssid,#client-view").forEach((e) => e.addEventListener("input", paint));
    paint();
  }

  // apps/access_manager/static/js/shared/traffic-chart.js
  var sessions = /* @__PURE__ */ new Map();
  var streamKey = (s) => s.source + ":" + s.identity;
  var rate = (v) => v == null ? "Não disponível" : Number(v).toFixed(2) + " Mbps";
  function trafficChart(title) {
    return `<section class="am-panel traffic-main" data-stream=""><div class="am-section-head"><h2>${title}</h2><select data-stream-select aria-label="Interface do gráfico"><option value="">Aguardando fonte</option></select></div><div class="traffic-current"><span>RX <strong class="tech-value" data-value="rx_mbps">—</strong></span><span>TX <strong class="tech-value" data-value="tx_mbps">—</strong></span></div><div class="traffic-chart-wrap"><svg viewBox="0 0 700 260" role="img" aria-label="RX azul e TX violeta"><g class="chart-grid">${[20, 80, 140, 200, 230].map((y) => `<line x1="42" x2="680" y1="${y}" y2="${y}"/>`).join("")}</g><text x="2" y="20" data-axis-max>—</text><text x="2" y="234">0</text><path data-area-rx class="chart-area-rx"/><path data-area-tx class="chart-area-tx"/><path data-line-rx class="chart-line-rx"/><path data-line-tx class="chart-line-tx"/><polyline data-rx opacity="0"/><polyline data-tx opacity="0"/></svg><div class="chart-tooltip" hidden></div></div><div class="chart-legend"><span class="legend-rx">● RX / recebido</span><span class="legend-tx">● TX / enviado</span><small data-chart-label>Aguardando amostras</small></div><p class="muted" data-sample-status></p><div class="traffic-totals"><span>Recebido <strong class="tech-value" data-value="rx_bytes">—</strong></span><span>Enviado <strong class="tech-value" data-value="tx_bytes">—</strong></span></div><details class="traffic-counter-details"><summary>Contadores da interface</summary><p class="mono" data-counter-identity></p><div class="human-fields">${[["rx_packets", "Pacotes RX"], ["tx_packets", "Pacotes TX"], ["rx_errors", "Erros RX"], ["tx_errors", "Erros TX"], ["rx_discard", "Descartes RX"], ["tx_discard", "Descartes TX"]].map(([key, label]) => `<div class="human-field"><span>${label}</span><strong class="tech-value" data-value="${key}">Não disponível</strong></div>`).join("")}</div></details></section>`;
  }
  function text(el, value2) {
    if (el && el.textContent !== value2) el.textContent = value2;
  }
  function path(points) {
    if (!points.length) return "";
    let d = `M${points[0][0]},${points[0][1]}`;
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1], b = points[i], mid = (a[0] + b[0]) / 2;
      d += ` C${mid},${a[1]} ${mid},${b[1]} ${b[0]},${b[1]}`;
    }
    return d;
  }
  function mountTrafficChart({ initial: initial2 = null, onSample = () => {
  }, ranking = null } = {}) {
    const scope = currentScope(), host = document.querySelector(".traffic-main");
    if (!host) return;
    const id = window.__amStore?.session?.session?.session_id;
    let state = sessions.get(id);
    if (!state) {
      sessions.clear();
      state = { histories: /* @__PURE__ */ new Map(), sources: [] };
      sessions.set(id, state);
    }
    let selected2 = "", seconds = 300, timer, busy = false, historyStamp = 0;
    const remember = (r) => {
      const key = streamKey(r), h = state.histories.get(key) || [], timestamp = r.timestamp || Date.now() / 1e3;
      if (!h.some((v) => v.timestamp === timestamp)) h.push({ ...r, timestamp });
      h.sort((a, b) => a.timestamp - b.timestamp);
      state.histories.set(key, h.slice(-2e3));
    };
    function plot() {
      const source = state.sources.find((s) => streamKey(s) === selected2);
      if (!source) return;
      host.dataset.stream = selected2;
      text(host.querySelector("[data-counter-identity]"), source.identity || "Não disponível");
      for (const key of ["rx_mbps", "tx_mbps", "rx_bytes", "tx_bytes", "rx_packets", "tx_packets", "rx_errors", "tx_errors", "rx_discard", "tx_discard"]) text(host.querySelector(`[data-value="${key}"]`), key.endsWith("mbps") ? rate(source[key]) : key.endsWith("bytes") ? formatBytes(source.counters?.[key]) : String(source.counters?.[key] ?? "Não disponível"));
      const h = (state.histories.get(selected2) || []).filter((r) => r.timestamp >= Date.now() / 1e3 - seconds), max = Math.max(1, ...h.flatMap((r) => [r.rx_mbps, r.tx_mbps]).filter(Number.isFinite)), min = h[0]?.timestamp, last = h.at(-1)?.timestamp;
      host._chartHistory = h;
      text(host.querySelector("[data-axis-max]"), max.toFixed(1));
      for (const [direction, key] of [["rx", "rx_mbps"], ["tx", "tx_mbps"]]) {
        const segments = [];
        let current = [];
        for (const row of h) {
          if (!Number.isFinite(row[key])) {
            if (current.length) segments.push(current);
            current = [];
            continue;
          }
          current.push([42 + (row.timestamp - min) / (last - min || 1) * 638, 230 - row[key] / max * 210]);
        }
        if (current.length) segments.push(current);
        host.querySelector(`[data-${direction}]`).setAttribute("points", segments.flat().map((p) => p.join(",")).join(" "));
        host.querySelector(`[data-line-${direction}]`).setAttribute("d", segments.map(path).join(" "));
        host.querySelector(`[data-area-${direction}]`).setAttribute("d", segments.filter((s) => s.length > 1).map((s) => path(s) + ` L${s.at(-1)[0]},230 L${s[0][0]},230 Z`).join(" "));
      }
      text(host.querySelector("[data-chart-label]"), `${h.length} amostras · Mbps · ${source.label || source.ssid || source.source}`);
      text(host.querySelector("[data-sample-status]"), source.counter_reset ? "Contador reiniciado; aguardando próxima amostra." : !Number.isFinite(source.rx_mbps) && !Number.isFinite(source.tx_mbps) ? "Aguardando duas amostras válidas." : "Atualizado em " + (/* @__PURE__ */ new Date()).toLocaleTimeString("pt-BR"));
    }
    function paint(data) {
      if (!scopeActive(scope) || !host.isConnected) return;
      const sources = data?.sources || [];
      text(document.querySelector("#traffic-status"), sources.length ? "Amostras atualizadas." : "Nenhum contador ativo observado nesta sessão.");
      if (!sources.length) {
        text(host.querySelector("[data-sample-status]"), "Nenhum contador ativo observado nesta sessão; valores anteriores, se existentes.");
        return;
      }
      state.sources = sources;
      sources.forEach(remember);
      const select = host.querySelector("[data-stream-select]");
      for (const source of sources) {
        const key = streamKey(source);
        let option = [...select.options].find((o) => o.value === key);
        if (!option) {
          option = document.createElement("option");
          option.value = key;
          select.append(option);
        }
        text(option, source.label || source.ssid || `${{ wan: "WAN", lan: "LAN", wifi: "Wi-Fi", client: "Cliente", wifi_client: "Cliente Wi-Fi" }[source.source] || "Interface"} ${sources.indexOf(source) + 1}`);
      }
      if (!sources.some((s) => streamKey(s) === selected2)) selected2 = streamKey(sources.find((s) => s.source === "wan") || sources[0]);
      select.value = selected2;
      plot();
      onSample(data);
      if (ranking) paintRanking(ranking, sources);
    }
    const poll = async () => {
      if (busy || !scopeActive(scope)) return;
      busy = true;
      try {
        paint(await request("/api/device/traffic", { scope }));
      } catch (e) {
        if (scopeActive(scope) && !isCancelled(e)) text(host.querySelector("[data-sample-status]"), e.message);
      } finally {
        busy = false;
        if (scopeActive(scope)) timer = setTimeout(poll, 5e3);
      }
    };
    scope.controller.signal.addEventListener("abort", () => clearTimeout(timer), { once: true });
    host.querySelector("[data-stream-select]").onchange = (e) => {
      selected2 = e.target.value;
      plot();
    };
    const refresh = document.querySelector("#traffic-refresh");
    if (refresh) refresh.onclick = poll;
    async function history() {
      const stamp = ++historyStamp;
      try {
        const active2 = window.__amStore?.session?.session, across = document.querySelector("#traffic-all-sessions")?.checked, rows3 = await request(across ? "/api/device/traffic/device-history" : "/api/device/traffic/history", { scope, method: "POST", signal: scope.controller.signal, body: JSON.stringify(across ? { host: active2.host, identifier: active2.metadata?.device_identity, since: Date.now() / 1e3 - seconds } : { seconds }) });
        if (!scopeActive(scope) || stamp !== historyStamp) return;
        rows3.forEach(remember);
        plot();
      } catch (e) {
        if (scopeActive(scope) && !isCancelled(e)) text(host.querySelector("[data-sample-status]"), e.message);
      }
    }
    const period = document.querySelector("#traffic-period");
    if (period) period.onchange = () => {
      seconds = Number(period.value);
      history();
    };
    const all = document.querySelector("#traffic-all-sessions");
    if (all) all.onchange = history;
    const wrap = host.querySelector(".traffic-chart-wrap"), tooltip = wrap.querySelector(".chart-tooltip");
    wrap.onpointermove = (e) => {
      const h = host._chartHistory || [];
      if (!h.length) return;
      const box = wrap.getBoundingClientRect(), row = h[Math.max(0, Math.min(h.length - 1, Math.round((e.clientX - box.left) / box.width * (h.length - 1))))];
      tooltip.hidden = false;
      tooltip.textContent = `${new Date(row.timestamp * 1e3).toLocaleTimeString("pt-BR")} · RX ${rate(row.rx_mbps)} · TX ${rate(row.tx_mbps)}`;
      tooltip.style.left = Math.min(Math.max(0, e.clientX - box.left), Math.max(0, box.width - 270)) + "px";
      tooltip.style.top = "16px";
    };
    wrap.onpointerleave = () => tooltip.hidden = true;
    if (initial2) paint(initial2);
    history();
    poll();
  }
  function paintRanking(host, sources) {
    const ranked = sources.filter((s) => ["client", "wifi_client"].includes(s.source) && s.counters?.rx_bytes != null && s.counters?.tx_bytes != null && Number.isFinite(Number(s.counters.rx_bytes)) && Number.isFinite(Number(s.counters.tx_bytes))).sort((a, b) => Number(b.counters.rx_bytes) + Number(b.counters.tx_bytes) - (Number(a.counters.rx_bytes) + Number(a.counters.tx_bytes))).slice(0, 5);
    host.querySelector(".ranking-empty").hidden = Boolean(ranked.length);
    const list = host.querySelector("ol");
    for (const [i, s] of ranked.entries()) {
      let row = list.children[i];
      if (!row) {
        row = document.createElement("li");
        row.innerHTML = '<span data-name></span><strong class="tech-value" data-total></strong>';
        list.append(row);
      }
      text(row.querySelector("[data-name]"), `${s.hostname || s.label || s.identity}${s.ip ? " · " + s.ip : ""}`);
      text(row.querySelector("[data-total]"), formatBytes(Number(s.counters.rx_bytes) + Number(s.counters.tx_bytes)));
    }
    while (list.children.length > ranked.length) list.lastElementChild.remove();
  }

  // apps/access_manager/static/js/workspaces/views/overview.js
  var initial = null;
  var metric2 = (title, value2, key) => `<article class="am-metric"><span>${title}</span><strong class="${key === "status" ? ["Conectado", "Ativo"].includes(value2) ? "value-success" : ["Desconectado", "Sem link"].includes(value2) ? "value-danger" : "muted" : "tech-value"}" ${key ? `data-overview-${key}` : ""}>${esc(value2 ?? "Não disponível")}</strong></article>`;
  async function render2() {
    const opticalApplicable = cap("optical").read !== "UNSUPPORTED", scope = currentScope(), paths = ["/api/device", "/api/device/wan", "/api/device/optical", "/api/device/clients", "/api/device/traffic", "/api/device/wifi/ssids", "/api/device/wifi/radios"];
    const results = await Promise.allSettled(paths.map((p) => p === "/api/device/optical" && !opticalApplicable ? Promise.resolve(null) : request(p, { scope })));
    if (!scopeActive(scope)) throw cancelled();
    const [device, wan2, optical, clients, traffic, wifi, radios2] = results.map((r) => r.status === "fulfilled" ? r.value : null), d = device || {}, w = (Array.isArray(wan2) ? wan2[0] : wan2) || {}, o = optical || {};
    initial = traffic;
    const source = traffic?.sources?.find((s) => s.source === "wan"), rx = o.rx_dbm ?? o.rx ?? o.rx_power, wi = Array.isArray(wifi) ? wifi : [], ra = Array.isArray(radios2) ? radios2 : [], cl = Array.isArray(clients) ? clients : [], signals = cl.map((c) => c.rssi).filter(Number.isFinite), rssi = signals.length ? signals.reduce((a, b) => a + b, 0) / signals.length : null, alerts = [];
    if (["down", "disconnected"].includes(String(w.status).toLowerCase())) alerts.push("WAN informou estado desconectado.");
    if (rssi != null && rssi < -75) alerts.push("RSSI médio das associações abaixo de −75 dBm.");
    return `<header class="am-page-header"><small>PAINEL DO EQUIPAMENTO</small><h2>${esc(d.model || window.__amStore?.session?.session?.model || "Equipamento")}</h2><p class="muted">${esc(d.manufacturer || window.__amStore?.session?.session?.vendor || "")} · equipamento da sessão atual</p></header><div class="overview-metrics">${metric2("Status da internet", linkStatus(w.status), "status")}${metric2("IP WAN", w.ipv4, "wan-ip")}${metric2("Clientes conectados", Array.isArray(clients) ? cl.length : null, "clients")}${opticalApplicable ? metric2("RX óptico", rx == null ? null : rx + " dBm", "optical") : ""}${metric2("Consumo atual", rate(source?.rx_mbps), "throughput")}</div><div class="am-dashboard-split">${trafficChart("Fluxo de tráfego")}<section class="am-panel"><h2>Resumo do equipamento</h2>${fields([["Uptime", uptime(d.uptime_seconds)], ["Firmware", d.firmware], ["Temperatura", d.temperature_c == null ? null : d.temperature_c + " °C"], ["CPU", d.cpu_percent == null ? null : d.cpu_percent + " %"], ["Memória", d.memory_percent == null ? null : d.memory_percent + " %"], ["Modelo", d.model], ["Serial", d.serial]])}</section></div><div class="am-three-columns"><section class="am-panel"><h2>WAN</h2>${fields([["Interface", w.name], ["Gateway", w.gateway], ["VLAN", w.vlan], ["Link", linkStatus(w.status)], ["Conexão", w.connection_type]])}</section><section class="am-panel"><h2>Wi-Fi</h2>${fields([["SSIDs observados", wi.map((s) => s.ssid).filter(Boolean)], ["Bandas", ra.map((r) => r.band ?? r.banda)], ["Clientes Wi-Fi", Array.isArray(clients) ? cl.filter((c) => c.connection_type === "Wi-Fi").length : null], ["Canais", ra.map((r) => r.channel ?? r.canal)]])}</section><section class="am-panel"><h2>Alertas recentes</h2>${alerts.map((a) => `<p class="notice warning">${esc(a)}</p>`).join("") || '<p class="muted">Nenhum alerta derivado das leituras disponíveis.</p>'}${results.some((r) => r.status === "rejected") ? '<p class="muted">Leituras parciais; informações ausentes não indicam saúde.</p>' : ""}</section></div><div class="am-two-columns"><section class="am-panel"><h2>Utilização de CPU</h2><strong class="tech-value">${esc(d.cpu_percent == null ? "Não disponível" : d.cpu_percent + " %")}</strong>${Number.isFinite(d.cpu_percent) && d.cpu_percent >= 0 && d.cpu_percent <= 100 ? `<div class="resource-track"><div class="resource-fill violet" style="width:${d.cpu_percent}%"></div></div>` : ""}</section><section class="am-panel"><h2>Qualidade do sinal</h2>${fields([["RSSI médio observado", rssi == null ? null : rssi.toFixed(1) + " dBm"], ["Associações com RSSI", signals.length || null], ["Interferência", null]])}</section></div><section class="am-panel overview-topology"><h2>Topologia da rede</h2>${Array.isArray(clients) ? topology(cl, d.model) : '<p class="muted">Clientes não disponíveis; nenhuma relação inferida.</p>'}</section>`;
  }
  function mount2() {
    mountDetails();
    mountTrafficChart({ initial, onSample: (d) => {
      const source = d.sources?.find((s) => s.source === "wan"), el = document.querySelector("[data-overview-throughput]");
      if (el) el.textContent = rate(source?.rx_mbps);
    } });
  }

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
        const input = a.matches("input,select,textarea"), dirty = input && (a.dataset.dirty === "true" || a === document.activeElement), value2 = a.value, checked = a.checked;
        if (a.matches("form") && a.dataset.dirty === "true") continue;
        for (const attr of [...a.attributes]) if (!b.hasAttribute(attr.name) && attr.name !== "data-dirty") a.removeAttribute(attr.name);
        for (const attr of b.attributes) if (a.getAttribute(attr.name) !== attr.value) a.setAttribute(attr.name, attr.value);
        patch(a, b);
        if (dirty) {
          a.value = value2;
          a.checked = checked;
        }
      }
    };
    patch(host, template.content);
  }

  // apps/access_manager/static/js/shared/forms.js
  function editConfig(title, path2, fields2, extra = {}) {
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
        const result = await request(path2, { method: "POST", scope: d._requestScope, body: JSON.stringify(payload) });
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
    return `<section class="panel"><h2>Redes Wi-Fi</h2></section>${table([{ label: "SSID", keys: ["ssid"] }, { label: "Banda", keys: ["band", "banda"] }, { label: "Ativo", render: (r) => esc(bool(r.enabled ?? r.ativo)) }, { label: "Broadcast", render: (r) => esc(bool(r.broadcast)) }, { label: "Segurança", keys: ["security", "seguranca"] }, { label: "Ações", render: (r) => `<div class="inline-actions"><button class="button" data-reveal-wifi="${esc(r.id)}">Ver senha</button><button class="button" data-edit-ssid="${networks.indexOf(r)}" ${cap("wifi").enabled?.write ? "" : "disabled"}>Editar</button></div>` }], networks)}<section class="panel"><h2>Rádios</h2>${radios.map((r, i) => `<article class="panel"><h3>${esc(pick(r, "band", "banda"))}</h3>${fields([["Estado", bool(r.enabled ?? r.radio_ativo)], ["Canal", r.auto_channel === true || r.canal_automatico === true ? "Automático" : r.channel ?? r.canal], ["Canal atual", r.channel ?? r.canal], ["Canais permitidos", (r.available_channels || []).flatMap((g) => g.channels || g.canais || []).join(", ") || null], ["Seleção", (r.auto_channel ?? r.canal_automatico) == null ? null : r.auto_channel ?? r.canal_automatico ? "Automático" : "Manual"], ["Largura", r.bandwidth ?? r.largura], ["Padrão", r.standard ?? r.padrao], ["Potência", r.tx_power ?? r.potencia], ["País", r.country ?? r.pais], ["SGI", bool(r.sgi)]])}<details><summary>Avançado</summary>${kv(r)}</details><button class="button" data-edit-radio="${i}" ${cap("wifi_radio").enabled?.write ? "" : "disabled"}>Editar rádio</button></article>`).join("") || '<p class="muted">Sem dados de rádio.</p>'}</section>`;
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
    const paint = (part, value2) => {
      if (part === "ssids") networks = Array.isArray(value2) ? value2 : value2?.networks || [];
      else radios = Array.isArray(value2) ? value2 : value2?.radios || [];
      const html = contents(), split = html.indexOf(boundary), host = document.querySelector("#wifi-" + part);
      if (!host) return;
      patchHTML(host, part === "ssids" ? html.slice(html.indexOf("</section>") + 10, split) : html.slice(split + boundary.length, -10));
      host.removeAttribute("role");
      wire();
      timing("wifi.load." + part, start);
    };
    const load = (part, refresh = false) => loadResource("/api/device/wifi/" + part, { scope, refresh, data: (d) => paint(part, d), error: (e) => {
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
      const d = dialog(row.id ? "Editar reserva" : "Adicionar reserva", `<form class="form-grid">${available.map((key) => `<div class="field"><label>${{ name: "Nome", ip: "IP", mac: "MAC" }[key]}</label><input name="${key}" value="${esc(row[key] || "")}" ${key === "name" ? "" : "required"}></div>`).join("")}<button class="button primary">Salvar</button></form>`);
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
    return `<section class="panel"><div class="panel-header"><h2>Perfis</h2><button class="button primary" id="new-profile">Novo perfil</button></div></section>${table([{ label: "Nome", keys: ["name"] }, { label: "Descrição", keys: ["description"] }, { label: "Rádios", render: (r) => esc((r.wifi?.radios || (r.wifi?.radio ? [r.wifi.radio] : [])).map((r2) => `${r2.band}: ${r2.auto_channel === true ? "Auto" : r2.channel ?? "—"} · ${r2.bandwidth ?? "—"} · ${r2.standard ?? "—"} · ${r2.tx_power ?? "—"}`).join(" / ") || "—") }, { label: "DNS", render: (r) => Object.keys(r.dns || {}).length ? "Configurado" : "—" }, { label: "Ações", render: (r) => `<div class="inline-actions"><button class="button" data-edit-profile="${esc(r.name)}">Editar</button><button class="button" data-preview-profile="${esc(r.name)}">Preview / aplicar</button><button class="button danger" data-delete-profile="${esc(r.name)}">Excluir</button></div>` }], profiles, "Nenhum perfil salvo.")}`;
  }
  var field = (label, name, value2 = "") => `<div class="field"><label>${label}</label><input name="${name}" value="${esc(value2 ?? "")}"></div>`;
  function choice(label, name, value2, options) {
    return `<div class="field"><label>${label}</label><select name="${name}" ${options?.length ? "" : "disabled"}><option value="${esc(value2 ?? "")}">${esc((options || []).find((o) => String(o.value) === String(value2))?.label ?? value2 ?? "Não disponível")}</option>${(options || []).filter((o) => String(o.value) !== String(value2)).map((o) => `<option value="${esc(o.value)}">${esc(o.label)}</option>`).join("")}</select></div>`;
  }
  async function edit(profile = {}) {
    const opened = performance.now();
    let radiosReady = false;
    const savedRadios = profile.wifi?.radios || (profile.wifi?.radio ? [profile.wifi.radio] : []);
    let radios2 = [];
    const dns = profile.dns || {}, servers = dns.servers || [dns.ipv4_1 || dns.primary, dns.ipv4_2 || dns.secondary, dns.ipv6_1, dns.ipv6_2].filter(Boolean);
    const hosts = dns.hosts || [];
    const dhcpWritable = Boolean(cap("dhcp").enabled?.write);
    const d = dialog(profile.name ? "Editar perfil" : "Novo perfil", `<div class="profile-content"><form id="profile-form"><section class="profile-section"><div class="form-grid">${field("Nome", "name", profile.name)}${field("Descrição", "description", profile.description)}</div></section><div id="profile-radios"><section class="profile-section" role="status"><h3>Rádios</h3><p class="muted">Carregando canal, largura, padrão, potência e país…</p><div class="skeleton"></div></section></div><section class="profile-section"><h3>DNS estáticos</h3><p class="muted">Até dois endereços IPv4 e dois IPv6, conforme o contrato do provider.</p><div id="profile-dns-list">${(servers.length ? servers : [""]).map((s) => `<div class="toolbar"><input name="dns-server" value="${esc(s)}" aria-label="Servidor DNS"><button type="button" class="button" data-remove-dns>Remover</button></div>`).join("")}</div><button class="button" type="button" id="add-profile-dns">Adicionar DNS</button></section><section class="profile-section"><h3>Hosts DNS estáticos</h3><div id="profile-host-list">${hosts.map((h) => `<div class="toolbar"><input name="host-name" aria-label="Nome do host" value="${esc(h.name)}"><input name="host-ip" aria-label="IP do host" value="${esc(h.ip)}"><button type="button" class="button" data-remove-host>Remover</button></div>`).join("")}</div><button type="button" class="button" id="add-profile-host">Adicionar host DNS</button></section>${dhcpWritable ? `<section class="profile-section"><h3>DHCP</h3><div class="form-grid">${field("Início do pool", "pool-start", profile.dhcp?.min_address)}${field("Fim do pool", "pool-end", profile.dhcp?.max_address)}${field("Lease time (segundos)", "lease", profile.dhcp?.lease_time)}${field("DNS primário do DHCP", "dhcp-dns1", profile.dhcp?.dns1)}${field("DNS secundário do DHCP", "dhcp-dns2", profile.dhcp?.dns2)}</div></section>` : ""}</form></div>`, `<button type="button" class="button" data-cancel-profile>Cancelar</button><button type="submit" form="profile-form" class="button primary" id="save-profile">Salvar perfil</button>`);
    d.classList.add("profile-dialog");
    d.addEventListener("close", () => {
      if (!d.open) d.classList.remove("profile-dialog");
    }, { once: true });
    d.querySelector("[data-cancel-profile]").onclick = () => d.close();
    const form = d.querySelector("form");
    if (profile.name) form.querySelector('[name="name"]').readOnly = true;
    timing("profiles.modal.open", opened);
    const paintRadios = (value2) => {
      if (!d.open) return;
      const host = d.querySelector("#profile-radios");
      if (host.querySelector('[data-dirty="true"]')) return;
      radios2 = Array.isArray(value2) ? [...value2] : value2?.radios || [];
      for (const saved2 of savedRadios) if (!radios2.some((r) => (r.band ?? r.banda) === saved2.band)) radios2.push({ ...saved2, options: {} });
      radiosReady = true;
      patchHTML(host, ` ${radios2.map((r, i) => {
        const band2 = r.band ?? r.banda, stored = savedRadios.find((s) => s.band === band2);
        return `<section class="profile-section"><h3>Rádio ${esc(band2)}</h3><label class="profile-include"><input type="checkbox" name="include-radio-${i}" ${stored ? "checked" : ""}> Incluir no perfil</label><div class="form-grid">${[["Canal", "channel", r.channel ?? r.canal], ["Largura", "bandwidth", r.bandwidth ?? r.largura], ["Padrão", "standard", r.standard ?? r.padrao], ["Potência", "tx_power", r.tx_power ?? r.potencia], ["País", "country", r.country ?? r.pais]].map(([label, key, current]) => choice(label, `${key}-${i}`, stored?.[key] ?? current, r.options?.[key] || [])).join("")}${choice("Canal automático", `auto_channel-${i}`, stored?.auto_channel ?? r.auto_channel ?? r.canal_automatico, [{ value: "true", label: "Automático" }, { value: "false", label: "Manual" }])}</div></section>`;
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
    const wireHosts = () => d.querySelectorAll("[data-remove-host]").forEach((b) => b.onclick = () => b.parentElement.remove());
    wireHosts();
    d.querySelector("#add-profile-host").onclick = () => {
      d.querySelector("#profile-host-list").insertAdjacentHTML("beforeend", '<div class="toolbar"><input name="host-name" aria-label="Nome do host"><input name="host-ip" aria-label="IP do host"><button type="button" class="button" data-remove-host>Remover</button></div>');
      wireHosts();
    };
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
      if (dhcpWritable) for (const [input, key] of [["pool-start", "min_address"], ["pool-end", "max_address"], ["lease", "lease_time"], ["dhcp-dns1", "dns1"], ["dhcp-dns2", "dns2"]]) {
        const v = String(fd.get(input) || "").trim();
        if (v) dhcp[key] = v;
        else delete dhcp[key];
      }
      const names = fd.getAll("host-name"), ips = fd.getAll("host-ip");
      const nextHosts = names.map((name, i) => ({ name: String(name).trim(), ip: String(ips[i] || "").trim() })).filter((h) => h.name || h.ip);
      const nextDns = { ...dns, hosts: nextHosts, servers: fd.getAll("dns-server").map((v) => String(v).trim()).filter(Boolean) };
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
    loadResource("/api/profiles", { data: (value2) => {
      profiles = Array.isArray(value2) ? value2 : [];
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

  // apps/access_manager/static/js/shared/factory-reset.js
  var resetHost = () => cap("factory_reset").enabled?.write ? `<div class="capability-row"><strong>Restaurar configuração de fábrica</strong><button class="button danger" id="factory-reset-button">Restaurar fábrica</button></div>` : "";
  function mountReset() {
    const button2 = document.querySelector("#factory-reset-button");
    if (!button2) return;
    const scope = currentScope();
    button2.onclick = async () => {
      button2.disabled = true;
      try {
        const p = await request("/api/device/factory-reset/preview", { scope, method: "POST", body: "{}" });
        if (!scopeActive(scope)) return;
        const d = dialog("Restaurar configuração de fábrica?", `<p class="notice danger">${esc(p.impact)}</p><div class="field"><label>Digite RESETAR</label><input id="reset-word" autocomplete="off"></div><p id="reset-result" aria-live="polite"></p>`, `<button class="button" data-cancel>Cancelar</button><button class="button danger" id="reset-apply" disabled>Restaurar fábrica</button>`), apply = d.querySelector("#reset-apply"), word = d.querySelector("#reset-word");
        d.querySelector("[data-cancel]").onclick = () => d.close();
        word.oninput = () => {
          apply.disabled = word.value !== "RESETAR";
        };
        apply.onclick = async () => {
          apply.disabled = true;
          word.disabled = true;
          try {
            const r = await request("/api/device/factory-reset/apply", { scope: d._requestScope, method: "POST", body: JSON.stringify({ nonce: p.nonce, confirmation: word.value }) });
            if (d.open) d.querySelector("#reset-result").textContent = r.message;
          } catch (e) {
            if (!isCancelled(e) && d.open) d.querySelector("#reset-result").textContent = e.message;
          }
        };
      } catch (e) {
        if (!isCancelled(e)) toast(e.message);
      } finally {
        if (scopeActive(scope)) button2.disabled = false;
      }
    };
  }

  // apps/access_manager/static/js/shared/management-artifacts.js
  var artifactsHost = () => `<section class="panel"><h2>Backups e arquivos</h2><div class="inline-actions"><button class="button" id="artifact-backup" ${cap("backup").enabled?.write ? "" : "disabled"}>Criar backup do equipamento</button><button class="button" id="artifact-upload">Importar arquivo</button></div><p class="muted">Arquivos ficam no armazenamento local do aplicativo. Restore e firmware exigem confirmação de compatibilidade e impacto.</p><div id="artifact-list"></div></section>`;
  function mountArtifacts() {
    const host = document.querySelector("#artifact-list");
    if (!host) return;
    const scope = currentScope();
    let items = [];
    const refresh = async () => {
      try {
        items = await request("/api/management/artifacts", { scope, forceRefresh: true });
        if (!scopeActive(scope)) return;
        host.innerHTML = table([{ label: "Arquivo", keys: ["filename"] }, { label: "Tipo", keys: ["kind"] }, { label: "Modelo", render: (r) => esc(r.device?.model) }, { label: "Firmware", render: (r) => esc(r.device?.firmware) }, { label: "Criado", keys: ["created_at"] }, { label: "Bytes", keys: ["size"] }, { label: "Ações", render: (r) => `<button class="button" data-artifact-download="${r.id}">Download</button> <button class="button danger" data-artifact-apply="${r.id}" ${cap(r.kind === "firmware" ? "firmware" : "restore").enabled?.write ? "" : "disabled"}>${r.kind === "firmware" ? "Atualizar" : "Restaurar"}</button>` }], items);
        host.querySelectorAll("[data-artifact-download]").forEach((b) => b.onclick = async () => {
          try {
            const d = await request("/api/management/artifacts/download", { scope, method: "POST", body: JSON.stringify({ id: b.dataset.artifactDownload }) });
            const bytes = Uint8Array.from(atob(d.content_base64), (c) => c.charCodeAt(0)), url = URL.createObjectURL(new Blob([bytes], { type: "application/octet-stream" })), a = document.createElement("a");
            a.href = url;
            a.download = d.filename;
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 1e3);
          } catch (e) {
            if (!isCancelled(e)) toast(e.message);
          }
        });
        host.querySelectorAll("[data-artifact-apply]").forEach((b) => b.onclick = () => apply(items.find((r) => r.id === b.dataset.artifactApply)));
      } catch (e) {
        if (scopeActive(scope) && !isCancelled(e)) host.textContent = e.message;
      }
    };
    document.querySelector("#artifact-backup").onclick = async (e) => {
      e.currentTarget.disabled = true;
      try {
        await request("/api/management/artifacts/backup", { scope, method: "POST", body: "{}" });
        await refresh();
      } catch (err) {
        if (!isCancelled(err)) toast(err.message);
      } finally {
        if (scopeActive(scope)) e.currentTarget.disabled = false;
      }
    };
    document.querySelector("#artifact-upload").onclick = () => {
      const current = window.__amStore?.session?.session || {}, d = dialog("Importar configuração ou firmware", `<form id="artifact-upload-form"><div class="form-grid"><div class="field"><label>Tipo</label><select name="kind"><option value="backup">Configuração para restore</option><option value="firmware">Firmware</option></select></div><div class="field"><label>Arquivo (até 32 MiB)</label><input name="file" type="file" required></div><div class="field"><label>Fabricante declarado do arquivo</label><input name="vendor" value="${esc(current.vendor)}" required></div><div class="field"><label>Modelo declarado do arquivo</label><input name="model" value="${esc(current.model)}" required></div><div class="field"><label>Firmware do arquivo, se conhecido</label><input name="firmware"></div></div><p class="notice warning">O hash verifica integridade, não comprova compatibilidade de um binário. Confirme a origem do arquivo antes de restaurar ou atualizar.</p></form>`, `<button class="button primary" type="submit" form="artifact-upload-form">Importar arquivo</button>`);
      d.querySelector("form").onsubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget), file = fd.get("file");
        if (!file?.size || file.size > 32 * 1024 * 1024) {
          toast("Arquivo vazio ou maior que 32 MiB");
          return;
        }
        const uploadScope = d._requestScope, reader = new FileReader();
        reader.onload = async () => {
          try {
            await request("/api/management/artifacts/upload", { scope: uploadScope, method: "POST", body: JSON.stringify({ kind: fd.get("kind"), filename: file.name, content_base64: String(reader.result).split(",")[1], device: { vendor: fd.get("vendor"), model: fd.get("model"), firmware: fd.get("firmware") } }) });
            d.close();
            refresh();
          } catch (err) {
            if (!isCancelled(err)) toast(err.message);
          }
        };
        reader.readAsDataURL(file);
      };
    };
    function apply(item) {
      const critical = item.kind === "firmware", word = critical ? "ATUALIZAR" : "RESTAURAR", d = dialog(critical ? "Atualizar firmware?" : "Restaurar configuração?", `<p class="notice danger">${critical ? "Não desligue o equipamento durante a atualização." : "As configurações atuais serão substituídas."} A sessão pode cair e o equipamento pode reiniciar.</p><p>Arquivo: ${esc(item.filename)} · Modelo: ${esc(item.device?.model)} · Firmware: ${esc(item.device?.firmware || "não comprovado")}</p><p>Origem dos metadados: ${item.metadata_provenance === "authenticated_device_export" ? "exportação autenticada" : "declaração do operador; cabeçalho não verificado"}</p><label><input id="artifact-ack" type="checkbox"> Confirmo compatibilidade e impacto</label><div class="field"><label>Digite ${word}</label><input id="artifact-confirm" autocomplete="off"></div><div id="artifact-result"></div>`, `<button class="button danger" id="artifact-submit">${critical ? "Atualizar" : "Restaurar"}</button>`);
      d.querySelector("#artifact-submit").onclick = async (e) => {
        e.currentTarget.disabled = true;
        try {
          const r = await request("/api/management/artifacts/apply", { scope: d._requestScope, method: "POST", body: JSON.stringify({ id: item.id, confirmation: d.querySelector("#artifact-confirm").value, compatibility_ack: d.querySelector("#artifact-ack").checked }) });
          if (d.open) d.querySelector("#artifact-result").textContent = r.message || "Arquivo enviado uma vez. Confira o estado do equipamento.";
        } catch (err) {
          if (!isCancelled(err)) toast(err.message);
        }
      };
    }
    refresh();
  }

  // apps/access_manager/static/js/shared/configuration-surfaces.js
  var surfaceHost = () => `<section class="panel"><h2>Configurações de rede e serviços</h2><p class="muted">Formulários específicos do firmware, com leitura, prévia e confirmação antes de aplicar.</p><div id="configuration-surfaces" role="status">Carregando configurações disponíveis…</div></section>`;
  async function mountSurfaces() {
    const host = document.querySelector("#configuration-surfaces");
    if (!host) return;
    const scope = currentScope();
    try {
      const catalog = await request("/api/device/configuration/catalog", { scope });
      if (!scopeActive(scope) || !host.isConnected) return;
      host.innerHTML = `<div class="field"><label>Configuração</label><select id="surface-feature"><option value="">Selecione…</option>${catalog.map((s) => `<option value="${esc(s.id)}">${esc(s.category)} · ${esc(s.title)}</option>`).join("")}</select></div><div id="surface-current"></div>`;
      host.querySelector("select").onchange = async (event) => {
        const feature = event.target.value, out = host.querySelector("#surface-current");
        if (!feature) {
          out.innerHTML = "";
          return;
        }
        const stamp = feature;
        out.innerHTML = '<p class="muted">Lendo configuração atual…</p>';
        try {
          const data = await request("/api/device/configuration/read", { scope, method: "POST", body: JSON.stringify({ feature }) });
          if (!scopeActive(scope) || host.querySelector("select").value !== stamp) return;
          out.innerHTML = (data.instances || []).map((row, i) => `<section class="panel"><h3>${esc(row.label)}</h3>${row.missing?.length ? `<p class="notice warning">Campos ainda não retornados pelo equipamento: ${row.missing.map(esc).join(", ")}.</p>` : ""}<button class="button" data-surface-instance="${i}">Editar / visualizar</button></section>`).join("") || '<p class="muted">Nenhuma instância reconhecida nesta sessão.</p>';
          out.querySelectorAll("[data-surface-instance]").forEach((b) => b.onclick = () => editSurface(catalog.find((s) => s.id === feature), data.instances[Number(b.dataset.surfaceInstance)]));
        } catch (e) {
          if (scopeActive(scope) && !isCancelled(e) && host.querySelector("select").value === stamp) out.innerHTML = `<p class="notice warning">${esc(e.message)}</p>`;
        }
      };
    } catch (e) {
      if (scopeActive(scope) && !isCancelled(e)) host.textContent = e.message;
    }
  }
  function editSurface(feature, row) {
    const d = dialog(feature.title, `<div class="profile-content"><form id="surface-form"><p class="muted">Marque apenas os campos que deseja alterar. Campos não selecionados serão preservados.</p><div class="field"><label>Operação</label><select name="operation">${(row.actions || ["update"]).map((a) => `<option value="${a}">${{ update: "Editar", create: "Criar", delete: "Excluir" }[a]}</option>`).join("")}</select></div><div class="form-grid">${row.fields.map((f) => `<div class="field"><label><input type="checkbox" data-change="${esc(f.key)}" ${f.select && !f.options?.length ? "disabled" : ""}> ${esc(f.label)}</label>${f.options?.length || f.select ? `<select ${f.select && !f.options?.length ? "disabled" : ""} name="${esc(f.key)}">${(f.options?.length ? f.options : [{ value: f.value ?? "", label: f.value ?? "Opções não disponíveis" }]).map((o) => `<option value="${esc(o.value)}" ${String(o.value) === String(f.value) ? "selected" : ""}>${esc(o.label)}</option>`).join("")}</select>` : `<input name="${esc(f.key)}" type="${f.secret ? "password" : "text"}" value="${f.secret ? "" : esc(f.value ?? "")}" autocomplete="${f.secret ? "new-password" : "off"}" ${f.secret ? 'placeholder="Manter valor atual"' : ""}>`}</div>`).join("")}</div></form><div id="surface-preview"></div></div>`, `<button type="submit" form="surface-form" class="button primary">Gerar prévia</button>`);
    d.classList.add("profile-dialog");
    const form = d.querySelector("form");
    form.onsubmit = async (event) => {
      event.preventDefault();
      const changes = {};
      for (const checkbox of form.querySelectorAll("[data-change]:checked")) changes[checkbox.dataset.change] = form.elements.namedItem(checkbox.dataset.change).value;
      const out = d.querySelector("#surface-preview");
      out.innerHTML = '<p class="muted">Preparando prévia…</p>';
      try {
        const preview = await request("/api/device/configuration/preview", { scope: d._requestScope, method: "POST", body: JSON.stringify({ feature: feature.id, instance: row.id, changes, action: form.elements.namedItem("operation").value }) });
        if (!d.open) return;
        out.innerHTML = table([{ label: "Campo", keys: ["field"] }, { label: "Atual", keys: ["before"] }, { label: "Novo", keys: ["after"] }], preview.changes || []) + `<p class="notice warning">A alteração pode interromper a conexão. A prévia expira em ${esc(preview.expires_in_seconds)} segundos.</p><div class="field"><label>Digite APLICAR para confirmar</label><input id="surface-confirm" autocomplete="off"></div><button type="button" class="button danger" id="surface-apply">Aplicar configuração</button>`;
        out.querySelector("button").onclick = async (e) => {
          e.currentTarget.disabled = true;
          try {
            const result = await request("/api/device/configuration/apply", { scope: d._requestScope, method: "POST", body: JSON.stringify({ nonce: preview.nonce, confirmation: out.querySelector("input").value }) });
            if (!d.open) return;
            out.innerHTML = `<p class="notice ${result.uncertain ? "warning" : ""}">${esc(result.detail || result.message || (result.verified ? "Alteração verificada." : result.uncertain ? "Sem confirmação; não reenviar automaticamente." : "Comando enviado; verificação manual necessária."))}</p>`;
            toast("Operação concluída. Confira o resultado.");
          } catch (err) {
            if (!isCancelled(err)) toast(err.message);
          }
        };
      } catch (e) {
        if (d.open && !isCancelled(e)) out.innerHTML = `<p class="notice warning">${esc(e.message)}</p>`;
      }
    };
  }

  // apps/access_manager/static/js/workspaces/views/management.js
  var definitions = [{ feature: "dmz", title: "DMZ", fields: [["enabled", "Habilitado", "bool"], ["internal_client", "IP do cliente"]] }, { feature: "upnp", title: "UPnP", fields: [["enabled", "Habilitado", "bool"]] }, { feature: "tr069", title: "TR-069", fields: [["url", "URL ACS"]] }, { feature: "firewall", title: "Firewall", fields: [["enabled", "Habilitado", "bool"], ["level", "Nível"]] }];
  var loaded = {};
  function presentation(feature, data) {
    const rows3 = { dmz: [["Estado", bool(data.enabled)], ["Cliente", data.internal_client || "Não configurado"], ["WAN", data.wan]], upnp: [["Estado", bool(data.enabled)]], tr069: [["Servidor ACS", data.url]], firewall: [["Estado", bool(data.enabled)], ["Nível", data.level]] };
    return fields(rows3[feature] || []) + `<details><summary>Avançado</summary>${kv(data)}</details>`;
  }
  var featureCap = (f) => f === "firewall" && (cap("firewall_level").enabled?.read || cap("firewall_level").enabled?.write) ? cap("firewall_level") : cap(f);
  async function render5() {
    const scope = currentScope();
    loaded = {};
    const results = await Promise.allSettled(definitions.map((d) => ["SUPPORTED", "PARTIAL"].includes(featureCap(d.feature).read) ? request("/api/device/" + d.feature) : Promise.resolve(null)));
    const history = await request("/api/device/history").catch(() => null);
    if (!scopeActive(scope)) throw cancelled();
    const reboot = cap("reboot");
    const device = await request("/api/device").catch(() => null);
    if (!scopeActive(scope)) throw cancelled();
    return `<section class="panel"><h2>Telemetria do equipamento</h2>${device ? fields([["Tempo ligado", uptime(device.uptime_seconds)], ["CPU", device.cpu_percent == null ? null : device.cpu_percent + " %"], ["Memória", device.memory_percent == null ? null : device.memory_percent + " %"], ["Temperatura", device.temperature_c == null ? null : device.temperature_c + " °C"]]) : '<p class="muted">Telemetria não disponível.</p>'}</section><section class="panel"><h2>Manutenção</h2><div class="capability-row"><strong>Reiniciar equipamento</strong>${capBadge(reboot.read)}${capBadge(reboot.write)}<button id="reboot-button" class="button danger" ${reboot.enabled?.write ? "" : "disabled"}>Reiniciar</button></div>${resetHost()}</section><div class="split">${definitions.map((d, i) => {
      const result = results[i];
      const value2 = result.status === "fulfilled" ? result.value : null;
      if (value2) loaded[d.feature] = value2;
      return `<section class="panel"><div class="panel-header"><h2>${d.title}</h2>${capBadge(featureCap(d.feature).write)}</div>${value2 ? presentation(d.feature, value2) : `<p class="muted">${result.status === "rejected" ? esc(result.reason.message) : "Leitura não comprovada nesta sessão."}</p>`}<button class="button" data-config="${d.feature}" ${value2 && value2.available !== false && featureCap(d.feature).enabled?.write ? "" : "disabled"}>Editar</button></section>`;
    }).join("")}</div>${cap("configuration_surfaces").enabled?.read ? surfaceHost() : ""}${artifactsHost()}<section class="panel"><h2>Histórico de operações</h2>${history ? table([{ label: "Data", keys: ["created_at"] }, { label: "Operação", keys: ["operation"] }, { label: "Alvo", keys: ["target"] }, { label: "Resultado", keys: ["outcome"] }], (history.changes || []).map((row) => ({ ...row, created_at: row.created_at ? new Date(row.created_at).toLocaleString("pt-BR") : null, outcome: { attempted: "Solicitado", accepted: "Aceito", verified: "Verificado", uncertain: "Sem confirmação", failed: "Falhou" }[row.outcome] || row.outcome }))) : '<p class="muted">Histórico não disponível.</p>'}</section>`;
  }
  function mount5() {
    mountReset();
    mountSurfaces();
    mountArtifacts();
    document.querySelectorAll("[data-config]").forEach((b2) => b2.onclick = () => {
      const definition = definitions.find((d) => d.feature === b2.dataset.config), data = loaded[definition.feature];
      editConfig("Editar " + definition.title, "/api/device/" + definition.feature, definition.fields.map(([key, label, type]) => ({ key, label, type, value: data[key] })));
    });
    const b = document.querySelector("#reboot-button");
    if (!b || b.disabled) return;
    b.onclick = () => {
      const d = dialog("Reiniciar equipamento?", `<p>A conexão ficará indisponível temporariamente.</p>`, `<button class="button" data-cancel>Cancelar</button><button class="button danger" data-confirm>Reiniciar</button>`);
      d.querySelector("[data-cancel]").onclick = () => d.close();
      d.querySelector("[data-confirm]").onclick = async (e) => {
        e.currentTarget.disabled = true;
        try {
          await request("/api/device/reboot", { method: "POST", body: JSON.stringify({ confirm: true }) });
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
    const rows3 = Object.entries(caps);
    return `<section class="panel"><div class="panel-header"><div><h2>Capabilities</h2><span class="muted">Suporte e evidência são estados separados.</span></div></div>${rows3.length ? rows3.map(([name, c]) => `<div class="capability-row"><strong>${esc(name)}</strong>${capBadge(c.read)}${capBadge(c.write)}<span class="muted">${esc(c.evidence)}${c.source ? ` · ${esc(c.source)}` : ""}</span></div>`).join("") : '<div class="empty-state"><span>Sem capabilities na sessão.</span></div>'}</section>`;
  }

  // apps/access_manager/static/js/workspaces/views/traffic.js
  var traffic_exports = {};
  __export(traffic_exports, {
    mount: () => mount6,
    render: () => render7
  });
  function render7() {
    return `<header class="am-page-header"><small>PAINEL DO EQUIPAMENTO</small><h2>Tráfego da rede</h2><p class="muted">RX e TX da interface selecionada · fontes não são somadas.</p></header><div class="am-toolbar"><select id="traffic-period" aria-label="Período"><option value="300">Últimos minutos</option><option value="3600">1 hora</option><option value="86400">24 horas</option><option value="604800">7 dias</option></select><label><input id="traffic-all-sessions" type="checkbox"> Entre sessões deste endereço</label><button class="button" id="traffic-refresh">Atualizar amostra</button><span class="muted" id="traffic-status">Aguardando leitura.</span></div><div class="am-dashboard-split" id="traffic-streams">${trafficChart("Tráfego da rede")}<section class="am-panel" id="traffic-ranking"><h2>Maiores consumidores</h2><p class="muted">Consumo acumulado medido por cliente.</p><ol class="consumer-ranking"></ol><p class="ranking-empty muted">Consumo por cliente não disponível neste equipamento.</p><p class="muted">Totais exigem RX e TX individuais; contadores parciais não viram zero.</p></section></div>`;
  }
  function mount6() {
    mountTrafficChart({ ranking: document.querySelector("#traffic-ranking") });
  }

  // apps/access_manager/static/js/shared/diagnostics.js
  function diagnosticResult(d) {
    const technical = `<details><summary>Ver resposta técnica</summary><pre>${esc(JSON.stringify(d.advanced || d, null, 2))}</pre></details>`;
    const head = `<h3>${esc(d.target || "Destino não disponível")}</h3><p>${esc(d.status)} · ${esc(d.interface || "Interface não disponível")} · ${esc(d.protocol || "Protocolo não disponível")}</p>`;
    if (d.kind === "traceroute") return head + table([{ label: "Hop", keys: ["number"] }, { label: "IP / host", render: (r) => esc(r.host || "*") }, ...[0, 1, 2].map((i) => ({ label: `Latência ${i + 1}`, render: (r) => r.latencies_ms?.[i] != null ? `${esc(r.latencies_ms[i])} ms` : "*" })), { label: "Status", render: (r) => r.timeout ? "Timeout" : "Resposta recebida" }], d.hops || [], "Nenhum salto foi fornecido pelo equipamento.") + technical;
    return head + `<div class="grid">${[["Enviados", "sent"], ["Recebidos", "received"], ["Perda (%)", "loss_percent"], ["Mínimo (ms)", "min_ms"], ["Médio (ms)", "avg_ms"], ["Máximo (ms)", "max_ms"]].map(([label, key]) => metric(label, d[key] ?? "Não disponível")).join("")}</div>` + technical;
  }

  // apps/access_manager/static/js/workspaces/views/misc.js
  async function diagnostics2() {
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
  function mountDiagnostics2() {
    const out = document.querySelector("#diagnostic-result");
    const wire3 = (selector, path2) => {
      const form = document.querySelector(selector);
      if (!form || !out) return;
      form.onsubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const payload = { host: String(fd.get("host") || "") };
        if (fd.get("count")) payload.count = Number(fd.get("count"));
        out.innerHTML = '<span class="muted">Executando…</span>';
        try {
          const result = await request(path2, { method: "POST", body: JSON.stringify(payload) });
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

  // apps/access_manager/static/js/workspaces/views/complete-diagnostics.js
  var complete_diagnostics_exports = {};
  __export(complete_diagnostics_exports, {
    channelsView: () => channelsView,
    mount: () => mount7,
    render: () => render8
  });

  // apps/access_manager/static/js/shared/native-speedtest.js
  var saved = null;
  function mountSpeedtest() {
    const scope = currentScope(), discover = document.querySelector("#complete-speedtest"), select = document.querySelector("#complete-speed-server"), start = document.querySelector("#complete-speed-start"), out = document.querySelector("#complete-speedtest-result");
    if (!discover) return;
    let timer = null, running = false;
    scope?.controller.signal.addEventListener("abort", () => clearTimeout(timer), { once: true });
    const show = (d) => {
      if (scopeActive(scope)) out.innerHTML = fields([["Estado", { running: "Em andamento", finished: "Finalizado", timeout: "Tempo excedido", uncertain: "Sem confirmação" }[d.status] || d.status], ["Estado informado pelo firmware", d.native_state], ["Download (Mbps)", d.download_mbps], ["Upload (Mbps)", d.upload_mbps], ["Progresso (%)", d.progress], ["Latência (ms)", d.latency_ms]]);
    };
    const poll = async () => {
      if (!saved || !scopeActive(scope)) return;
      try {
        const d = await request("/api/device/diagnostics/speedtest/poll", { scope, method: "POST", body: JSON.stringify({ run_id: saved.id }) });
        if (!scopeActive(scope)) return;
        show(d);
        if (d.status === "running") timer = setTimeout(poll, 1e3);
        else {
          running = false;
          start.disabled = false;
        }
      } catch (e) {
        if (scopeActive(scope) && !isCancelled(e)) {
          out.textContent = e.message;
          running = false;
          start.disabled = true;
        }
      }
    };
    discover.onclick = async () => {
      discover.disabled = true;
      out.textContent = "Consultando servidores…";
      try {
        const d = await request("/api/device/diagnostics/speedtest-discovery", { scope, method: "POST", body: "{}" });
        if (!scopeActive(scope)) return;
        select.innerHTML = (d.servers || []).map((s) => `<option value="${esc(s.url)}">${esc(s.name)}</option>`).join("");
        select.disabled = !d.servers?.length;
        start.disabled = !d.servers?.length || running;
        out.textContent = d.servers?.length ? "Selecione o servidor e inicie uma medição." : "Nenhum servidor retornado.";
      } catch (e) {
        if (scopeActive(scope) && !isCancelled(e)) out.textContent = e.message;
      } finally {
        if (scopeActive(scope)) discover.disabled = false;
      }
    };
    start.onclick = async () => {
      if (running) return;
      running = true;
      start.disabled = true;
      try {
        const d = await request("/api/device/diagnostics/speedtest/start", { scope, method: "POST", body: JSON.stringify({ server_url: select.value }) });
        if (!scopeActive(scope)) return;
        saved = { id: d.run_id, session: window.__amStore?.session?.session?.session_id };
        show(d);
        if (d.status === "running") poll();
        else running = false;
      } catch (e) {
        if (scopeActive(scope) && !isCancelled(e)) {
          toast(e.message);
          running = false;
        }
      }
    };
    if (saved?.session === window.__amStore?.session?.session?.session_id) {
      running = true;
      poll();
    } else saved = null;
  }

  // apps/access_manager/static/js/workspaces/views/complete-diagnostics.js
  var statusLabels = { success: "Passou", warning: "Atenção", failure: "Falhou", unknown: "Não disponível", partial: "Parcial", timeout: "Sem resposta", normal: "Resposta recebida" };
  var tests = [["ping", "Ping"], ["dns", "DNS"], ["http", "HTTP/HTTPS"], ["gateway", "Gateway"], ["internet", "Internet"]];
  var fmt = (v, unit = "") => v == null ? "Não disponível" : `${Number(v).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}${unit}`;
  var badge2 = (s) => `<span class="diagnostic-status status-${["success", "warning", "failure"].includes(s) ? s : "unknown"}">${esc(statusLabels[s] || "Não disponível")}</span>`;
  var panel2 = (id, title, subtitle = "", wide = false) => `<section class="diagnostic-panel am-panel ${wide ? "diagnostic-wide" : ""}"><div class="diagnostic-panel-heading"><div><h2>${title}</h2>${subtitle ? `<p class="muted">${subtitle}</p>` : ""}</div></div><div id="complete-${id}"><p class="muted">Aguardando execução.</p></div></section>`;
  function render8() {
    const device = window.__amStore?.session?.session || {};
    return `<div class="diagnostic-dashboard"><header class="diagnostic-page-header am-page-header"><div><p class="diagnostic-breadcrumb">Access Manager / Diagnóstico completo</p><h2>Diagnóstico da rede</h2><p class="muted">Verifique a saúde da conexão, desempenho e qualidade do sinal em um só lugar.</p><p class="diagnostic-device"><span class="connection-dot"></span> ${esc(device.model || "Equipamento")} · ${esc(device.vendor || "")} · ${window.__amStore?.session?.connected ? "Online" : "Não conectado"}</p></div><div class="diagnostic-page-actions"><span id="complete-verified" class="muted">Ainda não verificado</span><div class="inline-actions"><button class="button primary" id="complete-run">Executar diagnóstico</button><button class="button" id="complete-export" disabled>Exportar relatório</button><select id="complete-export-format" aria-label="Formato do relatório"><option value="json">JSON técnico</option><option value="csv">CSV resumido</option></select></div></div></header><details class="diagnostic-settings"><summary>Alvos e opções</summary><form id="complete-form" class="inline-actions"><div class="field"><label>Destino Ping / Internet</label><input name="host" required></div><div class="field"><label>Nome para resolver</label><input name="hostname" required></div><label><input name="trace" type="checkbox" checked> Incluir traceroute</label><button class="button" type="submit">Executar com estes alvos</button></form><p class="muted">Ping, DNS, gateway e traceroute são testes da ONT quando suportados. HTTPS usa o computador do técnico, em paralelo às consultas da ONT.</p></details><p id="complete-progress" role="status">Pronto para executar.</p><div class="diagnostic-metrics">${[["latency", "Latência média"], ["loss", "Perda de pacotes"], ["availability", "Disponibilidade"], ["rate", "Tráfego atual"], ["signal", "Qualidade do sinal"]].map(([id, title]) => `<article class="diagnostic-metric"><span>${title}</span><div class="diagnostic-metric-value tech-value" id="metric-${id}">—</div><small id="metric-${id}-detail">Aguardando dados reais</small></article>`).join("")}</div><div class="diagnostic-dashboard-grid"><section class="diagnostic-panel"><h2>Saúde da conexão</h2><p class="muted">Latência e perda ao longo do tempo · amostras medidas</p><div class="diagnostic-chart-controls"><div><button class="button active" data-chart="latency">Latência</button><button class="button" data-chart="loss">Perda de pacotes</button></div><select id="chart-period" aria-label="Período do gráfico"><option value="168">Amostras disponíveis</option><option value="1" disabled>1h</option><option value="6" disabled>6h</option><option value="24" disabled>24h</option><option value="168" disabled>7d</option></select></div><div id="complete-chart" class="diagnostic-chart"><p class="muted">Nenhuma amostra persistida.</p></div><p id="complete-health" class="muted">Informação insuficiente para classificar a saúde global.</p></section><section class="diagnostic-panel"><h2>Teste de conectividade</h2><div id="complete-connectivity">${tests.map(([id, title]) => `<div class="connectivity-row" id="connectivity-${id}"><strong>${title}</strong><span data-status>${badge2("unknown")}</span><span class="tech-value" data-time>—</span><button class="button" data-retest="${id}">Testar novamente</button><small data-origin>ONT${id === "http" ? " / computador do técnico" : ""}</small></div>`).join("")}</div></section>${panel2("trace", "Traceroute", "Saltos intermediários sem resposta não comprovam uma rota quebrada.", true)}${panel2("wifi", "Qualidade do Wi-Fi", "RSSI/SNR das associações observadas; interferência não é inferida.", true)}${panel2("channels", "Canais Wi-Fi", "Tabela do firmware e varredura de redes vizinhas, quando disponíveis.", true)}${panel2("resources", "Recursos do equipamento")}${panel2("alerts", "Alertas e recomendações", "Regras explícitas aplicadas à execução atual.")}<section class="diagnostic-panel diagnostic-wide"><div class="diagnostic-panel-heading"><div><h2>Histórico de diagnósticos</h2><p class="muted">Execuções persistidas deste equipamento · últimos 7 dias</p></div><div class="inline-actions"><select id="diagnostic-history-period" aria-label="Período do histórico"><option value="24">24h</option><option value="1">1h</option><option value="6">6h</option><option value="168">7d</option></select><select id="diagnostic-history-status" aria-label="Resultado do histórico"><option value="">Todos os resultados</option><option value="success">Passou</option><option value="warning">Atenção</option><option value="failure">Falhou</option><option value="partial">Parcial</option></select></div></div><div id="complete-history"><p class="muted">Carregando histórico local…</p></div></section>${panel2("evidence", "Detalhes técnicos da coleta", "Leituras normalizadas; sem credenciais, cookies ou tokens.", true)}</div><details class="diagnostic-extras"><summary>Ferramentas adicionais</summary><section class="panel"><h3>Teste de velocidade nativo</h3><p class="muted">Speedtest é uma medição separada do tráfego atual.</p><button class="button" id="complete-speedtest" ${cap("speedtest_discovery").enabled?.write ? "" : "disabled"}>Consultar servidores</button><select id="complete-speed-server" disabled aria-label="Servidor de velocidade"></select><button class="button" id="complete-speed-start" disabled>Iniciar medição</button><div id="complete-speedtest-result"></div></section><button class="button" id="complete-workstation">Comparar caminho do PC</button><div id="complete-workstation-result"></div><button class="button" id="complete-runtime">Consultar probes conhecidos</button><div id="complete-runtime-result"></div></details></div>`;
  }
  function hopsView(rows3) {
    return `<div class="diagnostic-route">${rows3.map((h, i) => `${i ? '<span class="route-line"></span>' : ""}<span class="route-node ${h.status === "timeout" ? "route-timeout" : ""}" title="${esc(h.address || "Sem resposta")}">${esc(h.hop)}</span>`).join("")}</div>` + table([{ label: "Salto", keys: ["hop"] }, { label: "Host", keys: ["host"] }, { label: "Endereço", render: (h) => `<span class="mono tech-value">${esc(h.address || "—")}</span>` }, { label: "Latência", render: (h) => fmt(h.latency_ms, " ms") }, { label: "Perda", render: (h) => fmt(h.loss_percent, " %") }, { label: "Status", render: (h) => badge2(h.status) }], rows3, "Traceroute não disponível ou não solicitado.");
  }
  function resourcesView(r) {
    return `<div class="resource-grid">${[["cpu_percent", "CPU", "violet"], ["memory_percent", "Memória", "blue"], ["storage_percent", "Armazenamento", "green"]].map(([k, label, color]) => `<div><span>${label}</span><strong class="tech-value">${fmt(r[k], " %")}</strong>${r[k] != null && r[k] >= 0 && r[k] <= 100 ? `<div class="resource-track"><div class="resource-fill ${color}" style="width:${r[k]}%"></div></div>` : ""}</div>`).join("")}</div>` + fields([["Temperatura", r.temperature_c == null ? null : fmt(r.temperature_c, " °C")], ["Uptime", uptime(r.uptime_seconds)], ["Sessões ativas", r.active_sessions], ["Firmware", r.firmware]]);
  }
  function wifiView(w, mesh) {
    return (w.bands || []).map((b) => `<details class="wifi-diagnostic-card"><summary><strong>${esc(b.band || "Rádio")}</strong><span class="tech-value">${fmt(b.avg_rssi, " dBm")}</span><span>${b.clients} associações observadas</span></summary>${fields([["SSID", b.ssids], ["RSSI médio", fmt(b.avg_rssi, " dBm")], ["SNR médio", fmt(b.avg_snr, " dB")], ["Canal", b.radio.channel ?? b.radio.canal], ["Largura", b.radio.bandwidth ?? b.radio.largura], ["Padrão", b.radio.standard ?? b.radio.padrao], ["Potência", b.radio.tx_power ?? b.radio.potencia], ["Estado", b.radio.enabled === true || b.radio.radio_ativo === true ? "Ativo" : b.radio.enabled === false || b.radio.radio_ativo === false ? "Inativo" : null], ["Interferência", null]])}</details>`).join("") + (mesh?.nodes?.length || mesh?.enabled === true ? `<details class="wifi-diagnostic-card"><summary>Mesh · ${mesh.nodes.length} nós observados</summary>${table([{ label: "Nó", keys: ["id"] }, { label: "Pai", keys: ["parent"] }, { label: "Backhaul", keys: ["backhaul"] }], mesh.nodes)}</details>` : "") || '<p class="muted">Não disponível neste equipamento ou nesta execução.</p>';
  }
  function runtimeView(data) {
    const scan = data.bootstrap_probes?.compatibility_scan;
    if (!scan) return table([{ label: "Seção", keys: ["title"] }, { label: "Disponível", render: (r) => r.available ? "Dados retornados" : "Não disponível" }, { label: "Registros", keys: ["count"] }], Object.entries(data.sections || {}).map(([title, row]) => ({ title, available: row.available, count: row.record_count ?? (Array.isArray(row.data) ? row.data.length : null) })));
    return fields([["Modelo informado", data.identity?.model], ["Firmware informado", data.identity?.firmware], ["Perfil de protocolo", data.profile_selection?.name], ["Melhor correspondência", scan.best_matching_profile], ["Perfis empatados", scan.tied_profiles], ["Scores", Object.entries(scan.profile_scores || {}).map(([name, score]) => `${name}: ${score}`).join(" · ")]]) + table([{ label: "Recurso", keys: ["feature"] }, { label: "Endpoint", keys: ["tag"] }, { label: "Resultado", keys: ["status"] }, { label: "Registros", keys: ["records"] }, { label: "Formato", keys: ["format"] }, { label: "Objetos observados", render: (r) => esc(Object.keys(r.nodes_seen || {}).join(", ")) }, { label: "Objetos não reconhecidos", render: (r) => esc((r.unknown_nodes || []).join(", ")) }], Object.entries(scan.endpoints || {}).map(([feature, entry]) => ({ feature, ...entry })));
  }
  function channelsView(result) {
    return (result.wifi_environment || []).map((entry) => {
      const a = entry.channel_analysis || {}, b = (result.wifi_quality?.bands || []).find((b2) => b2.band === entry.band) || {}, r = b.radio || {};
      return `<article class="wifi-diagnostic-card"><h3>${esc(entry.band)}</h3>${fields([["Canal atual", a.current_channel], ["Seleção", a.auto_channel == null ? null : a.auto_channel ? "Automático" : "Manual"], ["Largura", r.bandwidth ?? r.largura], ["Padrão", r.standard ?? r.padrao], ["Potência", r.tx_power ?? r.potencia], ["País", r.country ?? r.pais], ["Canais permitidos", (entry.available_channels || []).flatMap((g) => g.channels || g.canais || []).join(", ") || null], ["Clientes", b.clients], ["RSSI médio", fmt(b.avg_rssi, " dBm")], ["SNR médio", fmt(b.avg_snr, " dB")], ["Redes vizinhas", a.neighbor_scan_confirmed ? a.neighbor_count : null], ["Score atual", a.current_score], ["Melhor canal observado", a.best_channel], ["Score do melhor canal", a.best_score]])}<p class="muted">${esc(a.recommendation?.message || entry.message || "Sem indicação de troca nesta medição.")}</p></article>`;
    }).join("") || '<p class="muted">Leitura dos rádios não disponível nesta execução.</p>';
  }
  function mount7() {
    const scope = currentScope(), form = document.querySelector("#complete-form");
    let running = false, current = null, history = [], chartMode = "latency", historyStamp = 0;
    const put = (id, html) => {
      if (scopeActive(scope)) {
        const el = document.querySelector("#complete-" + id);
        if (el) el.innerHTML = html;
      }
    };
    const showLine = (r) => {
      const el = document.querySelector("#connectivity-" + r.id);
      if (!el) return;
      el.querySelector("[data-status]").innerHTML = badge2(r.status);
      el.querySelector("[data-time]").textContent = fmt(r.duration_ms, " ms");
      el.querySelector("[data-origin]").textContent = (r.origin === "host_access_manager" ? "Computador do técnico" : "ONT") + (r.target ? " · " + r.target : "");
      el.title = r.error || "";
    };
    function paint() {
      if (!current || !scopeActive(scope)) return;
      const metric3 = (id, value2, detail) => {
        document.querySelector("#metric-" + id).textContent = value2;
        document.querySelector("#metric-" + id + "-detail").textContent = detail;
      };
      metric3("latency", fmt(current.latency_ms, " ms"), "Ping da ONT");
      metric3("loss", fmt(current.packet_loss_percent, " %"), "Ping da ONT");
      metric3("availability", "Não calculada", "Execuções pontuais não medem disponibilidade contínua");
      const rates = current.sections?.traffic?.sources || [], rate2 = rates.find((r) => r.source === "wan");
      metric3("rate", fmt(rate2?.rx_mbps, " Mbps"), rate2 ? "RX · " + (rate2.label || rate2.source) : "Sem taxa WAN comprovada; não soma LAN/WLAN");
      metric3("signal", current.wifi_quality?.label || "Não disponível", fmt(current.wifi_quality?.avg_rssi, " dBm") + " · associações observadas");
      current.connectivity.forEach(showLine);
      put("trace", hopsView(current.traceroute || []));
      put("wifi", wifiView(current.wifi_quality || {}, current.sections?.mesh));
      put("channels", channelsView(current));
      put("resources", resourcesView(current.resources || {}));
      put("alerts", (current.alerts || []).map((a) => `<div class="diagnostic-alert status-${a.level}"><strong>${esc(a.title)}</strong><p>${esc(a.detail)}</p></div>`).join("") || '<p class="muted">Nenhum alerta derivado dos dados disponíveis. Isso não comprova saúde das métricas ausentes.</p>');
      put("evidence", `<details><summary>Leituras e erros por seção</summary><pre>${esc(JSON.stringify({ device: current.device, started_at: current.started_at, finished_at: current.finished_at, wifi_environment: current.wifi_environment, channel_analysis: current.channel_analysis, sections: current.sections, section_errors: current.section_errors }, null, 2))}</pre></details>`);
      document.querySelector("#complete-verified").textContent = "Verificado em " + new Date(current.finished_at).toLocaleString("pt-BR");
      document.querySelector("#complete-export").disabled = !current.history_id;
      put("health", esc(current.packet_loss_percent === 100 ? "Crítico: perda total no ping." : current.packet_loss_percent > 2 ? "Atenção: perda elevada no ping." : "Dados da execução atual; métricas ausentes não recebem classificação."));
    }
    function chart() {
      const period = Number(document.querySelector("#chart-period").value), since = Date.now() - period * 36e5, points = history.filter((r) => ["complete", "ping"].includes(r.test_type) && new Date(r.finished_at).getTime() >= since).map((r) => ({ time: new Date(r.finished_at).getTime(), value: chartMode === "latency" ? r.latency_ms : r.packet_loss_percent })).filter((r) => Number.isFinite(r.value)).sort((a, b) => a.time - b.time);
      if (!points.length) {
        put("chart", '<p class="muted">Nenhuma amostra medida neste período.</p>');
        return;
      }
      const w = 680, h = 210, left = 42, right = 660, top = 16, bottom = 170, min = points[0].time, max = points.at(-1).time, peak = Math.max(1, ...points.map((p) => p.value)), xy = points.map((p) => [left + (p.time - min) / (max - min || 1) * (right - left), bottom - p.value / peak * (bottom - top)]), coords = xy.map((p) => p.join(",")).join(" "), color = chartMode === "latency" ? "#9278c3" : "#48a77c";
      put("chart", `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${chartMode === "latency" ? "Latência" : "Perda"}: ${points.length} amostras reais"><line x1="${left}" y1="${bottom}" x2="${right}" y2="${bottom}" stroke="#e6e3ed"/><text x="2" y="24">${peak.toFixed(1)}</text><text x="2" y="174">0</text>${xy.length > 1 ? `<polygon points="${left},${bottom} ${coords} ${xy.at(-1)[0]},${bottom}" fill="${color}22"/><polyline points="${coords}" fill="none" stroke="${color}" stroke-width="2.5"/>` : ""}${xy.map((p, i) => `<circle cx="${p[0]}" cy="${p[1]}" r="3" fill="${color}"><title>${esc(new Date(points[i].time).toLocaleString("pt-BR"))} · ${points[i].value}</title></circle>`).join("")}<text x="42" y="200">${esc(new Date(min).toLocaleTimeString("pt-BR"))}</text><text x="540" y="200">${esc(new Date(max).toLocaleTimeString("pt-BR"))}</text></svg><p class="muted">${points.length} amostras persistidas · ${chartMode === "latency" ? "ms" : "%"} · sem interpolação de amostras ausentes</p>`);
    }
    async function loadHistory() {
      const stamp = ++historyStamp;
      try {
        const data = await request("/api/device/diagnostics/full/history", { scope, method: "POST", body: JSON.stringify({ hours: 168 }) });
        if (!scopeActive(scope) || stamp !== historyStamp) return;
        history = data;
        const hours = Number(document.querySelector("#diagnostic-history-period").value), status3 = document.querySelector("#diagnostic-history-status").value, since = Date.now() - hours * 36e5, filtered = history.filter((r) => new Date(r.finished_at).getTime() >= since && (!status3 || r.status === status3));
        put("history", table([{ label: "Data", render: (r) => esc(new Date(r.finished_at).toLocaleString("pt-BR")) }, { label: "Teste", render: (r) => esc(r.test_type === "complete" ? "Completo" : tests.find((t) => t[0] === r.test_type)?.[1]) }, { label: "Resultado", render: (r) => badge2(r.status) }, { label: "Latência", render: (r) => fmt(r.latency_ms, " ms") }, { label: "Perda", render: (r) => fmt(r.packet_loss_percent, " %") }, { label: "Ações", render: (r) => `<button class="button" data-diagnostic-load="${r.history_id}">Ver / exportar</button>` }], filtered, "Nenhuma execução neste filtro."));
        document.querySelectorAll("[data-diagnostic-load]").forEach((b) => b.onclick = () => {
          current = history.find((r) => r.history_id === Number(b.dataset.diagnosticLoad));
          paint();
        });
        const measured = history.filter((r) => r.test_type === "complete"), span = measured.length > 1 ? (Date.now() - Math.min(...measured.map((r) => new Date(r.finished_at).getTime()))) / 36e5 : 0;
        document.querySelectorAll("#chart-period option").forEach((o, i) => {
          if (i) o.disabled = span < Number(o.value);
        });
        chart();
      } catch (e) {
        if (scopeActive(scope) && !isCancelled(e)) put("history", `<p class="muted">${esc(e.message)}</p>`);
      }
    }
    async function run(test = null) {
      if (running) return;
      running = true;
      const button2 = document.querySelector("#complete-run");
      button2.disabled = true;
      button2.textContent = "Executando…";
      document.querySelector("#complete-progress").textContent = "Executando testes reais; consultas nativas respeitam o contexto da sessão…";
      document.querySelectorAll("[data-retest]").forEach((b) => b.disabled = true);
      try {
        const fd = new FormData(form), data = await request("/api/device/diagnostics/full/run", { scope, method: "POST", signal: scope.controller.signal, body: JSON.stringify({ target: fd.get("host"), hostname: fd.get("hostname"), trace: Boolean(fd.get("trace")), test, session_id: window.__amStore?.session?.session?.session_id }) });
        if (!scopeActive(scope)) return;
        if (test && current) {
          current = { ...current, connectivity: current.connectivity.map((r) => r.id === test ? data.connectivity[0] : r) };
          showLine(data.connectivity[0]);
          if (test === "ping") {
            current.latency_ms = data.latency_ms;
            current.packet_loss_percent = data.packet_loss_percent;
            current.alerts = [...(current.alerts || []).filter((a) => !a.title.includes("Perda de pacotes") && !a.title.startsWith("Ping ")), ...data.alerts || []];
          }
          current.history_id = null;
          document.querySelector("#complete-export").disabled = true;
          document.querySelector("#complete-verified").textContent = "Reteste em " + new Date(data.finished_at).toLocaleString("pt-BR");
          if (test === "ping") {
            document.querySelector("#metric-latency").textContent = fmt(data.latency_ms, " ms");
            document.querySelector("#metric-loss").textContent = fmt(data.packet_loss_percent, " %");
            put("alerts", (current.alerts || []).map((a) => `<div class="diagnostic-alert status-${a.level}"><strong>${esc(a.title)}</strong><p>${esc(a.detail)}</p></div>`).join("") || '<p class="muted">Nenhum alerta derivado dos dados disponíveis.</p>');
            put("health", esc(data.packet_loss_percent === 100 ? "Crítico: perda total no ping." : data.packet_loss_percent > 2 ? "Atenção: perda elevada no ping." : "Dados do reteste atual."));
          }
        } else {
          current = data;
          paint();
        }
        document.querySelector("#complete-progress").textContent = "Coleta concluída. Resultados persistidos no histórico local.";
        await loadHistory();
      } catch (e) {
        if (scopeActive(scope) && !isCancelled(e)) document.querySelector("#complete-progress").textContent = e.message;
      } finally {
        running = false;
        if (scopeActive(scope)) {
          button2.disabled = false;
          button2.textContent = "Executar diagnóstico";
          document.querySelectorAll("[data-retest]").forEach((b) => b.disabled = false);
        }
      }
    }
    document.querySelector("#complete-run").onclick = () => run();
    form.onsubmit = (e) => {
      e.preventDefault();
      run();
    };
    document.querySelectorAll("[data-retest]").forEach((b) => b.onclick = () => run(b.dataset.retest));
    document.querySelectorAll("[data-chart]").forEach((b) => b.onclick = () => {
      chartMode = b.dataset.chart;
      document.querySelectorAll("[data-chart]").forEach((n) => n.classList.toggle("active", n === b));
      chart();
    });
    document.querySelector("#chart-period").onchange = chart;
    document.querySelector("#diagnostic-history-period").onchange = loadHistory;
    document.querySelector("#diagnostic-history-status").onchange = loadHistory;
    document.querySelector("#complete-export").onclick = async () => {
      try {
        const format = document.querySelector("#complete-export-format").value, r = await request("/api/device/diagnostics/full/export", { scope, method: "POST", body: JSON.stringify({ id: current.history_id, format }) });
        if (!scopeActive(scope)) return;
        const blob = new Blob([format === "json" ? JSON.stringify(r.data, null, 2) : r.content], { type: format === "json" ? "application/json" : "text/csv;charset=utf-8" }), url = URL.createObjectURL(blob), a = document.createElement("a");
        a.href = url;
        a.download = r.filename;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1e3);
      } catch (e) {
        if (!isCancelled(e) && scopeActive(scope)) document.querySelector("#complete-progress").textContent = e.message;
      }
    };
    request("/api/device/diagnostics/full/config", { scope }).then((c) => {
      if (scopeActive(scope)) {
        if (!form.elements.host.value) form.elements.host.value = c.target;
        if (!form.elements.hostname.value) form.elements.hostname.value = c.hostname;
      }
    }).catch(() => {
    });
    loadHistory();
    mountSpeedtest();
    for (const [id, path2] of [["workstation", "/api/device/diagnostics/workstation"], ["runtime", "/api/device/runtime/diagnostic"]]) document.querySelector("#complete-" + id).onclick = async (e) => {
      e.currentTarget.disabled = true;
      try {
        if (id === "runtime" && store.session?.session?.vendor === "zte") {
          await request("/api/device/runtime/compatibility", { scope, method: "POST", body: "{}" });
          const session2 = await request("/api/session", { scope });
          if (scopeActive(scope)) {
            store.setSession(session2);
            store.setCapabilities(session2.session?.capabilities || {});
          }
        }
        const data = await request(path2, { scope, ...id === "workstation" ? { method: "POST", body: "{}" } : { forceRefresh: true } });
        if (scopeActive(scope)) put(id + "-result", id === "runtime" ? runtimeView(data) : fields([["DNS do PC", data.dns?.ok ? "Resolvido" : "Sem resposta"], ["TCP 443 — respostas", data.tcp?.successful], ["Tempo médio TCP (ms)", data.tcp?.mean_connect_ms], ["Limitações", data.limitations]]));
      } catch (e2) {
        if (!isCancelled(e2)) put(id + "-result", esc(e2.message));
      } finally {
        if (scopeActive(scope)) document.querySelector("#complete-" + id).disabled = false;
      }
    };
  }

  // apps/access_manager/static/js/workspaces/app.js
  var mountedRoot = null;
  var workspace = null;
  var connectionBusy = false;
  var infrastructureSettings = {};
  var viewStates = /* @__PURE__ */ new Map();
  var meta = {
    juniperOverview: ["JUNIPER", "Visão geral"],
    subscribers: ["JUNIPER", "Assinantes PPPoE"],
    juniperInterfaces: ["JUNIPER", "Interfaces"],
    juniperSystem: ["JUNIPER", "Sistema"],
    juniperDiagnostics: ["JUNIPER", "Diagnóstico"],
    overview: ["VISÃO OPERACIONAL", "Visão geral"],
    clients: ["VISÃO OPERACIONAL", "Clientes"],
    traffic: ["VISÃO OPERACIONAL", "Tráfego"],
    wifi: ["REDE", "Wi-Fi e SSIDs"],
    wan: ["REDE", "WAN"],
    lan: ["REDE", "LAN"],
    dhcpdns: ["REDE", "DHCP e DNS"],
    diagnostics: ["OPERAÇÕES", "Diagnóstico"],
    completeDiagnostics: ["OPERAÇÕES", "Diagnóstico completo"],
    profiles: ["OPERAÇÕES", "Perfis"],
    management: ["OPERAÇÕES", "Gerenciamento"],
    capabilities: ["AVANÇADO", "Capabilities"],
    deployment: ["AVANÇADO", "Implantação"]
  };
  Object.assign(meta, Object.fromEntries(Object.entries(titles).map(([key, [group, title]]) => [key, [`Infraestrutura / Juniper / ${group}`, title]])));
  meta.subscribers[1] = "Assinantes PPPoE";
  var juniperRoutes = Object.fromEntries(Object.keys(titles).map((key) => [key, routeView(key)]));
  var views = {
    ...juniperRoutes,
    overview: overview_exports,
    clients: clients_exports,
    wifi: wifi_exports,
    profiles: profiles_exports,
    management: management_exports,
    capabilities: capabilities_exports,
    completeDiagnostics: complete_diagnostics_exports,
    traffic: traffic_exports,
    diagnostics: { render: diagnostics2, mount: mountDiagnostics2 },
    deployment: { render: deployment },
    wan: { render: wan },
    lan: { render: lan },
    dhcpdns: { render: dhcpdns, mount: mountDhcpDns }
  };
  function syncContext() {
    const s = store.session?.session;
    const connected = Boolean(store.session?.connected);
    const infrastructure = s?.vendor === "juniper";
    document.querySelector(".app-shell").classList.toggle("juniper-shell", infrastructure);
    document.querySelector("#action-dialog").classList.toggle("juniper-surface", infrastructure);
    document.querySelectorAll("#sidebar .nav,#sidebar .nav-group,#sidebar .juniper-nav-group").forEach((element) => {
      element.hidden = infrastructure ? !element.hasAttribute("data-juniper-nav") : element.hasAttribute("data-juniper-nav");
    });
    document.querySelector("#login-page").hidden = connected;
    document.querySelector(".app-shell").hidden = !connected;
    let back = document.querySelector("#return-subscriber");
    if (!back) {
      back = document.createElement("button");
      back.id = "return-subscriber";
      back.className = "button";
      back.textContent = "Voltar ao assinante";
      document.querySelector("#disconnect-button").before(back);
      back.onclick = async () => {
        try {
          const s2 = await request("/api/session/select", { method: "POST", body: JSON.stringify({ kind: "infrastructure" }) });
          store.setSession(s2);
          store.setCapabilities(s2.session?.capabilities || {});
          syncContext();
          await render9("subscribers");
        } catch (e) {
          toast(e.message);
        }
      };
    }
    back.hidden = infrastructure || !store.session?.infrastructure?.connected;
    const disconnect = document.querySelector("#disconnect-button");
    const updated = document.querySelector("#ctx-updated");
    if (disconnect) disconnect.disabled = !s;
    if (updated) updated.textContent = s?.updated_at ? `Atualizado ${new Date(s.updated_at).toLocaleTimeString()}` : "—";
  }
  async function render9(name = store.view, background = false) {
    if (store.session?.session?.vendor === "juniper" && !Object.hasOwn(juniperRoutes, name)) name = "juniperOverview";
    else if (store.session?.session?.vendor !== "juniper" && Object.hasOwn(juniperRoutes, name)) name = "overview";
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
    document.querySelectorAll(".nav").forEach((b) => {
      const active2 = b.dataset.view === name;
      b.classList.toggle("active", active2);
      if (active2) {
        b.setAttribute("aria-current", "page");
        const group = b.closest("details");
        if (group) group.open = true;
      } else b.removeAttribute("aria-current");
    });
    const [kicker, title] = meta[name] || meta.overview;
    const kickerEl = document.querySelector("#page-kicker");
    const titleEl = document.querySelector("#page-title");
    if (kickerEl) {
      if (Object.hasOwn(juniperRoutes, name)) kickerEl.innerHTML = `<button class="j-crumb" data-juniper-route="juniperOverview">Infraestrutura</button> / <button class="j-crumb" data-juniper-route="juniperOverview">Juniper</button> / ${esc(titles[name][0])}`;
      else kickerEl.textContent = kicker;
    }
    if (titleEl) titleEl.textContent = title;
    document.querySelector(".page-heading").hidden = ["overview", "traffic", "completeDiagnostics"].includes(name);
    if (!store.session?.connected && name !== "profiles") {
      state.loading = false;
      workspace.innerHTML = '<div class="empty-state"><strong>Nenhum equipamento conectado</strong><span>Conecte-se para carregar este workspace.</span></div>';
      return;
    }
    if (!background) document.querySelector(".app-main").scrollTop = 0;
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
      model_hint: modelHint || null,
      ...fd.get("vendor") === "juniper" ? { vendor: "juniper", transport: fd.get("transport") || "netconf", port: fd.get("port") || null, ssh_port: fd.get("ssh_port"), netconf_port: fd.get("netconf_port") } : {}
    };
  }
  async function connectFromForm(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (connectionBusy || !form.reportValidity()) return;
    connectionBusy = true;
    document.querySelector("#connection-feedback").textContent = "";
    document.querySelector("#connection-status").textContent = "Conectando…";
    const button2 = document.querySelector("#connect-button");
    const originalLabel = button2?.textContent || "Conectar";
    const payload = normalizeConnectionPayload(form);
    if (button2) {
      button2.disabled = true;
      button2.textContent = "Conectando…";
    }
    try {
      const s = await request("/api/session", { method: "POST", body: JSON.stringify(payload) });
      if (!s?.connected || !s?.session) {
        throw new Error("A API não confirmou uma sessão autenticada no equipamento.");
      }
      store.setSession(s);
      if (payload.vendor === "juniper") {
        infrastructureSettings = { ...infrastructureSettings, last_successful_host: payload.host, ssh_port: payload.ssh_port, netconf_port: payload.netconf_port, preferred_transport: payload.transport };
      }
      store.setCapabilities(s.session?.capabilities || {});
      syncContext();
      const password = form.querySelector('[name="password"]');
      if (password) password.value = "";
      toast(`Conectado via ${payload.vendor === "juniper" ? s.session.protocol_family || "SSH" : payload.https ? "HTTPS" : "HTTP"} em ${s.session.model || s.session.vendor || payload.host}.`);
      await render9("overview");
    } catch (err) {
      document.querySelector("#connection-feedback").textContent = err?.message || "Não foi possível conectar ao equipamento.";
      document.querySelector("#connection-status").textContent = "Conexão não confirmada";
      toast(err?.message || "Não foi possível conectar ao equipamento.");
      console.error("[Access Manager] Falha de conexão:", err);
    } finally {
      connectionBusy = false;
      if (payload.vendor === "juniper") form.elements.password.value = "";
      payload.password = "";
      if (button2) {
        button2.disabled = false;
        button2.textContent = originalLabel;
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
    const oldNav = document.querySelectorAll("[data-juniper-nav]");
    oldNav.forEach((n) => n.remove());
    document.querySelector("#sidebar").insertAdjacentHTML("afterbegin", navigation.map(([group, items], index) => `<details class="juniper-nav-group" data-juniper-nav hidden ${index < 2 ? "open" : ""}><summary>${esc(group)}</summary>${items.map(([route, label]) => `<button class="nav" data-juniper-nav data-view="${route}" hidden><span>${esc(label)}</span></button>`).join("")}</details>`).join(""));
    document.querySelector("#juniper-help").onclick = () => dialog("Ajuda · Juniper / Junos BNG", "<p>Busque o contrato, selecione uma sessão e consulte detalhes sem sair da lista. Leituras avançadas são feitas sob demanda.</p><p>O acesso ao CPE usa credenciais separadas. Voltar ao assinante mantém a sessão Juniper; portas inacessíveis não confirmam assinante offline.</p>");
    document.addEventListener("juniper-navigate", (event) => render9(event.detail));
    document.addEventListener("click", (event) => {
      const b = event.target.closest("[data-juniper-route]");
      if (b) render9(b.dataset.juniperRoute);
    });
    document.querySelectorAll(".nav").forEach((b) => {
      b.onclick = () => {
        document.querySelector("#sidebar")?.classList.remove("open");
        render9(b.dataset.view);
      };
    });
    const mobileNav = document.querySelector("#mobile-nav");
    if (mobileNav) mobileNav.onclick = () => document.querySelector("#sidebar")?.classList.toggle("open");
    const form = document.querySelector("#connect-form");
    if (!form) throw new Error("Formulário de conexão não foi encontrado.");
    form.addEventListener("submit", connectFromForm);
    try {
      infrastructureSettings = await request("/api/infrastructure/settings");
    } catch {
    }
    const syncVendor = (event) => {
      const juniper = form.elements.vendor.value === "juniper";
      document.querySelector("#juniper-connection").hidden = !juniper;
      form.querySelector(".https-toggle").hidden = juniper;
      document.querySelector("#login-page").classList.toggle("infrastructure-login", juniper);
      document.querySelector("#action-dialog").classList.toggle("juniper-surface", juniper);
      form.elements.password.autocomplete = juniper ? "off" : "current-password";
      form.elements.username.autocomplete = juniper ? "off" : "username";
      form.querySelector("[for=connection-host]").textContent = juniper ? "Servidor" : "IP ou IP:porta";
      form.querySelector("[for=connection-user]").textContent = juniper ? "Usuário AD" : "Usuário";
      form.querySelector("[for=connection-password]").textContent = juniper ? "Senha AD" : "Senha";
      if (juniper) {
        if (event?.type === "change" || !form.elements.host.value) form.elements.host.value = infrastructureSettings.last_successful_host || infrastructureSettings.default_host || "";
        form.elements.ssh_port.value = infrastructureSettings.ssh_port || 22;
        form.elements.netconf_port.value = infrastructureSettings.netconf_port || 830;
        form.elements.transport.value = infrastructureSettings.preferred_transport || "ssh";
      }
      document.querySelector(".connection-security").textContent = juniper ? "Use sua conta corporativa no Junos. A senha é descartada após cada tentativa." : "As credenciais são usadas na sessão com o equipamento. Selecione HTTPS quando disponível.";
    };
    form.elements.vendor.onchange = syncVendor;
    syncVendor();
    document.querySelector("#inspect-host-key").onclick = async () => {
      try {
        const info = await request("/api/infrastructure/host-key", { method: "POST", body: JSON.stringify({ host: store.session?.connected && store.session.session?.vendor === "juniper" ? store.session.session.host : form.elements.host.value, port: form.elements.transport.value === "netconf" ? form.elements.netconf_port.value : form.elements.ssh_port.value }) });
        const d = dialog("Identidade SSH do servidor", `<div class="j-trust-body"><div class="j-trust-alert ${info.status === "HOST_KEY_CHANGED" ? "changed" : ""}" role="alert"><strong>${info.status === "HOST_KEY_CHANGED" ? "A chave SSH apresentada pelo servidor mudou" : info.status === "HOST_KEY_TRUSTED" ? "Chave SSH reconhecida" : "Primeiro acesso a este servidor"}</strong><p>Compare a impressão digital com uma fonte confiável antes de aceitar. Uma chave alterada bloqueia a conexão.</p></div><dl class="j-kv"><div><dt>Servidor</dt><dd>${esc(info.host)}:${esc(info.port)}</dd></div><div><dt>Algoritmo</dt><dd>${esc(info.algorithm || "—")}</dd></div><div><dt>Fingerprint apresentado</dt><dd>${esc(info.fingerprint)}</dd></div>${info.previous_fingerprints.length ? `<div><dt>Fingerprints anteriores</dt><dd>${info.previous_fingerprints.map(esc).join(", ")}</dd></div>` : ""}</dl></div>`, `<button class="button primary" data-trust-key>Confirmei a identidade — confiar nesta chave</button>`);
        d.querySelector("[data-trust-key]").onclick = async (event) => {
          event.currentTarget.disabled = true;
          try {
            await request("/api/infrastructure/host-key/trust", { method: "POST", body: JSON.stringify({ ...info, confirm: true }) });
            d.close();
            toast("Chave confiável para este servidor e porta.");
          } catch (e) {
            toast(e.message);
            if (d.open) event.currentTarget.disabled = false;
          }
        };
      } catch (e) {
        toast(e.message);
      }
    };
    document.querySelector("[data-toggle-password]").onclick = (e) => {
      const input = form.elements.password;
      input.type = input.type === "password" ? "text" : "password";
      e.currentTarget.textContent = input.type === "password" ? "Mostrar" : "Ocultar";
    };
    const disconnect = document.querySelector("#disconnect-button");
    if (disconnect) {
      disconnect.onclick = async () => {
        let remaining;
        try {
          remaining = await request("/api/session", { method: "DELETE" });
        } finally {
          store.setSession(remaining?.session ? remaining : { connected: false, session: null });
          store.setCapabilities(remaining?.session?.capabilities || {});
          views[store.view]?.unmount?.();
          beginView("login");
          form.elements.password.value = "";
          form.elements.password.type = "password";
          document.querySelector("[data-toggle-password]").textContent = "Mostrar";
          document.querySelector("#connection-status").textContent = "Pronto para conectar";
          syncContext();
          render9(store.view);
        }
      };
    }
    document.addEventListener("session-selected", (event) => {
      store.setSession(event.detail);
      store.setCapabilities(event.detail.session?.capabilities || {});
      syncContext();
      render9("overview");
    });
    document.addEventListener("refresh-view", () => render9(store.view));
    let refreshTimer;
    document.addEventListener("snapshot-updated", (event) => {
      if (event.detail.generation !== currentScope()?.generation || ["wifi", "profiles", "traffic", "overview", "completeDiagnostics"].includes(store.view)) return;
      clearTimeout(refreshTimer);
      const scope = currentScope();
      refreshTimer = setTimeout(() => {
        if (scopeActive(scope)) render9(store.view, true);
      }, 16);
    });
    try {
      const s = await request("/api/session");
      store.setSession(s);
      store.setCapabilities(s.session?.capabilities || {});
      syncContext();
      await render9(s.connected ? currentScope() ? store.view : "overview" : store.view);
    } catch (error) {
      console.error("[Access Manager] Falha ao consultar sessão inicial:", error);
      await render9(store.view);
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
