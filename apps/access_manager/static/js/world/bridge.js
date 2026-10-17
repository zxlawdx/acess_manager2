import {regions} from './controller.js';
import {AudioManager} from './audio.js';

// This bridge knows application navigation, never vendor protocols or credentials.
export function mountWorldBridge({store,navigate,suspend,resume}){
 const shell=document.querySelector('.app-shell'),host=document.querySelector('#aero-world');if(!host)return;
 const button=document.querySelector('#world-toggle'),close=document.querySelector('#world-close-panel'),notice=document.querySelector('#world-notice');
 const audio=new AudioManager();let world=null,loading=null,entering=false,generation=0,active=false,panel=false,previousTheme=false;
 const saved=(key,fallback)=>{try{return localStorage.getItem(key)||fallback}catch{return fallback}};
 const save=(key,value)=>{try{localStorage.setItem(key,value)}catch{}};
 const setNotice=message=>{notice.textContent=message;notice.hidden=!message};
 const focusWorld=()=>world?.renderer.domElement.focus();
 function closePanel(){if(!active||!panel)return;document.querySelector('#action-dialog')?.close();panel=false;shell.classList.remove('world-panel-open');close.hidden=true;suspend();world?.setPaused(false);}
 function openPanel(region){if(!active)return;panel=true;shell.classList.add('world-panel-open');close.hidden=false;world.setPaused(true);navigate(store.session?.session?.vendor==='juniper'?region.juniper:region.view);close.focus();}
 function load(){if(window.AccessManagerWorld)return Promise.resolve(window.AccessManagerWorld);if(loading)return loading;loading=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=host.dataset.bundle;script.onload=()=>window.AccessManagerWorld?resolve(window.AccessManagerWorld):reject(new Error('Renderer indisponível'));script.onerror=()=>{script.remove();reject(new Error('Não foi possível carregar o módulo 3D local.'))};document.head.append(script)}).catch(error=>{loading=null;throw error});return loading;}
 function exit(){generation++;active=false;entering=false;button.disabled=false;panel=false;world?.stop();audio.pause();document.querySelector('#world-music').textContent='♫ Som ambiente';host.hidden=true;close.hidden=true;shell.classList.remove('world-mode','world-panel-open');if(!previousTheme)shell.classList.remove('aero-theme');button.textContent='Mundo 3D';button.setAttribute('aria-pressed','false');if(store.session?.connected)resume();button.focus();}
 async function enter(){
  if(entering||active||!store.session?.connected)return;entering=true;const token=++generation;button.disabled=true;button.textContent='Carregando 3D…';setNotice('');
  try{const {WorldRenderer}=await load();if(token!==generation||!store.session?.connected)return;
   host.hidden=false;
   if(!world){try{world=new WorldRenderer(host,{interact:openPanel,onError:message=>{exit();world?.dispose();world=null;setNotice(message)},modelURL:host.dataset.model})}catch(error){host.hidden=true;throw error}}
   previousTheme=shell.classList.contains('aero-theme');active=true;host.hidden=false;shell.classList.add('world-mode','aero-theme');suspend();world.applyQuality(saved('am-world-quality','medium'));document.querySelector('#world-quality').value=world.quality;world.setPaused(false);world.start();button.textContent='Voltar à interface';button.setAttribute('aria-pressed','true');
  }catch(error){world?.dispose();world=null;setNotice(`${error.message} Use a interface convencional.`);button.textContent='Mundo 3D';host.hidden=true;}
  finally{entering=false;button.disabled=false;}
 }
 button.onclick=()=>active?exit():enter();close.onclick=closePanel;
 document.querySelector('#world-theme').onclick=e=>{shell.classList.toggle('aero-theme');e.currentTarget.setAttribute('aria-pressed',String(shell.classList.contains('aero-theme')));save('am-theme',shell.classList.contains('aero-theme')?'aero':'terminal')};
 if(saved('am-theme','terminal')==='aero')shell.classList.add('aero-theme');
 document.querySelector('#world-quality').onchange=e=>{world?.applyQuality(e.target.value);save('am-world-quality',e.target.value);focusWorld()};
 document.querySelector('#world-music').onclick=async e=>{try{const enabled=await audio.toggle();e.target.textContent=enabled?'♫ Silenciar':'♫ Som ambiente';focusWorld()}catch(error){setNotice(error.message)}};
 document.querySelector('#world-volume').oninput=e=>{audio.volume=Number(e.target.value);save('am-world-volume',String(audio.volume));if(audio.context&&audio.active)audio.master.gain.setTargetAtTime(audio.volume,audio.context.currentTime,.1)};
 audio.volume=Number(saved('am-world-volume','.08'));document.querySelector('#world-volume').value=audio.volume;
 document.querySelector('#world-gamification').onchange=e=>{document.querySelector('#world-inventory').hidden=!e.target.checked;save('am-world-gamification',String(e.target.checked))};
 const gamification=saved('am-world-gamification','true')==='true';document.querySelector('#world-gamification').checked=gamification;document.querySelector('#world-inventory').hidden=!gamification;
 const map=document.querySelector('#world-map');let ctx;host.addEventListener('focusin',()=>{ctx??=map.getContext?.('2d')});
 host.addEventListener('world-frame',e=>{const {player,hotspot,fps,visited}=e.detail;document.querySelector('#world-prompt').textContent=hotspot?`[E] Inspecionar ${hotspot.label}`:'WASD · Shift correr · Espaço pular · Arraste para olhar';document.querySelector('#world-debug').textContent=`${fps} FPS · ${world.quality} · ${world.modelStatus||'Mascote procedural'}`;document.querySelector('#world-inventory').textContent=`Exploração: ${visited}/5 regiões visitadas`;
  if(ctx){ctx.clearRect(0,0,180,180);ctx.fillStyle='#e2f4d1';ctx.fillRect(0,0,180,180);for(const h of regions){ctx.fillStyle='#'+h.color.toString(16).padStart(6,'0');ctx.beginPath();ctx.arc(90+h.x*1.6,90+h.z*1.6,5,0,Math.PI*2);ctx.fill();}ctx.fillStyle='#123c60';ctx.beginPath();ctx.arc(90+player.x*1.6,90+player.z*1.6,4,0,Math.PI*2);ctx.fill();}
 });
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&active){if(document.querySelector('#action-dialog')?.open)return;if(panel)closePanel();else exit();}});
 // Session loss, including disconnect and session switching, clears stale exploration.
 const observer=new MutationObserver(()=>{if(shell.hidden&&(active||entering)){exit();world?.dispose();world=null;}});observer.observe(shell,{attributes:true,attributeFilter:['hidden']});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){audio.pause();document.querySelector('#world-music').textContent='♫ Som ambiente';}});
 window.addEventListener('pagehide',()=>{world?.dispose();audio.dispose();observer.disconnect();});
 return {openPanel,exit,get active(){return active}};
}
