// Real Vela HTTP bootstrap QA; only router transport is synthetic.
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{const targets=await (await fetch('http://127.0.0.1:9222/json/list')).json(),target=targets.find(p=>p.url.includes('/__vela__/shell'));assert.ok(target,'real Vela shell target');const ws=new WebSocket(target.webSocketDebuggerUrl),pending=new Map(),errors=[];let id=0;await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j});ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);if(m.error)p.reject(Error(JSON.stringify(m.error)));else p.resolve(m.result)}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text)};
const send=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params}))});
const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value};
const wait=async expression=>{for(let i=0;i<100;i++){if(await evaluate(expression))return;await new Promise(r=>setTimeout(r,100))}throw Error('Timeout: '+expression)};
const click=async selector=>evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);

fs.mkdirSync('docs/screenshots/zte-bootstrap',{recursive:true});
const screenshot=async name=>{const r=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(`docs/screenshots/zte-bootstrap/${name}.png`,Buffer.from(r.data,'base64'))};
await send('Runtime.enable');await send('Page.enable');await send('Page.reload');
await wait("Boolean(document.querySelector('#connect-form'))");
const login=async username=>{await evaluate(`{const f=document.querySelector('#connect-form');f.elements.host.value='192.0.2.1';f.elements.username.value=${JSON.stringify(username)};f.elements.password.value='synthetic-only';f.requestSubmit()}`)};
await login('signature');await wait("document.querySelector('#login-page').hidden&&Boolean(document.querySelector('.topology-root'))");
const report=await evaluate("fetch('/api/device/runtime/diagnostic').then(r=>r.json())");assert.equal(report.authentication,'success');assert.equal(report.bootstrap_probes.statusMgr_view.status,'http_404');assert.equal(report.profile_selection.source,'endpoint_signature');assert.equal(report.identity.model,'ZTE');
const results=[];
for(const [width,height] of [[1366,768],[1600,900],[1920,1080]]){
 await fetch('http://127.0.0.1:9223/resize',{method:'POST',body:JSON.stringify({width,height})});await wait(`innerWidth===${width}&&innerHeight===${height}`);
 await click('[data-view="overview"]');await wait("Boolean(document.querySelector('.topology-root'))");await screenshot(`connected-overview-${width}`);
 await click('[data-view="clients"]');await wait("document.querySelectorAll('#client-results [data-client]').length===2");
 assert.ok(await evaluate("document.querySelector('#client-results').textContent.includes('fe80::1')"));
 assert.equal(await evaluate("document.querySelector('#device-model')?.textContent||window.__amStore.session.session.model"),'ZTE');
 assert.ok(await evaluate("document.querySelector('.app-main').scrollWidth<=document.querySelector('.app-main').clientWidth+2"));
 await screenshot(`connected-clients-${width}`);results.push({width,height,connected:true,clients:2});console.log(`Bootstrap Vela ${width}×${height}: real POST /session, GET /device/clients, IPv6, no false identity OK`);
}
await click('#disconnect-button');await wait("!document.querySelector('#login-page').hidden");
await login('unknown');await wait("document.querySelector('#login-page').hidden");
const unknown=await evaluate("fetch('/api/session').then(r=>r.json())");assert.equal(unknown.connected,true);assert.equal(unknown.session.mode,'deployment');assert.equal(unknown.session.model,'ZTE');assert.equal(unknown.session.metadata.authenticated,true);
const device=await evaluate("fetch('/api/device').then(r=>r.json())");assert.equal(device.model,'ZTE');assert.equal(device.advanced.device_status_available,false);await screenshot('authenticated-unknown');
await click('#disconnect-button');await wait("!document.querySelector('#login-page').hidden");
await login('rejected');await wait("document.querySelector('#connection-feedback').textContent.includes('autenticação')");assert.equal(await evaluate("document.querySelector('#login-page').hidden"),false);
assert.deepEqual(errors.filter(e=>!e.includes('tailwind is not defined')),[]);
console.log('Unknown session stays connected; actual authentication failure remains rejected. No application JS exceptions.');
fs.writeFileSync('docs/screenshots/zte-bootstrap/qa.json',JSON.stringify({api:'real Vela/Bottle, no fetch interception',router:'synthetic transport fixtures',results,unknownConnected:true,authenticationRejected:true,physicalP1CorrectionTest:false},null,2));
await fetch('http://127.0.0.1:9223/close',{method:'POST',body:'{}'}).catch(()=>{});ws.close();
})().catch(e=>{console.error(e);process.exit(1)});
