import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'

const PUBLIC_ID_RE = /^EST-\d{4}-\d{2}-\d{2}-[a-z0-9]{6,12}$/

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
  if (n === null || n === undefined) return '—'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(n)
}

export default async function ResultatPage({ params }: PageParams) {
  const { publicId } = await params
  if (!PUBLIC_ID_RE.test(publicId)) notFound()

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('simulateur_estimations')
    .select(
      'public_id, barometre_version, categorie_anah, parcours, mpr_total, cee_fourchette_bas, cee_fourchette_haut, coup_pouce_estimation, reste_a_charge_bas, reste_a_charge_haut, ecretement_pct, created_at'
    )
    .eq('public_id', publicId)
    .maybeSingle()

  if (error || !data) notFound()

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <header className="mb-6">
          <p className="text-sm text-slate-500">
            Identifiant : <span className="font-mono text-slate-700">{data.public_id}</span>
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Votre estimation indicative
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Version barèmes : {data.barometre_version} — Catégorie ANAH :{' '}
            <strong className="capitalize">{data.categorie_anah}</strong> — Parcours :{' '}
            <strong>{data.parcours}</strong>
          </p>
        </header>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Aides estimées</h2>
          <dl className="space-y-3 text-slate-800">
            <div className="flex justify-between">
              <dt>MaPrimeRénov&apos;</dt>
              <dd className="font-semibold">{fmtEur(Number(data.mpr_total))}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Certificats CEE</dt>
              <dd className="font-semibold">
                {fmtEur(Number(data.cee_fourchette_bas))} –{' '}
                {fmtEur(Number(data.cee_fourchette_haut))}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt>Coup de Pouce</dt>
              <dd className="font-semibold">{fmtEur(Number(data.coup_pouce_estimation))}</dd>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-3 text-lg">
              <dt className="font-semibold">Reste à charge estimé</dt>
              <dd className="font-bold text-emerald-800">
                {fmtEur(Number(data.reste_a_charge_bas))} –{' '}
                {fmtEur(Number(data.reste_a_charge_haut))}
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-slate-500">
            Écrêtement appliqué : {Number(data.ecretement_pct).toLocaleString('fr-FR')} %.
            Estimation indicative non contractuelle.
          </p>
        </section>

        <section className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <h2 className="text-lg font-semibold text-emerald-900">Et maintenant ?</h2>
          <p className="mt-2 text-sm text-emerald-900">
            Un artisan RGE partenaire va vous recontacter pour un devis personnalisé et officiel.
          </p>
          <button
            type="button"
            className="mt-4 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            disabled
            aria-disabled="true"
          >
            Être rappelé (suivi en cours)
          </button>
        </section>
      </div>
    </main>
  )
}
