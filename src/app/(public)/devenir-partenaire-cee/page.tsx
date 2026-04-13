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
} from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { SITE_URL, getAlternates } from '@/lib/seo/config'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'

export const revalidate = 86400

const path = '/devenir-partenaire-cee'

export const metadata: Metadata = {
  title: 'Devenir partenaire CEE — Leads exclusifs et gestion des primes pour artisans RGE',
  description:
    'Programme partenaire CEE pour artisans RGE : leads exclusifs (1 demande = 1 artisan), gestion des primes \u00e9nergie, z\u00e9ro engagement. Inscription gratuite, 0 \u20ac de commission en phase de lancement.',
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
      "Leads exclusifs, gestion des primes CEE, z\u00e9ro engagement. Le programme partenaire qui respecte l'artisan.",
    type: 'website',
    locale: 'fr_FR',
    url: `${SITE_URL}${path}`,
    siteName: 'ServicesArtisans',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Devenir partenaire CEE — Leads exclusifs pour artisans RGE',
    description:
      "Leads exclusifs, gestion des primes CEE, z\u00e9ro engagement. Le programme partenaire qui respecte l'artisan.",
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
      'Chaque lead vous est envoy\u00e9 en exclusivit\u00e9. Jamais partag\u00e9 avec 5 concurrents comme chez Habitatpresto ou Travaux.com. Vous ne courez plus apr\u00e8s le prospect.',
  },
  {
    icon: Euro,
    title: '0 \u20ac en phase de lancement',
    description:
      "Pas d'abonnement, pas de commission, pas d'engagement pendant la phase de rodage. Vous testez le service sans risque financier.",
  },
  {
    icon: FileCheck2,
    title: 'Gestion des primes CEE',
    description:
      'On monte les dossiers CEE pour vous. Vous vous concentrez sur le chantier, on g\u00e8re la paperasse et le suivi aupr\u00e8s du d\u00e9l\u00e9gataire.',
  },
  {
    icon: ShieldCheck,
    title: 'Fiche pro enrichie',
    description:
      "Votre fiche artisan avec vos qualifications RGE, vos avis clients v\u00e9rifi\u00e9s et votre zone d'intervention. Vous gardez votre marque et votre identit\u00e9.",
  },
  {
    icon: BarChart3,
    title: 'Suivi temps r\u00e9el',
    description:
      "Dashboard artisan : suivez vos leads, vos devis, le statut de vos dossiers CEE et vos paiements en un coup d'\u0153il.",
  },
  {
    icon: Target,
    title: 'Leads g\u00e9olocalis\u00e9s',
    description:
      "Recevez uniquement des demandes dans votre zone d'intervention. Pas de leads \u00e0 2h de route. Pas de projets fantaisistes.",
  },
]

const STEPS = [
  {
    name: 'Inscription en 2 minutes',
    text: 'Entrez votre SIRET. On r\u00e9cup\u00e8re automatiquement vos qualifications RGE depuis la base ADEME : raison sociale, adresse, certifications en cours de validit\u00e9. Z\u00e9ro paperasse.',
  },
  {
    name: 'Validation de votre profil',
    text: 'On v\u00e9rifie que votre qualification RGE est active et que votre assurance d\u00e9cennale est \u00e0 jour. D\u00e9lai : 24 \u00e0 48h ouvr\u00e9es.',
  },
  {
    name: 'Premier lead sous 7 jours',
    text: 'Votre fiche est publi\u00e9e sur ServicesArtisans. Les demandes de devis dans votre zone et votre m\u00e9tier vous sont envoy\u00e9es en exclusivit\u00e9.',
  },
  {
    name: 'Chantier CEE \u00e9ligible ? On g\u00e8re',
    text: "Pour chaque chantier \u00e9ligible aux primes CEE, on monte le dossier complet : attestation sur l'honneur, pi\u00e8ces justificatives, soumission au d\u00e9l\u00e9gataire. Vous n'avez rien \u00e0 faire.",
  },
]

const COMPARISONS = [
  {
    label: 'Leads exclusifs',
    us: true,
    them: false,
    detail: '1 lead = 1 artisan',
    detailThem: 'Partag\u00e9 entre 3 \u00e0 10 artisans',
  },
  {
    label: 'Co\u00fbt mensuel',
    us: true,
    them: false,
    detail: '0 \u20ac (phase de lancement)',
    detailThem: '70 \u00e0 220 \u20ac/mois (Habitatpresto)',
  },
  {
    label: 'Engagement',
    us: true,
    them: false,
    detail: 'Z\u00e9ro engagement',
    detailThem: '6 \u00e0 12 mois',
  },
  {
    label: 'Gestion primes CEE',
    us: true,
    them: false,
    detail: 'Montage dossier inclus',
    detailThem: 'Non propos\u00e9',
  },
  {
    label: 'Fiche artisan enrichie',
    us: true,
    them: false,
    detail: 'Avis, qualifs RGE, portfolio',
    detailThem: 'Nom + t\u00e9l\u00e9phone uniquement',
  },
  {
    label: 'Donn\u00e9es ADEME int\u00e9gr\u00e9es',
    us: true,
    them: false,
    detail: 'Qualifications RGE v\u00e9rifi\u00e9es automatiquement',
    detailThem: 'D\u00e9claratif',
  },
]

const ELIGIBLE_OPERATIONS = [
  {
    code: 'BAR-TH-171',
    nom: 'Pompe \u00e0 chaleur air/eau',
    prime: '2 500 \u00e0 5 000 \u20ac',
  },
  {
    code: 'BAR-TH-172',
    nom: 'Pompe \u00e0 chaleur eau/eau',
    prime: '2 500 \u00e0 5 000 \u20ac',
  },
  {
    code: 'BAR-EN-101',
    nom: 'Isolation des combles perdus',
    prime: '900 \u00e0 2 700 \u20ac',
  },
  {
    code: 'BAR-EN-103',
    nom: 'Isolation des planchers bas',
    prime: '900 \u00e0 2 700 \u20ac',
  },
  {
    code: 'BAR-TH-113',
    nom: 'Chaudi\u00e8re biomasse',
    prime: '2 500 \u00e0 5 500 \u20ac',
  },
  {
    code: 'BAR-TH-112',
    nom: 'Po\u00eale \u00e0 bois / granul\u00e9s',
    prime: '800 \u00e0 2 000 \u20ac',
  },
]

const FAQS = [
  {
    question: 'Qui peut devenir partenaire CEE sur ServicesArtisans\u00a0?',
    answer:
      "Tout artisan ou entreprise du b\u00e2timent disposant d'une qualification RGE active (Qualibat, Qualit'EnR, Qualifelec ou \u00e9quivalent) et d'une assurance d\u00e9cennale \u00e0 jour. Pas de condition d'anciennet\u00e9 ni de chiffre d'affaires minimum.",
  },
  {
    question: 'Combien co\u00fbte le programme partenaire\u00a0?',
    answer:
      "0 \u20ac pendant la phase de lancement. Aucun abonnement, aucune commission, aucun engagement. L'objectif est de prouver la valeur du service avant toute mon\u00e9tisation. \u00c0 terme, la commission sur les primes CEE sera de 10 \u00e0 15\u00a0% du montant de la prime, jamais pr\u00e9lev\u00e9e sur le devis de l'artisan.",
  },
  {
    question: 'Que signifie \u00ab\u00a0leads exclusifs\u00a0\u00bb concr\u00e8tement\u00a0?',
    answer:
      "Chaque demande de devis est envoy\u00e9e \u00e0 un seul artisan. Pas 3, pas 5, pas 10. Un seul. C'est notre r\u00e8gle non-n\u00e9gociable. Vous ne perdez plus de temps en comp\u00e9tition avec d'autres artisans sur le m\u00eame prospect.",
  },
  {
    question: 'Comment fonctionne la gestion des primes CEE\u00a0?',
    answer:
      "Apr\u00e8s chaque chantier \u00e9ligible, vous nous transmettez la facture et les pi\u00e8ces (attestation sur l'honneur, photos avant/apr\u00e8s). On monte le dossier complet, on le soumet au d\u00e9l\u00e9gataire CEE et on suit le traitement jusqu'au paiement. Vous recevez la prime sur votre compte, d\u00e9duction faite de la commission (0\u00a0% en phase de lancement).",
  },
  {
    question: 'Quelles qualifications RGE sont accept\u00e9es\u00a0?',
    answer:
      "Toutes les qualifications RGE d\u00e9livr\u00e9es par un organisme accr\u00e9dit\u00e9 COFRAC : Qualibat (5911, 7131, 7141, 8611...), Qualit'EnR (QualiPAC, QualiBois, QualiSol...), Qualifelec (RGE SER, RGE PV, IRVE). Votre qualification est v\u00e9rifi\u00e9e automatiquement via la base officielle ADEME.",
  },
  {
    question: 'Combien de temps pour recevoir mon premier lead\u00a0?',
    answer:
      'Apr\u00e8s validation de votre profil (24 \u00e0 48h), votre fiche est publi\u00e9e et vous commencez \u00e0 recevoir des demandes de devis. Le d\u00e9lai d\u00e9pend de votre zone g\u00e9ographique et de votre m\u00e9tier, mais la plupart des artisans re\u00e7oivent leur premier lead dans les 7 jours.',
  },
  {
    question: 'Puis-je arr\u00eater \u00e0 tout moment\u00a0?',
    answer:
      'Oui, z\u00e9ro engagement. Vous pouvez d\u00e9sactiver votre compte partenaire \u00e0 tout moment depuis votre espace artisan. Pas de p\u00e9nalit\u00e9, pas de frais de r\u00e9siliation, pas de pr\u00e9avis.',
  },
  {
    question: 'Quelle diff\u00e9rence avec Effy, Hellio ou Habitatpresto\u00a0?',
    answer:
      "Trois diff\u00e9rences majeures. 1) Leads exclusifs : chez nous, 1 demande = 1 artisan. Chez eux, le m\u00eame lead est partag\u00e9 entre 3 \u00e0 10 artisans. 2) Ind\u00e9pendance : vous gardez votre marque, vos clients, votre identit\u00e9. Vous n'\u00eates pas un sous-traitant anonyme. 3) Transparence : suivi temps r\u00e9el de vos dossiers, pas de bo\u00eete noire.",
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
    name: 'Devenir partenaire CEE — ServicesArtisans',
    url: `${SITE_URL}${path}`,
    inLanguage: 'fr-FR',
    description:
      'Programme partenaire CEE pour artisans RGE : leads exclusifs, gestion des primes \u00e9nergie, z\u00e9ro engagement.',
    publisher: { '@type': 'Organization', name: 'ServicesArtisans' },
  }

  return (
    <main className="min-h-screen bg-white">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={articleSchema} />
      {faqSchema && <JsonLd data={faqSchema} />}

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
            <Link
              href="/inscription"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 text-white font-semibold shadow-lg hover:bg-emerald-500 transition"
            >
              Rejoindre le programme
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <a
              href="tel:+33756872787"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-emerald-400/30 text-emerald-100 font-semibold hover:bg-emerald-800/40 transition"
            >
              <Phone className="w-4 h-4" aria-hidden="true" />
              Nous appeler
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            {[
              { value: '60\u00a0000+', label: 'artisans RGE r\u00e9f\u00e9renc\u00e9s' },
              { value: '19', label: 'op\u00e9rations CEE couvertes' },
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
      {/*  SIMULATEUR DE REVENUS (teaser)                               */}
      {/* ============================================================ */}
      <section className="bg-gradient-to-r from-emerald-50 to-emerald-100/60 border-y border-emerald-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center">
              <Euro className="w-7 h-7 text-white" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <h2 className="font-heading text-2xl font-extrabold text-charcoal-900 mb-2">
                Combien pouvez-vous gagner en primes CEE&nbsp;?
              </h2>
              <p className="text-charcoal-600 leading-relaxed max-w-2xl">
                Exemple&nbsp;: un chauffagiste RGE qui installe 4 pompes à chaleur par mois peut
                générer <strong>10&nbsp;000 à 20&nbsp;000&nbsp;€/mois</strong> de primes CEE pour
                ses clients, tout en améliorant son taux de conversion. Le simulateur de revenus
                artisan arrive bientôt.
              </p>
            </div>
            <Link
              href="/simulateur-prime-cee"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 text-white font-semibold shadow-lg hover:bg-emerald-700 transition whitespace-nowrap"
            >
              Simuler une prime
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
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
            <Link
              href="/inscription"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-emerald-800 font-semibold shadow-lg hover:bg-emerald-50 transition"
            >
              Rejoindre le programme
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              href="/cee"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-emerald-300/50 bg-emerald-800/40 text-white font-semibold hover:bg-emerald-800/60 transition"
            >
              Découvrir les primes CEE
            </Link>
            <Link
              href="/rge/comment-devenir-rge"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-emerald-300/50 bg-emerald-800/40 text-white font-semibold hover:bg-emerald-800/60 transition"
            >
              Obtenir la qualification RGE
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
