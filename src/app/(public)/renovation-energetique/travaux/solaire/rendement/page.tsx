/**
 * Page : /renovation-energetique/travaux/solaire/rendement
 *
 * @kw-primary    rendement panneau solaire
 * @kw-volume     3200
 * @kw-kd         6
 * @kw-cpc        0.85
 * @intent        info
 * @cluster       reno-energetique-solaire-rendement
 * @ahrefs-source docs/ahrefs-audit-2026-05/SNAPSHOT-AUDIT-AHREFS-RENOVATION-2026-05-06.md (P0 #10)
 * @snapshot      2026-05-06 (Bloc 1 — quota Ahrefs API restreint, à re-valider 18/05)
 * @backlog-item  P0 ABSENT Bloc 1 — rendement panneau solaire (cluster solaire goldmine 230K)
 *
 * KW cibles (Bloc 1 + estimation longue traîne) :
 * - "rendement panneau solaire"         → ~3 200 vol, KD 6 ⭐⭐⭐⭐ PIVOT
 * - "rendement panneau photovoltaique"  → ~600 vol, KD 7
 * - "rendement panneaux solaires"       → ~400 vol, KD 5 (variant pluriel)
 * - "meilleur rendement panneau solaire"→ ~250 vol, KD 8
 * - "rendement pv"                      → ~200 vol, KD 5
 * - "perte rendement panneau solaire"   → ~150 vol, KD 3
 * - "calcul rendement panneau solaire"  → ~200 vol, KD 4
 * - Famille cumulée pivot : ~5 000 vol/mois (KD avg 5)
 *
 * Easy win : MOYEN (KD 6 sur pivot, intent technique propriétaire info pur).
 * Concurrence : Engie/EDF, In Sun We Trust, Otovo, MyShop. SA atout : focus
 * data-driven (rendement par techno, par climat, dégradation 25 ans, calcul ROI).
 *
 * Anti-cannibalisation :
 *   - Hub /solaire/ = "panneau solaire prix" 6 300 vol (head term commercial)
 *   - /solaire/autoconsommation/ = "autoconsommation solaire" 2.4K (intent commerce)
 *   - /solaire/panneau-1000w/, /panneau-piscine/, /panneau-souple/ = capacité/usage
 *   - /solaire/nettoyage/ = entretien (impact rendement mais pas focus)
 *   - Cette page = focus TECHNIQUE rendement (% conversion, technos comparées,
 *     facteurs d'influence, dégradation 25 ans, calcul ROI précis).
 *
 * E-E-A-T : ADEME, INES (Institut National Énergie Solaire), HESPUL,
 *           Photovoltaique.info, IEC 61215 (norme tests).
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Calculator, Sun, TrendingUp, Zap } from 'lucide-react'

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

const PAGE_PATH = '/renovation-energetique/travaux/solaire/rendement'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'marc-lefebvre'
const AUTHOR_NAME = 'Marc Lefebvre'

const TITLE = 'Rendement panneau solaire 2026 : technos, calcul, dégradation 25 ans'
const DESCRIPTION =
  'Rendement panneau solaire 2026 : monocristallin 18-22 %, polycristallin 14-17 %, amorphe 6-9 %. Facteurs d’influence, calcul ROI, garantie 25 ans.'

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
  'Rendement = % énergie solaire reçue convertie en électricité utile. Mesuré en conditions standard STC (1 000 W/m², 25 °C, AM 1,5).',
  'Monocristallin (top 2026) : 18-22 % rendement, prix 0,9-1,3 €/Wc. Domine 90 % du marché résidentiel.',
  'Polycristallin : 14-17 %, plus économique mais moins efficace en faible luminosité. En recul.',
  'Amorphe (couches minces) : 6-9 %, niche fourgon/bateau/abri (panneaux souples).',
  'Dégradation linéaire ~0,5 %/an : à 25 ans, panneau garde 87,5 % de sa puissance initiale (garantie constructeur).',
  'Facteurs réels : climat (sud +20 % vs nord), orientation (sud > sud-est/ouest > nord), ombrage (-30 % à -100 %).',
]

const TECHNOS = [
  {
    type: 'Monocristallin (Mono PERC)',
    rendement: '18 - 22 %',
    prix: '0,90 - 1,30 €/Wc',
    duree: '25-30 ans',
    avantages: 'Meilleur rendement, performant en faible lumière, esthétique uniforme noire.',
    inconvenients:
      'Plus cher au Wc. Sensible aux ombrages partiels (sauf modules avec optimiseurs).',
    usage: 'Standard 2026 — toiture résidentielle ouverte au soleil.',
  },
  {
    type: 'Polycristallin (Multi)',
    rendement: '14 - 17 %',
    prix: '0,70 - 1,00 €/Wc',
    duree: '20-25 ans',
    avantages: 'Moins cher au Wc, meilleur comportement haute température, aspect bleu uniforme.',
    inconvenients: 'Surface 15-20 % plus grande pour même puissance. En perte de marché vs mono.',
    usage: 'Niche budget contraint + grande toiture sans contrainte surface.',
  },
  {
    type: 'Amorphe / Couches minces',
    rendement: '6 - 9 %',
    prix: '0,50 - 0,80 €/Wc',
    duree: '10-15 ans',
    avantages: 'Léger, flexible, pose sur surface irrégulière (camping-car, bateau, abri jardin).',
    inconvenients:
      'Surface 2-3× plus grande pour même puissance. Dégradation initiale rapide (10-20 % la 1ère année).',
    usage: 'Mobilité (camping-car/bateau) ou toiture impossible à percer.',
  },
  {
    type: 'Bifacial',
    rendement: '19 - 23 %',
    prix: '1,10 - 1,60 €/Wc',
    duree: '25-30 ans',
    avantages:
      'Capte la lumière des 2 faces (+10-30 % production avec sol clair). Garantie 30 ans fréquente.',
    inconvenients: 'Pose plus complexe (espace sous-panneau). Surcoût 10-25 % vs mono classique.',
    usage: 'Au sol sur surface réfléchissante (gravier clair, neige, eau). Niche.',
  },
  {
    type: 'Hybride PV-T (thermique)',
    rendement: '15-19 % élec + 50-65 % thermique',
    prix: '1,80 - 2,50 €/Wc',
    duree: '20-25 ans',
    avantages:
      'Produit électricité ET chauffe ECS sanitaire. Refroidit le PV (rendement élec +10-15 %).',
    inconvenients: 'Compatibilité ballon ECS limitée. Coût élevé. Niche premium.',
    usage: 'Maison BBC + ballon thermodynamique compatible.',
  },
]

const FACTEURS = [
  {
    facteur: 'Latitude / Climat',
    impact: '+/- 20 %',
    detail:
      'Production annuelle Marseille : ~ 1 400 kWh/kWc. Lille : ~ 1 050 kWh/kWc. Écart 25-35 % entre Sud et Nord France. Choisir une simulation PVGIS officielle (logiciel ADEME).',
  },
  {
    facteur: 'Orientation toiture',
    impact: '-15 % à 0 %',
    detail:
      'Sud pur = 100 %. Sud-Est ou Sud-Ouest = 95 %. Est ou Ouest = 85 %. Nord = 50-60 %. À combiner avec inclinaison optimale 30-35 ° pour latitude France.',
  },
  {
    facteur: 'Inclinaison',
    impact: '-10 % à 0 %',
    detail:
      'Optimum France 30-35 ° (sud). 15 ° = 95 %. 45 ° = 96 %. 60 ° = 90 %. Plat = 88 % (avec auto-nettoyage pluie compromis).',
  },
  {
    facteur: 'Ombrage',
    impact: '-30 % à -100 %',
    detail:
      'Une seule cellule à l’ombre peut bloquer 30 % de production du panneau (effet série). Solutions : optimiseurs SolarEdge / micro-onduleurs Enphase = chaque module indépendant.',
  },
  {
    facteur: 'Température',
    impact: '-0,3 % à -0,5 %/°C',
    detail:
      'Au-delà de 25 °C, chaque degré supplémentaire fait perdre 0,3-0,5 % de rendement. Une journée à 60 °C cellule = -15 %. Importance ventilation arrière + bifacial bien aéré.',
  },
  {
    facteur: 'Salissure',
    impact: '-3 % à -10 %',
    detail:
      'Poussières, pollen, fientes oiseaux, suie. Nettoyage 1-2× / an recommandé (pluie ne suffit pas en zones polluées). Coût pro 100-300 €.',
  },
  {
    facteur: 'Vieillissement',
    impact: '-0,5 %/an',
    detail:
      'Dégradation linéaire constatée 0,3-0,7 %/an selon technologie (mono = 0,3-0,4 %, poly = 0,4-0,6 %, amorphe = 0,8-1 %). À 25 ans : panneau garde 85-90 % de la puissance initiale.',
  },
]

const sources = [
  {
    label: 'ADEME — Photovoltaïque (guide technique 2024)',
    url: 'https://librairie.ademe.fr',
  },
  {
    label: 'INES — Institut National Énergie Solaire',
    url: 'https://www.ines-solaire.org',
  },
  {
    label: 'HESPUL — référent national énergies renouvelables',
    url: 'https://www.hespul.org',
  },
  {
    label: 'Photovoltaique.info — base data PV France',
    url: 'https://www.photovoltaique.info',
  },
  {
    label: 'PVGIS — outil officiel UE simulation production solaire',
    url: 'https://re.jrc.ec.europa.eu/pvg_tools/fr/',
  },
  {
    label: 'IEC 61215 — norme internationale tests panneaux PV',
    url: 'https://webstore.iec.ch/publication/61215',
  },
  {
    label: 'France Rénov’ — Aides photovoltaïque 2026',
    url: 'https://france-renov.gouv.fr',
  },
]

const faqs = [
  {
    question: 'Quel est le rendement moyen d’un panneau solaire en 2026 ?',
    answer:
      'En 2026, le standard résidentiel = monocristallin Mono PERC 18-22 % de rendement (% énergie solaire convertie en électricité). Les meilleurs panneaux haut de gamme atteignent 22-23 % (Sunpower Maxeon, REC Alpha, LG NeON). Le polycristallin 14-17 % est en perte de marché. L’amorphe 6-9 % reste niche. Source : tests IEC 61215 + benchmarks INES 2024.',
  },
  {
    question: 'Comment calculer le rendement réel de mes panneaux ?',
    answer:
      'Formule : Rendement (%) = (Énergie produite / Énergie solaire reçue) × 100. En pratique : 1) Mesurez la production annuelle réelle (kWh) via votre onduleur ou compteur Linky producteur. 2) Calculez l’énergie reçue théorique = surface (m²) × ensoleillement local (kWh/m²/an, voir PVGIS) × 1 (pertes incluses dans STC). 3) Comparez. Une installation 6 kWc (~ 30 m²) à Lyon devrait produire 6 600-7 200 kWh/an. Si vous êtes sous 80 % de l’estimation théorique, vérifiez ombrage, salissure ou panne onduleur.',
  },
  {
    question: 'Le rendement baisse-t-il avec le temps ?',
    answer:
      'OUI, dégradation linéaire ~0,3-0,5 %/an pour le monocristallin (norme IEC 61215). Concrètement : à 10 ans = 95 % du rendement initial. À 20 ans = 90 %. À 25 ans = 87,5 %. La garantie constructeur typique 2026 promet ≥ 80 % à 25 ans (87,5 % pour les panneaux premium). Vérifiez la garantie de production (différente de la garantie produit) avant achat.',
  },
  {
    question: 'L’orientation et l’inclinaison influencent-elles le rendement ?',
    answer:
      'OUI fortement. Un panneau plein sud incliné 30-35 ° produit 100 %. Sud-Est ou Sud-Ouest 30 ° = 95 %. Est ou Ouest 30 ° = 85 %. Plat = 88 % (et risque salissure). Nord = 50-60 % (rarement rentable). Pour optimiser : utilisez l’outil PVGIS (re.jrc.ec.europa.eu) qui calcule la production par latitude/orientation/inclinaison exacte de votre toiture.',
  },
  {
    question: 'L’ombrage tue-t-il le rendement ?',
    answer:
      'OUI brutal. Un panneau classique en série : si une seule cellule (10 % surface) est ombragée, la production de tout le panneau peut chuter de 30 %. Si un panneau entier ombragé partiellement : la chaîne entière de panneaux peut perdre 50 %. Solutions techniques : 1) Optimiseurs SolarEdge (~ 80 €/panneau) ou micro-onduleurs Enphase IQ8 (~ 120 €/panneau) qui rendent chaque module indépendant. 2) Élagage arbres avant pose. 3) Choix architectural minimisant les ombres portées (cheminée, antenne).',
  },
  {
    question: 'Quel rendement attendre en autoconsommation ?',
    answer:
      'Le rendement panneau (18-22 %) reste constant. Mais le taux d’autoconsommation = % de la production effectivement consommée sur place varie de 30 à 70 % selon profil : 1) Sans batterie + journée vide (ménage absent) = 25-35 %. 2) Avec ECS thermodynamique + lave-vaisselle/linge programmés sur production = 40-55 %. 3) Avec batterie 5-10 kWh = 60-80 % (mais ROI batterie > 12 ans en 2026). Optimisation : asservir équipements à la production via routeur solaire (~ 300-500 €).',
  },
  {
    question: 'Les panneaux haut de gamme valent-ils le surcoût ?',
    answer:
      'Cas par cas. Un Sunpower Maxeon (22 %) coûte 1,80-2,20 €/Wc vs un mono standard (18-19 %) 0,90-1,30 €/Wc — soit +60-80 % sur le panneau seul. Sur 25 ans : production +15-20 % couvre rarement le surcoût (ROI étalé). Justifié si : 1) Surface limitée (toit petit, besoin max kWc/m²). 2) Garantie 30 ans (vs 25 ans). 3) Dégradation lente (0,2 %/an). 4) Climat exigeant (haute température, faible lumière). Sinon, un mono standard tier 1 (Trina, Longi, Jinko) = meilleur ratio prix/rendement.',
  },
  {
    question: 'Quel rendement pour un panneau hybride PV-T ?',
    answer:
      'Très spécifique : 15-19 % rendement électrique (un peu moins que mono pur, le système thermique réduit légèrement la performance PV) + 50-65 % rendement thermique (chauffe l’eau). Avantage : le refroidissement du PV par le circuit thermique augmente paradoxalement le rendement élec de 10-15 % par rapport à un mono à même température ambiante. Inconvénient : compatibilité ballon ECS limitée (vérifier compatibilité fabricant), prix 1,80-2,50 €/Wc, marché niche. Justifié uniquement maison BBC + besoin ECS important + réseau plomberie compatible.',
  },
]

export default function RendementPanneauSolairePage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique/travaux' },
    { name: 'Solaire', url: '/renovation-energetique/travaux/solaire' },
    { name: 'Rendement', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: PAGE_PATH,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Travaux — Solaire — Rendement',
    keywords: [
      'rendement panneau solaire',
      'rendement panneau photovoltaique',
      'rendement panneaux solaires',
      'meilleur rendement panneau solaire',
      'rendement pv',
      'perte rendement panneau solaire',
      'calcul rendement panneau solaire',
    ],
  })

  const schemas = [articleSchema, breadcrumbSchema, faqSchema].filter(
    (s): s is Record<string, unknown> => s !== null
  )

  return (
    <>
      <JsonLd data={schemas} />

      <main className="bg-sand-50 min-h-screen">
        <Breadcrumb
          items={[
            { label: 'Rénovation énergétique', href: '/renovation-energetique' },
            { label: 'Travaux', href: '/renovation-energetique/travaux' },
            { label: 'Solaire', href: '/renovation-energetique/travaux/solaire' },
            { label: 'Rendement' },
          ]}
          className="max-w-4xl mx-auto px-4 sm:px-6 pt-6"
        />

        <article className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          <header className="mb-8">
            <p className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
              <Sun className="w-3.5 h-3.5" aria-hidden /> Performance technique
            </p>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-sand-900 mt-3 mb-3 leading-tight">
              Rendement panneau solaire en 2026 : tout sur la performance PV
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Rendement, technologies (mono / poly / amorphe / bifacial / hybride PV-T), facteurs
              d’influence (climat, orientation, ombrage, température), dégradation 25 ans, et calcul
              ROI précis. Sources ADEME, INES, HESPUL, PVGIS officiels.
            </p>
            <LastUpdated date={MODIFIED} label="Mis à jour le" className="mt-3 text-sm" />
          </header>

          <TldrBlock bullets={tldr} />

          <section className="my-10">
            <h2 className="font-heading text-2xl font-bold text-sand-900 mb-4">
              Définition du rendement (conditions STC)
            </h2>
            <p className="text-sand-700 leading-relaxed">
              Le <strong>rendement</strong> d’un panneau solaire est le pourcentage d’énergie
              solaire reçue qu’il convertit en électricité utile. Il est mesuré en{' '}
              <strong>conditions standard de test (STC)</strong> définies par la norme
              internationale IEC 61215 : irradiance 1 000 W/m², température cellule 25 °C, masse
              d’air AM 1,5 (correspond au midi solaire à latitude moyenne).
            </p>
            <p className="text-sand-700 leading-relaxed mt-4">
              En pratique réelle, le rendement instantané varie selon la lumière disponible, la
              température, l’ombrage et la salissure. Le rendement <em>moyen annuel</em> sur une
              toiture française est typiquement 70-85 % du rendement STC affiché par le
              constructeur.
            </p>
          </section>

          <section className="my-10">
            <h2 className="font-heading text-2xl font-bold text-sand-900 mb-4">
              Comparatif des 5 technologies de panneaux solaires
            </h2>
            <p className="text-sand-700 mb-6">
              En 2026, le monocristallin Mono PERC domine ~90 % du marché résidentiel. Les autres
              technologies sont en niche ou en perte de vitesse.
            </p>
            <div className="space-y-4">
              {TECHNOS.map((t) => (
                <div
                  key={t.type}
                  className="bg-white border border-sand-200 rounded-xl p-5 shadow-sm"
                >
                  <div className="flex items-start gap-4 flex-wrap mb-3">
                    <div className="font-heading text-lg font-bold text-sand-900 shrink-0">
                      {t.type}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm mb-3">
                    <div>
                      <p className="text-xs uppercase text-sand-500 mb-0.5">Rendement</p>
                      <p className="font-semibold text-amber-700">{t.rendement}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-sand-500 mb-0.5">Prix HT</p>
                      <p className="font-semibold text-sand-900">{t.prix}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-sand-500 mb-0.5">Durée vie</p>
                      <p className="font-semibold text-sand-900">{t.duree}</p>
                    </div>
                  </div>
                  <p className="text-sm text-sand-700 leading-relaxed mb-1">
                    <strong>+ </strong>
                    {t.avantages}
                  </p>
                  <p className="text-sm text-sand-600 leading-relaxed mb-1">
                    <strong>− </strong>
                    {t.inconvenients}
                  </p>
                  <p className="text-sm text-sand-600 leading-relaxed border-t border-sand-100 pt-2 mt-2">
                    <strong>Usage : </strong>
                    {t.usage}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="my-10">
            <h2 className="font-heading text-2xl font-bold text-sand-900 mb-4">
              7 facteurs qui influencent le rendement réel
            </h2>
            <p className="text-sand-700 mb-6">
              Le rendement STC affiché par le fabricant n’est qu’une référence. Sur votre toiture
              française, ces 7 facteurs déterminent la production réelle annuelle.
            </p>
            <div className="space-y-3">
              {FACTEURS.map((f) => (
                <div
                  key={f.facteur}
                  className="bg-white border border-sand-200 rounded-xl p-5 shadow-sm flex items-start gap-4"
                >
                  <div className="w-12 shrink-0 text-center">
                    <p className="text-xs uppercase text-sand-500 mb-1">Impact</p>
                    <p className="font-bold text-amber-700 text-sm">{f.impact}</p>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sand-900 mb-1">{f.facteur}</h3>
                    <p className="text-sm text-sand-600 leading-relaxed">{f.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="my-10 bg-amber-50 border-2 border-amber-200 rounded-xl p-6">
            <h2 className="font-heading text-xl font-bold text-amber-900 mb-3">
              <Calculator className="inline w-5 h-5 mr-2" aria-hidden />
              Simuler ma production réelle
            </h2>
            <p className="text-sm text-amber-900 mb-4 leading-relaxed">
              <strong>PVGIS</strong> est l’outil officiel de la Commission européenne (Joint
              Research Centre) pour calculer la production solaire annuelle attendue selon votre
              latitude exacte, orientation, inclinaison et technologie. Gratuit, sans inscription.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://re.jrc.ec.europa.eu/pvg_tools/fr/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-amber-700 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-amber-800 transition-colors"
              >
                Outil PVGIS officiel
                <TrendingUp className="w-4 h-4" aria-hidden />
              </a>
              <Link
                href="/simulateur-aides-renovation"
                className="inline-flex items-center gap-2 bg-white border border-amber-300 text-amber-900 px-5 py-2.5 rounded-lg font-semibold hover:bg-amber-50 transition-colors"
              >
                Simulateur aides France Rénov’
                <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
            </div>
          </section>

          <FlagshipFaq items={faqs} />
          <FlagshipSources sources={sources} />

          <section className="my-10">
            <h2 className="font-heading text-xl font-semibold text-sand-900 mb-4">
              Pour aller plus loin
            </h2>
            <ul className="grid gap-3 md:grid-cols-2">
              {[
                {
                  label: 'Hub Solaire — prix, aides, rendement',
                  href: '/renovation-energetique/travaux/solaire',
                },
                {
                  label: 'Autoconsommation solaire — guide complet',
                  href: '/renovation-energetique/travaux/solaire/autoconsommation',
                },
                {
                  label: 'Nettoyage panneau solaire',
                  href: '/renovation-energetique/travaux/solaire/nettoyage',
                },
                {
                  label: 'Panneau solaire 1000W — usage spécifique',
                  href: '/renovation-energetique/travaux/solaire/panneau-1000w',
                },
                {
                  label: 'Panneau solaire piscine — chauffage piscine',
                  href: '/renovation-energetique/travaux/solaire/panneau-piscine',
                },
                {
                  label: 'Panneau solaire souple — fourgon / bateau',
                  href: '/renovation-energetique/travaux/solaire/panneau-souple',
                },
              ].map((g) => (
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
            authorSlug={AUTHOR_SLUG}
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
              href="/renovation-energetique/travaux/solaire/autoconsommation"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Autoconsommation <Zap className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </article>
      </main>
    </>
  )
}
