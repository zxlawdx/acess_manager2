(function accessManagerOperationalParity(){
  'use strict';

  const workspace=document.querySelector('#workspace');
  if(!workspace)return;
  let selectedDiagnosticHistoryId=null;

  const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const capability=(name,mode='read')=>Boolean(window.__amStore?.capabilities?.[name]?.enabled?.[mode]);

  async function api(path,{method='GET',body}={}){
    const operationRoute=window.__amStore?.view;
    const operationSession=window.__amStore?.session?.session?.session_id;
    const response=await fetch(path,{method,headers:body===undefined?{}:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});
    const text=await response.text();
    let data={};
    try{data=text?JSON.parse(text):{}}catch{throw new Error(`Resposta inválida da API (${response.status}).`)}
    if(operationSession===window.__amStore?.session?.session?.session_id)window.__amObserveOperation?.(path,method,body,data,response.ok&&data?.success!==false,operationRoute);
    if(!response.ok||data?.success===false){throw new Error(data?.error?.message||data?.message||`Falha HTTP ${response.status}`)}
    return data;
  }

  function fieldValue(card,label){
    for(const row of card.querySelectorAll('.human-field')){
      if(row.querySelector('span')?.textContent?.trim()===label)return row.querySelector('strong')?.textContent?.trim()||'';
    }
    return '';
  }

  async function applyChannel(button,band,channel,{rerunComplete=false,rescanNormal=null}={}){
    if(!capability('wifi_radio','write')){throw new Error('Este equipamento não liberou escrita de rádio nesta sessão.')}
    button.disabled=true;
    const old=button.textContent;
    button.textContent='Aplicando…';
    try{
      await api('/api/device/wifi/radio',{method:'POST',body:{band,channel:Number(channel),auto_channel:false}});
      if(rerunComplete){
        const progress=document.querySelector('#complete-progress');
        if(progress)progress.textContent=`Canal ${channel} aplicado em ${band}. Reexecutando diagnóstico para validar…`;
        const run=document.querySelector('#complete-run');
        if(run&&!run.disabled)run.click();
      }else if(typeof rescanNormal==='function'){
        await rescanNormal();
      }
    }finally{
      if(button.isConnected){button.disabled=false;button.textContent=old}
    }
  }

  function renderNeighborEnvironment(payload,result){
    const entries=payload?.wifi_environment||[];
    if(!entries.length){result.innerHTML='<p class="muted">Nenhum rádio com dados de canal foi retornado.</p>';return}
    result.innerHTML=entries.map(entry=>{
      const analysis=entry.channel_analysis||{};
      const recommendation=analysis.recommendation||{};
      const action=recommendation.action;
      const scan=entry.neighbor_scan||{};
      const best=analysis.best_channel??'—';
      const current=analysis.current_channel??'—';
      const neighbors=analysis.neighbor_scan_confirmed?analysis.neighbor_count:'Não disponível';
      const canApply=action?.type==='wifi_channel'&&Number.isFinite(Number(action.channel));
      const message=recommendation.message||entry.message||(analysis.neighbor_scan_confirmed&&!analysis.neighbor_count?'Varredura concluída sem redes vizinhas utilizáveis para pontuação.':'Nenhuma troca de canal foi recomendada nesta leitura.');
      return `<article class="wifi-neighbor-band" data-neighbor-band="${escapeHtml(entry.band)}"><strong>${escapeHtml(entry.band||'Rádio')}</strong><div class="human-fields"><div class="human-field"><span class="muted">Canal atual</span><strong>${escapeHtml(current)}</strong></div><div class="human-field"><span class="muted">Redes vizinhas</span><strong>${escapeHtml(neighbors)}</strong></div><div class="human-field"><span class="muted">Melhor canal observado</span><strong>${escapeHtml(best)}</strong></div></div><p class="muted">${escapeHtml(message)}</p>${canApply?`<button class="button primary channel-action" data-neighbor-apply data-band="${escapeHtml(action.band||entry.band)}" data-channel="${escapeHtml(action.channel)}" ${capability('wifi_radio','write')?'':'disabled'}>Aplicar canal ${escapeHtml(action.channel)}</button>`:''}</article>`;
    }).join('');
  }

  function enhanceNormalDiagnostics(){
    const ping=document.querySelector('#ping-form'),trace=document.querySelector('#trace-form');
    if(!ping||!trace||document.querySelector('#wifi-neighbor-tool'))return;
    const host=ping.parentElement;
    if(!host||host!==trace.parentElement)return;
    host.classList.add('diagnostic-tools-three');
    const section=document.createElement('section');
    section.id='wifi-neighbor-tool';
    section.className='diagnostic-tool-card';
    section.innerHTML=`<h3>Wi-Fi vizinhos</h3><p class="muted">Varre as redes próximas e calcula o melhor canal observado separadamente para 2.4 e 5 GHz.</p><button class="button" id="wifi-neighbor-run" ${capability('wifi_neighbor_scan','read')?'':'disabled'}>Executar varredura</button><div id="wifi-neighbor-result" class="wifi-neighbor-results"><p class="muted">Aguardando execução.</p></div>`;
    host.appendChild(section);
    const run=section.querySelector('#wifi-neighbor-run'),result=section.querySelector('#wifi-neighbor-result');
    const scan=async()=>{
      run.disabled=true;run.textContent='Varrendo…';result.innerHTML='<p class="muted">Consultando rádios, canais permitidos e redes vizinhas…</p>';
      try{
        const payload=await api('/api/device/diagnostics/wifi-neighbors',{method:'POST',body:{}});
        renderNeighborEnvironment(payload,result);
        result.querySelectorAll('[data-neighbor-apply]').forEach(button=>button.onclick=async()=>{
          try{await applyChannel(button,button.dataset.band,button.dataset.channel,{rescanNormal:scan})}
          catch(error){result.insertAdjacentHTML('afterbegin',`<p class="notice danger">${escapeHtml(error.message)}</p>`)}
        });
      }catch(error){result.innerHTML=`<p class="notice danger">${escapeHtml(error.message)}</p>`}
      finally{run.disabled=!capability('wifi_neighbor_scan','read');run.textContent='Executar varredura'}
    };
    run.onclick=scan;
  }

  function enhanceCompleteRecommendations(){
    const host=document.querySelector('#complete-channels');
    if(!host)return;
    for(const card of host.querySelectorAll('.wifi-diagnostic-card')){
      if(card.querySelector('[data-complete-apply-channel]'))continue;
      const message=Array.from(card.querySelectorAll('p.muted')).map(p=>p.textContent||'').join(' ');
      if(!message.includes('Uma leitura de redes próximas indica menor sobreposição no canal'))continue;
      const band=card.querySelector('h3')?.textContent?.trim();
      const channel=Number(fieldValue(card,'Melhor canal observado'));
      const current=Number(fieldValue(card,'Canal atual'));
      if(!band||!Number.isFinite(channel)||channel===current)continue;
      const button=document.createElement('button');
      button.type='button';button.className='button primary channel-action';button.dataset.completeApplyChannel='1';
      button.textContent=`Aplicar canal ${channel}`;button.disabled=!capability('wifi_radio','write');
      button.onclick=async()=>{
        try{await applyChannel(button,band,channel,{rerunComplete:true})}
        catch(error){const progress=document.querySelector('#complete-progress');if(progress)progress.textContent=error.message}
      };
      card.appendChild(button);
    }
  }

  async function resolveExportHistoryId(){
    if(Number.isFinite(Number(selectedDiagnosticHistoryId)))return Number(selectedDiagnosticHistoryId);
    const history=await api('/api/device/diagnostics/full/history',{method:'POST',body:{hours:168}});
    const rows=Array.isArray(history)?history:[];
    rows.sort((a,b)=>new Date(b.finished_at||0)-new Date(a.finished_at||0));
    const id=Number(rows[0]?.history_id);
    if(!Number.isFinite(id))throw new Error('Nenhum diagnóstico persistido disponível para exportação.');
    return id;
  }

  document.addEventListener('click',event=>{
    const historyButton=event.target.closest?.('[data-diagnostic-load]');
    if(historyButton)selectedDiagnosticHistoryId=Number(historyButton.dataset.diagnosticLoad);
    if(event.target.closest?.('#complete-run'))selectedDiagnosticHistoryId=null;
  },true);

  document.addEventListener('click',async event=>{
    const button=event.target.closest?.('#complete-export');
    if(!button||button.disabled)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const progress=document.querySelector('#complete-progress');
    const original=button.textContent;button.disabled=true;button.textContent='Exportando…';
    try{
      const id=await resolveExportHistoryId();
      const format=document.querySelector('#complete-export-format')?.value||'json';
      const exported=await api('/api/device/diagnostics/full/export-file',{method:'POST',body:{id,format}});
      if(progress)progress.textContent=`Relatório exportado: ${exported.saved_path}`;
    }catch(error){if(progress)progress.textContent=error.message}
    finally{button.disabled=false;button.textContent=original}
  },true);

  function enhance(){enhanceNormalDiagnostics();enhanceCompleteRecommendations()}
  new MutationObserver(enhance).observe(workspace,{childList:true,subtree:true});
  document.addEventListener('capabilities',enhance);
  enhance();
})();
