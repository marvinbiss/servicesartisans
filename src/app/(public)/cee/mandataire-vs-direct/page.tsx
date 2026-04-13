import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ShieldCheck,
  Building2,
  Network,
  Users2,
  BookOpen,
  ArrowRight,
  AlertTriangle,
  FileCheck2,
  Scale,
  Users,
  Wrench,
  ExternalLink,
} from 'lucide-react'

import CeeCTA from '@/components/cee/CeeCTA'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { SITE_URL, getAlternates, SITE_NAME } from '@/lib/seo/config'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'

export const revalidate = 86400

const PAGE_PATH = '/cee/mandataire-vs-direct'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-04-09'
const MODIFIED = '2026-04-09'

export const metadata: Metadata = {
  title: 'Obligé, délégataire, mandataire CEE : comprendre les 3 rôles du circuit',
  description:
    "Guide pédagogique neutre sur les 3 acteurs du dispositif CEE : obligé, délégataire et mandataire. Définitions juridiques (code de l'énergie L221-x / R221-x), obligations PNCEE, modèle économique et impact pour les particuliers et les artisans.",
  alternates: getAlternates(PAGE_PATH),
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1 as const,
    'max-image-preview': 'large' as const,
    'max-video-preview': -1 as const,
  },
  openGraph: {
    title: 'Obligé, délégataire, mandataire CEE : les 3 rôles expliqués',
    description:
      "Comprendre qui achète, qui dépose et qui monte un dossier de prime CEE. Un guide neutre appuyé sur le code de l'énergie et le registre PNCEE.",
    type: 'article',
    locale: 'fr_FR',
    url: PAGE_URL,
    siteName: SITE_NAME,
    publishedTime: PUBLISHED,
    modifiedTime: MODIFIED,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Obligé, délégataire, mandataire CEE : les 3 rôles',
    description:
      "Définitions, obligations PNCEE, modèle économique : qui fait quoi dans le dispositif des certificats d'économies d'énergie.",
  },
}

type RoleKey = 'oblige' | 'delegataire' | 'mandataire'

const ROLES: Array<{
  key: RoleKey
  label: string
  tagline: string
  icon: React.ComponentType<{ className?: string }>
  legal: string
  mission: string
  obligations: string[]
  revenue: string
  examples: string
  limits: string
}> = [
  {
    key: 'oblige',
    label: 'L’obligé',
    tagline: 'Le payeur final de la prime CEE',
    icon: Building2,
    legal:
      "Personne morale soumise à une obligation d'économies d'énergie au titre des articles L221-1 à L221-7 du code de l'énergie. Ce sont les vendeurs d'énergie (électricité, gaz, fioul, GPL, chaleur et froid, carburants) dont les volumes dépassent les seuils fixés par décret (articles R221-1 à R221-3).",
    mission:
      "Chaque obligé doit justifier, au terme de chaque période triennale, la détention d'un volume de certificats correspondant à son obligation individuelle (exprimée en kWh cumac). À défaut, il s'expose à une pénalité libératoire versée au Trésor public (article L221-4).",
    obligations: [
      "Détenir un compte ouvert au registre national des CEE (EMMY), tenu pour le compte de l'État.",
      "Déposer les CEE au PNCEE (Pôle national des certificats d'économies d'énergie, DGEC) pour validation.",
      "Produire les pièces justificatives exigées par l'arrêté du 4 septembre 2014 modifié (attestation sur l'honneur, facture, preuve du rôle actif et incitatif).",
      "Respecter les contrôles sur site et sur dossier prévus par l'arrêté du 28 septembre 2021 modifié.",
    ],
    revenue:
      "Un obligé ne « gagne » pas d'argent avec les CEE : il supporte le coût de son obligation. Sa « marge » est en réalité l'écart entre le coût de la pénalité évitée et le coût réel d'acquisition des certificats. En pratique, il préfère presque toujours acheter des CEE plutôt que payer la pénalité, car cela revient moins cher.",
    examples:
      "Fournisseurs d'énergie historiques et alternatifs : EDF, Engie, TotalEnergies, les grandes enseignes de grande distribution qui vendent du carburant, et les fournisseurs de fioul regroupés via des structures collectives.",
    limits:
      "Le rôle d'obligé implique un coût fixe de gestion élevé (équipe conformité, système d'information, représentation au PNCEE). C'est pourquoi la majorité des obligés préfèrent externaliser le sourcing via des contrats avec des délégataires.",
  },
  {
    key: 'delegataire',
    label: 'Le délégataire',
    tagline: 'Acheteur et déposant pour le compte d’un obligé',
    icon: Network,
    legal:
      "Personne morale à laquelle un obligé a délégué tout ou partie de son obligation d'économies d'énergie, conformément à l'article L221-7 du code de l'énergie et aux articles R221-5 et R221-6. Depuis le décret du 28 septembre 2021, un délégataire doit notamment justifier d'une capacité financière suffisante, d'un volume délégué minimum et d'une organisation conforme.",
    mission:
      "Le délégataire reprend intégralement la dette CEE de l'obligé à hauteur du volume délégué. Il construit son portefeuille de CEE en finançant des travaux chez les bénéficiaires (particuliers, copropriétés, entreprises, collectivités), dépose les dossiers au PNCEE, puis transfère les certificats validés à l'obligé délégant.",
    obligations: [
      'Être inscrit au registre des délégataires tenu par la DGEC (article R221-5-1).',
      "Disposer d'un compte EMMY actif et d'un référent conformité.",
      "Respecter la charte « Coup de pouce » lorsqu'il en signe une, publiée au Bulletin officiel.",
      'Se soumettre aux contrôles contradictoires du PNCEE et aux audits tiers obligatoires (arrêté du 28 septembre 2021 modifié).',
    ],
    revenue:
      "Le délégataire se rémunère sur l'écart entre le prix d'achat des CEE qu'il finance (la prime versée au bénéficiaire plus ses frais opérationnels) et le prix auquel il revend ou transfère ces CEE à l'obligé délégant. Sa marge dépend du volume traité, du taux de rejet au PNCEE et du coût de ses contrôles qualité.",
    examples:
      "Quelques dizaines de délégataires sont actifs au registre PNCEE. Les plus visibles auprès du grand public sont par exemple Effy, Sonergia et TotalEnergies Marketing France ; d'autres, moins connus, opèrent surtout sur des segments B2B ou des opérations spécifiques (précarité énergétique, gros tertiaire, industrie).",
    limits:
      "Le délégataire porte une responsabilité réglementaire lourde : tout dossier rejeté au PNCEE est à sa charge, tout contrôle négatif peut entraîner une sanction administrative (article L222-2). Il doit donc filtrer les dossiers qu'il accepte, ce qui peut être vécu par les installateurs comme une exigence documentaire forte.",
  },
  {
    key: 'mandataire',
    label: 'Le mandataire',
    tagline: 'Monteur de dossier pour le compte du bénéficiaire',
    icon: Users2,
    legal:
      "Tiers agissant pour le compte du bénéficiaire (le particulier, la copropriété, l'entreprise) ou d'un professionnel, au titre d'un contrat de mandat civil (articles 1984 et suivants du code civil). Le mandataire CEE est reconnu par la DGEC comme un intermédiaire légitime dès lors qu'il respecte les règles de transparence fixées par l'arrêté du 4 septembre 2014 modifié et par la charte « mandataire » lorsqu'elle existe.",
    mission:
      "Le mandataire ne porte pas de dette CEE. Son rôle est de qualifier l'éligibilité de l'opération, d'assembler le dossier administratif et technique (devis, attestation sur l'honneur, factures, photos géotaggées, justificatifs de ressources pour la précarité), puis de le présenter à un délégataire ou à un obligé qui achètera les CEE. Il peut aussi accompagner l'artisan sur la conformité documentaire.",
    obligations: [
      "Divulguer clairement son statut de mandataire au bénéficiaire, notamment dans le contrat de mandat et dans l'attestation sur l'honneur.",
      "Ne pas se présenter comme « obligé » ou comme « délégataire » s'il ne l'est pas.",
      'Respecter les exigences de la DGCCRF sur les pratiques commerciales (interdiction du démarchage téléphonique pour les travaux énergétiques — loi du 24 juillet 2020).',
      "Transmettre le dossier au délégataire ou à l'obligé sans altération et dans les délais contractuels.",
    ],
    revenue:
      "Un mandataire se rémunère soit par une commission payée par le délégataire / l'obligé sur les CEE effectivement validés, soit par un service facturé au bénéficiaire (montage, accompagnement, contrôle qualité). La marge est plus étroite que celle d'un délégataire, mais le capital requis et le risque réglementaire sont également inférieurs.",
    examples:
      "De nombreuses sociétés de rénovation énergétique, plateformes d'intermédiation et bureaux d'études fonctionnent comme mandataires sans être elles-mêmes délégataires. C'est le statut vers lequel ServicesArtisans se positionne à compter de 2026 dans le cadre de son pivot CEE.",
    limits:
      "Le mandataire dépend entièrement de la capacité du délégataire partenaire à accepter ses dossiers et à les valoriser. Il ne maîtrise ni le cours du CEE, ni le délai de versement de la prime, ni l'arbitrage final sur un dossier limite. Sa crédibilité repose sur la qualité de ses process et sur la solidité des partenariats qu'il a noués en amont.",
  },
]

const FAQ: Array<{ question: string; answer: string }> = [
  {
    question: "C'est qui qui paie la prime, au final ?",
    answer:
      "La prime est in fine financée par l'obligé, c'est-à-dire par le vendeur d'énergie soumis à l'obligation prévue à l'article L221-1 du code de l'énergie. L'obligé répercute ce coût dans le prix de l'énergie qu'il vend à ses clients finaux. Qu'un dossier passe par un délégataire ou un mandataire ne change pas la source du financement : la prime vient toujours de l'argent mobilisé par l'obligé pour s'acquitter de son obligation triennale.",
  },
  {
    question: 'Pourquoi certains proposent 0 € et d’autres 500 € pour la même opération ?',
    answer:
      "Parce que le montant de la prime versée au bénéficiaire n'est pas réglementé : seul le forfait kWh cumac de l'opération est fixé par arrêté. Chaque délégataire ou mandataire décide librement du prix de rachat du CEE qu'il propose. Un acteur peut reverser l'essentiel du cours du CEE au bénéficiaire (prime élevée, marge faible), un autre peut garder une part importante pour financer ses contrôles ou son réseau. La seule exception concerne les opérations « Coup de pouce » : dans ce cas, la charte signée par le délégataire impose un montant plancher de prime.",
  },
  {
    question: 'Puis-je changer de mandataire en cours de dossier ?',
    answer:
      "Tant que le dossier n'a pas été déposé au PNCEE par un délégataire, vous pouvez en principe résilier votre contrat de mandat et confier votre dossier à un autre acteur, dans les conditions prévues à l'article 2004 du code civil. Une fois que les CEE ont été déposés au PNCEE, le dossier est figé : le volume de certificats est rattaché au délégataire déposant et ne peut pas être transféré rétroactivement. En pratique, il est donc essentiel de vérifier les conditions de résiliation avant de signer un mandat.",
  },
  {
    question: "Qu'est-ce qu'un « Coup de pouce » et qui le finance ?",
    answer:
      "Les chartes « Coup de pouce » sont des dispositifs temporaires publiés par arrêté au Bulletin officiel du ministère chargé de l'énergie (exemples en vigueur : Coup de pouce Chauffage, Coup de pouce Rénovation d'ampleur). Les signataires — exclusivement des obligés ou des délégataires — s'engagent à verser des primes supérieures au cours courant du CEE pour accélérer la massification de certaines opérations. Le financement reste intégralement supporté par l'obligé signataire : un mandataire ne peut pas « signer » une charte Coup de pouce, il ne peut que s'appuyer sur un délégataire qui y a adhéré.",
  },
  {
    question: 'Comment éviter les arnaques CEE ?',
    answer:
      "Quatre réflexes. Premièrement, refusez tout démarchage téléphonique non sollicité : la loi du 24 juillet 2020 l'interdit pour les travaux d'économies d'énergie. Deuxièmement, vérifiez l'identité juridique de votre interlocuteur (SIREN actif sur l'INSEE, mentions légales, adresse physique). Troisièmement, demandez à voir le nom du délégataire ou de l'obligé qui rachètera effectivement les CEE : un mandataire sérieux n'a aucun problème à le communiquer. Quatrièmement, ne signez jamais une attestation sur l'honneur pré-remplie avec des informations que vous n'avez pas vérifiées vous-même : c'est un document engageant qui peut être retenu contre vous en cas de contrôle DGCCRF.",
  },
]

function getArticleSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Obligé, délégataire, mandataire CEE : comprendre les 3 rôles du circuit',
    description:
      "Guide pédagogique neutre sur les 3 acteurs du dispositif des certificats d'économies d'énergie : obligé, délégataire et mandataire. Définitions juridiques, obligations PNCEE, modèle économique et impact pour les particuliers et les artisans.",
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': PAGE_URL,
    },
    url: PAGE_URL,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    inLanguage: 'fr-FR',
    isAccessibleForFree: true,
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
    about: [
      { '@type': 'Thing', name: "Certificats d'économies d'énergie" },
      { '@type': 'Thing', name: "Code de l'énergie, articles L221-1 à L221-12" },
      { '@type': 'Thing', name: "Pôle national des certificats d'économies d'énergie" },
    ],
  }
}

export default function MandataireVsDirectPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Primes CEE', url: '/cee' },
    { name: 'Obligé, délégataire, mandataire', url: PAGE_PATH },
  ])

  const articleSchema = getArticleSchema()
  const faqSchema = getFAQSchema(FAQ)

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={articleSchema} />
      {faqSchema && <JsonLd data={faqSchema} />}

      <Breadcrumb
        items={[
          { label: 'Accueil', href: '/' },
          { label: 'Primes CEE', href: '/cee' },
          { label: 'Obligé, délégataire, mandataire' },
        ]}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-charcoal-900 text-white py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 rounded-full px-4 py-1.5 mb-5">
            <Scale className="w-4 h-4 text-emerald-300" />
            <span className="text-sm font-medium text-emerald-100">
              Guide neutre — code de l’énergie L221-x / R221-x
            </span>
          </div>
          <h1 className="font-heading text-3xl md:text-5xl font-extrabold leading-tight mb-5">
            Obligé, délégataire, mandataire CEE&nbsp;: comprendre les 3 rôles du circuit
          </h1>
          <p className="text-lg md:text-xl text-emerald-50/90 leading-relaxed">
            Qui achète les certificats d’économies d’énergie&nbsp;? Qui dépose les dossiers au
            PNCEE&nbsp;? Qui se contente de monter le dossier pour le compte du bénéficiaire&nbsp;?
            Ce guide clarifie les trois rôles du dispositif CEE, leurs obligations réglementaires et
            leur modèle économique — sans jargon, sans parti pris.
          </p>
          <div
            className="speakable-summary mt-6 text-base md:text-lg text-emerald-50/80 leading-relaxed border-l-2 border-emerald-400/40 pl-4"
            data-speakable="true"
          >
            <p>
              L’obligé est le vendeur d’énergie soumis à l’obligation&nbsp;; le délégataire reprend
              cette obligation et finance les travaux&nbsp;; le mandataire monte le dossier pour le
              compte du bénéficiaire sans porter la dette CEE. La prime finale, elle, reste toujours
              financée par l’obligé.
            </p>
          </div>
        </div>
      </section>

      {/* Intro éditoriale */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <p className="text-charcoal-700 leading-relaxed text-lg mb-4">
          Le dispositif des certificats d’économies d’énergie, créé par la loi POPE du 13 juillet
          2005 et codifié aux articles L221-1 à L221-12 du code de l’énergie, repose sur un principe
          simple&nbsp;: l’État impose aux vendeurs d’énergie un volume d’économies à réaliser, et
          ces vendeurs doivent le justifier en déposant des certificats au Pôle national des
          certificats d’économies d’énergie (PNCEE), service de la Direction générale de l’énergie
          et du climat.
        </p>
        <p className="text-charcoal-700 leading-relaxed mb-4">
          Autour de ce mécanisme, trois rôles se sont stabilisés au fil des périodes
          d’obligation&nbsp;: les
          <strong> obligés</strong>, qui portent l’obligation légale&nbsp;; les{' '}
          <strong>délégataires</strong>, qui la reprennent contractuellement&nbsp;; et les
          <strong> mandataires</strong>, qui accompagnent les bénéficiaires sans assumer
          l’obligation. La confusion entre ces trois rôles est à l’origine d’une grande partie des
          malentendus — et de certaines arnaques — rencontrés par les particuliers et les artisans.
        </p>
        <p className="text-charcoal-700 leading-relaxed">
          Cet article décrit chaque rôle, ses obligations PNCEE, son modèle économique et ses
          limites. Il détaille ensuite ce que cela change concrètement pour un particulier qui fait
          isoler sa maison, pour un artisan RGE qui monte un dossier, puis propose une liste
          pratique pour vérifier qu’un partenaire CEE est légitime.
        </p>
      </section>

      {/* Les 3 rôles */}
      <section className="bg-sand-50 border-y border-charcoal-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <h2 className="font-heading text-2xl md:text-4xl font-extrabold text-charcoal-900 mb-3">
            Les 3 rôles du circuit CEE
          </h2>
          <p className="text-charcoal-600 max-w-3xl mb-10 leading-relaxed">
            Trois acteurs, trois responsabilités réglementaires très différentes. Les définitions
            ci-dessous s’appuient sur les articles L221-1 à L221-12 et R221-1 à R221-27 du code de
            l’énergie, ainsi que sur l’arrêté du 22 décembre 2014 modifié qui définit les opérations
            standardisées.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {ROLES.map((role) => {
              const Icon = role.icon
              return (
                <article
                  key={role.key}
                  className="bg-white rounded-2xl border border-charcoal-200 p-6 flex flex-col"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-emerald-700" />
                    </div>
                    <div>
                      <h3 className="font-heading text-xl font-bold text-charcoal-900">
                        {role.label}
                      </h3>
                      <p className="text-sm text-emerald-700 font-medium mt-0.5">{role.tagline}</p>
                    </div>
                  </div>

                  <div className="space-y-4 text-sm text-charcoal-700 leading-relaxed">
                    <div>
                      <div className="font-semibold text-charcoal-900 mb-1">
                        Définition juridique
                      </div>
                      <p>{role.legal}</p>
                    </div>
                    <div>
                      <div className="font-semibold text-charcoal-900 mb-1">
                        Ce qu’il fait concrètement
                      </div>
                      <p>{role.mission}</p>
                    </div>
                    <div>
                      <div className="font-semibold text-charcoal-900 mb-1">Obligations PNCEE</div>
                      <ul className="list-disc pl-5 space-y-1.5">
                        {role.obligations.map((o, i) => (
                          <li key={i}>{o}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="font-semibold text-charcoal-900 mb-1">
                        D’où vient sa marge
                      </div>
                      <p>{role.revenue}</p>
                    </div>
                    <div>
                      <div className="font-semibold text-charcoal-900 mb-1">Exemples</div>
                      <p>{role.examples}</p>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-700 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-semibold text-amber-900 mb-1">
                            Limites et risques du modèle
                          </div>
                          <p className="text-amber-900/90">{role.limits}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* Impact particulier */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 text-primary-600" />
          </div>
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900">
            Quel impact pour le particulier&nbsp;?
          </h2>
        </div>
        <p className="text-charcoal-700 leading-relaxed mb-4">
          En pratique, le particulier qui fait isoler ses combles ou remplacer sa chaudière ne voit
          pas de différence fondamentale selon le type d’acteur qu’il a en face de lui. Les barèmes
          forfaitaires des opérations standardisées sont fixés par arrêté et publiés au Journal
          officiel&nbsp;: le gain énergétique calculé (en kWh cumac) est le même quel que soit le
          circuit emprunté.
        </p>
        <p className="text-charcoal-700 leading-relaxed mb-4">
          Ce qui varie, c’est le <strong>prix de rachat</strong> de ce cumac — donc le montant de
          prime finalement versé au bénéficiaire. Ce prix dépend de la politique commerciale de
          chaque délégataire et du niveau de service facturé par un éventuel mandataire. Pour les
          opérations non couvertes par une charte Coup de pouce, les écarts peuvent être
          significatifs d’un acteur à l’autre.
        </p>
        <p className="text-charcoal-700 leading-relaxed mb-4">
          Le service rendu varie aussi nettement. Certains acteurs proposent un accompagnement de
          bout en bout (qualification, montage, relances, SAV), d’autres se contentent d’une
          plateforme self-service. Le délai de versement de la prime — souvent entre 4 et 12
          semaines après dépôt du dossier complet — varie également selon la charge du délégataire
          et son taux de rejet.
        </p>
        <p className="text-charcoal-700 leading-relaxed">
          En résumé&nbsp;: le montant maximal théorique de la prime est figé par la réglementation,
          mais le montant réellement perçu, le délai de versement et la qualité du SAV dépendent
          beaucoup du choix du partenaire CEE. Comparer ne coûte rien.
        </p>
      </section>

      {/* Impact artisan */}
      <section className="bg-sand-50 border-y border-charcoal-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Wrench className="w-5 h-5 text-emerald-700" />
            </div>
            <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900">
              Quel impact pour l’artisan&nbsp;?
            </h2>
          </div>
          <p className="text-charcoal-700 leading-relaxed mb-4">
            Pour un artisan RGE, le choix du partenaire CEE est opérationnel avant d’être
            commercial. Trois critères font la différence au quotidien&nbsp;: la facilité
            d’instruction des dossiers, le délai de versement de la prime au client final, et la
            qualité du contrôle qualité imposé avant dépôt au PNCEE.
          </p>
          <p className="text-charcoal-700 leading-relaxed mb-4">
            La <strong>facilité d’instruction</strong> dépend de la clarté des pièces demandées, de
            l’existence d’un outil de dépôt en ligne stable, et de la réactivité du support en cas
            de doute sur un dossier. Un mandataire sérieux peut apporter une vraie valeur sur ce
            point en absorbant une partie du travail administratif.
          </p>
          <p className="text-charcoal-700 leading-relaxed mb-4">
            Le <strong>délai de versement</strong> impacte directement la trésorerie du chantier
            quand la prime est facturée en déduction du devis (principe du tiers payant). Un délai
            moyen court est un vrai différenciateur pour l’artisan&nbsp;; un délai long, au
            contraire, tend les relations avec les clients finaux.
          </p>
          <p className="text-charcoal-700 leading-relaxed mb-4">
            Enfin, la <strong>qualité du contrôle</strong>
            imposé avant dépôt au PNCEE est paradoxalement un bon signe&nbsp;: un partenaire
            exigeant sur les photos géotaggées, les factures et l’attestation sur l’honneur protège
            l’artisan d’un contrôle a posteriori ou d’une non-validation. Un partenaire trop laxiste
            reporte ce risque sur l’installateur, qui peut se retrouver avec une prime réclamée en
            restitution des années après le chantier.
          </p>
          <p className="text-charcoal-700 leading-relaxed">
            Le bon partenaire CEE n’est donc pas forcément celui qui propose la prime la plus
            élevée&nbsp;: c’est celui qui combine un barème compétitif, un délai de paiement fiable
            et un contrôle qualité rigoureux.
          </p>
        </div>
      </section>

      {/* Comment vérifier qu'un partenaire est légitime */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
          </div>
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900">
            Comment vérifier qu’un partenaire CEE est légitime&nbsp;?
          </h2>
        </div>
        <p className="text-charcoal-700 leading-relaxed mb-6">
          Que vous soyez un particulier qui reçoit une proposition de prime ou un artisan qui évalue
          un partenariat, quelques vérifications simples permettent de filtrer la quasi-totalité des
          acteurs douteux.
        </p>
        <ul className="space-y-4">
          {[
            {
              title: 'Identité juridique et SIREN actif',
              text: "Vérifiez le SIREN sur annuaire-entreprises.data.gouv.fr ou sur l'INSEE. Un acteur CEE sérieux est une société française immatriculée, avec une adresse physique, un numéro RCS actif et des mentions légales complètes sur son site.",
            },
            {
              title: 'Statut au registre des délégataires PNCEE',
              text: "Si l'acteur se présente comme délégataire, il doit figurer au registre tenu par la DGEC. Un mandataire, lui, ne peut pas figurer sur ce registre — il doit l'indiquer clairement et citer le délégataire partenaire qui traitera effectivement vos dossiers.",
            },
            {
              title: 'Conditions du contrat de mandat',
              text: "Lisez attentivement le contrat de mandat proposé&nbsp;: durée, conditions de résiliation, rémunération, exclusivité ou non, identité du délégataire partenaire. Un contrat flou ou l'absence de mention explicite du statut de mandataire sont des signaux d'alerte.",
            },
            {
              title: 'Attestation sur l\u2019honneur pré-remplie',
              text: "Refusez de signer une attestation sur l'honneur pré-remplie dont vous n'avez pas vérifié chaque ligne (performance de l'équipement, surface isolée, résistance thermique). C'est un document juridiquement engageant&nbsp;: des déclarations inexactes peuvent entra&icirc;ner un redressement, voire des poursuites pour fraude.",
            },
            {
              title: 'Réputation et avis vérifiables',
              text: "Recoupez les avis sur plusieurs sources indépendantes (Signal-Arnaques, forums de consommateurs, Trustpilot en vérifiant les avis suspects). Un volume d'avis négatifs convergents sur des problèmes de délai de paiement ou de contrat opaque doit faire redémarrer l'analyse.",
            },
            {
              title: 'Respect de l\u2019interdiction du démarchage',
              text: "Depuis la loi du 24 juillet 2020, le démarchage téléphonique est interdit pour les travaux d'économies d'énergie. Un acteur qui vous appelle sans sollicitation préalable pour vous proposer une prime est, par construction, hors-la-loi&nbsp;: ne lui confiez aucun dossier.",
            },
          ].map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-3 bg-white rounded-xl border border-charcoal-200 p-4"
            >
              <FileCheck2 className="w-5 h-5 text-emerald-700 mt-0.5 flex-shrink-0" />
              <div>
                <div
                  className="font-semibold text-charcoal-900 mb-1"
                  dangerouslySetInnerHTML={{ __html: item.title }}
                />
                <p
                  className="text-sm text-charcoal-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: item.text }}
                />
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* FAQ */}
      <section className="bg-sand-50 border-y border-charcoal-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
          <h2 className="font-heading text-2xl md:text-4xl font-extrabold text-charcoal-900 mb-10">
            Questions fréquentes
          </h2>
          <div className="space-y-4">
            {FAQ.map((item, idx) => (
              <details
                key={idx}
                className="group bg-white rounded-2xl border border-charcoal-200 hover:border-emerald-300 transition p-6"
              >
                <summary className="font-heading font-bold text-lg text-charcoal-900 cursor-pointer list-none flex items-start justify-between gap-4">
                  <span>{item.question}</span>
                  <span className="text-emerald-600 text-2xl leading-none flex-shrink-0 group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>
                <p className="text-charcoal-700 mt-4 leading-relaxed">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Sources officielles */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
        <h2 className="font-heading text-xl md:text-2xl font-extrabold text-charcoal-900 mb-4">
          Sources réglementaires
        </h2>
        <ul className="space-y-3 text-sm text-charcoal-700">
          <li className="flex items-start gap-2">
            <ExternalLink className="w-4 h-4 text-emerald-700 mt-0.5 flex-shrink-0" />
            <span>
              Code de l’énergie, articles L221-1 à L221-12 et R221-1 à R221-27 (définitions de
              l’obligation, du délégataire, du registre PNCEE).
            </span>
          </li>
          <li className="flex items-start gap-2">
            <ExternalLink className="w-4 h-4 text-emerald-700 mt-0.5 flex-shrink-0" />
            <span>
              Arrêté du 22 décembre 2014 modifié, définissant les opérations standardisées
              d’économies d’énergie (catalogue BAR, BAT, IND, RES, TRA).
            </span>
          </li>
          <li className="flex items-start gap-2">
            <ExternalLink className="w-4 h-4 text-emerald-700 mt-0.5 flex-shrink-0" />
            <span>
              Arrêté du 4 septembre 2014 modifié, fixant la liste des pièces d’un dossier de demande
              de CEE et les conditions du mandat.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <ExternalLink className="w-4 h-4 text-emerald-700 mt-0.5 flex-shrink-0" />
            <span>
              Arrêté du 28 septembre 2021 modifié, relatif aux contrôles dans le cadre du dispositif
              CEE.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <ExternalLink className="w-4 h-4 text-emerald-700 mt-0.5 flex-shrink-0" />
            <span>
              Loi n° 2020-901 du 24 juillet 2020 encadrant le démarchage téléphonique (interdiction
              pour les travaux d’économies d’énergie).
            </span>
          </li>
          <li className="flex items-start gap-2">
            <ExternalLink className="w-4 h-4 text-emerald-700 mt-0.5 flex-shrink-0" />
            <span>
              Pôle national des certificats d’économies d’énergie (PNCEE), DGEC — Ministère chargé
              de l’énergie.
            </span>
          </li>
        </ul>
      </section>

      {/* CTA inline - page de d\u00e9cision */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <CeeCTA variant="inline" />
      </div>

      {/* CTAs finaux */}
      <section className="bg-gradient-to-br from-emerald-700 to-emerald-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold mb-4">
            Approfondir le dispositif CEE
          </h2>
          <p className="text-emerald-100 max-w-2xl mx-auto mb-8 leading-relaxed">
            Retrouvez le catalogue des opérations standardisées, nos guides éditoriaux et l’annuaire
            des artisans RGE qualifiés pour chaque type de travaux.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/cee"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-emerald-800 font-semibold shadow-lg hover:bg-emerald-50 transition"
            >
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
              Catalogue des primes CEE
            </Link>
            <Link
              href="/cee/guides"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-400 transition"
            >
              <BookOpen className="w-5 h-5" aria-hidden="true" />
              Guides CEE
            </Link>
            <Link
              href="/rge"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-emerald-300/60 text-white font-semibold hover:bg-emerald-600/30 transition"
            >
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
              Annuaire artisans RGE
            </Link>
            <Link
              href="/maprimerenov-cumulaison-cee"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-emerald-300/60 text-white font-semibold hover:bg-emerald-600/30 transition"
            >
              <BookOpen className="w-5 h-5" aria-hidden="true" />
              Cumul MaPrimeRénov’ &amp; CEE
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
