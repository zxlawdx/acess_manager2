import {request,currentScope,scopeActive,isCancelled} from '../../services/api.js';
import {esc,cap,table} from '../../shared/ui.js';
import {fields,linkStatus,uptime} from '../../shared/presentation.js';
import {diagnosticResult} from '../../shared/diagnostics.js';
import {topology,mountDetails} from './clients.js';

const rows=v=>Array.isArray(v)?v:v?[v]:[];
const section=(id,title)=>`<section class="panel"><h2>${title}</h2><div id="complete-${id}"><p class="muted">Aguardando coleta.</p></div></section>`;
export function render(){return `<section class="panel"><h2>Coleta do equipamento</h2><p class="muted">Leituras atuais e ping. Traceroute é opcional. Falhas de uma seção não interrompem as outras; métricas ausentes não são convertidas em zero.</p><form id="complete-form" class="inline-actions"><div class="field"><label>Destino</label><input name="host" value="8.8.8.8" required></div><label><input name="trace" type="checkbox"> Incluir traceroute</label><label><input name="lookup" type="checkbox"> Incluir DNS lookup</label><div class="field"><label>Nome para resolver</label><input name="hostname" value="example.com"></div><button class="button primary">Coletar diagnóstico completo</button></form><p id="complete-progress" role="status">Pronto para coletar.</p></section>${section('health','Saúde e evidências')}${section('system','Resumo e sistema')}${section('wan','WAN')}${section('optical','Óptica')}${section('wifi','Wi-Fi e SSIDs')}${section('radios','Rádios')}${section('clients','Clientes')}${section('lan','LAN')}${section('dhcp','DHCP')}${section('dns','DNS')}${section('ping','Ping')}${section('trace','Traceroute')}${section('traffic','Tráfego')}${section('topology','Topologia')}${section('lookup','DNS lookup')}<section class="panel"><h2>Teste de velocidade nativo</h2><p class="muted">Descoberta de servidores pelo fluxo AIS do provider ZTE. Não inicia medição de velocidade.</p><button type="button" class="button" id="complete-speedtest" ${cap('speedtest_discovery').enabled?.write?'':'disabled'}>Consultar servidores</button><div id="complete-speedtest-result"></div></section>`}
const readers=[
 ['system','/api/device',d=>fields([['Modelo',d.model],['Firmware',d.firmware],['Serial',d.serial],['Uptime',uptime(d.uptime_seconds)],['CPU (%)',d.cpu_percent],['RAM (%)',d.memory_percent],['Temperatura (°C)',d.temperature_c]])],
 ['wan','/api/device/wan',d=>rows(d).map(w=>fields([['Nome',w.name],['Estado',linkStatus(w.status)],['IPv4',w.ipv4],['IPv6',w.ipv6],['Gateway',w.gateway],['DNS',w.dns],['VLAN',w.vlan]])).join('')],
 ['optical','/api/device/optical',d=>fields([['RX (dBm)',d.rx??d.rx_power??d.rx_dbm],['TX (dBm)',d.tx??d.tx_power??d.tx_dbm],['Temperatura (°C)',d.temperature??d.temperatura],['Estado',d.status]])],
 ['wifi','/api/device/wifi/ssids',d=>table([{label:'SSID',keys:['ssid']},{label:'Banda',keys:['band','banda']},{label:'Estado',render:r=>r.enabled===true?'Ativo':r.enabled===false?'Inativo':'Não disponível'}],rows(d))],
 ['radios','/api/device/wifi/radios',d=>rows(d).map(r=>fields([['Banda',r.band??r.banda],['Canal',r.channel??r.canal],['Largura',r.bandwidth??r.largura],['Padrão',r.standard??r.padrao],['Potência',r.tx_power??r.potencia],['País',r.country??r.pais]])).join('')],
 ['clients','/api/device/clients',d=>table([{label:'Hostname',keys:['hostname','name']},{label:'IP',keys:['ip','ipv4']},{label:'MAC',keys:['mac']},{label:'SSID',keys:['ssid']},{label:'Banda',keys:['band']},{label:'RSSI',keys:['rssi']},{label:'SNR',keys:['snr']}],rows(d))],
 ['lan','/api/device/lan',d=>rows(d).map(r=>fields([['Porta',r.port??r.porta??r.name??r.nome],['Estado',r.status],['Velocidade',r.speed??r.velocidade]])).join('')],
 ['dhcp','/api/device/dhcp',d=>fields([['Ativo',d.enabled===true?'Sim':d.enabled===false?'Não':null],['IP LAN',d.lan_ip],['Máscara',d.mask],['Início do pool',d.pool_start],['Fim do pool',d.pool_end],['Lease (s)',d.lease_seconds],['DNS primário',d.dns1],['DNS secundário',d.dns2],['Reservas',d.reservations?.length]])],
 ['dns','/api/device/dns',d=>fields([['DNS IPv4 primário',d.ipv4_1??d.primary],['DNS IPv4 secundário',d.ipv4_2??d.secondary],['DNS IPv6 primário',d.ipv6_1],['DNS IPv6 secundário',d.ipv6_2],['Hosts estáticos',d.hosts?.length]])],
 ['traffic','/api/device/traffic',d=>table([{label:'Interface',render:r=>esc(r.label||r.ssid||r.source)},{label:'RX (bytes)',render:r=>esc(r.counters?.rx_bytes??'Não disponível')},{label:'TX (bytes)',render:r=>esc(r.counters?.tx_bytes??'Não disponível')},{label:'RX (Mbps)',render:r=>esc(r.rx_mbps??'Aguardando segunda amostra')},{label:'TX (Mbps)',render:r=>esc(r.tx_mbps??'Aguardando segunda amostra')}],d.sources||[])],
];
export function health(snapshot){
 const states=rows(snapshot.wan).map(w=>String(w.status??'').toLowerCase());
 const disconnected=states.some(s=>['disconnected','down','desconectado'].includes(s));
 const loss=snapshot.ping?.loss_percent;
 if(disconnected||loss===100)return 'Crítico: WAN desconectada ou perda total no ping. Confira as evidências coletadas.';
 if(typeof loss==='number'&&loss>0)return 'Atenção: o equipamento informou perda de pacotes no ping.';
 return 'Informação insuficiente para classificar a saúde global. Leituras e ping disponíveis abaixo; níveis ópticos não recebem limiares genéricos.';
}
export function mount(){const form=document.querySelector('#complete-form'),scope=currentScope();let running=false;
 const speed=document.querySelector('#complete-speedtest');speed.onclick=async()=>{speed.disabled=true;const out=document.querySelector('#complete-speedtest-result');out.textContent='Consultando…';try{const d=await request('/api/device/diagnostics/speedtest-discovery',{scope,method:'POST',body:'{}'});if(scopeActive(scope))out.innerHTML=table([{label:'Nome',keys:['name']},{label:'Endereço',keys:['url']}],d.servers||[],'Nenhum servidor retornado.')}catch(e){if(scopeActive(scope)&&!isCancelled(e))out.textContent=e.message}finally{if(scopeActive(scope))speed.disabled=false}};
 form.onsubmit=async event=>{event.preventDefault();if(running)return;running=true;const button=form.querySelector('button'),progress=document.querySelector('#complete-progress'),snapshot={};button.disabled=true;
 const put=(id,html)=>{if(scopeActive(scope)){const el=document.querySelector('#complete-'+id);if(el)el.innerHTML=html}};
 const fd=new FormData(form),host=String(fd.get('host')||'').trim();
 try{for(let i=0;i<readers.length;i++){if(!scopeActive(scope))return;const [id,path,paint]=readers[i];progress.textContent=`Coletando ${i+1}/${readers.length}: ${id}`;put(id,'<p class="muted">Coletando…</p>');try{const data=await request(path,{scope,forceRefresh:true});snapshot[id]=data;put(id,paint(data)||'<p class="muted">Nenhum dado reconhecido.</p>')}catch(e){if(isCancelled(e))return;put(id,`<p class="notice warning">${esc(e.message)}</p>`)}}
 if(!scopeActive(scope))return;
 if(snapshot.clients){put('topology',topology(rows(snapshot.clients),snapshot.system?.model));mountDetails()}else put('topology','<p class="muted">Clientes não disponíveis; nenhuma relação inferida.</p>');
 for(const [id,enabled] of [['ping',true],['trace',Boolean(fd.get('trace'))]]){if(!enabled){put(id,'<p class="muted">Não solicitado.</p>');continue}if(!cap('diagnostics').enabled?.write){put(id,'<p class="muted">Fluxo não integrado para esta sessão.</p>');continue}put(id,'<p class="muted">Executando…</p>');try{const d=await request('/api/device/diagnostics/'+(id==='trace'?'traceroute':'ping'),{scope,method:'POST',body:JSON.stringify({host,count:4})});snapshot[id]=d;put(id,diagnosticResult(d))}catch(e){if(isCancelled(e))return;put(id,`<p class="notice warning">${esc(e.message)}</p>`)}}
 if(fd.get('lookup')){if(cap('dns_lookup').enabled?.write){put('lookup','<p class="muted">Resolvendo…</p>');try{const d=await request('/api/device/diagnostics/dns-lookup',{scope,method:'POST',body:JSON.stringify({hostname:String(fd.get('hostname')||'').trim()})});put('lookup',fields([['Nome',d.hostname],['Endereços',d.addresses],['Resultado',d.message??(d.success?'Resolvido':'Sem endereço')]]))}catch(e){if(isCancelled(e))return;put('lookup',`<p class="notice warning">${esc(e.message)}</p>`)}}else put('lookup','<p class="muted">Fluxo não integrado para esta sessão.</p>')}else put('lookup','<p class="muted">Não solicitado.</p>');
 // Second counter sample uses elapsed monotonic time in the backend. This is
 // a one-shot collection, not a second polling loop attached to navigation.
 if(snapshot.traffic&&scopeActive(scope))try{const d=await request('/api/device/traffic',{scope,forceRefresh:true});put('traffic',readers.find(r=>r[0]==='traffic')[2](d))}catch(e){if(isCancelled(e))return;put('traffic',`<p class="notice warning">${esc(e.message)}</p>`)}
 put('health',`<p>${esc(health(snapshot))}</p>`);if(scopeActive(scope))progress.textContent='Coleta concluída. Falhas e informações ausentes estão indicadas em cada seção.';
 }finally{running=false;if(scopeActive(scope))button.disabled=false}}
}
