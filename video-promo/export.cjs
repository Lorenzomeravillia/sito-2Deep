const { chromium } = require('playwright');
const { spawn } = require('child_process');
(async () => {
  const out = process.argv[2], FMT = process.argv[3] || 'portrait', FPS = 30;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 400, height: 720 } });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e)));
  await page.goto('file://' + require('path').join(__dirname,'build','page.html')+'?export=1');
  await page.waitForFunction(() => window.__render);
  if (FMT === 'landscape') await page.evaluate(() => window.__setFormat('landscape'));
  const dur = await page.evaluate(() => window.__DUR);
  const wav = await page.evaluate(async () => await window.__audioWav(44100));
  require('fs').writeFileSync('audio.wav', Buffer.from(wav, 'base64'));
  const n = Math.round(dur * FPS);
  const ff = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
    '-vf', (FMT === 'landscape' ? 'scale=1920:1080' : 'scale=1080:1920') + ':flags=neighbor,format=yuv420p', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', '-tune', 'animation',
    '-pix_fmt', 'yuv420p', '-r', String(FPS), '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise(r => ff.on('close', r));
  for (let i = 0; i < n; i++) {
    const b64 = await page.evaluate(t => { window.__render(t); return document.getElementById('c').toDataURL('image/png').split(',')[1]; }, i / FPS);
    if (!ff.stdin.write(Buffer.from(b64, 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
  }
  ff.stdin.end();
  const code = await done;
  console.log('frames', n, 'ffmpeg exit', code, 'errors', errs.length);
  await browser.close();
  process.exit(code);
})();
