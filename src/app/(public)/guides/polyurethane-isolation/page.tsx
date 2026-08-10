/**
 * /guides/polyurethane-isolation — Hub isolation polyuréthane
 *
 * @kw-primary    polyuréthane isolation
 * @kw-volume     700
 * @kw-kd         0
 * @kw-cpc        27
 * @cluster       5 (isolation thermique)
 * @intent        commercial + informational (matériau + prix + RGE)
 * @ahrefs-source docs/audit-ahrefs-2026-05-03/keyword_opportunities_2026-05.csv:15
 * @snapshot      2026-05-13 (chantier #12 KW commerciaux vague 2)
 *
 * Competitor sonergia rang 6. KD 0, CPC 27 € = bonne intent commercial.
 * Niche RGE direct — éligible CEE BAR-EN-101 + MaPrimeRénov’ Isolation.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { Layers, ArrowRight, AlertTriangle, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'polyurethane-isolation'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-05-13'
const MODIFIED = '2026-05-13'
const AUTHOR_NAME = 'Jean-Pierre Duval'

export const revalidate = 86400

const TITLE = 'Polyuréthane isolation 2026 : prix, performance et aides RGE'
const DESCRIPTION =
  'Polyuréthane isolation 2026 : panneau 15-30 €/m², mousse projetée 25-50 €/m². Lambda 0,022-0,028 W/m·K (meilleur isolant). MaPrimeRénov’ + CEE 30-60 €/m².'

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
    authors: [`${SITE_URL}/equipe/jean-pierre-duval`],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const tldr = [
  'Prix 2026 : panneau polyuréthane (PUR/PIR) 15-30 €/m² fourniture, mousse projetée 25-50 €/m² posé. Pose au m² panneau collé 25-40 €, vissé 35-60 €, projetée intervention 350-600 €/jour artisan.',
  'Performance lambda 0,022-0,028 W/m·K — meilleur conducteur isolant marché (1 cm PUR = 2 cm laine de verre). Idéal faible épaisseur (combles aménagés, murs intérieurs <8 cm dispo).',
  'Aides 2026 : CEE BAR-EN-101 ou BAR-EN-103 10-25 €/m² + TVA 5,5 % + éco-PTZ. MaPrimeRénov’ pour les murs uniquement en parcours d’ampleur (plus de forfait au geste depuis 2026 ; combles aménagés restent éligibles par geste).',
  'Mise en œuvre RGE QualiBat 7141 (isolation) ou QualiPAC obligatoire pour aides. Projection nécessite équipement spécifique (cabine haute pression + EPI).',
  'Atouts : compact, étanche à l’air, hydrofuge, durabilité 30-50 ans. Limites : produit synthétique non recyclable, classement feu B-s2-d0 inférieur laine de roche, prix x2 vs laine.',
]

const faqs = [
  {
    question: 'Quel prix au m² pour isoler au polyuréthane en 2026 ?',
    answer:
      'Prix 2026 par technique : (1) Panneau polyuréthane (PUR/PIR) — fourniture seule 15-30 €/m² selon épaisseur (60-120 mm) et marque (Recticel Eurothane, IsoPolyU Soprema, Knauf PolyPlus). (2) Pose panneau collé sur mur intérieur sain : 25-40 €/m² posé. (3) Pose panneau vissé sur ossature (combles, murs irréguliers) : 35-60 €/m². (4) Mousse polyuréthane projetée — 25-50 €/m² posé (équipement haute pression nécessite intervention pro spécialisée, forfait journée 350-600 € artisan). (5) Polyuréthane sous chape (PUR rigide 30-50 mm) : 30-45 €/m² posé. Pour 100 m² combles aménagés : 2 500-6 000 € TTC selon technique. TVA 5,5 % si artisan RGE QualiBat 7141, sinon 10 % ou 20 %.',
  },
  {
    question: 'Pourquoi le polyuréthane est-il le meilleur isolant thermique ?',
    answer:
      'Performance thermique mesurée : (1) Lambda polyuréthane (PUR/PIR) : 0,022-0,028 W/m·K — meilleur conducteur isolant produit industriellement, devant la laine minérale (0,032-0,040), le polystyrène (0,032-0,038), la fibre de bois (0,036-0,042). (2) Coefficient R pour 100 mm PUR (lambda 0,024) : R = 4,17 m²·K/W, dépasse seuil RT 2012 (R ≥ 4 pour ITI murs). (3) Équivalence : 100 mm de PUR = 140 mm de laine de verre = 180 mm de polystyrène pour atteindre même R. (4) Avantage critique : faible épaisseur — gain 4-8 cm de surface habitable vs autres isolants. (5) Étanchéité air et eau : mousse projetée crée barrière continue sans pont thermique, parfait pour combles aménagés avec géométrie complexe. Limites : produit pétrochimique, énergie grise élevée, classement feu B-s2-d0 (inférieur A1 laine de roche), recyclabilité limitée.',
  },
  {
    question: 'Polyuréthane éligible MaPrimeRénov’ et CEE en 2026 ?',
    answer:
      'Éligibilité aides 2026 : (1) MaPrimeRénov’ : l’isolation des murs par l’intérieur (ITI) n’est plus financée par geste depuis 2026 — uniquement en rénovation d’ampleur (parcours accompagné) ; au geste, les murs restent aidés via CEE (Coup de pouce), TVA 5,5 % et éco-PTZ. Conditions techniques inchangées : R ≥ 3,7 m²·K/W mur, R ≥ 6,0 m²·K/W combles aménagés. (2) CEE BAR-EN-101 « Isolation murs intérieurs » : 10-25 €/m² selon fournisseur (Effy, TotalEnergies, EDF). Conditions identiques R + RGE QualiBat 7141. (3) CEE BAR-EN-103 « Isolation combles aménagés » : 12-30 €/m² (plus généreux que mur). (4) Coup de pouce Isolation (jusqu’en 2025, renouvellement 2026 en cours) : 10-30 €/m² supplémentaire ménage modeste/très modeste. (5) TVA 5,5 % sur fourniture + pose si artisan RGE QualiBat 7141 isolation. (6) Éco-PTZ 30 000 € sur 15 ans sans intérêts. Cumul CEE + TVA réduite + éco-PTZ possible ; MaPrimeRénov’ pour les murs uniquement en parcours d’ampleur.',
  },
  {
    question: 'Quelle qualification RGE pour poser du polyuréthane ?',
    answer:
      'Qualifications RGE 2026 valides : (1) QualiBat 7141 « Isolation thermique par l’intérieur » — qualification de référence isolation murs intérieurs. Artisan validé travaux ITI avec polyuréthane, laine, ouate cellulose. (2) QualiBat 7142 « Isolation par l’extérieur » (ITE) — pour pose panneaux PUR sous bardage ou enduit. (3) Qualibat 8511 « Isolation acoustique » — possible si bouquet phonique. (4) RGE Éco Artisan (Capeb) ou RGE Pros de la Performance Énergétique (FFB) : équivalents généralistes incluant isolation. (5) Mousse polyuréthane projetée : exige aussi formation fabricant (Isocell, Synthesia) en plus du RGE. Vérification RGE : (a) france-renov.gouv.fr, saisir SIRET ; (b) demander attestation RGE en cours de validité (renouvellement annuel) ; (c) vérifier que la mention RGE couvre la technique exacte (panneau OU projection). Sans RGE valide = AUCUNE aide.',
  },
  {
    question: 'Polyuréthane ou laine minérale : que choisir ?',
    answer:
      'Arbitrage selon cas : (1) POLYURÉTHANE recommandé pour : (a) combles aménagés à faible hauteur sous toit (gain 4-8 cm sous rampants), (b) ITI mur intérieur appartement <8 cm libre, (c) isolation sous chape neuve ou rénovation, (d) chantier humide (cave semi-enterrée, sous-sol). Atouts : lambda imbattable, étanchéité, durabilité. (2) LAINE MINÉRALE (roche/verre) recommandée pour : (a) combles perdus à isoler à plat (laine soufflée ouate ou roche, 10-25 €/m²), (b) cloisons phoniques mitoyennes, (c) toiture en sarking, (d) tous chantiers ayant besoin résistance feu A1, (e) budget contraint. Atouts : 2-3× moins cher, recyclable, ininflammable A1, isolation phonique combinée. (3) Comparatif 100 m² combles aménagés rénov : polyuréthane 4 500-7 500 € TTC vs laine de roche 2 500-4 500 € TTC, mais polyuréthane gagne 4 cm de hauteur sous plafond = 4 m³ habitable supplémentaire. (4) Conseil ServicesArtisans : polyuréthane si contrainte épaisseur ou chantier complexe géométriquement, laine minérale pour 80 % des autres cas.',
  },
]

const sources = [
  { label: 'ADEME — Isolation thermique', url: 'https://www.ademe.fr' },
  {
    label: 'France-Rénov’ — MaPrimeRénov’ Isolation',
    url: 'https://france-renov.gouv.fr',
  },
  { label: 'CSTB — Performance isolants', url: 'https://www.cstb.fr' },
  { label: 'NF EN 13165 — Polyuréthane bâtiment', url: 'https://www.afnor.org' },
]

const relatedGuides = [
  {
    label: 'Aide isolation maison propriétaire',
    href: '/guides/aide-isolation-maison-proprietaire',
  },
  { label: 'Aménagement combles perdus prix', href: '/guides/amenagement-combles-perdus-prix' },
  { label: 'Isolant phonique mur', href: '/guides/isolant-phonique-mur' },
  {
    label: 'CEE certificats économies énergie 2026',
    href: '/guides/cee-certificats-economies-energie-2026',
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
    section: 'Isolation thermique',
    keywords: [
      'polyuréthane isolation',
      'PUR isolation',
      'mousse polyuréthane projetée',
      'panneau polyuréthane PIR',
      'isolation combles polyuréthane',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Polyuréthane isolation', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Polyuréthane isolation' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Layers className="w-3.5 h-3.5" aria-hidden />
              Isolation thermique · Guide vérifié
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Polyuréthane isolation 2026 : prix, performance et aides RGE
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Le polyuréthane (PUR/PIR) est le meilleur isolant thermique du marché par sa
              conductivité lambda 0,022-0,028 W/m·K. Voici les prix 2026, la performance comparée à
              la laine, les conditions d’éligibilité MaPrimeRénov’ et la qualification RGE QualiBat
              7141 obligatoire.
            </p>
          </header>

          <TldrBlock bullets={tldr} />

          <section className="bg-white border border-sand-300 rounded-2xl shadow-soft p-6 my-8">
            <h2 className="font-heading text-2xl font-bold text-sand-900 mb-4 flex items-center gap-2">
              <Layers className="w-6 h-6 text-primary-500" aria-hidden />
              Performance polyuréthane vs autres isolants
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border border-sand-300 rounded-lg">
                <thead className="bg-primary-50">
                  <tr>
                    <th className="text-left px-3 py-2 text-charcoal-900">Isolant</th>
                    <th className="text-left px-3 py-2 text-charcoal-900">Lambda W/m·K</th>
                    <th className="text-left px-3 py-2 text-charcoal-900">Épaisseur R 4</th>
                    <th className="text-left px-3 py-2 text-charcoal-900">Prix posé €/m²</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-200">
                  <tr className="bg-accent-50/50">
                    <td className="px-3 py-2 font-semibold">Polyuréthane (PUR/PIR)</td>
                    <td className="px-3 py-2">0,022-0,028</td>
                    <td className="px-3 py-2">90-110 mm</td>
                    <td className="px-3 py-2">25-50 €</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2">Polystyrène extrudé (XPS)</td>
                    <td className="px-3 py-2">0,032-0,038</td>
                    <td className="px-3 py-2">130-150 mm</td>
                    <td className="px-3 py-2">20-35 €</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2">Laine de roche</td>
                    <td className="px-3 py-2">0,034-0,040</td>
                    <td className="px-3 py-2">135-160 mm</td>
                    <td className="px-3 py-2">15-30 €</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2">Laine de verre</td>
                    <td className="px-3 py-2">0,032-0,040</td>
                    <td className="px-3 py-2">130-160 mm</td>
                    <td className="px-3 py-2">10-25 €</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2">Fibre de bois</td>
                    <td className="px-3 py-2">0,036-0,042</td>
                    <td className="px-3 py-2">145-170 mm</td>
                    <td className="px-3 py-2">30-50 €</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-charcoal-500 mt-3">
              Sources : CSTB, ADEME, fiches techniques fabricants (Recticel, Soprema, Knauf,
              Rockwool, Isover).
            </p>
          </section>

          <aside className="bg-accent-50 border border-accent-200 rounded-2xl p-6 my-8">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-accent-700 flex-shrink-0" aria-hidden />
              <div>
                <h3 className="font-heading text-lg font-bold text-accent-900 mb-2">
                  RGE QualiBat 7141 obligatoire pour aides
                </h3>
                <p className="text-accent-800 leading-relaxed">
                  Sans artisan RGE QualiBat 7141 (isolation par l’intérieur), AUCUNE aide
                  MaPrimeRénov’, CEE, TVA 5,5 % ne s’applique. Vérifier la qualification sur{' '}
                  <a
                    className="underline font-medium"
                    href="https://france-renov.gouv.fr"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    france-renov.gouv.fr
                  </a>{' '}
                  avant signature du devis.
                </p>
              </div>
            </div>
          </aside>

          <FlagshipFaq items={faqs} />
          <FlagshipAuthorCard
            authorName={AUTHOR_NAME}
            datePublished={PUBLISHED}
            dateModified={MODIFIED}
          />
          <FlagshipSources sources={sources} />

          <section className="bg-primary-500 text-white rounded-2xl p-8 my-12 text-center">
            <h2 className="font-heading text-2xl md:text-3xl font-bold mb-4">
              Devis polyuréthane par un artisan RGE QualiBat
            </h2>
            <p className="text-primary-50 mb-6">
              Devis gratuit en 24 h auprès d’isolateurs RGE QualiBat 7141 près de chez vous.
            </p>
            <Link
              href="/devis"
              className="inline-flex items-center gap-2 bg-white text-primary-600 font-bold px-6 py-3 rounded-xl hover:bg-sand-50 transition-colors"
            >
              <Phone className="w-5 h-5" />
              Demander un devis gratuit
              <ArrowRight className="w-5 h-5" />
            </Link>
          </section>

          <section className="my-12">
            <h2 className="font-heading text-2xl font-bold text-sand-900 mb-4">
              Guides complémentaires
            </h2>
            <ul className="grid gap-3 md:grid-cols-2">
              {relatedGuides.map((g) => (
                <li key={g.href}>
                  <Link
                    href={g.href}
                    className="block bg-white border border-sand-300 rounded-xl p-4 hover:border-primary-300 hover:shadow-card-hover transition-all"
                  >
                    <span className="font-medium text-charcoal-900">{g.label}</span>
                    <ArrowRight className="inline-block w-4 h-4 ml-2 text-primary-500" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </>
  )
}
