// hooks/useStore.js — central state management
import { useState, useEffect, useCallback } from 'react'
import * as db from '../utils/db.js'

export function useStore() {
  const [quotes, setQuotes] = useState([])
  const [clients, setClients] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const [q, c, p] = await Promise.all([
        db.getQuotes(),
        db.getClients(),
        db.getProfile(),
      ])
      setQuotes(q)
      setClients(c)
      setProfile(p)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  // ── Quotes ───────────────────────────────────────────────────────────────
  const saveQuote = useCallback(async (quote) => {
    const saved = await db.saveQuote(quote)
    await loadAll()
    return saved
  }, [loadAll])

  const deleteQuote = useCallback(async (id) => {
    await db.deleteQuote(id)
    setQuotes(q => q.filter(x => x.id !== id))
  }, [])

  const updateQuoteStatus = useCallback(async (id, status) => {
    const quote = await db.getQuote(id)
    if (quote) await db.saveQuote({ ...quote, status })
    setQuotes(prev => prev.map(q => q.id === id ? { ...q, status } : q))
  }, [])

  // ── Clients ──────────────────────────────────────────────────────────────
  const saveClient = useCallback(async (client) => {
    const saved = await db.saveClient(client)
    setClients(prev => {
      const idx = prev.findIndex(c => c.id === saved.id)
      return idx >= 0 ? prev.map(c => c.id === saved.id ? saved : c) : [...prev, saved]
    })
    return saved
  }, [])

  const deleteClient = useCallback(async (id) => {
    await db.deleteClient(id)
    setClients(c => c.filter(x => x.id !== id))
  }, [])

  // ── Profile ──────────────────────────────────────────────────────────────
  const saveProfile = useCallback(async (p) => {
    await db.saveProfile(p)
    setProfile(p)
  }, [])

  // ── Backup ───────────────────────────────────────────────────────────────
  const exportData = useCallback(async () => {
    const data = await db.exportAllData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `quotegen-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [])

  const importData = useCallback(async (file) => {
    const text = await file.text()
    const data = JSON.parse(text)
    await db.importAllData(data)
    await loadAll()
  }, [loadAll])

  return {
    quotes, clients, profile, loading,
    saveQuote, deleteQuote, updateQuoteStatus,
    saveClient, deleteClient,
    saveProfile,
    exportData, importData,
    reload: loadAll,
  }
}
