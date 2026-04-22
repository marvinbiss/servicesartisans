import type { Metadata } from 'next'
import Link from 'next/link'
import { Search, ArrowRight, AlertTriangle, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema, getHowToSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'annuaire-rge-verifier-officiel'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Claire Dubois'

export const revalidate = 86400

const TITLE = 'Annuaire RGE officiel : vérifier 2026'
const DESCRIPTION =
  'Vérifier un artisan RGE 2026 : annuaire France-Rénov’, ADEME, Qualit’EnR, Qualibat. Recherche SIRET / code postal. Indispensable avant devis.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: getAlternates(`/guides/${SLUG}`),
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: 'article',
    siteName: SITE_NAME,
    publishedTime: PUBLISHED,
    modifiedTime: MODIFIED,
    authors: [`${SITE_URL}/equipe/claire-dubois`],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const tldr = [
  'Annuaire officiel unique : france-renov.gouv.fr/trouver-un-professionnel-rge (source consolidée ADEME + organismes qualificateurs).',
  'ADEME DATA data.ademe.fr/datasets/liste-des-entreprises-rge : base ouverte, 65 000 entreprises qualifiées, filtrable par département + domaine.',
  'Qualit’EnR et Qualibat proposent chacun leur moteur : utiliser en cross-check (données parfois plus fraîches).',
  'Vérifications clés : SIRET valide (14 chiffres), qualification active (non expirée), domaine couvrant les travaux demandés.',
  'Signaux d’alerte : logo RGE sur devis mais absent des annuaires = usurpation, arrêté 24 déc 2021 impose la mention nominative officielle.',
]

const howToSteps = [
  {
    name: 'Récupérer le SIRET sur le devis',
    text: 'Demandez ou localisez le SIRET (14 chiffres) sur le devis : mentions obligatoires selon l’art. R111-1 du Code de la consommation.',
  },
  {
    name: 'Consulter france-renov.gouv.fr',
    text: 'Rubrique « Trouver un professionnel RGE », recherche par SIRET ou par localisation + domaine travaux.',
  },
  {
    name: 'Vérifier le domaine qualification',
    text: 'Assurez-vous que la qualification correspond à vos travaux : isolation (Qualibat 7131), PAC (QualiPAC), solaire (QualiSol), fenêtres (Qualibat 3741).',
  },
  {
    name: 'Contrôler la date de validité',
    text: 'La qualification doit être active à la date de signature du devis ET à la date de facturation finale. Durée : 4 ans renouvelables.',
  },
  {
    name: 'Cross-check ADEME DATA si doute',
    text: 'En cas de divergence entre deux annuaires (ex : Qualit’EnR vs France-Rénov’), utilisez data.ademe.fr/datasets/liste-des-entreprises-rge comme arbitre officiel.',
  },
  {
    name: 'Archiver la preuve',
    text: 'Capturez la fiche RGE au moment de la signature du devis : elle est requise pour le dossier MaPrimeRénov’ / CEE.',
  },
]

const faqs = [
  {
    question: 'Quel est l’annuaire RGE officiel en 2026 ?',
    answer:
      "Le portail unique officiel est france-renov.gouv.fr, rubrique « Trouver un professionnel RGE ». Il consolide les données de TOUS les organismes qualificateurs reconnus : Qualit'EnR (PAC, solaire, biomasse), Qualibat (gros œuvre, isolation, fenêtres, chaudières), Qualifelec (électricité, IRVE), Certibat (ensembliers), Eco-Artisan CAPEB. Actualisation quotidienne par synchronisation API avec chaque organisme. ADEME DATA est la source brute des mêmes données, idéale pour croiser et automatiser des vérifications via data.ademe.fr.",
  },
  {
    question: 'Comment vérifier le SIRET d’un artisan RGE ?',
    answer:
      "Double vérification obligatoire : (1) SIRET actif sur annuaire-entreprises.data.gouv.fr (INSEE/Sirene) — vérifier activité, état actif, code NAF correspondant au métier (4120A chaudières, 4322A plomberie, 4329A isolation, 4321A électricité) ; (2) SIRET présent dans la base RGE France-Rénov' avec qualification active. Les deux doivent coïncider exactement (même numéro). En cas d'écart : risque de sous-traitance non déclarée (fraude CEE) ou d'entreprise nouvellement créée pour usurper l'identité d'une entreprise en règle. Signaler à DGCCRF via signal.conso.gouv.fr.",
  },
  {
    question: 'Que faire si l’artisan revendique RGE sans être dans l’annuaire ?',
    answer:
      "2 scénarios possibles : (1) actualisation décalée de l'annuaire (rare, <5 % des cas) — l'artisan peut fournir son certificat RGE nominatif signé par l'organisme (Qualit'EnR, Qualibat), dater de moins de 1 mois, avec numéro de qualification et domaine ; (2) usurpation / fraude (plus fréquent, 10-15 % des signalements CEE) — ne pas signer le devis, signaler à DGCCRF, demander remboursement acompte si versé. L'arrêté du 24 décembre 2021 oblige la mention nominative précise sur tous documents. Un devis avec logo RGE mais sans nom de la qualification et n° = nullité automatique pour les aides.",
  },
  {
    question: 'Tous les artisans bâtiment doivent-ils être RGE ?',
    answer:
      "Non. Le RGE est UNIQUEMENT obligatoire pour bénéficier des aides publiques (MaPrimeRénov', CEE, éco-PTZ, TVA 5,5 %) sur les travaux de rénovation énergétique. Un artisan peut parfaitement exercer sans RGE s'il ne fait pas de rénovation énergétique (ex : serrurier, peintre décoration, plaquiste intérieur, créateur de cuisines). Pour vérifier la nécessité du RGE sur vos travaux spécifiques : consulter la liste des 17 gestes éligibles MaPrimeRénov' (pompe à chaleur, isolation combles/murs/planchers, fenêtres PVC/bois/alu, chaudière biomasse, VMC double flux, etc.) sur france-renov.gouv.fr.",
  },
  {
    question: 'Comment signaler un artisan qui usurpe le label RGE ?',
    answer:
      "Plainte multi-canaux : (1) DGCCRF via signal.conso.gouv.fr — suite donnée en 15-60 j, pouvoirs d'investigation réels, amendes administratives 3 000-15 000 € ; (2) organisme qualificateur (Qualit'EnR, Qualibat) — courrier recommandé AR, obligation d'enquêter sous 30 j ; (3) France-Rénov' via formulaire de signalement dédié ; (4) si préjudice financier (acompte versé), dépôt de plainte au commissariat + constitution partie civile. En 2023, la DGCCRF a sanctionné plus de 450 entreprises pour usurpation RGE, dont 60 renvoyées au pénal pour escroquerie aggravée.",
  },
]

const sources = [
  {
    label: 'France-Rénov’ — Trouver un pro RGE',
    url: 'https://france-renov.gouv.fr/trouver-un-professionnel-rge',
  },
  {
    label: 'ADEME DATA — Liste entreprises RGE',
    url: 'https://data.ademe.fr/datasets/liste-des-entreprises-rge',
  },
  { label: 'Qualit’EnR — Moteur recherche', url: 'https://www.qualit-enr.org' },
  { label: 'Qualibat — Annuaire', url: 'https://www.qualibat.com' },
  {
    label: 'Arrêté 24 déc 2021 — Logo RGE',
    url: 'https://www.legifrance.gouv.fr',
  },
]

const relatedGuides = [
  { label: 'Vérifier le SIRET d’un artisan', href: '/guides/verifier-siret-artisan' },
  { label: 'Comment choisir un artisan RGE', href: '/guides/comment-choisir-artisan-rge' },
  { label: 'QualiPAC signification', href: '/guides/qualipac-signification-obtenir' },
  { label: 'Éviter les arnaques artisan', href: '/guides/eviter-arnaques-artisan' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Qualifications RGE',
    keywords: [
      'annuaire RGE',
      'vérifier artisan RGE',
      'France Rénov professionnel',
      'ADEME liste RGE',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Annuaire RGE', url: `/guides/${SLUG}` },
  ])
  const faqSchema = getFAQSchema(faqs)
  const howToSchema = getHowToSchema(howToSteps, {
    name: 'Comment vérifier un artisan RGE en 3 minutes',
    description:
      'Procédure officielle en 6 étapes pour vérifier la qualification RGE d’un artisan avant signature d’un devis.',
    totalTime: 'PT3M',
  })
  const schemas = [articleSchema, breadcrumbSchema, faqSchema, howToSchema].filter(
    (s): s is Record<string, unknown> => s !== null
  )
  return (
    <>
      <JsonLd data={schemas} />
      <div className="bg-sand-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Breadcrumb
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Annuaire RGE' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Search className="w-3.5 h-3.5" aria-hidden />
              Qualifications RGE · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Annuaire RGE : vérifier un artisan en 3 minutes
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Avant de signer un devis pour des travaux de rénovation énergétique, vérifier la
              qualification RGE est incontournable. Voici les annuaires officiels, la méthode pas à
              pas et les signaux d’usurpation à détecter avant qu’il ne soit trop tard.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Les 4 sources officielles à croiser</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Source</th>
                    <th className="p-3 border-b border-sand-200">Portée</th>
                    <th className="p-3 border-b border-sand-200">Fraîcheur</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['France-Rénov’', 'Tous organismes consolidés', 'Quotidienne'],
                    ['ADEME DATA', 'Base open data — 65 000 entreprises', 'Hebdo'],
                    ['Qualit’EnR', 'PAC, solaire, biomasse', 'Temps réel'],
                    ['Qualibat', 'Gros œuvre, isolation, fenêtres', 'Temps réel'],
                  ].map(([s, p, f]) => (
                    <tr key={s} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{s}</td>
                      <td className="p-3">{p}</td>
                      <td className="p-3">{f}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>Logo RGE ≠ qualification active.</strong> 20 % des devis PAC 2025
                mentionnent un logo RGE sans qualification vérifiable. Sans vérification annuaire
                officiel : perte MPR 4-11 k€ + CEE 2-5 k€. 3 minutes qui sauvent 15 000 €.
              </p>
            </div>
          </article>
          <FlagshipFaq items={faqs} />
          <FlagshipSources sources={sources} />
          <section className="my-10">
            <h2 className="font-heading text-xl font-semibold text-sand-900 mb-4">À lire aussi</h2>
            <ul className="grid gap-3 md:grid-cols-2">
              {relatedGuides.map((g) => (
                <li key={g.href}>
                  <Link
                    href={g.href}
                    className="flex items-center justify-between gap-2 bg-white border border-sand-200 rounded-lg p-4 hover:border-primary-400 hover:shadow-sm transition-all text-sand-800"
                  >
                    <span className="text-sm font-medium">{g.label}</span>
                    <ArrowRight className="w-4 h-4 text-sand-400 shrink-0" aria-hidden />
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
          <div className="flex items-center justify-between text-sm text-sand-600 border-t border-sand-200 pt-4">
            <Link href="/guides" className="inline-flex items-center gap-1 hover:text-primary-700">
              ← Tous les guides
            </Link>
            <Link href="/rge" className="inline-flex items-center gap-1 hover:text-primary-700">
              Artisans RGE vérifiés <Phone className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
