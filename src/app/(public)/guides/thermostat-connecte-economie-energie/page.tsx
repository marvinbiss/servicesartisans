/**
 * /guides/thermostat-connecte-economie-energie — Hub thermostat
 *
 * @kw-primary    thermostat
 * @kw-volume     18000
 * @kw-kd         2
 * @kw-cpc        20
 * @kw-secondary  thermostat connecté (additional volume), thermostat programmable
 * @cluster       6 (régulation chauffage / économie énergie)
 * @intent        commercial + informational (gros volume head)
 * @ahrefs-source docs/audit-ahrefs-2026-05-03/keyword_opportunities_2026-05.csv:10
 * @snapshot      2026-05-13 (chantier #12 KW commerciaux vague 2)
 *
 * Competitor sonergia rang 7 sur "thermostat" (18 000 vol/mo).
 * Plus gros KW commercial restant non couvert par SA.
 * Pivot angle : économie énergie + CEE BAR-TH-118 / BAR-TH-173.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { Thermometer, ArrowRight, AlertTriangle, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'thermostat-connecte-economie-energie'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-05-13'
const MODIFIED = '2026-05-13'
const AUTHOR_NAME = 'Jean-Pierre Duval'

export const revalidate = 86400

const TITLE = 'Thermostat 2026 : prix, connecté ou programmable + aides CEE'
const DESCRIPTION =
  'Thermostat 2026 : programmable 30-80 €, connecté Wi-Fi 100-250 €, sans fil 50-150 €. Économie 15-25 % chauffage. CEE BAR-TH-118 : 50-150 € prime.'

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
  'Prix 2026 : thermostat filaire programmable 30-80 €, sans fil 50-150 €, connecté Wi-Fi 100-250 €. Pose électricien/plombier 50-150 € selon complexité câblage.',
  'Économie chauffage 15-25 % : programmation horaire (mode jour/nuit/absence), géolocalisation (mode auto à l’approche du domicile), apprentissage (Nest, Tado).',
  'Compatible toute installation : chaudière fioul/gaz/granulés, PAC air-eau, plancher chauffant. Vérifier protocole : OpenTherm (modulant), 230V (simple marche/arrêt), basse tension 24V.',
  'CEE BAR-TH-118 « Régulation classe IV » : 50-150 € de prime selon fournisseur (Effy, TotalEnergies). Thermostat doit être certifié classe IV ou V (NF EN 15500).',
  'Top modèles 2026 : Netatmo (100-150 €, intégration Apple Home), Tado V3+ (200-250 €, géolocalisation premium), Nest Learning (250 € occasion uniquement, apprentissage), Heatzy Pilote (50 €, basique mais efficace).',
]

const faqs = [
  {
    question: 'Quel prix pour un thermostat connecté en 2026 ?',
    answer:
      'Prix 2026 par catégorie : (1) Thermostat filaire programmable basique (Theben Ramses, Cotherm) : 30-50 € TTC, programmation manuelle hebdomadaire ; (2) Thermostat sans fil RF (Honeywell DT200, Delta Dore Tybox) : 50-150 €, pas de câble entre thermostat et chaudière ; (3) Thermostat connecté Wi-Fi entrée de gamme (Heatzy Pilote, Netatmo basique) : 100-150 €, contrôle via app smartphone ; (4) Thermostat connecté premium (Tado V3+, Bosch EasyControl) : 200-250 €, géolocalisation, multi-zone, intégration assistants vocaux ; (5) Thermostat apprentissage (Nest Learning, Ecobee) : 250-350 €, mais Nest indisponible neuf en France depuis 2024 (uniquement reconditionné). Pose 50-150 € selon : câblage existant compatible (1 h, 50 €) ou recâblage nécessaire (2-4 h, 100-150 €).',
  },
  {
    question: 'Combien d’économie avec un thermostat connecté ?',
    answer:
      'Économies mesurées ADEME / IFOP 2024 : (1) Thermostat programmable seul (vs marche forcée 24/24) : 7-10 % facture chauffage annuelle, soit 100-180 €/an sur facture moyenne 1 500 €. (2) Thermostat connecté + programmation horaire fine (semaine vs week-end, jour vs nuit) : 15-20 %, soit 225-300 €/an. (3) Thermostat connecté + géolocalisation (mode absence auto) : 20-25 %, soit 300-375 €/an. (4) Thermostat apprentissage (Nest, Tado IQ) sur 12 mois : 23-27 % moyenne mesurée par Nest Labs, soit 345-405 €/an. Amortissement : thermostat programmable 30 € → 4-6 mois, thermostat connecté 150 € → 8-12 mois, thermostat premium 250 € → 12-18 mois. ROI 5 ans : 500-1 800 € d’économie cumulée.',
  },
  {
    question: 'Mon installation est-elle compatible avec un thermostat connecté ?',
    answer:
      'Compatibilité par type de chaudière/PAC : (1) Chaudière gaz/fioul moderne (post-2005) avec sortie « thermostat ambiance » : 95 % compatible, choisir thermostat OpenTherm pour modulation (économie 5-10 % supplémentaire) sinon ON/OFF 230 V suffit. (2) Chaudière à granulés/biomasse : compatible avec thermostat ON/OFF, vérifier compatibilité OpenTherm sur Okofen, Hargassner. (3) PAC air-eau : thermostat propriétaire fabricant recommandé (Daikin Madoka, Atlantic Cozytouch) pour piloter les courbes de chauffe, sinon thermostat ON/OFF basique. (4) Chauffage électrique (radiateurs, plancher chauffant électrique) : thermostat fil pilote (Heatzy Pilote, Voltalis, Nuos), pas Wi-Fi standard. (5) Plancher chauffant eau : thermostat dédié plancher (sonde sol) ou thermostat ambiance avec inertie. Étape vérification : couper chauffage, ouvrir la chaudière, regarder le bornier — 2 fils libres = compatible 230 V, 3-4 fils sur bornier OT = OpenTherm.',
  },
  {
    question: 'Prime CEE thermostat 2026 : combien et comment ?',
    answer:
      'Prime CEE BAR-TH-118 « Régulation par programmation horaire » : 50-150 € selon fournisseur et catégorie revenus. (1) Effy Prime : 80-150 € pour thermostat classe IV (NF EN 15500), bonus revenus très modestes (catégorie bleue). (2) TotalEnergies Coup de Pouce : 50-100 €, primable seulement si « bouquet de travaux » (thermostat + chaudière ou + isolation). (3) EDF Bleu Ciel : 80-130 € selon revenus. Conditions OBLIGATOIRES : (a) thermostat certifié classe IV minimum (la majorité des connectés Netatmo/Tado/Heatzy passent), (b) devis prime signé AVANT achat (un achat antérieur = prime perdue), (c) pose par professionnel ou auto-installation déclarée + facture, (d) logement résidence principale >2 ans. Délai versement 4-8 semaines. Cumul possible avec MaPrimeRénov’ si bouquet rénovation globale, sinon non.',
  },
  {
    question: 'Thermostat connecté ou simple programmable : que choisir ?',
    answer:
      'Arbitrage selon profil : (1) PROGRAMMABLE (30-80 €) idéal pour : logement à occupation régulière (mêmes horaires chaque semaine), budget contraint, pas de smartphone/Wi-Fi, locataire (transportable facilement). ROI 4-6 mois. Économie 7-10 %. (2) CONNECTÉ ENTRÉE GAMME (100-150 €, Heatzy/Netatmo) idéal pour : maison à occupation variable, télétravail/voyages fréquents, contrôle smartphone souhaité, intégration Google Home/Alexa. ROI 8-12 mois. Économie 15-20 %. (3) CONNECTÉ PREMIUM (200-250 €, Tado V3+/Bosch) idéal pour : maison >100 m² multi-zones, ménage avec horaires irréguliers, intégration HomeKit ou domotique avancée (zigbee, KNX), maximisation économie. ROI 12-18 mois. Économie 20-25 %. (4) APPRENTISSAGE (250 € si trouvable) : Nest non commercialisé neuf en France, Ecobee disponible 250-350 €. ROI 14-20 mois. Économie 23-27 %. Conseil ServicesArtisans : commencer Netatmo 100 € + 2-3 robinets thermostatiques connectés (200-400 € total) = ROI 18 mois + économie 25-30 %.',
  },
  {
    question: 'Faut-il un électricien pour installer un thermostat connecté ?',
    answer:
      'Installation DIY accessible 80 % des cas. (1) DIY (30-60 min, niveau bricolage intermédiaire) : si remplacement à l’identique (même protocole 230V/OpenTherm, même emplacement), démonter ancien thermostat, identifier les 2-3 fils (L/N/com), recâbler nouveau, jumeler à la box internet via app. Outils : tournevis, multimètre (optionnel), smartphone. (2) ÉLECTRICIEN OBLIGATOIRE si : (a) première installation (pas de thermostat existant) → besoin tirer câble jusqu’à chaudière, 100-200 €, (b) chaudière sans bornier thermostat (vieux modèles fioul antérieurs à 2005), (c) installation sans neutre au boîtier mural (thermostat connecté pile = OK, filaire = non). (3) PLOMBIER CHAUFFAGISTE si : compatibilité OpenTherm à vérifier, optimisation courbe de chauffe PAC, modification carte électronique chaudière. (4) Pose pro coût : 50-100 € à l’heure, 1-2 h selon complexité. Pour gros chantier (thermostat + remplacement chaudière) : forfait pose chaudière inclut généralement thermostat.',
  },
]

const sources = [
  { label: 'ADEME — Thermostat et régulation', url: 'https://www.ademe.fr' },
  {
    label: 'France-Rénov’ — Prime CEE régulation',
    url: 'https://france-renov.gouv.fr',
  },
  { label: 'NF EN 15500 — Classes thermostats', url: 'https://www.afnor.org' },
  { label: 'IFOP étude économies thermostat 2024', url: 'https://www.ifop.com' },
]

const relatedGuides = [
  { label: 'Robinet thermostatique radiateur', href: '/guides/robinet-thermostatique-radiateur' },
  { label: 'Pompe à chaleur prix 2026', href: '/guides/pompe-a-chaleur' },
  {
    label: 'CEE certificats économies énergie 2026',
    href: '/guides/cee-certificats-economies-energie-2026',
  },
  { label: 'Chaudière fioul interdite 2026', href: '/guides/chaudiere-fioul-interdite-2026' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Régulation & économies',
    keywords: [
      'thermostat',
      'thermostat connecté',
      'thermostat programmable',
      'prime CEE thermostat',
      'économie chauffage',
      'Netatmo',
      'Tado',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Thermostat', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Thermostat' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Thermometer className="w-3.5 h-3.5" aria-hidden />
              Régulation & économies · Guide vérifié
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Thermostat 2026 : prix, connecté ou programmable + aides CEE
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Un thermostat connecté fait baisser la facture de chauffage de 15 à 25 % grâce à la
              programmation horaire et la géolocalisation. Voici les prix 2026, les économies
              mesurées par l’ADEME, la prime CEE BAR-TH-118 (50-150 €) et le comparatif des
              meilleurs modèles (Netatmo, Tado, Heatzy, Nest).
            </p>
          </header>

          <TldrBlock bullets={tldr} />

          <section className="bg-white border border-sand-300 rounded-2xl shadow-soft p-6 my-8">
            <h2 className="font-heading text-2xl font-bold text-sand-900 mb-4 flex items-center gap-2">
              <Thermometer className="w-6 h-6 text-primary-500" aria-hidden />
              Pourquoi installer un thermostat connecté ?
            </h2>
            <p className="text-sand-700 leading-relaxed mb-4">
              Le chauffage représente <strong>60-70 % de la facture énergétique</strong> d’un
              logement chauffé au gaz, fioul ou PAC. Un thermostat connecté agit sur deux leviers :
              il <strong>coupe le chauffage automatiquement</strong> quand la température cible est
              atteinte (ce qu’un robinet quart-de-tour ne fait pas), et il{' '}
              <strong>programme des modes différenciés</strong> (jour, nuit, absence, week-end).
            </p>
            <p className="text-sand-700 leading-relaxed">
              Sur une facture chauffage moyenne de 1 500 €/an, l’économie réelle mesurée par l’ADEME
              se situe entre 100 € (programmable simple) et 405 € (thermostat apprentissage). Avec
              la prime CEE de 80-150 €, l’investissement est amorti en 6-18 mois selon le modèle.
            </p>
          </section>

          <section className="bg-white border border-sand-300 rounded-2xl shadow-soft p-6 my-8">
            <h2 className="font-heading text-2xl font-bold text-sand-900 mb-4">
              Comparatif prix et économies 2026
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border border-sand-300 rounded-lg">
                <thead className="bg-primary-50">
                  <tr>
                    <th className="text-left px-3 py-2 text-charcoal-900">Type</th>
                    <th className="text-left px-3 py-2 text-charcoal-900">Prix (€ TTC)</th>
                    <th className="text-left px-3 py-2 text-charcoal-900">Économie/an</th>
                    <th className="text-left px-3 py-2 text-charcoal-900">ROI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-200">
                  <tr>
                    <td className="px-3 py-2">Programmable filaire</td>
                    <td className="px-3 py-2">30-80 €</td>
                    <td className="px-3 py-2">100-180 €</td>
                    <td className="px-3 py-2">4-6 mois</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2">Sans fil RF</td>
                    <td className="px-3 py-2">50-150 €</td>
                    <td className="px-3 py-2">150-225 €</td>
                    <td className="px-3 py-2">6-10 mois</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2">Connecté Wi-Fi</td>
                    <td className="px-3 py-2">100-250 €</td>
                    <td className="px-3 py-2">225-375 €</td>
                    <td className="px-3 py-2">8-18 mois</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2">Apprentissage (Nest, Ecobee)</td>
                    <td className="px-3 py-2">250-350 €</td>
                    <td className="px-3 py-2">345-405 €</td>
                    <td className="px-3 py-2">14-20 mois</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-charcoal-500 mt-3">
              Sources : ADEME, IFOP 2024, devis observés Effy/Sonergia, panel artisans plombiers
              ServicesArtisans.
            </p>
          </section>

          <aside className="bg-accent-50 border border-accent-200 rounded-2xl p-6 my-8">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-accent-700 flex-shrink-0" aria-hidden />
              <div>
                <h3 className="font-heading text-lg font-bold text-accent-900 mb-2">
                  Prime CEE BAR-TH-118 : 50-150 €
                </h3>
                <p className="text-accent-800 leading-relaxed">
                  Thermostat <strong>classe IV (NF EN 15500)</strong> minimum éligible. Demander
                  devis prime AVANT achat (Effy, TotalEnergies, EDF). Versement 4-8 semaines après
                  preuve de pose. Cumul possible avec TVA 5,5 % si pose pro.
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
              Faire poser un thermostat par un artisan RGE
            </h2>
            <p className="text-primary-50 mb-6">
              Devis gratuit en 24 h auprès d’électriciens et plombiers vérifiés près de chez vous.
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
