import type { Metadata } from 'next'
import Link from 'next/link'
import { ShieldCheck, ArrowRight, AlertTriangle, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'garantie-parfait-achevement'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Sophie Martin'

export const revalidate = 86400

const TITLE = 'Garantie parfait achèvement (GPA) 1 an'
const DESCRIPTION =
  'Garantie parfait achèvement 1 an : art. 1792-6 Code civil. Couvre tous désordres signalés en réception ou dans l’année. Procédure LRAR, recours juge.'

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
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
    authors: [`${SITE_URL}/equipe/sophie-martin`],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const tldr = [
  'GPA = 1 an après réception travaux. Couvre TOUT désordre signalé (malfaçons, non-conformités au devis, finitions).',
  'Point de départ : date de réception (PV signé). Sans PV = pas de déclenchement, attention.',
  'Procédure : signalement LRAR dès constat. Entreprise a 60 jours pour intervenir à défaut action judiciaire.',
  'Différence vs décennale : GPA couvre TOUT (y compris esthétique), décennale = solidité/usage sur 10 ans.',
  'Maître d’oeuvre ou entrepreneur = débiteur. Pas besoin de DO pour activer la GPA, c’est direct contre l’entreprise.',
]

const faqs = [
  {
    question: 'Que couvre la garantie de parfait achèvement ?',
    answer:
      "Art. 1792-6 Code civil : pendant 1 an à compter de la réception, l'entrepreneur est tenu de réparer TOUS les désordres signalés par le maître d'ouvrage, qu'ils soient mentionnés dans le PV de réception OU apparus dans l'année. Couverture très large : malfaçons, non-conformités au devis, défauts de finitions, appareils défectueux, peinture qui pèle, carrelage qui se décolle. Seule limite : usure normale et désordres imputables au maître d'ouvrage.",
  },
  {
    question: 'Comment activer la GPA ?',
    answer:
      "Procédure : (1) envoyer lettre recommandée avec AR à l'entreprise détaillant les désordres (photos, date), (2) demander intervention sous 30-60 jours, (3) à défaut, mise en demeure, (4) en l'absence de réponse, saisir tribunal judiciaire (petites réparations <10 000 €) ou tribunal judiciaire (grosses réparations). Si entreprise disparue : activer garantie financière professionnelle si Qualibat, ou assurance décennale en subsidiaire. Conservation des devis, factures, photos = crucial.",
  },
  {
    question: 'Et si les désordres apparaissent après 1 an ?',
    answer:
      "Basculement automatique sur les autres garanties légales : (1) garantie biennale (2 ans) pour les équipements dissociables (chaudière, carrelage, luminaires, radiateurs, plomberie), art. 1792-3 Code civil, (2) garantie décennale (10 ans) pour les désordres compromettant la solidité ou l'usage (infiltration, fissures structurelles, fondations), art. 1792. Chacune se cumule : à 18 mois, vous pouvez activer biennale pour chauffe-eau, décennale pour fissure murale.",
  },
  {
    question: 'Le PV de réception est-il obligatoire ?',
    answer:
      "OUI, sans PV signé par le maître d'ouvrage : pas de point de départ légal aux garanties. Le PV doit mentionner : date, identités, ouvrage livré, éventuelles réserves (désordres visibles, finitions inachevées), signatures. Réserver un désordre dans le PV = obligation pour l'entreprise de l'effacer sous 1 an. En l'absence de PV, possibilité de recours pour reconnaissance judiciaire de la réception, plus long et coûteux. À exiger AVANT tout paiement du solde.",
  },
  {
    question: 'Peut-on suspendre le paiement en attendant la réparation ?',
    answer:
      "Oui, l'art. 1792-6 autorise à retenir une partie du solde (généralement 5 %) jusqu'à complète levée des réserves. Négocier cela AVANT dans le devis (clause de retenue de garantie). Alternative : exiger une caution bancaire 5 % du marché valable 1 an en remplacement de la retenue. En cas de litige, consignation à la Caisse des Dépôts protège les deux parties et évite les blocages. Un professionnel sérieux accepte ce cadre sans difficulté.",
  },
]

const sources = [
  {
    label: 'Art. 1792-6 Code civil — GPA',
    url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006442971',
  },
  { label: 'Art. 1792-3 Code civil — Biennale', url: 'https://www.legifrance.gouv.fr' },
  { label: 'Service-public.fr — Garanties travaux', url: 'https://www.service-public.fr' },
  { label: 'ANIL — Garanties après travaux', url: 'https://www.anil.org' },
]

const relatedGuides = [
  { label: 'Garantie décennale', href: '/guides/garantie-decennale' },
  { label: 'Assurance dommage ouvrage', href: '/guides/assurance-dommage-ouvrage' },
  { label: 'Refuser devis artisan signé', href: '/guides/refuser-devis-artisan-signe' },
  { label: 'Vérifier le SIRET d’un artisan', href: '/guides/verifier-siret-artisan' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Réglementation',
    keywords: ['garantie parfait achèvement', 'GPA 1 an', 'art 1792-6', 'réception travaux'],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Garantie parfait achèvement', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Garantie parfait achèvement' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden />
              Réglementation · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Garantie parfait achèvement (GPA) : vos droits 1 an
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Pendant 12 mois après la réception de vos travaux, l’entrepreneur doit réparer
              gratuitement tous les désordres signalés. C’est la garantie la plus puissante. Voici
              comment l’activer efficacement et quelles différences avec la décennale.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>3 garanties légales cumulables</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Garantie</th>
                    <th className="p-3 border-b border-sand-200">Durée</th>
                    <th className="p-3 border-b border-sand-200">Couverture</th>
                    <th className="p-3 border-b border-sand-200">Art. Code civil</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Parfait achèvement', '1 an', 'TOUS désordres signalés', '1792-6'],
                    ['Biennale (bon fonct.)', '2 ans', 'Équipements dissociables', '1792-3'],
                    ['Décennale', '10 ans', 'Solidité + usage', '1792'],
                  ].map(([g, d, c, a]) => (
                    <tr key={g} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{g}</td>
                      <td className="p-3 font-semibold">{d}</td>
                      <td className="p-3">{c}</td>
                      <td className="p-3">{a}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>Pas de PV = pas de droits.</strong> Réception avec PV signé obligatoire pour
                déclencher les garanties. Consigner désordres visibles en réserves. Ne JAMAIS signer
                un PV sans réserves si peinture bâclée, prise mal raccordée, joint silicone
                approximatif. Sinon : perte de recours.
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
            <Link href="/guides" className="inline-flex items-center gap-1 hover:text-primary-700">
              Autres garanties <Phone className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
