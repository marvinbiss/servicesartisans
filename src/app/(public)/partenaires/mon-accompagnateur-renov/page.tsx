/**
 * Page : /partenaires/mon-accompagnateur-renov
 *
 * Sprint 4 — Action 18 : Partenariat Mon Accompagnateur Rénov' (audit l.249).
 *
 * NB : page B2B intent professionnel pure, distincte des deux pages SEO grand public
 * existantes ciblant le KW "mon accompagnateur renov" :
 *   - /guides/mon-accompagnateur-renov-obligatoire (info propriétaire)
 *   - /renovation-energetique/aides/maprimerenov-2026/parcours-accompagne (sub MPR)
 *
 * Pas de KW grand public visé ici (anti-cannibalisation). KW B2B longue traîne :
 *   - "partenariat mon accompagnateur renov"  → 10-30 vol, KD < 5
 *   - "fournisseur leads MAR"                  → < 10 vol, intent partenariat
 *   - "trouver des chantiers MAR"              → < 10 vol, intent partenariat
 *
 * Cible audience : ~800 MAR agréés ANAH (annuaire france-renov.gouv.fr) +
 *                  bureaux études / ingénieurs énergétique en cours d'agrément.
 *
 * Conversion : email contact partenariat (pas de formulaire automatisé pour
 * éviter spam) + Calendly externe en backup.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  CheckCircle2,
  Users,
  ListChecks,
  Mail,
  Network,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import LastUpdated from '@/components/seo/LastUpdated'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import { getBreadcrumbSchema, getFAQSchema, getOrganizationSchema } from '@/lib/seo/jsonld'

export const revalidate = 86400

const PAGE_PATH = '/partenaires/mon-accompagnateur-renov'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-04'
const MODIFIED = '2026-05-04'

const TITLE = "Partenariat Mon Accompagnateur Rénov' — ServicesArtisans"
const DESCRIPTION =
  "ServicesArtisans propose aux Mon Accompagnateur Rénov' (MAR) agréés ANAH un flux de chantiers RGE certifiés : leads exclusifs, France entière."

const PARTNER_EMAIL = 'partenariats@servicesartisans.fr'

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
    title: 'Flux propriétaires Parcours accompagné',
    text: "Notre simulateur d'aides identifie les propriétaires éligibles MaPrimeRénov' Parcours accompagné. Les profils qualifiés vous sont transmis pour audit et accompagnement.",
  },
  {
    icon: Network,
    title: 'Réseau national ~50 000 artisans RGE certifiés',
    text: "Annuaire ServicesArtisans : ~50 000 artisans RGE actifs (Qualibat, Qualifelec, QualiPAC, Qualit'EnR), synchronisés chaque semaine sur la base ADEME. Vos chantiers MAR trouvent l'artisan certifié de la bonne famille de travaux dans la zone.",
  },
  {
    icon: ShieldCheck,
    title: 'Leads exclusifs garantis',
    text: "Politique 1 lead = 1 partenaire. Aucun chevauchement avec d'autres MAR ou plateformes. Politique d'attribution transparente, traçabilité complète.",
  },
  {
    icon: Users,
    title: 'Pas de commission sur vos honoraires MAR',
    text: 'Le partenariat ne touche pas à votre rémunération MAR (forfaits ANAH 600-2 000 €). Modèle commercial neutre : ServicesArtisans facture uniquement la mise en relation, jamais sur la prestation MAR.',
  },
]

const howItWorks = [
  {
    step: 1,
    title: 'Pré-qualification au simulateur',
    text: "Le propriétaire complète notre simulateur d'aides. Si Parcours accompagné MaPrimeRénov' est l'option optimale (gain ≥ 2 classes DPE, audit obligatoire), il est routé vers MAR.",
  },
  {
    step: 2,
    title: 'Géo-attribution exclusive',
    text: 'Le lead est attribué à 1 seul MAR partenaire de la zone selon disponibilité, distance et capacité. Vous recevez les coordonnées + résumé du projet par email + dashboard.',
  },
  {
    step: 3,
    title: 'Audit + plan + suivi',
    text: "Vous menez l'audit énergétique, élaborez le plan de travaux, accompagnez le dépôt MPR et suivez l'exécution. Vos honoraires sont facturés directement au propriétaire (forfaits ANAH).",
  },
  {
    step: 4,
    title: 'Choix artisan RGE coordonné',
    text: 'Si le propriétaire le souhaite, ServicesArtisans propose 3 artisans RGE pré-sélectionnés dans la famille de travaux retenue (chauffage, isolation, ventilation). Le choix final reste libre.',
  },
]

const requirements = [
  "Agrément Mon Accompagnateur Rénov' ANAH en cours de validité (annuaire france-renov.gouv.fr)",
  "Couverture géographique précisée (départements ou bassins d'intervention)",
  "Capacité mensuelle de prise en charge (nombre d'audits / accompagnements)",
  'Engagement RGPD signé (traitement leads conforme RGPD : finalité, durée, droits)',
  'Reporting trimestriel : retours sur leads (qualité profil, taux conversion travaux)',
]

const faq = [
  {
    question: "Suis-je obligé de m'engager exclusivement avec ServicesArtisans ?",
    answer:
      "Non. Le partenariat est non-exclusif côté MAR : vous pouvez continuer vos canaux d'acquisition habituels (recommandation, réseau ANAH, Mon Accompagnateur direct). Côté ServicesArtisans, en revanche, chaque lead est attribué exclusivement à 1 MAR partenaire — vous ne recevrez jamais un lead déjà transmis à un confrère.",
  },
  {
    question: 'Quels sont les volumes attendus de leads MAR ?',
    answer:
      "Variables selon zone, capacité et saisonnalité. Sur la France entière, notre simulateur pré-qualifie environ 200-400 propriétaires Parcours accompagné par mois (chiffres avril 2026, en croissance). Sur une zone donnée (département ou métropole), comptez 5-30 leads/mois selon densité immobilière et taux d'éligibilité MPR.",
  },
  {
    question: 'Comment ServicesArtisans monétise-t-il le partenariat ?',
    answer:
      "Modèle B2C : ServicesArtisans est rémunéré sur la mise en relation propriétaire ↔ artisan RGE pour les travaux qui suivent l'audit (commission encadrée par le mandataire CEE Sonergia, conforme code de l'énergie). La prestation MAR (audit + plan + accompagnement) reste facturée directement au propriétaire selon les forfaits ANAH. Aucun prélèvement, aucune commission sur vos honoraires MAR.",
  },
  {
    question: 'Recevrai-je tous les profils ou pré-filtrés ?',
    answer:
      'Pré-filtrés. Notre simulateur applique 6 critères pour orienter vers Parcours accompagné : (1) gain DPE projeté ≥ 2 classes, (2) plafond travaux 70-90 K€, (3) catégorie ANAH éligible, (4) logement principal > 15 ans, (5) propriétaire occupant ou bailleur, (6) projet sous 12 mois. Les leads non éligibles MPR Parcours sont routés vers MPR par geste, hors votre périmètre.',
  },
  {
    question: 'Quel délai pour démarrer ?',
    answer:
      "Onboarding standard : 7 à 14 jours. Étapes : (1) signature convention partenariat, (2) configuration zone d'intervention dans notre back-office, (3) test sur 3-5 leads, (4) ajustements et go-live. Premier lead reçu généralement dans les 30 jours suivant la signature.",
  },
]

export default function PartenairesMarPage() {
  const breadcrumbItems = [
    { label: 'Partenaires', href: '/partenaires' },
    { label: "Mon Accompagnateur Rénov'" },
  ]

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Partenaires', url: '/partenaires' },
    { name: "Partenariat Mon Accompagnateur Rénov'", url: PAGE_PATH },
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
  }

  return (
    <>
      <JsonLd data={[breadcrumbSchema, organizationSchema, webPageSchema, faqSchema]} />

      <main className="min-h-screen bg-gradient-to-b from-sand-50 to-white">
        {/* Hero */}
        <section className="bg-gradient-to-br from-charcoal-900 via-charcoal-800 to-primary-900 text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <Breadcrumb
              items={breadcrumbItems}
              className="mb-6 text-charcoal-300 [&_a]:text-charcoal-300 [&_a:hover]:text-white [&_svg]:text-charcoal-400 [&>ol>li:last-child_span]:text-white"
            />
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full text-sm font-medium mb-6">
              <Users className="w-4 h-4" />
              Partenariat B2B — réseau MAR
            </div>
            <h1
              data-speakable="true"
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading mb-4 leading-tight"
            >
              Partenariat Mon Accompagnateur Rénov&apos;
            </h1>
            <p className="text-lg sm:text-xl text-charcoal-200 max-w-3xl leading-relaxed mb-8">
              Vous êtes <strong>MAR agréé ANAH</strong> ? ServicesArtisans vous propose un flux de
              propriétaires pré-qualifiés Parcours accompagné MaPrimeRénov&apos; sur votre zone.
              Leads exclusifs, neutralité commerciale, modèle conforme code de l&apos;énergie.
            </p>
            <a
              href={`mailto:${PARTNER_EMAIL}?subject=Partenariat%20MAR%20-%20Demande%20d'information`}
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary-500 hover:bg-primary-400 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/25 transition-all"
            >
              <Mail className="w-5 h-5" />
              Devenir partenaire — {PARTNER_EMAIL}
              <ArrowRight className="w-5 h-5" />
            </a>
            <p className="mt-6 text-sm text-charcoal-300">
              <LastUpdated date={MODIFIED} label="Page mise à jour le" />
            </p>
          </div>
        </section>

        {/* Bénéfices */}
        <section className="py-12 sm:py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2
              data-speakable="true"
              className="text-2xl sm:text-3xl font-bold text-charcoal-900 font-heading mb-10 text-center"
            >
              Pourquoi ce partenariat
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

        {/* How it works */}
        <section className="py-12 sm:py-16 bg-sand-50 border-y border-sand-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-charcoal-900 font-heading mb-10 text-center">
              Comment ça marche
            </h2>
            <ol className="space-y-5">
              {howItWorks.map((item) => (
                <li
                  key={item.step}
                  className="flex gap-5 bg-white border border-sand-200 rounded-2xl p-6"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-500 text-white font-bold text-lg flex items-center justify-center">
                    {item.step}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-charcoal-900 mb-2">{item.title}</h3>
                    <p className="text-charcoal-700 leading-relaxed">{item.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Prérequis */}
        <section className="py-12 sm:py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-charcoal-900 font-heading mb-3 flex items-center gap-2">
              <ListChecks className="w-7 h-7 text-primary-500" />
              Prérequis pour devenir partenaire
            </h2>
            <p className="text-charcoal-600 mb-6">
              Notre objectif : qualité du réseau pour préserver l&apos;expérience propriétaire. 5
              critères d&apos;onboarding :
            </p>
            <ul className="space-y-3">
              {requirements.map((req) => (
                <li
                  key={req}
                  className="flex items-start gap-3 bg-white border border-sand-200 rounded-xl p-4"
                >
                  <CheckCircle2 className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                  <span className="text-charcoal-800 leading-relaxed">{req}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CTA central */}
        <section className="py-14 sm:py-20 bg-gradient-to-br from-primary-50 to-primary-50 border-y border-sand-200">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-charcoal-900 font-heading mb-4">
              Prêt à recevoir votre premier lead Parcours accompagné ?
            </h2>
            <p className="text-charcoal-600 mb-8 max-w-xl mx-auto">
              Onboarding 7-14 jours — premier lead sous 30 jours. Échangeons sur votre zone et vos
              capacités.
            </p>
            <a
              href={`mailto:${PARTNER_EMAIL}?subject=Partenariat%20MAR%20-%20Demande%20d'information`}
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/25 transition-all"
            >
              <Mail className="w-5 h-5" />
              {PARTNER_EMAIL}
            </a>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-12 sm:py-16 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2
              data-speakable="true"
              className="text-2xl sm:text-3xl font-bold text-charcoal-900 font-heading mb-10 text-center"
            >
              Questions fréquentes
            </h2>
            <FlagshipFaq items={faq} />
          </div>
        </section>

        {/* E-E-A-T */}
        <section className="py-12 sm:py-16 bg-sand-50 border-t border-sand-200">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <FlagshipSources
              title="Cadre réglementaire et sources officielles"
              sources={[
                {
                  label: "Mon Accompagnateur Rénov' — France Rénov' (rôle, agrément, annuaire)",
                  url: 'https://france-renov.gouv.fr/mon-accompagnateur-renov',
                },
                {
                  label: 'ANAH — agrément MAR et liste des MAR agréés',
                  url: 'https://www.anah.gouv.fr/professionnels/mon-accompagnateur-renov',
                },
                {
                  label:
                    "Décret n° 2022-1035 du 22 juillet 2022 — Mon Accompagnateur Rénov' (Légifrance)",
                  url: 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000046079562',
                },
                {
                  label:
                    "Code de l'énergie articles L221-1 et suivants — CEE et mandataire (Légifrance)",
                  url: 'https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000023983208/LEGISCTA000023985793',
                },
              ]}
            />

            <div className="mt-12 pt-8 border-t border-sand-200">
              <h3 className="text-lg font-bold text-charcoal-900 mb-3">
                Liens utiles côté propriétaire
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/guides/mon-accompagnateur-renov-obligatoire"
                    className="text-primary-600 hover:text-primary-700 underline"
                  >
                    Guide propriétaire : MAR obligatoire ?
                  </Link>
                </li>
                <li>
                  <Link
                    href="/renovation-energetique/aides/maprimerenov-2026/parcours-accompagne"
                    className="text-primary-600 hover:text-primary-700 underline"
                  >
                    Parcours accompagné MaPrimeRénov&apos; 2026
                  </Link>
                </li>
                <li>
                  <Link
                    href="/simulateur-aides-renovation"
                    className="text-primary-600 hover:text-primary-700 underline"
                  >
                    Simulateur d&apos;aides rénovation (gratuit)
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
