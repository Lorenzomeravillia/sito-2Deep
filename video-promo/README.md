# Video promo 2Deep: sorgenti

Generatore del video in pixel art "Prossimi livelli". Gira in due posti, con lo stesso codice:

- **sito**: `/admin/video` (file generato `admin/video.html`). Accesso con le credenziali dell'admin. Le date arrivano da `td.site_events`, cioè dalla scheda **Date** dell'admin.
- **artefatto su claude.ai**: il file `build/artifact.html`, dove inseriamo le date a mano. Serve da laboratorio per i nuovi scenari.

Questa cartella è esclusa dalla pubblicazione su Vercel (`.vercelignore`). Il sito non ha passaggi di build: i file generati vengono messi nella repo già pronti.

## Ricompilare

```
cd video-promo
python3 build.py
```

Il comando scrive tre gruppi di file:

- `../assets/2deep-engine.js`: il motore condiviso (font, sprite, mappa, scenari, scena finale, sintetizzatore chiptune).
- `../admin/video.html`: la pagina dell'admin.
- `build/artifact.html`, `build/page.html`, `build/test.html`: artefatto e pagine di prova locali (ignorate da git).

Dopo una modifica ai sorgenti si ricompila e si mettono nella repo anche i file generati.

## Come il video legge le date del sito

| Nel video | Dal sito |
|---|---|
| Livelli 1–3 | Le prime tre date pubblicate da oggi in poi |
| Storico | Le ultime 7 date passate pubblicate. Una nota con "annullato" (o "rinviato") segna la data come saltata |
| Numero del primo livello | Date passate suonate + 1 |
| Livello senza data | Scheda **IN ARRIVO** con il cartello "?" |

Dal pannello Date della pagina si possono fare modifiche che valgono solo per il video:

- nomi più corti;
- scenario;
- frase finale;
- righe dello storico tolte;
- spostamento del numero di livello.

Queste modifiche vengono salvate in `td.site_content`, nella sezione `video` con chiave `settings`, in formato JSON e legate all'id della data. Il pulsante "Ripristina le date del sito" le azzera.

## Scenari

Ogni livello occupa una fascia della mappa alta 320 px. La scelta automatica dello scenario usa le regole `SCENE_RULES` in `part_core.js`:

| Regola | Scenario |
|---|---|
| Monkey's | bar al neon |
| Feltre / Cantonet | borgo col castello |
| Cimolais / Chioschetto | baita |
| Tutti gli altri locali | osteria con il nome sull'insegna |

Ogni scenario viene disegnato nella sua fascia di origine (`SCN` in `part_world.js`). In un'altra fascia viene spostato in basso e, se serve, specchiato rispetto al sentiero.

Per aggiungere uno scenario su misura servono questi passaggi:

1. Disegno statico in `LM` dentro `buildWorld`.
2. Livello animato in `DYN` (`part_core.js`).
3. Icona in `sceneIcon` (`part_screens.js`).
4. Voce in `SCN`.
5. Eventuale regola in `SCENE_RULES`.

## Versione giocabile (prevista)

Il motore è uno script semplice: altre pagine del sito possono caricare `/assets/2deep-engine.js` dopo un `<canvas id="c">`. Le funzioni utili sono queste:

- `render(t)` disegna un fotogramma dell'animazione;
- `setCfg(cfg)` imposta le date;
- `setFormat('portrait'|'landscape')`;
- sprite (`SPR`, `drawPair`), mappa (`world`, `chars`), sintetizzatore (`renderSoundtrack`).

Una pagina pubblica giocabile leggerebbe le date pubblicate con la chiave pubblica, la stessa usata da `contentLoader.js`, e userebbe questi stessi pezzi.

## Strumenti

| Comando | A cosa serve |
|---|---|
| `node regress.cjs build/page.html <cartella>` | Fotogrammi fissi nei due formati, con un hash per verificare che una modifica lasci il video identico |
| `node scntest.cjs <nome> '<cfg json>' <t...>` | Fotogrammi con date a scelta (cartella `prev/`) |
| `node export.cjs out.mp4 [portrait\|landscape]` | Esportazione MP4 senza interfaccia, con ffmpeg |

## Promo di una singola serata (`monkey/`)

Seconda scena dello stesso generatore: il picchiaduro a scorrimento per la serata al Monkey's Bar del 14 novembre. Usa lo stesso lettore, il pannello Musica con il caricamento MIDI, il render MP4 e la scelta 9:16 / 16:9. Il pannello Date resta fuori, perché i dati della serata sono nella scena (`NIGHT` in `monkey/part_scene.js`).

- La scena viene disegnata su un canvas logico (216x384) e copiata a 5x sull'uscita 1080x1920. Lo zoom finale passa a un canvas largo (270x480) che cade a 4x esatti: l'inquadratura larga resta nitida.
- La musica di default e gli effetti sono in `monkey/part_music.js` (`defaultSong`, `scheduleSfx`). Con un MIDI caricato, gli effetti restano sopra la musica del MIDI.
- `python3 build.py` produce anche `build/monkey_artifact.html`, `monkey_page.html` e `monkey_test.html`.

Ogni scena dichiara `VIDEO_NAME`, `COVER_T` (il momento usato per la copertina PNG) e `AUDIO_KEY()` (cosa invalida la cache dell'audio). Le canzoni di default sono in `part_levels_music.js` e `monkey/part_music.js`, il motore audio è in `part_audio.js`.

## Promo SABATO_SERA.EXE (`desk/`)

Terza scena, per la stessa serata del 14 novembre: un desktop anni 90, 24 secondi.

1. Dal primo fotogramma, sul suono del modem: "TROVA LA PAROLA SEGRETA!".
2. La scimmia assistente chiede "VUOI USCIRE SABATO?" [SI] [SI] e il clic fa partire il download di 2DEEP_LIVE.EXE dal Monkey's.
3. Il divano blocca il download.
4. La scimmia lo spinge nel cestino: il coperchio salta, un vortice lo risucchia colonna per colonna e la corona va giù per ultima.
5. Il cestino sputa SEGRETO.TXT, che si apre a tutto schermo nel Blocco note per 0,8 s: è la schermata con la parola segreta.
6. Il download finisce e l'applicazione apre, in una finestra, il palco del video "Prossimi livelli". Accanto compare la finestra con data e luogo.
7. Chiude la finestra "MANDALO A CHI STA SUL DIVANO" [SI] [SI].

- Regola di questo montaggio: una cosa alla volta sullo schermo, tre o quattro parole per finestra, ogni testo in vista almeno 2 secondi.
- La parola segreta è `SECRET` in `desk/part_scene.js`; il Blocco note è `EV.secret`.
- Il finale non è riscritto: `build.py` (`stage_src`) prende da `part_side.js` e `part_core.js` il locale, il salto sul palco, il pubblico, i coriandoli e l'HUD KATIA / LORENZO, togliendo solo le scritte a comparsa. `stageIn` lo disegna dentro la finestra dell'applicazione, usando come viewport l'area interna.
- `MUSIC_GAPS` (facoltativo, per scena) ferma la musica negli intervalli indicati, anche con un MIDI caricato. Questa scena non lo usa più.
- `python3 build.py` produce anche `build/desk_artifact.html`, `desk_page.html` e `desk_test.html`.
