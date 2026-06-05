/**
 * /guides/robinet-thermostatique-radiateur — Hub robinet thermostatique
 *
 * @kw-primary    robinet thermostatique
 * @kw-volume     8600
 * @kw-kd         0
 * @kw-cpc        12
 * @kw-secondary  robinet thermostatique radiateur (3 400, KD 0, CPC 8)
 * @cluster       6 (régulation chauffage / économie énergie)
 * @intent        commercial + informational (prix + comment installer)
 * @ahrefs-source docs/audit-ahrefs-2026-05-03/keyword_opportunities_2026-05.csv:7,10
 * @snapshot      2026-05-13 (chantier #10 KW commerciaux nouvelle page)
 *
 * Competitor hellio rang 1-3 sur les deux KW (volume cumul 12 000/mo, KD 0).
 * Création nouvelle page flagship — niche RGE indirect (régulation = CEE
 * BAR-TH-118 / BAR-TH-173 possibles, économie énergie geste accessible).
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

const SLUG = 'robinet-thermostatique-radiateur'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-05-13'
const MODIFIED = '2026-05-13'
const AUTHOR_NAME = 'Jean-Pierre Duval'

export const revalidate = 86400

const TITLE = 'Robinet thermostatique radiateur : prix, pose et économies 2026'
const DESCRIPTION =
  'Robinet thermostatique radiateur 2026 : prix 8-35 €, pose 30-60 €/robinet, économie 5-10 % chauffage. Installation DIY ou plombier RGE, CEE BAR-TH-118.'

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
  'Prix 2026 : robinet thermostatique manuel 8-15 €/unité, connecté 30-80 €/unité. Pose plombier 30-60 €/robinet (15-30 min de main d’œuvre).',
  'Économie facture chauffage : 5-10 % en remplaçant les robinets manuels, jusqu’à 15-25 % en pilotant pièce par pièce (programmation horaire).',
  'Compatibilité : tous radiateurs eau chaude (circuit collectif ou individuel). Filetage standard M30×1,5 ou M28×1,5 selon corps de robinet existant.',
  'CEE possible BAR-TH-118 (régulation par classe A) : 5-15 €/robinet via prime énergie selon fournisseur (Effy, TotalEnergies, EDF).',
  'Installation DIY accessible (15-20 min/robinet, clé à molette + chiffon, eau coupée et radiateur vidé partiellement) — plombier requis seulement si filetage non standard ou fuite ancienne.',
]

const faqs = [
  {
    question: 'Combien coûte un robinet thermostatique en 2026 ?',
    answer:
      'Prix 2026 par modèle : (1) Manuel entrée de gamme (Comap M28/M30, Honeywell HR20) : 8-15 € TTC l’unité chez Leroy Merlin/Castorama/Brico Dépôt ; (2) Manuel milieu de gamme (Danfoss RA, Heimeier IMI) : 15-25 € ; (3) Connecté Wi-Fi/Zigbee (Netatmo Tado, Bosch EasyControl) : 30-80 € l’unité, 200-500 € pour un kit 4-6 robinets. Pack 6 robinets manuels : 50-90 €. Pose plombier : 30-60 €/robinet (15-30 min de main d’œuvre + remise en eau), forfait pose 6 robinets : 150-300 € TTC. Durée vie : 15-20 ans manuel, 8-12 ans connecté (pile bouton CR2 à changer tous les 2 ans).',
  },
  {
    question: 'Quelle économie de chauffage avec un robinet thermostatique ?',
    answer:
      'Économies mesurées ADEME / RAGE : (1) Remplacement robinets manuels classiques par thermostatiques : 5-10 % facture chauffage annuelle (vanne ferme automatiquement quand température cible atteinte, vs robinet quart-de-tour qui chauffe en continu) ; (2) Avec programmation horaire (thermostatique connecté) : 15-25 % d’économie par pièce sous-utilisée (chambres jour, bureau soir), grâce au mode absence/nuit/confort ; (3) Pour une maison 100 m² chauffée 1 500 €/an : 75-150 € d’économie sans connecté, 225-375 € avec connecté. Amortissement : 6-12 mois en manuel, 18-24 mois en connecté. Bonus : confort thermique amélioré (chaque pièce à sa température), durée de vie chaudière prolongée (cycles plus courts).',
  },
  {
    question: 'Robinet thermostatique compatible avec mon radiateur ?',
    answer:
      'Compatibilité radiateurs eau chaude (chauffage central) : 95 % du parc français. (1) Vérifier le pas de vis du corps de robinet existant : M30×1,5 (le plus courant, 80 % des radiateurs modernes), M28×1,5 (anciens Comap), M22 ou M23 (radiateurs italiens Caleffi). Adaptateurs disponibles 3-8 €. (2) Radiateur sèche-serviettes : compatible, choisir thermostatique adapté finition chromée. (3) Radiateur électrique : INCOMPATIBLE (pas de circuit eau), utiliser thermostat ambiance dédié à la place. (4) Chauffage collectif copropriété : autorisation syndic obligatoire (réglage hydraulique à équilibrer). (5) Plancher chauffant eau : robinet thermostatique inadapté, préférer thermostat d’ambiance par boucle.',
  },
  {
    question: 'Aides CEE disponibles pour robinet thermostatique 2026 ?',
    answer:
      'Prime CEE BAR-TH-118 « Régulation par programmation horaire/sonde extérieure/classe A » : 5-15 €/robinet selon fournisseur. (1) Effy Prime : 7-12 €/robinet thermostatique classe A (NF EN 215). (2) TotalEnergies Coup de Pouce : 5-10 € en bonus si bouquet régulation + chaudière. (3) EDF Bleu Ciel : 8-15 €/robinet selon catégorie de revenus. Conditions : robinet certifié classe A (NF EN 215), installation par professionnel ou auto-installation déclarée, devis avant achat OBLIGATOIRE (la prime ne couvre pas un achat antérieur). Logement résidence principale, >2 ans. Versement 4-8 semaines après preuve de pose. Cumul avec TVA 5,5 % si pose pro (sinon TVA 20 %).',
  },
  {
    question: 'Comment installer un robinet thermostatique soi-même ?',
    answer:
      'Installation DIY (15-20 min par robinet, niveau bricolage débutant) : (1) Couper le chauffage 30 min avant (circuit froid = pas de brûlure ni pression) ; (2) Fermer la vanne du radiateur (côté retour) et purger l’air (clé de purge en haut, bassine en bas) jusqu’à voir filet d’eau ; (3) Démonter ancien robinet : clé plate ou pipe (24 ou 27 mm selon modèle), tourner sens antihoraire ; (4) Vérifier joint torique d’étanchéité (changer si abîmé, 0,30 €/unité) ; (5) Visser nouveau robinet thermostatique en serrant à la main + 1/4 tour clé (NE PAS forcer, fond hexagonal fragile) ; (6) Remettre en eau et purger à nouveau ; (7) Régler la tête sur position 3 (≈ 20 °C) et tester montée en chauffe. Outils : clé à molette + pipe + clé de purge + chiffon + bassine. Si fuite : resserrer 1/4 tour de plus, sinon remplacer joint. Plombier obligatoire seulement si corps de robinet ancien à changer (50-100 € supplémentaires).',
  },
  {
    question: 'Robinet thermostatique connecté ou manuel : que choisir ?',
    answer:
      'Arbitrage budget vs économies : (1) Manuel (8-25 €) recommandé pour : pièces stables (salon, cuisine en occupation continue), budget serré, pas de Wi-Fi/box internet, logement étudiant ou location courte. Économie 5-10 %. (2) Connecté (30-80 €) recommandé pour : maison >100 m², pièces à occupation variable (chambres, bureau, salle de bain), domotique existante (Google Home/Alexa/Apple HomeKit), programmation horaire fine. Économie 15-25 %. ROI manuel : 6-12 mois. ROI connecté : 18-24 mois. Conseil : commencer par 2-3 connectés sur pièces principales (salon, chambre parentale, salle de bain) + manuels sur les autres = meilleur rapport gain/coût. Marques fiables : Comap (manuel), Honeywell, Danfoss, Netatmo, Tado, Bosch (connecté).',
  },
]

const sources = [
  { label: 'ADEME — Régulation chauffage', url: 'https://www.ademe.fr' },
  {
    label: 'France-Rénov’ — Prime CEE régulation',
    url: 'https://france-renov.gouv.fr',
  },
  { label: 'NF EN 215 — Classification robinets thermostatiques', url: 'https://www.afnor.org' },
  { label: 'RAGE — Performance régulation chauffage', url: 'https://www.programmepacte.fr' },
]

const relatedGuides = [
  { label: 'Pompe à chaleur prix 2026', href: '/guides/pompe-a-chaleur' },
  { label: 'Thermostat connecté économies', href: '/guides/thermostat-connecte-economie-energie' },
  { label: 'Chaudière ne chauffe plus : diagnostic', href: '/guides/chaudiere-ne-chauffe-plus' },
  {
    label: 'CEE certificats économies énergie 2026',
    href: '/guides/cee-certificats-economies-energie-2026',
  },
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
      'robinet thermostatique',
      'robinet thermostatique radiateur',
      'prix robinet thermostatique',
      'CEE BAR-TH-118',
      'économie chauffage',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Robinet thermostatique radiateur', url: `/guides/${SLUG}` },
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
              { label: 'Guides', href: '/guides' },
              { label: 'Robinet thermostatique radiateur' },
            ]}
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
              Robinet thermostatique radiateur : prix, pose et économies 2026
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Un robinet thermostatique régule automatiquement la température de chaque radiateur et
              fait baisser la facture de chauffage de 5 à 25 % selon le modèle (manuel ou connecté).
              Voici les prix 2026, les économies réelles mesurées par l’ADEME et les conditions
              d’éligibilité à la prime CEE BAR-TH-118.
            </p>
          </header>

          <TldrBlock bullets={tldr} />

          <section className="bg-white border border-sand-300 rounded-2xl shadow-soft p-6 my-8">
            <h2 className="font-heading text-2xl font-bold text-sand-900 mb-4 flex items-center gap-2">
              <Thermometer className="w-6 h-6 text-primary-500" aria-hidden />
              Pourquoi installer un robinet thermostatique ?
            </h2>
            <p className="text-sand-700 leading-relaxed mb-4">
              Le robinet thermostatique est{' '}
              <strong>le geste d’économie d’énergie le plus rentable</strong> en logement chauffé à
              eau chaude. Pour un investissement de 50-90 € (6 robinets manuels) ou 250-500 € (pack
              connecté), l’économie annuelle se situe entre 75 € et 375 € selon la configuration du
              logement.
            </p>
            <p className="text-sand-700 leading-relaxed">
              Trois leviers cumulés : <strong>régulation automatique</strong> (la vanne ferme dès
              température cible atteinte), <strong>différenciation pièce par pièce</strong> (20 °C
              salon, 17 °C chambre, 22 °C salle de bain) et <strong>programmation horaire</strong>
              avec les modèles connectés (mode absence, nuit, confort).
            </p>
          </section>

          <section className="bg-white border border-sand-300 rounded-2xl shadow-soft p-6 my-8">
            <h2 className="font-heading text-2xl font-bold text-sand-900 mb-4">
              Prix 2026 : manuel vs connecté
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border border-sand-300 rounded-lg">
                <thead className="bg-primary-50">
                  <tr>
                    <th className="text-left px-3 py-2 text-charcoal-900">Type</th>
                    <th className="text-left px-3 py-2 text-charcoal-900">Prix unité</th>
                    <th className="text-left px-3 py-2 text-charcoal-900">Pose</th>
                    <th className="text-left px-3 py-2 text-charcoal-900">Économie/an</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-200">
                  <tr>
                    <td className="px-3 py-2">Manuel entrée gamme</td>
                    <td className="px-3 py-2">8-15 €</td>
                    <td className="px-3 py-2">30-60 €</td>
                    <td className="px-3 py-2">75-150 €</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2">Manuel milieu gamme</td>
                    <td className="px-3 py-2">15-25 €</td>
                    <td className="px-3 py-2">30-60 €</td>
                    <td className="px-3 py-2">100-180 €</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2">Connecté Wi-Fi/Zigbee</td>
                    <td className="px-3 py-2">30-80 €</td>
                    <td className="px-3 py-2">40-80 €</td>
                    <td className="px-3 py-2">225-375 €</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-charcoal-500 mt-3">
              Sources : ADEME, devis observés Effy/Sonergia 2025-2026, panel artisans plombiers RGE
              ServicesArtisans.
            </p>
          </section>

          <aside className="bg-accent-50 border border-accent-200 rounded-2xl p-6 my-8">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-accent-700 flex-shrink-0" aria-hidden />
              <div>
                <h3 className="font-heading text-lg font-bold text-accent-900 mb-2">
                  Prime CEE BAR-TH-118 : 5-15 €/robinet
                </h3>
                <p className="text-accent-800 leading-relaxed">
                  Robinet thermostatique <strong>classe A (NF EN 215)</strong> éligible CEE
                  régulation. Demander un devis prime AVANT achat (un achat sans devis préalable
                  n’est pas remboursable). Prime versée 4-8 semaines après preuve de pose.
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
              Faire poser vos robinets par un plombier RGE
            </h2>
            <p className="text-primary-50 mb-6">
              Devis gratuit en 24 h auprès d’artisans plombiers vérifiés près de chez vous.
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
