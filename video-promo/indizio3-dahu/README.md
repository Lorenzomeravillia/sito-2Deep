# Video promo «3° indizio · il Dahu» (Al Cantonet)

Due video, verticale 1080×1920 e orizzontale 1920×1080, girati dentro Skanoid nella versione ska-reggae, con il brano caricato nel pannello BRANO. Il gioco gioca davvero: l'ultima parte di un livello, con una fascia di mattoni sopra «AL CANTONET» e «SAB 21 NOV», sette palline e un pilota automatico che le manda contro i mattoni. Sopra: la frase d'aggancio, scie al neon, anelli di luce, scintille, coriandoli, il rallentatore sull'ultimo mattone e la camera che sale sull'insegna accesa; poi il 3° indizio (il Dahu disegnato al neon, «piccolo aiuto: si beve») e l'invito finale con «metti mi piace» e «mandalo a chi porti con te».

```
cd video-promo/indizio3-dahu
node make.cjs probe                          # il brano come lo legge il gioco
node make.cjs search 1-40                    # quando cade l'ultimo mattone, seme per seme
SEED=4 SONGOFF=20.8 node make.cjs preview 1,8,14   # solo alcuni fotogrammi in out/
SEED=4 SONGOFF=20.8 node make.cjs            # out/v.mp4, out/h.mp4, out/audio.s16, out/events.json
python3 mux.py                               # i due video finali con l'audio
SEED=4 SONGOFF=20.8 node make.cjs still 8.8   # la foto 4:5 per un post statico: out/still_8.80.png
```

- Il brano non è nel repository: `song_cfg.json` (escluso da git) è la configurazione salvata in td.site_content (skanoid/song), con il MIDI tagliato ai primi 78 secondi, che contengono tutto il tratto suonato in loop. Un altro file si passa con `SONGCFG=percorso`.
- Il gioco avanza a passi fissi di 1/120 s: il primo passaggio trova l'ultimo mattone, il secondo rigioca la stessa identica partita e rallenta l'immagine lì intorno. Disegno ed effetti hanno generatori casuali propri, così la partita non cambia.
- `SONGOFF` è il punto del brano da cui parte il video, in secondi del loop (20,8 = battuta 14 di 16).
- Il disegno del Dahu è originale (un camoscio con le zampe di un lato più corte, su un pendio); l'etichetta del liquore non è usata.
