# Automercatorum Web

Landing page statica per i tool non ufficiali Automercatorum dell'Università Mercatorum.

## ✨ Caratteristiche

- 🌐 **Sito statico puro** - Funziona su GitHub Pages senza backend
- 🔄 **Auto-aggiornamento versioni** - Sincronizzate automaticamente da GitHub Releases
- 📱 **Responsive design** - Perfetto su mobile, tablet e desktop
- 🎨 **UI moderna** - Gradient, animazioni smooth e tema dark
- ⚠️ **Warning prominente** - Avviso chiaro che i tool sono non ufficiali
- 🚀 **Zero configurazione** - Pubblica una release su GitHub e il sito si aggiorna da solo

## 🚀 Come usare

### 1. Pubblicare una nuova versione

Ogni volta che vuoi rilasciare una nuova versione di uno dei tool:

```bash
# Nel repository del tool (es. Automercatorum-Guardalezioni)
git tag v1.2.3
git push origin v1.2.3
```

Poi su GitHub:
1. Vai su **Releases** → **Draft a new release**
2. Seleziona il tag (es. `v1.2.3`)
3. Carica il file `.dmg`
4. Pubblica la release

**Il sito si aggiorna automaticamente!** ✨

### 2. Configurare il sito localmente

```bash
# Clone il repo
git clone https://github.com/Yoddikko/Automercatorum-web.git
cd Automercatorum-web

# Serve localmente (Node.js)
npx http-server

# O con Python 3
python3 -m http.server 8000

# Apri http://localhost:8000
```

### 3. Personalizzare il sito

- **Cambiare i colori**: Modifica le variabili gradient in `styles.css`
- **Aggiungere/rimuovere tool**: Modifica l'array `REPOS` in `releases.js`
- **Cambiare il testo**: Modifica l'HTML in `index.html`

## 📋 Struttura file

```
.
├── index.html       # Pagina principale
├── styles.css       # Design e layout
├── releases.js      # Fetch automatico da GitHub Releases API
└── README.md        # Questo file
```

## ⚙️ Come funziona

### `releases.js` - La magia

Lo script JavaScript:
1. Al caricamento della pagina, chiama l'API di GitHub
2. Cerca l'ultima release per ogni repository
3. Estrae il numero versione
4. Aggiorna i tag sulla pagina
5. Aggiorna i link di download verso la release

**Non richiede accesso a dati sensibili** - l'API pubblica di GitHub ha un rate limit di 60 richieste/ora per IP anonimo, che è più che sufficiente.

### GitHub Pages - Deployment

Il sito è automaticamente servito da GitHub Pages quando:
1. Il file `index.html` è nel branch `main`
2. Hai abilitato Pages dalle settings del repo

URL: `https://Yoddikko.github.io/Automercatorum-web/`

## 🛑 Disclaimer

⚠️ Questi tool sono **NON UFFICIALI** e sviluppati per uso personale di studio. Usali a tuo rischio e pericolo in conformità ai termini di servizio dell'Università Mercatorum.

## 📝 Note

- Il sito non raccoglie dati o analytics
- L'API di GitHub è pubblica, nessuna autenticazione richiesta
- I link di download puntano direttamente alle release di GitHub
- Le versioni si aggiornano ogni 5 minuti automaticamente

## 🔧 Troubleshooting

### Le versioni non si aggiornano

1. Controlla che le release siano pubbliche su GitHub
2. Apri la console del browser (F12) e cerca errori
3. Assicurati che i tag nei releases seguano il formato `v1.2.3`

### GitHub Pages non funziona

1. Vai su Settings → Pages
2. Seleziona "Deploy from a branch"
3. Scegli il branch `main` e la cartella `/ (root)`
4. Salva e aspetta 1-2 minuti

## 📄 Licenza

MIT - Vedi il file LICENSE nel repository

---

**Made with ❤️ per Mercatorum**
