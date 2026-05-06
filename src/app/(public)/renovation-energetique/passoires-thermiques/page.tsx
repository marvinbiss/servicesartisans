/**
 * Page : /renovation-energetique/passoires-thermiques
 *
 * KW cibles (validés Ahrefs API live, snapshot 2026-05-03, country=fr) :
 * - "passoire thermique"            → 2 959 vol, KD 1, CPC $0,08, clicks 5 242 ⭐
 * - "passoire energetique"          → 150 vol, KD 8, CPC $0,25 (variant orthographique)
 * - "logement passoire thermique"   → 100 vol, KD 4, CPC $0,10
 * - "loi passoire thermique"        → 100 vol, KD 10, CPC $0,10
 * - "passoire thermique location"   → 98 vol, KD 6, CPC $0,01
 * - "passoire thermique vente"      → 50 vol, KD 0, CPC $0,04
 * - "passoire thermique 2025"       → 20 vol, KD 0
 * - Famille cumulée pivot : ~3 500 vol/mois
 *
 * Source : audit Ahrefs API live (cf docs/ahrefs-audit-2026-04/STRATEGIE-RENOVATION-ENERGETIQUE.md
 *          recalibré 2026-05-03 — l'audit du 19/04 estimait 8K vol KD 30, vrai = 2 959 KD 1)
 * Easy win : OUI (KD 1 sur KW pivot, vol > 2 500, intent informationnel pur)
 * Cluster pillar : Rénovation Énergétique → Passoires thermiques
 *
 * Anti-cannibalisation :
 *   - Source guide /guides/passoire-thermique-renovation (253 lignes, focus comment rénover)
 *   - Cette page = HUB définition + lois + calendrier + conséquences (intent général "qu'est-ce que c'est")
 *   - Sub-pages livrées Vague D 2026-05-04 :
 *       /interdiction-location-g-f/ (focus obligations bailleur + sanctions)
 *       /calendrier-2025-2028-2034/ (focus chronologie 8 dates clés + impact par profil)
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  AlertTriangle,
  Calendar,
  Home,
  TrendingDown,
  ShieldCheck,
  Calculator,
  CheckCircle2,
  Thermometer,
  Scale,
} from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import LastUpdated from '@/components/seo/LastUpdated'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import { getBreadcrumbSchema, getFAQSchema, getGovernmentServiceSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'

export const revalidate = 86400

const PAGE_PATH = '/renovation-energetique/passoires-thermiques'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-03'
const MODIFIED = '2026-05-03'
const AUTHOR_SLUG = 'claire-dubois'
const AUTHOR_NAME = 'Claire Dubois'

const TITLE = 'Passoire thermique 2026 : DPE F/G & loi'
const DESCRIPTION =
  'Passoire thermique 2026 : logements DPE F et G, location interdite (G depuis 2025, F en 2028). Calendrier complet, conséquences, aides rénovation.'

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

const tldr = [
  'Une passoire thermique est un logement dont le DPE affiche la classe F ou G (consommation > 330 kWh/m²/an).',
  'Location G interdite depuis le 1er janvier 2025. F sera interdit en 2028. E en 2034.',
  'Vente : audit énergétique obligatoire depuis 2023 pour les logements F et G en monopropriété.',
  'Décote à la revente : -5 à -15 % pour un F, -10 à -20 % pour un G (étude Notaires de France 2024).',
  'Aides cumulables jusqu’à 70 000 € (MaPrimeRénov’ Parcours accompagné) pour rénover et sortir du statut passoire.',
]

const CALENDAR = [
  {
    date: '1er janvier 2025',
    label: 'Interdiction location DPE G',
    detail:
      'Tout logement classé G ne peut plus être proposé à la location nue ou meublée (résidence principale du locataire). Concerne les nouveaux baux et renouvellements.',
    sourceLabel: 'Loi Climat et Résilience 2021',
  },
  {
    date: '1er janvier 2028',
    label: 'Interdiction location DPE F',
    detail:
      'Extension aux logements classés F. Estimé à ~1,8 million de logements supplémentaires concernés en France métropolitaine.',
    sourceLabel: 'Loi Climat et Résilience 2021',
  },
  {
    date: '1er janvier 2034',
    label: 'Interdiction location DPE E',
    detail:
      'Plus de 7 millions de logements concernés cumulés. Le seuil énergétique passe à environ 250 kWh/m²/an.',
    sourceLabel: 'Loi Climat et Résilience 2021',
  },
  {
    date: 'Depuis 2023',
    label: 'Audit énergétique obligatoire vente F/G',
    detail:
      'Pour la vente d’une maison individuelle classée F ou G, l’audit énergétique est obligatoire en plus du DPE. Étendu aux classes E à partir du 1er janvier 2025.',
    sourceLabel: 'Décret n° 2022-780',
  },
]

const CONSEQUENCES = [
  {
    profile: 'Propriétaire-bailleur',
    icon: Home,
    items: [
      'Impossible de louer un G depuis 2025, F depuis 2028, E depuis 2034',
      'Interdiction d’augmenter le loyer (gel des loyers depuis août 2022 pour les passoires)',
      'Le locataire peut exiger des travaux et saisir le tribunal en cas de refus',
      'Bail non opposable si le logement reste classé G après 2025 (locataire peut quitter sans préavis)',
    ],
  },
  {
    profile: 'Propriétaire vendeur',
    icon: TrendingDown,
    items: [
      'Audit énergétique obligatoire (en plus du DPE) — coût 500 à 1 200 € TTC',
      'Décote moyenne -5 à -15 % pour un F, -10 à -20 % pour un G (Notaires 2024)',
      'Délai de vente rallongé : +30 à +60 jours en moyenne pour les passoires',
      'Acheteurs négocient sur la base du devis de rénovation thermique nécessaire',
    ],
  },
  {
    profile: 'Propriétaire occupant',
    icon: Thermometer,
    items: [
      'Pas d’interdiction d’occupation (la loi vise les locations, pas l’usage perso)',
      'Inconfort thermique : factures de chauffage 2 à 3 fois supérieures à la moyenne',
      'Aides rénovation maximales (jusqu’à 90 % du devis pour les très modestes en parcours accompagné)',
      'Valorisation du bien à la revente : sortie de la classe F = +5 à +10 % de prix',
    ],
  },
]

const SORTIR_PASSOIRE = [
  {
    step: 'Audit énergétique',
    detail:
      'Réalisé par un auditeur agréé France Rénov’ (500-1 200 € TTC). Il identifie les postes prioritaires (isolation toiture, murs, chauffage, ventilation) et propose 2 scénarios chiffrés pour atteindre la classe E ou D minimum.',
  },
  {
    step: 'Mon Accompagnateur Rénov’',
    detail:
      'Obligatoire pour les aides MaPrimeRénov’ Parcours accompagné (> 5 000 €). Coût 200-2 000 € (souvent pris en charge à 100 % pour les modestes). Pilote le projet de A à Z.',
  },
  {
    step: 'Travaux groupés (gain ≥ 2 classes DPE)',
    detail:
      'Pour bénéficier du Parcours accompagné MaPrimeRénov’, le projet doit faire gagner au moins 2 classes DPE. Combinaison typique : isolation thermique + remplacement chauffage (PAC, chaudière biomasse).',
  },
  {
    step: 'Aides cumulées',
    detail:
      'MaPrimeRénov’ Parcours accompagné jusqu’à 70 000 € + CEE Coup de pouce + TVA 5,5 % + éco-PTZ jusqu’à 50 000 € sans intérêts. Reste à charge typique 10-30 % du projet pour les modestes.',
  },
  {
    step: 'Nouveau DPE',
    detail:
      'Réalisé après travaux (200-400 € TTC). Atteste de la nouvelle classe énergétique. Indispensable pour relouer ou revendre sans décote, et pour obtenir le solde des aides.',
  },
]

const faqs = [
  {
    question: 'Qu’est-ce qu’une passoire thermique ?',
    answer:
      'Une passoire thermique est un logement dont le diagnostic de performance énergétique (DPE) affiche la classe F ou G — autrement dit, dont la consommation primaire dépasse 330 kWh/m²/an et/ou les émissions de gaz à effet de serre 70 kg CO2/m²/an. La France comptait environ 5,2 millions de passoires en 2024 (étude SDES 2024), soit ~17 % du parc résidentiel.',
  },
  {
    question: 'Quels logements sont déjà interdits à la location en 2026 ?',
    answer:
      'Depuis le 1er janvier 2025, tous les logements classés G ne peuvent plus être proposés à la location en résidence principale (bail nu ou meublé). À partir du 1er janvier 2028, l’interdiction s’étendra aux logements F. En 2034, ce sera le tour des logements E. La règle s’applique aux nouveaux baux et aux renouvellements.',
  },
  {
    question: 'Que risque un propriétaire qui loue malgré tout une passoire G en 2026 ?',
    answer:
      'Trois risques cumulés. (1) Le locataire peut saisir le juge des contentieux pour faire condamner le bailleur à effectuer les travaux nécessaires sous peine d’astreinte (centaines à milliers d’euros par mois de retard). (2) Le locataire peut faire baisser le loyer judiciairement. (3) En cas de litige récurrent, le contrat de bail peut être annulé. Aucune amende administrative directe à ce jour, mais la jurisprudence se durcit.',
  },
  {
    question: 'Suis-je obligé de faire un audit énergétique pour vendre ma passoire ?',
    answer:
      'Oui depuis 2023 pour les maisons individuelles classées F ou G en monopropriété. Étendu aux maisons classées E depuis le 1er janvier 2025. L’audit (500-1 200 € TTC) est annexé au DPE et présenté à l’acheteur. Il propose 2 scénarios chiffrés de rénovation pour atteindre les classes B et C. Pas requis pour les copropriétés, ni pour les appartements en copropriété.',
  },
  {
    question: 'Combien coûte la rénovation d’une passoire thermique ?',
    answer:
      'En moyenne 35 000 à 80 000 € TTC pour passer de F/G à C/D, selon la surface, l’état initial et les postes à traiter (isolation toiture + murs + chauffage + ventilation). Avec MaPrimeRénov’ Parcours accompagné (jusqu’à 70 000 €) + CEE + TVA 5,5 % + éco-PTZ, le reste à charge tombe à 10-30 % du projet pour les ménages modestes.',
  },
  {
    question: 'Existe-t-il des dérogations à l’interdiction de location ?',
    answer:
      'Oui dans 3 cas. (1) Logement situé dans un secteur protégé par les Architectes des Bâtiments de France (ABF) si les travaux ne peuvent être réalisés sans dénaturer le bâti. (2) Coût des travaux disproportionnés par rapport à la valeur du bien (>50 % de la valeur vénale). (3) Refus de la copropriété pour des travaux affectant les parties communes. Ces dérogations restent rares et nécessitent une décision préfectorale ou de copropriété justifiée.',
  },
  {
    question: 'Comment vérifier si mon logement est une passoire thermique ?',
    answer:
      'Consultez le DPE de votre logement (obligatoire à la vente et à la location depuis 2007, recalculé tous les 10 ans). Si la lettre est F ou G, vous êtes en zone passoire. Le DPE est consultable sur l’Observatoire DPE-Audit (observatoire-dpe.ademe.fr) à partir de l’adresse. Si vous n’en avez pas, faire réaliser un nouveau DPE coûte 100 à 250 € TTC par un diagnostiqueur certifié.',
  },
  {
    question: 'Quelles aides en 2026 pour sortir mon logement du statut passoire ?',
    answer:
      'MaPrimeRénov’ Parcours accompagné (jusqu’à 70 000 € pour gain ≥ 2 classes DPE), MaPrimeRénov’ par geste (jusqu’à 11 000 € géothermie), Coup de pouce CEE (3 000-5 000 €), éco-PTZ jusqu’à 50 000 € sans intérêts, TVA 5,5 % automatique avec artisan RGE. Cumul possible : un projet 60 000 € peut tomber à 8 000-15 000 € de reste à charge pour un ménage très modeste.',
  },
]

const sources = [
  {
    label: 'Service-Public.fr — Interdiction location passoires',
    url: 'https://www.service-public.fr/particuliers/actualites/A15777',
  },
  {
    label: 'Légifrance — Loi Climat et Résilience 2021',
    url: 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000043956924',
  },
  {
    label: 'France Rénov’ — Aides rénovation passoire',
    url: 'https://france-renov.gouv.fr/aides/maprimerenov-parcours-accompagne',
  },
  { label: 'ADEME — Observatoire DPE-Audit', url: 'https://observatoire-dpe-audit.ademe.fr' },
  {
    label: 'Notaires de France — Étude DPE et prix immobilier 2024',
    url: 'https://www.notaires.fr',
  },
]

const relatedPages = [
  {
    label: 'DPE classe G : sortir de la passoire',
    href: '/renovation-energetique/diagnostic/dpe/classes/g',
    description: 'Seuils 3CL-2021, audit vente, 5 sauts G→F/E/D/C/B chiffrés',
  },
  {
    label: 'Interdiction location DPE G et F 2026',
    href: '/renovation-energetique/passoires-thermiques/interdiction-location-g-f',
    description: 'Obligations bailleurs, sanctions, recours locataires, dérogations',
  },
  {
    label: 'Calendrier interdiction passoires 2025-2034',
    href: '/renovation-energetique/passoires-thermiques/calendrier-2025-2028-2034',
    description: 'Loi Climat 2021 : 8 dates clés DPE G/F/E + audit + copropriétés',
  },
  {
    label: 'Passoire thermique : guide rénovation complet',
    href: '/guides/passoire-thermique-renovation',
    description: 'Étapes, devis, aides détaillées pour rénover une F ou G',
  },
  {
    label: 'DPE mauvais (E/F/G) : que faire ?',
    href: '/guides/dpe-mauvais-que-faire',
    description: 'Décryptage du DPE et leviers prioritaires de remontée',
  },
  {
    label: 'MaPrimeRénov’ Parcours accompagné',
    href: '/guides/maprimerenov-parcours-accompagne',
    description: 'Aide jusqu’à 70 000 € pour rénovations d’ampleur',
  },
  {
    label: 'Audit énergétique : prix et obligations 2026',
    href: '/guides/audit-energetique-prix-aides',
    description: 'Audit obligatoire vente F/G, coûts, contenu, avis',
  },
  {
    label: 'Pompe à chaleur : prix et aides 2026',
    href: '/renovation-energetique/travaux/pompe-a-chaleur',
    description: 'Solution chauffage centrale pour sortir d’une passoire',
  },
  {
    label: 'Trouver un artisan RGE pour rénover',
    href: '/rge/renovation-energetique',
    description: 'Annuaire vérifié pour devis aides MaPrimeRénov’',
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
    section: 'Passoires thermiques',
    keywords: [
      'passoire thermique',
      'passoire énergétique',
      'logement passoire thermique',
      'loi passoire thermique',
      'interdiction location passoire',
      'audit énergétique passoire',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Passoires thermiques', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const govSchema = getGovernmentServiceSchema({
    name: 'Interdiction location passoires thermiques (Loi Climat et Résilience)',
    description:
      'Cadre légal français interdisant progressivement la location des logements classés G (depuis 2025), F (en 2028) et E (en 2034) dans le DPE. Loi n° 2021-1104.',
    url: PAGE_URL,
    serviceType: 'Réglementation logement',
    audience: 'Propriétaires-bailleurs et propriétaires vendeurs',
  })
  const schemas = [articleSchema, breadcrumbSchema, faqSchema, govSchema].filter(
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
              { label: 'Passoires thermiques' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <AlertTriangle className="w-3.5 h-3.5" aria-hidden />
              Réglementation 2025-2034
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Passoire thermique : définition, loi et calendrier 2026
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Une <strong>passoire thermique</strong> est un logement classé F ou G au DPE. Depuis
              le <strong>1er janvier 2025</strong>, les logements G ne peuvent plus être loués en
              résidence principale. F sera interdit en 2028, E en 2034. La France compte environ{' '}
              <strong>5,2 millions de passoires</strong> (17 % du parc résidentiel). Voici le cadre
              légal complet, les conséquences par profil et le chemin pour en sortir.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Définition officielle</h2>
            <p>
              Le terme « passoire thermique » désigne dans la loi française tout logement dont le
              <strong> diagnostic de performance énergétique (DPE)</strong> est classé F ou G. Le
              DPE évalue à la fois la consommation d’énergie primaire (kWh/m²/an) et les émissions
              de gaz à effet de serre (kg CO2/m²/an). Le seuil le plus contraignant des deux
              détermine la classe affichée.
            </p>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Classe DPE</th>
                    <th className="p-3 border-b border-sand-200">Conso primaire</th>
                    <th className="p-3 border-b border-sand-200">Émissions GES</th>
                    <th className="p-3 border-b border-sand-200">Statut location</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {[
                    ['A', '≤ 70 kWh/m²/an', '≤ 6 kg CO2', '✅ Autorisée'],
                    ['B', '71-110', '7-11', '✅ Autorisée'],
                    ['C', '111-180', '12-30', '✅ Autorisée'],
                    ['D', '181-250', '31-50', '✅ Autorisée'],
                    ['E', '251-330', '51-70', 'Interdite à partir de 2034'],
                    ['F', '331-420', '71-100', 'Interdite à partir de 2028'],
                    ['G', '> 420', '> 100', '🛑 Interdite depuis 2025'],
                  ].map(([cls, conso, ges, statut]) => {
                    const isPasso = cls === 'F' || cls === 'G'
                    return (
                      <tr
                        key={cls}
                        className={`border-b border-sand-100 last:border-0 ${
                          isPasso ? 'bg-amber-50/50' : ''
                        }`}
                      >
                        <td className="p-3 font-bold">{cls}</td>
                        <td className="p-3">{conso}</td>
                        <td className="p-3">{ges}</td>
                        <td className="p-3">{statut}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <h2 id="calendrier">Calendrier 2025-2034 : ce qui change</h2>
            <div className="not-prose grid gap-3 my-6">
              {CALENDAR.map((item) => (
                <div
                  key={item.date}
                  className="bg-white border border-sand-200 rounded-xl p-5 flex items-start gap-3"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-700 grid place-items-center shrink-0">
                    <Calendar className="w-5 h-5" aria-hidden />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between gap-2 flex-wrap">
                      <p className="font-semibold text-sand-900 m-0">{item.label}</p>
                      <span className="text-xs font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded">
                        {item.date}
                      </span>
                    </div>
                    <p className="text-sm text-sand-700 m-0 mt-1">{item.detail}</p>
                    <p className="text-xs text-sand-500 mt-2 mb-0">Source : {item.sourceLabel}</p>
                  </div>
                </div>
              ))}
            </div>

            <h2>Conséquences par profil</h2>
            <div className="not-prose grid gap-4 my-6">
              {CONSEQUENCES.map((c) => {
                const Icon = c.icon
                return (
                  <div key={c.profile} className="bg-white border border-sand-200 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-700 grid place-items-center shrink-0">
                        <Icon className="w-5 h-5" aria-hidden />
                      </div>
                      <h3 className="font-heading text-lg font-semibold text-sand-900 m-0">
                        {c.profile}
                      </h3>
                    </div>
                    <ul className="text-sm text-sand-700 space-y-1.5 list-disc list-inside m-0">
                      {c.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>

            <h2 id="sortir-passoire">Comment sortir du statut passoire en 5 étapes</h2>
            <div className="not-prose my-6">
              <ol className="space-y-3 list-none m-0 p-0">
                {SORTIR_PASSOIRE.map((s, i) => (
                  <li
                    key={s.step}
                    className="bg-white border border-sand-200 rounded-xl p-4 flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-700 text-white grid place-items-center shrink-0 font-bold">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-sand-900 m-0">{s.step}</p>
                      <p className="text-sm text-sand-700 mt-1 mb-0">{s.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <Scale className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <div className="text-sm text-amber-900">
                <p className="font-semibold m-0 mb-1">Dérogations à l’interdiction de location</p>
                <p className="m-0">
                  3 cas seulement : (1) bâtiment protégé par les Architectes des Bâtiments de France
                  si les travaux dénatureraient le bâti, (2) coût travaux supérieur à 50 % de la
                  valeur vénale, (3) refus copropriété sur les parties communes. Décision
                  préfectorale ou copropriété requise.
                </p>
              </div>
            </div>

            <h2>Décote à la revente</h2>
            <p>
              L’étude annuelle des Notaires de France (édition 2024) chiffre la décote moyenne par
              rapport à un bien équivalent classé D :
            </p>
            <ul>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Maison individuelle F : <strong>-5 à -15 %</strong> (médiane -8 %)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Maison individuelle G : <strong>-10 à -20 %</strong> (médiane -14 %)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Appartement F : <strong>-3 à -10 %</strong> (médiane -6 %)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Délai de vente rallongé : <strong>+30 à +60 jours</strong> par rapport à un D ou
                mieux
              </li>
            </ul>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Simulez vos aides pour sortir de la classe F ou G
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Calculateur officiel basé sur les barèmes 2026 MaPrimeRénov’ Parcours accompagné
                    + CEE + éco-PTZ. Résultat instantané + mise en relation avec un Mon
                    Accompagnateur Rénov’.
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

            <h2>Vérifier le DPE de votre logement</h2>
            <p>
              Le DPE est consultable gratuitement sur l’Observatoire DPE-Audit de l’ADEME à partir
              de l’adresse postale du logement. Si votre logement n’a pas de DPE en cours de
              validité (10 ans), un diagnostiqueur certifié peut en réaliser un pour 100-250 € TTC
              (durée 1-2h sur place).
            </p>
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
              Artisans RGE rénovation <ShieldCheck className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
