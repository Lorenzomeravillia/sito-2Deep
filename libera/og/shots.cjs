/* node libera/og/shots.cjs <out dir>: a frame of the game with no date on it (the page built with --artifact, its data
   swapped for "no dates"), then og.html; convert og.png to assets/giochi/og-libera.jpg */
const {chromium}=require('playwright'),path=require('path'),fs=require('fs'),{execFileSync}=require('child_process');const D=path.resolve(process.argv[2]||'.')+'/';
(async()=>{const root=path.join(__dirname,'..','..');execFileSync('python3',[path.join(root,'libera','build.py'),'--artifact',D]);
  let html=fs.readFileSync(D+'libera_page.html','utf8').replace('window.__GAME_DATA=','window.__GAME_DATA0=').replace('"use strict";\nwindow.__GAME_DATA0=','"use strict";\nwindow.__GAME_DATA={events:[],venues:[],songs:[],photos:[]};window.__GAME_DATA0=');fs.writeFileSync(D+'og_game.html',html);
  const b=await chromium.launch();let p=await b.newPage({viewport:{width:600,height:1066},deviceScaleFactor:2});
  await p.addInitScript(()=>{const o=window.requestAnimationFrame.bind(window);window.__stopRAF=false;window.requestAnimationFrame=cb=>window.__stopRAF?0:o(cb);});
  await p.goto('file://'+D+'og_game.html');await p.waitForTimeout(700);await p.mouse.click(300,500);await p.waitForTimeout(200);
  await p.evaluate(()=>{const X=__X,G=X.G;
    for(let r=0;r<139;r++)for(let c=0;c<86;c++){if(r<80||(c<20&&r<139))X.grid[r*86+c]=1;}
    G.enemies[0].x=170;G.enemies[0].y=300;G.enemies.forEach((e,i)=>{if(i){e.x=110+i*40;e.y=280+i*12;}});
    G.trail=[[40,90,40,89]];X.grid[90*86+40]=2;G.px=40;G.py=90;G.draw=true;X.closeArea();
    [[200,360],[110,300],[226,268]].forEach(([x,y],i)=>{const e=G.enemies[i];if(e){e.x=x;e.y=y;e.vx=0;e.vy=0;}});for(let k=0;k<12;k++)X.grid[(80+k)*86+60]=2;G.trail=[];for(let k=0;k<12;k++)G.trail.push([60,80+k,60,79+k]);G.px=60;G.py=91;G.draw=true;G.dx=G.dy=0;G.infoQ=[];G.pops=[];G.items=[];
    for(let i=0;i<40;i++)X.update(1/60);G.lives=3;G.inv=0;G.pops=[];G.infoQ=[];});
  await p.evaluate(()=>{window.__stopRAF=true;});await p.waitForTimeout(80);await p.evaluate(()=>__X.draw());
  await p.locator('#c').screenshot({path:D+'frame.png'});await p.close();
  execFileSync('python3',[path.join(__dirname,'make_og.py'),D]);
  p=await b.newPage({viewport:{width:1200,height:630}});await p.goto('file://'+D+'og.html');await p.waitForFunction(()=>window.DONE===true);
  await p.locator('#c').screenshot({path:D+'og.png'});await b.close();console.log('saved '+D+'og.png');})();
