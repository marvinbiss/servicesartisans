/**
 * Invoice Generation Service
 * Generate and manage invoices for bookings
 */

import { createClient as createServerClient } from '@/lib/supabase/server'

export interface InvoiceItem {
  description: string
  quantity: number
  unit_price: number
  total: number
  tva_rate: number
}

export interface Invoice {
  id: string
  invoice_number: string
  booking_id: string
  provider_id: string
  client_id: string

  // Provider info
  provider_name: string
  provider_address: string
  provider_siret: string
  provider_email: string
  provider_phone: string

  // Client info
  client_name: string
  client_address: string
  client_email: string
  client_phone?: string

  // Invoice details
  items: InvoiceItem[]
  subtotal: number
  tva_amount: number
  total: number

  // Dates
  issue_date: string
  due_date: string
  paid_date?: string

  // Status
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'

  // Payment info
  payment_method?: string
  payment_reference?: string

  created_at: string
  updated_at: string
}

export interface CreateInvoiceInput {
  booking_id: string
  items: InvoiceItem[]
  notes?: string
  due_days?: number
}

export class InvoiceService {
  /**
   * Generate invoice number
   */
  private generateInvoiceNumber(providerId: string): string {
    const year = new Date().getFullYear()
    const month = String(new Date().getMonth() + 1).padStart(2, '0')
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `FA-${year}${month}-${random}`
  }

  /**
   * Create a new invoice
   */
  async createInvoice(input: CreateInvoiceInput): Promise<Invoice | null> {
    const supabase = await createServerClient()

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        provider:providers(
          id,
          company_name,
          address,
          city,
          postal_code,
          siret,
          email,
          phone,
          user_id
        ),
        client:profiles(
          id,
          full_name,
          email,
          phone
        )
      `)
      .eq('id', input.booking_id)
      .single()

    if (bookingError || !booking) {
      console.error('Error fetching booking:', bookingError)
      return null
    }

    const provider = booking.provider as any
    const client = booking.client as any

    // Calculate totals
    const subtotal = input.items.reduce((sum, item) => sum + item.total, 0)
    const tvaAmount = input.items.reduce(
      (sum, item) => sum + (item.total * item.tva_rate) / 100,
      0
    )
    const total = subtotal + tvaAmount

    const invoiceNumber = this.generateInvoiceNumber(provider.id)
    const issueDate = new Date().toISOString()
    const dueDate = new Date(
      Date.now() + (input.due_days || 30) * 24 * 60 * 60 * 1000
    ).toISOString()

    const invoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at'> = {
      invoice_number: invoiceNumber,
      booking_id: input.booking_id,
      provider_id: provider.id,
      client_id: client.id,

      provider_name: provider.company_name,
      provider_address: `${provider.address}, ${provider.postal_code} ${provider.city}`,
      provider_siret: provider.siret || '',
      provider_email: provider.email,
      provider_phone: provider.phone,

      client_name: client.full_name,
      client_address: booking.address || '',
      client_email: client.email,
      client_phone: client.phone,

      items: input.items,
      subtotal,
      tva_amount: tvaAmount,
      total,

      issue_date: issueDate,
      due_date: dueDate,

      status: 'draft',
    }

    const { data, error } = await supabase
      .from('invoices')
      .insert(invoice)
      .select()
      .single()

    if (error) {
      console.error('Error creating invoice:', error)
      return null
    }

    return data as Invoice
  }

  /**
   * Get invoice by ID
   */
  async getInvoice(invoiceId: string): Promise<Invoice | null> {
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single()

    if (error) {
      console.error('Error fetching invoice:', error)
      return null
    }

    return data as Invoice
  }

  /**
   * Get invoices for a provider
   */
  async getProviderInvoices(
    providerId: string,
    status?: Invoice['status']
  ): Promise<Invoice[]> {
    const supabase = await createServerClient()

    let query = supabase
      .from('invoices')
      .select('*')
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching invoices:', error)
      return []
    }

    return (data || []) as Invoice[]
  }

  /**
   * Get invoices for a client
   */
  async getClientInvoices(
    clientId: string,
    status?: Invoice['status']
  ): Promise<Invoice[]> {
    const supabase = await createServerClient()

    let query = supabase
      .from('invoices')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching invoices:', error)
      return []
    }

    return (data || []) as Invoice[]
  }

  /**
   * Update invoice status
   */
  async updateStatus(
    invoiceId: string,
    status: Invoice['status'],
    paymentInfo?: { method?: string; reference?: string }
  ): Promise<boolean> {
    const supabase = await createServerClient()

    const updateData: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    }

    if (status === 'paid') {
      updateData.paid_date = new Date().toISOString()
      if (paymentInfo?.method) {
        updateData.payment_method = paymentInfo.method
      }
      if (paymentInfo?.reference) {
        updateData.payment_reference = paymentInfo.reference
      }
    }

    const { error } = await supabase
      .from('invoices')
      .update(updateData)
      .eq('id', invoiceId)

    if (error) {
      console.error('Error updating invoice:', error)
      return false
    }

    return true
  }

  /**
   * Send invoice to client
   */
  async sendInvoice(invoiceId: string): Promise<boolean> {
    const invoice = await this.getInvoice(invoiceId)
    if (!invoice) return false

    // Update status to sent
    await this.updateStatus(invoiceId, 'sent')

    // In a real implementation, send email with PDF
    // await emailService.sendInvoice(invoice)

    return true
  }

  /**
   * Generate invoice PDF HTML
   */
  generateInvoiceHTML(invoice: Invoice): string {
    const itemsHTML = invoice.items
      .map(
        (item) => `
      <tr>
        <td>${item.description}</td>
        <td class="text-center">${item.quantity}</td>
        <td class="text-right">${item.unit_price.toFixed(2)} €</td>
        <td class="text-center">${item.tva_rate}%</td>
        <td class="text-right">${item.total.toFixed(2)} €</td>
      </tr>
    `
      )
      .join('')

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Facture ${invoice.invoice_number}</title>
      <style>
        body { font-family: 'Helvetica', Arial, sans-serif; margin: 40px; color: #333; }
        .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
        .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
        .invoice-info { text-align: right; }
        .invoice-number { font-size: 20px; font-weight: bold; color: #2563eb; }
        .addresses { display: flex; justify-content: space-between; margin-bottom: 40px; }
        .address-box { width: 45%; }
        .address-box h3 { margin-bottom: 10px; color: #666; font-size: 12px; text-transform: uppercase; }
        .address-box p { margin: 4px 0; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th { background: #f8fafc; padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0; }
        td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .totals { width: 300px; margin-left: auto; }
        .totals tr td { padding: 8px 12px; }
        .totals tr.total { font-weight: bold; font-size: 18px; background: #f8fafc; }
        .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #666; }
        .status { display: inline-block; padding: 4px 12px; border-radius: 4px; font-weight: 500; }
        .status-paid { background: #dcfce7; color: #166534; }
        .status-sent { background: #dbeafe; color: #1e40af; }
        .status-draft { background: #f3f4f6; color: #374151; }
        .status-overdue { background: #fee2e2; color: #991b1b; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">ServicesArtisans</div>
        <div class="invoice-info">
          <div class="invoice-number">FACTURE ${invoice.invoice_number}</div>
          <p>Date d'émission: ${new Date(invoice.issue_date).toLocaleDateString('fr-FR')}</p>
          <p>Date d'échéance: ${new Date(invoice.due_date).toLocaleDateString('fr-FR')}</p>
          <p>
            <span class="status status-${invoice.status}">
              ${invoice.status.toUpperCase()}
            </span>
          </p>
        </div>
      </div>

      <div class="addresses">
        <div class="address-box">
          <h3>Émetteur</h3>
          <p><strong>${invoice.provider_name}</strong></p>
          <p>${invoice.provider_address}</p>
          <p>SIRET: ${invoice.provider_siret}</p>
          <p>Email: ${invoice.provider_email}</p>
          <p>Tél: ${invoice.provider_phone}</p>
        </div>
        <div class="address-box">
          <h3>Client</h3>
          <p><strong>${invoice.client_name}</strong></p>
          <p>${invoice.client_address}</p>
          <p>Email: ${invoice.client_email}</p>
          ${invoice.client_phone ? `<p>Tél: ${invoice.client_phone}</p>` : ''}
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th class="text-center">Quantité</th>
            <th class="text-right">Prix unitaire</th>
            <th class="text-center">TVA</th>
            <th class="text-right">Total HT</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
        </tbody>
      </table>

      <table class="totals">
        <tr>
          <td>Sous-total HT</td>
          <td class="text-right">${invoice.subtotal.toFixed(2)} €</td>
        </tr>
        <tr>
          <td>TVA</td>
          <td class="text-right">${invoice.tva_amount.toFixed(2)} €</td>
        </tr>
        <tr class="total">
          <td>Total TTC</td>
          <td class="text-right">${invoice.total.toFixed(2)} €</td>
        </tr>
      </table>

      <div class="footer">
        <p><strong>Conditions de paiement:</strong> Paiement à réception de facture</p>
        <p><strong>Mode de paiement:</strong> Virement bancaire ou carte bancaire</p>
        ${invoice.payment_reference ? `<p><strong>Référence de paiement:</strong> ${invoice.payment_reference}</p>` : ''}
        <p>En cas de retard de paiement, des pénalités de retard seront appliquées conformément à la loi.</p>
      </div>
    </body>
    </html>
    `
  }

  /**
   * Check for overdue invoices
   */
  async checkOverdueInvoices(): Promise<number> {
    const supabase = await createServerClient()
    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from('invoices')
      .update({ status: 'overdue', updated_at: now })
      .eq('status', 'sent')
      .lt('due_date', now)
      .select()

    if (error) {
      console.error('Error checking overdue invoices:', error)
      return 0
    }

    return data?.length || 0
  }
}

export const invoiceService = new InvoiceService()
export default invoiceService
