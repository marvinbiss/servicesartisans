/**
 * /guides/chauffe-eau-thermodynamique-prix — Hub CET (Pilier 2).
 *
 * @kw-primary    prix chauffe-eau thermodynamique
 * @kw-volume     700
 * @kw-kd         0
 * @kw-cpc        46
 * @cluster       4 (chauffe-eau / ECS)
 * @intent        transactional pur (prix)
 * @ahrefs-source docs/audit-ahrefs-2026-05-03/keyword_opportunities_2026-05.csv:14
 * @snapshot      2026-05-13 (chantier #10 KW commerciaux)
 *
 * Sonergia rang 7 sur ce KW = striking distance. KD 0 = peu de défense
 * concurrentielle. CPC 46 € = bonne intent commercial.
 */
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

const SLUG = 'chauffe-eau-thermodynamique-prix'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Jean-Pierre Duval'

export const revalidate = 86400

// Title optimisé KW exact "prix chauffe-eau thermodynamique" (700 vol, KD 0,
// CPC 46 €). Sonergia rang 7 = striking distance. Préfixe "Prix" en tête.
const TITLE = 'Prix chauffe-eau thermodynamique 2026 : tarifs + aides'
const DESCRIPTION =
  'Chauffe-eau thermodynamique 2026 : 2 200-4 500 € TTC posé, COP 2,5-3,8. MaPrimeRénov’ 400-1 200 €, CEE 150-600 €, TVA 5,5 %. Comparatif vs électrique.'

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
  'Prix 2026 TTC posé : CET 200L 2 200-3 200 €, 270L 2 800-4 000 €, 300L 3 500-4 500 €. Coût horaire pose 400-800 €.',
  'Principe : pompe à chaleur intégrée qui capte calories air ambiant (sous-sol, garage, buanderie) pour chauffer l’eau. COP 2,5-3,8 vs 1 électrique.',
  'Économie annuelle vs chauffe-eau électrique : 200-500 € par an. Amortissement 4-8 ans selon aides mobilisées.',
  'Aides 2026 : MaPrimeRénov’ 400-1 200 € + CEE 150-600 € + TVA 5,5 % = reste à charge 1 500-3 000 €.',
  'Installation Module A RGE QualiPAC obligatoire pour aides. Volume minimum recommandé 200 L maison 1-3 personnes, 300 L 4+ personnes.',
]

const faqs = [
  {
    question: 'Combien coûte un chauffe-eau thermodynamique installé en 2026 ?',
    answer:
      'Prix moyens observés marché : (1) CET 200L entrée de gamme (marque chinoise reconditionnée, Atlantic Calypso 200L) : 2 200-3 200 € TTC posé ; (2) CET 270L milieu de gamme (Thermor Aéromax 270L, Atlantic Explorer) : 2 800-4 000 € TTC ; (3) CET 300L haut de gamme (Atlantic Odyssée, De Dietrich Kaliko) : 3 500-4 500 € TTC ; (4) CET split 200-300L (compresseur extérieur, plus silencieux) : 4 000-6 000 € TTC. Pose 400-800 € selon complexité (raccordement électrique, évacuation condensats, ventilation local, remplacement ancien ballon). Garantie cuve 5-7 ans, pièces 2 ans, COP certifié NF EN 16147.',
  },
  {
    question: 'Quelles aides disponibles en 2026 pour un CET ?',
    answer:
      "Cumul d'aides possible : (1) MaPrimeRénov' parcours par geste (module A) : 400 € (supérieurs rose), 600 € (intermédiaires violet), 800 € (modestes jaune), 1 200 € (très modestes bleu) ; (2) Coup de pouce CEE chauffage : 150-600 € selon revenus + fournisseur (EDF, TotalEnergies, Auchan Énergies) ; (3) TVA 5,5 % sur pose + matériel (logement >2 ans) = économie 15-20 % vs TVA 20 % ; (4) Éco-PTZ possible 7 000 € sur 15 ans sans intérêts ; (5) Aides locales régionales/départementales 100-500 € selon zone. Total aides max ménage très modeste : 1 800 € (MPR 1 200 + CEE 600), reste à charge 1 000-2 000 € TTC.",
  },
  {
    question: 'Où installer un CET dans mon logement ?',
    answer:
      "Règles techniques impératives : (1) Volume local minimum 20 m³ air (sinon COP s'effondre) OU installation type « split » avec unité extérieure (COP préservé) ; (2) Température ambiante 5-35°C toute l'année — local non chauffé idéal (sous-sol semi-enterré, garage, buanderie, cellier). PROSCRIRE : salon, chambre, cuisine, pièces de vie (trop chaudes + bruit) ; (3) Distance minimum 20 cm entre appareil et mur + 50 cm au-dessus ; (4) Évacuation condensats (tuyau PVC ø20 vers écoulement) ; (5) Prise électrique 16 A dédiée. Dans une maison < 100 m² sans sous-sol : split en extérieur recommandé. Coût supplémentaire 500-1 000 € mais COP 3,5+ vs 2,5 monobloc mal placé.",
  },
  {
    question: 'Quelles économies vs chauffe-eau électrique classique ?',
    answer:
      "Comparaison 4 personnes, 200L ECS/jour, EDF tarif base 0,25 €/kWh en 2025 : (1) Chauffe-eau électrique standard (COP 1) : consommation 3 500 kWh/an = 875 €/an ; (2) CET COP 3 : consommation 1 170 kWh/an = 293 €/an, soit économie 582 €/an ; (3) CET COP 3,8 (haut de gamme) : consommation 920 kWh/an = 230 €/an, économie 645 €/an. Amortissement investissement : avec reste à charge 2 000 € après aides et économie 500 €/an moyenne = 4 ans. Durée vie CET 15-20 ans vs 10-15 ans chauffe-eau électrique. Gain financier cumulé sur durée vie : 5 000-10 000 €. Bonus écologique : -50 % d'émissions CO2 vs électrique.",
  },
  {
    question: 'Un artisan non QualiPAC peut-il installer un CET ?',
    answer:
      'Techniquement oui, mais en pratique non. Qualifications : (1) CET est un équipement PAC (dépend module A du QualiPAC) — installation par artisan RGE QualiPAC OBLIGATOIRE pour bénéficier des aides MPR + CEE + TVA 5,5 %. Sans RGE : aucune aide, facture au prix fort ; (2) Artisan non QualiPAC : installation possible mais responsabilité pleine en cas malfaçon, absence de garantie fabricant sur COP réel, refus assurance décennale si problème. Coût comparable sans RGE (pas de remise aides) = 3 000-5 000 € perdus. Vérification RGE avant signature : france-renov.gouv.fr, saisir SIRET, confirmer module A QualiPAC actif. Alternative pour CET basique <300L : certains artisans Qualibat 7131 chauffage suffisent, vérifier sous-réserve RGE module B dédiée si bouquet.',
  },
]

const sources = [
  { label: 'ADEME — Chauffe-eau thermodynamique', url: 'https://www.ademe.fr' },
  {
    label: 'France-Rénov’ — CET aides',
    url: 'https://france-renov.gouv.fr',
  },
  { label: 'Qualit’EnR — QualiPAC', url: 'https://www.qualit-enr.org' },
  { label: 'NF EN 16147 — Performance CET', url: 'https://www.afnor.org' },
]

const relatedGuides = [
  { label: 'Pompe à chaleur guide complet', href: '/guides/pompe-a-chaleur' },
  {
    label: 'Installation pompe à chaleur étapes',
    href: '/guides/installation-pompe-chaleur-etapes',
  },
  { label: 'Prix pompe à chaleur air-eau', href: '/guides/prix-pompe-chaleur-air-eau-installee' },
  { label: 'QualiPAC signification', href: '/guides/qualipac-signification-obtenir' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Prix & tarifs',
    keywords: [
      'chauffe-eau thermodynamique prix',
      'CET 200L prix 2026',
      'MaPrimeRénov CET',
      'chauffe-eau thermodynamique aides',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Chauffe-eau thermodynamique', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Chauffe-eau thermodynamique' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Droplet className="w-3.5 h-3.5" aria-hidden />
              Prix & tarifs · Guide vérifié
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Prix chauffe-eau thermodynamique 2026 : tarifs posé + aides
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Un chauffe-eau thermodynamique (CET) divise par 3 la consommation d’eau chaude
              sanitaire vs électrique classique. Voici les prix 2026, les aides cumulables
              (MaPrimeRénov’ + CEE + TVA 5,5 %) et l’amortissement réel sur 4-8 ans.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Prix CET selon volume en 2026</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Volume</th>
                    <th className="p-3 border-b border-sand-200">Prix posé TTC</th>
                    <th className="p-3 border-b border-sand-200">Foyer recommandé</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['150 L', '1 800-2 500 €', '1-2 personnes'],
                    ['200 L', '2 200-3 200 €', '2-3 personnes'],
                    ['270 L', '2 800-4 000 €', '3-4 personnes'],
                    ['300 L', '3 500-4 500 €', '4-5 personnes'],
                    ['Split 200-300 L', '4 000-6 000 €', 'Zone sans sous-sol'],
                  ].map(([v, p, f]) => (
                    <tr key={v} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{v}</td>
                      <td className="p-3 font-semibold">{p}</td>
                      <td className="p-3">{f}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>Local 20 m³ minimum ou version split.</strong> CET monobloc en petit local =
                COP qui s’effondre à 1,5, économie annulée. Mesurer le volume local (L×l×h) avant de
                choisir. Si <strong>&lt;20 m³</strong> : split obligatoire, +500-1 000 €.
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
              href="/services/plombier"
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
