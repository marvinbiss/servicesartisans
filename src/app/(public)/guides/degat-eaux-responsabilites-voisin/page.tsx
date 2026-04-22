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

const SLUG = 'degat-eaux-responsabilites-voisin'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Sophie Martin'

export const revalidate = 86400

const TITLE = 'Dégât des eaux voisin : recours 2026'
const DESCRIPTION =
  'Dégât des eaux voisin : convention IRSI 2020, constat amiable, expertise, responsabilité locataire/propriétaire. Délais assurance, recours, franchise.'

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
    authors: [`${SITE_URL}/equipe/sophie-martin`],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const tldr = [
  'Convention IRSI 2020 : indemnisation directe par son propre assureur dès que dommages <5 000 €, peu importe qui est responsable.',
  'Déclaration obligatoire assureur sous 5 jours ouvrés. Au-delà : risque refus prise en charge pour tardiveté (art. L113-2 Code assurances).',
  'Constat amiable dégât des eaux à remplir conjointement avec le voisin, en double exemplaire. Modèle disponible chez tout assureur.',
  'Responsabilités : locataire (réparations courantes, négligence) vs propriétaire bailleur (vétusté, vice caché) vs syndic (parties communes).',
  'Délai indemnisation : expertise sous 15-30 jours, proposition sous 60 jours, versement sous 30 jours après accord. Total 3-6 mois.',
]

const howToSteps = [
  {
    name: 'Couper la source',
    text: 'Fermez l’arrivée d’eau principale et l’électricité si l’eau touche des câbles. Prévenez le voisin si la fuite vient de chez lui.',
  },
  {
    name: 'Photographier et documenter',
    text: 'Prenez 20-30 photos : étendue dégâts, source visible, biens endommagés, plafonds, sols, mobilier. Conservez factures des biens détruits.',
  },
  {
    name: 'Remplir constat amiable',
    text: 'Utilisez le constat amiable dégât des eaux (modèle assureur). À signer conjointement avec voisin en double exemplaire.',
  },
  {
    name: 'Déclarer à l’assurance sous 5 jours',
    text: 'Envoi courrier recommandé ou déclaration en ligne. Joindre constat + photos + liste biens endommagés avec valeurs.',
  },
  {
    name: 'Faire expertiser',
    text: 'Expertise par expert mandaté par assureur sous 15-30 j. Votre assureur organise et finance. Vous pouvez demander contre-expertise à vos frais.',
  },
  {
    name: 'Attendre proposition puis indemnisation',
    text: 'Proposition d’indemnisation sous 60 j après expertise. Versement sous 30 j après acceptation. Contester si sous-évaluation (lettre recommandée).',
  },
]

const faqs = [
  {
    question: 'Qui est responsable d’un dégât des eaux venant du voisin ?',
    answer:
      "La réponse juridique dépend de l'origine : (1) Fuite d'un équipement individuel du voisin (machine à laver, baignoire débordée, WC bouché) → responsabilité du voisin occupant (locataire ou propriétaire occupant), son assurance MRH paie ; (2) Fuite d'une canalisation encastrée dans le mur du voisin → responsabilité du propriétaire bailleur (vétusté) ou du syndic (parties communes si colonne verticale) ; (3) Fuite d'un équipement commun (colonne montante, gaine technique) → responsabilité de la copropriété. En pratique avec IRSI 2020, vous déclarez à VOTRE assureur qui vous indemnise, puis se retourne ensuite (recours subrogatoire) contre l'assureur du responsable. Inutile d'identifier parfaitement.",
  },
  {
    question: 'Qu’est-ce que la convention IRSI 2020 ?',
    answer:
      "IRSI = Indemnisation et Recours des Sinistres Immeuble, en vigueur depuis le 1er juin 2018, révisée en 2020. Elle simplifie drastiquement : (1) votre propre assureur vous indemnise quelle que soit l'origine du sinistre — plus besoin d'attendre l'accord entre assureurs ; (2) pour dommages <5 000 € : circuit rapide, indemnisation en 2-3 mois ; (3) pour dommages 5 000-20 000 € : procédure standard avec expertise ; (4) pour >20 000 € : expertise contradictoire obligatoire entre les 2 assureurs. IRSI ne s'applique qu'en immeuble collectif + signature de tous les assureurs concernés. 97 % des assureurs sont signataires en 2025.",
  },
  {
    question: 'Le voisin ne veut pas déclarer : que faire ?',
    answer:
      'Démarches à enchaîner : (1) Envoyer courrier recommandé AR au voisin lui demandant formellement de déclarer à son assurance + copie au syndic si appartement ; (2) Déclarer de votre côté à votre assureur avec photos + témoignage écrit explicitant que le voisin refuse — votre assureur vous indemnise tout de même (IRSI) et fera le recours ; (3) Si dégât majeur >10 k€ : huissier pour constat (80-150 €) + éventuelle action judiciaire au tribunal de proximité. En copropriété : alerter le syndic qui peut mandater expertise technique. Ne jamais faire vous-même justice (démontage canalisations voisin sans accord) : délit de dégradation volontaire.',
  },
  {
    question: 'Quelles franchises et plafonds typiques en MRH ?',
    answer:
      "Variables selon contrat : (1) Franchise dégât des eaux standard : 150-300 € par sinistre (première franchise calendaire offerte dans les contrats premium) ; (2) Plafond matériel mobilier : 25 000-100 000 € selon capital déclaré ; (3) Plafond bâtiment (propriétaires) : 500 000 € - 2 M€ ; (4) Perte d'usage / relogement : 1 000-5 000 € pour locataires / 3 000-15 000 € pour propriétaires pendant travaux ; (5) Exclusions classiques : eau issue de la pluie (tempête), eau marine, infiltration lente non signalée, défaut d'entretien manifeste (joints lavabo, siphon bouché) — à vérifier dans les conditions générales. Contrats MRH low-cost (<150 €/an) ont franchises 500 €+ et plafonds limités.",
  },
  {
    question: 'Comment contester une indemnisation sous-évaluée ?',
    answer:
      "Procédure en 4 étapes : (1) Lettre recommandée AR à l'assureur sous 30 jours demandant révision, joindre devis détaillés de réparation (plombier, peintre, revêtements) + photos haute résolution + factures d'origine des biens détruits ; (2) Si refus, demande de contre-expertise amiable contradictoire : l'assureur mandate son expert, vous mandatez le vôtre (500-1 500 € à votre charge, remboursés si gain obtenu), un tiers arbitre en cas de désaccord ; (3) Saisie du médiateur de l'assurance via mediation-assurance.org : gratuit, avis sous 90 jours, suivi dans 80 % des cas ; (4) En dernier recours, tribunal judiciaire avec avocat (1 500-5 000 € frais) — justifié si écart >10 000 € entre indemnisation et préjudice réel. Prescription 2 ans à compter du sinistre.",
  },
]

const sources = [
  {
    label: 'Art. L113-2 Code assurances — Délai déclaration',
    url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006792451',
  },
  {
    label: 'Convention IRSI — France Assureurs',
    url: 'https://www.franceassureurs.fr',
  },
  { label: 'Service-public.fr — Dégât des eaux', url: 'https://www.service-public.fr' },
  { label: 'La Médiation de l’Assurance', url: 'https://www.mediation-assurance.org' },
]

const relatedGuides = [
  {
    label: 'Infiltration eau toiture diagnostic',
    href: '/guides/infiltration-eau-toiture-diagnostic',
  },
  { label: 'Fuite d’eau : que faire', href: '/guides/fuite-eau-que-faire' },
  { label: 'Assurance habitation et travaux', href: '/guides/assurance-habitation-travaux' },
  { label: 'Infiltration fenêtre PVC', href: '/guides/infiltration-fenetre-pvc' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Urgences',
    keywords: [
      'dégât des eaux voisin',
      'responsabilité dégât eaux',
      'convention IRSI 2020',
      'constat amiable dégât eaux',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Dégât des eaux voisin', url: `/guides/${SLUG}` },
  ])
  const faqSchema = getFAQSchema(faqs)
  const howToSchema = getHowToSchema(howToSteps, {
    name: 'Que faire en cas de dégât des eaux venant du voisin',
    description:
      'Procédure officielle en 6 étapes pour gérer un dégât des eaux venant d’un appartement voisin et obtenir indemnisation MRH.',
    totalTime: 'P5D',
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Dégât des eaux voisin' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Droplet className="w-3.5 h-3.5" aria-hidden />
              Urgences · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Dégât des eaux voisin : responsabilités et indemnisation
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              La convention IRSI 2020 a transformé la gestion des dégâts des eaux entre voisins.
              Voici la procédure complète : constat amiable, déclaration sous 5 jours, expertise,
              responsabilités croisées locataire/propriétaire/syndic et délais d’indemnisation.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Qui paie selon la source du dégât</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Source fuite</th>
                    <th className="p-3 border-b border-sand-200">Responsable</th>
                    <th className="p-3 border-b border-sand-200">Assurance activée</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Machine à laver voisin', 'Voisin occupant', 'MRH voisin'],
                    ['Baignoire débordée voisin', 'Voisin occupant', 'MRH voisin'],
                    ['Canalisation encastrée', 'Propriétaire bailleur', 'MRH bailleur + PNO'],
                    ['Colonne montante commune', 'Copropriété', 'Multirisque immeuble'],
                    ['Pluie / tempête', 'Cas fortuit', 'MRH garantie tempête'],
                  ].map(([s, r, a]) => (
                    <tr key={s} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{s}</td>
                      <td className="p-3">{r}</td>
                      <td className="p-3">{a}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>5 jours pour déclarer, sinon refus possible.</strong> Art. L113-2 Code des
                assurances. Idéalement sous 48 h pour maximiser chances indemnisation. Photos +
                constat + liste biens indispensables. Ne jetez RIEN avant l’expertise.
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
