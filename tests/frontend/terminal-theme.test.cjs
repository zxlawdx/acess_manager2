const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'../..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const tokens=read('apps/access_manager/static/css/tokens.css');
const terminal=read('apps/access_manager/static/css/professional.css');
const vela=read('apps/access_manager/static/css/vela-integration.css');
const shell=read('apps/access_manager/static/js/shell-ui.js');
const template=read('apps/access_manager/templates/index.html');

test('terminal design system is dark-only and uses bundled monospace typography',()=>{
  assert.match(tokens,/--background:#0a0a0a/);
  assert.match(tokens,/--accent:#33ff00/);
  assert.match(tokens,/--secondary:#ffb000/);
  assert.match(tokens,/--danger:#ff3333/);
  assert.match(tokens,/--radius:0px/);
  assert.match(tokens,/--font-sans:"Space Mono"/);
  assert.match(shell,/root\.dataset\.theme = 'terminal'/);
  assert.doesNotMatch(shell,/themeButton/);
});

test('terminal shell keeps CRT styling non-interactive and removes floating-card geometry',()=>{
  assert.match(terminal,/body::after[\s\S]*pointer-events:none/);
  assert.match(terminal,/--terminal-glow/);
  assert.match(terminal,/border-radius:0!important/);
  assert.match(terminal,/box-shadow:none!important/);
});

test('Juniper has a complete terminal token set including primary-soft',()=>{
  assert.match(vela,/--am-primary:#33ff00/);
  assert.match(vela,/--am-primary-soft:#071807/);
  assert.match(vela,/--am-warning:#ffb000/);
  assert.match(vela,/--am-danger:#ff3333/);
});

test('SSH host-key modal is isolated, centered and readable',()=>{
  assert.match(vela,/\.juniper-surface\{[\s\S]*position:fixed!important/);
  assert.match(vela,/\.juniper-surface\{[\s\S]*transform:translate\(-50%,-50%\)!important/);
  assert.match(vela,/\.juniper-surface \.j-trust-alert\{[\s\S]*background:var\(--am-primary-soft\)!important/);
  assert.match(vela,/\.juniper-surface \.j-kv>div\{[\s\S]*grid-template-columns:minmax\(150px,\.72fr\) minmax\(0,1\.28fr\)!important/);
  assert.match(vela,/\.juniper-surface \.j-kv dd\{[\s\S]*word-break:break-all!important/);
  assert.match(vela,/\.juniper-surface \.dialog-footer\{[\s\S]*background:#070907!important/);
});

test('terminal integration preserves existing functional selectors and Vela runtime',()=>{
  for(const selector of ['id="connect-form"','id="connection-vendor"','id="inspect-host-key"','id="sidebar"','id="workspace"','id="action-dialog"','id="disconnect-button"']){
    assert.ok(template.includes(selector),selector+' must remain stable');
  }
  assert.match(template,/access_manager\/js\/runtime\.js/);
  assert.match(template,/access_manager\/js\/shell-ui\.js/);
  assert.match(template,/access_manager\/css\/professional\.css/);
  assert.match(template,/access_manager\/css\/vela-integration\.css/);
});
