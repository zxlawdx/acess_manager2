# Legacy parser evidence

| File | Line | Context |
| --- | --- | --- |
| README.md | 5 | A versão web/FastAPI foi convertida para a arquitetura do Vela sem alterar a lógica de protocolo que já estava funcionando no equipamento. A janela é nativa via `pywebview`, a UI continua em HTML/CSS/JS e a comunicação com o Python passa pelo servidor Bottle interno do Vela. |
| README.md | 68 | HTML + CSS + JS (SPA) |
| build.bat | 107 | if not exist "dist\ZTEAutomatic\_internal\apps\zte_manager\templates\index.html" ( |
| tools/build_frontend_template.py | 3 | Edit apps/zte_manager/templates/source/pages/**/*.html, NOT the generated |
| tools/build_frontend_template.py | 4 | index.html. The generated artifact stays committed because Vela renders a |
| tools/build_frontend_template.py | 6 | index.html. |
| tools/build_frontend_template.py | 13 | import argparse |
| tools/build_frontend_template.py | 20 | TARGET = ROOT / "index.html" |
| tools/build_frontend_template.py | 22 | "shell_start.html", |
| tools/build_frontend_template.py | 23 | "pages/connection.html", |
| tools/build_frontend_template.py | 24 | "pages/dashboard.html", |
| tools/build_frontend_template.py | 25 | "pages/wifi.html", |
| tools/build_frontend_template.py | 26 | "pages/wan.html", |
| tools/build_frontend_template.py | 27 | "pages/clients.html", |
| tools/build_frontend_template.py | 28 | "pages/supportDiagnostic.html", |
| tools/build_frontend_template.py | 29 | "pages/diagnostics.html", |
| tools/build_frontend_template.py | 30 | "pages/profiles.html", |
| tools/build_frontend_template.py | 31 | "pages/tr069.html", |
| tools/build_frontend_template.py | 32 | "pages/advanced/workbench_discovery.html", |
| tools/build_frontend_template.py | 33 | "pages/advanced/network.html", |
| tools/build_frontend_template.py | 34 | "pages/advanced/huawei_security.html", |
| tools/build_frontend_template.py | 35 | "pages/advanced/inspector_close.html", |
| tools/build_frontend_template.py | 36 | "pages/device.html", |
| tools/build_frontend_template.py | 37 | "pages/management/fleet.html", |
| tools/build_frontend_template.py | 38 | "pages/management/remote_monitor.html", |
| tools/build_frontend_template.py | 39 | "pages/management/network_mesh.html", |
| tools/build_frontend_template.py | 40 | "pages/management/lifecycle_provisioning.html", |
| tools/build_frontend_template.py | 41 | "shell_end.html", |
| tools/build_frontend_template.py | 48 | "pages/advanced/workbench_discovery.html", |
| tools/build_frontend_template.py | 49 | "pages/advanced/network.html", |
| tools/build_frontend_template.py | 50 | "pages/advanced/huawei_security.html", |
| tools/build_frontend_template.py | 51 | "pages/management/fleet.html", |
| tools/build_frontend_template.py | 52 | "pages/management/remote_monitor.html", |
| tools/build_frontend_template.py | 53 | "pages/management/network_mesh.html", |
| tools/build_frontend_template.py | 54 | "pages/management/lifecycle_provisioning.html", |
| tools/build_frontend_template.py | 99 | "index.html is stale; run python tools/build_frontend_template.py\n" |
| tools/build_frontend_template.py | 109 | parser = argparse.ArgumentParser(description="Build the modular Vela HTML.") |
| tools/build_frontend_template.py | 110 | parser.add_argument("--check", action="store_true", help="Verify committed index.html is current") |
| tools/build_frontend_template.py | 111 | args = parser.parse_args() |
| tools/build_frontend_template.py | 115 | raise SystemExit("index.html is missing; run python tools/build_frontend_template.py") |
| tools/f6201b_apply_capture.js | 20 | open: XMLHttpRequest.prototype.open, |
| tools/f6201b_apply_capture.js | 21 | send: XMLHttpRequest.prototype.send, |
| tools/f6201b_apply_capture.js | 22 | setRequestHeader: XMLHttpRequest.prototype.setRequestHeader |
| tools/f6201b_apply_capture.js | 59 | return { format: "not_xml_or_unavailable" }; |
| tools/f6201b_apply_capture.js | 62 | const doc = new DOMParser().parseFromString(raw, "application/xml"); |
| tools/f6201b_apply_capture.js | 63 | if (doc.querySelector("parsererror")) return { format: "malformed_xml" }; |
| tools/f6201b_apply_capture.js | 68 | format: "xml", |
| tools/f6201b_apply_capture.js | 133 | XMLHttpRequest.prototype.open = function (method, url, ...rest) { |
| tools/f6201b_apply_capture.js | 139 | XMLHttpRequest.prototype.setRequestHeader = function (name, value) { |
| tools/f6201b_apply_capture.js | 145 | XMLHttpRequest.prototype.send = function (body) { |
| tools/f6201b_apply_capture.js | 182 | XMLHttpRequest.prototype.open = original.open; |
| tools/f6201b_apply_capture.js | 183 | XMLHttpRequest.prototype.send = original.send; |
| tools/f6201b_apply_capture.js | 184 | XMLHttpRequest.prototype.setRequestHeader = original.setRequestHeader; |
| docs/PHASE2_RUNTIME_REGISTRAR_CLIPBOARD.md | 30 | `templates/index.html`: capacidades do host Python determinam o |
| docs/F6201B_EXPERIMENTAL_WRITES.md | 24 | - `wlan_wlansssidconf_lua.lua`: o XML possui **três blocos |
| docs/F6201B_EXPERIMENTAL_WRITES.md | 26 | o último contém `KeyPassphrase`. O parser anterior descartava os |
| docs/F6201B_EXPERIMENTAL_WRITES.md | 32 | Um XML truncado no arquivo de captura NÃO autoriza fabricar valores; |
| docs/F6201B_EXPERIMENTAL_WRITES.md | 42 | apenas se resposta XML atual estiver completa. |
| docs/frontend-css-architecture.md | 9 | `templates/source/shell_start.html` is the source of truth for stylesheet links. |
| docs/frontend-css-architecture.md | 10 | `templates/index.html` is generated by `tools/build_frontend_template.py` and |
| docs/frontend-css-architecture.md | 222 | `pages/advanced/workbench_discovery.html`. |
| docs/AUDITORIA_FUNCOES_ZTE_2026.md | 31 | \| E2631 / AX3000, SR7410 / BE7200 Pro+ \| `vueData`: `vue_client_data`, `localnet_lan_info_lua`, `vue_mainwan_data` \| LoginData + leitura experimental Vue; identificadores no relatório público são excluídos \| Configuração completa Vue, parser por revisão, backup, firmware \| |
| docs/AUDITORIA_FUNCOES_ZTE_2026.md | 34 | `sucesso HTTP 200` **não** confirma disponibilidade de endpoint: parsers |
| docs/AUDITORIA_FUNCOES_ZTE_2026.md | 35 | verificam XML, objeto esperado e mensagens de erro. Para Vue, o teste real do |
| docs/MULTIMODEL_ZTE.md | 23 | \| E2631 / SR7410 \| Autenticação `loginData` existente com seleção e probe `vueData`, leitura de clientes em hipótese de XML compatível \| Dependem de teste real Vue por firmware; não usar menus ThinkLua nem escrever \| |
| docs/MULTIMODEL_ZTE.md | 58 | 5. Teste **Clientes** (Wi-Fi e LAN) para confirmar o parser real de cada |
| docs/MULTIMODEL_ZTE.md | 59 | operadora/firmware. A resposta XML vazia é válida se o objeto existir |
| docs/MULTIMODEL_ZTE.md | 69 | especialmente seus perfis públicos de endpoints e formatos XML/JSON ThinkLua |
| docs/MULTIMODEL_ZTE.md | 70 | e Vue. Esta implementação de testes, despacho e parsers foi escrita |
| docs/DEVICE_ADAPTER_PHASE1.md | 74 | livre como XML cru ou textos arbitrários contendo senhas exige política de |
| docs/DEVICE_ADAPTER_PHASE1.md | 76 | `save_change` sem um parser/redator especializado. |
| docs/F670L-WINDOWS-COMPAT.md | 10 | - Backup rejeita respostas HTML de sessão expirada com HTTP 200; o erro explica que um fluxo específico do firmware pode ser necessário. NÃO há restauração automática. |
| docs/F670L-WINDOWS-COMPAT.md | 23 | 5. Tentar backup: conferir arquivo binário e tamanho. Se retornar mensagem **HTML**, a ONT não enviou configuração; capturar somente formato/caminho/status HTTP e conteúdo estrutural sem credenciais para desenvolver adaptador específico. |
| docs/ZTE_TRACKER_DISCOVERY.md | 9 | HTTP 200 com XML sem objeto esperado também podia ser indevidamente classificada |
| docs/ZTE_TRACKER_DISCOVERY.md | 46 | - Resposta válida exige XML ThinkLua, sucesso e objeto específico: |
| docs/ZTE_TRACKER_DISCOVERY.md | 47 | HTTP 200 com HTML de login ou XML de outro menu **não** confirma recurso. |
| docs/ZTE_TRACKER_DISCOVERY.md | 53 | - Scripts de regressão e fluxo de CI verificam inventário, parsers, UI e |
| docs/ZTE_TRACKER_DISCOVERY.md | 61 | clientes, WAN, SSIDs e PON; verificar se a página de login não substitui o XML. |
| docs/F6600P_DHCP_TR069_PROVIDER_NAMED_PRESETS.md | 7 | parsed the ThinkLua XML instances and directly returned `MinAddress` and |
| docs/F6600P_DHCP_TR069_PROVIDER_NAMED_PRESETS.md | 11 | leases.** A successful menuData HTTP 200 does not assert XML semantics. |
| docs/F6600P_DHCP_TR069_PROVIDER_NAMED_PRESETS.md | 13 | The fix decodes only fields that the firmware marks in `<encode>` or |
| docs/F6600P_DHCP_TR069_PROVIDER_NAMED_PRESETS.md | 19 | Decoded fields are displayed; unconfirmed protected fields are replaced |
| docs/F6600P_DHCP_TR069_PROVIDER_NAMED_PRESETS.md | 29 | Separately, the legacy HTML had **duplicate DOM IDs** across WAN/DHCP |
| docs/F6600P_DHCP_TR069_PROVIDER_NAMED_PRESETS.md | 85 | on the real F6600P V9.0.10P6N34 and compare decoded `MinAddress` |
| docs/FRONTEND_MODULES.md | 3 | The Vela app runs one prebuilt `index.html` so existing DOM hooks, local |
| docs/FRONTEND_MODULES.md | 7 | `shell_start.html`, twelve page modules under `pages/`, and |
| docs/FRONTEND_MODULES.md | 8 | `shell_end.html`. The checked-in `index.html` is a generated artifact. |
| docs/FRONTEND_MODULES.md | 10 | After editing HTML run: |
| docs/UI_LAYOUT_FIX_2026-09-29.md | 33 | and an HTML dataset; the main content occupies `minmax(0,1fr)`. |
| docs/UI_LAYOUT_FIX_2026-09-29.md | 47 | - Source/template generation: 14 modular HTML parts joined exactly into |
| docs/UI_LAYOUT_FIX_2026-09-29.md | 48 | `templates/index.html`; 424 unique `id` values and no duplicates. |
| docs/UI_LAYOUT_FIX_2026-09-29.md | 55 | JavaScript syntax parsed. |
| docs/PHASE3_INVENTORY_API_ERRORS.md | 11 | An instance is created after the DOM has parsed via `type="module"` and |
| docs/PHASE3_INVENTORY_API_ERRORS.md | 25 | and `textContent`, not a large `innerHTML` string. |
| docs/PHASE3_INVENTORY_API_ERRORS.md | 73 | and Linux WebKit require real packaged builds); unrelated HTML/CSS or the |
| docs/PROTOCOL.md | 31 | `apps/zte_manager/model/zte_configuration/zte_post.py` replica esse fluxo. A chave RSA é extraída de `asyEncode()` no HTML/JS da própria ONT para não assumir que firmwares diferentes compartilham a mesma chave. |
| docs/PROTOCOL.md | 42 | O XML real retornou: |
| docs/F6201B_WORKBENCH_STATUS.md | 16 | - **Laboratório supervisionado**: implementado neste PR. GET do objeto XML, |
| docs/F6201B_WORKBENCH_STATUS.md | 33 | \| 04 \| wlan_wps_lua.lua \| Formulário capturado \| Preservar SSID_InstID e WPSChoose do HTML atual \| |
| docs/F6201B_WORKBENCH_STATUS.md | 34 | \| 05 \| wlan_wlanbasicadconf_lua.lua \| Adaptador existente \| Respostas XML integrais de RF e aplicação física por banda \| |
| docs/F6201B_WORKBENCH_STATUS.md | 66 | 14 formulários complexos usando os objetos XML efetivamente expostos, |
| docs/F6201B_WORKBENCH_STATUS.md | 67 | leitura dos controles HTML atuais, seleção de instância, |
| docs/F6201B_WORKBENCH_STATUS.md | 70 | - **Strategy / catálogo:** services/f6201b_workbench.py define objetos XML |
| docs/ARCHITECTURE.md | 7 | SPA HTML/CSS/JS |
| docs/ARCHITECTURE.md | 92 | -> parse / sanitize |
| docs/ACCESS_MANAGER_CAPABILITY_AUDIT.md | 16 | firmware V9.3.10P7N7, objeto XML, campos do menuView e identidade da |
| tests/test_provider_diagnostics_ui.cjs | 11 | const html=fs.readFileSync(root+"templates/index.html","utf8"); |
| tests/test_provider_diagnostics_ui.cjs | 36 | ])assert.ok(html.includes('id="'+id+'"'),id); |
| tests/test_provider_diagnostics_ui.cjs | 37 | assert.match(html,/features\/provider_diagnostics\.js/); |
| tests/test_provider_diagnostics_ui.cjs | 38 | assert.match(html,/css\/components\/provider_diagnostics\.css/); |
| tests/test_provider_diagnostics_ui.cjs | 131 | const html=render(report); |
| tests/test_provider_diagnostics_ui.cjs | 132 | assert.match(html,/25\.0%/); |
| tests/test_provider_diagnostics_ui.cjs | 133 | assert.match(html,/18 ms/); |
| tests/test_provider_diagnostics_ui.cjs | 134 | assert.match(html,/1 de 2/); |
| tests/test_provider_diagnostics_ui.cjs | 135 | assert.match(html,/Resolveu/); |
| tests/test_provider_diagnostics_ui.cjs | 136 | assert.match(html,/7 saltos/); |
| tests/test_provider_diagnostics_ui.cjs | 137 | assert.match(html,/não descreve necessariamente a conexão/); |
| tests/test_f6201b_operator_reads.py | 20 | return "<html>mock session</html>" |
| tests/test_f6201b_operator_reads.py | 25 | return """<ajax_response_xml_root> |
| tests/test_f6201b_operator_reads.py | 34 | </ajax_response_xml_root>""" |
| tests/test_f6201b_operator_reads.py | 43 | def test_rootless_xml_is_structurally_inspected_without_values(self): |
| tests/test_f6201b_operator_reads.py | 66 | router.get_menu = lambda _tag, **_opts: "<html>SECRET_SESSION_TOKEN</html>" |
| tests/test_device_tr069_workflow.cjs | 4 | const src=fs.readFileSync("apps/zte_manager/templates/index.html","utf8"); |
| tests/test_device_tr069_workflow.cjs | 5 | const device=fs.readFileSync("apps/zte_manager/templates/source/pages/device.html","utf8"); |
| tests/test_device_tr069_workflow.cjs | 6 | const tr069=fs.readFileSync("apps/zte_manager/templates/source/pages/tr069.html","utf8"); |
| tests/test_f6600p_support_ui.cjs | 33 | assert.ok(code.includes("output.insertAdjacentHTML"), |
| tests/test_security.py | 13 | html = '_sessionTmpToken = "\\x31\\x32\\x33\\x34";' |
| tests/test_security.py | 17 | html |
| tests/test_huawei_phase5_hg8347r_lab.py | 33 | return fixture("hg8347r_userdev_page.html") |
| tests/test_huawei_phase5_hg8347r_lab.py | 169 | "/html/ssmp/reset/set.cgi?x=ResetBoard", |
| tests/test_huawei_phase5_hg8347r_lab.py | 171 | referer="http://192.0.2.1/html/ssmp/reset/reset.asp", |
| tests/test_huawei_phase5_hg8347r_lab.py | 179 | self.assertIn(b"POST /html/ssmp/reset/set.cgi?x=ResetBoard HTTP/1.1", raw) |
| tests/test_history_view.cjs | 9 | const html=fs.readFileSync("apps/zte_manager/templates/index.html","utf8"); |
| tests/test_history_view.cjs | 11 | "apps/zte_manager/templates/source/shell_end.html","utf8"); |
| tests/test_history_view.cjs | 40 | for(const src of [html,source]){ |
| tests/test_history_view.cjs | 46 | assert.match(advanced,new RegExp("async function "+fn+"\\(")); |
| tests/test_history_view.cjs | 77 | {path:"/tmp/private/firmware/config.xml",size:312}: |
| tests/test_history_view.cjs | 81 | assert.match(result,/config\.xml/); |
| tests/test_vela_conversion.py | 45 | / "index.html" |
| tests/test_vela_conversion.py | 150 | 'data-profile-band="${escapeHtml(band)}"', |
| tests/test_vela_conversion.py | 155 | block.index("radiosContainer.innerHTML"), |
| tests/test_template_modularization.py | 9 | TARGET = ROOT / "apps" / "zte_manager" / "templates" / "index.html" |
| tests/test_template_modularization.py | 12 | "pages/advanced/workbench_discovery.html", |
| tests/test_template_modularization.py | 13 | "pages/advanced/network.html", |
| tests/test_template_modularization.py | 14 | "pages/advanced/huawei_security.html", |
| tests/test_template_modularization.py | 15 | "pages/advanced/inspector_close.html", |
| tests/test_template_modularization.py | 18 | "pages/management/fleet.html", |
| tests/test_template_modularization.py | 19 | "pages/management/remote_monitor.html", |
| tests/test_template_modularization.py | 20 | "pages/management/network_mesh.html", |
| tests/test_template_modularization.py | 21 | "pages/management/lifecycle_provisioning.html", |
| tests/test_template_modularization.py | 34 | self.assertFalse((SOURCE / "pages/advanced.html").exists()) |
| tests/test_template_modularization.py | 35 | self.assertFalse((SOURCE / "pages/management.html").exists()) |
| tests/test_template_modularization.py | 39 | self.assertNotIn("pages/advanced.html", parts) |
| tests/test_template_modularization.py | 40 | self.assertNotIn("pages/management.html", parts) |
| tests/test_readonly_profile_regression.cjs | 34 | calls.push([path,JSON.parse(options.body).attendant]); |
| tests/test_readonly_profile_regression.cjs | 67 | Object.defineProperty(obj,"innerHTML",{set(text) { |
| tests/test_huawei_eg8041_family_runtime.py | 9 | parse_huawei_https_bootstrap, |
| tests/test_huawei_eg8041_family_runtime.py | 24 | parse_huawei_js_records, |
| tests/test_huawei_eg8041_family_runtime.py | 68 | "/html/ssmp/deviceinfo/deviceinfo.asp": fixture("device_brebg2.asp"), |
| tests/test_huawei_eg8041_family_runtime.py | 87 | html = "\n".join(self.client.get_page(page) for page in pages) |
| tests/test_huawei_eg8041_family_runtime.py | 88 | return html, parse_huawei_js_records(html) |
| tests/test_huawei_eg8041_family_runtime.py | 94 | parse_huawei_https_bootstrap(fixture("http_bootstrap.html")), |
| tests/test_huawei_eg8041_family_runtime.py | 98 | parse_huawei_https_bootstrap( |
| tests/test_huawei_eg8041_family_runtime.py | 103 | parse_huawei_https_bootstrap( |
| tests/test_huawei_eg8041_family_runtime.py | 115 | fake = FakeSession([FakeResponse(fixture("http_bootstrap.html"))]) |
| tests/test_huawei_eg8041_family_runtime.py | 192 | client.pages["/wifi/5g"] = "<html>no object graph</html>" |
| tests/test_mesh_management.py | 14 | self.parsed = { |
| tests/test_mesh_management.py | 70 | xml, |
| tests/test_mesh_management.py | 74 | def _parse_instances( |
| tests/test_mesh_management.py | 76 | xml, |
| tests/test_mesh_management.py | 78 | return self.parsed |
| tests/test_mesh_management.py | 101 | return "<html></html>" |
| tests/test_mesh_management.py | 147 | return "<html></html>" |
| tests/test_mesh_management.py | 334 | zte.parsed.pop( |
| tests/test_mesh_management.py | 337 | zte.parsed.pop( |
| tests/test_mesh_management.py | 432 | html = ( |
| tests/test_mesh_management.py | 437 | / "index.html" |
| tests/test_mesh_management.py | 461 | html, |
| tests/test_f6600p_support_progress.py | 124 | engine.return_value.run.side_effect = RuntimeError("TOP_SECRET_XML") |
| tests/test_f6600p_support_progress.py | 129 | self.assertNotIn("TOP_SECRET_XML", str(logs.output)) |
| tests/test_huawei_eg8041x7_runtime.py | 8 | HuaweiResponseParser, |
| tests/test_huawei_eg8041x7_runtime.py | 22 | def __init__(self, *, mutation_body="<html><body>ok</body></html>"): |
| tests/test_huawei_eg8041x7_runtime.py | 108 | content_type="text/html; charset=UTF-8", |
| tests/test_huawei_eg8041x7_runtime.py | 146 | "response_type": "html", |
| tests/test_huawei_eg8041x7_runtime.py | 159 | "response_type": "html", |
| tests/test_huawei_eg8041x7_runtime.py | 170 | def make_captured(*, body="<html><body>ok</body></html>", rows=True): |
| tests/test_huawei_eg8041x7_runtime.py | 182 | def test_parser_rejects_login_page_even_with_http_200(self): |
| tests/test_huawei_eg8041x7_runtime.py | 183 | parsed = HuaweiResponseParser.parse( |
| tests/test_huawei_eg8041x7_runtime.py | 185 | content_type="text/html", |
| tests/test_huawei_eg8041x7_runtime.py | 187 | '<html><form action="login.cgi">' |
| tests/test_huawei_eg8041x7_runtime.py | 189 | '<script src="GetRandCount.asp"></script></form></html>' |
| tests/test_huawei_eg8041x7_runtime.py | 192 | self.assertFalse(parsed.accepted) |
| tests/test_huawei_eg8041x7_runtime.py | 193 | self.assertEqual(parsed.response_type, "login_page") |
| tests/test_huawei_eg8041x7_runtime.py | 194 | self.assertEqual(parsed.error_code, "session_expired") |
| tests/test_huawei_eg8041x7_runtime.py | 196 | def test_full_html_with_unrelated_result_variable_is_not_false_failure(self): |
| tests/test_huawei_eg8041x7_runtime.py | 197 | parsed = HuaweiResponseParser.parse( |
| tests/test_huawei_eg8041x7_runtime.py | 199 | content_type="text/html", |
| tests/test_huawei_eg8041x7_runtime.py | 201 | '<html><script>function helper(){var result = 1; ' |
| tests/test_huawei_eg8041x7_runtime.py | 202 | 'return result;}</script><body>config</body></html>' |
| tests/test_huawei_eg8041x7_runtime.py | 205 | self.assertTrue(parsed.accepted) |
| tests/test_huawei_eg8041x7_runtime.py | 206 | self.assertFalse(parsed.confirmed) |
| tests/test_huawei_eg8041x7_runtime.py | 207 | self.assertEqual(parsed.response_type, "html") |
| tests/test_huawei_eg8041x7_runtime.py | 209 | def test_post_verified_accepts_empty_html_and_redirect_only_after_readback(self): |
| tests/test_huawei_eg8041x7_runtime.py | 212 | "<html><body>configuration</body></html>", |
| tests/test_huawei_eg8041x7_runtime.py | 213 | '<script>window.location.href="/html/bbsp/test.asp";</script>', |
| tests/test_huawei_eg8041x7_runtime.py | 219 | path="/html/bbsp/test/set.cgi?RequestFile=html/bbsp/test.asp", |
| tests/test_huawei_eg8041x7_runtime.py | 220 | request_file="/html/bbsp/dnsconfiguration/dnsconfigcommon.asp", |
| tests/test_huawei_eg8041x7_runtime.py | 232 | path="/html/bbsp/test/set.cgi?RequestFile=html/bbsp/test.asp", |
| tests/test_huawei_eg8041x7_runtime.py | 233 | request_file="/html/bbsp/dnsconfiguration/dnsconfigcommon.asp", |
| tests/test_huawei_eg8041x7_runtime.py | 246 | raise ValueError("broken readback parser") |
| tests/test_huawei_eg8041x7_runtime.py | 249 | path="/html/bbsp/test/set.cgi?RequestFile=html/bbsp/test.asp", |
| tests/test_huawei_eg8041x7_runtime.py | 250 | request_file="/html/bbsp/dnsconfiguration/dnsconfigcommon.asp", |
| tests/test_huawei_eg8041x7_runtime.py | 257 | self.assertIn("broken readback parser", result["error_message"]) |
| tests/test_huawei_eg8041x7_runtime.py | 420 | "response_type": "html", |
| tests/test_huawei_hg8145x6_phase1.py | 127 | with self.assertRaisesRegex(RuntimeError, "óptico\|Óptica"): |
| tests/test_tr069_preset_ui.cjs | 5 | const html=read("templates/index.html"),app=read("static/js/app.js"), |
| tests/test_tr069_preset_ui.cjs | 13 | assert.equal((html.match(new RegExp('id="'+id+'"','g'))\|\|[]).length,1, |
| tests/test_tr069_preset_ui.cjs | 20 | assert.ok(html.includes('data-page="tr069"')); |
| tests/test_tr069_preset_ui.cjs | 21 | assert.ok(html.includes('id="page-tr069"')); |
| tests/test_tr069_preset_ui.cjs | 32 | assert.ok(html.includes("zte_manager/js/"+path),"Missing script "+path); |
| tests/test_f6201b_writes.py | 11 | XML = """ |
| tests/test_f6201b_writes.py | 12 | <ajax_response_xml_root> |
| tests/test_f6201b_writes.py | 25 | </ajax_response_xml_root> |
| tests/test_f6201b_writes.py | 50 | else "<html>Different firmware</html>") |
| tests/test_f6201b_writes.py | 54 | return XML |
| tests/test_f6201b_writes.py | 57 | def _parse_instances(raw): |
| tests/test_f6201b_writes.py | 98 | with self.assertRaisesRegex(PermissionError, "Prévia"): |
| tests/test_f6201b_writes.py | 155 | # Version catalogs are informational. The real View/XML and |
| tests/test_f6201b_writes.py | 178 | def secure_parser(raw): |
| tests/test_f6201b_writes.py | 190 | self.zte._parse_instances = secure_parser |
| tests/test_f6201b_writes.py | 192 | with self.assertRaisesRegex(RuntimeError, "criptografia"): |
| tests/test_wifi_ssid.py | 8 | WIFI_XML = """<?xml version="1.0"?> |
| tests/test_wifi_ssid.py | 9 | <ajax_response_xml_root> |
| tests/test_wifi_ssid.py | 32 | </ajax_response_xml_root> |
| tests/test_wifi_ssid.py | 37 | _parse_instances = staticmethod( |
| tests/test_wifi_ssid.py | 38 | ZTE._parse_instances |
| tests/test_wifi_ssid.py | 48 | return "<html></html>" |
| tests/test_wifi_ssid.py | 51 | return WIFI_XML |
| tests/test_wifi_ssid.py | 83 | "<ajax_response_xml_root>" |
| tests/test_wifi_ssid.py | 85 | "</ajax_response_xml_root>" |
| tests/test_frontend_core.mjs | 93 | const h = harness(async () => response(status, "private router body", "text/html")); |
| tests/test_frontend_core.mjs | 289 | const payload = JSON.parse(calls[0].options.body); |
| tests/test_f6201b_workbench.py | 41 | return ('<ajax_response_xml_root><IF_ERRORID>0</IF_ERRORID>' |
| tests/test_f6201b_workbench.py | 43 | '</ajax_response_xml_root>') |
| tests/test_f6201b_workbench.py | 45 | def _parse_instances(self, raw): |
| tests/test_f6201b_workbench.py | 103 | with self.assertRaisesRegex(ValueError, "GET incompleto"): |
| tests/test_f6201b_workbench.py | 107 | with self.assertRaisesRegex(ValueError, "Campo"): |
| tests/test_f6201b_workbench.py | 134 | with self.assertRaisesRegex(PermissionError, "Nonce"): |
| tests/test_f6201b_workbench.py | 139 | with self.assertRaisesRegex(PermissionError, "expirada"): |
| tests/test_f6201b_workbench.py | 161 | with self.assertRaisesRegex(RuntimeError, "mudou"): |
| tests/test_f6201b_workbench.py | 167 | with self.assertRaisesRegex(ValueError, "GET incompleto"): |
| tests/test_f6201b_workbench.py | 177 | with self.assertRaisesRegex(ValueError, "0 ou 1"): |
| tests/test_f6201b_workbench.py | 200 | with self.assertRaisesRegex(PermissionError, "expirada"): |
| tests/test_clients_workbench.cjs | 5 | const html=fs.readFileSync("apps/zte_manager/templates/index.html","utf8"); |
| tests/test_clients_workbench.cjs | 7 | "apps/zte_manager/templates/source/pages/clients.html","utf8"); |
| tests/test_clients_workbench.cjs | 9 | for(const doc of [html,source]){ |
| tests/test_clients_workbench.cjs | 14 | assert.match(doc,new RegExp('data-am-tab="'+tab+'"')); |
| tests/test_clients_workbench.cjs | 15 | assert.match(doc,new RegExp('data-am-panel="'+tab+'"')); |
| tests/test_connection_inventory.cjs | 6 | const html=fs.readFileSync("apps/zte_manager/templates/index.html","utf8"); |
| tests/test_connection_inventory.cjs | 8 | "apps/zte_manager/templates/source/pages/connection.html","utf8"); |
| tests/test_connection_inventory.cjs | 40 | test("source HTML is synchronized, preserves real connection form and no mock devices",()=>{ |
| tests/test_connection_inventory.cjs | 41 | for(const text of [html,page]){ |
| tests/test_connection_inventory.cjs | 47 | assert.match(html,/js\/features\/connection_inventory\.js/); |
| tests/test_desktop_clipboard.cjs | 44 | assert.equal(JSON.parse(options.body).text, "attendance"); |
| tests/test_advanced_features.py | 8 | def __init__(self, xml): |
| tests/test_advanced_features.py | 9 | self.xml = xml |
| tests/test_advanced_features.py | 15 | return "<html></html>" |
| tests/test_advanced_features.py | 19 | return self.xml |
| tests/test_advanced_features.py | 21 | def _validar_resposta(self, xml): |
| tests/test_advanced_features.py | 22 | return xml |
| tests/test_advanced_features.py | 25 | def _parse_instances(xml): |
| tests/test_advanced_features.py | 27 | return ZTE._parse_instances(xml) |
| tests/test_advanced_features.py | 32 | xml = """ |
| tests/test_advanced_features.py | 33 | <ajax_response_xml_root> |
| tests/test_advanced_features.py | 57 | </ajax_response_xml_root> |
| tests/test_advanced_features.py | 60 | result = zte_advanced.radio_power_status(FakeZTE(xml)) |
| tests/test_advanced_features.py | 89 | fake = FakeZTE("<ajax_response_xml_root><IF_ERRORSTR>SUCC</IF_ERRORSTR></ajax_response_xml_root>") |
| tests/test_advanced_features.py | 98 | return_value="<ajax_response_xml_root><IF_ERRORSTR>SUCC</IF_ERRORSTR></ajax_response_xml_root>", |
| tests/test_advanced_features.py | 112 | xml = """ |
| tests/test_advanced_features.py | 113 | <ajax_response_xml_root> |
| tests/test_advanced_features.py | 139 | </ajax_response_xml_root> |
| tests/test_advanced_features.py | 142 | result = zte_advanced.wps_status(FakeZTE(xml)) |
| tests/test_advanced_features.py | 150 | xml = """ |
| tests/test_advanced_features.py | 151 | <ajax_response_xml_root> |
| tests/test_advanced_features.py | 161 | </ajax_response_xml_root> |
| tests/test_advanced_features.py | 164 | result = zte_advanced.upnp_status(FakeZTE(xml)) |
| tests/test_advanced_features.py | 178 | xml = """ |
| tests/test_advanced_features.py | 179 | <ajax_response_xml_root> |
| tests/test_advanced_features.py | 191 | </ajax_response_xml_root> |
| tests/test_advanced_features.py | 195 | FakeZTE(xml) |
| tests/test_advanced_features.py | 207 | "<ajax_response_xml_root><IF_ERRORSTR>SUCC</IF_ERRORSTR></ajax_response_xml_root>" |
| tests/test_advanced_features.py | 229 | return_value="<ajax_response_xml_root><IF_ERRORSTR>SUCC</IF_ERRORSTR></ajax_response_xml_root>", |
| tests/test_light_mode_refine.cjs | 8 | const html = fs.readFileSync( |
| tests/test_light_mode_refine.cjs | 9 | "apps/zte_manager/templates/index.html", "utf8" |
| tests/test_light_mode_refine.cjs | 12 | assert.ok(html.includes(ref)); |
| tests/test_light_mode_refine.cjs | 13 | assert.ok(html.indexOf(ref) > html.indexOf("f6201b_workbench.css"), |
| tests/test_light_mode_refine.cjs | 15 | const palette = css.match(/html\[data-theme="light"\] \{([^}]+)\}/); |
| tests/test_light_mode_refine.cjs | 18 | const pattern = new RegExp(name + ":\\s*(#[a-fA-F0-9]{6})\\s*;"); |
| tests/test_light_mode_refine.cjs | 28 | const values = [1,3,5].map(i => parseInt(hex.slice(i,i+2), 16)); |
| tests/test_light_mode_refine.cjs | 53 | assert.ok(css.includes('html[data-theme="light"]') && |
| tests/test_light_mode_refine.cjs | 54 | !css.includes('html[data-theme="dark"] {'), |
| tests/test_f6201b_candidate.py | 1 | """Owner-captured F6201B GET route and XML structure regressions.""" |
| tests/test_f6201b_candidate.py | 10 | XML = """ |
| tests/test_f6201b_candidate.py | 11 | <ajax_response_xml_root> |
| tests/test_f6201b_candidate.py | 17 | </ajax_response_xml_root> |
| tests/test_f6201b_candidate.py | 30 | return XML |
| tests/test_f6201b_candidate.py | 51 | def test_probe_confirms_only_matching_xml_shape(self): |
| tests/test_f6201b_candidate.py | 57 | # Optical XML must not be confused with the valid device XML. |
| tests/test_tracker_capability_detection.py | 20 | def __init__(self, xml): |
| tests/test_tracker_capability_detection.py | 21 | self.xml = xml |
| tests/test_tracker_capability_detection.py | 27 | return self.xml |
| tests/test_tracker_capability_detection.py | 29 | def _validar_resposta(xml): |
| tests/test_tracker_capability_detection.py | 30 | return xml |
| tests/test_tracker_capability_detection.py | 32 | def _parse_instances(xml): |
| tests/test_tracker_capability_detection.py | 39 | "<ajax_response_xml_root><IF_ERRORSTR>SUCC</IF_ERRORSTR>" |
| tests/test_tracker_capability_detection.py | 41 | "</ajax_response_xml_root>" |
| tests/test_tracker_capability_detection.py | 71 | xml = ( |
| tests/test_tracker_capability_detection.py | 72 | "<ajax_response_xml_root><IF_ERRORSTR>SUCC</IF_ERRORSTR>" |
| tests/test_tracker_capability_detection.py | 75 | "</OBJ_WLAN_AD_ID></ajax_response_xml_root>" |
| tests/test_tracker_capability_detection.py | 77 | result = probe(FakeONT(xml), "F6600P", max_endpoints=1) |
| tests/test_tracker_capability_detection.py | 82 | def test_http_ok_with_login_html_is_not_capability(self): |
| tests/test_tracker_capability_detection.py | 83 | fake = FakeONT("<html>Bem-vindo a F6600P. Por favor entre.</html>") |
| tests/test_tracker_capability_detection.py | 90 | "<ajax_response_xml_root><IF_ERRORSTR>SUCC</IF_ERRORSTR>" |
| tests/test_tracker_capability_detection.py | 92 | "</ajax_response_xml_root>" |
| tests/test_tracker_capability_detection.py | 100 | template = (ROOT / "apps/zte_manager/templates/index.html").read_text("utf8") |
| tests/test_complete_session_attendance.py | 133 | with self.assertRaisesRegex(ValueError, "sessão atual"): |
| tests/test_device_management.py | 7 | OPTICAL_XML = """<ajax_response_xml_root> |
| tests/test_device_management.py | 17 | </ajax_response_xml_root>""" |
| tests/test_device_management.py | 21 | _parse_instances = staticmethod(ZTE._parse_instances) |
| tests/test_device_management.py | 25 | return "<html></html>" |
| tests/test_device_management.py | 28 | return OPTICAL_XML |
| tests/test_device_management.py | 32 | def test_parse_optical(self): |
| tests/test_classic_support_ui.cjs | 8 | "apps/zte_manager/templates/index.html","utf8" |
| tests/test_huawei_phase2_eg8145v5_hn8010ts.py | 29 | "/html/ssmp/deviceinfo/deviceinfo.asp": fixture(f"{prefix}_deviceinfo.asp"), |
| tests/test_huawei_phase2_eg8145v5_hn8010ts.py | 35 | self.pages["/html/amp/opticinfo/opticinfo.asp"] = fixture( |
| tests/test_huawei_phase2_eg8145v5_hn8010ts.py | 64 | ("POST", "/html/bbsp/common/GetLanUserDevInfo.asp"), |
| tests/test_huawei_phase2_eg8145v5_hn8010ts.py | 88 | with self.assertRaisesRegex(RuntimeError, "Óptica"): |
| tests/test_huawei_phase2_eg8145v5_hn8010ts.py | 91 | def test_hn8010ts_requires_and_parses_model_specific_optics(self): |
| tests/test_huawei_phase2_eg8145v5_hn8010ts.py | 98 | "optical:/html/amp/opticinfo/opticinfo.asp", |
| tests/test_huawei_phase2_eg8145v5_hn8010ts.py | 108 | client.pages["/html/amp/opticinfo/opticinfo.asp"] = "<html>no optic data</html>" |
| tests/test_huawei_phase2_eg8145v5_hn8010ts.py | 124 | path = "/html/ssmp/deviceinfo/deviceinfo.asp" |
| tests/test_huawei_phase2_eg8145v5_hn8010ts.py | 164 | with self.assertRaisesRegex(RuntimeError, "somente leitura"): |
| tests/test_modular_template.py | 1 | """HTML source modules must reconstitute the exact legacy Vela DOM contract.""" |
| tests/test_f6201b_diagnostics_native.py | 3 | from urllib.parse import parse_qsl |
| tests/test_f6201b_diagnostics_native.py | 14 | text = ("<ajax_response_xml_root><IF_ERRORID>0</IF_ERRORID>" |
| tests/test_f6201b_diagnostics_native.py | 15 | "</ajax_response_xml_root>") |
| tests/test_f6201b_diagnostics_native.py | 46 | return ("<ajax_response_xml_root><IF_ERRORID>0</IF_ERRORID>" + |
| tests/test_f6201b_diagnostics_native.py | 48 | "/></ajax_response_xml_root>") |
| tests/test_f6201b_diagnostics_native.py | 53 | def _parse_instances(self, raw): |
| tests/test_f6201b_diagnostics_native.py | 70 | self.posted.append((params, list(parse_qsl(data, keep_blank_values=True)))) |
| tests/test_f6201b_diagnostics_native.py | 118 | "<ajax_response_xml_root><IF_ERRORID>0</IF_ERRORID>" |
| tests/test_f6201b_diagnostics_native.py | 119 | "</ajax_response_xml_root>" |
| tests/test_f6201b_diagnostics_native.py | 134 | def test_trace_parser_keeps_raw_lines(self): |
| tests/test_wlan_builder.py | 8 | WLAN_XML = """<?xml version="1.0"?> |
| tests/test_wlan_builder.py | 9 | <ajax_response_xml_root> |
| tests/test_wlan_builder.py | 44 | </ajax_response_xml_root> |
| tests/test_wlan_builder.py | 49 | _parse_instances = staticmethod( |
| tests/test_wlan_builder.py | 50 | ZTE._parse_instances |
| tests/test_wlan_builder.py | 63 | return "<html></html>" |
| tests/test_wlan_builder.py | 71 | return WLAN_XML |
| tests/test_wlan_builder.py | 91 | "<ajax_response_xml_root>" |
| tests/test_wlan_builder.py | 93 | "</ajax_response_xml_root>" |
| tests/test_structured_forms.cjs | 55 | const begin=managementJS.indexOf("function managementParseJson("); |
| tests/test_structured_forms.cjs | 58 | vm.runInNewContext(managementJS.slice(begin,end)+"\nthis.parse = managementParseJson;",ctx); |
| tests/test_structured_forms.cjs | 59 | assert.throws(()=>ctx.parse("managementWanJson"),/Revise os campos/); |
| tests/test_structured_forms.cjs | 60 | assert.equal(JSON.parse(h.source.value).mtu,1492, |
| tests/test_structured_forms.cjs | 63 | assert.equal(ctx.parse("managementWanJson").mtu,1500); |
| tests/test_structured_forms.cjs | 75 | assert.equal(JSON.parse(h.source.value).channel,36); |
| tests/test_structured_forms.cjs | 78 | assert.equal(JSON.parse(h.source.value).channel,36,"failed rename must keep saved value"); |
| tests/test_structured_forms.cjs | 81 | assert.deepEqual(JSON.parse(h.source.value),{}); |
| tests/test_structured_forms.cjs | 87 | assert.throws(()=>core.validateConfig(JSON.parse( |
| tests/test_structured_forms.cjs | 93 | const end=managementJS.indexOf("function managementParseJson(",start); |
| tests/test_structured_forms.cjs | 104 | assert.equal(JSON.parse(result).enabled,true); |
| tests/test_model_diagnostics.py | 15 | def xml(node, records): |
| tests/test_model_diagnostics.py | 24 | "<ajax_response_xml_root><IF_ERRORSTR>SUCC</IF_ERRORSTR>" |
| tests/test_model_diagnostics.py | 26 | "</ajax_response_xml_root>" |
| tests/test_model_diagnostics.py | 55 | "devmgr_statusmgr_lua.lua": xml( |
| tests/test_model_diagnostics.py | 59 | "dsl_interface_status_lua.lua": xml( |
| tests/test_model_diagnostics.py | 77 | "devmgr_statusmgr_lua.lua": xml("OBJ_DEVINFO_ID", []), |
| tests/test_model_diagnostics.py | 78 | "wan_internet_lua.lua": xml( |
| tests/test_model_diagnostics.py | 93 | "devmgr_statusmgr_lua.lua": xml("OBJ_DEVINFO_ID", []), |
| tests/test_model_diagnostics.py | 94 | "wan_internetstatus_lua.lua": xml( |
| tests/test_model_diagnostics.py | 108 | "vue_home_device_data_no_update_sess": xml("OBJ_DEVINFO_ID", []), |
| tests/test_model_diagnostics.py | 109 | "vue_mainwan_data": xml("ID_WAN_COMFIG", [{"ConnStatus": "Up"}]), |
| tests/test_model_diagnostics.py | 126 | with self.assertRaisesRegex(ValueError, "perfil solicitado"): |
| tests/test_model_diagnostics.py | 128 | with self.assertRaisesRegex(ValueError, "perfil solicitado"): |
| tests/test_huawei_mapped_surface.py | 39 | "/html/test/page.asp", |
| tests/test_huawei_mapped_surface.py | 40 | "/html/ssmp/Sectionspeed/Sectionspeed.asp", |
| tests/test_huawei_mapped_surface.py | 96 | ["/html/bbsp/upnp/upnp.asp"], |
| tests/test_huawei_mapped_surface.py | 109 | referer="/html/test/page.asp", |
| tests/test_huawei_mapped_surface.py | 128 | data = service._normalize_page("/html/test/page.asp", source) |
| tests/test_huawei_mapped_surface.py | 140 | "/html/test/read.cgi", |
| tests/test_huawei_mapped_surface.py | 143 | referer="/html/test/page.asp", |
| tests/test_huawei_mapped_surface.py | 144 | token_page="/html/test/page.asp", |
| tests/test_huawei_mapped_surface.py | 196 | "/html/test/set.cgi?x=InternetGatewayDevice.Test", |
| tests/test_huawei_mapped_surface.py | 201 | referer="/html/test/page.asp", |
| tests/test_huawei_mapped_surface.py | 202 | token_page="/html/test/page.asp", |
| tests/test_huawei_mapped_surface.py | 203 | readback_path="/html/test/page.asp", |
| tests/test_huawei_mapped_surface.py | 211 | "/html/test/set.cgi?x=InternetGatewayDevice.Test", |
| tests/test_huawei_mapped_surface.py | 213 | self.assertEqual(referer, "/html/test/page.asp") |
| tests/test_huawei_mapped_surface.py | 229 | "/html/test/set.cgi?x=InternetGatewayDevice.Test", |
| tests/test_huawei_mapped_surface.py | 236 | referer="/html/test/page.asp", |
| tests/test_huawei_mapped_surface.py | 237 | token_page="/html/test/page.asp", |
| tests/test_multimodel_discovery.py | 15 | def xml(object_name="OBJ_ACCESSDEV_ID", name="LinkTime", value="123"): |
| tests/test_multimodel_discovery.py | 17 | "<ajax_response_xml_root><IF_ERRORSTR>SUCC</IF_ERRORSTR>" |
| tests/test_multimodel_discovery.py | 20 | "</ajax_response_xml_root>" |
| tests/test_multimodel_discovery.py | 80 | client = FakeClient(xml(value="private-customer-value")) |
| tests/test_multimodel_discovery.py | 102 | return xml("OBJ_CLIENTS_ID") |
| tests/test_multimodel_discovery.py | 118 | "<ajax_response_xml_root><IF_ERRORSTR>SUCC</IF_ERRORSTR>" |
| tests/test_multimodel_discovery.py | 123 | "</Instance></OBJ_ACCESSDEV_ID></ajax_response_xml_root>" |
| tests/test_multimodel_discovery.py | 164 | report = mesh_summary(FakeClient(xml()), "H388X") |
| tests/test_multimodel_discovery.py | 168 | client = FakeClient(xml()) |
| tests/test_multimodel_discovery.py | 173 | def test_invalid_html_not_accepted_as_endpoint(self): |
| tests/test_multimodel_discovery.py | 174 | client = FakeClient("<html>Bem-vindo. Por favor entre.</html>") |
| tests/test_multimodel_discovery.py | 180 | client = FakeClient(xml("OBJ_UNRELATED")) |
| tests/test_multimodel_discovery.py | 186 | xml(name="Password", value="private") |
| tests/test_frontend_feature_modules.mjs | 13 | const shellEndSource = source("apps/zte_manager/templates/source/shell_end.html"); |
| tests/test_frontend_feature_modules.mjs | 28 | assert.deepEqual(JSON.parse(calls[0].options.body), {customer_name: "Cliente"}); |
| tests/test_frontend_feature_modules.mjs | 109 | escapeHtml: value => String(value), |
| tests/test_frontend_feature_modules.mjs | 111 | const html = globalThis.renderRadioAdvancedFields({ |
| tests/test_frontend_feature_modules.mjs | 118 | assert.match(html, /HUAWEI RF MAPEADO/); |
| tests/test_frontend_feature_modules.mjs | 119 | assert.match(html, /bandwidth_code/); |
| tests/test_frontend_feature_modules.mjs | 133 | installAdvancedWifiFields({deviceState, escapeHtml: value => String(value)}); |
| tests/test_huawei_hg8145x6_ontwatch.py | 134 | def test_device_resources_parse_ontwatch_js_variables(self): |
| tests/test_huawei_diagnostics.py | 44 | if path == "/html/bbsp/maintenance/diagnosecommon.asp": |
| tests/test_huawei_diagnostics.py | 101 | "/html/bbsp/maintenance/diagnosecommon.asp", |
| tests/test_huawei_diagnostics.py | 184 | def test_ping_parser_accepts_sent_received_and_labelled_rtt(self): |
| tests/test_huawei_diagnostics.py | 185 | parsed = HuaweiService._parse_ping_output( |
| tests/test_huawei_diagnostics.py | 193 | self.assertEqual(parsed["sucesso"], 3) |
| tests/test_huawei_diagnostics.py | 194 | self.assertEqual(parsed["falha"], 1) |
| tests/test_huawei_diagnostics.py | 195 | self.assertEqual(parsed["perda_percentual"], 25) |
| tests/test_huawei_diagnostics.py | 196 | self.assertEqual(parsed["minimo_ms"], 8.0) |
| tests/test_huawei_diagnostics.py | 197 | self.assertEqual(parsed["medio_ms"], 10.0) |
| tests/test_huawei_diagnostics.py | 198 | self.assertEqual(parsed["maximo_ms"], 12.0) |
| tests/test_huawei_diagnostics.py | 253 | def test_traceroute_uses_huawei_flow_and_parses_hops(self): |
| tests/test_huawei_diagnostics.py | 278 | "/html/bbsp/maintenance/diagnosecommon.asp", |
| tests/test_huawei_ipv4_filter.py | 9 | decode_huawei_js_string, |
| tests/test_huawei_ipv4_filter.py | 20 | parse_st_filter_in, |
| tests/test_huawei_ipv4_filter.py | 28 | / "huawei_ipincoming.html" |
| tests/test_huawei_ipv4_filter.py | 32 | def fixture_html() -> str: |
| tests/test_huawei_ipv4_filter.py | 97 | class HuaweiDecoderTests(unittest.TestCase): |
| tests/test_huawei_ipv4_filter.py | 98 | def test_decodes_any_hex_escape(self): |
| tests/test_huawei_ipv4_filter.py | 100 | decode_huawei_js_string( |
| tests/test_huawei_ipv4_filter.py | 106 | decode_huawei_js_string( |
| tests/test_huawei_ipv4_filter.py | 112 | decode_huawei_js_string( |
| tests/test_huawei_ipv4_filter.py | 119 | class HuaweiParserTests(unittest.TestCase): |
| tests/test_huawei_ipv4_filter.py | 120 | def test_parses_st_filter_in_and_decodes_fields(self): |
| tests/test_huawei_ipv4_filter.py | 121 | rules = parse_st_filter_in( |
| tests/test_huawei_ipv4_filter.py | 122 | fixture_html() |
| tests/test_huawei_ipv4_filter.py | 256 | self.after = fixture_html() |
| tests/test_huawei_ipv4_filter.py | 322 | current = fixture_html() |
| tests/test_huawei_ipv4_filter.py | 363 | fixture_html(), |
| tests/test_huawei_ipv4_filter.py | 392 | [fixture_html()] |
| tests/test_inventory_view.cjs | 12 | const html = fs.readFileSync( |
| tests/test_inventory_view.cjs | 13 | "apps/zte_manager/templates/index.html", "utf8" |
| tests/test_inventory_view.cjs | 18 | assert.ok(!source.includes(".innerHTML"), "Inventory must never use mass HTML injection"); |
| tests/test_inventory_view.cjs | 22 | assert.ok(html.includes('type="module" src="{{ static(\'zte_manager/js/management/inventory_view.js\') }}"')); |
| tests/test_huawei_phase4_hg8245x6_affinity.py | 7 | from urllib.parse import parse_qs |
| tests/test_huawei_phase4_hg8245x6_affinity.py | 46 | login_html = fixture("hg8245x6_ttnet2_login.html") |
| tests/test_huawei_phase4_hg8245x6_affinity.py | 49 | def reset(cls, *, login_html: str \| None = None) -> None: |
| tests/test_huawei_phase4_hg8245x6_affinity.py | 57 | cls.login_html = ( |
| tests/test_huawei_phase4_hg8245x6_affinity.py | 58 | login_html |
| tests/test_huawei_phase4_hg8245x6_affinity.py | 59 | if login_html is not None |
| tests/test_huawei_phase4_hg8245x6_affinity.py | 60 | else fixture("hg8245x6_ttnet2_login.html") |
| tests/test_huawei_phase4_hg8245x6_affinity.py | 83 | self._send(200, type(self).login_html.encode("utf-8")) |
| tests/test_huawei_phase4_hg8245x6_affinity.py | 90 | if self.path == "/html/ssmp/deviceinfo/deviceinfo.asp": |
| tests/test_huawei_phase4_hg8245x6_affinity.py | 109 | type(self).login_payload = parse_qs(body.decode("utf-8")) |
| tests/test_huawei_phase4_hg8245x6_affinity.py | 149 | source = fixture("hg8245x6_ttnet2_login.html") |
| tests/test_huawei_phase4_hg8245x6_affinity.py | 236 | <html><form action='/login.cgi'> |
| tests/test_huawei_phase4_hg8245x6_affinity.py | 239 | </form></html> |
| tests/test_huawei_phase4_hg8245x6_affinity.py | 241 | _AffinityFixtureHandler.reset(login_html=ordinary_login) |
| tests/test_tangerine_feature_experience.cjs | 10 | const source=fs.readFileSync(root+"templates/source/pages/clients.html","utf8"); |
| tests/test_tangerine_feature_experience.cjs | 11 | const html=fs.readFileSync(root+"templates/index.html","utf8"); |
| tests/test_tangerine_feature_experience.cjs | 38 | ])assert.ok(html.includes("zte_manager/"+filename),filename); |
| tests/test_tangerine_feature_experience.cjs | 41 | assert.match(html,new RegExp('id="'+id+'"')); |
| tests/test_windows_compat.py | 45 | def test_backup_rejects_login_html_even_with_http_200(self): |
| tests/test_windows_compat.py | 48 | b"<html><title>Bem-vindo a F670L</title>Login</html>", |
| tests/test_windows_compat.py | 49 | "text/html", |
| tests/test_windows_compat.py | 56 | return_value="<ajax_response_xml_root/>", |
| tests/test_windows_compat.py | 60 | side_effect=AssertionError("HTML nao pode ser salvo"), |
| tests/test_windows_compat.py | 62 | with self.assertRaisesRegex(RuntimeError, "HTML"): |
| tests/test_windows_compat.py | 69 | with self.assertRaisesRegex(RuntimeError, "Windows"): |
| tests/test_huawei_transport_negotiation.py | 6 | from urllib.parse import urlsplit |
| tests/test_huawei_transport_negotiation.py | 33 | BOOTSTRAP = """<html><script> |
| tests/test_huawei_transport_negotiation.py | 37 | </script></html>""" |
| tests/test_huawei_transport_negotiation.py | 63 | parsed = urlsplit(url) |
| tests/test_huawei_transport_negotiation.py | 64 | if method != expected_method or parsed.path != expected_path: |
| tests/test_huawei_transport_negotiation.py | 66 | f"expected {expected_method} {expected_path}, got {method} {parsed.path}" |
| tests/test_huawei_transport_negotiation.py | 94 | FakeResponse(fixture("auth_root_login_rndsecurityformat.html")), |
| tests/test_huawei_transport_negotiation.py | 101 | ("POST", "/login.cgi", FakeResponse(fixture("auth_login_success.html"))), |
| tests/test_huawei_transport_negotiation.py | 106 | source = fixture("auth_root_login_rndsecurityformat.html") |
| tests/test_huawei_transport_negotiation.py | 142 | '<script src="/html/ssmp/common/getRandString.asp"></script>' |
| tests/test_huawei_transport_negotiation.py | 285 | ("GET", "/", FakeResponse(fixture("http_bootstrap.html"))), |
| tests/test_huawei_transport_negotiation.py | 315 | root = FakeResponse(fixture("auth_root_login_rndsecurityformat.html")) |
| tests/test_huawei_transport_negotiation.py | 317 | login = FakeResponse(fixture("auth_login_success.html")) |
| tests/test_f6201b_workbench_ui.cjs | 4 | const index = fs.readFileSync("apps/zte_manager/templates/index.html", "utf8"); |
| tests/test_f6201b_workbench_ui.cjs | 26 | assert.ok(!js.includes("innerHTML"), "No firmware-controlled HTML injection"); |
| tests/test_discovery_bootstrap.cjs | 26 | elements[id] = { textContent: "", innerHTML: "" }; |
| tests/test_huawei_captured_features.py | 28 | parse_huawei_js_records, |
| tests/test_huawei_captured_features.py | 113 | def extract_token(self, html): |
| tests/test_huawei_captured_features.py | 124 | if path == "/html/bbsp/dhcp/dhcp.asp": |
| tests/test_huawei_captured_features.py | 132 | if path == "/html/bbsp/dhcpstatic/dhcpstatic.asp": |
| tests/test_huawei_captured_features.py | 134 | if path == "/html/bbsp/common/dhcpinfo.asp": |
| tests/test_huawei_captured_features.py | 227 | "/html/bbsp/firewalllevel/firewalllevel.asp", |
| tests/test_huawei_captured_features.py | 228 | "/html/bbsp/Dos/Dos.asp", |
| tests/test_huawei_captured_features.py | 229 | "/html/bbsp/ipv6firewall/firewall.asp", |
| tests/test_huawei_captured_features.py | 230 | "/html/bbsp/internetcontrol/internetcontrol.asp", |
| tests/test_huawei_captured_features.py | 231 | "/html/bbsp/alg/alg.asp", |
| tests/test_huawei_captured_features.py | 232 | "/html/bbsp/igmp/igmp.asp", |
| tests/test_huawei_captured_features.py | 302 | elif "/html/amp/wlanadv/set.cgi" in path: |
| tests/test_huawei_captured_features.py | 325 | class HuaweiGenericParserTests(unittest.TestCase): |
| tests/test_huawei_captured_features.py | 326 | def test_constructor_parser_maps_properties_and_decodes_hex(self): |
| tests/test_huawei_captured_features.py | 327 | html = ( |
| tests/test_huawei_captured_features.py | 333 | records = parse_huawei_js_records(html) |
| tests/test_huawei_captured_features.py | 368 | self.assertIn("/html/bbsp/dhcpservercfg/set.cgi", path) |
| tests/test_huawei_captured_features.py | 584 | self.assertIn("/html/amp/wlanadv/set.cgi", path) |
| tests/test_huawei_captured_features.py | 613 | self.assertIn("/html/amp/wlanadv/set.cgi", path) |
| tests/test_huawei_captured_features.py | 641 | self.assertIn("/html/amp/wlanbasic/set.cgi", path) |
| tests/test_multivendor_runtime_regressions.py | 21 | Path(__file__).parent / "fixtures" / "huawei_ipincoming.html" |
| tests/test_multivendor_runtime_regressions.py | 195 | return response(200, "<html>Huawei</html>", url) |
| tests/test_multivendor_runtime_regressions.py | 200 | return response(200, "<html>Huawei</html>", url) |
| tests/test_multivendor_runtime_regressions.py | 206 | return response(200, "<html>ok</html>", url) |
| tests/test_multivendor_runtime_regressions.py | 237 | response(403, "Forbidden", "http://192.168.18.1/html/bbsp/ipincoming/ipincoming.asp"), |
| tests/test_multivendor_runtime_regressions.py | 238 | response(200, FIXTURE, "http://192.168.18.1/html/bbsp/ipincoming/ipincoming.asp"), |
| tests/test_multivendor_runtime_regressions.py | 242 | page = client.get_page("/html/bbsp/ipincoming/ipincoming.asp") |
| tests/test_multivendor_runtime_regressions.py | 246 | def test_huawei_get_login_html_200_relogin(self): |
| tests/test_multivendor_runtime_regressions.py | 247 | login_html = """ |
| tests/test_multivendor_runtime_regressions.py | 248 | <html><form action="/login.cgi"> |
| tests/test_multivendor_runtime_regressions.py | 251 | </form></html> |
| tests/test_multivendor_runtime_regressions.py | 254 | response(200, login_html, "http://192.168.18.1/"), |
| tests/test_multivendor_runtime_regressions.py | 255 | response(200, FIXTURE, "http://192.168.18.1/html/bbsp/ipincoming/ipincoming.asp"), |
| tests/test_multivendor_runtime_regressions.py | 259 | page = client.get_page("/html/bbsp/ipincoming/ipincoming.asp") |
| tests/test_f6201b_expanded_lab.py | 84 | return "<ajax_response_xml_root><IF_ERRORID>0</IF_ERRORID></ajax_response_xml_root>" |
| tests/test_f6201b_expanded_lab.py | 123 | raw='<ajax_response_xml_root><IF_ERRORID>0</IF_ERRORID></ajax_response_xml_root>' |
| tests/test_f6201b_expanded_lab.py | 129 | zte._parse_instances=lambda xml:{ |
| tests/test_api_modularization.py | 17 | self.assertNotRegex(source, r"@api\.(?:get\|post\|put\|delete\|patch)\(") |
| tests/test_shell_and_support_layout.cjs | 5 | const html=fs.readFileSync(r+"templates/index.html","utf8"); |
| tests/test_shell_and_support_layout.cjs | 14 | assert.match(html,/css\/components\/shell_layout\.css/); |
| tests/test_shell_and_support_layout.cjs | 30 | assert.match(html,/aria-label="Tamanho do texto"/); |
| tests/test_shell_and_support_layout.cjs | 31 | assert.match(html,/aria-label="Aumentar tamanho do texto"/); |
| tests/test_huawei_phase3_hg8245h.py | 8 | from urllib.parse import urlsplit |
| tests/test_huawei_phase3_hg8245h.py | 74 | parsed = urlsplit(url) |
| tests/test_huawei_phase3_hg8245h.py | 75 | return parsed.path or "/" |
| tests/test_huawei_phase3_hg8245h.py | 86 | "<html><script>var p='/asp/GetRandCount.asp';</script></html>", |
| tests/test_huawei_phase3_hg8245h.py | 89 | return FakeResponse(fixture("login_sha256.html"), url=url) |
| tests/test_huawei_phase3_hg8245h.py | 92 | fixture("api_unavailable.html") |
| tests/test_huawei_phase3_hg8245h.py | 94 | else fixture("sestokeninfo.xml") |
| tests/test_huawei_phase3_hg8245h.py | 105 | return FakeResponse(fixture("deviceinfo.xml"), url=url) |
| tests/test_huawei_phase3_hg8245h.py | 106 | if path == "/html/ssmp/deviceinfo/deviceinfo.asp": |
| tests/test_huawei_phase3_hg8245h.py | 107 | return FakeResponse("<html>legacy device page</html>", url=url) |
| tests/test_huawei_phase3_hg8245h.py | 132 | self.device_source = fixture("deviceinfo.xml").replace("HG8245H", model) |
| tests/test_huawei_phase3_hg8245h.py | 146 | def test_sestoken_parser_accepts_xml_and_json(self): |
| tests/test_huawei_phase3_hg8245h.py | 147 | for name in ("sestokeninfo.xml", "sestokeninfo.json"): |
| tests/test_huawei_phase3_hg8245h.py | 149 | context = ApiSesTokenAuth.parse_session_token_info(fixture(name)) |
| tests/test_huawei_phase3_hg8245h.py | 154 | context = ApiSesTokenAuth.parse_session_token_info(fixture("sestokeninfo.xml")) |
| tests/test_huawei_phase3_hg8245h.py | 156 | b64 = base64.b64encode(password.encode()).decode("ascii") |
| tests/test_huawei_phase3_hg8245h.py | 162 | expected = base64.b64encode(digest.encode("ascii")).decode("ascii") |
| tests/test_huawei_phase3_hg8245h.py | 170 | context = ApiSesTokenAuth.parse_session_token_info(fixture("sestokeninfo.xml")) |
| tests/test_huawei_phase3_hg8245h.py | 195 | context = ApiSesTokenAuth.parse_session_token_info(fixture("sestokeninfo.xml")) |
| tests/test_huawei_phase3_hg8245h.py | 270 | with self.assertRaisesRegex(RuntimeError, "Reboot HG8245H"): |
| tests/test_huawei_phase3_hg8245h.py | 272 | with self.assertRaisesRegex(RuntimeError, "não foi caracterizado"): |
| tests/test_huawei_phase3_hg8245h.py | 274 | with self.assertRaisesRegex(RuntimeError, "somente leitura"): |
| tests/test_frontend_compat.py | 8 | INDEX_HTML = ROOT / "apps" / "zte_manager" / "templates" / "index.html" |
| tests/test_frontend_compat.py | 32 | source = INDEX_HTML.read_text(encoding="utf-8") |
| tests/test_huawei_eg8041_family_provider.py | 134 | def test_x6_concatenated_traceroute_frame_decodes_complete_and_hops(self): |
| tests/test_huawei_eg8041_family_provider.py | 138 | output, state = HuaweiEG8041FamilyProvider._decode_diagnostic_result( |
| tests/test_huawei_eg8041_family_provider.py | 147 | hops = HuaweiEG8041FamilyProvider._parse_traceroute_hops(output) |
| tests/test_huawei_eg8041_family_provider.py | 171 | def test_x6_physical_ping_function_wrapper_decodes_complete_and_statistics(self): |
| tests/test_huawei_eg8041_family_provider.py | 175 | output, state = HuaweiEG8041FamilyProvider._decode_diagnostic_result(source) |
| tests/test_huawei_eg8041_family_provider.py | 176 | stats = HuaweiEG8041FamilyProvider._parse_ping_output( |
| tests/test_huawei_eg8041_family_provider.py | 214 | output, state = HuaweiEG8041FamilyProvider._decode_diagnostic_result(source) |
| tests/test_huawei_eg8041_family_provider.py | 215 | stats = HuaweiEG8041FamilyProvider._parse_ping_output( |
| tests/test_huawei_eg8041_family_provider.py | 225 | def test_diagnostic_decoder_never_executes_non_string_expression(self): |
| tests/test_huawei_eg8041_family_provider.py | 227 | output, state = HuaweiEG8041FamilyProvider._decode_diagnostic_result(source) |
| tests/test_huawei_eg8041_family_provider.py | 277 | with self.assertRaisesRegex(RuntimeError, "active_ping_disabled"): |
| tests/test_huawei_eg8041_family_provider.py | 310 | with self.assertRaisesRegex(RuntimeError, "não expôs a senha"): |
| tests/test_wifi_schedule_module.mjs | 26 | assert.deepEqual(JSON.parse(calls[1].options.body), {enabled: true, start_hour: 2}); |
| tests/test_wifi_schedule_module.mjs | 39 | _html: "", |
| tests/test_wifi_schedule_module.mjs | 40 | set innerHTML(value) { |
| tests/test_wifi_schedule_module.mjs | 41 | this._html = value; |
| tests/test_wifi_schedule_module.mjs | 44 | get innerHTML() { return this._html; }, |
| tests/test_wifi_schedule_module.mjs | 83 | assert.match(doc.container.innerHTML, /Agendamento diário/); |
| tests/test_wifi_schedule_module.mjs | 84 | assert.match(doc.container.innerHTML, /wifiScheduleStartHour/); |
| tests/test_wifi_schedule_module.mjs | 85 | assert.match(doc.container.innerHTML, /value="2"/); |
| tests/test_wifi_schedule_module.mjs | 144 | assert.match(doc.container.innerHTML, /Agendamento Wi-Fi: Não mapeado/); |
| tests/test_huawei_multirepo_foundation.py | 105 | "evidence": ["/html/ssmp/common/getRandString.asp"], |
| tests/test_huawei_multirepo_foundation.py | 133 | auth_flow_from_login_page("/html/ssmp/common/getRandString.asp"), |
| tests/test_huawei_multirepo_foundation.py | 139 | ["/html/ssmp/deviceinfo/deviceinfo.asp", "/html/bbsp/common/ontstate.asp"] |
| tests/test_huawei_multirepo_foundation.py | 197 | def test_pon_reader_uses_existing_constructor_parser_and_normalizes_state(self): |
| tests/test_huawei_multirepo_foundation.py | 207 | HuaweiPonStateReader(PageClient("<html>unknown</html>")).read() |
| tests/test_huawei_multirepo_foundation.py | 224 | def test_runtime_keeps_pon_unknown_when_probe_cannot_parse_response(self): |
| tests/test_huawei_multirepo_foundation.py | 226 | runtime._client = PageClient("<html>unknown</html>") |
| tests/test_api_client_ui.cjs | 46 | const failed=harness(async()=>response(503,"unavailable","text/html")); |
| tests/test_api_client_ui.cjs | 84 | const h=harness(async()=>response(404,"POST /api/login?password=PRIVATE","text/html")); |
| tests/test_huawei_hg8010_telemetry.py | 27 | parse_wap_optical, |
| tests/test_huawei_hg8010_telemetry.py | 28 | parse_wap_pon_statistics, |
| tests/test_huawei_hg8010_telemetry.py | 29 | parse_wap_pon_status, |
| tests/test_huawei_hg8010_telemetry.py | 30 | parse_wap_resources, |
| tests/test_huawei_hg8010_telemetry.py | 35 | parse_huawei_optical_response, |
| tests/test_huawei_hg8010_telemetry.py | 123 | source = fixture("login_legacy_rand_cookie.html") |
| tests/test_huawei_hg8010_telemetry.py | 143 | result = parse_huawei_optical_response( |
| tests/test_huawei_hg8010_telemetry.py | 155 | result = parse_huawei_optical_response( |
| tests/test_huawei_hg8010_telemetry.py | 168 | parse_huawei_optical_response(source, endpoint=OPTICAL_AMP_PAGE) |
| tests/test_huawei_hg8010_telemetry.py | 171 | optical = parse_wap_optical( |
| tests/test_huawei_hg8010_telemetry.py | 175 | resources = parse_wap_resources( |
| tests/test_huawei_hg8010_telemetry.py | 185 | status = parse_wap_pon_status( |
| tests/test_huawei_hg8010_telemetry.py | 189 | stats = parse_wap_pon_statistics( |
| tests/test_huawei_hg8010_telemetry.py | 235 | def test_runtime_promotes_web_optical_only_after_signature_parser_succeeds(self): |
| tests/test_huawei_eg8041_capture_contract.py | 62 | if path.startswith("/html/amp/common/getSsidProcFlag.asp"): |
| tests/test_huawei_eg8041_capture_contract.py | 70 | body="<html><body>accepted</body></html>", |
| tests/test_huawei_eg8041_capture_contract.py | 71 | content_type="text/html; charset=UTF-8", |
| tests/test_huawei_eg8041_capture_contract.py | 135 | self.assertFalse(any("/html/amp/wlaninfo/" in path for path in touched)) |
| tests/test_huawei_eg8041_capture_contract.py | 142 | "/html/amp/wlanbasic/set.cgi" |
| tests/test_huawei_eg8041_capture_contract.py | 144 | "&RequestFile=html/amp/wlanbasic/WlanBasic.asp" |
| tests/test_huawei_eg8041_capture_contract.py | 149 | request_file="/html/amp/wlanbasic/WlanBasic.asp?5G", |
| tests/test_huawei_eg8041_capture_contract.py | 158 | and event[1].startswith("/html/amp/common/getSsidProcFlag.asp") |
| tests/test_model_session_binding.py | 42 | with self.assertRaisesRegex(ValueError, "mudou"): |
| tests/test_model_session_binding.py | 48 | with self.assertRaisesRegex(ValueError, "diverge"): |
| tests/test_model_session_binding.py | 62 | with self.assertRaisesRegex(ValueError, "Desconecte"): |
| tests/test_diagnostic_tabs.cjs | 5 | const generated=fs.readFileSync("apps/zte_manager/templates/index.html","utf8"); |
| tests/test_diagnostic_tabs.cjs | 6 | const source=fs.readFileSync("apps/zte_manager/templates/source/pages/diagnostics.html","utf8"); |
| tests/test_design_tokens.cjs | 88 | assert.match(tokensSource, /:root,\s*html\[data-theme="light"\]/); |
| tests/test_design_tokens.cjs | 89 | assert.match(tokensSource, /html\[data-theme="dark"\]/); |
| tests/test_f6201b_dhcp_module.py | 22 | return ("<ajax_response_xml_root><IF_ERRORID>0</IF_ERRORID>" |
| tests/test_f6201b_dhcp_module.py | 23 | "</ajax_response_xml_root>") |
| tests/test_f6201b_dhcp_module.py | 28 | def _parse_instances(self, raw): |
| tests/test_f6201b_dhcp_module.py | 87 | return ("<ajax_response_xml_root><IF_ERRORID>0</IF_ERRORID>" |
| tests/test_f6201b_dhcp_module.py | 89 | "</ajax_response_xml_root>") |
| tests/test_f6201b_dhcp_module.py | 91 | self.ont._parse_instances = lambda raw: { |
| tests/test_f6201b_dhcp_module.py | 134 | with self.assertRaisesRegex(ValueError, "não expôs"): |
| tests/test_advanced_workbench.cjs | 6 | const template=fs.readFileSync("apps/zte_manager/templates/index.html","utf8"); |
| tests/test_advanced_workbench.cjs | 13 | assert.match(section,new RegExp('data-am-tab="'+id+'"')); |
| tests/test_advanced_workbench.cjs | 14 | assert.match(section,new RegExp('data-am-panel="'+id+'"')); |
| tests/test_advanced_workbench.cjs | 15 | assert.match(section,new RegExp('aria-controls="advanced-panel-'+id+'"')); |
| tests/test_advanced_workbench.cjs | 84 | const output={innerHTML:""}; |
| tests/test_advanced_workbench.cjs | 85 | const ctx={document:{getElementById:()=>output},escapeHtml:x=>String(x)}; |
| tests/test_advanced_workbench.cjs | 90 | assert.match(output.innerHTML,/Sondagem inconclusiva/); |
| tests/test_advanced_workbench.cjs | 91 | assert.doesNotMatch(output.innerHTML,/capability-state unavailable/); |
| tests/test_huawei_phase0_architecture.py | 20 | from apps.zte_manager.infrastructure.huawei.js_parser import HuaweiJsConstructorParser |
| tests/test_huawei_phase0_architecture.py | 24 | parse_huawei_https_bootstrap, |
| tests/test_huawei_phase0_architecture.py | 79 | def test_js_sslport_parser_detects_https80_fixture(self): |
| tests/test_huawei_phase0_architecture.py | 81 | parse_huawei_https_bootstrap(fixture("http_bootstrap_https80.html")), |
| tests/test_huawei_phase0_architecture.py | 115 | def test_randcount_invalid_html_is_rejected(self): |
| tests/test_huawei_phase0_architecture.py | 118 | "<html><form action='login.cgi'></form></html>" |
| tests/test_huawei_phase0_architecture.py | 130 | base64.b64encode(b"fixture-password").decode("ascii"), |
| tests/test_huawei_phase0_architecture.py | 180 | def test_js_constructor_parser_handles_hex_nested_and_variable_fields(self): |
| tests/test_huawei_phase0_architecture.py | 187 | parser = HuaweiJsConstructorParser({ |
| tests/test_huawei_phase0_architecture.py | 192 | rows = parser.parse(source, protocol_family="amp_bbsp") |
| tests/test_huawei_phase0_architecture.py | 200 | def test_api_sestoken_xml_json_fixtures_are_detection_evidence_only(self): |
| tests/test_huawei_phase0_architecture.py | 201 | for name in ("sestokeninfo.xml", "sestokeninfo.json"): |
| tests/test_f6600p_advanced_ui.cjs | 93 | return {features:JSON.parse(options.body).features.map(feature=>({ |
| tests/test_f6600p_advanced_ui.cjs | 117 | const section=JSON.parse(options.body).section; |
| tests/test_tangerine_v2.cjs | 6 | const html=fs.readFileSync(root+"templates/index.html","utf8"); |
| tests/test_tangerine_v2.cjs | 13 | assert.match(html,new RegExp('<textarea id="'+id+'"')); |
| tests/test_tangerine_v2.cjs | 16 | assert.match(html,/zte_manager\/js\/tangerine_forms\.js/); |
| tests/test_tangerine_v2.cjs | 17 | assert.match(html,/zte_manager\/css\/tangerine_forms\.css/); |
| tests/test_tangerine_v2.cjs | 27 | assert.deepEqual(JSON.parse(JSON.stringify(original)), |
| tests/test_tangerine_v2.cjs | 37 | const start=html.indexOf('<section id="page-'+id+'" class="page'); |
| tests/test_tangerine_v2.cjs | 39 | const next=html.indexOf('<section id="page-',start+10); |
| tests/test_tangerine_v2.cjs | 40 | const chunk=html.slice(start,next<0?undefined:next); |
| tests/test_tangerine_v2.cjs | 46 | assert.ok(html.includes('id="'+id+'"'),id); |
| tests/test_tangerine_v2.cjs | 48 | assert.match(html,/class="login-hero am-connect-story am-inventory-panel"/); |
| tests/test_tangerine_v2.cjs | 49 | assert.ok(html.includes('id="connectionInventoryList"'), |
| tests/test_tangerine_v2.cjs | 51 | assert.doesNotMatch(html,/window-dot red/); |
| tests/test_tangerine_v2.cjs | 62 | assert.ok(html.includes("zte_manager/css/tangerine_cards.css")); |
| tests/test_tangerine_v2.cjs | 74 | assert.ok(html.includes("tangerine_results.js")); |
| tests/test_dns.py | 4 | _parse_hosts, |
| tests/test_dns.py | 10 | def test_parse_hosts_filtra_entradas_dhcp(self): |
| tests/test_dns.py | 11 | xml = """ |
| tests/test_dns.py | 12 | <ajax_response_xml_root> |
| tests/test_dns.py | 27 | </ajax_response_xml_root> |
| tests/test_dns.py | 30 | hosts = _parse_hosts( |
| tests/test_dns.py | 31 | xml |
| tests/test_dns.py | 77 | <ajax_response_xml_root> |
| tests/test_dns.py | 80 | </ajax_response_xml_root> |
| tests/test_dns.py | 83 | <ajax_response_xml_root> |
| tests/test_dns.py | 92 | </ajax_response_xml_root> |
| tests/test_dns.py | 97 | def _validar_resposta(xml): |
| tests/test_dns.py | 98 | return xml |
| tests/test_dns.py | 127 | <ajax_response_xml_root> |
| tests/test_dns.py | 135 | </ajax_response_xml_root> |
| tests/test_dns.py | 139 | <ajax_response_xml_root> |
| tests/test_dns.py | 147 | </ajax_response_xml_root> |
| tests/test_dns.py | 152 | def _validar_resposta(xml): |
| tests/test_dns.py | 153 | return xml |
| tests/test_dns.py | 156 | def _parse_instances(xml): |
| tests/test_dns.py | 158 | return ZTE._parse_instances(xml) |
| tests/test_f6600p_light_popups.cjs | 9 | const template=fs.readFileSync("apps/zte_manager/templates/index.html","utf8"); |
| tests/test_f6600p_light_popups.cjs | 16 | 'html[data-theme="light"] select option', |
| tests/test_f6600p_light_popups.cjs | 17 | 'html[data-theme="light"] select optgroup', |
| tests/test_f6600p_light_popups.cjs | 18 | 'html[data-theme="light"] .hero-flow > div', |
| tests/test_f6600p_light_popups.cjs | 19 | 'html[data-theme="light"] .capability-card', |
| tests/test_f6600p_light_popups.cjs | 20 | 'html[data-theme="light"] #trackerDiscoverySection .operation-row', |
| tests/test_f6600p_light_popups.cjs | 28 | assert.ok(!light.includes('html[data-theme="dark"] {'), |
| tests/test_multivendor_ui.cjs | 16 | const shell = read("apps/zte_manager/templates/source/shell_start.html"); |
| tests/test_f6201b_second_capture.py | 15 | XML_ENCODE = """<ajax_response_xml_root> |
| tests/test_f6201b_second_capture.py | 21 | </ajax_response_xml_root>""" |
| tests/test_f6201b_second_capture.py | 48 | return "<ajax_response_xml_root><IF_ERRORID>0</IF_ERRORID></ajax_response_xml_root>" |
| tests/test_f6201b_second_capture.py | 51 | def _parse_instances(self, raw): |
| tests/test_f6201b_second_capture.py | 75 | self.assertEqual(zte_wifi._get_encode_fields(XML_ENCODE), |
| tests/test_f6201b_second_capture.py | 122 | return "<ajax_response_xml_root><IF_ERRORID>0</IF_ERRORID></ajax_response_xml_root>" |
| tests/test_api_error_sanitization.py | 24 | self.assertRegex(result["error_id"], r"^[0-9a-f]{32}$") |
| tests/test_api_error_sanitization.py | 37 | raise FakeFirmwareError("<xml>ONT PASSWORD:PRIVATE_TOKEN</xml>") |
| tests/test_css_architecture.py | 10 | SHELL = ROOT / "apps" / "zte_manager" / "templates" / "source" / "shell_start.html" |
| tests/test_css_architecture.py | 11 | INDEX = ROOT / "apps" / "zte_manager" / "templates" / "index.html" |
| tests/test_css_architecture.py | 74 | "html[data-theme] .brand-mark {", |
| tests/test_css_architecture.py | 75 | "html[data-theme] #themeToggle {display:none!important;}", |
| tests/test_css_architecture.py | 78 | "html[data-theme] .am-dashboard-hero {", |
| tests/test_css_architecture.py | 79 | "html[data-theme] .am-activity-list {", |
| tests/test_css_architecture.py | 82 | 'html[data-theme="light"] .firmware-json,', |
| tests/test_css_architecture.py | 83 | "html[data-theme] #pingOutput.terminal-output,", |
| tests/test_css_architecture.py | 86 | "html[data-theme] .am-session-bar{", |
| tests/test_css_architecture.py | 87 | "html[data-theme] .am-connect-story{", |
| tests/test_css_architecture.py | 88 | "html[data-theme] .management-tabs{", |
| tests/test_css_architecture.py | 91 | "html[data-theme] #page-advanced .advanced-actions {", |
| tests/test_css_architecture.py | 92 | "html[data-theme] .am-toolpanel[hidden] {display:none!important;}", |
| tests/test_css_architecture.py | 93 | "html[data-theme] #firmwareShapeOutput {", |
| tests/test_css_architecture.py | 96 | "html[data-theme] .am-history-timeline {", |
| tests/test_css_architecture.py | 97 | "html[data-theme] .am-history-backup {", |
| tests/test_css_architecture.py | 100 | "html[data-theme] .login-layout:has(.am-inventory-panel) {", |
| tests/test_css_architecture.py | 101 | "html[data-theme] .am-inventory-entry {", |
| tests/test_css_architecture.py | 104 | "html[data-theme] #page-clients .am-section-intro {", |
| tests/test_css_architecture.py | 105 | "html[data-theme] .am-client-workbench {", |
| tests/test_css_architecture.py | 108 | "html[data-theme] .am-device-summary {", |
| tests/test_css_architecture.py | 109 | "html[data-theme] .am-device-maintenance {", |
| tests/test_css_architecture.py | 112 | "html[data-theme] .am-tr069-workspace {", |
| tests/test_css_architecture.py | 113 | "html[data-theme] .management-pane[hidden]{display:none!important;}", |
| tests/test_css_architecture.py | 116 | "html[data-theme] .am-diagnostic-workspace.am-diagnostic-tabbed {", |
| tests/test_css_architecture.py | 117 | "html[data-theme] .am-diagnostic-tabbed .diagnostic-card pre.terminal-output {", |
| tests/test_css_architecture.py | 196 | self.assertNotRegex(source, r"--ui-[a-z0-9-]+\s*:") |
| tests/test_css_architecture.py | 204 | self.assertNotRegex(source, r"\{\s*[^*]", "tangerine.css must coordinate layers, not own CSS rules") |
| tests/test_css_architecture.py | 285 | for path in sorted(source_root.rglob("*.html")): |
| tests/test_tangerine_ui.cjs | 10 | const html = fs.readFileSync(root+"/templates/index.html", "utf8"); |
| tests/test_tangerine_ui.cjs | 18 | const ids = [...html.matchAll(/class="menu-item[^"]*" data-page="([^"]+)"/g)].map(x=>x[1]); |
| tests/test_tangerine_ui.cjs | 22 | for (const id of expected) assert.match(html, new RegExp('id="page-'+id+'"')); |
| tests/test_tangerine_ui.cjs | 24 | assert.ok(html.includes('id="'+action+'"'), action+" must keep backend handlers"); |
| tests/test_tangerine_ui.cjs | 26 | assert.match(html, /zte_manager\/css\/tangerine\.css/); |
| tests/test_tangerine_ui.cjs | 27 | assert.match(html, /zte_manager\/js\/tangerine_shell\.js/); |
| tests/test_tangerine_ui.cjs | 28 | assert.match(html, /id="appearanceSelect"/); |
| tests/test_tangerine_ui.cjs | 29 | assert.match(html, /id="sidebarCollapseToggle"/); |
| tests/test_tangerine_ui.cjs | 30 | assert.doesNotMatch(html, /12 devices online\|SSH connection established\|acme-corp\.local/); |
| tests/test_tangerine_ui.cjs | 62 | assert.match(advanced,/escapeHtml\(normalizeApiErrorMessage\(message/); |
| tests/test_huawei_ipv4_filter_ui.cjs | 22 | innerHTML: "" |
| tests/test_f6201b_view_binding.py | 8 | import xml.etree.ElementTree as ET |
| tests/test_f6201b_view_binding.py | 31 | def xml_response(root_tag, fields=None): |
| tests/test_f6201b_view_binding.py | 32 | root = ET.Element("ajax_response_xml_root") |
| tests/test_f6201b_view_binding.py | 64 | return xml_response("OBJ_UNRELATED") |
| tests/test_f6201b_view_binding.py | 68 | text = xml_response("OBJ_WLANSETTING_ID", { |
| tests/test_f6201b_view_binding.py | 78 | return xml_response("OBJ_UNRELATED") |
| tests/test_f6201b_view_binding.py | 80 | return xml_response("OBJ_WLANAP_ID", {"Enable": "1", "ESSID": "test"}) |
| tests/test_f6201b_view_binding.py | 81 | return xml_response(root) |
| tests/test_native_ui_preserved.cjs | 9 | const template=fs.readFileSync("apps/zte_manager/templates/index.html","utf8"); |
| tests/test_management_tabs.cjs | 5 | const html=fs.readFileSync("apps/zte_manager/templates/index.html","utf8"); |
| tests/test_management_tabs.cjs | 6 | const source=fs.readFileSync("apps/zte_manager/templates/source/pages/management.html","utf8"); |
| tests/test_management_tabs.cjs | 9 | for(const doc of [html,source]) { |
| tests/test_management_tabs.cjs | 11 | assert.match(doc,new RegExp('id="management-tab-'+key+'"')); |
| tests/test_management_tabs.cjs | 12 | assert.match(doc,new RegExp('id="management-panel-'+key+'"')); |
| tests/test_management_tabs.cjs | 13 | assert.match(doc,new RegExp('aria-controls="management-panel-'+key+'"')); |
| tests/test_diagnostic_session_restore.py | 33 | html = ( |
| tests/test_diagnostic_session_restore.py | 34 | ROOT / "apps" / "zte_manager" / "templates" / "index.html" |
| tests/test_diagnostic_session_restore.py | 38 | html, |
| tests/test_diagnostic_session_restore.py | 42 | html, |
| tests/test_ui_action_regressions.py | 9 | TEMPLATE = ROOT / "apps/zte_manager/templates/index.html" |
| tests/test_ui_action_regressions.py | 19 | html = TEMPLATE.read_text(encoding="utf-8") |
| tests/test_ui_action_regressions.py | 36 | self.assertIn('id="' + button + '"', html) |
| tests/test_ui_action_regressions.py | 60 | html = TEMPLATE.read_text(encoding="utf-8") |
| tests/test_ui_action_regressions.py | 64 | self.assertIn('id="requestStatusIndicator"', html) |
| tests/test_f6201b_full_forms.py | 84 | return ("<ajax_response_xml_root><IF_ERRORID>0</IF_ERRORID>" + |
| tests/test_f6201b_full_forms.py | 85 | encode + "</ajax_response_xml_root>") |
| tests/test_f6201b_full_forms.py | 87 | def _parse_instances(self, _xml): |
| tests/test_f6201b_full_forms.py | 131 | def test_each_form_can_prepare_all_captured_fields_from_synthetic_html(self): |
| tests/test_f6201b_full_forms.py | 149 | def test_native_dhcp_decodes_get_and_encodes_all_five_post_fields(self): |
| tests/test_f6201b_full_forms.py | 180 | with self.assertRaisesRegex(ValueError, "Type"): |
| tests/test_f6201b_full_forms.py | 182 | with self.assertRaisesRegex(ValueError, "incompleto"): |
| tests/test_f6201b_full_forms.py | 226 | with self.assertRaisesRegex(ValueError, "diverge"): |
| tests/test_f6201b_full_forms.py | 281 | with self.assertRaisesRegex(PermissionError, "Prévia"): |
| tests/test_f6201b_full_forms.py | 359 | with self.assertRaisesRegex(PermissionError, "mudou"): |
| tests/test_f6201b_full_forms.py | 374 | with self.assertRaisesRegex(RuntimeError, "mudou"): |
| tests/test_huawei_response_protocol.py | 7 | HuaweiResponseParser, |
| tests/test_huawei_response_protocol.py | 26 | def __init__(self, *, mutation_body="<html><body>ok</body></html>"): |
| tests/test_huawei_response_protocol.py | 56 | content_type="text/html; charset=UTF-8", |
| tests/test_huawei_response_protocol.py | 63 | "/html/bbsp/dmz/set.cgi?" |
| tests/test_huawei_response_protocol.py | 65 | "RequestFile=html%2Fbbsp%2Fdmz%2Fdmz.asp" |
| tests/test_huawei_response_protocol.py | 67 | self.assertIn("RequestFile=html/bbsp/dmz/dmz.asp", value) |
| tests/test_huawei_response_protocol.py | 68 | self.assertNotIn("RequestFile=html%2Fbbsp", value) |
| tests/test_huawei_response_protocol.py | 83 | def test_normal_html_is_accepted_but_not_confirmed(self): |
| tests/test_huawei_response_protocol.py | 84 | parsed = HuaweiResponseParser.parse( |
| tests/test_huawei_response_protocol.py | 86 | body="<html><body>DMZ</body></html>", |
| tests/test_huawei_response_protocol.py | 87 | content_type="text/html; charset=UTF-8", |
| tests/test_huawei_response_protocol.py | 89 | self.assertTrue(parsed.ok) |
| tests/test_huawei_response_protocol.py | 90 | self.assertTrue(parsed.accepted) |
| tests/test_huawei_response_protocol.py | 91 | self.assertFalse(parsed.confirmed) |
| tests/test_huawei_response_protocol.py | 92 | self.assertEqual(parsed.response_type, "html") |
| tests/test_huawei_response_protocol.py | 95 | parsed = HuaweiResponseParser.parse( |
| tests/test_huawei_response_protocol.py | 98 | content_type="text/html", |
| tests/test_huawei_response_protocol.py | 100 | self.assertTrue(parsed.ok) |
| tests/test_huawei_response_protocol.py | 101 | self.assertTrue(parsed.accepted) |
| tests/test_huawei_response_protocol.py | 102 | self.assertTrue(parsed.confirmed) |
| tests/test_huawei_response_protocol.py | 103 | self.assertEqual(parsed.response_type, "success_code") |
| tests/test_huawei_response_protocol.py | 106 | parsed = HuaweiResponseParser.parse( |
| tests/test_huawei_response_protocol.py | 109 | content_type="text/html", |
| tests/test_huawei_response_protocol.py | 111 | self.assertTrue(parsed.ok) |
| tests/test_huawei_response_protocol.py | 112 | self.assertTrue(parsed.accepted) |
| tests/test_huawei_response_protocol.py | 113 | self.assertFalse(parsed.confirmed) |
| tests/test_huawei_response_protocol.py | 114 | self.assertEqual(parsed.response_type, "empty") |
| tests/test_huawei_response_protocol.py | 117 | parsed = HuaweiResponseParser.parse( |
| tests/test_huawei_response_protocol.py | 121 | 'window.location.href="/html/amp/wlanadv/WlanAdvance.asp";' |
| tests/test_huawei_response_protocol.py | 124 | content_type="text/html", |
| tests/test_huawei_response_protocol.py | 126 | self.assertTrue(parsed.ok) |
| tests/test_huawei_response_protocol.py | 127 | self.assertTrue(parsed.accepted) |
| tests/test_huawei_response_protocol.py | 128 | self.assertFalse(parsed.confirmed) |
| tests/test_huawei_response_protocol.py | 129 | self.assertEqual(parsed.response_type, "script_redirect") |
| tests/test_huawei_response_protocol.py | 132 | parsed = HuaweiResponseParser.parse( |
| tests/test_huawei_response_protocol.py | 135 | content_type="text/html", |
| tests/test_huawei_response_protocol.py | 137 | self.assertTrue(parsed.ok) |
| tests/test_huawei_response_protocol.py | 138 | self.assertTrue(parsed.accepted) |
| tests/test_huawei_response_protocol.py | 139 | self.assertTrue(parsed.confirmed) |
| tests/test_huawei_response_protocol.py | 140 | self.assertEqual(parsed.response_type, "result_code") |
| tests/test_huawei_response_protocol.py | 143 | parsed = HuaweiResponseParser.parse( |
| tests/test_huawei_response_protocol.py | 145 | body='<html><script>var ErrCode = "0x1";</script></html>', |
| tests/test_huawei_response_protocol.py | 146 | content_type="text/html", |
| tests/test_huawei_response_protocol.py | 148 | self.assertFalse(parsed.ok) |
| tests/test_huawei_response_protocol.py | 149 | self.assertFalse(parsed.accepted) |
| tests/test_huawei_response_protocol.py | 150 | self.assertEqual(parsed.error_code, "0x1") |
| tests/test_huawei_response_protocol.py | 151 | self.assertEqual(parsed.response_type, "error_page") |
| tests/test_huawei_response_protocol.py | 154 | parsed = HuaweiResponseParser.parse( |
| tests/test_huawei_response_protocol.py | 158 | self.assertFalse(parsed.ok) |
| tests/test_huawei_response_protocol.py | 159 | self.assertFalse(parsed.accepted) |
| tests/test_huawei_response_protocol.py | 160 | self.assertEqual(parsed.response_type, "http_error") |
| tests/test_huawei_response_protocol.py | 163 | parsed = HuaweiResponseParser.parse( |
| tests/test_huawei_response_protocol.py | 169 | self.assertTrue(parsed.ok) |
| tests/test_huawei_response_protocol.py | 170 | self.assertTrue(parsed.accepted) |
| tests/test_huawei_response_protocol.py | 171 | self.assertTrue(parsed.confirmed) |
| tests/test_huawei_response_protocol.py | 172 | self.assertEqual(parsed.data, {"result": 0}) |
| tests/test_huawei_response_protocol.py | 175 | parsed = HuaweiResponseParser.parse( |
| tests/test_huawei_response_protocol.py | 182 | self.assertFalse(parsed.ok) |
| tests/test_huawei_response_protocol.py | 183 | self.assertFalse(parsed.accepted) |
| tests/test_huawei_response_protocol.py | 184 | self.assertEqual(parsed.error_code, "0x1") |
| tests/test_huawei_response_protocol.py | 185 | self.assertEqual(parsed.data["result"], 1) |
| tests/test_huawei_response_protocol.py | 194 | "/html/bbsp/upnp/set.cgi?" |
| tests/test_huawei_response_protocol.py | 196 | "RequestFile=html%2Fbbsp%2Fupnp%2Fupnp.asp", |
| tests/test_huawei_response_protocol.py | 198 | referer="/html/bbsp/other/set.cgi", |
| tests/test_huawei_response_protocol.py | 202 | "/html/bbsp/upnp/upnp.asp", |
| tests/test_huawei_response_protocol.py | 206 | self.assertEqual(referer, "/html/bbsp/upnp/upnp.asp") |
| tests/test_huawei_response_protocol.py | 209 | def test_mapped_html_write_requires_readback_for_verification(self): |
| tests/test_huawei_response_protocol.py | 213 | "/html/bbsp/upnp/set.cgi?" |
| tests/test_huawei_response_protocol.py | 215 | "RequestFile=html/bbsp/upnp/upnp.asp", |
| tests/test_huawei_response_protocol.py | 217 | readback_path="/html/bbsp/upnp/upnp.asp", |
| tests/test_huawei_response_protocol.py | 224 | def test_mapped_html_without_expected_state_is_not_falsely_verified(self): |
| tests/test_huawei_response_protocol.py | 228 | "/html/bbsp/upnp/set.cgi?" |
| tests/test_huawei_response_protocol.py | 230 | "RequestFile=html/bbsp/upnp/upnp.asp", |
| tests/test_huawei_response_protocol.py | 232 | readback_path="/html/bbsp/upnp/upnp.asp", |
| tests/test_huawei_response_protocol.py | 247 | "/html/bbsp/dscptopbit/setajax.cgi?" |
| tests/test_huawei_response_protocol.py | 248 | "RequestFile=html/bbsp/dscptopbit/dscptopbit.asp", |
| tests/test_huawei_response_protocol.py | 250 | readback_path="/html/bbsp/dscptopbit/dscptopbit.asp", |
| tests/test_operations_contract.py | 48 | / "index.html" |
| tests/test_huawei_provider_architecture.py | 19 | DEVICE_HTML = ( |
| tests/test_huawei_provider_architecture.py | 20 | FIXTURES / "huawei_deviceinfo_eg8041x7.html" |
| tests/test_huawei_provider_architecture.py | 25 | device_html = "" |
| tests/test_huawei_provider_architecture.py | 63 | if path == "/html/ssmp/deviceinfo/deviceinfo.asp": |
| tests/test_huawei_provider_architecture.py | 64 | return type(self).device_html |
| tests/test_huawei_provider_architecture.py | 65 | if path == "/html/bbsp/ipincoming/ipincoming.asp": |
| tests/test_huawei_provider_architecture.py | 70 | return "<html><body>Huawei WebUI</body></html>" |
| tests/test_huawei_provider_architecture.py | 133 | FakeHuaweiWebClient.device_html = "" |
| tests/test_huawei_provider_architecture.py | 195 | FakeHuaweiWebClient.device_html = DEVICE_HTML |
| tests/test_huawei_provider_architecture.py | 321 | FakeHuaweiWebClient.device_html = DEVICE_HTML |
| tests/test_huawei_provider_architecture.py | 399 | FakeHuaweiWebClient.device_html = DEVICE_HTML |
| tests/test_huawei_provider_architecture.py | 434 | FakeHuaweiWebClient.device_html = DEVICE_HTML |
| tests/test_huawei_provider_architecture.py | 471 | FakeHuaweiWebClient.device_html = DEVICE_HTML |
| tests/test_huawei_provider_architecture.py | 485 | FakeHuaweiWebClient.device_html = DEVICE_HTML |
| tests/test_telecom_console_theme.py | 10 | / "index.html" |
| tests/test_telecom_console_theme.py | 31 | html = TEMPLATE.read_text( |
| tests/test_telecom_console_theme.py | 35 | management = html.index( |
| tests/test_telecom_console_theme.py | 39 | telecom = html.index( |
| tests/test_telecom_console_theme.py | 44 | assert "cdn.tailwindcss.com" not in html |
| tests/test_telecom_console_theme.py | 48 | html = TEMPLATE.read_text( |
| tests/test_telecom_console_theme.py | 61 | assert marker in html |
| tests/test_telecom_console_theme.py | 65 | in html |
| tests/test_telecom_console_theme.py | 107 | html = TEMPLATE.read_text( |
| tests/test_telecom_console_theme.py | 111 | assert 'id="managementNetworkCopy"' in html |
| tests/test_telecom_console_theme.py | 112 | assert 'id="managementNetworkCopyRelevant"' in html |
| tests/test_telecom_console_theme.py | 113 | assert 'class="management-code-output large selectable-output"' in html |
| tests/test_brmodelo_workbench.cjs | 4 | const index = fs.readFileSync("apps/zte_manager/templates/index.html","utf8"); |
| tests/test_brmodelo_workbench.cjs | 13 | assert.ok(css.includes('html[data-theme="light"]')); |
| tests/test_brmodelo_workbench.cjs | 14 | assert.ok(css.includes('html[data-theme="dark"]')); |
| tests/test_f6600p_dhcp_encoded.py | 5 | import xml.etree.ElementTree as ET |
| tests/test_f6600p_dhcp_encoded.py | 28 | ).decode() |
| tests/test_f6600p_dhcp_encoded.py | 50 | root = ET.Element("ajax_response_xml_root") |
| tests/test_f6600p_dhcp_encoded.py | 59 | return "<ajax_response_xml_root/>" |
| tests/test_f6600p_dhcp_encoded.py | 61 | if "<html" in value: |
| tests/test_f6600p_dhcp_encoded.py | 63 | _parse_instances = staticmethod(ZTE._parse_instances) |
| tests/test_f6600p_dhcp_encoded.py | 70 | base64.b64decode(posted["encode"]), padding.PKCS1v15() |
| tests/test_f6600p_dhcp_encoded.py | 71 | ).decode() |
| tests/test_f6600p_dhcp_encoded.py | 77 | return "<ajax_response_xml_root/>" |
| tests/test_f6600p_dhcp_encoded.py | 81 | def test_declared_and_implicit_ciphertext_decode_to_real_ip(self): |
| tests/test_f6600p_dhcp_encoded.py | 103 | with self.assertRaisesRegex(ValueError, "protegidos"): |
| tests/test_neutral_theme.cjs | 4 | const markup = fs.readFileSync("apps/zte_manager/templates/index.html", "utf8"); |
| tests/test_neutral_theme.cjs | 24 | assert.ok(css.includes('html[data-theme="light"]') && |
| tests/test_neutral_theme.cjs | 25 | css.includes('html[data-theme="dark"]'),"Both theme palettes required"); |
| tests/test_phase2_integration.py | 101 | "raw_xml": "<secret>not-for-inventory</secret>", |
| tests/test_phase2_integration.py | 113 | self.assertNotIn("raw_xml", str(entry)) |
| tests/test_phase2_integration.py | 270 | with self.assertRaisesRegex(ValueError, "firmware mudou"): |
| tests/test_phase2_integration.py | 348 | with self.assertRaisesRegex(ValueError, "Modelo informado diverge"): |
| tests/test_phase2_integration.py | 363 | with self.assertRaisesRegex(ValueError, "revalidar"): |
| tests/test_phase2_integration.py | 405 | with self.assertRaisesRegex(ValueError, "Identidade\|firmware"): |
| tests/test_phase2_integration.py | 467 | / "apps" / "zte_manager" / "templates" / "index.html" |
| tests/test_f6201b_profile.py | 5 | from urllib.parse import parse_qsl |
| tests/test_f6201b_profile.py | 45 | return "<ajax_response_xml_root><IF_ERRORID>0</IF_ERRORID></ajax_response_xml_root>" |
| tests/test_f6201b_profile.py | 46 | def _parse_instances(self, xml): |
| tests/test_f6201b_profile.py | 113 | return "<ajax_response_xml_root><IF_ERRORID>0</IF_ERRORID></ajax_response_xml_root>" |
| tests/test_f6201b_profile.py | 155 | return ("<ajax_response_xml_root><IF_ERRORID>0</IF_ERRORID>" |
| tests/test_f6201b_profile.py | 156 | "</ajax_response_xml_root>") |
| tests/test_f6201b_profile.py | 179 | return "<ajax_response_xml_root><IF_ERRORID>0</IF_ERRORID></ajax_response_xml_root>" |
| tests/test_f6201b_profile.py | 201 | return ("<ajax_response_xml_root><IF_ERRORID>0</IF_ERRORID>" |
| tests/test_f6201b_profile.py | 202 | "</ajax_response_xml_root>") |
| tests/test_f6201b_profile.py | 230 | fields = parse_qsl(data, keep_blank_values=True) |
| tests/test_f6201b_profile.py | 240 | text = ("<ajax_response_xml_root><IF_ERRORID>0</IF_ERRORID>" |
| tests/test_f6201b_profile.py | 241 | "</ajax_response_xml_root>") |
| tests/test_f6201b_profile.py | 285 | self.zte._parse_instances = lambda _: { |
| tests/test_f6201b_profile.py | 306 | return ("<ajax_response_xml_root><IF_ERRORID>0</IF_ERRORID>" |
| tests/test_f6201b_profile.py | 307 | "</ajax_response_xml_root>") |
| tests/test_f6201b_profile.py | 346 | with self.assertRaisesRegex(RuntimeError, "PreambleType"): |
| tests/test_dhcp_module_ui.cjs | 4 | const html = fs.readFileSync("apps/zte_manager/templates/index.html","utf8"); |
| tests/test_dhcp_module_ui.cjs | 12 | ]) assert.ok(html.includes('id="'+id+'"'),"Missing control "+id); |
| tests/test_dhcp_module_ui.cjs | 13 | assert.ok(html.includes("dhcp_module.css") && html.includes("dhcp_module.js")); |
| apps/zte_manager/repositories/profile_repository.py | 47 | json.JSONDecodeError, |
| apps/zte_manager/repositories/history_repository.py | 532 | item[field] = json.loads( |
| apps/zte_manager/repositories/history_repository.py | 535 | except json.JSONDecodeError: |
| apps/zte_manager/repositories/management_repository.py | 262 | return json.loads( |
| apps/zte_manager/services/huawei_telemetry_runtime.py | 4 | from urllib.parse import urlparse |
| apps/zte_manager/services/huawei_telemetry_runtime.py | 117 | parsed = urlparse(self._client.base_url) |
| apps/zte_manager/services/huawei_telemetry_runtime.py | 118 | if parsed.hostname: |
| apps/zte_manager/services/huawei_telemetry_runtime.py | 119 | return parsed.hostname |
| apps/zte_manager/services/huawei_telemetry_runtime.py | 122 | parsed = urlparse(raw) |
| apps/zte_manager/services/huawei_telemetry_runtime.py | 123 | if parsed.hostname: |
| apps/zte_manager/services/huawei_telemetry_runtime.py | 124 | return parsed.hostname |
| apps/zte_manager/services/huawei_telemetry_runtime.py | 360 | "Telemetria read-only promovida somente após probe e parser " |
| apps/zte_manager/services/huawei_ipv4_filter_service.py | 11 | decode_huawei_js_string, |
| apps/zte_manager/services/huawei_ipv4_filter_service.py | 19 | PAGE = "/html/bbsp/ipincoming/ipincoming.asp" |
| apps/zte_manager/services/huawei_ipv4_filter_service.py | 20 | DIR = "/html/bbsp/ipincoming" |
| apps/zte_manager/services/huawei_ipv4_filter_service.py | 64 | def parse_st_filter_in( |
| apps/zte_manager/services/huawei_ipv4_filter_service.py | 65 | html: str, |
| apps/zte_manager/services/huawei_ipv4_filter_service.py | 71 | html or "", |
| apps/zte_manager/services/huawei_ipv4_filter_service.py | 83 | decode_huawei_js_string(value) |
| apps/zte_manager/services/huawei_ipv4_filter_service.py | 233 | _html, rules = self._state() |
| apps/zte_manager/services/huawei_ipv4_filter_service.py | 264 | "&RequestFile=html/bbsp/ipincoming/ipincoming.asp" |
| apps/zte_manager/services/huawei_ipv4_filter_service.py | 317 | "&RequestFile=html/bbsp/ipincoming/ipincoming.asp" |
| apps/zte_manager/services/huawei_ipv4_filter_service.py | 376 | "?RequestFile=html/bbsp/ipincoming/ipincoming.asp" |
| apps/zte_manager/services/huawei_ipv4_filter_service.py | 440 | html = self.client.get_page( |
| apps/zte_manager/services/huawei_ipv4_filter_service.py | 445 | html, |
| apps/zte_manager/services/huawei_ipv4_filter_service.py | 446 | parse_st_filter_in( |
| apps/zte_manager/services/huawei_ipv4_filter_service.py | 447 | html |
| apps/zte_manager/services/huawei_ipv4_filter_service.py | 482 | _html, rules = self._state() |
| apps/zte_manager/services/huawei_eg8041_family_runtime.py | 58 | parser success. |
| apps/zte_manager/services/huawei_eg8041_family_runtime.py | 62 | _DEVICE_PAGE = "/html/ssmp/deviceinfo/deviceinfo.asp" |
| apps/zte_manager/services/huawei_eg8041_family_runtime.py | 63 | _PING_DNS_PATH = "/html/bbsp/maintenance/GetPingDnsResult.asp" |
| apps/zte_manager/services/huawei_eg8041_family_runtime.py | 125 | html, parsed = captured._records(page) |
| apps/zte_manager/services/huawei_eg8041_family_runtime.py | 128 | chunks.append(html) |
| apps/zte_manager/services/huawei_eg8041_family_runtime.py | 129 | records.extend(parsed) |
| apps/zte_manager/services/huawei_eg8041_family_runtime.py | 477 | def _parse_resolved_ip(source: str) -> str \| None: |
| apps/zte_manager/services/huawei_eg8041_family_runtime.py | 499 | resolved_ip = self._parse_resolved_ip(dns_result) |
| apps/zte_manager/services/huawei_eg8041_family_runtime.py | 641 | "READ_SUPPORTED": "Safe reader returned a recognizable parsed result.", |
| apps/zte_manager/services/backup_service.py | 4 | import xml.etree.ElementTree as ET |
| apps/zte_manager/services/backup_service.py | 41 | def _flatten_xml( |
| apps/zte_manager/services/backup_service.py | 100 | _flatten_xml( |
| apps/zte_manager/services/backup_service.py | 217 | xml_left = self._xml( |
| apps/zte_manager/services/backup_service.py | 220 | xml_right = self._xml( |
| apps/zte_manager/services/backup_service.py | 225 | xml_left is None |
| apps/zte_manager/services/backup_service.py | 226 | or xml_right is None |
| apps/zte_manager/services/backup_service.py | 233 | "Os arquivos são diferentes, mas o conteúdo não é XML legível; " |
| apps/zte_manager/services/backup_service.py | 240 | xml_left |
| apps/zte_manager/services/backup_service.py | 243 | xml_right |
| apps/zte_manager/services/backup_service.py | 250 | before = xml_left.get( |
| apps/zte_manager/services/backup_service.py | 253 | after = xml_right.get( |
| apps/zte_manager/services/backup_service.py | 271 | "format": "xml", |
| apps/zte_manager/services/backup_service.py | 285 | def _xml( |
| apps/zte_manager/services/backup_service.py | 293 | ET.ParseError, |
| apps/zte_manager/services/backup_service.py | 294 | UnicodeDecodeError, |
| apps/zte_manager/services/backup_service.py | 298 | return _flatten_xml( |
| apps/zte_manager/services/huawei_eg8041_family_provider.py | 7 | decode_huawei_diagnostic_result, |
| apps/zte_manager/services/huawei_eg8041_family_provider.py | 134 | def _decode_diagnostic_result(source: object) -> tuple[str, str]: |
| apps/zte_manager/services/huawei_eg8041_family_provider.py | 135 | """Decode the physically observed EG8041 polling response grammar.""" |
| apps/zte_manager/services/huawei_eg8041_family_provider.py | 136 | return decode_huawei_diagnostic_result(source) |
| apps/zte_manager/services/zte_service.py | 1345 | The form-specific adapter validates its *real* view/XML fields, |
| apps/zte_manager/services/zte_service.py | 1432 | records = zte._parse_instances(raw).get( |
| apps/zte_manager/services/zte_service.py | 1905 | # firmware/XML or raw exception strings. |
| apps/zte_manager/services/f6201b_diagnostics.py | 5 | import xml.etree.ElementTree as ET |
| apps/zte_manager/services/f6201b_diagnostics.py | 17 | xml = zte.get_menu(tag) |
| apps/zte_manager/services/f6201b_diagnostics.py | 18 | root = ET.fromstring(xml) |
| apps/zte_manager/services/f6201b_diagnostics.py | 19 | if root.tag != "ajax_response_xml_root" or root.findtext("IF_ERRORID") != "0": |
| apps/zte_manager/services/f6201b_diagnostics.py | 21 | if ROOTS[tag] not in xml: |
| apps/zte_manager/services/f6201b_diagnostics.py | 23 | return zte._parse_instances(xml).get(ROOTS[tag], []) |
| apps/zte_manager/services/f6201b_support.py | 32 | """Never return raw router XML, credentials or HTTP response bodies.""" |
| apps/zte_manager/services/speed_test_service.py | 10 | from urllib.parse import urljoin, urlparse |
| apps/zte_manager/services/speed_test_service.py | 18 | "AppleWebKit/537.36 (KHTML, like Gecko) " |
| apps/zte_manager/services/speed_test_service.py | 49 | urlparse(url).hostname |
| apps/zte_manager/services/speed_test_service.py | 216 | urlparse( |
| apps/zte_manager/services/speed_test_service.py | 585 | urlparse(target).hostname |
| apps/zte_manager/services/speed_test_service.py | 870 | urlparse( |
| apps/zte_manager/services/capability_service.py | 3 | import xml.etree.ElementTree as ET |
| apps/zte_manager/services/capability_service.py | 88 | xml = self.zte.get_menu( |
| apps/zte_manager/services/capability_service.py | 93 | # ZTE pode retornar 200 com HTML de LOGIN / SessionTimeout. |
| apps/zte_manager/services/capability_service.py | 96 | if not isinstance(xml, str) or not xml.strip(): |
| apps/zte_manager/services/capability_service.py | 98 | parsed_root = ET.fromstring(xml) |
| apps/zte_manager/services/capability_service.py | 99 | if parsed_root.tag != "ajax_response_xml_root": |
| apps/zte_manager/services/capability_service.py | 101 | if "SessionTimeout" in xml: |
| apps/zte_manager/services/capability_service.py | 103 | firmware_error = (parsed_root.findtext("IF_ERRORSTR") or "").strip() |
| apps/zte_manager/services/capability_service.py | 108 | self.zte._validar_resposta(xml) |
| apps/zte_manager/services/capability_service.py | 109 | objects = self.zte._parse_instances(xml) |
| apps/zte_manager/services/capability_service.py | 124 | xml |
| apps/zte_manager/services/capability_service.py | 149 | # Retornar o TIPO, jamais HTML, parâmetros ou tokens |
| apps/zte_manager/services/capability_service.py | 166 | xml_text: str, |
| apps/zte_manager/services/capability_service.py | 172 | <logStr>. O parser de instâncias propositalmente ignora esses campos. |
| apps/zte_manager/services/capability_service.py | 176 | xml_text |
| apps/zte_manager/services/capability_service.py | 178 | except ET.ParseError: |
| apps/zte_manager/services/f6201b_full_forms.py | 5 | XML menuData, and observable HTML form controls. Missing conditional fields |
| apps/zte_manager/services/f6201b_full_forms.py | 11 | from html.parser import HTMLParser |
| apps/zte_manager/services/f6201b_full_forms.py | 18 | import xml.etree.ElementTree as ET |
| apps/zte_manager/services/f6201b_full_forms.py | 51 | # Captured HTML sometimes carries fields that the XML object omits. |
| apps/zte_manager/services/f6201b_full_forms.py | 158 | class LiveHtmlForm(HTMLParser): |
| apps/zte_manager/services/f6201b_full_forms.py | 159 | """Reads form values without executing firmware JavaScript or exposing HTML.""" |
| apps/zte_manager/services/f6201b_full_forms.py | 212 | def _live_fields(raw: str, view_html: str, tag: str, zte): |
| apps/zte_manager/services/f6201b_full_forms.py | 213 | """Capture-order, exact-name read from current XML and current HTML.""" |
| apps/zte_manager/services/f6201b_full_forms.py | 215 | if root.tag != "ajax_response_xml_root" or root.findtext("IF_ERRORID") != "0": |
| apps/zte_manager/services/f6201b_full_forms.py | 217 | objects = zte._parse_instances(raw) |
| apps/zte_manager/services/f6201b_full_forms.py | 223 | html = LiveHtmlForm(names) |
| apps/zte_manager/services/f6201b_full_forms.py | 224 | html.feed(view_html if isinstance(view_html, str) else "") |
| apps/zte_manager/services/f6201b_full_forms.py | 225 | html.close() |
| apps/zte_manager/services/f6201b_full_forms.py | 231 | return rows, objects, html.values, encode_fields |
| apps/zte_manager/services/f6201b_full_forms.py | 254 | objects: dict, html: dict) -> dict[str, str]: |
| apps/zte_manager/services/f6201b_full_forms.py | 257 | merged = {k: str(v) for k, v in html.items() if k in schema} |
| apps/zte_manager/services/f6201b_full_forms.py | 263 | # Live XML from a dedicated secondary object is more authoritative |
| apps/zte_manager/services/f6201b_full_forms.py | 290 | # A binding in a live XML Instance overrides hidden HTML defaults. |
| apps/zte_manager/services/f6201b_full_forms.py | 394 | # IF_ACTION is always the captured Apply, never an HTML page's |
| apps/zte_manager/services/f6201b_full_forms.py | 454 | html = zte.get_view(view, Menu3Location=0) |
| apps/zte_manager/services/f6201b_full_forms.py | 455 | xml = zte.get_menu(tag, **GET_PARAMS.get(tag, {})) |
| apps/zte_manager/services/f6201b_full_forms.py | 456 | rows, objects, html_values, encoded = _live_fields(xml, html, tag, zte) |
| apps/zte_manager/services/f6201b_full_forms.py | 489 | scoped = html_values |
| apps/zte_manager/services/f6201b_full_forms.py | 493 | } and len(rows) > 1 and html_values.get(ID) != str(row.get(ID))): |
| apps/zte_manager/services/f6201b_full_forms.py | 813 | except (RuntimeError, OSError, ET.ParseError, ValueError): |
| apps/zte_manager/services/f6201b_workbench.py | 18 | import xml.etree.ElementTree as ET |
| apps/zte_manager/services/f6201b_workbench.py | 228 | if root.tag != "ajax_response_xml_root" or root.findtext("IF_ERRORID") != "0": |
| apps/zte_manager/services/f6201b_workbench.py | 229 | raise RuntimeError("Firmware retornou XML inesperado ou erro de sessão.") |
| apps/zte_manager/services/f6201b_workbench.py | 230 | records = zte._parse_instances(raw).get(spec.root, []) |
| apps/zte_manager/services/f6201b_workbench.py | 256 | if root.tag != "ajax_response_xml_root" or root.findtext("IF_ERRORID") != "0": |
| apps/zte_manager/services/f6201b_workbench.py | 258 | records = zte._parse_instances(raw).get(spec.root, []) |
| apps/zte_manager/services/f6201b_workbench.py | 261 | "reason": "Objeto XML esperado não retornado."} |
| apps/zte_manager/services/f6201b_workbench.py | 363 | # transport lock even if Check, network or XML verification fails. |
| apps/zte_manager/services/f6201b_workbench.py | 393 | except (OSError, RuntimeError, ET.ParseError): |
| apps/zte_manager/services/f6201b_dhcp.py | 3 | import xml.etree.ElementTree as ET |
| apps/zte_manager/services/f6201b_dhcp.py | 29 | rows = zte._parse_instances(raw).get(root, []) |
| apps/zte_manager/services/f6201b_dhcp.py | 31 | xml = ET.fromstring(raw) |
| apps/zte_manager/services/f6201b_dhcp.py | 33 | (xml.findtext("encode") or "").split(",") |
| apps/zte_manager/services/f6201b_dhcp.py | 85 | # menuView + XML, NOT on a hardcoded model or employee profile. |
| apps/zte_manager/services/f6201b_dhcp.py | 104 | except (RuntimeError, KeyError, ValueError, ET.ParseError) as exc: |
| apps/zte_manager/services/multimodel_service.py | 5 | uma resposta XML válida confirma o endpoint e nenhum POST é feito aqui. |
| apps/zte_manager/services/multimodel_service.py | 13 | import xml.etree.ElementTree as ET |
| apps/zte_manager/services/multimodel_service.py | 136 | # Não armazenar respostas XML nem campos de clientes no relatório estrutural. |
| apps/zte_manager/services/multimodel_service.py | 208 | "proprietário; cada recurso continua exigindo XML válido. " |
| apps/zte_manager/services/multimodel_service.py | 268 | _shape(raw, endpoint.root)  # valida XML e objeto esperado antes de ler. |
| apps/zte_manager/services/multimodel_service.py | 291 | def _shape(xml: str, expected_root: str) -> dict[str, Any]: |
| apps/zte_manager/services/multimodel_service.py | 292 | if not xml or "SessionTimeout" in xml or "login_need_refresh" in xml: |
| apps/zte_manager/services/multimodel_service.py | 295 | root = ET.fromstring(xml) |
| apps/zte_manager/services/multimodel_service.py | 296 | if root.tag != "ajax_response_xml_root": |
| apps/zte_manager/services/multimodel_service.py | 297 | raise RuntimeError("Resposta não é XML ThinkLua") |
| apps/zte_manager/services/multimodel_service.py | 300 | # Não interpretar XML estrutural de uma requisição rejeitada como prova. |
| apps/zte_manager/services/multimodel_service.py | 350 | xml = _fetch(zte, endpoint) |
| apps/zte_manager/services/multimodel_service.py | 354 | "structure": _shape(xml, endpoint.root), |
| apps/zte_manager/services/multimodel_service.py | 359 | # Apenas categorias saneadas, nenhum HTML/token/credencial em UI. |
| apps/zte_manager/services/multimodel_service.py | 363 | elif "html" in message or "login" in message: |
| apps/zte_manager/services/multimodel_service.py | 365 | elif isinstance(exc, ET.ParseError): |
| apps/zte_manager/services/multimodel_service.py | 366 | reason = "invalid_xml" |
| apps/zte_manager/services/multimodel_service.py | 446 | if "SessionTimeout" in raw or raw.lstrip().lower().startswith("<html"): |
| apps/zte_manager/services/multimodel_service.py | 449 | data = json.loads(raw) |
| apps/zte_manager/services/f6201b_writes.py | 4 | Only the identified firmware and its actual XML form permit a write. |
| apps/zte_manager/services/f6201b_writes.py | 14 | import xml.etree.ElementTree as ET |
| apps/zte_manager/services/f6201b_writes.py | 126 | raise RuntimeError("Resposta de SSID não está em XML.") |
| apps/zte_manager/services/f6201b_writes.py | 128 | if (root.tag != "ajax_response_xml_root" or |
| apps/zte_manager/services/f6201b_writes.py | 131 | aps = zte._parse_instances(raw).get("OBJ_WLANAP_ID", []) |
| apps/zte_manager/services/f6201b_writes.py | 148 | html = zte.get_view("wlanBasic", Menu3Location=0) |
| apps/zte_manager/services/f6201b_writes.py | 150 | if not isinstance(html, str) or ( |
| apps/zte_manager/services/f6201b_writes.py | 151 | "wlan_wlansssidconf" not in html |
| apps/zte_manager/services/f6201b_writes.py | 152 | and "Btn_apply_WLANSSIDConf" not in html |
| apps/zte_manager/services/f6201b_writes.py | 166 | raise RuntimeError("Resposta Wi-Fi não é XML.") |
| apps/zte_manager/services/f6201b_writes.py | 168 | if root.tag != "ajax_response_xml_root": |
| apps/zte_manager/services/f6201b_writes.py | 173 | aps = zte._parse_instances(raw).get("OBJ_WLANAP_ID", []) |
| apps/zte_manager/services/f6201b_writes.py | 188 | psks = zte._parse_instances(raw).get("OBJ_WLANPSK_ID", []) |
| apps/zte_manager/services/f6201b_writes.py | 259 | psks = zte._parse_instances(raw).get("OBJ_WLANPSK_ID", []) |
| apps/zte_manager/services/f6201b_writes.py | 315 | psks = zte._parse_instances(raw).get("OBJ_WLANPSK_ID", []) |
| apps/zte_manager/services/huawei_eg8145v5_family_runtime.py | 7 | from apps.zte_manager.infrastructure.huawei.js_parser import HuaweiJsConstructorParser |
| apps/zte_manager/services/huawei_eg8145v5_family_runtime.py | 10 | from apps.zte_manager.services.huawei_telemetry import parse_huawei_optical_response |
| apps/zte_manager/services/huawei_eg8145v5_family_runtime.py | 30 | parser_family: str |
| apps/zte_manager/services/huawei_eg8145v5_family_runtime.py | 46 | "/html/ssmp/deviceinfo/deviceinfo.asp", |
| apps/zte_manager/services/huawei_eg8145v5_family_runtime.py | 51 | "/html/bbsp/common/GetLanUserDevInfo.asp", |
| apps/zte_manager/services/huawei_eg8145v5_family_runtime.py | 53 | "/html/bbsp/userdevinfo/userdevinfo.asp", |
| apps/zte_manager/services/huawei_eg8145v5_family_runtime.py | 56 | "/html/bbsp/userdevinfo/getuserdevinfo.asp", |
| apps/zte_manager/services/huawei_eg8145v5_family_runtime.py | 58 | "/html/bbsp/userdevinfo/userdevinfo.asp", |
| apps/zte_manager/services/huawei_eg8145v5_family_runtime.py | 61 | "/html/amp/opticinfo/opticinfo.asp", |
| apps/zte_manager/services/huawei_eg8145v5_family_runtime.py | 71 | parser_family="eg8145v5", |
| apps/zte_manager/services/huawei_eg8145v5_family_runtime.py | 80 | parser_family="hn8010ts", |
| apps/zte_manager/services/huawei_eg8145v5_family_runtime.py | 242 | self.parser = HuaweiJsConstructorParser(_PHASE2_SCHEMAS) |
| apps/zte_manager/services/huawei_eg8145v5_family_runtime.py | 247 | return self.parser.parse( |
| apps/zte_manager/services/huawei_eg8145v5_family_runtime.py | 249 | protocol_family=self.profile.parser_family, |
| apps/zte_manager/services/huawei_eg8145v5_family_runtime.py | 297 | "evidence": "reference_endpoint+runtime_parser", |
| apps/zte_manager/services/huawei_eg8145v5_family_runtime.py | 382 | raise RuntimeError("DeviceInfo Phase-2 sem CPU, memória ou uptime parseável.") |
| apps/zte_manager/services/huawei_eg8145v5_family_runtime.py | 393 | return parse_huawei_optical_response(source, endpoint=endpoint.path).as_dict() |
| apps/zte_manager/services/huawei_eg8145v5_family_runtime.py | 406 | "evidence": "reference_endpoint+runtime_parser", |
| apps/zte_manager/services/f6201b_evidence.py | 157 | # Newly recovered XML objects from second capture. View-only HTML and JSON |
| apps/zte_manager/services/f6201b_evidence.py | 158 | # routes are intentionally excluded from generic XML inspection. |
| apps/zte_manager/services/f6201b_evidence.py | 161 | # return complete well-formed XML before any parsing. |
| apps/zte_manager/services/f6201b_evidence.py | 165 | "dns_hostname_lua.lua": "",  # ALLDNSHOST is not OBJ XML |
| apps/zte_manager/services/f6201b_profile.py | 14 | import xml.etree.ElementTree as ET |
| apps/zte_manager/services/f6201b_profile.py | 69 | if (root.tag != "ajax_response_xml_root" or |
| apps/zte_manager/services/f6201b_profile.py | 72 | parsed = zte._parse_instances(raw) |
| apps/zte_manager/services/f6201b_profile.py | 73 | radios = parsed.get("OBJ_WLANSETTING_ID", []) |
| apps/zte_manager/services/f6201b_profile.py | 85 | # Keep parsed and the per-radio list consistent so channel validation |
| apps/zte_manager/services/f6201b_profile.py | 87 | parsed = dict(parsed) |
| apps/zte_manager/services/f6201b_profile.py | 88 | parsed["OBJ_WLANSETTING_ID"] = normalized |
| apps/zte_manager/services/f6201b_profile.py | 89 | return normalized, parsed |
| apps/zte_manager/services/f6201b_profile.py | 120 | xml = zte_dns.dns_hosts_raw(zte) |
| apps/zte_manager/services/f6201b_profile.py | 121 | if not isinstance(xml, str): |
| apps/zte_manager/services/f6201b_profile.py | 122 | raise RuntimeError("A tabela de nomes DNS não retornou XML.") |
| apps/zte_manager/services/f6201b_profile.py | 124 | root = ET.fromstring(xml) |
| apps/zte_manager/services/f6201b_profile.py | 125 | except ET.ParseError: |
| apps/zte_manager/services/f6201b_profile.py | 127 | if root.tag != "ajax_response_xml_root" or root.find("ALLDNSHOST") is None: |
| apps/zte_manager/services/f6201b_profile.py | 129 | return zte_dns._parse_hosts(xml) |
| apps/zte_manager/services/f6201b_profile.py | 163 | candidates, parsed = _read_radios(zte) |
| apps/zte_manager/services/f6201b_profile.py | 180 | target = _build_target(parsed, before, band, config) |
| apps/zte_manager/services/f6201b_profile.py | 478 | # No raw XML or request bodies are returned. |
| apps/zte_manager/services/huawei_affinity_provider.py | 319 | '<?xml version="1.0" encoding="UTF-8"?><request><Reboot>1</Reboot></request>', |
| apps/zte_manager/services/huawei_affinity_provider.py | 323 | '<?xml version="1.0" encoding="UTF-8"?><request><Restart/></request>', |
| apps/zte_manager/services/huawei_affinity_provider.py | 336 | "Content-Type": "text/xml", |
| apps/zte_manager/services/huawei_affinity_provider.py | 337 | "Referer": client.base_url + "/html/index.html", |
| apps/zte_manager/services/huawei_affinity_provider.py | 357 | and "<html" not in lower |
| apps/zte_manager/services/huawei_affinity_provider.py | 378 | reset_page = "/html/ssmp/reset/reset.asp" |
| apps/zte_manager/services/huawei_affinity_provider.py | 382 | "/html/ssmp/reset/set.cgi?" |
| apps/zte_manager/services/huawei_affinity_provider.py | 384 | "RequestFile=html/ssmp/reset/reset.asp" |
| apps/zte_manager/services/huawei_affinity_provider.py | 418 | page = "/html/ssmp/reboot/reboot.asp" |
| apps/zte_manager/services/huawei_eg8041x7_runtime.py | 11 | HuaweiResponseParser, |
| apps/zte_manager/services/huawei_eg8041x7_runtime.py | 23 | parse_huawei_js_records, |
| apps/zte_manager/services/huawei_eg8041x7_runtime.py | 48 | _WLAN_PSK_PROTECT_PAGE = "/html/amp/wlanadv/wlanpskprotect.asp" |
| apps/zte_manager/services/huawei_eg8041x7_runtime.py | 49 | _SSID_PROC_FLAG_PATH = "/html/amp/common/getSsidProcFlag.asp?&1=1" |
| apps/zte_manager/services/huawei_eg8041x7_runtime.py | 92 | or "<html" in lower |
| apps/zte_manager/services/huawei_eg8041x7_runtime.py | 145 | The generic parser intentionally understands JavaScript constructor calls, |
| apps/zte_manager/services/huawei_eg8041x7_runtime.py | 188 | return parse_huawei_js_records("\n".join(chunks)) |
| apps/zte_manager/services/huawei_eg8041x7_runtime.py | 197 | association_records = parse_huawei_js_records(association_source) |
| apps/zte_manager/services/huawei_eg8041x7_runtime.py | 308 | for item in parse_huawei_js_records(psk_source): |
| apps/zte_manager/services/huawei_eg8041x7_runtime.py | 384 | if str(path).startswith("/html/amp/wlanbasic/set.cgi"): |
| apps/zte_manager/services/huawei_eg8041x7_runtime.py | 401 | parsed = HuaweiResponseParser.parse( |
| apps/zte_manager/services/huawei_eg8041x7_runtime.py | 410 | if verifier is not None and parsed.accepted: |
| apps/zte_manager/services/huawei_eg8041x7_runtime.py | 431 | success = bool(parsed.accepted and verified_by_readback) |
| apps/zte_manager/services/huawei_eg8041x7_runtime.py | 434 | final_verified = bool(parsed.confirmed) |
| apps/zte_manager/services/huawei_eg8041x7_runtime.py | 435 | success = bool(parsed.accepted) |
| apps/zte_manager/services/huawei_eg8041x7_runtime.py | 437 | error_message = parsed.error_message |
| apps/zte_manager/services/huawei_eg8041x7_runtime.py | 438 | error_code = parsed.error_code |
| apps/zte_manager/services/huawei_eg8041x7_runtime.py | 439 | if parsed.accepted and verifier is not None and not verified_by_readback: |
| apps/zte_manager/services/huawei_eg8041x7_runtime.py | 456 | or (parsed.accepted and verifier is not None and not verified_by_readback) |
| apps/zte_manager/services/huawei_eg8041x7_runtime.py | 458 | if not parsed.accepted and not ( |
| apps/zte_manager/services/huawei_eg8041x7_runtime.py | 465 | "accepted": parsed.accepted, |
| apps/zte_manager/services/huawei_eg8041x7_runtime.py | 466 | "confirmed_by_response": bool(parsed.confirmed), |
| apps/zte_manager/services/huawei_eg8041x7_runtime.py | 472 | "response_type": parsed.response_type, |
| apps/zte_manager/services/huawei_eg8041x7_runtime.py | 476 | parsed.data |
| apps/zte_manager/services/huawei_eg8041x7_runtime.py | 477 | if isinstance(parsed.data, (dict, list)) |
| apps/zte_manager/services/model_diagnostic_service.py | 10 | import xml.etree.ElementTree as ET |
| apps/zte_manager/services/model_diagnostic_service.py | 45 | # A captura de RF foi truncada em 30 KB; somente a resposta XML |
| apps/zte_manager/services/model_diagnostic_service.py | 93 | models._shape(raw, root_name)  # valida XML, erro do firmware e raiz esperada |
| apps/zte_manager/services/model_diagnostic_service.py | 124 | # Um HTTP 200 / XML válido sem instâncias não é evidência de que |
| apps/zte_manager/services/model_diagnostic_service.py | 143 | # incompatível e timeout. NUNCA enviar mensagem HTTP/XML da ONT: |
| apps/zte_manager/services/model_diagnostic_service.py | 150 | reason = "unexpected_xml_object" |
| apps/zte_manager/services/model_diagnostic_service.py | 153 | elif kind == "ParseError" or "não é xml" in message: |
| apps/zte_manager/services/model_diagnostic_service.py | 154 | reason = "invalid_xml" |
| apps/zte_manager/services/huawei_service.py | 75 | # Parsed/normalized state for exactly one authenticated Huawei |
| apps/zte_manager/services/huawei_service.py | 76 | # session. Never store raw HTML, cookies, credentials or X_HW_Token. |
| apps/zte_manager/services/huawei_service.py | 697 | """Return identity from the parsed session snapshot.""" |
| apps/zte_manager/services/huawei_service.py | 1194 | # The validated Huawei parser never exposes the PSK. Keep this |
| apps/zte_manager/services/huawei_service.py | 1346 | or "/html/amp/wifische/WlanSchedule.asp" |
| apps/zte_manager/services/huawei_service.py | 1350 | or "/html/amp/wifische/WlanSchedule.asp" |
| apps/zte_manager/services/huawei_service.py | 1354 | or "/html/amp/wifische/WlanSchedule.asp" |
| apps/zte_manager/services/huawei_service.py | 2027 | _DIAGNOSTICS_PAGE = "/html/bbsp/maintenance/diagnosecommon.asp" |
| apps/zte_manager/services/huawei_service.py | 2028 | _PING_RESULT_PATH = "/html/bbsp/maintenance/GetPingResult.asp" |
| apps/zte_manager/services/huawei_service.py | 2029 | _TRACE_RESULT_PATH = "/html/bbsp/maintenance/GetRouteResult.asp" |
| apps/zte_manager/services/huawei_service.py | 2031 | "/html/bbsp/maintenance/complex.cgi?" |
| apps/zte_manager/services/huawei_service.py | 2034 | "RequestFile=html/bbsp/maintenance/diagnosecommon.asp" |
| apps/zte_manager/services/huawei_service.py | 2037 | "/html/bbsp/maintenance/complex.cgi?" |
| apps/zte_manager/services/huawei_service.py | 2040 | "RequestFile=html/bbsp/maintenance/diagnosecommon.asp" |
| apps/zte_manager/services/huawei_service.py | 2045 | def _decode_diagnostic_result(source: object) -> tuple[str, str]: |
| apps/zte_manager/services/huawei_service.py | 2051 | # literal_eval decodes quoted/escaped string literals without eval(). |
| apps/zte_manager/services/huawei_service.py | 2054 | decoded = ast.literal_eval(text) |
| apps/zte_manager/services/huawei_service.py | 2056 | decoded = text |
| apps/zte_manager/services/huawei_service.py | 2057 | if isinstance(decoded, str): |
| apps/zte_manager/services/huawei_service.py | 2058 | text = decoded |
| apps/zte_manager/services/huawei_service.py | 2163 | output, state = self._decode_diagnostic_result(source) |
| apps/zte_manager/services/huawei_service.py | 2183 | def _parse_ping_output( |
| apps/zte_manager/services/huawei_service.py | 2316 | def _parse_traceroute_hops(output: str) -> list[dict]: |
| apps/zte_manager/services/huawei_service.py | 2442 | ping_stats = self._parse_ping_output( |
| apps/zte_manager/services/huawei_service.py | 2554 | "hops": self._parse_traceroute_hops(output), |
| apps/zte_manager/services/huawei_service.py | 2701 | referer=request.get("referer") or "/html/bbsp/upnp/upnp.asp", |
| apps/zte_manager/services/huawei_service.py | 2702 | token_page=request.get("token_page") or "/html/bbsp/upnp/upnp.asp", |
| apps/zte_manager/services/huawei_service.py | 2703 | readback_path=request.get("readback_path") or "/html/bbsp/upnp/upnp.asp", |
| apps/zte_manager/services/huawei_service.py | 3058 | "READ_IMPLEMENTED": "Parser + serviço + API de leitura integrados.", |
| apps/zte_manager/services/remote_access_service.py | 464 | .decode( |
| apps/zte_manager/services/remote_access_service.py | 472 | .decode( |
| apps/zte_manager/services/remote_access_service.py | 600 | ] = self._parse_iperf( |
| apps/zte_manager/services/remote_access_service.py | 648 | baseline_ms = self._parse_ping_average( |
| apps/zte_manager/services/remote_access_service.py | 694 | loaded_ms = self._parse_ping_average( |
| apps/zte_manager/services/remote_access_service.py | 749 | def _parse_ping_average( |
| apps/zte_manager/services/remote_access_service.py | 1172 | def _parse_iperf( |
| apps/zte_manager/services/remote_access_service.py | 1179 | data = json.loads( |
| apps/zte_manager/services/huawei_telemetry.py | 6 | from apps.zte_manager.services.huawei_captured_features import parse_huawei_js_records |
| apps/zte_manager/services/huawei_telemetry.py | 9 | OPTICAL_AMP_PAGE = "/html/amp/opticinfo/opticinfo.asp" |
| apps/zte_manager/services/huawei_telemetry.py | 10 | OPTICAL_STATUS_PAGE = "/html/status/opticinfo.asp" |
| apps/zte_manager/services/huawei_telemetry.py | 41 | def parse_huawei_optical_response( |
| apps/zte_manager/services/huawei_telemetry.py | 46 | """Parse only characterized ``stOpticInfo`` signatures. |
| apps/zte_manager/services/huawei_telemetry.py | 55 | for record in parse_huawei_js_records(source or "") |
| apps/zte_manager/services/huawei_telemetry.py | 127 | raise RuntimeError("Resposta óptica Huawei sem potência TX/RX parseável.") |
| apps/zte_manager/services/huawei_telemetry.py | 142 | return parse_huawei_optical_response(source, endpoint=endpoint) |
| apps/zte_manager/services/huawei_mapped_surface.py | 6 | from urllib.parse import urlsplit |
| apps/zte_manager/services/huawei_mapped_surface.py | 9 | HuaweiResponseParser, |
| apps/zte_manager/services/huawei_mapped_surface.py | 13 | parse_huawei_js_records, |
| apps/zte_manager/services/huawei_mapped_surface.py | 24 | "pages": ["/html/amp/wifische/WlanSchedule.asp"], |
| apps/zte_manager/services/huawei_mapped_surface.py | 29 | "/html/amp/wificovercfg/wifiCover.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 30 | "/html/amp/wificoverinfo/wlancoverinfo.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 31 | "/html/amp/wificoverinfo/apNeighborList.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 32 | "/html/amp/wificoverinfo/apssidStat.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 33 | "/html/amp/wificoverinfo/apssidStation.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 37 | "path": "/html/amp/wificoverinfo/getTopoInfo.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 39 | "referer": "/html/amp/wificoverinfo/wlancoverinfo.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 45 | "pages": ["/html/amp/wlaninfo/easymeshTopo.asp"], |
| apps/zte_manager/services/huawei_mapped_surface.py | 49 | "pages": ["/html/amp/ethinfo/ethinfo.asp"], |
| apps/zte_manager/services/huawei_mapped_surface.py | 53 | "pages": ["/html/amp/ontauth/passwordcommon.asp"], |
| apps/zte_manager/services/huawei_mapped_surface.py | 57 | "pages": ["/html/bbsp/portinfo/portisolate.asp"], |
| apps/zte_manager/services/huawei_mapped_surface.py | 61 | "pages": ["/html/bbsp/ipv6ipincoming/ipv6ipincoming.asp"], |
| apps/zte_manager/services/huawei_mapped_surface.py | 65 | "pages": ["/html/bbsp/ipv6portmapping/ipv6portmapping.asp"], |
| apps/zte_manager/services/huawei_mapped_surface.py | 69 | "pages": ["/html/bbsp/ipv6defaultroute/ipv6defaultroute.asp"], |
| apps/zte_manager/services/huawei_mapped_surface.py | 73 | "pages": ["/html/bbsp/ipv6staticroute/ipv6staticroute.asp"], |
| apps/zte_manager/services/huawei_mapped_surface.py | 77 | "pages": ["/html/bbsp/upnp/upnp.asp"], |
| apps/zte_manager/services/huawei_mapped_surface.py | 81 | "pages": ["/html/bbsp/ddns/ddns.asp"], |
| apps/zte_manager/services/huawei_mapped_surface.py | 86 | "/html/bbsp/route/route.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 87 | "/html/bbsp/routeinfo/routeinfo.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 88 | "/html/bbsp/staticroute/staticroute.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 89 | "/html/bbsp/serviceroute/serviceroute.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 95 | "/html/bbsp/portmapping/portmapping.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 96 | "/html/bbsp/porttrigger/porttrigger.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 102 | "/html/bbsp/macfilter/macfilter.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 103 | "/html/bbsp/wlanmacfilter/wlanmacfilter.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 109 | "/html/bbsp/parentalctrl/parentalctrlmac.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 110 | "/html/bbsp/parentalctrl/parentalctrlstatus.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 115 | "pages": ["/html/bbsp/portacl/newacl.asp"], |
| apps/zte_manager/services/huawei_mapped_surface.py | 119 | "pages": ["/html/bbsp/lanservicecfg/lanservicecfg.asp"], |
| apps/zte_manager/services/huawei_mapped_surface.py | 123 | "pages": ["/html/bbsp/arpping/arpping.asp"], |
| apps/zte_manager/services/huawei_mapped_surface.py | 127 | "pages": ["/html/bbsp/firewalllog/firewalllogview.asp"], |
| apps/zte_manager/services/huawei_mapped_surface.py | 132 | "/html/bbsp/wan/wan.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 133 | "/html/bbsp/wan/wan.cus", |
| apps/zte_manager/services/huawei_mapped_surface.py | 134 | "/html/bbsp/waninfo/waninfo.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 135 | "/html/bbsp/common/wan_list.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 136 | "/html/bbsp/common/wan_list_info.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 137 | "/html/bbsp/common/wan_list_cache_wan.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 138 | "/html/bbsp/common/wan_list_cache_wanipv6.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 139 | "/html/bbsp/common/getWanDynamicData.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 140 | "/html/bbsp/common/get_wan_list_ipdslite.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 141 | "/html/bbsp/common/get_wan_list_ipversion.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 142 | "/html/bbsp/common/get_wan_list_ipwanstat.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 143 | "/html/bbsp/common/get_wan_list_ispwlan.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 144 | "/html/bbsp/common/get_wan_list_policyroute.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 145 | "/html/bbsp/common/get_wan_list_pppdslite.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 146 | "/html/bbsp/common/get_wan_list_pppwanstat.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 147 | "/html/bbsp/common/get_wan_list_radiowanpara.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 148 | "/html/bbsp/common/get_wan_list_radiowanps.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 149 | "/html/bbsp/common/get_wan_list_v6iptunnel.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 150 | "/html/bbsp/common/get_wan_list_v6ppptunnel.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 151 | "/html/bbsp/common/get_wan_list_wanaccesstype.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 152 | "/html/bbsp/common/get_wan_list_wlaninfo.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 153 | "/html/bbsp/common/wanStateMonitor.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 154 | "/html/bbsp/common/wan_check.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 155 | "/html/bbsp/common/wan_control.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 156 | "/html/bbsp/common/wan_pageparse.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 157 | "/html/bbsp/common/wan_settings.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 158 | "/html/bbsp/common/wanaddressacquire.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 159 | "/html/bbsp/common/wandns.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 160 | "/html/bbsp/common/wanipv6state.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 164 | "path": "/html/bbsp/common/getwanlist.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 166 | "referer": "/html/bbsp/wan/wan.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 167 | "token_page": "/html/bbsp/wan/wan.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 170 | "path": "/html/bbsp/common/get_wan_list_time.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 172 | "referer": "/html/bbsp/wan/wan.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 175 | "path": "/html/bbsp/common/wanStateMonitor.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 177 | "referer": "/html/bbsp/wan/wan.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 180 | "path": "/html/bbsp/common/wan_list_cache_wan.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 182 | "referer": "/html/bbsp/wan/wan.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 190 | "/html/bbsp/common/lanuserinfo.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 191 | "/html/bbsp/common/dhcpinfo.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 192 | "/html/bbsp/userdevinfo/userdevinfo1.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 193 | "/html/bbsp/userdevinfo/userdetdevinfo.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 197 | "path": "/html/bbsp/common/GetLanUserDevInfo.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 199 | "referer": "/html/bbsp/userdevinfo/userdevinfo1.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 202 | "path": "/html/bbsp/common/GetLanUserDhcpInfo.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 204 | "referer": "/html/bbsp/userdevinfo/userdevinfo1.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 207 | "path": "/html/bbsp/userdevinfo/getuserdevinfo.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 209 | "referer": "/html/bbsp/userdevinfo/userdevinfo1.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 215 | "pages": ["/html/bbsp/vlanctc/vlanctc.asp"], |
| apps/zte_manager/services/huawei_mapped_surface.py | 220 | "/html/bbsp/qossmart/qossmart.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 221 | "/html/bbsp/qossmartstatistics/qossmartstatistics.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 222 | "/html/bbsp/qossmartstatistics/qossmartstatistics.cus", |
| apps/zte_manager/services/huawei_mapped_surface.py | 223 | "/html/bbsp/qossmartstatistics/GetQosStatisticsResult.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 227 | "path": "/html/bbsp/qossmartstatistics/GetQosStatisticsResult.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 229 | "referer": "/html/bbsp/qossmartstatistics/qossmartstatistics.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 235 | "pages": ["/html/bbsp/dscptopbit/dscptopbit.asp"], |
| apps/zte_manager/services/huawei_mapped_surface.py | 239 | "pages": ["/html/bbsp/remotepktmirror/remotepktmirror.asp"], |
| apps/zte_manager/services/huawei_mapped_surface.py | 243 | "/html/bbsp/remotepktmirror/getchunkedcapt.cgi?" |
| apps/zte_manager/services/huawei_mapped_surface.py | 244 | "RequestFile=html/bbsp/remotepktmirror/remotepktmirror.asp" |
| apps/zte_manager/services/huawei_mapped_surface.py | 247 | "referer": "/html/bbsp/remotepktmirror/remotepktmirror.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 248 | "token_page": "/html/bbsp/remotepktmirror/remotepktmirror.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 254 | "pages": ["/html/ssmp/sntp/sntp.asp"], |
| apps/zte_manager/services/huawei_mapped_surface.py | 258 | "pages": ["/html/ssmp/reboot/reboot.asp"], |
| apps/zte_manager/services/huawei_mapped_surface.py | 262 | "pages": ["/html/ssmp/fireware/firmware.asp"], |
| apps/zte_manager/services/huawei_mapped_surface.py | 266 | "pages": ["/html/ssmp/cfgfile/cfgfile.asp"], |
| apps/zte_manager/services/huawei_mapped_surface.py | 270 | "pages": ["/html/ssmp/securitycheck/securitycheck.asp"], |
| apps/zte_manager/services/huawei_mapped_surface.py | 273 | "path": "/html/ssmp/securitycheck/getSecCheckStatus.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 275 | "referer": "/html/ssmp/securitycheck/securitycheck.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 281 | "pages": ["/html/ssmp/ledcfg/ledcfg.asp"], |
| apps/zte_manager/services/huawei_mapped_surface.py | 285 | "pages": ["/html/ssmp/collect/collectInfo.asp"], |
| apps/zte_manager/services/huawei_mapped_surface.py | 288 | "path": "/html/ssmp/common/getCollectStatus.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 290 | "referer": "/html/ssmp/collect/collectInfo.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 297 | "/html/ssmp/testspeed/testspeed.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 298 | "/html/ssmp/Sectionspeed/Sectionspeed.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 299 | "/html/ssmp/Sectionspeed/clientspeedResult.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 303 | "path": "/html/ssmp/Sectionspeed/clientspeedResult.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 305 | "referer": "/html/ssmp/Sectionspeed/Sectionspeed.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 312 | "/html/bbsp/maintenance/diagnosecommon.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 313 | "/html/ssmp/maintain/smartdiagnose.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 314 | "/html/ssmp/maintain/multicast.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 318 | "path": "/html/bbsp/maintenance/GetPingDnsResult.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 320 | "referer": "/html/bbsp/maintenance/diagnosecommon.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 323 | "path": "/html/bbsp/maintenance/GetPingResult.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 325 | "referer": "/html/bbsp/maintenance/diagnosecommon.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 328 | "path": "/html/bbsp/maintenance/GetRouteResult.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 330 | "referer": "/html/bbsp/maintenance/diagnosecommon.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 333 | "path": "/html/bbsp/maintenance/getEquipTestResultsmart.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 335 | "referer": "/html/ssmp/maintain/smartdiagnose.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 338 | "path": "/html/amp/common/getSmartDiagnoseResult.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 340 | "referer": "/html/ssmp/maintain/smartdiagnose.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 341 | "token_page": "/html/ssmp/maintain/smartdiagnose.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 344 | "path": "/html/bbsp/common/EquipTestResultsmart.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 346 | "referer": "/html/ssmp/maintain/smartdiagnose.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 352 | "pages": ["/html/ssmp/mainupportcfg/mainupportconfig.asp"], |
| apps/zte_manager/services/huawei_mapped_surface.py | 355 | "path": "/html/ssmp/mainupportcfg/getForbidLanFlag.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 357 | "referer": "/html/ssmp/mainupportcfg/mainupportconfig.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 363 | "pages": ["/html/ssmp/softnotice/opensfnotice.asp"], |
| apps/zte_manager/services/huawei_mapped_surface.py | 367 | "pages": ["/html/ssmp/accoutcfg/accountadmin.asp"], |
| apps/zte_manager/services/huawei_mapped_surface.py | 372 | "/html/ssmp/aplog/aplog.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 373 | "/html/ssmp/aplog/aplogview.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 374 | "/html/ssmp/debuglog/debuglog.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 375 | "/html/ssmp/debuglog/debuglogview.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 376 | "/html/ssmp/instrusionlog/instrusionlog.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 377 | "/html/ssmp/userlog/userlog.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 378 | "/html/ssmp/userlog/logview.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 383 | "pages": ["/html/ssmp/mirrorportcfg/mirrorportconfig.asp"], |
| apps/zte_manager/services/huawei_mapped_surface.py | 387 | "/html/ssmp/mirrorportcfg/getmirrorport.cgi?" |
| apps/zte_manager/services/huawei_mapped_surface.py | 388 | "&RequestFile=/html/ssmp/mirrorportcfg/mirrorportconfig.asp" |
| apps/zte_manager/services/huawei_mapped_surface.py | 392 | "referer": "/html/ssmp/mirrorportcfg/mirrorportconfig.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 398 | "pages": ["/html/voip/voipinterface/voipinterface.asp"], |
| apps/zte_manager/services/huawei_mapped_surface.py | 401 | "path": "/html/voip/voipinterface/voiceprofileinfoSIP.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 403 | "referer": "/html/voip/voipinterface/voipinterface.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 406 | "path": "/html/voip/voipinterface/voiceprofileinfoH248.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 408 | "referer": "/html/voip/voipinterface/voipinterface.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 422 | "/html/bbsp/portinfo/set.cgi?" |
| apps/zte_manager/services/huawei_mapped_surface.py | 423 | "&RequestFile=html/bbsp/portinfo/portisolate.asp" |
| apps/zte_manager/services/huawei_mapped_surface.py | 425 | "referer": "/html/bbsp/portinfo/portisolate.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 426 | "token_page": "/html/bbsp/portinfo/portisolate.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 431 | "/html/bbsp/dscptopbit/setajax.cgi?" |
| apps/zte_manager/services/huawei_mapped_surface.py | 434 | "RequestFile=html/bbsp/dscptopbit/dscptopbit.asp" |
| apps/zte_manager/services/huawei_mapped_surface.py | 436 | "referer": "/html/bbsp/dscptopbit/dscptopbit.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 437 | "token_page": "/html/bbsp/dscptopbit/dscptopbit.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 442 | "/html/ssmp/sntp/set.cgi?" |
| apps/zte_manager/services/huawei_mapped_surface.py | 444 | "RequestFile=html/ssmp/sntp/sntp.asp" |
| apps/zte_manager/services/huawei_mapped_surface.py | 446 | "referer": "/html/ssmp/sntp/sntp.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 447 | "token_page": "/html/ssmp/sntp/sntp.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 452 | "/html/ssmp/sntp/set.cgi?" |
| apps/zte_manager/services/huawei_mapped_surface.py | 454 | "RequestFile=html/ssmp/sntp/sntp.asp" |
| apps/zte_manager/services/huawei_mapped_surface.py | 456 | "referer": "/html/ssmp/sntp/sntp.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 457 | "token_page": "/html/ssmp/sntp/sntp.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 462 | "/html/bbsp/upnp/set.cgi?" |
| apps/zte_manager/services/huawei_mapped_surface.py | 465 | "RequestFile=html/bbsp/upnp/upnp.asp" |
| apps/zte_manager/services/huawei_mapped_surface.py | 467 | "referer": "/html/bbsp/upnp/upnp.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 468 | "token_page": "/html/bbsp/upnp/upnp.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 473 | "/html/bbsp/wlanmacfilter/set.cgi?" |
| apps/zte_manager/services/huawei_mapped_surface.py | 475 | "RequestFile=html/bbsp/wlanmacfilter/wlanmacfilter.asp" |
| apps/zte_manager/services/huawei_mapped_surface.py | 477 | "referer": "/html/bbsp/wlanmacfilter/wlanmacfilter.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 478 | "token_page": "/html/bbsp/wlanmacfilter/wlanmacfilter.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 483 | "/html/bbsp/lanservicecfg/set.cgi?" |
| apps/zte_manager/services/huawei_mapped_surface.py | 485 | "RequestFile=html/bbsp/lanservicecfg/lanportcfg.asp" |
| apps/zte_manager/services/huawei_mapped_surface.py | 487 | "referer": "/html/bbsp/lanservicecfg/lanportcfg.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 488 | "token_page": "/html/bbsp/lanservicecfg/lanportcfg.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 493 | "/html/bbsp/parentalctrl/del.cgi?" |
| apps/zte_manager/services/huawei_mapped_surface.py | 494 | "RequestFile=html/bbsp/parentalctrl/parentalctrlmac.asp" |
| apps/zte_manager/services/huawei_mapped_surface.py | 496 | "referer": "/html/bbsp/parentalctrl/parentalctrlmac.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 497 | "token_page": "/html/bbsp/parentalctrl/parentalctrlmac.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 502 | "/html/ssmp/Sectionspeed/setajax.cgi?" |
| apps/zte_manager/services/huawei_mapped_surface.py | 505 | "RequestFile=html/ssmp/Sectionspeed/clientspeedResult.asp" |
| apps/zte_manager/services/huawei_mapped_surface.py | 507 | "referer": "/html/ssmp/Sectionspeed/Sectionspeed.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 508 | "token_page": "/html/ssmp/Sectionspeed/Sectionspeed.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 517 | "/html/ssmp/Sectionspeed/setselspeedmode.cgi?" |
| apps/zte_manager/services/huawei_mapped_surface.py | 518 | "&RequestFile=html/ssmp/Sectionspeed/clientspeedResult.asp" |
| apps/zte_manager/services/huawei_mapped_surface.py | 520 | "referer": "/html/ssmp/Sectionspeed/Sectionspeed.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 521 | "token_page": "/html/ssmp/Sectionspeed/Sectionspeed.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 526 | "/html/ssmp/maintain/HWDiagnoseOpt.cgi?" |
| apps/zte_manager/services/huawei_mapped_surface.py | 527 | "&RequestFile=/html/ssmp/maintain/smartdiagnose.asp" |
| apps/zte_manager/services/huawei_mapped_surface.py | 529 | "referer": "/html/ssmp/maintain/smartdiagnose.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 530 | "token_page": "/html/ssmp/maintain/smartdiagnose.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 535 | "/html/ssmp/maintain/complexajax.cgi?" |
| apps/zte_manager/services/huawei_mapped_surface.py | 538 | "RequestFile=/html/ssmp/maintain/smartdiagnose.asp" |
| apps/zte_manager/services/huawei_mapped_surface.py | 540 | "referer": "/html/ssmp/maintain/smartdiagnose.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 541 | "token_page": "/html/ssmp/maintain/smartdiagnose.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 545 | "path": "/html/ssmp/maintain/complex.cgi?RUNSTATE_FLAG=EquipTest", |
| apps/zte_manager/services/huawei_mapped_surface.py | 546 | "referer": "/html/ssmp/maintain/smartdiagnose.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 547 | "token_page": "/html/ssmp/maintain/smartdiagnose.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 552 | "/html/bbsp/userdevinfo/setajax.cgi?" |
| apps/zte_manager/services/huawei_mapped_surface.py | 556 | "referer": "/html/bbsp/userdevinfo/userdevinfo1.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 557 | "token_page": "/html/bbsp/userdevinfo/userdevinfo1.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 562 | "/html/bbsp/wan/complex.cgi?" |
| apps/zte_manager/services/huawei_mapped_surface.py | 569 | "RequestFile=html/bbsp/wan/confirmwancfginfo.html" |
| apps/zte_manager/services/huawei_mapped_surface.py | 571 | "referer": "/html/bbsp/wan/wan.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 572 | "token_page": "/html/bbsp/wan/wan.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 909 | for parsed in parse_huawei_js_records(source): |
| apps/zte_manager/services/huawei_mapped_surface.py | 912 | # internal parser detail and are not useful to the operator. |
| apps/zte_manager/services/huawei_mapped_surface.py | 915 | for key, value in parsed.items() |
| apps/zte_manager/services/huawei_mapped_surface.py | 1046 | parsed = HuaweiResponseParser.parse( |
| apps/zte_manager/services/huawei_mapped_surface.py | 1053 | parsed.accepted |
| apps/zte_manager/services/huawei_mapped_surface.py | 1056 | "accepted": parsed.accepted, |
| apps/zte_manager/services/huawei_mapped_surface.py | 1059 | "response_type": parsed.response_type, |
| apps/zte_manager/services/huawei_mapped_surface.py | 1060 | "error_code": parsed.error_code, |
| apps/zte_manager/services/huawei_mapped_surface.py | 1061 | "error_message": parsed.error_message, |
| apps/zte_manager/services/huawei_mapped_surface.py | 1064 | "verified": parsed.confirmed, |
| apps/zte_manager/services/huawei_mapped_surface.py | 1071 | if parsed.data is not None: |
| apps/zte_manager/services/huawei_mapped_surface.py | 1072 | result["response_data"] = _safe_value(parsed.data) |
| apps/zte_manager/services/huawei_mapped_surface.py | 1074 | if readback_path and parsed.accepted: |
| apps/zte_manager/services/huawei_mapped_surface.py | 1092 | elif parsed.confirmed: |
| apps/zte_manager/services/huawei_mapped_surface.py | 1099 | if not parsed.accepted: |
| apps/zte_manager/services/support_diagnostic_service.py | 1047 | parsed = _number( |
| apps/zte_manager/services/support_diagnostic_service.py | 1051 | if parsed is not None: |
| apps/zte_manager/services/support_diagnostic_service.py | 1053 | parsed |
| apps/zte_manager/services/support_diagnostic_service.py | 1350 | parsed = set() |
| apps/zte_manager/services/support_diagnostic_service.py | 1377 | parsed.add(channel) |
| apps/zte_manager/services/support_diagnostic_service.py | 1378 | return sorted(parsed) |
| apps/zte_manager/services/tr069_profile_service.py | 14 | from urllib.parse import urlsplit |
| apps/zte_manager/services/tr069_profile_service.py | 74 | payload = json.loads(self.path.read_text(encoding="utf-8")) |
| apps/zte_manager/services/huawei_captured_features.py | 3 | import html as html_module |
| apps/zte_manager/services/huawei_captured_features.py | 12 | HuaweiResponseParser, |
| apps/zte_manager/services/huawei_captured_features.py | 14 | decode_huawei_js_string, |
| apps/zte_manager/services/huawei_captured_features.py | 18 | DHCP_PAGE = "/html/bbsp/dhcp/dhcp.asp" |
| apps/zte_manager/services/huawei_captured_features.py | 19 | DHCP_SERVER_PAGE = "/html/bbsp/dhcpservercfg/dhcp2.asp" |
| apps/zte_manager/services/huawei_captured_features.py | 20 | DHCP_STATIC_PAGE = "/html/bbsp/dhcpstatic/dhcpstatic.asp" |
| apps/zte_manager/services/huawei_captured_features.py | 21 | DHCP_INFO_PAGE = "/html/bbsp/common/dhcpinfo.asp" |
| apps/zte_manager/services/huawei_captured_features.py | 22 | LAYER3_PAGE = "/html/bbsp/layer3/layer3.asp" |
| apps/zte_manager/services/huawei_captured_features.py | 23 | LAN_ADDRESS_PAGE = "/html/bbsp/lanaddress/lanaddress.asp" |
| apps/zte_manager/services/huawei_captured_features.py | 25 | DNS_PAGE = "/html/bbsp/dnsconfiguration/dnsconfigcommon.asp" |
| apps/zte_manager/services/huawei_captured_features.py | 26 | DNS_HOSTS_PAGE = "/html/bbsp/common/dnshostslist.asp" |
| apps/zte_manager/services/huawei_captured_features.py | 28 | DMZ_PAGE = "/html/bbsp/dmz/dmz.asp" |
| apps/zte_manager/services/huawei_captured_features.py | 29 | FIREWALL_PAGE = "/html/bbsp/firewalllevel/firewalllevel.asp" |
| apps/zte_manager/services/huawei_captured_features.py | 30 | DOS_PAGE = "/html/bbsp/Dos/Dos.asp" |
| apps/zte_manager/services/huawei_captured_features.py | 31 | IPV6_FIREWALL_PAGE = "/html/bbsp/ipv6firewall/firewall.asp" |
| apps/zte_manager/services/huawei_captured_features.py | 32 | INTERNET_CONTROL_PAGE = "/html/bbsp/internetcontrol/internetcontrol.asp" |
| apps/zte_manager/services/huawei_captured_features.py | 33 | ALG_PAGE = "/html/bbsp/alg/alg.asp" |
| apps/zte_manager/services/huawei_captured_features.py | 34 | IGMP_PAGE = "/html/bbsp/igmp/igmp.asp" |
| apps/zte_manager/services/huawei_captured_features.py | 36 | TR069_PAGE = "/html/ssmp/tr069/tr069.asp" |
| apps/zte_manager/services/huawei_captured_features.py | 37 | DEVICE_INFO_PAGE = "/html/ssmp/deviceinfo/deviceinfo.asp" |
| apps/zte_manager/services/huawei_captured_features.py | 38 | DEVICE_INFO_CUS_PAGE = "/html/ssmp/deviceinfo/deviceinfo.cus" |
| apps/zte_manager/services/huawei_captured_features.py | 39 | OPTICAL_PAGE = "/html/amp/opticinfo/opticinfo.asp" |
| apps/zte_manager/services/huawei_captured_features.py | 40 | ETH_INFO_PAGE = "/html/amp/ethinfo/ethinfo.asp" |
| apps/zte_manager/services/huawei_captured_features.py | 42 | WAN_INFO_PAGE = "/html/bbsp/common/wan_list_info.asp" |
| apps/zte_manager/services/huawei_captured_features.py | 43 | WAN_CACHE_PAGE = "/html/bbsp/common/wan_list_cache_wan.asp" |
| apps/zte_manager/services/huawei_captured_features.py | 45 | LAN_USER_INFO_PAGE = "/html/bbsp/common/lanuserinfo.asp" |
| apps/zte_manager/services/huawei_captured_features.py | 46 | LAN_USER_DEV_PAGE = "/html/bbsp/common/GetLanUserDevInfo.asp" |
| apps/zte_manager/services/huawei_captured_features.py | 47 | LAN_USER_DHCP_PAGE = "/html/bbsp/common/GetLanUserDhcpInfo.asp" |
| apps/zte_manager/services/huawei_captured_features.py | 48 | USER_DEVICE_PAGE = "/html/bbsp/userdevinfo/userdevinfo1.asp" |
| apps/zte_manager/services/huawei_captured_features.py | 50 | WLAN_BASIC_PAGE = "/html/amp/wlanbasic/WlanBasic.asp" |
| apps/zte_manager/services/huawei_captured_features.py | 51 | WLAN_ADV_PAGE = "/html/amp/wlanadv/WlanAdvance.asp" |
| apps/zte_manager/services/huawei_captured_features.py | 52 | WLAN_LIST_PAGE = "/html/amp/common/wlan_list.asp" |
| apps/zte_manager/services/huawei_captured_features.py | 53 | WLAN_INFO_PAGE = "/html/amp/wlaninfo/wlaninfo.asp" |
| apps/zte_manager/services/huawei_captured_features.py | 54 | WLAN_ASSOC_PAGE = "/html/amp/wlaninfo/getassociateddeviceinfo.asp" |
| apps/zte_manager/services/huawei_captured_features.py | 55 | WLAN_STA_BOOST_PAGE = "/html/amp/wlaninfo/getassociatedstaboost.asp" |
| apps/zte_manager/services/huawei_captured_features.py | 56 | WLAN_ADV_COMMON_PAGE = "/html/amp/wlanadv/wlanadvance_com_api.asp" |
| apps/zte_manager/services/huawei_captured_features.py | 57 | WLAN_ADV_API_PAGE = "/html/amp/wlanadv/wlanadvance_api.asp" |
| apps/zte_manager/services/huawei_captured_features.py | 58 | WLAN_CHANNEL_PAGE = "/html/amp/common/WlanChannel.asp?1=1" |
| apps/zte_manager/services/huawei_captured_features.py | 143 | return decode_huawei_js_string(value[1:-1]) |
| apps/zte_manager/services/huawei_captured_features.py | 161 | return decode_huawei_js_string(value) |
| apps/zte_manager/services/huawei_captured_features.py | 164 | def _constructor_definitions(html: str) -> dict[str, tuple[list[str], dict[str, str]]]: |
| apps/zte_manager/services/huawei_captured_features.py | 167 | for match in pattern.finditer(html or ""): |
| apps/zte_manager/services/huawei_captured_features.py | 169 | close_paren = _matching_delimiter(html, open_paren, "(", ")") |
| apps/zte_manager/services/huawei_captured_features.py | 172 | body_start = html.find("{", close_paren) |
| apps/zte_manager/services/huawei_captured_features.py | 175 | body_end = _matching_delimiter(html, body_start, "{", "}") |
| apps/zte_manager/services/huawei_captured_features.py | 180 | for item in html[open_paren + 1:close_paren].split(",") |
| apps/zte_manager/services/huawei_captured_features.py | 183 | body = html[body_start + 1:body_end] |
| apps/zte_manager/services/huawei_captured_features.py | 199 | def parse_huawei_js_records(html: str) -> list[dict[str, Any]]: |
| apps/zte_manager/services/huawei_captured_features.py | 200 | """Parse Huawei's generated JS constructor records without model-specific positions.""" |
| apps/zte_manager/services/huawei_captured_features.py | 201 | definitions = _constructor_definitions(html or "") |
| apps/zte_manager/services/huawei_captured_features.py | 204 | for match in pattern.finditer(html or ""): |
| apps/zte_manager/services/huawei_captured_features.py | 207 | close_paren = _matching_delimiter(html, open_paren, "(", ")") |
| apps/zte_manager/services/huawei_captured_features.py | 212 | for item in _split_js_arguments(html[open_paren + 1:close_paren]) |
| apps/zte_manager/services/huawei_captured_features.py | 252 | """Best-effort scalar extraction for Huawei pages that use plain JS/HTML. |
| apps/zte_manager/services/huawei_captured_features.py | 254 | Constructor records stay the primary parser. This only covers simple |
| apps/zte_manager/services/huawei_captured_features.py | 270 | return decode_huawei_js_string(match.group(1)) |
| apps/zte_manager/services/huawei_captured_features.py | 290 | value = html_module.unescape(value).strip() |
| apps/zte_manager/services/huawei_captured_features.py | 292 | return decode_huawei_js_string(value) |
| apps/zte_manager/services/huawei_captured_features.py | 405 | html = "\n".join(chunks) |
| apps/zte_manager/services/huawei_captured_features.py | 406 | return html, parse_huawei_js_records(html) |
| apps/zte_manager/services/huawei_captured_features.py | 430 | parsed = HuaweiResponseParser.parse( |
| apps/zte_manager/services/huawei_captured_features.py | 438 | f"type={parsed.response_type!r} " |
| apps/zte_manager/services/huawei_captured_features.py | 439 | f"accepted={parsed.accepted!r} " |
| apps/zte_manager/services/huawei_captured_features.py | 440 | f"confirmed={parsed.confirmed!r} " |
| apps/zte_manager/services/huawei_captured_features.py | 441 | f"error_code={parsed.error_code!r} " |
| apps/zte_manager/services/huawei_captured_features.py | 447 | if verifier is not None and parsed.accepted: |
| apps/zte_manager/services/huawei_captured_features.py | 480 | f"was not accepted; parser_type={parsed.response_type!r}" |
| apps/zte_manager/services/huawei_captured_features.py | 486 | else bool(parsed.accepted) |
| apps/zte_manager/services/huawei_captured_features.py | 493 | or (parsed.accepted and verifier is not None) |
| apps/zte_manager/services/huawei_captured_features.py | 499 | f"accepted={parsed.accepted!r} verified={bool(verified)!r} " |
| apps/zte_manager/services/huawei_captured_features.py | 504 | "accepted": parsed.accepted, |
| apps/zte_manager/services/huawei_captured_features.py | 506 | verifier is None and parsed.confirmed |
| apps/zte_manager/services/huawei_captured_features.py | 510 | "response_type": parsed.response_type, |
| apps/zte_manager/services/huawei_captured_features.py | 511 | "error_code": parsed.error_code, |
| apps/zte_manager/services/huawei_captured_features.py | 512 | "error_message": parsed.error_message, |
| apps/zte_manager/services/huawei_captured_features.py | 514 | parsed.data |
| apps/zte_manager/services/huawei_captured_features.py | 515 | if isinstance(parsed.data, (dict, list)) |
| apps/zte_manager/services/huawei_captured_features.py | 518 | # Verifiers return normalized/parsed state only. Keeping the |
| apps/zte_manager/services/huawei_captured_features.py | 528 | html, records = self._records( |
| apps/zte_manager/services/huawei_captured_features.py | 542 | html, |
| apps/zte_manager/services/huawei_captured_features.py | 549 | html, |
| apps/zte_manager/services/huawei_captured_features.py | 604 | html, records = self._records(OPTICAL_PAGE) |
| apps/zte_manager/services/huawei_captured_features.py | 615 | html, |
| apps/zte_manager/services/huawei_captured_features.py | 658 | _html, records = self._records( |
| apps/zte_manager/services/huawei_captured_features.py | 810 | return parse_huawei_js_records("\n".join(chunks)) |
| apps/zte_manager/services/huawei_captured_features.py | 912 | association_records = parse_huawei_js_records( |
| apps/zte_manager/services/huawei_captured_features.py | 1022 | _html, records = self._records( |
| apps/zte_manager/services/huawei_captured_features.py | 1100 | _html, records = self._records(LAYER3_PAGE) |
| apps/zte_manager/services/huawei_captured_features.py | 1159 | "/html/bbsp/layer3/set.cgi?" |
| apps/zte_manager/services/huawei_captured_features.py | 1161 | + "&RequestFile=html/bbsp/layer3/layer3.asp" |
| apps/zte_manager/services/huawei_captured_features.py | 1184 | _html, records = self._records(DHCP_PAGE) |
| apps/zte_manager/services/huawei_captured_features.py | 1260 | "/html/bbsp/dhcp/set.cgi" |
| apps/zte_manager/services/huawei_captured_features.py | 1265 | "&RequestFile=html/bbsp/dhcp/dhcp.asp" |
| apps/zte_manager/services/huawei_captured_features.py | 1302 | _html, records = self._records(LAN_ADDRESS_PAGE) |
| apps/zte_manager/services/huawei_captured_features.py | 1349 | "/html/bbsp/lanaddress/set.cgi" |
| apps/zte_manager/services/huawei_captured_features.py | 1362 | "&RequestFile=html/bbsp/lanaddress/lanaddress.asp" |
| apps/zte_manager/services/huawei_captured_features.py | 1407 | html, records = self._records( |
| apps/zte_manager/services/huawei_captured_features.py | 1524 | html, records = self._records(DHCP_SERVER_PAGE) |
| apps/zte_manager/services/huawei_captured_features.py | 1572 | "/html/bbsp/dhcpservercfg/set.cgi" |
| apps/zte_manager/services/huawei_captured_features.py | 1576 | "&RequestFile=html/bbsp/dhcpservercfg/dhcp2.asp" |
| apps/zte_manager/services/huawei_captured_features.py | 1621 | "/html/bbsp/dhcpstatic/add.cgi" |
| apps/zte_manager/services/huawei_captured_features.py | 1623 | "&RequestFile=html/bbsp/dhcpstatic/dhcpstatic.asp" |
| apps/zte_manager/services/huawei_captured_features.py | 1670 | "/html/bbsp/dhcpstatic/set.cgi" |
| apps/zte_manager/services/huawei_captured_features.py | 1672 | "&RequestFile=html/bbsp/dhcpstatic/dhcpstatic.asp" |
| apps/zte_manager/services/huawei_captured_features.py | 1717 | "/html/bbsp/dhcpstatic/del.cgi" |
| apps/zte_manager/services/huawei_captured_features.py | 1719 | "&RequestFile=html/bbsp/dhcpstatic/dhcpstatic.asp" |
| apps/zte_manager/services/huawei_captured_features.py | 1740 | _html, records = self._records(DNS_PAGE, DNS_HOSTS_PAGE) |
| apps/zte_manager/services/huawei_captured_features.py | 1816 | "/html/bbsp/dnsconfiguration/set.cgi" |
| apps/zte_manager/services/huawei_captured_features.py | 1818 | "&RequestFile=html/bbsp/dnsconfiguration/dnsconfigcommon.asp" |
| apps/zte_manager/services/huawei_captured_features.py | 1823 | "/html/bbsp/dnsconfiguration/add.cgi" |
| apps/zte_manager/services/huawei_captured_features.py | 1825 | "&RequestFile=html/bbsp/dnsconfiguration/dnsconfigcommon.asp" |
| apps/zte_manager/services/huawei_captured_features.py | 1877 | "/html/bbsp/dnsconfiguration/add.cgi" |
| apps/zte_manager/services/huawei_captured_features.py | 1879 | "&RequestFile=html/bbsp/dnsconfiguration/dnsconfigcommon.asp" |
| apps/zte_manager/services/huawei_captured_features.py | 1921 | "/html/bbsp/dnsconfiguration/set.cgi" |
| apps/zte_manager/services/huawei_captured_features.py | 1923 | "&RequestFile=html/bbsp/dnsconfiguration/dnsconfigcommon.asp" |
| apps/zte_manager/services/huawei_captured_features.py | 1964 | "/html/bbsp/dnsconfiguration/del.cgi" |
| apps/zte_manager/services/huawei_captured_features.py | 1966 | "&RequestFile=html/bbsp/dnsconfiguration/dnsconfigcommon.asp" |
| apps/zte_manager/services/huawei_captured_features.py | 2260 | _html, records = self._records(DMZ_PAGE) |
| apps/zte_manager/services/huawei_captured_features.py | 2283 | "/html/bbsp/dmz/set.cgi" |
| apps/zte_manager/services/huawei_captured_features.py | 2285 | "&RequestFile=html/bbsp/dmz/dmz.asp" |
| apps/zte_manager/services/huawei_captured_features.py | 2321 | _html, records = self._records( |
| apps/zte_manager/services/huawei_captured_features.py | 2466 | "/html/amp/wlanbasic/set.cgi" |
| apps/zte_manager/services/huawei_captured_features.py | 2468 | "&RequestFile=html/amp/wlanbasic/WlanBasic.asp" |
| apps/zte_manager/services/huawei_captured_features.py | 2744 | _html, records = self._records( |
| apps/zte_manager/services/huawei_captured_features.py | 3085 | query += f"&c2={c}&RequestFile=html/amp/wlanadv/WlanAdvance.asp" |
| apps/zte_manager/services/huawei_captured_features.py | 3086 | path = "/html/amp/wlanadv/set.cgi" + query |
| apps/zte_manager/services/huawei_captured_features.py | 3183 | _html, records = self._records(TR069_PAGE) |
| apps/zte_manager/services/huawei_captured_features.py | 3253 | "/html/ssmp/tr069/set.cgi" |
| apps/zte_manager/services/huawei_captured_features.py | 3255 | "&RequestFile=html/ssmp/tr069/tr069.asp" |
| apps/zte_manager/services/huawei_captured_features.py | 3281 | _html, records = self._records(FIREWALL_PAGE) |
| apps/zte_manager/services/huawei_captured_features.py | 3322 | _html, records = self._records(ALG_PAGE) |
| apps/zte_manager/services/huawei_captured_features.py | 3370 | "/html/bbsp/alg/set.cgi" |
| apps/zte_manager/services/huawei_captured_features.py | 3372 | "&RequestFile=html/bbsp/alg/alg.asp" |
| apps/zte_manager/services/huawei_captured_features.py | 3393 | _html, records = self._records(IGMP_PAGE) |
| apps/zte_manager/services/huawei_captured_features.py | 3410 | "/html/bbsp/igmp/set.cgi" |
| apps/zte_manager/services/huawei_captured_features.py | 3412 | "&RequestFile=html/bbsp/igmp/igmp.asp" |
| apps/zte_manager/services/huawei_captured_features.py | 3427 | _html, records = self._records(DOS_PAGE) |
| apps/zte_manager/services/huawei_captured_features.py | 3455 | "/html/bbsp/Dos/set.cgi" |
| apps/zte_manager/services/huawei_captured_features.py | 3457 | "&RequestFile=html/bbsp/Dos/Dos.asp" |
| apps/zte_manager/services/huawei_captured_features.py | 3475 | _html, records = self._records(IPV6_FIREWALL_PAGE) |
| apps/zte_manager/services/huawei_captured_features.py | 3498 | "/html/bbsp/ipv6firewall/set.cgi" |
| apps/zte_manager/services/huawei_captured_features.py | 3500 | "&RequestFile=html/bbsp/ipv6firewall/firewall.asp" |
| apps/zte_manager/services/huawei_captured_features.py | 3524 | _html, records = self._records(INTERNET_CONTROL_PAGE) |
| apps/zte_manager/services/huawei_captured_features.py | 3541 | "/html/bbsp/internetcontrol/set.cgi" |
| apps/zte_manager/services/huawei_captured_features.py | 3543 | "&RequestFile=html/bbsp/internetcontrol/internetcontrol.asp" |
| apps/zte_manager/services/huawei_captured_features.py | 3590 | "/html/bbsp/firewalllevel/set.cgi" |
| apps/zte_manager/services/huawei_captured_features.py | 3592 | "&RequestFile=html/bbsp/firewalllevel/firewalllevel.asp" |
| apps/zte_manager/services/huawei_unified_provider.py | 35 | Model names are hints; authenticated endpoint/parser evidence decides which |
| apps/zte_manager/services/huawei_unified_provider.py | 85 | # proven by their authenticated endpoint/parser signatures. |
| apps/zte_manager/services/huawei_hg8347r_runtime.py | 8 | from apps.zte_manager.infrastructure.huawei.codec import decode_huawei_js_string |
| apps/zte_manager/services/huawei_hg8347r_runtime.py | 24 | USER_DEVICE_PAGE = "/html/bbsp/userdevinfo/userdevinfolan.asp" |
| apps/zte_manager/services/huawei_hg8347r_runtime.py | 28 | "RequestFile=html/bbsp/userdevinfo/userdevinfolan.asp" |
| apps/zte_manager/services/huawei_hg8347r_runtime.py | 30 | LOGOUT_PATH = "/logout.cgi?RequestFile=html/logout.html" |
| apps/zte_manager/services/huawei_hg8347r_runtime.py | 80 | def _decoded_json(source: object) -> Any: |
| apps/zte_manager/services/huawei_hg8347r_runtime.py | 81 | text = decode_huawei_js_string(str(source or "")).lstrip("\ufeff").strip() |
| apps/zte_manager/services/huawei_hg8347r_runtime.py | 85 | return json.loads(text) |
| apps/zte_manager/services/huawei_hg8347r_runtime.py | 86 | except json.JSONDecodeError as exc: |
| apps/zte_manager/services/huawei_hg8347r_runtime.py | 90 | def parse_clients(cls, source: object) -> tuple[list[dict[str, Any]], bool]: |
| apps/zte_manager/services/huawei_hg8347r_runtime.py | 91 | value = cls._decoded_json(source) |
| apps/zte_manager/services/huawei_hg8347r_runtime.py | 148 | devices, success_marker = self.parse_clients(body) |
| apps/zte_manager/services/huawei_cli_telemetry.py | 64 | def parse_wap_optical(source: str, *, transport: str) -> OpticalTelemetry: |
| apps/zte_manager/services/huawei_cli_telemetry.py | 83 | def parse_wap_resources(source: str, *, transport: str) -> DeviceResourceTelemetry: |
| apps/zte_manager/services/huawei_cli_telemetry.py | 127 | def parse_wap_pon_statistics(source: str, *, transport: str) -> PonStatistics: |
| apps/zte_manager/services/huawei_cli_telemetry.py | 129 | parsed: dict[str, Any] = {} |
| apps/zte_manager/services/huawei_cli_telemetry.py | 133 | parsed[field_name] = _integer(raw) |
| apps/zte_manager/services/huawei_cli_telemetry.py | 134 | if not any(value is not None for value in parsed.values()): |
| apps/zte_manager/services/huawei_cli_telemetry.py | 137 | **parsed, |
| apps/zte_manager/services/huawei_cli_telemetry.py | 143 | def parse_wap_pon_status(source: str, *, transport: str) -> PonStatus: |
| apps/zte_manager/services/huawei_cli_telemetry.py | 170 | return parse_wap_optical( |
| apps/zte_manager/services/huawei_cli_telemetry.py | 176 | return parse_wap_resources( |
| apps/zte_manager/services/huawei_cli_telemetry.py | 182 | return parse_wap_pon_statistics( |
| apps/zte_manager/services/huawei_cli_telemetry.py | 188 | return parse_wap_pon_status( |
| apps/zte_manager/services/provisioning_service.py | 8 | from urllib.parse import quote |
| apps/zte_manager/services/huawei_wifi_domain_runtime.py | 188 | "Endpoint existe, resposta é reconhecível e parser concluiu." |
| apps/zte_manager/services/huawei_wifi_domain_runtime.py | 268 | _html, records = captured._records( |
| apps/zte_manager/services/huawei_pon.py | 6 | from apps.zte_manager.infrastructure.huawei import decode_huawei_js_string |
| apps/zte_manager/services/huawei_pon.py | 7 | from apps.zte_manager.services.huawei_captured_features import parse_huawei_js_records |
| apps/zte_manager/services/huawei_pon.py | 10 | PON_STATE_PAGE = "/html/bbsp/common/ontstate.asp" |
| apps/zte_manager/services/huawei_pon.py | 20 | return decode_huawei_js_string(match.group(1)).strip() if match else "" |
| apps/zte_manager/services/huawei_pon.py | 47 | for record in parse_huawei_js_records(source) |
| apps/zte_manager/services/f6201b_capture.py | 5 | referência, mas somente permite consultar XML com OBJ_* observado. |
| apps/zte_manager/services/f6201b_capture.py | 12 | import xml.etree.ElementTree as ET |
| apps/zte_manager/services/f6201b_capture.py | 19 | _CAPTURE = """Firewall\|firewall_homepage_lua.lua\|OBJ_FWLEVEL_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 20 | Wi-Fi\|wlan_homepage_lua.lua\|OBJ_ACCESSDEV_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 21 | Sistema\|sntp_data\|OBJ_SNTP_ID\|hiddenData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 22 | LAN\|accessdev_homepage_lua.lua\|\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 23 | Telefonia\|voip_homepage_lua.lua\|OBJ_VOIPSIPLINE_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 25 | Fibra\|optical_info_lua.lua\|OBJ_PON_OPTICALPARA_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 26 | WAN\|wan_internetstatus_lua.lua\|\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 27 | WAN\|tunnel_4in6_status_lua.lua\|\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 28 | WAN\|l2tp_lua.lua\|OBJ_L2TP_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 29 | WAN\|clearlink_lua.lua\|OBJ_CLEAR_LINK_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 30 | WAN\|wan_internet_lua.lua\|\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 31 | WAN\|tunnel_4in6_config_lua.lua\|\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 32 | Firewall\|firewall_config_lua.lua\|OBJ_FWLEVEL_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 33 | Firewall\|firewall_parentctrl_lua.lua\|\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 34 | WAN\|ddns_lua.lua\|OBJ_DDNSCLIENT_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 35 | Sistema\|sntp_lua.lua\|OBJ_SNTP_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 36 | WAN\|portbinding_lua.lua\|OBJ_PORT_BINDING_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 37 | WAN\|rip_lua.lua\|OBJ_RIP_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 38 | Multicast\|multicast_mode_lua.lua\|OBJ_IGMPMODE_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 39 | WAN\|Internet_PortLocate_lua.lua\|OBJ_PORTLOCATE_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 40 | Fibra\|poninfo_loid_lua.lua\|OBJ_PON_LOID_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 41 | Fibra\|poninfo_sn_lua.lua\|OBJ_SN_INFO_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 42 | LAN\|status_lan_info_lua.lua\|OBJ_PON_PORT_BASIC_STATUS_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 43 | LAN\|Localnet_LanMgrIpv4_DHCPHostInfo_lua.lua\|OBJ_DHCPHOSTINFO_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 44 | Wi-Fi\|wlan_wlanbasiconoff_lua.lua\|OBJ_WLANTIMECFG_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 45 | Wi-Fi\|wlan_macfilteraclpolicy_lua.lua\|OBJ_WLANSETTING_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 46 | Wi-Fi\|wlan_wps_lua.lua\|OBJ_WPS_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 47 | Wi-Fi\|wlan_sta_wlan_profile_lua.lua\|\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 48 | Wi-Fi\|wlan_BandSteering_lua.lua\|OBJ_WLAN_BANDSTEERING_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 49 | Wi-Fi\|Localnet_NetSphere_Mode_lua.lua\|OBJ_NETSPHERE_MAP_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 50 | Wi-Fi\|wlan_wlanbasicadconf_lua.lua\|\|menuData\|XML_TRUNCATED |
| apps/zte_manager/services/f6201b_capture.py | 51 | Wi-Fi\|wlan_wlansssidconf_lua.lua\|OBJ_WLANAP_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 52 | LAN\|Localnet_LanMgrIpv4_DHCPBasicCfg_lua.lua\|OBJ_Br0AndDhcpsHosCfg_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 53 | LAN\|Localnet_LanMgrIpv4_DHCPStaticRule_lua.lua\|\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 54 | LAN\|Localnet_LanDevDHCPSource_lua.lua\|OBJ_LANDEVDHCPSOURCE_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 55 | WAN\|route_routedefault_lua.lua\|OBJ_ROUTEDEFAULT_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 56 | LAN\|dhcp6s_hostinfo_lua.lua\|\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 57 | WAN\|eth_interface_config_lua.lua\|OBJ_LAN_PORT_CONF_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 58 | WAN\|upnp_upnp_lua.lua\|OBJ_UPNPCONFIG_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 59 | WAN\|route_routedefaultipv6_lua.lua\|OBJ_ROUTEDEFAULT6_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 60 | WAN\|route_routetableipv4_lua.lua\|OBJ_ROUTETABLE_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 61 | WAN\|route_routestaticipv4_lua.lua\|\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 62 | WAN\|route_routepolicyipv4_lua.lua\|\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 63 | WAN\|upnp_portmap_lua.lua\|\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 64 | WAN\|bpdu_lua.lua\|OBJ_BPDU_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 65 | WAN\|dns_localdns_lua.lua\|OBJ_DNS_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 66 | Telefonia\|voipRegStatus_lua.lua\|OBJ_VOIPVPLINE_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 67 | Telefonia\|voip_voipbasic_lua.lua\|OBJ_VOIPSIPLINE_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 68 | Telefonia\|Voip_SipIf_lua.lua\|OBJ_VOIPBEARINFO_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 69 | Telefonia\|voipDmtTimer_lua.lua\|OBJ_VOIPDMTIMER_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 70 | Telefonia\|Voip_SipService_lua.lua\|OBJ_VOIPVPCALLTIMER_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 71 | Telefonia\|voip_sipadvanced_lua.lua\|OBJ_VRTPADV_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 72 | Telefonia\|voip_voipsip_lua.lua\|OBJ_VOIPSIP_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 73 | Telefonia\|Voip_sipdigitmap_lua.lua\|OBJ_VOIPVOICEPROFILE_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 74 | Telefonia\|voip_sipmedia_lua.lua\|OBJ_VOIPVPLINE_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 75 | Telefonia\|voip_sipslc_lua.lua\|OBJ_VOIPSLCINF_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 76 | Telefonia\|voip_cid_sip_lua.lua\|OBJ_VOIPDTMF_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 77 | Telefonia\|voip_fax_lua.lua\|OBJ_VOIPFAXT38_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 78 | Telefonia\|Voip_Voip_QoS_lua.lua\|OBJ_VOIPSIP_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 79 | Telefonia\|voip_protocolswitch_lua.lua\|OBJ_VOIPEXT_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 80 | Sistema\|devmgr_statusmgr_lua.lua\|OBJ_DEVINFO_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 82 | Sistema\|devauth_accountmgr_lua.lua\|OBJ_USERINFO_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 83 | Sistema\|web_login_timeout_lua.lua\|OBJ_USERIF_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 85 | Sistema\|log_syslogmgr_lua.lua\|OBJ_LOG_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 86 | Sistema\|tr069_remotemgr_lua.lua\|OBJ_MANAGESERVER_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 87 | Sistema\|scp_remotemgr_lua.lua\|OBJ_SCPMGR_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 88 | Diagnóstico\|networkdiag_ping_lua.lua\|OBJ_DEVPING_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 89 | Diagnóstico\|networkdiag_traceroute_lua.lua\|OBJ_TRACERT_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 90 | Diagnóstico\|networkdiag_svcsimulation_lua.lua\|OBJ_SIMULATION_PPPOE_GET_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 91 | Sistema\|ipv6_enable_lua.lua\|OBJ_IPGLOBAL_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 92 | Sistema\|devmgr_lan_backup_lua.lua\|OBJ_LAN_BACKUP_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 93 | Sistema\|mirror_mirrormgr_lua.lua\|OBJ_MIRROR_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 94 | Sistema\|loopback_basic_lua.lua\|OBJ_LOOPBACK_BASIC_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 95 | LAN\|arp_arptable_lua.lua\|OBJ_GETARPINST_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 96 | LAN\|macinfo_mactable_lua.lua\|OBJ_GETMACINST_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 97 | Multicast\|multilaser_digit_map_lua.lua\|OBJ_DIGITMAP_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 98 | Multicast\|multilaser_olt_vlan_lua.lua\|OBJ_OLTVLAN_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 99 | Firewall\|firewall_filterglobal_lua.lua\|OBJ_FWBASE_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 100 | Firewall\|firewall_ipv4service_lua.lua\|OBJ_FWSC_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 101 | Firewall\|firewall_alg_lua.lua\|OBJ_FWALG_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 102 | Firewall\|firewall_dmz_lua.lua\|OBJ_FWDMZ_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 103 | Firewall\|firewall_portforwarding_lua.lua\|\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 104 | Firewall\|firewall_porttrigger_m.lua\|\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 105 | WAN\|route_ripng_m.lua\|OBJ_RIPNG_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 106 | Multicast\|multicast_igmpwan_lua.lua\|\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 107 | Multicast\|multicast_mldwan_lua.lua\|\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 108 | Multicast\|igmp_lua.lua\|OBJ_IGMPPROXYC_ID\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 109 | Multicast\|multicast_vlan_lua.lua\|\|menuData\|XML |
| apps/zte_manager/services/f6201b_capture.py | 110 | Multicast\|multicast_address_lua.lua\|OBJ_IGMPADDLIMITUNTAG_ID\|menuData\|XML""" |
| apps/zte_manager/services/f6201b_capture.py | 119 | "inspectable": fmt in {"XML", "JSON", "XML_TRUNCATED"}, |
| apps/zte_manager/services/f6201b_capture.py | 126 | # Second capture resolves earlier unknown-XML records too. |
| apps/zte_manager/services/f6201b_capture.py | 130 | ALLOWED[tag]["response_format"] = "XML" |
| apps/zte_manager/services/f6201b_capture.py | 135 | # O inspetor valida XML/JSON recebidos ao vivo, sem expor valores. |
| apps/zte_manager/services/f6201b_capture.py | 139 | "XML" if root else "OUTRO", |
| apps/zte_manager/services/f6201b_capture.py | 158 | "Inventário estrutural da captura; opções sem OBJ XML validável " |
| apps/zte_manager/services/f6201b_capture.py | 164 | def _structural_xml(raw: str, expected: str = "") -> dict: |
| apps/zte_manager/services/f6201b_capture.py | 167 | if root.tag != "ajax_response_xml_root": |
| apps/zte_manager/services/f6201b_capture.py | 168 | raise ValueError("A resposta não possui o envelope XML ThinkLua.") |
| apps/zte_manager/services/f6201b_capture.py | 195 | raise ValueError("A resposta não contém objetos XML inspecionáveis.") |
| apps/zte_manager/services/f6201b_capture.py | 202 | XML and JSON routes are independent of POST permissions. Never expose |
| apps/zte_manager/services/f6201b_capture.py | 203 | firmware values, HTML, credential fields or raw router data. |
| apps/zte_manager/services/f6201b_capture.py | 231 | payload = json.loads(raw) |
| apps/zte_manager/services/f6201b_capture.py | 242 | structure = _structural_xml(raw, route["root"]) |
| apps/zte_manager/services/f6201b_capture.py | 243 | except (ET.ParseError, ValueError, TypeError): |
| apps/zte_manager/services/huawei_hg8245h_runtime.py | 5 | import xml.etree.ElementTree as ET |
| apps/zte_manager/services/huawei_hg8245h_runtime.py | 34 | def _parse_api_fields(source: object) -> dict[str, Any]: |
| apps/zte_manager/services/huawei_hg8245h_runtime.py | 41 | data = json.loads(text) |
| apps/zte_manager/services/huawei_hg8245h_runtime.py | 42 | except (TypeError, ValueError, json.JSONDecodeError): |
| apps/zte_manager/services/huawei_hg8245h_runtime.py | 50 | except ET.ParseError as exc: |
| apps/zte_manager/services/huawei_hg8245h_runtime.py | 51 | raise RuntimeError("HG8245H API deviceinfo não é JSON/XML reconhecível.") from exc |
| apps/zte_manager/services/huawei_hg8245h_runtime.py | 103 | fields = _parse_api_fields(source) |
| apps/zte_manager/services/huawei_hg8245h_runtime.py | 133 | "evidence": "reference_endpoint+runtime_parser", |
| apps/zte_manager/services/huawei_hg8145x6_runtime.py | 6 | from apps.zte_manager.infrastructure.huawei.js_parser import ( |
| apps/zte_manager/services/huawei_hg8145x6_runtime.py | 7 | parse_huawei_js_constructors, |
| apps/zte_manager/services/huawei_hg8145x6_runtime.py | 21 | HG8145X6_WLAN_INFO_PAGE = "/html/amp/wlaninfo/wlaninfo.asp" |
| apps/zte_manager/services/huawei_hg8145x6_runtime.py | 23 | "/html/amp/wlaninfo/getassociateddeviceinfo.asp" |
| apps/zte_manager/services/huawei_hg8145x6_runtime.py | 27 | "/html/amp/common/getSmartDiagnoseResult.asp", |
| apps/zte_manager/services/huawei_hg8145x6_runtime.py | 28 | "/html/ssmp/common/getOpticTxRx.asp", |
| apps/zte_manager/services/huawei_hg8145x6_runtime.py | 49 | for row in parse_huawei_js_constructors( |
| apps/zte_manager/services/huawei_hg8145x6_runtime.py | 238 | # HG8145X6-10 parser. Guard every index so firmware drift degrades |
| apps/zte_manager/services/huawei_hg8145x6_runtime.py | 409 | records = parse_huawei_js_constructors( |
| apps/zte_manager/services/f6201b_dns_writes.py | 14 | import xml.etree.ElementTree as ET |
| apps/zte_manager/services/f6201b_dns_writes.py | 35 | xml = zte.get_menu("dns_localdns_lua.lua") |
| apps/zte_manager/services/f6201b_dns_writes.py | 36 | zte._validar_resposta(xml) |
| apps/zte_manager/services/f6201b_dns_writes.py | 38 | response = ET.fromstring(xml) |
| apps/zte_manager/services/f6201b_dns_writes.py | 39 | except ET.ParseError: |
| apps/zte_manager/services/f6201b_dns_writes.py | 40 | raise RuntimeError("Resposta DNS não é XML válido.") from None |
| apps/zte_manager/services/f6201b_dns_writes.py | 41 | if (response.tag != "ajax_response_xml_root" or |
| apps/zte_manager/services/f6201b_dns_writes.py | 44 | data = zte._parse_instances(xml).get("OBJ_DNS_ID", []) |
| apps/zte_manager/templates/index.html | 783 | <!-- Bloqueia submissão HTML nativa caso scripts carreguem com erro. |
| apps/zte_manager/views/console.py | 13 | "apps/zte_manager/templates/index.html", |
| apps/zte_manager/model/zte.py | 1 | import xml.etree.ElementTree as ET |
| apps/zte_manager/model/zte.py | 67 | "X-Requested-With": "XMLHttpRequest", |
| apps/zte_manager/model/zte.py | 134 | # PARSER XML |
| apps/zte_manager/model/zte.py | 138 | def _parse_instances(xml_text): |
| apps/zte_manager/model/zte.py | 139 | root = ET.fromstring(xml_text) |
| apps/zte_manager/model/zte.py | 180 | def _validar_resposta(xml_text): |
| apps/zte_manager/model/zte.py | 186 | if "SessionTimeout" in xml_text: |
| apps/zte_manager/model/zte.py | 192 | root = ET.fromstring(xml_text) |
| apps/zte_manager/model/zte.py | 193 | except ET.ParseError: |
| apps/zte_manager/model/zte.py | 194 | return xml_text |
| apps/zte_manager/model/zte.py | 209 | return xml_text |
| apps/zte_manager/model/zte.py | 216 | xml = self.device_status_raw() |
| apps/zte_manager/model/zte.py | 218 | self._validar_resposta(xml) |
| apps/zte_manager/model/zte.py | 220 | dados = self._parse_instances(xml) |
| apps/zte_manager/model/zte.py | 310 | xml = self.wifi_clients_raw() |
| apps/zte_manager/model/zte.py | 312 | self._validar_resposta(xml) |
| apps/zte_manager/model/zte.py | 314 | dados = self._parse_instances(xml) |
| apps/zte_manager/model/zte.py | 367 | xml = self.lan_clients_raw() |
| apps/zte_manager/model/zte.py | 369 | self._validar_resposta(xml) |
| apps/zte_manager/model/zte.py | 371 | dados = self._parse_instances(xml) |
| apps/zte_manager/model/zte.py | 408 | xml = self.wlan_channel_raw() |
| apps/zte_manager/model/zte.py | 410 | self._validar_resposta(xml) |
| apps/zte_manager/model/zte.py | 412 | dados = self._parse_instances(xml) |
| apps/zte_manager/model/zte.py | 464 | xml = self.wlan_channel_raw() |
| apps/zte_manager/model/zte.py | 466 | self._validar_resposta(xml) |
| apps/zte_manager/model/zte.py | 468 | dados = self._parse_instances(xml) |
| apps/zte_manager/model/zte.py | 955 | xml = self.wan_status_raw() |
| apps/zte_manager/model/zte.py | 957 | self._validar_resposta(xml) |
| apps/zte_manager/model/zte.py | 959 | dados = self._parse_instances(xml) |
| apps/zte_manager/model/zte_configuration/zte_advanced.py | 23 | xml = zte.get_menu( |
| apps/zte_manager/model/zte_configuration/zte_advanced.py | 28 | xml |
| apps/zte_manager/model/zte_configuration/zte_advanced.py | 31 | dados = zte._parse_instances( |
| apps/zte_manager/model/zte_configuration/zte_advanced.py | 32 | xml |
| apps/zte_manager/model/zte_configuration/zte_advanced.py | 211 | """Reaproveita a mesma página de power/timer sem duplicar parser.""" |
| apps/zte_manager/model/zte_configuration/zte_advanced.py | 387 | xml = zte.get_menu( |
| apps/zte_manager/model/zte_configuration/zte_advanced.py | 392 | xml |
| apps/zte_manager/model/zte_configuration/zte_advanced.py | 395 | dados = zte._parse_instances( |
| apps/zte_manager/model/zte_configuration/zte_advanced.py | 396 | xml |
| apps/zte_manager/model/zte_configuration/zte_advanced.py | 555 | xml = zte.get_menu( |
| apps/zte_manager/model/zte_configuration/zte_advanced.py | 560 | xml |
| apps/zte_manager/model/zte_configuration/zte_advanced.py | 563 | dados = zte._parse_instances( |
| apps/zte_manager/model/zte_configuration/zte_advanced.py | 564 | xml |
| apps/zte_manager/model/zte_configuration/zte_advanced.py | 777 | xml = zte.get_menu( |
| apps/zte_manager/model/zte_configuration/zte_advanced.py | 782 | xml |
| apps/zte_manager/model/zte_configuration/zte_advanced.py | 785 | data = zte._parse_instances( |
| apps/zte_manager/model/zte_configuration/zte_advanced.py | 786 | xml |
| apps/zte_manager/model/zte_configuration/zte_diagnostics.py | 63 | xml = zte.get_menu( |
| apps/zte_manager/model/zte_configuration/zte_diagnostics.py | 68 | xml |
| apps/zte_manager/model/zte_configuration/zte_diagnostics.py | 72 | zte._parse_instances(xml) |
| apps/zte_manager/model/zte_configuration/zte_diagnostics.py | 170 | xml = zte.get_menu( |
| apps/zte_manager/model/zte_configuration/zte_diagnostics.py | 175 | xml |
| apps/zte_manager/model/zte_configuration/zte_diagnostics.py | 179 | zte._parse_instances(xml) |
| apps/zte_manager/model/zte_configuration/zte_wan_config.py | 1 | import xml.etree.ElementTree as ET |
| apps/zte_manager/model/zte_configuration/zte_wan_config.py | 41 | xml = wan_config_raw( |
| apps/zte_manager/model/zte_configuration/zte_wan_config.py | 46 | xml |
| apps/zte_manager/model/zte_configuration/zte_wan_config.py | 49 | dados = zte._parse_instances( |
| apps/zte_manager/model/zte_configuration/zte_wan_config.py | 50 | xml |
| apps/zte_manager/model/zte_configuration/zte_wan_config.py | 61 | xml |
| apps/zte_manager/model/zte_configuration/zte_wan_config.py | 146 | def _get_encode_fields(xml): |
| apps/zte_manager/model/zte_configuration/zte_wan_config.py | 149 | xml |
| apps/zte_manager/model/zte_configuration/zte_wan_config.py | 151 | except ET.ParseError: |
| apps/zte_manager/model/zte_configuration/zte_lan.py | 45 | xml = lan_ports_raw( |
| apps/zte_manager/model/zte_configuration/zte_lan.py | 50 | xml |
| apps/zte_manager/model/zte_configuration/zte_lan.py | 54 | zte._parse_instances(xml) |
| apps/zte_manager/model/zte_configuration/zte_get_menu.py | 28 | # O mesmo HTML que prepara o contexto da página contém o token temporário |
| apps/zte_manager/model/zte_configuration/zte_device_management.py | 3 | import xml.etree.ElementTree as ET |
| apps/zte_manager/model/zte_configuration/zte_device_management.py | 31 | xml = optical_raw( |
| apps/zte_manager/model/zte_configuration/zte_device_management.py | 36 | xml |
| apps/zte_manager/model/zte_configuration/zte_device_management.py | 39 | dados = zte._parse_instances( |
| apps/zte_manager/model/zte_configuration/zte_device_management.py | 40 | xml |
| apps/zte_manager/model/zte_configuration/zte_device_management.py | 153 | xml = zte.get_menu( |
| apps/zte_manager/model/zte_configuration/zte_device_management.py | 158 | xml |
| apps/zte_manager/model/zte_configuration/zte_device_management.py | 162 | zte._parse_instances(xml) |
| apps/zte_manager/model/zte_configuration/zte_device_management.py | 216 | xml = zte.get_menu( |
| apps/zte_manager/model/zte_configuration/zte_device_management.py | 221 | xml |
| apps/zte_manager/model/zte_configuration/zte_device_management.py | 225 | zte._parse_instances(xml) |
| apps/zte_manager/model/zte_configuration/zte_wlan_channel_configuration.py | 163 | xml = get_channel( |
| apps/zte_manager/model/zte_configuration/zte_wlan_channel_configuration.py | 168 | xml |
| apps/zte_manager/model/zte_configuration/zte_wlan_channel_configuration.py | 171 | dados = zte._parse_instances( |
| apps/zte_manager/model/zte_configuration/zte_wlan_channel_configuration.py | 172 | xml |
| apps/zte_manager/model/zte_configuration/zte_management.py | 262 | xml = zte.get_menu( |
| apps/zte_manager/model/zte_configuration/zte_management.py | 267 | xml |
| apps/zte_manager/model/zte_configuration/zte_management.py | 270 | objects = zte._parse_instances( |
| apps/zte_manager/model/zte_configuration/zte_management.py | 271 | xml |
| apps/zte_manager/model/zte_configuration/zte_management.py | 596 | xml = zte.get_menu( |
| apps/zte_manager/model/zte_configuration/zte_management.py | 601 | xml |
| apps/zte_manager/model/zte_configuration/zte_management.py | 604 | objects = zte._parse_instances( |
| apps/zte_manager/model/zte_configuration/zte_management.py | 605 | xml |
| apps/zte_manager/model/zte_configuration/zte_management.py | 876 | xml = zte_wan_config.wan_config_raw( |
| apps/zte_manager/model/zte_configuration/zte_management.py | 881 | xml |
| apps/zte_manager/model/zte_configuration/zte_management.py | 884 | objects = zte._parse_instances( |
| apps/zte_manager/model/zte_configuration/zte_management.py | 885 | xml |
| apps/zte_manager/model/zte_configuration/zte_management.py | 900 | xml |
| apps/zte_manager/model/zte_configuration/zte_management.py | 1274 | # O XML traz UserName/Password criptografados com sessionTmpToken. |
| apps/zte_manager/model/zte_configuration/zte_management.py | 1807 | xml = zte.get_menu( |
| apps/zte_manager/model/zte_configuration/zte_management.py | 1812 | xml |
| apps/zte_manager/model/zte_configuration/zte_management.py | 1816 | "objects": zte._parse_instances( |
| apps/zte_manager/model/zte_configuration/zte_management.py | 1817 | xml |
| apps/zte_manager/model/zte_configuration/zte_management.py | 1819 | "raw_status": xml[:2000], |
| apps/zte_manager/model/zte_configuration/zte_security.py | 4 | from urllib.parse import quote |
| apps/zte_manager/model/zte_configuration/zte_security.py | 20 | def update_page_security(zte, html, source=None): |
| apps/zte_manager/model/zte_configuration/zte_security.py | 32 | A chave RSA é procurada no próprio HTML/JS da ONT. Isso é importante |
| apps/zte_manager/model/zte_configuration/zte_security.py | 38 | html |
| apps/zte_manager/model/zte_configuration/zte_security.py | 45 | html |
| apps/zte_manager/model/zte_configuration/zte_security.py | 52 | html |
| apps/zte_manager/model/zte_configuration/zte_security.py | 95 | def extract_session_tmp_token(html): |
| apps/zte_manager/model/zte_configuration/zte_security.py | 98 | html |
| apps/zte_manager/model/zte_configuration/zte_security.py | 110 | ).decode( |
| apps/zte_manager/model/zte_configuration/zte_security.py | 117 | html |
| apps/zte_manager/model/zte_configuration/zte_security.py | 126 | def extract_public_key(html): |
| apps/zte_manager/model/zte_configuration/zte_security.py | 128 | html |
| apps/zte_manager/model/zte_configuration/zte_security.py | 177 | def extract_integrity_check(html): |
| apps/zte_manager/model/zte_configuration/zte_security.py | 186 | html, |
| apps/zte_manager/model/zte_configuration/zte_security.py | 253 | ).decode("ascii") |
| apps/zte_manager/model/zte_configuration/zte_security.py | 267 | Decodifica campos marcados em <encode> no XML da ONT. |
| apps/zte_manager/model/zte_configuration/zte_security.py | 287 | ciphertext = base64.b64decode( |
| apps/zte_manager/model/zte_configuration/zte_security.py | 309 | .decode("utf-8") |
| apps/zte_manager/model/zte_configuration/zte_security.py | 351 | ).decode("ascii") |
| apps/zte_manager/model/zte_configuration/zte_security.py | 410 | ).decode("ascii") |
| apps/zte_manager/model/zte_configuration/zte_network_management.py | 5 | import xml.etree.ElementTree as ET |
| apps/zte_manager/model/zte_configuration/zte_network_management.py | 41 | xml = self.zte.get_menu( |
| apps/zte_manager/model/zte_configuration/zte_network_management.py | 45 | self.zte._validar_resposta(xml) |
| apps/zte_manager/model/zte_configuration/zte_network_management.py | 48 | self.zte._parse_instances(xml) |
| apps/zte_manager/model/zte_configuration/zte_network_management.py | 243 | def _dhcp_decode( |
| apps/zte_manager/model/zte_configuration/zte_network_management.py | 244 | zte, xml: str, basic: dict[str, Any], token: str \| None, |
| apps/zte_manager/model/zte_configuration/zte_network_management.py | 246 | """Decode ONLY confirmed IPv4 AES values; never show ciphertext as IP. |
| apps/zte_manager/model/zte_configuration/zte_network_management.py | 253 | root = ET.fromstring(xml) |
| apps/zte_manager/model/zte_configuration/zte_network_management.py | 258 | except ET.ParseError: |
| apps/zte_manager/model/zte_configuration/zte_network_management.py | 270 | ciphertext = base64.b64decode(raw, validate=True) |
| apps/zte_manager/model/zte_configuration/zte_network_management.py | 306 | basic_xml = zte.get_menu( |
| apps/zte_manager/model/zte_configuration/zte_network_management.py | 309 | zte._validar_resposta(basic_xml) |
| apps/zte_manager/model/zte_configuration/zte_network_management.py | 310 | basic_objects = zte._parse_instances( |
| apps/zte_manager/model/zte_configuration/zte_network_management.py | 311 | basic_xml |
| apps/zte_manager/model/zte_configuration/zte_network_management.py | 321 | lease_xml = zte.get_menu( |
| apps/zte_manager/model/zte_configuration/zte_network_management.py | 324 | zte._validar_resposta(lease_xml) |
| apps/zte_manager/model/zte_configuration/zte_network_management.py | 325 | lease_objects = zte._parse_instances( |
| apps/zte_manager/model/zte_configuration/zte_network_management.py | 326 | lease_xml |
| apps/zte_manager/model/zte_configuration/zte_network_management.py | 347 | decoded, encrypted_fields, warnings = _dhcp_decode( |
| apps/zte_manager/model/zte_configuration/zte_network_management.py | 348 | zte, basic_xml, basic, basic_page_token |
| apps/zte_manager/model/zte_configuration/zte_network_management.py | 351 | # A partially decoded form remains inspectable but cannot perform POSTs. |
| apps/zte_manager/model/zte_configuration/zte_network_management.py | 353 | "basic": decoded, |
| apps/zte_manager/model/zte_configuration/zte_post.py | 96 | # Alguns builds não expõem IntegCheck de forma simples no HTML, mas |
| apps/zte_manager/model/zte_configuration/zte_wifi.py | 4 | import xml.etree.ElementTree as ET |
| apps/zte_manager/model/zte_configuration/zte_wifi.py | 159 | xml = wifi_status( |
| apps/zte_manager/model/zte_configuration/zte_wifi.py | 164 | xml |
| apps/zte_manager/model/zte_configuration/zte_wifi.py | 167 | dados = zte._parse_instances( |
| apps/zte_manager/model/zte_configuration/zte_wifi.py | 168 | xml |
| apps/zte_manager/model/zte_configuration/zte_wifi.py | 182 | xml |
| apps/zte_manager/model/zte_configuration/zte_wifi.py | 298 | xml = wifi_status( |
| apps/zte_manager/model/zte_configuration/zte_wifi.py | 303 | xml |
| apps/zte_manager/model/zte_configuration/zte_wifi.py | 306 | dados = zte._parse_instances( |
| apps/zte_manager/model/zte_configuration/zte_wifi.py | 307 | xml |
| apps/zte_manager/model/zte_configuration/zte_wifi.py | 360 | xml |
| apps/zte_manager/model/zte_configuration/zte_wifi.py | 669 | def _get_encode_fields(xml_text): |
| apps/zte_manager/model/zte_configuration/zte_wifi.py | 672 | xml_text |
| apps/zte_manager/model/zte_configuration/zte_wifi.py | 674 | except ET.ParseError: |
| apps/zte_manager/model/zte_configuration/zte_dns.py | 3 | import xml.etree.ElementTree as ET |
| apps/zte_manager/model/zte_configuration/zte_dns.py | 55 | xml = dns_status_raw( |
| apps/zte_manager/model/zte_configuration/zte_dns.py | 60 | xml |
| apps/zte_manager/model/zte_configuration/zte_dns.py | 63 | dados = zte._parse_instances( |
| apps/zte_manager/model/zte_configuration/zte_dns.py | 64 | xml |
| apps/zte_manager/model/zte_configuration/zte_dns.py | 78 | hosts_xml = dns_hosts_raw( |
| apps/zte_manager/model/zte_configuration/zte_dns.py | 83 | hosts_xml |
| apps/zte_manager/model/zte_configuration/zte_dns.py | 93 | "hosts": _parse_hosts( |
| apps/zte_manager/model/zte_configuration/zte_dns.py | 94 | hosts_xml |
| apps/zte_manager/model/zte_configuration/zte_dns.py | 316 | xml = dns_status_raw( |
| apps/zte_manager/model/zte_configuration/zte_dns.py | 321 | xml |
| apps/zte_manager/model/zte_configuration/zte_dns.py | 325 | zte._parse_instances(xml) |
| apps/zte_manager/model/zte_configuration/zte_dns.py | 375 | xml = dns_hosts_raw( |
| apps/zte_manager/model/zte_configuration/zte_dns.py | 380 | xml |
| apps/zte_manager/model/zte_configuration/zte_dns.py | 383 | hosts = _parse_hosts( |
| apps/zte_manager/model/zte_configuration/zte_dns.py | 384 | xml |
| apps/zte_manager/model/zte_configuration/zte_dns.py | 412 | xml = dns_hosts_raw( |
| apps/zte_manager/model/zte_configuration/zte_dns.py | 417 | xml |
| apps/zte_manager/model/zte_configuration/zte_dns.py | 420 | hosts = _parse_hosts( |
| apps/zte_manager/model/zte_configuration/zte_dns.py | 421 | xml |
| apps/zte_manager/model/zte_configuration/zte_dns.py | 449 | xml = dns_hosts_raw( |
| apps/zte_manager/model/zte_configuration/zte_dns.py | 454 | xml |
| apps/zte_manager/model/zte_configuration/zte_dns.py | 457 | atuais = _parse_hosts( |
| apps/zte_manager/model/zte_configuration/zte_dns.py | 458 | xml |
| apps/zte_manager/model/zte_configuration/zte_dns.py | 525 | def _parse_hosts(xml_text): |
| apps/zte_manager/model/zte_configuration/zte_dns.py | 528 | xml_text |
| apps/zte_manager/model/zte_configuration/zte_dns.py | 530 | except ET.ParseError: |
| apps/zte_manager/model/zte_configuration/zte_backup.py | 68 | # download token expira. Nunca salvar esse HTML como backup válido. |
| apps/zte_manager/model/zte_configuration/zte_backup.py | 73 | head.startswith((b"<!doctype html", b"<html")) |
| apps/zte_manager/model/zte_configuration/zte_backup.py | 75 | "text/html" in content_type |
| apps/zte_manager/model/zte_configuration/zte_backup.py | 77 | b"<html" in head |
| apps/zte_manager/model/zte_configuration/zte_backup.py | 84 | "A ONT retornou uma página HTML no lugar do backup. " |
| apps/zte_manager/model/zte_configuration/zte_mesh.py | 45 | parsed: dict[str, list[dict[str, Any]]], |
| apps/zte_manager/model/zte_configuration/zte_mesh.py | 48 | items = parsed.get( |
| apps/zte_manager/model/zte_configuration/zte_mesh.py | 132 | def _mesh_payload_from_xml( |
| apps/zte_manager/model/zte_configuration/zte_mesh.py | 134 | xml, |
| apps/zte_manager/model/zte_configuration/zte_mesh.py | 139 | xml |
| apps/zte_manager/model/zte_configuration/zte_mesh.py | 142 | parsed = zte._parse_instances( |
| apps/zte_manager/model/zte_configuration/zte_mesh.py | 143 | xml |
| apps/zte_manager/model/zte_configuration/zte_mesh.py | 147 | parsed, |
| apps/zte_manager/model/zte_configuration/zte_mesh.py | 177 | parsed, |
| apps/zte_manager/model/zte_configuration/zte_mesh.py | 181 | parsed, |
| apps/zte_manager/model/zte_configuration/zte_mesh.py | 185 | parsed, |
| apps/zte_manager/model/zte_configuration/zte_mesh.py | 189 | parsed, |
| apps/zte_manager/model/zte_configuration/zte_mesh.py | 193 | parsed, |
| apps/zte_manager/model/zte_configuration/zte_mesh.py | 196 | "raw_objects": parsed, |
| apps/zte_manager/model/zte_configuration/zte_mesh.py | 228 | html = zte.get_view( |
| apps/zte_manager/model/zte_configuration/zte_mesh.py | 234 | html |
| apps/zte_manager/model/zte_configuration/zte_mesh.py | 277 | xml = zte.get_menu( |
| apps/zte_manager/model/zte_configuration/zte_mesh.py | 294 | return _mesh_payload_from_xml( |
| apps/zte_manager/model/zte_configuration/zte_mesh.py | 296 | xml, |
| apps/zte_manager/model/zte_configuration/zte_mesh.py | 609 | # Algumas variantes carregam Mode mesmo sem mostrar Role no HTML. |
| apps/zte_manager/model/zte_configuration/zte_session.py | 3 | import xml.etree.ElementTree as ET |
| apps/zte_manager/model/zte_configuration/zte_session.py | 46 | except ET.ParseError: |
| apps/zte_manager/model/zte_configuration/zte_support_diagnostics.py | 5 | import xml.etree.ElementTree as ET |
| apps/zte_manager/model/zte_configuration/zte_support_diagnostics.py | 28 | def _session_value(xml_text: str) -> str \| None: |
| apps/zte_manager/model/zte_configuration/zte_support_diagnostics.py | 35 | root = ET.fromstring(xml_text) |
| apps/zte_manager/model/zte_configuration/zte_support_diagnostics.py | 40 | except ET.ParseError: |
| apps/zte_manager/model/zte_configuration/zte_support_diagnostics.py | 45 | xml_text, |
| apps/zte_manager/model/zte_configuration/zte_support_diagnostics.py | 105 | xml = zte.get_menu( |
| apps/zte_manager/model/zte_configuration/zte_support_diagnostics.py | 110 | zte._validar_resposta(xml) |
| apps/zte_manager/model/zte_configuration/zte_support_diagnostics.py | 113 | zte._parse_instances(xml) |
| apps/zte_manager/model/zte_configuration/zte_support_diagnostics.py | 224 | xml = zte.get_menu( |
| apps/zte_manager/model/zte_configuration/zte_support_diagnostics.py | 229 | xml |
| apps/zte_manager/model/zte_configuration/zte_support_diagnostics.py | 232 | parsed = zte._parse_instances( |
| apps/zte_manager/model/zte_configuration/zte_support_diagnostics.py | 233 | xml |
| apps/zte_manager/model/zte_configuration/zte_support_diagnostics.py | 236 | results = parsed.get( |
| apps/zte_manager/model/zte_configuration/zte_support_diagnostics.py | 241 | request = parsed.get( |
| apps/zte_manager/model/zte_configuration/zte_support_diagnostics.py | 300 | xml = zte.get_menu( |
| apps/zte_manager/model/zte_configuration/zte_support_diagnostics.py | 306 | xml |
| apps/zte_manager/model/zte_configuration/zte_support_diagnostics.py | 310 | xml |
| apps/zte_manager/model/zte_configuration/zte_support_diagnostics.py | 319 | result_xml = zte.get_menu( |
| apps/zte_manager/model/zte_configuration/zte_support_diagnostics.py | 326 | result_xml |
| apps/zte_manager/model/zte_configuration/zte_support_diagnostics.py | 330 | zte._parse_instances(result_xml) |
| apps/zte_manager/model/zte_configuration/zte_support_diagnostics.py | 456 | xml = zte.get_menu( |
| apps/zte_manager/model/zte_configuration/zte_support_diagnostics.py | 463 | xml |
| apps/zte_manager/model/zte_configuration/zte_support_diagnostics.py | 467 | zte._parse_instances(xml) |
| apps/zte_manager/model/device_adapters/huawei_registry.py | 94 | "/html/ssmp/deviceinfo/deviceinfo.asp", |
| apps/zte_manager/model/device_adapters/huawei_registry.py | 95 | "/html/amp/wlanadv/WlanAdvance.asp?2G", |
| apps/zte_manager/model/device_adapters/huawei_registry.py | 96 | "/html/amp/wlanadv/WlanAdvance.asp?5G", |
| apps/zte_manager/model/device_adapters/huawei_registry.py | 97 | "/html/amp/common/WlanChannel.asp?1=1", |
| apps/zte_manager/model/device_adapters/huawei_registry.py | 98 | "/html/bbsp/maintenance/diagnosecommon.asp", |
| apps/zte_manager/model/device_adapters/huawei_registry.py | 131 | "/html/ssmp/deviceinfo/deviceinfo.asp", |
| apps/zte_manager/model/device_adapters/huawei_registry.py | 132 | "/html/amp/opticinfo/opticinfo.asp", |
| apps/zte_manager/model/device_adapters/huawei_registry.py | 133 | "/html/bbsp/", |
| apps/zte_manager/model/device_adapters/huawei_registry.py | 151 | "/html/status/opticinfo.asp:stOpticInfo/6", |
| apps/zte_manager/model/device_adapters/huawei_registry.py | 152 | "/html/amp/opticinfo/opticinfo.asp:stOpticInfo/8", |
| apps/zte_manager/model/device_adapters/huawei_registry.py | 153 | "/html/amp/opticinfo/opticinfo.asp:stOpticInfo/16", |
| apps/zte_manager/model/device_adapters/huawei_registry.py | 184 | "/html/amp/opticinfo/opticinfo.asp", |
| apps/zte_manager/model/device_adapters/huawei_registry.py | 198 | "/html/ssmp/common/getRandString.asp", |
| apps/zte_manager/model/device_adapters/huawei_registry.py | 199 | "/html/ssmp/common/GetRandToken.asp", |
| apps/zte_manager/model/device_adapters/huawei_registry.py | 200 | "/html/bbsp/common/ontstate.asp", |
| apps/zte_manager/model/device_adapters/huawei_registry.py | 201 | "/html/amp/opticinfo/opticinfo.asp", |
| apps/zte_manager/model/device_adapters/huawei_registry.py | 216 | "/html/ssmp/deviceinfo/deviceinfo.asp", |
| apps/zte_manager/model/device_adapters/huawei_registry.py | 217 | "/html/bbsp/common/GetLanUserDevInfo.asp", |
| apps/zte_manager/model/device_adapters/huawei_registry.py | 218 | "/html/bbsp/userdevinfo/getuserdevinfo.asp", |
| apps/zte_manager/model/device_adapters/huawei_registry.py | 239 | "/asp/GetRandCount.asp", "/login.cgi", "/html/ssmp/", |
| apps/zte_manager/model/device_adapters/huawei_registry.py | 254 | "/html/bbsp/userdevinfo/getuserdevinfo.asp", |
| apps/zte_manager/model/device_adapters/huawei_registry.py | 288 | "/html/ssmp/deviceinfo/deviceinfo.asp", |
| apps/zte_manager/model/device_adapters/huawei_registry.py | 289 | "/html/bbsp/common/GetLanUserDevInfo.asp", |
| apps/zte_manager/model/device_adapters/huawei_registry.py | 290 | "/html/amp/opticinfo/opticinfo.asp:stOpticInfo/16", |
| apps/zte_manager/model/device_adapters/huawei.py | 171 | # invent a parser or mutation. |
| apps/zte_manager/infrastructure/zte/firmware_policy.py | 73 | parsed = json.loads(raw) |
| apps/zte_manager/infrastructure/zte/firmware_policy.py | 74 | if not isinstance(parsed, dict): |
| apps/zte_manager/infrastructure/zte/firmware_policy.py | 76 | return cls.from_approved(parsed) |
| apps/zte_manager/infrastructure/huawei/detector.py | 7 | from apps.zte_manager.infrastructure.huawei.codec import decode_huawei_js_string |
| apps/zte_manager/infrastructure/huawei/detector.py | 52 | "/html/ssmp/deviceinfo/deviceinfo.asp", |
| apps/zte_manager/infrastructure/huawei/detector.py | 53 | "/html/amp/opticinfo/opticinfo.asp", |
| apps/zte_manager/infrastructure/huawei/detector.py | 54 | "/html/bbsp/ipincoming/ipincoming.asp", |
| apps/zte_manager/infrastructure/huawei/detector.py | 105 | decoded = decode_huawei_js_string(body or "") |
| apps/zte_manager/infrastructure/huawei/detector.py | 107 | observed_sources.append(decoded) |
| apps/zte_manager/infrastructure/huawei/detector.py | 108 | raw_model = cls._extract_model(decoded) |
| apps/zte_manager/infrastructure/huawei/detector.py | 111 | raw_firmware = cls._extract_firmware(decoded) |
| apps/zte_manager/infrastructure/huawei/detector.py | 127 | decoded = decode_huawei_js_string(body or "") |
| apps/zte_manager/infrastructure/huawei/detector.py | 128 | observed_sources.append(decoded) |
| apps/zte_manager/infrastructure/huawei/detector.py | 129 | raw_model = cls._extract_model(decoded) |
| apps/zte_manager/infrastructure/huawei/detector.py | 132 | raw_firmware = cls._extract_firmware(decoded) |
| apps/zte_manager/infrastructure/huawei/client.py | 9 | from urllib.parse import urljoin |
| apps/zte_manager/infrastructure/huawei/client.py | 188 | "AppleWebKit/537.36 (KHTML, like Gecko) " |
| apps/zte_manager/infrastructure/huawei/client.py | 200 | The EG8041X7-10 WebUI submits RequestFile=html/bbsp/... and rejects |
| apps/zte_manager/infrastructure/huawei/client.py | 202 | Decode only slashes inside RequestFile; leave every other query value |
| apps/zte_manager/infrastructure/huawei/client.py | 273 | "X-Requested-With": "XMLHttpRequest", |
| apps/zte_manager/infrastructure/huawei/client.py | 294 | ).decode("ascii"), |
| apps/zte_manager/infrastructure/huawei/client.py | 317 | "X-Requested-With": "XMLHttpRequest", |
| apps/zte_manager/infrastructure/huawei/client.py | 399 | def extract_token(html: str) -> str: |
| apps/zte_manager/infrastructure/huawei/client.py | 408 | html or "", |
| apps/zte_manager/infrastructure/huawei/client.py | 468 | "X-Requested-With": "XMLHttpRequest", |
| apps/zte_manager/infrastructure/huawei/client.py | 525 | "text/html,application/xhtml+xml," |
| apps/zte_manager/infrastructure/huawei/client.py | 526 | "application/xml;q=0.9,*/*;q=0.8" |
| apps/zte_manager/infrastructure/huawei/negotiating_client.py | 8 | from urllib.parse import urlsplit, urlunsplit |
| apps/zte_manager/infrastructure/huawei/negotiating_client.py | 106 | def _effective_port(parsed) -> int \| None: |
| apps/zte_manager/infrastructure/huawei/negotiating_client.py | 108 | if parsed.port is not None: |
| apps/zte_manager/infrastructure/huawei/negotiating_client.py | 109 | return parsed.port |
| apps/zte_manager/infrastructure/huawei/negotiating_client.py | 112 | if parsed.scheme == "https": |
| apps/zte_manager/infrastructure/huawei/negotiating_client.py | 114 | if parsed.scheme == "http": |
| apps/zte_manager/infrastructure/huawei/negotiating_client.py | 133 | if parse_huawei_https_bootstrap(text) is not None: |
| apps/zte_manager/infrastructure/huawei/negotiating_client.py | 144 | if "<html" in folded or "<script" in folded: |
| apps/zte_manager/infrastructure/huawei/negotiating_client.py | 145 | return "html" |
| apps/zte_manager/infrastructure/huawei/negotiating_client.py | 166 | parsed = urlsplit(raw_url) |
| apps/zte_manager/infrastructure/huawei/negotiating_client.py | 175 | f"scheme={parsed.scheme or 'unknown'} " |
| apps/zte_manager/infrastructure/huawei/negotiating_client.py | 176 | f"port={_effective_port(parsed) or 'unknown'} " |
| apps/zte_manager/infrastructure/huawei/negotiating_client.py | 177 | f"path={parsed.path or '/'} " |
| apps/zte_manager/infrastructure/huawei/negotiating_client.py | 191 | parsed = urlsplit(str(url or "")) |
| apps/zte_manager/infrastructure/huawei/negotiating_client.py | 195 | f"scheme={parsed.scheme or 'unknown'} " |
| apps/zte_manager/infrastructure/huawei/negotiating_client.py | 196 | f"port={_effective_port(parsed) or 'unknown'} " |
| apps/zte_manager/infrastructure/huawei/negotiating_client.py | 197 | f"path={parsed.path or '/'} " |
| apps/zte_manager/infrastructure/huawei/negotiating_client.py | 231 | def parse_huawei_https_bootstrap(source: str) -> int \| None: |
| apps/zte_manager/infrastructure/huawei/negotiating_client.py | 253 | parsed = urlsplit(value) |
| apps/zte_manager/infrastructure/huawei/negotiating_client.py | 254 | if not parsed.hostname: |
| apps/zte_manager/infrastructure/huawei/negotiating_client.py | 257 | port = parsed.port |
| apps/zte_manager/infrastructure/huawei/negotiating_client.py | 269 | scheme=(parsed.scheme or ("https" if https else "http")).lower(), |
| apps/zte_manager/infrastructure/huawei/negotiating_client.py | 270 | host=parsed.hostname, |
| apps/zte_manager/infrastructure/huawei/negotiating_client.py | 296 | if path.endswith("/html/ssmp/common/getrandstring.asp"): |
| apps/zte_manager/infrastructure/huawei/negotiating_client.py | 302 | if path.endswith("/html/ssmp/deviceinfo/deviceinfo.asp"): |
| apps/zte_manager/infrastructure/huawei/negotiating_client.py | 384 | ssl_port = parse_huawei_https_bootstrap(body) |
| apps/zte_manager/infrastructure/huawei/negotiating_client.py | 455 | ssl_port = parse_huawei_https_bootstrap(response.text or "") |
| apps/zte_manager/infrastructure/huawei/protocol.py | 75 | and "<html" not in lower |
| apps/zte_manager/infrastructure/huawei/protocol.py | 150 | if path.casefold().startswith(("/html/amp/", "/html/bbsp/", "/html/ssmp/", "/html/status/")) |
| apps/zte_manager/infrastructure/huawei/protocol.py | 167 | for marker in ("/html/amp/", "/html/bbsp/", "/html/ssmp/", "/html/status/") |
| apps/zte_manager/infrastructure/huawei/protocol.py | 169 | return HuaweiProtocolFamily.AMP_BBSP, ("html-family-marker",) |
| apps/zte_manager/infrastructure/huawei/__init__.py | 10 | from .codec import decode_huawei_js_string |
| apps/zte_manager/infrastructure/huawei/__init__.py | 23 | from .js_parser import HuaweiJsConstructorParser, parse_huawei_js_constructors |
| apps/zte_manager/infrastructure/huawei/__init__.py | 29 | parse_huawei_https_bootstrap, |
| apps/zte_manager/infrastructure/huawei/__init__.py | 36 | from .response import HuaweiResponse, HuaweiResponseParser, decode_huawei_hex_payload |
| apps/zte_manager/infrastructure/huawei/__init__.py | 65 | "HuaweiJsConstructorParser", |
| apps/zte_manager/infrastructure/huawei/__init__.py | 80 | "HuaweiResponseParser", |
| apps/zte_manager/infrastructure/huawei/__init__.py | 85 | "decode_huawei_hex_payload", |
| apps/zte_manager/infrastructure/huawei/__init__.py | 86 | "decode_huawei_js_string", |
| apps/zte_manager/infrastructure/huawei/__init__.py | 88 | "parse_huawei_https_bootstrap", |
| apps/zte_manager/infrastructure/huawei/__init__.py | 89 | "parse_huawei_js_constructors", |
| apps/zte_manager/infrastructure/huawei/js_parser.py | 7 | from .codec import decode_huawei_js_string |
| apps/zte_manager/infrastructure/huawei/js_parser.py | 12 | class HuaweiJsConstructorParser: |
| apps/zte_manager/infrastructure/huawei/js_parser.py | 13 | """Structural parser for Huawei generated ``new Constructor(...)`` data. |
| apps/zte_manager/infrastructure/huawei/js_parser.py | 15 | The parser never executes page JavaScript. It understands quotes, escapes, |
| apps/zte_manager/infrastructure/huawei/js_parser.py | 98 | return decode_huawei_js_string(value[1:-1]) |
| apps/zte_manager/infrastructure/huawei/js_parser.py | 116 | return decode_huawei_js_string(value) |
| apps/zte_manager/infrastructure/huawei/js_parser.py | 153 | def parse( |
| apps/zte_manager/infrastructure/huawei/js_parser.py | 199 | def parse_huawei_js_constructors( |
| apps/zte_manager/infrastructure/huawei/js_parser.py | 205 | return HuaweiJsConstructorParser(schemas=schemas).parse( |
| apps/zte_manager/infrastructure/huawei/cli.py | 151 | return data.decode("utf-8", errors="replace") |
| apps/zte_manager/infrastructure/huawei/cli.py | 214 | return raw.decode("utf-8", errors="replace") |
| apps/zte_manager/infrastructure/huawei/auth.py | 6 | import xml.etree.ElementTree as ET |
| apps/zte_manager/infrastructure/huawei/auth.py | 59 | return base64.b64encode(str(password).encode("utf-8")).decode("ascii") |
| apps/zte_manager/infrastructure/huawei/auth.py | 151 | def parse_session_token_info(cls, source: object) -> ApiSesTokenContext: |
| apps/zte_manager/infrastructure/huawei/auth.py | 159 | data = json.loads(text) |
| apps/zte_manager/infrastructure/huawei/auth.py | 160 | except (TypeError, ValueError, json.JSONDecodeError): |
| apps/zte_manager/infrastructure/huawei/auth.py | 168 | except ET.ParseError as exc: |
| apps/zte_manager/infrastructure/huawei/auth.py | 169 | raise ValueError("Huawei SesTokenInfo is neither JSON nor XML") from exc |
| apps/zte_manager/infrastructure/huawei/auth.py | 214 | return base64.b64encode(str(password).encode("utf-8")).decode("ascii") |
| apps/zte_manager/infrastructure/huawei/auth.py | 227 | return base64.b64encode(digest_hex.encode("ascii")).decode("ascii") |
| apps/zte_manager/infrastructure/huawei/diagnostic_result.py | 17 | def _decode_string_expression_node(node: ast.AST) -> str: |
| apps/zte_manager/infrastructure/huawei/diagnostic_result.py | 18 | """Decode only string constants joined with ``+``. |
| apps/zte_manager/infrastructure/huawei/diagnostic_result.py | 22 | Python's AST can parse that subset without executing it. Any name, call, |
| apps/zte_manager/infrastructure/huawei/diagnostic_result.py | 30 | _decode_string_expression_node(node.left) |
| apps/zte_manager/infrastructure/huawei/diagnostic_result.py | 31 | + _decode_string_expression_node(node.right) |
| apps/zte_manager/infrastructure/huawei/diagnostic_result.py | 42 | expression is still parsed by the restrictive AST decoder below, so router |
| apps/zte_manager/infrastructure/huawei/diagnostic_result.py | 53 | def decode_huawei_diagnostic_result(source: object) -> tuple[str, str]: |
| apps/zte_manager/infrastructure/huawei/diagnostic_result.py | 54 | """Decode a Huawei Get*Result.asp frame without evaluating router code. |
| apps/zte_manager/infrastructure/huawei/diagnostic_result.py | 57 | - already-decoded plain text containing ``[@#@]``; |
| apps/zte_manager/infrastructure/huawei/diagnostic_result.py | 72 | decoded: str \| None = None |
| apps/zte_manager/infrastructure/huawei/diagnostic_result.py | 76 | parsed = ast.parse(expression, mode="eval") |
| apps/zte_manager/infrastructure/huawei/diagnostic_result.py | 77 | decoded = _decode_string_expression_node(parsed.body) |
| apps/zte_manager/infrastructure/huawei/diagnostic_result.py | 85 | decoded = literal |
| apps/zte_manager/infrastructure/huawei/diagnostic_result.py | 87 | if decoded is not None: |
| apps/zte_manager/infrastructure/huawei/diagnostic_result.py | 88 | text = decoded |
| apps/zte_manager/infrastructure/huawei/response.py | 15 | _HTML_MARKERS = ("<!doctype html", "<html", "<body", "<head") |
| apps/zte_manager/infrastructure/huawei/response.py | 79 | def decode_huawei_hex_payload(value: object) -> str: |
| apps/zte_manager/infrastructure/huawei/response.py | 80 | """Decode literal Huawei \\xNN response escapes without eval().""" |
| apps/zte_manager/infrastructure/huawei/response.py | 112 | class HuaweiResponseParser: |
| apps/zte_manager/infrastructure/huawei/response.py | 115 | This parser does *not* validate feature state. A 2xx HTML page, opaque text, |
| apps/zte_manager/infrastructure/huawei/response.py | 121 | def parse( |
| apps/zte_manager/infrastructure/huawei/response.py | 127 | text = decode_huawei_hex_payload(body).strip() |
| apps/zte_manager/infrastructure/huawei/response.py | 133 | full_html = any(marker in lower for marker in _HTML_MARKERS) |
| apps/zte_manager/infrastructure/huawei/response.py | 246 | candidate = json.loads(candidate) |
| apps/zte_manager/infrastructure/huawei/response.py | 247 | except (json.JSONDecodeError, TypeError): |
| apps/zte_manager/infrastructure/huawei/response.py | 254 | parsed = json.loads(stripped) |
| apps/zte_manager/infrastructure/huawei/response.py | 255 | except json.JSONDecodeError: |
| apps/zte_manager/infrastructure/huawei/response.py | 256 | parsed = None |
| apps/zte_manager/infrastructure/huawei/response.py | 257 | if parsed is not None: |
| apps/zte_manager/infrastructure/huawei/response.py | 258 | if isinstance(parsed, dict) and "result" in parsed: |
| apps/zte_manager/infrastructure/huawei/response.py | 259 | success = parsed.get("result") == 0 |
| apps/zte_manager/infrastructure/huawei/response.py | 261 | str(parsed.get("error") or "").strip() |
| apps/zte_manager/infrastructure/huawei/response.py | 270 | f"result={parsed.get('result')!r} " |
| apps/zte_manager/infrastructure/huawei/response.py | 293 | data=parsed, |
| apps/zte_manager/infrastructure/huawei/response.py | 301 | data=parsed, |
| apps/zte_manager/infrastructure/huawei/response.py | 320 | if not full_html: |
| apps/zte_manager/infrastructure/huawei/response.py | 353 | "text/html" in str(content_type or "").casefold() |
| apps/zte_manager/infrastructure/huawei/response.py | 354 | or full_html |
| apps/zte_manager/infrastructure/huawei/response.py | 361 | response_type="html", |
| apps/zte_manager/infrastructure/huawei/codec.py | 9 | def decode_huawei_js_string(value: str) -> str: |
| apps/zte_manager/infrastructure/huawei/codec.py | 10 | """Decode Huawei JavaScript string escapes without firmware-specific hacks. |
| apps/zte_manager/infrastructure/huawei/codec.py | 13 | JavaScript escapes. Decode every valid hexadecimal byte first, then let the |
| apps/zte_manager/infrastructure/huawei/codec.py | 14 | JSON string decoder handle ordinary JavaScript/JSON escapes. |
| apps/zte_manager/infrastructure/huawei/codec.py | 19 | return json.loads(f'"{text}"') |
| apps/zte_manager/infrastructure/huawei/codec.py | 20 | except (json.JSONDecodeError, TypeError): |
| apps/zte_manager/infrastructure/huawei/family_client.py | 4 | from urllib.parse import urljoin |
| apps/zte_manager/infrastructure/huawei/family_client.py | 34 | RAND_STRING_PATH = "/html/ssmp/common/getRandString.asp" |
| apps/zte_manager/infrastructure/huawei/family_client.py | 35 | SESSION_TOKEN_PATH = "/html/ssmp/common/GetRandToken.asp" |
| apps/zte_manager/infrastructure/huawei/family_client.py | 36 | DEVICE_INFO_PATH = "/html/ssmp/deviceinfo/deviceinfo.asp" |
| apps/zte_manager/infrastructure/huawei/family_client.py | 130 | ApiSesTokenAuth.parse_session_token_info(api.text) |
| apps/zte_manager/infrastructure/huawei/family_client.py | 171 | "X-Requested-With": "XMLHttpRequest", |
| apps/zte_manager/infrastructure/huawei/family_client.py | 209 | "Accept": "application/json,text/xml,application/xml,*/*", |
| apps/zte_manager/infrastructure/huawei/family_client.py | 218 | context = self._api_auth.parse_session_token_info(response.text) |
| apps/zte_manager/infrastructure/huawei/family_client.py | 240 | "<html", |
| apps/zte_manager/infrastructure/huawei/family_client.py | 257 | context = self._api_auth.parse_session_token_info( |
| apps/zte_manager/infrastructure/huawei/family_client.py | 267 | def _api_login_script_sources(self, login_html: str) -> list[str]: |
| apps/zte_manager/infrastructure/huawei/family_client.py | 268 | sources = [str(login_html or "")] |
| apps/zte_manager/infrastructure/huawei/family_client.py | 272 | login_html or "", |
| apps/zte_manager/infrastructure/huawei/family_client.py | 300 | def _resolve_api_password_mode(self, login_html: str) -> str: |
| apps/zte_manager/infrastructure/huawei/family_client.py | 307 | "\n".join(self._api_login_script_sources(login_html)) |
| apps/zte_manager/infrastructure/huawei/family_client.py | 319 | def _select_auth_flow(self, login_html: str) -> HuaweiAuthFlow: |
| apps/zte_manager/infrastructure/huawei/family_client.py | 320 | explicit = auth_flow_from_login_page(login_html) |
| apps/zte_manager/infrastructure/huawei/family_client.py | 429 | "X-Requested-With": "XMLHttpRequest", |
| apps/zte_manager/infrastructure/huawei/family_client.py | 441 | self._record_family("/html/bbsp/") |
| apps/zte_manager/infrastructure/huawei/family_client.py | 514 | "Referer": self.url("/html/index.html"), |
| apps/zte_manager/infrastructure/huawei/family_client.py | 536 | "Accept": "application/json,text/xml,application/xml,*/*", |
| apps/zte_manager/infrastructure/huawei/family_client.py | 537 | "Referer": self.url("/html/index.html"), |
| apps/zte_manager/infrastructure/huawei/family_client.py | 571 | "Accept": "application/json,text/xml,application/xml,*/*", |
| apps/zte_manager/infrastructure/huawei/family_client.py | 572 | "Referer": self.url("/html/index.html"), |
| apps/zte_manager/infrastructure/huawei/transport.py | 10 | from urllib.parse import urlencode, urlsplit |
| apps/zte_manager/infrastructure/huawei/transport.py | 87 | parsed = urlsplit(supplied) |
| apps/zte_manager/infrastructure/huawei/transport.py | 89 | port = parsed.port |
| apps/zte_manager/infrastructure/huawei/transport.py | 93 | preferred_scheme=(parsed.scheme or ("https" if https else "http")), |
| apps/zte_manager/infrastructure/huawei/transport.py | 254 | parsed = urlsplit(raw) |
| apps/zte_manager/infrastructure/huawei/transport.py | 255 | target = parsed.path or "/" |
| apps/zte_manager/infrastructure/huawei/transport.py | 256 | if parsed.query: |
| apps/zte_manager/infrastructure/huawei/transport.py | 257 | target += "?" + parsed.query |
| apps/zte_manager/infrastructure/huawei/transport.py | 316 | text = content.decode(charset, errors="replace") |
| apps/zte_manager/infrastructure/huawei/transport.py | 318 | text = content.decode("utf-8-sig", errors="replace") |
| apps/zte_manager/infrastructure/huawei/transport.py | 356 | parsed = urlsplit(self.base_url) |
| apps/zte_manager/infrastructure/huawei/transport.py | 357 | if parsed.scheme not in {"http", "https"} or not parsed.hostname: |
| apps/zte_manager/infrastructure/huawei/transport.py | 365 | self.scheme = parsed.scheme |
| apps/zte_manager/infrastructure/huawei/transport.py | 366 | self.host = parsed.hostname |
| apps/zte_manager/infrastructure/huawei/transport.py | 367 | self.port = parsed.port or (443 if parsed.scheme == "https" else 80) |
| apps/zte_manager/infrastructure/huawei/transport.py | 368 | self.base_path = parsed.path or "" |
| apps/zte_manager/infrastructure/huawei/transport.py | 411 | parsed = SimpleCookie() |
| apps/zte_manager/infrastructure/huawei/transport.py | 413 | parsed.load(value) |
| apps/zte_manager/infrastructure/huawei/transport.py | 416 | for morsel in parsed.values(): |
| apps/zte_manager/infrastructure/huawei/single_write.py | 6 | from urllib.parse import urlencode, urlsplit |
| apps/zte_manager/infrastructure/huawei/single_write.py | 46 | parsed = urlsplit(str(base_url or "")) |
| apps/zte_manager/infrastructure/huawei/single_write.py | 47 | if parsed.scheme not in {"http", "https"} or not parsed.hostname: |
| apps/zte_manager/infrastructure/huawei/single_write.py | 49 | self.scheme = parsed.scheme |
| apps/zte_manager/infrastructure/huawei/single_write.py | 50 | self.host = parsed.hostname |
| apps/zte_manager/infrastructure/huawei/single_write.py | 51 | self.port = parsed.port or (443 if parsed.scheme == "https" else 80) |
| apps/zte_manager/infrastructure/huawei/single_write.py | 126 | first = raw_response.split(b"\r\n", 1)[0].decode("ascii", "replace") |
| apps/zte_manager/infrastructure/huawei/affinity_client.py | 40 | def _select_auth_flow(self, login_html: str): |
| apps/zte_manager/infrastructure/huawei/affinity_client.py | 42 | detected = endpoint_profile_from_login_source(login_html) |
| apps/zte_manager/infrastructure/huawei/affinity_client.py | 50 | return super()._select_auth_flow(login_html) |
| apps/zte_manager/infrastructure/huawei/affinity_client.py | 56 | "X-Requested-With": "XMLHttpRequest", |
| apps/zte_manager/infrastructure/huawei/affinity_client.py | 67 | "X-Requested-With": "XMLHttpRequest", |
| apps/zte_manager/infrastructure/huawei/affinity_client.py | 79 | self._record_family("/html/bbsp/") |
| apps/zte_manager/static/css/style.css | 59 | html { |
| apps/zte_manager/static/css/neutral_console.css | 6 | html[data-theme="dark"] { |
| apps/zte_manager/static/css/neutral_console.css | 68 | html[data-theme="light"] { |
| apps/zte_manager/static/css/neutral_console.css | 95 | html, body, #vela-page, .app-shell, .workspace, |
| apps/zte_manager/static/css/brmodelo_workbench.css | 8 | html[data-theme="light"] { |
| apps/zte_manager/static/css/brmodelo_workbench.css | 20 | html[data-theme="dark"] { |
| apps/zte_manager/static/css/telecom_console.css | 71 | html, |
| apps/zte_manager/static/css/telecom_console.css | 1950 | html, body, .app-shell, .workspace, .main-content { |
| apps/zte_manager/static/css/telecom_console.css | 2015 | html { |
| apps/zte_manager/static/js/advanced.js | 53 | value="${escapeHtml(radio.rts_cts ?? 2346)}"> |
| apps/zte_manager/static/js/advanced.js | 58 | value="${escapeHtml(radio.frag_threshold ?? 2346)}"> |
| apps/zte_manager/static/js/advanced.js | 63 | value="${escapeHtml(radio.dtim ?? 1)}"> |
| apps/zte_manager/static/js/advanced.js | 68 | value="${escapeHtml(radio.bandwidth_code ?? "")}"> |
| apps/zte_manager/static/js/advanced.js | 73 | value="${escapeHtml(radio.band_steering_policy ?? "")}"> |
| apps/zte_manager/static/js/advanced.js | 79 | value="${escapeHtml(radio.auto_channel_scope ?? "0")}"> |
| apps/zte_manager/static/js/advanced.js | 143 | value="${escapeHtml(radio.rts_cts ?? 2347)}"> |
| apps/zte_manager/static/js/advanced.js | 149 | value="${escapeHtml(radio.dtim ?? 1)}"> |
| apps/zte_manager/static/js/advanced.js | 155 | value="${escapeHtml(radio.qos_type ?? "")}"> |
| apps/zte_manager/static/js/advanced.js | 161 | value="${escapeHtml(radio.work_mode ?? "")}"> |
| apps/zte_manager/static/js/advanced.js | 276 | value="${escapeHtml(numberValue("rssi_limit_24g"))}"> |
| apps/zte_manager/static/js/advanced.js | 282 | value="${escapeHtml(numberValue("rssi_limit_5g"))}"> |
| apps/zte_manager/static/js/advanced.js | 288 | value="${escapeHtml(numberValue("bandwidth_util_24g"))}"> |
| apps/zte_manager/static/js/advanced.js | 294 | value="${escapeHtml(numberValue("bandwidth_util_5g"))}"> |
| apps/zte_manager/static/js/advanced.js | 300 | value="${escapeHtml(numberValue("accept_rssi_24g"))}"> |
| apps/zte_manager/static/js/advanced.js | 306 | value="${escapeHtml(numberValue("accept_rssi_5g"))}"> |
| apps/zte_manager/static/js/advanced.js | 312 | value="${escapeHtml(numberValue("idle_rate_limit_24g"))}"> |
| apps/zte_manager/static/js/advanced.js | 318 | value="${escapeHtml(numberValue("idle_rate_limit_5g"))}"> |
| apps/zte_manager/static/js/advanced.js | 410 | container.innerHTML = featureUnavailable( |
| apps/zte_manager/static/js/advanced.js | 434 | container.innerHTML = featureUnavailable( |
| apps/zte_manager/static/js/advanced.js | 441 | container.innerHTML = ` |
| apps/zte_manager/static/js/advanced.js | 494 | <input id="${id}" type="number" min="0" max="${max}" value="${escapeHtml(value ?? 0)}"> |
| apps/zte_manager/static/js/advanced.js | 767 | grid.innerHTML = features.length ? features.map(item => { |
| apps/zte_manager/static/js/advanced.js | 774 | invalid_xml: "Resposta do menu em formato inesperado", |
| apps/zte_manager/static/js/advanced.js | 787 | <strong>${escapeHtml(globalThis.AccessManagerInspector?.label(item.feature, item.label) \|\| "Funcionalidade do equipamento")}</strong> |
| apps/zte_manager/static/js/advanced.js | 788 | <p>${escapeHtml(label)}</p> |
| apps/zte_manager/static/js/advanced.js | 1491 | ).innerHTML = entries.length |
| apps/zte_manager/static/js/advanced.js | 1523 | <strong>${escapeHtml(globalThis.AccessManagerInspector?.label(key, spec.label) \|\| "Funcionalidade do equipamento")}</strong> |
| apps/zte_manager/static/js/advanced.js | 1524 | <p>${escapeHtml(stateText)}</p> |
| apps/zte_manager/static/js/advanced.js | 1639 | result.innerHTML = ` |
| apps/zte_manager/static/js/advanced.js | 1642 | <p>${escapeHtml(data.summary \|\| "-")}</p> |
| apps/zte_manager/static/js/advanced.js | 1647 | <div class="finding ${escapeHtml(item.severity \|\| "ok")}"> |
| apps/zte_manager/static/js/advanced.js | 1652 | <strong>${escapeHtml(item.code \|\| "diagnostic")}</strong> |
| apps/zte_manager/static/js/advanced.js | 1653 | <p>${escapeHtml(item.message \|\| "")}</p> |
| apps/zte_manager/static/js/advanced.js | 1664 | <p class="adaptive-footnote"><strong>${escapeHtml(section)}:</strong> |
| apps/zte_manager/static/js/advanced.js | 1665 | ${escapeHtml(String(reason).slice(0, 160))}</p> |
| apps/zte_manager/static/js/advanced.js | 1820 | ).innerHTML = featureUnavailable( |
| apps/zte_manager/static/js/advanced.js | 1827 | ).innerHTML = featureUnavailable( |
| apps/zte_manager/static/js/advanced.js | 1841 | container.innerHTML = items.length |
| apps/zte_manager/static/js/advanced.js | 1846 | <strong>${escapeHtml(item.HostName \|\| "Sem hostname")}</strong> |
| apps/zte_manager/static/js/advanced.js | 1847 | <small>${escapeHtml(item.ExpiredTime \|\| "-")}</small> |
| apps/zte_manager/static/js/advanced.js | 1850 | <span>${escapeHtml(item.IPAddr \|\| "-")}</span> |
| apps/zte_manager/static/js/advanced.js | 1851 | <span>${escapeHtml(item.MACAddr \|\| "-")}</span> |
| apps/zte_manager/static/js/advanced.js | 1852 | <span>${escapeHtml(item.PhyPortName \|\| "-")}</span> |
| apps/zte_manager/static/js/advanced.js | 1866 | container.innerHTML = items.length |
| apps/zte_manager/static/js/advanced.js | 1871 | <strong>${escapeHtml(item.Name \|\| "Reserva")}</strong> |
| apps/zte_manager/static/js/advanced.js | 1878 | <span>${escapeHtml(item.IPAddr \|\| "-")}</span> |
| apps/zte_manager/static/js/advanced.js | 1879 | <span>${escapeHtml(item.MACAddr \|\| "-")}</span> |
| apps/zte_manager/static/js/advanced.js | 2085 | forwarding.innerHTML = featureUnavailable( |
| apps/zte_manager/static/js/advanced.js | 2125 | container.innerHTML = featureUnavailable( |
| apps/zte_manager/static/js/advanced.js | 2141 | container.innerHTML = items.length |
| apps/zte_manager/static/js/advanced.js | 2146 | <strong>${escapeHtml(item.Alias \|\| item.Description \|\| "Regra NAT")}</strong> |
| apps/zte_manager/static/js/advanced.js | 2153 | <span>${escapeHtml(item.Protocol \|\| "-")}</span> |
| apps/zte_manager/static/js/advanced.js | 2154 | <span>${escapeHtml(item.ExternalPort \|\| "-")} → ${escapeHtml(item.InternalClient \|\| "-")}:${escapeHtml(item.InternalPort \|\| "-")}</span> |
| apps/zte_manager/static/js/advanced.js | 2331 | container.innerHTML = item._InstID |
| apps/zte_manager/static/js/advanced.js | 2337 | <span>${escapeHtml(item.InternalClient \|\| "-")}</span> |
| apps/zte_manager/static/js/advanced.js | 2338 | <span>${escapeHtml(item.WANCViewName \|\| "-")}</span> |
| apps/zte_manager/static/js/advanced.js | 2349 | container.innerHTML = featureUnavailable( |
| apps/zte_manager/static/js/advanced.js | 2531 | <strong>${escapeHtml(title)} indisponível</strong> |
| apps/zte_manager/static/js/advanced.js | 2532 | <p>${escapeHtml(normalizeApiErrorMessage(message \|\| "O firmware ou login não oferece este recurso."))}</p> |
| apps/zte_manager/static/js/advanced.js | 2776 | list.innerHTML = ( |
| apps/zte_manager/static/js/advanced.js | 2784 | list.innerHTML = rules.map( |
| apps/zte_manager/static/js/advanced.js | 2793 | <strong>${escapeHtml(rule.name \|\| "Sem nome")}</strong> |
| apps/zte_manager/static/js/advanced.js | 2794 | <small>${escapeHtml(rule.domain \|\| "")}</small> |
| apps/zte_manager/static/js/advanced.js | 2796 | <span class="badge">${escapeHtml(rule.protocol \|\| "—")}</span> |
| apps/zte_manager/static/js/advanced.js | 2800 | ${escapeHtml(rule.direction \|\| "—")} |
| apps/zte_manager/static/js/advanced.js | 2804 | ${escapeHtml(rule.lan_start_ip \|\| "—")} |
| apps/zte_manager/static/js/advanced.js | 2806 | ${escapeHtml(rule.lan_end_ip \|\| "—")} |
| apps/zte_manager/static/js/advanced.js | 2810 | ${escapeHtml(rule.wan_start_ip \|\| "—")} |
| apps/zte_manager/static/js/advanced.js | 2812 | ${escapeHtml(rule.wan_end_ip \|\| "—")} |
| apps/zte_manager/static/js/advanced.js | 2816 | ${escapeHtml(huaweiRulePortSummary(rule))} |
| apps/zte_manager/static/js/advanced.js | 2873 | status.innerHTML = ( |
| apps/zte_manager/static/js/adaptive_firmware.js | 2 | The API supplies already-whitelisted fields; never display raw CMAPI/XML. |
| apps/zte_manager/static/js/adaptive_firmware.js | 108 | "secret=", "traceback", "<html", "<script", "<?xml"].some( |
| apps/zte_manager/static/js/adaptive_firmware.js | 176 | unexpected_xml_object: "O firmware respondeu, mas não retornou o objeto esperado para esta função.", |
| apps/zte_manager/static/js/adaptive_firmware.js | 178 | invalid_xml: "A resposta do equipamento não corresponde ao formato XML esperado.", |
| apps/zte_manager/static/js/adaptive_firmware.js | 241 | // Internal URLs, parser errors and route names belong in |
| apps/zte_manager/static/js/adaptive_firmware.js | 418 | capture are available ON DEMAND. XML values never reach this interface. */ |
| apps/zte_manager/static/js/f6201b_editor.js | 11 | const safe = value => escapeHtml(String(value ?? "-")); |
| apps/zte_manager/static/js/f6201b_editor.js | 89 | unexpected_xml_object:"O firmware não retornou o objeto esperado.", |
| apps/zte_manager/static/js/f6201b_editor.js | 90 | invalid_xml:"A resposta não corresponde ao menu esperado.", |
| apps/zte_manager/static/js/f6201b_editor.js | 108 | root.innerHTML = failure("Redes Wi-Fi", |
| apps/zte_manager/static/js/f6201b_editor.js | 113 | root.innerHTML = ssids.map(network => ` |
| apps/zte_manager/static/js/f6201b_editor.js | 240 | if(run===epoch) root.innerHTML = failure("Redes Wi-Fi", |
| apps/zte_manager/static/js/f6201b_editor.js | 248 | // Só renderizar quando XML COMPLETO for confirmado na ONT. |
| apps/zte_manager/static/js/f6201b_editor.js | 254 | if (!section?.available) radios.innerHTML= |
| apps/zte_manager/static/js/f6201b_editor.js | 258 | radios.innerHTML=rows.map(row=>` |
| apps/zte_manager/static/js/f6201b_editor.js | 286 | if(run===epoch)radios.innerHTML=failure( |
| apps/zte_manager/static/js/f6201b_editor.js | 301 | if (!section?.available) {root.innerHTML=nativeInfo(title,section);continue;} |
| apps/zte_manager/static/js/f6201b_editor.js | 303 | root.innerHTML=rows.map(row=>` |
| apps/zte_manager/static/js/f6201b_editor.js | 316 | }catch(error){if(run===epoch)root.innerHTML=failure(title,"Consulta falhou.");} |
| apps/zte_manager/static/js/f6201b_editor.js | 328 | if(!section?.available){container.innerHTML=nativeInfo(name,section);continue;} |
| apps/zte_manager/static/js/f6201b_editor.js | 331 | container.innerHTML=records.map(item=>renderWanCard(item)).join(""); |
| apps/zte_manager/static/js/f6201b_editor.js | 333 | container.innerHTML=records.map(port=>` |
| apps/zte_manager/static/js/f6201b_editor.js | 340 | container.innerHTML=records.map(row=>` |
| apps/zte_manager/static/js/f6201b_editor.js | 346 | const pppoe=$("pppoeDetails");if(pppoe)pppoe.innerHTML=failure( |
| apps/zte_manager/static/js/f6201b_editor.js | 351 | if(node&&run===epoch)node.innerHTML=failure(name,"Leitura falhou."); |
| apps/zte_manager/static/js/f6201b_editor.js | 368 | if(lan)lan.innerHTML='<tr><td colspan="3" class="empty-table">Dispositivos Ethernet ativos ainda não confirmados neste firmware. Leases DHCP não indicam conexão atual.</td></tr>'; |
| apps/zte_manager/static/js/f6201b_editor.js | 385 | if(summary)summary.innerHTML=wan?.available&&wan.data?.length? |
| apps/zte_manager/static/js/f6201b_editor.js | 391 | try{await readSsids(run);if(run===epoch)nets.innerHTML=ssids.map(net=>` |
| apps/zte_manager/static/js/f6201b_editor.js | 400 | catch(error){nets.innerHTML=nativeInfo("Redes Wi-Fi",null);} |
| apps/zte_manager/static/js/f6201b_editor.js | 410 | if(pppoe)pppoe.innerHTML= |
| apps/zte_manager/static/js/f6201b_editor.js | 417 | dns.innerHTML=section?.available? |
| apps/zte_manager/static/js/f6201b_editor.js | 444 | if(!section?.available){node.innerHTML=nativeInfo(name,section);continue;} |
| apps/zte_manager/static/js/f6201b_editor.js | 446 | node.innerHTML=groups.map(([k,entries])=> |
| apps/zte_manager/static/js/f6201b_editor.js | 452 | }catch(error){if(run===epoch)node.innerHTML=failure(name,"Leitura falhou.");} |
| apps/zte_manager/static/js/dhcp_module.js | 30 | label.innerHTML = '<span>Gateway DHCP</span>'; |
| apps/zte_manager/static/js/support_diagnostics.js | 33 | return node.innerHTML; |
| apps/zte_manager/static/js/support_diagnostics.js | 316 | output.innerHTML = |
| apps/zte_manager/static/js/support_diagnostics.js | 655 | container.innerHTML = relevant.length |
| apps/zte_manager/static/js/support_diagnostics.js | 688 | container.innerHTML = ` |
| apps/zte_manager/static/js/support_diagnostics.js | 739 | select.innerHTML = ` |
| apps/zte_manager/static/js/support_diagnostics.js | 809 | const html = render(); |
| apps/zte_manager/static/js/support_diagnostics.js | 810 | if (html) output.insertAdjacentHTML("beforeend", html); |
| apps/zte_manager/static/js/support_diagnostics.js | 1585 | output.innerHTML = renderSpeedTest({ |
| apps/zte_manager/static/js/support_diagnostics.js | 1617 | container.innerHTML = ` |
| apps/zte_manager/static/js/support_diagnostics.js | 1898 | panel.innerHTML = ` |
| apps/zte_manager/static/js/management.js | 31 | return node.innerHTML; |
| apps/zte_manager/static/js/management.js | 58 | function managementParseJson(id) { |
| apps/zte_manager/static/js/management.js | 65 | config = JSON.parse(raw); |
| apps/zte_manager/static/js/management.js | 84 | // Campos são inseridos com textContent (sem interpretar HTML do firmware). |
| apps/zte_manager/static/js/management.js | 421 | select.innerHTML = options \|\| '<option value="">Nenhum perfil</option>'; |
| apps/zte_manager/static/js/management.js | 449 | select.innerHTML = managementState.agents.map( |
| apps/zte_manager/static/js/management.js | 473 | list.innerHTML = managementState.agents.length |
| apps/zte_manager/static/js/management.js | 541 | list.innerHTML = managementState.incidents.length |
| apps/zte_manager/static/js/management.js | 579 | list.innerHTML = items.length |
| apps/zte_manager/static/js/management.js | 652 | list.innerHTML = managementState.firmware.length |
| apps/zte_manager/static/js/management.js | 833 | root.innerHTML = order.length |
| apps/zte_manager/static/js/management.js | 902 | const config = managementParseJson( |
| apps/zte_manager/static/js/management.js | 1029 | let payload = managementParseJson( |
| apps/zte_manager/static/js/management.js | 1430 | chart.innerHTML = '<div class="support-empty">Aguardando pelo menos duas leituras ópticas.</div>'; |
| apps/zte_manager/static/js/management.js | 1493 | chart.innerHTML = ` |
| apps/zte_manager/static/js/management.js | 1516 | events.innerHTML = items.length |
| apps/zte_manager/static/js/management.js | 2116 | config: managementParseJson( |
| apps/zte_manager/static/js/management.js | 2194 | config: managementParseJson( |
| apps/zte_manager/static/js/management.js | 2278 | config: managementParseJson( |
| apps/zte_manager/static/js/management.js | 2307 | config: managementParseJson( |
| apps/zte_manager/static/js/management.js | 2341 | config: managementParseJson( |
| apps/zte_manager/static/js/management.js | 2376 | config: managementParseJson( |
| apps/zte_manager/static/js/management.js | 2414 | config: managementParseJson( |
| apps/zte_manager/static/js/management.js | 2525 | config: managementParseJson( |
| apps/zte_manager/static/js/f6201b_workbench.js | 258 | "O XML não devolveu todos os campos exigidos: " + |
| apps/zte_manager/static/js/tangerine_forms.js | 98 | initial = JSON.parse(source.value \|\| "{}"); |
| apps/zte_manager/static/js/neutral_theme.js | 47 | // This is also set by the inline bootstrap in index.html before CSS loads. |
| apps/zte_manager/static/js/frontend_bootstrap.js | 14 | escapeHtml: globalThis.escapeHtml, |
| apps/zte_manager/static/js/app.js | 45 | /(?:\b(?:GET\|POST\|PUT\|PATCH\|DELETE)\s+\/\|https?:\/\/\|traceback\|stack trace\|\b(?:sql\|querystring\|request body)\b\|\b(?:TypeError\|KeyError\|AttributeError\|ValueError)\b\|<\/?(?:html\|body\|pre\|script)\|\{["']\|["']\s*:\s*["']\|HTTP\/?\d\|\b(?:500\|404) Internal Server Error\b)/i.test(value)) { |
| apps/zte_manager/static/js/app.js | 1253 | ).innerHTML = ` |
| apps/zte_manager/static/js/app.js | 1304 | container.innerHTML = ` |
| apps/zte_manager/static/js/app.js | 1308 | <strong>${escapeHtml(rx)}</strong> |
| apps/zte_manager/static/js/app.js | 1313 | <h3>${escapeHtml(data.registration_status ?? "Status não informado")}</h3> |
| apps/zte_manager/static/js/app.js | 1314 | <p>ONU ${escapeHtml(data.onu_id ?? "-")} • LOS ${escapeHtml(data.los ?? "-")}</p> |
| apps/zte_manager/static/js/app.js | 1334 | container.innerHTML = ` |
| apps/zte_manager/static/js/app.js | 1339 | <p>${escapeHtml(error.message)}</p> |
| apps/zte_manager/static/js/app.js | 1373 | summary.innerHTML = ( |
| apps/zte_manager/static/js/app.js | 1377 | page.innerHTML = ( |
| apps/zte_manager/static/js/app.js | 1394 | summary.innerHTML = ` |
| apps/zte_manager/static/js/app.js | 1405 | page.innerHTML = connections |
| apps/zte_manager/static/js/app.js | 1430 | <span class="section-kicker">${escapeHtml(wan.wan_type ?? wan.tipo ?? "WAN")}</span> |
| apps/zte_manager/static/js/app.js | 1431 | <h3>${escapeHtml(wan.nome ?? "WAN")}</h3> |
| apps/zte_manager/static/js/app.js | 1432 | <p>${escapeHtml(wan.id ?? "-")}</p> |
| apps/zte_manager/static/js/app.js | 1440 | <strong class="mono">${escapeHtml(wan.ip ?? "-")}</strong> |
| apps/zte_manager/static/js/app.js | 1441 | <small>GW ${escapeHtml(wan.gateway ?? "-")}</small> |
| apps/zte_manager/static/js/app.js | 1453 | ${wan.ipv6 ? `<div class="wan-ipv6 mono">${escapeHtml(wan.ipv6)}</div>` : ""} |
| apps/zte_manager/static/js/app.js | 1454 | ${wan.erro ? `<div class="wan-error">${escapeHtml(wan.erro)}</div>` : ""} |
| apps/zte_manager/static/js/app.js | 1511 | container.innerHTML = ( |
| apps/zte_manager/static/js/app.js | 1518 | container.innerHTML = items |
| apps/zte_manager/static/js/app.js | 1524 | <span class="section-kicker">${escapeHtml(item.nome ?? "PPPoE")}</span> |
| apps/zte_manager/static/js/app.js | 1525 | <strong>${escapeHtml(item.username ?? "-")}</strong> |
| apps/zte_manager/static/js/app.js | 1532 | <strong class="mono">${escapeHtml(item.password ?? "-")}</strong> |
| apps/zte_manager/static/js/app.js | 1537 | <span>AUTH <strong>${escapeHtml(item.auth_type ?? "-")}</strong></span> |
| apps/zte_manager/static/js/app.js | 1538 | <span>VLAN <strong>${escapeHtml(item.vlan ?? "-")}</strong></span> |
| apps/zte_manager/static/js/app.js | 1539 | <span>MTU <strong>${escapeHtml(item.mtu ?? "-")}</strong></span> |
| apps/zte_manager/static/js/app.js | 1568 | container.innerHTML = ( |
| apps/zte_manager/static/js/app.js | 1575 | container.innerHTML = ports |
| apps/zte_manager/static/js/app.js | 1585 | <span class="port-number">LAN ${escapeHtml(port.port)}</span> |
| apps/zte_manager/static/js/app.js | 1588 | <strong>${escapeHtml(port.speed ?? "-")}</strong> |
| apps/zte_manager/static/js/app.js | 1589 | <small>${escapeHtml(port.duplex ?? "-")} • ${escapeHtml(port.status ?? "-")}</small> |
| apps/zte_manager/static/js/app.js | 1602 | container.innerHTML = ` |
| apps/zte_manager/static/js/app.js | 1607 | <p>${escapeHtml(error.message)}</p> |
| apps/zte_manager/static/js/app.js | 1635 | container.innerHTML = ` |
| apps/zte_manager/static/js/app.js | 1656 | container.innerHTML = ` |
| apps/zte_manager/static/js/app.js | 1681 | <input data-field="wan" type="text" value="${escapeHtml(cachedUpnp.wan ?? "")}"> |
| apps/zte_manager/static/js/app.js | 1685 | <input data-field="wan_ipv6" type="text" value="${escapeHtml(cachedUpnp.wan_ipv6 ?? "")}"> |
| apps/zte_manager/static/js/app.js | 1689 | <input data-field="advertisement_period" type="number" min="4" max="1440" value="${escapeHtml(cachedUpnp.advertisement_period ?? 30)}"> |
| apps/zte_manager/static/js/app.js | 1693 | <input data-field="ttl" type="number" min="1" max="255" value="${escapeHtml(cachedUpnp.ttl ?? 4)}"> |
| apps/zte_manager/static/js/app.js | 1698 | <span class="radio-id">${escapeHtml(cachedUpnp.id ?? "OBJ_UPNPCONFIG_ID")}</span> |
| apps/zte_manager/static/js/app.js | 1719 | container.innerHTML = ` |
| apps/zte_manager/static/js/app.js | 1724 | <p>${escapeHtml(error.message)}</p> |
| apps/zte_manager/static/js/app.js | 1832 | ).innerHTML = ` |
| apps/zte_manager/static/js/app.js | 1837 | <p>${escapeHtml(error.message)}</p> |
| apps/zte_manager/static/js/app.js | 1858 | container.innerHTML = ` |
| apps/zte_manager/static/js/app.js | 1872 | container.innerHTML = ` |
| apps/zte_manager/static/js/app.js | 1899 | <span>RSSI 2.4G <strong>${escapeHtml(params.rssi_limit_24g ?? "-")}</strong></span> |
| apps/zte_manager/static/js/app.js | 1900 | <span>RSSI 5G <strong>${escapeHtml(params.rssi_limit_5g ?? "-")}</strong></span> |
| apps/zte_manager/static/js/app.js | 1901 | <span>Util. 2.4G <strong>${escapeHtml(params.bandwidth_util_24g ?? "-")}%</strong></span> |
| apps/zte_manager/static/js/app.js | 1902 | <span>Util. 5G <strong>${escapeHtml(params.bandwidth_util_5g ?? "-")}%</strong></span> |
| apps/zte_manager/static/js/app.js | 1925 | container.innerHTML = ` |
| apps/zte_manager/static/js/app.js | 1930 | <p>${escapeHtml(error.message)}</p> |
| apps/zte_manager/static/js/app.js | 1988 | dashboard.innerHTML = ( |
| apps/zte_manager/static/js/app.js | 1992 | page.innerHTML = ( |
| apps/zte_manager/static/js/app.js | 1999 | dashboard.innerHTML = networks |
| apps/zte_manager/static/js/app.js | 2011 | <strong>${escapeHtml(network.ssid ?? "Sem nome")}</strong> |
| apps/zte_manager/static/js/app.js | 2012 | <small>${escapeHtml(network.banda ?? "-")} • ${escapeHtml(network.seguranca ?? network.beacon_type ?? "-")}</small> |
| apps/zte_manager/static/js/app.js | 2022 | page.innerHTML = networks |
| apps/zte_manager/static/js/app.js | 2065 | <strong>${escapeHtml(network.ssid ?? "Sem nome")}</strong> |
| apps/zte_manager/static/js/app.js | 2066 | <small>${escapeHtml(network.id ?? "-")} • ${escapeHtml(network.banda ?? "-")}</small> |
| apps/zte_manager/static/js/app.js | 2077 | data-ssid-id="${escapeHtml(network.id ?? "")}" |
| apps/zte_manager/static/js/app.js | 2078 | data-original-password="${escapeHtml(passwordValue)}" |
| apps/zte_manager/static/js/app.js | 2081 | <span class="meta-pill">${escapeHtml(network.banda ?? "-")}</span> |
| apps/zte_manager/static/js/app.js | 2082 | <span class="meta-pill">${escapeHtml(security)}</span> |
| apps/zte_manager/static/js/app.js | 2083 | <span class="meta-pill">MAX ${escapeHtml(network.max_clientes ?? "-")}</span> |
| apps/zte_manager/static/js/app.js | 2093 | value="${escapeHtml(network.ssid ?? "")}" |
| apps/zte_manager/static/js/app.js | 2109 | value="${escapeHtml(passwordValue)}" |
| apps/zte_manager/static/js/app.js | 2126 | value="${escapeHtml(network.max_clientes ?? 32)}" |
| apps/zte_manager/static/js/app.js | 2136 | value="${escapeHtml(network.authentication_mode ?? "")}" |
| apps/zte_manager/static/js/app.js | 2144 | value="${escapeHtml(network.encryption_mode ?? "")}" |
| apps/zte_manager/static/js/app.js | 2153 | value="${escapeHtml(network.group_rekey ?? 3600)}" |
| apps/zte_manager/static/js/app.js | 2161 | value="${escapeHtml(network.wps_method ?? "PushButton")}" |
| apps/zte_manager/static/js/app.js | 2314 | page.innerHTML = ( |
| apps/zte_manager/static/js/app.js | 2321 | page.innerHTML = radios |
| apps/zte_manager/static/js/app.js | 2443 | <span class="section-kicker">RF ${escapeHtml(radio.banda)}</span> |
| apps/zte_manager/static/js/app.js | 2444 | <h3>${escapeHtml(radio.ssid ?? radio.id ?? "Rádio")}</h3> |
| apps/zte_manager/static/js/app.js | 2446 | Canal <strong>${escapeHtml(radio.canal_automatico ? "Auto" : radio.canal)}</strong> |
| apps/zte_manager/static/js/app.js | 2447 | • ${escapeHtml(radio.largura ?? "-")} |
| apps/zte_manager/static/js/app.js | 2448 | • ${escapeHtml(radio.padrao ?? "-")} |
| apps/zte_manager/static/js/app.js | 2457 | data-band="${escapeHtml(radio.banda)}" |
| apps/zte_manager/static/js/app.js | 2466 | <form class="radio-form" data-band="${escapeHtml(radio.banda)}"> |
| apps/zte_manager/static/js/app.js | 2485 | <input data-field="country" type="text" value="${escapeHtml(radio.pais ?? "BRI")}"> |
| apps/zte_manager/static/js/app.js | 2500 | value="${escapeHtml(radio.beacon_interval ?? 100)}" |
| apps/zte_manager/static/js/app.js | 2525 | ${escapeHtml(radio.sideband ?? "-")} • TX ${escapeHtml(radio.potencia ?? "-")} |
| apps/zte_manager/static/js/app.js | 2636 | container.innerHTML = ` |
| apps/zte_manager/static/js/app.js | 2649 | container.innerHTML = items |
| apps/zte_manager/static/js/app.js | 2656 | <span class="section-kicker">${escapeHtml(item.band ?? "WIFI")}</span> |
| apps/zte_manager/static/js/app.js | 2657 | <h3>WPS ${escapeHtml(item.band ?? "")}</h3> |
| apps/zte_manager/static/js/app.js | 2660 | ${escapeHtml(item.mode ?? "Disabled")} |
| apps/zte_manager/static/js/app.js | 2671 | data-band="${escapeHtml(item.band ?? "")}" |
| apps/zte_manager/static/js/app.js | 2679 | data-band="${escapeHtml(item.band ?? "")}" |
| apps/zte_manager/static/js/app.js | 2772 | select.innerHTML = '<option value="Auto">Auto</option>'; |
| apps/zte_manager/static/js/app.js | 2884 | value="${escapeHtml(option)}" |
| apps/zte_manager/static/js/app.js | 2887 | ${escapeHtml(option)} |
| apps/zte_manager/static/js/app.js | 2903 | <span>${escapeHtml(label)}</span> |
| apps/zte_manager/static/js/app.js | 2906 | data-field="${escapeHtml(field)}" |
| apps/zte_manager/static/js/app.js | 2924 | ${escapeHtml(label)} |
| apps/zte_manager/static/js/app.js | 2945 | const hostsHtml = hosts.length |
| apps/zte_manager/static/js/app.js | 2961 | ).innerHTML = ` |
| apps/zte_manager/static/js/app.js | 2967 | ${hostsHtml} |
| apps/zte_manager/static/js/app.js | 2987 | select.innerHTML = ( |
| apps/zte_manager/static/js/app.js | 3259 | radiosContainer.innerHTML = bands |
| apps/zte_manager/static/js/app.js | 3264 | data-profile-band="${escapeHtml(band)}" |
| apps/zte_manager/static/js/app.js | 3269 | <h3>${escapeHtml(band)}</h3> |
| apps/zte_manager/static/js/app.js | 3307 | container.innerHTML = profileRadioFields( |
| apps/zte_manager/static/js/app.js | 3396 | container.innerHTML = ""; |
| apps/zte_manager/static/js/app.js | 3424 | row.innerHTML = ` |
| apps/zte_manager/static/js/app.js | 3431 | value="${escapeHtml(host.nome \|\| "")}" |
| apps/zte_manager/static/js/app.js | 3441 | value="${escapeHtml(host.ip \|\| "")}" |
| apps/zte_manager/static/js/app.js | 3530 | value="${escapeHtml(config.country \|\| "BRI")}" |
| apps/zte_manager/static/js/app.js | 3546 | value="${escapeHtml(config.beacon_interval ?? 100)}" |
| apps/zte_manager/static/js/app.js | 3939 | container.innerHTML = ( |
| apps/zte_manager/static/js/app.js | 3946 | container.innerHTML = steps |
| apps/zte_manager/static/js/app.js | 3951 | <strong>${escapeHtml(step.name)}</strong> |
| apps/zte_manager/static/js/app.js | 3952 | <p>${escapeHtml(step.detail)}</p> |
| apps/zte_manager/static/js/app.js | 3981 | container.innerHTML = ( |
| apps/zte_manager/static/js/app.js | 3988 | container.innerHTML = accounts |
| apps/zte_manager/static/js/app.js | 3996 | <strong>${escapeHtml(account.username ?? "-")}</strong> |
| apps/zte_manager/static/js/app.js | 3997 | <small>Right ${escapeHtml(account.right ?? "-")} • ${account.enabled ? "habilitada" : "desabilitada"}</small> |
| apps/zte_manager/static/js/app.js | 4007 | container.innerHTML = ` |
| apps/zte_manager/static/js/app.js | 4010 | <div><strong>Account Manager indisponível</strong><p>${escapeHtml(error.message)}</p></div> |
| apps/zte_manager/static/js/app.js | 4174 | tbody.innerHTML = ` |
| apps/zte_manager/static/js/app.js | 4185 | tbody.innerHTML = clients |
| apps/zte_manager/static/js/app.js | 4189 | <td>${escapeHtml(client.hostname ?? "Desconhecido")}</td> |
| apps/zte_manager/static/js/app.js | 4190 | <td>${escapeHtml(client.ip ?? "-")}</td> |
| apps/zte_manager/static/js/app.js | 4191 | <td>${escapeHtml(client.mac ?? "-")}</td> |
| apps/zte_manager/static/js/app.js | 4192 | <td>${escapeHtml(client.ssid ?? "-")}</td> |
| apps/zte_manager/static/js/app.js | 4193 | <td>${client.rssi ? `${escapeHtml(client.rssi)} dBm` : "-"}</td> |
| apps/zte_manager/static/js/app.js | 4194 | <td>${escapeHtml(client.snr ?? "-")}</td> |
| apps/zte_manager/static/js/app.js | 4195 | <td>${escapeHtml(client.rx_rate ?? "-")}</td> |
| apps/zte_manager/static/js/app.js | 4196 | <td>${escapeHtml(client.tx_rate ?? "-")}</td> |
| apps/zte_manager/static/js/app.js | 4210 | tbody.innerHTML = ` |
| apps/zte_manager/static/js/app.js | 4221 | tbody.innerHTML = clients |
| apps/zte_manager/static/js/app.js | 4225 | <td>${escapeHtml(client.hostname ?? "Desconhecido")}</td> |
| apps/zte_manager/static/js/app.js | 4226 | <td>${escapeHtml(client.ip ?? "-")}</td> |
| apps/zte_manager/static/js/app.js | 4227 | <td>${escapeHtml(client.mac ?? "-")}</td> |
| apps/zte_manager/static/js/app.js | 4252 | return selectHtml( |
| apps/zte_manager/static/js/app.js | 4271 | return selectHtml( |
| apps/zte_manager/static/js/app.js | 4283 | return selectHtml( |
| apps/zte_manager/static/js/app.js | 4291 | function selectHtml( |
| apps/zte_manager/static/js/app.js | 4297 | <select data-field="${escapeHtml(field)}"> |
| apps/zte_manager/static/js/app.js | 4301 | value="${escapeHtml(option)}" |
| apps/zte_manager/static/js/app.js | 4304 | ${escapeHtml(option)} |
| apps/zte_manager/static/js/app.js | 4348 | <span class="material-symbols-outlined">${escapeHtml(icon)}</span> |
| apps/zte_manager/static/js/app.js | 4350 | <small>${escapeHtml(label)}</small> |
| apps/zte_manager/static/js/app.js | 4351 | <strong>${escapeHtml(normalizeValue(value))}</strong> |
| apps/zte_manager/static/js/app.js | 4473 | <span class="info-label">${escapeHtml(label)}</span> |
| apps/zte_manager/static/js/app.js | 4474 | <span class="info-value">${escapeHtml(normalizeValue(value))}</span> |
| apps/zte_manager/static/js/app.js | 4518 | ${escapeHtml(status ?? "Desconectado")} |
| apps/zte_manager/static/js/app.js | 4524 | function escapeHtml(value) { |
| apps/zte_manager/static/js/app.js | 4962 | button.innerHTML = ` |
| apps/zte_manager/static/js/management/inventory_view.js | 6 | * ES module loaded by Vela's existing index.html after the classic |
| apps/zte_manager/static/js/management/inventory_view.js | 42 | * @param {HTMLElement} parent |
| apps/zte_manager/static/js/management/inventory_view.js | 46 | * @returns {HTMLElement} |
| apps/zte_manager/static/js/management/inventory_view.js | 57 | * @param {HTMLTableRowElement} row |
| apps/zte_manager/static/js/management/inventory_view.js | 118 | *   body: HTMLElement, |
| apps/zte_manager/static/js/advanced/wifi_radio_fields.js | 7 | function huaweiFields(radio, escapeHtml) { |
| apps/zte_manager/static/js/advanced/wifi_radio_fields.js | 25 | value="${escapeHtml(radio.rts_cts ?? 2346)}"> |
| apps/zte_manager/static/js/advanced/wifi_radio_fields.js | 30 | value="${escapeHtml(radio.frag_threshold ?? 2346)}"> |
| apps/zte_manager/static/js/advanced/wifi_radio_fields.js | 35 | value="${escapeHtml(radio.dtim ?? 1)}"> |
| apps/zte_manager/static/js/advanced/wifi_radio_fields.js | 40 | value="${escapeHtml(radio.bandwidth_code ?? "")}"> |
| apps/zte_manager/static/js/advanced/wifi_radio_fields.js | 45 | value="${escapeHtml(radio.band_steering_policy ?? "")}"> |
| apps/zte_manager/static/js/advanced/wifi_radio_fields.js | 51 | value="${escapeHtml(radio.auto_channel_scope ?? "0")}"> |
| apps/zte_manager/static/js/advanced/wifi_radio_fields.js | 62 | function genericFields(radio, escapeHtml) { |
| apps/zte_manager/static/js/advanced/wifi_radio_fields.js | 87 | value="${escapeHtml(radio.rts_cts ?? 2347)}"> |
| apps/zte_manager/static/js/advanced/wifi_radio_fields.js | 92 | value="${escapeHtml(radio.dtim ?? 1)}"> |
| apps/zte_manager/static/js/advanced/wifi_radio_fields.js | 96 | <input data-field="qos_type" type="text" value="${escapeHtml(radio.qos_type ?? "")}"> |
| apps/zte_manager/static/js/advanced/wifi_radio_fields.js | 100 | <input data-field="work_mode" type="text" value="${escapeHtml(radio.work_mode ?? "")}"> |
| apps/zte_manager/static/js/advanced/wifi_radio_fields.js | 117 | escapeHtml = globalThis.escapeHtml, |
| apps/zte_manager/static/js/advanced/wifi_radio_fields.js | 119 | if (!deviceState?.snapshot \|\| typeof escapeHtml !== "function") { |
| apps/zte_manager/static/js/advanced/wifi_radio_fields.js | 120 | throw new TypeError("Advanced Wi-Fi fields requer DeviceState e escapeHtml."); |
| apps/zte_manager/static/js/advanced/wifi_radio_fields.js | 130 | ? huaweiFields(radio, escapeHtml) |
| apps/zte_manager/static/js/advanced/wifi_radio_fields.js | 131 | : genericFields(radio, escapeHtml); |
| apps/zte_manager/static/js/advanced/wifi_schedule.js | 30 | container.innerHTML = typeof featureUnavailable === "function" |
| apps/zte_manager/static/js/advanced/wifi_schedule.js | 38 | container.innerHTML = ` |
| apps/zte_manager/static/js/core/api_client.js | 121 | } catch (parseError) { |
| apps/zte_manager/static/css/themes/light_base_compat.css | 5 | html[data-theme="light"] { |
| apps/zte_manager/static/css/themes/light_base_compat.css | 9 | html[data-theme="light"] body, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 10 | html[data-theme="light"] #vela-page, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 11 | html[data-theme="light"] .app-shell, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 12 | html[data-theme="light"] .workspace, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 13 | html[data-theme="light"] .main-content, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 14 | html[data-theme="light"] .page { |
| apps/zte_manager/static/css/themes/light_base_compat.css | 19 | html[data-theme="light"] ::selection { |
| apps/zte_manager/static/css/themes/light_base_compat.css | 23 | html[data-theme="light"] .sidebar { |
| apps/zte_manager/static/css/themes/light_base_compat.css | 29 | html[data-theme="light"] .console-ribbon { |
| apps/zte_manager/static/css/themes/light_base_compat.css | 34 | html[data-theme="light"] .console-signature, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 35 | html[data-theme="light"] .console-ribbon-right, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 36 | html[data-theme="light"] #consoleHostText, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 37 | html[data-theme="light"] .nav-caption, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 38 | html[data-theme="light"] .brand-copy span, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 39 | html[data-theme="light"] .target-head, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 40 | html[data-theme="light"] .connection-state small { |
| apps/zte_manager/static/css/themes/light_base_compat.css | 43 | html[data-theme="light"] .brand-copy strong, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 44 | html[data-theme="light"] .target-card strong, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 45 | html[data-theme="light"] .connection-state strong { |
| apps/zte_manager/static/css/themes/light_base_compat.css | 48 | html[data-theme="light"] .brand-mark, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 49 | html[data-theme="light"] .brand-mark svg { |
| apps/zte_manager/static/css/themes/light_base_compat.css | 53 | html[data-theme="light"] .brand-mark svg rect:first-child { |
| apps/zte_manager/static/css/themes/light_base_compat.css | 56 | html[data-theme="light"] .brand-mark svg path { |
| apps/zte_manager/static/css/themes/light_base_compat.css | 59 | html[data-theme="light"] .brand-mark svg rect:nth-child(2) { |
| apps/zte_manager/static/css/themes/light_base_compat.css | 62 | html[data-theme="light"] .target-card, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 63 | html[data-theme="light"] .connection-state { |
| apps/zte_manager/static/css/themes/light_base_compat.css | 68 | html[data-theme="light"] .menu-item, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 69 | html[data-theme="light"] .sidebar-action { |
| apps/zte_manager/static/css/themes/light_base_compat.css | 75 | html[data-theme="light"] .menu-item:not(.locked):hover, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 76 | html[data-theme="light"] .sidebar-action:hover { |
| apps/zte_manager/static/css/themes/light_base_compat.css | 81 | html[data-theme="light"] .menu-item.active { |
| apps/zte_manager/static/css/themes/light_base_compat.css | 87 | html[data-theme="light"] .menu-item .material-symbols-outlined, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 88 | html[data-theme="light"] .console-action .material-symbols-outlined, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 89 | html[data-theme="light"] .topbar .material-symbols-outlined { |
| apps/zte_manager/static/css/themes/light_base_compat.css | 92 | html[data-theme="light"] .menu-item.active .material-symbols-outlined { |
| apps/zte_manager/static/css/themes/light_base_compat.css | 95 | html[data-theme="light"] .topbar { |
| apps/zte_manager/static/css/themes/light_base_compat.css | 100 | html[data-theme="light"] .topbar-title h1, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 101 | html[data-theme="light"] .section-intro h2, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 102 | html[data-theme="light"] .login-hero h2 { |
| apps/zte_manager/static/css/themes/light_base_compat.css | 108 | html[data-theme="light"] .topbar-title p, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 109 | html[data-theme="light"] .section-intro p, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 110 | html[data-theme="light"] .operations-copy, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 111 | html[data-theme="light"] .panel p, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 112 | html[data-theme="light"] .profile-banner p, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 113 | html[data-theme="light"] .login-hero p { |
| apps/zte_manager/static/css/themes/light_base_compat.css | 116 | html[data-theme="light"] .device-chip, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 117 | html[data-theme="light"] .console-action, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 118 | html[data-theme="light"] .icon-button, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 119 | html[data-theme="light"] .zoom-control, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 120 | html[data-theme="light"] .zoom-button, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 121 | html[data-theme="light"] #themeToggle { |
| apps/zte_manager/static/css/themes/light_base_compat.css | 127 | html[data-theme="light"] .panel, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 128 | html[data-theme="light"] .kpi-card, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 129 | html[data-theme="light"] .ssid-card, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 130 | html[data-theme="light"] .radio-card, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 131 | html[data-theme="light"] .wan-card, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 132 | html[data-theme="light"] .client-card, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 133 | html[data-theme="light"] .feature-card, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 134 | html[data-theme="light"] .feature-control-card, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 135 | html[data-theme="light"] .profile-card, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 136 | html[data-theme="light"] .diagnostic-card, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 137 | html[data-theme="light"] .credential-card, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 138 | html[data-theme="light"] .support-result-card, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 139 | html[data-theme="light"] .support-control-panel, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 140 | html[data-theme="light"] .dashboard-health-panel, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 141 | html[data-theme="light"] .management-status-strip > div, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 142 | html[data-theme="light"] .management-list-item, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 143 | html[data-theme="light"] .danger-zone { |
| apps/zte_manager/static/css/themes/light_base_compat.css | 150 | html[data-theme="light"] .panel h2, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 151 | html[data-theme="light"] .panel h3, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 152 | html[data-theme="light"] .profile-radio-card h3, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 153 | html[data-theme="light"] .kpi-value, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 154 | html[data-theme="light"] .wan-card h3, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 155 | html[data-theme="light"] .ssid-card h3, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 156 | html[data-theme="light"] .management-list-item strong { |
| apps/zte_manager/static/css/themes/light_base_compat.css | 159 | html[data-theme="light"] .panel-header, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 160 | html[data-theme="light"] .subsection-title { |
| apps/zte_manager/static/css/themes/light_base_compat.css | 163 | html[data-theme="light"] .operations-strip, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 164 | html[data-theme="light"] .ssid-card-head, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 165 | html[data-theme="light"] .radio-card-hero, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 166 | html[data-theme="light"] .wan-card-head, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 167 | html[data-theme="light"] .wan-address, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 168 | html[data-theme="light"] .network-overview-item, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 169 | html[data-theme="light"] .profile-banner, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 170 | html[data-theme="light"] .support-summary, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 171 | html[data-theme="light"] .support-summary-metrics > div, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 172 | html[data-theme="light"] .support-metric, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 173 | html[data-theme="light"] .management-status-strip, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 174 | html[data-theme="light"] .secret-line { |
| apps/zte_manager/static/css/themes/light_base_compat.css | 180 | html[data-theme="light"] .kpi-head, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 181 | html[data-theme="light"] .kpi-card small, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 182 | html[data-theme="light"] .dual-metric small, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 183 | html[data-theme="light"] .operations-strip .muted, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 184 | html[data-theme="light"] .section-kicker, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 185 | html[data-theme="light"] .eyebrow, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 186 | html[data-theme="light"] .field > span, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 187 | html[data-theme="light"] .form-group label, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 188 | html[data-theme="light"] .management-list-item span, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 189 | html[data-theme="light"] .management-list-item small { |
| apps/zte_manager/static/css/themes/light_base_compat.css | 192 | html[data-theme="light"] input:not([type="checkbox"]):not([type="radio"]), |
| apps/zte_manager/static/css/themes/light_base_compat.css | 193 | html[data-theme="light"] select, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 194 | html[data-theme="light"] textarea, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 195 | html[data-theme="light"] .management-search, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 196 | html[data-theme="light"] .adaptive-search { |
| apps/zte_manager/static/css/themes/light_base_compat.css | 203 | html[data-theme="light"] input::placeholder, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 204 | html[data-theme="light"] textarea::placeholder { |
| apps/zte_manager/static/css/themes/light_base_compat.css | 208 | html[data-theme="light"] input:focus, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 209 | html[data-theme="light"] select:focus, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 210 | html[data-theme="light"] textarea:focus { |
| apps/zte_manager/static/css/themes/light_base_compat.css | 215 | html[data-theme="light"] input:disabled, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 216 | html[data-theme="light"] select:disabled, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 217 | html[data-theme="light"] button:disabled { |
| apps/zte_manager/static/css/themes/light_base_compat.css | 221 | html[data-theme="light"] input[type="checkbox"], |
| apps/zte_manager/static/css/themes/light_base_compat.css | 222 | html[data-theme="light"] input[type="radio"] { |
| apps/zte_manager/static/css/themes/light_base_compat.css | 225 | html[data-theme="light"] .button, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 226 | html[data-theme="light"] button.button, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 227 | html[data-theme="light"] .button.ghost, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 228 | html[data-theme="light"] .sidebar-action { |
| apps/zte_manager/static/css/themes/light_base_compat.css | 235 | html[data-theme="light"] .button:hover:not(:disabled), |
| apps/zte_manager/static/css/themes/light_base_compat.css | 236 | html[data-theme="light"] .console-action:hover, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 237 | html[data-theme="light"] .icon-button:hover { |
| apps/zte_manager/static/css/themes/light_base_compat.css | 242 | html[data-theme="light"] .button.primary, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 243 | html[data-theme="light"] #connectButton, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 244 | html[data-theme="light"] #applyProfileButton, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 245 | html[data-theme="light"] #supportRunButton, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 246 | html[data-theme="light"] .console-action.primary { |
| apps/zte_manager/static/css/themes/light_base_compat.css | 251 | html[data-theme="light"] .button.primary:hover:not(:disabled), |
| apps/zte_manager/static/css/themes/light_base_compat.css | 252 | html[data-theme="light"] #applyProfileButton:hover:not(:disabled) { |
| apps/zte_manager/static/css/themes/light_base_compat.css | 256 | html[data-theme="light"] .button.danger, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 257 | html[data-theme="light"] .sidebar-action.danger { |
| apps/zte_manager/static/css/themes/light_base_compat.css | 262 | html[data-theme="light"] .badge, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 263 | html[data-theme="light"] .status-badge, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 264 | html[data-theme="light"] .capability-pill, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 265 | html[data-theme="light"] .hero-badge { |
| apps/zte_manager/static/css/themes/light_base_compat.css | 270 | html[data-theme="light"] .badge.ok, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 271 | html[data-theme="light"] .badge.success, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 272 | html[data-theme="light"] .badge-success, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 273 | html[data-theme="light"] .capability-pill.enabled, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 274 | html[data-theme="light"] .status-badge.online { |
| apps/zte_manager/static/css/themes/light_base_compat.css | 279 | html[data-theme="light"] .badge.warning, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 280 | html[data-theme="light"] .status-badge.warning { |
| apps/zte_manager/static/css/themes/light_base_compat.css | 284 | html[data-theme="light"] .connection-error, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 285 | html[data-theme="light"] .request-status-indicator.is-error, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 286 | html[data-theme="light"] .error-list { |
| apps/zte_manager/static/css/themes/light_base_compat.css | 291 | html[data-theme="light"] .connection-success, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 292 | html[data-theme="light"] .request-status-indicator, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 293 | html[data-theme="light"] .support-empty { |
| apps/zte_manager/static/css/themes/light_base_compat.css | 298 | html[data-theme="light"] th, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 299 | html[data-theme="light"] .management-table th { |
| apps/zte_manager/static/css/themes/light_base_compat.css | 304 | html[data-theme="light"] td, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 305 | html[data-theme="light"] .management-table td { |
| apps/zte_manager/static/css/themes/light_base_compat.css | 309 | html[data-theme="light"] tr:nth-child(even) td { |
| apps/zte_manager/static/css/themes/light_base_compat.css | 312 | html[data-theme="light"] tr:hover td, |
| apps/zte_manager/static/css/themes/light_base_compat.css | 313 | html[data-theme="light"] .management-table tbody tr.selected { |
| apps/zte_manager/static/css/themes/light_base_compat.css | 316 | html[data-theme="light"] .status-led:not(.on), |
| apps/zte_manager/static/css/themes/light_base_compat.css | 317 | html[data-theme="light"] .capability-pill i { |
| apps/zte_manager/static/css/themes/light_base_compat.css | 320 | html[data-theme="light"] .switch-slider { |
| apps/zte_manager/static/css/themes/light_base_compat.css | 323 | html[data-theme="light"] .switch input:checked + .switch-slider { |
| apps/zte_manager/static/css/themes/light_base_compat.css | 326 | html[data-theme="light"] .switch-slider::after { |
| apps/zte_manager/static/css/themes/tangerine_terminal_compat.css | 4 | html[data-theme="light"] .firmware-json, |
| apps/zte_manager/static/css/themes/tangerine_terminal_compat.css | 5 | html[data-theme="light"] .management-json-editor, |
| apps/zte_manager/static/css/themes/tangerine_terminal_compat.css | 6 | html[data-theme="light"] .management-code-output, |
| apps/zte_manager/static/css/themes/tangerine_terminal_compat.css | 7 | html[data-theme="light"] .management-terminal, |
| apps/zte_manager/static/css/themes/tangerine_terminal_compat.css | 8 | html[data-theme="light"] .operations-output, |
| apps/zte_manager/static/css/themes/tangerine_terminal_compat.css | 9 | html[data-theme="light"] .adaptive-field { |
| apps/zte_manager/static/css/themes/tangerine_terminal_compat.css | 14 | html[data-theme="light"] .adaptive-page-panel, |
| apps/zte_manager/static/css/themes/tangerine_terminal_compat.css | 15 | html[data-theme="light"] .adaptive-summary, |
| apps/zte_manager/static/css/themes/tangerine_terminal_compat.css | 16 | html[data-theme="light"] .adaptive-route-row, |
| apps/zte_manager/static/css/themes/tangerine_terminal_compat.css | 17 | html[data-theme="light"] .management-list-item, |
| apps/zte_manager/static/css/themes/tangerine_terminal_compat.css | 18 | html[data-theme="light"] .profile-radio-card, |
| apps/zte_manager/static/css/themes/tangerine_terminal_compat.css | 19 | html[data-theme="light"] #f6201b-workbench { |
| apps/zte_manager/static/css/themes/tangerine_terminal_compat.css | 23 | html[data-theme="light"] .adaptive-route-row:hover, |
| apps/zte_manager/static/css/themes/tangerine_terminal_compat.css | 24 | html[data-theme="light"] #f6201b-workbench .f6201b-wb-item:hover, |
| apps/zte_manager/static/css/themes/tangerine_terminal_compat.css | 25 | html[data-theme="light"] #f6201b-workbench .f6201b-wb-item.is-active { |
| apps/zte_manager/static/css/themes/tangerine_terminal_compat.css | 28 | html[data-theme="light"] .firmware-json, |
| apps/zte_manager/static/css/themes/tangerine_terminal_compat.css | 29 | html[data-theme="light"] .management-json-editor, |
| apps/zte_manager/static/css/themes/tangerine_terminal_compat.css | 30 | html[data-theme="light"] .management-code-output { |
| apps/zte_manager/static/css/themes/tangerine_terminal_compat.css | 33 | html[data-theme] #pingOutput.terminal-output, |
| apps/zte_manager/static/css/themes/tangerine_terminal_compat.css | 34 | html[data-theme] #tracerouteOutput.terminal-output, |
| apps/zte_manager/static/css/themes/tangerine_terminal_compat.css | 35 | html[data-theme] pre.terminal-output { |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 4 | html[data-theme] body, |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 5 | html[data-theme] #vela-page, |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 6 | html[data-theme] .app-shell, |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 7 | html[data-theme] .workspace, |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 8 | html[data-theme] .main-content, |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 9 | html[data-theme] .page { |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 13 | html[data-theme] body {font-family:var(--am-font-sans)!important;font-size:14px;} |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 14 | html[data-theme] .sidebar { |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 19 | html[data-theme] .workspace {min-width:0;} |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 20 | html[data-theme] .brand-row {height:auto;min-height:54px;gap:10px;padding:0 6px;} |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 21 | html[data-theme] .brand-mark { |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 25 | html[data-theme] .brand-mark svg rect:first-child {fill:var(--am-color-primary)!important;} |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 26 | html[data-theme] .brand-mark svg rect:nth-child(2) {stroke:var(--am-color-primary)!important;} |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 27 | html[data-theme] .brand-mark svg path {stroke:var(--am-color-primary-ink)!important;} |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 28 | html[data-theme] .brand-mark svg circle {fill:var(--am-color-primary-ink)!important;} |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 29 | html[data-theme] .brand-copy strong {font-weight:800!important;color:var(--am-color-text)!important;letter-spacing:-.04em;} |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 30 | html[data-theme] .brand-copy span {font:500 10px/1.3 var(--am-font-sans)!important;letter-spacing:.02em;color:var(--am-color-text-muted)!important;} |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 31 | html[data-theme] .target-card { |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 35 | html[data-theme] .target-head, |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 36 | html[data-theme] .connection-state small, |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 37 | html[data-theme] .console-signature, |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 38 | html[data-theme] #consoleHostText {color:var(--am-color-text-muted)!important;} |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 39 | html[data-theme] .nav-caption {display:none!important;} |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 40 | html[data-theme] .nav-menu {overflow-y:auto;overflow-x:hidden;min-height:0;padding:8px 2px 20px;gap:3px;} |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 41 | html[data-theme] .nav-group-label { |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 46 | html[data-theme] .menu-item { |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 52 | html[data-theme] .menu-item .material-symbols-outlined {font-size:19px!important;color:inherit!important;} |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 53 | html[data-theme] .menu-item:hover:not(.locked) { |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 56 | html[data-theme] .menu-item.active, |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 57 | html[data-theme] .menu-item.active:hover { |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 61 | html[data-theme] .menu-item.locked {opacity:.58;} |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 62 | html[data-theme] .sidebar-bottom {background:transparent!important;border-color:var(--am-color-border)!important;} |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 63 | html[data-theme] .connection-state {background:var(--am-color-surface)!important;border-color:var(--am-color-border)!important;border-radius:10px;} |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 64 | html[data-theme] .console-ribbon { |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 68 | html[data-theme] .console-ribbon .window-dot {opacity:.48;} |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 69 | html[data-theme] .topbar { |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 74 | html[data-theme] .topbar-title h1 { |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 78 | html[data-theme] .topbar-title p {color:var(--am-color-text-muted)!important;} |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 79 | html[data-theme] .eyebrow, |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 80 | html[data-theme] .section-kicker, |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 81 | html[data-theme] .field>span {color:var(--am-color-text-muted)!important;letter-spacing:.06em!important;} |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 82 | html[data-theme] .main-content {max-width:1520px;padding:clamp(15px,2vw,28px)!important;} |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 83 | html[data-theme] .panel, |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 84 | html[data-theme] .kpi-card, |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 85 | html[data-theme] .ssid-card, |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 86 | html[data-theme] .radio-card, |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 87 | html[data-theme] .wan-card, |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 88 | html[data-theme] .client-card, |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 89 | html[data-theme] .feature-card, |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 90 | html[data-theme] .profile-card, |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 91 | html[data-theme] .diagnostic-card, |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 92 | html[data-theme] .support-panel, |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 93 | html[data-theme] .management-list-item, |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 94 | html[data-theme] .target-card { |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 99 | html[data-theme] .panel {padding:clamp(16px,1.8vw,24px)!important;} |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 100 | html[data-theme] .panel-header h3, |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 101 | html[data-theme] .panel-heading h3, |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 102 | html[data-theme] .section-intro h2 {color:var(--am-color-text)!important;font-weight:760!important;} |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 103 | html[data-theme] .button, |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 104 | html[data-theme] button.button, |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 105 | html[data-theme] .console-action, |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 106 | html[data-theme] .sidebar-action, |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 107 | html[data-theme] .icon-button, |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 108 | html[data-theme] .zoom-button, |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 109 | html[data-theme] .text-action, |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 110 | html[data-theme] .shell-control { |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 115 | html[data-theme] .button:hover:not(:disabled), |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 116 | html[data-theme] .console-action:hover:not(:disabled), |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 117 | html[data-theme] .shell-control:hover:not(:disabled) { |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 120 | html[data-theme] .button.primary, |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 121 | html[data-theme] .button-primary, |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 122 | html[data-theme] #connectButton, |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 123 | html[data-theme] #applyProfileButton, |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 124 | html[data-theme] #supportRunButton { |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 128 | html[data-theme] .button.primary:hover:not(:disabled), |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 129 | html[data-theme] #connectButton:hover:not(:disabled) {filter:brightness(.96);} |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 130 | html[data-theme] .button.danger, |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 131 | html[data-theme] .sidebar-action.danger { |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 135 | html[data-theme] .topbar-quick-actions .console-action { |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 139 | html[data-theme] input:not([type=checkbox]):not([type=radio]), |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 140 | html[data-theme] select, |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 141 | html[data-theme] textarea { |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 145 | html[data-theme] .appearance-control { |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 148 | html[data-theme] .appearance-control select { |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 151 | html[data-theme] .shell-control {display:grid;place-items:center;min-width:32px;min-height:32px;cursor:pointer;} |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 152 | html[data-theme] .shell-control .material-symbols-outlined {font-size:19px;} |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 153 | html[data-theme] .brand-row .shell-control {margin-left:auto;flex:none;} |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 154 | html[data-theme] #themeToggle {display:none!important;} |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 155 | html[data-theme] .login-hero h2 { |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 159 | html[data-theme] .login-hero p {color:var(--am-color-text-muted)!important;max-width:48ch;} |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 160 | html[data-theme] .hero-badge { |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 164 | html[data-theme] .login-layout { |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 168 | html[data-theme] .login-panel {max-width:550px;width:100%;justify-self:end;} |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 169 | html[data-theme] .operations-strip { |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 173 | html[data-theme] .kpi-grid {gap:12px;} |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 174 | html[data-theme] .kpi-card {padding:15px 17px!important;} |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 175 | html[data-theme] .kpi-card strong {color:var(--am-color-text)!important;} |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 176 | html[data-theme] .dashboard-grid {gap:13px;} |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 177 | html[data-theme] .badge, |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 178 | html[data-theme] .status-badge { |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 182 | html[data-theme] .badge.ok, |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 183 | html[data-theme] .badge.success { |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 186 | html[data-theme] .terminal-output, |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 187 | html[data-theme] .management-code-output, |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 188 | html[data-theme] pre {font-family:var(--am-font-mono)!important;} |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 189 | html[data-theme] table, |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 190 | html[data-theme] .client-table {background:var(--am-color-surface)!important;} |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 191 | html[data-theme] th, |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 192 | html[data-theme] td {border-color:var(--am-color-border)!important;} |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 193 | html[data-theme] input:focus-visible, |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 194 | html[data-theme] select:focus-visible, |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 195 | html[data-theme] textarea:focus-visible, |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 196 | html[data-theme] button:focus-visible, |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 197 | html[data-theme] summary:focus-visible { |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 200 | html[data-theme] button:disabled {opacity:.5!important;cursor:not-allowed!important;} |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 202 | html[data-theme] .topbar {flex-wrap:wrap;} |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 203 | html[data-theme] .topbar-quick-actions {display:none!important;} |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 204 | html[data-theme] .login-layout {grid-template-columns:minmax(0,1fr)!important;align-items:start!important;} |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 205 | html[data-theme] .login-panel {justify-self:stretch;max-width:620px;} |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 206 | html[data-theme] .login-hero h2 {font-size:clamp(28px,4vw,44px)!important;} |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 207 | html[data-theme] .dashboard-grid {grid-template-columns:repeat(2,minmax(0,1fr))!important;} |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 210 | html[data-theme] .kpi-grid {grid-template-columns:repeat(2,minmax(0,1fr))!important;} |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 211 | html[data-theme] .dashboard-grid {grid-template-columns:minmax(0,1fr)!important;} |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 212 | html[data-theme] .dashboard-grid .span-2 {grid-column:auto!important;} |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 213 | html[data-theme] .login-layout {padding:8px!important;} |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 216 | html[data-theme] *, |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 217 | html[data-theme] *::before, |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 218 | html[data-theme] *::after { |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 2 | html[data-theme="light"] .terminal-output, |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 3 | html[data-theme="light"] .firmware-json, |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 4 | html[data-theme="light"] .management-json-editor, |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 5 | html[data-theme="light"] .management-code-output, |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 6 | html[data-theme="light"] .management-terminal, |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 7 | html[data-theme="light"] .operations-output, |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 8 | html[data-theme="light"] .adaptive-field { |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 15 | html[data-theme="light"] .terminal-output *, |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 16 | html[data-theme="light"] .firmware-json *, |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 17 | html[data-theme="light"] .management-code-output * { |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 21 | html[data-theme="light"] .adaptive-report, |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 22 | html[data-theme="light"] .adaptive-card, |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 23 | html[data-theme="light"] .adaptive-summary, |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 24 | html[data-theme="light"] .adaptive-route-category summary, |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 25 | html[data-theme="light"] .adaptive-route-row, |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 26 | html[data-theme="light"] .adaptive-nested, |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 27 | html[data-theme="light"] .adaptive-empty, |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 28 | html[data-theme="light"] .adaptive-errors { |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 35 | html[data-theme="light"] .adaptive-summary { |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 38 | html[data-theme="light"] .adaptive-score, |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 39 | html[data-theme="light"] .adaptive-badge.is-ok { |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 44 | html[data-theme="light"] .adaptive-eyebrow, |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 45 | html[data-theme="light"] .adaptive-record-index, |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 46 | html[data-theme="light"] .adaptive-choice-group legend, |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 47 | html[data-theme="light"] .adaptive-nested h4, |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 48 | html[data-theme="light"] .adaptive-field dt, |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 49 | html[data-theme="light"] .adaptive-route-row small, |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 50 | html[data-theme="light"] .adaptive-progress, |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 51 | html[data-theme="light"] .adaptive-summary p, |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 52 | html[data-theme="light"] .adaptive-empty, |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 53 | html[data-theme="light"] .adaptive-choice-note { |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 56 | html[data-theme="light"] .adaptive-field dd { |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 59 | html[data-theme="light"] .management-tab { |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 64 | html[data-theme="light"] .management-tab.active, |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 65 | html[data-theme="light"] .management-tab:hover { |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 70 | html[data-theme="light"] .management-monitor-chart, |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 71 | html[data-theme="light"] .topology-node { |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 76 | html[data-theme="light"] .management-list-item span, |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 77 | html[data-theme="light"] .management-list-item small, |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 78 | html[data-theme="light"] .topology-node span { |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 81 | html[data-theme="light"] .support-control-panel::after { |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 84 | html[data-theme="light"] .support-result-card, |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 85 | html[data-theme="light"] .support-summary, |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 86 | html[data-theme="light"] .support-metric, |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 87 | html[data-theme="light"] .finding-item { |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 92 | html[data-theme="light"] .finding-copy p, |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 93 | html[data-theme="light"] .support-summary p, |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 94 | html[data-theme="light"] .support-summary h3, |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 95 | html[data-theme="light"] .support-metric strong { |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 98 | html[data-theme="light"] .finding-copy small, |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 99 | html[data-theme="light"] .support-metric span, |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 100 | html[data-theme="light"] .channel-score span, |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 101 | html[data-theme="light"] .speed-hero-grid span { |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 105 | html[data-theme="light"] .f6201b-editor, |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 106 | html[data-theme="light"] .f6201b-inline-result, |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 107 | html[data-theme="light"] .f6201b-diff-item, |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 108 | html[data-theme="light"] .f6201b-warning { |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 113 | html[data-theme="light"] .f6201b-badge { |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 117 | html[data-theme="light"] .f6201b-badge.enabled, |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 118 | html[data-theme="light"] .f6201b-diff-item strong, |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 119 | html[data-theme="light"] .f6201b-message.success { |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 123 | html[data-theme="light"] .f6201b-field, |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 124 | html[data-theme="light"] .f6201b-message, |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 125 | html[data-theme="light"] .f6201b-inline-result p { |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 128 | html[data-theme="light"] .f6201b-field input, |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 129 | html[data-theme="light"] .f6201b-field select, |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 130 | html[data-theme="light"] .f6201b-confirm, |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 131 | html[data-theme="light"] .f6201b-ssid-form .f6201b-inline-result input { |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 136 | html[data-theme="light"] #f6201b-workbench { |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 141 | html[data-theme="light"] #f6201b-workbench .f6201b-wb-routes { |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 144 | html[data-theme="light"] #f6201b-workbench .f6201b-wb-item:hover, |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 145 | html[data-theme="light"] #f6201b-workbench .f6201b-wb-item.is-active { |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 148 | html[data-theme="light"] #f6201b-workbench .f6201b-wb-status, |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 149 | html[data-theme="light"] #f6201b-workbench .f6201b-wb-table th { |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 206 | html[data-theme="light"] .profile-loading-card { |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 211 | html[data-theme="light"] #profileApplyResult .profile-experiment-warning { |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 220 | html[data-theme="light"] .sidebar {border-right-color:var(--ui-border)!important} |
| apps/zte_manager/static/css/themes/light_feature_compat.css | 221 | html[data-theme="light"] .topbar {padding:11px 14px!important} |
| apps/zte_manager/static/css/themes/light_console_compat.css | 2 | html[data-theme="light"] .kpi-card.cyan, |
| apps/zte_manager/static/css/themes/light_console_compat.css | 3 | html[data-theme="light"] .kpi-card.violet, |
| apps/zte_manager/static/css/themes/light_console_compat.css | 4 | html[data-theme="light"] .kpi-card.green, |
| apps/zte_manager/static/css/themes/light_console_compat.css | 5 | html[data-theme="light"] .kpi-card.amber { |
| apps/zte_manager/static/css/themes/light_console_compat.css | 11 | html[data-theme="light"] .kpi-card::before { |
| apps/zte_manager/static/css/themes/light_console_compat.css | 14 | html[data-theme="light"] .kpi-card > strong, |
| apps/zte_manager/static/css/themes/light_console_compat.css | 15 | html[data-theme="light"] .dual-metric strong, |
| apps/zte_manager/static/css/themes/light_console_compat.css | 16 | html[data-theme="light"] .kpi-card .material-symbols-outlined { |
| apps/zte_manager/static/css/themes/light_console_compat.css | 19 | html[data-theme="light"] .detail-tile, |
| apps/zte_manager/static/css/themes/light_console_compat.css | 20 | html[data-theme="light"] .metric-tile, |
| apps/zte_manager/static/css/themes/light_console_compat.css | 21 | html[data-theme="light"] .radio-stat, |
| apps/zte_manager/static/css/themes/light_console_compat.css | 22 | html[data-theme="light"] .account-row, |
| apps/zte_manager/static/css/themes/light_console_compat.css | 23 | html[data-theme="light"] .credential-card, |
| apps/zte_manager/static/css/themes/light_console_compat.css | 24 | html[data-theme="light"] .profile-host, |
| apps/zte_manager/static/css/themes/light_console_compat.css | 25 | html[data-theme="light"] .client-counter-row > div, |
| apps/zte_manager/static/css/themes/light_console_compat.css | 26 | html[data-theme="light"] .channel-score, |
| apps/zte_manager/static/css/themes/light_console_compat.css | 27 | html[data-theme="light"] .speed-hero-grid > div, |
| apps/zte_manager/static/css/themes/light_console_compat.css | 28 | html[data-theme="light"] .band-steering-metrics span, |
| apps/zte_manager/static/css/themes/light_console_compat.css | 29 | html[data-theme="light"] .support-mode-card, |
| apps/zte_manager/static/css/themes/light_console_compat.css | 30 | html[data-theme="light"] .support-check-card, |
| apps/zte_manager/static/css/themes/light_console_compat.css | 31 | html[data-theme="light"] .mesh-flow > div { |
| apps/zte_manager/static/css/themes/light_console_compat.css | 38 | html[data-theme="light"] .detail-tile strong, |
| apps/zte_manager/static/css/themes/light_console_compat.css | 39 | html[data-theme="light"] .metric-tile strong, |
| apps/zte_manager/static/css/themes/light_console_compat.css | 40 | html[data-theme="light"] .radio-stat strong, |
| apps/zte_manager/static/css/themes/light_console_compat.css | 41 | html[data-theme="light"] .speed-hero-grid strong, |
| apps/zte_manager/static/css/themes/light_console_compat.css | 42 | html[data-theme="light"] .mesh-flow strong { |
| apps/zte_manager/static/css/themes/light_console_compat.css | 45 | html[data-theme="light"] .detail-tile span, |
| apps/zte_manager/static/css/themes/light_console_compat.css | 46 | html[data-theme="light"] .detail-tile small, |
| apps/zte_manager/static/css/themes/light_console_compat.css | 47 | html[data-theme="light"] .metric-tile span, |
| apps/zte_manager/static/css/themes/light_console_compat.css | 48 | html[data-theme="light"] .radio-stat span, |
| apps/zte_manager/static/css/themes/light_console_compat.css | 49 | html[data-theme="light"] .speed-hero-grid span, |
| apps/zte_manager/static/css/themes/light_console_compat.css | 50 | html[data-theme="light"] .speed-hero-grid small, |
| apps/zte_manager/static/css/themes/light_console_compat.css | 51 | html[data-theme="light"] .mesh-flow small { |
| apps/zte_manager/static/css/themes/light_console_compat.css | 54 | html[data-theme="light"] .network-overview-item:hover { |
| apps/zte_manager/static/css/themes/light_console_compat.css | 58 | html[data-theme="light"] .network-overview-icon, |
| apps/zte_manager/static/css/themes/light_console_compat.css | 59 | html[data-theme="light"] .wan-icon, |
| apps/zte_manager/static/css/themes/light_console_compat.css | 60 | html[data-theme="light"] .feature-control-icon { |
| apps/zte_manager/static/css/themes/light_console_compat.css | 64 | html[data-theme="light"] .client-table th, |
| apps/zte_manager/static/css/themes/light_console_compat.css | 65 | html[data-theme="light"] .neighbor-table th, |
| apps/zte_manager/static/css/themes/light_console_compat.css | 66 | html[data-theme="light"] .management-table th { |
| apps/zte_manager/static/css/themes/light_console_compat.css | 71 | html[data-theme="light"] .client-table td, |
| apps/zte_manager/static/css/themes/light_console_compat.css | 72 | html[data-theme="light"] .neighbor-table td, |
| apps/zte_manager/static/css/themes/light_console_compat.css | 73 | html[data-theme="light"] .management-table td { |
| apps/zte_manager/static/css/themes/light_console_compat.css | 79 | html[data-theme="light"] #pingOutput.terminal-output, |
| apps/zte_manager/static/css/themes/light_console_compat.css | 80 | html[data-theme="light"] #tracerouteOutput.terminal-output, |
| apps/zte_manager/static/css/themes/light_console_compat.css | 81 | html[data-theme="light"] pre.terminal-output { |
| apps/zte_manager/static/css/themes/light_console_compat.css | 87 | html[data-theme="light"] .adaptive-page-panel, |
| apps/zte_manager/static/css/themes/light_console_compat.css | 88 | html[data-theme="light"] #firmwareDiagnosticResult, |
| apps/zte_manager/static/css/themes/light_console_compat.css | 89 | html[data-theme="light"] #firmwareDiagnosticChoices { |
| apps/zte_manager/static/css/themes/light_console_compat.css | 93 | html[data-theme="light"] .adaptive-choice-group, |
| apps/zte_manager/static/css/themes/light_console_compat.css | 94 | html[data-theme="light"] .adaptive-choice, |
| apps/zte_manager/static/css/themes/light_console_compat.css | 95 | html[data-theme="light"] .adaptive-record { |
| apps/zte_manager/static/css/themes/light_console_compat.css | 101 | html[data-theme="light"] .adaptive-choice:hover { |
| apps/zte_manager/static/css/themes/light_console_compat.css | 104 | html[data-theme="light"] .adaptive-badge.is-muted { |
| apps/zte_manager/static/css/themes/light_console_compat.css | 108 | html[data-theme="light"] .adaptive-score small { |
| apps/zte_manager/static/css/themes/light_console_compat.css | 111 | html[data-theme="light"] .profile-radio-card { |
| apps/zte_manager/static/css/themes/light_console_compat.css | 114 | html[data-theme="light"] .profile-radio-card .radio-card-hero { |
| apps/zte_manager/static/css/themes/light_console_compat.css | 119 | html[data-theme="light"] .profile-radio-card .profile-fields, |
| apps/zte_manager/static/css/themes/light_console_compat.css | 120 | html[data-theme="light"] .profile-radio-card .checkbox-container { |
| apps/zte_manager/static/css/components/provider_diagnostics.css | 3 | html[data-theme] #page-supportDiagnostic .am-provider-triage { |
| apps/zte_manager/static/css/components/provider_diagnostics.css | 8 | html[data-theme] #page-supportDiagnostic .am-provider-triage-head h3 { |
| apps/zte_manager/static/css/components/provider_diagnostics.css | 12 | html[data-theme] #page-supportDiagnostic .am-provider-triage-head p { |
| apps/zte_manager/static/css/components/provider_diagnostics.css | 16 | html[data-theme] #page-supportDiagnostic .am-provider-preset-grid { |
| apps/zte_manager/static/css/components/provider_diagnostics.css | 20 | html[data-theme] #page-supportDiagnostic .am-provider-preset-grid button { |
| apps/zte_manager/static/css/components/provider_diagnostics.css | 28 | html[data-theme] #page-supportDiagnostic .am-provider-preset-grid button:hover, |
| apps/zte_manager/static/css/components/provider_diagnostics.css | 29 | html[data-theme] #page-supportDiagnostic .am-provider-preset-grid button:focus-visible { |
| apps/zte_manager/static/css/components/provider_diagnostics.css | 32 | html[data-theme] #page-supportDiagnostic .am-provider-preset-grid button[aria-pressed=true] { |
| apps/zte_manager/static/css/components/provider_diagnostics.css | 37 | html[data-theme] #page-supportDiagnostic .am-provider-preset-grid strong { |
| apps/zte_manager/static/css/components/provider_diagnostics.css | 40 | html[data-theme] #page-supportDiagnostic .am-provider-preset-grid span { |
| apps/zte_manager/static/css/components/provider_diagnostics.css | 43 | html[data-theme] #page-supportDiagnostic .am-provider-preset-help { |
| apps/zte_manager/static/css/components/provider_diagnostics.css | 47 | html[data-theme] #page-supportDiagnostic .am-workstation-compare { |
| apps/zte_manager/static/css/components/provider_diagnostics.css | 53 | html[data-theme] #page-supportDiagnostic .am-workstation-compare h3 { |
| apps/zte_manager/static/css/components/provider_diagnostics.css | 57 | html[data-theme] #page-supportDiagnostic .am-workstation-compare p { |
| apps/zte_manager/static/css/components/provider_diagnostics.css | 60 | html[data-theme] #page-supportDiagnostic .am-workstation-compare button { |
| apps/zte_manager/static/css/components/provider_diagnostics.css | 63 | html[data-theme] #page-supportDiagnostic .am-workstation-output { |
| apps/zte_manager/static/css/components/provider_diagnostics.css | 69 | html[data-theme] #page-supportDiagnostic .am-workstation-metrics { |
| apps/zte_manager/static/css/components/provider_diagnostics.css | 74 | html[data-theme] #page-supportDiagnostic .am-workstation-metric { |
| apps/zte_manager/static/css/components/provider_diagnostics.css | 79 | html[data-theme] #page-supportDiagnostic .am-workstation-metric dt { |
| apps/zte_manager/static/css/components/provider_diagnostics.css | 82 | html[data-theme] #page-supportDiagnostic .am-workstation-metric dd { |
| apps/zte_manager/static/css/components/provider_diagnostics.css | 86 | html[data-theme] #page-supportDiagnostic .am-workstation-caution { |
| apps/zte_manager/static/css/components/provider_diagnostics.css | 90 | html[data-theme] #page-supportDiagnostic .am-remediation-list { |
| apps/zte_manager/static/css/components/provider_diagnostics.css | 93 | html[data-theme] #page-supportDiagnostic .am-remediation-list li { |
| apps/zte_manager/static/css/components/provider_diagnostics.css | 99 | html[data-theme] #page-supportDiagnostic .am-remediation-list strong { |
| apps/zte_manager/static/css/components/provider_diagnostics.css | 102 | html[data-theme] #page-supportDiagnostic .am-remediation-list span { |
| apps/zte_manager/static/css/components/provider_diagnostics.css | 106 | html[data-theme] #page-supportDiagnostic .am-workstation-compare { |
| apps/zte_manager/static/css/components/provider_diagnostics.css | 109 | html[data-theme] #page-supportDiagnostic .am-workstation-compare button { |
| apps/zte_manager/static/css/components/configuration_cards.css | 5 | html[data-theme] .am-wifi-card, |
| apps/zte_manager/static/css/components/configuration_cards.css | 6 | html[data-theme] .am-radio-card, |
| apps/zte_manager/static/css/components/configuration_cards.css | 7 | html[data-theme] .am-wan-card, |
| apps/zte_manager/static/css/components/configuration_cards.css | 8 | html[data-theme] .profile-radio-card{ |
| apps/zte_manager/static/css/components/configuration_cards.css | 13 | html[data-theme] #wifiNetworks, |
| apps/zte_manager/static/css/components/configuration_cards.css | 14 | html[data-theme] #wifiRadios, |
| apps/zte_manager/static/css/components/configuration_cards.css | 15 | html[data-theme] #wanConnections{ |
| apps/zte_manager/static/css/components/configuration_cards.css | 19 | html[data-theme] .am-wifi-card .ssid-card-head, |
| apps/zte_manager/static/css/components/configuration_cards.css | 20 | html[data-theme] .am-radio-card .radio-card-hero, |
| apps/zte_manager/static/css/components/configuration_cards.css | 21 | html[data-theme] .am-wan-card .wan-card-head{ |
| apps/zte_manager/static/css/components/configuration_cards.css | 28 | html[data-theme] .am-wifi-card .ssid-icon, |
| apps/zte_manager/static/css/components/configuration_cards.css | 29 | html[data-theme] .am-wan-card .wan-icon, |
| apps/zte_manager/static/css/components/configuration_cards.css | 30 | html[data-theme] .am-radio-card .radio-card-hero .material-symbols-outlined{ |
| apps/zte_manager/static/css/components/configuration_cards.css | 34 | html[data-theme] .am-wifi-card .ssid-title strong, |
| apps/zte_manager/static/css/components/configuration_cards.css | 35 | html[data-theme] .am-wan-card .wan-title-group h3, |
| apps/zte_manager/static/css/components/configuration_cards.css | 36 | html[data-theme] .am-radio-card .radio-card-hero h3{ |
| apps/zte_manager/static/css/components/configuration_cards.css | 40 | html[data-theme] .am-wifi-card .ssid-title small, |
| apps/zte_manager/static/css/components/configuration_cards.css | 41 | html[data-theme] .am-wan-card .wan-title-group p, |
| apps/zte_manager/static/css/components/configuration_cards.css | 42 | html[data-theme] .am-radio-card .radio-card-hero p{ |
| apps/zte_manager/static/css/components/configuration_cards.css | 45 | html[data-theme] .am-wifi-card .ssid-meta, |
| apps/zte_manager/static/css/components/configuration_cards.css | 46 | html[data-theme] .am-radio-card .radio-capabilities{ |
| apps/zte_manager/static/css/components/configuration_cards.css | 50 | html[data-theme] .am-wifi-card .meta-pill, |
| apps/zte_manager/static/css/components/configuration_cards.css | 51 | html[data-theme] .am-radio-card .capability-pill{ |
| apps/zte_manager/static/css/components/configuration_cards.css | 57 | html[data-theme] .am-wifi-card .ssid-form, |
| apps/zte_manager/static/css/components/configuration_cards.css | 58 | html[data-theme] .am-radio-card .radio-form{ |
| apps/zte_manager/static/css/components/configuration_cards.css | 61 | html[data-theme] .am-wifi-card .form-grid, |
| apps/zte_manager/static/css/components/configuration_cards.css | 62 | html[data-theme] .am-radio-card .form-grid, |
| apps/zte_manager/static/css/components/configuration_cards.css | 63 | html[data-theme] .am-wifi-card .switch-row{ |
| apps/zte_manager/static/css/components/configuration_cards.css | 66 | html[data-theme] .am-wifi-card .form-grid, |
| apps/zte_manager/static/css/components/configuration_cards.css | 67 | html[data-theme] .am-radio-card .form-grid{ |
| apps/zte_manager/static/css/components/configuration_cards.css | 70 | html[data-theme] .am-wifi-card .form-group, |
| apps/zte_manager/static/css/components/configuration_cards.css | 71 | html[data-theme] .am-radio-card .form-group{min-width:0;} |
| apps/zte_manager/static/css/components/configuration_cards.css | 72 | html[data-theme] .am-wifi-card .form-group label, |
| apps/zte_manager/static/css/components/configuration_cards.css | 73 | html[data-theme] .am-radio-card .form-group label{ |
| apps/zte_manager/static/css/components/configuration_cards.css | 77 | html[data-theme] .am-wifi-card :is(input,select), |
| apps/zte_manager/static/css/components/configuration_cards.css | 78 | html[data-theme] .am-radio-card :is(input,select){ |
| apps/zte_manager/static/css/components/configuration_cards.css | 82 | html[data-theme] .am-wifi-card .form-footer, |
| apps/zte_manager/static/css/components/configuration_cards.css | 83 | html[data-theme] .am-radio-card .radio-form-footer{ |
| apps/zte_manager/static/css/components/configuration_cards.css | 88 | html[data-theme] .am-wifi-card .form-footer .button.primary, |
| apps/zte_manager/static/css/components/configuration_cards.css | 89 | html[data-theme] .am-radio-card .radio-form-footer .button.primary{ |
| apps/zte_manager/static/css/components/configuration_cards.css | 92 | html[data-theme] .am-wan-card .wan-address{ |
| apps/zte_manager/static/css/components/configuration_cards.css | 96 | html[data-theme] .am-wan-card .detail-grid{ |
| apps/zte_manager/static/css/components/configuration_cards.css | 100 | html[data-theme] .am-wan-card .detail-tile{ |
| apps/zte_manager/static/css/components/configuration_cards.css | 104 | html[data-theme] .am-wan-card .wan-ipv6, |
| apps/zte_manager/static/css/components/configuration_cards.css | 105 | html[data-theme] .am-wan-card .wan-error{margin:0 20px 17px!important;overflow-wrap:anywhere;} |
| apps/zte_manager/static/css/components/configuration_cards.css | 106 | html[data-theme] .badge, |
| apps/zte_manager/static/css/components/configuration_cards.css | 107 | html[data-theme] .status-badge{font:750 10px/1.35 var(--am-font-sans)!important;border-radius:50px!important;white-space:nowrap;} |
| apps/zte_manager/static/css/components/configuration_cards.css | 108 | html[data-theme] .support-panel, |
| apps/zte_manager/static/css/components/configuration_cards.css | 109 | html[data-theme] .diagnostic-card, |
| apps/zte_manager/static/css/components/configuration_cards.css | 110 | html[data-theme] .profile-card, |
| apps/zte_manager/static/css/components/configuration_cards.css | 111 | html[data-theme] .management-pane .panel{min-width:0;} |
| apps/zte_manager/static/css/components/configuration_cards.css | 112 | html[data-theme] .dashboard-grid{ |
| apps/zte_manager/static/css/components/configuration_cards.css | 115 | html[data-theme] .dashboard-grid .span-2{grid-column:1/-1!important;} |
| apps/zte_manager/static/css/components/configuration_cards.css | 116 | html[data-theme] #page-advanced .advanced-actions button{min-height:36px!important;white-space:normal;text-align:left;} |
| apps/zte_manager/static/css/components/configuration_cards.css | 117 | html[data-theme] .kpi-grid{display:grid!important;grid-template-columns:repeat(auto-fit,minmax(min(160px,100%),1fr))!important;} |
| apps/zte_manager/static/css/components/configuration_cards.css | 118 | html[data-theme] .kpi-card{border:0!important;border-top:3px solid var(--am-color-primary)!important; |
| apps/zte_manager/static/css/components/configuration_cards.css | 120 | html[data-theme] .management-code-output{ |
| apps/zte_manager/static/css/components/configuration_cards.css | 126 | html[data-theme] .dashboard-grid{grid-template-columns:minmax(0,1fr)!important;} |
| apps/zte_manager/static/css/components/configuration_cards.css | 127 | html[data-theme] #wifiNetworks, |
| apps/zte_manager/static/css/components/configuration_cards.css | 128 | html[data-theme] #wifiRadios, |
| apps/zte_manager/static/css/components/configuration_cards.css | 129 | html[data-theme] #wanConnections{grid-template-columns:minmax(0,1fr)!important;} |
| apps/zte_manager/static/css/components/configuration_cards.css | 132 | html[data-theme] .am-wifi-card .form-grid, |
| apps/zte_manager/static/css/components/configuration_cards.css | 133 | html[data-theme] .am-radio-card .form-grid, |
| apps/zte_manager/static/css/components/configuration_cards.css | 134 | html[data-theme] .am-wan-card .detail-grid{grid-template-columns:minmax(0,1fr)!important;} |
| apps/zte_manager/static/css/components/configuration_cards.css | 135 | html[data-theme] .am-wifi-card .form-footer, |
| apps/zte_manager/static/css/components/configuration_cards.css | 136 | html[data-theme] .am-radio-card .radio-form-footer{flex-wrap:wrap;} |
| apps/zte_manager/static/css/components/history_timeline.css | 2 | html[data-theme] .am-history-timeline { |
| apps/zte_manager/static/css/components/history_timeline.css | 6 | html[data-theme] .am-history-item { |
| apps/zte_manager/static/css/components/history_timeline.css | 11 | html[data-theme] .am-history-item::before { |
| apps/zte_manager/static/css/components/history_timeline.css | 16 | html[data-theme] .am-history-item strong { |
| apps/zte_manager/static/css/components/history_timeline.css | 20 | html[data-theme] .am-history-state { |
| apps/zte_manager/static/css/components/history_timeline.css | 25 | html[data-theme] .am-history-item time { |
| apps/zte_manager/static/css/components/history_timeline.css | 29 | html[data-theme] .am-history-empty { |
| apps/zte_manager/static/css/components/history_timeline.css | 33 | html[data-theme] .am-history-backup { |
| apps/zte_manager/static/css/components/history_timeline.css | 39 | html[data-theme] .am-history-item{grid-template-columns:minmax(0,1fr);} |
| apps/zte_manager/static/css/components/history_timeline.css | 40 | html[data-theme] .am-history-state{justify-self:start;} |
| apps/zte_manager/static/css/components/structured_forms.css | 5 | html[data-theme] .am-structured-ready .am-source-json.am-editor-mounted{display:none!important;} |
| apps/zte_manager/static/css/components/structured_forms.css | 6 | html[data-theme] .am-form-editor{ |
| apps/zte_manager/static/css/components/structured_forms.css | 11 | html[data-theme] .am-form-editor-head{display:flex;flex-direction:column;gap:4px; |
| apps/zte_manager/static/css/components/structured_forms.css | 13 | html[data-theme] .am-form-editor-head strong{font:760 14px var(--am-font-sans);color:var(--am-color-text);} |
| apps/zte_manager/static/css/components/structured_forms.css | 14 | html[data-theme] .am-form-editor-head small{font:450 11px/1.6 var(--am-font-sans);color:var(--am-color-text-muted);} |
| apps/zte_manager/static/css/components/structured_forms.css | 15 | html[data-theme] .am-form-editor-content{display:grid;gap:13px;min-width:0; |
| apps/zte_manager/static/css/components/structured_forms.css | 17 | html[data-theme] .am-editor-group{border:1px solid var(--am-color-border);border-radius:10px; |
| apps/zte_manager/static/css/components/structured_forms.css | 20 | html[data-theme] .am-editor-group legend{padding:0 7px;color:var(--am-color-primary-strong); |
| apps/zte_manager/static/css/components/structured_forms.css | 22 | html[data-theme] .am-editor-field{display:flex;flex-direction:column;gap:6px; |
| apps/zte_manager/static/css/components/structured_forms.css | 24 | html[data-theme] .am-editor-field>input:not([type=checkbox]){ |
| apps/zte_manager/static/css/components/structured_forms.css | 28 | html[data-theme] .am-editor-field.am-editor-toggle{flex-direction:row;align-items:center; |
| apps/zte_manager/static/css/components/structured_forms.css | 30 | html[data-theme] .am-editor-toggle input{width:18px;height:18px;accent-color:var(--am-color-primary-strong);} |
| apps/zte_manager/static/css/components/structured_forms.css | 31 | html[data-theme] .am-add-setting,html[data-theme] .am-remove-setting{ |
| apps/zte_manager/static/css/components/structured_forms.css | 36 | html[data-theme] .am-remove-setting{border-style:solid;color:var(--am-color-danger); |
| apps/zte_manager/static/css/components/structured_forms.css | 38 | html[data-theme] .am-dynamic-field{display:grid;grid-template-columns:1fr .7fr 1fr auto; |
| apps/zte_manager/static/css/components/structured_forms.css | 40 | html[data-theme] .am-dynamic-field input,html[data-theme] .am-dynamic-field select{ |
| apps/zte_manager/static/css/components/structured_forms.css | 43 | html[data-theme] .am-form-editor-feedback{font:600 11px var(--am-font-sans); |
| apps/zte_manager/static/css/components/structured_forms.css | 45 | html[data-theme] .am-editor-field input:focus-visible, |
| apps/zte_manager/static/css/components/structured_forms.css | 46 | html[data-theme] .am-dynamic-field input:focus-visible{ |
| apps/zte_manager/static/css/components/structured_forms.css | 56 | html[data-theme] #page-profiles #profileRadios{ |
| apps/zte_manager/static/css/components/structured_forms.css | 60 | html[data-theme] #page-profiles .profile-radio-card{ |
| apps/zte_manager/static/css/components/structured_forms.css | 64 | html[data-theme] #page-profiles .profile-radio-card .profile-fields{ |
| apps/zte_manager/static/css/components/structured_forms.css | 68 | html[data-theme] #page-profiles .profile-radio-card .profile-fields>.muted{ |
| apps/zte_manager/static/css/components/structured_forms.css | 73 | html[data-theme] #page-profiles .profile-radio-card .checkbox-container{ |
| apps/zte_manager/static/css/components/structured_forms.css | 78 | html[data-theme] .am-dynamic-field{grid-template-columns:minmax(0,1fr) minmax(0,1fr);} |
| apps/zte_manager/static/css/components/native_controls_light.css | 2 | html[data-theme="light"] select, |
| apps/zte_manager/static/css/components/native_controls_light.css | 3 | html[data-theme="light"] select option, |
| apps/zte_manager/static/css/components/native_controls_light.css | 4 | html[data-theme="light"] select optgroup, |
| apps/zte_manager/static/css/components/native_controls_light.css | 5 | html[data-theme="light"] .field select, |
| apps/zte_manager/static/css/components/native_controls_light.css | 6 | html[data-theme="light"] .form-group select, |
| apps/zte_manager/static/css/components/native_controls_light.css | 7 | html[data-theme="light"] input:not([type="checkbox"]):not([type="radio"]), |
| apps/zte_manager/static/css/components/native_controls_light.css | 8 | html[data-theme="light"] textarea { |
| apps/zte_manager/static/css/components/native_controls_light.css | 15 | html[data-theme="light"] select option:checked { |
| apps/zte_manager/static/css/components/native_controls_light.css | 20 | html[data-theme="light"] select option:disabled { |
| apps/zte_manager/static/css/components/native_controls_light.css | 25 | html[data-theme="light"] .card, |
| apps/zte_manager/static/css/components/native_controls_light.css | 26 | html[data-theme="light"] .capability-card, |
| apps/zte_manager/static/css/components/native_controls_light.css | 27 | html[data-theme="light"] .feature-item, |
| apps/zte_manager/static/css/components/native_controls_light.css | 28 | html[data-theme="light"] .advanced-card, |
| apps/zte_manager/static/css/components/native_controls_light.css | 29 | html[data-theme="light"] .history-card, |
| apps/zte_manager/static/css/components/native_controls_light.css | 30 | html[data-theme="light"] #trackerDiscoverySection .operation-row, |
| apps/zte_manager/static/css/components/native_controls_light.css | 31 | html[data-theme="light"] #page-advanced .operation-row, |
| apps/zte_manager/static/css/components/native_controls_light.css | 32 | html[data-theme="light"] .hero-flow > div { |
| apps/zte_manager/static/css/components/native_controls_light.css | 39 | html[data-theme="light"] .capability-card strong, |
| apps/zte_manager/static/css/components/native_controls_light.css | 40 | html[data-theme="light"] .hero-flow > div strong, |
| apps/zte_manager/static/css/components/native_controls_light.css | 41 | html[data-theme="light"] #page-advanced .operation-row strong { |
| apps/zte_manager/static/css/components/native_controls_light.css | 45 | html[data-theme="light"] .capability-card p, |
| apps/zte_manager/static/css/components/native_controls_light.css | 46 | html[data-theme="light"] .capability-card .operation-meta, |
| apps/zte_manager/static/css/components/native_controls_light.css | 47 | html[data-theme="light"] .hero-flow > div small, |
| apps/zte_manager/static/css/components/native_controls_light.css | 48 | html[data-theme="light"] #trackerDiscoveryStatus, |
| apps/zte_manager/static/css/components/native_controls_light.css | 49 | html[data-theme="light"] #trackerDiscoverySection .muted, |
| apps/zte_manager/static/css/components/native_controls_light.css | 50 | html[data-theme="light"] #page-advanced .operation-row .muted { |
| apps/zte_manager/static/css/components/native_controls_light.css | 54 | html[data-theme="light"] .hero-flow > div > span { |
| apps/zte_manager/static/css/components/operator_results.css | 2 | html[data-theme] .am-operator-result{ |
| apps/zte_manager/static/css/components/operator_results.css | 6 | html[data-theme] .am-result-title{color:var(--am-color-text);font:760 14px var(--am-font-sans);} |
| apps/zte_manager/static/css/components/operator_results.css | 7 | html[data-theme] .am-result-grid{ |
| apps/zte_manager/static/css/components/operator_results.css | 10 | html[data-theme] .am-result-cell{ |
| apps/zte_manager/static/css/components/operator_results.css | 14 | html[data-theme] .am-result-cell dt{font:760 10px var(--am-font-sans);color:var(--am-color-text-muted);margin-bottom:5px;} |
| apps/zte_manager/static/css/components/operator_results.css | 15 | html[data-theme] .am-result-cell dd{margin:0;font:550 12px/1.6 var(--am-font-sans);} |
| apps/zte_manager/static/css/components/operator_results.css | 16 | html[data-theme] .am-result-items{display:grid;gap:8px;} |
| apps/zte_manager/static/css/components/operator_results.css | 17 | html[data-theme] .am-result-record{padding:9px;border-radius:8px;border:1px solid var(--am-color-border);} |
| apps/zte_manager/static/css/components/operator_results.css | 18 | html[data-theme] .am-result-alert{ |
| apps/zte_manager/static/css/components/operator_results.css | 22 | html[data-theme] .am-result-empty{color:var(--am-color-text-muted);} |
| apps/zte_manager/static/css/components/operator_results.css | 23 | html[data-theme] pre.management-code-output{ |
| apps/zte_manager/static/css/components/shell_layout.css | 4 | html[data-theme] { |
| apps/zte_manager/static/css/components/shell_layout.css | 8 | html[data-theme][data-sidebar-collapsed="true"] { |
| apps/zte_manager/static/css/components/shell_layout.css | 11 | html[data-theme] body { |
| apps/zte_manager/static/css/components/shell_layout.css | 15 | html[data-theme] .app-shell { |
| apps/zte_manager/static/css/components/shell_layout.css | 23 | html[data-theme] .app-shell>.sidebar { |
| apps/zte_manager/static/css/components/shell_layout.css | 34 | html[data-theme] .app-shell>.workspace { |
| apps/zte_manager/static/css/components/shell_layout.css | 43 | html[data-theme] .app-shell>.workspace>.console-ribbon { |
| apps/zte_manager/static/css/components/shell_layout.css | 47 | html[data-theme] .app-shell>.workspace>.topbar { |
| apps/zte_manager/static/css/components/shell_layout.css | 52 | html[data-theme] .app-shell>.workspace>.main-content { |
| apps/zte_manager/static/css/components/shell_layout.css | 57 | html[data-theme] .app-shell .sidebar .brand-row { |
| apps/zte_manager/static/css/components/shell_layout.css | 61 | html[data-theme] .app-shell .sidebar .nav-menu { |
| apps/zte_manager/static/css/components/shell_layout.css | 65 | html[data-theme] .app-shell .sidebar .menu-item { |
| apps/zte_manager/static/css/components/shell_layout.css | 68 | html[data-theme] .app-shell .sidebar .sidebar-bottom { |
| apps/zte_manager/static/css/components/shell_layout.css | 71 | html[data-theme] .app-shell .sidebar.is-collapsed { |
| apps/zte_manager/static/css/components/shell_layout.css | 74 | html[data-theme] .app-shell .sidebar.is-collapsed .brand-row { |
| apps/zte_manager/static/css/components/shell_layout.css | 78 | html[data-theme] .app-shell .sidebar.is-collapsed .brand-mark { |
| apps/zte_manager/static/css/components/shell_layout.css | 81 | html[data-theme] .app-shell .sidebar.is-collapsed .brand-copy, |
| apps/zte_manager/static/css/components/shell_layout.css | 82 | html[data-theme] .app-shell .sidebar.is-collapsed .target-card, |
| apps/zte_manager/static/css/components/shell_layout.css | 83 | html[data-theme] .app-shell .sidebar.is-collapsed .nav-caption, |
| apps/zte_manager/static/css/components/shell_layout.css | 84 | html[data-theme] .app-shell .sidebar.is-collapsed .nav-group-label, |
| apps/zte_manager/static/css/components/shell_layout.css | 85 | html[data-theme] .app-shell .sidebar.is-collapsed .menu-item::before, |
| apps/zte_manager/static/css/components/shell_layout.css | 86 | html[data-theme] .app-shell .sidebar.is-collapsed .menu-item>span:not(.material-symbols-outlined), |
| apps/zte_manager/static/css/components/shell_layout.css | 87 | html[data-theme] .app-shell .sidebar.is-collapsed .connection-state>div, |
| apps/zte_manager/static/css/components/shell_layout.css | 88 | html[data-theme] .app-shell .sidebar.is-collapsed #disconnectButton { |
| apps/zte_manager/static/css/components/shell_layout.css | 91 | html[data-theme] .app-shell .sidebar.is-collapsed .brand-row .shell-control { |
| apps/zte_manager/static/css/components/shell_layout.css | 94 | html[data-theme] .app-shell .sidebar.is-collapsed .menu-item { |
| apps/zte_manager/static/css/components/shell_layout.css | 98 | html[data-theme] .app-shell .sidebar.is-collapsed .connection-state { |
| apps/zte_manager/static/css/components/shell_layout.css | 101 | html[data-theme] .app-shell>.workspace .am-workspace-title { |
| apps/zte_manager/static/css/components/shell_layout.css | 104 | html[data-theme] .app-shell>.workspace .am-workspace-tools { |
| apps/zte_manager/static/css/components/shell_layout.css | 109 | html[data-theme] .app-shell>.workspace .am-workspace-tools>* { |
| apps/zte_manager/static/css/components/shell_layout.css | 112 | html[data-theme] .app-shell>.workspace #topDeviceChip { |
| apps/zte_manager/static/css/components/shell_layout.css | 115 | html[data-theme] .app-shell>.workspace #topDeviceMeta { |
| apps/zte_manager/static/css/components/shell_layout.css | 118 | html[data-theme] .app-shell>.workspace .page { |
| apps/zte_manager/static/css/components/shell_layout.css | 122 | html[data-theme] .app-shell>.workspace .page .panel, |
| apps/zte_manager/static/css/components/shell_layout.css | 123 | html[data-theme] .app-shell>.workspace .page fieldset, |
| apps/zte_manager/static/css/components/shell_layout.css | 124 | html[data-theme] .app-shell>.workspace .page .support-output { |
| apps/zte_manager/static/css/components/shell_layout.css | 128 | html[data-theme] .app-shell { |
| apps/zte_manager/static/css/components/shell_layout.css | 131 | html[data-theme] .app-shell .menu-item { |
| apps/zte_manager/static/css/components/shell_layout.css | 134 | html[data-theme] .app-shell .sidebar .nav-group-label { |
| apps/zte_manager/static/css/components/shell_layout.css | 137 | html[data-theme] .app-shell .am-workspace-title h1 { |
| apps/zte_manager/static/css/components/shell_layout.css | 141 | html[data-theme] .app-shell .am-workspace-title p, |
| apps/zte_manager/static/css/components/shell_layout.css | 142 | html[data-theme] .app-shell .section-intro p { |
| apps/zte_manager/static/css/components/shell_layout.css | 145 | html[data-theme] .app-shell .section-intro h2 { |
| apps/zte_manager/static/css/components/shell_layout.css | 149 | html[data-theme] .app-shell .field>span, |
| apps/zte_manager/static/css/components/shell_layout.css | 150 | html[data-theme] .app-shell .check-row, |
| apps/zte_manager/static/css/components/shell_layout.css | 151 | html[data-theme] .app-shell .support-output, |
| apps/zte_manager/static/css/components/shell_layout.css | 152 | html[data-theme] .app-shell .adaptive-choice { |
| apps/zte_manager/static/css/components/shell_layout.css | 155 | html[data-theme] .app-shell .adaptive-choice-note { |
| apps/zte_manager/static/css/components/shell_layout.css | 158 | html[data-theme] .app-shell input, |
| apps/zte_manager/static/css/components/shell_layout.css | 159 | html[data-theme] .app-shell select, |
| apps/zte_manager/static/css/components/shell_layout.css | 160 | html[data-theme] .app-shell textarea, |
| apps/zte_manager/static/css/components/shell_layout.css | 161 | html[data-theme] .app-shell button { |
| apps/zte_manager/static/css/components/shell_layout.css | 164 | html[data-theme] .app-shell .sidebar .menu-item .material-symbols-outlined, |
| apps/zte_manager/static/css/components/shell_layout.css | 165 | html[data-theme] .app-shell .am-workspace-tools .material-symbols-outlined { |
| apps/zte_manager/static/css/components/shell_layout.css | 168 | html[data-theme] .app-shell>.workspace .am-workspace-tools .zoom-control { |
| apps/zte_manager/static/css/components/shell_layout.css | 174 | html[data-theme] .app-shell { |
| apps/zte_manager/static/css/components/shell_layout.css | 177 | html[data-theme] .app-shell>.sidebar:not(.am-mobile-open) { |
| apps/zte_manager/static/css/components/shell_layout.css | 180 | html[data-theme] .app-shell>.sidebar:not(.am-mobile-open) .brand-row { |
| apps/zte_manager/static/css/components/shell_layout.css | 184 | html[data-theme] .app-shell>.sidebar:not(.am-mobile-open) .brand-copy, |
| apps/zte_manager/static/css/components/shell_layout.css | 185 | html[data-theme] .app-shell>.sidebar:not(.am-mobile-open) .target-card, |
| apps/zte_manager/static/css/components/shell_layout.css | 186 | html[data-theme] .app-shell>.sidebar:not(.am-mobile-open) .nav-group-label, |
| apps/zte_manager/static/css/components/shell_layout.css | 187 | html[data-theme] .app-shell>.sidebar:not(.am-mobile-open) .menu-item::before, |
| apps/zte_manager/static/css/components/shell_layout.css | 188 | html[data-theme] .app-shell>.sidebar:not(.am-mobile-open) .menu-item>span:not(.material-symbols-outlined), |
| apps/zte_manager/static/css/components/shell_layout.css | 189 | html[data-theme] .app-shell>.sidebar:not(.am-mobile-open) .connection-state>div, |
| apps/zte_manager/static/css/components/shell_layout.css | 190 | html[data-theme] .app-shell>.sidebar:not(.am-mobile-open) #disconnectButton { |
| apps/zte_manager/static/css/components/shell_layout.css | 193 | html[data-theme] .app-shell>.sidebar:not(.am-mobile-open) .menu-item { |
| apps/zte_manager/static/css/components/shell_layout.css | 196 | html[data-theme] .app-shell>.sidebar.am-mobile-open { |
| apps/zte_manager/static/css/components/shell_layout.css | 203 | html[data-theme] .app-shell>.sidebar.am-mobile-open .brand-copy, |
| apps/zte_manager/static/css/components/shell_layout.css | 204 | html[data-theme] .app-shell>.sidebar.am-mobile-open .target-card, |
| apps/zte_manager/static/css/components/shell_layout.css | 205 | html[data-theme] .app-shell>.sidebar.am-mobile-open .nav-group-label, |
| apps/zte_manager/static/css/components/shell_layout.css | 206 | html[data-theme] .app-shell>.sidebar.am-mobile-open .menu-item>span:not(.material-symbols-outlined), |
| apps/zte_manager/static/css/components/shell_layout.css | 207 | html[data-theme] .app-shell>.sidebar.am-mobile-open .connection-state>div { |
| apps/zte_manager/static/css/components/shell_layout.css | 210 | html[data-theme] .app-shell>.sidebar.am-mobile-open .brand-row { |
| apps/zte_manager/static/css/components/shell_layout.css | 213 | html[data-theme] .app-shell>.sidebar.am-mobile-open .menu-item { |
| apps/zte_manager/static/css/components/shell_layout.css | 216 | html[data-theme] .app-shell>.workspace .am-workspace-tools { |
| apps/zte_manager/static/css/components/shell_layout.css | 220 | html[data-theme] #amSidebarBackdrop:not([hidden]) { |
| apps/zte_manager/static/css/components/shell_layout.css | 224 | html[data-theme] #amSidebarBackdrop[hidden] {display:none!important;} |
| apps/zte_manager/static/css/components/shell_layout.css | 226 | html[data-theme] .app-shell>.sidebar { |
| apps/zte_manager/static/css/components/shell_layout.css | 231 | html[data-theme] .app-shell>.sidebar .brand-row, |
| apps/zte_manager/static/css/components/shell_layout.css | 232 | html[data-theme] .app-shell>.sidebar .sidebar-bottom { |
| apps/zte_manager/static/css/components/shell_layout.css | 235 | html[data-theme] .app-shell>.sidebar .nav-menu { |
| apps/zte_manager/static/css/components/shell_layout.css | 241 | html[data-theme] .app-shell>.sidebar .menu-item { |
| apps/zte_manager/static/css/components/shell_layout.css | 244 | html[data-theme] .app-shell>.workspace .zoom-control { |
| apps/zte_manager/static/css/components/shell_layout.css | 249 | html[data-theme] .app-shell>.sidebar {transition:none!important;} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 2 | html[data-theme] .am-session-bar{ |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 8 | html[data-theme] .am-session-context{display:inline-flex;align-items:center;gap:7px;} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 9 | html[data-theme] .am-session-context .material-symbols-outlined{font-size:15px;color:var(--am-color-primary-strong);} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 10 | html[data-theme] .am-context-separator{color:var(--am-color-border);margin:0 3px;} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 11 | html[data-theme] .am-session-data{display:flex;gap:13px;align-items:center;min-width:0;} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 12 | html[data-theme] .am-session-indicator{display:inline-flex;align-items:center;gap:6px;} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 13 | html[data-theme] .am-session-data .mono{overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:220px;} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 14 | html[data-theme] .am-workspace-header{ |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 19 | html[data-theme] .am-workspace-title{min-width:210px;flex:1 1 250px;} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 20 | html[data-theme] .am-workspace-title .eyebrow{ |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 24 | html[data-theme] .am-workspace-title h1{font:800 clamp(23px,2.45vw,33px)/1.2 var(--am-font-sans)!important;letter-spacing:-.045em!important;} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 25 | html[data-theme] .am-workspace-title p{font:450 12px/1.7 var(--am-font-sans)!important;margin-top:3px;max-width:66ch;} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 26 | html[data-theme] .am-workspace-tools{display:flex;flex-wrap:wrap;justify-content:flex-end;align-items:center;gap:9px;} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 27 | html[data-theme] .am-quick-tools{display:flex;gap:6px;padding-right:8px;border-right:1px solid var(--am-color-border);} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 28 | html[data-theme] .am-quick-tools .console-action{ |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 32 | html[data-theme] .am-quick-tools .console-action.primary{ |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 35 | html[data-theme] .am-quick-tools .console-action .material-symbols-outlined{font-size:17px;} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 36 | html[data-theme] .am-appearance{gap:5px;padding:0 3px!important;} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 37 | html[data-theme] .am-appearance .material-symbols-outlined{font-size:17px;color:var(--am-color-primary-strong);} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 38 | html[data-theme] .am-appearance select{border-radius:8px!important;height:34px!important;min-width:101px!important;} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 39 | html[data-theme] .zoom-control{border:1px solid var(--am-color-border)!important;border-radius:8px!important;padding:1px!important;} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 40 | html[data-theme] .zoom-control button{min-height:30px!important;border:0!important;} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 41 | html[data-theme] .sidebar .brand-row{padding:8px 5px 14px!important;border-bottom:1px solid var(--am-color-border);min-height:70px!important;} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 42 | html[data-theme] .sidebar .brand-copy strong{font-size:15px!important;letter-spacing:-.055em;} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 43 | html[data-theme] .sidebar .brand-copy span{font:500 9px/1.6 var(--am-font-sans)!important;} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 44 | html[data-theme] .sidebar .nav-menu{padding-top:6px!important;gap:2px!important;} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 45 | html[data-theme] .sidebar .menu-item{min-height:38px!important;font-size:12px!important;} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 46 | html[data-theme] .sidebar .nav-group-label{margin-top:6px!important;padding-top:14px!important;} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 47 | html[data-theme] .sidebar .menu-item.active{box-shadow:inset 3px 0 0 var(--am-color-primary)!important;} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 48 | html[data-theme] .main-content{max-width:none!important;padding:18px clamp(18px,2.4vw,34px) 55px!important;} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 51 | html[data-theme] .login-layout{ |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 56 | html[data-theme] .am-connect-story{ |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 62 | html[data-theme] .am-connect-story::before{ |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 66 | html[data-theme] .am-story-chip{ |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 71 | html[data-theme] .am-story-chip .material-symbols-outlined{font-size:15px;} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 72 | html[data-theme] .am-connect-story h2{ |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 76 | html[data-theme] .am-connect-story h2 em{color:var(--am-color-primary-strong)!important;font-style:normal;} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 77 | html[data-theme] .am-connect-story p{ |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 81 | html[data-theme] .am-story-art{width:100%;display:flex;justify-content:center;align-items:center;max-height:250px;overflow:hidden;} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 82 | html[data-theme] .am-story-art svg{width:min(100%,430px);height:auto;color:var(--am-color-primary);} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 83 | html[data-theme] .am-story-steps{ |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 88 | html[data-theme] .am-story-steps span:not(.am-step-line){display:inline-flex;align-items:center;gap:7px;} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 89 | html[data-theme] .am-story-steps b{color:var(--am-color-primary-strong);font:800 11px var(--am-font-mono);} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 90 | html[data-theme] .am-step-line{flex:1;min-width:10px;height:1px;background:var(--am-color-border);} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 91 | html[data-theme] .login-panel{ |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 96 | html[data-theme] .login-panel .panel-heading{margin-bottom:25px!important;} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 97 | html[data-theme] .login-panel .panel-heading .heading-icon{ |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 101 | html[data-theme] .login-panel .form-stack{gap:18px!important;} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 102 | html[data-theme] .login-panel #connectButton{ |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 107 | html[data-theme] .am-section-intro{ |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 114 | html[data-theme] .am-section-intro>div:first-child{position:relative;padding-left:70px;min-height:54px;min-width:0;} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 115 | html[data-theme] .am-page-emblem{ |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 121 | html[data-theme] .am-section-intro .section-kicker{ |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 125 | html[data-theme] .am-section-intro h2{ |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 129 | html[data-theme] .am-section-intro p{ |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 133 | html[data-theme] .am-section-intro .advanced-actions{align-items:flex-end;justify-content:flex-end;max-width:min(570px,100%);gap:6px!important;} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 134 | html[data-theme] .subsection-title{ |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 139 | html[data-theme] .subsection-title>div{display:flex!important;align-items:center!important;gap:8px;} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 140 | html[data-theme] .subsection-title .material-symbols-outlined{color:var(--am-color-primary-strong)!important;} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 141 | html[data-theme] .subsection-title h3{font:750 16px/1.4 var(--am-font-sans)!important;letter-spacing:-.025em;} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 142 | html[data-theme] .subsection-title>span{color:var(--am-color-text-muted)!important;font:450 11px/1.6 var(--am-font-sans)!important;} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 143 | html[data-theme] .panel{ |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 147 | html[data-theme] .panel-header{border-bottom:1px solid var(--am-color-border)!important;margin-bottom:17px!important;padding-bottom:13px!important;gap:12px;} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 148 | html[data-theme] .panel-header h3{font:750 14px/1.35 var(--am-font-sans)!important;letter-spacing:-.025em;} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 149 | html[data-theme] .panel-header .section-kicker{font:750 9px/1.5 var(--am-font-sans)!important;color:var(--am-color-primary-strong)!important;letter-spacing:.075em!important;} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 150 | html[data-theme] .button, |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 151 | html[data-theme] button.button, |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 152 | html[data-theme] .management-tab{transition:background .15s,border .15s,transform .15s;} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 153 | html[data-theme] .button{min-height:39px!important;display:inline-flex;gap:7px;align-items:center;justify-content:center;} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 154 | html[data-theme] .button.primary{background:var(--am-color-primary-strong)!important;color:#fff!important;border-color:var(--am-color-primary-strong)!important;} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 155 | html[data-theme="dark"] .button.primary{background:var(--am-color-primary)!important;color:var(--am-color-primary-ink)!important;border-color:var(--am-color-primary)!important;} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 156 | html[data-theme] .field>span{font:750 10px/1.5 var(--am-font-sans)!important;letter-spacing:.04em!important;} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 157 | html[data-theme] .field :is(input,select,textarea){min-height:39px!important;transition:border .15s,box-shadow .15s;} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 158 | html[data-theme] .field :is(input,select,textarea):focus{box-shadow:0 0 0 3px var(--am-color-primary-wash)!important;border-color:var(--am-color-primary)!important;} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 159 | html[data-theme] .management-tabs{ |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 164 | html[data-theme] .management-tab{ |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 168 | html[data-theme] .management-tab.active{ |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 172 | html[data-theme] .management-pane .management-grid, |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 173 | html[data-theme] .management-pane .two-column-layout{gap:13px!important;} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 174 | html[data-theme] .management-status-strip{ |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 178 | html[data-theme] .management-status-strip>div{ |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 182 | html[data-theme] .management-status-strip strong{color:var(--am-color-text)!important;} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 184 | html[data-theme] .am-workspace-tools{justify-content:flex-start;} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 185 | html[data-theme] .am-quick-tools{display:none!important;} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 188 | html[data-theme] .login-layout{grid-template-columns:minmax(0,1fr)!important;} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 189 | html[data-theme] .am-connect-story{min-height:initial!important;gap:0;} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 190 | html[data-theme] .am-story-art{max-height:180px;} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 191 | html[data-theme] .am-connect-story h2{max-width:none!important;} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 192 | html[data-theme] .am-section-intro{flex-wrap:wrap;} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 193 | html[data-theme] .management-status-strip{grid-template-columns:repeat(2,minmax(0,1fr));} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 196 | html[data-theme] .am-session-bar{font-size:9px;flex-wrap:wrap;padding-block:7px!important;} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 197 | html[data-theme] .am-session-data .mono{max-width:100px;} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 198 | html[data-theme] .am-story-art{display:none;} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 199 | html[data-theme] .am-connect-story{padding:26px!important;} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 200 | html[data-theme] .am-section-intro>div:first-child{padding-left:0;padding-top:62px;} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 201 | html[data-theme] .am-page-emblem{top:0;left:0;} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 202 | html[data-theme] .am-section-intro .advanced-actions{max-width:100%;} |
| apps/zte_manager/static/css/layout/editorial_workspace.css | 203 | html[data-theme] .am-control-label{display:none;} |
| apps/zte_manager/static/css/foundation/tangerine_tokens.css | 8 | html[data-theme="light"] { |
| apps/zte_manager/static/css/foundation/tangerine_tokens.css | 44 | html[data-theme="dark"] { |
| apps/zte_manager/static/css/foundation/tangerine_tokens.css | 79 | html[data-theme] { |
| apps/zte_manager/static/css/pages/clients_tangerine.css | 2 | html[data-theme] #page-clients .am-section-intro { |
| apps/zte_manager/static/css/pages/clients_tangerine.css | 6 | html[data-theme] .am-client-header-actions {display:flex;flex-wrap:wrap;align-items:center;gap:9px;min-width:0;} |
| apps/zte_manager/static/css/pages/clients_tangerine.css | 7 | html[data-theme] .am-client-search { |
| apps/zte_manager/static/css/pages/clients_tangerine.css | 12 | html[data-theme] .am-client-search .material-symbols-outlined {font-size:18px;} |
| apps/zte_manager/static/css/pages/clients_tangerine.css | 13 | html[data-theme] .am-client-search input { |
| apps/zte_manager/static/css/pages/clients_tangerine.css | 18 | html[data-theme] .am-client-search:focus-within {outline:2px solid var(--am-color-primary-strong);outline-offset:2px;} |
| apps/zte_manager/static/css/pages/clients_tangerine.css | 19 | html[data-theme] #clientsRefreshButton {display:inline-flex;align-items:center;gap:7px;min-height:39px;font-size:12px!important;} |
| apps/zte_manager/static/css/pages/clients_tangerine.css | 20 | html[data-theme] .am-client-workbench {min-width:0;display:flex;flex-direction:column;gap:12px;padding:5px 0;} |
| apps/zte_manager/static/css/pages/clients_tangerine.css | 21 | html[data-theme] .am-client-workbench .am-workbench-tabs { |
| apps/zte_manager/static/css/pages/clients_tangerine.css | 24 | html[data-theme] .am-client-workbench .am-toolpanel {margin:0!important;animation:none!important;} |
| apps/zte_manager/static/css/pages/clients_tangerine.css | 25 | html[data-theme] .am-client-workbench .panel.table-panel { |
| apps/zte_manager/static/css/pages/clients_tangerine.css | 28 | html[data-theme] .am-client-workbench .panel-header { |
| apps/zte_manager/static/css/pages/clients_tangerine.css | 32 | html[data-theme] .am-client-workbench .table-wrap {max-width:100%;overflow:auto;} |
| apps/zte_manager/static/css/pages/clients_tangerine.css | 33 | html[data-theme] .am-client-workbench table {min-width:630px;width:100%;table-layout:auto;} |
| apps/zte_manager/static/css/pages/clients_tangerine.css | 34 | html[data-theme] .am-client-workbench th { |
| apps/zte_manager/static/css/pages/clients_tangerine.css | 39 | html[data-theme] .am-client-workbench td { |
| apps/zte_manager/static/css/pages/clients_tangerine.css | 43 | html[data-theme] .am-client-workbench tr[hidden] {display:none!important;} |
| apps/zte_manager/static/css/pages/clients_tangerine.css | 44 | html[data-theme] #page-clients .client-counter-row {margin:0!important;justify-content:flex-end;min-width:160px;} |
| apps/zte_manager/static/css/pages/clients_tangerine.css | 45 | html[data-theme] #page-clients .client-counter-row>div { |
| apps/zte_manager/static/css/pages/clients_tangerine.css | 50 | html[data-theme] #page-clients .am-section-intro { |
| apps/zte_manager/static/css/pages/clients_tangerine.css | 53 | html[data-theme] #page-clients .client-counter-row { |
| apps/zte_manager/static/css/pages/clients_tangerine.css | 58 | html[data-theme] #page-clients .am-section-intro { |
| apps/zte_manager/static/css/pages/clients_tangerine.css | 61 | html[data-theme] .am-client-search{min-width:160px;} |
| apps/zte_manager/static/css/pages/clients_tangerine.css | 62 | html[data-theme] #page-clients .client-counter-row{grid-column:auto;} |
| apps/zte_manager/static/css/pages/diagnostics_tangerine.css | 2 | html[data-theme] .am-diagnostic-workspace.am-diagnostic-tabbed { |
| apps/zte_manager/static/css/pages/diagnostics_tangerine.css | 6 | html[data-theme] .am-diagnostic-tabbed .am-diagnostic-tabs { |
| apps/zte_manager/static/css/pages/diagnostics_tangerine.css | 10 | html[data-theme] .am-diagnostic-tabbed .am-toolpanel { |
| apps/zte_manager/static/css/pages/diagnostics_tangerine.css | 13 | html[data-theme] .am-diagnostic-tabbed .diagnostic-card { |
| apps/zte_manager/static/css/pages/diagnostics_tangerine.css | 18 | html[data-theme] .am-diagnostic-tabbed .diagnostic-card .panel-header { |
| apps/zte_manager/static/css/pages/diagnostics_tangerine.css | 22 | html[data-theme] .am-diagnostic-tabbed .diagnostic-card .form-stack { |
| apps/zte_manager/static/css/pages/diagnostics_tangerine.css | 26 | html[data-theme] .am-diagnostic-tabbed .diagnostic-card pre.terminal-output { |
| apps/zte_manager/static/css/pages/diagnostics_tangerine.css | 33 | html[data-theme] .am-diagnostic-tabbed .diagnostic-card button[type=submit] { |
| apps/zte_manager/static/css/pages/diagnostics_tangerine.css | 38 | html[data-theme] .am-diagnostic-tabbed .diagnostic-card { |
| apps/zte_manager/static/css/pages/diagnostics_tangerine.css | 41 | html[data-theme] .am-diagnostic-tabbed .diagnostic-card pre.terminal-output { |
| apps/zte_manager/static/css/pages/profile_workbench.css | 2 | html[data-theme] .am-profile-workspace .profile-banner{ |
| apps/zte_manager/static/css/pages/profile_workbench.css | 7 | html[data-theme] .am-profile-workspace .profile-banner .section-kicker{ |
| apps/zte_manager/static/css/pages/profile_workbench.css | 10 | html[data-theme] .am-profile-workspace .profile-banner>strong{ |
| apps/zte_manager/static/css/pages/profile_workbench.css | 13 | html[data-theme] .am-profile-workspace .profile-banner>p{ |
| apps/zte_manager/static/css/pages/profile_workbench.css | 16 | html[data-theme] .am-profile-workspace #profileRadios{ |
| apps/zte_manager/static/css/pages/profile_workbench.css | 20 | html[data-theme] .am-profile-workspace .profile-actions{ |
| apps/zte_manager/static/css/pages/profile_workbench.css | 23 | html[data-theme] .am-profile-workspace .profile-action-success{ |
| apps/zte_manager/static/css/pages/profile_workbench.css | 27 | html[data-theme] .am-profile-workspace .profile-action-error{ |
| apps/zte_manager/static/css/pages/device_tangerine.css | 2 | html[data-theme] .am-device-summary { |
| apps/zte_manager/static/css/pages/device_tangerine.css | 8 | html[data-theme] .am-device-identity {display:flex;align-items:center;gap:16px;min-width:0;} |
| apps/zte_manager/static/css/pages/device_tangerine.css | 9 | html[data-theme] .am-device-emblem { |
| apps/zte_manager/static/css/pages/device_tangerine.css | 14 | html[data-theme] .am-device-state { |
| apps/zte_manager/static/css/pages/device_tangerine.css | 19 | html[data-theme] .am-device-state::before {content:"";height:6px;width:6px;background:currentColor;border-radius:50%;} |
| apps/zte_manager/static/css/pages/device_tangerine.css | 20 | html[data-theme] .am-device-identity h3 { |
| apps/zte_manager/static/css/pages/device_tangerine.css | 25 | html[data-theme] .am-device-identity .mono { |
| apps/zte_manager/static/css/pages/device_tangerine.css | 29 | html[data-theme] .am-device-tools {display:flex;align-items:center;gap:9px;flex-wrap:wrap;} |
| apps/zte_manager/static/css/pages/device_tangerine.css | 30 | html[data-theme] .am-device-tools .button { |
| apps/zte_manager/static/css/pages/device_tangerine.css | 33 | html[data-theme] .am-device-stats { |
| apps/zte_manager/static/css/pages/device_tangerine.css | 36 | html[data-theme] .am-device-stats .panel { |
| apps/zte_manager/static/css/pages/device_tangerine.css | 39 | html[data-theme] .am-device-stats .panel-header { |
| apps/zte_manager/static/css/pages/device_tangerine.css | 42 | html[data-theme] .am-device-maintenance { |
| apps/zte_manager/static/css/pages/device_tangerine.css | 46 | html[data-theme] .am-device-maintenance>summary { |
| apps/zte_manager/static/css/pages/device_tangerine.css | 49 | html[data-theme] .am-device-maintenance>summary::-webkit-details-marker {display:none;} |
| apps/zte_manager/static/css/pages/device_tangerine.css | 50 | html[data-theme] .am-device-maintenance>summary>.material-symbols-outlined:first-child { |
| apps/zte_manager/static/css/pages/device_tangerine.css | 54 | html[data-theme] .am-device-maintenance>summary span:nth-child(2) { |
| apps/zte_manager/static/css/pages/device_tangerine.css | 57 | html[data-theme] .am-device-maintenance>summary strong { |
| apps/zte_manager/static/css/pages/device_tangerine.css | 60 | html[data-theme] .am-device-maintenance>summary small { |
| apps/zte_manager/static/css/pages/device_tangerine.css | 63 | html[data-theme] .am-device-chevron { |
| apps/zte_manager/static/css/pages/device_tangerine.css | 66 | html[data-theme] .am-device-maintenance[open] .am-device-chevron {transform:rotate(180deg);} |
| apps/zte_manager/static/css/pages/device_tangerine.css | 67 | html[data-theme] .am-device-maintenance[open]>summary { |
| apps/zte_manager/static/css/pages/device_tangerine.css | 70 | html[data-theme] .am-device-maintenance-body { |
| apps/zte_manager/static/css/pages/device_tangerine.css | 74 | html[data-theme] .am-device-maintenance-body>.panel { |
| apps/zte_manager/static/css/pages/device_tangerine.css | 78 | html[data-theme] .am-device-stats, |
| apps/zte_manager/static/css/pages/device_tangerine.css | 79 | html[data-theme] .am-device-maintenance-body { |
| apps/zte_manager/static/css/pages/device_tangerine.css | 82 | html[data-theme] .am-device-summary{padding:18px!important;} |
| apps/zte_manager/static/css/pages/device_tangerine.css | 85 | html[data-theme] .am-device-chevron {transition:none!important;} |
| apps/zte_manager/static/css/pages/support_workbench.css | 2 | html[data-theme] .am-support-workspace { |
| apps/zte_manager/static/css/pages/support_workbench.css | 9 | html[data-theme] .am-support-workspace>.support-control-panel { |
| apps/zte_manager/static/css/pages/support_workbench.css | 17 | html[data-theme] .am-support-workspace>.support-control-panel::after{ |
| apps/zte_manager/static/css/pages/support_workbench.css | 20 | html[data-theme] .am-support-workspace>.support-output, |
| apps/zte_manager/static/css/pages/support_workbench.css | 21 | html[data-theme] .am-support-workspace>#supportStandaloneSpeed, |
| apps/zte_manager/static/css/pages/support_workbench.css | 22 | html[data-theme] .am-support-workspace>#supportReportActions, |
| apps/zte_manager/static/css/pages/support_workbench.css | 23 | html[data-theme] .am-support-workspace>#supportAttendancePanel { |
| apps/zte_manager/static/css/pages/support_workbench.css | 27 | html[data-theme] .am-support-workspace>.support-output { |
| apps/zte_manager/static/css/pages/support_workbench.css | 32 | html[data-theme] .am-support-workspace .support-form-grid { |
| apps/zte_manager/static/css/pages/support_workbench.css | 37 | html[data-theme] .am-support-workspace .support-check-grid { |
| apps/zte_manager/static/css/pages/support_workbench.css | 43 | html[data-theme] .am-support-workspace .support-action-row { |
| apps/zte_manager/static/css/pages/support_workbench.css | 46 | html[data-theme] .am-support-workspace #firmwareDiagnosticPanel { |
| apps/zte_manager/static/css/pages/support_workbench.css | 51 | html[data-theme] .am-support-workspace #firmwareDiagnosticPanel h3{ |
| apps/zte_manager/static/css/pages/support_workbench.css | 55 | html[data-theme] .am-support-workspace #firmwareDiagnosticStatus { |
| apps/zte_manager/static/css/pages/support_workbench.css | 59 | html[data-theme] .am-support-workspace #firmwareDiagnosticChoices{ |
| apps/zte_manager/static/css/pages/support_workbench.css | 64 | html[data-theme] .am-support-workspace .adaptive-choice-group{ |
| apps/zte_manager/static/css/pages/support_workbench.css | 69 | html[data-theme] .am-support-workspace .adaptive-choice-group legend{ |
| apps/zte_manager/static/css/pages/support_workbench.css | 73 | html[data-theme] .am-support-workspace .adaptive-choice-grid{ |
| apps/zte_manager/static/css/pages/support_workbench.css | 77 | html[data-theme] .am-support-workspace .adaptive-choice{ |
| apps/zte_manager/static/css/pages/support_workbench.css | 86 | html[data-theme] .am-support-workspace .adaptive-choice input{ |
| apps/zte_manager/static/css/pages/support_workbench.css | 89 | html[data-theme] .am-support-workspace .adaptive-choice>div{ |
| apps/zte_manager/static/css/pages/support_workbench.css | 93 | html[data-theme] .am-support-workspace .adaptive-choice span, |
| apps/zte_manager/static/css/pages/support_workbench.css | 94 | html[data-theme] .am-support-workspace .adaptive-choice-note{ |
| apps/zte_manager/static/css/pages/support_workbench.css | 99 | html[data-theme] .am-support-workspace .adaptive-choice[aria-disabled="true"] { |
| apps/zte_manager/static/css/pages/support_workbench.css | 102 | html[data-theme] .am-support-workspace .am-pending-features { |
| apps/zte_manager/static/css/pages/support_workbench.css | 107 | html[data-theme] .am-support-workspace .am-pending-features summary { |
| apps/zte_manager/static/css/pages/support_workbench.css | 111 | html[data-theme] .am-support-workspace .am-pending-features[open] summary{ |
| apps/zte_manager/static/css/pages/support_workbench.css | 114 | html[data-theme] .am-support-workspace .am-pending-features .am-pending-grid { |
| apps/zte_manager/static/css/pages/support_workbench.css | 118 | html[data-theme] .am-support-workspace .am-features-empty { |
| apps/zte_manager/static/css/pages/support_workbench.css | 124 | html[data-theme] .am-support-workspace .am-pending-feature { |
| apps/zte_manager/static/css/pages/support_workbench.css | 128 | html[data-theme] .am-support-workspace .am-pending-feature:last-child { |
| apps/zte_manager/static/css/pages/support_workbench.css | 131 | html[data-theme] .am-support-workspace .am-pending-feature strong { |
| apps/zte_manager/static/css/pages/support_workbench.css | 135 | html[data-theme] .am-support-workspace .am-pending-feature small { |
| apps/zte_manager/static/css/pages/support_workbench.css | 138 | html[data-theme] .am-support-workspace .support-summary { |
| apps/zte_manager/static/css/pages/support_workbench.css | 144 | html[data-theme] .am-support-workspace .support-result-card, |
| apps/zte_manager/static/css/pages/support_workbench.css | 145 | html[data-theme] .am-support-workspace .finding-item{ |
| apps/zte_manager/static/css/pages/support_workbench.css | 149 | html[data-theme] .am-support-workspace .support-empty{ |
| apps/zte_manager/static/css/pages/support_workbench.css | 155 | html[data-theme] .am-support-workspace .support-empty strong{ |
| apps/zte_manager/static/css/pages/connection_inventory.css | 4 | html[data-theme] .login-layout:has(.am-inventory-panel) { |
| apps/zte_manager/static/css/pages/connection_inventory.css | 8 | html[data-theme] .am-inventory-panel { |
| apps/zte_manager/static/css/pages/connection_inventory.css | 14 | html[data-theme] .am-inventory-panel::before {display:none!important;} |
| apps/zte_manager/static/css/pages/connection_inventory.css | 15 | html[data-theme] .am-inventory-header { |
| apps/zte_manager/static/css/pages/connection_inventory.css | 20 | html[data-theme] .am-inventory-header .section-kicker { |
| apps/zte_manager/static/css/pages/connection_inventory.css | 23 | html[data-theme] .am-inventory-header h2 { |
| apps/zte_manager/static/css/pages/connection_inventory.css | 28 | html[data-theme] .am-inventory-header p { |
| apps/zte_manager/static/css/pages/connection_inventory.css | 32 | html[data-theme] .am-inventory-new { |
| apps/zte_manager/static/css/pages/connection_inventory.css | 38 | html[data-theme] .am-inventory-search { |
| apps/zte_manager/static/css/pages/connection_inventory.css | 43 | html[data-theme] .am-inventory-search .material-symbols-outlined {font-size:18px;} |
| apps/zte_manager/static/css/pages/connection_inventory.css | 44 | html[data-theme] .am-inventory-search input { |
| apps/zte_manager/static/css/pages/connection_inventory.css | 50 | html[data-theme] .am-inventory-search:focus-within {outline:2px solid var(--am-color-primary);outline-offset:2px;} |
| apps/zte_manager/static/css/pages/connection_inventory.css | 51 | html[data-theme] .am-inventory-list { |
| apps/zte_manager/static/css/pages/connection_inventory.css | 55 | html[data-theme] .am-inventory-empty { |
| apps/zte_manager/static/css/pages/connection_inventory.css | 61 | html[data-theme] .am-inventory-entry { |
| apps/zte_manager/static/css/pages/connection_inventory.css | 68 | html[data-theme] .am-inventory-entry:hover:not(:disabled) {background:var(--am-color-primary-wash)!important;} |
| apps/zte_manager/static/css/pages/connection_inventory.css | 69 | html[data-theme] .am-inventory-entry.is-current, |
| apps/zte_manager/static/css/pages/connection_inventory.css | 70 | html[data-theme] .am-inventory-entry.is-selected { |
| apps/zte_manager/static/css/pages/connection_inventory.css | 73 | html[data-theme] .am-inventory-icon { |
| apps/zte_manager/static/css/pages/connection_inventory.css | 78 | html[data-theme] .am-inventory-meta {flex:1;min-width:0;display:flex;flex-direction:column;gap:4px;} |
| apps/zte_manager/static/css/pages/connection_inventory.css | 79 | html[data-theme] .am-inventory-meta strong { |
| apps/zte_manager/static/css/pages/connection_inventory.css | 82 | html[data-theme] .am-inventory-meta small { |
| apps/zte_manager/static/css/pages/connection_inventory.css | 85 | html[data-theme] .am-inventory-arrow {font-size:19px!important;color:var(--am-color-text-muted);} |
| apps/zte_manager/static/css/pages/connection_inventory.css | 86 | html[data-theme] .am-inventory-footer { |
| apps/zte_manager/static/css/pages/connection_inventory.css | 93 | html[data-theme] .login-layout:has(.am-inventory-panel) { |
| apps/zte_manager/static/css/pages/connection_inventory.css | 96 | html[data-theme] .am-inventory-panel {min-height:300px!important;} |
| apps/zte_manager/static/css/pages/connection_inventory.css | 97 | html[data-theme] .am-inventory-list {max-height:225px;} |
| apps/zte_manager/static/css/pages/diagnostics_workbench.css | 2 | html[data-theme] .am-diagnostic-workspace{ |
| apps/zte_manager/static/css/pages/diagnostics_workbench.css | 6 | html[data-theme] .am-diagnostic-workspace .diagnostic-card{ |
| apps/zte_manager/static/css/pages/diagnostics_workbench.css | 10 | html[data-theme] .am-diagnostic-workspace .diagnostic-card .panel-header{ |
| apps/zte_manager/static/css/pages/diagnostics_workbench.css | 15 | html[data-theme] .am-diagnostic-workspace .diagnostic-card .panel-icon{ |
| apps/zte_manager/static/css/pages/diagnostics_workbench.css | 19 | html[data-theme] .am-diagnostic-workspace .diagnostic-card .form-stack{ |
| apps/zte_manager/static/css/pages/diagnostics_workbench.css | 22 | html[data-theme] .am-diagnostic-workspace .diagnostic-card .terminal-output{ |
| apps/zte_manager/static/css/pages/workbench_responsive.css | 3 | html[data-theme] .am-diagnostic-workspace{grid-template-columns:minmax(0,1fr)!important;} |
| apps/zte_manager/static/css/pages/workbench_responsive.css | 6 | html[data-theme] .am-support-workspace .support-form-grid, |
| apps/zte_manager/static/css/pages/workbench_responsive.css | 7 | html[data-theme] .am-support-workspace .support-check-grid{grid-template-columns:minmax(0,1fr)!important;} |
| apps/zte_manager/static/css/pages/tr069_tangerine.css | 2 | html[data-theme] .am-tr069-workspace { |
| apps/zte_manager/static/css/pages/tr069_tangerine.css | 6 | html[data-theme] .am-tr069-workspace>.panel { |
| apps/zte_manager/static/css/pages/tr069_tangerine.css | 10 | html[data-theme] .am-tr069-workspace>.panel:nth-child(2) { |
| apps/zte_manager/static/css/pages/tr069_tangerine.css | 13 | html[data-theme] .am-tr069-form {display:flex;flex-direction:column;gap:18px;} |
| apps/zte_manager/static/css/pages/tr069_tangerine.css | 14 | html[data-theme] .am-tr069-group { |
| apps/zte_manager/static/css/pages/tr069_tangerine.css | 19 | html[data-theme] .am-tr069-group>legend { |
| apps/zte_manager/static/css/pages/tr069_tangerine.css | 23 | html[data-theme] .am-tr069-form .field { |
| apps/zte_manager/static/css/pages/tr069_tangerine.css | 26 | html[data-theme] .am-tr069-form .field input, |
| apps/zte_manager/static/css/pages/tr069_tangerine.css | 27 | html[data-theme] .am-tr069-form .field select {width:100%;min-height:40px;} |
| apps/zte_manager/static/css/pages/tr069_tangerine.css | 28 | html[data-theme] .am-tr069-form #tr069ProviderUrl { |
| apps/zte_manager/static/css/pages/tr069_tangerine.css | 31 | html[data-theme] .am-tr069-credentials { |
| apps/zte_manager/static/css/pages/tr069_tangerine.css | 35 | html[data-theme] .am-tr069-credentials>summary { |
| apps/zte_manager/static/css/pages/tr069_tangerine.css | 40 | html[data-theme] .am-tr069-credentials>summary::-webkit-details-marker {display:none;} |
| apps/zte_manager/static/css/pages/tr069_tangerine.css | 41 | html[data-theme] .am-tr069-credentials>summary .material-symbols-outlined { |
| apps/zte_manager/static/css/pages/tr069_tangerine.css | 44 | html[data-theme] .am-tr069-credentials-inner { |
| apps/zte_manager/static/css/pages/tr069_tangerine.css | 47 | html[data-theme] .am-tr069-workspace .profile-actions { |
| apps/zte_manager/static/css/pages/tr069_tangerine.css | 50 | html[data-theme] .am-tr069-workspace .profile-actions>.button { |
| apps/zte_manager/static/css/pages/tr069_tangerine.css | 53 | html[data-theme] #tr069ProviderFeedback { |
| apps/zte_manager/static/css/pages/tr069_tangerine.css | 57 | html[data-theme] #tr069ProviderFeedback[data-level="error"] { |
| apps/zte_manager/static/css/pages/tr069_tangerine.css | 60 | html[data-theme] #tr069ProviderFeedback[data-level="ok"] { |
| apps/zte_manager/static/css/pages/tr069_tangerine.css | 64 | html[data-theme] .am-tr069-workspace{grid-template-columns:minmax(0,1fr)!important;} |
| apps/zte_manager/static/css/pages/tr069_tangerine.css | 65 | html[data-theme] .am-tr069-workspace>.panel:nth-child(2){position:static;} |
| apps/zte_manager/static/css/pages/tr069_tangerine.css | 69 | html[data-theme] .management-pane[hidden]{display:none!important;} |
| apps/zte_manager/static/css/pages/advanced_tangerine.css | 2 | html[data-theme] #page-advanced .advanced-actions { |
| apps/zte_manager/static/css/pages/advanced_tangerine.css | 6 | html[data-theme] #page-advanced .advanced-actions button { |
| apps/zte_manager/static/css/pages/advanced_tangerine.css | 13 | html[data-theme] #page-advanced .advanced-actions button:focus-visible { |
| apps/zte_manager/static/css/pages/advanced_tangerine.css | 16 | html[data-theme] #page-advanced .advanced-actions button:hover:not(:disabled) { |
| apps/zte_manager/static/css/pages/advanced_tangerine.css | 19 | html[data-theme] .am-workbench { |
| apps/zte_manager/static/css/pages/advanced_tangerine.css | 22 | html[data-theme] .am-workbench-tabs { |
| apps/zte_manager/static/css/pages/advanced_tangerine.css | 28 | html[data-theme] .am-workbench-tab { |
| apps/zte_manager/static/css/pages/advanced_tangerine.css | 35 | html[data-theme] .am-workbench-tab .material-symbols-outlined {color:inherit;font-size:19px;} |
| apps/zte_manager/static/css/pages/advanced_tangerine.css | 36 | html[data-theme] .am-workbench-tab.is-active, |
| apps/zte_manager/static/css/pages/advanced_tangerine.css | 37 | html[data-theme] .am-workbench-tab[aria-selected="true"] { |
| apps/zte_manager/static/css/pages/advanced_tangerine.css | 41 | html[data-theme] .am-workbench-tab:hover:not(.is-active) { |
| apps/zte_manager/static/css/pages/advanced_tangerine.css | 44 | html[data-theme] .am-workbench-tab:focus-visible { |
| apps/zte_manager/static/css/pages/advanced_tangerine.css | 47 | html[data-theme] .am-toolpanel[hidden] {display:none!important;} |
| apps/zte_manager/static/css/pages/advanced_tangerine.css | 48 | html[data-theme] .am-toolpanel {min-width:0;display:grid;gap:14px;animation:am-content-enter .22s ease-out;} |
| apps/zte_manager/static/css/pages/advanced_tangerine.css | 49 | html[data-theme] .am-toolpanel > .advanced-grid {margin:0!important;} |
| apps/zte_manager/static/css/pages/advanced_tangerine.css | 50 | html[data-theme] .am-toolpanel .subsection-title {margin:7px 0 0!important;} |
| apps/zte_manager/static/css/pages/advanced_tangerine.css | 51 | html[data-theme] .am-toolpanel .panel {min-width:0;} |
| apps/zte_manager/static/css/pages/advanced_tangerine.css | 52 | html[data-theme] .am-toolpanel .capability-grid { |
| apps/zte_manager/static/css/pages/advanced_tangerine.css | 57 | html[data-theme] .am-toolpanel .capability-card { |
| apps/zte_manager/static/css/pages/advanced_tangerine.css | 61 | html[data-theme] .am-toolpanel .capability-card strong { |
| apps/zte_manager/static/css/pages/advanced_tangerine.css | 64 | html[data-theme] .am-toolpanel .operation-meta { |
| apps/zte_manager/static/css/pages/advanced_tangerine.css | 67 | html[data-theme] .am-toolpanel .operations-form {display:grid;gap:12px;min-width:0;} |
| apps/zte_manager/static/css/pages/advanced_tangerine.css | 68 | html[data-theme] .am-toolpanel .field-grid { |
| apps/zte_manager/static/css/pages/advanced_tangerine.css | 72 | html[data-theme] .am-toolpanel .operations-output, |
| apps/zte_manager/static/css/pages/advanced_tangerine.css | 73 | html[data-theme] .am-inspector-result { |
| apps/zte_manager/static/css/pages/advanced_tangerine.css | 78 | html[data-theme] .am-toolpanel #featureInspectorButtons { |
| apps/zte_manager/static/css/pages/advanced_tangerine.css | 82 | html[data-theme] .am-toolpanel #featureInspectorButtons button { |
| apps/zte_manager/static/css/pages/advanced_tangerine.css | 85 | html[data-theme] .am-inspector-result :is(table,pre,dl) {max-width:100%;overflow:auto;min-width:0;} |
| apps/zte_manager/static/css/pages/advanced_tangerine.css | 86 | html[data-theme] #firmwareShapeOutput { |
| apps/zte_manager/static/css/pages/advanced_tangerine.css | 95 | html[data-theme] .am-workbench-tabs{top:0;position:relative;} |
| apps/zte_manager/static/css/pages/advanced_tangerine.css | 96 | html[data-theme] #page-advanced .advanced-actions button{flex:1 1 125px!important;} |
| apps/zte_manager/static/css/pages/advanced_tangerine.css | 97 | html[data-theme] .am-toolpanel .advanced-grid{grid-template-columns:minmax(0,1fr)!important;} |
| apps/zte_manager/static/css/pages/advanced_tangerine.css | 100 | html[data-theme] .am-toolpanel{animation:none!important;} |
| apps/zte_manager/static/css/pages/dashboard_tangerine.css | 5 | html[data-theme] .am-dashboard-hero { |
| apps/zte_manager/static/css/pages/dashboard_tangerine.css | 12 | html[data-theme] .am-dashboard-hero::after { |
| apps/zte_manager/static/css/pages/dashboard_tangerine.css | 16 | html[data-theme] .am-hero-copy {position:relative;z-index:2;min-width:0;} |
| apps/zte_manager/static/css/pages/dashboard_tangerine.css | 17 | html[data-theme] .am-hero-kicker { |
| apps/zte_manager/static/css/pages/dashboard_tangerine.css | 23 | html[data-theme] .am-hero-dot { |
| apps/zte_manager/static/css/pages/dashboard_tangerine.css | 27 | html[data-theme] .am-dashboard-hero h2 { |
| apps/zte_manager/static/css/pages/dashboard_tangerine.css | 32 | html[data-theme] .am-dashboard-hero h2 em {color:var(--am-color-primary-strong)!important;font-style:normal;} |
| apps/zte_manager/static/css/pages/dashboard_tangerine.css | 33 | html[data-theme] .am-dashboard-hero p { |
| apps/zte_manager/static/css/pages/dashboard_tangerine.css | 37 | html[data-theme] .am-hero-target { |
| apps/zte_manager/static/css/pages/dashboard_tangerine.css | 42 | html[data-theme] .am-hero-target>.material-symbols-outlined {color:var(--am-color-primary);font-size:24px;} |
| apps/zte_manager/static/css/pages/dashboard_tangerine.css | 43 | html[data-theme] .am-hero-target strong {display:block;font-weight:720;color:var(--am-color-text);font-size:13px;} |
| apps/zte_manager/static/css/pages/dashboard_tangerine.css | 44 | html[data-theme] .am-hero-target .mono { |
| apps/zte_manager/static/css/pages/dashboard_tangerine.css | 48 | html[data-theme] .am-hero-actions {display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:16px;} |
| apps/zte_manager/static/css/pages/dashboard_tangerine.css | 49 | html[data-theme] .am-hero-actions .button {display:inline-flex;align-items:center;gap:6px;} |
| apps/zte_manager/static/css/pages/dashboard_tangerine.css | 50 | html[data-theme] .am-hero-actions .material-symbols-outlined {font-size:17px;} |
| apps/zte_manager/static/css/pages/dashboard_tangerine.css | 54 | html[data-theme] .am-hero-visual { |
| apps/zte_manager/static/css/pages/dashboard_tangerine.css | 59 | html[data-theme] .am-hero-visual::before { |
| apps/zte_manager/static/css/pages/dashboard_tangerine.css | 65 | html[data-theme] .am-hero-visual::after { |
| apps/zte_manager/static/css/pages/dashboard_tangerine.css | 74 | html[data-theme] .am-orbit {display:none;} |
| apps/zte_manager/static/css/pages/dashboard_tangerine.css | 75 | html[data-theme] .am-orbit-node {display:none;} |
| apps/zte_manager/static/css/pages/dashboard_tangerine.css | 76 | html[data-theme] .am-orbit-center { |
| apps/zte_manager/static/css/pages/dashboard_tangerine.css | 82 | html[data-theme] .am-orbit-center .material-symbols-outlined {font-size:30px;transform:none;} |
| apps/zte_manager/static/css/pages/dashboard_tangerine.css | 84 | html[data-theme] .am-recent-activity {margin-bottom:14px!important;} |
| apps/zte_manager/static/css/pages/dashboard_tangerine.css | 85 | html[data-theme] .am-recent-activity .panel-header {margin-bottom:13px;} |
| apps/zte_manager/static/css/pages/dashboard_tangerine.css | 86 | html[data-theme] .am-activity-list { |
| apps/zte_manager/static/css/pages/dashboard_tangerine.css | 90 | html[data-theme] .am-activity-item { |
| apps/zte_manager/static/css/pages/dashboard_tangerine.css | 94 | html[data-theme] .am-activity-item strong { |
| apps/zte_manager/static/css/pages/dashboard_tangerine.css | 98 | html[data-theme] .am-activity-item small { |
| apps/zte_manager/static/css/pages/dashboard_tangerine.css | 102 | html[data-theme] .am-activity-empty {color:var(--am-color-text-muted);padding:9px 0;} |
| apps/zte_manager/static/css/pages/dashboard_tangerine.css | 105 | html[data-theme] .am-dashboard-hero {grid-template-columns:minmax(0,1fr) minmax(210px,.5fr);} |
| apps/zte_manager/static/css/pages/dashboard_tangerine.css | 106 | html[data-theme] .am-hero-visual {min-height:165px;} |
| apps/zte_manager/static/css/pages/dashboard_tangerine.css | 109 | html[data-theme] .am-dashboard-hero {grid-template-columns:minmax(0,1fr);} |
| apps/zte_manager/static/css/pages/dashboard_tangerine.css | 110 | html[data-theme] .am-hero-visual {min-height:120px;} |
| apps/zte_manager/static/css/pages/dashboard_tangerine.css | 113 | html[data-theme] .am-hero-visual::after {animation:none;left:50%;opacity:.45;} |
| apps/zte_manager/templates/source/pages/supportDiagnostic.html | 47 | <!-- Bloqueia submissão HTML nativa caso scripts carreguem com erro. |
| tests/fixtures/huawei_ipincoming.html | 1 | <!doctype html> |
| tests/fixtures/huawei_ipincoming.html | 2 | <html> |
| tests/fixtures/huawei_ipincoming.html | 26 | </html> |
| tests/fixtures/huawei_deviceinfo_eg8041x7.html | 1 | <!doctype html> |
| tests/fixtures/huawei_deviceinfo_eg8041x7.html | 2 | <html> |
| tests/fixtures/huawei_deviceinfo_eg8041x7.html | 13 | </html> |
| tests/fixtures/huawei/phase0_research/sestokeninfo.xml | 1 | <?xml version="1.0" encoding="UTF-8"?> |
| tests/fixtures/huawei/phase0_research/http_bootstrap_https80.html | 1 | <html><script> |
| tests/fixtures/huawei/phase0_research/http_bootstrap_https80.html | 7 | </script></html> |
| tests/fixtures/huawei/hg8010h_reference/login_legacy_rand_cookie.html | 1 | <html> |
| tests/fixtures/huawei/hg8010h_reference/login_legacy_rand_cookie.html | 13 | </html> |
| tests/fixtures/huawei/phase4/hg8245x6_ttnet2_login.html | 1 | <!doctype html> |
| tests/fixtures/huawei/phase4/hg8245x6_ttnet2_login.html | 2 | <html> |
| tests/fixtures/huawei/phase4/hg8245x6_ttnet2_login.html | 18 | </html> |
| tests/fixtures/huawei/eg8041x6_10_local/http_bootstrap.html | 1 | <html><head><script> |
| tests/fixtures/huawei/eg8041x6_10_local/http_bootstrap.html | 5 | </script></head><body></body></html> |
| tests/fixtures/huawei/eg8041x6_10_local/wifi_2g.asp | 1 | <html><script> |
| tests/fixtures/huawei/eg8041x6_10_local/wifi_2g.asp | 5 | </script></html> |
| tests/fixtures/huawei/eg8041x6_10_local/auth_root_login.html | 1 | <!doctype html> |
| tests/fixtures/huawei/eg8041x6_10_local/auth_root_login.html | 2 | <html> |
| tests/fixtures/huawei/eg8041x6_10_local/auth_root_login.html | 11 | </html> |
| tests/fixtures/huawei/eg8041x6_10_local/device_brebg2.asp | 1 | <html><script> |
| tests/fixtures/huawei/eg8041x6_10_local/device_brebg2.asp | 5 | </script></html> |
| tests/fixtures/huawei/eg8041x6_10_local/wifi_5g.asp | 1 | <html><script> |
| tests/fixtures/huawei/eg8041x6_10_local/wifi_5g.asp | 6 | </script></html> |
| tests/fixtures/huawei/eg8041x6_10_local/auth_root_login_rndsecurityformat.html | 1 | <!doctype html> |
| tests/fixtures/huawei/eg8041x6_10_local/auth_root_login_rndsecurityformat.html | 2 | <html> |
| tests/fixtures/huawei/eg8041x6_10_local/auth_root_login_rndsecurityformat.html | 15 | </html> |
| tests/fixtures/huawei/eg8041x6_10_local/auth_login_success.html | 1 | <!doctype html> |
| tests/fixtures/huawei/eg8041x6_10_local/auth_login_success.html | 2 | <html><head><title>Huawei</title></head><body>authenticated</body></html> |
| tests/fixtures/huawei/eg8041x6_10_local/auth_menu_proof.asp | 1 | var menu = "Home Page / html/bbsp/ipincoming/ipincoming.asp"; |
| tests/fixtures/huawei/phase3/sestokeninfo.xml | 1 | <?xml version="1.0" encoding="UTF-8"?> |
| tests/fixtures/huawei/phase3/deviceinfo.xml | 1 | <?xml version="1.0" encoding="UTF-8"?> |
| tests/fixtures/huawei/phase3/login_sha256.html | 1 | <!doctype html> |
| tests/fixtures/huawei/phase3/login_sha256.html | 2 | <html><head><script src="/js/safelogin.js"></script></head><body>Huawei HG8245H</body></html> |
| tests/fixtures/huawei/phase3/api_unavailable.html | 1 | <!doctype html><html><head><title>Huawei Login</title></head><body>legacy CGI firmware</body></html> |
| tests/fixtures/huawei/phase5/hg8347r_userdev_page.html | 1 | <!doctype html> |
| tests/fixtures/huawei/phase5/hg8347r_userdev_page.html | 2 | <html><body> |
| tests/fixtures/huawei/phase5/hg8347r_userdev_page.html | 5 | </body></html> |
| docs/huawei/research_registry.md | 33 | \| `sirjeannot/huawei-ont-2-mqtt` \| Telnet/MQTT exporter \| GPL-3.0 \| HG8010H \| WAP `display optic`, `display sysinfo`, `display pon statistics`; units/counters \| behavior only; clean-room parsers/fixtures \| |
| docs/huawei/research_registry.md | 40 | \| Marco d'Itri — *Exploring the Huawei HG8010H GPON ONT* \| technical article/PDF \| document copyright \| HG8010H older generation \| `/html/status/opticinfo.asp`, 6-arg `stOpticInfo`, legacy hashed-cookie auth \| old-firmware characterization; auth deliberately unsupported \| |
| docs/huawei/phase0_phase1_evidence.md | 12 | - structural parser; |
| docs/huawei/phase0_phase1_evidence.md | 37 | 1. `/html/amp/opticinfo/opticinfo.asp` |
| docs/huawei/phase0_phase1_evidence.md | 38 | 2. `/html/amp/common/getSmartDiagnoseResult.asp` |
| docs/huawei/phase0_phase1_evidence.md | 39 | 3. `/html/ssmp/common/getOpticTxRx.asp` |
| docs/huawei/phase0_phase1_evidence.md | 55 | `HuaweiJsConstructorParser` parses generated Huawei `new Constructor(...)` structures without executing JavaScript. It handles quoted/nested arguments, `\\xNN` escapes, variable field counts, optional family schemas and preservation of unknown positional fields. |
| docs/huawei/phase0_phase1_evidence.md | 76 | - **Fixture validated:** transport policy, HTTPS:80 bootstrap parsing, BOM/hex RandCount normalization, one-submission budget, ambiguous-auth behavior, structural JavaScript parser, HG8145X6 field mapping/fingerprint selection and optical candidate fallback. |
| docs/huawei/external_references.md | 9 | - **Firmware / WebUI family:** generated Huawei `/html/ssmp/`, `/html/amp/`, `/html/bbsp/` surface; treated here as `AMP_BBSP` family evidence, not as a universal model rule. |
| docs/huawei/external_references.md | 10 | - **Authentication flow:** read-only pre-login challenge from `/html/ssmp/common/getRandString.asp`, POST `/login.cgi`, then read `/html/ssmp/common/GetRandToken.asp` on the authenticated cookie session. Source explicitly decodes the challenge/token with UTF-8 BOM handling. |
| docs/huawei/external_references.md | 15 | - **Known endpoints:** `/html/ssmp/deviceinfo/deviceinfo.asp`, `/html/bbsp/common/ontstate.asp`, `/html/amp/opticinfo/opticinfo.asp`, `/html/bbsp/common/getwanlist.asp`, WAN-stat pages, Ethernet/WLAN pages, LAN-client DHCP page, plus feature-specific mutation CGI used by the reference firmware. |
| docs/huawei/external_references.md | 17 | - **Parsers:** regex-based JavaScript-constructor helpers. Protocol knowledge is useful; the parser implementation is weaker than Access Manager's existing quote/escape/nesting-aware constructor parser and is not copied. |
| docs/huawei/external_references.md | 23 | - **Risks:** firmware-specific positional constructor arguments; hard-coded WAN domains in mutations; some parser regexes do not safely cover nested/quoted constructor syntax. |
| docs/huawei/external_references.md | 36 | - **Known endpoints:** `/asp/GetRandCount.asp`, `/login.cgi`, `/html/bbsp/common/GetLanUserDevInfo.asp`, `/CustomApp/mainpage.asp`, `/html/bbsp/common/getwanlist.asp`. |
| docs/huawei/external_references.md | 37 | - **Parsers:** page-specific JavaScript/HTML extraction. |
| docs/huawei/external_references.md | 55 | - **Parsers/tests/fixtures:** the public main branch is documentation-oriented after sanitization; no public runtime test/fixture was found that is strong enough to make Access Manager auto-enable this family. |
| docs/huawei/external_references.md | 69 | - **Read capabilities observed:** LAN devices, resource usage; draft PR #2 adds optical reading on `/html/amp/opticinfo/opticinfo.asp` for HN8010TS. |
| docs/huawei/external_references.md | 71 | - **Parsers:** executes vendor JavaScript in an embedded JS VM and normalizes results to Go structs. Access Manager does not copy that approach because its structural constructor parser already covers the needed data without executing untrusted page JavaScript. |
| docs/huawei/external_references.md | 87 | - **Known endpoints:** `/asp/GetRandCount.asp`, `/login.cgi`, `/html/bbsp/userdevinfo/getuserdevinfo.asp`. |
| docs/huawei/external_references.md | 88 | - **Parsers:** Huawei escaped-hex response decoding in the example. |
| docs/huawei/external_references.md | 105 | External repositories are sources of protocol evidence. Runtime support is promoted only when Access Manager can safely observe the endpoint, recognize the response and parse it. Write support additionally requires confirmed payload/mapping/semantics and physical validation where appropriate. |
| docs/huawei/eg8041_family_runtime.md | 7 | A session is treated as EG8041/BREBG2-compatible only after `AMP_BBSP` protocol evidence plus the expected 2.4/5 GHz `WLANConfiguration` / `WiFi.Radio` object graph is parsed. `CfgMode=BREBG2` is supporting evidence, not a universal family switch. EG8041X6-10 and EG8041X7-10 have independent authorized local evidence f |
| docs/huawei/eg8041_family_runtime.md | 13 | \| Device info \| `GENERALIZED_IN_THIS_PR / READ_SUPPORTED` \| SSMP device reader + successful parser \| no new mutation \| |
| docs/huawei/eg8041_family_runtime.md | 17 | \| Ethernet \| `READ_SUPPORTED WHEN PROBED` \| existing reader promoted only after parser success \| writes not promoted \| |
| docs/huawei/firmware_families.md | 3 | Huawei marketing model names are not transport contracts. Access Manager resolves protocol behavior from a combination of observed endpoints, authentication flow, firmware identity, response format and parser success. |
| docs/huawei/firmware_families.md | 9 | - `/html/ssmp/` |
| docs/huawei/firmware_families.md | 10 | - `/html/amp/` |
| docs/huawei/firmware_families.md | 11 | - `/html/bbsp/` |
| docs/huawei/firmware_families.md | 12 | - older `/html/status/` read pages |
| docs/huawei/firmware_families.md | 29 | 3. successful parsers/probes for the feature being promoted; |
| docs/huawei/firmware_families.md | 57 | -> /html/{ssmp,amp,bbsp}/... |
| docs/huawei/firmware_families.md | 88 | /html/ssmp/common/getRandString.asp |
| docs/huawei/firmware_families.md | 90 | -> /html/ssmp/common/GetRandToken.asp |
| docs/huawei/firmware_families.md | 100 | - `/html/status/opticinfo.asp` with `stOpticInfo/6`; |
| docs/huawei/firmware_families.md | 101 | - `/html/amp/opticinfo/opticinfo.asp` with `stOpticInfo/8`; |
| docs/huawei/firmware_families.md | 102 | - `/html/amp/opticinfo/opticinfo.asp` with extended `stOpticInfo/16`. |
| docs/huawei/firmware_families.md | 116 | This family is deliberately separate from the AMP/BBSP mutation CGI model. The public reference is documentation-oriented, so Access Manager does **not** auto-enable this family merely from a model name. Runtime support stays `UNKNOWN` until an endpoint exists, returns a recognizable response and a parser succeeds. |
| docs/huawei/firmware_families.md | 128 | 3. observed `/html/ssmp\|amp\|bbsp\|status/` endpoints establish generated-WebUI/`amp_bbsp` evidence; |
| docs/huawei/firmware_families.md | 133 | 8. feature support is promoted only by an endpoint/transport response plus a successful parser; |
| docs/huawei/firmware_families.md | 146 | + parser succeeds |
| docs/huawei/capability_matrix.md | 28 | \| Generic JS constructor parser \| ALREADY_EXISTS \| reused by new optical/PON readers \| |
| docs/huawei/capability_matrix.md | 71 | - `/html/amp/opticinfo/opticinfo.asp`; |
| docs/huawei/capability_matrix.md | 72 | - `/html/status/opticinfo.asp`; |
| docs/huawei/capability_matrix.md | 77 | - dynamic capabilities `optical_telemetry`, `pon_status`, `pon_statistics`, `resource_telemetry` only after parser success; |
| docs/huawei/capability_matrix.md | 87 | - robust JavaScript constructor parser; |
| docs/huawei/capability_matrix.md | 97 | 4. **Config-tree research support:** offline-only redacted `hw_ctree.xml` parser for fixtures/capability research. |
| docs/huawei/capability_matrix.md | 114 | - copying external regex constructor parsers: Access Manager's parser is more robust; |
| docs/huawei/phase3_hg8245h_dual_protocol.md | 38 | When `/api/webserver/SesTokenInfo` is absent, HTML, malformed, or does not contain a valid session/token pair, the client does not treat `/api/` as available. Existing evidence-driven auth selection remains authoritative, including the HG8245H legacy RandCount family when its runtime fingerprint is present. |
| docs/huawei/phase3_hg8245h_dual_protocol.md | 53 | - `device_info`: `READ_SUPPORTED` after API session proof + model parser success. |
| docs/huawei/phase3_hg8245h_dual_protocol.md | 74 | - SesTokenInfo XML and JSON parsing; |
| docs/huawei/model_matrix.md | 3 | Support is a runtime/software claim, not a name match. `RECOGNIZED` means the model can be identified/routed but does not imply useful reads on every firmware. `READ_PARTIAL` means at least one meaningful read path is integrated while known variants remain uncovered. Family compatibility is promoted only after live pro |
| docs/huawei/phase5_hg8347r_lab_mode.md | 14 | - user-device page: `/html/bbsp/userdevinfo/userdevinfolan.asp`; |
| docs/huawei/phase5_hg8347r_lab_mode.md | 16 | - read-only AJAX query: `/getajax.cgi?x=InternetGatewayDevice.LANDevice.1.X_HW_UserDev.{i}&RequestFile=html/bbsp/userdevinfo/userdevinfolan.asp`; |
| docs/huawei/phase5_hg8347r_lab_mode.md | 18 | - factual logout path: `/logout.cgi?RequestFile=html/logout.html`. |
| docs/huawei/phase5_hg8347r_lab_mode.md | 75 | "path": "/html/.../set.cgi?x=...&RequestFile=...", |
| docs/huawei/phase5_hg8347r_lab_mode.md | 79 | "referer": "/html/.../page.asp", |
| docs/huawei/phase5_hg8347r_lab_mode.md | 80 | "token_page": "/html/.../page.asp", |
| docs/huawei/phase5_hg8347r_lab_mode.md | 81 | "readback_path": "/html/.../page.asp", |
| docs/huawei/phase5_hg8347r_lab_mode.md | 103 | - default `variant="reboot"`: `POST /api/system/reboot` with XML `<Reboot>1</Reboot>`; |
| docs/huawei/phase5_hg8347r_lab_mode.md | 112 | - token page `/html/ssmp/reset/reset.asp`; |
| docs/huawei/phase5_hg8347r_lab_mode.md | 113 | - mutation `/html/ssmp/reset/set.cgi?x=InternetGatewayDevice.X_HW_DEBUG.SMP.DM.ResetBoard&RequestFile=html/ssmp/reset/reset.asp`; |
| docs/huawei/phase5_hg8347r_lab_mode.md | 121 | If the current firmware exposes `/html/ssmp/reboot/reboot.asp`, Access Manager may auto-submit only an unambiguous POST form whose action clearly names reboot/reset/set.cgi. Otherwise it returns `requires_exact_request=true`. |
| docs/huawei/phase5_hg8347r_lab_mode.md | 131 | "path": "/html/.../set.cgi?...", |
| docs/huawei/phase5_hg8347r_lab_mode.md | 133 | "referer": "/html/.../reboot.asp", |
| docs/huawei/phase5_hg8347r_lab_mode.md | 134 | "token_page": "/html/.../reboot.asp" |
| docs/huawei/phase5_hg8347r_lab_mode.md | 145 | "path": "/html/.../set.cgi?...", |
| docs/huawei/phase5_hg8347r_lab_mode.md | 147 | "referer": "/html/.../reset.asp", |
| docs/huawei/phase5_hg8347r_lab_mode.md | 148 | "token_page": "/html/.../reset.asp" |
| docs/huawei/phase2_eg8145v5_hn8010ts.md | 24 | - `chickenzord/go-huawei-client` (MIT): stateful client, `POST /asp/GetRandCount.asp`, Base64 password, `POST /login.cgi`, `POST /html/bbsp/common/GetLanUserDevInfo.asp`, and `GET /html/ssmp/deviceinfo/deviceinfo.asp` for CPU/memory information. |
| docs/huawei/phase2_eg8145v5_hn8010ts.md | 25 | - `undefjs/huawei-eg8145v5-hacs` (MIT): independent confirmation of the legacy cookie, RandCount/Base64 login, device information, and the alternate `/html/bbsp/userdevinfo/getuserdevinfo.asp` client surface. |
| docs/huawei/phase2_eg8145v5_hn8010ts.md | 41 | - `chickenzord/go-huawei-client` PR #2 (draft, MIT repository): adapts the EG8145V5 shared-session architecture for HN8010TS and adds optical telemetry from `/html/amp/opticinfo/opticinfo.asp` using `transOpticPower` and `revOpticPower`. |
| docs/huawei/phase2_eg8145v5_hn8010ts.md | 50 | - optical TX/RX through the existing characterized `stOpticInfo` parser. |
| docs/huawei/phase2_eg8145v5_hn8010ts.md | 52 | HN8010TS is not selected from the model hint alone. The runtime requires authenticated RandCount context, a matching model parsed from `deviceinfo.asp`, a recognized client schema, and recognized optical data. |
| docs/huawei/phase2_eg8145v5_hn8010ts.md | 87 | - HN8010TS optics remains reference + runtime-parser evidence until confirmed on real hardware. |
| docs/huawei/endpoints.md | 3 | This file records protocol evidence, not universal support. `LOCAL` means observed in an authorized local Access Manager device/capture. `EXTERNAL` means observed in an external source. `PROBED` means Access Manager can safely probe/read and only promotes support after a recognizable parsed response. |
| docs/huawei/endpoints.md | 10 | \| `/html/ssmp/common/getRandString.asp` \| EXTERNAL \| EG8021V5 \| RandString auth strategy implemented; physical validation pending \| |
| docs/huawei/endpoints.md | 11 | \| `/html/ssmp/common/GetRandToken.asp` \| EXTERNAL \| EG8021V5 \| private post-login token acquisition implemented; physical validation pending \| |
| docs/huawei/endpoints.md | 12 | \| `/html/ssmp/deviceinfo/deviceinfo.asp` \| LOCAL + EXTERNAL + PROBED \| EG8041X6/X7 local; EG8021V5/EG8145V5 external \| device reader + model/firmware/CfgMode evidence; parser success required \| |
| docs/huawei/endpoints.md | 13 | \| `/html/amp/opticinfo/opticinfo.asp` \| LOCAL + EXTERNAL + PROBED \| EG8041 family; HG8010H/EG8010H, EG8021V5, EG8145-class references \| existing optical reader; normalized telemetry accepts only characterized signatures \| |
| docs/huawei/endpoints.md | 14 | \| `/html/status/opticinfo.asp` \| EXTERNAL + PROBED \| older HG8010H generation \| read-only alternate optical endpoint; `stOpticInfo/6` characterized \| |
| docs/huawei/endpoints.md | 15 | \| `/html/bbsp/common/ontstate.asp` \| EXTERNAL + PROBED \| EG8021V5 and compatible generated WebUI references \| read-only PON state reader; capability promoted only on parser success \| |
| docs/huawei/endpoints.md | 16 | \| `/html/bbsp/common/getwanlist.asp` \| LOCAL + EXTERNAL + PROBED \| EG8041 family and multiple AMP/BBSP references \| WAN list/service discovery; object path is retained for diagnostics instead of hardcoding `WANPPPConnection.1` \| |
| docs/huawei/endpoints.md | 17 | \| WAN traffic-stat pages under `/html/bbsp/common/` \| EXTERNAL \| EG8021V5 / current OptiXstar integrations \| read only when a recognizable counter surface exists; absent counters remain `None` \| |
| docs/huawei/endpoints.md | 18 | \| `/html/amp/ethinfo/ethinfo.asp` \| LOCAL/EXTERNAL by firmware + PROBED \| EG8041/EG8021 references \| Ethernet capability promoted only after parsed reader succeeds \| |
| docs/huawei/endpoints.md | 19 | \| `/html/amp/wlanadv/WlanAdvance.asp?2G` \| LOCAL + PROBED \| EG8041X6-10 and existing X7 mapping \| shared EG8041 2.4 GHz advanced read/object signature \| |
| docs/huawei/endpoints.md | 20 | \| `/html/amp/wlanadv/WlanAdvance.asp?5G` \| LOCAL + PROBED \| EG8041X6-10 and existing X7 mapping \| shared EG8041 5 GHz advanced read/object signature \| |
| docs/huawei/endpoints.md | 21 | \| `/html/amp/common/WlanChannel.asp?1=1` \| LOCAL + PROBED \| EG8041X6/X7 \| dynamic channel discovery; normalized `SUPPORTED.channel` uses firmware result when available \| |
| docs/huawei/endpoints.md | 22 | \| `/html/amp/wlanadv/set.cgi` \| LOCAL captured + existing X7 validation \| EG8041 family \| shared mapped mutation surface; POST once + readback. X6 captured surface is not itself physical write validation \| |
| docs/huawei/endpoints.md | 23 | \| `/html/amp/wlaninfo/wlaninfo.asp` \| EXTERNAL \| EG8021V5 \| Wi-Fi reference only; family mapping remains runtime-gated \| |
| docs/huawei/endpoints.md | 24 | \| `/html/bbsp/common/GetLanUserDhcpInfo.asp` \| LOCAL/EXTERNAL by firmware \| generated AMP/BBSP \| LAN-client evidence; family runtime deduplicates conservatively by normalized MAC \| |
| docs/huawei/endpoints.md | 25 | \| `/html/bbsp/common/GetLanUserDevInfo.asp` \| EXTERNAL \| HG8245X6 / EG8145V5 references \| alternate LAN-client surface; family-specific discovery required \| |
| docs/huawei/endpoints.md | 26 | \| `/html/bbsp/userdevinfo/getuserdevinfo.asp` \| EXTERNAL \| EG8145X6-10 / OptiXstar references \| alternate client surface; not auto-enabled \| |
| docs/huawei/endpoints.md | 27 | \| `/html/bbsp/maintenance/diagnosecommon.asp` \| LOCAL \| EG8041X6/X7 \| native ONT diagnostics page \| |
| docs/huawei/endpoints.md | 28 | \| `/html/bbsp/maintenance/complex.cgi?...IPPingDiagnostics...` \| LOCAL + PHYSICAL \| EG8041X6/X7 \| native ping start; single mutation request, controlled polling \| |
| docs/huawei/endpoints.md | 29 | \| `/html/bbsp/maintenance/GetPingDnsResult.asp` \| LOCAL + PHYSICAL \| EG8041X6/X7 \| read-only resolved-address polling/source \| |
| docs/huawei/endpoints.md | 30 | \| `/html/bbsp/maintenance/GetPingResult.asp` \| LOCAL + PHYSICAL \| EG8041X6/X7 \| native ping result polling + normalized packet/latency parser \| |
| docs/huawei/endpoints.md | 31 | \| `/html/bbsp/maintenance/complex.cgi?...TraceRouteDiagnostics...` \| LOCAL + PHYSICAL \| EG8041X6/X7 \| native traceroute start using discovered active WAN object path \| |
| docs/huawei/endpoints.md | 32 | \| `/html/bbsp/maintenance/GetRouteResult.asp` \| LOCAL + PHYSICAL \| EG8041X6/X7 \| traceroute result polling + normalized hop parser \| |
| docs/huawei/endpoints.md | 33 | \| `/html/ssmp/testspeed/testspeed.asp` \| LOCAL/PRESENT SURFACE \| EG8041 WebUI \| readable/present surface; start operation remains `UNKNOWN` \| |
| docs/huawei/endpoints.md | 34 | \| `/html/ssmp/testspeed/speedResult.asp` \| LOCAL/PRESENT SURFACE \| EG8041 WebUI \| result surface only; no invented task creation endpoint \| |
| docs/huawei/endpoints.md | 35 | \| `/html/ssmp/Sectionspeed/Sectionspeed.asp` \| LOCAL/PRESENT SURFACE \| EG8041 WebUI \| section-speed UI observed; START remains unsupported/unknown until characterized \| |
| .github/workflows/huawei-phase0-phase1-validation.yml | 45 | apps/zte_manager/infrastructure/huawei/js_parser.py \ |
| .github/workflows/huawei-session-validation.yml | 25 | - "apps/zte_manager/templates/index.html" |
| .github/workflows/release.yml | 170 | test -f dist/ZTEAutomatic/_internal/apps/zte_manager/templates/index.html |