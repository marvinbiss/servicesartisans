import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ShieldCheck, Award, Star } from 'lucide-react'

import JsonLd from '@/components/JsonLd'
import { SITE_URL } from '@/lib/seo/config'
import { getLpCampaign, getAllLpCampaigns, type LpCampaign } from '@/lib/lp/campaigns'
import LpForm from './LpForm'

/**
 * Landing Pages Effy-style — Action #5 Ahrefs 2026-05-03.
 *
 * Routes destinées au paid traffic (Google Ads, Bing Ads, Meta) — `noindex`
 * absolu. Pattern Effy validé : `/lp/generique/aides/prime-cee` (507 KW achetées).
 *
 * Architecture :
 *   - Above-fold = H1 + sub + form direct (zéro scroll requis sur desktop)
 *   - 3 trust blocks de réassurance
 *   - Mention légale courte (YMYL)
 *   - Schema enrichi (FinancialProduct / GovernmentService / Service selon kind)
 *   - Source Pipedrive `lp_<campaign>` (mig 499) pour attribution multi-touch
 *
 * Pas de SEO organique — ne pas exposer dans sitemap.ts.
 */

export const dynamicParams = false
export const revalidate = 86400

export function generateStaticParams() {
  return getAllLpCampaigns().map((c) => ({ campaign: c.slug }))
}

interface PageProps {
  params: Promise<{ campaign: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { campaign: slug } = await params
  const campaign = getLpCampaign(slug)
  if (!campaign) return {}

  const url = `${SITE_URL}/lp/${campaign.slug}`
  return {
    title: campaign.h1,
    description: campaign.subheadline,
    // noindex absolu — paid traffic uniquement, jamais d'organique pour LP
    robots: { index: false, follow: false, nocache: true },
    alternates: { canonical: url },
    openGraph: {
      locale: 'fr_FR',
      title: campaign.h1,
      description: campaign.subheadline,
      url,
      siteName: 'ServicesArtisans',
      type: 'website',
    },
  }
}

function buildSchema(campaign: LpCampaign): Record<string, unknown> {
  if (campaign.kind === 'financial') {
    return {
      '@context': 'https://schema.org',
      '@type': 'FinancialProduct',
      name: campaign.h1,
      description: campaign.subheadline,
      provider: {
        '@type': 'Organization',
        name: 'ServicesArtisans',
        url: SITE_URL,
      },
      ...(campaign.maxAmountEur
        ? {
            feesAndCommissionsSpecification: `Aide financière jusqu'à ${campaign.maxAmountEur} € selon conditions Anah / délégataires CEE.`,
          }
        : {}),
    }
  }
  if (campaign.kind === 'government') {
    return {
      '@context': 'https://schema.org',
      '@type': 'GovernmentService',
      name: campaign.h1,
      description: campaign.subheadline,
      serviceType: 'Aide financière à la rénovation énergétique',
      provider: {
        '@type': 'GovernmentOrganization',
        name: "Agence nationale de l'habitat (Anah) + délégataires CEE",
        url: 'https://france-renov.gouv.fr',
      },
      areaServed: { '@type': 'Country', name: 'France' },
    }
  }
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: campaign.h1,
    description: campaign.subheadline,
    provider: {
      '@type': 'Organization',
      name: 'ServicesArtisans',
      url: SITE_URL,
    },
    areaServed: { '@type': 'Country', name: 'France' },
  }
}

export default async function LpPage({ params }: PageProps) {
  const { campaign: slug } = await params
  const campaign = getLpCampaign(slug)
  if (!campaign) notFound()

  return (
    <>
      <JsonLd data={[buildSchema(campaign)]} />

      <section className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-charcoal-900 text-white py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 rounded-full px-4 py-1.5 mb-5">
              <ShieldCheck className="w-4 h-4 text-emerald-300" aria-hidden="true" />
              <span className="text-sm font-medium text-emerald-100">
                Artisans RGE certifiés — données ADEME officielles
              </span>
            </div>
            <h1 className="font-heading text-3xl md:text-5xl font-extrabold leading-tight mb-5">
              {campaign.h1}
            </h1>
            <p className="text-lg text-emerald-50/90 leading-relaxed mb-6">
              {campaign.subheadline}
            </p>
            <div className="grid grid-cols-3 gap-4 mb-2">
              {campaign.trustBlocks.map((block) => (
                <div
                  key={block.label}
                  className="bg-emerald-700/40 border border-emerald-500/30 rounded-xl p-3"
                >
                  <div className="text-xl md:text-2xl font-extrabold text-white tabular-nums">
                    {block.value}
                  </div>
                  <div className="text-xs text-emerald-100/80 mt-1 leading-snug">{block.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:sticky lg:top-6">
            <LpForm
              campaignSlug={campaign.slug}
              serviceSlug={campaign.serviceSlug}
              ctaLabel={campaign.ctaLabel}
            />
          </div>
        </div>
      </section>

      <section className="bg-white py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <Award className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <div className="font-bold text-charcoal-900">100% RGE</div>
              <p className="text-sm text-charcoal-600 mt-1 leading-relaxed">
                Tous les artisans sont vérifiés depuis l&apos;annuaire France Rénov&apos; ADEME,
                avec qualification active au moment du devis.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck
              className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div>
              <div className="font-bold text-charcoal-900">SIRET vérifié</div>
              <p className="text-sm text-charcoal-600 mt-1 leading-relaxed">
                Croisement INSEE + assurance décennale en cours de validité. Aucun démarcheur, aucun
                intermédiaire opaque.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Star className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <div className="font-bold text-charcoal-900">Devis gratuit, sans engagement</div>
              <p className="text-sm text-charcoal-600 mt-1 leading-relaxed">
                Comparaison de plusieurs artisans dans votre département. Aucun frais, aucune
                obligation de signer.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-sand-50 border-t border-charcoal-100 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <p className="text-xs text-charcoal-600 leading-relaxed">{campaign.legalNote}</p>
        </div>
      </section>
    </>
  )
}
