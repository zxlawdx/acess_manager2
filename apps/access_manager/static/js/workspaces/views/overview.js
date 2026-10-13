import {request} from '../../services/api.js';
import {metric,kv,pick,badge,esc} from '../../shared/ui.js';
import {topology,mountDetails} from './clients.js';
export async function render(){
 const endpoints=['/api/device','/api/device/wan','/api/device/optical','/api/device/clients'];
 const results=await Promise.allSettled(endpoints.map(p=>request(p)));
 const [device,wan,optical,clients]=results.map(r=>r.status==='fulfilled'?r.value:null);
 const w=Array.isArray(wan)?wan[0]||{}:wan||{},o=optical||{},d=device||{};
 const failures=results.map((r,i)=>r.status==='rejected'?`<div class="notice warning">${esc(['Equipamento','WAN','Óptica','Clientes'][i])}: ${esc(r.reason.message)}</div>`:'').join('');
 const cpu=typeof d.cpu==='object'?Object.values(d.cpu||{}).filter(x=>x!==null&&x!==undefined).join(' / '):d.cpu;
 return `${failures}<div class="grid">${metric('Internet',pick(w,'status','connection_status'))}${metric('IP WAN',pick(w,'ip','ipv4','ip_address'))}${metric('Clientes',Array.isArray(clients)?clients.length:'Não disponível')}${metric('RX óptico',pick(o,'rx','rx_power','rx_dbm'))}${metric('CPU',cpu||'Não disponível')}${metric('RAM',pick(d,'memoria_percent','memory_usage'))}${metric('Temperatura',pick(d,'temperatura_cpu','temperature'))}${metric('Uptime',pick(d,'uptime_segundos','uptime'))}</div><div class="split"><section class="panel"><div class="panel-header"><h2>Equipamento</h2>${badge(pick(d,'fabricante','vendor','manufacturer'))}</div>${kv(d)}</section><section class="panel"><h2>WAN</h2>${kv(w)}</section></div>${Array.isArray(clients)?topology(clients,pick(d,'modelo','model')):''}`
}
export const mount=mountDetails;
