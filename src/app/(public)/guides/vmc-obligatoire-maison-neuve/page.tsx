import type { Metadata } from 'next'
import Link from 'next/link'
import { Wind, ArrowRight, AlertTriangle, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'vmc-obligatoire-maison-neuve'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Thomas Bernard'

export const revalidate = 86400

const TITLE = 'VMC obligatoire neuf : RE2020, coûts 2026'
const DESCRIPTION =
  'VMC obligatoire neuf : arrêté 24 mars 1982 + RE2020. Simple flux auto, hygro B, double flux, coûts pose, maintenance obligatoire DTU 68.3.'

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
    authors: [`${SITE_URL}/equipe/thomas-bernard`],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const tldr = [
  'Obligation : arrêté 24 mars 1982 + RE2020. Toute construction neuve DOIT disposer d’une ventilation mécanique ou naturelle performante.',
  'Types : SF auto (300-600 € posée, base), SF hygro B (600-1 500 €, standard neuf), DF thermodynamique (3 500-6 500 €, RE2020 pro).',
  'Obligation entretien : DTU 68.3 impose vérification annuelle bouches + moteur tous les 2-3 ans.',
  'Performance débit : 30-45 m³/h pièce principale, 45-90 m³/h cuisine (hotte), 30-60 m³/h SDB/WC.',
  'Interdiction : boucher les bouches ou entrées d’air = non-conformité + risque condensation généralisée.',
]

const faqs = [
  {
    question: 'La VMC est-elle obligatoire dans une maison neuve ?',
    answer:
      "Oui, dans les logements neufs depuis l'arrêté du 24 mars 1982 (mis à jour par RE2020). Obligation = ventilation mécanique OU ventilation naturelle assistée avec performance équivalente. En pratique : 100 % des constructions neuves récentes ont VMC. La RE2020 exige balance hermétique de l'enveloppe (test infiltrométrie Q4,Pa = 0,6 m³/h/m² en maison individuelle), donc VMC indispensable pour renouveler l'air.",
  },
  {
    question: 'Quel type de VMC choisir en construction neuve ?',
    answer:
      "VMC simple flux hygroréglable type B : standard actuel neuf, 600-1 500 € posée, débit s'adapte à l'humidité, consommation modeste. VMC double flux thermodynamique : 3 500-6 500 €, récupère 70-90 % de la chaleur extraite, éligible MaPrimeRénov', obligatoire pour label BBC Effinergie. VMC simple flux auto : 300-600 €, basique, convient juste pour atteindre RE2020. Choix recommandé : hygro B en entrée de gamme, DF thermodynamique pour maisons passives/BBC.",
  },
  {
    question: 'Quel est le débit réglementaire ?',
    answer:
      "Arrêté 24 mars 1982 : débits minimaux obligatoires à l'extraction. Cuisine : 75 m³/h base, 135 m³/h cuisson. SDB + douche : 30 m³/h base, 75 m³/h pointe. WC : 15-30 m³/h. Par bouche entrée d'air dans pièces principales (salon, chambres) : 45 m³/h. Un bureau d'études ventilation (Cofrend, Qualibat 2321) dimensionne précisément selon surface, occupation, configuration. Mal dimensionné = condensation, moisissures.",
  },
  {
    question: 'Quel entretien pour une VMC ?',
    answer:
      "DTU 68.3 impose : (1) nettoyage bouches d'extraction tous les 3-6 mois (eau savonneuse), (2) nettoyage entrées d'air 2 fois/an, (3) vérification moteur et gaines par pro 1 fois/3 ans (coût 120-250 €), (4) remplacement filtres VMC double flux tous les 3-6 mois (20-60 € kit). VMC SF hygro : durée vie ~15-20 ans. VMC DF thermodynamique : 15-25 ans avec maintenance rigoureuse. Non-entretien = perte 30-50 % de performance au bout de 5 ans.",
  },
  {
    question: 'Puis-je couper la VMC pendant mes absences ?',
    answer:
      'Déconseillé. Même logement vide, le bâtiment respire : dégagements matériaux, humidité du sol, variations thermiques. Couper la VMC = condensation, champignons, dégradation intérieure. Recommandation : laisser tourner en débit réduit (mode absence des VMC modernes = 30-50 % débit). Consommation VMC = 25-80 kWh/an (vs 8 000-15 000 kWh chauffage), économie de coupure négligeable vs risques.',
  },
]

const sources = [
  { label: 'Arrêté 24 mars 1982 — Aération des logements', url: 'https://www.legifrance.gouv.fr' },
  { label: 'RE2020 — Ventilation', url: 'https://www.rt-batiment.fr' },
  { label: 'NF DTU 68.3 — Installations VMC', url: 'https://www.cstb.fr' },
  { label: 'Qualibat 2321 — Installation ventilation', url: 'https://www.qualibat.com' },
]

const relatedGuides = [
  { label: 'Condensation fenêtres causes', href: '/guides/condensation-fenetres-causes' },
  { label: 'Moisissure mur chambre traitement', href: '/guides/moisissure-mur-chambre-traitement' },
  { label: 'Humidité mur intérieur solution', href: '/guides/humidite-mur-interieur-solution' },
  {
    label: 'Isolation phonique mur appartement',
    href: '/guides/isolation-phonique-mur-appartement',
  },
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
    keywords: [
      'VMC obligatoire maison neuve',
      'VMC RE2020',
      'VMC simple flux',
      'VMC double flux thermodynamique',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'VMC obligatoire maison neuve', url: `/guides/${SLUG}` },
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
              { label: 'VMC obligatoire maison neuve' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Wind className="w-3.5 h-3.5" aria-hidden />
              Réglementation · Guide vérifié
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              VMC obligatoire maison neuve : cadre RE2020
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              En construction neuve, la VMC est une obligation réglementaire depuis l’arrêté du 24
              mars 1982, renforcée par la RE2020. Voici les types possibles, leurs performances, les
              débits exigés et l’entretien DTU 68.3.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Comparatif des 3 types de VMC neuf</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Type</th>
                    <th className="p-3 border-b border-sand-200">Prix posé</th>
                    <th className="p-3 border-b border-sand-200">Gain thermique</th>
                    <th className="p-3 border-b border-sand-200">Aide MPR</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['SF auto', '300-600 €', '0 %', 'Non'],
                    ['SF hygro A', '450-900 €', '5 %', 'Non'],
                    ['SF hygro B', '600-1 500 €', '10 %', 'Non'],
                    ['DF thermodynamique', '3 500-6 500 €', '15-25 %', '600-2 500 €'],
                  ].map(([t, p, g, a]) => (
                    <tr key={t} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{t}</td>
                      <td className="p-3 font-semibold">{p}</td>
                      <td className="p-3">{g}</td>
                      <td className="p-3">{a}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>Jamais boucher les entrées d’air.</strong> Les grilles en haut de fenêtre
                sont obligatoires (arrêté 1982). Les occulter = risque condensation, moisissures,
                non-conformité, décote vente. Si courants d’air : remplacer par modèles à débit
                contrôlé (50-100 €).
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
              href="/services/electricien"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Trouver un installateur <Phone className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
