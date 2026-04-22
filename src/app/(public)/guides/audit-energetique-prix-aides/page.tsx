import type { Metadata } from 'next'
import Link from 'next/link'
import { Leaf, ArrowRight, AlertTriangle, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'audit-energetique-prix-aides'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Claire Dubois'

export const revalidate = 86400

const TITLE = 'Audit énergétique 2026 : prix et aides'
const DESCRIPTION =
  'Audit énergétique 2026 : 800-1 600 € selon surface, MaPrimeRénov’ 300-500 €, obligatoire vente F/G dès 2023. Auditeur qualifié, livrable, scénarios.'

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
  'Prix audit énergétique 2026 : 800-1 000 € appartement, 1 000-1 600 € maison, 1 600-2 500 € grande maison ou copropriété.',
  'Aide MaPrimeRénov’ audit : 300 € ménages intermédiaires, 500 € très modestes / modestes. Non cumulable avec MPR parcours accompagné.',
  'OBLIGATOIRE depuis 1er avril 2023 pour vente passoires énergétiques F et G (art. L126-28 CCH). Étendu aux E en 2028, D en 2034.',
  'Auditeur qualifié : RGE Études (architecte, BET thermique) ou entreprise CERQUAL Qualitel. Vérifier sur france-renov.gouv.fr.',
  'Livrable : état des lieux énergétique + 2 scénarios chiffrés de travaux (bouquets, coûts, gains DPE, aides mobilisables, retour investissement).',
]

const faqs = [
  {
    question: 'Quand un audit énergétique est-il obligatoire ?',
    answer:
      "3 cas d'obligation actuellement : (1) Vente d'une passoire énergétique — logement classé F ou G au DPE — depuis le 1er avril 2023. Étendu aux classes E à partir du 1er janvier 2028, D à partir du 1er janvier 2034 (loi Climat 2021) ; (2) Demande de MaPrimeRénov' parcours accompagné (rénovation globale avec gain ≥2 classes DPE) — audit préalable obligatoire depuis 2022 ; (3) Copropriétés de >50 lots ayant un chauffage collectif : audit tous les 10 ans (loi ELAN 2018). Cas non obligatoire mais recommandé : tout projet de rénovation globale, achat immobilier avec projet rénovation, optimisation MaPrimeRénov' par geste.",
  },
  {
    question: 'Combien coûte un audit énergétique en 2026 ?',
    answer:
      "Tarifs observés marché (sans aide) : (1) Appartement 40-80 m² : 800-1 000 € TTC ; (2) Maison 80-120 m² : 1 000-1 400 € TTC ; (3) Maison 120-180 m² : 1 400-1 800 € TTC ; (4) Grande maison >180 m² : 1 800-2 500 € TTC ; (5) Copropriété <50 lots : 3 000-8 000 € (collectif, à répartir entre copropriétaires). Différence avec DPE : l'audit prend 6-12 h vs 2-3 h pour DPE, inclut visite thermique, simulation dynamique RE2020, scénarios travaux chiffrés. Deviser 2-3 auditeurs avant choix. Attention auditeurs low-cost <600 € : risque livrable minimal sans valeur décisionnelle.",
  },
  {
    question: 'Quelles aides pour financer un audit énergétique ?',
    answer:
      "3 aides cumulables possibles : (1) MaPrimeRénov' Audit : 500 € ménages très modestes et modestes, 300 € ménages intermédiaires, 0 € ménages supérieurs — dossier via maprimerenov.gouv.fr avant devis signé, délai validation 15 j ; (2) Subvention régionale ou départementale : 0 à 500 € selon territoire (vérifier sur france-renov.gouv.fr votre zone) ; (3) TVA 5,5 % si couplée à travaux énergétiques éligibles ; (4) Prêt Avance Rénovation (PAR) : l'audit peut être intégré dans le financement global sans avance de trésorerie. Non cumulable avec MPR parcours accompagné (l'audit y est déjà inclus dans le forfait Mon Accompagnateur Rénov'). Reste à charge net moyen : 300-1 000 € après aides.",
  },
  {
    question: 'Que contient un audit énergétique de qualité ?',
    answer:
      "Livrable conforme à l'arrêté du 4 mai 2022 : (1) État des lieux énergétique détaillé — consommations réelles, identification postes (chauffage, ECS, auxiliaires), DPE actuel ; (2) Analyse thermique des parois — caméra thermique si besoin, identification ponts thermiques ; (3) Scénario 1 : rénovation en 1 étape vers classe C minimum — descriptif technique travaux, coût estimé, gain DPE, aides mobilisables, retour sur investissement ; (4) Scénario 2 : rénovation par étapes (bouquets) vers A ou B — planification chronologique, ordre travaux optimisé ; (5) Simulation consommations post-travaux + confort d'été ; (6) Recommandations priorisées. Refuser un « audit » <15 pages ou sans scénarios chiffrés : c'est un DPE déguisé.",
  },
  {
    question: 'Différence audit énergétique vs DPE ?',
    answer:
      "Différences majeures : (1) Durée visite — DPE 2-3 h, audit 6-12 h avec analyses approfondies ; (2) Contenu — DPE donne classe énergétique (A-G) et recommandations génériques, audit propose des scénarios de travaux chiffrés avec gains DPE associés ; (3) Coût — DPE 100-250 €, audit 800-2 500 € ; (4) Obligation — DPE tout logement vente/location, audit uniquement vente F/G (2023), E (2028), D (2034) ; (5) Validité — DPE 10 ans, audit 5 ans ; (6) Qualification auditeur — DPE tout diagnostiqueur certifié, audit uniquement pros RGE Études (architecte, BET thermique, CEREMA, CERQUAL Qualitel). L'audit inclut le DPE : pas besoin de les faire séparément.",
  },
]

const sources = [
  {
    label: 'Art. L126-28 CCH — Audit obligatoire',
    url: 'https://www.legifrance.gouv.fr',
  },
  {
    label: 'Arrêté 4 mai 2022 — Contenu audit',
    url: 'https://www.legifrance.gouv.fr',
  },
  { label: 'ADEME — Audit énergétique', url: 'https://www.ademe.fr' },
  { label: 'France-Rénov’ — Audit aides', url: 'https://france-renov.gouv.fr' },
]

const relatedGuides = [
  { label: 'DPE mauvais : que faire', href: '/guides/dpe-mauvais-que-faire' },
  { label: 'Passoire thermique rénovation', href: '/guides/passoire-thermique-renovation' },
  { label: 'MaPrimeRénov’ parcours accompagné', href: '/guides/maprimerenov-parcours-accompagne' },
  { label: 'Classe F interdite 2028', href: '/guides/classe-energie-f-interdite-2028' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Rénovation énergétique',
    keywords: [
      'audit énergétique prix',
      'audit énergétique aides',
      'audit énergétique obligatoire',
      'auditeur RGE études',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Audit énergétique', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Audit énergétique' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Leaf className="w-3.5 h-3.5" aria-hidden />
              Rénovation énergétique · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Audit énergétique 2026 : prix, aides, obligation
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              L’audit énergétique est obligatoire pour vendre une passoire F ou G depuis 2023 et
              sera étendu aux classes E en 2028. Voici les prix 2026, les aides MaPrimeRénov’ et le
              contenu d’un audit conforme à l’arrêté du 4 mai 2022.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Tarifs audit énergétique selon surface</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Bien</th>
                    <th className="p-3 border-b border-sand-200">Prix moyen TTC</th>
                    <th className="p-3 border-b border-sand-200">Aide MPR max</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Appartement 40-80 m²', '800-1 000 €', '500 €'],
                    ['Maison 80-120 m²', '1 000-1 400 €', '500 €'],
                    ['Maison 120-180 m²', '1 400-1 800 €', '500 €'],
                    ['Grande maison >180 m²', '1 800-2 500 €', '500 €'],
                    ['Copropriété <50 lots', '3 000-8 000 €', 'Variable'],
                  ].map(([b, p, m]) => (
                    <tr key={b} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{b}</td>
                      <td className="p-3 font-semibold">{p}</td>
                      <td className="p-3">{m}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>Auditeur RGE Études obligatoire.</strong> Pas un simple diagnostiqueur DPE.
                Vérifier qualification sur france-renov.gouv.fr rubrique « études ». Audit sans
                scénarios chiffrés = non-conforme, refusé par notaire pour vente F/G.
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
              Auditeurs RGE <Phone className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
