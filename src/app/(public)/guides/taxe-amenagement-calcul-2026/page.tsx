import type { Metadata } from 'next'
import Link from 'next/link'
import { Calculator, ArrowRight, AlertTriangle, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'taxe-amenagement-calcul-2026'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Claire Dubois'

export const revalidate = 86400

const TITLE = 'Taxe d’aménagement 2026 : calcul'
const DESCRIPTION =
  'Taxe d’aménagement 2026 : valeur forfaitaire 1 036 €/m² (hors IDF), 1 174 € IDF. Taux communal, départemental, régional, exonérations, paiement.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: getAlternates(`/guides/${SLUG}`),
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: 'article',
    siteName: SITE_NAME,
    publishedTime: PUBLISHED,
    modifiedTime: MODIFIED,
    authors: [`${SITE_URL}/equipe/claire-dubois`],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const tldr = [
  'Valeur forfaitaire 2026 : 1 036 €/m² hors IDF, 1 174 €/m² en Île-de-France (indexée INSEE).',
  'Taux communal (1-5 %) + taux départemental (0-2,5 %) + taux régional (0-1 % IDF).',
  'Exemple 30 m² extension maison hors IDF, commune 3 % + dept 1,5 % : 1 398 € de taxe.',
  'Exonérations : abris jardin ≤5 m² (auto), constructions agricoles, reconstructions après sinistre.',
  'Paiement en 2 fois : 50 % à 12 mois après PC/DP, solde à 24 mois. Télédéclaration DGFiP obligatoire.',
]

const faqs = [
  {
    question: 'Comment calcule-t-on la taxe d’aménagement ?',
    answer:
      "Formule : surface de plancher × valeur forfaitaire × (taux communal + taux départemental + taux régional). La surface de plancher = somme des surfaces closes et couvertes, sous hauteur >1,80 m, après déduction de certains éléments (cages d'escaliers, gaines techniques). Les abris de jardin ≤5 m² sont exonérés. Les piscines et panneaux photovoltaïques sont taxés à un taux forfaitaire (262 € ou 10 €/m² en 2026). Le simulateur officiel service-public.fr donne une estimation.",
  },
  {
    question: 'Quels sont les taux appliqués par commune ?',
    answer:
      'Taux communal libre : entre 1 % (minimum légal) et 5 % (standard) voire 20 % dans les secteurs où la commune doit financer des équipements publics (zonage PLU spécifique). Paris : 4 %, Lyon : 2,5 %, Marseille : 5 %, Bordeaux : 3,5 %, Toulouse : 4 %. Taux départemental : 0-2,5 % (IdF souvent 1,5 %, régions souvent 2 %). Taux régional : 0-1 % (uniquement Île-de-France à ce jour). À vérifier en mairie ou sur le PLU communal.',
  },
  {
    question: 'Quelles sont les principales exonérations ?',
    answer:
      "Exonérations de plein droit : abris jardin ≤5 m², constructions agricoles, reconstructions à l'identique après sinistre avec avis assurance, logements sociaux. Exonérations facultatives (délibération commune) : extensions jusqu'à 20 m² en zone U, habitations principales financées par PTZ+, abris 5-20 m², annexes à la résidence principale. Vérifier le PLU et les délibérations municipales. Exonération partielle possible pour constructions économes en énergie (RE2020 A, maisons passives).",
  },
  {
    question: 'Quand faut-il la payer ?',
    answer:
      "Avis de taxation envoyé par la DGFiP 6-12 mois après l'obtention du permis/DP. Paiement en 2 fois : 50 % à 12 mois après délivrance de l'autorisation, solde à 24 mois. Si montant <1 500 € : paiement en 1 fois. Paiement en ligne obligatoire depuis 2023. Retard : majoration 10 % + intérêts 0,20 %/mois. Si les travaux ne sont pas réalisés dans les délais du permis : réclamer remboursement possible avec justificatifs.",
  },
  {
    question: 'La taxe d’aménagement s’applique-t-elle à une rénovation ?',
    answer:
      "Non pour les travaux intérieurs sans création de surface. Oui si création de surface de plancher ≥5 m² : extension, surélévation, aménagement de combles habitables, aménagement garage en pièce à vivre. Aussi sur piscines enterrées (262 €/m²), stationnements non clos (2 000 € par place), panneaux photovoltaïques au sol (10 €/m²). Le simulateur DGFiP (service-public.fr/simulateur-taxe-amenagement) permet d'estimer.",
  },
]

const sources = [
  {
    label: 'Service-public.fr — Taxe d’aménagement',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F23263',
  },
  { label: 'Code de l’urbanisme — Art. L331-1', url: 'https://www.legifrance.gouv.fr' },
  { label: 'Simulateur DGFiP', url: 'https://www.impots.gouv.fr' },
  { label: 'DGALN — Valeur forfaitaire 2026', url: 'https://www.ecologie.gouv.fr' },
]

const relatedGuides = [
  { label: 'Permis de construire', href: '/guides/permis-construire' },
  { label: 'Déclaration préalable travaux', href: '/guides/declaration-prealable-travaux' },
  { label: 'Extension maison', href: '/guides/extension-maison' },
  { label: 'Aménagement combles perdus prix', href: '/guides/amenagement-combles-perdus-prix' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Réglementation',
    keywords: [
      'taxe aménagement calcul',
      'taxe aménagement 2026',
      'valeur forfaitaire',
      'exonération taxe',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Taxe aménagement 2026', url: `/guides/${SLUG}` },
  ])
  const faqSchema = getFAQSchema(faqs)
  const schemas = [articleSchema, breadcrumbSchema, faqSchema].filter(
    (s): s is Record<string, unknown> => s !== null
  )
  return (
    <>
      <JsonLd data={schemas} />
      <div className="bg-sand-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Breadcrumb
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Taxe aménagement 2026' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Calculator className="w-3.5 h-3.5" aria-hidden />
              Réglementation · Guide vérifié
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Taxe d’aménagement 2026 : calcul et exonérations
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Toute création de surface de plancher supérieure à 5 m² déclenche la taxe
              d’aménagement. Valeur forfaitaire, taux communaux, exonérations, paiement — voici ce
              qu’il faut anticiper sur votre budget travaux en 2026.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Valeurs forfaitaires 2026</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Zone</th>
                    <th className="p-3 border-b border-sand-200">Valeur 2026</th>
                    <th className="p-3 border-b border-sand-200">Évolution</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Hors Île-de-France', '1 036 €/m²', '+5,6 % vs 2025'],
                    ['Île-de-France', '1 174 €/m²', '+5,6 % vs 2025'],
                    ['Piscine', '262 €/m²', 'Taux fixe'],
                    ['Panneau solaire sol', '10 €/m²', 'Taux fixe'],
                    ['Stationnement extérieur', '2 000 €/place', 'Taux fixe'],
                  ].map(([z, v, e]) => (
                    <tr key={z} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{z}</td>
                      <td className="p-3 font-semibold">{v}</td>
                      <td className="p-3">{e}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h2>Exemple de calcul — extension 30 m²</h2>
            <p>Extension 30 m² hors IDF, commune taux 3 %, département 1,5 % :</p>
            <ul>
              <li>30 × 1 036 = 31 080 € (assiette)</li>
              <li>
                Part communale : 31 080 × 3 % = <strong>932 €</strong>
              </li>
              <li>
                Part départementale : 31 080 × 1,5 % = <strong>466 €</strong>
              </li>
              <li>
                Total taxe : <strong>1 398 €</strong>
              </li>
            </ul>
            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>Poste budgétaire oublié dans 80 % des devis.</strong> La taxe d’aménagement
                arrive 12-24 mois après signature, au moment où on l’a oubliée. Intégrer 1 000-4 000
                € dans le plan de financement initial selon projet.
              </p>
            </div>
          </article>
          <FlagshipFaq items={faqs} />
          <FlagshipSources sources={sources} />
          <section className="my-10">
            <h2 className="font-heading text-xl font-semibold text-sand-900 mb-4">À lire aussi</h2>
            <ul className="grid gap-3 md:grid-cols-2">
              {relatedGuides.map((g) => (
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
          <div className="flex items-center justify-between text-sm text-sand-600 border-t border-sand-200 pt-4">
            <Link href="/guides" className="inline-flex items-center gap-1 hover:text-primary-700">
              ← Tous les guides
            </Link>
            <Link
              href="/services/architecte"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Trouver un architecte <Phone className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
