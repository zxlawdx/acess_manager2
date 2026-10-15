// Raw CDP works with Qt WebEngine, which lacks Playwright's browser-context API.
const assert=require('node:assert/strict'),fs=require('node:fs');
const {responses,caps}=require('./fixtures.cjs');
const baseline=process.env.ACCESS_MANAGER_BASELINE?fs.readFileSync(process.env.ACCESS_MANAGER_BASELINE,'utf8'):null;
const data={...responses,'/api/device/wifi':{networks:[{id:'1',ssid:'IndividualMustNotAppear'}],radios:['2.4GHz','5GHz'].map((b,i)=>({banda:b,canal:i?'36':'6',largura:'20',padrao:'Observed',potencia:'100',pais:'BR',canal_automatico:false,options:{channel:[{value:i?'36':'6',label:i?'36':'6'}],bandwidth:[{value:'20',label:'20 MHz'}],standard:[{value:'Observed',label:'Padrão observado'}],tx_power:[{value:'100',label:'100%'}],country:[{value:'BR',label:'Brasil'}]}}))}};
data['/api/device/wifi/ssids']=data['/api/device/wifi'].networks;data['/api/device/wifi/radios']=data['/api/device/wifi'].radios;
data['/api/session']={connected:true,session:{...responses['/api/session'].session,capabilities:{...caps,dhcp:{read:'SUPPORTED',write:'SUPPORTED',enabled:{read:true,write:true}}}}};
Object.assign(data,JSON.parse(require('node:child_process').execFileSync(process.env.PYTHON||'python',['tests/visual/h3601p-fixture.py'],{encoding:'utf8'})));
(async()=>{const targets=await (await fetch('http://127.0.0.1:9222/json/list')).json(),target=targets.find(p=>p.url.includes('/__vela__/shell'));assert.ok(target,'real Vela shell target');const ws=new WebSocket(target.webSocketDebuggerUrl),pending=new Map(),errors=[];let id=0;await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j});ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);if(m.error)p.reject(Error(JSON.stringify(m.error)));else p.resolve(m.result)}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text)};
const send=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params}))});
const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value};
const wait=async expression=>{for(let i=0;i<100;i++){if(await evaluate(expression))return;await new Promise(r=>setTimeout(r,100))}throw Error('Timeout: '+expression)};
const click=async selector=>evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
const screenshot=async name=>{const r=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(`docs/screenshots/zte-h3601p/${name}.png`,Buffer.from(r.data,'base64'))};
await send('Runtime.enable');await send('Page.enable');const injection=await send('Page.addScriptToEvaluateOnNewDocument',{source:`{const data=${JSON.stringify(data)},baseline=${JSON.stringify(baseline)},realFetch=window.fetch.bind(window);window.__qaRequests=[];window.__qaAborts=0;if(baseline){const append=Element.prototype.appendChild;Element.prototype.appendChild=function(node){if(node.tagName==='SCRIPT'&&node.src.endsWith('/runtime.js')){node.removeAttribute('src');node.textContent=baseline}return append.call(this,node)}}window.fetch=(url,opts)=>{const path=new URL(url,location.href).pathname;if(!path.startsWith('/api/'))return realFetch(url,opts);window.__qaRequests.push(path);if(path==='/api/session'&&opts?.method==='DELETE')window.__qaDisconnected=true;if(path==='/api/session'&&opts?.method==='POST')window.__qaDisconnected=false;opts?.signal?.addEventListener('abort',()=>window.__qaAborts++);return new Promise(resolve=>setTimeout(()=>resolve(new Response(JSON.stringify(path==='/api/session'&&window.__qaDisconnected?{connected:false,session:null}:data[path]||{}),{headers:{'Content-Type':'application/json'}})),window.__qaDelay?.[path]||0))}}`});await send('Page.reload');await wait("Boolean(document.querySelector('.topology-root'))");fs.mkdirSync('docs/screenshots/zte-h3601p',{recursive:true});

for(const [width,height] of [[1366,768],[1600,900],[1920,1080]]){
 await fetch('http://127.0.0.1:9223/resize',{method:'POST',body:JSON.stringify({width,height})});await wait(`innerWidth===${width}&&innerHeight===${height}`);
 for(const view of ['overview','clients','lan','wifi','wan']){
  await click(`[data-view="${view}"]`);await new Promise(r=>setTimeout(r,200));
  if(view==='overview'){await wait("Boolean(document.querySelector('.topology-root'))");assert.equal(await evaluate("document.querySelectorAll('[data-overview-optical]').length"),0);assert.equal(await evaluate("window.__qaRequests.includes('/api/device/optical')"),false)}
  if(view==='clients'){await wait("document.querySelectorAll('#client-results [data-client]').length===2");assert.ok(await evaluate("document.querySelector('#client-results').textContent.includes('fe80::1')"))}
  if(view==='lan')assert.equal(await evaluate("document.querySelectorAll('#workspace tbody tr').length"),2);
  assert.ok(await evaluate("document.querySelector('.app-main').scrollWidth<=document.querySelector('.app-main').clientWidth+2"));
  await screenshot(`${view}-${width}`);
 }
 console.log(`H3601P ${width}×${height}: normalized provider fixtures, IPv6, 2 LAN, no optical requests OK`);
}
assert.deepEqual(errors.filter(e=>!e.includes('tailwind is not defined')),[]);
console.log('Vela/Qt real; synthetic protocol fixtures; no physical router validation.');ws.close();
})().catch(e=>{console.error(e);process.exit(1)});
