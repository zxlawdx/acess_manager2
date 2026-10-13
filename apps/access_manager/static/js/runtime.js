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
    const url = new URL(path, window.location.origin);
    const res = await fetch(url, {
      credentials: "same-origin",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers || {}
      }
    });
    const text = await res.text();
    const data = parseResponseBody(text);
    if (!res.ok) {
      const message = data?.error?.message || data?.message || `HTTP ${res.status} ao acessar ${url.pathname}`;
      throw new Error(message);
    }
    if (data?.success === false) {
      throw new Error(data?.error?.message || "Falha na operação");
    }
    return data;
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
  function metric(label, value, detail = "") {
    return `<article class="metric"><label>${esc(label)}</label><strong>${esc(value)}</strong>${detail ? `<small>${esc(detail)}</small>` : ""}</article>`;
  }
  function kv(data) {
    const items = Object.entries(data || {}).filter(([, v]) => v !== void 0 && v !== null && typeof v !== "object");
    return `<div class="kv-grid">${items.map(([k, v]) => `<div class="kv"><label>${esc(k.replaceAll("_", " "))}</label><span>${esc(typeof v === "boolean" ? v ? "Sim" : "Não" : v)}</span></div>`).join("")}</div>`;
  }
  function table(columns2, rows2, empty = "Nenhum registro encontrado") {
    if (!Array.isArray(rows2) || !rows2.length) return `<div class="empty-state"><span>${esc(empty)}</span></div>`;
    return `<div class="panel"><table class="data-table"><thead><tr>${columns2.map((c) => `<th>${esc(c.label)}</th>`).join("")}</tr></thead><tbody>${rows2.map((r) => `<tr>${columns2.map((c) => `<td>${c.render ? c.render(r) : esc(pick(r, ...c.keys || [c.key]))}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  }
  function cap(feature) {
    return window.__amStore?.capabilities?.[feature] || { read: "UNKNOWN", write: "UNKNOWN", enabled: { read: false, write: false }, evidence: "UNKNOWN" };
  }
  function capBadge(state) {
    const kind = state === "SUPPORTED" ? "ok" : state === "PARTIAL" || state === "UNKNOWN" ? "warn" : "bad";
    return badge(state, kind);
  }
  function toast(message) {
    const host = document.querySelector("#toast-region");
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = message;
    host.append(el);
    setTimeout(() => el.remove(), 3600);
  }
  function dialog(title, content, actions = "") {
    const d = document.querySelector("#action-dialog");
    document.querySelector("#dialog-body").innerHTML = `<div class="dialog-inner"><div class="dialog-header"><h2 id="dialog-title">${esc(title)}</h2><button class="icon-button" data-close-dialog aria-label="Fechar">×</button></div>${content}${actions ? `<div class="dialog-footer">${actions}</div>` : ""}</div>`;
    d.querySelector("[data-close-dialog]").onclick = () => d.close();
    d.addEventListener("close", () => {
      document.querySelector("#dialog-body").replaceChildren();
    }, { once: true });
    d.showModal();
    return d;
  }

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
    if (v === true || /^(online|connected|true|1)$/i.test(String(v))) return badge("Online", "ok");
    return badge(v);
  };
  var connection = (r) => pick(r, "connection_type", "tipo", "interface");
  var band = (r) => pick(r, "band", "banda");
  var columns = [{ label: "Status", render: status }, { label: "Hostname", render: (r) => `<button class="icon-button" data-client="${rows.indexOf(r)}">${esc(pick(r, "hostname", "nome"))}</button>` }, { label: "IP", keys: ["ip"] }, { label: "MAC", keys: ["mac"] }, { label: "Conexão", render: connection }, { label: "SSID / porta", keys: ["ssid", "port", "interface"] }, { label: "Banda", render: band }, { label: "RSSI", keys: ["rssi"] }, { label: "SNR", keys: ["snr"] }, { label: "RX / TX", render: (r) => `${esc(pick(r, "rx_rate"))} / ${esc(pick(r, "tx_rate"))}` }];
  function cards(data) {
    return `<div class="client-cards">${data.map((r) => `<button class="client-card" data-client="${rows.indexOf(r)}"><strong>${esc(pick(r, "hostname", "nome"))}</strong><span class="mono">${esc(pick(r, "ip"))}</span><small>${esc(connection(r))} · ${esc(band(r))}</small>${status(r)}</button>`).join("")}</div>`;
  }
  function topology(data, device = "Equipamento", register = true) {
    if (register) rows = data;
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
      const r = rows[Number(btn.dataset.client)];
      if (!r) return;
      const data = { Hostname: pick(r, "hostname", "nome"), IP: pick(r, "ip"), MAC: pick(r, "mac"), Conexão: connection(r), Interface: pick(r, "interface", "port"), SSID: pick(r, "ssid"), Banda: band(r), RSSI: pick(r, "rssi"), SNR: pick(r, "snr"), "RX bytes": pick(r, "rx_bytes"), "TX bytes": pick(r, "tx_bytes"), "Taxa RX": pick(r, "rx_rate"), "Taxa TX": pick(r, "tx_rate"), Fabricante: pick(r, "manufacturer"), Estado: pick(r, "status", "online"), Lease: pick(r, "lease") };
      const d = dialog("Detalhes do cliente", kv(data));
      d.classList.add("drawer");
      d.addEventListener("close", () => {
        d.classList.remove("drawer");
        document.querySelector("#dialog-body").replaceChildren();
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
    const paint = () => {
      const q = document.querySelector("#client-search").value.toLowerCase(), type = document.querySelector("#client-filter").value, b = document.querySelector("#client-band").value, ssid = document.querySelector("#client-ssid").value, view = document.querySelector("#client-view").value;
      const filtered = rows.filter((r) => (!q || [r.hostname, r.ip, r.mac].some((v) => String(v || "").toLowerCase().includes(q))) && (!type || String(connection(r)).includes(type)) && (!b || String(band(r)).replace(",", ".").includes(b)) && (!ssid || r.ssid === ssid));
      const all = rows;
      document.querySelector("#client-results").innerHTML = view === "table" ? table(columns, filtered) : view === "cards" ? cards(filtered) : topology(filtered, "Equipamento", false);
      rows = all;
      mountDetails();
    };
    document.querySelectorAll("#client-search,#client-filter,#client-band,#client-ssid,#client-view").forEach((e) => e.addEventListener("input", paint));
    paint();
  }

  // apps/access_manager/static/js/workspaces/views/overview.js
  async function render2() {
    const endpoints = ["/api/device", "/api/device/wan", "/api/device/optical", "/api/device/clients"];
    const results = await Promise.allSettled(endpoints.map((p) => request(p)));
    const [device, wan2, optical, clients] = results.map((r) => r.status === "fulfilled" ? r.value : null);
    const w = Array.isArray(wan2) ? wan2[0] || {} : wan2 || {}, o = optical || {}, d = device || {};
    const failures = results.map((r, i) => r.status === "rejected" ? `<div class="notice warning">${esc(["Equipamento", "WAN", "Óptica", "Clientes"][i])}: ${esc(r.reason.message)}</div>` : "").join("");
    const cpu = typeof d.cpu === "object" ? Object.values(d.cpu || {}).filter((x) => x !== null && x !== void 0).join(" / ") : d.cpu;
    return `${failures}<div class="grid">${metric("Internet", pick(w, "status", "connection_status"))}${metric("IP WAN", pick(w, "ip", "ipv4", "ip_address"))}${metric("Clientes", Array.isArray(clients) ? clients.length : "Não disponível")}${metric("RX óptico", pick(o, "rx", "rx_power", "rx_dbm"))}${metric("CPU", cpu || "Não disponível")}${metric("RAM", pick(d, "memoria_percent", "memory_usage"))}${metric("Temperatura", pick(d, "temperatura_cpu", "temperature"))}${metric("Uptime", pick(d, "uptime_segundos", "uptime"))}</div><div class="split"><section class="panel"><div class="panel-header"><h2>Equipamento</h2>${badge(pick(d, "fabricante", "vendor", "manufacturer"))}</div>${kv(d)}</section><section class="panel"><h2>WAN</h2>${kv(w)}</section></div>${Array.isArray(clients) ? topology(clients, pick(d, "modelo", "model")) : ""}`;
  }
  var mount2 = mountDetails;

  // apps/access_manager/static/js/workspaces/views/wifi.js
  var wifi_exports = {};
  __export(wifi_exports, {
    mount: () => mount3,
    render: () => render3
  });

  // apps/access_manager/static/js/shared/forms.js
  function editConfig(title, path, fields, extra = {}) {
    const supported = fields.filter((f) => f.value !== void 0 && f.value !== null && f.value !== "—");
    const d = dialog(title, `<form class="form-grid">${supported.map((f) => `<div class="field"><label>${esc(f.label)}</label>${f.type === "bool" ? `<select name="${esc(f.key)}"><option value="true" ${f.value === true || f.value === "1" ? "selected" : ""}>Ativo</option><option value="false" ${f.value === false || f.value === "0" ? "selected" : ""}>Inativo</option></select>` : `<input name="${esc(f.key)}" value="${esc(f.value)}" type="${f.type || "text"}">`}</div>`).join("")}<div class="dialog-footer"><button class="button primary">Aplicar alterações</button></div></form>`);
    const form = d.querySelector("form");
    const original = new FormData(form);
    form.onsubmit = async (e) => {
      e.preventDefault();
      const values = new FormData(form), config = {};
      for (const f of supported) {
        if (values.get(f.key) !== original.get(f.key)) {
          const v = values.get(f.key);
          config[f.key] = f.type === "bool" ? v === "true" : f.type === "number" ? Number(v) : String(v);
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
        const result = await request(path, { method: "POST", body: JSON.stringify(payload) });
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
  async function render3() {
    const d = await request("/api/device/wifi");
    networks = Array.isArray(d) ? d : d?.networks || [];
    radios = Array.isArray(d?.radios) ? d.radios : [];
    return `<section class="panel"><h2>Redes Wi-Fi</h2></section>${table([{ label: "SSID", keys: ["ssid"] }, { label: "Banda", keys: ["band", "banda"] }, { label: "Ativo", render: (r) => esc(pick(r, "enabled", "ativo")) }, { label: "Broadcast", keys: ["broadcast"] }, { label: "Segurança", keys: ["security", "seguranca"] }, { label: "Ações", render: (r) => `<div class="inline-actions"><button class="button" data-reveal-wifi="${esc(r.id)}">Ver senha</button><button class="button" data-edit-ssid="${networks.indexOf(r)}" ${cap("wifi").enabled?.write ? "" : "disabled"}>Editar</button></div>` }], networks)}<section class="panel"><h2>Rádios</h2>${radios.map((r, i) => `<article class="panel"><h3>${esc(pick(r, "band", "banda"))}</h3>${kv(r)}<button class="button" data-edit-radio="${i}" ${cap("wifi_radio").enabled?.write ? "" : "disabled"}>Editar rádio</button></article>`).join("") || '<p class="muted">Sem dados de rádio.</p>'}</section>`;
  }
  function mount3() {
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
      editConfig("Editar rádio", "/api/device/wifi/radio", [{ key: "channel", label: "Canal", value: r.channel ?? r.canal }, { key: "auto_channel", label: "Canal automático", value: r.auto_channel ?? r.canal_automatico, type: "bool" }, { key: "bandwidth", label: "Largura", value: r.bandwidth ?? r.largura }, { key: "standard", label: "Padrão", value: r.standard ?? r.padrao }, { key: "tx_power", label: "Potência", value: r.tx_power ?? r.potencia }, { key: "country", label: "País", value: r.country ?? r.pais }, { key: "sgi", label: "SGI", value: r.sgi, type: "bool" }], { band: r.band ?? r.banda });
    });
  }

  // apps/access_manager/static/js/workspaces/views/network.js
  var dhcpData;
  var dnsData;
  var objectPanel = (title, data) => `<section class="panel"><h2>${esc(title)}</h2>${kv(data || {})}</section>`;
  async function wan() {
    const data = await request("/api/device/wan"), rows2 = Array.isArray(data) ? data : [data];
    return rows2.map((r) => {
      const { raw, metadata, advanced, id, path, ...fields } = r || {};
      return `<section class="panel"><h2>${esc(pick(r, "name", "nome", "connection_name"))}</h2>${kv(fields)}<details><summary>Avançado</summary>${kv({ id, path })}<pre>${esc(JSON.stringify(advanced || metadata || raw || {}, null, 2))}</pre></details></section>`;
    }).join("");
  }
  async function lan() {
    const d = await request("/api/device/lan");
    return table([{ label: "Porta", keys: ["port", "porta", "name"] }, { label: "Habilitada", keys: ["admin_state", "enabled"] }, { label: "Link", keys: ["link_state", "status", "state", "estado"] }, { label: "Velocidade", keys: ["speed", "velocidade"] }, { label: "Duplex", keys: ["duplex"] }, { label: "Negociação", keys: ["autonegotiation", "negotiation"] }, { label: "Cliente / MAC", keys: ["client", "mac"] }, { label: "RX bytes", keys: ["rx_bytes"] }, { label: "TX bytes", keys: ["tx_bytes"] }, { label: "Erros RX/TX", render: (r) => `${esc(pick(r, "rx_errors"))}/${esc(pick(r, "tx_errors"))}` }], Array.isArray(d) ? d : d?.ports || []);
  }
  async function dhcpdns() {
    const results = await Promise.allSettled([request("/api/device/dhcp"), request("/api/device/dns")]);
    dhcpData = results[0].status === "fulfilled" ? results[0].value : null;
    dnsData = results[1].status === "fulfilled" ? results[1].value : null;
    return `<div class="split">${dhcpData ? objectPanel("DHCP", dhcpData.basic || dhcpData) : '<section class="panel">DHCP não disponível nesta sessão.</section>'}${dnsData ? objectPanel("DNS", dnsData) : '<section class="panel">DNS não disponível nesta sessão.</section>'}</div><div class="toolbar"><button class="button" id="edit-dhcp" ${dhcpData && cap("dhcp").enabled?.write ? "" : "disabled"}>Editar DHCP</button><button class="button" id="edit-dns" ${dnsData && cap("dns").enabled?.write ? "" : "disabled"}>Editar DNS</button></div>${table([{ label: "Hostname", keys: ["hostname", "Name", "name"] }, { label: "IP", keys: ["ip", "IPAddr", "IPAddress"] }, { label: "MAC", keys: ["mac", "MACAddr", "MACAddress"] }], dhcpData?.leases || [], "Nenhum lease retornado.")}${table([{ label: "Reserva", keys: ["name", "Name"] }, { label: "IP", keys: ["ip", "IPAddr"] }, { label: "MAC", keys: ["mac", "MACAddr"] }], dhcpData?.reservations || [], "Nenhuma reserva retornada.")}`;
  }
  function mountDhcpDns() {
    document.querySelector("#edit-dns").onclick = () => editConfig("Editar DNS", "/api/device/dns", [{ key: "domain_name", label: "Domínio", value: dnsData.domain_name }, { key: "ipv4_1", label: "DNS IPv4 primário", value: dnsData.ipv4_1 }, { key: "ipv4_2", label: "DNS IPv4 secundário", value: dnsData.ipv4_2 }, { key: "ipv6_1", label: "DNS IPv6 primário", value: dnsData.ipv6_1 }, { key: "ipv6_2", label: "DNS IPv6 secundário", value: dnsData.ipv6_2 }]);
    document.querySelector("#edit-dhcp").onclick = () => {
      const d = dhcpData.basic || dhcpData;
      editConfig("Editar DHCP", "/api/device/dhcp", [{ key: "enabled", label: "Servidor DHCP", value: d.ServerEnable, type: "bool" }, { key: "min_address", label: "Início do pool", value: d.MinAddress }, { key: "max_address", label: "Fim do pool", value: d.MaxAddress }, { key: "lease_time", label: "Lease (segundos)", value: d.LeaseTime }, { key: "dns1", label: "DNS primário", value: d.DNSServer1 }, { key: "dns2", label: "DNS secundário", value: d.DNSServer2 }]);
    };
  }

  // apps/access_manager/static/js/workspaces/views/profiles.js
  var profiles_exports = {};
  __export(profiles_exports, {
    mount: () => mount4,
    render: () => render4
  });
  var profiles = [];
  async function render4() {
    profiles = await request("/api/profiles");
    return `<section class="panel"><div class="panel-header"><h2>Perfis</h2><button class="button primary" id="new-profile">Novo perfil</button></div></section>${table([{ label: "Nome", keys: ["name"] }, { label: "Descrição", keys: ["description"] }, { label: "Wi-Fi", render: (r) => esc(Object.keys(r.wifi || {}).join(", ") || "—") }, { label: "DNS", render: (r) => Object.keys(r.dns || {}).length ? "Configurado" : "—" }, { label: "Ações", render: (r) => `<div class="inline-actions"><button class="button" data-edit-profile="${esc(r.name)}">Editar</button><button class="button" data-preview-profile="${esc(r.name)}">Preview / aplicar</button><button class="button danger" data-delete-profile="${esc(r.name)}">Excluir</button></div>` }], profiles, "Nenhum perfil salvo.")}`;
  }
  function edit(profile = {}) {
    const d = dialog(profile.name ? "Editar perfil" : "Novo perfil", `<form id="profile-form" class="form-grid"><div class="field"><label>Nome</label><input name="name" value="${esc(profile.name || "")}" ${profile.name ? "readonly" : ""} required></div><div class="field"><label>Descrição</label><input name="description" value="${esc(profile.description || "")}"></div><div class="field"><label>DNS primário</label><input name="dns1" value="${esc(profile.dns?.ipv4_1 || "")}"></div><div class="field"><label>DNS secundário</label><input name="dns2" value="${esc(profile.dns?.ipv4_2 || "")}"></div><div class="dialog-footer"><button class="button primary" type="submit">Salvar</button></div></form>`);
    const f = d.querySelector("form");
    f.onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(f);
      const dns = { ...profile.dns };
      for (const [name, key] of [["dns1", "ipv4_1"], ["dns2", "ipv4_2"]]) {
        const v = String(fd.get(name) || "").trim();
        if (v) dns[key] = v;
        else delete dns[key];
      }
      try {
        await request("/api/profiles", { method: "POST", body: JSON.stringify({ ...profile, name: fd.get("name"), description: fd.get("description"), dns }) });
        d.close();
        toast("Perfil salvo.");
        document.dispatchEvent(new CustomEvent("refresh-view"));
      } catch (err) {
        toast(err.message);
      }
    };
  }
  function mount4() {
    document.querySelector("#new-profile").onclick = () => edit();
    document.querySelectorAll("[data-edit-profile]").forEach((b) => b.onclick = () => edit(profiles.find((p) => p.name === b.dataset.editProfile)));
    document.querySelectorAll("[data-delete-profile]").forEach((b) => b.onclick = () => {
      const d = dialog("Excluir perfil?", `<p>${esc(b.dataset.deleteProfile)}</p>`, `<button class="button danger" data-confirm>Excluir</button>`);
      d.querySelector("[data-confirm]").onclick = async () => {
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
        const d = dialog("Preview do perfil", `<p>${p.applicable} operação(ões) serão aplicadas; ${p.skipped} serão ignoradas por capability.</p>${table([{ label: "Operação", keys: ["label"] }, { label: "Suporte", keys: ["support"] }, { label: "Resultado", render: (o) => o.will_apply ? "Aplicar" : "Pular" }], p.operations)}`, `<button class="button primary" data-apply ${p.applicable ? "" : "disabled"}>Aplicar perfil</button>`);
        d.querySelector("[data-apply]").onclick = async () => {
          try {
            const r = await request("/api/profiles/apply", { method: "POST", body: JSON.stringify({ name: b.dataset.previewProfile }) });
            toast(`Perfil: ${r.applied} aplicado(s), ${r.skipped} pulado(s), ${r.failed} falha(s).`);
            d.close();
          } catch (err) {
            toast(err.message);
          }
        };
      } catch (err) {
        toast(err.message);
      }
    });
  }

  // apps/access_manager/static/js/workspaces/views/management.js
  var management_exports = {};
  __export(management_exports, {
    mount: () => mount5,
    render: () => render5
  });
  var definitions = [{ feature: "dmz", title: "DMZ", fields: [["enabled", "Habilitado", "bool"], ["internal_client", "IP do cliente"]] }, { feature: "upnp", title: "UPnP", fields: [["enabled", "Habilitado", "bool"]] }, { feature: "tr069", title: "TR-069", fields: [["url", "URL ACS"]] }, { feature: "firewall", title: "Firewall", fields: [["enabled", "Habilitado", "bool"], ["level", "Nível"]] }];
  var loaded = {};
  var featureCap = (f) => f === "firewall" && (cap("firewall_level").enabled?.read || cap("firewall_level").enabled?.write) ? cap("firewall_level") : cap(f);
  async function render5() {
    loaded = {};
    const results = await Promise.allSettled(definitions.map((d) => featureCap(d.feature).enabled?.read ? request("/api/device/" + d.feature) : Promise.resolve(null)));
    const history2 = await request("/api/device/history").catch(() => null);
    const reboot = cap("reboot");
    return `<section class="panel"><h2>Manutenção</h2><div class="capability-row"><strong>Reiniciar equipamento</strong>${capBadge(reboot.read)}${capBadge(reboot.write)}<button id="reboot-button" class="button danger" ${reboot.enabled?.write ? "" : "disabled"}>Reiniciar</button></div></section><div class="split">${definitions.map((d, i) => {
      const result = results[i];
      const value = result.status === "fulfilled" ? result.value : null;
      if (value) loaded[d.feature] = value;
      return `<section class="panel"><div class="panel-header"><h2>${d.title}</h2>${capBadge(featureCap(d.feature).write)}</div>${value ? kv(value) : `<p class="muted">${result.status === "rejected" ? esc(result.reason.message) : "Leitura não comprovada nesta sessão."}</p>`}<button class="button" data-config="${d.feature}" ${value && value.available !== false && featureCap(d.feature).enabled?.write ? "" : "disabled"}>Editar</button></section>`;
    }).join("")}</div><section class="panel"><h2>Histórico de operações</h2>${history2 ? table([{ label: "Data", keys: ["created_at"] }, { label: "Operação", keys: ["operation"] }, { label: "Alvo", keys: ["target"] }, { label: "Resultado", keys: ["outcome"] }], history2.changes || []) : '<p class="muted">Histórico não disponível.</p>'}</section>`;
  }
  function mount5() {
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
    render: () => render7
  });
  var history = /* @__PURE__ */ new Map();
  var session = null;
  var timer = null;
  var bytes = (v) => {
    const n = Number(v);
    if (v == null || !Number.isFinite(n)) return "Não disponível";
    const units = ["B", "KiB", "MiB", "GiB", "TiB"];
    let x = n, i = 0;
    while (x >= 1024 && i < 4) {
      x /= 1024;
      i++;
    }
    return `${x.toFixed(i ? 2 : 0)} ${units[i]}`;
  };
  var rate = (v) => v == null ? "Aguardando amostra" : `${Number(v).toFixed(2)} Mbps`;
  function chart(samples) {
    if (samples.length < 2) return '<p class="muted">O gráfico aparecerá após duas amostras com taxa disponível.</p>';
    const max = Math.max(1, ...samples.flatMap((s) => [s.rx_mbps || 0, s.tx_mbps || 0]));
    const points = (k) => samples.flatMap((s, i) => s[k] == null ? [] : [`${i * 600 / (samples.length - 1)},${130 - s[k] * 120 / max}`]).join(" ");
    return `<svg class="sparkline" viewBox="0 0 600 140" role="img" aria-label="Taxas observadas de download e upload"><polyline points="${points("rx_mbps")}"></polyline><polyline class="upload" points="${points("tx_mbps")}"></polyline></svg><p class="muted">RX em azul · TX em violeta · escala máxima ${max.toFixed(2)} Mbps · amostras desta sessão</p>`;
  }
  async function render7() {
    const current = window.__amStore?.session?.session?.session_id;
    if (current !== session) {
      session = current;
      history.clear();
    }
    const d = await request("/api/device/traffic");
    const sources = d?.sources || [];
    for (const s of sources) {
      const key = s.source + ":" + s.identity;
      const h = history.get(key) || [];
      if (s.rx_mbps != null || s.tx_mbps != null) h.push(s);
      history.set(key, h.slice(-60));
    }
    return `<section class="panel"><div class="panel-header"><h2>Tráfego</h2><button class="button" id="traffic-refresh">Atualizar amostra</button></div><p class="muted">Taxas calculadas por diferença de contadores. WAN, LAN e clientes são apresentados separadamente.</p>${!sources.length ? '<div class="notice warning">Nenhum contador ativo observado nesta sessão.</div>' : ""}</section>${sources.map((s) => `<section class="panel"><h3>${esc({ wan: "WAN", lan: "LAN", wifi_client: "Cliente Wi-Fi" }[s.source] || s.source)} · ${esc(s.identity)}</h3><div class="grid">${metric(s.source === "wan" ? "Download" : "Taxa RX", rate(s.rx_mbps))}${metric(s.source === "wan" ? "Upload" : "Taxa TX", rate(s.tx_mbps))}${metric("Recebido", bytes(s.counters?.rx_bytes))}${metric("Enviado", bytes(s.counters?.tx_bytes))}</div>${s.counter_reset ? '<p class="muted">Contador reiniciado; aguardando nova amostra.</p>' : ""}${chart(history.get(s.source + ":" + s.identity) || [])}${table([{ label: "RX pacotes", keys: ["rx_packets"] }, { label: "TX pacotes", keys: ["tx_packets"] }, { label: "Erros RX", keys: ["rx_errors"] }, { label: "Erros TX", keys: ["tx_errors"] }, { label: "Descartes RX", keys: ["rx_discard"] }, { label: "Descartes TX", keys: ["tx_discard"] }], [s.counters || {}])}</section>`).join("")}`;
  }
  function mount6() {
    document.querySelector("#traffic-refresh")?.addEventListener("click", () => document.dispatchEvent(new CustomEvent("refresh-view")));
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (window.__amStore?.view === "traffic") document.dispatchEvent(new CustomEvent("refresh-view"));
    }, 5e3);
  }

  // apps/access_manager/static/js/shared/diagnostics.js
  function diagnosticResult(d) {
    const technical = `<details><summary>Ver resposta técnica</summary><pre>${esc(JSON.stringify(d.advanced || d, null, 2))}</pre></details>`;
    const head = `<h3>${esc(d.target || "Destino não disponível")}</h3><p>${esc(d.status)} · ${esc(d.interface || "Interface não disponível")} · ${esc(d.protocol || "Protocolo não disponível")}</p>`;
    if (d.kind === "traceroute") return head + table([{ label: "Hop", keys: ["number"] }, { label: "IP / host", render: (r) => esc(r.host || "*") }, ...[0, 1, 2].map((i) => ({ label: `Latência ${i + 1}`, render: (r) => r.latencies_ms?.[i] != null ? `${esc(r.latencies_ms[i])} ms` : "*" })), { label: "Status", render: (r) => r.timeout ? "Timeout" : "Resposta recebida" }], d.hops || [], "Nenhum salto foi fornecido pelo equipamento.") + technical;
    return head + `<div class="grid">${[["Enviados", "sent"], ["Recebidos", "received"], ["Perda (%)", "loss_percent"], ["Mínimo (ms)", "min_ms"], ["Médio (ms)", "avg_ms"], ["Máximo (ms)", "max_ms"]].map(([label, key]) => metric(label, d[key] ?? "Não disponível")).join("")}</div>` + technical;
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
    const wire = (selector, path) => {
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
    wire("#ping-form", "/api/device/diagnostics/ping");
    wire("#trace-form", "/api/device/diagnostics/traceroute");
  }
  async function deployment() {
    return `<section class="panel"><div class="panel-header"><h2>Implantação</h2></div><div class="notice warning">Workspace destinado a modelo/firmware desconhecido ou capability candidata. Ele não é uma autorização de escrita para operações já suportadas.</div></section>`;
  }

  // apps/access_manager/static/js/workspaces/app.js
  var mountedRoot = null;
  var workspace = null;
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
  async function render8(name = store.view) {
    store.view = name;
    document.querySelectorAll(".nav").forEach((b) => b.classList.toggle("active", b.dataset.view === name));
    const [kicker, title] = meta[name] || meta.overview;
    const kickerEl = document.querySelector("#page-kicker");
    const titleEl = document.querySelector("#page-title");
    if (kickerEl) kickerEl.textContent = kicker;
    if (titleEl) titleEl.textContent = title;
    if (!store.session?.connected && name !== "profiles") {
      workspace.innerHTML = '<div class="empty-state"><strong>Nenhum equipamento conectado</strong><span>Conecte-se para carregar este workspace.</span></div>';
      return;
    }
    workspace.innerHTML = '<div class="panel muted">Carregando…</div>';
    try {
      const view = views[name] || views.overview;
      workspace.innerHTML = await view.render();
      view.mount?.();
    } catch (e) {
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
      await render8(s.session?.mode === "deployment" ? "deployment" : "overview");
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
    try {
      const s = await request("/api/session");
      store.setSession(s);
      store.setCapabilities(s.session?.capabilities || {});
      syncContext();
      await render8(s.connected ? s.session?.mode === "deployment" ? "deployment" : "overview" : store.view);
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
