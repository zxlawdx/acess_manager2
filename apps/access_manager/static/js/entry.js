import {mountTheme} from './shared/theme.js';
import {mountMotion} from './shared/motion.js';
import {mountApp} from './workspaces/app.js';
const root=document.querySelector('.app-shell');
if(root&&root.dataset.runtimeMounted!=='true'){
 root.dataset.runtimeMounted='true';
 mountTheme();
 mountApp().then(mountMotion).catch(error=>{console.error('[Access Manager]',error);root.dataset.runtimeMounted='failed'});
}
