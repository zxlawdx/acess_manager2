// Actual Vela Qt WebView and HTTP API; no browser response interception.
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const targets=await(await fetch('http://127.0.0.1:9222/json/list')).json(),target=targets.find(t=>t.url.includes('/__vela__/shell'));assert.ok(target);
 const ws=new WebSocket(target.webSocketDebuggerUrl),pending=new Map(),errors=[];let id=0;
 await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject});
 ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result)}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text)};
 const send=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params}))});
 const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value};
 const wait=async expression=>{for(let i=0;i<120;i++){if(await evaluate(expression))return;await new Promise(r=>setTimeout(r,100))}throw Error('Timeout: '+expression)};
 const click=s=>evaluate(`document.querySelector(${JSON.stringify(s)}).click()`);
 const out='docs/screenshots/support-report';fs.mkdirSync(out,{recursive:true});
 const shot=async name=>{const r=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(`${out}/${name}.png`,Buffer.from(r.data,'base64'))};
 await send('Runtime.enable');await send('Page.enable');await send('Page.reload');await wait("Boolean(document.querySelector('#connect-form'))");
 await evaluate("{const f=document.querySelector('#connect-form');f.elements.host.value='192.0.2.1';f.elements.username.value='synthetic';f.elements.password.value='synthetic-admin-only';f.requestSubmit()}");
 await wait("document.querySelector('#login-page').hidden");
 const navigate=async view=>{await click(`[data-view="${view}"]`);await wait(`window.__amStore.view==='${view}'&&!document.querySelector('#workspace .skeleton')`)};
 const results=[];
 for(const [width,height] of [[1366,768],[1600,900],[1920,1080]]){
  await fetch('http://127.0.0.1:9223/resize',{method:'POST',body:JSON.stringify({width,height})});await wait(`innerWidth===${width}&&innerHeight===${height}`);
  await navigate('triage');await wait("Boolean(document.querySelector('[data-support-start]'))");await shot(`triage-${width}`);for(const [label,name] of [['Clientes Wi-Fi','wifi'],['Portas LAN','lan']]){await evaluate(`(()=>{const s=[...document.querySelectorAll('.support-section summary')].find(e=>e.textContent==='${label}');s.scrollIntoView({block:'start'})})()`);await shot(`${name}-${width}`)}
  await click('[data-support-start]');await evaluate("document.querySelector('#action-dialog [name=attendant]').value='Atendente QA'");await click('[data-start]');await wait("!document.querySelector('#action-dialog').open&&Boolean(document.querySelector('[data-support-finish]'))");
  const initial=await evaluate("fetch('/api/support/current').then(r=>r.json()).then(r=>JSON.stringify(r.initial_snapshot))");
  await navigate('wifi');await wait("Boolean(document.querySelector('[data-edit-ssid]'))");await click('[data-edit-ssid]');await wait("Boolean(document.querySelector('#action-dialog [name=password]'))");
  await evaluate("{const f=document.querySelector('#action-dialog form');f.elements.password.value='QA_NEW_WIFI_'+innerWidth;f.requestSubmit()}");await wait("!document.querySelector('#action-dialog').open");
  await navigate('supportReport');await wait("Boolean(document.querySelector('[data-password-show]'))");
  assert.equal(await evaluate("document.querySelector('#workspace').textContent.includes('QA_NEW_WIFI_')"),false);
  await shot(`report-masked-${width}`);
  await click('[data-password-show][data-password-kind=new]');await wait("document.querySelector('[data-password-kind=new]').textContent==='Ocultar'");
  const g=await evaluate("(()=>{const s=document.querySelector('#sidebar').getBoundingClientRect(),t=document.querySelector('.app-topbar').getBoundingClientRect();return {width:innerWidth,height:innerHeight,sideX:s.x,sideBottom:s.bottom,topY:t.y,horizontal:document.documentElement.scrollWidth>innerWidth,mainOverflow:document.querySelector('.app-main').scrollWidth>document.querySelector('.app-main').clientWidth}})()");
  assert.equal(g.sideX,0);assert.equal(g.topY,0);assert.equal(g.horizontal,false);assert.equal(g.mainOverflow,false);assert.equal(g.sideBottom,height);
  await evaluate("document.querySelector('.support-credential').scrollIntoView({block:'center'})");await shot(`credentials-${width}`);
  await click('[data-support-finish]');await wait("Boolean(document.querySelector('[data-finish]'))");const modal=await evaluate("(()=>{const r=document.querySelector('#action-dialog').getBoundingClientRect();return {x:r.x,width:r.width,y:r.y,bottom:r.bottom}})()");assert.ok(Math.abs(modal.x+modal.width/2-width/2)<2);assert.ok(modal.y>=0&&modal.bottom<=height);await shot(`finish-${width}`);
  await evaluate("document.querySelector('#action-dialog select').value='partially_resolved'");await click('[data-finish]');await wait("!document.querySelector('#action-dialog').open&&document.querySelector('#workspace').textContent.includes('Comparação inicial / final')");
  const validation=await evaluate(`(async()=>{const history=await(await fetch('/api/support/history')).json();const detail=await(await fetch('/api/support/detail',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:history[0].id})})).json();const formats={};for(const format of ['txt','json','html']){const r=await(await fetch('/api/support/export',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:detail.id,format})})).json();formats[format]=r.content.includes('QA_NEW_WIFI_'+innerWidth)&&!r.content.includes('synthetic-admin-only')}return {immutable:JSON.stringify(detail.initial_snapshot)===${JSON.stringify(initial)},status:detail.status,formats}})()`);
  assert.equal(validation.immutable,true);assert.equal(validation.status,'finished');assert.deepEqual(validation.formats,{txt:true,json:true,html:true});
  results.push({...g,...validation});
 }
 const appErrors=errors.filter(e=>!e.includes('tailwind is not defined'));assert.deepEqual(appErrors,[]);
 fs.writeFileSync(`${out}/results.json`,JSON.stringify({environment:'Real Vela Qt WebEngine, synthetic remote router. No physical device or Windows validation.',results,errors:appErrors},null,2));ws.close();console.log(JSON.stringify(results));
})().catch(e=>{console.error(e);process.exitCode=1});
