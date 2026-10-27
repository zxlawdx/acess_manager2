import {esc} from './ui.js';

export const firewallLevels=[
 {value:'Low',label:'Baixo'},
 {value:'Middle',label:'Médio (recomendado)'},
 {value:'High',label:'Alto'},
];

export const firewallLevelLabel=value=>firewallLevels.find(option=>String(option.value)===String(value))?.label||String(value??'');

export const firewallLevelField=value=>({
 key:'level',
 label:'Nível de firewall',
 control:'select',
 options:firewallLevels,
 value,
 help:'Nível global do firewall: Baixo, Médio (recomendado) ou Alto.',
});

export function fieldControl(f){
 const control=f.control||(f.secret?'password':f.options?'select':f.type==='bool'?'boolean':f.type||'text');
 const options=control==='boolean'?[{value:'true',label:'Habilitado'},{value:'false',label:'Desabilitado'}]:f.options;
 let value=control==='boolean'?String(f.value===true||f.value===1||f.value==='1'||f.value==='true'):String(f.value??'');
 if(typeof f.value==='boolean'&&options?.some(o=>o.value==='1'))value=f.value?'1':'0';
 const attrs=`name="${esc(f.key)}" ${f.disabled||(options&&options.length===0)?'disabled':''} ${f.required?'required':''}`;
 if(options||control==='select')return `<select ${attrs}>${(options||[]).some(o=>String(o.value)===value)?'':`<option value="" disabled selected>Não informado pelo equipamento</option>`}${(options||[]).map(o=>`<option value="${esc(o.value)}" ${String(o.value)===value?'selected':''}>${esc(o.label??o.value)}</option>`).join('')}</select>`;
 return `<input ${attrs} type="${['password','number'].includes(control)?control:control==='vlan'?'number':'text'}" value="${f.secret?'':esc(value)}" autocomplete="${f.secret?'new-password':'off'}" ${['min','max','step','placeholder'].filter(k=>f[k]!=null).map(k=>`${k}="${esc(f[k])}"`).join(' ')}>`;
}

// Conditions reference another FieldSpec key (or a canonical intent_key on a surface).
export function bindFieldConditions(form,fields){
 const update=()=>{for(const f of fields){if(!f.visibleWhen)continue;const condition=f.visibleWhen,source=fields.find(s=>(condition.key&&s.key===condition.key)||(condition.intent_key&&s.intent_key===condition.intent_key)),parent=source&&form.elements.namedItem(source.key),input=form.elements.namedItem(f.key),container=input?.closest('.field');if(!parent||!container)continue;const hidden=!(condition.values||[condition.equals]).map(String).includes(String(parent.value));container.hidden=hidden;const checkbox=container.querySelector('[data-change]');if(checkbox)checkbox.disabled=hidden||Boolean(f.disabled);input.disabled=hidden||Boolean(f.disabled)||(checkbox&&!checkbox.checked);}};
 form.addEventListener('input',update);form.addEventListener('change',update);update();return update;
}
