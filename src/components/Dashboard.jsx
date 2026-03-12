// components/Dashboard.jsx
import { useState } from 'react'
import {
  PlusCircle, FileText, TrendingUp, Clock, CheckCircle2,
  ChevronRight, MoreVertical, Download, Trash2, Send, Eye
} from 'lucide-react'
import { formatCurrency, formatDate, STATUS_LABELS, STATUS_COLORS } from '../utils/fiscal.js'
import { generatePDF } from '../utils/pdf.js'

export default function Dashboard({ quotes, profile, onNewQuote, onEditQuote, onDeleteQuote, onUpdateStatus }) {
  const [menuOpen, setMenuOpen] = useState(null)

  const stats = {
    total: quotes.length,
    draft: quotes.filter(q => q.status === 'draft').length,
    sent: quotes.filter(q => q.status === 'sent').length,
    paid: quotes.filter(q => q.status === 'paid').length,
    revenue: quotes.filter(q => q.status === 'paid').reduce((s, q) => s + (q.fiscal?.totale || 0), 0),
    pending: quotes.filter(q => q.status === 'sent').reduce((s, q) => s + (q.fiscal?.totale || 0), 0),
  }

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-mono mb-1">Dashboard</p>
          <h1 className="text-2xl font-semibold text-slate-100">
            {profile?.name ? `Ciao, ${profile.name.split(' ')[0]}` : 'Benvenuto'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <button onClick={onNewQuote} className="btn-primary">
          <PlusCircle size={16} />
          Nuovo
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={<FileText size={16} />} label="Totale" value={stats.total} />
        <StatCard icon={<Clock size={16} />} label="Bozze" value={stats.draft} accent="yellow" />
        <StatCard icon={<Send size={16} />} label="Inviati" value={stats.sent} accent="blue" />
        <StatCard icon={<CheckCircle2 size={16} />} label="Pagati" value={stats.paid} accent="emerald" />
      </div>

      {/* Revenue row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={14} className="text-emerald-400" />
            <span className="text-xs text-slate-500 uppercase tracking-wider">Incassato</span>
          </div>
          <p className="text-xl font-semibold text-emerald-400 font-mono">{formatCurrency(stats.revenue)}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={14} className="text-blue-400" />
            <span className="text-xs text-slate-500 uppercase tracking-wider">Da incassare</span>
          </div>
          <p className="text-xl font-semibold text-blue-400 font-mono">{formatCurrency(stats.pending)}</p>
        </div>
      </div>

      {/* Recent quotes */}
      <div>
        <h2 className="text-xs text-slate-500 uppercase tracking-widest mb-3 font-mono">Preventivi recenti</h2>
        {quotes.length === 0 ? (
          <div className="card p-12 text-center">
            <FileText size={32} className="text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Nessun preventivo ancora.</p>
            <button onClick={onNewQuote} className="btn-primary mt-4 mx-auto">
              <PlusCircle size={14} />
              Crea il primo preventivo
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {quotes.slice(0, 20).map(quote => (
              <QuoteRow
                key={quote.id}
                quote={quote}
                menuOpen={menuOpen === quote.id}
                onMenuToggle={() => setMenuOpen(menuOpen === quote.id ? null : quote.id)}
                onEdit={() => { setMenuOpen(null); onEditQuote(quote) }}
                onDelete={() => { setMenuOpen(null); onDeleteQuote(quote.id) }}
                onStatusChange={(s) => { setMenuOpen(null); onUpdateStatus(quote.id, s) }}
                onDownload={() => { setMenuOpen(null); generatePDF(quote, profile) }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, accent }) {
  const accents = {
    yellow: 'text-yellow-400',
    blue: 'text-blue-400',
    emerald: 'text-emerald-400',
  }
  return (
    <div className="card p-4">
      <div className={`flex items-center gap-2 mb-2 ${accents[accent] || 'text-slate-400'}`}>
        {icon}
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <p className={`text-2xl font-semibold font-mono ${accents[accent] || 'text-slate-200'}`}>{value}</p>
    </div>
  )
}

function QuoteRow({ quote, menuOpen, onMenuToggle, onEdit, onDelete, onStatusChange, onDownload }) {
  return (
    <div className="card p-3 flex items-center gap-3 hover:border-slate-700 transition-colors group">
      <button onClick={onEdit} className="flex-1 flex items-center gap-3 text-left min-w-0">
        <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
          <FileText size={14} className="text-blue-400" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-slate-200 font-mono">{quote.number}</span>
            <StatusBadge status={quote.status} />
          </div>
          <p className="text-xs text-slate-500 truncate">{quote.client?.name || 'Cliente non specificato'}</p>
        </div>
      </button>
      
      <div className="text-right shrink-0 hidden sm:block">
        <p className="text-sm font-semibold text-slate-200 font-mono">{formatCurrency(quote.fiscal?.totale)}</p>
        <p className="text-xs text-slate-600">{formatDate(quote.date)}</p>
      </div>

      <div className="relative">
        <button onClick={onMenuToggle} className="btn-ghost p-2">
          <MoreVertical size={14} />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-8 z-20 card shadow-xl border-slate-700 py-1 w-44">
            <MenuItem icon={<Eye size={13} />} label="Modifica" onClick={onEdit} />
            <MenuItem icon={<Download size={13} />} label="Scarica PDF" onClick={onDownload} />
            <div className="border-t border-slate-800 my-1" />
            <MenuItem icon={<Clock size={13} />} label="Segna Inviato" onClick={() => onStatusChange('sent')} />
            <MenuItem icon={<CheckCircle2 size={13} />} label="Segna Pagato" onClick={() => onStatusChange('paid')} />
            <div className="border-t border-slate-800 my-1" />
            <MenuItem icon={<Trash2 size={13} />} label="Elimina" onClick={onDelete} danger />
          </div>
        )}
      </div>
    </div>
  )
}

function MenuItem({ icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-slate-800 transition-colors text-left
        ${danger ? 'text-red-400 hover:text-red-300' : 'text-slate-300 hover:text-slate-100'}`}
    >
      {icon}
      {label}
    </button>
  )
}

export function StatusBadge({ status }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[status] || STATUS_COLORS.draft}`}>
      {STATUS_LABELS[status] || status}
    </span>
  )
}
