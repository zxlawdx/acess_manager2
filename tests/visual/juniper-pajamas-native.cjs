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
 const out='docs/screenshots/juniper-pajamas';fs.mkdirSync(out,{recursive:true});
 const shot=async name=>{const r=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(`${out}/${name}.png`,Buffer.from(r.data,'base64'))};
 await send('Runtime.enable');await send('Page.enable');await send('Page.reload');await wait("Boolean(document.querySelector('#connect-form'))");
 await evaluate("{const f=document.querySelector('#connect-form');f.elements.vendor.value='juniper';f.elements.vendor.dispatchEvent(new Event('change'));f.elements.host.value='192.0.2.1';f.elements.username.value='synthetic';f.elements.password.value='synthetic-only';f.requestSubmit()}");
 await wait("document.querySelector('.juniper-shell')&&!document.querySelector('#workspace .skeleton')&&document.querySelector('#workspace').textContent.includes('mx204')");
 const results=[];
 const navigate=async route=>{await evaluate(`(()=>{const b=document.querySelector('[data-view="${route}"]'),group=b.closest('details');if(!group.open)group.querySelector('summary').click();b.scrollIntoView({block:'nearest'})})()`);await click(`[data-view="${route}"]`);await wait(`window.__amStore.view==='${route}'&&!document.querySelector('#workspace .skeleton')`);await new Promise(r=>setTimeout(r,100))};
 for(const [width,height] of [[1366,768],[1600,900],[1920,1080]]){
  await fetch('http://127.0.0.1:9223/resize',{method:'POST',body:JSON.stringify({width,height})});await wait(`innerWidth===${width}&&innerHeight===${height}`);
  await navigate('juniperOverview');await shot(`overview-${width}`);
  await click('[data-j-identity]');await wait("document.querySelector('#action-dialog[open]')?.textContent.includes('SYNTHETIC-UI-ONLY')");
  assert.ok(await evaluate("document.querySelector('#action-dialog').textContent.includes('192.0.2.1')"));
  const modal=await evaluate("(()=>{const r=document.querySelector('#action-dialog').getBoundingClientRect();return {x:r.x,width:r.width}})()");assert.ok(Math.abs(modal.x+modal.width/2-width/2)<2);await shot(`host-key-${width}`);await click('[data-close-dialog]');
  await navigate('subscribers');await evaluate("{const f=document.querySelector('#subscriber-search');f.elements.query.value='000123';f.requestSubmit()}");await wait("document.querySelectorAll('[data-subscriber]').length===2");
  await click('[data-subscriber="100"]');await wait("document.querySelector('#subscriber-detail').textContent.includes('192.0.2.10')");assert.equal(await evaluate("document.querySelector('#action-dialog').open"),false);
  await shot(`search-detail-${width}`);
  await click('[data-side-tab=network]');assert.ok(await evaluate("document.querySelector('#subscriber-detail').textContent.includes('demux0.100')"));await click('[data-side-tab=details]');
  await click('[data-toggle-filters]');assert.equal(await evaluate("document.querySelector('#subscriber-filters').hidden"),false);
  await click('[data-access-cpe]');await wait("document.querySelector('.j-drawer[open]')&&document.querySelector('#cpe-handoff')");
  const drawer=await evaluate("(()=>{const r=document.querySelector('.j-drawer').getBoundingClientRect();return {right:r.right,width:r.width,bottom:r.bottom}})()");assert.equal(drawer.right,width);assert.ok(drawer.width<=440);assert.equal(drawer.bottom,height);
  assert.equal(await evaluate("document.querySelector('#cpe-handoff').elements.password.value"),'');await shot(`cpe-drawer-${width}`);
  await evaluate("{const f=document.querySelector('#cpe-handoff');f.elements.vendor.value='zte';f.elements.username.value='synthetic-cpe';f.elements.password.value='synthetic-only';f.requestSubmit()}");await wait("window.__amStore.session?.session?.vendor==='zte'");assert.equal(await evaluate("window.__amStore.session.infrastructure.connected"),true);
  await click('#return-subscriber');await wait("window.__amStore.session.session.vendor==='juniper'&&document.querySelector('#subscriber-detail')?.textContent.includes('brd_000123')");
  const routes=await evaluate("Array.from(document.querySelectorAll('.nav[data-juniper-nav]')).map(b=>b.dataset.view)");
  const checks=[];
  for(const route of routes){
   await navigate(route);assert.ok(await evaluate("document.querySelector('#workspace').textContent.trim().length>0"));
   assert.equal(await evaluate(`document.querySelector('[data-view="${route}"]').closest('details').open`),true);
   assert.equal(await evaluate(`document.querySelector('[data-view="${route}"]').getAttribute('aria-current')`),'page');
   const geometry=await evaluate("(()=>{const box=s=>{const e=document.querySelector(s),r=e.getBoundingClientRect();return {x:r.x,y:r.y,bottom:r.bottom,right:r.right,overflow:e.scrollWidth-e.clientWidth}};return {top:box('.app-topbar'),side:box('.app-sidebar'),main:box('.app-main'),shell:box('.app-shell')}})()");
   assert.equal(geometry.top.y,0);assert.equal(geometry.side.x,0);assert.equal(geometry.side.bottom,height);assert.equal(geometry.shell.right,width);assert.ok(geometry.main.overflow<=2,route+' horizontal shell overflow');
   assert.ok(!await evaluate("Boolean(document.querySelector('#workspace [role=alert]'))"),route+' reader error');
   if(['juniperInterfaces','juniperOptics','juniperLacp'].includes(route)){
    await click('[data-junos-interface]');await wait("document.querySelector('.j-drawer[open]')");await shot(`${route}-${width}`);await click('[data-close-dialog]');
   }
   if(route==='juniperDiagnostics'){
    await evaluate("{const f=document.querySelector('#juniper-diagnostic-form');f.elements.target.value='192.0.2.10';f.requestSubmit()}");await wait("document.querySelector('#juniper-diagnostic-result').textContent.includes('synthetic-bng')");await shot(`diagnostics-${width}`);
   }
   if(['juniperSubscriber','juniperRadius','juniperSystem','juniperAccounting','juniperServices'].includes(route))await shot(`${route}-${width}`);
   checks.push({route,navigation:true,content:true,readerError:false,shellEdges:true,noShellHorizontalOverflow:true});
  }
  results.push({width,height,routes:checks,inlineDetail:true,cpeDrawer:true,hostKeyModalCentered:true,independentSessions:true,subscriberPreserved:true});console.log(`Pajamas Vela ${width}x${height}: ${routes.length} routes, details, CPE handoff, host key and shell OK`);
 }
 assert.deepEqual(errors.filter(e=>!e.includes('tailwind is not defined')),[]);
 fs.writeFileSync(`${out}/qa.json`,JSON.stringify({runtime:'real manage.py runapp / Vela Qt WebEngine / Bottle',remoteTransports:'synthetic Junos and ZTE only; synthetic host-key inspection for UI',physical:false,windows:false,results,applicationErrors:[]},null,2));
 await fetch('http://127.0.0.1:9223/close',{method:'POST',body:'{}'}).catch(()=>{});ws.close();
})().catch(e=>{console.error(e);process.exit(1)});
