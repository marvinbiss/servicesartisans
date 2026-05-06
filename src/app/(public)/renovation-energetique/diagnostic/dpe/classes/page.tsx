/**
 * Page : /renovation-energetique/diagnostic/dpe/classes
 *
 * @kw-primary    classe dpe
 * @kw-volume     1500
 * @kw-kd         3
 * @kw-cpc        0.55
 * @intent        info
 * @cluster       reno-energetique-diagnostic-dpe-classes
 * @ahrefs-source docs/ahrefs-audit-2026-04/MASTER-PLAN-03-CONTENT.md (KW secondaires DPE)
 * @snapshot      2026-05-06 (Bloc 1 + estimation snapshot — quota Ahrefs API restreint)
 * @backlog-item  Sprint 3 orphelin DPE classes A-G recap
 *
 * KW cibles (estimés Bloc 1 + variants long-tail — à re-valider Ahrefs après reset 18/05) :
 * - "classe dpe"               → ~1 500 vol, KD ~3 (PIVOT)
 * - "classes dpe"              → ~400 vol, KD 1
 * - "dpe classe g"             → 8 000 vol (passoire — voir /passoires-thermiques/ aussi)
 * - "dpe classe f"             → ~600 vol, KD 0
 * - "dpe classe e"             → ~400 vol, KD 0
 * - "dpe classe d"             → ~300 vol, KD 0
 * - "dpe classe c"             → ~300 vol, KD 0
 * - "dpe classe b"             → ~150 vol, KD 0
 * - "dpe classe a"             → ~250 vol, KD 0
 * - "lettre dpe"               → ~150 vol, KD 1
 * - "etiquette dpe"            → ~600 vol, KD 5
 * - Famille cumulée pivot : ~5 100 vol/mois (KD 0-5 = orphan easy win)
 *
 * Easy win : OUI ABSOLU sur les sub-classes A-G (KD 0-1, intent informationnel pur)
 * Cluster pillar : Rénovation Énergétique → Diagnostic → DPE → Classes A-G
 *
 * Anti-cannibalisation :
 *   - Hub /diagnostic/dpe/ = panorama global DPE (méthode, prix, opposabilité)
 *   - /diagnostic/dpe/location/ = focus calendrier interdiction location G/F/E
 *   - /diagnostic/dpe/validite/ = focus durée 10 ans + invalidations DPE 2007-2021
 *   - /passoires-thermiques/ = focus loi G/F + travaux obligatoires
 *   - Cette page = RECAP exhaustif des 7 lettres (A-G) avec, pour chacune :
 *     conso kWh/m²/an + GES kg CO₂/m²/an + impact location/vente + travaux conseillés.
 *
 * E-E-A-T YMYL : sources officielles obligatoires
 *   - Arrêté 31 mars 2021 (méthode 3CL-2021, seuils classes A-G)
 *   - Loi Climat et Résilience n° 2021-1104 du 22 août 2021 (interdictions G/F/E)
 *   - Décret 2021-19 (étiquette énergie + GES)
 *   - Observatoire DPE-Audit ADEME (vérification numéro)
 *   - France Rénov' (aides par classe)
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  AlertTriangle,
  Calculator,
  CheckCircle2,
  ClipboardCheck,
  Coins,
  Flame,
  Leaf,
  ShieldCheck,
  TrendingDown,
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

const PAGE_PATH = '/renovation-energetique/diagnostic/dpe/classes'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'sophie-martin'
const AUTHOR_NAME = 'Sophie Martin'

const TITLE = 'Classes DPE 2026 : A à G expliquées (seuils, GES, location, aides)'
const DESCRIPTION =
  'Classes DPE A à G en 2026 : seuils kWh/m²/an et GES kg CO₂/m², impact location et vente, travaux pour changer de classe. Méthode 3CL-2021 officielle.'

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
  'Le DPE classe un logement de A (très performant ≤ 70 kWh/m²/an) à G (≤ 420 kWh/m²/an, passoire thermique).',
  'Méthode 3CL-2021 (arrêté 31/03/2021) : seuils combinent énergie primaire + émissions CO₂. La pire des deux note retenue.',
  'Loi Climat 2021 : G interdit à la location dès 1er janvier 2025, F au 1er janvier 2028, E au 1er janvier 2034.',
  'Une classe DPE améliorée de 2 lettres (ex. E → C) valorise un bien de +5 à +14 % à la revente (étude Notaires de France).',
  'Travaux pour changer de classe : isolation combles + ITE + PAC ou chauffe-eau thermodynamique = saut typique 2-3 lettres.',
  'Aides MaPrimeRénov’ Parcours accompagné majorées si saut ≥ 2 classes (jusqu’à +10 % bonus + sortie passoire +1 500 €).',
]

const CLASSES = [
  {
    lettre: 'A',
    couleur: 'bg-emerald-600 text-white',
    bordure: 'border-emerald-300',
    fond: 'bg-emerald-50',
    label: 'Très performant',
    energie: '≤ 70 kWh/m²/an',
    ges: '≤ 6 kg CO₂/m²/an',
    facture: '~ 250 - 600 €/an pour 100 m²',
    location: 'Aucune restriction',
    travaux:
      'Aucun, mais maintenir : entretien PAC, ventilation, étanchéité fenêtres. Bonus revente +10 à +15 %.',
    parc: '1 % du parc français (ex. maisons RT 2012/RE 2020 récentes).',
  },
  {
    lettre: 'B',
    couleur: 'bg-emerald-500 text-white',
    bordure: 'border-emerald-200',
    fond: 'bg-emerald-50',
    label: 'Très performant',
    energie: '71 → 110 kWh/m²/an',
    ges: '7 → 11 kg CO₂/m²/an',
    facture: '~ 500 - 900 €/an pour 100 m²',
    location: 'Aucune restriction',
    travaux:
      'Optionnel : passage A possible avec auto-conso solaire 3 kWc + remplacement chauffe-eau classique → thermodynamique.',
    parc: '4 % du parc français.',
  },
  {
    lettre: 'C',
    couleur: 'bg-lime-500 text-white',
    bordure: 'border-lime-200',
    fond: 'bg-lime-50',
    label: 'Performant',
    energie: '111 → 180 kWh/m²/an',
    ges: '12 → 30 kg CO₂/m²/an',
    facture: '~ 700 - 1 300 €/an pour 100 m²',
    location: 'Aucune restriction',
    travaux:
      'Optionnel : amélioration ITE 8-10 cm pour passer en B. Saut C → A souvent infaisable sans rénovation lourde.',
    parc: '24 % du parc français.',
  },
  {
    lettre: 'D',
    couleur: 'bg-yellow-400 text-yellow-950',
    bordure: 'border-yellow-200',
    fond: 'bg-yellow-50',
    label: 'Médiocre',
    energie: '181 → 250 kWh/m²/an',
    ges: '31 → 50 kg CO₂/m²/an',
    facture: '~ 900 - 1 700 €/an pour 100 m²',
    location: 'Aucune restriction immédiate, mais travaux conseillés avant 2030.',
    travaux:
      'Recommandé : isolation combles 30 cm + remplacement chaudière fioul → PAC. Saut D → B plausible (~ 18 000 € HTVA, après aides ~ 6 000-9 000 €).',
    parc: '30 % du parc français.',
  },
  {
    lettre: 'E',
    couleur: 'bg-orange-400 text-white',
    bordure: 'border-orange-200',
    fond: 'bg-orange-50',
    label: 'Mauvais',
    energie: '251 → 330 kWh/m²/an',
    ges: '51 → 70 kg CO₂/m²/an',
    facture: '~ 1 300 - 2 200 €/an pour 100 m²',
    location: 'Interdiction location au 1er janvier 2034 (Loi Climat 2021 art. 160).',
    travaux:
      'Obligatoire avant 2034 : isolation combles + ITE + chauffage performant. Saut E → C accessible (~ 25 000 € HTVA, après aides ~ 9 000-15 000 €).',
    parc: '24 % du parc français.',
  },
  {
    lettre: 'F',
    couleur: 'bg-red-500 text-white',
    bordure: 'border-red-200',
    fond: 'bg-red-50',
    label: 'Passoire thermique',
    energie: '331 → 420 kWh/m²/an',
    ges: '71 → 100 kg CO₂/m²/an',
    facture: '~ 1 800 - 2 800 €/an pour 100 m²',
    location: 'Interdiction location au 1er janvier 2028 (Loi Climat 2021 art. 160).',
    travaux:
      'Audit énergétique obligatoire pour vente. Bouquet 2-3 gestes (ITE + PAC + ventilation) requis. Coût ~ 35 000-50 000 € HTVA, aides MaPrimeRénov’ Parcours accompagné couvrent 40-90 % selon revenus.',
    parc: '11 % du parc français (~ 1,7 million de logements).',
  },
  {
    lettre: 'G',
    couleur: 'bg-red-700 text-white',
    bordure: 'border-red-200',
    fond: 'bg-red-50',
    label: 'Passoire thermique',
    energie: '> 420 kWh/m²/an',
    ges: '> 100 kg CO₂/m²/an',
    facture: '~ 2 500 - 4 000 €/an pour 100 m²',
    location: 'Interdiction location depuis le 1er janvier 2025 (Loi Climat 2021 art. 160).',
    travaux:
      'Audit énergétique obligatoire pour vente (depuis avril 2023). Rénovation globale typique. Coût ~ 50 000-90 000 € HTVA, MaPrimeRénov’ Parcours accompagné couvre 40-90 % + bonus sortie passoire 1 500 €.',
    parc: '6 % du parc français (~ 1 million de logements).',
  },
]

const SEUILS_DOUBLE = [
  {
    letter: 'A',
    enr: '0 → 70',
    ges: '0 → 6',
    note: 'Plus restrictif des 2 fixe la classe finale.',
  },
  { letter: 'B', enr: '71 → 110', ges: '7 → 11', note: '' },
  { letter: 'C', enr: '111 → 180', ges: '12 → 30', note: '' },
  { letter: 'D', enr: '181 → 250', ges: '31 → 50', note: '' },
  { letter: 'E', enr: '251 → 330', ges: '51 → 70', note: '' },
  {
    letter: 'F',
    enr: '331 → 420',
    ges: '71 → 100',
    note: 'Maison fioul C en énergie peut basculer F par GES.',
  },
  { letter: 'G', enr: '> 420', ges: '> 100', note: '' },
]

const CALENDRIER_INTERDICTION = [
  {
    date: '1er janvier 2023',
    classe: 'G+ (> 450 kWh/m²/an)',
    interdiction: 'Hausse loyer interdite (loi Climat).',
  },
  {
    date: 'Avril 2023',
    classe: 'F et G',
    interdiction: 'Audit énergétique obligatoire pour vente (maisons individuelles).',
  },
  {
    date: '1er janvier 2025',
    classe: 'G',
    interdiction: 'Interdiction de mise en location nouveau bail.',
  },
  {
    date: '1er janvier 2028',
    classe: 'F',
    interdiction: 'Interdiction de mise en location nouveau bail.',
  },
  {
    date: '1er janvier 2034',
    classe: 'E',
    interdiction: 'Interdiction de mise en location nouveau bail (extension prévue Loi Climat).',
  },
]

const SAUT_CLASSES = [
  {
    depart: 'F → C',
    travaux: 'ITE 14 cm + isolation combles 35 cm + PAC air-eau 10 kW + VMC double flux',
    cout: '40 000 - 55 000 €',
    aides: '24 000 - 38 000 €',
    rac: '~ 14 000 - 20 000 €',
  },
  {
    depart: 'E → C',
    travaux: 'ITE 12 cm + isolation combles 30 cm + PAC air-eau ou chauffage gaz à condensation',
    cout: '25 000 - 35 000 €',
    aides: '12 000 - 22 000 €',
    rac: '~ 10 000 - 15 000 €',
  },
  {
    depart: 'D → B',
    travaux: 'Isolation combles 30 cm + remplacement chaudière fioul → PAC + DV menuiseries',
    cout: '18 000 - 25 000 €',
    aides: '6 000 - 12 000 €',
    rac: '~ 9 000 - 14 000 €',
  },
  {
    depart: 'C → A',
    travaux: 'Auto-conso solaire 3 kWc + chauffe-eau thermodynamique + ventilation double flux',
    cout: '15 000 - 22 000 €',
    aides: '4 000 - 8 000 €',
    rac: '~ 9 000 - 14 000 €',
  },
]

const faqs = [
  {
    question: 'Comment est calculée la classe DPE en 2026 ?',
    answer:
      'Méthode 3CL-2021 (arrêté du 31 mars 2021) : calcul de l’énergie primaire annuelle (kWh/m²/an) ET des émissions GES (kg CO₂/m²/an). La classe finale retenue est la PIRE des deux. Exemple : un logement bien isolé chauffé au fioul peut être classe C en énergie mais E en GES → classe E. Le calcul prend en compte 5 usages (chauffage, ECS, climatisation, éclairage, ventilation), la zone climatique, l’altitude et le type de bâti.',
  },
  {
    question: 'Quelle est la pire classe DPE et que devient un logement classé G ?',
    answer:
      'La classe G est la pire (consommation > 420 kWh/m²/an). Depuis le 1er janvier 2025, ces logements ne peuvent plus être loués sous nouveau bail (Loi Climat et Résilience 2021 art. 160). Pour la vente, un audit énergétique est obligatoire depuis avril 2023. Les propriétaires bailleurs G doivent rénover ou vendre. Aides Parcours accompagné MaPrimeRénov’ couvrent 40 à 90 % des travaux selon les revenus, avec bonus sortie de passoire 1 500 €.',
  },
  {
    question: 'Comment passer d’une classe E à une classe C ?',
    answer:
      'Saut typique 2 lettres (E → C) accessible avec un bouquet de 3 gestes : isolation combles 30 cm + ITE 12 cm OU isolation thermique intérieure (ITI) + remplacement du chauffage (chaudière fioul → PAC air-eau ou chaudière gaz à condensation). Coût total HTVA : 25 000-35 000 €. Aides cumulées (MPR + CEE + TVA 5,5 %) : 12 000-22 000 €. Reste à charge ménage : ~ 10 000-15 000 €. Avec MaPrimeRénov’ Parcours accompagné, le reste à charge tombe à 1 000-3 000 € pour les foyers très modestes.',
  },
  {
    question: 'Une classe DPE améliorée valorise-t-elle vraiment un bien à la revente ?',
    answer:
      'Oui. Étude Notaires de France 2026 : un saut de 2 classes (D → B, E → C) valorise un bien de +5 à +14 % en moyenne, avec une variation forte selon la région. Exemple : maison D 250 000 € passant en B → revente à 270 000-285 000 €. À l’inverse, une passoire G subit une décote de -10 à -22 % vs un bien équivalent en C. La « valeur verte » s’est nettement renforcée depuis 2022, accélérée par la loi Climat.',
  },
  {
    question: 'Mon DPE indique 2 classes différentes (énergie + GES) : laquelle compte ?',
    answer:
      'Sur l’étiquette officielle DPE 2026, 2 lettres apparaissent : la lettre principale (énergie primaire kWh/m²/an) et la lettre GES (émissions kg CO₂/m²/an). La classe DPE finale = la PIRE des deux. Exemple : énergie B (90 kWh) + GES F (75 kg) = classe DPE finale F. C’est la lettre la plus défavorable qui détermine l’interdiction de location et l’obligation d’audit. Demandez explicitement les 2 valeurs à votre diagnostiqueur.',
  },
  {
    question: 'Combien coûte un DPE en 2026 ?',
    answer:
      'Entre 100 et 250 € TTC selon la surface et la région (Paris ~ 220 €, province ~ 130 €). Le DPE est obligatoire pour : vente immobilière, mise en location, construction neuve. Validité 10 ans (article R126-15 CCH). Choisissez un diagnostiqueur certifié COFRAC inscrit sur l’annuaire du ministère (diagnostiqueurs.din.developpement-durable.gouv.fr). Refusez les offres < 80 € : risque de DPE non conforme et opposable.',
  },
  {
    question: 'Quelle classe DPE pour louer ou vendre en 2026 ?',
    answer:
      'Pour LOUER en 2026 : classes A à F autorisées. G interdit (depuis 1er janvier 2025). Pour VENDRE : aucune restriction sur la classe, mais les passoires F et G doivent fournir un audit énergétique en complément du DPE (depuis avril 2023). Les acquéreurs peuvent négocier une décote sur les classes E-F-G. Pour anticiper : F sera interdit location au 1er janvier 2028, E au 1er janvier 2034.',
  },
  {
    question: 'MaPrimeRénov’ varie-t-elle selon la classe DPE de départ ?',
    answer:
      'Oui. MaPrimeRénov’ Parcours accompagné (rénovation globale ≥ 2 classes) majore les aides selon le saut : saut 2 classes = barème standard ; saut 3-4 classes = bonus +10 % ; sortie de passoire (G ou F → ≥ E) = bonus 1 500 €. MaPrimeRénov’ par geste reste accessible quelle que soit la classe DPE de départ, mais les ménages classes F-G sont prioritaires pour le Parcours accompagné (avec accompagnateur agréé France Rénov’).',
  },
]

const sources = [
  {
    label: 'Légifrance — Arrêté 31 mars 2021 (méthode 3CL-2021 DPE)',
    url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000043303530',
  },
  {
    label: 'Légifrance — Loi Climat n° 2021-1104 art. 160 (interdiction passoires)',
    url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000043956924',
  },
  {
    label: 'France Rénov’ — Comprendre le DPE',
    url: 'https://france-renov.gouv.fr/diagnostic-performance-energetique',
  },
  {
    label: 'ADEME — Observatoire DPE-Audit (vérification numéro)',
    url: 'https://observatoire-dpe-audit.ademe.fr',
  },
  {
    label: 'Notaires de France — Valeur verte des logements 2026',
    url: 'https://www.notaires.fr',
  },
  {
    label: 'Annuaire diagnostiqueurs certifiés COFRAC (Ministère)',
    url: 'https://diagnostiqueurs.din.developpement-durable.gouv.fr',
  },
]

const relatedPages = [
  {
    label: 'DPE classe G — seuils, conséquences, sauts ROI',
    href: '/renovation-energetique/diagnostic/dpe/classes/g',
  },
  {
    label: 'Hub DPE — méthode, prix, opposabilité',
    href: '/renovation-energetique/diagnostic/dpe',
  },
  {
    label: 'DPE location — interdictions G/F/E',
    href: '/renovation-energetique/diagnostic/dpe/location',
  },
  {
    label: 'Validité DPE — durée 10 ans, vérification',
    href: '/renovation-energetique/diagnostic/dpe/validite',
  },
  {
    label: 'Passoires thermiques — obligations 2025-2034',
    href: '/renovation-energetique/passoires-thermiques',
  },
  {
    label: 'MaPrimeRénov’ Parcours accompagné',
    href: '/aides/maprimerenov',
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
    section: 'Diagnostic — DPE — Classes A-G',
    keywords: [
      'classe dpe',
      'classes dpe',
      'dpe classe a',
      'dpe classe g',
      'lettre dpe',
      'etiquette dpe',
      'seuils dpe 3cl',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Diagnostic', url: '/renovation-energetique/diagnostic' },
    { name: 'DPE', url: '/renovation-energetique/diagnostic/dpe' },
    { name: 'Classes A à G', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const govSchema = getGovernmentServiceSchema({
    name: 'Classes DPE A-G : seuils 3CL-2021 et obligations Loi Climat',
    description:
      'Cadre réglementaire des classes DPE A à G en France : méthode 3CL-2021 (arrêté 31/03/2021), interdictions location passoires G (2025), F (2028), E (2034) selon Loi Climat 2021.',
    url: PAGE_URL,
    serviceType: 'Référentiel performance énergétique logement',
    audience: 'Propriétaires occupants, bailleurs, acquéreurs, locataires',
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
              { label: 'Diagnostic', href: '/renovation-energetique/diagnostic' },
              { label: 'DPE', href: '/renovation-energetique/diagnostic/dpe' },
              { label: 'Classes A à G' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <ClipboardCheck className="w-3.5 h-3.5" aria-hidden />
              DPE &middot; Classes énergétiques 2026
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Classes DPE A à G : guide complet 2026
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Le DPE classe les logements de <strong>A (très performant)</strong> à{' '}
              <strong>G (passoire thermique)</strong> selon leur consommation et leurs émissions de
              CO₂. Voici les seuils officiels (méthode 3CL-2021), les obligations Loi Climat, les
              factures typiques par classe et les travaux pour passer de F-G à C-D.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Les 7 classes DPE A à G en détail</h2>
            <p>
              Chaque classe combine un seuil <strong>énergie primaire</strong> (kWh/m²/an) et un
              seuil <strong>GES</strong> (kg CO₂/m²/an). La classe DPE finale est toujours{' '}
              <strong>la pire des deux</strong>. Une maison classée C en énergie mais F en GES (cas
              fréquent fioul) recevra l’étiquette F.
            </p>

            <div className="not-prose grid gap-4 my-6">
              {CLASSES.map((c) => (
                <div key={c.lettre} className={`border-2 ${c.bordure} ${c.fond} rounded-xl p-5`}>
                  <div className="flex items-start gap-4">
                    <div
                      className={`${c.couleur} w-14 h-14 rounded-lg flex items-center justify-center font-heading text-3xl font-bold shrink-0`}
                      aria-hidden
                    >
                      {c.lettre}
                    </div>
                    <div className="flex-1">
                      <p className="font-heading text-lg font-semibold text-sand-900 m-0">
                        Classe {c.lettre} — {c.label}
                      </p>
                      <div className="grid sm:grid-cols-2 gap-x-4 gap-y-2 mt-3 text-sm">
                        <p className="m-0">
                          <Flame className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                          <strong>Énergie :</strong> {c.energie}
                        </p>
                        <p className="m-0">
                          <Leaf className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                          <strong>GES :</strong> {c.ges}
                        </p>
                        <p className="m-0">
                          <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                          <strong>Facture :</strong> {c.facture}
                        </p>
                        <p className="m-0">
                          <ShieldCheck
                            className="inline w-4 h-4 text-primary-700 mr-1"
                            aria-hidden
                          />
                          <strong>Location :</strong> {c.location}
                        </p>
                      </div>
                      <p className="text-sm text-sand-700 mt-3 mb-1">
                        <strong>Travaux :</strong> {c.travaux}
                      </p>
                      <p className="text-xs text-sand-600 m-0 italic">{c.parc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <h2>Comment lire l’étiquette DPE 2026 (énergie + GES)</h2>
            <p>
              Depuis 2021, l’étiquette DPE affiche <strong>2 lettres distinctes</strong> : la classe
              énergie (consommation primaire) et la classe GES (gaz à effet de serre). La classe
              finale retenue est la pire des deux. Cette double lecture pénalise particulièrement
              les chauffages fioul et gaz, même dans des maisons bien isolées.
            </p>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Classe</th>
                    <th className="p-3 border-b border-sand-200">Énergie (kWh/m²/an)</th>
                    <th className="p-3 border-b border-sand-200">GES (kg CO₂/m²/an)</th>
                    <th className="p-3 border-b border-sand-200 hidden md:table-cell">Note</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {SEUILS_DOUBLE.map((row) => (
                    <tr key={row.letter} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold">{row.letter}</td>
                      <td className="p-3 whitespace-nowrap">{row.enr}</td>
                      <td className="p-3 whitespace-nowrap">{row.ges}</td>
                      <td className="p-3 text-sand-600 hidden md:table-cell">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Seuils officiels arrêté du 31 mars 2021 (méthode 3CL-2021). Source : Légifrance.
              </p>
            </div>

            <h2>Calendrier des interdictions Loi Climat 2021</h2>
            <p>
              La Loi Climat et Résilience (n° 2021-1104) interdit progressivement la location des
              passoires thermiques. Voici les échéances officielles à respecter pour les bailleurs.
            </p>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Date</th>
                    <th className="p-3 border-b border-sand-200">Classe ciblée</th>
                    <th className="p-3 border-b border-sand-200">Conséquence</th>
                  </tr>
                </thead>
                <tbody>
                  {CALENDRIER_INTERDICTION.map((row) => (
                    <tr key={row.date} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold whitespace-nowrap">{row.date}</td>
                      <td className="p-3 font-semibold text-red-700 whitespace-nowrap">
                        {row.classe}
                      </td>
                      <td className="p-3 text-sand-700">{row.interdiction}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Source : Loi Climat n° 2021-1104 du 22 août 2021, articles 159-176.
              </p>
            </div>

            <h2>Travaux pour gagner 2-3 classes DPE</h2>
            <p>
              Le saut de classe DPE résulte d’un <strong>bouquet de travaux</strong>, jamais d’un
              geste isolé. Voici 4 scénarios chiffrés observés sur le terrain (maisons individuelles
              100-130 m²) :
            </p>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Saut</th>
                    <th className="p-3 border-b border-sand-200 hidden md:table-cell">Travaux</th>
                    <th className="p-3 border-b border-sand-200">Coût HT</th>
                    <th className="p-3 border-b border-sand-200">Aides</th>
                    <th className="p-3 border-b border-sand-200">Reste</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {SAUT_CLASSES.map((row) => (
                    <tr key={row.depart} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold whitespace-nowrap">{row.depart}</td>
                      <td className="p-3 text-sand-700 hidden md:table-cell">{row.travaux}</td>
                      <td className="p-3 whitespace-nowrap">{row.cout}</td>
                      <td className="p-3 text-primary-800 font-semibold whitespace-nowrap">
                        {row.aides}
                      </td>
                      <td className="p-3 font-semibold whitespace-nowrap">{row.rac}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Coûts indicatifs maison 100-130 m² zone climatique H2. Aides cumulées (MPR + CEE +
                TVA 5,5 %) hors Parcours accompagné majoré. Source : ADEME, baromètre artisans RGE.
              </p>
            </div>

            <h2>Vérifier ou contester sa classe DPE</h2>
            <ul>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Numéro ADEME 13 chiffres :</strong> obligatoire sur tout DPE depuis juillet
                2021. Vérifiable sur observatoire-dpe-audit.ademe.fr (s’il n’existe pas → DPE non
                opposable).
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Diagnostiqueur certifié COFRAC :</strong> annuaire officiel
                diagnostiqueurs.din.developpement-durable.gouv.fr.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Contestation :</strong> propriétaire peut contester sous 1 an si
                inexactitudes (article R134-4-2 CCH). Demander un nouveau DPE, à la charge du
                diagnostiqueur si erreur reconnue.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Maisons avant 1948 :</strong> DPE émis avant 1er juillet 2024 invalides
                (correction arrêté 31 mars 2024). Refaire le DPE.
              </li>
            </ul>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Quels travaux pour passer de classe E-F-G à C ?
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Notre simulateur calcule le bouquet de travaux nécessaires + les aides 2026
                    auxquelles vous avez droit en moins de 2 minutes. Devis local par 3 artisans RGE
                    sous 48h.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/simulateur-aides-renovation"
                      className="inline-flex items-center gap-1.5 bg-primary-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-800 transition-colors"
                    >
                      Simulateur aides <ArrowRight className="w-4 h-4" aria-hidden />
                    </Link>
                    <Link
                      href="/devis"
                      className="inline-flex items-center gap-1.5 bg-white text-primary-700 border border-primary-200 px-4 py-2 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
                    >
                      Demander 3 devis <ArrowRight className="w-4 h-4" aria-hidden />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <h2>Impact d’une classe DPE améliorée à la revente</h2>
            <p>Selon l’étude « Valeur verte des logements » 2026 des Notaires de France :</p>
            <ul>
              <li>
                <TrendingDown className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Saut <strong>F → C</strong> : valorisation +14 % en moyenne (jusqu’à +20 % en zone
                tendue Île-de-France).
              </li>
              <li>
                <TrendingDown className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Saut <strong>E → C</strong> : valorisation +10 % en moyenne, plus rapide à amortir
                (3-5 ans à la revente).
              </li>
              <li>
                <TrendingDown className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Décote passoire <strong>F-G</strong> : -10 à -22 % vs un bien équivalent en C, pire
                dans les régions à forte demande de location étudiante / saisonnière.
              </li>
              <li>
                <AlertTriangle className="inline w-4 h-4 text-amber-700 mr-1" aria-hidden />
                <strong>Attention :</strong> les acquéreurs négocient agressivement les passoires
                depuis 2023. Le coût des travaux est désormais intégré dans la négociation.
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
              href="/renovation-energetique/diagnostic/dpe"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Hub DPE
            </Link>
            <Link
              href="/renovation-energetique/passoires-thermiques"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Passoires thermiques <AlertTriangle className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
