/**
 * /renovation-energetique/travaux/chauffage/chaudiere-bois — Levier 3 ROI.
 *
 * @kw-primary    chaudiere a bois
 * @kw-volume     1200
 * @kw-kd         1
 * @kw-cpc        0.40
 * @cluster       3
 * @ahrefs-source live keywords-explorer/overview snapshot 2026-05-06 country=fr
 * @backlog-item  P3-chaudiere-biomasse-cluster
 *
 * KW cibles validés Ahrefs API live (snapshot 2026-05-06, country=fr) :
 * - "chaudiere a bois"           → 1 200 vol, KD 1, CPC 0,40 € (PIVOT primary)
 * - "chaudiere biomasse"         → 900 vol, KD 1, CPC 0,25 €
 * - "chaudiere bois"             → 900 vol, KD 1, CPC 0,45 €
 * - "chaudiere bois buche"       → 450 vol, KD 0, CPC 0,40 €
 * - "chaudiere a granules"       → 250 vol, KD 4, CPC 0,70 €
 * - "chaudiere a buche"          → 100 vol, KD 0, CPC 0,60 €
 * - "chaudiere granules"         → 80 vol, KD 2, CPC 0,60 €
 * - "prix chaudiere bois"        → 80 vol, KD 0, CPC 0,35 €
 * - "prix chaudiere granules"    → 80 vol (KD null)
 * - "chaudiere pellets"          → 70 vol, KD 4, CPC 0,60 €
 * - "chaudiere bois prix"        → 40 vol, KD 0, CPC 0,40 €
 * - "prix chaudiere a bois"      → 40 vol, KD 0, CPC 0,50 €
 * - "chaudiere a bois prix"      → 30 vol, KD 0, CPC 0,50 €
 * - "chaudiere granules prix"    → 10 vol (KD null)
 * - Cluster cumulé : ~4 250 vol/mo, KD avg 1.5 — quasi-libre.
 *
 * Easy win : OUI MAJEUR (KD 0-2 sur 80 % des KW). Concurrence head : effy,
 * quelleenergie, Hellio. Atout SA : cluster bois/biomasse cohérent (chaudière
 * + poêle) sous label RGE Qualibois unique, supply 4 171 actifs (snapshot
 * DB 2026-05-06), top régions Nouvelle-Aquitaine 1119, AURA 732, Grand Est 482.
 *
 * Anti-cannibalisation :
 *   - /chauffage/poele-granules        → poêle (point unique pièce)
 *   - /chauffage/chaudiere-condensation → chaudière gaz/fioul (transition,
 *     mention que MPR a disparu pour le gaz)
 *   - /chauffage/chauffe-eau-thermodynamique → ECS uniquement
 *   - Cette page = chaudière biomasse (chauffage central + ECS éventuelle)
 *   - /guides/chaudiere-fioul-interdite-2026 + /guides/chaudiere-gaz-vs-granules
 *     → cette page absorbe l'autorité topical via maillage descendant
 *
 * Aides chaudière biomasse 2026 (rappel critique YMYL) :
 *   - MaPrimeRénov' parcours par geste (forfait selon revenus + saut DPE)
 *   - CEE BAR-TH-104 (chaudière biomasse autonome) + Coup de pouce chauffage
 *     si remplacement chaudière fioul ou gaz
 *   - éco-PTZ jusqu'à 30 000 € (par geste) ou 50 000 € (rénovation d'ampleur)
 *   - TVA 5,5 % sur fourniture + pose par RGE
 *   - Cumul MPR + CEE + éco-PTZ + TVA 5,5 % autorisé
 *   - Page hedge volontairement les forfaits MPR exacts (révisés annuellement
 *     par Anah + barème CEE volatil) → renvoi france-renov.gouv.fr.
 *
 * Label RGE OBLIGATOIRE : Qualibois (module Bois ou Bois + Eau selon configuration).
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Calculator, Flame } from 'lucide-react'

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

const PAGE_PATH = '/renovation-energetique/travaux/chauffage/chaudiere-bois'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'jean-pierre-duval'
const AUTHOR_NAME = 'Jean-Pierre Duval'

const TITLE = 'Chaudière à bois 2026 : prix, granulés ou bûches, aides MPR'
const DESCRIPTION =
  'Chaudière à bois 2026 : prix posé 8 000-25 000 € (granulés / bûche / mixte), aides MaPrimeRénov’ + CEE BAR-TH-104, label RGE Qualibois obligatoire.'

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
  'Chaudière à bois (biomasse) = chauffage central + ECS via combustible bois (granulés, bûches ou mixte).',
  '3 grandes familles : chaudière à granulés (auto), chaudière à bûches (manuelle), chaudière mixte (granulés + bûches).',
  'Prix posé 2026 : granulés 15 000-22 000 € · bûche 8 000-15 000 € · mixte 18 000-25 000 € (silo + ballon tampon inclus).',
  'Rendement ETAS 75-85 % (granulés) à 70-80 % (bûche). Durée de vie 20-25 ans.',
  'Aides cumulables 2026 : MaPrimeRénov’ + CEE BAR-TH-104 + Coup de pouce chauffage si remplacement fioul/gaz + éco-PTZ + TVA 5,5 %.',
  'Label RGE Qualibois OBLIGATOIRE pour ouvrir droit aux aides. SA référence 4 171 artisans Qualibois actifs (snapshot 2026-05-06).',
  'Coût combustible 2026 : granulés ~6-8 ct €/kWh PCI, bûche ~3-5 ct €/kWh — 30-50 % moins cher que gaz ou électricité.',
]

const TYPES = [
  {
    type: 'Chaudière à granulés (pellets)',
    prix: '15 000-22 000 € posé',
    rendement: 'Rendement ETAS 75-85 %',
    autonomie: 'Autonomie 1-7 jours selon silo',
    detail:
      'Alimentation automatique depuis un silo (textile ou maçonné). Régulation fine, allumage automatique, faible entretien. Choix #1 confort. Nécessite silo dédié (3-10 m³) et électricité pour l’alimentation.',
  },
  {
    type: 'Chaudière à bûches',
    prix: '8 000-15 000 € posé',
    rendement: 'Rendement ETAS 70-80 %',
    autonomie: 'Chargement manuel quotidien (1-3×/jour)',
    detail:
      'Fonctionnement manuel : foyer chargé en bûches, combustion par tirage forcé (ventilateur). Bon ROI si bûche locale auto-produite. Nécessite ballon tampon obligatoire (rendement + autonomie). Demande discipline d’usage.',
  },
  {
    type: 'Chaudière mixte (granulés + bûches)',
    prix: '18 000-25 000 € posé',
    rendement: 'Rendement ETAS 75-82 %',
    autonomie: 'Auto en granulés, manuel en bûche',
    detail:
      'Bi-combustible : granulés en autonomie + bûches en appoint (ou inverse). Compromis confort/coût. Adapté aux foyers avec stock de bûches occasionnel mais besoin de fiabilité automatique.',
  },
  {
    type: 'Chaudière à plaquettes (bois déchiqueté)',
    prix: '20 000-35 000 € posé',
    rendement: 'Rendement ETAS 80-87 %',
    autonomie: 'Auto via vis sans fin',
    detail:
      'Combustible le moins cher (~3-4 ct €/kWh) mais ticket d’entrée élevé. Réservé aux maisons isolées (≥200 m²), exploitations agricoles ou collectifs. Volume silo nécessaire élevé (15-30 m³).',
  },
]

const PROFILS = [
  {
    profil: 'Maison 100-150 m², usage permanent, conso 15-25 MWh/an',
    recommandation: 'Chaudière à granulés 18-25 kW + silo 4-6 m³',
    justification:
      'Auto, faible entretien, rendement élevé. Investissement 16-19 k€ (avant aides), MPR + CEE + Coup de pouce typiques 6-12 k€ selon revenus + provenance fioul/gaz.',
  },
  {
    profil: 'Maison ancienne mal isolée, conso 25-40 MWh/an, accès bûche local',
    recommandation: 'Chaudière à bûches 25-35 kW + ballon tampon 1 500 L',
    justification:
      'Combustible local très bon marché si bûche auto-produite. ROI 5-8 ans. Discipline manuelle requise. Investissement 10-14 k€ (avant aides).',
  },
  {
    profil: 'Maison 150 m², stock bûches occasionnel + fiabilité',
    recommandation: 'Chaudière mixte granulés/bûche',
    justification:
      'Confort granulés en semaine, bûche le week-end ou en hiver dur. Investissement 19-23 k€. ROI 8-11 ans selon ratio combustibles.',
  },
  {
    profil: 'Remplacement chaudière fioul (interdite installation neuve)',
    recommandation: 'Chaudière granulés + Coup de pouce chauffage',
    justification:
      'Coup de pouce CEE bonifié pour sortie fioul (cumul MPR + CEE + bonus). Reste à charge ménages modestes souvent < 5 000 €. ROI accéléré 4-6 ans vs continuer fioul.',
  },
  {
    profil: 'Logement < 80 m² ou conso < 12 MWh/an',
    recommandation: 'Plutôt poêle à granulés + appoint élec',
    justification:
      'Chaudière biomasse surdimensionnée pour ces besoins. Voir notre page dédiée /chauffage/poele-granules — investissement divisé par 3.',
  },
  {
    profil: 'Logement très bien isolé (RT2020 / DPE A-B)',
    recommandation: 'Plutôt PAC air-eau ou géothermie',
    justification:
      'Besoins de chauffage faibles → PAC plus rentable que biomasse. Voir /chauffage/pompe-a-chaleur. Biomasse reste pertinente si pas de réseau gaz + revenus modestes.',
  },
]

const PRIX_DETAILS = [
  {
    poste: 'Chaudière granulés 20 kW',
    prix: '8 000-12 000 € HT (matériel)',
    note: 'Marques : ÖkoFEN, Fröling, HS France, Hargassner, Windhager.',
  },
  {
    poste: 'Silo granulés textile 4 m³',
    prix: '1 500-3 500 €',
    note: 'Maçonné = 3 000-6 000 €. Volume = 1 m³/10 kW pour 6 mois autonomie.',
  },
  {
    poste: 'Ballon tampon 800-1 500 L',
    prix: '1 500-3 500 €',
    note: 'Obligatoire chaudière bûches, optionnel granulés (lisse les cycles).',
  },
  {
    poste: 'Pose + raccordement hydraulique',
    prix: '2 500-5 000 €',
    note: 'Inclut désinstallation ancienne chaudière, conduit fumée, régulation.',
  },
  {
    poste: 'Conduit de fumée / tubage',
    prix: '600-2 000 €',
    note: 'DTU 24.1, classe T200 minimum. Vérification ramoneur certifié.',
  },
  {
    poste: 'Ramonage annuel obligatoire',
    prix: '80-150 € / an',
    note: '2 ramonages/an préconisés pour granulés (tirage), 1 obligatoire.',
  },
]

const faqs = [
  {
    question: 'Quel type de chaudière à bois choisir : granulés, bûches ou mixte ?',
    answer:
      'Trois cas typiques. (1) <strong>Confort + faible entretien</strong> : <strong>chaudière à granulés</strong> (alimentation automatique depuis silo, régulation fine, allumage auto). C’est le scénario standard 2026 (15 000-22 000 € posé). (2) <strong>Combustible local pas cher + acceptation manuelle</strong> : <strong>chaudière à bûches</strong> (8 000-15 000 €, ballon tampon obligatoire). ROI très rapide si bûche auto-produite, mais chargement manuel quotidien. (3) <strong>Compromis</strong> : <strong>chaudière mixte</strong> granulés + bûche (18 000-25 000 €). Critère décisif : votre tolérance au chargement manuel et l’accès bûche local. À conso égale (25 MWh/an), granulés coûtent ~1 750 €/an, bûches ~1 000 €/an.',
  },
  {
    question: 'Combien coûte une chaudière à bois posée en 2026 ?',
    answer:
      'Prix posés 2026 (matériel + pose + raccordement) : <strong>granulés 20 kW</strong> 15 000-22 000 € (chaudière 8-12 k€ + silo 1,5-3,5 k€ + pose 2,5-5 k€ + ballon 1,5-3,5 k€ + tubage 0,6-2 k€). <strong>Bûche 25 kW</strong> 8 000-15 000 € (chaudière 4-7 k€, ballon obligatoire 1,5-3,5 k€, pose 2,5-5 k€). <strong>Mixte</strong> 18 000-25 000 €. <strong>Plaquettes</strong> 20 000-35 000 € (réservé aux gros besoins ≥ 30 kW). Hors aides — voir question suivante. Préférer 2-3 devis d’artisans Qualibois pour un comparatif réel.',
  },
  {
    question: 'Quelles aides pour une chaudière à bois en 2026 ?',
    answer:
      'Aides cumulables 2026 (chaudière biomasse uniquement, pas chaudière gaz/fioul) : <strong>MaPrimeRénov’</strong> parcours par geste (forfait selon revenus + saut DPE — barème révisé annuellement par l’Anah, voir <a href="https://france-renov.gouv.fr" rel="noopener noreferrer" target="_blank">france-renov.gouv.fr</a>), <strong>CEE BAR-TH-104</strong> (chaudière biomasse autonome — montant variable opérateur), <strong>Coup de pouce chauffage</strong> bonifié si remplacement chaudière <strong>fioul ou gaz</strong> (CEE majorés ménages modestes), <strong>éco-PTZ</strong> jusqu’à 30 000 € par geste / 50 000 € rénovation d’ampleur, <strong>TVA 5,5 %</strong> sur fourniture + pose par artisan RGE. Cumul autorisé MPR + CEE + éco-PTZ + TVA. Reste à charge typique ménages modestes (Bleu) : 0-5 000 € pour granulés. Simulation personnalisée via notre <a href="/simulateur-aides-renovation">simulateur officiel</a>.',
  },
  {
    question: 'Faut-il un artisan RGE Qualibois pour bénéficier des aides ?',
    answer:
      'Oui, obligatoire. La mention RGE concernée pour la chaudière à bois est <strong>Qualibois</strong> (module Bois Énergie ou Bois + Eau selon configuration). Sans Qualibois valide à la date du devis, vous perdez : MPR, CEE, éco-PTZ, TVA 5,5 %. Vérification possible sur <a href="https://france-renov.gouv.fr/annuaires-professionnels/artisan-rge" rel="noopener noreferrer" target="_blank">france-renov.gouv.fr</a> (annuaire ADEME). Notre base référence <strong>4 171 artisans Qualibois actifs en France</strong> (snapshot 2026-05-06). Top régions : Nouvelle-Aquitaine (1 119), Auvergne-Rhône-Alpes (732), Grand Est (482), Hauts-de-France (366), Normandie (284). Contrôler aussi l’assurance décennale + le DTU 24.1 pour le conduit de fumée.',
  },
  {
    question: 'Combien de temps pour rentabiliser une chaudière à bois ?',
    answer:
      '<strong>ROI typique 2026</strong> : 6-10 ans pour granulés en remplacement chaudière fioul/gaz (économie combustible 30-50 % + Coup de pouce CEE). 4-7 ans pour bûches auto-produites. Calcul indicatif granulés (maison 150 m², conso 25 MWh/an) : investissement 18 000 € posé, aides cumulées MPR + CEE + Coup de pouce typiques 6 000-12 000 € (selon revenus), reste à charge 6 000-12 000 €. Économie annuelle vs fioul : ~1 500-2 200 €/an aux prix 2026. Rentabilité 5-8 ans pour ménages modestes, 8-11 ans pour ménages intermédiaires/supérieurs. Durée de vie 20-25 ans = 15-20 ans de gain net.',
  },
  {
    question: 'Quel est le coût du combustible bois en 2026 ?',
    answer:
      '<strong>Granulés (pellets)</strong> 2026 : ~6-8 ct €/kWh PCI selon région et marque (sac 15 kg ou vrac soufflé). Vrac = 30 % moins cher que sac. Préférer label NF ou ENplus A1 (taux humidité < 10 %, faible cendre). <strong>Bûches</strong> : ~3-5 ct €/kWh PCI (humidité < 20 %, séchage 18 mois minimum). Plus cher si livraison + façonnage, moins cher si bûche locale auto. <strong>Plaquettes</strong> : ~3-4 ct €/kWh, réservé aux gros besoins. <strong>Comparaison</strong> : gaz naturel ~12-14 ct €/kWh, fioul ~12-15 ct €/kWh, électricité ~22-25 ct €/kWh — donc biomasse = 30-70 % moins cher au kWh utile. Volume stocké (granulés 1 m³ ≈ 650 kg ≈ 3 000 kWh).',
  },
  {
    question: 'Quel entretien pour une chaudière à bois ?',
    answer:
      '<strong>Entretien obligatoire</strong> : (1) <strong>contrat de maintenance annuel</strong> par professionnel (décret n° 2009-649) — vérification combustion, échangeur, sécurités, régulation. Coût 200-400 €/an. (2) <strong>Ramonage</strong> du conduit de fumée — minimum 1×/an pour bûches, 2×/an pour granulés (préconisation FFRP), par ramoneur certifié, 80-150 € par passage. (3) <strong>Vidage du cendrier</strong> — toutes les 1-3 semaines selon usage (granulés peu de cendre, bûche plus). (4) <strong>Nettoyage de l’échangeur</strong> — semestriel pour granulés, mensuel pour bûches. <strong>Coût total entretien annuel</strong> : 350-650 €/an (hors combustible). Sous-traitance via votre artisan Qualibois ou un chauffagiste local.',
  },
  {
    question: 'Chaudière à bois ou pompe à chaleur : quel choix en 2026 ?',
    answer:
      'Critère principal : <strong>niveau d’isolation</strong>. (1) <strong>Maison bien isolée (DPE A-C)</strong> : <strong>PAC air-eau</strong> plus rentable (COP 3-4, exploite l’énergie ambiante). Voir <a href="/renovation-energetique/travaux/pompe-a-chaleur">/pompe-a-chaleur</a>. (2) <strong>Maison ancienne mal isolée (DPE D-G)</strong> : <strong>chaudière biomasse</strong> souvent plus pertinente (puissance disponible, supporte radiateurs hauts régimes 70-80 °C — la PAC perd en COP au-delà de 55 °C). (3) <strong>Pas de réseau gaz + revenus modestes</strong> : biomasse + Coup de pouce chauffage = reste à charge minimal. (4) <strong>Couplage</strong> : PAC en base + chaudière biomasse en appoint hivernal possible (système hybride premium). Audit énergétique préalable recommandé pour rénovation > 15 000 €.',
  },
]

const sources = [
  { label: 'France Rénov’ — Chaudière biomasse', url: 'https://france-renov.gouv.fr' },
  {
    label: 'ADEME — Guide chauffage au bois domestique',
    url: 'https://www.ademe.fr',
  },
  { label: 'Anah — MaPrimeRénov’ chaudière biomasse', url: 'https://www.anah.gouv.fr' },
  {
    label: 'Service-Public.fr — Aides chauffage bois',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F35330',
  },
  {
    label: 'Qualit’EnR — Mention RGE Qualibois',
    url: 'https://www.qualit-enr.org/qualifications/qualibois/',
  },
  {
    label: 'Légifrance — Coup de pouce chauffage (BAR-TH-104)',
    url: 'https://www.legifrance.gouv.fr',
  },
  {
    label: 'Propellet — Statistiques granulés France',
    url: 'https://www.propellet.fr',
  },
]

const relatedPages = [
  {
    label: 'Hub Chauffage 2026',
    href: '/renovation-energetique/travaux/chauffage',
    description: 'Comparatif PAC, chaudière, poêle, CET',
  },
  {
    label: 'Poêle à granulés',
    href: '/renovation-energetique/travaux/chauffage/poele-granules',
    description: 'Appoint pièce vie, alternative pour < 80 m²',
  },
  {
    label: 'Pompe à chaleur',
    href: '/renovation-energetique/travaux/pompe-a-chaleur',
    description: 'Alternative si DPE A-C / réseau radiateurs basse T',
  },
  {
    label: 'Chaudière condensation (gaz)',
    href: '/renovation-energetique/travaux/chauffage/chaudiere-condensation',
    description: 'Pourquoi MPR a disparu, alternatives',
  },
  {
    label: 'Aides MaPrimeRénov’ 2026',
    href: '/renovation-energetique/aides/maprimerenov-2026',
    description: 'Barèmes par revenus + saut DPE',
  },
  {
    label: 'Simulateur aides 2026',
    href: '/simulateur-aides-renovation',
    description: 'Estimation personnalisée chaudière biomasse',
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
    section: 'Chaudière biomasse',
    keywords: [
      'chaudiere a bois',
      'chaudiere biomasse',
      'chaudiere bois',
      'chaudiere a granules',
      'chaudiere bois buche',
      'chaudiere granules prix',
      'qualibois',
      'maprimerenov chaudiere bois',
      'cee bar-th-104',
      'coup de pouce chauffage',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique/travaux' },
    { name: 'Chauffage', url: '/renovation-energetique/travaux/chauffage' },
    { name: 'Chaudière à bois', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const govSchema = getGovernmentServiceSchema({
    name: 'Aides chaudière biomasse 2026 (MaPrimeRénov’ + CEE BAR-TH-104)',
    description:
      'Chaudière à bois (granulés, bûches, mixte, plaquettes) éligible MaPrimeRénov’ par geste et CEE BAR-TH-104. Coup de pouce chauffage bonifié si remplacement chaudière fioul ou gaz. Installation par artisan RGE Qualibois obligatoire.',
    url: PAGE_URL,
    serviceType: 'Subvention publique chaudière biomasse',
    audience: 'Propriétaires occupants, bailleurs, copropriétés',
    sameAs: [
      'https://france-renov.gouv.fr',
      'https://www.anah.gouv.fr',
      'https://www.service-public.fr/particuliers/vosdroits/F35330',
      'https://www.legifrance.gouv.fr',
    ],
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
              { label: 'Travaux', href: '/renovation-energetique/travaux' },
              { label: 'Chauffage', href: '/renovation-energetique/travaux/chauffage' },
              { label: 'Chaudière à bois' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Flame className="w-3.5 h-3.5" aria-hidden />
              Chauffage biomasse 2026 — Qualibois
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Chaudière à bois 2026 : prix, granulés ou bûches, aides MPR
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              La <strong>chaudière à bois</strong> (biomasse) couvre le chauffage central et l’ECS
              via combustible bois (granulés, bûches, mixte, plaquettes). Elle reste{' '}
              <strong>la solution la plus pertinente</strong> pour les maisons anciennes mal isolées
              et les zones sans réseau gaz. Aides 2026 cumulables :{' '}
              <strong>MaPrimeRénov’ + CEE BAR-TH-104 + Coup de pouce chauffage</strong> si
              remplacement fioul/gaz + éco-PTZ + TVA 5,5 %. Label <strong>RGE Qualibois</strong>{' '}
              obligatoire.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2 id="types">Les 4 grandes familles de chaudières à bois</h2>
            <div className="not-prose grid gap-3 my-6">
              {TYPES.map((t) => (
                <div key={t.type} className="bg-white border border-sand-200 rounded-xl p-5">
                  <div className="flex items-baseline justify-between gap-2 flex-wrap mb-2">
                    <h3 className="font-heading text-base font-semibold text-sand-900 m-0">
                      {t.type}
                    </h3>
                    <span className="text-sm font-bold text-primary-700 whitespace-nowrap">
                      {t.prix}
                    </span>
                  </div>
                  <p className="text-xs text-sand-500 m-0 mb-1">
                    {t.rendement} · {t.autonomie}
                  </p>
                  <p className="text-sm text-sand-700 m-0">{t.detail}</p>
                </div>
              ))}
            </div>

            <h2 id="profil">Quelle chaudière biomasse selon votre profil</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Profil</th>
                    <th className="p-3 border-b border-sand-200">Recommandation</th>
                    <th className="p-3 border-b border-sand-200">Pourquoi</th>
                  </tr>
                </thead>
                <tbody>
                  {PROFILS.map((r) => (
                    <tr key={r.profil} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium text-sand-900">{r.profil}</td>
                      <td className="p-3 text-primary-700 font-semibold">{r.recommandation}</td>
                      <td className="p-3 text-sand-600">{r.justification}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 id="prix">Prix posé 2026 — détail par poste</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Poste</th>
                    <th className="p-3 border-b border-sand-200">Prix</th>
                    <th className="p-3 border-b border-sand-200">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {PRIX_DETAILS.map((p) => (
                    <tr key={p.poste} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium text-sand-900">{p.poste}</td>
                      <td className="p-3 text-primary-700 font-semibold">{p.prix}</td>
                      <td className="p-3 text-sand-600 text-xs">{p.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-sand-500 italic">
              Fourchettes indicatives 2026 (matériel + pose, hors aides). Variations selon
              puissance, marque, complexité chantier et zone géographique. Préférer 2-3 devis
              d’artisans Qualibois pour comparatif réel.
            </p>

            <h2 id="aides">Aides chaudière biomasse 2026</h2>
            <p>
              La <strong>chaudière à bois (biomasse)</strong> est un des chauffages les mieux aidés
              en 2026, tous dispositifs cumulables :
            </p>
            <ul>
              <li>
                <strong>MaPrimeRénov’</strong> parcours par geste : forfait selon revenus (Bleu /
                Jaune / Violet / Rose) et type de chaudière. Barème révisé annuellement par l’Anah —
                consulter{' '}
                <a href="https://france-renov.gouv.fr" rel="noopener noreferrer" target="_blank">
                  france-renov.gouv.fr
                </a>{' '}
                pour le montant en vigueur.
              </li>
              <li>
                <strong>CEE BAR-TH-104</strong> (chaudière biomasse autonome) : prime variable selon
                opérateur et zone climatique, cumulable avec MPR.
              </li>
              <li>
                <strong>Coup de pouce chauffage</strong> bonifié si remplacement chaudière{' '}
                <strong>fioul ou gaz</strong> : CEE majorés ménages modestes (parfois 4 000-5 000 €
                supplémentaires). Cumul automatique avec MPR.
              </li>
              <li>
                <strong>éco-PTZ</strong> (Prêt à Taux Zéro) : jusqu’à 30 000 € par geste, 50 000 €
                rénovation d’ampleur. Sans condition de revenus.
              </li>
              <li>
                <strong>TVA 5,5 %</strong> sur fourniture + pose par artisan RGE Qualibois (vs 20 %
                sans RGE).
              </li>
              <li>
                <strong>Aides locales</strong> : régions et départements (variable, voir{' '}
                <Link href="/aides/par-region">/aides/par-region</Link>).
              </li>
            </ul>
            <p>
              <strong>Reste à charge typique</strong> ménages modestes (Bleu) avec sortie fioul :
              0-5 000 € pour granulés (chaudière 18 000 €). Ménages intermédiaires (Violet) : 8 000-
              13 000 €. Simulation personnalisée via notre{' '}
              <Link href="/simulateur-aides-renovation">simulateur officiel</Link>.
            </p>

            <h2 id="rge">Le label RGE Qualibois : pourquoi c’est obligatoire</h2>
            <p>
              La mention <strong>Qualibois</strong> (Qualit’EnR) certifie la compétence d’un
              installateur de chaudières et poêles à bois. Deux modules :{' '}
              <strong>Bois Énergie</strong> (chaudière simple) et <strong>Bois + Eau</strong>{' '}
              (couplage hydraulique avec radiateurs ou plancher chauffant). Sans Qualibois valide à
              la date du devis, vous perdez : MPR, CEE, éco-PTZ, TVA 5,5 %. Vérification possible
              sur{' '}
              <a
                href="https://france-renov.gouv.fr/annuaires-professionnels/artisan-rge"
                rel="noopener noreferrer"
                target="_blank"
              >
                france-renov.gouv.fr
              </a>{' '}
              ou via notre annuaire. Notre base référence{' '}
              <strong>4 171 artisans Qualibois actifs</strong> (snapshot 2026-05-06). Top régions :
              Nouvelle-Aquitaine (1 119), Auvergne-Rhône-Alpes (732), Grand Est (482), Hauts-de-
              France (366), Normandie (284). Vérifier aussi l’assurance décennale et le respect du
              DTU 24.1 pour le conduit de fumée.
            </p>

            <h2 id="cta">Trouvez un artisan RGE Qualibois près de chez vous</h2>
            <div className="not-prose bg-primary-50 border border-primary-200 rounded-xl p-6 my-6">
              <p className="text-sand-900 m-0 mb-3">
                <Calculator className="inline w-5 h-5 text-primary-700 mr-1" aria-hidden />
                <strong>Devis chaudière biomasse en 30 secondes</strong> — artisans certifiés RGE
                Qualibois pour ouvrir droit à MPR + CEE + Coup de pouce chauffage.
              </p>
              <Link
                href="/devis"
                className="inline-flex items-center gap-2 bg-primary-700 hover:bg-primary-800 text-white font-semibold px-5 py-3 rounded-lg transition"
              >
                Demander mon devis chaudière bois <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
            </div>
          </article>

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
