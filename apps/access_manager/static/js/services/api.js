export class ApiError extends Error {
  constructor(message,{code,type,retryable=false,status,request_id,health}={}){
    super(message);this.name='ApiError';Object.assign(this,{code,type,retryable,status,request_id,health});
  }
}
function parseResponseBody(text) {
  if (!text) return {};
  try { return JSON.parse(text); }
  catch (_) { return {raw: text}; }
}

export async function request(path, options = {}) {
  const {scope=defaultScope(path,options),forceRefresh=false,...fetchOptions}=options;
  const method=String(options.method||'GET').toUpperCase(),read=method==='GET';
  if(!scopeActive(scope))throw cancelled();
  const canCache=read&&cachedPaths.has(path);sessionKey();
  const entry=canCache?snapshots.get(path):null;
  if(!forceRefresh&&entry&&Date.now()-entry.time<15000){
    if(Date.now()-entry.time>3000)request(path,{...options,scope,forceRefresh:true}).then(()=>{if(scopeActive(scope))document.dispatchEvent(new CustomEvent('snapshot-updated',{detail:{path,generation:scope?.generation}}))}).catch(()=>{});
    return clone(entry.data);
  }
  const key=cacheSession+':'+(scope?.identity??'global')+':'+path;
  if(canCache&&pending.has(key))return pending.get(key);
  const start=performance.now(),epoch=revision;
  const work=(async()=>{
    const url=new URL(path,window.location.origin);
    const res=await fetch(url,{credentials:'same-origin',...fetchOptions,signal:read?(fetchOptions.signal||scope?.controller.signal):fetchOptions.signal,headers:{'Content-Type':'application/json',...(options.headers||{})}});
    const text=await res.text(),data=parseResponseBody(text);
    if(!read&&!['/api/device/wifi/reveal-password','/api/device/traffic/history','/api/profiles/preview','/api/profiles/capture','/api/triage','/api/device/diagnostics/ping','/api/device/diagnostics/traceroute','/api/device/diagnostics/dns-lookup','/api/device/diagnostics/speedtest-discovery','/api/device/configuration/read','/api/device/configuration/preview','/api/device/factory-reset/preview','/api/device/diagnostics/speedtest/poll','/api/device/diagnostics/workstation','/api/device/diagnostics/full/run','/api/device/diagnostics/full/history','/api/device/diagnostics/full/export','/api/device/traffic/device-history','/api/management/artifacts/download'].includes(path))clearSnapshots();
    if(!scopeActive(scope)||(canCache&&epoch!==revision))throw cancelled();
    if(!res.ok||data?.success===false){const details=data?.error||{};const error=new ApiError(details.message||data?.message||(!res.ok?`HTTP ${res.status} ao acessar ${url.pathname}`:'Falha na operação'),{...details,status:res.status});if(path.startsWith('/api/infrastructure/'))document.dispatchEvent(new CustomEvent('juniper-read-state',{detail:{failed:true,code:error.code,health:error.health,transportFailure:['CONNECTION_TIMEOUT','SSH_UNAVAILABLE','NETCONF_UNAVAILABLE'].includes(error.code)}}));throw error;}
    if(path.startsWith('/api/infrastructure/')&&!path.endsWith('/operations')&&!path.includes('/settings')&&!path.includes('/host-key'))document.dispatchEvent(new CustomEvent('juniper-read-state',{detail:{failed:Boolean(data?.health?.last_read_failed),health:data?.health,transportFailure:Boolean(data?.health?.last_transport_failure)}}));
    if(canCache){const safe=clean(data);snapshots.set(path,{time:Date.now(),data:safe});return clone(safe)}
    return data;
  })().catch(e=>{if(!scopeActive(scope)||isCancelled(e))throw cancelled();throw e}).finally(()=>{if(pending.get(key)===work)pending.delete(key);timing(path.startsWith('/api/device/wifi')?'wifi.load.'+(path.split('/').at(-1)==='wifi'?'total':path.split('/').at(-1)):path+'.load',start)});
  if(canCache)pending.set(key,work);
  return work;
}

// One navigation scope, with independent children for dialogs. Network abort
// stops waiting; server-side commands may still finish and are never retried.
let generation=0,active=null,cacheSession=null,revision=0,scopeId=0;
const clone=value=>JSON.parse(JSON.stringify(value));
const snapshots=new Map(),pending=new Map();
const cachedPaths=new Set(['/api/device','/api/device/wifi','/api/device/wifi/ssids','/api/device/wifi/radios','/api/device/wan','/api/device/lan','/api/device/dhcp','/api/device/dns','/api/profiles','/api/device/dmz','/api/device/upnp','/api/device/tr069','/api/device/firewall']);
export const cancelled=()=>Object.assign(new Error(''),{name:'AbortError'});
export const isCancelled=e=>e?.name==='AbortError';
export function beginView(name){active?.controller.abort();active={name,generation:++generation,identity:++scopeId,controller:new AbortController()};return active}
export function currentScope(){return active}
function defaultScope(path,options){if(path==='/api/session')return null;const dialog=document.querySelector('#action-dialog');return String(options.method||'GET').toUpperCase()!=='GET'&&dialog?.open?dialog._requestScope:currentScope()}
export function scopeActive(scope){return !scope||(!scope.controller.signal.aborted&&scope.generation===generation)}
export function childScope(){const parent=active,scope={generation:parent?.generation??generation,identity:++scopeId,controller:new AbortController()};parent?.controller.signal.addEventListener('abort',()=>scope.controller.abort(),{once:true});return scope}
export function clearSnapshots(){revision++;snapshots.clear();pending.clear()}
function sessionKey(){const key=window.__amStore?.session?.session?.session_id??'disconnected';if(cacheSession!==key){clearSnapshots();cacheSession=key}return key}
function clean(value){if(Array.isArray(value))return value.map(clean);if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).filter(([k])=>!/(password|passwd|senha|secret|token|authorization)/i.test(k)).map(([k,v])=>[k,clean(v)]));return value}
export function cached(path){sessionKey();const entry=snapshots.get(path);return entry&&Date.now()-entry.time<15000?clone(entry.data):null}
export function timing(label,start){const duration=performance.now()-start;if(window.__AM_DEBUG__){performance.measure?.(label,{start,end:performance.now()});console.debug('[Access Manager timing]',label,duration.toFixed(1)+' ms')}return duration}
export function loadResource(path,{scope=currentScope(),data,error,refresh=false}={}){const entry=cached(path);if(entry!==null&&scopeActive(scope))data(entry);return request(path,{scope,forceRefresh:refresh||entry===null||Date.now()-(snapshots.get(path)?.time||0)>3000}).then(value=>{if(scopeActive(scope))data(value)}).catch(e=>{if(scopeActive(scope)&&!isCancelled(e))error?.(e)})}
