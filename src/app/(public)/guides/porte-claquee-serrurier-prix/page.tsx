import type { Metadata } from 'next'
import Link from 'next/link'
import { Key, ArrowRight, ShieldCheck, AlertTriangle, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'porte-claquee-serrurier-prix'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Sophie Martin'

export const revalidate = 86400

const TITLE = 'Porte claquée : prix serrurier 2026 et arnaques à éviter'
const DESCRIPTION =
  'Porte claquée : prix serrurier 2026 selon type de porte, heure et urgence. Comment éviter les arnaques serrurier (500-3000 €), méthode sans casse, garanties.'

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
  'Porte simplement claquée (pas fermée à clé) : ouverture sans casse 80-180 € en journée, 150-280 € la nuit/week-end.',
  'Porte fermée à double tour ou blindée : 180-400 € avec potentiel remplacement cylindre.',
  'Les prix grimpent vite si le serrurier casse la serrure : exiger ouverture fine au crochet ou carte.',
  'Arnaques massives : faux 24h/7j, sous-traitants, factures 1500-3000 € justifiées par « blindage A2P ». Toujours devis écrit.',
  'Protection juridique habitation : contactez votre assurance — elle impose souvent un réseau agréé moins cher.',
]

const faqs = [
  {
    question: 'Combien coûte un serrurier pour une porte claquée ?',
    answer:
      "Tarif honnête 2026 : 80-180 € TTC en journée pour une porte simplement claquée (pas à clé), 150-280 € la nuit ou le week-end. Si la porte est fermée à double tour : 180-350 € (ouverture fine) ou 250-500 € avec casse et remplacement cylindre. Au-delà, c'est une arnaque. Pour une porte blindée avec serrure A2P 3 étoiles, le vrai prix d'ouverture peut atteindre 400-600 € en urgence mais exige un devis écrit préalable.",
  },
  {
    question: 'Les serruriers 24h/7j sont-ils fiables ?',
    answer:
      "80 % des serruriers 24h/7j qui sponsorisent Google sur requête 'serrurier urgence' sont des plateformes d'intermédiation peu scrupuleuses. Elles envoient un sous-traitant payé à la commission qui doit facturer cher. Signes d'arnaque : devis oral uniquement, paiement cash imposé, facture sans SIRET réel, mention 'blindage obligatoire' sans démonstration technique. Préférez un serrurier local identifiable avec boutique physique et avis Google de 20+ mois.",
  },
  {
    question: 'Comment ouvrir une porte claquée sans serrurier ?',
    answer:
      "Méthode carte plastique (seulement porte simple type pêne demi-tour non armé) : glissez la carte entre la porte et le chambranle au niveau du pêne, poussez obliquement vers le bas. Si le pêne est biseauté, la porte s'ouvre. Attention : ne fonctionne PAS sur porte à joint caoutchouc, porte blindée, porte double tour. Et vous pouvez abîmer la peinture du chambranle. Autre option : passer par le bailleur / syndic / voisin qui a un double. Dernière option : pompiers (gratuit si enfant/personne/animal en danger).",
  },
  {
    question: 'Un serrurier doit-il me fournir un devis avant d’intervenir ?',
    answer:
      "OUI, obligatoire — arrêté du 24 janvier 2017 sur la transparence des prix des dépanneurs. Le devis écrit et signé avant travaux est exigé pour tout dépannage domicile. Sans devis, vous n'êtes pas tenu de payer et pouvez refuser la prestation. Le devis doit mentionner : identité du serrurier, SIRET, date, détail des prestations avec prix TTC, taux horaire, déplacement, fourniture de pièces. Les frais de déplacement doivent être annoncés à l'oral avant intervention.",
  },
  {
    question: 'L’assurance habitation couvre-t-elle une ouverture de porte ?',
    answer:
      "Oui, si votre contrat inclut l'assistance dépannage (présente dans 70 % des MRH). Avantages : plafond généralement 200-500 €, serrurier agréé sélectionné par l'assureur, pas d'avance de fonds, pas de surfacturation. Déclenchement : appelez le numéro assistance (pas l'agence) sur votre carte d'assuré. Délai intervention : 30 min à 2 h. La plupart des assurés ignorent ce service — toujours vérifier son contrat avant d'appeler un serrurier au hasard.",
  },
  {
    question: 'Que faire si je me suis fait arnaquer par un serrurier ?',
    answer:
      'Conservez la facture et demandez une copie du RIB. Recours : (1) contester dans les 14 jours par lettre recommandée demandant remboursement partiel (droit de rétractation démarchage domicile, article L221-18 Code consommation), (2) signalement SignalConso.gouv.fr (DGCCRF), (3) si paiement CB : faire opposition et signaler le litige à votre banque, (4) médiateur consommation du BTP (depuis 2016). Pour une facture >300 € suspecte, porter plainte en gendarmerie : abus de faiblesse, escroquerie.',
  },
]

const sources = [
  {
    label: 'Arrêté du 24 janvier 2017 — Dépannage à domicile',
    url: 'https://www.legifrance.gouv.fr',
  },
  { label: 'SignalConso — Signalement arnaque DGCCRF', url: 'https://signal.conso.gouv.fr' },
  { label: 'INC — Faire face à un serrurier arnaqueur', url: 'https://www.inc-conso.fr' },
  { label: 'CNPP — Certification A2P serrures', url: 'https://www.cnpp.com' },
]

const relatedGuides = [
  { label: 'Comment choisir un artisan RGE', href: '/guides/comment-choisir-artisan-rge' },
  { label: 'Labels et qualifications artisans', href: '/guides/labels-qualifications-artisans' },
  { label: 'Vérifier le SIRET d’un artisan', href: '/guides/verifier-siret-artisan' },
  { label: 'Comparer 3 devis d’artisans', href: '/guides/comparer-3-devis-artisans' },
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
      'porte claquée',
      'prix serrurier',
      'serrurier urgence',
      'arnaque serrurier',
      'ouverture porte',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Porte claquée prix serrurier', url: `/guides/${SLUG}` },
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
              { label: 'Porte claquée prix serrurier' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Key className="w-3.5 h-3.5" aria-hidden />
              Urgences &amp; Dépannage · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Porte claquée : prix serrurier 2026 et arnaques à éviter
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Porte claquée et vous êtes dehors ? Le vrai prix d’une ouverture en journée est de
              80-180 €, pas 800-3000 €. Voici les tarifs honnêtes 2026, les 5 signes qui trahissent
              une arnaque, et les recours si on vous a sur-facturé.
            </p>
          </header>

          <TldrBlock bullets={tldr} />

          <div className="not-prose border border-rose-200 bg-rose-50 rounded-lg p-4 my-6 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" aria-hidden />
            <div className="text-sm text-rose-900">
              <p className="font-semibold m-0 mb-1">Avant d’appeler un serrurier :</p>
              <ol className="m-0 pl-4 space-y-0.5">
                <li>Vérifiez votre contrat habitation (assistance dépannage incluse ?).</li>
                <li>Appelez d’abord le numéro assistance de votre assureur.</li>
                <li>Si pas d’assistance : comparez 2 serruriers locaux par téléphone.</li>
                <li>Exigez un devis écrit AVANT intervention.</li>
                <li>Refusez le paiement cash, préférez carte ou virement.</li>
              </ol>
            </div>
          </div>

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Tarifs serrurier honnêtes 2026</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Situation</th>
                    <th className="p-3 border-b border-sand-200">Prix journée</th>
                    <th className="p-3 border-b border-sand-200">Prix nuit/WE</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Porte claquée (pêne demi-tour)', '80-180 €', '150-280 €'],
                    ['Porte fermée à clé — 1 point', '150-280 €', '220-380 €'],
                    ['Porte fermée — 3 à 5 points', '180-350 €', '280-450 €'],
                    ['Porte blindée + cylindre A2P 3*', '350-600 €', '450-800 €'],
                    ['Remplacement cylindre standard', '150-280 €', '220-380 €'],
                    ['Remplacement cylindre A2P', '280-500 €', '380-650 €'],
                    ['Remplacement serrure complète', '350-750 €', '500-950 €'],
                  ].map(([s, j, n]) => (
                    <tr key={s} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{s}</td>
                      <td className="p-3 font-semibold">{j}</td>
                      <td className="p-3 font-semibold">{n}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2>Les 5 arnaques serrurier classiques</h2>
            <ol>
              <li>
                <strong>La facture gonflée par pièces fictives.</strong> Le serrurier facture 600 €
                de « blindage », « goupilles renforcées », « kit anti-perçage » sans poser la
                moindre pièce. Exiger preuves photos et détail par pièce.
              </li>
              <li>
                <strong>La casse volontaire.</strong> Au lieu d’ouvrir au crochet (5 min), le
                serrurier prétend « devoir casser la serrure » pour facturer 500 € de remplacement.
                Un vrai pro ouvre sans casse dans 95 % des cas.
              </li>
              <li>
                <strong>Le tarif annoncé au téléphone non respecté.</strong> « 80 € » devient « 580
                € » une fois la porte ouverte. Toujours exiger devis ÉCRIT avant intervention.
              </li>
              <li>
                <strong>Le paiement cash imposé.</strong> « Plus simple, pas de TVA ». En réalité
                c’est pour blanchir et empêcher toute opposition bancaire. Refuser systématiquement.
              </li>
              <li>
                <strong>Le faux numéro local.</strong> Numéro 09 72 xx affiché comme « votre
                serrurier de quartier » mais qui redirige vers un call-center national. Google
                l’adresse : pas de boutique physique = fuir.
              </li>
            </ol>

            <h2>Méthodes d’ouverture sans casse (par un pro)</h2>
            <ul>
              <li>
                <strong>Carte plastique</strong> (pêne demi-tour non armé) : 2-5 min, zéro dégât.
                Technique de base d’un serrurier.
              </li>
              <li>
                <strong>Crochetage</strong> (serrures à goupilles classiques) : 5-15 min, nécessite
                outil pick + tension wrench et expérience.
              </li>
              <li>
                <strong>Bumping</strong> (clé à percussion) : rapide mais risque d’usure goupilles,
                moins pratiqué.
              </li>
              <li>
                <strong>Radiographie au rayon X portable</strong> : pour serrures haut-de-gamme A2P
                ** ou ***, usage rare et coûteux.
              </li>
            </ul>

            <div className="not-prose border border-emerald-200 bg-emerald-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-emerald-900 m-0">
                <strong>Astuce anti-claquage.</strong> Installez un double chez un voisin ou un
                proche. Laissez une clé de secours dans un coffre à code fixé au mur (modèle Master
                Lock ~25 €). Cela vous épargne 150-400 € et 3 heures d’attente à chaque incident.
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
              href="/services/serrurier"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Trouver un serrurier <Phone className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
