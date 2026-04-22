import type { Metadata } from 'next'
import Link from 'next/link'
import { Leaf, ArrowRight, AlertTriangle, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'panneau-solaire-prix-rentabilite'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Jean-Pierre Duval'

export const revalidate = 86400

const TITLE = 'Panneau solaire : prix, rentabilité 2026'
const DESCRIPTION =
  'Panneau solaire 2026 : 8 000-18 000 € TTC installé 3-9 kWc. Aide autoconsommation 80-380 €/kWc + revente EDF OA. Rentabilité 10-14 ans, QualiPV RGE.'

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
    authors: [`${SITE_URL}/equipe/jean-pierre-duval`],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const tldr = [
  'Prix 2026 TTC posé : 3 kWc (8 panneaux) 8 000-11 000 €, 6 kWc (16) 12 000-16 000 €, 9 kWc (24) 16 000-22 000 €.',
  'Prime autoconsommation 2026 : 80-380 €/kWc, versée en 1 fois après 6 mois mise en service. Dégressive selon trimestre.',
  'Revente surplus EDF OA : 0,13 €/kWh tarif garanti 20 ans. Mode vente totale 0,13-0,14 €/kWh désormais rare.',
  'Rentabilité moyenne 2026 : 10-14 ans. Économie annuelle 500-1 500 € selon autoconsommation + revente.',
  'Installation RGE QualiPV obligatoire + Consuel + déclaration Enedis. TVA 10 % installé, 20 % autoconsommation >3 kWc.',
]

const faqs = [
  {
    question: 'Combien coûte une installation photovoltaïque résidentielle en 2026 ?',
    answer:
      "Tarifs moyens marché observés début 2026 (source Hello Watt + Effy) : (1) 3 kWc (8 panneaux 375 W + onduleur monophasé + accessoires) : 8 000-11 000 € TTC — autoconsommation 50-70 %, adapté foyer 2-4 personnes ; (2) 6 kWc (16 panneaux + onduleur triphasé) : 12 000-16 000 € TTC — autoconsommation 40-60 % + revente surplus, foyer 4-6 personnes ; (3) 9 kWc (24 panneaux) : 16 000-22 000 € TTC — installation de référence maison 120-180 m² avec PAC ; (4) Batterie optionnelle 5-10 kWh : +4 000-9 000 € TTC. Prix au kWc : 2 500-3 000 € petite installation, 1 800-2 400 € grande. Baisse continue depuis 2018 (-40 %). Composants : panneaux 45 %, onduleur 15 %, main d'œuvre 25 %, accessoires/démarches 15 %.",
  },
  {
    question: 'Quelles aides pour l’installation photovoltaïque en 2026 ?',
    answer:
      "Aides spécifiques cumulables : (1) Prime à l'autoconsommation 2026 : 80 €/kWc (0-3 kWc), 220 €/kWc (3-9 kWc), 190 €/kWc (9-36 kWc), 90 €/kWc (36-100 kWc) — versée en 1 fois via EDF OA après 6 mois de production, dégressive par trimestre ; (2) Tarif de vente surplus EDF OA : 0,13 €/kWh garanti 20 ans (contrat S21) pour installations ≤9 kWc en autoconsommation + revente surplus ; (3) TVA 10 % sur pose + matériel si installation ≤3 kWc, 20 % au-delà (2026, loi de finances PLF) ; (4) Aides locales 500-2 000 € certaines régions (Bretagne, PACA) ; (5) Éco-PTZ jusqu'à 50 000 € sur 20 ans. PAS de MaPrimeRénov' pour le photovoltaïque (mais oui pour solaire thermique eau chaude).",
  },
  {
    question: 'Quelle rentabilité réelle d’une installation solaire en 2026 ?',
    answer:
      'Calcul rentabilité installation 6 kWc en région moyenne (Île-de-France, 1 100 kWh/kWc/an) : (1) Production annuelle : 6 600 kWh ; (2) Autoconsommation 50 % = 3 300 kWh consommés, économie directe 3 300 × 0,25 €/kWh EDF tarif base = 825 €/an ; (3) Revente 50 % = 3 300 kWh × 0,13 €/kWh = 429 €/an ; (4) Total économie annuelle : 1 254 €/an. Investissement initial 14 000 € - prime autoconsommation 1 320 € = 12 680 €. Rentabilité brute : 12 680 / 1 254 = 10,1 ans. Avec hausse tarifs électricité moyenne 5 %/an : rentabilité réelle 8-9 ans. Durée vie panneaux 25-30 ans garantis 80 % production résiduelle, onduleur 10-15 ans (1 remplacement à anticiper 1 500-2 500 €).',
  },
  {
    question: 'Autoconsommation totale, partielle ou vente totale : comment choisir ?',
    answer:
      '3 modes de valorisation en 2026 : (1) Autoconsommation TOTALE avec stockage batterie (0 revente) : panneaux 3-6 kWc + batterie 5-10 kWh, investissement +4-9 k€, objectif 85-95 % autonomie, pertinent uniquement si tarifs électricité élevés + consommation soirée forte ; (2) Autoconsommation PARTIELLE avec revente surplus (modèle recommandé, 90 % cas) : panneaux dimensionnés selon consommation, surplus revendu EDF OA 0,13 €/kWh, équilibre économique optimal ; (3) Vente TOTALE (tarif S21bis ≤9 kWc) : 0,13-0,14 €/kWh, désormais marginal car autoconsommation plus rentable. Par défaut : mode partiel avec 30-60 % autoconsommation selon profil conso. Batterie pertinente si mode total (isolé) ou pic conso soir >70 %.',
  },
  {
    question: 'Quelles sont les démarches administratives ?',
    answer:
      'Parcours en 8 étapes : (1) Audit site + étude de faisabilité par installateur QualiPV RGE (gratuit, 1-2 h) ; (2) Devis détaillé + simulation production PVGIS ; (3) Déclaration préalable de travaux en mairie (Cerfa 13703, délai 1 mois, obligatoire sauf installation intégrée toiture >60° vue rue) ; (4) Signature devis + acompte 30 % max ; (5) Commande + installation 3-5 jours sur site ; (6) Attestation Consuel Q18 (108-172 € HT) — conformité électrique pour raccordement ; (7) Raccordement Enedis (délai 4-8 semaines, frais 800-1 500 € selon distance réseau, inclus dans devis sérieux) ; (8) Contrat EDF OA Solaire signé (autoconsommation ou revente surplus) — activation compteur Linky bidirectionnel. Total projet : 3-5 mois du devis à la production.',
  },
]

const sources = [
  {
    label: 'Arrêté 6 oct 2021 — Tarifs EDF OA',
    url: 'https://www.legifrance.gouv.fr',
  },
  { label: 'ADEME — Photovoltaïque', url: 'https://www.ademe.fr' },
  { label: 'Qualit’EnR — QualiPV', url: 'https://www.qualit-enr.org' },
  { label: 'EDF OA Solaire', url: 'https://www.edf-oa.fr' },
  { label: 'PVGIS — Simulation production', url: 'https://re.jrc.ec.europa.eu/pvg_tools/fr/' },
]

const relatedGuides = [
  {
    label: 'Aides rénovation énergétique 2026',
    href: '/guides/aides-renovation-2026',
  },
  { label: 'QualiPAC signification', href: '/guides/qualipac-signification-obtenir' },
  { label: 'Éco-PTZ 2026', href: '/guides/eco-pret-taux-zero-2026' },
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
    section: 'Rénovation énergétique',
    keywords: [
      'panneau solaire prix',
      'rentabilité photovoltaïque 2026',
      'prime autoconsommation',
      'QualiPV RGE',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Panneau solaire', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Panneau solaire' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Leaf className="w-3.5 h-3.5" aria-hidden />
              Rénovation énergétique · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Panneaux solaires : prix et rentabilité 2026
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Les panneaux photovoltaïques sont rentables en 8-14 ans selon la puissance et le mode
              de valorisation. Voici les prix 2026, la prime autoconsommation, le tarif EDF OA 0,13
              €/kWh et la méthode pour calculer votre rentabilité réelle.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Prix panneaux solaires par puissance 2026</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Puissance kWc</th>
                    <th className="p-3 border-b border-sand-200">Prix posé TTC</th>
                    <th className="p-3 border-b border-sand-200">Prime autoconso</th>
                    <th className="p-3 border-b border-sand-200">Rentabilité</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['3 kWc (8 panneaux)', '8 000-11 000 €', '240-660 €', '10-12 ans'],
                    ['6 kWc (16 panneaux)', '12 000-16 000 €', '1 320 €', '9-11 ans'],
                    ['9 kWc (24 panneaux)', '16 000-22 000 €', '1 980 €', '9-12 ans'],
                    ['+ Batterie 5 kWh', '+4 000-6 000 €', '—', '+3-5 ans'],
                  ].map(([p, prix, pr, r]) => (
                    <tr key={p} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{p}</td>
                      <td className="p-3 font-semibold">{prix}</td>
                      <td className="p-3">{pr}</td>
                      <td className="p-3">{r}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>Démarchage photovoltaïque interdit depuis 2023.</strong> Loi 2022-113. Ne
                JAMAIS signer sur place ou après appel. Comparer 3 devis, installateur QualiPV RGE
                obligatoire pour prime autoconsommation. Arnaques photovoltaïque = 30 % signalements
                DGCCRF énergie 2024.
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
            <Link href="/rge" className="inline-flex items-center gap-1 hover:text-primary-700">
              Artisans QualiPV <Phone className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
