'use client'

import { useMemo, useState } from 'react'
import { Euro, TrendingUp, Info } from 'lucide-react'

type Operation = {
  code: string
  label: string
  primeMoyenne: number
  description: string
}

const OPERATIONS: Operation[] = [
  {
    code: 'BAR-TH-171',
    label: 'PAC air/eau',
    primeMoyenne: 3750,
    description: 'Pompe à chaleur air/eau (prime client moyenne)',
  },
  {
    code: 'BAR-EN-101',
    label: 'Isolation combles',
    primeMoyenne: 1800,
    description: 'Isolation des combles perdus (prime client moyenne)',
  },
  {
    code: 'BAR-TH-113',
    label: 'Chaudière biomasse',
    primeMoyenne: 4000,
    description: 'Chaudière biomasse performante',
  },
  {
    code: 'BAR-TH-112',
    label: 'Poêle bois / granulés',
    primeMoyenne: 1400,
    description: 'Poêle à bois ou à granulés',
  },
  {
    code: 'BAR-EN-103',
    label: 'Isolation planchers bas',
    primeMoyenne: 1800,
    description: 'Isolation des planchers bas',
  },
  {
    code: 'BAR-TH-172',
    label: 'PAC eau/eau',
    primeMoyenne: 3750,
    description: 'Pompe à chaleur eau/eau / géothermie',
  },
]

const MAX_CHANTIERS = 12

function formatEuro(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value)
}

export default function PartnerRevenuSimulator() {
  const [volumes, setVolumes] = useState<Record<string, number>>(() =>
    Object.fromEntries(OPERATIONS.map((op) => [op.code, 0]))
  )

  const totals = useMemo(() => {
    let primesClients = 0
    let chantiersTotaux = 0
    for (const op of OPERATIONS) {
      const n = volumes[op.code] ?? 0
      primesClients += n * op.primeMoyenne
      chantiersTotaux += n
    }
    // Phase de lancement : 0 € de commission sur les primes.
    // Indicatif "à terme" (hors phase lancement) : 12 % prime, jamais sur le devis.
    const commissionALongTerme = primesClients * 0.12
    return {
      primesClients,
      chantiersTotaux,
      commissionALongTerme,
      primesClientsAnnuel: primesClients * 12,
    }
  }, [volumes])

  return (
    <section className="bg-gradient-to-r from-emerald-50 to-emerald-100/60 border-y border-emerald-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-start gap-3 mb-6">
          <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center">
            <Euro className="w-6 h-6 text-white" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-1">
              Simulateur de primes CEE générées pour vos clients
            </h2>
            <p className="text-sm text-charcoal-600 leading-relaxed max-w-3xl">
              Indiquez vos volumes mensuels par opération. Le simulateur estime les primes CEE
              cumulées pour vos clients et votre gain indirect (meilleure conversion, client
              satisfait, upsell). Estimation indicative — montants réels variables selon ménage,
              zone climatique, surface.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          {OPERATIONS.map((op) => {
            const count = volumes[op.code] ?? 0
            const sousTotal = count * op.primeMoyenne
            return (
              <div
                key={op.code}
                className="bg-white rounded-2xl border border-emerald-100 p-5 hover:border-emerald-300 transition"
              >
                <div className="flex items-baseline justify-between mb-2 gap-3">
                  <div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-700 mb-1">
                      {op.code}
                    </span>
                    <h3 className="font-heading font-bold text-charcoal-900 text-base leading-tight">
                      {op.label}
                    </h3>
                  </div>
                  <div className="text-right whitespace-nowrap">
                    <div className="text-xs text-charcoal-500">Prime moy./chantier</div>
                    <div className="font-heading font-extrabold text-emerald-700 text-lg">
                      {formatEuro(op.primeMoyenne)}
                    </div>
                  </div>
                </div>

                <label htmlFor={`vol-${op.code}`} className="sr-only">
                  Nombre de chantiers par mois pour {op.label}
                </label>
                <div className="flex items-center gap-3 mt-3">
                  <input
                    id={`vol-${op.code}`}
                    type="range"
                    min={0}
                    max={MAX_CHANTIERS}
                    step={1}
                    value={count}
                    onChange={(e) =>
                      setVolumes((prev) => ({ ...prev, [op.code]: Number(e.target.value) }))
                    }
                    className="flex-1 accent-emerald-600 h-2"
                    aria-describedby={`vol-${op.code}-desc`}
                  />
                  <div
                    id={`vol-${op.code}-desc`}
                    className="w-16 text-center font-heading font-bold text-charcoal-900 tabular-nums"
                  >
                    {count}
                    <span className="text-xs text-charcoal-500">/mois</span>
                  </div>
                </div>

                <p className="text-xs text-charcoal-500 mt-2">
                  Sous-total primes clients :{' '}
                  <span className="font-semibold text-charcoal-800">{formatEuro(sousTotal)}</span>
                  /mois
                </p>
              </div>
            )
          })}
        </div>

        <div className="bg-white rounded-2xl border-2 border-emerald-300 p-6 md:p-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-emerald-700" aria-hidden="true" />
            <h3 className="font-heading text-xl font-extrabold text-charcoal-900">
              Synthèse de vos volumes
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-xs text-charcoal-500 uppercase tracking-wide">Chantiers</div>
              <div className="font-heading text-2xl font-extrabold text-charcoal-900 tabular-nums">
                {totals.chantiersTotaux}
              </div>
              <div className="text-xs text-charcoal-500">/ mois</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-charcoal-500 uppercase tracking-wide">
                Primes clients
              </div>
              <div className="font-heading text-2xl font-extrabold text-emerald-700 tabular-nums">
                {formatEuro(totals.primesClients)}
              </div>
              <div className="text-xs text-charcoal-500">/ mois</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-charcoal-500 uppercase tracking-wide">
                Primes clients
              </div>
              <div className="font-heading text-2xl font-extrabold text-emerald-700 tabular-nums">
                {formatEuro(totals.primesClientsAnnuel)}
              </div>
              <div className="text-xs text-charcoal-500">/ an</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-charcoal-500 uppercase tracking-wide">
                Votre commission
              </div>
              <div className="font-heading text-2xl font-extrabold text-emerald-700 tabular-nums">
                {formatEuro(0)}
              </div>
              <div className="text-xs text-charcoal-500">
                phase lancement
                <br />
                (à terme {formatEuro(totals.commissionALongTerme)} / mois)
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-start gap-2 bg-sand-50 border border-charcoal-100 rounded-xl p-4">
            <Info className="w-4 h-4 text-charcoal-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-xs text-charcoal-600 leading-relaxed">
              <strong className="text-charcoal-800">Comment lire ce simulateur :</strong> pendant la
              phase de lancement, 0 € prélevé sur votre activité — l'intégralité de la prime revient
              à votre client. À terme, une commission de 10 à 15 % pourra être appliquée sur la
              prime (jamais sur votre devis). Les primes moyennes affichées sont des ordres de
              grandeur basés sur une zone H2, un ménage standard et une surface médiane. Chaque
              dossier est calculé au cas par cas via la fiche officielle DGEC.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
