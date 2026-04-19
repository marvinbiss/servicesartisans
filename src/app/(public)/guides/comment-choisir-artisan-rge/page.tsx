import type { Metadata } from 'next'
import Link from 'next/link'
import { ShieldCheck, Award, AlertTriangle, ArrowRight, CheckCircle2, Leaf } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema, getHowToSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'comment-choisir-artisan-rge'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Claire Dubois'

export const revalidate = 86400

const TITLE = 'Comment choisir un artisan RGE en 2026 : méthode et pièges'
const DESCRIPTION =
  'Méthode complète pour choisir un artisan RGE fiable : vérification ADEME, qualification par geste (QualiPAC, Qualibat, Qualifelec, QualiSol), signaux d’alerte et comparaison de devis.'

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
  'Un artisan RGE doit détenir une qualification précise pour le geste commandé (QualiPAC pour PAC, Qualibat 7131 pour ITE, Qualifelec IRVE pour bornes, etc.).',
  'Vérifiez la qualification sur france-renov.gouv.fr/annuaire-rge — base officielle ADEME mise à jour mensuellement.',
  'La qualification doit être valide à la date de signature du devis ET à la date des travaux.',
  'Un devis RGE doit mentionner : SIRET, numéro et organisme de qualification, période de validité, geste couvert.',
  'Pas de RGE = pas de MaPrimeRénov’, pas de CEE, TVA 10 ou 20 % au lieu de 5,5 %.',
]

const howToSteps = [
  {
    name: 'Identifier la qualification RGE nécessaire pour votre chantier',
    text: "Chaque geste de rénovation énergétique correspond à une qualification RGE précise. Pompe à chaleur air-eau : QualiPAC module CET + PAC. Isolation thermique par l'extérieur : Qualibat 7131. Isolation des combles : Qualibat 7141. Fenêtres : Qualibat 3521 ou 3522. Panneaux solaires : QualiPV. Borne IRVE : Qualifelec IRVE. Un artisan RGE « généraliste » n'existe pas : il est qualifié pour un ou plusieurs gestes précis.",
  },
  {
    name: 'Vérifier la qualification sur l’annuaire officiel ADEME',
    text: "Rendez-vous sur france-renov.gouv.fr/annuaire-rge. Recherchez par SIRET, raison sociale ou code postal. La fiche officielle indique : les qualifications détenues, les gestes couverts, la date de validité, l'organisme de certification. Une qualification expirée = aucun droit aux aides, même si le site de l'artisan affiche le logo RGE.",
  },
  {
    name: 'Contrôler le SIRET et la solidité juridique',
    text: "La qualification RGE ne remplace pas la vérification SIRET. Contrôlez sur annuaire-entreprises.data.gouv.fr : entreprise active, NAF cohérent (43.22A plombier, 43.21A électricien, 43.99B travaux d'étanchéité), ancienneté, effectif. La combinaison RGE valide + SIRET actif + décennale à jour est la triple preuve de sérieux.",
  },
  {
    name: 'Demander la décennale RGE',
    text: "L'attestation d'assurance décennale doit couvrir précisément le geste RGE commandé. Un artisan QualiPAC qui pose une pompe à chaleur sans activité « chauffage » dans sa décennale n'est pas couvert : vous perdez la garantie de 10 ans en cas de sinistre. Exigez l'attestation à jour, mentionnant l'activité pompes à chaleur, chauffage, etc., avec le SIRET contrôlé.",
  },
  {
    name: 'Comparer 3 devis RGE détaillés',
    text: "Sur un chantier aidé, le devis doit : appliquer la TVA 5,5 %, préciser le numéro et l'organisme de qualification RGE, détailler les matériaux (références, R thermique, COP pour PAC), ventiler main-d'œuvre et fournitures, mentionner l'aide MaPrimeRénov' ou CEE que l'artisan a intégrée si tiers-financement.",
  },
  {
    name: 'Vérifier les références et avis sur le geste précis',
    text: "Un artisan QualiPAC qualifié en pompe à chaleur peut avoir des références faibles sur l'isolation. Demandez 3 chantiers récents sur le geste qui vous intéresse, avec photos avant/après et numéros de téléphone des clients pour appel. Croisez avec les avis en ligne — les plateformes d'avis vérifiés (liés à un devis ou un chantier) sont plus fiables que les avis Google anonymes.",
  },
]

const faqs = [
  {
    question: 'Qu’est-ce que la mention RGE exactement ?',
    answer:
      "RGE signifie « Reconnu Garant de l'Environnement ». C'est un signe de qualité délivré par l'État français, via des organismes de qualification (Qualibat, Qualifelec, Qualit'EnR, OPQIBI), pour les entreprises réalisant des travaux de rénovation énergétique. La mention garantit : formation technique du personnel, assurance professionnelle, contrôles sur chantier réalisés. Elle est obligatoire pour que le client puisse bénéficier de MaPrimeRénov', des CEE, de l'éco-prêt à taux zéro et de la TVA à taux réduit (5,5 %).",
  },
  {
    question: 'Comment savoir quelle qualification RGE je dois demander ?',
    answer:
      "Chaque geste a sa qualification. PAC air-eau : QualiPAC. PAC air-air : Qualipac CET. Solaire thermique : QualiSol. Photovoltaïque : QualiPV. Biomasse (poêle/chaudière à granulés) : Qualibois. Isolation des combles : Qualibat 7141. Isolation des murs par l'extérieur (ITE) : Qualibat 7131. Isolation intérieure (ITI) : Qualibat 7142. Fenêtres : Qualibat 3521 ou 3522. Borne IRVE : Qualifelec IRVE. En cas de doute, l'annuaire france-renov.gouv.fr filtre par geste : sélectionnez le chantier, l'annuaire liste les qualifications acceptées.",
  },
  {
    question: 'Un artisan peut-il perdre sa qualification RGE ?',
    answer:
      "Oui. La qualification est valable 4 ans et renouvelée sur dossier. Un audit de chantier négatif, un défaut de paiement de la cotisation, un manquement à la formation continue, ou des plaintes documentées peuvent entraîner la suspension ou le retrait. L'annuaire france-renov.gouv.fr est l'unique source à jour : tout affichage « RGE » sur un site d'entreprise n'est valable que si l'annuaire officiel le confirme.",
  },
  {
    question: 'Le RGE garantit-il la qualité des travaux ?',
    answer:
      "Non, pas directement. Il garantit la formation, l'assurance et un audit périodique — mais pas l'exécution d'un chantier donné. Complétez avec : 3 références récentes vérifiables, visite d'un chantier en cours si possible, comparaison de 3 devis RGE, clauses contractuelles précises sur performance attendue (par exemple, COP garanti ≥ 3,5 pour une PAC air-eau, R ≥ 7 pour isolation combles).",
  },
  {
    question: 'Que faire si mon artisan perd le RGE pendant le chantier ?',
    answer:
      "Selon l'arrêté du 24 décembre 2013, la qualification RGE doit être valide à la date de signature du devis. Si elle expire pendant les travaux sans être renouvelée, MaPrimeRénov' et les CEE restent acquis au titre du devis initial. Conservez le devis daté et l'impression d'écran de l'annuaire RGE à cette date. En revanche, si l'artisan perd le RGE avant la signature du devis suite à un retrait, l'aide est impossible.",
  },
  {
    question: 'Un artisan RGE peut-il sous-traiter ?',
    answer:
      "Oui, mais avec des règles strictes. Le donneur d'ordre reste l'entreprise RGE titulaire, qui engage sa responsabilité et sa qualification. L'article 10 de l'arrêté RGE impose que le sous-traitant respecte les mêmes exigences techniques. En pratique : demandez qui exécutera matériellement le chantier et vérifiez que le sous-traitant (s'il existe) ait lui aussi un SIRET actif et une décennale. La sous-traitance en cascade sur plus de 2 niveaux est un signal d'alerte.",
  },
  {
    question: 'Combien coûte un artisan RGE par rapport à un non-RGE ?',
    answer:
      "Sur les gestes subventionnés, l'écart net est presque toujours en faveur du RGE. Exemple : une PAC air-eau installée par un QualiPAC à 13 000 € TTC ouvre droit jusqu'à 5 000 € MaPrimeRénov' et 4 000 € de CEE selon les revenus, soit 4 000 € net. La même PAC chez un non-RGE à 11 000 € TTC ne donne droit à aucune aide, soit 11 000 € net. Cette règle ne vaut que sur les gestes éligibles ; pour un chantier non éligible (décoration, second œuvre sans enjeu énergétique), le RGE n'a pas d'impact financier.",
  },
  {
    question: 'Comment déclarer un artisan RGE frauduleux ?',
    answer:
      "Trois voies. (1) Signalement à l'organisme qualificateur (Qualibat, Qualifelec, Qualit'EnR) qui peut suspendre la qualification. (2) Signalement DGCCRF via signal.conso.gouv.fr. (3) Saisine de Tracfin ou dépôt de plainte au commissariat pour escroquerie organisée (art. 313-2 Code pénal), en cas d'usage frauduleux du logo RGE ou de chantier fictif facturé pour détourner MaPrimeRénov'. Avec 14 condamnations en 2023-2024 pour fraude RGE, l'État est actif sur le sujet.",
  },
]

const sources = [
  {
    label: 'Annuaire officiel RGE — france-renov.gouv.fr',
    url: 'https://france-renov.gouv.fr/annuaire-rge',
    note: 'Base ADEME mise à jour mensuellement',
  },
  {
    label: 'Arrêté du 24 décembre 2013 relatif aux critères RGE',
    url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000028435550',
  },
  {
    label: 'ADEME — Qualifications et labels RGE',
    url: 'https://agir.ademe.fr/',
  },
  {
    label: 'Signal Conso (DGCCRF)',
    url: 'https://signal.conso.gouv.fr',
    note: 'Signaler un artisan RGE frauduleux',
  },
  {
    label: 'Qualibat — Référentiel des qualifications',
    url: 'https://www.qualibat.com',
  },
]

const relatedGuides = [
  { label: 'Vérifier le SIRET d’un artisan', href: '/guides/verifier-siret-artisan' },
  {
    label: 'Qualibat, QualiPAC, Qualifelec : quelle qualification ?',
    href: '/guides/qualibat-qualipac-qualifelec-qui-choisir',
  },
  { label: 'MaPrimeRénov’ 2026 — critères RGE', href: '/guides/maprimerenov-2026-criteres-rge' },
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
    section: 'Rénovation énergétique',
    keywords: [
      'artisan RGE',
      'choisir RGE',
      'QualiPAC',
      'Qualibat',
      'annuaire RGE',
      'MaPrimeRénov RGE',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Choisir un artisan RGE', url: `/guides/${SLUG}` },
  ])
  const faqSchema = getFAQSchema(faqs)
  const howToSchema = getHowToSchema(howToSteps, {
    name: 'Choisir un artisan RGE en 6 étapes',
    description:
      'Méthode officielle pour choisir un artisan RGE fiable pour un chantier éligible aux aides.',
    totalTime: 'PT20M',
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Choisir un artisan RGE' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Leaf className="w-3.5 h-3.5" aria-hidden />
              Rénovation énergétique · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Comment choisir un artisan RGE en 2026 : méthode et pièges
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Sans artisan RGE, pas d’aide publique à la rénovation énergétique — et avec un « faux
              RGE », c’est l’aide qui vous sera réclamée en remboursement. Voici comment vérifier
              qu’un artisan est réellement qualifié pour le geste précis que vous lui confiez, et
              comment se prémunir des fraudes les plus fréquentes.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Pourquoi la mention RGE ne suffit pas : la qualification par geste</h2>
            <p>
              Beaucoup d’artisans affichent le logo « RGE » sur leur site, mais la mention n’est
              opérante qu’attachée à une qualification précise. Un artisan QualiPAC peut poser une
              pompe à chaleur subventionnable ; il ne peut pas faire profiter ses clients de
              MaPrimeRénov’ pour une isolation de combles, pour laquelle il faut une qualification
              Qualibat 7141. Vérifier le logo ne suffit pas, il faut vérifier la qualification par
              geste.
            </p>

            <h2>Les qualifications RGE par geste : table de correspondance</h2>
            <ul>
              <li>
                <strong>Pompe à chaleur air-eau ou eau-eau</strong> → QualiPAC (Qualit’EnR)
              </li>
              <li>
                <strong>Pompe à chaleur air-air / climatisation réversible</strong> → QualiPAC
                module CET
              </li>
              <li>
                <strong>Isolation combles perdus / aménagés</strong> → Qualibat 7141
              </li>
              <li>
                <strong>Isolation par l’extérieur (ITE)</strong> → Qualibat 7131 ou 7132
              </li>
              <li>
                <strong>Isolation des murs par l’intérieur (ITI)</strong> → Qualibat 7142
              </li>
              <li>
                <strong>Fenêtres et portes-fenêtres</strong> → Qualibat 3521 / 3522 ou Qualifelec
                selon matériau
              </li>
              <li>
                <strong>Chauffage bois / granulés</strong> → Qualibois (Qualit’EnR)
              </li>
              <li>
                <strong>Panneaux solaires thermiques</strong> → QualiSol
              </li>
              <li>
                <strong>Panneaux photovoltaïques</strong> → QualiPV (module bâti ou élec selon pose)
              </li>
              <li>
                <strong>Borne de recharge IRVE</strong> → Qualifelec IRVE niveau 1, 2 ou 3
              </li>
              <li>
                <strong>Rénovation d’ampleur (plusieurs gestes)</strong> → Qualibat RGE ou OPQIBI
                selon montage
              </li>
            </ul>

            <h2>La méthode en 6 étapes</h2>
            <ol>
              {howToSteps.map((s, i) => (
                <li key={i}>
                  <strong>{s.name}.</strong> {s.text}
                </li>
              ))}
            </ol>

            <h2>Les 5 fraudes RGE les plus fréquentes</h2>
            <ul>
              <li>
                <strong>Logo RGE affiché sans qualification réelle.</strong> Vérifiez sur l’annuaire
                officiel, jamais sur le site de l’entreprise.
              </li>
              <li>
                <strong>Qualification expirée non renouvelée.</strong> La validité est de 4 ans.
                Contrôlez la date affichée sur la fiche ADEME.
              </li>
              <li>
                <strong>Qualification pour un autre geste.</strong> Un Qualibois qui pose une pompe
                à chaleur ne déclenche pas MaPrimeRénov’ PAC.
              </li>
              <li>
                <strong>Sous-traitance à une entreprise non RGE.</strong> L’artisan RGE reste
                responsable mais doit faire réaliser le geste par du personnel couvert.
              </li>
              <li>
                <strong>Mandataire qui signe à la place du bénéficiaire.</strong> La loi «
                Denormandie » 2023 interdit le démarchage téléphonique en rénovation énergétique. Un
                appel entrant proposant PAC ou isolation est souvent une entrée de fraude.
              </li>
            </ul>

            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>Depuis mars 2023.</strong> Le démarchage téléphonique pour la rénovation
                énergétique est interdit (loi n° 2020-901, décret n° 2022-34). Tout appel entrant
                vous proposant une pompe à chaleur à 1 €, une isolation à 1 € ou MaPrimeRénov’ est
                illégal. Raccrochez et signalez.
              </p>
            </div>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Award className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Trouver un artisan RGE vérifié près de chez vous
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Sur ServicesArtisans, la qualification RGE de chaque artisan est synchronisée
                    avec la base officielle ADEME. Affichage transparent des gestes couverts et de
                    la date de validité.
                  </p>
                  <Link
                    href="/artisans-rge"
                    className="inline-flex items-center gap-1.5 text-primary-700 font-semibold hover:underline"
                  >
                    Annuaire des artisans RGE <ArrowRight className="w-4 h-4" aria-hidden />
                  </Link>
                </div>
              </div>
            </div>

            <h2>Check-list avant signature</h2>
            <ul className="not-prose space-y-2">
              {[
                'Qualification RGE présente sur france-renov.gouv.fr',
                'Geste couvert exactement identique au chantier',
                'Date de validité postérieure à la signature',
                'SIRET actif sur annuaire-entreprises.data.gouv.fr',
                'Décennale à jour couvrant l’activité concernée',
                '3 références récentes sur le geste précis',
                'Devis détaillé avec TVA 5,5 % appliquée',
                'Numéro et organisme de qualification sur le devis',
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
            <ShieldCheck className="w-10 h-10 mx-auto mb-3 opacity-90" aria-hidden />
            <h2 className="font-heading text-2xl font-bold mb-2">
              Projet de rénovation énergétique ?
            </h2>
            <p className="text-primary-100 mb-5 max-w-xl mx-auto">
              Obtenez jusqu’à 3 devis d’artisans RGE vérifiés, qualifiés précisément pour votre
              geste (PAC, isolation, fenêtres, solaire).
            </p>
            <Link
              href="/devis"
              className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-6 py-3 rounded-lg hover:bg-primary-50 transition-colors"
            >
              Demander mes devis RGE <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
