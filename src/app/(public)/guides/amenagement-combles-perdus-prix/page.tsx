import type { Metadata } from 'next'
import Link from 'next/link'
import { Home, ArrowRight, AlertTriangle, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'amenagement-combles-perdus-prix'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Thomas Bernard'

export const revalidate = 86400

const TITLE = 'Aménagement combles perdus prix 2026 : pente, DP, isolation'
const DESCRIPTION =
  'Aménagement combles perdus : 900-1 800 €/m² TTC selon faisabilité. Hauteur, pente, charpente à modifier, DP/PC, isolation, surélévation, aides 2026.'

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
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
    authors: [`${SITE_URL}/equipe/thomas-bernard`],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const tldr = [
  'Prix moyen 2026 : 900-1 800 €/m² TTC pour aménagement comble habitable complet (isolation, sol, cloisons, électricité, fenêtre de toit).',
  'Critères habitabilité : hauteur sous faîtage ≥1,80 m (idéal ≥2,20), pente ≥30°, plancher porteur (capacité 150 kg/m²).',
  'Combles perdus typiques (fermettes industrielles) : restructuration charpente +4 500-9 000 € avant aménagement.',
  'DP obligatoire pour création de lucarne/châssis toit. PC si surface créée >20 m² SDPHO (40 m² zone U).',
  'Aides 2026 : MaPrimeRénov’ (isolation seule), TVA 5,5 %, taxe d’aménagement à anticiper.',
]

const faqs = [
  {
    question: 'Combien coûte l’aménagement de combles perdus au m² ?',
    answer:
      "Prix 2026 hors surélévation : 900-1 800 €/m² TTC tout compris. Détail : isolation toiture ITR 80-130 €/m², charpente modifiée (retrait fermettes) 40-100 €/m², plancher porteur 60-110 €/m², cloisons+doublage 70-130 €/m², électricité 60-100 €/m², plomberie si pièce d'eau 80-180 €/m², fenêtres de toit Velux 500-1 500 €/unité, sol final 30-80 €/m², peinture 25-45 €/m². Pour 40 m² habitables : 36 000-72 000 €.",
  },
  {
    question: 'Mes combles sont-ils aménageables ?',
    answer:
      "3 critères : (1) hauteur sous faîtage ≥1,80 m (idéal ≥2,20 m), sinon nécessite surélévation 20-40 k€. (2) pente toiture ≥30° (pente plate = volume insuffisant). (3) plancher existant porteur (capacité 150 kg/m²) ou renforçable. Fermettes industrielles standardisées (années 1970+) = non aménageables sans retrait et remplacement par charpente traditionnelle (coût +4 500-9 000 €). Vérifier par bureau d'études structure ou architecte.",
  },
  {
    question: 'Quelles autorisations d’urbanisme ?',
    answer:
      "Simple aménagement intérieur sans ouverture : aucune formalité. Création fenêtre de toit ou lucarne : DP obligatoire (1 mois). Surface plancher créée : DP si 5-20 m² SDPHO hors zone U, DP si 5-40 m² SDPHO en zone U, PC au-delà. En secteur ABF : DP pour toute modification visible depuis l'extérieur. Taxe d'aménagement : calculée sur la surface créée, 5-10 €/m² selon commune (voir simulateur service-public.fr).",
  },
  {
    question: 'Quelles aides pour aménager des combles ?',
    answer:
      "MaPrimeRénov' : UNIQUEMENT sur la partie isolation (ITR combles aménagés). Montants : 15-75 €/m² selon profil. Pas d'aide sur le reste (plâtrerie, fenêtres, électricité). TVA 5,5 % sur l'ensemble si logement >2 ans et artisan RGE. Éco-PTZ jusqu'à 25 000 € pour bouquet isolation + fenêtres. Aides locales possibles (région, département, commune) : renseigner via France Rénov'.",
  },
  {
    question: 'Aménagement ou surélévation : quoi choisir ?',
    answer:
      'Aménagement comble perdu existant : 900-1 800 €/m² TTC, +40-60 m² habitables pour une maison 100 m² au sol. Surélévation (ajout étage) : 2 000-3 500 €/m² TTC, +60-100 m², lourd en urbanisme (PC obligatoire, accord voisins, PLU). Aménagement 2-3× moins cher et plus rapide. Surélévation réservée aux maisons avec combles inexploitables (hauteur <1,40 m) ou besoin de très grande surface.',
  },
  {
    question: 'Quel budget pour 30 m² combles habitables ?',
    answer:
      'Fourchette globale 27 000-54 000 € TTC pour 30 m² habitables. Détail réaliste : étude faisabilité 800 €, permis+taxe aménagement 600 €, renfort charpente 3 500 €, isolation 3 500 €, plancher 2 500 €, cloisons 3 200 €, 3 fenêtres Velux 2 800 €, électricité 2 800 €, sol 1 500 €, peinture 1 200 €, finitions 2 500 €, escalier 2 500 € = ~27 000 € entry level. +SDB : +6-10 k€. +belles finitions : +10-15 k€.',
  },
]

const sources = [
  {
    label: 'Service-public.fr — Surface plancher et emprise au sol',
    url: 'https://www.service-public.fr',
  },
  { label: 'Article R421-17 Code urba — DP', url: 'https://www.legifrance.gouv.fr' },
  { label: 'DTU 31.1 — Charpentes traditionnelles', url: 'https://www.cstb.fr' },
  { label: 'France Rénov’ — Combles', url: 'https://france-renov.gouv.fr' },
]

const relatedGuides = [
  { label: 'Isolation combles', href: '/guides/isolation-combles' },
  { label: 'Prix isolation combles 100 m²', href: '/guides/prix-isolation-combles-100m2' },
  { label: 'Extension maison', href: '/guides/extension-maison' },
  { label: 'Permis de construire', href: '/guides/permis-construire' },
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
      'aménagement combles perdus prix',
      'combles aménageables',
      'prix combles au m²',
      'charpente fermettes',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Aménagement combles perdus', url: `/guides/${SLUG}` },
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
              { label: 'Aménagement combles perdus prix' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Home className="w-3.5 h-3.5" aria-hidden />
              Travaux spécialisés · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Aménagement combles perdus : prix 2026 et faisabilité
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Aménager vos combles pour gagner 30-60 m² habitables est l’une des extensions les plus
              rentables au m². Mais tous les combles ne sont pas aménageables : hauteur, pente,
              charpente industrielle — voici les critères techniques et les vrais coûts 2026.
            </p>
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Faisabilité — les 3 critères techniques</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Critère</th>
                    <th className="p-3 border-b border-sand-200">Minimum</th>
                    <th className="p-3 border-b border-sand-200">Idéal</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Hauteur sous faîtage', '1,80 m', '≥ 2,20 m'],
                    ['Pente toiture', '30°', '≥ 40°'],
                    ['Plancher porteur', '150 kg/m²', '≥ 200 kg/m²'],
                    ['Charpente', 'Traditionnelle', 'Fermettes retirées'],
                  ].map(([c, m, i]) => (
                    <tr key={c} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{c}</td>
                      <td className="p-3">{m}</td>
                      <td className="p-3">{i}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2>Postes de coûts (TTC pour 40 m² habitables)</h2>
            <ul>
              <li>Étude faisabilité (architecte/BE) : 800-1 500 €</li>
              <li>Charpente (retrait fermettes + traditionnelle) : 4 500-9 000 €</li>
              <li>Isolation ITR (toiture) : 3 200-5 500 €</li>
              <li>Plancher porteur (si fragile) : 2 000-4 500 €</li>
              <li>Cloisons + doublage + placage : 3 000-5 500 €</li>
              <li>Fenêtres de toit (3-4 Velux) : 2 500-5 500 €</li>
              <li>Électricité neuve : 2 500-4 500 €</li>
              <li>Plomberie (si SDB/WC) : 3 500-8 000 €</li>
              <li>Sol (parquet ou PVC) : 1 200-3 500 €</li>
              <li>Peinture + finitions : 1 800-3 500 €</li>
              <li>Escalier (si pas existant) : 2 500-6 500 €</li>
              <li>Taxe d’aménagement : 300-700 €</li>
              <li>
                <strong>Total : 28 000-57 000 € TTC</strong>
              </li>
            </ul>

            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>Les fermettes industrielles sont un piège budget.</strong>
                Retirer ces entretoises standardisées (95 % des maisons 1970-2000) nécessite une
                restructuration complète de la charpente en traditionnel — coût 4 500-9 000 € rien
                que pour revenir à un volume habitable. À intégrer avant tout devis aménagement.
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
              href="/services/charpentier"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Trouver un charpentier <Phone className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
