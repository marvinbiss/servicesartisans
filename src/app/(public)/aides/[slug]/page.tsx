import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ArrowRight, Calculator, Sparkles } from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import LastUpdated from '@/components/seo/LastUpdated'
import TldrBlock from '@/components/flagship/TldrBlock'
import AideMontants from '@/components/aides/AideMontants'
import AideEligibilite from '@/components/aides/AideEligibilite'
import AideDemarche from '@/components/aides/AideDemarche'
import AideFAQ from '@/components/aides/AideFAQ'
import RelatedAides from '@/components/aides/RelatedAides'
import AideSources from '@/components/aides/AideSources'
import { aidesSlugs, getAideBySlug, getCumulableAides, type Aide } from '@/lib/aides/aides-catalog'
import { authors } from '@/lib/data/authors'
import { SITE_URL, SITE_NAME, getAlternates, getOgDefaults } from '@/lib/seo/config'
import {
  getBreadcrumbSchema,
  getFAQSchema,
  getFinancialProductSchema,
  getGovernmentServiceSchema,
  getHowToSchema,
} from '@/lib/seo/jsonld'

export const dynamicParams = false
export const revalidate = 86400

const AUTHOR = authors['claire-dubois']

const CATEGORY_BADGE: Record<Aide['category'], string> = {
  'Subvention nationale': 'bg-emerald-500/20 border-emerald-400/30 text-emerald-100',
  'Prime privée': 'bg-amber-500/20 border-amber-400/30 text-amber-100',
  Prêt: 'bg-sky-500/20 border-sky-400/30 text-sky-100',
  'Avantage fiscal': 'bg-violet-500/20 border-violet-400/30 text-violet-100',
}

export function generateStaticParams() {
  return aidesSlugs.map((slug) => ({ slug }))
}

type PageProps = {
  params: Promise<{ slug: string }>
}

function truncate(s: string, max = 60): string {
  if (s.length <= max) return s
  return s.slice(0, max - 1).replace(/\s+\S*$/, '') + '…'
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const aide = getAideBySlug(slug)
  if (!aide) return {}

  const path = `/aides/${slug}`
  const title = truncate(`${aide.name} 2026 — barèmes et démarche officielle`)
  const description = truncate(
    `${aide.tagline}. Conditions, montants 2026, démarche officielle.`,
    160
  )

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    alternates: getAlternates(path),
    openGraph: {
      ...getOgDefaults(),
      locale: 'fr_FR',
      title,
      description,
      url: `${SITE_URL}${path}`,
      type: 'article',
    },
  }
}

export default async function AidePage({ params }: PageProps) {
  const { slug } = await params
  const aide = getAideBySlug(slug)
  if (!aide) notFound()

  const path = `/aides/${slug}`
  const url = `${SITE_URL}${path}`
  const cumulables = getCumulableAides(slug)

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Aides', url: '/aides' },
    { name: aide.name, url: path },
  ])

  const sameAs = aide.sources.map((s) => s.url)

  const mainSchema =
    aide.kind === 'GovernmentService'
      ? getGovernmentServiceSchema({
          name: aide.name,
          description: aide.schemaDescription,
          url,
          serviceType: 'Aide à la rénovation énergétique',
          audience: aide.eligibilite[0],
          temporalCoverage: aide.temporalCoverage,
          sameAs,
        })
      : getFinancialProductSchema({
          name: aide.name,
          description: aide.schemaDescription,
          url,
          // Code-reviewer P1.1 — distinguer Prêt (Loan), Prime privée (Rebate
          // CEE = obligation privée des fournisseurs d'énergie, pas État) et
          // fallback Government Grant. Émettre "Government Grant" pour des
          // CEE privés serait factuellement inexact côté Schema.org.
          category:
            aide.category === 'Prêt'
              ? 'Loan'
              : aide.category === 'Prime privée'
                ? 'Rebate'
                : 'Government Grant',
          feesAndCommissionsSpecification:
            "Aucun frais pour le bénéficiaire — aide versée par l'organisme financeur.",
        })

  const faqSchema = getFAQSchema(aide.faqs, {
    pageUrl: url,
    name: `FAQ — ${aide.name}`,
    includeSpeakable: true,
  })

  const howToSchema = getHowToSchema(aide.demarche, {
    name: `Obtenir ${aide.name} en 2026`,
    description: `Démarche officielle pour bénéficier de ${aide.name} en France en 2026.`,
    totalTime: 'P90D',
  })

  const jsonLdItems: Record<string, unknown>[] = [
    breadcrumbSchema as Record<string, unknown>,
    mainSchema as Record<string, unknown>,
  ]
  if (faqSchema) jsonLdItems.push(faqSchema as Record<string, unknown>)
  if (howToSchema) jsonLdItems.push(howToSchema as Record<string, unknown>)

  const tldrBullets = [
    `${aide.category} : ${aide.tagline.toLowerCase()}.`,
    `Plafond principal : ${aide.montants[0]?.max ?? 'voir détails'}.`,
    `Cumulable avec : ${
      cumulables
        .slice(0, 3)
        .map((c) => c.name)
        .join(', ') || 'aucune autre aide listée'
    }.`,
    `Vérifié le ${aide.lastReviewed} sur sources officielles France Rénov'.`,
  ]

  return (
    <>
      <JsonLd data={jsonLdItems} />

      <Breadcrumb
        items={[
          { label: 'Accueil', href: '/' },
          { label: 'Aides', href: '/aides' },
          { label: aide.name },
        ]}
      />

      <section className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-charcoal-900 text-white py-14 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div
            className={`inline-flex items-center gap-2 border rounded-full px-4 py-1.5 mb-5 ${CATEGORY_BADGE[aide.category]}`}
          >
            <Sparkles className="w-4 h-4" aria-hidden="true" />
            <span className="text-sm font-medium">{aide.category}</span>
          </div>
          <h1 className="font-heading text-3xl md:text-5xl font-extrabold leading-tight mb-4">
            {aide.name}
          </h1>
          <p className="text-base md:text-lg text-emerald-50/90 max-w-3xl leading-relaxed">
            {aide.tagline}
          </p>
          <LastUpdated
            label="Barèmes vérifiés le"
            date={aide.lastReviewed}
            className="mt-4 text-emerald-100/90"
          />
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/simulateur-aides-renovation"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-emerald-800 font-semibold shadow-lg hover:bg-emerald-50 transition"
            >
              <Calculator className="w-5 h-5" aria-hidden="true" />
              Simuler mes aides
            </Link>
            <Link
              href="/devis"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-emerald-300/60 text-white font-semibold hover:bg-emerald-600/30 transition"
            >
              Devis gratuit RGE
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-10 border-b border-charcoal-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <TldrBlock title={`${aide.name} en 4 points`} bullets={tldrBullets} />
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-base text-charcoal-700 leading-relaxed">{aide.description}</p>
        </div>
      </section>

      <AideMontants aideName={aide.name} montants={aide.montants} />

      <AideEligibilite eligibilite={aide.eligibilite} />

      <AideDemarche demarche={aide.demarche} />

      <AideFAQ aideName={aide.name} faqs={aide.faqs} />

      <RelatedAides title={`Aides cumulables avec ${aide.name}`} aides={cumulables} />

      <section
        className="bg-emerald-50/40 py-10 border-t border-emerald-100"
        aria-labelledby="rge-heading"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2
            id="rge-heading"
            className="font-heading text-xl md:text-2xl font-extrabold text-charcoal-900 mb-3"
          >
            Trouver un artisan RGE
          </h2>
          <p className="text-charcoal-700 leading-relaxed mb-4">
            La quasi-totalité des aides 2026 exige un artisan certifié RGE actif à la signature du
            devis. ServicesArtisans synchronise quotidiennement la base ADEME des artisans RGE
            (qualifications Qualibat, QualiPAC, QualiBois, Qualifelec).
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/rge"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
            >
              Annuaire artisans RGE
            </Link>
            <Link
              href="/devis"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-emerald-600 text-emerald-700 font-semibold hover:bg-emerald-50 transition"
            >
              Demander un devis
            </Link>
          </div>
        </div>
      </section>

      <AideSources
        sources={aide.sources}
        lastReviewed={aide.lastReviewed}
        author={AUTHOR ? { name: AUTHOR.name } : undefined}
      />
    </>
  )
}
