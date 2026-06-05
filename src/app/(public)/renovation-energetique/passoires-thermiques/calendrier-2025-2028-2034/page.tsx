/**
 * Page : /renovation-energetique/passoires-thermiques/calendrier-2025-2028-2034
 *
 * KW cibles (validés Ahrefs API live, snapshot 2026-05-04, country=fr) :
 * - "loi climat resilience"          → 150 vol, KD 18, CPC $30 ⭐⭐⭐ (KD modéré, CPC élevé YMYL)
 * - "passoire thermique 2025"        → 20 vol, KD 0
 * - "dpe 2025 location"              → 50 vol
 * - "passoire energetique"           → 150 vol, KD 8, CPC $25 (variant)
 * - Famille cumulée pivot : ~370 vol/mois (volume direct faible)
 *
 * Source : audit Ahrefs API live (cf docs/ahrefs-audit-2026-04/STRATEGIE-RENOVATION-ENERGETIQUE.md)
 * Easy win : NON direct (vol < 500), mais page support stratégique :
 *            - Anchor pour requêtes longue traîne timeline (recherches "quelle date interdiction X")
 *            - PageRank vers /interdiction-location-g-f/ et /aides/maprimerenov-2026/parcours-accompagne
 *            - Schema GovernmentService timeline = featured snippet potentiel
 * Cluster pillar : Rénovation Énergétique → Passoires thermiques → Calendrier
 *
 * Anti-cannibalisation :
 *   - Hub /passoires-thermiques/ = définition + 4 dates panorama
 *   - /interdiction-location-g-f/ = focus sanctions et obligations bailleur
 *   - Cette page = focus chronologie pure 8 dates clés (2022-2034) + impact par profil
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Calculator, CalendarDays, CheckCircle2, Clock, Flag } from 'lucide-react'

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

const PAGE_PATH = '/renovation-energetique/passoires-thermiques/calendrier-2025-2028-2034'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-04'
const MODIFIED = '2026-05-04'
const AUTHOR_SLUG = 'claire-dubois'
const AUTHOR_NAME = 'Claire Dubois'

const TITLE = 'Calendrier interdiction passoires 2025-34'
const DESCRIPTION =
  'Calendrier loi Climat 2021 : DPE G interdit location depuis 2025, F en 2028, E en 2034. Audit, gel loyers, copropriétés, 8 dates clés.'

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
  '24 août 2022 : gel des loyers passoires F et G (loyer non révisable au renouvellement).',
  '1er avril 2023 : audit énergétique obligatoire vente F/G en monopropriété (étendu E en 2025).',
  '1er janvier 2025 : interdiction location DPE G (~600 000 logements en France).',
  '1er janvier 2028 : interdiction location DPE F (~1,8 million de logements supplémentaires).',
  '1er janvier 2034 : interdiction location DPE E (~7 millions de logements cumulés).',
  'Copropriétés > 200 lots : DPE collectif obligatoire depuis 2024 ; > 50 lots en 2025 ; toutes en 2028.',
]

const TIMELINE = [
  {
    date: '24 août 2022',
    label: 'Gel des loyers passoires F et G',
    detail:
      'Loi Climat et Résilience art. 159 : aucun loyer ne peut plus être révisé annuellement ou augmenté au renouvellement pour un logement classé F ou G. Mesure indépendante des zones tendues.',
    statut: 'En vigueur',
    sourceLabel: 'Loi n° 2021-1104 art. 159',
  },
  {
    date: '1er avril 2023',
    label: 'Audit énergétique obligatoire vente F et G (monopropriété)',
    detail:
      'Pour la vente d’une maison individuelle classée F ou G, l’audit énergétique est obligatoire (en plus du DPE). Décret n° 2022-780 du 4 mai 2022. Coût 500-1 200 € TTC.',
    statut: 'En vigueur',
    sourceLabel: 'Décret n° 2022-780',
  },
  {
    date: '1er janvier 2024',
    label: 'DPE collectif obligatoire copropriétés > 200 lots',
    detail:
      'Toute copropriété de plus de 200 lots construits avant 2013 doit disposer d’un DPE collectif valide. Décret n° 2022-1690 du 27 décembre 2022.',
    statut: 'En vigueur',
    sourceLabel: 'Décret n° 2022-1690',
  },
  {
    date: '1er janvier 2025',
    label: 'Interdiction location DPE G (résidence principale)',
    detail:
      '~600 000 logements concernés. Concerne nouveaux baux et renouvellements (les baux en cours signés avant 2025 ne sont pas rompus). Loi Climat art. 160.',
    statut: 'En vigueur',
    sourceLabel: 'Loi n° 2021-1104 art. 160',
  },
  {
    date: '1er janvier 2025',
    label: 'Audit énergétique obligatoire vente E (extension)',
    detail:
      'L’obligation d’audit énergétique en vente est étendue aux maisons individuelles classées E (en plus de F et G). Décret n° 2022-780 modifié.',
    statut: 'En vigueur',
    sourceLabel: 'Décret n° 2022-780',
  },
  {
    date: '1er janvier 2025',
    label: 'DPE collectif obligatoire copropriétés > 50 lots',
    detail:
      'Extension de l’obligation DPE collectif aux copropriétés entre 51 et 200 lots. Coût ~6-12 € HT par lot.',
    statut: 'En vigueur',
    sourceLabel: 'Décret n° 2022-1690',
  },
  {
    date: '1er janvier 2028',
    label: 'Interdiction location DPE F (résidence principale)',
    detail:
      '~1,8 million de logements supplémentaires concernés. Cumul avec G : ~2,4 millions de logements. Loi Climat art. 160. Préparation à anticiper dès 2026 pour les bailleurs.',
    statut: 'À venir',
    sourceLabel: 'Loi n° 2021-1104 art. 160',
  },
  {
    date: '1er janvier 2028',
    label: 'DPE collectif obligatoire toutes copropriétés ≥ 50 lots',
    detail:
      'Extension complète de l’obligation DPE collectif à toutes les copropriétés (depuis 2 lots dès 2028 selon proposition gouvernementale en débat).',
    statut: 'À venir',
    sourceLabel: 'Loi Climat 2021',
  },
  {
    date: '1er janvier 2034',
    label: 'Interdiction location DPE E (résidence principale)',
    detail:
      '~4,3 millions de logements supplémentaires. Cumul avec F et G : ~7 millions de logements concernés sur les ~32 millions du parc résidentiel français. Seuil énergétique ~250 kWh/m²/an.',
    statut: 'À venir',
    sourceLabel: 'Loi n° 2021-1104 art. 160',
  },
]

const IMPACT_PROFIL = [
  {
    profil: 'Propriétaire-bailleur d’un G',
    urgence: 'IMMÉDIATE (depuis 2025)',
    actions:
      'Soit faire les travaux pour atteindre E minimum (gain ≥ 2 classes DPE), soit vendre avec décote -10 à -20 %, soit accepter un litige avec le locataire (rare en pratique mais légalement risqué).',
  },
  {
    profil: 'Propriétaire-bailleur d’un F',
    urgence: 'HAUTE (avant 2028)',
    actions:
      '~21 mois restants pour anticiper. Lancer un audit énergétique en 2026 + monter le dossier MaPrimeRénov’ Parcours accompagné début 2027 (délai d’instruction 4-6 mois).',
  },
  {
    profil: 'Propriétaire-bailleur d’un E',
    urgence: 'MODÉRÉE (avant 2034)',
    actions:
      '~8 ans restants. Peut anticiper via rénovation par geste (isolation puis chauffage) ou attendre l’audit obligatoire en cas de revente future.',
  },
  {
    profil: 'Propriétaire-occupant d’un G ou F',
    urgence: 'AUCUNE LÉGALE',
    actions:
      'La loi ne vise que les locations. Mais inconfort thermique + factures énergie 2-3× plus élevées + valorisation à la revente justifient souvent les travaux. Aides identiques aux bailleurs.',
  },
  {
    profil: 'Locataire d’un G ou F',
    urgence: 'À ÉVALUER',
    actions:
      'Peut exiger les travaux du bailleur (lettre RAR + saisine juge), demander baisse de loyer judiciaire, ou faire jouer le non-renouvellement à l’échéance.',
  },
  {
    profil: 'Acheteur d’un G ou F',
    urgence: 'NÉGOCIATION',
    actions:
      'Décote moyenne -5 à -20 % observée (Notaires 2024). Audit énergétique obligatoire fourni par le vendeur permet de chiffrer précisément les travaux à prévoir.',
  },
]

const faqs = [
  {
    question: 'Quel est le calendrier complet d’interdiction des passoires thermiques ?',
    answer:
      '3 grandes échéances : 1er janvier 2025 = interdiction location DPE G (résidence principale, ~600 000 logements). 1er janvier 2028 = interdiction location DPE F (~1,8 million de logements supplémentaires). 1er janvier 2034 = interdiction location DPE E (cumul ~7 millions de logements). En complément : gel des loyers F/G depuis le 24 août 2022, audit énergétique obligatoire vente F/G/E (2023 puis 2025), DPE collectif obligatoire copropriétés > 200 lots (2024) puis > 50 lots (2025) puis toutes (2028).',
  },
  {
    question: 'Combien de logements seront concernés en 2034 ?',
    answer:
      'Selon les données SDES 2024 (Service des Données et Études Statistiques) : ~600 000 logements G interdits depuis 2025 + ~1,8 million de F interdits en 2028 + ~4,3 millions de E interdits en 2034 = environ 7 millions de logements cumulés sur ~32 millions du parc résidentiel français (soit ~22 %). Les zones les plus touchées : régions à climat froid (Hauts-de-France, Grand Est, Bourgogne-Franche-Comté) et logements anciens (avant 1948).',
  },
  {
    question: 'Le calendrier 2025-2028-2034 peut-il être repoussé ?',
    answer:
      'Aucun report officiellement annoncé en 2026. Plusieurs propositions parlementaires ont demandé un assouplissement (notamment fusion de l’étiquette logement-vacant, traitement spécifique des copropriétés bloquées), mais le gouvernement maintient le calendrier. Cependant, des dérogations existent : copropriétés bloquées (refus AG documenté), bâtis classés/protégés, contraintes techniques majeures (avis architecte). Voir notre page interdiction location G/F.',
  },
  {
    question: 'Quand a été votée la loi qui prévoit ce calendrier ?',
    answer:
      'La loi n° 2021-1104 du 22 août 2021, dite "Climat et Résilience", articles 159 (gel loyers) et 160 (interdictions location échelonnées). Mise en application progressive par décrets : décret n° 2022-461 du 31 mars 2022 sur les seuils énergétiques, décret n° 2022-780 du 4 mai 2022 sur l’audit énergétique vente, décret n° 2022-1690 du 27 décembre 2022 sur le DPE collectif. Toutes les références sont disponibles sur Légifrance.',
  },
  {
    question: 'Quelle différence entre les seuils E, F et G en consommation kWh/m²/an ?',
    answer:
      'Méthode 3CL-2021 : classe A ≤ 70 kWh/m²/an, B 71-110, C 111-180, D 181-250, E 251-330, F 331-420, G > 420. La classe finale tient compte aussi des émissions de gaz à effet de serre (kg CO2/m²/an) — c’est la PIRE des 2 notes qui détermine la classe DPE. Un logement F énergie / D GES sera donc classé F. Source : arrêté du 31 mars 2021 méthode 3CL.',
  },
  {
    question: 'En 2026, quelle urgence pour un bailleur d’un logement F ?',
    answer:
      'Urgence HAUTE : il reste environ 21 mois avant l’interdiction du 1er janvier 2028. Calendrier conseillé : (1) audit énergétique en 2026 (500-1 200 € TTC), (2) montage dossier MaPrimeRénov’ Parcours accompagné début 2027 (délai instruction 4-6 mois + Mon Accompagnateur Rénov’), (3) travaux à lancer été 2027, (4) nouveau DPE en fin de chantier. Ne pas attendre 2027 entier : la demande d’artisans et auditeurs RGE va exploser, avec des délais doublés possibles.',
  },
  {
    question: 'Le DPE collectif des copropriétés concerne-t-il aussi mon appartement ?',
    answer:
      'Oui, indirectement. Le DPE collectif analyse les performances des parties communes (chaufferie, façades, toiture). Il est OBLIGATOIRE depuis 2024 pour les copropriétés > 200 lots, depuis 2025 pour > 50 lots, et depuis 2028 pour toutes. Le DPE individuel reste obligatoire pour vendre ou louer chaque appartement. Le DPE collectif peut compléter ou remplacer les DPE individuels selon configuration (à valider avec le syndic). Coût ~6-12 € HT par lot.',
  },
  {
    question: 'Quel est le risque pour le marché immobilier 2026-2028 ?',
    answer:
      'Effets observés en 2025 : baisse de la rentabilité locative pour les passoires (gel loyers + travaux à prévoir), accélération des ventes "passoire" avec décote (-10 à -20 %), demande explosive sur les artisans RGE (délais 6-12 mois en zones tendues), risque de retrait massif du marché locatif (~600 000 logements G). En 2028 (interdiction F), l’ANAH et l’ADEME estiment ~30 % des bailleurs F à anticiper la rénovation, ~30 % à vendre, ~40 % à attendre. Pression sur les loyers (offre réduite) probable en zones tendues.',
  },
]

const sources = [
  {
    label: 'Loi Climat et Résilience n° 2021-1104',
    url: 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000043956924',
  },
  { label: 'Décret n° 2022-461 (seuils énergétiques)', url: 'https://www.legifrance.gouv.fr' },
  { label: 'Décret n° 2022-780 (audit énergétique)', url: 'https://www.legifrance.gouv.fr' },
  { label: 'Décret n° 2022-1690 (DPE collectif)', url: 'https://www.legifrance.gouv.fr' },
  { label: 'France Rénov’ — Réglementation', url: 'https://france-renov.gouv.fr' },
  {
    label: 'SDES — Statistiques parc résidentiel',
    url: 'https://www.statistiques.developpement-durable.gouv.fr',
  },
  { label: 'ADEME — Observatoire DPE-Audit', url: 'https://observatoire-dpe-audit.ademe.fr' },
]

const relatedPages = [
  {
    label: 'Hub Passoires thermiques',
    href: '/renovation-energetique/passoires-thermiques',
    description: 'Définition + lois + conséquences',
  },
  {
    label: 'Interdiction location G et F',
    href: '/renovation-energetique/passoires-thermiques/interdiction-location-g-f',
    description: 'Obligations bailleurs + sanctions',
  },
  {
    label: 'DPE 2026',
    href: '/renovation-energetique/diagnostic/dpe',
    description: 'Note A-G, prix, validité, opposabilité',
  },
  {
    label: 'Audit énergétique',
    href: '/renovation-energetique/diagnostic/audit-energetique',
    description: 'Obligatoire vente F/G/E et MPR',
  },
  {
    label: 'Parcours accompagné MPR',
    href: '/renovation-energetique/aides/maprimerenov-2026/parcours-accompagne',
    description: 'Jusqu’à 90 000 € pour sortir d’une passoire',
  },
  {
    label: 'Simulateur aides 2026',
    href: '/simulateur-aides-renovation',
    description: 'MPR + CEE + éco-PTZ cumulés',
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
    section: 'Passoires thermiques',
    keywords: [
      'calendrier interdiction passoire thermique',
      'passoire thermique 2025',
      'passoire thermique 2028',
      'passoire thermique 2034',
      'loi climat resilience',
      'dpe 2025 location',
      'dpe 2028',
      'dpe 2034',
      'interdiction location dpe',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Passoires thermiques', url: '/renovation-energetique/passoires-thermiques' },
    { name: 'Calendrier 2025-2028-2034', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const govSchema = getGovernmentServiceSchema({
    name: 'Calendrier loi Climat — Interdiction location passoires thermiques 2025-2034',
    description:
      'Calendrier complet d’application de la loi Climat et Résilience 2021 (articles 159 et 160) : 8 dates clés entre 2022 et 2034 fixant le retrait progressif des passoires thermiques (DPE G, F, E) du marché locatif français en résidence principale.',
    url: PAGE_URL,
    serviceType: 'Réglementation logement',
    audience:
      'Propriétaires bailleurs, propriétaires occupants, locataires, copropriétés, acheteurs',
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
              {
                label: 'Passoires thermiques',
                href: '/renovation-energetique/passoires-thermiques',
              },
              { label: 'Calendrier 2025-2028-2034' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <CalendarDays className="w-3.5 h-3.5" aria-hidden />
              Loi Climat et Résilience 2021 — 8 dates clés
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Calendrier interdiction passoire thermique : 2025, 2028, 2034
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Le calendrier <strong>complet</strong> de la loi Climat et Résilience 2021 sur les
              passoires thermiques : <strong>8 dates clés</strong> entre 2022 et 2034 qui retirent
              progressivement les logements DPE G, F et E du marché locatif français. Voici la
              chronologie détaillée + l’impact concret par profil (bailleur, locataire, acheteur,
              copropriétaire).
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2 id="timeline">Chronologie complète : 8 dates clés 2022-2034</h2>
            <ol className="not-prose list-none m-0 p-0 space-y-4 my-6">
              {TIMELINE.map((t) => {
                const isVigueur = t.statut === 'En vigueur'
                return (
                  <li
                    key={`${t.date}-${t.label}`}
                    className="bg-white border border-sand-200 rounded-xl p-5 relative"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <Flag
                          className={`w-5 h-5 shrink-0 ${
                            isVigueur ? 'text-primary-700' : 'text-amber-600'
                          }`}
                          aria-hidden
                        />
                        <p className="font-bold text-sand-900 m-0 text-base">{t.date}</p>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                          isVigueur ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {t.statut}
                      </span>
                    </div>
                    <p className="font-semibold text-sand-900 m-0 mb-1">{t.label}</p>
                    <p className="text-sm text-sand-700 m-0 mb-2">{t.detail}</p>
                    <p className="text-xs text-sand-500 m-0">Source : {t.sourceLabel}</p>
                  </li>
                )
              })}
            </ol>
            <p className="text-xs text-sand-500">
              Sources légales : Légifrance — recherche par numéro de loi/décret. Données chiffrées :
              SDES (Service Données et Études Statistiques 2024) + ADEME (Observatoire DPE-Audit).
            </p>

            <h2 id="impact-profil">Impact concret par profil en 2026</h2>
            <div className="not-prose grid gap-3 my-6">
              {IMPACT_PROFIL.map((p) => (
                <div key={p.profil} className="bg-white border border-sand-200 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="font-semibold text-sand-900 m-0">{p.profil}</p>
                    <span className="text-xs font-medium bg-sand-100 text-sand-800 px-2 py-0.5 rounded-full shrink-0">
                      {p.urgence}
                    </span>
                  </div>
                  <p className="text-sm text-sand-700 m-0">{p.actions}</p>
                </div>
              ))}
            </div>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Anticiper 2028 dès 2026 : estimer aides + reste à charge
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Calcul instantané MPR + CEE + éco-PTZ pour sortir d’une passoire G ou F. Mise en
                    relation avec un Mon Accompagnateur Rénov’ (obligatoire au-dessus de 5 000 € de
                    travaux) et un artisan RGE local.
                  </p>
                  <Link
                    href="/simulateur-aides-renovation"
                    className="inline-flex items-center gap-1.5 bg-primary-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
                  >
                    Lancer le simulateur <ArrowRight className="w-4 h-4" aria-hidden />
                  </Link>
                </div>
              </div>
            </div>

            <h2 id="anticipation">Anticiper l’échéance 2028 dès 2026</h2>
            <p>
              Pour les bailleurs d’un logement F, il reste environ <strong>21 mois</strong> avant
              l’interdiction du 1er janvier 2028. Calendrier conseillé pour ne pas se retrouver
              coincé dans la file d’attente artisans RGE de 2027 :
            </p>
            <ul>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Avril-juin 2026</strong> : audit énergétique (500-1 200 € TTC) + DPE
                rafraîchi si daté.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Septembre-décembre 2026</strong> : sélection Mon Accompagnateur Rénov’ +
                montage dossier MPR Parcours accompagné.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Janvier-mars 2027</strong> : instruction du dossier (4-6 mois en moyenne) +
                signature des devis artisans RGE.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Avril-octobre 2027</strong> : exécution des travaux (3-6 mois selon
                ampleur).
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Novembre-décembre 2027</strong> : nouveau DPE post-travaux (200-400 €) +
                déclaration MPR finale + relocation possible.
              </li>
            </ul>
            <p>
              <Clock className="inline w-4 h-4 text-amber-700 mr-1" aria-hidden />
              <strong>Ne pas attendre 2027 entier</strong> : la demande d’artisans RGE et
              d’auditeurs énergétiques va exploser au second semestre 2027 (effet anticipation 2028
              généralisé). Délais probables doublés en zones tendues (Île-de-France, PACA,
              métropoles).
            </p>
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
              href="/renovation-energetique/passoires-thermiques/interdiction-location-g-f"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Interdiction G et F
            </Link>
            <Link
              href="/renovation-energetique/passoires-thermiques"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Hub Passoires <ArrowRight className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
