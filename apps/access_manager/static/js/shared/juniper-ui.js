import {esc,dialog} from './ui.js';
export const button=(label,route)=>`<button class="button" data-juniper-route="${esc(route)}">${esc(label)}</button>`;
export const empty=(title,description='')=>`<div class="j-empty"><strong>${esc(title)}</strong><p>${esc(description)}</p></div>`;
export const status=value=>`<span class="j-status ${/^(active|ativo|up|online|session up)$/i.test(value||'')?'ok':''}"><i></i>${esc(({Active:'Ativo',Online:'Online'})[value]||value||'Não disponível')}</span>`;
export const kv=items=>`<dl class="j-kv">${items.map(([label,value])=>`<div><dt>${esc(label)}</dt><dd>${esc(Array.isArray(value)?value.join(', ')||'—':value??'—')}</dd></div>`).join('')}</dl>`;
export function drawer(title,content,actions=''){
 const d=dialog(title,`<div class="j-drawer-content">${content}</div>`,actions);d.classList.add('j-drawer');
 // A drawer is a bounded decision surface. The underlying list stays visible.
 return d;
}
export function tabs(items,active,attribute='data-j-tab'){
 return `<div class="j-tabs" role="tablist">${items.map(([id,label])=>`<button type="button" role="tab" aria-selected="${id===active}" ${attribute}="${esc(id)}" class="${id===active?'active':''}">${esc(label)}</button>`).join('')}</div>`;
}
export function dataTable(columns,rows,selectAttribute=''){
 if(!rows?.length)return empty('Nenhum registro retornado','A ausência de dados não confirma falha no equipamento.');
 return `<div class="j-table-scroll"><table class="data-table"><thead><tr>${columns.map(([label])=>`<th scope="col">${esc(label)}</th>`).join('')}</tr></thead><tbody>${rows.map((row,index)=>`<tr ${selectAttribute?`${selectAttribute}="${index}"`:''}>${columns.map(([,render])=>`<td>${render(row,index)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
