// node scntest.cjs <name> <json cfg> t... : keyframes with a given config (portrait + landscape) into prev/
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
(async()=>{const [name,cfg,...ts]=process.argv.slice(2);const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.join(__dirname,'build','page.html')+'?export=1');await p.waitForFunction(()=>window.__render);
await p.evaluate(c=>window.__setCfg(JSON.parse(c)),cfg);
for(const fmt of ['portrait','landscape']){await p.evaluate(f=>window.__setFormat(f),fmt);
 for(const t of ts){const d=await p.evaluate(t=>{window.__render(t);return document.getElementById('c').toDataURL();},+t);fs.writeFileSync(`prev/s_${name}_${fmt}_${t}.png`,Buffer.from(d.split(',')[1],'base64'));}}
console.log(JSON.stringify((await p.evaluate(()=>window.__cfg())).LV.map(l=>[l.n,l.scene,l.venue,l.soon])),'errors',errs);await b.close();})();
