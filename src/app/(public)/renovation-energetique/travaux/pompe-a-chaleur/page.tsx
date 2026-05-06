/**
 * /renovation-energetique/travaux/pompe-a-chaleur — hub PAC cluster.
 *
 * @kw-primary    pompe a chaleur prix
 * @kw-volume     49500
 * @kw-kd         38
 * @kw-cpc        6.40
 * @cluster       2
 * @ahrefs-source docs/STRATEGIE-RENOVATION-ENERGETIQUE-V2-FUSED-2026-05-04.md#pac-cluster-1
 * @backlog-item  P3-pac-cluster
 * @snapshot      2026-05-04 (Ahrefs Bloc 1 v3 + V2 fused)
 *
 * KW cibles (re-validés Ahrefs Bloc 1 v3, country=fr) :
 * - "pompe a chaleur"              → 56 000 vol, KD 13 (france-renov.gouv.fr #1)
 * - "pompe a chaleur prix"         → 1 607 vol, KD 2 (intent prix transactionnel)
 * - "pac air eau prix"             → 126 vol, KD 2
 * - "prix pompe a chaleur air eau" → 2 263 vol (sub-page dédiée)
 * - Cluster pivot : 615 KW vol cumulé 230 190/mo, KD moyen 4.6 (cluster #1 Bloc 1)
 *
 * Source : audit Ahrefs Bloc 1 v3 (docs/ahrefs-bloc1-keywords-gap-2026-05-04.md)
 *          + fusion V2 (docs/STRATEGIE-RENOVATION-ENERGETIQUE-V2-FUSED-2026-05-04.md)
 * Easy win : MITIGÉ — head term KD 13, France-Renov dominant. Long-tail KD 2 OK.
 * Cluster pillar : Rénovation Énergétique → Travaux → Chauffage → PAC
 *
 * Stratégie :
 *   - Hub PAC (comparaison 3 types, dimensionnement, intent transactionnel)
 *   - Sub-pages /air-eau-prix, /air-air-prix, /geothermie déjà créées
 *   - Différenciation vs France-Renov : prix marché 2026 + comparatif marques + RGE
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Thermometer,
  Wind,
  Droplet,
  Snowflake,
  Calculator,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Euro,
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

const PAGE_PATH = '/renovation-energetique/travaux/pompe-a-chaleur'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-03'
const MODIFIED = '2026-05-04'
const AUTHOR_SLUG = 'jean-pierre-duval'
const AUTHOR_NAME = 'Jean-Pierre Duval'

const TITLE = 'Pompe à chaleur 2026 : prix & types'
const DESCRIPTION =
  'Pompe à chaleur 2026 : prix 6 000-22 000 € selon type (air-air, air-eau, géothermie). Aides MPR + CEE jusquà 11 000 €. Guide complet.'

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

type PacType = {
  slug: string
  name: string
  icon: typeof Thermometer
  principle: string
  priceRange: string
  cop: string
  bestFor: string
  drawbacks: string
  aidesMax: string
  rgeQual: string
}

const PAC_TYPES: PacType[] = [
  {
    slug: 'air-air',
    name: 'PAC air-air (climatisation réversible)',
    icon: Wind,
    principle:
      'Capte les calories de l’air extérieur et les diffuse via des splits (ventilo-convecteurs). Un usage chauffage hiver + clim été.',
    priceRange: '6 000 à 12 000 € TTC posée',
    cop: 'COP 3,5 à 4,5',
    bestFor:
      'Maisons sans réseau de chauffage central existant, climat tempéré, besoin secondaire de climatisation.',
    drawbacks:
      'Inéligible MaPrimeRénov’ depuis 2020 (seul le CEE Coup de pouce subsiste, ~600 €). Pas de production ECS.',
    aidesMax: 'CEE seul : ~600 €',
    rgeQual: 'QualiPAC mention chaud + froid',
  },
  {
    slug: 'air-eau',
    name: 'PAC air-eau',
    icon: Droplet,
    principle:
      'Capte les calories de l’air, les transfère à un circuit d’eau alimentant radiateurs + plancher chauffant + ECS.',
    priceRange: '10 000 à 18 000 € TTC posée',
    cop: 'COP 3,0 à 4,5 (SCOP 3,8 typique)',
    bestFor:
      'Remplacement chaudière fioul / gaz dans une maison équipée de radiateurs ou plancher chauffant. Cas standard rénovation.',
    drawbacks:
      'Adaptation hydraulique parfois nécessaire. Performance dégradée par grand froid (< -10 °C) sans appoint.',
    aidesMax: 'Jusqu’à 9 000 € (MPR 5 000 + CEE 4 000)',
    rgeQual: 'QualiPAC',
  },
  {
    slug: 'geothermique',
    name: 'PAC géothermique (sol-eau)',
    icon: Thermometer,
    principle:
      'Capte les calories du sol via des capteurs horizontaux ou des sondes verticales. Performance stable toute l’année.',
    priceRange:
      '15 000 à 25 000 € TTC posée (capteurs horizontaux), 20 000 à 35 000 € (sondes verticales)',
    cop: 'COP 4,0 à 5,5 (SCOP 4,5 typique)',
    bestFor:
      'Maisons avec terrain disponible, projet long terme (>20 ans), volonté de stabilité et performance maximale.',
    drawbacks:
      'Investissement initial élevé. Travaux de terrassement importants. Études géologiques préalables (sondes verticales).',
    aidesMax: 'Jusqu’à 11 000 € (MPR 11 000 max très modestes)',
    rgeQual: 'QualiPAC mention sol/eau ou eau/eau',
  },
]

const tldr = [
  'Une pompe à chaleur coûte de 6 000 € (air-air entrée de gamme) à 35 000 € (géothermie sondes verticales) en 2026, posée et hors aides.',
  'La PAC air-eau est le standard en rénovation : 10 000-18 000 € TTC pour une maison 100-150 m².',
  'Aides cumulables 2026 : MaPrimeRénov’ + Coup de pouce CEE jusqu’à 9 000 € (air-eau) ou 11 000 € (géothermie).',
  'Artisan RGE QualiPAC obligatoire pour toucher les aides et bénéficier de la TVA 5,5 %.',
  'La PAC air-air n’est plus éligible MaPrimeRénov’ depuis 2020 (seul un petit CEE subsiste).',
]

const faqs = [
  {
    question: 'Quel est le prix moyen d’une pompe à chaleur en 2026 ?',
    answer:
      'Le prix dépend du type et de la puissance. PAC air-air entrée de gamme : 6 000-9 000 € TTC posée. PAC air-eau standard maison 100-150 m² : 10 000-18 000 € TTC posée. PAC géothermique horizontale : 15 000-25 000 € TTC ; sondes verticales : 20 000-35 000 € TTC. Les écarts entre devis à configuration équivalente atteignent 15-25 %, d’où l’intérêt de demander 3 devis d’artisans RGE QualiPAC.',
  },
  {
    question: 'Quelle PAC choisir pour remplacer ma chaudière au gaz ou au fioul ?',
    answer:
      'PAC air-eau dans 90 % des cas en rénovation : elle réutilise le réseau hydraulique existant (radiateurs ou plancher chauffant), produit aussi l’eau chaude sanitaire et bénéficie des aides maximales (jusqu’à 9 000 €). La géothermique convient si vous avez un terrain disponible et un projet long terme. La PAC air-air est exclue du remplacement chaudière (pas d’ECS, pas de réseau hydraulique compatible).',
  },
  {
    question: 'Quelles aides en 2026 pour installer une pompe à chaleur ?',
    answer:
      'MaPrimeRénov’ par geste : 2 000 à 5 000 € (air-eau) selon revenus, jusqu’à 11 000 € (géothermie très modestes). Coup de pouce CEE : 2 500 à 4 000 €. Cumul air-eau jusqu’à 9 000 € pour un ménage très modeste. TVA réduite à 5,5 % automatique avec artisan RGE. Éco-PTZ jusqu’à 15 000 € pour compléter.',
  },
  {
    question: 'Faut-il obligatoirement un artisan RGE pour installer une PAC ?',
    answer:
      'Oui pour bénéficier des aides publiques (MaPrimeRénov’, CEE) et de la TVA 5,5 %. L’artisan doit être titulaire de la qualification RGE QualiPAC (ou QualiPAC mention sol/eau pour la géothermie) en cours de validité à la date de signature du devis. Vérification gratuite sur france-renov.gouv.fr/annuaire-rge.',
  },
  {
    question: 'Quelle est la différence entre PAC air-air et PAC air-eau ?',
    answer:
      'La PAC air-air diffuse de l’air chaud directement par des splits muraux (comme une climatisation réversible). La PAC air-eau chauffe un circuit d’eau qui alimente vos radiateurs ou plancher chauffant et produit aussi l’eau chaude sanitaire. La PAC air-eau remplace une chaudière, la PAC air-air complète ou remplace des radiateurs électriques.',
  },
  {
    question: 'Combien d’économies sur la facture de chauffage ?',
    answer:
      'Une PAC air-eau remplaçant une chaudière fioul réduit la facture annuelle de 50 à 70 %. Exemple : facture fioul 2 500 €/an → facture PAC électricité ~800-1 000 €/an. Le retour sur investissement se situe entre 7 et 12 ans selon les aides perçues et le tarif de l’électricité (heures creuses recommandées).',
  },
  {
    question: 'Quelle puissance de PAC choisir pour ma maison ?',
    answer:
      'Le bilan thermique de l’artisan RGE détermine la puissance (kW) en fonction de la surface, de l’isolation, du climat et du système d’émetteurs. Ordre de grandeur : 6-8 kW pour 80-100 m² bien isolé RT 2012, 10-12 kW pour 130-160 m² moyennement isolé, 14-16 kW pour 180-220 m² ou maison mal isolée. Surdimensionner = consommation élevée et cycles courts qui usent le matériel.',
  },
]

const sources = [
  {
    label: 'France Rénov’ — Pompes à chaleur',
    url: 'https://france-renov.gouv.fr/aides/maprimerenov',
  },
  { label: 'ADEME — Guide pompes à chaleur 2026', url: 'https://agir.ademe.fr' },
  {
    label: 'AFPAC — Association française pour les pompes à chaleur',
    url: 'https://www.afpac.org',
  },
  { label: 'Qualit’EnR — Annuaire QualiPAC', url: 'https://www.qualit-enr.org' },
]

const relatedPages = [
  {
    label: 'PAC air-eau : prix détaillés 2026',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/air-eau-prix',
    description: 'Grille de prix par puissance + aides cumulées détaillées',
  },
  {
    label: 'PAC air-air : prix et modèles 2026',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/air-air-prix',
    description: 'Mono / bi / multi-split, COP, pourquoi non éligible MPR',
  },
  {
    label: 'PAC géothermique : prix et sondes 2026',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/geothermie',
    description: 'Sondes verticales/horizontales, COP 4-5,5, MPR jusqu’à 11 000 €',
  },
  {
    label: 'Entretien PAC : obligation, prix, checklist',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/entretien',
    description: 'Décret 2020-912, contrat 150-300 €/an, F-Gas catégorie I',
  },
  {
    label: 'Consommation PAC : kWh/an, COP, facture',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/consommation',
    description: '3 000-7 000 kWh/an pour 100 m². Comparatif vs gaz/fioul + 10 leviers d’économie',
  },
  {
    label: 'Installation PAC : 8 étapes + RGE QualiPAC',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/installation',
    description:
      'Bilan thermique → mise en service. Durée 2-5 j, démarches admin, erreurs à éviter',
  },
  {
    label: 'Fonctionnement PAC : cycle thermo, COP, fluides',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/fonctionnement',
    description: '4 phases physiques + R32/R290 + dégivrage + Inverter + réversible',
  },
  {
    label: 'PAC eau-eau : nappe phréatique, COP 5-6',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/eau-eau',
    description: 'La PAC la plus performante. Étude hydrogéo + déclaration DDT.',
  },
  {
    label: 'PAC Daikin : Altherma, prix, COP, avis',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/marques/daikin',
    description: 'N°1 mondial. 5 gammes (H HT, R290, M, EHS Hybrid, Emura). SAV 600 tech.',
  },
  {
    label: 'PAC Mitsubishi : Ecodan, Zubadan, prix, avis',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/marques/mitsubishi',
    description: 'N°2 mondial. Acoustique 33-37 dB record + Zubadan -28 °C + garantie 7 ans auto.',
  },
  {
    label: 'Coût total PAC sur 15 ans',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/cout-total',
    description: 'TCO ~28K€ vs 52K€ fioul. Comparatif 5 énergies + 5 leviers de réduction.',
  },
  {
    label: 'Puissance PAC : calcul kW selon surface',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/puissance',
    description: 'Méthode NF EN 12831 + cas types 60-180 m² + erreurs sous/sur-dim',
  },
  {
    label: 'Dépannage PAC : pannes, codes erreur, prix',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/depannage',
    description: '10 pannes courantes + codes par marque + prix intervention 80-300 €',
  },
  {
    label: 'Guide pompe à chaleur (technique complet)',
    href: '/guides/pompe-a-chaleur',
    description: 'Fonctionnement, COP, dimensionnement, durée de vie',
  },
  {
    label: 'PAC air-eau installée : grille prix',
    href: '/guides/prix-pompe-chaleur-air-eau-installee',
    description: 'Détail par puissance 6-16 kW + cumul aides 2026',
  },
  {
    label: 'Hub VMC',
    href: '/renovation-energetique/travaux/vmc',
    description: 'VMC double flux compatible avec PAC, étanchéité air requise',
  },
  {
    label: 'PAC + aides CEE/MaPrimeRénov’ 2026',
    href: '/guides/pompe-a-chaleur-cee-maprimerenov-2026',
    description: 'Cumul aides : barèmes bleu/jaune/violet/rose',
  },
  {
    label: 'MaPrimeRénov’ 2026 — guide complet',
    href: '/guides/maprimerenov-2026',
    description: 'Toutes les aides Anah, conditions, parcours accompagné',
  },
  {
    label: 'Trouver un chauffagiste RGE près de chez vous',
    href: '/rge/chauffagiste',
    description: 'Annuaire vérifié des artisans RGE QualiPAC en France',
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
    section: 'Travaux — Chauffage',
    keywords: [
      'pompe à chaleur prix',
      'PAC prix 2026',
      'pompe à chaleur air-eau',
      'pompe à chaleur géothermique',
      'aides pompe à chaleur',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique#travaux' },
    { name: 'Pompe à chaleur', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const financialSchema = getFinancialProductSchema({
    name: 'MaPrimeRénov’ pompe à chaleur 2026',
    description:
      'Aide forfaitaire MaPrimeRénov’ pour l’installation d’une pompe à chaleur air-eau ou géothermique par un artisan RGE QualiPAC. Cumulable Coup de pouce CEE.',
    url: PAGE_URL,
    category: 'Government Grant',
    amount: '2 000 € à 11 000 € selon revenus et type de PAC',
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
              { label: 'Pompe à chaleur' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Snowflake className="w-3.5 h-3.5" aria-hidden />
              Travaux &middot; Chauffage
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Pompe à chaleur en 2026 : prix, types et aides
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              En 2026, le prix d’une pompe à chaleur va de 6 000 € (air-air entrée de gamme) à 35
              000 € (géothermie sondes verticales). La PAC air-eau, standard en rénovation, coûte
              entre 10 000 et 18 000 € TTC posée. Aides MaPrimeRénov’ + CEE cumulables jusqu’à 11
              000 €. Voici comment choisir le bon type de PAC selon votre situation.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Les 3 types de pompes à chaleur en 2026</h2>
            <p>
              Toutes les PAC fonctionnent sur le même principe : capter les calories d’un milieu
              extérieur (air ou sol) pour les restituer à l’intérieur du logement. Trois familles
              dominent le marché français en 2026, avec des prix, performances et aides très
              différents.
            </p>

            <div className="not-prose grid gap-4 my-6">
              {PAC_TYPES.map((pac) => {
                const Icon = pac.icon
                return (
                  <div
                    key={pac.slug}
                    className="bg-white border border-sand-200 rounded-xl p-5 md:p-6"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-700 grid place-items-center shrink-0">
                        <Icon className="w-5 h-5" aria-hidden />
                      </div>
                      <div>
                        <h3 className="font-heading text-lg font-semibold text-sand-900 m-0">
                          {pac.name}
                        </h3>
                        <p className="text-sm text-sand-600 mt-1 mb-0">{pac.principle}</p>
                      </div>
                    </div>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div>
                        <dt className="font-semibold text-sand-700 inline-flex items-center gap-1">
                          <Euro className="w-4 h-4 text-primary-700" aria-hidden /> Prix posée
                        </dt>
                        <dd className="m-0 text-sand-900">{pac.priceRange}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-sand-700">Performance</dt>
                        <dd className="m-0 text-sand-900">{pac.cop}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-sand-700">Idéal pour</dt>
                        <dd className="m-0 text-sand-900">{pac.bestFor}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-sand-700">Limites</dt>
                        <dd className="m-0 text-sand-900">{pac.drawbacks}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-sand-700">Aides max 2026</dt>
                        <dd className="m-0 text-sand-900">{pac.aidesMax}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-sand-700">Qualif. RGE requise</dt>
                        <dd className="m-0 text-sand-900">{pac.rgeQual}</dd>
                      </div>
                    </dl>
                  </div>
                )
              })}
            </div>

            <h2>Comment choisir le bon type de PAC ?</h2>
            <ul>
              <li>
                <strong>Vous remplacez une chaudière fioul ou gaz ?</strong> PAC air-eau dans 90 %
                des cas (réutilise vos radiateurs / plancher chauffant + ECS).
              </li>
              <li>
                <strong>Maison neuve avec plancher chauffant prévu ?</strong> PAC air-eau (standard)
                ou géothermique si terrain disponible et projet ≥ 20 ans.
              </li>
              <li>
                <strong>Logement chauffé électrique sans réseau hydraulique ?</strong> PAC air-air
                (split) si pas de besoin d’ECS solaire/thermo, sinon couplage PAC air-eau + ballon
                thermodynamique.
              </li>
              <li>
                <strong>Climat très froid (zones H1, montagne) ?</strong> PAC air-eau « grand froid
                » (-25 °C) ou géothermique (performance stable toute l’année).
              </li>
            </ul>

            <h2>Aides 2026 : combien pouvez-vous récupérer ?</h2>
            <p>
              MaPrimeRénov’ + Coup de pouce CEE sont cumulables. Le montant exact dépend de votre
              <strong> revenu fiscal de référence</strong> (4 catégories : bleu, jaune, violet,
              rose) et du <strong>type de PAC</strong>.
            </p>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Profil revenus</th>
                    <th className="p-3 border-b border-sand-200">PAC air-eau</th>
                    <th className="p-3 border-b border-sand-200">PAC géothermique</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    [
                      'Très modestes (bleu)',
                      '5 000 € + CEE 4 000 = 9 000 €',
                      '11 000 € + CEE 5 000 = 16 000 €',
                    ],
                    [
                      'Modestes (jaune)',
                      '4 000 € + CEE 4 000 = 8 000 €',
                      '9 000 € + CEE 5 000 = 14 000 €',
                    ],
                    [
                      'Intermédiaires (violet)',
                      '3 000 € + CEE 3 000 = 6 000 €',
                      '6 000 € + CEE 4 000 = 10 000 €',
                    ],
                    [
                      'Supérieurs (rose)',
                      '2 000 € + CEE 2 500 = 4 500 €',
                      '0 € (non éligible MPR) + CEE seul',
                    ],
                  ].map(([profil, ae, geo]) => (
                    <tr key={profil} className="border-b border-sand-100 last:border-0 align-top">
                      <td className="p-3 font-semibold">{profil}</td>
                      <td className="p-3">{ae}</td>
                      <td className="p-3">{geo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Montants indicatifs 2026. Vérifier sur france-renov.gouv.fr selon votre situation
                exacte. PAC air-air exclue de MaPrimeRénov’ depuis 2020.
              </p>
            </div>

            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <div className="text-sm text-amber-900">
                <p className="font-semibold m-0 mb-1">Méfiance « PAC à 1 € »</p>
                <p className="m-0">
                  Le Coup de pouce CEE a été sensiblement réduit depuis 2024 : aucune offre légitime
                  « PAC à 1 € » ne subsiste en 2026. Toute offre de ce type masque soit une
                  sous-performance (COP &lt; 3,0), soit un reste à charge caché, soit une fraude aux
                  aides (poursuite pénale possible).
                </p>
              </div>
            </div>

            <h2>RGE QualiPAC : la qualification obligatoire</h2>
            <p>
              Pour bénéficier de MaPrimeRénov’, du Coup de pouce CEE et de la TVA 5,5 %, votre
              installateur doit être titulaire de la qualification <strong>RGE QualiPAC</strong> (ou
              QualiPAC mention sol/eau pour la géothermie) en cours de validité à la date de
              signature du devis. Vérification en 30 secondes sur le site officiel
              france-renov.gouv.fr/annuaire-rge.
            </p>
            <ul>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Qualification renouvelée tous les 4 ans par audit terrain
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Garantie décennale obligatoire sur l’installation
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Mise en service par technicien certifié + contrat d’entretien annuel obligatoire
                (décret 2020-912)
              </li>
            </ul>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Simulez vos aides PAC en 2 minutes
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Calculateur officiel basé sur les barèmes 2026 MaPrimeRénov’ + Coup de pouce
                    CEE. Résultat instantané + mise en relation avec 3 artisans RGE QualiPAC.
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

            <h2>Pour aller plus loin</h2>
            <p>
              Voir notre sous-page dédiée aux{' '}
              <Link href="/renovation-energetique/travaux/pompe-a-chaleur/air-eau-prix">
                prix détaillés PAC air-eau 2026
              </Link>{' '}
              avec la grille par puissance (6-16 kW), les facteurs qui font dériver un devis et la
              méthode pour comparer 3 propositions à configuration équivalente.
            </p>
          </article>

          <FlagshipFaq items={faqs} />
          <FlagshipSources sources={sources} />

          <section className="my-10">
            <h2 className="font-heading text-xl font-semibold text-sand-900 mb-4">
              Ressources liées
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
              href="/rge/chauffagiste"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Chauffagistes RGE <ShieldCheck className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
