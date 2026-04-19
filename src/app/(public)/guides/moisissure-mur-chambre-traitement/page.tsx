import type { Metadata } from 'next'
import Link from 'next/link'
import { Droplets, AlertTriangle, ArrowRight, CheckCircle2, Wrench, Wind } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema, getHowToSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'moisissure-mur-chambre-traitement'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Thomas Bernard'

export const revalidate = 86400

const TITLE = 'Moisissure mur chambre : traitement durable et priorité sanitaire'
const DESCRIPTION =
  'Moisissure sur un mur de chambre : risques sanitaires, nettoyage immédiat, traitement définitif (ventilation, isolation, humidité). Protocole pas à pas et budgets 2026.'

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
    authors: [`${SITE_URL}/equipe/thomas-bernard`],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
}

const tldr = [
  'La moisissure dans une chambre est une priorité sanitaire (sommeil = exposition 8 h/jour).',
  'Nettoyer sans traiter la cause = retour sous 2-4 semaines.',
  'Cause #1 : ventilation insuffisante + mur froid (condensation).',
  'Protocole : EPI (gants + masque FFP3), nettoyage fongicide, séchage, diagnostic cause, traitement.',
  'Durée hors présence : 24-48 h après nettoyage, plus si vulnérable (bébé, asthme, immunodéprimé).',
]

const howToSteps = [
  {
    name: 'Protéger et isoler avant d’intervenir',
    text: 'Retirez literie, textiles et meubles bois non lavables de la pièce (stockez-les ailleurs, exposition au soleil ou lavage haute température pour désinfection). Fermez la pièce, ouvrez les fenêtres pour ventilation. Enfilez masque FFP3, lunettes, gants nitrile, vêtements qui seront lavés à 60 °C. Les spores sont sensibilisantes : ne jamais intervenir sans EPI, surtout pour femmes enceintes, personnes asthmatiques ou immunodéprimées.',
  },
  {
    name: 'Aspirer les spores sèches au préalable',
    text: "Avant tout nettoyage humide, passez un aspirateur équipé d'un filtre HEPA (H13) sur la zone et les alentours. Un aspirateur sans filtre HEPA projette les spores dans toute la pièce : évitez. Pas d'aspirateur HEPA ? Brossez délicatement avec une brosse souple dans un sac poubelle fermé, éliminez le sac immédiatement.",
  },
  {
    name: 'Appliquer un fongicide adapté',
    text: "Solution recommandée : produit fongicide du commerce (type anti-moisissure concentré) ou solution eau de Javel diluée 1:4 (1 volume javel pour 4 volumes d'eau). Appliquez au pulvérisateur, laissez agir 15-30 minutes, frottez doucement avec brosse ou éponge, rincez à l'eau claire. Ne mélangez JAMAIS javel et ammoniaque ou produit acide (vapeurs toxiques).",
  },
  {
    name: 'Sécher intégralement la paroi',
    text: "Après rinçage, laissez sécher 24 à 72 h : ventilation forte, déshumidificateur si disponible (location possible à 30-50 €/jour), chauffage doux si en hiver. Un mur qui reste humide après nettoyage reverra la moisissure en 2-3 semaines. Mesurez l'humidité avec un humidimètre avant toute finition.",
  },
  {
    name: 'Diagnostiquer la cause profonde',
    text: "Une moisissure n'est jamais causée par la malchance : elle résulte d'humidité + nutriments + température. La cause est : (1) condensation sur paroi froide (pont thermique, mur extérieur non isolé), (2) ventilation insuffisante (pas de VMC, fenêtres jamais ouvertes, grille d'aération bouchée), (3) fuite ou infiltration cachée. Identifiez-la ou elle reviendra.",
  },
  {
    name: 'Traiter la cause et les finitions',
    text: "Ventilation : vérifier VMC, installer VMC hygroréglable si absente (800-1 500 €) ou VMC double flux pour isolation thermique (2 500-5 000 €). Paroi froide : isoler intérieur ou extérieur (30-200 €/m²). Infiltration : diagnostic humidité professionnel (150-400 €). Avant finition, une sous-couche anti-moisissure (20-40 €/pot 2,5 L) puis peinture acrylique perméable à la vapeur (pas de vinyle étanche qui bloque l'humidité).",
  },
]

const faqs = [
  {
    question: 'La moisissure dans une chambre est-elle dangereuse ?',
    answer:
      "Oui. Selon l'ANSES (Agence nationale de sécurité sanitaire, rapport 2016), l'exposition chronique aux moisissures domestiques est associée à des risques accrus de rhinites allergiques, asthme, infections respiratoires et irritations oculaires. Les enfants en bas âge, femmes enceintes et personnes immunodéprimées sont particulièrement exposés. Un mur moisi noir (stachybotrys chartarum, « moisissure noire ») produit des mycotoxines : éviction immédiate de la chambre recommandée, traitement prioritaire.",
  },
  {
    question: 'Peut-on dormir dans une chambre avec de la moisissure ?',
    answer:
      "À éviter. L'exposition de 7-9 h par nuit concentre les symptômes. Pour un adulte en bonne santé : quelques jours sans conséquences notables, puis toux, irritation, fatigue matinale, rhume persistant. Pour bébé, asthmatique ou immunodéprimé : éviction immédiate. Si aucune autre chambre n'est disponible, installez un purificateur d'air HEPA (150-400 €), ventilez continuellement, et traitez en urgence.",
  },
  {
    question: 'Quels produits naturels efficaces contre la moisissure ?',
    answer:
      "Le vinaigre blanc est modérément efficace (tue environ 80 % des moisissures courantes selon études microbio). L'huile essentielle de tea tree (20 gouttes / 500 ml eau) a une action fongicide démontrée mais limitée dans le temps. Pour une intervention rapide et fiable, la javel diluée (1:4) ou un fongicide du commerce restent les plus efficaces. Quels que soient les produits, ils ne règlent rien sans traitement de la cause.",
  },
  {
    question: 'Faut-il refaire le placo si la moisissure est profonde ?',
    answer:
      'Oui si la moisissure a pénétré dans le support. Un placoplâtre imprégné en profondeur est un foyer permanent : les spores survivent même après séchage apparent. Repérage : grattez 1-2 mm en surface. Si la tache reste, ou si le placo est mou au toucher, il faut déposer la zone et la remplacer (50-150 €/m² placoplâtre hydrofuge posé). Même sur un mur en plâtre traditionnel, un décroûtage + enduit neuf peut être nécessaire au-delà de 5 mm de pénétration.',
  },
  {
    question: 'L’assurance couvre-t-elle le traitement de la moisissure ?',
    answer:
      "Rarement. L'assurance habitation couvre un dégât des eaux accidentel ayant provoqué moisissure, sous franchise. Elle ne couvre pas la moisissure due à défaut de ventilation ou d'isolation (exclue en défaut d'entretien). En location, le propriétaire est tenu de fournir un logement décent (art. 1719 Code civil) avec ventilation fonctionnelle ; si la moisissure provient d'un vice de construction, vous pouvez exiger les travaux.",
  },
  {
    question: 'Moisissure dans un logement locatif : qui paie ?',
    answer:
      "Dépend de la cause. Vice de construction (pas de VMC, toiture infiltrée, mur mal isolé) : propriétaire (art. 1720 Code civil — délivrance d'un logement décent, décret 2002-120). Défaut d'entretien courant locataire (pas d'aération, chauffage éteint permanent, linge séché à l'intérieur sans VMC) : locataire. En cas de désaccord : saisissez la Commission départementale de conciliation, gratuit. Entretenir les écrits (lettres recommandées) dès la constatation.",
  },
  {
    question: 'Combien de temps la moisissure met-elle pour disparaître ?',
    answer:
      'Après nettoyage + traitement de la cause : les taches visibles partent en une intervention. La récidive est le vrai test. Si après 3 mois la paroi reste propre et sèche : la cause est bien traitée. Si des taches réapparaissent dans les semaines qui suivent : diagnostic incomplet, il reste une cause non identifiée (souvent ventilation).',
  },
  {
    question: 'Quel budget prévoir pour un traitement complet ?',
    answer:
      'Trois scénarios. (1) Nettoyage + VMC hygroréglable (si cause = ventilation) : 800 à 1 500 €. (2) Nettoyage + isolation paroi + peinture acrylique : 2 000 à 6 000 € pour une chambre. (3) Cas sévère avec placo à remplacer, isolation complète et refonte VMC : 5 000 à 12 000 €. À ces montants, ajoutez ~400 € si diagnostic humidité professionnel nécessaire.',
  },
]

const sources = [
  {
    label: 'ANSES — Moisissures dans l’habitat : effets sur la santé (2016)',
    url: 'https://www.anses.fr/fr/content/moisissures-dans-le-bâti',
  },
  {
    label: 'ADEME — Qualité de l’air intérieur et ventilation',
    url: 'https://librairie.ademe.fr',
  },
  {
    label: 'Décret n°2002-120 du 30 janvier 2002 (logement décent)',
    url: 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000593196',
  },
  {
    label: 'INRS — Protection individuelle lors du nettoyage de moisissures',
    url: 'https://www.inrs.fr',
  },
]

const relatedGuides = [
  {
    label: 'Humidité mur intérieur : causes et solutions',
    href: '/guides/humidite-mur-interieur-solution',
  },
  { label: 'Isolation thermique : guide complet', href: '/guides/isolation-thermique' },
  { label: 'Rénovation de toiture', href: '/guides/renovation-toiture' },
  { label: 'Comment demander un devis de travaux', href: '/guides/comment-faire-devis-travaux' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Problèmes d’habitat',
    keywords: [
      'moisissure mur chambre',
      'traitement moisissure',
      'enlever moisissure',
      'moisissure noire',
      'mur moisi',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Moisissure mur chambre', url: `/guides/${SLUG}` },
  ])
  const faqSchema = getFAQSchema(faqs)
  const howToSchema = getHowToSchema(howToSteps, {
    name: 'Traiter la moisissure sur un mur de chambre en 6 étapes',
    description:
      'Protocole complet nettoyage + traitement définitif de la moisissure, avec protections sanitaires.',
    totalTime: 'PT2H',
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Moisissure mur chambre' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Droplets className="w-3.5 h-3.5" aria-hidden />
              Problèmes d’habitat · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Moisissure mur chambre : traitement durable et priorité sanitaire
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Des taches noires ou verdâtres apparaissent près de la tête de lit, une odeur de moisi
              persiste malgré les aérations — une moisissure dans une chambre est d’abord un enjeu
              de santé avant d’être un problème esthétique. Le simple nettoyage sans identification
              de la cause garantit le retour sous quelques semaines. Voici un protocole
              complet&nbsp;: protection, nettoyage, diagnostic puis traitement définitif.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Pourquoi une moisissure apparaît dans une chambre</h2>
            <p>
              Trois conditions doivent être réunies&nbsp;: humidité (&gt;70 % HR prolongée),
              nutriments (poussière, colle papier peint, matières organiques) et température (16-28
              °C). Une chambre en remplit souvent deux dans le cycle respiration-condensation
              nocturne&nbsp;: un dormeur rejette 300-500 ml d’eau par nuit en respiration et
              transpiration. Sans ventilation, cette humidité se condense sur les parois froides
              (angles, mur extérieur mal isolé, derrière tête de lit collée contre le mur).
            </p>

            <h2>Protocole de nettoyage et traitement, pas à pas</h2>
            <ol>
              {howToSteps.map((s, i) => (
                <li key={i}>
                  <strong>{s.name}.</strong> {s.text}
                </li>
              ))}
            </ol>

            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>Attention.</strong> Pour une moisissure couvrant plus de 1 m², de couleur
                noire, ou présente plusieurs endroits dans le logement, ne traitez pas
                vous-même&nbsp;: faites appel à une entreprise spécialisée. L’exposition aux spores
                stachybotrys en grande quantité sans protection professionnelle peut provoquer des
                symptômes sévères.
              </p>
            </div>

            <h2>Les 4 causes fréquentes dans les chambres</h2>
            <ul>
              <li>
                <strong>Ventilation absente ou bouchée.</strong> Pas de VMC, grilles de façade
                obstruées par meubles, porte de chambre systématiquement fermée la nuit avec bas de
                porte étanche. Une chambre a besoin d’au moins 25 m³/h d’extraction d’air (règles
                DTU).
              </li>
              <li>
                <strong>Pont thermique en angle ou mur extérieur non isolé.</strong> Dans les
                logements anciens, les angles extérieurs sont des points froids où la condensation
                se dépose en priorité. Solution&nbsp;: isolation intérieure (30-80 €/m²) ou
                extérieure (80-200 €/m²).
              </li>
              <li>
                <strong>Chauffage éteint la nuit.</strong> Un écart trop marqué jour/nuit (19 °C →
                14 °C) fait chuter la température des parois extérieures et provoque la
                condensation. Maintenez 17-18 °C la nuit.
              </li>
              <li>
                <strong>Sources d’humidité évitables.</strong> Linge mouillé séché dans la chambre
                (10-15 litres d’eau évaporés), aquarium non couvert, plantes nombreuses,
                humidificateur dédié à rhume non arrêté après guérison.
              </li>
            </ul>

            <h2>Budget récapitulatif</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Intervention</th>
                    <th className="p-3 border-b border-sand-200">Fourchette</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-sand-100">
                    <td className="p-3">Nettoyage DIY + produits EPI</td>
                    <td className="p-3">30 à 80 €</td>
                  </tr>
                  <tr className="border-b border-sand-100">
                    <td className="p-3">Nettoyage professionnel (pièce 12-15 m²)</td>
                    <td className="p-3">250 à 600 €</td>
                  </tr>
                  <tr className="border-b border-sand-100">
                    <td className="p-3">VMC hygroréglable installée</td>
                    <td className="p-3">800 à 1 500 €</td>
                  </tr>
                  <tr className="border-b border-sand-100">
                    <td className="p-3">VMC double flux avec récupérateur</td>
                    <td className="p-3">2 500 à 5 000 €</td>
                  </tr>
                  <tr className="border-b border-sand-100">
                    <td className="p-3">Isolation intérieure chambre (12 m² paroi)</td>
                    <td className="p-3">1 000 à 3 000 €</td>
                  </tr>
                  <tr>
                    <td className="p-3">Diagnostic humidité professionnel (si cas complexe)</td>
                    <td className="p-3">150 à 400 €</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>Check-list après traitement</h2>
            <ul className="not-prose space-y-2">
              {[
                'Taux d’humidité mesuré <60 % HR en conditions normales',
                'Pas de trace visible 3 mois après traitement',
                'VMC fonctionnelle contrôlée (feuille collée à la bouche = aspirée)',
                'Meubles à ≥10 cm du mur pour permettre la circulation d’air',
                'Chauffage maintenu ≥17 °C la nuit en hiver',
                'Aération 10 min matin et soir même en hiver',
              ].map((c) => (
                <li key={c} className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" aria-hidden />
                  <span>{c}</span>
                </li>
              ))}
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

          <div className="bg-primary-700 text-white rounded-xl p-6 md:p-8 text-center my-10">
            <Wind className="w-10 h-10 mx-auto mb-3 opacity-90" aria-hidden />
            <h2 className="font-heading text-2xl font-bold mb-2">
              Traiter la moisissure définitivement
            </h2>
            <p className="text-primary-100 mb-5 max-w-xl mx-auto">
              Trouvez un professionnel (plombier, chauffagiste, entreprise humidité) vérifié près de
              chez vous. Diagnostic et devis gratuits.
            </p>
            <Link
              href="/devis"
              className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-6 py-3 rounded-lg hover:bg-primary-50 transition-colors"
            >
              <Wrench className="w-4 h-4" aria-hidden /> Demander un devis
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
