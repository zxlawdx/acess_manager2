// Huawei VRP workspace. Only neutral infrastructure endpoints are accessible here.
import {currentScope,scopeActive} from '../../services/api.js';
import {store} from '../../core/store.js';
import {esc,table} from '../../shared/ui.js';
import {readInfrastructure as read,mountAttendanceDiagnostic,accessCpe} from './infrastructure.js';
export const navigation=[['HUAWEI BNG',[
 ['huaweiBngOverview','Visão geral'],['huaweiBngSubscribers','Assinantes PPPoE'],['huaweiBngDiagnostics','Diagnóstico completo']]]];
const queryField=()=>`<form id="huawei-subscriber-search" class="form-grid"><div class="field"><label for="subscriber-query">Contrato / usuário PPPoE / User ID</label><input id="subscriber-query" name="query" required maxlength="128" placeholder="Contrato, usuário ou user-id:42"></div><button class="button primary" type="submit">Buscar assinante</button><button class="button" type="button" id="subscriber-diagnose">Diagnóstico completo</button></form><button class="button" type="button" id="attendance-cancel" hidden>Cancelar diagnóstico</button><div id="attendance-diagnostic" role="status" aria-live="polite"></div>`;
const facts=(entries)=>`<dl class="infrastructure-facts">${entries.map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(Array.isArray(v)?v.join(', '):v??'UNKNOWN')}</dd></div>`).join('')}</dl>`;
export async function overview(){
 const scope=currentScope(),data=await read('system',{},scope),session=store.session?.session;
 const states=session?.metadata?.connection_states||[];
 return `<section class="panel huawei-bng-overview"><h2>Huawei ${esc(data.model||session?.model||'BNG')}</h2><p>VRP ${esc(data.firmware||session?.firmware||'UNKNOWN')} · ${esc(session?.host)}</p>${facts([['Transporte','VRP SSH'],['SSH',session?.metadata?.transport_active===false?'UNKNOWN':store.session?.connected?'Conectado':'UNKNOWN'],['Autenticação',states.includes('AUTHENTICATED')?'Confirmada':'UNKNOWN'],['Prompt VRP',states.includes('PROMPT_DETECTED')?'Detectado':'UNKNOWN'],['Facts',session?.metadata?.facts_status||data.feature_states?.system||'UNKNOWN']])}<p>Leituras avançadas sem validação física permanecem indisponíveis.</p><button class="button primary" data-view="huaweiBngSubscribers">Buscar assinante</button></section>`;
}
export function subscribers(){return `<section class="panel huawei-bng-subscribers"><h2>Assinantes Huawei BNG</h2>${queryField()}<p id="huawei-search-status" role="status"></p><div id="huawei-subscriber-results"></div><div id="huawei-subscriber-detail"></div></section>`}
export function mountSubscribers(){
 mountAttendanceDiagnostic();
 const form=document.querySelector('#huawei-subscriber-search'),scope=currentScope();
 const message=document.querySelector('#huawei-search-status'),host=document.querySelector('#huawei-subscriber-results');
 form.onsubmit=async event=>{
  event.preventDefault();form.querySelector('[type=submit]').disabled=true;message.textContent='Consultando Huawei BNG…';
  try{
   const result=await read('subscribers/lookup',{query:form.elements.query.value},scope);
   if(!scopeActive(scope))return;
   const rows=result.sessions||[];
   message.textContent=(result.complete?'Consulta concluída.':'Consulta parcial: ausência de sessão não confirmada.')+` ${rows.length} sessão(ões).`;
   host.innerHTML=table([{label:'Usuário PPPoE',render:r=>esc(r.username)},{label:'Estado',render:r=>esc(r.state||'UNKNOWN')},{label:'IPv4',render:r=>esc(r.ipv4_address||'UNKNOWN')},{label:'Detalhes',render:r=>`<button class="button" data-huawei-user="${esc(r.session_id)}">Abrir</button>`}],rows);
   host.querySelectorAll('[data-huawei-user]').forEach(button=>button.onclick=async()=>{
    button.disabled=true;
    try{const row=await read('subscribers/detail',{session_id:button.dataset.huaweiUser},scope);if(scopeActive(scope))document.querySelector('#huawei-subscriber-detail').innerHTML=`<h3>${esc(row.username)}</h3>`+facts([['User ID',row.user_id],['Estado',row.state],['Interface',row.interface],['Interface física',row.physical_interface],['S-VLAN / PeVlan',row.outer_vlan],['C-VLAN / CeVlan',row.inner_vlan],['IPv4',row.ipv4_address],['IPv6',row.ipv6_addresses],['Gateway',row.gateway_ipv4],['DNS',row.dns_v4],['MAC',row.mac]])+`<button class="button" data-huawei-cpe ${row.ipv4_address?'':'disabled'}>Acessar CPE</button>`;if(scopeActive(scope))document.querySelector('[data-huawei-cpe]').onclick=()=>accessCpe(row);}catch(e){if(scopeActive(scope))message.textContent=e.message}finally{button.disabled=false}
   });
  }catch(e){if(scopeActive(scope))message.textContent=e.message}finally{form.querySelector('[type=submit]').disabled=false}
 };
}
export function diagnostics(){return `<section class="panel"><h2>Diagnóstico Huawei BNG</h2>${queryField()}<p>Somente dados observados; recursos sem suporte permanecem UNKNOWN.</p></section>`}
export function mountDiagnostics(){mountAttendanceDiagnostic();document.querySelector('#huawei-subscriber-search').onsubmit=e=>{e.preventDefault();document.querySelector('#subscriber-diagnose').click()}}
export const routes={huaweiBngOverview:{render:overview,mount:()=>{document.querySelector('.huawei-bng-overview [data-view=huaweiBngSubscribers]').onclick=()=>document.dispatchEvent(new CustomEvent('infrastructure-navigate',{detail:'huaweiBngSubscribers'}))}},huaweiBngSubscribers:{render:subscribers,mount:mountSubscribers},huaweiBngDiagnostics:{render:diagnostics,mount:mountDiagnostics}};
