// utils/pdf.js — PDF generation with jsPDF + autoTable

import { formatCurrency, formatDate } from './fiscal.js'

export async function generatePDF(quote, profile) {
  const { default: jsPDF } = await import('jspdf')
  await import('jspdf-autotable')

  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const W = 210
  const margin = 18
  const contentW = W - margin * 2

  // ── Colors ────────────────────────────────────────────────────────────────
  const NAVY = [15, 23, 42]
  const BLUE = [37, 99, 235]
  const GRAY = [100, 116, 139]
  const LIGHT = [241, 245, 249]
  const WHITE = [255, 255, 255]

  // ── Header bar ────────────────────────────────────────────────────────────
  doc.setFillColor(...NAVY)
  doc.rect(0, 0, W, 38, 'F')

  // Accent line
  doc.setFillColor(...BLUE)
  doc.rect(0, 38, W, 1.5, 'F')

  // Engineer name
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(...WHITE)
  doc.text(profile?.name || 'Studio di Ingegneria', margin, 16)

  // Tagline
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...GRAY)
  const tagline = [profile?.albo, profile?.piva ? `P.IVA ${profile.piva}` : null].filter(Boolean).join('  •  ')
  doc.text(tagline, margin, 23)

  // Quote label top-right
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(100, 160, 255)
  doc.text('PREVENTIVO', W - margin, 14, { align: 'right' })
  doc.setFontSize(14)
  doc.setTextColor(...WHITE)
  doc.text(quote.number || '—', W - margin, 22, { align: 'right' })
  doc.setFontSize(8)
  doc.setTextColor(...GRAY)
  doc.text(`Data: ${formatDate(quote.date)}`, W - margin, 29, { align: 'right' })

  let y = 50

  // ── Two-column: Client & Details ──────────────────────────────────────────
  const colW = (contentW - 8) / 2

  // Client card
  doc.setFillColor(...LIGHT)
  doc.roundedRect(margin, y, colW, 38, 2, 2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(...BLUE)
  doc.text('CLIENTE', margin + 5, y + 7)
  doc.setFontSize(10)
  doc.setTextColor(...NAVY)
  doc.text(quote.client?.name || '—', margin + 5, y + 14)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...GRAY)
  const clientLines = [
    quote.client?.address,
    quote.client?.city,
    quote.client?.piva ? `P.IVA: ${quote.client.piva}` : null,
    quote.client?.cf ? `C.F.: ${quote.client.cf}` : null,
  ].filter(Boolean)
  clientLines.forEach((line, i) => {
    doc.text(line, margin + 5, y + 20 + i * 5)
  })

  // Details card
  const col2X = margin + colW + 8
  doc.setFillColor(...LIGHT)
  doc.roundedRect(col2X, y, colW, 38, 2, 2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(...BLUE)
  doc.text('DETTAGLI PREVENTIVO', col2X + 5, y + 7)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...GRAY)
  const details = [
    ['Oggetto:', quote.subject || '—'],
    ['Pagamento:', quote.paymentTerms || '—'],
    ['Validità:', quote.validity || '30 giorni'],
  ]
  details.forEach(([k, v], i) => {
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...NAVY)
    doc.text(k, col2X + 5, y + 15 + i * 6)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...GRAY)
    doc.text(v, col2X + 28, y + 15 + i * 6)
  })

  y += 46

  // ── Prestazioni table ────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...BLUE)
  doc.text('PRESTAZIONI', margin, y + 1)
  y += 6

  const tableData = (quote.items || []).map((item, i) => [
    String(i + 1).padStart(2, '0'),
    item.description || '—',
    item.unit || 'h',
    item.qty || 1,
    formatCurrency(item.rate),
    formatCurrency((item.qty || 0) * (item.rate || 0)),
  ])

  doc.autoTable({
    startY: y,
    head: [['#', 'Descrizione Prestazione', 'U.M.', 'Qta', 'Tariffa', 'Importo']],
    body: tableData,
    margin: { left: margin, right: margin },
    styles: {
      font: 'helvetica',
      fontSize: 8.5,
      cellPadding: 4,
      textColor: NAVY,
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: NAVY,
      textColor: WHITE,
      fontStyle: 'bold',
      fontSize: 7.5,
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      2: { cellWidth: 14, halign: 'center' },
      3: { cellWidth: 14, halign: 'center' },
      4: { cellWidth: 26, halign: 'right' },
      5: { cellWidth: 28, halign: 'right', fontStyle: 'bold' },
    },
  })

  y = doc.lastAutoTable.finalY + 8

  // ── Fiscal summary ────────────────────────────────────────────────────────
  const fiscal = quote.fiscal || {}
  const summaryRows = [
    ['Imponibile', formatCurrency(fiscal.imponibile)],
    [`Contributo Integrativo (${quote.fiscalSettings?.inarcassa ?? 4}%)`, formatCurrency(fiscal.contributoIntegrativo)],
  ]
  if (fiscal.iva > 0) summaryRows.push([`IVA (${quote.fiscalSettings?.iva ?? 22}%)`, formatCurrency(fiscal.iva)])
  if (fiscal.ritenuta > 0) summaryRows.push([`Ritenuta d'Acconto (${quote.fiscalSettings?.ritenuta ?? 20}%) — dedotta`, `- ${formatCurrency(fiscal.ritenuta)}`])

  const summaryX = W - margin - 75
  let sy = y
  summaryRows.forEach(([label, value]) => {
    doc.setFillColor(248, 250, 252)
    doc.rect(summaryX, sy, 75, 7, 'F')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...GRAY)
    doc.text(label, summaryX + 3, sy + 5)
    doc.setTextColor(...NAVY)
    doc.text(value, W - margin - 2, sy + 5, { align: 'right' })
    sy += 8
  })

  // Total row
  doc.setFillColor(...NAVY)
  doc.roundedRect(summaryX, sy, 75, 11, 1, 1, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...WHITE)
  doc.text('TOTALE DOVUTO', summaryX + 3, sy + 7)
  doc.setFontSize(10)
  doc.text(formatCurrency(fiscal.totale), W - margin - 2, sy + 7, { align: 'right' })

  y = sy + 18

  // ── Notes ────────────────────────────────────────────────────────────────
  if (quote.notes) {
    doc.setDrawColor(...BLUE)
    doc.setLineWidth(0.5)
    doc.line(margin, y, margin + 3, y)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(...BLUE)
    doc.text('NOTE', margin + 5, y)
    y += 5
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...GRAY)
    const noteLines = doc.splitTextToSize(quote.notes, contentW)
    doc.text(noteLines, margin, y)
    y += noteLines.length * 4.5 + 5
  }

  // ── Footer ────────────────────────────────────────────────────────────────
  const pageH = doc.internal.pageSize.height
  doc.setFillColor(...LIGHT)
  doc.rect(0, pageH - 18, W, 18, 'F')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...GRAY)
  const footerParts = [
    profile?.address,
    profile?.email,
    profile?.phone,
    profile?.piva ? `P.IVA ${profile.piva}` : null,
  ].filter(Boolean)
  doc.text(footerParts.join('  ·  '), W / 2, pageH - 8, { align: 'center' })

  doc.save(`${quote.number || 'preventivo'}.pdf`)
}
