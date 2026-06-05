/**
 * Page : /renovation-energetique/travaux/electricite
 *
 * @kw-primary    electricien autour de moi
 * @kw-volume     5500
 * @kw-kd         1
 * @kw-cpc        0.94
 * @cluster       10
 * @ahrefs-source docs/ahrefs-audit-2026-04/normalized/ahrefs-content-gap.csv
 * @snapshot      2026-05-04 (Ahrefs Bloc 1 v3 — cluster électricité résidentielle)
 * @backlog-item  Levier-N-electricite-hub
 *
 * KW cibles (validés Ahrefs gap CSV 2026-04, country=fr) :
 * - "electricien"                        14 000 vol, KD 12
 * - "electricien autour de moi"           5 500 vol, KD 1 ⭐⭐⭐ pivot
 * - "consuel electrique"                  4 600 vol, KD 4 ⭐⭐
 * - "électricien"                         4 100 vol, KD 0
 * - "nfc 15-100"                          3 500 vol, KD 43 (skip too hard)
 * - "norme nfc 15-100"                    2 900 vol, KD 43 (skip)
 * - "hauteur tableau électrique"          2 600 vol, KD 0 ⭐⭐
 * - "électricien autour de moi"           2 200 vol, KD 0
 * - "tableau électrique triphasé"         1 900 vol, KD 0
 * - "disjoncteur différentiel 30ma"       1 800 vol, KD 0
 * - "disjoncteur général"                 1 700 vol, KD 0
 * - "prise terre"                         1 200 vol, KD 1
 * - "disjoncteur de branchement"          1 200 vol, KD 0
 * - "irve"                                8 300 vol, KD 9 (transition VE — sub-page possible)
 * - Famille cumulée pivot direct (sans villes) : ~37 000 vol/mois (KD moyen 0-4)
 *
 * Source : docs/ahrefs-audit-2026-04/normalized/ahrefs-content-gap.csv
 * Easy win : MAJEUR (KD 0-4 sur 12 KW, hub électricité absent côté SA)
 * Cluster pillar : Rénovation Énergétique → Travaux → Électricité
 *
 * Anti-cannibalisation :
 *   - /travaux/pompe-a-chaleur     = chauffage thermodynamique
 *   - /travaux/solaire             = photovoltaïque (production électricité)
 *   - /travaux/climatisation       = clim + frigoriste (Levier L)
 *   - Cette page = HUB électricité résidentielle (mise aux normes, dépannage,
 *     tableau, IRVE, Consuel) angle service global. Sub-pages futures :
 *     consuel, IRVE, NFC 15-100 — gardées pour leviers suivants.
 *
 * YMYL high : sécurité électrique (NF C 15-100, risque incendie + électrocution),
 * Consuel obligatoire avant raccordement Enedis (Décret 2010-301), habilitation
 * électrique pro (Code travail R4544-1 à R4544-11).
 *
 * Cite : NF C 15-100, Consuel, Décret 2010-301 du 22/03/2010, Code construction
 * R136, Code travail R4544 habilitations, Qualifelec, Promotelec, ADEME guide
 * électricité résidentielle.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Zap,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Calculator,
  Wrench,
  HardHat,
  FileCheck,
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

const PAGE_PATH = '/renovation-energetique/travaux/electricite'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'marc-lefebvre'
const AUTHOR_NAME = 'Marc Lefebvre'

const TITLE = 'Prix électricien 2026 : 35-65 €/h + mise aux normes NF C 15-100'
const DESCRIPTION =
  'Électricien en 2026 : 35-65 €/h, mise aux normes NF C 15-100 80-150 €/m², Consuel 200-400 €. Tableau, dépannage, IRVE — choisir un Qualifelec.'

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
  'Tarif horaire 2026 : électricien 35-65 €/h HT en heures normales, 60-110 €/h en urgence ou week-end. Forfait dépannage hors heures : 90-180 € la prestation.',
  'Mise aux normes complète maison T3-T4 (NF C 15-100) : 5 000-10 000 € selon état. Mise en sécurité (8 points minimum Promotelec) : 800-2 000 €.',
  'Tableau électrique 12-18 modules : 200-500 € matériel + 200-400 € pose. Disjoncteur différentiel 30 mA obligatoire (NF C 15-100) sur tous circuits : 80-150 € pose.',
  'Consuel obligatoire avant tout raccordement Enedis sur installation neuve ou rénovation totale (Décret 2010-301) : 200-400 € selon AC type 1/2/3/4.',
  'Borne IRVE 7 kW Wallbox : 1 200-2 500 € posée (Wallbox, Schneider EVlink, Hager Witty, Legrand Green’up). Crédit d’impôt 75 % plafonné selon barème en vigueur (à vérifier).',
  'Choisir un Qualifelec (référentiel pro) avec décennale + RC pro à jour. Pour IRVE : mention IRVE-A ou supérieure obligatoire (Décret 2017-298).',
]

const PRIX_ELECTRICITE = [
  {
    type: 'Tarif horaire — heures normales',
    prix: '35 - 65 €/h HT',
    duree: 'À l’heure',
    note: 'Hors fourniture matériel. Tarif jour ouvré 8h-18h. Prestation < 1 h facturée souvent au forfait minimum (60-100 €).',
  },
  {
    type: 'Tarif horaire — urgence ou week-end',
    prix: '60 - 110 €/h HT',
    duree: 'À l’heure',
    note: 'Majoration 50-100 % vs heures normales. Forfait déplacement hors heures : 90-180 € HT minimum facturé. Vérifier devis avant intervention.',
  },
  {
    type: 'Mise en sécurité (8 points minimum Promotelec)',
    prix: '800 - 2 000 €',
    duree: '4-8 h',
    note: 'Disjoncteur de branchement, différentiel 30 mA, mise à la terre, prise terre cuisine/SdB, liaison équipotentielle SdB. Solution si NFC 15-100 complète trop coûteuse.',
  },
  {
    type: 'Mise aux normes NF C 15-100 — maison T3-T4',
    prix: '5 000 - 10 000 €',
    duree: '4-7 jours',
    note: 'Refonte complète : tableau, circuits dédiés, prises calibrées, points lumineux par pièce, prises terre. Inclut Consuel + raccordement Enedis.',
  },
  {
    type: 'Tableau électrique 12-18 modules + pose',
    prix: '400 - 900 €',
    duree: '2-4 h',
    note: 'Matériel 200-500 € (Schneider, Legrand, Hager) + pose 200-400 €. Différentiels 30 mA obligatoires + disjoncteurs divisionnaires calibrés selon usage.',
  },
  {
    type: 'Consuel — attestation conformité',
    prix: '200 - 400 €',
    duree: '15 jours délai',
    note: 'Obligatoire avant raccordement Enedis sur neuf / réno totale (Décret 2010-301). Attestation Type 1/2/3/4 selon installation. Frais administratifs Comité.',
  },
  {
    type: 'Borne IRVE 7 kW Wallbox',
    prix: '1 200 - 2 500 €',
    duree: '3-5 h',
    note: 'Pose par installateur mention IRVE-A obligatoire (Décret 2017-298). Wallbox Pulsar+, Schneider EVlink Home, Hager Witty, Legrand Green’up. Crédit d’impôt selon LF en vigueur.',
  },
]

const FACTEURS_PRIX = [
  {
    title: 'État de l’installation existante',
    impact: '×1 à ×3',
    desc: 'Installation < 15 ans aux normes : remplacement local +20 %. Installation 15-30 ans non conforme : mise en sécurité 800-2 000 €. > 30 ans inadaptée : refonte complète NF C 15-100 5-10 K€.',
  },
  {
    title: 'Surface et nombre de pièces',
    impact: '×1 à ×3',
    desc: 'T2 50 m² : 2-4 K€ refonte. T4 100 m² : 5-8 K€. Maison 150 m² + extérieur : 8-12 K€. Plus de pièces = plus de circuits dédiés (NF C 15-100 : minimum 8 circuits prises + 5 lumière).',
  },
  {
    title: 'Encastré vs apparent',
    impact: '+30 à +60 %',
    desc: 'Câbles encastrés (saignées) : main d’œuvre + reprise plâtrerie + peinture. Apparent (moulures, goulottes) : -30 à -50 % moins cher mais esthétique discutable. Mixte fréquent en rénovation.',
  },
  {
    title: 'Triphasé vs monophasé',
    impact: '+15 à +30 %',
    desc: 'Triphasé (gros consommateurs : PAC, four pro, atelier) = tableau plus complexe, disjoncteurs tétrapolaires plus chers. Monophasé reste standard résidentiel pour < 12 kVA.',
  },
  {
    title: 'Région et urgence',
    impact: '±20 à 100 %',
    desc: 'Île-de-France et grandes agglos : +15-25 % vs province. Dépannage urgence : majoration 50-100 % HE / WE. Forfait minimum 90-180 € HE.',
  },
]

const REGLEMENT = [
  {
    title: 'NF C 15-100 — installations électriques basse tension',
    desc: 'Norme NF C 15-100 (AFNOR), pierre angulaire de la sécurité électrique des bâtiments d’habitation et tertiaires. Définit les circuits dédiés (cuisine, SdB, chauffe-eau, plaque cuisson), les calibrages disjoncteurs, les liaisons équipotentielles et les volumes de protection en SdB. Mise à jour régulière par amendements.',
  },
  {
    title: 'Consuel — Décret 2010-301 du 22 mars 2010',
    desc: 'Le Consuel (Comité National pour la Sécurité des Usagers de l’Électricité) délivre une attestation de conformité obligatoire avant tout raccordement Enedis sur une installation neuve ou en rénovation totale. 4 types d’attestation (1 = générique, 2 = production photovoltaïque, 3 = courants faibles, 4 = locaux à usage spécifique).',
  },
  {
    title: 'Code construction R136-1 à R136-10',
    desc: 'Définit les obligations propriétaire / bailleur en matière de sécurité électrique, notamment l’obligation d’une installation conforme NF C 15-100 lors de toute remise en état ou rénovation lourde. Au moment de la vente, le diagnostic électrique obligatoire (DEO) signale les anomalies.',
  },
  {
    title: 'Code travail R4544-1 à R4544-11 — habilitations',
    desc: 'Toute intervention électrique en pro doit être réalisée par un opérateur habilité (B0, H0, B1V, B2V, BC, BR, BE selon nature). Sans habilitation, intervention illégale. Vérifier auprès de l’artisan que ses salariés sont habilités à jour (recyclage tous les 3 ans).',
  },
]

const QUI_CHOISIR = [
  {
    title: 'Qualifelec ou RGE Qualifelec MER',
    must: 'Recommandé',
    desc: 'Préférer un artisan disposant d’une qualification Qualifelec : E2 (résidentiel < 36 kVA), E3 (tertiaire), TA (très basse tension). Pour bornes IRVE : mention IRVE-A, IRVE-B ou IRVE-C selon puissance. Vérifiable sur qualifelec.fr.',
  },
  {
    title: 'Décennale et RC pro à jour',
    must: 'Obligatoire',
    desc: 'Toute installation électrique est couverte par la garantie décennale (Code civil art. 1792). Vérifier l’attestation décennale en cours et la RC pro mentionnant explicitement « installations électriques basse tension ».',
  },
  {
    title: 'Devis détaillé avec marques + calibrages',
    must: 'Obligatoire',
    desc: 'Refuser tout devis sans : marque tableau (Schneider, Legrand, Hager), calibrage des disjoncteurs (ex : 16 A courbe C), nombre de circuits, type de différentiel (30 mA AC ou A pour SdB / cuisine).',
  },
  {
    title: 'Attestation Consuel incluse au devis (neuf / réno)',
    must: 'Obligatoire',
    desc: 'Pour toute installation neuve ou rénovation totale, l’attestation Consuel (Type 1, 2, 3 ou 4 selon nature) doit figurer explicitement au devis. 200-400 € selon type. Sans Consuel = pas de raccordement Enedis légal.',
  },
  {
    title: 'Mention IRVE-A pour borne recharge VE',
    must: 'Obligatoire IRVE',
    desc: 'Toute pose de borne IRVE > 3,7 kW exige un installateur disposant de la mention IRVE-A (résidentiel) ou supérieure (Décret 2017-298). Sans cette mention, le crédit d’impôt et les aides ADVENIR sont refusés et la garantie matériel souvent invalidée.',
  },
]

const faqs = [
  {
    question: 'Combien coûte un électricien à l’heure en 2026 ?',
    answer:
      'En 2026, le tarif horaire d’un artisan électricien en heures normales (8h-18h jour ouvré) est de 35-65 €/h HT. En urgence ou week-end / jour férié, comptez 60-110 €/h HT (majoration 50-100 %). Forfait minimum dépannage hors heures : 90-180 € HT à la prestation. Pour de gros travaux, un forfait global (tableau, mise en sécurité, NF C 15-100) est plus avantageux qu’une facturation horaire.',
  },
  {
    question: 'Combien coûte une mise aux normes NF C 15-100 ?',
    answer:
      'Pour une maison T3-T4 (80-100 m²), la mise aux normes complète NF C 15-100 coûte 5 000-10 000 € en 2026, selon l’état initial et le choix encastré / apparent. Solution intermédiaire : mise en sécurité Promotelec (8 points minimum) à 800-2 000 € qui couvre l’essentiel de la sécurité (disjoncteur, différentiel 30 mA, mise à la terre, prise terre cuisine/SdB, liaison équipotentielle). Conseil : faire un diagnostic électrique préalable (200-400 €) pour cibler les priorités.',
  },
  {
    question: 'La Consuel est-elle vraiment obligatoire ?',
    answer:
      'OUI, sur installation neuve ou en rénovation totale. Le Décret 2010-301 du 22 mars 2010 impose une attestation de conformité Consuel avant tout raccordement par Enedis. Sans Consuel, Enedis refuse le raccordement. 4 types d’attestation : Type 1 (résidentiel / tertiaire générique), Type 2 (production photovoltaïque revente), Type 3 (courants faibles seuls), Type 4 (locaux à usage spécifique). Coût 200-400 €. Délai : 15 jours après dépôt de l’attestation par l’installateur.',
  },
  {
    question: 'Combien coûte une borne IRVE pour véhicule électrique en 2026 ?',
    answer:
      'En 2026, une borne IRVE 7 kW (Wallbox monophasé 32 A) coûte 1 200-2 500 € posée par un installateur agréé mention IRVE-A. Modèles courants : Wallbox Pulsar+, Schneider EVlink Home, Hager Witty Start, Legrand Green’up Premium. Pour 11-22 kW (triphasé) : 2 500-4 500 €. Le crédit d’impôt résidence principale (article 200 quater C CGI) est de 75 % du montant TTC plafonné — vérifier le plafond exact en vigueur sur service-public.fr ou impots.gouv.fr en 2026. Aides ADVENIR (CEE) disponibles pour copropriétés.',
  },
  {
    question: 'Quelle hauteur pour le tableau électrique ?',
    answer:
      'Selon NF C 15-100 (amendement A2 + A3), le tableau électrique doit être installé entre 0,90 m et 1,80 m du sol fini, en zone accessible (pas de placard fermé, pas de SdB, pas de garage humide). Hauteur recommandée : 1,30-1,60 m pour faciliter l’accès. Le local technique GTL (Gaine Technique Logement) doit faire au minimum 600 mm de large × 250 mm de profondeur, libre d’obstacle, avec éclairage et prise de courant à proximité.',
  },
  {
    question: 'Est-ce que tout circuit doit être protégé par un différentiel 30 mA ?',
    answer:
      'OUI. La NF C 15-100 impose un disjoncteur (ou interrupteur) différentiel 30 mA en amont de TOUS les circuits terminaux d’une installation résidentielle. Les SdB et cuisines exigent un différentiel 30 mA de type A (sensible aux courants pulsés DC, pour plaques à induction et chargeurs VE). Les autres circuits peuvent utiliser un type AC. Ces différentiels sauvent des vies en cas de contact direct ou défaut isolement.',
  },
  {
    question: 'Y a-t-il des aides MaPrimeRénov’ ou CEE pour l’électricité ?',
    answer:
      'Pour la mise aux normes NF C 15-100 SEULE : NON, aucune aide. EN REVANCHE : (1) Bornes IRVE résidence principale = crédit d’impôt 75 % plafonné (à vérifier en LF en vigueur). (2) ADVENIR (CEE) = aides bornes IRVE en copropriété et entreprise. (3) Si l’électricité est intégrée à une rénovation globale (raccordement PAC, IRVE, refonte tableau pour pilotage chauffage) avec un installateur RGE, certains travaux peuvent ouvrir droit au Parcours accompagné MaPrimeRénov’ rénovation d’ampleur. Demander précisément à l’artisan ce qui est éligible.',
  },
  {
    question: 'Qui paye l’électricité, le locataire ou le bailleur ?',
    answer:
      'Selon Décret 87-712 + Loi 89-462 art. 7 : le bailleur reste responsable du gros entretien (tableau, mise aux normes NF C 15-100, prises de terre, mise en sécurité). Le locataire paye l’entretien courant (remplacement ampoules, prises endommagées par usage, petit dépannage local). En cas de défaut grave (court-circuit, électrocution), la responsabilité du bailleur est engagée s’il connaissait la non-conformité. Lors d’une vente, le diagnostic électrique obligatoire (DEO) est à la charge du vendeur, valable 3 ans.',
  },
]

const sources = [
  {
    label: 'AFNOR — Norme NF C 15-100 installations électriques basse tension',
    url: 'https://www.boutique.afnor.org',
  },
  {
    label: 'Consuel — Comité National pour la Sécurité des Usagers de l’Électricité',
    url: 'https://www.consuel.com',
  },
  {
    label: 'Légifrance — Décret 2010-301 du 22 mars 2010 (attestation Consuel)',
    url: 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000022027720/',
  },
  {
    label: 'Légifrance — Décret 2017-298 du 6 mars 2017 (IRVE)',
    url: 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000034139409/',
  },
  {
    label: 'Légifrance — Code travail R4544-1 à R4544-11 (habilitations)',
    url: 'https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/LEGISCTA000018532076/',
  },
  {
    label: 'Qualifelec — référentiel pro installations électriques',
    url: 'https://www.qualifelec.fr',
  },
  { label: 'Promotelec — guides sécurité électrique habitat', url: 'https://www.promotelec.com' },
  {
    label: 'service-public.fr — Diagnostic électrique obligatoire (DEO)',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F16096',
  },
]

const relatedPages = [
  {
    label: 'Hub Travaux rénovation',
    href: '/renovation-energetique/travaux',
  },
  {
    label: 'Hub pompe à chaleur (raccordement électrique)',
    href: '/renovation-energetique/travaux/pompe-a-chaleur',
  },
  {
    label: 'Hub solaire photovoltaïque',
    href: '/renovation-energetique/travaux/solaire',
  },
  {
    label: 'Climatisation (frigoriste + clim)',
    href: '/renovation-energetique/travaux/climatisation',
  },
  {
    label: 'Trouver un électricien Qualifelec',
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
    section: 'Travaux — Électricité résidentielle',
    keywords: [
      'électricien',
      'electricien autour de moi',
      'consuel electrique',
      'NF C 15-100',
      'tableau électrique',
      'IRVE borne recharge',
      'mise aux normes électrique',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique/travaux' },
    { name: 'Électricité', url: PAGE_PATH },
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
              { label: 'Électricité' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Zap className="w-3.5 h-3.5" aria-hidden />
              Électricité &middot; Mise aux normes, IRVE, dépannage
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Prix électricien en 2026 : tarifs, mise aux normes NF C 15-100 et IRVE
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              En 2026, un électricien facture <strong>35-65 €/h HT</strong> en heures normales et{' '}
              <strong>60-110 €/h</strong> en urgence ou week-end. La mise aux normes complète{' '}
              <strong>NF C 15-100</strong> d’une maison T3-T4 coûte <strong>5 000-10 000 €</strong>,
              la mise en sécurité allégée 800-2 000 €, et la pose d’une borne IRVE 7 kW{' '}
              <strong>1 200-2 500 €</strong>. Le <strong>Consuel</strong> est obligatoire avant tout
              raccordement Enedis (Décret 2010-301).
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Prix électricien en 2026 : 7 prestations standards</h2>
            <p>
              Les fourchettes ci-dessous correspondent aux tarifs constatés 2026 (TTC, hors
              déplacement supplémentaire et hors fourniture importante) :
            </p>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Prestation</th>
                    <th className="p-3 border-b border-sand-200">Prix</th>
                    <th className="p-3 border-b border-sand-200 hidden md:table-cell">Durée</th>
                    <th className="p-3 border-b border-sand-200 hidden lg:table-cell">Note</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {PRIX_ELECTRICITE.map((row) => (
                    <tr key={row.type} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold whitespace-nowrap">{row.type}</td>
                      <td className="p-3 font-semibold text-primary-800 whitespace-nowrap">
                        {row.prix}
                      </td>
                      <td className="p-3 hidden md:table-cell whitespace-nowrap">{row.duree}</td>
                      <td className="p-3 text-sand-600 hidden lg:table-cell">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Tarifs nationaux 2026, hors fourniture matériel hors tableau. TVA 10 % en logement
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

            <div className="not-prose border-2 border-red-300 bg-red-50 rounded-lg p-5 my-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-700 shrink-0 mt-0.5" aria-hidden />
                <div>
                  <p className="font-semibold text-red-900 m-0">
                    Sans Consuel : pas de raccordement Enedis légal
                  </p>
                  <p className="text-sm text-red-900 mt-2 mb-0">
                    Sur installation neuve ou rénovation totale, Enedis exige une attestation
                    Consuel valide avant raccordement (Décret 2010-301). Une installation non
                    conforme expose : (1) à un refus de raccordement Enedis, (2) à une nullité
                    possible de la garantie habitation en cas d’incendie d’origine électrique, (3) à
                    une responsabilité civile et pénale en cas de dommage tiers. Conserver
                    précieusement le numéro Consuel + l’attestation.
                  </p>
                </div>
              </div>
            </div>

            <h2>5 critères pour choisir un électricien</h2>
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
                          item.must.startsWith('Obligatoire')
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
                    Demandez 3 devis électricien en 2 minutes
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    3 électriciens Qualifelec vérifiés vous répondent sous 48 h. Devis détaillés
                    mise aux normes, tableau, IRVE ou dépannage, Consuel inclus.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/devis"
                      className="inline-flex items-center gap-1.5 bg-primary-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
                    >
                      Demander 3 devis <ArrowRight className="w-4 h-4" aria-hidden />
                    </Link>
                    <Link
                      href="/rge/renovation-energetique"
                      className="inline-flex items-center gap-1.5 bg-white text-primary-700 border border-primary-200 px-4 py-2 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
                    >
                      Annuaire électriciens <ArrowRight className="w-4 h-4" aria-hidden />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <h2>Aide au calcul : votre budget électricité 2026</h2>
            <ul>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />{' '}
                Appartement <strong>50 m²</strong> mise en sécurité 8 points : ~800-1 200 €.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden /> Maison{' '}
                <strong>100 m²</strong> refonte NF C 15-100 partielle (tableau + circuits
                principaux) : ~3 500-6 000 €.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden /> Maison{' '}
                <strong>120-150 m²</strong> refonte NF C 15-100 complète (encastrée + Consuel) : ~7
                000-10 000 €.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden /> Borne
                IRVE 7 kW résidence principale : ~1 800 € moyen, après crédit d’impôt 75 % plafonné,
                reste à charge ~1 575 € (vérifier plafond LF en vigueur 2026).
              </li>
              <li>
                <FileCheck className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden /> Consuel
                Type 1 (résidentiel) : 200-300 € selon installation. Délai 15 jours après dépôt.
              </li>
              <li>
                <ShieldCheck className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden /> TVA 10
                % automatique avec artisan dans logement &gt; 2 ans (sauf Consuel = frais
                administratifs).
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
              href="/renovation-energetique/travaux/solaire"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Solaire photovoltaïque <ArrowRight className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
