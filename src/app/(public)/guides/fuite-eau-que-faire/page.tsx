import type { Metadata } from 'next'
import Link from 'next/link'
import { Droplet, ArrowRight, AlertTriangle, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema, getHowToSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'fuite-eau-que-faire'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Jean-Pierre Duval'

export const revalidate = 86400

const TITLE = 'Fuite d’eau : que faire ? Guide plombier'
const DESCRIPTION =
  'Fuite d’eau : les 5 gestes d’urgence, diagnostic visible vs caché, coûts de réparation, prise en charge assurance dégât des eaux. Guide plombier 2026.'

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
  'Geste n°1 : fermer le robinet général d’arrivée d’eau (souvent dans la cuisine, sous l’évier ou à l’entrée compteur).',
  'Geste n°2 : couper le disjoncteur si la fuite se rapproche d’une installation électrique.',
  'Geste n°3 : contenir l’eau (serpillière, seaux) et protéger meubles/parquet.',
  'Geste n°4 : photographier les dégâts et la source de fuite — preuves pour l’assurance.',
  'Geste n°5 : déclarer sous 5 jours à l’assurance habitation (garantie dégât des eaux obligatoire).',
]

const howToSteps = [
  {
    name: 'Fermer le robinet général',
    text: "Localisez le robinet d'arrêt général d'eau (généralement en cuisine sous l'évier, dans un coffret technique, ou près du compteur en pavillon). Tournez-le dans le sens horaire jusqu'à arrêt complet de l'arrivée d'eau. En immeuble, le compteur peut être dans la cave collective.",
  },
  {
    name: 'Couper l’électricité si besoin',
    text: "Si la fuite touche ou menace une installation électrique (prises, plafonnier, tableau), coupez immédiatement le disjoncteur général au tableau. L'eau conduit l'électricité et présente un risque d'électrocution grave.",
  },
  {
    name: 'Identifier la source',
    text: "Fuite visible = joint robinet, flexible WC, raccord machine, joint chauffe-eau. Fuite cachée = tache au plafond qui s'agrandit, consommation d'eau anormale (relevé compteur), facture qui explose. Une fuite cachée nécessite un plombier avec détection acoustique ou caméra thermique.",
  },
  {
    name: 'Contacter un plombier',
    text: 'Pour une fuite active, contactez un plombier en urgence (délai 2-4 h en journée, 4-8 h la nuit). Vérifiez SIREN et avis. Demandez devis avant travaux. Tarifs : déplacement urgence 80-150 €, intervention horaire 60-90 €/h. Supplément nuit +50 %, week-end +30-50 %.',
  },
  {
    name: 'Déclarer à l’assurance',
    text: "Remplissez le constat dégât des eaux (formulaire standard envoyé par l'assureur ou téléchargeable). Délai légal : 5 jours ouvrés. Joindre : photos, devis du plombier, facture réparation si déjà effectuée. Si voisins impactés, constat amiable à signer à plusieurs.",
  },
  {
    name: 'Prévenir copropriété ou bailleur',
    text: "Si vous êtes locataire : informez le bailleur dans les 24 h. Si copropriétaire : informez le syndic. Les réparations sur les canalisations collectives relèvent de la copropriété (entrée jusqu'au compteur individuel), les fuites après compteur sont à votre charge.",
  },
]

const faqs = [
  {
    question: 'Quel est le coût moyen d’une intervention plombier pour une fuite ?',
    answer:
      "Tarif plombier 2026 en France : déplacement urgence 80-150 €, heure de main-d'œuvre 60-90 €. Intervention simple (joint robinet, flexible) : 80-180 € TTC. Fuite cachée avec recherche : 200-450 €. Remplacement chauffe-eau fuyant : 800-1500 €. Rupture canalisation encastrée avec cassage mur : 600-1800 € + peinture. Supplément dimanche / nuit : +30-60 %.",
  },
  {
    question: 'L’assurance habitation couvre-t-elle les fuites d’eau ?',
    answer:
      "La garantie dégât des eaux (obligatoire dans tout contrat MRH) couvre les conséquences matérielles : sols, murs, meubles, plafonds des voisins du dessous. Elle ne couvre PAS la réparation de la fuite elle-même (hors contrats étendus type 'panne équipement'). Pour la fuite, négociez avec votre plombier ou activez la garantie assistance dépannage si incluse. Franchise classique : 150-300 €.",
  },
  {
    question: 'Comment détecter une fuite d’eau cachée ?',
    answer:
      "Signaux : (1) facture d'eau anormalement haute (>30 % de vos habitudes), (2) bruit d'eau qui coule sans robinet ouvert, (3) tache au plafond qui s'étend, (4) humidité persistante d'un mur, (5) sol chaud au-dessus d'un plancher chauffant, (6) compteur qui tourne robinets fermés. Méthodes pro : détection acoustique (microphone), caméra thermique, gaz traceur (hélium), endoscopie. Coût diagnostic : 150-400 €.",
  },
  {
    question: 'Qui paie : locataire ou propriétaire ?',
    answer:
      'Décret 87-712 du 26 août 1987 : le locataire prend en charge les menues réparations (joints, flexibles, mitigeurs). Le propriétaire prend en charge les grosses réparations (canalisations encastrées, chauffe-eau vétuste, VMC). En cas de vétusté, négociation. En copropriété : parties communes = syndic ; parties privatives = copropriétaire. Assurance dégât des eaux du locataire couvre les dommages aux tiers.',
  },
  {
    question: 'Quelle est la procédure CIDRE / CIDE-COP pour un dégât des eaux ?',
    answer:
      "Convention inter-assureurs qui simplifie le remboursement des sinistres dégât des eaux entre assurés. CIDRE = sinistre entre voisins particuliers (dégâts <1600 € HT). Chaque assureur indemnise son assuré sans recours contre l'auteur. CIDE-COP = dégâts touchant parties communes en copropriété. Concrètement : vous déclarez, votre assurance indemnise, pas besoin d'attendre l'enquête sur la responsabilité.",
  },
  {
    question: 'Peut-on arrêter une fuite temporairement soi-même ?',
    answer:
      "Oui, en attendant le plombier : (1) coupez l'eau générale, (2) pour fuite sur canalisation visible : bandeau auto-vulcanisant + collier de serrage (tiendra 24-48 h max), (3) pour joint robinet : remplacez le joint vous-même (2 € en magasin bricolage), (4) pour flexible WC ou lavabo : remplacez le flexible complet (10-20 €). Jamais de réparation pérenne sur gaz, chauffage, canalisation encastrée : appeler un pro.",
  },
]

const sources = [
  {
    label: 'Décret n° 87-712 du 26 août 1987 — Réparations locatives',
    url: 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000879077',
  },
  { label: 'Convention CIDRE — Dégâts des eaux', url: 'https://www.franceassureurs.fr' },
  { label: 'INC — Dégât des eaux et assurance', url: 'https://www.inc-conso.fr' },
  {
    label: 'Service-public.fr — Assurance habitation dégât des eaux',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F2775',
  },
]

const relatedGuides = [
  { label: 'Odeur canalisation : remède durable', href: '/guides/odeur-canalisation-remede' },
  { label: 'Humidité mur intérieur : solutions', href: '/guides/humidite-mur-interieur-solution' },
  {
    label: 'Moisissure mur chambre : traitement',
    href: '/guides/moisissure-mur-chambre-traitement',
  },
  { label: 'Vérifier le SIRET d’un artisan', href: '/guides/verifier-siret-artisan' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Urgences & Dépannage',
    keywords: [
      'fuite eau que faire',
      'urgence plombier',
      'dégât des eaux',
      'couper arrivée eau',
      'prix plombier fuite',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Fuite d’eau que faire', url: `/guides/${SLUG}` },
  ])
  const faqSchema = getFAQSchema(faqs)
  const howToSchema = getHowToSchema(howToSteps, {
    name: 'Que faire en cas de fuite d’eau',
    description: 'Procédure d’urgence pour stopper une fuite d’eau et limiter les dégâts.',
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Fuite d’eau que faire' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Droplet className="w-3.5 h-3.5" aria-hidden />
              Urgences &amp; Dépannage · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Fuite d’eau : les 5 gestes d’urgence pour limiter les dégâts
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Une fuite d’eau non traitée peut transformer une réparation à 100 € en chantier à 10
              000 €. Voici la procédure professionnelle : comment couper l’eau, identifier la
              source, contacter un plombier, déclarer à l’assurance et gérer la responsabilité
              propriétaire/locataire.
            </p>
          </header>

          <TldrBlock bullets={tldr} />

          <div className="not-prose border border-rose-200 bg-rose-50 rounded-lg p-4 my-6 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" aria-hidden />
            <div className="text-sm text-rose-900">
              <p className="font-semibold m-0 mb-1">Fuite active en ce moment ?</p>
              <ol className="m-0 pl-4 space-y-0.5">
                <li>Fermer le robinet général d’arrivée d’eau.</li>
                <li>Couper le disjoncteur si proximité installation électrique.</li>
                <li>Contenir l’eau et protéger meubles.</li>
                <li>Photographier la source.</li>
                <li>Appeler un plombier local vérifié.</li>
              </ol>
            </div>
          </div>

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Localiser votre robinet d’arrêt général</h2>
            <p>
              Chaque logement dispose d’un robinet d’arrêt général à fermer dès qu’une fuite est
              détectée. Emplacements fréquents :
            </p>
            <ul>
              <li>Sous l’évier de la cuisine (90 % des appartements récents)</li>
              <li>Dans le coffret technique en entrée (immeuble neuf)</li>
              <li>Au niveau du compteur d’eau (pavillon, regard extérieur ou garage)</li>
              <li>Cave collective avec compteur individuel (immeuble ancien)</li>
            </ul>
            <p>
              <strong>Astuce</strong> : repérez ce robinet aujourd’hui, pas en urgence. Testez-le
              (fermer/ouvrir) une fois par an pour éviter le grippage.
            </p>

            <h2>Fuite visible vs fuite cachée</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Type</th>
                    <th className="p-3 border-b border-sand-200">Signes</th>
                    <th className="p-3 border-b border-sand-200">Réparation</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Joint robinet', 'Goutte continue au robinet fermé', '10-40 €'],
                    ['Flexible WC/lavabo', 'Gouttes sous bonde', '15-80 €'],
                    ['Raccord machine', 'Flaque sous lave-linge/vaisselle', '40-120 €'],
                    ['Chauffe-eau', 'Eau au sol, groupe sécurité', '150-500 €'],
                    ['Canalisation murale', 'Tache plafond, humidité mur', '400-1800 €'],
                    ['Plancher chauffant', 'Sol chaud localisé, conso', '600-3000 €'],
                  ].map(([t, s, c]) => (
                    <tr key={t} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{t}</td>
                      <td className="p-3">{s}</td>
                      <td className="p-3 font-semibold">{c}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2>Comment vérifier si votre compteur fuit</h2>
            <ol>
              <li>
                Fermez tous les robinets de la maison (y compris WC, lave-linge, chauffe-eau).
              </li>
              <li>Regardez le petit témoin rotatif (étoile) sur le compteur d’eau.</li>
              <li>S’il tourne : fuite cachée en aval du compteur.</li>
              <li>Relevez l’index du soir au matin : écart &gt; 1-2 L = fuite confirmée.</li>
              <li>Contactez votre syndic si le compteur fuit lui-même (partie commune).</li>
            </ol>

            <h2>Déclarer un dégât des eaux à l’assurance</h2>
            <p>
              Délai légal : <strong>5 jours ouvrés</strong> après constat (Code des assurances, art.
              L113-2). Pièces à fournir :
            </p>
            <ul>
              <li>Constat amiable dégât des eaux (signé par tous les sinistrés)</li>
              <li>Photos des dégâts et de la source</li>
              <li>Factures ou devis des travaux de réparation</li>
              <li>Liste des biens endommagés avec valeur d’achat</li>
              <li>Numéro de contrat et d’assurance du tiers responsable (voisin)</li>
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
              href="/services/plombier"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Trouver un plombier <Phone className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
