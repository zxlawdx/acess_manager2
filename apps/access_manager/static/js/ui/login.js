import {readPreference,savePreference} from './theme.js';
export function supportsWebGL(){
 // A capability probe only: the Three.js bundle remains unloaded until 3D is selected after authentication.
 try{const canvas=document.createElement('canvas');const gl=canvas.getContext('webgl2')||canvas.getContext('webgl');if(!gl)return false;gl.getExtension('WEBGL_lose_context')?.loseContext();return true}catch{return false}
}
export function mountLoginExperience(theme){
 const selector=document.querySelector('#experience-choices');if(!selector)return {afterConnect:async()=>{}};
 const input=document.querySelector('#login-experience');let selected=['world3d','voxel'].includes(readPreference('experience','interface'))?readPreference('experience','interface'):readPreference('theme',readPreference('am-theme','terminal'))==='aero'?'aero':'terminal';let probed=false,supported=true;
 function select(value,persist=true){selected=value;input.value=value;selector.querySelectorAll('[data-login-experience]').forEach(b=>{const checked=b.dataset.loginExperience===value;b.setAttribute('aria-checked',String(checked));b.classList.toggle('selected',checked);b.tabIndex=checked?0:-1});theme.apply(value==='terminal'?'terminal':'aero',{persist});if(persist)savePreference('experience',['world3d','voxel'].includes(value)?value:'interface');
  if(['world3d','voxel'].includes(value)){if(!probed){supported=supportsWebGL();probed=true}document.querySelector('#login-3d-status').textContent=supported?'O mundo será aberto após autenticar.':'3D indisponível neste dispositivo. Você entrará na interface Aero.';}
 }
 selector.addEventListener('click',e=>{const b=e.target.closest('[data-login-experience]');if(b)select(b.dataset.loginExperience)});
 selector.addEventListener('keydown',e=>{const buttons=[...selector.querySelectorAll('[data-login-experience]')];if(['ArrowRight','ArrowDown','ArrowLeft','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();const index=buttons.findIndex(b=>b.dataset.loginExperience===selected);const next=e.key==='Home'?0:e.key==='End'?buttons.length-1:(index+(['ArrowLeft','ArrowUp'].includes(e.key)?buttons.length-1:1))%buttons.length;select(buttons[next].dataset.loginExperience);buttons[next].focus()}});
 select(selected,false);
 return {get selected(){return selected},async afterConnect(world){theme.apply(selected==='terminal'?'terminal':'aero');savePreference('experience',['world3d','voxel'].includes(selected)?selected:'interface');if(['world3d','voxel'].includes(selected)){if(!probed){supported=supportsWebGL();probed=true}if(supported)await world.enter(selected);else world.unavailable('3D indisponível neste dispositivo. A interface Aero está disponível.');}}};
}
