/**
 * Page : /rge/labels/qualifelec
 *
 * KW cibles (validés Ahrefs API live, snapshot 2026-05-03, country=fr) :
 * - "qualifelec"            → 3 379 vol, KD 0, CPC $0,50, clicks 3 142 ⭐⭐⭐
 * - "qualifelec irve"       → 153 vol, KD 13, CPC $0,80
 * - "qualifelec photovoltaique" → ~30-80 vol estimé
 * - "qualifelec mention"    → ~30-50 vol estimé
 * - Famille cumulée pivot : ~3 600 vol/mois
 *
 * Source : audit Ahrefs API live. Easy win MASSIF (KD 0 sur 3.4K vol).
 * Easy win : OUI ABSOLU (KD 0, vol > 3 000)
 * Cluster pillar : RGE → Labels et qualifications
 *
 * Anti-cannibalisation :
 *   - /rge/labels/qualibat (gros œuvre / second œuvre)
 *   - /rge/labels/qualipac (PAC pompe à chaleur)
 *   - Cette page = monographie label Qualifelec (électricité, IRVE, photovoltaïque, domotique)
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Search,
  Zap,
  Calendar,
  Layers,
  BatteryCharging,
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

const PAGE_PATH = '/rge/labels/qualifelec'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-03'
const MODIFIED = '2026-05-03'
const AUTHOR_SLUG = 'marc-lefebvre'
const AUTHOR_NAME = 'Marc Lefebvre'

const TITLE = 'Qualifelec 2026 : label RGE électricité et IRVE'
const DESCRIPTION =
  'Qualifelec 2026 : label de l’AFNOR pour les électriciens. Mentions IRVE bornes recharge, photovoltaïque, NF C 15-100. Vérifier un Qualifelec en 30s.'

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
  'Qualifelec est l’organisme certificateur des électriciens en France (créé en 1955, sous l’égide de l’AFNOR).',
  'Plus de 8 000 entreprises qualifiées, 4 niveaux (E1 à E4) selon la complexité des installations.',
  'Mentions RGE Qualifelec : SPV (photovoltaïque), IRVE (bornes recharge), efficacité énergétique électrique.',
  'Validité 4 ans, audit annuel + audit terrain quadriennal pour le renouvellement.',
  'Vérification gratuite en 30 secondes sur qualifelec.fr (annuaire officiel).',
]

const MENTIONS = [
  {
    code: 'IRVE',
    label: 'Infrastructure de Recharge Véhicules Électriques',
    travaux: 'Bornes de recharge VE (résidentiel, copropriété, ERP), niveaux 1-3',
    aides: 'Crédit d’impôt borne recharge 75 % (plafond 500 €), aides locales',
    obligatoire: 'OUI pour borne ≥ 3,7 kW (décret 2017-26)',
  },
  {
    code: 'SPV',
    label: 'Solaire Photovoltaïque',
    travaux: 'Installation panneaux PV résidentiels et tertiaires, raccordement Enedis',
    aides: 'Prime à l’autoconsommation + tarif d’achat EDF OA',
    obligatoire: 'OUI pour la prime autoconso',
  },
  {
    code: 'EE Électrique',
    label: 'Efficacité énergétique électrique',
    travaux: 'Domotique, gestion électrique, chauffe-eau thermodynamique',
    aides: 'CEE Coup de pouce + MaPrimeRénov’ (gestes éligibles)',
    obligatoire: 'OUI pour CEE et MPR sur ces postes',
  },
]

const NIVEAUX = [
  {
    niveau: 'E1',
    label: 'Confirmation',
    desc: 'Installations simples (logement individuel, petit tertiaire). Tableau standard, prises, éclairage.',
  },
  {
    niveau: 'E2',
    label: 'Adaptation',
    desc: 'Installations courantes complexité moyenne. Multi-logements, courants faibles, domotique de base.',
  },
  {
    niveau: 'E3',
    label: 'Conception',
    desc: 'Installations complexes (immeubles, ERP, courants faibles avancés, GTC).',
  },
  {
    niveau: 'E4',
    label: 'Maîtrise',
    desc: 'Installations spécialisées de haute technicité (industriel, hôpital, data center).',
  },
]

const faqs = [
  {
    question: 'Qu’est-ce que Qualifelec ?',
    answer:
      'Qualifelec est l’organisme indépendant qui qualifie les entreprises d’installation électrique en France depuis 1955. Sous l’égide de l’AFNOR, il atteste de la compétence technique des électriciens via 4 niveaux (E1 à E4) et de nombreuses mentions spécialisées (IRVE bornes recharge, SPV photovoltaïque, EE efficacité énergétique). Plus de 8 000 entreprises sont qualifiées Qualifelec en France.',
  },
  {
    question: 'Pourquoi Qualifelec IRVE est obligatoire pour les bornes recharge ?',
    answer:
      'Le décret 2017-26 du 12 janvier 2017 impose l’intervention d’un installateur qualifié IRVE pour toute borne de recharge ≥ 3,7 kW (résidentiel comme tertiaire). Sans Qualifelec IRVE, vous perdez le crédit d’impôt 75 % (plafond 500 €), les aides locales et l’assurance fait peser un risque en cas de sinistre électrique. La qualification IRVE comporte 3 niveaux (1 = bornes ≤ 22 kW, 2 = ≤ 22 kW + supervision, 3 = ≥ 22 kW courant continu).',
  },
  {
    question: 'Comment vérifier qu’un électricien est Qualifelec ?',
    answer:
      'Rendez-vous sur l’annuaire officiel qualifelec.fr et tapez le SIRET ou le nom de l’entreprise. La fiche affiche en temps réel les qualifications en cours, les mentions associées (IRVE, SPV, EE), les niveaux (E1-E4) et la date d’expiration. Vérification gratuite, 30 secondes. Une attestation papier ne suffit pas juridiquement.',
  },
  {
    question: 'Quelle différence entre Qualifelec et Qualibat ?',
    answer:
      'Qualifelec couvre exclusivement les électriciens (installations électriques résidentielles, tertiaires, IRVE, photovoltaïque, domotique, courants faibles). Qualibat couvre le bâtiment au sens large (gros œuvre, second œuvre, isolation, menuiseries, plomberie, chauffage). Une entreprise multi-corps d’état peut être certifiée par les deux (ex. : un installateur qui pose à la fois isolation Qualibat 7131 et borne recharge Qualifelec IRVE).',
  },
  {
    question: 'Quelle est la durée de validité d’un Qualifelec ?',
    answer:
      '4 ans, avec audit annuel obligatoire (déclaration chantiers + maintien des assurances décennale + à jour cotisations sociales). Audit terrain quadriennal pour le renouvellement (visite chantier réalisé). Coût annuel typique : 200-1 200 € selon CA et niveau de qualification.',
  },
  {
    question: 'Qualifelec est-il obligatoire pour bénéficier des aides MaPrimeRénov’ ?',
    answer:
      'Pour les travaux d’efficacité énergétique électrique (chauffe-eau thermodynamique, certains équipements de chauffage électrique performants), oui : Qualifelec mention « Efficacité Énergétique » est exigé en lieu et place de Qualibat. Pour la borne recharge, c’est Qualifelec IRVE (pas une autre qualification). Pour les panneaux photovoltaïques, c’est Qualifelec SPV ou QualiPV (Qualit’EnR), au choix.',
  },
  {
    question: 'Combien coûte la qualification Qualifelec pour un artisan ?',
    answer:
      'Inscription : 500-2 000 € selon le niveau et les mentions demandées. Cotisation annuelle : 200-1 200 € selon CA et nombre de qualifications. Audit terrain quadriennal : 400-800 €. Ce coût est considéré comme un investissement pour ouvrir l’accès aux marchés IRVE (en forte croissance) et photovoltaïque résidentiel.',
  },
  {
    question: 'Qualifelec ou QualiPV pour les panneaux solaires ?',
    answer:
      'Les deux sont équivalents pour bénéficier de la prime à l’autoconsommation. QualiPV est délivré par Qualit’EnR (organisme spécialisé ENR). Qualifelec SPV (Solaire Photovoltaïque) est délivré par Qualifelec (organisme spécialisé électricité). Une entreprise peut détenir l’un ou l’autre, ou les deux. Vérifiez juste la mention RGE active à la date du devis.',
  },
]

const sources = [
  { label: 'Qualifelec — Annuaire officiel', url: 'https://www.qualifelec.fr' },
  {
    label: 'France Rénov’ — Annuaire RGE national',
    url: 'https://france-renov.gouv.fr/annuaire-rge',
  },
  {
    label: 'Légifrance — Décret 2017-26 IRVE',
    url: 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000033877676',
  },
  {
    label: 'Service-Public.fr — RGE Reconnu Garant Environnement',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F35632',
  },
  { label: 'Avere France — Annuaire installateurs IRVE', url: 'https://www.avere-france.org' },
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
    description: 'Hub label QualiPAC (Qualit’EnR) pour les chauffagistes PAC',
  },
  {
    label: 'Comment devenir RGE',
    href: '/rge/comment-devenir-rge',
    description: 'Process complet pour les artisans candidats à la certification',
  },
  {
    label: 'Vérifier un artisan RGE',
    href: '/rge/fraude-rge-comment-verifier',
    description: 'Méthode anti-fraude + cas concrets, vérification annuaire',
  },
  {
    label: 'Trouver un électricien Qualifelec près de chez vous',
    href: '/rge/electricien',
    description: 'Annuaire géolocalisé électriciens RGE Qualifelec vérifiés',
  },
  {
    label: 'Borne de recharge : prix et installation',
    href: '/services/borne-recharge',
    description: 'Hub IRVE résidentiel et copropriété',
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
      'qualifelec',
      'qualifelec irve',
      'qualifelec rge',
      'qualifelec photovoltaique',
      'qualifelec annuaire',
      'qualifelec niveau e1 e4',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'RGE', url: '/rge' },
    { name: 'Labels', url: '/rge/labels' },
    { name: 'Qualifelec', url: PAGE_PATH },
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
            items={[{ label: 'RGE', href: '/rge' }, { label: 'Labels' }, { label: 'Qualifelec' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Zap className="w-3.5 h-3.5" aria-hidden />
              Label RGE &middot; Électricité
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Qualifelec en 2026 : le label RGE électricité et IRVE
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              <strong>Qualifelec</strong> est l’organisme certificateur des électriciens en France
              depuis 1955, sous l’égide de l’AFNOR. Il qualifie plus de 8 000 entreprises selon 4
              niveaux (E1 à E4) et délivre des mentions spécialisées : IRVE pour les bornes de
              recharge, SPV pour le photovoltaïque, Efficacité Énergétique pour les équipements
              électriques performants. Vérification gratuite en 30 secondes.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Qu’est-ce que Qualifelec ?</h2>
            <p>
              Qualifelec est un <strong>organisme indépendant</strong> créé en 1955 par les
              fédérations professionnelles électriciens (FFIE, SERCE, FEDELEC). Sous l’égide de
              l’AFNOR, il certifie la compétence technique des entreprises d’installation électrique
              selon 4 niveaux (E1 = installations simples, E4 = installations de haute technicité).
              Plus de 8 000 entreprises sont aujourd’hui qualifiées Qualifelec en France.
            </p>

            <h2 id="niveaux">Les 4 niveaux Qualifelec</h2>
            <div className="not-prose grid gap-3 my-6 md:grid-cols-2">
              {NIVEAUX.map((n) => (
                <div key={n.niveau} className="bg-white border border-sand-200 rounded-xl p-4">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-2xl font-bold text-primary-700">{n.niveau}</span>
                    <span className="text-sm font-semibold text-sand-700">{n.label}</span>
                  </div>
                  <p className="text-sm text-sand-700 m-0">{n.desc}</p>
                </div>
              ))}
            </div>

            <h2 id="mentions">Mentions RGE Qualifelec</h2>
            <p>
              Au-delà des 4 niveaux, Qualifelec délivre des mentions spécialisées qui ouvrent droit
              aux aides publiques :
            </p>
            <div className="not-prose grid gap-3 my-6">
              {MENTIONS.map((m) => (
                <div
                  key={m.code}
                  className="bg-white border border-sand-200 rounded-xl p-5 flex items-start gap-3"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-700 grid place-items-center shrink-0">
                    {m.code === 'IRVE' ? (
                      <BatteryCharging className="w-5 h-5" aria-hidden />
                    ) : (
                      <Zap className="w-5 h-5" aria-hidden />
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
                        <dt className="font-semibold text-sand-700">Obligatoire pour aides ?</dt>
                        <dd className="m-0 text-primary-800 font-medium">{m.obligatoire}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              ))}
            </div>

            <h2 id="irve-obligatoire">Pourquoi Qualifelec IRVE est obligatoire</h2>
            <div className="not-prose border-2 border-red-200 bg-red-50 rounded-lg p-5 my-6">
              <p className="font-semibold text-red-900 m-0 mb-2">
                Sans Qualifelec IRVE pour une borne ≥ 3,7 kW :
              </p>
              <ul className="text-sm text-red-900 m-0 space-y-1.5 list-disc list-inside">
                <li>
                  Crédit d’impôt borne recharge 75 % (plafond 500 €) <strong>refusé</strong>
                </li>
                <li>
                  Aides locales (régionales, départementales, communales) <strong>refusées</strong>
                </li>
                <li>
                  Risque assurance habitation : non-couverture en cas de sinistre électrique
                  attribué à l’installation
                </li>
                <li>
                  Non-conformité au décret 2017-26 du 12 janvier 2017 (Code de la construction)
                </li>
              </ul>
            </div>

            <h2 id="verifier">Vérifier un Qualifelec en 30 secondes</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 my-6">
              <ol className="space-y-3 m-0 list-decimal list-inside text-sm">
                <li>
                  Rendez-vous sur{' '}
                  <a
                    href="https://www.qualifelec.fr"
                    rel="noopener noreferrer"
                    target="_blank"
                    className="text-primary-700 hover:underline"
                  >
                    qualifelec.fr
                  </a>{' '}
                  → onglet « Annuaire ».
                </li>
                <li>
                  Tapez le <strong>SIRET</strong> de l’entreprise (14 chiffres) ou son nom.
                </li>
                <li>
                  Vérifiez : niveau (E1-E4), mentions actives (IRVE, SPV, EE), date d’expiration.
                </li>
                <li>
                  Pour IRVE : vérifiez le <strong>niveau IRVE</strong> (1 = ≤ 22 kW, 2 = ≤ 22 kW +
                  supervision, 3 = ≥ 22 kW courant continu).
                </li>
                <li>
                  Pour PV : vérifiez la mention <strong>SPV</strong> active à la date de signature.
                </li>
              </ol>
            </div>

            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <div className="text-sm text-amber-900">
                <p className="font-semibold m-0 mb-1">Attestation papier ne suffit pas</p>
                <p className="m-0">
                  Une copie d’attestation Qualifelec n’a aucune valeur juridique isolée. Seule la
                  consultation directe sur qualifelec.fr ou france-renov.gouv.fr à la date de
                  signature du devis fait foi en cas de litige sur les aides publiques.
                </p>
              </div>
            </div>

            <h2 id="obtention">Comment un artisan obtient Qualifelec</h2>
            <ul>
              <li>
                <Layers className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Dossier administratif</strong> : Kbis, RC pro, garantie décennale,
                cotisations sociales à jour
              </li>
              <li>
                <Layers className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Examen technique</strong> : QCM normes NF C 15-100 + spécialisation (IRVE,
                SPV, EE selon mention demandée)
              </li>
              <li>
                <Layers className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Audit terrain</strong> : visite chantier obligatoire dans les 24 premiers
                mois
              </li>
              <li>
                <Layers className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Coût total sur 4 ans</strong> : 1 500 à 4 000 € selon nombre de mentions et
                niveau
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
                Audit terrain quadriennal pour le renouvellement
              </li>
            </ul>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Search className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Trouver un électricien Qualifelec près de chez vous
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Annuaire géolocalisé d’électriciens RGE Qualifelec vérifiés (IRVE, SPV, EE).
                  </p>
                  <Link
                    href="/rge/electricien"
                    className="inline-flex items-center gap-1.5 bg-primary-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-800 transition-colors"
                  >
                    Annuaire électriciens RGE <ArrowRight className="w-4 h-4" aria-hidden />
                  </Link>
                </div>
              </div>
            </div>

            <h2>Qualifelec vs autres organismes RGE</h2>
            <ul>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Qualifelec</strong> : électriciens (IRVE, SPV, EE, courants faibles)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Qualibat</strong> : généraliste bâtiment + énergétique (chaudière,
                isolation, menuiseries)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Qualit’EnR</strong> : ENR (QualiPAC, QualiSol, QualiBois, QualiPV)
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
              href="/rge/labels/qualipac"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← QualiPAC
            </Link>
            <Link
              href="/rge/labels/qualisol"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              QualiSol → <ShieldCheck className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
