import {service,subscribeService} from '../service/model.js';
import {withFieldRegions} from '../wasteland/metadata.js';
import {FieldAudio} from '../wasteland/audio.js';
import {deriveWorldRegions} from './regions.js';
import {readPreference,savePreference} from '../ui/theme.js';
import {minimapGlyph as glyphs} from './icon-metadata.js';
import {AudioManager} from './audio.js';

export function mountWorldBridge({store,theme,registry,navigate,suspend,resume}){
 const shell=document.querySelector('.app-shell'),host=document.querySelector('#aero-world');if(!host)return;
 const button=document.querySelector('#world-toggle'),close=document.querySelector('#world-close-panel'),notice=document.querySelector('#world-notice');
 const experience=document.querySelector('#world-experience');let mode='world3d',namespace=null;
 const cache=new Map();let world=null,loading=null,entering=false,generation=0,active=false,panel=false,contextKey='',signature='',currentRegions=[];
 const getContext=()=>store.session?.session;const key=()=>`${mode}:${getContext()?.vendor||'router'}:${getContext()?.session_id||'session'}`; // Memory only; never persisted by IP.
 const unavailable=message=>{notice.textContent=message;notice.hidden=!message};
 let musicActive=false;
 const updateSound=()=>{document.querySelector('#world-music').setAttribute('aria-pressed',String(musicActive||ambient.active));document.querySelector('#world-ambient').setAttribute('aria-pressed',String(ambient.active));document.querySelector('#world-music').textContent=musicActive||ambient.active?'♪ Silenciar tudo':'♪ Reproduzir';document.querySelector('#world-ambient').textContent=ambient.active?'Ambiente: ligado':'Ambiente: desligado'};
 const ambient=new FieldAudio({volume:readPreference('volume','.35'),onChange:updateSound});
 const audio=new AudioManager({volume:readPreference('volume','.35'),enabled:readPreference('enabled','false')==='true',onChange:state=>{
  musicActive=state.active;document.querySelector('#world-track').textContent=state.title;document.querySelector('#world-music').textContent=state.active?'♪ Silenciar':'♪ Reproduzir';document.querySelector('#world-music').setAttribute('aria-pressed',String(state.active||ambient.active));updateSound();
 }});
 function closePanel(){if(!active||!panel)return;document.querySelector('#action-dialog')?.close();panel=false;shell.classList.remove('world-panel-open');close.hidden=true;refreshContext();suspend();world?.setPaused(false);}
 async function openPanel(region){
  if(!active||!currentRegions.some(r=>r.id===region.id))return;if(region.interactionType==='service'){document.dispatchEvent(new CustomEvent('open-service'));return;}panel=true;shell.classList.add('world-panel-open');close.hidden=false;world.setPaused(true);const source=key();await navigate(region.routeId);
  if(source!==key()||!active)return;
  if(region.actionId){const action=registry.flatMap(r=>r.actions||[]).find(a=>a.id===region.actionId);if(action?.available())try{await action.run()}catch(error){unavailable(error.message)}}
  close.focus();
 }
 function load(){const name=mode==='wasteland'?'AccessManagerWasteland':mode==='voxel'?'AccessManagerVoxel':'AccessManagerWorld';if(window[name])return Promise.resolve(window[name]);if(loading)return loading;loading=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=mode==='wasteland'?host.dataset.wastelandBundle:mode==='voxel'?host.dataset.voxelBundle:host.dataset.bundle;script.onload=()=>window[name]?resolve(window[name]):reject(new Error('Renderer indisponível'));script.onerror=()=>{script.remove();reject(new Error('Não foi possível carregar o módulo 3D local.'))};document.head.append(script)}).finally(()=>loading=null);return loading;}
 function remember(){if(world&&contextKey)cache.set(contextKey,world.getState());}
 function refreshContext(){
  if(!store.session?.connected)return;
  const regions=withFieldRegions(deriveWorldRegions(registry,getContext(),store.capabilities),mode),next=key(),nextSignature=JSON.stringify(regions);
  if(next===contextKey&&nextSignature===signature)return;
  currentRegions=regions;host.dataset.layout=getContext()?.vendor==='juniper'?'juniper':'router';host.dataset.regionCount=String(regions.length);document.querySelector('#world-context-label').textContent=host.dataset.layout==='juniper'?'Backbone, BNG e assinantes':mode==='wasteland'?'Postos, enlaces e operações':'Natureza, internet e telecom';
  if(world&&next!==contextKey){remember();world.dispose();world=null;}
  contextKey=next;signature=nextSignature;
  if(world)world.setRegions(regions);
  else if(active&&namespace)createWorld();
 }
 function createWorld(){
  world=new namespace.WorldRenderer(host,{regions:currentRegions,layout:host.dataset.layout,interact:openPanel,onError:message=>{exit({persist:false});world?.dispose();world=null;unavailable(message)},modelURL:mode==='wasteland'?host.dataset.wastelandModel:host.dataset.model});
  world.restoreState(cache.get(contextKey));world.applyQuality(readPreference('quality',readPreference('am-world-quality','medium')));document.querySelector('#world-quality').value=world.quality;world.setPaused(panel);if(active)world.start();
 }
 function exit({persist=true}={}){generation++;active=false;entering=false;button.disabled=false;panel=false;remember();world?.stop();audio.pauseMusic();ambient.pause();host.hidden=true;close.hidden=true;shell.classList.remove('world-mode','world-panel-open','wasteland-mode');button.textContent='Mundo 3D';button.setAttribute('aria-pressed','false');if(persist){savePreference('experience','interface');if(experience)experience.value='interface';}if(store.session?.connected)resume();button.focus();}
 async function enter(nextMode='world3d'){
  if(entering)return;
  if(!['world3d','voxel','wasteland'].includes(nextMode))nextMode='world3d';if(active&&mode!==nextMode)exit({persist:false});if(mode!==nextMode){remember();world?.dispose();world=null;contextKey='';signature='';mode=nextMode;}if(experience)experience.value=mode;host.dataset.experience=mode;shell.classList.toggle('wasteland-mode',mode==='wasteland');host.setAttribute('aria-label',mode==='wasteland'?'Wasteland Ops 3D':'Exploração Access World');document.querySelector('#world-title').textContent=mode==='wasteland'?'FIELD OPS 3D':'Access World';document.querySelector('#world-ambient').hidden=mode!=='wasteland';document.querySelector('#field-telemetry').hidden=mode!=='wasteland';document.querySelector('#world-map').hidden=false;
  if(entering||active||!store.session?.connected)return;entering=true;const token=++generation;button.disabled=true;if(experience)experience.disabled=true;button.textContent='Carregando Access World…';unavailable('');
  try{namespace=await load();if(token!==generation||!store.session?.connected)return;
   refreshContext();host.hidden=false;if(!world)createWorld();theme.apply(mode==='wasteland'?'terminal':'aero');active=true;shell.classList.add('world-mode');suspend();world.setPaused(false);world.start();button.textContent='Voltar à interface';button.setAttribute('aria-pressed','true');savePreference('experience',mode);
   await audio.loadInstalled(host.dataset.audioManifest);audio.notify();
  }catch(error){world?.dispose();world=null;active=false;shell.classList.remove('world-mode');theme.apply(mode==='wasteland'?'terminal':'aero');savePreference('experience','interface');unavailable(`${error.message} A interface convencional continua disponível.`);button.textContent='Mundo 3D';host.hidden=true;}
  finally{entering=false;button.disabled=false;if(experience)experience.disabled=false;}
 }
 button.onclick=()=>active?exit():enter(['voxel','wasteland'].includes(experience?.value)?experience.value:'world3d');if(experience)experience.onchange=()=>experience.value==='interface'?exit():enter(experience.value);close.onclick=closePanel;
 document.querySelector('#world-theme').onclick=()=>theme.apply(theme.theme==='aero'?'terminal':'aero');
 document.addEventListener('theme-changed',e=>{if(active&&((e.detail==='terminal'&&mode!=='wasteland')||(e.detail==='aero'&&mode==='wasteland')))exit()});
 document.querySelector('#world-quality').onchange=e=>{world?.applyQuality(e.target.value);savePreference('quality',e.target.value);world?.renderer.domElement.focus()};
 document.querySelector('#world-music').onclick=async()=>{try{if(ambient.active||audio.active){ambient.pause();audio.setEnabled(false)}else await audio.toggle();savePreference('enabled',audio.enabled)}catch(error){unavailable(error.message)}};
 document.querySelector('#world-volume').value=audio.volume;document.querySelector('#world-volume').oninput=e=>{audio.setMasterVolume(e.target.value);ambient.setVolume(e.target.value);savePreference('volume',audio.volume)};
 document.querySelector('#world-ambient').onclick=async()=>{try{await ambient.toggle()}catch(error){unavailable(error.message)}};
 document.querySelector('#world-audio-settings').onclick=()=>document.querySelector('#world-audio-file').click();
 document.querySelector('#world-audio-file').onchange=async e=>{try{audio.importFile(e.target.files[0]);await audio.playMusic();savePreference('enabled',audio.enabled)}catch(error){unavailable(error.message)}finally{e.target.value=''}};
 document.querySelector('#world-audio-loop').checked=readPreference('accessManager.audio.loop','true')==='true';audio.setLoop(document.querySelector('#world-audio-loop').checked);
 document.querySelector('#world-audio-loop').onchange=e=>{audio.setLoop(e.target.checked);savePreference('accessManager.audio.loop',e.target.checked)};
 document.querySelector('#world-gamification').onchange=e=>{document.querySelector('#world-inventory').hidden=!e.target.checked;savePreference('am-world-gamification',e.target.checked)};
 const gamification=readPreference('am-world-gamification','true')==='true';document.querySelector('#world-gamification').checked=gamification;document.querySelector('#world-inventory').hidden=!gamification;

 document.querySelector('#world-service').onclick=()=>document.dispatchEvent(new CustomEvent('open-service'));
 host.addEventListener('world-scan',e=>{const scan=document.querySelector('#world-scanner');scan.hidden=!scan.hidden;if(mode==='wasteland')world?.setPaused(!scan.hidden);scan.replaceChildren();for(const region of e.detail){const b=document.createElement('button');b.className='button';b.textContent=region.label;b.onclick=()=>{scan.hidden=true;openPanel(region)};scan.append(b)}if(mode==='wasteland'&&!scan.hidden)scan.querySelector('button')?.focus()});
 document.addEventListener('locate-world-route',async e=>{await enter('voxel');const region=currentRegions.find(r=>r.routeId===e.detail.routeId);if(region){unavailable(`Localização: ${region.label}. O painel mostra a tabela real de clientes; não representa localização física.`);const state=world.getState();state.player={...state.player,x:region.x,z:region.z+6,y:0};world.restoreState(state)}else unavailable('Região não disponível nesta sessão.');});
 host.addEventListener('world-service',()=>document.dispatchEvent(new CustomEvent('open-service')));
 host.addEventListener('world-map-toggle',()=>{const map=document.querySelector('#world-map');map.hidden=!map.hidden});
 const modal=document.querySelector('#service-dialog');modal?.addEventListener('close',()=>{if(active&&!panel)world?.setPaused(false)});
 const modalObserver=new MutationObserver(()=>{if(active&&modal?.open)world?.setPaused(true)});if(modal)modalObserver.observe(modal,{attributes:true,attributeFilter:['open']});
 const map=document.querySelector('#world-map');let ctx;host.addEventListener('focusin',()=>{ctx??=map.getContext?.('2d')});
 host.addEventListener('world-frame',e=>{const {player,hotspot,fps,visited,total}=e.detail;document.querySelector('#world-prompt').textContent=hotspot?`E · ${mode==='wasteland'?'Acessar '+(hotspot.worldLabel||hotspot.label):'Inspecionar '+hotspot.label}`:mode==='wasteland'?'WASD · Shift · Espaço · E acessar · T terminal · V câmera · M mapa · L atendimento':mode==='voxel'?'WASD · Shift · Espaço · E interagir · F scanner · V câmera':'WASD · Shift correr · Espaço pular · Arraste para olhar';document.querySelector('#world-debug').textContent=`${fps} FPS · ${world.quality} · ${world.modelStatus||'Mascote procedural'}`;document.querySelector('#world-inventory').textContent=`Exploração: ${visited}/${total} regiões visitadas`;
  document.querySelector('#field-sector').textContent=hotspot?.worldLabel||hotspot?.label||'Área de operações';
  if(ctx){ctx.clearRect(0,0,180,180);ctx.fillStyle=mode==='wasteland'?'#0b120d':host.dataset.layout==='juniper'?'#e0f2fa':'#e2f4d1';ctx.fillRect(0,0,180,180);ctx.font='13px sans-serif';ctx.textAlign='center';for(const h of currentRegions){ctx.fillStyle='#'+h.color.toString(16).padStart(6,'0');ctx.fillText(glyphs[h.kind]||'●',90+h.x*1.5,93+h.z*1.5)}ctx.fillStyle=mode==='wasteland'?'#7dff9c':'#123c60';ctx.beginPath();ctx.arc(90+player.x*1.5,90+player.z*1.5,4,0,Math.PI*2);ctx.fill();}
 });
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&active){if(document.querySelector('#action-dialog')?.open||document.querySelector('#service-dialog')?.open)return;const scanner=document.querySelector('#world-scanner');if(!scanner.hidden){scanner.hidden=true;world?.setPaused(false);world?.renderer.domElement.focus();return}if(panel)closePanel();else exit();}});
 const contextChanged=()=>queueMicrotask(()=>{if(!store.session?.connected){if(active||entering)exit({persist:false});world?.dispose();world=null;cache.clear();contextKey='';signature='';return;}refreshContext();});
 for(const event of ['app-context-ready','capabilities','subscriber-context-changed'])document.addEventListener(event,contextChanged);
 const paintTelemetry=()=>{const snap=store.snapshot?.session_id===getContext()?.session_id?store.snapshot:null,wan=snap?.wan?.data??snap?.wan,clients=snap?.clients?.data??snap?.clients;const rows=Array.isArray(wan)?wan:[];document.querySelector('#field-wan').textContent=rows[0]?.status||'Não coletada';document.querySelector('#field-clients').textContent=Array.isArray(clients)?clients.length:'Não coletados';const ping=[...service.entries].reverse().find(e=>e.path==='/api/device/diagnostics/ping'&&e.session===getContext()?.session_id&&e.ok!==false);document.querySelector('#field-latency').textContent=Number.isFinite(ping?.data?.avg_ms)?ping.data.avg_ms+' ms':'Não testada';document.querySelector('#field-loss').textContent=Number.isFinite(ping?.data?.loss_percent)?ping.data.loss_percent+'%':'Não testada';};document.addEventListener('device-snapshot',paintTelemetry);document.addEventListener('app-context-ready',paintTelemetry);const unsubscribeTelemetry=subscribeService(paintTelemetry);paintTelemetry();
 document.addEventListener('visibilitychange',()=>{if(document.hidden){audio.pauseMusic();ambient.pause()}});
 window.addEventListener('pagehide',()=>{world?.dispose();audio.dispose();ambient.dispose();modalObserver.disconnect();unsubscribeTelemetry();cache.clear()});
 return {openPanel,exit,enter,unavailable,get active(){return active}};
}
