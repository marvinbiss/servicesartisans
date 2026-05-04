/**
 * Page : /renovation-energetique/travaux/isolation/exterieure-ite
 *
 * KW cibles (re-validés Ahrefs Bloc 1 v3, snapshot 2026-05-04, country=fr) :
 * - "isolation exterieur"          → 14 000 vol, KD 2 (france-renov.gouv.fr #1 — JACKPOT)
 * - "isolation par l'extérieur"    → 12 000 vol, KD 2 (effy.fr #1)
 * - "isolation exterieure"         → 678 vol, KD 4 (longue traîne)
 * - "isolation par exterieur"      → 533 vol, KD 2
 * - "ite isolation"                → 502 vol, KD 6
 * - "isolation murs exterieurs"    → 150 vol, KD 12
 * - "ite prix"                     → 90 vol, KD 5
 * - Cluster ITE : 159 KW vol cumulé 64 610/mo, KD moyen 6.1 (Bloc 1)
 *
 * Source : audit Ahrefs Bloc 1 v3 (cf docs/ahrefs-bloc1-keywords-gap-2026-05-04.md)
 *          + fusion stratégique docs/STRATEGIE-RENOVATION-ENERGETIQUE-V2-FUSED-2026-05-04.md
 * Easy win : OUI MEGA — KD 2 sur head term 14K vol, France-Renov dominant (gov), Effy challenger.
 *            Atout SA : focus prix marché 2026 + comparatif bardage/enduit/vêture + RGE Qualibat 7141.
 * Cluster pillar : Rénovation Énergétique → Travaux → Isolation → ITE
 *
 * Anti-cannibalisation :
 *   - Source guide /guides/isolation-ite-iti-rge-aides-2026 (509 lignes ITE/ITI comparatif)
 *   - Cette page = HUB ITE (techniques bardage/enduit/vêture, prix, aides 75 €/m², ABF)
 *
 * Enrichissement 2026-05-04 :
 *   - Mise à jour MODIFIED + LastUpdated
 *   - Re-confirmation KW Bloc 1 réelle (vol 14K + 12K sur 2 variants head)
 *   - Lien sortant vers hub VMC ajouté (synergie post-isolation)
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Layers,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Calculator,
  Home,
  Brush,
  Building2,
  Scale,
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

const PAGE_PATH = '/renovation-energetique/travaux/isolation/exterieure-ite'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-04'
const MODIFIED = '2026-05-04'
const AUTHOR_SLUG = 'isabelle-renault'
const AUTHOR_NAME = 'Isabelle Renault'

const TITLE = 'ITE isolation extérieure 2026 : prix m²'
const DESCRIPTION =
  'ITE 2026 : 120-250 €/m² posée selon technique (bardage, enduit, vêture). Aides MPR jusquà 75 €/m² + CEE. RGE Qualibat 7141 obligatoire.'

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
    name: 'Enduit sur isolant',
    icon: Brush,
    prix: '120 à 180 €/m² posée',
    description:
      'Panneaux isolants (PSE, laine de roche, fibre de bois) collés/chevillés sur la façade, recouverts d’enduit minéral ou organique.',
    avantages: 'Solution la plus répandue, esthétique uniforme, rénovation simple façades planes',
    inconvenients: 'Sensibilité aux chocs, fissures possibles si mauvaise mise en œuvre',
  },
  {
    name: 'Bardage rapporté',
    icon: Layers,
    prix: '180 à 250 €/m² posée',
    description:
      'Isolant + lame d’air ventilée + bardage de finition (bois, métal, fibrociment, PVC). Système ventilé.',
    avantages: 'Évacue l’humidité, esthétique modulable, durabilité 30-50 ans',
    inconvenients: 'Coût supérieur, pose technique, déclaration ABF souvent nécessaire',
  },
  {
    name: 'Vêture / vêtage',
    icon: Building2,
    prix: '160 à 220 €/m² posée',
    description:
      'Panneaux préfabriqués (isolant + parement) fixés mécaniquement. Compromis entre enduit et bardage.',
    avantages: 'Rapidité de pose, bonne performance, parements variés',
    inconvenients: 'Joints visibles, moins esthétique que bardage haute gamme',
  },
]

const AIDES_BAREME = [
  { profil: 'Très modestes (bleu)', mpr: '75 €/m²', cee: '25 €/m²', cumul: '100 €/m²' },
  { profil: 'Modestes (jaune)', mpr: '60 €/m²', cee: '25 €/m²', cumul: '85 €/m²' },
  { profil: 'Intermédiaires (violet)', mpr: '40 €/m²', cee: '20 €/m²', cumul: '60 €/m²' },
  { profil: 'Supérieurs (rose)', mpr: '15 €/m²', cee: '15 €/m²', cumul: '30 €/m²' },
]

const tldr = [
  'ITE 2026 : 120-250 €/m² posée selon technique (enduit, bardage, vêture).',
  'Solution n°1 pour éliminer 100 % des ponts thermiques sans perdre de surface intérieure.',
  'Aides cumulables jusqu’à 100 €/m² (très modestes) : MaPrimeRénov’ 75 €/m² + Coup de pouce CEE 25 €/m².',
  'Artisan RGE Qualibat 5911 obligatoire pour toucher les aides + TVA 5,5 %.',
  'Déclaration préalable de travaux requise (modifie l’aspect extérieur). PLU et ABF à vérifier en amont.',
]

const faqs = [
  {
    question: 'Quel est le prix de l’ITE en 2026 ?',
    answer:
      'Pour une maison individuelle : 120 €/m² en enduit sur isolant (entrée de gamme), 160-220 €/m² en vêture, 180-250 €/m² en bardage rapporté (haut de gamme). Sur 100 m² de façade à isoler : 12 000-25 000 € TTC posée. Avec MaPrimeRénov’ 75 €/m² + CEE 25 €/m² (très modestes) = 10 000 € d’aides, reste à charge ~8 000-15 000 €.',
  },
  {
    question: 'ITE ou ITI : laquelle choisir ?',
    answer:
      'ITE (extérieure) si : façade à ravaler, volonté d’éliminer 100 % des ponts thermiques, pas de perte surface intérieure, projet rénovation énergétique d’ampleur (Parcours accompagné MPR). ITI (intérieure) si : façade ne peut être modifiée (PLU, ABF, copropriété), budget plus serré, travaux par étapes pièce par pièce. L’ITE est privilégiée par les aides MPR (75 €/m² vs 25 €/m² ITI).',
  },
  {
    question: 'Quelle technique ITE choisir ?',
    answer:
      'Enduit sur isolant : solution la plus répandue (60 % du marché), prix entrée de gamme, esthétique uniforme. Bardage rapporté : haut de gamme, performance ventilée, esthétique modulable (bois, métal), durée 30-50 ans. Vêture : compromis prix/perf, rapidité de pose. Le choix dépend de l’architecture (façade plane = enduit, façade modulée = bardage), du PLU et de l’avis de l’ABF si bâtiment classé.',
  },
  {
    question: 'L’ITE nécessite-t-elle une autorisation administrative ?',
    answer:
      'Oui systématiquement : déclaration préalable de travaux (DP) en mairie (formulaire Cerfa n°13404). Délai d’instruction 1 mois (2 si zone protégée ABF). Possible refus si PLU restrictif (zones pavillonnaires homogènes), centre historique, abords monument classé. Vérifier en amont. En copropriété : autorisation AG copropriétaires + délibération.',
  },
  {
    question: 'Combien d’aides 2026 sur l’ITE ?',
    answer:
      'Pour très modestes (bleu) : MaPrimeRénov’ 75 €/m² + Coup de pouce CEE 25 €/m² = 100 €/m². Sur 100 m² de façade à 150 €/m² (15 000 € TTC posée), vous récupérez 10 000 € d’aides + TVA 5,5 % automatique = ~12 000 € total avantages. Reste à charge ~3 000-5 000 €. Pour un projet « rénovation performante » (gain ≥ 2 classes DPE), MaPrimeRénov’ Parcours accompagné peut aller jusqu’à 70 000 € au total avec d’autres travaux.',
  },
  {
    question: 'Quelle qualification RGE pour mon artisan ITE ?',
    answer:
      'Qualibat 5911 (Isolation Thermique par l’Extérieur). Vérification gratuite sur qualibat.com avec le SIRET. Sans qualification RGE 5911 en cours de validité à la date de signature, vous perdez MaPrimeRénov’, CEE et TVA 5,5 % (soit 30-50 % du coût en plus). Demandez à l’artisan ses 3 derniers chantiers ITE avec photos avant/après.',
  },
  {
    question: 'Quels matériaux isolants pour l’ITE ?',
    answer:
      'PSE (polystyrène expansé) : économique 7-12 €/m², R correct, le plus répandu. Laine de roche : performance + résistance feu + acoustique, 12-18 €/m². Fibre de bois : biosourcée, R/épaisseur correct, 18-25 €/m². Polyuréthane PUR/PIR : performance max par épaisseur (idéal façades étroites), 25-35 €/m². Tous certifiés ACERMI sont éligibles aux aides.',
  },
  {
    question: 'Quelle est la durée de vie d’une ITE ?',
    answer:
      'Enduit sur isolant : 25-40 ans avec entretien (lavage haute pression tous les 5-10 ans, ravalement esthétique tous les 15-20 ans). Bardage rapporté : 30-50 ans selon parement (bois 20-40 ans, métal/fibrociment 50+). L’isolant lui-même conserve ses propriétés ≥ 50 ans s’il n’est pas humidifié.',
  },
]

const sources = [
  { label: 'France Rénov’ — Aides ITE', url: 'https://france-renov.gouv.fr/aides/maprimerenov' },
  { label: 'ADEME — Guide ITE', url: 'https://agir.ademe.fr' },
  { label: 'Qualibat — Annuaire 5911', url: 'https://www.qualibat.com' },
  {
    label: 'Service-Public.fr — Déclaration préalable de travaux',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F17578',
  },
  { label: 'CSTB — Avis Techniques ITE', url: 'https://www.cstb.fr' },
]

const relatedPages = [
  {
    label: 'Hub isolation thermique (3 types)',
    href: '/renovation-energetique/travaux/isolation',
  },
  {
    label: 'Isolation des combles : prix et techniques',
    href: '/renovation-energetique/travaux/isolation/combles',
  },
  {
    label: 'ITI isolation par l’intérieur',
    href: '/renovation-energetique/travaux/isolation/interieure',
  },
  {
    label: 'Guide ITE/ITI/RGE complet 2026',
    href: '/guides/isolation-ite-iti-rge-aides-2026',
  },
  {
    label: 'Qualibat 5911 : label RGE ITE',
    href: '/rge/labels/qualibat',
  },
  {
    label: 'Trouver un artisan ITE RGE',
    href: '/rge/renovation-energetique',
  },
  {
    label: 'Hub VMC',
    href: '/renovation-energetique/travaux/vmc',
    description: 'À installer après isolation lourde (étanchéité air = double flux rentable)',
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
    section: 'Travaux — Isolation — ITE',
    keywords: [
      'isolation extérieure',
      "isolation par l'extérieur",
      'ITE',
      'ITE isolation',
      'isolation murs extérieurs',
      'ITE prix',
      'isolation thermique extérieure',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Isolation', url: '/renovation-energetique/travaux/isolation' },
    { name: 'ITE extérieure', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const financialSchema = getFinancialProductSchema({
    name: 'Aides ITE isolation extérieure 2026',
    description:
      'Cumul MaPrimeRénov’ (jusqu’à 75 €/m²) + Coup de pouce CEE Isolation pour l’ITE par un artisan RGE Qualibat 5911.',
    url: PAGE_URL,
    category: 'Government Grant',
    amount: 'Jusqu’à 100 €/m² (cumul MPR + CEE) selon revenus',
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
              { label: 'ITE extérieure' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Home className="w-3.5 h-3.5" aria-hidden />
              Isolation &middot; ITE par l’extérieur
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              ITE isolation par l’extérieur en 2026 : prix et aides
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              L’<strong>ITE (Isolation Thermique par l’Extérieur)</strong> consiste à envelopper les
              murs extérieurs d’un manteau isolant pour éliminer 100 % des ponts thermiques sans
              perdre de surface intérieure. Comptez <strong>120 à 250 €/m² posée</strong> selon la
              technique (enduit, bardage, vêture). Aides MaPrimeRénov’ jusqu’à
              <strong> 75 €/m²</strong> + Coup de pouce CEE 25 €/m² = 100 €/m² pour les très
              modestes.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Qu’est-ce que l’ITE ?</h2>
            <p>
              L’<strong>Isolation Thermique par l’Extérieur</strong> consiste à fixer un isolant sur
              la face extérieure des murs, recouvert d’un parement de finition (enduit, bardage,
              vêture). Le mur intérieur reste intact, ce qui évite les travaux dans le logement. La
              maison est totalement enveloppée, ce qui élimine 100 % des ponts thermiques (jonctions
              plancher/mur, balcons, refends).
            </p>

            <h2 id="techniques">Les 3 techniques d’ITE</h2>
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
                Plafond ITE 2026 : 100 m² éligibles MaPrimeRénov’ par logement. Vérifier sur
                france-renov.gouv.fr.
              </p>
            </div>

            <h2 id="autorisation">Déclaration préalable de travaux obligatoire</h2>
            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <Scale className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <div className="text-sm text-amber-900">
                <p className="font-semibold m-0 mb-1">3 vérifications avant signature</p>
                <ol className="m-0 mt-2 space-y-1 list-decimal list-inside">
                  <li>
                    <strong>PLU local</strong> : couleurs, matériaux et finitions autorisés (mairie
                    ou urbanisme.gouv.fr)
                  </li>
                  <li>
                    <strong>Zone ABF</strong> : si bâtiment ≤ 500 m d’un monument classé,
                    consultation Architectes des Bâtiments de France (délai +2 mois)
                  </li>
                  <li>
                    <strong>Copropriété</strong> : autorisation AG copropriétaires (majorité 2/3) +
                    résolution copropriété
                  </li>
                </ol>
                <p className="m-0 mt-2">
                  Délai d’instruction DP : 1 mois (2 mois en zone ABF). Travaux ne peuvent démarrer
                  avant l’accord.
                </p>
              </div>
            </div>

            <h2 id="performance">Performance R minimum pour les aides</h2>
            <ul>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>R ≥ 3,7 m².K/W</strong> pour murs extérieurs (équivaut à 12-14 cm d’isolant
                performant)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Sans atteindre ce seuil : aides refusées
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Mention R en m².K/W obligatoire sur le devis (et marquage ACERMI sur l’isolant)
              </li>
            </ul>

            <h2 id="rge">RGE Qualibat 5911 obligatoire</h2>
            <p>
              Pour bénéficier de MaPrimeRénov’, du Coup de pouce CEE et de la TVA 5,5 %, l’artisan
              doit être titulaire de la qualification{' '}
              <Link href="/rge/labels/qualibat">Qualibat 5911 RGE</Link> (Isolation Thermique par
              l’Extérieur) en cours de validité à la date de signature du devis. Vérification
              gratuite en 30 secondes sur qualibat.com.
            </p>

            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <div className="text-sm text-amber-900">
                <p className="font-semibold m-0 mb-1">Demandez 3 références chantier</p>
                <p className="m-0">
                  L’ITE est techniquement délicate : un défaut de pose peut entraîner fissures,
                  infiltrations, perte d’isolation. Demandez à l’artisan 3 chantiers ITE réalisés
                  (photos avant/après + coordonnées clients pour références).
                </p>
              </div>
            </div>

            <h2 id="economies">Économies sur la facture chauffage</h2>
            <ul>
              <li>ITE seule sur maison non isolée : -15 à -20 % de la facture chauffage</li>
              <li>ITE + isolation combles (bouquet) : -35 à -45 % de la facture</li>
              <li>ROI typique ITE : 12-18 ans avec aides cumulées</li>
              <li>Bonus DPE : +1 à +2 classes (passage E → C ou D)</li>
              <li>Valorisation à la revente : +5 à +10 % du prix du bien</li>
            </ul>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Demandez 3 devis ITE Qualibat 5911
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    3 artisans ITE Qualibat 5911 vérifiés vous répondent sous 48h. Devis détaillé +
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
              href="/renovation-energetique/travaux/isolation/combles"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Combles
            </Link>
            <Link
              href="/renovation-energetique/travaux/isolation/interieure"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ITI intérieure → <ShieldCheck className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
