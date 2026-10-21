import {drawer} from '../../shared/infrastructure-ui.js';
// Provider-neutral requests and diagnostic attendance UI.
import {request,currentScope,scopeActive} from '../../services/api.js';
import {store} from '../../core/store.js';
import {esc,toast} from '../../shared/ui.js';
export const readInfrastructure=(path,data={},scope=currentScope())=>request('/api/infrastructure/'+path,{scope,signal:scope?.controller.signal,method:'POST',body:JSON.stringify({...data,app_session_id:store.session?.session?.session_id})});
export function mountAttendanceDiagnostic(){
 document.querySelector('#subscriber-diagnose').onclick=async()=>{
  const scope=currentScope(),button=document.querySelector('#subscriber-diagnose'),host=document.querySelector('#attendance-diagnostic');
  button.disabled=true;
  try{
   let job=await readInfrastructure('diagnostics/start',{query:document.querySelector('#subscriber-query').value},scope);
   const cancel=document.querySelector('#attendance-cancel');cancel.hidden=false;cancel.onclick=()=>readInfrastructure('diagnostics/cancel',{id:job.id},scope).catch(e=>toast(e.message));
   while(scopeActive(scope)){
    host.innerHTML=`<p>${esc(job.status)} · ${job.events.map(e=>esc(e.source+': '+e.status)).join(' · ')}</p>`;
    if(job.result){const triage=job.result.triage;
     const stages=['Cliente','ONT / CPE','GPON / PON','VLAN / QinQ','BNG / PPPoE','AAA / RADIUS','IPv4 / IPv6','CGNAT / Core','DNS / Internet'];
     const observed=job.result.snapshot?.subscriber;
     host.innerHTML+=`<details><summary>Caminho do cliente e evidências</summary>${stages.map((name,index)=>`<p>${esc(name)}: ${esc(index===4?observed?.state||'UNKNOWN':'UNKNOWN')}</p>`).join('')}<p>Coleta BNG: ${esc(job.result.snapshot?.subscriber_observed_at||'UNKNOWN')}</p></details>`;
     host.innerHTML+=`<h3>${esc(triage.status)}${triage.partial?' · Parcial':''}</h3>`+triage.issues.map(i=>`<p><strong>${esc(i.title)}</strong> ${esc(i.suggested_action||'')}</p>`).join('')+`<p>Etapas sem evidência permanecem UNKNOWN.</p><button class="button" data-attendance-copy="technical">Copiar técnico</button> <button class="button" data-attendance-copy="customer">Copiar para cliente</button>`;
     host.querySelectorAll('[data-attendance-copy]').forEach(b=>b.onclick=async()=>{try{await navigator.clipboard.writeText(job.result.attendance[b.dataset.attendanceCopy]);toast('Registro copiado.')}catch{toast('Não foi possível copiar.')}});
    }
    if(job.status!=='RUNNING')break;
    await new Promise(resolve=>setTimeout(resolve,500));
    if(!scopeActive(scope))break;
    job=await readInfrastructure('diagnostics/progress',{id:job.id},scope);
   }
  }catch(error){if(scopeActive(scope))host.textContent=error.message}
  finally{button.disabled=false;const cancel=document.querySelector('#attendance-cancel');if(cancel)cancel.hidden=true}
 };

}
export async function accessCpe(row){
 try{
  const draft=await readInfrastructure('subscribers/cpe-draft',{session_id:row.session_id,username:row.username,ipv4_address:row.ipv4_address});
  const d=drawer('Acessar CPE',`<p><strong>${esc(draft.subscriber_username)}</strong> · via ${esc(store.session?.session?.vendor==='huawei_bng'?'Huawei BNG':'Juniper')}</p><p>Contrato ${esc(draft.contract||'—')} · MAC <code>${esc(row.mac_address||'—')}</code></p><p class="muted">Atualizado ${esc(new Date(draft.refreshed_at*1000).toLocaleTimeString())}</p><p class="muted">IP localizado no BNG. O acesso de gerenciamento parte deste computador e pode depender de rota, ACL ou porta habilitada.</p><form id="cpe-handoff" class="form-grid"><div class="field"><label>IPv4</label><input name="host" value="${esc(draft.host)}" readonly required><label><input type="checkbox" name="edit_host"> Editar endereço explicitamente</label></div><div class="field"><label>Porta</label><input name="port" type="number" min="1" max="65535" value="80" required></div><div class="field"><label>Protocolo</label><select name="protocol"><option value="auto">Automático (HTTP; HTTPS na porta 443)</option><option value="http">HTTP</option><option value="https">HTTPS</option></select></div><div class="field"><label>Fabricante</label><select name="vendor"><option value="auto">Automático</option><option value="huawei">Huawei</option><option value="zte">ZTE</option></select></div><div class="field"><label>Usuário do CPE</label><input name="username" autocomplete="off" required></div><div class="field"><label>Senha do CPE</label><input name="password" type="password" autocomplete="off" required></div><p id="cpe-feedback" role="status"></p></form>`,`<button class="button" type="button" data-probe-cpe>Verificar porta</button><button class="button primary" type="submit" form="cpe-handoff">Conectar ao CPE</button>`);
  d.classList.add('juniper-dialog');const drawerScope=d._requestScope;const form=d.querySelector('form');form.elements.edit_host.onchange=()=>{form.elements.host.readOnly=!form.elements.edit_host.checked};
  d.querySelector('[data-probe-cpe]').onclick=async event=>{const button=event.currentTarget;button.disabled=true;try{const values=Object.fromEntries(new FormData(form));delete values.password;delete values.username;const result=await request('/api/infrastructure/subscribers/cpe-port',{method:'POST',body:JSON.stringify({...draft,...values,source_host:draft.host,edit_host:form.elements.edit_host.checked})});if(d.open&&d._requestScope===drawerScope)d.querySelector('#cpe-feedback').textContent=result.status==='CPE_PORT_REACHABLE'?'Porta TCP acessível a partir deste computador. Autenticação ainda não testada.':'Porta inacessível a partir deste computador. Isso não confirma que o assinante esteja offline.'}catch(e){if(d.open&&d._requestScope===drawerScope)d.querySelector('#cpe-feedback').textContent=e.message}finally{if(d.open)button.disabled=false}};
  form.onsubmit=async event=>{event.preventDefault();const button=d.querySelector('[type=submit]');button.disabled=true;const payload={...draft,...Object.fromEntries(new FormData(form)),source_host:draft.host,edit_host:form.elements.edit_host.checked};form.elements.password.value='';
   try{const result=await request('/api/infrastructure/subscribers/connect-cpe',{method:'POST',body:JSON.stringify(payload)});d.close();document.dispatchEvent(new CustomEvent('session-selected',{detail:result}));}
   catch(error){if(d.open&&d._requestScope===drawerScope)d.querySelector('#cpe-feedback').textContent=`Acesso de gerenciamento não confirmado: ${error.message} Isso não confirma que o assinante esteja offline.`}
   finally{payload.password='';if(d.open)button.disabled=false}
  };
 }catch(error){toast(error.message)}
}

