/**
 * Page : /renovation-energetique/diagnostic/dpe/classes/g
 *
 * @kw-primary    dpe classe g
 * @kw-volume     8000
 * @kw-kd         0
 * @kw-cpc        0.45
 * @intent        info
 * @cluster       reno-energetique-diagnostic-dpe-classes-g
 * @ahrefs-source docs/ahrefs-audit-2026-04/STRATEGIE-RENOVATION-ENERGETIQUE.md (Bloc 1 niche v3)
 * @snapshot      2026-05-06 (Bloc 1 + estimation snapshot — quota Ahrefs API restreint, à re-valider 18/05)
 * @backlog-item  Sprint 3 orphelin DPE classe G individuelle (KW orphan single-page le plus volumique)
 *
 * KW cibles (Bloc 1 + estimation longue traîne) :
 * - "dpe classe g"                 → ~8 000 vol, KD 0 ⭐⭐⭐⭐⭐ PIVOT
 * - "classe g dpe"                 → ~600 vol, KD 0
 * - "logement classe g"            → ~300 vol, KD 0
 * - "dpe g"                        → ~500 vol, KD 1 (ambigu mais variant)
 * - "habitation classe g"          → ~150 vol, KD 0
 * - "consommation dpe g"           → ~200 vol, KD 0
 * - Famille cumulée pivot : ~9 750 vol/mois (KD 0-1 = orphan goldmine)
 *
 * Easy win : OUI MAJEUR (KD 0 sur le KW pivot le plus volumique du cluster classes,
 * intent informationnel pur — propriétaires inquiets sur conséquences classe G).
 * Cluster pillar : Rénovation Énergétique → Diagnostic → DPE → Classes A-G → G
 *
 * Anti-cannibalisation :
 *   - Hub /diagnostic/dpe/classes/ = recap A-G panorama (KW "classe dpe" 1500)
 *   - /passoires-thermiques/ = définition passoire + lois + calendrier (KW "passoire thermique" 2959)
 *   - /passoires-thermiques/interdiction-location-g-f/ = focus interdiction LOCATION (1150 cumul)
 *   - /passoires-thermiques/calendrier-2025-2028-2034/ = focus chronologie 3 dates
 *   - Cette page = focus DEEP DIVE classification G (seuils techniques, lecture étiquette,
 *     conséquences VENTE/audit, sauts ROI vers F/E/D/C/B avec coûts détaillés).
 *     Distinct du hub passoires (centré "qu'est-ce qu'une passoire") et de
 *     /interdiction-location-g-f/ (centré bailleur).
 *
 * E-E-A-T YMYL : sources officielles obligatoires
 *   - Arrêté 31 mars 2021 (méthode 3CL-2021, seuils classes A-G)
 *   - Loi Climat et Résilience n° 2021-1104 du 22 août 2021 (interdiction G en 2025)
 *   - Décret 2022-510 (audit énergétique obligatoire à la vente — passoires)
 *   - Observatoire DPE-Audit ADEME (vérification numéro)
 *   - Notaires de France (étude valeur verte 2024 — décote DPE G)
 *   - France Rénov' (aides MaPrimeRénov' Parcours accompagné)
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  AlertTriangle,
  Calculator,
  Flame,
  Leaf,
  Receipt,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
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

const PAGE_PATH = '/renovation-energetique/diagnostic/dpe/classes/g'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'sophie-martin'
const AUTHOR_NAME = 'Sophie Martin'

const TITLE = 'DPE classe G 2026 : seuils, conséquences et travaux pour sortir'
const DESCRIPTION =
  'DPE classe G en 2026 : > 420 kWh/m²/an + > 100 kg CO₂/m². Location interdite depuis 2025, audit énergétique obligatoire à la vente, décote 10-15 %. 5 sauts G→F/E/D/C/B chiffrés.'

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
  'DPE classe G : consommation > 420 kWh/m²/an OU émissions > 100 kg CO₂/m²/an (la pire des deux note retenue, méthode 3CL-2021).',
  'Représente ~1,8 million de logements en France, soit 6 % du parc résidentiel principal (INSEE / ADEME 2024).',
  'Interdiction de mise en location depuis le 1er janvier 2025 (loi Climat 2021) : nouveaux baux et renouvellements.',
  'Vente : audit énergétique obligatoire (décret 2022-510) + décote constatée 10-15 % vs équivalent classe D (étude Notaires de France 2024).',
  'Travaux pour sortir : un saut G → E coûte typiquement 18-30 K€, après aides MaPrimeRénov’ Parcours accompagné 8-15 K€ reste à charge.',
  'Aides majorées : MaPrimeRénov’ jusqu’à 70 K€ + bonus passoire +10 % + bonus sortie passoire 1 500 € + éco-PTZ 50 K€ cumulables.',
]

const SEUILS_G = [
  {
    indicateur: 'Consommation énergie primaire',
    seuil: '> 420 kWh/m²/an',
    detail:
      'Mesurée sur 5 usages réglementaires : chauffage, ECS, refroidissement, éclairage, auxiliaires.',
  },
  {
    indicateur: 'Émissions CO₂',
    seuil: '> 100 kg CO₂/m²/an',
    detail:
      'Calculées en équivalent CO₂ par m² SHAB. Si dépassé seul → classe G même si conso < 420.',
  },
  {
    indicateur: 'Facture énergétique annuelle',
    seuil: '~ 2 500 - 4 000 €/an',
    detail:
      'Estimation pour 100 m² aux prix gaz/électricité 2026. Peut dépasser 5 000 €/an si chauffage tout-électrique.',
  },
]

const CONSEQUENCES_VENTE = [
  {
    icon: Receipt,
    titre: 'Audit énergétique obligatoire',
    detail:
      'Décret 2022-510 du 8 avril 2022 : depuis le 1er avril 2023, toute vente d’une maison individuelle classée F ou G impose un audit énergétique réglementaire (~ 500-1 200 €) avant signature du compromis. L’audit propose deux scénarios chiffrés de rénovation et reste valide 5 ans.',
  },
  {
    icon: TrendingDown,
    titre: 'Décote 10-15 % sur le prix',
    detail:
      'Étude Notaires de France 2024 sur 200 K transactions : un DPE G subit en moyenne une décote de 11 % vs un D équivalent (région, surface, ancienneté). Forte hétérogénéité : 5-7 % en zones rurales, 15-20 % en zones tendues (Paris, Lyon).',
  },
  {
    icon: AlertTriangle,
    titre: 'Délai de vente x 1,5 à 2',
    detail:
      'Données SeLoger / Meilleurs Agents 2024 : un G met en moyenne 130 jours à se vendre vs 75 jours pour la moyenne nationale. Acheteurs réticents (banques durcissent les prêts si DPE G : LCL exclut, BNP applique surcote).',
  },
  {
    icon: ShieldAlert,
    titre: 'Mention "logement très énergivore"',
    detail:
      'Toute annonce immobilière (papier, web, vitrine) doit mentionner la classe G + l’étiquette GES + la mention "logement à consommation énergétique excessive" depuis le 1er janvier 2022. Sanction administrative jusqu’à 15 K€ pour annonce non conforme.',
  },
]

const SAUTS_G = [
  {
    saut: 'G → F',
    cout: '6 - 12 K€',
    aides: '3 - 7 K€',
    reste: '3 - 5 K€',
    travaux: 'Isolation combles 30 cm + remplacement fenêtres simple vitrage → double vitrage.',
    impact:
      '~ 800 €/an économies. Sortie classe G mais reste passoire F (interdite location 2028).',
    rentabilite: 'ROI 6-8 ans. Solution minimum pour vendre, pas pour louer.',
  },
  {
    saut: 'G → E',
    cout: '18 - 30 K€',
    aides: '8 - 15 K€',
    reste: '10 - 15 K€',
    travaux:
      'Combles + ITE 14 cm + remplacement chaudière fioul/gaz → PAC air/eau ou poêle à granulés.',
    impact: '~ 1 500 €/an économies. Sortie passoire complète (location autorisée jusqu’à 2034).',
    rentabilite: 'ROI 10-13 ans. Solution équilibrée pour bailleur prudent jusqu’en 2034.',
  },
  {
    saut: 'G → D',
    cout: '30 - 45 K€',
    aides: '15 - 22 K€',
    reste: '15 - 23 K€',
    travaux:
      'Combles + ITE 16 cm + PAC + ballon thermodynamique + VMC hygroréglable. Audit énergétique recommandé.',
    impact: '~ 1 900 €/an économies. Bonus sortie passoire +1 500 €.',
    rentabilite:
      'ROI 12-15 ans. Recommandé pour bailleur long terme + éligible Parcours accompagné.',
  },
  {
    saut: 'G → C',
    cout: '45 - 65 K€',
    aides: '22 - 35 K€',
    reste: '23 - 30 K€',
    travaux:
      'Rénovation globale BBC : combles 40 cm + ITE 20 cm + planchers bas + PAC réversible + VMC double flux + menuiseries triple vitrage.',
    impact: '~ 2 500 €/an économies. Valeur verte +5-10 % à la revente.',
    rentabilite: 'ROI 18-25 ans, mais accroissement valeur immobilière compense souvent.',
  },
  {
    saut: 'G → B',
    cout: '70 - 110 K€',
    aides: '35 - 55 K€',
    reste: '35 - 55 K€',
    travaux:
      'Rénovation BBC complète + photovoltaïque autoconsommation 3-6 kWc + ECS solaire ou thermodynamique. Niveau RT 2012 minimum.',
    impact: '~ 3 200 €/an économies + production solaire 800-1 800 €/an.',
    rentabilite: 'ROI 22-30 ans. Justifié pour résidence principale long terme uniquement.',
  },
]

const TRAVAUX_PRIORITES = [
  {
    rang: 1,
    titre: 'Audit énergétique RGE (500 - 1 200 €)',
    detail:
      'Étape ZÉRO obligatoire pour toute rénovation > 1 geste. Diagnostic complet bâti, propose 2 scénarios de travaux chiffrés et hiérarchisés. Indispensable pour MaPrimeRénov’ Parcours accompagné. Réalisé par un auditeur RGE Audit énergétique (qualibat ECO Artisan, Qualifelec, Cerqual).',
  },
  {
    rang: 2,
    titre: 'Isolation combles ou toiture (3 - 8 K€)',
    detail:
      'Geste le plus rentable (60-80 % retour sur investissement après aides MaPrimeRénov’ + CEE). Combles perdus : isolant soufflé R ≥ 7 m².K/W. Combles aménagés : panneaux entre chevrons R ≥ 6. Toiture terrasse : R ≥ 4,5 minimum.',
  },
  {
    rang: 3,
    titre: 'Remplacement chauffage énergivore (8 - 18 K€)',
    detail:
      'Si chaudière fioul/gaz fioul-gaz > 15 ans ou cumulus électrique seul : passage à PAC air/eau (RGE QualiPAC) ou poêle à granulés (Qualibois module Air/Eau). Sortie chauffage fossile = critère prioritaire CEE Coup de pouce.',
  },
  {
    rang: 4,
    titre: 'ITE ou ITI murs (15 - 30 K€)',
    detail:
      'Isolation thermique extérieure (ITE) > intérieure (ITI) si façade rénovable. R ≥ 3,7 m².K/W. ITE évite ponts thermiques + préserve surface habitable. Aide CEE 75 €/m² isolant (selon revenus). Travaux RGE Qualibat 7141 ou 7131 obligatoire.',
  },
  {
    rang: 5,
    titre: 'Ventilation + menuiseries (4 - 12 K€)',
    detail:
      'VMC hygroréglable type B (1 500-3 000 € posée) ou double flux (5 000-8 000 €) si rénovation globale. Remplacement fenêtres simple vitrage → double vitrage à isolation renforcée Uw ≤ 1,3 W/m².K (sauf si murs encore non isolés : prioriser ITE).',
  },
]

const sources = [
  {
    label: 'Arrêté du 31 mars 2021 — méthode 3CL-2021 (seuils DPE)',
    url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000043301471',
  },
  {
    label: 'Loi Climat et Résilience n° 2021-1104 (interdiction location)',
    url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000043956924',
  },
  {
    label: 'Décret 2022-510 du 8 avril 2022 — audit énergétique vente',
    url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000045541907',
  },
  {
    label: 'Observatoire DPE-Audit ADEME — vérification numéro',
    url: 'https://observatoire-dpe-audit.ademe.fr',
  },
  {
    label: 'Notaires de France — Étude Valeur verte 2024',
    url: 'https://www.notaires.fr',
  },
  {
    label: 'France Rénov’ — MaPrimeRénov’ Parcours accompagné',
    url: 'https://france-renov.gouv.fr',
  },
  {
    label: 'ANAH — Bonus passoire et sortie passoire',
    url: 'https://www.anah.gouv.fr',
  },
  {
    label: 'ADEME — Bilan rénovation énergétique 2024',
    url: 'https://librairie.ademe.fr',
  },
]

const faqs = [
  {
    question: 'Comment savoir si mon logement est en classe G ?',
    answer:
      'Lisez l’étiquette énergie du DPE annexé à votre acte de vente, bail ou compte rendu de copropriété. Si la flèche pointe sur G (rouge foncé), votre logement est en classe G. Vous pouvez aussi vérifier l’authenticité du DPE sur l’Observatoire DPE-Audit ADEME en saisissant le numéro à 13 caractères. Pour une estimation rapide sans DPE, multipliez votre consommation annuelle (kWh PCI factures gaz + élec) par 1,02 (PCS) puis divisez par votre surface SHAB : si > 420 → probablement G.',
  },
  {
    question: 'Pourquoi mon logement est-il classé G alors que je consomme peu ?',
    answer:
      'Le DPE prend la pire des deux notes : énergie primaire OU émissions CO₂. Un logement consommant 350 kWh/m²/an (classe F) mais chauffé au fioul peut basculer en G si les émissions CO₂ dépassent 100 kg/m²/an. C’est le cas de nombreuses chaudières fioul/charbon ou des cumulus électriques en région PACA (climat 1) avec mauvaise isolation. Vérifiez la double étiquette énergie + climat sur votre DPE.',
  },
  {
    question: 'Mon DPE classe G de 2018 est-il encore valable ?',
    answer:
      'NON. Tous les DPE réalisés avant le 1er juillet 2021 (ancienne méthode) sont caducs depuis le 1er janvier 2025. Vous devez commander un nouveau DPE méthode 3CL-2021 (~ 100-200 €) avant toute mise en vente, location ou demande d’aides MaPrimeRénov’. Bonne nouvelle : la nouvelle méthode est souvent plus indulgente — environ 10-15 % de logements changent de classe à la hausse vs l’ancienne méthode.',
  },
  {
    question: 'Puis-je vendre un logement classé G en 2026 ?',
    answer:
      'OUI, la vente d’un logement classé G reste autorisée. La loi Climat 2021 vise uniquement la mise en location de la résidence principale. Vous devez en revanche : 1) faire réaliser un audit énergétique réglementaire avant compromis (~ 500-1 200 €), 2) mentionner la classe G + GES + "logement à consommation énergétique excessive" dans toutes vos annonces, 3) anticiper une décote moyenne de 10-15 % et un délai de vente prolongé.',
  },
  {
    question: 'Peut-on encore louer un G en 2026 si le bail est ancien ?',
    answer:
      'OUI, les baux signés avant le 1er janvier 2025 ne sont pas rompus. Le propriétaire peut continuer la location existante. En revanche, tout nouveau bail (changement de locataire) ou tout renouvellement de bail (échéance 3 ans nu, 1 an meublé) est interdit depuis le 1er janvier 2025. Le locataire peut aussi saisir le juge pour exiger les travaux (article 20-1 loi 1989) avec astreinte 50-500 €/jour de retard.',
  },
  {
    question: 'Quelles aides pour rénover un G en 2026 ?',
    answer:
      'Aides majorées passoire : MaPrimeRénov’ Parcours accompagné jusqu’à 70 000 € HT (90 % pour très modestes, 50 % pour intermédiaires) + bonus passoire +10 % + bonus sortie passoire +1 500 € (saut ≥ 2 classes). Cumulables avec : CEE Coup de pouce (3-5 K€ chauffage), éco-PTZ 50 000 € sur 20 ans à taux 0, TVA 5,5 % travaux RGE, exonération taxe foncière 3-5 ans (selon commune). Total aides typiques 50-65 % du devis HT pour ménages modestes.',
  },
  {
    question: 'Combien coûte une rénovation pour sortir un G de la passoire ?',
    answer:
      'Saut G → E (sortie passoire) : 18-30 K€ HT travaux, après aides 8-15 K€ reste à charge pour ménage modeste. Saut G → D (sécurité long terme) : 30-45 K€ HT, reste à charge 15-23 K€. Saut G → C (rénovation globale BBC) : 45-65 K€, reste à charge 23-30 K€. Le saut G → E est le minimum recommandé pour sécuriser l’interdiction de location 2034 (classe E interdite cette année-là).',
  },
  {
    question: 'Audit énergétique obligatoire ou DPE suffit-il pour vendre un G ?',
    answer:
      'L’audit énergétique réglementaire (décret 2022-510) est OBLIGATOIRE depuis le 1er avril 2023 pour toute vente d’une maison individuelle classée F ou G. Le DPE seul ne suffit pas. L’audit (~ 500-1 200 €, valable 5 ans) doit être annexé à la promesse de vente et propose obligatoirement 2 scénarios de travaux chiffrés permettant d’atteindre au minimum la classe E ou C. Réalisé par un auditeur certifié RGE Audit énergétique.',
  },
]

export default function DpeClasseGPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Diagnostic', url: '/renovation-energetique/diagnostic' },
    { name: 'DPE', url: '/renovation-energetique/diagnostic/dpe' },
    { name: 'Classes A à G', url: '/renovation-energetique/diagnostic/dpe/classes' },
    { name: 'Classe G', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: PAGE_PATH,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Diagnostic — DPE — Classe G',
    keywords: [
      'dpe classe g',
      'classe g dpe',
      'logement classe g',
      'dpe g',
      'consommation classe g',
      'sortir classe g',
      'audit énergétique classe g',
    ],
  })
  const govSchema = getGovernmentServiceSchema({
    name: 'Audit énergétique obligatoire DPE F/G',
    description:
      'Audit énergétique réglementaire obligatoire pour vendre une maison classée F ou G (décret 2022-510 du 8 avril 2022).',
    url: PAGE_URL,
    serviceType: 'Diagnostic réglementaire — vente passoire thermique',
    serviceOperator: {
      name: 'Ministère de la Transition écologique',
      url: 'https://www.ecologie.gouv.fr',
    },
  })

  const schemas = [articleSchema, breadcrumbSchema, faqSchema, govSchema].filter(
    (s): s is Record<string, unknown> => s !== null
  )

  return (
    <>
      <JsonLd data={schemas} />

      <main className="bg-sand-50 min-h-screen">
        <Breadcrumb
          items={[
            { label: 'Rénovation énergétique', href: '/renovation-energetique' },
            { label: 'Diagnostic', href: '/renovation-energetique/diagnostic' },
            { label: 'DPE', href: '/renovation-energetique/diagnostic/dpe' },
            { label: 'Classes A à G', href: '/renovation-energetique/diagnostic/dpe/classes' },
            { label: 'Classe G' },
          ]}
          className="max-w-4xl mx-auto px-4 sm:px-6 pt-6"
        />

        <article className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          <header className="mb-8">
            <p className="inline-flex items-center gap-2 bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
              <Flame className="w-3.5 h-3.5" aria-hidden /> Passoire thermique
            </p>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-sand-900 mt-3 mb-3 leading-tight">
              DPE classe G en 2026 : seuils, conséquences et travaux
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Tout ce qu’il faut savoir sur la classe G du DPE : définition technique 3CL-2021, ~1,8
              million de logements concernés, location interdite depuis 2025, audit obligatoire à la
              vente, et 5 sauts de rénovation chiffrés pour sortir de la passoire.
            </p>
            <LastUpdated date={MODIFIED} label="Mis à jour le" className="mt-3 text-sm" />
          </header>

          <TldrBlock bullets={tldr} />

          <section className="my-10">
            <h2 className="font-heading text-2xl font-bold text-sand-900 mb-4">
              Définition technique de la classe G (méthode 3CL-2021)
            </h2>
            <p className="text-sand-700 mb-6">
              Depuis l’arrêté du 31 mars 2021, le DPE applique la méthode 3CL-2021 unifiée. Un
              logement est classé G dès lors qu’il dépasse l’un des deux seuils suivants — la pire
              des deux notes (énergie primaire ou émissions CO₂) est retenue.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              {SEUILS_G.map((s) => (
                <div
                  key={s.indicateur}
                  className="bg-white border-2 border-red-200 rounded-xl p-5 shadow-sm"
                >
                  <p className="font-semibold text-red-700 text-sm uppercase tracking-wide">
                    {s.indicateur}
                  </p>
                  <p className="font-heading text-2xl font-bold text-sand-900 mt-2 mb-3">
                    {s.seuil}
                  </p>
                  <p className="text-sm text-sand-600 leading-relaxed">{s.detail}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900">
              <strong>Cas piège :</strong> un logement consommant 350 kWh/m²/an (donc classe F) peut
              basculer en G si le chauffage fioul ou charbon génère plus de 100 kg CO₂/m²/an. C’est
              fréquent pour les maisons rurales chauffées au fioul mal isolées.
            </div>
          </section>

          <section className="my-10">
            <h2 className="font-heading text-2xl font-bold text-sand-900 mb-4">
              Conséquences à la vente d’un logement classé G
            </h2>
            <p className="text-sand-700 mb-6">
              Vendre un G reste légal en 2026, mais quatre contraintes clés s’imposent au vendeur,
              avec un impact direct sur le prix et le délai.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {CONSEQUENCES_VENTE.map((c) => {
                const Icon = c.icon
                return (
                  <div
                    key={c.titre}
                    className="bg-white border border-sand-200 rounded-xl p-5 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5" aria-hidden />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sand-900 mb-1">{c.titre}</h3>
                        <p className="text-sm text-sand-600 leading-relaxed">{c.detail}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="my-10">
            <h2 className="font-heading text-2xl font-bold text-sand-900 mb-4">
              Conséquences à la location (rappel)
            </h2>
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <ShieldAlert className="w-8 h-8 text-red-600 shrink-0" aria-hidden />
                <div>
                  <p className="font-semibold text-red-900 mb-2">
                    Mise en location interdite depuis le 1er janvier 2025
                  </p>
                  <p className="text-sm text-red-800 leading-relaxed mb-3">
                    La loi Climat 2021 (article 160) interdit toute nouvelle mise en location ou
                    renouvellement de bail pour un logement classé G en résidence principale. Les
                    baux en cours signés avant 2025 ne sont pas rompus, mais le locataire peut
                    saisir le juge pour exiger les travaux d’économie d’énergie (astreinte 50-500
                    €/jour de retard).
                  </p>
                  <Link
                    href="/renovation-energetique/passoires-thermiques/interdiction-location-g-f"
                    className="inline-flex items-center gap-2 text-red-700 font-semibold underline hover:text-red-800"
                  >
                    Détail interdiction location G/F <ArrowRight className="w-4 h-4" aria-hidden />
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <section className="my-10">
            <h2 className="font-heading text-2xl font-bold text-sand-900 mb-4">
              5 sauts de classe pour sortir d’un DPE G (coût et ROI)
            </h2>
            <p className="text-sand-700 mb-6">
              Quel niveau de rénovation viser ? Voici les cinq scénarios standards, des plus légers
              (sortie de classe G) aux plus ambitieux (rénovation BBC complète). Coûts indicatifs HT
              pour 100 m² SHAB, hors région tendue. Aides moyennes pour ménage modeste (Parcours
              accompagné MaPrimeRénov’ + CEE).
            </p>
            <div className="space-y-4">
              {SAUTS_G.map((s) => (
                <div
                  key={s.saut}
                  className="bg-white border border-sand-200 rounded-xl p-5 shadow-sm"
                >
                  <div className="flex items-start gap-4 flex-wrap">
                    <div className="font-heading text-2xl font-bold text-accent-700 shrink-0">
                      {s.saut}
                    </div>
                    <div className="flex-1 min-w-[280px]">
                      <p className="text-sand-700 leading-relaxed mb-3">
                        <strong>Travaux : </strong>
                        {s.travaux}
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-xs uppercase text-sand-500 mb-0.5">Coût HT</p>
                          <p className="font-semibold text-sand-900">{s.cout}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase text-sand-500 mb-0.5">Aides</p>
                          <p className="font-semibold text-accent-700">{s.aides}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase text-sand-500 mb-0.5">Reste à charge</p>
                          <p className="font-semibold text-sand-900">{s.reste}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase text-sand-500 mb-0.5">Rentabilité</p>
                          <p className="font-semibold text-sand-700 text-xs leading-snug">
                            {s.rentabilite}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-sand-600 mt-3 border-t border-sand-100 pt-3">
                        <Leaf className="inline w-4 h-4 text-accent-600 mr-1" aria-hidden />
                        {s.impact}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="my-10">
            <h2 className="font-heading text-2xl font-bold text-sand-900 mb-4">
              Travaux prioritaires (dans cet ordre)
            </h2>
            <p className="text-sand-700 mb-6">
              Pour maximiser l’efficacité aides + rapidité, respectez la séquence ci-dessous.
              L’audit énergétique RGE est l’étape obligatoire avant toute demande MaPrimeRénov’
              Parcours accompagné, et il oriente la priorité des gestes selon votre bâti.
            </p>
            <div className="space-y-3">
              {TRAVAUX_PRIORITES.map((t) => (
                <div
                  key={t.rang}
                  className="bg-white border border-sand-200 rounded-xl p-5 shadow-sm flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-accent-100 text-accent-700 font-bold flex items-center justify-center shrink-0">
                    {t.rang}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sand-900 mb-1">{t.titre}</h3>
                    <p className="text-sm text-sand-600 leading-relaxed">{t.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="my-10 bg-accent-50 border-2 border-accent-200 rounded-xl p-6">
            <h2 className="font-heading text-xl font-bold text-accent-900 mb-3">
              <Calculator className="inline w-5 h-5 mr-2" aria-hidden />
              Estimer mes aides en 2 minutes
            </h2>
            <p className="text-sm text-accent-800 mb-4 leading-relaxed">
              Le simulateur officiel France Rénov’ calcule vos aides MaPrimeRénov’, CEE et éco-PTZ
              selon votre revenu fiscal de référence, votre zone climatique et la classe DPE de
              départ. Pour les passoires F/G, le bonus 1 500 € s’ajoute si le saut dépasse 2
              classes.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/simulateur-aides-renovation"
                className="inline-flex items-center gap-2 bg-accent-700 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-accent-800 transition-colors"
              >
                Simulateur aides
                <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
              <Link
                href="/renovation-energetique/aides/maprimerenov-2026/parcours-accompagne"
                className="inline-flex items-center gap-2 bg-white border border-accent-300 text-accent-800 px-5 py-2.5 rounded-lg font-semibold hover:bg-accent-50 transition-colors"
              >
                Parcours accompagné MPR
                <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
            </div>
          </section>

          <FlagshipFaq items={faqs} />
          <FlagshipSources sources={sources} />

          <section className="my-10">
            <h2 className="font-heading text-xl font-semibold text-sand-900 mb-4">
              Pour aller plus loin
            </h2>
            <ul className="grid gap-3 md:grid-cols-2">
              {[
                {
                  label: 'Hub Classes DPE A à G',
                  href: '/renovation-energetique/diagnostic/dpe/classes',
                },
                {
                  label: 'Hub Passoires thermiques',
                  href: '/renovation-energetique/passoires-thermiques',
                },
                {
                  label: 'Calendrier passoires 2025-2034',
                  href: '/renovation-energetique/passoires-thermiques/calendrier-2025-2028-2034',
                },
                {
                  label: 'Audit énergétique : prix et aides',
                  href: '/renovation-energetique/diagnostic/audit-energetique',
                },
                {
                  label: 'MaPrimeRénov’ 2026 — Parcours accompagné',
                  href: '/renovation-energetique/aides/maprimerenov-2026/parcours-accompagne',
                },
                {
                  label: 'Pompe à chaleur : guide complet',
                  href: '/renovation-energetique/travaux/pompe-a-chaleur',
                },
              ].map((g) => (
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
              href="/renovation-energetique/diagnostic/dpe/classes"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Hub Classes DPE A à G
            </Link>
            <Link
              href="/renovation-energetique/passoires-thermiques"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Hub Passoires thermiques <TrendingUp className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </article>
      </main>
    </>
  )
}
