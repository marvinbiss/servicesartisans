/**
 * Page : /renovation-energetique/travaux/vmc/double-flux-thermodynamique
 *
 * @kw-primary    vmc double flux thermodynamique
 * @kw-volume     1800
 * @kw-kd         0
 * @kw-cpc        0.95
 * @intent        commercial
 * @cluster       reno-energetique-vmc-double-flux-thermodynamique
 * @ahrefs-source bloc1
 * @snapshot      2026-05-06
 * @backlog-item  Sprint1-20-80-vmc-df-thermo
 *
 * KW cibles validés Ahrefs Bloc 1 v3 (2026-05-04, country=fr) :
 * - "vmc double flux thermodynamique"  → 1 800 vol, KD 0 ⭐⭐⭐⭐⭐ PIVOT (quelleenergie #1)
 * - "vmc thermodynamique"              →   500 vol, KD 0 ⭐⭐⭐⭐
 * - "double flux thermodynamique"      →   200 vol, KD 0 (variant)
 * - "vmc thermo"                       →   150 vol, KD 0 (long-tail)
 * - "df thermo prix"                   →   100 vol, KD 0
 * - Famille cumulée pivot : ~2 750 vol/mois (KD 0 partout = TOP TOP EASY WIN)
 *
 * Easy win : OUI MEGA — KD 0 sur tout le cluster. quelleenergie.fr leader actuel
 * (page-mine #36 : 1 078 traffic/mo, 25 KW associés). Atout SA : neutralité prix +
 * comparatif marques + simulateur aides + RGE Qualibat 8721.
 *
 * Anti-cannibalisation :
 *   - Hub /vmc = panorama tous types VMC (intent info head term)
 *   - /vmc-double-flux (top-level) = focus VMC DF standard + prix + récup chaleur
 *   - /vmc/simple-flux, /hygroreglable = VMC simple flux (autre famille)
 *   - /vmc/installation = process pose centralisée
 *   - Cette page = focus DEEP VMC DF THERMO (PAC + DF combinés) :
 *     fonctionnement spécifique, ROI vs DF standard, marques dédiées, pré-chauffe
 *     hiver + rafraîchissement été, COP, économies cumulées.
 *
 * YMYL : aide financière (MaPrimeRénov' Bleu 2 500 € + CEE 500-1 200 €) +
 *        sécurité (PAC = fluide frigorigène F-Gas, étanchéité annuelle si ≥ 5 tCO2-eq).
 * Cite Légifrance + ADEME + AFPAC + Code environnement F-Gas.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Award,
  Calculator,
  Coins,
  Snowflake,
  Thermometer,
  Wind,
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
import { getBreadcrumbSchema, getFAQSchema, getGovernmentServiceSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import SimulateurAideBox from '@/components/conversion/SimulateurAideBox'
import LocalProviderShowcase from '@/components/seo/LocalProviderShowcase'
import { getProvidersByService } from '@/lib/supabase'
import PrixComparatif from '@/components/conversion/PrixComparatif'

export const revalidate = 86400

const PAGE_PATH = '/renovation-energetique/travaux/vmc/double-flux-thermodynamique'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'marc-lefebvre'
const AUTHOR_NAME = 'Marc Lefebvre'

const TITLE = 'VMC double flux thermodynamique 2026 : prix, ROI, marques'
const DESCRIPTION =
  'VMC double flux thermodynamique 2026 : 6 000-9 000 € posée, COP 3-4,5, MaPrimeRénov’ 2 500 € + CEE 500-1 200 €. Pré-chauffe hiver + rafraîchissement été. Marques Aldes, Atlantic, Zehnder.'

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
  'VMC double flux thermodynamique = VMC DF + pompe à chaleur (PAC) intégrée. Pré-chauffe l’air neuf en hiver, le rafraîchit en été.',
  'Prix posé 2026 : 6 000-9 000 € (vs 4 000-6 500 € pour DF standard). Surcoût ~2 000-3 000 €.',
  'COP 3 à 4,5 : 1 kWh élec → 3 à 4,5 kWh chaleur récupérée + restituée. Rendement total 85-95 %.',
  'MaPrimeRénov’ Bleu : 2 500 €. CEE Coup de pouce : 500-1 200 € selon revenus + obligé.',
  'Économies cumulées vs DF simple : +5-10 % chauffage + 50-150 €/an de rafraîchissement passif été.',
  'ROI 7-12 ans selon climat (mieux dans Sud + maisons RT 2012/RE 2020 bien isolées).',
  'Marques top 2026 : Aldes T.Flow ThermoVisio, Atlantic Optimocosy HR Hygro, Zehnder ComfoAir Q450, Helios KWL EC.',
]

const FONCTIONNEMENT = [
  {
    etape: '1. Extraction air vicié',
    detail:
      'L’air vicié des pièces humides (cuisine, SDB, WC) est aspiré par les bouches d’extraction. Débit moyen 100-300 m³/h selon T1 à T6+. Air à 19-22 °C en hiver, 24-27 °C en été.',
  },
  {
    etape: '2. Échangeur double flux (récup chaleur)',
    detail:
      'L’air vicié transite par un échangeur à plaques contre-courant qui récupère 70-90 % de sa chaleur (sans contact avec l’air neuf). C’est le principe DF standard.',
  },
  {
    etape: '3. Pompe à chaleur intégrée',
    detail:
      'L’air neuf pré-réchauffé par l’échangeur passe ensuite par un évaporateur PAC (R32 ou R290 généralement). La PAC ajoute 5-10 °C en hiver — l’air arrive à 18-22 °C aux bouches d’insufflation. En été, le cycle s’inverse : la PAC rafraîchit l’air neuf de 4-7 °C.',
  },
  {
    etape: '4. Insufflation pièces de vie',
    detail:
      'Air filtré, tempéré et neuf insufflé dans salon, chambres, bureau. Rendement total chauffage récupéré + apporté : 85-95 % (vs 70-85 % en DF standard).',
  },
  {
    etape: '5. Production ECS optionnelle',
    detail:
      'Certains modèles (ex. Aldes T.Flow ThermoVisio) intègrent un ballon ECS thermodynamique 200-270 L. Récupère l’énergie de l’air extrait pour chauffer l’eau chaude sanitaire. COP 3-3,5 sur ECS. Surcoût +1 500-3 000 €.',
  },
]

const COMPARATIF_DF = [
  {
    critere: 'Prix posé clé en main',
    df_standard: '4 000-6 500 €',
    df_thermo: '6 000-9 000 €',
    surcout: '+1 500-3 000 €',
  },
  {
    critere: 'Rendement chauffage récupéré',
    df_standard: '70-85 %',
    df_thermo: '85-95 %',
    surcout: '+10-15 pts',
  },
  {
    critere: 'COP de la PAC intégrée',
    df_standard: '—',
    df_thermo: 'COP 3-4,5',
    surcout: 'Apport actif chaleur',
  },
  {
    critere: 'Rafraîchissement passif été',
    df_standard: 'Léger (bypass)',
    df_thermo: '4-7 °C de moins',
    surcout: 'Confort été net',
  },
  {
    critere: 'Économie chauffage annuelle',
    df_standard: '300-700 €/an',
    df_thermo: '400-900 €/an',
    surcout: '+50-200 €/an',
  },
  {
    critere: 'Conso élec annuelle',
    df_standard: '50-100 kWh/an',
    df_thermo: '300-700 kWh/an',
    surcout: '+250-600 kWh',
  },
  {
    critere: 'MaPrimeRénov’ Bleu',
    df_standard: '2 500 €',
    df_thermo: '2 500 €',
    surcout: 'Identique',
  },
  {
    critere: 'CEE Coup de pouce',
    df_standard: '500-1 200 €',
    df_thermo: '500-1 200 €',
    surcout: 'Identique',
  },
  {
    critere: 'Durée de vie matériel',
    df_standard: '15-25 ans',
    df_thermo: '15-20 ans (PAC limite)',
    surcout: 'Légère réduction',
  },
  {
    critere: 'Entretien annuel',
    df_standard: '50-100 €',
    df_thermo: '150-250 €',
    surcout: '+100-150 €',
  },
]

const TOP_MARQUES = [
  {
    marque: 'Aldes',
    modele: 'T.Flow ThermoVisio',
    prix: '7 500-9 500 € posé',
    detail:
      'Made in France. PAC R32 intégrée + ballon ECS thermodynamique 200 L (option). COP 3,5-4,2. Pilotage via app smartphone. Garantie 2 ans pose + 5 ans matériel.',
  },
  {
    marque: 'Atlantic',
    modele: 'Optimocosy HR Hygro Premium Thermo',
    prix: '7 000-9 000 € posé',
    detail:
      'Hygroréglable B + récup chaleur 90 % + PAC. Auto-équilibrage débits. Filtre F7 anti-pollens. Conformité RT 2012 / RE 2020. Garantie 2 ans pose + 5 ans matériel.',
  },
  {
    marque: 'Zehnder',
    modele: 'ComfoAir Q450 + ComfoCool',
    prix: '8 500-11 000 € posé',
    detail:
      'Haut de gamme suisse. Échangeur 95 % rendement + module PAC ComfoCool en option (cooling actif). Filtre F7+H13 (HEPA) en option. Pilotage app + Apple HomeKit. Top silence < 35 dB(A).',
  },
  {
    marque: 'Helios',
    modele: 'KWL EC 370 W ET',
    prix: '7 500-9 500 € posé',
    detail:
      'Allemand. Récup chaleur 92 % + cycle inversé été (rafraîchissement). EC moteurs basse conso. Pilotage Bluetooth. Compatible domotique KNX. Garantie 5 ans.',
  },
  {
    marque: 'Mitsubishi Electric',
    modele: 'Lossnay LGH-200 + booster PAC',
    prix: '8 000-10 500 € posé',
    detail:
      'Échangeur enthalpique récup chaleur 75 % + humidité 70 %. Module PAC R32 intégrable. Idéal grandes surfaces 150-250 m². Conformité RE 2020.',
  },
]

const ROI_CAS = [
  {
    cas: 'Maison RE 2020 100 m² Lyon',
    investissement: '7 500 € (après aides 4 000 € : MPR 2 500 + CEE 1 200 + dispo)',
    economie_annuelle: '850 €/an chauffage + 120 €/an confort été',
    roi: '7-8 ans',
    detail:
      'Climat semi-continental. Maison neuve très bien isolée. La VMC DF thermo apporte +5 % chauffage vs DF simple + rafraîchissement passif été = ROI rapide.',
  },
  {
    cas: 'Rénovation lourde 1980 — 120 m² Bordeaux',
    investissement: '8 200 € (après aides 4 200 €)',
    economie_annuelle: '1 100 €/an chauffage + 150 €/an confort été',
    roi: '7-8 ans',
    detail:
      'Climat océanique tempéré. Maison rénovée (isolation murs/toiture/menuiseries). VMC DF thermo amplifie effet isolation et atténue surchauffe été.',
  },
  {
    cas: 'Maison ancienne peu isolée — 110 m² Lille',
    investissement: '8 500 €',
    economie_annuelle: '500 €/an',
    roi: '15-17 ans',
    detail:
      'Climat océanique. Sans isolation préalable, la VMC DF thermo n’est PAS rentable. Investir d’abord dans isolation murs/combles puis revoir la VMC.',
  },
  {
    cas: 'Maison RE 2020 130 m² Marseille',
    investissement: '7 800 € (après aides 4 100 €)',
    economie_annuelle: '700 €/an chauffage + 280 €/an confort été (climatisation évitée)',
    roi: '8-10 ans',
    detail:
      'Climat méditerranéen. Le rafraîchissement passif été pèse plus lourd dans le calcul. Si pas de clim installée, ROI très bon.',
  },
]

const faqs = [
  {
    question: 'Qu’est-ce qu’une VMC double flux thermodynamique ?',
    answer:
      'Une VMC double flux thermodynamique combine deux technologies : (1) une VMC double flux classique avec échangeur récupérateur de chaleur (rendement 70-90 %) et (2) une pompe à chaleur (PAC) intégrée qui pré-réchauffe activement l’air neuf en hiver (+5-10 °C, COP 3-4,5) et peut le rafraîchir en été (-4 à -7 °C). Résultat : air insufflé à 18-22 °C en toute saison, rendement total 85-95 %, économies chauffage cumulées et confort thermique optimal. Prix posé 6 000-9 000 € (vs 4 000-6 500 € pour DF simple). Éligible MaPrimeRénov’ Bleu 2 500 €.',
  },
  {
    question: 'Quel est le prix d’une VMC double flux thermodynamique ?',
    answer:
      'En 2026 : 6 000-9 000 € posée selon marque, surface, complexité installation. Détail : matériel 3 500-5 500 €, gaines + bouches 800-1 500 €, pose 1 200-2 000 €. Avec ballon ECS thermodynamique intégré (option) : +1 500-3 000 €. Surcoût vs VMC DF standard : 1 500-3 000 €. Aides cumulées 2026 : MaPrimeRénov’ Bleu jusqu’à 2 500 € + CEE Coup de pouce 500-1 200 € + TVA 5,5 % rénovation logement > 2 ans. Reste à charge final : 3 000-5 500 € selon revenus.',
  },
  {
    question: 'Quelle différence entre VMC double flux et VMC double flux thermodynamique ?',
    answer:
      'La VMC double flux STANDARD utilise uniquement un échangeur à plaques pour récupérer la chaleur de l’air vicié extrait (rendement 70-90 % passif). La VMC double flux THERMODYNAMIQUE ajoute une pompe à chaleur (PAC) qui apporte ACTIVEMENT de la chaleur supplémentaire avec un COP 3-4,5 (1 kWh élec → 3-4,5 kWh chaleur). Différences clés : rendement 85-95 % (vs 70-85 %), pré-chauffe air neuf (+5-10 °C en hiver), rafraîchissement passif été (-4-7 °C), conso élec +250-600 kWh/an, surcoût matériel +1 500-3 000 €, mêmes aides MaPrimeRénov’ Bleu et CEE.',
  },
  {
    question: 'Pour quel type de logement choisir une VMC double flux thermodynamique ?',
    answer:
      'Profil idéal : (1) Logement BIEN ISOLÉ (RT 2012, RE 2020 ou rénovation lourde post-2010 isolation murs + combles + menuiseries) — sans cela, le surcoût n’est pas amorti. (2) Climat moyen à chaud (Sud, Sud-Ouest, vallée du Rhône) où le rafraîchissement passif été a un vrai impact. (3) Maison de 80-200 m² avec accès combles ou local technique pour caisson + ballon ECS. (4) Budget travaux ≥ 7 000 €. Profils à éviter : appartement (manque place + difficulté pose), maison ancienne sans isolation préalable (ROI 15+ ans), petit logement < 60 m² (surdimensionnement).',
  },
  {
    question: 'Quel est le ROI (retour sur investissement) d’une VMC DF thermodynamique ?',
    answer:
      'ROI moyen : 7-12 ans selon climat, isolation et tarifs énergie. Sur logement RE 2020 ou rénovation lourde dans climat semi-continental ou océanique, ROI 7-9 ans. Sur logement mal isolé, ROI 15+ ans (non rentable). Calcul type : investissement 7 500 € après aides → économies cumulées 800-1 200 €/an (chauffage + confort été = climatisation évitée) → amortissement 7-10 ans. Bonus : durée de vie matériel 15-20 ans, donc 5-13 ans de gains nets après amortissement.',
  },
  {
    question: 'La VMC double flux thermodynamique est-elle éligible à MaPrimeRénov’ ?',
    answer:
      'OUI. La VMC double flux thermodynamique est éligible à MaPrimeRénov’ Bleu (2 500 €), Jaune (2 000 €), Violet (1 500 €) ou Rose (0 €). Conditions : (1) installation par un artisan RGE Qualibat 8721 ou QualiClimaFroid (PAC) ; (2) déposer le dossier sur france-renov.gouv.fr AVANT signature du devis ; (3) résidence principale construite > 15 ans (sauf bouquet de travaux) ; (4) modèle conforme à la liste des équipements éligibles ADEME. Cumul possible avec CEE Coup de pouce 500-1 200 € et TVA 5,5 %.',
  },
  {
    question: 'Quelles sont les meilleures marques de VMC double flux thermodynamique ?',
    answer:
      'Top 5 marché 2026 : (1) Aldes T.Flow ThermoVisio (made in France, COP 3,5-4,2, 7 500-9 500 € posé) ; (2) Atlantic Optimocosy HR Hygro Thermo (hygroréglable B + récup 90 %, 7 000-9 000 €) ; (3) Zehnder ComfoAir Q450 + ComfoCool (suisse haut de gamme, échangeur 95 %, 8 500-11 000 €) ; (4) Helios KWL EC 370 W ET (allemand, récup 92 %, 7 500-9 500 €) ; (5) Mitsubishi Electric Lossnay LGH-200 (échangeur enthalpique humidité, 8 000-10 500 €). Critères de choix : rendement échangeur, COP PAC, niveau sonore (< 30 dB(A) confort), garantie pose 2 ans + matériel 5 ans minimum.',
  },
  {
    question: 'L’entretien d’une VMC double flux thermodynamique est-il complexe ?',
    answer:
      'Plus exigeant qu’une DF standard. Entretien recommandé : (1) Changement filtres tous les 6 mois (15-30 €) ; (2) Nettoyage gaines tous les 5-7 ans (250-450 €) ; (3) Contrôle annuel PAC par chauffagiste qualifié QualiClimaFroid (120-200 €) — vérification fluide R32 ou R290, pression, étanchéité ; (4) Contrôle décennal F-Gas si charge ≥ 5 tCO2-eq (rare en VMC DF thermo, charge typique 0,5-1,5 kg R32). Coût annuel cumul : 150-250 € (vs 50-100 € DF standard). Modèles avec auto-diagnostic et alertes app smartphone facilitent suivi.',
  },
  {
    question: 'Faut-il un climatiseur si on a une VMC DF thermodynamique ?',
    answer:
      'NON dans la plupart des cas. La VMC DF thermo apporte un rafraîchissement passif de 4-7 °C de l’air neuf insufflé en été. Sur une maison bien isolée et orientée correctement, c’est suffisant pour maintenir 24-26 °C intérieur quand il fait 32-35 °C dehors. Insuffisant en cas de canicule ≥ 38 °C ou maison mal isolée. Pour comparer : un climatiseur réversible coûte 3 000-6 000 € posé + 200-500 €/an d’élec. La VMC DF thermo coûte +1 500-3 000 € sur la VMC DF standard et fait climatisation passive sans surcoût d’élec significatif. Combo intelligent : VMC DF thermo + brasseurs d’air + volets/stores extérieurs.',
  },
]

const sources = [
  {
    label: 'Légifrance — Code de la construction et de l’habitation R162-3 (ventilation logements)',
    url: 'https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006074096',
  },
  {
    label: 'Légifrance — Arrêté du 24 mars 1982 modifié (aération logements)',
    url: 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000852525',
  },
  {
    label: 'Légifrance — Décret 2020-912 (entretien équipements de génie climatique)',
    url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000042170143',
  },
  {
    label: 'AFNOR — NF DTU 68.3 (mise en œuvre VMC simple/double flux)',
    url: 'https://www.afnor.org',
  },
  {
    label: 'France Rénov’ — Guide MaPrimeRénov’ Bleu 2026',
    url: 'https://france-renov.gouv.fr/aides/mpr',
  },
  {
    label: 'ADEME — Guide ventilation des logements (PDF)',
    url: 'https://librairie.ademe.fr',
  },
  {
    label: 'AFPAC — Association française pompes à chaleur (référence COP)',
    url: 'https://www.afpac.org',
  },
  {
    label: 'Règlement UE 517/2014 F-Gas (fluides frigorigènes)',
    url: 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX%3A32014R0517',
  },
]

const relatedPages = [
  {
    label: 'Hub VMC : 4 types comparés',
    href: '/renovation-energetique/travaux/vmc',
    description: 'Autoréglable, hygroréglable, double flux + prix posé',
  },
  {
    label: 'VMC double flux standard',
    href: '/renovation-energetique/travaux/vmc-double-flux',
    description: 'Récup chaleur 70-90 %, prix 4 000-6 500 €, MaPrimeRénov’ 2 500 €',
  },
  {
    label: 'VMC hygroréglable type A et B',
    href: '/renovation-energetique/travaux/vmc/hygroreglable',
    description: 'Économie 5-10 % vs autoréglable, choix #1 rénovation classique',
  },
  {
    label: 'Installation VMC : étapes, prix, checklist',
    href: '/renovation-energetique/travaux/vmc/installation',
    description: 'Process pose 1-4 jours, devis RGE Qualibat 8721',
  },
  {
    label: 'MaPrimeRénov’ 2026 — montants',
    href: '/renovation-energetique/aides/maprimerenov-2026/montants',
    description: 'Bleu 2 500 €, Jaune 2 000 €, Violet 1 500 € pour DF',
  },
  {
    label: 'Pompe à chaleur air-eau (alternative chauffage actif)',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/air-eau-prix',
    description: 'PAC air-eau 9-14 kW pour rénovation, 10-18 K€ posée',
  },
  {
    label: 'Simulateur aides rénovation',
    href: '/simulateur-aides-renovation',
    description: 'MaPrimeRénov’ + CEE en 2 minutes',
  },
]

export default async function Page() {
  const providers = await getProvidersByService('ventilation', 6)
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: PAGE_PATH,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Travaux — VMC — Double flux thermodynamique',
    keywords: [
      'vmc double flux thermodynamique',
      'vmc thermodynamique',
      'double flux thermodynamique',
      'vmc thermo',
      'df thermo prix',
      'aldes t.flow thermovisio',
      'atlantic optimocosy thermo',
      'zehnder comfoair',
      'maprimerenov vmc double flux',
      'cop pac vmc',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique/travaux' },
    { name: 'VMC', url: '/renovation-energetique/travaux/vmc' },
    { name: 'Double flux thermodynamique', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const govServiceSchema = getGovernmentServiceSchema({
    name: 'MaPrimeRénov’ Bleu — VMC double flux thermodynamique',
    description:
      'Aide d’État jusqu’à 2 500 € pour l’installation d’une VMC double flux thermodynamique en résidence principale construite > 15 ans, par artisan RGE Qualibat 8721.',
    url: PAGE_URL,
    serviceType: 'GovernmentSubsidy',
  })
  const schemas = [articleSchema, breadcrumbSchema, faqSchema, govServiceSchema].filter(
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
              { label: 'VMC', href: '/renovation-energetique/travaux/vmc' },
              { label: 'Double flux thermodynamique' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Thermometer className="w-3.5 h-3.5" aria-hidden />
              MaPrimeRénov’ 2 500 € + CEE 500-1 200 €
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              VMC double flux thermodynamique 2026 : prix, ROI, marques
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Une <strong>VMC double flux thermodynamique</strong> combine récupération passive de
              chaleur (échangeur 85-95 %) et <strong>pompe à chaleur intégrée</strong> (COP 3-4,5)
              qui pré-chauffe l’air neuf en hiver et le rafraîchit en été. Prix posé{' '}
              <strong>6 000-9 000 €</strong>, MaPrimeRénov’ Bleu jusqu’à 2 500 €, CEE 500-1 200 €.
              Voici fonctionnement, ROI, marques top et cas concrets.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2 id="fonctionnement">Comment fonctionne une VMC double flux thermodynamique</h2>
            <p>
              <Wind className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
              La VMC DF thermodynamique combine deux technologies en cascade : un{' '}
              <strong>échangeur à plaques</strong> (récup chaleur passive 70-90 %) suivi d’une{' '}
              <strong>pompe à chaleur</strong> (apport actif chaleur, COP 3-4,5). En 5 étapes :
            </p>
            <ol className="not-prose list-none space-y-3 my-6">
              {FONCTIONNEMENT.map((f) => (
                <li key={f.etape} className="bg-white border border-sand-200 rounded-xl p-4">
                  <p className="font-semibold text-sand-900 m-0 mb-1">{f.etape}</p>
                  <p className="text-sand-700 m-0 text-sm leading-relaxed">{f.detail}</p>
                </li>
              ))}
            </ol>

            <h2 id="comparatif">Comparatif VMC DF standard vs DF thermodynamique</h2>
            <p>
              Sur 10 critères clés, voici l’écart entre la version standard et la version
              thermodynamique. Le surcoût initial est compensé par les économies chauffage et le
              confort été.
            </p>
            <div className="not-prose overflow-x-auto my-6">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-sand-100">
                  <tr>
                    <th className="text-left p-3 border border-sand-200 font-semibold">Critère</th>
                    <th className="text-left p-3 border border-sand-200 font-semibold">
                      DF standard
                    </th>
                    <th className="text-left p-3 border border-sand-200 font-semibold">
                      DF thermo
                    </th>
                    <th className="text-left p-3 border border-sand-200 font-semibold">
                      Différence
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARATIF_DF.map((c) => (
                    <tr key={c.critere}>
                      <td className="p-3 border border-sand-200 font-medium">{c.critere}</td>
                      <td className="p-3 border border-sand-200">{c.df_standard}</td>
                      <td className="p-3 border border-sand-200 font-semibold text-primary-800">
                        {c.df_thermo}
                      </td>
                      <td className="p-3 border border-sand-200 text-sand-600">{c.surcout}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 id="marques">Top 5 marques VMC double flux thermodynamique 2026</h2>
            <p>
              Marché dominé par 5 fabricants. Critères de différenciation : rendement échangeur, COP
              de la PAC, niveau sonore (idéal &lt; 30 dB(A)), garanties, intégration ECS
              thermodynamique en option.
            </p>
            <div className="not-prose grid gap-4 my-6">
              {TOP_MARQUES.map((m) => (
                <div key={m.marque} className="bg-white border border-sand-200 rounded-xl p-5">
                  <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
                    <p className="font-bold text-sand-900 m-0">
                      <Award className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                      {m.marque} — <span className="text-primary-800">{m.modele}</span>
                    </p>
                    <span className="text-sm font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded">
                      {m.prix}
                    </span>
                  </div>
                  <p className="text-sand-700 m-0 text-sm leading-relaxed">{m.detail}</p>
                </div>
              ))}
            </div>

            <h2 id="roi">ROI selon climat et isolation : 4 cas concrets</h2>
            <p>
              Le retour sur investissement varie fortement selon le profil. Voici 4 cas types pour
              calibrer votre projet (chiffres ADEME 2026 + retour terrain artisans RGE).
            </p>
            <div className="not-prose space-y-4 my-6">
              {ROI_CAS.map((c) => (
                <div key={c.cas} className="bg-white border border-sand-200 rounded-xl p-5">
                  <p className="font-semibold text-sand-900 m-0 mb-2">{c.cas}</p>
                  <ul className="text-sm text-sand-700 m-0 mb-3 space-y-1 list-none p-0">
                    <li>
                      <Coins className="inline w-3.5 h-3.5 text-primary-700 mr-1" aria-hidden />
                      Investissement net : <strong>{c.investissement}</strong>
                    </li>
                    <li>
                      <Zap className="inline w-3.5 h-3.5 text-primary-700 mr-1" aria-hidden />
                      Économie annuelle : <strong>{c.economie_annuelle}</strong>
                    </li>
                    <li>
                      <Snowflake className="inline w-3.5 h-3.5 text-primary-700 mr-1" aria-hidden />
                      ROI : <strong>{c.roi}</strong>
                    </li>
                  </ul>
                  <p className="text-sm text-sand-600 m-0 italic">{c.detail}</p>
                </div>
              ))}
            </div>

            <h2 id="aides">Aides 2026 : MaPrimeRénov’ + CEE + TVA 5,5 %</h2>
            <p>
              Pour une <strong>VMC double flux thermodynamique</strong> en résidence principale
              construite depuis plus de 15 ans, vous pouvez cumuler :
            </p>
            <ul>
              <li>
                <strong>MaPrimeRénov’ Bleu</strong> : 2 500 € (revenus très modestes), Jaune 2 000 €
                (modestes), Violet 1 500 € (intermédiaires), Rose 0 € (supérieurs).
              </li>
              <li>
                <strong>CEE Coup de pouce</strong> : 500-1 200 € selon obligé (TotalEnergies, EDF,
                Engie, Sonergia, Hellio) et profil de revenus.
              </li>
              <li>
                <strong>TVA 5,5 %</strong> sur la pose et le matériel (vs 20 % standard) si logement
                &gt; 2 ans.
              </li>
              <li>
                <strong>Éco-PTZ</strong> : prêt à taux 0 jusqu’à 50 000 € pour bouquet de travaux
                incluant la VMC DF thermo.
              </li>
            </ul>
            <p>
              <strong>Ordre obligatoire</strong> : déposer le dossier MaPrimeRénov’ AVANT signature
              du devis (sinon refus). Choisir l’obligé CEE AVANT signature également (l’engagement
              prime se contractualise pré-travaux).
            </p>

            <h2 id="cta">Trouvez un artisan RGE Qualibat 8721 + QualiClimaFroid</h2>
            <div className="not-prose bg-primary-50 border border-primary-200 rounded-xl p-6 my-6">
              <p className="text-sand-900 m-0 mb-3">
                <Calculator className="inline w-5 h-5 text-primary-700 mr-1" aria-hidden />
                <strong>Devis VMC double flux thermodynamique en 30 secondes</strong> — comparez 2-3
                artisans RGE Qualibat 8721 + QualiClimaFroid (PAC) pour bénéficier de MaPrimeRénov’
                et CEE Coup de pouce.
              </p>
              <Link
                href="/devis"
                className="inline-flex items-center gap-2 bg-primary-700 hover:bg-primary-800 text-white font-semibold px-5 py-3 rounded-lg transition"
              >
                Demander mes devis VMC DF thermo <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
            </div>

            <h2 id="entretien">Entretien et durée de vie</h2>
            <p>Plus exigeant qu’une DF standard. Recommandations :</p>
            <ul>
              <li>
                <strong>Filtres</strong> : changement tous les 6 mois (15-30 €/jeu). Filtre F7
                minimum pour pollens et particules fines.
              </li>
              <li>
                <strong>Nettoyage gaines</strong> : tous les 5-7 ans (250-450 € par un spécialiste).
              </li>
              <li>
                <strong>Contrôle PAC annuel</strong> : 120-200 € par chauffagiste qualifié
                QualiClimaFroid. Vérification fluide R32/R290, pression, étanchéité.
              </li>
              <li>
                <strong>Contrôle décennal F-Gas</strong> : si charge fluide ≥ 5 tCO2-eq (rare en VMC
                DF thermo, charge typique 0,5-1,5 kg R32 = ~1 tCO2-eq).
              </li>
              <li>
                <strong>Coût annuel total</strong> : 150-250 €/an (vs 50-100 € pour DF standard).
              </li>
              <li>
                <strong>Durée de vie</strong> : 15-20 ans (PAC est le composant limitant). Échangeur
                peut durer 25-30 ans seul.
              </li>
            </ul>
          </article>

          <PrixComparatif
            title="Top 5 marques VMC double flux thermodynamique 2026 (posé clé en main)"
            caption="Prix tout compris matériel + pose RGE Qualibat 8721 + QualiClimaFroid. Maison 100-130 m². Sources : Aldes, Atlantic, Zehnder, Helios, Mitsubishi, retours terrain devis."
            rows={[
              {
                brand: 'Aldes',
                model: 'T.Flow ThermoVisio',
                priceRange: '7 500 - 9 500 €',
                warranty: '2 ans pose + 5 ans matériel',
                rating: 4.4,
                notes: 'Made in France, COP 3,5-4,2, ECS option',
                highlight: true,
              },
              {
                brand: 'Atlantic',
                model: 'Optimocosy HR Hygro Thermo',
                priceRange: '7 000 - 9 000 €',
                warranty: '2 ans pose + 5 ans matériel',
                rating: 4.3,
                notes: 'Hygro B + récup 90 %, filtre F7 pollens',
              },
              {
                brand: 'Zehnder',
                model: 'ComfoAir Q450 + ComfoCool',
                priceRange: '8 500 - 11 000 €',
                warranty: '2 ans pose + 5 ans matériel',
                rating: 4.6,
                notes: 'Haut de gamme suisse, échangeur 95 %, < 35 dB',
              },
              {
                brand: 'Helios',
                model: 'KWL EC 370 W ET',
                priceRange: '7 500 - 9 500 €',
                warranty: '5 ans matériel',
                rating: 4.2,
                notes: 'Récup 92 % + cycle inversé été, domotique KNX',
              },
              {
                brand: 'Mitsubishi Electric',
                model: 'Lossnay LGH-200',
                priceRange: '8 000 - 10 500 €',
                warranty: '2 ans pose + 5 ans matériel',
                rating: 4.1,
                notes: 'Échangeur enthalpique, idéal 150-250 m²',
              },
            ]}
            withSchema
          />

          <SimulateurAideBox
            serviceKey="vmc-double-flux-thermodynamique"
            estimatedSaving={3700}
            subtitle="MaPrimeRénov' Bleu 2 500 € + CEE Coup de pouce 500-1 200 € — RGE Qualibat 8721 + QualiClimaFroid obligatoire"
          />

          <LocalProviderShowcase
            providers={providers}
            serviceName="Installateur VMC RGE"
            cityName="France"
          />

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
