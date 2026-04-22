import type { Metadata } from 'next'
import Link from 'next/link'
import {
  FileText,
  Scale,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Calculator,
} from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema, getHowToSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'comparer-3-devis-artisans'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Claire Dubois'

export const revalidate = 86400

const TITLE = 'Comparer 3 devis d’artisans en 2026'
const DESCRIPTION =
  'Comparez 3 devis travaux sans se faire avoir : grille de lecture ligne par ligne, écarts acceptables, signaux d’alerte et négociation efficace.'

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
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
}

const tldr = [
  'Demandez 3 devis détaillés pour tout chantier au-dessus de 1 500 €.',
  'Comparez ligne par ligne (matériaux, quantités, mises en œuvre), jamais seulement le total TTC.',
  'Écart acceptable entre devis sérieux : 10 à 20 %. Au-delà, un devis est mal rédigé ou sous-estime un poste.',
  'Vérifiez SIRET, décennale, dates et conditions de paiement — un prix bas sans garanties coûte plus cher au final.',
  'Négociez sur les postes, pas en pourcentage global : c’est plus efficace et les artisans sérieux y sont réceptifs.',
]

const howToSteps = [
  {
    name: 'Rédiger un cahier des charges identique pour les 3 artisans',
    text: 'Avant de solliciter les devis, décrivez précisément le chantier : surface, matériaux souhaités, contraintes (locataire en place, accès, délais), niveau de finition attendu. Trois artisans qui répondent à trois demandes différentes produisent des devis incomparables.',
  },
  {
    name: 'Exiger un devis détaillé ligne par ligne',
    text: "Un devis sérieux ventile : main-d'œuvre (taux horaire × heures), matériaux (références, quantités, prix unitaire), déplacement, frais d'évacuation. Un devis forfaitaire globalisé empêche toute comparaison et dissimule souvent des marges incohérentes.",
  },
  {
    name: 'Vérifier les mentions légales obligatoires',
    text: "Le devis doit afficher : SIRET à 14 chiffres, nom et adresse de l'entreprise, date d'émission, durée de validité (3 mois recommandé), détail HT, TVA applicable (20 %, 10 % ou 5,5 % selon le chantier), total TTC, conditions de paiement, assurance décennale (nom de l'assureur et n° de police).",
  },
  {
    name: 'Reconstituer un tableau comparatif',
    text: "Alignez les 3 devis sur un même tableau, poste par poste : fourniture, pose, transport, coordination. L'écart se lit alors immédiatement : un devis plus cher sur la pose mais moins cher sur les matériaux peut rester compétitif en total.",
  },
  {
    name: 'Repérer les lignes manquantes',
    text: "L'absence d'un poste indispensable (évacuation des gravats, reprise électrique après dépose, protection du chantier) fait artificiellement baisser le total. Demandez un avenant écrit avant de signer, jamais « c'est compris » à l'oral.",
  },
  {
    name: 'Décider sur rapport prix / garanties / délais',
    text: "Le prix n'est qu'un des 3 critères. Pondérez : rapport qualité d'exécution (références, avis, qualifications RGE/Qualibat), solidité juridique (décennale, ancienneté, effectif), capacité à tenir les délais (planning détaillé, disponibilité équipe).",
  },
]

const faqs = [
  {
    question: 'Un artisan peut-il facturer un devis ?',
    answer:
      "Non, sauf cas particulier. Pour une intervention standard à domicile (rénovation, installation), le devis est gratuit. Un artisan peut en revanche facturer un déplacement d'étude s'il le précise clairement à l'avance et par écrit — la prestation doit alors correspondre à un vrai diagnostic technique (métré, calculs thermiques, essais). Un devis facturé sans information préalable est contestable.",
  },
  {
    question: 'Combien de temps un devis est-il valable ?',
    answer:
      "La durée est indiquée sur le devis. En pratique, 3 mois est le standard pour des travaux d'entretien, 1 à 2 mois pour des chantiers dépendant de matériaux à cours fluctuants (acier, bois, certains isolants). Aucune durée mentionnée = le devis est réputé valable mais l'artisan peut refuser de l'exécuter si les conditions ont changé. Exigez toujours une date.",
  },
  {
    question: 'Quel écart est normal entre 3 devis ?',
    answer:
      "Pour un même cahier des charges et trois artisans sérieux : 10 à 20 %. Au-dessous, les devis sont probablement alignés sur le barème de matériaux du moment et une main-d'œuvre standard du marché local. Au-dessus de 20 %, au moins un devis n'a pas intégré un poste (une sous-estimation) ou surévalue la marge. Au-dessus de 40 %, il y a une erreur d'interprétation du cahier des charges — relancez.",
  },
  {
    question: 'Peut-on négocier un devis ?',
    answer:
      "Oui, mais intelligemment. Négocier en pourcentage global (« -10 % sur le total ») se solde souvent par une baisse de qualité ou la suppression d'un poste sans que vous vous en aperceviez. Négociez ligne par ligne : substitution d'un matériau équivalent moins cher, planning ajusté pour regrouper déplacements, partie du chantier que vous prenez en charge (évacuation, peinture de finition). L'artisan conserve ses marges, vous conservez la qualité.",
  },
  {
    question: 'Que faire si les 3 devis sont très chers ?',
    answer:
      "Trois explications possibles. (1) Sous-estimation de votre part — le prix du marché local est ce qu'il est, votre budget est à revoir. (2) Demande mal formulée — le cahier des charges décrit des contraintes ou matériaux haut de gamme qui pèsent sur le prix ; revoyez les spécifications. (3) Saisonnalité — en haute saison (printemps, automne), les artisans priorisent les chantiers lucratifs ; demandez un devis hors saison ou décalez le planning.",
  },
  {
    question: 'Comment détecter un devis anormalement bas ?',
    answer:
      "Un devis 30 % sous les autres n'est presque jamais une aubaine. Signaux d'alerte typiques : TVA à 20 % annoncée alors que le chantier est éligible à 10 % ou 5,5 % (l'artisan masque ainsi une absence de qualification RGE), absence d'assurance décennale, acompte demandé supérieur à 30 %, références floues, pas de SIRET. Le surcoût en cas de malfaçon ou d'abandon de chantier dépasse très largement l'économie initiale.",
  },
  {
    question: 'Faut-il prendre le devis le moins cher ?',
    answer:
      'Non, sauf coïncidence rare où il coche toutes les cases (SIRET actif, décennale, mentions complètes, références vérifiables, écart <20 % avec les autres). En pratique, choisir le devis médian en écartant les extrêmes est statistiquement plus sûr : le prix le plus bas cache souvent une omission, le plus haut une marge inhabituelle.',
  },
  {
    question: 'Quel acompte est légal ?',
    answer:
      "Pas de plafond légal général. Usage du secteur : 30 % à la signature, 40 % en cours de chantier (à l'achèvement d'une tranche définie), 30 % à la réception. Refusez toute demande d'acompte supérieure à 30 % à la signature. Pour les chantiers éligibles à MaPrimeRénov', la règle impose que le solde (au moins 50 %) ne soit payé qu'après la visite du contrôleur technique — vérifiez que l'artisan intègre cette contrainte.",
  },
]

const sources = [
  {
    label: 'Service-public.fr — Devis : mentions obligatoires',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F31144',
  },
  {
    label: 'Code de la consommation, art. L111-1 (information précontractuelle)',
    url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000032227262',
  },
  {
    label: 'INC — Guide pratique devis travaux',
    url: 'https://www.inc-conso.fr',
    note: 'Institut National de la Consommation',
  },
  {
    label: 'Code monétaire et financier, art. L112-6 (plafond espèces 1000 €)',
    url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000030999720',
  },
]

const relatedGuides = [
  {
    label: 'Comment vérifier le SIRET d’un artisan',
    href: '/guides/verifier-siret-artisan',
  },
  {
    label: 'Éviter les arnaques d’artisans : 10 signaux',
    href: '/guides/eviter-arnaques-artisan',
  },
  {
    label: 'Garantie décennale : tout comprendre',
    href: '/guides/garantie-decennale',
  },
  {
    label: 'Budget rénovation : établir un plan réaliste',
    href: '/guides/budget-renovation',
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
    section: 'Budget & Devis',
    keywords: [
      'comparer devis artisans',
      'devis travaux',
      '3 devis',
      'négocier devis',
      'acompte travaux',
    ],
  })

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Comparer 3 devis d’artisans', url: `/guides/${SLUG}` },
  ])

  const faqSchema = getFAQSchema(faqs)
  const howToSchema = getHowToSchema(howToSteps, {
    name: 'Comparer 3 devis de travaux en 6 étapes',
    description:
      'Méthode structurée pour comparer devis d’artisans sur le fond, pas sur le prix affiché.',
    totalTime: 'PT30M',
  })

  const schemas = [articleSchema, breadcrumbSchema, faqSchema, howToSchema].filter(
    (s): s is Record<string, unknown> => s !== null
  )

  return (
    <>
      <JsonLd data={schemas} />

      <div className="bg-sand-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Breadcrumb
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Comparer 3 devis d’artisans' }]}
            className="mb-6"
          />

          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Scale className="w-3.5 h-3.5" aria-hidden />
              Budget &amp; Devis · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Comparer 3 devis d’artisans : méthode pour ne pas se tromper
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Trois devis pour un même chantier peuvent varier de 20 %, sans que l’un soit plus «
              cher » que l’autre — chacun arbitre différemment matériaux, main-d’œuvre et garanties.
              Bien comparer, c’est lire ligne par ligne plutôt que comparer des totaux. Voici la
              méthode que les économistes de la construction utilisent pour chiffrer un chantier.
            </p>
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Pourquoi 3 devis et pas 2 ou 5</h2>
            <p>
              Avec deux devis, vous n’avez qu’une paire de prix, sans référence. Avec cinq, le temps
              consacré à lire et à répondre aux artisans devient disproportionné — et vous passez
              pour un particulier peu sérieux. Trois devis forment le triangle qui permet de&nbsp;:
              identifier le prix médian du marché local, détecter l’aberration (celui qui est 30 %
              en-dessous ou au-dessus), créer un rapport de négociation équilibré. C’est aussi le
              standard exigé pour l’instruction de la plupart des dossiers d’aide publique.
            </p>

            <h2>La grille de comparaison ligne par ligne</h2>
            <p>
              Un devis sérieux ventile chaque chantier en 6 à 10 postes. Pour chaque poste, trois
              données doivent figurer&nbsp;: une quantité (m², ml, unités), un prix unitaire, un
              prix total. Voici les postes à retrouver&nbsp;:
            </p>
            <ul>
              <li>
                <strong>Préparation du chantier.</strong> Protection des sols et mobilier, ouverture
                des saignées, démolition, évacuation des gravats. Poste souvent oublié ou
                sous-estimé.
              </li>
              <li>
                <strong>Fournitures.</strong> Références précises (marque, modèle ou équivalence
                acceptée), quantités, prix unitaire HT. « Carrelage 30 m² » sans précision = aucune
                garantie de qualité.
              </li>
              <li>
                <strong>Main-d’œuvre.</strong> Taux horaire pratiqué ou forfait ventilé par
                prestation. À qualité égale, un taux horaire de 55-75 €/h TTC est normal en 2026,
                avec variations régionales.
              </li>
              <li>
                <strong>Mises en œuvre spécifiques.</strong> Étanchéité, raccords, reprises
                d’enduit, finitions. Souvent comprises par défaut mais rarement détaillées — la
                source des litiges de réception.
              </li>
              <li>
                <strong>Déplacement et frais annexes.</strong> Trajet, location d’engins,
                tri/déchetterie. Forfait justifié ou refacturation au réel.
              </li>
              <li>
                <strong>TVA applicable.</strong> 20 % par défaut, 10 % pour travaux d’amélioration
                dans un logement de plus de 2 ans, 5,5 % pour rénovation énergétique éligible. Le
                taux retenu doit être cohérent avec le chantier et avec le statut RGE de l’artisan
                si besoin.
              </li>
            </ul>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8 overflow-x-auto">
              <p className="font-heading text-sm font-semibold text-sand-900 mb-3">
                Exemple de grille — isolation combles 100 m²
              </p>
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="border-b border-sand-200 text-sand-500 font-medium">
                    <th className="py-2">Poste</th>
                    <th className="py-2 text-right">Devis A</th>
                    <th className="py-2 text-right">Devis B</th>
                    <th className="py-2 text-right">Devis C</th>
                  </tr>
                </thead>
                <tbody className="text-sand-800">
                  <tr className="border-b border-sand-100">
                    <td className="py-2">Isolant laine de roche R=7</td>
                    <td className="py-2 text-right">2 400 €</td>
                    <td className="py-2 text-right">2 600 €</td>
                    <td className="py-2 text-right">1 900 €</td>
                  </tr>
                  <tr className="border-b border-sand-100">
                    <td className="py-2">Main-d’œuvre pose</td>
                    <td className="py-2 text-right">1 800 €</td>
                    <td className="py-2 text-right">2 100 €</td>
                    <td className="py-2 text-right">2 300 €</td>
                  </tr>
                  <tr className="border-b border-sand-100">
                    <td className="py-2">Pare-vapeur + scotch</td>
                    <td className="py-2 text-right">300 €</td>
                    <td className="py-2 text-right">350 €</td>
                    <td className="py-2 text-right text-red-600">Non chiffré</td>
                  </tr>
                  <tr className="border-b border-sand-100">
                    <td className="py-2">Évacuation ancien isolant</td>
                    <td className="py-2 text-right">250 €</td>
                    <td className="py-2 text-right">280 €</td>
                    <td className="py-2 text-right text-red-600">Non chiffré</td>
                  </tr>
                  <tr className="font-semibold">
                    <td className="py-2">Total TTC (TVA 5,5 %)</td>
                    <td className="py-2 text-right">5 015 €</td>
                    <td className="py-2 text-right">5 623 €</td>
                    <td className="py-2 text-right">4 431 €</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-xs text-sand-600 mt-3">
                Devis C semble le moins cher mais omet deux postes (pare-vapeur, évacuation). Une
                fois complété, son total réel approche 5 200 €, dans l’écart normal.
              </p>
            </div>

            <h2>5 signaux d’alerte à ne pas ignorer</h2>
            <ul>
              <li>
                <strong>TVA 20 %</strong> sur un chantier éligible à 10 % ou 5,5 %. L’artisan n’est
                probablement pas RGE, ou cherche à masquer l’absence d’éligibilité.
              </li>
              <li>
                <strong>Acompte supérieur à 30 %</strong> à la signature. Hors commande spécifique,
                c’est une prise de risque pour vous.
              </li>
              <li>
                <strong>Pas d’assurance décennale mentionnée.</strong> Illégal pour le gros œuvre et
                l’indissociable. Arrêt immédiat.
              </li>
              <li>
                <strong>Devis valable plus de 6 mois.</strong> Sur des matériaux dont le cours
                bouge, l’artisan se réserve le droit de revoir le prix sans vous prévenir.
              </li>
              <li>
                <strong>Mention « travaux imprévus facturés au réel ».</strong> Sans plafond ni
                procédure écrite, c’est une porte ouverte aux dépassements.
              </li>
            </ul>

            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                Le devis devient un <strong>contrat opposable</strong> dès la signature des deux
                parties (ou le versement d’un acompte). Avant de signer, relisez clauses de
                paiement, pénalités de retard et conditions de résiliation.
              </p>
            </div>

            <h2>La méthode en 6 étapes</h2>
            <ol>
              {howToSteps.map((step, i) => (
                <li key={i}>
                  <strong>{step.name}.</strong> {step.text}
                </li>
              ))}
            </ol>

            <h2>Choisir intelligemment entre 3 devis conformes</h2>
            <p>
              Si les 3 devis sont conformes (SIRET, décennale, ventilation claire, TVA cohérente),
              le prix n’est qu’un critère parmi d’autres. Pondérez selon l’importance du
              chantier&nbsp;:
            </p>
            <ul>
              <li>
                <strong>Chantier éligible aides.</strong> Privilégiez l’artisan RGE avec le plus
                d’expérience sur votre geste précis (pompe à chaleur, isolation, fenêtres), même
                5-10 % plus cher.
              </li>
              <li>
                <strong>Gros œuvre / extension.</strong> Privilégiez l’artisan avec la plus longue
                ancienneté, un effectif suffisant et des références photographiques récentes
                vérifiables.
              </li>
              <li>
                <strong>Rénovation d’intérieur standard.</strong> Le devis médian est généralement
                le bon choix, sauf si un devis cumule un prix plus bas et des références
                manifestement supérieures.
              </li>
            </ul>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Obtenir 3 devis en une seule demande
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Décrivez votre projet une fois. Nous transmettons votre demande à plusieurs
                    artisans vérifiés (SIRET, décennale, avis). Vous recevez jusqu’à 3 devis
                    gratuits sous 24 h, avec la même grille de lecture.
                  </p>
                  <Link
                    href="/devis"
                    className="inline-flex items-center gap-1.5 text-primary-700 font-semibold hover:underline"
                  >
                    Demander mes 3 devis gratuits <ArrowRight className="w-4 h-4" aria-hidden />
                  </Link>
                </div>
              </div>
            </div>

            <h2>Le check-list express avant de signer</h2>
            <ul className="not-prose space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" aria-hidden />
                <span>SIRET, adresse, SIREN, forme juridique présents</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" aria-hidden />
                <span>Décennale en cours de validité (nom assureur + n° police)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" aria-hidden />
                <span>Détail HT, TVA appliquée, total TTC</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" aria-hidden />
                <span>Quantité et prix unitaire par ligne</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" aria-hidden />
                <span>Date et durée de validité du devis</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" aria-hidden />
                <span>Délai d’exécution prévisionnel</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" aria-hidden />
                <span>Conditions de paiement (acompte ≤ 30 %)</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" aria-hidden />
                <span>Aucune clause « travaux imprévus au réel » sans plafond</span>
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
              Demander un devis <FileText className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
