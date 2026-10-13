import {mountApp} from './workspaces/app.js';
const root=document.querySelector('.app-shell');
if(root&&root.dataset.runtimeMounted!=='true'){
 root.dataset.runtimeMounted='true';
 mountApp().catch(error=>{console.error('[NetPulse]',error);root.dataset.runtimeMounted='failed'});
}
