// App.jsx — main application shell
import { useState, useEffect } from 'react'
import { LayoutDashboard, Users, UserCircle, Settings as SettingsIcon, Menu, X } from 'lucide-react'
import { useStore } from './hooks/useStore.js'
import Dashboard from './components/Dashboard.jsx'
import QuoteForm from './components/QuoteForm.jsx'
import Clients from './components/Clients.jsx'
import Profile from './components/Profile.jsx'
import Settings from './components/Settings.jsx'
import UpdateNotification from './components/UpdateNotification.jsx'

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'clients', label: 'Clienti', icon: Users },
  { id: 'profile', label: 'Profilo', icon: UserCircle },
  { id: 'settings', label: 'Impostazioni', icon: SettingsIcon },
]

export default function App() {
  const store = useStore()
  const [tab, setTab] = useState('dashboard')
  const [editingQuote, setEditingQuote] = useState(null) // null | 'new' | quote object
  const [navOpen, setNavOpen] = useState(false)

  const handleNewQuote = () => { setEditingQuote('new'); setTab('dashboard') }
  const handleEditQuote = (quote) => { setEditingQuote(quote); setTab('dashboard') }
  const handleSaveQuote = async (quote) => {
    await store.saveQuote(quote)
    setEditingQuote(null)
  }
  const handleBackFromQuote = () => setEditingQuote(null)

  // Listen for "save client from quote" events fired by ClientSection
  useEffect(() => {
    const handler = (e) => {
      const clientData = e.detail
      if (!clientData?.name?.trim()) return
      // Only save if not already in clients list
      const exists = store.clients.some(
        c => c.name?.toLowerCase() === clientData.name?.toLowerCase()
      )
      if (!exists) store.saveClient(clientData)
    }
    window.addEventListener('saveClientFromQuote', handler)
    return () => window.removeEventListener('saveClientFromQuote', handler)
  }, [store.clients, store.saveClient])

  const switchTab = (id) => {
    setTab(id)
    setEditingQuote(null)
    setNavOpen(false)
  }

  if (store.loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 text-sm font-mono">Caricamento…</p>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    if (tab === 'dashboard') {
      if (editingQuote !== null) {
        return (
          <QuoteForm
            quote={editingQuote === 'new' ? null : editingQuote}
            quotes={store.quotes}
            clients={store.clients}
            profile={store.profile}
            onSave={handleSaveQuote}
            onBack={handleBackFromQuote}
          />
        )
      }
      return (
        <Dashboard
          quotes={store.quotes}
          profile={store.profile}
          onNewQuote={handleNewQuote}
          onEditQuote={handleEditQuote}
          onDeleteQuote={store.deleteQuote}
          onUpdateStatus={store.updateQuoteStatus}
        />
      )
    }
    if (tab === 'clients') {
      return <Clients clients={store.clients} onSave={store.saveClient} onDelete={store.deleteClient} />
    }
    if (tab === 'profile') {
      return <Profile profile={store.profile} onSave={store.saveProfile} />
    }
    if (tab === 'settings') {
      return <Settings onExport={store.exportData} onImport={store.importData} />
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col w-56 bg-slate-900 border-r border-slate-800 fixed h-full z-20">
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-100 leading-none">QuoteGen</p>
              <p className="text-xs text-slate-500 font-mono">Engineering</p>
            </div>
          </div>
        </div>
        <nav className="p-3 flex-1">
          {TABS.map(t => {
            const Icon = t.icon
            const active = tab === t.id && editingQuote === null
            return (
              <button key={t.id} onClick={() => switchTab(t.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all mb-1
                  ${active ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}>
                <Icon size={16} />
                {t.label}
              </button>
            )
          })}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <p className="text-xs text-slate-600 font-mono">v1.0.0 · Local-First</p>
        </div>
      </aside>

      {/* Mobile overlay nav */}
      {navOpen && (
        <div className="fixed inset-0 z-30 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setNavOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-slate-900 border-r border-slate-800 p-4 space-y-1">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-slate-100">QuoteGen</p>
              <button onClick={() => setNavOpen(false)} className="btn-ghost p-2"><X size={16} /></button>
            </div>
            {TABS.map(t => {
              const Icon = t.icon
              const active = tab === t.id && editingQuote === null
              return (
                <button key={t.id} onClick={() => switchTab(t.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all
                    ${active ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}>
                  <Icon size={16} />
                  {t.label}
                </button>
              )
            })}
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 md:ml-56 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-slate-800 bg-slate-900 sticky top-0 z-10">
          <button onClick={() => setNavOpen(true)} className="btn-ghost p-2">
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <span className="text-sm font-semibold text-slate-200">
              {editingQuote ? (editingQuote === 'new' ? 'Nuovo Preventivo' : 'Modifica Preventivo')
                : TABS.find(t => t.id === tab)?.label}
            </span>
          </div>
        </div>

        <div className="flex-1 p-4 sm:p-6 max-w-4xl mx-auto w-full">
          {renderContent()}
        </div>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 flex z-10">
          {TABS.map(t => {
            const Icon = t.icon
            const active = tab === t.id && editingQuote === null
            return (
              <button key={t.id} onClick={() => switchTab(t.id)}
                className={`flex-1 flex flex-col items-center py-2.5 gap-1 text-xs transition-colors
                  ${active ? 'text-blue-400' : 'text-slate-600 hover:text-slate-400'}`}>
                <Icon size={18} />
                <span>{t.label}</span>
              </button>
            )
          })}
        </nav>
      </main>

      <UpdateNotification />
    </div>
  )
}
