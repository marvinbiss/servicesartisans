/**
 * Page : /renovation-energetique/travaux/ballon-thermodynamique
 *
 * @kw-primary    ballon thermodynamique
 * @kw-volume     18000
 * @kw-kd         6
 * @kw-cpc        1.45
 * @intent        commercial + informational
 * @cluster       ballon_thermo
 * @ahrefs-source docs/ahrefs-bloc1-keywords-gap-2026-05-04.md (rang #7 top 200)
 * @snapshot      2026-05-04 (Ahrefs Bloc 1 v3 — cluster ballon_thermo 47 KW vol 22 840)
 * @backlog-item  P0-ballon-thermodynamique-cluster
 *
 * KW cibles (validés Ahrefs gap CSV 2026-04, country=fr) :
 * - "ballon thermodynamique"        18 000 vol, KD 6  ⭐⭐⭐⭐ pivot rang #7 top 50
 * - "ballon thermodynamique prix"      700 vol, KD 0  rang #163
 * - "prix ballon thermodynamique"      350 vol, KD 0  rang #161
 * - "ballon thermodynamique 200l"      cluster long-tail (ABSENT)
 * - "ballon thermodynamique 300l"      cluster long-tail (ABSENT)
 * - "meilleur ballon thermodynamique"  long-tail (ABSENT)
 * - Cluster Bloc 1 cumulé : 47 KW, vol 22 840/mo, KD avg 2.3 — **goldmine**
 *
 * Easy win : OUI MAJEUR (KD 6 pivot 18K vol — rang #7 top 50 Bloc 1)
 * Page-mine #4 = france-renov.gouv.fr/.../chauffe-eau-thermodynamique. Concurrence
 * Atlantic, Thermor, Ariston (constructeurs) + Engie/EDF. 0 page SA dédiée.
 * Atout SA : focus PRODUIT (capacités, classes énergie, marques, dimensions),
 * distinct de /chauffage/chauffe-eau-thermodynamique qui cible "chauffe eau thermodynamique"
 * 28K KD 3 (intent SOLUTION).
 *
 * Cluster pillar : Rénovation Énergétique → Travaux → Ballon thermodynamique
 *
 * Anti-cannibalisation :
 *   - /chauffage/chauffe-eau-thermodynamique = SYSTÈME complet (PAC + ballon, COP, ROI)
 *   - Cette page                             = PRODUIT ballon (capacité, classes,
 *     dimensions, marques, pose), intent achat équipement précis
 *   - /chauffage                             = hub chauffage (4 familles, ECS = 1)
 *   - /pompe-a-chaleur                       = cluster PAC chauffage (autre usage)
 *
 * YMYL high : décisions investissement 2 500-4 500 €, normes EN 16147 (COP),
 * NF Électricité Performance, label Promotelec, prime CEE BAR-TH-148.
 * Cite : Légifrance, France Rénov', ADEME, AFNOR EN 16147, ANAH, Service-Public.fr.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  AlertTriangle,
  Calculator,
  CheckCircle2,
  Coins,
  Droplets,
  ShieldCheck,
  Wrench,
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

const PAGE_PATH = '/renovation-energetique/travaux/ballon-thermodynamique'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'jean-pierre-duval'
const AUTHOR_NAME = 'Jean-Pierre Duval'

const TITLE = 'Ballon thermodynamique 2026 : prix, capacité & MPR'
const DESCRIPTION =
  "Ballon thermodynamique 2026 : prix 2 500-4 500 €, capacités 150-300 L, COP 3-3,5, classes A+ à A+++, marques Atlantic / Thermor / Ariston, MPR jusqu'à 1 200 € + CEE BAR-TH-148."

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
  'Ballon thermodynamique = chauffe-eau électrique avec PAC intégrée sur air ambiant ou extrait.',
  'Prix posé 2026 : 2 500-4 500 € selon capacité (150-300 L) et marque.',
  'Économie 60-75 % vs ballon électrique classique : 70-200 €/an pour 4 personnes.',
  "Aides MPR Bleu jusqu'à 1 200 € + CEE BAR-TH-148 ~150 € + éco-PTZ. TVA 5,5 % avec RGE.",
  'Classes énergie A+ minimum (A+++ recommandée). Norme COP NF EN 16147 ≥ 2,5.',
  "3 sources d'air : ambiant intérieur, extrait VMC, ou air extérieur split.",
  'Installateur RGE QualiPAC ou Qualisol. Durée de vie 12-15 ans.',
]

const CAPACITES = [
  {
    capacite: '100-150 L (1-2 personnes)',
    prix: '2 200-3 200 € posé',
    detail:
      'Studio, T2 ou couple sans enfant. ECS suffisante pour 50-110 L/jour à 60 °C. Modèles compacts muraux ou sur socle. Marques : Atlantic Egeo Mural, Thermor Aeromax Compact.',
  },
  {
    capacite: '180-200 L (2-3 personnes)',
    prix: '2 500-3 500 € posé',
    detail:
      'T3/T4, couple + 1 enfant. Standard du marché 2026. ECS 110-150 L/jour. Modèles : Atlantic Egeo, Thermor Aeromax 5, Ariston Nuos Plus.',
  },
  {
    capacite: '250-270 L (3-5 personnes)',
    prix: '3 000-4 200 € posé',
    detail:
      'Maison 80-130 m² famille. ECS 150-220 L/jour. Modèles haut de gamme avec ballon inox ou émaillé : Atlantic Calypso, Thermor Aeromax 5 270L, Daikin Altherma EHS.',
  },
  {
    capacite: '300 L et + (5+ personnes)',
    prix: '3 800-4 800 € posé',
    detail:
      'Maison familiale > 130 m², ECS > 220 L/jour. Souvent split (UE+UI) avec PAC dédiée. Modèles : Atlantic Calypso 300L Split, Daikin Altherma 3 R F, Stiebel Eltron WPL.',
  },
]

const SOURCES_AIR = [
  {
    type: 'Air ambiant intérieur',
    icone: 'Droplets',
    detail:
      "Aspire l'air de la pièce où il est installé (garage, buanderie, cellier minimum 20 m³). Le plus simple et le moins cher (3 200-4 000 €). Inconvénient : la pièce se refroidit en hiver de 2-4 °C — éviter d'installer dans une pièce de vie.",
    quand:
      "Idéal si garage non chauffé, buanderie ou cellier > 20 m³ avec température 5-30 °C toute l'année.",
  },
  {
    type: 'Air extrait (sur VMC)',
    icone: 'Wind',
    detail:
      "Récupère l'air extrait de la VMC (cuisine, salle de bain) pour préchauffer l'ECS. Encore plus efficace en hiver (air à 19-20 °C constant). Prix +500 € vs air ambiant. Demande raccordement gaines VMC.",
    quand:
      'Idéal en construction neuve ou rénovation lourde avec VMC double flux ou simple flux hygro existante.',
  },
  {
    type: 'Air extérieur (split)',
    icone: 'Wind',
    detail:
      "Unité extérieure (PAC) + unité intérieure (ballon). Ne refroidit pas l'intérieur. COP plus faible en hiver (-30 % à T° ext < 5 °C). Prix +1 000 € vs ambiant.",
    quand:
      'Idéal en zone tempérée (climat méditerranéen, ouest atlantique) avec espace extérieur disponible.',
  },
]

const CLASSES_ENERGIE = [
  {
    classe: 'A+++',
    cop: '≥ 3,5',
    economie: '-75 %',
    detail:
      'Top performance — modèles split air extérieur ou inverter haut de gamme. Recommandée pour aides MPR maximales et économies long terme.',
  },
  {
    classe: 'A++',
    cop: '3,0-3,5',
    economie: '-65 %',
    detail:
      'Standard 2026 — la plupart des ballons thermodynamiques sur air ambiant ou extrait. Bon compromis prix-perf.',
  },
  {
    classe: 'A+',
    cop: '2,5-3,0',
    economie: '-55 %',
    detail:
      "Minimum éligible MaPrimeRénov'. Modèles d'entrée de gamme. ROI moins bon mais investissement initial plus faible.",
  },
  {
    classe: 'A',
    cop: '< 2,5',
    economie: '-40 %',
    detail:
      "NON éligible MaPrimeRénov' (seuil 2,5 EN 16147). Performances trop faibles. À éviter en 2026.",
  },
]

const MARQUES = [
  {
    marque: 'Atlantic (FR)',
    modeles: 'Egeo, Calypso, Calypso Split',
    fourchette: '2 500-4 200 €',
    note: 'Leader marché France. SAV étendu, garantie 5 ans cuve. Modèles fabriqués en France.',
  },
  {
    marque: 'Thermor (FR, groupe Atlantic)',
    modeles: 'Aeromax 5, Aeromax Compact',
    fourchette: '2 400-4 000 €',
    note: 'Bon rapport qualité-prix. Garantie 5 ans cuve, 2 ans pièces. Filiale Atlantic.',
  },
  {
    marque: 'Ariston (IT)',
    modeles: 'Nuos Plus, Lydos Hybrid',
    fourchette: '2 200-3 800 €',
    note: 'Italien, design soigné. Lydos Hybrid = chauffe-eau électrique convertible thermodynamique.',
  },
  {
    marque: 'Daikin (JP)',
    modeles: 'Altherma EHS, Altherma 3 R F',
    fourchette: '3 500-4 800 €',
    note: 'Premium. Souvent en split ECS. PAC haute performance. Garantie 5 ans + extensions payantes.',
  },
  {
    marque: 'Stiebel Eltron (DE)',
    modeles: 'WPL, WWK',
    fourchette: '3 200-4 500 €',
    note: 'Allemand. Robustesse et durabilité. SAV moins développé en France.',
  },
  {
    marque: 'De Dietrich (FR)',
    modeles: 'Kaliko, Kaliko TWH',
    fourchette: '2 800-4 200 €',
    note: 'Marque historique chauffage français. Bonne intégration avec chaudière De Dietrich.',
  },
]

const faqs = [
  {
    question: 'Combien coûte un ballon thermodynamique en 2026 ?',
    answer:
      'Prix posé clé en main 2026 selon capacité : 2 200-3 200 € pour 100-150 L (1-2 personnes), 2 500-3 500 € pour 180-200 L (2-3 personnes), 3 000-4 200 € pour 250-270 L (3-5 personnes), 3 800-4 800 € pour 300 L+ (5+ personnes ou ballons split). Le matériel représente 55-65 % du devis (1 500-3 000 €), la pose et le raccordement 35-45 %. Variations +10-20 % en Île-de-France et grandes métropoles.',
  },
  {
    question: 'Quelles aides 2026 pour un ballon thermodynamique ?',
    answer:
      "Cumul possible : MaPrimeRénov' Bleu (revenus très modestes) jusqu'à 1 200 € + CEE BAR-TH-148 environ 150 € + éco-PTZ jusqu'à 30 000 € (par geste) + TVA 5,5 % avec installateur RGE QualiPAC/Qualisol. Pour un foyer aux revenus très modestes, le reste à charge peut tomber à 1 200-2 800 € sur un projet 2 800-4 200 €. Conditions : COP minimum 2,5 (EN 16147), pose par RGE, logement > 2 ans, dossier France Rénov' déposé AVANT signature du devis.",
  },
  {
    question: 'Quelle différence entre ballon thermodynamique et chauffe-eau classique ?',
    answer:
      "<strong>Chauffe-eau électrique classique</strong> = résistance qui chauffe l'eau directement (1 kWh élec → 1 kWh chaleur). <strong>Ballon thermodynamique</strong> = pompe à chaleur intégrée qui prélève la chaleur de l'air ambiant (1 kWh élec → 2,5-3,5 kWh chaleur grâce au COP). Économie 60-75 % sur la facture ECS, soit 70-200 €/an pour une famille 4 personnes. Le ballon thermodynamique consomme entre 800 et 1 200 kWh/an vs 2 500-3 500 kWh/an pour un chauffe-eau électrique classique.",
  },
  {
    question: 'Quelle capacité choisir selon le foyer ?',
    answer:
      "Règle simple : 50 L par personne pour ECS standard, 60-70 L par personne pour usage intensif (bains fréquents). 1 personne = 100-150 L. Couple = 150-200 L. Couple + 1 enfant = 200 L. Couple + 2 enfants = 250-270 L. Famille 5+ personnes = 300 L. Surdimensionner légèrement (10-15 %) si vous avez une grande baignoire ou plusieurs salles de bain. Sous-dimensionner provoque des résistances électriques d'appoint = perte d'efficacité.",
  },
  {
    question: "Air ambiant, air extrait ou split : quelle source d'air choisir ?",
    answer:
      "<strong>Air ambiant</strong> : le plus simple et économique (3 200-4 000 €). Idéal en garage, buanderie ou cellier > 20 m³. Refroidit la pièce de 2-4 °C en hiver. <strong>Air extrait sur VMC</strong> : récupère l'air à 19-20 °C constant, COP supérieur (+15 %). Demande VMC existante ou neuve. Prix +500 €. <strong>Air extérieur split</strong> : pas de refroidissement intérieur, mais COP -30 % en hiver à T° ext < 5 °C. Idéal climat tempéré (méditerranéen, ouest). Prix +1 000 €.",
  },
  {
    question: 'Quel installateur choisir ?',
    answer:
      "Plombier-chauffagiste qualifié <strong>RGE QualiPAC</strong> ou <strong>Qualisol</strong> (le ballon thermodynamique est une PAC dédiée à l'ECS, donc QualiPAC pertinent). Sans RGE : aides MPR/CEE rejetées + TVA 20 % au lieu de 5,5 %. Vérifier : SIRET valide, attestation décennale, certificat QualiPAC/Qualisol en cours de validité, références chantiers ECS (10 mini), devis détaillé avec marque, modèle, COP NF EN 16147, classe énergétique (A++ ou A+++), volume nominal en litres, pose et mise en service.",
  },
  {
    question: 'Quel entretien et durée de vie ?',
    answer:
      'Entretien recommandé annuel (non obligatoire légalement contrairement aux chaudières) : 80-150 € HT/an. Inclut nettoyage évaporateur, contrôle pression circuit fluide frigorigène, vérification anode magnésium (corrosion cuve), vidange si eau dure. Durée de vie moyenne 12-15 ans (vs 8-12 ans pour ballon électrique classique). À surveiller : entartrage cuve (eau > 25 °TH = adoucisseur recommandé), bruit anormal compresseur (1ère panne fréquente après 8-10 ans).',
  },
  {
    question: 'Le ballon thermodynamique fait-il du bruit ?',
    answer:
      "Oui, modérément. Niveau sonore typique 35-45 dB(A) à 1 m (équivalent réfrigérateur récent). Le compresseur PAC tourne 6-12 h/jour selon les besoins. À éviter : installation dans une pièce de vie ou contre une chambre. À privilégier : garage, buanderie, cellier insonorisé, ou modèle haut de gamme avec compresseur silencieux (Atlantic Calypso < 35 dB). Modèles split ont l'unité bruyante à l'extérieur (avantage).",
  },
]

const sources = [
  {
    label: "France Rénov' — Chauffe-eau thermodynamique",
    url: 'https://france-renov.gouv.fr/renovation/chauffage/chauffe-eau-thermodynamique',
  },
  {
    label: "ANAH — MaPrimeRénov' chauffe-eau thermodynamique",
    url: 'https://www.anah.gouv.fr',
  },
  {
    label: 'ADEME — Eau chaude sanitaire',
    url: 'https://www.ademe.fr',
  },
  {
    label: 'AFNOR — Norme NF EN 16147 (essais COP chauffe-eau thermodynamique)',
    url: 'https://www.afnor.org',
  },
  {
    label: "Qualit'ENR — Mention RGE QualiPAC (annuaire)",
    url: 'https://www.qualit-enr.org',
  },
  {
    label: 'Service-Public.fr — Aides à la rénovation énergétique',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F35054',
  },
  {
    label: 'NF Électricité Performance — Label qualité',
    url: 'https://www.lcie.fr',
  },
]

const relatedPages = [
  {
    label: 'Chauffe-eau thermodynamique 2026 — système complet',
    href: '/renovation-energetique/travaux/chauffage/chauffe-eau-thermodynamique',
    description: 'COP 3-3,5, ROI 4-6 ans, comparatif vs ballon élec',
  },
  {
    label: 'PAC air-eau 2026 — alternative chauffage + ECS',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/air-eau-prix',
    description: "1 PAC pour chauffage + ECS, MPR + CEE jusqu'à 8 000 €",
  },
  {
    label: 'Hub Chauffage 2026',
    href: '/renovation-energetique/travaux/chauffage',
    description: '4 familles + comparatif prix',
  },
  {
    label: 'Hub aides rénovation',
    href: '/renovation-energetique/aides',
    description: 'MPR + CEE + éco-PTZ cumulables',
  },
  {
    label: 'Label RGE QualiPAC',
    href: '/rge/labels/qualipac',
    description: 'Certification chauffagiste PAC ECS',
  },
  {
    label: 'Trouver un installateur QualiPAC',
    href: '/services/chauffagiste',
    description: 'Annuaire RGE + QualiPAC vérifié',
  },
  {
    label: 'Simulateur aides 2026',
    href: '/simulateur-aides-renovation',
    description: 'Estimer mes aides ballon thermodynamique',
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
    section: 'Travaux — Ballon thermodynamique',
    keywords: [
      'ballon thermodynamique',
      'ballon thermodynamique prix',
      'prix ballon thermodynamique',
      'ballon thermodynamique 200l',
      'ballon thermodynamique 300l',
      'ballon thermodynamique 2026',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique/travaux' },
    { name: 'Ballon thermodynamique', url: PAGE_PATH },
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
              { label: 'Ballon thermodynamique' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-accent-50 text-accent-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Droplets className="w-3.5 h-3.5" aria-hidden />
              ECS EnR — Aides MPR + CEE jusqu&apos;à 1 350 €
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Ballon thermodynamique 2026 : prix, capacités et marques
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Le <strong>ballon thermodynamique</strong> est un chauffe-eau électrique avec pompe à
              chaleur intégrée qui prélève la chaleur de l&apos;air pour produire l&apos;eau chaude.
              En 2026, il remplace le ballon électrique classique avec{' '}
              <strong>60-75 % d&apos;économie</strong> sur la facture ECS. Prix posé{' '}
              <strong>2 500 à 4 500 €</strong> selon capacité (150-300 L), aides cumulées MPR{' '}
              <strong>jusqu&apos;à 1 200 €</strong> + CEE 150 €. Voici tout pour bien choisir : 4
              capacités, 3 sources d&apos;air, 4 classes énergie A à A+++, 6 marques fiables.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2 id="prix">Prix par capacité 2026</h2>
            <div className="not-prose grid gap-3 my-6">
              {CAPACITES.map((c) => (
                <div key={c.capacite} className="bg-white border border-sand-200 rounded-xl p-5">
                  <div className="flex items-baseline justify-between gap-2 flex-wrap mb-2">
                    <h3 className="font-heading text-base font-semibold text-sand-900 m-0">
                      {c.capacite}
                    </h3>
                    <span className="text-sm font-bold text-primary-700 whitespace-nowrap">
                      {c.prix}
                    </span>
                  </div>
                  <p className="text-sm text-sand-700 m-0">{c.detail}</p>
                </div>
              ))}
            </div>

            <p className="text-sm text-sand-600 italic">
              Prix moyens 2026 toutes marques confondues, posé clé en main, hors aides. TVA 5,5 %
              applicable avec installateur RGE QualiPAC/Qualisol et logement &gt; 2 ans. Variations
              +10-20 % en Île-de-France et grandes métropoles.
            </p>

            <h2 id="sources-air">Les 3 sources d&apos;air possibles</h2>
            <div className="not-prose grid gap-3 my-6">
              {SOURCES_AIR.map((s) => (
                <div key={s.type} className="bg-white border border-sand-200 rounded-xl p-5">
                  <h3 className="font-heading text-base font-semibold text-sand-900 m-0 mb-2">
                    {s.type}
                  </h3>
                  <p className="text-sm text-sand-700 m-0 mb-2">{s.detail}</p>
                  <p className="text-xs text-primary-700 m-0 italic">
                    <strong>Quand choisir :</strong> {s.quand}
                  </p>
                </div>
              ))}
            </div>

            <h2 id="classes-energie">Classes énergie A à A+++</h2>
            <div className="not-prose overflow-x-auto my-6">
              <table className="min-w-full bg-white border border-sand-200 rounded-xl text-sm">
                <thead className="bg-sand-100 text-sand-900">
                  <tr>
                    <th className="text-left px-3 py-2 font-semibold">Classe</th>
                    <th className="text-left px-3 py-2 font-semibold">COP NF EN 16147</th>
                    <th className="text-left px-3 py-2 font-semibold">Économie vs résistif</th>
                    <th className="text-left px-3 py-2 font-semibold">Détail</th>
                  </tr>
                </thead>
                <tbody>
                  {CLASSES_ENERGIE.map((c) => (
                    <tr key={c.classe} className="border-t border-sand-100">
                      <td className="px-3 py-2 align-top font-bold text-primary-700">{c.classe}</td>
                      <td className="px-3 py-2 align-top text-sand-700">{c.cop}</td>
                      <td className="px-3 py-2 align-top text-sand-700">{c.economie}</td>
                      <td className="px-3 py-2 align-top text-sand-700">{c.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="not-prose flex items-start gap-3 border border-amber-200 bg-amber-50 rounded-lg p-4 my-6">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <div className="text-sm text-amber-900">
                <p className="font-semibold m-0 mb-1">Méfiance sur le COP affiché</p>
                <p className="m-0">
                  Le COP nominal (mesuré en laboratoire à 7 °C) peut être très différent du COP réel
                  saisonnier. À 5 °C ambiant, le COP chute de 20-30 %. Pour comparer honnêtement,
                  exigez le COP NF EN 16147 mesuré en cycle complet (référence A15 pour air ambiant,
                  A14 pour air extrait). Les classes A+++ correspondent à un COP réel ≥ 3,5.
                </p>
              </div>
            </div>

            <h2 id="marques">6 marques fiables</h2>
            <div className="not-prose grid gap-3 my-6">
              {MARQUES.map((m) => (
                <div key={m.marque} className="bg-white border border-sand-200 rounded-xl p-5">
                  <div className="flex items-baseline justify-between gap-2 flex-wrap mb-2">
                    <h3 className="font-heading text-base font-semibold text-sand-900 m-0">
                      {m.marque}
                    </h3>
                    <span className="text-sm font-bold text-primary-700 whitespace-nowrap">
                      {m.fourchette}
                    </span>
                  </div>
                  <p className="text-sm text-sand-700 m-0 mb-1">
                    <strong>Modèles :</strong> {m.modeles}
                  </p>
                  <p className="text-xs text-sand-600 m-0">{m.note}</p>
                </div>
              ))}
            </div>

            <h2 id="aides">Aides 2026 cumulées</h2>
            <ul>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>MaPrimeRénov&apos; Bleu</strong> (revenus très modestes) :{' '}
                <strong>1 200 €</strong>. MPR Jaune (modestes) : 800 €. MPR Violet (intermédiaires)
                : 400 €.
              </li>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>CEE BAR-TH-148</strong> (chauffe-eau thermodynamique) :{' '}
                <strong>environ 150 €</strong> selon revenus et délégataire.
              </li>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Éco-PTZ</strong> : jusqu&apos;à <strong>30 000 €</strong> par geste,
                accessible si combiné avec d&apos;autres travaux d&apos;économie d&apos;énergie.
              </li>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>TVA 5,5 %</strong> : matériel + pose, sous condition d&apos;installateur RGE
                QualiPAC/Qualisol et logement &gt; 2 ans.
              </li>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Aides locales</strong> (région, département, métropole) : variables 100-500
                €. Voir notre simulateur pour le détail par département.
              </li>
            </ul>

            <div className="not-prose flex items-start gap-3 border border-primary-200 bg-primary-50 rounded-lg p-5 my-8">
              <Calculator className="w-5 h-5 text-primary-700 shrink-0 mt-0.5" aria-hidden />
              <div className="flex-1">
                <p className="font-semibold text-primary-900 m-0 mb-1">
                  Estimer mes aides ballon thermodynamique en 2 minutes
                </p>
                <p className="text-sm text-primary-900 m-0 mb-3">
                  Notre simulateur compare votre situation (revenus, surface, ECS actuelle) pour
                  estimer le coût net après aides MPR + CEE 2026. Liste de chauffagistes QualiPAC
                  proches de chez vous.
                </p>
                <Link
                  href="/simulateur-aides-renovation"
                  className="inline-flex items-center gap-1.5 bg-primary-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-800 transition-colors"
                >
                  Lancer le simulateur <ArrowRight className="w-4 h-4" aria-hidden />
                </Link>
              </div>
            </div>

            <h2 id="installation">Installation et obligations</h2>
            <ul>
              <li>
                <Wrench className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Local technique</strong> : 20 m³ minimum (pour modèle air ambiant), sec,
                ventilé, T° entre 5-30 °C toute l&apos;année.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Évacuation condensats</strong> vers le réseau eaux usées avec siphon (eau
                légèrement acide pH 5-6).
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Raccordement électrique</strong> : 230 V monophasé 16 A dédié, disjoncteur
                différentiel 30 mA. Calibre 2 500 W (compresseur + résistance appoint).
              </li>
              <li>
                <ShieldCheck className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Sécurité</strong> : groupe de sécurité obligatoire (3 bar) à remplacer tous
                les 5 ans. Anode magnésium à contrôler tous les 2-3 ans.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Distance</strong> chauffe-eau ↔ point de puisage le plus éloigné &lt; 8 m
                pour limiter pertes en lignes.
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
              href="/services/chauffagiste"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Chauffagistes QualiPAC <Coins className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
