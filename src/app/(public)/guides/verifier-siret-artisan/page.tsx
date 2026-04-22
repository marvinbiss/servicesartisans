import type { Metadata } from 'next'
import Link from 'next/link'
import { Search, ShieldCheck, AlertTriangle, FileCheck, Building2, ArrowRight } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema, getHowToSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'verifier-siret-artisan'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Claire Dubois'

export const revalidate = 86400

const TITLE = 'Vérifier SIRET artisan : méthode 2026'
const DESCRIPTION =
  'Vérifier SIRET artisan en 3 min : Annuaire Entreprises, INSEE Sirene, Infogreffe. Activité, statut actif, date de création, signaux d’alerte.'

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
  'Demandez le numéro SIRET à 14 chiffres avant toute signature de devis.',
  'Vérifiez-le gratuitement sur annuaire-entreprises.data.gouv.fr (source officielle INSEE).',
  'Contrôlez : état actif, code NAF cohérent avec le métier, date de création, adresse, effectif.',
  'Une entreprise radiée, en procédure collective ou avec un NAF incohérent = signal d’alerte fort.',
  'Sur ServicesArtisans, chaque fiche artisan est déjà rattachée à un SIRET issu de la base SIRENE officielle.',
]

const howToSteps = [
  {
    name: 'Demander le SIRET à l’artisan',
    text: "Avant signature du devis, demandez le numéro SIRET à 14 chiffres. Il doit figurer sur le devis, les factures, la carte de visite professionnelle et sur l'attestation décennale. Le refus de communiquer ce numéro est une alerte immédiate.",
  },
  {
    name: 'Interroger l’Annuaire des Entreprises',
    text: "Rendez-vous sur annuaire-entreprises.data.gouv.fr (service public officiel exploitant les données INSEE Sirene). Collez le numéro SIRET ou le nom de l'entreprise dans la barre de recherche. Le résultat est gratuit et instantané.",
  },
  {
    name: 'Vérifier l’état administratif',
    text: "La fiche doit afficher « Entreprise active ». Les mentions « cessée », « radiée » ou « en procédure collective » signifient que l'entreprise ne peut plus légalement exercer. Refusez tout engagement dans ce cas.",
  },
  {
    name: 'Contrôler le code NAF (APE)',
    text: "Le code NAF précise l'activité déclarée. Pour un plombier, attendez un code 43.22A. Pour un électricien, 43.21A. Un artisan peintre qui déclare « conseil en stratégie » ou « holding » cache son activité réelle : c'est une alerte.",
  },
  {
    name: 'Vérifier la date de création et l’effectif',
    text: "Une entreprise créée il y a moins de 6 mois mérite prudence redoublée (pas d'historique, peu de références vérifiables). Vérifiez que l'effectif déclaré est cohérent avec la taille du chantier annoncé.",
  },
  {
    name: 'Croiser avec le recouvrement RGE ou décennale si nécessaire',
    text: "Pour un chantier éligible aux aides (MaPrimeRénov', CEE), vérifiez aussi la qualification RGE sur france-renov.gouv.fr. Pour un chantier de gros œuvre, exigez l'attestation décennale à jour, mentionnant le SIRET contrôlé.",
  },
]

const faqs = [
  {
    question: 'Le SIRET est-il obligatoire sur un devis d’artisan ?',
    answer:
      "Oui. L'article R123-237 du Code de commerce impose à toute entreprise d'indiquer son numéro SIREN (ou SIRET de l'établissement) sur ses devis, factures, bons de commande et correspondances professionnelles. L'absence du SIRET est un indice fort qu'il ne s'agit pas d'une entreprise régulièrement immatriculée.",
  },
  {
    question: 'Comment différencier SIRET et SIREN ?',
    answer:
      "Le SIREN (9 chiffres) identifie l'entreprise. Le SIRET (14 chiffres) identifie un établissement précis de cette entreprise : SIRET = SIREN + 5 chiffres du NIC (numéro interne de classement). Une entreprise a un seul SIREN mais peut avoir plusieurs SIRET si elle a plusieurs établissements. Pour un contrôle, le SIRET est plus précis car il confirme que l'établissement où l'activité est exercée est lui-même actif.",
  },
  {
    question: 'Que faire si l’artisan refuse de communiquer son SIRET ?',
    answer:
      "Refusez de signer le devis. Le refus de communiquer le SIRET est un signal d'alerte majeur : soit l'activité n'est pas déclarée (travail dissimulé, sanctionné par l'article L8221-1 du Code du travail), soit l'entreprise est dans une situation irrégulière. Dans les deux cas, vous perdez la couverture décennale, la TVA récupérable et les aides à la rénovation.",
  },
  {
    question: 'Un auto-entrepreneur a-t-il un SIRET ?',
    answer:
      "Oui. Tout micro-entrepreneur (ex-auto-entrepreneur) reçoit un SIRET lors de son immatriculation au Répertoire des Entreprises et des Établissements (INSEE). Un SIRET valide chez un micro-entrepreneur signifie que l'activité est déclarée. Vérifiez toutefois que le plafond de chiffre d'affaires (77 700 € HT en services, 188 700 € HT en vente — seuils 2026) reste compatible avec l'ampleur du chantier : un gros œuvre à 80 000 € dépasse le cadre de la micro-entreprise.",
  },
  {
    question: 'Comment vérifier qu’un artisan a bien la décennale ?',
    answer:
      "Demandez l'attestation d'assurance décennale en cours de validité, émise par l'assureur. Elle doit porter le SIRET de l'artisan, la date d'ouverture du chantier comprise dans la période couverte, et la liste des activités garanties cohérente avec les travaux commandés. Vous pouvez appeler l'assureur directement (numéro sur l'attestation) pour confirmer la validité du contrat.",
  },
  {
    question: 'Peut-on vérifier le SIRET d’un artisan étranger intervenant en France ?',
    answer:
      "Une entreprise étrangère qui intervient durablement en France doit s'immatriculer en France et obtenir un SIRET. Pour un détachement ponctuel (directive 96/71/CE), l'entreprise doit figurer sur la plateforme SIPSI du Ministère du Travail. Exigez soit un SIRET français, soit une attestation SIPSI valide, plus une assurance décennale couvrant le territoire français.",
  },
  {
    question: 'Le SIRET garantit-il la qualité du travail ?',
    answer:
      "Non. Le SIRET prouve uniquement que l'entreprise existe légalement. Il ne garantit pas la compétence, la qualité d'exécution ou le sérieux. Combinez cette vérification avec : consultation des avis clients vérifiés, demande de 3 références récentes, vérification des qualifications (RGE, Qualibat, Qualifelec selon le métier) et comparaison de 3 devis détaillés.",
  },
  {
    question: 'Les données SIRET sont-elles fiables et à jour ?',
    answer:
      "Oui. L'Annuaire des Entreprises (annuaire-entreprises.data.gouv.fr) s'appuie directement sur la base SIRENE de l'INSEE, mise à jour quotidiennement à partir des déclarations légales (création, modification, radiation). Le délai entre une modification déclarée et son apparition dans l'annuaire est généralement de 24 à 72 h.",
  },
]

const sources = [
  {
    label: 'Annuaire des Entreprises (data.gouv.fr)',
    url: 'https://annuaire-entreprises.data.gouv.fr',
    note: 'Service public officiel — données SIRENE INSEE',
  },
  {
    label: 'INSEE Sirene — Référentiel des entreprises',
    url: 'https://www.sirene.fr',
    note: 'Base légale des SIRET français',
  },
  {
    label: 'Code de commerce, art. R123-237 (mentions obligatoires)',
    url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000035624149',
  },
  {
    label: 'France Rénov’ — Annuaire officiel RGE',
    url: 'https://france-renov.gouv.fr/annuaire-rge',
    note: 'Vérification complémentaire pour chantiers aidés',
  },
  {
    label: 'Ministère du Travail — SIPSI (détachement)',
    url: 'https://www.sipsi.travail.gouv.fr',
  },
]

const relatedGuides = [
  {
    label: 'Éviter les arnaques d’artisans : 10 signaux à connaître',
    href: '/guides/eviter-arnaques-artisan',
  },
  {
    label: 'Garantie décennale : tout comprendre en 2026',
    href: '/guides/garantie-decennale',
  },
  {
    label: 'Comment reconnaître un artisan RGE',
    href: '/guides/artisan-rge',
  },
  {
    label: 'Assurance dommage-ouvrage : guide complet',
    href: '/guides/assurance-dommage-ouvrage',
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
    section: 'Choisir un artisan',
    keywords: [
      'SIRET artisan',
      'vérifier SIRET',
      'annuaire entreprises',
      'éviter arnaque artisan',
      'SIREN',
    ],
  })

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Vérifier le SIRET d’un artisan', url: `/guides/${SLUG}` },
  ])

  const faqSchema = getFAQSchema(faqs)
  const howToSchema = getHowToSchema(howToSteps, {
    name: 'Vérifier le SIRET d’un artisan en 6 étapes',
    description:
      'Méthode officielle pour contrôler la légalité et le sérieux d’un artisan avant signature de devis.',
    totalTime: 'PT3M',
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
            items={[
              { label: 'Guides', href: '/guides' },
              { label: 'Vérifier le SIRET d’un artisan' },
            ]}
            className="mb-6"
          />

          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden />
              Choisir un artisan · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Comment vérifier le SIRET d’un artisan en 2026
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Vérifier le SIRET prend trois minutes et prouve qu’une entreprise existe légalement.
              C’est la toute première brique de confiance avant n’importe quel devis. Ce guide
              détaille la méthode officielle via l’Annuaire des Entreprises, les signaux d’alerte à
              repérer et les contrôles complémentaires selon le type de chantier.
            </p>
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Qu’est-ce que le SIRET et pourquoi il est la première preuve de sérieux</h2>
            <p>
              Le SIRET (<em>Système d’Identification du Répertoire des Établissements</em>) est un
              numéro unique à 14 chiffres attribué par l’INSEE à chaque établissement d’une
              entreprise française. Il est composé du SIREN (9 chiffres identifiant l’entreprise)
              suivi d’un NIC (5 chiffres identifiant l’établissement). Toute entreprise
              régulièrement immatriculée en France en possède un, y compris les micro-entrepreneurs.
            </p>
            <p>
              Vérifier le SIRET, c’est s’assurer en quelques clics que l’entreprise&nbsp;: existe,
              est active à ce jour, exerce bien l’activité pour laquelle vous la sollicitez, et
              n’est pas en procédure collective. Aucune autre étape de sélection — avis clients,
              recommandations, devis — n’a de valeur si l’entreprise n’existe pas légalement.
            </p>

            <h2>La méthode officielle en 6 étapes</h2>
            <ol>
              {howToSteps.map((step, i) => (
                <li key={i}>
                  <strong>{step.name}.</strong> {step.text}
                </li>
              ))}
            </ol>

            <h2>Les 5 signaux d’alerte à repérer sur la fiche SIRENE</h2>
            <p>
              La fiche publique de l’Annuaire des Entreprises donne, gratuitement et en une page,
              tous les éléments nécessaires pour détecter une situation irrégulière. Cinq motifs
              justifient de refuser d’engager tout chantier&nbsp;:
            </p>
            <ul>
              <li>
                <strong>Entreprise cessée ou radiée.</strong> L’activité est juridiquement arrêtée.
                Aucun devis n’est opposable, aucune assurance ne couvre.
              </li>
              <li>
                <strong>Procédure collective en cours</strong> (sauvegarde, redressement,
                liquidation). Les paiements versés sont à risque, les garanties peuvent disparaître.
              </li>
              <li>
                <strong>Code NAF incohérent avec le métier annoncé.</strong> Un « plombier »
                enregistré sous un code conseil ou holding cache probablement une activité non
                déclarée.
              </li>
              <li>
                <strong>Création très récente sans historique vérifiable.</strong> Une entreprise de
                moins de 6 mois n’est pas illégale, mais toute promesse d’expérience longue doit
                être démontrée par ailleurs (CV du dirigeant, références antérieures).
              </li>
              <li>
                <strong>Effectif déclaré incohérent avec la taille du chantier.</strong> Un SIRET
                affichant 0 salarié qui propose une rénovation lourde en un mois sous-traite ou
                exerce dans l’illégalité.
              </li>
            </ul>

            <h2>Contrôles complémentaires selon le type de chantier</h2>
            <p>
              La vérification SIRET est nécessaire mais rarement suffisante. Selon la nature du
              chantier, complétez par les contrôles suivants&nbsp;:
            </p>
            <ul>
              <li>
                <strong>Chantier éligible à MaPrimeRénov’ ou aux CEE.</strong> Vérifiez la
                qualification RGE de l’entreprise sur{' '}
                <a href="https://france-renov.gouv.fr/annuaire-rge" target="_blank" rel="noopener">
                  france-renov.gouv.fr
                </a>
                . La qualification doit couvrir précisément le geste (pompe à chaleur, isolation,
                etc.) et être valide à la date de signature du devis.
              </li>
              <li>
                <strong>Gros œuvre, charpente, étanchéité, installations intégrées.</strong> Exigez
                l’attestation d’assurance décennale à jour, avec le SIRET vérifié et la liste des
                activités garanties cohérente avec les travaux commandés.
              </li>
              <li>
                <strong>Plomberie gaz.</strong> L’entreprise doit être titulaire de l’appellation
                Professionnel Gaz (PG) délivrée par Qualigaz.
              </li>
              <li>
                <strong>Borne IRVE (recharge véhicule électrique).</strong> La pose doit être
                confiée à un électricien qualifié Qualifelec IRVE.
              </li>
            </ul>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Building2 className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Sur ServicesArtisans, la vérification SIRET est déjà faite
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Chaque fiche artisan est rattachée à un SIRET issu de la base officielle SIRENE.
                    Les statuts administratifs (actif, cessé, procédure collective) sont
                    synchronisés régulièrement.
                  </p>
                  <Link
                    href="/artisans"
                    className="inline-flex items-center gap-1.5 text-primary-700 font-semibold hover:underline"
                  >
                    Rechercher un artisan vérifié <ArrowRight className="w-4 h-4" aria-hidden />
                  </Link>
                </div>
              </div>
            </div>

            <h2>Travail dissimulé : ce que vous risquez sans vérification</h2>
            <p>
              Faire exécuter des travaux par une entreprise sans SIRET, ou dont le SIRET est radié,
              constitue un recours au travail dissimulé. Le donneur d’ordre est personnellement
              responsable si le dispositif n’a pas exercé de diligence (art. L8222-1 à L8222-6 du
              Code du travail). Concrètement, vous perdez&nbsp;:
            </p>
            <ul>
              <li>la garantie décennale et la responsabilité civile professionnelle&nbsp;;</li>
              <li>la possibilité de récupérer la TVA&nbsp;;</li>
              <li>le droit aux aides à la rénovation (MaPrimeRénov’, CEE, éco-PTZ)&nbsp;;</li>
              <li>
                le recours judiciaire en cas de malfaçon (entreprise introuvable, insolvable ou
                fictive).
              </li>
            </ul>
            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>Rappel légal.</strong> Le paiement en espèces au-delà de 1 000&nbsp;€ est
                interdit entre un professionnel et un particulier (art. L112-6 du Code monétaire et
                financier). Toute demande de règlement cash sur un montant supérieur est une alerte
                immédiate.
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

          <div className="bg-primary-700 text-white rounded-xl p-6 md:p-8 text-center my-10">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-90" aria-hidden />
            <h2 className="font-heading text-2xl font-bold mb-2">
              Pas envie de tout vérifier vous-même ?
            </h2>
            <p className="text-primary-100 mb-5 max-w-xl mx-auto">
              Nos artisans référencés sont tous rattachés à un SIRET actif vérifié. Décrivez votre
              projet, vous recevez jusqu’à 3 devis gratuits sous 24 h.
            </p>
            <Link
              href="/devis"
              className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-6 py-3 rounded-lg hover:bg-primary-50 transition-colors"
            >
              Demander un devis gratuit <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
          </div>

          <div className="flex items-center justify-between text-sm text-sand-600 border-t border-sand-200 pt-4">
            <Link href="/guides" className="inline-flex items-center gap-1 hover:text-primary-700">
              ← Tous les guides
            </Link>
            <Link
              href="/artisans"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Annuaire artisans vérifiés <FileCheck className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
