'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  FileText, Download, ExternalLink, ArrowLeft, CreditCard,
  CheckCircle, Clock, XCircle, Calendar, Euro
} from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import { QuickSiteLinks } from '@/components/InternalLinks'

interface Invoice {
  id: string
  number: string | null
  date: string
  dueDate: string | null
  total: number
  status: string
  paidAt: string | null
  invoiceUrl: string | null
  pdfUrl: string | null
}

interface Payment {
  id: string
  type: string
  date: string
  amount: number
  status: string
  description: string
  artisanName: string
  bookingDate: string | null
  stripePaymentIntentId: string | null
}

export default function FacturesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'payments' | 'invoices'>('payments')

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/payments/invoices')
      if (response.ok) {
        const data = await response.json()
        setInvoices(data.invoices || [])
        setPayments(data.payments || [])
      }
    } catch (error) {
      console.error('Failed to fetch invoices:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(cents / 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
      case 'succeeded':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
            <CheckCircle className="w-3 h-3" />
            Paye
          </span>
        )
      case 'pending':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
            <Clock className="w-3 h-3" />
            En attente
          </span>
        )
      case 'failed':
      case 'void':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
            <XCircle className="w-3 h-3" />
            Echoue
          </span>
        )
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
            {status}
          </span>
        )
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Breadcrumb
            items={[
              { label: 'Mon espace', href: '/espace-client' },
              { label: 'Factures et paiements' }
            ]}
            className="mb-4"
          />
          <div className="flex items-center gap-4">
            <Link href="/espace-client" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Factures et paiements</h1>
              <p className="text-gray-600">Historique de vos transactions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6">
          <button
            onClick={() => setActiveTab('payments')}
            className={`flex-1 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === 'payments'
                ? 'bg-white text-blue-600 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <CreditCard className="w-4 h-4 inline mr-2" />
            Paiements ({payments.length})
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`flex-1 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === 'invoices'
                ? 'bg-white text-blue-600 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Factures ({invoices.length})
          </button>
        </div>

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="space-y-4">
            {payments.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center">
                <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Aucun paiement
                </h3>
                <p className="text-gray-600">
                  Vos paiements apparaitront ici apres vos reservations.
                </p>
              </div>
            ) : (
              payments.map((payment, index) => (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Euro className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {payment.description}
                        </h3>
                        <p className="text-sm text-gray-600">{payment.artisanName}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(payment.date)}
                          </span>
                          {payment.bookingDate && (
                            <span>RDV: {formatDate(payment.bookingDate)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        {formatPrice(payment.amount)}
                      </div>
                      <div className="mt-1">{getStatusBadge(payment.status)}</div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Invoices Tab */}
        {activeTab === 'invoices' && (
          <div className="space-y-4">
            {invoices.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Aucune facture
                </h3>
                <p className="text-gray-600">
                  Vos factures apparaitront ici.
                </p>
              </div>
            ) : (
              invoices.map((invoice, index) => (
                <motion.div
                  key={invoice.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <FileText className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Facture {invoice.number || invoice.id.slice(-8)}
                        </h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span>{formatDate(invoice.date)}</span>
                          {invoice.dueDate && (
                            <span>Echeance: {formatDate(invoice.dueDate)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          {formatPrice(invoice.total)}
                        </div>
                        <div className="mt-1">{getStatusBadge(invoice.status)}</div>
                      </div>
                      <div className="flex gap-2">
                        {invoice.pdfUrl && (
                          <a
                            href={invoice.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Telecharger PDF"
                          >
                            <Download className="w-5 h-5" />
                          </a>
                        )}
                        {invoice.invoiceUrl && (
                          <a
                            href={invoice.invoiceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Voir en ligne"
                          >
                            <ExternalLink className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Summary */}
        {payments.length > 0 && (
          <div className="mt-8 bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Resume</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{payments.length}</div>
                <div className="text-sm text-gray-600">Paiements</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {payments.filter((p) => p.status === 'succeeded' || p.status === 'paid').length}
                </div>
                <div className="text-sm text-gray-600">Reussis</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {formatPrice(
                    payments
                      .filter((p) => p.status === 'succeeded' || p.status === 'paid')
                      .reduce((sum, p) => sum + p.amount, 0)
                  )}
                </div>
                <div className="text-sm text-gray-600">Total paye</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {payments.filter((p) => p.status === 'pending').length}
                </div>
                <div className="text-sm text-gray-600">En attente</div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Site Links */}
        <QuickSiteLinks className="mt-8" />
      </div>
    </div>
  )
}
