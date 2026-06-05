/**
 * /renovation-energetique/travaux/vmc/hygroreglable — hub focus type A vs B.
 *
 * @kw-primary    vmc hygroréglable
 * @kw-volume     14000
 * @kw-kd         1
 * @kw-cpc        2.40
 * @intent        commercial
 * @cluster       reno-energetique-vmc-hygroreglable
 * @ahrefs-source bloc1
 * @snapshot      2026-05-06 (audit Sprint1-20-80 — recheck + maillage type-b)
 * @backlog-item  Sprint1-20-80-vmc-hygroreglable-audit
 *
 * Audit 2026-05-06 : page existante validée Bloc 1, KW pivot top priorité
 * (14K vol KD 1). Header enrichi @intent + cluster slug. Maillage interne renforcé
 * vers nouvelle sub-page /vmc/hygroreglable/type-b/ (1 700 vol KD 0).
 *
 * Famille cumulée ~16 400 vol/mois :
 * - "vmc hygroréglable"        → 14 000 vol, KD 1 ⭐⭐⭐⭐⭐ PIVOT (quelleenergie.fr #2)
 * - "vmc hygroréglable type a" →    720 vol, KD 0 (à creuser dans sub-page type-a future)
 * - "vmc hygroréglable type b" →  1 700 vol, KD 0 (✅ couvert par /type-b/)
 * - "vmc hygro b"              →  1 500 vol, KD 1 (✅ couvert)
 * - "prix vmc hygroreglable"   →    320 vol, KD 0 (couvert dans cette page)
 *
 * Easy win : OUI MEGA — KD 1 head term 14K vol, leader 1 absent (gov absent).
 * Atout SA : approfondissement type A vs B + débits réglementaires + RGE 8721 +
 * DevisCTA inline + maillage cascade vers /type-b/ (focus deep).
 *
 * Anti-cannibalisation :
 *   - Hub /vmc = head term "vmc" 48K (panorama)
 *   - Cette page = panorama type A vs B (intent comparison)
 *   - /vmc/hygroreglable/type-b = focus deep type B
 *   - /vmc/hygroreglable/type-a (à créer Sprint 2) = focus deep type A
 *   - /vmc/simple-flux = panorama simple flux générique
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Award, Calculator, Droplets } from 'lucide-react'

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
import SimulateurAideBox from '@/components/conversion/SimulateurAideBox'
import LocalProviderShowcase from '@/components/seo/LocalProviderShowcase'
import { getProvidersByService } from '@/lib/supabase'
import PrixComparatif from '@/components/conversion/PrixComparatif'

export const revalidate = 86400

const PAGE_PATH = '/renovation-energetique/travaux/vmc/hygroreglable'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-04'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'marc-lefebvre'
const AUTHOR_NAME = 'Marc Lefebvre'

const TITLE = 'VMC hygroréglable 2026 : type A vs B, prix, économie'
const DESCRIPTION =
  'VMC hygroréglable 2026 : différence type A et B, prix posé 900-2 500 €, économie chauffage 5-12 %, CEE 100-300 €. Guide complet RGE Qualibat 8721.'

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
  'VMC hygroréglable = bouches d’extraction modulent leur débit selon l’humidité ambiante (sondes hygrométriques).',
  'Type A : seules les bouches modulent. Type B : bouches + entrées d’air haute fenêtre modulent (top performance).',
  'Prix posé 2026 : 900-2 200 € (type A), 1 100-2 500 € (type B).',
  'Économie chauffage : 5-8 % (type A), 8-12 % (type B) vs autoréglable.',
  'CEE Coup de pouce : 100-300 €. RGE Qualibat 8721 obligatoire.',
  'Choix #1 en rénovation classique (logement non isolé ou isolation partielle).',
]

const TYPE_A_VS_B = [
  {
    critere: 'Mécanisme',
    a: 'Bouches d’extraction hygro (cuisine, SDB, WC)',
    b: 'Type A + entrées d’air haute fenêtre hygro (séjour, chambres)',
  },
  {
    critere: 'Débit en absence',
    a: '5-10 m³/h (minimal réglementaire)',
    b: '5 m³/h (vraiment minimal)',
  },
  {
    critere: 'Débit pic (douche/cuisson)',
    a: '90-135 m³/h (T2 à T6)',
    b: '105-145 m³/h (T2 à T6)',
  },
  {
    critere: 'Économie chauffage',
    a: '5-8 % vs autoréglable',
    b: '8-12 % vs autoréglable',
  },
  {
    critere: 'Prix posé maison 100 m²',
    a: '900-2 200 €',
    b: '1 100-2 500 €',
  },
  {
    critere: 'CEE Coup de pouce',
    a: '100-250 €',
    b: '150-300 €',
  },
  {
    critere: 'Confort acoustique',
    a: 'Bon (bouches modulent)',
    b: 'Excellent (entrées d’air aussi)',
  },
  {
    critere: 'Recommandé pour',
    a: 'Logement avec entrées d’air en bon état',
    b: 'Rénovation complète, top économie chauffage',
  },
]

const DEBITS_REGLEMENTAIRES = [
  { type: 'T1 (1 pièce principale)', cuisine: '20-75', sdb: '15-30', wc: '15' },
  { type: 'T2 (2 pièces)', cuisine: '30-90', sdb: '15-30', wc: '15' },
  { type: 'T3 (3 pièces)', cuisine: '45-105', sdb: '30', wc: '15' },
  { type: 'T4 (4 pièces)', cuisine: '45-120', sdb: '30', wc: '30' },
  { type: 'T5 (5 pièces)', cuisine: '45-135', sdb: '30 (+ 15 second)', wc: '30' },
  { type: 'T6+ (6 pièces et plus)', cuisine: '45-135', sdb: '30 par SDB', wc: '30' },
]

const faqs = [
  {
    question: 'Quelle différence entre VMC hygroréglable type A et type B ?',
    answer:
      'Type A : seules les <strong>bouches d’extraction</strong> sont hygroréglables (modulent selon humidité). Les entrées d’air en haut des fenêtres sont fixes. Type B : <strong>bouches + entrées d’air</strong> sont hygroréglables. Type B = top performance car le débit total est ajusté plus finement. Économie chauffage : 5-8 % (A) vs 8-12 % (B). Prix supplémentaire B vs A : 200-300 €. Confort acoustique légèrement meilleur en B (entrées d’air silencieuses en absence).',
  },
  {
    question: 'Combien coûte une VMC hygroréglable en 2026 ?',
    answer:
      'Prix posé clé en main 2026 (maison 100 m², rénovation) : <strong>type A</strong> 900-2 200 €, <strong>type B</strong> 1 100-2 500 €. Le matériel (caisson + bouches hygro + entrées d’air hygro pour B) représente 50-65 %, la pose 35-50 %. Si bouches uniquement à remplacer (caisson existant en bon état) : 300-700 € seulement. En neuf : 800-1 400 € (intégration plus simple).',
  },
  {
    question: 'Quelles aides 2026 pour une VMC hygroréglable ?',
    answer:
      '<strong>CEE Coup de pouce</strong> : 100-300 € selon offre énergéticien (TotalEnergies, EDF, Engie, Sonergia, etc.). <strong>TVA 5,5 %</strong> automatique avec artisan RGE Qualibat 8721. <strong>Pas de MaPrimeRénov’</strong> seule (réservée double flux). Eligible MPR uniquement en <strong>Parcours Accompagné</strong> (rénovation globale gain énergétique &gt; 35 %). Astuce : cumuler avec isolation des combles ou changement chaudière pour bénéficier d’un bonus CEE bouquet (+ 30-50 % sur la prime).',
  },
  {
    question: 'Quels débits réglementaires pour une VMC hygroréglable ?',
    answer:
      'Débits réglementaires (arrêté du 24 mars 1982, modifié 2017) : cuisine 20-135 m³/h selon nombre de pièces (T1-T6+), salle de bain 15-30 m³/h, WC 15-30 m³/h. En hygroréglable, ces débits sont des <strong>maxima</strong> ; le débit réel module entre 5 m³/h (absence/sécheresse) et le max (cuisson/douche/forte humidité). NF DTU 68.3 fixe la mise en œuvre. La mesure des débits aux bouches lors de la mise en service est obligatoire.',
  },
  {
    question: 'VMC hygroréglable ou double flux : laquelle choisir ?',
    answer:
      'Hygroréglable B : <strong>logement non isolé ou isolation partielle</strong>, budget &lt; 2 500 €, ROI 4-7 ans. Double flux : <strong>logement bien isolé</strong> (combles + murs + fenêtres), budget &gt; 4 000 €, ROI 5-7 ans. Pourquoi : double flux récupère la chaleur via échangeur, gain 15-25 % vs hygro. Sans isolation préalable, fuites d’air court-circuitent l’échangeur, ROI s’allonge à 12-15 ans. Règle simple : <strong>isoler avant de mettre une double flux</strong>.',
  },
  {
    question: 'Quelle marque de VMC hygroréglable choisir ?',
    answer:
      '<strong>Aldes</strong> (EasyHOME Hygro Premium / Compact, leader marché), <strong>Atlantic</strong> (HygroCosy / Optimocosy), <strong>Unelvent</strong> (Ozeo / Ideo), <strong>Helios</strong>. Vérifier : <strong>NF EN 13141-6</strong> (norme produit hygro), niveau sonore &lt; 30 dB(A) à 1 m, conformité arrêté 24/03/1982 (débits), garantie 2-5 ans, fiche standardisée CEE BAR-TH-127. Pour copropriété : exiger marquage <strong>NF Coll</strong> (ventilation collective).',
  },
  {
    question: 'Faut-il refaire les entrées d’air pour passer en hygro B ?',
    answer:
      'Oui, c’est ce qui différencie B de A. Les entrées d’air <strong>haute fenêtre fixes</strong> doivent être remplacées par des <strong>entrées d’air hygroréglables</strong> dans toutes les pièces principales (séjour, chambres). Coût supplémentaire : 30-60 € par entrée + pose 20-30 €. Pour 4 pièces principales : 200-360 € total. À noter : si fenêtres récentes avec joints triple lèvre, vérifier que les entrées d’air sont fonctionnelles (sinon air neuf insuffisant = pression négative + condensation).',
  },
  {
    question: 'Combien de temps pour installer une VMC hygroréglable ?',
    answer:
      'Installation 1-2 jours pour une maison 100 m². Étapes : (1) dépose ancienne VMC si existante (1h), (2) pose nouveau caisson (1-2h), (3) passage gaines isolées si nécessaire (2-4h), (4) pose bouches hygro (cuisine, SDB, WC) (1h), (5) pose entrées d’air hygro pour type B (1h), (6) raccordement électrique + mise en service avec mesure débits (1h). Pas de coupure d’eau, électricité limitée à 30 min.',
  },
]

const sources = [
  { label: 'France Rénov’ — Ventilation', url: 'https://france-renov.gouv.fr' },
  { label: 'ADEME — Guide ventilation', url: 'https://www.ademe.fr' },
  { label: 'Arrêté 24 mars 1982 — Aération logements', url: 'https://www.legifrance.gouv.fr' },
  { label: 'NF EN 13141-6 — VMC hygroréglable', url: 'https://www.afnor.org' },
  { label: 'NF DTU 68.3 — Mise en œuvre VMC', url: 'https://www.afnor.org' },
  { label: 'Fiche standardisée CEE BAR-TH-127', url: 'https://atee.fr' },
]

const relatedPages = [
  {
    label: 'Hub VMC',
    href: '/renovation-energetique/travaux/vmc',
    description: 'Comparatif 4 familles VMC',
  },
  {
    label: 'VMC hygroréglable type B (focus deep)',
    href: '/renovation-energetique/travaux/vmc/hygroreglable/type-b',
    description: 'Modulation totale entrées + bouches, économie 8-12 %, marques top',
  },
  {
    label: 'VMC simple flux (générique)',
    href: '/renovation-energetique/travaux/vmc/simple-flux',
    description: 'Auto vs hygro vue d’ensemble',
  },
  {
    label: 'VMC double flux',
    href: '/renovation-energetique/travaux/vmc-double-flux',
    description: 'Si logement bien isolé : récup chaleur 70-90 %',
  },
  {
    label: 'CEE — Certificats économie d’énergie',
    href: '/renovation-energetique/aides/cee-certificats-economie-energie',
    description: 'Coup de pouce VMC + cumul travaux',
  },
  {
    label: 'Isolation combles',
    href: '/renovation-energetique/travaux/isolation/combles',
    description: 'À faire avant la VMC double flux',
  },
  {
    label: 'Simulateur aides 2026',
    href: '/simulateur-aides-renovation',
    description: 'Calcul personnalisé instantané',
  },
]

export default async function Page() {
  const providers = await getProvidersByService('ventilation', 6)
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: PAGE_PATH,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'VMC hygroréglable',
    keywords: [
      'vmc hygroreglable',
      'vmc hygroreglable type a',
      'vmc hygroreglable type b',
      'vmc hygro b',
      'prix vmc hygroreglable',
      'vmc hygroreglable 2026',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique/travaux' },
    { name: 'VMC', url: '/renovation-energetique/travaux/vmc' },
    { name: 'Hygroréglable', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const govSchema = getGovernmentServiceSchema({
    name: 'VMC hygroréglable : CEE Coup de pouce 2026',
    description:
      'VMC hygroréglable type A ou B éligible CEE Coup de pouce 100-300 € + TVA 5,5 %. Installation par artisan RGE Qualibat 8721 obligatoire pour les aides.',
    url: PAGE_URL,
    serviceType: 'Subvention publique ventilation hygroréglable',
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
              { label: 'VMC', href: '/renovation-energetique/travaux/vmc' },
              { label: 'Hygroréglable' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Award className="w-3.5 h-3.5" aria-hidden />
              VMC hygroréglable 2026 — Choix #1 rénovation
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              VMC hygroréglable 2026 : type A vs B, prix, économie
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              La <strong>VMC hygroréglable</strong> module son débit selon l’humidité ambiante :
              minimal en absence, maximal lors d’une douche ou cuisson. <strong>Type A</strong>{' '}
              (bouches hygro uniquement, 900-2 200 €) ou <strong>Type B</strong> (bouches + entrées
              d’air hygro, 1 100-2 500 €). Économie chauffage 5-12 % vs autoréglable.{' '}
              <strong>CEE 100-300 €</strong> + TVA 5,5 %. Top choix en rénovation classique sans
              isolation lourde.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2 id="fonctionnement">Comment fonctionne l’hygroréglable</h2>
            <p>
              <Droplets className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
              Les <strong>bouches d’extraction hygroréglables</strong> contiennent une tresse de
              nylon sensible à l’humidité. En présence de vapeur d’eau (douche, cuisson,
              respiration), la tresse se détend et ouvre le clapet : le débit augmente jusqu’au
              maximum réglementaire. En air sec (absence, hiver), le clapet se referme : débit
              minimal 5-10 m³/h. Résultat : ventilation adaptée aux besoins réels, économie
              chauffage 5-12 % vs autoréglable (qui aspire toujours au max).
            </p>

            <h2 id="type-a-vs-b">Type A vs Type B : tableau comparatif</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Critère</th>
                    <th className="p-3 border-b border-sand-200">Type A</th>
                    <th className="p-3 border-b border-sand-200">Type B</th>
                  </tr>
                </thead>
                <tbody>
                  {TYPE_A_VS_B.map((c) => (
                    <tr key={c.critere} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium text-sand-900">{c.critere}</td>
                      <td className="p-3 text-amber-700">{c.a}</td>
                      <td className="p-3 text-primary-700 font-semibold">{c.b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 id="debits">Débits réglementaires (arrêté 24/03/1982)</h2>
            <p>
              Débits maxima en m³/h selon le type de logement (T1 à T6+) et la pièce. Le débit réel
              en hygroréglable module entre 5 m³/h (absence) et ces maxima (forte humidité).
            </p>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Type logement</th>
                    <th className="p-3 border-b border-sand-200">Cuisine (m³/h)</th>
                    <th className="p-3 border-b border-sand-200">SDB (m³/h)</th>
                    <th className="p-3 border-b border-sand-200">WC (m³/h)</th>
                  </tr>
                </thead>
                <tbody>
                  {DEBITS_REGLEMENTAIRES.map((r) => (
                    <tr key={r.type} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium text-sand-900">{r.type}</td>
                      <td className="p-3">{r.cuisine}</td>
                      <td className="p-3">{r.sdb}</td>
                      <td className="p-3">{r.wc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 id="economie">Économie chauffage chiffrée</h2>
            <p>
              Sur une facture chauffage type 1 200 €/an (maison 100 m² isolée partiellement) :
              autoréglable = 1 200 € (référence), <strong>hygro A = 1 104-1 140 €</strong> (gain
              60-96 €/an), <strong>hygro B = 1 056-1 104 €</strong> (gain 96-144 €/an). ROI typique
              hygro B vs autoréglable : 4-7 ans. À noter : économie réelle dépend du climat (zone
              froide H1 = ROI rapide), du nombre d’occupants (plus on est, plus l’hygro module), et
              de l’étanchéité du logement.
            </p>

            <h2 id="cta">Trouvez un artisan RGE Qualibat 8721</h2>
            <div className="not-prose bg-primary-50 border border-primary-200 rounded-xl p-6 my-6">
              <p className="text-sand-900 m-0 mb-3">
                <Calculator className="inline w-5 h-5 text-primary-700 mr-1" aria-hidden />
                <strong>Devis VMC hygroréglable en 30 secondes</strong> — artisans RGE Qualibat 8721
                pour CEE 100-300 € + TVA 5,5 %.
              </p>
              <Link
                href="/devis"
                className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-5 py-3 rounded-lg transition"
              >
                Demander mon devis VMC <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
            </div>
          </article>

          <PrixComparatif
            title="Prix VMC hygroréglable A vs B (posé clé en main 2026)"
            caption="Maison 100 m² en rénovation, RGE Qualibat 8721, TVA 5,5 % incluse. Sources : ADEME 2026, AFPAC, retours terrain devis."
            rows={[
              {
                brand: 'VMC hygroréglable type A',
                priceRange: '900 - 2 200 €',
                notes: 'Bouches modulent seules, économie 5-8 %',
                rating: 4.0,
              },
              {
                brand: 'VMC hygroréglable type B',
                priceRange: '1 100 - 2 500 €',
                notes: "Bouches + entrées d'air modulent, économie 8-12 %",
                rating: 4.4,
                highlight: true,
              },
              {
                brand: 'VMC autoréglable (référence)',
                priceRange: '500 - 1 200 €',
                notes: 'Pas de modulation, débit fixe',
                rating: 3.4,
              },
              {
                brand: 'VMC hygro B basse conso (EC)',
                priceRange: '1 600 - 3 000 €',
                notes: 'Moteurs EC -50 % conso élec',
                rating: 4.5,
              },
            ]}
            withSchema
          />

          <SimulateurAideBox
            serviceKey="vmc-hygroreglable"
            estimatedSaving={300}
            subtitle="CEE Coup de pouce 100-300 € + TVA 5,5 % — éligibilité conditionnée à un artisan RGE Qualibat 8721"
          />

          <LocalProviderShowcase
            providers={providers}
            serviceName="Installateur VMC RGE"
            cityName="France"
          />

          <FlagshipFaq items={faqs} />

          <section className="my-10">
            <h2 className="font-heading text-2xl font-bold text-sand-900 mb-4">
              Pour aller plus loin
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {relatedPages.map((p) => (
                <Link
                  key={p.href}
                  href={p.href}
                  className="block bg-white border border-sand-200 hover:border-primary-300 rounded-xl p-4 transition"
                >
                  <p className="font-semibold text-sand-900 m-0 mb-1 inline-flex items-center gap-1">
                    {p.label} <ArrowRight className="w-3.5 h-3.5 text-primary-700" aria-hidden />
                  </p>
                  <p className="text-sm text-sand-600 m-0">{p.description}</p>
                </Link>
              ))}
            </div>
          </section>

          <FlagshipSources sources={sources} />
          <FlagshipAuthorCard
            authorSlug={AUTHOR_SLUG}
            authorName={AUTHOR_NAME}
            datePublished={PUBLISHED}
            dateModified={MODIFIED}
          />
        </div>
      </div>
    </>
  )
}
