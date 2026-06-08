/**
 * Page : /newsletter/aides-renovation
 *
 * Sprint 4 — Action 17 : Newsletter "Actus aides rénovation" (audit l.248).
 *
 * KW cibles (validés Ahrefs API live, snapshot 2026-05-04, country=fr) :
 * - "newsletter renovation"           → 60 vol, KD 6, CPC $0,80 ⭐ EASY WIN
 * - "actualite maprimerenov"          → 720 vol, KD 22, CPC $1,10 — moyen
 * - "actualite aides renovation"      → 250 vol, KD 14, CPC $0,90 ⭐ EASY WIN
 * - "newsletter cee"                  → 30 vol, KD 4, longue traîne
 * - Famille cumulée pivot : ~1 100 vol/mois (intent informationnel + retention)
 *
 * Source : audit Ahrefs API live (cf docs/ahrefs-audit-2026-04/STRATEGIE-RENOVATION-ENERGETIQUE.md)
 * Easy win : OUI sur deux KW (KD ≤ 14)
 * Cluster pillar : Rénovation Énergétique → Aides → Newsletter
 *
 * Anti-cannibalisation :
 *   - Pas de hub newsletter racine sur le site (footer = formulaire générique).
 *   - Cette page = landing dédiée segment 'aides-renovation' (suivi
 *     `newsletter_subscribers.source = 'aides-renovation'`) → permet
 *     de cibler l'envoi sur le sous-segment intéressé.
 *
 * Conformité RGPD :
 *   - Consent explicite (checkbox), source horodatée en DB
 *   - Token HMAC unsubscribe one-click via /api/newsletter/unsubscribe
 *   - Aucune donnée tierce pré-cochée, pas de cookie tiers
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  CheckCircle2,
  Coins,
  Mail,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import LastUpdated from '@/components/seo/LastUpdated'
import NewsletterForm from '@/components/NewsletterForm'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import { getBreadcrumbSchema, getFAQSchema, getOrganizationSchema } from '@/lib/seo/jsonld'

export const revalidate = 86400

const PAGE_PATH = '/newsletter/aides-renovation'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-04'
const MODIFIED = '2026-05-04'

const TITLE = 'Newsletter aides rénovation 2026 — actualités MaPrimeRénov, CEE'
const DESCRIPTION =
  'Recevez chaque mois les actualités MaPrimeRénov, CEE, Coup de pouce, Éco-PTZ : barèmes 2026, calendrier passoires, gestes éligibles. Gratuit.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: getAlternates(PAGE_PATH),
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: 'website',
    siteName: SITE_NAME,
    locale: 'fr_FR',
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
  robots: { index: true, follow: true },
}

const benefits = [
  {
    icon: TrendingUp,
    title: 'Barèmes officiels à jour',
    text: "MaPrimeRénov', CEE, Coup de pouce, Éco-PTZ — montants 2026 et leurs évolutions trimestrielles.",
  },
  {
    icon: Coins,
    title: 'Cumul aides optimisé',
    text: 'Comment empiler MPR + CEE + Coup de pouce + TVA 5,5 % sans dépasser le plafond 90 % ménages très modestes.',
  },
  {
    icon: ShieldCheck,
    title: 'Calendrier réglementaire',
    text: 'Interdictions location passoires (G 2025, F 2028, E 2034), audit énergétique obligatoire, DPE.',
  },
  {
    icon: Sparkles,
    title: 'Easy wins du mois',
    text: 'Gestes simples à fort retour : isolation combles 1 €, audit pris en charge à 100 % pour ménages Bleu, Coup de pouce PAC.',
  },
]

const faq = [
  {
    question: 'À quelle fréquence est envoyée la newsletter aides rénovation ?',
    answer:
      "Envoi mensuel, le premier mardi du mois. En cas d'évolution réglementaire significative (nouvel arrêté, changement barème, fermeture parcours), un envoi flash supplémentaire est envoyé. Vous restez maître de la désinscription en un clic à tout moment.",
  },
  {
    question: 'Quelle différence avec la newsletter générique ServicesArtisans ?',
    answer:
      "La newsletter générique (footer du site) couvre tous les corps de métier (plomberie, électricité, maçonnerie, jardinage, etc.). La newsletter aides rénovation est focalisée exclusivement sur la rénovation énergétique et les aides publiques associées : MaPrimeRénov', CEE, Coup de pouce, Éco-PTZ. Vous pouvez vous inscrire aux deux.",
  },
  {
    question: 'Ma vie privée est-elle protégée ?',
    answer:
      "Oui. Conformément au RGPD : (1) votre adresse e-mail n'est jamais partagée avec des tiers, (2) vous pouvez vous désinscrire en un clic via le lien présent dans chaque envoi, (3) une demande de suppression complète peut être adressée à privacy@servicesartisans.fr (réponse sous 30 jours), (4) aucun cookie tiers n'est déposé sur cette page de confirmation.",
  },
  {
    question: "Recevrai-je des publicités d'artisans ?",
    answer:
      "Non. La newsletter contient uniquement des informations éditoriales : actualités réglementaires, guides aides, simulateurs d'éligibilité, témoignages d'utilisateurs. Si vous recherchez un artisan RGE, le moteur de recherche du site (gratuit, sans inscription) ou le simulateur d'aides sont à disposition.",
  },
  {
    question: 'Sur quelles sources se basent les contenus envoyés ?',
    answer:
      "Sources officielles uniquement : France Rénov' (france-renov.gouv.fr), ANAH (anah.fr), service-public.fr, Ministère de la Transition écologique (ecologie.gouv.fr), Journal Officiel (Légifrance), DGEC. Les barèmes sont vérifiés au moment de l'envoi via les arrêtés ministériels en vigueur. La méthodologie éditoriale est publiée sur la page /equipe.",
  },
]

const recentTopics = [
  {
    href: '/aides/maprimerenov',
    label: "MaPrimeRénov' 2026 : nouveaux plafonds revenus",
  },
  {
    href: '/aides/cee',
    label: 'Bonification CEE Précarité : qui est éligible ?',
  },
  {
    href: '/renovation-energetique/passoires-thermiques/calendrier-2025-2028-2034',
    label: 'Passoires thermiques : interdiction G 2025 → F 2028 → E 2034',
  },
  {
    href: '/aides/eco-ptz',
    label: 'Éco-PTZ 2026 : plafond 50 000 € et durée 20 ans',
  },
  {
    href: '/aides/prime-coup-de-pouce',
    label: 'Coup de pouce PAC : prime majorée jusqu’à 5 000 €',
  },
  {
    href: '/renovation-energetique/diagnostic/audit-energetique',
    label: 'Audit énergétique obligatoire : qui, quand, combien ?',
  },
]

export default function NewsletterAidesRenovationPage() {
  const breadcrumbItems = [{ label: 'Newsletter aides rénovation' }]

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Aides à la rénovation', url: '/aides' },
    { name: 'Newsletter aides rénovation', url: PAGE_PATH },
  ])

  const organizationSchema = getOrganizationSchema()
  const faqSchema = getFAQSchema(faq)

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    inLanguage: 'fr-FR',
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${SITE_URL}#website`,
      name: SITE_NAME,
      url: SITE_URL,
    },
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/opengraph-image`,
    },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1[data-speakable]', 'h2[data-speakable]'],
    },
  }

  return (
    <>
      <JsonLd data={[breadcrumbSchema, organizationSchema, webPageSchema, faqSchema]} />

      <main className="min-h-screen bg-gradient-to-b from-sand-50 to-white">
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary-600 via-primary-500 to-primary-600 text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <Breadcrumb
              items={breadcrumbItems}
              className="mb-6 text-primary-100 [&_a]:text-primary-100 [&_a:hover]:text-white [&_svg]:text-primary-200 [&>ol>li:last-child_span]:text-white"
            />
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 rounded-full text-sm font-medium mb-6">
              <Mail className="w-4 h-4" />
              Newsletter mensuelle gratuite
            </div>
            <h1
              data-speakable="true"
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading mb-4 leading-tight"
            >
              Actus aides rénovation 2026
            </h1>
            <p className="text-lg sm:text-xl text-primary-50 max-w-2xl leading-relaxed">
              Chaque mois, les évolutions barèmes MaPrimeRénov&apos;, CEE, Coup de pouce et Éco-PTZ.
              Sources officielles France Rénov&apos; — désinscription en un clic.
            </p>

            <div className="mt-8 max-w-md">
              <NewsletterForm
                source="aides-renovation"
                successMessage="Inscription confirmée — premier numéro envoyé sous 24h."
                helperText="Envoi mensuel · sources officielles uniquement · 0 spam"
              />
            </div>

            <div className="mt-6 text-sm text-primary-100">
              <LastUpdated date={MODIFIED} label="Page mise à jour le" />
            </div>
          </div>
        </section>

        {/* Bénéfices */}
        <section className="py-12 sm:py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2
              data-speakable="true"
              className="text-2xl sm:text-3xl font-bold text-charcoal-900 font-heading mb-10 text-center"
            >
              Ce que vous recevrez chaque mois
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {benefits.map((b) => {
                const Icon = b.icon
                return (
                  <div
                    key={b.title}
                    className="bg-white border border-sand-200 rounded-2xl p-6 hover:border-primary-200 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary-500" />
                    </div>
                    <h3 className="text-lg font-bold text-charcoal-900 mb-2">{b.title}</h3>
                    <p className="text-charcoal-600 leading-relaxed">{b.text}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Sujets récents */}
        <section className="py-12 sm:py-16 bg-sand-50 border-y border-sand-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-charcoal-900 font-heading mb-3 text-center">
              Aperçu des sujets récents
            </h2>
            <p className="text-center text-charcoal-600 mb-10 max-w-2xl mx-auto">
              Tous nos guides pivots sont accessibles librement — la newsletter relaie en priorité
              les évolutions et nouveautés.
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl mx-auto">
              {recentTopics.map((t) => (
                <li key={t.href}>
                  <Link
                    href={t.href}
                    className="flex items-start gap-3 p-4 bg-white rounded-xl border border-sand-200 hover:border-primary-300 hover:bg-primary-50/50 transition-colors group"
                  >
                    <CheckCircle2 className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
                    <span className="text-charcoal-800 group-hover:text-primary-700 font-medium">
                      {t.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CTA simulateur */}
        <section className="py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-charcoal-900 font-heading mb-4">
              Vous voulez aussi estimer vos aides en 45 secondes ?
            </h2>
            <p className="text-charcoal-600 mb-8 max-w-2xl mx-auto">
              Le simulateur ServicesArtisans calcule votre éligibilité MaPrimeRénov&apos;, CEE, Coup
              de pouce et Éco-PTZ d&apos;après les barèmes 2026. Sans inscription, sans engagement.
            </p>
            <Link
              href="/simulateur-aides-renovation"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-xl transition-all"
            >
              Lancer le simulateur
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-12 sm:py-16 bg-white border-t border-sand-200">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2
              data-speakable="true"
              className="text-2xl sm:text-3xl font-bold text-charcoal-900 font-heading mb-10 text-center"
            >
              Questions fréquentes
            </h2>
            <dl className="space-y-6">
              {faq.map((item) => (
                <div
                  key={item.question}
                  className="bg-sand-50 border border-sand-200 rounded-2xl p-6"
                >
                  <dt className="font-bold text-charcoal-900 mb-3 faq-question">{item.question}</dt>
                  <dd className="text-charcoal-700 leading-relaxed faq-answer">{item.answer}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-12 sm:py-16 bg-gradient-to-br from-primary-50 to-primary-50 border-t border-sand-200">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-charcoal-900 font-heading mb-4">
              Prêt à recevoir nos actus ?
            </h2>
            <p className="text-charcoal-600 mb-8">
              Rejoignez les propriétaires qui anticipent leur projet de rénovation grâce aux
              actualités barèmes officiels.
            </p>
            <div className="flex justify-center">
              <NewsletterForm
                source="aides-renovation"
                variant="light"
                successMessage="Inscription confirmée — premier numéro envoyé sous 24h."
                helperText="Envoi mensuel · sources officielles uniquement · 0 spam"
              />
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
