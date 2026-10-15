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
 const out='docs/screenshots/zte-parity';fs.mkdirSync(out,{recursive:true});
 const shot=async name=>{const r=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(`${out}/${name}.png`,Buffer.from(r.data,'base64'))};
 await send('Runtime.enable');await send('Page.enable');await send('Page.reload');await wait("Boolean(document.querySelector('#connect-form'))");
 await evaluate("{const f=document.querySelector('#connect-form');f.elements.host.value='192.0.2.1';f.elements.username.value='synthetic';f.elements.password.value='synthetic-only';f.requestSubmit()}");
 await wait("document.querySelector('#login-page').hidden&&Boolean(document.querySelector('.topology-root'))");
 await click('[data-view="completeDiagnostics"]');await wait("Boolean(document.querySelector('#complete-runtime'))");await evaluate("document.querySelector('#complete-runtime').closest('details').open=true");await click('#complete-runtime');
 await wait("document.querySelector('#complete-runtime-result').textContent.includes('Scores')");
 const report=await evaluate("fetch('/api/device/runtime/diagnostic').then(r=>r.json())");assert.equal(report.identity.model,'ZXHN H3601P');assert.ok(report.bootstrap_probes.compatibility_scan.endpoints.dns);
 const results=[];
 for(const [width,height] of [[1366,768],[1600,900],[1920,1080]]){
  await fetch('http://127.0.0.1:9223/resize',{method:'POST',body:JSON.stringify({width,height})});await wait(`innerWidth===${width}&&innerHeight===${height}`);
  const pages=[];
  for(const view of ['overview','clients','wifi','wan','lan','dhcpdns','completeDiagnostics','profiles','management']){
   await click(`[data-view="${view}"]`);await new Promise(r=>setTimeout(r,180));await wait("!document.querySelector('#workspace .skeleton')");
   const geometry=await evaluate("(()=>{const box=s=>{const e=document.querySelector(s),r=e.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,overflow:e.scrollWidth-e.clientWidth}};return {top:box('.app-topbar'),side:box('.app-sidebar'),shell:box('.app-shell'),main:box('.app-main'),text:document.querySelector('#workspace').textContent}})()");
   assert.equal(geometry.top.x,0);assert.equal(geometry.top.y,0);assert.equal(geometry.side.x,0);assert.equal(geometry.side.bottom,height);assert.equal(geometry.shell.right,width);assert.ok(geometry.shell.overflow<=1);assert.ok(geometry.main.overflow<=2,view+' overflow');assert.ok(!geometry.text.includes('Capability '));pages.push(view);
   if(view==='wifi'){assert.ok(geometry.text.includes('Canais permitidos'));assert.ok(geometry.text.includes('b,g,n,ax'));await shot(`wifi-${width}`)}
   if(view==='completeDiagnostics'){
    await click('#complete-run');await wait("document.querySelector('#complete-progress').textContent.startsWith('Coleta concluída')");assert.ok(await evaluate("document.querySelector('#complete-channels').textContent.includes('Manual')&&document.querySelector('#complete-channels').textContent.includes('1, 2, 3')"));
    await evaluate("document.querySelector('#complete-channels').closest('section').scrollIntoView({block:'start'})");await shot(`channels-${width}`);
   }
   if(view==='profiles'){
    await click('[data-edit-profile="Synthetic QA"]');await wait("document.querySelectorAll('#profile-radios select').length>=12");
    assert.equal(await evaluate("document.querySelectorAll('[name^=include-ssid]').length"),0);
    const before=await evaluate("(()=>{const d=document.querySelector('.profile-dialog'),r=d.getBoundingClientRect();return {x:r.x,width:r.width,header:d.querySelector('.dialog-header').getBoundingClientRect().y,footer:d.querySelector('.dialog-footer').getBoundingClientRect().y}})()");assert.ok(Math.abs(before.x+before.width/2-width/2)<2);
    await shot(`profiles-${width}`);await evaluate("document.querySelector('.profile-content').scrollTop=10000");
    const after=await evaluate("(()=>{const d=document.querySelector('.profile-dialog');return {header:d.querySelector('.dialog-header').getBoundingClientRect().y,footer:d.querySelector('.dialog-footer').getBoundingClientRect().y,bottom:d.querySelector('.dialog-footer').getBoundingClientRect().bottom}})()");assert.equal(after.header,before.header);assert.equal(after.footer,before.footer);assert.ok(after.bottom<=height);await click('[data-cancel-profile]');
   }
  }
  await click('[data-view="traffic"]');await wait("Boolean(document.querySelector('.traffic-main svg'))");
  await evaluate("{const main=document.querySelector('.app-main');main.style.paddingBottom='1000px';main.scrollTop=120;document.querySelector('#traffic-refresh').focus();window.__pollCheck={main,scroll:main.scrollTop,card:document.querySelector('.traffic-main'),svg:document.querySelector('.traffic-main svg'),focus:document.activeElement}} ");
  await new Promise(r=>setTimeout(r,5300));assert.ok(await evaluate("(()=>{const p=window.__pollCheck;return p.main===document.querySelector('.app-main')&&p.card===document.querySelector('.traffic-main')&&p.svg===document.querySelector('.traffic-main svg')&&p.scroll===p.main.scrollTop&&p.focus===document.activeElement})()"));await evaluate("document.querySelector('.app-main').style.paddingBottom=''");
  results.push({width,height,pages,shellEdges:true,noHorizontalOverflow:true,modalCentered:true,modalFixedActions:true,pollPreservesPageCardSvgScrollFocus:true});console.log(`Vela ${width}x${height}: nine pages, channel analysis, profiles, shell and polling OK`);
 }
 assert.deepEqual(errors.filter(e=>!e.includes('tailwind is not defined')),[]);
 fs.writeFileSync(`${out}/qa.json`,JSON.stringify({runtime:'manage.py runapp / Vela Qt WebEngine',api:'real Bottle endpoints, no browser fetch interception',router:'synthetic structural fixtures',physicalP1Validated:false,results,applicationErrors:[]},null,2));
 await fetch('http://127.0.0.1:9223/close',{method:'POST',body:'{}'}).catch(()=>{});ws.close();
})().catch(e=>{console.error(e);process.exit(1)});
