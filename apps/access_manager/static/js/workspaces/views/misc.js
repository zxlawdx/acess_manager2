import {diagnosticResult} from '../../shared/diagnostics.js';
import {request} from '../../services/api.js';
import {kv,cap,esc,toast} from '../../shared/ui.js';

export async function diagnostics(){
  const c=cap('diagnostics');
  const enabled=Boolean(c.enabled?.write);
  return `<section class="panel"><div class="panel-header"><div><h2>Diagnóstico</h2><span class="muted">Execute testes a partir do equipamento conectado.</span></div></div>
    <div class="split">
      <form id="ping-form" class="form-grid"><h3>Ping</h3><div class="field"><label>Destino</label><input name="host" value="8.8.8.8" required></div><div class="field"><label>Repetições</label><input name="count" type="number" min="1" max="20" value="4"></div><button class="button primary" ${enabled?'':'disabled'}>Executar ping</button></form>
      <form id="trace-form" class="form-grid"><h3>Traceroute</h3><div class="field"><label>Destino</label><input name="host" value="8.8.8.8" required></div><button class="button primary" ${enabled?'':'disabled'}>Executar traceroute</button></form>
    </div>
    <div id="diagnostic-result" class="panel"><span class="muted">${enabled?'Pronto para executar.':`Capability diagnostics.write = ${esc(c.write)}.`}</span></div>
  </section>`;
}

export function mountDiagnostics(){
  const out=document.querySelector('#diagnostic-result');
  const wire=(selector,path)=>{const form=document.querySelector(selector);if(!form||!out)return;form.onsubmit=async e=>{e.preventDefault();const fd=new FormData(form);const payload={host:String(fd.get('host')||'')};if(fd.get('count'))payload.count=Number(fd.get('count'));out.innerHTML='<span class="muted">Executando…</span>';try{const result=await request(path,{method:'POST',body:JSON.stringify(payload)});out.innerHTML=diagnosticResult(result)}catch(err){out.innerHTML=`<div class="notice danger">${esc(err.message)}</div>`;toast(err.message)}}};
  wire('#ping-form','/api/device/diagnostics/ping');
  wire('#trace-form','/api/device/diagnostics/traceroute');
}

export async function deployment(){return `<section class="panel"><div class="panel-header"><h2>Implantação</h2></div><div class="notice warning">Workspace destinado a modelo/firmware desconhecido ou capability candidata. Ele não é uma autorização de escrita para operações já suportadas.</div></section>`}
