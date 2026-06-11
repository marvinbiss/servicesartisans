import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { getQuoteByToken, markQuoteViewedByToken } from '@/lib/services/provider-quotes-service'
import {
  formatEUR,
  acompteAmount,
  type QuoteStatus,
  type QuoteClientType,
  type FinancingRail,
} from '@/lib/devis'
import { getFinancingPartner } from '@/lib/financing/partners'
import { FinancingCta } from '@/components/financing/FinancingCta'
import { DevisClientActions } from './DevisClientActions'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Votre devis',
  robots: { index: false, follow: false },
}

type PageProps = { params: { token: string } }

type Provider = { name: string | null; slug: string | null; address_city: string | null }
type Line = {
  id: string
  designation: string
  quantite: number
  unite: string
  prix_unitaire_ht: number
  tva_rate: number
  total_ligne_ht: number
}
type Quote = {
  id: string
  numero: string | null
  status: QuoteStatus
  client_type: QuoteClientType
  client_nom: string | null
  total_ht: number
  total_tva: number
  total_ttc: number
  acompte_pct: number
  notes: string | null
  valid_until: string | null
  financing_rail: FinancingRail
  created_at: string
  provider: Provider | Provider[] | null
  lines: Line[]
}

const STATUS_LABEL: Record<QuoteStatus, string> = {
  brouillon: 'Brouillon',
  envoye: 'En attente de votre réponse',
  vu: 'En attente de votre réponse',
  accepte: 'Devis accepté',
  refuse: 'Devis refusé',
  expire: 'Devis expiré',
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Paris',
  })
}

const card = 'bg-white rounded-2xl shadow-sm border border-sand-200'

export default async function DevisClientPage({ params }: PageProps) {
  const token = params.token?.trim()
  if (!token || token.length < 16) notFound()

  const supabase = createAdminClient()
  const { data } = await getQuoteByToken(supabase, token)
  if (!data) notFound()

  const quote = data as unknown as Quote
  const provider = Array.isArray(quote.provider) ? quote.provider[0] : quote.provider
  const artisanName = provider?.name ?? 'Votre artisan'

  // Expiration par date de validité (sans muter le statut serveur ici).
  const expiredByDate =
    !!quote.valid_until &&
    new Date(`${quote.valid_until}T23:59:59`).getTime() < Date.now() &&
    (quote.status === 'envoye' || quote.status === 'vu')

  // Première consultation → marque « vu » (side-effect non bloquant).
  if (quote.status === 'envoye') {
    await markQuoteViewedByToken(supabase, token)
  }

  const isPending = (quote.status === 'envoye' || quote.status === 'vu') && !expiredByDate
  const acompte = acompteAmount(quote.total_ttc, quote.acompte_pct)

  // CTA financement (indicateur) : visible tant que le devis est vivant (pas
  // refusé/expiré) ET le partenaire actif via flag. Younited pour le particulier.
  const financingPartner =
    quote.status !== 'refuse' && !expiredByDate ? getFinancingPartner(quote.financing_rail) : null
  const clientFinancing = financingPartner?.audience === 'client' ? financingPartner : null

  return (
    <main className="min-h-screen bg-sand-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <header className="text-center">
          <p className="text-sm text-charcoal-500">Devis de</p>
          <h1 className="font-heading text-3xl font-bold text-charcoal-900">{artisanName}</h1>
          {provider?.address_city && (
            <p className="text-charcoal-500 text-sm mt-1">{provider.address_city}</p>
          )}
        </header>

        <div className={`${card} p-6 space-y-1 text-center`}>
          <p className="text-sm text-charcoal-500">
            {quote.numero ? `Devis ${quote.numero}` : 'Devis'} · émis le{' '}
            {formatDate(quote.created_at)}
          </p>
          <p
            className={`text-sm font-semibold ${
              quote.status === 'accepte'
                ? 'text-green-600'
                : quote.status === 'refuse' || expiredByDate
                  ? 'text-red-600'
                  : 'text-primary-600'
            }`}
          >
            {expiredByDate ? 'Devis expiré' : STATUS_LABEL[quote.status]}
          </p>
        </div>

        {quote.client_nom && (
          <div className={`${card} p-5`}>
            <p className="text-sm text-charcoal-500">À l&apos;attention de</p>
            <p className="font-medium text-charcoal-800">{quote.client_nom}</p>
          </div>
        )}

        <section className={`${card} overflow-hidden`}>
          <table className="w-full text-sm">
            <thead className="bg-sand-50 text-charcoal-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left font-medium px-4 py-2.5">Désignation</th>
                <th className="text-right font-medium px-4 py-2.5">Qté</th>
                <th className="text-right font-medium px-4 py-2.5">Prix u. HT</th>
                <th className="text-right font-medium px-4 py-2.5">Total HT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-100">
              {quote.lines.map((l) => (
                <tr key={l.id}>
                  <td className="px-4 py-3 text-charcoal-800">{l.designation}</td>
                  <td className="px-4 py-3 text-right tabular-nums whitespace-nowrap">
                    {l.quantite} {l.unite}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums whitespace-nowrap">
                    {formatEUR(l.prix_unitaire_ht)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums font-medium whitespace-nowrap">
                    {formatEUR(l.total_ligne_ht)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-sand-200 p-5 space-y-1.5 sm:max-w-xs sm:ml-auto">
            <div className="flex justify-between text-sm">
              <span className="text-charcoal-500">Total HT</span>
              <span className="tabular-nums">{formatEUR(quote.total_ht)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-charcoal-500">TVA</span>
              <span className="tabular-nums">{formatEUR(quote.total_tva)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-sand-200 pt-2">
              <span>Total TTC</span>
              <span className="tabular-nums">{formatEUR(quote.total_ttc)}</span>
            </div>
            <div className="flex justify-between text-sm text-charcoal-500">
              <span>Acompte {quote.acompte_pct}%</span>
              <span className="tabular-nums">{formatEUR(acompte)}</span>
            </div>
          </div>
        </section>

        {quote.notes && (
          <div className={`${card} p-5`}>
            <p className="text-sm text-charcoal-500 mb-1">Conditions</p>
            <p className="text-sm text-charcoal-700 whitespace-pre-wrap">{quote.notes}</p>
          </div>
        )}

        {quote.valid_until && !expiredByDate && (
          <p className="text-center text-sm text-charcoal-500">
            Valable jusqu&apos;au {formatDate(quote.valid_until)}
          </p>
        )}

        {clientFinancing && <FinancingCta partner={clientFinancing} />}

        {isPending ? (
          <DevisClientActions token={token} />
        ) : (
          <div className={`${card} p-5 text-center text-sm text-charcoal-600`}>
            {quote.status === 'accepte' &&
              'Vous avez accepté ce devis. L’artisan vous recontactera.'}
            {quote.status === 'refuse' && 'Vous avez refusé ce devis.'}
            {expiredByDate && 'Ce devis a expiré. Contactez l’artisan pour un nouveau devis.'}
          </div>
        )}

        <p className="text-center text-xs text-charcoal-400">Devis émis via ServicesArtisans</p>
      </div>
    </main>
  )
}
