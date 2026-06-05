/**
 * Page : /rge/labels/qualisol
 *
 * KW cibles (validés Ahrefs API live, snapshot 2026-05-03, country=fr) :
 * - "qualisol"               → 908 vol, KD 0, CPC $9,00, clicks 795 ⭐⭐⭐
 * - "qualisol combi"         → ~50-100 vol estimé
 * - "qualisol cesi"          → ~30-50 vol estimé (ECS solaire)
 * - Famille cumulée pivot : ~1 100 vol/mois (CPC $9 = intent acheteur ULTRA fort)
 *
 * Source : audit Ahrefs API live. Easy win MASSIF (KD 0 sur 908 vol + CPC $9).
 * Easy win : OUI ABSOLU (KD 0, vol > 800, CPC commercial le + élevé du cluster)
 * Cluster pillar : RGE → Labels et qualifications
 *
 * Anti-cannibalisation :
 *   - /rge/labels/qualibat (gros œuvre)
 *   - /rge/labels/qualipac (PAC)
 *   - /rge/labels/qualifelec (électricité dont SPV photovoltaïque)
 *   - Cette page = monographie label QualiSol (chauffe-eau solaire CESI + SSC combi)
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Search,
  Sun,
  Calendar,
  Layers,
  Droplet,
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

const PAGE_PATH = '/rge/labels/qualisol'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-03'
const MODIFIED = '2026-05-03'
const AUTHOR_SLUG = 'jean-pierre-duval'
const AUTHOR_NAME = 'Jean-Pierre Duval'

const TITLE = 'QualiSol 2026 : label RGE solaire thermique CESI / SSC'
const DESCRIPTION =
  'QualiSol 2026 : label RGE Qualit’EnR pour les installateurs de chauffe-eau solaire (CESI) et systèmes solaires combinés (SSC). Aides MaPrimeRénov’ + CEE.'

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
  'QualiSol est le label RGE délivré par Qualit’EnR aux installateurs de chauffe-eau solaire.',
  '2 mentions distinctes : CESI (chauffe-eau solaire individuel ECS) et SSC (système solaire combiné chauffage + ECS).',
  'Obligatoire pour MaPrimeRénov’ chauffe-eau solaire (jusqu’à 4 000 €) et le Coup de pouce CEE.',
  'Validité 4 ans, audit terrain obligatoire dans les 24 premiers mois.',
  'Vérification gratuite sur qualit-enr.org ou france-renov.gouv.fr/annuaire-rge.',
]

const MENTIONS = [
  {
    code: 'QualiSol CESI',
    label: 'Chauffe-eau solaire individuel (CESI)',
    travaux: 'Capteurs solaires + ballon ECS uniquement (eau chaude sanitaire seule)',
    aides: 'MaPrimeRénov’ jusqu’à 4 000 € (très modestes) + Coup de pouce CEE',
    config: 'Maison individuelle, capteurs 2-5 m²',
  },
  {
    code: 'QualiSol SSC',
    label: 'Système solaire combiné (SSC)',
    travaux: 'Capteurs solaires + ballon double échange : chauffage central + ECS',
    aides: 'MaPrimeRénov’ jusqu’à 11 000 € (très modestes) + CEE chauffage',
    config: 'Maison individuelle bien isolée, capteurs 8-15 m²',
  },
  {
    code: 'QualiSol Combi+',
    label: 'Solaire combiné + appoint thermodynamique',
    travaux: 'SSC couplé à PAC ou chaudière biomasse pour l’appoint hivernal',
    aides: 'MaPrimeRénov’ + CEE cumulés sur les 2 systèmes',
    config: 'Projet rénovation globale (souvent Parcours accompagné MPR)',
  },
]

const POURQUOI = [
  'Sans QualiSol RGE, MaPrimeRénov’ chauffe-eau solaire est REFUSÉE (perte 1 000 à 4 000 €)',
  'Sans QualiSol RGE, Coup de pouce CEE chauffage est REFUSÉ (perte 500 à 2 500 €)',
  'Sans QualiSol RGE, TVA passe de 5,5 % à 20 % (perte ~1 000-1 500 € sur un CESI 8 000 €)',
  'Sans QualiSol RGE, l’éco-PTZ pour le solaire thermique n’est pas accessible',
  'Au total, sans QualiSol, un projet CESI peut coûter 3 000 à 5 000 € de plus',
]

const faqs = [
  {
    question: 'Qu’est-ce que QualiSol ?',
    answer:
      'QualiSol est la qualification RGE délivrée par l’organisme Qualit’EnR aux installateurs de chauffe-eau solaire. Elle atteste de la compétence technique pour dimensionner et installer des systèmes solaires thermiques : chauffe-eau solaire individuel (CESI, mention CESI) ou système solaire combiné chauffage + ECS (mention SSC). Distincte de QualiPV qui couvre le photovoltaïque.',
  },
  {
    question: 'QualiSol ou QualiPV : quelle différence ?',
    answer:
      'Les deux sont des qualifications Qualit’EnR mais couvrent des technologies différentes. QualiSol = solaire thermique (capteurs qui chauffent un fluide pour ECS ou chauffage). QualiPV = solaire photovoltaïque (panneaux qui produisent de l’électricité). Les aides ne sont pas les mêmes : MaPrimeRénov’ pour QualiSol, prime à l’autoconsommation + tarif d’achat EDF OA pour QualiPV. Vérifiez bien la qualification correspondant à votre projet.',
  },
  {
    question: 'Pourquoi QualiSol est obligatoire pour MaPrimeRénov’ ?',
    answer:
      'L’État conditionne MaPrimeRénov’ chauffe-eau solaire individuel (CESI) et système solaire combiné (SSC) à l’intervention d’un artisan RGE certifié QualiSol. Sans QualiSol, vous perdez l’ensemble des aides : MaPrimeRénov’ (1 000-4 000 € CESI, jusqu’à 11 000 € SSC), Coup de pouce CEE, TVA 5,5 %, éco-PTZ. Soit un surcoût potentiel de 3 000 à 5 000 € sur un CESI standard.',
  },
  {
    question: 'Combien coûte un chauffe-eau solaire CESI ?',
    answer:
      'Entre 5 000 et 8 000 € TTC posé pour un CESI standard (capteurs 4 m² + ballon 300 L). Pour un SSC complet (chauffage + ECS), comptez 12 000-25 000 € TTC selon surface chauffée et besoins. Avec MaPrimeRénov’ + CEE + TVA 5,5 %, le reste à charge tombe à 2 500-4 500 € pour un CESI chez un ménage modeste.',
  },
  {
    question: 'Comment vérifier qu’un installateur est QualiSol ?',
    answer:
      'Sur qualit-enr.org ou france-renov.gouv.fr/annuaire-rge : tapez le SIRET ou le nom de l’entreprise. La fiche affiche les qualifications en cours (QualiSol CESI, QualiSol SSC, autres mentions Qualit’EnR), les dates de validité. Vérification gratuite, 30 secondes. Une attestation papier ne fait pas foi juridiquement.',
  },
  {
    question: 'Quelle est la durée de validité de QualiSol ?',
    answer:
      '4 ans, avec audit annuel obligatoire (déclaration des chantiers solaires + maintien des assurances) et audit terrain quadriennal pour le renouvellement. Coût annuel typique : 250-700 € pour l’installateur (cotisation + audit administratif).',
  },
  {
    question: 'Combien rapporte un chauffe-eau solaire CESI ?',
    answer:
      'Un CESI couvre 50 à 80 % des besoins ECS annuels selon la zone climatique (Sud > Nord). Économie typique : 200-400 € par an sur la facture d’eau chaude (vs ECS électrique). Retour sur investissement : 8-12 ans selon le taux d’aides obtenues. Durée de vie 20-25 ans pour les capteurs, 12-18 ans pour le ballon.',
  },
  {
    question: 'QualiSol ou QualiPAC pour le chauffage ?',
    answer:
      'Pour le chauffage seul : QualiPAC (pompe à chaleur) est aujourd’hui plus économique sur l’investissement initial et les aides. QualiSol SSC reste pertinent en complément ou pour des projets « zéro énergie » avec très bonne isolation. Souvent les deux systèmes sont combinés (PAC + CESI) pour optimiser ECS l’été (solaire) et chauffage l’hiver (PAC).',
  },
]

const sources = [
  { label: 'Qualit’EnR — Annuaire officiel QualiSol', url: 'https://www.qualit-enr.org' },
  {
    label: 'France Rénov’ — Annuaire RGE national',
    url: 'https://france-renov.gouv.fr/annuaire-rge',
  },
  { label: 'Enerplan — Syndicat des professionnels solaires', url: 'https://www.enerplan.asso.fr' },
  { label: 'ADEME — Guide chauffe-eau solaire', url: 'https://agir.ademe.fr' },
  {
    label: 'Service-Public.fr — Aides solaire thermique',
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
    description: 'Hub label QualiPAC (Qualit’EnR) pour les PAC',
  },
  {
    label: 'Qualifelec : label RGE électricité et IRVE',
    href: '/rge/labels/qualifelec',
    description: 'Hub label Qualifelec (IRVE, photovoltaïque, EE)',
  },
  {
    label: 'QualiBois : label RGE chauffage bois',
    href: '/rge/labels/qualibois',
    description: 'Hub label QualiBois pour poêles granulés et chaudières biomasse',
  },
  {
    label: 'Pompe à chaleur : prix et aides 2026',
    href: '/renovation-energetique/travaux/pompe-a-chaleur',
    description: 'Alternative ou complément solaire thermique pour chauffage',
  },
  {
    label: 'Trouver un artisan QualiSol près de chez vous',
    href: '/rge/renovation-energetique',
    description: 'Annuaire géolocalisé des installateurs RGE QualiSol vérifiés',
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
      'qualisol',
      'qualisol cesi',
      'qualisol ssc',
      'qualisol combi',
      'qualisol annuaire',
      'qualisol obligatoire',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'RGE', url: '/rge' },
    { name: 'Labels', url: '/rge/labels' },
    { name: 'QualiSol', url: PAGE_PATH },
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
            items={[{ label: 'RGE', href: '/rge' }, { label: 'Labels' }, { label: 'QualiSol' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Sun className="w-3.5 h-3.5" aria-hidden />
              Label RGE &middot; Solaire thermique
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              QualiSol en 2026 : le label RGE solaire thermique
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              <strong>QualiSol</strong> est la qualification RGE délivrée par l’organisme Qualit’EnR
              aux installateurs de chauffe-eau solaire (CESI) et systèmes solaires combinés (SSC).
              Elle est <strong>obligatoire</strong> pour bénéficier de MaPrimeRénov’ solaire
              thermique (jusqu’à 11 000 € en SSC), du Coup de pouce CEE et de la TVA 5,5 %.
              Distincte de QualiPV (photovoltaïque).
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Qu’est-ce que QualiSol ?</h2>
            <p>
              QualiSol est l’une des 4 qualifications majeures de <strong>Qualit’EnR</strong>,
              l’organisme certificateur français spécialisé dans les énergies renouvelables. Elle
              atteste qu’un installateur a la compétence technique pour dimensionner et poser des
              systèmes solaires thermiques (différents du photovoltaïque QualiPV) : chauffe-eau
              solaire individuel (CESI) et système solaire combiné (SSC) pour le chauffage + l’ECS.
            </p>

            <h2 id="mentions">Les mentions QualiSol</h2>
            <div className="not-prose grid gap-3 my-6">
              {MENTIONS.map((m) => (
                <div
                  key={m.code}
                  className="bg-white border border-sand-200 rounded-xl p-5 flex items-start gap-3"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-700 grid place-items-center shrink-0">
                    {m.code.includes('CESI') ? (
                      <Droplet className="w-5 h-5" aria-hidden />
                    ) : (
                      <Sun className="w-5 h-5" aria-hidden />
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

            <h2 id="obligation">Pourquoi QualiSol est obligatoire pour vos aides</h2>
            <div className="not-prose border-2 border-red-200 bg-red-50 rounded-lg p-5 my-6">
              <p className="font-semibold text-red-900 m-0 mb-3">
                Sans installateur QualiSol RGE, vous perdez :
              </p>
              <ul className="text-sm text-red-900 m-0 space-y-2 list-disc list-inside">
                {POURQUOI.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>

            <h2 id="verifier">Vérifier un QualiSol en 30 secondes</h2>
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
                  → annuaire QualiSol.
                </li>
                <li>
                  Tapez le <strong>SIRET</strong> de l’entreprise (14 chiffres) ou son nom.
                </li>
                <li>Vérifiez : mention active (CESI, SSC ou Combi+), niveau, date d’expiration.</li>
                <li>
                  Pour un projet ECS uniquement : mention <strong>CESI</strong> requise.
                </li>
                <li>
                  Pour un projet chauffage + ECS : mention <strong>SSC</strong> requise.
                </li>
              </ol>
            </div>

            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <div className="text-sm text-amber-900">
                <p className="font-semibold m-0 mb-1">QualiSol CESI ≠ QualiSol SSC</p>
                <p className="m-0">
                  Les 2 mentions sont distinctes. Un installateur QualiSol CESI ne peut pas
                  installer un SSC sous aides s’il n’a pas la mention SSC. Vérifiez la mention
                  exacte qui correspond à votre projet (ECS seul vs chauffage + ECS).
                </p>
              </div>
            </div>

            <h2 id="economies">Performance et économies</h2>
            <ul>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>CESI</strong> couvre 50-80 % des besoins ECS annuels (selon zone climatique,
                Sud &gt; Nord)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>SSC</strong> couvre 25-50 % des besoins chauffage + 50-70 % de l’ECS
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Économie typique CESI : 200-400 €/an vs ECS électrique. ROI 8-12 ans avec aides.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Durée de vie : capteurs 20-25 ans, ballon 12-18 ans, fluide caloporteur 5-7 ans
              </li>
            </ul>

            <h2 id="obtention">Comment un artisan obtient QualiSol</h2>
            <ul>
              <li>
                <Layers className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Dossier administratif (Kbis, RC pro, garantie décennale, cotisations sociales)
              </li>
              <li>
                <Layers className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Formation technique 4-5 jours (organisme agréé Qualit’EnR), 1 200-2 200 €
              </li>
              <li>
                <Layers className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Examen écrit (QCM technique) + audit terrain dans les 24 premiers mois
              </li>
              <li>
                <Layers className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Coût total sur 4 ans : 1 500-3 200 € selon mentions et formations
              </li>
            </ul>

            <h2>Validité et renouvellement</h2>
            <ul>
              <li>
                <Calendar className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Validité 4 ans
              </li>
              <li>
                <Calendar className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Audit annuel administratif obligatoire
              </li>
              <li>
                <Calendar className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Audit terrain quadriennal + formation continue recommandée
              </li>
            </ul>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Search className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Trouver un installateur QualiSol près de chez vous
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Annuaire géolocalisé d’artisans QualiSol RGE certifiés via l’API officielle
                    france-renov.gouv.fr.
                  </p>
                  <Link
                    href="/rge/renovation-energetique"
                    className="inline-flex items-center gap-1.5 bg-primary-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
                  >
                    Annuaire artisans RGE <ArrowRight className="w-4 h-4" aria-hidden />
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
              href="/rge/labels/qualifelec"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Qualifelec
            </Link>
            <Link
              href="/rge/labels/qualibois"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              QualiBois → <ShieldCheck className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
