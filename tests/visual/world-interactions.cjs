const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright'),portable=require('@sparticuz/chromium').default;
const root=path.resolve(__dirname,'../..'),base=path.join(root,'apps/access_manager'),{responses}=require('./fixtures.cjs');
(async()=>{let browser;let disconnected=false;const server=http.createServer((req,res)=>{const url=new URL(req.url,'http://localhost');if(url.pathname.startsWith('/api/')){res.setHeader('Content-Type','application/json');if(url.pathname==='/api/session'&&req.method==='DELETE')disconnected=true;res.end(JSON.stringify(disconnected&&url.pathname==='/api/session'?{connected:false,session:null}:responses[url.pathname]||{}));return;}if(url.pathname==='/'){const html=fs.readFileSync(path.join(base,'templates/index.html'),'utf8').replace(/\{\{ static\('access_manager\/(.*?)'\) \}\}/g,'/assets/$1');res.setHeader('Content-Type','text/html; charset=utf-8');res.end('<!doctype html><html lang="pt-BR"><meta name="viewport" content="width=device-width,initial-scale=1"><body>'+html+'</body></html>');return}const file=path.resolve(base,'static','.'+url.pathname.replace(/^\/assets/,''));if(!file.startsWith(path.join(base,'static')+path.sep)){res.writeHead(404);res.end();return}try{res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript; charset=utf-8':file.endsWith('.css')?'text/css; charset=utf-8':'application/octet-stream');res.end(fs.readFileSync(file))}catch{res.writeHead(404);res.end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));try{
 const executablePath=process.env.ACCESS_MANAGER_CHROMIUM||await portable.executablePath();browser=await chromium.launch({executablePath,args:[...portable.args.filter(a=>!a.includes('use-gl')&&!a.includes('use-angle')),'--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'],env:{...process.env,LD_LIBRARY_PATH:process.env.ACCESS_MANAGER_BROWSER_LIBS||'/tmp/am-chromium'},headless:true});
 const page=await browser.newPage();await page.addInitScript(()=>localStorage.setItem('accessManager.world.quality','low'));const errors=[];page.on('pageerror',e=>{errors.push(e.message);console.error('PAGE ERROR',e.message)});page.on('console',m=>{if(m.type()==='error')console.error(m.text())});let worldRequests=0;page.on('request',req=>{if(req.url().endsWith('world-runtime.js'))worldRequests++});

 if(process.env.ACCESS_MANAGER_QA_CPU_THROTTLE){const cdp=await page.context().newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:Number(process.env.ACCESS_MANAGER_QA_CPU_THROTTLE)});}
 const shots=path.join(root,'docs/qa/world-interactions');
 // CI verifies geometry/contrast and behavior; image recording is a separate optional QA artifact.
 const recordImages=process.env.ACCESS_MANAGER_QA_SCREENSHOTS==='1'||(!process.env.CI&&process.env.ACCESS_MANAGER_QA_SCREENSHOTS!=='0');
 const capture=async name=>{if(recordImages){fs.mkdirSync(shots,{recursive:true});await page.screenshot({path:path.join(shots,name),animations:'disabled',timeout:90000});}};
 const baseURL='http://127.0.0.1:'+server.address().port;
 const nextWorldFrame=()=>page.evaluate(()=>new Promise(resolve=>document.querySelector('#aero-world').addEventListener('world-frame',()=>resolve(),{once:true})));
 const canvas=page.locator('#aero-world>canvas').first();
 await page.goto(baseURL);await page.waitForFunction(()=>window.__amStore?.session?.connected);
 await page.locator('#world-toggle').click();await page.locator('#world-menu[open]').waitFor();
 await page.locator('#world-menu [data-world-close]').click();
 await page.evaluate(()=>document.querySelector('#aero-world').addEventListener('world-frame',e=>window.__worldQA={x:e.detail.player.x,z:e.detail.player.z,combat:e.detail.combat}));
 await page.waitForFunction(()=>document.querySelector('#world-debug').textContent.includes('FPS'));
 await page.locator('#aero-world>canvas').first().dblclick();await page.waitForFunction(()=>Boolean(document.pointerLockElement));await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.pointerLockElement);await page.locator('#world-menu [data-world-close]').click();
 for(const [width,height] of [[1366,768],[1600,900],[1920,1080]]){
  await page.setViewportSize({width,height});
  assert.equal(await page.locator('#aero-world').evaluate(e=>{const r=e.getBoundingClientRect();return r.x===0&&r.y===0&&r.width===innerWidth&&r.height===innerHeight}),true,'world fills the actual app viewport');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.locator('#world-menu-button').click();await page.locator('#world-scene').selectOption('office');
  await page.locator('#world-menu').waitFor({state:'hidden'});await canvas.focus();await nextWorldFrame();
  await page.waitForFunction(()=>document.querySelector('#aero-world').dataset.interaction!==undefined);
  await capture(`office-${width}.png`);
  await page.keyboard.press('KeyH');assert.equal(await page.locator('.app-shell').evaluate(e=>e.classList.contains('world-hud-visible')),true);
  await page.keyboard.press('KeyH');assert.equal(await page.locator('.app-shell').evaluate(e=>e.classList.contains('world-hud-visible')),false);
  await page.locator('#world-menu-button').click();await page.locator('#world-scene').selectOption('arena');
  await page.locator('#world-menu').waitFor({state:'hidden'});await canvas.focus();await nextWorldFrame();
  await page.waitForFunction(()=>!document.querySelector('#world-combat').hidden);
  await capture(`arena-${width}.png`);
  console.log(`${width}x${height}: full viewport, HUD, office, arena and overflow OK`);
 }
 // Actual keyboard combat does not issue any API mutation.
 const mutations=[];page.on('request',r=>{if(new URL(r.url()).pathname.startsWith('/api/')&&r.method()!=='GET')mutations.push(r.url());});
 await page.locator('#world-menu').waitFor({state:'hidden'});await canvas.focus();await page.keyboard.press('KeyR');await nextWorldFrame();
 // Observe simulated movement instead of assuming wall time equals game time on software WebGL.
 await page.keyboard.down('KeyW');try{await page.waitForFunction(()=>window.__worldQA?.z<3.2,null,{timeout:60000});}finally{await page.keyboard.up('KeyW');}
 for(let n=0;n<20&&await page.evaluate(()=>window.__worldQA?.combat?.npcHp===100);n++){await page.keyboard.press('KeyJ');await nextWorldFrame();}
 assert.ok(await page.evaluate(()=>window.__worldQA?.combat?.npcHp<100),'keyboard punch damages the nearby opponent');
 await page.keyboard.press('KeyB');await page.keyboard.press('KeyQ');await page.keyboard.press('KeyK');await page.keyboard.press('KeyT');
 assert.deepEqual(mutations,[]);await page.keyboard.press('KeyR');await page.waitForFunction(()=>document.querySelector('#world-combat').textContent.includes('Roteador 100/100'));
 // A real folder selection (not network URLs), previous/next, repeat, shuffle and progress.
 await page.keyboard.press('KeyM');await page.locator('#world-radio[open]').waitFor();
 const wave=Buffer.alloc(44+44100*2*4);wave.write('RIFF');wave.writeUInt32LE(wave.length-8,4);wave.write('WAVEfmt ',8);wave.writeUInt32LE(16,16);wave.writeUInt16LE(1,20);wave.writeUInt16LE(1,22);wave.writeUInt32LE(44100,24);wave.writeUInt32LE(88200,28);wave.writeUInt16LE(2,32);wave.writeUInt16LE(16,34);wave.write('data',36);wave.writeUInt32LE(wave.length-44,40);
 const folder='/tmp/am-world-music';fs.mkdirSync(folder,{recursive:true});fs.writeFileSync(path.join(folder,'02.wav'),wave);fs.writeFileSync(path.join(folder,'01.wav'),wave);fs.writeFileSync(path.join(folder,'notes.txt'),'ignore');
 await page.locator('#world-remember-music').check();await page.locator('#world-music-folder').setInputFiles(folder);
 await page.waitForFunction(()=>document.querySelectorAll('#world-playlist option').length===2);
 await page.waitForFunction(()=>document.querySelector('#world-radio-track').textContent==='01.wav');
 await page.locator('#world-next').click();await page.waitForFunction(()=>document.querySelector('#world-radio-track').textContent==='02.wav');await page.locator('#world-prev').click();
 await page.locator('#world-repeat').selectOption('track');await page.locator('#world-shuffle').check();await page.locator('#world-radio-volume').fill('0.2');
 assert.equal(await page.locator('#world-radio').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(233, 245, 246)');await capture('playlist-1920.png');
 await page.keyboard.press('Escape');await page.locator('#world-radio').waitFor({state:'hidden'});
 // Dialogue editor stores literal strings and the configured trigger runs on real re-entry.
 await page.locator('#world-menu-button').click();await page.locator('#world-open-dialogue').click();
 await page.locator('#world-lines input[type=text]').first().fill('Vindo trabalhar de novo, law?');await page.locator('#world-lines input[type=text]').first().dispatchEvent('change');
 await page.locator('#world-dialogue-mode').selectOption('sequential');await page.locator('#world-dialogue-cooldown').fill('0');await page.locator('#world-dialogue-cooldown').dispatchEvent('change');
 await page.locator('#world-preview-line').click();assert.equal(await page.locator('#world-line-preview').textContent(),'Vindo trabalhar de novo, law?');
 await capture('dialogue-1920.png');await page.keyboard.press('Escape');
 // Official YouTube API is stubbed only at its external boundary, to make smoke deterministic offline.
 await page.evaluate(()=>{window.YT={Player:class{constructor(el,options){const iframe=document.createElement('iframe');iframe.title='YouTube';el.replaceWith(iframe);this.iframe=iframe;setTimeout(()=>options.events.onReady(),0);}getIframe(){return this.iframe}destroy(){this.iframe.remove()}}};});
 await page.locator('#world-menu-button').click();await page.locator('#world-open-tv').click();await page.locator('#world-youtube-url').fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');await page.locator('#world-tv-form button[type=submit]').click();
 await page.waitForFunction(()=>document.querySelector('#world-tv-status').textContent.includes('Esc volta'));
 assert.equal(await page.locator('#world-tv-player iframe').count(),1);await page.keyboard.press('Escape');await page.waitForFunction(()=>document.querySelectorAll('#world-tv-player iframe').length===0);
 await page.locator('#world-menu-button').click();await page.locator('#world-scene').selectOption('office');
 // Look ahead and walk into interaction distance; E is routed through the central raycast manager.
 await page.locator('#world-menu').waitFor({state:'hidden'});await canvas.focus();await page.keyboard.down('KeyW');try{await page.waitForFunction(()=>window.__worldQA?.z<6.3,null,{timeout:60000});}finally{await page.keyboard.up('KeyW');}
 await page.waitForFunction(()=>document.querySelector('#world-prompt').textContent.includes('Falar com o roteador'));
 await page.keyboard.press('KeyE');assert.ok((await page.locator('#world-speech').textContent()).includes('PPPoE'));
 await page.keyboard.down('KeyA');await page.waitForFunction(()=>window.__worldQA?.x< -3.8);await page.keyboard.up('KeyA');await page.keyboard.down('KeyW');await page.waitForFunction(()=>window.__worldQA?.z<4.7);await page.keyboard.up('KeyW');await page.waitForFunction(()=>document.querySelector('#world-prompt').textContent.includes('Usar computador'));await page.keyboard.press('KeyE');await page.waitForFunction(()=>document.querySelector('.app-shell').classList.contains('world-panel-open'));await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('.app-shell').classList.contains('world-panel-open'));
 await page.locator('#world-menu-button').click();await page.locator('#world-return-interface').click();assert.equal(await page.locator('#aero-world').isHidden(),true);
 await page.locator('#world-toggle').click();await page.waitForFunction(()=>document.querySelector('.app-shell').classList.contains('world-mode'));await page.waitForFunction(()=>document.querySelector('#world-speech').textContent.includes('Vindo trabalhar de novo, law?'));
 // Persisted library survives reload without autoplay; clear removes the local blobs.
 await page.reload();await page.waitForFunction(()=>window.__amStore?.session?.connected);await page.waitForFunction(()=>document.querySelectorAll('#world-playlist option').length===2);
 assert.equal(await page.locator('#world-play').textContent(),'Reproduzir');
 if(!await page.locator('.app-shell').evaluate(e=>e.classList.contains('world-mode')))await page.locator('#world-toggle').click();
 await page.locator('#world-menu-button').click();await page.locator('#world-open-music').click();await page.locator('#world-forget-music').click();assert.equal(await page.locator('#world-playlist option').count(),0);
 // Lost WebGL context returns safely to the normal interface.
 await page.keyboard.press('Escape');await page.locator('#aero-world>canvas').first().evaluate(el=>el.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());await page.waitForFunction(()=>!document.querySelector('.app-shell').classList.contains('world-mode'));
 await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){if(/webgl/.test(type))return null;return original.call(this,type,...args);};localStorage.setItem('accessManager.experience','interface');});await page.reload();await page.waitForFunction(()=>window.__amStore?.session?.connected);await page.locator('#world-toggle').click();await page.waitForFunction(()=>!document.querySelector('#world-notice').hidden);assert.equal(await page.locator('#aero-world').isHidden(),true);
 assert.deepEqual(errors.filter(e=>!e.includes('Error creating WebGL context')),[]);console.log('Raycast E, local folder playlist, IndexedDB, dialogue, TV focus, combat isolation, reset and exit OK');
 }finally{await browser?.close();await new Promise(r=>server.close(r))}})().catch(e=>{console.error(e);process.exitCode=1});
