import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ShieldCheck, BadgeCheck, Star } from 'lucide-react'

import JsonLd from '@/components/JsonLd'
import { SITE_URL } from '@/lib/seo/config'
import { getLpProCampaign, getAllLpProCampaigns, type LpProCampaign } from '@/lib/lp-pro/campaigns'
import LpProForm from './LpProForm'

/**
 * Landing Pages PRO — lead-gen hors-RGE (Meta/Google Ads).
 *
 * Routes destinées au paid traffic — `noindex` absolu. Contrairement aux LP
 * RGE (`/lp/*`), aucun angle aides : promesse = devis gratuit + artisans
 * vérifiés + réponse rapide. Schema `Service` simple.
 *
 * Architecture :
 *   - Above-fold = H1 + sub + form direct
 *   - 3 trust blocks de réassurance
 *   - Bandeau confiance (SIRET / devis gratuit / sans engagement)
 *   - Source Pipedrive `lppro_<campaign>` pour attribution
 *
 * Pas de SEO organique — jamais exposé dans sitemap.ts.
 */

export const dynamicParams = false
export const revalidate = 86400

export function generateStaticParams() {
  return getAllLpProCampaigns().map((c) => ({ campaign: c.slug }))
}

interface PageProps {
  params: Promise<{ campaign: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { campaign: slug } = await params
  const campaign = getLpProCampaign(slug)
  if (!campaign) return {}

  const url = `${SITE_URL}/lp-pro/${campaign.slug}`
  return {
    title: campaign.h1,
    description: campaign.subheadline,
    // noindex absolu — paid traffic uniquement
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

function buildSchema(campaign: LpProCampaign): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: campaign.h1,
    description: campaign.subheadline,
    serviceType: campaign.trade,
    provider: {
      '@type': 'Organization',
      name: 'ServicesArtisans',
      url: SITE_URL,
    },
    areaServed: { '@type': 'Country', name: 'France' },
  }
}

export default async function LpProPage({ params }: PageProps) {
  const { campaign: slug } = await params
  const campaign = getLpProCampaign(slug)
  if (!campaign) notFound()

  return (
    <>
      <JsonLd data={[buildSchema(campaign)]} />

      <section className="bg-gradient-to-br from-accent-700 via-accent-800 to-charcoal-900 text-white py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div>
            <div className="inline-flex items-center gap-2 bg-accent-500/20 border border-accent-400/30 rounded-full px-4 py-1.5 mb-5">
              <ShieldCheck className="w-4 h-4 text-accent-300" aria-hidden="true" />
              <span className="text-sm font-medium text-accent-100">
                Artisans vérifiés — SIRET &amp; assurance décennale contrôlés
              </span>
            </div>
            <h1 className="font-heading text-3xl md:text-5xl font-extrabold leading-tight mb-5">
              {campaign.h1}
            </h1>
            <p className="text-lg text-accent-50/90 leading-relaxed mb-6">{campaign.subheadline}</p>
            <div className="grid grid-cols-3 gap-4 mb-2">
              {campaign.trustBlocks.map((block) => (
                <div
                  key={block.label}
                  className="bg-accent-700/40 border border-accent-500/30 rounded-xl p-3"
                >
                  <div className="text-xl md:text-2xl font-extrabold text-white tabular-nums">
                    {block.value}
                  </div>
                  <div className="text-xs text-accent-100/80 mt-1 leading-snug">{block.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:sticky lg:top-6">
            <LpProForm
              campaignSlug={campaign.slug}
              serviceSlug={campaign.serviceSlug}
              trade={campaign.trade}
              ctaLabel={campaign.ctaLabel}
            />
          </div>
        </div>
      </section>

      <section className="bg-white py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <BadgeCheck
              className="w-6 h-6 text-accent-600 flex-shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div>
              <div className="font-bold text-charcoal-900">Artisans vérifiés</div>
              <p className="text-sm text-charcoal-600 mt-1 leading-relaxed">
                SIRET contrôlé via INSEE et assurance décennale en cours de validité. Aucun
                démarcheur, aucun intermédiaire opaque.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck
              className="w-6 h-6 text-accent-600 flex-shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div>
              <div className="font-bold text-charcoal-900">Devis gratuit</div>
              <p className="text-sm text-charcoal-600 mt-1 leading-relaxed">
                Comparaison de plusieurs artisans dans votre département. Réponse rapide, devis
                clair et détaillé.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Star className="w-6 h-6 text-accent-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <div className="font-bold text-charcoal-900">Sans engagement</div>
              <p className="text-sm text-charcoal-600 mt-1 leading-relaxed">
                Aucun frais, aucune obligation de signer. Vous choisissez l&apos;artisan qui vous
                convient.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
