// components/Clients.jsx
import { useState } from 'react'
import { Plus, Pencil, Trash2, Users, Search, X, Save, Building2 } from 'lucide-react'

const EMPTY = { name: '', piva: '', cf: '', address: '', city: '', email: '', phone: '' }

export default function Clients({ clients, onSave, onDelete }) {
  const [editing, setEditing] = useState(null)   // null | 'new' | client object
  const [search, setSearch] = useState('')

  const filtered = clients.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.piva?.includes(search) ||
    c.city?.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = async (form) => {
    await onSave(form)
    setEditing(null)
  }

  if (editing !== null) {
    return <ClientForm initial={editing === 'new' ? EMPTY : editing} onSave={handleSave} onCancel={() => setEditing(null)} />
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-mono mb-1">Rubrica</p>
          <h1 className="text-2xl font-semibold text-slate-100">Clienti</h1>
        </div>
        <button onClick={() => setEditing('new')} className="btn-primary">
          <Plus size={16} />
          Nuovo
        </button>
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          className="input pl-9"
          placeholder="Cerca per nome, P.IVA, città…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
            <X size={14} />
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Users size={32} className="text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">{search ? 'Nessun risultato.' : 'Nessun cliente salvato.'}</p>
          {!search && (
            <button onClick={() => setEditing('new')} className="btn-primary mt-4 mx-auto">
              <Plus size={14} />
              Aggiungi cliente
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(client => (
            <div key={client.id} className="card p-4 flex items-center gap-3 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-full bg-blue-900/40 border border-blue-800/50 flex items-center justify-center shrink-0">
                <Building2 size={16} className="text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-200 text-sm">{client.name}</p>
                <p className="text-xs text-slate-500 truncate">
                  {[client.city, client.piva ? `P.IVA ${client.piva}` : null].filter(Boolean).join(' · ')}
                </p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setEditing(client)} className="btn-ghost p-2">
                  <Pencil size={13} />
                </button>
                <button onClick={() => onDelete(client.id)} className="btn-ghost p-2 text-red-500 hover:text-red-400">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ClientForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const isNew = !initial.id

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onCancel} className="btn-ghost">
          <X size={16} />
        </button>
        <h2 className="text-xl font-semibold">{isNew ? 'Nuovo Cliente' : 'Modifica Cliente'}</h2>
      </div>

      <div className="card p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="label">Ragione Sociale / Nome *</label>
            <input className="input" placeholder="Azienda S.r.l." value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div>
            <label className="label">P.IVA</label>
            <input className="input font-mono" placeholder="IT00000000000" value={form.piva} onChange={e => set('piva', e.target.value)} />
          </div>
          <div>
            <label className="label">Codice Fiscale</label>
            <input className="input font-mono uppercase" value={form.cf} onChange={e => set('cf', e.target.value.toUpperCase())} />
          </div>
          <div>
            <label className="label">Indirizzo</label>
            <input className="input" value={form.address} onChange={e => set('address', e.target.value)} />
          </div>
          <div>
            <label className="label">Città / CAP</label>
            <input className="input" value={form.city} onChange={e => set('city', e.target.value)} />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} />
          </div>
          <div>
            <label className="label">Telefono</label>
            <input className="input" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} />
          </div>
        </div>
      </div>

      <button onClick={() => onSave(form)} disabled={!form.name} className="btn-primary w-full justify-center py-3">
        <Save size={16} />
        Salva Cliente
      </button>
    </div>
  )
}
