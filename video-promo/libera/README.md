# Video promo di Libera: «1° indizio»

Due video, verticale 1080×1920 e orizzontale 1920×1080, girati dentro il gioco vero: la nota percorre un tragitto scritto a mano, la locandina si scopre, e sopra il gioco compaiono locale, data, ora e l'indizio sui prodotti. Cartella esclusa dalla pubblicazione su Vercel.

## Rifare i video

```
cd video-promo/libera
node make.cjs preview 3,6.5,11,15   # solo alcuni fotogrammi in out/, per controllare
node make.cjs                        # i due mp4 in out/
```

Servono Chromium con Playwright, ffmpeg e python3. Il gioco viene ricompilato da `libera/build.py --artifact`, con i dati di `libera/site_data.json` (oggi: Al Cantonet, sab 21 novembre, ore 21).

## Cosa cambiare per il prossimo indizio

- `vid.js`, `WP`: il tragitto della nota (colonna, riga, pausa in secondi).
- `vid.js`, `endCard` e `drawH`: testi della scena finale e della colonna di destra (indizio, «Ma tu lo conosci il Dahu?», invito a giocare).
- `make.cjs`, `__VIMG`: le immagini dell'indizio (ora il cocktail scontornato).

La musica è il giro interno del gioco (`libera/gamesong.js`), non il brano salvato nel database: niente problemi di diritti sui social.

Il carattere dei titoli è Silkscreen (SIL Open Font License 1.1, vedi `LICENSE-silkscreen.txt`).
