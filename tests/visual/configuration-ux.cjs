const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const portable=require('@sparticuz/chromium').default;
const {responses}=require('./fixtures.cjs');

const root=path.resolve(__dirname,'../..');
const base=path.join(root,'apps/access_manager');


const caps=Object.fromEntries(['device','clients','wan','lan','optical','wifi','wifi_radio','traffic','diagnostics','dhcp','dns','firewall','configuration_surfaces'].map(k=>[k,{read:'SUPPORTED',write:'SUPPORTED',enabled:{read:true,write:true}}]));
responses['/api/session']={connected:true,session:{session_id:'configuration-qa',vendor:'zte',model:'F670L',capabilities:caps}};
responses['/api/device/firewall']={enabled:true,level:'Middle'};
responses['/api/device/configuration/catalog']=[{id:'wan_crud',title:'Conexões WAN',category:'WAN'}];
const wanFields=['name','mode','link_mode','service_list','mtu','username','password','auth_type','trigger','ip_address','subnet_mask','gateway','dns1','dns2','vlan_enabled','vlan_id','priority','ipv6_acquire_mode','ipv6_dns1','prefix_delegation'].map((key,i)=>({key:'field_'+i,intent_key:key,label:key,group:i<4?'Identidade':i<9?'PPP / PPPoE':i<14?'IPv4':i<17?'VLAN':'IPv6',value:key==='password'?null:key==='name'?'internet_tr069':key==='vlan_id'?'2000':key==='mtu'?'1492':'0',secret:key==='password'}));
responses['/api/device/configuration/read']={instances:[{id:'wan1',label:'internet_tr069',fields:wanFields}]};
responses['/api/device/clients'][0]={...responses['/api/device/clients'][0],wifi_standard:'802.11ax',wifi_generation:6,wifi_mode_family:'AX',mcs:9,bandwidth:80};
responses['/api/profiles']=[{name:'Base',wan:{connections:[{id:'wan1',config:{vlan_id:'2000'}}]},firewall:{enabled:true,level:'Low'}}];
(async()=>{let browser;
  const server=http.createServer((req,res)=>{
    const url=new URL(req.url,'http://localhost');
    if(url.pathname.startsWith('/api/')){
      res.setHeader('Content-Type','application/json');
      res.end(JSON.stringify(responses[url.pathname]||{}));
      return;
    }
    if(url.pathname==='/'){
      const template=fs.readFileSync(path.join(base,'templates/index.html'),'utf8')
        .replace(/\{\{ static\('access_manager\/(.*?)'\) \}\}/g,'/assets/$1');
      res.setHeader('Content-Type','text/html; charset=utf-8');
      res.end('<!doctype html><html lang="pt-BR"><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>'+template+'</body></html>');
      return;
    }
    const requested=path.resolve(base,'static','.'+url.pathname.replace(/^\/assets/,''));
    if(!requested.startsWith(path.join(base,'static')+path.sep)){res.writeHead(404);res.end();return;}
    try{
      const type=requested.endsWith('.js')?'text/javascript':requested.endsWith('.css')?'text/css':requested.endsWith('.ttf')?'font/ttf':'application/octet-stream';
      res.setHeader('Content-Type',type);
      res.end(fs.readFileSync(requested));
    }catch{res.writeHead(404);res.end();}
  });


 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{browser=await chromium.launch({executablePath:process.env.ACCESS_MANAGER_CHROMIUM||await portable.executablePath(),args:portable.args,headless:true});const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const theme of ['terminal','aero'])for(const [width,height] of [[1366,768],[1600,900],[1920,1080]]){
  await page.setViewportSize({width,height});await page.goto('http://127.0.0.1:'+server.address().port,{waitUntil:'networkidle'});await page.locator('.topology-root').waitFor();await page.selectOption('#theme-select',theme);
  await page.click('[data-view="management"]');await page.click('[data-config="firewall"]');assert.equal(await page.locator('[name="level"]').inputValue(),'Middle');assert.equal(await page.locator('[name="level"] option').count(),3);await page.click('[data-close-dialog]');
  await page.click('[data-view="wan"]');await page.click('[data-wan-edit]');assert.equal(await page.locator('[name="field_6"]').inputValue(),'');
  const layout=await page.evaluate(()=>{const d=document.querySelector('#action-dialog'),b=d.querySelector('button[form="surface-form"]'),r=b.getBoundingClientRect();return {top:r.top,bottom:r.bottom,overflow:document.querySelector('.app-main').scrollWidth-document.querySelector('.app-main').clientWidth,width:d.getBoundingClientRect().width}});assert.ok(layout.top>=0&&layout.bottom<=height,JSON.stringify(layout));assert.ok(layout.overflow<=2);assert.ok(layout.width<=width);await page.click('[data-close-dialog]');
  await page.click('[data-view="clients"]');assert.match(await page.locator('#client-results').innerText(),/Wi-Fi 6/);await page.click('[data-client="0"]');assert.match(await page.locator('#dialog-body').innerText(),/802.11ax/);await page.click('[data-close-dialog]');
  await page.click('[data-view="dhcpdns"]');await page.locator('#dns-presets').waitFor();assert.match(await page.locator('#workspace').innerText(),/Não disponível neste firmware\/login/);await page.click('#dns-presets');assert.equal(await page.locator('[name="ipv4_1"]').inputValue(),'');await page.click('[data-close-dialog]');
  await page.click('[data-view="profiles"]');await page.click('[data-edit-profile="Base"]');await page.locator('[data-profile-wan-preset]').waitFor();assert.equal(await page.locator('[name="firewall-level"]').inputValue(),'Low');const save=await page.locator('#save-profile').boundingBox();assert.ok(save.y>=0&&save.y+save.height<=height);await page.click('[data-close-dialog]');
  console.log(`${theme} ${width}x${height}: firewall, WAN, clients, DNS and profiles OK`);
 }
 assert.deepEqual(errors,[]);
 }finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1});
