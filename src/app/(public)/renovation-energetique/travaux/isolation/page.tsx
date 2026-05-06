/**
 * Page : /renovation-energetique/travaux/isolation
 *
 * @kw-primary    isolation thermique
 * @kw-volume     5747
 * @kw-kd         11
 * @kw-cpc        0.35
 * @intent        info
 * @cluster       reno-energetique-isolation-hub
 * @ahrefs-source api-live
 * @snapshot      2026-05-06
 * @backlog-item  Sprint 2 hub Isolation pillar
 *
 * KW cibles (validés Ahrefs API live, snapshot 2026-05-03, country=fr) :
 * - "isolation thermique"     → 5 747 vol, KD 11, CPC $0,35, clicks 4 604 ⭐⭐⭐
 * - "isolation"               → ~15K vol estimé (KW générique, KD plus haut)
 * - "isolation maison"        → ~1 500 vol estimé
 * - "type isolation"          → ~300 vol estimé
 * - Famille cumulée pivot : ~7 500 vol/mois (sans compter sub-pages combles/ITE/ITI)
 *
 * Source : audit Ahrefs API live. Pivot moyen-difficile (KD 11) mais vol massif.
 * Easy win : PARTIEL (KD 11, vol > 5 000)
 * Cluster pillar : Rénovation Énergétique → Travaux → Isolation
 *
 * Anti-cannibalisation :
 *   - Source guide /guides/isolation-ite-iti-rge-aides-2026 (509 lignes ITE/ITI)
 *   - Source guide /guides/prix-isolation-combles-100m2 (312 lignes prix combles)
 *   - Cette page = HUB pillar (3 types isolation : combles, ITE, ITI/intérieure)
 *   - Sub-pages : /combles/, /exterieure-ite/, /interieure/ (livrées en parallèle Sprint V)
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Layers,
  Layers3,
  Home,
  ShieldCheck,
  CheckCircle2,
  Calculator,
  TrendingDown,
  AlertTriangle,
  Snowflake,
  CloudRain,
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

const PAGE_PATH = '/renovation-energetique/travaux/isolation'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-03'
const MODIFIED = '2026-05-03'
const AUTHOR_SLUG = 'sophie-martin'
const AUTHOR_NAME = 'Sophie Martin'

const TITLE = 'Isolation thermique 2026 : prix & aides'
const DESCRIPTION =
  'Isolation thermique 2026 : combles, murs ITE/ITI, planchers. Prix au m², techniques, matériaux, aides MPR + CEE jusquà 75 €/m².'

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

type IsolationType = {
  slug: string
  name: string
  icon: typeof Layers
  position: string
  prixM2: string
  performance: string
  bestFor: string
  drawbacks: string
  aidesMax: string
  rgeQual: string
}

const ISOLATION_TYPES: IsolationType[] = [
  {
    slug: 'combles',
    name: 'Isolation des combles',
    icon: Home,
    position: 'Toiture (combles perdus ou aménagés)',
    prixM2: '15 à 50 €/m² posée selon technique (soufflage, déroulé, sarking)',
    performance: 'R 7 m².K/W minimum (combles perdus), R 6 (combles aménagés)',
    bestFor:
      'Premier poste à traiter en rénovation. 30 % des déperditions thermiques passent par la toiture mal isolée.',
    drawbacks:
      'Combles aménagés : perte 5-10 cm hauteur sous plafond. Combles perdus : aucun inconvénient.',
    aidesMax: 'MaPrimeRénov’ jusqu’à 25 €/m² + CEE jusqu’à 12 €/m²',
    rgeQual: 'Qualibat 7131 (combles perdus) ou 7141 (aménagés)',
  },
  {
    slug: 'exterieure-ite',
    name: 'Isolation par l’extérieur (ITE)',
    icon: Layers,
    position: 'Murs extérieurs (façade)',
    prixM2: '120 à 250 €/m² posée selon technique (bardage, enduit, vêture)',
    performance: 'R 3,7 m².K/W minimum (mur extérieur)',
    bestFor:
      'Maison avec ravalement à prévoir. Élimine 100 % des ponts thermiques. Pas de perte de surface intérieure.',
    drawbacks:
      'Investissement initial élevé. Modifie l’aspect extérieur (déclaration préalable de travaux requise). PLU et ABF possible.',
    aidesMax: 'MaPrimeRénov’ jusqu’à 75 €/m² + CEE jusqu’à 25 €/m²',
    rgeQual: 'Qualibat 5911 (ITE)',
  },
  {
    slug: 'interieure',
    name: 'Isolation par l’intérieur (ITI)',
    icon: Snowflake,
    position: 'Murs intérieurs (doublage)',
    prixM2: '40 à 80 €/m² posée (doublage collé ou ossature métallique)',
    performance: 'R 3,7 m².K/W minimum (mur intérieur)',
    bestFor:
      'Pas de modification façade nécessaire. Coût plus accessible que l’ITE. Compatible copropriété sans accord.',
    drawbacks:
      'Perte 8-12 cm sur surface intérieure. Ne traite pas les ponts thermiques. Travaux dans le logement.',
    aidesMax: 'MaPrimeRénov’ jusqu’à 25 €/m² + CEE jusqu’à 15 €/m²',
    rgeQual: 'Qualibat 5912 (ITI)',
  },
  {
    slug: 'toiture',
    name: 'Isolation de la toiture (sarking, rampants)',
    icon: CloudRain,
    position: 'Toiture par-dessus (sarking) ou sous rampants (intérieur)',
    prixM2: '50 à 180 €/m² posée — sarking extérieur 80-180 €/m², rampants intérieur 50-120 €/m²',
    performance: 'R 6 m².K/W minimum (rampants), R 4,5 m².K/W (toiture-terrasse)',
    bestFor:
      'Réfection complète de toiture (sarking) ou combles aménagés sans surcoût intérieur. Conserve totalement le volume habitable.',
    drawbacks:
      'Sarking : ne se justifie qu’en réfection de couverture. Rampants intérieur : perte 12-22 cm sous chevrons.',
    aidesMax:
      'MaPrimeRénov’ forfait selon revenus (R ≥ 6 m².K/W) + CEE BAR-EN-101. Voir france-renov.gouv.fr.',
    rgeQual: 'Qualibat 7131/7132 (rampants/sarking) ou 8211 (couverture)',
  },
  {
    slug: 'sol',
    name: 'Isolation plancher bas (sol, cave, vide-sanitaire)',
    icon: Layers3,
    position: 'Plancher bas par dessous (cave/garage/VS) ou par dessus (chape)',
    prixM2:
      '25 à 110 €/m² posée — par dessous 25-50 €/m², mousse projetée 35-70 €/m², chape isolante 60-110 €/m²',
    performance: 'R 3 m².K/W minimum (CEE BAR-EN-103)',
    bestFor:
      'Cave/sous-sol/garage accessibles : poste rentable après combles. ROI 3-7 ans, confort sols immédiat.',
    drawbacks:
      'Sol sur terre-plein non éligible BAR-EN-103. Vide-sanitaire bas (< 60 cm) : mousse projetée obligatoire.',
    aidesMax:
      'MaPrimeRénov’ forfait selon revenus + CEE BAR-EN-103 (forfait kWhc/m² H1 1 600 / H2 1 300 / H3 900).',
    rgeQual: 'Qualibat 7131 / 7191 (plancher) / 5232 (mousse PU)',
  },
]

const tldr = [
  'L’isolation thermique réduit les déperditions de chaleur par 3 postes : toiture (30 %), murs (25 %), planchers/menuiseries (20 %).',
  '3 grandes techniques : isolation des combles (15-50 €/m²), ITE extérieure (120-250 €/m²), ITI intérieure (40-80 €/m²).',
  'Aides 2026 cumulables : MaPrimeRénov’ jusqu’à 75 €/m² (ITE) + Coup de pouce CEE jusqu’à 25 €/m² + TVA 5,5 %.',
  'Artisan RGE Qualibat obligatoire pour toucher les aides. Mentions 5911 (ITE), 5912 (ITI), 7131/7141 (combles).',
  'Économies typiques : -25 à -45 % sur la facture chauffage selon le poste isolé et la qualité de l’existant.',
]

const faqs = [
  {
    question: 'Par quelle isolation commencer en rénovation ?',
    answer:
      'Toujours par les combles : c’est le poste le plus rentable (30 % des déperditions, prix au m² le plus bas). Comptez 15-50 €/m² posé pour gagner immédiatement 20-25 % sur la facture chauffage. Ensuite vient l’isolation des murs (ITE ou ITI selon contexte), puis les planchers bas et les menuiseries.',
  },
  {
    question: 'ITE ou ITI : laquelle choisir ?',
    answer:
      'ITE (extérieure) si vous prévoyez un ravalement de façade ou si vous voulez éliminer 100 % des ponts thermiques sans perdre de surface intérieure. Coût supérieur (120-250 €/m²) mais aides jusqu’à 75 €/m². ITI (intérieure) si la façade ne peut être modifiée (copropriété, PLU, ABF) ou pour un budget plus serré (40-80 €/m²). L’ITE est privilégiée par les aides MaPrimeRénov’ Parcours accompagné.',
  },
  {
    question: 'Quel coefficient R minimum pour les aides ?',
    answer:
      'Pour MaPrimeRénov’ et CEE : R ≥ 7 m².K/W pour les combles perdus, R ≥ 6 m².K/W pour les combles aménagés et rampants, R ≥ 3,7 m².K/W pour les murs (ITE et ITI), R ≥ 3 m².K/W pour les planchers bas. R = résistance thermique, exprimée en m².K/W (plus c’est élevé, plus l’isolation est performante).',
  },
  {
    question: 'Quels matériaux isolants choisir ?',
    answer:
      'Laine de verre (la plus répandue, économique, R correct), laine de roche (idéale combles + acoustique), ouate de cellulose (écologique, soufflée), polyuréthane PUR/PIR (performance maximale par épaisseur, mais cher), fibre de bois (biosourcée, ITE ou ITI), laine de chanvre (biosourcée). Tous les matériaux certifiés ACERMI sont éligibles aux aides.',
  },
  {
    question: 'Combien d’aides cumulables en 2026 pour l’isolation ?',
    answer:
      'Cumul typique sur ITE 100 m² : MaPrimeRénov’ 75 €/m² (très modestes) + CEE 25 €/m² + TVA 5,5 % automatique = 10 000 € d’aides sur un projet 18 000 €. Reste à charge ~8 000 € pour très modestes. Pour un projet « rénovation performante » (gain ≥ 2 classes DPE), ajouter MaPrimeRénov’ Parcours accompagné jusqu’à 70 000 € au total.',
  },
  {
    question: 'L’isolation des combles à 1 € existe-t-elle encore en 2026 ?',
    answer:
      'Non. L’opération « isolation à 1 € » a été supprimée en 2021 suite aux scandales d’éco-démarchage frauduleux. Toute offre « à 1 € » en 2026 est une arnaque (souvent travaux bâclés + reste à charge caché en post-installation). En revanche, le Coup de pouce CEE Isolation reste actif et peut couvrir 50-90 % du coût pour les ménages très modestes.',
  },
  {
    question: 'Combien d’économies réelles sur la facture de chauffage ?',
    answer:
      'Combles isolés correctement : -20 à -25 % de la facture. Murs ITE : -15 à -20 %. ITI : -10 à -15 %. Planchers bas : -5 à -10 %. Cumul des 3 isolations : -35 à -55 % vs un logement non isolé. Sur une facture annuelle 2 500 € (chauffage gaz/fioul), l’économie peut atteindre 1 000-1 400 €/an.',
  },
  {
    question: 'Quelle qualification RGE pour mon artisan isolation ?',
    answer:
      'Qualibat est l’organisme principal : mention 7131 pour les combles perdus, 7141 pour les combles aménagés, 5911 pour l’ITE, 5912 pour l’ITI. Vérification gratuite sur qualibat.com avec le SIRET. Sans qualification RGE en cours de validité à la date de signature du devis, vous perdez l’accès aux aides MaPrimeRénov’, CEE et TVA 5,5 %.',
  },
]

const sources = [
  {
    label: 'France Rénov’ — Aides isolation',
    url: 'https://france-renov.gouv.fr/aides/maprimerenov',
  },
  { label: 'ADEME — Guide isolation thermique', url: 'https://agir.ademe.fr' },
  { label: 'ACERMI — Certification matériaux isolants', url: 'https://www.acermi.com' },
  { label: 'Qualibat — Annuaire RGE isolation', url: 'https://www.qualibat.com' },
  {
    label: 'Service-Public.fr — Aides isolation',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F35632',
  },
]

const relatedPages = [
  {
    label: 'Isolation des combles : prix et techniques',
    href: '/renovation-energetique/travaux/isolation/combles',
    description: 'Soufflage, déroulé, sarking — combles perdus et aménagés',
  },
  {
    label: 'ITE isolation par l’extérieur : prix et aides',
    href: '/renovation-energetique/travaux/isolation/exterieure-ite',
    description: 'Bardage, enduit sur isolant — aides jusqu’à 75 €/m²',
  },
  {
    label: 'ITI isolation par l’intérieur',
    href: '/renovation-energetique/travaux/isolation/interieure',
    description: 'Doublage murs intérieurs — alternative à l’ITE',
  },
  {
    label: 'Guide ITE/ITI/RGE complet 2026',
    href: '/guides/isolation-ite-iti-rge-aides-2026',
    description: 'Comparatif technique détaillé ITE vs ITI + aides',
  },
  {
    label: 'Prix isolation combles 100 m²',
    href: '/guides/prix-isolation-combles-100m2',
    description: 'Étude de cas chiffrée + ROI',
  },
  {
    label: 'Trouver un artisan isolation RGE',
    href: '/rge/renovation-energetique',
    description: 'Annuaire vérifié Qualibat 5911/5912/7131/7141',
  },
  {
    label: 'Isolation phonique (acoustique)',
    href: '/renovation-energetique/travaux/isolation/phonique',
    description: 'Mur, plafond, sol, fenêtre — hors aides MPR/CEE',
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
    section: 'Travaux — Isolation',
    keywords: [
      'isolation thermique',
      'isolation maison',
      'isolation combles',
      'isolation murs',
      'ITE',
      'ITI',
      'aides isolation',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique#travaux' },
    { name: 'Isolation', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const financialSchema = getFinancialProductSchema({
    name: 'Aides isolation thermique 2026 (MaPrimeRénov’ + CEE)',
    description:
      'Cumul MaPrimeRénov’ par geste + Coup de pouce CEE Isolation pour les travaux d’isolation des combles, murs (ITE ou ITI) et planchers par un artisan RGE Qualibat.',
    url: PAGE_URL,
    category: 'Government Grant',
    amount: 'Jusqu’à 75 €/m² selon poste et revenus',
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
              { label: 'Travaux', href: '/renovation-energetique#travaux' },
              { label: 'Isolation' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Layers className="w-3.5 h-3.5" aria-hidden />
              Travaux &middot; Isolation thermique
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Isolation thermique en 2026 : prix, types et aides
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              L’<strong>isolation thermique</strong> est le poste de rénovation énergétique le plus
              rentable, avec des aides cumulables MaPrimeRénov’ + CEE jusqu’à{' '}
              <strong>75 €/m²</strong>. Trois grandes techniques selon les zones traitées :
              isolation des combles (15-50 €/m²), ITE extérieure (120-250 €/m²) ou ITI intérieure
              (40-80 €/m²). Voici le guide complet pour choisir et chiffrer.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Les 3 types d’isolation thermique</h2>
            <p>
              Le bilan thermique d’une maison classique (RT 2012) répartit les déperditions ainsi :{' '}
              <strong>30 % par la toiture</strong>, 25 % par les murs, 13 % par les fenêtres, 7 %
              par le plancher bas, 25 % par le renouvellement d’air. Trois grandes techniques
              d’isolation s’adressent à ces zones :
            </p>

            <div className="not-prose grid gap-4 my-6">
              {ISOLATION_TYPES.map((iso) => {
                const Icon = iso.icon
                return (
                  <div
                    key={iso.slug}
                    className="bg-white border border-sand-200 rounded-xl p-5 md:p-6"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-700 grid place-items-center shrink-0">
                        <Icon className="w-5 h-5" aria-hidden />
                      </div>
                      <div>
                        <h3 className="font-heading text-lg font-semibold text-sand-900 m-0">
                          <Link
                            href={`/renovation-energetique/travaux/isolation/${iso.slug}`}
                            className="hover:text-primary-700"
                          >
                            {iso.name}
                          </Link>
                        </h3>
                        <p className="text-sm text-sand-600 mt-1 mb-0">{iso.position}</p>
                      </div>
                    </div>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div>
                        <dt className="font-semibold text-sand-700">Prix posée</dt>
                        <dd className="m-0 text-sand-900">{iso.prixM2}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-sand-700">Performance R min</dt>
                        <dd className="m-0 text-sand-900">{iso.performance}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-sand-700">Idéal pour</dt>
                        <dd className="m-0 text-sand-900">{iso.bestFor}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-sand-700">Limites</dt>
                        <dd className="m-0 text-sand-900">{iso.drawbacks}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-sand-700">Aides max 2026</dt>
                        <dd className="m-0 text-sand-900">{iso.aidesMax}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-sand-700">Qualif. RGE requise</dt>
                        <dd className="m-0 text-sand-900">{iso.rgeQual}</dd>
                      </div>
                    </dl>
                    <div className="mt-3">
                      <Link
                        href={`/renovation-energetique/travaux/isolation/${iso.slug}`}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-primary-700 hover:underline"
                      >
                        Détail prix et techniques <ArrowRight className="w-4 h-4" aria-hidden />
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>

            <h2>Par où commencer en rénovation ?</h2>
            <p>L’ordre d’attaque optimal en rénovation énergétique :</p>
            <ol>
              <li>
                <strong>Combles</strong> en priorité absolue (30 % des déperditions, prix au m² le
                plus bas, ROI 3-5 ans).
              </li>
              <li>
                <strong>Murs</strong> (ITE ou ITI selon contexte) — 25 % des déperditions,
                investissement plus lourd mais aides massives.
              </li>
              <li>
                <strong>Plancher bas</strong> (vide sanitaire ou cave) — 7 % des déperditions,
                souvent rapide.
              </li>
              <li>
                <strong>Menuiseries</strong> (fenêtres double/triple vitrage) — 13 % des
                déperditions, dernier poste car coût élevé pour gain modéré.
              </li>
              <li>
                <strong>Ventilation</strong> (VMC double flux) — indispensable après isolation pour
                éviter humidité et moisissures.
              </li>
            </ol>

            <h2>Aides 2026 : combien récupérer</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Poste isolation</th>
                    <th className="p-3 border-b border-sand-200">MaPrimeRénov’ max</th>
                    <th className="p-3 border-b border-sand-200">CEE max</th>
                    <th className="p-3 border-b border-sand-200">Cumul max</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Combles perdus', '25 €/m²', '12 €/m²', '37 €/m²'],
                    ['Combles aménagés / rampants', '25 €/m²', '12 €/m²', '37 €/m²'],
                    ['Murs ITE (extérieur)', '75 €/m²', '25 €/m²', '100 €/m²'],
                    ['Murs ITI (intérieur)', '25 €/m²', '15 €/m²', '40 €/m²'],
                    ['Plancher bas', '30 €/m²', '15 €/m²', '45 €/m²'],
                  ].map(([poste, mpr, cee, cumul]) => (
                    <tr key={poste} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold">{poste}</td>
                      <td className="p-3">{mpr}</td>
                      <td className="p-3">{cee}</td>
                      <td className="p-3 font-semibold text-primary-800">{cumul}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Montants indicatifs 2026, ménages très modestes. Vérifier sur france-renov.gouv.fr
                selon votre situation.
              </p>
            </div>

            <div className="not-prose border-2 border-red-200 bg-red-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" aria-hidden />
              <div className="text-sm text-red-900">
                <p className="font-semibold m-0 mb-1">« Isolation à 1 € » = arnaque en 2026</p>
                <p className="m-0">
                  L’opération à 1 € a été supprimée en 2021. Toute offre « à 1 € » en 2026 cache un
                  travail bâclé ou un reste à charge dissimulé. La DGCCRF poursuit ces fraudes. Le
                  Coup de pouce CEE Isolation reste actif et peut couvrir 50-90 % du coût pour les
                  très modestes — sans atteindre le « 1 € ».
                </p>
              </div>
            </div>

            <h2>RGE Qualibat obligatoire</h2>
            <p>
              Pour bénéficier de MaPrimeRénov’, du Coup de pouce CEE et de la TVA 5,5 %, l’artisan
              doit être titulaire d’une qualification <strong>RGE Qualibat</strong> correspondant au
              poste de travaux. Vérification gratuite en 30 secondes sur{' '}
              <Link href="/rge/labels/qualibat">qualibat.com</Link>.
            </p>
            <ul>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Combles perdus : Qualibat <strong>7131</strong>
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Combles aménagés / rampants : Qualibat <strong>7141</strong>
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                ITE (isolation extérieure) : Qualibat <strong>5911</strong>
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                ITI (isolation intérieure) : Qualibat <strong>5912</strong>
              </li>
            </ul>

            <h2>Économies sur la facture chauffage</h2>
            <ul>
              <li>
                <TrendingDown className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Combles isolés : -20 à -25 %
              </li>
              <li>
                <TrendingDown className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Murs ITE : -15 à -20 %
              </li>
              <li>
                <TrendingDown className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Murs ITI : -10 à -15 %
              </li>
              <li>
                <TrendingDown className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Cumul 3 isolations : -35 à -55 % vs logement non isolé
              </li>
            </ul>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Simulez vos aides isolation en 2 minutes
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Calculateur officiel basé sur les barèmes 2026 MaPrimeRénov’ + Coup de pouce CEE
                    Isolation. Mise en relation avec 3 artisans Qualibat RGE.
                  </p>
                  <Link
                    href="/simulateur-aides-renovation"
                    className="inline-flex items-center gap-1.5 bg-primary-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-800 transition-colors"
                  >
                    Lancer le simulateur <ArrowRight className="w-4 h-4" aria-hidden />
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
                    className="flex items-start justify-between gap-2 bg-white border border-sand-200 rounded-lg p-4 hover:border-primary-400 hover:shadow-sm transition-all"
                  >
                    <div>
                      <p className="text-sm font-semibold text-sand-900 m-0">{g.label}</p>
                      <p className="text-xs text-sand-600 mt-1 mb-0">{g.description}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-sand-400 shrink-0 mt-1" aria-hidden />
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
              href="/renovation-energetique"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Hub Rénovation énergétique
            </Link>
            <Link
              href="/rge/renovation-energetique"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Artisans isolation RGE <ShieldCheck className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
