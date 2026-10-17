const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const portable=require('@sparticuz/chromium').default;
const {responses}=require('./fixtures.cjs');

const root=path.resolve(__dirname,'../..');
const base=path.join(root,'apps/access_manager');

(async()=>{
  let browser;
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
  try{
    const executablePath=process.env.ACCESS_MANAGER_CHROMIUM||await portable.executablePath();
    browser=await chromium.launch({executablePath,args:portable.args,headless:true});
    const page=await browser.newPage();
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));

    for(const [width,height] of [[1366,768],[1600,900],[1920,1080]]){
      await page.setViewportSize({width,height});
      await page.goto('http://127.0.0.1:'+server.address().port,{waitUntil:'networkidle'});
      await page.locator('.topology-root').waitFor({timeout:8000});
      await page.evaluate(()=>document.fonts.ready);

      const shell=await page.evaluate(()=>{
        const style=s=>getComputedStyle(document.querySelector(s));
        const rect=s=>document.querySelector(s).getBoundingClientRect();
        return {
          theme:document.documentElement.dataset.theme,
          bodyBg:style('body').backgroundColor,
          panelBg:style('.am-panel').backgroundColor,
          panelRadius:style('.am-panel').borderRadius,
          panelShadow:style('.am-panel').boxShadow,
          font:style('body').fontFamily,
          mainOverflow:document.querySelector('.app-main').scrollWidth-document.querySelector('.app-main').clientWidth,
          shellRight:rect('.app-shell').right,
          shellBottom:rect('.app-shell').bottom,
        };
      });

      assert.equal(shell.theme,'terminal');
      assert.equal(shell.bodyBg,'rgb(10, 10, 10)');
      assert.equal(shell.panelRadius,'0px');
      assert.equal(shell.panelShadow,'none');
      assert.match(shell.font,/Space Mono/i);
      assert.ok(shell.mainOverflow<=2,`main overflow at ${width}`);
      assert.ok(Math.abs(shell.shellRight-width)<=1,`shell width at ${width}`);
      assert.ok(Math.abs(shell.shellBottom-height)<=1,`shell height at ${height}`);

      if(width===1366){
        await page.evaluate(()=>{
          const dialog=document.querySelector('#action-dialog');
          dialog.className='juniper-surface';
          dialog.querySelector('#dialog-body').innerHTML=`<div class="dialog-inner">
            <div class="dialog-header"><h2 id="dialog-title">Identidade SSH do servidor</h2><button class="icon-button" data-close-dialog>×</button></div>
            <div class="j-trust-body">
              <div class="j-trust-alert" role="alert"><strong>Chave SSH reconhecida</strong><p>Compare a impressão digital com uma fonte confiável antes de aceitar.</p></div>
              <dl class="j-kv">
                <div><dt>Servidor</dt><dd>10.200.1.201:50022</dd></div>
                <div><dt>Algoritmo</dt><dd>ssh-ed25519</dd></div>
                <div><dt>Fingerprint apresentado</dt><dd>SHA256:wt53Ej5214KaujkA9eM6QITzJYW/iUH1QVqrIo2heo0</dd></div>
                <div><dt>Fingerprints anteriores</dt><dd>SHA256:wt53Ej5214KaujkA9eM6QITzJYW/iUH1QVqrIo2heo0</dd></div>
              </dl>
            </div>
            <div class="dialog-footer"><button class="button primary">Confirmei a identidade — confiar nesta chave</button></div>
          </div>`;
          dialog.showModal();
        });

        const modal=await page.evaluate(()=>{
          const d=document.querySelector('#action-dialog');
          const alert=d.querySelector('.j-trust-alert');
          const footer=d.querySelector('.dialog-footer');
          const value=d.querySelector('.j-kv dd');
          const r=d.getBoundingClientRect();
          const a=getComputedStyle(alert),f=getComputedStyle(footer),v=getComputedStyle(value),ds=getComputedStyle(d);
          return {
            left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height,
            dialogBg:ds.backgroundColor,dialogRadius:ds.borderRadius,
            alertBg:a.backgroundColor,alertColor:a.color,
            footerBg:f.backgroundColor,valueColor:v.color,
            overflow:d.scrollWidth-d.clientWidth,
          };
        });
        assert.ok(modal.left>=0&&modal.top>=0&&modal.right<=width+1&&modal.bottom<=height+1,'SSH modal stays inside viewport');
        assert.equal(modal.dialogRadius,'0px');
        assert.notEqual(modal.dialogBg,'rgb(255, 255, 255)');
        assert.notEqual(modal.alertBg,'rgb(241, 234, 254)');
        assert.notEqual(modal.footerBg,'rgb(255, 255, 255)');
        assert.ok(modal.overflow<=1,'SSH modal has no horizontal overflow');
        await page.screenshot({path:path.join(root,'docs/screenshots/terminal-theme-1366.png'),fullPage:false});
        await page.evaluate(()=>document.querySelector('#action-dialog').close());
      }
    }

    assert.deepEqual(errors,[]);
    console.log('Terminal theme smoke: 1366x768, 1600x900, 1920x1080 and SSH modal OK.');
  }finally{
    if(browser)await browser.close();
    server.close();
  }
})().catch(error=>{console.error(error);process.exitCode=1});
