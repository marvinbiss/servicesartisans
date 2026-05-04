/**
 * Page : /renovation-energetique/travaux/isolation/interieure
 *
 * KW cibles (validés Ahrefs API live, snapshot 2026-05-03, country=fr) :
 * - "isolation interieure"        → 248 vol, KD 2, CPC $0,70, clicks 363 ⭐
 * - "isolation murs"              → 233 vol, KD 1, CPC $0,30 (longue traîne)
 * - "iti isolation"               → 150 vol, KD 1, CPC $0,50
 * - "isolation murs interieurs"   → 90 vol, KD 1, CPC $0,25
 * - Famille cumulée pivot : ~720 vol/mois (KD 1-2 ultra easy mais vol modéré)
 *
 * Source : audit Ahrefs API live. Easy win KD 1-2 mais vol modéré.
 * Easy win : OUI (KD ≤ 2, vol cumulé ~720)
 * Cluster pillar : Rénovation Énergétique → Travaux → Isolation → ITI
 *
 * Anti-cannibalisation :
 *   - Source guide /guides/isolation-ite-iti-rge-aides-2026 (509 lignes ITE/ITI comparatif)
 *   - Source guide /guides/isolation-exterieure-vs-interieure (comparatif)
 *   - Cette page = HUB ITI (techniques doublage, prix, aides 25-40 €/m², avantages copro)
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Snowflake,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Calculator,
  Home,
  Layers,
  Building2,
} from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import LastUpdated from '@/components/seo/LastUpdated'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import { getBreadcrumbSchema, getFAQSchema, getFinancialProductSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'

export const revalidate = 86400

const PAGE_PATH = '/renovation-energetique/travaux/isolation/interieure'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-04'
const MODIFIED = '2026-05-04'
const AUTHOR_SLUG = 'isabelle-renault'
const AUTHOR_NAME = 'Isabelle Renault'

const TITLE = 'ITI isolation intérieure 2026 : prix m²'
const DESCRIPTION =
  'ITI 2026 : 35-80 €/m² posée (doublage collé, ossature). Plus accessible que lITE, perd 7-15 cm habitable. Aides MPR + CEE jusquà 37 €/m².'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: getAlternates(PAGE_PATH),
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: 'article',
    siteName: SITE_NAME,
    publishedTime: PUBLISHED,
    modifiedTime: MODIFIED,
    authors: [`${SITE_URL}/equipe/${AUTHOR_SLUG}`],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const TECHNIQUES = [
  {
    name: 'Doublage collé (PSE ou laine + plâtre)',
    icon: Layers,
    prix: '40 à 60 €/m² posé',
    description:
      'Panneaux préfabriqués (isolant + parement BA13) collés directement sur le mur intérieur. Solution rapide en pièces vides.',
    avantages: 'Pose rapide (1-2 jours pour 40 m²), peu de perte de surface (8-10 cm)',
    inconvenients:
      'Pas de passage de gaines, ponts thermiques aux jonctions, mur intérieur doit être plan',
  },
  {
    name: 'Ossature métallique + isolant',
    icon: Building2,
    prix: '60 à 80 €/m² posé',
    description:
      'Rails métalliques posés à 5-10 cm du mur, isolant entre rails, parement BA13. Permet de passer gaines électriques et plomberie.',
    avantages:
      'Passage facile gaines, traitement humidité possible (pare-vapeur), épaisseur modulable',
    inconvenients: 'Perte de surface 10-15 cm, pose plus longue (3-4 jours pour 40 m²)',
  },
  {
    name: 'Insufflation (mur creux uniquement)',
    icon: Snowflake,
    prix: '30 à 50 €/m² posé',
    description:
      'Injection d’isolant en vrac (laine minérale, ouate de cellulose) dans la cavité d’un mur double-paroi.',
    avantages: 'Pas de perte de surface intérieure, rapide, peu invasif',
    inconvenients:
      'Limité aux murs creux (briques creuses, parpaings), R limité par épaisseur cavité',
  },
]

const AIDES_BAREME = [
  { profil: 'Très modestes (bleu)', mpr: '25 €/m²', cee: '15 €/m²', cumul: '40 €/m²' },
  { profil: 'Modestes (jaune)', mpr: '20 €/m²', cee: '15 €/m²', cumul: '35 €/m²' },
  { profil: 'Intermédiaires (violet)', mpr: '15 €/m²', cee: '12 €/m²', cumul: '27 €/m²' },
  { profil: 'Supérieurs (rose)', mpr: '7 €/m²', cee: '12 €/m²', cumul: '19 €/m²' },
]

const tldr = [
  'ITI isolation par l’intérieur 2026 : 40-80 €/m² posée selon technique (doublage collé ou ossature métallique).',
  'Solution alternative à l’ITE quand façade ne peut être modifiée (PLU, ABF, copropriété, budget).',
  'Aides cumulables jusqu’à 40 €/m² (très modestes) : MaPrimeRénov’ 25 €/m² + Coup de pouce CEE 15 €/m².',
  'Artisan RGE Qualibat 5912 obligatoire pour toucher les aides + TVA 5,5 %.',
  'Inconvénient : perte 8-15 cm sur surface intérieure + ne traite pas tous les ponts thermiques.',
]

const faqs = [
  {
    question: 'Quel est le prix de l’ITI en 2026 ?',
    answer:
      'Pour du doublage collé : 40-60 €/m² TTC posé. Pour de l’ossature métallique avec isolant : 60-80 €/m². Pour de l’insufflation dans mur creux : 30-50 €/m². Sur 100 m² de murs intérieurs à 50 €/m² (doublage collé) = 5 000 € TTC. Avec MaPrimeRénov’ 25 €/m² + CEE 15 €/m² (très modestes) = 4 000 € d’aides. Reste à charge ~1 000 €.',
  },
  {
    question: 'ITI ou ITE : quels critères pour choisir ?',
    answer:
      'Préférer ITI quand : façade ne peut être modifiée (PLU restrictif, zone ABF, refus copropriété), budget plus serré (40-80 €/m² ITI vs 120-250 €/m² ITE), travaux par étapes pièce par pièce. Préférer ITE quand : ravalement façade prévu, volonté d’éliminer 100 % des ponts thermiques, conserver surface intérieure intacte, projet rénovation énergétique d’ampleur (Parcours accompagné MPR).',
  },
  {
    question: 'Quelle technique ITI choisir ?',
    answer:
      'Doublage collé : solution rapide en pièces vides (rénovation lourde), prix entrée de gamme, mais ponts thermiques aux jonctions. Ossature métallique : permet de passer gaines électriques + plomberie + pare-vapeur, idéal pour traiter humidité, mais plus coûteux et perte 10-15 cm. Insufflation : seulement si murs creux (briques creuses, parpaings ventilés), R limité par épaisseur cavité existante.',
  },
  {
    question: 'Quelle perte de surface avec l’ITI ?',
    answer:
      '8-12 cm pour le doublage collé (panneau préfabriqué). 10-15 cm pour l’ossature métallique. Sur une pièce 4 × 4 m = 16 m², perte ~1 m² par mur traité. Si vous traitez 4 murs : -4 m² sur 16 m² = -25 % de surface utile. Solution : ne traiter que les murs en contact avec l’extérieur (pas les murs mitoyens intérieurs).',
  },
  {
    question: 'Combien d’aides 2026 sur l’ITI ?',
    answer:
      'Pour très modestes (bleu) : MaPrimeRénov’ 25 €/m² + Coup de pouce CEE 15 €/m² = 40 €/m². Sur 100 m² de murs à 50 €/m² (5 000 €), vous récupérez 4 000 € d’aides. TVA 5,5 % automatique = ~250 € d’économie supplémentaire. Reste à charge ~1 000-1 500 €. Pour intermédiaires/supérieurs : reste à charge 50-70 % du devis.',
  },
  {
    question: 'Quelle qualification RGE pour mon artisan ITI ?',
    answer:
      'Qualibat 5912 (Isolation Thermique par l’Intérieur). Vérification gratuite sur qualibat.com avec le SIRET. Sans qualification RGE 5912 en cours de validité à la date de signature, vous perdez MaPrimeRénov’, CEE et TVA 5,5 % (soit 30-40 % du coût en plus).',
  },
  {
    question: 'L’ITI traite-t-elle les ponts thermiques ?',
    answer:
      'Partiellement seulement. L’ITI ne traite PAS les ponts thermiques aux jonctions plancher/mur (refends), balcons, dalles intermédiaires. Ces zones restent froides et peuvent générer condensation + moisissures locales. Pour éliminer 100 % des ponts thermiques, l’ITE est nécessaire. Compromis : ITI + traitement spécifique des ponts thermiques (rupteurs thermiques, cornières isolantes).',
  },
  {
    question: 'Faut-il un pare-vapeur en ITI ?',
    answer:
      'Oui systématiquement, sauf cas spécifique (matériau biosourcé perspirant + mur ancien à pierre apparente). Le pare-vapeur empêche la vapeur d’eau des pièces de vie (cuisine, SDB) de migrer dans l’isolant et de condenser dans la paroi (point de rosée). Sans pare-vapeur, risque humidité + détérioration isolant à 5-10 ans. La pose du pare-vapeur est OBLIGATOIRE selon DTU 25.41.',
  },
]

const sources = [
  { label: 'France Rénov’ — Aides ITI', url: 'https://france-renov.gouv.fr/aides/maprimerenov' },
  { label: 'ADEME — Guide isolation murs', url: 'https://agir.ademe.fr' },
  { label: 'Qualibat — Annuaire 5912', url: 'https://www.qualibat.com' },
  { label: 'CSTB — DTU 25.41 plâtrerie', url: 'https://www.cstb.fr' },
  { label: 'ACERMI — Certification isolants', url: 'https://www.acermi.com' },
]

const relatedPages = [
  {
    label: 'Hub isolation thermique (3 types)',
    href: '/renovation-energetique/travaux/isolation',
  },
  {
    label: 'ITE isolation par l’extérieur',
    href: '/renovation-energetique/travaux/isolation/exterieure-ite',
  },
  {
    label: 'Isolation des combles : prix et techniques',
    href: '/renovation-energetique/travaux/isolation/combles',
  },
  {
    label: 'Comparatif ITE vs ITI complet',
    href: '/guides/isolation-exterieure-vs-interieure',
  },
  {
    label: 'Guide ITE/ITI/RGE complet 2026',
    href: '/guides/isolation-ite-iti-rge-aides-2026',
  },
  {
    label: 'Trouver un artisan ITI RGE',
    href: '/rge/renovation-energetique',
  },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: PAGE_PATH,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Travaux — Isolation — ITI',
    keywords: [
      'isolation intérieure',
      'ITI',
      'ITI isolation',
      'isolation murs',
      'isolation murs intérieurs',
      'doublage isolant',
      'aides ITI',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Isolation', url: '/renovation-energetique/travaux/isolation' },
    { name: 'ITI intérieure', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const financialSchema = getFinancialProductSchema({
    name: 'Aides ITI isolation intérieure 2026',
    description:
      'Cumul MaPrimeRénov’ (jusqu’à 25 €/m²) + Coup de pouce CEE Isolation pour l’ITI par un artisan RGE Qualibat 5912.',
    url: PAGE_URL,
    category: 'Government Grant',
    amount: 'Jusqu’à 40 €/m² (cumul MPR + CEE) selon revenus',
  })
  const schemas = [articleSchema, breadcrumbSchema, faqSchema, financialSchema].filter(
    (s): s is Record<string, unknown> => s !== null
  )

  return (
    <>
      <JsonLd data={schemas} />
      <div className="bg-sand-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Breadcrumb
            items={[
              { label: 'Rénovation énergétique', href: '/renovation-energetique' },
              { label: 'Isolation', href: '/renovation-energetique/travaux/isolation' },
              { label: 'ITI intérieure' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Home className="w-3.5 h-3.5" aria-hidden />
              Isolation &middot; ITI par l’intérieur
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              ITI isolation par l’intérieur en 2026 : prix et aides
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              L’<strong>ITI (Isolation Thermique par l’Intérieur)</strong> consiste à doubler les
              murs intérieurs avec un isolant + un parement BA13. Solution alternative à l’ITE quand
              la façade ne peut être modifiée (PLU, ABF, copropriété) ou pour un budget plus serré.
              Comptez <strong>40 à 80 €/m² posée</strong> selon technique. Aides MaPrimeRénov’ + CEE
              jusqu’à 40 €/m² (très modestes).
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Qu’est-ce que l’ITI ?</h2>
            <p>
              L’<strong>Isolation Thermique par l’Intérieur</strong> consiste à fixer un isolant sur
              la face intérieure des murs en contact avec l’extérieur, recouvert d’un parement de
              finition (plaque de plâtre BA13). Solution la plus accessible financièrement et
              techniquement (40-80 €/m² vs 120-250 €/m² pour l’ITE), elle est privilégiée quand la
              façade ne peut pas être modifiée (PLU restrictif, ABF, accord copropriété refusé) ou
              pour un budget plus contraint.
            </p>

            <h2 id="techniques">Les 3 techniques d’ITI</h2>
            <div className="not-prose grid gap-4 my-6">
              {TECHNIQUES.map((t) => {
                const Icon = t.icon
                return (
                  <div key={t.name} className="bg-white border border-sand-200 rounded-xl p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-700 grid place-items-center shrink-0">
                        <Icon className="w-5 h-5" aria-hidden />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-heading text-lg font-semibold text-sand-900 m-0">
                          {t.name}
                        </h3>
                        <p className="text-sm font-semibold text-primary-700 m-0 mt-1">{t.prix}</p>
                      </div>
                    </div>
                    <p className="text-sm text-sand-700 mb-3">{t.description}</p>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div>
                        <dt className="font-semibold text-sand-700">Avantages</dt>
                        <dd className="m-0 text-sand-900">{t.avantages}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-sand-700">Limites</dt>
                        <dd className="m-0 text-sand-900">{t.inconvenients}</dd>
                      </div>
                    </dl>
                  </div>
                )
              })}
            </div>

            <h2 id="aides">Aides 2026 : combien récupérer</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Profil revenus</th>
                    <th className="p-3 border-b border-sand-200">MaPrimeRénov’</th>
                    <th className="p-3 border-b border-sand-200">Coup de pouce CEE</th>
                    <th className="p-3 border-b border-sand-200">Cumul</th>
                  </tr>
                </thead>
                <tbody>
                  {AIDES_BAREME.map((row) => (
                    <tr key={row.profil} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold">{row.profil}</td>
                      <td className="p-3">{row.mpr}</td>
                      <td className="p-3">{row.cee}</td>
                      <td className="p-3 font-semibold text-primary-800">{row.cumul}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Plafond ITI 2026 : 100 m² éligibles MaPrimeRénov’ par logement.
              </p>
            </div>

            <h2 id="performance">Performance R minimum pour les aides</h2>
            <ul>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>R ≥ 3,7 m².K/W</strong> pour murs intérieurs (équivaut à 12-14 cm d’isolant
                performant)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Pare-vapeur OBLIGATOIRE</strong> côté intérieur (DTU 25.41) sauf cas
                spécifique
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Sans atteindre R ≥ 3,7 : aides refusées
              </li>
            </ul>

            <h2 id="ponts-thermiques">Limite : ponts thermiques non traités</h2>
            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <div className="text-sm text-amber-900">
                <p className="font-semibold m-0 mb-1">Ponts thermiques non traités par l’ITI</p>
                <p className="m-0">
                  L’ITI ne traite PAS les ponts thermiques aux jonctions plancher/mur (refends),
                  balcons, dalles intermédiaires. Ces zones restent froides et peuvent générer
                  condensation + moisissures locales. Pour éliminer 100 % des ponts thermiques,
                  préférer l’ITE. Compromis ITI : ajout de rupteurs thermiques aux jonctions
                  critiques.
                </p>
              </div>
            </div>

            <h2 id="rge">RGE Qualibat 5912 obligatoire</h2>
            <p>
              Pour bénéficier de MaPrimeRénov’, du Coup de pouce CEE et de la TVA 5,5 %, l’artisan
              doit être titulaire de la qualification{' '}
              <Link href="/rge/labels/qualibat">Qualibat 5912 RGE</Link> (Isolation Thermique par
              l’Intérieur). Vérification gratuite en 30 secondes sur qualibat.com.
            </p>

            <h2 id="economies">Économies sur la facture chauffage</h2>
            <ul>
              <li>ITI seule sur maison non isolée : -10 à -15 % de la facture chauffage</li>
              <li>ITI + isolation combles : -25 à -35 % de la facture</li>
              <li>ROI typique ITI : 8-12 ans avec aides cumulées</li>
              <li>Bonus DPE : +1 classe (passage E → D ou F → E)</li>
            </ul>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Demandez 3 devis ITI Qualibat 5912
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    3 artisans ITI Qualibat 5912 vérifiés vous répondent sous 48h. Devis détaillé +
                    simulation MaPrimeRénov’ + CEE incluse.
                  </p>
                  <Link
                    href="/devis"
                    className="inline-flex items-center gap-1.5 bg-primary-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-800 transition-colors"
                  >
                    Demander 3 devis <ArrowRight className="w-4 h-4" aria-hidden />
                  </Link>
                </div>
              </div>
            </div>
          </article>

          <FlagshipFaq items={faqs} />
          <FlagshipSources sources={sources} />

          <section className="my-10">
            <h2 className="font-heading text-xl font-semibold text-sand-900 mb-4">
              Pour aller plus loin
            </h2>
            <ul className="grid gap-3 md:grid-cols-2">
              {relatedPages.map((g) => (
                <li key={g.href}>
                  <Link
                    href={g.href}
                    className="flex items-center justify-between gap-2 bg-white border border-sand-200 rounded-lg p-4 hover:border-primary-400 hover:shadow-sm transition-all text-sand-800"
                  >
                    <span className="text-sm font-medium">{g.label}</span>
                    <ArrowRight className="w-4 h-4 text-sand-400 shrink-0" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <FlagshipAuthorCard
            authorName={AUTHOR_NAME}
            datePublished={PUBLISHED}
            dateModified={MODIFIED}
          />

          <div className="flex items-center justify-between text-sm text-sand-600 border-t border-sand-200 pt-4 mt-6">
            <Link
              href="/renovation-energetique/travaux/isolation/exterieure-ite"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← ITE extérieure
            </Link>
            <Link
              href="/renovation-energetique/travaux/isolation"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Hub Isolation <ShieldCheck className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
