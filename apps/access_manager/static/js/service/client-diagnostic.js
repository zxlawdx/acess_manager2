import {wifiStandard} from '../shared/wifi-standard.js';
import {request,scopeActive} from '../services/api.js';
import {dialog,kv,esc,cap,toast} from '../shared/ui.js';
import {addEntry} from './model.js';
export function clientObservations(client,present,ping){
 const observations=[];if(client.wifi_standard)observations.push('Cliente negociou '+wifiStandard(client)+'.');if(client.wifi_generation===5)observations.push('Wi-Fi 5 pode limitar throughput em relação ao Wi-Fi 6, mas não comprova falha.');const rates=[client.rx_rate,client.tx_rate].map(Number).filter(v=>Number.isFinite(v)&&v>0);const low=rates.length&&Math.min(...rates)<30;if(low&&Number(client.rssi)>=-65)observations.push('Sinal adequado com taxa baixa: investigar largura do canal, MCS, interferência e congestionamento.');if(low&&client.wifi_generation===4&&/2[.,]4/.test(client.band||client.banda||'')&&Number(client.rssi)<-70)observations.push('Wi-Fi 4 em 2.4 GHz, RSSI fraco e taxa baixa: combinação que pode ser um gargalo.');const rssi=Number(client.rssi);
 if(client.rssi!=null&&Number.isFinite(rssi))observations.push(rssi < -70?'RSSI fraco: possível distância ou interferência; confirmar no local.':'RSSI adequado; não comprova qualidade da conexão nem exclui interferência.');
 if(present===false)observations.push('Ausente na tabela atual; pode não estar conectado ao SSID esperado.');
 if(present===true)observations.push('Presente na tabela atual; presença não comprova acesso à internet.');
 if(ping===false&&present===true)observations.push('Sem resposta ao ping: firewall, isolamento ou standby são possibilidades.');
 return observations.join(' ');
}
const details=r=>({Hostname:r.hostname||r.nome,IPv4:r.ip||r.ipv4,IPv6:Array.isArray(r.ipv6_addresses)?r.ipv6_addresses.join(', '):r.ipv6_addresses||r.ipv6,MAC:r.mac,'Padrão Wi-Fi':wifiStandard(r),'Ruído':r.noise,MCS:r.mcs,'Largura do canal':r.bandwidth||r.largura,'Canal do rádio':r.radio_channel??r.channel,Banda:r.band||r.banda,SSID:r.ssid,Interface:r.interface||r.port,RSSI:r.rssi,SNR:r.snr,'RX bytes':r.rx_bytes,'TX bytes':r.tx_bytes,'Taxa RX':r.rx_rate,'Taxa TX':r.tx_rate,'Tempo conectado':r.uptime||r.connected_time||r.connect_time,Fabricante:r.manufacturer||r.vendor,Estado:r.status??r.online,Lease:r.lease});
export function openClientDiagnostic(client){
 const target=client.hostname||client.nome||client.ip||client.mac||'Cliente';
 const d=dialog('Diagnóstico do dispositivo',`${kv(details(client))}<div class="inline-actions"><button class="button primary" data-test-client>Diagnosticar dispositivo / Testar conexão</button><button class="button" data-add-client>Adicionar ao atendimento</button><button class="button" data-find-client>Localizar no mundo</button></div><div data-client-result role="status"></div>`);d.classList.add('drawer');
 const record=(data,result,observations)=>addEntry({category:'Cliente',action:'Diagnóstico específico',target,data,result,observations});
 d.querySelector('[data-add-client]').onclick=()=>{record(details(client),'Dados observados',clientObservations(client,null,null));toast('Cliente adicionado ao atendimento.')};
 d.querySelector('[data-find-client]').onclick=()=>{d.close();document.dispatchEvent(new CustomEvent('locate-world-route',{detail:{routeId:'clients'}}))};
 d.querySelector('[data-test-client]').onclick=async e=>{
  const button=e.currentTarget;button.disabled=true;const output=d.querySelector('[data-client-result]'),scope=d._requestScope;let current=client,present=null,ping=null;const tests=[];
  output.textContent='Atualizando tabela de clientes…';
  try{
   if(cap('clients').enabled?.read){try{const rows=await request('/api/device/clients',{scope,forceRefresh:true});if(Array.isArray(rows)){const match=rows.find(r=>client.mac?r.mac?.toLowerCase()===client.mac.toLowerCase():(r.ip||r.ipv4)===(client.ip||client.ipv4));present=Boolean(match);if(match)current=match;tests.push({teste:'Tabela de clientes',resultado:present?'Presente':'Ausente'})}}catch(error){tests.push({teste:'Tabela de clientes',resultado:error.message})}}
   const ip=current.ip||current.ipv4;
   if(ip&&cap('diagnostics').enabled?.write){
    try{const result=await request('/api/device/diagnostics/ping',{method:'POST',scope,body:JSON.stringify({host:ip,count:4})});const received=result.received??result.packets_received??result.recebidos;ping=typeof received==='number'?received>0:null;tests.push({teste:'Ping a partir do equipamento',resultado:result});}
    catch(error){tests.push({teste:'Ping',resultado:error.message})}
   }else tests.push({teste:'Ping',resultado:ip?'Não suportado pelas capabilities desta sessão.':'IP indisponível.'});
   if(cap('wifi_radio').enabled?.read){try{const radios=await request('/api/device/wifi/radios',{scope});const list=Array.isArray(radios)?radios:radios?.radios||[];const band=current.band||current.banda;const radio=band?list.find(r=>String(r.band||r.banda).replace(/[^0-9.]/g,'')===String(band).replace(/[^0-9.]/g,'')):null;if(radio){current={...current,radio_channel:radio.channel??radio.canal};tests.push({teste:'Rádio relacionado',banda:band,canal:radio.channel??radio.canal,largura:radio.bandwidth??radio.largura})}}catch(error){tests.push({teste:'Rádio',resultado:error.message})}}
   const pingResult=tests.find(t=>t.teste==='Ping a partir do equipamento')?.resultado;
   const observations=[`IP: ${current.ip||current.ipv4||'indisponível'}; banda: ${current.band||current.banda||'indisponível'}; RSSI: ${current.rssi??'indisponível'}; SNR: ${current.snr??'indisponível'}.`,clientObservations(current,present,ping),pingResult?`Ping: ${pingResult.received??'não informado'}/${pingResult.sent??'não informado'} respostas; perda ${pingResult.loss_percent??'não informada'}%.`:tests.find(t=>t.teste==='Ping')?.resultado].filter(Boolean).join(' ');record({cliente:details(current),testes:tests},'Verificações concluídas',observations);
   if(scopeActive(scope))output.innerHTML=`${kv(details(current))}<pre>${esc(JSON.stringify(tests,null,2))}</pre><p>${esc(observations||'Sem dados suficientes para inferir conectividade. Não há teste equivalente habilitado nesta sessão.')}</p>`;
  }finally{button.disabled=false}
 };
}
