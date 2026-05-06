/**
 * /renovation-energetique/travaux/isolation/toiture — Levier 5 ROI.
 *
 * @kw-primary    isolation toiture
 * @kw-volume     5100
 * @kw-kd         2
 * @kw-cpc        0.25
 * @cluster       5
 * @ahrefs-source live keywords-explorer/overview snapshot 2026-05-06 country=fr
 * @backlog-item  P3-isolation-other-cluster
 *
 * Issu de l'audit `isolation_other` 871 KW vol cumulé 227K KD avg 3.9
 * (Vague 1 V1.5 stratégie V2 fused) — gap clair vs combles/ITE/ITI déjà couverts.
 *
 * KW cibles validés Ahrefs API live (snapshot 2026-05-06, country=fr) :
 * - "isolation toiture"             → 5 100 vol, KD 2  (PIVOT primary)
 * - "sarking"                       → 3 300 vol, KD 2  (technique extérieure spécifique)
 * - "isolation sous toiture"        → 1 800 vol, KD 0  (très ouvert — easy win)
 * - "isolation rampant"             → 1 000 vol, KD 2
 * - "isolation toit"                →   700 vol, KD 1
 * - "prix isolation toiture"        →   450 vol, KD 0
 * - "isolation toiture prix"        →   250 vol, KD 0
 * - "isolation toiture exterieur"   →   200 vol, KD 2
 * - "isolation toiture sarking"     →   200 vol, KD 1
 * - "prix isolation toiture m2"     →   150 vol, KD 0
 * - "isolation rampants"            →   150 vol, KD 1
 * - "isolation toiture interieur"   →   150 vol, KD 0
 * - "isolation toiture maison"      →   100 vol, KD 0
 * - "isolation toiture par l exterieur" → 70 vol (KD null)
 * - Cluster cumulé : ~13 670 vol/mo, KD avg 1.0 — quasi-libre.
 *
 * Easy win : OUI MAJEUR. 80 % des KW sont KD 0-2. Cluster massif sous-investi
 * V1. Concurrence head : Effy, ADEME, IsolEnergie, Hellio. Atout SA :
 * cluster isolation cohérent (combles + ITE + ITI + cette page toiture),
 * supply Qualibat 7131/7132 + Qualibat 8211 (couverture).
 *
 * Anti-cannibalisation :
 *   - /isolation/combles        → combles perdues + aménagées (vol 4 080 KD 5)
 *   - /isolation/exterieure-ite → murs ITE (vol 14K KD 2)
 *   - /isolation/interieure     → murs ITI (vol 248)
 *   - Cette page = TOITURE (sarking, rampants, sous-toiture). Distinction :
 *     "combles" = espace sous toit (isolation au sol des combles ou rampants
 *     côté intérieur du chevron). "Toiture" = approche par-dessus (sarking)
 *     ou angle système toiture complet (matériau écran HPV, refection).
 *
 * Aides 2026 (rappel YMYL) :
 *   - MaPrimeRénov' isolation rampants/toiture (forfait selon revenus, R ≥ 6
 *     m².K/W toiture par rampants, R ≥ 7 m².K/W combles perdus, R ≥ 4,4
 *     m².K/W toiture-terrasse) — barème révisé annuellement par l'Anah.
 *   - CEE BAR-EN-103 (isolation toiture) — prime variable opérateur.
 *   - Coup de pouce isolation : majoration ménages modestes.
 *   - Éco-PTZ jusqu'à 30 000 € (par geste) ou 50 000 € (rénovation d'ampleur).
 *   - TVA 5,5 % sur fourniture + pose par RGE Qualibat 7131/7132.
 *
 * Label RGE OBLIGATOIRE : Qualibat 7131 (isolation plâtrerie sèche, rampants
 * intérieur), Qualibat 7132 (ITE — sarking par certains poseurs), Qualibat
 * 8211 (couverture, sarking en réfection complète).
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Calculator, Layers } from 'lucide-react'

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

const PAGE_PATH = '/renovation-energetique/travaux/isolation/toiture'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'sophie-martin'
const AUTHOR_NAME = 'Sophie Martin'

const TITLE = 'Isolation toiture 2026 : sarking, rampants, prix posé'
const DESCRIPTION =
  'Isolation toiture 2026 : sarking par l’extérieur 80-180 €/m², rampants intérieur 50-120 €/m², écran sous-toiture HPV. Aides MPR + CEE BAR-EN-103, RGE Qualibat.'

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
  'L’isolation de la toiture représente 25-30 % des déperditions thermiques d’une maison non isolée — premier poste après les combles perdus.',
  '3 techniques principales : sarking (par l’extérieur, sur charpente), rampants intérieur (entre + sous chevrons), écran sous-toiture HPV.',
  'Sarking 80-180 €/m² posé · rampants intérieur 50-120 €/m² · écran sous-toiture seul 15-35 €/m².',
  'R minimum 2026 pour MaPrimeRénov’ : ≥ 6 m².K/W (toiture par rampants), ≥ 7 m².K/W (combles perdus), ≥ 4,4 m².K/W (toiture-terrasse).',
  'Aides cumulables : MaPrimeRénov’ (forfait selon revenus) + CEE BAR-EN-103 + Coup de pouce isolation + éco-PTZ + TVA 5,5 %.',
  'Label RGE Qualibat 7131 (rampants intérieur), 7132 (ITE/sarking), 8211 (couverture sarking) — obligatoire pour ouvrir droit aux aides.',
  'Si combles perdus : voir /isolation/combles (technique soufflage 20-40 €/m², ROI 1-3 ans).',
]

const TECHNIQUES = [
  {
    technique: 'Sarking (par l’extérieur)',
    prix: '80-180 €/m² posé',
    r: 'R 5-7 m².K/W typique',
    epaisseur: '100-160 mm',
    detail:
      'Panneaux isolants posés par-dessus la charpente, entre celle-ci et la couverture. Conserve volume habitable + traite les ponts thermiques. Idéal lors d’une réfection complète de toiture (DTU 40.41 + DTU 31.1). Pas d’intervention intérieure. Matériaux : laine de bois rigide (Steico, Pavatex), fibre de bois, PIR/PUR.',
    ideal: 'Rénovation lourde toiture, combles aménagés à conserver, charpente saine',
  },
  {
    technique: 'Rampants par l’intérieur',
    prix: '50-120 €/m² posé',
    r: 'R 6-8 m².K/W',
    epaisseur: '200-300 mm',
    detail:
      'Isolant en 2 couches : 1re entre chevrons, 2e en sous-face avec suspentes (rupture de pont thermique). Pare-vapeur côté chaud + plaque BA13. Réduit volume habitable de 20-30 cm. DTU 25.41 (plâtrerie). Matériaux : laine minérale (verre / roche), laine biosourcée (chanvre, ouate cellulose).',
    ideal: 'Combles aménagés, charpente accessible, pas de réfection toiture',
  },
  {
    technique: 'Écran sous-toiture HPV (haute perméabilité)',
    prix: '15-35 €/m² posé seul',
    r: 'Pas isolant en soi (R ≈ 0)',
    epaisseur: '0,5-1 mm',
    detail:
      'Membrane synthétique posée sous les liteaux. Étanchéité à l’air et à l’eau, mais perméable à la vapeur d’eau (HPV — haute perméabilité). Indispensable en complément de l’isolation pour évacuer l’humidité. NF DTU 40.29. À combiner avec sarking ou rampants.',
    ideal: 'Tout système toiture isolé (obligatoire si charpente bois)',
  },
  {
    technique: 'Toiture-terrasse (rare en résidentiel)',
    prix: '120-220 €/m² posé',
    r: 'R 4,4-6 m².K/W',
    epaisseur: '120-200 mm',
    detail:
      'Toiture plate ou très faiblement pentue. Isolation par-dessus l’étanchéité (toiture inversée) ou en dessous (toiture chaude). Matériaux : XPS, PIR, verre cellulaire. DTU 43.1 / 43.4. Spécifique aux maisons modernes.',
    ideal: 'Toiture plate / faible pente, refait étanchéité',
  },
]

const PROFILS = [
  {
    cas: 'Réfection complète de toiture (tuiles à changer)',
    recommandation: 'Sarking + écran HPV',
    justification:
      'L’occasion idéale : zéro perte de volume intérieur, traite les ponts thermiques, R 6-7 m².K/W atteignable. Investissement 100-180 €/m² mais cumulable au coût de la nouvelle couverture.',
  },
  {
    cas: 'Combles aménagés, toiture en bon état',
    recommandation: 'Isolation rampants par l’intérieur (2 couches)',
    justification:
      'Sarking inutile car la charpente est saine. Solution la plus rentable. 50-120 €/m² posé, R ≥ 6 m².K/W. Acceptez 20-30 cm perdus en hauteur sous plafond.',
  },
  {
    cas: 'Combles perdues (non habitables)',
    recommandation: 'Isolation soufflée au sol des combles',
    justification:
      'Bien plus rentable que l’isolation de la toiture elle-même (20-40 €/m² vs 80-180 €/m²). Voir notre page dédiée /isolation/combles. ROI 1-3 ans.',
  },
  {
    cas: 'Rénovation d’ampleur (passoire G/F → C-D)',
    recommandation: 'Sarking + ITE + VMC double flux',
    justification:
      'Logique « enveloppe complète ». MaPrimeRénov’ Parcours accompagné en pourcentage du devis (jusqu’à 90 % pour ménages très modestes), Mon Accompagnateur Rénov’ obligatoire. Plafond 70 000 € (90 000 € si sortie passoire + BBC).',
  },
  {
    cas: 'Toiture humide / condensation visible',
    recommandation: 'Audit charpentier + écran HPV obligatoire',
    justification:
      'Avant d’isoler, traiter la cause humidité (étanchéité couverture, ventilation toiture). Isoler une toiture humide = pourriture charpente garantie.',
  },
  {
    cas: 'Toiture-terrasse / faible pente',
    recommandation: 'Isolation inversée XPS ou toiture chaude PIR',
    justification:
      'Spécifique : DTU 43.1 (élément porteur béton) ou DTU 43.4 (élément porteur bois). Vérifier l’étanchéité avant toute intervention isolation.',
  },
]

const PRIX_DETAIL = [
  {
    poste: 'Sarking 140 mm fibre de bois',
    prix: '120-160 €/m² posé',
    note: 'R ≈ 6,2 m².K/W. Inclut panneaux + écran HPV + raccords + fixations spéciales toiture.',
  },
  {
    poste: 'Sarking 100 mm PIR/PUR',
    prix: '90-130 €/m² posé',
    note: 'R ≈ 4,5 m².K/W (en dessous du seuil MPR — préférer 120 mm pour MPR).',
  },
  {
    poste: 'Rampants 200 mm laine minérale',
    prix: '50-80 €/m² posé',
    note: 'R ≈ 5,7 m².K/W (laine de verre) à 6 m².K/W (laine de roche).',
  },
  {
    poste: 'Rampants 300 mm ouate cellulose insufflée',
    prix: '70-110 €/m² posé',
    note: 'R ≈ 7 m².K/W. Biosourcé, bonne inertie estivale.',
  },
  {
    poste: 'Écran sous-toiture HPV seul',
    prix: '15-35 €/m² posé',
    note: 'Si refait à neuf. Indispensable en zone humide ou montagne.',
  },
  {
    poste: 'Audit thermique préalable (CdA)',
    prix: '500-1 200 €',
    note: 'Recommandé > 15 000 € de travaux. Forfait MPR audit 300-500 €.',
  },
]

const faqs = [
  {
    question: 'Quelle est la différence entre isolation toiture et isolation des combles ?',
    answer:
      'L’<strong>isolation des combles</strong> traite l’espace habitable sous le toit : on isole soit au <strong>sol des combles perdues</strong> (technique soufflage 20-40 €/m², la plus rentable), soit en <strong>rampants côté intérieur</strong> (combles aménagés, 50-120 €/m²). L’<strong>isolation de la toiture</strong> traite l’élément constructif lui-même : <strong>sarking</strong> (panneaux par-dessus la charpente, 80-180 €/m²), <strong>écran sous-toiture HPV</strong> (étanchéité air + vapeur), et toiture-terrasse pour pentes faibles. Choix : si toiture en bon état + combles aménagés → rampants. Si réfection complète toiture → sarking. Si combles perdus → soufflage au sol.',
  },
  {
    question: 'Qu’est-ce que le sarking exactement ?',
    answer:
      'Le <strong>sarking</strong> est une technique d’isolation par l’extérieur de la toiture : on pose des <strong>panneaux isolants rigides</strong> par-dessus la charpente, entre celle-ci et la couverture (tuiles, ardoises). Avantages : <strong>zéro perte de volume habitable</strong>, traitement complet des <strong>ponts thermiques</strong> (chevrons), conservation de la charpente apparente côté intérieur. Inconvénients : <strong>requiert dépose de la couverture</strong> (100-180 €/m² posé) — donc rentable lors d’une réfection complète ou si la couverture est en fin de vie. Conformité DTU 40.41 + DTU 31.1. Matériaux : laine de bois rigide (Steico, Pavatex), fibre de bois, PIR/PUR. R typique 5-7 m².K/W avec 100-160 mm.',
  },
  {
    question: 'Quel R minimum pour MaPrimeRénov’ en 2026 sur la toiture ?',
    answer:
      'Seuils 2026 (à vérifier sur <a href="https://france-renov.gouv.fr" rel="noopener noreferrer" target="_blank">france-renov.gouv.fr</a> avant devis) : <strong>toiture par rampants R ≥ 6 m².K/W</strong>, <strong>combles perdus R ≥ 7 m².K/W</strong>, <strong>toiture-terrasse R ≥ 4,4 m².K/W</strong>. Ces seuils sont alignés sur les exigences CEE BAR-EN-103. En pratique : 200-300 mm de laine minérale ou biosourcée pour les rampants ; 300-400 mm en soufflage pour les combles perdus ; 100-160 mm de PIR/PUR ou fibre de bois rigide pour le sarking. Inférieur au seuil R minimum = pas d’aide. Le devis doit indiquer le matériau, l’épaisseur, le R atteint et la conformité ACERMI.',
  },
  {
    question: 'Quelles aides pour l’isolation de la toiture en 2026 ?',
    answer:
      'Aides cumulables 2026 si artisan RGE Qualibat 7131/7132/8211 et matériau certifié ACERMI : <strong>MaPrimeRénov’</strong> isolation rampants/toiture (forfait selon revenus — barème révisé annuellement par l’Anah, voir <a href="https://france-renov.gouv.fr" rel="noopener noreferrer" target="_blank">france-renov.gouv.fr</a>) ; <strong>CEE BAR-EN-103</strong> (isolation rampants/plafond/combles) — prime variable selon opérateur ; <strong>Coup de pouce isolation</strong> majoration ménages modestes ; <strong>éco-PTZ</strong> jusqu’à 30 000 € (par geste) ou 50 000 € (rénovation d’ampleur) ; <strong>TVA 5,5 %</strong> sur fourniture + pose. <strong>Reste à charge typique</strong> ménages modestes (Bleu) sur sarking 100 m² : ~30-50 % du devis selon barème en vigueur.',
  },
  {
    question: 'Quel artisan RGE pour l’isolation de la toiture ?',
    answer:
      'Selon la technique : <strong>Qualibat 7131</strong> (isolation thermique en plâtrerie — pour rampants intérieur), <strong>Qualibat 7132</strong> (isolation thermique des bâtiments par l’extérieur — pour sarking par certains poseurs ITE), <strong>Qualibat 8211</strong> (couverture — pour sarking en réfection complète, le couvreur réalise sarking + couverture en lot unique). Vérification possible sur <a href="https://france-renov.gouv.fr/annuaires-professionnels/artisan-rge" rel="noopener noreferrer" target="_blank">france-renov.gouv.fr</a> ou via notre annuaire (mise à jour mensuelle source ADEME). Préférer 2-3 devis comparés sur même cahier des charges (matériau, épaisseur, R, certification ACERMI).',
  },
  {
    question: 'Faut-il un écran sous-toiture HPV ?',
    answer:
      'Oui, dans la quasi-totalité des cas en France (charpente bois). L’<strong>écran sous-toiture HPV</strong> (haute perméabilité à la vapeur d’eau) joue 3 rôles : (1) <strong>étanchéité à l’eau</strong> (eau de fonte de neige, vent fort), (2) <strong>étanchéité à l’air</strong> (limite déperditions par convection), (3) <strong>perméabilité vapeur</strong> qui laisse l’humidité interne s’évacuer (évite la condensation dans l’isolant). Conformité <strong>NF DTU 40.29</strong>. Sans écran : risque de pourriture charpente + perte performance isolation. Coût additionnel 15-35 €/m² posé. Marques : Pro Clima, Klober, Delta, Wurth, Onduline.',
  },
  {
    question: 'Combien de temps pour rentabiliser l’isolation de la toiture ?',
    answer:
      '<strong>ROI typique 2026</strong> : (1) <strong>combles perdus soufflés</strong> 1-3 ans (le plus rentable, jusqu’à 30 % d’économie chauffage). (2) <strong>rampants intérieur</strong> 5-8 ans selon zone climatique et combustible (gaz, fioul, élec). (3) <strong>sarking en réfection</strong> 8-15 ans car le coût de la couverture est inclus mais à imputer aussi au remplacement nécessaire de la toiture. (4) <strong>toiture-terrasse</strong> 8-12 ans (technique plus chère). Économie typique post-isolation toiture : 25-30 % sur la facture chauffage si la toiture représentait le poste prioritaire de déperdition.',
  },
  {
    question: 'Peut-on isoler la toiture sans déposer la couverture ?',
    answer:
      'Oui, par <strong>l’intérieur (rampants)</strong> : pose entre + sous chevrons sans toucher à la couverture extérieure. C’est la solution la plus courante pour des combles aménagés avec toiture en bon état. Le <strong>sarking</strong> en revanche <strong>nécessite la dépose totale de la couverture</strong> (tuiles, ardoises) — il ne se justifie donc que lors d’une réfection complète de toiture. Solution intermédiaire : <strong>isolation par caissons préfabriqués sur charpente</strong> (Sarking-Box, Optimum Roof Steico) — plus rapide qu’un sarking traditionnel mais toujours par l’extérieur. Vérifier l’état de la charpente <strong>avant tout devis</strong>.',
  },
]

const sources = [
  { label: 'France Rénov’ — Isolation toiture', url: 'https://france-renov.gouv.fr' },
  { label: 'ADEME — Guide isolation thermique', url: 'https://www.ademe.fr' },
  { label: 'Anah — MaPrimeRénov’ isolation', url: 'https://www.anah.gouv.fr' },
  {
    label: 'Service-Public.fr — Aides isolation',
    url: 'https://www.service-public.fr',
  },
  { label: 'CSTB — DTU 40.29 / 40.41 / 25.41', url: 'https://www.cstb.fr' },
  { label: 'Qualibat — Mentions 7131 / 7132 / 8211', url: 'https://www.qualibat.com' },
  {
    label: 'ACERMI — Certification matériaux isolants',
    url: 'https://www.acermi.com',
  },
]

const relatedPages = [
  {
    label: 'Hub Isolation thermique',
    href: '/renovation-energetique/travaux/isolation',
    description: 'Combles + ITE + ITI + toiture',
  },
  {
    label: 'Isolation des combles',
    href: '/renovation-energetique/travaux/isolation/combles',
    description: 'Combles perdues (soufflage 20-40 €/m²) et aménagées',
  },
  {
    label: 'Isolation extérieure (ITE)',
    href: '/renovation-energetique/travaux/isolation/exterieure-ite',
    description: 'Murs par l’extérieur — combiner avec sarking',
  },
  {
    label: 'Isolation intérieure (ITI)',
    href: '/renovation-energetique/travaux/isolation/interieure',
    description: 'Murs par l’intérieur',
  },
  {
    label: 'Aides MaPrimeRénov’ 2026',
    href: '/renovation-energetique/aides/maprimerenov-2026',
    description: 'Barèmes par revenus + saut DPE',
  },
  {
    label: 'Simulateur aides 2026',
    href: '/simulateur-aides-renovation',
    description: 'Estimation MPR + CEE personnalisée',
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
    section: 'Isolation toiture',
    keywords: [
      'isolation toiture',
      'sarking',
      'isolation sous toiture',
      'isolation rampant',
      'isolation toit',
      'prix isolation toiture',
      'isolation toiture exterieur',
      'isolation toiture sarking',
      'qualibat',
      'maprimerenov isolation',
      'cee bar-en-103',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique/travaux' },
    { name: 'Isolation', url: '/renovation-energetique/travaux/isolation' },
    { name: 'Toiture', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const govSchema = getGovernmentServiceSchema({
    name: 'Aides isolation toiture 2026 (MaPrimeRénov’ + CEE BAR-EN-103)',
    description:
      'Isolation de la toiture (sarking, rampants, écran HPV) éligible à MaPrimeRénov’ par geste, CEE BAR-EN-103, Coup de pouce isolation, éco-PTZ et TVA 5,5 %. R minimum 6 m².K/W (rampants), 7 m².K/W (combles perdus), 4,4 m².K/W (toiture-terrasse). Installation par artisan RGE Qualibat 7131/7132/8211 obligatoire.',
    url: PAGE_URL,
    serviceType: 'Subvention publique isolation toiture',
    audience: 'Propriétaires occupants, bailleurs, copropriétés',
    sameAs: [
      'https://france-renov.gouv.fr',
      'https://www.anah.gouv.fr',
      'https://www.service-public.fr',
      'https://www.legifrance.gouv.fr',
    ],
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
              { label: 'Isolation', href: '/renovation-energetique/travaux/isolation' },
              { label: 'Toiture' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Layers className="w-3.5 h-3.5" aria-hidden />
              Isolation toiture 2026 — Qualibat
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Isolation toiture 2026 : sarking, rampants, prix posé
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              La <strong>toiture</strong> représente <strong>25-30 % des déperditions</strong> d’une
              maison non isolée. Trois techniques principales : le <strong>sarking</strong> (par
              l’extérieur, sur charpente, lors d’une réfection complète) à 80-180 €/m² posé, les{' '}
              <strong>rampants par l’intérieur</strong> (50-120 €/m², combles aménagés) et l’
              <strong>écran sous-toiture HPV</strong> (étanchéité air + vapeur, indispensable).
              Aides cumulables 2026 :{' '}
              <strong>MaPrimeRénov’ + CEE BAR-EN-103 + Coup de pouce + TVA 5,5 %</strong>. Label{' '}
              <strong>RGE Qualibat 7131 / 7132 / 8211</strong> obligatoire.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2 id="techniques">Les 4 techniques d’isolation toiture</h2>
            <div className="not-prose grid gap-3 my-6">
              {TECHNIQUES.map((t) => (
                <div key={t.technique} className="bg-white border border-sand-200 rounded-xl p-5">
                  <div className="flex items-baseline justify-between gap-2 flex-wrap mb-2">
                    <h3 className="font-heading text-base font-semibold text-sand-900 m-0">
                      {t.technique}
                    </h3>
                    <span className="text-sm font-bold text-primary-700 whitespace-nowrap">
                      {t.prix}
                    </span>
                  </div>
                  <p className="text-xs text-sand-500 m-0 mb-1">
                    {t.r} · épaisseur {t.epaisseur}
                  </p>
                  <p className="text-sm text-sand-700 m-0 mb-2">{t.detail}</p>
                  <p className="text-xs text-primary-600 font-medium m-0 italic">
                    Idéal : {t.ideal}
                  </p>
                </div>
              ))}
            </div>

            <h2 id="profil">Quelle technique selon votre situation</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Cas</th>
                    <th className="p-3 border-b border-sand-200">Recommandation</th>
                    <th className="p-3 border-b border-sand-200">Pourquoi</th>
                  </tr>
                </thead>
                <tbody>
                  {PROFILS.map((r) => (
                    <tr key={r.cas} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium text-sand-900">{r.cas}</td>
                      <td className="p-3 text-primary-700 font-semibold">{r.recommandation}</td>
                      <td className="p-3 text-sand-600">{r.justification}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 id="prix">Prix posé 2026 — détail par poste</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Poste</th>
                    <th className="p-3 border-b border-sand-200">Prix</th>
                    <th className="p-3 border-b border-sand-200">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {PRIX_DETAIL.map((p) => (
                    <tr key={p.poste} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium text-sand-900">{p.poste}</td>
                      <td className="p-3 text-primary-700 font-semibold">{p.prix}</td>
                      <td className="p-3 text-sand-600 text-xs">{p.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-sand-500 italic">
              Fourchettes indicatives 2026 (matériel + pose, hors aides). Variations selon zone
              géographique, complexité accès toiture, état charpente. Préférer 2-3 devis comparés
              d’artisans Qualibat sur le même cahier des charges (matériau, épaisseur, R, ACERMI).
            </p>

            <h2 id="aides">Aides isolation toiture 2026</h2>
            <p>
              Toutes cumulables si artisan <strong>RGE Qualibat</strong> et matériau certifié{' '}
              <strong>ACERMI</strong> :
            </p>
            <ul>
              <li>
                <strong>MaPrimeRénov’</strong> isolation rampants/toiture : forfait selon revenus
                (Bleu / Jaune / Violet / Rose) — barème révisé annuellement par l’Anah, voir{' '}
                <a href="https://france-renov.gouv.fr" rel="noopener noreferrer" target="_blank">
                  france-renov.gouv.fr
                </a>{' '}
                pour le montant en vigueur.
              </li>
              <li>
                <strong>CEE BAR-EN-103</strong> (isolation rampants/plafond/combles) : prime
                variable selon opérateur et zone climatique, cumulable avec MPR.
              </li>
              <li>
                <strong>Coup de pouce isolation</strong> : majoration ménages modestes et très
                modestes.
              </li>
              <li>
                <strong>Éco-PTZ</strong> : jusqu’à 30 000 € par geste, 50 000 € rénovation
                d’ampleur. Sans condition de revenus.
              </li>
              <li>
                <strong>TVA 5,5 %</strong> sur fourniture + pose par artisan RGE Qualibat (vs 20 %
                sans RGE).
              </li>
              <li>
                <strong>Aides locales</strong> : régions et départements (variable, voir{' '}
                <Link href="/aides/par-region">/aides/par-region</Link>).
              </li>
            </ul>
            <p>
              Simulation personnalisée via notre{' '}
              <Link href="/simulateur-aides-renovation">simulateur officiel</Link>.
            </p>

            <h2 id="rge">Le label RGE Qualibat : modules pertinents</h2>
            <p>Trois mentions RGE Qualibat couvrent l’isolation toiture selon la technique :</p>
            <ul>
              <li>
                <strong>Qualibat 7131</strong> — isolation thermique en plâtrerie (rampants
                intérieur, BA13).
              </li>
              <li>
                <strong>Qualibat 7132</strong> — isolation thermique des bâtiments par l’extérieur
                (ITE et certains sarkings).
              </li>
              <li>
                <strong>Qualibat 8211</strong> — couverture (sarking en réfection complète, le
                couvreur réalise lot unique sarking + couverture).
              </li>
            </ul>
            <p>
              Vérification possible sur{' '}
              <a
                href="https://france-renov.gouv.fr/annuaires-professionnels/artisan-rge"
                rel="noopener noreferrer"
                target="_blank"
              >
                france-renov.gouv.fr
              </a>{' '}
              ou via notre annuaire (mise à jour mensuelle source ADEME). Sans Qualibat valide à la
              date du devis : pas d’aide MPR, pas de CEE, pas de TVA 5,5 %.
            </p>

            <h2 id="cta">Trouvez un artisan RGE Qualibat près de chez vous</h2>
            <div className="not-prose bg-primary-50 border border-primary-200 rounded-xl p-6 my-6">
              <p className="text-sand-900 m-0 mb-3">
                <Calculator className="inline w-5 h-5 text-primary-700 mr-1" aria-hidden />
                <strong>Devis isolation toiture en 30 secondes</strong> — artisans certifiés RGE
                Qualibat 7131 / 7132 / 8211 pour ouvrir droit à MPR + CEE + TVA 5,5 %.
              </p>
              <Link
                href="/devis"
                className="inline-flex items-center gap-2 bg-primary-700 hover:bg-primary-800 text-white font-semibold px-5 py-3 rounded-lg transition"
              >
                Demander mon devis isolation toiture <ArrowRight className="w-4 h-4" aria-hidden />
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
