import type { Metadata } from 'next'
import Link from 'next/link'
import { Euro, ArrowRight, Leaf, Calculator } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'aide-isolation-maison-proprietaire'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Claire Dubois'

export const revalidate = 86400

const TITLE = 'Aide isolation maison 2026 : propriétaire'
const DESCRIPTION =
  'Aides isolation 2026 propriétaire : MaPrimeRénov’, CEE, TVA 5,5 %, éco-PTZ. Jusqu’à 45 €/m² ITE, 25-45 €/m² combles. Devis gratuits.'

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
  'Combles perdus : MaPrimeRénov’ + CEE cumulables jusqu’à 45 €/m². Murs (ITE/ITI) : plus de geste MaPrimeRénov’ depuis 2026 — CEE (Coup de pouce isolation) jusqu’à 25 €/m² en geste, MaPrimeRénov’ uniquement en rénovation d’ampleur.',
  'Éco-PTZ jusqu’à 50 000 € pour rénovation d’ampleur, 15 000 € pour un seul geste isolation.',
  'TVA 5,5 % si artisan RGE Qualibat + résistance thermique R exigée.',
  'Aides locales (région, département, intercommunalité) en complément : jusqu’à +5-15 €/m².',
  'Résultat cumulé : reste à charge divisé par 2 à 4 pour ménage modeste.',
]

const faqs = [
  {
    question: 'Quelles aides pour isoler ma maison en 2026 ?',
    answer:
      "Cinq dispositifs cumulables : (1) MaPrimeRénov' par geste (15-25 €/m² sur les combles) — attention, depuis 2026 MaPrimeRénov' ne finance plus l'isolation des murs (ITE/ITI) en geste isolé, uniquement en rénovation d'ampleur ; (2) CEE Coup de pouce isolation (10-30 €/m² selon geste et profil), dispositif de référence pour les murs en geste ; (3) TVA réduite 5,5 % (économie ~15 % sur HT) si artisan RGE Qualibat ; (4) Éco-PTZ jusqu'à 15 000 € par geste ou 50 000 € bouquet ; (5) Aides locales variables. L'ensemble peut couvrir 50 à 80 % du coût pour un ménage modeste.",
  },
  {
    question: 'Quelle résistance thermique R exigée pour les aides ?',
    answer:
      "R minimum selon la zone climatique et le geste, en 2026 : combles perdus R ≥ 7 m²·K/W, rampants R ≥ 6, murs ITE/ITI R ≥ 3,7, planchers bas R ≥ 3. Ces seuils sont fixés par les arrêtés MaPrimeRénov' et CEE, et doivent être respectés pour toucher l'aide. Exigez que R soit écrit noir sur blanc sur le devis, avec référence certifiée de l'isolant (ACERMI).",
  },
  {
    question: 'L’artisan doit-il obligatoirement être RGE ?',
    answer:
      "Oui, impératif pour MaPrimeRénov', CEE et TVA 5,5 %. Qualifications exigées : Qualibat 7141 pour isolation combles/rampants, Qualibat 7131 ou 7132 pour ITE, Qualibat 7142 pour isolation murs par l'intérieur. Vérifiez toujours sur france-renov.gouv.fr/annuaire-rge à la date de signature : une qualification expirée = pas d'aide, même si le chantier est parfaitement exécuté.",
  },
  {
    question: 'Peut-on toucher MaPrimeRénov’ pour un logement secondaire ?',
    answer:
      "Oui depuis 2024, mais sous conditions. MaPrimeRénov' est accessible pour les résidences secondaires louées ou habitées régulièrement, si elles servent de résidence principale à un occupant (propriétaire bailleur, membre de famille). Exclus : logements non habités, logements saisonniers type Airbnb. CEE Coup de pouce accessible aussi. Aides locales à vérifier au cas par cas.",
  },
  {
    question: 'Quel ordre conseillé pour isoler ?',
    answer:
      "Règle ADEME : commencer par les combles (30 % des déperditions thermiques, rentabilité maximale), puis les murs (25 %), puis les planchers bas (10 %), puis les fenêtres (15 %). Dans cet ordre, chaque étape renforce la précédente. Un logement classé F/G peut viser un gain de 2-3 classes DPE après rénovation complète. Faites établir un audit énergétique pour prioriser (300-800 €, 80 % couvert par MaPrimeRénov' parcours accompagné).",
  },
  {
    question: 'MaPrimeRénov’ Parcours accompagné vs par geste ?',
    answer:
      "Deux voies distinctes. Par geste : un seul geste isolation = aide MaPrimeRénov' classique + CEE, rapide. Parcours accompagné : 2 gestes performants minimum (isolation + chauffage par exemple) avec gain énergétique ≥35 %, Accompagnateur Rénov' obligatoire, aide plus élevée (jusqu'à 70 % du coût pour ménage très modeste, plafond 70 000 € de travaux). Le parcours accompagné est obligatoire au-delà de 2 gestes performants depuis 2024.",
  },
]

const sources = [
  { label: 'France Rénov’ — Isolation', url: 'https://france-renov.gouv.fr' },
  { label: 'ADEME — Ordre des travaux', url: 'https://agir.ademe.fr' },
  { label: 'Arrêté CEE opérations standardisées', url: 'https://www.legifrance.gouv.fr' },
  { label: 'ACERMI — Certification des isolants', url: 'https://www.acermi.com' },
]

const relatedGuides = [
  { label: 'Prix isolation combles 100 m²', href: '/guides/prix-isolation-combles-100m2' },
  { label: 'Isolation ITE vs ITI 2026', href: '/guides/isolation-ite-iti-rge-aides-2026' },
  { label: 'Isolation thermique : guide complet', href: '/guides/isolation-thermique' },
  { label: 'MaPrimeRénov’ 2026 — critères RGE', href: '/guides/maprimerenov-2026-criteres-rge' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Aides & Isolation',
    keywords: [
      'aide isolation maison',
      'prime isolation propriétaire',
      'MaPrimeRénov isolation',
      'CEE isolation',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Aide isolation propriétaire', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Aide isolation propriétaire' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Leaf className="w-3.5 h-3.5" aria-hidden />
              Aides &amp; Isolation · Guide vérifié
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Aide isolation maison pour un propriétaire en 2026
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Isoler une maison en 2026 coûte typiquement 20-100 €/m² selon le poste. Cinq aides
              cumulables peuvent réduire ce coût de 50 à 80 % pour un propriétaire éligible&nbsp;:
              MaPrimeRénov’, CEE Coup de pouce, TVA 5,5 %, éco-PTZ et aides locales. Voici le
              tableau consolidé 2026.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Tableau consolidé des aides 2026 par poste</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Poste</th>
                    <th className="p-3 border-b border-sand-200">MaPrimeRénov’ (modestes)</th>
                    <th className="p-3 border-b border-sand-200">CEE Coup de pouce</th>
                    <th className="p-3 border-b border-sand-200">Cumul max</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Combles perdus (R≥7)', '25 €/m²', '20 €/m²', '45 €/m²'],
                    ['Combles aménagés (R≥6)', '25 €/m²', '20 €/m²', '45 €/m²'],
                    ['Murs par l’extérieur ITE (R≥3,7)', '— (ampleur)', '25 €/m²', '25 €/m²'],
                    ['Murs par l’intérieur ITI (R≥3,7)', '— (ampleur)', '20 €/m²', '20 €/m²'],
                    ['Planchers bas (R≥3)', '25 €/m²', '20 €/m²', '45 €/m²'],
                    [
                      'Fenêtres double vitrage (Uw≤1,3)',
                      '100 €/fenêtre',
                      '40-100 €/fenêtre',
                      '140-200 €',
                    ],
                  ].map(([p, m, c, t]) => (
                    <tr key={p} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{p}</td>
                      <td className="p-3">{m}</td>
                      <td className="p-3">{c}</td>
                      <td className="p-3 font-semibold">{t}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Montants 2026 indicatifs pour ménage « très modeste / modeste ». Ménages
                intermédiaires/supérieurs : ~60-70 % de ces montants. À vérifier sur
                france-renov.gouv.fr.
              </p>
            </div>

            <h2>Exemple chiffré : isolation combles 100 m² + fenêtres</h2>
            <ul>
              <li>Combles perdus soufflés : 2 800 € (28 €/m²)</li>
              <li>8 fenêtres PVC remplacées : 6 000 €</li>
              <li>
                <strong>Total travaux :</strong> 8 800 €
              </li>
              <li>MaPrimeRénov’ combles (modestes) : 2 500 €</li>
              <li>CEE Coup de pouce combles : 2 000 €</li>
              <li>MaPrimeRénov’ fenêtres : 640 € (80 € × 8)</li>
              <li>CEE Coup de pouce fenêtres : 480 € (60 € × 8)</li>
              <li>
                <strong>Total aides :</strong> 5 620 €
              </li>
              <li>
                <strong>Reste à charge :</strong> 3 180 € (36 % du coût total)
              </li>
              <li>Avec éco-PTZ : remboursable sur 15-20 ans à taux zéro</li>
            </ul>

            <h2>Documents à préparer pour MaPrimeRénov’</h2>
            <ul>
              <li>Devis détaillé signé par un artisan RGE (géste = qualification)</li>
              <li>Avis d’imposition N-2 (année N = année signature devis)</li>
              <li>RIB du titulaire MaPrimeRénov’</li>
              <li>Justificatif propriété (titre de propriété ou acte)</li>
              <li>Pour parcours accompagné : audit énergétique + contrat Accompagnateur</li>
              <li>Facture acquittée après travaux pour versement final</li>
            </ul>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Simuler vos aides isolation en 3 minutes
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Calcul personnalisé MaPrimeRénov’ + CEE + éco-PTZ + aides locales selon votre
                    projet.
                  </p>
                  <Link
                    href="/simulateur-aides-renovation"
                    className="inline-flex items-center gap-1.5 text-primary-700 font-semibold hover:underline"
                  >
                    Simuler mes aides <ArrowRight className="w-4 h-4" aria-hidden />
                  </Link>
                </div>
              </div>
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
            <Link href="/devis" className="inline-flex items-center gap-1 hover:text-primary-700">
              Devis isolation RGE <Euro className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
