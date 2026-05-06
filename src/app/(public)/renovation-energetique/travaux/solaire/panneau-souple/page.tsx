/**
 * Page : /renovation-energetique/travaux/solaire/panneau-souple
 *
 * @kw-primary    panneau solaire souple
 * @kw-volume     2100
 * @kw-kd         0
 * @kw-cpc        0.55
 * @cluster       2
 * @ahrefs-source docs/ahrefs-bloc1-keywords-gap-2026-05-04.md
 * @snapshot      2026-05-04 (Ahrefs Bloc 1 v3 — cluster solaire orphelin)
 * @backlog-item  Levier-E3-panneau-souple
 *
 * KW cibles (Ahrefs Bloc 1 v3, country=fr) :
 * - "panneau solaire souple"        → 2 100 vol, KD 0 ⭐⭐⭐ MEGA EASY WIN
 * - "panneau solaire flexible"      → ~700 vol estimé, KD 1
 * - "panneau solaire camping car"   → ~1 200 vol estimé, KD 2
 * - "panneau solaire bateau"        → ~500 vol estimé, KD 1
 * - Famille cumulée pivot : ~4 500 vol/mois
 *
 * Anti-cannibalisation :
 *   - Hub /travaux/solaire = installation résidentielle pro 3-9 kWc
 *   - /solaire/panneau-1000w (E2) = kit DIY autoconso résidentiel
 *   - Cette page = panneau solaire SOUPLE/FLEXIBLE (camping-car, voilier,
 *     mobil-home, hangar léger). Application MOBILE ou structure courbe,
 *     ≠ panneau cristallin classique.
 *
 * YMYL bas : pas d'aides publiques, pas de raccordement réseau.
 * Sécurité électrique limitée (12-24 V DC isolé).
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Sun,
  CheckCircle2,
  AlertTriangle,
  Caravan,
  Anchor,
  Battery,
  ShieldCheck,
} from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import LastUpdated from '@/components/seo/LastUpdated'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'

export const revalidate = 86400

const PAGE_PATH = '/renovation-energetique/travaux/solaire/panneau-souple'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'marc-lefebvre'
const AUTHOR_NAME = 'Marc Lefebvre'

const TITLE = 'Panneau solaire souple 2026 : prix, usage, durée'
const DESCRIPTION =
  'Panneau solaire souple 2026 : 100-500 € selon Wc. Camping-car, voilier, mobil-home. Rendement 6-9 % vs 18-22 % cristallin. Durée 5-10 ans.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: getAlternates(PAGE_PATH),
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
  'Panneau solaire souple = couche photovoltaïque amorphe ou monocristalline pliable, ~3-5 mm d’épaisseur, ~2-4 kg.',
  'Usage principal : camping-car (60 % des ventes), voilier, mobil-home, hangar léger, bâche tente, secours mobile.',
  'Prix 2026 : 100-150 € (50-100 Wc), 250-380 € (150-200 Wc), 400-600 € (250-300 Wc) — TTC, hors régulateur.',
  'Rendement réel 6-9 % (amorphe) à 14-17 % (mono flex haut de gamme) vs 18-22 % cristallin rigide. Surface 2-3× plus grande à puissance égale.',
  'Durée de vie : 5 à 10 ans (vs 25 ans cristallin rigide). Garantie fabricant typique 2-5 ans.',
  'Branchement : régulateur MPPT 12 V/24 V + batterie de service. Pas de raccordement réseau, pas d’aide publique.',
]

const USAGES = [
  {
    use: 'Camping-car / fourgon aménagé',
    desc: 'Toit courbe ou plat, fixation par colle MS ou Velcro fort. Permet d’alimenter frigo 12 V, éclairage LED, pompe à eau, chargeur portable.',
    pwr: '100-300 Wc typique',
  },
  {
    use: 'Voilier / bateau de plaisance',
    desc: 'Pont, bimini, dodger. Résiste aux UV et embruns (modèles « marine grade »). Idéal autonomie 1-3 jours mouillage.',
    pwr: '50-200 Wc typique',
  },
  {
    use: 'Mobil-home / résidence mobile',
    desc: 'Toiture courbe ou métallique. Alimentation TV, frigo. Fixation collée pour préserver l’étanchéité.',
    pwr: '100-200 Wc typique',
  },
  {
    use: 'Hangar léger / serre / bâche',
    desc: 'Toitures fragiles ne pouvant porter cristallin rigide. Production saisonnière éclairage et ventilateurs.',
    pwr: '100-500 Wc typique',
  },
  {
    use: 'Tente / sac à dos / random',
    desc: 'Rouleau pliable, ultra-léger 1-2 kg. Charge téléphone, GPS, lampe. Production 50-100 Wh/jour.',
    pwr: '20-100 Wc typique',
  },
]

const COMPARATIF_TYPES = [
  {
    type: 'Souple amorphe (a-Si)',
    rendement: '6-9 %',
    duree: '5-7 ans',
    prix: '~3-4 €/Wc',
    note: 'Bas de gamme, gros volume. Bon en lumière diffuse mais perte rapide après 3-5 ans.',
  },
  {
    type: 'Souple monocristallin ETFE (Sunpower flex, Solbian, Enecom)',
    rendement: '14-17 %',
    duree: '8-10 ans',
    prix: '~5-7 €/Wc',
    note: 'Haut de gamme. Couche ETFE haute résistance UV + sel. Rendement très proche cristallin.',
  },
  {
    type: 'Cristallin rigide (référence comparaison)',
    rendement: '18-22 %',
    duree: '25 ans',
    prix: '~1,5-2,5 €/Wc',
    note: 'Le standard. Plus rentable au Wc mais lourd (10-25 kg) et inflexible.',
  },
]

const faqs = [
  {
    question: 'Qu’est-ce qu’un panneau solaire souple ?',
    answer:
      'Un panneau solaire souple (ou flexible) est une couche photovoltaïque mince (3-5 mm) collée sur une membrane plastique pliable. Deux technologies : amorphe (a-Si, économique mais peu durable) ou monocristallin avec couche ETFE (haut de gamme, rendement proche cristallin rigide). Poids 2-4 kg vs 10-25 kg pour un panneau rigide à puissance équivalente. Permet la pose sur toits courbes ou structures fragiles.',
  },
  {
    question: 'Combien coûte un panneau solaire souple en 2026 ?',
    answer:
      'Prix 2026 par puissance : 50-100 Wc → 100-150 € TTC, 150-200 Wc → 250-380 €, 250-300 Wc → 400-600 €. Les modèles ETFE haut de gamme (Sunpower flex, Solbian) coûtent 30-50 % de plus mais durent 2× plus longtemps. Régulateur MPPT 12/24 V à ajouter : 80-180 € selon puissance. Batterie 100 Ah AGM : 150-250 €. Total kit complet 200 W : 600-900 € TTC.',
  },
  {
    question: 'Pour quels usages le panneau souple est-il pertinent ?',
    answer:
      'Le panneau souple est adapté à 5 usages principaux : (1) camping-car / fourgon aménagé (toit courbe, fixation collée), (2) voilier / bateau de plaisance (pont, bimini, modèles marine grade), (3) mobil-home / résidence mobile, (4) hangar léger / serre / bâche tente (toiture ne supportant pas du rigide), (5) randonnée / outdoor (rouleau pliable). Pour une maison résidentielle classique, le cristallin rigide reste 2-3× plus rentable au Wc.',
  },
  {
    question: 'Quel rendement attendre d’un panneau souple ?',
    answer:
      'Le rendement varie selon la technologie : amorphe (a-Si) 6-9 %, monocristallin souple 14-17 %, cristallin rigide (référence) 18-22 %. Conséquence pratique : pour 100 Wc de panneau souple amorphe, il faut 1,5-2 m² de surface vs 0,5 m² pour un panneau rigide. Production réelle annuelle : ~1 000 kWh/Wc/an au sud (mêmes ordres de grandeur que rigide à puissance crête égale, mais surface plus grande).',
  },
  {
    question: 'Combien de temps dure un panneau souple ?',
    answer:
      'Durée typique : 5-7 ans pour un panneau amorphe entrée de gamme, 8-10 ans pour un monocristallin ETFE haut de gamme. Le facteur limitant n’est pas tant le silicium que la membrane plastique qui se dégrade aux UV et à la chaleur. La couche ETFE multiplie la durée par 2. Garantie fabricant typique : 2-5 ans (vs 25 ans pour cristallin rigide). À retenir : remplacement à prévoir tous les 7-10 ans.',
  },
  {
    question: 'Comment fixer un panneau souple sur camping-car ?',
    answer:
      'Trois méthodes : (1) Colle MS polymère type Sikaflex 252 — fixation définitive, pas de perçage du toit, étanchéité préservée (recommandé fabricant), (2) Velcro industriel haute résistance — démontable, pour stockage hivernal, (3) bandes adhésives 3M VHB renforcées. NE JAMAIS percer le toit (perte étanchéité, garantie véhicule). Surface à dégraisser à l’alcool isopropylique avant collage. Laisser sécher 24-48 h avant utilisation.',
  },
  {
    question: 'Y a-t-il des aides ou subventions ?',
    answer:
      'Non. Le panneau souple n’est éligible à aucune aide publique : pas de prime EDF OA Solaire (pas de raccordement réseau), pas de MaPrimeRénov’ (PV non couvert), pas de CEE (PV non couvert). Le panneau souple est purement autoconsommation isolée, alimentant un parc batterie. C’est l’usage qui définit l’investissement : autonomie d’un véhicule ou d’un bateau, pas une économie sur facture électricité résidentielle.',
  },
  {
    question: 'Souple ou rigide pour mon camping-car ?',
    answer:
      'Souple si : toit courbe / aérodynamique, recherche minimum poids et hauteur, démontage saisonnier souhaité. Rigide si : toit plat avec fixation à 5 cm, recherche durabilité 15-20 ans, budget plus serré au Wc. Compromis fréquent en 2026 : 1-2 panneaux rigides 100 Wc (durables, économiques) + 1 panneau souple 100 Wc d’appoint mobile (au sol pour orienter au soleil).',
  },
]

const sources = [
  { label: 'ADEME — Photovoltaïque autoconsommation isolée', url: 'https://librairie.ademe.fr' },
  {
    label: 'Sikaflex 252 — fiche technique collage panneaux véhicule',
    url: 'https://fra.sika.com/fr/industrie/transport/marine.html',
  },
  {
    label: 'Sunpower Flex — gamme professionnelle',
    url: 'https://us.sunpower.com/products',
  },
  { label: 'Solbian — fabricant marine grade', url: 'https://www.solbian.eu' },
  {
    label: 'CRE — Photovoltaïque (référentiel rendements)',
    url: 'https://www.cre.fr',
  },
]

const relatedPages = [
  {
    label: 'Hub Solaire (installation pro 3-9 kWc résidentiel)',
    href: '/renovation-energetique/travaux/solaire',
  },
  {
    label: 'Kit panneau solaire 1000W (DIY autoconso)',
    href: '/renovation-energetique/travaux/solaire/panneau-1000w',
  },
  {
    label: 'Nettoyage panneau solaire (entretien)',
    href: '/renovation-energetique/travaux/solaire/nettoyage',
  },
  {
    label: 'Guide prix panneau solaire 2026',
    href: '/guides/panneau-solaire-prix-rentabilite',
  },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: PAGE_PATH,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Travaux — Solaire — Panneau souple',
    keywords: [
      'panneau solaire souple',
      'panneau solaire flexible',
      'panneau solaire camping car',
      'panneau solaire bateau',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Solaire', url: '/renovation-energetique/travaux/solaire' },
    { name: 'Panneau solaire souple', url: PAGE_PATH },
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
              { label: 'Rénovation énergétique', href: '/renovation-energetique' },
              { label: 'Solaire', href: '/renovation-energetique/travaux/solaire' },
              { label: 'Panneau solaire souple' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Caravan className="w-3.5 h-3.5" aria-hidden />
              Solaire &middot; Panneau souple mobile
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Panneau solaire souple en 2026 : prix, usage, durée
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Léger (2-4 kg), pliable, posable sur toit courbe : le panneau solaire souple coûte{' '}
              <strong>100 à 600 € TTC</strong> selon la puissance (50-300 Wc). Idéal{' '}
              <strong>camping-car, voilier, mobil-home</strong>, mais durée de vie plus courte (5-10
              ans vs 25 ans cristallin rigide). Aucune aide publique : usage purement
              autoconsommation isolée.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Souple, flexible, amorphe : on vous explique</h2>
            <p>
              Un <strong>panneau solaire souple</strong> est une couche photovoltaïque mince (3-5
              mm) supportée par une membrane plastique. Deux technologies dominent en 2026 :
            </p>
            <ul>
              <li>
                <strong>Amorphe (a-Si)</strong> — silicium amorphe en couche mince, économique,
                rendement 6-9 %.
              </li>
              <li>
                <strong>Monocristallin souple ETFE</strong> — cellules cristallines découpées fines
                + couche ETFE résistante UV, rendement 14-17 %, plus durable.
              </li>
            </ul>
            <p>
              Différence avec le <strong>cristallin rigide</strong> : surface 1,5-3× plus grande à
              puissance égale, durée 2-4× plus courte, mais possibilité de pose sur toiture courbe
              ou structure légère qui ne supporterait pas un panneau classique.
            </p>

            <h2>Comparatif des 3 technologies</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Type</th>
                    <th className="p-3 border-b border-sand-200">Rendement</th>
                    <th className="p-3 border-b border-sand-200 hidden md:table-cell">Durée</th>
                    <th className="p-3 border-b border-sand-200">Prix au Wc</th>
                    <th className="p-3 border-b border-sand-200 hidden lg:table-cell">Note</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {COMPARATIF_TYPES.map((row) => (
                    <tr key={row.type} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold whitespace-nowrap">{row.type}</td>
                      <td className="p-3 whitespace-nowrap">{row.rendement}</td>
                      <td className="p-3 hidden md:table-cell whitespace-nowrap">{row.duree}</td>
                      <td className="p-3 font-semibold text-primary-800 whitespace-nowrap">
                        {row.prix}
                      </td>
                      <td className="p-3 text-sand-600 hidden lg:table-cell">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2>5 usages typiques</h2>
            <div className="not-prose grid gap-3 my-6">
              {USAGES.map((u) => (
                <div
                  key={u.use}
                  className="bg-white border border-sand-200 rounded-lg p-4 flex items-start gap-3"
                >
                  {u.use.includes('camping') || u.use.includes('mobil') ? (
                    <Caravan className="w-5 h-5 text-primary-700 shrink-0 mt-0.5" aria-hidden />
                  ) : u.use.includes('Voilier') ? (
                    <Anchor className="w-5 h-5 text-primary-700 shrink-0 mt-0.5" aria-hidden />
                  ) : (
                    <Sun className="w-5 h-5 text-primary-700 shrink-0 mt-0.5" aria-hidden />
                  )}
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between gap-2 flex-wrap">
                      <p className="font-semibold text-sand-900 m-0">{u.use}</p>
                      <span className="text-xs font-semibold text-primary-800 bg-primary-50 px-2 py-0.5 rounded">
                        {u.pwr}
                      </span>
                    </div>
                    <p className="text-sm text-sand-700 m-0 mt-1">{u.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="not-prose border-2 border-amber-300 bg-amber-50 rounded-lg p-5 my-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" aria-hidden />
                <div>
                  <p className="font-semibold text-amber-900 m-0">
                    Pour une maison résidentielle, le cristallin rigide reste 2-3× plus rentable.
                  </p>
                  <p className="text-sm text-amber-900 mt-2 mb-0">
                    Le panneau souple est conçu pour les usages mobiles ou les structures fragiles.
                    En toiture maison classique, le rendement / Wc / euro / durée est largement
                    moins favorable. Préférez un cristallin rigide installé par un pro QualiPV (cf
                    hub solaire) pour la maison.
                  </p>
                </div>
              </div>
            </div>

            <h2>Quel kit complet pour camping-car / voilier ?</h2>
            <p>Un kit solaire souple complet pour camping-car ou bateau comprend 4 éléments :</p>
            <ul>
              <li>
                <Sun className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />{' '}
                <strong>Panneau souple 100-200 Wc</strong> (mono ETFE recommandé) : 250-450 €
              </li>
              <li>
                <Battery className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />{' '}
                <strong>Régulateur MPPT 12/24 V 20-30 A</strong> : 80-180 €
              </li>
              <li>
                <Battery className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />{' '}
                <strong>Batterie service AGM ou lithium 100 Ah</strong> : 150-450 €
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />{' '}
                <strong>Câblage + connecteurs MC4 + colle MS Sikaflex</strong> : 50-100 €
              </li>
            </ul>
            <p>
              <strong>Total kit 200 Wc complet 2026 :</strong> 600-900 € TTC (AGM) à 900-1 300 €
              (lithium). Autonomie typique 1-3 jours en mouillage / bivouac selon ensoleillement et
              consommation.
            </p>

            <h2>Comment poser un panneau souple ?</h2>
            <p>
              <strong>Méthode collage MS polymère</strong> (Sikaflex 252 ou équivalent) — la plus
              recommandée pour camping-car / voilier :
            </p>
            <ol>
              <li>Dégraisser la surface à l’alcool isopropylique (sur 30 cm de marge).</li>
              <li>Appliquer un cordon de colle MS de 5-8 mm en zigzag sous le panneau.</li>
              <li>Poser le panneau, presser uniformément 1-2 min.</li>
              <li>Laisser sécher 24-48 h avant mise sous tension ou exposition pluie.</li>
              <li>Brancher au régulateur MPPT puis à la batterie (jamais l’inverse).</li>
            </ol>
            <p className="not-prose">
              <span className="text-sm bg-red-50 text-red-800 border border-red-200 rounded px-2 py-1">
                ⚠️ NE JAMAIS percer le toit du véhicule.
              </span>{' '}
              Risque : perte d’étanchéité, infiltration, garantie constructeur véhicule annulée.
            </p>
          </article>

          <FlagshipFaq items={faqs} />
          <FlagshipSources sources={sources} />

          <section className="my-10">
            <h2 className="font-heading text-xl font-semibold text-sand-900 mb-4">
              Pour aller plus loin
            </h2>
            <ul className="grid gap-3 md:grid-cols-2">
              {relatedPages.map((g) => (
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

          <div className="flex items-center justify-between text-sm text-sand-600 border-t border-sand-200 pt-4 mt-6">
            <Link
              href="/renovation-energetique/travaux/solaire"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Hub Solaire
            </Link>
            <Link
              href="/renovation-energetique/travaux/solaire/panneau-1000w"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Kit 1 kWc autoconso <ShieldCheck className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
