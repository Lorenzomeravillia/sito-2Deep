# Video promo «3° indizio» (Al Cantonet)

Due video, verticale 1080×1920 e orizzontale 1920×1080, girati dentro il gioco a muro del sito: un pilota automatico gioca la partita, l'insegna si accende, e sopra compaiono la domanda d'aggancio, data e locale, il terzo indizio (le brioches) e il finale della serie. Il nome del gioco non compare: l'invito è a 2deep.it/giochi.

```
cd video-promo/indizio3
node make.cjs preview 0.5,3,8      # solo alcuni fotogrammi in out/
node make.cjs                      # la partita intera: out/v_long.mp4, out/h_long.mp4, out/audio_long.s16, out/events.json
python3 edit.py 8.5 5              # i tagli sulle battute: inizio fino a ~8,5 s, il boss, gli ultimi ~5 s prima della vittoria e il finale
```

- La partita è sempre la stessa (Math.random con seme, `SEED` in `make.cjs`).
- La musica è quella del gioco, generata durante la partita in un OfflineAudioContext con l'orologio del video: niente diritti da gestire.
- Testi dell'indizio in `make.cjs` (`CLUE`), cartella finale in `vid.js` (`endCard`).
- Caratteri: Silkscreen e Caveat come negli altri indizi; Fredoka e Tilt Neon del gioco in `fonts/` (SIL Open Font License).
