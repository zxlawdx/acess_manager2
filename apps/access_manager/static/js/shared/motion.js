// Feedback for observed changes only. No polling, layout reads or scrolling.
export function mountMotion(){
 const root=document.querySelector('#workspace');if(!root)return;
 const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)'),timers=new Map();
 const clear=()=>{for(const [el,timer] of timers){clearTimeout(timer);el.classList.remove('value-updated','row-entered')}timers.clear()};
 const mark=(el,name)=>{if(reduced?.matches||!el.isConnected)return;clearTimeout(timers.get(el));el.classList.add(name);timers.set(el,setTimeout(()=>{el.classList.remove(name);timers.delete(el)},240))};
 const observer=new MutationObserver(records=>{const changed=new Set();for(const r of records){
  const parent=r.target.nodeType===3?r.target.parentElement:r.target;
  const el=parent?.closest('.tech-value,.badge,[data-overview-status],tbody td');
  const previous=r.type==='characterData'?r.oldValue:[...r.removedNodes].map(n=>n.textContent).join('');
  if(el&&previous?.trim()&&previous!==r.target.textContent)changed.add(el);
  if(parent?.matches('tbody'))for(const node of r.addedNodes)if(node.nodeType===1&&node.matches('tr'))mark(node,'row-entered');
 }for(const el of changed)mark(el,'value-updated')});
 observer.observe(root,{childList:true,subtree:true,characterData:true,characterDataOldValue:true});
 reduced?.addEventListener?.('change',()=>{if(reduced.matches)clear()});
 window.addEventListener('pagehide',()=>{observer.disconnect();clear()},{once:true});
}
