/**
 * Page : /renovation-energetique/travaux/pompe-a-chaleur/air-air-prix
 *
 * @kw-primary    pompe a chaleur air air
 * @kw-volume     6404
 * @kw-kd         8
 * @kw-cpc        1.10
 * @intent        commercial
 * @cluster       reno-energetique-pac-air-air-prix
 * @ahrefs-source api-live
 * @snapshot      2026-05-06
 * @backlog-item  Sprint 2 PAC air-air JACKPOT KD 8 vol 6404
 *
 * KW cibles (validés Ahrefs API live, snapshot 2026-05-03, country=fr) :
 * - "pompe a chaleur air air"          → 6 404 vol, KD 8, CPC $1,10, clicks 9 387 ⭐⭐⭐ JACKPOT
 * - "prix pompe a chaleur air air"     → 1 458 vol, KD 0, CPC $0,90, clicks 1 864 ⭐⭐
 * - "pac air air"                      → longue traîne
 * - "climatisation reversible"         → variant
 * - Famille cumulée pivot : ~9 000 vol/mois (KD 0-8 = easy win majeur)
 *
 * Source : audit Ahrefs API live (cf docs/ahrefs-audit-2026-04/STRATEGIE-RENOVATION-ENERGETIQUE.md)
 * Easy win : OUI MAJEUR (KD 8 sur KW pivot 6 404 vol, KD 0 sur prix)
 *            Concurrence faible — pages produits constructeurs (Mitsubishi, Daikin) + comparateurs
 *            Atout SA : positionnement "non éligible MPR + alternatives" (différenciant honnête)
 * Cluster pillar : Rénovation Énergétique → Travaux → Pompe à chaleur → Air-air prix
 *
 * Anti-cannibalisation :
 *   - Hub /pompe-a-chaleur = comparatif 3 types PAC
 *   - Sub /air-eau-prix = pivot KW 2 263 vol PAC pour chauffage central
 *   - Cette page = focus PAC air-air (climatisation réversible) — distinct intent
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  AlertTriangle,
  Calculator,
  CheckCircle2,
  Coins,
  Snowflake,
  ThermometerSun,
  XCircle,
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

const PAGE_PATH = '/renovation-energetique/travaux/pompe-a-chaleur/air-air-prix'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-04'
const MODIFIED = '2026-05-04'
const AUTHOR_SLUG = 'jean-pierre-duval'
const AUTHOR_NAME = 'Jean-Pierre Duval'

const TITLE = 'PAC air-air 2026 : prix & modèles'
const DESCRIPTION =
  'Pompe à chaleur air-air 2026 : prix par puissance (mono / bi / multi-split), installation, COP, consommation. Pourquoi non éligible MPR.'

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
  'PAC air-air = climatisation réversible (chauffage hiver + rafraîchissement été).',
  'Prix posé : 1 800-3 500 € (mono-split), 4 000-7 000 € (bi-split), 7 000-13 000 € (multi-split 4 unités).',
  'COP saisonnier 3-4 (efficace mais inférieur PAC air-eau qui atteint 4-5).',
  'NON éligible MaPrimeRénov’ depuis 2022. Éligible CEE Coup de pouce dans certains cas (remplacement chaudière).',
  'Alternative à privilégier : PAC air-eau (chauffage central + ECS, MPR jusqu’à 5 000 €).',
  'Installation par frigoriste qualifié obligatoire (manipulation fluide R-32 / R-410A).',
]

const PRIX = [
  {
    type: 'Mono-split (1 unité intérieure)',
    surface: '20-40 m² (1 pièce)',
    prix: '1 800-3 500 € posé',
    cop: '3,5-4',
    detail: 'Idéal studio, salon principal, bureau. Installation 1 jour.',
  },
  {
    type: 'Bi-split (2 unités intérieures)',
    surface: '40-80 m² (2 pièces)',
    prix: '4 000-7 000 € posé',
    cop: '3,3-3,8',
    detail: 'Salon + chambre. Plus économique qu’une mono-split par pièce.',
  },
  {
    type: 'Tri-split (3 unités)',
    surface: '60-120 m² (3 pièces)',
    prix: '6 000-10 000 € posé',
    cop: '3,2-3,7',
    detail: 'Salon + 2 chambres ou T3 complet.',
  },
  {
    type: 'Quadri / Multi-split (4-5 unités)',
    surface: '100-180 m² (4-5 pièces)',
    prix: '7 000-13 000 € posé',
    cop: '3,0-3,5',
    detail:
      'Maison T4-T5 complète. Limite : 1 thermostat unique pour toutes les unités d’une même groupe extérieur.',
  },
  {
    type: 'Gainable (centralisée)',
    surface: '80-200 m²',
    prix: '8 000-15 000 € posé',
    cop: '3,2-3,8',
    detail:
      'Diffusion par gaines dans faux plafond. Esthétique pure (grilles discrètes) mais coût élevé et travaux importants.',
  },
]

const COMPARATIF = [
  {
    critere: 'Prix posé (10 kW)',
    air_air: '4 000-10 000 €',
    air_eau: '12 000-15 000 €',
    avantage: 'air-air',
  },
  {
    critere: 'COP saisonnier',
    air_air: '3,0-3,8',
    air_eau: '3,5-4,5',
    avantage: 'air-eau',
  },
  {
    critere: 'Eau chaude sanitaire (ECS)',
    air_air: 'Non',
    air_eau: 'Oui (avec ballon)',
    avantage: 'air-eau',
  },
  {
    critere: 'Chauffage central (radiateurs/plancher)',
    air_air: 'Non',
    air_eau: 'Oui',
    avantage: 'air-eau',
  },
  {
    critere: 'Rafraîchissement été (clim)',
    air_air: 'Oui (réversible)',
    air_eau: 'Non sauf modèle réversible',
    avantage: 'air-air',
  },
  {
    critere: 'MaPrimeRénov’',
    air_air: 'Non éligible',
    air_eau: '3 000-5 000 €',
    avantage: 'air-eau',
  },
  {
    critere: 'CEE Coup de pouce',
    air_air: 'Limité (remplacement chaudière)',
    air_eau: '2 500-4 000 €',
    avantage: 'air-eau',
  },
  {
    critere: 'TVA 5,5 % avec RGE',
    air_air: '10 % seulement',
    air_eau: '5,5 %',
    avantage: 'air-eau',
  },
  {
    critere: 'Économie facture annuelle',
    air_air: '350-700 € (vs élec)',
    air_eau: '600-1 200 € (vs fioul)',
    avantage: 'air-eau',
  },
]

const COUTS_FONCTIONNEMENT = [
  {
    item: 'Consommation électrique annuelle (100 m² isolé)',
    detail: '2 500-4 500 kWh/an, soit 500-1 000 €/an',
  },
  { item: 'Recharge fluide R-32 (tous les 5-10 ans)', detail: '150-400 € si fuite' },
  { item: 'Entretien annuel (recommandé tous les 2 ans pour > 4 kW)', detail: '120-200 € HT' },
  { item: 'Filtres à nettoyer/changer', detail: 'Mensuel (gratuit) à annuel (15-30 €)' },
  { item: 'Durée de vie moyenne', detail: '12-18 ans (compresseur)' },
]

const faqs = [
  {
    question: 'Combien coûte une PAC air-air en 2026 ?',
    answer:
      'Prix posé clé en main 2026 : 1 800-3 500 € pour une mono-split (1 pièce 20-40 m²), 4 000-7 000 € pour une bi-split (2 pièces), 7 000-13 000 € pour une multi-split 4-5 unités (maison complète). Une installation gainable centralisée monte à 8 000-15 000 €. Le matériel représente 50-60 % du prix total, la pose et le fluide frigorigène 40-50 %.',
  },
  {
    question: 'Pourquoi la PAC air-air n’est pas éligible MaPrimeRénov’ ?',
    answer:
      'Depuis 2022, la PAC air-air est exclue de MaPrimeRénov’ pour deux raisons : (1) elle ne produit pas d’eau chaude sanitaire (donc gain énergétique global du logement plus faible), (2) elle est souvent utilisée à des fins de climatisation pure en été (consommation supplémentaire). L’État privilégie la PAC air-eau qui chauffe ET produit l’ECS, avec un COP saisonnier supérieur (4-4,5 vs 3-3,8). Reste éligible aux CEE Coup de pouce dans certains cas (remplacement chaudière fioul).',
  },
  {
    question: 'PAC air-air ou PAC air-eau : laquelle choisir ?',
    answer:
      'PAC air-eau pour le chauffage central + ECS d’une maison (15 000 € prix posé, 5 000 € MPR + 4 000 € CEE = 6 000 € reste). PAC air-air pour climatisation réversible avec chauffage d’appoint (5 000-10 000 € prix posé, mais 0 € MPR). Si vous remplacez une chaudière fioul/gaz : air-eau systématiquement. Si vous voulez juste rafraîchir + chauffage limité : air-air. Souvent, combinaison air-eau (chauffage principal) + 1 split réversible (rafraîchissement été ciblé) = optimal.',
  },
  {
    question: 'Combien de temps pour installer une PAC air-air ?',
    answer:
      'Mono-split : 1 jour (4-6h de pose). Bi-split : 1-2 jours. Multi-split 4 unités : 2-3 jours. Gainable centralisée : 4-5 jours (ouverture faux plafond, gaines, finitions). Conditions : maison ne nécessitant pas de gros travaux de gros œuvre. L’unité extérieure pèse 30-80 kg et nécessite un emplacement bien aéré (minimum 30 cm de mur libre derrière).',
  },
  {
    question: 'Quel COP attendre d’une PAC air-air ?',
    answer:
      'COP nominal en laboratoire (7°C extérieur) : 4-5. COP saisonnier réel (sur l’hiver moyen français) : 3,0-3,8. À comparer avec le SCOP (Seasonal Coefficient of Performance) qui doit figurer sur l’étiquette énergétique. Choisir SCOP ≥ 4,1 (classe A++) pour optimiser la consommation. Marques performantes : Mitsubishi Electric, Daikin, Toshiba, Panasonic. Évitez les premiers prix avec SCOP &lt; 3,5.',
  },
  {
    question: 'Quel artisan choisir pour installer une PAC air-air ?',
    answer:
      'Frigoriste qualifié pour la manipulation des fluides frigorigènes (attestation de capacité catégorie I, II ou III selon la charge). Mention RGE QualiClimaFroid pour bénéficier des CEE éventuels. Vérifier la garantie 2-5 ans matériel + main-d’œuvre. Demander un devis détaillé avec : marque, modèle, SCOP, fluide (R-32 ou R-410A), longueur de liaisons frigorifiques, mise en service. Au moins 2-3 devis comparés.',
  },
  {
    question: 'Coût annuel d’une PAC air-air en chauffage ?',
    answer:
      'Pour 100 m² bien isolé en France métropolitaine moyenne : 2 500-4 500 kWh/an consommés en hiver, soit 500-1 000 € au tarif EDF Bleu 2026 (~0,22 €/kWh). À comparer avec un chauffage électrique direct : 8 000-12 000 kWh/an (1 800-2 600 €). Économie typique 60-70 % vs convecteurs électriques. À l’usage été (climatisation), comptez 200-400 €/an supplémentaires si utilisation modérée 2-3 mois.',
  },
  {
    question: 'Bruit et impact extérieur d’une PAC air-air ?',
    answer:
      'Unité extérieure : 45-60 dB à 1 m (équivalent réfrigérateur à conversation normale). Réglementation française : limite 5 dB nocturne et 7 dB diurne au-dessus du bruit ambiant à proximité du voisinage. Choisir un emplacement non-mitoyen, distance minimale 5 m de la fenêtre du voisin, sur silent blocs anti-vibration. Marques silencieuses : Mitsubishi MSZ-LN (43 dB), Daikin Perfera (45 dB).',
  },
]

const sources = [
  { label: 'ADEME — PAC air-air guide', url: 'https://www.ademe.fr' },
  { label: 'AFPAC — Association Française PAC', url: 'https://www.afpac.org' },
  { label: 'France Rénov’ — PAC chauffage', url: 'https://france-renov.gouv.fr' },
  { label: 'Service-Public.fr — Climatisation réversible', url: 'https://www.service-public.fr' },
  { label: 'Légifrance — Décret fluides frigorigènes', url: 'https://www.legifrance.gouv.fr' },
]

const relatedPages = [
  {
    label: 'Hub pompe à chaleur',
    href: '/renovation-energetique/travaux/pompe-a-chaleur',
    description: 'Comparatif 3 types PAC + aides',
  },
  {
    label: 'PAC air-eau : prix 2026',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/air-eau-prix',
    description: 'Pivot 2 263 vol — chauffage central + ECS',
  },
  {
    label: 'PAC géothermique 2026',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/geothermie',
    description: 'Top performance, MPR jusqu’à 11 000 €',
  },
  {
    label: 'Hub chauffage à énergie renouvelable',
    href: '/renovation-energetique/travaux/chauffage',
    description: 'Comparatif 4 solutions EnR',
  },
  {
    label: 'CEE Coup de pouce chauffage',
    href: '/renovation-energetique/aides/prime-coup-de-pouce',
    description: 'Bonification 2 500-7 000 € PAC',
  },
  {
    label: 'Trouver un artisan QualiClimaFroid',
    href: '/rge/labels/qualipac',
    description: 'Mention RGE PAC officielle',
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
    section: 'PAC air-air',
    keywords: [
      'pompe a chaleur air air',
      'prix pompe a chaleur air air',
      'pac air air',
      'climatisation reversible',
      'cout pac air air',
      'pac air air mitsubishi daikin',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique/travaux' },
    { name: 'Pompe à chaleur', url: '/renovation-energetique/travaux/pompe-a-chaleur' },
    { name: 'Air-air prix', url: PAGE_PATH },
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
              { label: 'Travaux', href: '/renovation-energetique/travaux' },
              { label: 'Pompe à chaleur', href: '/renovation-energetique/travaux/pompe-a-chaleur' },
              { label: 'Air-air prix' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Snowflake className="w-3.5 h-3.5" aria-hidden />
              Climatisation réversible 2026
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Pompe à chaleur air-air : prix 2026
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              La <strong>PAC air-air</strong> est une climatisation réversible : elle chauffe en
              hiver et rafraîchit en été. Prix posé en 2026 : <strong>1 800 €</strong> pour une
              mono-split, jusqu’à <strong>13 000 €</strong> pour une multi-split 4-5 unités. À la
              différence de la PAC air-eau, elle n’est <strong>pas éligible MaPrimeRénov’</strong>{' '}
              et reste limitée pour le CEE Coup de pouce. Voici le détail des prix, des alternatives
              et des cas d’usage où elle reste pertinente.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2 id="prix">Prix PAC air-air 2026 par configuration</h2>
            <div className="not-prose grid gap-3 my-6">
              {PRIX.map((p) => (
                <div key={p.type} className="bg-white border border-sand-200 rounded-xl p-5">
                  <div className="flex items-baseline justify-between gap-2 flex-wrap mb-2">
                    <h3 className="font-heading text-base font-semibold text-sand-900 m-0">
                      {p.type}
                    </h3>
                    <span className="text-sm font-bold text-primary-700 whitespace-nowrap">
                      {p.prix}
                    </span>
                  </div>
                  <p className="text-xs text-sand-500 m-0 mb-2">
                    Surface : {p.surface} · COP saisonnier : {p.cop}
                  </p>
                  <p className="text-sm text-sand-700 m-0">{p.detail}</p>
                </div>
              ))}
            </div>

            <div className="not-prose flex items-start gap-3 border border-amber-200 bg-amber-50 rounded-lg p-4 my-6">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <div className="text-sm text-amber-900">
                <p className="font-semibold m-0 mb-1">PAC air-air : NON éligible MaPrimeRénov’</p>
                <p className="m-0">
                  Depuis 2022, la PAC air-air est exclue de MaPrimeRénov’ (ne produit pas d’ECS,
                  usage clim été). Reste éligible aux CEE Coup de pouce uniquement en remplacement
                  d’une chaudière fioul/gaz/charbon (montant 1 000-2 000 €). TVA à 10 % au lieu de
                  5,5 %. Pour bénéficier des aides massives, privilégier la{' '}
                  <Link href="/renovation-energetique/travaux/pompe-a-chaleur/air-eau-prix">
                    PAC air-eau
                  </Link>
                  .
                </p>
              </div>
            </div>

            <h2 id="comparatif">PAC air-air vs PAC air-eau : comparatif</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Critère</th>
                    <th className="p-3 border-b border-sand-200">Air-air</th>
                    <th className="p-3 border-b border-sand-200">Air-eau</th>
                    <th className="p-3 border-b border-sand-200">Avantage</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARATIF.map((c) => (
                    <tr key={c.critere} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium text-sand-900">{c.critere}</td>
                      <td className="p-3">{c.air_air}</td>
                      <td className="p-3">{c.air_eau}</td>
                      <td className="p-3 text-xs">
                        {c.avantage === 'air-air' ? (
                          <span className="text-primary-700 font-semibold">air-air</span>
                        ) : (
                          <span className="text-amber-700 font-semibold">air-eau</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 id="quand-air-air">Quand choisir la PAC air-air ?</h2>
            <ul>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Logement très bien isolé</strong> sans chauffage central existant (T2/T3
                neuf, studio).
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Région chaude</strong> (sud de la France) où la clim été est aussi
                importante que le chauffage hiver.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Complément</strong> à un chauffage central existant (1 split réversible pour
                rafraîchir le salon en été).
              </li>
              <li>
                <XCircle className="inline w-4 h-4 text-amber-700 mr-1" aria-hidden />
                <strong>Pas idéal</strong> pour remplacer une chaudière dans une maison familiale —
                préférer PAC air-eau.
              </li>
            </ul>

            <h2 id="couts">Coûts de fonctionnement</h2>
            <ul>
              {COUTS_FONCTIONNEMENT.map((c) => (
                <li key={c.item}>
                  <strong>{c.item}</strong> : {c.detail}
                </li>
              ))}
            </ul>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    PAC air-air ou air-eau ? Simulez les 2 options
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Compare prix posé, aides cumulables, économies annuelles et ROI selon votre
                    logement et région. Mise en relation artisan QualiClimaFroid ou QualiPAC
                    vérifié.
                  </p>
                  <Link
                    href="/simulateur-aides-renovation"
                    className="inline-flex items-center gap-1.5 bg-primary-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
                  >
                    Lancer le simulateur <ArrowRight className="w-4 h-4" aria-hidden />
                  </Link>
                </div>
              </div>
            </div>

            <h2 id="installateurs">Installateurs PAC air-air</h2>
            <p>
              <ThermometerSun className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
              <strong>Frigoriste qualifié</strong> obligatoire pour manipuler les fluides
              frigorigènes (R-32 majoritaire en 2026, R-410A en sortie). Attestation de capacité
              catégorie I, II ou III selon la charge totale en CO2 équivalent. Pour bénéficier des
              CEE éventuels : mention RGE <strong>QualiClimaFroid</strong> requise (distincte de
              QualiPAC qui couvre PAC air-eau et géothermique).
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
              href="/renovation-energetique/travaux/pompe-a-chaleur"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Hub pompe à chaleur
            </Link>
            <Link
              href="/rge/labels/qualipac"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Label QualiPAC <Coins className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
