import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Clock,
  MailCheck,
  AlertTriangle,
  ArrowRight,
  Scale,
  CheckCircle2,
  XCircle,
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

const SLUG = 'delai-retractation-devis-artisan'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Claire Dubois'

export const revalidate = 86400

const TITLE = 'Délai rétractation devis artisan 2026'
const DESCRIPTION =
  'Délai de rétractation devis artisan : 14 jours en démarchage à domicile, aucun droit en agence. Lettre recommandée type, exceptions, sanctions.'

export const metadata: Metadata = {
  title: TITLE,
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
  '14 jours pour vous rétracter si le devis a été signé hors établissement (à domicile, foire, salon, démarchage téléphonique).',
  'Aucun droit de rétractation si vous avez signé dans les locaux de l’artisan ou à distance à votre initiative.',
  'Le délai court à compter du lendemain de la signature ; un dimanche ou jour férié reporte l’échéance.',
  'Pas besoin de motif. Lettre recommandée ou formulaire de rétractation suffisent — envoi avant le 14ᵉ jour à minuit.',
  'L’artisan a 14 jours pour vous rembourser tout acompte versé. Sanctions financières en cas de retard.',
]

const howToSteps = [
  {
    name: 'Vérifier le contexte de signature',
    text: "Votre devis est-il signé au domicile, lors d'un salon, d'une foire, après un démarchage téléphonique ou via un site e-commerce ? Oui : vous avez 14 jours pour vous rétracter. Non (signé dans les locaux de l'artisan) : aucun droit de rétractation légal.",
  },
  {
    name: 'Repérer le formulaire de rétractation joint au devis',
    text: "En cas de démarchage, le professionnel doit joindre un formulaire de rétractation détachable, plus une notice explicative. L'absence de ce formulaire prolonge le délai de rétractation à 12 mois (art. L221-20 du Code de la consommation).",
  },
  {
    name: 'Rédiger la lettre ou remplir le formulaire',
    text: "Pas besoin de motif. Indiquez : vos coordonnées, date et numéro de devis, nom de l'artisan, déclaration « Je vous notifie ma rétractation du contrat portant sur […] », date, signature. Envoyez par lettre recommandée avec accusé de réception ou par e-mail avec accusé de lecture.",
  },
  {
    name: 'Envoyer avant la fin du délai',
    text: "L'envoi doit être daté au plus tard le 14ᵉ jour à minuit, jour non ouvré inclus. Si le dernier jour est un samedi, dimanche ou férié, le délai est prolongé au premier jour ouvré suivant. Conservez le récépissé du recommandé : il fait foi.",
  },
  {
    name: 'Exiger le remboursement sous 14 jours',
    text: "L'artisan doit vous rembourser l'intégralité des sommes versées (y compris acompte) dans les 14 jours suivant la notification de votre rétractation. Passé ce délai, des intérêts légaux majorés s'appliquent automatiquement : 10 % au-delà de 10 jours, 30 % au-delà de 30 jours, 50 % jusqu'à 60 jours, 100 % ensuite (art. L242-4).",
  },
  {
    name: 'Si l’artisan refuse : signaler à la DGCCRF',
    text: 'En cas de refus ou de silence, signalez la situation à la DGCCRF via signalconso.gouv.fr. Vous pouvez également saisir la Médiation de la consommation compétente (obligatoirement indiquée sur le devis) ou le tribunal judiciaire.',
  },
]

const faqs = [
  {
    question: 'Le délai de rétractation s’applique-t-il si je signe chez l’artisan ?',
    answer:
      "Non. Le droit de rétractation prévu aux articles L221-18 et suivants du Code de la consommation s'applique aux contrats conclus hors établissement (à votre domicile, sur votre lieu de travail, dans une foire, un salon, suite à un démarchage téléphonique) ou à distance (site e-commerce, téléphone sans rencontre préalable). Une signature dans les locaux de l'artisan exclut ce droit. Une signature chez vous, à l'issue d'une visite de métré, y ouvre droit.",
  },
  {
    question: 'Puis-je me rétracter sans motif ?',
    answer:
      "Oui. Le droit de rétractation est discrétionnaire : aucune justification n'est requise. L'artisan ne peut pas vous demander un motif, et encore moins refuser la rétractation sur ce fondement. La seule obligation est de respecter le délai de 14 jours et la forme (lettre, formulaire ou e-mail traçable).",
  },
  {
    question: 'Le délai de 14 jours est-il en jours ouvrés ou calendaires ?',
    answer:
      "14 jours calendaires. Les samedis, dimanches et jours fériés comptent dans le décompte, mais si le 14ᵉ jour tombe un de ces jours, le délai est prolongé jusqu'au premier jour ouvré suivant (art. L221-19). Le point de départ est le lendemain de la signature du devis ou de la commande.",
  },
  {
    question: 'Que faire si l’artisan a commencé les travaux avant la fin du délai ?',
    answer:
      "Le Code de la consommation interdit toute exécution avant la fin du délai de rétractation, sauf demande écrite et expresse du consommateur (art. L221-25). Si l'artisan a démarré sans votre accord, vous gardez votre droit de rétractation intégral et n'êtes redevable de rien. Si vous avez accepté un démarrage anticipé, vous devrez payer la partie effectivement réalisée, calculée au prorata du prix total.",
  },
  {
    question: 'Quelle différence entre rétractation et résiliation ?',
    answer:
      "La rétractation est un droit du consommateur exerçable dans les 14 jours sans motif, qui annule le contrat comme s'il n'avait jamais existé. La résiliation intervient plus tard, pour inexécution ou faute d'une des parties, et peut engager des pénalités. Si vous voulez annuler 3 semaines après signature, vous n'êtes plus dans le cadre de la rétractation : il faut invoquer un motif légitime (retard d'exécution, manquement, vice) pour obtenir une résolution amiable ou judiciaire.",
  },
  {
    question: 'Comment prouver la date d’envoi de ma rétractation ?',
    answer:
      "La lettre recommandée avec accusé de réception (LRAR) est la preuve la plus solide : la date d'envoi, matérialisée par le cachet postal, fait foi même si le courrier arrive après l'échéance. Un e-mail avec accusé de lecture (ou passerelle mail recommandée électronique, art. 9 du règlement eIDAS) est également recevable. Un SMS ou un appel téléphonique sont juridiquement fragiles.",
  },
  {
    question: 'Ai-je un délai de rétractation pour une urgence (fuite, dépannage) ?',
    answer:
      "Oui en principe, mais vous pouvez renoncer à ce délai à condition de le demander expressément et par écrit. L'article L221-28 du Code de la consommation prévoit cette dérogation pour les prestations urgentes réalisées avec votre accord explicite. Sans cette renonciation écrite, l'artisan ne peut pas intervenir avant la fin des 14 jours — et s'il le fait sans vous le faire signer, il ne pourra pas exiger le paiement en cas de rétractation.",
  },
  {
    question: 'L’artisan ne m’a pas remis de formulaire : quel recours ?',
    answer:
      "L'absence du formulaire de rétractation ou de la notice d'information est sanctionnée : le délai de rétractation est prolongé automatiquement à 12 mois à compter de l'expiration du délai initial (art. L221-20). Vous disposez donc dans ce cas de 12 mois et 14 jours pour exercer votre droit. Cette prolongation cesse si le professionnel vous remet les documents manquants entretemps — un nouveau délai de 14 jours s'ouvre alors.",
  },
]

const sources = [
  {
    label: 'Code de la consommation, art. L221-18 à L221-28',
    url: 'https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006069565/LEGISCTA000032226833',
    note: 'Droit de rétractation — contrats hors établissement et à distance',
  },
  {
    label: 'Service-public.fr — Rétractation après démarchage',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F10485',
  },
  {
    label: 'DGCCRF — Signalconso.gouv.fr',
    url: 'https://signal.conso.gouv.fr',
    note: 'Signaler un refus de rétractation',
  },
  {
    label: 'Code de la consommation, art. L242-4 (pénalités)',
    url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000032227252',
  },
]

const relatedGuides = [
  {
    label: 'Comparer 3 devis d’artisans : méthode',
    href: '/guides/comparer-3-devis-artisans',
  },
  {
    label: 'Éviter les arnaques d’artisans',
    href: '/guides/eviter-arnaques-artisan',
  },
  {
    label: 'Vérifier le SIRET d’un artisan',
    href: '/guides/verifier-siret-artisan',
  },
  {
    label: 'Garantie décennale : tout comprendre',
    href: '/guides/garantie-decennale',
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
    section: 'Droit & Devis',
    keywords: [
      'délai rétractation devis',
      'rétractation artisan',
      'démarchage domicile',
      'L221-18 consommation',
      'annuler devis signé',
    ],
  })

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Délai de rétractation devis', url: `/guides/${SLUG}` },
  ])

  const faqSchema = getFAQSchema(faqs)
  const howToSchema = getHowToSchema(howToSteps, {
    name: 'Exercer son droit de rétractation sur un devis en 6 étapes',
    description:
      'Procédure légale pour annuler un devis signé à domicile, à distance ou après démarchage.',
    totalTime: 'PT15M',
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Délai de rétractation devis' }]}
            className="mb-6"
          />

          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Scale className="w-3.5 h-3.5" aria-hidden />
              Droit &amp; Devis · Guide vérifié
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Délai de rétractation d’un devis d’artisan : 14 jours, à quelles conditions
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Vous avez signé un devis et vous voulez revenir en arrière ? La loi française vous
              laisse 14 jours pour vous rétracter, mais uniquement dans certains contextes. Voici,
              article par article du Code de la consommation, les conditions, le formalisme et les
              recours en cas de refus.
            </p>
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Dans quels cas vous avez 14 jours pour vous rétracter</h2>
            <p>
              L’article <strong>L221-18 du Code de la consommation</strong> ouvre un droit de
              rétractation de 14 jours uniquement pour deux catégories de contrats&nbsp;: les
              contrats <em>hors établissement</em> et les contrats <em>à distance</em>.
            </p>
            <ul>
              <li>
                <strong>Hors établissement.</strong> Signature à votre domicile, sur votre lieu de
                travail, dans une foire, un salon, au cours d’une réception organisée par le
                professionnel, ou après un démarchage téléphonique. Le lieu de signature est
                déterminant, peu importe qui a été à l’initiative du rendez-vous.
              </li>
              <li>
                <strong>À distance.</strong> Signature sans rencontre physique préalable — commande
                sur site web, par téléphone, e-mail ou messagerie — dans le cadre d’un système de
                vente ou prestation organisé à distance.
              </li>
            </ul>
            <p>
              À l’inverse, aucune rétractation légale si vous êtes allé de vous-même dans les locaux
              de l’artisan et que le devis y a été signé. Vous pouvez toujours demander une
              annulation amiable, mais vous n’avez aucun droit exigible.
            </p>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <p className="font-heading text-sm font-semibold text-sand-900 mb-3">
                Exemples concrets
              </p>
              <ul className="space-y-2 text-sm text-sand-800">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" aria-hidden />
                  <span>
                    Un artisan vient métrer et signer le devis chez vous après un démarchage →{' '}
                    <strong>14 jours</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" aria-hidden />
                  <span>
                    Vous signez un devis reçu par e-mail sans jamais vous être déplacé →{' '}
                    <strong>14 jours</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" aria-hidden />
                  <span>
                    Commande signée sur un stand à une foire expo habitat →{' '}
                    <strong>14 jours</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" aria-hidden />
                  <span>
                    Vous vous déplacez dans les bureaux de l’artisan pour signer →{' '}
                    <strong>pas de droit légal</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" aria-hidden />
                  <span>
                    Professionnel signataire (entreprise, copropriété) → régime consommateur non
                    applicable.
                  </span>
                </li>
              </ul>
            </div>

            <h2>Comment se calcule le délai de 14 jours</h2>
            <p>
              Le point de départ est le <strong>lendemain de la signature</strong> du devis ou, s’il
              y a versement d’un acompte, le lendemain de ce versement si celui-ci est postérieur.
              Les 14 jours sont calendaires (samedi, dimanche et jours fériés inclus), mais si le
              14ᵉ jour tombe un samedi, dimanche ou jour férié, le délai se prolonge jusqu’au
              premier jour ouvré suivant (art. L221-19).
            </p>
            <p>
              L’envoi du courrier ou du formulaire doit être daté au plus tard le 14ᵉ jour à minuit.
              C’est bien la <strong>date d’envoi</strong> qui compte, pas la date de réception par
              l’artisan.
            </p>

            <h2>Ce que doit contenir le devis pour déclencher le délai</h2>
            <p>Le professionnel a trois obligations cumulatives (art. L221-5 et L221-11)&nbsp;:</p>
            <ul>
              <li>informer clairement par écrit du droit de rétractation&nbsp;;</li>
              <li>fournir un formulaire-type détachable de rétractation&nbsp;;</li>
              <li>remettre les conditions d’exercice (adresse, délai, conséquences).</li>
            </ul>
            <p>
              En l’absence de ces informations, le délai est automatiquement prolongé à{' '}
              <strong>12 mois</strong> (art. L221-20). C’est-à-dire que vous pouvez vous rétracter
              11 mois après la signature si l’artisan a oublié le formulaire.
            </p>

            <h2>La procédure, pas à pas</h2>
            <ol>
              {howToSteps.map((step, i) => (
                <li key={i}>
                  <strong>{step.name}.</strong> {step.text}
                </li>
              ))}
            </ol>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <MailCheck className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-2">
                    Modèle de lettre de rétractation
                  </p>
                  <pre className="whitespace-pre-wrap text-sm text-sand-700 bg-sand-50 rounded p-3 border border-sand-200 font-mono leading-relaxed">
                    {`[Vos nom, prénom, adresse]

[Nom et adresse de l'artisan]

Objet : Rétractation du devis n°… signé le …
Lettre recommandée avec accusé de réception

Madame, Monsieur,

Conformément à l'article L221-18 du Code de la
consommation, je vous notifie par la présente ma
rétractation du devis référencé ci-dessus, portant
sur [nature des travaux], pour un montant total de
[…] € TTC.

Je vous demande de me rembourser, dans un délai de
14 jours à compter de la présente, la somme de […]
€ versée à titre d'acompte, conformément à l'article
L221-24.

Fait à …, le …

Signature`}
                  </pre>
                </div>
              </div>
            </div>

            <h2>Exception : urgence ou démarrage anticipé</h2>
            <p>
              Pour une intervention urgente (fuite, dépannage chauffage en hiver), vous pouvez
              renoncer à tout ou partie du délai de rétractation. Cette renonciation doit être{' '}
              <strong>écrite et expresse</strong> (art. L221-28-1°). L’artisan intervient alors
              immédiatement, mais si vous vous rétractez après le démarrage, vous devrez payer au
              prorata ce qui a été effectivement réalisé.
            </p>
            <p>
              Si l’artisan a démarré les travaux <em>avant</em> la fin du délai sans votre
              renonciation écrite, il supporte intégralement le coût. Vous conservez votre droit de
              rétractation et ne devez rien.
            </p>

            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>Attention aux acomptes versés.</strong> Un acompte ne vaut pas renonciation
                au droit de rétractation. Vous gardez vos 14 jours même après avoir payé — et
                l’artisan doit vous rembourser sous 14 jours suivant la notification, pénalités
                légales à la clé en cas de retard.
              </p>
            </div>

            <h2>Sanctions et recours en cas de refus</h2>
            <p>
              Si l’artisan refuse la rétractation, ne rembourse pas dans les 14 jours ou vous menace
              de pénalités&nbsp;: trois voies de recours progressives.
            </p>
            <ul>
              <li>
                <strong>Médiation de la consommation.</strong> Le médiateur compétent est indiqué
                obligatoirement sur le devis. Saisine gratuite, réponse sous 90 jours.
              </li>
              <li>
                <strong>Signalement DGCCRF</strong> via{' '}
                <a href="https://signal.conso.gouv.fr" target="_blank" rel="noopener">
                  signal.conso.gouv.fr
                </a>
                . Les pratiques répétées d’un professionnel sont tracées et peuvent déboucher sur
                une enquête.
              </li>
              <li>
                <strong>Tribunal judiciaire.</strong> Pour les litiges supérieurs à 5 000 €, ou en
                cas d’échec de la médiation. La procédure peut être menée sans avocat pour les
                montants inférieurs à 10 000 €.
              </li>
            </ul>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Clock className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Plutôt bien choisir que se rétracter
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Avant de signer, comparez 3 devis détaillés d’artisans vérifiés (SIRET actif,
                    décennale en cours, avis réels). Cela évite souvent de devoir exercer son droit
                    de rétractation.
                  </p>
                  <Link
                    href="/devis"
                    className="inline-flex items-center gap-1.5 text-primary-700 font-semibold hover:underline"
                  >
                    Comparer 3 devis gratuits <ArrowRight className="w-4 h-4" aria-hidden />
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
              href="/guides/comparer-3-devis-artisans"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Comparer 3 devis <ArrowRight className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
