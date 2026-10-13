import {request} from '../../services/api.js';
import {table,pick,cap,dialog,toast,esc,kv} from '../../shared/ui.js';

function actionButtons(r){
  const id=pick(r,'id','_InstID','ssid_id');
  const buttons=[];
  if(cap('wifi').enabled?.read){
    buttons.push(`<button class="button" data-reveal-wifi="${esc(id)}">Ver senha</button>`);
  }
  if(cap('wifi').enabled?.write){
    buttons.push(`<button class="button" data-edit-ssid="${esc(id)}" data-current-ssid="${esc(pick(r,'ssid','ESSID','name'))}">Editar</button>`);
  }else{
    buttons.push('<span class="muted">Somente leitura</span>');
  }
  return `<div class="inline-actions">${buttons.join('')}</div>`;
}

export async function render(){
  const data=await request('/api/device/wifi');
  const nets=Array.isArray(data)?data:(data?.networks||[]);
  const radios=data?.radios||[];
  return `<section class="panel"><div class="panel-header"><h2>Redes Wi-Fi</h2><span class="muted">Escrita: ${esc(cap('wifi').write)}</span></div></section>${table([
    {label:'SSID',keys:['ssid','ESSID','name']},
    {label:'Band',keys:['band','banda','WLANViewName']},
    {label:'Ativo',render:r=>String(pick(r,'ativo','enabled','Enable'))},
    {label:'Canal',keys:['channel','canal']},
    {label:'Clientes',keys:['clients','client_count']},
    {label:'',render:actionButtons}
  ],nets,'Nenhum SSID retornado.')}<section class="panel"><div class="panel-header"><h2>Rádios</h2></div>${Array.isArray(radios)&&radios.length?radios.map(r=>`<div style="margin-bottom:8px">${kv(r)}</div>`).join(''):'<span class="muted">Sem dados de rádio.</span>'}</section>`;
}

export function mount(){
  document.querySelectorAll('[data-reveal-wifi]').forEach(btn=>{
    btn.onclick=async()=>{
      btn.disabled=true;
      try{
        const data=await request('/api/device/wifi/reveal-password',{method:'POST',body:'{}'});
        const rows=Array.isArray(data)?data:(data?.networks||[]);
        const row=rows.find(item=>String(pick(item,'id','_InstID','ssid_id'))===String(btn.dataset.revealWifi));
        if(!row?.password) throw new Error('O firmware/login não expôs a senha deste SSID.');
        dialog('Senha Wi-Fi',`<div class="kv-grid"><div class="kv"><label>SSID</label><span>${esc(pick(row,'ssid','ESSID','name'))}</span></div><div class="kv"><label>Senha</label><span style="user-select:all">${esc(row.password)}</span></div></div><div class="notice warning">Leitura sob demanda da sessão autenticada; a chave não é mantida no snapshot normal.</div>`);
      }catch(err){toast(err.message)}finally{btn.disabled=false}
    };
  });

  document.querySelectorAll('[data-edit-ssid]').forEach(btn=>btn.onclick=()=>{
    const id=btn.dataset.editSsid;
    const current=btn.dataset.currentSsid==='—'?'':btn.dataset.currentSsid;
    const d=dialog('Editar SSID',`<form id="ssid-form" class="form-grid"><input type="hidden" name="ssid_id" value="${esc(id)}"><div class="field"><label>Nome da rede</label><input name="ssid" value="${esc(current)}" maxlength="32"></div><div class="field"><label>Nova senha (opcional)</label><input name="password" type="password" minlength="8" maxlength="63" autocomplete="new-password"></div><div class="field"><label><input name="enabled" type="checkbox" checked> SSID habilitado</label></div><div class="field"><label><input name="broadcast" type="checkbox" checked> Broadcast habilitado</label></div><div class="dialog-footer"><button class="button" type="button" data-cancel>Cancelar</button><button class="button primary" type="submit">Aplicar</button></div></form>`);
    const f=d.querySelector('#ssid-form');
    f.querySelector('[data-cancel]').onclick=()=>d.close();
    f.onsubmit=async e=>{
      e.preventDefault();
      const fd=new FormData(f);
      const config={ssid:String(fd.get('ssid')||''),enabled:fd.get('enabled')==='on',broadcast:fd.get('broadcast')==='on'};
      const password=String(fd.get('password')||'');
      if(password)config.password=password;
      try{
        await request('/api/device/wifi/ssid',{method:'POST',body:JSON.stringify({ssid_id:id,config})});
        d.close();toast('Alteração enviada e validada pelo provider.');document.dispatchEvent(new CustomEvent('refresh-view'));
      }catch(err){toast(err.message)}
    };
  });
}
