/**
 * Page : /renovation-energetique/diagnostic/thermographie
 *
 * KW cibles (validés Ahrefs API live, snapshot 2026-05-03, country=fr) :
 * - "thermographie"                → 1 037 vol, KD 0, CPC $0,25 ⭐⭐ EASY WIN
 * - "thermographie infrarouge"     → 360 vol, KD 0, CPC $0,30 ⭐
 * - "camera thermique maison"      → 99 vol, KD 0, CPC $0,50
 * - "thermographie batiment"       → longue traîne KD 0
 * - Famille cumulée pivot : ~1 700 vol/mois (KD 0 = MEGA EASY WIN)
 *
 * Source : audit Ahrefs API live (cf docs/ahrefs-audit-2026-04/STRATEGIE-RENOVATION-ENERGETIQUE.md)
 * Easy win : OUI MEGA (KD 0 sur tous les KW pivots, intent informationnel + transactionnel)
 *            Concurrence très faible — pages constructeurs caméras IR (Flir, Testo) + sites BE
 * Cluster pillar : Rénovation Énergétique → Diagnostic → Thermographie
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Calculator, CheckCircle2, Coins, Search, Thermometer } from 'lucide-react'

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

const PAGE_PATH = '/renovation-energetique/diagnostic/thermographie'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-04'
const MODIFIED = '2026-05-04'
const AUTHOR_SLUG = 'sophie-martin'
const AUTHOR_NAME = 'Sophie Martin'

const TITLE = 'Thermographie infrarouge 2026 : prix'
const DESCRIPTION =
  'Thermographie 2026 : 200-500 €, détection ponts thermiques + défauts disolation invisibles. Caméra IR, réalisée en hiver. Avant et après travaux.'

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
  'Thermographie = caméra infrarouge pour cartographier les ponts thermiques et défauts isolation.',
  'Prix 2026 : 200-500 € TTC selon surface et complexité.',
  'Réalisée en hiver (différence température intérieur/extérieur ≥ 10°C).',
  'Détecte : défauts isolation cachés, ponts thermiques, infiltrations d’air, humidité, anomalies électriques.',
  'NON obligatoire mais fortement recommandée AVANT ITE/ITI ou APRÈS travaux pour vérification.',
  'Réalisée par thermographe certifié (catégorie 1, 2 ou 3 selon norme NF EN ISO 9712).',
]

const DEFAUTS = [
  {
    type: 'Ponts thermiques',
    detail:
      'Zones de fortes déperditions à la jonction murs/dalle, encadrements fenêtres, refends. Visibles en bleu/violet sur la cartographie thermique.',
  },
  {
    type: 'Défauts isolation cachés',
    detail:
      'Vide entre panneaux, tassement laine soufflée combles, isolation manquante derrière placo. Souvent invisibles à l’œil nu, révélés par caméra IR.',
  },
  {
    type: 'Infiltrations d’air',
    detail:
      'Joints fenêtres défectueux, prises électriques en mur extérieur, trappe combles mal fermée. Détection complétée par test d’étanchéité (BlowerDoor).',
  },
  {
    type: 'Humidité dans murs',
    detail:
      'Zones froides anormales révélant infiltration eau, capillarité, condensation. Aide au diagnostic avant travaux gros œuvre.',
  },
  {
    type: 'Anomalies électriques',
    detail:
      'Surchauffe au tableau, prises en court-circuit. Détection préventive avant incendie. Bonus diagnostic IRVE sur tableaux.',
  },
  {
    type: 'Défauts plancher chauffant',
    detail:
      'Tubes mal positionnés, fuites, zones froides anormales. Particulièrement utile pour planchers PAC ou électrique.',
  },
]

const QUAND_FAIRE = [
  {
    cas: 'AVANT ITE/ITI',
    detail:
      'Cartographie initiale pour identifier ponts thermiques prioritaires et zones les plus déperditives. Permet de dimensionner précisément les épaisseurs isolation.',
  },
  {
    cas: 'APRÈS travaux isolation',
    detail:
      'Vérification de la qualité de pose : homogénéité de l’isolation, absence de défauts (vides, tassement). Justification opposable au cas où l’artisan refuserait reprise.',
  },
  {
    cas: 'AVANT achat immobilier',
    detail:
      'Audit de la qualité énergétique réelle vs DPE théorique. Chiffrage des travaux nécessaires pour négociation du prix d’achat.',
  },
  {
    cas: 'EN CAS de problème (humidité, condensation)',
    detail:
      'Diagnostic précis pour identifier la source du problème (infiltration, pont thermique, défaut ventilation) avant intervention.',
  },
  {
    cas: 'AVANT vente immobilière',
    detail:
      'Argument commercial pour les vendeurs de logements rénovés (preuve de la qualité du chantier).',
  },
]

const ETAPES = [
  {
    step: 'Choix d’un thermographe certifié',
    detail:
      'Catégorie 1 (généraliste), 2 (analyse), 3 (formation). Norme NF EN ISO 9712. Vérifier l’assurance professionnelle et les références.',
  },
  {
    step: 'Conditions hivernales requises',
    detail:
      'Température extérieure ≤ 5°C idéalement, et différence intérieur/extérieur ≥ 10°C minimum. Pas de pluie ni soleil direct dans les 4-6 heures précédentes.',
  },
  {
    step: 'Préparation du logement',
    detail:
      'Chauffage à 19-21°C constants pendant 4 heures avant intervention. Fermeture volets, rideaux, portes. Évacuation animaux. Consigne au commanditaire.',
  },
  {
    step: 'Inspection sur place (1-2 h)',
    detail:
      'Photographies thermiques de chaque façade, intérieur des pièces, combles. 50-150 clichés. Annotations sur place pour le rapport.',
  },
  {
    step: 'Rapport (1 semaine)',
    detail:
      'PDF illustré : photos thermiques + photos visibles côte à côte, annotations, interprétation des défauts, recommandations travaux. 15-30 pages.',
  },
]

const faqs = [
  {
    question: 'Qu’est-ce que la thermographie infrarouge ?',
    answer:
      'La thermographie infrarouge est une technique de diagnostic non destructive utilisant une caméra thermique (infrarouge longues longueurs d’onde) pour visualiser les températures de surface d’un bâtiment. Les zones plus froides apparaissent en bleu/violet (déperditions), les zones plus chaudes en rouge/jaune. Elle permet de cartographier précisément les ponts thermiques, défauts d’isolation cachés, infiltrations d’air et humidité.',
  },
  {
    question: 'Combien coûte une thermographie en 2026 ?',
    answer:
      'Prix 2026 : 200-500 € TTC selon la surface et la complexité. Appartement T2/T3 : 200-300 €. Maison 100 m² : 300-450 €. Maison > 200 m² ou avec étages multiples : 400-600 €. Pas de prise en charge par MaPrimeRénov’ (non obligatoire). Certains bureaux d’études proposent des forfaits combinés DPE + thermographie + audit énergétique pour 800-1 500 €.',
  },
  {
    question: 'Quand faut-il faire une thermographie ?',
    answer:
      'Cinq cas principaux : (1) AVANT travaux d’isolation pour identifier précisément les défauts cachés, (2) APRÈS travaux pour vérifier la qualité de pose, (3) AVANT achat immobilier pour audit indépendant, (4) EN CAS de problèmes (humidité, condensation, courants d’air), (5) AVANT vente comme argument commercial. Non obligatoire mais fortement recommandée pour rénovations lourdes (> 15 000 €).',
  },
  {
    question: 'Pourquoi la thermographie se fait en hiver ?',
    answer:
      'La caméra IR mesure les différences de température. Pour révéler les défauts isolation, il faut une différence intérieur/extérieur d’au moins 10°C. En hiver français : intérieur 19-21°C + extérieur 0-10°C = écart suffisant. En été (intérieur 22°C + extérieur 25°C), aucun défaut visible. Période optimale : novembre à mars en France métropolitaine, idéalement le matin tôt après une nuit froide.',
  },
  {
    question: 'Que voit-on sur une thermographie ?',
    answer:
      'Cartographie thermique en couleurs : zones froides (déperditions) en bleu/violet, zones tièdes en vert/jaune, zones chaudes (équipements) en rouge/blanc. Défauts typiques visibles : (1) ponts thermiques aux jonctions, (2) vide ou tassement isolation combles (taches froides anormales), (3) infiltrations d’air autour des fenêtres et trappes, (4) humidité dans les murs (zones anormalement froides), (5) défauts plancher chauffant (zones tièdes manquantes).',
  },
  {
    question: 'Faut-il un thermographe certifié ?',
    answer:
      'Vivement recommandé. Norme NF EN ISO 9712 distingue 3 niveaux : Catégorie 1 (technicien généraliste, prises de vue), Catégorie 2 (analyse et interprétation), Catégorie 3 (formation et écriture procédures). Pour un diagnostic résidentiel : Catégorie 2 minimum. Vérifier la certification, l’assurance professionnelle et les références. Coût similaire entre certifié et non certifié, choisir certifié systématiquement.',
  },
  {
    question: 'Thermographie ou DPE : que choisir ?',
    answer:
      'Les deux sont complémentaires, pas concurrents. DPE = note officielle A à G basée sur calcul théorique (3CL-2021), obligatoire pour vente/location, 100-250 €. Thermographie = cartographie visuelle des défauts réels, optionnelle, 200-500 €. Pour rénovation : DPE pour la note + audit énergétique pour le plan + thermographie pour la cartographie précise. Pour vente/location simple : DPE seul suffit.',
  },
  {
    question: 'Test d’étanchéité (BlowerDoor) : à coupler avec la thermographie ?',
    answer:
      'Oui pour rénovation lourde ou maison passive. BlowerDoor = test de pression/dépression révélant les fuites d’air (mesure m³/h sous 4 Pa). Combiné à la thermographie réalisée pendant le test, on visualise précisément où l’air entre/sort. Coût additionnel : 300-600 €. Obligatoire pour label BBC Effinergie et maisons passives. Recommandé après tout chantier d’étanchéité (changement fenêtres + ITE).',
  },
]

const sources = [
  { label: 'Norme NF EN ISO 9712 — Certification thermographes', url: 'https://www.afnor.org' },
  { label: 'ADEME — Thermographie aérienne et bâtiment', url: 'https://www.ademe.fr' },
  { label: 'CSTB — Référentiel diagnostic thermique', url: 'https://www.cstb.fr' },
  { label: 'Effinergie — Label BBC + tests étanchéité', url: 'https://www.effinergie.org' },
  { label: 'France Rénov’ — Diagnostic thermique', url: 'https://france-renov.gouv.fr' },
]

const relatedPages = [
  {
    label: 'Hub Diagnostic énergétique',
    href: '/renovation-energetique/diagnostic',
    description: 'DPE + audit + thermographie comparés',
  },
  {
    label: 'DPE 2026',
    href: '/renovation-energetique/diagnostic/dpe',
    description: 'Note A-G obligatoire vente/location',
  },
  {
    label: 'Audit énergétique 2026',
    href: '/renovation-energetique/diagnostic/audit-energetique',
    description: 'Obligatoire vente F/G/E + Parcours MPR',
  },
  {
    label: 'Isolation par l’extérieur (ITE)',
    href: '/renovation-energetique/travaux/isolation/exterieure-ite',
    description: 'Thermographie utile avant et après ITE',
  },
  {
    label: 'Hub Travaux rénovation',
    href: '/renovation-energetique/travaux',
    description: '4 clusters travaux + ordre logique',
  },
  {
    label: 'Trouver un artisan RGE',
    href: '/rge/renovation-energetique',
    description: 'Annuaire vérifié quotidiennement',
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
    section: 'Thermographie',
    keywords: [
      'thermographie',
      'thermographie infrarouge',
      'camera thermique maison',
      'thermographie batiment',
      'thermographie isolation',
      'pont thermique detection',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Diagnostic', url: '/renovation-energetique/diagnostic' },
    { name: 'Thermographie', url: PAGE_PATH },
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
              { label: 'Diagnostic', href: '/renovation-energetique/diagnostic' },
              { label: 'Thermographie' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Thermometer className="w-3.5 h-3.5" aria-hidden />
              Caméra IR — détection ponts thermiques
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Thermographie infrarouge 2026 : prix et méthode
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              La <strong>thermographie infrarouge</strong> cartographie les déperditions thermiques
              d’un bâtiment grâce à une caméra IR. Elle révèle <strong>ponts thermiques</strong>,
              défauts d’isolation cachés, infiltrations d’air et humidité — invisibles à l’œil nu.
              Prix 2026 : <strong>200 à 500 € TTC</strong>, réalisation en hiver par thermographe
              certifié. Outil incontournable AVANT ITE/ITI ou APRÈS travaux pour vérifier la qualité
              de pose.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2 id="defauts">6 défauts détectés par thermographie</h2>
            <div className="not-prose grid gap-3 my-6">
              {DEFAUTS.map((d) => (
                <div key={d.type} className="bg-white border border-sand-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-700 grid place-items-center shrink-0">
                      <Search className="w-5 h-5" aria-hidden />
                    </div>
                    <div>
                      <p className="font-semibold text-sand-900 m-0 mb-1">{d.type}</p>
                      <p className="text-sm text-sand-700 m-0">{d.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <h2 id="quand-faire">5 moments clés pour faire une thermographie</h2>
            <div className="not-prose grid gap-3 my-6">
              {QUAND_FAIRE.map((q) => (
                <div key={q.cas} className="bg-white border border-sand-200 rounded-xl p-4">
                  <p className="font-semibold text-sand-900 m-0 mb-1">→ {q.cas}</p>
                  <p className="text-sm text-sand-700 m-0">{q.detail}</p>
                </div>
              ))}
            </div>

            <h2 id="prix">Prix thermographie 2026</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Type de bien</th>
                    <th className="p-3 border-b border-sand-200">Prix moyen 2026</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-sand-100">
                    <td className="p-3 font-medium">Appartement T2/T3</td>
                    <td className="p-3 text-primary-700 font-semibold">200-300 €</td>
                  </tr>
                  <tr className="border-b border-sand-100">
                    <td className="p-3 font-medium">Maison 100 m² (RDC)</td>
                    <td className="p-3 text-primary-700 font-semibold">300-450 €</td>
                  </tr>
                  <tr className="border-b border-sand-100">
                    <td className="p-3 font-medium">Maison &gt; 200 m² ou étages multiples</td>
                    <td className="p-3 text-primary-700 font-semibold">400-600 €</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Forfait combiné DPE + audit + thermographie</td>
                    <td className="p-3 text-primary-700 font-semibold">800-1 500 €</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-sand-500">
              Prix libres, comparer 2 devis. Pas de prise en charge MaPrimeRénov’ (non obligatoire).
              Forfaits combinés DPE + audit + thermographie souvent économiques.
            </p>

            <h2 id="etapes">Comment se passe une thermographie</h2>
            <div className="not-prose my-6">
              <ol className="space-y-3 list-none m-0 p-0">
                {ETAPES.map((s, i) => (
                  <li
                    key={s.step}
                    className="bg-white border border-sand-200 rounded-xl p-4 flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-700 text-white grid place-items-center shrink-0 font-bold">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-sand-900 m-0">{s.step}</p>
                      <p className="text-sm text-sand-700 mt-1 mb-0">{s.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Estimer votre projet rénovation post-diagnostic
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Calcul aides MPR + CEE + éco-PTZ selon votre note DPE actuelle et travaux à
                    réaliser. Mise en relation avec un artisan RGE Qualibat ITE.
                  </p>
                  <Link
                    href="/simulateur-aides-renovation"
                    className="inline-flex items-center gap-1.5 bg-primary-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-800 transition-colors"
                  >
                    Lancer le simulateur <ArrowRight className="w-4 h-4" aria-hidden />
                  </Link>
                </div>
              </div>
            </div>

            <h2 id="qualite-camera">Qualité caméra IR : ce qui compte</h2>
            <ul>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Résolution thermique</strong> : 320×240 minimum (caméras Flir E54, Testo
                883). Évitez les caméras &lt; 160×120 (résolution insuffisante pour bâtiment).
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Sensibilité thermique</strong> : NETD ≤ 50 mK pour une bonne précision sur
                les écarts faibles (défauts isolation subtils).
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Plage de température</strong> : -20 à +120°C minimum (couvre tous les cas
                résidentiels).
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Marques fiables</strong> : Flir, Testo, Fluke, Optris, Hikmicro (alternative
                chinoise correcte).
              </li>
            </ul>
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
                    className="flex items-start justify-between gap-2 bg-white border border-sand-200 rounded-lg p-4 hover:border-primary-400 hover:shadow-sm transition-all"
                  >
                    <div>
                      <p className="text-sm font-semibold text-sand-900 m-0">{g.label}</p>
                      <p className="text-xs text-sand-600 mt-1 mb-0">{g.description}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-sand-400 shrink-0 mt-1" aria-hidden />
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
              href="/renovation-energetique/diagnostic"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Hub Diagnostic
            </Link>
            <Link
              href="/renovation-energetique/travaux/isolation"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Isolation thermique <Coins className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
