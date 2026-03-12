// utils/db.js — IndexedDB wrapper using idb

const DB_NAME = 'engineeringQuotes'
const DB_VERSION = 1

let dbInstance = null

async function getDB() {
  if (dbInstance) return dbInstance
  
  // Dynamic import to handle SSR/build
  const { openDB } = await import('idb')
  
  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('quotes')) {
        const quotesStore = db.createObjectStore('quotes', { keyPath: 'id' })
        quotesStore.createIndex('status', 'status')
        quotesStore.createIndex('date', 'date')
      }
      if (!db.objectStoreNames.contains('clients')) {
        db.createObjectStore('clients', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('profile')) {
        db.createObjectStore('profile', { keyPath: 'key' })
      }
    }
  })
  
  return dbInstance
}

// ── Profile ─────────────────────────────────────────────────────────────────
export async function getProfile() {
  const db = await getDB()
  const result = await db.get('profile', 'main')
  return result?.value || null
}

export async function saveProfile(profile) {
  const db = await getDB()
  await db.put('profile', { key: 'main', value: profile })
}

// ── Clients ──────────────────────────────────────────────────────────────────
export async function getClients() {
  const db = await getDB()
  return await db.getAll('clients')
}

export async function saveClient(client) {
  const db = await getDB()
  if (!client.id) client.id = crypto.randomUUID()
  await db.put('clients', client)
  return client
}

export async function deleteClient(id) {
  const db = await getDB()
  await db.delete('clients', id)
}

// ── Quotes ───────────────────────────────────────────────────────────────────
export async function getQuotes() {
  const db = await getDB()
  const quotes = await db.getAll('quotes')
  return quotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export async function getQuote(id) {
  const db = await getDB()
  return await db.get('quotes', id)
}

export async function saveQuote(quote) {
  const db = await getDB()
  if (!quote.id) {
    quote.id = crypto.randomUUID()
    quote.createdAt = new Date().toISOString()
  }
  quote.updatedAt = new Date().toISOString()
  await db.put('quotes', quote)
  return quote
}

export async function deleteQuote(id) {
  const db = await getDB()
  await db.delete('quotes', id)
}

// ── Backup / Restore ─────────────────────────────────────────────────────────
export async function exportAllData() {
  const db = await getDB()
  const [quotes, clients, profileRecord] = await Promise.all([
    db.getAll('quotes'),
    db.getAll('clients'),
    db.get('profile', 'main')
  ])
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    profile: profileRecord?.value || null,
    clients,
    quotes
  }
}

export async function importAllData(data) {
  const db = await getDB()
  const tx = db.transaction(['quotes', 'clients', 'profile'], 'readwrite')
  
  // Clear existing
  await tx.objectStore('quotes').clear()
  await tx.objectStore('clients').clear()
  await tx.objectStore('profile').clear()
  
  // Import
  if (data.profile) {
    await tx.objectStore('profile').put({ key: 'main', value: data.profile })
  }
  for (const client of (data.clients || [])) {
    await tx.objectStore('clients').put(client)
  }
  for (const quote of (data.quotes || [])) {
    await tx.objectStore('quotes').put(quote)
  }
  
  await tx.done
}
