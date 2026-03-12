// components/QuoteForm.jsx
import { useState, useEffect, useCallback } from 'react'
import {
  ArrowLeft, Plus, Trash2, Download, Save, ChevronDown,
  Info, ToggleLeft, ToggleRight
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
  const [clientMode, setClientMode] = useState('new') // 'new' | 'existing'
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

  const selectClient = (clientId) => {
    const c = clients.find(x => x.id === clientId)
    if (c) setQuote(prev => ({ ...prev, client: { ...c } }))
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

      {/* Client section */}
      <div className="card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-300">Cliente</h3>
          {clients.length > 0 && (
            <div className="flex gap-1">
              <button onClick={() => setClientMode('new')} className={`text-xs px-2.5 py-1 rounded-md transition-colors ${clientMode === 'new' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Nuovo</button>
              <button onClick={() => setClientMode('existing')} className={`text-xs px-2.5 py-1 rounded-md transition-colors ${clientMode === 'existing' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Esistente</button>
            </div>
          )}
        </div>

        {clientMode === 'existing' && clients.length > 0 && (
          <div>
            <label className="label">Seleziona cliente</label>
            <select className="input" onChange={e => selectClient(e.target.value)} defaultValue="">
              <option value="" disabled>Scegli cliente…</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label">Ragione Sociale / Nome</label>
            <input className="input" placeholder="Committente S.r.l." value={quote.client.name} onChange={e => set('client.name', e.target.value)} />
          </div>
          <div>
            <label className="label">P.IVA</label>
            <input className="input font-mono" placeholder="IT00000000000" value={quote.client.piva} onChange={e => set('client.piva', e.target.value)} />
          </div>
          <div>
            <label className="label">Indirizzo</label>
            <input className="input" value={quote.client.address} onChange={e => set('client.address', e.target.value)} />
          </div>
          <div>
            <label className="label">Città / CAP</label>
            <input className="input" value={quote.client.city} onChange={e => set('client.city', e.target.value)} />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={quote.client.email} onChange={e => set('client.email', e.target.value)} />
          </div>
          <div>
            <label className="label">Telefono</label>
            <input className="input" type="tel" value={quote.client.phone} onChange={e => set('client.phone', e.target.value)} />
          </div>
        </div>
      </div>

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
