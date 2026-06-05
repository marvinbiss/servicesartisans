/**
 * Page : /rge/labels/qualipac
 *
 * KW cibles (validés Ahrefs API live, snapshot 2026-05-03, country=fr) :
 * - "qualipac"                     → 2 619 vol, KD 3, CPC $1,60, clicks 1 868 ⭐⭐
 * - "qualipac signification"       → couvert par /guides/qualipac-signification-obtenir
 * - "qualipac obtenir"             → variant guide existant
 * - "label qualipac"               → variant intent
 * - "qualipac annuaire"            → ~50-100 vol estimé (intent commercial)
 * - "qualipac obligatoire"         → ~50 vol estimé
 * - Famille cumulée pivot : ~3 000 vol/mois (CPC élevé = intent acheteur PAC RGE)
 *
 * Source : audit Ahrefs API live. Easy win MASSIF (KD 3 sur 2.6K vol + CPC $1,60).
 * Easy win : OUI (KD 3, vol > 2 500, CPC commercial fort = intent acheteur PAC)
 * Cluster pillar : RGE → Labels et qualifications
 *
 * Anti-cannibalisation :
 *   - /guides/qualipac-signification-obtenir (223 lignes, focus 'signification + obtenir')
 *   - Cette page = monographie label (organisme Qualit'EnR + obligations + vérif + bridge PAC)
 *   - Bridge fort vers /renovation-energetique/travaux/pompe-a-chaleur/ (Sprint S' Phase 1)
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Award,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Search,
  Snowflake,
  Calendar,
  Calculator,
  Layers,
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

const PAGE_PATH = '/rge/labels/qualipac'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-03'
const MODIFIED = '2026-05-03'
const AUTHOR_SLUG = 'jean-pierre-duval'
const AUTHOR_NAME = 'Jean-Pierre Duval'

const TITLE = 'QualiPAC 2026 : label RGE pompe à chaleur'
const DESCRIPTION =
  'QualiPAC 2026 : label RGE Qualit’EnR obligatoire pour MaPrimeRénov’ et CEE pompe à chaleur. Mentions, obtention, vérification artisan QualiPAC en 30s.'

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
  'QualiPAC est le label RGE délivré par Qualit’EnR aux installateurs de pompes à chaleur.',
  'Obligatoire pour bénéficier de MaPrimeRénov’ PAC, du Coup de pouce CEE chauffage et de la TVA 5,5 %.',
  'Trois mentions distinctes : QualiPAC standard (air-eau, air-air), QualiPAC sol/eau (géothermie horizontal), QualiPAC eau/eau (sondes verticales).',
  'Validité 4 ans, audit terrain obligatoire dans les 24 premiers mois.',
  'Vérification gratuite en 30 secondes sur qualit-enr.org ou france-renov.gouv.fr/annuaire-rge.',
]

const MENTIONS = [
  {
    code: 'QualiPAC',
    label: 'PAC aérothermiques (air-eau, air-air)',
    travaux: 'PAC air-eau pour chauffage central + ECS, PAC air-air (clim réversible)',
    aides: 'MaPrimeRénov’ jusqu’à 5 000 € + Coup de pouce CEE 4 000 €',
  },
  {
    code: 'QualiPAC mention sol/eau',
    label: 'PAC géothermique à capteurs horizontaux',
    travaux: 'Capteurs enterrés en horizontal (sols) sur terrain disponible',
    aides: 'MaPrimeRénov’ jusqu’à 11 000 € (très modestes) + CEE',
  },
  {
    code: 'QualiPAC mention eau/eau',
    label: 'PAC géothermique à sondes verticales',
    travaux: 'Forages verticaux profonds (50-200 m) sur petits terrains',
    aides: 'MaPrimeRénov’ jusqu’à 11 000 € + CEE',
  },
]

const POURQUOI_OBLIGATOIRE = [
  'Sans QualiPAC RGE, MaPrimeRénov’ PAC est REFUSÉE (économie perdue : 2 000 à 11 000 €)',
  'Sans QualiPAC RGE, le Coup de pouce CEE chauffage est REFUSÉ (perte 2 500 à 4 000 €)',
  'Sans QualiPAC RGE, la TVA passe de 5,5 % à 20 % (économie perdue : ~1 500-2 500 € sur un devis 12 000 €)',
  'Sans QualiPAC RGE, l’éco-PTZ pour la PAC n’est pas accessible',
  'Au total, faire poser sa PAC sans artisan QualiPAC peut coûter 6 000 à 17 000 € de plus',
]

const VERIFIER_ETAPES = [
  {
    title: 'Sur qualit-enr.org',
    detail:
      'Annuaire officiel de Qualit’EnR. Tapez le nom de l’entreprise ou son SIRET. La fiche affiche les qualifications en cours (QualiPAC, QualiSol, QualiBois, QualiPV) et les dates d’expiration.',
  },
  {
    title: 'Sur france-renov.gouv.fr/annuaire-rge',
    detail:
      'Annuaire RGE national consolidé (Qualit’EnR + Qualibat + Qualifelec + autres). Filtre par qualification et géolocalisation.',
  },
  {
    title: 'Demander l’attestation à l’artisan',
    detail:
      'L’artisan doit pouvoir vous fournir son numéro de qualification + date d’expiration sur le devis ou la facture. Mais vérifiez TOUJOURS sur l’annuaire en parallèle (l’attestation papier ne fait pas foi).',
  },
]

const faqs = [
  {
    question: 'Qu’est-ce que QualiPAC ?',
    answer:
      'QualiPAC est le label RGE (Reconnu Garant de l’Environnement) délivré par l’organisme Qualit’EnR aux installateurs de pompes à chaleur (PAC). Il atteste de la compétence technique de l’entreprise en matière d’installation, dimensionnement et mise en service des PAC. Trois mentions distinctes existent : QualiPAC pour les PAC aérothermiques (air-eau, air-air), QualiPAC mention sol/eau pour les géothermiques à capteurs horizontaux, QualiPAC mention eau/eau pour les sondes verticales.',
  },
  {
    question: 'Pourquoi QualiPAC est obligatoire pour MaPrimeRénov’ ?',
    answer:
      'L’État conditionne MaPrimeRénov’ pompe à chaleur, le Coup de pouce CEE chauffage, la TVA 5,5 % et l’éco-PTZ à l’intervention d’un artisan RGE. Pour les PAC, la qualification RGE reconnue est QualiPAC (délivrée par Qualit’EnR). Sans QualiPAC, vous perdez l’ensemble des aides publiques, ce qui peut représenter 6 000 à 17 000 € de surcoût sur un projet PAC moyen.',
  },
  {
    question: 'Comment vérifier qu’un artisan est QualiPAC ?',
    answer:
      'Trois vérifications complémentaires : (1) annuaire officiel Qualit’EnR sur qualit-enr.org, (2) annuaire national RGE sur france-renov.gouv.fr/annuaire-rge, (3) demander à l’artisan son numéro de qualification + date d’expiration sur le devis. La vérification est gratuite, prend 30 secondes, et doit être faite à la date de signature du devis (pas avant ni après). Une attestation papier ne suffit pas juridiquement.',
  },
  {
    question: 'Combien coûte la qualification QualiPAC pour un artisan ?',
    answer:
      'À l’inscription : 800-1 400 € (frais de dossier + audit technique). Maintien annuel : 250-600 € (cotisation + audit administratif). Audit terrain obligatoire dans les 24 premiers mois (300-600 €) puis tous les 4 ans pour le renouvellement. Coût total sur 4 ans : 1 800-3 500 € pour une entreprise standard.',
  },
  {
    question: 'Quelle est la durée de validité de QualiPAC ?',
    answer:
      '4 ans, avec renouvellement automatique sous conditions : audit annuel à jour (déclaration des chantiers PAC + maintien des assurances décennale + cotisations sociales) et audit terrain quadriennal validé. Une suspension peut intervenir en cas de défaut d’audit, sinistre majeur, ou non-renouvellement des prérequis.',
  },
  {
    question: 'Quelle différence entre QualiPAC et Qualibat ?',
    answer:
      'Qualibat est l’organisme certificateur RGE n°1 en France (50 000 entreprises, 230+ qualifications, gros œuvre + second œuvre + ENR). Qualit’EnR est un organisme certificateur RGE spécialisé dans les énergies renouvelables (QualiPAC pompe à chaleur, QualiSol solaire, QualiBois bois, QualiPV photovoltaïque). Une entreprise peut être certifiée par les deux : c’est même fréquent pour les chauffagistes qui font à la fois chaudière (Qualibat) et PAC (QualiPAC).',
  },
  {
    question: 'QualiPAC est-il valable pour les PAC air-air ?',
    answer:
      'Oui techniquement (mention QualiPAC standard couvre air-eau et air-air). Mais attention : MaPrimeRénov’ ne finance plus les PAC air-air depuis 2020. Seul un petit Coup de pouce CEE subsiste (~600 € maximum) pour la PAC air-air. Donc QualiPAC est exigé pour PAC air-air pour la TVA 5,5 % et le CEE résiduel, mais le ROI fiscal est très faible. Pour PAC air-eau (chauffage central + ECS), QualiPAC est indispensable.',
  },
  {
    question:
      'Que faire si mon installateur perd QualiPAC entre la signature du devis et la pose ?',
    answer:
      'Le critère qui compte est la qualification à la date de signature du devis. Si l’artisan était QualiPAC RGE à cette date et que vous avez vérifié sur l’annuaire, votre droit aux aides est acquis. Conservez une capture d’écran datée de la fiche annuaire le jour de la signature comme preuve. Si la perte intervient avant la signature, négociez un changement d’artisan ou retardez la signature.',
  },
]

const sources = [
  { label: 'Qualit’EnR — Annuaire officiel QualiPAC', url: 'https://www.qualit-enr.org' },
  {
    label: 'France Rénov’ — Annuaire RGE national',
    url: 'https://france-renov.gouv.fr/annuaire-rge',
  },
  {
    label: 'AFPAC — Association française pour les pompes à chaleur',
    url: 'https://www.afpac.org',
  },
  { label: 'ADEME — Guide pompes à chaleur', url: 'https://agir.ademe.fr' },
  {
    label: 'Service-Public.fr — RGE Reconnu Garant Environnement',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F35632',
  },
]

const relatedPages = [
  {
    label: 'Qualibat : organisme certificateur RGE n°1',
    href: '/rge/labels/qualibat',
    description: 'Hub label Qualibat (gros œuvre, isolation, chauffage, menuiseries)',
  },
  {
    label: 'QualiPAC : signification et obtention détaillées',
    href: '/guides/qualipac-signification-obtenir',
    description: 'Guide complet du process candidat artisan + audit Qualit’EnR',
  },
  {
    label: 'Pompe à chaleur : prix et aides 2026',
    href: '/renovation-energetique/travaux/pompe-a-chaleur',
    description: 'Hub PAC (air-eau, air-air, géothermie) + cumul aides',
  },
  {
    label: 'PAC air-eau : prix détaillés 2026',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/air-eau-prix',
    description: 'Grille de prix par puissance + reste à charge réel',
  },
  {
    label: 'Comment devenir RGE',
    href: '/rge/comment-devenir-rge',
    description: 'Process complet pour les artisans (Qualibat, Qualit’EnR, etc.)',
  },
  {
    label: 'Trouver un chauffagiste QualiPAC près de chez vous',
    href: '/rge/chauffagiste',
    description: 'Annuaire géolocalisé des chauffagistes RGE QualiPAC vérifiés',
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
    section: 'RGE — Labels et qualifications',
    keywords: [
      'qualipac',
      'qualipac rge',
      'label qualipac',
      'qualipac annuaire',
      'qualipac obligatoire',
      'qualipac obtenir',
      'qualipac signification',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'RGE', url: '/rge' },
    { name: 'Labels', url: '/rge/labels' },
    { name: 'QualiPAC', url: PAGE_PATH },
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
            items={[{ label: 'RGE', href: '/rge' }, { label: 'Labels' }, { label: 'QualiPAC' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Award className="w-3.5 h-3.5" aria-hidden />
              Label RGE &middot; Pompes à chaleur
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              QualiPAC en 2026 : le label RGE pompe à chaleur
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              <strong>QualiPAC</strong> est la qualification RGE délivrée par l’organisme Qualit’EnR
              aux installateurs de pompes à chaleur. Elle est <strong>obligatoire</strong> pour
              bénéficier de MaPrimeRénov’ PAC, du Coup de pouce CEE chauffage et de la TVA 5,5 %.
              Trois mentions distinctes (PAC aérothermiques, géothermie sol/eau, géothermie eau/eau)
              couvrent l’ensemble des installations. Vérification gratuite en 30 secondes.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Qu’est-ce que QualiPAC ?</h2>
            <p>
              QualiPAC est l’une des qualifications RGE délivrées par <strong>Qualit’EnR</strong>,
              l’organisme certificateur français spécialisé dans les énergies renouvelables. Elle
              atteste qu’un installateur a la compétence technique nécessaire pour dimensionner,
              poser et mettre en service une pompe à chaleur (air-air, air-eau ou géothermique)
              selon les règles de l’art. C’est l’une des 4 qualifications majeures de Qualit’EnR
              (avec QualiSol pour le solaire thermique, QualiBois pour le bois, QualiPV pour le
              photovoltaïque).
            </p>

            <h2 id="mentions">Les 3 mentions QualiPAC</h2>
            <div className="not-prose grid gap-3 my-6">
              {MENTIONS.map((m) => (
                <div
                  key={m.code}
                  className="bg-white border border-sand-200 rounded-xl p-5 flex items-start gap-3"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-700 grid place-items-center shrink-0">
                    <Snowflake className="w-5 h-5" aria-hidden />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sand-900 m-0">{m.code}</p>
                    <p className="text-sm text-sand-700 mt-1 mb-2">{m.label}</p>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <dt className="font-semibold text-sand-700">Travaux couverts</dt>
                        <dd className="m-0 text-sand-600">{m.travaux}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-sand-700">Aides associées</dt>
                        <dd className="m-0 text-sand-600">{m.aides}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              ))}
            </div>

            <h2 id="obligation">Pourquoi QualiPAC est obligatoire pour vos aides</h2>
            <div className="not-prose border-2 border-red-200 bg-red-50 rounded-lg p-5 my-6">
              <p className="font-semibold text-red-900 m-0 mb-3">
                Sans artisan QualiPAC RGE, vous perdez :
              </p>
              <ul className="text-sm text-red-900 m-0 space-y-2 list-disc list-inside">
                {POURQUOI_OBLIGATOIRE.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>

            <h2 id="verifier">Vérifier un QualiPAC en 30 secondes</h2>
            <div className="not-prose grid gap-3 my-6">
              {VERIFIER_ETAPES.map((step, i) => (
                <div
                  key={step.title}
                  className="bg-white border border-sand-200 rounded-xl p-4 flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-700 text-white grid place-items-center shrink-0 font-bold">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-sand-900 m-0">{step.title}</p>
                    <p className="text-sm text-sand-700 mt-1 mb-0">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <div className="text-sm text-amber-900">
                <p className="font-semibold m-0 mb-1">L’attestation papier ne suffit pas</p>
                <p className="m-0">
                  Une copie d’attestation QualiPAC n’a aucune valeur juridique isolée. Seule la
                  consultation directe sur qualit-enr.org ou france-renov.gouv.fr à la date de
                  signature du devis fait foi en cas de litige sur les aides publiques. Conservez
                  une capture d’écran datée comme preuve.
                </p>
              </div>
            </div>

            <h2 id="obtention">Comment un artisan obtient QualiPAC</h2>
            <p>
              L’artisan dépose un dossier auprès de Qualit’EnR via qualit-enr.org. Le process dure 6
              à 12 mois et inclut :
            </p>
            <ul>
              <li>
                <Layers className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Dossier administratif</strong> : Kbis, RC pro, garantie décennale, à jour
                cotisations sociales (URSSAF)
              </li>
              <li>
                <Layers className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Formation technique</strong> : 5 jours minimum auprès d’un organisme agréé
                Qualit’EnR (en présentiel ou hybride). Coût 1 200-2 500 €.
              </li>
              <li>
                <Layers className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Examen écrit</strong> : QCM technique sur les principes PAC, calcul de
                puissance, réglementation
              </li>
              <li>
                <Layers className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Audit terrain</strong> : visite obligatoire d’un chantier dans les 24
                premiers mois suivant la qualification (300-600 €)
              </li>
              <li>
                <Layers className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Coût global</strong> : 1 800 à 3 500 € sur les 4 années (initial +
                cotisation + audit terrain)
              </li>
            </ul>
            <p>
              Pour le détail du process candidat, voir notre{' '}
              <Link href="/guides/qualipac-signification-obtenir">
                guide QualiPAC : signification et obtention
              </Link>
              .
            </p>

            <h2>Validité et renouvellement</h2>
            <p>
              QualiPAC est valable <strong>4 ans</strong>. Pour le maintien :
            </p>
            <ul>
              <li>
                <Calendar className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Audit annuel administratif obligatoire (déclaration chantiers + maintien assurances)
              </li>
              <li>
                <Calendar className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Audit terrain quadriennal pour le renouvellement (visite chantier réalisé)
              </li>
              <li>
                <Calendar className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Formation continue recommandée (évolutions techniques + réglementaires)
              </li>
            </ul>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Demandez 3 devis PAC à des artisans QualiPAC vérifiés
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Comparez 3 devis d’artisans QualiPAC RGE certifiés via l’API officielle
                    france-renov.gouv.fr. Bilan thermique inclus, simulation MaPrimeRénov’ + CEE.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/devis"
                      className="inline-flex items-center gap-1.5 bg-primary-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
                    >
                      Demander 3 devis <ArrowRight className="w-4 h-4" aria-hidden />
                    </Link>
                    <Link
                      href="/rge/chauffagiste"
                      className="inline-flex items-center gap-1.5 bg-white text-primary-700 border border-primary-200 px-4 py-2 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
                    >
                      <Search className="w-4 h-4" aria-hidden /> Annuaire chauffagistes RGE
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <h2>QualiPAC vs Qualibat</h2>
            <ul>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>QualiPAC (Qualit’EnR)</strong> : spécialisé pompes à chaleur (mention
                requise pour MPR PAC + CEE PAC + TVA 5,5 % PAC)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Qualibat</strong> : généraliste bâtiment + énergétique (chaudière
                condensation, isolation, menuiseries)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Un chauffagiste qui pose à la fois chaudière gaz et PAC est généralement certifié{' '}
                <strong>les deux</strong> : Qualibat 8112 + QualiPAC
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
              href="/rge/labels/qualibat"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Qualibat
            </Link>
            <Link
              href="/rge/chauffagiste"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Chauffagistes RGE QualiPAC <ShieldCheck className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
