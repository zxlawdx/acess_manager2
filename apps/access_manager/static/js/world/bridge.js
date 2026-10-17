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
 const audio=new AudioManager({volume:readPreference('volume','.35'),enabled:readPreference('enabled','false')==='true',onChange:state=>{
  document.querySelector('#world-track').textContent=state.title;document.querySelector('#world-music').textContent=state.active?'♪ Silenciar':'♪ Reproduzir';document.querySelector('#world-music').setAttribute('aria-pressed',String(state.active));
 }});
 function closePanel(){if(!active||!panel)return;document.querySelector('#action-dialog')?.close();panel=false;shell.classList.remove('world-panel-open');close.hidden=true;refreshContext();suspend();world?.setPaused(false);}
 async function openPanel(region){
  if(!active||!currentRegions.some(r=>r.id===region.id))return;panel=true;shell.classList.add('world-panel-open');close.hidden=false;world.setPaused(true);const source=key();await navigate(region.routeId);
  if(source!==key()||!active)return;
  if(region.actionId){const action=registry.flatMap(r=>r.actions||[]).find(a=>a.id===region.actionId);if(action?.available())try{await action.run()}catch(error){unavailable(error.message)}}
  close.focus();
 }
 function load(){const name=mode==='voxel'?'AccessManagerVoxel':'AccessManagerWorld';if(window[name])return Promise.resolve(window[name]);if(loading)return loading;loading=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=mode==='voxel'?host.dataset.voxelBundle:host.dataset.bundle;script.onload=()=>window[name]?resolve(window[name]):reject(new Error('Renderer indisponível'));script.onerror=()=>{script.remove();reject(new Error('Não foi possível carregar o módulo 3D local.'))};document.head.append(script)}).finally(()=>loading=null);return loading;}
 function remember(){if(world&&contextKey)cache.set(contextKey,world.getState());}
 function refreshContext(){
  if(!store.session?.connected)return;
  const regions=deriveWorldRegions(registry,getContext(),store.capabilities),next=key(),nextSignature=JSON.stringify(regions);
  if(next===contextKey&&nextSignature===signature)return;
  currentRegions=regions;host.dataset.layout=getContext()?.vendor==='juniper'?'juniper':'router';host.dataset.regionCount=String(regions.length);document.querySelector('#world-context-label').textContent=host.dataset.layout==='juniper'?'Backbone, BNG e assinantes':'Natureza, internet e telecom';
  if(world&&next!==contextKey){remember();world.dispose();world=null;}
  contextKey=next;signature=nextSignature;
  if(world)world.setRegions(regions);
  else if(active&&namespace)createWorld();
 }
 function createWorld(){
  world=new namespace.WorldRenderer(host,{regions:currentRegions,layout:host.dataset.layout,interact:openPanel,onError:message=>{exit({persist:false});world?.dispose();world=null;unavailable(message)},modelURL:host.dataset.model});
  world.restoreState(cache.get(contextKey));world.applyQuality(readPreference('quality',readPreference('am-world-quality','medium')));document.querySelector('#world-quality').value=world.quality;world.setPaused(panel);if(active)world.start();
 }
 function exit({persist=true}={}){generation++;active=false;entering=false;button.disabled=false;panel=false;remember();world?.stop();audio.pauseMusic();host.hidden=true;close.hidden=true;shell.classList.remove('world-mode','world-panel-open');button.textContent='Mundo 3D';button.setAttribute('aria-pressed','false');if(persist){savePreference('experience','interface');if(experience)experience.value='interface';}if(store.session?.connected)resume();button.focus();}
 async function enter(nextMode='world3d'){
  if(!['world3d','voxel'].includes(nextMode))nextMode='world3d';if(active&&mode!==nextMode)exit({persist:false});if(mode!==nextMode){remember();world?.dispose();world=null;contextKey='';signature='';mode=nextMode;}if(experience)experience.value=mode;host.dataset.experience=mode;
  if(entering||active||!store.session?.connected)return;entering=true;const token=++generation;button.disabled=true;button.textContent='Carregando Access World…';unavailable('');
  try{namespace=await load();if(token!==generation||!store.session?.connected)return;
   refreshContext();host.hidden=false;if(!world)createWorld();theme.apply('aero');active=true;shell.classList.add('world-mode');suspend();world.setPaused(false);world.start();button.textContent='Voltar à interface';button.setAttribute('aria-pressed','true');savePreference('experience',mode);
   await audio.loadInstalled(host.dataset.audioManifest);audio.notify();
  }catch(error){world?.dispose();world=null;active=false;shell.classList.remove('world-mode');theme.apply('aero');savePreference('experience','interface');unavailable(`${error.message} A interface Aero continua disponível.`);button.textContent='Mundo 3D';host.hidden=true;}
  finally{entering=false;button.disabled=false;}
 }
 button.onclick=()=>active?exit():enter(experience?.value==='voxel'?'voxel':'world3d');if(experience)experience.onchange=()=>experience.value==='interface'?exit():enter(experience.value);close.onclick=closePanel;
 document.querySelector('#world-theme').onclick=()=>theme.apply(theme.theme==='aero'?'terminal':'aero');
 document.addEventListener('theme-changed',e=>{if(e.detail==='terminal'&&active)exit()});
 document.querySelector('#world-quality').onchange=e=>{world?.applyQuality(e.target.value);savePreference('quality',e.target.value);world?.renderer.domElement.focus()};
 document.querySelector('#world-music').onclick=async()=>{try{await audio.toggle();savePreference('enabled',audio.enabled)}catch(error){unavailable(error.message)}};
 document.querySelector('#world-volume').value=audio.volume;document.querySelector('#world-volume').oninput=e=>{audio.setMasterVolume(e.target.value);savePreference('volume',audio.volume)};
 document.querySelector('#world-audio-settings').onclick=()=>document.querySelector('#world-audio-file').click();
 document.querySelector('#world-audio-file').onchange=async e=>{try{audio.importFile(e.target.files[0]);await audio.playMusic();savePreference('enabled',audio.enabled)}catch(error){unavailable(error.message)}finally{e.target.value=''}};
 document.querySelector('#world-audio-loop').checked=readPreference('accessManager.audio.loop','true')==='true';audio.setLoop(document.querySelector('#world-audio-loop').checked);
 document.querySelector('#world-audio-loop').onchange=e=>{audio.setLoop(e.target.checked);savePreference('accessManager.audio.loop',e.target.checked)};
 document.querySelector('#world-gamification').onchange=e=>{document.querySelector('#world-inventory').hidden=!e.target.checked;savePreference('am-world-gamification',e.target.checked)};
 const gamification=readPreference('am-world-gamification','true')==='true';document.querySelector('#world-gamification').checked=gamification;document.querySelector('#world-inventory').hidden=!gamification;

 document.querySelector('#world-service').onclick=()=>document.dispatchEvent(new CustomEvent('open-service'));
 host.addEventListener('world-scan',e=>{const scan=document.querySelector('#world-scanner');scan.hidden=!scan.hidden;scan.replaceChildren();for(const region of e.detail){const b=document.createElement('button');b.className='button';b.textContent=region.label;b.onclick=()=>{scan.hidden=true;openPanel(region)};scan.append(b)}});
 document.addEventListener('locate-world-route',async e=>{await enter('voxel');const region=currentRegions.find(r=>r.routeId===e.detail.routeId);if(region){unavailable(`Localização: ${region.label}. O painel mostra a tabela real de clientes; não representa localização física.`);const state=world.getState();state.player={...state.player,x:region.x,z:region.z+6,y:0};world.restoreState(state)}else unavailable('Região não disponível nesta sessão.');});
 const map=document.querySelector('#world-map');let ctx;host.addEventListener('focusin',()=>{ctx??=map.getContext?.('2d')});
 host.addEventListener('world-frame',e=>{const {player,hotspot,fps,visited,total}=e.detail;document.querySelector('#world-prompt').textContent=hotspot?`E · Inspecionar ${hotspot.label}`:mode==='voxel'?'WASD · Shift · Espaço · E interagir · F scanner · V câmera':'WASD · Shift correr · Espaço pular · Arraste para olhar';document.querySelector('#world-debug').textContent=`${fps} FPS · ${world.quality} · ${world.modelStatus||'Mascote procedural'}`;document.querySelector('#world-inventory').textContent=`Exploração: ${visited}/${total} regiões visitadas`;
  if(ctx){ctx.clearRect(0,0,180,180);ctx.fillStyle=host.dataset.layout==='juniper'?'#e0f2fa':'#e2f4d1';ctx.fillRect(0,0,180,180);ctx.font='13px sans-serif';ctx.textAlign='center';for(const h of currentRegions){ctx.fillStyle='#'+h.color.toString(16).padStart(6,'0');ctx.fillText(glyphs[h.kind]||'●',90+h.x*1.5,93+h.z*1.5)}ctx.fillStyle='#123c60';ctx.beginPath();ctx.arc(90+player.x*1.5,90+player.z*1.5,4,0,Math.PI*2);ctx.fill();}
 });
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&active){if(document.querySelector('#action-dialog')?.open)return;const scanner=document.querySelector('#world-scanner');if(!scanner.hidden){scanner.hidden=true;world?.renderer.domElement.focus();return}if(panel)closePanel();else exit();}});
 const contextChanged=()=>queueMicrotask(()=>{if(!store.session?.connected){if(active||entering)exit({persist:false});world?.dispose();world=null;cache.clear();contextKey='';signature='';return;}refreshContext();});
 for(const event of ['app-context-ready','capabilities','subscriber-context-changed'])document.addEventListener(event,contextChanged);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)audio.pauseMusic()});
 window.addEventListener('pagehide',()=>{world?.dispose();audio.dispose();cache.clear()});
 return {openPanel,exit,enter,unavailable,get active(){return active}};
}
