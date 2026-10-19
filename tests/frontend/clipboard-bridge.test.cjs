const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');

test('Juniper copy buttons are intercepted before QtWebEngine clipboard handlers',()=>{
  const text=fs.readFileSync('apps/access_manager/static/js/shell-ui.js','utf8');
  assert.match(text,/\[data-copy-juniper\]/);
  assert.match(text,/stopImmediatePropagation\(\)/);
  assert.match(text,/\/api\/system\/clipboard/);
  assert.match(text,/copyThroughDesktopBackend/);
});
