/**
 * Page : /renovation-energetique/travaux/solaire/nettoyage
 *
 * @kw-primary    nettoyage panneau solaire
 * @kw-volume     3300
 * @kw-kd         3
 * @kw-cpc        0.85
 * @cluster       2
 * @ahrefs-source docs/ahrefs-bloc1-keywords-gap-2026-05-04.md
 * @snapshot      2026-05-04 (Ahrefs Bloc 1 v3 — cluster solaire orphelin)
 * @backlog-item  Levier-E-solaire-nettoyage
 *
 * KW cibles (validés Ahrefs Bloc 1 v3, country=fr) :
 * - "nettoyage panneau solaire"           → 3 300 vol, KD 3 ⭐⭐⭐ pivot
 * - "comment nettoyer panneau solaire"    → ~600 vol estimé, KD 1
 * - "prix nettoyage panneau solaire"      → ~400 vol estimé, KD 2
 * - "nettoyage panneau photovoltaique"    → ~250 vol estimé
 * - "nettoyer panneau solaire drone"      → ~150 vol estimé (niche pro)
 * - Famille cumulée pivot : ~4 700 vol/mois
 *
 * Source : docs/ahrefs-bloc1-keywords-gap-2026-05-04.md (cluster solaire orphelin)
 * Easy win : OUI (KD 3 sur pivot, 0 acteur RGE-first sur SERP, intent récurrent)
 * Cluster pillar : Rénovation Énergétique → Travaux → Solaire PV → Nettoyage
 *
 * Anti-cannibalisation :
 *   - Hub /travaux/solaire = installation, types, prix, aides EDF OA
 *   - Cette page = POST-INSTALLATION récurrent (intent maintenance, sans aides
 *     publiques mais valeur business artisan claire). Mêmes patterns que
 *     /pompe-a-chaleur/entretien (cluster « entretien post-install »).
 *   - /guides/panneau-solaire-prix-rentabilite = pré-existant, focus prix.
 *
 * YMYL medium : sécurité travail en hauteur (Code travail R4323-58 et suivants
 * + INRS) + intégrité physique du panneau (rayures couche anti-reflet =
 * perte rendement irréversible).
 *
 * Cite : INRS, ADEME, fabricants (DualSun, Sunpower, REC), CRE, QualiPV.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Sun,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Droplets,
  HardHat,
  Calendar,
  Sparkles,
  TrendingDown,
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

const PAGE_PATH = '/renovation-energetique/travaux/solaire/nettoyage'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'marc-lefebvre'
const AUTHOR_NAME = 'Marc Lefebvre'

const TITLE = 'Nettoyage panneau solaire 2026 : prix & méthode'
const DESCRIPTION =
  'Nettoyage panneau solaire 2026 : prix 100-300 € l’intervention, 1-2 fois par an. Eau déminéralisée, pas d’acide. Sécurité travail en hauteur.'

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
  'L’encrassement (poussière, pollen, fientes, suies) fait baisser la production de 5-10 % en moyenne, jusqu’à 20-30 % en zones polluées (proche autoroute, élevage, industrie).',
  'Fréquence recommandée 2026 : 1 fois par an (rural propre) à 2 fois par an (zones polluées ou littorales). Plus inutile : la pluie nettoie partiellement.',
  'Prix moyen 2026 : 100-200 € par intervention sur installation 3-6 kWc. Contrat annuel 1-2 visites : 200-400 € TTC. Forfait cumulé avec entretien onduleur.',
  'Méthode pro : eau déminéralisée tiède + brosse télescopique douce, pas de produits acides ni détergent (risque rayer la couche anti-reflet — perte rendement irréversible).',
  'Sécurité : travail en hauteur > 3 m soumis aux articles R4323-58 et suivants du Code du travail (harnais, garde-corps, formation). NE JAMAIS monter sans EPI.',
  'Robots de nettoyage : 1 500-3 000 € équipement (Solar Cleano, hyCLEANER) — usage rare en résidentiel, plutôt parc PV > 100 kWc.',
]

const FREQUENCE = [
  {
    zone: 'Zone rurale propre (sud, sud-est)',
    freq: '1× / an',
    perte: 'Encrassement annuel : 5-10 % perte',
    note: 'Pluie suffit majoritairement. Visite annuelle préventive recommandée.',
  },
  {
    zone: 'Zone urbaine / périurbaine',
    freq: '1-2× / an',
    perte: '8-15 % perte si pas nettoyé',
    note: 'Pollution automobile + pollen. Calendrier : printemps + automne.',
  },
  {
    zone: 'Zone littorale (sel + sable)',
    freq: '2× / an',
    perte: '10-20 % perte si pas nettoyé',
    note: 'Eau déminéralisée OBLIGATOIRE — l’eau salée laisse des traces.',
  },
  {
    zone: 'Zone agricole / élevage / industrielle',
    freq: '2-4× / an',
    perte: '15-30 % perte possible',
    note: 'Fientes, poussière, suie : encrassement rapide. Visite après période sensible.',
  },
]

const PRIX_PRESTATION = [
  {
    type: 'Visite ponctuelle 3-6 kWc',
    prix: '100 - 200 € TTC',
    inclus: 'Lavage panneaux + vérification visuelle fixations + bilan production.',
    note: 'Sans engagement. Tarif majoré +30-50 € si toit ≥ 35° pente ou hauteur > 6 m.',
  },
  {
    type: 'Visite ponctuelle 6-9 kWc',
    prix: '180 - 280 € TTC',
    inclus: 'Idem 3-6 kWc, durée 2-3 h. Eau déminéralisée fournie.',
    note: 'Selon densité fientes / oiseaux nichant, +50-100 € main-d’œuvre.',
  },
  {
    type: 'Contrat annuel 1 visite + onduleur',
    prix: '200 - 350 € / an TTC',
    inclus: 'Lavage + entretien onduleur + bilan production + alerte chute.',
    note: 'Avantage : suivi production via monitoring + dépannage prioritaire.',
  },
  {
    type: 'Contrat annuel 2 visites + onduleur',
    prix: '300 - 450 € / an TTC',
    inclus: '2 lavages + entretien onduleur + monitoring + 1-2 dépannages.',
    note: 'Idéal zones polluées ou installation > 6 kWc. ROI clair via gain production.',
  },
]

const METHODE_BONNES_PRATIQUES = [
  {
    title: 'Eau déminéralisée tiède (15-20 °C max)',
    must: 'Obligatoire',
    desc: 'L’eau du robinet contient calcaire qui laisse des traces blanches en séchant. Eau bouillante (> 35 °C) sur panneau froid = choc thermique = micro-fissures cellules. Tiède uniquement.',
  },
  {
    title: 'Brosse télescopique douce ou raclette caoutchouc',
    must: 'Obligatoire',
    desc: 'Pas d’abrasif (laine d’acier, brosse métallique). Pas de pression > 4 bar (nettoyeur haute pression interdit). La couche anti-reflet est fragile.',
  },
  {
    title: 'Aucun détergent acide / chlore / solvant',
    must: 'Interdit',
    desc: 'Risque détérioration de l’étanchéité du joint EVA + couche anti-reflet. Si fientes incrustées : tremper avec eau tiède 10 min puis brosser doucement.',
  },
  {
    title: 'Tôt matin ou fin journée (panneau froid)',
    must: 'Recommandé',
    desc: 'Nettoyer un panneau exposé plein soleil = évaporation rapide laissant des traces + risque choc thermique. Préférer 7-9 h ou 18-20 h.',
  },
  {
    title: 'Couper l’onduleur avant intervention',
    must: 'Obligatoire',
    desc: 'Sécurité électrique. Sectionneur DC à couper, attendre 5 min décharge condensateurs onduleur. Ne jamais nettoyer sous tension active.',
  },
]

const SECURITE_HAUTEUR = [
  {
    title: 'Code du travail R4323-58 à R4323-69',
    desc: 'Le travail en hauteur > 3 m impose : équipement de protection individuelle (EPI), point d’ancrage testé, garde-corps ou ligne de vie, formation du salarié.',
  },
  {
    title: 'INRS — Recommandation R408 / R430',
    desc: 'Pour installations PV en toiture, l’INRS impose : harnais antichute + longe + absorbeur d’énergie, échafaudage roulant ou nacelle si pente > 25°.',
  },
  {
    title: 'Assurance RC + décennale du prestataire',
    desc: 'Vérifier que l’artisan détient une assurance RC pro couvrant le travail en hauteur ET une décennale couvrant l’étanchéité de la toiture (intervention au-dessus du PV peut affecter la couverture).',
  },
  {
    title: 'NE JAMAIS faire soi-même au-delà de 3 m',
    desc: 'Le travail en hauteur sans formation ni EPI homologués est la 2ᵉ cause d’accidents mortels du BTP en France. La chute peut survenir d’une hauteur de 2 m et être létale.',
  },
]

const faqs = [
  {
    question: 'À quelle fréquence faut-il nettoyer ses panneaux solaires ?',
    answer:
      'En zone rurale propre, 1 fois par an suffit (la pluie fait l’essentiel). En zone urbaine, périurbaine ou littorale, 2 fois par an (printemps + automne) sont recommandées. En zone agricole, élevage ou industrielle, jusqu’à 4 fois par an. L’encrassement non traité peut faire chuter la production de 5 % (rural) à 30 % (zone très polluée). Le nettoyage est un investissement : son coût est largement compensé par le gain de production.',
  },
  {
    question: 'Combien coûte le nettoyage de panneaux solaires en 2026 ?',
    answer:
      'Une visite ponctuelle coûte 100 à 200 € TTC pour une installation 3-6 kWc, 180 à 280 € pour 6-9 kWc. Un contrat annuel (1 visite + entretien onduleur + monitoring) coûte 200 à 350 € TTC par an. Pour une installation 6 kWc encrassée à 15 %, le manque-à-gagner annuel est ~120-180 € — le contrat est rentable dès la 2ᵉ année.',
  },
  {
    question: 'Puis-je nettoyer mes panneaux moi-même ?',
    answer:
      'Si la toiture est inférieure à 3 m de hauteur (cabanon, hangar bas), oui en respectant 5 règles : eau déminéralisée tiède, brosse douce télescopique, jamais de détergent acide, tôt matin ou fin journée, onduleur coupé. Au-delà de 3 m de hauteur, le travail est encadré par les articles R4323-58 et suivants du Code du travail (harnais, formation, ancrage). C’est la 2ᵉ cause d’accidents mortels du BTP — faites appel à un professionnel.',
  },
  {
    question: 'Quels produits utiliser ou éviter absolument ?',
    answer:
      'À utiliser : eau déminéralisée tiède (15-20 °C), brosse télescopique douce, raclette caoutchouc. À éviter absolument : tout détergent acide (vinaigre fort, acide chlorhydrique), chlore, solvant pétrolier, produit nettoyeur de vitres standard, laine d’acier ou brosse métallique. La couche anti-reflet est fragile : un seul mauvais produit peut entraîner une perte de rendement définitive de 2 à 5 %.',
  },
  {
    question: 'Le nettoyeur haute pression est-il dangereux ?',
    answer:
      'Oui, à éviter : la pression supérieure à 4 bar peut décoller le joint EVA d’étanchéité du panneau et créer des micro-infiltrations entre les cellules silicium. Sur panneaux > 5 ans, le risque est encore plus élevé. Préférer un jet doux (tuyau d’arrosage classique avec lance débit moyen) ou une brosse alimentée en eau douce.',
  },
  {
    question: 'Faut-il un robot ou un drone pour nettoyer les panneaux ?',
    answer:
      'Pour le résidentiel (3-9 kWc), c’est rarement rentable. Les robots type Solar Cleano coûtent 1 500-3 000 € et nécessitent une connaissance technique. Les drones de nettoyage sont en phase de développement (peu d’acteurs en France en 2026). Ces solutions sont pertinentes pour les parcs PV > 100 kWc (industriels, agricoles). Pour un résidentiel, la prestation manuelle artisanale reste l’optimum coût/efficacité.',
  },
  {
    question: 'Le nettoyage est-il vraiment rentable ?',
    answer:
      'Oui. Sur une installation 6 kWc en zone urbaine produisant 7 200 kWh/an, un encrassement de 12 % représente ~860 kWh/an perdus, soit environ 130-170 € de manque-à-gagner (autoconsommation + revente surplus). Un contrat annuel 250 € coûte +120-180 € de plus que le gain... mais ajoute le suivi de production, l’entretien onduleur et le dépannage prioritaire. ROI net positif sur 5 ans pour une installation > 6 kWc.',
  },
  {
    question: 'Comment trouver un professionnel pour nettoyer mes panneaux ?',
    answer:
      'Privilégiez un artisan QualiPV (label RGE Qualit’EnR) ou un couvreur Qualibat 8211 avec assurance décennale. Demandez : numéro de qualification, attestation RC pro spécifique travail en hauteur, échafaudage ou nacelle prévue (pas d’escalade libre). Comparez 2-3 devis (écart typique 25-40 %). Évitez les démarcheurs téléphoniques proposant un nettoyage à 50 € — souvent suivis de pression à la vente d’un changement d’onduleur fictif.',
  },
]

const sources = [
  {
    label: 'INRS — Travail en hauteur, recommandations R408 / R430',
    url: 'https://www.inrs.fr/risques/chutes-hauteur',
  },
  {
    label: 'Légifrance — Code du travail R4323-58 à R4323-69',
    url: 'https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/LEGISCTA000018532034/',
  },
  {
    label: 'ADEME — Photovoltaïque entretien et performance',
    url: 'https://librairie.ademe.fr/changement-climatique-et-energie/4881-installer-des-panneaux-solaires-photovoltaiques.html',
  },
  { label: 'Qualit’EnR — Annuaire QualiPV', url: 'https://www.qualit-enr.org' },
  { label: 'CRE — Tarifs achat photovoltaïque', url: 'https://www.cre.fr' },
  {
    label: 'France Rénov’ — Photovoltaïque résidentiel',
    url: 'https://france-renov.gouv.fr/aides/aides-photovoltaique',
  },
]

const relatedPages = [
  {
    label: 'Hub Solaire (panneaux PV, prix, aides EDF OA)',
    href: '/renovation-energetique/travaux/solaire',
  },
  {
    label: 'Guide prix panneau solaire & rentabilité',
    href: '/guides/panneau-solaire-prix-rentabilite',
  },
  {
    label: 'Trouver un artisan QualiPV / RGE solaire',
    href: '/rge/qualipv',
  },
  {
    label: 'Hub Aides 2026 (MPR, CEE, éco-PTZ)',
    href: '/renovation-energetique/aides',
  },
  {
    label: 'Entretien pompe à chaleur (cluster post-install)',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/entretien',
  },
  {
    label: 'Diagnostic énergétique & DPE',
    href: '/renovation-energetique/diagnostic',
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
    section: 'Travaux — Solaire — Nettoyage',
    keywords: [
      'nettoyage panneau solaire',
      'comment nettoyer panneau solaire',
      'prix nettoyage panneau solaire',
      'entretien panneau solaire',
      'nettoyage panneau photovoltaïque',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Solaire', url: '/renovation-energetique/travaux/solaire' },
    { name: 'Nettoyage panneau solaire', url: PAGE_PATH },
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
              { label: 'Nettoyage panneau solaire' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Sparkles className="w-3.5 h-3.5" aria-hidden />
              Solaire &middot; Nettoyage 2026
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Nettoyage des panneaux solaires en 2026 : prix, méthode, sécurité
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Un panneau solaire encrassé peut perdre <strong>5 à 30 % de production</strong>{' '}
              annuelle. Comptez <strong>100 à 200 € TTC</strong> par intervention pour 3-6 kWc, ou
              200-350 € par an pour un contrat. La méthode pro : eau déminéralisée tiède, brosse
              douce, pas d’acide. Sécurité : travail en hauteur encadré (Code du travail R4323-58),
              ne jamais grimper sans EPI au-delà de 3 m.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>À quelle fréquence nettoyer ? Selon votre zone</h2>
            <p>
              La <strong>pluie nettoie partiellement</strong> les panneaux mais pas les fientes
              incrustées, le pollen agglutiné ou les suies de combustion. La fréquence optimale
              dépend principalement de votre environnement :
            </p>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Zone</th>
                    <th className="p-3 border-b border-sand-200">Fréquence</th>
                    <th className="p-3 border-b border-sand-200 hidden md:table-cell">
                      Perte sans nettoyage
                    </th>
                    <th className="p-3 border-b border-sand-200 hidden lg:table-cell">Note</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {FREQUENCE.map((row) => (
                    <tr key={row.zone} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold whitespace-nowrap">{row.zone}</td>
                      <td className="p-3 font-semibold text-primary-800 whitespace-nowrap">
                        {row.freq}
                      </td>
                      <td className="p-3 hidden md:table-cell">{row.perte}</td>
                      <td className="p-3 text-sand-600 hidden lg:table-cell">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Estimations production basées sur installation cristalline mono 3-6 kWc orientée
                sud, inclinaison 30°. Source : retours fabricants (DualSun, Sunpower, REC) + ADEME.
              </p>
            </div>

            <h2>Prix d’un nettoyage en 2026</h2>
            <p>
              Quatre formules dominent le marché. Le <strong>contrat 1 visite + onduleur</strong>{' '}
              est généralement le meilleur compromis pour une installation 3-6 kWc en zone urbaine.
            </p>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Formule</th>
                    <th className="p-3 border-b border-sand-200">Prix TTC</th>
                    <th className="p-3 border-b border-sand-200 hidden md:table-cell">Inclus</th>
                    <th className="p-3 border-b border-sand-200 hidden lg:table-cell">Note</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {PRIX_PRESTATION.map((row) => (
                    <tr key={row.type} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold whitespace-nowrap">{row.type}</td>
                      <td className="p-3 font-semibold text-primary-800 whitespace-nowrap">
                        {row.prix}
                      </td>
                      <td className="p-3 hidden md:table-cell">{row.inclus}</td>
                      <td className="p-3 text-sand-600 hidden lg:table-cell">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Tarifs nationaux 2026, hors prestations exceptionnelles (mousses, dépollution
                fientes massives, déneigement). Le contrat est généralement à TVA 10 % (logement
                &gt; 2 ans).
              </p>
            </div>

            <h2>La méthode pro en 5 règles</h2>
            <div className="not-prose grid gap-3 my-6">
              {METHODE_BONNES_PRATIQUES.map((rule) => (
                <div
                  key={rule.title}
                  className="bg-white border border-sand-200 rounded-lg p-4 flex items-start gap-3"
                >
                  <Droplets className="w-5 h-5 text-primary-700 shrink-0 mt-0.5" aria-hidden />
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between gap-2 flex-wrap">
                      <p className="font-semibold text-sand-900 m-0">{rule.title}</p>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded ${
                          rule.must === 'Obligatoire'
                            ? 'text-red-800 bg-red-50'
                            : rule.must === 'Interdit'
                              ? 'text-red-800 bg-red-50'
                              : 'text-amber-800 bg-amber-50'
                        }`}
                      >
                        {rule.must}
                      </span>
                    </div>
                    <p className="text-sm text-sand-700 m-0 mt-1">{rule.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="not-prose border-2 border-amber-300 bg-amber-50 rounded-lg p-5 my-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" aria-hidden />
                <div>
                  <p className="font-semibold text-amber-900 m-0">
                    Pas de nettoyeur haute pression, pas de produit acide.
                  </p>
                  <p className="text-sm text-amber-900 mt-2 mb-0">
                    La couche anti-reflet (SiO₂ ou TiO₂) est fragile. Un acide (vinaigre fort,
                    chlore, déboucheur) ou une pression &gt; 4 bar peut entraîner une perte de
                    rendement <strong>définitive</strong> de 2 à 5 %, voire la fissuration de
                    cellules silicium. Conséquence : remplacement panneau (~400-700 €/u) non couvert
                    par la garantie fabricant.
                  </p>
                </div>
              </div>
            </div>

            <h2>Sécurité : 4 règles pour le travail en hauteur</h2>
            <p>
              Le nettoyage de panneaux en toiture est un <strong>travail en hauteur</strong> encadré
              par le Code du travail. C’est la <strong>2ᵉ cause d’accidents mortels du BTP</strong>{' '}
              en France.
            </p>
            <div className="not-prose grid gap-3 my-6">
              {SECURITE_HAUTEUR.map((item) => (
                <div
                  key={item.title}
                  className="bg-white border border-red-200 rounded-lg p-4 flex items-start gap-3"
                >
                  <HardHat className="w-5 h-5 text-red-700 shrink-0 mt-0.5" aria-hidden />
                  <div className="flex-1">
                    <p className="font-semibold text-sand-900 m-0">{item.title}</p>
                    <p className="text-sm text-sand-700 m-0 mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calendar className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Trouver un professionnel pour nettoyer vos panneaux
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Demandez 3 devis comparés à des artisans QualiPV / couvreurs Qualibat 8211
                    vérifiés (assurance RC pro travail en hauteur + décennale). Réponse sous 48 h.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/devis"
                      className="inline-flex items-center gap-1.5 bg-primary-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
                    >
                      Demander 3 devis <ArrowRight className="w-4 h-4" aria-hidden />
                    </Link>
                    <Link
                      href="/rge/qualipv"
                      className="inline-flex items-center gap-1.5 bg-white text-primary-700 border border-primary-200 px-4 py-2 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
                    >
                      Annuaire QualiPV <ArrowRight className="w-4 h-4" aria-hidden />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <h2>Comment comparer 3 devis efficacement</h2>
            <ul>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Numéro QualiPV</strong> ou Qualibat 8211 (couverture) + décennale visible
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Assurance RC pro travail en hauteur</strong> mentionnée explicitement
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Eau déminéralisée fournie</strong> et brosse douce (pas haute pression)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Échafaudage ou nacelle</strong> mentionné si pente toit &gt; 25° ou hauteur
                &gt; 6 m (pas d’escalade libre)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Bilan production avant / après</strong> intégré au compte-rendu
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Détail prestation</strong> et durée d’intervention (pas de forfait global
                opaque)
              </li>
            </ul>

            <h2>Combien gagne-t-on à nettoyer ?</h2>
            <p>
              Pour une installation 6 kWc orientée sud à Lyon (zone urbaine moyenne), production
              annuelle théorique ~6 800 kWh/an. Avec un encrassement de 12 % :
            </p>
            <ul>
              <li>
                <TrendingDown className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden /> Perte
                annuelle : ~820 kWh = <strong>130-180 €/an</strong> manque-à-gagner (autoconso +
                surplus)
              </li>
              <li>
                <Sparkles className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden /> Coût
                contrat 1 visite/an : 200-280 €
              </li>
              <li>
                <ShieldCheck className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden /> ROI net
                : positif dès la 2ᵉ année si zone urbaine ou polluée
              </li>
              <li>
                <ShieldCheck className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden /> Bonus :
                suivi production via monitoring + alerte chute (anomalie onduleur, panneau cassé)
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
              href="/rge/qualipv"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Artisans QualiPV <Sun className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
