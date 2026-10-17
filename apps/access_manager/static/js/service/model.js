import {formatHumanService,opticalFacts} from './human-formatter.js';
// Current call only. Never serialize this model to storage, telemetry or backend.
export const service={id:null,activeSession:null,session:null,started:null,entries:[],notes:''};
const listeners=new Set();
const seen=new Map();
export const subscribeService=fn=>{listeners.add(fn);return()=>listeners.delete(fn)};
const notify=()=>listeners.forEach(fn=>fn());
export function clearService({keepSession=false}={}){
 const current=keepSession&&service.id?{id:service.id,activeSession:service.activeSession,session:service.session}:null;
 service.id=current?.id||null;service.activeSession=current?.activeSession||null;service.session=current?.session||null;service.started=current?new Date().toISOString():null;service.entries=[];service.notes='';seen.clear();notify();
}
export function detachService(){if(!service.id)return;service.activeSession=null;seen.clear();notify()}
export function startService(session,{preserveOnDisconnect=false}={}){
 const s=session?.session;
 if(!session?.connected){if(preserveOnDisconnect&&service.id)detachService();else clearService();return}
 const connection={vendor:s?.vendor,model:s?.model,host:s?.host,port:s?.metadata?.port,scheme:s?.metadata?.scheme};
 const id=s?.session_id||`${s?.vendor}:${s?.host}`;
 if(service.activeSession===id)return;
 if(service.id){service.activeSession=id;addEntry({connection,category:'Conexão',action:'Contexto selecionado / acesso CPE',target:[s?.vendor,s?.model,s?.host].filter(Boolean).join(' · '),result:'Sessão ativa'});return}
 service.id=id;service.activeSession=id;service.session={vendor:s?.vendor,model:s?.model,host:s?.host,technician:s?.username||s?.user||'Não informado',id};service.started=new Date().toISOString();service.entries=[];service.notes='';
 addEntry({connection,category:'Conexão',action:'Sessão iniciada',target:[s?.vendor,s?.model,s?.host].filter(Boolean).join(' · '),result:'Conectado'});
}
export function addEntry(entry){if(!service.id)return;service.entries.push({time:new Date().toISOString(),session:service.activeSession,route:typeof window!=='undefined'?window.__amStore?.view||'conexão':'conexão',...entry});notify()}
export function setServiceNotes(value){service.notes=String(value);notify()}
export function formatService({mode='summary',secrets=false,markdown=false}={}){
 if(mode==='technical')return JSON.stringify({...service,entries:service.entries.map(e=>({...e,...(e.secrets?{secrets:{old:secrets?e.secrets.old:'********',new:secrets?e.secrets.new:'********'}}:{})}))},null,2);
 return formatHumanService(service,{mode,secrets,markdown});
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
export function observeOperation(path,method,body,data,ok,route){
 if(!service.id||/reveal-password|settings|host-key|operations|history|poll|export|download|preview|traffic/.test(path))return;
 const url=path.split('?')[0];
 if(!/^\/api\/(device|infrastructure|profiles)/.test(url))return;
 const read=method==='GET'||(/^\/api\/infrastructure\//.test(url)&&!/(connect-cpe|cpe-port|diagnostics\/|ping$|traceroute$)/.test(url));if(method==='GET'&&!/\/device$|clients|wan|optical|subscribers|subscriber\/|interfaces/.test(url))return;
  // Configuration forms add a richer, operation-scoped before/after entry.
 if(url==='/api/device/wifi/ssid')return;
 let input={};try{input=typeof body==='string'?JSON.parse(body||'{}'):body||{}}catch{}
 const safe=redact(data),signature=JSON.stringify([safe,redact(input),ok]);
 const last=seen.get(url);if(read&&last?.id===service.activeSession&&last.signature===signature&&Date.now()-last.time<30000)return;seen.set(url,{id:service.activeSession,signature,time:Date.now()});
 const category=read?'Leitura':/diagnostic|ping|traceroute|test/.test(url)?'Diagnóstico':/profiles/.test(url)?'Perfis':/infrastructure/.test(url)?'Juniper':/wifi/.test(url)?'Wi-Fi':'Alteração';
 const labels={device:'Identificação do equipamento',clients:'Clientes observados',wan:'Leitura WAN',optical:'Sinal óptico',ping:'Ping',traceroute:'Traceroute','wifi-neighbors':'Scan de Wi-Fi vizinho',reboot:'Reinício',capture:'Captura de perfil',apply:'Aplicação de perfil','connect-cpe':'Acesso CPE',lookup:'Consulta de assinante',run:'Diagnóstico completo'};
 const action=labels[url.split('/').at(-1)]||url.split('/').filter(Boolean).slice(2).join(' / ');
 let observations='';if(read&&ok){if(/clients$/.test(url)&&Array.isArray(data))observations=`Clientes observados: ${data.length}.`;if(/optical$/.test(url))observations=opticalFacts(data);if(/wan$/.test(url)){const rows=Array.isArray(data)?data:[data];observations=rows.map(r=>`WAN ${r.name||''}: ${r.status||'estado indisponível'}; IP ${r.ipv4||r.ip||'não disponível'}.`).join(' ')}}
 addEntry({...(route?{route}:{}),path:url,method,read,ok,input:redact(input),category,action,target:input.host||input.ip||input.ssid_id||input.band||'Equipamento',observations,result:ok?(read?'Leitura concluída':data?.verified===true?'Confirmado por leitura':'Resposta recebida; verificar resultado abaixo'):'Falha',data:Array.isArray(safe)?{quantidade:data.length,registros:safe}:safe,...(!read?{after:redact(input)}:{})});
}
