import type { Metadata } from 'next'
import Link from 'next/link'
import { Euro, ArrowRight, Paintbrush, Calculator } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'prix-peinture-appartement-50m2'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Isabelle Renault'

export const revalidate = 86400

const TITLE = 'Prix peinture appartement 50 m² 2026'
const DESCRIPTION =
  'Prix peinture appartement 50 m² en 2026 : 1 500 à 4 500 € TTC tout compris selon état des supports. Prix au m², choix de peinture, préparation, main-d’œuvre.'

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
    authors: [`${SITE_URL}/equipe/isabelle-renault`],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const tldr = [
  'Peinture murs + plafonds 50 m² (≈150 m² de parois) : 1 500 à 4 500 € TTC.',
  'Prix au m² parois : 15 à 35 €/m² avec préparation standard.',
  'Préparation lourde (rebouchage fissures, ponçage) : +30-50 %.',
  'Peinture premier prix : 5-10 €/L. Premium écologique : 15-30 €/L.',
  'Durée chantier 50 m² : 3-5 jours pour une équipe de 2.',
]

const faqs = [
  {
    question: 'Quel prix moyen pour peindre un 50 m² ?',
    answer:
      "En 2026, pour un appartement 50 m² habitable (≈150 m² de surface à peindre si on inclut murs + plafonds) : 1 500-2 500 € en remise à neuf simple (supports en bon état), 2 500-3 500 € avec préparation standard (petits trous, fissures, ponçage léger), 3 500-4 500 € avec préparation lourde (enduit complet, rebouchage fissures structurelles). Main-d'œuvre représente 60-70 % du total.",
  },
  {
    question: 'Combien coûte la peinture au m² parois ?',
    answer:
      "Tarif tout compris (main-d'œuvre + peinture + protection + finitions) : 15 à 35 €/m² de paroi. Détail : 8-15 €/m² main-d'œuvre pose, 3-8 €/m² peinture, 2-5 €/m² préparation standard, 2-7 €/m² protections et finitions. Pour parois avec grosse préparation (fissures structurelles, ponçage lourd, déchirure papier peint collé) : 30-50 €/m².",
  },
  {
    question: 'Quelle peinture choisir ?',
    answer:
      'Pour pièces sèches (séjour, chambre) : acrylique mate ou satinée, qualité « premium » ou « mat de luxe », durée 10-12 ans. Pour pièces humides (SDB, cuisine) : acrylique satinée ou glycéro, ou peinture spéciale humidité (anti-moisissure). Pour plafonds : acrylique mate blanc spécial plafond. Privilégiez les peintures écolabellisées (Écolabel, NF Environnement, Ange Bleu) : COV <1 g/L, moins nocives, prix +20-30 %.',
  },
  {
    question: 'Préparation des murs : indispensable ou optionnelle ?',
    answer:
      'Indispensable dans 90 % des cas. Sans préparation, le résultat montrera toutes les imperfections après séchage. Préparation minimale : dépoussiérage, rebouchage trous/fissures, ponçage léger, sous-couche. Préparation standard : ajouter lessivage si murs encrassés, traitement zones spécifiques (moisissures, nicotine). Préparation lourde : enduit complet, grattage peintures anciennes, traitement humidité. Un artisan qui facture 0 € de préparation surestimera le résultat.',
  },
  {
    question: 'Faut-il passer par un peintre professionnel ?',
    answer:
      "Pour appartement neuf ou refait récemment : DIY viable (économie 60-70 %), 2-3 week-ends de travail. Pour rénovation (anciens papiers peints, murs abîmés, plafond à reprendre) : pro recommandé. Un peintre pro applique 2 couches en 1 jour sur 30 m² qu'un amateur met 4-5 jours à faire. Qualité : un pro garantit 1 an sur la prestation, utilise les bonnes peintures et traite les fonds correctement.",
  },
  {
    question: 'Combien de couches de peinture faut-il ?',
    answer:
      "Standard : 1 sous-couche + 2 couches de finition = 3 passes. Sur support clair repeint clair : éventuellement 1 sous-couche + 1 couche finition (risqué). Sur support foncé repeint clair : 1 sous-couche opacifiante + 2-3 couches finition. Un devis qui mentionne « 1 couche suffit » est souvent trompeur : le rendu final sera transparent en zones d'ombre. Exigez 2 couches minimum en garanti.",
  },
]

const sources = [
  { label: 'Qualibat 6111 — Qualification peintre', url: 'https://www.qualibat.com' },
  { label: 'Écolabel européen — Peintures intérieures', url: 'https://www.ecolabel.fr' },
  { label: 'CAPEB — Prix travaux peinture 2026', url: 'https://www.capeb.fr' },
  { label: 'AFNOR NF DTU 59.1 — Peinture', url: 'https://boutique.afnor.org' },
]

const relatedGuides = [
  { label: 'Comparer 3 devis d’artisans', href: '/guides/comparer-3-devis-artisans' },
  { label: 'Comment demander un devis de travaux', href: '/guides/comment-faire-devis-travaux' },
  { label: 'Humidité mur intérieur : solutions', href: '/guides/humidite-mur-interieur-solution' },
  { label: 'Budget rénovation', href: '/guides/budget-renovation' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Prix & Peinture',
    keywords: [
      'prix peinture appartement',
      'prix peinture m2',
      'tarif peintre',
      'repeindre appartement',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Prix peinture appartement 50 m²', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Prix peinture 50 m²' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Euro className="w-3.5 h-3.5" aria-hidden />
              Prix &amp; Peinture
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Prix peinture appartement 50 m² en 2026
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Repeindre un appartement de 50 m² coûte entre 1 500 et 4 500 € TTC en 2026, selon
              l’état des supports et la qualité souhaitée. La peinture est le poste de rénovation le
              plus sensible à la préparation&nbsp;: un même appartement peut être peint en 1 500 €
              (supports impeccables, 1 couleur claire) ou en 4 500 € (supports abîmés, plusieurs
              teintes foncées, finitions). Voici la grille.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Grille 2026 peinture appartement 50 m²</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Niveau</th>
                    <th className="p-3 border-b border-sand-200">État des murs</th>
                    <th className="p-3 border-b border-sand-200">Total TTC</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {[
                    ['Remise à neuf simple', 'Bon état, pas de préparation', '1 500 à 2 500 €'],
                    [
                      'Rénovation standard',
                      'Petits trous, fissures superficielles',
                      '2 500 à 3 500 €',
                    ],
                    ['Rénovation complète', 'Fissures, papier peint à déposer', '3 500 à 4 500 €'],
                    [
                      'Haute qualité / décorative',
                      'Peintures premium, 3+ teintes, finitions',
                      '4 500 à 7 000 €',
                    ],
                  ].map(([n, e, t]) => (
                    <tr key={n} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold">{n}</td>
                      <td className="p-3">{e}</td>
                      <td className="p-3 font-semibold">{t}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Fourchettes pour 50 m² habitables ≈ 150 m² de parois (murs + plafonds).
              </p>
            </div>

            <h2>Prix au m² parois, détail des postes</h2>
            <ul>
              <li>
                <strong>Main-d’œuvre pose :</strong> 8-15 €/m² parois (2 couches).
              </li>
              <li>
                <strong>Peinture acrylique standard :</strong> 3-6 €/m² (rendement ~10-12 m²/L).
              </li>
              <li>
                <strong>Peinture acrylique premium écologique :</strong> 6-12 €/m².
              </li>
              <li>
                <strong>Préparation standard</strong> (dépoussiérage, sous-couche, rebouchage léger)
                : 2-5 €/m².
              </li>
              <li>
                <strong>Préparation lourde</strong> (enduit complet, ponçage, traitement humidité) :
                8-15 €/m².
              </li>
              <li>
                <strong>Protections</strong> (bâche, adhésifs, dépose prises) : 1-3 €/m².
              </li>
            </ul>

            <h2>Ce qui fait varier le prix</h2>
            <ul>
              <li>
                <strong>Hauteur de plafond.</strong> Au-delà de 2,70 m, échafaudage nécessaire,
                +15-25 % sur poste plafond.
              </li>
              <li>
                <strong>Nombre de teintes.</strong> Chaque couleur supplémentaire = achat d’un pot +
                sous-couche + temps de change = +150-300 € par teinte.
              </li>
              <li>
                <strong>Ancien papier peint à déposer.</strong> 4-8 €/m² selon colle et état.
              </li>
              <li>
                <strong>Peintures sombres ou vives.</strong> Souvent 3 couches requises vs 2 pour
                teintes claires.
              </li>
              <li>
                <strong>Peintures spéciales</strong> (humidité, cuisine, magnétique, tableau) :
                +20-50 %.
              </li>
            </ul>

            <h2>Exemple chiffré — appartement T3 50 m²</h2>
            <ul>
              <li>Séjour (25 m² paroi) : 400-700 €</li>
              <li>Chambre 1 (30 m² paroi) : 500-850 €</li>
              <li>Chambre 2 (25 m² paroi) : 400-700 €</li>
              <li>Cuisine (20 m² paroi peinture spéciale) : 400-700 €</li>
              <li>Salle de bain (15 m² peinture humidité) : 300-550 €</li>
              <li>Entrée + couloir (15 m²) : 250-450 €</li>
              <li>Plafonds 50 m² : 500-1 000 €</li>
              <li>Préparation standard + protections : 500-800 €</li>
              <li>
                <strong>Total TTC :</strong> 3 250 à 5 750 €
              </li>
            </ul>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    3 devis peintre comparés
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Qualibat 6111 recommandé. Visite obligatoire pour évaluer état supports.
                  </p>
                  <Link
                    href="/services/peintre"
                    className="inline-flex items-center gap-1.5 text-primary-700 font-semibold hover:underline"
                  >
                    Annuaire peintres <ArrowRight className="w-4 h-4" aria-hidden />
                  </Link>
                </div>
              </div>
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
              href="/services/peintre"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Trouver un peintre <Paintbrush className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
