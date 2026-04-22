import type { Metadata } from 'next'
import Link from 'next/link'
import { Euro, ArrowRight, Home, Calculator } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'prix-changement-fenetres-double-vitrage'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Claire Dubois'

export const revalidate = 86400

const TITLE = 'Prix fenêtres double vitrage 2026'
const DESCRIPTION =
  'Prix fenêtre double vitrage posée 2026 : 450-1 200 €/unité selon matériau (PVC, alu, bois, mixte). MaPrimeRénov’ + CEE jusqu’à 100 €/fenêtre.'

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
  'Fenêtre PVC double vitrage posée : 450 à 900 € l’unité standard.',
  'Fenêtre alu : 700 à 1 200 €. Fenêtre bois : 800 à 1 400 €. Mixte alu-bois : 1 000 à 1 800 €.',
  'Pose en rénovation sur dormant conservé : -30 % vs dépose totale.',
  'Aides 2026 : MaPrimeRénov’ 40-100 €/fenêtre selon revenus + CEE équivalent.',
  'Remplacer 10 fenêtres en PVC : 5 000 à 8 500 € hors aides.',
]

const faqs = [
  {
    question: 'Quel budget pour changer toutes les fenêtres d’une maison ?',
    answer:
      'Maison 100 m² avec 10-12 fenêtres standard : 5 500 à 11 000 € en PVC, 9 000 à 15 000 € en aluminium, 10 000 à 17 000 € en bois. Pose comprise, en rénovation (dépose totale des anciennes menuiseries). Le PVC reste le rapport qualité/prix/performance le plus compétitif pour le résidentiel.',
  },
  {
    question: 'Quelle différence PVC, alu, bois, mixte ?',
    answer:
      'PVC : meilleur rapport qualité-prix-isolation, Uw ~1,3-1,5, entretien zéro, durée 30-40 ans, esthétique moderne mais peu adapté aux grandes baies. Aluminium : fin (plus de lumière), résistant, Uw 1,4-1,7, durée 40+ ans, prix supérieur. Bois : performance équivalente, chaleur visuelle, entretien requis (vernis 5-10 ans), inadapté aux zones très exposées. Mixte alu-bois : le meilleur des deux, prix premium.',
  },
  {
    question: 'Quelle est la pose moins chère, rénovation ou dépose totale ?',
    answer:
      "Pose en rénovation (le nouveau cadre se fixe sur l'ancien dormant conservé) : moins chère de 25-40 %, plus rapide, moins de dégâts muraux. Inconvénient : perte de 2-5 cm de surface vitrée, pont thermique potentiel si dormant bois vieilli. Dépose totale : dépose intégrale du dormant + pose neuve, performance thermique maximale, esthétique parfaite, coût plus élevé, finitions maçonneries/plâtrerie incluses.",
  },
  {
    question: 'Les fenêtres sont-elles éligibles à MaPrimeRénov’ en 2026 ?',
    answer:
      "Oui, mais dans des conditions précises. Obligation : Uw ≤ 1,3 W/m²·K pour fenêtre simple, Uw ≤ 1,5 pour porte-fenêtre. Obligation RGE Qualibat 3521/3522 ou équivalent. Aide : 40 à 100 € par fenêtre selon revenus (barèmes 2026). Attention : si la fenêtre remplace une fenêtre simple vitrage, aide accordée ; si elle remplace une fenêtre double vitrage, aide refusée (sauf dans cadre parcours d'ampleur).",
  },
  {
    question: 'Faut-il un vitrage spécial selon la région ?',
    answer:
      "Pour zones froides (H1, H2) : vitrage à isolation renforcée (VIR) avec Ug ≤ 1,1. Pour zones méridionales (H3) : vitrage à contrôle solaire (réfléchit une partie du rayonnement) pour éviter surchauffe. Vitrage acoustique recommandé près d'axes routiers, aéroports, voies ferrées (classe Rw ≥ 33 dB). Vitrage de sécurité (feuilleté) obligatoire pour baie vitrée accessible de l'extérieur (art. 8 arrêté 22 octobre 2010).",
  },
  {
    question: 'Combien de temps pour changer 10 fenêtres ?',
    answer:
      "Pose en rénovation : 2-3 jours pour une équipe de 2. Dépose totale avec reprise plâtrerie : 4-7 jours. Délai de fabrication des fenêtres (si sur mesure) : 4-8 semaines à ajouter. Prévoyez donc 2-3 mois entre signature devis et fin pose, plus selon charge de l'entreprise.",
  },
]

const sources = [
  {
    label: 'Règlement Produits de Construction (UE) — marquage CE fenêtres',
    url: 'https://ec.europa.eu',
  },
  { label: 'Arrêté 22 octobre 2010 — baies accessibles', url: 'https://www.legifrance.gouv.fr' },
  { label: 'France Rénov’ — MaPrimeRénov’ fenêtres 2026', url: 'https://france-renov.gouv.fr' },
  { label: 'Qualibat — qualifications menuiseries (3521/3522)', url: 'https://www.qualibat.com' },
]

const relatedGuides = [
  { label: 'Rénovation fenêtres : matériaux et aides', href: '/guides/renovation-fenetres' },
  { label: 'Isolation thermique : guide complet', href: '/guides/isolation-thermique' },
  { label: 'MaPrimeRénov’ 2026 — critères RGE', href: '/guides/maprimerenov-2026-criteres-rge' },
  { label: 'Comment choisir un artisan RGE', href: '/guides/comment-choisir-artisan-rge' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Prix & Menuiseries',
    keywords: [
      'prix fenêtre double vitrage',
      'prix changement fenêtres',
      'fenêtre PVC prix',
      'Uw fenêtre',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Prix fenêtres double vitrage', url: `/guides/${SLUG}` },
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
            items={[
              { label: 'Guides', href: '/guides' },
              { label: 'Prix fenêtres double vitrage' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Euro className="w-3.5 h-3.5" aria-hidden />
              Prix &amp; Menuiseries
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Prix changement fenêtres double vitrage en 2026 : la grille complète
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              En 2026, une fenêtre double vitrage posée coûte entre 450 et 1 800 € selon le
              matériau, les dimensions et la pose. Remplacer 10 fenêtres dans une maison coûte donc
              typiquement 5 000 à 17 000 €. Voici la grille par matériau, les aides mobilisables, et
              les critères techniques qui conditionnent l’éligibilité MaPrimeRénov’.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Grille 2026 par matériau (fenêtre 1 vantail 100×120 cm)</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Matériau</th>
                    <th className="p-3 border-b border-sand-200">Fourniture</th>
                    <th className="p-3 border-b border-sand-200">Pose rénovation</th>
                    <th className="p-3 border-b border-sand-200">Total posé TTC</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['PVC', '250 à 550 €', '200 à 350 €', '450 à 900 €'],
                    ['Aluminium', '400 à 800 €', '300 à 400 €', '700 à 1 200 €'],
                    ['Bois', '500 à 950 €', '300 à 450 €', '800 à 1 400 €'],
                    ['Mixte alu-bois', '650 à 1 300 €', '350 à 500 €', '1 000 à 1 800 €'],
                  ].map(([m, f, p, t]) => (
                    <tr key={m} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold">{m}</td>
                      <td className="p-3">{f}</td>
                      <td className="p-3">{p}</td>
                      <td className="p-3 font-semibold">{t}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Fourchettes nationales 2026. Dépose totale : +25 à 40 % vs pose en rénovation.
                Grande baie (≥200×200) : ×2 à ×3.
              </p>
            </div>

            <h2>Prix par taille (PVC en rénovation, ordre de grandeur)</h2>
            <ul>
              <li>Fenêtre 60×60 (fixe) : 300 à 500 €</li>
              <li>Fenêtre 80×100 (1 vantail) : 400 à 650 €</li>
              <li>Fenêtre 100×120 (1 vantail) : 450 à 900 €</li>
              <li>Fenêtre 120×140 (2 vantaux) : 600 à 1 100 €</li>
              <li>Fenêtre 160×140 (2 vantaux) : 750 à 1 300 €</li>
              <li>Porte-fenêtre 90×215 (1 vantail) : 900 à 1 500 €</li>
              <li>Porte-fenêtre 140×215 (2 vantaux) : 1 200 à 2 000 €</li>
              <li>Baie vitrée coulissante 240×215 : 1 800 à 3 500 €</li>
            </ul>

            <h2>Critères techniques à exiger</h2>
            <ul>
              <li>
                <strong>Uw (coefficient fenêtre complète) :</strong> ≤ 1,3 pour MaPrimeRénov’.
              </li>
              <li>
                <strong>Ug (coefficient vitrage seul) :</strong> 1,0-1,1 pour une bonne perfo.
              </li>
              <li>
                <strong>Sw (facteur solaire) :</strong> 0,30-0,50 selon exposition. Plus bas au Sud
                pour éviter surchauffe.
              </li>
              <li>
                <strong>TLw (transmission lumineuse) :</strong> ≥ 0,50 pour confort visuel.
              </li>
              <li>
                <strong>Classement AEV</strong> (air-eau-vent) : A3 E7B V A2 minimum.
              </li>
              <li>
                <strong>Marquage CE</strong> obligatoire (règlement UE Produits de construction).
              </li>
            </ul>

            <h2>Aides 2026</h2>
            <ul>
              <li>
                <strong>MaPrimeRénov’ par geste.</strong> 40 à 100 € par fenêtre selon revenus,
                remplacement d’un simple vitrage uniquement. Obligation Uw ≤ 1,3.
              </li>
              <li>
                <strong>CEE Coup de pouce.</strong> Entre 40 et 100 €/fenêtre cumulable avec
                MaPrimeRénov’.
              </li>
              <li>
                <strong>TVA 5,5 %</strong> si entreprise RGE Qualibat 3521/3522.
              </li>
              <li>
                <strong>Éco-PTZ</strong> jusqu’à 7 000 € pour remplacement vitrage dans un bouquet
                de travaux.
              </li>
            </ul>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    3 devis menuiseries sous 48 h
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Artisans Qualibat RGE vérifiés. Bilan Uw et calcul aide inclus dans les devis.
                  </p>
                  <Link
                    href="/devis"
                    className="inline-flex items-center gap-1.5 text-primary-700 font-semibold hover:underline"
                  >
                    Demander mes devis <ArrowRight className="w-4 h-4" aria-hidden />
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
              href="/services/menuisier"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Trouver un menuisier <Home className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
