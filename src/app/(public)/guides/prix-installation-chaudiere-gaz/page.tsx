import type { Metadata } from 'next'
import Link from 'next/link'
import { Euro, ArrowRight, Flame, Calculator, AlertTriangle } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'prix-installation-chaudiere-gaz'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Jean-Pierre Duval'

export const revalidate = 86400

const TITLE = 'Prix installation chaudière gaz en 2026 : le point complet'
const DESCRIPTION =
  'Prix installation chaudière gaz à condensation en 2026 : 3 500 à 7 500 € TTC installée. Fin de MaPrimeRénov’ chaudière gaz, coût entretien obligatoire, comparaison avec PAC.'

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
    authors: [`${SITE_URL}/equipe/jean-pierre-duval`],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const tldr = [
  'Chaudière gaz à condensation installée : 3 500 à 7 500 € TTC selon marque et puissance.',
  'Chaudière hybride (gaz + PAC) : 8 000 à 15 000 € TTC, éligible aides énergétiques.',
  'Depuis 2024, MaPrimeRénov’ ne subventionne plus les chaudières gaz seules.',
  'Entretien annuel obligatoire : 80-180 €/an, décret 2020-912.',
  'Remplacement fioul → gaz sans aides : considérer plutôt PAC (aides MaPrimeRénov’ significatives).',
]

const faqs = [
  {
    question: 'Combien coûte une chaudière gaz installée en 2026 ?',
    answer:
      "Chaudière gaz à condensation (la norme depuis 2018) : 3 500 à 7 500 € TTC installée. Entrée de gamme (Saunier Duval, ELM Leblanc) : 3 500-4 500 €. Milieu de gamme (Chaffoteaux, De Dietrich, Frisquet) : 4 500-6 000 €. Haut de gamme (Viessmann, Vaillant) : 5 500-7 500 €. Le prix inclut la chaudière, la dépose de l'ancienne, le raccordement hydraulique et gaz, la mise en service, l'évacuation fumées et les garanties.",
  },
  {
    question: 'MaPrimeRénov’ finance-t-elle encore les chaudières gaz ?',
    answer:
      "Non, depuis le 1er janvier 2023. La chaudière gaz seule n'est plus éligible à MaPrimeRénov', conformément à la stratégie nationale de décarbonation. Restent éligibles : chaudière hybride (gaz + pompe à chaleur intégrée), et le CEE Coup de pouce « Chauffage » pour certains cas de remplacement de chaudière individuelle au gaz peu performante par un équipement plus performant (en 2026, essentiellement PAC ou biomasse).",
  },
  {
    question: 'Faut-il remplacer sa chaudière gaz ancienne en 2026 ?',
    answer:
      "Pas d'obligation légale. Mais : (1) les chaudières non-condensation sont interdites à l'installation neuve depuis 2018 ; (2) la maintenance des modèles anciens devient plus chère (pièces rares) ; (3) la facture gaz augmente la rentabilité d'un remplacement. Calcul pratique : si votre chaudière a +15 ans et consomme >1 500 €/an, un remplacement par une condensation récente peut réduire la facture de 15-25 % (400 €/an), amortissement 8-12 ans.",
  },
  {
    question: 'Entretien annuel obligatoire : combien ?',
    answer:
      "Depuis le décret 2020-912 : entretien annuel obligatoire pour toute installation gaz résidentielle. Coût : 80-180 € selon prestataire, à la charge de l'occupant (propriétaire ou locataire). L'entretien comprend : vérification combustion, nettoyage brûleur et corps de chauffe, mesure CO, attestation d'entretien. Sans attestation, l'assurance habitation peut refuser la couverture en cas de sinistre lié à la chaudière.",
  },
  {
    question: 'Chaudière gaz ou pompe à chaleur : que choisir en 2026 ?',
    answer:
      "En maison bien isolée + réseau hydraulique existant : la PAC est souvent plus pertinente (aides publiques fortes, consommation plus faible, électrification progressive). En maison très mal isolée + radiateurs haute température : la chaudière gaz à condensation reste techniquement pertinente, à prix d'installation inférieur. La chaudière hybride (gaz + PAC) est un bon compromis pour les cas intermédiaires. Faites établir un bilan thermique avant décision.",
  },
  {
    question: 'Obligation PG (Professionnel Gaz) : qu’est-ce que c’est ?',
    answer:
      "Pour toute intervention sur installation gaz résidentielle intérieure, l'artisan doit détenir l'appellation Professionnel Gaz (PG) délivrée par Qualigaz. Sans PG : installation illégale, pas de certificat de conformité, risque de rupture d'approvisionnement gaz par GRDF. Vérifiez systématiquement sur qualigaz.com. En cas d'installation par un non-PG : refus de prise en charge par l'assurance en cas de sinistre (fuite, explosion).",
  },
]

const sources = [
  { label: 'Qualigaz — Professionnels agréés PG', url: 'https://www.qualigaz.com' },
  {
    label: 'Décret 2020-912 (entretien chaudières)',
    url: 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000042161994',
  },
  { label: 'ADEME — Chauffage et performance', url: 'https://agir.ademe.fr' },
  {
    label: 'France Rénov’ — Aides remplacement chauffage 2026',
    url: 'https://france-renov.gouv.fr',
  },
]

const relatedGuides = [
  { label: 'Prix PAC air-eau installée', href: '/guides/prix-pompe-chaleur-air-eau-installee' },
  { label: 'Pompe à chaleur : guide complet', href: '/guides/pompe-a-chaleur' },
  { label: 'Rénovation énergétique globale', href: '/guides/renovation-energetique-complete' },
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
    section: 'Prix & Chauffage',
    keywords: [
      'prix chaudière gaz',
      'installation chaudière gaz',
      'chaudière condensation prix',
      'remplacement chaudière',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Prix chaudière gaz', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Prix chaudière gaz' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Euro className="w-3.5 h-3.5" aria-hidden />
              Prix &amp; Chauffage
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Prix installation chaudière gaz en 2026 : le point complet
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              En 2026, une chaudière gaz à condensation installée coûte entre 3 500 et 7 500 € TTC.
              Point critique du paysage 2026&nbsp;: MaPrimeRénov’ n’aide plus les chaudières gaz
              seules, sauf en chaudière hybride. Voici la grille par puissance, les alternatives à
              considérer et les pièges à éviter dans le remplacement d’une chaudière.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Grille 2026 chaudière gaz à condensation installée</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Puissance</th>
                    <th className="p-3 border-b border-sand-200">Type logement</th>
                    <th className="p-3 border-b border-sand-200">Fourniture</th>
                    <th className="p-3 border-b border-sand-200">Total installée TTC</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    [
                      '18-24 kW (murale)',
                      'Appartement / petite maison bien isolée',
                      '1 500 à 2 500 €',
                      '3 500 à 5 000 €',
                    ],
                    [
                      '25-28 kW (murale)',
                      'Maison 80-120 m² RT 2012',
                      '2 000 à 3 200 €',
                      '4 000 à 5 800 €',
                    ],
                    [
                      '30-35 kW (murale ou sol)',
                      'Maison 120-180 m²',
                      '2 500 à 4 000 €',
                      '4 800 à 6 800 €',
                    ],
                    [
                      'Chaudière hybride gaz + PAC',
                      'Tous types + rénovation énergétique',
                      '5 500 à 9 500 €',
                      '8 000 à 15 000 €',
                    ],
                  ].map(([p, l, f, t]) => (
                    <tr key={p} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold">{p}</td>
                      <td className="p-3">{l}</td>
                      <td className="p-3">{f}</td>
                      <td className="p-3 font-semibold">{t}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Hors aides. Écart selon marque (entrée/milieu/haut), région et complexité
                d’installation.
              </p>
            </div>

            <h2>Ce que le devis doit inclure</h2>
            <ul>
              <li>Marque, modèle et référence de la chaudière</li>
              <li>Rendement saisonnier ETAS ≥ 92 %</li>
              <li>Dépose ancienne chaudière + évacuation (REP DEEE)</li>
              <li>Raccordement hydraulique + gaz + condensats</li>
              <li>Conduit évacuation des fumées (ventouse ou sortie toiture)</li>
              <li>Mise en service + paramétrage régulation</li>
              <li>Certificat de conformité Qualigaz</li>
              <li>Garantie fabricant (2-7 ans selon marque) + décennale artisan</li>
              <li>Numéro PG (Professionnel Gaz) visible</li>
            </ul>

            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>Depuis 2023.</strong> MaPrimeRénov’ ne finance plus les chaudières gaz
                seules. Si un commercial vous promet une aide « MaPrimeRénov’ chaudière gaz » en
                2026, c’est une fraude ou une confusion avec la chaudière hybride. Vérifiez sur
                france-renov.gouv.fr avant toute signature.
              </p>
            </div>

            <h2>Comparaison avec pompe à chaleur air-eau</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200"></th>
                    <th className="p-3 border-b border-sand-200">Chaudière gaz condensation</th>
                    <th className="p-3 border-b border-sand-200">PAC air-eau</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Investissement TTC', '3 500-7 500 €', '10 000-18 000 €'],
                    ['Aides 2026', 'Aucune', "Jusqu'à 9 000 €"],
                    ['Coût installation net', '3 500-7 500 €', '3 000-9 000 €'],
                    ['Consommation annuelle (130 m²)', '1 400-1 800 €', '700-1 000 €'],
                    ['Entretien annuel', '80-180 €', '150-250 €'],
                    ['Durée de vie', '15-20 ans', '15-20 ans'],
                    ['CO₂ émis', 'Significatif', '3-4× moins'],
                  ].map(([c, g, p]) => (
                    <tr key={c} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold">{c}</td>
                      <td className="p-3">{g}</td>
                      <td className="p-3">{p}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Comparaison indicative maison 130 m² RT 2005. La PAC est plus pertinente pour maison
                bien isolée, la chaudière condensation pour logement peu isolé avec radiateurs haute
                température.
              </p>
            </div>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    3 devis chauffage comparés
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Comparez chaudière gaz, PAC, hybride et chaudière biomasse auprès d’artisans PG
                    + QualiPAC vérifiés.
                  </p>
                  <Link
                    href="/devis"
                    className="inline-flex items-center gap-1.5 text-primary-700 font-semibold hover:underline"
                  >
                    Demander mes devis <ArrowRight className="w-4 h-4" aria-hidden />
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
            <Link
              href="/services/chauffagiste"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Trouver un chauffagiste <Flame className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
