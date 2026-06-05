import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { signToken } from '@/lib/simulateur/rgpd/signed-token'
import ResultatActions from '@/components/simulateur/ResultatActions'
import MprBaremeChip, { isMprCategorie } from '@/components/renovation/MprBaremeChip'
import { BadgeCheck, Building2, Landmark, PiggyBank, Banknote, Home, Info } from 'lucide-react'

const PUBLIC_ID_RE = /^EST-\d{4}-\d{2}-\d{2}-[a-z0-9]{6,12}$/i

function normalizePublicId(raw: string): string {
  return raw.replace(/^est-/i, 'EST-')
}

// ISR : page resultat d'estimation reno. Le `publicId` est immutable (1 row
// `aides_estimations` -> 1 publicId). Resultat stable per-publicId.
// revalidate=86400 = cache CDN 24h, regenere en cas de mutation ulterieure
// (publicId reutilise apres reset improbable). robots noindex empeche
// indexation = pas de stale SERP.
export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Votre estimation aides rénovation',
  description: "Retrouvez le détail de votre estimation d'aides à la rénovation énergétique.",
  robots: { index: false, follow: false },
}

interface PageParams {
  params: Promise<{ publicId: string }>
}

function fmtEur(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return '\u2014'
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

function safeNum(v: unknown): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export default async function ResultatPage({ params }: PageParams) {
  const { publicId: rawPublicId } = await params
  if (!PUBLIC_ID_RE.test(rawPublicId)) notFound()

  const publicId = normalizePublicId(rawPublicId)
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('simulateur_estimations')
    .select(
      'public_id, barometre_version, categorie_anah, parcours, mpr_total, mpr_budget_plafonne, mpr_plafond_ht, cee_fourchette_bas, cee_fourchette_haut, cee_ampleur, coup_pouce_estimation, mar_prise_en_charge, reste_a_charge_bas, reste_a_charge_haut, total_aides_bas, total_aides_haut, ecretement_pct, budget_ht, code_postal, eco_ptz_eligible, eco_ptz_montant_max, eco_ptz_duree_max_ans, par_eligible, par_montant_max, complementaires, created_at'
    )
    .eq('public_id', publicId)
    .maybeSingle()

  if (error || !data) notFound()

  const budgetHt = safeNum(data.budget_ht)
  const mprTotal = safeNum(data.mpr_total)
  const ceeBas = safeNum(data.cee_fourchette_bas)
  const ceeHaut = safeNum(data.cee_fourchette_haut)
  // ceeMid volontairement non utilisé — le total inclut déjà les CEE
  const ceeAmpleur = safeNum(data.cee_ampleur)
  const cdpTotal = safeNum(data.coup_pouce_estimation)
  const marTotal = safeNum(data.mar_prise_en_charge)

  const parcours = typeof data.parcours === 'string' ? data.parcours : 'geste'
  const isAccompagne = parcours === 'accompagne'

  // Total aides : utiliser les colonnes si dispo, sinon recalculer
  const totalBas = safeNum(data.total_aides_bas) || mprTotal + ceeBas + cdpTotal + marTotal
  const totalHaut = safeNum(data.total_aides_haut) || mprTotal + ceeHaut + cdpTotal + marTotal
  const aidesMid = midpoint(totalBas, totalHaut)

  const resteBas = safeNum(data.reste_a_charge_bas)
  const resteHaut = safeNum(data.reste_a_charge_haut)
  const resteMid = midpoint(resteBas, resteHaut)

  // Prets
  const ecoPtzEligible = data.eco_ptz_eligible === true
  const ecoPtzMax = safeNum(data.eco_ptz_montant_max)
  const ecoPtzDuree = safeNum(data.eco_ptz_duree_max_ans)
  const parEligible = data.par_eligible === true
  const parMax = safeNum(data.par_montant_max)

  const codePostal = typeof data.code_postal === 'string' ? data.code_postal : null
  const parcoursSlug = typeof data.parcours === 'string' ? data.parcours : null
  const callbackToken = signToken(data.public_id as string, 900)

  // Complementaires
  const comp = (data.complementaires ?? {}) as Record<string, unknown>
  const mprCopro = comp.mprCopro as { totalEstime?: number } | undefined
  const denormandie = comp.denormandie as
    | { reductionImpotAnnuelle?: number; duree?: number }
    | undefined
  const taxeFonciere = comp.taxeFonciere as
    | { exonerationEstimeeAnnuelle?: number; dureeAns?: number }
    | undefined

  return (
    <main className="min-h-screen bg-charcoal-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
        <header className="mb-6">
          <p className="text-sm text-charcoal-500">
            Estimation <span className="font-mono text-charcoal-700">{data.public_id}</span>
          </p>
          <h1
            data-speakable="true"
            className="mt-1 font-heading text-3xl md:text-4xl font-extrabold tracking-tight text-charcoal-900"
          >
            Votre estimation d&apos;aides
          </h1>
          <p className="mt-2 text-sm text-charcoal-600">
            Barèmes {data.barometre_version} &middot; Catégorie ANAH{' '}
            {isMprCategorie(data.categorie_anah) ? (
              <MprBaremeChip categorie={data.categorie_anah} />
            ) : (
              <strong className="capitalize">{data.categorie_anah}</strong>
            )}{' '}
            &middot; Parcours <strong>{isAccompagne ? "Rénovation d'ampleur" : 'Par geste'}</strong>
          </p>
        </header>

        {/* HERO : equation reste a charge */}
        <section className="rounded-2xl border-2 border-accent-300 bg-gradient-to-br from-accent-50 via-white to-accent-50/60 p-6 md:p-8 shadow-sm">
          <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-center">
            <div className="text-center md:text-left">
              <p className="text-xs font-semibold uppercase tracking-wide text-charcoal-500">
                Budget travaux HT (estimé)
              </p>
              <p className="mt-1 text-2xl md:text-3xl font-bold text-charcoal-900">
                {fmtEur(budgetHt)}
              </p>
            </div>
            <div
              className="hidden md:block text-3xl font-light text-charcoal-400"
              aria-hidden="true"
            >
              &minus;
            </div>
            <div className="text-center md:text-left">
              <p className="text-xs font-semibold uppercase tracking-wide text-charcoal-500">
                Aides cumulées
              </p>
              <p className="mt-1 text-2xl md:text-3xl font-bold text-accent-700">
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
                Fourchette {fmtEur(resteBas)} &ndash; {fmtEur(resteHaut)}
              </p>
            </div>
          </div>
        </section>

        {/* Detail aides directes */}
        <section className="mt-5 rounded-xl border border-sand-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-charcoal-900">
            <BadgeCheck className="w-5 h-5 text-accent-600" aria-hidden="true" />
            Subventions directes
          </h2>
          <dl className="space-y-3 text-charcoal-800">
            <div className="flex items-baseline justify-between">
              <dt className="flex items-center gap-1.5">
                <span>MaPrimeRenov&apos;</span>
                {isAccompagne && data.mpr_budget_plafonne != null && (
                  <span className="text-xs text-charcoal-500">
                    (budget plafonne {fmtEur(safeNum(data.mpr_budget_plafonne))})
                  </span>
                )}
              </dt>
              <dd className="font-semibold">{fmtEur(mprTotal)}</dd>
            </div>
            <div className="flex items-baseline justify-between">
              <dt>{isAccompagne ? "CEE rénovation d'ampleur" : 'Certificats CEE'}</dt>
              <dd className="font-semibold">
                {isAccompagne ? fmtEur(ceeAmpleur) : `${fmtEur(ceeBas)} \u2013 ${fmtEur(ceeHaut)}`}
              </dd>
            </div>
            <div className="flex items-baseline justify-between">
              <dt>Coup de Pouce</dt>
              <dd className="font-semibold">{fmtEur(cdpTotal)}</dd>
            </div>
            {marTotal > 0 && (
              <div className="flex items-baseline justify-between">
                <dt>Prise en charge Mon Accompagnateur Rénov&apos;</dt>
                <dd className="font-semibold">{fmtEur(marTotal)}</dd>
              </div>
            )}
            <div className="flex items-baseline justify-between border-t border-sand-200 pt-3 text-base">
              <dt className="font-semibold">Total aides directes</dt>
              <dd className="font-bold text-accent-700">{fmtEur(aidesMid)}</dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-charcoal-500">
            Écrêtement appliqué : {Number(data.ecretement_pct).toLocaleString('fr-FR')} %.
            Estimation indicative non contractuelle.
          </p>
        </section>

        {/* Prets a taux zero */}
        {(ecoPtzEligible || parEligible) && (
          <section className="mt-5 rounded-xl border border-sand-300 bg-sand-100/40 p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-charcoal-900">
              <Banknote className="w-5 h-5 text-charcoal-600" aria-hidden="true" />
              Prêts à taux zéro
            </h2>
            <p className="text-sm text-charcoal-600 mb-3">
              En complément des aides, vous pouvez financer le reste à charge avec un prêt à taux
              zéro.
            </p>
            <dl className="space-y-3 text-charcoal-800">
              {ecoPtzEligible && (
                <div className="flex items-baseline justify-between">
                  <dt className="flex-1">
                    <span className="font-medium">Éco-PTZ</span>
                    <span className="ml-2 text-xs text-charcoal-500">
                      (remboursement sur {ecoPtzDuree} ans max)
                    </span>
                  </dt>
                  <dd className="font-semibold text-charcoal-700">
                    jusqu&apos;à {fmtEur(ecoPtzMax)}
                  </dd>
                </div>
              )}
              {parEligible && (
                <div className="flex items-baseline justify-between">
                  <dt className="flex-1">
                    <span className="font-medium">Prêt Avance Rénovation (PAR+)</span>
                    <span className="ml-2 text-xs text-charcoal-500">
                      (remboursé à la vente/succession)
                    </span>
                  </dt>
                  <dd className="font-semibold text-charcoal-700">jusqu&apos;à {fmtEur(parMax)}</dd>
                </div>
              )}
            </dl>
            <p className="mt-3 flex items-start gap-1.5 text-xs text-charcoal-500">
              <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" aria-hidden="true" />
              Pas de conditions de revenus pour l&apos;éco-PTZ. Le PAR+ est réservé aux ménages
              modestes (bleu/jaune).
            </p>
          </section>
        )}

        {/* Aides complementaires */}
        {(mprCopro || denormandie || taxeFonciere) && (
          <section className="mt-5 rounded-xl border border-amber-200 bg-amber-50/40 p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-charcoal-900">
              <Landmark className="w-5 h-5 text-amber-600" aria-hidden="true" />
              Aides complémentaires possibles
            </h2>
            <dl className="space-y-3 text-charcoal-800">
              {mprCopro && safeNum(mprCopro.totalEstime) > 0 && (
                <div className="flex items-baseline justify-between">
                  <dt>
                    <Building2 className="w-4 h-4 inline mr-1" aria-hidden="true" />
                    MaPrimeRénov&apos; Copropriété
                  </dt>
                  <dd className="font-semibold">{fmtEur(safeNum(mprCopro.totalEstime))}</dd>
                </div>
              )}
              {denormandie && safeNum(denormandie.reductionImpotAnnuelle) > 0 && (
                <div className="flex items-baseline justify-between">
                  <dt>
                    <Home className="w-4 h-4 inline mr-1" aria-hidden="true" />
                    Denormandie (réduction d&apos;impôt)
                    <span className="ml-1 text-xs text-charcoal-500">
                      ({denormandie.duree} ans)
                    </span>
                  </dt>
                  <dd className="font-semibold">
                    {fmtEur(safeNum(denormandie.reductionImpotAnnuelle))}/an
                  </dd>
                </div>
              )}
              {taxeFonciere && safeNum(taxeFonciere.exonerationEstimeeAnnuelle) > 0 && (
                <div className="flex items-baseline justify-between">
                  <dt>
                    <PiggyBank className="w-4 h-4 inline mr-1" aria-hidden="true" />
                    Exonération taxe foncière
                    <span className="ml-1 text-xs text-charcoal-500">
                      ({taxeFonciere.dureeAns} ans)
                    </span>
                  </dt>
                  <dd className="font-semibold">
                    {fmtEur(safeNum(taxeFonciere.exonerationEstimeeAnnuelle))}/an
                  </dd>
                </div>
              )}
            </dl>
            <p className="mt-3 text-xs text-charcoal-500">
              Sous réserve d&apos;éligibilité (zone Denormandie, délibération communale, etc.). Un
              conseiller peut vous aider à vérifier.
            </p>
          </section>
        )}

        {/* Prochaine etape : pont vers artisans RGE */}
        <section className="mt-5 rounded-xl border-2 border-accent-200 bg-gradient-to-r from-accent-50 to-white p-5 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold text-charcoal-900">
            Prochaine étape : confirmez vos aides avec un devis RGE
          </h2>
          <p className="text-sm text-charcoal-600 mb-4">
            Pour débloquer vos aides, vous avez besoin d&apos;un devis d&apos;un artisan RGE
            certifié. Nous vous mettons en relation avec un artisan RGE certifié (Qualibat,
            Qualifelec, QualiPAC, Qualit&apos;EnR) près de chez vous.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={`/devis/renovation-energetique${
                codePostal
                  ? `?cp=${codePostal}&source=simulateur&publicId=${publicId}&parcours=${parcoursSlug ?? ''}`
                  : `?source=simulateur&publicId=${publicId}&parcours=${parcoursSlug ?? ''}`
              }`}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-accent-600 text-white font-semibold shadow-md hover:bg-accent-700 transition text-center"
            >
              Trouver un artisan RGE
            </Link>
            {codePostal && (
              <Link
                href={`/services/renovation-energetique/${codePostal.slice(0, 2)}`}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border-2 border-accent-600 text-accent-700 font-semibold hover:bg-accent-50 transition text-center"
              >
                Voir les artisans dans mon département
              </Link>
            )}
          </div>
        </section>

        {/* CTA callback + devis (ancien composant enrichi) */}
        <ResultatActions
          publicId={data.public_id as string}
          callbackToken={callbackToken}
          parcoursSlug={parcoursSlug}
          codePostal={codePostal}
        />

        {/* Disclaimer */}
        <p className="mt-6 text-xs text-charcoal-400 text-center max-w-2xl mx-auto">
          Estimation indicative non contractuelle basée sur les barèmes en vigueur. Le montant final
          dépend du devis RGE, de votre avis d&apos;imposition et des conditions spécifiques de
          votre projet. Les prêts (éco-PTZ, PAR+) sont soumis à accord bancaire.
        </p>
      </div>
    </main>
  )
}
