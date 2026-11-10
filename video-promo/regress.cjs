// node regress.cjs <page.html> <outdir> : renders fixed times in both formats, saves PNGs + hash list
const {chromium}=require('playwright');const fs=require('fs');const crypto=require('crypto');const path=require('path');
const TS=[0.5,2.0,2.3,3.4,4.2,5.6,6.5,8.4,9.8,10.5,12.6,14.2,15.0,16.4,16.9,18.5,20.5,22.5,25.5,27.6,29,30.5,32,33.5,35,36.5];
(async()=>{const [pg,out]=process.argv.slice(2);fs.mkdirSync(out,{recursive:true});
const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.resolve(pg)+'?export=1');await p.waitForFunction(()=>window.__render);
const res={};for(const fmt of ['portrait','landscape']){await p.evaluate(f=>window.__setFormat(f),fmt);
 for(const t of TS){const d=await p.evaluate(t=>{window.__render(t);return document.getElementById('c').toDataURL();},t);
  const buf=Buffer.from(d.split(',')[1],'base64');fs.writeFileSync(`${out}/${fmt}_${t}.png`,buf);
  const raw=await p.evaluate(()=>{const c=document.getElementById('c');return Array.from(new Uint8Array(c.getContext('2d').getImageData(0,0,c.width,c.height).data.buffer)).join(',').length+':'+c.toDataURL().length;});
  res[fmt+'_'+t]=crypto.createHash('md5').update(buf).digest('hex');}}
fs.writeFileSync(out+'/hash.json',JSON.stringify(res,null,1));console.log('errors',errs,'frames',Object.keys(res).length);await b.close();})();
