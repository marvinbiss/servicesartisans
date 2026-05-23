/**
 * Page : /renovation-energetique/travaux/vmc/hygroreglable/type-b
 *
 * @kw-primary    vmc hygroréglable type b
 * @kw-volume     1700
 * @kw-kd         0
 * @kw-cpc        1.20
 * @intent        commercial
 * @cluster       reno-energetique-vmc-hygro-type-b
 * @ahrefs-source bloc1
 * @snapshot      2026-05-06
 * @backlog-item  Sprint1-20-80-vmc-hygro-type-b
 *
 * KW cibles validés Ahrefs Bloc 1 v3 (2026-05-04, country=fr) :
 * - "vmc hygroréglable type b"   → 1 700 vol, KD 0 ⭐⭐⭐⭐⭐ PIVOT
 * - "vmc hygro b"                → 1 500 vol, KD 1 ⭐⭐⭐⭐
 * - "hygroréglable type b"       →   400 vol, KD 0 (variant)
 * - "vmc hygro type b prix"      →   200 vol, KD 0
 * - "type b vmc"                 →   150 vol, KD 0
 * - Famille cumulée pivot : ~4 000 vol/mois (KD 0-1)
 *
 * Easy win : OUI MEGA — KD 0 sur tout le cluster. Page-mine #16 quelleenergie.fr
 * (vmc-hygroreglable-de-type-b) : 1 721 traffic/mo, pos #1. Atout SA : neutralité
 * comparative + simulateur aides + RGE Qualibat 8721.
 *
 * Anti-cannibalisation :
 *   - Hub /vmc = panorama 4 types (intent info head)
 *   - /vmc/hygroreglable = panorama type A vs B (intent comparison)
 *   - Cette page = focus DEEP type B uniquement : entrées d'air hygro +
 *     bouches hygro, débits modulés totalement, marques, prix, économie spécifique.
 *   - /vmc/hygroreglable/type-a (à créer Sprint suivant) = focus deep type A.
 *
 * YMYL : aide financière (CEE 100-300 €) + santé (qualité air intérieur) +
 *        conformité réglementaire (arrêté 24/03/1982 + RT 2012/RE 2020).
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Award, Calculator, CheckCircle2, Coins, Droplets, Wind } from 'lucide-react'

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
import SimulateurAideBox from '@/components/conversion/SimulateurAideBox'
import LocalProviderShowcase from '@/components/seo/LocalProviderShowcase'
import { getProvidersByService } from '@/lib/supabase'
import PrixComparatif from '@/components/conversion/PrixComparatif'

export const revalidate = 86400

const PAGE_PATH = '/renovation-energetique/travaux/vmc/hygroreglable/type-b'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'marc-lefebvre'
const AUTHOR_NAME = 'Marc Lefebvre'

const TITLE = 'VMC hygroréglable type B 2026 : prix, marques, économie'
const DESCRIPTION =
  'VMC hygroréglable type B 2026 : entrées + bouches hygro, modulation 5-45 m³/h. Prix posé 1 200-2 800 €. Économie chauffage 8-12 %. CEE 100-300 €.'

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
  'VMC hygroréglable type B = entrées d’air hygroréglables + bouches d’extraction hygroréglables (modulation totale).',
  'Différence vs type A : type A = bouches hygro + entrées AUTORÉGLABLES (modulation partielle). Type B = tout est hygro.',
  'Prix posé 2026 : 1 200-2 800 € (vs 900-2 500 € pour type A). Surcoût ~200-400 €.',
  'Économie chauffage : 8-12 % (vs 5-8 % pour type A). Différence ~50-100 €/an.',
  'CEE Coup de pouce : 100-300 € (identique type A et B). MaPrimeRénov’ Bleu : 0 € (réservé double flux).',
  'Top marques type B 2026 : Aldes Hygro Premium B, Atlantic Hygrocosy B, Unelvent S&P Domeo B, Vortice Vort B-EVO.',
  'Choix #1 en rénovation classique pour optimiser économies sans passer en double flux (4 000 €+).',
]

const TYPE_A_VS_B = [
  {
    critere: 'Entrées d’air (menuiseries)',
    type_a: 'Autoréglables (débit fixe 22-30 m³/h)',
    type_b: 'Hygroréglables (5-45 m³/h selon humidité)',
  },
  {
    critere: 'Bouches d’extraction',
    type_a: 'Hygroréglables (10-45 m³/h)',
    type_b: 'Hygroréglables (10-45 m³/h)',
  },
  {
    critere: 'Modulation débits',
    type_a: 'Partielle (sortie seule)',
    type_b: 'Totale (entrée + sortie)',
  },
  {
    critere: 'Prix moyen posé 2026',
    type_a: '900-2 500 €',
    type_b: '1 200-2 800 €',
  },
  {
    critere: 'Économie chauffage annuelle',
    type_a: '5-8 % (~80-150 €/an)',
    type_b: '8-12 % (~150-250 €/an)',
  },
  {
    critere: 'Aides CEE Coup de pouce',
    type_a: '100-300 €',
    type_b: '100-300 €',
  },
  {
    critere: 'Conformité RT 2012',
    type_a: 'Oui',
    type_b: 'Oui (privilégié)',
  },
  {
    critere: 'Conformité RE 2020',
    type_a: 'Limité (logement neuf)',
    type_b: 'Oui',
  },
  {
    critere: 'Choix recommandé',
    type_a: 'Petit budget ou contexte simple',
    type_b: 'Logements bien isolés ou rénovation lourde',
  },
]

const FONCTIONNEMENT = [
  {
    etape: '1. Entrées d’air hygroréglables (menuiseries)',
    detail:
      'Installées dans les fenêtres ou coffres de volets, elles s’ouvrent ou ferment selon l’hygrométrie ambiante. Débit modulé 5-45 m³/h. Quand l’air est sec (chambres en hiver), elles se ferment partiellement → moins de pertes chaleur. Quand humide (cuisine, SDB), elles s’ouvrent → renouvellement actif.',
  },
  {
    etape: '2. Sondes hygrométriques (membrane polyamide)',
    detail:
      'Aussi bien sur les entrées que sur les bouches. Membrane sensible à l’humidité qui se contracte/dilate selon hygrométrie 30-80 %. Aucune électronique = fiabilité totale + 0 conso.',
  },
  {
    etape: '3. Bouches d’extraction hygroréglables (cuisine, SDB, WC)',
    detail:
      'Modulent le débit extrait selon présence + humidité. Bouches B classiques 10-45 m³/h, débits modulés en continu. Bouches WC à présence (40-60 m³/h boost si occupant détecté).',
  },
  {
    etape: '4. Caisson moteur centralisé',
    detail:
      'Ventilateur EC haute efficacité (15-30 W typique). Auto-ajuste sa vitesse selon la pression aéraulique du réseau. Souvent pilotable via app smartphone (Aldes Connect, Atlantic Cozytouch).',
  },
  {
    etape: '5. Rejet air vicié',
    detail:
      'Air extrait rejeté en toiture par sortie isolée (Ø 125-160 mm). Conduit à pente continue + chapeau anti-refoulement. Distance min 0,40 m d’une fenêtre voisine (DTU 68.3).',
  },
]

const MARQUES = [
  {
    marque: 'Aldes',
    modele: 'EasyHOME Hygro Premium MW B',
    prix: '1 600-2 400 € posé',
    detail:
      'Made in France. Caisson EC 8-30 W. Modulation totale 5-150 m³/h. Pilotage app Aldes Connect. Garantie 2 ans pose + 5 ans matériel.',
  },
  {
    marque: 'Atlantic',
    modele: 'Hygrocosy B Flex',
    prix: '1 400-2 200 € posé',
    detail:
      'Hygroréglable type B avec entrées d’air auto-modulantes. Caisson basse conso. Filtre F7 anti-pollens optionnel. Garantie 2 ans + 5 ans.',
  },
  {
    marque: 'Unelvent (S&P)',
    modele: 'Domeo Pico Hygro B',
    prix: '1 300-2 000 € posé',
    detail:
      'Bon rapport qualité/prix. Caisson plat ultra-compact (idéal faux plafond). Pilotage simple par interrupteur. Niveau sonore 30-35 dB(A). Garantie 2 ans.',
  },
  {
    marque: 'Vortice',
    modele: 'Vort B-EVO',
    prix: '1 200-1 800 € posé',
    detail:
      'Italien. Bon entry-level. Caisson EC, modulation 5-130 m³/h. Pas d’app smartphone. Garantie 2 ans pose + 3 ans matériel.',
  },
  {
    marque: 'Helios',
    modele: 'ELS-V 60/35 + entrées',
    prix: '1 800-2 500 € posé',
    detail:
      'Allemand premium. Modulation 5-200 m³/h selon hygrométrie. Pilotage app + KNX. Très silencieux 25-30 dB(A). Garantie 5 ans matériel.',
  },
]

const ROI = [
  {
    cas: 'Maison RT 2012 — 100 m² Lyon',
    investissement: '1 800 € (après CEE 200 €)',
    economie_annuelle: '180 €/an',
    roi: '10 ans',
  },
  {
    cas: 'Rénovation 1980 — 110 m² Bordeaux',
    investissement: '2 200 €',
    economie_annuelle: '220 €/an',
    roi: '10 ans',
  },
  {
    cas: 'Rénovation lourde RE 2020 — 130 m²',
    investissement: '2 600 €',
    economie_annuelle: '280 €/an',
    roi: '9 ans',
  },
]

const faqs = [
  {
    question: 'Quelle est la différence entre VMC hygroréglable type A et type B ?',
    answer:
      'La différence se situe au niveau des entrées d’air (menuiseries). Type A = bouches d’extraction hygroréglables (modulent le débit aspiré selon humidité dans cuisine/SDB/WC) MAIS entrées d’air autoréglables (débit fixe 22-30 m³/h). Type B = bouches ET entrées d’air hygroréglables (modulation totale 5-45 m³/h selon humidité). Conséquence : type B économise 3-4 points de plus sur le chauffage (8-12 % vs 5-8 % pour type A) car il limite plus finement les pertes par renouvellement d’air en saison froide. Surcoût type B : 200-400 €.',
  },
  {
    question: 'Quel est le prix d’une VMC hygroréglable type B en 2026 ?',
    answer:
      'En 2026 : 1 200-2 800 € posée selon marque, surface logement, complexité installation. Détail : caisson moteur 250-450 €, bouches hygro (3-5 unités) 100-200 €, entrées d’air hygro (5-10 unités) 100-200 €, gaines isolées + raccord toiture 200-400 €, pose 600-1 200 €. Aides 2026 : CEE Coup de pouce 100-300 € (selon obligé EDF/Engie/TotalEnergies/Sonergia/Hellio) + TVA 5,5 % rénovation. MaPrimeRénov’ : 0 € (réservé VMC double flux). Reste à charge final ~1 000-2 500 €.',
  },
  {
    question: 'Quelle économie chauffage avec une VMC hygroréglable type B ?',
    answer:
      'Économie typique : 8-12 % de la facture chauffage annuelle. En valeur absolue : 150-280 €/an pour une maison standard 100 m² chauffée au gaz/élec/PAC. Différentiel vs type A : 50-100 €/an supplémentaires (3-4 points). Mécanisme : la modulation totale (entrées + bouches) réduit les pertes par air renouvelé jusqu’à 40-50 % en saison froide quand l’hygrométrie intérieure est basse (5-15 m³/h vs 22-30 m³/h fixe en autoréglable). Économie maximale obtenue dans logements bien isolés (RT 2012, RE 2020 ou rénovation lourde post-2010).',
  },
  {
    question: 'Quelles sont les meilleures marques de VMC hygroréglable type B ?',
    answer:
      'Top 5 marché 2026 : (1) Aldes EasyHOME Hygro Premium MW B (made in France, app pilotage, 1 600-2 400 € posé, garantie 5 ans matériel) ; (2) Atlantic Hygrocosy B Flex (entrées d’air auto-modulantes, 1 400-2 200 €) ; (3) Unelvent S&P Domeo Pico Hygro B (caisson plat ultra-compact, 1 300-2 000 €, idéal faux plafond) ; (4) Vortice Vort B-EVO (italien, 1 200-1 800 €, bon entry-level) ; (5) Helios ELS-V 60/35 (allemand premium, modulation 5-200 m³/h, 1 800-2 500 €, garantie 5 ans). Critères : niveau sonore (< 30 dB(A) confort), garanties pose 2 ans + matériel 3-5 ans, pilotage app smartphone optionnel.',
  },
  {
    question: 'La VMC hygroréglable type B est-elle éligible à MaPrimeRénov’ ?',
    answer:
      'NON. MaPrimeRénov’ ne couvre PAS la VMC hygroréglable type A ni type B en 2026. Seule la VMC double flux (et double flux thermodynamique) est éligible MaPrimeRénov’ Bleu jusqu’à 2 500 €. La VMC hygroréglable B reste éligible aux CEE Coup de pouce 100-300 €, TVA 5,5 % et éco-PTZ. Si votre projet inclut une rénovation globale (isolation + chauffage + ventilation) avec MaPrimeRénov’ Parcours Accompagné, la VMC hygroréglable peut être incluse dans le bouquet sans aide spécifique.',
  },
  {
    question: 'VMC hygroréglable type B ou VMC double flux : que choisir ?',
    answer:
      'Dépend du budget et de l’isolation : (1) Budget serré ou logement peu isolé : VMC hygro B (1 200-2 800 € posé, économie 8-12 %, ROI 9-12 ans) — meilleur rapport qualité/prix. (2) Logement bien isolé (RT 2012, RE 2020 ou rénovation lourde) + budget ≥ 4 500 € : VMC double flux (4 000-6 500 € posé, récup chaleur 70-90 %, économie 15-25 %, MaPrimeRénov’ 2 500 €) — performance énergétique nettement supérieure. La règle : si MaPrimeRénov’ est accessible et logement bien isolé, double flux. Sinon, hygro B suffit largement.',
  },
  {
    question: 'L’entretien d’une VMC hygroréglable type B est-il compliqué ?',
    answer:
      'Simple. Recommandations : (1) Nettoyage bouches d’extraction tous les 6 mois (à l’eau savonneuse, démontables clip) ; (2) Aspiration entrées d’air hygro tous les 3 mois (poussières) ; (3) Nettoyage caisson moteur tous les 1-3 ans (grille pré-filtre + ventilateur) ; (4) Vérification débits par professionnel tous les 5 ans (50-100 € par chauffagiste). Aucun composant frigorifique ni F-Gas (contrairement à VMC double flux thermodynamique). Coût annuel : 30-80 € en moyenne (vs 150-250 € DF thermo). Durée de vie : 15-25 ans pour le caisson, 30+ ans pour les bouches et entrées.',
  },
]

const sources = [
  {
    label: 'Légifrance — Arrêté du 24 mars 1982 modifié (aération logements)',
    url: 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000852525',
  },
  {
    label: 'AFNOR — NF DTU 68.3 (mise en œuvre VMC simple/double flux)',
    url: 'https://www.afnor.org',
  },
  {
    label: 'ADEME — Guide ventilation des logements (PDF)',
    url: 'https://librairie.ademe.fr',
  },
  {
    label: 'France Rénov’ — Aides VMC (CEE Coup de pouce)',
    url: 'https://france-renov.gouv.fr/aides/cee',
  },
  {
    label: 'CSTB — Avis techniques entrées d’air hygroréglables',
    url: 'https://www.cstb.fr',
  },
]

const relatedPages = [
  {
    label: 'Hub VMC hygroréglable (type A vs B)',
    href: '/renovation-energetique/travaux/vmc/hygroreglable',
    description: 'Comparatif type A et type B + 14K vol KW pivot',
  },
  {
    label: 'Hub VMC : 4 types comparés',
    href: '/renovation-energetique/travaux/vmc',
    description: 'Autoréglable, hygroréglable, double flux + prix',
  },
  {
    label: 'VMC simple flux',
    href: '/renovation-energetique/travaux/vmc/simple-flux',
    description: 'Débit autoréglable ou hygroréglable',
  },
  {
    label: 'VMC double flux (récup chaleur)',
    href: '/renovation-energetique/travaux/vmc-double-flux',
    description: 'Échangeur 70-90 %, MaPrimeRénov’ 2 500 €',
  },
  {
    label: 'Installation VMC : étapes, prix, checklist',
    href: '/renovation-energetique/travaux/vmc/installation',
    description: 'Process pose 1-2 jours, devis RGE Qualibat 8721',
  },
  {
    label: 'CEE Coup de pouce VMC',
    href: '/renovation-energetique/aides/cee-certificats-economie-energie',
    description: 'Prime énergie 100-300 € selon obligé',
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
    section: 'Travaux — VMC — Hygroréglable type B',
    keywords: [
      'vmc hygroréglable type b',
      'vmc hygro b',
      'hygroréglable type b',
      'vmc hygro type b prix',
      'type b vmc',
      'aldes hygro premium b',
      'atlantic hygrocosy b',
      'cee vmc hygro',
      'modulation totale vmc',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique/travaux' },
    { name: 'VMC', url: '/renovation-energetique/travaux/vmc' },
    { name: 'Hygroréglable', url: '/renovation-energetique/travaux/vmc/hygroreglable' },
    { name: 'Type B', url: PAGE_PATH },
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
              { label: 'VMC', href: '/renovation-energetique/travaux/vmc' },
              { label: 'Hygroréglable', href: '/renovation-energetique/travaux/vmc/hygroreglable' },
              { label: 'Type B' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Droplets className="w-3.5 h-3.5" aria-hidden />
              Modulation totale entrées + bouches
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              VMC hygroréglable type B 2026 : prix, marques, économie
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              La <strong>VMC hygroréglable type B</strong> module les débits sur les entrées d’air
              ET sur les bouches d’extraction selon l’hygrométrie. Modulation totale 5-45 m³/h. Prix
              posé <strong>1 200-2 800 €</strong>, économie chauffage <strong>8-12 %/an</strong>,
              CEE Coup de pouce 100-300 €. Voici la différence type A vs B, le fonctionnement, les
              marques top et le ROI.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2 id="type-a-vs-b">Type A vs type B : différence détaillée</h2>
            <p>
              <Wind className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
              La grande différence : le type B module aussi les <strong>entrées d’air</strong>
              (menuiseries), pas seulement les bouches d’extraction. Résultat : modulation totale du
              renouvellement d’air, économies chauffage supérieures, mais surcoût ~200-400 €.
            </p>
            <div className="not-prose overflow-x-auto my-6">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-sand-100">
                  <tr>
                    <th className="text-left p-3 border border-sand-200 font-semibold">Critère</th>
                    <th className="text-left p-3 border border-sand-200 font-semibold">Type A</th>
                    <th className="text-left p-3 border border-sand-200 font-semibold">Type B</th>
                  </tr>
                </thead>
                <tbody>
                  {TYPE_A_VS_B.map((c) => (
                    <tr key={c.critere}>
                      <td className="p-3 border border-sand-200 font-medium">{c.critere}</td>
                      <td className="p-3 border border-sand-200">{c.type_a}</td>
                      <td className="p-3 border border-sand-200 font-semibold text-primary-800">
                        {c.type_b}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 id="fonctionnement">Fonctionnement détaillé d’une VMC hygroréglable type B</h2>
            <ol className="not-prose list-none space-y-3 my-6">
              {FONCTIONNEMENT.map((f) => (
                <li key={f.etape} className="bg-white border border-sand-200 rounded-xl p-4">
                  <p className="font-semibold text-sand-900 m-0 mb-1">{f.etape}</p>
                  <p className="text-sand-700 m-0 text-sm leading-relaxed">{f.detail}</p>
                </li>
              ))}
            </ol>

            <h2 id="marques">Top 5 marques VMC hygroréglable type B 2026</h2>
            <div className="not-prose grid gap-4 my-6">
              {MARQUES.map((m) => (
                <div key={m.marque} className="bg-white border border-sand-200 rounded-xl p-5">
                  <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
                    <p className="font-bold text-sand-900 m-0">
                      <Award className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                      {m.marque} — <span className="text-primary-800">{m.modele}</span>
                    </p>
                    <span className="text-sm font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded">
                      {m.prix}
                    </span>
                  </div>
                  <p className="text-sand-700 m-0 text-sm leading-relaxed">{m.detail}</p>
                </div>
              ))}
            </div>

            <h2 id="roi">ROI selon profil — 3 cas types</h2>
            <div className="not-prose space-y-4 my-6">
              {ROI.map((c) => (
                <div key={c.cas} className="bg-white border border-sand-200 rounded-xl p-5">
                  <p className="font-semibold text-sand-900 m-0 mb-2">{c.cas}</p>
                  <ul className="text-sm text-sand-700 m-0 space-y-1 list-none p-0">
                    <li>
                      <Coins className="inline w-3.5 h-3.5 text-primary-700 mr-1" aria-hidden />
                      Investissement : <strong>{c.investissement}</strong>
                    </li>
                    <li>
                      <CheckCircle2
                        className="inline w-3.5 h-3.5 text-primary-700 mr-1"
                        aria-hidden
                      />
                      Économie annuelle : <strong>{c.economie_annuelle}</strong>
                    </li>
                    <li>
                      <Calculator
                        className="inline w-3.5 h-3.5 text-primary-700 mr-1"
                        aria-hidden
                      />
                      ROI : <strong>{c.roi}</strong>
                    </li>
                  </ul>
                </div>
              ))}
            </div>

            <h2 id="aides">Aides 2026 : CEE Coup de pouce + TVA 5,5 %</h2>
            <ul>
              <li>
                <strong>CEE Coup de pouce</strong> : 100-300 € selon obligé (EDF, Engie,
                TotalEnergies, Sonergia, Hellio) et profil de revenus.
              </li>
              <li>
                <strong>TVA 5,5 %</strong> sur la pose et le matériel (vs 20 % standard) si logement
                &gt; 2 ans.
              </li>
              <li>
                <strong>Éco-PTZ</strong> : prêt à taux 0 jusqu’à 50 000 € pour bouquet de travaux.
              </li>
              <li>
                <strong>MaPrimeRénov’ Bleu</strong> : <strong>0 €</strong> pour VMC hygro B (réservé
                VMC double flux 2 500 €).
              </li>
            </ul>
            <p>
              <strong>Ordre obligatoire</strong> : choisir l’obligé CEE AVANT signature du devis
              (sinon perte de la prime).
            </p>

            <h2 id="cta">Trouvez un artisan RGE Qualibat 8721</h2>
            <div className="not-prose bg-primary-50 border border-primary-200 rounded-xl p-6 my-6">
              <p className="text-sand-900 m-0 mb-3">
                <Calculator className="inline w-5 h-5 text-primary-700 mr-1" aria-hidden />
                <strong>Devis VMC hygroréglable type B en 30 secondes</strong> — comparez 2-3
                artisans RGE Qualibat 8721 pour bénéficier des CEE Coup de pouce.
              </p>
              <Link
                href="/devis"
                className="inline-flex items-center gap-2 bg-primary-700 hover:bg-primary-800 text-white font-semibold px-5 py-3 rounded-lg transition"
              >
                Demander mes devis VMC hygro B <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
            </div>
          </article>

          <PrixComparatif
            title="Top marques VMC hygroréglable type B 2026 (posé clé en main)"
            caption="Maison 100 m² en rénovation, RGE Qualibat 8721, TVA 5,5 % incluse. Sources : Aldes, Atlantic, Unelvent, retours terrain devis."
            rows={[
              {
                brand: 'Aldes',
                model: 'EasyHOME Hygro Premium MW',
                priceRange: '1 400 - 2 500 €',
                warranty: '2 ans pose + 5 ans matériel',
                rating: 4.5,
                notes: 'Made in France, basse conso EC, silencieux',
                highlight: true,
              },
              {
                brand: 'Atlantic',
                model: 'Optimocosy HR Hygro B',
                priceRange: '1 300 - 2 400 €',
                warranty: '2 ans pose + 5 ans matériel',
                rating: 4.4,
                notes: 'Filtre F7 pollens, auto-équilibrage',
              },
              {
                brand: 'Unelvent',
                model: 'Ozeo Hygro B Eco',
                priceRange: '1 100 - 2 200 €',
                warranty: '2 ans pose + 2 ans matériel',
                rating: 4.0,
                notes: 'Bon rapport qualité/prix',
              },
              {
                brand: 'VMC hygro B entrée gamme',
                priceRange: '1 100 - 1 600 €',
                warranty: '2 ans pose + 2 ans matériel',
                rating: 3.7,
                notes: 'Conformité minimale arrêté 24/03/1982',
              },
            ]}
            withSchema
          />

          <SimulateurAideBox
            serviceKey="vmc-hygroreglable-type-b"
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
