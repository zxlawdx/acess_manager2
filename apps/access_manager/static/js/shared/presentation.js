import {esc,valueMarkup} from './ui.js';
export const unavailable='Não disponível';
export const bool=v=>v===true?'Ativo':v===false?'Inativo':unavailable;
export function formatBytes(v){if(v==null||v==='')return unavailable;let x=Number(v),i=0;const units=['B','KiB','MiB','GiB','TiB'];if(!Number.isFinite(x))return unavailable;while(x>=1024&&i<4){x/=1024;i++}return `${x.toFixed(i?2:0)} ${units[i]}`}
export function fields(items){return `<div class="human-fields">${items.map(([label,value])=>`<div class="human-field"><span class="muted">${esc(label)}</span><strong>${valueMarkup(value,label)}</strong></div>`).join('')}</div>`}

export function uptime(v){if(v==null||v==='')return '—';const n=Number(v);if(!Number.isFinite(n))return String(v);const days=Math.floor(n/86400),hours=Math.floor(n%86400/3600),minutes=Math.floor(n%3600/60);return `${days?days+'d ':''}${hours}h ${minutes}min`}
export const linkStatus=v=>({connected:'Conectado',disconnected:'Desconectado',up:'Ativo',down:'Sem link',unknown:'Desconhecido',associated:'Associado',enabled:'Habilitado',disabled:'Desabilitado','1':'Ativo','0':'Inativo'}[String(v??'').toLowerCase()]||v||'Não disponível');
