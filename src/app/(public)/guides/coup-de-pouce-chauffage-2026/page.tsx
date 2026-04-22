import type { Metadata } from 'next'
import Link from 'next/link'
import { Euro, ArrowRight, Leaf, AlertTriangle, Calculator } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'coup-de-pouce-chauffage-2026'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Claire Dubois'

export const revalidate = 86400

const TITLE = 'Coup de pouce Chauffage 2026 : montants'
const DESCRIPTION =
  'Coup de pouce Chauffage 2026 : prime CEE jusqu’à 5 000 € pour remplacer chaudière fioul/gaz/charbon par PAC ou biomasse. Cumul MaPrimeRénov’.'

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
  'Coup de pouce Chauffage : bonification CEE pour remplacer chaudière fossile par PAC, biomasse ou raccordement réseau de chaleur.',
  'Montants 2026 (ménages modestes) : jusqu’à 5 000 € PAC air-eau, 4 000 € PAC air-air, 4 000 € poêle à granulés.',
  'Cumulable avec MaPrimeRénov’ : jusqu’à 9 000 € au total pour une PAC air-eau.',
  'Obligation : artisan RGE + équipement respectant l’ETAS minimum + ancienne énergie fossile remplacée.',
  'Signature du devis avant début de travaux, demande de prime via un signataire CEE agréé (obligé ou délégataire).',
]

const faqs = [
  {
    question: 'Qu’est-ce que le Coup de pouce Chauffage ?',
    answer:
      "Le Coup de pouce Chauffage est une bonification du dispositif CEE (Certificats d'Économies d'Énergie) mis en place par l'État et distribué par les fournisseurs d'énergie. Il incite à remplacer un chauffage fossile (fioul, gaz, charbon) par un système performant (pompe à chaleur, chaudière biomasse, raccordement à un réseau de chaleur). Les montants sont fixés par arrêté et renforcés pour les ménages modestes et très modestes.",
  },
  {
    question: 'Quels sont les montants 2026 ?',
    answer:
      "Pour les ménages très modestes/modestes (bleu/jaune) en 2026 : PAC air-eau 5 000 €, PAC eau-eau 5 000 €, PAC air-air 4 000 € (limité à un seul logement), chaudière biomasse performante 5 000 €, poêle ou insert à granulés 4 000 €, raccordement à un réseau de chaleur EnR&R 700 € + 500 € de main-d'œuvre. Ménages intermédiaires/supérieurs : 60-70 % des montants ci-dessus. Vérifiez le barème sur france-renov.gouv.fr à la date de signature.",
  },
  {
    question: 'Peut-on cumuler Coup de pouce + MaPrimeRénov’ ?',
    answer:
      "Oui. C'est même le principal intérêt du dispositif. Pour une PAC air-eau, un ménage très modeste peut cumuler MaPrimeRénov' 5 000 € + Coup de pouce CEE 5 000 € = 10 000 € d'aides pour un chantier de 13-15 000 €, soit un reste à charge de 3-5 000 €. Les deux dispositifs sont gérés séparément mais peuvent être demandés simultanément pour la même opération.",
  },
  {
    question: 'Quelles sont les conditions d’obtention ?',
    answer:
      'Quatre conditions cumulatives. (1) Logement résidentiel principal ou secondaire achevé depuis plus de 2 ans. (2) Ancienne énergie : fioul, gaz (non-condensation) ou charbon (selon opération). (3) Nouvel équipement : pompe à chaleur air-eau COP saisonnier ≥3,5, chaudière biomasse ETAS ≥77 %, poêle ETAS ≥73 % et émissions CO ≤0,3 %. (4) Artisan RGE pour le geste (QualiPAC pour PAC, Qualibois pour biomasse).',
  },
  {
    question: 'Quel est le délai entre signature et versement ?',
    answer:
      "4 à 12 semaines après envoi du dossier complet. Le demandeur transmet le dossier (devis signé, facture acquittée, attestation sur l'honneur, RIB, attestation RGE de l'entreprise) au signataire CEE choisi. Celui-ci vérifie, valide auprès du pôle national CEE, puis verse la prime directement au demandeur. Deux modèles possibles : prime versée au client (classique) ou prime déduite directement du devis (primes négociées à la source).",
  },
  {
    question: 'Comment choisir le signataire CEE (obligé) ?',
    answer:
      "Tous les grands fournisseurs d'énergie proposent une offre de Coup de pouce : EDF, Engie, TotalÉnergies, Eni, Butagaz, Primagaz, Hellio, Effy, etc. Les montants sont très proches car réglementés, mais les délais de traitement et les niveaux de service varient. Comparez 2-3 offres sur sites comme www.primesenergie.fr ou sélectionnez votre propre fournisseur d'énergie (cohérence administrative). Ne signez JAMAIS avec un démarchage téléphonique, qui est illégal depuis 2023 pour la rénovation énergétique.",
  },
]

const sources = [
  { label: 'Arrêté CEE en vigueur — Legifrance', url: 'https://www.legifrance.gouv.fr' },
  { label: 'France Rénov’ — Coup de pouce Chauffage', url: 'https://france-renov.gouv.fr' },
  {
    label: 'Pôle national CEE (ministère Transition écologique)',
    url: 'https://www.ecologie.gouv.fr/dispositif-cee',
  },
  {
    label: 'Loi n° 2020-901 (interdiction démarchage téléphonique)',
    url: 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000042176557',
  },
]

const relatedGuides = [
  { label: 'Prix PAC air-eau installée', href: '/guides/prix-pompe-chaleur-air-eau-installee' },
  { label: 'MaPrimeRénov’ 2026 — critères RGE', href: '/guides/maprimerenov-2026-criteres-rge' },
  { label: 'Comment choisir un artisan RGE', href: '/guides/comment-choisir-artisan-rge' },
  {
    label: 'CEE certificats d’économies d’énergie 2026',
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
    section: 'Aides & CEE',
    keywords: [
      'Coup de pouce Chauffage',
      'prime CEE chauffage',
      'remplacement chaudière',
      'aide PAC 2026',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Coup de pouce Chauffage 2026', url: `/guides/${SLUG}` },
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
              { label: 'Coup de pouce Chauffage 2026' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Leaf className="w-3.5 h-3.5" aria-hidden />
              Aides &amp; CEE · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Coup de pouce Chauffage 2026 : montants, conditions, cumul
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Le Coup de pouce Chauffage reste en 2026 l’un des leviers les plus puissants pour
              financer le remplacement d’une chaudière fioul ou gaz&nbsp;: jusqu’à 5 000 € de prime
              CEE cumulable avec MaPrimeRénov’. Voici les montants en vigueur, les conditions
              strictes d’éligibilité et les pièges à éviter pour ne pas perdre la prime.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Montants 2026 par équipement et profil</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Équipement</th>
                    <th className="p-3 border-b border-sand-200">Modestes (bleu/jaune)</th>
                    <th className="p-3 border-b border-sand-200">Intermédiaires/supérieurs</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['PAC air-eau', '5 000 €', '3 000 €'],
                    ['PAC eau-eau (géothermique)', '5 000 €', '3 500 €'],
                    ['PAC air-air', '4 000 €', '2 500 €'],
                    ['Chaudière biomasse performante', '5 000 €', '3 000 €'],
                    ['Poêle à granulés', '4 000 €', '2 500 €'],
                    ['Raccordement réseau de chaleur EnR&R', '1 200 €', '700 €'],
                  ].map(([eq, m, i]) => (
                    <tr key={eq} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{eq}</td>
                      <td className="p-3">{m}</td>
                      <td className="p-3">{i}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Montants indicatifs 2026 sous réserve des arrêtés en cours. Vérifier sur
                france-renov.gouv.fr à la date de signature du devis.
              </p>
            </div>

            <h2>Conditions d’éligibilité</h2>
            <ul>
              <li>Logement résidentiel (principal ou secondaire) de plus de 2 ans</li>
              <li>Ancienne énergie : fioul, gaz non-condensation, charbon (selon opération)</li>
              <li>
                Nouvel équipement respectant les seuils de performance :
                <ul>
                  <li>PAC air-eau : COP saisonnier ≥ 3,5</li>
                  <li>Chaudière biomasse : ETAS ≥ 77 %</li>
                  <li>Poêle granulés : ETAS ≥ 73 %, CO ≤ 0,3 %</li>
                </ul>
              </li>
              <li>Artisan RGE titulaire de la qualification liée au geste</li>
              <li>Signature devis AVANT demande de prime auprès du signataire CEE</li>
              <li>Facture acquittée + attestation sur l’honneur signée</li>
            </ul>

            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>Ordre critique.</strong> Vous devez choisir votre signataire CEE et signer
                la convention <strong>AVANT</strong> la signature du devis de l’artisan. Toute
                inversion d’ordre = prime perdue. Cela concerne l’immense majorité des refus
                constatés sur Coup de pouce en 2024-2025.
              </p>
            </div>

            <h2>Cumul avec MaPrimeRénov’</h2>
            <p>
              Les deux dispositifs peuvent se cumuler sur le même chantier. Exemple concret pour une
              PAC air-eau à 14 000 € TTC, ménage très modeste&nbsp;:
            </p>
            <ul>
              <li>MaPrimeRénov’ PAC air-eau : 5 000 €</li>
              <li>Coup de pouce Chauffage : 5 000 €</li>
              <li>Total aides : 10 000 €</li>
              <li>Reste à charge : 4 000 € (éligible éco-PTZ)</li>
            </ul>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Simuler votre Coup de pouce
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Estimation sous 5 min via le simulateur officiel France Rénov’, puis 3 devis
                    d’artisans RGE vérifiés.
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

            <h2>Arnaques fréquentes à éviter</h2>
            <ul>
              <li>
                <strong>Démarchage téléphonique.</strong> Interdit depuis 2023 pour rénovation
                énergétique (loi n° 2020-901). Tout appel entrant = illégal.
              </li>
              <li>
                <strong>« Primes majorées » promises à 7 000 € ou plus.</strong> Le barème est
                plafonné par arrêté : tout montant supérieur est fictif.
              </li>
              <li>
                <strong>Signature « à la volée » sur le devis.</strong> Un artisan qui propose de «
                s’occuper de tout » sans vous laisser choisir le signataire CEE peut conclure une
                convention moins favorable en votre nom.
              </li>
              <li>
                <strong>Artisan non-RGE.</strong> Vérifiez obligatoirement sur
                france-renov.gouv.fr/annuaire-rge à la date de signature.
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
              Demander un devis <Euro className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
