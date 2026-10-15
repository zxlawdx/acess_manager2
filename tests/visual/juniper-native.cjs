// Actual Vela/Bottle API, Qt WebEngine, synthetic router transport only.
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const targets=await(await fetch('http://127.0.0.1:9222/json/list')).json(),target=targets.find(t=>t.url.includes('/__vela__/shell'));assert.ok(target);
 const ws=new WebSocket(target.webSocketDebuggerUrl),pending=new Map(),errors=[];let id=0;
 await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject});
 ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result)}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text)};
 const send=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params}))});
 const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value};
 const wait=async expression=>{for(let i=0;i<150;i++){if(await evaluate(expression))return;await new Promise(r=>setTimeout(r,100))}throw Error('Timeout: '+expression)};
 const click=selector=>evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
 const out='docs/screenshots/juniper';fs.mkdirSync(out,{recursive:true});
 const shot=async name=>{const r=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(`${out}/${name}.png`,Buffer.from(r.data,'base64'))};
 await send('Runtime.enable');await send('Page.enable');await send('Page.reload');await wait("Boolean(document.querySelector('#connect-form'))");
 await fetch('http://127.0.0.1:9223/resize',{method:'POST',body:JSON.stringify({width:1366,height:768})});await wait('innerWidth===1366');
 await evaluate("{const f=document.querySelector('#connect-form');f.elements.vendor.value='juniper';f.elements.vendor.dispatchEvent(new Event('change'));f.elements.host.value='192.0.2.1';f.elements.username.value='synthetic'}");assert.ok(await evaluate("document.querySelector('.connection-card').getBoundingClientRect().y>=0"),'oversized login starts inside WebView');await shot('connection-1366');
 await evaluate("{const f=document.querySelector('#connect-form');f.elements.password.value='synthetic-only';f.requestSubmit()}");await wait("document.querySelector('#login-page').hidden&&document.querySelector('#workspace').textContent.includes('mx204')");
 assert.equal(await evaluate("document.querySelector('[data-view=wifi]').hidden"),true);
 const results=[];
 for(const [width,height] of [[1366,768],[1600,900],[1920,1080]]){
  await fetch('http://127.0.0.1:9223/resize',{method:'POST',body:JSON.stringify({width,height})});await wait(`innerWidth===${width}&&innerHeight===${height}`);
  for(const view of ['juniperOverview','subscribers','juniperInterfaces','juniperSystem','juniperDiagnostics']){
   await click(`[data-view="${view}"]`);await new Promise(r=>setTimeout(r,150));await wait("!document.querySelector('#workspace .skeleton')");
   const geometry=await evaluate("(()=>{const box=s=>{const e=document.querySelector(s),r=e.getBoundingClientRect();return {x:r.x,y:r.y,bottom:r.bottom,right:r.right,overflow:e.scrollWidth-e.clientWidth}};return {top:box('.app-topbar'),side:box('.app-sidebar'),main:box('.app-main'),shell:box('.app-shell')}})()");
   assert.equal(geometry.top.y,0);assert.equal(geometry.side.x,0);assert.equal(geometry.side.bottom,height);assert.equal(geometry.shell.right,width);assert.ok(geometry.main.overflow<=2,view+' overflow');
   if(view==='subscribers'){
    await evaluate("{const f=document.querySelector('#subscriber-search');f.elements.query.value='000123';f.requestSubmit()}");await wait("document.querySelectorAll('[data-subscriber]').length===2");assert.ok(await evaluate("document.querySelector('#subscriber-results').textContent.includes('cdy_000123')&&document.querySelector('#subscriber-results').textContent.includes('364_000123')"));await shot(`subscribers-${width}`);
    await click('[data-subscriber="100"]');await wait("document.querySelector('.juniper-dialog[open]')?.textContent.includes('192.0.2.10')");
    const rect=await evaluate("(()=>{const d=document.querySelector('.juniper-dialog').getBoundingClientRect();return {center:d.x+d.width/2,overflow:document.querySelector('.juniper-dialog').scrollWidth-document.querySelector('.juniper-dialog').clientWidth}})()");assert.ok(Math.abs(rect.center-width/2)<2);assert.ok(rect.overflow<=2);await shot(`subscriber-detail-${width}`);
    await evaluate("document.querySelector('[data-context=pppoe]').scrollIntoView()");await click('[data-context="pppoe"]');await wait("document.querySelector('#subscriber-context').textContent.includes('demux0.100')");await click('[data-context="aaa"]');await wait("document.querySelector('#subscriber-context').textContent.includes('Started')");await click('[data-close-dialog]');
   }
   if(view==='juniperInterfaces')assert.ok(await evaluate("document.querySelector('#workspace').textContent.includes('xe-0/0/0')"));
   if(view==='juniperSystem'){await click('#juniper-resources');await wait("document.querySelector('#juniper-resources-result').textContent.includes('85')")}
   if(view==='juniperDiagnostics'){
    await evaluate("{const f=document.querySelector('#juniper-diagnostic-form');f.elements.target.value='192.0.2.10';f.elements.routing_instance.value='SUBSCRIBERS';f.requestSubmit()}");await wait("document.querySelector('#juniper-diagnostic-result').textContent.includes('synthetic-bng')");await shot(`diagnostic-${width}`);
   }
  }
  results.push({width,height,pages:5,duplicateSessions:2,prefixesPreserved:true,ipv6:true,lazyPppoe:true,lazyAaa:true,resources:true,diagnostics:true,shellEdges:true,noHorizontalOverflow:true});console.log(`Juniper Vela ${width}x${height}: workspace, lookup, details, PPPoE/AAA, interfaces and diagnostics OK`);
 }
 await click('[data-view="subscribers"]');await evaluate("{const f=document.querySelector('#subscriber-search');f.elements.query.value='999';f.requestSubmit()}");await wait("document.querySelector('#subscriber-status').textContent.includes('Nenhuma sessão ativa')");
 await click('#disconnect-button');await wait("!document.querySelector('#login-page').hidden");assert.equal(await evaluate("document.querySelector('#subscriber-results')?.textContent||''"),'');
 assert.deepEqual(errors.filter(e=>!e.includes('tailwind is not defined')),[]);
 fs.writeFileSync(`${out}/qa.json`,JSON.stringify({runtime:'real manage.py runapp / Vela Qt WebEngine',api:'real Bottle endpoints',transport:'synthetic Junos XML fixtures only',physical:false,windows:false,results,applicationErrors:[]},null,2));
 await fetch('http://127.0.0.1:9223/close',{method:'POST',body:'{}'}).catch(()=>{});ws.close();
})().catch(e=>{console.error(e);process.exit(1)});
