import type { Metadata } from 'next'
import Link from 'next/link'
import { Zap, ArrowRight, AlertTriangle, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'borne-recharge-irve-obligation'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Marc Lefebvre'

export const revalidate = 86400

const TITLE = 'Borne de recharge IRVE : obligation, prix, aides 2026'
const DESCRIPTION =
  'Borne de recharge IRVE 2026 : obligation tertiaire parkings >20 places, prix 1 200-3 500 € TTC maison, crédit d’impôt 75 % plafonné 500 €, installation Qualifelec IRVE.'

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
    authors: [`${SITE_URL}/equipe/marc-lefebvre`],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const tldr = [
  'IRVE = Infrastructure de Recharge de Véhicules Électriques. Prix 2026 : 1 200-3 500 € TTC posée 7 kW / 11 kW / 22 kW maison.',
  'Crédit d’impôt 2024-2025 : 75 % du coût plafonné à 500 € (art. 200 quater C CGI). Cumul CEE 160-300 €.',
  'Obligation tertiaire : parkings >20 places logements collectifs doivent pré-équiper dès 2025, 5 % points charge 2025, 20 % 2030.',
  'Installation réservée Qualifelec IRVE exclusivement pour bornes >3,7 kW (décret 2017-26 modifié).',
  'Puissances : 3,7 kW (prise renforcée) → 7 kW (courant) → 11/22 kW (triphasé) → 50+ kW DC (publique rapide).',
]

const faqs = [
  {
    question: 'Quel prix pour installer une borne IRVE à domicile ?',
    answer:
      "Grille 2026 TTC fourniture + pose : (1) Prise renforcée Green'Up ou équivalent (3,7 kW monophasé) : 600-1 200 € — simple, pour 1 véhicule à recharge nocturne ; (2) Wallbox 7 kW monophasée (Wallbox Pulsar Plus, Schneider EVlink) : 1 200-2 000 € — recharge complète 5-8 h ; (3) Wallbox 11 kW triphasée : 1 800-2 500 € — pertinente si triphasé disponible + 2 véhicules ; (4) Wallbox 22 kW triphasée (rare maison, adaptée copropriétés/entreprises) : 2 500-3 500 € — requiert abonnement 22 kVA. Pose 400-1 000 € selon distance tableau, aménagement circuit. Cas complexes (tableau à refaire + disjoncteur 40 A + câble long) : 2 500-5 000 € total.",
  },
  {
    question: 'Quelles aides pour installer une borne de recharge en 2026 ?',
    answer:
      "Cumul d'aides possible : (1) Crédit d'impôt IRVE 75 % plafonné 500 € par système — art. 200 quater C CGI, applicable résidence principale + secondaire, recourable si 2 bornes = 1 000 € max ; (2) Prime CEE installation borne : 160-300 € selon fournisseur d'énergie (EDF, TotalEnergies) ; (3) TVA 5,5 % sur pose + équipement (résidence principale >2 ans) ; (4) Aides locales régionales : 200-500 € certaines régions (PACA, Occitanie, IDF) ; (5) Copropriétés : prime ADVENIR jusqu'à 1 660 € par point charge (programme CEE spécifique) + droit à la prise art. L113-14 CCH. Total ménage : aides 700-1 300 € sur borne 2 000 € = reste à charge 700-1 300 €.",
  },
  {
    question: 'L’installation par un électricien Qualifelec IRVE est-elle obligatoire ?',
    answer:
      "OUI pour bornes >3,7 kW. Décret 2017-26 modifié : (1) Prise renforcée 3,2 kW (Green'Up simple) : peut être installée par tout électricien qualifié ou même DIY sous respect NF C 15-100 ; (2) Borne 3,7-22 kW en résidentiel : installation OBLIGATOIRE par électricien Qualifelec IRVE (certification complémentaire spécifique, 3 niveaux P1/P2/P3 selon complexité) ; (3) Borne >22 kW : Qualifelec IRVE P2 minimum (inclut communication + supervision) ; (4) Non-respect = assurance habitation refuse indemnisation si incendie d'origine IRVE + crédit impôt refusé (attestation Qualifelec IRVE à joindre dossier fiscal). Vérif sur qualifelec.fr avant signature devis. Coût Qualifelec IRVE pour l'artisan : formation 1 500 €, audit 600 €, renouvellement 4 ans.",
  },
  {
    question: 'Quelles obligations pour les parkings collectifs en 2026 ?',
    answer:
      "Loi d'orientation des mobilités (LOM 2019) + décret 2022-1335 : (1) Parkings immeubles résidentiels neufs >20 places : pré-équipement obligatoire sur 100 % places depuis 2021 ; (2) Parkings immeubles existants >20 places : pré-équipement 20 % places fin 2025, 50 % fin 2030 ; (3) Parkings tertiaires (bureaux, commerces) >20 places : 5 % places effectivement équipées fin 2025, 20 % fin 2030 ; (4) Copropriétés : mise en place simplifiée via droit à la prise art. L113-14 CCH — tout copropriétaire peut demander installation à ses frais après vote AG majorité simple (pas unanimité). Financement collectif copro via prime ADVENIR 1 660 €/point charge + provision charges. Non-respect : sanctions CCH art. L184-11, amendes administratives.",
  },
  {
    question: 'Comment choisir la puissance de la borne ?',
    answer:
      "Critères de dimensionnement : (1) Kilométrage quotidien — <50 km/jour (82 % cas) : 3,7 kW largement suffisant (recharge nocturne 6-8 h), 50-150 km/jour : 7 kW recommandé (3-4 h), >150 km : 11-22 kW ; (2) Type véhicule — Zoe, Fiat 500e, Twingo E-Tech : 7 kW max en AC, inutile > ; Tesla, BMW iX, Mercedes EQE : 11-22 kW exploitables ; (3) Infrastructure électrique — abonnement 9 kVA : 3,7 kW max, 12 kVA : 7 kW ok, 15+ kVA ou triphasé 12 kVA : 11 kW, 22 kW nécessite triphasé 24 kVA ; (4) Budget — 3,7 kW = 800-1 400 €, 7 kW = 1 500-2 500 €, 11 kW = 2 200-3 500 €. Règle d'or : 7 kW couvre 95 % des besoins résidentiels sans surinvestir. Upgrader plus tard si besoin avéré.",
  },
]

const sources = [
  {
    label: 'Art. 200 quater C CGI — Crédit IRVE',
    url: 'https://www.legifrance.gouv.fr',
  },
  {
    label: 'Décret 2017-26 modifié — Installation IRVE',
    url: 'https://www.legifrance.gouv.fr',
  },
  { label: 'Advenir — Prime copropriétés', url: 'https://advenir.mobi' },
  { label: 'Qualifelec — IRVE certification', url: 'https://www.qualifelec.fr' },
  { label: 'ADEME — Borne recharge', url: 'https://www.ademe.fr' },
]

const relatedGuides = [
  {
    label: 'Tableau électrique aux normes 2026',
    href: '/guides/tableau-electrique-aux-normes-2026',
  },
  { label: 'Normes électriques NF C 15-100', href: '/guides/normes-electriques' },
  { label: 'Prix électricien heure 2026', href: '/guides/prix-electricien-heure-2026' },
  { label: 'Labels qualifications artisans', href: '/guides/labels-qualifications-artisans' },
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
      'borne recharge IRVE',
      'prix borne recharge 2026',
      'obligation IRVE parking',
      'Qualifelec IRVE',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Borne recharge IRVE', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Borne recharge IRVE' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Zap className="w-3.5 h-3.5" aria-hidden />
              Réglementation · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Borne IRVE : obligations et prix 2026
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Installer une borne de recharge IRVE exige un électricien Qualifelec IRVE et ouvre
              droit à 75 % de crédit d’impôt. Voici les prix 2026, les aides, les obligations
              tertiaires/copropriétés et la bonne puissance selon votre usage.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Prix bornes IRVE résidentielles 2026</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Puissance</th>
                    <th className="p-3 border-b border-sand-200">Prix posée TTC</th>
                    <th className="p-3 border-b border-sand-200">Usage recommandé</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Prise renforcée 3,7 kW', '600-1 200 €', '< 50 km/jour'],
                    ['Wallbox 7 kW mono', '1 200-2 000 €', '50-150 km/jour'],
                    [
                      'Wallbox 11 kW triphasé',
                      '1 800-2 500 €',
                      '2 véhicules + EV moyenne autonomie',
                    ],
                    ['Wallbox 22 kW triphasé', '2 500-3 500 €', 'EV long autonomie + copropriété'],
                  ].map(([p, prix, u]) => (
                    <tr key={p} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{p}</td>
                      <td className="p-3 font-semibold">{prix}</td>
                      <td className="p-3">{u}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>Qualifelec IRVE obligatoire dès 3,7 kW.</strong> Installation par
                électricien non certifié IRVE = assurance habitation refuse sinistre incendie +
                crédit impôt 500 € refusé. Vérif SIRET + attestation IRVE avant devis.
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
              href="/services/electricien"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Trouver un installateur <Phone className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
