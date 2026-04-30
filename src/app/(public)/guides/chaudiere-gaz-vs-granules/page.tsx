import type { Metadata } from 'next'
import Link from 'next/link'
import { Flame, ArrowRight, AlertTriangle, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'chaudiere-gaz-vs-granules'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Jean-Pierre Duval'

export const revalidate = 86400

const TITLE = 'Chaudière gaz vs granulés 2026'
const DESCRIPTION =
  'Chaudière gaz condensation vs granulés bois : prix installation, coût combustible, aides 2026, entretien, rendement. Comparatif détaillé par un chauffagiste.'

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
    authors: [`${SITE_URL}/equipe/jean-pierre-duval`],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const tldr = [
  'Chaudière gaz condensation : 3 500-6 500 € TTC posée. Plus de MaPrimeRénov’ depuis 2023 (sauf bailleurs précaires).',
  'Chaudière granulés : 14 000-22 000 € TTC posée (avec silo). MaPrimeRénov’ jusqu’à 11 000 €, CEE 4-5 k€.',
  'Coût combustible 2026 : gaz ~100 €/MWh PCI, granulés ~85-110 €/MWh PCI (volatil). Écart réduit vs 2022.',
  'Rendement : gaz condensation 105-109 % sur PCI, granulés 85-92 %. Emprise silo granulés : 6-12 m³ minimum.',
  'Gaz en copro = simple, granulés = quasi impossible (silo, nettoyage, ramonage 2x/an).',
]

const faqs = [
  {
    question: 'Une chaudière gaz est-elle encore éligible aux aides en 2026 ?',
    answer:
      "Non pour MaPrimeRénov' : supprimée depuis 01/01/2023. Exception : chaudière gaz très performante installée dans un logement de bailleur modeste (cas marginal). Oui pour Coup de pouce CEE : 500-1 500 € pour remplacer une chaudière fioul ou gaz non-condensation par un modèle THPE. Oui pour TVA 5,5 % sur pose. Au global : aide équivalente ~1 000-1 500 € vs 5 000-11 000 € pour PAC ou granulés. L'écart justifie désormais un changement d'énergie.",
  },
  {
    question: 'Quel est le vrai coût d’usage gaz vs granulés ?',
    answer:
      'Pour une maison 100 m² rénovée (13 MWh/an besoin chauffage + ECS) : gaz condensation à 100 €/MWh = 1 300 €/an combustible + 180 € entretien + abonnement 180 €/an = ~1 660 €. Granulés à 95 €/MWh (avec livraison vrac) = 1 235 € + 250 € ramonage 2×/an + filtre = ~1 485 €. Écart ~180 €/an. Sur 20 ans : granulés 3 600 € de moins, mais surcoût achat 10 000 € = non rentable pure économie.',
  },
  {
    question: 'Combien de place pour stocker les granulés ?',
    answer:
      'Besoin 3-4 tonnes/an pour maison 100 m². Stockage silo textile (7 m³) = 5 t capacité = 1 an autonomie. Silo maçonné = 6-12 m³ selon conso. Minimum local dédié 2×2×2 m avec accès camion pneumatique (max 30 m de tuyau, porte extérieure). Sacs 15 kg = 230 sacs = 4 m² au sol + manutention manuelle. En appartement : impossible. En maison sans garage/cave : complexe, silo extérieur bois 3 500 € supplémentaires.',
  },
  {
    question: 'Quelle entretien pour chaque système ?',
    answer:
      "Chaudière gaz : entretien annuel obligatoire (décret 2009-649), 100-180 €/an, attestation. Ramonage conduit : 1×/an, 60-100 €. Total ~200-280 €/an. Chaudière granulés : entretien annuel 180-280 €/an + ramonage 2×/an obligatoire (60-100 € par passage) + décendrage hebdo (manuel, 5 min) + vidange cendres 1×/mois. Total ~400-500 €/an et ~30 min/mois manuel. Granulés demande plus d'implication.",
  },
  {
    question: 'Peut-on remplacer chaudière fioul par granulés ?',
    answer:
      "Oui, c'est même le projet MaPrimeRénov' le plus aidé : jusqu'à 11 000 € MPR Bleu + 5 000 € Coup de pouce CEE + TVA 5,5 % = 13-16 k€ d'aides sur un projet à 18-22 k€. Reste à charge 5-9 k€. Vérifier : espace pour silo (souvent cuve fioul à dépolluer d'abord = 800-1 500 €), conduit compatible (diamètre, hauteur), alimentation électrique suffisante. Arbitrage vs pompe à chaleur air-eau : granulés mieux en région froide, PAC mieux en région tempérée.",
  },
  {
    question: 'Et la pompe à chaleur alors ?',
    answer:
      'La PAC air-eau (4 000-11 000 € MPR + 4-5,5 k€ CEE) reste souvent le meilleur compromis : pas de stockage, entretien simple, rendement SCOP 3,5-4,5 (soit 1 kWh élec = 3,5-4,5 kWh chaleur). Limites : nécessite maison bien isolée (sinon appoint électrique coûteux), région tempérée (COP chute <-5°C), émetteurs basse température idéal. Granulés préférable en montagne, maison très grande ou mal isolée. Gaz uniquement en copropriété ou si réseau existant non-éligible au remplacement.',
  },
]

const sources = [
  { label: 'France Rénov’ — Chaudière', url: 'https://france-renov.gouv.fr' },
  { label: 'Propellet — Prix granulés', url: 'https://www.propellet.fr' },
  { label: 'GRDF — Tarifs gaz', url: 'https://www.grdf.fr' },
  { label: 'ADEME — Chaudière biomasse', url: 'https://agirpourlatransition.ademe.fr' },
]

const relatedGuides = [
  { label: 'Prix installation chaudière gaz', href: '/guides/prix-installation-chaudiere-gaz' },
  {
    label: 'Installation pompe à chaleur : étapes',
    href: '/guides/installation-pompe-chaleur-etapes',
  },
  { label: 'Chaudière ne chauffe plus', href: '/guides/chaudiere-ne-chauffe-plus' },
  { label: 'Coup de pouce chauffage 2026', href: '/guides/coup-de-pouce-chauffage-2026' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Travaux spécialisés',
    keywords: [
      'chaudière gaz vs granulés',
      'comparatif chaudière',
      'chaudière pellets',
      'rendement chaudière',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Chaudière gaz vs granulés', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Chaudière gaz vs granulés' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Flame className="w-3.5 h-3.5" aria-hidden />
              Travaux spécialisés · Guide vérifié
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Chaudière gaz vs granulés : le comparatif 2026
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Remplacer sa vieille chaudière en 2026 : gaz condensation ou granulés bois ? Le prix
              d’achat diffère de 3 à 4 fois, mais les aides rééquilibrent largement. Voici les
              données techniques, économiques et pratiques pour arbitrer.
            </p>
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Tableau comparatif détaillé</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Critère</th>
                    <th className="p-3 border-b border-sand-200">Gaz condensation</th>
                    <th className="p-3 border-b border-sand-200">Granulés bois</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Prix installée TTC', '3 500-6 500 €', '14 000-22 000 €'],
                    ['Aides MPR max', '0 € (sauf bailleurs)', '11 000 €'],
                    ['Aides CEE', '500-1 500 €', '4 000-5 000 €'],
                    ['Rendement PCI', '105-109 %', '85-92 %'],
                    ['Coût énergie 2026', '100 €/MWh', '85-110 €/MWh'],
                    ['Stockage', 'Aucun', '6-12 m³'],
                    ['Entretien annuel', '100-180 €', '180-280 €'],
                    ['Ramonage', '1 × /an', '2 × /an'],
                    ['Durée vie', '15-20 ans', '15-20 ans'],
                    ['Empreinte CO₂', '200 g/kWh', '30 g/kWh'],
                  ].map(([c, g, p]) => (
                    <tr key={c} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{c}</td>
                      <td className="p-3">{g}</td>
                      <td className="p-3">{p}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2>Scénarios recommandés</h2>
            <ul>
              <li>
                <strong>Appartement en copropriété</strong> avec chaudière collective : gaz (unique
                option viable).
              </li>
              <li>
                <strong>Maison individuelle rurale &gt;150 m², région froide</strong> : granulés
                (indépendance énergétique, rentable avec aides).
              </li>
              <li>
                <strong>Maison urbaine &lt;120 m², tempérée</strong> : pompe à chaleur air-eau
                (meilleur compromis).
              </li>
              <li>
                <strong>Maison bien isolée récente</strong> : PAC air-eau uniquement.
              </li>
              <li>
                <strong>Maison avec cuve fioul à dépolluer</strong> : granulés si place + aides,
                sinon PAC.
              </li>
            </ul>

            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>Attention volatilité prix granulés.</strong> Pic 2022-2023 à 650 €/tonne (vs
                280 € en 2020). Depuis stabilisation ~400-450 €/tonne mais dépend de la
                disponibilité des forêts. Anticiper plusieurs fournisseurs dans un rayon de 50 km
                pour sécuriser.
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
              href="/services/chauffagiste"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Trouver un chauffagiste <Phone className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
