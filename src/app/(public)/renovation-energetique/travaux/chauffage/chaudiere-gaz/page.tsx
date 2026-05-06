/**
 * Page : /renovation-energetique/travaux/chauffage/chaudiere-gaz
 *
 * @kw-primary    chaudiere gaz
 * @kw-volume     12000
 * @kw-kd         1
 * @kw-cpc        1.20
 * @intent        informational + commercial
 * @cluster       chaudiere
 * @ahrefs-source docs/ahrefs-bloc1-keywords-gap-2026-05-04.md (rang #6)
 * @snapshot      2026-05-04 (Ahrefs Bloc 1 v3 — cluster chaudière gaz)
 * @backlog-item  Levier-K-chaudiere-gaz-head
 *
 * KW cibles (validés Ahrefs gap CSV 2026-04, country=fr) :
 * - "chaudiere gaz"                    12 000 vol, KD 1 ⭐⭐⭐ pivot (rang #6 top 200)
 * - "chaudière gaz"                     3 400 vol, KD 1 (variant accent)
 * - "chaudiere gaz condensation"        1 900 vol, KD 0 (rang #44)
 * - "prix chaudiere gaz"                1 200 vol, KD 1 (rang #58)
 * - "installation chaudiere gaz"          700 vol, KD 0 (rang #81)
 * - "chaudière à gaz prix"                900 vol, KD 0
 * - Famille cumulée pivot : ~20 100 vol/mois (KW pivot KD 0-1 = easy win majeur)
 *
 * Easy win : OUI MAJEUR (KD 1 pivot, 12K vol, leader actuel quelleenergie #2 page commodité)
 *            Concurrence : effy, quelleenergie, EDF, Engie. Tous poussent achat sans
 *            transparence sur l'interdiction RE2020 et la disparition MPR depuis 2024.
 *            Atout SA : panorama honnête (les 4 types de chaudière gaz, statut 2026,
 *            quand garder vs remplacer, vrais prix posés par puissance, alternatives PAC).
 * Cluster pillar : Rénovation Énergétique → Travaux → Chauffage → Chaudière gaz
 *
 * Anti-cannibalisation :
 *   - /chauffage                                        = hub chauffage (4 familles)
 *   - /chauffage/chaudiere-condensation                 = sub-tech haute performance
 *   - /chauffage/chaudiere-condensation/entretien       = service récurrent annuel
 *   - /chauffage/chaudiere-bois                         = chaudière biomasse (autre énergie)
 *   - /guides/chaudiere-gaz-vs-granules                 = comparatif binaire
 *   - /guides/chaudiere-fioul-interdite-2026            = remplacement fioul
 *   - Cette page = vue d'ensemble de TOUS les types de chaudière gaz (atmosphérique,
 *     basse temp, condensation, hybride) + statut réglementaire 2026 + arbitrage.
 *
 * YMYL high : décisions investissement 4-15K€, statut réglementaire (RE2020,
 * arrêté du 5 juillet 2022 fioul, débat gaz), aides MPR (supprimée chaudière
 * condensation gaz seule depuis 2024). Cite : Légifrance, RE2020, France Rénov',
 * Service-Public.fr, ADEME, Code énergie L100-4 (objectif neutralité 2050).
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  AlertTriangle,
  Calculator,
  CheckCircle2,
  Coins,
  Flame,
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

const PAGE_PATH = '/renovation-energetique/travaux/chauffage/chaudiere-gaz'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'jean-pierre-duval'
const AUTHOR_NAME = 'Jean-Pierre Duval'

const TITLE = 'Chaudière gaz 2026 : prix, types & alternatives'
const DESCRIPTION =
  'Chaudière gaz 2026 : 4 technologies (atmosphérique, basse temp, condensation, hybride), prix posés 3 500-9 500 €, statut RE2020 (interdite neuf), aides limitées, alternatives PAC.'

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
  '4 technologies de chaudière gaz : atmosphérique (obsolète), basse temp, condensation (haute perf), hybride PAC.',
  "Interdite à l'installation dans le neuf depuis le 1er janvier 2025 (RE2020). Autorisée en remplacement.",
  'Prix posés 2026 : 3 500 € (atmosphérique remplacement) à 9 500 € (condensation sol + ECS).',
  "MaPrimeRénov' supprimée pour la chaudière gaz seule depuis 2024 (sauf hybride PAC + condensation).",
  'CEE limité 300-700 € selon dossier. TVA 5,5 % avec installateur RGE/QualiGaz.',
  'Alternative recommandée : PAC air-eau (aides MPR + CEE massives, factures divisées par 2).',
  'Entretien annuel obligatoire (Décret 2009-649) — 100-180 € HT/an.',
]

const TYPES_CHAUDIERE = [
  {
    type: 'Chaudière atmosphérique (basse perf)',
    rendement: '70-80 %',
    prix: '3 500-5 000 € posée',
    statut: '⚠️ Obsolète — à remplacer',
    detail:
      'Combustion en air ambiant, évacuation par tirage naturel. Très peu de chaudières neuves vendues (<5 % du marché 2026). Si la vôtre date de plus de 15 ans, son rendement réel est probablement < 75 %, soit 25-30 % de surconsommation par rapport à une condensation moderne.',
  },
  {
    type: 'Chaudière basse température (BT)',
    rendement: '88-92 %',
    prix: '4 000-5 500 € posée',
    statut: '🟡 Transition — milieu de gamme',
    detail:
      "Chaudière à circuit étanche (combustion sur air extérieur via ventouse). Rendement supérieur à l'atmosphérique mais inférieur à la condensation. Compromis prix-perf si remplacement urgent et budget contraint.",
  },
  {
    type: 'Chaudière à condensation',
    rendement: '105-110 % PCI (η_s 92-94 %)',
    prix: '4 500-7 500 € posée',
    statut: '✅ Standard 2026 (mais MPR supprimée)',
    detail:
      "Récupère la chaleur de condensation des fumées. Rendement nominal > 100 % sur PCI. Standard du marché depuis 2018. NON éligible MaPrimeRénov' depuis 2024 sauf hybride.",
  },
  {
    type: 'Chaudière hybride (PAC + condensation)',
    rendement: 'COP PAC 3,5-4 + condensation appoint',
    prix: '14 000-22 000 € posée',
    statut: '✅ Top — éligible MPR comme PAC',
    detail:
      "Pompe à chaleur air-eau (chauffage principal) + chaudière gaz condensation (appoint grand froid). Idéal maisons mal isolées. Éligible MaPrimeRénov' (forfait identique PAC seule) + CEE Coup de pouce.",
  },
]

const PRIX_PAR_PUISSANCE = [
  {
    puissance: '12-15 kW (T2/T3, 60-80 m²)',
    atmospherique: '3 500-4 500 €',
    condensation: '4 500-5 500 €',
    detail: 'Murale gaz, ECS instantanée ou micro-accumulation',
  },
  {
    puissance: '18-25 kW (maison 100 m²)',
    atmospherique: '4 200-5 500 €',
    condensation: '5 500-7 500 €',
    detail: 'Murale ou sol selon ECS (ballon ou instantané)',
  },
  {
    puissance: '25-35 kW (grande maison ou ECS importante)',
    atmospherique: '5 200-7 000 €',
    condensation: '6 500-9 500 €',
    detail: 'Sol avec ballon ECS 100-150 L intégré, raccordement complexe',
  },
]

const STATUT_REGLEMENTAIRE = [
  {
    cas: 'Logement neuf (permis de construire ≥ 1er janvier 2022)',
    statut: '❌ Interdite',
    detail:
      'La RE2020 (Décret n° 2021-1004) impose un seuil carbone qui exclut de fait les chaudières gaz du neuf depuis le 1er janvier 2022 (maison individuelle) et 1er juillet 2022 (logement collectif). Solutions : PAC, biomasse, raccordement réseau de chaleur urbain.',
  },
  {
    cas: "Remplacement d'une chaudière gaz existante",
    statut: '✅ Autorisé',
    detail:
      "Aucune interdiction de remplacer une chaudière gaz par une autre chaudière gaz. La législation française n'impose pas de date butoir pour la disparition du gaz naturel résidentiel (objectif neutralité 2050 du Code énergie L100-4 — pas d'interdiction directe).",
  },
  {
    cas: "Remplacement d'une chaudière fioul",
    statut: '🟡 Autorisé mais déconseillé',
    detail:
      "Depuis l'arrêté du 5 juillet 2022, les chaudières fioul neuves sont interdites. Vous pouvez les remplacer par une chaudière gaz si raccordement disponible, MAIS la PAC est très majoritairement plus rentable : aides MPR Bleu jusqu'à 5 000 € + CEE Coup de pouce jusqu'à 4 000 €, économies 50-70 % sur facture.",
  },
  {
    cas: 'Logement social, copropriété en chauffage collectif',
    statut: '🟡 Cas particulier',
    detail:
      'Les chaufferies collectives gaz restent autorisées en remplacement. La transition vers PAC collective ou raccordement réseau de chaleur est encouragée par MPR Copropriétés et CEE BAR-TH-145 (chaufferie biomasse) / BAR-TH-160 (raccordement réseau).',
  },
]

const QUAND_REMPLACER = [
  {
    cas: 'Votre chaudière gaz a moins de 12 ans et fonctionne bien',
    reco: '✅ Garder en attente',
    detail:
      "Pas urgent. Continuez l'entretien annuel obligatoire (100-180 € HT). Anticipez le remplacement à partir de 15-18 ans pour éviter une panne en plein hiver.",
  },
  {
    cas: 'Votre chaudière gaz a 15-20 ans avec pannes répétées',
    reco: '🟡 Remplacer — comparer condensation et PAC',
    detail:
      "Faites établir 2-3 devis : (1) chaudière condensation (4 500-7 500 € sans MPR), (2) PAC air-eau (12 000-15 000 € avec aides MPR + CEE jusqu'à 8 000 €). PAC souvent gagnante grand-total.",
  },
  {
    cas: 'Votre chaudière fioul est en fin de vie',
    reco: '✅ PAC air-eau prioritaire',
    detail:
      'Aides massives (MPR Bleu 5 000 € + CEE 4 000 € Coup de pouce + bonus sortie passoire si DPE F/G). Économies factures 50-70 %. ROI 5-7 ans. Voir notre guide dédié.',
  },
  {
    cas: 'Vous construisez en neuf',
    reco: '❌ Chaudière gaz impossible',
    detail:
      'RE2020 interdit le gaz dans le neuf depuis le 1er janvier 2022 (maison individuelle). Solutions : PAC air-eau, plancher chauffant + PAC géothermique, biomasse pellets, raccordement réseau de chaleur urbain.',
  },
]

const faqs = [
  {
    question: 'Combien coûte une chaudière gaz en 2026 ?',
    answer:
      'Prix posé clé en main 2026 selon le type : 3 500-5 000 € pour une chaudière atmosphérique 15 kW (très peu vendue, obsolète) ; 4 000-5 500 € pour une basse température BT ; 4 500-7 500 € pour une condensation 18-25 kW (standard du marché) ; 6 500-9 500 € pour une condensation au sol 25-35 kW avec ballon ECS intégré ; 14 000-22 000 € pour une hybride PAC + condensation. Le matériel représente 50-60 % du devis (1 500-3 500 € pour une bonne marque type Viessmann, De Dietrich, Saunier Duval, Vaillant), la pose et le raccordement 40-50 %.',
  },
  {
    question: 'Peut-on encore installer une chaudière gaz en 2026 ?',
    answer:
      "Oui, en remplacement d'une chaudière existante (gaz, fioul ou autre) dans un logement existant — il n'y a aucune interdiction directe en 2026. En revanche, dans le neuf (permis ≥ 1er janvier 2022), la RE2020 (Décret n° 2021-1004) exclut de fait les chaudières gaz par son seuil carbone. Pour les logements existants, l'objectif national de neutralité carbone 2050 (Code énergie L100-4) n'a pas encore donné lieu à interdiction du gaz résidentiel : les chaudières gaz peuvent être installées et remplacées librement.",
  },
  {
    question: 'Quelle différence entre chaudière gaz, condensation et basse température ?',
    answer:
      "<strong>Atmosphérique</strong> = combustion en air ambiant, rendement 70-80 %, obsolète. <strong>Basse température (BT)</strong> = combustion étanche sur air extérieur, rendement 88-92 %, milieu de gamme. <strong>Condensation</strong> = récupération de la chaleur des fumées condensées, rendement 105-110 % PCI (η_s 92-94 % réel), standard du marché depuis 2018. <strong>Hybride</strong> = pompe à chaleur (chauffage principal) + chaudière gaz condensation (appoint grand froid), idéal pour maisons mal isolées et seul cas où MaPrimeRénov' reste éligible.",
  },
  {
    question: "Pourquoi MaPrimeRénov' a supprimé l'aide chaudière gaz ?",
    answer:
      "Depuis 2024, MaPrimeRénov' ne finance plus la chaudière à condensation gaz seule (sauf cas hybride PAC + condensation). Trois raisons : (1) le gaz reste fossile et émet 2,5-4 t CO2eq/an pour 100 m² ; (2) la PAC est techniquement mature et plus compétitive aujourd'hui ; (3) la stratégie nationale concentre les aides massives sur les énergies renouvelables (PAC, biomasse, solaire) pour respecter l'objectif neutralité 2050 (Code énergie L100-4). Le CEE Coup de pouce reste limité (300-700 € selon le dossier) et l'éco-PTZ accessible uniquement si la chaudière est combinée avec d'autres travaux.",
  },
  {
    question: 'Quel rendement attendre et quelle économie versus une vieille chaudière ?',
    answer:
      "Une chaudière gaz neuve à condensation a un rendement saisonnier η_s de 92-94 % (rendement nominal sur PCI 105-110 %). Une vieille chaudière atmosphérique de 20 ans a un rendement réel de 65-75 %. L'économie sur la facture gaz est donc de 20-30 %, soit 200-500 €/an pour une maison 100 m² selon la zone climatique et l'isolation. Le ROI d'un remplacement chaudière atmosphérique → condensation est de 8-15 ans uniquement sur la facture gaz (sans aide MPR).",
  },
  {
    question: 'Quel artisan installe une chaudière gaz ?',
    answer:
      'Plombier-chauffagiste qualifié <strong>QualiGaz Évolution</strong> (organisme habilité par les pouvoirs publics, équivalent du PG/PGN/PGP des installateurs gaz). Pour bénéficier des CEE et de la TVA réduite à 5,5 %, mention <strong>RGE</strong> complémentaire requise (souvent intégrée à QualiGaz). Vérifier : SIRET valide, attestation décennale, références chantiers, devis détaillé avec marque, modèle, rendement saisonnier η_s, mise en service et contrôle de combustion. Comparer 2-3 devis. Notre annuaire référence uniquement des chauffagistes vérifiés.',
  },
  {
    question: 'Faut-il remplacer ma chaudière gaz par une PAC ?',
    answer:
      "Oui dans la majorité des cas, sauf si : (1) votre chaudière gaz a moins de 12 ans et fonctionne bien, ou (2) votre logement est mal isolé et un système hybride PAC + condensation est techniquement justifié. Si votre chaudière a plus de 15 ans avec pannes répétées, comparer 2-3 devis : (1) condensation 4 500-7 500 € sans aide MPR, (2) PAC air-eau 12 000-15 000 € avec aides MPR + CEE Coup de pouce jusqu'à 8 000 €. Le coût net (après aides) de la PAC est souvent inférieur à la condensation, et les économies factures atteignent 50-70 %.",
  },
  {
    question: 'Quel entretien pour une chaudière gaz ?',
    answer:
      "Entretien annuel obligatoire (Décret n° 2009-649 modifié 2020-912) : 100-180 € HT en visite ponctuelle, 130-220 € HT/an en contrat basique, 250-400 € HT/an en contrat tout inclus (souvent surdimensionné). 12 points contrôlés dont mesure CO et CO2 fumées, étanchéité gaz, nettoyage brûleur, contrôle sécurités. Attestation à conserver 2 ans (exigée par l'assurance). Voir notre page dédiée pour le détail.",
  },
]

const sources = [
  {
    label: 'Légifrance — Décret n° 2021-1004 du 29 juillet 2021 (RE2020)',
    url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000043871318',
  },
  {
    label: 'Légifrance — Arrêté du 5 juillet 2022 (chaudières fioul)',
    url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000045993000',
  },
  {
    label: "Code de l'énergie — Article L100-4 (objectif neutralité 2050)",
    url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000041553759',
  },
  {
    label: "France Rénov' — Chaudière gaz",
    url: 'https://france-renov.gouv.fr/renovation/chauffage/chaudiere-condensation',
  },
  {
    label: 'ADEME — Chauffage gaz et alternatives',
    url: 'https://www.ademe.fr',
  },
  {
    label: 'Service-Public.fr — Entretien chaudière',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F31894',
  },
  {
    label: 'GRDF — Chaudière à condensation',
    url: 'https://www.grdf.fr',
  },
  {
    label: 'QualiGaz Évolution — Organisme certificateur gaz',
    url: 'https://www.qualigaz.com',
  },
]

const relatedPages = [
  {
    label: 'Remplacement chaudière gaz 2026 (planning + alternatives)',
    href: '/renovation-energetique/travaux/chauffage/chaudiere-gaz/remplacement',
    description: '7 signaux + 5 alternatives + prix net après aides',
  },
  {
    label: 'Disconnecteur chaudière (NF EN 1717)',
    href: '/renovation-energetique/travaux/chauffage/chaudiere-gaz/disconnecteur',
    description: 'Sécurité anti-pollution OBLIGATOIRE — 4 types + contrôle annuel',
  },
  {
    label: 'Chaudière à condensation 2026',
    href: '/renovation-energetique/travaux/chauffage/chaudiere-condensation',
    description: 'Tech haute perf, prix 4 500-7 500 €',
  },
  {
    label: 'Entretien chaudière gaz 2026',
    href: '/renovation-energetique/travaux/chauffage/chaudiere-condensation/entretien',
    description: '100-180 € HT, obligation Décret 2009-649',
  },
  {
    label: 'PAC air-eau 2026 — alternative recommandée',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/air-eau-prix',
    description: "Aides MPR + CEE jusqu'à 8 000 €",
  },
  {
    label: 'Chaudière fioul interdite 2026',
    href: '/guides/chaudiere-fioul-interdite-2026',
    description: "Comprendre l'arrêté du 5 juillet 2022",
  },
  {
    label: 'Hub Chauffage 2026',
    href: '/renovation-energetique/travaux/chauffage',
    description: '4 familles + comparatif prix',
  },
  {
    label: 'Hub aides rénovation',
    href: '/renovation-energetique/aides',
    description: 'MPR + CEE + éco-PTZ',
  },
  {
    label: 'Trouver un chauffagiste QualiGaz',
    href: '/services/chauffagiste',
    description: 'Annuaire RGE + QualiGaz vérifié',
  },
  {
    label: 'Simulateur aides 2026',
    href: '/simulateur-aides-renovation',
    description: 'Comparer chaudière vs PAC',
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
    section: 'Chauffage — Chaudière gaz',
    keywords: [
      'chaudiere gaz',
      'chaudière gaz',
      'chaudiere gaz condensation',
      'prix chaudiere gaz',
      'installation chaudiere gaz',
      'chaudiere gaz 2026',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique/travaux' },
    { name: 'Chauffage', url: '/renovation-energetique/travaux/chauffage' },
    { name: 'Chaudière gaz', url: PAGE_PATH },
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
              { label: 'Chauffage', href: '/renovation-energetique/travaux/chauffage' },
              { label: 'Chaudière gaz' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Flame className="w-3.5 h-3.5" aria-hidden />
              Énergie fossile — interdite en neuf depuis 2025 (RE2020)
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Chaudière gaz 2026 : prix, types et alternatives
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              La <strong>chaudière gaz</strong> reste le système de chauffage le plus répandu en
              France (12 millions de logements). En 2026, 4 technologies coexistent (atmosphérique,
              basse température, condensation, hybride) avec des prix posés{' '}
              <strong>3 500 à 9 500 €</strong>. Mais{' '}
              <strong>la RE2020 interdit le gaz dans le neuf</strong> depuis 2022 et{' '}
              <strong>MaPrimeRénov&apos; ne la finance plus</strong> seule depuis 2024 (sauf
              hybride). Voici les vrais prix par type, le statut réglementaire et quand basculer
              vers une PAC.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2 id="types">Les 4 types de chaudière gaz</h2>
            <div className="not-prose grid gap-3 my-6">
              {TYPES_CHAUDIERE.map((t) => (
                <div key={t.type} className="bg-white border border-sand-200 rounded-xl p-5">
                  <div className="flex items-baseline justify-between gap-2 flex-wrap mb-2">
                    <h3 className="font-heading text-base font-semibold text-sand-900 m-0">
                      {t.type}
                    </h3>
                    <span className="text-xs font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded whitespace-nowrap">
                      {t.statut}
                    </span>
                  </div>
                  <div className="flex gap-4 flex-wrap text-xs text-sand-600 mb-2">
                    <span>
                      <strong>Rendement :</strong> {t.rendement}
                    </span>
                    <span>
                      <strong>Prix :</strong> {t.prix}
                    </span>
                  </div>
                  <p className="text-sm text-sand-700 m-0">{t.detail}</p>
                </div>
              ))}
            </div>

            <h2 id="prix">Prix chaudière gaz 2026 par puissance</h2>
            <div className="not-prose overflow-x-auto my-6">
              <table className="min-w-full bg-white border border-sand-200 rounded-xl text-sm">
                <thead className="bg-sand-100 text-sand-900">
                  <tr>
                    <th className="text-left px-4 py-2 font-semibold">Puissance</th>
                    <th className="text-left px-4 py-2 font-semibold">Atmosphérique / BT</th>
                    <th className="text-left px-4 py-2 font-semibold">Condensation</th>
                  </tr>
                </thead>
                <tbody>
                  {PRIX_PAR_PUISSANCE.map((p) => (
                    <tr key={p.puissance} className="border-t border-sand-100">
                      <td className="px-4 py-2 align-top">
                        <strong>{p.puissance}</strong>
                        <p className="text-xs text-sand-600 m-0 mt-0.5">{p.detail}</p>
                      </td>
                      <td className="px-4 py-2 align-top text-sand-700">{p.atmospherique}</td>
                      <td className="px-4 py-2 align-top text-primary-700 font-semibold">
                        {p.condensation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-sm text-sand-600 italic">
              Prix moyens 2026 toutes marques confondues, posé clé en main, hors aides. TVA 5,5 %
              applicable avec installateur RGE/QualiGaz pour la condensation. Variations
              géographiques +10-20 % en Île-de-France et grandes métropoles.
            </p>

            <h2 id="reglementation">Statut réglementaire 2026</h2>
            <div className="not-prose grid gap-3 my-6">
              {STATUT_REGLEMENTAIRE.map((s) => (
                <div key={s.cas} className="bg-white border border-sand-200 rounded-xl p-5">
                  <div className="flex items-baseline justify-between gap-2 flex-wrap mb-2">
                    <h3 className="font-heading text-base font-semibold text-sand-900 m-0">
                      {s.cas}
                    </h3>
                    <span className="text-xs font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded whitespace-nowrap">
                      {s.statut}
                    </span>
                  </div>
                  <p className="text-sm text-sand-700 m-0">{s.detail}</p>
                </div>
              ))}
            </div>

            <div className="not-prose flex items-start gap-3 border border-amber-200 bg-amber-50 rounded-lg p-4 my-6">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <div className="text-sm text-amber-900">
                <p className="font-semibold m-0 mb-1">
                  Méfiance sur les rumeurs d&apos;interdiction
                </p>
                <p className="m-0">
                  Aucune date butoir n&apos;a été votée pour interdire le gaz résidentiel dans
                  l&apos;existant. L&apos;objectif neutralité 2050 (Code énergie L100-4) ne se
                  traduit pas par une interdiction directe du gaz. Méfiez-vous des artisans qui
                  vendent une chaudière en argumentant sur une « interdiction proche ».
                </p>
              </div>
            </div>

            <h2 id="quand-remplacer">Quand remplacer votre chaudière gaz ?</h2>
            <div className="not-prose grid gap-3 my-6">
              {QUAND_REMPLACER.map((q) => (
                <div key={q.cas} className="bg-white border border-sand-200 rounded-xl p-5">
                  <div className="flex items-baseline justify-between gap-2 flex-wrap mb-2">
                    <h3 className="font-heading text-base font-semibold text-sand-900 m-0">
                      {q.cas}
                    </h3>
                    <span className="text-xs font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded whitespace-nowrap">
                      {q.reco}
                    </span>
                  </div>
                  <p className="text-sm text-sand-700 m-0">{q.detail}</p>
                </div>
              ))}
            </div>

            <h2 id="aides">Aides 2026 pour chaudière gaz</h2>
            <ul>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>MaPrimeRénov&apos;</strong> :{' '}
                <strong className="text-amber-700">supprimée depuis 2024</strong> pour la chaudière
                gaz seule. <em>Exception</em> : la chaudière hybride (PAC + condensation) reste
                éligible (forfait identique à la PAC seule).
              </li>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>CEE Coup de pouce chauffage</strong> : limité 300-700 € selon le dossier (vs
                4 000 € pour la PAC).
              </li>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Éco-PTZ</strong> : accessible uniquement si la chaudière condensation est
                combinée avec d&apos;autres travaux d&apos;économie d&apos;énergie (isolation
                combles, isolation murs, fenêtres, ventilation, autre équipement EnR).
              </li>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>TVA 5,5 %</strong> : oui pour la condensation, sous condition
                d&apos;installateur certifié RGE et logement &gt; 2 ans.
              </li>
            </ul>

            <div className="not-prose flex items-start gap-3 border border-primary-200 bg-primary-50 rounded-lg p-5 my-8">
              <Calculator className="w-5 h-5 text-primary-700 shrink-0 mt-0.5" aria-hidden />
              <div className="flex-1">
                <p className="font-semibold text-primary-900 m-0 mb-1">
                  Estimer chaudière gaz vs PAC en 2 minutes
                </p>
                <p className="text-sm text-primary-900 m-0 mb-3">
                  Notre simulateur compare votre situation (revenus, surface, énergie actuelle) pour
                  estimer le coût net après aides — chaudière gaz vs PAC air-eau. Résultat argumenté
                  avec montants MPR + CEE 2026 actualisés.
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
                <strong>Installateur QualiGaz Évolution</strong> obligatoire (sécurité gaz) +
                mention <strong>RGE</strong> recommandée pour CEE et TVA 5,5 %.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Conduit étanche</strong> en PEHD ou inox pour la condensation (résistant à
                la condensation acide pH 4-5). Tubage du conduit existant 300-800 € OU ventouse
                horizontale 150-400 €.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Évacuation des condensats</strong> vers le réseau eaux usées avec siphon.
              </li>
              <li>
                <ShieldCheck className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Entretien annuel</strong> obligatoire (Décret 2009-649). 100-180 € HT/an.
                Attestation à conserver 2 ans.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Marques fiables</strong> : Viessmann, De Dietrich, Saunier Duval, Vaillant,
                Frisquet, Atlantic, ELM Leblanc, Bosch.
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
              href="/renovation-energetique/travaux/chauffage"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Hub Chauffage
            </Link>
            <Link
              href="/services/chauffagiste"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Chauffagistes <Coins className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
