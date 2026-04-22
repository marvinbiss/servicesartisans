import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ShieldCheck,
  Euro,
  Users,
  CheckCircle2,
  ArrowRight,
  FileCheck2,
  TrendingUp,
  Lock,
  Zap,
  Target,
  BarChart3,
  Phone,
  LayoutDashboard,
  FolderOpen,
  GraduationCap,
  LineChart,
} from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import PartnerRevenuSimulator from '@/components/cee/PartnerRevenuSimulator'
import PartnerSiretLookup from '@/components/cee/PartnerSiretLookup'
import {
  PartnerCtaLink,
  PartnerCtaPhone,
  PartnerLandingTracker,
} from '@/components/cee/PartnerTracking'
import { SITE_URL, getAlternates } from '@/lib/seo/config'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'

export const revalidate = 86400

const path = '/devenir-partenaire-cee'

export const metadata: Metadata = {
  title: 'Devenir partenaire CEE — Leads exclusifs artisans RGE',
  description:
    'Programme partenaire CEE pour artisans RGE : leads exclusifs (1 demande = 1 artisan), gestion des primes énergie, zéro engagement. Inscription gratuite.',
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1 as const,
    'max-image-preview': 'large' as const,
    'max-video-preview': -1 as const,
  },
  openGraph: {
    title: 'Devenir partenaire CEE — Leads exclusifs pour artisans RGE',
    description:
      "Leads exclusifs, gestion des primes CEE, zéro engagement. Le programme partenaire qui respecte l'artisan.",
    type: 'website',
    locale: 'fr_FR',
    url: `${SITE_URL}${path}`,
    siteName: 'ServicesArtisans',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Devenir partenaire CEE — Leads exclusifs pour artisans RGE',
    description:
      "Leads exclusifs, gestion des primes CEE, zéro engagement. Le programme partenaire qui respecte l'artisan.",
  },
  alternates: getAlternates(path),
}

/* ------------------------------------------------------------------ */
/*  Data                                                              */
/* ------------------------------------------------------------------ */

const BENEFITS = [
  {
    icon: Lock,
    title: '1 demande = 1 artisan',
    description:
      'Chaque lead vous est envoyé en exclusivité. Jamais partagé avec 5 concurrents comme chez Habitatpresto ou Travaux.com. Vous ne courez plus après le prospect.',
  },
  {
    icon: Euro,
    title: '0 € en phase de lancement',
    description:
      "Pas d'abonnement, pas de commission, pas d'engagement pendant la phase de rodage. Vous testez le service sans risque financier.",
  },
  {
    icon: FileCheck2,
    title: 'Gestion des primes CEE',
    description:
      'On monte les dossiers CEE pour vous. Vous vous concentrez sur le chantier, on gère la paperasse et le suivi auprès du délégataire.',
  },
  {
    icon: ShieldCheck,
    title: 'Fiche pro enrichie',
    description:
      "Votre fiche artisan avec vos qualifications RGE, vos avis clients vérifiés et votre zone d'intervention. Vous gardez votre marque et votre identité.",
  },
  {
    icon: BarChart3,
    title: 'Suivi temps réel',
    description:
      "Dashboard artisan : suivez vos leads, vos devis, le statut de vos dossiers CEE et vos paiements en un coup d'œil.",
  },
  {
    icon: Target,
    title: 'Leads géolocalisés',
    description:
      "Recevez uniquement des demandes dans votre zone d'intervention. Pas de leads à 2h de route. Pas de projets fantaisistes.",
  },
]

const STEPS = [
  {
    name: 'Inscription en 2 minutes',
    text: 'Entrez votre SIRET. On récupère automatiquement vos qualifications RGE depuis la base ADEME : raison sociale, adresse, certifications en cours de validité. Zéro paperasse.',
  },
  {
    name: 'Validation de votre profil',
    text: 'On vérifie que votre qualification RGE est active et que votre assurance décennale est à jour. Délai : 24 à 48h ouvrées.',
  },
  {
    name: 'Premier lead sous 7 jours',
    text: 'Votre fiche est publiée sur ServicesArtisans. Les demandes de devis dans votre zone et votre métier vous sont envoyées en exclusivité.',
  },
  {
    name: 'Chantier CEE éligible ? On gère',
    text: "Pour chaque chantier éligible aux primes CEE, on monte le dossier complet : attestation sur l'honneur, pièces justificatives, soumission au délégataire. Vous n'avez rien à faire.",
  },
]

const COMPARISONS = [
  {
    label: 'Leads exclusifs',
    us: true,
    them: false,
    detail: '1 lead = 1 artisan',
    detailThem: 'Partagé entre 3 à 10 artisans',
  },
  {
    label: 'Coût mensuel',
    us: true,
    them: false,
    detail: '0 € (phase de lancement)',
    detailThem: '70 à 220 €/mois (Habitatpresto)',
  },
  {
    label: 'Engagement',
    us: true,
    them: false,
    detail: 'Zéro engagement',
    detailThem: '6 à 12 mois',
  },
  {
    label: 'Gestion primes CEE',
    us: true,
    them: false,
    detail: 'Montage dossier inclus',
    detailThem: 'Non proposé',
  },
  {
    label: 'Fiche artisan enrichie',
    us: true,
    them: false,
    detail: 'Avis, qualifs RGE, portfolio',
    detailThem: 'Nom + téléphone uniquement',
  },
  {
    label: 'Données ADEME intégrées',
    us: true,
    them: false,
    detail: 'Qualifications RGE vérifiées automatiquement',
    detailThem: 'Déclaratif',
  },
]

const ELIGIBLE_OPERATIONS = [
  {
    code: 'BAR-TH-171',
    nom: 'Pompe à chaleur air/eau',
    prime: '2 500 à 5 000 €',
  },
  {
    code: 'BAR-TH-172',
    nom: 'Pompe à chaleur eau/eau',
    prime: '2 500 à 5 000 €',
  },
  {
    code: 'BAR-EN-101',
    nom: 'Isolation des combles perdus',
    prime: '900 à 2 700 €',
  },
  {
    code: 'BAR-EN-103',
    nom: 'Isolation des planchers bas',
    prime: '900 à 2 700 €',
  },
  {
    code: 'BAR-TH-113',
    nom: 'Chaudière biomasse',
    prime: '2 500 à 5 500 €',
  },
  {
    code: 'BAR-TH-112',
    nom: 'Poêle à bois / granulés',
    prime: '800 à 2 000 €',
  },
]

const FAQS = [
  {
    question: 'Qui peut devenir partenaire CEE sur ServicesArtisans\u00a0?',
    answer:
      "Tout artisan ou entreprise du bâtiment disposant d'une qualification RGE active (Qualibat, Qualit'EnR, Qualifelec ou équivalent) et d'une assurance décennale à jour. Pas de condition d'ancienneté ni de chiffre d'affaires minimum.",
  },
  {
    question: 'Combien coûte le programme partenaire\u00a0?',
    answer:
      "0 € pendant la phase de lancement. Aucun abonnement, aucune commission, aucun engagement. L'objectif est de prouver la valeur du service avant toute monétisation. À terme, la commission sur les primes CEE sera de 10 à 15\u00a0% du montant de la prime, jamais prélevée sur le devis de l'artisan.",
  },
  {
    question: 'Que signifie «\u00a0leads exclusifs\u00a0\u00bb concrètement\u00a0?',
    answer:
      "Chaque demande de devis est envoyée à un seul artisan. Pas 3, pas 5, pas 10. Un seul. C'est notre règle non-négociable. Vous ne perdez plus de temps en compétition avec d'autres artisans sur le même prospect.",
  },
  {
    question: 'Comment fonctionne la gestion des primes CEE\u00a0?',
    answer:
      "Après chaque chantier éligible, vous nous transmettez la facture et les pièces (attestation sur l'honneur, photos avant/après). On monte le dossier complet, on le soumet au délégataire CEE et on suit le traitement jusqu'au paiement. Vous recevez la prime sur votre compte, déduction faite de la commission (0\u00a0% en phase de lancement).",
  },
  {
    question: 'Quelles qualifications RGE sont acceptées\u00a0?',
    answer:
      "Toutes les qualifications RGE délivrées par un organisme accrédité COFRAC : Qualibat (5911, 7131, 7141, 8611...), Qualit'EnR (QualiPAC, QualiBois, QualiSol...), Qualifelec (RGE SER, RGE PV, IRVE). Votre qualification est vérifiée automatiquement via la base officielle ADEME.",
  },
  {
    question: 'Combien de temps pour recevoir mon premier lead\u00a0?',
    answer:
      'Après validation de votre profil (24 à 48h), votre fiche est publiée et vous commencez à recevoir des demandes de devis. Le délai dépend de votre zone géographique et de votre métier, mais la plupart des artisans reçoivent leur premier lead dans les 7 jours.',
  },
  {
    question: 'Puis-je arrêter à tout moment\u00a0?',
    answer:
      'Oui, zéro engagement. Vous pouvez désactiver votre compte partenaire à tout moment depuis votre espace artisan. Pas de pénalité, pas de frais de résiliation, pas de préavis.',
  },
  {
    question: 'Quelle différence avec Effy, Hellio ou Habitatpresto\u00a0?',
    answer:
      "Trois différences majeures. 1) Leads exclusifs : chez nous, 1 demande = 1 artisan. Chez eux, le même lead est partagé entre 3 à 10 artisans. 2) Indépendance : vous gardez votre marque, vos clients, votre identité. Vous n'êtes pas un sous-traitant anonyme. 3) Transparence : suivi temps réel de vos dossiers, pas de boîte noire.",
  },
]

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export default function DevenirPartenaireCeePage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Primes CEE', url: '/cee' },
    { name: 'Devenir partenaire CEE', url: path },
  ])

  const faqSchema = getFAQSchema(FAQS)

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${SITE_URL}${path}#webpage`,
    name: 'Devenir partenaire CEE — ServicesArtisans',
    url: `${SITE_URL}${path}`,
    inLanguage: 'fr-FR',
    description:
      'Programme partenaire CEE pour artisans RGE : leads exclusifs, gestion des primes énergie, zéro engagement.',
    publisher: { '@type': 'Organization', name: 'ServicesArtisans' },
    mainEntity: { '@id': `${SITE_URL}${path}#partner-program` },
  }

  // Service schema décrivant le programme partenaire CEE.
  // N'utilise pas GovernmentService : SA n'est pas une autorité publique.
  // Utilise Service + Offer (commission 0 € en phase de lancement).
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${SITE_URL}${path}#partner-program`,
    name: 'Programme partenaire CEE ServicesArtisans',
    serviceType: 'Programme partenaire pour artisans RGE',
    description:
      "Programme partenaire pour artisans RGE : réception de leads exclusifs (1 demande = 1 artisan), gestion des dossiers de primes Certificats d'Économies d'Énergie (CEE), fiche pro enrichie avec qualifications RGE vérifiées ADEME.",
    provider: {
      '@type': 'Organization',
      '@id': `${SITE_URL}#organization`,
      name: 'ServicesArtisans',
    },
    areaServed: { '@type': 'Country', name: 'France' },
    audience: {
      '@type': 'BusinessAudience',
      name: 'Artisans du bâtiment qualifiés RGE',
      audienceType:
        "Entreprises artisanales du bâtiment disposant d'une qualification RGE active (Qualibat, Qualit'EnR, Qualifelec ou équivalent accrédité COFRAC) et d'une assurance décennale à jour.",
    },
    category: 'Intermédiation entre particuliers et artisans RGE',
    offers: {
      '@type': 'Offer',
      '@id': `${SITE_URL}${path}#launch-offer`,
      name: 'Phase de lancement — 0 € de commission',
      description:
        "Pendant la phase de lancement : 0 € d'abonnement, 0 € de commission sur les primes CEE gérées, zéro engagement, résiliable à tout moment.",
      price: '0',
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      eligibleCustomerType: 'https://schema.org/Business',
      category: 'FreeTrial',
      url: `${SITE_URL}${path}#inscription-rapide`,
    },
    termsOfService: `${SITE_URL}/cgv`,
    isRelatedTo: [
      {
        '@type': 'GovernmentService',
        name: "Certificats d'Économies d'Énergie (CEE)",
        url: 'https://www.ecologie.gouv.fr/politiques-publiques/certificats-deconomies-denergie',
      },
    ],
  }

  return (
    <main className="min-h-screen bg-white">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={articleSchema} />
      <JsonLd data={serviceSchema} />
      {faqSchema && <JsonLd data={faqSchema} />}

      <PartnerLandingTracker source="devenir-partenaire-cee" trackDashboardPreview />

      <Breadcrumb
        items={[{ label: 'Primes CEE', href: '/cee' }, { label: 'Devenir partenaire CEE' }]}
      />

      {/* ============================================================ */}
      {/*  HERO                                                        */}
      {/* ============================================================ */}
      <section className="bg-gradient-to-br from-charcoal-900 via-charcoal-800 to-emerald-900 text-white py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 rounded-full px-4 py-1.5 mb-5">
            <Users className="w-4 h-4 text-emerald-300" />
            <span className="text-sm font-medium text-emerald-100">Programme partenaire CEE</span>
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-extrabold leading-tight mb-4">
            Artisan RGE&nbsp;? Recevez des leads exclusifs et gagnez plus sur chaque chantier.
          </h1>
          <p className="text-lg text-emerald-50/90 max-w-3xl leading-relaxed mb-6">
            1&nbsp;demande = 1&nbsp;artisan. Jamais partagé. On gère vos primes CEE, vous vous
            concentrez sur le chantier. <strong>0&nbsp;€ pendant la phase de lancement.</strong>
          </p>
          <div className="flex flex-wrap gap-3">
            <PartnerCtaLink
              href="#inscription-rapide"
              surface="hero"
              ctaLabel="Rejoindre le programme"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 text-white font-semibold shadow-lg hover:bg-emerald-500 transition"
            >
              Rejoindre le programme
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </PartnerCtaLink>
            <PartnerCtaPhone
              href="tel:+33756872787"
              surface="hero"
              ctaLabel="Nous appeler"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-emerald-400/30 text-emerald-100 font-semibold hover:bg-emerald-800/40 transition"
            >
              <Phone className="w-4 h-4" aria-hidden="true" />
              Nous appeler
            </PartnerCtaPhone>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            {[
              { value: '60\u00a0000+', label: 'artisans RGE référencés' },
              { value: '19', label: 'opérations CEE couvertes' },
              { value: '100\u00a0%', label: 'leads exclusifs' },
              { value: '0\u00a0\u20ac', label: 'pendant le lancement' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-emerald-800/30 border border-emerald-400/20 rounded-xl p-4 text-center"
              >
                <div className="font-heading text-2xl md:text-3xl font-extrabold text-emerald-300">
                  {stat.value}
                </div>
                <div className="text-sm text-emerald-100/80 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  LE PROBLÈME                                                  */}
      {/* ============================================================ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-4">
          Marre des leads partagés&nbsp;?
        </h2>
        <div className="prose prose-slate max-w-none text-charcoal-700 leading-relaxed">
          <p>
            Vous payez un abonnement ou un coût au lead. La même demande est envoyée à 5 artisans.
            Le premier qui décroche gagne. Les 4 autres perdent leur temps et leur argent.
          </p>
          <p>
            Et quand le chantier est éligible aux primes CEE&nbsp;? Vous laissez 2&nbsp;000 à
            5&nbsp;000&nbsp;€ sur la table parce que le montage du dossier est trop complexe, les
            délégataires exigent du volume, et le suivi prend des mois.
          </p>
          <p>
            <strong>On a construit l’inverse.</strong> Un service où chaque lead est exclusif, où
            les primes CEE sont gérées pour vous, et où vous gardez votre indépendance.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  6 AVANTAGES                                                  */}
      {/* ============================================================ */}
      <section className="bg-sand-50 border-y border-charcoal-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="w-5 h-5 text-emerald-700" aria-hidden="true" />
            <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900">
              Ce que vous gagnez
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {BENEFITS.map((b) => {
              const Icon = b.icon
              return (
                <article
                  key={b.title}
                  className="p-6 bg-white rounded-2xl border border-charcoal-200 hover:border-emerald-400 transition"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-emerald-700" aria-hidden="true" />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-charcoal-900 mb-2">
                    {b.title}
                  </h3>
                  <p className="text-sm text-charcoal-600 leading-relaxed">{b.description}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  INSCRIPTION RAPIDE — SIRET ADEME                             */}
      {/* ============================================================ */}
      <PartnerSiretLookup />

      {/* ============================================================ */}
      {/*  APERÇU DASHBOARD ARTISAN CEE                                 */}
      {/* ============================================================ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center gap-2 mb-3">
          <LayoutDashboard className="w-5 h-5 text-emerald-700" aria-hidden="true" />
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900">
            Votre espace artisan CEE, tout en un seul endroit
          </h2>
        </div>
        <p className="text-charcoal-600 mb-8 max-w-3xl leading-relaxed">
          Après inscription, vous accédez à un tableau de bord complet pour suivre vos dossiers, vos
          commissions et votre formation. Pas d'appels téléphoniques, pas d'e-mails perdus. Tout est
          centralisé, horodaté, traçable.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <article className="p-6 bg-white rounded-2xl border border-charcoal-200 hover:border-emerald-400 transition">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-3">
              <FolderOpen className="w-5 h-5 text-emerald-700" aria-hidden="true" />
            </div>
            <h3 className="font-heading font-bold text-lg text-charcoal-900 mb-2">
              Dossiers CEE en temps réel
            </h3>
            <ul className="text-sm text-charcoal-600 leading-relaxed space-y-1.5">
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Création d'un dossier en 2 minutes</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Upload des pièces (photos, facture, attestation)</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Suivi étape par étape jusqu'au paiement</span>
              </li>
            </ul>
          </article>

          <article className="p-6 bg-white rounded-2xl border border-charcoal-200 hover:border-emerald-400 transition">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-3">
              <LineChart className="w-5 h-5 text-emerald-700" aria-hidden="true" />
            </div>
            <h3 className="font-heading font-bold text-lg text-charcoal-900 mb-2">
              Commissions transparentes
            </h3>
            <ul className="text-sm text-charcoal-600 leading-relaxed space-y-1.5">
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Montant prime + commission affiché dès validation</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Historique complet des virements reçus</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Export comptable mensuel disponible</span>
              </li>
            </ul>
          </article>

          <article className="p-6 bg-white rounded-2xl border border-charcoal-200 hover:border-emerald-400 transition">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-3">
              <GraduationCap className="w-5 h-5 text-emerald-700" aria-hidden="true" />
            </div>
            <h3 className="font-heading font-bold text-lg text-charcoal-900 mb-2">
              Formation CEE intégrée
            </h3>
            <ul className="text-sm text-charcoal-600 leading-relaxed space-y-1.5">
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Fiches opérations BAR-TH, BAR-EN à jour</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Check-list pièces justificatives par opération</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Protocole photos EXIF géolocalisées (loi 30 juin 2025)</span>
              </li>
            </ul>
          </article>
        </div>

        <p className="text-sm text-charcoal-500 mt-6 max-w-3xl">
          Accès complet après validation de votre profil RGE. L'onboarding guide vos 3 premiers
          dossiers pour garantir 0 rejet délégataire.
        </p>
      </section>

      {/* ============================================================ */}
      {/*  4 ÉTAPES                                                     */}
      {/* ============================================================ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center gap-2 mb-6">
          <CheckCircle2 className="w-5 h-5 text-emerald-700" aria-hidden="true" />
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900">
            Comment ça marche&nbsp;?
          </h2>
        </div>
        <ol className="space-y-5">
          {STEPS.map((step, i) => (
            <li
              key={step.name}
              className="p-6 bg-white rounded-2xl border border-charcoal-200 flex gap-4"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-600 text-white font-heading font-extrabold flex items-center justify-center">
                {i + 1}
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg text-charcoal-900 mb-2">
                  {step.name}
                </h3>
                <p className="text-charcoal-700 text-sm leading-relaxed">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ============================================================ */}
      {/*  COMPARATIF                                                   */}
      {/* ============================================================ */}
      <section className="bg-sand-50 border-y border-charcoal-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-center gap-2 mb-6">
            <Users className="w-5 h-5 text-emerald-700" aria-hidden="true" />
            <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900">
              ServicesArtisans vs les autres plateformes
            </h2>
          </div>
          <div className="overflow-hidden rounded-2xl border border-charcoal-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-sand-200 text-charcoal-700">
                <tr>
                  <th className="text-left p-4 font-semibold">Critère</th>
                  <th className="text-left p-4 font-semibold text-emerald-700">ServicesArtisans</th>
                  <th className="text-left p-4 font-semibold text-charcoal-500">
                    Plateformes classiques
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISONS.map((row) => (
                  <tr key={row.label} className="border-t border-charcoal-100">
                    <td className="p-4 font-semibold text-charcoal-900 align-top">{row.label}</td>
                    <td className="p-4 align-top">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span className="text-emerald-700 font-semibold">{row.detail}</span>
                      </div>
                    </td>
                    <td className="p-4 text-charcoal-500 align-top">{row.detailThem}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  OPÉRATIONS CEE ÉLIGIBLES                                     */}
      {/* ============================================================ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-emerald-700" aria-hidden="true" />
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900">
            Primes CEE sur vos chantiers courants
          </h2>
        </div>
        <p className="text-charcoal-600 mb-6 max-w-3xl leading-relaxed">
          Vos clients peuvent toucher entre 800 et 5&nbsp;500&nbsp;€ de primes énergie sur les
          travaux que vous réalisez déjà. On gère le dossier, vous augmentez votre taux de
          conversion.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ELIGIBLE_OPERATIONS.map((op) => (
            <Link
              key={op.code}
              href={`/cee/${op.code.toLowerCase()}`}
              className="group p-5 bg-white rounded-2xl border border-charcoal-200 hover:border-emerald-400 hover:shadow-lg transition"
            >
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-xs font-semibold text-emerald-700 mb-2">
                {op.code}
              </span>
              <h3 className="font-heading font-bold text-charcoal-900 group-hover:text-emerald-700 transition">
                {op.nom}
              </h3>
              <p className="text-sm text-emerald-700 font-semibold mt-2">Prime : {op.prime}</p>
            </Link>
          ))}
        </div>
        <div className="mt-6">
          <Link
            href="/cee"
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-900 transition"
          >
            Voir les 19 opérations CEE éligibles
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SIMULATEUR DE REVENUS (interactif)                           */}
      {/* ============================================================ */}
      <PartnerRevenuSimulator />

      {/* Lien complément vers le simulateur prime "côté client" */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 bg-sand-50 border border-charcoal-200 rounded-2xl">
          <p className="text-sm text-charcoal-700 leading-relaxed">
            Besoin d'estimer la prime d'un chantier spécifique (PAC, isolation…) ? Le simulateur
            «&nbsp;côté client&nbsp;» calcule la prime exacte selon ménage, zone climatique et
            surface.
          </p>
          <PartnerCtaLink
            href="/simulateur-aides-renovation"
            surface="simulator_teaser"
            ctaLabel="Simuler une prime par chantier"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm shadow hover:bg-emerald-700 transition whitespace-nowrap"
          >
            Simuler une prime par chantier
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </PartnerCtaLink>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  FAQ                                                          */}
      {/* ============================================================ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-6">
          Questions fréquentes
        </h2>
        <div className="space-y-4">
          {FAQS.map((faq) => (
            <details
              key={faq.question}
              className="group p-5 bg-white rounded-2xl border border-charcoal-200 hover:border-emerald-400 transition"
            >
              <summary className="font-heading font-bold text-charcoal-900 cursor-pointer list-none flex items-start justify-between gap-3">
                <span>{faq.question}</span>
                <span className="text-emerald-600 text-xl font-extrabold group-open:rotate-45 transition-transform">
                  +
                </span>
              </summary>
              <p className="text-sm text-charcoal-700 mt-3 leading-relaxed">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/*  CTA FINAL                                                    */}
      {/* ============================================================ */}
      <section className="bg-gradient-to-br from-emerald-700 to-emerald-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold mb-3">
            Prêt à recevoir vos premiers leads exclusifs&nbsp;?
          </h2>
          <p className="text-emerald-100 max-w-2xl mx-auto mb-6 leading-relaxed">
            Inscription gratuite en 2 minutes. Zéro engagement. Vos qualifications RGE sont
            vérifiées automatiquement via la base ADEME.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <PartnerCtaLink
              href="/inscription"
              surface="final_cta"
              ctaLabel="Rejoindre le programme"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-emerald-800 font-semibold shadow-lg hover:bg-emerald-50 transition"
            >
              Rejoindre le programme
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </PartnerCtaLink>
            <PartnerCtaLink
              href="/cee"
              surface="final_cta"
              ctaLabel="Découvrir les primes CEE"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-emerald-300/50 bg-emerald-800/40 text-white font-semibold hover:bg-emerald-800/60 transition"
            >
              Découvrir les primes CEE
            </PartnerCtaLink>
            <PartnerCtaLink
              href="/rge/comment-devenir-rge"
              surface="final_cta"
              ctaLabel="Obtenir la qualification RGE"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-emerald-300/50 bg-emerald-800/40 text-white font-semibold hover:bg-emerald-800/60 transition"
            >
              Obtenir la qualification RGE
            </PartnerCtaLink>
          </div>
        </div>
      </section>
    </main>
  )
}
