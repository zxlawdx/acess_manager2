const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const css=fs.readFileSync('apps/access_manager/static/css/regressions.css','utf8');
const ui=fs.readFileSync('apps/access_manager/static/js/operational-parity.js','utf8');
const html=fs.readFileSync('apps/access_manager/templates/index.html','utf8');

test('Juniper login collapses before the generic mobile breakpoint',()=>{
  assert.match(css,/infrastructure-login/);
  assert.match(css,/max-width:1100px/);
  assert.match(css,/connection-visual\s*\{[\s\S]*display:none!important/);
});

test('native selects keep dark text on the light system surface',()=>{
  assert.match(css,/select:not\(\[multiple\]\)/);
  assert.match(css,/background:#fff!important/);
  assert.match(css,/color:#050805!important/);
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

test('operational parity assets are loaded by the Vela page',()=>{
  assert.match(html,/access_manager\/css\/regressions\.css/);
  assert.match(html,/access_manager\/js\/operational-parity\.js/);
  assert.doesNotThrow(()=>new Function(ui));
});
