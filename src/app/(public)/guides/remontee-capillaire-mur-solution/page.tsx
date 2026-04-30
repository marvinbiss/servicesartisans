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

const SLUG = 'remontee-capillaire-mur-solution'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Sophie Martin'

export const revalidate = 86400

const TITLE = 'Remontée capillaire : solutions 2026'
const DESCRIPTION =
  'Remontée capillaire mur : diagnostic, solution durable (injection résine, drainage, électro-osmose), coût, pièges, entreprises RGE.'

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
    authors: [`${SITE_URL}/equipe/sophie-martin`],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const tldr = [
  'Signe : tache d’humidité en bas de mur (jusqu’à 1,5 m), salpêtre blanc, décollement enduit, odeur cave.',
  'Cause : pas de coupure étanche entre fondations et murs (bâti ancien <1960 souvent) + sol humide.',
  '4 solutions : injection résine siloxane (30-60 €/ml), drainage périphérique (200-400 €/ml), électro-osmose (rarement efficace), ressuage.',
  'Diagnostic préalable obligatoire : test humidité plâtre + détection sels nitrates. Coût 250-600 €.',
  'Entreprise spécialisée avec garantie décennale indispensable. Méfier garantie « à vie » douteuse.',
]

const faqs = [
  {
    question: 'Comment reconnaître une remontée capillaire ?',
    answer:
      "Signes distinctifs : (1) tache d'humidité en BAS de mur, montant en dégradé vers le haut (1-1,5 m max), (2) présence de salpêtre (cristaux blancs poudreux) dus aux sels nitrates remontants, (3) cloquage peinture/enduit en bas, (4) odeur de cave moisie, (5) mur plus froid au toucher en bas. À distinguer de : infiltration latérale (tache horizontale localisée), condensation (traces en haut/angle), fuite plomberie (tache ponctuelle et évolutive).",
  },
  {
    question: 'Quel est le diagnostic préalable ?',
    answer:
      'Obligatoire avant tout traitement : (1) test humidité par prélèvement plâtre à différentes hauteurs (0,3 m, 0,8 m, 1,5 m), analyse au bombe Darcy ou humidimètre, (2) détection sels (nitrates, chlorures, sulfates) par bandelettes. Si sels >2 g/kg : remontée capillaire confirmée. (3) Coupe géotechnique sol si sol très humide (nappe phréatique haute). Coût diagnostic 250-600 € HT, effectué par société spécialisée traitement humidité.',
  },
  {
    question: 'Combien coûte un traitement par injection de résine ?',
    answer:
      "Tarif 2026 : 30-60 €/ml TTC pour injection siloxane/crème hydrofuge dans le mur à basse pression. Maison 100 m² avec 40 ml murs extérieurs touchés : 1 200-2 400 €. Durée intervention : 1-2 jours. Garantie décennale obligatoire. Complément : piochage de l'enduit contaminé sur 20-30 cm au-dessus de la limite humide, ré-enduit avec mortier assainissant (70-120 €/m²). Total projet complet : 4 000-8 000 €.",
  },
  {
    question: 'Les techniques miracles (électro-osmose, etc.) sont-elles efficaces ?',
    answer:
      'Électro-osmose passive (boîtier aimanté) : efficacité NON DÉMONTRÉE scientifiquement, malgré publicités. CSTB a rendu plusieurs avis défavorables. Ressuage (drain intérieur à la base du mur) : peut accompagner injection mais ne résout pas seul. Électro-osmose active (électrodes + courant) : parfois efficace en complément. Méfiance totale envers les démarches à domicile proposant des dispositifs à 2 000-8 000 € sans diagnostic préalable ni chantier maçonnerie. Toujours exiger avis technique CSTB/ATE.',
  },
  {
    question: 'Faut-il refaire l’enduit après traitement ?',
    answer:
      "Oui, obligatoire car l'enduit contaminé par les sels nitrates continuera d'attirer l'humidité même après traitement. Procédé : piocher enduit intérieur sur 20 cm au-dessus de la limite humide visible, laisser sécher mur 30-90 jours (purge des sels), appliquer enduit assainissant anti-sels (type Weber.cal, Sika Monotop) en 2 couches, finition peinture respirante. Coût : 70-120 €/m² enduit refait. Alternative pour chantier lourd : contre-cloison avec lame d'air ventilée (plus performant mais perte surface).",
  },
]

const sources = [
  { label: 'CSTB — Humidité des murs enterrés', url: 'https://www.cstb.fr' },
  { label: 'Agence Qualité Construction — Humidité', url: 'https://qualiteconstruction.com' },
  { label: 'Arrêté 23 juin 1978 — Règles sanitaires', url: 'https://www.legifrance.gouv.fr' },
  { label: 'Norme NF DTU 20.1 — Murs en maçonnerie', url: 'https://www.cstb.fr' },
]

const relatedGuides = [
  { label: 'Humidité mur intérieur solution', href: '/guides/humidite-mur-interieur-solution' },
  { label: 'Moisissure mur chambre traitement', href: '/guides/moisissure-mur-chambre-traitement' },
  {
    label: 'Infiltration eau toiture diagnostic',
    href: '/guides/infiltration-eau-toiture-diagnostic',
  },
  { label: 'Fissures maison inquiétantes', href: '/guides/fissures-maison-inquietantes' },
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
    keywords: ['remontée capillaire', 'humidité mur bas', 'injection résine mur', 'salpêtre mur'],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Remontée capillaire mur', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Remontée capillaire mur' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Droplet className="w-3.5 h-3.5" aria-hidden />
              Problèmes maison · Guide vérifié
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Remontée capillaire mur : solution durable
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Humidité qui monte du sol, salpêtre blanc, enduit qui cloque en bas de mur ? C’est une
              remontée capillaire, typique des maisons anciennes sans coupure étanche. Voici le
              diagnostic, les vraies solutions, les arnaques à éviter.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Comparatif des 4 solutions</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Technique</th>
                    <th className="p-3 border-b border-sand-200">Principe</th>
                    <th className="p-3 border-b border-sand-200">Prix</th>
                    <th className="p-3 border-b border-sand-200">Efficacité</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Injection résine', 'Barrière chimique', '30-60 €/ml', 'Très bonne'],
                    [
                      'Drainage périphérique',
                      'Évacuation eau sol',
                      '200-400 €/ml',
                      'Bonne si sol humide',
                    ],
                    ['Ressuage', 'Drain base mur', '80-150 €/ml', 'Complément'],
                    ['Électro-osmose active', 'Champ électrique', '3-6 k€', 'Variable'],
                  ].map(([t, p, pr, e]) => (
                    <tr key={t} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{t}</td>
                      <td className="p-3">{p}</td>
                      <td className="p-3">{pr}</td>
                      <td className="p-3">{e}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>Méfiez-vous des démarches domicile.</strong> 70 % des plaintes DGCCRF
                traitement humidité concernent des sociétés qui vendent 4 000-15 000 € un dispositif
                sans diagnostic sérieux. Toujours 3 devis d’entreprises RGE avec garantie décennale.
                Refuser signature sous pression.
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
              href="/services/macon"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Trouver un maçon <Phone className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
