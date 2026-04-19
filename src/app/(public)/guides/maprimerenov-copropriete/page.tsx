import type { Metadata } from 'next'
import Link from 'next/link'
import { Euro, ArrowRight, Users, AlertTriangle } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'maprimerenov-copropriete'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Claire Dubois'

export const revalidate = 86400

const TITLE = 'MaPrimeRénov’ Copropriétés en 2026 : conditions et montants'
const DESCRIPTION =
  'MaPrimeRénov’ Copropriétés 2026 : aide collective jusqu’à 25 000 € / logement selon gain énergétique. Parcours obligatoire, vote AG, Accompagnateur Rénov’ et calendrier.'

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
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
  'Aide collective versée au syndicat des copropriétaires, pas aux copropriétaires individuels.',
  'Montants 2026 : 30-45 % des travaux, plafond 25 000 €/logement selon gain énergétique (≥35 %).',
  'Bonus « copro fragile » et « passoire thermique » cumulables, +1 500 €/logement chacun.',
  'Obligation : Accompagnateur Rénov’ + vote en AG majorité absolue (art. 25 loi 1965).',
  'Délai 12-24 mois entre vote initial et versement. Prévoir avances de trésorerie.',
]

const faqs = [
  {
    question: 'Qu’est-ce que MaPrimeRénov’ Copropriétés exactement ?',
    answer:
      "C'est une aide de l'État versée au syndicat des copropriétaires (représenté par le syndic) pour financer des travaux de rénovation énergétique globale touchant les parties communes. Contrairement à MaPrimeRénov' individuelle, elle ne finance pas les gestes isolés (remplacer une PAC individuelle d'un logement) mais des chantiers collectifs : isolation extérieure, remplacement chaufferie collective, fenêtres de tous les appartements dans un même projet.",
  },
  {
    question: 'Quels sont les montants 2026 ?',
    answer:
      "L'aide est calculée sur le coût total des travaux collectifs, avec plafond selon performance. Base : 30 % des travaux, plafonnée à 25 000 € TTC par logement. Bonus copropriété fragile (éligibilité ANAH) : +1 500 €/logement. Bonus sortie de passoire thermique (avant F/G, après D ou mieux) : +1 500 €/logement. Par ménage très modeste, l'État ajoute une aide individuelle MaPrimeRénov' jusqu'à 3 000 €. Total potentiel 29 000 € par logement.",
  },
  {
    question: 'Comment est-elle versée concrètement ?',
    answer:
      "L'aide est versée par l'ANAH au syndicat des copropriétaires. Le syndic, mandaté en assemblée générale, signe la convention avec l'ANAH (phase 1, accord de principe), puis dépose le dossier définitif après vote des travaux (phase 2). Le versement intervient à avancement (30 % à démarrage, 30 % à mi-chantier, 40 % à achèvement avec contrôle). Chaque copropriétaire voit l'aide déduite de sa quote-part dans l'appel de fonds travaux.",
  },
  {
    question: 'Accompagnateur Rénov’ : obligatoire ?',
    answer:
      "Oui, obligatoire pour MaPrimeRénov' Copropriétés depuis 2024. Il conseille la copropriété sur le scénario de travaux, réalise l'audit énergétique, assiste sur les dossiers ANAH et CEE, accompagne le vote en AG. Coût : 3 000 à 15 000 € selon taille copropriété, en partie financé par MaPrimeRénov' (80 % couvert, plafond 600 €/logement). Sa désignation est votée en AG majorité simple (art. 24).",
  },
  {
    question: 'Quelle majorité pour voter les travaux en AG ?',
    answer:
      "Les travaux d'intérêt collectif de rénovation énergétique relèvent de la majorité absolue (art. 25 loi du 10 juillet 1965) : majorité des voix de tous les copropriétaires, présents ou non. Si la majorité absolue n'est pas atteinte mais que le projet recueille au moins 1/3 des voix, une deuxième résolution à la majorité simple (art. 24) des voix exprimées peut être votée dans la même AG.",
  },
  {
    question: 'Combien de temps prend un projet MaPrimeRénov’ Copropriétés ?',
    answer:
      '12 à 24 mois du projet au début des travaux. Phase 1 (3-6 mois) : désignation Accompagnateur, audit énergétique, scénarios. Phase 2 (3-6 mois) : vote scénario en AG, signature convention ANAH. Phase 3 (3-12 mois) : consultation entreprises, vote travaux en AG, ordre de service. Phase 4 (6-18 mois selon ampleur) : chantier. La durée totale peut atteindre 3 ans sur une grande copropriété.',
  },
]

const sources = [
  { label: 'ANAH — MaPrimeRénov’ Copropriétés', url: 'https://www.anah.gouv.fr' },
  {
    label: 'Loi n° 65-557 du 10 juillet 1965 (art. 24 et 25)',
    url: 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000880200',
  },
  { label: 'France Rénov’ — Dispositif copropriétés', url: 'https://france-renov.gouv.fr' },
  { label: 'Décret n° 2024-249 (Accompagnateur Rénov’)', url: 'https://www.legifrance.gouv.fr' },
]

const relatedGuides = [
  { label: 'Travaux en copropriété : règles et démarches', href: '/guides/travaux-copropriete' },
  { label: 'MaPrimeRénov’ 2026 — critères RGE', href: '/guides/maprimerenov-2026-criteres-rge' },
  { label: 'Aides rénovation énergétique 2026', href: '/guides/aides-renovation-2026' },
  { label: 'Comment choisir un artisan RGE', href: '/guides/comment-choisir-artisan-rge' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Aides & Copropriété',
    keywords: [
      'MaPrimeRénov copropriété',
      'aide copropriété',
      'rénovation copro',
      'syndic travaux énergétiques',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'MaPrimeRénov’ Copropriétés', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'MaPrimeRénov’ Copropriétés' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Users className="w-3.5 h-3.5" aria-hidden />
              Aides &amp; Copropriété · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              MaPrimeRénov’ Copropriétés 2026 : conditions, montants, parcours
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              MaPrimeRénov’ Copropriétés est l’aide collective qui finance les gros chantiers de
              rénovation énergétique d’un immeuble&nbsp;: isolation de façade, remplacement de
              chaufferie, fenêtres de tous les appartements. Jusqu’à 25 000 € d’aide par logement en
              2026, avec un parcours bien plus structuré qu’en individuel.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Fonctionnement en 4 phases</h2>
            <ol>
              <li>
                <strong>Préparation (3-6 mois).</strong> Désignation de l’Accompagnateur Rénov’
                (vote AG art. 24). Audit énergétique, scénarios de rénovation chiffrés, estimation
                MaPrimeRénov’ Copro + CEE.
              </li>
              <li>
                <strong>Décision du scénario (1 AG).</strong> Vote en AG à la majorité absolue (art.
                25) pour un scénario précis avec gain énergétique ≥35 %. Signature de la convention
                avec l’ANAH par le syndic.
              </li>
              <li>
                <strong>Contractualisation travaux (3-6 mois).</strong> Consultation d’entreprises
                RGE, rédaction CCTP, 3 devis comparés, vote en AG du marché final, ordre de service
                signé par le syndic.
              </li>
              <li>
                <strong>Travaux + réception (6-18 mois).</strong> Chantier avec suivi Accompagnateur
                Rénov’. Contrôle final performance. Versement du solde d’aide après contrôle
                énergétique a posteriori.
              </li>
            </ol>

            <h2>Montants 2026 (plafonds par logement)</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Gain énergétique</th>
                    <th className="p-3 border-b border-sand-200">Taux d’aide</th>
                    <th className="p-3 border-b border-sand-200">Plafond € /logement</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['≥ 35 % (obligatoire)', '30 %', '15 000 €'],
                    ['≥ 50 %', '35 %', '20 000 €'],
                    ['≥ 50 % + sortie passoire', '45 %', '25 000 €'],
                  ].map(([g, t, p]) => (
                    <tr key={g} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{g}</td>
                      <td className="p-3">{t}</td>
                      <td className="p-3 font-semibold">{p}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Bonus cumulables : copropriété fragile +1 500 €, sortie passoire F/G +1 500 €. Aides
                individuelles MaPrimeRénov’ des ménages très modestes/modestes s’ajoutent (jusqu’à 3
                000 €/ménage).
              </p>
            </div>

            <h2>Qui est éligible</h2>
            <ul>
              <li>Copropriétés immatriculées au registre (matricule copro obligatoire)</li>
              <li>Au moins 65 % des lots à usage d’habitation principale</li>
              <li>Bâtiment achevé depuis ≥15 ans</li>
              <li>Travaux sur parties communes (hors lots privatifs exclusifs)</li>
              <li>Gain énergétique ≥35 % justifié par audit</li>
              <li>Entreprise(s) RGE selon les gestes</li>
            </ul>

            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>Attention au tempo.</strong> Le déclenchement du chantier doit avoir lieu
                dans les délais indiqués dans la convention ANAH (généralement 24 mois après
                signature). Un retard non justifié peut entraîner la caducité de l’accord : refaire
                toute la procédure. Le syndic est responsable du suivi.
              </p>
            </div>

            <h2>Cumul avec les autres aides</h2>
            <ul>
              <li>
                <strong>CEE Copropriétés</strong> : entre 10 et 30 €/m² selon geste, cumulable à 100
                %.
              </li>
              <li>
                <strong>Éco-PTZ copropriété</strong> : prêt collectif jusqu’à 50 000 € /logement
                remboursable sur 20 ans.
              </li>
              <li>
                <strong>Aides locales</strong> (région, EPCI) : souvent additionnelles.
              </li>
              <li>
                <strong>TVA 5,5 %</strong> sur les travaux d’économie d’énergie.
              </li>
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
            <Link href="/devis" className="inline-flex items-center gap-1 hover:text-primary-700">
              Devis copropriété <Euro className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
