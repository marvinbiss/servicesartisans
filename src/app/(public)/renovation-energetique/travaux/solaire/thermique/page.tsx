/**
 * Page : /renovation-energetique/travaux/solaire/thermique
 *
 * @kw-primary    panneau solaire thermique
 * @kw-volume     3200
 * @kw-kd         4
 * @kw-cpc        1.10
 * @intent        commercial + informational
 * @cluster       solaire_thermique
 * @ahrefs-source docs/ahrefs-bloc1-keywords-gap-2026-05-04.md (rang #31)
 * @snapshot      2026-05-04 (Ahrefs Bloc 1 v3 — cluster solaire_thermique)
 * @backlog-item  Levier-M-solaire-thermique
 *
 * KW cibles (validés Ahrefs gap CSV 2026-04, country=fr) :
 * - "panneau solaire thermique"     3 200 vol, KD 4  ⭐⭐⭐ pivot rang #31
 * - "panneaux solaires thermiques"    900 vol, KD 7  rang #150
 * - "chauffe-eau solaire individuel"  longue traîne CESI
 * - "système solaire combiné"         longue traîne SSC
 * - "capteur solaire thermique"       longue traîne tech
 * - Cluster Bloc 1 : 6 KW, vol 3 590/mo, KD avg 3.0
 *
 * Easy win : OUI (KD 4 sur pivot 3.2K, leader quelleenergie #1 page commodité).
 * 0 page SA dédiée solaire thermique (que mention dans /solaire hub PV-focused).
 * Atout SA : page focused CESI + SSC + capteurs (plans/tubes), distincte du
 * photovoltaïque qui produit de l'électricité.
 *
 * Cluster pillar : Rénovation Énergétique → Travaux → Solaire → Thermique
 *
 * Anti-cannibalisation :
 *   - /solaire (hub)               = panneau solaire PV (panneau solaire prix 6.3K KD 25)
 *   - /solaire/rendement           = rendement PV (3.2K KD 6)
 *   - /solaire/autoconsommation    = autoconso PV (batterie WIP)
 *   - /solaire/nettoyage, /1000w, /piscine, /souple = sub-PV
 *   - Cette page                   = SOLAIRE THERMIQUE (capteurs eau, CESI, SSC)
 *   - /chauffage/chauffe-eau-thermodynamique = ECS PAC (autre techno)
 *   - /travaux/ballon-thermodynamique = ECS PAC ballon (autre techno)
 *   - /rge/labels/qualisol         = monographie label QualiSol
 *
 * YMYL high : décisions investissement 4-15K€ (CESI 4-7K€, SSC 11-15K€), aides
 * MaPrimeRénov' ECS solaire (BAR-TH-101) + CEE BAR-TH-101/BAR-TH-102.
 * Cite : Légifrance, France Rénov', ADEME, AFNOR EN 12975 (capteurs), Solar
 * Keymark, Qualit'EnR Qualisol CESI/Combi.
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

const PAGE_PATH = '/renovation-energetique/travaux/solaire/thermique'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'marc-lefebvre'
const AUTHOR_NAME = 'Marc Lefebvre'

const TITLE = 'Panneau solaire thermique 2026 : prix CESI & SSC'
const DESCRIPTION =
  "Panneau solaire thermique 2026 : CESI 4-7 000 €, SSC 11-15 000 €, capteurs plans vs tubes, MaPrimeRénov' jusqu'à 4 000 € + CEE BAR-TH-101. Label Qualisol obligatoire."

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
  "Panneau solaire thermique = capteur d'énergie solaire qui chauffe de l'eau (PAS de l'électricité, contrairement au PV).",
  '2 systèmes : CESI (chauffe-eau solaire individuel) pour ECS seule, SSC (système solaire combiné) pour ECS + chauffage.',
  'Prix posé 2026 : CESI 4 000-7 000 €, SSC 11 000-15 000 € (4-12 m² capteurs).',
  "Aides MaPrimeRénov' Bleu jusqu'à 4 000 € (CESI) ou 10 000 € (SSC) + CEE BAR-TH-101/102.",
  'Couverture besoins ECS : 50-70 % en moyenne France (selon zone solaire). 30-40 % chauffage SSC.',
  '2 technos capteurs : plans vitrés (standard, 80 % marché) ou tubes sous vide (top performance hiver, 20 %).',
  'Installateur RGE Qualisol CESI ou Qualisol Combi obligatoire pour aides + TVA 5,5 %.',
]

const SYSTEMES = [
  {
    type: 'CESI — Chauffe-eau solaire individuel',
    prix: '4 000-7 000 € posé',
    couverture: '50-70 % besoins ECS / an',
    detail:
      "Production d'eau chaude sanitaire seule. 2-6 m² de capteurs + ballon solaire 200-400 L. Idéal famille 3-5 personnes en remplacement chauffe-eau électrique. Appoint électrique ou gaz nécessaire l'hiver.",
  },
  {
    type: 'SSC — Système solaire combiné',
    prix: '11 000-15 000 € posé',
    couverture: '30-40 % chauffage + 50-70 % ECS',
    detail:
      'ECS + chauffage central via plancher chauffant ou radiateurs basse température. 8-15 m² capteurs + ballon tampon 500-1 500 L + appoint chaudière. Adapté maison BBC/RT2012 bien isolée.',
  },
  {
    type: 'PSD — Plancher solaire direct',
    prix: '13 000-18 000 € posé',
    couverture: '30-50 % chauffage',
    detail:
      "Variante SSC où l'eau des capteurs circule directement dans le plancher chauffant (sans ballon tampon intermédiaire). Plus simple mais moins flexible. Demande conception thermique soignée.",
  },
  {
    type: 'CESI hybride PV-T',
    prix: '8 000-12 000 € posé',
    couverture: '50-70 % ECS + 1-3 kWc électrique',
    detail:
      'Capteurs hybrides photovoltaïque-thermique : produisent à la fois électricité (PV) et chaleur (eau). Récupération chaleur PV améliore rendement PV de 5-10 %. Niche encore peu développée mais prometteuse.',
  },
]

const TECHNOS_CAPTEURS = [
  {
    techno: 'Capteurs plans vitrés (standard)',
    prix: '600-900 €/m²',
    rendement: '60-75 % optique, 35-50 % saisonnier',
    avantages: '80 % du marché. Robuste 25-30 ans. Bon rapport qualité-prix. Esthétique soignée.',
    inconvenients: 'Performance moindre par grand froid (-30 % à T° ext < 0 °C).',
  },
  {
    techno: 'Capteurs à tubes sous vide',
    prix: '900-1 400 €/m²',
    rendement: '70-85 % optique, 45-60 % saisonnier',
    avantages:
      "Top performance hiver (vide d'air = isolation parfaite). Idéal SSC en zone froide (Alsace, Massif Central). Production toute l'année.",
    inconvenients:
      'Plus cher (+30-50 %). Tubes individuels fragiles (gel ou casse). Moins esthétique.',
  },
  {
    techno: 'Capteurs autovidangeables (drain-back)',
    prix: '700-1 100 €/m²',
    rendement: '60-75 % optique',
    avantages: "Pas de risque gel (l'eau retourne au ballon hors sollicitation). Sans antigel.",
    inconvenients: 'Demande inclinaison stricte capteurs. Niche peu commercialisée en France.',
  },
  {
    techno: 'Capteurs non vitrés (piscine)',
    prix: '150-300 €/m²',
    rendement: '30-50 % saisonnier basse T°',
    avantages: 'Très bon marché. Idéal piscine ou ECS appoint estival.',
    inconvenients: 'Impossible pour ECS hivernale. Pas éligible aides MPR/CEE.',
  },
]

const CHIFFRES_CLES = [
  {
    cle: '50-70 %',
    label: "Couverture moyenne ECS d'un CESI en France",
    detail: 'Variation 40 % (Nord-Pas-de-Calais) à 80 % (PACA)',
  },
  {
    cle: '4 m²',
    label: 'Capteurs CESI typique pour 4 personnes',
    detail: '2 m² par personne, ballon 75 L par personne',
  },
  {
    cle: '500 kWh/m²/an',
    label: 'Production solaire utile moyenne France',
    detail: 'PACA 700 / Bretagne 350 / Alsace 480',
  },
  {
    cle: '25-30 ans',
    label: 'Durée de vie capteurs',
    detail: 'Garantie fabricant 10-25 ans, ballon 5-7 ans',
  },
  {
    cle: '7-12 ans',
    label: 'ROI typique CESI vs ballon élec',
    detail: 'ROI SSC plus long 12-18 ans (investissement plus lourd)',
  },
  {
    cle: '0,025 t CO2/an',
    label: 'Émissions évitées par m² de capteur',
    detail: 'CESI 4 m² = 100 kg CO2 évités/an',
  },
]

const QUAND_CHOISIR = [
  {
    cas: 'Vous remplacez un ballon électrique en zone ensoleillée',
    reco: '✅ CESI excellent',
    detail:
      'PACA, Occitanie, Nouvelle-Aquitaine, Corse : la production solaire (700-900 kWh/m²/an) couvre 70-80 % des besoins ECS. ROI 6-9 ans. Aides cumulées MPR + CEE peuvent financer 50-60 % du projet.',
  },
  {
    cas: 'Vous construisez en neuf BBC ou RE 2020',
    reco: '✅ SSC pertinent',
    detail:
      "Maison neuve bien isolée + plancher chauffant basse T° + 8-12 m² capteurs sud = SSC idéal. Couverture 50-60 % chauffage + ECS combinés. Crédit d'impôt et aides cumulables.",
  },
  {
    cas: 'Vous avez une maison ancienne mal isolée',
    reco: '🟡 SSC sous-performant',
    detail:
      "Le SSC nécessite une émission de chaleur basse T° (plancher chauffant ou radiateurs BT). Une maison mal isolée a besoin de hautes températures = perte d'efficacité solaire. Isoler avant d'envisager SSC.",
  },
  {
    cas: 'Vous habitez en zone Nord ou hivers longs',
    reco: '🟡 Tubes sous vide ou hybride PAC',
    detail:
      'Bretagne, Hauts-de-France, Alsace, Massif Central : production solaire faible 350-450 kWh/m²/an. Préférer tubes sous vide (+30-40 % rendement hiver) ou hybride solaire + PAC.',
  },
  {
    cas: "Vous voulez maximiser l'autonomie",
    reco: '✅ CESI + PV combinés',
    detail:
      'Pour une maison autonome ECS + chauffage + élec : CESI 4-6 m² (ECS) + PV 3-6 kWc + ballon thermo (appoint sortie de saison) + isolation. Investissement 25-35K € mais facture quasi-nulle.',
  },
  {
    cas: 'Vous habitez en appartement ou logement collectif',
    reco: '❌ Difficile en individuel',
    detail:
      "Nécessite copropriété qui pilote l'installation. Préférer ballon thermodynamique (PAC sur air ambiant), 5-10x moins cher et installable individuellement.",
  },
]

const faqs = [
  {
    question: 'Combien coûte un panneau solaire thermique en 2026 ?',
    answer:
      'Prix posé clé en main 2026 : 4 000-7 000 € pour un CESI 2-6 m² (ECS seule, ballon 200-400 L), 11 000-15 000 € pour un SSC 8-15 m² (ECS + chauffage central), 13 000-18 000 € pour un PSD (plancher solaire direct). Les capteurs représentent 30-40 % du devis (600-900 €/m² pour des plans vitrés, 900-1 400 €/m² pour des tubes sous vide), le ballon 15-25 % (1 500-3 000 €), la pose et le raccordement 35-55 %. Variations +10-20 % en Île-de-France et grandes métropoles.',
  },
  {
    question: 'Quelles aides 2026 pour un panneau solaire thermique ?',
    answer:
      "<strong>CESI</strong> : MaPrimeRénov' Bleu jusqu'à 4 000 € + CEE BAR-TH-101 ~250 € + éco-PTZ + TVA 5,5 % avec installateur RGE Qualisol. <strong>SSC</strong> : MaPrimeRénov' Bleu jusqu'à 10 000 € + CEE BAR-TH-102 ~700 € + éco-PTZ jusqu'à 30 000 €. Pour un foyer aux revenus très modestes, le reste à charge peut tomber à 1 000-3 000 € (CESI) ou 4 000-7 000 € (SSC) sur un projet 5 000-15 000 €. Conditions : capteurs certifiés Solar Keymark, pose par RGE Qualisol CESI ou Qualisol Combi, dossier France Rénov' déposé AVANT signature du devis.",
  },
  {
    question: 'Quelle différence entre solaire thermique et photovoltaïque ?',
    answer:
      "<strong>Photovoltaïque (PV)</strong> = capteurs en silicium qui transforment la lumière du soleil en <strong>électricité</strong>. Rendement 18-22 %. Aides : prime autoconsommation EDF OA, pas MPR ni CEE. <strong>Thermique</strong> = capteurs avec circuit de fluide caloporteur qui transforment le rayonnement solaire en <strong>chaleur</strong> (eau chaude). Rendement 40-60 %. Aides : MPR Bleu jusqu'à 10 000 € + CEE BAR-TH-101/102 + éco-PTZ. Les 2 technos sont COMPLÉMENTAIRES, pas concurrentes : PV pour l'électricité, thermique pour l'ECS et le chauffage.",
  },
  {
    question: 'CESI vs SSC : lequel choisir ?',
    answer:
      "<strong>CESI</strong> (4 000-7 000 €) si votre objectif est uniquement l'ECS, en remplacement d'un ballon électrique ou en complément d'une chaudière gaz. ROI 7-12 ans, pertinent en toute zone climatique. <strong>SSC</strong> (11 000-15 000 €) si vous voulez aussi couvrir une partie du chauffage : nécessite une émission basse température (plancher chauffant idéal), une maison BBC/RE 2020 ou bien isolée, et une zone solaire moyenne à élevée. ROI 12-18 ans, plus long mais aides MPR Bleu jusqu'à 10 000 €. Le CESI est le choix sûr pour 80 % des cas, le SSC pour les projets neufs ou rénovation lourde.",
  },
  {
    question: 'Quel rendement attendre selon ma zone ?',
    answer:
      'Production solaire utile moyenne France : <strong>500 kWh/m²/an</strong>. Variations selon zone climatique : <strong>PACA / Corse</strong> 700-900 kWh/m²/an, <strong>Sud-Ouest / Languedoc</strong> 600-750, <strong>Centre / Île-de-France</strong> 450-550, <strong>Bretagne / Pays de la Loire</strong> 350-450, <strong>Hauts-de-France / Alsace</strong> 400-500. Couverture besoins ECS : 70-80 % au Sud, 50-60 % au Centre, 40-50 % au Nord. Capteurs à tubes sous vide récupèrent +30-40 % en hiver vs plans, surtout pertinents au Nord.',
  },
  {
    question: 'Capteurs plans vitrés ou tubes sous vide ?',
    answer:
      "<strong>Plans vitrés</strong> (600-900 €/m²) : 80 % du marché, robuste, esthétique soignée. Idéal en zone tempérée à ensoleillée pour CESI. Rendement saisonnier 35-50 %. <strong>Tubes sous vide</strong> (900-1 400 €/m²) : top performance hiver (vide d'air = isolation parfaite). Rendement 45-60 %. Idéal SSC en zone froide ou pour maximiser la production hivernale. Plus chers, tubes individuels plus fragiles. Pour un CESI standard en zone tempérée, plans vitrés suffisent. Pour un SSC en zone froide, tubes sous vide rentabilisent vite le surcoût.",
  },
  {
    question: 'Quel installateur choisir ?',
    answer:
      'Plombier-chauffagiste qualifié <strong>RGE Qualisol CESI</strong> (chauffe-eau solaire individuel) ou <strong>Qualisol Combi</strong> (système solaire combiné), selon le projet. Sans cette qualification : aides MPR/CEE rejetées + TVA 20 % au lieu de 5,5 %. Vérifier : SIRET valide, attestation décennale, certificat Qualisol en cours de validité (1 an), références chantiers solaire (10 mini), devis détaillé avec marque, modèle, surface capteurs en m², classe Solar Keymark, volume ballon en L, mise en service. Comparer 2-3 devis.',
  },
  {
    question: 'Quel entretien pour un solaire thermique ?',
    answer:
      'Entretien recommandé tous les 3-5 ans (non obligatoire légalement contrairement aux chaudières) : 200-400 € HT par intervention. Inclut : contrôle pression circuit primaire (1,5-3 bar), test pH antigel (renouveler tous les 5-7 ans), vérification anode magnésium ballon, nettoyage capteurs (1 fois/an si pollution ou poussière), contrôle des sondes et régulation. Durée de vie capteurs 25-30 ans (garantie fabricant 10-25 ans), ballon 12-15 ans, pompe circulation 8-12 ans, antigel 5-7 ans.',
  },
]

const sources = [
  {
    label: "France Rénov' — Chauffe-eau solaire individuel (CESI)",
    url: 'https://france-renov.gouv.fr/renovation/chauffage/chauffe-eau-solaire',
  },
  {
    label: "ANAH — MaPrimeRénov' solaire thermique",
    url: 'https://www.anah.gouv.fr',
  },
  {
    label: 'ADEME — Énergie solaire thermique',
    url: 'https://www.ademe.fr',
  },
  {
    label: 'AFNOR — Norme NF EN 12975 (capteurs solaires thermiques)',
    url: 'https://www.afnor.org',
  },
  {
    label: 'Solar Keymark — Certification européenne capteurs',
    url: 'https://www.solarkeymark.eu',
  },
  {
    label: "Qualit'EnR — Mention RGE Qualisol CESI / Qualisol Combi",
    url: 'https://www.qualit-enr.org',
  },
  {
    label: 'Service-Public.fr — Aides à la rénovation énergétique',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F35054',
  },
  {
    label: 'Enerplan — Syndicat des professionnels du solaire',
    url: 'https://enerplan.asso.fr',
  },
]

const relatedPages = [
  {
    label: 'Hub Solaire 2026 — panneau PV',
    href: '/renovation-energetique/travaux/solaire',
    description: 'Photovoltaïque : électricité, autoconso, prix',
  },
  {
    label: 'Rendement panneau solaire',
    href: '/renovation-energetique/travaux/solaire/rendement',
    description: '5 technos PV, latitude, orientation, ombrage',
  },
  {
    label: 'Panneau solaire hybride PV-T (2-en-1)',
    href: '/renovation-energetique/travaux/solaire/hybride',
    description: 'Électricité + ECS sur un même panneau, +5-15 % rendement PV',
  },
  {
    label: 'Ballon thermodynamique 2026 — alternative ECS',
    href: '/renovation-energetique/travaux/ballon-thermodynamique',
    description: "PAC sur air, ECS 60-75 % d'économie",
  },
  {
    label: 'Chauffe-eau thermodynamique 2026',
    href: '/renovation-energetique/travaux/chauffage/chauffe-eau-thermodynamique',
    description: 'COP 3-3,5, ROI 4-6 ans, MPR 1 200 €',
  },
  {
    label: 'Hub aides rénovation',
    href: '/renovation-energetique/aides',
    description: 'MPR + CEE + éco-PTZ cumulables',
  },
  {
    label: 'Label RGE Qualisol',
    href: '/rge/labels/qualisol',
    description: 'Certification installateur solaire thermique',
  },
  {
    label: 'Trouver un installateur Qualisol',
    href: '/services/chauffagiste',
    description: 'Annuaire RGE Qualisol CESI / Combi',
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
    section: 'Solaire — Thermique',
    keywords: [
      'panneau solaire thermique',
      'panneaux solaires thermiques',
      'chauffe-eau solaire individuel',
      'cesi',
      'système solaire combiné',
      'ssc',
      'capteur solaire thermique',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique/travaux' },
    { name: 'Solaire', url: '/renovation-energetique/travaux/solaire' },
    { name: 'Thermique', url: PAGE_PATH },
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
              { label: 'Thermique' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Sun className="w-3.5 h-3.5" aria-hidden />
              EnR — MPR jusqu&apos;à 10 000 € (SSC)
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Panneau solaire thermique 2026 : prix CESI et SSC
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Le <strong>panneau solaire thermique</strong> capte le rayonnement solaire pour
              chauffer de l&apos;eau (ECS, chauffage), à ne pas confondre avec le photovoltaïque qui
              produit de l&apos;électricité. En 2026, deux systèmes principaux existent :{' '}
              <strong>CESI</strong> (chauffe-eau solaire individuel, <strong>4 000-7 000 €</strong>)
              et <strong>SSC</strong> (système solaire combiné ECS + chauffage,{' '}
              <strong>11 000-15 000 €</strong>). Les aides{' '}
              <strong>MaPrimeRénov&apos; Bleu jusqu&apos;à 10 000 €</strong> +{' '}
              <strong>CEE BAR-TH-101/102</strong> peuvent financer la moitié du projet. Voici tout
              pour bien choisir : 4 systèmes, 4 technos capteurs, 6 cas d&apos;usage.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2 id="systemes">4 systèmes solaires thermiques</h2>
            <div className="not-prose grid gap-3 my-6">
              {SYSTEMES.map((s) => (
                <div key={s.type} className="bg-white border border-sand-200 rounded-xl p-5">
                  <div className="flex items-baseline justify-between gap-2 flex-wrap mb-2">
                    <h3 className="font-heading text-base font-semibold text-sand-900 m-0">
                      {s.type}
                    </h3>
                    <span className="text-sm font-bold text-primary-700 whitespace-nowrap">
                      {s.prix}
                    </span>
                  </div>
                  <p className="text-xs text-amber-700 font-medium m-0 mb-1">
                    Couverture : {s.couverture}
                  </p>
                  <p className="text-sm text-sand-700 m-0">{s.detail}</p>
                </div>
              ))}
            </div>

            <h2 id="capteurs">4 technologies de capteurs</h2>
            <div className="not-prose grid gap-3 my-6">
              {TECHNOS_CAPTEURS.map((c) => (
                <div key={c.techno} className="bg-white border border-sand-200 rounded-xl p-5">
                  <div className="flex items-baseline justify-between gap-2 flex-wrap mb-2">
                    <h3 className="font-heading text-base font-semibold text-sand-900 m-0">
                      {c.techno}
                    </h3>
                    <span className="text-sm font-bold text-primary-700 whitespace-nowrap">
                      {c.prix}
                    </span>
                  </div>
                  <p className="text-xs text-sand-600 m-0 mb-2">
                    <strong>Rendement :</strong> {c.rendement}
                  </p>
                  <p className="text-xs text-accent-700 m-0 mb-1">
                    <strong>+</strong> {c.avantages}
                  </p>
                  <p className="text-xs text-amber-700 m-0">
                    <strong>−</strong> {c.inconvenients}
                  </p>
                </div>
              ))}
            </div>

            <h2 id="chiffres-cles">Chiffres clés du solaire thermique</h2>
            <div className="not-prose grid grid-cols-2 md:grid-cols-3 gap-3 my-6">
              {CHIFFRES_CLES.map((c) => (
                <div
                  key={c.cle}
                  className="bg-white border border-sand-200 rounded-xl p-4 text-center"
                >
                  <p className="font-heading text-2xl font-bold text-primary-700 m-0">{c.cle}</p>
                  <p className="text-xs font-semibold text-sand-900 m-0 mt-1">{c.label}</p>
                  <p className="text-xs text-sand-600 m-0 mt-1">{c.detail}</p>
                </div>
              ))}
            </div>

            <h2 id="aides">Aides 2026 cumulées</h2>
            <ul>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>MaPrimeRénov&apos; Bleu</strong> (revenus très modestes) : CESI{' '}
                <strong>4 000 €</strong>, SSC <strong>10 000 €</strong>. MPR Jaune (modestes) : CESI
                3 000 € / SSC 8 000 €. MPR Violet (intermédiaires) : CESI 2 000 € / SSC 4 000 €.
              </li>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>CEE BAR-TH-101</strong> (CESI) : ~250 € selon revenus.{' '}
                <strong>CEE BAR-TH-102</strong> (SSC) : ~700 €.
              </li>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Éco-PTZ</strong> : jusqu&apos;à <strong>30 000 €</strong> par geste,
                accessible si combiné avec d&apos;autres travaux d&apos;économie d&apos;énergie.
              </li>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>TVA 5,5 %</strong> : matériel + pose, sous condition d&apos;installateur RGE
                Qualisol et logement &gt; 2 ans.
              </li>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Aides locales</strong> (région, département, métropole) : variables 500-3
                000 €. Voir notre simulateur pour le détail par département.
              </li>
            </ul>

            <div className="not-prose flex items-start gap-3 border border-amber-200 bg-amber-50 rounded-lg p-4 my-6">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <div className="text-sm text-amber-900">
                <p className="font-semibold m-0 mb-1">Attention : pas confondre PV et thermique</p>
                <p className="m-0">
                  Le solaire <strong>photovoltaïque</strong> (PV) produit de l&apos;électricité —
                  pas éligible MaPrimeRénov&apos; ni CEE en résidentiel (juste prime
                  autoconsommation EDF OA). Le solaire <strong>thermique</strong> produit de la
                  chaleur — éligible MPR + CEE + éco-PTZ. Les commerciaux d&apos;Engie, EDF, Total
                  jouent souvent sur la confusion. Vérifiez le devis : « capteurs photovoltaïques »
                  = PV, « capteurs thermiques » ou « CESI » ou « SSC » = thermique.
                </p>
              </div>
            </div>

            <h2 id="quand-choisir">Quand choisir le solaire thermique ?</h2>
            <div className="not-prose grid gap-3 my-6">
              {QUAND_CHOISIR.map((q) => (
                <div key={q.cas} className="bg-white border border-sand-200 rounded-xl p-5">
                  <div className="flex items-baseline justify-between gap-2 flex-wrap mb-2">
                    <h3 className="font-heading text-base font-semibold text-sand-900 m-0">
                      {q.cas}
                    </h3>
                    <span className="text-xs font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded whitespace-nowrap">
                      {q.reco}
                    </span>
                  </div>
                  <p className="text-sm text-sand-700 m-0">{q.detail}</p>
                </div>
              ))}
            </div>

            <div className="not-prose flex items-start gap-3 border border-primary-200 bg-primary-50 rounded-lg p-5 my-8">
              <Calculator className="w-5 h-5 text-primary-700 shrink-0 mt-0.5" aria-hidden />
              <div className="flex-1">
                <p className="font-semibold text-primary-900 m-0 mb-1">
                  Estimer mes aides solaire thermique en 2 minutes
                </p>
                <p className="text-sm text-primary-900 m-0 mb-3">
                  Notre simulateur compare votre situation (revenus, surface, ECS actuelle, zone
                  climatique) pour estimer le coût net après aides MPR + CEE 2026 — CESI vs SSC vs
                  ballon thermo. Liste de chauffagistes Qualisol proches de chez vous.
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
                <strong>Installateur RGE Qualisol CESI</strong> ou <strong>Qualisol Combi</strong>{' '}
                obligatoire (selon CESI ou SSC). Sans : aides MPR/CEE rejetées + TVA passe à 20 %.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Capteurs certifiés Solar Keymark</strong> (norme européenne). À vérifier sur
                la fiche technique du matériel.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Orientation Sud ± 30°</strong>, inclinaison 30-60° (45° optimal France). Pas
                d&apos;ombrage entre 9h et 17h en hiver.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Surface toiture</strong> : 4 m² mini (CESI 4 personnes), 8-15 m² (SSC).
                Vérifier la portance avant pose (capteurs vitrés 25-35 kg/m²).
              </li>
              <li>
                <ShieldCheck className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Antigel propylène glycol</strong> obligatoire (toxicité limitée vs éthylène
                glycol interdit ECS). À renouveler tous les 5-7 ans (200-400 €).
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Marques fiables</strong> : Viessmann Vitosol, De Dietrich Pro Sol, Saunier
                Duval HelioPlan, Vaillant auroTHERM, Atlantic Solerio, Wagner & Co (DE), Sonnenkraft
                (AT), Schüco (DE).
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
              href="/services/chauffagiste"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Chauffagistes Qualisol <Coins className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
