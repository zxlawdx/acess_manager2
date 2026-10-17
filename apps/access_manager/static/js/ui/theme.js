const preferenceKeys={theme:'accessManager.theme',experience:'accessManager.experience',enabled:'accessManager.audio.enabled',volume:'accessManager.audio.volume',quality:'accessManager.world.quality'};
export function readPreference(name,fallback){try{return localStorage.getItem(preferenceKeys[name]||name)||fallback}catch{return fallback}}
export function savePreference(name,value){try{localStorage.setItem(preferenceKeys[name]||name,String(value))}catch{}}
export function presentLabel(raw,navigation=false){
 if(navigation&&/^\s*\d{2}\s*$/.test(raw))return '';
 return raw.replace(/^(\s*)\[\s*(.*?)\s*\](\s*)$/,'$1$2$3').replace(/^(\s*)(?:>\s+|\/\/\s+)/,'$1');
}
const icons={overview:'🌐',clients:'👥',traffic:'📈',wifi:'📶',wan:'🌍',lan:'🔌',dhcpdns:'🗂',diagnostics:'🧪',completeDiagnostics:'🩺',profiles:'🧰',management:'⚙',subscribers:'👥',juniperSubscriber:'🔗',juniperInterfaces:'🔌',juniperRouting:'🌐',juniperDiagnostics:'🔎',juniperSystem:'🏢'};
export function mountThemeProvider(){
 const root=document.documentElement,shell=document.querySelector('.app-shell');let theme='terminal';const originals=new Map();let scheduled=false;
 const paths={overview:'M3 12h18M12 3c6 6 6 12 0 18-6-6-6-12 0-18M3 12a9 9 0 1 0 18 0 9 9 0 1 0-18 0',clients:'M8 10a3 3 0 1 0 0-6 3 3 0 1 0 0 6M3 19v-3c0-5 10-5 10 0v3M17 6a3 3 0 0 1 0 6m0 2c3 0 4 2 4 5',traffic:'M3 19V4m0 15h18M5 14l5-6 4 4 6-8',wifi:'M3 8c5-5 13-5 18 0M6 12c3-3 9-3 12 0m-9 4c2-2 4-2 6 0m-3 3v1',wan:'M3 12a9 9 0 1 0 18 0 9 9 0 1 0-18 0m0 0h18M12 3v18',lan:'M5 8h14v10H5zm3-4v7m4-7v7m4-7v7m-4 7v4',dhcpdns:'M3 5h18v5H3zm0 9h18v5H3zm4-6h2m-2 9h2',diagnostics:'M5 10a6 6 0 1 0 12 0 6 6 0 1 0-12 0m10 5 6 6',profiles:'M6 3h12v18H6zm3 5h6m-6 4h6m-6 4h6',management:'M12 4v3m0 10v3M4 12h3m10 0h3M6 6l2 2m8 8 2 2M6 18l2-2m8-8 2-2M8 12a4 4 0 1 0 8 0 4 4 0 1 0-8 0'};
 function decorate(){
  scheduled=false;
  document.querySelectorAll('#sidebar .nav').forEach(button=>{button.dataset.aeroIcon=icons[button.dataset.view]||'◈';const path=paths[button.dataset.view]||paths[button.dataset.view==='subscribers'?'clients':'dhcpdns'];const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28"><defs><linearGradient id="g" x2="0" y2="1"><stop stop-color="#a5eeff"/><stop offset=".5" stop-color="#218cbd"/><stop offset="1" stop-color="#146f9b"/></linearGradient></defs><circle cx="14" cy="14" r="13" fill="url(#g)" stroke="#68adca"/><path d="${path}" transform="translate(2 2)" fill="none" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;button.style.setProperty('--aero-icon',`url("data:image/svg+xml,${encodeURIComponent(svg)}")`)});
  // Only presentation labels. Never visit inputs, secrets, payloads, raw consoles or technical values.
  document.querySelectorAll('button,h1,h2,h3,h4,th,.nav,.nav-group,.status-badge,.diagnostic-status,.badge,.connection-eyebrow,small,.data-table td').forEach(el=>{
   if(el.closest('pre,code,[data-raw],.raw-output,[contenteditable]'))return;
   for(const node of el.childNodes){if(node.nodeType!==3)continue;const old=originals.get(node);const raw=old&&node.data===old.display?old.raw:node.data;const labelAllowed=!el.matches('td')||/^\s*\[\s*(?:ATIVO|OK|INFO|ATENÇÃO|CRÍTICO|PARCIAL|N\/D)\s*\]\s*$/i.test(raw);const display=theme==='aero'&&labelAllowed?presentLabel(raw,el.matches('.nav')):raw;
    if(display!==raw)originals.set(node,{raw,display});else originals.delete(node);
    if(node.data!==display)node.data=display;
   }
  });
  for(const [node,old] of originals){if(!node.isConnected)originals.delete(node);else if(theme==='terminal'){if(node.data===old.display)node.data=old.raw;originals.delete(node)}}
 }
 function apply(value,{persist=true}={}){
  theme=value==='aero'?'aero':'terminal';root.dataset.experienceTheme=theme;shell?.classList.toggle('aero-theme',theme==='aero');root.style.colorScheme=theme==='aero'?'light':'dark';
  document.querySelector('#action-dialog')?.classList.toggle('aero-theme',theme==='aero');document.querySelector('#login-page')?.classList.toggle('aero-theme',theme==='aero');
  const select=document.querySelector('#theme-select');if(select)select.value=theme;
  const button=document.querySelector('#world-theme');if(button){button.textContent=theme==='aero'?'Tema Terminal':'Tema Aero';button.setAttribute('aria-pressed',String(theme==='aero'))}
  if(persist)savePreference('theme',theme);decorate();document.dispatchEvent(new CustomEvent('theme-changed',{detail:theme}));
 }
 const observer=new MutationObserver(()=>{if(!scheduled){scheduled=true;queueMicrotask(decorate)}});observer.observe(document.body,{childList:true,subtree:true,characterData:true});
 document.querySelector('#theme-select')?.addEventListener('change',e=>apply(e.target.value));
 window.addEventListener('pagehide',()=>{observer.disconnect();originals.clear()},{once:true});
 apply(readPreference('theme',readPreference('am-theme','terminal')),{persist:false});return {apply,get theme(){return theme}};
}
