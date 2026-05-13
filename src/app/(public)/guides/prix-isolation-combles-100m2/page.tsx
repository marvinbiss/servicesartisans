import type { Metadata } from 'next'
import Link from 'next/link'
import { Euro, ArrowRight, Leaf, Calculator, AlertTriangle } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'prix-isolation-combles-100m2'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Claire Dubois'

export const revalidate = 86400

const TITLE = 'Prix isolation combles 100 m² 2026'
const DESCRIPTION =
  'Prix isolation combles 100 m² 2026 : 2 000-8 000 € TTC (soufflage, panneaux, sarking). MaPrimeRénov’ + CEE jusqu’à 4 500 €. Grille par matériau.'

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
  'Combles perdus (soufflage) 100 m² : 2 000 à 3 500 € TTC hors aides.',
  'Combles aménagés (panneaux) 100 m² : 4 500 à 8 000 € TTC hors aides.',
  'Sarking (isolation sur chevrons, toit) : 12 000 à 25 000 € pour une toiture complète.',
  'Obligation RGE Qualibat 7141 + R ≥ 7 m²·K/W pour MaPrimeRénov’.',
  'Aides 2026 : MaPrimeRénov’ (15-25 €/m²) + CEE (10-20 €/m²), cumul jusqu’à 4 500 €.',
]

const faqs = [
  {
    question: 'Quelle technique pour quel type de combles ?',
    answer:
      'Combles perdus (non habitables) : soufflage de laine minérale ou ouate de cellulose, le plus rapide et économique (20-35 €/m²). Combles aménagés (habitables) : panneaux ou rouleaux entre chevrons + pare-vapeur + plaques (45-85 €/m²). Sarking : isolation sur les chevrons sous la couverture, lors de réfection complète de toiture, performance maximale mais chantier lourd (120-250 €/m²).',
  },
  {
    question: 'Quel matériau choisir ?',
    answer:
      "Laine de verre : le plus répandu, bon rapport qualité-prix (R ≥ 7 facile à atteindre), durée 30-40 ans. Laine de roche : résistance au feu supérieure, acoustique meilleure, prix +10-20 %. Ouate de cellulose : écologique, bon déphasage thermique (confort été), sensible à l'humidité sans frein-vapeur correct. Laine de bois : très bon déphasage, prix +50-80 %. Polyuréthane : performance maximale à épaisseur égale, mais pétrosourcée et très cher.",
  },
  {
    question: 'Quelles aides en 2026 ?',
    answer:
      "MaPrimeRénov' 2026 isolation combles : 15 à 25 €/m² selon revenus (barème bleu-jaune-primary-rose), plafond 100 m² habituellement. Coup de pouce CEE : 10 à 20 €/m² supplémentaires. TVA 5,5 % si artisan Qualibat 7141 RGE. Cumul total : 25 à 45 €/m² pour ménage modeste = 2 500 à 4 500 € pour 100 m². Éco-PTZ possible pour compléter le reste à charge.",
  },
  {
    question: 'Quelle épaisseur pour atteindre R = 7 m²·K/W ?',
    answer:
      "Épaisseur minimum selon matériau : laine de verre λ=0,035 → 25 cm ; laine de roche λ=0,035 → 25 cm ; ouate de cellulose λ=0,039 → 28 cm ; laine de bois λ=0,038 → 27 cm ; polyuréthane λ=0,023 → 16 cm. Pour MaPrimeRénov', R ≥ 7 pour combles perdus, R ≥ 6 pour combles aménagés (rampants).",
  },
  {
    question: 'Le soufflage à 1 € existe-t-il encore ?',
    answer:
      "Non. Les offres « isolation à 1 € » ont été supprimées en 2020 puis rénovées puis re-supprimées. En 2026, le prix minimum réel d'une isolation de combles perdus correctement faite est d'environ 7-10 €/m² (hors aides). Toute offre à 1 € ou quasi-gratuite en 2026 est soit une fraude, soit une prestation sous-performante (épaisseur insuffisante, matériau dégradé).",
  },
  {
    question: 'Faut-il déposer l’ancienne isolation avant de refaire ?',
    answer:
      "Dépend de l'état. Ancienne isolation sèche et en bon état : on peut compléter par-dessus (soufflage d'une couche supplémentaire). Ancienne isolation humide, tassée, infestée (rats, martre) ou amiante suspectée : dépose complète obligatoire + traitement éventuel. Coût dépose : 5-15 €/m². Prévoyez diagnostic amiante avant tout, gratuit si maison avant 1997.",
  },
]

const sources = [
  { label: 'ADEME — Isolation des combles', url: 'https://agir.ademe.fr' },
  { label: 'France Rénov’ — MaPrimeRénov’ isolation', url: 'https://france-renov.gouv.fr' },
  { label: 'Qualibat — qualification 7141 ITR', url: 'https://www.qualibat.com' },
  { label: 'ACERMI — certification des isolants', url: 'https://www.acermi.com' },
]

const relatedGuides = [
  { label: 'Isolation des combles : guide complet', href: '/guides/isolation-combles' },
  { label: 'Isolation thermique : matériaux et aides', href: '/guides/isolation-thermique' },
  { label: 'Isolation ITE vs ITI 2026', href: '/guides/isolation-ite-iti-rge-aides-2026' },
  { label: 'Comment choisir un artisan RGE', href: '/guides/comment-choisir-artisan-rge' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Prix & Isolation',
    keywords: [
      'prix isolation combles',
      'isolation 100m2 prix',
      'soufflage combles prix',
      'isolation R7',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Prix isolation combles 100 m²', url: `/guides/${SLUG}` },
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
              { label: 'Prix isolation combles 100 m²' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Euro className="w-3.5 h-3.5" aria-hidden />
              Prix &amp; Isolation
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Prix isolation combles 100 m² en 2026 : grille et aides
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Isoler 100 m² de combles coûte entre 2 000 € (soufflage perdus) et 8 000 € (panneaux
              sur aménagés) en 2026. Après aides, un ménage aux revenus modestes peut réduire le
              reste à charge à moins de 1 000 €. Voici la grille par technique et matériau, les
              épaisseurs à exiger pour les aides, et les pièges des offres low-cost.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Grille prix 2026 au m²</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Technique</th>
                    <th className="p-3 border-b border-sand-200">Matériau</th>
                    <th className="p-3 border-b border-sand-200">Prix TTC /m²</th>
                    <th className="p-3 border-b border-sand-200">Total 100 m²</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Soufflage perdus', 'Laine de verre / roche', '20 à 35 €', '2 000 à 3 500 €'],
                    ['Soufflage perdus', 'Ouate de cellulose', '25 à 40 €', '2 500 à 4 000 €'],
                    ['Panneaux aménagés', 'Laine minérale', '45 à 70 €', '4 500 à 7 000 €'],
                    ['Panneaux aménagés', 'Laine de bois', '65 à 100 €', '6 500 à 10 000 €'],
                    ['Panneaux aménagés', 'Polyuréthane', '70 à 110 €', '7 000 à 11 000 €'],
                    [
                      'Sarking (sur chevrons)',
                      'Fibre bois + surcouvert.',
                      '120 à 250 €',
                      '12 000 à 25 000 €',
                    ],
                  ].map(([t, m, p, s]) => (
                    <tr key={t + m} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{t}</td>
                      <td className="p-3">{m}</td>
                      <td className="p-3">{p}</td>
                      <td className="p-3 font-semibold">{s}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Fourchettes 2026, pose comprise, hors aides. Dépose ancienne isolation : +5-15 €/m².
              </p>
            </div>

            <h2>Aides 2026 — cumul jusqu’à 4 500 € pour 100 m²</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Profil revenus</th>
                    <th className="p-3 border-b border-sand-200">MaPrimeRénov’ /m²</th>
                    <th className="p-3 border-b border-sand-200">CEE /m²</th>
                    <th className="p-3 border-b border-sand-200">Total 100 m²</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Très modestes (bleu)', '25 €', '20 €', '4 500 €'],
                    ['Modestes (jaune)', '20 €', '20 €', '4 000 €'],
                    ['Intermédiaires (violet)', '15 €', '15 €', '3 000 €'],
                    ['Supérieurs (rose)', '0 €', '10 €', '1 000 €'],
                  ].map(([p, m, c, t]) => (
                    <tr key={p} className="border-b border-sand-100 last:border-0">
                      <td className="p-3">{p}</td>
                      <td className="p-3">{m}</td>
                      <td className="p-3">{c}</td>
                      <td className="p-3 font-semibold">{t}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Sous conditions R ≥ 7 (perdus) ou R ≥ 6 (aménagés) + artisan RGE Qualibat 7141.
                Barèmes indicatifs 2026 sous réserve des arrêtés en cours.
              </p>
            </div>

            <h2>Ce que doit contenir le devis</h2>
            <ul>
              <li>Type et référence exacts de l’isolant (marque, densité, λ)</li>
              <li>Certification ACERMI de l’isolant</li>
              <li>Épaisseur posée et résistance thermique R résultante</li>
              <li>Pare-vapeur ou frein-vapeur selon cas</li>
              <li>Préparation (bâche, repère niveau, trappe accès)</li>
              <li>Quantité de sacs (pour soufflage) et compactage mesuré</li>
              <li>Numéro RGE Qualibat 7141 + date de validité</li>
              <li>TVA 5,5 % appliquée</li>
            </ul>

            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>Piège du soufflage bâclé.</strong> Certains chantiers bas prix soufflent une
                épaisseur insuffisante ou un isolant non certifié. Exigez le bordereau de livraison
                matériaux (poids total, nb sacs), une règle plantée dans la laine après soufflage
                pour vérifier l’épaisseur, et un attestation RGE fournie en fin de chantier.
              </p>
            </div>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    3 devis isolation RGE
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Artisans Qualibat 7141 vérifiés, simulation MaPrimeRénov’ incluse.
                  </p>
                  <Link
                    href="/devis"
                    className="inline-flex items-center gap-1.5 text-primary-700 font-semibold hover:underline"
                  >
                    Demander mes devis <ArrowRight className="w-4 h-4" aria-hidden />
                  </Link>
                </div>
              </div>
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
              href="/artisans-rge"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Artisans RGE <Leaf className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
