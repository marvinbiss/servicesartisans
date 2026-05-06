/**
 * Page : /renovation-energetique/travaux/climatisation
 *
 * @kw-primary    installation climatisation prix
 * @kw-volume     450
 * @kw-kd         0
 * @kw-cpc        0.74
 * @cluster       8
 * @ahrefs-source docs/ahrefs-audit-2026-04/normalized/ahrefs-content-gap.csv
 * @snapshot      2026-05-04 (Ahrefs Bloc 1 v3 — cluster climatisation install + dépannage)
 * @backlog-item  Levier-L-climatisation
 *
 * KW cibles (validés Ahrefs gap CSV 2026-04, country=fr) :
 * - "frigoriste autour de moi"               800 vol KD 2
 * - "entreprise climatisation"               800 vol KD 16 (skip too hard)
 * - "dépannage climatisation"                600 vol KD 0
 * - "installateur de climatisation"          600 vol KD 5
 * - "climatisation autour de moi"            600 vol KD 0
 * - "installation climatisation prix"        450 vol KD 0 ⭐⭐⭐ pivot
 * - "prix climatisation réversible pose comprise" 350 vol KD 3
 * - Famille cumulée pivot : ~3 200 vol/mois (KD 0-5)
 *
 * Source : docs/ahrefs-audit-2026-04/normalized/ahrefs-content-gap.csv
 * Easy win : MOYEN (KD 0-5, intent service local + guide prix install)
 * Cluster pillar : Rénovation Énergétique → Travaux → Climatisation
 *
 * Anti-cannibalisation :
 *   - /travaux/pompe-a-chaleur/air-air-prix = PAC air-air (réversible) angle
 *     « rénovation énergétique » (chauffage). Cluster rénovation thermique.
 *   - Cette page = climatisation pure (refroidissement seul ou réversible)
 *     angle « confort été » et installation climatiseur. CEE BAR-TH-129
 *     éligible si performance saisonnière (SCOP, SEER) conforme.
 *
 * YMYL high : Règlement UE 517/2014 F-Gas seuil 5 tCO2-eq, Décret 2015-1790
 * fluides catégorie I, attestation manipulation fluides obligatoire,
 * évacuation condensats DTU 65.16, Arrêté 5/12/2006 voisinage (35 dB(A) jour /
 * 30 dB(A) nuit en limite mitoyenne).
 *
 * Cite : Règlement UE 517/2014, Décret 2015-1790, Code env. R543-75 à R543-123,
 * Arrêté 5/12/2006 voisinage, DTU 65.16 condensats, France Rénov’ BAR-TH-129,
 * ADEME guide climatisation.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Snowflake,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Calculator,
  Wrench,
  HardHat,
  Volume2,
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

const PAGE_PATH = '/renovation-energetique/travaux/climatisation'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'jean-pierre-duval'
const AUTHOR_NAME = 'Jean-Pierre Duval'

const TITLE = 'Prix installation climatisation 2026 : 1 500-15 000 €'
const DESCRIPTION =
  'Installation climatisation 2026 : monosplit 1 500-3 500 €, multisplit 3 000-8 000 €, gainable 6 000-15 000 €. Réversible, dépannage, attestation fluides obligatoire.'

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
  '4 types de climatisation en 2026 : monosplit (1 pièce), multisplit (2-5 pièces), gainable (toute la maison), mobile (sans pose). Prix posé 1 500-15 000 €.',
  'Climatisation réversible (= pompe à chaleur air-air) éligible CEE BAR-TH-129 si performance saisonnière SCOP ≥ 3,9 et SEER ≥ 5,1 (selon arrêté DGEC en vigueur 2026).',
  'F-Gas : contrôle annuel d’étanchéité obligatoire si charge fluide ≥ 5 tCO2-eq (Règlement UE 517/2014 art. 4) — par technicien attestation fluides catégorie I.',
  'Bruit : unité extérieure plafonnée à 35 dB(A) le jour / 30 dB(A) la nuit en limite mitoyenne (Arrêté 5/12/2006). Sanction maire jusqu’à 1 500 €.',
  'Dépannage climatisation 2026 : 80-150 € le déplacement diagnostic, 200-600 € la réparation simple (capteur, sonde), 600-1 500 € l’intervention sur fluide.',
  'Frigoriste obligatoire pour la mise en service + recharge fluide : attestation manipulation fluides catégorie I (Décret 2015-1790, Code env. R543-75 à R543-123).',
]

const TYPES_CLIM = [
  {
    type: 'Mobile (sans pose)',
    prix: '300 - 800 €',
    couverture: '15-30 m²',
    duree: '1 saison',
    note: 'Pas de pose, pas d’aide, gourmand en énergie. Solution d’appoint, ponctuelle. Évacuation par fenêtre, bruit notable.',
  },
  {
    type: 'Monosplit',
    prix: '1 500 - 3 500 €',
    couverture: '25-40 m²',
    duree: '12-15 ans',
    note: '1 unité intérieure + 1 unité extérieure. Idéal pièce de vie ou chambre principale. Pose 4-6 h. Réversible chauffage en option.',
  },
  {
    type: 'Multisplit (2 à 5 unités)',
    prix: '3 000 - 8 000 €',
    couverture: '50-150 m²',
    duree: '12-15 ans',
    note: '1 unité extérieure + 2 à 5 unités intérieures. Régulation indépendante par pièce. Idéal maison ou appartement T3-T5.',
  },
  {
    type: 'Gainable (centralisé)',
    prix: '6 000 - 15 000 €',
    couverture: '80-200 m²',
    duree: '15-20 ans',
    note: 'Réseau de gaines en faux-plafond ou combles, bouches discrètes. Esthétique, silencieux. Nécessite étude technique + travaux gainage.',
  },
]

const FACTEURS_PRIX = [
  {
    title: 'Surface et nombre de pièces',
    impact: '×1 à ×4',
    desc: 'Une pièce de 25 m² : monosplit 1 500-2 500 €. Maison T4 100 m² avec 4 unités : multisplit 6 000-8 000 €. Gainable 150 m² : 12 000-15 000 €.',
  },
  {
    title: 'Type de fluide frigorigène',
    impact: '+5 à +15 %',
    desc: 'R32 (PRG 675) : standard 2026, bon SEER. R290 (propane, PRG 3) : éco mais explosif, technique spécifique. R454B / R466A : nouvelles générations, +10-15 %.',
  },
  {
    title: 'Performance énergétique (SEER, SCOP)',
    impact: '+10 à +30 %',
    desc: 'SEER 5,1 (mini classe A) : standard. SEER 8-10 (premium) : +20-30 %, économie facture. SCOP 4-5 (réversible) : éligible CEE BAR-TH-129 selon arrêté en vigueur.',
  },
  {
    title: 'Difficulté de pose et accès',
    impact: '+200 à +1 500 €',
    desc: 'Liaison frigorifique > 10 m : +30-50 €/m. Dénivelé > 15 m : surcoût technique. Accès ext. par toiture : nacelle 400-800 €. Façade classée : étude architecte.',
  },
  {
    title: 'Type de bâtiment',
    impact: '+10 à +25 %',
    desc: 'Appartement copropriété : autorisation copro + filaire ou unité « console ». Maison individuelle : libre. Local pro : étude RT 2020 + obligations classification.',
  },
]

const REGLEMENT = [
  {
    title: 'Règlement UE 517/2014 F-Gas — contrôle annuel ≥ 5 tCO2-eq',
    desc: 'Tout équipement frigorifique avec une charge de fluide ≥ 5 tonnes CO2 équivalent doit subir un contrôle annuel d’étanchéité par un technicien titulaire de l’attestation manipulation fluides catégorie I. Pour la plupart des climatiseurs résidentiels : seuil rarement atteint (charges 0,5-2,5 kg).',
  },
  {
    title: 'Décret 2015-1790 + Code environnement R543-75 à R543-123',
    desc: 'Toute manipulation de fluide frigorigène (charge, recharge, récupération) doit être réalisée par un opérateur certifié + une entreprise attestée DGEC. Sans cette attestation, la mise en service est illégale.',
  },
  {
    title: 'Arrêté 5/12/2006 voisinage — limite 35 dB(A) jour / 30 dB(A) nuit',
    desc: 'L’unité extérieure doit respecter en limite mitoyenne 35 dB(A) le jour (7h-22h) et 30 dB(A) la nuit. Mesure à 2 m du sol. Plainte voisin → maire peut imposer des modifications, sanction administrative jusqu’à 1 500 €.',
  },
  {
    title: 'DTU 65.16 — installation climatiseurs (évacuation condensats)',
    desc: 'Le DTU 65.16 encadre l’évacuation des condensats (eau produite par condensation). Évacuation gravitaire ou par pompe de relevage, raccordement à un siphon. Installation non conforme : risque de fuites + dégâts structurels.',
  },
]

const QUI_CHOISIR = [
  {
    title: 'Frigoriste avec attestation fluides catégorie I',
    must: 'Obligatoire',
    desc: 'Vérifier l’attestation de manipulation des fluides frigorigènes catégorie I de l’opérateur ET l’attestation entreprise DGEC. Sans ces deux documents, la pose ou la recharge est illégale (Décret 2015-1790).',
  },
  {
    title: 'RGE QualiPAC pour climatisation réversible (CEE)',
    must: 'Recommandé',
    desc: 'Pour bénéficier de la prime CEE BAR-TH-129 (climatisation réversible), l’installateur doit être RGE QualiPAC. Sans cette mention, aucune prime ne peut être obtenue, même si l’équipement est conforme.',
  },
  {
    title: 'Étude thermique et bilan dB(A)',
    must: 'Obligatoire',
    desc: 'Le devis doit inclure une étude thermique (puissance frigorifique en W ou BTU adaptée à la pièce) ET un bilan acoustique (dB(A) en limite mitoyenne). Sans cela : risque sous-dimensionnement ou plainte voisinage.',
  },
  {
    title: 'Garantie pose 2 ans + matériel 3-5 ans',
    must: 'Recommandé',
    desc: 'Garantie pose 2 ans (RC pro). Matériel : 3-5 ans pour la plupart des marques (Daikin, Mitsubishi Electric, Toshiba, Atlantic, Mitsubishi Heavy). Compresseur souvent 10 ans dans les marques premium.',
  },
  {
    title: 'Devis avec marque + référence + SEER + SCOP + dB(A)',
    must: 'Obligatoire',
    desc: 'Refuser tout devis sans : marque + référence du modèle, SEER (refroidissement), SCOP (chauffage si réversible), niveau sonore unité extérieure en dB(A), type de fluide frigorigène (R32, R290…).',
  },
]

const faqs = [
  {
    question: 'Combien coûte une climatisation installée en 2026 ?',
    answer:
      'Selon le type : climatiseur mobile sans pose 300-800 € (appoint), monosplit posé 1 500-3 500 €, multisplit 2-5 unités 3 000-8 000 €, gainable centralisé 6 000-15 000 €. Pour une maison T4 de 100 m² avec 3-4 unités intérieures : compter 5 000-8 000 € TTC pose comprise. La climatisation réversible (= pompe à chaleur air-air) coûte le même prix qu’un modèle non réversible mais peut être éligible à la prime CEE BAR-TH-129.',
  },
  {
    question: 'Quelle puissance de climatisation pour quelle surface ?',
    answer:
      'Règle simplifiée 2026 : compter 100 W frigorifiques par m² en isolation standard, 80 W en logement bien isolé (RT 2012/RE 2020), 120 W en logement mal isolé ou exposé sud. Exemples : pièce 25 m² standard = 2 500 W (≈ 9 000 BTU) ; salon 40 m² = 4 000 W (14 000 BTU) ; T4 100 m² total = 8 000-12 000 W répartis sur multisplit. Demander une étude thermique précise au frigoriste.',
  },
  {
    question: 'Y a-t-il une aide MaPrimeRénov’ ou CEE pour la climatisation ?',
    answer:
      'OUI mais uniquement pour la climatisation RÉVERSIBLE = pompe à chaleur air-air, sous conditions de performance (CEE BAR-TH-129). Conditions 2026 typiques : SCOP ≥ 3,9 et SEER ≥ 5,1, installateur RGE QualiPAC, valeurs précises selon arrêté DGEC en vigueur. La climatisation NON réversible (refroidissement seul) n’est éligible à aucune aide. À noter : MaPrimeRénov’ ne couvre généralement pas la PAC air-air, à la différence de la PAC air-eau.',
  },
  {
    question: 'Le frigoriste est-il obligatoire pour installer une climatisation ?',
    answer:
      'OUI pour la mise en service et la charge en fluide frigorigène. Le Décret 2015-1790 impose que tout opérateur manipulant un fluide frigorigène (charge, recharge, récupération) soit titulaire de l’attestation catégorie I, et que son entreprise dispose d’une attestation DGEC. Pour la pose mécanique (fixation murale, perçage), un installateur électricien peut intervenir, mais la mise en service doit ABSOLUMENT être faite par un frigoriste certifié.',
  },
  {
    question: 'Quel est le bruit autorisé pour une unité extérieure ?',
    answer:
      'Selon l’Arrêté du 5 décembre 2006 : 35 dB(A) maximum le jour (7h-22h) et 30 dB(A) maximum la nuit en limite mitoyenne avec un voisin. Mesure réalisée à 2 m du sol. Si dépassement : le voisin peut saisir le maire qui peut imposer des modifications (caisson antibruit, déplacement, plots antivibratiles) avec sanction jusqu’à 1 500 €. Conseil 2026 : choisir une unité ext. ≤ 50 dB(A) à 1 m, l’éloigner d’au moins 5 m de la limite mitoyenne, ou poser un caisson acoustique.',
  },
  {
    question: 'Quelle différence entre R32, R290 et R410A ?',
    answer:
      'Trois fluides frigorigènes courants en 2026 : (1) R410A — ancien standard, PRG 2 088, en sortie progressive depuis 2025 sur le résidentiel ; (2) R32 — nouveau standard depuis 2018-2020, PRG 675 (3× moins impactant que R410A), bonne efficacité, charges réduites ; (3) R290 (propane) — PRG 3 (quasi nul), excellent SEER, mais inflammable → installation et entretien spécifiques, surtout en gainable. Pour 2026, R32 est le standard recommandé en résidentiel mono/multisplit.',
  },
  {
    question: 'Combien coûte un dépannage climatisation en 2026 ?',
    answer:
      'En 2026 : déplacement diagnostic 80-150 € (souvent déductible si réparation ensuite), réparation simple (capteur, sonde, condensateur) 200-600 €, intervention fluide (recherche fuite, recharge) 600-1 500 € selon nature de la panne. Une panne « pas de froid » ou « unité ne s’allume pas » coûte typiquement 300-800 € à résoudre. Si compresseur HS : remplacement 1 500-3 500 € selon marque, parfois plus rentable de changer toute l’unité extérieure.',
  },
  {
    question: 'À quelle fréquence faut-il entretenir une climatisation ?',
    answer:
      'Visite annuelle recommandée par les fabricants (Daikin, Mitsubishi, Atlantic, Toshiba) : nettoyage filtres, mesure pression, contrôle écoulement condensats, mesure consommation. Coût 80-200 €/an selon le nombre d’unités. À noter : si la charge totale du circuit ≥ 5 tCO2-eq (rare en résidentiel mono/multisplit), un contrôle annuel d’étanchéité est légalement obligatoire (Règlement UE 517/2014 art. 4). Filtres à dépoussiérer par l’usager toutes les 2-4 semaines en saison.',
  },
]

const sources = [
  {
    label: 'Légifrance — Règlement UE 517/2014 F-Gas (article 4)',
    url: 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX%3A32014R0517',
  },
  {
    label: 'Légifrance — Décret 2015-1790 fluides frigorigènes',
    url: 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000031824591/',
  },
  {
    label: 'Légifrance — Code environnement art. R543-75 à R543-123',
    url: 'https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006074220/LEGISCTA000031816580/',
  },
  {
    label: 'Légifrance — Arrêté du 5 décembre 2006 (bruits de voisinage)',
    url: 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000466121/',
  },
  {
    label: 'France Rénov’ — Fiche CEE BAR-TH-129 (PAC air-air)',
    url: 'https://france-renov.gouv.fr',
  },
  {
    label: 'AFNOR / DTU 65.16 — installation climatiseurs (condensats)',
    url: 'https://www.boutique.afnor.org',
  },
  { label: 'ADEME — Guide climatisation et rafraîchissement', url: 'https://librairie.ademe.fr' },
  {
    label: 'Qualibat / QualiPAC — référentiels installation thermodynamique',
    url: 'https://www.qualibat.com',
  },
]

const relatedPages = [
  {
    label: 'PAC air-air (réversible, éligible CEE)',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/air-air-prix',
  },
  {
    label: 'Hub pompe à chaleur',
    href: '/renovation-energetique/travaux/pompe-a-chaleur',
  },
  {
    label: 'Entretien pompe à chaleur',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/entretien',
  },
  {
    label: 'Hub VMC (qualité air)',
    href: '/renovation-energetique/travaux/vmc',
  },
  {
    label: 'Hub Travaux rénovation',
    href: '/renovation-energetique/travaux',
  },
  {
    label: 'Trouver un frigoriste / installateur clim',
    href: '/rge/renovation-energetique',
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
    section: 'Travaux — Climatisation',
    keywords: [
      'installation climatisation prix',
      'prix climatisation',
      'climatisation réversible',
      'frigoriste',
      'dépannage climatisation',
      'climatiseur monosplit multisplit gainable',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique/travaux' },
    { name: 'Climatisation', url: PAGE_PATH },
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
              { label: 'Climatisation' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Snowflake className="w-3.5 h-3.5" aria-hidden />
              Climatisation &middot; Installation et dépannage
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Prix installation climatisation en 2026 : monosplit, multisplit, gainable
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              En 2026, faire installer une climatisation coûte <strong>1 500-3 500 €</strong> pour
              un monosplit, <strong>3 000-8 000 €</strong> pour un multisplit 2-5 unités, et{' '}
              <strong>6 000-15 000 €</strong> pour un système gainable centralisé. La pose doit être
              réalisée par un <strong>frigoriste attesté fluides catégorie I</strong> (Décret
              2015-1790). La climatisation réversible peut être éligible CEE BAR-TH-129 avec un
              installateur RGE QualiPAC.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Les 4 types de climatisation en 2026</h2>
            <p>
              Le choix dépend de la surface à rafraîchir, du nombre de pièces, du budget et de la
              capacité à passer des gaines :
            </p>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Type</th>
                    <th className="p-3 border-b border-sand-200">Prix posé</th>
                    <th className="p-3 border-b border-sand-200 hidden md:table-cell">
                      Couverture
                    </th>
                    <th className="p-3 border-b border-sand-200 hidden md:table-cell">
                      Durée de vie
                    </th>
                    <th className="p-3 border-b border-sand-200 hidden lg:table-cell">Note</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {TYPES_CLIM.map((row) => (
                    <tr key={row.type} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold whitespace-nowrap">{row.type}</td>
                      <td className="p-3 font-semibold text-primary-800 whitespace-nowrap">
                        {row.prix}
                      </td>
                      <td className="p-3 hidden md:table-cell whitespace-nowrap">
                        {row.couverture}
                      </td>
                      <td className="p-3 hidden md:table-cell whitespace-nowrap">{row.duree}</td>
                      <td className="p-3 text-sand-600 hidden lg:table-cell">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Tarifs nationaux 2026, hors options gainage / faux-plafond. TVA 10 % en logement
                &gt; 2 ans avec artisan.
              </p>
            </div>

            <h2>5 facteurs qui font varier le prix</h2>
            <div className="not-prose grid gap-3 my-6">
              {FACTEURS_PRIX.map((factor) => (
                <div
                  key={factor.title}
                  className="bg-white border border-sand-200 rounded-lg p-4 flex items-start gap-3"
                >
                  <Calculator className="w-5 h-5 text-primary-700 shrink-0 mt-0.5" aria-hidden />
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between gap-2 flex-wrap">
                      <p className="font-semibold text-sand-900 m-0">{factor.title}</p>
                      <span className="text-xs font-semibold text-primary-800 bg-primary-50 px-2 py-0.5 rounded">
                        {factor.impact}
                      </span>
                    </div>
                    <p className="text-sm text-sand-700 m-0 mt-1">{factor.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <h2>Vos obligations légales 2026</h2>
            <div className="not-prose grid gap-3 my-6">
              {REGLEMENT.map((item) => (
                <div
                  key={item.title}
                  className="bg-white border border-amber-200 rounded-lg p-4 flex items-start gap-3"
                >
                  <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
                  <div className="flex-1">
                    <p className="font-semibold text-sand-900 m-0">{item.title}</p>
                    <p className="text-sm text-sand-700 m-0 mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="not-prose border-2 border-amber-300 bg-amber-50 rounded-lg p-5 my-6">
              <div className="flex items-start gap-3">
                <Volume2 className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" aria-hidden />
                <div>
                  <p className="font-semibold text-amber-900 m-0">
                    Bruit voisinage : 35 dB(A) jour / 30 dB(A) nuit en limite mitoyenne
                  </p>
                  <p className="text-sm text-amber-900 mt-2 mb-0">
                    Avant installation, vérifier le niveau sonore de l’unité extérieure (dB(A) à 1
                    m, fournisseur), prévoir un éloignement de la limite mitoyenne ≥ 3-5 m, ou
                    installer un caisson acoustique. Plainte voisinage = pouvoir du maire, sanction
                    jusqu’à 1 500 € (Arrêté 5/12/2006). Anticiper, c’est moins cher que déplacer
                    l’unité après coup.
                  </p>
                </div>
              </div>
            </div>

            <h2>5 critères pour choisir un frigoriste</h2>
            <div className="not-prose grid gap-3 my-6">
              {QUI_CHOISIR.map((item) => (
                <div
                  key={item.title}
                  className="bg-white border border-sand-200 rounded-lg p-4 flex items-start gap-3"
                >
                  <HardHat className="w-5 h-5 text-primary-700 shrink-0 mt-0.5" aria-hidden />
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between gap-2 flex-wrap">
                      <p className="font-semibold text-sand-900 m-0">{item.title}</p>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded ${
                          item.must === 'Obligatoire'
                            ? 'text-red-800 bg-red-50'
                            : 'text-amber-800 bg-amber-50'
                        }`}
                      >
                        {item.must}
                      </span>
                    </div>
                    <p className="text-sm text-sand-700 m-0 mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Wrench className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Demandez 3 devis climatisation en 2 minutes
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    3 frigoristes vérifiés vous répondent sous 48 h. Devis avec étude thermique,
                    bilan acoustique, marque + référence, SEER + SCOP, et garantie pose.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/devis"
                      className="inline-flex items-center gap-1.5 bg-primary-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-800 transition-colors"
                    >
                      Demander 3 devis <ArrowRight className="w-4 h-4" aria-hidden />
                    </Link>
                    <Link
                      href="/rge/renovation-energetique"
                      className="inline-flex items-center gap-1.5 bg-white text-primary-700 border border-primary-200 px-4 py-2 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
                    >
                      Annuaire frigoristes <ArrowRight className="w-4 h-4" aria-hidden />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <h2>Aide au calcul : votre budget climatisation 2026</h2>
            <ul>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden /> Salon{' '}
                <strong>30 m²</strong> seul : monosplit 2 000-3 000 € posé.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden /> T3{' '}
                <strong>70 m²</strong> (salon + 2 chambres) : multisplit 3 unités 4 500-6 500 €.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden /> T4-T5{' '}
                <strong>100-130 m²</strong> : multisplit 4-5 unités 6 000-9 000 €.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden /> Maison{' '}
                <strong>150-200 m²</strong> en gainable centralisé : 10 000-15 000 €.
              </li>
              <li>
                <AlertTriangle className="inline w-4 h-4 text-amber-700 mr-1" aria-hidden /> Si
                réversible RGE QualiPAC + SCOP/SEER conformes BAR-TH-129 : prime CEE selon arrêté en
                vigueur 2026 (à vérifier sur france-renov.gouv.fr).
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
              href="/renovation-energetique/travaux"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Hub Travaux
            </Link>
            <Link
              href="/renovation-energetique/travaux/pompe-a-chaleur/air-air-prix"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              PAC air-air <ArrowRight className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
