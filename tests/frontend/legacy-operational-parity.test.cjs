const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const css=fs.readFileSync('apps/access_manager/static/css/regressions.css','utf8');
const ui=fs.readFileSync('apps/access_manager/static/js/operational-parity.js','utf8');
const meshUi=fs.readFileSync('apps/access_manager/static/js/mesh-port-forwarding.js','utf8');
const matrixUi=fs.readFileSync('apps/access_manager/static/js/matrix-bg.js','utf8');
const html=fs.readFileSync('apps/access_manager/templates/index.html','utf8');

test('Juniper login collapses before the generic mobile breakpoint',()=>{
  assert.match(css,/infrastructure-login/);
  assert.match(css,/max-width:1100px/);
  assert.match(css,/connection-visual\s*\{[\s\S]*display:none!important/);
});

test('native inputs and selects follow the dark terminal surface',()=>{
  assert.match(css,/color-scheme:dark!important/);
  assert.match(css,/background-color:var\(--terminal-bg-1\)!important/);
  assert.match(css,/color:var\(--terminal-text\)!important/);
  assert.doesNotMatch(css,/color-scheme:light!important/);
  assert.doesNotMatch(css,/background:#fff!important/);
});

test('normal diagnostics expose neighbour scan and actionable recommended channels',()=>{
  assert.match(ui,/\/api\/device\/diagnostics\/wifi-neighbors/);
  assert.match(ui,/Melhor canal observado/);
  assert.match(ui,/data-neighbor-apply/);
  assert.match(ui,/\/api\/device\/wifi\/radio/);
});

test('complete diagnostics can apply the displayed recommendation and uses durable export',()=>{
  assert.match(ui,/data-complete-apply-channel/);
  assert.match(ui,/Uma leitura de redes próximas indica menor sobreposição no canal/);
  assert.match(ui,/\/api\/device\/diagnostics\/full\/export-file/);
  assert.match(ui,/saved_path/);
});

test('mesh port forwarding UI stays fail-closed and previews the effective destination',()=>{
  assert.match(meshUi,/\/api\/device\/mesh\/port-forwarding\/candidates/);
  assert.match(meshUi,/\/api\/device\/mesh\/port-forwarding\/preview/);
  assert.match(meshUi,/\/api\/device\/mesh\/port-forwarding\/apply/);
  assert.match(meshUi,/confirm_mesh_wan/);
  assert.match(meshUi,/effective_destination/);
  assert.match(meshUi,/Nenhum fallback para LAN/);
  assert.doesNotThrow(()=>new Function(meshUi));
});

test('matrix background is passive, subtle and motion-aware',()=>{
  assert.match(css,/#matrix-bg/);
  assert.match(css,/pointer-events:none/);
  assert.match(matrixUi,/prefers-reduced-motion/);
  assert.match(matrixUi,/requestAnimationFrame/);
  assert.doesNotThrow(()=>new Function(matrixUi));
});

test('operational parity assets are loaded by the Vela page',()=>{
  assert.match(html,/access_manager\/css\/regressions\.css/);
  assert.match(html,/access_manager\/js\/operational-parity\.js/);
  assert.match(html,/access_manager\/js\/mesh-port-forwarding\.js/);
  assert.match(html,/access_manager\/js\/matrix-bg\.js/);
  assert.doesNotThrow(()=>new Function(ui));
});
