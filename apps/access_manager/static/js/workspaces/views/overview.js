import {request,currentScope,scopeActive,cancelled} from '../../services/api.js';
import {esc,cap} from '../../shared/ui.js';
import {fields,uptime,linkStatus} from '../../shared/presentation.js';
import {topology,mountDetails} from './clients.js';
import {trafficChart,mountTrafficChart,rate} from '../../shared/traffic-chart.js';
import {store} from '../../core/store.js';
let initial=null;
const metric=(title,value,key)=>`<article class="am-metric"><span>${title}</span><strong class="${key==='status'?(['Conectado','Ativo'].includes(value)?'value-success':['Desconectado','Sem link'].includes(value)?'value-danger':'muted'):'tech-value'}" ${key?`data-overview-${key}`:''}>${esc(value??'Não disponível')}</strong></article>`;
const statusLabel={OK:'[ OK ]',INFO:'[ INFO ]',WARNING:'[ ATENÇÃO ]',CRITICAL:'[ CRÍTICO ]',UNKNOWN:'[ PARCIAL ]',UNSUPPORTED:'[ N/D ]'};
const severityClass=status=>status==='CRITICAL'?'danger':status==='WARNING'?'warning':status==='OK'?'success':'info';
function triageMarkup(triage){
 const issues=Array.isArray(triage?.issues)?triage.issues:[],status=triage?.status||'UNKNOWN';
 const checked=triage?.checked_at?new Date(triage.checked_at).toLocaleTimeString('pt-BR'):'—';
 const content=issues.length?issues.slice(0,6).map(issue=>`<article class="notice ${severityClass(issue.severity)}"><strong>${esc(statusLabel[issue.severity]||`[ ${issue.severity} ]`)} ${esc(issue.title)}</strong><p>${esc(issue.description)}</p>${issue.suggested_action?`<small>${esc(issue.suggested_action)}</small>`:''}</article>`).join(''):`<p class="${status==='OK'?'value-success':'muted'}">${status==='OK'?'[ OK ] Nenhuma anomalia foi confirmada nas leituras disponíveis.':'Nenhuma falha foi confirmada; a triagem está parcial porque existem métricas indisponíveis ou não suportadas.'}</p>`;
 const coverage=Object.entries(triage?.coverage||{}).map(([key,value])=>`<span class="status-badge">${esc(key.toUpperCase())}:${esc(value)}</span>`).join(' ');
 return `<section class="am-panel overview-triage" aria-labelledby="triage-title"><div class="panel-header"><div><small>[ SAÚDE DA CONEXÃO ]</small><h2 id="triage-title">TRIAGEM AUTOMÁTICA</h2></div><span class="status-badge" data-triage-status="${esc(status)}">${esc(statusLabel[status]||status)}</span></div><div class="triage-issues">${content}</div><div class="toolbar"><small class="muted">Atualizado ${esc(checked)}${triage?.source_revision?` · snapshot ${esc(String(triage.source_revision))}`:''}</small><div class="inline-actions">${coverage}<button class="button" type="button" data-triage-complete>DIAGNÓSTICO COMPLETO</button></div></div></section>`;
}
export async function render(){
 const opticalApplicable=cap('optical').read!=='UNSUPPORTED',scope=currentScope();
 const paths=['/api/device','/api/device/wan','/api/device/optical','/api/device/clients','/api/device/traffic','/api/device/wifi/ssids','/api/device/wifi/radios','/api/device/lan','/api/device/dns'];
 const results=await Promise.allSettled(paths.map(p=>p==='/api/device/optical'&&!opticalApplicable?Promise.resolve(null):request(p,{scope})));
 if(!scopeActive(scope))throw cancelled();
 const values=Object.fromEntries(paths.map((path,index)=>[path,results[index].status==='fulfilled'?results[index].value:null]));
 const errors=Object.fromEntries(paths.flatMap((path,index)=>results[index].status==='rejected'?[[path,results[index].reason?.message||'Leitura indisponível']]:[]));
 const device=values['/api/device'],wan=values['/api/device/wan'],optical=values['/api/device/optical'],clients=values['/api/device/clients'],traffic=values['/api/device/traffic'],wifi=values['/api/device/wifi/ssids'],radios=values['/api/device/wifi/radios'],lan=values['/api/device/lan'],dns=values['/api/device/dns'];
 const d=device||{},w=(Array.isArray(wan)?wan[0]:wan)||{},o=optical||{};initial=traffic;
 const source=traffic?.sources?.find(s=>s.source==='wan'),rx=o.rx_dbm??o.rx??o.rx_power,wi=Array.isArray(wifi)?wifi:[],ra=Array.isArray(radios)?radios:[],cl=Array.isArray(clients)?clients:[],signals=cl.map(c=>c.rssi).filter(Number.isFinite),rssi=signals.length?signals.reduce((a,b)=>a+b,0)/signals.length:null;
 const session=store.session?.session||{};
 const snapshot={session_id:session.session_id,source_revision:`${session.session_id||'session'}:${scope.generation}`,device:d,wan,wan_primary:w,optical:o,clients:cl,traffic,wifi:wi,radios:ra,lan,dns,capabilities:store.capabilities,errors};
 store.setSnapshot(snapshot);
 let triage;
 try{triage=await request('/api/triage',{method:'POST',scope,body:JSON.stringify(snapshot)})}catch(error){triage={status:'UNKNOWN',issues:[],partial:true,coverage:{triage:'UNKNOWN'},checked_at:new Date().toISOString(),source_revision:snapshot.source_revision,error:error.message}}
 if(!scopeActive(scope))throw cancelled();
 const alerts=(triage?.issues||[]).filter(item=>['WARNING','CRITICAL'].includes(item.severity));
 return `<header class="am-page-header"><small>PAINEL DO EQUIPAMENTO</small><h2>${esc(d.model||session.model||'Equipamento')}</h2><p class="muted">${esc(d.manufacturer||session.vendor||'')} · equipamento da sessão atual</p></header><div class="overview-metrics">${metric('Status da internet',linkStatus(w.status),'status')}${metric('IP WAN',w.ipv4,'wan-ip')}${metric('Clientes conectados',Array.isArray(clients)?cl.length:null,'clients')}${opticalApplicable?metric('RX óptico',rx==null?null:rx+' dBm','optical'):''}${metric('Consumo atual',rate(source?.rx_mbps),'throughput')}</div>${triageMarkup(triage)}<div class="am-dashboard-split">${trafficChart('Fluxo de tráfego')}<section class="am-panel"><h2>Resumo do equipamento</h2>${fields([['Uptime',uptime(d.uptime_seconds)],['Firmware',d.firmware],['Temperatura',d.temperature_c==null?null:d.temperature_c+' °C'],['CPU',d.cpu_percent==null?null:d.cpu_percent+' %'],['Memória',d.memory_percent==null?null:d.memory_percent+' %'],['Modelo',d.model],['Serial',d.serial]])}</section></div><div class="am-three-columns"><section class="am-panel"><h2>WAN</h2>${fields([['Interface',w.name],['Gateway',w.gateway],['VLAN',w.vlan],['Link',linkStatus(w.status)],['Conexão',w.connection_type]])}</section><section class="am-panel"><h2>Wi-Fi</h2>${fields([['SSIDs observados',wi.map(s=>s.ssid).filter(Boolean)],['Bandas',ra.map(r=>r.band??r.banda)],['Clientes Wi-Fi',Array.isArray(clients)?cl.filter(c=>c.connection_type==='Wi-Fi').length:null],['Canais',ra.map(r=>r.channel??r.canal)]])}</section><section class="am-panel"><h2>Alertas recentes</h2>${alerts.map(item=>`<p class="notice ${severityClass(item.severity)}">${esc(item.title)}</p>`).join('')||'<p class="muted">Nenhum alerta confirmado pelas leituras disponíveis.</p>'}${triage?.partial?'<p class="muted">Cobertura parcial: dado ausente não é tratado como falha.</p>':''}</section></div><div class="am-two-columns"><section class="am-panel"><h2>Utilização de CPU</h2><strong class="tech-value">${esc(d.cpu_percent==null?'Não disponível':d.cpu_percent+' %')}</strong>${Number.isFinite(d.cpu_percent)&&d.cpu_percent>=0&&d.cpu_percent<=100?`<div class="resource-track"><div class="resource-fill violet" style="width:${d.cpu_percent}%"></div></div>`:''}</section><section class="am-panel"><h2>Qualidade do sinal</h2>${fields([['RSSI médio observado',rssi==null?null:rssi.toFixed(1)+' dBm'],['Associações com RSSI',signals.length||null],['Interferência',null]])}</section></div><section class="am-panel overview-topology"><h2>Topologia da rede</h2>${Array.isArray(clients)?topology(cl,d.model):'<p class="muted">Clientes não disponíveis; nenhuma relação inferida.</p>'}</section>`
}
export function mount(){
 document.querySelector('[data-triage-complete]')?.addEventListener('click',()=>document.querySelector('[data-view="completeDiagnostics"]')?.click());
 mountDetails();mountTrafficChart({initial,onSample:d=>{const source=d.sources?.find(s=>s.source==='wan'),el=document.querySelector('[data-overview-throughput]');if(el)el.textContent=rate(source?.rx_mbps)}})
}
