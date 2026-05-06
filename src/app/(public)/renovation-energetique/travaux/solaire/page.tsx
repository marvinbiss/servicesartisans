/**
 * /renovation-energetique/travaux/solaire — hub Solaire PV cluster (Pilier 2).
 *
 * @kw-primary    panneau solaire prix
 * @kw-volume     6300
 * @kw-kd         25
 * @kw-cpc        2.40
 * @cluster       2
 * @ahrefs-source docs/STRATEGIE-RENOVATION-ENERGETIQUE-V2-FUSED-2026-05-04.md#solaire-pv-orphelin
 * @backlog-item  P3-solaire-cluster
 * @snapshot      2026-05-06 (Ahrefs Bloc 1 v3 — cluster orphelin V1, supply 3 985 QualiPV)
 *
 * KW cibles validés Bloc 1 v3 (country=fr) :
 * - "panneau solaire"                  → 87 000 vol, KD 43 (parent générique — head pillar)
 * - "panneau photovoltaique"           → 21 000 vol, KD 27 (variant orthographe)
 * - "panneaux solaires"                → 20 000 vol, KD 38 (pluriel)
 * - "panneau solaire prix"             → 6 300 vol, KD 25 (HUB primary — achievable)
 * - "panneau solaire 1000w"            → 2 100 vol, KD 1 (sub-page candidat — easy win)
 * - "nettoyage panneau solaire"        → 3 300 vol, KD 3 (sub-page candidat)
 * - "panneau solaire piscine"          → 2 700 vol, KD 2 (sub-page candidat)
 * - "panneau solaire souple"           → 2 100 vol, KD 0 (sub-page candidat — easy win)
 * - "panneau solaire avec batterie"    → 3 400 vol, KD 13
 * - "rendement panneau solaire"        → 3 200 vol, KD 6
 * - "aide panneau solaire 2024"        → 4 500 vol, KD 6 (renvoi /aides)
 * - "panneau solaire gratuit gouvernement" → 1 000 vol, KD 7 (clarif anti-arnaque)
 * - Cluster cumulé Bloc 1 : 288 KW, vol 229 940/mo, KD moyen 10.4
 *
 * Easy win : OUI sur sub-niches (KD 0-3). Head term `panneau solaire` 87K KD 43
 * irréaliste pour SA DR 0.6 — on capture via cluster + maillage interne.
 *
 * Concurrence head : Effy DR 72, QuelleEnergie, EDF ENR, Engie. Atout SA :
 * 3 985 QualiPV RGE actifs (snapshot DB 2026-05-06) répartis 81 départements
 * + simulateur aides + comparatif neutre + clarif "PV hors CEE / hors MPR".
 *
 * Anti-cannibalisation :
 *   - /guides/panneau-solaire-prix-rentabilite (guide isolé, pré-existant) →
 *     ce hub absorbe l'autorité topical via maillage descendant
 *   - /rge/labels/qualipv (à créer) — monographie label QualiPV
 *   - /rge/labels/qualisol (existant) — solaire thermique CESI/SSC
 *
 * Aides PV résidentiel (rappel critique YMYL) :
 *   - PV pur PAS éligible CEE (cf src/lib/rge/qualification-matcher.ts:106)
 *   - PV pur PAS éligible MaPrimeRénov' (uniquement solaire thermique)
 *   - Prime autoconsommation EDF OA Solaire (versée 5 ans, barème 2026)
 *   - TVA 10 % si ≤3 kWc (sinon 20 %)
 *   - Exonération IR si ≤3 kWc et autoconsommation
 *   - Tarif d'achat surplus : ~0,1276 €/kWh (S1 2026 EDF OA, ≤9 kWc)
 *
 * Marques principales couvertes : DualSun, Sunpower, REC, LG, Trina, JA Solar,
 * Q.Cells, SystoVi (top 8 marché France 2026).
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Award, Calculator } from 'lucide-react'

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

const PAGE_PATH = '/renovation-energetique/travaux/solaire'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'marc-lefebvre'
const AUTHOR_NAME = 'Marc Lefebvre'

const TITLE = 'Panneau solaire 2026 : prix, aides, rendement (guide complet)'
const DESCRIPTION =
  'Panneau solaire 2026 : prix posé 7 500-19 000 €, prime autoconsommation EDF OA, TVA 10 %, rendement 14-22 %. Comparatif PV / hybride / souple, ROI 8-12 ans.'

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
  'Panneau solaire = production d’électricité (photovoltaïque) ou de chaleur (thermique). Le PV domine le résidentiel.',
  '4 grandes familles : cristallin (mono / poly), amorphe (souple), hybride PV-T, thermique CESI.',
  'Prix posé 2026 (PV cristallin) : 3 kWc 7 500-9 000 €, 6 kWc 12 000-15 000 €, 9 kWc 16 000-19 000 €.',
  'Aides PV pur : prime EDF OA autoconsommation (~80-380 €/kWc), TVA 10 % ≤3 kWc, exonération IR ≤3 kWc. Pas de MaPrimeRénov’ ni CEE.',
  'Rendement cristallin mono 18-22 %, poly 14-16 %, amorphe 6-9 %. Garantie production 80-85 % à 25 ans.',
  'Production type 3 kWc Sud France : 3 600-4 200 kWh/an. Reste à charge post-aides 5 500-7 000 €. ROI 8-12 ans.',
  'Artisan RGE QualiPV obligatoire pour la prime EDF OA + Consuel. SA référence 3 985 QualiPV actifs (snapshot 2026-05-06).',
]

const TYPES = [
  {
    type: 'PV cristallin monocristallin',
    prix: '7 500-19 000 € posé (3-9 kWc)',
    aide: 'Prime EDF OA + TVA 10 % (≤3 kWc)',
    perf: 'Rendement 18-22 %',
    detail:
      'Top du marché. Cellules silicium pur, couleur uniforme noire. Idéal toiture orientation sud, surface limitée. Garantie production 25 ans à 80-85 %. **Choix #1 résidentiel 2026.**',
    href: '#types-solaire',
  },
  {
    type: 'PV cristallin polycristallin',
    prix: '6 500-16 000 € posé (3-9 kWc)',
    aide: 'Prime EDF OA + TVA 10 % (≤3 kWc)',
    perf: 'Rendement 14-16 %',
    detail:
      'Moins cher que monocristallin (~10-15 %), couleur bleutée. Bonne option si surface toit suffisante. Garantie 20-25 ans. Tend à disparaître au profit du mono.',
    href: '#types-solaire',
  },
  {
    type: 'Panneau solaire souple (amorphe)',
    prix: '300-1 200 € le module 100-200 W',
    aide: 'Aucune (hors résidentiel sédentaire)',
    perf: 'Rendement 6-9 %',
    detail:
      'Léger, courbable, pose sur toit irrégulier ou véhicule. Faible rendement = surface 2× plus grande. **Niche : fourgon, bateau, abri jardin.** Pas pour résidence principale.',
    href: '#souple',
  },
  {
    type: 'Hybride PV-thermique (PV-T)',
    prix: '12 000-22 000 € posé',
    aide: 'Prime EDF OA (côté élec) + MPR (côté thermique selon configuration)',
    perf: 'Rendement combiné 60-75 %',
    detail:
      'Capteur 2-en-1 : produit électricité + chauffe l’eau sanitaire. Refroidit le panneau PV (rendement +10-15 %). Niche premium. Vérifier compat ballon ECS.',
    href: '#hybride',
  },
  {
    type: 'Solaire thermique CESI / SSC',
    prix: '4 000-9 000 € posé',
    aide: 'MaPrimeRénov’ + CEE BAR-TH-143 (SSC)',
    perf: 'Couvre 50-70 % besoin ECS / 25-40 % chauffage',
    detail:
      'Capteurs solaires raccordés à un ballon ou un système combiné. **Distinct du PV.** Aides MPR + CEE accessibles, label RGE QualiSol requis.',
    href: '/rge/labels/qualisol',
  },
]

const ARBRE_DECISION = [
  {
    profil: 'Maison individuelle, toit sud 30°, 100 m², famille 4',
    recommandation: 'PV cristallin mono 6 kWc + autoconsommation + revente surplus',
    justification:
      'Production ~6 800 kWh/an couvre 60-80 % conso annuelle. Rentabilité 9-11 ans. Investissement 12 000-15 000 € posé.',
  },
  {
    profil: 'Toit ombragé partiellement (cheminée, voisinage)',
    recommandation: 'PV mono + micro-onduleurs (Enphase, APsystems)',
    justification:
      'Chaque panneau optimisé indépendamment, l’ombre ne pénalise plus toute la chaîne. Surcoût 8-12 % vs onduleur central.',
  },
  {
    profil: 'Toit non orienté plein sud (est-ouest)',
    recommandation: 'PV mono répartition est-ouest avec onduleur 2 strings',
    justification:
      'Production étalée matin + soir, mieux corrélée à la conso domestique = autoconso plus élevée. Perte annuelle ~10-15 % vs sud pur.',
  },
  {
    profil: 'Logement neuf RT2020 / RE2020',
    recommandation: 'PV cristallin mono + batterie + pilotage smart',
    justification:
      'RE2020 valorise la production EnR locale. Batterie 5-10 kWh permet autoconso 70-90 %. ROI 11-14 ans.',
  },
  {
    profil: 'Budget serré, ECS uniquement (douches + lave-linge eau chaude)',
    recommandation: 'Solaire thermique CESI 2-4 m² + ballon 200 L',
    justification:
      'Couvre 50-70 % besoin ECS annuel. Prix posé 4 000-6 000 €, MPR 2 500-4 000 € + CEE = reste à charge 0-1 500 €. **Plus rentable que le PV à budget équivalent.**',
  },
  {
    profil: 'Piscine chauffée saisonnière',
    recommandation: 'Capteurs souples ou tubulaires solaires (sans PV)',
    justification:
      'Réseau dédié bassin, ROI 3-5 ans sur facture chauffage piscine. Voir page dédiée /solaire/piscine.',
  },
  {
    profil: 'Site isolé / refuge / chalet hors réseau',
    recommandation: 'PV mono autonome + batterie LiFePO4 + onduleur hybride',
    justification:
      'Système off-grid 1-3 kWc + batterie 5-15 kWh selon usage. Pas d’aide EDF OA (pas de raccordement réseau). Coût total 6 000-15 000 €.',
  },
]

const PRIX_PAR_KWC = [
  {
    puissance: '3 kWc (8-10 panneaux)',
    prix_pose: '7 500-9 000 €',
    prime_oa: '~1 140 € (380 €/kWc)',
    production: '3 600-4 200 kWh/an',
    foyers: 'Studio à T3, conso 3 500-5 000 kWh/an',
  },
  {
    puissance: '6 kWc (15-18 panneaux)',
    prix_pose: '12 000-15 000 €',
    prime_oa: '~1 680 € (280 €/kWc)',
    production: '6 800-8 200 kWh/an',
    foyers: 'Maison 100 m², conso 7 000-9 000 kWh/an',
  },
  {
    puissance: '9 kWc (22-27 panneaux)',
    prix_pose: '16 000-19 000 €',
    prime_oa: '~2 520 € (280 €/kWc)',
    production: '10 200-12 500 kWh/an',
    foyers: 'Maison 150 m² + voiture élec, conso 10 000-13 000 kWh/an',
  },
  {
    puissance: '+ batterie LiFePO4 5 kWh',
    prix_pose: '+ 4 000-7 000 €',
    prime_oa: 'Aucune sur la batterie',
    production: 'Stockage autoconso soir / nuit',
    foyers: 'Permet 70-90 % autoconso (vs 30-50 % sans batterie)',
  },
]

const faqs = [
  {
    question: 'Quel type de panneau solaire choisir en 2026 ?',
    answer:
      'Trois cas typiques. (1) <strong>Maison individuelle, toit sud, conso > 5 000 kWh/an</strong> : PV cristallin <strong>monocristallin 3-6 kWc</strong> en autoconsommation + revente surplus EDF OA. C’est le scénario standard 2026 (rentabilité 8-12 ans). (2) <strong>Budget serré + besoin ECS prioritaire</strong> : <strong>solaire thermique CESI</strong> (4 000-6 000 €, MPR + CEE possibles, plus rentable que PV équivalent). (3) <strong>Toit irrégulier / fourgon / bateau</strong> : <strong>panneaux souples amorphes</strong> (niche mobile). Avant tout devis, vérifier orientation toit (sud ±45°), pente (20-45° optimal), absence d’ombre permanente.',
  },
  {
    question: 'Combien coûte un panneau solaire posé en 2026 ?',
    answer:
      'Prix posé 2026 (PV cristallin mono autoconso) : <strong>3 kWc</strong> 7 500-9 000 €, <strong>6 kWc</strong> 12 000-15 000 €, <strong>9 kWc</strong> 16 000-19 000 €. <strong>+ batterie LiFePO4 5 kWh</strong> : 4 000-7 000 € de plus. Le matériel (panneaux + onduleur) représente 55-70 %, la pose (échafaudage + raccordement + Consuel) 30-45 %. <strong>Solaire thermique CESI</strong> : 4 000-9 000 € posé selon surface capteurs (2-6 m²) et ballon (200-400 L). <strong>Hybride PV-T</strong> : 12 000-22 000 €. Hors aides ; voir question suivante.',
  },
  {
    question: 'Quelles aides pour les panneaux solaires en 2026 ?',
    answer:
      'Le <strong>photovoltaïque pur (PV)</strong> n’est <strong>PAS éligible MaPrimeRénov’ ni CEE</strong>. Aides spécifiques : <strong>prime à l’autoconsommation EDF OA</strong> (~380 €/kWc ≤3 kWc, 280 €/kWc 3-9 kWc, 190 €/kWc 9-36 kWc — versée sur 5 ans), <strong>TVA 10 %</strong> au lieu de 20 % si ≤3 kWc, <strong>exonération impôt sur le revenu</strong> sur la revente si ≤3 kWc. Tarif d’achat surplus EDF OA S1 2026 : ~0,1276 €/kWh (≤9 kWc, 20 ans contrat). Le <strong>solaire thermique (CESI / SSC)</strong> est éligible MPR (jusqu’à 4 000 €) + CEE BAR-TH-143 (SSC uniquement). Cumul avec éco-PTZ possible si bouquet de travaux. Aides locales (régions, départements) à vérifier au cas par cas — voir <a href="/aides/par-region">/aides/par-region</a>.',
  },
  {
    question: 'Combien de temps pour rentabiliser ses panneaux solaires ?',
    answer:
      '<strong>ROI typique PV cristallin résidentiel 2026</strong> : 8-12 ans en autoconsommation + revente surplus (Sud / Centre France, toit sud). Calcul type 6 kWc : investissement 13 000 €, prime EDF OA -1 680 €, soit reste à charge 11 320 €. Économie annuelle (autoconso 40 % + revente 60 % à 0,1276 €/kWh) : ~1 100-1 350 €/an. Rentabilité 8-10 ans, puis 15-17 ans de gain net (durée de vie 25-30 ans). Avec batterie LiFePO4 (autoconso 70-90 %) : ROI rallongé à 11-14 ans mais résilience coupures + indépendance réseau. <strong>Solaire thermique CESI</strong> : ROI 5-9 ans avec MPR.',
  },
  {
    question: 'Quel est le rendement d’un panneau solaire ?',
    answer:
      '<strong>Cristallin monocristallin</strong> : 18-22 % (top, premium technologies tandem en montée). <strong>Cristallin polycristallin</strong> : 14-16 %. <strong>Amorphe / souple</strong> : 6-9 %. <strong>Hybride PV-T</strong> : 60-75 % en cumulé (élec 17 % + thermique 50 %). <strong>Production réelle</strong> dépend de l’orientation, l’inclinaison, l’ombre, la latitude et la qualité de l’onduleur — comptez 1 000-1 200 kWh/kWc/an Sud France, 850-1 000 kWh/kWc/an Centre, 800-900 kWh/kWc/an Nord. Garantie production constructeur : <strong>80-85 % à 25 ans</strong> (panneaux Tier 1 : SunPower, REC, Q.Cells, JA Solar, Trina).',
  },
  {
    question: 'Faut-il un artisan QualiPV / RGE pour bénéficier des aides ?',
    answer:
      'Oui, obligatoire pour la <strong>prime à l’autoconsommation EDF OA</strong> et la <strong>TVA 10 %</strong>. La mention RGE concernée est <strong>QualiPV</strong> (Qualit’EnR, modules ≤500 kWc) ou <strong>QualiSol</strong> (pour solaire thermique). Le label doit être valide au moment du devis (vérification ADEME mensuelle). En complément, le <strong>Consuel</strong> est obligatoire pour le raccordement au réseau (attestation de conformité électrique, ~125-180 €). Notre annuaire référence <strong>3 985 artisans QualiPV actifs en France</strong> (snapshot 2026-05-06), avec couverture top régions Occitanie (831), Auvergne-Rhône-Alpes (750), Nouvelle-Aquitaine (665).',
  },
  {
    question: 'Autoconsommation totale ou revente totale du surplus ?',
    answer:
      'Trois schémas. (1) <strong>Vente totale</strong> : tarif d’achat plus élevé (~0,15-0,17 €/kWh ≤9 kWc), mais zéro autoconsommation directe. <strong>Discontinué pour les nouveaux contrats</strong> depuis octobre 2023 sauf cas très spécifiques. (2) <strong>Autoconsommation + vente du surplus</strong> : <strong>schéma majoritaire 2026</strong>. Vous consommez ce que vous produisez en direct (gratuit), revendez l’excédent à EDF OA à 0,1276 €/kWh (S1 2026, ≤9 kWc, contrat 20 ans). Prime EDF OA sur 5 ans. (3) <strong>Autoconsommation totale</strong> : aucune revente, surplus perdu sauf si batterie. Rentabilité dépend du taux d’autoconso (sans batterie 30-50 %, avec batterie 70-90 %).',
  },
  {
    question: 'Comment entretenir et nettoyer ses panneaux solaires ?',
    answer:
      'Les panneaux solaires sont <strong>quasi sans entretien</strong>. Pluie + auto-nettoyage électrostatique suffisent dans 80 % des cas. <strong>Nettoyage manuel recommandé 1-2× par an</strong> si environnement poussiéreux (proche route, pollens, fientes oiseaux), avec eau déminéralisée et raclette télescopique souple — <strong>jamais de jet haute pression</strong> ni de produits abrasifs (risque rayure cellule + perte garantie). Coût pro : 80-180 € par session pour 6 kWc. Vérifier l’<strong>onduleur tous les 2 ans</strong> (fusibles, bornes, mise à jour firmware) et la <strong>boîte de jonction</strong> (étanchéité). Production en baisse > 10 % vs année précédente = inspection requise. Voir page dédiée <a href="#nettoyage">/solaire/nettoyage-entretien</a>.',
  },
]

const sources = [
  { label: 'France Rénov’ — Solaire photovoltaïque', url: 'https://france-renov.gouv.fr' },
  { label: 'EDF OA Solaire — Tarifs et primes', url: 'https://www.edf-oa.fr' },
  { label: 'ADEME — Guide photovoltaïque résidentiel', url: 'https://www.ademe.fr' },
  { label: 'Service-Public.fr — Aides solaire particuliers', url: 'https://www.service-public.fr' },
  { label: 'CRE — Tarifs S1 2026 photovoltaïque', url: 'https://www.cre.fr' },
  { label: 'Qualit’EnR — Annuaire QualiPV / QualiSol', url: 'https://www.qualit-enr.org' },
  { label: 'Consuel — Attestation conformité électrique', url: 'https://www.consuel.com' },
]

const relatedPages = [
  {
    label: 'Hub Travaux rénovation',
    href: '/renovation-energetique/travaux',
    description: '4 clusters travaux + ordre logique post-isolation',
  },
  {
    label: 'Pompe à chaleur',
    href: '/renovation-energetique/travaux/pompe-a-chaleur',
    description: 'Cluster PAC : air-eau, air-air, géothermie',
  },
  {
    label: 'Label QualiSol (solaire thermique)',
    href: '/rge/labels/qualisol',
    description: 'CESI / SSC — chauffe-eau solaire éligible MPR',
  },
  {
    label: 'Aides 2026 — Hub',
    href: '/aides',
    description: 'Cumul MPR / CEE / éco-PTZ / aides locales',
  },
  {
    label: 'Guide prix panneau solaire 2026',
    href: '/guides/panneau-solaire-prix-rentabilite',
    description: 'Détail prix posé + ROI par configuration',
  },
  {
    label: 'Simulateur aides 2026',
    href: '/simulateur-aides-renovation',
    description: 'Calcul personnalisé prime EDF OA + cumul',
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
    section: 'Solaire',
    keywords: [
      'panneau solaire',
      'panneau solaire prix',
      'panneau photovoltaique',
      'panneau solaire 1000w',
      'panneau solaire piscine',
      'panneau solaire souple',
      'rendement panneau solaire',
      'aide panneau solaire 2026',
      'qualipv',
      'autoconsommation solaire',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique/travaux' },
    { name: 'Solaire', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const govSchema = getGovernmentServiceSchema({
    name: 'Solaire photovoltaïque : prime EDF OA + TVA 10 % 2026',
    description:
      'Panneaux solaires éligibles à la prime à l’autoconsommation EDF OA Solaire et à la TVA 10 % (≤3 kWc). Installation par artisan RGE QualiPV obligatoire. Pas d’éligibilité MaPrimeRénov’ ni CEE pour le PV pur résidentiel.',
    url: PAGE_URL,
    serviceType: 'Subvention publique solaire photovoltaïque',
    audience: 'Propriétaires occupants, bailleurs, copropriétés',
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
              { label: 'Travaux', href: '/renovation-energetique/travaux' },
              { label: 'Solaire' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Award className="w-3.5 h-3.5" aria-hidden />
              Hub Solaire 2026 — PV / hybride / thermique
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Panneau solaire 2026 : prix, aides et rendement
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Le <strong>panneau solaire</strong> couvre deux usages distincts : la production d’
              <strong>électricité</strong> (photovoltaïque, PV) et la production de{' '}
              <strong>chaleur</strong> (thermique, CESI / SSC). En résidentiel,{' '}
              <strong>le PV cristallin monocristallin domine</strong> (rendement 18-22 %, prix posé
              7 500-19 000 € selon puissance 3-9 kWc). Aides spécifiques :{' '}
              <strong>prime EDF OA</strong> à l’autoconsommation, <strong>TVA 10 %</strong> ≤3 kWc,
              exonération impôt sur le revenu. Le PV pur n’est <strong>pas éligible</strong>{' '}
              MaPrimeRénov’ ni CEE — distinct du solaire thermique. Artisan{' '}
              <strong>RGE QualiPV</strong> obligatoire.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2 id="types-solaire">Les 5 grandes familles de panneaux solaires</h2>
            <div className="not-prose grid gap-3 my-6">
              {TYPES.map((t) => (
                <div key={t.type} className="bg-white border border-sand-200 rounded-xl p-5">
                  <div className="flex items-baseline justify-between gap-2 flex-wrap mb-2">
                    <h3 className="font-heading text-base font-semibold text-sand-900 m-0">
                      {t.type}
                    </h3>
                    <span className="text-sm font-bold text-primary-700 whitespace-nowrap">
                      {t.prix}
                    </span>
                  </div>
                  <p className="text-xs text-sand-500 m-0 mb-1">
                    Performance : {t.perf} · Aide : {t.aide}
                  </p>
                  <p
                    className="text-sm text-sand-700 m-0"
                    dangerouslySetInnerHTML={{ __html: t.detail }}
                  />
                  {t.href.startsWith('/') && (
                    <Link
                      href={t.href}
                      className="text-sm font-semibold text-primary-700 hover:text-primary-900 inline-flex items-center gap-1 mt-2"
                    >
                      Page dédiée <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                    </Link>
                  )}
                </div>
              ))}
            </div>

            <h2 id="arbre-decision">Quel type de solaire selon votre profil</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Profil</th>
                    <th className="p-3 border-b border-sand-200">Recommandation</th>
                    <th className="p-3 border-b border-sand-200">Pourquoi</th>
                  </tr>
                </thead>
                <tbody>
                  {ARBRE_DECISION.map((r) => (
                    <tr key={r.profil} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium text-sand-900">{r.profil}</td>
                      <td className="p-3 text-primary-700 font-semibold">{r.recommandation}</td>
                      <td className="p-3 text-sand-600">{r.justification}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 id="prix-kwc">Prix posé 2026 par puissance (PV cristallin mono)</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Puissance</th>
                    <th className="p-3 border-b border-sand-200">Prix posé</th>
                    <th className="p-3 border-b border-sand-200">Prime EDF OA</th>
                    <th className="p-3 border-b border-sand-200">Production / Foyer cible</th>
                  </tr>
                </thead>
                <tbody>
                  {PRIX_PAR_KWC.map((p) => (
                    <tr key={p.puissance} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium text-sand-900">{p.puissance}</td>
                      <td className="p-3 text-primary-700 font-semibold">{p.prix_pose}</td>
                      <td className="p-3 text-sand-700">{p.prime_oa}</td>
                      <td className="p-3 text-sand-600 text-xs">
                        {p.production}
                        <br />
                        <span className="text-sand-500 italic">{p.foyers}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-sand-500 italic">
              Barème prime EDF OA — S1 2026 (CRE délibération du 13/02/2026). Prix posé inclut
              matériel Tier 1, onduleur, pose, raccordement, Consuel. Hors batterie sauf mention.
            </p>

            <h2 id="aides-solaire">Aides PV résidentiel 2026 (rappel critique)</h2>
            <p>
              Le <strong>photovoltaïque pur</strong> (production d’électricité) n’est{' '}
              <strong>PAS éligible</strong> à MaPrimeRénov’ ni au dispositif CEE — ces aides sont
              réservées aux travaux d’efficacité énergétique côté <em>consommation</em> (isolation,
              chauffage, ECS). Aides spécifiques au PV :
            </p>
            <ul>
              <li>
                <strong>Prime à l’autoconsommation EDF OA Solaire</strong> : ~380 €/kWc (≤3 kWc),
                280 €/kWc (3-9 kWc), 190 €/kWc (9-36 kWc). Versée trimestriellement sur 5 ans.
              </li>
              <li>
                <strong>TVA réduite 10 %</strong> (au lieu de 20 %) si puissance ≤ 3 kWc et pose par
                artisan RGE.
              </li>
              <li>
                <strong>Exonération d’impôt sur le revenu</strong> sur la revente du surplus si
                puissance ≤ 3 kWc et autoconsommation.
              </li>
              <li>
                <strong>Tarif d’achat surplus EDF OA</strong> : ~0,1276 €/kWh (≤9 kWc, S1 2026,
                contrat 20 ans).
              </li>
              <li>
                <strong>Aides locales</strong> : régions et départements (variable, voir{' '}
                <Link href="/aides/par-region">/aides/par-region</Link>).
              </li>
            </ul>
            <p>
              Le <strong>solaire thermique</strong> (CESI / SSC) suit un régime distinct : éligible
              MaPrimeRénov’ + CEE BAR-TH-143, label{' '}
              <Link href="/rge/labels/qualisol">QualiSol</Link> requis. Voir le{' '}
              <Link href="/renovation-energetique/aides/maprimerenov-2026">
                guide MaPrimeRénov’ 2026
              </Link>{' '}
              pour le détail.
            </p>

            <h2 id="rge">Le label RGE QualiPV : pourquoi c’est obligatoire</h2>
            <p>
              La mention <strong>QualiPV</strong> (Qualit’EnR) certifie la compétence d’un
              installateur de générateurs photovoltaïques raccordés au réseau (modules ≤ 500 kWc).
              Sans QualiPV valide à la date du devis, vous perdez : la prime EDF OA, la TVA 10 %,
              l’exonération IR. Vérification possible sur{' '}
              <a
                href="https://france-renov.gouv.fr/annuaires-professionnels/artisan-rge"
                rel="noopener noreferrer"
                target="_blank"
              >
                france-renov.gouv.fr
              </a>{' '}
              ou via notre annuaire (mise à jour mensuelle source ADEME). Notre base référence{' '}
              <strong>3 985 artisans QualiPV actifs</strong> répartis sur 81 départements (snapshot
              2026-05-06). Top régions : Occitanie (831), Auvergne-Rhône-Alpes (750),
              Nouvelle-Aquitaine (665).
            </p>

            <h2 id="cta">Trouvez un artisan RGE QualiPV près de chez vous</h2>
            <div className="not-prose bg-primary-50 border border-primary-200 rounded-xl p-6 my-6">
              <p className="text-sand-900 m-0 mb-3">
                <Calculator className="inline w-5 h-5 text-primary-700 mr-1" aria-hidden />
                <strong>Devis solaire en 30 secondes</strong> — artisans certifiés RGE QualiPV pour
                bénéficier de la prime EDF OA + TVA 10 %.
              </p>
              <Link
                href="/devis"
                className="inline-flex items-center gap-2 bg-primary-700 hover:bg-primary-800 text-white font-semibold px-5 py-3 rounded-lg transition"
              >
                Demander mon devis solaire <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
            </div>
          </article>

          <FlagshipFaq items={faqs} />

          <section className="my-10">
            <h2 className="font-heading text-2xl font-bold text-sand-900 mb-4">
              Pour aller plus loin
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {relatedPages.map((p) => (
                <Link
                  key={p.href}
                  href={p.href}
                  className="block bg-white border border-sand-200 hover:border-primary-300 rounded-xl p-4 transition"
                >
                  <p className="font-semibold text-sand-900 m-0 mb-1 inline-flex items-center gap-1">
                    {p.label} <ArrowRight className="w-3.5 h-3.5 text-primary-700" aria-hidden />
                  </p>
                  <p className="text-sm text-sand-600 m-0">{p.description}</p>
                </Link>
              ))}
            </div>
          </section>

          <FlagshipSources sources={sources} />
          <FlagshipAuthorCard
            authorSlug={AUTHOR_SLUG}
            authorName={AUTHOR_NAME}
            datePublished={PUBLISHED}
            dateModified={MODIFIED}
          />
        </div>
      </div>
    </>
  )
}
