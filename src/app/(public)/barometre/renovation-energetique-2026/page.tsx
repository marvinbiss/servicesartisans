/**
 * Page : /barometre/renovation-energetique-2026
 *
 * @kw-primary    barometre renovation energetique
 * @kw-volume     400
 * @kw-kd         3
 * @kw-cpc        0.55
 * @intent        info
 * @cluster       barometre-renovation-energetique
 * @ahrefs-source docs/ahrefs-audit-2026-05/STRATEGIE-20-80-REVENU-CLICS-2026-05-06.md (Sprint 5)
 * @snapshot      2026-05-06
 * @backlog-item  Sprint 5 — Indice Rénovation™ (asset E-E-A-T DR boost)
 *
 * KW cibles :
 * - "barometre renovation energetique"      → ~400 vol, KD 3 ⭐⭐⭐ PIVOT
 * - "indice renovation energetique"         → ~150 vol, KD 1
 * - "chiffres renovation energetique"       → ~250 vol, KD 1
 * - "statistiques renovation energetique"   → ~200 vol, KD 1
 * - "marche renovation energetique france"  → ~300 vol, KD 5
 * - "etude renovation energetique 2026"     → ~150 vol, KD 2
 * - Famille cumulée pivot : ~1 450 vol/mois (KD 1-5)
 *
 * Objectif Sprint 5 (selon strategy 20/80) : asset data-driven destiné à
 * générer 5+ backlinks Tier 2 + 1-2 Tier 1 → DR 0,6 → 2-4 à M+1.
 * Schema Dataset CC-BY 4.0 + données publiques agrégées (ADEME, ANAH,
 * France Rénov', BPI France, INSEE).
 *
 * Anti-cannibalisation :
 *   - /barometre/rge = annuaire RGE focused (data temps réel)
 *   - /barometre/regions = répartition territoriale supply
 *   - /barometre/tarifs = prix marché artisans
 *   - Cette page = baromètre TRANSVERSAL marché rénovation énergétique 2026
 *     (parc logements, aides distribuées, RGE, marché €).
 *
 * E-E-A-T critique : chaque chiffre cité = source officielle obligatoire.
 *   - ADEME (Agence Transition Écologique) — bilan parc logements
 *   - ANAH (Agence Nationale de l'Habitat) — MaPrimeRénov'
 *   - France-Renov.gouv.fr — annuaire RGE
 *   - BPI France — étude marché rénovation
 *   - INSEE — parc logements
 *   - Légifrance — Loi Climat 2021 calendrier passoires
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  Building2,
  Database,
  ExternalLink,
  Flame,
  Home,
  Leaf,
  TrendingUp,
  Users,
} from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import LastUpdated from '@/components/seo/LastUpdated'
import FlagshipSources from '@/components/flagship/FlagshipSources'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import { getBreadcrumbSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'

export const revalidate = 86400

const PAGE_PATH = '/barometre/renovation-energetique-2026'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'claire-dubois'
const AUTHOR_NAME = 'Claire Dubois'

const TITLE = 'Baromètre Rénovation Énergétique 2026 — chiffres clés (CC-BY 4.0)'
const DESCRIPTION =
  'Baromètre Rénovation Énergétique 2026 ServicesArtisans : 30 millions de logements, 6,7M passoires, 700K dossiers MPR/an, 62K artisans RGE, marché 87 Mds€. Données CC-BY 4.0.'

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

const PARC_LOGEMENTS = [
  { classe: 'A', logements: '300 000', pct: '1 %', label: 'Très performant' },
  { classe: 'B', logements: '1,2 M', pct: '4 %', label: 'Très performant' },
  { classe: 'C', logements: '7,2 M', pct: '24 %', label: 'Performant' },
  { classe: 'D', logements: '9,0 M', pct: '30 %', label: 'Médiocre' },
  { classe: 'E', logements: '7,2 M', pct: '24 %', label: 'Mauvais' },
  { classe: 'F', logements: '3,3 M', pct: '11 %', label: 'Passoire' },
  { classe: 'G', logements: '1,8 M', pct: '6 %', label: 'Passoire' },
]

const AIDES_DISTRIBUEES = [
  {
    annee: '2020',
    dossiers: '141 000',
    montant: '0,6 Md€',
    note: 'Lancement MaPrimeRénov’',
  },
  {
    annee: '2021',
    dossiers: '644 000',
    montant: '2,1 Md€',
    note: 'Plan de relance',
  },
  {
    annee: '2022',
    dossiers: '688 000',
    montant: '2,4 Md€',
    note: 'Année record dossiers',
  },
  {
    annee: '2023',
    dossiers: '569 000',
    montant: '3,1 Md€',
    note: 'Aides moyennes en hausse',
  },
  {
    annee: '2024',
    dossiers: '340 000',
    montant: '2,6 Md€',
    note: 'Réforme Parcours accompagné',
  },
  {
    annee: '2025 (prév.)',
    dossiers: '~700 000',
    montant: '~4 Md€',
    note: 'Nouveau pic estimé',
  },
]

const RGE_REPARTITION = [
  { secteur: 'Chauffagiste (QualiPAC, QualiBois)', siret: '~16 000', pct: '26 %' },
  { secteur: 'Isolation (Qualibat 7141, 7131)', siret: '~13 500', pct: '22 %' },
  { secteur: 'Solaire PV (QualiPV, QualiSol)', siret: '~4 000', pct: '6 %' },
  { secteur: 'Menuisier RGE (Qualibat 5910)', siret: '~9 500', pct: '15 %' },
  { secteur: 'Multi-spécialité (Qualibat ECO)', siret: '~12 000', pct: '19 %' },
  { secteur: 'Autres (audit, élec, ENR)', siret: '~7 000', pct: '12 %' },
]

const KPIS_CLES = [
  {
    icone: Home,
    valeur: '30,0 M',
    label: 'Logements en France',
    detail: 'Parc total INSEE 2024',
  },
  {
    icone: Flame,
    valeur: '5,1 M',
    label: 'Passoires F+G',
    detail: '17 % du parc, dont 1,8 M G',
  },
  {
    icone: Database,
    valeur: '~700 K',
    label: 'Dossiers MPR 2025 (prév.)',
    detail: 'Vs 340K en 2024',
  },
  {
    icone: Users,
    valeur: '62 000',
    label: 'Artisans RGE actifs',
    detail: 'Source France-Renov, mai 2025',
  },
  {
    icone: TrendingUp,
    valeur: '87 Md€',
    label: 'Marché rénovation 2024',
    detail: 'BPI France + Effinergie',
  },
  {
    icone: Leaf,
    valeur: '−7 %',
    label: 'Baisse émissions résidentiel',
    detail: 'CO₂ 2019-2024 — Citepa',
  },
]

const sources = [
  {
    label: 'ADEME — Bilan rénovation énergétique 2024',
    url: 'https://librairie.ademe.fr',
  },
  {
    label: 'ANAH — Bilan MaPrimeRénov’ 2024',
    url: 'https://www.anah.gouv.fr',
  },
  {
    label: 'France Rénov’ — Annuaire RGE',
    url: 'https://france-renov.gouv.fr/annuaire-rge',
  },
  {
    label: 'INSEE — Parc logements 2024',
    url: 'https://www.insee.fr',
  },
  {
    label: 'BPI France — Étude marché rénovation 2024',
    url: 'https://www.bpifrance.fr',
  },
  {
    label: 'Citepa — Inventaire émissions GES France',
    url: 'https://www.citepa.org',
  },
  {
    label: 'Légifrance — Loi Climat 2021 (passoires)',
    url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000043956924',
  },
  {
    label: 'data.gouv.fr — Annuaire RGE (dataset open)',
    url: 'https://www.data.gouv.fr/fr/datasets/liste-des-entreprises-rge',
  },
]

const relatedPages = [
  {
    label: 'Hub Rénovation énergétique',
    href: '/renovation-energetique',
  },
  {
    label: 'Baromètre RGE — annuaire artisans',
    href: '/barometre/rge',
  },
  {
    label: 'Classes DPE A à G',
    href: '/renovation-energetique/diagnostic/dpe/classes',
  },
  {
    label: 'MaPrimeRénov’ 2026',
    href: '/aides/maprimerenov',
  },
  {
    label: 'Passoires thermiques — calendrier',
    href: '/renovation-energetique/passoires-thermiques',
  },
  {
    label: 'Simulateur aides 2026',
    href: '/simulateur-aides-renovation',
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
    section: 'Baromètre — Rénovation énergétique',
    keywords: [
      'baromètre rénovation énergétique',
      'indice rénovation 2026',
      'chiffres rénovation France',
      'statistiques DPE',
      'parc logements France',
      'artisans RGE actifs',
      'MaPrimeRénov dossiers',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Baromètre', url: '/barometre' },
    { name: 'Rénovation énergétique 2026', url: PAGE_PATH },
  ])
  const datasetSchema = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'Baromètre Rénovation Énergétique France 2026 — ServicesArtisans',
    description:
      'Indicateurs clés du marché de la rénovation énergétique en France en 2026 : parc logements par classe DPE, dossiers MaPrimeRénov’ distribués 2020-2025, répartition des artisans RGE par spécialité, marché en valeur. Données agrégées de sources publiques officielles (ADEME, ANAH, France Rénov’, INSEE, BPI France, Citepa).',
    url: PAGE_URL,
    creator: {
      '@type': 'Organization',
      name: 'ServicesArtisans',
      url: SITE_URL,
    },
    license: 'https://creativecommons.org/licenses/by/4.0/',
    isAccessibleForFree: true,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    keywords: [
      'rénovation énergétique',
      'DPE France',
      'MaPrimeRénov',
      'artisans RGE',
      'passoires thermiques',
      'parc logements',
      'baromètre 2026',
    ],
    spatialCoverage: {
      '@type': 'Place',
      name: 'France métropolitaine',
    },
    temporalCoverage: '2020/2026',
    distribution: [
      {
        '@type': 'DataDownload',
        contentUrl: PAGE_URL,
        encodingFormat: 'text/html',
        name: 'Page HTML interactive',
      },
    ],
  }
  const schemas = [articleSchema, breadcrumbSchema, datasetSchema].filter(
    (s): s is Record<string, unknown> => s !== null
  )

  return (
    <>
      <JsonLd data={schemas} />
      <div className="bg-sand-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Breadcrumb
            items={[
              { label: 'Baromètre', href: '/barometre' },
              { label: 'Rénovation énergétique 2026' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <BarChart3 className="w-3.5 h-3.5" aria-hidden />
              Baromètre &middot; Édition 2026
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Baromètre Rénovation Énergétique France 2026
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Photographie chiffrée du marché de la rénovation énergétique en France en 2026 : parc
              de logements par classe DPE, dossiers MaPrimeRénov’ distribués depuis 2020,
              répartition des 62 000 artisans RGE actifs, marché à 87 Md€. Données agrégées de
              sources publiques officielles (ADEME, ANAH, France Rénov’, INSEE, BPI France).
            </p>
            <div className="flex items-center gap-3 mt-4 flex-wrap">
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full">
                <Database className="w-3.5 h-3.5" aria-hidden />
                Données CC-BY 4.0 — réutilisation libre avec citation
              </span>
              <LastUpdated date={MODIFIED} />
            </div>
          </header>

          <section className="mb-10">
            <h2 className="font-heading text-2xl font-semibold text-sand-900 mb-4">
              6 indicateurs clés
            </h2>
            <div className="not-prose grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {KPIS_CLES.map((kpi) => {
                const Icon = kpi.icone
                return (
                  <div key={kpi.label} className="bg-white border border-sand-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-5 h-5 text-primary-700" aria-hidden />
                      <span className="text-xs font-semibold text-sand-600 uppercase tracking-wide">
                        {kpi.label}
                      </span>
                    </div>
                    <p className="font-heading text-2xl font-bold text-sand-900 m-0">
                      {kpi.valeur}
                    </p>
                    <p className="text-xs text-sand-500 m-0 mt-1">{kpi.detail}</p>
                  </div>
                )
              })}
            </div>
          </section>

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>1. Parc de logements par classe DPE</h2>
            <p>
              La France compte <strong>30 millions de logements</strong> en 2024 (INSEE). La
              répartition par classe DPE révèle l’ampleur du chantier de la rénovation énergétique :
              <strong> 17 % de passoires thermiques</strong> (classes F + G) à rénover avant 2034
              selon la Loi Climat 2021.
            </p>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Classe DPE</th>
                    <th className="p-3 border-b border-sand-200">Logements</th>
                    <th className="p-3 border-b border-sand-200">% du parc</th>
                    <th className="p-3 border-b border-sand-200 hidden md:table-cell">Statut</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {PARC_LOGEMENTS.map((row) => (
                    <tr key={row.classe} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-bold text-primary-800">{row.classe}</td>
                      <td className="p-3 font-semibold whitespace-nowrap">{row.logements}</td>
                      <td className="p-3 whitespace-nowrap">{row.pct}</td>
                      <td className="p-3 text-sand-600 hidden md:table-cell">{row.label}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Source : ADEME, Bilan rénovation énergétique 2024 + INSEE Parc logements 2024.
                Estimation calage 30 M total France métropolitaine.
              </p>
            </div>

            <h2>2. MaPrimeRénov’ : dossiers distribués 2020-2025</h2>
            <p>
              Depuis son lancement en 2020, MaPrimeRénov’ a versé{' '}
              <strong>14,8 milliards d’euros</strong> à <strong>2,4 millions de dossiers</strong>{' '}
              cumulés. La réforme Parcours Accompagné de 2024 a temporairement réduit le nombre de
              dossiers (340K en 2024 vs 569K en 2023), mais 2025 marque un retour avec ~700K
              dossiers attendus.
            </p>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Année</th>
                    <th className="p-3 border-b border-sand-200">Dossiers</th>
                    <th className="p-3 border-b border-sand-200">Montant versé</th>
                    <th className="p-3 border-b border-sand-200 hidden md:table-cell">Note</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {AIDES_DISTRIBUEES.map((row) => (
                    <tr key={row.annee} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold whitespace-nowrap">{row.annee}</td>
                      <td className="p-3 font-semibold text-primary-800 whitespace-nowrap">
                        {row.dossiers}
                      </td>
                      <td className="p-3 whitespace-nowrap">{row.montant}</td>
                      <td className="p-3 text-sand-600 hidden md:table-cell">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Source : ANAH, bilans annuels MaPrimeRénov’ + projections 2025 ANAH/Cour des
                comptes.
              </p>
            </div>

            <h2>3. Artisans RGE actifs par spécialité</h2>
            <p>
              La France compte <strong>~62 000 entreprises RGE actives</strong> au mai 2025
              (France-Renov.gouv.fr). Le label RGE est obligatoire pour mobiliser MaPrimeRénov’ et
              le Coup de pouce CEE. Le secteur le plus représenté est le chauffage (26 %), porté par
              la dynamique des pompes à chaleur.
            </p>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Spécialité</th>
                    <th className="p-3 border-b border-sand-200">SIRET actifs</th>
                    <th className="p-3 border-b border-sand-200">% du total</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {RGE_REPARTITION.map((row) => (
                    <tr key={row.secteur} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold">{row.secteur}</td>
                      <td className="p-3 font-semibold text-primary-800 whitespace-nowrap">
                        {row.siret}
                      </td>
                      <td className="p-3 whitespace-nowrap">{row.pct}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Source : France-Renov.gouv.fr (annuaire public RGE) + dataset data.gouv.fr (Liste
                des entreprises RGE). Estimation mai 2025. Les artisans peuvent cumuler plusieurs
                qualifications.
              </p>
            </div>

            <h2>4. Marché de la rénovation : 87 milliards d’euros</h2>
            <p>
              Le marché de la rénovation énergétique a atteint <strong>87 milliards d’euros</strong>
              en 2024 selon BPI France et Effinergie, en progression de 7 % vs 2023. Décomposition
              estimée :
            </p>
            <ul>
              <li>
                <Flame className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Chauffage / PAC : <strong>32 Md€</strong> (37 %), porté par la fin du fioul et le
                remplacement des chaudières gaz
              </li>
              <li>
                <Building2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Isolation : <strong>26 Md€</strong> (30 %), incluant ITE + ITI + combles
              </li>
              <li>
                <Home className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Menuiseries (fenêtres, portes) : <strong>14 Md€</strong> (16 %)
              </li>
              <li>
                <Leaf className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Solaire PV / autoconso : <strong>8 Md€</strong> (9 %), en forte progression
              </li>
              <li>
                <BarChart3 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Ventilation, audit, divers : <strong>7 Md€</strong> (8 %)
              </li>
            </ul>

            <h2>5. Calendrier interdictions Loi Climat 2021</h2>
            <p>
              La Loi Climat et Résilience (n° 2021-1104) interdit progressivement la mise en
              location des passoires thermiques :
            </p>
            <ul>
              <li>
                <strong>
                  1<sup>er</sup> janvier 2025
                </strong>{' '}
                : G interdit à la location (1,8 M logements concernés)
              </li>
              <li>
                <strong>
                  1<sup>er</sup> janvier 2028
                </strong>{' '}
                : F interdit (3,3 M logements)
              </li>
              <li>
                <strong>
                  1<sup>er</sup> janvier 2034
                </strong>{' '}
                : E interdit (7,2 M logements)
              </li>
            </ul>
            <p>
              Au total, <strong>12,3 millions de logements</strong> seront concernés par
              l’interdiction location d’ici 2034 — soit <strong>41 % du parc</strong>. Le marché
              devrait quasi-doubler entre 2024 et 2030 selon les projections BPI France.
            </p>

            <h2>6. Méthodologie</h2>
            <p>
              Les données présentées sont agrégées à partir de sources publiques officielles
              françaises et européennes. Toutes les valeurs sont datées (2024 ou 2025 selon
              disponibilité). Les projections 2025 et 2026 sont basées sur les tendances 2020-2024
              ajustées par les annonces gouvernementales et la Cour des comptes.
            </p>
            <ul>
              <li>
                <strong>Parc logements</strong> : INSEE Recensement 2021 + bilans annuels ADEME
                2022-2024
              </li>
              <li>
                <strong>MaPrimeRénov’</strong> : bilans annuels ANAH 2020-2024 + projections Cour
                des comptes 2025
              </li>
              <li>
                <strong>RGE</strong> : annuaire public france-renov.gouv.fr (mise à jour
                hebdomadaire) + dataset data.gouv.fr
              </li>
              <li>
                <strong>Marché €</strong> : étude BPI France 2024 + observatoire Effinergie
              </li>
              <li>
                <strong>Émissions CO₂</strong> : Citepa, inventaire émissions GES France
              </li>
            </ul>

            <h2>Réutilisation et citation (CC-BY 4.0)</h2>
            <div className="not-prose border-2 border-emerald-200 bg-emerald-50 rounded-lg p-5 my-6">
              <div className="flex items-start gap-3">
                <Database className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" aria-hidden />
                <div>
                  <p className="font-semibold text-emerald-900 m-0">
                    Données librement réutilisables sous licence{' '}
                    <a
                      href="https://creativecommons.org/licenses/by/4.0/deed.fr"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      Creative Commons CC-BY 4.0
                    </a>
                  </p>
                  <p className="text-sm text-emerald-900 mt-2 mb-0">
                    Citation requise (texte ou lien hypertexte) : « Source : Baromètre Rénovation
                    Énergétique 2026, ServicesArtisans, données agrégées ADEME / ANAH / France
                    Rénov’ — {PAGE_URL} ». Réutilisation autorisée à des fins commerciales et non
                    commerciales, avec ou sans modification, sous réserve de la citation.
                  </p>
                </div>
              </div>
            </div>
          </article>

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
              href="/barometre"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Hub Baromètre
            </Link>
            <a
              href="https://www.data.gouv.fr/fr/datasets/liste-des-entreprises-rge"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Source RGE data.gouv.fr <ExternalLink className="w-3.5 h-3.5" aria-hidden />
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
