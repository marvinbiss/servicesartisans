/**
 * Page : /renovation-energetique/travaux/solaire/autoconsommation
 *
 * @kw-primary    autoconsommation solaire
 * @kw-volume     2400
 * @kw-kd         14
 * @kw-cpc        1.60
 * @cluster       reno-energetique-solaire-autoconsommation
 * @ahrefs-source api-live
 * @snapshot      2026-05-06
 * @backlog-item  B4 (récap audits 2026-05-06 — sub-page Bloc 1 cluster solaire orphelin)
 *
 * KW cibles validés Ahrefs API live (2026-05-06, country=fr) :
 * - "autoconsommation solaire"           → 2 400 vol, KD 14, CPC $1,60 ⭐⭐⭐⭐ PIVOT
 * - "panneau solaire autoconsommation"   → 7 400 vol, KD 33, CPC $0,25 (head capture indirect)
 * - "batterie panneau solaire"           → 4 600 vol, KD 10, CPC $0,70 ⭐⭐⭐⭐⭐ MEGA EASY WIN
 * - "autoconsommation"                   → 3 500 vol, KD 21, CPC $1,30
 * - "kit panneau solaire autoconsommation" → 1 900 vol, KD 20, CPC $0,80
 * - "kit autoconsommation"               → 1 800 vol, KD 20, CPC $0,70
 * - "prime autoconsommation"             →   800 vol, KD 16, CPC $1,10
 * - "autoconsommation totale"            →    90 vol, KD 2, CPC $0,90 (long-tail facile)
 * - Famille cumulée pivot : ~22 490 vol/mois (KD 2-33)
 *
 * Easy win : OUI MAJEUR sur "batterie panneau solaire" KD 10 et "autoconsommation
 * solaire" KD 14. Concurrence head : Effy DR 72, EDF ENR, QuelleEnergie. Atout SA :
 * 3 985 QualiPV RGE actifs + simulateur + neutralité commerciale (pas vendeur kit).
 *
 * Cluster pillar : Rénovation Énergétique → Travaux → Solaire → Autoconsommation
 *
 * Anti-cannibalisation :
 *   - Hub /solaire = panneau solaire prix + comparatif modules + ROI
 *   - /solaire/nettoyage = entretien post-installation
 *   - /solaire/panneau-1000w = focus puissance unitaire 1000 W
 *   - /solaire/panneau-piscine = solaire thermique piscine
 *   - /solaire/panneau-souple = panneau souple flexible
 *   - Cette page = focus AUTOCONSOMMATION (concept, modes, batterie, ROI conso) —
 *     pas de chevauchement avec hub focus prix/marques/modules.
 *
 * YMYL : aide financière (Prime autoconso EDF OA) + fiscalité (TVA 10%, IR) +
 *        sécurité électrique (UTE C 15-712-1) + raccordement Enedis (CACSI).
 *        Hedge volontairement les tarifs achat surplus (barème CRE trimestriel
 *        révisé tous les 3 mois) avec renvoi cre.fr / edf-oa.fr.
 *
 * RAPPEL CRITIQUE :
 *   - PV pur PAS éligible CEE (cf src/lib/rge/qualification-matcher.ts:106)
 *   - PV pur PAS éligible MaPrimeRénov' (uniquement solaire thermique CESI/SSC)
 *   - Aides PV = uniquement Prime autoconso EDF OA + TVA 10% + IR exonéré ≤3 kWc
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  AlertTriangle,
  Battery,
  Calculator,
  CheckCircle2,
  Coins,
  Gauge,
  Home,
  Sun,
  TrendingDown,
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
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'

export const revalidate = 86400

const PAGE_PATH = '/renovation-energetique/travaux/solaire/autoconsommation'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'marc-lefebvre'
const AUTHOR_NAME = 'Marc Lefebvre'

const TITLE = 'Autoconsommation Solaire 2026 : kit, batterie, prime, ROI'
const DESCRIPTION =
  'Autoconsommation solaire 2026 : kit 7 500-15 000 € (3-6 kWc), Prime autoconso EDF OA + TVA 10 %. Batterie 5 000-10 000 €. ROI 8-12 ans.'

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
  'Autoconsommation = consommer sa propre production solaire (au lieu de la revendre 100 % à EDF OA).',
  '3 modes : autoconso TOTALE (sans injection), autoconso AVEC SURPLUS revendu, autoconso COLLECTIVE (entre voisins).',
  'Cadre légal : Code énergie L315-1 à L315-6 + décret 2017-676 + arrêté tarif CRE trimestriel.',
  'Prix kit autoconso 2026 : 7 500-9 500 € (3 kWc), 11 000-15 000 € (6 kWc), 17 000-25 000 € (9 kWc).',
  'Batterie domestique : 5 000-10 000 € HT (5-15 kWh utiles). ROI batterie 12-18 ans (souvent défavorable).',
  'Aides PV : Prime autoconso EDF OA (versée 5 ans) + TVA 10 % si ≤3 kWc + exonération IR si ≤3 kWc et autoconso. PAS éligible CEE ni MaPrimeRénov’.',
  'ROI moyen sans batterie : 8-12 ans. Avec batterie : 14-20 ans (pas rentable sauf cas particuliers).',
]

const MODES_AUTOCONSO = [
  {
    mode: 'Autoconsommation totale',
    description:
      'Toute la production est consommée sur place, AUCUN surplus injecté au réseau. Onduleur configuré "zero injection".',
    avantage: 'Pas de contrat EDF OA à signer, démarches administratives minimales.',
    inconvenient: 'Production écrêtée si trop d’ensoleillement (perte 5-15 % vs surplus injecté).',
    cible: 'Petits kits ≤ 3 kWc avec consommation diurne forte (résidence principale).',
    icon: 'home',
  },
  {
    mode: 'Autoconsommation avec revente du surplus',
    description:
      'Production consommée d’abord, le surplus est injecté et revendu à EDF OA (Obligation d’Achat) au tarif CRE.',
    avantage:
      'Aucune production perdue. Prime autoconso versée sur 5 ans. Tarif achat surplus garanti 20 ans.',
    inconvenient:
      'Démarches Enedis (CACSI) + contrat EDF OA Solaire à signer. Délai raccordement 2-6 mois.',
    cible: 'Configuration la plus courante en 2026 (~85 % des installations < 9 kWc).',
    icon: 'sun',
  },
  {
    mode: 'Autoconsommation collective',
    description:
      'Plusieurs producteurs/consommateurs partagent la production sur un même périmètre (ex : copropriété, lotissement, ferme). Cadre Personne Morale Organisatrice (PMO).',
    avantage:
      'Mutualise les coûts et l’usage. Périmètre géographique élargi (jusqu’à 2 km en BT depuis 2024).',
    inconvenient:
      'Montage juridique complexe (PMO + accord avec Enedis + clé de répartition). Coût administratif fixe 2 000-5 000 € au démarrage.',
    cible: 'Copropriétés, immeubles tertiaires, collectivités, hameaux ruraux.',
    icon: 'home',
  },
  {
    mode: 'Autoconsommation avec batterie',
    description:
      'Stockage dans une batterie domestique (lithium-ion, LFP) pour utiliser l’électricité solaire le soir/la nuit.',
    avantage:
      'Maximise le taux d’autoconsommation (de 25-30 % en direct à 60-80 % avec batterie 10 kWh).',
    inconvenient:
      'Coût batterie 5 000-10 000 € HT (à amortir 12-18 ans). Durée de vie batterie 10-15 ans = renouvellement nécessaire.',
    cible: 'Profils en télétravail forte conso le soir + foyers en zones isolées (microgrid).',
    icon: 'battery',
  },
]

const PRIX_KITS = [
  {
    puissance: '3 kWc (8-10 panneaux)',
    surface: '15-18 m²',
    production: '~3 200 kWh/an',
    prix_pose: '7 500 - 9 500 €',
    prime_autoconso: '~80 €/kWc × 5 ans = ~1 200 €',
    detail: 'Le seuil ≤ 3 kWc débloque TVA 10 % + exonération IR. Format standard pavillonnaire.',
  },
  {
    puissance: '6 kWc (16-18 panneaux)',
    surface: '30-36 m²',
    production: '~6 400 kWh/an',
    prix_pose: '11 000 - 15 000 €',
    prime_autoconso: '~80 €/kWc × 5 ans = ~2 400 €',
    detail: 'Format médian. TVA 20 % au-delà de 3 kWc. IR sur revenus de revente surplus.',
  },
  {
    puissance: '9 kWc (24-28 panneaux)',
    surface: '45-54 m²',
    production: '~9 500 kWh/an',
    prix_pose: '17 000 - 25 000 €',
    prime_autoconso: '~80 €/kWc × 5 ans = ~3 600 €',
    detail: 'Plafond habitat individuel. Au-delà = installation tertiaire ou ferme PV.',
  },
  {
    puissance: 'Batterie 5-10 kWh utiles',
    surface: 'Local technique 0,5-1 m²',
    production: '—',
    prix_pose: '+ 5 000 - 10 000 € HT',
    prime_autoconso: '—',
    detail:
      'Lithium LFP recommandé (sécurité + cycles). 10-15 ans durée de vie. ROI souvent défavorable.',
  },
]

const FACTEURS_TAUX_AUTOCONSO = [
  {
    facteur: 'Profil de consommation (jour vs nuit)',
    impact: '20-40 %',
    detail:
      'Famille présente la journée (télétravail, retraités) : 30-40 % autoconso direct. Famille absente la journée : 15-25 % seulement.',
  },
  {
    facteur: 'Puissance installée vs conso annuelle',
    impact: '15-30 %',
    detail:
      'Sur-dimensionner = baisse du taux. Idéal : production annuelle ≈ 1,2 × conso annuelle.',
  },
  {
    facteur: 'Pilotage des appareils (domotique)',
    impact: '+ 10-20 %',
    detail:
      'Lave-linge, sèche-linge, ECS pilotés en heures solaires (10h-15h) augmentent le taux jusqu’à 50 %.',
  },
  {
    facteur: 'Batterie de stockage',
    impact: '+ 30-50 %',
    detail: 'Batterie 10 kWh fait passer de 25-30 % (sans) à 60-80 % (avec). Attention coût.',
  },
  {
    facteur: 'Voiture électrique',
    impact: '+ 15-25 %',
    detail:
      'Recharger la voiture en heures solaires (week-end, télétravail) augmente significativement la conso autoconsommée.',
  },
  {
    facteur: 'Pompe à chaleur (PAC)',
    impact: '+ 5-15 %',
    detail:
      'PAC consomme plus l’hiver quand la production est faible. Gain modeste vs PV en autoconso classique.',
  },
]

const ETAPES_RACCORD = [
  {
    step: 'Étude technique + devis (J0 à J+30)',
    detail:
      'Installateur QualiPV vérifie toiture, exposition, ombrage, dimensionnement. Devis posé incluant onduleur, panneaux, câblage, démarches Enedis.',
  },
  {
    step: 'Demande raccordement Enedis (J+30 à J+60)',
    detail:
      'Convention CACSI (Convention d’Autoconsommation et Conditions de Raccordement) déposée par l’installateur sur enedis.fr. Réponse Enedis sous 30 jours.',
  },
  {
    step: 'Pose des panneaux + onduleur (J+60 à J+75)',
    detail:
      'Pose 2-3 jours typique pour 6 kWc. Norme UTE C 15-712-1 (PV connecté résidentiel). Disjoncteur DC + parasurtenseur obligatoires.',
  },
  {
    step: 'Visite Consuel (J+75 à J+90)',
    detail:
      'Attestation Consuel obligatoire pour autoriser la mise sous tension. Coût ~150 €. Valide la conformité électrique.',
  },
  {
    step: 'Raccordement Enedis + mise en service (J+90 à J+120)',
    detail:
      'Pose compteur Linky bidirectionnel (production + injection). Contrat Vente Surplus EDF OA Solaire signé en parallèle.',
  },
  {
    step: 'Première facturation EDF OA (J+180 à J+360)',
    detail:
      'Première vente du surplus + premier versement Prime autoconso (annuel sur 5 ans). Facture annuelle envoyée par EDF OA.',
  },
]

const faqs = [
  {
    question: 'Qu’est-ce que l’autoconsommation solaire en 2026 ?',
    answer:
      'L’autoconsommation solaire désigne le fait de consommer sur place l’électricité produite par ses propres panneaux photovoltaïques, au lieu de la vendre 100 % à EDF OA. Cadre légal : articles L315-1 à L315-6 du Code de l’énergie (créés par l’ordonnance 2016-1019). Trois modes possibles : (1) autoconsommation totale sans injection, (2) autoconsommation avec revente du surplus à EDF OA (le plus courant, ~85 % des installations 2026), (3) autoconsommation collective entre voisins/copropriétaires (cadre PMO).',
  },
  {
    question: 'Quel est le prix d’un kit autoconsommation 2026 ?',
    answer:
      'Pour un kit installé par un artisan QualiPV en 2026 : 3 kWc (8-10 panneaux, ~15 m², ~3 200 kWh/an) = 7 500-9 500 € TTC pose comprise. 6 kWc (~30 m², ~6 400 kWh/an) = 11 000-15 000 €. 9 kWc (~50 m², ~9 500 kWh/an) = 17 000-25 000 €. Le seuil ≤ 3 kWc bénéficie de TVA 10 % + exonération IR. Au-delà : TVA 20 %. Ajouter 5 000-10 000 € HT pour une batterie de stockage 5-10 kWh utiles.',
  },
  {
    question: 'Vaut-il mieux choisir l’autoconsommation totale ou avec revente surplus ?',
    answer:
      'Dans 85 % des cas : autoconsommation AVEC revente du surplus. Avantages : aucune production perdue (l’onduleur peut produire à 100 %), Prime autoconso versée sur 5 ans (~80 €/kWc/an), tarif achat surplus garanti 20 ans, démarches plus simples qu’il y a 5 ans. L’autoconsommation totale (zero injection) ne fait sens que si vous ne voulez pas signer de contrat EDF OA, avec un kit ≤ 3 kWc et une consommation diurne très forte permettant d’absorber 100 % de la production.',
  },
  {
    question: 'Une batterie panneau solaire est-elle rentable en 2026 ?',
    answer:
      'NON dans la majorité des cas. Coût batterie 5-10 kWh utiles : 5 000-10 000 € HT. Économie annuelle additionnelle : 250-500 € (passer de 25-30 % à 60-80 % autoconso). ROI : 12-18 ans, supérieur à la durée de vie de la batterie (10-15 ans). Cas où la batterie devient pertinente : (1) zone isolée (microgrid sans réseau fiable), (2) autoconso très spécifique (besoin nuit forte), (3) tarif Tempo + heures rouges, (4) résidence secondaire occupée principalement le soir. Préférer le pilotage intelligent des appareils (eau chaude, voiture, lave-linge) en heures solaires.',
  },
  {
    question: 'Comment fonctionne la Prime autoconsommation EDF OA ?',
    answer:
      'La Prime à l’investissement autoconsommation est versée par EDF OA sur 5 ans (1/5 par an) pour les installations ≤ 100 kWc avec revente du surplus. Montant 2026 : ~80-100 €/kWc en cumulé sur 5 ans selon barème CRE trimestriel. Exemple 6 kWc : ~480-600 € de prime totale (~96-120 €/an pendant 5 ans). Conditions : panneaux certifiés (IEC 61215+61730), installateur RGE QualiPV, raccordement Enedis officiel + contrat EDF OA Solaire. Versement automatique sur la facturation annuelle.',
  },
  {
    question: 'L’autoconsommation solaire est-elle éligible à MaPrimeRénov’ ou aux CEE ?',
    answer:
      'NON. Le solaire photovoltaïque pur (sans production d’eau chaude) n’est PAS éligible à MaPrimeRénov’ ni aux CEE en 2026. Aides PV résidentielles disponibles : (1) Prime autoconso EDF OA (versée 5 ans), (2) TVA 10 % si ≤ 3 kWc, (3) Exonération IR sur les revenus de revente si ≤ 3 kWc et autoconso, (4) Aides locales ponctuelles (région, département). Le solaire THERMIQUE (CESI ou SSC) est en revanche éligible à MaPrimeRénov’ et CEE BAR-TH-101 / BAR-TH-143. À ne pas confondre.',
  },
  {
    question: 'Quel artisan choisir pour installer son autoconsommation solaire ?',
    answer:
      'Exiger un installateur certifié RGE QualiPV (label délivré par Qualit’EnR), gage de conformité technique (norme UTE C 15-712-1) et d’éligibilité à la Prime autoconso EDF OA. Vérifier sur france-renov.gouv.fr la validité de la certification (renouvellement tous les 4 ans). Demander 3 devis comparatifs avec : marque + modèle des panneaux (DualSun, Sunpower, REC, JA Solar, Trina), puissance unitaire (mono 380-450 W typique), garantie produit (10-25 ans), garantie de production (25 ans), assurance décennale. Méfiance envers les démarcheurs téléphoniques (illégal depuis 2020 en rénovation énergétique).',
  },
  {
    question: 'Quel taux d’autoconsommation atteint-on en pratique ?',
    answer:
      'En autoconsommation directe (sans batterie, sans pilotage) : 25-35 % de la production est autoconsommée, le reste est injecté en surplus. Avec pilotage intelligent (lave-linge, sèche-linge, ECS programmés en heures solaires + voiture électrique rechargée le week-end) : taux monte à 40-50 %. Avec batterie 10 kWh utiles : 60-80 %. Il est très difficile de dépasser 80 % sans dimensionner volontairement le kit en sous-production. L’objectif n’est pas 100 % autoconso (sous-dimensionnement = sous-rentabilité), mais maximiser le taux à dimensionnement optimal.',
  },
]

const sources = [
  {
    label: 'Légifrance — Code énergie L315-1 à L315-6 (autoconsommation)',
    url: 'https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000023983208/LEGISCTA000034044413',
  },
  {
    label: 'Légifrance — Décret 2017-676 (autoconsommation collective)',
    url: 'https://www.legifrance.gouv.fr/loda/id/LEGITEXT000034447176',
  },
  {
    label: 'CRE — Barèmes tarifs achat surplus (trimestriel)',
    url: 'https://www.cre.fr/electricite/marche-de-detail/photovoltaique',
  },
  {
    label: 'EDF OA Solaire — Obligation d’Achat',
    url: 'https://www.edf-oa.fr/contrat/photovoltaique',
  },
  {
    label: 'AFNOR — Norme UTE C 15-712-1 (PV connecté résidentiel)',
    url: 'https://www.afnor.org',
  },
  {
    label: 'Enedis — Convention CACSI raccordement',
    url: 'https://www.enedis.fr/raccordement/raccorder-mon-installation-de-production',
  },
  {
    label: 'Service-Public.fr — Fiscalité autoconsommation solaire',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F2606',
  },
  {
    label: 'France Rénov’ — Annuaire QualiPV (Qualit’EnR)',
    url: 'https://france-renov.gouv.fr/annuaire-rge',
  },
]

const relatedPages = [
  {
    label: 'Hub Solaire 2026 (prix, marques, ROI)',
    href: '/renovation-energetique/travaux/solaire',
    description: 'Panneau solaire prix posé 7 500-19 000 €, comparatif 8 marques',
  },
  {
    label: 'Panneau solaire 1000 W',
    href: '/renovation-energetique/travaux/solaire/panneau-1000w',
    description: 'Kit puissance unitaire 1 kWc — démarrage budget serré',
  },
  {
    label: 'Panneau solaire piscine',
    href: '/renovation-energetique/travaux/solaire/panneau-piscine',
    description: 'Solaire thermique CESI piscine (vs PV)',
  },
  {
    label: 'Panneau solaire souple',
    href: '/renovation-energetique/travaux/solaire/panneau-souple',
    description: 'PV flexible (camping-car, bateau, toits faible portance)',
  },
  {
    label: 'Nettoyage panneau solaire',
    href: '/renovation-energetique/travaux/solaire/nettoyage',
    description: 'Maintenance pour préserver le rendement',
  },
  {
    label: 'Comparatif primes énergie 2026',
    href: '/cee/comparatif-primes-energie',
    description: 'Pour les autres travaux (PAC, isolation, biomasse — pas PV pur)',
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
    section: 'Travaux — Solaire — Autoconsommation',
    keywords: [
      'autoconsommation solaire',
      'panneau solaire autoconsommation',
      'batterie panneau solaire',
      'autoconsommation',
      'kit panneau solaire autoconsommation',
      'kit autoconsommation',
      'prime autoconsommation',
      'autoconsommation totale',
      'EDF OA Solaire',
      'CACSI Enedis',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique/travaux' },
    { name: 'Solaire', url: '/renovation-energetique/travaux/solaire' },
    { name: 'Autoconsommation', url: PAGE_PATH },
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
              { label: 'Autoconsommation' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Sun className="w-3.5 h-3.5" aria-hidden />
              Code énergie L315-1 à L315-6 — Décret 2017-676
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Autoconsommation Solaire 2026 : kit, batterie, prime, ROI
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              <strong>L’autoconsommation solaire</strong> consiste à consommer sa propre production
              photovoltaïque au lieu de la vendre 100 % à EDF OA. En 2026, c’est le modèle dominant
              en résidentiel : <strong>kit 7 500-15 000 €</strong> (3-6 kWc),{' '}
              <strong>Prime autoconso EDF OA</strong> versée 5 ans,{' '}
              <strong>TVA 10 % et exonération IR</strong> si ≤ 3 kWc. Voici les 3 modes (totale /
              avec surplus / collective), les leviers pour maximiser le taux d’autoconso, l’analyse
              coût/bénéfice de la batterie, et le ROI réel selon votre profil de consommation.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2 id="modes">3 modes d’autoconsommation solaire</h2>
            <p>
              Le Code de l’énergie (articles L315-1 à L315-6, créés par l’ordonnance 2016-1019)
              reconnaît officiellement <strong>3 modes</strong> d’autoconsommation, plus une
              variante avec stockage par batterie :
            </p>
            <div className="not-prose grid gap-3 my-6">
              {MODES_AUTOCONSO.map((m) => (
                <div key={m.mode} className="bg-white border border-sand-200 rounded-xl p-4">
                  <div className="flex items-start gap-2 mb-2">
                    {m.icon === 'home' ? (
                      <Home className="w-4 h-4 text-primary-700 shrink-0 mt-1" aria-hidden />
                    ) : m.icon === 'battery' ? (
                      <Battery className="w-4 h-4 text-primary-700 shrink-0 mt-1" aria-hidden />
                    ) : (
                      <Sun className="w-4 h-4 text-primary-700 shrink-0 mt-1" aria-hidden />
                    )}
                    <p className="font-semibold text-sand-900 m-0">{m.mode}</p>
                  </div>
                  <p className="text-sm text-sand-700 m-0 mb-2">{m.description}</p>
                  <p className="text-sm text-sand-700 m-0">
                    <strong>+</strong> {m.avantage}
                  </p>
                  <p className="text-sm text-sand-700 m-0 mt-1">
                    <strong>−</strong> {m.inconvenient}
                  </p>
                  <p className="text-xs text-sand-500 mt-2 mb-0">
                    <em>Cible : {m.cible}</em>
                  </p>
                </div>
              ))}
            </div>

            <h2 id="prix-kit">Prix kit autoconsommation 2026</h2>
            <p>
              Référence : kit posé par installateur RGE QualiPV en 2026, panneaux mono 380-450 W
              (DualSun / Sunpower / REC / JA Solar / Trina), onduleur central ou micro-onduleurs,
              câblage + démarches Enedis incluses.
            </p>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Puissance</th>
                    <th className="p-3 border-b border-sand-200">Surface</th>
                    <th className="p-3 border-b border-sand-200">Production/an</th>
                    <th className="p-3 border-b border-sand-200">Prix posé</th>
                    <th className="p-3 border-b border-sand-200">Prime autoconso</th>
                  </tr>
                </thead>
                <tbody>
                  {PRIX_KITS.map((k) => (
                    <tr key={k.puissance} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold text-sand-900">{k.puissance}</td>
                      <td className="p-3 text-sand-700">{k.surface}</td>
                      <td className="p-3 text-sand-700">{k.production}</td>
                      <td className="p-3 text-primary-700 font-semibold">{k.prix_pose}</td>
                      <td className="p-3 text-xs text-sand-700">{k.prime_autoconso}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-sand-500">
              Prime autoconso indicative selon barème CRE trimestriel (~80 €/kWc/an sur 5 ans en mai
              2026, valeur révisée tous les 3 mois). Vérifier le barème en vigueur avant engagement
              sur{' '}
              <a href="https://www.cre.fr" target="_blank" rel="noopener noreferrer">
                cre.fr
              </a>{' '}
              ou{' '}
              <a href="https://www.edf-oa.fr" target="_blank" rel="noopener noreferrer">
                edf-oa.fr
              </a>
              .
            </p>

            <h2 id="batterie">Batterie panneau solaire : rentable ou pas en 2026 ?</h2>
            <p>
              <Battery className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
              <strong>Réponse courte : NON, dans la majorité des cas</strong>. Une batterie
              domestique 5-10 kWh utiles coûte 5 000-10 000 € HT. Elle augmente le taux
              d’autoconsommation de 25-30 % à 60-80 %, soit une économie annuelle additionnelle de
              250-500 €. Le ROI ressort entre 12 et 18 ans, soit plus que la durée de vie de la
              batterie elle-même (10-15 ans pour Lithium LFP).
            </p>
            <p>
              <strong>Cas où la batterie devient pertinente</strong> :
            </p>
            <ul>
              <li>Zone isolée avec réseau peu fiable (microgrid familial).</li>
              <li>
                Profil de conso très tardif (rentré du travail à 20h+, télétravail soir uniquement).
              </li>
              <li>
                Tarif Tempo avec passage en heures rouges fréquent (la batterie évite l’achat à
                tarif rouge ~0,75 €/kWh).
              </li>
              <li>Résidence secondaire occupée principalement le soir/week-end.</li>
            </ul>
            <p>
              <strong>Alternative recommandée</strong> : pilotage intelligent des appareils gros
              consommateurs (eau chaude, lave-linge, sèche-linge, voiture électrique) en heures
              solaires (10h-15h) — gain de 10-20 points sur le taux d’autoconso pour 200-500 € de
              domotique seulement.
            </p>

            <h2 id="taux-autoconso">Comment maximiser son taux d’autoconsommation</h2>
            <p>
              <Gauge className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />6 facteurs
              influencent le taux d’autoconsommation effectif :
            </p>
            <div className="not-prose grid gap-3 my-6">
              {FACTEURS_TAUX_AUTOCONSO.map((f) => (
                <div key={f.facteur} className="bg-white border border-sand-200 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-semibold text-sand-900 m-0">→ {f.facteur}</p>
                    <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-primary-100 text-primary-800">
                      {f.impact}
                    </span>
                  </div>
                  <p className="text-sm text-sand-700 m-0">{f.detail}</p>
                </div>
              ))}
            </div>

            <h2 id="aides-fiscalite">Aides et fiscalité PV autoconso 2026</h2>
            <p>
              <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
              Le solaire photovoltaïque pur (sans production d’eau chaude){' '}
              <strong>n’est PAS éligible à MaPrimeRénov’ ni aux CEE</strong>. Aides effectivement
              disponibles :
            </p>
            <ul>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Prime autoconsommation EDF OA</strong> : versée sur 5 ans, ~80-100 €/kWc
                cumulés selon barème CRE trimestriel. Conditions : panneaux certifiés (IEC
                61215+61730), installateur RGE QualiPV.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>TVA 10 %</strong> sur fourniture + pose si puissance ≤ 3 kWc (article 279-0
                bis A CGI). Au-delà : TVA 20 %.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Exonération IR</strong> sur les revenus de revente du surplus si puissance ≤
                3 kWc + résidence principale + autoconsommation (article 35 ter du CGI). Au-delà :
                revenus à déclarer en BIC.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Tarif d’achat surplus garanti 20 ans</strong> via contrat EDF OA Solaire
                (~0,12-0,15 €/kWh selon trimestre CRE en mai 2026).
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Aides locales ponctuelles</strong> : région, département, métropole — à
                vérifier ADIL.
              </li>
            </ul>

            <div className="not-prose flex items-start gap-3 border border-amber-200 bg-amber-50 rounded-lg p-4 my-6">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <div className="text-sm text-amber-900">
                <p className="font-semibold m-0 mb-1">
                  Attention : "panneau solaire gratuit gouvernement" = arnaque
                </p>
                <p className="m-0">
                  Aucun dispositif gouvernemental ne propose de panneaux solaires gratuits en 2026.
                  Les démarches commerciales par téléphone ou démarchage à domicile pour la
                  rénovation énergétique sont <strong>illégales depuis juillet 2020</strong> (loi
                  2020-901). Méfiance absolue : ces "offres gratuites" cachent des contrats de
                  cession de toiture sur 20-30 ans avec coûts cachés. Toujours passer par un
                  installateur RGE QualiPV via{' '}
                  <a
                    href="https://france-renov.gouv.fr/annuaire-rge"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    france-renov.gouv.fr
                  </a>
                  .
                </p>
              </div>
            </div>

            <h2 id="raccordement">Raccordement Enedis + EDF OA : 6 étapes</h2>
            <div className="not-prose my-6">
              <ol className="space-y-3 list-none m-0 p-0">
                {ETAPES_RACCORD.map((s, i) => (
                  <li
                    key={s.step}
                    className="bg-white border border-sand-200 rounded-xl p-4 flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-700 text-white grid place-items-center shrink-0 font-bold">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-sand-900 m-0">{s.step}</p>
                      <p className="text-sm text-sand-700 mt-1 mb-0">{s.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <h2 id="roi">ROI d’une installation autoconsommation 2026</h2>
            <p>
              <TrendingDown className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
              <strong>Cas type 6 kWc, famille 4 personnes, zone H2, conso 7 000 kWh/an</strong> :
            </p>
            <ul>
              <li>Devis posé : 13 000 € TTC (TVA 20 % au-dessus de 3 kWc)</li>
              <li>Production : 6 400 kWh/an</li>
              <li>Taux autoconso (sans batterie, avec pilotage léger) : 35 %</li>
              <li>Économie facture EDF (autoconso 35 %) : 2 240 kWh × 0,2516 € = 564 €/an</li>
              <li>Revente surplus (65 %) : 4 160 kWh × 0,13 € = 541 €/an</li>
              <li>Prime autoconso : ~480 €/an pendant 5 ans</li>
              <li>
                Total recettes annuelles : ~1 585 €/an (5 premières années), 1 105 €/an ensuite
              </li>
              <li>
                <strong>ROI : ~10 ans</strong> — au-delà, l’installation continue de produire 15 ans
                (durée de vie panneaux 25 ans avec dégradation 0,4 %/an).
              </li>
            </ul>
            <p className="text-xs text-sand-500">
              Hypothèses 2026. Hausse tarif EDF +5 %/an = ROI réel plus court (~8-9 ans). Calcul à
              ajuster avec votre conso réelle + simulation officielle service-public ou cre.fr.
            </p>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Devis 3 installateurs RGE QualiPV
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Comparaison panneaux + onduleur + batterie + démarches Enedis. Réponse 48 h,
                    déplacement gratuit. Simulation Prime autoconso EDF OA + TVA + IR.
                  </p>
                  <Link
                    href="/devis"
                    className="inline-flex items-center gap-1.5 bg-primary-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
                  >
                    Demander 3 devis <ArrowRight className="w-4 h-4" aria-hidden />
                  </Link>
                </div>
              </div>
            </div>

            <h2 id="dimensionnement">Comment dimensionner son installation autoconso ?</h2>
            <p>
              <Zap className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
              <strong>Règle empirique 2026</strong> : production annuelle ≈ 1 à 1,2 × consommation
              annuelle. Sous-dimensionner = manque de couverture. Sur-dimensionner = injection forte
              rémunérée mais perte d’opportunité d’autoconso.
            </p>
            <ul>
              <li>
                Conso 4 000 kWh/an (couple, petit logement) → kit 3 kWc (production ~3 200 kWh/an).
              </li>
              <li>
                Conso 7 000 kWh/an (famille 4, sans PAC ni VE) → kit 6 kWc (production ~6 400
                kWh/an).
              </li>
              <li>
                Conso 12 000 kWh/an (famille 4 avec PAC ou voiture électrique) → kit 9 kWc
                (production ~9 500 kWh/an, plafond résidentiel).
              </li>
              <li>
                Au-delà de 12 000 kWh/an : envisager un kit 9 kWc + batterie OU 9 kWc + 2e
                installation séparée (cumul possible).
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
              href="/renovation-energetique/travaux/solaire/nettoyage"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Nettoyage solaire <Coins className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
