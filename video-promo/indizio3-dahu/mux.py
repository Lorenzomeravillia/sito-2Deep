# Adds the sound to the two silent videos: the offline render of the game's music and sounds, a short fade at the end,
# loudness at -14 LUFS (the level social apps play at). The picture is copied as it is.
import json, os, subprocess
D = os.path.dirname(os.path.abspath(__file__)) + '/out/'
E = json.load(open(D + 'events.json'))
dur = E['frames'] / 30
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 's16le', '-ar', '44100', '-ac', '2', '-i', D + 'audio.s16', '-c:a', 'pcm_s16le', D + 'audio.wav'], check=True)
af = f'atrim=0:{dur:.3f},afade=t=in:st=0:d=0.02,afade=t=out:st={dur - 1.3:.3f}:d=1.3,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=44100'
for o, name in [('v', 'verticale'), ('h', 'orizzontale')]:
    tmp = D + f'final_{o}_tmp.mp4'
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', D + f'{o}.mp4', '-i', D + 'audio.wav', '-map', '0:v', '-map', '1:a', '-c:v', 'copy',
                    '-af', af, '-c:a', 'aac', '-b:a', '192k', '-t', f'{dur:.3f}', '-movflags', '+faststart', tmp], check=True)
    os.replace(tmp, D + f'2deep_cantonet_indizio3_dahu_{name}.mp4')
print('ok', round(dur, 2))
