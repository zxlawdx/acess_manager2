import {metric,table,esc} from './ui.js';
export function diagnosticResult(d){
 const technical=`<details><summary>Ver resposta técnica</summary><pre>${esc(JSON.stringify(d.advanced||d,null,2))}</pre></details>`;
 const head=`<h3>${esc(d.target||'Destino não disponível')}</h3><p>${esc(d.status)} · ${esc(d.interface||'Interface não disponível')} · ${esc(d.protocol||'Protocolo não disponível')}</p>`;
 if(d.kind==='traceroute')return head+table([{label:'Hop',keys:['number']},{label:'IP / host',render:r=>esc(r.host||'*')},...[0,1,2].map(i=>({label:`Latência ${i+1}`,render:r=>r.latencies_ms?.[i]!=null?`${esc(r.latencies_ms[i])} ms`:'*'})),{label:'Status',render:r=>r.timeout?'Timeout':'Resposta recebida'}],d.hops||[],'Nenhum salto foi fornecido pelo equipamento.')+technical;
 return head+`<div class="grid">${[['Enviados','sent'],['Recebidos','received'],['Perda (%)','loss_percent'],['Mínimo (ms)','min_ms'],['Médio (ms)','avg_ms'],['Máximo (ms)','max_ms']].map(([label,key])=>metric(label,d[key]??'Não disponível')).join('')}</div>`+technical;
}
