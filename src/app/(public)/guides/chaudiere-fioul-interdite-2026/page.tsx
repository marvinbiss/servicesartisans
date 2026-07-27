/**
 * /guides/chaudiere-fioul-interdite-2026 — Hub fioul (Pilier 2).
 *
 * @kw-primary    chaudière fioul
 * @kw-volume     1300
 * @kw-kd         1
 * @kw-cpc        45
 * @kw-secondary  chaudiere fioul (2300, KD 0), interdiction chaudière fioul
 * @cluster       3 (chauffage fioul → remplacement)
 * @intent        commercial + informational (anxiété réglementaire)
 * @ahrefs-source docs/audit-ahrefs-2026-05-03/keyword_opportunities_2026-05.csv:5-8
 * @snapshot      2026-05-13 (chantier #10 KW commerciaux)
 *
 * Hellio rang 5 sur ce KW = striking distance.
 * Vrai jackpot : KW transactionnel parce que décret 2022-8 force le remplacement.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { Flame, ArrowRight, AlertTriangle, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'chaudiere-fioul-interdite-2026'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Jean-Pierre Duval'

export const revalidate = 86400

// Title optimisé KW exact "chaudière fioul" (1 300 vol, KD 1, CPC 45 €) + variante
// "chaudiere fioul" (2 300 vol, KD 0). Hellio rang 5 = striking distance.
const TITLE = 'Chaudière fioul 2026 : interdiction, remplacement et aides'
const DESCRIPTION =
  'Chaudière fioul 2026 : interdite à l’installation depuis juillet 2022 (décret 2022-8). Remplacement PAC ou biomasse, aides cumulées 7 000-17 500 €.'

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
  'Décret 2022-8 du 5 janvier 2022 : interdit installation de chaudières fioul neuves depuis 1er juillet 2022.',
  'Chaudières fioul existantes : peuvent rester en fonctionnement + être réparées. Remplacement à l’identique INTERDIT.',
  'Remplacements autorisés : PAC air-eau, PAC géothermique, chaudière biomasse (granulés, bois), raccordement réseau chaleur.',
  'Aides majorées Coup de pouce CEE : PAC 2 500-5 000 €, chaudière granulés 3 500-6 500 €. MaPrimeRénov’ par geste 4 000-11 000 € pour la PAC (chaudière granulés : parcours accompagné uniquement depuis 2026).',
  'Coût total remplacement fioul → PAC 2026 : 15 000-22 000 € TTC, reste à charge 4 000-12 000 € après cumul aides.',
]

const faqs = [
  {
    question: 'Ma chaudière fioul est-elle encore autorisée en 2026 ?',
    answer:
      "Oui, sous conditions précises du décret 2022-8 du 5 janvier 2022. (1) Chaudière existante installée AVANT 1er juillet 2022 : fonctionnement autorisé sans limite de date (pas de Hummel obligatoire), réparations courantes autorisées (brûleur, pompe, thermostat) ; (2) Chaudière en panne irréparable : remplacement à l'identique INTERDIT depuis 1er juillet 2022. Seuls autorisés : PAC air-eau, PAC eau-eau, chaudière biomasse, raccordement réseau chaleur, hybride fioul-PAC (transition) ; (3) Construction neuve : chaudière fioul interdite. Il n'y a donc PAS de démontage forcé, mais chaque panne pousse vers une énergie plus propre. La loi Climat 2021 laisse choisir le moment de transition.",
  },
  {
    question: 'Quelle solution pour remplacer une chaudière fioul ?',
    answer:
      '4 alternatives recommandées selon contexte : (1) PAC air-eau : 12 000-18 000 € TTC posée, COP 3-4, aides 6 500-15 000 € → net 4 000-10 000 €. Solution n° 1 en France actuellement ; (2) PAC géothermique (eau-eau) : 18 000-30 000 € TTC, COP 4-5, aides 8 000-18 000 €, adaptée terrains isolés sans contrainte PLU ; (3) Chaudière biomasse granulés (pellets) : 15 000-22 000 € TTC, rendement 87-96 %, aides 6 000-12 000 €, pertinente si stock disponible (local 3-5 m²) ; (4) Raccordement réseau chaleur urbain (RCU) : 4 000-10 000 € TTC selon distance, abonnement forfait + consommation. Pour maison 120 m² mal isolée : PAC air-eau ou biomasse couplée à isolation (bouquet MPR). Audit énergétique recommandé avant décision.',
  },
  {
    question: 'Quelles aides pour remplacer une chaudière fioul ?',
    answer:
      "Les aides sont MAJORÉES pour remplacement fioul (ciblées sortie énergies fossiles) : (1) Coup de pouce CEE Chauffage renforcé : PAC air-eau 4 000 € revenus supérieurs, 5 000 € intermédiaires, 5 500 € modestes, 5 500 € très modestes ; (2) MaPrimeRénov' Parcours par Geste : PAC air-eau 4 000-11 000 € selon revenus (la chaudière granulés n'est plus éligible en geste depuis 2026 — Coup de pouce CEE ou parcours accompagné / rénovation d'ampleur) ; (3) TVA 5,5 % sur pose + matériel ; (4) Éco-PTZ jusqu'à 50 000 € sur 20 ans ; (5) Aides locales 500-2 000 € selon région. Cumul max revenus très modestes + Coup de pouce + MPR : 15 000 € d'aides pour 16 000 € de PAC = reste à charge 1 000 €. Déclaration d'énergie fossile supprimée obligatoire sur dossier MPR pour toucher majoration.",
  },
  {
    question: 'Puis-je garder mon stock de fioul après changement ?',
    answer:
      "Oui, pas de contrainte sur le stock résiduel. Procédure de transition : (1) Vider la cuve en consommant le fioul jusqu'au remplacement chaudière (ne pas commander de ravitaillement sauf nécessité d'hivernage court) ; (2) Démantèlement cuve fioul : obligatoire si neutralisation définitive, 500-1 500 € TTC pour cuve <1 500 L, 2 000-5 000 € >1 500 L. Coût cumulable avec aides Anah « Habiter mieux sérénité » ; (3) Stockage fioul résiduel dans la cuve au-delà 1 an : risques corrosion, développement bactéries, dégradation cuve. Prévoir pompage + évacuation par professionnel agréé (200-500 €). Vente du fioul résiduel possible auprès de voisins équipés fioul (circuit informel), ou évacuation en déchetterie agréée hydrocarbures.",
  },
  {
    question: 'L’interdiction s’applique-t-elle aux chaudières à gaz ?',
    answer:
      "Non, pas encore. Le décret 2022-8 vise UNIQUEMENT les chaudières fioul en 2026. Les chaudières gaz (naturel et propane) restent autorisées à l'installation neuve et au remplacement jusqu'à nouvelle disposition. MAIS : (1) MaPrimeRénov' ne finance PLUS les chaudières gaz neuves depuis le 1er janvier 2023 — arrêté 17 novembre 2022 ; (2) Plafond énergie primaire RE2020 limite fortement le gaz en neuf collectif (calcul Cep défavorable) ; (3) Étude gouvernementale en cours pour interdire aussi le gaz à horizon 2027-2028 selon ambition Stratégie Nationale Bas Carbone (SNBC). Recommandation : si votre chaudière gaz a >15 ans et besoin remplacement, privilégier PAC air-eau (même prix final après aides vs chaudière gaz neuve 3 500-7 500 € sans aides).",
  },
]

const sources = [
  {
    label: 'Décret 2022-8 du 5 janvier 2022 — Interdiction fioul',
    url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000044930675',
  },
  { label: 'ADEME — Sortie fioul', url: 'https://www.ademe.fr' },
  { label: 'France-Rénov’ — Remplacement fioul', url: 'https://france-renov.gouv.fr' },
  {
    label: 'maprimerenov.gouv.fr — Coup de pouce fioul',
    url: 'https://www.maprimerenov.gouv.fr',
  },
]

const relatedGuides = [
  { label: 'Chaudière gaz vs granulés', href: '/guides/chaudiere-gaz-vs-granules' },
  {
    label: 'Installation pompe à chaleur étapes',
    href: '/guides/installation-pompe-chaleur-etapes',
  },
  { label: 'Coup de pouce chauffage 2026', href: '/guides/coup-de-pouce-chauffage-2026' },
  {
    label: 'Prix installation chaudière gaz',
    href: '/guides/prix-installation-chaudiere-gaz',
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
    section: 'Réglementation',
    keywords: [
      'chaudière fioul interdite',
      'décret 2022-8',
      'remplacement chaudière fioul',
      'sortie fioul aides',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Chaudière fioul interdite', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Chaudière fioul interdite' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Flame className="w-3.5 h-3.5" aria-hidden />
              Réglementation · Guide vérifié
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Chaudière fioul 2026 : interdiction, remplacement et aides
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Depuis le 1er juillet 2022, installer une chaudière fioul neuve est interdit en France
              (décret 2022-8). Voici ce qui change réellement, les alternatives recommandées et les
              aides majorées pour sortir du fioul à coût maîtrisé.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Remplacement fioul : coûts comparés 2026</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Solution</th>
                    <th className="p-3 border-b border-sand-200">Prix posé TTC</th>
                    <th className="p-3 border-b border-sand-200">Aides max</th>
                    <th className="p-3 border-b border-sand-200">Reste à charge</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['PAC air-eau', '12 000-18 000 €', '15 000 €', '4 000-10 000 €'],
                    ['PAC géothermique', '18 000-30 000 €', '18 000 €', '10 000-20 000 €'],
                    ['Chaudière granulés', '15 000-22 000 €', '12 000 €', '6 000-15 000 €'],
                    ['Réseau chaleur RCU', '4 000-10 000 €', '3 500 €', '1 000-7 000 €'],
                  ].map(([s, p, a, r]) => (
                    <tr key={s} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{s}</td>
                      <td className="p-3 font-semibold">{p}</td>
                      <td className="p-3">{a}</td>
                      <td className="p-3">{r}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>Pas de panique si chaudière en panne.</strong> Remplacement non urgent =
                prendre temps de comparer 3 devis + audit énergétique (1 000-1 800 € aidé).
                Chauffage d’appoint (pompe à chaleur mobile 500-1 200 €) pendant 2-4 semaines de
                décision.
              </p>
            </div>
          </article>
          <FlagshipFaq items={faqs} />
          <FlagshipSources sources={sources} />
          <section className="my-10">
            <h2 className="font-heading text-xl font-semibold text-sand-900 mb-4">À lire aussi</h2>
            <ul className="grid gap-3 md:grid-cols-2">
              {relatedGuides.map((g) => (
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
          <div className="flex items-center justify-between text-sm text-sand-600 border-t border-sand-200 pt-4">
            <Link href="/guides" className="inline-flex items-center gap-1 hover:text-primary-700">
              ← Tous les guides
            </Link>
            <Link
              href="/services/chauffagiste"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Trouver un chauffagiste <Phone className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
