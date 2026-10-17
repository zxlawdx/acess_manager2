(function meshPortForwardingUi(){
  'use strict';

  const workspace=document.querySelector('#workspace');
  if(!workspace)return;

  const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

  async function api(path,{method='GET',body}={}){
    const operationRoute=window.__amStore?.view;
    const operationSession=window.__amStore?.session?.session?.session_id;
    const response=await fetch(path,{
      method,
      headers:body===undefined?{}:{'Content-Type':'application/json'},
      body:body===undefined?undefined:JSON.stringify(body),
    });
    const text=await response.text();
    let data={};
    try{data=text?JSON.parse(text):{}}catch{throw new Error(`Resposta inválida da API (${response.status}).`)}
    if(operationSession===window.__amStore?.session?.session?.session_id)window.__amObserveOperation?.(path,method,body,data,response.ok&&data?.success!==false,operationRoute);
    if(!response.ok||data?.success===false){
      throw new Error(data?.error?.message||data?.message||`Falha HTTP ${response.status}`);
    }
    return data;
  }

  function managementIsActive(){
    if(document.querySelector('.nav.active[data-view="management"]'))return true;
    return (document.querySelector('#page-title')?.textContent||'').trim().toLowerCase()==='gerenciamento';
  }

  function buildCard(){
    const section=document.createElement('section');
    section.id='mesh-port-forwarding-card';
    section.className='diagnostic-tool-card mesh-forward-card';
    section.innerHTML=`
      <div>
        <h3>Encaminhamento de porta para Mesh</h3>
        <p class="muted">O destino é sempre o WAN IP/MAC confirmado ao vivo para o nó selecionado. Se o WAN não puder ser confirmado, a regra não é criada e nenhum LAN IP é usado como fallback.</p>
      </div>
      <div class="mesh-forward-grid">
        <label>WAN do nó Mesh
          <select id="mesh-wan-candidate" disabled>
            <option value="">Carregando clientes observados…</option>
          </select>
        </label>
        <label>Destino efetivo
          <code id="mesh-effective-destination" class="mesh-effective-destination">—</code>
        </label>
      </div>
      <p class="muted" id="mesh-port-rule">Porta legada: — // Mesh: —</p>
      <label class="mesh-forward-confirm">
        <input id="mesh-wan-confirm" type="checkbox">
        <span>Confirmo que o cliente selecionado é a interface WAN do nó Mesh.</span>
      </label>
      <div class="mesh-forward-actions">
        <button class="button" type="button" id="mesh-forward-preview" disabled>Validar destino</button>
        <button class="button primary" type="button" id="mesh-forward-apply" disabled>Aplicar regra</button>
      </div>
      <div class="mesh-forward-status" id="mesh-forward-status" role="status">Aguardando leitura dos clientes.</div>`;
    return section;
  }

  async function wireCard(card){
    const select=card.querySelector('#mesh-wan-candidate');
    const previewButton=card.querySelector('#mesh-forward-preview');
    const applyButton=card.querySelector('#mesh-forward-apply');
    const confirmation=card.querySelector('#mesh-wan-confirm');
    const destination=card.querySelector('#mesh-effective-destination');
    const rule=card.querySelector('#mesh-port-rule');
    const status=card.querySelector('#mesh-forward-status');
    let candidates=[];
    let preview=null;

    const setStatus=(message,isError=false)=>{
      status.textContent=message;
      status.classList.toggle('notice',Boolean(message));
      status.classList.toggle('danger',isError);
    };

    const selected=()=>{
      const index=Number(select.value);
      return Number.isInteger(index)&&index>=0?candidates[index]:null;
    };

    const payload=()=>{
      const item=selected();
      if(!item)throw new Error('Selecione o WAN do nó Mesh.');
      return {
        mesh_wan_ip:item.wan_ip,
        mesh_wan_mac:item.wan_mac,
        confirm_mesh_wan:confirmation.checked,
      };
    };

    const invalidate=()=>{
      preview=null;
      destination.textContent='—';
      applyButton.disabled=true;
    };

    async function runPreview(){
      invalidate();
      previewButton.disabled=true;
      setStatus('Confirmando WAN IP/MAC na leitura atual…');
      try{
        const data=await api('/api/device/mesh/port-forwarding/preview',{method:'POST',body:payload()});
        preview=data;
        destination.textContent=data.effective_destination||'—';
        rule.textContent=`Porta legada: ${data.base_port} // Mesh: ${data.base_port} + 1 = ${data.mesh_port}`;
        setStatus(`Destino confirmado: ${data.effective_destination}. Nenhum fallback para LAN será usado.`);
        applyButton.disabled=!confirmation.checked;
        return data;
      }catch(error){
        setStatus(error.message,true);
        throw error;
      }finally{
        previewButton.disabled=!selected();
      }
    }

    select.addEventListener('change',async()=>{
      invalidate();
      confirmation.checked=false;
      if(!selected())return;
      try{await runPreview()}catch(_error){}
    });

    confirmation.addEventListener('change',()=>{
      applyButton.disabled=!(confirmation.checked&&preview?.confirmed===true);
    });

    previewButton.addEventListener('click',async()=>{
      try{await runPreview()}catch(_error){}
    });

    applyButton.addEventListener('click',async()=>{
      applyButton.disabled=true;
      previewButton.disabled=true;
      setStatus('Aplicando regra e aguardando confirmação do writer/readback…');
      try{
        /* Re-preview immediately before writing so a stale client selection
           cannot be reused after the observed WAN tuple changed. */
        await runPreview();
        if(!confirmation.checked)throw new Error('Confirme que o cliente selecionado é o WAN do nó Mesh.');
        const data=await api('/api/device/mesh/port-forwarding/apply',{method:'POST',body:payload()});
        destination.textContent=data.effective_destination||'—';
        setStatus(data.verified===true
          ? `Regra confirmada pelo equipamento: ${data.effective_destination}.`
          : 'O equipamento não confirmou a gravação.',
          data.verified!==true);
      }catch(error){
        setStatus(error.message,true);
      }finally{
        previewButton.disabled=!selected();
        applyButton.disabled=!(confirmation.checked&&preview?.confirmed===true);
      }
    });

    try{
      const data=await api('/api/device/mesh/port-forwarding/candidates');
      candidates=Array.isArray(data.candidates)?data.candidates:[];
      rule.textContent=`Porta legada: ${data.base_port} // Mesh: ${data.base_port} + 1 = ${data.mesh_port}`;
      if(!candidates.length){
        select.innerHTML='<option value="">Nenhum WAN IP/MAC confirmável nesta leitura</option>';
        select.disabled=true;
        setStatus('Nenhum cliente com IPv4 + MAC foi confirmado. A regra permanece bloqueada.',true);
        return;
      }
      select.innerHTML='<option value="">Selecione o nó Mesh…</option>'+candidates.map((item,index)=>{
        const name=item.hostname?`${item.hostname} — `:'';
        const kind=item.connection_type?` — ${item.connection_type}`:'';
        return `<option value="${index}">${escapeHtml(name+item.wan_ip+' — '+item.wan_mac+kind)}</option>`;
      }).join('');
      select.disabled=false;
      previewButton.disabled=true;
      setStatus('Selecione o cliente que corresponde ao WAN do nó Mesh.');
    }catch(error){
      select.innerHTML='<option value="">Encaminhamento Mesh indisponível</option>';
      select.disabled=true;
      setStatus(error.message,true);
    }
  }

  function enhance(){
    if(!managementIsActive())return;
    if(document.querySelector('#mesh-port-forwarding-card'))return;
    const card=buildCard();
    workspace.appendChild(card);
    wireCard(card);
  }

  new MutationObserver(enhance).observe(workspace,{childList:true,subtree:true});
  document.addEventListener('click',event=>{
    if(event.target.closest?.('[data-view="management"]'))setTimeout(enhance,0);
  },true);
  document.addEventListener('capabilities',enhance);
  enhance();
})();
