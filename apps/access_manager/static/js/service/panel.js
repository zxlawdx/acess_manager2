import {service,startService,clearService,detachService,subscribeService,setServiceNotes,formatService,observeOperation} from './model.js';
import {copyText} from '../shared/clipboard.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const exitPolicyKey='accessManager.serviceLog.exitPolicy';
const readExitPolicy=()=>{try{const value=localStorage.getItem(exitPolicyKey);return ['ask','keep','clear'].includes(value)?value:'ask'}catch{return 'ask'}};
const writeExitPolicy=value=>{try{localStorage.setItem(exitPolicyKey,value)}catch{}};

// QtWebEngine clipboard ownership is avoided in packaged desktop builds.
// If the Python desktop backend cannot copy, leave the rendered record selected
// so the operator still has a manual Ctrl+C fallback without a native crash.
function selectRecordForManualCopy(panel){
 const record=panel.querySelector('[data-record]');if(!record)return;
 try{record.focus({preventScroll:true})}catch{record.focus?.()}
 const selection=window.getSelection?.();if(!selection||!document.createRange)return;
 const range=document.createRange();range.selectNodeContents(record);selection.removeAllRanges();selection.addRange(range);
}

export function mountServicePanel(store){
 const button=document.querySelector('#service-current');if(!button)return;
 const panel=document.createElement('dialog');panel.id='service-dialog';panel.className='service-dialog';panel.setAttribute('aria-label','Atendimento atual');
 panel.innerHTML='<div class="dialog-inner"><div class="dialog-header"><h2>Atendimento atual</h2><button class="button" data-dismiss>Fechar</button></div><p>Registro em memória do atendimento atual. Você pode manter o registro ao sair do roteador ou limpar automaticamente.</p><label class="field">Ao sair do roteador<select data-exit-policy><option value="ask">Perguntar se deseja limpar</option><option value="keep">Manter atendimento</option><option value="clear">Limpar automaticamente</option></select></label><label><input type="checkbox" data-secrets> Incluir senhas na visualização, cópia e exportação</label><label class="field">Observações do técnico<textarea data-notes rows="3"></textarea></label><div class="inline-actions"><button class="button primary" data-copy="selected">Copiar atendimento</button><button class="button" data-copy="technical">Copiar detalhes técnicos</button><button class="button" data-copy="markdown">Copiar markdown</button><button class="button" data-export>Exportar TXT</button><button class="button" data-clear-service>Limpar atendimento</button><button class="button" data-clear-notes>Limpar observações</button></div><label>Formato da cópia <select data-mode><option value="summary">Resumo operacional</option><option value="timeline">Linha do tempo</option><option value="prose">Texto corrido</option><option value="technical">Detalhes técnicos / JSON</option></select></label><p role="status" data-status></p><pre data-record tabindex="0"></pre></div>';
 document.body.append(panel);let secrets=false,wasConnected=Boolean(store.session?.connected);
 const status=message=>{panel.querySelector('[data-status]').textContent=message};
 const paint=()=>{panel.querySelector('[data-export]').textContent=panel.querySelector('[data-mode]').value==='technical'?'Exportar JSON técnico':'Exportar TXT';button.textContent=`Atendimento atual (${service.entries.length})`;if(panel.open)panel.querySelector('[data-record]').textContent=formatService({secrets,mode:panel.querySelector('[data-mode]').value})};
 subscribeService(paint);panel.querySelector('[data-mode]').onchange=paint;
 const show=()=>{secrets=false;panel.querySelector('[data-mode]').value='summary';panel.querySelector('[data-secrets]').checked=false;panel.querySelector('[data-notes]').value=service.notes;panel.querySelector('[data-exit-policy]').value=readExitPolicy();panel.classList.toggle('aero-theme',document.documentElement.dataset.experienceTheme==='aero');panel.showModal();paint()};
 button.onclick=show;document.addEventListener('open-service',show);
 panel.querySelector('[data-dismiss]').onclick=()=>panel.close();panel.addEventListener('close',()=>{secrets=false;panel.querySelector('[data-record]').textContent='';panel.querySelector('[data-notes]').value='';panel.querySelector('[data-secrets]').checked=false});
 panel.querySelector('[data-secrets]').onchange=e=>{secrets=e.target.checked;paint()};panel.querySelector('[data-notes]').oninput=e=>setServiceNotes(e.target.value);
 panel.querySelector('[data-exit-policy]').onchange=e=>{writeExitPolicy(e.target.value);status(e.target.value==='clear'?'O atendimento será limpo ao sair do roteador.':e.target.value==='keep'?'O atendimento será mantido ao sair do roteador.':'Você será perguntado ao sair do roteador.')};
 panel.querySelector('[data-clear-notes]').onclick=()=>{setServiceNotes('');panel.querySelector('[data-notes]').value='';status('Observações limpas.')};
 panel.querySelector('[data-clear-service]').onclick=()=>{if(!service.id&&!service.entries.length){status('O atendimento já está vazio.');return}if(!window.confirm('Limpar todo o atendimento atual? Esta ação apaga a linha do tempo e as observações desta sessão.'))return;clearService({keepSession:Boolean(store.session?.connected)});panel.querySelector('[data-notes]').value='';status(store.session?.connected?'Atendimento limpo. O novo registro continuará nesta conexão.':'Atendimento limpo.');paint()};
 panel.querySelectorAll('[data-copy]').forEach(b=>b.onclick=async()=>{
  const text=formatService({secrets,mode:b.dataset.copy==='technical'?'technical':panel.querySelector('[data-mode]').value,markdown:b.dataset.copy==='markdown'});
  b.disabled=true;
  try{
   await copyText(text);
   status('Registro copiado.');
  }catch{
   selectRecordForManualCopy(panel);
   status('Não foi possível copiar automaticamente. O registro foi selecionado; pressione Ctrl+C.');
  }finally{b.disabled=false}
 });
 panel.querySelector('[data-export]').onclick=()=>{const url=URL.createObjectURL(new Blob([formatService({secrets,mode:panel.querySelector('[data-mode]').value})],{type:panel.querySelector('[data-mode]').value==='technical'?'application/json;charset=utf-8':'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=panel.querySelector('[data-mode]').value==='technical'?'atendimento-tecnico.json':'atendimento.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
 const handleDisconnect=()=>{if(!service.id)return;const policy=readExitPolicy();if(policy==='clear'){clearService();return}if(policy==='keep'){detachService();return}if(window.confirm('Você saiu do roteador. Deseja limpar o atendimento atual?\n\nOK = limpar\nCancelar = manter para continuar depois'))clearService();else detachService()};
 document.addEventListener('app-context-ready',()=>{const connected=Boolean(store.session?.connected);if(connected)startService(store.session);else if(wasConnected)handleDisconnect();wasConnected=connected;if(!connected&&panel.open)panel.close()});
 if(store.session?.connected)startService(store.session);
 window.__amObserveOperation=observeOperation;
 window.addEventListener('pagehide',()=>clearService());
}
