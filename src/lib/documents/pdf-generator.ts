/**
 * PDF Document Generator - ServicesArtisans
 * Generates professional invoices and quotes
 */

import { brandColors } from '@/lib/branding/brand-config'

// Document types
export type DocumentType = 'invoice' | 'quote' | 'receipt' | 'contract'

export interface DocumentData {
  type: DocumentType
  number: string
  date: Date
  dueDate?: Date
  validUntil?: Date

  // Sender (Artisan)
  sender: {
    name: string
    company?: string
    address: string
    city: string
    postalCode: string
    phone?: string
    email: string
    siret?: string
    tva?: string
    logo?: string
  }

  // Recipient (Client)
  recipient: {
    name: string
    company?: string
    address?: string
    city?: string
    postalCode?: string
    email: string
    phone?: string
  }

  // Line items
  items: Array<{
    description: string
    quantity: number
    unitPrice: number
    taxRate?: number
    discount?: number
  }>

  // Totals
  subtotal: number
  taxAmount: number
  discount?: number
  total: number

  // Additional info
  notes?: string
  terms?: string
  paymentInfo?: {
    iban?: string
    bic?: string
    bankName?: string
  }
}

// Generate document number
export function generateDocumentNumber(type: DocumentType, artisanId: string): string {
  const prefix = type === 'invoice' ? 'FAC' : type === 'quote' ? 'DEV' : type === 'receipt' ? 'REC' : 'CTR'
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()

  return `${prefix}-${year}${month}-${artisanId.slice(0, 4).toUpperCase()}-${random}`
}

// Format currency
export function formatCurrency(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
  }).format(amount / 100) // Amount in cents
}

// Format date
export function formatDate(date: Date, locale: string = 'fr-FR'): string {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

// Calculate totals
export function calculateTotals(items: DocumentData['items']): {
  subtotal: number
  taxAmount: number
  total: number
} {
  let subtotal = 0
  let taxAmount = 0

  items.forEach((item) => {
    const lineTotal = item.quantity * item.unitPrice
    const lineDiscount = item.discount ? lineTotal * (item.discount / 100) : 0
    const lineTax = item.taxRate ? (lineTotal - lineDiscount) * (item.taxRate / 100) : 0

    subtotal += lineTotal - lineDiscount
    taxAmount += lineTax
  })

  return {
    subtotal,
    taxAmount,
    total: subtotal + taxAmount,
  }
}

// Generate HTML template for PDF
export function generateDocumentHTML(data: DocumentData): string {
  const typeLabels: Record<DocumentType, string> = {
    invoice: 'FACTURE',
    quote: 'DEVIS',
    receipt: 'REÇU',
    contract: 'CONTRAT',
  }

  const itemsHTML = data.items
    .map(
      (item, index) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${index + 1}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.description}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(item.unitPrice)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.taxRate || 0}%</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 500;">
          ${formatCurrency(item.quantity * item.unitPrice)}
        </td>
      </tr>
    `
    )
    .join('')

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${typeLabels[data.type]} ${data.number}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', -apple-system, sans-serif;
      font-size: 14px;
      color: #1f2937;
      line-height: 1.5;
      padding: 40px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 40px;
    }

    .logo {
      max-height: 60px;
    }

    .document-type {
      font-size: 32px;
      font-weight: 700;
      color: ${brandColors.primary.DEFAULT};
    }

    .document-number {
      font-size: 14px;
      color: #6b7280;
      margin-top: 4px;
    }

    .parties {
      display: flex;
      justify-content: space-between;
      margin-bottom: 40px;
    }

    .party {
      max-width: 45%;
    }

    .party-label {
      font-size: 12px;
      text-transform: uppercase;
      color: #6b7280;
      margin-bottom: 8px;
    }

    .party-name {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .party-details {
      font-size: 13px;
      color: #4b5563;
    }

    .dates {
      display: flex;
      gap: 40px;
      margin-bottom: 30px;
    }

    .date-item {
      font-size: 13px;
    }

    .date-label {
      color: #6b7280;
    }

    .date-value {
      font-weight: 500;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }

    th {
      background: #f3f4f6;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
      color: #6b7280;
    }

    .totals {
      margin-left: auto;
      width: 300px;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e5e7eb;
    }

    .total-row.final {
      border-bottom: none;
      border-top: 2px solid ${brandColors.primary.DEFAULT};
      padding-top: 12px;
      margin-top: 8px;
    }

    .total-label {
      color: #6b7280;
    }

    .total-value {
      font-weight: 600;
    }

    .total-row.final .total-label,
    .total-row.final .total-value {
      font-size: 18px;
      color: ${brandColors.primary.DEFAULT};
    }

    .notes {
      margin-top: 40px;
      padding: 20px;
      background: #f9fafb;
      border-radius: 8px;
    }

    .notes-title {
      font-weight: 600;
      margin-bottom: 8px;
    }

    .notes-content {
      font-size: 13px;
      color: #4b5563;
    }

    .payment-info {
      margin-top: 30px;
      padding: 20px;
      background: #eff6ff;
      border-radius: 8px;
      border: 1px solid #bfdbfe;
    }

    .payment-title {
      font-weight: 600;
      color: ${brandColors.primary.DEFAULT};
      margin-bottom: 12px;
    }

    .payment-details {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      font-size: 13px;
    }

    .payment-item {
      display: flex;
      flex-direction: column;
    }

    .payment-label {
      color: #6b7280;
      font-size: 11px;
      text-transform: uppercase;
    }

    .payment-value {
      font-weight: 500;
    }

    .footer {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      font-size: 12px;
      color: #9ca3af;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      ${data.sender.logo ? `<img src="${data.sender.logo}" class="logo" alt="${data.sender.company || data.sender.name}">` : ''}
      <div style="margin-top: 12px;">
        <div class="party-name">${data.sender.company || data.sender.name}</div>
        <div class="party-details">
          ${data.sender.address}<br>
          ${data.sender.postalCode} ${data.sender.city}<br>
          ${data.sender.phone ? `Tél: ${data.sender.phone}<br>` : ''}
          ${data.sender.email}<br>
          ${data.sender.siret ? `SIRET: ${data.sender.siret}` : ''}
          ${data.sender.tva ? `<br>TVA: ${data.sender.tva}` : ''}
        </div>
      </div>
    </div>
    <div style="text-align: right;">
      <div class="document-type">${typeLabels[data.type]}</div>
      <div class="document-number">N° ${data.number}</div>
    </div>
  </div>

  <div class="parties">
    <div class="party">
      <div class="party-label">Client</div>
      <div class="party-name">${data.recipient.name}</div>
      ${data.recipient.company ? `<div class="party-details">${data.recipient.company}</div>` : ''}
      <div class="party-details">
        ${data.recipient.address ? `${data.recipient.address}<br>` : ''}
        ${data.recipient.postalCode ? `${data.recipient.postalCode} ${data.recipient.city}<br>` : ''}
        ${data.recipient.email}
        ${data.recipient.phone ? `<br>${data.recipient.phone}` : ''}
      </div>
    </div>
  </div>

  <div class="dates">
    <div class="date-item">
      <span class="date-label">Date d'émission: </span>
      <span class="date-value">${formatDate(data.date)}</span>
    </div>
    ${data.dueDate ? `
    <div class="date-item">
      <span class="date-label">Date d'échéance: </span>
      <span class="date-value">${formatDate(data.dueDate)}</span>
    </div>
    ` : ''}
    ${data.validUntil ? `
    <div class="date-item">
      <span class="date-label">Valide jusqu'au: </span>
      <span class="date-value">${formatDate(data.validUntil)}</span>
    </div>
    ` : ''}
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 40px;">#</th>
        <th>Description</th>
        <th style="width: 80px; text-align: center;">Qté</th>
        <th style="width: 100px; text-align: right;">Prix unit.</th>
        <th style="width: 60px; text-align: center;">TVA</th>
        <th style="width: 120px; text-align: right;">Total HT</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHTML}
    </tbody>
  </table>

  <div class="totals">
    <div class="total-row">
      <span class="total-label">Sous-total HT</span>
      <span class="total-value">${formatCurrency(data.subtotal)}</span>
    </div>
    ${data.discount ? `
    <div class="total-row">
      <span class="total-label">Remise</span>
      <span class="total-value">-${formatCurrency(data.discount)}</span>
    </div>
    ` : ''}
    <div class="total-row">
      <span class="total-label">TVA</span>
      <span class="total-value">${formatCurrency(data.taxAmount)}</span>
    </div>
    <div class="total-row final">
      <span class="total-label">Total TTC</span>
      <span class="total-value">${formatCurrency(data.total)}</span>
    </div>
  </div>

  ${data.notes ? `
  <div class="notes">
    <div class="notes-title">Notes</div>
    <div class="notes-content">${data.notes}</div>
  </div>
  ` : ''}

  ${data.paymentInfo ? `
  <div class="payment-info">
    <div class="payment-title">Informations de paiement</div>
    <div class="payment-details">
      ${data.paymentInfo.iban ? `
      <div class="payment-item">
        <span class="payment-label">IBAN</span>
        <span class="payment-value">${data.paymentInfo.iban}</span>
      </div>
      ` : ''}
      ${data.paymentInfo.bic ? `
      <div class="payment-item">
        <span class="payment-label">BIC</span>
        <span class="payment-value">${data.paymentInfo.bic}</span>
      </div>
      ` : ''}
      ${data.paymentInfo.bankName ? `
      <div class="payment-item">
        <span class="payment-label">Banque</span>
        <span class="payment-value">${data.paymentInfo.bankName}</span>
      </div>
      ` : ''}
    </div>
  </div>
  ` : ''}

  ${data.terms ? `
  <div class="notes" style="margin-top: 20px;">
    <div class="notes-title">Conditions</div>
    <div class="notes-content">${data.terms}</div>
  </div>
  ` : ''}

  <div class="footer">
    Document généré sur ServicesArtisans.fr<br>
    ${data.sender.company || data.sender.name} - ${data.sender.siret ? `SIRET ${data.sender.siret}` : ''}
  </div>
</body>
</html>
  `
}

// Default terms by document type
export const defaultTerms: Record<DocumentType, string> = {
  invoice: `Paiement à réception de facture. En cas de retard de paiement, une pénalité égale à 3 fois le taux d'intérêt légal sera appliquée, ainsi qu'une indemnité forfaitaire de 40€ pour frais de recouvrement.`,
  quote: `Ce devis est valable 30 jours à compter de sa date d'émission. Tout devis signé et retourné vaut acceptation des conditions et engagement ferme.`,
  receipt: `Merci pour votre confiance.`,
  contract: `Ce contrat est soumis au droit français. Tout litige sera soumis aux tribunaux compétents.`,
}
