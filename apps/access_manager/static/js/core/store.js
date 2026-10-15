export const store={session:null,capabilities:{},view:'overview',setSession(v){this.session=v;renderContext()},setCapabilities(v){this.capabilities=v||{};document.dispatchEvent(new CustomEvent('capabilities'))}};
function renderContext(){const s=store.session?.session;document.querySelector('#ctx-vendor').textContent=s?.vendor?.toUpperCase()||'—';document.querySelector('#ctx-model').textContent=s?.model||'Sem equipamento';const scheme=s?.metadata?.scheme;const host=s?.vendor==='juniper'&&s?.host?.includes(':')?`[${s.host}]`:s?.host;const endpoint=s?.vendor==='juniper'&&s?.metadata?.port?`${host}:${s.metadata.port}`:host;document.querySelector('#ctx-host').textContent=host?(scheme?`${scheme}://${endpoint}`:endpoint):'—';const online=Boolean(store.session?.connected);const status=document.querySelector('#ctx-status');const degraded=s?.vendor==='juniper'&&Boolean(s?.metadata?.last_transport_failure||s?.metadata?.transport_active===false);status.textContent=degraded?'● Degradado':online?'● Online':'○ Desconectado';status.title=degraded?'Última consulta de transporte falhou. Verifique a sessão.':s?.metadata?.last_read_failed?'Última leitura falhou; transporte permanece ativo.':'';status.style.color=degraded?'var(--warning)':online?'var(--success)':'';status.dataset.health=degraded?'degraded':online?'online':'offline'}

document.addEventListener('juniper-read-state',event=>{
 const s=store.session?.session;if(s?.vendor!=='juniper')return;
 const d=event.detail;s.metadata={...s.metadata,...(d.health||{}),last_read_failed:d.failed};
 if(!d.failed){s.metadata.last_transport_failure=false;s.metadata.transport_active=true;s.metadata.last_read_code=null}
 else if(d.transportFailure){s.metadata.last_transport_failure=true;s.metadata.last_read_code=d.code}
 renderContext();
});
