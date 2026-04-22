import type { Metadata } from 'next'
import Link from 'next/link'
import { Droplet, ArrowRight, AlertTriangle, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'infiltration-fenetre-pvc'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Sophie Martin'

export const revalidate = 86400

const TITLE = 'Fuite fenêtre PVC : causes & solutions'
const DESCRIPTION =
  'Diagnostiquez une infiltration de fenêtre PVC : joints, pente appui, pose, micro-ventilation. Solutions DIY, recours décennale, prix 2026.'

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
  '5 causes classiques : joint périphérique dégradé, appui sans pente, raccord mastic fissuré, pose défectueuse, micro-ventilation bloquée.',
  'Test diagnostique : arroser zone par zone (jet doux), identifier l’origine en 15-30 min.',
  'DIY : remplacer joint EPDM (20-50 €), refaire joint mastic polyuréthane (15-30 €). 1-2h.',
  'Pose défectueuse (tableaux, linteaux) : activer garantie décennale entreprise (10 ans après pose).',
  'Remplacement fenêtre entière : 450-1 800 € selon matériau + dimensions.',
]

const faqs = [
  {
    question: 'Comment identifier l’origine d’une infiltration fenêtre ?',
    answer:
      "Test méthodique : (1) observer l'eau à l'intérieur SOUS la pluie battante, noter où apparaît l'eau (sur l'appui, sur le dormant, sur le tableau, au sol en bas). (2) En sec, arroser zone par zone avec jet doux : d'abord le vitrage, puis le joint de vitrage, puis l'ouvrant, puis le dormant, enfin le raccord mur. L'eau apparaît à l'intérieur = zone identifiée. (3) Photographier. (4) Si rien ne révèle l'origine : caméra thermique post-arrosage (expert 200-400 €). 90 % des cas résolus par test DIY.",
  },
  {
    question: 'Puis-je réparer un joint PVC moi-même ?',
    answer:
      "Oui pour 2 types de joints : (1) joint périphérique EPDM de l'ouvrant (caoutchouc noir en U cliqué dans la rainure), coût 1-3 €/ml, remplacement par cliquage nouveau profil après nettoyage. 30 min par fenêtre. (2) joint mastic polyuréthane entre dormant et tableau mur (bande silicone blanche visible depuis l'extérieur), remplacement par tirage ancien mastic au cutter + silicone neutre Rubson/Sika, 15-30 € tube. Jamais réparer vitrage ou double vitrage : appel pro.",
  },
  {
    question: 'Et si la pose est défectueuse ?',
    answer:
      "Activer la garantie décennale de l'entreprise qui a posé (art. 1792 Code civil) valable 10 ans après réception. Envoyer LRAR à l'entreprise avec photos, description, exigence intervention sous 60 jours. Si l'entreprise refuse ou ne répond pas : signaler à l'assureur décennale (trouvable sur devis d'origine), saisir tribunal judiciaire. Si entreprise disparue : assurance décennale obligatoirement mobilisable via expert. Conserver devis, facture, PV réception = crucial.",
  },
  {
    question: 'La micro-ventilation peut-elle causer des infiltrations ?',
    answer:
      "Non mais oui paradoxalement : la micro-ventilation (position entrebâillée) ne cause pas d'infiltration puisqu'elle est conçue pour. Mais : (1) si bouchée par poussière/saleté, condensation + mauvais drainage = humidité en bas d'ouvrant confondue avec infiltration. (2) Si mal réglée, eau de pluie ruisselante peut entrer. Nettoyer avec pinceau doux + aspirateur 2×/an. Vérifier drainage (trous d'évacuation en bas d'ouvrant PVC, ne jamais boucher).",
  },
  {
    question: 'Combien coûte le remplacement complet d’une fenêtre infiltrante ?',
    answer:
      "Fourchette 2026 TTC posée : PVC DV 450-900 €, PVC triple vitrage 700-1 300 €, aluminium DV 800-1 600 €, bois DV 900-1 800 €. Inclut : dépose ancienne, pose nouvelle, finitions intérieures/extérieures, évacuation. Aides 2026 : MaPrimeRénov' parcours accompagné 40-100 €/fenêtre selon profil, Coup de pouce CEE 5-15 €, TVA 5,5 % si artisan RGE. Exiger certification Acotherm Uw ≤1,3, jointoyage conforme DTU 36.5.",
  },
]

const sources = [
  { label: 'NF DTU 36.5 — Mise en œuvre menuiseries', url: 'https://www.cstb.fr' },
  { label: 'Art. 1792 Code civil — Décennale', url: 'https://www.legifrance.gouv.fr' },
  { label: 'ANIL — Recours malfaçons travaux', url: 'https://www.anil.org' },
  { label: 'Qualibat 3511 — Menuiseries PVC', url: 'https://www.qualibat.com' },
]

const relatedGuides = [
  { label: 'Remplacement fenêtres : aides 2026', href: '/guides/remplacement-fenetres-aides-2026' },
  { label: 'Condensation fenêtres causes', href: '/guides/condensation-fenetres-causes' },
  {
    label: 'Prix changement fenêtres double vitrage',
    href: '/guides/prix-changement-fenetres-double-vitrage',
  },
  { label: 'Garantie décennale', href: '/guides/garantie-decennale' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Problèmes maison',
    keywords: [
      'infiltration fenêtre PVC',
      'fenêtre fuit pluie',
      'joint fenêtre dégradé',
      'étanchéité fenêtre',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Infiltration fenêtre PVC', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Infiltration fenêtre PVC' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Droplet className="w-3.5 h-3.5" aria-hidden />
              Problèmes maison · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Infiltration fenêtre PVC sous la pluie
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Eau qui apparaît en bas d’ouvrant, tache sur le mur sous la fenêtre, fuite sur l’appui
              par fortes pluies ? Une fenêtre PVC qui fuit a en général une cause simple. Voici
              comment diagnostiquer et réparer, DIY ou en activant la garantie décennale.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>5 causes classiques + solution</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Cause</th>
                    <th className="p-3 border-b border-sand-200">Signe</th>
                    <th className="p-3 border-b border-sand-200">Solution</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Joint EPDM dégradé', 'Eau en bas ouvrant', 'Remplacer joint 1-3 €/ml'],
                    ['Joint mastic fissuré', 'Eau au raccord mur', 'Refaire mastic 15-30 €'],
                    ['Appui sans pente', 'Eau sur mur ext.', 'Refaire appui pente 2 %'],
                    ['Drain bouché', 'Eau qui stagne', 'Nettoyer trous bas'],
                    ['Pose défectueuse', 'Infiltrations multiples', 'Décennale entreprise'],
                  ].map(([c, s, sol]) => (
                    <tr key={c} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{c}</td>
                      <td className="p-3">{s}</td>
                      <td className="p-3">{sol}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>Fenêtre posée il y a moins de 10 ans ?</strong> La garantie décennale couvre
                les défauts d’étanchéité liés à la pose. Activer par LRAR avec photos, sans
                attendre. Entreprise doit intervenir gratuitement. Ne pas bricoler soi-même : ça
                décharge l’entreprise.
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
            <Link
              href="/services/menuisier"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Trouver un menuisier <Phone className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
