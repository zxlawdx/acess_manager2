// Update a read-only region without replacing its root, scroll or dirty inputs.
export function patchHTML(host,html){const template=document.createElement('template');template.innerHTML=html;
 const patch=(parent,next)=>{for(let i=0;i<next.childNodes.length||i<parent.childNodes.length;i++){const a=parent.childNodes[i],b=next.childNodes[i];if(!b){a.remove();i--;continue}if(!a){parent.append(b.cloneNode(true));continue}if(a.nodeType!==b.nodeType||a.nodeName!==b.nodeName){a.replaceWith(b.cloneNode(true));continue}if(a.nodeType===3){if(a.textContent!==b.textContent)a.textContent=b.textContent;continue}if(a.nodeType!==1)continue;
 const input=a.matches('input,select,textarea'),dirty=input&&(a.dataset.dirty==='true'||a===document.activeElement),value=a.value,checked=a.checked;
 if(a.matches('form')&&a.dataset.dirty==='true')continue;
 for(const attr of [...a.attributes])if(!b.hasAttribute(attr.name)&&attr.name!=='data-dirty')a.removeAttribute(attr.name);
 for(const attr of b.attributes)if(a.getAttribute(attr.name)!==attr.value)a.setAttribute(attr.name,attr.value);
 patch(a,b);if(dirty){a.value=value;a.checked=checked}
 }};patch(host,template.content)
}
