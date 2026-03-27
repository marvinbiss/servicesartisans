import { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { SITE_URL } from '@/lib/seo/config'
import DevisForm from '@/components/DevisForm'
import DevisSidebar from '@/components/conversion/DevisSidebar'
import { getPageContent } from '@/lib/cms'
import { CmsContent } from '@/components/CmsContent'
import { tradeContent } from '@/lib/data/trade-content'
import { villes, services } from '@/lib/data/france'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Devis Artisan Gratuit — Comparez les Offres',
  description:
    "Demandez un devis artisan gratuit : plombier, électricien, serrurier et 50 métiers. Jusqu'à 3 devis en 24h. 100% gratuit, sans engagement.",
  alternates: {
    canonical: `${SITE_URL}/devis`,
  },
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
  },
  openGraph: {
    title: 'Devis Artisan Gratuit — Comparez les Offres',
    description: "Demandez un devis artisan gratuit. Jusqu'à 3 devis d'artisans vérifiés en 24h. 100% gratuit, sans engagement.",
    url: `${SITE_URL}/devis`,
    type: 'website',
    images: [{ url: `${SITE_URL}/opengraph-image`, width: 1200, height: 630, alt: 'ServicesArtisans — Devis gratuit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Devis Artisan Gratuit — Comparez les Offres',
    description: "Demandez un devis artisan gratuit. Jusqu'à 3 devis d'artisans vérifiés en 24h.",
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
      'Vous pouvez recevoir jusqu\'à 3 devis d\'artisans différents, selon la disponibilité dans votre zone géographique. Chaque devis est personnalisé en fonction de votre projet.',
  },
  {
    question: 'En combien de temps suis-je contacté ?',
    answer:
      'Les artisans disponibles vous contactent généralement sous 24 à 48 h après l\'envoi de votre demande. En cas d\'urgence, précisez-le dans le formulaire pour accélérer le traitement.',
  },
  {
    question: 'Comment les artisans sont-ils référencés ?',
    answer:
      'Tous les artisans référencés sur ServicesArtisans sont immatriculés au registre SIREN. Nous contrôlons leur numéro d\'entreprise et leur activité déclarée auprès des données officielles de l\'INSEE.',
  },
  {
    question: 'Suis-je obligé d\'accepter un devis ?',
    answer:
      'Non, vous êtes entièrement libre. Comparez les devis reçus à votre rythme et choisissez celui qui correspond le mieux à vos attentes et à votre budget. Aucune obligation d\'accepter.',
  },
  {
    question: 'Quelles données personnelles sont partagées ?',
    answer:
      'Seuls votre nom, numéro de téléphone et la description de votre projet sont transmis aux artisans sélectionnés. Votre adresse e-mail reste confidentielle et vos données ne sont jamais revendues à des tiers.',
  },
]

export default async function DevisPage() {
  const cmsPage = await getPageContent('devis', 'static')

  if (cmsPage?.content_html) {
    return (
      <div className="min-h-screen bg-sand-50">
        <section className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="font-heading text-3xl font-bold text-charcoal-900">
              {cmsPage.title}
            </h1>
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

  return (
    <div className="min-h-screen bg-sand-50">
      <JsonLd
        data={[
          getBreadcrumbSchema([
            { name: 'Accueil', url: '/' },
            { name: 'Demander un devis', url: '/devis' },
          ]),
          getFAQSchema(faqItems.map(item => ({ question: item.question, answer: item.answer }))),
        ]}
      />

      {/* ─── HERO MINIMAL (Wise/Lemonade pattern) ────────── */}
      <section className="bg-white border-b border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8">
          <Breadcrumb
            items={[{ label: 'Demander un devis' }]}
            className="mb-4 text-charcoal-400"
          />
          <h1 className="font-heading text-3xl font-bold text-charcoal-900 tracking-tight">
            Recevez vos devis gratuits
          </h1>
          <p className="text-charcoal-500 mt-2 max-w-xl">
            Comparez 3 devis d'artisans vérifiés SIREN — gratuit, sans engagement, réponse sous 24h
          </p>
          <p className="text-charcoal-500 mt-2 text-sm font-medium">
            ★ 4.8/5 — Plus de 23 000 demandes traitées
          </p>
        </div>
      </section>

      {/* ─── SPLIT LAYOUT: Form (60%) + Sidebar (40%) ────── */}
      <section className="py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
            {/* LEFT: Formulaire DevisForm */}
            <div id="formulaire">
              <DevisForm />
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

      {/* ─── DEVIS PAR VILLE ──────────────────────────────── */}
      <section className="py-12 bg-white border-t border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-6">
            Devis artisan par ville
          </h2>
          <div className="flex flex-wrap gap-2">
            {villes.slice(0, 20).map((ville) => (
              <Link
                key={ville.slug}
                href={`/devis/plombier/${ville.slug}`}
                className="inline-flex items-center gap-1.5 bg-sand-100 hover:bg-primary-50 border border-sand-300 hover:border-primary-300 rounded-lg px-3 py-2 text-sm text-charcoal-700 hover:text-primary-600 transition-colors"
              >
                {ville.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── DEVIS PAR SERVICE ET VILLE (MATRICE) ─────────── */}
      <section className="py-12 border-t border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-8">
            Devis par métier et ville
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.slice(0, 8).map((service) => (
              <div key={service.slug}>
                <h3 className="font-heading font-semibold text-charcoal-900 mb-3">
                  Devis {service.name.toLowerCase()}
                </h3>
                <div className="space-y-1.5">
                  {villes.slice(0, 6).map((ville) => (
                    <Link
                      key={ville.slug}
                      href={`/devis/${service.slug}/${ville.slug}`}
                      className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-primary-500 py-1 transition-colors"
                    >
                      <ChevronRight className="w-3 h-3" />
                      {ville.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── VOIR AUSSI (CROSS-INTENT) ────────────────────── */}
      <section className="py-12 bg-sand-50 border-t border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-xl font-bold text-charcoal-900 mb-6">Voir aussi</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-charcoal-900 uppercase tracking-wider mb-3">Avis artisans</h3>
              <div className="space-y-1.5">
                {services.slice(0, 8).map((s) => (
                  <Link
                    key={s.slug}
                    href={`/avis/${s.slug}`}
                    className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-primary-500 py-1 transition-colors"
                  >
                    <ChevronRight className="w-3 h-3" />
                    Avis {s.name.toLowerCase()}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-charcoal-900 uppercase tracking-wider mb-3">Tarifs artisans</h3>
              <div className="space-y-1.5">
                {services.slice(0, 8).map((s) => (
                  <Link
                    key={s.slug}
                    href={`/tarifs/${s.slug}`}
                    className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-primary-500 py-1 transition-colors"
                  >
                    <ChevronRight className="w-3 h-3" />
                    Tarifs {s.name.toLowerCase()}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-charcoal-900 uppercase tracking-wider mb-3">Urgence artisans</h3>
              <div className="space-y-1.5">
                {services.slice(0, 8).map((s) => (
                  <Link
                    key={s.slug}
                    href={`/urgence/${s.slug}`}
                    className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-primary-500 py-1 transition-colors"
                  >
                    <ChevronRight className="w-3 h-3" />
                    Urgence {s.name.toLowerCase()}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-charcoal-900 uppercase tracking-wider mb-3">Navigation</h3>
              <div className="space-y-1.5">
                <Link href="/services" className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-primary-500 py-1 transition-colors">
                  <ChevronRight className="w-3 h-3" />
                  Tous les services
                </Link>
                <Link href="/villes" className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-primary-500 py-1 transition-colors">
                  <ChevronRight className="w-3 h-3" />
                  Toutes les villes
                </Link>
                <Link href="/departements" className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-primary-500 py-1 transition-colors">
                  <ChevronRight className="w-3 h-3" />
                  Tous les départements
                </Link>
                <Link href="/regions" className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-primary-500 py-1 transition-colors">
                  <ChevronRight className="w-3 h-3" />
                  Toutes les régions
                </Link>
                <Link href="/blog" className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-primary-500 py-1 transition-colors">
                  <ChevronRight className="w-3 h-3" />
                  Blog
                </Link>
                <Link href="/tarifs" className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-primary-500 py-1 transition-colors">
                  <ChevronRight className="w-3 h-3" />
                  Tarifs artisans
                </Link>
                <Link href="/urgence" className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-primary-500 py-1 transition-colors">
                  <ChevronRight className="w-3 h-3" />
                  Urgence artisans
                </Link>
                <Link href="/avis" className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-primary-500 py-1 transition-colors">
                  <ChevronRight className="w-3 h-3" />
                  Avis artisans
                </Link>
                <Link href="/checklist-travaux" className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-primary-500 py-1 transition-colors">
                  <ChevronRight className="w-3 h-3" />
                  Checklist avant travaux
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
