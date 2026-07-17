import { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { SITE_URL, getAlternates } from '@/lib/seo/config'
import DevisForm from '@/components/DevisForm'
import DevisSidebar from '@/components/conversion/DevisSidebar'
import { getPageContent } from '@/lib/cms'
import { CmsContent } from '@/components/CmsContent'
import EnBrefBox from '@/components/seo/EnBrefBox'
import TldrBlock from '@/components/flagship/TldrBlock'
import { ArticleMeta } from '@/components/ArticleMeta'
import { PageHeroH1 } from '@/components/ui/PageHeroH1'
import { monthlyAnchorIso } from '@/lib/seo/sprint-helpers'
import { tradeContent } from '@/lib/data/trade-content'
import { villes } from '@/lib/data/france'
import { getPublishedDate } from '@/lib/seo/published-dates'

export const revalidate = 86400

const PUBLISHED_DATE = getPublishedDate('/devis')

export const metadata: Metadata = {
  title: 'Devis Artisan Gratuit 2026 — 3 Offres 24h',
  description:
    'Demandez un devis artisan gratuit 2026 : plombier, chauffagiste, pompe à chaleur et 21 métiers RGE. Réponse sous 24h, 3 offres, 100% gratuit, sans engagement.',
  alternates: getAlternates('/devis'),
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
  },
  openGraph: {
    title: 'Devis Artisan RGE Gratuit 2026 — Réponse 24h · 3 Offres',
    description:
      'Demandez un devis artisan RGE certifié gratuit. Qualibat, Qualifelec, QualiPAC. 100% gratuit, sans engagement.',
    url: `${SITE_URL}/devis`,
    type: 'website',
    images: [
      {
        url: `${SITE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'ServicesArtisans — Devis artisan RGE gratuit',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Devis Artisan RGE Gratuit 2026 — Réponse 24h · 3 Offres',
    description:
      'Demandez un devis artisan RGE certifié gratuit. Qualibat, Qualifelec, QualiPAC. 100% gratuit, sans engagement.',
    images: [`${SITE_URL}/opengraph-image`],
  },
}

const faqItems = [
  {
    question: 'Le service est-il vraiment gratuit ?',
    answer:
      'Oui, la demande de devis est 100 % gratuite et sans aucun engagement. Vous ne payez rien pour recevoir les propositions des artisans.',
  },
  {
    question: 'Combien de devis vais-je recevoir ?',
    answer:
      "Vous recevez des devis personnalisés d'artisans disponibles dans votre zone géographique. Le nombre dépend de la disponibilité locale.",
  },
  {
    question: 'En combien de temps suis-je contacté ?',
    answer:
      "Un conseiller vous rappelle rapidement après l'envoi de votre demande. En cas d'urgence, précisez-le dans le formulaire pour accélérer le traitement.",
  },
  {
    question: 'Comment les artisans sont-ils sélectionnés ?',
    answer:
      "ServicesArtisans est le 1er annuaire 100% artisans RGE certifiés. Chaque artisan affiché est certifié RGE (Qualibat, Qualifelec, QualiPAC ou Qualit'EnR) — qualifications synchronisées hebdomadairement avec la base officielle ADEME france-renov.gouv.fr — et son SIRET est vérifié auprès de l'INSEE.",
  },
  {
    question: "Suis-je obligé d'accepter un devis ?",
    answer:
      "Non, vous êtes entièrement libre. Comparez les devis reçus à votre rythme et choisissez celui qui correspond le mieux à vos attentes et à votre budget. Aucune obligation d'accepter.",
  },
  {
    question: 'Quelles données personnelles sont partagées ?',
    answer:
      'Seuls votre nom, numéro de téléphone et la description de votre projet sont transmis aux artisans sélectionnés. Votre adresse e-mail reste confidentielle et vos données ne sont jamais revendues à des tiers.',
  },
]

interface DevisPageProps {
  searchParams: Promise<{
    service?: string | string[]
    operation?: string | string[]
    ville?: string | string[]
  }>
}

export default async function DevisPage(props: DevisPageProps) {
  const searchParams = await props.searchParams
  const cmsPage = await getPageContent('devis', 'static')

  // Query params : pré-remplissage depuis un CTA contextualisé (ex: fiche
  // artisan RGE). Tolérant aux string[] (Next.js peut envoyer un tableau).
  // 2026-05-07 — ajout `ville` (envoyé par GeoPageCTA, TarifsDevisCTA,
  // VilleHeroCTA pour pré-remplir la ville du formulaire).
  const rawService = Array.isArray(searchParams?.service)
    ? searchParams?.service[0]
    : searchParams?.service
  const rawOperation = Array.isArray(searchParams?.operation)
    ? searchParams?.operation[0]
    : searchParams?.operation
  const rawVille = Array.isArray(searchParams?.ville) ? searchParams?.ville[0] : searchParams?.ville
  const prefilledService = rawService?.trim() || undefined
  const prefilledOperation = rawOperation?.trim() || undefined
  const prefilledCity = rawVille?.trim() || undefined

  if (cmsPage?.content_html) {
    return (
      <div className="min-h-screen bg-sand-50">
        <section className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <PageHeroH1 size="article">{cmsPage.title}</PageHeroH1>
          </div>
        </section>
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-xl shadow-sm p-8">
              <CmsContent html={cmsPage.content_html} />
            </div>
          </div>
        </section>
      </div>
    )
  }

  const dateModifiedIso = monthlyAnchorIso()
  const tradeCount = Object.keys(tradeContent).length
  const villesCount = villes.length
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `Devis Artisan Gratuit — ${tradeCount}+ Métiers, ${new Date().getFullYear()}`,
    description: `Demandez un devis artisan gratuit : ${tradeCount}+ métiers couverts, ${villesCount}+ villes, jusqu'à 3 propositions sous 24 h, sans engagement.`,
    url: `${SITE_URL}/devis`,
    datePublished: PUBLISHED_DATE,
    dateModified: dateModifiedIso,
    inLanguage: 'fr-FR',
    isAccessibleForFree: true,
    image: `${SITE_URL}/opengraph-image`,
    author: {
      '@type': 'Organization',
      name: 'Équipe éditoriale ServicesArtisans',
      url: `${SITE_URL}/a-propos`,
      '@id': `${SITE_URL}#organization`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'ServicesArtisans',
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/devis` },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable="true"]'],
    },
  }

  const enBrefPoints = [
    `${tradeCount}+ métiers RGE couverts (rénovation énergétique)`,
    `${villesCount}+ villes — réponse sous 24 h`,
    `Jusqu'à 3 devis par demande, 100 % gratuit`,
    `Artisans RGE certifiés (Qualibat, Qualifelec, QualiPAC), sans engagement`,
  ]

  const tldrBullets = [
    `Service de mise en relation gratuit : vous remplissez le formulaire (3 min) → 3 artisans RGE certifiés vous recontactent sous 24 h.`,
    `${tradeCount}+ métiers RGE couverts dans ${villesCount}+ communes françaises (éligibilité MaPrimeRénov' & CEE).`,
    `Vous comparez les devis librement, sans abonnement, sans obligation d'accepter.`,
    `Données partagées avec les artisans : nom, téléphone, description du projet — pas l'e-mail. Aucune revente à des tiers.`,
  ]

  return (
    <div className="min-h-screen bg-sand-50">
      <JsonLd
        data={[
          articleSchema,
          getBreadcrumbSchema([
            { name: 'Accueil', url: '/' },
            { name: 'Demander un devis', url: '/devis' },
          ]),
          getFAQSchema(faqItems.map((item) => ({ question: item.question, answer: item.answer }))),
        ]}
      />

      {/* ─── HERO MINIMAL (Wise/Lemonade pattern) ────────── */}
      <section className="bg-white border-b border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8">
          <Breadcrumb items={[{ label: 'Demander un devis' }]} className="mb-4 text-charcoal-400" />
          <h1
            data-speakable="true"
            className="font-heading text-3xl font-bold text-charcoal-900 tracking-tight"
          >
            Recevez vos devis gratuits
          </h1>
          <p className="text-charcoal-500 mt-2 max-w-xl">
            Devis gratuit d'artisans RGE certifiés (Qualibat, Qualifelec, QualiPAC) — sans
            engagement
          </p>
          <p className="text-charcoal-500 mt-2 text-sm">
            Source&nbsp;: registre RGE ADEME · data.gouv.fr — SIRET vérifiés INSEE
          </p>
          <ArticleMeta
            author="Équipe éditoriale ServicesArtisans"
            authorHref="/a-propos"
            datePublished={PUBLISHED_DATE}
            dateModified={dateModifiedIso}
            className="mt-4"
          />
        </div>
      </section>

      {/* En bref + TL;DR — capture FS Position 0 / AI Overviews */}
      <section className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <EnBrefBox keyPoints={enBrefPoints} />
          <TldrBlock bullets={tldrBullets} />
        </div>
      </section>

      {/* ─── SPLIT LAYOUT: Form (60%) + Sidebar (40%) ────── */}
      <section className="py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
            {/* LEFT: Formulaire DevisForm */}
            <div id="formulaire">
              <DevisForm
                prefilledService={prefilledService}
                prefilledOperation={prefilledOperation}
                prefilledCity={prefilledCity}
              />
            </div>

            {/* RIGHT: Sidebar de réassurance (desktop sticky, mobile below) */}
            <div className="hidden lg:block lg:sticky lg:top-20">
              <DevisSidebar />
            </div>
          </div>

          {/* Mobile: réassurance sous le formulaire */}
          <div className="lg:hidden mt-8">
            <details className="group">
              <summary className="flex items-center justify-center gap-2 cursor-pointer py-3 px-6 bg-white rounded-xl border border-sand-200 shadow-soft text-sm font-semibold text-charcoal-700 [&::-webkit-details-marker]:hidden">
                <span>Pourquoi nous faire confiance ?</span>
                <ChevronRight className="w-4 h-4 text-charcoal-400 group-open:rotate-90 transition-transform duration-200" />
              </summary>
              <div className="mt-4">
                <DevisSidebar />
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* ─── DEVIS PAR MÉTIER ─────────────────────────────── */}
      <section className="py-16 bg-white border-t border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-charcoal-900 mb-3 tracking-tight">
              Devis par métier
            </h2>
            <p className="text-charcoal-500 max-w-lg mx-auto">
              Sélectionnez un métier pour obtenir un devis adapté à votre projet.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Object.entries(tradeContent).map(([slug, trade]) => (
              <Link
                key={slug}
                href={`/devis/${slug}`}
                className="bg-sand-50 hover:bg-primary-50 border border-sand-300 hover:border-primary-300 rounded-xl p-3 transition-all group text-center hover:shadow-card-hover"
              >
                <div className="font-medium text-charcoal-900 group-hover:text-primary-500 transition-colors text-sm">
                  {trade.name}
                </div>
                <div className="text-xs text-charcoal-400 mt-1">
                  {trade.priceRange.min}–{trade.priceRange.max} {trade.priceRange.unit}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ COMPLÈTE ─────────────────────────────────── */}
      <section className="py-16 bg-sand-50">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-charcoal-900 mb-3 tracking-tight">
              Questions fréquentes
            </h2>
            <p className="text-charcoal-500 max-w-lg mx-auto">
              Tout ce que vous devez savoir avant de demander votre devis gratuit.
            </p>
          </div>

          <div className="space-y-4">
            {faqItems.map((item) => (
              <details
                key={item.question}
                className="group bg-white rounded-xl border border-sand-300 overflow-hidden"
              >
                <summary className="flex items-center justify-between cursor-pointer px-6 py-5 text-left hover:bg-sand-50 transition-colors [&::-webkit-details-marker]:hidden">
                  <span className="font-semibold text-charcoal-900 pr-4">{item.question}</span>
                  <ChevronRight className="w-5 h-5 text-charcoal-400 shrink-0 group-open:rotate-90 transition-transform duration-200" />
                </summary>
                <div className="px-6 pb-5 text-charcoal-500 leading-relaxed text-sm">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
