import {service,startService,subscribeService,setServiceNotes,formatService,observeOperation} from './model.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function mountServicePanel(store){
 const button=document.querySelector('#service-current');if(!button)return;
 const panel=document.createElement('dialog');panel.id='service-dialog';panel.className='service-dialog';panel.setAttribute('aria-label','Atendimento atual');
 panel.innerHTML='<div class="dialog-inner"><div class="dialog-header"><h2>Atendimento atual</h2><button class="button" data-dismiss>Fechar</button></div><p>Registro em memória desta sessão. Ao desconectar, o conteúdo é descartado.</p><label><input type="checkbox" data-secrets> Mostrar e incluir senhas completas ao copiar/exportar</label><label class="field">Observações do técnico<textarea data-notes rows="3"></textarea></label><div class="inline-actions"><button class="button" data-copy="summary">Copiar resumo</button><button class="button" data-copy="timeline">Copiar registro</button><button class="button" data-copy="markdown">Copiar markdown</button><button class="button" data-export>Exportar TXT</button><button class="button" data-clear>Limpar observações</button></div><label>Visualização <select data-mode><option value="summary">Resumo operacional</option><option value="timeline">Linha do tempo completa</option></select></label><p role="status" data-status></p><pre data-record tabindex="0"></pre></div>';
 document.body.append(panel);let secrets=false;
 const paint=()=>{button.textContent=`Atendimento atual (${service.entries.length})`;if(panel.open)panel.querySelector('[data-record]').textContent=formatService({secrets,summary:panel.querySelector('[data-mode]').value==='summary'})};
 subscribeService(paint);panel.querySelector('[data-mode]').onchange=paint;
 const show=()=>{secrets=false;panel.querySelector('[data-secrets]').checked=false;panel.querySelector('[data-notes]').value=service.notes;panel.classList.toggle('aero-theme',document.documentElement.dataset.experienceTheme==='aero');panel.showModal();paint()};
 button.onclick=show;document.addEventListener('open-service',show);
 panel.querySelector('[data-dismiss]').onclick=()=>panel.close();panel.addEventListener('close',()=>{secrets=false;panel.querySelector('[data-record]').textContent='';panel.querySelector('[data-notes]').value='';panel.querySelector('[data-secrets]').checked=false});
 panel.querySelector('[data-secrets]').onchange=e=>{secrets=e.target.checked;paint()};panel.querySelector('[data-notes]').oninput=e=>setServiceNotes(e.target.value);
 panel.querySelector('[data-clear]').onclick=()=>{setServiceNotes('');panel.querySelector('[data-notes]').value=''};
 panel.querySelectorAll('[data-copy]').forEach(b=>b.onclick=async()=>{try{await navigator.clipboard.writeText(formatService({secrets,summary:b.dataset.copy==='summary',markdown:b.dataset.copy==='markdown'}));panel.querySelector('[data-status]').textContent='Registro copiado.'}catch{panel.querySelector('[data-status]').textContent='Cópia indisponível. Selecione o texto do registro.'}});
 panel.querySelector('[data-export]').onclick=()=>{const url=URL.createObjectURL(new Blob([formatService({secrets})],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='atendimento.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
 document.addEventListener('app-context-ready',()=>{startService(store.session);if(!store.session?.connected&&panel.open)panel.close()});
 window.__amObserveOperation=observeOperation;
 window.addEventListener('pagehide',()=>startService(null));
}
