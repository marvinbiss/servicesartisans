import type { Metadata } from 'next'
import Link from 'next/link'
import { LandPlot, ArrowRight, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'cloture-jardin-reglementation'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Thomas Bernard'
const AUTHOR_SLUG = 'thomas-bernard'

export const revalidate = 86400

const TITLE = 'Clôture jardin 2026 : règles et prix au m'
const DESCRIPTION =
  'Clôture jardin 2026 : règles de hauteur (art. 663 Code civil), déclaration préalable si PLU, mitoyenneté, prix grillage/panneaux/mur 20-200 €/m.'

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
    authors: [`${SITE_URL}/equipe/${AUTHOR_SLUG}`],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const tldr = [
  'Hauteur légale par défaut (art. 663 Code civil) : 2,60 m commune <50 000 hab, 3,20 m ≥50 000 hab. PLU peut restreindre (souvent 1,80-2 m).',
  'Déclaration préalable obligatoire si PLU l’impose, si en zone protégée ABF, ou si >2 m (art. R421-12 Code urba.).',
  'Mitoyenneté (art. 653-672 Code civil) : clôture sur limite = propriété commune. Contribution moitié/moitié aux frais par défaut.',
  'Prix 2026 TTC posée/ml : grillage simple 20-50 €, panneaux rigides 60-100 €, claustra bois 80-130 €, mur parpaing enduit 150-250 €.',
  'Respect distances voisinage : haie >2 m plantée à 2 m de limite, ≤2 m plantée à 0,5 m (art. 671 Code civil).',
]

const faqs = [
  {
    question: 'Quelle hauteur maximale pour une clôture de jardin en 2026 ?',
    answer:
      'Règle générale art. 663 Code civil (applicable en absence de règle locale) : (1) Commune <50 000 habitants : hauteur max 2,60 m (3,20 m commune ≥50 000 hab.) — mesurée hors chaperon ; (2) PLU local prévaut : PLU résidentiel pavillonnaire limite souvent à 1,80-2 m (vérifier PLU en mairie ou geoportail-urbanisme.gouv.fr) ; (3) Lotissement avec règlement : souvent 1,50-1,80 m pour harmonie visuelle ; (4) Copropriété horizontale : règlement peut imposer type et hauteur uniformes ; (5) Zone ABF (Architecte Bâtiments France) 500 m autour monument historique : hauteur + matériaux imposés, avis ABF obligatoire ; (6) Alignement voie publique : 1,20-1,60 m côté rue souvent (sécurité visibilité aux intersections). Non-respect = voisin peut demander abaissement judiciaire (5 ans prescription) + astreinte journalière tribunal + dommages-intérêts. Mesure : altitude sol naturel à la base, pas sol remblayé.',
  },
  {
    question: 'Faut-il une déclaration préalable pour poser une clôture ?',
    answer:
      'Selon cas (art. R421-12 Code urba.) : (1) AUCUNE formalité si clôture <2 m en zone non protégée ni classée + PLU ne l’exige pas ; (2) DÉCLARATION PRÉALABLE TRAVAUX obligatoire si : PLU local l’impose (très fréquent zones urbaines), en secteur sauvegardé ou ABF 500 m, en zone classée site patrimonial remarquable (SPR), en lotissement avec cahier charges ; (3) DP obligatoire systématiquement si clôture >2 m de hauteur (art. R421-12-1) ; (4) Dossier Cerfa 13703 + plan masse + croquis + photos + coupe + DP couleurs si matériau visible ; (5) Délai instruction 1 mois (2 mois si ABF), affichage panneau chantier obligatoire 1 mois avant travaux ; (6) Validité 3 ans + prorogation 2x 1 an (art. R424-17). Non-respect = procès-verbal infraction, amende 6 000 €/m² (art. L480-4 Code urba.), démolition possible, prescription 6 ans. Consultation mairie AVANT dépôt recommandée.',
  },
  {
    question: 'Mitoyenneté de clôture : qui paie les travaux ?',
    answer:
      'Régi art. 653-672 Code civil : (1) Clôture construite EXACTEMENT sur la limite séparative avec accord des 2 voisins = MITOYENNE = propriété commune ; (2) Frais construction + entretien partagés moitié/moitié (art. 655 Code civil) ; (3) En ville, tout propriétaire peut OBLIGER son voisin à se clore (art. 663) = voisin doit contribuer moitié frais même s’il ne veut pas la clôture, dans limites 2,60/3,20 m selon taille commune ; (4) En zone rurale, pas d’obligation de se clore (sauf usages locaux) ; (5) Clôture privative = construite entièrement sur terrain d’un seul propriétaire, 50 cm de la limite minimum souvent (art. 675) ; (6) Présomption mitoyenneté art. 653 si mur sur limite et sans marque contraire, renversable preuve contraire (titre, acte notarié, prescription 30 ans) ; (7) Litige = conciliateur justice gratuit puis tribunal judiciaire. Faire constat huissier + photos avant travaux en cas doute.',
  },
  {
    question: 'Quel prix pour installer une clôture au mètre linéaire en 2026 ?',
    answer:
      'Prix 2026 TTC posée/ml (hors terrassement + scellement fondation béton) : (1) Grillage simple torsadé galvanisé 1,20-1,50 m : 20-40 €/ml — économique, jardin potager ; (2) Grillage rigide panneau soudé 1,70 m + poteaux : 40-70 €/ml — bon rapport qualité/prix ; (3) Grillage rigide 1,80 m + occultant PVC : 60-90 €/ml ; (4) Panneau rigide + gabion galet : 80-130 €/ml — esthétique moderne ; (5) Clôture composite ou PVC plein : 70-120 €/ml ; (6) Claustra bois (pin autoclave ou exotique) : 80-150 €/ml ; (7) Mur parpaing 1,80 m enduit 2 faces : 150-250 €/ml — pérenne ; (8) Mur pierre apparente traditionnel : 300-600 €/ml — patrimoine. Poteaux béton inclus : +15-30 €/ml. Portail + portillon : 800-3 500 € supplémentaire (battant 2 vantaux 3 m ou coulissant 4 m, motorisé +400-800 €). Terrassement terrain rocheux : +30-80 €/ml.',
  },
  {
    question: 'Quelles distances respecter pour une haie, un arbre, une clôture ?',
    answer:
      'Règles art. 671-672 Code civil (sauf usage local contraire) : (1) HAIES ou arbres >2 m de hauteur : plantation à 2 m minimum de la limite séparative ; (2) Haies ou arbres ≤2 m : plantation à 0,50 m minimum de la limite ; (3) Voisin peut exiger arrachage ou réduction à hauteur légale si non-respect (art. 672), prescription 30 ans usage paisible ; (4) Élagage obligatoire : propriétaire d’un arbre taille branches qui surplombent chez voisin SI branches dépassent (voisin ne peut pas couper lui-même, art. 673) mais voisin peut couper racines qui pénètrent chez lui ; (5) CLÔTURE sur limite = mitoyenne (art. 653), 50 cm d’axe minimum si privative sauf règle locale ; (6) FOSSÉ : 50 cm minimum de la limite (art. 666) ; (7) FOUILLE/BÂTIMENT profond : 0,50 m distance mini ou contigu + étaiement (art. 674). Litige = conciliation mairie, médiation, puis tribunal judiciaire. Conserver photos, constats, cadastre à jour.',
  },
]

const sources = [
  {
    label: 'Art. 663 Code civil — Hauteur clôture',
    url: 'https://www.legifrance.gouv.fr',
  },
  { label: 'Art. R421-12 Code urba. — DP clôture', url: 'https://www.legifrance.gouv.fr' },
  { label: 'Art. 653-672 Code civil — Mitoyenneté', url: 'https://www.legifrance.gouv.fr' },
  { label: 'Géoportail Urbanisme — PLU', url: 'https://www.geoportail-urbanisme.gouv.fr' },
  { label: 'Service-public — Clôture jardin', url: 'https://www.service-public.fr' },
]

const relatedGuides = [
  { label: 'Déclaration préalable travaux', href: '/guides/declaration-prealable-travaux' },
  { label: 'Permis construire', href: '/guides/permis-construire' },
  { label: 'Terrasse bois composite prix m²', href: '/guides/terrasse-bois-composite-prix-m2' },
  { label: 'Taxe aménagement calcul 2026', href: '/guides/taxe-amenagement-calcul-2026' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Extérieur',
    keywords: [
      'clôture jardin hauteur',
      'réglementation clôture PLU',
      'mitoyenneté clôture',
      'prix clôture m linéaire',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Clôture jardin', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Clôture jardin' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <LandPlot className="w-3.5 h-3.5" aria-hidden />
              Extérieur · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Clôture de jardin : règles et prix 2026
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Poser une clôture obéit à des règles strictes de hauteur (art. 663 Code civil), de
              déclaration préalable (PLU) et de mitoyenneté. Voici les règles 2026, les prix au
              mètre linéaire et les distances de plantation.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Prix clôtures posées 2026 au mètre linéaire</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Type de clôture</th>
                    <th className="p-3 border-b border-sand-200">Prix TTC/ml</th>
                    <th className="p-3 border-b border-sand-200">Durée vie</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Grillage simple torsadé', '20-40 €', '15-20 ans'],
                    ['Grillage rigide panneau', '40-70 €', '20-30 ans'],
                    ['Rigide + occultant PVC', '60-90 €', '15-20 ans'],
                    ['Claustra bois', '80-150 €', '10-20 ans'],
                    ['Gabion + panneaux', '80-130 €', '30+ ans'],
                    ['Mur parpaing enduit', '150-250 €', '50+ ans'],
                    ['Mur pierre apparente', '300-600 €', '100+ ans'],
                  ].map(([c, p, d]) => (
                    <tr key={c} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{c}</td>
                      <td className="p-3 font-semibold">{p}</td>
                      <td className="p-3">{d}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
              Trouver un maçon paysagiste <Phone className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
