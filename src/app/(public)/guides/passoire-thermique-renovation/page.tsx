import type { Metadata } from 'next'
import Link from 'next/link'
import { Snowflake, ArrowRight, AlertTriangle, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'passoire-thermique-renovation'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Claire Dubois'

export const revalidate = 86400

const TITLE = 'Passoire thermique : aides 2026'
const DESCRIPTION =
  'Passoire thermique F ou G : rénovation énergétique obligatoire 2025-2034, aides MaPrimeRénov’, audit obligatoire, coût moyen, sortie de passoire.'

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
  'Définition : logement F (>330 kWhEP/m²/an) ou G (>450 kWhEP/m²/an) au DPE.',
  '5,2 millions de passoires en France (Insee 2023), dont 2 M louées — concentrées Paris, IdF, Hauts-de-France.',
  'Rénovation : pas obligatoire en soi, mais interdiction progressive de location (G 2025, F 2028, E 2034).',
  'Coût sortie passoire type maison 100 m² F → D : 40 000-65 000 € TTC, aides jusqu’à 60 %.',
  'Exceptions techniques : bâtiments protégés ABF, contraintes architecturales majeures (possibilité de dérogation).',
]

const faqs = [
  {
    question: 'Qu’est-ce qu’une passoire thermique ?',
    answer:
      'Logement classé F (consommation primaire énergie 331-450 kWhEP/m²/an ou CO₂ 70-100 kgCO₂/m²/an) ou G (>450 kWhEP/m²/an ou >100 kgCO₂/m²/an). Le DPE 2021 rénové utilise désormais les deux critères (énergie ET carbone), et retient la note la plus défavorable. Cela exclut notamment les logements chauffés au fioul ou au gaz dans des bâtiments mal isolés, même si la consommation énergétique seule serait acceptable.',
  },
  {
    question: 'Suis-je obligé de rénover ma passoire thermique ?',
    answer:
      "Non pour un propriétaire occupant : pas d'obligation légale de rénover. Oui de facto pour un propriétaire bailleur : impossibilité de louer après 2025 (G), 2028 (F), 2034 (E). Pour un vendeur F ou G depuis 2023 : audit énergétique obligatoire à présenter à l'acheteur. Sanctions possibles : interdiction de louer sanctionnée par le juge (art. L173-2 CCH), amendes. En copropriété, l'obligation DPE collectif 2024+ pousse aux rénovations globales.",
  },
  {
    question: 'Quel est le coût moyen pour sortir de passoire ?',
    answer:
      "Maison 100 m² fioul F (DPE 370 kWhEP) à atteindre D (200 kWhEP) = travaux moyens 45 000-65 000 € TTC : isolation combles 4 000 €, ITE façades 18-25 k€, fenêtres DV 10-14 k€, PAC air-eau 14 k€, VMC 2,5 k€. Pour G → D (rénovation lourde) : 55 000-85 000 €. Aides 2026 profil Jaune : jusqu'à 45 k€ cumulés (MPR + CEE) + éco-PTZ 50 k€. Reste à charge réel 15-30 k€ finançable.",
  },
  {
    question: 'Comment financer sans apport ?',
    answer:
      "Combinaison type : (1) MaPrimeRénov' parcours accompagné 30-60 % selon profil = 15-40 k€ ; (2) Coup de pouce CEE 4-7 k€ ; (3) éco-PTZ 50 000 € sans intérêts sur 15-20 ans ; (4) TVA 5,5 % intégrée au prix ; (5) prêts bancaires classiques pour le solde. Un projet 60 k€ peut être financé à 100 % sans apport, avec des mensualités de 250-400 €/mois équivalentes à l'économie d'énergie générée.",
  },
  {
    question: 'Puis-je obtenir une dérogation si mon logement est inrénovable ?',
    answer:
      "Oui via le décret n°2024-1143 du 4 décembre 2024 qui précise les cas d'exonération : (1) bâtiments patrimoniaux protégés (monuments historiques, abords), (2) contraintes architecturales majeures avérées par expertise (coût disproportionné >50 % de la valeur du bien), (3) copropriétés avec refus persistant de travaux collectifs (propriétaire seul ne peut pas isoler des parties communes). La dérogation se demande à la Préfecture avec dossier technique. Instruction 3-6 mois.",
  },
  {
    question: 'Que faire si je suis locataire d’une passoire ?',
    answer:
      "Depuis 2023, vous pouvez saisir le juge d'instance pour exiger gratuitement la mise en conformité (art. 20-1 loi 1989). Le loyer ne peut pas être augmenté, ni à la relocation, ni à l'indexation (pour G+ depuis 2021). En cas d'inconfort manifeste et de consommation excessive, vous pouvez saisir la DDT (Direction Départementale des Territoires) et demander un diagnostic contradictoire. Recours ANIL (gratuit) pour vous accompagner dans la procédure.",
  },
]

const sources = [
  { label: 'Insee — Parc de passoires thermiques', url: 'https://www.insee.fr' },
  { label: 'Loi Climat Résilience 2021 — Art. L173-2 CCH', url: 'https://www.legifrance.gouv.fr' },
  { label: 'Décret n°2024-1143 — Exceptions rénovation', url: 'https://www.legifrance.gouv.fr' },
  { label: 'ANIL — Recours locataire passoire', url: 'https://www.anil.org' },
]

const relatedGuides = [
  { label: 'DPE mauvais que faire', href: '/guides/dpe-mauvais-que-faire' },
  { label: 'Classe énergie F interdite 2028', href: '/guides/classe-energie-f-interdite-2028' },
  { label: 'MaPrimeRénov’ parcours accompagné', href: '/guides/maprimerenov-parcours-accompagne' },
  {
    label: 'Aide isolation maison propriétaire',
    href: '/guides/aide-isolation-maison-proprietaire',
  },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Rénovation énergétique',
    keywords: [
      'passoire thermique',
      'rénovation passoire obligatoire',
      'DPE F G',
      'sortie de passoire',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Passoire thermique rénovation', url: `/guides/${SLUG}` },
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
            items={[
              { label: 'Guides', href: '/guides' },
              { label: 'Passoire thermique rénovation' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Snowflake className="w-3.5 h-3.5" aria-hidden />
              Rénovation énergétique · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Passoire thermique : rénovation obligatoire 2025-2034
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              5,2 millions de logements sont classés passoires thermiques (F ou G) en France. La loi
              Climat impose un calendrier d’interdiction de location, et la loi habitat dégradé
              renforce les sanctions. Voici l’état du droit 2026 et la stratégie de rénovation.
            </p>
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Seuils DPE 2021 : F et G</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Classe</th>
                    <th className="p-3 border-b border-sand-200">Conso énergie (kWhEP)</th>
                    <th className="p-3 border-b border-sand-200">Émission CO₂ (kgCO₂)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['A', '≤ 70', '≤ 6'],
                    ['B', '71-110', '7-11'],
                    ['C', '111-180', '12-30'],
                    ['D', '181-250', '31-50'],
                    ['E', '251-330', '51-70'],
                    ['F (passoire)', '331-450', '71-100'],
                    ['G (passoire)', '> 450', '> 100'],
                  ].map(([c, e, co2]) => (
                    <tr key={c} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{c}</td>
                      <td className="p-3">{e}</td>
                      <td className="p-3">{co2}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2>Parcours rénovation d’une passoire</h2>
            <ol>
              <li>Audit énergétique (500-1 200 €) — obligatoire si vente F/G.</li>
              <li>Accompagnement par un « Mon Accompagnateur Rénov’ » (gratuit ou remboursé).</li>
              <li>Scénarios de travaux chiffrés avec gains DPE attendus.</li>
              <li>Sélection artisans RGE + 3 devis comparatifs.</li>
              <li>Dépôt dossiers MaPrimeRénov’ + CEE avant signature.</li>
              <li>Travaux en 3-6 mois selon ampleur.</li>
              <li>Nouveau DPE post-travaux (obligatoire pour validation aides).</li>
            </ol>

            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>Audit énergétique obligatoire vente F/G.</strong>
                Depuis avril 2023, vendre un logement F ou G impose de fournir un audit énergétique
                aux acquéreurs dès la première visite. Depuis 2025, extension aux E. Audit = version
                étendue du DPE, avec scénarios travaux et coûts. Tarif moyen 600-1 000 €.
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
              href="/simulateur-aides-renovation"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Simuler mes aides <Phone className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
