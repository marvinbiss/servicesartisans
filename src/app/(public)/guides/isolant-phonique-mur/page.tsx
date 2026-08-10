/**
 * /guides/isolant-phonique-mur — Hub isolation phonique mur
 *
 * @kw-primary    isolant phonique mur
 * @kw-volume     2300
 * @kw-kd         0
 * @kw-cpc        9
 * @cluster       7 (isolation acoustique)
 * @intent        commercial + informational (matériau + pose)
 * @ahrefs-source docs/audit-ahrefs-2026-05-03/keyword_opportunities_2026-05.csv:13
 * @snapshot      2026-05-13 (chantier #12 KW commerciaux vague 2)
 *
 * Competitor sonergia rang 9. KD 0 = peu de défense d'autorité.
 * Niche RGE indirect — isolation acoustique pas couverte par CEE.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { Volume2, ArrowRight, AlertTriangle, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'isolant-phonique-mur'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-05-13'
const MODIFIED = '2026-05-13'
const AUTHOR_NAME = 'Jean-Pierre Duval'

export const revalidate = 86400

const TITLE = 'Isolant phonique mur 2026 : prix, matériaux et pose mitoyen'
const DESCRIPTION =
  'Isolant phonique mur 2026 : laine de roche 15-30 €/m², liège 50-80 €/m², plaque phonique 25-45 €/m². Pose 30-80 €/m². Gain acoustique 8-25 dB.'

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
  'Prix matériaux 2026 (au m²) : laine de roche 15-30 €, laine de verre 8-20 €, liège expansé 50-80 €, plaque phonique (Placo Phonique, Knauf) 25-45 €, panneau composite (Acoustix, Tramico) 60-120 €.',
  'Pose 30-80 €/m² selon technique : doublage collé 30-50 €/m², ossature métallique + plaque 50-80 €/m², contre-cloison maçonnée 80-150 €/m². Forfait pièce 15 m² mur mitoyen : 700-1 800 € TTC.',
  'Gain acoustique réel : doublage simple +8-12 dB, doublage avec lame d’air +15-20 dB, double ossature désolidarisée +20-25 dB (cible mur mitoyen bruyant).',
  'PAS de CEE / MaPrimeRénov’ pour isolation acoustique (les aides énergie ciblent thermique uniquement). Crédits régionaux possibles si bouquet rénovation globale (ANAH).',
  'Réglementation copropriété : autorisation syndic pas obligatoire si isolation par l’intérieur côté votre logement, OBLIGATOIRE si modification mur porteur ou face extérieure.',
]

const faqs = [
  {
    question: 'Quel prix au m² pour isoler un mur phoniquement ?',
    answer:
      'Prix 2026 fourniture + pose au m² par solution : (1) Solution économique — doublage laine de verre/roche 45 mm + plaque BA13 phonique (Placo Phonique 12,5 mm) collé : 50-80 €/m² posé, gain 8-12 dB. (2) Solution standard — ossature métallique 70 mm + laine de roche 70 mm + plaque BA13 phonique double : 90-140 €/m² posé, gain 15-20 dB. (3) Solution premium — double ossature désolidarisée (rails Stil R 48 + Optima 50) + 2 couches laine + 2 plaques BA13 : 160-220 €/m² posé, gain 20-25 dB. (4) Liège expansé pur (haut de gamme écologique) : 80-130 €/m² posé. Pour un mur mitoyen typique 15 m² (3×5 m) : 750-3 300 € TTC selon solution. TVA 10 % si pose pro, 20 % si auto-installation.',
  },
  {
    question: 'Quel matériau isolant phonique mur choisir ?',
    answer:
      'Choix par cas d’usage : (1) Laine de roche (Rockwool, Isover) — 15-30 €/m², densité 35-70 kg/m³, lambda 0,035-0,040 W/m·K — meilleur rapport prix/performance, incombustible, ignifuge classement A1. Cible bruits aériens (voisins, télé). (2) Laine de verre — 8-20 €/m², légèrement moins performant que la roche, plus économique. Cible bruits aériens basiques. (3) Liège expansé — 50-80 €/m², 100 % écologique, durabilité 50+ ans, faible épaisseur 30-40 mm. Cible bruits impact + aériens, idéal salle de musique/home cinéma. (4) Plaque phonique BA13 (Placo Phonique, Knauf Diamant) — 25-45 €/m², se pose à la place d’une plaque standard, gain seul +3-5 dB, optimal en doublage avec laine derrière. (5) Panneau composite (Tramico, Acoustix) — 60-120 €/m², solution premium prêt-à-poser, gain mesuré jusqu’à 30 dB en double couche. Pour 95 % des cas : laine de roche 70 mm + plaque phonique 12,5 mm = meilleur compromis.',
  },
  {
    question: 'Combien de dB peut-on gagner avec une isolation phonique mur ?',
    answer:
      'Gains mesurés en laboratoire (norme EN ISO 717-1) selon technique : (1) Doublage simple collé (5 cm laine + BA13) : +8 à +12 dB. Cible : voisin avec télé/musique modérée. Résultat : conversation devient inaudible, télé reste perceptible. (2) Doublage ossature métallique + laine 70 mm + BA13 double : +15 à +20 dB. Cible : voisin bruyant régulier (fêtes, enfants, télé forte). Résultat : tous bruits aériens fortement atténués, restent vibrations sol. (3) Double ossature désolidarisée + 2 couches laine + 2 plaques BA13 : +20 à +25 dB. Cible : mur mitoyen problématique (voisin agressif, copropriété ancienne). Résultat : silence quasi-total bruits voisins, équivalent appartement neuf. (4) Liège expansé 40 mm seul : +6 à +10 dB sur impact, +8 à +12 dB sur aérien. PERCEPTION : chaque +10 dB = sensation de division par 2 du bruit. Un gain de +20 dB est ressenti comme « 4 fois plus silencieux ».',
  },
  {
    question: 'Y a-t-il des aides pour isolation phonique en 2026 ?',
    answer:
      'PAS d’aides nationales spécifiques pour isolation acoustique. Détail : (1) MaPrimeRénov’, CEE, TVA 5,5 % et Coup de Pouce → réservés isolation thermique uniquement (laine pour économie d’énergie). Isolation phonique pure NON éligible. (2) Exception : si l’isolation phonique mur est faite EN MÊME TEMPS qu’une isolation thermique par l’intérieur (ITI) avec performance thermique suffisante (R ≥ 3,7 m²·K/W), l’ensemble devient éligible via CEE (Coup de pouce), TVA 5,5 % et éco-PTZ — ou MaPrimeRénov’ en parcours d’ampleur (l’isolation des murs n’est plus financée par MaPrimeRénov’ au geste depuis 2026). CEE BAR-EN-101 : 10-25 €/m². (3) Aides régionales ponctuelles : Île-de-France « lutte contre nuisances sonores » (jusqu’à 50 % travaux plafond 5 000 €), certaines aides ANRU près des aéroports/autoroutes. (4) Crédit d’impôt copropriété ANAH si bouquet rénovation globale incluant acoustique : 50 % travaux plafond 25 000 €/logement. Conseil : combiner isolation phonique + thermique pour cumuler aides MPR + CEE.',
  },
  {
    question: 'Faut-il une autorisation copropriété pour isoler un mur phoniquement ?',
    answer:
      'Règles copropriété (loi 65-557, décret 67-223) : (1) PAS d’autorisation requise si isolation par L’INTÉRIEUR côté votre logement, sans toucher au mur porteur ni à la face extérieure visible. Vous êtes propriétaire de la couche peinture/tapisserie + 30-40 mm intérieur — au-delà = partie commune. (2) AUTORISATION syndic OBLIGATOIRE si : (a) modification mur porteur (perçage, scellement profond) — vote AG copropriété majorité absolue article 25, (b) modification façade extérieure (isolation extérieure) — vote majorité 2/3 article 26, (c) modification volume habitable (réduction surface logement >10 %) — peut nécessiter autorisation urbanisme. (3) DÉCLARATION simple (pas vote, juste notification au syndic) : isolation phonique standard par l’intérieur, doublage 70-100 mm, pas de modification structure. (4) Voisin du dessus/dessous : pas d’autorisation requise — vous n’agissez que sur VOTRE volume. (5) Conseil : envoyer une lettre recommandée AR au syndic avant travaux pour traçabilité, joindre devis et plans.',
  },
]

const sources = [
  { label: 'CSTB — Réglementation acoustique', url: 'https://www.cstb.fr' },
  {
    label: 'ADEME — Isolation acoustique',
    url: 'https://www.ademe.fr',
  },
  { label: 'NF EN ISO 717-1 — Mesure isolation sonore', url: 'https://www.afnor.org' },
  { label: 'ANAH — Aides rénovation copropriété', url: 'https://www.anah.fr' },
]

const relatedGuides = [
  {
    label: 'Aide isolation maison propriétaire',
    href: '/guides/aide-isolation-maison-proprietaire',
  },
  { label: 'Aménagement combles perdus prix', href: '/guides/amenagement-combles-perdus-prix' },
  { label: 'Polyuréthane isolation prix', href: '/guides/polyurethane-isolation' },
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
    section: 'Isolation acoustique',
    keywords: [
      'isolant phonique mur',
      'isolation phonique mitoyen',
      'laine de roche phonique',
      'plaque Placo Phonique',
      'isolation acoustique voisin',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Isolant phonique mur', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Isolant phonique mur' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Volume2 className="w-3.5 h-3.5" aria-hidden />
              Isolation acoustique · Guide vérifié
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Isolant phonique mur 2026 : prix, matériaux et pose mitoyen
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              L’isolation phonique d’un mur mitoyen fait gagner 8 à 25 dB selon la technique
              choisie. Voici les prix 2026 des matériaux (laine de roche, plaque phonique, liège),
              les solutions de pose par budget et les règles copropriété à respecter.
            </p>
          </header>

          <TldrBlock bullets={tldr} />

          <section className="bg-white border border-sand-300 rounded-2xl shadow-soft p-6 my-8">
            <h2 className="font-heading text-2xl font-bold text-sand-900 mb-4 flex items-center gap-2">
              <Volume2 className="w-6 h-6 text-primary-500" aria-hidden />4 solutions par budget et
              gain acoustique
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border border-sand-300 rounded-lg">
                <thead className="bg-primary-50">
                  <tr>
                    <th className="text-left px-3 py-2 text-charcoal-900">Solution</th>
                    <th className="text-left px-3 py-2 text-charcoal-900">Prix posé €/m²</th>
                    <th className="text-left px-3 py-2 text-charcoal-900">Gain dB</th>
                    <th className="text-left px-3 py-2 text-charcoal-900">Mur 15 m²</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-200">
                  <tr>
                    <td className="px-3 py-2">Doublage collé (laine + BA13)</td>
                    <td className="px-3 py-2">50-80 €</td>
                    <td className="px-3 py-2">+8 à +12</td>
                    <td className="px-3 py-2">750-1 200 €</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2">Ossature métal + laine 70 mm</td>
                    <td className="px-3 py-2">90-140 €</td>
                    <td className="px-3 py-2">+15 à +20</td>
                    <td className="px-3 py-2">1 350-2 100 €</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2">Double ossature désolidarisée</td>
                    <td className="px-3 py-2">160-220 €</td>
                    <td className="px-3 py-2">+20 à +25</td>
                    <td className="px-3 py-2">2 400-3 300 €</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2">Liège expansé 40 mm</td>
                    <td className="px-3 py-2">80-130 €</td>
                    <td className="px-3 py-2">+8 à +12</td>
                    <td className="px-3 py-2">1 200-1 950 €</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-charcoal-500 mt-3">
              Sources : CSTB, ADEME, devis observés artisans plaquistes RGE ServicesArtisans.
            </p>
          </section>

          <aside className="bg-accent-50 border border-accent-200 rounded-2xl p-6 my-8">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-accent-700 flex-shrink-0" aria-hidden />
              <div>
                <h3 className="font-heading text-lg font-bold text-accent-900 mb-2">
                  Astuce : combiner phonique + thermique pour cumuler aides
                </h3>
                <p className="text-accent-800 leading-relaxed">
                  L’isolation phonique pure n’est PAS éligible MaPrimeRénov’ / CEE. Si vous prévoyez
                  une <strong>isolation thermique par l’intérieur (ITI)</strong> avec R ≥ 3,7
                  m²·K/W, l’ensemble reste aidé via CEE (Coup de pouce), TVA 5,5 % et éco-PTZ — ou
                  MaPrimeRénov’ en parcours d’ampleur (l’isolation des murs n’est plus financée par
                  MaPrimeRénov’ au geste depuis 2026). CEE BAR-EN-101 : 10-25 €/m².
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
              Devis isolation phonique par un plaquiste RGE
            </h2>
            <p className="text-primary-50 mb-6">
              Devis gratuit en 24 h auprès de plaquistes et isolateurs vérifiés près de chez vous.
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
