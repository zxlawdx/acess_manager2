import {request} from '../../services/api.js';
import {metric,kv,badge,esc} from '../../shared/ui.js';
import {fields,uptime,linkStatus} from '../../shared/presentation.js';
import {topology,mountDetails} from './clients.js';
export async function render(){
 const endpoints=['/api/device','/api/device/wan','/api/device/optical','/api/device/clients','/api/device/traffic'];
 const results=await Promise.allSettled(endpoints.map(p=>request(p)));
 const [device,wan,optical,clients,traffic]=results.map(r=>r.status==='fulfilled'?r.value:null);
 const w=Array.isArray(wan)?wan[0]||{}:wan||{},o=optical||{},d=device||{};
 const failed=results.map((r,i)=>r.status==='rejected'?`<div class="notice warning">${esc(['Equipamento','WAN','Óptica','Clientes','Tráfego'][i])}: ${esc(r.reason.message)}</div>`:'').join('');
 const rx=o.rx??o.rx_power??o.rx_dbm;
 const streams=(traffic?.sources||[]).filter(s=>s.source==='wan');const latest=streams[0];
 const currentRate=latest?.rx_mbps==null?'—':`${Number(latest.rx_mbps).toFixed(2)} Mbps`;
 const percent=v=>v==null?'—':`${v}%`;
 return `${failed}<div class="grid">${metric('Internet',linkStatus(w.status))}${metric('IP WAN',w.ipv4??'—')}${metric('Clientes',Array.isArray(clients)?clients.length:'—')}${metric('RX óptico',rx==null?'—':`${rx} dBm`)}${metric('CPU',percent(d.cpu_percent))}${metric('RAM',percent(d.memory_percent))}${metric('Tráfego WAN RX',currentRate)}${metric('Uptime',uptime(d.uptime_seconds))}</div><div class="split"><section class="panel"><div class="panel-header"><h2>Equipamento</h2>${badge(d.manufacturer)}</div>${fields([['Modelo',d.model],['Firmware',d.firmware],['Hardware',d.hardware],['Serial',d.serial],['Temperatura',d.temperature_c==null?null:d.temperature_c+' °C'],['Uptime',uptime(d.uptime_seconds)]])}<details><summary>Detalhes técnicos</summary>${kv(d.advanced||{})}</details></section><section class="panel"><h2>WAN</h2>${fields([['Estado',linkStatus(w.status)],['Tipo',w.connection_type],['IPv4',w.ipv4],['Gateway',w.gateway],['VLAN',w.vlan],['DNS',w.dns]])}</section></div>${Array.isArray(clients)?topology(clients,d.model):''}`
}
export const mount=mountDetails;
