/**
 * Page : /renovation-energetique/travaux/vmc-double-flux
 *
 * KW cibles (validés Ahrefs API live, snapshot 2026-05-03, country=fr) :
 * - "vmc double flux"              → 13 374 vol, KD 2, CPC $0,10, clicks 17 999 ⭐⭐⭐⭐ MEGA JACKPOT
 * - "prix vmc double flux"         → 938 vol, KD 0, CPC $0,15 ⭐⭐⭐
 * - "vmc double flux prix"         → variant
 * - "vmc double flux maison"       → longue traîne
 * - "vmc df"                       → longue traîne
 * - Famille cumulée pivot : ~15 500 vol/mois (KD 0-2 = MEGA EASY WIN)
 *
 * Source : audit Ahrefs API live (cf docs/ahrefs-audit-2026-04/STRATEGIE-RENOVATION-ENERGETIQUE.md)
 * Easy win : OUI MEGA (KD 2 sur "vmc double flux" 13 374 vol — top de Vague B avec CET)
 *            Concurrence Aldes, Atlantic, Helios (constructeurs) + Engie/EDF
 *            Atout SA : focus prix marché + ROI + récup chaleur 70-90 %
 * Cluster pillar : Rénovation Énergétique → Travaux → VMC double flux
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Award,
  Calculator,
  CheckCircle2,
  Coins,
  Droplets,
  ShieldCheck,
  Wind,
} from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import LastUpdated from '@/components/seo/LastUpdated'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import { getBreadcrumbSchema, getFAQSchema, getGovernmentServiceSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'

export const revalidate = 86400

const PAGE_PATH = '/renovation-energetique/travaux/vmc-double-flux'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-04'
const MODIFIED = '2026-05-04'
const AUTHOR_SLUG = 'marc-lefebvre'
const AUTHOR_NAME = 'Marc Lefebvre'

const TITLE = 'VMC double flux 2026 : prix & MPR'
const DESCRIPTION =
  'VMC double flux 2026 : prix posé 4 000-6 500 €, récupération chaleur 70-90 %, MPR jusquà 2 500 €. Comparatif simple flux, installation.'

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
  'VMC double flux = ventilation mécanique avec récupération de la chaleur de l’air extrait (70-90 % rendement).',
  'Prix posé 2026 : 4 000-6 500 € pour une maison 100 m² (pose en rénovation).',
  'MaPrimeRénov’ Bleu : 2 500 €. CEE Coup de pouce : 500-1 200 €.',
  'Économie chauffage 10-20 % vs VMC simple flux. Indispensable après isolation lourde.',
  'Bouches d’insufflation dans pièces de vie + extraction dans pièces humides.',
  'Entretien : filtres tous les 6 mois (15-30 €), nettoyage gaines tous les 5-10 ans.',
]

const TYPES_VMC = [
  {
    type: 'VMC double flux thermodynamique',
    prix: '6 000-9 000 € posé',
    rendement: '85-95 %',
    detail:
      'PAC intégrée pour pré-chauffer l’air neuf en hiver et le rafraîchir en été. Top performance, prix premium.',
  },
  {
    type: 'VMC double flux haute performance',
    prix: '5 000-7 500 € posé',
    rendement: '80-90 %',
    detail:
      'Échangeur à plaques contre-courant. Marques Aldes, Atlantic, Helios, Zehnder. Standard 2026.',
  },
  {
    type: 'VMC double flux standard',
    prix: '4 000-6 500 € posé',
    rendement: '70-85 %',
    detail: 'Échangeur simple. Adapté logements 80-120 m² isolés. Bon rapport qualité/prix.',
  },
  {
    type: 'VMC double flux décentralisée (pièce par pièce)',
    prix: '300-600 €/pièce posée',
    rendement: '70-85 %',
    detail:
      'Modules muraux pièce par pièce, sans gaines centrales. Idéal rénovation copropriété sans modifier la structure.',
  },
]

const COMPARATIF_VS_SIMPLE = [
  { critere: 'Prix posé (maison 100 m²)', sf: '900-2 500 €', df: '4 000-6 500 €' },
  { critere: 'Économie chauffage', sf: '5-10 %', df: '15-25 %' },
  { critere: 'Récupération chaleur', sf: '0 %', df: '70-90 %' },
  { critere: 'MaPrimeRénov’ Bleu', sf: '0 €', df: '2 500 €' },
  { critere: 'CEE Coup de pouce', sf: '0 €', df: '500-1 200 €' },
  {
    critere: 'Filtration air entrant (pollens, particules)',
    sf: '❌ Non',
    df: '✅ Oui (filtres F7/M5)',
  },
  { critere: 'Bruit', sf: 'Modéré (bouches)', df: 'Faible (caisson isolé)' },
  {
    critere: 'Encombrement gaines',
    sf: 'Faible (extraction)',
    df: 'Important (insufflation + extraction)',
  },
  { critere: 'Idéal pour', sf: 'Logement non isolé', df: 'Logement isolé/BBC/passif' },
]

const ETAPES_INSTALL = [
  {
    step: 'Étude faisabilité',
    detail:
      'Vérifier la possibilité de passage des gaines (faux plafond, comble, vide technique). 4 gaines : 2 insufflation (séjour, chambres) + 2 extraction (cuisine, SDB, WC). Caisson VMC en comble ou local technique (1 m² environ).',
  },
  {
    step: 'Devis chauffagiste/installateur RGE',
    detail:
      'Mention RGE Qualibat ou QualiPAC pour bénéficier MPR/CEE/TVA 5,5 %. Devis détaillé : marque, modèle, débit (m³/h), rendement échangeur, longueur gaines, bouches.',
  },
  {
    step: 'Dépôt MPR + CEE avant signature',
    detail:
      'Demande MaPrimeRénov’ via france-renov.gouv.fr AVANT signature devis. Acceptation offre CEE en parallèle.',
  },
  {
    step: 'Installation (2-4 jours)',
    detail:
      'Pose caisson + gaines isolées + bouches + raccordement électrique. Mise en service avec mesure des débits aux bouches (NF DTU 68.3).',
  },
  {
    step: 'Réglages et formation utilisateur',
    detail:
      'Programmation horaires (mode économie nuit), mode boost cuisson/douche, indication changement filtres. Notice d’utilisation remise.',
  },
  {
    step: 'Versement aides (4-8 semaines)',
    detail:
      'MPR versée après facture acquittée + photo équipement. CEE selon mode (déduction devis ou chèque).',
  },
]

const faqs = [
  {
    question: 'Combien coûte une VMC double flux en 2026 ?',
    answer:
      'Prix posé clé en main 2026 : 4 000-6 500 € pour une VMC standard maison 100 m² (pose en rénovation), 5 000-7 500 € pour une haute performance, 6 000-9 000 € pour une thermodynamique. Pour de la décentralisée (pièce par pièce) : 300-600 €/pièce. Le caisson + gaines + bouches représentent 60-70 %, la pose 30-40 %. Coût supérieur à une VMC simple flux mais aides massives compensent l’écart.',
  },
  {
    question: 'Quelles aides en 2026 pour la VMC double flux ?',
    answer:
      'MaPrimeRénov’ Bleu : 2 500 €. Jaune : 2 000 €. Violet : 1 500 €. Rose : 0 €. CEE Coup de pouce : 500-1 200 € selon offre énergéticien. TVA 5,5 % automatique avec artisan RGE. Cumul typique pour un Bleu : MPR 2 500 € + CEE 800 € = 3 300 € sur un devis 5 500 €, reste à charge 2 200 €. Économie chauffage attendue : 200-450 €/an, ROI 5-7 ans.',
  },
  {
    question: 'VMC double flux vs simple flux : laquelle choisir ?',
    answer:
      'Double flux pour : logement bien isolé (BBC, passif, après rénovation lourde), maisons neuves RT2012/RE2020, logements en zone froide ou polluée. Simple flux hygro pour : logements anciens non isolés (la double flux ne se justifie économiquement qu’après isolation), petits budgets, copropriétés sans accès gaines centrales. La double flux atteint son plein potentiel en synergie avec une isolation thermique poussée.',
  },
  {
    question: 'Quel rendement attendre ?',
    answer:
      'Rendement de récupération de chaleur (norme NF EN 13141-7) : 70-90 % pour une VMC standard, 85-95 % pour une thermodynamique. En pratique : pour 1 m³ d’air extrait à 20°C en hiver et 1 m³ d’air neuf à 0°C, l’air entrant est pré-chauffé à 14-18°C par récupération sur l’air sortant. Économie chauffage 15-25 % vs simple flux. Vérifier le SFP (Specific Fan Power) &lt; 0,45 W/m³/h pour limiter la conso élec du ventilateur.',
  },
  {
    question: 'Faut-il une VMC double flux après isolation ?',
    answer:
      'Fortement recommandée. Une isolation thermique poussée rend le logement quasi étanche à l’air. Sans renouvellement mécanique : condensation, moisissures, qualité d’air dégradée (CO2, COV). VMC simple flux hygro = minimum acceptable. VMC double flux = optimal car elle récupère la chaleur tout en assurant un débit d’air constant et filtré. Combinaison gagnante : isolation + double flux = économie 30-40 % vs sans rien.',
  },
  {
    question: 'Bruit d’une VMC double flux ?',
    answer:
      'Caisson principal : 25-40 dB à 1 m (silencieux, équivalent murmure). Bouches d’insufflation : 20-30 dB en débit normal, 35-45 dB en mode boost (cuisson, douche). Réglementation : 30 dB(A) max dans les chambres et 35 dB(A) dans les pièces de vie. Choisir un caisson avec niveau sonore certifié et installer en local technique isolé (pas dans un placard ouvert sur la chambre). Marques silencieuses : Zehnder, Helios, Atlantic Hexa.',
  },
  {
    question: 'Quel artisan installer une VMC double flux ?',
    answer:
      'Chauffagiste, installateur thermique ou ventiliste avec mention RGE <strong>Qualibat 8721</strong> (ventilation mécanique) ou QualiPAC mention VMC. Pour bénéficier de MPR/CEE/TVA 5,5 %, mention RGE valide à la date du devis. Vérifier dans notre annuaire RGE alimenté par l’API ADEME. Demander 2-3 devis détaillés (marque, modèle, débit, rendement, longueur gaines, bouches, mise en service avec mesures débit).',
  },
  {
    question: 'Entretien d’une VMC double flux ?',
    answer:
      'Filtres : changement tous les 6 mois (15-30 € le set de filtres F7/M5). Nettoyage bouches : annuel (vinaigre + brosse). Nettoyage gaines : tous les 5-10 ans (200-400 € par professionnel). Vérification débits : tous les 5 ans (mesure anémomètre). Vérification batterie échangeur : tous les 2-3 ans (vérifier absence de gel hivernal). Total entretien annuel : 50-80 €. Durée de vie : 15-20 ans (caisson), 30+ ans (gaines).',
  },
]

const sources = [
  { label: 'France Rénov’ — VMC double flux', url: 'https://france-renov.gouv.fr' },
  { label: 'ADEME — Ventilation logement', url: 'https://www.ademe.fr' },
  { label: 'Anah — MPR VMC double flux', url: 'https://www.anah.gouv.fr' },
  { label: 'NF DTU 68.3 — Mise en œuvre VMC', url: 'https://www.afnor.org' },
  { label: 'CSTB — Avis techniques ventilation', url: 'https://www.cstb.fr' },
]

const relatedPages = [
  {
    label: 'Hub Travaux rénovation',
    href: '/renovation-energetique/travaux',
    description: '4 clusters travaux + ordre logique',
  },
  {
    label: 'Isolation thermique',
    href: '/renovation-energetique/travaux/isolation',
    description: 'Combinaison isolation + VMC double flux',
  },
  {
    label: 'Fenêtres double vitrage',
    href: '/renovation-energetique/travaux/fenetres-double-vitrage',
    description: 'Étanchéité air requise pour VMC efficace',
  },
  {
    label: 'Pompe à chaleur air-eau',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/air-eau-prix',
    description: 'Compatible avec VMC double flux',
  },
  {
    label: 'Hub aides rénovation',
    href: '/renovation-energetique/aides',
    description: 'MPR + CEE + éco-PTZ',
  },
  {
    label: 'Simulateur aides 2026',
    href: '/simulateur-aides-renovation',
    description: 'Calcul personnalisé instantané',
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
    section: 'VMC double flux',
    keywords: [
      'vmc double flux',
      'prix vmc double flux',
      'vmc double flux prix',
      'vmc double flux maison',
      'vmc df',
      'vmc double flux 2026',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique/travaux' },
    { name: 'VMC double flux', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const govSchema = getGovernmentServiceSchema({
    name: 'VMC double flux : MaPrimeRénov’ 2026',
    description:
      'VMC double flux éligible MaPrimeRénov’ jusqu’à 2 500 € (Bleu) + CEE Coup de pouce. Récupération chaleur 70-90 %. Installation par artisan RGE Qualibat 8721 ou QualiPAC.',
    url: PAGE_URL,
    serviceType: 'Subvention publique ventilation thermique',
    audience: 'Propriétaires occupants, bailleurs, copropriétés',
  })
  const schemas = [articleSchema, breadcrumbSchema, faqSchema, govSchema].filter(
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
              { label: 'VMC double flux' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Award className="w-3.5 h-3.5" aria-hidden />
              Récup chaleur 70-90 % — MPR 2 500 €
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              VMC double flux 2026 : prix, performance, MPR
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              La <strong>VMC double flux</strong> récupère <strong>70 à 90 %</strong> de la chaleur
              de l’air extrait pour pré-chauffer l’air neuf entrant. Indispensable après une
              rénovation thermique (isolation lourde + fenêtres double vitrage), elle économise{' '}
              <strong>15-25 %</strong> sur la facture chauffage par rapport à une VMC simple flux.
              Prix posé 2026 : <strong>4 000 à 6 500 €</strong> pour une maison 100 m² (pose en
              rénovation), MaPrimeRénov’ jusqu’à <strong>2 500 €</strong> + CEE Coup de pouce.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2 id="fonctionnement">Comment fonctionne une VMC double flux</h2>
            <p>
              <Wind className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
              Une VMC double flux extrait l’air vicié des pièces humides (cuisine, salle de bain,
              WC) et insuffle de l’air neuf filtré dans les pièces de vie (séjour, chambres). L’air
              sortant et l’air entrant croisent un <strong>échangeur thermique</strong> où la
              chaleur est récupérée <strong>sans mélange des flux</strong> (étanchéité totale).
              Résultat : air neuf pré-chauffé à 14-18°C en hiver (vs 0°C extérieur), air sortant
              refroidi à 6-10°C avant rejet.
            </p>

            <h2 id="types-vmc">Les 4 types de VMC double flux</h2>
            <div className="not-prose grid gap-3 my-6">
              {TYPES_VMC.map((t) => (
                <div key={t.type} className="bg-white border border-sand-200 rounded-xl p-5">
                  <div className="flex items-baseline justify-between gap-2 flex-wrap mb-2">
                    <h3 className="font-heading text-base font-semibold text-sand-900 m-0">
                      {t.type}
                    </h3>
                    <span className="text-sm font-bold text-primary-700 whitespace-nowrap">
                      {t.prix}
                    </span>
                  </div>
                  <p className="text-xs text-sand-500 m-0 mb-2">
                    Rendement échangeur : {t.rendement}
                  </p>
                  <p className="text-sm text-sand-700 m-0">{t.detail}</p>
                </div>
              ))}
            </div>

            <h2 id="comparatif">VMC double flux vs simple flux</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Critère</th>
                    <th className="p-3 border-b border-sand-200">Simple flux hygro</th>
                    <th className="p-3 border-b border-sand-200">Double flux</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARATIF_VS_SIMPLE.map((c) => (
                    <tr key={c.critere} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium text-sand-900">{c.critere}</td>
                      <td className="p-3 text-amber-700">{c.sf}</td>
                      <td className="p-3 text-primary-700 font-semibold">{c.df}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 id="exemple">Exemple chiffré maison 100 m²</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 my-6">
              <p className="font-semibold text-sand-900 m-0 mb-3">
                VMC double flux haute performance (devis 5 500 €) — couple Bleu post-isolation
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                <span className="text-sand-600">Devis HT</span>
                <span className="text-sand-900 font-medium text-right">5 500 €</span>
                <span className="text-sand-600">MaPrimeRénov’ Bleu</span>
                <span className="text-primary-700 font-medium text-right">- 2 500 €</span>
                <span className="text-sand-600">CEE Coup de pouce</span>
                <span className="text-primary-700 font-medium text-right">- 800 €</span>
                <span className="text-sand-600">TVA 5,5 % (vs 20 %) ≈</span>
                <span className="text-primary-700 font-medium text-right">- 600 €</span>
                <span className="text-sand-900 font-bold pt-2 border-t border-sand-200">
                  Reste à charge
                </span>
                <span className="text-sand-900 font-bold pt-2 border-t border-sand-200 text-right">
                  1 600 €
                </span>
                <span className="text-primary-700 font-semibold mt-1">
                  Économie chauffage annuelle
                </span>
                <span className="text-primary-700 font-semibold text-right mt-1">
                  ~350-450 €/an
                </span>
              </div>
              <p className="text-xs text-sand-500 italic mt-3 mb-0">
                ROI : 4-5 ans après aides. Bonus qualité d’air intérieur (filtres F7) et confort
                acoustique non chiffrés.
              </p>
            </div>

            <h2 id="installation">Démarche en 6 étapes</h2>
            <div className="not-prose my-6">
              <ol className="space-y-3 list-none m-0 p-0">
                {ETAPES_INSTALL.map((s, i) => (
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
                    Estimer votre VMC double flux + aides
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Calcul instantané MPR + CEE + TVA 5,5 %. Mise en relation artisan Qualibat 8721
                    ou QualiPAC vérifié.
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

            <h2 id="entretien">Entretien et qualité d’air</h2>
            <ul>
              <li>
                <Droplets className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Filtres</strong> : changer tous les 6 mois (15-30 € le set F7/M5). Indique
                la durée de vie restante via voyant LED.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Bouches</strong> : nettoyer annuellement (vinaigre + brosse douce).
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Gaines</strong> : nettoyage tous les 5-10 ans par professionnel (200-400 €).
              </li>
              <li>
                <ShieldCheck className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Filtration</strong> : F7 retient 80-90 % des PM2.5 (particules fines),
                pollens, COV. Idéal zones urbaines polluées.
              </li>
            </ul>

            <h2 id="combinaisons">Combinaisons gagnantes</h2>
            <ul>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Isolation toiture + ITE + VMC double flux</strong> = économie chauffage
                cumulée 50-65 %.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Fenêtres double vitrage + VMC double flux</strong> = étanchéité air totale,
                qualité air filtrée.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>PAC air-eau + VMC double flux</strong> = système haute performance, économie
                totale 60-75 %.
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
              href="/renovation-energetique/travaux"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Hub Travaux
            </Link>
            <Link
              href="/renovation-energetique/aides"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Aides 2026 <Coins className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
