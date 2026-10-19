const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');

const read=path=>fs.readFileSync(path,'utf8');

test('shared clipboard client writes only through the desktop API',()=>{
  const text=read('apps/access_manager/static/js/shared/clipboard.js');
  assert.match(text,/\/api\/system\/clipboard/);
  assert.doesNotMatch(text,/navigator\.clipboard|execCommand/);
});

test('service and Wi-Fi copy buttons bypass QtWebEngine clipboard ownership',()=>{
  const service=read('apps/access_manager/static/js/service/panel.js');
  const wifi=read('apps/access_manager/static/js/workspaces/views/wifi.js');
  for(const text of [service,wifi]){
    assert.match(text,/copyText/);
    assert.doesNotMatch(text,/navigator\.clipboard|execCommand/);
  }
});

test('Juniper copy buttons are intercepted before the legacy QtWebEngine handler',()=>{
  const text=read('apps/access_manager/static/js/shell-ui.js');
  assert.match(text,/\[data-copy-juniper\]/);
  assert.match(text,/stopImmediatePropagation\(\)/);
  assert.match(text,/\/api\/system\/clipboard/);
  assert.match(text,/copyThroughDesktopBackend/);
});
