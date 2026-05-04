/**
 * Page : /rge/labels/qualibois
 *
 * KW cibles (validés Ahrefs API live, snapshot 2026-05-03, country=fr) :
 * - "qualibois"               → 575 vol, KD 0, CPC $5,00, clicks 483 ⭐⭐⭐
 * - "qualibois module air"    → ~50-100 vol estimé (chaudières)
 * - "qualibois module eau"    → ~30-80 vol estimé
 * - "label qualibois"         → variant intent
 * - Famille cumulée pivot : ~700 vol/mois (CPC $5 = intent acheteur fort)
 *
 * Source : audit Ahrefs API live. Easy win MASSIF (KD 0 sur 575 vol + CPC $5).
 * Easy win : OUI ABSOLU (KD 0, CPC commercial fort)
 * Cluster pillar : RGE → Labels et qualifications
 *
 * Anti-cannibalisation :
 *   - Cette page = monographie label QualiBois (poêle granulés + chaudières biomasse)
 *   - Bridge naturel vers /guides/poele-granules-aides-2026 (existant)
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Search,
  Flame,
  Calendar,
  Layers,
  TreePine,
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

const PAGE_PATH = '/rge/labels/qualibois'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-03'
const MODIFIED = '2026-05-03'
const AUTHOR_SLUG = 'jean-pierre-duval'
const AUTHOR_NAME = 'Jean-Pierre Duval'

const TITLE = 'QualiBois 2026 : label RGE poêle granulés et chaudière bois'
const DESCRIPTION =
  'QualiBois 2026 : label RGE Qualit’EnR pour les installateurs poêles à granulés et chaudières biomasse. Mentions Module Air / Eau, obligatoire MaPrimeRénov’.'

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
  'QualiBois est le label RGE délivré par Qualit’EnR aux installateurs d’appareils de chauffage au bois.',
  '2 mentions distinctes : Module Air (poêle bûches, poêle à granulés, insert) et Module Eau (chaudière bois ou granulés raccordée au réseau hydraulique).',
  'Obligatoire pour MaPrimeRénov’ poêle granulés (jusqu’à 2 500 €) et chaudière biomasse (jusqu’à 11 000 €).',
  'Validité 4 ans, audit terrain obligatoire dans les 24 premiers mois.',
  'Vérification gratuite sur qualit-enr.org ou france-renov.gouv.fr/annuaire-rge.',
]

const MENTIONS = [
  {
    code: 'QualiBois Module Air',
    label: 'Appareils indépendants (poêle, insert, foyer fermé)',
    travaux: 'Poêle à bûches, poêle à granulés, insert, foyer fermé bois',
    aides: 'MaPrimeRénov’ jusqu’à 2 500 € (granulés) ou 1 800 € (bûches) + Coup de pouce CEE',
    config: 'Chauffage d’appoint ou principal en complément autres systèmes',
  },
  {
    code: 'QualiBois Module Eau',
    label: 'Chaudière bois ou granulés raccordée au réseau hydraulique',
    travaux: 'Chaudière à bûches, chaudière à granulés (pellets), chaudière polycombustible',
    aides: 'MaPrimeRénov’ jusqu’à 11 000 € (très modestes) + CEE chauffage',
    config: 'Chauffage central principal, remplacement chaudière fioul/gaz',
  },
]

const POURQUOI = [
  'Sans QualiBois RGE, MaPrimeRénov’ poêle granulés est REFUSÉE (perte 800 à 2 500 €)',
  'Sans QualiBois RGE, MaPrimeRénov’ chaudière biomasse est REFUSÉE (perte 4 000 à 11 000 €)',
  'Sans QualiBois RGE, Coup de pouce CEE chauffage est REFUSÉ (perte 1 000 à 4 000 €)',
  'Sans QualiBois RGE, TVA passe de 5,5 % à 20 % (perte ~700-1 500 € sur poêle granulés)',
  'Au total, sans QualiBois, un projet poêle granulés peut coûter 2 500 à 8 000 € de plus',
]

const faqs = [
  {
    question: 'Qu’est-ce que QualiBois ?',
    answer:
      'QualiBois est l’une des qualifications RGE délivrées par Qualit’EnR aux installateurs d’appareils de chauffage au bois. Elle atteste de la compétence technique pour dimensionner et poser des poêles à bois ou granulés (Module Air) et des chaudières biomasse raccordées au réseau hydraulique (Module Eau). Distincte de QualiPAC (pompes à chaleur) et QualiSol (solaire thermique).',
  },
  {
    question: 'Quelle différence entre Module Air et Module Eau ?',
    answer:
      'Module Air = appareils indépendants qui chauffent par convection ou rayonnement direct (poêle à bûches, poêle à granulés, insert, foyer fermé). Module Eau = chaudière qui chauffe un fluide caloporteur alimentant le réseau hydraulique (radiateurs ou plancher chauffant) et l’ECS. Pour bénéficier des aides chaudière biomasse (jusqu’à 11 000 € MPR), Module Eau est requis.',
  },
  {
    question: 'Pourquoi QualiBois est obligatoire pour MaPrimeRénov’ ?',
    answer:
      'L’État conditionne MaPrimeRénov’ poêle granulés, chaudière granulés/bûches, le Coup de pouce CEE chauffage biomasse et la TVA 5,5 % à l’intervention d’un artisan RGE. Pour les appareils bois, la qualification RGE reconnue est QualiBois (Module Air ou Module Eau selon la typologie). Sans QualiBois, vous perdez l’ensemble des aides : surcoût potentiel 2 500 à 8 000 € sur un projet typique.',
  },
  {
    question: 'Combien coûte un poêle à granulés en 2026 ?',
    answer:
      '3 500 à 7 000 € TTC posé pour un poêle à granulés standard (puissance 6-12 kW). Pour une chaudière à granulés complète (chauffage central + ECS), comptez 15 000-25 000 € TTC selon puissance. Avec MaPrimeRénov’ + CEE + TVA 5,5 %, le reste à charge tombe à 1 500-3 500 € pour un poêle granulés chez un ménage modeste.',
  },
  {
    question: 'Comment vérifier qu’un installateur est QualiBois ?',
    answer:
      'Sur qualit-enr.org ou france-renov.gouv.fr/annuaire-rge : tapez le SIRET ou le nom de l’entreprise. La fiche affiche les qualifications en cours (QualiBois Module Air, QualiBois Module Eau), les dates de validité. Vérification gratuite, 30 secondes. Une attestation papier ne fait pas foi juridiquement.',
  },
  {
    question: 'Quelle est la durée de validité de QualiBois ?',
    answer:
      '4 ans, avec audit annuel obligatoire (déclaration des chantiers + maintien des assurances décennale + à jour cotisations sociales) et audit terrain quadriennal pour le renouvellement. Coût annuel typique 250-700 € pour l’installateur.',
  },
  {
    question: 'Combien coûte la qualification QualiBois pour un artisan ?',
    answer:
      'Inscription : 800-1 500 € (frais de dossier + audit technique). Maintien annuel : 250-600 €. Audit terrain quadriennal : 300-600 €. Coût total sur 4 ans : 1 800-3 200 € pour une entreprise standard avec 1 mention. Compter +500-800 € si l’entreprise vise les 2 mentions (Air + Eau).',
  },
  {
    question: 'Poêle à bûches ou poêle à granulés : différence en aides ?',
    answer:
      'Granulés (pellets) : MaPrimeRénov’ jusqu’à 2 500 € (très modestes) + CEE 800-1 500 €. Bûches : MaPrimeRénov’ jusqu’à 1 800 € + CEE plus faible. Les granulés sont privilégiés par les aides car le rendement et les émissions sont meilleurs (label Flamme Verte 7 étoiles requis pour les aides). Les chaudières granulés / bûches Module Eau bénéficient du barème le plus élevé (jusqu’à 11 000 €).',
  },
]

const sources = [
  { label: 'Qualit’EnR — Annuaire officiel QualiBois', url: 'https://www.qualit-enr.org' },
  {
    label: 'France Rénov’ — Annuaire RGE national',
    url: 'https://france-renov.gouv.fr/annuaire-rge',
  },
  { label: 'Propellet France — Syndicat granulés bois', url: 'https://www.propellet.fr' },
  { label: 'ADEME — Guide chauffage au bois', url: 'https://agir.ademe.fr' },
  {
    label: 'Service-Public.fr — Aides chauffage biomasse',
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
    label: 'QualiPAC : label RGE pompe à chaleur',
    href: '/rge/labels/qualipac',
    description: 'Hub label QualiPAC pour les chauffagistes PAC',
  },
  {
    label: 'QualiSol : label RGE solaire thermique',
    href: '/rge/labels/qualisol',
    description: 'Hub label QualiSol (CESI + SSC)',
  },
  {
    label: 'Qualifelec : label RGE électricité et IRVE',
    href: '/rge/labels/qualifelec',
    description: 'Hub label Qualifelec (IRVE bornes recharge, photovoltaïque)',
  },
  {
    label: 'Poêle à granulés : aides 2026',
    href: '/guides/poele-granules-aides-2026',
    description: 'Aides MaPrimeRénov’ + CEE détaillées pour le poêle granulés',
  },
  {
    label: 'Trouver un artisan QualiBois près de chez vous',
    href: '/rge/chauffagiste',
    description: 'Annuaire géolocalisé chauffagistes RGE QualiBois vérifiés',
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
      'qualibois',
      'qualibois module air',
      'qualibois module eau',
      'label qualibois',
      'qualibois annuaire',
      'qualibois obligatoire',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'RGE', url: '/rge' },
    { name: 'Labels', url: '/rge/labels' },
    { name: 'QualiBois', url: PAGE_PATH },
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
            items={[{ label: 'RGE', href: '/rge' }, { label: 'Labels' }, { label: 'QualiBois' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Flame className="w-3.5 h-3.5" aria-hidden />
              Label RGE &middot; Chauffage bois
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              QualiBois en 2026 : label RGE poêle granulés et chaudière bois
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              <strong>QualiBois</strong> est la qualification RGE délivrée par Qualit’EnR aux
              installateurs d’appareils de chauffage au bois (poêle à bûches, poêle à granulés,
              chaudière biomasse). Elle est <strong>obligatoire</strong> pour bénéficier de
              MaPrimeRénov’ poêle granulés (jusqu’à 2 500 €) ou chaudière bois (jusqu’à 11 000 €),
              du Coup de pouce CEE et de la TVA 5,5 %. Deux mentions distinctes : Module Air et
              Module Eau.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Qu’est-ce que QualiBois ?</h2>
            <p>
              QualiBois est l’une des 4 qualifications majeures de <strong>Qualit’EnR</strong>,
              l’organisme certificateur français spécialisé dans les énergies renouvelables. Elle
              atteste qu’un installateur a la compétence technique pour dimensionner et poser des
              appareils de chauffage au bois : poêle à bûches, poêle à granulés (pellets), insert,
              foyer fermé, chaudière à bûches ou à granulés, chaudière polycombustible.
            </p>

            <h2 id="mentions">Les 2 mentions QualiBois</h2>
            <div className="not-prose grid gap-3 my-6">
              {MENTIONS.map((m) => (
                <div
                  key={m.code}
                  className="bg-white border border-sand-200 rounded-xl p-5 flex items-start gap-3"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-700 grid place-items-center shrink-0">
                    {m.code.includes('Air') ? (
                      <Flame className="w-5 h-5" aria-hidden />
                    ) : (
                      <TreePine className="w-5 h-5" aria-hidden />
                    )}
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
                      <div className="sm:col-span-2">
                        <dt className="font-semibold text-sand-700">Configuration cible</dt>
                        <dd className="m-0 text-sand-600">{m.config}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              ))}
            </div>

            <h2 id="obligation">Pourquoi QualiBois est obligatoire pour vos aides</h2>
            <div className="not-prose border-2 border-red-200 bg-red-50 rounded-lg p-5 my-6">
              <p className="font-semibold text-red-900 m-0 mb-3">
                Sans installateur QualiBois RGE, vous perdez :
              </p>
              <ul className="text-sm text-red-900 m-0 space-y-2 list-disc list-inside">
                {POURQUOI.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>

            <h2 id="verifier">Vérifier un QualiBois en 30 secondes</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 my-6">
              <ol className="space-y-3 m-0 list-decimal list-inside text-sm">
                <li>
                  Rendez-vous sur{' '}
                  <a
                    href="https://www.qualit-enr.org"
                    rel="noopener noreferrer"
                    target="_blank"
                    className="text-primary-700 hover:underline"
                  >
                    qualit-enr.org
                  </a>{' '}
                  → annuaire QualiBois.
                </li>
                <li>
                  Tapez le <strong>SIRET</strong> de l’entreprise (14 chiffres) ou son nom.
                </li>
                <li>Vérifiez : mention active (Module Air, Module Eau), date d’expiration.</li>
                <li>
                  Pour un poêle à granulés / bûches : mention <strong>Module Air</strong> requise.
                </li>
                <li>
                  Pour une chaudière biomasse : mention <strong>Module Eau</strong> requise.
                </li>
              </ol>
            </div>

            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <div className="text-sm text-amber-900">
                <p className="font-semibold m-0 mb-1">QualiBois Module Air ≠ Module Eau</p>
                <p className="m-0">
                  Les 2 mentions sont distinctes. Un installateur QualiBois Module Air ne peut pas
                  installer une chaudière biomasse sous aides s’il n’a pas la mention Module Eau.
                  Vérifiez la mention exacte qui correspond à votre projet.
                </p>
              </div>
            </div>

            <h2 id="performance">Performance et label Flamme Verte</h2>
            <p>
              Pour bénéficier des aides MaPrimeRénov’, l’appareil doit ÉGALEMENT être labellisé
              <strong> Flamme Verte 7 étoiles</strong> (ou équivalent EcoDesign 2022). Ce label
              produit garantit :
            </p>
            <ul>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Rendement énergétique ≥ 87 % (poêle granulés) ou ≥ 75 % (poêle bûches)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Émissions de particules fines (PM) ≤ 30 mg/Nm³
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Émissions de CO ≤ 0,3 % (sécurité)
              </li>
            </ul>
            <p>
              Vérifiez le label Flamme Verte sur la plaque signalétique de l’appareil OU sur le site
              flammeverte.org avant de signer le devis.
            </p>

            <h2 id="obtention">Comment un artisan obtient QualiBois</h2>
            <ul>
              <li>
                <Layers className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Dossier administratif (Kbis, RC pro, garantie décennale, cotisations sociales)
              </li>
              <li>
                <Layers className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Formation technique 4 jours par mention (organisme agréé Qualit’EnR), 1 200-1 800 €
              </li>
              <li>
                <Layers className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Examen écrit + audit terrain dans les 24 premiers mois
              </li>
              <li>
                <Layers className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Coût total sur 4 ans : 1 800-3 200 € avec 1 mention, +500-800 € pour la 2e
              </li>
            </ul>

            <h2>Validité et renouvellement</h2>
            <ul>
              <li>
                <Calendar className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Validité 4 ans, audit annuel administratif obligatoire
              </li>
              <li>
                <Calendar className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Audit terrain quadriennal pour le renouvellement
              </li>
            </ul>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Search className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Trouver un installateur QualiBois près de chez vous
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Annuaire géolocalisé d’artisans QualiBois RGE certifiés via l’API officielle
                    france-renov.gouv.fr.
                  </p>
                  <Link
                    href="/rge/chauffagiste"
                    className="inline-flex items-center gap-1.5 bg-primary-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-800 transition-colors"
                  >
                    Annuaire chauffagistes RGE <ArrowRight className="w-4 h-4" aria-hidden />
                  </Link>
                </div>
              </div>
            </div>
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
              href="/rge/labels/qualisol"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← QualiSol
            </Link>
            <Link
              href="/rge/chauffagiste"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Chauffagistes RGE QualiBois <ShieldCheck className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
