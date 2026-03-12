# Engineering Quote Generator — PWA

Applicazione web **Progressive Web App** per la gestione dei preventivi di ingegneria professionale. Funziona completamente offline con archiviazione locale dei dati (IndexedDB).

## ✨ Funzionalità

- **Dashboard** — riepilogo preventivi con statistiche e stati
- **Editor Preventivo** — form completo con calcolo fiscale automatico (Inarcassa, IVA, Ritenuta d'acconto)
- **Gestione Clienti** — rubrica locale con ricerca
- **Profilo Professionale** — dati dell'ingegnere, logo, coordinate bancarie
- **Export PDF** — generazione PDF professionale con jsPDF
- **Backup/Ripristino** — esportazione/importazione JSON completa
- **PWA** — installabile su desktop e mobile, funziona offline

## 🚀 Avvio rapido

```bash
npm install
npm run dev
```

## 🏗️ Build & Deploy

```bash
npm run build
npm run preview
```

## 📁 Struttura progetto

```
src/
├── components/
│   ├── Dashboard.jsx       # Riepilogo e lista preventivi
│   ├── QuoteForm.jsx       # Editor preventivo con calcoli fiscali
│   ├── Clients.jsx         # CRUD clienti
│   ├── Profile.jsx         # Impostazioni profilo ingegnere
│   └── Settings.jsx        # Backup, ripristino, info PWA
├── hooks/
│   └── useStore.js         # State management centralizzato
├── utils/
│   ├── db.js               # IndexedDB wrapper (idb)
│   ├── fiscal.js           # Calcoli fiscali italiani
│   └── pdf.js              # Generazione PDF (jsPDF)
├── App.jsx                 # Shell applicazione + routing
├── main.jsx
└── index.css               # Tailwind + design tokens
vite.config.js              # Vite + PWA plugin config
```

## 🧮 Logica Fiscale

Per ogni preventivo vengono calcolati automaticamente:

| Voce | Calcolo |
|------|---------|
| Imponibile | Σ (Qtà × Tariffa) |
| Contributo Integrativo Inarcassa | Imponibile × 4% (configurabile) |
| Base imponibile IVA | Imponibile + Contributo |
| IVA | Base × 22% (configurabile) |
| Ritenuta d'Acconto | Imponibile × 20% (configurabile, deducibile) |
| **Totale Dovuto** | **Base IVA + IVA − Ritenuta** |

## 💾 Dati

I dati sono salvati in **IndexedDB** nel browser. Nessun server, nessun cloud.
Usa Backup/Ripristino per trasferire i dati tra dispositivi.

## 📱 PWA Install

Sul mobile, tocca **"Aggiungi a schermata Home"**. Su desktop usa il pulsante di installazione nella barra degli indirizzi di Chrome/Edge.
