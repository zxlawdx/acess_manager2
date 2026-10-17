// Current call only. Never serialize this model to storage, telemetry or backend.
export const service={id:null,activeSession:null,session:null,started:null,entries:[],notes:''};
const listeners=new Set();
export const subscribeService=fn=>{listeners.add(fn);return()=>listeners.delete(fn)};
const notify=()=>listeners.forEach(fn=>fn());
export function startService(session){
 const s=session?.session;
 if(!session?.connected){service.id=null;service.activeSession=null;service.session=null;service.started=null;service.entries=[];service.notes='';notify();return}
 const id=s?.session_id||`${s?.vendor}:${s?.host}`;
 if(service.activeSession===id)return;
 if(service.id){service.activeSession=id;addEntry({category:'Conexão',action:'Contexto selecionado / acesso CPE',target:[s?.vendor,s?.model,s?.host].filter(Boolean).join(' · '),result:'Sessão ativa'});return}
 service.id=id;service.activeSession=id;service.session={vendor:s?.vendor,model:s?.model,host:s?.host,technician:s?.username||s?.user||'Não informado',id};service.started=new Date().toISOString();service.entries=[];service.notes='';
 addEntry({category:'Conexão',action:'Sessão iniciada',target:[s?.vendor,s?.model,s?.host].filter(Boolean).join(' · '),result:'Conectado'});
}
export function addEntry(entry){if(!service.id)return;service.entries.push({time:new Date().toISOString(),session:service.activeSession,route:typeof window!=='undefined'?window.__amStore?.view||'conexão':'conexão',...entry});notify()}
export function setServiceNotes(value){service.notes=String(value);notify()}
export function formatService({summary=false,secrets=false,markdown=false}={}){
 const format=value=>JSON.stringify(value,(_key,v)=>v===undefined?null:v,2);
 const detail=(entry,key)=>{const value=entry[key];return value===undefined?'':`\n${key==='before'?'Antes':key==='after'?'Depois':'Dados'}: ${format(value)}`};
 const entries=summary?service.entries.filter(e=>e.category!=='Leitura'||e.observations):service.entries;
 const lines=entries.map(e=>`[${new Date(e.time).toLocaleTimeString('pt-BR')}] ${e.category} · ${e.action}\nTela: ${e.route} · Sessão: ${e.session||service.id} · Alvo: ${e.target||'Equipamento'}\nResultado: ${e.result||'Registrado'}${detail(e,'before')}${detail(e,'after')}${summary?'':detail(e,'data')}${e.secrets?`\nSenha anterior: ${secrets?e.secrets.old:'••••••••'}\nSenha nova: ${secrets?e.secrets.new:'••••••••'}`:''}${e.observations?'\nObservações: '+e.observations:''}`);
 return `${markdown?'# ':''}Atendimento atual\nInício: ${service.started||'Sem sessão'}\nEquipamento: ${service.session?.vendor||''} ${service.session?.model||''} · ${service.session?.host||''}\nTécnico: ${service.session?.technician||''} · Sessão: ${service.id||''}\n\n${lines.join('\n\n')}\n\nObservações do técnico:\n${service.notes||'Sem observações.'}`;
}
const sensitive=/(password|passwd|senha|secret|token|authorization|cookie|passphrase|psk|credential|security.?key)/i;
const redact=value=>{
 if(Array.isArray(value))return value.slice(0,40).map(redact);
 if(value&&typeof value==='object'){
  if([value.field,value.label,value.key,value.name].some(v=>typeof v==='string'&&sensitive.test(v)))return {campo:'Dado sensível omitido'};
  return Object.fromEntries(Object.entries(value).filter(([k])=>!sensitive.test(k)&&!/(raw|config_text|backup|command|script)/i.test(k)).slice(0,40).map(([k,v])=>[k,redact(v)]));
 }
 return typeof value==='string'?value.slice(0,500).replace(/(password|passwd|senha|secret|psk)\s*[=:]\s*\S+/ig,'$1: [omitido]'):value;
};
const seen=new Map();
export function observeOperation(path,method,body,data,ok,route){
 if(!service.id||/reveal-password|settings|host-key|operations|history|poll|export|download|preview|traffic/.test(path))return;
 const url=path.split('?')[0];
 if(!/^\/api\/(device|infrastructure|profiles)/.test(url))return;
 const read=method==='GET';if(read&&!/\/device$|clients|wan|optical|subscribers|subscriber\/|interfaces/.test(url))return;
 const last=seen.get(url);if(read&&last?.id===service.id&&Date.now()-last.time<30000)return;seen.set(url,{id:service.id,time:Date.now()});
 // Configuration forms add a richer, operation-scoped before/after entry.
 if(url==='/api/device/wifi/ssid')return;
 let input={};try{input=typeof body==='string'?JSON.parse(body||'{}'):body||{}}catch{}
 const category=read?'Leitura':/diagnostic|ping|traceroute|test/.test(url)?'Diagnóstico':/profiles/.test(url)?'Perfis':/infrastructure/.test(url)?'Juniper':/wifi/.test(url)?'Wi-Fi':'Alteração';
 const labels={device:'Identificação do equipamento',clients:'Clientes observados',wan:'Leitura WAN',optical:'Sinal óptico',ping:'Ping',traceroute:'Traceroute','wifi-neighbors':'Scan de Wi-Fi vizinho',reboot:'Reinício',capture:'Captura de perfil',apply:'Aplicação de perfil','connect-cpe':'Acesso CPE',lookup:'Consulta de assinante',run:'Diagnóstico completo'};
 const action=labels[url.split('/').at(-1)]||url.split('/').filter(Boolean).slice(2).join(' / ');
 const safe=redact(data);
 let observations='';if(read&&ok){if(/clients$/.test(url)&&Array.isArray(data))observations=`Clientes observados: ${data.length}.`;if(/optical$/.test(url))observations=`Sinal óptico RX: ${data?.rx??data?.rx_power??'Não disponível'} dBm.`;if(/wan$/.test(url)){const rows=Array.isArray(data)?data:[data];observations=rows.map(r=>`WAN ${r.name||''}: ${r.status||'estado indisponível'}; IP ${r.ipv4||r.ip||'não disponível'}.`).join(' ')}}
 addEntry({...(route?{route}:{}),category,action,target:input.host||input.ip||input.ssid_id||input.band||'Equipamento',observations,result:ok?(read?'Leitura concluída':data?.verified===true?'Confirmado por leitura':'Resposta recebida; verificar resultado abaixo'):'Falha',data:Array.isArray(safe)?{quantidade:safe.length,registros:safe}:safe,...(!read?{after:redact(input)}:{})});
}
