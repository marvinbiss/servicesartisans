/**
 * Page : /renovation-energetique/travaux/pompe-a-chaleur/puissance
 *
 * @kw-primary    puissance pompe a chaleur
 * @kw-volume     350
 * @kw-kd         0
 * @kw-cpc        0.40
 * @intent        info
 * @cluster       reno-energetique-pac-puissance
 * @ahrefs-source docs/ahrefs-bloc1-keywords-gap-2026-05-04.md
 * @snapshot      2026-05-06 (Bloc 1 + estimation longue traîne)
 * @backlog-item  Sprint 4 PAC long-tail puissance
 *
 * KW cibles (Bloc 1 + estimation longue traîne) :
 * - "puissance pompe a chaleur"          → 350 vol, KD 0 ⭐⭐⭐⭐⭐ MEGA EASY
 * - "calcul puissance pompe a chaleur"   → ~200 vol, KD 0
 * - "dimensionnement pompe a chaleur"    → ~150 vol, KD 1
 * - "puissance pac air eau"              → ~120 vol, KD 0
 * - "puissance pac maison 100m2"         → ~100 vol, KD 0
 * - Famille cumulée pivot : ~920 vol/mois (KD 0-1)
 *
 * Easy win : OUI ABSOLU (KD 0 sur pivot, intent technique précis)
 * Cluster pillar : Rénovation Énergétique → Travaux → PAC → Puissance
 *
 * Anti-cannibalisation :
 *   - Hub /pompe-a-chaleur/ = comparatif 3 types + dimensionnement section
 *   - /installation/ = chantier 8 étapes (mention bilan thermique)
 *   - Cette page = focus DIMENSIONNEMENT (méthode NF EN 12831 déperditions G,
 *     calcul kW selon surface/isolation/climat, cas types maison 80/100/150 m²,
 *     erreurs sous/sur-dim).
 *
 * E-E-A-T :
 *   - Norme NF EN 12831 (calcul déperditions thermiques)
 *   - DTU 65.16 (dimensionnement chauffage)
 *   - AFPAC, ADEME (méthodes calcul)
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, AlertTriangle, Calculator, CheckCircle2, Ruler } from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import LastUpdated from '@/components/seo/LastUpdated'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import SimulateurAideBox from '@/components/conversion/SimulateurAideBox'
import PrixComparatif from '@/components/conversion/PrixComparatif'
import LocalProviderShowcase from '@/components/seo/LocalProviderShowcase'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { getProvidersByService } from '@/lib/supabase'

export const revalidate = 86400

const PAGE_PATH = '/renovation-energetique/travaux/pompe-a-chaleur/puissance'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'jean-pierre-duval'
const AUTHOR_NAME = 'Jean-Pierre Duval'

const TITLE = 'Puissance PAC : calcul kW selon surface + isolation 2026'
const DESCRIPTION =
  'Puissance pompe à chaleur 2026 : calcul kW selon surface, isolation, climat (méthode NF EN 12831). Cas types maison 80/100/150 m² + erreurs sous/sur-dim.'

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
  'La puissance d’une PAC se calcule par bilan thermique (déperditions G) selon la norme NF EN 12831 — JAMAIS au feeling.',
  'Règle empirique : 60-100 W/m² selon isolation. Maison 100 m² RT 2012 = 6-7 kW ; 100 m² années 80 = 9-10 kW.',
  '4 facteurs : surface chauffée, niveau d’isolation, zone climatique (H1a-H3), température intérieure souhaitée.',
  'Sur-dimensionnement (PAC trop grosse) = cycles courts, usure compresseur, COP réel dégradé. À éviter ABSOLUMENT.',
  'Sous-dimensionnement (PAC trop petite) = appoints électriques fréquents, factures élevées. À éviter aussi.',
  'Marge à prévoir : +10 % à +15 % vs déperditions calculées (jamais plus).',
]

const CAS_TYPES = [
  {
    surface: '60 m²',
    iso: 'RT 2012 (récente)',
    climat: 'H2 (Centre-Ouest)',
    deperditions: '3,5 kW',
    pacRecommandee: '4 kW',
  },
  {
    surface: '80 m²',
    iso: 'RT 2012',
    climat: 'H2',
    deperditions: '4,8 kW',
    pacRecommandee: '5-6 kW',
  },
  {
    surface: '100 m²',
    iso: 'RT 2012',
    climat: 'H2',
    deperditions: '6 kW',
    pacRecommandee: '6-7 kW',
  },
  {
    surface: '100 m²',
    iso: 'Années 80 (peu isolée)',
    climat: 'H2',
    deperditions: '9 kW',
    pacRecommandee: '9-10 kW',
  },
  {
    surface: '130 m²',
    iso: 'RT 2012',
    climat: 'H2',
    deperditions: '7,8 kW',
    pacRecommandee: '8-9 kW',
  },
  {
    surface: '130 m²',
    iso: 'Années 80',
    climat: 'H1a (Nord-Est)',
    deperditions: '13 kW',
    pacRecommandee: '14 kW',
  },
  {
    surface: '180 m²',
    iso: 'RT 2012',
    climat: 'H2',
    deperditions: '10,8 kW',
    pacRecommandee: '11-12 kW',
  },
  {
    surface: '180 m²',
    iso: 'Mal isolée',
    climat: 'H1a',
    deperditions: '18 kW',
    pacRecommandee: '16 kW + appoint',
  },
]

const REGLE_EMPIRIQUE = [
  {
    iso: 'Très bien isolée (RT 2012, RE 2020)',
    wPerM2: '50-65 W/m²',
    note: 'Maisons neuves récentes',
  },
  {
    iso: 'Bien isolée (rénovée 2010+)',
    wPerM2: '60-80 W/m²',
    note: 'Isolation combles + ITE/ITI partielles',
  },
  {
    iso: 'Moyennement isolée (années 90)',
    wPerM2: '80-100 W/m²',
    note: 'Isolation combles seule typique',
  },
  {
    iso: 'Peu isolée (années 70-80)',
    wPerM2: '100-130 W/m²',
    note: 'Pas d’isolation ou très partielle',
  },
  {
    iso: 'Mal isolée (avant 1970)',
    wPerM2: '130-180 W/m²',
    note: 'Isolation minimale ou nulle',
  },
]

const faqs = [
  {
    question: 'Comment calculer la puissance d’une pompe à chaleur ?',
    answer:
      'Méthode officielle : bilan thermique selon NF EN 12831 par un artisan RGE QualiPAC. Inputs : surface habitable, hauteur sous plafond, niveau d’isolation (combles/murs/menuiseries), zone climatique (H1a/H1b/H1c/H2a-d/H3), température intérieure souhaitée (typiquement 19-20 °C). Output : déperditions G en kW. Règle empirique pour estimation rapide : 50-65 W/m² (RT 2012), 80-100 W/m² (années 90), 130-180 W/m² (avant 1970). Maison 100 m² RT 2012 = ~6 kW ; années 80 = ~9 kW ; mal isolée = ~13 kW.',
  },
  {
    question: 'Quelle PAC choisir pour une maison de 100 m² ?',
    answer:
      'Cela dépend principalement de l’isolation et du climat : (1) Maison 100 m² RT 2012 zone tempérée = PAC 6-7 kW ; (2) Maison 100 m² années 80 zone tempérée = PAC 9-10 kW ; (3) Maison 100 m² mal isolée zone froide = PAC 11-12 kW + isolation préalable conseillée. La règle d’or : NE JAMAIS dimensionner sans bilan thermique. Le bilan est généralement gratuit avec un devis RGE QualiPAC.',
  },
  {
    question: 'Quelle est la différence entre déperditions G et puissance PAC ?',
    answer:
      'Les déperditions G représentent les pertes thermiques de la maison à la température de base (-7 °C ou -10 °C selon zone). La puissance PAC doit COUVRIR ces déperditions au pire cas climatique, avec une marge de sécurité de 10-15 %. Exemple : maison 100 m² RT 2012 avec déperditions G = 6 kW → PAC 6,5-7 kW (et non 8-10 kW). Marge plus grande = sur-dimensionnement = cycles courts = usure prématurée.',
  },
  {
    question: 'Que se passe-t-il si la PAC est sous-dimensionnée ?',
    answer:
      'Une PAC sous-dimensionnée tournera 100 % du temps en hiver sans atteindre la température demandée → activation des appoints électriques (résistance ou chaudière hybride) qui consomment massivement. Conséquences : (1) facture EDF gonflée +30-50 % vs prévision ; (2) confort dégradé (T° intérieure 17-18 °C au lieu de 20 °C) ; (3) compresseur à charge constante, usure +20 %. Cause typique : artisan qui sous-dimensionne pour faire baisser le prix devis.',
  },
  {
    question: 'Que se passe-t-il si la PAC est sur-dimensionnée ?',
    answer:
      'Une PAC sur-dimensionnée s’arrête et redémarre fréquemment (cycles courts ON/OFF). Conséquences : (1) usure prématurée du compresseur (durée vie -30 à -40 %) ; (2) COP réel dégradé (mesuré 3,2 au lieu de 4,2 théorique) ; (3) bruit et vibrations plus fréquents. Coût caché : remplacement compresseur à 8-10 ans (3 000 €) au lieu de 12-15 ans normalement. Refuser tout devis avec puissance > +20 % vs déperditions calculées.',
  },
  {
    question: 'Quel est le rôle de la zone climatique en France ?',
    answer:
      'Le bilan thermique tient compte de la zone climatique RT 2012 : H1a (Nord-Est, le plus froid, T° base -10 °C) → H1b → H1c → H2a → H2b → H2c (Centre-Ouest, T° base -7 °C) → H2d → H3 (Sud-Est, le plus doux, T° base -3 °C). Une même maison 100 m² RT 2012 demande 7 kW en H1a (Strasbourg) mais seulement 5 kW en H3 (Marseille). À surface et isolation égales, l’écart peut atteindre +30 % entre H1a et H3.',
  },
  {
    question: 'Pourquoi isoler avant d’installer la PAC ?',
    answer:
      'Trois raisons majeures : (1) PAC plus PETITE = moins chère à l’achat (-2 000 à -4 000 €) ; (2) PAC mieux dimensionnée = COP réel optimal (4,2 vs 3,2) → facture élec −30 % ; (3) MaPrimeRénov’ Parcours accompagné majorée si bouquet isolation + PAC (jusqu’à +10 % bonus). Ordre conseillé : combles 30 cm + ITE/ITI + menuiseries (si nécessaires) → bilan thermique post-isolation → choix PAC adaptée.',
  },
]

const sources = [
  {
    label: 'AFNOR — Norme NF EN 12831 (calcul déperditions thermiques)',
    url: 'https://www.afnor.org',
  },
  {
    label: 'AFNOR — DTU 65.16 (dimensionnement chauffage)',
    url: 'https://www.afnor.org',
  },
  {
    label: 'AFPAC — Méthodes de dimensionnement PAC',
    url: 'https://www.afpac.org',
  },
  {
    label: 'ADEME — Calcul puissance chauffage',
    url: 'https://librairie.ademe.fr',
  },
]

const relatedPages = [
  {
    label: 'Hub Pompe à chaleur',
    href: '/renovation-energetique/travaux/pompe-a-chaleur',
  },
  {
    label: 'Installation PAC : 8 étapes + RGE',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/installation',
  },
  {
    label: 'Coût total PAC sur 15 ans',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/cout-total',
  },
  {
    label: 'Hub Isolation',
    href: '/renovation-energetique/travaux/isolation',
  },
  {
    label: 'Audit énergétique',
    href: '/renovation-energetique/diagnostic/audit-energetique',
  },
  {
    label: 'Simulateur aides 2026',
    href: '/simulateur-aides-renovation',
  },
]

export default async function Page() {
  const providers = await getProvidersByService('chauffagiste', 6)
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: PAGE_PATH,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Travaux — PAC — Puissance',
    keywords: [
      'puissance pompe à chaleur',
      'calcul puissance PAC',
      'dimensionnement PAC',
      'kW pompe à chaleur',
      'NF EN 12831',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique/travaux' },
    { name: 'Pompe à chaleur', url: '/renovation-energetique/travaux/pompe-a-chaleur' },
    { name: 'Puissance', url: PAGE_PATH },
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
              { label: 'Pompe à chaleur', href: '/renovation-energetique/travaux/pompe-a-chaleur' },
              { label: 'Puissance' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Ruler className="w-3.5 h-3.5" aria-hidden />
              PAC &middot; Puissance &amp; dimensionnement
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Calcul de la puissance d’une pompe à chaleur
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              La puissance d’une PAC dépend de quatre facteurs : <strong>surface</strong>,{' '}
              <strong>isolation</strong>, <strong>zone climatique</strong> et{' '}
              <strong>température intérieure souhaitée</strong>. Méthode officielle : bilan
              thermique NF EN 12831. Voici les cas types maison 60-180 m², la règle empirique 50 à
              180 W/m² et les pièges à éviter.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Règle empirique W/m² par niveau d’isolation</h2>
            <p>Pour une estimation rapide AVANT bilan thermique officiel :</p>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Niveau d’isolation</th>
                    <th className="p-3 border-b border-sand-200">W/m²</th>
                    <th className="p-3 border-b border-sand-200 hidden md:table-cell">Note</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {REGLE_EMPIRIQUE.map((row) => (
                    <tr key={row.iso} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold">{row.iso}</td>
                      <td className="p-3 font-semibold text-primary-800 whitespace-nowrap">
                        {row.wPerM2}
                      </td>
                      <td className="p-3 text-sand-600 hidden md:table-cell">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Estimation zone H2 (Centre-Ouest), 19-20 °C intérieur. Multiplier par 1,15 en H1a
                (Nord-Est), par 0,85 en H3 (Sud).
              </p>
            </div>

            <h2>Cas types par surface et isolation</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Surface</th>
                    <th className="p-3 border-b border-sand-200 hidden md:table-cell">Isolation</th>
                    <th className="p-3 border-b border-sand-200">Climat</th>
                    <th className="p-3 border-b border-sand-200">Déperditions</th>
                    <th className="p-3 border-b border-sand-200">PAC</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {CAS_TYPES.map((row) => (
                    <tr
                      key={`${row.surface}-${row.iso}`}
                      className="border-b border-sand-100 last:border-0"
                    >
                      <td className="p-3 font-semibold whitespace-nowrap">{row.surface}</td>
                      <td className="p-3 text-sand-700 hidden md:table-cell">{row.iso}</td>
                      <td className="p-3 whitespace-nowrap">{row.climat}</td>
                      <td className="p-3 whitespace-nowrap">{row.deperditions}</td>
                      <td className="p-3 font-semibold text-primary-800 whitespace-nowrap">
                        {row.pacRecommandee}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Hypothèses 19-20 °C intérieur, hauteur sous plafond 2,5 m, hauteur unique. Source :
                NF EN 12831 + DTU 65.16. Sources : AFNOR, AFPAC.
              </p>
            </div>

            <h2>Erreurs à éviter (sous/sur-dimensionnement)</h2>
            <div className="not-prose grid gap-3 my-6">
              <div className="bg-white border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
                <div>
                  <p className="font-semibold text-sand-900 m-0">
                    Sous-dimensionnement (-15 % ou plus)
                  </p>
                  <p className="text-sm text-sand-700 m-0 mt-1">
                    PAC trop petite → appoints électriques fréquents → facture EDF gonflée +30-50 %.
                    Cause typique : artisan qui sous-dimensionne pour réduire le prix devis. Refuser
                    si déperditions G non chiffrées dans le devis.
                  </p>
                </div>
              </div>
              <div className="bg-white border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
                <div>
                  <p className="font-semibold text-sand-900 m-0">
                    Sur-dimensionnement (+20 % ou plus)
                  </p>
                  <p className="text-sm text-sand-700 m-0 mt-1">
                    PAC trop grosse → cycles courts ON/OFF → usure compresseur → durée vie -30 à -40
                    %. COP réel mesuré 3,2 vs 4,2 théorique. Refuser tout devis qui surestime par
                    excès de précaution.
                  </p>
                </div>
              </div>
            </div>

            <h2>Marge de sécurité conseillée</h2>
            <ul>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Marge à appliquer :</strong> +10 % à +15 % vs déperditions calculées
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Exemple :</strong> déperditions 6 kW → PAC 6,6 à 6,9 kW (gamme commerciale
                la plus proche : 7 kW)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Pas plus de +15 % :</strong> au-delà → cycles courts → durée vie réduite
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Cas climat très froid (H1a)</strong> : ajouter +5 % pour pic -15 °C
                exceptionnel
              </li>
            </ul>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Bilan thermique gratuit
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    3 artisans RGE QualiPAC réalisent un bilan thermique chiffré (NF EN 12831) +
                    proposent la PAC adaptée + simulent les aides 2026. Devis sous 48h, sans
                    engagement.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/simulateur-aides-renovation"
                      className="inline-flex items-center gap-1.5 bg-primary-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
                    >
                      Simulateur aides <ArrowRight className="w-4 h-4" aria-hidden />
                    </Link>
                    <Link
                      href="/devis"
                      className="inline-flex items-center gap-1.5 bg-white text-primary-700 border border-primary-200 px-4 py-2 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
                    >
                      Demander 3 devis <ArrowRight className="w-4 h-4" aria-hidden />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </article>

          <PrixComparatif
            title="Gammes de puissance 2026 : 5 marques de 6 à 16 kW"
            caption="Plages de puissance disponibles par marque. Le choix kW dépend du bilan thermique NF EN 12831. Source : fiches techniques constructeurs."
            withSchema
            rows={[
              {
                brand: 'Daikin',
                model: 'Altherma 3 H HT (6-16 kW)',
                priceRange: '12 000 – 18 000 €',
                cop: 4.3,
                warranty: '5 ans',
                rating: 4.5,
                notes: 'Plage large 6/8/11/14/16 kW',
                highlight: true,
              },
              {
                brand: 'Mitsubishi Electric',
                model: 'Ecodan PUZ-WM (5-14 kW)',
                priceRange: '11 500 – 17 500 €',
                cop: 4.2,
                warranty: '5 ans (7 ans auto)',
                rating: 4.5,
                notes: 'Modulation Inverter 30-100 %',
              },
              {
                brand: 'Atlantic',
                model: 'Alfea Excellia (6-16 kW)',
                priceRange: '10 000 – 15 000 €',
                cop: 4.0,
                warranty: '2 – 5 ans',
                rating: 4.0,
                notes: '6/8/10/12/14/16 kW au catalogue FR',
              },
              {
                brand: 'Daikin',
                model: 'Altherma H Hybrid (8-12 kW)',
                priceRange: '14 000 – 21 000 €',
                cop: 4.5,
                warranty: '5 ans',
                rating: 4.5,
                notes: 'Appoint gaz si pointe > 12 kW',
              },
              {
                brand: 'Hitachi',
                model: 'Yutaki S (5-16 kW)',
                priceRange: '11 000 – 16 500 €',
                cop: 4.1,
                warranty: '5 ans',
                rating: 4.0,
                notes: 'Plage 5-16 kW, modulation continue',
              },
            ]}
          />
          <SimulateurAideBox
            serviceKey="pompe-a-chaleur"
            estimatedSaving={5000}
            subtitle="MaPrimeRénov' jusqu'à 5 000 € + CEE BAR-TH-171 ~4 000 €"
          />
          <LocalProviderShowcase
            providers={providers}
            serviceName="chauffagiste RGE QualiPAC"
            cityName=""
            max={3}
          />
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
              href="/renovation-energetique/travaux/pompe-a-chaleur"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Hub Pompe à chaleur
            </Link>
            <Link
              href="/renovation-energetique/travaux/pompe-a-chaleur/installation"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Installation PAC <ArrowRight className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
