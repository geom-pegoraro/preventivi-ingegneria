// components/QuoteForm.jsx
import { useState, useEffect, useCallback, useRef } from 'react'
import {
  ArrowLeft, Plus, Trash2, Download, Save, ChevronDown,
  Info, ToggleLeft, ToggleRight, UserPlus, Check
} from 'lucide-react'
import { calculateFiscal, formatCurrency, generateQuoteNumber, DEFAULT_FISCAL } from '../utils/fiscal.js'
import { generatePDF } from '../utils/pdf.js'

const emptyItem = () => ({ id: crypto.randomUUID(), description: '', unit: 'h', qty: 1, rate: 0 })
const emptyQuote = (quotes) => ({
  number: generateQuoteNumber(quotes),
  date: new Date().toISOString().slice(0, 10),
  status: 'draft',
  subject: '',
  client: { name: '', address: '', city: '', piva: '', cf: '', email: '', phone: '' },
  items: [emptyItem()],
  fiscalSettings: { ...DEFAULT_FISCAL },
  notes: '',
  paymentTerms: '30 giorni data fattura',
  validity: '30 giorni',
  fiscal: {},
})

export default function QuoteForm({ quote: initialQuote, clients, profile, quotes, onSave, onBack }) {
  const [quote, setQuote] = useState(() => initialQuote || emptyQuote(quotes))
  const [saving, setSaving] = useState(false)
  const [showFiscal, setShowFiscal] = useState(false)

  // Recalculate fiscal whenever items or settings change
  useEffect(() => {
    const fiscal = calculateFiscal(quote.items, quote.fiscalSettings)
    setQuote(prev => ({ ...prev, fiscal }))
  }, [quote.items, quote.fiscalSettings])

  const set = useCallback((path, value) => {
    setQuote(prev => {
      const next = { ...prev }
      const parts = path.split('.')
      let obj = next
      for (let i = 0; i < parts.length - 1; i++) {
        obj[parts[i]] = { ...obj[parts[i]] }
        obj = obj[parts[i]]
      }
      obj[parts[parts.length - 1]] = value
      return next
    })
  }, [])

  const addItem = () => setQuote(prev => ({ ...prev, items: [...prev.items, emptyItem()] }))

  const updateItem = (id, field, value) => {
    setQuote(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === id ? { ...item, [field]: value } : item)
    }))
  }

  const removeItem = (id) => {
    setQuote(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }))
  }

  const handleSave = async (status = quote.status) => {
    setSaving(true)
    try {
      await onSave({ ...quote, status })
    } finally {
      setSaving(false)
    }
  }

  const { fiscal, fiscalSettings } = quote

  return (
    <div className="space-y-5 pb-24">
      {/* Toolbar */}
      <div className="flex items-center gap-2 sticky top-0 z-10 bg-slate-950 py-2 -mx-4 px-4 border-b border-slate-800">
        <button onClick={onBack} className="btn-ghost">
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">Indietro</span>
        </button>
        <span className="text-sm font-mono text-slate-400 flex-1">{quote.number}</span>
        <button onClick={() => generatePDF(quote, profile)} className="btn-secondary">
          <Download size={14} />
          <span className="hidden sm:inline">PDF</span>
        </button>
        <button onClick={() => handleSave('draft')} disabled={saving} className="btn-secondary">
          <Save size={14} />
          Salva
        </button>
        <button onClick={() => handleSave('sent')} disabled={saving} className="btn-primary">
          Invia
        </button>
      </div>

      {/* Header info */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div>
          <label className="label">Numero</label>
          <input className="input font-mono" value={quote.number} onChange={e => set('number', e.target.value)} />
        </div>
        <div>
          <label className="label">Data</label>
          <input className="input" type="date" value={quote.date} onChange={e => set('date', e.target.value)} />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className="label">Oggetto / Titolo</label>
          <input className="input" placeholder="Es. Progettazione strutturale…" value={quote.subject} onChange={e => set('subject', e.target.value)} />
        </div>
      </div>

      {/* Client section with autocomplete */}
      <ClientSection
        client={quote.client}
        clients={clients}
        onChange={(client) => setQuote(prev => ({ ...prev, client }))}
        onSaveClient={onSave ? undefined : undefined}
      />

      {/* Items table */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-300">Prestazioni</h3>
          <button onClick={addItem} className="btn-secondary text-xs py-1">
            <Plus size={13} />
            Aggiungi riga
          </button>
        </div>

        {/* Mobile: card layout */}
        <div className="divide-y divide-slate-800 sm:hidden">
          {quote.items.map((item, idx) => (
            <MobileItemRow key={item.id} item={item} idx={idx} onChange={updateItem} onRemove={removeItem} />
          ))}
        </div>

        {/* Desktop: table layout */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-slate-800">
                <th className="text-left p-3 w-full">Descrizione</th>
                <th className="text-center p-3 w-16">U.M.</th>
                <th className="text-right p-3 w-20">Qtà</th>
                <th className="text-right p-3 w-28">Tariffa €</th>
                <th className="text-right p-3 w-28">Importo</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {quote.items.map((item) => (
                <DesktopItemRow key={item.id} item={item} onChange={updateItem} onRemove={removeItem} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fiscal settings toggle */}
      <div className="card overflow-hidden">
        <button
          onClick={() => setShowFiscal(f => !f)}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Info size={14} className="text-blue-400" />
            <span className="text-sm font-medium text-slate-300">Impostazioni Fiscali</span>
          </div>
          <ChevronDown size={14} className={`text-slate-500 transition-transform ${showFiscal ? 'rotate-180' : ''}`} />
        </button>

        {showFiscal && (
          <div className="border-t border-slate-800 p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="label">Inarcassa %</label>
              <input className="input font-mono" type="number" step="0.5" min="0" max="20"
                value={fiscalSettings.inarcassa}
                onChange={e => set('fiscalSettings.inarcassa', parseFloat(e.target.value) || 0)} />
            </div>
            <div>
              <label className="label">Ritenuta %</label>
              <input className="input font-mono" type="number" step="0.5" min="0" max="30"
                value={fiscalSettings.ritenuta}
                onChange={e => set('fiscalSettings.ritenuta', parseFloat(e.target.value) || 0)} />
            </div>
            <div>
              <label className="label">IVA %</label>
              <input className="input font-mono" type="number" step="1" min="0" max="30"
                value={fiscalSettings.iva}
                onChange={e => set('fiscalSettings.iva', parseFloat(e.target.value) || 0)} />
            </div>
            <div className="space-y-2">
              <FiscalToggle label="Applica Ritenuta" value={fiscalSettings.applyRitenuta}
                onChange={v => set('fiscalSettings.applyRitenuta', v)} />
              <FiscalToggle label="Applica IVA" value={fiscalSettings.applyIva}
                onChange={v => set('fiscalSettings.applyIva', v)} />
            </div>
          </div>
        )}
      </div>

      {/* Fiscal summary */}
      <div className="card p-4 space-y-2">
        <h3 className="text-xs text-slate-500 uppercase tracking-widest font-mono mb-3">Riepilogo</h3>
        <FiscalRow label="Imponibile" value={fiscal.imponibile} />
        <FiscalRow label={`Contributo Integrativo Inarcassa (${fiscalSettings.inarcassa}%)`} value={fiscal.contributoIntegrativo} />
        {fiscalSettings.applyIva && <FiscalRow label={`IVA (${fiscalSettings.iva}%)`} value={fiscal.iva} />}
        {fiscalSettings.applyRitenuta && (
          <FiscalRow label={`Ritenuta d'Acconto (${fiscalSettings.ritenuta}%) — dedotta`} value={fiscal.ritenuta} negative />
        )}
        <div className="border-t border-slate-700 pt-3 mt-3">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-slate-200">Totale Dovuto</span>
            <span className="font-bold text-xl font-mono text-blue-400">{formatCurrency(fiscal.totale)}</span>
          </div>
        </div>
      </div>

      {/* Notes & Terms */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="label">Termini di Pagamento</label>
          <input className="input" value={quote.paymentTerms} onChange={e => set('paymentTerms', e.target.value)} />
        </div>
        <div>
          <label className="label">Validità Offerta</label>
          <input className="input" value={quote.validity} onChange={e => set('validity', e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Note</label>
          <textarea className="input resize-none" rows={3} placeholder="Note aggiuntive, condizioni particolari…"
            value={quote.notes} onChange={e => set('notes', e.target.value)} />
        </div>
      </div>
    </div>
  )
}

// ── Client Section with Autocomplete ─────────────────────────────────────────
function ClientSection({ client, clients, onChange }) {
  const [search, setSearch] = useState(client.name || '')
  const [showDropdown, setShowDropdown] = useState(false)
  const [savedFeedback, setSavedFeedback] = useState(false)
  const wrapperRef = useRef(null)

  // Sync search with client name from outside (e.g. loading existing quote)
  useEffect(() => {
    setSearch(client.name || '')
  }, [client.name])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = clients.filter(c =>
    search.trim().length > 0 &&
    c.name?.toLowerCase().includes(search.toLowerCase())
  )

  const isExistingClient = clients.some(
    c => c.name?.toLowerCase() === client.name?.toLowerCase()
  )

  const handleNameChange = (value) => {
    setSearch(value)
    onChange({ ...client, name: value })
    setShowDropdown(true)
  }

  const selectClient = (c) => {
    const { id, ...clientData } = c
    onChange({ ...clientData })
    setSearch(c.name)
    setShowDropdown(false)
  }

  const handleSaveNewClient = async () => {
    if (!client.name?.trim()) return
    // Signal to parent that this client should be saved
    // We fire a custom event that App.jsx / useStore can intercept
    window.dispatchEvent(new CustomEvent('saveClientFromQuote', { detail: { ...client } }))
    setSavedFeedback(true)
    setTimeout(() => setSavedFeedback(false), 2500)
  }

  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-300">Cliente</h3>
        {client.name && !isExistingClient && (
          <button onClick={handleSaveNewClient}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md transition-all
              ${savedFeedback
                ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-800/50'
                : 'bg-blue-900/30 text-blue-400 border border-blue-800/50 hover:bg-blue-900/50'}`}>
            {savedFeedback ? <><Check size={12} /> Salvato!</> : <><UserPlus size={12} /> Salva in rubrica</>}
          </button>
        )}
        {isExistingClient && client.name && (
          <span className="flex items-center gap-1 text-xs text-emerald-400">
            <Check size={12} /> In rubrica
          </span>
        )}
      </div>

      {/* Autocomplete name field */}
      <div ref={wrapperRef} className="relative">
        <label className="label">Ragione Sociale / Nome *</label>
        <input
          className="input"
          placeholder="Inizia a scrivere il nome del cliente…"
          value={search}
          onChange={e => handleNameChange(e.target.value)}
          onFocus={() => search.trim().length > 0 && setShowDropdown(true)}
          autoComplete="off"
        />

        {/* Dropdown */}
        {showDropdown && filtered.length > 0 && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 9999 }}
            className="mt-1 rounded-xl overflow-hidden shadow-2xl border border-blue-500/40"
            style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 9999, background: '#1e293b' }}
          >
            <div className="px-3 py-1.5 border-b border-slate-700 flex items-center gap-2">
              <span className="text-xs text-blue-400 font-medium">Clienti trovati</span>
            </div>
            {filtered.map(c => (
              <button
                key={c.id}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); selectClient(c) }}
                className="w-full text-left px-3 py-3 hover:bg-slate-700 transition-colors border-b border-slate-700/50 last:border-0 flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 text-white text-sm font-bold">
                  {c.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm text-white font-semibold">{c.name}</p>
                  <p className="text-xs text-slate-400">
                    {[c.city, c.piva ? `P.IVA ${c.piva}` : null, c.email].filter(Boolean).join(' · ')}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="label">P.IVA</label>
          <input className="input font-mono" placeholder="IT00000000000" value={client.piva || ''} onChange={e => onChange({ ...client, piva: e.target.value })} />
        </div>
        <div>
          <label className="label">Codice Fiscale</label>
          <input className="input font-mono" value={client.cf || ''} onChange={e => onChange({ ...client, cf: e.target.value })} />
        </div>
        <div>
          <label className="label">Indirizzo</label>
          <input className="input" value={client.address || ''} onChange={e => onChange({ ...client, address: e.target.value })} />
        </div>
        <div>
          <label className="label">Città / CAP</label>
          <input className="input" value={client.city || ''} onChange={e => onChange({ ...client, city: e.target.value })} />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" value={client.email || ''} onChange={e => onChange({ ...client, email: e.target.value })} />
        </div>
        <div>
          <label className="label">Telefono</label>
          <input className="input" type="tel" value={client.phone || ''} onChange={e => onChange({ ...client, phone: e.target.value })} />
        </div>
      </div>
    </div>
  )
}

function FiscalRow({ label, value, negative }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-slate-500">{label}</span>
      <span className={`font-mono ${negative ? 'text-red-400' : 'text-slate-300'}`}>
        {negative ? '- ' : ''}{formatCurrency(value)}
      </span>
    </div>
  )
}

function FiscalToggle({ label, value, onChange }) {
  return (
    <button onClick={() => onChange(!value)} className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 transition-colors">
      {value ? <ToggleRight size={18} className="text-blue-400" /> : <ToggleLeft size={18} />}
      {label}
    </button>
  )
}

function MobileItemRow({ item, idx, onChange, onRemove }) {
  return (
    <div className="p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-600 font-mono">#{idx + 1}</span>
        <button onClick={() => onRemove(item.id)} className="text-slate-600 hover:text-red-400 p-1">
          <Trash2 size={13} />
        </button>
      </div>
      <input className="input" placeholder="Descrizione prestazione"
        value={item.description} onChange={e => onChange(item.id, 'description', e.target.value)} />
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="label">U.M.</label>
          <select className="input" value={item.unit} onChange={e => onChange(item.id, 'unit', e.target.value)}>
            <option value="h">h</option>
            <option value="gg">gg</option>
            <option value="m²">m²</option>
            <option value="corpo">corpo</option>
          </select>
        </div>
        <div>
          <label className="label">Qtà</label>
          <input className="input font-mono" type="number" min="0" step="0.5"
            value={item.qty} onChange={e => onChange(item.id, 'qty', parseFloat(e.target.value) || 0)} />
        </div>
        <div>
          <label className="label">Tariffa €</label>
          <input className="input font-mono" type="number" min="0" step="10"
            value={item.rate} onChange={e => onChange(item.id, 'rate', parseFloat(e.target.value) || 0)} />
        </div>
      </div>
      <div className="flex justify-end">
        <span className="text-sm font-mono font-semibold text-slate-300">{formatCurrency(item.qty * item.rate)}</span>
      </div>
    </div>
  )
}

function DesktopItemRow({ item, onChange, onRemove }) {
  return (
    <tr className="group hover:bg-slate-800/40 transition-colors">
      <td className="p-2">
        <input className="input" placeholder="Descrizione prestazione"
          value={item.description} onChange={e => onChange(item.id, 'description', e.target.value)} />
      </td>
      <td className="p-2">
        <select className="input text-center" value={item.unit} onChange={e => onChange(item.id, 'unit', e.target.value)}>
          <option value="h">h</option>
          <option value="gg">gg</option>
          <option value="m²">m²</option>
          <option value="corpo">corpo</option>
        </select>
      </td>
      <td className="p-2">
        <input className="input text-right font-mono" type="number" min="0" step="0.5"
          value={item.qty} onChange={e => onChange(item.id, 'qty', parseFloat(e.target.value) || 0)} />
      </td>
      <td className="p-2">
        <input className="input text-right font-mono" type="number" min="0" step="10"
          value={item.rate} onChange={e => onChange(item.id, 'rate', parseFloat(e.target.value) || 0)} />
      </td>
      <td className="p-2 text-right font-mono font-semibold text-slate-300 whitespace-nowrap">
        {formatCurrency(item.qty * item.rate)}
      </td>
      <td className="p-2">
        <button onClick={() => onRemove(item.id)} className="text-slate-700 hover:text-red-400 transition-colors p-1">
          <Trash2 size={13} />
        </button>
      </td>
    </tr>
  )
}
