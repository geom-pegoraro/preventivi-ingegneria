// utils/fiscal.js — Italian engineering invoice fiscal logic

export const DEFAULT_FISCAL = {
  inarcassa: 4,          // Contributo Integrativo Inarcassa (%)
  ritenuta: 20,          // Ritenuta d'acconto (%)
  iva: 22,               // IVA (%)
  applyRitenuta: true,
  applyIva: true,
}

/**
 * Calculate all fiscal values for a quote
 */
export function calculateFiscal(items, fiscal = DEFAULT_FISCAL) {
  const imponibile = items.reduce((sum, item) => {
    const qty = parseFloat(item.qty) || 0
    const rate = parseFloat(item.rate) || 0
    return sum + qty * rate
  }, 0)

  const contributoIntegrativo = round2(imponibile * (fiscal.inarcassa / 100))
  const baseImponibileIva = imponibile + contributoIntegrativo
  
  const iva = fiscal.applyIva
    ? round2(baseImponibileIva * (fiscal.iva / 100))
    : 0

  const ritenuta = fiscal.applyRitenuta
    ? round2(imponibile * (fiscal.ritenuta / 100))
    : 0

  const totale = round2(baseImponibileIva + iva - ritenuta)

  return {
    imponibile: round2(imponibile),
    contributoIntegrativo,
    baseImponibileIva: round2(baseImponibileIva),
    iva,
    ritenuta,
    totale,
  }
}

function round2(n) {
  return Math.round(n * 100) / 100
}

export function formatCurrency(n) {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(n ?? 0)
}

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Intl.DateTimeFormat('it-IT').format(new Date(dateStr))
}

export const STATUS_LABELS = {
  draft: 'Bozza',
  sent: 'Inviato',
  paid: 'Pagato',
  cancelled: 'Annullato',
}

export const STATUS_COLORS = {
  draft: 'status-draft',
  sent: 'status-sent',
  paid: 'status-paid',
  cancelled: 'status-cancelled',
}

export function generateQuoteNumber(existingQuotes = []) {
  const year = new Date().getFullYear()
  const nums = existingQuotes
    .map(q => {
      const m = q.number?.match(/(\d{4})\/(\d+)$/)
      return m && parseInt(m[1]) === year ? parseInt(m[2]) : 0
    })
    .filter(Boolean)
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1
  return `PREV-${year}/${String(next).padStart(3, '0')}`
}
