import type { Metadata } from 'next'
import Link from 'next/link'
import { Hammer, ArrowRight, AlertTriangle, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'ouverture-mur-porteur-prix'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Thomas Bernard'

export const revalidate = 86400

const TITLE = 'Ouvrir un mur porteur : prix, étude 2026'
const DESCRIPTION =
  'Ouverture mur porteur : 1 500-6 000 € TTC selon portée + IPN/HEA. Étude béton obligatoire 400-900 €. Démarches copropriété. Guide architecte 2026.'

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
    authors: [`${SITE_URL}/equipe/thomas-bernard`],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const tldr = [
  'Prix moyen 2026 : 1 500-3 500 € TTC pour ouverture standard 1-2 m (IPN simple).',
  'Grande ouverture 3-4 m ou dalle lourde : 3 500-6 000 € TTC (HEA ou double IPN + étayage).',
  'Étude structure obligatoire (bureau d’études béton) : 400-900 € HT, délivre note de calcul.',
  'En copropriété : vote AG majorité absolue (art. 25 loi 1965) + architecte obligatoire.',
  'Assurance dommages-ouvrage recommandée (0,8-1,5 % du coût travaux), décennale entreprise obligatoire.',
]

const faqs = [
  {
    question: 'Comment savoir si un mur est porteur ?',
    answer:
      "Indices : épaisseur ≥18 cm en béton ou brique pleine (vs 7 cm pour cloison), continuité verticale à tous les étages, position sous une poutre ou refend, fait partie de la façade ou d'un pignon. Impossible à confirmer sans plans de l'immeuble ou inspection d'un bureau d'études. En maison : les murs de refend épais sont souvent porteurs. Si doute : demander étude structure 400-900 € avant tout projet — vital.",
  },
  {
    question: 'Quel est le vrai coût d’ouverture d’un mur porteur ?',
    answer:
      "Poste par poste : étude structure BE 400-900 €, architecte/MO 600-2 000 € (copro obligatoire), IPN/HEA + béton 400-1 200 €, main-d'œuvre pose + étayage 800-2 500 €, évacuation gravats 150-400 €, reprise plâtrerie+peinture 300-800 €. Total 2 650-7 800 € selon contexte. Grande baie coulissante porteuse extérieure : 8-15 k€ avec menuiserie.",
  },
  {
    question: 'Quelles démarches en copropriété pour une ouverture ?',
    answer:
      "Mur porteur = partie commune même s'il est en façade privative. Travaux nécessitent : (1) vote en AG majorité absolue (art. 25 loi 1965), (2) note de calcul bureau d'études structure, (3) attestation d'architecte pour la conformité, (4) assurance dommages-ouvrage. Le syndic doit être informé par lettre recommandée avec plan et étude BE 3 mois avant AG. Possibilité de passage en majorité simple si refus en 1ère AG (deuxième vote).",
  },
  {
    question: 'Faut-il un permis de construire ?',
    answer:
      "Non si l'ouverture est purement intérieure et sans modification de l'aspect extérieur. Oui si l'ouverture donne sur l'extérieur (création d'une baie, porte-fenêtre) : déclaration préalable (DP) pour surface <20 m² SDPHO, permis de construire au-delà. En secteur ABF : DP obligatoire même pour ouverture intérieure visible depuis l'extérieur. Délai instruction DP : 1 mois, PC : 2-3 mois.",
  },
  {
    question: 'Peut-on poser un linteau bois à la place d’un IPN ?',
    answer:
      'Dépend de la charge. Pour petites portées (<80 cm) et charges faibles (mur non porteur déguisé en porteur, mur intérieur 1er étage) : linteau bois lamellé-collé certifié possible. Pour vrais murs porteurs ≥1,2 m de portée ou supportant planchers lourds : IPN acier 140-220 obligatoire, parfois HEA ou double IPN. Le choix du linteau dépend exclusivement de la note de calcul du BE structure.',
  },
  {
    question: 'Quels risques en cas d’ouverture sans étude structure ?',
    answer:
      'Risques réels et graves : (1) fissures structurelles propagées sur les étages (60 % des sinistres ouverture sauvage), (2) affaissement plancher haut, (3) effondrement partiel (cas rares mais mortels), (4) mise en demeure du syndic + remise en état à vos frais (5 000-50 000 €), (5) nullité assurance en cas de sinistre. Un BE structure à 600 € est un investissement qui évite un sinistre à 30 000 €.',
  },
]

const sources = [
  {
    label: 'Loi du 10 juillet 1965 — Copropriété',
    url: 'https://www.legifrance.gouv.fr/loda/id/LEGITEXT000006068256',
  },
  { label: 'DTU 20.1 — Murs en maçonnerie', url: 'https://www.cstb.fr' },
  { label: 'Ordre des Architectes — Travaux modificatifs', url: 'https://www.architectes.org' },
  { label: 'Eurocodes — Structures', url: 'https://www.ec-certification.com' },
]

const relatedGuides = [
  { label: 'Permis de construire', href: '/guides/permis-construire' },
  { label: 'Déclaration préalable travaux', href: '/guides/declaration-prealable-travaux' },
  { label: 'Travaux en copropriété', href: '/guides/travaux-copropriete' },
  { label: 'Extension maison prix', href: '/guides/extension-maison' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Travaux spécialisés',
    keywords: [
      'ouverture mur porteur prix',
      'étude structure béton',
      'IPN mur porteur',
      'mur porteur copropriété',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Ouverture mur porteur prix', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Ouverture mur porteur prix' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Hammer className="w-3.5 h-3.5" aria-hidden />
              Travaux spécialisés · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Ouverture mur porteur prix 2026 + étude structure
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Abattre un mur porteur pour créer une cuisine ouverte ou relier deux pièces est le
              travail le plus technique en rénovation intérieure. Voici les coûts réels 2026, les
              démarches obligatoires (étude béton, copropriété, urbanisme) et les pièges à éviter.
            </p>
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Prix détaillé par configuration</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Configuration</th>
                    <th className="p-3 border-b border-sand-200">Prix TTC</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Ouverture 80 cm — linteau bois', '1 200-1 800 €'],
                    ['Ouverture 1,5 m — IPN 140', '1 800-3 000 €'],
                    ['Ouverture 2,5 m — IPN 200 ou HEA', '2 800-4 500 €'],
                    ['Ouverture 3,5 m — double IPN 200', '4 000-6 500 €'],
                    ['Ouverture 4 m + baie coulissante ext.', '8 000-15 000 €'],
                    ['Supplément copropriété (archi+AG)', '+800-2 000 €'],
                    ['Étude structure BE', '400-900 €'],
                    ['Évacuation gravats (benne)', '200-450 €'],
                  ].map(([c, p]) => (
                    <tr key={c} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{c}</td>
                      <td className="p-3 font-semibold">{p}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2>Étapes obligatoires</h2>
            <ol>
              <li>Diagnostic : vérifier nature du mur (BE + plans immeuble).</li>
              <li>Note de calcul béton (BE structure) : définit IPN/HEA et appuis.</li>
              <li>Architecte/ingénieur (obligatoire copro + facultatif maison).</li>
              <li>Demande d’autorisation copropriété en AG (majorité absolue).</li>
              <li>DP ou PC si ouverture donne sur extérieur.</li>
              <li>Assurance dommages-ouvrage (fortement recommandée).</li>
              <li>Étayage chantier + pose linteau + évacuation gravats.</li>
              <li>Reprise plâtrerie, électricité, peinture.</li>
            </ol>

            <div className="not-prose border border-rose-200 bg-rose-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-rose-900 m-0">
                <strong>Jamais sans étude structure.</strong> Un "maçon" qui propose 500 € pour
                ouvrir un mur sans note de calcul est une arnaque dangereuse. Les sinistres sur
                ouvertures sauvages représentent 40 % des affaissements en copropriété. Toujours
                exiger : plan signé BE, attestation décennale entreprise, assurance
                dommages-ouvrage.
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
