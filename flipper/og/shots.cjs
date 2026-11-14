/* node flipper/og/shots.cjs <dir with pinball_page.html>: table.png (a frozen frame of the game, the date-free playfield),
   then og.html (make_og.py) is drawn and saved as og.png; convert it to assets/flipper/og-gioca.jpg (JPEG ~92, under 300 KB) */
const {chromium}=require('playwright'),path=require('path'),{execFileSync}=require('child_process');const D=path.resolve(process.argv[2]||'.')+'/';
(async()=>{const b=await chromium.launch();
  let p=await b.newPage({viewport:{width:600,height:1000},deviceScaleFactor:3});
  await p.addInitScript(()=>{Object.defineProperty(window,'__LVE',{configurable:true,set(v){window.__lveReal=v;},get(){const v=window.__lveReal;return v?Object.assign(Object.create(v),{levels:[]}):v;}});
    const o=window.requestAnimationFrame.bind(window);window.__stopRAF=false;window.requestAnimationFrame=cb=>window.__stopRAF?0:o(cb);});
  await p.goto('file://'+D+'pinball_page.html');await p.waitForTimeout(800);await p.mouse.click(300,500);await p.waitForTimeout(500);
  await p.evaluate(()=>{const G=__G;G.state='play';G.launchT=G.now-20;G.saveUntil=0;G.lit=[1,1,1,1];G.liveUntil=G.now+60;G.encoreLit=true;__setBalls([{x:150,y:250,vx:-60,vy:-200,still:0}]);for(let i=0;i<20;i++)__update(1/120);});
  await p.waitForTimeout(900);await p.evaluate(()=>{window.__stopRAF=true;});await p.waitForTimeout(100);
  await p.evaluate(()=>{const G=__G;G.pops=[];G.now=Math.floor(G.now*5/2)*2/5+0.3;G.liveUntil=G.now+30;__setBalls([{x:104,y:232,vx:0,vy:0,still:0}]);__say([{l1:'2DEEP PINBALL',l2:'GIOCA ORA',d:999}],9);__draw();});
  await p.locator('#c').screenshot({path:D+'table.png'});await p.close();
  execFileSync('python3',[path.join(__dirname,'make_og.py'),D]);
  p=await b.newPage({viewport:{width:1200,height:630},deviceScaleFactor:1});await p.goto('file://'+D+'og.html');await p.waitForFunction(()=>window.DONE===true);await p.waitForTimeout(200);
  await p.locator('#c').screenshot({path:D+'og.png'});await b.close();console.log('saved '+D+'og.png');})();
