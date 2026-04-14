import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import ResultatActions from '@/components/simulateur/ResultatActions'

const PUBLIC_ID_RE = /^EST-\d{4}-\d{2}-\d{2}-[a-z0-9]{6,12}$/i

function normalizePublicId(raw: string): string {
  return raw.replace(/^est-/i, 'EST-')
}

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Votre estimation aides rénovation | ServicesArtisans',
  description: 'Retrouvez le détail de votre estimation d’aides à la rénovation énergétique.',
  robots: { index: false, follow: false },
}

interface PageParams {
  params: Promise<{ publicId: string }>
}

function fmtEur(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return '—'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(Number(n))
}

function midpoint(a: number | null | undefined, b: number | null | undefined): number {
  const na = typeof a === 'number' ? a : Number(a)
  const nb = typeof b === 'number' ? b : Number(b)
  const va = Number.isFinite(na) ? na : 0
  const vb = Number.isFinite(nb) ? nb : 0
  return Math.round((va + vb) / 2)
}

export default async function ResultatPage({ params }: PageParams) {
  const { publicId: rawPublicId } = await params
  if (!PUBLIC_ID_RE.test(rawPublicId)) notFound()

  const publicId = normalizePublicId(rawPublicId)
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('simulateur_estimations')
    .select(
      'public_id, barometre_version, categorie_anah, parcours, mpr_total, cee_fourchette_bas, cee_fourchette_haut, coup_pouce_estimation, reste_a_charge_bas, reste_a_charge_haut, ecretement_pct, budget_ht, telephone, code_postal, created_at'
    )
    .eq('public_id', publicId)
    .maybeSingle()

  if (error || !data) notFound()

  const budgetHt = Number(data.budget_ht) || 0
  const mprTotal = Number(data.mpr_total) || 0
  const ceeMid = midpoint(data.cee_fourchette_bas, data.cee_fourchette_haut)
  const cdpTotal = Number(data.coup_pouce_estimation) || 0
  const aidesMid = mprTotal + ceeMid + cdpTotal
  const resteBas = Number(data.reste_a_charge_bas) || 0
  const resteHaut = Number(data.reste_a_charge_haut) || 0
  const resteMid = midpoint(resteBas, resteHaut)

  const parcoursSlug = typeof data.parcours === 'string' ? data.parcours : null
  const codePostal = typeof data.code_postal === 'string' ? data.code_postal : null
  const telephonePrefill = typeof data.telephone === 'string' ? data.telephone : null

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
        <header className="mb-6">
          <p className="text-sm text-slate-500">
            Estimation <span className="font-mono text-slate-700">{data.public_id}</span>
          </p>
          <h1 className="mt-1 font-heading text-3xl md:text-4xl font-extrabold tracking-tight text-charcoal-900">
            Votre reste à charge estimé
          </h1>
          <p className="mt-2 text-sm text-charcoal-600">
            Barèmes {data.barometre_version} · Catégorie ANAH{' '}
            <strong className="capitalize">{data.categorie_anah}</strong> · Parcours{' '}
            <strong>{data.parcours}</strong>
          </p>
        </header>

        {/* HERO : équation reste à charge (framing IZI) */}
        <section className="rounded-2xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/60 p-6 md:p-8 shadow-sm">
          <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-center">
            <div className="text-center md:text-left">
              <p className="text-xs font-semibold uppercase tracking-wide text-charcoal-500">
                Budget travaux HT
              </p>
              <p className="mt-1 text-2xl md:text-3xl font-bold text-charcoal-900">
                {fmtEur(budgetHt)}
              </p>
            </div>
            <div
              className="hidden md:block text-3xl font-light text-charcoal-400"
              aria-hidden="true"
            >
              −
            </div>
            <div className="text-center md:text-left">
              <p className="text-xs font-semibold uppercase tracking-wide text-charcoal-500">
                Aides cumulées
              </p>
              <p className="mt-1 text-2xl md:text-3xl font-bold text-emerald-700">
                {fmtEur(aidesMid)}
              </p>
            </div>
            <div
              className="hidden md:block text-3xl font-light text-charcoal-400"
              aria-hidden="true"
            >
              =
            </div>
            <div className="text-center md:text-left">
              <p className="text-xs font-semibold uppercase tracking-wide text-charcoal-500">
                Reste à charge
              </p>
              <p className="mt-1 text-3xl md:text-4xl font-extrabold text-charcoal-900">
                {fmtEur(resteMid)}
              </p>
              <p className="mt-0.5 text-xs text-charcoal-500">
                Fourchette {fmtEur(resteBas)} – {fmtEur(resteHaut)}
              </p>
            </div>
          </div>
        </section>

        {/* Détail aides */}
        <section className="mt-5 rounded-xl border border-sand-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-charcoal-900">Détail des aides</h2>
          <dl className="space-y-3 text-charcoal-800">
            <div className="flex items-baseline justify-between">
              <dt>MaPrimeRénov&apos;</dt>
              <dd className="font-semibold">{fmtEur(mprTotal)}</dd>
            </div>
            <div className="flex items-baseline justify-between">
              <dt>Certificats CEE</dt>
              <dd className="font-semibold">
                {fmtEur(Number(data.cee_fourchette_bas))} –{' '}
                {fmtEur(Number(data.cee_fourchette_haut))}
              </dd>
            </div>
            <div className="flex items-baseline justify-between">
              <dt>Coup de Pouce</dt>
              <dd className="font-semibold">{fmtEur(cdpTotal)}</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-sand-200 pt-3 text-base">
              <dt className="font-semibold">Total aides estimées</dt>
              <dd className="font-bold text-emerald-700">{fmtEur(aidesMid)}</dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-charcoal-500">
            Écrêtement appliqué : {Number(data.ecretement_pct).toLocaleString('fr-FR')} %.
            Estimation indicative non contractuelle. Un artisan RGE confirmera les montants exacts
            dans son devis.
          </p>
        </section>

        {/* 2 paths action */}
        <ResultatActions
          publicId={data.public_id as string}
          telephonePrefill={telephonePrefill}
          parcoursSlug={parcoursSlug}
          codePostal={codePostal}
        />
      </div>
    </main>
  )
}
