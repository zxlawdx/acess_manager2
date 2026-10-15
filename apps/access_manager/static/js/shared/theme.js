// Original controller: theme preference is independent of the active device.
const key='access-manager.theme';
let preference='system';
try{const saved=localStorage.getItem(key);if(['light','dark','system'].includes(saved))preference=saved}catch{}
const media=window.matchMedia?.('(prefers-color-scheme: dark)');
function apply(){const resolved=preference==='system'?(media?.matches?'dark':'light'):preference;document.documentElement.dataset.theme=resolved;document.documentElement.dataset.themePreference=preference;document.querySelectorAll('[data-theme-select]').forEach(el=>el.value=preference);document.dispatchEvent(new CustomEvent('theme-changed',{detail:{preference,resolved}}))}
export function setTheme(value){if(!['light','dark','system'].includes(value))return;preference=value;try{localStorage.setItem(key,value)}catch{}apply()}
export function mountTheme(){document.querySelectorAll('[data-theme-select]').forEach(el=>el.onchange=()=>setTheme(el.value));apply()}
media?.addEventListener?.('change',()=>{if(preference==='system')apply()});
window.addEventListener('storage',e=>{if(e.key===key){preference=['light','dark','system'].includes(e.newValue)?e.newValue:'system';apply()}});
apply();
