// components/Profile.jsx
import { useState, useEffect } from 'react'
import { Save, User, Building2, Phone, Mail, MapPin, CreditCard, Shield } from 'lucide-react'

const EMPTY_PROFILE = {
  name: '',
  title: '',
  albo: '',
  piva: '',
  cf: '',
  address: '',
  city: '',
  phone: '',
  email: '',
  iban: '',
  website: '',
  logo: '',
}

export default function Profile({ profile, onSave }) {
  const [form, setForm] = useState(profile || EMPTY_PROFILE)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (profile) setForm(profile)
  }, [profile])

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const handleSave = async () => {
    await onSave(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => set('logo', ev.target.result)
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-6 pb-12">
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-widest font-mono mb-1">Impostazioni</p>
        <h1 className="text-2xl font-semibold text-slate-100">Profilo Professionale</h1>
      </div>

      {/* Logo */}
      <div className="card p-4 space-y-3">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          <Building2 size={14} className="text-blue-400" />
          Logo / Intestazione
        </h3>
        <div className="flex items-center gap-4">
          {form.logo ? (
            <img src={form.logo} alt="Logo" className="h-16 w-auto object-contain rounded-lg border border-slate-700 bg-white p-1" />
          ) : (
            <div className="h-16 w-24 rounded-lg border-2 border-dashed border-slate-700 flex items-center justify-center text-slate-600">
              <Building2 size={20} />
            </div>
          )}
          <div>
            <label className="btn-secondary cursor-pointer">
              <span>Carica Logo</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </label>
            {form.logo && (
              <button onClick={() => set('logo', '')} className="btn-ghost text-red-400 mt-1">Rimuovi</button>
            )}
          </div>
        </div>
      </div>

      {/* Personal info */}
      <div className="card p-4 space-y-3">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          <User size={14} className="text-blue-400" />
          Dati Anagrafici
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label">Nome e Cognome *</label>
            <input className="input" placeholder="Ing. Mario Rossi" value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div>
            <label className="label">Titolo professionale</label>
            <input className="input" placeholder="Ingegnere Civile" value={form.title} onChange={e => set('title', e.target.value)} />
          </div>
          <div>
            <label className="label">P.IVA *</label>
            <input className="input font-mono" placeholder="IT00000000000" value={form.piva} onChange={e => set('piva', e.target.value)} />
          </div>
          <div>
            <label className="label">Codice Fiscale</label>
            <input className="input font-mono uppercase" placeholder="RSSMRA00A01H501Z" value={form.cf} onChange={e => set('cf', e.target.value.toUpperCase())} />
          </div>
        </div>
      </div>

      {/* Professional */}
      <div className="card p-4 space-y-3">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          <Shield size={14} className="text-blue-400" />
          Dati Professionali
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="label">Iscrizione Albo</label>
            <input className="input" placeholder="Ordine Ingegneri Provincia di Roma — n. 00000" value={form.albo} onChange={e => set('albo', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="card p-4 space-y-3">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          <Phone size={14} className="text-blue-400" />
          Contatti
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label">Email *</label>
            <input className="input" type="email" placeholder="mario.rossi@studio.it" value={form.email} onChange={e => set('email', e.target.value)} />
          </div>
          <div>
            <label className="label">Telefono</label>
            <input className="input" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} />
          </div>
          <div>
            <label className="label">Indirizzo Studio</label>
            <input className="input" value={form.address} onChange={e => set('address', e.target.value)} />
          </div>
          <div>
            <label className="label">Città / CAP</label>
            <input className="input" value={form.city} onChange={e => set('city', e.target.value)} />
          </div>
          <div>
            <label className="label">Sito Web</label>
            <input className="input" type="url" placeholder="https://www.studio-rossi.it" value={form.website} onChange={e => set('website', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Banking */}
      <div className="card p-4 space-y-3">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          <CreditCard size={14} className="text-blue-400" />
          Dati Bancari
        </h3>
        <div>
          <label className="label">IBAN</label>
          <input className="input font-mono uppercase tracking-wider" placeholder="IT60 X054 2811 1010 0000 0123 456"
            value={form.iban} onChange={e => set('iban', e.target.value.toUpperCase())} />
        </div>
      </div>

      <button onClick={handleSave} className={`btn-primary w-full justify-center py-3 ${saved ? 'bg-emerald-600 hover:bg-emerald-500' : ''}`}>
        <Save size={16} />
        {saved ? 'Salvato!' : 'Salva Profilo'}
      </button>
    </div>
  )
}
