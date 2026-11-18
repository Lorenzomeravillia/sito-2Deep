# Cuts the long recorded run to the final promo: start (hook, launch, multiball), the boss, the finale and end card.
# Every cut on a bar line of the game's own music; a short white flash on the picture, 25 ms fades on the sound.
import json,subprocess,sys,os
D=os.path.dirname(os.path.abspath(__file__))+'/out/'
E=json.load(open(D+'events.json'));ev=E['ev'];bars=E['bars'];T_END=E['frames']/30
def bar_near(x):return min(bars,key=lambda b:abs(b-x))
def bar_after(x):return min([b for b in bars if b>=x] or [x])
def bar_before(x):return max([b for b in bars if b<=x] or [x])
segs=[(0.0,bar_near(float(sys.argv[1]) if len(sys.argv)>1 else 8.5))]
if 'boss' in ev:segs.append((bar_before(ev['boss']-0.3),bar_after(ev['boss']+3.5)))
segs.append((bar_before(ev['win']-float(sys.argv[2]) if len(sys.argv)>2 else ev['win']-5),T_END))
segs=[(round(a,3),round(b,3)) for a,b in segs]
print('segments',segs,'total',round(sum(b-a for a,b in segs),2))
subprocess.run(['ffmpeg','-y','-loglevel','error','-f','s16le','-ar','44100','-ac','2','-i',D+'audio_long.s16','-c:a','pcm_s16le',D+'audio_long.wav'],check=True)
for o,name in [('v','verticale'),('h','orizzontale')]:
    fc=[];n=len(segs)
    for i,(a,b) in enumerate(segs):
        fl=f',fade=t=in:st=0:d=0.18:color=white' if i>0 else ''
        fc.append(f'[0:v]trim=start={a}:end={b},setpts=PTS-STARTPTS{fl}[v{i}]')
        af=(f',afade=t=in:st=0:d=0.025' if i>0 else '')+(f',afade=t=out:st={b-a-0.025}:d=0.025' if i<n-1 else f',afade=t=out:st={b-a-1.2}:d=1.2')
        fc.append(f'[1:a]atrim=start={a}:end={b},asetpts=PTS-STARTPTS{af}[a{i}]')
    fc.append(''.join(f'[v{i}][a{i}]' for i in range(n))+f'concat=n={n}:v=1:a=1[v][a0]')
    fc.append('[a0]loudnorm=I=-14:TP=-1.5:LRA=11,aresample=44100[a]')
    tmp=D+f'cut_{o}_tmp.mp4'
    subprocess.run(['ffmpeg','-y','-loglevel','error','-i',D+f'{o}_long.mp4','-i',D+'audio_long.wav','-filter_complex',';'.join(fc),'-map','[v]','-map','[a]',
        '-c:v','libx264','-preset','slow','-crf','18','-pix_fmt','yuv420p','-r','30','-c:a','aac','-b:a','192k','-movflags','+faststart',tmp],check=True)
    os.replace(tmp,D+f'2deep_cantonet_indizio3_{name}.mp4')
print('ok')
