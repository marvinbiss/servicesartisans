/**
 * Page : /renovation-energetique/travaux/solaire/panneau-piscine
 *
 * @kw-primary    panneau solaire piscine
 * @kw-volume     2700
 * @kw-kd         2
 * @kw-cpc        0.65
 * @cluster       2
 * @ahrefs-source docs/ahrefs-bloc1-keywords-gap-2026-05-04.md
 * @snapshot      2026-05-04 (Ahrefs Bloc 1 v3 — cluster solaire orphelin)
 * @backlog-item  Levier-E4-panneau-piscine
 *
 * KW cibles (Ahrefs Bloc 1 v3, country=fr) :
 * - "panneau solaire piscine"        → 2 700 vol, KD 2 ⭐⭐⭐ pivot
 * - "chauffage solaire piscine"      → ~900 vol estimé, KD 3
 * - "moquette solaire piscine"       → ~600 vol estimé, KD 1
 * - "kit solaire piscine"            → ~500 vol estimé, KD 2
 * - Famille cumulée pivot : ~4 700 vol/mois
 *
 * Anti-cannibalisation :
 *   - Hub /travaux/solaire = PHOTOVOLTAÏQUE résidentiel (production électricité)
 *   - Cette page = panneau solaire THERMIQUE pour CHAUFFAGE PISCINE
 *     (eau circulant dans capteurs, ≠ électricité). Application saisonnière,
 *     ROI très différent (extension saison de baignade vs économie facture).
 *
 * YMYL bas : pas d'aides, pas de réglementation lourde.
 * Précisions : sécurité électrique pompe, raccord bypass filtration.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Sun, Waves, Thermometer, AlertTriangle } from 'lucide-react'

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

const PAGE_PATH = '/renovation-energetique/travaux/solaire/panneau-piscine'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'marc-lefebvre'
const AUTHOR_NAME = 'Marc Lefebvre'

const TITLE = 'Panneau solaire piscine 2026 : prix, kit, rendement'
const DESCRIPTION =
  'Panneau solaire piscine 2026 : 500-3 500 € selon surface. Moquette, capteurs sous vide. Eau +5 à +10 °C, saison de baignade prolongée 2-3 mois.'

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
  'Le panneau solaire piscine est THERMIQUE (chauffage de l’eau), pas photovoltaïque (électricité). Eau de la piscine circule dans des capteurs noirs.',
  'Effet : +5 à +10 °C de plus que la température ambiante de l’eau, prolonge la saison de baignade de 2 à 3 mois (avril-mai et septembre-octobre).',
  'Prix 2026 : 500-1 200 € (moquette ou tapis solaire 8-15 m²), 1 500-3 500 € (kit capteurs vitrés ou sous vide pour grande piscine).',
  'Surface utile : 50 à 100 % de la surface du bassin selon technologie. Moquette = 100 %, capteurs sous vide = 30-50 %.',
  'Branchement bypass filtration existante avec vanne 3 voies + thermostat différentiel. Pas de pompe additionnelle pour la moquette.',
  'Pas d’aide MaPrimeRénov’ ni CEE pour les piscines (loisir, pas rénovation thermique habitat). TVA 10 % logement > 2 ans avec pose pro.',
]

const TYPES_PISCINE = [
  {
    type: 'Moquette solaire (tapis EPDM)',
    prix: '500 - 1 200 € TTC',
    surface: 'Surface = surface bassin',
    perf: '+3 à +6 °C',
    note: 'Le moins cher. Tapis EPDM noir étendu au sol près de la piscine. Branchement bypass filtration. Saisonnier, à ranger l’hiver.',
  },
  {
    type: 'Capteurs souples / coussins solaires',
    prix: '800 - 1 800 € TTC',
    surface: '50-80 % surface bassin',
    perf: '+4 à +8 °C',
    note: 'Coussins gonflables ou capteurs en série. Plus durables que la moquette. Pose toiture (4-12 modules).',
  },
  {
    type: 'Capteurs vitrés plans (CESI piscine)',
    prix: '1 800 - 3 500 € TTC',
    surface: '30-50 % surface bassin',
    perf: '+6 à +10 °C',
    note: 'Capteurs cuivre + verre type chauffe-eau solaire. Performance haute mais coût aussi. Installation pro recommandée.',
  },
  {
    type: 'Capteurs sous vide (haute performance)',
    prix: '2 500 - 4 500 € TTC',
    surface: '20-30 % surface bassin',
    perf: '+7 à +12 °C',
    note: 'Tubes sous vide. Rendement maximal. Couvre piscines abritées. Investissement long terme (15-20 ans).',
  },
]

const COMPARATIF_TECHNO = [
  {
    critere: 'Coût initial',
    moquette: '500-1 200 €',
    vitres: '1 800-3 500 €',
    sousVide: '2 500-4 500 €',
  },
  { critere: 'Performance (+°C)', moquette: '+3-6', vitres: '+6-10', sousVide: '+7-12' },
  { critere: 'Durée de vie', moquette: '5-10 ans', vitres: '15-20 ans', sousVide: '15-25 ans' },
  { critere: 'Surface requise', moquette: '100 %', vitres: '30-50 %', sousVide: '20-30 %' },
  { critere: 'Pose DIY', moquette: 'Oui', vitres: 'Pro recommandé', sousVide: 'Pro' },
  { critere: 'Saison utile', moquette: '5-7 mois', vitres: '6-8 mois', sousVide: '7-9 mois' },
]

const faqs = [
  {
    question: 'Comment fonctionne un panneau solaire piscine ?',
    answer:
      'L’eau de la piscine est aspirée par la pompe de filtration, dérivée vers les capteurs solaires (par une vanne 3 voies = bypass), traverse les capteurs noirs exposés au soleil, se réchauffe de quelques degrés, et retourne dans le bassin. Pas d’antigel, pas de circuit secondaire : c’est l’eau de la piscine elle-même qui circule. Un thermostat différentiel détecte la température capteur > eau bassin pour activer la circulation.',
  },
  {
    question: 'Combien coûte un kit panneau solaire piscine en 2026 ?',
    answer:
      'Selon la technologie : moquette / tapis solaire EPDM = 500-1 200 € TTC (DIY), capteurs souples = 800-1 800 €, capteurs vitrés plans = 1 800-3 500 €, capteurs sous vide haute performance = 2 500-4 500 €. Pour une piscine 8×4 m (32 m²), un kit moquette 30 m² coûte ~700-900 €. Un kit capteurs vitrés performants ~2 500-3 000 € posé.',
  },
  {
    question: 'Combien la piscine se réchauffe-t-elle vraiment ?',
    answer:
      'Selon la technologie et la météo : moquette / tapis EPDM = +3 à +6 °C par rapport à la température ambiante de l’eau, capteurs vitrés = +6 à +10 °C, capteurs sous vide = +7 à +12 °C. En pratique, sur la saison estivale en France métropolitaine, cela permet de maintenir l’eau à 26-28 °C (vs 20-23 °C sans chauffage) et de prolonger la saison de baignade de 2 à 3 mois (avril-mai en début, septembre-octobre en fin).',
  },
  {
    question: 'Quelle surface de capteurs pour ma piscine ?',
    answer:
      'Règle de dimensionnement 2026 : moquette / tapis EPDM = 80-100 % de la surface du bassin, capteurs vitrés = 30-50 %, capteurs sous vide = 20-30 %. Exemple piscine 8×4 m (32 m²) : 28-32 m² de moquette, ou 12-15 m² de capteurs vitrés, ou 8-10 m² de capteurs sous vide. Sous-dimensionner = chauffage symbolique. Sur-dimensionner = surchauffe à éviter (besoin couverture été).',
  },
  {
    question: 'Y a-t-il des aides ou subventions ?',
    answer:
      'Non. Le chauffage de piscine n’est éligible à aucune aide publique : pas de MaPrimeRénov’ ni de CEE (la piscine est loisir, pas rénovation thermique d’habitat). La TVA 10 % s’applique uniquement si pose par un pro dans un logement > 2 ans. Si pose DIY ou logement neuf : TVA 20 %. La rentabilité repose donc uniquement sur l’économie d’une pompe à chaleur piscine (1 200-3 000 € + ~150-300 €/an d’électricité) et sur l’extension de saison.',
  },
  {
    question: 'Comment se branche le panneau sur la filtration ?',
    answer:
      'Branchement bypass classique : (1) installer une vanne 3 voies sur le tuyau retour filtration, (2) tirer 2 conduits PVC vers les capteurs (aller / retour), (3) brancher un thermostat différentiel qui pilote la vanne, (4) capteurs en série ou parallèle selon configuration. La pompe de filtration existante suffit (pas de pompe additionnelle pour la moquette EPDM). Pour capteurs vitrés sur toit en hauteur, vérifier que la pompe a la pression suffisante.',
  },
  {
    question: 'Faut-il une pompe supplémentaire ?',
    answer:
      'Pour la moquette / tapis EPDM au sol : non, la pompe de filtration de la piscine suffit (perte de charge faible). Pour des capteurs vitrés sur toit en hauteur (> 4 m), souvent oui : une pompe d’appoint 0,5-1 CV (200-500 € + installation) compense la perte de charge. À vérifier avec le fabricant selon hauteur et débit du modèle.',
  },
  {
    question: 'Faut-il démonter en hiver ?',
    answer:
      'Pour la moquette / tapis EPDM : oui, à démonter et stocker en hiver pour préserver le caoutchouc (UV + gel). Durée de vie typique 5-10 ans avec démontage hivernal. Pour les capteurs vitrés ou sous vide : non, ils restent en place toute l’année (vidanger l’eau pour éviter le gel). Privilégier les modèles « toutes saisons » avec drainback automatique pour éviter une vidange manuelle annuelle.',
  },
]

const sources = [
  { label: 'ADEME — Solaire thermique chauffage piscine', url: 'https://librairie.ademe.fr' },
  {
    label: 'Qualit’EnR — Annuaire QualiSol (capteurs thermiques)',
    url: 'https://www.qualit-enr.org',
  },
  {
    label: 'CSTB — Avis techniques chauffage solaire piscine',
    url: 'https://www.cstb.fr/atec',
  },
  {
    label: 'Service-Public — TVA 10 % travaux logement > 2 ans',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F23568',
  },
]

const relatedPages = [
  {
    label: 'Hub Solaire (PV résidentiel installation pro)',
    href: '/renovation-energetique/travaux/solaire',
  },
  {
    label: 'Kit panneau solaire 1000W (DIY autoconso)',
    href: '/renovation-energetique/travaux/solaire/panneau-1000w',
  },
  {
    label: 'Panneau solaire souple (camping-car / voilier)',
    href: '/renovation-energetique/travaux/solaire/panneau-souple',
  },
  {
    label: 'Nettoyage panneau solaire (entretien)',
    href: '/renovation-energetique/travaux/solaire/nettoyage',
  },
  {
    label: 'Trouver un installateur QualiSol',
    href: '/rge/qualisol',
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
    section: 'Travaux — Solaire — Chauffage piscine',
    keywords: [
      'panneau solaire piscine',
      'chauffage solaire piscine',
      'moquette solaire piscine',
      'kit solaire piscine',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Solaire', url: '/renovation-energetique/travaux/solaire' },
    { name: 'Panneau solaire piscine', url: PAGE_PATH },
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
              { label: 'Panneau solaire piscine' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Waves className="w-3.5 h-3.5" aria-hidden />
              Solaire &middot; Chauffage piscine
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Panneau solaire pour piscine en 2026 : prix, types, rendement
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Le panneau solaire piscine est <strong>thermique</strong> (chauffe l’eau), pas
              photovoltaïque. Pour 500 à 3 500 € TTC selon technologie, vous pouvez gagner{' '}
              <strong>+5 à +10 °C</strong> sur la température de votre bassin et prolonger la saison
              de baignade de 2 à 3 mois. Aucune aide publique, mais ROI clair vs pompe à chaleur
              piscine (alimentée à l’électricité).
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Solaire piscine : thermique ≠ photovoltaïque</h2>
            <p>
              Important : le « panneau solaire piscine » désigne <strong>presque toujours</strong>{' '}
              un capteur <strong>thermique</strong> dans lequel circule l’eau de la piscine pour la
              chauffer. Le capteur est exposé au soleil, l’eau s’y réchauffe, et retourne au bassin.{' '}
              <strong>Ce n’est pas du photovoltaïque</strong> (pas d’électricité produite).
            </p>
            <p>
              Pour produire de l’électricité afin d’alimenter une pompe à chaleur piscine, voir
              plutôt notre guide{' '}
              <Link href="/renovation-energetique/travaux/solaire">hub photovoltaïque</Link> ou{' '}
              <Link href="/renovation-energetique/travaux/solaire/panneau-1000w">
                kit autoconso 1 kWc
              </Link>
              .
            </p>

            <h2>4 technologies de chauffage solaire piscine</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Type</th>
                    <th className="p-3 border-b border-sand-200">Prix TTC</th>
                    <th className="p-3 border-b border-sand-200 hidden md:table-cell">Surface</th>
                    <th className="p-3 border-b border-sand-200">Perf</th>
                    <th className="p-3 border-b border-sand-200 hidden lg:table-cell">Note</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {TYPES_PISCINE.map((row) => (
                    <tr key={row.type} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold whitespace-nowrap">{row.type}</td>
                      <td className="p-3 font-semibold text-primary-800 whitespace-nowrap">
                        {row.prix}
                      </td>
                      <td className="p-3 hidden md:table-cell whitespace-nowrap">{row.surface}</td>
                      <td className="p-3 whitespace-nowrap">{row.perf}</td>
                      <td className="p-3 text-sand-600 hidden lg:table-cell">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Tarifs nationaux 2026, hors options (vanne 3 voies motorisée, thermostat
                différentiel, pompe d’appoint si toit &gt; 4 m).
              </p>
            </div>

            <h2>Comparatif technique en 6 critères</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Critère</th>
                    <th className="p-3 border-b border-sand-200">Moquette</th>
                    <th className="p-3 border-b border-sand-200 hidden md:table-cell">Vitrés</th>
                    <th className="p-3 border-b border-sand-200 hidden md:table-cell">Sous vide</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {COMPARATIF_TECHNO.map((row) => (
                    <tr key={row.critere} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold whitespace-nowrap">{row.critere}</td>
                      <td className="p-3 whitespace-nowrap">{row.moquette}</td>
                      <td className="p-3 hidden md:table-cell whitespace-nowrap">{row.vitres}</td>
                      <td className="p-3 hidden md:table-cell whitespace-nowrap">{row.sousVide}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="not-prose border-2 border-amber-300 bg-amber-50 rounded-lg p-5 my-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" aria-hidden />
                <div>
                  <p className="font-semibold text-amber-900 m-0">
                    Pas d’aide MaPrimeRénov’ ni CEE pour les piscines.
                  </p>
                  <p className="text-sm text-amber-900 mt-2 mb-0">
                    Le chauffage de piscine est considéré comme un usage de loisir, pas une
                    rénovation thermique d’habitat. Aucune subvention publique en 2026. Seule la TVA
                    10 % s’applique si la pose est faite par un artisan dans un logement de plus de
                    2 ans.
                  </p>
                </div>
              </div>
            </div>

            <h2>Dimensionnement : quelle surface pour quelle piscine ?</h2>
            <ul>
              <li>
                <Sun className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden /> Piscine 4×8 m
                (32 m²) : 28-32 m² de moquette OU 12-15 m² de vitrés OU 8-10 m² sous vide
              </li>
              <li>
                <Sun className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden /> Piscine 5×10 m
                (50 m²) : 45-50 m² de moquette OU 20-25 m² de vitrés OU 12-15 m² sous vide
              </li>
              <li>
                <Sun className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden /> Piscine 6×12 m
                (72 m²) : 65-72 m² de moquette OU 28-36 m² de vitrés OU 18-22 m² sous vide
              </li>
            </ul>
            <p>
              <strong>Règle d’or 2026</strong> : sous-dimensionner = chauffage symbolique (1-2 °C
              gagnés seulement). Sur-dimensionner = pas de risque (le thermostat coupe la
              circulation). Toujours associer une bâche à bulles ou un volet (limite la perte
              nocturne et l’évaporation, +2 à +4 °C).
            </p>

            <h2>Solaire vs pompe à chaleur piscine</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Critère</th>
                    <th className="p-3 border-b border-sand-200">Solaire thermique</th>
                    <th className="p-3 border-b border-sand-200 hidden md:table-cell">
                      PAC piscine
                    </th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  <tr className="border-b border-sand-100">
                    <td className="p-3 font-semibold">Coût initial</td>
                    <td className="p-3">500-3 500 €</td>
                    <td className="p-3 hidden md:table-cell">1 200-3 500 €</td>
                  </tr>
                  <tr className="border-b border-sand-100">
                    <td className="p-3 font-semibold">Coût annuel</td>
                    <td className="p-3 text-primary-800">~0 €</td>
                    <td className="p-3 hidden md:table-cell">150-300 € électricité</td>
                  </tr>
                  <tr className="border-b border-sand-100">
                    <td className="p-3 font-semibold">Performance par jour</td>
                    <td className="p-3">Variable selon météo</td>
                    <td className="p-3 hidden md:table-cell">Constante</td>
                  </tr>
                  <tr className="border-b border-sand-100">
                    <td className="p-3 font-semibold">Saison</td>
                    <td className="p-3">Avril → octobre</td>
                    <td className="p-3 hidden md:table-cell">Toute saison (si COP &gt; 4)</td>
                  </tr>
                  <tr className="border-b border-sand-100">
                    <td className="p-3 font-semibold">Empreinte carbone</td>
                    <td className="p-3 text-primary-800">Quasi nulle</td>
                    <td className="p-3 hidden md:table-cell">~30 kg CO₂/saison</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p>
              <strong>Choix optimal 2026</strong> : combiner les deux. Solaire thermique pour le
              cœur de saison (mai-août = ~80 % des heures de soleil utiles) + bâche à bulles +
              petite PAC piscine 5-7 kW pour ajuster en début / fin de saison. Investissement total
              ~3-5 K€, ROI à comparer avec un chauffage gaz ou tout-électrique (souvent supérieur à
              4-6 K€).
            </p>

            <h2>Comment poser un kit moquette solaire ?</h2>
            <ol>
              <li>Choisir un emplacement plein sud, dégagé, à proximité de la piscine.</li>
              <li>Installer une vanne 3 voies sur le retour de la filtration.</li>
              <li>Tirer 2 tuyaux PVC Ø 50 mm vers la moquette (aller + retour).</li>
              <li>Brancher la moquette en série ou en parallèle selon nombre de tapis.</li>
              <li>Installer un thermostat différentiel piloté par 2 sondes (capteur + bassin).</li>
              <li>Vérifier l’étanchéité raccords + remettre la pompe en route, ajuster débit.</li>
            </ol>
            <p className="not-prose text-sm bg-sand-50 border border-sand-200 rounded p-3">
              Compter 4-6 h pour une pose DIY soignée sur piscine standard 8×4 m. Pour pose pro :
              200-500 € main-d’œuvre selon distance bassin / capteurs.
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
              href="/rge/qualisol"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Installateurs QualiSol <Thermometer className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
