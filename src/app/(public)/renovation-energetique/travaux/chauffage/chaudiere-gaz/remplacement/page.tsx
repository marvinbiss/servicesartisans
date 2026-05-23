/**
 * Page : /renovation-energetique/travaux/chauffage/chaudiere-gaz/remplacement
 *
 * @kw-primary    remplacement chaudiere gaz
 * @kw-volume     600
 * @kw-kd         1
 * @kw-cpc        2.10
 * @intent        commercial + transactional
 * @cluster       chaudiere
 * @ahrefs-source docs/ahrefs-bloc1-keywords-gap-2026-05-04.md (rang #110)
 * @snapshot      2026-05-04 (Ahrefs Bloc 1 v3 — sub-cluster remplacement chaudière)
 * @backlog-item  Levier-Q-remplacement-chaudiere-gaz
 *
 * KW cibles (validés Ahrefs gap CSV 2026-04, country=fr) :
 * - "remplacement chaudière gaz"     600 vol, KD 1 ⭐⭐ pivot rang #110
 * - "changement chaudiere gaz"       400 vol, KD 0 (rang #139)
 * - "installation chaudière gaz"     500 vol, KD 0 (rang #111)
 * - "installation chaudiere gaz"     700 vol, KD 0 (rang #81)
 * - "remplacer chaudière gaz"        ~250 vol estimé KD 1
 * - "prix remplacement chaudière"    ~150 vol estimé KD 1
 * - Famille cumulée pivot : ~2 600 vol/mois (KD 0-1 = quasi-libre)
 *
 * Easy win : OUI MAJEUR (KD 0-1, intent transactionnel haut funnel ⇒ devis).
 * Concurrence : quelleenergie #1 page commodité, effy, EDF — tous orientés vente.
 * Atout SA : guide HONNÊTE remplacement (quand, comment, alternatives 2026,
 * comparatif coût net après aides, planning chantier, erreurs à éviter).
 *
 * Cluster pillar : Rénovation Énergétique → Travaux → Chauffage → Chaudière gaz → Remplacement
 *
 * Anti-cannibalisation :
 *   - /chauffage                                  = hub chauffage (4 familles)
 *   - /chauffage/chaudiere-gaz                    = parent panorama 4 types + statut RE2020
 *   - /chauffage/chaudiere-condensation           = sub-tech condensation (rendement)
 *   - /chauffage/chaudiere-condensation/entretien = entretien obligatoire annuel
 *   - /chauffage/chaudiere-bois                   = chaudière biomasse (autre énergie)
 *   - /chauffage/chaudiere-granules               = chaudière granulés (autre énergie)
 *   - /pompe-a-chaleur/air-eau-prix               = PAC air-eau (alternative recommandée)
 *   - Cette page = ACTION remplacement/changement/installation : quand le faire,
 *     comparatif 5 alternatives 2026, planning chantier 4 phases, prix net après aides,
 *     10 erreurs à éviter, choisir QualiGaz Évolution + RGE.
 *
 * YMYL high : décisions investissement 4-22K€, statut réglementaire (MPR exclue
 * chaudière gaz seule depuis 2024), arbitrage technique (condensation vs PAC vs hybride).
 * Cite : Légifrance RE2020, Arrêté 5 juillet 2022, France Rénov', Service-Public.fr,
 * ADEME, Code énergie L100-4, Décret 2009-649 (entretien), QualiGaz Évolution.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  AlertTriangle,
  Calculator,
  CheckCircle2,
  Coins,
  Flame,
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

const PAGE_PATH = '/renovation-energetique/travaux/chauffage/chaudiere-gaz/remplacement'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'jean-pierre-duval'
const AUTHOR_NAME = 'Jean-Pierre Duval'

const TITLE = 'Remplacement chaudière gaz 2026 : prix, aides & alternatives'
const DESCRIPTION =
  "Remplacer sa chaudière gaz en 2026 : signaux d'alerte, 5 alternatives (condensation, PAC, hybride, biomasse), prix net après aides, planning chantier."

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
  "7 signaux d'alerte : âge ≥ 15 ans, pannes ≥ 2/an, fumées noires, surconsommation, fuite, bruit, suie.",
  '5 alternatives 2026 : condensation directe, PAC air-eau (recommandé), hybride PAC + gaz, biomasse pellets, réseau de chaleur.',
  'Prix posé remplacement : 4 500-7 500 € (condensation), 12 000-15 000 € (PAC air-eau), 14 000-22 000 € (hybride), 18 000-28 000 € (chaudière granulés).',
  "MaPrimeRénov' supprimée pour chaudière gaz seule depuis 2024. Switch vers PAC ou biomasse = aides massives jusqu'à 13 000 €.",
  "CEE Coup de pouce chauffage : 4 000 € sur PAC air-eau, jusqu'à 9 000 € si sortie passoire DPE F/G.",
  'Planning chantier : visite (J-15), dépose (J0 matin), pose neuve (J0 après-midi), mise en service (J0 soir). 1 journée si condensation, 2-3 si PAC.',
  'Choisir QualiGaz Évolution + RGE pour bénéficier TVA 5,5 % et CEE. Vérifier décennale + 3 références.',
]

const SIGNAUX_REMPLACEMENT = [
  {
    icone: '🕰️',
    titre: 'Âge supérieur à 15 ans',
    detail:
      "Une chaudière gaz a une durée de vie réelle de 15-20 ans. Au-delà, le rendement chute (perte 5-10 % vs neuf à condensation), les pièces de rechange deviennent rares et le coût d'entretien grimpe (180-300 € HT/an au lieu de 100-180 €). À 18 ans, anticiper le remplacement plutôt qu'attendre la panne hivernale.",
  },
  {
    icone: '🚨',
    titre: '2 pannes ou plus par an',
    detail:
      "Si vous appelez le SAV plus de 2 fois par an pour une réparation chaudière (vase d'expansion, circulateur, sonde, brûleur), le coût cumulé dépasse souvent 600-1 000 €/an. À ce niveau, l'amortissement d'une neuve devient rapide.",
  },
  {
    icone: '🌫️',
    titre: 'Fumées noires ou odeurs',
    detail:
      'Combustion incomplète = brûleur encrassé, dépôts de suie, échangeur entartré. Risque CO (intoxication monoxyde de carbone). Faire intervenir un chauffagiste QualiGaz immédiatement et remplacer si la chaudière est obsolète (atmosphérique sans condensation).',
  },
  {
    icone: '📈',
    titre: 'Facture gaz qui grimpe sans raison',
    detail:
      "Si votre consommation augmente de 15-25 % d'une année sur l'autre à climat constant, c'est le signe d'un rendement en chute libre. Une chaudière atmosphérique de 25 ans tourne à 65-70 % vs 92-94 % pour une condensation neuve. Économie 20-30 % sur la facture juste avec le remplacement.",
  },
  {
    icone: '💧',
    titre: 'Fuite ou pression instable',
    detail:
      "Pression circuit qui chute en permanence (vous remettez de l'eau chaque semaine) = fuite micro sur l'échangeur ou les soudures. Une réparation coûte 400-800 € sans garantie de tenir. Si la chaudière a > 12 ans, basculer sur le remplacement.",
  },
  {
    icone: '🔊',
    titre: 'Bruits anormaux (claquements, sifflements)',
    detail:
      "Claquement = expansion thermique de l'échangeur entartré. Sifflement = entartrage circuit ECS ou problème de circulation. Symptômes mécaniques d'une chaudière en fin de vie. Le remplacement reste plus rentable qu'une réparation lourde (échangeur neuf : 600-1 200 €).",
  },
  {
    icone: '⚫',
    titre: 'Suie ou condensation visible sur la chaudière',
    detail:
      'Suie noire autour du brûleur ou du conduit = combustion défectueuse. Condensation excessive sur le corps = isolation thermique dégradée. Ces deux symptômes accompagnent souvent un rendement effondré (< 75 %). Remplacement urgent vers une condensation moderne ou (mieux) une PAC.',
  },
]

const ALTERNATIVES_REMPLACEMENT = [
  {
    titre: 'Condensation directe (remplacement comme pour comme)',
    prix: '4 500-7 500 €',
    aides: '300-700 € CEE seul (MPR exclue)',
    netApresAides: '4 200-6 800 €',
    avantage:
      'Solution la plus rapide (1 jour de chantier), réutilise tubage existant, conserve combustible familier, rendement η_s 92-94 %.',
    inconvenient:
      "Toujours fossile (CO2 = 2,5-4 t/an pour 100 m²), coût gaz qui grimpe, MaPrimeRénov' exclue depuis 2024, ROI 8-15 ans uniquement sur facture.",
    quandChoisir:
      'Vous avez < 5 ans avant déménagement, contraintes techniques fortes (copropriété), budget serré, isolation déjà top niveau.',
  },
  {
    titre: 'PAC air-eau (alternative recommandée)',
    prix: '12 000-15 000 €',
    aides: 'MPR Bleu 5 000 € + CEE Coup de pouce 4 000 € + bonus passoire 1 500 €',
    netApresAides: '4 500-7 000 €',
    avantage:
      'Coût NET (après aides) similaire à une condensation, factures divisées par 2-3, COP 3-4,5, éligible MPR + CEE massifs, valorisation DPE = +1 à 2 classes.',
    inconvenient:
      "Chantier 2-3 jours, unité extérieure visible (40-90 dB à 1 m), nécessite radiateurs basse température ou plancher chauffant pour optimum, dépend de la qualité d'isolation.",
    quandChoisir:
      'Maison correctement isolée (DPE C-D ou mieux), terrain pour unité ext, foyer 2+ personnes, vous restez 7+ ans dans le logement. CAS GAGNANT 2026.',
  },
  {
    titre: 'Hybride PAC + chaudière gaz condensation',
    prix: '14 000-22 000 €',
    aides: 'MPR Bleu 4 000 € + CEE 1 500-3 000 €',
    netApresAides: '8 500-15 000 €',
    avantage:
      'PAC en charge principale (90 % du temps), chaudière gaz uniquement en grand froid (< -7 °C). Compromis idéal maisons mal isolées (DPE E-G), conserve confort gaz en pointe.',
    inconvenient:
      'Investissement initial le plus élevé, complexité technique (2 systèmes), maintenance plus coûteuse (2 entretiens annuels), tubage + alimentation gaz à conserver.',
    quandChoisir:
      'Maison ancienne mal isolée que vous ne voulez pas isoler maintenant, climat froid (Massif Central, Est), pertes thermiques élevées. Seul cas où MPR finance encore le gaz.',
  },
  {
    titre: 'Chaudière à granulés bois (biomasse)',
    prix: '18 000-28 000 €',
    aides: 'MPR Bleu 7 000 € + CEE Coup de pouce 4 000 € + bonus passoire 1 500 €',
    netApresAides: '6 500-15 500 €',
    avantage:
      "Énergie renouvelable (CO2 quasi-neutre), prix granulé stable (300-500 €/t), aides MPR très généreuses (jusqu'à 7 000 € MPR Bleu), confort élevé (chauffage + ECS), durée de vie 25-30 ans.",
    inconvenient:
      'Espace silo nécessaire (3-5 m² pour 2-3 t), plus de manutention (livraison camion souffleur), entretien plus poussé (vidange cendrier, ramonage 2x/an), tubage spécifique (inox 316L).',
    quandChoisir:
      'Maison rurale ou périurbaine avec espace silo, sortie de chaudière fioul, accessibilité camion souffleur, 2+ personnes, surface 100+ m², zone climatique froide.',
  },
  {
    titre: 'Réseau de chaleur urbain (raccordement)',
    prix: '3 000-8 000 €',
    aides: 'CEE Coup de pouce raccordement 800 €',
    netApresAides: '2 200-7 200 €',
    avantage:
      "Plus économique en zone dense urbaine, énergie souvent renouvelable (biomasse, géothermie, déchets), pas d'entretien individuel, durée 30-50 ans, TVA 5,5 % sur abonnement.",
    inconvenient:
      'Disponibilité géographique limitée (~6 % logements France), tarif réseau dépendant du contrat collectif, pas de contrôle individuel sur la production, durée engagement 5-10 ans.',
    quandChoisir:
      "Logement situé à moins de 100 m d'un réseau actif (vérifier carte SNCU). Idéal copropriété chauffage collectif gaz pour mutualiser le raccordement.",
  },
]

const PHASES_CHANTIER = [
  {
    phase: 'Phase 1 — Visite technique (J-15 à J-7)',
    duree: '1-2 h',
    detail:
      "Le chauffagiste mesure la chaudière existante, vérifie le tubage, l'évacuation, le réseau hydraulique, l'alimentation gaz et l'espace de pose. Il prend photos, calcule la puissance nécessaire (formule G x DJU pour la zone climatique) et établit le devis détaillé. Préférer 2-3 visites pour comparer.",
  },
  {
    phase: 'Phase 2 — Commande et préparation (J-7 à J-1)',
    duree: '6-7 jours',
    detail:
      'Délai de réflexion légal 14 jours (loi Hamon) si signature à domicile. Acompte versé (30 % standard). Chauffagiste commande la chaudière, vérifie disponibilité, planifie le passage. Si CEE, dossier déposé avant chantier (TRÈS important : pas de CEE rétroactif).',
  },
  {
    phase: 'Phase 3 — Dépose et pose (J0 — 1 journée standard)',
    duree: '6-10 h',
    detail:
      'Coupure gaz + eau + élec. Dépose ancienne chaudière (1-2 h, évacuation matériaux 80 % recyclable). Pose neuve : fixation murale ou socle, raccordement hydraulique (départ + retour + ECS), évacuation fumées (tubage existant ou nouveau), alimentation gaz, raccordement électrique (sonde extérieure pour optimisation).',
  },
  {
    phase: 'Phase 4 — Mise en service et contrôle (J0 — fin de journée)',
    duree: '1-2 h',
    detail:
      'Purge circuit hydraulique, mise en eau, montée en pression, contrôle étanchéité gaz (pression test), mise sous tension, paramétrage régulation (courbe de chauffe selon zone climatique), contrôle combustion (CO, CO2, T° fumées), test ECS, formation utilisateur (notice, sondes, codes erreur). Attestation conformité gaz remise.',
  },
]

const PRIX_PAR_SCENARIO = [
  {
    scenario: '1️⃣ Remplacement direct condensation (logique actuelle)',
    detail:
      'Vieille chaudière atmosphérique → condensation 18-24 kW murale, tubage existant réutilisé.',
    prixPose: '4 500-6 500 €',
    aides: '500-700 € CEE Coup de pouce',
    cumul: '4 000-6 000 € net',
  },
  {
    scenario: '2️⃣ Remplacement condensation + ballon ECS séparé',
    detail:
      'Vieille chaudière atmosphérique → condensation 25-35 kW au sol + ballon ECS 200 L intégré.',
    prixPose: '6 500-9 500 €',
    aides: '500-700 € CEE seul',
    cumul: '6 000-8 800 € net',
  },
  {
    scenario: '3️⃣ Switch vers PAC air-eau (RECOMMANDÉ)',
    detail: 'Chaudière gaz → PAC air-eau bibloc 8-14 kW + module hydraulique.',
    prixPose: '12 000-15 000 €',
    aides: "5 000 € MPR Bleu + 4 000 € CEE = 9 000 € (jusqu'à 10 500 € si passoire)",
    cumul: '3 000-6 000 € net (souvent < condensation seule)',
  },
  {
    scenario: '4️⃣ Switch vers hybride PAC + condensation',
    detail: 'Chaudière fioul ou gaz → système hybride PAC 5-8 kW + condensation 24 kW.',
    prixPose: '14 000-22 000 €',
    aides: '4 000 € MPR Bleu + 2 000 € CEE = 6 000 €',
    cumul: '8 000-16 000 € net',
  },
  {
    scenario: '5️⃣ Switch vers chaudière granulés (biomasse)',
    detail: 'Vieille chaudière → chaudière granulés 18-28 kW + silo 3-5 m³.',
    prixPose: '18 000-28 000 €',
    aides: "7 000 € MPR Bleu + 4 000 € CEE = 11 000 € (jusqu'à 12 500 € passoire)",
    cumul: '7 000-17 000 € net',
  },
]

const ERREURS_A_EVITER = [
  '❌ Signer un devis sans visite technique préalable (mesure puissance, tubage, alimentation gaz).',
  '❌ Choisir un installateur non QualiGaz Évolution (refus assurance + obligation décennale).',
  '❌ Choisir un installateur non RGE (perte CEE + TVA 20 % au lieu de 5,5 %).',
  '❌ Démarrer le chantier avant dépôt du dossier CEE (pas de CEE rétroactif, perdu sec).',
  '❌ Surdimensionner (puissance > 30 % besoins) → cycles courts, surconsommation 10-15 %, usure rapide.',
  '❌ Sous-dimensionner (puissance < besoins) → confort dégradé, fonctionnement permanent en pointe.',
  '❌ Réutiliser un tubage non compatible condensation (corrosion 6 mois) — exiger tubage inox 316L.',
  '❌ Oublier la sonde extérieure (perte 8-15 % rendement saisonnier — obligatoire RT2012/RE2020).',
  '❌ Refuser la mise en service formelle (contrôle combustion, CO, CO2 fumées, attestation).',
  '❌ Confier la révocation du contrat fioul/gaz précédent au chauffagiste (vous = titulaire, vous résiliez).',
]

const faqs = [
  {
    question: 'Quand faut-il remplacer sa chaudière gaz ?',
    answer:
      "7 signaux principaux : (1) âge ≥ 15 ans, (2) ≥ 2 pannes/an, (3) fumées noires ou odeurs (combustion incomplète), (4) facture qui grimpe à climat constant, (5) fuite ou pression instable, (6) bruits anormaux (claquements, sifflements), (7) suie ou condensation visible. Au-delà de 18 ans, anticiper plutôt qu'attendre la panne hivernale (urgence = surcoût 30-50 %). Si pannes répétées coûtent > 600 €/an, le remplacement s'amortit en 4-7 ans.",
  },
  {
    question: "Combien coûte le remplacement d'une chaudière gaz en 2026 ?",
    answer:
      'Prix posés clé en main 2026 selon le scénario : (1) Remplacement direct par condensation murale 18-24 kW = 4 500-6 500 € ; (2) Condensation au sol + ballon ECS 200 L = 6 500-9 500 € ; (3) Switch vers PAC air-eau = 12 000-15 000 € (mais 3 000-6 000 € net après MPR + CEE) ; (4) Hybride PAC + condensation = 14 000-22 000 € ; (5) Chaudière granulés bois = 18 000-28 000 €. Le coût NET après aides 2026 est presque toujours en faveur du switch vers une énergie renouvelable.',
  },
  {
    question: 'Peut-on encore installer une chaudière gaz neuve en 2026 ?',
    answer:
      "Oui, en remplacement d'une chaudière existante (gaz, fioul, charbon, électrique) dans un logement EXISTANT. Aucune interdiction directe en 2026. En revanche, dans le NEUF (permis de construire ≥ 1er janvier 2022), la RE2020 (Décret n° 2021-1004) exclut de fait les chaudières gaz par son seuil carbone Ic_construction. Pour les logements existants, l'objectif national de neutralité carbone 2050 (Code énergie L100-4) n'a pas encore donné lieu à interdiction du gaz résidentiel.",
  },
  {
    question: "MaPrimeRénov' finance-t-elle le remplacement par une chaudière gaz neuve ?",
    answer:
      "Non, depuis 2024 MaPrimeRénov' ne finance plus la chaudière à condensation gaz seule. Trois exceptions : (1) système hybride PAC + condensation (4 000 € MPR Bleu) ; (2) chaudière biomasse — pellets ou bois — qui remplace gaz (7 000 € MPR Bleu) ; (3) PAC air-eau ou géothermie (5 000-10 000 € MPR Bleu). Le CEE Coup de pouce reste accessible (300-700 € sur condensation, jusqu'à 4 000 € sur PAC) et l'éco-PTZ disponible si combiné avec d'autres travaux (isolation, ECS solaire).",
  },
  {
    question: "Combien de temps prend le remplacement d'une chaudière gaz ?",
    answer:
      '1 journée pour un remplacement comme-pour-comme (condensation murale, tubage existant réutilisé) : 6-10 h de chantier. 2-3 jours pour un switch vers PAC air-eau (pose unité extérieure, module hydraulique, raccordements complets). 3-5 jours pour un switch vers chaudière granulés (silo + alimentation + tubage spécifique). Le délai TOTAL projet (visite + commande + chantier) est de 4-8 semaines pour un remplacement standard, plus si CEE Coup de pouce (dépôt dossier obligatoire AVANT chantier).',
  },
  {
    question: 'Quel artisan pour remplacer ma chaudière gaz ?',
    answer:
      'Plombier-chauffagiste qualifié <strong>QualiGaz Évolution</strong> (organisme habilité par les pouvoirs publics, équivalent PG/PGN/PGP des installateurs gaz, obligation depuis le décret du 23/02/2018). Pour bénéficier des CEE et de la TVA réduite à 5,5 %, mention <strong>RGE</strong> complémentaire requise (souvent intégrée à QualiGaz). Vérifier impérativement : SIRET valide, attestation décennale en cours, 3 références chantiers récents, devis détaillé avec marque/modèle/rendement saisonnier η_s, mise en service et contrôle de combustion explicitement inclus. Comparer 2-3 devis. Notre annuaire référence uniquement des chauffagistes vérifiés.',
  },
  {
    question: 'Faut-il garder le gaz ou switcher vers une PAC ou de la biomasse ?',
    answer:
      "Switch recommandé dans la majorité des cas, sauf : (1) chaudière < 12 ans en bon état ; (2) départ planifié < 5 ans (pas le temps d'amortir) ; (3) contraintes techniques fortes (copropriété, espace). Pour une maison correctement isolée (DPE C ou mieux), la PAC air-eau gagne presque toujours en coût NET (après aides) ET en facture (50-70 % d'économie). Pour une maison mal isolée (DPE E-G), choisir entre hybride PAC + gaz (compromis confort) ou chaudière granulés (plus rentable long terme). Nos chauffagistes RGE peuvent comparer les 3 scénarios sur votre logement.",
  },
  {
    question: 'Peut-on cumuler les aides 2026 pour le remplacement ?',
    answer:
      "Oui, cumul possible MaPrimeRénov' + CEE Coup de pouce + Éco-PTZ + TVA 5,5 % + bonus sortie passoire DPE F/G. Exemples concrets : (1) Switch vers PAC air-eau pour ménage Bleu (revenus modestes) = 5 000 € MPR + 4 000 € CEE + 1 500 € bonus passoire = 10 500 € de subventions cumulées sur un projet 13 000 € → reste à charge 2 500 € ; (2) Switch vers chaudière granulés ménage Jaune = 5 500 € MPR + 4 000 € CEE = 9 500 € sur 22 000 € → reste à charge 12 500 €. Vérifier dépôt CEE AVANT chantier (rétroactif IMPOSSIBLE).",
  },
]

const sources = [
  {
    label: 'Légifrance — Décret n° 2021-1004 du 29 juillet 2021 (RE2020)',
    url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000043871318',
  },
  {
    label: 'Légifrance — Arrêté du 5 juillet 2022 (chaudières fioul interdites)',
    url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000045993000',
  },
  {
    label: "Code de l'énergie — Article L100-4 (objectif neutralité 2050)",
    url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000041553759',
  },
  {
    label: "France Rénov' — Remplacer sa chaudière",
    url: 'https://france-renov.gouv.fr/renovation/chauffage',
  },
  {
    label: "MaPrimeRénov' — Forfait par geste 2026",
    url: 'https://france-renov.gouv.fr/aides/maprimerenov',
  },
  {
    label: 'ADEME — Guide chauffage performant',
    url: 'https://librairie.ademe.fr/urbanisme-et-batiment/2096-se-chauffer-mieux-et-moins-cher.html',
  },
  {
    label: 'Service-Public.fr — Entretien chaudière',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F31894',
  },
  {
    label: 'Légifrance — Décret n° 2009-649 entretien annuel',
    url: 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000020703778',
  },
  {
    label: 'QualiGaz Évolution — Organisme certificateur gaz',
    url: 'https://www.qualigaz.com',
  },
  {
    label: 'GRDF — Aides au changement de chaudière',
    url: 'https://www.grdf.fr',
  },
]

const relatedPages = [
  {
    label: 'Hub Chaudière gaz 2026',
    href: '/renovation-energetique/travaux/chauffage/chaudiere-gaz',
    description: '4 types + statut RE2020 + prix neufs',
  },
  {
    label: 'Chaudière à condensation 2026',
    href: '/renovation-energetique/travaux/chauffage/chaudiere-condensation',
    description: 'Tech haute perf, rendement 92-94 %',
  },
  {
    label: 'Entretien chaudière gaz 2026',
    href: '/renovation-energetique/travaux/chauffage/chaudiere-condensation/entretien',
    description: '100-180 € HT, obligation Décret 2009-649',
  },
  {
    label: 'PAC air-eau prix 2026 — alternative recommandée',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/air-eau-prix',
    description: "Aides MPR + CEE jusqu'à 9 000 €",
  },
  {
    label: 'PAC hybride PAC + chaudière gaz',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/hybride',
    description: 'Seul système gaz éligible MPR — compromis maisons mal isolées',
  },
  {
    label: 'Chaudière granulés bois 2026',
    href: '/renovation-energetique/travaux/chauffage/chaudiere-granules',
    description: "Biomasse, MPR jusqu'à 7 000 €",
  },
  {
    label: 'Hub aides rénovation 2026',
    href: '/renovation-energetique/aides',
    description: 'MPR + CEE + éco-PTZ cumulables',
  },
  {
    label: 'Trouver un chauffagiste QualiGaz',
    href: '/services/chauffagiste',
    description: 'Annuaire RGE + QualiGaz vérifié',
  },
  {
    label: 'Simulateur aides 2026',
    href: '/simulateur-aides-renovation',
    description: 'Comparer chaudière vs PAC vs biomasse',
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
    section: 'Chauffage — Remplacement chaudière gaz',
    keywords: [
      'remplacement chaudiere gaz',
      'changement chaudiere gaz',
      'installation chaudiere gaz',
      'remplacer chaudiere gaz',
      'prix remplacement chaudiere gaz',
      'aide remplacement chaudiere gaz',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique/travaux' },
    { name: 'Chauffage', url: '/renovation-energetique/travaux/chauffage' },
    { name: 'Chaudière gaz', url: '/renovation-energetique/travaux/chauffage/chaudiere-gaz' },
    { name: 'Remplacement', url: PAGE_PATH },
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
              { label: 'Chauffage', href: '/renovation-energetique/travaux/chauffage' },
              {
                label: 'Chaudière gaz',
                href: '/renovation-energetique/travaux/chauffage/chaudiere-gaz',
              },
              { label: 'Remplacement' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Wrench className="w-3.5 h-3.5" aria-hidden />
              Guide chantier — 1 à 3 jours selon le scénario choisi
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Remplacement chaudière gaz 2026 : prix, aides et alternatives
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Remplacer ou changer sa <strong>chaudière gaz</strong> en 2026 ? 7 signaux
              d&apos;alerte imposent l&apos;action (âge ≥ 15 ans, pannes répétées, fumées noires,
              surconsommation). 5 alternatives existent : <strong>condensation directe</strong> (4
              500-7 500 €), <strong>PAC air-eau</strong> (12 000-15 000 € — RECOMMANDÉ), hybride PAC
              + gaz, chaudière granulés bois ou raccordement réseau de chaleur. Avec les aides 2026
              (MPR + CEE), le coût NET d&apos;un switch vers une PAC air-eau est souvent{' '}
              <strong>inférieur</strong> à un remplacement gaz comme-pour-comme.
            </p>
            <LastUpdated date={MODIFIED} />
          </header>

          <TldrBlock bullets={tldr} />

          <section aria-labelledby="signaux" className="my-10">
            <h2
              id="signaux"
              className="font-heading text-2xl font-bold text-sand-900 mb-3 flex items-center gap-2"
            >
              <AlertTriangle className="w-5 h-5 text-primary-700" aria-hidden />
              Quand remplacer sa chaudière gaz ? 7 signaux d&apos;alerte
            </h2>
            <p className="text-sand-700 mb-5">
              Une chaudière gaz a une durée de vie réelle de 15-20 ans. Ces 7 signaux indiquent
              qu&apos;il faut anticiper le remplacement pour éviter la panne hivernale (surcoût
              30-50 % en urgence) :
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {SIGNAUX_REMPLACEMENT.map((s) => (
                <article key={s.titre} className="bg-white border border-sand-200 rounded-lg p-5">
                  <h3 className="font-heading text-base font-semibold text-sand-900 mb-2">
                    <span className="mr-2" aria-hidden>
                      {s.icone}
                    </span>
                    {s.titre}
                  </h3>
                  <p className="text-sm text-sand-700 m-0">{s.detail}</p>
                </article>
              ))}
            </div>
          </section>

          <section aria-labelledby="alternatives" className="my-10">
            <h2
              id="alternatives"
              className="font-heading text-2xl font-bold text-sand-900 mb-3 flex items-center gap-2"
            >
              <Flame className="w-5 h-5 text-primary-700" aria-hidden />5 alternatives au
              remplacement chaudière gaz en 2026
            </h2>
            <p className="text-sand-700 mb-5">
              5 systèmes de chauffage peuvent remplacer une chaudière gaz en fin de vie. Comparatif
              prix posé, aides 2026 et coût NET après aides — avec recommandation d&apos;usage par
              profil de logement :
            </p>
            <div className="space-y-4">
              {ALTERNATIVES_REMPLACEMENT.map((a) => (
                <article key={a.titre} className="bg-white border border-sand-200 rounded-lg p-5">
                  <h3 className="font-heading text-base font-semibold text-sand-900 mb-3">
                    {a.titre}
                  </h3>
                  <div className="grid sm:grid-cols-3 gap-3 mb-3 text-xs">
                    <div className="bg-sand-50 rounded p-2">
                      <p className="font-medium text-sand-600 m-0">Prix posé</p>
                      <p className="font-semibold text-sand-900 m-0">{a.prix}</p>
                    </div>
                    <div className="bg-sand-50 rounded p-2">
                      <p className="font-medium text-sand-600 m-0">Aides 2026</p>
                      <p className="font-semibold text-sand-900 m-0">{a.aides}</p>
                    </div>
                    <div className="bg-accent-50 rounded p-2">
                      <p className="font-medium text-accent-700 m-0">Net après aides</p>
                      <p className="font-bold text-accent-900 m-0">{a.netApresAides}</p>
                    </div>
                  </div>
                  <p className="text-sm text-sand-700 m-0 mb-1">
                    <strong>Avantage :</strong> {a.avantage}
                  </p>
                  <p className="text-sm text-sand-700 m-0 mb-1">
                    <strong>Inconvénient :</strong> {a.inconvenient}
                  </p>
                  <p className="text-sm text-sand-700 m-0">
                    <strong>Quand choisir :</strong> {a.quandChoisir}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section aria-labelledby="phases" className="my-10">
            <h2
              id="phases"
              className="font-heading text-2xl font-bold text-sand-900 mb-3 flex items-center gap-2"
            >
              <Wrench className="w-5 h-5 text-primary-700" aria-hidden />
              Planning chantier en 4 phases
            </h2>
            <p className="text-sand-700 mb-5">
              Un remplacement chaudière gaz est rapide quand il est bien préparé. 4 phases
              incontournables du devis à la mise en service :
            </p>
            <ol className="space-y-3">
              {PHASES_CHANTIER.map((p, i) => (
                <li
                  key={p.phase}
                  className="bg-white border border-sand-200 rounded-lg p-4 flex gap-3"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading text-base font-semibold text-sand-900 mb-1">
                      {p.phase}
                    </h3>
                    <p className="text-xs text-sand-500 m-0 mb-1">Durée : {p.duree}</p>
                    <p className="text-sm text-sand-700 m-0">{p.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="prix" className="my-10">
            <h2
              id="prix"
              className="font-heading text-2xl font-bold text-sand-900 mb-3 flex items-center gap-2"
            >
              <Calculator className="w-5 h-5 text-primary-700" aria-hidden />
              Prix par scénario de remplacement (cas concrets 2026)
            </h2>
            <p className="text-sand-700 mb-5">
              5 scénarios de remplacement chiffrés avec aides 2026 et coût NET. Le scénario gagnant
              varie selon la qualité d&apos;isolation, l&apos;espace disponible et les revenus du
              foyer :
            </p>
            <div className="space-y-3">
              {PRIX_PAR_SCENARIO.map((p) => (
                <article
                  key={p.scenario}
                  className="bg-white border border-sand-200 rounded-lg p-4"
                >
                  <h3 className="font-heading text-base font-semibold text-sand-900 mb-1">
                    {p.scenario}
                  </h3>
                  <p className="text-sm text-sand-700 m-0 mb-2">{p.detail}</p>
                  <div className="grid sm:grid-cols-3 gap-2 text-xs">
                    <div className="bg-sand-50 rounded p-2">
                      <p className="text-sand-600 m-0">Prix posé</p>
                      <p className="font-semibold text-sand-900 m-0">{p.prixPose}</p>
                    </div>
                    <div className="bg-sand-50 rounded p-2">
                      <p className="text-sand-600 m-0">Aides cumulées</p>
                      <p className="font-semibold text-sand-900 m-0">{p.aides}</p>
                    </div>
                    <div className="bg-accent-50 rounded p-2">
                      <p className="text-accent-700 m-0">Reste à charge</p>
                      <p className="font-bold text-accent-900 m-0">{p.cumul}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section aria-labelledby="erreurs" className="my-10">
            <h2
              id="erreurs"
              className="font-heading text-2xl font-bold text-sand-900 mb-3 flex items-center gap-2"
            >
              <AlertTriangle className="w-5 h-5 text-red-700" aria-hidden />
              10 erreurs à éviter
            </h2>
            <p className="text-sand-700 mb-5">
              Chaque année, des particuliers perdent 1 000-5 000 € sur leur projet remplacement
              chaudière gaz à cause de ces erreurs courantes :
            </p>
            <ul className="space-y-2 bg-white border border-sand-200 rounded-lg p-5 list-none pl-0">
              {ERREURS_A_EVITER.map((e) => (
                <li
                  key={e}
                  className="text-sm text-sand-700 m-0 flex items-start gap-2 border-b border-sand-100 last:border-b-0 py-2 first:pt-0 last:pb-0"
                >
                  <CheckCircle2 className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" aria-hidden />
                  <span>{e}</span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="artisan" className="my-10">
            <h2
              id="artisan"
              className="font-heading text-2xl font-bold text-sand-900 mb-3 flex items-center gap-2"
            >
              <ShieldCheck className="w-5 h-5 text-primary-700" aria-hidden />
              Choisir un chauffagiste QualiGaz Évolution
            </h2>
            <p className="text-sand-700 mb-3">
              Le remplacement d&apos;une chaudière gaz exige obligatoirement un installateur agréé{' '}
              <strong>QualiGaz Évolution</strong> (organisme habilité, équivalent PG/PGN/PGP, depuis
              le décret du 23 février 2018). Pour bénéficier des aides (CEE, TVA 5,5 %), une mention
              RGE complémentaire est requise.
            </p>
            <ul className="space-y-2 mb-3 list-disc pl-6 text-sand-700 text-sm">
              <li>SIRET valide + assurance décennale en cours (vérifier dates).</li>
              <li>3 références chantiers récents (idéal &lt; 12 mois).</li>
              <li>
                Devis détaillé : marque, modèle, rendement saisonnier η_s, rendement nominal PCI.
              </li>
              <li>Mise en service formelle avec contrôle de combustion (CO, CO2, T° fumées).</li>
              <li>Attestation de conformité gaz (modèle 2 ou 3 selon installation).</li>
              <li>Comparer 2-3 devis avant signature (10-15 % d&apos;écart fréquent).</li>
            </ul>
            <Link
              href="/services/chauffagiste"
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Trouver un chauffagiste QualiGaz vérifié
              <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
          </section>

          <FlagshipFaq title="Remplacement chaudière gaz : foire aux questions" items={faqs} />

          <FlagshipSources sources={sources} />

          <section className="my-10">
            <h2 className="font-heading text-2xl font-bold text-sand-900 mb-4">
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
              href="/renovation-energetique/travaux/chauffage/chaudiere-gaz"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Hub Chaudière gaz
            </Link>
            <Link
              href="/services/chauffagiste"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Chauffagistes <Coins className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
