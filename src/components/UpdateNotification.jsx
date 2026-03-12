// components/UpdateNotification.jsx
import { useState, useEffect } from 'react'
import { RefreshCw, X, Sparkles } from 'lucide-react'

// 📝 CHANGELOG — aggiorna questa lista ad ogni release
const CHANGELOG = [
  {
    version: '1.2.0',
    date: '2025-03',
    changes: [
      'Autocomplete clienti nel preventivo con tendina filtrata',
      'Salvataggio automatico nuovi clienti in rubrica',
      'Badge "In rubrica" per clienti già salvati',
    ]
  },
  {
    version: '1.1.0',
    date: '2025-03',
    changes: [
      'Icone PWA aggiunte — app installabile su PC e mobile',
      'Fix start_url per GitHub Pages',
      'Migliorata compatibilità offline',
    ]
  },
  {
    version: '1.0.0',
    date: '2025-03',
    changes: [
      'Prima versione rilasciata',
      'Dashboard con statistiche preventivi',
      'Editor preventivo con calcoli fiscali (Inarcassa, IVA, Ritenuta)',
      'Gestione clienti e profilo professionale',
      'Export PDF professionale',
      'Backup/ripristino JSON',
    ]
  }
]

const LATEST = CHANGELOG[0]
const STORAGE_KEY = 'quotegen-last-seen-version'

export default function UpdateNotification() {
  const [show, setShow] = useState(false)
  const [waitingWorker, setWaitingWorker] = useState(null)
  const [isNewInstall, setIsNewInstall] = useState(false)

  useEffect(() => {
    const lastSeen = localStorage.getItem(STORAGE_KEY)

    // First time ever opening the app
    if (!lastSeen) {
      setIsNewInstall(true)
      setShow(true)
      return
    }

    // New version available (version changed since last visit)
    if (lastSeen !== LATEST.version) {
      setShow(true)
    }

    // Listen for service worker update
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(reg => {
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          newWorker?.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setWaitingWorker(newWorker)
              setShow(true)
            }
          })
        })
      })
    }
  }, [])

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, LATEST.version)
    setShow(false)
  }

  const handleReload = () => {
    localStorage.setItem(STORAGE_KEY, LATEST.version)
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    } else {
      window.location.reload()
    }
  }

  if (!show) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 md:bottom-4 md:left-auto md:right-4 md:max-w-sm">
      <div className="card border-slate-700 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-blue-400" />
            <span className="text-sm font-semibold text-slate-200">
              {isNewInstall && !waitingWorker
                ? `Benvenuto in QuoteGen v${LATEST.version}`
                : `Aggiornamento v${LATEST.version}`}
            </span>
          </div>
          <button onClick={handleDismiss} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* Changelog */}
        <div className="px-4 py-3 max-h-52 overflow-y-auto">
          {isNewInstall && !waitingWorker ? (
            <p className="text-xs text-slate-400 mb-2">Cosa puoi fare con questa app:</p>
          ) : (
            <p className="text-xs text-slate-400 mb-2">Novità in questa versione:</p>
          )}
          <ul className="space-y-1.5">
            {LATEST.changes.map((change, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                <span className="text-blue-400 mt-0.5 shrink-0">•</span>
                {change}
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="px-4 py-3 border-t border-slate-800 flex gap-2">
          {waitingWorker ? (
            <>
              <button onClick={handleReload} className="btn-primary flex-1 justify-center text-xs py-2">
                <RefreshCw size={13} />
                Aggiorna ora
              </button>
              <button onClick={handleDismiss} className="btn-secondary text-xs py-2">
                Dopo
              </button>
            </>
          ) : (
            <button onClick={handleDismiss} className="btn-primary flex-1 justify-center text-xs py-2">
              Inizia →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
