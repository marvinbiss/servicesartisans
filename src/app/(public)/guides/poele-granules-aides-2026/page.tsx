import type { Metadata } from 'next'
import Link from 'next/link'
import { Flame, ArrowRight, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'poele-granules-aides-2026'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Jean-Pierre Duval'
const AUTHOR_SLUG = 'jean-pierre-duval'

export const revalidate = 86400

const TITLE = 'Poêle à granulés : prix, aides MPR 2026'
const DESCRIPTION =
  'Poêle à granulés 2026 : prix 3 500-6 500 € posé, MaPrimeRénov’ 1 500-3 000 €, CEE 800-1 200 €, TVA 5,5 %, Qualibois RGE, Flamme Verte 7★.'

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
    authors: [`${SITE_URL}/equipe/${AUTHOR_SLUG}`],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const tldr = [
  'Prix 2026 TTC posé : 3 500-6 500 € (appareil + conduit + pose) selon puissance (6-14 kW) et marque (Invicta, MCZ, Edilkamin, Jotul).',
  'MaPrimeRénov’ 2026 : 1 500 € (supérieur), 2 000 € (intermédiaires), 2 500 € (modestes), 3 000 € (très modestes) + bonus passoire 1 000 €.',
  'CEE Coup de pouce chauffage : 800-1 200 € selon ressources. TVA 5,5 % résidence principale >2 ans. Éco-PTZ jusqu’à 15 000 €.',
  'Installation obligatoire RGE Qualibois (module bois énergie) + label Flamme Verte 7 étoiles (rendement ≥87 %) pour toutes aides.',
  'Ramonage 2 fois/an obligatoire (art. 31-6 Règlement Sanitaire Dép.) + entretien annuel. Coût ramonage 80-120 € TTC.',
]

const faqs = [
  {
    question: 'Quel prix pour un poêle à granulés installé en 2026 ?',
    answer:
      'Prix 2026 TTC posé fourniture + pose + conduit : (1) Entrée de gamme 6-8 kW (Invicta, Godin) : 3 500-4 500 € — pièce principale 60-80 m² isolée ; (2) Milieu gamme 8-10 kW (Palazzetti, La Nordica) : 4 500-5 500 € — maison 80-120 m² RT2012 ; (3) Haut de gamme 10-14 kW (MCZ, Edilkamin, Jotul) : 5 500-6 500 € — grande maison / chauffage principal ; (4) Poêle canalisable 2-3 pièces : 5 500-7 500 € (ventilateurs + gaines) ; (5) Poêle hydraulique (raccordé radiateurs) : 7 000-10 000 €. Détail coûts : appareil 2 000-5 000 €, conduit inox isolé 800-1 500 €, habillage + sol 400-800 €, pose 600-1 200 €, mise en service 150-250 €. Frais cachés : désenfumage toiture 300-600 €, renfort dalle 200-400 €, arrivée air 150-300 €.',
  },
  {
    question: 'Quel montant MaPrimeRénov poêle à granulés 2026 ?',
    answer:
      'Barème MaPrimeRénov’ 2026 poêle à granulés (décret 2022-1649) : (1) Bleu (très modestes) : 3 000 € ; (2) Jaune (modestes) : 2 500 € ; (3) Violet (intermédiaires) : 2 000 € ; (4) Rose (supérieurs) : 1 500 € ; (5) Au-delà plafond ressources : 0 €. Bonus BBC 500-1 000 € si sortie classe F/G au DPE après travaux (passoire rénovée). Cumul CEE Coup de pouce 800-1 200 € possible. Conditions : résidence principale >15 ans, installation RGE Qualibois, poêle label Flamme Verte 7★ rendement ≥87 %, émissions CO ≤0,3 %, particules ≤40 mg/Nm³. Barème abaissé en 2024 et stable 2026. Cumul maximum ménage bleu : 3 000 + 1 200 + 1 000 = 5 200 € sur 5 500 € = reste à charge 300 €.',
  },
  {
    question: 'Poêle à granulés ou chaudière granulés : que choisir ?',
    answer:
      'Poêle à granulés (3 500-6 500 €) = diffuse chaleur 1 pièce + pièces attenantes, autonomie 12-72 h (réservoir 15-40 kg), idéal pièce de vie maison bien isolée ≤120 m². MaPrimeRénov max 3 000 €. Chaudière granulés (15 000-25 000 €) = chauffage central complet radiateurs + ECS, silo 500 kg-5 t, convient grandes maisons mal isolées >150 m² ou remplacement chaudière fioul. MaPrimeRénov max 10 000 € + CEE 4 000 €. Règle : maison <120 m² + appoint chauffage existant = poêle ; maison >150 m² + chauffage principal réno complète = chaudière granulés. Inclure coût silo + place (2-5 m²) + livraison vrac annuelle pour chaudière.',
  },
  {
    question: 'Quelle consommation et coût chauffage granulés en 2026 ?',
    answer:
      'Consommation moyenne : (1) Maison 100 m² RT2012 : 2-3 tonnes granulés/an = 700-1 100 € (prix granulés 2026 ~350-380 €/t en sac, 320-340 €/t en vrac) ; (2) Maison 150 m² RT2005 : 3-4,5 tonnes = 1 100-1 700 € ; (3) Passoire F/G 120 m² : 4-6 tonnes = 1 400-2 200 €. Comparaison 2026 : granulés 0,09-0,11 €/kWh (vrac) ; gaz 0,11-0,13 €/kWh ; fioul 0,13-0,17 €/kWh ; électricité 0,20-0,25 €/kWh ; PAC air/eau 0,06-0,08 €/kWh (avec COP 3,5). Granulés = 2è énergie la moins chère après PAC. Volatilité prix : +80 % crise 2022, retour niveaux normaux 2024. Stockage conseillé : sacs 15 kg abrités ou silo 2-5 t (livraison vrac -10-15 %).',
  },
  {
    question: 'Quel entretien obligatoire pour un poêle à granulés ?',
    answer:
      'Obligations légales : (1) Ramonage conduit fumée 2 fois/an dont 1 en période d’usage — art. 31-6 Règlement Sanitaire Départemental. Coût 80-120 € TTC + attestation à conserver 5 ans ; (2) Entretien annuel poêle par professionnel : 150-250 € TTC (nettoyage corps chauffe, creuset, échangeur, tuyauterie aspiration, ventilateur, électronique, vidange cendres) ; (3) Vidange cendres hebdo par usager (poubelle métallique couvercle, froidement) ; (4) Nettoyage vitre régulier (papier journal + cendres humides) ; (5) Contrôle décennal conduit cheminée. Non-respect ramonage = assurance habitation refuse sinistre incendie (90 % cas tribunaux) + amende 450 € (art. R1334-31 CSP). Conserver factures ramonage avec dates précises, signature ramoneur + certificat Qualibois.',
  },
]

const sources = [
  {
    label: 'MaPrimeRénov’ — Barème 2026',
    url: 'https://france-renov.gouv.fr',
  },
  { label: 'Qualit’ENR — Qualibois', url: 'https://www.qualit-enr.org' },
  { label: 'Flamme Verte — Label', url: 'https://www.flammeverte.org' },
  { label: 'ADEME — Chauffage bois', url: 'https://www.ademe.fr' },
  { label: 'Art. 31-6 RSD — Ramonage', url: 'https://www.legifrance.gouv.fr' },
]

const relatedGuides = [
  { label: 'Chaudière gaz vs granulés', href: '/guides/chaudiere-gaz-vs-granules' },
  { label: 'MaPrimeRénov 2026 critères RGE', href: '/guides/maprimerenov-2026-criteres-rge' },
  { label: 'Chaudière fioul interdite 2026', href: '/guides/chaudiere-fioul-interdite-2026' },
  {
    label: 'CEE Certificats économies énergie',
    href: '/guides/cee-certificats-economies-energie-2026',
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
    section: 'Chauffage',
    keywords: [
      'poêle granulés prix',
      'MaPrimeRénov poêle 2026',
      'Qualibois RGE',
      'Flamme Verte 7 étoiles',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Poêle à granulés', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Poêle à granulés' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Flame className="w-3.5 h-3.5" aria-hidden />
              Chauffage · Guide vérifié
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Poêle à granulés : prix et aides 2026
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Un poêle à granulés coûte 3 500-6 500 € TTC posé et ouvre droit à MaPrimeRénov’
              jusqu’à 3 000 € + CEE 800-1 200 €. Voici les prix 2026, les aides cumulables et les
              obligations Qualibois + Flamme Verte 7★.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>MaPrimeRénov’ poêle à granulés 2026</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Profil ressources</th>
                    <th className="p-3 border-b border-sand-200">MaPrimeRénov’</th>
                    <th className="p-3 border-b border-sand-200">Bonus passoire F/G</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Bleu (très modestes)', '3 000 €', '+1 000 €'],
                    ['Jaune (modestes)', '2 500 €', '+1 000 €'],
                    ['Violet (intermédiaires)', '2 000 €', '+500 €'],
                    ['Rose (supérieurs)', '1 500 €', '+500 €'],
                    ['Au-delà plafond', '0 €', '0 €'],
                  ].map(([p, m, b]) => (
                    <tr key={p} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{p}</td>
                      <td className="p-3 font-semibold">{m}</td>
                      <td className="p-3">{b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
              Trouver un installateur Qualibois <Phone className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
