import {patchHTML} from '../../shared/patch.js';
import {request,loadResource,timing} from '../../services/api.js';
import {table,dialog,toast,esc,cap} from '../../shared/ui.js';

let state={attendant:null,active:null,profiles:[]};
const profiles=()=>state.profiles||[];
const field=(label,name,value='',type='text',extra='')=>`<div class="field"><label>${esc(label)}</label><input name="${esc(name)}" type="${esc(type)}" value="${esc(value??'')}" ${extra}></div>`;
const checkbox=(label,name,value=false)=>`<label class="profile-include"><input type="checkbox" name="${esc(name)}" ${value?'checked':''}> ${esc(label)}</label>`;
function choice(label,name,value,options=[]){const normalized=options.map(o=>typeof o==='object'?o:{value:o,label:o});if(!normalized.length)return field(label,name,value);return `<div class="field"><label>${esc(label)}</label><select name="${esc(name)}">${normalized.some(o=>String(o.value)===String(value))?'':`<option value="${esc(value??'')}">${esc(value??'Não disponível')}</option>`}${normalized.map(o=>`<option value="${esc(o.value)}" ${String(o.value)===String(value)?'selected':''}>${esc(o.label??o.value)}</option>`).join('')}</select></div>`}
function listMarkup(){
 const active=state.active||'Nenhum perfil ativo';
 return `<section class="panel"><div class="panel-header"><div><small>CONFIGURAÇÃO PADRÃO</small><h2>Perfis do atendente</h2><p class="muted">Atendente: ${esc(state.attendant||'sessão local')} · perfil ativo: <strong>${esc(active)}</strong></p></div><div class="inline-actions"><button class="button" id="capture-profile">CAPTURAR ATUAL</button><button class="button primary" id="new-profile">NOVA CONFIGURAÇÃO</button></div></div></section>${table([{label:'Ativo',render:r=>r.name===state.active?'[ ATIVO ]':'—'},{label:'Nome',keys:['name']},{label:'Descrição',keys:['description']},{label:'Rádios',render:r=>esc((r.wifi?.radios||(r.wifi?.radio?[r.wifi.radio]:[])).map(x=>`${x.band??'—'}: ${x.auto_channel===true?'Auto':x.channel??'—'} · ${x.bandwidth??'—'} · ${x.standard??'—'} · ${x.tx_power??'—'}`).join(' / ')||'—')},{label:'DNS',render:r=>Object.keys(r.dns||{}).length?'Configurado':'—'},{label:'Ações',render:r=>`<div class="inline-actions">${r.name===state.active?'':`<button class="button" data-activate-profile="${esc(r.name)}">Ativar</button>`}<button class="button" data-edit-profile="${esc(r.name)}">Editar</button><button class="button" data-preview-profile="${esc(r.name)}">Preview / aplicar</button><button class="button danger" data-delete-profile="${esc(r.name)}">Excluir</button></div>`}],profiles(),'Nenhuma configuração salva para este atendente.')}`;
}

function radioEditor(r,index,stored={}){
 const band=r.band??r.banda??stored.band??`Rádio ${index+1}`;
 const options=r.options||{};
 const current={
  channel:r.channel??r.canal,bandwidth:r.bandwidth??r.largura,standard:r.standard??r.padrao,
  tx_power:r.tx_power??r.potencia,country:r.country??r.pais,auto_channel:r.auto_channel??r.canal_automatico,
  sgi:r.sgi,beacon_interval:r.beacon_interval,rts_cts:r.rts_cts,dtim:r.dtim,
  airtime_fairness:r.airtime_fairness,band_steering:r.band_steering,bandwidth_code:r.bandwidth_code,
 };
 const value=key=>stored[key]??current[key];
 const extras=['rts_cts','dtim','airtime_fairness','band_steering','bandwidth_code'].filter(key=>value(key)!==undefined&&value(key)!==null);
 return `<section class="profile-section" data-radio-index="${index}"><div class="panel-header"><h3>Wi-Fi ${esc(band)}</h3>${checkbox('Incluir no perfil',`include-radio-${index}`,Object.keys(stored).length>0)}</div><input type="hidden" name="band-${index}" value="${esc(band)}"><div class="form-grid">${choice('Canal',`channel-${index}`,value('channel'),options.channel||[])}${choice('Largura',`bandwidth-${index}`,value('bandwidth'),options.bandwidth||[])}${choice('Modo / standard',`standard-${index}`,value('standard'),options.standard||[])}${choice('País',`country-${index}`,value('country'),options.country||[])}${choice('Potência',`tx_power-${index}`,value('tx_power'),options.tx_power||[])}${field('Beacon interval',`beacon_interval-${index}`,value('beacon_interval')??'','number','min="1"')}${choice('Canal automático',`auto_channel-${index}`,String(value('auto_channel')??''),[{value:'true',label:'Automático'},{value:'false',label:'Manual'}])}${choice('SGI',`sgi-${index}`,String(value('sgi')??''),[{value:'true',label:'Ativo'},{value:'false',label:'Inativo'}])}${extras.map(key=>key==='airtime_fairness'||key==='band_steering'?choice(key.replaceAll('_',' '),`${key}-${index}`,String(value(key)),[{value:'true',label:'Ativo'},{value:'false',label:'Inativo'}]):field(key.replaceAll('_',' '),`${key}-${index}`,value(key))).join('')}</div></section>`;
}

async function edit(profile={}){
 const opened=performance.now(),savedRadios=profile.wifi?.radios||(profile.wifi?.radio?[profile.wifi.radio]:[]),dns=profile.dns||{},hosts=dns.hosts||[];
 let radios=[],radiosReady=false;
 const dhcpWritable=Boolean(cap('dhcp').enabled?.write);
 const d=dialog(profile.name?'Editar configuração':'Nova configuração',`<div class="profile-content"><form id="profile-form"><section class="profile-section"><div class="form-grid">${field('Nome da configuração','name',profile.name)}${field('Descrição','description',profile.description)}</div></section><div id="profile-radios"><section class="profile-section" role="status"><h3>Wi-Fi</h3><p class="muted">Carregando capabilities e opções do equipamento…</p><div class="skeleton"></div></section></div><section class="profile-section"><h3>DNS</h3><div class="form-grid">${field('Domínio','domain_name',dns.domain_name)}${field('DNS IPv4 1','ipv4_1',dns.ipv4_1??dns.primary)}${field('DNS IPv4 2','ipv4_2',dns.ipv4_2??dns.secondary)}${field('DNS IPv6 1','ipv6_1',dns.ipv6_1)}${field('DNS IPv6 2','ipv6_2',dns.ipv6_2)}</div></section><section class="profile-section"><div class="panel-header"><h3>Nomes de servidor / Static DNS Hosts</h3><button type="button" class="button" id="add-profile-host">+ ADICIONAR</button></div><div id="profile-host-list">${hosts.map(h=>`<div class="toolbar"><input name="host-name" aria-label="Nome do host" value="${esc(h.name??h.nome??'')}"><input name="host-ip" aria-label="IP do host" value="${esc(h.ip??'')}"><button type="button" class="button" data-remove-host>Remover</button></div>`).join('')}</div></section>${dhcpWritable?`<section class="profile-section"><h3>DHCP</h3><div class="form-grid">${field('Início do pool','pool-start',profile.dhcp?.min_address)}${field('Fim do pool','pool-end',profile.dhcp?.max_address)}${field('Lease time (segundos)','lease',profile.dhcp?.lease_time,'number')}${field('DNS primário do DHCP','dhcp-dns1',profile.dhcp?.dns1)}${field('DNS secundário do DHCP','dhcp-dns2',profile.dhcp?.dns2)}</div></section>`:''}</form></div>`,`<button type="button" class="button" data-cancel-profile>Cancelar</button><button type="submit" form="profile-form" class="button primary" id="save-profile">SALVAR PERFIL</button>`);
 d.classList.add('profile-dialog');d.addEventListener('close',()=>d.classList.remove('profile-dialog'),{once:true});d.querySelector('[data-cancel-profile]').onclick=()=>d.close();
 const form=d.querySelector('form');if(profile.name)form.querySelector('[name="name"]').readOnly=true;timing('profiles.modal.open',opened);
 const paint=value=>{if(!d.open)return;radios=Array.isArray(value)?[...value]:value?.radios||[];for(const saved of savedRadios)if(!radios.some(r=>(r.band??r.banda)===saved.band))radios.push({...saved,options:{}});radiosReady=true;patchHTML(d.querySelector('#profile-radios'),radios.map((r,i)=>radioEditor(r,i,savedRadios.find(s=>s.band===(r.band??r.banda))||{})).join('')||'<section class="profile-section"><p class="muted">O equipamento não expôs configuração de rádio nesta sessão. Os demais campos continuam editáveis.</p></section>');timing('profiles.options.ready',opened)};
 loadResource('/api/device/wifi/radios',{scope:d._requestScope,data:paint,error:e=>{paint(savedRadios);if(d.open)d.querySelector('#profile-radios').insertAdjacentHTML('afterbegin',`<p class="notice warning">${esc(e.message)}</p>`)}});
 const wireHosts=()=>d.querySelectorAll('[data-remove-host]').forEach(b=>b.onclick=()=>b.parentElement.remove());wireHosts();
 d.querySelector('#add-profile-host').onclick=()=>{d.querySelector('#profile-host-list').insertAdjacentHTML('beforeend','<div class="toolbar"><input name="host-name" aria-label="Nome do host"><input name="host-ip" aria-label="IP do host"><button type="button" class="button" data-remove-host>Remover</button></div>');wireHosts()};
 form.onsubmit=async event=>{event.preventDefault();const fd=new FormData(form),wifi={...profile.wifi},dhcp={...profile.dhcp};
  if(radiosReady){wifi.radios=radios.flatMap((r,i)=>{if(!fd.get(`include-radio-${i}`))return [];const band=String(fd.get(`band-${i}`)||r.band||r.banda||''),out={...(savedRadios.find(s=>s.band===band)||{}),band};for(const key of ['channel','bandwidth','standard','tx_power','country','beacon_interval','rts_cts','dtim','bandwidth_code']){const input=fd.get(`${key}-${i}`);if(input!=null&&String(input).trim()!=='')out[key]=String(input).trim();else delete out[key]}for(const key of ['auto_channel','sgi','airtime_fairness','band_steering']){const input=fd.get(`${key}-${i}`);if(input==='true'||input==='false')out[key]=input==='true'}return [out]});delete wifi.radio}
  if(dhcpWritable)for(const [input,key] of [['pool-start','min_address'],['pool-end','max_address'],['lease','lease_time'],['dhcp-dns1','dns1'],['dhcp-dns2','dns2']]){const value=String(fd.get(input)||'').trim();if(value)dhcp[key]=value;else delete dhcp[key]}
  const names=fd.getAll('host-name'),ips=fd.getAll('host-ip'),nextHosts=names.map((name,i)=>({name:String(name).trim(),ip:String(ips[i]||'').trim()})).filter(h=>h.name||h.ip);
  const nextDns={...dns,domain_name:String(fd.get('domain_name')||'').trim(),ipv4_1:String(fd.get('ipv4_1')||'').trim(),ipv4_2:String(fd.get('ipv4_2')||'').trim(),ipv6_1:String(fd.get('ipv6_1')||'').trim(),ipv6_2:String(fd.get('ipv6_2')||'').trim(),hosts:nextHosts};delete nextDns.servers;delete nextDns.primary;delete nextDns.secondary;
  const payload={...profile,name:String(fd.get('name')||'').trim(),description:String(fd.get('description')||''),wifi,dns:nextDns,dhcp},button=d.querySelector('#save-profile');button.disabled=true;
  try{await request('/api/profiles',{method:'POST',scope:d._requestScope,body:JSON.stringify(payload)});d.close();toast('Configuração salva para o atendente atual.');document.dispatchEvent(new CustomEvent('refresh-view'))}catch(error){toast(error.message)}finally{button.disabled=false}
 };
}

function resultDialog(result){
 const rows=result.steps||[];
 dialog('Resultado da aplicação',`<p>${result.applied} enviada(s), ${result.verified||0} verificada(s), ${result.skipped} não suportada(s), ${result.failed} falha(s), ${result.uncertain||0} incerta(s).</p>${table([{label:'Etapa',keys:['label']},{label:'Capability',keys:['feature']},{label:'Status',keys:['status']},{label:'Detalhe',render:r=>esc(r.message||r.reason||r.result?.detail||r.result?.message||'—')}],rows,'Nenhuma etapa foi executada.')}`);
}

async function previewAndApply(name){
 try{
  const preview=await request('/api/profiles/preview',{method:'POST',body:JSON.stringify({name})});
  const d=dialog('Preview da configuração',`<p>${preview.applicable} operação(ões) aplicáveis; ${preview.skipped} serão ignoradas por capability.</p>${table([{label:'Operação',keys:['label']},{label:'Suporte',keys:['support']},{label:'Ação',render:o=>o.will_apply?'APLICAR':'PULAR'}],preview.operations)}${preview.operations.map(op=>`<section class="panel"><h3>${esc(op.label)}</h3>${table([{label:'Campo',keys:['field']},{label:'Atual',keys:['current']},{label:'Novo',keys:['desired']}],op.changes||[])}</section>`).join('')}${(preview.profile?.wifi?.ssids||[]).map(s=>`<div class="field"><label>Nova senha de ${esc(s.ssid||s.id)} (opcional; não é persistida)</label><input type="password" data-transient-ssid="${esc(s.id)}" autocomplete="new-password" minlength="8"></div>`).join('')}`,`<button class="button primary" data-apply ${preview.applicable?'':'disabled'}>APLICAR PERFIL</button>`);
  d.querySelector('[data-apply]').onclick=async event=>{event.currentTarget.disabled=true;try{const secrets={};for(const input of d.querySelectorAll('[data-transient-ssid]'))if(input.value)secrets[input.dataset.transientSsid]=input.value;const result=await request('/api/profiles/apply',{method:'POST',body:JSON.stringify({name,secrets})});d.close();resultDialog(result)}catch(error){toast(error.message);event.currentTarget.disabled=false}}
 }catch(error){toast(error.message)}
}

function wire(){
 document.querySelector('#new-profile')?.addEventListener('click',()=>edit());
 document.querySelector('#capture-profile')?.addEventListener('click',async event=>{event.currentTarget.disabled=true;try{const draft=await request('/api/profiles/capture',{method:'POST',body:'{}'});await edit(draft);toast('Configuração atual capturada como rascunho. Revise e salve quando estiver correta.')}catch(error){toast(error.message)}finally{event.currentTarget.disabled=false}});
 document.querySelectorAll('[data-edit-profile]').forEach(button=>button.onclick=()=>edit(profiles().find(p=>p.name===button.dataset.editProfile)));
 document.querySelectorAll('[data-activate-profile]').forEach(button=>button.onclick=async()=>{try{await request('/api/profiles/active',{method:'POST',body:JSON.stringify({name:button.dataset.activateProfile})});toast('Perfil ativo atualizado.');document.dispatchEvent(new CustomEvent('refresh-view'))}catch(error){toast(error.message)}});
 document.querySelectorAll('[data-preview-profile]').forEach(button=>button.onclick=()=>previewAndApply(button.dataset.previewProfile));
 document.querySelectorAll('[data-delete-profile]').forEach(button=>button.onclick=()=>{const d=dialog('Excluir configuração?',`<p>${esc(button.dataset.deleteProfile)}</p><p class="muted">A exclusão afeta somente o atendente atual.</p>`,`<button class="button danger" data-confirm>EXCLUIR</button>`);d.querySelector('[data-confirm]').onclick=async event=>{event.currentTarget.disabled=true;try{await request('/api/profiles',{method:'DELETE',body:JSON.stringify({name:button.dataset.deleteProfile})});d.close();document.dispatchEvent(new CustomEvent('refresh-view'))}catch(error){toast(error.message)}}});
}

export function render(){state={attendant:null,active:null,profiles:[]};return `<section class="panel"><div class="panel-header"><div><small>CONFIGURAÇÃO PADRÃO</small><h2>Perfis do atendente</h2></div></div></section><div id="profile-list" role="status"><div class="panel"><p class="muted">Carregando configurações…</p><div class="skeleton"></div></div></div>`}
export function mount(){
 const paint=()=>{const host=document.querySelector('#profile-list');if(!host)return;patchHTML(host,listMarkup());host.removeAttribute('role');wire()};
 // Keep the original list endpoint as the compatibility/read path. Older
 // runtime fixtures and integrations only expose /api/profiles; the richer
 // state endpoint augments attendant/active metadata when available.
 loadResource('/api/profiles',{data:value=>{state={...state,profiles:Array.isArray(value)?value:[]};paint();request('/api/profiles/state').then(meta=>{if(meta&&Array.isArray(meta.profiles)){state={...state,...meta};paint()}}).catch(()=>{})},error:error=>{const host=document.querySelector('#profile-list');if(host)host.innerHTML=`<div class="notice warning">${esc(error.message)}</div>`}})
}
