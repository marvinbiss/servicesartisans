/**
 * Page : /renovation-energetique/aides/pompe-a-chaleur-2026
 *
 * @kw-primary    aide pompe a chaleur 2026
 * @kw-volume     2200
 * @kw-kd         5
 * @kw-cpc        2.40
 * @intent        commercial + transactional + anti-arnaque
 * @cluster       aides_pac
 * @ahrefs-source docs/ahrefs-bloc1-keywords-gap-2026-05-04.md (rang #92 + #199 + extrapolation)
 * @snapshot      2026-05-04 (Ahrefs Bloc 1 v3 + estimations longue traîne — recheck 18/05)
 * @backlog-item  Levier-V-aides-pompe-a-chaleur-2026
 *
 * KW cibles (validés Ahrefs gap CSV 2026-04 + estimations longue traîne) :
 * - "pompe a chaleur 1€"                500 vol, KD 0 (rang #92 bloc1)
 * - "pompe à chaleur à 1 euro vrai ou faux" 450 vol, KD 0 (rang #199 bloc1)
 * - "aide pompe à chaleur 2026"         ~2 200 vol estimé KD 5 (PIVOT)
 * - "aide pour pompe à chaleur"         ~800 vol estimé KD 8
 * - "MPR pompe à chaleur"               ~600 vol estimé KD 12
 * - "subvention pompe à chaleur"        ~400 vol estimé KD 5
 * - "prime pompe à chaleur 2026"        ~350 vol estimé KD 4
 * - "aide pompe à chaleur ménage modeste" ~250 vol estimé KD 2
 * - Famille cumulée pivot : ~5 550 vol/mois (KD 0-12 = bon win)
 *
 * Easy win : MOYEN-OUI (KD 0-12, France-Renov dominant sur head MPR).
 * Concurrence : France-Renov (DR 91), effy, hellio, edf — pages marketing ou redirect.
 * Atout SA : guide ANTI-ARNAQUE complet (faux gratuit + 4 vraies aides + tableau MPR
 * par revenus + 3 scénarios chiffrés + 8 FAQ).
 *
 * Cluster pillar : Rénovation Énergétique → Aides → Pompe à chaleur 2026
 *
 * Anti-cannibalisation :
 *   - /aides                                  = hub aides général
 *   - /aides/maprimerenov-2026                = hub MPR (toutes aides MPR consolidées)
 *   - /aides/cee-certificats-economie-energie = hub CEE général
 *   - /aides/eco-ptz-pret-zero                = hub éco-PTZ
 *   - /aides/panneau-solaire-2026             = sibling parallèle (PV anti-arnaque)
 *   - /pompe-a-chaleur                        = hub PAC technique
 *   - /pompe-a-chaleur/air-eau-prix           = focus prix PAC + aides au passage
 *   - /pompe-a-chaleur/hybride                = focus système hybride
 *   - Cette page = AIDES SPÉCIFIQUES PAC consolidées (anti-arnaque "PAC 1€" + 4 vraies
 *     aides + tableau MPR par type/revenus + 3 scénarios chiffrés + éligibilité).
 *
 * YMYL high : aides financières publiques + risque arnaques démarchage abusif.
 * Cite : Légifrance Décret 2024-1142 (MPR), arrêté 14 janvier 2020 RGE QualiPAC,
 * France Rénov', Code énergie L100-4, DGCCRF (fraudes démarchage), ANIL (logement).
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Coins,
  Euro,
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
import { getBreadcrumbSchema, getFAQSchema, getGovernmentServiceSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'

export const revalidate = 86400

const PAGE_PATH = '/renovation-energetique/aides/pompe-a-chaleur-2026'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'claire-dubois'
const AUTHOR_NAME = 'Claire Dubois'

const TITLE = 'Aide pompe à chaleur 2026 : MPR, CEE, vraies aides'
const DESCRIPTION =
  "Aides pompe à chaleur 2026 : 4 vraies aides cumulables (MPR Bleu jusqu'à 5 000 €, CEE Coup de pouce 4 000 €, bonus passoire 1 500 €, éco-PTZ 30 000 €, TVA 5,5 %). Anti-arnaque PAC à 1 €."

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
  '⚠️ La "PAC à 1 €" n\'existe plus depuis 2021 (fraude DGCCRF). Toute pub "PAC gratuite" = ARNAQUE.',
  "4 vraies aides cumulables 2026 : MaPrimeRénov' (jusqu'à 11 000 €), CEE Coup de pouce (4 000 €), bonus passoire DPE F/G (1 500 €), éco-PTZ (30 000 €).",
  'Plafond MPR PAC air-eau : 5 000 € (Bleu très modestes), 4 000 € (Jaune modestes), 3 000 € (Violet intermédiaires), 2 000 € (Rose supérieurs).',
  'Plafond MPR PAC géothermie : 11 000 € (Bleu), 9 000 € (Jaune), 6 000 € (Violet), 4 000 € (Rose).',
  "🚫 PAC AIR-AIR exclue de MaPrimeRénov' depuis 2020 (seul CEE Coup de pouce ~600 €).",
  'Conditions : artisan RGE QualiPAC obligatoire, résidence principale > 15 ans, dépôt dossier AVANT chantier (pas rétroactif).',
  'Cumul maximum 2026 (PAC air-eau ménage Bleu DPE F/G) : 5 000 + 4 000 + 1 500 = 10 500 € sur projet 13 000 € → reste à charge 2 500 €.',
]

const ANTI_ARNAQUE = [
  {
    type: '🚫 "PAC à 1 €" / "PAC gratuite gouvernement"',
    realite:
      'L\'aide "PAC à 1 €" n\'existe plus depuis le 1er juillet 2021 (Décret 2021-895). Avant cette date, le dispositif Coup de pouce CEE pouvait théoriquement couvrir le coût d\'une PAC entrée de gamme pour les ménages très modestes — d\'où la pub mensongère "PAC à 1 €". Depuis 2021, le reste à charge MINIMUM est de 1 000 € (loi obligation reste à charge particulier). Toute pub "PAC à 1 €" en 2026 = ARNAQUE.',
    actionDgccrf:
      "Signaler immédiatement à la DGCCRF (signal.conso.gouv.fr) ou au procureur de la République. La fraude est sanctionnée pénalement (amende jusqu'à 300 000 € + 2 ans prison pour le démarcheur).",
  },
  {
    type: '🚫 Démarchage téléphonique abusif',
    realite:
      'Depuis le 1er mars 2023 (Décret 2022-1313), le démarchage téléphonique en rénovation énergétique est INTERDIT (sauf relation contractuelle préexistante). Toute appel non sollicité par un "conseiller énergie" ou "agence MaPrimeRénov\'" = ARNAQUE. Les vrais conseillers France Rénov\' n\'appellent JAMAIS spontanément.',
    actionDgccrf:
      "Refuser, raccrocher, signaler au numéro 0 800 941 200 (Bloctel) + DGCCRF. Ne JAMAIS donner ses coordonnées bancaires, RIB ou avis d'imposition au téléphone.",
  },
  {
    type: "🚫 Sites pseudo-officiels imitant France-Renov'",
    realite:
      'Plusieurs sites privés imitent la charte graphique France Rénov\' ou MaPrimeRénov\' (logos détournés, URL trompeuses type "primerenov-2026.fr"). Ces sites collectent vos données personnelles puis les revendent à des installateurs peu scrupuleux. Le SEUL site officiel est <strong>france-renov.gouv.fr</strong> (extension .gouv.fr obligatoire).',
    actionDgccrf:
      'Vérifier l\'extension URL (.gouv.fr = officiel). Pour MPR : passer EXCLUSIVEMENT par france-renov.gouv.fr → "Demande MPR". Le compte officiel est sur maprimerenov.gouv.fr. Tout autre site = ARNAQUE.',
  },
  {
    type: '🚫 Faux artisans RGE',
    realite:
      "Le label RGE QualiPAC est obligatoire pour bénéficier de MPR + CEE + TVA 5,5 % sur PAC. Certains démarcheurs prétendent être RGE sans l'être (fraude au label). En 2024, 230 dossiers de fraude RGE ont été ouverts (rapport DGCCRF). Toujours VÉRIFIER le label sur l'annuaire officiel.",
    actionDgccrf:
      "Vérifier le label RGE de l'artisan sur <strong>france-renov.gouv.fr/trouver-professionnel-rge</strong> (extension .gouv.fr). Demander la copie de l'attestation RGE en cours (renouvellement annuel obligatoire). Refuser tout devis sans n° SIRET + label RGE valide.",
  },
]

const VRAIES_AIDES = [
  {
    nom: "MaPrimeRénov' (MPR)",
    organisme: "ANAH (Agence Nationale de l'Habitat)",
    montantMax: '11 000 € (PAC géothermie ménage Bleu)',
    eligibilite:
      'Propriétaire occupant ou bailleur, résidence principale > 15 ans, ressources < plafond ANAH par catégorie (Bleu très modestes / Jaune modestes / Violet intermédiaires / Rose supérieurs).',
    fonctionnement:
      'Dossier déposé AVANT chantier sur france-renov.gouv.fr. Versement après travaux sur facture acquittée. Délai 4-8 semaines. Cumul possible avec CEE Coup de pouce + bonus passoire.',
    sourceLegale: 'Décret 2024-1142 du 11 décembre 2024',
  },
  {
    nom: 'CEE Coup de pouce chauffage',
    organisme: 'Obligés énergie (TotalEnergies, EDF, Engie, Sonergia, ENGIE Solutions...)',
    montantMax: '4 000 € (PAC air-eau ménage modeste)',
    eligibilite:
      "Tous propriétaires (occupant ou bailleur), résidence principale ou secondaire > 2 ans, sortie d'un système gaz/fioul/charbon ou électrique. Cumul possible avec MaPrimeRénov'.",
    fonctionnement:
      "Dossier déposé AVANT chantier auprès d'un obligé (mandataire CEE comme Sonergia ou délégataire). Versement après travaux. Délai 8-12 semaines. Pas de plafond de ressources — seuils de prime par catégorie revenus.",
    sourceLegale: "Code de l'énergie L221-7 + arrêté 22 décembre 2014",
  },
  {
    nom: 'Bonus sortie de passoire DPE F/G',
    organisme: "ANAH (intégré à MaPrimeRénov')",
    montantMax: '1 500 € (forfait additionnel)',
    eligibilite:
      "Logement DPE F ou G AVANT travaux + DPE D ou mieux APRÈS travaux. Cumul automatique avec MaPrimeRénov' Bleu/Jaune/Violet (pas Rose).",
    fonctionnement:
      "Bonus automatique dans le dossier MaPrimeRénov' si DPE avant + après prouvent la sortie de passoire. Versement avec MPR (même calendrier). Vérifier que votre devis prévoit l'écart DPE suffisant.",
    sourceLegale: 'Décret 2024-1142 art. 3-IV (bonus sortie passoire)',
  },
  {
    nom: 'Éco-PTZ (Éco-prêt à taux zéro)',
    organisme:
      'Banques partenaires (BNP, Crédit Agricole, LCL, Société Générale, Banque Populaire, Caisse Épargne...)',
    montantMax: '30 000 € (durée 20 ans, taux 0 %)',
    eligibilite:
      'Propriétaire occupant ou bailleur, résidence principale > 2 ans, travaux par RGE. Cumul possible avec MPR + CEE. Pas de plafond de ressources.',
    fonctionnement:
      'Demande à la banque AVANT chantier. Travaux finissent dans 3 ans. Remboursement en 20 ans MAX à taux 0 %. Ne couvre que la partie reste à charge après MPR + CEE — utile pour étaler le financement.',
    sourceLegale: 'Décret 2022-454 du 30 mars 2022',
  },
  {
    nom: 'TVA 5,5 % (au lieu de 20 %)',
    organisme: 'Direction Générale des Finances Publiques (DGFiP)',
    montantMax: '~14,5 % du coût matériel + pose (économie automatique)',
    eligibilite:
      "Logement > 2 ans, résidence principale ou secondaire, travaux par artisan RGE QualiPAC. La TVA 5,5 % est appliquée DIRECTEMENT par l'artisan sur la facture. Pas de demande à faire.",
    fonctionnement:
      "L'artisan applique la TVA 5,5 % sur sa facture (sous attestation TVA 5,5 % signée par vous). Pour une PAC posée à 12 000 € HT : économie 14,5 % = ~1 740 € directement sur le devis.",
    sourceLegale: 'Code général des impôts art. 278-0 bis A',
  },
]

const TABLEAU_MPR = [
  {
    type: 'PAC air-eau',
    bleu: '5 000 €',
    jaune: '4 000 €',
    violet: '3 000 €',
    rose: '2 000 €',
    note: 'Standard rénovation chauffage central + ECS',
  },
  {
    type: 'PAC air-air',
    bleu: '❌ Exclu MPR',
    jaune: '❌ Exclu MPR',
    violet: '❌ Exclu MPR',
    rose: '❌ Exclu MPR',
    note: 'Seul CEE Coup de pouce (~600 €)',
  },
  {
    type: 'PAC géothermique sol-eau',
    bleu: '11 000 €',
    jaune: '9 000 €',
    violet: '6 000 €',
    rose: '4 000 €',
    note: 'Performance maximale, mais investissement lourd',
  },
  {
    type: 'PAC eau-eau (nappe phréatique)',
    bleu: '11 000 €',
    jaune: '9 000 €',
    violet: '6 000 €',
    rose: '4 000 €',
    note: 'Forfait identique géothermie',
  },
  {
    type: 'PAC hybride (PAC + chaudière gaz)',
    bleu: '4 000 €',
    jaune: '3 000 €',
    violet: '2 000 €',
    rose: '❌ Exclu',
    note: 'SEUL système gaz éligible MPR depuis 2024',
  },
  {
    type: 'Chauffe-eau thermodynamique (CET)',
    bleu: '1 200 €',
    jaune: '800 €',
    violet: '400 €',
    rose: '❌ Exclu',
    note: 'ECS seule (pas chauffage)',
  },
]

const SCENARIOS = [
  {
    titre: '1️⃣ PAC air-eau, ménage Bleu (très modestes), DPE F → D',
    profil:
      'Maison 100 m² zone H1b, DPE F (passoire), revenus < plafond Bleu ANAH (~22 000 € pour couple).',
    devisMateriel: '13 000 € posé (PAC 8 kW + module hydraulique + raccordements)',
    aidesMpr: 'MPR Bleu : 5 000 €',
    aidesCee: 'CEE Coup de pouce : 4 000 €',
    aidesBonus: 'Bonus passoire DPE F→D : 1 500 €',
    aidesTotal: '10 500 €',
    resteCharge: '2 500 €',
    detail:
      'Cumul maximal possible 2026. Reste à charge ~ 19 % du devis. Économie facture chauffage 50-65 % par an (~1 200-1 500 € économisés). ROI net après aides 2-3 ans seulement.',
  },
  {
    titre: '2️⃣ PAC géothermique, ménage Jaune (modestes), maison ancienne',
    profil:
      'Maison 130 m² zone H1c, DPE D, revenus Jaune (~30 000 € pour couple), terrain disponible 200 m².',
    devisMateriel: '24 000 € posé (capteurs horizontaux 200 m² + PAC 12 kW + ballon ECS)',
    aidesMpr: 'MPR Jaune : 9 000 €',
    aidesCee: 'CEE Coup de pouce : 3 500 €',
    aidesBonus: 'Bonus DPE non applicable (D ≠ passoire)',
    aidesTotal: '12 500 €',
    resteCharge: '11 500 €',
    detail:
      "Géothermie : aides MPR généreuses (jusqu'à 9 000 €) compensent l'investissement initial lourd. Économie facture 60-75 % par an. ROI 8-12 ans après aides. Solution durable 25-30 ans.",
  },
  {
    titre: '3️⃣ PAC hybride, ménage Violet (intermédiaires), DPE E maintenu',
    profil:
      'Maison 120 m² zone H1c (climat froid), DPE E maintenu, revenus Violet (~50 000 € pour couple), conservation chaudière gaz récente.',
    devisMateriel:
      '17 000 € posé (PAC 6 kW + chaudière condensation existante intégrée + régulation hybride)',
    aidesMpr: 'MPR Violet : 2 000 €',
    aidesCee: 'CEE Coup de pouce : 1 500 €',
    aidesBonus: 'Bonus DPE non applicable',
    aidesTotal: '3 500 €',
    resteCharge: '13 500 €',
    detail:
      'Hybride = compromis maisons mal isolées + climat froid. Aides plus modestes (Violet exclu sortie passoire). Mais ROI compensé par sécurité confort grand froid (chaudière gaz prend le relais < -7 °C). Économie 35-50 % facture.',
  },
]

const ELIGIBILITE_4 = [
  {
    titre: '✅ Artisan RGE QualiPAC obligatoire',
    detail:
      'L\'installateur DOIT être RGE certifié QualiPAC (organisme Qualit\'EnR) à la date du devis ET à la date de pose. Vérifier sur france-renov.gouv.fr (rubrique "Trouver un professionnel RGE"). Renouvellement annuel obligatoire — un RGE expiré = perte des aides. Notre annuaire référence des chauffagistes RGE QualiPAC vérifiés.',
  },
  {
    titre: '✅ Résidence principale > 15 ans (MPR)',
    detail:
      "Pour MaPrimeRénov', le logement doit être : (1) achevé depuis plus de 15 ans (date des travaux) ; (2) occupé en résidence principale 8 mois/an minimum ; (3) propriétaire occupant ou bailleur (engagement location 6 ans). Pour CEE : > 2 ans suffisent. Pour résidence secondaire : seul CEE possible (pas MPR).",
  },
  {
    titre: '✅ Dépôt dossier AVANT chantier',
    detail:
      "ABSOLUMENT critique : MPR + CEE doivent être déposés AVANT le démarrage des travaux. Pas d'aide rétroactive (perte sèche = plusieurs milliers d'euros). Calendrier : (1) Devis signé ; (2) Dossier MPR sur france-renov.gouv.fr ; (3) Acceptation MPR (4-6 semaines) ; (4) Dossier CEE auprès obligé (1-2 semaines) ; (5) Démarrage chantier.",
  },
  {
    titre: '✅ Plafond ressources ANAH (MPR uniquement)',
    detail:
      "MaPrimeRénov' applique 4 catégories de revenus selon RFR (Revenu Fiscal de Référence) sur l'avis d'imposition N-2 : Bleu (très modestes < 22 461 € couple en zone B/C), Jaune (modestes < 27 343 € couple), Violet (intermédiaires < 39 192 € couple), Rose (supérieurs au-delà — exclu pour la plupart des aides PAC). Plafonds plus élevés en zone A/Île-de-France. Pour CEE : aucun plafond de ressources, mais le forfait dépend des revenus.",
  },
]

const faqs = [
  {
    question: 'La "PAC à 1 €" existe-t-elle vraiment ?',
    answer:
      '<strong>NON, plus depuis le 1er juillet 2021</strong> (Décret 2021-895). Avant cette date, le dispositif Coup de pouce CEE pouvait théoriquement couvrir le coût d\'une PAC entrée de gamme pour les ménages très modestes. Depuis 2021, la loi impose un reste à charge MINIMUM de 1 000 € pour le particulier. Toute pub "PAC à 1 €" en 2026 = ARNAQUE — signaler à la DGCCRF (signal.conso.gouv.fr). En 2026, le cumul d\'aides maximum (MPR Bleu + CEE + bonus passoire) atteint 10 500 € sur un projet 13 000 € — reste à charge 2 500 € minimum.',
  },
  {
    question: 'Quelles sont les vraies aides pour une pompe à chaleur en 2026 ?',
    answer:
      "5 vraies aides cumulables 2026 : (1) <strong>MaPrimeRénov'</strong> par l'ANAH — jusqu'à 5 000 € (PAC air-eau Bleu) ou 11 000 € (géothermie Bleu) ; (2) <strong>CEE Coup de pouce chauffage</strong> par les obligés énergie — jusqu'à 4 000 € ; (3) <strong>Bonus sortie passoire DPE F/G</strong> — 1 500 € additionnels ; (4) <strong>Éco-PTZ</strong> jusqu'à 30 000 € en prêt 0 % sur 20 ans pour le reste à charge ; (5) <strong>TVA 5,5 %</strong> au lieu de 20 % (économie ~14,5 % sur le matériel + pose). Cumul maximum ménage Bleu DPE F/G : 5 000 + 4 000 + 1 500 = 10 500 € + éco-PTZ + TVA 5,5 %.",
  },
  {
    question: "Combien rapporte MaPrimeRénov' pour une PAC ?",
    answer:
      "Forfaits MaPrimeRénov' 2026 par type de PAC et catégorie de revenus : (1) <strong>PAC air-eau</strong> : 5 000 € Bleu (très modestes), 4 000 € Jaune, 3 000 € Violet, 2 000 € Rose ; (2) <strong>PAC géothermique sol-eau</strong> : 11 000 € Bleu, 9 000 € Jaune, 6 000 € Violet, 4 000 € Rose ; (3) <strong>PAC eau-eau (nappe)</strong> : forfait identique géothermique ; (4) <strong>PAC hybride PAC + chaudière gaz</strong> : 4 000 € Bleu, 3 000 € Jaune, 2 000 € Violet (Rose exclu) ; (5) <strong>PAC air-air</strong> : ❌ EXCLUE de MPR depuis 2020 (seul CEE ~600 €) ; (6) <strong>Chauffe-eau thermodynamique</strong> : 1 200 € Bleu, 800 € Jaune, 400 € Violet (Rose exclu).",
  },
  {
    question: "Pourquoi la PAC air-air est exclue de MaPrimeRénov' ?",
    answer:
      'Depuis 2020, la <strong>PAC air-air</strong> (climatisation réversible) est exclue de MaPrimeRénov\' pour 3 raisons : (1) elle ne produit pas d\'eau chaude sanitaire (ECS) — moins prioritaire dans la stratégie nationale chauffage ; (2) elle est souvent sur-vendue comme "climatisation" plutôt que comme chauffage ; (3) son COP saisonnier réel (2,5-3,5) est inférieur aux PAC air-eau (3,0-4,5). Seule aide restante : CEE Coup de pouce ~600 € (vs 9 000 € cumul air-eau). Pour bénéficier des aides massives, choisir PAC air-eau ou géothermique.',
  },
  {
    question: "Comment déposer un dossier MaPrimeRénov' pour une PAC ?",
    answer:
      "5 étapes obligatoires : (1) <strong>Choisir un artisan RGE QualiPAC</strong> (vérifier sur france-renov.gouv.fr) ; (2) <strong>Obtenir un devis détaillé</strong> avec marque, modèle PAC, COP/SCOP, prix HT/TTC ; (3) <strong>Créer un compte sur france-renov.gouv.fr</strong> et déposer le dossier MPR (devis + RIB + avis d'imposition N-2) AVANT chantier ; (4) <strong>Attendre l'accord MPR</strong> (4-6 semaines) ; (5) <strong>Démarrer chantier</strong>, puis transmettre la facture acquittée pour versement (4-8 semaines). En parallèle, ne pas oublier le dossier <strong>CEE Coup de pouce</strong> auprès d'un obligé (TotalEnergies, EDF, Sonergia...) AVANT chantier également.",
  },
  {
    question: 'Quelles conditions pour bénéficier des aides PAC en 2026 ?',
    answer:
      "4 conditions cumulatives : (1) <strong>Artisan RGE QualiPAC obligatoire</strong> (à la date du devis ET de la pose) ; (2) <strong>Logement résidence principale > 15 ans</strong> pour MPR (> 2 ans pour CEE) ; (3) <strong>Dossier déposé AVANT chantier</strong> (pas d'aide rétroactive — perte sèche) ; (4) <strong>Plafond ressources ANAH</strong> respecté (Bleu/Jaune/Violet/Rose selon RFR sur avis d'imposition N-2). Cas particulier passoire DPE F/G : bonus 1 500 € additionnel automatique si DPE après travaux ≥ classe D.",
  },
  {
    question: 'Comment éviter les arnaques aux aides PAC ?',
    answer:
      '5 réflexes anti-arnaque : (1) <strong>JAMAIS répondre au démarchage téléphonique rénovation</strong> (interdit depuis mars 2023) — raccrocher, signaler Bloctel + DGCCRF ; (2) <strong>JAMAIS "PAC à 1 €" ou "gratuite gouvernement"</strong> en 2026 (reste à charge MINIMUM 1 000 €) ; (3) <strong>SEUL site officiel : france-renov.gouv.fr</strong> (extension .gouv.fr — vérifier l\'URL) ; (4) <strong>Vérifier le label RGE QualiPAC</strong> de l\'artisan sur france-renov.gouv.fr (annuaire officiel) ; (5) <strong>Refuser tout devis sans SIRET, sans label RGE valide, sans coordonnées d\'assurance décennale</strong>. En cas de doute : signaler sur signal.conso.gouv.fr.',
  },
  {
    question: 'Quel est le reste à charge typique pour une PAC en 2026 ?',
    answer:
      'Exemples concrets 2026 : (1) <strong>PAC air-eau ménage Bleu DPE F/G</strong> : devis 13 000 € → aides 10 500 € → reste à charge 2 500 € (cumul maximum) ; (2) <strong>PAC air-eau ménage Jaune DPE D</strong> : devis 13 000 € → aides 7 500 € → reste à charge 5 500 € ; (3) <strong>PAC air-eau ménage Violet DPE D</strong> : devis 13 000 € → aides 5 000 € → reste à charge 8 000 € ; (4) <strong>PAC géothermique ménage Jaune</strong> : devis 24 000 € → aides 12 500 € → reste à charge 11 500 € ; (5) <strong>PAC hybride ménage Violet</strong> : devis 17 000 € → aides 3 500 € → reste à charge 13 500 €. Compléter le reste à charge avec éco-PTZ 0 % sur 20 ans.',
  },
]

const sources = [
  {
    label: "Légifrance — Décret 2024-1142 du 11 décembre 2024 (MaPrimeRénov')",
    url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000050762456',
  },
  {
    label: 'Légifrance — Décret 2021-895 (fin "PAC à 1 €" 1er juillet 2021)',
    url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000043794321',
  },
  {
    label: 'Légifrance — Décret 2022-1313 (interdiction démarchage téléphonique rénovation)',
    url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000046402928',
  },
  {
    label: "Code de l'énergie — Article L221-7 (CEE)",
    url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000041815416',
  },
  {
    label: "France Rénov' — Site officiel MaPrimeRénov'",
    url: 'https://france-renov.gouv.fr/aides/maprimerenov',
  },
  {
    label: "France Rénov' — Trouver un artisan RGE",
    url: 'https://france-renov.gouv.fr/trouver-professionnel-rge',
  },
  {
    label: 'DGCCRF — Signaler une fraude rénovation',
    url: 'https://signal.conso.gouv.fr',
  },
  {
    label: "ANAH — Agence Nationale de l'Habitat",
    url: 'https://www.anah.fr',
  },
  {
    label: "Qualit'EnR — Annuaire officiel QualiPAC",
    url: 'https://www.qualit-enr.org/qualipac',
  },
]

const relatedPages = [
  {
    label: 'Hub aides rénovation 2026',
    href: '/renovation-energetique/aides',
    description: 'MPR + CEE + éco-PTZ + tous les dispositifs',
  },
  {
    label: "MaPrimeRénov' 2026 (hub global)",
    href: '/renovation-energetique/aides/maprimerenov-2026',
    description: 'Toutes les aides MPR par travaux + revenus',
  },
  {
    label: 'CEE Certificats Économie Énergie',
    href: '/renovation-energetique/aides/cee-certificats-economie-energie',
    description: 'Coup de pouce chauffage + isolation',
  },
  {
    label: "Éco-PTZ prêt 0 % (jusqu'à 30 000 €)",
    href: '/renovation-energetique/aides/eco-ptz-pret-zero',
    description: 'Financer le reste à charge sur 20 ans',
  },
  {
    label: 'Aides panneau solaire 2026 (anti-arnaque)',
    href: '/renovation-energetique/aides/panneau-solaire-2026',
    description: 'Sibling — PV anti-arnaque + 4 vraies aides',
  },
  {
    label: 'Hub Pompe à chaleur (3 types)',
    href: '/renovation-energetique/travaux/pompe-a-chaleur',
    description: 'Air-air, air-eau, géothermie',
  },
  {
    label: 'PAC air-eau prix 2026',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/air-eau-prix',
    description: "12-15K € posé, MPR + CEE jusqu'à 9 000 €",
  },
  {
    label: 'PAC hybride PAC + chaudière gaz',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/hybride',
    description: 'Seul système gaz éligible MPR depuis 2024',
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
    section: 'Aides — Pompe à chaleur',
    keywords: [
      'aide pompe a chaleur 2026',
      'aide pour pompe à chaleur',
      'mpr pompe à chaleur',
      'subvention pompe à chaleur',
      'pompe à chaleur 1 euro',
      'prime pompe à chaleur',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Aides', url: '/renovation-energetique/aides' },
    { name: 'Pompe à chaleur 2026', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const govSchema = getGovernmentServiceSchema({
    name: "MaPrimeRénov' Pompe à chaleur 2026",
    description:
      "Aide publique financée par l'ANAH pour l'installation d'une pompe à chaleur (air-eau, géothermique, hybride). Forfait 2 000-11 000 € selon type PAC + revenus. Cumul possible avec CEE Coup de pouce + bonus passoire DPE F/G + éco-PTZ + TVA 5,5 %.",
    url: PAGE_URL,
    serviceType: 'Subvention publique pompe à chaleur',
    serviceOperator: {
      name: "ANAH (Agence Nationale de l'Habitat)",
      url: 'https://www.anah.fr',
    },
    audience: 'Propriétaires occupants et bailleurs (résidence principale > 15 ans)',
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
              { label: 'Aides', href: '/renovation-energetique/aides' },
              { label: 'Pompe à chaleur 2026' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-red-50 text-red-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <AlertTriangle className="w-3.5 h-3.5" aria-hidden />
              ⚠️ "PAC à 1 €" = ARNAQUE depuis 2021 — guide officiel anti-fraude
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Aide pompe à chaleur 2026 : MPR, CEE, vraies aides cumulables
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              <strong>Quelles aides pour une pompe à chaleur en 2026 ?</strong> 5 vraies aides
              cumulables : <strong>MaPrimeRénov&apos;</strong> (jusqu&apos;à 11 000 € géothermie
              ménage Bleu), <strong>CEE Coup de pouce chauffage</strong> (4 000 €), bonus sortie
              passoire DPE F/G (1 500 €), éco-PTZ (30 000 € à 0 %), TVA 5,5 % automatique. ⚠️ La{' '}
              <strong>&quot;PAC à 1 €&quot;</strong> n&apos;existe plus depuis 2021 (Décret
              2021-895) — toute pub &quot;PAC gratuite&quot; = ARNAQUE à signaler à la DGCCRF. Cumul
              maximum ménage Bleu DPE F/G : 10 500 € sur projet 13 000 € → reste à charge 2 500 €.
            </p>
            <LastUpdated date={MODIFIED} />
          </header>

          <TldrBlock bullets={tldr} />

          <section aria-labelledby="anti-arnaque" className="my-10">
            <h2
              id="anti-arnaque"
              className="font-heading text-2xl font-bold text-sand-900 mb-3 flex items-center gap-2"
            >
              <AlertTriangle className="w-5 h-5 text-red-700" aria-hidden />
              ⚠️ 4 arnaques courantes à éviter absolument
            </h2>
            <p className="text-sand-700 mb-5">
              La rénovation énergétique reste le secteur n°1 des fraudes en France (DGCCRF, rapport
              2024). 4 arnaques courantes ciblent les particuliers en 2026. Les reconnaître = se
              protéger :
            </p>
            <div className="space-y-4">
              {ANTI_ARNAQUE.map((a) => (
                <article key={a.type} className="bg-red-50 border border-red-200 rounded-lg p-5">
                  <h3 className="font-heading text-base font-semibold text-red-900 mb-2">
                    {a.type}
                  </h3>
                  <p className="text-sm text-sand-800 m-0 mb-2">
                    <strong>Réalité 2026 :</strong> {a.realite}
                  </p>
                  <p className="text-sm text-sand-800 m-0">
                    <strong>Action :</strong> {a.actionDgccrf}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section aria-labelledby="vraies-aides" className="my-10">
            <h2
              id="vraies-aides"
              className="font-heading text-2xl font-bold text-sand-900 mb-3 flex items-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5 text-accent-700" aria-hidden />5 vraies aides PAC
              cumulables 2026
            </h2>
            <p className="text-sand-700 mb-5">
              5 dispositifs publics encadrent réellement le financement d&apos;une pompe à chaleur
              en 2026. Tous CUMULABLES entre eux. Sources légales obligatoires (Légifrance, Code
              énergie, ANAH, DGFiP) :
            </p>
            <div className="space-y-4">
              {VRAIES_AIDES.map((a) => (
                <article key={a.nom} className="bg-white border border-sand-200 rounded-lg p-5">
                  <h3 className="font-heading text-base font-semibold text-sand-900 mb-1">
                    {a.nom}
                  </h3>
                  <p className="text-xs text-sand-500 m-0 mb-2">
                    Organisme : {a.organisme} · Source : {a.sourceLegale}
                  </p>
                  <p className="text-sm text-sand-700 m-0 mb-2">
                    <strong>Montant max :</strong> {a.montantMax}
                  </p>
                  <p className="text-sm text-sand-700 m-0 mb-2">
                    <strong>Éligibilité :</strong> {a.eligibilite}
                  </p>
                  <p className="text-sm text-sand-700 m-0">
                    <strong>Fonctionnement :</strong> {a.fonctionnement}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section aria-labelledby="tableau-mpr" className="my-10">
            <h2
              id="tableau-mpr"
              className="font-heading text-2xl font-bold text-sand-900 mb-3 flex items-center gap-2"
            >
              <Euro className="w-5 h-5 text-primary-700" aria-hidden />
              Tableau MaPrimeRénov&apos; PAC par revenus (2026)
            </h2>
            <p className="text-sand-700 mb-5">
              Forfaits MPR 2026 par type de PAC et catégorie de revenus ANAH (basée sur RFR avis
              d&apos;imposition N-2). Bleu = très modestes, Jaune = modestes, Violet =
              intermédiaires, Rose = supérieurs (souvent exclu) :
            </p>
            <div className="overflow-x-auto bg-white border border-sand-200 rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-sand-100">
                  <tr>
                    <th className="text-left p-3 font-semibold text-sand-900">Type PAC</th>
                    <th className="text-left p-3 font-semibold text-blue-700">🔵 Bleu</th>
                    <th className="text-left p-3 font-semibold text-yellow-700">🟡 Jaune</th>
                    <th className="text-left p-3 font-semibold text-purple-700">🟣 Violet</th>
                    <th className="text-left p-3 font-semibold text-pink-700">🌸 Rose</th>
                  </tr>
                </thead>
                <tbody>
                  {TABLEAU_MPR.map((t, i) => (
                    <tr key={t.type} className={i % 2 === 0 ? 'bg-white' : 'bg-sand-50'}>
                      <td className="p-3 border-t border-sand-200">
                        <p className="font-medium text-sand-900 m-0">{t.type}</p>
                        <p className="text-xs text-sand-500 m-0">{t.note}</p>
                      </td>
                      <td className="p-3 font-semibold text-sand-800 border-t border-sand-200">
                        {t.bleu}
                      </td>
                      <td className="p-3 font-semibold text-sand-800 border-t border-sand-200">
                        {t.jaune}
                      </td>
                      <td className="p-3 font-semibold text-sand-800 border-t border-sand-200">
                        {t.violet}
                      </td>
                      <td className="p-3 font-semibold text-sand-800 border-t border-sand-200">
                        {t.rose}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section aria-labelledby="scenarios" className="my-10">
            <h2
              id="scenarios"
              className="font-heading text-2xl font-bold text-sand-900 mb-3 flex items-center gap-2"
            >
              <Coins className="w-5 h-5 text-primary-700" aria-hidden />3 scénarios chiffrés (cas
              concrets 2026)
            </h2>
            <p className="text-sand-700 mb-5">
              3 cas concrets de cumul d&apos;aides selon profil de logement, revenus et type de PAC.
              Le reste à charge varie de 2 500 € (Bleu DPE F/G PAC air-eau) à 13 500 € (Violet PAC
              hybride) :
            </p>
            <div className="space-y-4">
              {SCENARIOS.map((s) => (
                <article key={s.titre} className="bg-white border border-sand-200 rounded-lg p-5">
                  <h3 className="font-heading text-base font-semibold text-sand-900 mb-2">
                    {s.titre}
                  </h3>
                  <p className="text-sm text-sand-700 m-0 mb-2">
                    <strong>Profil :</strong> {s.profil}
                  </p>
                  <ul className="space-y-1 text-xs text-sand-700 mb-2 list-none pl-0">
                    <li>
                      <strong>Devis matériel + pose :</strong> {s.devisMateriel}
                    </li>
                    <li>
                      <strong>{s.aidesMpr}</strong>
                    </li>
                    <li>
                      <strong>{s.aidesCee}</strong>
                    </li>
                    <li>{s.aidesBonus}</li>
                    <li>
                      <strong>Total aides cumulées :</strong> {s.aidesTotal}
                    </li>
                  </ul>
                  <p className="text-sm font-bold text-accent-700 m-0 mb-2">
                    Reste à charge : {s.resteCharge}
                  </p>
                  <p className="text-sm text-sand-700 m-0">{s.detail}</p>
                </article>
              ))}
            </div>
          </section>

          <section aria-labelledby="eligibilite" className="my-10">
            <h2
              id="eligibilite"
              className="font-heading text-2xl font-bold text-sand-900 mb-3 flex items-center gap-2"
            >
              <ShieldCheck className="w-5 h-5 text-primary-700" aria-hidden />4 conditions
              d&apos;éligibilité 2026
            </h2>
            <p className="text-sand-700 mb-5">
              4 conditions cumulatives à respecter pour bénéficier des aides PAC 2026. Le
              non-respect d&apos;une seule condition = perte sèche de plusieurs milliers
              d&apos;euros :
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {ELIGIBILITE_4.map((e) => (
                <article key={e.titre} className="bg-white border border-sand-200 rounded-lg p-5">
                  <h3 className="font-heading text-base font-semibold text-sand-900 mb-2">
                    {e.titre}
                  </h3>
                  <p className="text-sm text-sand-700 m-0">{e.detail}</p>
                </article>
              ))}
            </div>
          </section>

          <section aria-labelledby="artisan" className="my-10">
            <h2
              id="artisan"
              className="font-heading text-2xl font-bold text-sand-900 mb-3 flex items-center gap-2"
            >
              <Wrench className="w-5 h-5 text-primary-700" aria-hidden />
              Trouver un artisan RGE QualiPAC
            </h2>
            <p className="text-sand-700 mb-3">
              L&apos;artisan RGE QualiPAC est OBLIGATOIRE pour bénéficier de MPR + CEE + TVA 5,5 % +
              éco-PTZ. Vérifier sur les sources officielles (extension .gouv.fr) :
            </p>
            <ul className="space-y-2 mb-3 list-disc pl-6 text-sand-700 text-sm">
              <li>
                <strong>france-renov.gouv.fr</strong> → &quot;Trouver un professionnel RGE&quot;
                (annuaire officiel ANAH).
              </li>
              <li>
                <strong>qualit-enr.org/qualipac</strong> → annuaire officiel Qualit&apos;EnR
                (organisme certificateur).
              </li>
              <li>Demander l&apos;attestation RGE en cours (renouvellement annuel obligatoire).</li>
              <li>
                Refuser tout démarchage téléphonique (interdit depuis mars 2023, Décret 2022-1313).
              </li>
              <li>Comparer 2-3 devis avant signature (10-20 % d&apos;écart fréquent).</li>
            </ul>
            <Link
              href="/services/chauffagiste"
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Trouver un chauffagiste RGE QualiPAC vérifié
              <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
          </section>

          <FlagshipFaq title="Aides pompe à chaleur 2026 : foire aux questions" items={faqs} />

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
              href="/renovation-energetique/aides"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Hub Aides
            </Link>
            <Link
              href="/services/chauffagiste"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Chauffagistes QualiPAC <Coins className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
