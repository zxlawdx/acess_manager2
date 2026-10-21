const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'../..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const tokens=read('apps/access_manager/static/css/tokens.css');
const terminal=read('apps/access_manager/static/css/professional.css');
const vela=read('apps/access_manager/static/css/vela-integration.css');
const regressions=read('apps/access_manager/static/css/regressions.css');
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
  assert.match(vela,/\.infrastructure-surface\{[\s\S]*position:fixed!important/);
  assert.match(vela,/\.infrastructure-surface\{[\s\S]*transform:translate\(-50%,-50%\)!important/);
  assert.match(vela,/\.infrastructure-surface \.j-trust-alert\{[\s\S]*background:var\(--am-primary-soft\)!important/);
  assert.match(vela,/\.infrastructure-surface \.j-kv>div\{[\s\S]*grid-template-columns:minmax\(150px,\.72fr\) minmax\(0,1\.28fr\)!important/);
  assert.match(vela,/\.infrastructure-surface \.j-kv dd\{[\s\S]*word-break:break-all!important/);
  assert.match(vela,/\.infrastructure-surface \.dialog-footer\{[\s\S]*background:#070907!important/);
});

test('Juniper login resets the legacy 540px cap and collapses before fields clip',()=>{
  assert.match(regressions,/#login-page\.infrastructure-login \.connection-card\{[\s\S]*max-width:1080px!important/);
  assert.match(regressions,/#login-page\.infrastructure-login \.connection-card\{[\s\S]*grid-template-columns:minmax\(420px,1\.08fr\) minmax\(320px,\.92fr\)!important/);
  assert.match(regressions,/@media \(max-width:1100px\), \(max-height:820px\)\{[\s\S]*max-width:760px!important[\s\S]*grid-template-columns:minmax\(0,1fr\)!important/);
  assert.match(regressions,/@media \(max-width:1100px\), \(max-height:820px\)\{[\s\S]*\.connection-visual\{[\s\S]*display:none!important/);
  assert.match(regressions,/@media \(max-width:620px\)\{[\s\S]*\.password-field\{[\s\S]*display:grid!important/);
});

test('Matrix canvas stays out of login layout flow and cannot create phantom scrolling',()=>{
  assert.match(regressions,/#matrix-bg\{[\s\S]*position:absolute!important/);
  assert.match(regressions,/#matrix-bg\{[\s\S]*inset:0!important/);
  assert.match(regressions,/#login-page > :not\(#matrix-bg\)/);
  assert.doesNotMatch(regressions,/#login-page > \*,\s*\.connection-card > \*,\s*\.app-wrapper > \*/);
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
