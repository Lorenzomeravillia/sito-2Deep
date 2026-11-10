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
