import type { Metadata } from 'next'
import Link from 'next/link'
import { Trees, ArrowRight, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'terrasse-bois-composite-prix-m2'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Thomas Bernard'
const AUTHOR_SLUG = 'thomas-bernard'

export const revalidate = 86400

const TITLE = 'Terrasse bois ou composite : prix au m², pose 2026'
const DESCRIPTION =
  'Terrasse bois/composite 2026 : prix 80-250 € TTC/m² posée, pin autoclave/exotique/composite, structure lambourdes aluminium, DTU 51.4, déclaration préalable >5 m² ou surélevée.'

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
  'Prix 2026 TTC posée au m² : pin autoclave 80-120 €, pin Douglas 100-140 €, exotique (ipé, teck) 160-250 €, composite 130-200 €.',
  'DTU 51.4 (norme terrasse bois extérieur) : lambourdes minimum 25 cm entraxe, ventilation sous-face, fixation inox A4, pente 1-2 %.',
  'Déclaration préalable travaux mairie si >5 m² ou surélevée >60 cm (art. R421-17 Code urba). >20 m² = permis construire.',
  'Taxe aménagement due sur terrasse surélevée couverte (art. L331-7 Code urba) : ~0-40 €/m² selon commune.',
  'Garantie décennale si réalisée par pro (art. 1792). Durée vie : composite 20-30 ans, exotique 25-35 ans, pin autoclave 10-15 ans.',
]

const faqs = [
  {
    question: 'Quel prix au m² pour une terrasse bois ou composite en 2026 ?',
    answer:
      'Prix 2026 TTC posée fourniture + pose (hors terrassement) : (1) Pin autoclave classe 4 français/européen : 80-120 €/m² — solution économique, entretien bi-annuel (saturateur 20 €/m²/tous les 2 ans), durée vie 10-15 ans ; (2) Pin Douglas/Mélèze (résineux naturellement imputrescibles) : 100-140 €/m² ; (3) Bois exotique ipé, cumaru, teck : 160-250 €/m² — haut de gamme, durée vie 25-35 ans, entretien minimal (facultatif). Attention origine certifiée FSC/PEFC obligatoire sinon déforestation illégale ; (4) Composite (WPC bois + polymère) : 130-200 €/m² — pas d’entretien, anti-tache, anti-glissance, durée vie 20-30 ans, garantie fabricant 20-25 ans (Silvadec, UPM) ; (5) Terrasse sur plots béton (DIY) : -30-40 % vs dalle maçonnée. Terrasse sur structure acier galvanisé surélevée 50 cm : +50-100 €/m². Terrassement + préparation sol : 30-80 €/m² supplémentaires si besoin.',
  },
  {
    question: 'Terrasse bois ou composite : que choisir ?',
    answer:
      'Comparatif 2026 : BOIS EXOTIQUE (ipé, cumaru) = esthétique inégalée + durée vie 25-35 ans + résistance climat + valorisation patrimoine MAIS cher 160-250 €/m² + origine à vérifier (FSC/PEFC strict) + entretien modéré (grisaille naturelle sauf saturateur annuel 25 €/m²). BOIS AUTOCLAVE pin/douglas = économique 80-140 €/m² + ressource locale + aspect naturel MAIS durée vie courte 10-15 ans + entretien annuel obligatoire (sauf douglas/mélèze bruts) + risque échardes + poids important. COMPOSITE (WPC) = pas d’entretien + anti-glissance + anti-tache + durée vie 20-30 ans + garantie fabricant 20-25 ans MAIS chauffe en plein soleil (+10 à 15 °C vs bois) + aspect plastique (qualité cosmétique = variation forte) + recyclable partiel + prix intermédiaire 130-200 €/m². Règle : petit budget + bricoleur = pin autoclave ; usage intensif enfants/piscine = composite ; patrimoine + esthétique long terme = exotique certifié.',
  },
  {
    question: 'Faut-il une autorisation pour construire une terrasse ?',
    answer:
      'Selon surface et surélévation (art. R421-17 Code urba) : (1) Terrasse plain-pied (ou <60 cm) <5 m² : AUCUNE formalité ; (2) Terrasse plain-pied 5-20 m² ou surélevée >60 cm : DÉCLARATION PRÉALABLE DE TRAVAUX (DP) en mairie — dossier Cerfa 13703 + plan masse + coupe + photos + DP couleurs si PLU l’impose, délai instruction 1 mois ; (3) Terrasse >20 m² ou modifiant façade ou en zone classée ABF : PERMIS DE CONSTRUIRE (PC) — Cerfa 13406, 2-3 mois instruction ; (4) Terrasse couverte pergola fixe >5 m² : DP obligatoire, >20 m² permis construire ; (5) Zones PLU particulières (littoral, ZAC, secteur sauvegardé, PLU résidentiel strict) : consulter service urba mairie AVANT dépôt. Non-respect = PV infraction + régularisation ou démolition + amende 6 000 € (art. L480-4) + difficulté vente (mention non-conformité étude notaire).',
  },
  {
    question: 'Quelle structure sous la terrasse ?',
    answer:
      'Respect DTU 51.4 (novembre 2010, référence terrasse bois extérieur) : (1) Support SOLIDE indispensable — dalle béton (idéal), chape béton maigre, ou lit graviers compactés + géotextile anti-mauvaises herbes, pente 1-2 % vers l’extérieur pour évacuation eau ; (2) Lambourdes classe 4 ou aluminium préférable (inaltérable) — entraxe 40 cm maxi lames bois 145×27 mm, 50 cm maxi composite, 25 cm mini fin de rangée ; (3) Plots réglables PVC/caoutchouc pour lambourdes : hauteur 30-200 mm selon niveau sol, absorbe tolérances ; (4) Ventilation sous-face obligatoire (circulation air dessous pour éviter pourriture) : espace mini 50 mm entre sol et lambourdes ; (5) Fixation lames : vis inox A4 (pas A2) pour résistance corrosion en bord mer, clips invisibles composite, préperçage bois exotique obligatoire. Non-respect DTU = décennale compromise si sinistre + aucune assurance expert.',
  },
  {
    question: 'Quelles garanties et entretien pour une terrasse ?',
    answer:
      'Garanties (pose par artisan pro) : (1) Parfait achèvement 1 an (art. 1792-6) — vices apparents à la réception ; (2) Biennale 2 ans (art. 1792-3) — éléments d’équipement (fixations, plots) ; (3) Décennale 10 ans (art. 1792) — structure, lambourdes, inclinaison, pourriture prématurée. Obligation assurance pro (art. L241-1 Code assurances) ; (4) Garantie fabricant composite : 20-25 ans chez leaders (Silvadec garantie décoloration + pourriture + termites). Entretien selon matériau : PIN AUTOCLAVE = saturateur chaque 2 ans (300-500 € pour 30 m²) + nettoyage brosse + savon noir printemps ; DOUGLAS/MÉLÈZE = laisser griser naturellement ou saturateur optionnel annuel ; EXOTIQUE = saturateur spécial dégrisant huile de teck annuel (400-600 € 30 m²) ou grisaille acceptée ; COMPOSITE = rinçage eau haute pression annuel + savon noir tache grasse. Ne pas utiliser eau javelisée forte concentration (oxyde inox A4 à terme).',
  },
]

const sources = [
  {
    label: 'DTU 51.4 — Terrasse bois extérieur',
    url: 'https://www.cstb.fr',
  },
  { label: 'Art. R421-17 Code urba. — DP', url: 'https://www.legifrance.gouv.fr' },
  { label: 'Art. 1792 Code civil — Décennale', url: 'https://www.legifrance.gouv.fr' },
  { label: 'FSC France — Bois durable', url: 'https://fr.fsc.org' },
  { label: 'ADEME — Matériaux biosourcés', url: 'https://www.ademe.fr' },
]

const relatedGuides = [
  { label: 'Déclaration préalable travaux', href: '/guides/declaration-prealable-travaux' },
  { label: 'Permis construire', href: '/guides/permis-construire' },
  { label: 'Garantie décennale', href: '/guides/garantie-decennale' },
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
      'terrasse bois prix m2',
      'terrasse composite prix',
      'pose terrasse DTU 51.4',
      'déclaration préalable terrasse',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Terrasse bois/composite', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Terrasse bois/composite' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Trees className="w-3.5 h-3.5" aria-hidden />
              Extérieur · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Terrasse bois ou composite : prix au m² 2026
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Une terrasse bois ou composite coûte 80-250 € TTC/m² posée selon le matériau.
              Découvrez les prix 2026 par essence, les obligations DTU 51.4, l’urbanisme (DP ou
              permis) et l’entretien par type.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Prix terrasses posées 2026 au m²</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Matériau</th>
                    <th className="p-3 border-b border-sand-200">Prix TTC/m²</th>
                    <th className="p-3 border-b border-sand-200">Durée vie</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Pin autoclave classe 4', '80-120 €', '10-15 ans'],
                    ['Douglas / Mélèze', '100-140 €', '15-25 ans'],
                    ['Exotique (ipé, cumaru, teck)', '160-250 €', '25-35 ans'],
                    ['Composite (WPC)', '130-200 €', '20-30 ans'],
                  ].map(([m, p, d]) => (
                    <tr key={m} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{m}</td>
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
              href="/services/menuisier"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Trouver un menuisier terrassier <Phone className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
