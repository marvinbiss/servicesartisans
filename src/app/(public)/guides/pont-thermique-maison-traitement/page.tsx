import type { Metadata } from 'next'
import Link from 'next/link'
import { Snowflake, ArrowRight, AlertTriangle, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'pont-thermique-maison-traitement'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Claire Dubois'

export const revalidate = 86400

const TITLE = 'Pont thermique : traitement & fix 2026'
const DESCRIPTION =
  'Pont thermique : définition, localisation (dalle, refend, nez plancher), impact DPE, traitement ITE vs ITI, rupteurs thermiques, coût.'

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
  'Pont thermique = zone de rupture de l’isolation laissant passer la chaleur (liaison dalle/mur, refend, nez de plancher).',
  'Représente 10-30 % des déperditions d’un bâtiment isolé par l’intérieur, presque 0 % avec ITE.',
  'Signe : angle mur-plafond plus froid, tache humidité, moisissure locale, pied de mur froid.',
  'Solutions : ITE (la plus efficace), retours d’isolant, rupteurs thermiques (neuf).',
  'Caméra thermique de pro : 300-600 € diagnostic, localise tous les ponts thermiques.',
]

const faqs = [
  {
    question: 'Qu’est-ce qu’un pont thermique ?',
    answer:
      'Définition technique (RT2012, RE2020) : zone de la paroi où la résistance thermique est fortement diminuée, créant une fuite localisée de chaleur. Caractérisé par coefficient ψ (psi) en W/m·K (linéaire) ou χ (khi) ponctuel. Exemples typiques : jonction dalle de plancher / mur extérieur (refend interne en contact avec dalle froide), nez de balcon, angle saillant, pourtour de fenêtre. En moyenne : une maison ITI conserve 15-25 % de déperditions via ponts thermiques vs 2-5 % en ITE bien exécutée.',
  },
  {
    question: 'Comment repérer un pont thermique ?',
    answer:
      'Visuel : (1) trace noire ou moisissure au plafond en angle, (2) tache humide persistante au pied du mur, (3) sensation de pied froid en bas de mur. Technique : thermographie infrarouge (caméra FLIR) effectuée par un thermicien certifié, coût 300-600 €, rapport détaillé. Moment propice : hiver matin tôt, après 24 h de chauffage constant, écart intérieur-extérieur >15 °C. DIY : thermomètre laser surfaces 30-60 €, tester différentes zones de mur, écart >3 °C = pont thermique.',
  },
  {
    question: 'ITE ou ITI pour traiter les ponts thermiques ?',
    answer:
      "ITE (isolation thermique par l'extérieur) = solution la plus efficace. Supprime ponts thermiques structurels (refends, dalles intermédiaires, angles) car l'enveloppe isolante enveloppe complètement le bâtiment. Performance mesurée : 70-90 % des ponts thermiques supprimés. ITI (par l'intérieur) = partielle. Les ponts thermiques aux refends et dalles restent car on ne peut pas isoler ces éléments structurels par l'intérieur sans démolition majeure. Performance : 30-50 % des ponts thermiques traités.",
  },
  {
    question: 'Qu’est-ce qu’un rupteur thermique ?',
    answer:
      "Élément structurel préfabriqué (Schöck Isokorb, Halfen HIT) intégré entre dalle et mur ou entre balcon et plancher intérieur, utilisé en construction NEUVE. Il permet de transmettre la charge mécanique tout en stoppant le flux thermique. Coût : 150-400 € par mètre linéaire de jonction. Obligatoire depuis RT2012 pour atteindre les performances réglementaires. En rénovation : impossible à poser (élément structurel), d'où la préférence pour l'ITE.",
  },
  {
    question: 'Combien coûte le traitement des ponts thermiques ?',
    answer:
      "En rénovation, coûts indicatifs : (1) retour d'isolant en angle intérieur sur 60 cm : 40-80 €/ml, (2) isolation de nez de plancher par l'extérieur (ossature + bardage) : 150-280 €/ml, (3) ITE complète (traite tous les ponts d'un coup) : 110-230 €/m² de façade. Pour une maison 100 m² de surface habitable (120 m² de façade) : 13 000-28 000 € pour ITE complète, vs 4 000-8 000 € pour traitement partiel des ponts par retours intérieurs.",
  },
]

const sources = [
  { label: 'RE2020 — Ponts thermiques', url: 'https://www.rt-batiment.fr' },
  { label: 'ADEME — Traitement ponts thermiques', url: 'https://agirpourlatransition.ademe.fr' },
  { label: 'CSTB — Coefficients ψ ponts thermiques', url: 'https://www.cstb.fr' },
  { label: 'Schöck — Rupteurs thermiques', url: 'https://www.schoeck.com/fr-fr' },
]

const relatedGuides = [
  {
    label: 'Isolation extérieure vs intérieure',
    href: '/guides/isolation-exterieure-vs-interieure',
  },
  { label: 'Isolation thermique', href: '/guides/isolation-thermique' },
  { label: 'Moisissure mur chambre traitement', href: '/guides/moisissure-mur-chambre-traitement' },
  { label: 'Condensation fenêtres causes', href: '/guides/condensation-fenetres-causes' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Rénovation énergétique',
    keywords: [
      'pont thermique maison',
      'traitement pont thermique',
      'rupteur thermique',
      'isolation pont thermique',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Pont thermique traitement', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Pont thermique traitement' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Snowflake className="w-3.5 h-3.5" aria-hidden />
              Rénovation énergétique · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Pont thermique maison : traitement et solutions
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Les ponts thermiques représentent jusqu’à 30 % des déperditions d’un logement isolé
              par l’intérieur, et expliquent 60 % des moisissures en angle. Voici où les localiser,
              comment les traiter, et quels coûts anticiper en 2026.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Localisations types d’un pont thermique</h2>
            <ul>
              <li>
                <strong>Liaison dalle / mur extérieur</strong> : refend interne reposant sur la
                dalle (chaque étage).
              </li>
              <li>
                <strong>Nez de balcon</strong> : béton qui traverse l’isolation.
              </li>
              <li>
                <strong>Pourtour de fenêtres</strong> : tableaux, linteaux, appuis non traités.
              </li>
              <li>
                <strong>Angle de façade</strong> (saillant ou rentrant) : effet géométrique de
                perte.
              </li>
              <li>
                <strong>Jonction toiture / mur</strong> (sablière, panne).
              </li>
              <li>
                <strong>Jonction plancher bas / mur</strong> (rez-de-chaussée sur vide sanitaire).
              </li>
            </ul>
            <h2>Impact sur la facture et DPE</h2>
            <p>
              Un logement 100 m² avec ITI seule perd 25-40 % de plus qu’une ITE équivalente. Sur
              facture de chauffage annuelle : +200-400 €/an à perte équivalente. Sur DPE : souvent
              -1 classe (D vs C). Les ponts thermiques sont pris en compte dans le calcul DPE 2021
              via les coefficients ψ tabulés par défaut ou mesurés.
            </p>
            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>Moisissure en angle = pont thermique.</strong> Quand l’angle est plus froid
                que le reste du mur, la vapeur d’eau intérieure y condense. Bactéries et moisissures
                s’y développent. Repeindre sans traiter le pont thermique = problème récurrent.
                Seule solution durable : isoler la zone.
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
              href="/services/isolation-thermique"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Trouver un isoleur <Phone className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
