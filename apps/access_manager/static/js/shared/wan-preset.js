// Suggested operator intent, filtered to fields actually returned by the session.
// IPv6 enums are deliberately preserved: IPv6CP and Auto are firmware-specific.
export const standardWanPreset={name:'internet_tr069',mode:'route',service_list:'INTERNET_TR069',mtu:'1492',link_mode:'PPP',transport_type:'PPPoE',auth_type:'Auto',trigger:'AlwaysOn',nat:'1',vlan_enabled:'1',vlan_id:'2000',priority:'0'};
export function suggestWanPreset(form,fields,inputName,checkName){
 for(const f of fields){const key=f.intent_key;if(!(key in standardWanPreset))continue;const input=form.elements.namedItem(inputName(f));if(!input)continue;const value=standardWanPreset[key];if(input.tagName==='SELECT'&&![...input.options].some(o=>o.value===value))continue;input.value=value;const check=form.querySelector(`[${checkName.attr}="${checkName.value(f)}"]`);if(check&&!check.disabled)check.checked=true;}
 form.dispatchEvent(new Event('input',{bubbles:true}));
}
