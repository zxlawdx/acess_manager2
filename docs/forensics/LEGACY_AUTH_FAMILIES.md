# Legacy authentication evidence

## Protocol/auth families

| Family | Occurrences | Evidence |
| --- | --- | --- |
| rand_count | 160 | `tests/test_huawei_eg8041_family_runtime.py:166`, `tests/test_huawei_eg8041x7_runtime.py:189`, `tests/test_huawei_phase2_eg8145v5_hn8010ts.py:54`, `tests/test_huawei_phase2_eg8145v5_hn8010ts.py:135`, `tests/test_huawei_phase4_hg8245x6_affinity.py:85`, `tests/test_huawei_phase4_hg8245x6_affinity.py:100` |
| rand_string | 32 | `tests/test_huawei_transport_negotiation.py:139`, `tests/test_huawei_transport_negotiation.py:142`, `tests/test_huawei_multirepo_foundation.py:53`, `tests/test_huawei_multirepo_foundation.py:58`, `tests/test_huawei_multirepo_foundation.py:105`, `tests/test_huawei_multirepo_foundation.py:133` |
| session_token | 83 | `README.md:369`, `tools/f6201b_apply_capture.js:34`, `tools/f6201b_apply_capture.js:53`, `docs/PROTOCOL.md:10`, `docs/PROTOCOL.md:23`, `tests/test_mesh_management.py:119` |
| api_sestoken | 36 | `tests/test_huawei_phase3_hg8245h.py:94`, `tests/test_huawei_phase3_hg8245h.py:147`, `tests/test_huawei_phase3_hg8245h.py:154`, `tests/test_huawei_phase3_hg8245h.py:170`, `tests/test_huawei_phase3_hg8245h.py:195`, `tests/test_huawei_phase0_architecture.py:201` |
| asp_config | 15 | `tests/test_huawei_multirepo_foundation.py:143`, `apps/zte_manager/model/device_adapters/huawei_registry.py:271`, `apps/zte_manager/infrastructure/huawei/protocol.py:17`, `apps/zte_manager/infrastructure/huawei/protocol.py:145`, `docs/huawei/phase0_phase1_evidence.md:78`, `docs/huawei/firmware_families.md:108` |
| thinklua | 805 | `CHANGELOG.md:6`, `CHANGELOG.md:37`, `CHANGELOG.md:41`, `CHANGELOG.md:49`, `CHANGELOG.md:59`, `README.md:3` |
| amp_bbsp | 317 | `tests/test_huawei_eg8041x7_runtime.py:213`, `tests/test_huawei_eg8041x7_runtime.py:219`, `tests/test_huawei_eg8041x7_runtime.py:220`, `tests/test_huawei_eg8041x7_runtime.py:232`, `tests/test_huawei_eg8041x7_runtime.py:233`, `tests/test_huawei_eg8041x7_runtime.py:249` |

## Auth hits

| File | Line | Context |
| --- | --- | --- |
| CHANGELOG.md | 18 | - FAST.com passa a descobrir o token atual e os alvos CDN da Netflix antes de medir download, upload, latência e jitter. |
| README.md | 114 | O F670L usa o mesmo fluxo ThinkLua de login e WAN encontrado no projeto atual (`login_entry/login_token`, `ethWanStatus` e `wan_internetstatus_lua.lua`). Recursos avançados continuam sendo validados por probe porque operadoras podem ocultar menus por firmware ou nível da conta. |
| README.md | 365 | 2. captura `_sessionTmpToken`; |
| README.md | 369 | 6. `_sessionTOKEN` por último; |
| README.md | 383 | Os repositórios aparentados ajudam a reproduzir o protocolo, mas o F6600P e seu firmware continuam sendo a autoridade final. O código lê estado/tokens/chaves dinamicamente exatamente por isso. |
| tools/f6201b_apply_capture.js | 5 | * Nenhum valor de formulário, cookie, senha, token, header ou IP é guardado. |
| tools/f6201b_apply_capture.js | 34 | .filter(key => !["_", "_tag", "_type", "_sessionTOKEN"].includes(key)) |
| tools/f6201b_apply_capture.js | 53 | has_session_token: pairs.some(([key]) => key === "_sessionTOKEN"), |
| docs/F6201B_EXPERIMENTAL_WRITES.md | 13 | Wi-Fi, credenciais PPPoE/ACS, cookies, tokens temporários, dados de |
| docs/frontend-css-architecture.md | 44 | 1. `foundation/tangerine_tokens.css` |
| docs/frontend-css-architecture.md | 52 | tokens first, and `--ui-*` remains only an alias namespace in the foundation. |
| docs/frontend-css-architecture.md | 60 | 1. `foundation/tangerine_tokens.css` |
| docs/frontend-css-architecture.md | 73 | `tangerine.css` owns no selectors and no token values. CI enforces the exact |
| docs/frontend-css-architecture.md | 81 | 1. `foundation/tangerine_tokens.css` |
| docs/frontend-css-architecture.md | 95 | `foundation/tangerine_tokens.css` is the only owner of canonical design tokens: |
| docs/frontend-css-architecture.md | 107 | not design tokens and stay with the component that owns their behavior. |
| docs/frontend-css-architecture.md | 109 | Light and dark themes change token values rather than duplicating component |
| docs/frontend-css-architecture.md | 113 | A small set of canonical native-control tokens exists because QtWebEngine popup |
| docs/frontend-css-architecture.md | 140 | feature but are not token/theme definitions. |
| docs/frontend-css-architecture.md | 172 | foundation tokens; they are not token sources. |
| docs/frontend-css-architecture.md | 184 | migrate to canonical tokens, these files should shrink instead of accumulating |
| docs/frontend-css-architecture.md | 204 | No longer owns design tokens, page rules or reusable components. It is an |
| docs/frontend-css-architecture.md | 273 | 5. extend structural/token regressions; |
| docs/AUDITORIA_FUNCOES_ZTE_2026.md | 62 | **Privacidade:** não subir logs que contenham session token, SSID de cliente, |
| docs/F6600P_LIVE_DIAGNOSTIC_LIGHT_MODE_FIX.md | 47 | `light_mode_refine.css`: theme-dependent native option tokens plus |
| docs/MULTIMODEL_ZTE.md | 64 | mensagem de erro sem cookies, chaves, senhas, MACs ou IPs do cliente. |
| docs/DEVICE_ADAPTER_PHASE1.md | 73 | (password/passphrase/token/cookie/psk etc.) em mapas aninhados. Conteúdo |
| docs/F670L-WINDOWS-COMPAT.md | 25 | **Nota de segurança:** backup binário e snapshots podem conter dados de clientes e de rede. Não anexar logs brutos ou backups ao GitHub. Para diagnóstico público, remova IPs externos, MACs, SSIDs, tokens, credenciais, serial e nomes. |
| docs/F6600P_DHCP_TR069_PROVIDER_NAMED_PRESETS.md | 9 | or using the authenticated `_sessionTmpToken`. **It was showing encrypted |
| docs/F6600P_DHCP_TR069_PROVIDER_NAMED_PRESETS.md | 15 | existing authenticated session token. The correct ZTE cipher is |
| docs/F6600P_DHCP_TR069_PROVIDER_NAMED_PRESETS.md | 16 | AES-256-CBC, with key SHA256(sessionTmpToken) and IV derived from the |
| docs/F6600P_DHCP_TR069_PROVIDER_NAMED_PRESETS.md | 17 | reversed token (existing `zte_security.aes_decrypt_value`). |
| docs/F6600P_DHCP_TR069_PROVIDER_NAMED_PRESETS.md | 95 | session tokens or connection-request URLs to public issue reports. |
| docs/PROTOCOL.md | 7 | 1. `GET /?_type=loginData&_tag=login_entry` para obter `sess_token`. |
| docs/PROTOCOL.md | 8 | 2. `GET /?_type=loginData&_tag=login_token` para obter o challenge. |
| docs/PROTOCOL.md | 9 | 3. `SHA256(password + login_token)`. |
| docs/PROTOCOL.md | 10 | 4. `POST /?_type=loginData&_tag=login_entry` com `Username`, hash e `_sessionTOKEN`. |
| docs/PROTOCOL.md | 21 | -> extrai _sessionTmpToken |
| docs/PROTOCOL.md | 23 | -> adiciona &_sessionTOKEN=<token> por último |
| docs/PROTOCOL.md | 106 | O backend público declara `UserName` e `Password` em `<encode>`. A UI oficial descriptografa esses campos com AES-CBC usando SHA256 de `_sessionTmpToken` como chave e SHA256 do token invertido como IV. A API mascara a senha por padrão e só retorna o valor revelado quando a UI solicita explicitamente. |
| docs/PROTOCOL.md | 137 | login_entry -> login_token -> SHA256(password + token) -> login_entry |
| docs/F6201B_WORKBENCH_STATUS.md | 10 | de diagnóstico). O JSON contém credenciais, senhas, tokens e informações |
| docs/F6201B_WORKBENCH_STATUS.md | 83 | menuView é reaberta antes de cada POST para obter novo token e |
| docs/F6201B_WORKBENCH_STATUS.md | 92 | instâncias, prévias, progresso e estados de erro. CSS usa os tokens |
| docs/ARCHITECTURE.md | 182 | Duas operações concorrentes na mesma `requests.Session()` poderiam mudar a view/token temporário do firmware no meio de outra operação. |
| docs/ACCESS_MANAGER_CAPABILITY_AUDIT.md | 18 | - A assinatura RSA/Check, token efêmero e cookies continuam enviados pelo |
| docs/ACCESS_MANAGER_CAPABILITY_AUDIT.md | 40 | com o token vigente do GET e recodificados em AES/RSA no POST, conforme |
| docs/ACCESS_MANAGER_CAPABILITY_AUDIT.md | 48 | `PingDiagnosis` e `TraceRouteDiagnosis` (com Check/token reais) e polling |
| docs/ACCESS_MANAGER_CAPABILITY_AUDIT.md | 73 | - A interface clara reutiliza os tokens centrais `--ui-*`, incluindo o |
| tests/test_provider_diagnostics_ui.cjs | 168 | wifi_environment:"GET /api/router/?token=SECRET; traceback", |
| tests/test_provider_diagnostics_ui.cjs | 173 | assert.doesNotMatch(report,/GET\|POST\|api\/\|token\|SECRET\|private\|traceback/); |
| tests/test_f6201b_operator_reads.py | 24 | return '{"master":{"token":"DO_NOT_RETURN"},"password":"HIDDEN","ad":{"one":{"MacAddr":"SECRET_MAC"}}}' |
| tests/test_f6201b_operator_reads.py | 66 | router.get_menu = lambda _tag, **_opts: "<html>SECRET_SESSION_TOKEN</html>" |
| tests/test_f6201b_operator_reads.py | 69 | self.assertNotIn("SECRET_SESSION_TOKEN", str(report)) |
| tests/test_security.py | 7 | extract_session_tmp_token, |
| tests/test_security.py | 12 | def test_extrai_token_hex_da_menu_view(self): |
| tests/test_security.py | 13 | html = '_sessionTmpToken = "\\x31\\x32\\x33\\x34";' |
| tests/test_security.py | 16 | extract_session_tmp_token( |
| tests/test_capability_probe_safety.py | 32 | "ConnectionRequestURL": "http://router.local/?token=SECRET", |
| tests/test_huawei_phase5_hg8347r_lab.py | 90 | def test_clean_room_runtime_extracts_token_and_clients(self): |
| tests/test_huawei_phase5_hg8347r_lab.py | 107 | self.assertEqual(sent["x.X_HW_Token"], "0123456789abcdef0123456789abcdef") |
| tests/test_huawei_phase5_hg8347r_lab.py | 162 | session.cookies.set("Cookie", "sid=fixture:Language:english:id=1") |
| tests/test_huawei_phase5_hg8347r_lab.py | 170 | {"x.X_HW_Token": "fixture-token"}, |
| tests/test_huawei_phase5_hg8347r_lab.py | 172 | cookie_header=transport.cookie_header(session), |
| tests/test_huawei_phase5_hg8347r_lab.py | 181 | self.assertIn(b"x.X_HW_Token=fixture-token", raw) |
| tests/test_huawei_phase5_hg8347r_lab.py | 182 | self.assertIn(b"Cookie: Cookie=sid=fixture", raw) |
| tests/test_history_view.cjs | 52 | {operation:"POST /api?token=PRIVATE",success:false,created_at:"2026-09-29T01:21:00"} |
| tests/test_huawei_eg8041_family_runtime.py | 166 | "evidence": ["endpoint:/asp/GetRandCount.asp"], |
| tests/test_mesh_management.py | 84 | self.session_tmp_token = None |
| tests/test_mesh_management.py | 97 | self.session_tmp_token = ( |
| tests/test_mesh_management.py | 98 | "fresh-token" |
| tests/test_mesh_management.py | 119 | "_sessionTOKEN" |
| tests/test_mesh_management.py | 121 | == "fresh-token" |
| tests/test_mesh_management.py | 133 | self.session_tmp_token = "token-that-browser-does-not-need" |
| tests/test_mesh_management.py | 174 | def test_f670l_braziloi_backend_prefers_cookie_only_menu_data(self): |
| tests/test_mesh_management.py | 194 | "cookie_only", |
| tests/test_mesh_management.py | 197 | result["backend"]["used_session_token"] |
| tests/test_mesh_management.py | 233 | def test_mesh_probe_falls_back_to_known_view_and_forwards_token(self): |
| tests/test_mesh_management.py | 251 | result["backend"]["used_session_token"] |
| tests/test_mesh_management.py | 255 | "session_token", |
| tests/test_mesh_management.py | 261 | "_sessionTOKEN": "fresh-token" |
| tests/test_f6600p_support_progress.py | 98 | side_effect=sqlite3.OperationalError("SECRET_SESSION_TOKEN")), |
| tests/test_huawei_eg8041x7_runtime.py | 16 | TOKEN = "b" * 64 |
| tests/test_huawei_eg8041x7_runtime.py | 45 | def extract_token(_page): |
| tests/test_huawei_eg8041x7_runtime.py | 46 | return TOKEN |
| tests/test_huawei_eg8041x7_runtime.py | 49 | return f'<input id="hwonttoken" value="{TOKEN}">' |
| tests/test_huawei_eg8041x7_runtime.py | 56 | if key != "x.X_HW_Token" |
| tests/test_huawei_eg8041x7_runtime.py | 187 | '<html><form action="login.cgi">' |
| tests/test_huawei_eg8041x7_runtime.py | 189 | '<script src="GetRandCount.asp"></script></form></html>' |
| tests/test_f6201b_writes.py | 41 | self.session_tmp_token = "fake temporary token" |
| tests/test_f6201b_writes.py | 91 | self.assertNotIn("fake temporary token", str(result)) |
| tests/test_wifi_ssid.py | 44 | session_tmp_token = "1234567890123456" |
| tests/test_frontend_core.mjs | 108 | error: "POST /router?token=PRIVATE", |
| tests/test_frontend_core.mjs | 113 | assert.doesNotMatch(error.message, /PRIVATE\|POST\|token/i); |
| tests/test_f6201b_workbench.py | 30 | self.session_tmp_token = None |
| tests/test_f6201b_workbench.py | 36 | self.session_tmp_token = "fresh-synthetic-token" |
| tests/test_f6201b_workbench.py | 96 | if name != "_sessionTOKEN"]) |
| tests/test_f6201b_workbench.py | 100 | self.assertNotIn("_sessionTOKEN", dict(payload)) |
| tests/test_f6201b_workbench.py | 121 | self.assertEqual(zte.session_tmp_token, "fresh-synthetic-token") |
| tests/test_huawei_http_trace_redaction.py | 13 | def test_raw_trace_alias_never_prints_credentials_tokens_or_psk(self): |
| tests/test_huawei_http_trace_redaction.py | 20 | url="http://192.168.18.1/login.cgi", |
| tests/test_huawei_http_trace_redaction.py | 23 | "x.X_HW_Token": "TOKEN_SECRET", |
| tests/test_huawei_http_trace_redaction.py | 28 | "Cookie": "CookieHttp=COOKIE_SECRET", |
| tests/test_huawei_http_trace_redaction.py | 31 | body="BASE64_SECRET TOKEN_SECRET WIFI_SECRET COOKIE_SECRET", |
| tests/test_huawei_http_trace_redaction.py | 40 | "TOKEN_SECRET", |
| tests/test_huawei_http_trace_redaction.py | 42 | "COOKIE_SECRET", |
| tests/test_light_mode_refine.cjs | 17 | const token = name => { |
| tests/test_light_mode_refine.cjs | 36 | const white = token("--ui-surface"); |
| tests/test_light_mode_refine.cjs | 37 | assert.ok(contrast(white,token("--ui-text")) >= 7, |
| tests/test_light_mode_refine.cjs | 39 | assert.ok(contrast(white,token("--ui-text-secondary")) >= 4.5); |
| tests/test_light_mode_refine.cjs | 40 | assert.ok(contrast(white,token("--ui-muted")) >= 4.5); |
| tests/test_light_mode_refine.cjs | 41 | assert.ok(contrast(white,token("--ui-accent")) >= 4.5, |
| tests/test_light_mode_refine.cjs | 43 | assert.ok(contrast("#ffffff",token("--ui-accent")) >= 4.5); |
| tests/test_huawei_session_snapshot.py | 405 | "CookieHttp": "cookie-secret", |
| tests/test_huawei_session_snapshot.py | 406 | "X_HW_Token": "token-secret", |
| tests/test_huawei_session_snapshot.py | 412 | self.assertNotIn("CookieHttp", probe) |
| tests/test_huawei_session_snapshot.py | 413 | self.assertNotIn("X_HW_Token", probe) |
| tests/test_provider_diagnostics.py | 144 | {"name": "DNS", "success": False, "detail": "token=SECRET"}, |
| tests/test_huawei_phase2_eg8145v5_hn8010ts.py | 54 | def test_eg8145v5_uses_shared_randcount_session_and_model_schema(self): |
| tests/test_huawei_phase2_eg8145v5_hn8010ts.py | 135 | def test_non_randcount_session_is_rejected_before_phase2_probe(self): |
| tests/test_huawei_phase2_eg8145v5_hn8010ts.py | 138 | client.auth_flow = HuaweiAuthFlow.RAND_STRING_SESSION_TOKEN |
| tests/test_f6201b_diagnostics_native.py | 34 | self.session_tmp_token = "fake-diagnostic-token" |
| tests/test_f6201b_diagnostics_native.py | 100 | "PingAck", "_sessionTOKEN", |
| tests/test_f6201b_diagnostics_native.py | 105 | "Btn_TraceRouteDiagnosis", "Result", "_sessionTOKEN", |
| tests/test_structured_forms.cjs | 99 | config:{session_token:"SECRET_123",url:"https://user:pass@example.com", |
| tests/test_huawei_mapped_surface.py | 18 | TOKEN_PAGE = ( |
| tests/test_huawei_mapped_surface.py | 19 | '<input type="hidden" id="hwonttoken" ' |
| tests/test_huawei_mapped_surface.py | 20 | 'value="fresh-token-123456">' |
| tests/test_huawei_mapped_surface.py | 31 | def extract_token(source): |
| tests/test_huawei_mapped_surface.py | 32 | if "fresh-token-123456" not in source: |
| tests/test_huawei_mapped_surface.py | 33 | raise RuntimeError("token missing") |
| tests/test_huawei_mapped_surface.py | 34 | return "fresh-token-123456" |
| tests/test_huawei_mapped_surface.py | 42 | return TOKEN_PAGE + ( |
| tests/test_huawei_mapped_surface.py | 137 | def test_tokenized_post_read_gets_fresh_token_without_mutating(self): |
| tests/test_huawei_mapped_surface.py | 144 | token_page="/html/test/page.asp", |
| tests/test_huawei_mapped_surface.py | 152 | payload["x.X_HW_Token"], |
| tests/test_huawei_mapped_surface.py | 153 | "fresh-token-123456", |
| tests/test_huawei_mapped_surface.py | 193 | def test_write_injects_fresh_token_and_submits_exactly_once(self): |
| tests/test_huawei_mapped_surface.py | 199 | "x.X_HW_Token": "caller-token-must-not-pass", |
| tests/test_huawei_mapped_surface.py | 202 | token_page="/html/test/page.asp", |
| tests/test_huawei_mapped_surface.py | 216 | payload["x.X_HW_Token"], |
| tests/test_huawei_mapped_surface.py | 217 | "fresh-token-123456", |
| tests/test_huawei_mapped_surface.py | 220 | "caller-token-must-not-pass", |
| tests/test_huawei_mapped_surface.py | 226 | def test_write_can_transmit_password_field_but_never_accept_session_token(self): |
| tests/test_huawei_mapped_surface.py | 233 | "x.X_HW_Token": "caller-token", |
| tests/test_huawei_mapped_surface.py | 234 | "CookieHttp": "caller-cookie", |
| tests/test_huawei_mapped_surface.py | 237 | token_page="/html/test/page.asp", |
| tests/test_huawei_mapped_surface.py | 245 | payload["x.X_HW_Token"], |
| tests/test_huawei_mapped_surface.py | 246 | "fresh-token-123456", |
| tests/test_huawei_mapped_surface.py | 248 | self.assertNotIn("CookieHttp", payload) |
| tests/test_multimodel_discovery.py | 65 | def test_post_menu_blocks_new_models_even_with_token(self): |
| tests/test_multimodel_discovery.py | 69 | session_tmp_token = "fake" |
| tests/test_huawei_diagnostics.py | 12 | TOKEN_PAGE = ( |
| tests/test_huawei_diagnostics.py | 13 | '<input type="hidden" id="hwonttoken" ' |
| tests/test_huawei_diagnostics.py | 14 | 'value="fresh-token-123456">' |
| tests/test_huawei_diagnostics.py | 37 | def extract_token(source): |
| tests/test_huawei_diagnostics.py | 38 | if "fresh-token-123456" not in source: |
| tests/test_huawei_diagnostics.py | 39 | raise RuntimeError("token missing") |
| tests/test_huawei_diagnostics.py | 40 | return "fresh-token-123456" |
| tests/test_huawei_diagnostics.py | 45 | return TOKEN_PAGE |
| tests/test_huawei_diagnostics.py | 111 | payload["x.X_HW_Token"], |
| tests/test_huawei_diagnostics.py | 112 | "fresh-token-123456", |
| tests/test_huawei_ipv4_filter.py | 56 | extract_token = staticmethod( |
| tests/test_huawei_ipv4_filter.py | 57 | HuaweiWebClient.extract_token |
| tests/test_huawei_ipv4_filter.py | 187 | "token-1", |
| tests/test_huawei_ipv4_filter.py | 203 | "x.X_HW_Token": "token-1", |
| tests/test_huawei_ipv4_filter.py | 210 | "token-2", |
| tests/test_huawei_ipv4_filter.py | 221 | payload["x.X_HW_Token"], |
| tests/test_huawei_ipv4_filter.py | 222 | "token-2", |
| tests/test_huawei_ipv4_filter.py | 236 | "token-3", |
| tests/test_huawei_ipv4_filter.py | 245 | "x.X_HW_Token": "token-3", |
| tests/test_huawei_ipv4_filter.py | 253 | '<input id="hwonttoken" ' |
| tests/test_huawei_ipv4_filter.py | 254 | 'value="fixture-token-1234567890">' |
| tests/test_huawei_phase4_hg8245x6_affinity.py | 45 | proof_cookie: str \| None = None |
| tests/test_huawei_phase4_hg8245x6_affinity.py | 56 | cls.proof_cookie = None |
| tests/test_huawei_phase4_hg8245x6_affinity.py | 85 | if self.path == "/asp/GetRandCount.asp": |
| tests/test_huawei_phase4_hg8245x6_affinity.py | 100 | if self.path == "/asp/GetRandCount.asp": |
| tests/test_huawei_phase4_hg8245x6_affinity.py | 106 | if self.path == "/login.cgi": |
| tests/test_huawei_phase4_hg8245x6_affinity.py | 114 | "Set-Cookie": ( |
| tests/test_huawei_phase4_hg8245x6_affinity.py | 115 | "Cookie=sid=fixture-session:Language:english:id=1; " |
| tests/test_huawei_phase4_hg8245x6_affinity.py | 124 | type(self).proof_cookie = self.headers.get("Cookie") |
| tests/test_huawei_phase4_hg8245x6_affinity.py | 125 | if type(self).proof_cookie and "sid=fixture-session" in type(self).proof_cookie: |
| tests/test_huawei_phase4_hg8245x6_affinity.py | 214 | "GetRandCount and login.cgi must arrive over the exact same TCP socket", |
| tests/test_huawei_phase4_hg8245x6_affinity.py | 219 | self.assertIn("sid=fixture-session", _AffinityFixtureHandler.proof_cookie or "") |
| tests/test_huawei_phase4_hg8245x6_affinity.py | 225 | _AffinityFixtureHandler.login_payload.get("x.X_HW_Token"), |
| tests/test_huawei_phase4_hg8245x6_affinity.py | 234 | def test_ordinary_randcount_page_does_not_enable_affinity(self): |
| tests/test_huawei_phase4_hg8245x6_affinity.py | 236 | <html><form action='/login.cgi'> |
| tests/test_huawei_phase4_hg8245x6_affinity.py | 238 | <script src='/asp/GetRandCount.asp'></script> |
| tests/test_tangerine_feature_experience.cjs | 116 | UserName:"admin",ConnectionRequestURL:"http://TOKEN", |
| tests/test_tangerine_feature_experience.cjs | 123 | assert.doesNotMatch(raw,/PRIVATE\|TOKEN\|SECRET\|Username\|remoteMgr\|tr069_remotemgr\|https/); |
| tests/test_tangerine_feature_experience.cjs | 131 | assert.doesNotMatch(visible,/PRIVATE\|TOKEN\|SECRET\|remoteMgr\|\.lua/); |
| tests/test_windows_compat.py | 29 | session_token = "fake-token" |
| tests/test_huawei_transport_negotiation.py | 98 | "/asp/GetRandCount.asp", |
| tests/test_huawei_transport_negotiation.py | 101 | ("POST", "/login.cgi", FakeResponse(fixture("auth_login_success.html"))), |
| tests/test_huawei_transport_negotiation.py | 105 | def test_auth_flow_security_script_with_standard_randcount_form_stays_randcount(self): |
| tests/test_huawei_transport_negotiation.py | 110 | self.assertIn("x.X_HW_Token", source) |
| tests/test_huawei_transport_negotiation.py | 111 | self.assertNotIn("Cookie=rid=", source) |
| tests/test_huawei_transport_negotiation.py | 112 | self.assertNotIn("Cookie=username:", source) |
| tests/test_huawei_transport_negotiation.py | 118 | def test_auth_flow_explicit_derived_rid_cookie_is_legacy_hash(self): |
| tests/test_huawei_transport_negotiation.py | 120 | <script src='/asp/GetRandCount.asp'></script> |
| tests/test_huawei_transport_negotiation.py | 122 | <script>var cookie = 'Cookie=rid=<derived>:Language:english:id=-1';</script> |
| tests/test_huawei_transport_negotiation.py | 126 | HuaweiAuthFlow.RAND_COOKIE_HASH, |
| tests/test_huawei_transport_negotiation.py | 129 | def test_auth_flow_explicit_username_cookie_is_legacy_hash(self): |
| tests/test_huawei_transport_negotiation.py | 131 | <script src='/asp/GetRandCount.asp'></script> |
| tests/test_huawei_transport_negotiation.py | 132 | <script>var cookie = 'Cookie=username:<derived>'; </script> |
| tests/test_huawei_transport_negotiation.py | 136 | HuaweiAuthFlow.RAND_COOKIE_HASH, |
| tests/test_huawei_transport_negotiation.py | 139 | def test_auth_flow_randstring_remains_session_token_flow(self): |
| tests/test_huawei_transport_negotiation.py | 142 | '<script src="/html/ssmp/common/getRandString.asp"></script>' |
| tests/test_huawei_transport_negotiation.py | 144 | HuaweiAuthFlow.RAND_STRING_SESSION_TOKEN, |
| tests/test_huawei_transport_negotiation.py | 147 | def test_auth_flow_plain_randcount_remains_randcount(self): |
| tests/test_huawei_transport_negotiation.py | 150 | '<script src="/asp/GetRandCount.asp"></script>' |
| tests/test_huawei_transport_negotiation.py | 213 | def test_explicit_https_80_eg8041_security_script_uses_randcount_and_logs_in(self): |
| tests/test_huawei_transport_negotiation.py | 243 | ("POST", "/asp/GetRandCount.asp"), |
| tests/test_huawei_transport_negotiation.py | 244 | ("POST", "/login.cgi"), |
| tests/test_huawei_transport_negotiation.py | 251 | def test_standard_randcount_preserves_full_cleaned_challenge_in_login_payload(self): |
| tests/test_huawei_transport_negotiation.py | 272 | self.assertEqual(urlsplit(login_call["url"]).path, "/login.cgi") |
| tests/test_huawei_transport_negotiation.py | 274 | login_call["kwargs"]["data"]["x.X_HW_Token"], |
| tests/test_huawei_transport_negotiation.py | 278 | login_call["kwargs"]["data"]["x.X_HW_Token"], |
| tests/test_huawei_transport_negotiation.py | 358 | "https://192.0.2.10:80/asp/GetRandCount.asp", |
| tests/test_huawei_transport_negotiation.py | 385 | response._content = b"fixture-secret-token-value-123456789" |
| tests/test_huawei_transport_negotiation.py | 386 | response.url = "https://192.0.2.10:80/login.cgi?token=fixture-secret-query" |
| tests/test_huawei_transport_negotiation.py | 390 | data={"PassWord": "fixture-secret-password", "x.X_HW_Token": "fixture-token"}, |
| tests/test_huawei_transport_negotiation.py | 392 | response.headers = {"Set-Cookie": "fixture-secret-cookie"} |
| tests/test_huawei_transport_negotiation.py | 404 | self.assertIn("path=/login.cgi", output) |
| tests/test_huawei_transport_negotiation.py | 406 | self.assertNotIn("token=", output) |
| tests/test_huawei_transport_negotiation.py | 408 | self.assertNotIn("Set-Cookie", output) |
| tests/test_huawei_captured_features.py | 32 | TOKEN = "a" * 64 |
| tests/test_huawei_captured_features.py | 47 | f'<input id="hwonttoken" value="{TOKEN}">' |
| tests/test_huawei_captured_features.py | 113 | def extract_token(self, html): |
| tests/test_huawei_captured_features.py | 114 | return TOKEN |
| tests/test_huawei_captured_features.py | 133 | return '<input id="hwonttoken" value="' + TOKEN + '">' |
| tests/test_huawei_captured_features.py | 135 | return '<input id="hwonttoken" value="' + TOKEN + '">' |
| tests/test_huawei_captured_features.py | 234 | return '<input id="hwonttoken" value="' + TOKEN + '">' |
| tests/test_huawei_captured_features.py | 372 | self.assertEqual(payload["x.X_HW_Token"], TOKEN) |
| tests/test_huawei_captured_features.py | 598 | self.assertEqual(payload["x.X_HW_Token"], TOKEN) |
| tests/test_huawei_captured_features.py | 648 | self.assertEqual(payload["x.X_HW_Token"], TOKEN) |
| tests/test_multivendor_runtime_regressions.py | 189 | self.cookies = requests.cookies.RequestsCookieJar() |
| tests/test_multivendor_runtime_regressions.py | 203 | if "GetRandCount.asp" in url: |
| tests/test_multivendor_runtime_regressions.py | 205 | if "login.cgi" in url: |
| tests/test_multivendor_runtime_regressions.py | 248 | <html><form action="/login.cgi"> |
| tests/test_multivendor_runtime_regressions.py | 250 | <script src="/asp/GetRandCount.asp"></script> |
| tests/test_multivendor_runtime_regressions.py | 298 | '<input type="hidden" id="hwonttoken" ' |
| tests/test_multivendor_runtime_regressions.py | 299 | 'value="fixture-token-1234567890">' |
| tests/test_f6201b_expanded_lab.py | 68 | tuple(key for key,_ in fields)+("_sessionTOKEN",), |
| tests/test_huawei_phase3_hg8245h.py | 11 | ApiSesTokenAuth, |
| tests/test_huawei_phase3_hg8245h.py | 20 | API_SES_TOKEN_PATH, |
| tests/test_huawei_phase3_hg8245h.py | 40 | class FakeCookies: |
| tests/test_huawei_phase3_hg8245h.py | 67 | self.cookies = FakeCookies() |
| tests/test_huawei_phase3_hg8245h.py | 86 | "<html><script>var p='/asp/GetRandCount.asp';</script></html>", |
| tests/test_huawei_phase3_hg8245h.py | 90 | if path == API_SES_TOKEN_PATH: |
| tests/test_huawei_phase3_hg8245h.py | 94 | else fixture("sestokeninfo.xml") |
| tests/test_huawei_phase3_hg8245h.py | 117 | if path == "/asp/GetRandCount.asp": |
| tests/test_huawei_phase3_hg8245h.py | 119 | if path == "/login.cgi": |
| tests/test_huawei_phase3_hg8245h.py | 129 | self.auth_flow = HuaweiAuthFlow.API_SES_TOKEN |
| tests/test_huawei_phase3_hg8245h.py | 130 | self.protocol_family = HuaweiProtocolFamily.API_SESTOKEN |
| tests/test_huawei_phase3_hg8245h.py | 146 | def test_sestoken_parser_accepts_xml_and_json(self): |
| tests/test_huawei_phase3_hg8245h.py | 147 | for name in ("sestokeninfo.xml", "sestokeninfo.json"): |
| tests/test_huawei_phase3_hg8245h.py | 149 | context = ApiSesTokenAuth.parse_session_token_info(fixture(name)) |
| tests/test_huawei_phase3_hg8245h.py | 151 | self.assertGreaterEqual(len(context.token), 16) |
| tests/test_huawei_phase3_hg8245h.py | 154 | context = ApiSesTokenAuth.parse_session_token_info(fixture("sestokeninfo.xml")) |
| tests/test_huawei_phase3_hg8245h.py | 158 | ApiSesTokenAuth.encode_password(password, context.token, "base64"), |
| tests/test_huawei_phase3_hg8245h.py | 161 | digest = hashlib.sha256((b64 + context.token).encode()).hexdigest() |
| tests/test_huawei_phase3_hg8245h.py | 164 | ApiSesTokenAuth.encode_password(password, context.token, "token_sha256"), |
| tests/test_huawei_phase3_hg8245h.py | 169 | auth = ApiSesTokenAuth(HuaweiCredentialSubmissionBudget()) |
| tests/test_huawei_phase3_hg8245h.py | 170 | context = ApiSesTokenAuth.parse_session_token_info(fixture("sestokeninfo.xml")) |
| tests/test_huawei_phase3_hg8245h.py | 189 | self.assertEqual(client.auth_flow, HuaweiAuthFlow.API_SES_TOKEN) |
| tests/test_huawei_phase3_hg8245h.py | 190 | self.assertEqual(client.protocol_family, HuaweiProtocolFamily.API_SESTOKEN) |
| tests/test_huawei_phase3_hg8245h.py | 195 | context = ApiSesTokenAuth.parse_session_token_info(fixture("sestokeninfo.xml")) |
| tests/test_huawei_phase3_hg8245h.py | 196 | expected = ApiSesTokenAuth.encode_password( |
| tests/test_huawei_phase3_hg8245h.py | 197 | "fixture-password", context.token, "token_sha256" |
| tests/test_huawei_phase3_hg8245h.py | 225 | def test_invalid_api_fingerprint_falls_back_to_legacy_randcount(self): |
| tests/test_huawei_phase3_hg8245h.py | 236 | self.assertEqual(session.credential_posts[0][0], "/login.cgi") |
| tests/test_huawei_multirepo_foundation.py | 32 | class FakeCookies: |
| tests/test_huawei_multirepo_foundation.py | 41 | self.cookies = FakeCookies() |
| tests/test_huawei_multirepo_foundation.py | 53 | "getRandString.asp" |
| tests/test_huawei_multirepo_foundation.py | 55 | else "GetRandCount.asp" |
| tests/test_huawei_multirepo_foundation.py | 58 | if url.endswith("getRandString.asp"): |
| tests/test_huawei_multirepo_foundation.py | 60 | if url.endswith("GetRandToken.asp"): |
| tests/test_huawei_multirepo_foundation.py | 62 | if url.endswith("GetRandCount.asp"): |
| tests/test_huawei_multirepo_foundation.py | 74 | if url.endswith("GetRandCount.asp"): |
| tests/test_huawei_multirepo_foundation.py | 76 | if url.endswith("login.cgi"): |
| tests/test_huawei_multirepo_foundation.py | 82 | '<form action="login.cgi"><input name="UserName"></form>', |
| tests/test_huawei_multirepo_foundation.py | 83 | "http://192.168.18.1/login.cgi", |
| tests/test_huawei_multirepo_foundation.py | 104 | "auth_flow": "rand_string_session_token", |
| tests/test_huawei_multirepo_foundation.py | 105 | "evidence": ["/html/ssmp/common/getRandString.asp"], |
| tests/test_huawei_multirepo_foundation.py | 129 | auth_flow_from_login_page("/asp/GetRandCount.asp"), |
| tests/test_huawei_multirepo_foundation.py | 133 | auth_flow_from_login_page("/html/ssmp/common/getRandString.asp"), |
| tests/test_huawei_multirepo_foundation.py | 134 | HuaweiAuthFlow.RAND_STRING_SESSION_TOKEN, |
| tests/test_huawei_multirepo_foundation.py | 143 | self.assertEqual(family, HuaweiProtocolFamily.ASP_CONFIG) |
| tests/test_huawei_multirepo_foundation.py | 154 | HuaweiAuthFlow.RAND_STRING_SESSION_TOKEN, |
| tests/test_huawei_multirepo_foundation.py | 157 | def test_rand_string_login_strips_bom_and_uses_post_login_session_token(self): |
| tests/test_huawei_multirepo_foundation.py | 173 | HuaweiAuthFlow.RAND_STRING_SESSION_TOKEN, |
| tests/test_huawei_multirepo_foundation.py | 177 | self.assertNotIn("token", " ".join(descriptor.keys()).casefold()) |
| tests/test_api_client_ui.cjs | 74 | error:"POST /router?token=PRIVATE" |
| tests/test_huawei_hg8010_telemetry.py | 122 | def test_legacy_cookie_hash_login_is_distinct_from_normal_randcount(self): |
| tests/test_huawei_hg8010_telemetry.py | 123 | source = fixture("login_legacy_rand_cookie.html") |
| tests/test_huawei_hg8010_telemetry.py | 126 | HuaweiAuthFlow.RAND_COOKIE_HASH, |
| tests/test_huawei_hg8010_telemetry.py | 129 | auth_flow_from_login_page('<script src="/asp/GetRandCount.asp"></script>'), |
| tests/test_huawei_hg8010_telemetry.py | 133 | def test_randcount_can_extract_only_characterized_trailing_32_hex_token(self): |
| tests/test_huawei_hg8010_telemetry.py | 139 | opaque = "not-hex-but-valid-token-value-abcdefghijklmnopqrstuvwxyz" |
| tests/test_huawei_eg8041_capture_contract.py | 15 | TOKEN = "c" * 64 |
| tests/test_huawei_eg8041_capture_contract.py | 47 | def extract_token(_page): |
| tests/test_huawei_eg8041_capture_contract.py | 48 | return TOKEN |
| tests/test_huawei_eg8041_capture_contract.py | 56 | return f'<input id="hwonttoken" value="{TOKEN}">' |
| tests/test_huawei_eg8041_capture_contract.py | 165 | self.assertEqual(mutation_events[0][2]["x.X_HW_Token"], TOKEN) |
| tests/test_design_tokens.cjs | 11 | const tokensSource = css("foundation/tangerine_tokens.css"); |
| tests/test_design_tokens.cjs | 68 | /^@import url\("\.\/foundation\/tangerine_tokens\.css"\);\s*@import url\("\.\/pages\/support_workbench\.css"\);\s*@import url\("\.\/pages\/diagnostics_workbench\.css"\);\s*@import url\("\.\/pages\/profile_workbench\.css"\);\s*@import url\("\.\/pages\/workbench_responsive\.css"\);\s*@import url\("\.\/components\/operato |
| tests/test_design_tokens.cjs | 75 | /^@import url\("\.\/foundation\/tangerine_tokens\.css"\);\s*@import url\("\.\/themes\/tangerine_base_compat\.css"\);\s*@import url\("\.\/pages\/dashboard_tangerine\.css"\);\s*@import url\("\.\/themes\/tangerine_terminal_compat\.css"\);\s*@import url\("\.\/layout\/editorial_workspace\.css"\);\s*@import url\("\.\/pages\/ |
| tests/test_design_tokens.cjs | 82 | /^@import url\("\.\/foundation\/tangerine_tokens\.css"\);\s*@import url\("\.\/themes\/light_base_compat\.css"\);\s*@import url\("\.\/themes\/light_feature_compat\.css"\);\s*@import url\("\.\/themes\/light_console_compat\.css"\);\s*@import url\("\.\/components\/native_controls_light\.css"\);/s, |
| tests/test_design_tokens.cjs | 87 | test("canonical tokens own theme values and legacy names are aliases", () => { |
| tests/test_design_tokens.cjs | 88 | assert.match(tokensSource, /:root,\s*html\[data-theme="light"\]/); |
| tests/test_design_tokens.cjs | 89 | assert.match(tokensSource, /html\[data-theme="dark"\]/); |
| tests/test_design_tokens.cjs | 92 | assert.match(tokensSource, /--am-color-primary:#FF6C37;/); |
| tests/test_design_tokens.cjs | 93 | assert.match(tokensSource, /--am-color-bg:#FFFDF8;/); |
| tests/test_design_tokens.cjs | 94 | assert.match(tokensSource, /--am-color-text:#29221E;/); |
| tests/test_design_tokens.cjs | 97 | assert.match(tokensSource, /--am-color-primary:#FFB454;/); |
| tests/test_design_tokens.cjs | 98 | assert.match(tokensSource, /--am-color-bg:#07090D;/); |
| tests/test_design_tokens.cjs | 99 | assert.match(tokensSource, /--am-color-text:#E8ECEF;/); |
| tests/test_design_tokens.cjs | 100 | assert.match(tokensSource, /--am-color-success:#3AD6C2;/); |
| tests/test_design_tokens.cjs | 101 | assert.match(tokensSource, /--am-background-image:radial-gradient\(/); |
| tests/test_design_tokens.cjs | 103 | assert.match(tokensSource, /--am-color-neutral:#405548;/); |
| tests/test_design_tokens.cjs | 104 | assert.match(tokensSource, /--am-color-native-surface:#FFFFFF;/); |
| tests/test_design_tokens.cjs | 105 | assert.match(tokensSource, /--am-color-native-selected-bg:#E4F2E8;/); |
| tests/test_design_tokens.cjs | 106 | assert.match(tokensSource, /--am-color-native-disabled-text:#526056;/); |
| tests/test_design_tokens.cjs | 108 | assert.match(tokensSource, /--am-bg:var\(--am-color-bg\);/); |
| tests/test_design_tokens.cjs | 109 | assert.match(tokensSource, /--am-primary:var\(--am-color-primary\);/); |
| tests/test_design_tokens.cjs | 110 | assert.match(tokensSource, /--ui-accent:var\(--am-color-primary\);/); |
| tests/test_design_tokens.cjs | 111 | assert.match(tokensSource, /--ui-neutral:var\(--am-color-neutral\);/); |
| tests/test_design_tokens.cjs | 112 | assert.match(tokensSource, /--ui-surface-light:var\(--am-color-native-surface\);/); |
| tests/test_design_tokens.cjs | 113 | assert.match(tokensSource, /--bg:var\(--am-color-bg\);/); |
| tests/test_design_tokens.cjs | 114 | assert.match(tokensSource, /--font-mono:var\(--am-font-mono\);/); |
| tests/test_design_tokens.cjs | 116 | assert.match(tokensSource, /--am-radius-sm:8px;/); |
| tests/test_design_tokens.cjs | 117 | assert.match(tokensSource, /--am-space-4:16px;/); |
| tests/test_design_tokens.cjs | 118 | assert.match(tokensSource, /--am-focus-width:2px;/); |
| tests/test_design_tokens.cjs | 119 | assert.match(tokensSource, /--am-transition-standard:180ms ease;/); |
| tests/test_design_tokens.cjs | 122 | test("Tangerine entrypoint and compat layers are not token sources", () => { |
| tests/test_design_tokens.cjs | 128 | assert.doesNotMatch(source, /--[a-z0-9-]+\s*:/i, `${name} must consume foundation tokens`); |
| tests/test_design_tokens.cjs | 142 | test("migrated CSS consumers use canonical tokens directly", () => { |
| tests/test_design_tokens.cjs | 144 | assert.match(source, /var\(--am-(?:color\|font\|shadow)-/i, `${name} should use canonical design tokens`); |
| tests/test_f6201b_dhcp_module.py | 52 | if k != "_sessionTOKEN"} |
| tests/test_f6201b_dhcp_module.py | 75 | self.ont.session_tmp_token = "synthetic-dhcp-token" |
| tests/test_f6201b_dhcp_module.py | 78 | value, self.ont.session_tmp_token, |
| tests/test_f6201b_dhcp_module.py | 79 | self.ont.session_tmp_token[::-1], |
| tests/test_api_error_policy.py | 30 | side_effect=AuthenticationFailure("token:DO_NOT_DISCLOSE")): |
| tests/test_api_error_policy.py | 64 | side_effect=PermissionError("secret auth token")): |
| tests/test_api_error_policy.py | 86 | error = HTTPError("GET /hidden?token=DO_NOT_DISCLOSE") |
| tests/test_api_error_policy.py | 95 | PartialOperation("POST /secret token", completed=2, total=4) |
| tests/test_huawei_phase0_architecture.py | 12 | RandCountAuth, |
| tests/test_huawei_phase0_architecture.py | 28 | clean_huawei_token, |
| tests/test_huawei_phase0_architecture.py | 29 | plausible_huawei_token, |
| tests/test_huawei_phase0_architecture.py | 102 | def test_randcount_hex64_and_bom_are_accepted(self): |
| tests/test_huawei_phase0_architecture.py | 103 | plain = fixture("randcount_hex64.txt") |
| tests/test_huawei_phase0_architecture.py | 104 | bom = fixture("randcount_bom.txt") |
| tests/test_huawei_phase0_architecture.py | 106 | self.assertEqual(len(clean_huawei_token(plain)), 64) |
| tests/test_huawei_phase0_architecture.py | 107 | self.assertEqual(len(clean_huawei_token(bom)), 64) |
| tests/test_huawei_phase0_architecture.py | 108 | self.assertTrue(plausible_huawei_token(plain)) |
| tests/test_huawei_phase0_architecture.py | 109 | self.assertTrue(plausible_huawei_token(bom)) |
| tests/test_huawei_phase0_architecture.py | 111 | RandCountAuth.normalize_challenge(bom), |
| tests/test_huawei_phase0_architecture.py | 112 | clean_huawei_token(plain), |
| tests/test_huawei_phase0_architecture.py | 115 | def test_randcount_invalid_html_is_rejected(self): |
| tests/test_huawei_phase0_architecture.py | 117 | RandCountAuth.normalize_challenge( |
| tests/test_huawei_phase0_architecture.py | 118 | "<html><form action='login.cgi'></form></html>" |
| tests/test_huawei_phase0_architecture.py | 121 | def test_randcount_payload_is_pure_base64_and_preserves_challenge(self): |
| tests/test_huawei_phase0_architecture.py | 122 | payload = RandCountAuth.build_payload( |
| tests/test_huawei_phase0_architecture.py | 133 | self.assertEqual(payload["x.X_HW_Token"], "A" * 64) |
| tests/test_huawei_phase0_architecture.py | 200 | def test_api_sestoken_xml_json_fixtures_are_detection_evidence_only(self): |
| tests/test_huawei_phase0_architecture.py | 201 | for name in ("sestokeninfo.xml", "sestokeninfo.json"): |
| tests/test_huawei_phase0_architecture.py | 206 | self.assertEqual(family, HuaweiProtocolFamily.API_SESTOKEN) |
| tests/test_huawei_phase0_architecture.py | 207 | self.assertEqual(evidence, ("api-sestoken-marker",)) |
| tests/test_huawei_phase0_architecture.py | 209 | def test_api_sestoken_is_protocol_family_not_model_guess(self): |
| tests/test_huawei_phase0_architecture.py | 211 | "/api/webserver/SesTokenInfo", "/api/system/deviceinfo", |
| tests/test_huawei_phase0_architecture.py | 213 | self.assertEqual(family, HuaweiProtocolFamily.API_SESTOKEN) |
| tests/test_huawei_phase0_architecture.py | 214 | self.assertIn("/api/webserver/SesTokenInfo", evidence) |
| tests/test_f6600p_light_popups.cjs | 30 | console.log("Light mode dropdowns + legacy cards have explicit contrast; dark tokens retained."); |
| tests/test_f6201b_second_capture.py | 33 | self.session_tmp_token="synthetic token" |
| tests/test_f6201b_second_capture.py | 59 | ("encode","_sessionTOKEN")) |
| tests/test_f6201b_second_capture.py | 118 | tuple(key for key,_ in fields)+("_sessionTOKEN",), |
| tests/test_api_error_sanitization.py | 37 | raise FakeFirmwareError("<xml>ONT PASSWORD:PRIVATE_TOKEN</xml>") |
| tests/test_api_error_sanitization.py | 40 | self.assertNotIn("PRIVATE_TOKEN", str(result) + str(logged.output)) |
| tests/test_css_architecture.py | 12 | TOKENS = CSS_ROOT / "foundation" / "tangerine_tokens.css" |
| tests/test_css_architecture.py | 38 | "./foundation/tangerine_tokens.css", |
| tests/test_css_architecture.py | 46 | "./foundation/tangerine_tokens.css", |
| tests/test_css_architecture.py | 61 | "./foundation/tangerine_tokens.css", |
| tests/test_css_architecture.py | 210 | if imported != "./foundation/tangerine_tokens.css" |
| tests/test_css_architecture.py | 227 | if imported == "./foundation/tangerine_tokens.css": |
| tests/test_css_architecture.py | 234 | def test_tangerine_compat_layers_are_not_token_sources(self): |
| tests/test_css_architecture.py | 240 | f"compatibility layer {relative} must consume foundation tokens, not define them", |
| tests/test_css_architecture.py | 246 | def test_canonical_token_definitions_have_one_source_of_truth(self): |
| tests/test_css_architecture.py | 253 | self.assertGreaterEqual(len(definitions), 30, "expected the canonical token vocabulary") |
| tests/test_css_architecture.py | 255 | with self.subTest(token=name): |
| tests/test_css_architecture.py | 258 | {"foundation/tangerine_tokens.css"}, |
| tests/test_css_architecture.py | 259 | f"canonical token {name} is defined outside the foundation", |
| tests/test_tangerine_ui.cjs | 33 | test("Tangerine tokens include both Figma palettes and reduced-motion support", () => { |
| tests/test_tangerine_ui.cjs | 39 | // Collapse geometry moved into its own component; paint stays in tokens. |
| tests/test_diagnostic_session_restore.py | 29 | for term in ("password", "token", "session_token"): |
| tests/test_f6201b_full_forms.py | 36 | self.session_tmp_token = "synthetic-token" |
| tests/test_f6201b_full_forms.py | 44 | if field in {"IF_ACTION", "_sessionTOKEN"} or field.startswith("Btn_"): |
| tests/test_f6201b_full_forms.py | 67 | self.current[field], self.session_tmp_token, |
| tests/test_f6201b_full_forms.py | 68 | self.session_tmp_token[::-1], |
| tests/test_f6201b_full_forms.py | 144 | if key != "_sessionTOKEN"], |
| tests/test_f6201b_full_forms.py | 256 | if name != "_sessionTOKEN"], |
| tests/test_huawei_response_protocol.py | 15 | TOKEN = "f" * 64 |
| tests/test_huawei_response_protocol.py | 33 | def extract_token(source): |
| tests/test_huawei_response_protocol.py | 34 | if TOKEN not in source: |
| tests/test_huawei_response_protocol.py | 35 | raise RuntimeError("token missing") |
| tests/test_huawei_response_protocol.py | 36 | return TOKEN |
| tests/test_huawei_response_protocol.py | 43 | f'<input id="hwonttoken" value="{TOKEN}">' |
| tests/test_huawei_response_protocol.py | 187 | def test_mapped_write_derives_token_page_from_requestfile(self): |
| tests/test_huawei_response_protocol.py | 207 | self.assertEqual(payload["x.X_HW_Token"], TOKEN) |
| tests/test_huawei_provider_architecture.py | 67 | '<input type="hidden" id="hwonttoken" ' |
| tests/test_huawei_provider_architecture.py | 68 | 'value="fixture-token-1234567890">' |
| tests/test_brmodelo_workbench.cjs | 9 | for (const token of [ |
| tests/test_brmodelo_workbench.cjs | 12 | ]) assert.ok(css.includes(token+":"),"Missing CSS theme token: "+token); |
| tests/test_f6600p_dhcp_encoded.py | 21 | session_tmp_token = "test-only-session-tmp-token" |
| tests/test_f6600p_dhcp_encoded.py | 22 | def __init__(self, *, declared=True, with_token=True): |
| tests/test_f6600p_dhcp_encoded.py | 29 | if not with_token: |
| tests/test_f6600p_dhcp_encoded.py | 30 | self.session_tmp_token = None |
| tests/test_f6600p_dhcp_encoded.py | 47 | row[field], "test-only-session-tmp-token", |
| tests/test_f6600p_dhcp_encoded.py | 48 | "test-only-session-tmp-token"[::-1], |
| tests/test_f6600p_dhcp_encoded.py | 95 | def test_missing_session_token_must_not_show_ciphertext_or_post(self): |
| tests/test_f6600p_dhcp_encoded.py | 96 | router = FakeRouter(with_token=False) |
| tests/test_f6600p_dhcp_encoded.py | 102 | self.assertNotIn("test-only-session-tmp-token", str(status)) |
| tests/test_phase2_integration.py | 100 | "password": "DONOTSTORE", "token": "PRIVATE", |
| tests/test_phase2_integration.py | 285 | side_effect=sqlite3.OperationalError("token=DO_NOT_LOG"), |
| tests/test_f6201b_profile.py | 107 | tuple(k for k, _ in payload) + ("_sessionTOKEN",), |
| tests/test_f6201b_profile.py | 221 | self.zte.session_tmp_token = "session-test" |
| tests/test_f6201b_profile.py | 234 | self.assertEqual(dict(fields)["_sessionTOKEN"], "session-test") |
| tests/test_verified_audit.py | 75 | raise RuntimeError("password=hunter2 token=raw") |
| tests/test_verified_audit.py | 206 | before={"nested": {"session_token": "SHOULD_NOT_PERSIST"}}, |
| tests/test_verified_audit.py | 214 | row["before_json"]["nested"]["session_token"], "[REDACTED]" |
| apps/zte_manager/services/huawei_ipv4_filter_service.py | 133 | token: str, |
| apps/zte_manager/services/huawei_ipv4_filter_service.py | 135 | return _build_mutation_payload(rule, token) |
| apps/zte_manager/services/huawei_ipv4_filter_service.py | 140 | token: str, |
| apps/zte_manager/services/huawei_ipv4_filter_service.py | 142 | return _build_mutation_payload(rule, token) |
| apps/zte_manager/services/huawei_ipv4_filter_service.py | 147 | token: str, |
| apps/zte_manager/services/huawei_ipv4_filter_service.py | 153 | "x.X_HW_Token": token, |
| apps/zte_manager/services/huawei_ipv4_filter_service.py | 159 | token: str, |
| apps/zte_manager/services/huawei_ipv4_filter_service.py | 173 | "x.X_HW_Token": token, |
| apps/zte_manager/services/huawei_ipv4_filter_service.py | 257 | token = self.client.extract_token( |
| apps/zte_manager/services/huawei_ipv4_filter_service.py | 271 | token, |
| apps/zte_manager/services/huawei_ipv4_filter_service.py | 310 | token = self.client.extract_token( |
| apps/zte_manager/services/huawei_ipv4_filter_service.py | 324 | token, |
| apps/zte_manager/services/huawei_ipv4_filter_service.py | 370 | token = self.client.extract_token( |
| apps/zte_manager/services/huawei_ipv4_filter_service.py | 383 | token, |
| apps/zte_manager/services/zte_service.py | 393 | # operator authorization cannot create missing protocol code. |
| apps/zte_manager/services/zte_service.py | 634 | for word in ("pass", "secret", "token", "key")) |
| apps/zte_manager/services/zte_service.py | 679 | # Não retornamos token nem chave pública completa. A rota existe |
| apps/zte_manager/services/zte_service.py | 683 | "session_tmp_token": bool( |
| apps/zte_manager/services/zte_service.py | 684 | zte.session_tmp_token |
| apps/zte_manager/services/zte_service.py | 1346 | tokens and readback. On firmware/serial drift quarantine the |
| apps/zte_manager/services/f6201b_diagnostics.py | 54 | body = [(key, fields[key]) for key in schema if key != "_sessionTOKEN"] |
| apps/zte_manager/services/f6201b_diagnostics.py | 133 | if set(fields) != set(keys) - {"_sessionTOKEN"}: |
| apps/zte_manager/services/speed_test_service.py | 252 | O FAST.com não usa /__down e /__up. O adapter obtém o token da página |
| apps/zte_manager/services/speed_test_service.py | 292 | def _token(self, session: requests.Session) -> str: |
| apps/zte_manager/services/speed_test_service.py | 322 | token_match = re.search( |
| apps/zte_manager/services/speed_test_service.py | 323 | r'token\s*:\s*["\']([A-Za-z0-9]+)["\']', |
| apps/zte_manager/services/speed_test_service.py | 327 | if not token_match: |
| apps/zte_manager/services/speed_test_service.py | 329 | "FAST.com: token da API não foi encontrado no bundle atual." |
| apps/zte_manager/services/speed_test_service.py | 332 | return token_match.group(1) |
| apps/zte_manager/services/speed_test_service.py | 337 | token: str, |
| apps/zte_manager/services/speed_test_service.py | 343 | "token": token, |
| apps/zte_manager/services/speed_test_service.py | 497 | token = self._token( |
| apps/zte_manager/services/speed_test_service.py | 503 | token, |
| apps/zte_manager/services/speed_test_service.py | 508 | token, |
| apps/zte_manager/services/error_policy.py | 109 | r"(?:https?://\|/api/\|\\\|<\|>\|\{\|\}\|=\|\b(?:password\|passwd\|token\|" |
| apps/zte_manager/services/error_policy.py | 110 | r"credential\|senha\|secret\|traceback\|post\|put\|get\|delete\|cookie)\b)", |
| apps/zte_manager/services/capability_service.py | 15 | # URL/ACS fields frequently carry embedded session tokens or private endpoints. |
| apps/zte_manager/services/capability_service.py | 19 | "token", "cookie", "authorization", "username", "userid", |
| apps/zte_manager/services/capability_service.py | 24 | r"https?://\|(?:password\|passwd\|secret\|token\|cookie\|authorization\|" |
| apps/zte_manager/services/capability_service.py | 149 | # Retornar o TIPO, jamais HTML, parâmetros ou tokens |
| apps/zte_manager/services/capability_service.py | 194 | "_sessionTOKEN", |
| apps/zte_manager/services/f6201b_full_forms.py | 32 | NON_VALUES = {"IF_ACTION", "_sessionTOKEN", "encode"} |
| apps/zte_manager/services/f6201b_full_forms.py | 459 | # Without decrypting with the GET view's token the UI would display |
| apps/zte_manager/services/f6201b_full_forms.py | 467 | token = getattr(zte, "session_tmp_token", None) |
| apps/zte_manager/services/f6201b_full_forms.py | 468 | if not token: |
| apps/zte_manager/services/f6201b_full_forms.py | 469 | raise RuntimeError("O menu DHCP não forneceu token AES.") |
| apps/zte_manager/services/f6201b_full_forms.py | 477 | raw_value, token, token[::-1] |
| apps/zte_manager/services/f6201b_full_forms.py | 507 | token = getattr(zte, "session_tmp_token", None) |
| apps/zte_manager/services/f6201b_full_forms.py | 508 | if set(encoded) & {"UserName", "Password"} and not token: |
| apps/zte_manager/services/f6201b_full_forms.py | 509 | raise RuntimeError("WAN criptografada sem token de leitura.") |
| apps/zte_manager/services/f6201b_full_forms.py | 513 | fields[name], token, token[::-1] |
| apps/zte_manager/services/f6201b_full_forms.py | 529 | if key not in {"_sessionTOKEN"} |
| apps/zte_manager/services/f6201b_full_forms.py | 556 | for name in OBSERVED_APPLY_FIELDS[tag] if name != "_sessionTOKEN"] |
| apps/zte_manager/services/f6201b_full_forms.py | 678 | # Prove that all 25 captured keys (except server-supplied token) can |
| apps/zte_manager/services/f6201b_full_forms.py | 740 | nonce = secrets.token_urlsafe(24) |
| apps/zte_manager/services/attendance_report_service.py | 698 | "token", "credential", "username", "private", |
| apps/zte_manager/services/f6201b_workbench.py | 9 | Never import the raw capture. No stored token, credential or captured value. |
| apps/zte_manager/services/f6201b_workbench.py | 195 | if field == "_sessionTOKEN": |
| apps/zte_manager/services/f6201b_workbench.py | 196 | continue  # post_menu appends session token itself, last. |
| apps/zte_manager/services/f6201b_workbench.py | 303 | nonce = secrets.token_urlsafe(24) |
| apps/zte_manager/services/f6201b_dhcp.py | 42 | token = getattr(zte, "session_tmp_token", None) |
| apps/zte_manager/services/f6201b_dhcp.py | 43 | if not token: |
| apps/zte_manager/services/f6201b_dhcp.py | 44 | raise RuntimeError("O formulário DHCP não retornou token AES.") |
| apps/zte_manager/services/f6201b_dhcp.py | 52 | value, token, token[::-1] |
| apps/zte_manager/services/multimodel_service.py | 138 | r"(password\|passwd\|secret\|token\|credential\|key\|serial\|mac\|ssid\|" |
| apps/zte_manager/services/multimodel_service.py | 359 | # Apenas categorias saneadas, nenhum HTML/token/credencial em UI. |
| apps/zte_manager/services/f6201b_writes.py | 71 | "menuView e token temporário reais", |
| apps/zte_manager/services/f6201b_writes.py | 119 | # retornar os objetos PSK, cookies ou quaisquer credenciais. |
| apps/zte_manager/services/f6201b_writes.py | 158 | if not getattr(zte, "session_tmp_token", None): |
| apps/zte_manager/services/f6201b_writes.py | 159 | raise RuntimeError("Não foi encontrado token temporário do menu.") |
| apps/zte_manager/services/f6201b_writes.py | 201 | token = getattr(zte, "session_tmp_token", None) |
| apps/zte_manager/services/f6201b_writes.py | 202 | if not token: |
| apps/zte_manager/services/f6201b_writes.py | 203 | raise RuntimeError("Token de descriptografia não encontrado.") |
| apps/zte_manager/services/f6201b_writes.py | 206 | psk["KeyPassphrase"], token, token[::-1] |
| apps/zte_manager/services/f6201b_writes.py | 256 | nonce = secrets.token_urlsafe(24) |
| apps/zte_manager/services/huawei_eg8145v5_family_runtime.py | 231 | """Read-only Phase-2 adapter sharing the existing RandCount session. |
| apps/zte_manager/services/huawei_eg8145v5_family_runtime.py | 236 | owner of transport, cookies and reauthentication. |
| apps/zte_manager/services/f6201b_evidence.py | 4 | Never store or commit the raw capture: it contains credentials, tokens, |
| apps/zte_manager/services/f6201b_evidence.py | 81 | # post_menu appends _sessionTOKEN last and computes Check from the final body. |
| apps/zte_manager/services/f6201b_evidence.py | 93 | "encode", "_sessionTOKEN", |
| apps/zte_manager/services/f6201b_evidence.py | 105 | "_sessionTOKEN", |
| apps/zte_manager/services/f6201b_evidence.py | 110 | "Btn_cancel_Mode", "Btn_apply_Mode", "_sessionTOKEN", |
| apps/zte_manager/services/f6201b_evidence.py | 114 | "WPSMode", "WPSChoose", "Btn_apply_WPS", "_sessionTOKEN", |
| apps/zte_manager/services/f6201b_evidence.py | 122 | "_sessionTOKEN", |
| apps/zte_manager/services/f6201b_evidence.py | 138 | "Btn_apply_internet", "encode", "_sessionTOKEN", |
| apps/zte_manager/services/f6201b_evidence.py | 142 | "TTL", "_sessionTOKEN", |
| apps/zte_manager/services/f6201b_evidence.py | 146 | "Btn_cancel_FirewallConf", "Btn_apply_FirewallConf", "_sessionTOKEN", |
| apps/zte_manager/services/f6201b_evidence.py | 200 | "_sessionTOKEN", |
| apps/zte_manager/services/f6201b_evidence.py | 204 | # tokens, passwords or endpoint addresses are recorded. |
| apps/zte_manager/services/f6201b_evidence.py | 206 | dns_hostname_lua.lua\|IF_ACTION _InstID OBJID LeaseTime HostName IPAddress _sessionTOKEN |
| apps/zte_manager/services/f6201b_evidence.py | 207 | bpdu_lua.lua\|IF_ACTION _InstID BPDUEnable Btn_cancel_instCfgArea Btn_apply_instCfgArea _sessionTOKEN |
| apps/zte_manager/services/f6201b_evidence.py | 208 | route_routedefault_lua.lua\|IF_ACTION _InstID DefRTInterface Btn_cancel_RouteDefault Btn_apply_RouteDefault _sessionTOKEN |
| apps/zte_manager/services/f6201b_evidence.py | 209 | route_routestaticipv4_lua.lua\|IF_ACTION _InstID DestIP DestIPMask GWIP Type Enable Alias Interface _sessionTOKEN |
| apps/zte_manager/services/f6201b_evidence.py | 210 | Localnet_LanMgrIpv4_DHCPBasicCfg_lua.lua\|IF_ACTION IF_URL_HOST _InstID IPAddr SubMask OptEnable OptCode SubnetMask MinAddress MaxAddress IPRouters DNSServer1 DNSServer2 LeaseTime ServerEnable DnsServerSource OptValue DomainName Btn_cancel_DHCPBasicCfg Btn_apply_DHCPBasicCfg encode _sessionTOKEN |
| apps/zte_manager/services/f6201b_evidence.py | 211 | Localnet_LanDevDHCPSource_lua.lua\|IF_ACTION _InstNum _InstID_0 ProcFlag_0 _InstID_1 ProcFlag_1 _InstID_2 ProcFlag_2 _InstID_3 ProcFlag_3 _InstID_4 ProcFlag_4 _InstID_5 ProcFlag_5 _InstID_6 ProcFlag_6 _InstID_7 ProcFlag_7 _InstID_8 ProcFlag_8 _InstID_9 ProcFlag_9 _InstID_10 ProcFlag_10 _InstID_11 ProcFlag_11 _InstID Btn |
| apps/zte_manager/services/f6201b_evidence.py | 212 | addr6_lanaddr_lua.lua\|IF_ACTION _InstID IPAddress Btn_cancel_IPv6LANAddr Btn_apply_IPv6LANAddr _sessionTOKEN |
| apps/zte_manager/services/f6201b_evidence.py | 213 | dhcp6s_dhcpserver_lua.lua\|IF_ACTION _InstID _InstID_DNS IANAEnable IsPrefixAutoMode Enable ManualDNSEnable DNSAddr1 DNSAddr2 DNSAddr3 Ipv6DnsOrigin DnsRefreshTime Btn_cancel_IPv6DHCPServer Btn_apply_IPv6DHCPServer Btn_PrefixUpd_IPv6DHCPServer Btn_SelfUpd_IPv6DHCPServer _sessionTOKEN |
| apps/zte_manager/services/f6201b_evidence.py | 214 | ra_raservice_lua.lua\|IF_ACTION _InstID IsPrefixAutoMode Enable AdvLinkMTUEnable S_AdvLinkMTU AdvPreferredRouterFlag MinRtrAdvInterval MaxRtrAdvInterval AdvManagedFlag AdvOtherConfigFlag PrefixMode Btn_cancel_RAService Btn_apply_RAService Btn_PrefixUpd_RAService Btn_SelfUpd_RAService _sessionTOKEN |
| apps/zte_manager/services/f6201b_evidence.py | 215 | radhcp6s_portctrl_lua.lua\|IF_ACTION _InstNum _InstID_0 PortID_0 AllowDHCP6S_0 AllowRA_0 _InstID_1 PortID_1 AllowDHCP6S_1 AllowRA_1 _InstID_2 PortID_2 AllowDHCP6S_2 AllowRA_2 _InstID_3 PortID_3 AllowDHCP6S_3 AllowRA_3 _InstID_4 PortID_4 AllowDHCP6S_4 AllowRA_4 _InstID_5 PortID_5 AllowDHCP6S_5 AllowRA_5 _InstID_6 PortID_ |
| apps/zte_manager/services/f6201b_evidence.py | 216 | eth_interface_config_lua.lua\|IF_ACTION _InstID Autoneg MaxBitRate DuplexMode ModType Btn_cancel_lanInterface Btn_apply_lanInterface _sessionTOKEN |
| apps/zte_manager/services/f6201b_evidence.py | 217 | wlan_wlanbasiconoff_lua.lua\|IF_ACTION RadioStatus TimerEnable _InstID_0 Band_0 RadioStatus_0 _InstID_1 Band_1 RadioStatus_1 _InstID Band TimeStartHour TimeStartMin TimeEndHour TimeEndMin Btn_cancel_WlanBasicAdConf Btn_apply_WlanBasicAdConf _sessionTOKEN |
| apps/zte_manager/services/f6201b_evidence.py | 218 | wlan_macfilteraclpolicy_lua.lua\|IF_ACTION _InstNum _InstID_0 ACLPolicy_0 _InstID_1 ACLPolicy_1 _InstID_2 ACLPolicy_2 _InstID_3 ACLPolicy_3 _InstID_4 ACLPolicy_4 _InstID_5 ACLPolicy_5 _InstID_6 ACLPolicy_6 _InstID_7 ACLPolicy_7 _InstID Btn_cancel_MACFilterACLPolicy Btn_apply_MACFilterACLPolicy _sessionTOKEN |
| apps/zte_manager/services/f6201b_evidence.py | 219 | Localnet_NetSphere_Mode_lua.lua\|IF_ACTION _InstID CurrentMode CurrentEnable Enable EnLegacyStaRoam RoamRssiLmt24G RoamRssiLmt5G Btn_cancel_Mode Btn_apply_Mode Btn_apply_Mode_Confirm _sessionTOKEN |
| apps/zte_manager/services/f6201b_evidence.py | 220 | tr069_remotemgr_lua.lua\|IF_ACTION CertList DefaultWan URL UserName UserPassword ConnectionRequestUsername ConnectionRequestPassword PeriodicInformEnable PeriodicInformInterval SupportCertAuth select_CertID RemoteUpgradeCertAuth Btn_cancel_TR069BasicConf Btn_apply_TR069BasicConf encode _sessionTOKEN |
| apps/zte_manager/services/f6201b_evidence.py | 221 | firewall_alg_lua.lua\|IF_ACTION _InstID IsFTPAlg IsH323Alg IsIPSECAlg IsL2TPAlg IsPPTPAlg IsRTSPAlg IsSIPAlg IsTFTPAlg Btn_cancel_Alg Btn_apply_Alg _sessionTOKEN |
| apps/zte_manager/services/f6201b_evidence.py | 222 | firewall_dmz_lua.lua\|IF_ACTION _InstID Enable WANCViewName InternalClient sub_TempMacAddr0 sub_TempMacAddr1 sub_TempMacAddr2 sub_TempMacAddr3 sub_TempMacAddr4 sub_TempMacAddr5 Btn_cancel_Ipv4Dmz Btn_apply_Ipv4Dmz _sessionTOKEN |
| apps/zte_manager/services/f6201b_evidence.py | 237 | "Btn_PingDiagnosis", "PingAck", "_sessionTOKEN", |
| apps/zte_manager/services/f6201b_evidence.py | 242 | "Btn_TraceRouteDiagnosis", "Result", "_sessionTOKEN", |
| apps/zte_manager/services/f6201b_profile.py | 4 | the exact captured F6201B advanced RF form, with a fresh menuView token |
| apps/zte_manager/services/f6201b_profile.py | 37 | if name not in {"IF_ACTION", "_InstID", "_sessionTOKEN"} |
| apps/zte_manager/services/f6201b_profile.py | 266 | nonce = secrets.token_urlsafe(24) |
| apps/zte_manager/services/f6201b_profile.py | 360 | if name != "_sessionTOKEN"] |
| apps/zte_manager/services/f6201b_profile.py | 361 | # Fresh menuView token immediately before POST. |
| apps/zte_manager/services/f6201b_profile.py | 414 | if key != "_sessionTOKEN"] |
| apps/zte_manager/services/f6201b_profile.py | 446 | if key != "_sessionTOKEN"] |
| apps/zte_manager/services/huawei_affinity_provider.py | 277 | token_page: str \| None = None, |
| apps/zte_manager/services/huawei_affinity_provider.py | 300 | token_page=token_page, |
| apps/zte_manager/services/huawei_affinity_provider.py | 331 | token = ( |
| apps/zte_manager/services/huawei_affinity_provider.py | 332 | client.session.headers.get("__RequestVerificationToken") |
| apps/zte_manager/services/huawei_affinity_provider.py | 333 | or getattr(client, "_session_token", None) |
| apps/zte_manager/services/huawei_affinity_provider.py | 339 | if token: |
| apps/zte_manager/services/huawei_affinity_provider.py | 340 | headers["__RequestVerificationToken"] = str(token) |
| apps/zte_manager/services/huawei_affinity_provider.py | 343 | # accepted despite a lost response/token rotation. |
| apps/zte_manager/services/huawei_affinity_provider.py | 365 | "protocol": "api_sestoken", |
| apps/zte_manager/services/huawei_affinity_provider.py | 380 | token = client.extract_token(source) |
| apps/zte_manager/services/huawei_affinity_provider.py | 393 | {"x.X_HW_Token": token}, |
| apps/zte_manager/services/huawei_affinity_provider.py | 395 | cookie_header=transport.cookie_header(client.session), |
| apps/zte_manager/services/huawei_affinity_provider.py | 404 | "protocol": "legacy_randcount_single_write", |
| apps/zte_manager/services/huawei_affinity_provider.py | 445 | if not name or "token" in name.group(1).casefold(): |
| apps/zte_manager/services/huawei_affinity_provider.py | 453 | token_page=page, |
| apps/zte_manager/services/huawei_affinity_provider.py | 487 | token_page = str(values.get("token_page") or values.get("referer") or "/index.asp") |
| apps/zte_manager/services/huawei_affinity_provider.py | 488 | source = self._client.get_page(token_page) |
| apps/zte_manager/services/huawei_affinity_provider.py | 490 | payload["x.X_HW_Token"] = self._client.extract_token(source) |
| apps/zte_manager/services/huawei_affinity_provider.py | 499 | referer=self._client.url(str(values.get("referer") or token_page)), |
| apps/zte_manager/services/huawei_affinity_provider.py | 500 | cookie_header=transport.cookie_header(self._client.session), |
| apps/zte_manager/services/huawei_affinity_provider.py | 515 | token_page=(str(values["token_page"]) if values.get("token_page") else None), |
| apps/zte_manager/services/huawei_eg8041x7_runtime.py | 36 | "token", |
| apps/zte_manager/services/huawei_eg8041x7_runtime.py | 37 | "cookie", |
| apps/zte_manager/services/huawei_eg8041x7_runtime.py | 38 | "authorization", |
| apps/zte_manager/services/huawei_eg8041x7_runtime.py | 393 | token = self.client.extract_token(page) |
| apps/zte_manager/services/huawei_eg8041x7_runtime.py | 394 | body = {**payload, "x.X_HW_Token": token} |
| apps/zte_manager/services/huawei_service.py | 76 | # session. Never store raw HTML, cookies, credentials or X_HW_Token. |
| apps/zte_manager/services/huawei_service.py | 121 | "cookie", "cookiehttp", "authorization", |
| apps/zte_manager/services/huawei_service.py | 122 | "x_hw_token", "hwonttoken", "onttoken", "token", |
| apps/zte_manager/services/huawei_service.py | 138 | or compact.endswith("token") |
| apps/zte_manager/services/huawei_service.py | 1348 | token_page=( |
| apps/zte_manager/services/huawei_service.py | 1349 | request.get("token_page") |
| apps/zte_manager/services/huawei_service.py | 1882 | token_page=request.get("token_page"), |
| apps/zte_manager/services/huawei_service.py | 2424 | token_page=self._DIAGNOSTICS_PAGE, |
| apps/zte_manager/services/huawei_service.py | 2527 | token_page=self._DIAGNOSTICS_PAGE, |
| apps/zte_manager/services/huawei_service.py | 2600 | token_page=None, |
| apps/zte_manager/services/huawei_service.py | 2608 | token_page=token_page, |
| apps/zte_manager/services/huawei_service.py | 2632 | token_page=None, |
| apps/zte_manager/services/huawei_service.py | 2643 | token_page=token_page, |
| apps/zte_manager/services/huawei_service.py | 2702 | token_page=request.get("token_page") or "/html/bbsp/upnp/upnp.asp", |
| apps/zte_manager/services/remote_access_service.py | 439 | # fazemos quoting estrito de cada token. |
| apps/zte_manager/services/huawei_mapped_surface.py | 167 | "token_page": "/html/bbsp/wan/wan.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 248 | "token_page": "/html/bbsp/remotepktmirror/remotepktmirror.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 341 | "token_page": "/html/ssmp/maintain/smartdiagnose.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 426 | "token_page": "/html/bbsp/portinfo/portisolate.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 437 | "token_page": "/html/bbsp/dscptopbit/dscptopbit.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 447 | "token_page": "/html/ssmp/sntp/sntp.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 457 | "token_page": "/html/ssmp/sntp/sntp.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 468 | "token_page": "/html/bbsp/upnp/upnp.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 478 | "token_page": "/html/bbsp/wlanmacfilter/wlanmacfilter.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 488 | "token_page": "/html/bbsp/lanservicecfg/lanportcfg.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 497 | "token_page": "/html/bbsp/parentalctrl/parentalctrlmac.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 508 | "token_page": "/html/ssmp/Sectionspeed/Sectionspeed.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 521 | "token_page": "/html/ssmp/Sectionspeed/Sectionspeed.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 530 | "token_page": "/html/ssmp/maintain/smartdiagnose.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 541 | "token_page": "/html/ssmp/maintain/smartdiagnose.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 547 | "token_page": "/html/ssmp/maintain/smartdiagnose.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 557 | "token_page": "/html/bbsp/userdevinfo/userdevinfo1.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 572 | "token_page": "/html/bbsp/wan/wan.asp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 708 | "x_hw_token", "hwonttoken", "onttoken", "cookie", "cookiehttp", |
| apps/zte_manager/services/huawei_mapped_surface.py | 709 | "authorization", |
| apps/zte_manager/services/huawei_mapped_surface.py | 779 | compact.endswith("token") |
| apps/zte_manager/services/huawei_mapped_surface.py | 780 | or compact.endswith("cookie") |
| apps/zte_manager/services/huawei_mapped_surface.py | 788 | or compact == "authorization" |
| apps/zte_manager/services/huawei_mapped_surface.py | 797 | or compact.endswith("token") |
| apps/zte_manager/services/huawei_mapped_surface.py | 798 | or compact.endswith("cookie") |
| apps/zte_manager/services/huawei_mapped_surface.py | 799 | or compact == "authorization" |
| apps/zte_manager/services/huawei_mapped_surface.py | 934 | token_page: str \| None = None, |
| apps/zte_manager/services/huawei_mapped_surface.py | 943 | if token_page: |
| apps/zte_manager/services/huawei_mapped_surface.py | 944 | token_source = self.client.get_page( |
| apps/zte_manager/services/huawei_mapped_surface.py | 945 | _relative_path(token_page) |
| apps/zte_manager/services/huawei_mapped_surface.py | 947 | clean_payload["x.X_HW_Token"] = ( |
| apps/zte_manager/services/huawei_mapped_surface.py | 948 | self.client.extract_token(token_source) |
| apps/zte_manager/services/huawei_mapped_surface.py | 992 | token_page=request.get("token_page"), |
| apps/zte_manager/services/huawei_mapped_surface.py | 1016 | token_page: str \| None = None, |
| apps/zte_manager/services/huawei_mapped_surface.py | 1025 | token_path = _relative_path( |
| apps/zte_manager/services/huawei_mapped_surface.py | 1026 | token_page or request_page or referer_path |
| apps/zte_manager/services/huawei_mapped_surface.py | 1028 | token_source = self.client.get_page(token_path) |
| apps/zte_manager/services/huawei_mapped_surface.py | 1029 | token = self.client.extract_token(token_source) |
| apps/zte_manager/services/huawei_mapped_surface.py | 1036 | form["x.X_HW_Token"] = token |
| apps/zte_manager/services/huawei_mapped_surface.py | 1040 | effective_referer = request_page or token_path or referer_path |
| apps/zte_manager/services/huawei_mapped_surface.py | 1161 | token_page=spec["token_page"], |
| apps/zte_manager/services/huawei_captured_features.py | 417 | token = self.client.extract_token(page) |
| apps/zte_manager/services/huawei_captured_features.py | 418 | body = {**payload, "x.X_HW_Token": token} |
| apps/zte_manager/services/huawei_unified_provider.py | 32 | ONTWatch-derived contract. EG8145V5/HN8010TS use one shared RandCount |
| apps/zte_manager/services/huawei_unified_provider.py | 34 | SesTokenInfo /api/ family while preserving legacy RandCount fallback. |
| apps/zte_manager/services/huawei_unified_provider.py | 377 | HuaweiAuthFlow.API_SES_TOKEN, |
| apps/zte_manager/services/huawei_unified_provider.py | 378 | HuaweiAuthFlow.API_SES_TOKEN.value, |
| apps/zte_manager/services/huawei_unified_provider.py | 413 | "protocol_family": "api_sestoken", |
| apps/zte_manager/services/huawei_unified_provider.py | 449 | # API SesToken session is resolved before any AMP/BBSP specialization. |
| apps/zte_manager/services/huawei_hg8347r_runtime.py | 17 | legacy RandCount auth, a page-scoped ``hwonttoken`` and the read-only |
| apps/zte_manager/services/huawei_hg8347r_runtime.py | 32 | _TOKEN_PATTERNS = ( |
| apps/zte_manager/services/huawei_hg8347r_runtime.py | 34 | r"<input\b[^>]*\bid=[\"']hwonttoken[\"'][^>]*\bvalue=[\"']([A-Za-z0-9]{16,128})[\"']", |
| apps/zte_manager/services/huawei_hg8347r_runtime.py | 38 | r"<input\b[^>]*\bvalue=[\"']([A-Za-z0-9]{16,128})[\"'][^>]*\bid=[\"']hwonttoken[\"']", |
| apps/zte_manager/services/huawei_hg8347r_runtime.py | 42 | r"<input\b[^>]*\bname=[\"']onttoken[\"'][^>]*\bvalue=[\"']([A-Za-z0-9]{16,128})[\"']", |
| apps/zte_manager/services/huawei_hg8347r_runtime.py | 71 | def extract_page_token(cls, source: object) -> str: |
| apps/zte_manager/services/huawei_hg8347r_runtime.py | 73 | for pattern in cls._TOKEN_PATTERNS: |
| apps/zte_manager/services/huawei_hg8347r_runtime.py | 77 | raise ValueError("HG8347R hwonttoken não encontrado na página de dispositivos.") |
| apps/zte_manager/services/huawei_hg8347r_runtime.py | 140 | token = self.extract_page_token(page) |
| apps/zte_manager/services/huawei_hg8347r_runtime.py | 142 | payload["x.X_HW_Token"] = token |
| apps/zte_manager/services/huawei_hg8347r_runtime.py | 158 | "page:hwonttoken", |
| apps/zte_manager/services/huawei_cli_telemetry.py | 59 | def _first_token(value: str \| None) -> str \| None: |
| apps/zte_manager/services/huawei_cli_telemetry.py | 69 | link_status=_first_token(values.get("linkstatus")), |
| apps/zte_manager/services/huawei_cli_telemetry.py | 70 | voltage_mv=_number(_first_token(values.get("voltage"))), |
| apps/zte_manager/services/huawei_cli_telemetry.py | 71 | bias_ma=_number(_first_token(values.get("bias"))), |
| apps/zte_manager/services/huawei_cli_telemetry.py | 72 | temperature_c=_number(_first_token(values.get("temperature"))), |
| apps/zte_manager/services/huawei_cli_telemetry.py | 73 | rx_power_dbm=_number(_first_token(values.get("rxpower"))), |
| apps/zte_manager/services/huawei_cli_telemetry.py | 74 | tx_power_dbm=_number(_first_token(values.get("txpower"))), |
| apps/zte_manager/services/huawei_cli_telemetry.py | 75 | rf_rx_power_dbm=_number(_first_token(values.get("rfrxpower"))), |
| apps/zte_manager/services/huawei_cli_telemetry.py | 76 | rf_output_power_dbmv=_number(_first_token(values.get("rfoutputpower"))), |
| apps/zte_manager/services/huawei_cli_telemetry.py | 85 | cpu = _number(_first_token(values.get("cpuused"))) |
| apps/zte_manager/services/huawei_cli_telemetry.py | 86 | memory = _number(_first_token(values.get("memused"))) |
| apps/zte_manager/services/huawei_cli_telemetry.py | 131 | raw = _first_token(values.get(source_name)) |
| apps/zte_manager/services/provisioning_service.py | 54 | Tokens/senhas não são persistidos em management.sqlite3. Use variáveis |
| apps/zte_manager/services/provisioning_service.py | 55 | ZTE_ACS_TOKEN, ZTE_ACS_USER e ZTE_ACS_PASSWORD no ambiente do app. |
| apps/zte_manager/services/provisioning_service.py | 80 | token = os.getenv( |
| apps/zte_manager/services/provisioning_service.py | 81 | "ZTE_ACS_TOKEN" |
| apps/zte_manager/services/provisioning_service.py | 84 | if token: |
| apps/zte_manager/services/provisioning_service.py | 86 | "Authorization" |
| apps/zte_manager/services/provisioning_service.py | 87 | ] = f"Bearer {token}" |
| apps/zte_manager/services/provisioning_service.py | 271 | O token fica em ZTE_USP_TOKEN, nunca no banco local. |
| apps/zte_manager/services/provisioning_service.py | 301 | token = os.getenv( |
| apps/zte_manager/services/provisioning_service.py | 302 | "ZTE_USP_TOKEN" |
| apps/zte_manager/services/provisioning_service.py | 305 | if token: |
| apps/zte_manager/services/provisioning_service.py | 307 | "Authorization" |
| apps/zte_manager/services/provisioning_service.py | 308 | ] = f"Bearer {token}" |
| apps/zte_manager/services/provisioning_service.py | 460 | "acs_token": bool( |
| apps/zte_manager/services/provisioning_service.py | 462 | "ZTE_ACS_TOKEN" |
| apps/zte_manager/services/provisioning_service.py | 470 | "usp_token": bool( |
| apps/zte_manager/services/provisioning_service.py | 472 | "ZTE_USP_TOKEN" |
| apps/zte_manager/services/provisioning_service.py | 495 | "acs_token": bool( |
| apps/zte_manager/services/provisioning_service.py | 497 | "ZTE_ACS_TOKEN" |
| apps/zte_manager/services/provisioning_service.py | 505 | "usp_token": bool( |
| apps/zte_manager/services/provisioning_service.py | 507 | "ZTE_USP_TOKEN" |
| apps/zte_manager/services/huawei_hg8245h_runtime.py | 80 | """Read-only HG8245H runtime for the modern SesTokenInfo /api/ family.""" |
| apps/zte_manager/services/huawei_hg8245h_runtime.py | 139 | auth_ok = auth_flow in {HuaweiAuthFlow.API_SES_TOKEN, HuaweiAuthFlow.API_SES_TOKEN.value} |
| apps/zte_manager/services/huawei_hg8245h_runtime.py | 141 | HuaweiProtocolFamily.API_SESTOKEN, |
| apps/zte_manager/services/huawei_hg8245h_runtime.py | 142 | HuaweiProtocolFamily.API_SESTOKEN.value, |
| apps/zte_manager/services/huawei_hg8245h_runtime.py | 157 | "auth:api_ses_token", |
| apps/zte_manager/services/huawei_hg8245h_runtime.py | 158 | "protocol:api_sestoken", |
| apps/zte_manager/services/huawei_hg8145x6_runtime.py | 84 | if any(token in folded for token in ("2.4", "2g", "2 ghz")): |
| apps/zte_manager/services/f6201b_dns_writes.py | 110 | nonce = secrets.token_urlsafe(24) |
| apps/zte_manager/services/f6201b_dns_writes.py | 164 | if key != "_sessionTOKEN"] |
| apps/zte_manager/model/zte.py | 36 | mesma requests.Session, cookies e tokens durante todo o atendimento. |
| apps/zte_manager/model/zte.py | 46 | # Token do fluxo de login. |
| apps/zte_manager/model/zte.py | 47 | self.session_token = None |
| apps/zte_manager/model/zte.py | 49 | # Token temporário criado pela menuView. É este token que o firmware |
| apps/zte_manager/model/zte.py | 51 | self.session_tmp_token = None |
| apps/zte_manager/model/zte_configuration/zte_wan_config.py | 64 | token = getattr( |
| apps/zte_manager/model/zte_configuration/zte_wan_config.py | 66 | "session_tmp_token", |
| apps/zte_manager/model/zte_configuration/zte_wan_config.py | 86 | # A interface oficial usa o token temporário como chave e o token |
| apps/zte_manager/model/zte_configuration/zte_wan_config.py | 88 | if token: |
| apps/zte_manager/model/zte_configuration/zte_wan_config.py | 92 | token, |
| apps/zte_manager/model/zte_configuration/zte_wan_config.py | 93 | token[::-1] |
| apps/zte_manager/model/zte_configuration/zte_wan_config.py | 99 | token, |
| apps/zte_manager/model/zte_configuration/zte_wan_config.py | 100 | token[::-1] |
| apps/zte_manager/model/zte_configuration/zte_get_menu.py | 28 | # O mesmo HTML que prepara o contexto da página contém o token temporário |
| apps/zte_manager/model/zte_configuration/zte_get_menu.py | 39 | "tmp_token": bool( |
| apps/zte_manager/model/zte_configuration/zte_get_menu.py | 40 | contexto["session_tmp_token"] |
| apps/zte_manager/model/zte_configuration/zte_device_management.py | 281 | # O token pertence à menuView; reabrimos imediatamente antes do POST. |
| apps/zte_manager/model/zte_configuration/zte_wlan_channel_configuration.py | 160 | 5. post_menu adiciona _sessionTOKEN e calcula Check. |
| apps/zte_manager/model/zte_configuration/zte_management.py | 919 | token = getattr( |
| apps/zte_manager/model/zte_configuration/zte_management.py | 921 | "session_tmp_token", |
| apps/zte_manager/model/zte_configuration/zte_management.py | 933 | token |
| apps/zte_manager/model/zte_configuration/zte_management.py | 943 | token, |
| apps/zte_manager/model/zte_configuration/zte_management.py | 944 | token[::-1], |
| apps/zte_manager/model/zte_configuration/zte_management.py | 1020 | token = getattr( |
| apps/zte_manager/model/zte_configuration/zte_management.py | 1022 | "session_tmp_token", |
| apps/zte_manager/model/zte_configuration/zte_management.py | 1026 | if not token: |
| apps/zte_manager/model/zte_configuration/zte_management.py | 1040 | token, |
| apps/zte_manager/model/zte_configuration/zte_management.py | 1041 | token[::-1], |
| apps/zte_manager/model/zte_configuration/zte_management.py | 1274 | # O XML traz UserName/Password criptografados com sessionTmpToken. |
| apps/zte_manager/model/zte_configuration/zte_management.py | 1837 | "sessToken", |
| apps/zte_manager/model/zte_configuration/zte_management.py | 1838 | zte.session_token or "", |
| apps/zte_manager/model/zte_configuration/zte_management.py | 1873 | "_sessionTOKEN": ( |
| apps/zte_manager/model/zte_configuration/zte_management.py | 1874 | zte.session_token |
| apps/zte_manager/model/zte_configuration/zte_management.py | 1931 | "sessToken", |
| apps/zte_manager/model/zte_configuration/zte_management.py | 1932 | zte.session_token or "", |
| apps/zte_manager/model/zte_configuration/zte_security.py | 27 | -> _sessionTmpToken |
| apps/zte_manager/model/zte_configuration/zte_security.py | 29 | -> POST + _sessionTOKEN |
| apps/zte_manager/model/zte_configuration/zte_security.py | 37 | token = extract_session_tmp_token( |
| apps/zte_manager/model/zte_configuration/zte_security.py | 41 | if token: |
| apps/zte_manager/model/zte_configuration/zte_security.py | 42 | zte.session_tmp_token = token |
| apps/zte_manager/model/zte_configuration/zte_security.py | 59 | token |
| apps/zte_manager/model/zte_configuration/zte_security.py | 70 | "session_tmp_token": getattr( |
| apps/zte_manager/model/zte_configuration/zte_security.py | 72 | "session_tmp_token", |
| apps/zte_manager/model/zte_configuration/zte_security.py | 95 | def extract_session_tmp_token(html): |
| apps/zte_manager/model/zte_configuration/zte_security.py | 97 | r"_sessionTmpToken\s*=\s*['\"]((?:\\x[0-9a-fA-F]{2})+)['\"]", |
| apps/zte_manager/model/zte_configuration/zte_security.py | 116 | r"_sessionTmpToken\s*=\s*['\"]([^'\"]+)['\"]", |
| apps/zte_manager/model/zte_configuration/zte_security.py | 270 | key = SHA256(_sessionTmpToken) |
| apps/zte_manager/model/zte_configuration/zte_security.py | 271 | iv  = SHA256(reverse(_sessionTmpToken)) |
| apps/zte_manager/model/zte_configuration/zte_network_management.py | 244 | zte, xml: str, basic: dict[str, Any], token: str \| None, |
| apps/zte_manager/model/zte_configuration/zte_network_management.py | 249 | A token-based fallback is accepted only when AES returns valid IPv4. |
| apps/zte_manager/model/zte_configuration/zte_network_management.py | 279 | if token: |
| apps/zte_manager/model/zte_configuration/zte_network_management.py | 281 | raw, token, token[::-1] |
| apps/zte_manager/model/zte_configuration/zte_network_management.py | 313 | # Menus ThinkLua rotate this temporary token on each menuView. |
| apps/zte_manager/model/zte_configuration/zte_network_management.py | 315 | basic_page_token = getattr(zte, "session_tmp_token", None) |
| apps/zte_manager/model/zte_configuration/zte_network_management.py | 348 | zte, basic_xml, basic, basic_page_token |
| apps/zte_manager/model/zte_configuration/zte_network_management.py | 350 | # Internal metadata is boolean/field names only, never key/token/ciphertext. |
| apps/zte_manager/model/zte_configuration/zte_network_management.py | 462 | crypto_key = secrets.token_hex(8) if encrypted_fields else None |
| apps/zte_manager/model/zte_configuration/zte_network_management.py | 463 | crypto_iv = secrets.token_hex(8) if encrypted_fields else None |
| apps/zte_manager/model/zte_configuration/zte_post.py | 20 | - _sessionTOKEN entra por último; |
| apps/zte_manager/model/zte_configuration/zte_post.py | 33 | token = getattr( |
| apps/zte_manager/model/zte_configuration/zte_post.py | 35 | "session_tmp_token", |
| apps/zte_manager/model/zte_configuration/zte_post.py | 39 | if not token: |
| apps/zte_manager/model/zte_configuration/zte_post.py | 41 | "Não encontrei _sessionTmpToken. Abra a menuView antes do POST." |
| apps/zte_manager/model/zte_configuration/zte_post.py | 49 | "_sessionTOKEN", |
| apps/zte_manager/model/zte_configuration/zte_post.py | 50 | token |
| apps/zte_manager/model/zte_configuration/zte_post.py | 129 | "tmp_token": bool(token), |
| apps/zte_manager/model/zte_configuration/zte_wifi.py | 156 | KeyPassphrase é decodificado usando o _sessionTmpToken da mesma menuView. |
| apps/zte_manager/model/zte_configuration/zte_wifi.py | 189 | token = getattr( |
| apps/zte_manager/model/zte_configuration/zte_wifi.py | 191 | "session_tmp_token", |
| apps/zte_manager/model/zte_configuration/zte_wifi.py | 227 | and token |
| apps/zte_manager/model/zte_configuration/zte_wifi.py | 232 | token, |
| apps/zte_manager/model/zte_configuration/zte_wifi.py | 233 | token[::-1] |
| apps/zte_manager/model/zte_configuration/zte_wifi.py | 348 | token = getattr( |
| apps/zte_manager/model/zte_configuration/zte_wifi.py | 350 | "session_tmp_token", |
| apps/zte_manager/model/zte_configuration/zte_wifi.py | 354 | if not token: |
| apps/zte_manager/model/zte_configuration/zte_wifi.py | 356 | "Não encontrei _sessionTmpToken para configurar o SSID." |
| apps/zte_manager/model/zte_configuration/zte_wifi.py | 451 | token, |
| apps/zte_manager/model/zte_configuration/zte_wifi.py | 452 | token[::-1] |
| apps/zte_manager/model/zte_configuration/zte_wifi.py | 520 | token, |
| apps/zte_manager/model/zte_configuration/zte_wifi.py | 521 | token[::-1] |
| apps/zte_manager/model/zte_configuration/zte_wifi.py | 628 | if name != "_sessionTOKEN"] |
| apps/zte_manager/model/zte_configuration/zte_dns.py | 201 | O token temporário pertence à menuView atual. Por isso abrimos a view |
| apps/zte_manager/model/zte_configuration/zte_dns.py | 202 | imediatamente antes do POST; post_menu() acrescenta _sessionTOKEN por |
| apps/zte_manager/model/zte_configuration/zte_backup.py | 35 | "sessToken", |
| apps/zte_manager/model/zte_configuration/zte_backup.py | 36 | zte.session_token or "" |
| apps/zte_manager/model/zte_configuration/zte_backup.py | 53 | "TOKEN_DOWNLOAD": ( |
| apps/zte_manager/model/zte_configuration/zte_backup.py | 54 | zte.session_token or "" |
| apps/zte_manager/model/zte_configuration/zte_backup.py | 68 | # download token expira. Nunca salvar esse HTML como backup válido. |
| apps/zte_manager/model/zte_configuration/zte_mesh.py | 14 | "prefer_cookie_only": True, |
| apps/zte_manager/model/zte_configuration/zte_mesh.py | 112 | Alguns firmwares exigem o token temporário também no GET menuData. |
| apps/zte_manager/model/zte_configuration/zte_mesh.py | 116 | token de uma view conhecida antes de concluir que o backend não existe. |
| apps/zte_manager/model/zte_configuration/zte_mesh.py | 118 | token = getattr( |
| apps/zte_manager/model/zte_configuration/zte_mesh.py | 120 | "session_tmp_token", |
| apps/zte_manager/model/zte_configuration/zte_mesh.py | 124 | if not token: |
| apps/zte_manager/model/zte_configuration/zte_mesh.py | 128 | "_sessionTOKEN": token, |
| apps/zte_manager/model/zte_configuration/zte_mesh.py | 165 | "used_session_token", |
| apps/zte_manager/model/zte_configuration/zte_mesh.py | 170 | "cookie_only", |
| apps/zte_manager/model/zte_configuration/zte_mesh.py | 206 | conhecidas que conseguem renovar o _sessionTmpToken. |
| apps/zte_manager/model/zte_configuration/zte_mesh.py | 240 | token_extras = _menu_extras( |
| apps/zte_manager/model/zte_configuration/zte_mesh.py | 246 | "cookie_only", |
| apps/zte_manager/model/zte_configuration/zte_mesh.py | 251 | if token_extras: |
| apps/zte_manager/model/zte_configuration/zte_mesh.py | 252 | token_attempt = ( |
| apps/zte_manager/model/zte_configuration/zte_mesh.py | 253 | "session_token", |
| apps/zte_manager/model/zte_configuration/zte_mesh.py | 254 | token_extras, |
| apps/zte_manager/model/zte_configuration/zte_mesh.py | 258 | "prefer_cookie_only", |
| apps/zte_manager/model/zte_configuration/zte_mesh.py | 262 | token_attempt |
| apps/zte_manager/model/zte_configuration/zte_mesh.py | 266 | token_attempt, |
| apps/zte_manager/model/zte_configuration/zte_mesh.py | 286 | "used_session_token" |
| apps/zte_manager/model/zte_configuration/zte_session.py | 9 | print("[1] Obtendo session token...") |
| apps/zte_manager/model/zte_configuration/zte_session.py | 23 | zte.session_token = dados.get("sess_token") |
| apps/zte_manager/model/zte_configuration/zte_session.py | 25 | if not zte.session_token: |
| apps/zte_manager/model/zte_configuration/zte_session.py | 26 | print("Não encontrei sess_token.") |
| apps/zte_manager/model/zte_configuration/zte_session.py | 30 | print("Session token recebido.") |
| apps/zte_manager/model/zte_configuration/zte_session.py | 35 | f"&_tag=login_token" |
| apps/zte_manager/model/zte_configuration/zte_session.py | 45 | login_token = (root.text or "").strip() |
| apps/zte_manager/model/zte_configuration/zte_session.py | 47 | print("Não consegui interpretar login_token.") |
| apps/zte_manager/model/zte_configuration/zte_session.py | 51 | if not login_token: |
| apps/zte_manager/model/zte_configuration/zte_session.py | 59 | (zte.password + login_token).encode("utf-8") |
| apps/zte_manager/model/zte_configuration/zte_session.py | 70 | "_sessionTOKEN": zte.session_token, |
| apps/zte_manager/model/zte_configuration/zte_session.py | 84 | novo_token = resultado.get("sess_token") |
| apps/zte_manager/model/zte_configuration/zte_session.py | 85 | if novo_token: |
| apps/zte_manager/model/zte_configuration/zte_session.py | 86 | zte.session_token = novo_token |
| apps/zte_manager/model/zte_configuration/zte_session.py | 120 | "session_tmp_token_found": bool( |
| apps/zte_manager/model/zte_configuration/zte_session.py | 121 | contexto["session_tmp_token"] |
| apps/zte_manager/model/zte_configuration/zte_session.py | 126 | # Jamais registrar token/cookie/credenciais em logs compartilhados. |
| apps/zte_manager/model/zte_configuration/zte_session.py | 132 | "session_token_received": bool(zte.session_token), |
| apps/zte_manager/model/zte_configuration/zte_session.py | 145 | if not zte.session_token: |
| apps/zte_manager/model/zte_configuration/zte_session.py | 155 | "_sessionTOKEN": zte.session_token, |
| apps/zte_manager/model/zte_configuration/zte_support_diagnostics.py | 100 | if zte.session_tmp_token: |
| apps/zte_manager/model/zte_configuration/zte_support_diagnostics.py | 101 | extras["_sessionTOKEN"] = ( |
| apps/zte_manager/model/zte_configuration/zte_support_diagnostics.py | 102 | zte.session_tmp_token |
| apps/zte_manager/model/device_adapters/huawei_registry.py | 93 | "/asp/GetRandCount.asp", |
| apps/zte_manager/model/device_adapters/huawei_registry.py | 149 | observed_auth_strategies=("rand_count", "rand_cookie_hash"), |
| apps/zte_manager/model/device_adapters/huawei_registry.py | 154 | "/asp/GetRandCount.asp", |
| apps/zte_manager/model/device_adapters/huawei_registry.py | 183 | "/asp/GetRandCount.asp", |
| apps/zte_manager/model/device_adapters/huawei_registry.py | 196 | observed_auth_strategies=("rand_string_session_token",), |
| apps/zte_manager/model/device_adapters/huawei_registry.py | 198 | "/html/ssmp/common/getRandString.asp", |
| apps/zte_manager/model/device_adapters/huawei_registry.py | 199 | "/html/ssmp/common/GetRandToken.asp", |
| apps/zte_manager/model/device_adapters/huawei_registry.py | 214 | "/asp/GetRandCount.asp", |
| apps/zte_manager/model/device_adapters/huawei_registry.py | 215 | "/login.cgi", |
| apps/zte_manager/model/device_adapters/huawei_registry.py | 239 | "/asp/GetRandCount.asp", "/login.cgi", "/html/ssmp/", |
| apps/zte_manager/model/device_adapters/huawei_registry.py | 253 | "/asp/GetRandCount.asp", "/login.cgi", |
| apps/zte_manager/model/device_adapters/huawei_registry.py | 271 | probable_protocol_families=("asp_config",), |
| apps/zte_manager/model/device_adapters/huawei_registry.py | 286 | "/asp/GetRandCount.asp", |
| apps/zte_manager/model/device_adapters/huawei_registry.py | 287 | "/login.cgi", |
| apps/zte_manager/presentation/api/huawei_lab.py | 32 | token_page=(str(data.get("token_page")) if data.get("token_page") else None), |
| apps/zte_manager/presentation/api/capabilities.py | 103 | token_page=str(data.get("token_page")) if data.get("token_page") else None, |
| apps/zte_manager/presentation/api/capabilities.py | 127 | token_page=str(data.get("token_page")) if data.get("token_page") else None, |
| apps/zte_manager/application/operations/redaction.py | 7 | _SECRET_TOKENS = ( |
| apps/zte_manager/application/operations/redaction.py | 8 | "password", "passwd", "passphrase", "secret", "token", "credential", |
| apps/zte_manager/application/operations/redaction.py | 9 | "authorization", "cookie", "private_key", "public_key", "keypassphrase", |
| apps/zte_manager/application/operations/redaction.py | 16 | return any(token in label for token in _SECRET_TOKENS) |
| apps/zte_manager/infrastructure/huawei/detector.py | 94 | # API SesToken firmware proves its session with /api/system/deviceinfo |
| apps/zte_manager/infrastructure/huawei/client.py | 15 | RAND_PATH = "/asp/GetRandCount.asp" |
| apps/zte_manager/infrastructure/huawei/client.py | 16 | LOGIN_PATH = "/login.cgi" |
| apps/zte_manager/infrastructure/huawei/client.py | 27 | "x.x_hw_token", |
| apps/zte_manager/infrastructure/huawei/client.py | 28 | "x_hw_token", |
| apps/zte_manager/infrastructure/huawei/client.py | 29 | "token", |
| apps/zte_manager/infrastructure/huawei/client.py | 30 | "cookie", |
| apps/zte_manager/infrastructure/huawei/client.py | 31 | "authorization", |
| apps/zte_manager/infrastructure/huawei/client.py | 32 | "set-cookie", |
| apps/zte_manager/infrastructure/huawei/client.py | 42 | # they never disable secret redaction. Credentials/tokens/PSKs must not be |
| apps/zte_manager/infrastructure/huawei/client.py | 55 | or normalized.endswith("token") |
| apps/zte_manager/infrastructure/huawei/client.py | 58 | or "cookie" in normalized |
| apps/zte_manager/infrastructure/huawei/client.py | 92 | # Huawei configuration/login pages may echo credentials, PSKs, cookies |
| apps/zte_manager/infrastructure/huawei/client.py | 93 | # or X_HW tokens. Never dump response/request bodies to logs. The body |
| apps/zte_manager/infrastructure/huawei/client.py | 149 | Credentials, cookies and X_HW tokens remain inside the HTTP session or |
| apps/zte_manager/infrastructure/huawei/client.py | 248 | "getrandcount.asp", |
| apps/zte_manager/infrastructure/huawei/client.py | 251 | "x_hw_token", |
| apps/zte_manager/infrastructure/huawei/client.py | 296 | "x.X_HW_Token": challenge, |
| apps/zte_manager/infrastructure/huawei/client.py | 303 | "Cookie": "Cookie=body:Language:english:id=-1", |
| apps/zte_manager/infrastructure/huawei/client.py | 353 | self.session.cookies.clear() |
| apps/zte_manager/infrastructure/huawei/client.py | 382 | "login.cgi" in body |
| apps/zte_manager/infrastructure/huawei/client.py | 384 | "getrandcount.asp" in body |
| apps/zte_manager/infrastructure/huawei/client.py | 390 | "login.cgi" in final_url |
| apps/zte_manager/infrastructure/huawei/client.py | 399 | def extract_token(html: str) -> str: |
| apps/zte_manager/infrastructure/huawei/client.py | 401 | r'id\s*=\s*["\']hwonttoken["\'][^>]*value\s*=\s*["\']([^"\']+)', |
| apps/zte_manager/infrastructure/huawei/client.py | 402 | r'value\s*=\s*["\']([^"\']+)["\'][^>]*id\s*=\s*["\']hwonttoken["\']', |
| apps/zte_manager/infrastructure/huawei/client.py | 403 | r'name\s*=\s*["\']onttoken["\'][^>]*value\s*=\s*["\']([^"\']+)', |
| apps/zte_manager/infrastructure/huawei/client.py | 414 | "Token Huawei não encontrado na página atual." |
| apps/zte_manager/infrastructure/huawei/negotiating_client.py | 34 | resolved endpoint metadata. Credentials, challenge values, cookies and |
| apps/zte_manager/infrastructure/huawei/negotiating_client.py | 35 | session tokens are never attached to the exception. |
| apps/zte_manager/infrastructure/huawei/negotiating_client.py | 86 | "getrandcount.asp", |
| apps/zte_manager/infrastructure/huawei/negotiating_client.py | 87 | "getrandstring.asp", |
| apps/zte_manager/infrastructure/huawei/negotiating_client.py | 90 | "x_hw_token", |
| apps/zte_manager/infrastructure/huawei/negotiating_client.py | 120 | """Return a content class without exposing response bodies or tokens.""" |
| apps/zte_manager/infrastructure/huawei/negotiating_client.py | 126 | if "login.cgi" in folded and ( |
| apps/zte_manager/infrastructure/huawei/negotiating_client.py | 129 | or "getrandcount.asp" in folded |
| apps/zte_manager/infrastructure/huawei/negotiating_client.py | 130 | or "getrandstring.asp" in folded |
| apps/zte_manager/infrastructure/huawei/negotiating_client.py | 141 | return "token_like" |
| apps/zte_manager/infrastructure/huawei/negotiating_client.py | 152 | Deliberately logs no request/response body, headers, query string, cookie, |
| apps/zte_manager/infrastructure/huawei/negotiating_client.py | 153 | credential, challenge or token. This remains safe even when operators set |
| apps/zte_manager/infrastructure/huawei/negotiating_client.py | 294 | if path.endswith("/asp/getrandcount.asp"): |
| apps/zte_manager/infrastructure/huawei/negotiating_client.py | 296 | if path.endswith("/html/ssmp/common/getrandstring.asp"): |
| apps/zte_manager/infrastructure/huawei/negotiating_client.py | 298 | if path.endswith("/login.cgi"): |
| apps/zte_manager/infrastructure/huawei/negotiating_client.py | 312 | one fresh requests.Session, root, challenge, login.cgi and authenticated |
| apps/zte_manager/infrastructure/huawei/negotiating_client.py | 331 | # RandCount/login.cgi/proof. The embedded TLS policy therefore belongs |
| apps/zte_manager/infrastructure/huawei/protocol.py | 17 | ASP_CONFIG = "asp_config" |
| apps/zte_manager/infrastructure/huawei/protocol.py | 18 | API_SESTOKEN = "api_sestoken" |
| apps/zte_manager/infrastructure/huawei/protocol.py | 27 | RAND_STRING_SESSION_TOKEN = "rand_string_session_token" |
| apps/zte_manager/infrastructure/huawei/protocol.py | 28 | API_SES_TOKEN = "api_ses_token" |
| apps/zte_manager/infrastructure/huawei/protocol.py | 29 | RAND_COOKIE_HASH = "rand_cookie_hash" |
| apps/zte_manager/infrastructure/huawei/protocol.py | 48 | def clean_huawei_token(value: object) -> str: |
| apps/zte_manager/infrastructure/huawei/protocol.py | 49 | """Normalize Huawei challenge/session tokens without exposing them.""" |
| apps/zte_manager/infrastructure/huawei/protocol.py | 55 | """Extract a challenge while preserving observed Huawei token variance. |
| apps/zte_manager/infrastructure/huawei/protocol.py | 57 | Some RandCount responses are the token itself. Others include a prefix and |
| apps/zte_manager/infrastructure/huawei/protocol.py | 60 | tokens remain untouched. |
| apps/zte_manager/infrastructure/huawei/protocol.py | 63 | token = clean_huawei_token(value) |
| apps/zte_manager/infrastructure/huawei/protocol.py | 64 | match = re.search(r"([0-9A-Fa-f]{32})$", token) |
| apps/zte_manager/infrastructure/huawei/protocol.py | 65 | if match and len(token) > 32: |
| apps/zte_manager/infrastructure/huawei/protocol.py | 67 | return token |
| apps/zte_manager/infrastructure/huawei/protocol.py | 70 | def plausible_huawei_token(value: object) -> bool: |
| apps/zte_manager/infrastructure/huawei/protocol.py | 71 | token = clean_huawei_token(value) |
| apps/zte_manager/infrastructure/huawei/protocol.py | 72 | lower = token.casefold() |
| apps/zte_manager/infrastructure/huawei/protocol.py | 74 | len(token) >= 16 |
| apps/zte_manager/infrastructure/huawei/protocol.py | 77 | and "login.cgi" not in lower |
| apps/zte_manager/infrastructure/huawei/protocol.py | 85 | if "/api/webserver/sestokeninfo" in text or "/api/system/user_login" in text: |
| apps/zte_manager/infrastructure/huawei/protocol.py | 86 | return HuaweiAuthFlow.API_SES_TOKEN |
| apps/zte_manager/infrastructure/huawei/protocol.py | 87 | if "getrandstring.asp" in text: |
| apps/zte_manager/infrastructure/huawei/protocol.py | 88 | return HuaweiAuthFlow.RAND_STRING_SESSION_TOKEN |
| apps/zte_manager/infrastructure/huawei/protocol.py | 90 | if "getrandcount.asp" not in text: |
| apps/zte_manager/infrastructure/huawei/protocol.py | 93 | # Older HG8010H-family pages compute an authentication cookie from the |
| apps/zte_manager/infrastructure/huawei/protocol.py | 95 | # RandCount form. Only explicit cookie semantics are strong enough evidence |
| apps/zte_manager/infrastructure/huawei/protocol.py | 97 | legacy_cookie_markers = ( |
| apps/zte_manager/infrastructure/huawei/protocol.py | 98 | "cookie=username:", |
| apps/zte_manager/infrastructure/huawei/protocol.py | 99 | "cookie=rid=", |
| apps/zte_manager/infrastructure/huawei/protocol.py | 101 | if any(marker in text for marker in legacy_cookie_markers): |
| apps/zte_manager/infrastructure/huawei/protocol.py | 102 | return HuaweiAuthFlow.RAND_COOKIE_HASH |
| apps/zte_manager/infrastructure/huawei/protocol.py | 119 | path.startswith("/api/webserver/sestokeninfo") |
| apps/zte_manager/infrastructure/huawei/protocol.py | 120 | or path.startswith("/api/system/user_login") |
| apps/zte_manager/infrastructure/huawei/protocol.py | 128 | "/api/webserver/sestokeninfo", |
| apps/zte_manager/infrastructure/huawei/protocol.py | 129 | "/api/system/user_login", |
| apps/zte_manager/infrastructure/huawei/protocol.py | 133 | return HuaweiProtocolFamily.API_SESTOKEN, tuple(dict.fromkeys(evidence)) |
| apps/zte_manager/infrastructure/huawei/protocol.py | 145 | return HuaweiProtocolFamily.ASP_CONFIG, tuple(dict.fromkeys(evidence)) |
| apps/zte_manager/infrastructure/huawei/protocol.py | 156 | # the API SesToken family only when both session/token fields are present, |
| apps/zte_manager/infrastructure/huawei/protocol.py | 157 | # matching the read-only SesTokenInfo contract. They never enable login. |
| apps/zte_manager/infrastructure/huawei/protocol.py | 160 | "/api/webserver/sestokeninfo" in joined |
| apps/zte_manager/infrastructure/huawei/protocol.py | 161 | or "/api/system/user_login" in joined |
| apps/zte_manager/infrastructure/huawei/protocol.py | 164 | return HuaweiProtocolFamily.API_SESTOKEN, ("api-sestoken-marker",) |
| apps/zte_manager/infrastructure/huawei/__init__.py | 2 | ApiSesTokenAuth, |
| apps/zte_manager/infrastructure/huawei/__init__.py | 3 | ApiSesTokenContext, |
| apps/zte_manager/infrastructure/huawei/__init__.py | 5 | RandCountAuth, |
| apps/zte_manager/infrastructure/huawei/__init__.py | 6 | RandStringSessionTokenAuth, |
| apps/zte_manager/infrastructure/huawei/__init__.py | 50 | "ApiSesTokenAuth", |
| apps/zte_manager/infrastructure/huawei/__init__.py | 51 | "ApiSesTokenContext", |
| apps/zte_manager/infrastructure/huawei/__init__.py | 81 | "RandCountAuth", |
| apps/zte_manager/infrastructure/huawei/__init__.py | 82 | "RandStringSessionTokenAuth", |
| apps/zte_manager/infrastructure/huawei/cli.py | 105 | if any(token in normalized.casefold() for token in forbidden): |
| apps/zte_manager/infrastructure/huawei/auth.py | 11 | from .protocol import clean_huawei_token, plausible_huawei_token |
| apps/zte_manager/infrastructure/huawei/auth.py | 42 | class RandCountAuth: |
| apps/zte_manager/infrastructure/huawei/auth.py | 43 | """Physically validated Huawei RandCount + Base64 form strategy.""" |
| apps/zte_manager/infrastructure/huawei/auth.py | 52 | challenge = clean_huawei_token(value) |
| apps/zte_manager/infrastructure/huawei/auth.py | 53 | if not plausible_huawei_token(challenge): |
| apps/zte_manager/infrastructure/huawei/auth.py | 54 | raise ValueError("Huawei RandCount challenge is invalid") |
| apps/zte_manager/infrastructure/huawei/auth.py | 73 | "x.X_HW_Token": cls.normalize_challenge(challenge), |
| apps/zte_manager/infrastructure/huawei/auth.py | 93 | class RandStringSessionTokenAuth(RandCountAuth): |
| apps/zte_manager/infrastructure/huawei/auth.py | 94 | """RandString login uses the same Base64 form but a different lifecycle.""" |
| apps/zte_manager/infrastructure/huawei/auth.py | 96 | name = "rand_string_session_token" |
| apps/zte_manager/infrastructure/huawei/auth.py | 100 | class ApiSesTokenContext: |
| apps/zte_manager/infrastructure/huawei/auth.py | 101 | """Sanitized structural result from /api/webserver/SesTokenInfo.""" |
| apps/zte_manager/infrastructure/huawei/auth.py | 104 | token: str |
| apps/zte_manager/infrastructure/huawei/auth.py | 107 | class ApiSesTokenAuth: |
| apps/zte_manager/infrastructure/huawei/auth.py | 108 | """Huawei /api/ SesTokenInfo authentication strategy. |
| apps/zte_manager/infrastructure/huawei/auth.py | 115 | name = "api_ses_token" |
| apps/zte_manager/infrastructure/huawei/auth.py | 117 | MODE_TOKEN_SHA256 = "token_sha256" |
| apps/zte_manager/infrastructure/huawei/auth.py | 118 | MODES = frozenset({MODE_BASE64, MODE_TOKEN_SHA256}) |
| apps/zte_manager/infrastructure/huawei/auth.py | 129 | "token_sha256": cls.MODE_TOKEN_SHA256, |
| apps/zte_manager/infrastructure/huawei/auth.py | 130 | "sha256": cls.MODE_TOKEN_SHA256, |
| apps/zte_manager/infrastructure/huawei/auth.py | 131 | "sha256_token": cls.MODE_TOKEN_SHA256, |
| apps/zte_manager/infrastructure/huawei/auth.py | 132 | "hashed": cls.MODE_TOKEN_SHA256, |
| apps/zte_manager/infrastructure/huawei/auth.py | 145 | nested = ApiSesTokenAuth._json_value(value, name) |
| apps/zte_manager/infrastructure/huawei/auth.py | 151 | def parse_session_token_info(cls, source: object) -> ApiSesTokenContext: |
| apps/zte_manager/infrastructure/huawei/auth.py | 154 | raise ValueError("Huawei SesTokenInfo response is empty") |
| apps/zte_manager/infrastructure/huawei/auth.py | 157 | token = "" |
| apps/zte_manager/infrastructure/huawei/auth.py | 164 | token = cls._json_value(data, "TokInfo") |
| apps/zte_manager/infrastructure/huawei/auth.py | 169 | raise ValueError("Huawei SesTokenInfo is neither JSON nor XML") from exc |
| apps/zte_manager/infrastructure/huawei/auth.py | 176 | token = value |
| apps/zte_manager/infrastructure/huawei/auth.py | 178 | token = clean_huawei_token(token) |
| apps/zte_manager/infrastructure/huawei/auth.py | 180 | if not session_info or not plausible_huawei_token(token): |
| apps/zte_manager/infrastructure/huawei/auth.py | 181 | raise ValueError("Huawei SesTokenInfo lacks a valid session/token pair") |
| apps/zte_manager/infrastructure/huawei/auth.py | 182 | return ApiSesTokenContext(session_info=session_info, token=token) |
| apps/zte_manager/infrastructure/huawei/auth.py | 196 | has_token = any( |
| apps/zte_manager/infrastructure/huawei/auth.py | 200 | "__requestverificationtoken", |
| apps/zte_manager/infrastructure/huawei/auth.py | 201 | "x.x_hw_token", |
| apps/zte_manager/infrastructure/huawei/auth.py | 202 | "x_hw_token", |
| apps/zte_manager/infrastructure/huawei/auth.py | 203 | "sestokeninfo", |
| apps/zte_manager/infrastructure/huawei/auth.py | 206 | if has_base64 and has_sha256 and has_token: |
| apps/zte_manager/infrastructure/huawei/auth.py | 207 | return cls.MODE_TOKEN_SHA256 |
| apps/zte_manager/infrastructure/huawei/auth.py | 217 | def encode_password(cls, password: str, token: str, mode: str) -> str: |
| apps/zte_manager/infrastructure/huawei/auth.py | 225 | (password_b64 + clean_huawei_token(token)).encode("utf-8") |
| apps/zte_manager/infrastructure/huawei/auth.py | 235 | context: ApiSesTokenContext, |
| apps/zte_manager/infrastructure/huawei/auth.py | 243 | "password": cls.encode_password(password, context.token, normalized), |
| apps/zte_manager/infrastructure/huawei/auth.py | 244 | "x.X_HW_Token": context.token, |
| apps/zte_manager/infrastructure/huawei/auth.py | 253 | context: ApiSesTokenContext, |
| apps/zte_manager/infrastructure/huawei/errors.py | 11 | code/public metadata below; no credential, cookie, challenge or session |
| apps/zte_manager/infrastructure/huawei/errors.py | 12 | token is ever attached. |
| apps/zte_manager/infrastructure/huawei/response.py | 64 | if "login.cgi" not in lower: |
| apps/zte_manager/infrastructure/huawei/response.py | 67 | "getrandcount.asp", |
| apps/zte_manager/infrastructure/huawei/family_client.py | 9 | ApiSesTokenAuth, |
| apps/zte_manager/infrastructure/huawei/family_client.py | 10 | ApiSesTokenContext, |
| apps/zte_manager/infrastructure/huawei/family_client.py | 12 | RandCountAuth, |
| apps/zte_manager/infrastructure/huawei/family_client.py | 13 | RandStringSessionTokenAuth, |
| apps/zte_manager/infrastructure/huawei/family_client.py | 27 | clean_huawei_token, |
| apps/zte_manager/infrastructure/huawei/family_client.py | 28 | plausible_huawei_token, |
| apps/zte_manager/infrastructure/huawei/family_client.py | 34 | RAND_STRING_PATH = "/html/ssmp/common/getRandString.asp" |
| apps/zte_manager/infrastructure/huawei/family_client.py | 35 | SESSION_TOKEN_PATH = "/html/ssmp/common/GetRandToken.asp" |
| apps/zte_manager/infrastructure/huawei/family_client.py | 37 | API_SES_TOKEN_PATH = "/api/webserver/SesTokenInfo" |
| apps/zte_manager/infrastructure/huawei/family_client.py | 38 | API_LOGIN_PATH = "/api/system/user_login" |
| apps/zte_manager/infrastructure/huawei/family_client.py | 69 | self._session_token: str \| None = None |
| apps/zte_manager/infrastructure/huawei/family_client.py | 73 | self._rand_count_auth = RandCountAuth(self._credential_budget) |
| apps/zte_manager/infrastructure/huawei/family_client.py | 74 | self._rand_string_auth = RandStringSessionTokenAuth(self._credential_budget) |
| apps/zte_manager/infrastructure/huawei/family_client.py | 75 | self._api_auth = ApiSesTokenAuth(self._credential_budget) |
| apps/zte_manager/infrastructure/huawei/family_client.py | 76 | configured_mode = ApiSesTokenAuth.normalize_mode(api_password_mode) |
| apps/zte_manager/infrastructure/huawei/family_client.py | 81 | self._api_context: ApiSesTokenContext \| None = None |
| apps/zte_manager/infrastructure/huawei/family_client.py | 108 | "getrandcount.asp", |
| apps/zte_manager/infrastructure/huawei/family_client.py | 109 | "getrandstring.asp", |
| apps/zte_manager/infrastructure/huawei/family_client.py | 110 | "sestokeninfo", |
| apps/zte_manager/infrastructure/huawei/family_client.py | 113 | "x_hw_token", |
| apps/zte_manager/infrastructure/huawei/family_client.py | 120 | # SesTokenInfo pair is a stronger vendor/protocol fingerprint and |
| apps/zte_manager/infrastructure/huawei/family_client.py | 123 | base + API_SES_TOKEN_PATH, |
| apps/zte_manager/infrastructure/huawei/family_client.py | 130 | ApiSesTokenAuth.parse_session_token_info(api.text) |
| apps/zte_manager/infrastructure/huawei/family_client.py | 147 | if self.auth_flow is not HuaweiAuthFlow.API_SES_TOKEN: |
| apps/zte_manager/infrastructure/huawei/family_client.py | 181 | if plausible_huawei_token(response.text): |
| apps/zte_manager/infrastructure/huawei/family_client.py | 190 | if plausible_huawei_token(response.text): |
| apps/zte_manager/infrastructure/huawei/family_client.py | 201 | if plausible_huawei_token(response.text): |
| apps/zte_manager/infrastructure/huawei/family_client.py | 205 | def _fetch_api_ses_token(self) -> tuple[object, ApiSesTokenContext \| None]: |
| apps/zte_manager/infrastructure/huawei/family_client.py | 207 | self.url(API_SES_TOKEN_PATH), |
| apps/zte_manager/infrastructure/huawei/family_client.py | 218 | context = self._api_auth.parse_session_token_info(response.text) |
| apps/zte_manager/infrastructure/huawei/family_client.py | 222 | self._record_evidence("auth:api-sestoken") |
| apps/zte_manager/infrastructure/huawei/family_client.py | 223 | self._record_family(API_SES_TOKEN_PATH, sources=(response.text,)) |
| apps/zte_manager/infrastructure/huawei/family_client.py | 245 | "/login.cgi", |
| apps/zte_manager/infrastructure/huawei/family_client.py | 249 | def _refresh_api_token_from_response(self, response) -> None: |
| apps/zte_manager/infrastructure/huawei/family_client.py | 251 | header_token = clean_huawei_token(headers.get("__RequestVerificationToken")) |
| apps/zte_manager/infrastructure/huawei/family_client.py | 252 | if plausible_huawei_token(header_token): |
| apps/zte_manager/infrastructure/huawei/family_client.py | 253 | self._session_token = header_token |
| apps/zte_manager/infrastructure/huawei/family_client.py | 254 | self.session.headers["__RequestVerificationToken"] = header_token |
| apps/zte_manager/infrastructure/huawei/family_client.py | 257 | context = self._api_auth.parse_session_token_info( |
| apps/zte_manager/infrastructure/huawei/family_client.py | 263 | self._session_token = context.token |
| apps/zte_manager/infrastructure/huawei/family_client.py | 264 | self.session.headers["Cookie"] = context.session_info |
| apps/zte_manager/infrastructure/huawei/family_client.py | 265 | self.session.headers["__RequestVerificationToken"] = context.token |
| apps/zte_manager/infrastructure/huawei/family_client.py | 306 | mode = ApiSesTokenAuth.infer_password_mode( |
| apps/zte_manager/infrastructure/huawei/family_client.py | 327 | HuaweiAuthFlow.RAND_STRING_SESSION_TOKEN, |
| apps/zte_manager/infrastructure/huawei/family_client.py | 328 | HuaweiAuthFlow.RAND_COOKIE_HASH, |
| apps/zte_manager/infrastructure/huawei/family_client.py | 333 | # When the login page is API-like or inconclusive, SesTokenInfo is the |
| apps/zte_manager/infrastructure/huawei/family_client.py | 336 | _api_response, context = self._fetch_api_ses_token() |
| apps/zte_manager/infrastructure/huawei/family_client.py | 341 | return HuaweiAuthFlow.API_SES_TOKEN |
| apps/zte_manager/infrastructure/huawei/family_client.py | 343 | if explicit is HuaweiAuthFlow.API_SES_TOKEN: |
| apps/zte_manager/infrastructure/huawei/family_client.py | 353 | if response.status_code < 400 and plausible_huawei_token(response.text): |
| apps/zte_manager/infrastructure/huawei/family_client.py | 360 | if response.status_code < 400 and plausible_huawei_token(response.text): |
| apps/zte_manager/infrastructure/huawei/family_client.py | 361 | candidates.append(HuaweiAuthFlow.RAND_STRING_SESSION_TOKEN) |
| apps/zte_manager/infrastructure/huawei/family_client.py | 374 | return RandCountAuth.build_payload( |
| apps/zte_manager/infrastructure/huawei/family_client.py | 384 | legacy_cookie: bool, |
| apps/zte_manager/infrastructure/huawei/family_client.py | 385 | strategy: RandCountAuth, |
| apps/zte_manager/infrastructure/huawei/family_client.py | 393 | if legacy_cookie: |
| apps/zte_manager/infrastructure/huawei/family_client.py | 394 | headers["Cookie"] = "Cookie=body:Language:english:id=-1" |
| apps/zte_manager/infrastructure/huawei/family_client.py | 418 | legacy_cookie=True, |
| apps/zte_manager/infrastructure/huawei/family_client.py | 472 | legacy_cookie=False, |
| apps/zte_manager/infrastructure/huawei/family_client.py | 478 | token_response = self.session.get( |
| apps/zte_manager/infrastructure/huawei/family_client.py | 479 | self.url(SESSION_TOKEN_PATH), |
| apps/zte_manager/infrastructure/huawei/family_client.py | 484 | token = clean_huawei_token(token_response.text) |
| apps/zte_manager/infrastructure/huawei/family_client.py | 485 | if token_response.status_code != 200 or not plausible_huawei_token(token): |
| apps/zte_manager/infrastructure/huawei/family_client.py | 487 | "O login RandString foi enviado, mas o token de sessão não foi confirmado." |
| apps/zte_manager/infrastructure/huawei/family_client.py | 490 | self._session_token = token |
| apps/zte_manager/infrastructure/huawei/family_client.py | 491 | self._record_family(RAND_STRING_PATH, SESSION_TOKEN_PATH) |
| apps/zte_manager/infrastructure/huawei/family_client.py | 494 | def _authenticate_api_ses_token(self) -> bool: |
| apps/zte_manager/infrastructure/huawei/family_client.py | 495 | _response, context = self._fetch_api_ses_token() |
| apps/zte_manager/infrastructure/huawei/family_client.py | 498 | "A interface Huawei /api/ foi selecionada, mas SesTokenInfo não " |
| apps/zte_manager/infrastructure/huawei/family_client.py | 499 | "retornou sessão/token válidos." |
| apps/zte_manager/infrastructure/huawei/family_client.py | 504 | self._session_token = context.token |
| apps/zte_manager/infrastructure/huawei/family_client.py | 505 | self.session.headers["Cookie"] = context.session_info |
| apps/zte_manager/infrastructure/huawei/family_client.py | 506 | self.session.headers["__RequestVerificationToken"] = context.token |
| apps/zte_manager/infrastructure/huawei/family_client.py | 515 | "__RequestVerificationToken": context.token, |
| apps/zte_manager/infrastructure/huawei/family_client.py | 531 | self._refresh_api_token_from_response(login_response) |
| apps/zte_manager/infrastructure/huawei/family_client.py | 549 | self._refresh_api_token_from_response(device) |
| apps/zte_manager/infrastructure/huawei/family_client.py | 551 | API_SES_TOKEN_PATH, |
| apps/zte_manager/infrastructure/huawei/family_client.py | 584 | self._refresh_api_token_from_response(response) |
| apps/zte_manager/infrastructure/huawei/family_client.py | 588 | if self.auth_flow is not HuaweiAuthFlow.API_SES_TOKEN: |
| apps/zte_manager/infrastructure/huawei/family_client.py | 602 | if self.auth_flow is HuaweiAuthFlow.API_SES_TOKEN: |
| apps/zte_manager/infrastructure/huawei/family_client.py | 614 | if self.auth_flow is HuaweiAuthFlow.API_SES_TOKEN: |
| apps/zte_manager/infrastructure/huawei/family_client.py | 631 | if flow is HuaweiAuthFlow.RAND_STRING_SESSION_TOKEN: |
| apps/zte_manager/infrastructure/huawei/family_client.py | 635 | if flow is HuaweiAuthFlow.API_SES_TOKEN: |
| apps/zte_manager/infrastructure/huawei/family_client.py | 636 | return self._authenticate_api_ses_token() |
| apps/zte_manager/infrastructure/huawei/family_client.py | 637 | if flow is HuaweiAuthFlow.RAND_COOKIE_HASH: |
| apps/zte_manager/infrastructure/huawei/family_client.py | 639 | "Fluxo Huawei RandCount com cookie derivado reconhecido, " |
| apps/zte_manager/infrastructure/huawei/family_client.py | 659 | self._session_token = None |
| apps/zte_manager/infrastructure/huawei/family_client.py | 694 | self.session.cookies.clear() |
| apps/zte_manager/infrastructure/huawei/family_client.py | 697 | self.session.headers.pop("Cookie", None) |
| apps/zte_manager/infrastructure/huawei/family_client.py | 698 | self.session.headers.pop("__RequestVerificationToken", None) |
| apps/zte_manager/infrastructure/huawei/family_client.py | 699 | self._session_token = None |
| apps/zte_manager/infrastructure/huawei/family_client.py | 737 | self._session_token = None |
| apps/zte_manager/infrastructure/huawei/transport.py | 8 | from http.cookies import SimpleCookie |
| apps/zte_manager/infrastructure/huawei/transport.py | 146 | "getrandcount.asp", |
| apps/zte_manager/infrastructure/huawei/transport.py | 153 | "challenge-token-bound-to-tcp-connection", |
| apps/zte_manager/infrastructure/huawei/transport.py | 403 | def adopt_response_cookies( |
| apps/zte_manager/infrastructure/huawei/transport.py | 409 | if name.casefold() != "set-cookie": |
| apps/zte_manager/infrastructure/huawei/transport.py | 411 | parsed = SimpleCookie() |
| apps/zte_manager/infrastructure/huawei/transport.py | 418 | session.cookies.set(morsel.key, morsel.value, path=path) |
| apps/zte_manager/infrastructure/huawei/single_write.py | 35 | never returns raw response headers/body because they can contain cookies or |
| apps/zte_manager/infrastructure/huawei/single_write.py | 36 | rotated CSRF tokens. |
| apps/zte_manager/infrastructure/huawei/single_write.py | 56 | def cookie_header(session: requests.Session) -> str: |
| apps/zte_manager/infrastructure/huawei/single_write.py | 57 | return "; ".join(f"{cookie.name}={cookie.value}" for cookie in session.cookies) |
| apps/zte_manager/infrastructure/huawei/single_write.py | 72 | cookie_header: str, |
| apps/zte_manager/infrastructure/huawei/single_write.py | 88 | if cookie_header: |
| apps/zte_manager/infrastructure/huawei/single_write.py | 89 | lines.append(f"Cookie: {cookie_header}") |
| apps/zte_manager/infrastructure/huawei/single_write.py | 91 | if str(key).casefold() in {"content-length", "host", "cookie", "connection"}: |
| apps/zte_manager/infrastructure/huawei/affinity_client.py | 8 | from .protocol import plausible_huawei_token |
| apps/zte_manager/infrastructure/huawei/affinity_client.py | 17 | """Huawei negotiating client with opt-in exact-socket RandCount auth. |
| apps/zte_manager/infrastructure/huawei/affinity_client.py | 22 | authentication family itself remains RandCount and the credential budget |
| apps/zte_manager/infrastructure/huawei/affinity_client.py | 118 | if not plausible_huawei_token(challenge_response.text): |
| apps/zte_manager/infrastructure/huawei/affinity_client.py | 136 | "Cookie": "Cookie=body:Language:english:id=-1", |
| apps/zte_manager/infrastructure/huawei/affinity_client.py | 152 | transport.adopt_response_cookies(login_response, self.session) |
| apps/zte_manager/static/css/tangerine_workflows.css | 1 | @import url("./foundation/tangerine_tokens.css"); |
| apps/zte_manager/static/css/tangerine.css | 1 | @import url("./foundation/tangerine_tokens.css"); |
| apps/zte_manager/static/css/tangerine.css | 15 | * Tangerine no longer owns design tokens or arbitrary page/component rules. |
| apps/zte_manager/static/css/light_mode_refine.css | 1 | @import url("./foundation/tangerine_tokens.css"); |
| apps/zte_manager/static/css/light_mode_refine.css | 8 | * Theme values are owned by foundation/tangerine_tokens.css. Real corrective |
| apps/zte_manager/static/css/brmodelo_workbench.css | 5 | * Uses the existing DOM and CSS tokens; it does not change router I/O. |
| apps/zte_manager/static/css/dhcp_module.css | 1 | /* DHCP module shares neutral design tokens across dark/light modes. */ |
| apps/zte_manager/static/js/adaptive_firmware.js | 58 | const SENSITIVE = /password\|passwd\|secret\|token\|private\|authuser\|session\|credential\|keypassphrase/i; |
| apps/zte_manager/static/js/adaptive_firmware.js | 107 | if (["password=", "password:", "token=", "token:", "cookie=", |
| apps/zte_manager/static/js/f6201b_editor.js | 202 | // One click is the operator's authorization; server-side reads |
| apps/zte_manager/static/js/management.js | 38 | const secrets = /pass(?:word\|wd\|phrase)?\|secret\|token\|cookie\|authorization\|api[_-]?key\|credential\|session[_-]?key/i; |
| apps/zte_manager/static/js/management.js | 44 | if (["password=", "password:", "token=", "token:", |
| apps/zte_manager/static/js/management.js | 45 | "secret=", "secret:", "cookie="].some(k => lower.includes(k)) \|\| |
| apps/zte_manager/static/js/management.js | 111 | element.textContent = ["password=", "password:", "token=", "token:", |
| apps/zte_manager/static/js/f6201b_workbench.js | 298 | // The server keeps the original token, live form validation and |
| apps/zte_manager/static/js/tangerine_forms.js | 208 | input.type=kind==="number"?"number":/pass(word)?\|secret\|token/i.test(key)?"password":"text"; |
| apps/zte_manager/static/js/tangerine_results.js | 6 | const PRIVATE=/(?:pass(?:word\|phrase\|wd)?\|secret\|token\|cookie\|authorization\|api[_-]?key\|endpoint\|request[_-]?(?:body\|headers)\|traceback\|stack\|querystring)/i; |
| apps/zte_manager/static/js/tangerine_results.js | 34 | if (/(?:\b(?:GET\|POST\|PUT\|PATCH\|DELETE)\s+\/\|https?:\/\/\|\b(?:password\|token\|secret\|authorization)\s*[:=]\|traceback\|<script)/i.test(text)) |
| apps/zte_manager/static/js/app.js | 3769 | const [identity, authorization] = await Promise.all([ |
| apps/zte_manager/static/js/app.js | 3779 | if (!authorization.supported_firmware) { |
| apps/zte_manager/static/js/features/firmware_inspector.js | 165 | const DENY=/(?:password\|passphrase\|passwd\|token\|secret\|private\|credential\|url\|uri\|acs\|username\|userid\|user\|cookie\|authentication\|auth\|key\|cert\|serial\|mac\|endpoint\|view\|tag\|https?:\/\/\|thinklua\|[<>])/i; |
| apps/zte_manager/static/js/features/device_topology.js | 17 | if (/(?:https?:\/\/\|password\s*[:=]\|token\s*[:=]\|secret\s*[:=]\|cookie\s*[:=])/i.test(str)) return fallback; |
| apps/zte_manager/static/js/core/api_errors.js | 32 | const PRIVATE_CONTENT = /(?:https?:\/\/\|\/api\/\|\b(?:password\|passwd\|secret\|token\|cookie\|senha)\b\|[{}<>]\|\b(?:GET\|POST\|PUT\|PATCH\|DELETE)\s+\/\|traceback\|typeerror\|attributeerror)/i; |
| apps/zte_manager/static/css/themes/light_base_compat.css | 2 | * Palette ownership lives in foundation/tangerine_tokens.css; this file only |
| apps/zte_manager/static/css/themes/tangerine_base_compat.css | 2 | * Tokens are owned by foundation/tangerine_tokens.css. |
| apps/zte_manager/static/css/components/provider_diagnostics.css | 1 | /* Diagnostic presets and PC comparison share the canonical Access Manager tokens. |
| apps/zte_manager/static/css/components/configuration_cards.css | 3 | * consuming canonical design tokens directly. |
| apps/zte_manager/static/css/components/structured_forms.css | 2 | * Theme decisions come from foundation/tangerine_tokens.css; this file owns |
| apps/zte_manager/static/css/foundation/tangerine_tokens.css | 1 | /* Access Manager design tokens. |
| apps/zte_manager/static/css/foundation/tangerine_tokens.css | 3 | * Canonical tokens use the --am-color/--am-radius/--am-space namespaces. |
| tests/fixtures/huawei_ipincoming.html | 4 | <input type="hidden" id="hwonttoken" value="fixture-token-1234567890"> |
| tests/fixtures/huawei/phase0_research/sestokeninfo.xml | 2 | <response><SesInfo>SessionID=fixture-session</SesInfo><TokInfo>fixture-token</TokInfo></response> |
| tests/fixtures/huawei/phase0_research/sestokeninfo.json | 1 | {"SesInfo":"SessionID=fixture-session","TokInfo":"fixture-token"} |
| tests/fixtures/huawei/hg8010h_reference/login_legacy_rand_cookie.html | 3 | <script src="/asp/GetRandCount.asp"></script> |
| tests/fixtures/huawei/hg8010h_reference/login_legacy_rand_cookie.html | 9 | var authCookieFormat = "Cookie=rid=<derived>:Language:english:id=-1"; |
| tests/fixtures/huawei/hg8010h_reference/login_legacy_rand_cookie.html | 11 | <form action="/login.cgi" method="post"></form> |
| tests/fixtures/huawei/phase4/hg8245x6_ttnet2_login.html | 9 | <script src="/asp/GetRandCount.asp"></script> |
| tests/fixtures/huawei/phase4/hg8245x6_ttnet2_login.html | 12 | <form method="post" action="/login.cgi"> |
| tests/fixtures/huawei/phase4/hg8245x6_ttnet2_login.html | 15 | <input name="x.X_HW_Token"> |
| tests/fixtures/huawei/eg8041x6_10_local/auth_root_login.html | 5 | <form method="post" action="/login.cgi"> |
| tests/fixtures/huawei/eg8041x6_10_local/auth_root_login.html | 9 | <script src="/asp/GetRandCount.asp"></script> |
| tests/fixtures/huawei/eg8041x6_10_local/auth_root_login_rndsecurityformat.html | 8 | <form method="post" action="/login.cgi"> |
| tests/fixtures/huawei/eg8041x6_10_local/auth_root_login_rndsecurityformat.html | 11 | <input name="x.X_HW_Token" value="" /> |
| tests/fixtures/huawei/eg8041x6_10_local/auth_root_login_rndsecurityformat.html | 13 | <script src="/asp/GetRandCount.asp"></script> |
| tests/fixtures/huawei/phase3/safelogin.js | 2 | function encodeForLogin(password, token) { |
| tests/fixtures/huawei/phase3/safelogin.js | 4 | return base64encode(sha256(b64 + __RequestVerificationToken + token)); |
| tests/fixtures/huawei/phase5/hg8347r_userdev_page.html | 3 | <input type="hidden" name="onttoken" id="hwonttoken" value="0123456789abcdef0123456789abcdef"> |
| docs/huawei/research_registry.md | 22 | \| Access Manager local EG8041X6-10 evidence \| authorized local device \| local sanitized evidence \| EG8041X6-10 \| RandCount, BREBG2, HTTP->HTTPS:80 bootstrap, 2G/5G object graph, channel discovery, WAN, native ping/traceroute \| sanitized fixtures + family runtime; write effects remain per-operation gated \| |
| docs/huawei/research_registry.md | 24 | \| `siedgustavo/huawei-ont-stats` \| Python monitoring/API \| MIT \| EG8021V5 \| RandString/RandToken, AMP/BBSP, PON/optic/WAN/client reads \| behavior incorporated in #84; fixtures remain external-reference \| |
| docs/huawei/research_registry.md | 25 | \| `Erenn0989/huawei-ont-mcp` \| MCP/automation \| MIT \| HG8245X6-family \| RandCount, read reauth, same-TCP warning \| characterized; same-TCP still pending fixture/device \| |
| docs/huawei/research_registry.md | 28 | \| `logon84/Huawei-Optistar-EG8145X6-10-remote-login-example` \| Python example \| no LICENSE found \| EG8145X6-10 \| HTTPS:80, RandCount/login/client-list behavior \| factual behavior only; no credentials/code copied \| |
| docs/huawei/research_registry.md | 29 | \| `kevinantoniowiyonolauw/netcut` router package \| Go implementation/docs \| public source; license checked at source level before code reuse \| EG8145V5 \| independent RandCount/login flow and topology/Ethernet behavior \| protocol corroboration only; no source transplanted \| |
| docs/huawei/research_registry.md | 30 | \| EletrônicaBR EG8145V5-V2 R020/R021 research \| forum technical report \| N/A \| EG8145V5-V2 \| GetRandCount/login, SSMP resources, `CfgMode=BREBG2` \| **candidate family evidence only**; no capability promoted by name/CfgMode alone \| |
| docs/huawei/research_registry.md | 32 | \| `loiklo/huawei-onu-to-graphite` \| HTTP/Telnet exporter \| GPL-3.0 \| HG8010H-like \| POST GetRandCount, trailing 32-char token observation, AMP optic page, WAP optic \| behavior only; clean-room implementation \| |
| docs/huawei/research_registry.md | 37 | \| `lilmayofuksu/huawei-gpon-thing` \| Python WebUI monitor \| MIT \| HG8010H-family \| RandCount WebUI and 16-argument `stOpticInfo`; LAN counters \| optical signature corroboration; code not copied \| |
| docs/huawei/research_registry.md | 40 | \| Marco d'Itri — *Exploring the Huawei HG8010H GPON ONT* \| technical article/PDF \| document copyright \| HG8010H older generation \| `/html/status/opticinfo.asp`, 6-arg `stOpticInfo`, legacy hashed-cookie auth \| old-firmware characterization; auth deliberately unsupported \| |
| docs/huawei/research_registry.md | 41 | \| CAPS forum — HG8010H/EG8010H research \| forum/reverse-engineering thread \| N/A \| HG8010H, EG8010H \| newer RandCount/login flow, AMP optic page, firmware variance \| cross-source evidence for family variance \| |
| docs/huawei/research_registry.md | 42 | \| 0neday Huawei ONT/Home Assistant gist \| Gist \| no license relied upon \| Huawei AMP WebUI \| AMP optic/login cookie variants \| factual behavior only \| |
| docs/huawei/research_registry.md | 73 | 6. EG8145V5-V2 has external `BREBG2` + RandCount/SSMP evidence, but remains a |
| docs/huawei/phase0_phase1_evidence.md | 3 | This document records the evidence boundary for the protocol architecture introduced by `feat/huawei-phase0-phase1-architecture`. It contains no credentials, customer addresses, cookies or live session tokens. |
| docs/huawei/phase0_phase1_evidence.md | 23 | - RandCount challenge and Base64 password login form; |
| docs/huawei/phase0_phase1_evidence.md | 24 | - authenticated cookie/session lifecycle; |
| docs/huawei/phase0_phase1_evidence.md | 61 | - `/api/webserver/SesTokenInfo` + `/api/system/user_login` API family; |
| docs/huawei/phase0_phase1_evidence.md | 76 | - **Fixture validated:** transport policy, HTTPS:80 bootstrap parsing, BOM/hex RandCount normalization, one-submission budget, ambiguous-auth behavior, structural JavaScript parser, HG8145X6 field mapping/fingerprint selection and optical candidate fallback. |
| docs/huawei/phase0_phase1_evidence.md | 78 | - **Research-only:** API SesToken auth, ASP_CONFIG writes, socket-affinity auth transport, LTE/5G SCRAM, HG8145X6 mutations not physically captured. |
| docs/huawei/external_references.md | 3 | These repositories are engineering-reverse-reference material, not runtime dependencies. Access Manager reimplements only behavior supported by independent evidence and keeps model/firmware provenance explicit. No credentials, cookies or session tokens are copied into this document. |
| docs/huawei/external_references.md | 10 | - **Authentication flow:** read-only pre-login challenge from `/html/ssmp/common/getRandString.asp`, POST `/login.cgi`, then read `/html/ssmp/common/GetRandToken.asp` on the authenticated cookie session. Source explicitly decodes the challenge/token with UTF-8 BOM handling. |
| docs/huawei/external_references.md | 11 | - **Session lifecycle:** cookie-aware opener is returned with the post-login token. `api_server.py` adds persistent-session/cache behavior. |
| docs/huawei/external_references.md | 12 | - **Token / CSRF:** `x.X_HW_Token` on login; post-login session token is acquired separately. |
| docs/huawei/external_references.md | 22 | - **Useful protocol knowledge:** RandString auth variant, PON `OntStateInfo`, WAN traffic stats, Ethernet data and several configuration surfaces. |
| docs/huawei/external_references.md | 30 | - **Firmware / WebUI family:** RandCount/login WebUI with BBSP read surfaces. |
| docs/huawei/external_references.md | 31 | - **Authentication flow:** `/asp/GetRandCount.asp` -> `/login.cgi` using a persistent HTTP connection in the repository implementation. |
| docs/huawei/external_references.md | 32 | - **Session lifecycle:** explicit cookie/session reuse; read helpers invalidate and reauthenticate on authentication loss. |
| docs/huawei/external_references.md | 33 | - **Token / CSRF:** pre-login RandCount token submitted as `x.X_HW_Token`. |
| docs/huawei/external_references.md | 36 | - **Known endpoints:** `/asp/GetRandCount.asp`, `/login.cgi`, `/html/bbsp/common/GetLanUserDevInfo.asp`, `/CustomApp/mainpage.asp`, `/html/bbsp/common/getwanlist.asp`. |
| docs/huawei/external_references.md | 42 | - **Risks:** ISP-custom firmware; TCP-affinity requirement may not apply to other RandCount families. |
| docs/huawei/external_references.md | 50 | - **Authentication flow:** documentation describes `/asp/GetRandCount.asp` + `/login.cgi`. |
| docs/huawei/external_references.md | 51 | - **Session / CSRF:** documented session/CSRF behavior. |
| docs/huawei/external_references.md | 65 | - **Firmware / WebUI family:** RandCount + generated SSMP/AMP/BBSP surfaces. |
| docs/huawei/external_references.md | 66 | - **Authentication flow:** RandCount -> login, cookie jar, explicit session wrapper/login/logout. |
| docs/huawei/external_references.md | 67 | - **Session lifecycle:** client owns cookie jar, mutex, HTTP transport, credentials and session wrapper. |
| docs/huawei/external_references.md | 68 | - **Token / CSRF:** hardware token from `/asp/GetRandCount.asp`; page/mutation token handling remains client-owned. |
| docs/huawei/external_references.md | 83 | - **Firmware / WebUI family:** RandCount/login with BBSP client-reading surface. |
| docs/huawei/external_references.md | 84 | - **Authentication flow:** `/asp/GetRandCount.asp` -> `/login.cgi`, `x.X_HW_Token`, cookies. |
| docs/huawei/external_references.md | 87 | - **Known endpoints:** `/asp/GetRandCount.asp`, `/login.cgi`, `/html/bbsp/userdevinfo/getuserdevinfo.asp`. |
| docs/huawei/external_references.md | 89 | - **Useful protocol knowledge:** independent convergence of RandCount + login + token/cookie behavior on the X6 generation. |
| docs/huawei/external_references.md | 97 | 1. **RandCount + login + `x.X_HW_Token`** converges across the existing local EG8041X7 implementation, `huawei-ont-mcp`, `go-huawei-client` and the EG8145X6-10 example. |
| docs/huawei/external_references.md | 99 | 3. **RandString + post-login RandToken** is a real divergent auth flow observed in `huawei-ont-stats`; it must not be collapsed into RandCount. |
| docs/huawei/eg8041_https80_auth_hotfix.md | 15 | 3. RandCount selection/probe; |
| docs/huawei/eg8041_https80_auth_hotfix.md | 16 | 4. `POST /asp/GetRandCount.asp` with safe GET fallback; |
| docs/huawei/eg8041_https80_auth_hotfix.md | 17 | 5. `POST /login.cgi` with the existing base64 password / `Language=english` / `x.X_HW_Token` contract and the legacy RandCount cookie behavior; |
| docs/huawei/eg8041_https80_auth_hotfix.md | 22 | The RandCount payload/FamilyAware algorithm did not change. The regression boundary is the newly activated transport/auth wrapper. Its pre-hotfix `login()` performed an additional HTTPS root validation before delegating to `HuaweiFamilyAwareWebClient.login()`. FamilyAware then closed that session and created a new one  |
| docs/huawei/eg8041_https80_auth_hotfix.md | 55 | It never records password, challenge, `X_HW_Token`, cookie or session token. |
| docs/huawei/eg8041_https80_auth_hotfix.md | 66 | When `HUAWEI_HTTP_TRACE=true`, the negotiating client's real session emits a sanitized line for root, RandCount, login and authenticated-proof requests containing method, scheme, port, path, status, redirect state, exception type and response signature. |
| docs/huawei/eg8041_https80_auth_hotfix.md | 68 | The trace omits host by default and never emits query strings, request/response bodies, headers, passwords, cookies, challenges or tokens. Legacy `raw`/`unsafe` environment values do not disable those redactions in the negotiating client. |
| docs/huawei/firmware_families.md | 13 | - `/login.cgi` |
| docs/huawei/firmware_families.md | 37 | External EG8145V5-V2 material also reports `CfgMode=BREBG2`, RandCount and SSMP. |
| docs/huawei/firmware_families.md | 54 | /asp/GetRandCount.asp |
| docs/huawei/firmware_families.md | 55 | -> /login.cgi |
| docs/huawei/firmware_families.md | 56 | -> authenticated cookie/session |
| docs/huawei/firmware_families.md | 60 | `x.X_HW_Token` is used in login payloads. Details differ by firmware: |
| docs/huawei/firmware_families.md | 63 | - some responses are the token itself while one HG8010H exporter observes a |
| docs/huawei/firmware_families.md | 64 | larger response whose final 32 hexadecimal characters are the token; |
| docs/huawei/firmware_families.md | 72 | ### Auth variant: `rand_cookie_hash` |
| docs/huawei/firmware_families.md | 75 | RandCount challenge participates in a derived authentication cookie instead of |
| docs/huawei/firmware_families.md | 76 | the ordinary UserName/PassWord RandCount form. `RndSecurityFormat` and derived |
| docs/huawei/firmware_families.md | 77 | cookie markers characterize this variant. |
| docs/huawei/firmware_families.md | 80 | credentials. It is not treated as ordinary RandCount and no external credential |
| docs/huawei/firmware_families.md | 83 | ### Auth variant: `rand_string_session_token` |
| docs/huawei/firmware_families.md | 88 | /html/ssmp/common/getRandString.asp |
| docs/huawei/firmware_families.md | 89 | -> /login.cgi |
| docs/huawei/firmware_families.md | 90 | -> /html/ssmp/common/GetRandToken.asp |
| docs/huawei/firmware_families.md | 91 | -> authenticated cookie/session + post-login token |
| docs/huawei/firmware_families.md | 94 | This is not treated as a cosmetic variation of RandCount. The challenge endpoint and post-login token lifecycle are different enough to justify a separate auth strategy while keeping the same shared transport/session abstraction. |
| docs/huawei/firmware_families.md | 108 | ## `asp_config` |
| docs/huawei/firmware_families.md | 129 | 4. actually observed `/asp/GetConfig.asp` or `/asp/SetConfig.asp` establishes `asp_config` evidence; |
| docs/huawei/firmware_families.md | 165 | - **EG8041X7-10 RandCount/BREBG2:** existing local physical evidence; existing mapped writes and readbacks remain authoritative. |
| docs/huawei/firmware_families.md | 166 | - **EG8041X6-10 RandCount/BREBG2:** authorized local evidence for model/family, HTTPS:80 bootstrap, dual-band Wi-Fi signatures/channel discovery, WAN and native ping/traceroute. New mutation effects remain physical-validation-pending unless separately exercised with readback. |
| docs/huawei/firmware_families.md | 167 | - **HG8010H newer RandCount + optical/WAP telemetry:** multiple external sources + sanitized characterization fixtures + automated tests; not physically validated by the HG8010 PR. |
| docs/huawei/firmware_families.md | 168 | - **HG8010H older derived-cookie auth:** externally observed; recognized but deliberately unsupported for authentication. |
| docs/huawei/firmware_families.md | 170 | - **EG8021V5 RandString:** observed in external firmware/source; implemented and fixture-tested in Access Manager; pending physical validation on a real device. |
| docs/huawei/firmware_families.md | 171 | - **EG8145V5:** multiple external RandCount/WebUI/CLI sources; recognized only until the exact reader/object signatures are characterized. |
| docs/huawei/firmware_families.md | 172 | - **EG8145V5-V2:** external RandCount + SSMP + `BREBG2` evidence; research-only family candidate. |
| docs/huawei/firmware_families.md | 173 | - **HG8245X6 same-TCP RandCount:** externally observed; not implemented as strict socket affinity yet. |
| docs/huawei/firmware_families.md | 174 | - **EG8145X6-10 RandCount/HTTPS:80:** externally observed; family evidence only, not a promise of EG8041 semantics. |
| docs/huawei/firmware_families.md | 175 | - **HG8245H5 ASP_CONFIG:** externally documented; runtime support `UNKNOWN` pending stronger evidence/fixture/device. |
| docs/huawei/phase4_hg8245x6_affinity.md | 5 | Phase 4 implements only the transport requirement documented for a TTNET2-branded Huawei HG8245X6: the RandCount challenge and the credential-bearing `/login.cgi` request must use the exact same TCP connection. |
| docs/huawei/phase4_hg8245x6_affinity.md | 7 | This phase does **not** add Huawei write support, WPS, password reveal, reboot, ASP_CONFIG, or new universal HG/EG/X6 endpoint assumptions. |
| docs/huawei/phase4_hg8245x6_affinity.md | 15 | - authentication remains the legacy RandCount family; |
| docs/huawei/phase4_hg8245x6_affinity.md | 16 | - `POST /asp/GetRandCount.asp` returns the one-time token; |
| docs/huawei/phase4_hg8245x6_affinity.md | 17 | - `/login.cgi` rejects that token when the credential request is sent on a different TCP connection; |
| docs/huawei/phase4_hg8245x6_affinity.md | 40 | - `GetRandCount.asp` |
| docs/huawei/phase4_hg8245x6_affinity.md | 56 | - bridges only response cookies into the existing authenticated `requests.Session` after login; |
| docs/huawei/phase4_hg8245x6_affinity.md | 74 | 1. fetch RandCount on the dedicated connection; |
| docs/huawei/phase4_hg8245x6_affinity.md | 75 | 2. normalize the challenge with the existing `RandCountAuth`; |
| docs/huawei/phase4_hg8245x6_affinity.md | 77 | 4. submit `/login.cgi` on that same connection; |
| docs/huawei/phase4_hg8245x6_affinity.md | 78 | 5. copy the returned session cookie into the normal session; |
| docs/huawei/phase4_hg8245x6_affinity.md | 92 | - no raw cookie/password/token logging; |
| docs/huawei/phase4_hg8245x6_affinity.md | 101 | - `/asp/GetRandCount.asp` |
| docs/huawei/phase4_hg8245x6_affinity.md | 102 | - `/login.cgi` |
| docs/huawei/phase4_hg8245x6_affinity.md | 108 | - session cookie is adopted and read-only session proof succeeds; |
| docs/huawei/phase4_hg8245x6_affinity.md | 111 | - ordinary RandCount remains on the old path; |
| docs/huawei/capability_matrix.md | 22 | \| RandCount login \| ALREADY_EXISTS + IMPROVED \| POST/GET variance and trailing-32-hex challenge characterized \| |
| docs/huawei/capability_matrix.md | 23 | \| RandString login \| IMPLEMENTED (#84) \| EG8021V5 primary evidence \| |
| docs/huawei/capability_matrix.md | 24 | \| Derived-cookie RandCount auth \| CHARACTERIZED / DISABLED \| older HG8010H generation; recognized and refused before credentials \| |
| docs/huawei/capability_matrix.md | 57 | - protocol-family/auth-flow objects (`amp_bbsp`, `asp_config`, `unknown`); |
| docs/huawei/capability_matrix.md | 58 | - RandCount vs RandString session-token authentication; |
| docs/huawei/capability_matrix.md | 78 | - RandCount POST-vs-GET evidence and exact trailing-32-hex challenge normalization; |
| docs/huawei/capability_matrix.md | 79 | - old HG8010H derived-cookie auth variant recognized but deliberately not implemented for authentication; |
| docs/huawei/capability_matrix.md | 95 | 2. **HG8245 family expansion:** HG8245H/H5/X6 with ASP_CONFIG, page-token and same-TCP divergences preserved rather than collapsed into RandCount. |
| docs/huawei/capability_matrix.md | 99 | 6. **Writes:** only after family-specific endpoint/payload/mapping/token semantics and required physical validation. |
| docs/huawei/capability_matrix.md | 104 | - old HG8010H derived-cookie auth implementation; |
| docs/huawei/capability_matrix.md | 105 | - RandString authentication on a real EG8021V5-class ONT; |
| docs/huawei/capability_matrix.md | 106 | - strict TCP-connection affinity for HG8245X6-style RandCount firmware; |
| docs/huawei/phase3_hg8245h_dual_protocol.md | 9 | 1. probe `GET /api/webserver/SesTokenInfo` without credentials; |
| docs/huawei/phase3_hg8245h_dual_protocol.md | 10 | 2. when a valid `SesInfo` + `TokInfo` pair is returned, select the modern `api_sestoken` family; |
| docs/huawei/phase3_hg8245h_dual_protocol.md | 11 | 3. otherwise keep the existing legacy Huawei fingerprint flow (`/asp/GetRandCount.asp` + `/login.cgi`); |
| docs/huawei/phase3_hg8245h_dual_protocol.md | 22 | - `GET /api/webserver/SesTokenInfo` |
| docs/huawei/phase3_hg8245h_dual_protocol.md | 23 | - `SesInfo` becomes session cookie context; |
| docs/huawei/phase3_hg8245h_dual_protocol.md | 24 | - `TokInfo` becomes `__RequestVerificationToken` / `x.X_HW_Token` context. |
| docs/huawei/phase3_hg8245h_dual_protocol.md | 26 | - `POST /api/system/user_login` exactly once; |
| docs/huawei/phase3_hg8245h_dual_protocol.md | 29 | Two password encodings are represented by `ApiSesTokenAuth`: |
| docs/huawei/phase3_hg8245h_dual_protocol.md | 32 | - `base64(hex_sha256(base64(password) + token))`. |
| docs/huawei/phase3_hg8245h_dual_protocol.md | 38 | When `/api/webserver/SesTokenInfo` is absent, HTML, malformed, or does not contain a valid session/token pair, the client does not treat `/api/` as available. Existing evidence-driven auth selection remains authoritative, including the HG8245H legacy RandCount family when its runtime fingerprint is present. |
| docs/huawei/phase3_hg8245h_dual_protocol.md | 74 | - SesTokenInfo XML and JSON parsing; |
| docs/huawei/phase3_hg8245h_dual_protocol.md | 79 | - legacy RandCount fallback when the API fingerprint is invalid; |
| docs/huawei/phase3_hg8245h_dual_protocol.md | 83 | Fixtures preserve structural response shapes only. They contain no router credentials, live cookies, real tokens, or copied vendor JavaScript. |
| docs/huawei/model_matrix.md | 7 | \| EG8041X6-10 \| authorized local evidence + sanitized fixtures + tests \| AMP_BBSP / BREBG2-like \| RandCount; HTTP bootstrap -> HTTPS:80 \| **READ_SUPPORTED / FAMILY_COMPATIBLE after runtime signature proof** \| Wi-Fi mutation surface characterized + readback-gated; new write effects `PHYSICAL_VALIDATION_PENDING` \| |
| docs/huawei/model_matrix.md | 8 | \| EG8041X7-10 \| local capture + regression suite \| AMP_BBSP / BREBG2-like \| RandCount WebUI \| **WRITE_SUPPORTED / PHYSICALLY_VALIDATED** \| existing operational profile/write validation remains authoritative \| |
| docs/huawei/model_matrix.md | 9 | \| HG8010H \| multiple independent sources + reference fixtures \| AMP_BBSP with firmware variants \| RandCount newer; derived-cookie older; optional WAP \| **READ_PARTIAL** \| read only in new telemetry surface \| |
| docs/huawei/model_matrix.md | 10 | \| EG8010H \| CAPS/forum family evidence \| AMP_BBSP probable \| RandCount observed externally \| **RECOGNIZED** \| no inheritance from HG8010H \| |
| docs/huawei/model_matrix.md | 11 | \| EG8021V5 \| huawei-ont-stats + #84 tests \| AMP_BBSP \| RandString + RandToken \| **READ_PARTIAL** \| external/fixture evidence; physical validation pending \| |
| docs/huawei/model_matrix.md | 12 | \| EG8145V5 \| go-huawei-client + independent operational/source evidence \| AMP_BBSP candidate \| RandCount; WebUI + WAP/SSH evidence \| **RECOGNIZED** \| exact EG8041 object graph not proven; no family writes \| |
| docs/huawei/model_matrix.md | 13 | \| EG8145V5-V2 \| external firmware/SSMP research \| AMP_BBSP / BREBG2 **candidate** \| RandCount; SSMP; `CfgMode=BREBG2` reported \| **RESEARCH_ONLY** \| CfgMode alone does not grant family compatibility or writes \| |
| docs/huawei/model_matrix.md | 14 | \| EG8145X6-10 \| public login example + related OptiXstar material \| AMP_BBSP candidate \| RandCount; HTTPS:80 observed externally \| **RESEARCH_ONLY** \| client/optic evidence only; no EG8041 write inheritance \| |
| docs/huawei/model_matrix.md | 15 | \| HG8245X6 \| huawei-ont-mcp \| AMP_BBSP candidate \| RandCount with same-TCP constraint \| **RESEARCH_ONLY** \| strict same-TCP behavior still uncharacterized locally \| |
| docs/huawei/model_matrix.md | 16 | \| HG8245H5 \| firmware/docs \| ASP_CONFIG candidate + WAP \| RandCount; GetConfig/SetConfig documented \| **RESEARCH_ONLY** \| deliberately separate from EG8041 mutation strategy \| |
| docs/huawei/model_matrix.md | 17 | \| HG8245H \| gist/reverse-engineering material \| AMP/ASP uncertain \| token/RandCount variants \| **RESEARCH_ONLY** \| no automatic family assignment \| |
| docs/huawei/model_matrix.md | 37 | HG8010 telemetry from #85 remains a separate multi-variant strategy, including optional read-only CLI. EG8021V5 keeps its RandString flow. HG8245X6 keeps its same-TCP warning. HG8245H5 keeps ASP_CONFIG separate. None are forced into BREBG2 merely because they expose `InternetGatewayDevice` objects. |
| docs/huawei/phase5_hg8347r_lab_mode.md | 13 | - authentication family: legacy RandCount + Base64 password; |
| docs/huawei/phase5_hg8347r_lab_mode.md | 15 | - page token: hidden `hwonttoken` / `onttoken`; |
| docs/huawei/phase5_hg8347r_lab_mode.md | 64 | The named operations come from the existing Access Manager captured/mapped Huawei surface. They still obtain a fresh page token, submit once, never blind-retry a mutation and use read-back when a mapped read-back exists. |
| docs/huawei/phase5_hg8347r_lab_mode.md | 80 | "token_page": "/html/.../page.asp", |
| docs/huawei/phase5_hg8347r_lab_mode.md | 88 | The endpoint must remain relative to the already connected ONT. Session token/cookie fields supplied by the caller are stripped/replaced by the live session token machinery. |
| docs/huawei/phase5_hg8347r_lab_mode.md | 112 | - token page `/html/ssmp/reset/reset.asp`; |
| docs/huawei/phase5_hg8347r_lab_mode.md | 114 | - body containing the fresh `x.X_HW_Token`; |
| docs/huawei/phase5_hg8347r_lab_mode.md | 134 | "token_page": "/html/.../reboot.asp" |
| docs/huawei/phase5_hg8347r_lab_mode.md | 148 | "token_page": "/html/.../reset.asp" |
| docs/huawei/phase5_hg8347r_lab_mode.md | 163 | - fresh CSRF/token acquisition where the WebUI requires it; |
| docs/huawei/phase2_eg8145v5_hn8010ts.md | 9 | - RandCount detection/authentication; |
| docs/huawei/phase2_eg8145v5_hn8010ts.md | 11 | - cookies and session lifecycle; |
| docs/huawei/phase2_eg8145v5_hn8010ts.md | 24 | - `chickenzord/go-huawei-client` (MIT): stateful client, `POST /asp/GetRandCount.asp`, Base64 password, `POST /login.cgi`, `POST /html/bbsp/common/GetLanUserDevInfo.asp`, and `GET /html/ssmp/deviceinfo/deviceinfo.asp` for CPU/memory information. |
| docs/huawei/phase2_eg8145v5_hn8010ts.md | 25 | - `undefjs/huawei-eg8145v5-hacs` (MIT): independent confirmation of the legacy cookie, RandCount/Base64 login, device information, and the alternate `/html/bbsp/userdevinfo/getuserdevinfo.asp` client surface. |
| docs/huawei/phase2_eg8145v5_hn8010ts.md | 52 | HN8010TS is not selected from the model hint alone. The runtime requires authenticated RandCount context, a matching model parsed from `deviceinfo.asp`, a recognized client schema, and recognized optical data. |
| docs/huawei/phase2_eg8145v5_hn8010ts.md | 65 | - RandCount/Base64 shared-session architecture; |
| docs/huawei/endpoints.md | 8 | \| `/asp/GetRandCount.asp` \| LOCAL + EXTERNAL \| EG8041X6-10/X7-10 local; HG8010H/EG8010H, HG8245X6, EG8145V5, EG8145X6-10 external \| RandCount; POST preferred with safe GET fallback; trailing 32-hex challenge variant characterized \| |
| docs/huawei/endpoints.md | 9 | \| `/login.cgi` \| LOCAL + EXTERNAL \| multiple Huawei WebUIs \| shared auth transport; auth strategy selected before credentials \| |
| docs/huawei/endpoints.md | 10 | \| `/html/ssmp/common/getRandString.asp` \| EXTERNAL \| EG8021V5 \| RandString auth strategy implemented; physical validation pending \| |
| docs/huawei/endpoints.md | 11 | \| `/html/ssmp/common/GetRandToken.asp` \| EXTERNAL \| EG8021V5 \| private post-login token acquisition implemented; physical validation pending \| |
| docs/huawei/endpoints.md | 36 | \| `/CustomApp/mainpage.asp` \| EXTERNAL \| HG8245X6 MCP reference \| firmware-specific WAN token/status helper; not generalized \| |
| docs/huawei/endpoints.md | 37 | \| `/asp/GetConfig.asp` \| EXTERNAL DOCUMENTATION \| HG8245H5 \| `asp_config` family evidence only; runtime unconfirmed \| |
| docs/huawei/endpoints.md | 38 | \| `/asp/SetConfig.asp` \| EXTERNAL DOCUMENTATION \| HG8245H5 \| `asp_config` family evidence only; no write support declared \| |
| .github/workflows/huawei-phase0-phase1-validation.yml | 93 | tests/test_design_tokens.cjs \ |
| .github/workflows/huawei-session-validation.yml | 54 | - "tests/test_design_tokens.cjs" |
| .github/workflows/huawei-session-validation.yml | 181 | tests/test_design_tokens.cjs \ |
| .github/workflows/release.yml | 287 | GH_TOKEN: ${{ github.token }} |