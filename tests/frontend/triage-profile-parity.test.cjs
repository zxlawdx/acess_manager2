const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const overview=fs.readFileSync('apps/access_manager/static/js/workspaces/views/overview.js','utf8');
const profiles=fs.readFileSync('apps/access_manager/static/js/workspaces/views/profiles.js','utf8');
const api=fs.readFileSync('apps/access_manager/static/js/services/api.js','utf8');

test('overview triage reuses the dashboard snapshot instead of adding a triage poller',()=>{
  assert.match(overview,/const snapshot=/);
  assert.match(overview,/store\.setSnapshot\(snapshot\)/);
  assert.match(overview,/request\('\/api\/triage'/);
  assert.equal((overview.match(/\/api\/triage/g)||[]).length,1);
  assert.match(overview,/\/api\/device\/lan/);
  assert.match(overview,/\/api\/device\/dns/);
  assert.match(overview,/data-triage-complete/);
  assert.match(api,/'\/api\/profiles\/capture','\/api\/triage'/);
});

test('standard configuration exposes capture, attendant state and full wifi/dns fields',()=>{
  for(const token of ['CAPTURAR ATUAL','/api/profiles/capture','/api/profiles/active','beacon_interval','sgi','domain_name','ipv4_1','ipv4_2','ipv6_1','ipv6_2','band_steering','rts_cts']){
    assert.ok(profiles.includes(token),`missing ${token}`);
  }
  assert.match(profiles,/Resultado da aplicação/);
  assert.match(profiles,/result\.steps/);
});
