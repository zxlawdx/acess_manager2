import {dialog} from './ui.js';
export function drawer(title,content,actions=''){
 const d=dialog(title,`<div class="j-drawer-content">${content}</div>`,actions);d.classList.add('j-drawer');
 // A drawer is a bounded decision surface. The underlying list stays visible.
 return d;
}
