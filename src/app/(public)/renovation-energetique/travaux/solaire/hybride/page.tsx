/**
 * Page : /renovation-energetique/travaux/solaire/hybride
 *
 * @kw-primary    panneau solaire hybride
 * @kw-volume     1400
 * @kw-kd         4
 * @kw-cpc        1.85
 * @intent        commercial + informational
 * @cluster       solaire_pv
 * @ahrefs-source docs/ahrefs-bloc1-keywords-gap-2026-05-04.md (rang #169)
 * @snapshot      2026-05-04 (Ahrefs Bloc 1 v3 — sub-cluster panneau hybride PV-T)
 * @backlog-item  Levier-P-panneau-hybride-pvt
 *
 * KW cibles (validés Ahrefs gap CSV 2026-04, country=fr) :
 * - "panneau solaire hybride"        1 400 vol, KD 4  ⭐⭐ pivot rang #169
 * - "panneau hybride solaire"          250 vol, KD 4  longue traîne
 * - "panneau pv-t"                     longue traîne tech
 * - "panneau dualsun"                  branded longue traîne
 * - "panneau systovi"                  branded longue traîne
 * - Famille cumulée pivot : ~1 800 vol/mois
 *
 * Easy win : OUI (KD 4, leader effy.fr #5 page courte).
 * 0 page SA dédiée hybride PV-T (que mention dans /solaire hub + /solaire/thermique).
 * Atout SA : focus produit PV-T (technologie 2-en-1, refroidissement PV, fabricants
 * français DualSun et Systovi), distinct du PV pur et du thermique pur.
 *
 * Cluster pillar : Rénovation Énergétique → Travaux → Solaire → Hybride PV-T
 *
 * Anti-cannibalisation :
 *   - /solaire (hub)               = panneau PV pur (panneau solaire prix 6.3K KD 25)
 *   - /solaire/thermique           = capteurs solaires thermiques (CESI/SSC pure thermique)
 *   - /solaire/rendement           = rendement PV pur
 *   - /solaire/autoconsommation    = autoconso PV
 *   - Cette page                   = HYBRIDE PV-T (2-en-1 électricité + chaleur eau)
 *   - /aides/panneau-solaire-2026  = aides PV résidentiel
 *
 * YMYL high : décisions investissement 12-20K€, complexité technique (refroidissement
 * PV via fluide caloporteur), aides cumulées (PV+thermique), fabricants français.
 * Cite : Légifrance, France Rénov', ADEME, INES (Institut National Énergie Solaire),
 * Solar Keymark, Qualit'EnR Qualisol Combi/QualiPV.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  AlertTriangle,
  Calculator,
  CheckCircle2,
  Coins,
  Sun,
  ShieldCheck,
  Wrench,
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

const PAGE_PATH = '/renovation-energetique/travaux/solaire/hybride'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'marc-lefebvre'
const AUTHOR_NAME = 'Marc Lefebvre'

const TITLE = 'Panneau solaire hybride PV-T 2026 : prix & marques'
const DESCRIPTION =
  'Panneau solaire hybride PV-T 2026 : 2-en-1 électricité + ECS, prix 12 000-20 000 €, rendement combiné 60-75 %, fabricants français DualSun et Systovi, aides cumulables.'

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
  'Panneau hybride PV-T = capteur 2-en-1 qui produit simultanément électricité (PV) et chaleur (eau).',
  'Le fluide caloporteur refroidit les cellules PV → rendement électrique +5-15 % vs PV pur.',
  'Prix posé 2026 : 12 000-20 000 € pour 6-12 m² (couverture ECS 70-90 % + 1-3 kWc électrique).',
  '2 fabricants français leaders : DualSun (Marseille) et Systovi (Nantes). Lifetime 25-30 ans.',
  "Aides : prime EDF OA (côté électrique) + MaPrimeRénov' Bleu jusqu'à 4 000 € (côté thermique CESI).",
  'Rendement combiné 60-75 % vs 18-22 % PV seul ou 40-50 % thermique seul.',
  "Idéal en toiture limitée : ~50 % de surface en moins qu'un PV + CESI séparés.",
]

const TECHNO = [
  {
    aspect: 'Principe physique',
    detail:
      'Sous chaque cellule PV, un échangeur thermique en cuivre/aluminium parcouru par un fluide caloporteur (eau glycolée). Le fluide récupère la chaleur que le PV dissiperait normalement (60-65 °C en pleine exposition). Bénéfice double : (1) eau chaude, (2) cellules PV refroidies = +5-15 % de rendement électrique.',
  },
  {
    aspect: 'Pourquoi le PV gagne en rendement',
    detail:
      "Une cellule PV silicium perd ~0,4 %/°C au-delà de 25 °C. À 70 °C en plein soleil d'été, un PV classique perd 18 % de rendement. Le PV-T maintient les cellules à 35-45 °C grâce à l'extraction continue de chaleur = -10 à -15 °C température de fonctionnement = +5 à +15 % de rendement électrique annuel.",
  },
  {
    aspect: 'Couverture ECS',
    detail:
      'Pour une famille 4 personnes (200 L ECS/jour), 8-12 m² de PV-T couvrent 70-90 % des besoins ECS annuels. En été, surplus thermique géré par dissipateur ou priorité PV. En hiver, appoint électrique ou gaz. Production électrique typique 3-6 kWc selon surface.',
  },
  {
    aspect: 'Limitation thermique',
    detail:
      "Le PV-T produit de l'eau à 50-60 °C max (vs 70-90 °C pour un capteur thermique pur sous vide). Suffisant pour ECS mais pas pour chauffage central haute T° (radiateurs anciens). Idéal couplé à un plancher chauffant basse T° ou ECS uniquement.",
  },
]

const COMPARATIF = [
  {
    critere: 'Production électrique',
    pvt: '+5-15 % vs PV pur (refroidissement)',
    pv: 'Référence (18-22 % rendement)',
    thermique: 'Aucune',
  },
  {
    critere: 'Production chaleur',
    pvt: '50-60 °C ECS',
    pv: 'Aucune',
    thermique: '50-90 °C ECS + chauffage',
  },
  {
    critere: 'Surface toit pour 4 personnes',
    pvt: '8-12 m²',
    pv: '12-15 m² (PV) + CESI séparé 4 m² = 16-19 m²',
    thermique: "4-6 m² (CESI seul, pas d'élec)",
  },
  {
    critere: 'Prix posé typique',
    pvt: '12 000-20 000 €',
    pv: '8 000-15 000 € (3-9 kWc) + CESI 4-7K = 12-22K cumulé',
    thermique: '4 000-7 000 € (CESI seul)',
  },
  {
    critere: 'Aides cumulées',
    pvt: 'Prime EDF OA + MPR thermique côté CESI',
    pv: 'Prime EDF OA + TVA 10 % ≤ 3 kWc',
    thermique: "MPR Bleu jusqu'à 4 000 € + CEE BAR-TH-101",
  },
  {
    critere: 'Garantie',
    pvt: '20-25 ans (PV) + 5-10 ans (échangeur)',
    pv: '25 ans (production 80-85 %)',
    thermique: '10-25 ans capteurs',
  },
  {
    critere: 'Complexité installation',
    pvt: 'Élevée (PV + plomberie)',
    pv: 'Moyenne (PV + onduleur + Enedis)',
    thermique: 'Moyenne (plomberie + ballon)',
  },
  {
    critere: 'Installateur requis',
    pvt: 'RGE QualiPV + Qualisol Combi (2 mentions)',
    pv: 'RGE QualiPV',
    thermique: 'RGE Qualisol CESI ou Combi',
  },
]

const FABRICANTS = [
  {
    marque: 'DualSun (France, Marseille)',
    modele: 'SPRING (verre-verre PV-T)',
    prix: '450-650 €/m² nu (hors pose)',
    detail:
      'Leader français du PV-T depuis 2010. Module 1,7 m² (~340 Wc + ~700 W thermique). Garantie 25 ans PV + 10 ans circuit thermique. Compatible toiture intégrée ou surimposée. Made in France (usine PACA).',
  },
  {
    marque: 'Systovi (France, Nantes)',
    modele: 'R-VOLT et V-VOLT',
    prix: '400-600 €/m² nu',
    detail:
      'Fabricant français spécialiste de la double production. R-VOLT pour ECS, V-VOLT pour ventilation et préchauffage air. Module 1,6 m² (~330 Wc + ~600 W thermique). Garantie 25 ans PV. Made in France (usine Pays de la Loire).',
  },
  {
    marque: 'Sunage (Suisse)',
    modele: 'SE Hybrid',
    prix: '500-700 €/m² nu',
    detail:
      'Pionnier européen PV-T depuis 1990. Modules haut de gamme. Distribution France via réseau partenaires. Garantie 20 ans.',
  },
  {
    marque: '2Power Energy (Belgique)',
    modele: 'Triple Solar',
    prix: '450-600 €/m² nu',
    detail:
      'Solution hybride pour PAC géothermique : le PV-T sert de source froide pour la PAC (couplage idéal). Niche premium, à privilégier en construction neuve avec PAC eau-eau ou sondes verticales courtes.',
  },
]

const CONFIGURATIONS = [
  {
    cas: 'ECS standard 4 personnes (config #1)',
    surface: '8 m² PV-T',
    production: '~1,6 kWc électrique + 75 % ECS',
    prix: '12 000-15 000 € posé',
    detail:
      'Configuration de base ECS. Couvre besoin chauffage eau + faible production électrique 1 600-1 900 kWh/an. Idéal couple ou T3/T4. ROI 10-13 ans.',
  },
  {
    cas: 'ECS + appoint élec (config #2)',
    surface: '12 m² PV-T',
    production: '~2,4 kWc électrique + 90 % ECS',
    prix: '15 000-18 000 € posé',
    detail:
      'Couvre intégralement ECS + 30-40 % de la consommation électrique. Famille 4-5 personnes. Combinable avec ballon thermo en backup. ROI 9-12 ans.',
  },
  {
    cas: 'PV-T + chauffage basse T° (config #3)',
    surface: '15-20 m² PV-T',
    production: '~3-4 kWc électrique + ECS + 30 % chauffage',
    prix: '18 000-25 000 € posé',
    detail:
      'Maison BBC/RE 2020 avec plancher chauffant basse T° (35-45 °C). Configuration premium. ROI 11-14 ans. Demande étude thermique préalable.',
  },
  {
    cas: 'PV-T + PAC géothermique (config #4)',
    surface: '15-25 m² PV-T',
    production: 'Source froide PAC + ECS + élec',
    prix: '25 000-35 000 € total système',
    detail:
      'Niche premium : le PV-T sert de source froide pour PAC eau-eau (couplage Triple Solar). Réduit la profondeur des sondes géothermiques de 30-50 %. Construction neuve.',
  },
]

const faqs = [
  {
    question: "Qu'est-ce qu'un panneau solaire hybride PV-T ?",
    answer:
      "Un panneau solaire hybride PV-T (photovoltaïque-thermique) combine deux fonctions dans un même module : (1) production d'<strong>électricité</strong> via les cellules photovoltaïques en surface, (2) production de <strong>chaleur</strong> via un échangeur thermique placé sous les cellules, parcouru par un fluide caloporteur. Le fluide refroidit les cellules PV (qui perdent 0,4 %/°C au-delà de 25 °C) et récupère cette chaleur pour produire de l'eau chaude sanitaire (50-60 °C). Bénéfice double : production combinée + rendement PV amélioré de 5-15 %.",
  },
  {
    question: 'Combien coûte un panneau solaire hybride en 2026 ?',
    answer:
      'Prix posé clé en main 2026 : 12 000-15 000 € pour 8 m² (couverture ECS 70-80 % + ~1,6 kWc électrique), 15 000-18 000 € pour 12 m² (ECS 90 % + ~2,4 kWc), 18 000-25 000 € pour 15-20 m² avec appoint chauffage basse T° (couplage plancher chauffant). Le matériel représente 50-60 % du devis (400-650 €/m² nu pour DualSun ou Systovi), la pose 40-50 % (plomberie + électricité + raccordement). Comparé à PV pur + CESI séparés (12 000-22 000 € pour la même couverture), le PV-T offre un gain de 20-30 % de surface toit.',
  },
  {
    question: 'Quelle différence avec un panneau PV pur ou un capteur thermique ?',
    answer:
      "<strong>PV pur</strong> : production électrique seule (18-22 % rendement). 12-15 m² nécessaires pour 3-4 kWc en autoconso. <strong>Capteur thermique pur</strong> (CESI) : production chaleur seule (40-50 % rendement saisonnier), 4-6 m² pour ECS d'une famille de 4. <strong>PV-T hybride</strong> : 2-en-1 dans 8-12 m². Avantage clé : compactité (~50 % de surface en moins) + rendement PV amélioré par refroidissement (+5-15 %). Inconvénient : prix au m² plus élevé (450-650 €/m² nu vs 200-350 €/m² pour PV pur).",
  },
  {
    question: 'Quelles aides 2026 pour un panneau solaire hybride ?',
    answer:
      "Cumul possible : (1) <strong>prime EDF OA autoconsommation</strong> sur la partie électrique (~250-450 €/kWc ≤ 3 kWc, barème CRE trimestriel — voir edf-oa.fr) ; (2) <strong>MaPrimeRénov' Bleu</strong> sur la partie thermique (CESI hybride éligible jusqu'à 4 000 € pour revenus très modestes) ; (3) <strong>CEE BAR-TH-101</strong> côté thermique (~250 €) ; (4) <strong>TVA 5,5 %</strong> avec installateur RGE Qualisol Combi pour le matériel + pose ; (5) <strong>éco-PTZ</strong> jusqu'à 30 000 € si combiné avec d'autres travaux. Pour un foyer aux revenus très modestes en config 12 m², les aides peuvent atteindre 6 000-8 000 €.",
  },
  {
    question: 'Quels fabricants choisir en 2026 ?',
    answer:
      '<strong>2 fabricants français leaders</strong> : <strong>DualSun</strong> (Marseille, leader marché depuis 2010, modèle SPRING verre-verre, garantie 25 ans PV + 10 ans circuit thermique) et <strong>Systovi</strong> (Nantes, modèles R-VOLT et V-VOLT, garantie 25 ans PV). Tous deux Made in France. Pour des configurations niches : <strong>Sunage</strong> (Suisse, premium, 20 ans garantie) ou <strong>2Power Energy / Triple Solar</strong> (Belgique, couplage PAC géothermique). Vérifier la certification Solar Keymark côté thermique et IEC 61215 côté PV.',
  },
  {
    question: 'Quel installateur pour un PV-T ?',
    answer:
      "Plombier-électricien doublement certifié <strong>RGE QualiPV</strong> (côté électrique pour la prime EDF OA + TVA 10 %) ET <strong>RGE Qualisol Combi</strong> (côté thermique pour MPR + TVA 5,5 % matériel). Sans cette double certification, perte d'aides + TVA 20 %. Le PV-T est complexe : fluide caloporteur sous toit + circuit hydraulique + raccordement Enedis + ballon. Exiger 5+ chantiers PV-T en référence. Comparer 2-3 devis. Privilégier un pro spécialisé PV-T (DualSun et Systovi tiennent à jour la liste de leurs partenaires installateurs).",
  },
  {
    question: 'Quel rendement attendre selon la zone climatique ?',
    answer:
      'Production combinée typique en France : <strong>PACA / Corse</strong> 1 200-1 600 kWh/m²/an (élec + thermique cumulés), <strong>Sud-Ouest</strong> 1 000-1 300, <strong>Centre / Île-de-France</strong> 800-1 000, <strong>Bretagne / Pays de la Loire</strong> 700-900, <strong>Hauts-de-France / Alsace</strong> 750-950. Pour 8 m² de PV-T en zone tempérée (centre France) : ~1 600 kWh électrique + 3 200 kWh thermique = 4 800 kWh utiles/an. Couverture ECS 70-80 %. Rendement combiné 60-75 % (vs 18-22 % PV pur ou 40-50 % thermique pur).',
  },
  {
    question: 'Quel entretien pour un panneau solaire hybride ?',
    answer:
      'Entretien similaire à un système solaire combiné classique : (1) nettoyage des panneaux 1-2 fois/an si pollution ou poussière (eau claire, brosse douce — jamais de produit chimique) ; (2) contrôle pression circuit primaire tous les 2-3 ans (1,5-3 bar) ; (3) test pH antigel propylène glycol tous les 5-7 ans (renouveler 200-400 €) ; (4) vérification ballon ECS, anode magnésium, sécurités tous les 3-5 ans. Côté électrique : aucun entretien régulier sauf nettoyage. Coût annuel moyen 100-200 € HT. Durée de vie : 25-30 ans côté PV, 20-25 ans côté circuit thermique.',
  },
]

const sources = [
  {
    label: "France Rénov' — Solaire hybride",
    url: 'https://france-renov.gouv.fr/renovation/chauffage/chauffe-eau-solaire',
  },
  {
    label: 'ADEME — Énergie solaire (PV et thermique)',
    url: 'https://www.ademe.fr',
  },
  {
    label: "INES — Institut National de l'Énergie Solaire",
    url: 'https://www.ines-solaire.org',
  },
  {
    label: 'DualSun — Fabricant français PV-T',
    url: 'https://dualsun.com',
  },
  {
    label: 'Systovi — Fabricant français PV-T',
    url: 'https://www.systovi.com',
  },
  {
    label: 'Solar Keymark — Certification capteurs thermiques',
    url: 'https://www.solarkeymark.eu',
  },
  {
    label: "Qualit'EnR — Mention RGE Qualisol Combi + QualiPV",
    url: 'https://www.qualit-enr.org',
  },
  {
    label: 'IEC 61215 — Norme certification panneaux PV',
    url: 'https://www.iec.ch',
  },
]

const relatedPages = [
  {
    label: 'Panneau solaire thermique 2026 (CESI / SSC)',
    href: '/renovation-energetique/travaux/solaire/thermique',
    description: 'Capteurs thermiques purs (sans élec)',
  },
  {
    label: 'Hub Solaire 2026 — panneau PV',
    href: '/renovation-energetique/travaux/solaire',
    description: 'Photovoltaïque pur, prix, types',
  },
  {
    label: 'Aides panneau solaire 2026',
    href: '/renovation-energetique/aides/panneau-solaire-2026',
    description: 'Prime EDF OA + TVA 10 % + IR exonéré',
  },
  {
    label: 'Rendement panneau solaire',
    href: '/renovation-energetique/travaux/solaire/rendement',
    description: 'Mono 18-22 %, poly 14-17 %, dégradation 25 ans',
  },
  {
    label: 'Autoconsommation solaire',
    href: '/renovation-energetique/travaux/solaire/autoconsommation',
    description: 'Totale, surplus, collective',
  },
  {
    label: 'Ballon thermodynamique 2026',
    href: '/renovation-energetique/travaux/ballon-thermodynamique',
    description: 'Alternative ECS PAC sur air ambiant',
  },
  {
    label: 'Trouver un installateur QualiPV + Qualisol',
    href: '/services/electricien',
    description: 'Annuaire RGE double mention',
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
    section: 'Solaire — Panneau hybride PV-T',
    keywords: [
      'panneau solaire hybride',
      'panneau hybride solaire',
      'panneau pv-t',
      'dualsun',
      'systovi',
      'panneau solaire 2-en-1',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique/travaux' },
    { name: 'Solaire', url: '/renovation-energetique/travaux/solaire' },
    { name: 'Hybride PV-T', url: PAGE_PATH },
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
              { label: 'Solaire', href: '/renovation-energetique/travaux/solaire' },
              { label: 'Hybride PV-T' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-accent-50 text-accent-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Sun className="w-3.5 h-3.5" aria-hidden />
              2-en-1 — Électricité + ECS dans le même panneau
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Panneau solaire hybride PV-T 2026 : prix et marques
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Le <strong>panneau solaire hybride PV-T</strong> (photovoltaïque-thermique) combine
              dans un seul module la production d&apos;<strong>électricité</strong> (18-22 %) et de{' '}
              <strong>chaleur</strong> (eau à 50-60 °C). Le fluide caloporteur refroidit les
              cellules PV → rendement électrique <strong>+5-15 %</strong> vs PV pur. Prix posé 2026
              : <strong>12 000-20 000 €</strong> pour 8-12 m² (couverture ECS 70-90 % + 1-3 kWc).
              Fabricants français leaders : <strong>DualSun</strong> (Marseille) et{' '}
              <strong>Systovi</strong> (Nantes). Voici les 4 configurations, le comparatif vs PV et
              thermique purs, et comment cumuler les aides EDF OA + MPR.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2 id="techno">La technologie PV-T expliquée</h2>
            <div className="not-prose grid gap-3 my-6">
              {TECHNO.map((t) => (
                <div key={t.aspect} className="bg-white border border-sand-200 rounded-xl p-5">
                  <h3 className="font-heading text-base font-semibold text-sand-900 m-0 mb-1">
                    {t.aspect}
                  </h3>
                  <p className="text-sm text-sand-700 m-0">{t.detail}</p>
                </div>
              ))}
            </div>

            <h2 id="comparatif">Comparatif PV-T vs PV pur vs thermique pur</h2>
            <div className="not-prose overflow-x-auto my-6">
              <table className="min-w-full bg-white border border-sand-200 rounded-xl text-sm">
                <thead className="bg-sand-100 text-sand-900">
                  <tr>
                    <th className="text-left px-3 py-2 font-semibold">Critère</th>
                    <th className="text-left px-3 py-2 font-semibold">PV-T hybride</th>
                    <th className="text-left px-3 py-2 font-semibold">PV pur</th>
                    <th className="text-left px-3 py-2 font-semibold">Thermique pur</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARATIF.map((c) => (
                    <tr key={c.critere} className="border-t border-sand-100">
                      <td className="px-3 py-2 align-top font-semibold text-sand-900">
                        {c.critere}
                      </td>
                      <td className="px-3 py-2 align-top text-primary-700 font-semibold">
                        {c.pvt}
                      </td>
                      <td className="px-3 py-2 align-top text-sand-700">{c.pv}</td>
                      <td className="px-3 py-2 align-top text-sand-700">{c.thermique}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 id="configurations">4 configurations type 2026</h2>
            <div className="not-prose grid gap-3 my-6">
              {CONFIGURATIONS.map((c) => (
                <div key={c.cas} className="bg-white border border-sand-200 rounded-xl p-5">
                  <div className="flex items-baseline justify-between gap-2 flex-wrap mb-2">
                    <h3 className="font-heading text-base font-semibold text-sand-900 m-0">
                      {c.cas}
                    </h3>
                    <span className="text-sm font-bold text-primary-700 whitespace-nowrap">
                      {c.prix}
                    </span>
                  </div>
                  <p className="text-xs text-sand-600 m-0 mb-1">
                    <strong>Surface :</strong> {c.surface} — <strong>Production :</strong>{' '}
                    {c.production}
                  </p>
                  <p className="text-sm text-sand-700 m-0">{c.detail}</p>
                </div>
              ))}
            </div>

            <h2 id="fabricants">4 fabricants leaders</h2>
            <div className="not-prose grid gap-3 my-6">
              {FABRICANTS.map((f) => (
                <div key={f.marque} className="bg-white border border-sand-200 rounded-xl p-5">
                  <div className="flex items-baseline justify-between gap-2 flex-wrap mb-2">
                    <h3 className="font-heading text-base font-semibold text-sand-900 m-0">
                      {f.marque}
                    </h3>
                    <span className="text-sm font-bold text-primary-700 whitespace-nowrap">
                      {f.prix}
                    </span>
                  </div>
                  <p className="text-xs text-sand-600 m-0 mb-1">
                    <strong>Modèle :</strong> {f.modele}
                  </p>
                  <p className="text-sm text-sand-700 m-0">{f.detail}</p>
                </div>
              ))}
            </div>

            <div className="not-prose flex items-start gap-3 border border-amber-200 bg-amber-50 rounded-lg p-4 my-6">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <div className="text-sm text-amber-900">
                <p className="font-semibold m-0 mb-1">Attention au discount fictif des copies</p>
                <p className="m-0">
                  Plusieurs revendeurs proposent des « PV-T » à 200-300 €/m² nu (vs 400-650 €/m²
                  pour DualSun / Systovi). Il s&apos;agit souvent de PV classique avec un échangeur
                  bricolé, sans certification Solar Keymark côté thermique ni garantie sérieuse.
                  Exiger les certificats officiels (IEC 61215 PV + Solar Keymark thermique) avant de
                  signer.
                </p>
              </div>
            </div>

            <h2 id="aides">Aides 2026 cumulées</h2>
            <ul>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Prime EDF OA</strong> côté électrique : ~250-450 €/kWc (≤ 3 kWc), barème CRE
                trimestriel. Versée sur 5 ans.
              </li>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>MaPrimeRénov&apos; Bleu</strong> côté thermique (CESI hybride éligible) :
                jusqu&apos;à <strong>4 000 €</strong> revenus très modestes.
              </li>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>CEE BAR-TH-101</strong> côté thermique : ~250 € selon revenus.
              </li>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>TVA 5,5 %</strong> sur la part thermique (CESI), <strong>TVA 10 %</strong>{' '}
                sur la part électrique ≤ 3 kWc, sous condition d&apos;installateur RGE Qualisol
                Combi + QualiPV.
              </li>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Éco-PTZ</strong> : jusqu&apos;à 30 000 € par geste, accessible si combiné
                avec d&apos;autres travaux d&apos;économie d&apos;énergie.
              </li>
            </ul>

            <div className="not-prose flex items-start gap-3 border border-primary-200 bg-primary-50 rounded-lg p-5 my-8">
              <Calculator className="w-5 h-5 text-primary-700 shrink-0 mt-0.5" aria-hidden />
              <div className="flex-1">
                <p className="font-semibold text-primary-900 m-0 mb-1">
                  Simuler mes aides PV-T en 2 minutes
                </p>
                <p className="text-sm text-primary-900 m-0 mb-3">
                  Notre simulateur calcule la double aide (prime EDF OA + MPR thermique) selon
                  surface, revenus et zone climatique. Liste d&apos;installateurs Qualisol Combi +
                  QualiPV proches de chez vous.
                </p>
                <Link
                  href="/simulateur-aides-renovation"
                  className="inline-flex items-center gap-1.5 bg-primary-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-800 transition-colors"
                >
                  Lancer le simulateur <ArrowRight className="w-4 h-4" aria-hidden />
                </Link>
              </div>
            </div>

            <h2 id="installation">Installation et obligations</h2>
            <ul>
              <li>
                <Wrench className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Double certification</strong> : RGE QualiPV (côté élec) + Qualisol Combi
                (côté thermique). Sans : aides perdues + TVA 20 %.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Certifications panneau</strong> : IEC 61215 (PV) + Solar Keymark (thermique)
                obligatoires pour les aides.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Orientation Sud ± 30°</strong>, inclinaison 30-60° (45° optimal France). Pas
                d&apos;ombrage entre 9h et 17h en hiver.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Surface toiture</strong> : 8-12 m² mini (config 4 personnes), 15-20 m² pour
                appoint chauffage. Vérifier la portance avant pose (modules 25-30 kg/m²).
              </li>
              <li>
                <ShieldCheck className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Antigel propylène glycol</strong> obligatoire (toxicité limitée vs éthylène
                glycol interdit ECS). À renouveler tous les 5-7 ans (200-400 €).
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Raccordement Enedis</strong> (côté élec) : obligatoire pour la prime EDF OA
                + revente surplus. Délai 6-12 semaines.
              </li>
            </ul>
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
              href="/renovation-energetique/travaux/solaire"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Hub Solaire
            </Link>
            <Link
              href="/services/electricien"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Installateurs QualiPV + Qualisol <Coins className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
