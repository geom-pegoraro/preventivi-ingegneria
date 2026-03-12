// components/Settings.jsx
import { useRef, useState } from 'react'
import { Download, Upload, AlertTriangle, Check, Database, Info, Wifi, WifiOff } from 'lucide-react'

export default function Settings({ onExport, onImport }) {
  const fileRef = useRef()
  const [importStatus, setImportStatus] = useState(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  const handleImport = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await onImport(file)
      setImportStatus('ok')
      setTimeout(() => setImportStatus(null), 3000)
    } catch (err) {
      setImportStatus('error')
      console.error(err)
    }
    e.target.value = ''
  }

  return (
    <div className="space-y-6 pb-12">
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-widest font-mono mb-1">Configurazione</p>
        <h1 className="text-2xl font-semibold text-slate-100">Impostazioni</h1>
      </div>

      {/* PWA status */}
      <div className="card p-4 space-y-3">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          {isOnline ? <Wifi size={14} className="text-emerald-400" /> : <WifiOff size={14} className="text-amber-400" />}
          Stato Applicazione
        </h3>
        <div className="space-y-2">
          <InfoRow label="Stato connessione" value={isOnline ? 'Online' : 'Offline'} ok={isOnline} />
          <InfoRow label="Archiviazione dati" value="IndexedDB (locale)" ok />
          <InfoRow label="Modalità PWA" value={window.matchMedia('(display-mode: standalone)').matches ? 'Installata' : 'Browser'} ok />
        </div>
        <div className="bg-blue-900/20 border border-blue-800/40 rounded-lg p-3 flex gap-2.5">
          <Info size={14} className="text-blue-400 mt-0.5 shrink-0" />
          <p className="text-xs text-slate-400">
            L'app funziona completamente <strong className="text-slate-300">offline</strong>. Tutti i dati sono salvati nel tuo browser.
            Usa il backup JSON per trasferire i dati su un altro dispositivo.
          </p>
        </div>
      </div>

      {/* Backup */}
      <div className="card p-4 space-y-4">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          <Database size={14} className="text-blue-400" />
          Backup e Ripristino
        </h3>

        <div className="space-y-3">
          <div className="bg-slate-800/60 rounded-lg p-3">
            <p className="text-sm font-medium text-slate-300 mb-1">Esporta dati</p>
            <p className="text-xs text-slate-500 mb-3">
              Scarica un file JSON con tutti i preventivi, clienti e impostazioni del profilo.
            </p>
            <button onClick={onExport} className="btn-secondary">
              <Download size={14} />
              Scarica Backup JSON
            </button>
          </div>

          <div className="bg-slate-800/60 rounded-lg p-3">
            <p className="text-sm font-medium text-slate-300 mb-1">Ripristina dati</p>
            <p className="text-xs text-slate-500 mb-3">
              Importa un file di backup JSON. <strong className="text-amber-400">Attenzione:</strong> sovrascriverà tutti i dati attuali.
            </p>
            <label className={`btn-secondary cursor-pointer ${importStatus === 'ok' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50' : ''}`}>
              {importStatus === 'ok' ? (
                <><Check size={14} /> Importato!</>
              ) : importStatus === 'error' ? (
                <><AlertTriangle size={14} className="text-red-400" /> Errore file</>
              ) : (
                <><Upload size={14} /> Importa Backup JSON</>
              )}
              <input type="file" accept=".json" className="hidden" ref={fileRef} onChange={handleImport} />
            </label>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="card p-4 space-y-2">
        <h3 className="text-sm font-semibold text-slate-300">Informazioni</h3>
        <div className="space-y-1.5 text-sm">
          <InfoRow label="Applicazione" value="Engineering Quote Generator" />
          <InfoRow label="Versione" value="1.0.0" />
          <InfoRow label="Sviluppato con" value="React + Vite + PWA" />
          <InfoRow label="Dati personali" value="Solo sul tuo dispositivo" ok />
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value, ok }) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-slate-800 last:border-0">
      <span className="text-slate-500 text-xs">{label}</span>
      <span className={`text-xs font-medium ${ok === true ? 'text-emerald-400' : ok === false ? 'text-red-400' : 'text-slate-300'}`}>
        {value}
      </span>
    </div>
  )
}
