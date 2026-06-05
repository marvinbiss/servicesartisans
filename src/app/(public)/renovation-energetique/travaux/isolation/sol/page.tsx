/**
 * /renovation-energetique/travaux/isolation/sol — Levier 7 ROI.
 *
 * @kw-primary    isolation plancher bas
 * @kw-volume     1000
 * @kw-kd         2
 * @kw-cpc        0.58
 * @cluster       7
 * @ahrefs-source local snapshot 2026-05-04 (docs/audit-ahrefs-2026-05-03 +
 *                docs/ahrefs-bloc1-keywords-gap-2026-05-04)
 * @backlog-item  P3-isolation-other-cluster (sous-niche plancher)
 *
 * Cluster `isolation sol/plancher/vide-sanitaire` cumulé ~5 800 vol/mo
 * (hors KW générique "vide sanitaire" 4 100), KD avg ~1.5 — quasi-libre.
 *
 * KW cibles snapshot 2026-05-04 :
 * - "isolation plancher bas"   →   1 000 vol, KD 2 (PIVOT — france_renov #8)
 * - "isolation sol"            →   1 900 vol, KD ~ (Hellio #32 — gros secondaire)
 * - "isolation vide sanitaire" →   1 000 vol     (Hellio #28)
 * - "isolation sous-sol"       →     900 vol     (Sonergia #4)
 * - "isolation cave plafond"   →     200 vol, KD 1 (Effy #1)
 * - "isolation sol garage"     →     200 vol     (Sonergia #2)
 * - "isolation sol béton"      →     200 vol     (Sonergia #3)
 * - "isolation cave humide"    →     100 vol     (Sonergia #3)
 * - "isolation sous-sol humide"→     100 vol     (Sonergia #1)
 * - "isolation sol carrelage"  →      60 vol     (Sonergia #2)
 * - Cluster cumulé : ~5 760 vol/mo (sans "vide sanitaire" générique).
 *
 * ✅ ÉLIGIBLE AIDES MPR/CEE — au contraire de /phonique :
 *   - CEE BAR-EN-103 (Isolation plancher bas), R ≥ 3 m².K/W, RGE
 *     obligatoire. Forfait kWhc/m² maison : H1 1 600, H2 1 300, H3 900.
 *     Source : fiche DGEC BAR-EN-103 vA29-2 (entrée en vigueur 01/01/2025).
 *   - MaPrimeRénov' isolation plancher bas : forfait selon revenus, voir
 *     france-renov.gouv.fr.
 *   - Coup de pouce isolation : majoration ménages modestes.
 *   - Éco-PTZ jusqu'à 30 000 € (par geste) ou 50 000 € (rénovation
 *     d'ampleur). TVA 5,5 % par RGE.
 *
 * Anti-cannibalisation :
 *   - /isolation/{combles, exterieure-ite, interieure, toiture}: angles distincts
 *   - /isolation/phonique : acoustique (sous-couche sol pour bruit impact)
 *   - Cette page = THERMIQUE plancher bas (vide-sanitaire / sous-sol /
 *     cave / garage / passage couvert) — éligible MPR/CEE BAR-EN-103.
 *
 * Position concurrentielle :
 *   - Sonergia DR 49 dominant (5+ pages /isolation/sol/* sur cluster mais
 *     traffic global faible 200 par page max). Quadrant attaquable.
 *   - Effy rank #1 sur "isolation cave plafond" 200 vol — niche conquise.
 *   - France Rénov #8 sur "isolation plancher bas" : SA peut viser top 5
 *     vu autorité gouv déjà dépassée par concurrents privés sur ce cluster.
 *
 * Label RGE : Qualibat 7131 (ITI — couvre plancher bas par dessous,
 * combles, rampants, murs intérieurs) ou 5232 (mousse polyuréthane
 * projetée — mention spécifique application mousse PU).
 *
 * Note : "Qualibat 7191" parfois cité (plancher dédié) n'apparaît PAS
 * dans le référentiel officiel Qualibat 2024-2026. Le code applicable
 * pour plancher bas par dessous = 7131 (ITI général).
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Calculator, Home, AlertTriangle } from 'lucide-react'

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

const PAGE_PATH = '/renovation-energetique/travaux/isolation/sol'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'sophie-martin'
const AUTHOR_NAME = 'Sophie Martin'

const TITLE = 'Isolation plancher bas 2026 : vide-sanitaire, cave, prix'
const DESCRIPTION =
  'Isolation plancher bas 2026 : par dessous 25-50 €/m², par dessus 60-110 €/m², mousse projetée 35-70 €/m². Aides MPR + CEE BAR-EN-103, R ≥ 3.'

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
  'Plancher bas = 7-10 % des déperditions thermiques d’une maison. ROI souvent rapide (3-7 ans).',
  '3 techniques : <strong>par dessous</strong> (en plafond du sous-sol/cave/garage) 25-50 €/m², <strong>par dessus</strong> (sous chape) 60-110 €/m², <strong>mousse polyuréthane projetée</strong> 35-70 €/m².',
  'CEE <strong>BAR-EN-103</strong> opérationnel : R ≥ 3 m².K/W, plancher sur sous-sol non chauffé / vide-sanitaire / passage ouvert, RGE obligatoire.',
  'MaPrimeRénov’ par geste cumulable + Coup de pouce CEE (majoration ménages modestes) + éco-PTZ + TVA 5,5 %.',
  'Solution la plus rentable : par dessous quand l’espace inférieur est accessible (cave, vide-sanitaire, garage). Pas de gêne dans le logement, prix mini.',
  'Sensation pieds froids éliminée + gain confort thermique perceptible dès le premier hiver.',
  'Vérification artisan RGE : Qualibat 7131 (ITI — couvre plancher bas par dessous) ou 5232 pour la projection de mousse polyuréthane.',
]

const TYPES_PLANCHER = [
  {
    type: 'Plancher bas sur vide-sanitaire',
    technique: 'Par dessous (idéal) ou mousse polyuréthane projetée',
    prix: '25-50 €/m² posé (par dessous)',
    detail:
      'Vide-sanitaire ≥ 60 cm hauteur sous solives : pose en plafond avec panneaux rigides PIR/PUR ou laine minérale. Si hauteur insuffisante : mousse polyuréthane projetée. Éligible BAR-EN-103.',
  },
  {
    type: 'Plancher bas sur cave / sous-sol non chauffé',
    technique: 'Par dessous au plafond de la cave',
    prix: '25-55 €/m² posé',
    detail:
      'Cas le plus rentable : la cave est accessible, on pose en plafond depuis dessous. Aucune gêne dans le logement. Matériaux : PIR/PUR, laine de roche, mousse projetée. Attention humidité : prévoir frein-vapeur si cave humide.',
  },
  {
    type: 'Plancher bas sur garage attenant',
    technique: 'Par dessous au plafond du garage',
    prix: '25-50 €/m² posé',
    detail:
      'Très fréquent en pavillon. Pose en plafond avec PIR/PUR rigide ou laine projetée. Bonus : améliore aussi l’acoustique (pas de bruit de moteur dans le logement). Vérifier hauteur du véhicule après isolation.',
  },
  {
    type: 'Plancher bas sur passage couvert / porche / pilotis',
    technique: 'Par dessous (panneaux rigides + bardage de finition)',
    prix: '40-90 €/m² posé',
    detail:
      'Cas spécifique : RDC sur pilotis ou porche traversant. Panneaux PIR/PUR + bardage extérieur de finition (étanchéité + esthétique). Attention au pont thermique au niveau de la liaison mur-plancher.',
  },
  {
    type: 'Sol sur terre-plein (dalle existante)',
    technique: 'Par dessus (chape isolante) ou refait à neuf',
    prix: '60-110 €/m² posé (par dessus)',
    detail:
      'Cas plus complexe : on isole par dessus la dalle existante avec une chape isolante (mousse PU + chape ciment) ou panneaux rigides + chape sèche. Hauteur perdue 8-15 cm. Pas de gain MPR/CEE direct (BAR-EN-103 cible plancher sur sous-sol/VS/passage).',
  },
]

const TECHNIQUES = [
  {
    technique: 'Par dessous (plancher bas accessible)',
    prix: '25-55 €/m² posé',
    r: 'R 3-5 m².K/W typique',
    epaisseur: '100-200 mm laine ou 80-120 mm PIR/PUR',
    detail:
      'La technique reine quand l’espace inférieur est accessible (cave, sous-sol non chauffé, garage, vide-sanitaire ≥ 60 cm). Pose collée + chevillage en plafond. Aucune gêne dans le logement. ROI 3-5 ans typique.',
    ideal: 'Cave, vide-sanitaire accessible, garage attenant',
  },
  {
    technique: 'Mousse polyuréthane projetée',
    prix: '35-70 €/m² posé',
    r: 'R 4-6 m².K/W',
    epaisseur: '80-120 mm projetés',
    detail:
      'Idéale pour vide-sanitaire bas (< 60 cm hauteur), formes irrégulières, gaines/câbles. Mousse expansée à cellules fermées qui adhère partout. Étanchéité air automatique. Mise en œuvre rapide (300-500 m²/jour). Qualibat 5232.',
    ideal: 'Vide-sanitaire bas, surface irrégulière, gros chantier',
  },
  {
    technique: 'Par dessus (chape isolante ou panneaux + chape)',
    prix: '60-110 €/m² posé',
    r: 'R 3,5-5 m².K/W',
    epaisseur: '60-120 mm + chape de répartition',
    detail:
      'Quand le plancher bas n’est pas accessible par dessous (sol sur terre-plein, dalle pleine en RDC). Panneaux PUR/PIR ou laine semi-rigide + chape ciment ou chape sèche Fermacell. Hauteur perdue 8-15 cm. DTU 26.2 (chape) + DTU 52.10 (chape sèche).',
    ideal: 'Sol terre-plein, dalle non accessible, rénovation lourde',
  },
]

const PROFILS = [
  {
    cas: 'Maison avec cave / sous-sol non chauffé accessible',
    recommandation: 'Par dessous au plafond de la cave',
    justification:
      'Solution n°1 en rentabilité : 25-55 €/m² posé, aucune gêne dans le logement, R ≥ 3 m².K/W facilement atteint. Éligible CEE BAR-EN-103 (forfait H1 1 600 kWhc/m², H2 1 300, H3 900) + MaPrimeRénov’.',
  },
  {
    cas: 'Maison sur vide-sanitaire ≥ 60 cm',
    recommandation: 'Par dessous OU mousse polyuréthane projetée',
    justification:
      'Hauteur suffisante = pose en plafond du VS (panneaux rigides). Hauteur limite = mousse projetée. Sols deviennent tièdes en hiver. ROI 3-5 ans. Vérifier ventilation VS pour éviter humidité.',
  },
  {
    cas: 'Pavillon avec garage attenant',
    recommandation: 'Par dessous au plafond du garage',
    justification:
      'Très efficace : 25-50 €/m² + bonus acoustique (silence de la voiture). Vérifier hauteur résiduelle pour le véhicule. Matériau préféré : PIR/PUR rigide (réaction au feu B-s1,d0).',
  },
  {
    cas: 'Maison sur dalle pleine terre-plein (RDC sans sous-sol)',
    recommandation: 'Audit thermique + arbitrage par dessus / pas isoler',
    justification:
      'Le plancher bas sur terre-plein perd peu (la terre maintient ~10-12 °C en hiver). ROI long. Isoler par dessus = perdre 8-15 cm de hauteur sous plafond + 60-110 €/m². À arbitrer en rénovation lourde uniquement (combiné avec autre travaux).',
  },
  {
    cas: 'Vide-sanitaire bas (< 60 cm) ou inaccessible',
    recommandation: 'Mousse polyuréthane projetée par robot/lance',
    justification:
      'Seule solution viable. 35-70 €/m² posé. R 4-6 m².K/W. Compatible vide-sanitaire 30-60 cm. Demander un artisan Qualibat 5232 spécialisé. Éligible CEE BAR-EN-103.',
  },
  {
    cas: 'Cave humide / problème d’étanchéité',
    recommandation: 'Audit humidité avant isolation + frein-vapeur obligatoire',
    justification:
      'Isoler une cave humide sans traitement préalable = pourriture et moisissures dans 2-3 ans. Diagnostic humidité (drainage, ventilation, étanchéité murs) en amont. Frein-vapeur intégré dans la pose si l’humidité résiduelle reste élevée. Coût audit 200-500 €.',
  },
]

const PRIX_DETAIL = [
  {
    poste: 'PIR/PUR rigide 100 mm en plafond cave/garage',
    prix: '30-55 €/m² posé',
    note: 'R ≈ 4,5 m².K/W (PIR λ 0,022). Inclut panneaux + collage + chevillage. Référence éligibilité MPR.',
  },
  {
    poste: 'Laine de roche 200 mm en plafond cave',
    prix: '25-45 €/m² posé',
    note: 'R ≈ 5,5 m².K/W. Plus volumineuse mais moins chère, classement feu A1 (idéal cave/garage).',
  },
  {
    poste: 'Mousse polyuréthane projetée 100 mm',
    prix: '40-70 €/m² posé',
    note: 'R ≈ 4,5-5 m².K/W. Étanchéité air automatique. Idéal VS bas et formes irrégulières.',
  },
  {
    poste: 'Chape isolante par dessus (PIR + chape ciment)',
    prix: '70-110 €/m² posé',
    note: 'R ≈ 3,5-4 m².K/W. Inclut PIR 80 mm + chape de répartition 5-7 cm. Délai séchage 3-4 sem.',
  },
  {
    poste: 'Chape sèche Fermacell sur isolant rigide',
    prix: '60-100 €/m² posé',
    note: 'R ≈ 3-4 m².K/W. Pas de séchage. Idéal rénovation rapide. DTU 52.10.',
  },
  {
    poste: 'Audit thermique (recommandé > 8 000 €)',
    prix: '500-1 200 €',
    note: 'Forfait MPR audit énergétique 300-500 €. Recommandé pour arbitrer technique optimale.',
  },
]

const faqs = [
  {
    question: 'Pourquoi isoler le plancher bas ?',
    answer:
      'Le plancher bas représente <strong>7 à 10 %</strong> des déperditions thermiques d’une maison non isolée. C’est le poste le plus rentable APRÈS la toiture (30 %) et les murs (25 %), grâce à : (1) un <strong>prix au m² faible</strong> (25-50 €/m² par dessous), (2) une <strong>mise en œuvre simple</strong> sans gêne dans le logement quand l’espace inférieur est accessible (cave, sous-sol, garage, vide-sanitaire), (3) un <strong>gain de confort immédiat</strong> (sols qui ne sont plus froids en hiver, sensation pieds froids éliminée). ROI typique 3-7 ans selon zone climatique et combustible.',
  },
  {
    question: 'Quel R minimum pour MaPrimeRénov’ et CEE en 2026 ?',
    answer:
      'Pour la <strong>CEE BAR-EN-103</strong> (Isolation plancher bas) : <strong>R ≥ 3 m².K/W</strong>, plancher sur sous-sol non chauffé, vide-sanitaire ou passage ouvert. Source officielle : <a href="https://www.ecologie.gouv.fr/sites/default/files/documents/BAR-EN-103%20mod%20A29-2.pdf" rel="noopener noreferrer" target="_blank">fiche DGEC BAR-EN-103 vA29-2</a> (entrée en vigueur 01/01/2025). Pour MaPrimeRénov’ par geste isolation plancher : forfait selon revenus à vérifier sur <a href="https://france-renov.gouv.fr" rel="noopener noreferrer" target="_blank">france-renov.gouv.fr</a>. Sans atteinte du seuil R ≥ 3 : pas d’aide. En pratique : 100-120 mm de PIR/PUR ou 200 mm de laine minérale en plafond suffisent largement.',
  },
  {
    question: 'Quelle technique choisir : par dessous, par dessus, ou mousse projetée ?',
    answer:
      '(1) <strong>Par dessous</strong> (plafond cave/sous-sol/garage) : technique n°1 quand l’espace inférieur est accessible. 25-55 €/m² posé. Aucune gêne dans le logement. (2) <strong>Mousse polyuréthane projetée</strong> : pour vide-sanitaire bas (< 60 cm), formes irrégulières, gaines apparentes. 35-70 €/m². Étanchéité air automatique. (3) <strong>Par dessus</strong> (chape isolante) : seule solution sur dalle pleine terre-plein RDC. 60-110 €/m². Hauteur perdue 8-15 cm + délai séchage 3-4 sem si chape ciment. À arbitrer en rénovation lourde. Comparaison rapide : préférer par dessous chaque fois que possible (rentabilité maximale).',
  },
  {
    question: 'Quels sont les forfaits CEE BAR-EN-103 par zone climatique ?',
    answer:
      'Forfait <strong>kWhc/m²</strong> pour maison individuelle (durée conventionnelle 30 ans, source DGEC) : <strong>H1</strong> (Nord/Est, climat froid) <strong>1 600 kWhc/m²</strong> ; <strong>H2</strong> (climat tempéré, façade Atlantique) <strong>1 300 kWhc/m²</strong> ; <strong>H3</strong> (Méditerranée, climat doux) <strong>900 kWhc/m²</strong>. Le montant en € varie selon l’opérateur CEE (Sonergia, Engie Solutions, EDF, TotalEnergies, etc.). Comptez en moyenne <strong>2-5 €/kWhc</strong>, soit environ <strong>3-8 €/m²</strong> de prime CEE typique. Cumul avec MaPrimeRénov’ par geste autorisé.',
  },
  {
    question: 'L’isolation à 1 € existe-t-elle encore pour le plancher bas ?',
    answer:
      'Non. L’opération « <strong>isolation à 1 €</strong> » a été supprimée en 2021 suite aux scandales d’éco-démarchage frauduleux. Toute offre « à 1 € » en 2026 est une <strong>arnaque</strong> (travaux bâclés, reste à charge dissimulé, pose non conforme). Le <strong>Coup de pouce CEE Isolation</strong> reste actif et peut couvrir 50-80 % du coût pour les ménages très modestes — sans toutefois atteindre le « 1 € ». Vigilance : la DGCCRF poursuit activement les fraudes. <strong>Toujours vérifier le devis</strong> (matériau ACERMI, R atteint, RGE Qualibat valide à la date de signature).',
  },
  {
    question: 'Quel artisan RGE pour l’isolation plancher bas ?',
    answer:
      'Selon la technique : <strong>Qualibat 7131</strong> (isolation thermique par l’intérieur — couvre plancher bas par dessous, combles, rampants, murs intérieurs). <strong>Qualibat 5232</strong> (application de mousse polyuréthane projetée — mention spécifique pour la technique mousse). Vérification gratuite sur <a href="https://france-renov.gouv.fr/annuaires-professionnels/artisan-rge" rel="noopener noreferrer" target="_blank">france-renov.gouv.fr</a> ou via notre annuaire (mise à jour mensuelle source ADEME). Sans Qualibat valide à la date du devis : pas d’aide MPR, pas de CEE, pas de TVA 5,5 %.',
  },
  {
    question: 'Faut-il isoler une cave humide ?',
    answer:
      '<strong>Non, pas avant traitement</strong>. Isoler une cave humide sans diagnostic préalable garantit pourriture et moisissures dans 2-3 ans. Étapes : (1) <strong>diagnostic humidité</strong> par professionnel (200-500 €) — drainage périphérique, ventilation, étanchéité murs cave. (2) <strong>Traitement</strong> de la cause (drain, cuvelage, VMC). (3) Une fois cave saine : isolation au plafond avec <strong>frein-vapeur</strong> intégré pour gérer l’humidité résiduelle. Matériau préféré : laine de roche A1 (incombustible) ou PIR/PUR (résistant humidité), pas la laine de verre directe (sensible eau).',
  },
  {
    question: 'Combien d’économies sur la facture chauffage ?',
    answer:
      'Plancher bas isolé correctement (R ≥ 3 m².K/W) : <strong>-5 à -10 % de la facture chauffage</strong>. C’est moins que la toiture (-20 à -25 %) ou les murs (-15 à -20 %), mais le ROI est <strong>plus court</strong> grâce au prix au m² faible. Sur une facture annuelle 2 500 € (chauffage gaz/fioul), économie typique 125-250 €/an. <strong>Bénéfice principal</strong> : confort thermique au sol immédiat (sols qui passent de 12 °C à 18-19 °C en hiver, sensation pieds froids éliminée). Cumul avec isolation toiture + murs : effet synergique, jusqu’à -45 % au total.',
  },
]

const sources = [
  {
    label: 'France Rénov’ — MaPrimeRénov’ plancher bas',
    url: 'https://france-renov.gouv.fr',
  },
  {
    label: 'DGEC — Fiche BAR-EN-103 vA29-2 (PDF)',
    url: 'https://www.ecologie.gouv.fr/sites/default/files/documents/BAR-EN-103%20mod%20A29-2.pdf',
  },
  { label: 'ADEME — Guide isolation thermique', url: 'https://www.ademe.fr' },
  { label: 'Anah — MaPrimeRénov’ par geste', url: 'https://www.anah.gouv.fr' },
  {
    label: 'Service-Public.fr — Aides isolation',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F35632',
  },
  { label: 'CSTB — DTU 26.2 (chape) et 52.10 (chape sèche)', url: 'https://www.cstb.fr' },
  { label: 'Qualibat — Mentions 7131 (ITI) / 5232 (mousse PU)', url: 'https://www.qualibat.com' },
  {
    label: 'ACERMI — Certification matériaux isolants',
    url: 'https://www.acermi.com',
  },
]

const relatedPages = [
  {
    label: 'Hub Isolation thermique',
    href: '/renovation-energetique/travaux/isolation',
    description: 'Combles + ITE + ITI + toiture + sol',
  },
  {
    label: 'Isolation des combles',
    href: '/renovation-energetique/travaux/isolation/combles',
    description: 'Soufflage 15-35 €/m², déroulé, sarking',
  },
  {
    label: 'Isolation toiture (sarking, rampants)',
    href: '/renovation-energetique/travaux/isolation/toiture',
    description: 'Sarking 80-180 €/m², rampants 50-120 €/m²',
  },
  {
    label: 'Isolation extérieure (ITE)',
    href: '/renovation-energetique/travaux/isolation/exterieure-ite',
    description: 'Murs par l’extérieur — aides jusqu’à 75 €/m²',
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
    section: 'Isolation plancher bas',
    keywords: [
      'isolation plancher bas',
      'isolation sol',
      'isolation vide sanitaire',
      'isolation sous-sol',
      'isolation cave plafond',
      'isolation sol garage',
      'isolation sol béton',
      'mousse polyurethane projetee',
      'cee bar-en-103',
      'maprimerenov plancher',
      'qualibat 7131',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique/travaux' },
    { name: 'Isolation', url: '/renovation-energetique/travaux/isolation' },
    { name: 'Sol / Plancher bas', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const govSchema = getGovernmentServiceSchema({
    name: 'Aides isolation plancher bas 2026 (MaPrimeRénov’ + CEE BAR-EN-103)',
    description:
      'Isolation plancher bas (vide-sanitaire, cave, sous-sol non chauffé, garage, passage ouvert) éligible à MaPrimeRénov’ par geste, CEE BAR-EN-103, Coup de pouce isolation, éco-PTZ et TVA 5,5 %. R minimum 3 m².K/W. Forfait CEE H1 1 600, H2 1 300, H3 900 kWhc/m² maison individuelle. Installation par artisan RGE Qualibat 7131 (ITI) ou 5232 (mousse PU) obligatoire.',
    url: PAGE_URL,
    serviceType: 'Subvention publique isolation plancher bas',
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
              { label: 'Sol / Plancher bas' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Home className="w-3.5 h-3.5" aria-hidden />
              Plancher bas 2026 — CEE BAR-EN-103 / Qualibat
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Isolation plancher bas 2026 : vide-sanitaire, cave, prix
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Le <strong>plancher bas</strong> représente <strong>7-10 %</strong> des déperditions
              d’une maison. Le poste le plus rentable après toiture et murs :{' '}
              <strong>par dessous</strong> (cave, vide-sanitaire, garage){' '}
              <strong>25-50 €/m² posé</strong>, par dessus (chape isolante) 60-110 €/m², mousse
              projetée 35-70 €/m². <strong>Aides cumulables 2026</strong> : MaPrimeRénov’ +{' '}
              <strong>CEE BAR-EN-103</strong> (R ≥ 3 m².K/W, RGE obligatoire) + Coup de pouce + TVA
              5,5 %.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2 id="types">Les 5 types de plancher bas</h2>
            <p>
              Le diagnostic commence par identifier{' '}
              <strong>ce qu’il y a sous votre plancher</strong>. Cela conditionne la technique
              optimale et l’éligibilité aux aides :
            </p>
            <div className="not-prose grid gap-3 my-6">
              {TYPES_PLANCHER.map((t) => (
                <div key={t.type} className="bg-white border border-sand-200 rounded-xl p-5">
                  <div className="flex items-baseline justify-between gap-2 flex-wrap mb-2">
                    <h3 className="font-heading text-base font-semibold text-sand-900 m-0">
                      {t.type}
                    </h3>
                    <span className="text-sm font-bold text-primary-700 whitespace-nowrap">
                      {t.prix}
                    </span>
                  </div>
                  <p className="text-xs text-sand-500 m-0 mb-1">{t.technique}</p>
                  <p className="text-sm text-sand-700 m-0">{t.detail}</p>
                </div>
              ))}
            </div>

            <h2 id="techniques">Les 3 techniques de pose</h2>
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
              géographique, accessibilité, hauteur sous solives. Préférer 2-3 devis comparés
              d’artisans Qualibat sur le même cahier des charges (matériau ACERMI, épaisseur, R).
            </p>

            <h2 id="aides">Aides 2026 — CEE BAR-EN-103 + MaPrimeRénov’</h2>
            <p>
              Toutes cumulables si artisan <strong>RGE Qualibat</strong> (mention plancher) et
              matériau certifié <strong>ACERMI</strong> :
            </p>
            <ul>
              <li>
                <strong>CEE BAR-EN-103</strong> — Isolation plancher bas. R ≥ 3 m².K/W, plancher sur
                sous-sol non chauffé / vide-sanitaire / passage ouvert. Forfait kWhc/m² maison : H1
                1 600, H2 1 300, H3 900. Source : fiche DGEC vA29-2.
              </li>
              <li>
                <strong>MaPrimeRénov’</strong> isolation plancher bas par geste : forfait selon
                revenus, voir{' '}
                <a href="https://france-renov.gouv.fr" rel="noopener noreferrer" target="_blank">
                  france-renov.gouv.fr
                </a>
                .
              </li>
              <li>
                <strong>Coup de pouce isolation</strong> : majoration ménages modestes et très
                modestes (cumul possible avec CEE BAR-EN-103).
              </li>
              <li>
                <strong>Éco-PTZ</strong> : jusqu’à 30 000 € par geste, 50 000 € rénovation
                d’ampleur. Sans condition de revenus.
              </li>
              <li>
                <strong>TVA 5,5 %</strong> sur fourniture + pose par artisan RGE Qualibat (vs 20 %
                sans RGE).
              </li>
            </ul>

            <div className="not-prose border-2 border-amber-300 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <div className="text-sm text-amber-900">
                <p className="font-semibold m-0 mb-1">
                  Attention : sol sur terre-plein non éligible
                </p>
                <p className="m-0">
                  La fiche BAR-EN-103 cible{' '}
                  <strong>
                    uniquement le plancher bas sur sous-sol non chauffé, vide-sanitaire ou passage
                    ouvert
                  </strong>
                  . Une dalle pleine sur terre-plein (RDC sans sous-sol){' '}
                  <strong>n’est pas éligible</strong> aux primes CEE — la rentabilité repose alors
                  uniquement sur l’économie d’énergie et le confort.
                </p>
              </div>
            </div>

            <h2 id="rge">Le label RGE Qualibat : mentions pertinentes</h2>
            <p>Deux mentions Qualibat couvrent l’isolation plancher bas selon la technique :</p>
            <ul>
              <li>
                <strong>Qualibat 7131</strong> — isolation thermique par l’intérieur (ITI). Couvre
                tout le périmètre intérieur : combles, rampants, murs intérieurs et{' '}
                <strong>plancher bas par dessous</strong>.
              </li>
              <li>
                <strong>Qualibat 5232</strong> — application de mousse polyuréthane projetée
                (mention spécifique pour la projection de mousse PU, idéale vide-sanitaire bas).
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
                <strong>Devis isolation plancher bas en 30 secondes</strong> — artisans certifiés
                RGE Qualibat 7131 (ITI) ou 5232 (mousse PU) pour ouvrir droit à MPR + CEE + TVA 5,5
                %.
              </p>
              <Link
                href="/devis"
                className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-5 py-3 rounded-lg transition"
              >
                Demander mon devis isolation plancher bas{' '}
                <ArrowRight className="w-4 h-4" aria-hidden />
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
