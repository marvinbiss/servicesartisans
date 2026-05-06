/**
 * Page : /renovation-energetique/travaux/pompe-a-chaleur/consommation
 *
 * @kw-primary    consommation pompe a chaleur
 * @kw-volume     3400
 * @kw-kd         1
 * @kw-cpc        0.05
 * @cluster       reno-energetique-pac-consommation
 * @ahrefs-source api-live
 * @snapshot      2026-05-06
 * @backlog-item  B8 (récap audits 2026-05-06 — Bloc 1 Ahrefs cluster PAC consommation)
 *
 * KW cibles (validés Ahrefs API live 2026-05-06, country=fr) :
 * - "consommation pompe a chaleur"           → 3 400 vol, KD 1, CPC $0,05 ⭐⭐⭐⭐⭐ PIVOT
 * - "consommation electrique pompe a chaleur"→   250 vol, KD 2, CPC $0,03 ⭐⭐⭐
 * - "consommation pac"                       →   150 vol, KD 0, CPC $0,45 ⭐⭐⭐
 * - Famille cumulée pivot : ~3 800 vol/mois (KD 0-2 = TOP EASY WIN)
 *
 * Easy win : OUI MAJEUR (KD 0-2, intent budget propriétaire post-installation)
 * Cluster pillar : Rénovation Énergétique → Travaux → PAC → Consommation
 *
 * Anti-cannibalisation :
 *   - Hub /pompe-a-chaleur = comparatif 3 types + prix achat
 *   - /air-eau-prix, /air-air-prix, /geothermie = sous-pages prix par type
 *   - /pompe-a-chaleur/entretien (B6) = obligation légale + contrat annuel
 *   - Cette page = CONSOMMATION ÉLECTRIQUE post-installation (kWh/an, COP/SCOP,
 *     facture €/an, comparatif vs gaz/fioul) — focus budget récurrent.
 *
 * YMYL : info budget énergétique → cite ADEME + Règlement UE 813/2013 (eco-design)
 *        + norme EN 14511 (COP/SCOP) + AFPAC + tarifs réglementés EDF.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Activity,
  AlertTriangle,
  Calculator,
  Coins,
  Gauge,
  Snowflake,
  Thermometer,
  TrendingDown,
  Zap,
} from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import LastUpdated from '@/components/seo/LastUpdated'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'

export const revalidate = 86400

const PAGE_PATH = '/renovation-energetique/travaux/pompe-a-chaleur/consommation'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'jean-pierre-duval'
const AUTHOR_NAME = 'Jean-Pierre Duval'

const TITLE = 'Consommation Pompe à Chaleur 2026 : kWh/an, COP, facture'
const DESCRIPTION =
  'Consommation pompe à chaleur 2026 : 3 000 à 7 000 kWh/an pour 100 m². COP 3-5, SCOP 4. Facture 600-1 400 €/an. Comparatif vs gaz/fioul + 10 leviers d’économie.'

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
  'Consommation moyenne PAC air-eau 2026 : 3 000 à 7 000 kWh/an pour une maison 100 m² isolée (zone H2).',
  'Facture associée : 600 à 1 400 €/an au tarif réglementé EDF (option Base, 0,2516 €/kWh TTC en 2026).',
  'COP > 3 = la PAC produit 3 kWh de chaleur pour 1 kWh d’électricité consommée. SCOP 4 = moyenne saisonnière.',
  'Air-air ≈ air-eau pour la même puissance, mais l’air-eau couvre aussi l’ECS (eau chaude sanitaire).',
  'Géothermie = -20 à -30 % de consommation vs aérothermie (COP 4-5, SCOP 5), mais coût d’installation 2-3× plus élevé.',
  'Conso 30-50 % inférieure à un radiateur électrique direct, 50 % vs gaz, 60 % vs fioul (à puissance et confort égaux).',
]

const CONSO_PAR_TYPE = [
  {
    type: 'PAC air-eau (chauffage seul)',
    cop: 'COP 3,5-4,5 / SCOP 3,8-4,5',
    conso: '3 500 - 5 500 kWh/an',
    facture: '880 - 1 380 €/an',
    detail: 'Maison 100 m² classe C-D, zone H2, T° eau 35-45 °C plancher chauffant.',
  },
  {
    type: 'PAC air-eau (chauffage + ECS)',
    cop: 'COP 3,5-4,5 / SCOP 3,5-4,2',
    conso: '4 500 - 7 000 kWh/an',
    facture: '1 130 - 1 760 €/an',
    detail: 'Inclut production ECS pour 4 personnes (~150 L/jour à 55 °C). + 1 000-1 500 kWh.',
  },
  {
    type: 'PAC air-air (réversible)',
    cop: 'COP 3,5-4,5 / SCOP 3,5-4,2',
    conso: '3 500 - 5 500 kWh/an',
    facture: '880 - 1 380 €/an',
    detail: 'Multisplit 3-4 unités intérieures. Climatisation incluse en été (mode froid).',
  },
  {
    type: 'PAC géothermie (sol-eau)',
    cop: 'COP 4-5 / SCOP 4,5-5,2',
    conso: '2 500 - 4 500 kWh/an',
    facture: '630 - 1 130 €/an',
    detail: 'Capteurs horizontaux ou sondes verticales. Gain 20-30 % vs aérothermie.',
  },
  {
    type: 'PAC hybride (PAC + chaudière gaz)',
    cop: 'Variable (PAC seule en mi-saison)',
    conso: '2 500 kWh élec + 4 000 kWh gaz/an',
    facture: '~1 100 €/an (mix élec+gaz 2026)',
    detail: 'PAC en mi-saison (T° > 0 °C), chaudière gaz par grand froid. Confort + résilience.',
  },
]

const FACTEURS_CONSO = [
  {
    titre: 'Isolation du logement',
    impact: '±50 %',
    detail:
      'Une maison classe C consomme 2× moins qu’une classe E à surface égale. Avant PAC : isoler combles + murs.',
  },
  {
    titre: 'Zone climatique (H1/H2/H3)',
    impact: '±30 %',
    detail:
      'H1 (Nord-Est, montagne) = -10 °C en hiver, COP plus bas. H3 (Méditerranée) = COP optimal toute la saison.',
  },
  {
    titre: 'Type d’émetteur (plancher chauffant vs radiateurs)',
    impact: '±20 %',
    detail:
      'Plancher chauffant = T° eau 35 °C → COP 4. Radiateurs anciens 65 °C → COP 2,5. Optimiser le réseau.',
  },
  {
    titre: 'Puissance dimensionnée correctement',
    impact: '±15 %',
    detail:
      'PAC sous-dimensionnée = appoint électrique surcoûté. Sur-dimensionnée = cycles courts inefficaces. Étude thermique obligatoire.',
  },
  {
    titre: 'Réglages et programmation',
    impact: '±10 %',
    detail:
      '1 °C de moins en consigne = 7 % de conso en moins. Programmation jour/nuit, présence/absence.',
  },
  {
    titre: 'Entretien régulier',
    impact: '±5-15 %',
    detail:
      'Filtres encrassés, fluide en sous-charge → COP dégradé. Entretien tous les 2 ans (obligatoire 4-70 kW, décret 2020-912).',
  },
  {
    titre: 'Production ECS',
    impact: '+ 25-35 %',
    detail:
      'Si la PAC produit l’ECS : compter +1 000-1 500 kWh/an pour une famille de 4. ECS = 30 % de la facture chauffage.',
  },
]

const COMPARATIF_SYSTEMES = [
  {
    systeme: 'PAC air-eau',
    conso: '4 500 kWh élec/an',
    facture: '1 130 €/an',
    co2: '450 kg CO2/an',
    detail: 'Mix EDF 2026 (60 g CO2/kWh). Réf 100 m² classe D zone H2.',
  },
  {
    systeme: 'Chaudière gaz condensation',
    conso: '14 000 kWh gaz/an',
    facture: '1 540 €/an',
    co2: '2 800 kg CO2/an',
    detail: 'Tarif gaz B1 2026 ~0,11 €/kWh. CO2 = 200 g/kWh gaz.',
  },
  {
    systeme: 'Chaudière fioul',
    conso: '1 800 L/an (~18 000 kWh)',
    facture: '1 980 €/an',
    co2: '4 800 kg CO2/an',
    detail: 'Fioul 1,10 €/L 2026. CO2 = 270 g/kWh fioul. Interdit en neuf depuis 2022.',
  },
  {
    systeme: 'Radiateurs électriques anciens',
    conso: '13 000 kWh/an',
    facture: '3 270 €/an',
    co2: '780 kg CO2/an',
    detail: 'Convecteurs 1980-2000. Effet Joule pur, COP = 1.',
  },
  {
    systeme: 'Bois (poêle granulés)',
    conso: '3 tonnes granulés/an',
    facture: '1 200 €/an',
    co2: '~ neutre (renouvelable)',
    detail: 'Granulés 400 €/tonne 2026. CO2 biogénique = compté neutre par ADEME.',
  },
]

const LEVIERS_ECONOMIE = [
  'Baisser la consigne de 1 °C : -7 % de consommation (de 21 à 20 °C en journée).',
  'Programmation jour/nuit : 17 °C la nuit, 19-20 °C le jour. -10 à -15 % de consommation.',
  'Plancher chauffant > radiateurs anciens : T° eau 35 °C au lieu de 65 °C → COP +50 %.',
  'Isoler avant d’installer : isolation combles (R 7) + murs (R 5) = -30 à -40 % besoins thermiques.',
  'Entretien tous les 2 ans : filtres + fluide en charge → COP nominal préservé. -5 à -15 %.',
  'Loi d’eau optimisée : régulation T° eau selon T° extérieure. -10 à -15 % vs réglage fixe.',
  'Découpler ECS : si la PAC fait aussi l’ECS, basculer ECS sur chauffe-eau thermodynamique dédié = COP optimal.',
  'Heures creuses : programmer ECS en HC (22h-6h). Tarif HC -25 % vs HP base, -40 % en option Tempo.',
  'Vérifier le dimensionnement : étude thermique obligatoire avant achat. Sous/sur-dim = -20 % efficacité.',
  'Couplage solaire thermique : 30-40 % de l’ECS gratuite via panneaux solaires thermiques = -10 % facture totale.',
]

const faqs = [
  {
    question: 'Combien consomme une pompe à chaleur en moyenne ?',
    answer:
      'Pour une maison 100 m² isolée (classe C-D) en zone climatique H2, une PAC air-eau consomme entre 3 500 et 5 500 kWh/an pour le chauffage seul, soit 880 à 1 380 € de facture EDF (tarif Base 2026 à 0,2516 €/kWh TTC). Si la PAC assure aussi l’eau chaude sanitaire (ECS), comptez 4 500 à 7 000 kWh/an (+1 000-1 500 kWh). Une PAC géothermie consomme 20-30 % de moins (2 500-4 500 kWh/an). Une maison mal isolée (classe E ou F) peut consommer 2× plus.',
  },
  {
    question: 'Qu’est-ce que le COP et le SCOP d’une pompe à chaleur ?',
    answer:
      'Le COP (Coefficient de Performance) mesure le rendement instantané : COP 4 = la PAC produit 4 kWh de chaleur pour 1 kWh d’électricité consommée (norme EN 14511). Le SCOP (Seasonal COP) intègre la performance moyenne sur toute la saison de chauffe (Règlement UE 813/2013), incluant les démarrages, l’appoint électrique et les conditions extérieures variables. Un SCOP 4 est considéré bon, SCOP 4,5+ excellent. Pour MaPrimeRénov’, SCOP minimum 3,4 pour PAC air-eau (2026).',
  },
  {
    question: 'PAC vs gaz : laquelle consomme moins en 2026 ?',
    answer:
      'À puissance et confort équivalents (maison 100 m² zone H2) : PAC air-eau 4 500 kWh élec → 1 130 €/an (mix EDF) ; chaudière gaz condensation 14 000 kWh gaz → 1 540 €/an (tarif B1 2026 ~0,11 €/kWh). La PAC consomme 3× moins en énergie primaire mais coûte 3 à 4× plus cher à l’achat (10-18 K€ vs 4-7 K€). Économie facture annuelle : 400-600 € en faveur de la PAC. CO2 : PAC = 450 kg/an vs gaz = 2 800 kg/an (×6 plus émetteur).',
  },
  {
    question: 'Comment réduire la consommation de ma pompe à chaleur ?',
    answer:
      '10 leviers prouvés : (1) baisser consigne 1 °C = -7 %, (2) programmation jour/nuit = -10 à -15 %, (3) plancher chauffant T° eau 35 °C vs radiateurs 65 °C = +50 % COP, (4) isoler combles + murs = -30 % besoins, (5) entretien tous les 2 ans = COP préservé, (6) loi d’eau optimisée, (7) découpler ECS sur chauffe-eau thermodynamique, (8) heures creuses pour ECS, (9) dimensionnement vérifié, (10) couplage solaire thermique. Cumul : -30 à -40 % de consommation possible.',
  },
  {
    question: 'Une PAC consomme-t-elle plus en hiver ?',
    answer:
      'Oui, une PAC consomme 70-80 % de son énergie annuelle entre novembre et mars. Plus la T° extérieure baisse, plus le COP diminue : à +7 °C, COP ~4 ; à -7 °C, COP ~2,5 ; à -15 °C, COP ~1,8 et appoint électrique fréquent. C’est pourquoi la zone climatique compte : en H1 (Nord-Est, montagne) la PAC consomme 30 % de plus qu’en H3 (Méditerranée). Une PAC bien dimensionnée + isolation correcte limite l’appoint électrique à < 5 % de la consommation totale.',
  },
  {
    question: 'Mon ancienne PAC consomme trop : faut-il la remplacer en 2026 ?',
    answer:
      'Une PAC > 15 ans a typiquement un COP dégradé de 20-30 % (encrassement compresseur, fluide vieilli). Une PAC neuve haut de gamme avec SCOP 4,5+ peut diviser la consommation par 1,3-1,5 vs un modèle 2010. ROI typique : 8-12 ans selon prix initial (10-18 K€) et économie facture (300-600 €/an). MaPrimeRénov’ 2026 inclut une aide remplacement PAC ancienne (pas seulement énergie fossile) jusqu’à 5 000 € (très modeste, classe gain ≥ 2). Audit énergétique conseillé avant décision.',
  },
  {
    question: 'Comment calculer la consommation théorique de ma PAC ?',
    answer:
      'Formule : Conso élec (kWh/an) = Besoins thermiques (kWh/an) ÷ SCOP. Exemple : maison 100 m² classe D = 12 000 kWh besoins/an. Avec une PAC SCOP 4 → 3 000 kWh élec/an. Avec une PAC SCOP 3,5 → 3 430 kWh. Pour les besoins thermiques, multipliez : surface × kWh/m²/an étiquette DPE. Le DPE post-2021 (méthode 3CL-2021) donne directement cette donnée. Pour l’ECS, ajoutez 1 000-1 500 kWh/an (4 personnes). Tolérance ±20 % vs réel selon usage.',
  },
  {
    question: 'Quelles aides 2026 pour optimiser la consommation de ma PAC ?',
    answer:
      'Si remplacement PAC ancienne par modèle haute performance (SCOP ≥ 4,3 pour MPR Bonus Performance) : MaPrimeRénov’ 2 000-5 000 € selon revenus + CEE Coup de pouce 2 500-5 500 € (modeste/très modeste). Pour optimiser une PAC existante : pas d’aide directe sur l’entretien (mais déductible revenus fonciers pour bailleurs). Pour isoler + PAC : MPR Parcours accompagné jusqu’à 70 000 € (90 000 € avec bonus passoire + BBC). Simulateur officiel : france-renov.gouv.fr.',
  },
]

const sources = [
  {
    label: 'ADEME — Pompes à chaleur (consommation et performances)',
    url: 'https://librairie.ademe.fr/urbanisme-et-batiment/3998-pompes-a-chaleur.html',
  },
  {
    label: 'Légifrance — Règlement UE 813/2013 (eco-design chauffage)',
    url: 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32013R0813',
  },
  {
    label: 'Norme EN 14511 — Mesure COP/EER',
    url: 'https://www.afnor.org',
  },
  {
    label: 'AFPAC — Association Française des Pompes À Chaleur',
    url: 'https://www.afpac.org',
  },
  {
    label: 'EDF — Tarifs réglementés 2026 (Bleu Base + Heures Creuses)',
    url: 'https://particulier.edf.fr/fr/accueil/contrat-et-conso/options/tarif-bleu.html',
  },
  {
    label: 'Service-Public.fr — MaPrimeRénov’ pompe à chaleur',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F35315',
  },
  {
    label: 'France Rénov’ — Simulateur aides PAC',
    url: 'https://france-renov.gouv.fr/aides/simulation',
  },
]

const relatedPages = [
  {
    label: 'Hub Pompe à chaleur',
    href: '/renovation-energetique/travaux/pompe-a-chaleur',
    description: '3 types comparés + critères de choix',
  },
  {
    label: 'Prix PAC air-eau 2026',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/air-eau-prix',
    description: '10-18 K€ pose comprise + aides MPR/CEE',
  },
  {
    label: 'Prix PAC air-air 2026',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/air-air-prix',
    description: '5-12 K€ multisplit, PAC réversible',
  },
  {
    label: 'PAC géothermie',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/geothermie',
    description: 'COP 4-5, conso -30 % vs aérothermie',
  },
  {
    label: 'Entretien PAC obligatoire',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/entretien',
    description: 'Tous les 2 ans (décret 2020-912) + contrat 150-300 €/an',
  },
  {
    label: 'Simulateur aides 2026',
    href: '/simulateur-aides-renovation',
    description: 'MPR + CEE + éco-PTZ pour PAC',
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
    section: 'Travaux — PAC — Consommation',
    keywords: [
      'consommation pompe à chaleur',
      'consommation pac',
      'consommation electrique pompe à chaleur',
      'COP pompe à chaleur',
      'SCOP pompe à chaleur',
      'kWh pompe à chaleur',
      'facture pompe à chaleur',
      'pompe à chaleur vs gaz',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique/travaux' },
    { name: 'Pompe à chaleur', url: '/renovation-energetique/travaux/pompe-a-chaleur' },
    { name: 'Consommation', url: PAGE_PATH },
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
              { label: 'Rénovation énergétique', href: '/renovation-energetique' },
              { label: 'Travaux', href: '/renovation-energetique/travaux' },
              { label: 'Pompe à chaleur', href: '/renovation-energetique/travaux/pompe-a-chaleur' },
              { label: 'Consommation' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Gauge className="w-3.5 h-3.5" aria-hidden />
              Norme EN 14511 — Règlement UE 813/2013 (eco-design)
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Consommation Pompe à Chaleur 2026 : kWh, COP, facture
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Une <strong>pompe à chaleur air-eau</strong> consomme en moyenne{' '}
              <strong>3 000 à 7 000 kWh d’électricité par an</strong> pour une maison 100 m² isolée
              en zone H2, soit <strong>600 à 1 400 €</strong> de facture EDF (tarif Base 2026). Le
              rendement réel dépend du COP/SCOP, de l’isolation, de la zone climatique et des
              réglages. Voici les valeurs réelles, le calcul théorique, le comparatif vs gaz/fioul,
              et 10 leviers pour réduire la consommation.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2 id="conso-par-type">Consommation moyenne par type de PAC</h2>
            <p>
              Référence : maison 100 m² classe DPE C-D, zone H2 (climat moyen tempéré), 4 occupants.
              Tarif EDF Base 2026 : 0,2516 €/kWh TTC.
            </p>
            <div className="not-prose grid gap-3 my-6">
              {CONSO_PAR_TYPE.map((c) => (
                <div key={c.type} className="bg-white border border-sand-200 rounded-xl p-4">
                  <div className="flex items-start gap-2 mb-2">
                    <Activity className="w-4 h-4 text-primary-700 shrink-0 mt-1" aria-hidden />
                    <p className="font-semibold text-sand-900 m-0">{c.type}</p>
                  </div>
                  <div className="grid md:grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-sand-500 text-xs m-0">COP / SCOP</p>
                      <p className="font-medium text-sand-900 m-0">{c.cop}</p>
                    </div>
                    <div>
                      <p className="text-sand-500 text-xs m-0">Conso annuelle</p>
                      <p className="font-medium text-primary-700 m-0">{c.conso}</p>
                    </div>
                    <div>
                      <p className="text-sand-500 text-xs m-0">Facture €/an</p>
                      <p className="font-medium text-primary-700 m-0">{c.facture}</p>
                    </div>
                  </div>
                  <p className="text-xs text-sand-600 mt-2 mb-0">{c.detail}</p>
                </div>
              ))}
            </div>

            <h2 id="cop-scop">COP, SCOP : ce qu’ils mesurent vraiment</h2>
            <p>
              <Zap className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
              Le <strong>COP (Coefficient de Performance)</strong> est mesuré en laboratoire selon
              la norme EN 14511 : COP 4 = la PAC restitue 4 kWh de chaleur pour 1 kWh d’électricité
              consommée. Le COP varie avec la T° extérieure : à +7 °C, COP ~4 ; à -7 °C, COP ~2,5 ;
              à -15 °C, COP ~1,8.
            </p>
            <p>
              <Snowflake className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
              Le <strong>SCOP (Seasonal COP)</strong> intègre la performance moyenne sur toute la
              saison de chauffe selon le Règlement UE 813/2013 (eco-design). Il prend en compte les
              démarrages, l’appoint électrique et les conditions climatiques réelles. Un SCOP 4 est
              bon, SCOP 4,5+ excellent. Pour MaPrimeRénov’ PAC air-eau, le SCOP minimum exigé est
              3,4 (zone H1 froide) à 3,9 (zone H3 chaude) en 2026.
            </p>
            <p className="text-xs text-sand-500">
              ⚠ Le COP communiqué par les fabricants est souvent le COP nominal (+7 °C). Pour
              estimer la consommation réelle annuelle, baser le calcul sur le SCOP, pas le COP.
            </p>

            <h2 id="calcul">Calcul théorique de la consommation</h2>
            <p>
              <Calculator className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
              Formule simple :
            </p>
            <div className="not-prose bg-primary-50 border border-primary-200 rounded-xl p-4 my-4">
              <p className="font-mono text-center text-primary-900 m-0">
                Conso élec (kWh/an) = Besoins thermiques (kWh/an) ÷ SCOP
              </p>
            </div>
            <p>
              <strong>Exemple chiffré</strong> — maison 100 m² classe D (consommation
              conventionnelle ~ 200 kWh/m²/an pour le chauffage seul) :
            </p>
            <ul>
              <li>Besoins thermiques chauffage = 100 × 120 = 12 000 kWh/an</li>
              <li>
                Avec SCOP 4 (PAC air-eau performante) : 12 000 ÷ 4 ={' '}
                <strong>3 000 kWh élec/an</strong>
              </li>
              <li>
                Avec SCOP 3,5 (PAC entrée de gamme) : 12 000 ÷ 3,5 ={' '}
                <strong>3 430 kWh élec/an</strong>
              </li>
              <li>
                Avec SCOP 5 (géothermie) : 12 000 ÷ 5 = <strong>2 400 kWh élec/an</strong>
              </li>
              <li>Pour ECS (4 personnes) : ajouter 1 000-1 500 kWh/an</li>
            </ul>
            <p className="text-xs text-sand-500">
              Tolérance ±20 % vs consommation réelle selon usage, exposition, dérogations
              ponctuelles.
            </p>

            <h2 id="facteurs">7 facteurs qui font varier la consommation</h2>
            <div className="not-prose grid gap-3 my-6">
              {FACTEURS_CONSO.map((f) => (
                <div key={f.titre} className="bg-white border border-sand-200 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-semibold text-sand-900 m-0">→ {f.titre}</p>
                    <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-primary-100 text-primary-800">
                      {f.impact}
                    </span>
                  </div>
                  <p className="text-sm text-sand-700 m-0">{f.detail}</p>
                </div>
              ))}
            </div>

            <h2 id="comparatif">PAC vs gaz, fioul, électrique : qui consomme le moins ?</h2>
            <p>
              Référence : maison 100 m² classe D, zone H2, chauffage + ECS, 4 occupants. Tarifs
              énergie 2026 (mai).
            </p>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Système</th>
                    <th className="p-3 border-b border-sand-200">Conso/an</th>
                    <th className="p-3 border-b border-sand-200">Facture €/an</th>
                    <th className="p-3 border-b border-sand-200">CO2 kg/an</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARATIF_SYSTEMES.map((s) => (
                    <tr key={s.systeme} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold text-sand-900">{s.systeme}</td>
                      <td className="p-3 text-sand-700">{s.conso}</td>
                      <td className="p-3 text-primary-700 font-semibold">{s.facture}</td>
                      <td className="p-3 text-sand-700">{s.co2}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-sand-500">
              Sources : EDF tarif Bleu Base 2026, ENGIE tarif B1 gaz, ADEME bilan carbone (60 g
              CO2/kWh élec, 200 g CO2/kWh gaz, 270 g CO2/kWh fioul). Granulés bois CO2 biogénique
              compté neutre par méthode ADEME.
            </p>

            <h2 id="leviers">10 leviers pour réduire la consommation</h2>
            <p>
              <TrendingDown className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
              Cumul possible : -30 à -40 % de consommation par rapport à un usage standard.
            </p>
            <div className="not-prose my-6">
              <ol className="space-y-2 list-none m-0 p-0">
                {LEVIERS_ECONOMIE.map((l, i) => (
                  <li
                    key={i}
                    className="bg-white border border-sand-200 rounded-lg p-3 flex items-start gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-800 grid place-items-center shrink-0 font-bold text-xs">
                      {i + 1}
                    </div>
                    <p className="text-sm text-sand-700 m-0">{l}</p>
                  </li>
                ))}
              </ol>
            </div>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Estimer aides PAC + remplacement ancien système
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Calcul instantané MaPrimeRénov’ + CEE + éco-PTZ pour installer ou remplacer une
                    PAC. Mise en relation avec un artisan RGE QualiPAC certifié.
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

            <div className="not-prose flex items-start gap-3 border border-amber-200 bg-amber-50 rounded-lg p-4 my-6">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <div className="text-sm text-amber-900">
                <p className="font-semibold m-0 mb-1">Attention : COP nominal ≠ SCOP réel</p>
                <p className="m-0">
                  Les fabricants communiquent souvent le COP nominal (mesuré à +7 °C, dans des
                  conditions optimales). Pour estimer la consommation réelle annuelle, exigez le{' '}
                  <strong>SCOP</strong> (Règlement UE 813/2013) qui intègre la performance
                  saisonnière complète. Demandez l’étiquette énergie obligatoire (classe A++ à G).
                </p>
              </div>
            </div>

            <h2 id="ancienne-pac">Ma PAC consomme trop : remplacer en 2026 ?</h2>
            <p>
              <Thermometer className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
              Une PAC de plus de 15 ans a typiquement un COP dégradé de 20-30 % (encrassement
              compresseur, fluide frigorigène vieilli, ventilateurs usés). Une PAC neuve haut de
              gamme avec SCOP 4,5+ peut diviser la consommation par 1,3 à 1,5 vs un modèle 2010.
            </p>
            <p>
              <strong>ROI typique remplacement</strong> : 8-12 ans selon prix initial (10-18 K€) et
              économie facture (300-600 €/an). MaPrimeRénov’ 2026 inclut une aide remplacement PAC
              ancienne (pas seulement énergie fossile) jusqu’à 5 000 € (très modeste, classe gain ≥
              2). Un audit énergétique préalable est conseillé avant décision (500-1 500 € TTC, voir
              notre{' '}
              <Link href="/blog/prix-audit-energetique-2026">guide audit énergétique 2026</Link>
              ).
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
              href="/renovation-energetique/travaux/pompe-a-chaleur"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Hub Pompe à chaleur
            </Link>
            <Link
              href="/renovation-energetique/travaux/pompe-a-chaleur/entretien"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Entretien PAC <Coins className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
