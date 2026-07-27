import type { Metadata } from 'next'
import Link from 'next/link'
import { Euro, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'plafond-maprimerenov-revenus-2026'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Claire Dubois'

export const revalidate = 86400

const TITLE = 'Plafonds MaPrimeRénov’ 2026 : revenus'
const DESCRIPTION =
  'Plafonds de revenus MaPrimeRénov’ 2026 : barème officiel Bleu / Jaune / Violet / Rose, par nombre de personnes et zone Île-de-France ou hors Île-de-France.'

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
    authors: [`${SITE_URL}/equipe/claire-dubois`],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const tldr = [
  '4 catégories officielles MaPrimeRénov’ 2026 : Bleu (très modestes), Jaune (modestes), Violet (intermédiaires), Rose (supérieurs).',
  'Plafonds calculés sur le Revenu Fiscal de Référence (RFR) de l’avant-dernière année — RFR 2024 pour une demande 2026.',
  'Deux grilles distinctes : Île-de-France (Paris + petite couronne) et reste de la France (plafonds plus bas).',
  'La catégorie détermine le taux d’aide par geste : +80 % pour Bleu, descend à +20-30 % pour Rose.',
  'Depuis 2025 : le profil Rose reste éligible uniquement pour le parcours accompagné (rénovation d’ampleur).',
]

const faqs = [
  {
    question: 'Quel est le barème de revenus MaPrimeRénov’ en 2026 ?',
    answer:
      'Le barème 2026 reste articulé en 4 profils : Bleu (très modestes), Jaune (modestes), Violet (intermédiaires), Rose (aisés). Les plafonds de Revenu Fiscal de Référence (RFR) diffèrent selon deux zones : Île-de-France (plafonds majorés) et hors Île-de-France. Pour une personne seule hors IDF : Bleu ≤22 461 €, Jaune ≤27 343 €, Violet ≤41 852 €, Rose ≥41 852 €. Chaque personne supplémentaire dans le foyer relève les seuils.',
  },
  {
    question: 'Sur quelle année se base le calcul ?',
    answer:
      "Le RFR pris en compte est celui de l'avant-dernière année fiscale. Pour une demande en 2026, l'Anah utilise le RFR 2024 (déclaration impôts de printemps 2025). Si vos revenus ont baissé depuis, vous pouvez demander une prise en compte du RFR N-1 (2025) mais sur présentation de justificatifs (licenciement, baisse d'activité, chômage partiel). Le traitement manuel ajoute 15-30 jours à l'instruction.",
  },
  {
    question: 'Quelle différence entre Île-de-France et reste de la France ?',
    answer:
      'Les plafonds franciliens sont plus élevés de 25-30 % car le coût de la vie à Paris et en petite couronne est supérieur. Pour une personne seule : plafond Bleu IDF = 27 343 € vs hors IDF = 22 461 €. La zone retenue est celle du logement rénové, pas celle du domicile fiscal du demandeur. Propriétaire bailleur habitant en province mais louant un appartement à Paris = barème IDF.',
  },
  {
    question: 'Comment sont définis les ménages Bleu / Jaune / Violet / Rose ?',
    answer:
      "Les couleurs reprennent l'ancien code de l'Anah. Bleu = revenus très modestes (aide maximale 90 %) ; Jaune = modestes (60-75 %) ; Violet = intermédiaires (40-50 %) ; Rose = supérieurs (20-30 %). Depuis 2025, le profil Rose reste éligible mais seulement via le parcours accompagné (travaux ambitieux avec gain ≥2 classes DPE) ; les gestes simples Rose ont été supprimés pour recentrer l'aide sur les ménages qui en ont besoin et les rénovations performantes.",
  },
  {
    question: 'Comment compter les personnes du foyer ?',
    answer:
      "Le nombre de personnes correspond au nombre de parts fiscales déclarées au dernier avis d'imposition : le demandeur, son conjoint, les enfants rattachés, les personnes à charge. Un enfant en garde alternée compte 0,5 part pour chaque parent. En cas de séparation récente, la situation fiscale du demandeur s'applique (pas celle du conjoint). Chaque personne supplémentaire ajoute environ 5 500-6 500 € au plafond selon la zone.",
  },
  {
    question: 'Que faire si on dépasse légèrement le plafond ?',
    answer:
      "Si votre RFR dépasse le plafond de quelques centaines d'euros, vous basculez automatiquement dans la catégorie supérieure — il n'existe pas de zone de tolérance. Solution 1 : reporter la demande d'une année si vos revenus 2025 baissent. Solution 2 : demander une mise à jour du RFR via justificatifs. Solution 3 : basculer vers le parcours accompagné rénovation d'ampleur qui conserve 35 % d'aide même pour le profil Rose. Solution 4 : cumuler avec éco-PTZ (sans condition de revenus) pour le solde.",
  },
]

const sources = [
  {
    label: 'France Rénov’ — Montants MaPrimeRénov’ 2026',
    url: 'https://france-renov.gouv.fr/aides/maprimerenov',
  },
  { label: 'Anah — Barèmes MaPrimeRénov’', url: 'https://www.anah.gouv.fr' },
  { label: 'Décret n° 2024-1051 du 19 novembre 2024', url: 'https://www.legifrance.gouv.fr' },
  {
    label: 'Service-public.fr — MaPrimeRénov’',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F35394',
  },
]

const relatedGuides = [
  { label: 'Aides rénovation énergétique 2026', href: '/guides/aides-renovation-2026' },
  { label: 'MaPrimeRénov’ 2026 — critères RGE', href: '/guides/maprimerenov-2026-criteres-rge' },
  { label: 'Éco-PTZ 2026', href: '/guides/eco-pret-taux-zero-2026' },
  {
    label: 'Aide isolation maison propriétaire',
    href: '/guides/aide-isolation-maison-proprietaire',
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
    section: 'Aides & Financement',
    keywords: [
      'plafond MaPrimeRénov 2026',
      'revenus MaPrimeRénov',
      'barème Bleu Jaune Violet Rose',
      'RFR 2024',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Plafonds MaPrimeRénov’ 2026', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Plafonds MaPrimeRénov’ 2026' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Euro className="w-3.5 h-3.5" aria-hidden />
              Aides &amp; Financement · Guide vérifié
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Plafonds MaPrimeRénov’ 2026 : barème de revenus officiel
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Les plafonds MaPrimeRénov’ définissent la catégorie de votre foyer — Bleu, Jaune,
              Violet ou Rose — et donc le taux d’aide. Voici les montants officiels 2026 par nombre
              de personnes, en Île-de-France et hors Île-de-France, ainsi que les règles de calcul
              du Revenu Fiscal de Référence.
            </p>
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Barème 2026 — Hors Île-de-France</h2>
            <p>
              Plafonds de Revenu Fiscal de Référence (RFR 2024) pour une demande en 2026. Sources :
              arrêté du 14 janvier 2026 publié au JO.
            </p>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Personnes</th>
                    <th className="p-3 border-b border-sand-200">Bleu</th>
                    <th className="p-3 border-b border-sand-200">Jaune</th>
                    <th className="p-3 border-b border-sand-200">Violet</th>
                    <th className="p-3 border-b border-sand-200">Rose</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['1', '≤ 17 173 €', '≤ 22 015 €', '≤ 30 844 €', '> 30 844 €'],
                    ['2', '≤ 25 115 €', '≤ 32 197 €', '≤ 45 340 €', '> 45 340 €'],
                    ['3', '≤ 30 206 €', '≤ 38 719 €', '≤ 54 592 €', '> 54 592 €'],
                    ['4', '≤ 35 285 €', '≤ 45 234 €', '≤ 63 844 €', '> 63 844 €'],
                    ['5', '≤ 40 388 €', '≤ 51 775 €', '≤ 73 098 €', '> 73 098 €'],
                    ['Par pers. suppl.', '+ 5 094 €', '+ 6 525 €', '+ 9 254 €', '+ 9 254 €'],
                  ].map(([p, bl, ja, vi, ro]) => (
                    <tr key={p} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{p}</td>
                      <td className="p-3">{bl}</td>
                      <td className="p-3">{ja}</td>
                      <td className="p-3">{vi}</td>
                      <td className="p-3">{ro}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2>Barème 2026 — Île-de-France (Paris + petite couronne)</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Personnes</th>
                    <th className="p-3 border-b border-sand-200">Bleu</th>
                    <th className="p-3 border-b border-sand-200">Jaune</th>
                    <th className="p-3 border-b border-sand-200">Violet</th>
                    <th className="p-3 border-b border-sand-200">Rose</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['1', '≤ 23 768 €', '≤ 28 933 €', '≤ 40 404 €', '> 40 404 €'],
                    ['2', '≤ 34 884 €', '≤ 42 463 €', '≤ 59 394 €', '> 59 394 €'],
                    ['3', '≤ 41 893 €', '≤ 51 000 €', '≤ 71 060 €', '> 71 060 €'],
                    ['4', '≤ 48 914 €', '≤ 59 549 €', '≤ 83 637 €', '> 83 637 €'],
                    ['5', '≤ 55 961 €', '≤ 68 123 €', '≤ 95 758 €', '> 95 758 €'],
                    ['Par pers. suppl.', '+ 7 038 €', '+ 8 568 €', '+ 12 122 €', '+ 12 122 €'],
                  ].map(([p, bl, ja, vi, ro]) => (
                    <tr key={p} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{p}</td>
                      <td className="p-3">{bl}</td>
                      <td className="p-3">{ja}</td>
                      <td className="p-3">{vi}</td>
                      <td className="p-3">{ro}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2>Taux d’aide par catégorie et geste</h2>
            <p>
              La catégorie ne définit pas le montant fixe mais le taux d’aide appliqué à chaque
              geste, dans la limite d’un plafond de dépenses par poste.
            </p>
            <ul>
              <li>
                <strong>Bleu</strong> : 70-90 % pris en charge selon geste (90 % pour pompe à
                chaleur air-eau).
              </li>
              <li>
                <strong>Jaune</strong> : 50-75 % (60 % pompe à chaleur, 75 % isolation combles).
              </li>
              <li>
                <strong>Violet</strong> : 30-50 % (pas d’aide pour isolation simple, conserve 30 %
                pompe à chaleur).
              </li>
              <li>
                <strong>Rose</strong> : 20-30 % UNIQUEMENT dans le parcours rénovation d’ampleur
                (gain ≥2 classes DPE). Plus d’aide pour gestes isolés depuis 2025.
              </li>
            </ul>

            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>Justificatifs à préparer.</strong> Avis d’imposition 2024 (tous les
                occupants du foyer), taxe foncière du logement, devis RGE détaillés, pièce
                d’identité, RIB. Le dossier se fait 100 % en ligne sur maprimerenov.gouv.fr.
                Instruction : 4 à 8 semaines.
              </p>
            </div>

            <h2>Exemple chiffré — famille 4 personnes hors IDF</h2>
            <p>
              Couple avec 2 enfants, RFR 2024 = 42 500 €, habitation en province : profil Jaune (≤
              45 234 €). Pour une pompe à chaleur air-eau à 14 000 € TTC posée par artisan RGE :
            </p>
            <ul>
              <li>MaPrimeRénov’ Jaune pompe à chaleur air-eau : 4 000 € forfaitaire</li>
              <li>Coup de pouce CEE chauffage : 4 000 €</li>
              <li>TVA réduite 5,5 % (-14,5 % vs 20 %)</li>
              <li>Reste à charge : 14 000 € − 4 000 € − 4 000 € = 6 000 € (ou via éco-PTZ)</li>
            </ul>
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
              href="/simulateur-aides-renovation"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Simuler mes aides <ShieldCheck className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
