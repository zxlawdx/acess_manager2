(() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // apps/access_manager/static/js/service/human-formatter.js
  var present = (v) => v !== void 0 && v !== null && v !== "" && v !== "—" && (!Array.isArray(v) || v.length > 0);
  var scalar = (v) => present(v) && ["string", "number", "boolean"].includes(typeof v) ? String(v) : "";
  var pick = (o, ...keys) => {
    for (const k of keys) if (present(o?.[k])) return o[k];
  };
  var number = (o, ...keys) => {
    for (const k of keys) {
      const v = o?.[k];
      if (present(v) && !(typeof v === "string" && !v.trim()) && typeof v !== "boolean" && Number.isFinite(Number(v))) return Number(v);
    }
    return void 0;
  };
  var list = (v) => Array.isArray(v) ? v : Array.isArray(v?.registros) ? v.registros : Array.isArray(v?.data) ? v.data : Array.isArray(v?.rows) ? v.rows : [];
  var object = (v) => v && typeof v === "object" && !Array.isArray(v) ? v : {};
  var line = (label, v, unit = "") => scalar(v) ? `${label}: ${scalar(v)}${unit}.` : "";
  var join = (lines) => lines.filter(Boolean).join("\n");
  var clock = (time) => {
    const d = new Date(time);
    return Number.isNaN(d.getTime()) ? "" : d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };
  var numeric = (v, digits = 2) => v === void 0 ? "" : Number(v.toFixed(digits)).toString();
  var temperature = (r) => {
    const value2 = number(r, "temperature_c", "temperature");
    if (value2 !== void 0) return value2;
    const match = scalar(r.temperature).match(/^\s*(-?\d+(?:\.\d+)?)\s*(?:degrees\s*)?(?:°\s*)?C(?:\b|$)/i);
    return match ? Number(match[1]) : void 0;
  };
  var up = (v) => /^(up|active|ativo|online|connected|conectado|associated)$/i.test(String(v));
  var down = (v) => /^(down|inactive|inativo|offline|disconnected|desconectado)$/i.test(String(v));
  function opticalFacts(data) {
    const rx = number(data, "rx_power_dbm", "rx_dbm", "rxPower", "rx", "rx_power"), tx = number(data, "tx_power_dbm", "tx_dbm", "txPower", "tx", "tx_power");
    return join([rx !== void 0 ? `Sinal óptico RX: ${rx.toFixed(2)} dBm.` : "", tx !== void 0 ? `Sinal óptico TX: ${tx.toFixed(2)} dBm.` : ""]);
  }
  function identification(data) {
    const d = object(data);
    return join([line("Equipamento identificado", [scalar(d.manufacturer || d.vendor)?.toUpperCase(), scalar(d.model)].filter(Boolean).join(" ")), line("Nome do equipamento", d.hostname), line("Firmware", pick(d, "firmware", "software_version", "junos_version", "version"))]);
  }
  function wanFacts(data) {
    return list(Array.isArray(data) || data?.registros ? data : [data]).map((r) => {
      const status3 = pick(r, "status", "state"), rawType = scalar(pick(r, "connection_type", "type")), type = /^pppoe$/i.test(rawType) ? "PPPoE" : rawType.toUpperCase();
      return join([`WAN${scalar(r.name) ? " " + r.name : ""}${up(status3) ? " conectada" : down(status3) ? " desconectada" : scalar(status3) ? ": " + status3 : " consultada"}${type ? " via " + type : ""}.`, line("IP WAN", pick(r, "ipv4", "ip", "ipv4_address")), line("Gateway", r.gateway), line("VLAN", r.vlan), line("DNS", Array.isArray(r.dns) ? r.dns.map(scalar).filter(Boolean).join(" / ") : r.dns)]);
    }).join("\n\n");
  }
  function resources(data) {
    return list(Array.isArray(data) || data?.registros ? data : [data]).slice(0, 8).map((r) => join([
      `Recursos do equipamento${present(r.slot) ? " — slot " + scalar(r.slot) : ""}:`,
      line("CPU livre", pick(r, "cpu_idle_percent", "cpu_idle"), "%"),
      line("CPU em uso", r.cpu_percent, "%"),
      line("Memória em uso", pick(r, "memory_used_percent", "memory_percent"), "%"),
      line("Temperatura", numeric(temperature(r)), " °C"),
      line("Load average", [r.load_average_1, r.load_average_5, r.load_average_15].map(scalar).filter(Boolean).join(" / "))
    ])).filter((text2) => text2.split("\n").length > 1).join("\n\n");
  }
  function interfaces(data) {
    const rows3 = list(data);
    if (!rows3.length) return "Nenhuma interface retornada na consulta.";
    const total = number(data, "quantidade") ?? rows3.length;
    const active2 = rows3.filter((r) => up(pick(r, "oper_state", "oper_status", "link_state", "status"))).length, inactive = rows3.filter((r) => down(pick(r, "oper_state", "oper_status", "link_state", "status"))).length;
    return join([`Interfaces consultadas: ${total}.`, `${total > rows3.length ? "Estados na amostra de " + rows3.length + " interfaces — " : ""}Ativas: ${active2}; inativas: ${inactive}${rows3.length - active2 - inactive ? `; sem estado informado: ${rows3.length - active2 - inactive}` : ""}.`, ...rows3.filter((r) => up(pick(r, "oper_state", "oper_status", "link_state", "status")) && /^(et-|xe-|ae\d)/.test(String(r.name))).slice(0, 3).map((r) => `${scalar(r.name)}: ativa${scalar(r.speed) ? " / " + r.speed : ""}.`)]);
  }
  function subscriber(row) {
    return join([line("Assinante encontrado", row.username), line("Contrato", row.contract), line("IP do assinante", pick(row, "ipv4_address", "ip", "ipv4")), line("MAC", pick(row, "mac_address", "mac")), line("VLAN", pick(row, "vlan", "vlan_id")), line("Interface", row.interface), line("Estado do assinante", up(row.state) ? "ativo" : down(row.state) ? "inativo" : row.state)]);
  }
  function lookup(data, input) {
    const rows3 = Array.isArray(data.sessions) ? data.sessions : ["username", "ipv4_address", "mac_address", "interface"].some((k) => present(data[k])) ? [data] : [];
    const rawQuery = pick(input, "query", "contract", "username") || data.query;
    const query2 = scalar(typeof rawQuery === "object" ? rawQuery?.value : rawQuery);
    return join([query2 ? `Consultado o contrato ou identificador ${query2}.` : "Consulta de assinante realizada.", rows3.length ? rows3.slice(0, 3).map(subscriber).join("\n\n") : data.complete === true || data.status === "NOT_FOUND" ? "Nenhum assinante localizado na consulta." : "Consulta sem resultado confirmado."]);
  }
  function ping(data, target) {
    const host = scalar(pick(data, "target", "host", "destination")) || scalar(target), sent = number(data, "sent", "packets_sent", "transmitted"), received = number(data, "received", "packets_received"), loss = number(data, "loss_percent", "packet_loss_percent", "packet_loss_reported"), avg = number(data, "avg_ms", "average_ms", "latency_ms");
    return join([`Ping${host ? " para " + host : ""}${received === 0 ? " sem resposta." : " realizado."}`, sent !== void 0 && received !== void 0 ? `${sent} pacotes enviados, ${received} recebidos.` : "", line("Perda", numeric(loss), "%"), line("Latência média", numeric(avg), " ms")]);
  }
  function trace(data, target) {
    const hops = Array.isArray(data.hops) ? data.hops : [], host = scalar(data.target || target), last = hops.at(-1);
    const reached = data.reached === true || data.destination_reached === true || Boolean(host && last && (last.address === host || last.ip === host));
    const times = Array.isArray(last?.times_ms) ? last.times_ms.filter((v) => typeof v === "number" && Number.isFinite(v)) : [];
    const avg = times.length ? times.reduce((a, b) => a + b, 0) / times.length : number(last, "latency_ms", "avg_ms");
    return join([`Traceroute${host ? " para " + host : ""} realizado.`, reached ? `Destino alcançado em ${hops.length} saltos.` : hops.length ? `${hops.length} saltos retornados; alcance do destino não confirmado.` : "Sem confirmação de alcance do destino.", reached ? line("Latência final aproximada", numeric(avg), " ms") : ""]);
  }
  var fields = { ssid: "Nome da rede", channel: "Canal", auto_channel: "Canal automático", bandwidth: "Largura de canal", enabled: "Estado", broadcast: "Visibilidade do SSID", isolation: "Isolamento", ipv4_1: "DNS primário", ipv4_2: "DNS secundário", dns1: "DNS primário", dns2: "DNS secundário", lan_ip: "IP da LAN", pool_start: "Início do pool DHCP", pool_end: "Fim do pool DHCP", lease_seconds: "Tempo de concessão", internal_client: "Cliente interno", external_port: "Porta externa", internal_port: "Porta interna", protocol: "Protocolo", tx_power: "Potência", standard: "Padrão Wi-Fi", country: "País" };
  function changes(e, secrets) {
    const before = object(e.before), after = object(e.after?.config || e.after), target = scalar(e.target);
    const failed = e.ok === false || /falha|erro/i.test(e.result || "");
    const status3 = failed ? "Falha reportada pelo equipamento" : /confirmado por leitura/i.test(e.result || "") ? "Confirmado por leitura" : /cancelad|não confirmado/i.test(e.result || "") ? "Resultado remoto não confirmado" : "Comando enviado; aplicação não confirmada por leitura";
    const title = e.secrets ? `${failed ? "Não foi confirmada a alteração da senha Wi-Fi" : /confirmado por leitura/i.test(e.result || "") ? "Senha Wi-Fi alterada" : "Solicitada alteração da senha Wi-Fi"}${target ? " na rede " + target : ""}.` : `${e.category === "Wi-Fi" ? "Configuração Wi-Fi" : "Alteração de configuração"}${target && target !== "Equipamento" ? " em " + target : ""}.`;
    return join([title, ...Object.entries(fields).filter(([k]) => present(after[k])).map(([k, label]) => {
      const value2 = (v) => typeof v === "boolean" ? v ? "habilitado" : "desabilitado" : scalar(v);
      return present(before[k]) ? `${label} alterado de ${value2(before[k])} para ${value2(after[k])}.` : `${label} solicitado: ${value2(after[k])}.`;
    }), e.secrets ? `Senha anterior: ${secrets ? scalar(e.secrets.old) : "********"}` : "", e.secrets ? `Senha nova: ${secrets ? scalar(e.secrets.new) : "********"}` : "", status3 + "."]);
  }
  function clientDiagnostic(e) {
    const d = object(e.data), c = object(d.cliente || d.client || d);
    const tests2 = Array.isArray(d.testes) ? d.testes : [], p = tests2.find((t) => /^Ping a partir/.test(t.teste || ""))?.resultado;
    return join([`${e.result === "Dados observados" ? "Registradas informações" : "Diagnóstico específico realizado"} no dispositivo ${scalar(e.target) || scalar(c.Hostname) || "selecionado"}.`, ...["Hostname", "IPv4", "IPv6", "IP", "MAC", "Banda", "SSID", "Interface", "Padrão Wi-Fi", "Ruído", "MCS", "Largura do canal", "Taxa RX", "Taxa TX", "Canal do rádio", "Tempo conectado"].map((k) => line(k, c[k])), line("RSSI", c.RSSI, " dBm"), line("SNR", c.SNR, " dB"), String(c["Padrão Wi-Fi"] || "").startsWith("Wi-Fi 5") ? "Cliente negociou Wi-Fi 5 (802.11ac); isso pode limitar throughput em relação ao Wi-Fi 6, mas não comprova falha." : "", p ? ping(p, c.IP || c.IPv4) : "", number(c, "RSSI") !== void 0 ? Number(c.RSSI) < -70 ? "Sinal fraco no momento da leitura; distância ou interferência podem estar contribuindo." : "Sinal adequado no momento da leitura; isso não comprova acesso à internet." : "", tests2.some((t) => t.teste === "Tabela de clientes" && t.resultado === "Presente") ? "Dispositivo presente na tabela de clientes." : "", tests2.some((t) => t.teste === "Tabela de clientes" && t.resultado === "Ausente") ? "Dispositivo ausente na tabela consultada." : "", p && number(p, "received") === 0 ? "A ausência de resposta pode decorrer de firewall, isolamento ou standby." : "", ...tests2.filter((t) => t.teste === "Ping" && typeof t.resultado === "string").map((t) => `Ping não concluído: ${t.resultado}`)]);
  }
  var pathFor = (e) => e.path || { "Identificação do equipamento": "/api/device", "Leitura WAN": "/api/device/wan", "Sinal óptico": "/api/device/optical", "Clientes observados": "/api/device/clients", "Consulta de assinante": "/api/infrastructure/subscribers/lookup", "Ping": "/api/device/diagnostics/ping", "Traceroute": "/api/device/diagnostics/traceroute", "Acesso CPE": "/api/infrastructure/subscribers/connect-cpe", system: "/api/infrastructure/system", resources: "/api/infrastructure/resources", interfaces: "/api/infrastructure/interfaces" }[e.action] || "";
  function humanEvent(e, { secrets = false } = {}) {
    const path2 = pathFor(e), d = object(e.data), input = object(e.input || e.after), failed = e.ok === false || d.health?.last_read_failed === true || /^(Falha|Erro)/i.test(e.result || "");
    if (e.category === "Conexão") {
      const s = object(e.connection), target2 = [scalar(s.vendor).toUpperCase(), scalar(s.model), scalar(s.host)].filter(Boolean).join(" · ") || scalar(e.target);
      return { kind: "connection", key: "connection", text: `${e.action === "Sessão iniciada" ? "Conectado ao equipamento" : "Contexto selecionado"}${target2 ? " " + target2 : ""}.` };
    }
    if (e.category === "Cliente") return { kind: "test", text: clientDiagnostic(e) };
    if (e.secrets || e.before) return { kind: "change", text: changes(e, secrets) };
    const target = scalar(input.host || input.target || e.target);
    if (failed) return { kind: "test", text: `Não foi possível concluir ${/ping/.test(path2) ? "o ping" : /traceroute/.test(path2) ? "o traceroute" : /subscribers/.test(path2) ? "a consulta do assinante" : "a operação solicitada"}${target && target !== "Equipamento" ? " para " + target : ""}. Resultado não confirmado.` };
    if (/connect-cpe$/.test(path2)) return { kind: "connection", key: "cpe", text: join(["Realizado acesso ao CPE do assinante" + (scalar(input.contract) ? " " + input.contract : "") + ".", line("IP do CPE", input.host || d.session?.host), line("Porta", input.port)]) };
    if (/cpe-draft$/.test(path2)) return { kind: "read", key: "cpe-preparation", text: join(["Preparado acesso ao CPE; autenticação ainda não confirmada.", line("IP do CPE", d.host), line("Porta", d.port)]) };
    if (/cpe-port$/.test(path2)) return { kind: "test", text: d.status === "CPE_PORT_REACHABLE" ? "Porta do CPE acessível a partir deste computador; autenticação ainda não testada." : "Teste da porta do CPE sem confirmação de acesso." };
    if (/subscribers\/(lookup|detail|context)$/.test(path2)) {
      const result = d.data || d, rows3 = Array.isArray(result.sessions) ? result.sessions : [result], fingerprint = rows3.map(subscriber).filter(Boolean).join("\n");
      return { kind: "read", key: "subscriber", fingerprint: fingerprint || void 0, text: lookup(result, input) };
    }
    ;
    if (/\/device$|\/system$/.test(path2)) return { kind: "read", key: "identification", text: identification(d) };
    if (/\/wan$/.test(path2)) return { kind: "read", key: "wan", text: wanFacts(e.data) };
    if (/\/optical$/.test(path2)) return { kind: "read", key: "optical", text: opticalFacts(d) };
    if (/\/resources$/.test(path2)) return { kind: "read", key: "resources", text: resources(e.data) };
    if (/\/interfaces$/.test(path2)) return { kind: "read", key: "interfaces", text: interfaces(e.data) };
    if (/\/clients$/.test(path2)) {
      const count = Array.isArray(e.data) ? e.data.length : number(d, "quantidade");
      return { kind: "read", key: "clients", text: count === 0 ? "Nenhum cliente conectado foi identificado no momento da consulta." : count !== void 0 ? `${count} cliente(s) identificado(s) na tabela no momento da consulta.` : "" };
    }
    if (/\/ping$/.test(path2)) return { kind: "test", text: ping(d, target) };
    if (/\/traceroute$/.test(path2)) return { kind: "test", text: trace(d, target) };
    if (/\/wifi-neighbors$/.test(path2)) return { kind: "test", text: "Realizada consulta de redes Wi-Fi vizinhas." };
    if (/\/full\/run$/.test(path2)) return { kind: "test", text: join(["Diagnóstico completo executado.", line("Latência", d.latency_ms, " ms"), line("Perda", d.packet_loss_percent, "%")]) };
    if (/\/reboot$/.test(path2)) return { kind: "change", text: "Enviado comando de reinicialização do equipamento; verificar o retorno da conexão." };
    if (/\/profiles\/(capture|apply)$/.test(path2)) return { kind: /capture$/.test(path2) ? "read" : "change", text: /capture$/.test(path2) ? "Capturada a configuração atual como rascunho de perfil." : `Solicitada aplicação do perfil${scalar(input.name) ? " " + input.name : ""}; consultar o resultado das alterações.` };
    if (/\/wifi\/(radio|ssid)$|\/dns|\/dhcp|\/port-forward|\/dmz|\/nat/.test(path2)) return { kind: e.read ? "read" : "change", text: e.read ? "Consultada configuração de " + (/dns/.test(path2) ? "DNS" : /dhcp/.test(path2) ? "DHCP" : "rede") + "." : changes({ ...e, after: input }, secrets) };
    return { kind: e.read ? "read" : "test", text: e.read ? "Consulta técnica concluída no equipamento." : "Operação registrada no equipamento; consulte os detalhes técnicos para verificar o resultado." };
  }
  function formatHumanService(service2, { mode = "summary", secrets = false, markdown = false } = {}) {
    const header = service2.started ? `Atendimento iniciado às ${clock(service2.started)}.` : "Nenhum atendimento iniciado.";
    const facts2 = [], timeline = [], last = /* @__PURE__ */ new Map();
    let connectedCpeHost = "";
    for (const e of service2.entries) {
      if (e.category === "Conexão" && e.action !== "Sessão iniciada" && connectedCpeHost && e.connection?.host === connectedCpeHost) {
        connectedCpeHost = "";
        continue;
      }
      const fact = humanEvent(e, { secrets });
      if (fact.key === "cpe") connectedCpeHost = scalar(e.input?.host || e.after?.host || e.data?.session?.host);
      if (!fact.text) continue;
      const key = `${e.session || ""}:${fact.key || fact.kind}`;
      if (["read", "connection"].includes(fact.kind) && last.get(key) === (fact.fingerprint || fact.text)) continue;
      last.set(key, fact.fingerprint || fact.text);
      facts2.push(fact);
      timeline.push(`${clock(e.time)} — ${fact.text}`);
    }
    const notes = scalar(service2.notes);
    let body;
    if (mode === "timeline") body = timeline.join("\n\n");
    else if (mode === "prose") body = facts2.map((f) => f.text.replaceAll("\n", " ")).join(" ");
    else {
      const sections = [];
      let previous = "";
      const titles2 = { read: "Verificações realizadas:", change: "Alterações realizadas:", test: "Diagnósticos e consultas:" };
      for (const fact of facts2) {
        if (fact.kind !== previous && titles2[fact.kind]) sections.push(titles2[fact.kind]);
        sections.push(fact.text);
        previous = fact.kind;
      }
      body = sections.join("\n\n");
    }
    return [markdown ? "# Atendimento\n\n" + header : header, body, notes ? "Observações do técnico:\n" + notes : "", service2.started ? "Atendimento permanece em andamento." : ""].filter(Boolean).join("\n\n");
  }

  // apps/access_manager/static/js/service/model.js
  var service = { id: null, activeSession: null, session: null, started: null, entries: [], notes: "" };
  var listeners = /* @__PURE__ */ new Set();
  var seen = /* @__PURE__ */ new Map();
  var subscribeService = (fn) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  };
  var notify = () => listeners.forEach((fn) => fn());
  function clearService({ keepSession = false } = {}) {
    const current = keepSession && service.id ? { id: service.id, activeSession: service.activeSession, session: service.session } : null;
    service.id = current?.id || null;
    service.activeSession = current?.activeSession || null;
    service.session = current?.session || null;
    service.started = current ? (/* @__PURE__ */ new Date()).toISOString() : null;
    service.entries = [];
    service.notes = "";
    seen.clear();
    notify();
  }
  function detachService() {
    if (!service.id) return;
    service.activeSession = null;
    seen.clear();
    notify();
  }
  function startService(session2, { preserveOnDisconnect = false } = {}) {
    const s = session2?.session;
    if (!session2?.connected) {
      if (preserveOnDisconnect && service.id) detachService();
      else clearService();
      return;
    }
    const connection2 = { vendor: s?.vendor, model: s?.model, host: s?.host, port: s?.metadata?.port, scheme: s?.metadata?.scheme };
    const id = s?.session_id || `${s?.vendor}:${s?.host}`;
    if (service.activeSession === id) return;
    if (service.id) {
      service.activeSession = id;
      addEntry({ connection: connection2, category: "Conexão", action: "Contexto selecionado / acesso CPE", target: [s?.vendor, s?.model, s?.host].filter(Boolean).join(" · "), result: "Sessão ativa" });
      return;
    }
    service.id = id;
    service.activeSession = id;
    service.session = { vendor: s?.vendor, model: s?.model, host: s?.host, technician: s?.username || s?.user || "Não informado", id };
    service.started = (/* @__PURE__ */ new Date()).toISOString();
    service.entries = [];
    service.notes = "";
    addEntry({ connection: connection2, category: "Conexão", action: "Sessão iniciada", target: [s?.vendor, s?.model, s?.host].filter(Boolean).join(" · "), result: "Conectado" });
  }
  function addEntry(entry) {
    if (!service.id) return;
    service.entries.push({ time: (/* @__PURE__ */ new Date()).toISOString(), session: service.activeSession, route: typeof window !== "undefined" ? window.__amStore?.view || "conexão" : "conexão", ...entry });
    notify();
  }
  function setServiceNotes(value2) {
    service.notes = String(value2);
    notify();
  }
  function formatService({ mode = "summary", secrets = false, markdown = false } = {}) {
    if (mode === "technical") return JSON.stringify({ ...service, entries: service.entries.map((e) => ({ ...e, ...e.secrets ? { secrets: { old: secrets ? e.secrets.old : "********", new: secrets ? e.secrets.new : "********" } } : {} })) }, null, 2);
    return formatHumanService(service, { mode, secrets, markdown });
  }
  var sensitive = /(password|passwd|senha|secret|token|authorization|cookie|passphrase|psk|credential|security.?key)/i;
  var redact = (value2) => {
    if (Array.isArray(value2)) return value2.slice(0, 40).map(redact);
    if (value2 && typeof value2 === "object") {
      if ([value2.field, value2.label, value2.key, value2.name].some((v) => typeof v === "string" && sensitive.test(v))) return { campo: "Dado sensível omitido" };
      return Object.fromEntries(Object.entries(value2).filter(([k]) => !sensitive.test(k) && !/(raw|config_text|backup|command|script)/i.test(k)).slice(0, 40).map(([k, v]) => [k, redact(v)]));
    }
    return typeof value2 === "string" ? value2.slice(0, 500).replace(/(password|passwd|senha|secret|psk)\s*[=:]\s*\S+/ig, "$1: [omitido]") : value2;
  };
  function observeOperation(path2, method, body, data, ok, route) {
    if (!service.id || /reveal-password|settings|host-key|operations|history|poll|export|download|preview|traffic/.test(path2)) return;
    const url = path2.split("?")[0];
    if (!/^\/api\/(device|infrastructure|profiles)/.test(url)) return;
    const read2 = method === "GET" || /^\/api\/infrastructure\//.test(url) && !/(connect-cpe|cpe-port|diagnostics\/|ping$|traceroute$)/.test(url);
    if (method === "GET" && !/\/device$|clients|wan|optical|subscribers|subscriber\/|interfaces/.test(url)) return;
    if (url === "/api/device/wifi/ssid") return;
    let input = {};
    try {
      input = typeof body === "string" ? JSON.parse(body || "{}") : body || {};
    } catch {
    }
    const safe = redact(data), signature = JSON.stringify([safe, redact(input), ok]);
    const last = seen.get(url);
    if (read2 && last?.id === service.activeSession && last.signature === signature && Date.now() - last.time < 3e4) return;
    seen.set(url, { id: service.activeSession, signature, time: Date.now() });
    const category = read2 ? "Leitura" : /diagnostic|ping|traceroute|test/.test(url) ? "Diagnóstico" : /profiles/.test(url) ? "Perfis" : /infrastructure/.test(url) ? "Juniper" : /wifi/.test(url) ? "Wi-Fi" : "Alteração";
    const labels2 = { device: "Identificação do equipamento", clients: "Clientes observados", wan: "Leitura WAN", optical: "Sinal óptico", ping: "Ping", traceroute: "Traceroute", "wifi-neighbors": "Scan de Wi-Fi vizinho", reboot: "Reinício", capture: "Captura de perfil", apply: "Aplicação de perfil", "connect-cpe": "Acesso CPE", lookup: "Consulta de assinante", run: "Diagnóstico completo" };
    const action = labels2[url.split("/").at(-1)] || url.split("/").filter(Boolean).slice(2).join(" / ");
    let observations = "";
    if (read2 && ok) {
      if (/clients$/.test(url) && Array.isArray(data)) observations = `Clientes observados: ${data.length}.`;
      if (/optical$/.test(url)) observations = opticalFacts(data);
      if (/wan$/.test(url)) {
        const rows3 = Array.isArray(data) ? data : [data];
        observations = rows3.map((r) => `WAN ${r.name || ""}: ${r.status || "estado indisponível"}; IP ${r.ipv4 || r.ip || "não disponível"}.`).join(" ");
      }
    }
    addEntry({ ...route ? { route } : {}, path: url, method, read: read2, ok, input: redact(input), category, action, target: input.host || input.ip || input.ssid_id || input.band || "Equipamento", observations, result: ok ? read2 ? "Leitura concluída" : data?.verified === true ? "Confirmado por leitura" : "Resposta recebida; verificar resultado abaixo" : "Falha", data: Array.isArray(safe) ? { quantidade: data.length, registros: safe } : safe, ...!read2 ? { after: redact(input) } : {} });
  }

  // apps/access_manager/static/js/shared/clipboard.js
  var ClipboardError = class extends Error {
    constructor(message) {
      super(message);
      this.name = "ClipboardError";
    }
  };
  async function copyText(value2) {
    const text2 = String(value2 ?? "");
    if (!text2) throw new ClipboardError("Nada para copiar.");
    let response;
    try {
      response = await fetch(new URL("/api/system/clipboard", window.location.origin), {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text2 })
      });
    } catch (error) {
      throw new ClipboardError("Não foi possível acessar o clipboard do desktop.");
    }
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data?.success === false) {
      throw new ClipboardError(data?.error?.message || "Não foi possível copiar para a área de transferência.");
    }
    return true;
  }

  // apps/access_manager/static/js/service/panel.js
  var exitPolicyKey = "accessManager.serviceLog.exitPolicy";
  var readExitPolicy = () => {
    try {
      const value2 = localStorage.getItem(exitPolicyKey);
      return ["ask", "keep", "clear"].includes(value2) ? value2 : "ask";
    } catch {
      return "ask";
    }
  };
  var writeExitPolicy = (value2) => {
    try {
      localStorage.setItem(exitPolicyKey, value2);
    } catch {
    }
  };
  function selectRecordForManualCopy(panel3) {
    const record = panel3.querySelector("[data-record]");
    if (!record) return;
    try {
      record.focus({ preventScroll: true });
    } catch {
      record.focus?.();
    }
    const selection = window.getSelection?.();
    if (!selection || !document.createRange) return;
    const range = document.createRange();
    range.selectNodeContents(record);
    selection.removeAllRanges();
    selection.addRange(range);
  }
  function mountServicePanel(store2) {
    const button2 = document.querySelector("#service-current");
    if (!button2) return;
    const panel3 = document.createElement("dialog");
    panel3.id = "service-dialog";
    panel3.className = "service-dialog";
    panel3.setAttribute("aria-label", "Atendimento atual");
    panel3.innerHTML = '<div class="dialog-inner"><div class="dialog-header"><h2>Atendimento atual</h2><button class="button" data-dismiss>Fechar</button></div><p>Registro em memória do atendimento atual. Você pode manter o registro ao sair do roteador ou limpar automaticamente.</p><label class="field">Ao sair do roteador<select data-exit-policy><option value="ask">Perguntar se deseja limpar</option><option value="keep">Manter atendimento</option><option value="clear">Limpar automaticamente</option></select></label><label><input type="checkbox" data-secrets> Incluir senhas na visualização, cópia e exportação</label><label class="field">Observações do técnico<textarea data-notes rows="3"></textarea></label><div class="inline-actions"><button class="button primary" data-copy="selected">Copiar atendimento</button><button class="button" data-copy="technical">Copiar detalhes técnicos</button><button class="button" data-copy="markdown">Copiar markdown</button><button class="button" data-export>Exportar TXT</button><button class="button" data-clear-service>Limpar atendimento</button><button class="button" data-clear-notes>Limpar observações</button></div><label>Formato da cópia <select data-mode><option value="summary">Resumo operacional</option><option value="timeline">Linha do tempo</option><option value="prose">Texto corrido</option><option value="technical">Detalhes técnicos / JSON</option></select></label><p role="status" data-status></p><pre data-record tabindex="0"></pre></div>';
    document.body.append(panel3);
    let secrets = false, wasConnected = Boolean(store2.session?.connected);
    const status3 = (message) => {
      panel3.querySelector("[data-status]").textContent = message;
    };
    const paint = () => {
      panel3.querySelector("[data-export]").textContent = panel3.querySelector("[data-mode]").value === "technical" ? "Exportar JSON técnico" : "Exportar TXT";
      button2.textContent = `Atendimento atual (${service.entries.length})`;
      if (panel3.open) panel3.querySelector("[data-record]").textContent = formatService({ secrets, mode: panel3.querySelector("[data-mode]").value });
    };
    subscribeService(paint);
    panel3.querySelector("[data-mode]").onchange = paint;
    const show = () => {
      secrets = false;
      panel3.querySelector("[data-mode]").value = "summary";
      panel3.querySelector("[data-secrets]").checked = false;
      panel3.querySelector("[data-notes]").value = service.notes;
      panel3.querySelector("[data-exit-policy]").value = readExitPolicy();
      panel3.classList.toggle("aero-theme", document.documentElement.dataset.experienceTheme === "aero");
      panel3.showModal();
      paint();
    };
    button2.onclick = show;
    document.addEventListener("open-service", show);
    panel3.querySelector("[data-dismiss]").onclick = () => panel3.close();
    panel3.addEventListener("close", () => {
      secrets = false;
      panel3.querySelector("[data-record]").textContent = "";
      panel3.querySelector("[data-notes]").value = "";
      panel3.querySelector("[data-secrets]").checked = false;
    });
    panel3.querySelector("[data-secrets]").onchange = (e) => {
      secrets = e.target.checked;
      paint();
    };
    panel3.querySelector("[data-notes]").oninput = (e) => setServiceNotes(e.target.value);
    panel3.querySelector("[data-exit-policy]").onchange = (e) => {
      writeExitPolicy(e.target.value);
      status3(e.target.value === "clear" ? "O atendimento será limpo ao sair do roteador." : e.target.value === "keep" ? "O atendimento será mantido ao sair do roteador." : "Você será perguntado ao sair do roteador.");
    };
    panel3.querySelector("[data-clear-notes]").onclick = () => {
      setServiceNotes("");
      panel3.querySelector("[data-notes]").value = "";
      status3("Observações limpas.");
    };
    panel3.querySelector("[data-clear-service]").onclick = () => {
      if (!service.id && !service.entries.length) {
        status3("O atendimento já está vazio.");
        return;
      }
      if (!window.confirm("Limpar todo o atendimento atual? Esta ação apaga a linha do tempo e as observações desta sessão.")) return;
      clearService({ keepSession: Boolean(store2.session?.connected) });
      panel3.querySelector("[data-notes]").value = "";
      status3(store2.session?.connected ? "Atendimento limpo. O novo registro continuará nesta conexão." : "Atendimento limpo.");
      paint();
    };
    panel3.querySelectorAll("[data-copy]").forEach((b) => b.onclick = async () => {
      const text2 = formatService({ secrets, mode: b.dataset.copy === "technical" ? "technical" : panel3.querySelector("[data-mode]").value, markdown: b.dataset.copy === "markdown" });
      b.disabled = true;
      try {
        await copyText(text2);
        status3("Registro copiado.");
        document.dispatchEvent(new CustomEvent("service-log-copied"));
      } catch {
        selectRecordForManualCopy(panel3);
        status3("Não foi possível copiar automaticamente. O registro foi selecionado; pressione Ctrl+C.");
      } finally {
        b.disabled = false;
      }
    });
    panel3.querySelector("[data-export]").onclick = () => {
      const url = URL.createObjectURL(new Blob([formatService({ secrets, mode: panel3.querySelector("[data-mode]").value })], { type: panel3.querySelector("[data-mode]").value === "technical" ? "application/json;charset=utf-8" : "text/plain;charset=utf-8" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = panel3.querySelector("[data-mode]").value === "technical" ? "atendimento-tecnico.json" : "atendimento.txt";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1e3);
    };
    const handleDisconnect = () => {
      if (!service.id) return;
      const policy = readExitPolicy();
      if (policy === "clear") {
        clearService();
        return;
      }
      if (policy === "keep") {
        detachService();
        return;
      }
      if (window.confirm("Você saiu do roteador. Deseja limpar o atendimento atual?\n\nOK = limpar\nCancelar = manter para continuar depois")) clearService();
      else detachService();
    };
    document.addEventListener("app-context-ready", () => {
      const connected = Boolean(store2.session?.connected);
      if (connected) startService(store2.session);
      else if (wasConnected) handleDisconnect();
      wasConnected = connected;
      if (!connected && panel3.open) panel3.close();
    });
    if (store2.session?.connected) startService(store2.session);
    window.__amObserveOperation = observeOperation;
    window.addEventListener("pagehide", () => clearService());
  }

  // apps/access_manager/static/js/ui/theme.js
  var preferenceKeys = { theme: "accessManager.theme", experience: "accessManager.experience", enabled: "accessManager.audio.enabled", volume: "accessManager.audio.volume", quality: "accessManager.world.quality" };
  function readPreference(name, fallback) {
    try {
      return localStorage.getItem(preferenceKeys[name] || name) || fallback;
    } catch {
      return fallback;
    }
  }
  function savePreference(name, value2) {
    try {
      localStorage.setItem(preferenceKeys[name] || name, String(value2));
    } catch {
    }
  }
  function presentLabel(raw, navigation3 = false) {
    if (navigation3 && /^\s*\d{2}\s*$/.test(raw)) return "";
    return raw.replace(/^(\s*)\[\s*(.*?)\s*\](\s*)$/, "$1$2$3").replace(/^(\s*)(?:>\s+|\/\/\s+)/, "$1");
  }
  var icons = { overview: "🌐", clients: "👥", traffic: "📈", wifi: "📶", wan: "🌍", lan: "🔌", dhcpdns: "🗂", diagnostics: "🧪", completeDiagnostics: "🩺", profiles: "🧰", management: "⚙", subscribers: "👥", juniperSubscriber: "🔗", juniperInterfaces: "🔌", juniperRouting: "🌐", juniperDiagnostics: "🔎", juniperSystem: "🏢" };
  function mountThemeProvider() {
    const root2 = document.documentElement, shell = document.querySelector(".app-shell");
    let theme = "terminal";
    const originals = /* @__PURE__ */ new Map();
    let scheduled = false;
    const paths = { overview: "M3 12h18M12 3c6 6 6 12 0 18-6-6-6-12 0-18M3 12a9 9 0 1 0 18 0 9 9 0 1 0-18 0", clients: "M8 10a3 3 0 1 0 0-6 3 3 0 1 0 0 6M3 19v-3c0-5 10-5 10 0v3M17 6a3 3 0 0 1 0 6m0 2c3 0 4 2 4 5", traffic: "M3 19V4m0 15h18M5 14l5-6 4 4 6-8", wifi: "M3 8c5-5 13-5 18 0M6 12c3-3 9-3 12 0m-9 4c2-2 4-2 6 0m-3 3v1", wan: "M3 12a9 9 0 1 0 18 0 9 9 0 1 0-18 0m0 0h18M12 3v18", lan: "M5 8h14v10H5zm3-4v7m4-7v7m4-7v7m-4 7v4", dhcpdns: "M3 5h18v5H3zm0 9h18v5H3zm4-6h2m-2 9h2", diagnostics: "M5 10a6 6 0 1 0 12 0 6 6 0 1 0-12 0m10 5 6 6", profiles: "M6 3h12v18H6zm3 5h6m-6 4h6m-6 4h6", management: "M12 4v3m0 10v3M4 12h3m10 0h3M6 6l2 2m8 8 2 2M6 18l2-2m8-8 2-2M8 12a4 4 0 1 0 8 0 4 4 0 1 0-8 0" };
    function decorate() {
      scheduled = false;
      document.querySelectorAll("#sidebar .nav").forEach((button2) => {
        button2.dataset.aeroIcon = icons[button2.dataset.view] || "◈";
        const path2 = paths[button2.dataset.view] || paths[button2.dataset.view === "subscribers" ? "clients" : "dhcpdns"];
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28"><defs><linearGradient id="g" x2="0" y2="1"><stop stop-color="#a5eeff"/><stop offset=".5" stop-color="#218cbd"/><stop offset="1" stop-color="#146f9b"/></linearGradient></defs><circle cx="14" cy="14" r="13" fill="url(#g)" stroke="#68adca"/><path d="${path2}" transform="translate(2 2)" fill="none" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        button2.style.setProperty("--aero-icon", `url("data:image/svg+xml,${encodeURIComponent(svg)}")`);
      });
      document.querySelectorAll("button,h1,h2,h3,h4,th,.nav,.nav-group,.status-badge,.diagnostic-status,.badge,.connection-eyebrow,small,.data-table td").forEach((el) => {
        if (el.closest("pre,code,[data-raw],.raw-output,[contenteditable]")) return;
        for (const node of el.childNodes) {
          if (node.nodeType !== 3) continue;
          const old = originals.get(node);
          const raw = old && node.data === old.display ? old.raw : node.data;
          const labelAllowed = !el.matches("td") || /^\s*\[\s*(?:ATIVO|OK|INFO|ATENÇÃO|CRÍTICO|PARCIAL|N\/D)\s*\]\s*$/i.test(raw);
          const display = theme === "aero" && labelAllowed ? presentLabel(raw, el.matches(".nav")) : raw;
          if (display !== raw) originals.set(node, { raw, display });
          else originals.delete(node);
          if (node.data !== display) node.data = display;
        }
      });
      for (const [node, old] of originals) {
        if (!node.isConnected) originals.delete(node);
        else if (theme === "terminal") {
          if (node.data === old.display) node.data = old.raw;
          originals.delete(node);
        }
      }
    }
    function apply(value2, { persist = true } = {}) {
      theme = value2 === "aero" ? "aero" : "terminal";
      root2.dataset.experienceTheme = theme;
      shell?.classList.toggle("aero-theme", theme === "aero");
      root2.style.colorScheme = theme === "aero" ? "light" : "dark";
      document.querySelector("#action-dialog")?.classList.toggle("aero-theme", theme === "aero");
      document.querySelector("#login-page")?.classList.toggle("aero-theme", theme === "aero");
      const select = document.querySelector("#theme-select");
      if (select) select.value = theme;
      const button2 = document.querySelector("#world-theme");
      if (button2) {
        button2.textContent = theme === "aero" ? "Tema Terminal" : "Tema Aero";
        button2.setAttribute("aria-pressed", String(theme === "aero"));
      }
      if (persist) savePreference("theme", theme);
      decorate();
      document.dispatchEvent(new CustomEvent("theme-changed", { detail: theme }));
    }
    const observer = new MutationObserver(() => {
      if (!scheduled) {
        scheduled = true;
        queueMicrotask(decorate);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    document.querySelector("#theme-select")?.addEventListener("change", (e) => apply(e.target.value));
    window.addEventListener("pagehide", () => {
      observer.disconnect();
      originals.clear();
    }, { once: true });
    apply(readPreference("theme", readPreference("am-theme", "terminal")), { persist: false });
    return { apply, get theme() {
      return theme;
    } };
  }

  // apps/access_manager/static/js/ui/login.js
  function supportsWebGL() {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
      if (!gl) return false;
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      return true;
    } catch {
      return false;
    }
  }
  function mountLoginExperience(theme) {
    const selector = document.querySelector("#experience-choices");
    if (!selector) return { afterConnect: async () => {
    } };
    const input = document.querySelector("#login-experience");
    let selected2 = ["world3d", "voxel", "wasteland"].includes(readPreference("experience", "interface")) ? readPreference("experience", "interface") : readPreference("theme", readPreference("am-theme", "terminal")) === "aero" ? "aero" : "terminal";
    let probed = false, supported = true;
    function select(value2, persist = true) {
      selected2 = value2;
      input.value = value2;
      selector.querySelectorAll("[data-login-experience]").forEach((b) => {
        const checked = b.dataset.loginExperience === value2;
        b.setAttribute("aria-checked", String(checked));
        b.classList.toggle("selected", checked);
        b.tabIndex = checked ? 0 : -1;
      });
      theme.apply(["terminal", "wasteland"].includes(value2) ? "terminal" : "aero", { persist });
      if (persist) savePreference("experience", ["world3d", "voxel", "wasteland"].includes(value2) ? value2 : "interface");
      if (["world3d", "voxel", "wasteland"].includes(value2)) {
        if (!probed) {
          supported = supportsWebGL();
          probed = true;
        }
        document.querySelector("#login-3d-status").textContent = supported ? "O mundo será aberto após autenticar." : "3D indisponível neste dispositivo. Você entrará na interface convencional.";
      }
    }
    selector.addEventListener("click", (e) => {
      const b = e.target.closest("[data-login-experience]");
      if (b) select(b.dataset.loginExperience);
    });
    selector.addEventListener("keydown", (e) => {
      const buttons = [...selector.querySelectorAll("[data-login-experience]")];
      if (["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"].includes(e.key)) {
        e.preventDefault();
        const index = buttons.findIndex((b) => b.dataset.loginExperience === selected2);
        const next = e.key === "Home" ? 0 : e.key === "End" ? buttons.length - 1 : (index + (["ArrowLeft", "ArrowUp"].includes(e.key) ? buttons.length - 1 : 1)) % buttons.length;
        select(buttons[next].dataset.loginExperience);
        buttons[next].focus();
      }
    });
    select(selected2, false);
    return { get selected() {
      return selected2;
    }, async afterConnect(world) {
      theme.apply(["terminal", "wasteland"].includes(selected2) ? "terminal" : "aero");
      savePreference("experience", ["world3d", "voxel", "wasteland"].includes(selected2) ? selected2 : "interface");
      if (["world3d", "voxel", "wasteland"].includes(selected2)) {
        if (!probed) {
          supported = supportsWebGL();
          probed = true;
        }
        if (supported) await world.enter(selected2);
        else world.unavailable("3D indisponível neste dispositivo. A interface convencional está disponível.");
      }
    } };
  }

  // apps/access_manager/static/js/core/routes.js
  var routerNavigation = [
    ["VISÃO OPERACIONAL", [["overview", "Visão geral"], ["clients", "Clientes"], ["traffic", "Tráfego"]]],
    ["REDE", [["wifi", "Wi-Fi e SSIDs"], ["wan", "WAN"], ["lan", "LAN"], ["dhcpdns", "DHCP e DNS"]]],
    ["OPERAÇÕES", [["diagnostics", "Diagnóstico"], ["completeDiagnostics", "Diagnóstico completo"], ["profiles", "Perfis"], ["management", "Gerenciamento"]]]
  ];
  var requirements = { clients: ["clients"], traffic: ["traffic"], wifi: ["wifi", "wifi_radio"], wan: ["wan"], lan: ["lan"], dhcpdns: ["dhcp", "dns"], diagnostics: ["diagnostics"], completeDiagnostics: ["diagnostics", "runtime_diagnostic"], juniperSubscriber: ["subscriber_detail"], subscribers: ["subscriber_lookup"], juniperAccounting: ["juniper_accounting"], juniperServices: ["subscriber_detail"], juniperInterfaces: ["juniper_interfaces"], juniperLacp: ["juniper_lacp"], juniperOptics: ["juniper_optics"], juniperRouting: ["juniper_route", "juniper_fib"], juniperRadius: ["juniper_aaa"], juniperAuth: ["juniper_aaa"], juniperAaaAccounting: ["juniper_accounting"], juniperDynamic: ["juniper_aaa"], juniperPppoe: ["juniper_pppoe"], juniperLockout: ["juniper_lockout"], juniperDiagnostics: ["juniper_ping", "juniper_traceroute"], juniperSystem: ["juniper_resources"], juniperFpc: ["juniper_chassis"], juniperEnvironment: ["juniper_health"], juniperHardware: ["juniper_chassis"] };
  var kinds = { overview: "globe", clients: "clients", traffic: "traffic", wifi: "wifi", wan: "globe", lan: "ports", dhcpdns: "dns", diagnostics: "probe", completeDiagnostics: "probe", profiles: "profiles", management: "gear", subscribers: "subscribers", juniperSubscriber: "tunnel", juniperAccounting: "traffic", juniperServices: "profiles", juniperInterfaces: "rack", juniperLacp: "ports", juniperOptics: "fiber", juniperRouting: "routes", juniperRadius: "hub", juniperAuth: "hub", juniperAaaAccounting: "traffic", juniperDynamic: "hub", juniperPppoe: "tunnel", juniperLockout: "probe", juniperDiagnostics: "probe", juniperSystem: "rack", juniperFpc: "rack", juniperEnvironment: "globe", juniperHardware: "rack", juniperOverview: "hub", juniperLogs: "profiles" };
  function capabilityAllows(cap2) {
    if (!cap2) return false;
    return cap2.enabled?.read === true || ["SUPPORTED", "PARTIAL"].includes(cap2.read) || cap2.enabled?.write === true || cap2.write === "SUPPORTED";
  }
  function createRouteRegistry(views2, juniperNavigation, actions = [], huaweiNavigation = []) {
    const collect = (navigation3, family) => navigation3.flatMap(([group, items]) => items.filter(([id]) => Object.hasOwn(views2, id)).map(([id, label]) => ({ id, label, group, family, kind: kinds[id] || "orb", capabilities: requirements[id] || [] })));
    return [...collect(routerNavigation, "router"), ...collect(juniperNavigation, "juniper"), ...collect(huaweiNavigation, "huawei_bng")].map((route) => ({ ...route, actions: actions.filter((a) => a.routeId === route.id) }));
  }
  function applicableRoutes(registry, session2, capabilities) {
    const family = ["juniper", "huawei_bng"].includes(session2?.vendor) ? session2.vendor : "router";
    return registry.filter((r) => r.family === family && (!r.capabilities.length || r.capabilities.some((c) => capabilityAllows(capabilities?.[c]))));
  }

  // apps/access_manager/static/js/wasteland/metadata.js
  var names = { overview: "Control Shelter", wan: "WAN Tower", wifi: "Wi-Fi Relay Field", clients: "Client Outpost", lan: "LAN Workshop", dhcpdns: "DHCP / DNS Supply Depot", diagnostics: "Diagnostics Lab", completeDiagnostics: "Diagnostics Command Lab", profiles: "Configuration Archive", management: "Operations Workshop", traffic: "Telemetry Station", juniperOverview: "BNG Command Bunker", subscribers: "Subscriber Outpost", juniperSubscriber: "Session Relay", juniperInterfaces: "Interface Yard", juniperDiagnostics: "Diagnostics Tower", "access-cpe": "CPE Gate" };
  var fieldName = (region) => names[region.id] || names[region.routeId] || region.label;
  function withFieldRegions(regions, mode) {
    if (mode !== "wasteland") return regions;
    const [x, z] = [[0, 34], [0, 42], [-43, 30], [43, 30], [0, -34]].find(([x2, z2]) => regions.every((r) => Math.hypot(r.x - x2, r.z - z2) > 8)) || [-43, -35];
    return [...regions.map((r) => ({ ...r, worldLabel: fieldName(r), interactionType: r.actionId ? "action" : "route", status: "Disponível na sessão" })), { id: "service-log", routeId: null, kind: "service", label: "Atendimento atual", worldLabel: "Service Log Terminal", interactionType: "service", status: "Registro local em memória", available: true, x, z, color: 3407718, layout: regions[0]?.layout || "router" }];
  }

  // apps/access_manager/static/js/wasteland/audio.js
  var FieldAudio = class {
    constructor({ volume = 0.35, onChange = () => {
    } } = {}) {
      this.volume = Number(volume) || 0;
      this.active = false;
      this.onChange = onChange;
      this.context = null;
      this.revision = 0;
    }
    async play() {
      const token = ++this.revision;
      if (!this.context) {
        const Context = window.AudioContext || window.webkitAudioContext;
        if (!Context) throw new Error("Áudio indisponível nesta WebView.");
        this.context = new Context();
        this.gain = this.context.createGain();
        this.gain.gain.value = 0;
        this.gain.connect(this.context.destination);
        this.oscillator = this.context.createOscillator();
        this.oscillator.type = "triangle";
        this.oscillator.frequency.value = 55;
        this.oscillator.connect(this.gain);
        this.oscillator.start();
      }
      await this.context.resume();
      if (token !== this.revision) return;
      this.active = true;
      this.setVolume(this.volume);
      this.onChange(this.active);
    }
    setVolume(value2) {
      this.volume = Math.max(0, Math.min(1, Number(value2) || 0));
      if (this.gain) this.gain.gain.setTargetAtTime(this.active ? this.volume * 0.035 : 0, this.context.currentTime, 0.08);
    }
    pause() {
      this.revision++;
      this.active = false;
      this.setVolume(this.volume);
      this.context?.suspend()?.catch(() => {
      });
      this.onChange(false);
    }
    async toggle() {
      if (this.active) this.pause();
      else await this.play();
    }
    dispose() {
      this.pause();
      this.oscillator?.stop();
      this.oscillator?.disconnect();
      this.gain?.disconnect();
      this.context?.close();
      this.context = null;
    }
  };

  // apps/access_manager/static/js/world/regions.js
  var palette = [1288654, 5485633, 236475, 7826651, 15115581, 2920919];
  function deriveWorldRegions(registry, session2, capabilities) {
    const layout = session2?.vendor === "juniper" ? "juniper" : "router";
    const routes2 = applicableRoutes(registry, session2, capabilities);
    const items = routes2.flatMap((route) => [{ routeId: route.id, id: route.id, label: route.label, kind: route.kind, capabilities: route.capabilities, available: true }, ...(route.actions || []).filter((a) => a.available() && (!a.capability || capabilityAllows(capabilities?.[a.capability]))).map((a) => ({ routeId: route.id, id: a.id, actionId: a.id, label: a.label, kind: a.kind, available: true }))]);
    return items.map((r, i) => {
      const col = i % 5, row = Math.floor(i / 5);
      return { ...r, layout, x: layout === "juniper" ? (col - 2) * 15 : (col - 2) * 17, z: layout === "juniper" ? -16 + row * 15 : -12 + row * 18, color: palette[i % palette.length] };
    });
  }

  // apps/access_manager/static/js/world/icon-metadata.js
  var minimapGlyph = { wifi: "◔", globe: "◎", clients: "●", subscribers: "♙", rack: "▤", ports: "▦", fiber: "↔", tunnel: "↔", traffic: "⇄", dns: "◇", profiles: "▣", probe: "⌕", gear: "⚙", hub: "✦", routes: "✧", cpe: "⌂" };

  // apps/access_manager/static/js/world/playlist.js
  var audioFile = (file) => /\.(mp3|ogg|wav|m4a|aac|flac|webm)$/i.test(file?.name || "");
  function scanFiles(files, { recursive = true, order = "name" } = {}) {
    const rows3 = Array.from(files || []).filter(audioFile).filter((f) => recursive || (f.webkitRelativePath || f.path || f.name).split("/").length <= 2).map((file) => ({ file, name: file.name, path: file.webkitRelativePath || file.path || file.name, date: file.lastModified || 0 }));
    return rows3.sort((a, b) => {
      const x = order === "date" ? a.date - b.date : 0;
      return x || String(order === "path" ? a.path : a.name).localeCompare(String(order === "path" ? b.path : b.name), "en", { numeric: true }) || a.path.localeCompare(b.path, "en");
    });
  }
  var Playlist = class {
    constructor({ repeat = "playlist", shuffle = false, random = Math.random } = {}) {
      this.items = [];
      this.index = -1;
      this.repeat = repeat;
      this.shuffle = shuffle;
      this.random = random;
      this.history = [];
      this.bag = [];
    }
    set(items, index = 0) {
      this.items = items;
      this.index = items.length ? Math.max(0, Math.min(index, items.length - 1)) : -1;
      this.history = [];
      this.bag = [];
      return this.current;
    }
    get current() {
      return this.items[this.index] || null;
    }
    next({ ended = false } = {}) {
      if (!this.items.length) return null;
      if (ended && this.repeat === "track") return this.current;
      const old = this.index;
      if (this.shuffle) {
        if (!this.bag.length) {
          if (ended && this.repeat === "off" && this.history.length >= this.items.length - 1) return null;
          this.bag = this.items.map((_, i) => i).filter((i) => i !== old);
          for (let i = this.bag.length - 1; i > 0; i--) {
            const j = Math.floor(this.random() * (i + 1));
            [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]];
          }
        }
        this.index = this.bag.pop() ?? old;
      } else {
        if (old === this.items.length - 1 && ended && this.repeat === "off") return null;
        this.index = (old + 1) % this.items.length;
      }
      this.history.push(old);
      return this.current;
    }
    previous() {
      if (!this.items.length) return null;
      this.index = this.history.pop() ?? (this.index - 1 + this.items.length) % this.items.length;
      return this.current;
    }
  };
  function library(mode, work) {
    return new Promise((resolve, reject) => {
      if (typeof indexedDB === "undefined") {
        reject(new Error("Biblioteca persistente indisponível nesta WebView."));
        return;
      }
      const request2 = indexedDB.open("accessManager.world.music", 1);
      request2.onupgradeneeded = () => request2.result.createObjectStore("library");
      request2.onerror = () => reject(request2.error);
      request2.onsuccess = () => {
        const db = request2.result, tx = db.transaction("library", mode), store2 = tx.objectStore("library");
        let result;
        try {
          const r = work(store2);
          r.onsuccess = () => {
            result = r.result;
          };
        } catch (e) {
          db.close();
          reject(e);
          return;
        }
        tx.oncomplete = () => {
          db.close();
          resolve(result);
        };
        tx.onerror = () => {
          db.close();
          reject(tx.error);
        };
        tx.onabort = () => {
          db.close();
          reject(tx.error || new Error("Não foi possível salvar as músicas."));
        };
      };
    });
  }
  var saveMusicLibrary = (items) => library("readwrite", (s) => s.put(items.map(({ file, name, path: path2, date }) => ({ file, name, path: path2, date })), "tracks"));
  var loadMusicLibrary = () => library("readonly", (s) => s.get("tracks")).then((rows3) => Array.isArray(rows3) ? rows3.filter((r) => r.file && audioFile(r)) : []);
  var clearMusicLibrary = () => library("readwrite", (s) => s.delete("tracks"));

  // apps/access_manager/static/js/world/audio.js
  var clamp = (v) => Number.isFinite(Number(v)) ? Math.max(0, Math.min(1, Number(v))) : 0.35;
  var AudioManager = class {
    constructor({ volume = 0.35, enabled = false, onChange = () => {
    } } = {}) {
      this.context = null;
      this.active = false;
      this.enabled = enabled;
      this.volume = clamp(volume);
      this.title = "Nenhuma música instalada";
      this.onChange = onChange;
      this.regionTracks = {};
      this.loop = true;
      this.operation = 0;
      this.playlist = new Playlist();
      this.failed = /* @__PURE__ */ new Set();
      this.playRequested = false;
    }
    notify() {
      this.onChange({ active: this.active, enabled: this.enabled, title: this.title, installed: Boolean(this.element), volume: this.volume, index: this.playlist.index, count: this.playlist.items.length, position: this.element?.currentTime || 0, duration: this.element?.duration || 0 });
    }
    ensureContext() {
      if (this.context) return;
      const Context = window.AudioContext || window.webkitAudioContext;
      if (!Context) throw new Error("Áudio indisponível nesta WebView.");
      this.context = new Context();
      this.master = this.context.createGain();
      this.master.gain.value = 0;
      this.master.connect(this.context.destination);
      for (const channel of ["music", "ambient", "ui", "sfx"]) {
        this[channel] = this.context.createGain();
        this[channel].connect(this.master);
      }
      if (this.element) this.connectElement();
    }
    connectElement() {
      this.source?.disconnect();
      this.source = this.context.createMediaElementSource(this.element);
      this.source.connect(this.music);
    }
    setTrack(url, title, { objectURL = false } = {}) {
      if (this.element) {
        this.element.onended = null;
        this.element.onerror = null;
        this.element.ontimeupdate = null;
      }
      this.pauseMusic();
      this.source?.disconnect();
      if (this.objectURL) URL.revokeObjectURL(this.objectURL);
      if (this.element) {
        this.element.removeAttribute?.("src");
        this.element.load?.();
      }
      this.objectURL = objectURL ? url : null;
      this.element = new Audio(url);
      this.element.preload = "metadata";
      this.element.loop = this.playlist.items.length ? false : this.loop;
      this.title = title || "Música local";
      this.element.onended = () => {
        if (this.playRequested) this.advance(true).catch(() => {
        });
      };
      this.element.ontimeupdate = () => this.notify();
      this.element.onerror = () => {
        const resume = this.playRequested;
        this.active = false;
        this.failed.add(this.playlist.index);
        this.title = "Faixa inválida; tentando a próxima";
        this.notify();
        if (resume && this.failed.size < this.playlist.items.length) this.advance(true).catch(() => {
        });
      };
      if (this.context) this.connectElement();
      this.notify();
    }
    async loadInstalled(manifestURL) {
      if (!manifestURL || this.manifestLoaded) return;
      this.manifestLoaded = true;
      try {
        const response = await fetch(manifestURL, { credentials: "same-origin" });
        if (!response.ok) return;
        const manifest = await response.json();
        this.regionTracks = manifest.regions || {};
        if (!manifest.track || this.element) return;
        const url = new URL(manifest.track, new URL(manifestURL, location.href));
        const base = new URL(".", url);
        const permitted = new URL(".", new URL(manifestURL, location.href));
        if (url.origin !== location.origin || base.href !== permitted.href || !/\.(mp3|ogg|wav)$/i.test(url.pathname)) return;
        this.setTrack(url.href, manifest.title || "Música local instalada");
      } catch {
      } finally {
        this.notify();
      }
    }
    importFiles(files, options = {}) {
      const items = scanFiles(files, options);
      if (!items.length) throw new Error("A pasta não contém áudio compatível.");
      this.setPlaylist(items);
      return items;
    }
    setPlaylist(items, index = 0) {
      if (!items.length) {
        this.pauseMusic({ immediate: true });
        this.source?.disconnect();
        if (this.objectURL) URL.revokeObjectURL(this.objectURL);
        this.objectURL = null;
        if (this.element) {
          this.element.onended = null;
          this.element.onerror = null;
          this.element.removeAttribute?.("src");
          this.element.load?.();
        }
        this.element = null;
        if (this.preloadURL) URL.revokeObjectURL(this.preloadURL);
        this.preload?.pause();
        this.preload = null;
      }
      this.failed.clear();
      this.playlist.set(items, index);
      this.selectCurrent();
    }
    selectCurrent() {
      const item = this.playlist.current;
      if (!item) return;
      this.setTrack(URL.createObjectURL(item.file), item.name, { objectURL: true });
      this.preloadNext();
    }
    preloadNext() {
      if (this.preloadURL) URL.revokeObjectURL(this.preloadURL);
      this.preload?.pause();
      if (this.preload) {
        this.preload.removeAttribute("src");
        this.preload.load();
      }
      this.preload = null;
      const items = this.playlist.items;
      if (items.length < 2 || this.playlist.shuffle) return;
      const item = items[(this.playlist.index + 1) % items.length];
      this.preloadURL = URL.createObjectURL(item.file);
      this.preload = new Audio(this.preloadURL);
      this.preload.preload = "metadata";
    }
    async advance(ended = false) {
      const playing = this.active || ended;
      if (!this.playlist.next({ ended })) {
        this.pauseMusic({ immediate: true });
        return false;
      }
      this.selectCurrent();
      if (playing) return this.playMusic();
      return true;
    }
    async previous() {
      const playing = this.active;
      if ((this.element?.currentTime || 0) > 3) {
        this.seek(0);
        return;
      }
      if (!this.playlist.previous()) return;
      this.selectCurrent();
      if (playing) await this.playMusic();
    }
    seek(seconds) {
      if (this.element && Number.isFinite(this.element.duration)) this.element.currentTime = Math.max(0, Math.min(this.element.duration, Number(seconds) || 0));
    }
    importFile(file) {
      if (!file || !/\.(mp3|ogg|wav)$/i.test(file.name)) throw new Error("Selecione um arquivo OGG, MP3 ou WAV.");
      this.setTrack(URL.createObjectURL(file), file.name, { objectURL: true });
    }
    setEnabled(value2) {
      this.enabled = Boolean(value2);
      if (!this.enabled) this.pauseMusic();
      this.notify();
    }
    setMasterVolume(value2) {
      this.volume = clamp(value2);
      if (this.context) this.fadeTo(this.active && this.enabled ? this.volume : 0, 0.08);
      this.notify();
    }
    setMusicVolume(value2) {
      if (this.context) this.music.gain.setTargetAtTime(clamp(value2), this.context.currentTime, 0.08);
    }
    fadeTo(value2, duration = 0.25) {
      if (!this.context) return;
      const gain = this.master.gain;
      gain.cancelScheduledValues(this.context.currentTime);
      gain.setTargetAtTime(clamp(value2), this.context.currentTime, Math.max(0.01, duration / 3));
    }
    async playMusic() {
      if (!this.element) {
        this.notify();
        return false;
      }
      const operation = ++this.operation, element = this.element;
      this.playRequested = true;
      this.ensureContext();
      await this.context.resume();
      if (operation !== this.operation || element !== this.element) return false;
      await element.play();
      if (operation !== this.operation || element !== this.element) {
        element.pause();
        return false;
      }
      this.enabled = true;
      this.active = true;
      this.fadeTo(this.volume);
      this.notify();
      return true;
    }
    pauseMusic({ immediate = false } = {}) {
      this.playRequested = false;
      const operation = ++this.operation, element = this.element;
      this.active = false;
      if (this.context) this.fadeTo(0, 0.12);
      if (immediate || !this.context) element?.pause();
      else setTimeout(() => {
        if (this.element !== element || operation === this.operation) element?.pause();
      }, 120);
      this.notify();
    }
    async toggle() {
      if (this.active) {
        this.setEnabled(false);
        return false;
      }
      return this.playMusic();
    }
    setLoop(value2) {
      this.loop = Boolean(value2);
      if (this.element) this.element.loop = this.playlist.items.length ? false : this.loop;
    }
    // Compatibility with callers from the first experimental world.
    pause() {
      this.pauseMusic();
    }
    dispose() {
      this.pauseMusic({ immediate: true });
      this.source?.disconnect();
      if (this.element) {
        this.element.removeAttribute("src");
        this.element.load();
      }
      if (this.objectURL) URL.revokeObjectURL(this.objectURL);
      this.preload?.pause();
      if (this.preloadURL) URL.revokeObjectURL(this.preloadURL);
      this.context?.close();
      this.element = null;
    }
  };

  // apps/access_manager/static/js/world/settings.js
  var WORLD_SETTINGS_KEY = "accessManager.world.settings";
  var triggers = ["world_enter", "world_exit", "npc_interact", "device_connected", "device_disconnected", "diagnostic_started", "diagnostic_ok", "diagnostic_failed", "weak_wifi", "pppoe_issue", "optical_issue", "password_changed", "service_log_copied", "idle", "combat_enter", "combat_hit", "combat_hurt", "combat_win", "combat_lose", "attack", "hurt", "player_hit", "npc_hit", "low_health", "victory", "defeat", "taunt"];
  var phrases = { world_enter: ["Vindo trabalhar de novo?", "Mais um plantão?"], world_exit: ["Até o próximo plantão."], npc_interact: ["Tomara que hoje o PPPoE colabore."], device_connected: ["Vamos ver o que esse roteador aprontou."], device_disconnected: ["Conexão encerrada."], diagnostic_started: ["Vamos investigar."], diagnostic_ok: ["Teste concluído. Confira o resultado."], diagnostic_failed: ["Aí complicou."], weak_wifi: ["Esse Wi-Fi está pedindo socorro."], pppoe_issue: ["Vamos conferir a sessão PPPoE."], optical_issue: ["Vamos olhar esse sinal óptico."], password_changed: ["Alteração de senha registrada."], service_log_copied: ["Registro copiado. Um a menos."], idle: ["Quer um café?"], combat_enter: ["Router Rumble! Só vale aqui na arena."], combat_hit: ["Pacote recebido!"], combat_hurt: ["Perdi um pacote!"], combat_win: ["Você venceu o roteador fictício!"], combat_lose: ["Revanche?"], attack: ["Lá vem pacote!"], hurt: ["Ai, minha antena!"], player_hit: ["Foi latência!"], npc_hit: ["Conexão direta!"], low_health: ["Minha bateria está acabando!"], victory: ["Vitória!"], defeat: ["Reiniciando o orgulho..."], taunt: ["Aqui o ping revida."] };
  var defaultDialogue = () => Object.fromEntries(triggers.map((trigger) => [trigger, { enabled: true, mode: "random", cooldownSeconds: trigger.startsWith("combat") || ["attack", "hurt", "taunt", "player_hit", "npc_hit"].includes(trigger) ? 3 : 30, lines: phrases[trigger].map((text2) => ({ text: text2, weight: 1 })) }]));
  function normalizeDialogue(input = {}) {
    if (!input || typeof input !== "object") input = {};
    const defaults = defaultDialogue();
    return Object.fromEntries(triggers.map((key) => {
      const r = input[key] || defaults[key];
      return [key, { enabled: r.enabled !== false, mode: r.mode === "sequential" ? "sequential" : "random", cooldownSeconds: Math.max(0, Math.min(3600, Number(r.cooldownSeconds) || 0)), lines: (Array.isArray(r.lines) ? r.lines : defaults[key].lines).slice(0, 100).map((l) => ({ text: String(l?.text || "").slice(0, 400), weight: Math.max(0.01, Math.min(100, Number(l?.weight) || 1)) })).filter((l) => l.text.trim()) }];
    }));
  }
  function normalizeSettings(raw = {}) {
    if (!raw || typeof raw !== "object") raw = {};
    return { version: 1, cameras: Object.fromEntries(["aero", "office", "arena"].filter((k) => ["first", "third"].includes(raw.cameras?.[k])).map((k) => [k, raw.cameras[k]])), scene: ["aero", "office", "arena"].includes(raw.scene) ? raw.scene : "aero", hud: ["visible", "auto", "hidden"].includes(raw.hud) ? raw.hud : "auto", tts: raw.tts === true, debug: raw.debug === true, tutorialSeen: raw.tutorialSeen === true, repeat: ["off", "track", "playlist"].includes(raw.repeat) ? raw.repeat : "playlist", shuffle: raw.shuffle === true, order: ["name", "path", "date"].includes(raw.order) ? raw.order : "name", recursive: raw.recursive !== false, rememberMusic: raw.rememberMusic === true, lastTrack: String(raw.lastTrack || ""), position: Number.isFinite(Number(raw.position)) ? Math.max(0, Number(raw.position)) : 0, youtube: String(raw.youtube || "").slice(0, 400), profanity: ["off", "moderado", "livre/local"].includes(raw.profanity) ? raw.profanity : "off", arenaDifficulty: ["easy", "normal"].includes(raw.arenaDifficulty) ? raw.arenaDifficulty : "normal", dialogue: normalizeDialogue(raw.dialogue) };
  }
  function readWorldSettings() {
    let raw = {};
    try {
      raw = JSON.parse(readPreference(WORLD_SETTINGS_KEY, "{}"));
    } catch {
    }
    return normalizeSettings(raw);
  }
  function writeWorldSettings(value2) {
    const settings = normalizeSettings(value2);
    savePreference(WORLD_SETTINGS_KEY, JSON.stringify(settings));
    return settings;
  }

  // apps/access_manager/static/js/world/dialogue.js
  var DialogueManager = class {
    constructor(rules, { random = Math.random, now = () => Date.now() / 1e3 } = {}) {
      this.rules = normalizeDialogue(rules);
      this.random = random;
      this.now = now;
      this.last = /* @__PURE__ */ new Map();
      this.sequence = /* @__PURE__ */ new Map();
    }
    choose(trigger, { preview = false, profanity = "off" } = {}) {
      const rule = this.rules[trigger];
      if (!rule?.enabled || !rule.lines.length) return null;
      const now = this.now();
      if (!preview && now - (this.last.get(trigger) ?? -Infinity) < rule.cooldownSeconds) return null;
      let line2;
      if (rule.mode === "sequential") {
        const n = this.sequence.get(trigger) || 0;
        line2 = rule.lines[n % rule.lines.length];
        if (!preview) this.sequence.set(trigger, n + 1);
      } else {
        let pick3 = this.random() * rule.lines.reduce((n, l) => n + l.weight, 0);
        line2 = rule.lines.find((l) => (pick3 -= l.weight) < 0) || rule.lines.at(-1);
      }
      if (!preview) this.last.set(trigger, now);
      const text2 = line2.text;
      return profanity === "livre/local" ? text2 : text2.replace(/\b(porra|caralho|merda|puta|foder|foda|cacete)\b/gi, profanity === "moderado" ? "***" : "…");
    }
  };

  // apps/access_manager/static/js/world/media.js
  function parseYouTube(value2) {
    const input = String(value2 || "").trim();
    if (/^[\w-]{11}$/.test(input)) return { videoId: input };
    if (/^(PL|UU|OLAK5uy_)[\w-]{10,}$/.test(input)) return { list: input };
    let url;
    try {
      url = new URL(input);
    } catch {
      throw new Error("Cole uma URL ou ID válido do YouTube.");
    }
    if (url.protocol !== "https:" || url.username || url.password || url.port || !["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be", "www.youtube-nocookie.com"].includes(url.hostname)) throw new Error("Use um link HTTPS do YouTube.");
    const bits = url.pathname.split("/").filter(Boolean), videoId = url.hostname === "youtu.be" ? bits[0] : ["embed", "shorts", "live"].includes(bits[0]) ? bits[1] : url.pathname === "/watch" ? url.searchParams.get("v") : null, list2 = url.searchParams.get("list");
    if (videoId && !/^[\w-]{11}$/.test(videoId)) throw new Error("ID de vídeo inválido.");
    if (list2 && !/^[\w-]{10,100}$/.test(list2)) throw new Error("ID de playlist inválido.");
    if (!videoId && !list2) throw new Error("Não encontrei um vídeo ou playlist nessa URL.");
    return { ...videoId ? { videoId } : {}, ...list2 ? { list: list2 } : {} };
  }
  function youtubeURL(data) {
    return data.videoId ? "https://www.youtube.com/watch?v=" + data.videoId + (data.list ? "&list=" + data.list : "") : "https://www.youtube.com/playlist?list=" + data.list;
  }
  function looksLikeYouTubeReference(value2) {
    const input = String(value2 || "").trim();
    return /^[\w-]{11}$/.test(input) || /^(PL|UU|OLAK5uy_)[\w-]{10,}$/.test(input) || /^https?:\/\//i.test(input);
  }
  async function searchYouTube(query2, { signal } = {}) {
    const q = String(query2 || "").trim();
    if (q.length < 2) throw new Error("Digite pelo menos 2 caracteres para pesquisar no YouTube.");
    const res = await fetch(new URL("/api/media/youtube/search", location.origin), { signal, method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: q }) });
    let data = {};
    try {
      data = await res.json();
    } catch {
    }
    if (!res.ok || data?.success === false) throw new Error(data?.error?.message || "Não foi possível pesquisar no YouTube.");
    return Array.isArray(data?.results) ? data.results : [];
  }
  var apiPromise;
  function loadAPI() {
    if (window.YT?.Player) return Promise.resolve(window.YT);
    if (apiPromise) return apiPromise;
    apiPromise = new Promise((resolve, reject) => {
      const previous = window.onYouTubeIframeAPIReady;
      const script = document.createElement("script");
      const timeout = setTimeout(() => {
        script.remove();
        apiPromise = null;
        reject(new Error("YouTube indisponível nesta WebView."));
      }, 12e3);
      window.onYouTubeIframeAPIReady = () => {
        clearTimeout(timeout);
        previous?.();
        resolve(window.YT);
      };
      script.src = "https://www.youtube.com/iframe_api";
      script.onerror = () => {
        clearTimeout(timeout);
        script.remove();
        apiPromise = null;
        reject(new Error("Não foi possível acessar o player do YouTube."));
      };
      document.head.append(script);
    });
    return apiPromise;
  }
  var YouTubeTV = class {
    constructor(host = null, status3 = null) {
      this.host = host;
      this.status = status3;
      this.generation = 0;
    }
    setStatus(text2) {
      if (this.status) this.status.textContent = text2;
    }
    attach(host) {
      if (host === this.host) return;
      if (!host) {
        this.destroy();
        this.host = null;
        return;
      }
      const previous = this.host;
      this.host = host;
      if (previous && previous !== host) while (previous.firstChild) host.append(previous.firstChild);
    }
    async play(value2) {
      const data = parseYouTube(value2);
      if (!this.host) throw new Error("A televisão 3D não está disponível neste cenário.");
      this.destroy({ keepHost: true });
      const generation3 = this.generation;
      this.data = data;
      this.setStatus("Carregando vídeo na televisão 3D…");
      try {
        const YT = await loadAPI();
        if (this.generation !== generation3) return data;
        const mount8 = document.createElement("div");
        this.host.replaceChildren(mount8);
        this.player = new YT.Player(mount8, { width: "100%", height: "100%", videoId: data.videoId || "", playerVars: { controls: 1, playsinline: 1, autoplay: 1, rel: 0, origin: location.origin, ...data.list ? { listType: "playlist", list: data.list } : {} }, events: { onReady: () => {
          if (generation3 !== this.generation) return;
          this.setStatus("Reproduzindo na televisão 3D. Use os controles diretamente na TV.");
          const frame = this.player.getIframe?.();
          frame?.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
          frame?.setAttribute("title", "YouTube na televisão 3D");
          try {
            this.player.playVideo?.();
          } catch {
          }
        }, onAutoplayBlocked: () => this.setStatus("Vídeo carregado na TV. Clique no player para iniciar."), onError: (e) => this.setStatus(`YouTube não conseguiu reproduzir (${e.data}). Tente outro vídeo.`) } });
      } catch (e) {
        if (this.generation === generation3) this.setStatus(e.message);
      }
      return data;
    }
    destroy({ keepHost = false } = {}) {
      this.generation++;
      try {
        this.player?.destroy();
      } catch {
      }
      this.player = null;
      if (this.host) this.host.replaceChildren();
      if (!keepHost) this.data = null;
    }
  };

  // apps/access_manager/static/js/world/experience.js
  function mountWorldExperience({ host, shell, audio, getWorld, isActive, exit, openTerminal, notice }) {
    const lifecycle = new AbortController();
    const listen = (target, type, callback, capture = false) => target.addEventListener(type, callback, { signal: lifecycle.signal, capture });
    let settings = readWorldSettings(), dialogue = new DialogueManager(settings.dialogue), idleAt = 0, lastMusicSave = 0, libraryGeneration = 0;
    const save = () => {
      settings = writeWorldSettings({ ...settings, cameras: readWorldSettings().cameras });
    };
    const root2 = document.createElement("div");
    root2.className = "world-experience-ui";
    root2.innerHTML = `
  <span class="world-crosshair" aria-hidden="true">+</span>
  <button id="world-menu-button" class="world-compact" type="button">☰ Menu · Esc</button>
  <output id="world-camera-status" class="world-compact">Câmera: Primeira pessoa · V</output><span id="world-connection" class="world-compact">● Sessão conectada</span>
  <output id="world-speech" role="status" hidden></output>
  <div id="world-combat" hidden><output id="world-combat-status"></output><div class="world-combat-actions"><button type="button" data-combat-action="light">J · Soco</button><button type="button" data-combat-action="heavy">K · Golpe forte</button><button type="button" data-combat-action="block">B · Bloquear</button><button type="button" data-combat-action="dodge">Q · Esquivar</button><button type="button" data-combat-action="taunt">T · Provocar</button><button type="button" data-combat-action="reset">R · Revanche</button></div></div>
  <dialog id="world-menu" class="world-dialog"><div class="world-dialog-head"><h2>Access World</h2><button data-world-close type="button">Voltar · Esc</button></div>
   <p id="world-tutorial">WASD mover · Shift correr · Espaço pular · arraste o mouse para olhar · duplo clique captura mouse · V alterna câmera · E interage · F ação extra · H/Tab HUD · M músicas.</p>
   <div class="world-options"><label>Cenário <select id="world-scene"><option value="aero">Frutiger Aero</option><option value="office">Network Ops</option><option value="arena">Router Rumble</option></select></label>
   <label>HUD <select id="world-hud-mode"><option value="auto">Ocultar automaticamente</option><option value="visible">Sempre visível</option><option value="hidden">Oculto</option></select></label>
   <label><input id="world-debug-toggle" type="checkbox"> Estatísticas de renderização</label>
   <label>Dificuldade da arena <select id="world-arena-difficulty"><option value="normal">Normal</option><option value="easy">Tranquila</option></select></label></div>
   <p>Na arena: J soco · K golpe forte · B bloqueio · Q esquiva · T provocação · R revanche. Combate fictício e local.</p>
   <div class="world-actions"><button id="world-open-music" type="button">Rádio / músicas</button><button id="world-open-dialogue" type="button">Falas do NPC</button><button id="world-open-tv" type="button">TV / YouTube</button><button id="world-return-interface" type="button">Voltar à interface</button></div>
  </dialog>
  <dialog id="world-radio" class="world-dialog"><div class="world-dialog-head"><h2>Rádio do plantão</h2><button data-world-close type="button">Voltar · Esc</button></div>
   <div class="world-actions"><button id="world-pick-files" type="button">Escolher músicas</button><button id="world-pick-folder" type="button">Escolher pasta</button><button id="world-forget-music" type="button">Limpar biblioteca</button></div>
   <input id="world-music-files" type="file" multiple accept="audio/*,.mp3,.ogg,.wav,.m4a,.flac" hidden><input id="world-music-folder" type="file" webkitdirectory multiple hidden>
   <div class="world-options"><label><input id="world-recursive" type="checkbox"> Incluir subpastas</label><label><input id="world-remember-music" type="checkbox"> Lembrar biblioteca e posição neste dispositivo</label><label>Ordenar <select id="world-music-order"><option value="name">Nome</option><option value="path">Pasta / caminho</option><option value="date">Data</option></select></label></div>
   <output id="world-radio-track" role="status">Escolha suas músicas locais.</output>
   <div class="world-actions"><button id="world-prev" type="button">Anterior</button><button id="world-play" type="button">Reproduzir</button><button id="world-next" type="button">Próxima</button></div>
   <label>Progresso <input id="world-seek" type="range" min="0" max="1" step="0.1" value="0"><output id="world-time">0:00 / 0:00</output></label>
   <div class="world-options"><label>Repetir <select id="world-repeat"><option value="off">Desligado</option><option value="track">Faixa</option><option value="playlist">Playlist</option></select></label><label><input id="world-shuffle" type="checkbox"> Aleatório</label><label>Volume <input id="world-radio-volume" type="range" min="0" max="1" step=".01"></label></div>
   <label>Faixas <select id="world-playlist" size="6" aria-label="Playlist"></select></label><p id="world-library-status" role="status">Áudio local. Nenhum arquivo é enviado.</p>
  </dialog>
  <dialog id="world-dialogue" class="world-dialog"><div class="world-dialog-head"><h2>Falas do roteador</h2><button data-world-close type="button">Voltar · Esc</button></div>
   <label>Evento / categoria <select id="world-trigger"></select></label>
   <div class="world-options"><label><input id="world-dialogue-enabled" type="checkbox"> Habilitado</label><label>Seleção <select id="world-dialogue-mode"><option value="random">Aleatória com pesos</option><option value="sequential">Sequencial</option></select></label><label>Intervalo (s) <input id="world-dialogue-cooldown" type="number" min="0" max="3600"></label></div>
   <p>Texto e peso de cada frase. Somente texto; não executa comandos.</p><div id="world-lines"></div>
   <div class="world-actions"><button id="world-add-line" type="button">Adicionar frase</button><button id="world-preview-line" type="button">Ouvir / testar</button></div><output id="world-line-preview" role="status"></output>
   <div class="world-options"><label><input id="world-tts" type="checkbox"> Falar em voz alta (se disponível)</label><label>Palavrões <select id="world-profanity"><option value="off">Ocultar</option><option value="moderado">Moderar</option><option value="livre/local">Livre / local</option></select></label></div>
  </dialog>
  <dialog id="world-tv" class="world-dialog world-tv-dialog"><div class="world-dialog-head"><h2>TV do Network Ops</h2><button data-world-close type="button">Voltar · Esc</button></div>
   <form id="world-tv-form"><label>Buscar no YouTube ou colar URL / ID <input id="world-youtube-url" type="text" maxlength="400" placeholder="Ex.: lo-fi para plantão ou https://youtu.be/…"></label><div class="world-actions"><button type="submit">Pesquisar / reproduzir</button><a id="world-youtube-external" target="_blank" rel="noopener noreferrer" hidden>Abrir vídeo no navegador</a></div></form>
   <div id="world-youtube-results" class="world-youtube-results" aria-live="polite"></div><p id="world-tv-status" role="status">Pesquise um vídeo. A reprodução aparece na televisão dentro do mundo 3D.</p>
  </dialog>`;
    host.append(root2);
    const $ = (id) => root2.querySelector("#" + id), dialogs = [...root2.querySelectorAll("dialog")], tv = new YouTubeTV(null, $("world-tv-status"));
    let speechTimer, lastTtsAt = 0, searchController;
    const abortSearch = () => {
      searchController?.abort();
      searchController = null;
    };
    $("world-tv").addEventListener("close", abortSearch, { signal: lifecycle.signal });
    function speak(trigger, preview = false) {
      if (!isActive() && !preview) return;
      const text2 = dialogue.choose(trigger, { preview, profanity: settings.profanity });
      if (!text2) return;
      if (preview) $("world-line-preview").textContent = text2;
      const bubble = $("world-speech");
      bubble.textContent = "Roteador: " + text2;
      bubble.hidden = false;
      clearTimeout(speechTimer);
      speechTimer = setTimeout(() => bubble.hidden = true, 5e3);
      if (settings.tts && window.speechSynthesis && window.SpeechSynthesisUtterance && Date.now() - lastTtsAt > 800) {
        lastTtsAt = Date.now();
        try {
          window.speechSynthesis.cancel();
          const utterance = new window.SpeechSynthesisUtterance(text2);
          utterance.lang = "pt-BR";
          window.speechSynthesis.speak(utterance);
        } catch {
        }
      }
    }
    function closeDialogs() {
      dialogs.forEach((d) => {
        if (d.open) d.close();
      });
    }
    function show(id) {
      closeDialogs();
      getWorld()?.setPaused(true);
      const d = $(id);
      d.showModal();
      d.querySelector("button,input,select")?.focus();
    }
    function applyHUD() {
      shell.classList.toggle("world-hud-visible", settings.hud === "visible");
      shell.classList.toggle("world-hud-hidden", settings.hud === "hidden");
      host.dataset.hud = settings.hud;
      $("world-hud-mode").value = settings.hud;
      host.classList.toggle("world-debug-visible", settings.debug);
    }
    function setScene(id) {
      const w = getWorld();
      if (!w?.setScene) {
        notice("Estes cenários estão disponíveis em Mundo 3D / Frutiger Aero.");
        return;
      }
      w.environmentSystem.difficulty = settings.arenaDifficulty;
      w.setScene(id);
      idleAt = Date.now();
      settings.scene = id;
      $("world-scene").value = id;
      save();
    }
    function persistTrack() {
      if (!settings.rememberMusic) return;
      settings.lastTrack = audio.playlist.current?.path || "";
      settings.position = audio.element?.currentTime || 0;
      save();
    }
    async function persistLibrary() {
      const generation3 = ++libraryGeneration;
      if (settings.rememberMusic) {
        try {
          await saveMusicLibrary(audio.playlist.items);
          if (generation3 === libraryGeneration) $("world-library-status").textContent = "Biblioteca salva neste dispositivo.";
        } catch {
          if (generation3 === libraryGeneration) $("world-library-status").textContent = "Não foi possível guardar as músicas. A playlist continua disponível nesta execução.";
        }
      } else await clearMusicLibrary().catch(() => {
      });
    }
    function list2() {
      const select = $("world-playlist");
      select.replaceChildren();
      audio.playlist.items.forEach((item, i) => {
        const option = document.createElement("option");
        option.value = String(i);
        option.textContent = item.name;
        select.append(option);
      });
      select.value = String(audio.playlist.index);
    }
    function updateAudio() {
      const element = audio.element, duration = Number.isFinite(element?.duration) ? element.duration : 0, position = element?.currentTime || 0;
      const fmt2 = (t) => Math.floor(t / 60) + ":" + String(Math.floor(t % 60)).padStart(2, "0");
      $("world-radio-track").textContent = audio.title;
      $("world-play").textContent = audio.active ? "Pausar" : "Reproduzir";
      $("world-playlist").value = String(audio.playlist.index);
      $("world-seek").max = String(duration || 1);
      $("world-seek").value = String(position);
      $("world-seek").disabled = !duration;
      $("world-time").textContent = fmt2(position) + " / " + fmt2(duration);
      if (Date.now() - lastMusicSave > 3e3) {
        lastMusicSave = Date.now();
        persistTrack();
      }
    }
    const oldChange = audio.onChange;
    audio.onChange = (state2) => {
      oldChange(state2);
      updateAudio();
    };
    async function importMusic(files) {
      try {
        audio.importFiles(files, { recursive: settings.recursive, order: settings.order });
        list2();
        await persistLibrary();
        await audio.playMusic();
      } catch (e) {
        $("world-library-status").textContent = e.message;
      }
    }
    root2.querySelectorAll("[data-world-close]").forEach((b) => b.onclick = () => b.closest("dialog").close());
    dialogs.forEach((d) => {
      d.addEventListener("close", () => {
        if (!dialogs.some((x) => x.open) && isActive()) getWorld()?.setPaused(false);
      });
      d.addEventListener("cancel", (e) => {
        e.preventDefault();
        d.close();
      });
    });
    $("world-menu-button").onclick = () => show("world-menu");
    $("world-return-interface").onclick = () => {
      closeDialogs();
      exit();
    };
    $("world-open-music").onclick = () => show("world-radio");
    $("world-open-dialogue").onclick = () => show("world-dialogue");
    $("world-open-tv").onclick = () => show("world-tv");
    root2.querySelectorAll("[data-combat-action]").forEach((button2) => button2.onclick = () => {
      const world = getWorld(), action = button2.dataset.combatAction;
      if (!world?.environmentSystem?.combat) return;
      const ok = world.performCombatAction?.(action) ?? (action === "reset" ? (world.environmentSystem.combat.reset(), true) : world.environmentSystem.action(action));
      if (!ok && ["light", "heavy"].includes(action)) notice("Aproxime-se do roteador ou aguarde o próximo golpe.");
      world.renderer?.domElement?.focus();
    });
    $("world-scene").value = settings.scene;
    $("world-scene").onchange = (e) => {
      setScene(e.target.value);
      closeDialogs();
    };
    $("world-hud-mode").onchange = (e) => {
      settings.hud = e.target.value;
      save();
      applyHUD();
    };
    $("world-debug-toggle").checked = settings.debug;
    $("world-debug-toggle").onchange = (e) => {
      settings.debug = e.target.checked;
      save();
      applyHUD();
    };
    $("world-arena-difficulty").value = settings.arenaDifficulty;
    $("world-arena-difficulty").onchange = (e) => {
      settings.arenaDifficulty = e.target.value;
      if (getWorld()?.environmentSystem?.combat) getWorld().environmentSystem.combat.difficulty = e.target.value;
      save();
    };
    $("world-pick-files").onclick = () => $("world-music-files").click();
    $("world-pick-folder").onclick = () => $("world-music-folder").click();
    for (const id of ["world-music-files", "world-music-folder"]) $(id).onchange = (e) => {
      importMusic(e.target.files);
      e.target.value = "";
    };
    $("world-forget-music").onclick = async () => {
      audio.pauseMusic({ immediate: true });
      audio.setPlaylist([]);
      audio.element?.removeAttribute("src");
      audio.title = "Nenhuma música instalada";
      audio.notify();
      settings.lastTrack = "";
      settings.position = 0;
      save();
      list2();
      await clearMusicLibrary().catch(() => {
      });
      $("world-library-status").textContent = "Biblioteca removida deste dispositivo.";
    };
    $("world-recursive").checked = settings.recursive;
    $("world-recursive").onchange = (e) => {
      settings.recursive = e.target.checked;
      save();
    };
    $("world-remember-music").checked = settings.rememberMusic;
    $("world-remember-music").onchange = async (e) => {
      settings.rememberMusic = e.target.checked;
      save();
      await persistLibrary();
    };
    $("world-music-order").value = settings.order;
    $("world-music-order").onchange = (e) => {
      const current = audio.playlist.current?.file, playing = audio.active;
      settings.order = e.target.value;
      const items = scanFiles(audio.playlist.items.map((i) => Object.assign(i.file, { path: i.path })), { order: settings.order });
      audio.setPlaylist(items, Math.max(0, items.findIndex((i) => i.file === current)));
      save();
      list2();
      persistLibrary();
      if (playing) audio.playMusic().catch((e2) => notice(e2.message));
    };
    $("world-playlist").onchange = async (e) => {
      audio.playlist.index = Number(e.target.value);
      audio.selectCurrent();
      try {
        await audio.playMusic();
      } catch (e2) {
        notice(e2.message);
      }
    };
    $("world-play").onclick = () => audio.toggle().catch((e) => notice(e.message));
    $("world-next").onclick = () => audio.advance().catch((e) => notice(e.message));
    $("world-prev").onclick = () => audio.previous().catch((e) => notice(e.message));
    $("world-seek").oninput = (e) => audio.seek(e.target.value);
    $("world-repeat").value = settings.repeat;
    audio.playlist.repeat = settings.repeat;
    $("world-repeat").onchange = (e) => {
      settings.repeat = e.target.value;
      audio.playlist.repeat = settings.repeat;
      save();
    };
    $("world-shuffle").checked = settings.shuffle;
    audio.playlist.shuffle = settings.shuffle;
    $("world-shuffle").onchange = (e) => {
      settings.shuffle = e.target.checked;
      audio.playlist.shuffle = settings.shuffle;
      audio.playlist.bag = [];
      save();
    };
    $("world-radio-volume").value = audio.volume;
    $("world-radio-volume").oninput = (e) => {
      audio.setMasterVolume(e.target.value);
      const original = document.querySelector("#world-volume");
      original.value = e.target.value;
      original.dispatchEvent(new Event("input"));
    };
    for (const trigger of triggers) {
      const option = document.createElement("option");
      option.value = trigger;
      option.textContent = trigger;
      $("world-trigger").append(option);
    }
    let selected2 = "world_enter";
    function saveRule() {
      const rule = settings.dialogue[selected2];
      rule.enabled = $("world-dialogue-enabled").checked;
      rule.mode = $("world-dialogue-mode").value;
      rule.cooldownSeconds = Number($("world-dialogue-cooldown").value);
      rule.lines = [...$("world-lines").children].map((row) => ({ text: row.querySelector("input[type=text]").value, weight: Number(row.querySelector("input[type=number]").value) }));
      settings.dialogue = normalizeDialogue(settings.dialogue);
      dialogue.rules = settings.dialogue;
      save();
    }
    function lineRow(line2) {
      const row = document.createElement("div");
      row.className = "world-line-row";
      const text2 = document.createElement("input");
      text2.type = "text";
      text2.maxLength = 400;
      text2.value = line2.text;
      text2.setAttribute("aria-label", "Texto da frase");
      const weight = document.createElement("input");
      weight.type = "number";
      weight.min = ".01";
      weight.max = "100";
      weight.step = ".01";
      weight.value = String(line2.weight);
      weight.setAttribute("aria-label", "Peso da frase");
      const remove = document.createElement("button");
      remove.type = "button";
      remove.textContent = "Remover";
      remove.onclick = () => {
        row.remove();
        saveRule();
      };
      text2.onchange = saveRule;
      weight.onchange = saveRule;
      row.append(text2, weight, remove);
      $("world-lines").append(row);
    }
    function paintRule() {
      const r = settings.dialogue[selected2];
      $("world-dialogue-enabled").checked = r.enabled;
      $("world-dialogue-mode").value = r.mode;
      $("world-dialogue-cooldown").value = String(r.cooldownSeconds);
      $("world-lines").replaceChildren();
      r.lines.forEach(lineRow);
    }
    $("world-trigger").onchange = (e) => {
      selected2 = e.target.value;
      paintRule();
    };
    for (const id of ["world-dialogue-enabled", "world-dialogue-mode", "world-dialogue-cooldown"]) $(id).onchange = saveRule;
    $("world-add-line").onclick = () => {
      lineRow({ text: "Nova frase", weight: 1 });
      saveRule();
    };
    $("world-preview-line").onclick = () => {
      saveRule();
      speak(selected2, true);
    };
    $("world-tts").checked = settings.tts;
    $("world-tts").onchange = (e) => {
      settings.tts = e.target.checked;
      save();
    };
    $("world-profanity").value = settings.profanity;
    $("world-profanity").onchange = (e) => {
      settings.profanity = e.target.value;
      save();
    };
    paintRule();
    $("world-youtube-url").value = settings.youtube;
    function tvHost() {
      return getWorld()?.environmentSystem?.tvSurface || null;
    }
    async function playYouTubeSelection(value2, label = "Vídeo") {
      const data = parseYouTube(value2);
      tv.attach(tvHost());
      await tv.play(value2);
      settings.youtube = value2;
      save();
      $("world-youtube-url").value = value2;
      $("world-youtube-external").href = youtubeURL(data);
      $("world-youtube-external").hidden = false;
      $("world-tv-status").textContent = `${label} carregado na televisão 3D.`;
    }
    function paintYouTubeResults(results) {
      const box = $("world-youtube-results");
      box.replaceChildren();
      if (!results.length) {
        box.textContent = "Nenhum vídeo encontrado.";
        return;
      }
      for (const item of results) {
        const button2 = document.createElement("button");
        button2.type = "button";
        button2.className = "world-youtube-result";
        const img = document.createElement("img");
        img.alt = "";
        img.loading = "lazy";
        img.src = item.thumbnail || "";
        const meta2 = document.createElement("span");
        const title = document.createElement("strong");
        title.textContent = item.title || "Vídeo";
        const detail = document.createElement("small");
        detail.textContent = [item.channel, item.duration].filter(Boolean).join(" · ");
        meta2.append(title, detail);
        button2.append(img, meta2);
        button2.onclick = async () => {
          try {
            await playYouTubeSelection(item.videoId, item.title || "Vídeo");
          } catch (error) {
            $("world-tv-status").textContent = error.message;
          }
        };
        box.append(button2);
      }
    }
    $("world-tv-form").onsubmit = async (e) => {
      e.preventDefault();
      const value2 = $("world-youtube-url").value.trim();
      const submit = e.submitter || $("world-tv-form").querySelector('button[type="submit"]');
      $("world-youtube-results").replaceChildren();
      $("world-tv-status").textContent = looksLikeYouTubeReference(value2) ? "Carregando vídeo na televisão 3D…" : "Pesquisando vídeos dentro do Access Manager…";
      if (submit) submit.disabled = true;
      try {
        if (looksLikeYouTubeReference(value2)) {
          await playYouTubeSelection(value2);
          return;
        }
        abortSearch();
        searchController = new AbortController();
        const results = await searchYouTube(value2, { signal: searchController.signal });
        if (!isActive() || !$("world-tv").open) return;
        paintYouTubeResults(results);
        $("world-tv-status").textContent = results.length ? `${results.length} resultado(s). Escolha um vídeo para reproduzir na TV 3D.` : "Nenhum vídeo encontrado.";
      } catch (error) {
        $("world-tv-status").textContent = error.message || "Não foi possível pesquisar no YouTube agora.";
      } finally {
        if (submit) submit.disabled = false;
      }
    };
    const keydown = (e) => {
      if (!isActive()) return;
      const target = e.target;
      if (e.key === "Escape") {
        if (document.querySelector("#action-dialog")?.open || document.querySelector("#service-dialog")?.open || shell.classList.contains("world-panel-open")) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        const open = dialogs.find((d) => d.open);
        if (open) open.close();
        else if (!document.querySelector("#world-scanner")?.hidden) {
          document.querySelector("#world-scanner").hidden = true;
          getWorld()?.setPaused(false);
        } else show("world-menu");
        return;
      }
      if (dialogs.some((d) => d.open) || target.closest?.("input,textarea,select,[contenteditable]") || shell.classList.contains("world-panel-open")) return;
      if (["KeyH", "Tab", "KeyM"].includes(e.code)) {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (e.code === "KeyM") show("world-radio");
        else {
          settings.hud = settings.hud === "visible" ? "auto" : "visible";
          save();
          applyHUD();
        }
      }
      idleAt = Date.now();
    };
    listen(document, "keydown", keydown, true);
    listen(host, "world-interaction", (e) => {
      switch (e.detail.kind) {
        case "dialogue":
          speak(e.detail.trigger);
          break;
        case "focus":
          host.dataset.interaction = e.detail.label;
          break;
        case "message":
          $("world-speech").textContent = e.detail.text;
          $("world-speech").hidden = false;
          clearTimeout(speechTimer);
          speechTimer = setTimeout(() => $("world-speech").hidden = true, 5e3);
          break;
        case "scene":
          setScene(e.detail.scene);
          break;
        case "tv_surface":
          tv.attach(e.detail.host);
          break;
        case "tv":
          tv.attach(tvHost());
          show("world-tv");
          break;
        case "music":
          show("world-radio");
          break;
        case "terminal":
          openTerminal();
          break;
      }
    });
    let connected = false;
    listen(document, "app-context-ready", () => {
      const next = Boolean(window.__amStore?.session?.connected);
      if (next !== connected) {
        speak(next ? "device_connected" : "device_disconnected");
        connected = next;
      }
    });
    listen(document, "world-operation", (e) => {
      if (!isActive() || getWorld()?.environmentSystem?.sceneId === "arena") return;
      const { stage, path: path2, ok } = e.detail;
      if (/diagnostic/.test(path2)) speak(stage === "start" ? "diagnostic_started" : ok ? "diagnostic_ok" : "diagnostic_failed");
      if (stage === "end" && ok && e.detail.passwordChanged) speak("password_changed");
    });
    listen(document, "service-log-copied", () => speak("service_log_copied"));
    function telemetry() {
      if (!isActive()) return;
      const snap = window.__amStore?.snapshot;
      if (snap?.session_id && snap.session_id !== window.__amStore?.session?.session?.session_id) return;
      let state2 = "online";
      const clients = snap?.clients?.data ?? snap?.clients, optical = snap?.optical?.data ?? snap?.optical, wan2 = snap?.wan?.data ?? snap?.wan;
      if (Array.isArray(clients) && clients.some((c) => c.rssi != null && Number(c.rssi) < -75)) state2 = "weak_wifi";
      if (Array.isArray(wan2) && wan2.some((w) => /pppoe/i.test(w.connection_type || "") && /disconnected|down|failed/i.test(w.status || ""))) state2 = "pppoe_issue";
      const rx = optical?.rx_dbm ?? optical?.rx;
      if (rx != null && Number.isFinite(Number(rx)) && (Number(rx) < -27 || Number(rx) > -8)) state2 = "optical_issue";
      if (getWorld()?.environmentSystem?.sceneId !== "arena") {
        getWorld()?.environmentSystem?.setDiagnostic(state2);
        if (state2 !== "online") speak(state2);
      }
    }
    listen(document, "device-snapshot", telemetry);
    applyHUD();
    if (settings.rememberMusic) loadMusicLibrary().then((items) => {
      if (!items.length || audio.playlist.items.length) return;
      const savedPosition = settings.position;
      audio.setPlaylist(items, Math.max(0, items.findIndex((i) => i.path === settings.lastTrack)));
      if (audio.element) audio.element.onloadedmetadata = () => audio.seek(savedPosition);
      list2();
    }).catch(() => {
    });
    return { entered() {
      applyHUD();
      if (getWorld()?.setScene && getWorld().sceneId !== settings.scene) setScene(settings.scene);
      idleAt = Date.now();
      speak("world_enter");
      if (!settings.tutorialSeen) {
        settings.tutorialSeen = true;
        save();
        show("world-menu");
      }
    }, exited() {
      abortSearch();
      speak("world_exit");
      persistTrack();
      closeDialogs();
      tv.destroy();
      window.speechSynthesis?.cancel();
      shell.classList.remove("world-hud-visible", "world-hud-hidden");
    }, frame(detail) {
      $("world-combat").hidden = !detail.combat;
      if (detail.combat) {
        const c = detail.combat, inRange = Number(c.distance) <= 3;
        $("world-combat-status").textContent = `Você ${c.hp}/100 · Roteador ${c.npcHp}/100 · Combo ${c.combo} · ${Number(c.distance).toFixed(1)}m ${c.result === "win" ? "— Vitória! R para revanche" : c.result === "lose" ? "— Derrota! R para revanche" : inRange ? "— alcance de golpe" : "— aproxime-se para bater"}`;
        for (const b of root2.querySelectorAll("[data-combat-action]")) b.disabled = b.dataset.combatAction !== "reset" && (Boolean(c.result) || (b.dataset.combatAction === "light" || b.dataset.combatAction === "heavy") && c.cooldown > 0);
      }
      if (Date.now() - idleAt > 6e4) {
        idleAt = Date.now();
        speak("idle");
      }
      if (settings.debug) {
        document.querySelector("#world-debug").textContent += ` · ${detail.drawCalls ?? "?"} draws · ${detail.triangles ?? "?"} tris · ${detail.loadedAssets ?? 0} GLB · ${detail.memory?.geometries ?? "?"} geometrias`;
      }
    }, dispose() {
      abortSearch();
      lifecycle.abort();
      clearTimeout(speechTimer);
      tv.destroy();
      audio.onChange = oldChange;
      root2.remove();
    } };
  }

  // apps/access_manager/static/js/world/bridge.js
  function mountWorldBridge({ store: store2, theme, registry, navigate, suspend, resume }) {
    const shell = document.querySelector(".app-shell"), host = document.querySelector("#aero-world");
    if (!host) return;
    const button2 = document.querySelector("#world-toggle"), close = document.querySelector("#world-close-panel"), notice = document.querySelector("#world-notice");
    const experience = document.querySelector("#world-experience");
    let mode = "world3d", namespace = null;
    const cache = /* @__PURE__ */ new Map();
    let world = null, loading = null, entering = false, generation3 = 0, active2 = false, panel3 = false, contextKey = "", signature = "", currentRegions = [];
    const getContext = () => store2.session?.session;
    const key = () => `${mode}:${getContext()?.vendor || "router"}:${getContext()?.session_id || "session"}`;
    const unavailable2 = (message) => {
      notice.textContent = message;
      notice.hidden = !message;
    };
    let musicActive = false;
    const updateSound = () => {
      document.querySelector("#world-music").setAttribute("aria-pressed", String(musicActive || ambient.active));
      document.querySelector("#world-ambient").setAttribute("aria-pressed", String(ambient.active));
      document.querySelector("#world-music").textContent = musicActive || ambient.active ? "♪ Silenciar tudo" : "♪ Reproduzir";
      document.querySelector("#world-ambient").textContent = ambient.active ? "Ambiente: ligado" : "Ambiente: desligado";
    };
    const ambient = new FieldAudio({ volume: readPreference("volume", ".35"), onChange: updateSound });
    const audio = new AudioManager({ volume: readPreference("volume", ".35"), enabled: readPreference("enabled", "false") === "true", onChange: (state2) => {
      musicActive = state2.active;
      document.querySelector("#world-track").textContent = state2.title;
      document.querySelector("#world-music").textContent = state2.active ? "♪ Silenciar" : "♪ Reproduzir";
      document.querySelector("#world-music").setAttribute("aria-pressed", String(state2.active || ambient.active));
      updateSound();
    } });
    const worldExperience = mountWorldExperience({ host, shell, audio, getWorld: () => world, isActive: () => active2, exit: () => exit(), openTerminal: () => {
      const region = currentRegions.find((r) => r.routeId === "overview") || currentRegions[0];
      if (region) openPanel(region);
    }, notice: unavailable2 });
    function closePanel() {
      if (!active2 || !panel3) return;
      document.querySelector("#action-dialog")?.close();
      panel3 = false;
      shell.classList.remove("world-panel-open");
      close.hidden = true;
      refreshContext();
      suspend();
      world?.setPaused(false);
    }
    async function openPanel(region) {
      if (!active2 || !currentRegions.some((r) => r.id === region.id)) return;
      if (region.interactionType === "service") {
        document.dispatchEvent(new CustomEvent("open-service"));
        return;
      }
      panel3 = true;
      shell.classList.add("world-panel-open");
      close.hidden = false;
      world.setPaused(true);
      const source = key();
      await navigate(region.routeId);
      if (source !== key() || !active2) return;
      if (region.actionId) {
        const action = registry.flatMap((r) => r.actions || []).find((a) => a.id === region.actionId);
        if (action?.available()) try {
          await action.run();
        } catch (error) {
          unavailable2(error.message);
        }
      }
      close.focus();
    }
    function load() {
      const name = mode === "wasteland" ? "AccessManagerWasteland" : mode === "voxel" ? "AccessManagerVoxel" : "AccessManagerWorld";
      if (window[name]) return Promise.resolve(window[name]);
      if (loading) return loading;
      loading = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = mode === "wasteland" ? host.dataset.wastelandBundle : mode === "voxel" ? host.dataset.voxelBundle : host.dataset.bundle;
        script.onload = () => window[name] ? resolve(window[name]) : reject(new Error("Renderer indisponível"));
        script.onerror = () => {
          script.remove();
          reject(new Error("Não foi possível carregar o módulo 3D local."));
        };
        document.head.append(script);
      }).finally(() => loading = null);
      return loading;
    }
    function remember() {
      if (world && contextKey) cache.set(contextKey, world.getState());
    }
    function refreshContext() {
      if (!store2.session?.connected) return;
      const regions = withFieldRegions(deriveWorldRegions(registry, getContext(), store2.capabilities), mode), next = key(), nextSignature = JSON.stringify(regions);
      if (next === contextKey && nextSignature === signature) return;
      currentRegions = regions;
      host.dataset.layout = getContext()?.vendor === "juniper" ? "juniper" : "router";
      host.dataset.regionCount = String(regions.length);
      document.querySelector("#world-context-label").textContent = host.dataset.layout === "juniper" ? "Backbone, BNG e assinantes" : mode === "wasteland" ? "Postos, enlaces e operações" : "Natureza, internet e telecom";
      if (world && next !== contextKey) {
        remember();
        world.dispose();
        world = null;
      }
      contextKey = next;
      signature = nextSignature;
      if (world) world.setRegions(regions);
      else if (active2 && namespace) createWorld();
    }
    function createWorld() {
      world = new namespace.WorldRenderer(host, { regions: currentRegions, layout: host.dataset.layout, interact: openPanel, onError: (message) => {
        exit({ persist: false });
        world?.dispose();
        world = null;
        unavailable2(message);
      }, modelURL: mode === "wasteland" ? host.dataset.wastelandModel : host.dataset.model });
      world.restoreState(cache.get(contextKey));
      world.applyQuality(readPreference("quality", readPreference("am-world-quality", "medium")));
      document.querySelector("#world-quality").value = world.quality;
      world.setPaused(panel3);
      if (active2) world.start();
    }
    function exit({ persist = true } = {}) {
      worldExperience.exited();
      generation3++;
      active2 = false;
      entering = false;
      button2.disabled = false;
      panel3 = false;
      remember();
      world?.stop();
      audio.pauseMusic();
      ambient.pause();
      host.hidden = true;
      close.hidden = true;
      shell.classList.remove("world-mode", "world-panel-open", "wasteland-mode");
      button2.textContent = "Mundo 3D";
      button2.setAttribute("aria-pressed", "false");
      if (persist) {
        savePreference("experience", "interface");
        if (experience) experience.value = "interface";
      }
      if (store2.session?.connected) resume();
      button2.focus();
    }
    async function enter(nextMode = "world3d") {
      if (entering) return;
      if (!["world3d", "voxel", "wasteland"].includes(nextMode)) nextMode = "world3d";
      if (active2 && mode !== nextMode) exit({ persist: false });
      if (mode !== nextMode) {
        remember();
        world?.dispose();
        world = null;
        contextKey = "";
        signature = "";
        mode = nextMode;
      }
      if (experience) experience.value = mode;
      host.dataset.experience = mode;
      shell.classList.toggle("wasteland-mode", mode === "wasteland");
      host.setAttribute("aria-label", mode === "wasteland" ? "Wasteland Ops 3D" : "Exploração Access World");
      document.querySelector("#world-title").textContent = mode === "wasteland" ? "FIELD OPS 3D" : "Access World";
      document.querySelector("#world-ambient").hidden = mode !== "wasteland";
      document.querySelector("#field-telemetry").hidden = mode !== "wasteland";
      document.querySelector("#world-map").hidden = false;
      if (entering || active2 || !store2.session?.connected) return;
      entering = true;
      const token = ++generation3;
      button2.disabled = true;
      if (experience) experience.disabled = true;
      button2.textContent = "Carregando Access World…";
      unavailable2("");
      try {
        namespace = await load();
        if (token !== generation3 || !store2.session?.connected) return;
        refreshContext();
        host.hidden = false;
        if (!world) createWorld();
        theme.apply(mode === "wasteland" ? "terminal" : "aero");
        active2 = true;
        shell.classList.add("world-mode");
        suspend();
        world.setPaused(false);
        world.start();
        button2.textContent = "Voltar à interface";
        button2.setAttribute("aria-pressed", "true");
        savePreference("experience", mode);
        await audio.loadInstalled(host.dataset.audioManifest);
        audio.notify();
        worldExperience.entered();
      } catch (error) {
        world?.dispose();
        world = null;
        active2 = false;
        shell.classList.remove("world-mode");
        theme.apply(mode === "wasteland" ? "terminal" : "aero");
        savePreference("experience", "interface");
        unavailable2(`${error.message} A interface convencional continua disponível.`);
        button2.textContent = "Mundo 3D";
        host.hidden = true;
      } finally {
        entering = false;
        button2.disabled = false;
        if (experience) experience.disabled = false;
      }
    }
    button2.onclick = () => active2 ? exit() : enter(["voxel", "wasteland"].includes(experience?.value) ? experience.value : "world3d");
    if (experience) experience.onchange = () => experience.value === "interface" ? exit() : enter(experience.value);
    close.onclick = closePanel;
    document.querySelector("#world-theme").onclick = () => theme.apply(theme.theme === "aero" ? "terminal" : "aero");
    document.addEventListener("theme-changed", (e) => {
      if (active2 && (e.detail === "terminal" && mode !== "wasteland" || e.detail === "aero" && mode === "wasteland")) exit();
    });
    document.querySelector("#world-quality").onchange = (e) => {
      world?.applyQuality(e.target.value);
      savePreference("quality", e.target.value);
      world?.renderer.domElement.focus();
    };
    document.querySelector("#world-music").onclick = async () => {
      try {
        if (ambient.active || audio.active) {
          ambient.pause();
          audio.setEnabled(false);
        } else await audio.toggle();
        savePreference("enabled", audio.enabled);
      } catch (error) {
        unavailable2(error.message);
      }
    };
    document.querySelector("#world-volume").value = audio.volume;
    document.querySelector("#world-volume").oninput = (e) => {
      audio.setMasterVolume(e.target.value);
      ambient.setVolume(e.target.value);
      savePreference("volume", audio.volume);
    };
    document.querySelector("#world-ambient").onclick = async () => {
      try {
        await ambient.toggle();
      } catch (error) {
        unavailable2(error.message);
      }
    };
    document.querySelector("#world-audio-settings").onclick = () => document.querySelector("#world-audio-file").click();
    document.querySelector("#world-audio-file").onchange = async (e) => {
      try {
        audio.importFile(e.target.files[0]);
        await audio.playMusic();
        savePreference("enabled", audio.enabled);
      } catch (error) {
        unavailable2(error.message);
      } finally {
        e.target.value = "";
      }
    };
    document.querySelector("#world-audio-loop").checked = readPreference("accessManager.audio.loop", "true") === "true";
    audio.setLoop(document.querySelector("#world-audio-loop").checked);
    document.querySelector("#world-audio-loop").onchange = (e) => {
      audio.setLoop(e.target.checked);
      savePreference("accessManager.audio.loop", e.target.checked);
    };
    document.querySelector("#world-gamification").onchange = (e) => {
      document.querySelector("#world-inventory").hidden = !e.target.checked;
      savePreference("am-world-gamification", e.target.checked);
    };
    const gamification = readPreference("am-world-gamification", "true") === "true";
    document.querySelector("#world-gamification").checked = gamification;
    document.querySelector("#world-inventory").hidden = !gamification;
    document.querySelector("#world-service").onclick = () => document.dispatchEvent(new CustomEvent("open-service"));
    host.addEventListener("world-scan", (e) => {
      const scan = document.querySelector("#world-scanner");
      scan.hidden = !scan.hidden;
      if (mode === "wasteland") world?.setPaused(!scan.hidden);
      scan.replaceChildren();
      for (const region of e.detail) {
        const b = document.createElement("button");
        b.className = "button";
        b.textContent = region.label;
        b.onclick = () => {
          scan.hidden = true;
          openPanel(region);
        };
        scan.append(b);
      }
      if (mode === "wasteland" && !scan.hidden) scan.querySelector("button")?.focus();
    });
    document.addEventListener("locate-world-route", async (e) => {
      await enter("voxel");
      const region = currentRegions.find((r) => r.routeId === e.detail.routeId);
      if (region) {
        unavailable2(`Localização: ${region.label}. O painel mostra a tabela real de clientes; não representa localização física.`);
        const state2 = world.getState();
        state2.player = { ...state2.player, x: region.x, z: region.z + 6, y: 0 };
        world.restoreState(state2);
      } else unavailable2("Região não disponível nesta sessão.");
    });
    host.addEventListener("world-service", () => document.dispatchEvent(new CustomEvent("open-service")));
    host.addEventListener("world-map-toggle", () => {
      const map2 = document.querySelector("#world-map");
      map2.hidden = !map2.hidden;
    });
    const modal = document.querySelector("#service-dialog");
    modal?.addEventListener("close", () => {
      if (active2 && !panel3) world?.setPaused(false);
    });
    const modalObserver = new MutationObserver(() => {
      if (active2 && modal?.open) world?.setPaused(true);
    });
    if (modal) modalObserver.observe(modal, { attributes: true, attributeFilter: ["open"] });
    const map = document.querySelector("#world-map");
    let ctx;
    host.addEventListener("focusin", () => {
      ctx ?? (ctx = map.getContext?.("2d"));
    });
    host.addEventListener("world-frame", (e) => {
      const { player, hotspot, fps, visited, total } = e.detail;
      document.querySelector("#world-prompt").textContent = e.detail.interaction ? `[E] ${e.detail.interaction}` : mode !== "world3d" && hotspot ? `E · ${mode === "wasteland" ? "Acessar " + (hotspot.worldLabel || hotspot.label) : "Inspecionar " + hotspot.label}` : mode === "wasteland" ? "WASD · Shift · Espaço · E acessar · T terminal · V câmera · M mapa · L atendimento" : mode === "voxel" ? "WASD · Shift · Espaço · E interagir · F scanner · V câmera" : "WASD mover · E interagir · V câmera · M rádio · Esc menu";
      document.querySelector("#world-debug").textContent = `${fps} FPS · ${world.quality} · ${world.modelStatus || "Mascote procedural"}`;
      document.querySelector("#world-inventory").textContent = `Exploração: ${visited}/${total} regiões visitadas`;
      worldExperience.frame(e.detail);
      document.querySelector("#field-sector").textContent = hotspot?.worldLabel || hotspot?.label || "Área de operações";
      if (ctx) {
        ctx.fillStyle = mode === "wasteland" ? "#0b120d" : host.dataset.layout === "juniper" ? "#e0f2fa" : "#e2f4d1";
        ctx.fillRect(0, 0, 180, 180);
        ctx.font = "13px sans-serif";
        ctx.textAlign = "center";
        for (const h of currentRegions) {
          ctx.fillStyle = "#" + h.color.toString(16).padStart(6, "0");
          ctx.fillText(minimapGlyph[h.kind] || "●", 90 + h.x * 1.5, 93 + h.z * 1.5);
        }
        ctx.fillStyle = mode === "wasteland" ? "#7dff9c" : "#123c60";
        ctx.beginPath();
        ctx.arc(90 + player.x * 1.5, 90 + player.z * 1.5, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && active2) {
        if (document.querySelector("#action-dialog")?.open || document.querySelector("#service-dialog")?.open) return;
        const scanner = document.querySelector("#world-scanner");
        if (!scanner.hidden) {
          scanner.hidden = true;
          world?.setPaused(false);
          world?.renderer.domElement.focus();
          return;
        }
        if (panel3) closePanel();
        else exit();
      }
    });
    const contextChanged = () => queueMicrotask(() => {
      if (!store2.session?.connected) {
        if (active2 || entering) exit({ persist: false });
        world?.dispose();
        world = null;
        cache.clear();
        contextKey = "";
        signature = "";
        return;
      }
      refreshContext();
    });
    for (const event of ["app-context-ready", "capabilities", "subscriber-context-changed"]) document.addEventListener(event, contextChanged);
    const paintTelemetry = () => {
      const snap = store2.snapshot?.session_id === getContext()?.session_id ? store2.snapshot : null, wan2 = snap?.wan?.data ?? snap?.wan, clients = snap?.clients?.data ?? snap?.clients;
      const rows3 = Array.isArray(wan2) ? wan2 : [];
      document.querySelector("#field-wan").textContent = rows3[0]?.status || "Não coletada";
      document.querySelector("#field-clients").textContent = Array.isArray(clients) ? clients.length : "Não coletados";
      const ping2 = [...service.entries].reverse().find((e) => e.path === "/api/device/diagnostics/ping" && e.session === getContext()?.session_id && e.ok !== false);
      document.querySelector("#field-latency").textContent = Number.isFinite(ping2?.data?.avg_ms) ? ping2.data.avg_ms + " ms" : "Não testada";
      document.querySelector("#field-loss").textContent = Number.isFinite(ping2?.data?.loss_percent) ? ping2.data.loss_percent + "%" : "Não testada";
    };
    document.addEventListener("device-snapshot", paintTelemetry);
    document.addEventListener("app-context-ready", paintTelemetry);
    const unsubscribeTelemetry = subscribeService(paintTelemetry);
    paintTelemetry();
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        audio.pauseMusic();
        ambient.pause();
      }
    });
    window.addEventListener("pagehide", () => {
      world?.dispose();
      audio.dispose();
      ambient.dispose();
      worldExperience.dispose();
      modalObserver.disconnect();
      unsubscribeTelemetry();
      cache.clear();
    });
    return { openPanel, exit, enter, unavailable: unavailable2, get active() {
      return active2;
    } };
  }

  // apps/access_manager/static/js/services/api.js
  var ApiError = class extends Error {
    constructor(message, { code, type, retryable = false, status: status3, request_id, health: health2 } = {}) {
      super(message);
      this.name = "ApiError";
      Object.assign(this, { code, type, retryable, status: status3, request_id, health: health2 });
    }
  };
  function parseResponseBody(text2) {
    if (!text2) return {};
    try {
      return JSON.parse(text2);
    } catch (_) {
      return { raw: text2 };
    }
  }
  async function request(path2, options = {}) {
    const { scope = defaultScope(path2, options), forceRefresh = false, onResult, ...fetchOptions } = options;
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
    const start = performance.now(), epoch = revision, operationRoute = window.__amStore?.view, operationSession = window.__amStore?.session?.session?.session_id ?? null;
    if (/\/diagnostics\//.test(path2)) document.dispatchEvent(new CustomEvent("world-operation", { detail: { stage: "start", path: path2 } }));
    let reported = false;
    const work = (async () => {
      const url = new URL(path2, window.location.origin);
      const res = await fetch(url, { credentials: "same-origin", ...fetchOptions, signal: read2 ? fetchOptions.signal || scope?.controller.signal : fetchOptions.signal, headers: { "Content-Type": "application/json", ...options.headers || {} } });
      const text2 = await res.text(), data = parseResponseBody(text2);
      if (/\/diagnostics\/|\/password|\/wifi\/ssid/.test(path2)) document.dispatchEvent(new CustomEvent("world-operation", { detail: { stage: "end", path: path2, ok: res.ok && data?.success !== false, passwordChanged: method !== "GET" && (/password/.test(path2) || /"(?:password|new_password|senha|psk)"\s*:/.test(String(options.body || ""))) } }));
      reported = true;
      onResult?.(data, res.ok && data?.success !== false);
      if (operationSession === (window.__amStore?.session?.session?.session_id ?? null)) window.__amObserveOperation?.(path2, method, options.body, data, res.ok && data?.success !== false, operationRoute);
      if (!read2 && !["/api/device/wifi/reveal-password", "/api/device/traffic/history", "/api/profiles/preview", "/api/profiles/capture", "/api/triage", "/api/device/diagnostics/ping", "/api/device/diagnostics/traceroute", "/api/device/diagnostics/dns-lookup", "/api/device/diagnostics/speedtest-discovery", "/api/device/configuration/read", "/api/device/configuration/preview", "/api/device/factory-reset/preview", "/api/device/diagnostics/speedtest/poll", "/api/device/diagnostics/workstation", "/api/device/diagnostics/full/run", "/api/device/diagnostics/full/history", "/api/device/diagnostics/full/export", "/api/device/traffic/device-history", "/api/management/artifacts/download"].includes(path2)) clearSnapshots();
      if (!scopeActive(scope) || canCache && epoch !== revision) throw cancelled();
      if (!res.ok || data?.success === false) {
        const details2 = data?.error || {};
        const error = new ApiError(details2.message || data?.message || (!res.ok ? `HTTP ${res.status} ao acessar ${url.pathname}` : "Falha na operação"), { ...details2, status: res.status });
        if (path2.startsWith("/api/infrastructure/")) document.dispatchEvent(new CustomEvent("juniper-read-state", { detail: { failed: true, code: error.code, health: error.health, transportFailure: ["CONNECTION_TIMEOUT", "SSH_UNAVAILABLE", "NETCONF_UNAVAILABLE"].includes(error.code) } }));
        throw error;
      }
      if (path2.startsWith("/api/infrastructure/") && !path2.endsWith("/operations") && !path2.includes("/settings") && !path2.includes("/host-key")) document.dispatchEvent(new CustomEvent("juniper-read-state", { detail: { failed: Boolean(data?.health?.last_read_failed), health: data?.health, transportFailure: Boolean(data?.health?.last_transport_failure) } }));
      if (canCache) {
        const safe = clean(data);
        snapshots.set(path2, { time: Date.now(), data: safe });
        return clone(safe);
      }
      return data;
    })().catch((e) => {
      if (!reported && /\/diagnostics\//.test(path2)) document.dispatchEvent(new CustomEvent("world-operation", { detail: { stage: "end", path: path2, ok: false } }));
      if (!scopeActive(scope) || isCancelled(e)) throw cancelled();
      if (!reported && operationSession === (window.__amStore?.session?.session?.session_id ?? null)) window.__amObserveOperation?.(path2, method, options.body, { status: "Resposta indisponível", error: { message: e.message } }, false, operationRoute);
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
  var store = { session: null, capabilities: {}, snapshot: null, view: "overview", setSession(v) {
    this.session = v;
    if (!v?.connected) this.snapshot = null;
    renderContext();
  }, setCapabilities(v) {
    this.capabilities = v || {};
    document.dispatchEvent(new CustomEvent("capabilities"));
  }, setSnapshot(v) {
    this.snapshot = v || null;
    document.dispatchEvent(new CustomEvent("device-snapshot", { detail: this.snapshot }));
  } };
  function renderContext() {
    const s = store.session?.session;
    document.querySelector("#ctx-vendor").textContent = s?.vendor?.toUpperCase() || "—";
    document.querySelector("#ctx-model").textContent = s?.model || "Sem equipamento";
    const scheme = s?.metadata?.scheme;
    const host = s?.vendor === "juniper" && s?.host?.includes(":") ? `[${s.host}]` : s?.host;
    const endpoint = s?.vendor === "juniper" && s?.metadata?.port ? `${host}:${s.metadata.port}` : host;
    document.querySelector("#ctx-host").textContent = host ? scheme ? `${scheme}://${endpoint}` : endpoint : "—";
    const online = Boolean(store.session?.connected);
    const status3 = document.querySelector("#ctx-status");
    const degraded = s?.vendor === "juniper" && Boolean(s?.metadata?.last_transport_failure || s?.metadata?.transport_active === false);
    status3.textContent = degraded ? "● Degradado" : online ? "● Online" : "○ Desconectado";
    status3.title = degraded ? "Última consulta de transporte falhou. Verifique a sessão." : s?.metadata?.last_read_failed ? "Última leitura falhou; transporte permanece ativo." : "";
    status3.style.color = degraded ? "var(--warning)" : online ? "var(--success)" : "";
    status3.dataset.health = degraded ? "degraded" : online ? "online" : "offline";
  }
  document.addEventListener("juniper-read-state", (event) => {
    const s = store.session?.session;
    if (s?.vendor !== "juniper") return;
    const d = event.detail;
    s.metadata = { ...s.metadata, ...d.health || {}, last_read_failed: d.failed };
    if (!d.failed) {
      s.metadata.last_transport_failure = false;
      s.metadata.transport_active = true;
      s.metadata.last_read_code = null;
    } else if (d.transportFailure) {
      s.metadata.last_transport_failure = true;
      s.metadata.last_read_code = d.code;
    }
    renderContext();
  });

  // apps/access_manager/static/js/shared/ui.js
  var esc = (value2) => String(value2 ?? "—").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  var pick2 = (obj, ...keys) => {
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
    return `<div class="panel"><table class="data-table"><thead><tr>${columns2.map((c) => `<th>${esc(c.label)}</th>`).join("")}</tr></thead><tbody>${rows3.map((r) => `<tr>${columns2.map((c) => `<td>${c.render ? technicalLabel(c.label) ? `<span class="tech-value">${c.render(r)}</span>` : c.render(r) : valueMarkup(pick2(r, ...c.keys || [c.key]), c.label)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  }
  function cap(feature) {
    return window.__amStore?.capabilities?.[feature] || { read: "UNKNOWN", write: "UNKNOWN", enabled: { read: false, write: false }, evidence: "UNKNOWN" };
  }
  function capBadge(state2) {
    const kind = state2 === "SUPPORTED" ? "ok" : state2 === "PARTIAL" || state2 === "UNKNOWN" ? "warn" : "bad";
    return badge(state2, kind);
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

  // apps/access_manager/static/js/shared/infrastructure-ui.js
  function drawer(title, content, actions = "") {
    const d = dialog(title, `<div class="j-drawer-content">${content}</div>`, actions);
    d.classList.add("j-drawer");
    return d;
  }

  // apps/access_manager/static/js/workspaces/views/infrastructure.js
  var readInfrastructure = (path2, data = {}, scope = currentScope()) => request("/api/infrastructure/" + path2, { scope, signal: scope?.controller.signal, method: "POST", body: JSON.stringify({ ...data, app_session_id: store.session?.session?.session_id }) });
  function mountAttendanceDiagnostic() {
    document.querySelector("#subscriber-diagnose").onclick = async () => {
      const scope = currentScope(), button2 = document.querySelector("#subscriber-diagnose"), host = document.querySelector("#attendance-diagnostic");
      button2.disabled = true;
      try {
        let job = await readInfrastructure("diagnostics/start", { query: document.querySelector("#subscriber-query").value }, scope);
        const cancel = document.querySelector("#attendance-cancel");
        cancel.hidden = false;
        cancel.onclick = () => readInfrastructure("diagnostics/cancel", { id: job.id }, scope).catch((e) => toast(e.message));
        while (scopeActive(scope)) {
          host.innerHTML = `<p>${esc(job.status)} · ${job.events.map((e) => esc(e.source + ": " + e.status)).join(" · ")}</p>`;
          if (job.result) {
            const triage = job.result.triage;
            const stages = ["Cliente", "ONT / CPE", "GPON / PON", "VLAN / QinQ", "BNG / PPPoE", "AAA / RADIUS", "IPv4 / IPv6", "CGNAT / Core", "DNS / Internet"];
            const observed = job.result.snapshot?.subscriber;
            host.innerHTML += `<details><summary>Caminho do cliente e evidências</summary>${stages.map((name, index) => `<p>${esc(name)}: ${esc(index === 4 ? observed?.state || "UNKNOWN" : "UNKNOWN")}</p>`).join("")}<p>Coleta BNG: ${esc(job.result.snapshot?.subscriber_observed_at || "UNKNOWN")}</p></details>`;
            host.innerHTML += `<h3>${esc(triage.status)}${triage.partial ? " · Parcial" : ""}</h3>` + triage.issues.map((i) => `<p><strong>${esc(i.title)}</strong> ${esc(i.suggested_action || "")}</p>`).join("") + `<p>Etapas sem evidência permanecem UNKNOWN.</p><button class="button" data-attendance-copy="technical">Copiar técnico</button> <button class="button" data-attendance-copy="customer">Copiar para cliente</button>`;
            host.querySelectorAll("[data-attendance-copy]").forEach((b) => b.onclick = async () => {
              try {
                await navigator.clipboard.writeText(job.result.attendance[b.dataset.attendanceCopy]);
                toast("Registro copiado.");
              } catch {
                toast("Não foi possível copiar.");
              }
            });
          }
          if (job.status !== "RUNNING") break;
          await new Promise((resolve) => setTimeout(resolve, 500));
          if (!scopeActive(scope)) break;
          job = await readInfrastructure("diagnostics/progress", { id: job.id }, scope);
        }
      } catch (error) {
        if (scopeActive(scope)) host.textContent = error.message;
      } finally {
        button2.disabled = false;
        const cancel = document.querySelector("#attendance-cancel");
        if (cancel) cancel.hidden = true;
      }
    };
  }
  async function accessCpe(row) {
    try {
      const draft = await readInfrastructure("subscribers/cpe-draft", { session_id: row.session_id, username: row.username, ipv4_address: row.ipv4_address });
      const d = drawer("Acessar CPE", `<p><strong>${esc(draft.subscriber_username)}</strong> · via ${esc(store.session?.session?.vendor === "huawei_bng" ? "Huawei BNG" : "Juniper")}</p><p>Contrato ${esc(draft.contract || "—")} · MAC <code>${esc(row.mac_address || "—")}</code></p><p class="muted">Atualizado ${esc(new Date(draft.refreshed_at * 1e3).toLocaleTimeString())}</p><p class="muted">IP localizado no BNG. O acesso de gerenciamento parte deste computador e pode depender de rota, ACL ou porta habilitada.</p><form id="cpe-handoff" class="form-grid"><div class="field"><label>IPv4</label><input name="host" value="${esc(draft.host)}" readonly required><label><input type="checkbox" name="edit_host"> Editar endereço explicitamente</label></div><div class="field"><label>Porta</label><input name="port" type="number" min="1" max="65535" value="80" required></div><div class="field"><label>Protocolo</label><select name="protocol"><option value="auto">Automático (HTTP; HTTPS na porta 443)</option><option value="http">HTTP</option><option value="https">HTTPS</option></select></div><div class="field"><label>Fabricante</label><select name="vendor"><option value="auto">Automático</option><option value="huawei">Huawei</option><option value="zte">ZTE</option></select></div><div class="field"><label>Usuário do CPE</label><input name="username" autocomplete="off" required></div><div class="field"><label>Senha do CPE</label><input name="password" type="password" autocomplete="off" required></div><p id="cpe-feedback" role="status"></p></form>`, `<button class="button" type="button" data-probe-cpe>Verificar porta</button><button class="button primary" type="submit" form="cpe-handoff">Conectar ao CPE</button>`);
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
  function fields2(items) {
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
  function tabs(items, active2, attribute = "data-j-tab") {
    return `<div class="j-tabs" role="tablist">${items.map(([id, label]) => `<button type="button" role="tab" aria-selected="${id === active2}" ${attribute}="${esc(id)}" class="${id === active2 ? "active" : ""}">${esc(label)}</button>`).join("")}</div>`;
  }
  function dataTable(columns2, rows3, selectAttribute = "") {
    if (!rows3?.length) return empty("Nenhum registro retornado", "A ausência de dados não confirma falha no equipamento.");
    return `<div class="j-table-scroll"><table class="data-table"><thead><tr>${columns2.map(([label]) => `<th scope="col">${esc(label)}</th>`).join("")}</tr></thead><tbody>${rows3.map((row, index) => `<tr ${selectAttribute ? `${selectAttribute}="${index}"` : ""}>${columns2.map(([, render10]) => `<td>${render10(row, index)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  }

  // apps/access_manager/static/js/workspaces/views/juniper.js
  var session = () => store.session?.session;
  var read = (path2, data = {}, scope = currentScope()) => request("/api/infrastructure/" + path2, { scope, signal: scope?.controller.signal, method: "POST", body: JSON.stringify({ ...data, app_session_id: session()?.session_id }) });
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
  var knownInterfaces = [];
  function ensureContext() {
    if (sourceId !== session()?.session_id) {
      sourceId = session()?.session_id;
      query = "";
      selected = null;
      rows = [];
      candidates = [];
      tab = "summary";
      lastSubscriberRoute = null;
      knownInterfaces = [];
    }
  }
  var navigation = [
    ["Visão geral", [["juniperOverview", "Visão geral"]]],
    ["Assinantes", [["subscribers", "Buscar assinante"], ["juniperSubscriber", "Sessão PPPoE"], ["juniperAccounting", "Accounting"], ["juniperServices", "Serviços"]]],
    ["Infraestrutura", [["juniperInterfaces", "Interfaces"], ["juniperLacp", "LACP"], ["juniperOptics", "Óptica"], ["juniperRouting", "Roteamento do assinante"]]],
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
  function errorMarkup(error) {
    return `<div class="j-read-error" role="alert"><strong>${esc(error.message)}</strong><p>${esc(error.code || "READ_FAILED")}${error.request_id ? " · Referência " + esc(error.request_id) : ""}</p>${error.retryable ? '<button class="button" data-j-retry>Tentar novamente</button>' : ""}</div>`;
  }
  function wireRetry(host, action) {
    host.querySelector("[data-j-retry]")?.addEventListener("click", action, { once: true });
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
    const resources2 = results[1].status === "fulfilled" ? results[1].value : [], interfaces3 = results[2].status === "fulfilled" ? results[2].value : [];
    knownInterfaces = interfaces3;
    const re = resources2[0], idle = Number(re?.cpu_idle_percent), cpu = re?.cpu_idle_percent != null && Number.isFinite(idle) ? `${100 - idle}%` : "—";
    return `<div class="j-intro"><div><h2>Juniper ${esc(data.model)}</h2><p>${esc(data.hostname || "—")} · ${esc(session()?.host)} · Junos ${esc(data.firmware || "—")}</p></div><div>${button("Buscar assinante", "subscribers")}<button class="button" data-j-refresh>Atualizar</button><button class="button" data-j-identity>Identidade SSH</button></div></div><div class="j-metrics">${[["Conexão", store.session?.connected ? "Online" : "Desconectado"], ["Routing Engine", re?.state || "—"], ["CPU", cpu], ["Memória", re?.memory_used_percent != null ? `${re.memory_used_percent}%` : "—"], ["Tempo ligado", uptime(data.uptime_seconds)]].map(([k, v]) => `<div><span>${esc(k)}</span><strong>${esc(v)}</strong></div>`).join("")}</div><div class="j-overview-grid">${panel("Infraestrutura", dataTable([["Interface", (r) => copy(r.name)], ["Admin", (r) => esc(r.admin_state)], ["Link", (r) => status(r.oper_state)]], interfaces3), button("Ver interfaces", "juniperInterfaces"))}${panel("AAA / RADIUS", `<p>Estado dos servidores e contadores sob demanda.</p><div class="j-link-list">${button("Servidores RADIUS", "juniperRadius")}${button("Autenticação", "juniperAuth")}${button("Accounting", "juniperAaaAccounting")}${button("Dynamic Requests", "juniperDynamic")}</div>`)}${panel("Identidade do equipamento", kv2([["Modelo", data.model], ["Junos", data.firmware], ["Família", data.family], ["Transporte", session()?.protocol_family]]))}</div>`;
  }
  function subscribers() {
    ensureContext();
    return `<div class="j-subscriber-grid"><section class="panel j-panel"><div class="j-panel-header"><h2>Assinantes</h2><span id="subscriber-count">${rows.length} resultados</span></div><form id="subscriber-search" class="j-toolbar"><label class="sr-only" for="subscriber-query">Contrato / usuário PPPoE / IP</label><input id="subscriber-query" name="query" required maxlength="80" value="${esc(query)}" placeholder="Buscar contrato, usuário PPPoE ou IP"><button class="button primary" type="submit">Buscar</button><button class="button" type="button" id="subscriber-diagnose">Diagnóstico completo</button><button class="button" type="button" id="subscriber-cancel" disabled>Cancelar</button><button class="button" type="button" data-toggle-filters aria-expanded="false">Filtros</button></form><div id="subscriber-filters" class="j-toolbar" hidden><label>Estado <select id="subscriber-state"><option value="">Todos</option>${[...new Set(rows.map((r) => r.state).filter(Boolean))].map((s) => `<option>${esc(s)}</option>`).join("")}</select></label><button class="button" data-clear-filter>Limpar filtro</button></div><p id="subscriber-status" class="j-inline-status" role="status">${query ? "Atualizando a consulta…" : "Informe um contrato. Prefixos brd_, cdy_ e 364_; zeros preservados."}</p><button class="button" type="button" id="attendance-cancel" hidden>Cancelar diagnóstico</button><div id="attendance-diagnostic" role="status" aria-live="polite"></div><div id="subscriber-candidates"></div><div id="subscriber-results"></div></section><aside id="subscriber-detail" class="panel j-detail" aria-label="Detalhes do assinante">${empty("Nenhuma sessão selecionada", "Escolha uma linha para consultar detalhes sem sair da lista.")}</aside></div>`;
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
    mountAttendanceDiagnostic();
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
      document.dispatchEvent(new CustomEvent("subscriber-context-changed"));
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
    if (initial2 && (store.view !== "juniperSubscriber" || lastSubscriberRoute !== store.view)) tab = initial2;
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
        html = [["Rota do assinante selecionado", route], ["Forwarding do assinante selecionado", fib]].map(([title, result]) => `<h3>${title}</h3>${result.status === "fulfilled" ? detailData(result.value.data) : `<p role="alert">${esc(result.reason.message)}</p>`}`).join("");
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
  function linkData(kind, data) {
    if (kind === "lacp" && Array.isArray(data) && data.some((g) => Array.isArray(g.members))) {
      return data.map((group) => `<section class="j-section"><h3>Agregado ${esc(group.aggregate)}</h3>${dataTable([["Membro", (r) => `<code>${esc(r.interface)}</code>`], ["Actor · Coleta", (r) => esc(value(r.actor.collecting))], ["Actor · Distribuição", (r) => esc(value(r.actor.distributing))], ["Actor · Sync", (r) => esc(value(r.actor.synchronization))], ["Actor · Agregação", (r) => esc(value(r.actor.aggregation))], ["Partner · Coleta", (r) => esc(value(r.partner.collecting))], ["Partner · Distribuição", (r) => esc(value(r.partner.distributing))], ["Partner · Sync", (r) => esc(value(r.partner.synchronization))]], group.members)}<details class="j-advanced"><summary>Detalhes Actor / Partner</summary>${group.members.map((m) => `<h4>${esc(m.interface)}</h4><h5>Actor</h5>${detailData(m.actor)}<h5>Partner</h5>${detailData(m.partner)}`).join("")}</details></section>`).join("");
    }
    if (kind === "optics" && Array.isArray(data)) {
      return data.map((module) => `<section class="j-section"><h3>${esc(module.interface)}</h3>${kv2([["Temperatura", module.temperature], ["Tensão", module.voltage]])}${dataTable([["Lane", (l) => esc(l.lane)], ["Bias", (l) => esc(l.bias_current)], ["TX", (l) => esc(l.tx_power)], ["RX", (l) => esc(l.rx_power)]], module.lanes || [])}<details class="j-advanced"><summary>Alarmes, avisos e limites do módulo</summary>${detailData(module.module_alarm_warning_thresholds || {})}${(module.lanes || []).map((l) => `<h4>Lane ${esc(l.lane)}</h4>${detailData(l.alarm_warning_thresholds || {})}`).join("")}</details></section>`).join("");
    }
    return detailData(data);
  }
  async function interfaces2(kind = null) {
    ensureContext();
    if (kind) return panel(kind === "lacp" ? "LACP sob demanda" : "Óptica sob demanda", `<form id="juniper-link-form" class="j-toolbar"><label for="juniper-link-name">${kind === "lacp" ? "Interface agregada" : "Interface física"}</label><input id="juniper-link-name" name="name" list="juniper-known-links" required pattern="${kind === "lacp" ? "ae[0-9]+" : "(et|xe|ge)-[0-9]+/[0-9]+/[0-9]+(:[0-9]+)?"}" placeholder="${kind === "lacp" ? "ae…" : "et-…/…/…"}" autocomplete="off"><datalist id="juniper-known-links">${knownInterfaces.filter((r) => kind === "lacp" ? /^ae[0-9]+$/.test(r.name) : /^(et|xe|ge)-/.test(r.name)).slice(0, 128).map((r) => `<option value="${esc(r.name)}"></option>`).join("")}</datalist><button class="button primary">Consultar</button></form><p class="j-inline-status">Consulta específica; não carrega inventário global de pp0/demux.</p><div id="link-page-result" data-kind="${kind}"></div>`);
    const result = await read("interfaces");
    knownInterfaces = result;
    return panel(kind === "lacp" ? "LACP" : kind === "optics" ? "Óptica" : "Interfaces Junos", `<p class="j-inline-status">Selecione uma interface para consultar ${kind === "lacp" ? "LACP" : kind === "optics" ? "valores por lane" : "estado e contadores"}. Leituras sob demanda.</p>${dataTable([["Interface", (r, i) => `<button class="j-text-button" data-junos-interface="${esc(r.name)}" data-link-page="${kind || ""}">${esc(r.name)}</button>`], ["Admin", (r) => esc(r.admin_state || "—")], ["Link", (r) => status(r.oper_state)], ["Speed", (r) => esc(r.speed || "—")], ["MTU", (r) => esc(r.mtu || "—")], ["Endereços", (r) => esc((r.addresses || []).join(", ") || "—")]], result)}`);
  }
  function mountInterfaces() {
    const form = document.querySelector("#juniper-link-form");
    if (form) {
      form.onsubmit = async (event) => {
        event.preventDefault();
        const scope = currentScope(), host = document.querySelector("#link-page-result"), kind = host.dataset.kind;
        host.innerHTML = '<p class="j-inline-status">Consultando Juniper…</p>';
        form.querySelector("button").disabled = true;
        try {
          const result = await read("interfaces/link", { kind, name: form.elements.name.value.trim() }, scope);
          if (scopeActive(scope)) host.innerHTML = linkData(kind, result.data);
        } catch (e) {
          if (scopeActive(scope) && !isCancelled(e)) {
            host.innerHTML = errorMarkup(e);
            wireRetry(host, () => form.requestSubmit());
          }
        } finally {
          if (scopeActive(scope)) form.querySelector("button").disabled = false;
        }
      };
      return;
    }
    document.querySelectorAll("[data-junos-interface]").forEach((b) => b.onclick = async () => {
      const scope = currentScope();
      try {
        const name = b.dataset.junosInterface, kind = b.dataset.linkPage;
        const result = await read(kind ? "interfaces/link" : "interfaces/detail", kind ? { name, kind } : { name }, scope);
        if (!scopeActive(scope)) return;
        const d = drawer(name, (kind ? linkData(kind, result.data) : detailData(result)) + `<div class="inline-actions"><button class="button" data-link-kind="lacp">LACP</button><button class="button" data-link-kind="optics">Óptica por lane</button></div><div id="link-read-result"></div>`);
        d.querySelectorAll("[data-link-kind]").forEach((x) => x.onclick = async () => {
          const drawerScope = d._requestScope;
          x.disabled = true;
          try {
            const r = await read("interfaces/link", { name, kind: x.dataset.linkKind }, d._requestScope);
            if (d.open && d._requestScope === drawerScope) d.querySelector("#link-read-result").innerHTML = linkData(x.dataset.linkKind, r.data);
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
  var counterLabels = { requests: "Requisições", accepts: "Aceitas", rejects: "Rejeitadas", radius_failures: "Falhas RADIUS", no_available_server: "Servidor indisponível", invalid_credentials: "Credenciais inválidas", timeouts: "Tempo esgotado", processed_ok: "Processados com sucesso", processed_initial: "Processados inicialmente", processing_error: "Erros de processamento", silent_drops: "Descartados silenciosamente", request_success: "Requisições com sucesso", request_failures: "Falhas nas requisições", acct_on_requests: "Accounting-On enviados", start_requests: "Start enviados", interim_requests: "Interim enviados", stop_requests: "Stop enviados", response_success: "Respostas com sucesso", response_failures: "Falhas nas respostas", start_responses: "Respostas Start", interim_responses: "Respostas Interim", stop_responses: "Respostas Stop", requests_pending: "Requisições pendentes", retransmissions: "Retransmissões", collecting: "Coleta", distributing: "Distribuição", synchronization: "Sincronização", aggregation: "Agregação" };
  function counterTable(data) {
    const rows3 = Object.entries(data.counters || {});
    return `<p class="j-inline-status">Contadores acumulados; valores históricos não confirmam incidente atual.</p><div class="j-counter-table"><table class="data-table"><thead><tr><th>Métrica</th><th>Valor</th></tr></thead><tbody>${rows3.map(([key, val]) => `<tr><th scope="row">${esc(counterLabels[key] || labels[key] || key.replaceAll("_", " "))}</th><td>${val == null ? "—" : esc(/^[0-9]+$/.test(String(val)) ? BigInt(val).toLocaleString("pt-BR") : val)}</td></tr>`).join("")}</tbody></table></div>`;
  }
  async function operationLogs() {
    const rows3 = await read("operations");
    return panel("Operações Juniper desta sessão", `<p class="j-inline-status">Até 100 leituras recentes da aplicação. Sem saída XML/CLI ou credenciais.</p>${dataTable([["Horário", (r) => esc(new Date(r.timestamp * 1e3).toLocaleTimeString())], ["Leitura", (r) => esc(r.feature)], ["Duração", (r) => esc((r.elapsed_ms / 1e3).toFixed(2) + " s")], ["Espera pelo lock", (r) => esc(r.lock_wait_ms + " ms")], ["Formato", (r) => esc(r.output_format)], ["Resultado", (r) => esc(r.error_code || "Sucesso")], ["Referência", (r) => `<code>${esc(r.request_id)}</code>`]], rows3.slice().reverse())}`);
  }
  async function health(kind) {
    const result = await read("health", { kind });
    return panel(titles[store.view]?.[1] || "Saúde", kind.startsWith("aaa_") ? counterTable(result.data) : detailData(result.data));
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
    const map = { juniperOverview: [overview, mountCommon], subscribers: [subscribers, mountSubscribers, unmountSubscribers], juniperSubscriber: [() => subscriberPage("summary"), mountSubscriberPage], juniperAccounting: [() => subscriberPage("accounting"), mountSubscriberPage], juniperServices: [() => subscriberPage("services"), mountSubscriberPage], juniperRouting: [() => subscriberPage("routing"), mountSubscriberPage], juniperPppoe: [() => subscriberPage("pppoe"), mountSubscriberPage], juniperLockout: [() => subscriberPage("diagnostic"), mountSubscriberPage], juniperInterfaces: [() => interfaces2(), mountInterfaces], juniperLacp: [() => interfaces2("lacp"), mountInterfaces], juniperOptics: [() => interfaces2("optics"), mountInterfaces], juniperRadius: [() => health("radius")], juniperAuth: [() => health("aaa_authentication")], juniperAaaAccounting: [() => health("aaa_accounting")], juniperDynamic: [() => health("aaa_dynamic")], juniperSystem: [() => system()], juniperFpc: [() => health("fpc")], juniperEnvironment: [() => health("environment")], juniperHardware: [() => system("chassis")], juniperDiagnostics: [diagnostics, mountDiagnostics], juniperLogs: [operationLogs] };
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
        if (scopeActive(scope)) document.querySelector("#juniper-diagnostic-result").innerHTML = fields2([["Origem", "Juniper " + (result.hostname || "")], ["Destino", result.target], ["Routing instance", result.routing_instance], ["Enviados", result.packets_sent], ["Recebidos", result.packets_received], ["Perda reportada", result.packet_loss_reported], ["RTT médio (formato do firmware)", result.rtt_average_reported]]) + table([{ label: "Salto", keys: ["hop"] }, { label: "Endereços", render: (r) => esc(r.addresses.join(", ")) }, { label: "RTT reportado", render: (r) => esc(r.rtt_reported.join(", ")) }], result.hops || []);
      } catch (e) {
        if (scopeActive(scope)) document.querySelector("#juniper-diagnostic-result").textContent = e.message;
      } finally {
        button2.disabled = false;
      }
    };
  }
  var worldActions = [{ id: "access-cpe", routeId: "juniperSubscriber", label: "Acessar CPE", kind: "cpe", capability: "subscriber_detail", available: () => Boolean(selected?.ipv4_address), run: () => selected && accessCpe(selected) }];

  // apps/access_manager/static/js/workspaces/views/huaweiBng.js
  var navigation2 = [["HUAWEI BNG", [
    ["huaweiBngOverview", "Visão geral"],
    ["huaweiBngSubscribers", "Assinantes PPPoE"],
    ["huaweiBngDiagnostics", "Diagnóstico completo"]
  ]]];
  var queryField = () => `<form id="huawei-subscriber-search" class="form-grid"><div class="field"><label for="subscriber-query">Contrato / usuário PPPoE / User ID</label><input id="subscriber-query" name="query" required maxlength="128" placeholder="Contrato, usuário ou user-id:42"></div><button class="button primary" type="submit">Buscar assinante</button><button class="button" type="button" id="subscriber-diagnose">Diagnóstico completo</button></form><button class="button" type="button" id="attendance-cancel" hidden>Cancelar diagnóstico</button><div id="attendance-diagnostic" role="status" aria-live="polite"></div>`;
  var facts = (entries) => `<dl class="infrastructure-facts">${entries.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(Array.isArray(v) ? v.join(", ") : v ?? "UNKNOWN")}</dd></div>`).join("")}</dl>`;
  async function overview2() {
    const scope = currentScope(), data = await readInfrastructure("system", {}, scope), session2 = store.session?.session;
    const states = session2?.metadata?.connection_states || [];
    return `<section class="panel huawei-bng-overview"><h2>Huawei ${esc(data.model || session2?.model || "BNG")}</h2><p>VRP ${esc(data.firmware || session2?.firmware || "UNKNOWN")} · ${esc(session2?.host)}</p>${facts([["Transporte", "VRP SSH"], ["SSH", session2?.metadata?.transport_active === false ? "UNKNOWN" : store.session?.connected ? "Conectado" : "UNKNOWN"], ["Autenticação", states.includes("AUTHENTICATED") ? "Confirmada" : "UNKNOWN"], ["Prompt VRP", states.includes("PROMPT_DETECTED") ? "Detectado" : "UNKNOWN"], ["Facts", session2?.metadata?.facts_status || data.feature_states?.system || "UNKNOWN"]])}<p>Leituras avançadas sem validação física permanecem indisponíveis.</p><button class="button primary" data-view="huaweiBngSubscribers">Buscar assinante</button></section>`;
  }
  function subscribers2() {
    return `<section class="panel huawei-bng-subscribers"><h2>Assinantes Huawei BNG</h2>${queryField()}<p id="huawei-search-status" role="status"></p><div id="huawei-subscriber-results"></div><div id="huawei-subscriber-detail"></div></section>`;
  }
  function mountSubscribers2() {
    mountAttendanceDiagnostic();
    const form = document.querySelector("#huawei-subscriber-search"), scope = currentScope();
    const message = document.querySelector("#huawei-search-status"), host = document.querySelector("#huawei-subscriber-results");
    form.onsubmit = async (event) => {
      event.preventDefault();
      form.querySelector("[type=submit]").disabled = true;
      message.textContent = "Consultando Huawei BNG…";
      try {
        const result = await readInfrastructure("subscribers/lookup", { query: form.elements.query.value }, scope);
        if (!scopeActive(scope)) return;
        const rows3 = result.sessions || [];
        message.textContent = (result.complete ? "Consulta concluída." : "Consulta parcial: ausência de sessão não confirmada.") + ` ${rows3.length} sessão(ões).`;
        host.innerHTML = table([{ label: "Usuário PPPoE", render: (r) => esc(r.username) }, { label: "Estado", render: (r) => esc(r.state || "UNKNOWN") }, { label: "IPv4", render: (r) => esc(r.ipv4_address || "UNKNOWN") }, { label: "Detalhes", render: (r) => `<button class="button" data-huawei-user="${esc(r.session_id)}">Abrir</button>` }], rows3);
        host.querySelectorAll("[data-huawei-user]").forEach((button2) => button2.onclick = async () => {
          button2.disabled = true;
          try {
            const row = await readInfrastructure("subscribers/detail", { session_id: button2.dataset.huaweiUser }, scope);
            if (scopeActive(scope)) document.querySelector("#huawei-subscriber-detail").innerHTML = `<h3>${esc(row.username)}</h3>` + facts([["User ID", row.user_id], ["Estado", row.state], ["Interface", row.interface], ["Interface física", row.physical_interface], ["S-VLAN / PeVlan", row.outer_vlan], ["C-VLAN / CeVlan", row.inner_vlan], ["IPv4", row.ipv4_address], ["IPv6", row.ipv6_addresses], ["Gateway", row.gateway_ipv4], ["DNS", row.dns_v4], ["MAC", row.mac]]) + `<button class="button" data-huawei-cpe ${row.ipv4_address ? "" : "disabled"}>Acessar CPE</button>`;
            if (scopeActive(scope)) document.querySelector("[data-huawei-cpe]").onclick = () => accessCpe(row);
          } catch (e) {
            if (scopeActive(scope)) message.textContent = e.message;
          } finally {
            button2.disabled = false;
          }
        });
      } catch (e) {
        if (scopeActive(scope)) message.textContent = e.message;
      } finally {
        form.querySelector("[type=submit]").disabled = false;
      }
    };
  }
  function diagnostics2() {
    return `<section class="panel"><h2>Diagnóstico Huawei BNG</h2>${queryField()}<p>Somente dados observados; recursos sem suporte permanecem UNKNOWN.</p></section>`;
  }
  function mountDiagnostics2() {
    mountAttendanceDiagnostic();
    document.querySelector("#huawei-subscriber-search").onsubmit = (e) => {
      e.preventDefault();
      document.querySelector("#subscriber-diagnose").click();
    };
  }
  var routes = { huaweiBngOverview: { render: overview2, mount: () => {
    document.querySelector(".huawei-bng-overview [data-view=huaweiBngSubscribers]").onclick = () => document.dispatchEvent(new CustomEvent("infrastructure-navigate", { detail: "huaweiBngSubscribers" }));
  } }, huaweiBngSubscribers: { render: subscribers2, mount: mountSubscribers2 }, huaweiBngDiagnostics: { render: diagnostics2, mount: mountDiagnostics2 } };

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

  // apps/access_manager/static/js/shared/wifi-standard.js
  var wifiStandard = (r) => r.wifi_standard ? `${r.wifi_generation ? "Wi-Fi " + r.wifi_generation + " · " : ""}${r.wifi_standard}` : "Não informado";

  // apps/access_manager/static/js/service/client-diagnostic.js
  function clientObservations(client, present2, ping2) {
    const observations = [];
    if (client.wifi_standard) observations.push("Cliente negociou " + wifiStandard(client) + ".");
    if (client.wifi_generation === 5) observations.push("Wi-Fi 5 pode limitar throughput em relação ao Wi-Fi 6, mas não comprova falha.");
    const rates = [client.rx_rate, client.tx_rate].map(Number).filter((v) => Number.isFinite(v) && v > 0);
    const low = rates.length && Math.min(...rates) < 30;
    if (low && Number(client.rssi) >= -65) observations.push("Sinal adequado com taxa baixa: investigar largura do canal, MCS, interferência e congestionamento.");
    if (low && client.wifi_generation === 4 && /2[.,]4/.test(client.band || client.banda || "") && Number(client.rssi) < -70) observations.push("Wi-Fi 4 em 2.4 GHz, RSSI fraco e taxa baixa: combinação que pode ser um gargalo.");
    const rssi = Number(client.rssi);
    if (client.rssi != null && Number.isFinite(rssi)) observations.push(rssi < -70 ? "RSSI fraco: possível distância ou interferência; confirmar no local." : "RSSI adequado; não comprova qualidade da conexão nem exclui interferência.");
    if (present2 === false) observations.push("Ausente na tabela atual; pode não estar conectado ao SSID esperado.");
    if (present2 === true) observations.push("Presente na tabela atual; presença não comprova acesso à internet.");
    if (ping2 === false && present2 === true) observations.push("Sem resposta ao ping: firewall, isolamento ou standby são possibilidades.");
    return observations.join(" ");
  }
  var details = (r) => ({ Hostname: r.hostname || r.nome, IPv4: r.ip || r.ipv4, IPv6: Array.isArray(r.ipv6_addresses) ? r.ipv6_addresses.join(", ") : r.ipv6_addresses || r.ipv6, MAC: r.mac, "Padrão Wi-Fi": wifiStandard(r), "Ruído": r.noise, MCS: r.mcs, "Largura do canal": r.bandwidth || r.largura, "Canal do rádio": r.radio_channel ?? r.channel, Banda: r.band || r.banda, SSID: r.ssid, Interface: r.interface || r.port, RSSI: r.rssi, SNR: r.snr, "RX bytes": r.rx_bytes, "TX bytes": r.tx_bytes, "Taxa RX": r.rx_rate, "Taxa TX": r.tx_rate, "Tempo conectado": r.uptime || r.connected_time || r.connect_time, Fabricante: r.manufacturer || r.vendor, Estado: r.status ?? r.online, Lease: r.lease });
  function openClientDiagnostic(client) {
    const target = client.hostname || client.nome || client.ip || client.mac || "Cliente";
    const d = dialog("Diagnóstico do dispositivo", `${kv(details(client))}<div class="inline-actions"><button class="button primary" data-test-client>Diagnosticar dispositivo / Testar conexão</button><button class="button" data-add-client>Adicionar ao atendimento</button><button class="button" data-find-client>Localizar no mundo</button></div><div data-client-result role="status"></div>`);
    d.classList.add("drawer");
    const record = (data, result, observations) => addEntry({ category: "Cliente", action: "Diagnóstico específico", target, data, result, observations });
    d.querySelector("[data-add-client]").onclick = () => {
      record(details(client), "Dados observados", clientObservations(client, null, null));
      toast("Cliente adicionado ao atendimento.");
    };
    d.querySelector("[data-find-client]").onclick = () => {
      d.close();
      document.dispatchEvent(new CustomEvent("locate-world-route", { detail: { routeId: "clients" } }));
    };
    d.querySelector("[data-test-client]").onclick = async (e) => {
      const button2 = e.currentTarget;
      button2.disabled = true;
      const output = d.querySelector("[data-client-result]"), scope = d._requestScope;
      let current = client, present2 = null, ping2 = null;
      const tests2 = [];
      output.textContent = "Atualizando tabela de clientes…";
      try {
        if (cap("clients").enabled?.read) {
          try {
            const rows3 = await request("/api/device/clients", { scope, forceRefresh: true });
            if (Array.isArray(rows3)) {
              const match = rows3.find((r) => client.mac ? r.mac?.toLowerCase() === client.mac.toLowerCase() : (r.ip || r.ipv4) === (client.ip || client.ipv4));
              present2 = Boolean(match);
              if (match) current = match;
              tests2.push({ teste: "Tabela de clientes", resultado: present2 ? "Presente" : "Ausente" });
            }
          } catch (error) {
            tests2.push({ teste: "Tabela de clientes", resultado: error.message });
          }
        }
        const ip = current.ip || current.ipv4;
        if (ip && cap("diagnostics").enabled?.write) {
          try {
            const result = await request("/api/device/diagnostics/ping", { method: "POST", scope, body: JSON.stringify({ host: ip, count: 4 }) });
            const received = result.received ?? result.packets_received ?? result.recebidos;
            ping2 = typeof received === "number" ? received > 0 : null;
            tests2.push({ teste: "Ping a partir do equipamento", resultado: result });
          } catch (error) {
            tests2.push({ teste: "Ping", resultado: error.message });
          }
        } else tests2.push({ teste: "Ping", resultado: ip ? "Não suportado pelas capabilities desta sessão." : "IP indisponível." });
        if (cap("wifi_radio").enabled?.read) {
          try {
            const radios2 = await request("/api/device/wifi/radios", { scope });
            const list2 = Array.isArray(radios2) ? radios2 : radios2?.radios || [];
            const band2 = current.band || current.banda;
            const radio = band2 ? list2.find((r) => String(r.band || r.banda).replace(/[^0-9.]/g, "") === String(band2).replace(/[^0-9.]/g, "")) : null;
            if (radio) {
              current = { ...current, radio_channel: radio.channel ?? radio.canal };
              tests2.push({ teste: "Rádio relacionado", banda: band2, canal: radio.channel ?? radio.canal, largura: radio.bandwidth ?? radio.largura });
            }
          } catch (error) {
            tests2.push({ teste: "Rádio", resultado: error.message });
          }
        }
        const pingResult = tests2.find((t) => t.teste === "Ping a partir do equipamento")?.resultado;
        const observations = [`IP: ${current.ip || current.ipv4 || "indisponível"}; banda: ${current.band || current.banda || "indisponível"}; RSSI: ${current.rssi ?? "indisponível"}; SNR: ${current.snr ?? "indisponível"}.`, clientObservations(current, present2, ping2), pingResult ? `Ping: ${pingResult.received ?? "não informado"}/${pingResult.sent ?? "não informado"} respostas; perda ${pingResult.loss_percent ?? "não informada"}%.` : tests2.find((t) => t.teste === "Ping")?.resultado].filter(Boolean).join(" ");
        record({ cliente: details(current), testes: tests2 }, "Verificações concluídas", observations);
        if (scopeActive(scope)) output.innerHTML = `${kv(details(current))}<pre>${esc(JSON.stringify(tests2, null, 2))}</pre><p>${esc(observations || "Sem dados suficientes para inferir conectividade. Não há teste equivalente habilitado nesta sessão.")}</p>`;
      } finally {
        button2.disabled = false;
      }
    };
  }

  // apps/access_manager/static/js/workspaces/views/clients.js
  var rows2 = [];
  var status2 = (r) => {
    const v = pick2(r, "status", "estado", "online");
    if (v === "—") return badge("Não disponível");
    if (v === false || /^(offline|disconnected|false|0)$/i.test(String(v))) return badge("Offline", "bad");
    if (v === true || /^(online|connected|associated|up|true|1)$/i.test(String(v))) return badge("Online", "ok");
    return badge(linkStatus(v));
  };
  var connection = (r) => pick2(r, "connection_type", "tipo", "interface");
  var band = (r) => pick2(r, "band", "banda");
  var columns = [{ label: "Status", render: status2 }, { label: "Hostname", render: (r) => `<button class="icon-button" data-client="${rows2.indexOf(r)}">${esc(pick2(r, "hostname", "nome"))}</button>` }, { label: "IPv4", keys: ["ip", "ipv4"] }, { label: "IPv6", keys: ["ipv6"] }, { label: "MAC", keys: ["mac"] }, { label: "Conexão", render: connection }, { label: "SSID / porta", keys: ["ssid", "port", "interface"] }, { label: "Banda", render: band }, { label: "Padrão Wi-Fi", render: (r) => esc(wifiStandard(r)) }, { label: "RSSI", keys: ["rssi"] }, { label: "SNR", keys: ["snr"] }, { label: "RX / TX", render: (r) => `${esc(pick2(r, "rx_rate"))} / ${esc(pick2(r, "tx_rate"))}` }];
  function cards(data) {
    return `<div class="client-cards">${data.map((r) => `<button class="client-card" data-client="${rows2.indexOf(r)}"><strong>${esc(pick2(r, "hostname", "nome"))}</strong><span class="mono tech-address">${esc(pick2(r, "ip"))}</span><small>${esc(connection(r))} · ${esc(band(r))}</small><small>${r.wifi_mode_family ? `<b>${esc(r.wifi_mode_family)}</b> · ` : ""}${esc(wifiStandard(r))}</small>${status2(r)}</button>`).join("")}</div>`;
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
      if (r) openClientDiagnostic(r);
    });
  }
  async function render() {
    rows2 = await request("/api/device/clients");
    if (!Array.isArray(rows2)) rows2 = [];
    const ssids = [...new Set(rows2.map((r) => r.ssid).filter(Boolean))];
    const warnings = [...new Set(rows2.flatMap((r) => r.collection_warnings || []))];
    return `${warnings.map((w) => `<p class="notice warning">${esc(w)}</p>`).join("")}<section class="panel"><div class="toolbar"><input id="client-search" placeholder="Buscar hostname, IP ou MAC" aria-label="Buscar clientes"><select id="client-filter" aria-label="Conexão"><option value="">Todas as conexões</option><option>Wi-Fi</option><option>Ethernet</option><option>Mesh</option></select><select id="client-band" aria-label="Banda"><option value="">Todas as bandas</option><option value="2.4">2.4 GHz</option><option value="5">5 GHz</option></select><select id="client-ssid" aria-label="SSID"><option value="">Todos os SSIDs</option>${ssids.map((s) => `<option>${esc(s)}</option>`).join("")}</select><select id="client-standard" aria-label="Padrão Wi-Fi"><option value="">Todos os padrões Wi-Fi</option><option value="4">Wi-Fi 4 / N</option><option value="5">Wi-Fi 5 / AC</option><option value="6">Wi-Fi 6 / AX</option><option value="7">Wi-Fi 7 / BE</option><option value="unknown">Não informado</option></select><select id="client-view" aria-label="Visualização"><option value="table">Tabela</option><option value="cards">Cards</option><option value="topology">Topologia</option></select></div><div id="client-results"></div></section>`;
  }
  function mount() {
    const paint = () => {
      const q = document.querySelector("#client-search").value.toLowerCase(), type = document.querySelector("#client-filter").value, b = document.querySelector("#client-band").value, ssid = document.querySelector("#client-ssid").value, view = document.querySelector("#client-view").value;
      const standard = document.querySelector("#client-standard").value;
      const filtered = rows2.filter((r) => (!standard || (standard === "unknown" ? !r.wifi_standard : String(r.wifi_generation) === standard)) && (!q || [r.hostname, r.ip, r.ipv6, r.mac].some((v) => String(v || "").toLowerCase().includes(q))) && (!type || String(connection(r)).includes(type)) && (!b || String(band(r)).replace(",", ".").includes(b)) && (!ssid || r.ssid === ssid));
      const all = rows2;
      document.querySelector("#client-results").innerHTML = view === "table" ? table(columns, filtered) : view === "cards" ? cards(filtered) : topology(filtered, "Equipamento", false);
      rows2 = all;
      mountDetails();
    };
    document.querySelectorAll("#client-search,#client-filter,#client-band,#client-ssid,#client-standard,#client-view").forEach((e) => e.addEventListener("input", paint));
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
    let state2 = sessions.get(id);
    if (!state2) {
      sessions.clear();
      state2 = { histories: /* @__PURE__ */ new Map(), sources: [] };
      sessions.set(id, state2);
    }
    let selected2 = "", seconds = 300, timer, busy = false, historyStamp = 0;
    const remember = (r) => {
      const key = streamKey(r), h = state2.histories.get(key) || [], timestamp = r.timestamp || Date.now() / 1e3;
      if (!h.some((v) => v.timestamp === timestamp)) h.push({ ...r, timestamp });
      h.sort((a, b) => a.timestamp - b.timestamp);
      state2.histories.set(key, h.slice(-2e3));
    };
    function plot() {
      const source = state2.sources.find((s) => streamKey(s) === selected2);
      if (!source) return;
      host.dataset.stream = selected2;
      text(host.querySelector("[data-counter-identity]"), source.identity || "Não disponível");
      for (const key of ["rx_mbps", "tx_mbps", "rx_bytes", "tx_bytes", "rx_packets", "tx_packets", "rx_errors", "tx_errors", "rx_discard", "tx_discard"]) text(host.querySelector(`[data-value="${key}"]`), key.endsWith("mbps") ? rate(source[key]) : key.endsWith("bytes") ? formatBytes(source.counters?.[key]) : String(source.counters?.[key] ?? "Não disponível"));
      const h = (state2.histories.get(selected2) || []).filter((r) => r.timestamp >= Date.now() / 1e3 - seconds), max = Math.max(1, ...h.flatMap((r) => [r.rx_mbps, r.tx_mbps]).filter(Number.isFinite)), min = h[0]?.timestamp, last = h.at(-1)?.timestamp;
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
      state2.sources = sources;
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
    const list2 = host.querySelector("ol");
    for (const [i, s] of ranked.entries()) {
      let row = list2.children[i];
      if (!row) {
        row = document.createElement("li");
        row.innerHTML = '<span data-name></span><strong class="tech-value" data-total></strong>';
        list2.append(row);
      }
      text(row.querySelector("[data-name]"), `${s.hostname || s.label || s.identity}${s.ip ? " · " + s.ip : ""}`);
      text(row.querySelector("[data-total]"), formatBytes(Number(s.counters.rx_bytes) + Number(s.counters.tx_bytes)));
    }
    while (list2.children.length > ranked.length) list2.lastElementChild.remove();
  }

  // apps/access_manager/static/js/workspaces/views/overview.js
  var initial = null;
  var metric2 = (title, value2, key) => `<article class="am-metric"><span>${title}</span><strong class="${key === "status" ? ["Conectado", "Ativo"].includes(value2) ? "value-success" : ["Desconectado", "Sem link"].includes(value2) ? "value-danger" : "muted" : "tech-value"}" ${key ? `data-overview-${key}` : ""}>${esc(value2 ?? "Não disponível")}</strong></article>`;
  var statusLabel = { OK: "[ OK ]", INFO: "[ INFO ]", WARNING: "[ ATENÇÃO ]", CRITICAL: "[ CRÍTICO ]", UNKNOWN: "[ PARCIAL ]", UNSUPPORTED: "[ N/D ]" };
  var severityClass = (status3) => status3 === "CRITICAL" ? "danger" : status3 === "WARNING" ? "warning" : status3 === "OK" ? "success" : "info";
  function triageMarkup(triage) {
    const issues = Array.isArray(triage?.issues) ? triage.issues : [], status3 = triage?.status || "UNKNOWN";
    const checked = triage?.checked_at ? new Date(triage.checked_at).toLocaleTimeString("pt-BR") : "—";
    const content = issues.length ? issues.slice(0, 6).map((issue) => `<article class="notice ${severityClass(issue.severity)}"><strong>${esc(statusLabel[issue.severity] || `[ ${issue.severity} ]`)} ${esc(issue.title)}</strong><p>${esc(issue.description)}</p>${issue.suggested_action ? `<small>${esc(issue.suggested_action)}</small>` : ""}</article>`).join("") : `<p class="${status3 === "OK" ? "value-success" : "muted"}">${status3 === "OK" ? "[ OK ] Nenhuma anomalia foi confirmada nas leituras disponíveis." : "Nenhuma falha foi confirmada; a triagem está parcial porque existem métricas indisponíveis ou não suportadas."}</p>`;
    const coverage = Object.entries(triage?.coverage || {}).map(([key, value2]) => `<span class="status-badge">${esc(key.toUpperCase())}:${esc(value2)}</span>`).join(" ");
    return `<section class="am-panel overview-triage" aria-labelledby="triage-title"><div class="panel-header"><div><small>[ SAÚDE DA CONEXÃO ]</small><h2 id="triage-title">TRIAGEM AUTOMÁTICA</h2></div><span class="status-badge" data-triage-status="${esc(status3)}">${esc(statusLabel[status3] || status3)}</span></div><div class="triage-issues">${content}</div><div class="toolbar"><small class="muted">Atualizado ${esc(checked)}${triage?.source_revision ? ` · snapshot ${esc(String(triage.source_revision))}` : ""}</small><div class="inline-actions">${coverage}<button class="button" type="button" data-triage-complete>DIAGNÓSTICO COMPLETO</button></div></div></section>`;
  }
  async function render2() {
    const opticalApplicable = cap("optical").read !== "UNSUPPORTED", scope = currentScope();
    const paths = ["/api/device", "/api/device/wan", "/api/device/optical", "/api/device/clients", "/api/device/traffic", "/api/device/wifi/ssids", "/api/device/wifi/radios", "/api/device/lan", "/api/device/dns"];
    const results = await Promise.allSettled(paths.map((p) => p === "/api/device/optical" && !opticalApplicable ? Promise.resolve(null) : request(p, { scope })));
    if (!scopeActive(scope)) throw cancelled();
    const values = Object.fromEntries(paths.map((path2, index) => [path2, results[index].status === "fulfilled" ? results[index].value : null]));
    const errors = Object.fromEntries(paths.flatMap((path2, index) => results[index].status === "rejected" ? [[path2, results[index].reason?.message || "Leitura indisponível"]] : []));
    const device = values["/api/device"], wan2 = values["/api/device/wan"], optical = values["/api/device/optical"], clients = values["/api/device/clients"], traffic = values["/api/device/traffic"], wifi = values["/api/device/wifi/ssids"], radios2 = values["/api/device/wifi/radios"], lan2 = values["/api/device/lan"], dns = values["/api/device/dns"];
    const d = device || {}, w = (Array.isArray(wan2) ? wan2[0] : wan2) || {}, o = optical || {};
    initial = traffic;
    const source = traffic?.sources?.find((s) => s.source === "wan"), rx = o.rx_dbm ?? o.rx ?? o.rx_power, wi = Array.isArray(wifi) ? wifi : [], ra = Array.isArray(radios2) ? radios2 : [], cl = Array.isArray(clients) ? clients : [], signals = cl.map((c) => c.rssi).filter(Number.isFinite), rssi = signals.length ? signals.reduce((a, b) => a + b, 0) / signals.length : null;
    const session2 = store.session?.session || {};
    const snapshot = { session_id: session2.session_id, source_revision: `${session2.session_id || "session"}:${scope.generation}`, device: d, wan: wan2, wan_primary: w, optical: o, clients: cl, traffic, wifi: wi, radios: ra, lan: lan2, dns, capabilities: store.capabilities, errors };
    store.setSnapshot(snapshot);
    let triage;
    try {
      triage = await request("/api/triage", { method: "POST", scope, body: JSON.stringify(snapshot) });
    } catch (error) {
      triage = { status: "UNKNOWN", issues: [], partial: true, coverage: { triage: "UNKNOWN" }, checked_at: (/* @__PURE__ */ new Date()).toISOString(), source_revision: snapshot.source_revision, error: error.message };
    }
    if (!scopeActive(scope)) throw cancelled();
    const alerts = (triage?.issues || []).filter((item) => ["WARNING", "CRITICAL"].includes(item.severity));
    return `<header class="am-page-header"><small>PAINEL DO EQUIPAMENTO</small><h2>${esc(d.model || session2.model || "Equipamento")}</h2><p class="muted">${esc(d.manufacturer || session2.vendor || "")} · equipamento da sessão atual</p></header><div class="overview-metrics">${metric2("Status da internet", linkStatus(w.status), "status")}${metric2("IP WAN", w.ipv4, "wan-ip")}${metric2("Clientes conectados", Array.isArray(clients) ? cl.length : null, "clients")}${opticalApplicable ? metric2("RX óptico", rx == null ? null : rx + " dBm", "optical") : ""}${metric2("Consumo atual", rate(source?.rx_mbps), "throughput")}</div>${triageMarkup(triage)}<div class="am-dashboard-split">${trafficChart("Fluxo de tráfego")}<section class="am-panel"><h2>Resumo do equipamento</h2>${fields2([["Uptime", uptime(d.uptime_seconds)], ["Firmware", d.firmware], ["Temperatura", d.temperature_c == null ? null : d.temperature_c + " °C"], ["CPU", d.cpu_percent == null ? null : d.cpu_percent + " %"], ["Memória", d.memory_percent == null ? null : d.memory_percent + " %"], ["Modelo", d.model], ["Serial", d.serial]])}</section></div><div class="am-three-columns"><section class="am-panel"><h2>WAN</h2>${fields2([["Interface", w.name], ["Gateway", w.gateway], ["VLAN", w.vlan], ["Link", linkStatus(w.status)], ["Conexão", w.connection_type]])}</section><section class="am-panel"><h2>Wi-Fi</h2>${fields2([["SSIDs observados", wi.map((s) => s.ssid).filter(Boolean)], ["Bandas", ra.map((r) => r.band ?? r.banda)], ["Clientes Wi-Fi", Array.isArray(clients) ? cl.filter((c) => c.connection_type === "Wi-Fi").length : null], ["Canais", ra.map((r) => r.channel ?? r.canal)]])}</section><section class="am-panel"><h2>Alertas recentes</h2>${alerts.map((item) => `<p class="notice ${severityClass(item.severity)}">${esc(item.title)}</p>`).join("") || '<p class="muted">Nenhum alerta confirmado pelas leituras disponíveis.</p>'}${triage?.partial ? '<p class="muted">Cobertura parcial: dado ausente não é tratado como falha.</p>' : ""}</section></div><div class="am-two-columns"><section class="am-panel"><h2>Utilização de CPU</h2><strong class="tech-value">${esc(d.cpu_percent == null ? "Não disponível" : d.cpu_percent + " %")}</strong>${Number.isFinite(d.cpu_percent) && d.cpu_percent >= 0 && d.cpu_percent <= 100 ? `<div class="resource-track"><div class="resource-fill violet" style="width:${d.cpu_percent}%"></div></div>` : ""}</section><section class="am-panel"><h2>Qualidade do sinal</h2>${fields2([["RSSI médio observado", rssi == null ? null : rssi.toFixed(1) + " dBm"], ["Associações com RSSI", signals.length || null], ["Interferência", null]])}</section></div><section class="am-panel overview-topology"><h2>Topologia da rede</h2>${Array.isArray(clients) ? topology(cl, d.model) : '<p class="muted">Clientes não disponíveis; nenhuma relação inferida.</p>'}</section>`;
  }
  function mount2() {
    document.querySelector("[data-triage-complete]")?.addEventListener("click", () => document.querySelector('[data-view="completeDiagnostics"]')?.click());
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

  // apps/access_manager/static/js/shared/field-spec.js
  var firewallLevels = [{ value: "Low", label: "Baixo" }, { value: "Middle", label: "Médio (recomendado)" }, { value: "High", label: "Alto" }];
  function fieldControl(f) {
    const control = f.control || (f.secret ? "password" : f.options ? "select" : f.type === "bool" ? "boolean" : f.type || "text");
    const options = control === "boolean" ? [{ value: "true", label: "Habilitado" }, { value: "false", label: "Desabilitado" }] : f.options;
    let value2 = control === "boolean" ? String(f.value === true || f.value === 1 || f.value === "1" || f.value === "true") : String(f.value ?? "");
    if (typeof f.value === "boolean" && options?.some((o) => o.value === "1")) value2 = f.value ? "1" : "0";
    const attrs = `name="${esc(f.key)}" ${f.disabled || options && options.length === 0 ? "disabled" : ""} ${f.required ? "required" : ""}`;
    if (options || control === "select") return `<select ${attrs}>${(options || []).some((o) => String(o.value) === value2) ? "" : `<option value="" disabled selected>Não informado pelo equipamento</option>`}${(options || []).map((o) => `<option value="${esc(o.value)}" ${String(o.value) === value2 ? "selected" : ""}>${esc(o.label ?? o.value)}</option>`).join("")}</select>`;
    return `<input ${attrs} type="${["password", "number"].includes(control) ? control : control === "vlan" ? "number" : "text"}" value="${f.secret ? "" : esc(value2)}" autocomplete="${f.secret ? "new-password" : "off"}" ${["min", "max", "step", "placeholder"].filter((k) => f[k] != null).map((k) => `${k}="${esc(f[k])}"`).join(" ")}>`;
  }
  function bindFieldConditions(form, fields3) {
    const update = () => {
      for (const f of fields3) {
        if (!f.visibleWhen) continue;
        const condition = f.visibleWhen, source = fields3.find((s) => condition.key && s.key === condition.key || condition.intent_key && s.intent_key === condition.intent_key), parent = source && form.elements.namedItem(source.key), input = form.elements.namedItem(f.key), container = input?.closest(".field");
        if (!parent || !container) continue;
        const hidden = !(condition.values || [condition.equals]).map(String).includes(String(parent.value));
        container.hidden = hidden;
        const checkbox2 = container.querySelector("[data-change]");
        if (checkbox2) checkbox2.disabled = hidden || Boolean(f.disabled);
        input.disabled = hidden || Boolean(f.disabled) || checkbox2 && !checkbox2.checked;
      }
    };
    form.addEventListener("input", update);
    form.addEventListener("change", update);
    update();
    return update;
  }

  // apps/access_manager/static/js/shared/forms.js
  function editConfig(title, path2, fields3, extra = {}) {
    const serviceId = service.activeSession, operationRoute = window.__amStore?.view;
    const supported = fields3.filter((f) => f.value !== void 0 && f.value !== null && f.value !== "—");
    const d = dialog(title, `<form class="form-grid">${supported.map((f) => `<div class="field"><label>${esc(f.label)}</label>${fieldControl(f)}${f.help ? `<small>${esc(f.help)}</small>` : ""}</div>`).join("")}<div class="dialog-footer"><button class="button primary">Aplicar alterações</button></div></form>`);
    let oldPassword = "Não disponível neste firmware/login";
    let closed = false;
    const isWifi = path2 === "/api/device/wifi/ssid";
    if (isWifi) {
      const status3 = document.createElement("p");
      status3.dataset.passwordAuditStatus = "";
      status3.className = "muted";
      status3.textContent = "Lendo senha anterior para o atendimento…";
      d.querySelector("form").prepend(status3);
    }
    const passwordRead = isWifi ? request("/api/device/wifi/reveal-password", { method: "POST", scope: d._requestScope, body: "{}" }).then((data) => {
      const row = (Array.isArray(data) ? data : data.networks || []).find((r) => String(r.id) === String(extra.ssid_id));
      if (!closed && row?.password && row.password_hidden !== true) oldPassword = row.password;
    }).catch(() => {
    }).finally(() => {
      const status3 = d.querySelector("[data-password-audit-status]");
      if (!closed && status3) status3.textContent = oldPassword === "Não disponível neste firmware/login" ? "Senha anterior indisponível; o registro indicará essa limitação." : "Senha anterior capturada em memória; exibição mascarada no atendimento.";
    }) : Promise.resolve();
    d.addEventListener("close", () => {
      closed = true;
      oldPassword = "";
    }, { once: true });
    const audit = (config, result, previous = oldPassword) => {
      if (serviceId !== service.activeSession) return;
      addEntry({ path: path2, route: operationRoute, category: isWifi ? "Wi-Fi" : "Alteração", action: config.password ? "Alteração de senha / SSID" : title, target: isWifi ? `${fields3.find((f) => f.key === "ssid")?.value || "SSID"} (${extra.ssid_id})` : extra.band || path2, before: Object.fromEntries(supported.filter((f) => f.key !== "password" && f.key in config).map((f) => [f.key, f.value])), after: Object.fromEntries(Object.entries(config).filter(([k]) => k !== "password")), result, ...config.password ? { secrets: { old: previous, new: config.password } } : {} });
    };
    const form = d.querySelector("form");
    const original = new FormData(form);
    bindFieldConditions(form, supported);
    let submitting = false;
    form.onsubmit = async (e) => {
      e.preventDefault();
      if (submitting) return;
      const values = new FormData(form), config = {};
      for (const f of supported) {
        if (form.elements.namedItem(f.key)?.disabled) continue;
        if (values.get(f.key) !== original.get(f.key)) {
          const v = values.get(f.key);
          config[f.key] = f.options ? String(v) : f.type === "bool" || f.control === "boolean" ? v === "true" : f.type === "number" || f.control === "number" || f.control === "vlan" ? Number(v) : String(v);
        }
      }
      if (!Object.keys(config).length) {
        toast("Nenhuma alteração.");
        return;
      }
      if (!window.confirm("Prévia das alterações\n" + Object.entries(config).map(([key, value2]) => `${supported.find((f) => f.key === key)?.label || key}: ${supported.find((f) => f.key === key)?.secret || key === "password" ? "Segredo temporário alterado" : `${original.get(key)} → ${value2}`}`).join("\n"))) return;
      const payload = extra.ssid_id ? { ssid_id: extra.ssid_id, config } : { ...extra, ...config };
      const b = form.querySelector("button");
      b.disabled = true;
      submitting = true;
      let audited = false;
      try {
        await passwordRead;
        if (closed) return;
        const previous = oldPassword;
        const result = await request(path2, { method: "POST", scope: d._requestScope, body: JSON.stringify(payload), onResult: (data, ok) => {
          audited = true;
          audit(config, ok ? data?.verified === true ? "Confirmado por leitura" : "Comando enviado; confirmar estado no equipamento" : "Falha reportada pelo equipamento", previous);
        } });
        toast(result?.verified === true ? "Alteração confirmada por leitura do equipamento." : "Comando enviado; consulte o estado atualizado.");
        d.close();
        document.dispatchEvent(new CustomEvent("refresh-view"));
      } catch (err) {
        if (!audited) audit(config, err.name === "AbortError" ? "Espera cancelada; resultado remoto não confirmado" : `Falha: ${err.message}`);
        toast(err.message);
      } finally {
        b.disabled = false;
        submitting = false;
      }
    };
  }

  // apps/access_manager/static/js/workspaces/views/wifi.js
  var networks = [];
  var radios = [];
  function contents() {
    return `<section class="panel"><h2>Redes Wi-Fi</h2></section>${table([{ label: "SSID", keys: ["ssid"] }, { label: "Banda", keys: ["band", "banda"] }, { label: "Ativo", render: (r) => esc(bool(r.enabled ?? r.ativo)) }, { label: "Broadcast", render: (r) => esc(bool(r.broadcast)) }, { label: "Segurança", keys: ["security", "seguranca"] }, { label: "Ações", render: (r) => `<div class="inline-actions"><button class="button" data-reveal-wifi="${esc(r.id)}">Ver senha</button><button class="button" data-edit-ssid="${networks.indexOf(r)}" ${cap("wifi").enabled?.write ? "" : "disabled"}>Editar</button></div>` }], networks)}<section class="panel"><h2>Rádios</h2>${radios.map((r, i) => `<article class="panel"><h3>${esc(pick2(r, "band", "banda"))}</h3>${fields2([["Estado", bool(r.enabled ?? r.radio_ativo)], ["Canal", r.auto_channel === true || r.canal_automatico === true ? "Automático" : r.channel ?? r.canal], ["Canal atual", r.channel ?? r.canal], ["Canais permitidos", (r.available_channels || []).flatMap((g) => g.channels || g.canais || []).join(", ") || null], ["Seleção", (r.auto_channel ?? r.canal_automatico) == null ? null : r.auto_channel ?? r.canal_automatico ? "Automático" : "Manual"], ["Largura", r.bandwidth ?? r.largura], ["Padrão", r.standard ?? r.padrao], ["Potência", r.tx_power ?? r.potencia], ["País", r.country ?? r.pais], ["SGI", bool(r.sgi)]])}<details><summary>Avançado</summary>${kv(r)}</details><button class="button" data-edit-radio="${i}" ${cap("wifi_radio").enabled?.write ? "" : "disabled"}>Editar rádio</button></article>`).join("") || '<p class="muted">Sem dados de rádio.</p>'}</section>`;
  }
  function wire() {
    document.querySelectorAll("[data-reveal-wifi]").forEach((b) => b.onclick = async () => {
      b.disabled = true;
      try {
        const d = await request("/api/device/wifi/reveal-password", { method: "POST", body: "{}" });
        const r = (Array.isArray(d) ? d : d.networks || []).find((r2) => String(r2.id) === b.dataset.revealWifi);
        if (!r?.password || r.password_hidden === true) throw new Error("Senha não disponível neste firmware/login.");
        const modal = dialog("Senha Wi-Fi", `<p>${esc(r.ssid)}</p><div class="field"><label for="wifi-revealed-password">Senha da rede</label><input id="wifi-revealed-password" type="password" readonly autocomplete="off"></div>`, `<button class="button" data-show-wifi-password>Mostrar</button><button class="button" data-copy-wifi-password>Copiar</button><button class="button" data-dismiss-wifi-password>Fechar</button>`);
        const password = modal.querySelector("#wifi-revealed-password");
        password.value = r.password;
        modal.querySelector("[data-show-wifi-password]").onclick = (e) => {
          password.type = password.type === "password" ? "text" : "password";
          e.currentTarget.textContent = password.type === "password" ? "Mostrar" : "Ocultar";
        };
        modal.querySelector("[data-copy-wifi-password]").onclick = async (e) => {
          const button2 = e.currentTarget;
          button2.disabled = true;
          try {
            await copyText(password.value);
            toast("Senha copiada.");
          } catch {
            toast("Não foi possível copiar.");
          } finally {
            button2.disabled = false;
          }
        };
        modal.querySelector("[data-dismiss-wifi-password]").onclick = () => modal.close();
        modal.addEventListener("close", () => {
          password.value = "";
          r.password = "";
        }, { once: true });
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

  // apps/access_manager/static/js/shared/dns-presets.js
  var dnsPresetKinds = ["Padrão da operadora", "Filtro adulto", "IPTV / operacional", "Personalizado"];
  async function openDnsPresets() {
    const d = dialog("Presets DNS", `<p>DNS upstream. O DNS distribuído via DHCP e os hosts estáticos são configurações separadas. Nenhum endereço é sugerido automaticamente.</p><div data-presets>Carregando presets…</div><form id="dns-preset-form" class="form-grid"><div class="field"><label>Categoria</label><select name="kind">${dnsPresetKinds.map((k) => `<option>${esc(k)}</option>`).join("")}</select></div><div class="field"><label>Nome</label><input name="name" required maxlength="100"></div><div class="field"><label>Descrição</label><input name="description" maxlength="400"></div>${["ipv4_1", "ipv4_2", "ipv6_1", "ipv6_2"].map((k) => `<div class="field"><label>${esc(k.replace("_", " · "))}</label><input name="${k}" autocomplete="off"></div>`).join("")}<button class="button" type="submit">Salvar preset</button></form><div data-preview></div>`);
    d.classList.add("profile-dialog");
    const host = d.querySelector("[data-presets]"), out = d.querySelector("[data-preview]");
    let profiles2 = [];
    async function load() {
      profiles2 = (await request("/api/profiles", { scope: d._requestScope })).filter((p) => p.dns_preset);
      if (!d.open) return;
      host.innerHTML = `<div class="field"><label>Preset cadastrado</label><select data-preset><option value="">Selecione…</option>${profiles2.map((p, i) => `<option value="${i}">${esc(p.name)} · ${esc(p.dns_preset)}</option>`).join("")}</select></div><button type="button" class="button" data-prepare>Prévia do DNS</button>`;
      host.querySelector("[data-prepare]").onclick = async () => {
        const index = host.querySelector("select").value;
        if (index === "") return;
        const selected2 = profiles2[Number(index)], profile = { name: selected2.name, dns: selected2.dns };
        try {
          const p = await request("/api/profiles/preview", { scope: d._requestScope, method: "POST", body: JSON.stringify({ profile }) });
          if (!d.open) return;
          out.innerHTML = p.operations.map((op) => `<p>${esc(op.support)} · ${esc(op.evidence)} · ${op.will_apply ? "Aplicar" : "Pular"}</p>${table([{ label: "Campo", keys: ["field"] }, { label: "Atual", keys: ["current"] }, { label: "Desejado", keys: ["desired"] }], op.changes)}`).join("") + `<p>A alteração pode interromper a resolução de nomes.</p><button type="button" class="button primary" ${p.applicable ? "" : "disabled"}>Confirmar e aplicar preset DNS</button>`;
          out.querySelector("button").onclick = async (e) => {
            e.currentTarget.disabled = true;
            try {
              const result = await request("/api/profiles/apply", { scope: d._requestScope, method: "POST", body: JSON.stringify({ profile }) });
              if (d.open) out.textContent = `${result.verified} verificada(s), ${result.uncertain} incerta(s), ${result.failed} falha(s). Não reenviar automaticamente.`;
            } catch (error) {
              if (!isCancelled(error)) toast(error.message);
            }
          };
        } catch (error) {
          if (!isCancelled(error)) toast(error.message);
        }
      };
    }
    d.querySelector("form").onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget), dns = {};
      for (const key of ["ipv4_1", "ipv4_2", "ipv6_1", "ipv6_2"]) {
        const value2 = String(fd.get(key) || "").trim();
        if (value2) dns[key] = value2;
      }
      if (!Object.keys(dns).length) {
        toast("Cadastre pelo menos um endereço DNS.");
        return;
      }
      const b = e.currentTarget.querySelector("button");
      b.disabled = true;
      try {
        await request("/api/profiles", { scope: d._requestScope, method: "POST", body: JSON.stringify({ name: "DNS · " + String(fd.get("name")).trim(), description: String(fd.get("description") || ""), dns_preset: String(fd.get("kind")), dns }) });
        await load();
        toast("Preset DNS salvo.");
      } catch (error) {
        if (!isCancelled(error)) toast(error.message);
      } finally {
        b.disabled = false;
      }
    };
    try {
      await load();
    } catch (error) {
      if (d.open) host.textContent = error.message;
    }
  }

  // apps/access_manager/static/js/shared/wan-preset.js
  var standardWanPreset = { name: "internet_tr069", mode: "route", service_list: "INTERNET_TR069", mtu: "1492", link_mode: "PPP", transport_type: "PPPoE", auth_type: "Auto", trigger: "AlwaysOn", nat: "1", vlan_enabled: "1", vlan_id: "2000", priority: "0" };
  function suggestWanPreset(form, fields3, inputName, checkName) {
    for (const f of fields3) {
      const key = f.intent_key;
      if (!(key in standardWanPreset)) continue;
      const input = form.elements.namedItem(inputName(f));
      if (!input) continue;
      const value2 = standardWanPreset[key];
      if (input.tagName === "SELECT" && ![...input.options].some((o) => o.value === value2)) continue;
      input.value = value2;
      const check = form.querySelector(`[${checkName.attr}="${checkName.value(f)}"]`);
      if (check && !check.disabled) check.checked = true;
    }
    form.dispatchEvent(new Event("input", { bubbles: true }));
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
    const d = dialog(feature.title, `<div class="profile-content"><form id="surface-form"><p class="muted">Marque apenas os campos que deseja alterar. Campos não selecionados serão preservados.</p><div class="field"><label>Operação</label><select name="operation">${(row.actions || ["update"]).map((a) => `<option value="${a}">${{ update: "Editar", create: "Criar", delete: "Excluir" }[a]}</option>`).join("")}</select></div>${feature.id === "wan_crud" ? '<p><button type="button" class="button" data-wan-preset>Sugerir configuração padrão</button></p><p class="muted">Sugestão editável: internet_tr069, Routing, INTERNET_TR069, PPP/PPPoE, Auto, sempre ligado, MTU 1492, NAT, VLAN 2000/0. IPv6 mantém as opções atuais do firmware. Revise todos os valores antes de gerar a prévia.</p>' : ""}<div class="form-grid">${row.fields.map((f) => `<div class="field"><label><input type="checkbox" data-change="${esc(f.key)}" ${f.select && !f.options?.length ? "disabled" : ""}> ${esc(f.group ? f.group + " · " : "")}${esc(f.label)}</label>${fieldControl({ ...f, control: f.options?.length || f.select ? "select" : f.control || (f.secret ? "password" : "text") })}${f.help ? `<small>${esc(f.help)}</small>` : ""}</div>`).join("")}</div></form><div id="surface-preview"></div></div>`, `<button type="submit" form="surface-form" class="button primary">Gerar prévia</button>`);
    d.classList.add("profile-dialog");
    const form = d.querySelector("form");
    const syncFields = () => {
      for (const checkbox2 of form.querySelectorAll("[data-change]")) {
        const input = form.elements.namedItem(checkbox2.dataset.change);
        if (input) input.disabled = checkbox2.disabled || !checkbox2.checked;
      }
    };
    syncFields();
    form.addEventListener("input", syncFields);
    form.addEventListener("change", syncFields);
    bindFieldConditions(form, row.fields);
    d.querySelector("[data-wan-preset]")?.addEventListener("click", () => suggestWanPreset(form, row.fields, (f) => f.key, { attr: "data-change", value: (f) => f.key }));
    form.addEventListener("input", () => {
      d.querySelector("#surface-preview").replaceChildren();
    });
    form.onsubmit = async (event) => {
      event.preventDefault();
      const changes2 = {};
      for (const checkbox2 of form.querySelectorAll("[data-change]:checked:not(:disabled)")) changes2[checkbox2.dataset.change] = form.elements.namedItem(checkbox2.dataset.change).value;
      const out = d.querySelector("#surface-preview");
      out.innerHTML = '<p class="muted">Preparando prévia…</p>';
      try {
        const preview = await request("/api/device/configuration/preview", { scope: d._requestScope, method: "POST", body: JSON.stringify({ feature: feature.id, instance: row.id, changes: changes2, action: form.elements.namedItem("operation").value }) });
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
  async function mountWan() {
    const host = document.querySelector("#wan-editor");
    if (!host) return;
    const scope = currentScope();
    try {
      const catalog = await request("/api/device/configuration/catalog", { scope });
      const feature = catalog.find((f) => f.id === "wan_crud" || /wan/i.test(f.id) && f.category === "WAN");
      if (!feature) {
        host.textContent = "Somente leitura neste firmware/login";
        return;
      }
      const data = await request("/api/device/configuration/read", { scope, method: "POST", body: JSON.stringify({ feature: feature.id }) });
      if (!scopeActive(scope) || !host.isConnected) return;
      const rows3 = (data.instances || []).filter((r) => r.id !== "new");
      host.innerHTML = rows3.map((r, i) => `<section class="panel"><h3>${esc(r.label)}</h3><p class="muted">Estado atual · ${r.fields.filter((f) => !f.secret && f.value != null).slice(0, 8).map((f) => `${esc(f.label)}: ${esc(f.value)}`).join(" · ")}</p><button class="button" data-wan-edit="${i}">Editar conexão WAN / PPPoE</button></section>`).join("") || "Não disponível neste firmware/login.";
      host.querySelectorAll("[data-wan-edit]").forEach((b) => b.onclick = () => editSurface(feature, { ...rows3[Number(b.dataset.wanEdit)], actions: ["update"] }));
    } catch (e) {
      if (scopeActive(scope) && !isCancelled(e)) host.textContent = e.message;
    }
  }

  // apps/access_manager/static/js/workspaces/views/network.js
  var dhcpData;
  var dnsData;
  async function wan() {
    const data = await request("/api/device/wan");
    return '<section class="panel"><h2>Editar WAN / PPPoE</h2><div id="wan-editor">Lendo formulários disponíveis…</div></section>' + data.map((r) => `<section class="panel"><h2>${esc(r.name || "Conexão WAN")}</h2><div class="split"><article><h3>Status da conexão</h3>${fields2([["Estado", r.status], ["Tipo", r.connection_type], ["IPv4", r.ipv4], ["IPv6", r.ipv6], ["Gateway", r.gateway], ["VLAN", r.vlan]])}</article><article><h3>Autenticação e rede</h3>${fields2([["Usuário PPPoE", r.username], ["Serviço", r.service], ["DNS", r.dns], ["MTU", r.mtu], ["NAT", bool(r.nat)], ["Uptime", r.uptime], ["Prefixo IPv6", r.prefix]])}</article></div>${fields2([["Recebido", formatBytes(r.rx_bytes)], ["Enviado", formatBytes(r.tx_bytes)]])}<details><summary>Detalhes técnicos</summary>${kv(r.advanced || {})}</details></section>`).join("");
  }
  async function lan() {
    const d = await request("/api/device/lan");
    return table([{ label: "Porta", keys: ["port", "porta", "name"] }, { label: "Habilitada", render: (r) => esc(typeof r.enabled === "boolean" ? r.enabled ? "Sim" : "Não" : linkStatus(r.admin_state)) }, { label: "Link", render: (r) => {
      const raw = pick2(r, "link_state", "status", "state", "estado");
      const label = linkStatus(raw);
      return badge(label, /^(up|1|connected)$/i.test(String(raw)) ? "ok" : "info");
    } }, { label: "Velocidade", keys: ["speed", "velocidade"] }, { label: "Duplex", render: (r) => esc({ full: "Full duplex", half: "Half duplex", auto: "Automático" }[String(r.duplex || "").toLowerCase()] || r.duplex || "Não disponível") }, { label: "Negociação", keys: ["autonegotiation", "negotiation"] }, { label: "Cliente / MAC", keys: ["client", "mac"] }, { label: "RX bytes", keys: ["rx_bytes"] }, { label: "TX bytes", keys: ["tx_bytes"] }, { label: "Erros RX/TX", render: (r) => `${esc(pick2(r, "rx_errors"))}/${esc(pick2(r, "tx_errors"))}` }], Array.isArray(d) ? d : d?.ports || []);
  }
  async function dhcpdns() {
    const scope = currentScope();
    const results = await Promise.allSettled([request("/api/device/dhcp"), request("/api/device/dns")]);
    if (!scopeActive(scope)) throw cancelled();
    dhcpData = results[0].status === "fulfilled" ? results[0].value : null;
    dnsData = results[1].status === "fulfilled" ? results[1].value : null;
    return `<div class="split">${dhcpData ? `<section class="panel"><h2>DHCP</h2>${fields2([["Servidor", bool(dhcpData.enabled)], ["IP da LAN", dhcpData.lan_ip], ["Máscara", dhcpData.mask], ["Início do pool", dhcpData.pool_start], ["Fim do pool", dhcpData.pool_end], ["Lease (segundos)", dhcpData.lease_seconds], ["DNS primário", dhcpData.dns1], ["DNS secundário", dhcpData.dns2]])}</section>` : '<section class="panel">DHCP não disponível nesta sessão.</section>'}${dnsData ? `<section class="panel"><h2>DNS</h2>${fields2([["Domínio", dnsData.domain_name], ["DNS IPv4 primário", dnsData.ipv4_1], ["DNS IPv4 secundário", dnsData.ipv4_2], ["DNS IPv6 primário", dnsData.ipv6_1], ["DNS IPv6 secundário", dnsData.ipv6_2]])}</section>` : '<section class="panel">DNS não disponível nesta sessão.</section>'}</div><div class="toolbar"><button class="button" id="edit-dhcp" ${dhcpData && cap("dhcp").enabled?.write ? "" : "disabled"}>Editar DHCP</button><button class="button" id="dns-presets" ${cap("dns").enabled?.write ? "" : "disabled"}>Aplicar preset DNS</button><button class="button" id="edit-dns" ${dnsData && cap("dns").enabled?.write ? "" : "disabled"}>Editar DNS</button></div>${table([{ label: "Hostname", keys: ["hostname", "Name", "name"] }, { label: "IP", keys: ["ip", "IPAddr", "IPAddress"] }, { label: "MAC", keys: ["mac", "MACAddr", "MACAddress"] }], dhcpData?.leases || [], "Nenhum lease retornado.")}<section class="panel"><div class="panel-header"><h2>Reservas DHCP</h2><button id="new-reservation" class="button" ${cap("dhcp_reservations").enabled?.write ? "" : "disabled"}>Adicionar</button></div></section>${table([{ label: "Reserva", keys: ["name", "Name"] }, { label: "IP", keys: ["ip", "IPAddr"] }, { label: "MAC", keys: ["mac", "MACAddr"] }, { label: "Ações", render: (r) => cap("dhcp_reservations").enabled?.write ? `<div class="inline-actions"><button class="button" data-edit-reservation="${esc(r.id)}">Editar</button><button class="button danger" data-delete-reservation="${esc(r.id)}">Excluir</button></div>` : "Somente leitura" }], dhcpData?.reservations || [], "Nenhuma reserva retornada.")}${dnsHosts()}<section class="panel"><h2>IPTV / multicast</h2><p>Não disponível neste firmware/login.</p><p class="muted">Sem contrato operacional comprovado de IGMP proxy/snooping nesta sessão. Revise VLAN e serviço na WAN; DNS operacional pode ser cadastrado nos presets. Nenhum ajuste ALG ou multicast será enviado automaticamente.</p></section>`;
  }
  function mountDhcpDns() {
    document.querySelector("#dns-presets").onclick = openDnsPresets;
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
    previewAndApply: () => previewAndApply,
    render: () => render4
  });
  var state = { attendant: null, active: null, profiles: [] };
  var profiles = () => state.profiles || [];
  var field = (label, name, value2 = "", type = "text", extra = "") => `<div class="field"><label>${esc(label)}</label><input name="${esc(name)}" type="${esc(type)}" value="${esc(value2 ?? "")}" ${extra}></div>`;
  var checkbox = (label, name, value2 = false) => `<label class="profile-include"><input type="checkbox" name="${esc(name)}" ${value2 ? "checked" : ""}> ${esc(label)}</label>`;
  function choice(label, name, value2, options = []) {
    const normalized = options.map((o) => typeof o === "object" ? o : { value: o, label: o });
    if (!normalized.length) return field(label, name, value2);
    return `<div class="field"><label>${esc(label)}</label><select name="${esc(name)}">${normalized.some((o) => String(o.value) === String(value2)) ? "" : `<option value="${esc(value2 ?? "")}">${esc(value2 ?? "Não disponível")}</option>`}${normalized.map((o) => `<option value="${esc(o.value)}" ${String(o.value) === String(value2) ? "selected" : ""}>${esc(o.label ?? o.value)}</option>`).join("")}</select></div>`;
  }
  function listMarkup() {
    const active2 = state.active || "Nenhum perfil ativo";
    return `<section class="panel"><div class="panel-header"><div><small>CONFIGURAÇÃO PADRÃO</small><h2>Perfis do atendente</h2><p class="muted">Atendente: ${esc(state.attendant || "sessão local")} · perfil ativo: <strong>${esc(active2)}</strong></p></div><div class="inline-actions"><button class="button" id="capture-profile">CAPTURAR ATUAL</button><button class="button primary" id="new-profile">NOVA CONFIGURAÇÃO</button></div></div></section>${table([{ label: "Ativo", render: (r) => r.name === state.active ? "[ ATIVO ]" : "—" }, { label: "Nome", keys: ["name"] }, { label: "Descrição", keys: ["description"] }, { label: "Rádios", render: (r) => esc((r.wifi?.radios || (r.wifi?.radio ? [r.wifi.radio] : [])).map((x) => `${x.band ?? "—"}: ${x.auto_channel === true ? "Auto" : x.channel ?? "—"} · ${x.bandwidth ?? "—"} · ${x.standard ?? "—"} · ${x.tx_power ?? "—"}`).join(" / ") || "—") }, { label: "DNS", render: (r) => Object.keys(r.dns || {}).length ? "Configurado" : "—" }, { label: "Ações", render: (r) => `<div class="inline-actions">${r.name === state.active ? "" : `<button class="button" data-activate-profile="${esc(r.name)}">Ativar</button>`}<button class="button" data-edit-profile="${esc(r.name)}">Editar</button><button class="button" data-preview-profile="${esc(r.name)}">Preview / aplicar</button><button class="button danger" data-delete-profile="${esc(r.name)}">Excluir</button></div>` }], profiles(), "Nenhuma configuração salva para este atendente.")}`;
  }
  function radioEditor(r, index, stored = {}) {
    const band2 = r.band ?? r.banda ?? stored.band ?? `Rádio ${index + 1}`;
    const options = r.options || {};
    const current = {
      channel: r.channel ?? r.canal,
      bandwidth: r.bandwidth ?? r.largura,
      standard: r.standard ?? r.padrao,
      tx_power: r.tx_power ?? r.potencia,
      country: r.country ?? r.pais,
      auto_channel: r.auto_channel ?? r.canal_automatico,
      sgi: r.sgi,
      beacon_interval: r.beacon_interval,
      rts_cts: r.rts_cts,
      dtim: r.dtim,
      airtime_fairness: r.airtime_fairness,
      band_steering: r.band_steering,
      bandwidth_code: r.bandwidth_code
    };
    const value2 = (key) => stored[key] ?? current[key];
    const extras = ["rts_cts", "dtim", "airtime_fairness", "band_steering", "bandwidth_code"].filter((key) => value2(key) !== void 0 && value2(key) !== null);
    return `<section class="profile-section" data-radio-index="${index}"><div class="panel-header"><h3>Wi-Fi ${esc(band2)}</h3>${checkbox("Incluir no perfil", `include-radio-${index}`, Object.keys(stored).length > 0)}</div><input type="hidden" name="band-${index}" value="${esc(band2)}"><div class="form-grid">${choice("Canal", `channel-${index}`, value2("channel"), options.channel || [])}${choice("Largura", `bandwidth-${index}`, value2("bandwidth"), options.bandwidth || [])}${choice("Modo / standard", `standard-${index}`, value2("standard"), options.standard || [])}${choice("País", `country-${index}`, value2("country"), options.country || [])}${choice("Potência", `tx_power-${index}`, value2("tx_power"), options.tx_power || [])}${field("Beacon interval", `beacon_interval-${index}`, value2("beacon_interval") ?? "", "number", 'min="1"')}${choice("Canal automático", `auto_channel-${index}`, String(value2("auto_channel") ?? ""), [{ value: "true", label: "Automático" }, { value: "false", label: "Manual" }])}${choice("SGI", `sgi-${index}`, String(value2("sgi") ?? ""), [{ value: "true", label: "Ativo" }, { value: "false", label: "Inativo" }])}${extras.map((key) => key === "airtime_fairness" || key === "band_steering" ? choice(key.replaceAll("_", " "), `${key}-${index}`, String(value2(key)), [{ value: "true", label: "Ativo" }, { value: "false", label: "Inativo" }]) : field(key.replaceAll("_", " "), `${key}-${index}`, value2(key))).join("")}</div></section>`;
  }
  async function edit(profile = {}) {
    const opened = performance.now(), savedRadios = profile.wifi?.radios || (profile.wifi?.radio ? [profile.wifi.radio] : []), dns = profile.dns || {}, hosts = dns.hosts || [];
    let radios2 = [], radiosReady = false, wanRows = [];
    const dhcpWritable = Boolean(cap("dhcp").enabled?.write);
    const d = dialog(profile.name ? "Editar configuração" : "Nova configuração", `<div class="profile-content"><form id="profile-form"><section class="profile-section"><div class="form-grid">${field("Nome da configuração", "name", profile.name)}${field("Descrição", "description", profile.description)}</div></section><div id="profile-radios"><section class="profile-section" role="status"><h3>Wi-Fi</h3><p class="muted">Carregando capabilities e opções do equipamento…</p><div class="skeleton"></div></section></div><section class="profile-section"><h3>WAN / PPPoE</h3><p class="muted">Vinculado à instância WAN atual; usuário e senha PPPoE não são salvos. Marque apenas os campos desejados.</p><div id="profile-wan">Carregando formulários disponíveis…</div></section><section class="profile-section"><h3>Firewall</h3>${checkbox("Incluir firewall", "include-firewall", Object.keys(profile.firewall || {}).length > 0)}<div class="form-grid">${choice("Habilitado", "firewall-enabled", String(profile.firewall?.enabled ?? true), [{ value: "true", label: "Sim" }, { value: "false", label: "Não" }])}${choice("Nível do firewall", "firewall-level", profile.firewall?.level || "", [{ value: "", label: "Preservar nível atual" }, ...firewallLevels])}</div></section><section class="profile-section"><h3>DNS</h3><div class="form-grid">${field("Domínio", "domain_name", dns.domain_name)}${field("DNS IPv4 1", "ipv4_1", dns.ipv4_1 ?? dns.primary)}${field("DNS IPv4 2", "ipv4_2", dns.ipv4_2 ?? dns.secondary)}${field("DNS IPv6 1", "ipv6_1", dns.ipv6_1)}${field("DNS IPv6 2", "ipv6_2", dns.ipv6_2)}</div></section><section class="profile-section"><div class="panel-header"><h3>Nomes de servidor / Static DNS Hosts</h3><button type="button" class="button" id="add-profile-host">+ ADICIONAR</button></div><div id="profile-host-list">${hosts.map((h) => `<div class="toolbar"><input name="host-name" aria-label="Nome do host" value="${esc(h.name ?? h.nome ?? "")}"><input name="host-ip" aria-label="IP do host" value="${esc(h.ip ?? "")}"><button type="button" class="button" data-remove-host>Remover</button></div>`).join("")}</div></section>${dhcpWritable ? `<section class="profile-section"><h3>DHCP</h3><div class="form-grid">${field("Início do pool", "pool-start", profile.dhcp?.min_address)}${field("Fim do pool", "pool-end", profile.dhcp?.max_address)}${field("Lease time (segundos)", "lease", profile.dhcp?.lease_time, "number")}${field("DNS primário do DHCP", "dhcp-dns1", profile.dhcp?.dns1)}${field("DNS secundário do DHCP", "dhcp-dns2", profile.dhcp?.dns2)}</div></section>` : ""}</form></div>`, `<button type="button" class="button" data-cancel-profile>Cancelar</button><button type="submit" form="profile-form" class="button primary" id="save-profile">SALVAR PERFIL</button>`);
    d.classList.add("profile-dialog");
    d.addEventListener("close", () => d.classList.remove("profile-dialog"), { once: true });
    d.querySelector("[data-cancel-profile]").onclick = () => d.close();
    const form = d.querySelector("form");
    if (profile.name) form.querySelector('[name="name"]').readOnly = true;
    timing("profiles.modal.open", opened);
    const paint = (value2) => {
      if (!d.open) return;
      radios2 = Array.isArray(value2) ? [...value2] : value2?.radios || [];
      for (const saved2 of savedRadios) if (!radios2.some((r) => (r.band ?? r.banda) === saved2.band)) radios2.push({ ...saved2, options: {} });
      radiosReady = true;
      patchHTML(d.querySelector("#profile-radios"), radios2.map((r, i) => radioEditor(r, i, savedRadios.find((s) => s.band === (r.band ?? r.banda)) || {})).join("") || '<section class="profile-section"><p class="muted">O equipamento não expôs configuração de rádio nesta sessão. Os demais campos continuam editáveis.</p></section>');
      timing("profiles.options.ready", opened);
    };
    loadResource("/api/device/wifi/radios", { scope: d._requestScope, data: paint, error: (e) => {
      paint(savedRadios);
      if (d.open) d.querySelector("#profile-radios").insertAdjacentHTML("afterbegin", `<p class="notice warning">${esc(e.message)}</p>`);
    } });
    request("/api/device/configuration/catalog", { scope: d._requestScope }).then(async (catalog) => {
      const surface = catalog.find((f) => ["wan_crud", "wan_connection"].includes(f.id));
      if (!surface) throw new Error("Não disponível neste firmware/login.");
      const data = await request("/api/device/configuration/read", { scope: d._requestScope, method: "POST", body: JSON.stringify({ feature: surface.id }) });
      if (!d.open) return;
      wanRows = data.instances.filter((r) => r.id !== "new");
      d.querySelector("#profile-wan").innerHTML = wanRows.map((r, i) => {
        const stored = (profile.wan?.connections || []).find((c) => String(c.id) === String(r.id))?.config || {};
        return `<section class="profile-section"><h4>${esc(r.label)}</h4><button type="button" class="button" data-profile-wan-preset="${i}">Sugerir configuração padrão</button><div class="form-grid">${r.fields.filter((f) => f.intent_key && !f.secret && f.intent_key !== "username").map((f) => `<div class="field"><label><input type="checkbox" name="wan-include-${i}-${esc(f.intent_key)}" ${f.intent_key in stored ? "checked" : ""}> ${esc(f.group || "WAN")} · ${esc(f.label)}</label>${fieldControl({ ...f, key: `wan-${i}-${f.intent_key}`, value: stored[f.intent_key] ?? f.value, control: f.options?.length ? "select" : f.control })}</div>`).join("")}</div></section>`;
      }).join("");
      d.querySelectorAll("[data-profile-wan-preset]").forEach((b) => b.onclick = () => {
        const i = Number(b.dataset.profileWanPreset);
        suggestWanPreset(form, wanRows[i].fields, (f) => `wan-${i}-${f.intent_key}`, { attr: "name", value: (f) => `wan-include-${i}-${f.intent_key}` });
      });
    }).catch(() => {
      if (d.open) d.querySelector("#profile-wan").textContent = "Não disponível neste firmware/login. Perfis WAN existentes serão preservados.";
    });
    const wireHosts = () => d.querySelectorAll("[data-remove-host]").forEach((b) => b.onclick = () => b.parentElement.remove());
    wireHosts();
    d.querySelector("#add-profile-host").onclick = () => {
      d.querySelector("#profile-host-list").insertAdjacentHTML("beforeend", '<div class="toolbar"><input name="host-name" aria-label="Nome do host"><input name="host-ip" aria-label="IP do host"><button type="button" class="button" data-remove-host>Remover</button></div>');
      wireHosts();
    };
    form.onsubmit = async (event) => {
      event.preventDefault();
      const fd = new FormData(form), wifi = { ...profile.wifi }, dhcp = { ...profile.dhcp };
      if (radiosReady) {
        wifi.radios = radios2.flatMap((r, i) => {
          if (!fd.get(`include-radio-${i}`)) return [];
          const band2 = String(fd.get(`band-${i}`) || r.band || r.banda || ""), out = { ...savedRadios.find((s) => s.band === band2) || {}, band: band2 };
          for (const key of ["channel", "bandwidth", "standard", "tx_power", "country", "beacon_interval", "rts_cts", "dtim", "bandwidth_code"]) {
            const input = fd.get(`${key}-${i}`);
            if (input != null && String(input).trim() !== "") out[key] = String(input).trim();
            else delete out[key];
          }
          for (const key of ["auto_channel", "sgi", "airtime_fairness", "band_steering"]) {
            const input = fd.get(`${key}-${i}`);
            if (input === "true" || input === "false") out[key] = input === "true";
          }
          return [out];
        });
        delete wifi.radio;
      }
      if (dhcpWritable) for (const [input, key] of [["pool-start", "min_address"], ["pool-end", "max_address"], ["lease", "lease_time"], ["dhcp-dns1", "dns1"], ["dhcp-dns2", "dns2"]]) {
        const value2 = String(fd.get(input) || "").trim();
        if (value2) dhcp[key] = value2;
        else delete dhcp[key];
      }
      const names2 = fd.getAll("host-name"), ips = fd.getAll("host-ip"), nextHosts = names2.map((name, i) => ({ name: String(name).trim(), ip: String(ips[i] || "").trim() })).filter((h) => h.name || h.ip);
      const nextDns = { ...dns, domain_name: String(fd.get("domain_name") || "").trim(), ipv4_1: String(fd.get("ipv4_1") || "").trim(), ipv4_2: String(fd.get("ipv4_2") || "").trim(), ipv6_1: String(fd.get("ipv6_1") || "").trim(), ipv6_2: String(fd.get("ipv6_2") || "").trim(), hosts: nextHosts };
      delete nextDns.servers;
      delete nextDns.primary;
      delete nextDns.secondary;
      const wan2 = wanRows.length ? { connections: wanRows.flatMap((r, i) => {
        const config = {};
        for (const f of r.fields) {
          const key = f.intent_key;
          if (key && fd.get(`wan-include-${i}-${key}`)) config[key] = String(fd.get(`wan-${i}-${key}`) ?? "");
        }
        return Object.keys(config).length ? [{ id: r.id, config }] : [];
      }) } : profile.wan || {};
      const firewall = fd.get("include-firewall") ? { enabled: fd.get("firewall-enabled") === "true", ...fd.get("firewall-level") ? { level: String(fd.get("firewall-level")) } : {} } : {};
      const payload = { ...profile, wan: wan2, firewall, name: String(fd.get("name") || "").trim(), description: String(fd.get("description") || ""), wifi, dns: nextDns, dhcp }, button2 = d.querySelector("#save-profile");
      button2.disabled = true;
      try {
        await request("/api/profiles", { method: "POST", scope: d._requestScope, body: JSON.stringify(payload) });
        d.close();
        toast("Configuração salva para o atendente atual.");
        document.dispatchEvent(new CustomEvent("refresh-view"));
      } catch (error) {
        toast(error.message);
      } finally {
        button2.disabled = false;
      }
    };
  }
  function resultDialog(result) {
    const rows3 = result.steps || [];
    dialog("Resultado da aplicação", `<p>${result.applied} enviada(s), ${result.verified || 0} verificada(s), ${result.skipped} não suportada(s), ${result.failed} falha(s), ${result.uncertain || 0} incerta(s).</p>${table([{ label: "Etapa", keys: ["label"] }, { label: "Capability", keys: ["feature"] }, { label: "Status", keys: ["status"] }, { label: "Detalhe", render: (r) => esc(r.message || r.reason || r.result?.detail || r.result?.message || "—") }], rows3, "Nenhuma etapa foi executada.")}`);
  }
  async function previewAndApply(name) {
    try {
      const preview = await request("/api/profiles/preview", { method: "POST", body: JSON.stringify({ name }) });
      const d = dialog("Preview da configuração", `<p>${preview.applicable} operação(ões) aplicáveis; ${preview.skipped} serão ignoradas por capability.</p>${table([{ label: "Operação", keys: ["label"] }, { label: "Suporte", keys: ["support"] }, { label: "Evidência", keys: ["evidence"] }, { label: "Impacto", keys: ["impact"] }, { label: "Ação", render: (o) => o.will_apply ? "APLICAR" : "PULAR" }], preview.operations)}${preview.operations.map((op) => `<section class="panel"><h3>${esc(op.label)}</h3>${table([{ label: "Campo", keys: ["field"] }, { label: "Atual", keys: ["current"] }, { label: "Novo", keys: ["desired"] }], op.changes || [])}</section>`).join("")}${(preview.profile?.wan?.connections || []).map((c) => `<div class="field"><label>Nova senha PPPoE da WAN ${esc(c.id)} (opcional; não persistida)</label><input type="password" data-transient-wan="${esc(c.id)}" autocomplete="new-password"></div>`).join("")}${(preview.profile?.wifi?.ssids || []).map((s) => `<div class="field"><label>Nova senha de ${esc(s.ssid || s.id)} (opcional; não é persistida)</label><input type="password" data-transient-ssid="${esc(s.id)}" autocomplete="new-password" minlength="8"></div>`).join("")}`, `<button class="button primary" data-apply ${preview.applicable ? "" : "disabled"}>APLICAR PERFIL</button>`);
      d.querySelector("[data-apply]").onclick = async (event) => {
        event.currentTarget.disabled = true;
        try {
          const secrets = {};
          for (const input of d.querySelectorAll("[data-transient-ssid]")) if (input.value) secrets[input.dataset.transientSsid] = input.value;
          for (const input of d.querySelectorAll("[data-transient-wan]")) if (input.value) secrets["wan:" + input.dataset.transientWan] = input.value;
          const result = await request("/api/profiles/apply", { method: "POST", body: JSON.stringify({ name, secrets }) });
          d.close();
          resultDialog(result);
        } catch (error) {
          toast(error.message);
          event.currentTarget.disabled = false;
        }
      };
    } catch (error) {
      toast(error.message);
    }
  }
  function wire2() {
    document.querySelector("#new-profile")?.addEventListener("click", () => edit());
    document.querySelector("#capture-profile")?.addEventListener("click", async (event) => {
      event.currentTarget.disabled = true;
      try {
        const draft = await request("/api/profiles/capture", { method: "POST", body: "{}" });
        await edit(draft);
        toast("Configuração atual capturada como rascunho. Revise e salve quando estiver correta.");
      } catch (error) {
        toast(error.message);
      } finally {
        event.currentTarget.disabled = false;
      }
    });
    document.querySelectorAll("[data-edit-profile]").forEach((button2) => button2.onclick = () => edit(profiles().find((p) => p.name === button2.dataset.editProfile)));
    document.querySelectorAll("[data-activate-profile]").forEach((button2) => button2.onclick = async () => {
      try {
        await request("/api/profiles/active", { method: "POST", body: JSON.stringify({ name: button2.dataset.activateProfile }) });
        toast("Perfil ativo atualizado.");
        document.dispatchEvent(new CustomEvent("refresh-view"));
      } catch (error) {
        toast(error.message);
      }
    });
    document.querySelectorAll("[data-preview-profile]").forEach((button2) => button2.onclick = () => previewAndApply(button2.dataset.previewProfile));
    document.querySelectorAll("[data-delete-profile]").forEach((button2) => button2.onclick = () => {
      const d = dialog("Excluir configuração?", `<p>${esc(button2.dataset.deleteProfile)}</p><p class="muted">A exclusão afeta somente o atendente atual.</p>`, `<button class="button danger" data-confirm>EXCLUIR</button>`);
      d.querySelector("[data-confirm]").onclick = async (event) => {
        event.currentTarget.disabled = true;
        try {
          await request("/api/profiles", { method: "DELETE", body: JSON.stringify({ name: button2.dataset.deleteProfile }) });
          d.close();
          document.dispatchEvent(new CustomEvent("refresh-view"));
        } catch (error) {
          toast(error.message);
        }
      };
    });
  }
  function render4() {
    state = { attendant: null, active: null, profiles: [] };
    return `<section class="panel"><div class="panel-header"><div><small>CONFIGURAÇÃO PADRÃO</small><h2>Perfis do atendente</h2></div></div></section><div id="profile-list" role="status"><div class="panel"><p class="muted">Carregando configurações…</p><div class="skeleton"></div></div></div>`;
  }
  function mount4() {
    const paint = () => {
      const host = document.querySelector("#profile-list");
      if (!host) return;
      patchHTML(host, listMarkup());
      host.removeAttribute("role");
      wire2();
    };
    loadResource("/api/profiles", { data: (value2) => {
      state = { ...state, profiles: Array.isArray(value2) ? value2 : [] };
      paint();
      request("/api/profiles/state").then((meta2) => {
        if (meta2 && Array.isArray(meta2.profiles)) {
          state = { ...state, ...meta2 };
          paint();
        }
      }).catch(() => {
      });
    }, error: (error) => {
      const host = document.querySelector("#profile-list");
      if (host) host.innerHTML = `<div class="notice warning">${esc(error.message)}</div>`;
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

  // apps/access_manager/static/js/workspaces/views/management.js
  var definitions = [{ feature: "dmz", title: "DMZ", fields: [["enabled", "Habilitado", "bool"], ["internal_client", "IP do cliente"]] }, { feature: "upnp", title: "UPnP", fields: [["enabled", "Habilitado", "bool"]] }, { feature: "tr069", title: "TR-069", fields: [["url", "URL ACS"]] }, { feature: "firewall", title: "Firewall", fields: [["enabled", "Habilitado", "bool"], ["level", "Nível"]] }];
  var loaded = {};
  function presentation(feature, data) {
    const rows3 = { dmz: [["Estado", bool(data.enabled)], ["Cliente", data.internal_client || "Não configurado"], ["WAN", data.wan]], upnp: [["Estado", bool(data.enabled)]], tr069: [["Servidor ACS", data.url]], firewall: [["Estado", bool(data.enabled)], ["Nível", data.level]] };
    return fields2(rows3[feature] || []) + `<details><summary>Avançado</summary>${kv(data)}</details>`;
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
    return `<section class="panel"><h2>Telemetria do equipamento</h2>${device ? fields2([["Tempo ligado", uptime(device.uptime_seconds)], ["CPU", device.cpu_percent == null ? null : device.cpu_percent + " %"], ["Memória", device.memory_percent == null ? null : device.memory_percent + " %"], ["Temperatura", device.temperature_c == null ? null : device.temperature_c + " °C"]]) : '<p class="muted">Telemetria não disponível.</p>'}</section><section class="panel"><h2>Manutenção</h2><div class="capability-row"><strong>Reiniciar equipamento</strong>${capBadge(reboot.read)}${capBadge(reboot.write)}<button id="reboot-button" class="button danger" ${reboot.enabled?.write ? "" : "disabled"}>Reiniciar</button></div>${resetHost()}</section><div class="split">${definitions.map((d, i) => {
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
      editConfig("Editar " + definition.title, "/api/device/" + definition.feature, definition.fields.map(([key, label, type]) => ({ key, label, type, value: data[key], ...definition.feature === "firewall" && key === "level" ? { control: "select", options: window.__amStore?.session?.session?.vendor === "zte" ? firewallLevels : [{ value: data[key], label: data[key] }], disabled: window.__amStore?.session?.session?.vendor !== "zte", help: window.__amStore?.session?.session?.vendor === "zte" ? "" : "Somente leitura neste firmware/login; níveis ZTE não são enviados a outro fabricante." } : {} })));
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
  async function diagnostics3() {
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
  function mountDiagnostics3() {
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
      if (scopeActive(scope)) out.innerHTML = fields2([["Estado", { running: "Em andamento", finished: "Finalizado", timeout: "Tempo excedido", uncertain: "Sem confirmação" }[d.status] || d.status], ["Estado informado pelo firmware", d.native_state], ["Download (Mbps)", d.download_mbps], ["Upload (Mbps)", d.upload_mbps], ["Progresso (%)", d.progress], ["Latência (ms)", d.latency_ms]]);
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
    return `<div class="resource-grid">${[["cpu_percent", "CPU", "violet"], ["memory_percent", "Memória", "blue"], ["storage_percent", "Armazenamento", "green"]].map(([k, label, color]) => `<div><span>${label}</span><strong class="tech-value">${fmt(r[k], " %")}</strong>${r[k] != null && r[k] >= 0 && r[k] <= 100 ? `<div class="resource-track"><div class="resource-fill ${color}" style="width:${r[k]}%"></div></div>` : ""}</div>`).join("")}</div>` + fields2([["Temperatura", r.temperature_c == null ? null : fmt(r.temperature_c, " °C")], ["Uptime", uptime(r.uptime_seconds)], ["Sessões ativas", r.active_sessions], ["Firmware", r.firmware]]);
  }
  function wifiView(w, mesh) {
    return (w.bands || []).map((b) => `<details class="wifi-diagnostic-card"><summary><strong>${esc(b.band || "Rádio")}</strong><span class="tech-value">${fmt(b.avg_rssi, " dBm")}</span><span>${b.clients} associações observadas</span></summary>${fields2([["SSID", b.ssids], ["RSSI médio", fmt(b.avg_rssi, " dBm")], ["SNR médio", fmt(b.avg_snr, " dB")], ["Canal", b.radio.channel ?? b.radio.canal], ["Largura", b.radio.bandwidth ?? b.radio.largura], ["Padrão", b.radio.standard ?? b.radio.padrao], ["Potência", b.radio.tx_power ?? b.radio.potencia], ["Estado", b.radio.enabled === true || b.radio.radio_ativo === true ? "Ativo" : b.radio.enabled === false || b.radio.radio_ativo === false ? "Inativo" : null], ["Interferência", null]])}</details>`).join("") + (mesh?.nodes?.length || mesh?.enabled === true ? `<details class="wifi-diagnostic-card"><summary>Mesh · ${mesh.nodes.length} nós observados</summary>${table([{ label: "Nó", keys: ["id"] }, { label: "Pai", keys: ["parent"] }, { label: "Backhaul", keys: ["backhaul"] }], mesh.nodes)}</details>` : "") || '<p class="muted">Não disponível neste equipamento ou nesta execução.</p>';
  }
  function runtimeView(data) {
    const scan = data.bootstrap_probes?.compatibility_scan;
    if (!scan) return table([{ label: "Seção", keys: ["title"] }, { label: "Disponível", render: (r) => r.available ? "Dados retornados" : "Não disponível" }, { label: "Registros", keys: ["count"] }], Object.entries(data.sections || {}).map(([title, row]) => ({ title, available: row.available, count: row.record_count ?? (Array.isArray(row.data) ? row.data.length : null) })));
    return fields2([["Modelo informado", data.identity?.model], ["Firmware informado", data.identity?.firmware], ["Perfil de protocolo", data.profile_selection?.name], ["Melhor correspondência", scan.best_matching_profile], ["Perfis empatados", scan.tied_profiles], ["Scores", Object.entries(scan.profile_scores || {}).map(([name, score]) => `${name}: ${score}`).join(" · ")]]) + table([{ label: "Recurso", keys: ["feature"] }, { label: "Endpoint", keys: ["tag"] }, { label: "Resultado", keys: ["status"] }, { label: "Registros", keys: ["records"] }, { label: "Formato", keys: ["format"] }, { label: "Objetos observados", render: (r) => esc(Object.keys(r.nodes_seen || {}).join(", ")) }, { label: "Objetos não reconhecidos", render: (r) => esc((r.unknown_nodes || []).join(", ")) }], Object.entries(scan.endpoints || {}).map(([feature, entry]) => ({ feature, ...entry })));
  }
  function channelsView(result) {
    return (result.wifi_environment || []).map((entry) => {
      const a = entry.channel_analysis || {}, b = (result.wifi_quality?.bands || []).find((b2) => b2.band === entry.band) || {}, r = b.radio || {};
      return `<article class="wifi-diagnostic-card"><h3>${esc(entry.band)}</h3>${fields2([["Canal atual", a.current_channel], ["Seleção", a.auto_channel == null ? null : a.auto_channel ? "Automático" : "Manual"], ["Largura", r.bandwidth ?? r.largura], ["Padrão", r.standard ?? r.padrao], ["Potência", r.tx_power ?? r.potencia], ["País", r.country ?? r.pais], ["Canais permitidos", (entry.available_channels || []).flatMap((g) => g.channels || g.canais || []).join(", ") || null], ["Clientes", b.clients], ["RSSI médio", fmt(b.avg_rssi, " dBm")], ["SNR médio", fmt(b.avg_snr, " dB")], ["Redes vizinhas", a.neighbor_scan_confirmed ? a.neighbor_count : null], ["Score atual", a.current_score], ["Melhor canal observado", a.best_channel], ["Score do melhor canal", a.best_score]])}<p class="muted">${esc(a.recommendation?.message || entry.message || "Sem indicação de troca nesta medição.")}</p></article>`;
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
        if (scopeActive(scope)) put(id + "-result", id === "runtime" ? runtimeView(data) : fields2([["DNS do PC", data.dns?.ok ? "Resolvido" : "Sem resposta"], ["TCP 443 — respostas", data.tcp?.successful], ["Tempo médio TCP (ms)", data.tcp?.mean_connect_ms], ["Limitações", data.limitations]]));
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
  var worldBridge;
  var loginExperience;
  var infrastructureSettings = {};
  var huaweiConnectionSettings = {};
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
  var huaweiBngRoutes = routes;
  Object.assign(meta, Object.fromEntries(navigation2.flatMap(([group, items]) => items.map(([id, label]) => [id, [group, label]]))));
  var views = {
    ...juniperRoutes,
    ...huaweiBngRoutes,
    overview: overview_exports,
    clients: clients_exports,
    wifi: wifi_exports,
    profiles: profiles_exports,
    management: management_exports,
    capabilities: capabilities_exports,
    completeDiagnostics: complete_diagnostics_exports,
    traffic: traffic_exports,
    diagnostics: { render: diagnostics3, mount: mountDiagnostics3 },
    deployment: { render: deployment },
    wan: { render: wan, mount: mountWan },
    lan: { render: lan },
    dhcpdns: { render: dhcpdns, mount: mountDhcpDns }
  };
  function syncContext() {
    const s = store.session?.session;
    const connected = Boolean(store.session?.connected);
    const isJuniper = s?.vendor === "juniper", isHuaweiBng = s?.vendor === "huawei_bng";
    const infrastructureVendor = isJuniper || isHuaweiBng;
    document.querySelector(".app-shell").classList.toggle("infrastructure-shell", infrastructureVendor);
    document.querySelector(".app-shell").classList.toggle("juniper-shell", isJuniper);
    document.querySelector(".app-shell").classList.toggle("huawei-bng-shell", isHuaweiBng);
    document.querySelector("#action-dialog").classList.toggle("infrastructure-surface", infrastructureVendor);
    document.querySelector("#action-dialog").classList.toggle("juniper-surface", isJuniper);
    document.querySelector("#ctx-module").textContent = isHuaweiBng ? "/ Huawei / VRP BNG" : isJuniper ? "/ Juniper / Junos BNG" : "";
    document.querySelector("#juniper-help").hidden = !isJuniper;
    document.querySelectorAll("#sidebar .nav,#sidebar .nav-group,#sidebar .juniper-nav-group,#sidebar .infrastructure-nav-group").forEach((element) => {
      element.hidden = element.hasAttribute("data-huawei-bng-nav") ? !isHuaweiBng : element.hasAttribute("data-juniper-nav") ? !isJuniper : infrastructureVendor;
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
    back.hidden = infrastructureVendor || !store.session?.infrastructure?.connected;
    const disconnect = document.querySelector("#disconnect-button");
    const updated = document.querySelector("#ctx-updated");
    if (disconnect) disconnect.disabled = !s;
    if (updated) updated.textContent = s?.updated_at ? `Atualizado ${new Date(s.updated_at).toLocaleTimeString()}` : "—";
    document.dispatchEvent(new CustomEvent("app-context-ready"));
  }
  async function render9(name = store.view, background = false) {
    const vendor = store.session?.session?.vendor;
    if (vendor === "huawei_bng") name = name === "subscribers" ? "huaweiBngSubscribers" : Object.hasOwn(huaweiBngRoutes, name) ? name : "huaweiBngOverview";
    else if (vendor === "juniper" && !Object.hasOwn(juniperRoutes, name)) name = "juniperOverview";
    else if (vendor !== "juniper" && (Object.hasOwn(juniperRoutes, name) || Object.hasOwn(huaweiBngRoutes, name))) name = "overview";
    const scope = background ? currentScope() : beginView(name);
    if (!background) {
      views[store.view]?.unmount?.();
      const d = document.querySelector("#action-dialog");
      if (d?.open) d.close();
    }
    const state2 = { generation: scope.generation, loading: true, error: null };
    viewStates.set(name, state2);
    scope.controller.signal.addEventListener("abort", () => {
      state2.loading = false;
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
      if (Object.hasOwn(huaweiBngRoutes, name)) kickerEl.textContent = "Infraestrutura / Huawei BNG / VRP";
      else if (Object.hasOwn(juniperRoutes, name)) kickerEl.innerHTML = `<button class="j-crumb" data-juniper-route="juniperOverview">Infraestrutura</button> / <button class="j-crumb" data-juniper-route="juniperOverview">Juniper</button> / ${esc(titles[name][0])}`;
      else kickerEl.textContent = kicker;
    }
    if (titleEl) titleEl.textContent = title;
    document.querySelector(".page-heading").hidden = ["overview", "traffic", "completeDiagnostics"].includes(name);
    if (!store.session?.connected && name !== "profiles") {
      state2.loading = false;
      workspace.innerHTML = '<div class="empty-state"><strong>Nenhum equipamento conectado</strong><span>Conecte-se para carregar este workspace.</span></div>';
      return;
    }
    if (!background) document.querySelector(".app-main").scrollTop = 0;
    let waitTimer;
    if (!background) {
      workspace.innerHTML = Object.hasOwn(huaweiBngRoutes, name) ? '<section class="panel"><p>Consultando Huawei BNG…</p></section>' : Object.hasOwn(juniperRoutes, name) ? '<section class="panel j-wait" role="status"><p data-wait-label>Consultando Juniper…</p><div class="skeleton"></div><button class="button" data-cancel-wait>Cancelar espera</button></section>' : '<section class="panel" role="status"><p class="muted">Carregando dados…</p><div class="skeleton"></div><div class="skeleton"></div></section>';
      const cancel = workspace.querySelector("[data-cancel-wait]");
      if (cancel) {
        waitTimer = setTimeout(() => {
          if (scopeActive(scope) && state2.loading) {
            const label = workspace.querySelector("[data-wait-label]");
            if (label) label.textContent = "A consulta ainda está em andamento…";
          }
        }, 4e3);
        cancel.onclick = () => {
          scope.controller.abort();
          clearTimeout(waitTimer);
          workspace.innerHTML = '<section class="panel j-wait"><p>Espera cancelada. O comando remoto pode continuar em execução.</p><button class="button" data-resume-read>Consultar novamente</button></section>';
          workspace.querySelector("[data-resume-read]").onclick = () => render9(name);
        };
      }
    }
    try {
      const view = views[name] || views.overview;
      const html = await view.render();
      if (!scopeActive(scope)) return;
      state2.loading = false;
      clearTimeout(waitTimer);
      if (background) patchHTML(workspace, html);
      else workspace.innerHTML = html;
      view.mount?.();
    } catch (e) {
      clearTimeout(waitTimer);
      if (!scopeActive(scope) || isCancelled(e)) return;
      state2.loading = false;
      state2.error = e.message;
      clearTimeout(waitTimer);
      if (Object.hasOwn(juniperRoutes, name)) {
        workspace.innerHTML = errorMarkup(e);
        wireRetry(workspace, () => render9(name));
      } else workspace.innerHTML = `<div class="notice danger" role="alert">${esc(e.message)}</div>`;
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
      ...fd.get("vendor") === "huawei_bng" ? { vendor: "huawei_bng", port: fd.get("port") || null, ssh_port: Number(fd.get("ssh_port") || 22) } : {},
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
      if (payload.vendor === "huawei_bng") {
        huaweiConnectionSettings = { ...huaweiConnectionSettings, last_successful_host: payload.host, ssh_port: payload.ssh_port };
      }
      if (payload.vendor === "juniper") {
        infrastructureSettings = { ...infrastructureSettings, last_successful_host: payload.host, ssh_port: payload.ssh_port, netconf_port: payload.netconf_port, preferred_transport: payload.transport };
      }
      store.setCapabilities(s.session?.capabilities || {});
      syncContext();
      const password = form.querySelector('[name="password"]');
      if (password) password.value = "";
      toast(`Conectado via ${["juniper", "huawei_bng"].includes(payload.vendor) ? s.session.protocol_family || "SSH" : payload.https ? "HTTPS" : "HTTP"} em ${s.session.model || s.session.vendor || payload.host}.`);
      await render9("overview");
      await loginExperience?.afterConnect(worldBridge);
    } catch (err) {
      document.querySelector("#connection-feedback").textContent = err?.message || "Não foi possível conectar ao equipamento.";
      document.querySelector("#connection-status").textContent = "Conexão não confirmada";
      toast(err?.message || "Não foi possível conectar ao equipamento.");
      console.error("[Access Manager] Falha de conexão:", err);
    } finally {
      connectionBusy = false;
      if (["juniper", "huawei_bng"].includes(payload.vendor)) form.elements.password.value = "";
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
    mountServicePanel(store);
    const theme = mountThemeProvider();
    loginExperience = mountLoginExperience(theme);
    const routeRegistry = createRouteRegistry(views, navigation, worldActions, navigation2);
    worldBridge = mountWorldBridge({ store, theme, registry: routeRegistry, navigate: (name) => render9(name), suspend: () => {
      views[store.view]?.unmount?.();
      beginView("world");
    }, resume: () => render9(store.view) });
    let ordinal = 0;
    document.querySelector("#sidebar").innerHTML = routerNavigation.map(([group, items]) => `<div class="nav-group">${esc(group)}</div>${items.map(([id, label], index) => `<button class="nav" data-view="${id}">${String(++ordinal).padStart(2, "0")} <span>${esc(label)}</span></button>`).join("")}`).join("");
    const oldNav = document.querySelectorAll("[data-juniper-nav]");
    oldNav.forEach((n) => n.remove());
    document.querySelector("#sidebar").insertAdjacentHTML("afterbegin", navigation.map(([group, items], index) => `<details class="juniper-nav-group" data-juniper-nav hidden ${index < 2 ? "open" : ""}><summary>${esc(group)}</summary>${items.map(([route, label]) => `<button class="nav" data-juniper-nav data-view="${route}" hidden><span>${esc(label)}</span></button>`).join("")}</details>`).join(""));
    document.querySelector("#sidebar").insertAdjacentHTML("afterbegin", navigation2.map(([group, items]) => `<details class="infrastructure-nav-group" data-huawei-bng-nav hidden open><summary>${esc(group)}</summary>${items.map(([id, label]) => `<button class="nav" data-huawei-bng-nav data-view="${id}" hidden>${esc(label)}</button>`).join("")}</details>`).join(""));
    document.querySelector("#juniper-help").onclick = () => dialog("Ajuda · Juniper / Junos BNG", "<p>Busque o contrato, selecione uma sessão e consulte detalhes sem sair da lista. Leituras avançadas são feitas sob demanda.</p><p>O acesso ao CPE usa credenciais separadas. Voltar ao assinante mantém a sessão Juniper; portas inacessíveis não confirmam assinante offline.</p>");
    document.addEventListener("infrastructure-navigate", (event) => render9(event.detail));
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
    if (store.session?.session?.vendor !== "huawei_bng") {
      try {
        infrastructureSettings = await request("/api/infrastructure/settings");
      } catch {
      }
    }
    try {
      huaweiConnectionSettings = await request("/api/infrastructure/settings/huawei_bng");
    } catch {
    }
    const syncVendor = (event) => {
      const vendor = form.elements.vendor.value;
      const isJuniper = vendor === "juniper";
      const isHuaweiBng = vendor === "huawei_bng";
      const infrastructureVendor = isJuniper || isHuaweiBng;
      const settings = isHuaweiBng ? huaweiConnectionSettings : infrastructureSettings;
      form.elements.transport.closest(".field").hidden = isHuaweiBng;
      form.elements.transport.disabled = isHuaweiBng;
      form.elements.transport.querySelector("[value=ssh]").textContent = isHuaweiBng ? "SSH / CLI (Huawei VRP)" : "SSH / XML";
      form.elements.netconf_port.disabled = isHuaweiBng;
      document.querySelector("#netconf-port-field").hidden = isHuaweiBng;
      if (isHuaweiBng) form.elements.transport.value = "ssh";
      document.querySelector("#infrastructure-connection").hidden = !infrastructureVendor;
      form.querySelector(".https-toggle").hidden = infrastructureVendor;
      document.querySelector("#login-page").classList.toggle("infrastructure-login", infrastructureVendor);
      document.querySelector("#action-dialog").classList.toggle("infrastructure-surface", infrastructureVendor);
      document.querySelector("#action-dialog").classList.toggle("juniper-surface", isJuniper);
      form.elements.password.autocomplete = infrastructureVendor ? "off" : "current-password";
      form.elements.username.autocomplete = infrastructureVendor ? "off" : "username";
      form.querySelector("[for=connection-host]").textContent = infrastructureVendor ? "Servidor" : "IP ou IP:porta";
      form.querySelector("[for=connection-user]").textContent = infrastructureVendor ? "Usuário AD" : "Usuário";
      form.querySelector("[for=connection-password]").textContent = infrastructureVendor ? "Senha AD" : "Senha";
      if (infrastructureVendor) {
        if (event?.type === "change" || !form.elements.host.value) form.elements.host.value = settings.last_successful_host || settings.default_host || "";
        form.elements.ssh_port.value = settings.ssh_port || 22;
        form.elements.netconf_port.value = isJuniper ? settings.netconf_port || 830 : "";
        form.elements.transport.value = isHuaweiBng ? "ssh" : settings.preferred_transport || "ssh";
      }
      document.querySelector(".connection-security").textContent = infrastructureVendor ? "Use sua conta corporativa no concentrador. A senha é descartada após cada tentativa." : "As credenciais são usadas na sessão com o equipamento. Selecione HTTPS quando disponível.";
    };
    form.elements.vendor.onchange = syncVendor;
    syncVendor();
    document.querySelector("#inspect-host-key").onclick = async () => {
      try {
        const info = await request("/api/infrastructure/host-key", { method: "POST", body: JSON.stringify({ host: store.session?.connected && ["juniper", "huawei_bng"].includes(store.session.session?.vendor) ? store.session.session.host : form.elements.host.value, port: form.elements.transport.value === "netconf" ? form.elements.netconf_port.value : form.elements.ssh_port.value }) });
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
      if (s.connected && loginExperience?.selected === "world3d") await worldBridge.enter();
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
