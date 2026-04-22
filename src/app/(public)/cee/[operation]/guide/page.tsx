import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ShieldCheck, CheckCircle2, ArrowRight, ExternalLink } from 'lucide-react'

import CeeCTA from '@/components/cee/CeeCTA'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { SITE_URL, getAlternates } from '@/lib/seo/config'
import {
  getBreadcrumbSchema,
  getFinancialProductSchema,
  getGovernmentServiceSchema,
} from '@/lib/seo/jsonld'
import { getCeeOperationByCode } from '@/lib/cee/catalogue'
import { CEE_OPERATIONS_WITH_GUIDE, getCeeOperationGuide } from '@/lib/cee/operation-guides-content'
import { getRgeQualificationGuide } from '@/lib/rge/qualification-guides-content'
import { getCeeTopCitiesByOperation } from '@/lib/cee/listings'
import { ArticleMeta } from '@/components/ArticleMeta'

export const revalidate = 86400
export const dynamicParams = false

const VALID_OP = /^[A-Z]{2,3}-[A-Z]{2}-\d{3}$/i

export function generateStaticParams(): Array<{ operation: string }> {
  return CEE_OPERATIONS_WITH_GUIDE.map((operation) => ({ operation: operation.toLowerCase() }))
}

interface PageProps {
  params: Promise<{ operation: string }>
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text
  return text.slice(0, maxLen - 1).replace(/\s+\S*$/, '') + '…'
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { operation: rawOp } = await params
  const opCode = rawOp.toUpperCase()
  const urlCode = opCode.toLowerCase()
  if (!VALID_OP.test(opCode)) notFound()

  const guide = getCeeOperationGuide(opCode)
  if (!guide) notFound()
  const path = `/cee/${urlCode}/guide`

  return {
    title: truncate(guide.metaTitle, 60),
    description: truncate(guide.metaDescription, 158),
    robots: {
      index: true,
      follow: true,
      'max-snippet': -1 as const,
      'max-image-preview': 'large' as const,
      'max-video-preview': -1 as const,
    },
    openGraph: {
      title: guide.metaTitle,
      description: guide.metaDescription,
      type: 'article',
      locale: 'fr_FR',
      url: `${SITE_URL}${path}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: guide.metaTitle,
      description: guide.metaDescription,
    },
    alternates: getAlternates(path),
  }
}

export default async function CeeOperationGuidePage({ params }: PageProps) {
  const { operation: rawOp } = await params
  const opCode = rawOp.toUpperCase()
  const urlCode = opCode.toLowerCase()
  if (!VALID_OP.test(opCode)) notFound()

  const guide = getCeeOperationGuide(opCode)
  if (!guide) notFound()
  const operation = await getCeeOperationByCode(opCode)
  const topCities = await getCeeTopCitiesByOperation(opCode)
  const path = `/cee/${urlCode}/guide`

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Primes CEE', url: '/cee' },
    { name: operation?.nom ?? opCode, url: `/cee/${urlCode}` },
    { name: 'Guide', url: path },
  ])

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    image: `${SITE_URL}/opengraph-image`,
    headline: guide.h1,
    description: guide.metaDescription,
    url: `${SITE_URL}${path}`,
    mainEntityOfPage: `${SITE_URL}${path}`,
    inLanguage: 'fr-FR',
    datePublished: '2026-01-15',
    dateModified: new Date().toISOString().slice(0, 10),
    author: { '@type': 'Organization', name: 'ServicesArtisans', url: SITE_URL },
    publisher: { '@type': 'Organization', name: 'ServicesArtisans', url: SITE_URL },
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: guide.faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }

  const officialSources: string[] = [
    'https://www.ecologie.gouv.fr/politiques-publiques/certificats-deconomies-denergie',
    'https://france-renov.gouv.fr/aides/cee',
  ]
  if (operation?.url_fiche_officielle) officialSources.unshift(operation.url_fiche_officielle)

  const governmentServiceSchema = getGovernmentServiceSchema({
    name: `Prime CEE ${opCode}${operation ? ` — ${operation.nom}` : ''} : guide pas à pas`,
    description: `Guide complet du dépôt de dossier pour l'opération CEE ${opCode}. Étapes, pièces justificatives, délais et recours. Aide obligatoire versée par les vendeurs d'énergie (loi POPE 2005, période P6 2026-2030).`,
    url: `${SITE_URL}${path}`,
    serviceType: 'Aide financière à la rénovation énergétique',
    audience: 'Propriétaires et locataires de logements résidentiels',
    temporalCoverage: '2026-01-01/2030-12-31',
    sameAs: officialSources,
  })

  const financialProductSchema = getFinancialProductSchema({
    name: `Prime CEE ${opCode}`,
    description: operation
      ? `Montant variable selon la zone climatique, la surface ou la puissance installée, le profil de revenus et le cours du MWh cumac. ${operation.classique_eligible ? 'Tous ménages éligibles.' : ''}${operation.precarite_eligible ? ' Bonification précarité disponible.' : ''}`.trim()
      : `Prime CEE ${opCode} — montant variable selon les conditions officielles DGEC.`,
    url: `${SITE_URL}${path}`,
    category: 'Government Grant',
    feesAndCommissionsSpecification:
      "Prime versée par l'obligé ou le délégataire. Pas de frais à la charge du bénéficiaire. Cumulable avec MaPrimeRénov', TVA 5,5 % et éco-PTZ.",
  })

  return (
    <main className="min-h-screen bg-white">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={articleSchema} />
      <JsonLd data={governmentServiceSchema} />
      <JsonLd data={financialProductSchema} />
      <JsonLd data={faqSchema} />

      <Breadcrumb
        items={[
          { label: 'Primes CEE', href: '/cee' },
          { label: operation?.nom ?? opCode, href: `/cee/${urlCode}` },
          { label: 'Guide' },
        ]}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-charcoal-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 rounded-full px-4 py-1.5 mb-5">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span className="text-sm font-medium text-emerald-100">
              Guide officiel {guide.code}
            </span>
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-extrabold leading-tight mb-4">
            {guide.h1}
          </h1>
          <ArticleMeta
            author="ServicesArtisans"
            datePublished="2026-01-15"
            className="justify-center mt-4"
          />
          <p className="text-lg text-emerald-50/90 max-w-3xl leading-relaxed">{guide.lede}</p>
        </div>
      </section>

      {/* Résumé montants */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-5">
            <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">
              Prime CEE classique
            </div>
            <div className="text-xl font-bold text-charcoal-900">{guide.primeClassique}</div>
          </div>
          <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-5">
            <div className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">
              Ménage précaire
            </div>
            <div className="text-xl font-bold text-charcoal-900">{guide.primePrecarite}</div>
          </div>
          <div className="rounded-xl border border-primary-100 bg-primary-50/60 p-5">
            <div className="text-xs font-semibold text-primary-600 uppercase tracking-wide mb-1">
              MaPrimeRénov’
            </div>
            <div className="text-xl font-bold text-charcoal-900">{guide.maPrimeRenov}</div>
          </div>
        </div>

        {/* Sections éditoriales */}
        <article className="prose prose-emerald max-w-none prose-headings:font-heading prose-headings:font-extrabold prose-headings:text-charcoal-900 prose-p:text-charcoal-700 prose-p:leading-relaxed">
          {guide.sections.map((section, i) => (
            <section key={i} className="mb-10">
              <h2 className="text-2xl md:text-3xl mb-4">{section.heading}</h2>
              {section.paragraphs.map((para, j) => (
                <p key={j}>{para}</p>
              ))}
            </section>
          ))}
        </article>

        {/* CTA inline mid-content */}
        <div className="mt-10 mb-10">
          <CeeCTA variant="inline" operationCode={guide.code} />
        </div>

        {/* Qualifications RGE requises */}
        <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50/40 p-6">
          <h2 className="font-heading text-xl font-extrabold text-charcoal-900 mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-700" aria-hidden="true" />
            Qualifications RGE exigées
          </h2>
          <ul className="space-y-2">
            {guide.rgeRequises.map((qualif) => (
              <li key={qualif} className="flex items-start gap-2 text-charcoal-700">
                <CheckCircle2
                  className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <span className="font-semibold">{qualif}</span>
              </li>
            ))}
          </ul>
          {operation?.url_fiche_officielle && (
            <p className="mt-4 text-sm">
              <a
                href={operation.url_fiche_officielle}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold hover:text-emerald-900"
              >
                Consulter la fiche officielle DGEC {guide.code}
                <ExternalLink className="w-4 h-4" aria-hidden="true" />
              </a>
            </p>
          )}
        </div>

        {/* Maillage RGE — guides qualification requis pour cette opération */}
        {guide.requiredQualifications.length > 0 && (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/60 to-white p-6">
            <h2 className="font-heading text-xl font-extrabold text-charcoal-900 mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-700" aria-hidden="true" />
              Qualifications RGE requises — nos guides
            </h2>
            <p className="text-sm text-charcoal-600 mb-4">
              L’artisan qui réalise cette opération doit détenir l’une des qualifications RGE
              ci-dessous&nbsp;:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {guide.requiredQualifications.map((slug) => {
                const rgeGuide = getRgeQualificationGuide(slug)
                if (!rgeGuide) return null
                return (
                  <li key={slug}>
                    <Link
                      href={`/rge/qualifications/${slug}`}
                      className="group flex items-start justify-between gap-3 p-4 bg-white rounded-xl border border-emerald-100 hover:border-emerald-400 hover:shadow-sm transition"
                    >
                      <span className="flex-1">
                        <span className="block text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                          {rgeGuide.organisme}
                        </span>
                        <span className="block text-sm font-semibold text-charcoal-900 group-hover:text-emerald-800 transition">
                          {rgeGuide.name}
                        </span>
                      </span>
                      <ArrowRight
                        className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </section>

      {/* FAQ */}
      <section className="bg-sand-50 border-y border-charcoal-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-6">
            Questions fréquentes — {guide.code}
          </h2>
          <div className="space-y-3">
            {guide.faq.map((item, i) => (
              <details
                key={i}
                className="group rounded-lg border border-charcoal-200 bg-white p-5 open:border-emerald-300 open:shadow-sm"
              >
                <summary className="cursor-pointer list-none font-semibold text-charcoal-900 flex items-start justify-between gap-4">
                  <span>{item.question}</span>
                  <span className="text-emerald-600 group-open:rotate-45 transition-transform text-xl leading-none">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-charcoal-700 leading-relaxed">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Top villes */}
      {topCities.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-6">
            Trouver un artisan RGE pour cette opération
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {topCities.slice(0, 12).map((city) => (
              <Link
                key={city.slug}
                href={`/cee/${urlCode}/${city.slug}`}
                className="group flex items-center justify-between p-4 bg-white rounded-xl border border-charcoal-200 hover:border-emerald-400 hover:shadow-sm transition"
              >
                <span className="font-semibold text-charcoal-900 group-hover:text-emerald-700 transition truncate">
                  {city.name}
                </span>
                <span className="text-sm font-semibold text-charcoal-900 tabular-nums ml-2">
                  {city.count}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA inline bottom */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <CeeCTA variant="inline" operationCode={guide.code} />
      </div>

      {/* CTAs */}
      <section className="bg-gradient-to-br from-emerald-700 to-emerald-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold mb-3">
            Obtenez votre prime {guide.code}
          </h2>
          <p className="text-emerald-100 max-w-2xl mx-auto mb-6 leading-relaxed">
            Demandez un devis gratuit auprès d’un artisan RGE qualifié et sécurisez votre prime CEE
            dès la signature.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/devis"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-emerald-800 font-semibold shadow-lg hover:bg-emerald-50 transition"
            >
              Demander un devis gratuit
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              href={`/cee/${urlCode}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-emerald-300/60 text-white font-semibold hover:bg-emerald-600/30 transition"
            >
              Voir la fiche {guide.code}
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
