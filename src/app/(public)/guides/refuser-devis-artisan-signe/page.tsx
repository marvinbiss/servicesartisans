import type { Metadata } from 'next'
import Link from 'next/link'
import { FileText, AlertTriangle, ArrowRight, XCircle, Scale, MailCheck } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema, getHowToSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'refuser-devis-artisan-signe'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Claire Dubois'

export const revalidate = 86400

const TITLE = 'Refuser un devis signé : 4 recours 2026'
const DESCRIPTION =
  'Peut-on annuler un devis signé ? Rétractation 14 jours, vice du consentement, inexécution, accord amiable : les 4 voies, leurs conditions et modèles de lettre.'

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
  'Un devis signé est un contrat. Il ne s’annule pas unilatéralement « parce qu’on a changé d’avis ».',
  '4 voies : rétractation légale 14 jours (démarchage/distance), vice du consentement, inexécution par l’artisan, accord amiable.',
  'La rétractation ne coûte rien si elle s’applique. Les autres voies engagent des frais ou des preuves solides.',
  'Ne cessez pas de payer un acompte sans notification écrite : le silence peut être interprété comme acceptation tacite.',
  'En cas de refus : médiateur de la consommation, puis tribunal judiciaire (seuil 5 000 € pour procédure simple).',
]

const howToSteps = [
  {
    name: 'Vérifier si le délai légal de rétractation s’applique',
    text: "Le devis a été signé à votre domicile, sur un salon, après un démarchage téléphonique ou à distance ? Vous avez 14 jours pour vous rétracter sans motif (art. L221-18 Code de la consommation). Le devis a été signé dans les locaux de l'artisan ou dans un rendez-vous que vous avez sollicité ? Le droit de rétractation ne s'applique pas, passez à l'étape suivante.",
  },
  {
    name: 'Identifier le motif d’annulation',
    text: "Hors rétractation, il faut un motif légal. (1) Vice du consentement : erreur sur la substance (vous pensiez acheter X, c'est Y), dol (manœuvre trompeuse de l'artisan), violence morale (pression excessive). (2) Inexécution : retard significatif, travaux non conformes au devis, matériaux différents. (3) Inexactitude d'une mention essentielle (prix, délai, matériaux). Sans motif, l'annulation unilatérale est une inexécution contractuelle de votre part, vous pouvez être condamné à indemniser l'artisan.",
  },
  {
    name: 'Rédiger la mise en demeure écrite',
    text: "Lettre recommandée avec accusé de réception adressée au siège social de l'entreprise (SIRET vérifiable sur annuaire-entreprises.data.gouv.fr). Exposez : numéro et date du devis, motif invoqué, article de loi si applicable, demande précise (annulation + remboursement acompte), délai de réponse (15 jours). Conservez copie signée et preuve d'envoi.",
  },
  {
    name: 'Saisir le médiateur de la consommation',
    text: "Sans réponse ou en cas de refus de l'artisan, saisissez le médiateur de la consommation. Son nom et contact doivent figurer obligatoirement sur le devis (art. L612-1). À défaut, saisissez le médiateur national du bâtiment. La procédure est gratuite, écrite, et aboutit à un avis sous 90 jours. Un accord médié est exécutoire.",
  },
  {
    name: 'Saisir le tribunal judiciaire en dernier recours',
    text: "Pour les litiges inférieurs à 10 000 €, procédure sans avocat possible devant le tribunal judiciaire. Au-delà, avocat obligatoire. Préparez : le devis signé, les échanges écrits, la mise en demeure + accusé, l'avis du médiateur, toute preuve du motif (photos, témoignages, expertise). Action prescrite 5 ans après la découverte du vice.",
  },
  {
    name: 'Récupérer l’acompte versé',
    text: "L'acompte doit être remboursé dans les 14 jours suivant la notification d'annulation valide (rétractation, accord, décision de justice). Passé ce délai, intérêts légaux majorés s'appliquent (art. L242-4). Si l'artisan est en liquidation, déclarez votre créance auprès du mandataire judiciaire dans le délai indiqué au BODACC.",
  },
]

const faqs = [
  {
    question: 'Peut-on annuler un devis signé sans motif ?',
    answer:
      "Seulement dans le cadre du droit de rétractation légal (14 jours après signature hors établissement ou à distance). En dehors, le devis est un contrat opposable : l'annuler unilatéralement sans motif expose à des dommages et intérêts au profit de l'artisan (art. 1231 Code civil), calculés sur la part déjà engagée (achats de matériaux spécifiques, temps passé, préjudice commercial).",
  },
  {
    question: 'Que faire si l’artisan ne respecte pas le devis ?',
    answer:
      "Mettre en demeure par lettre recommandée de revenir à la conformité, avec délai raisonnable (15-30 jours). Si l'artisan persiste : résolution du contrat pour inexécution. L'article 1217 du Code civil ouvre 5 options cumulables ou alternatives : exécution forcée, réduction du prix, résolution, dommages et intérêts, exception d'inexécution (suspension de paiement). Documentez l'inexécution (photos, constats d'huissier si nécessaire).",
  },
  {
    question: 'Le vice du consentement permet-il d’annuler un devis ?',
    answer:
      "Oui mais la preuve est à votre charge. L'erreur sur la substance (art. 1132 Code civil) annule le contrat si elle porte sur une qualité essentielle (matériau, performance thermique, label RGE inexistant) et si elle est excusable. Le dol (art. 1137) — manœuvre frauduleuse, mensonge sur un élément déterminant — est plus solide à démontrer. Conservez tous les échanges écrits, brochures, photos, enregistrements (avec accord des parties) avant signature.",
  },
  {
    question: 'L’artisan exige le paiement du devis, que faire ?',
    answer:
      "Distinguez deux cas. (1) Le chantier n'a pas commencé : l'artisan ne peut exiger que l'acompte contractuel et éventuellement des frais engagés justifiés (étude, commande de matériau spécifique non retournable). (2) Le chantier a commencé : l'artisan a droit au paiement de la partie exécutée à la valeur du marché, pas forcément au prix du devis initial. Dans les deux cas, exigez factures détaillées et justificatifs ; contestez par écrit tout montant non justifié.",
  },
  {
    question: 'Peut-on négocier une annulation à l’amiable ?',
    answer:
      "Oui et c'est souvent la meilleure voie. Proposez par écrit : annulation amiable du devis, remboursement acompte moins frais réellement engagés justifiés par l'artisan (maximum recommandé : 10 à 20 % de l'acompte). Signature d'un avenant de résiliation bilatérale évite toute contestation ultérieure. De nombreux artisans préfèrent cette issue à un litige long.",
  },
  {
    question: 'Le devis précise « non remboursable » : est-ce valide ?',
    answer:
      "Pour le délai de rétractation légal : non, aucune clause ne peut y déroger. Pour les autres cas : une clause de non-remboursement d'acompte est licite uniquement si elle est claire, spécifique et équilibrée. Une clause abusive (acompte supérieur à 30 %, non-remboursement de l'intégralité même si l'artisan n'a rien engagé) est réputée non écrite par le juge (art. L212-1 Code de la consommation).",
  },
  {
    question: 'Et si l’artisan disparaît après signature ?',
    answer:
      "Premier réflexe : vérifier le SIRET sur annuaire-entreprises.data.gouv.fr. Si l'entreprise est en procédure collective, contactez le mandataire (coordonnées au BODACC) pour déclarer votre créance. Si l'entreprise est introuvable mais active, engagez une procédure pour faute d'exécution. Si l'artisan est un micro-entrepreneur insolvable, votre créance peut être difficile à recouvrer ; privilégiez l'assurance décennale si les travaux ont commencé et présentent des vices.",
  },
  {
    question: 'Combien coûte une procédure judiciaire ?',
    answer:
      "Frais de timbre fiscal : 35 €. Frais d'huissier si constat : 150-300 €. Frais d'expertise éventuelle : 500-2 500 €. Avocat (obligatoire au-delà de 10 000 € de litige) : 1 500-5 000 €. Une partie des frais peut être mise à la charge du perdant (art. 700 Code de procédure civile). L'aide juridictionnelle couvre tout ou partie selon les revenus. Évaluez la viabilité économique avant de lancer une action inférieure à 5 000 €.",
  },
]

const sources = [
  {
    label: 'Code de la consommation, art. L221-18 (rétractation 14 jours)',
    url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000032226997',
  },
  {
    label: 'Code civil, art. 1132 à 1144 (vices du consentement)',
    url: 'https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006070721/LEGISCTA000032041471',
  },
  {
    label: 'Code civil, art. 1217 à 1231 (inexécution du contrat)',
    url: 'https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006070721/LEGISCTA000032041431',
  },
  {
    label: 'Médiation de la consommation — liste officielle',
    url: 'https://www.economie.gouv.fr/mediation-conso',
  },
  {
    label: 'Signal Conso (DGCCRF)',
    url: 'https://signal.conso.gouv.fr',
  },
]

const relatedGuides = [
  { label: 'Délai de rétractation devis', href: '/guides/delai-retractation-devis-artisan' },
  { label: 'Comparer 3 devis d’artisans', href: '/guides/comparer-3-devis-artisans' },
  { label: 'Éviter les arnaques d’artisans', href: '/guides/eviter-arnaques-artisan' },
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
    section: 'Droit & Devis',
    keywords: [
      'refuser devis signé',
      'annuler devis artisan',
      'vice consentement devis',
      'inexécution artisan',
      'acompte travaux',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Refuser un devis signé', url: `/guides/${SLUG}` },
  ])
  const faqSchema = getFAQSchema(faqs)
  const howToSchema = getHowToSchema(howToSteps, {
    name: 'Annuler un devis signé en 6 étapes',
    description:
      'Procédure complète pour refuser ou annuler un devis d’artisan déjà signé, selon le motif.',
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Refuser un devis signé' }]}
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
              Refuser un devis d’artisan déjà signé : vos 4 options
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Un devis signé est un contrat. On ne l’annule pas « parce qu’on a changé d’avis »,
              sauf dans les 14 jours d’un démarchage ou d’une vente à distance. Voici les quatre
              voies qui permettent légalement d’en sortir, avec leurs conditions précises, leurs
              preuves exigées et leurs coûts.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Option 1 — Rétractation légale (14 jours)</h2>
            <p>
              C’est la voie la plus simple mais elle ne s’applique que si le devis a été signé hors
              établissement (à domicile, sur un salon) ou à distance. Aucun motif n’est exigé, la
              procédure se résume à envoyer une lettre ou un formulaire avant le 14ᵉ jour. L’acompte
              est remboursé intégralement sous 14 jours.
            </p>
            <p>
              <Link href="/guides/delai-retractation-devis-artisan">
                Consulter le guide complet du droit de rétractation →
              </Link>
            </p>

            <h2>Option 2 — Vice du consentement</h2>
            <p>
              Si vous avez signé sur la base d’une information trompeuse, d’une pression excessive
              ou d’une erreur sur une qualité essentielle, le Code civil vous permet d’obtenir la
              nullité. Trois hypothèses&nbsp;:
            </p>
            <ul>
              <li>
                <strong>Erreur sur la substance (art. 1132).</strong> Vous pensiez commander une
                pompe à chaleur RGE, le devis mentionnait en petit « hors qualification ». La
                qualité essentielle (RGE qui conditionne l’aide) est erronée.
              </li>
              <li>
                <strong>Dol (art. 1137).</strong> L’artisan a affirmé avec insistance qu’il était
                RGE, vous avez vérifié après et il ne l’est pas. Le mensonge déterminant est
                caractérisé.
              </li>
              <li>
                <strong>Violence morale (art. 1140).</strong> Rendez-vous au domicile d’une personne
                vulnérable avec pression psychologique pour signature immédiate, refus de partir
                sans acompte. La contrainte morale est caractérisée.
              </li>
            </ul>
            <p>
              Pour chacun, la charge de la preuve est à vous. Conservez brochures, enregistrements,
              SMS, témoignages de proches. Prescription : 5 ans à compter de la découverte du vice.
            </p>

            <h2>Option 3 — Inexécution par l’artisan</h2>
            <p>
              Si l’artisan ne respecte pas ses engagements, vous disposez de cinq moyens cumulables
              ou alternatifs (art. 1217 Code civil)&nbsp;:
            </p>
            <ul>
              <li>
                <strong>Exécution forcée</strong> — mise en demeure de revenir à la conformité dans
                un délai raisonnable.
              </li>
              <li>
                <strong>Réduction du prix</strong> — proportionnelle au manquement.
              </li>
              <li>
                <strong>Résolution du contrat</strong> — annulation rétroactive.
              </li>
              <li>
                <strong>Dommages-intérêts</strong> — compensation du préjudice.
              </li>
              <li>
                <strong>Exception d’inexécution</strong> — suspension de vos paiements tant que
                l’artisan n’exécute pas.
              </li>
            </ul>
            <p>
              Exemple concret&nbsp;: retard de 6 semaines sur un chantier prévu en 4, matériaux
              différents de ceux annoncés, RGE annoncé faux. Mise en demeure par LRAR, puis saisine
              médiation, puis tribunal.
            </p>

            <h2>Option 4 — Accord amiable</h2>
            <p>
              Souvent la voie la plus rapide et la moins coûteuse. Proposez par écrit une
              résiliation bilatérale avec remboursement de l’acompte, moins les frais réellement
              engagés (matériel commandé, étude technique). Signez un avenant clair pour verrouiller
              l’accord.
            </p>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <MailCheck className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-2">
                    Modèle — demande d’annulation amiable
                  </p>
                  <pre className="whitespace-pre-wrap text-sm text-sand-700 bg-sand-50 rounded p-3 border border-sand-200 font-mono leading-relaxed">
                    {`Objet : Demande d'annulation amiable du devis n°…
LRAR

Madame, Monsieur,

Je vous notifie par la présente mon souhait
d'annuler le devis référencé ci-dessus, signé le …,
pour la raison suivante : [motif détaillé].

Je vous propose une résiliation amiable avec :
- Annulation définitive du contrat ;
- Remboursement de l'acompte de … € sous 15 jours ;
- Déduction des frais réellement engagés, sur
  présentation de justificatifs.

À défaut d'accord sous 15 jours, j'engagerai les
voies de recours prévues par la loi.

Fait à …, le …
Signature`}
                  </pre>
                </div>
              </div>
            </div>

            <h2>Les 6 étapes si l’artisan refuse</h2>
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
                <strong>À éviter absolument.</strong> Cesser de répondre à l’artisan, bloquer les
                paiements sans notification écrite, « faire comme si le devis n’existait pas ». Le
                silence vaut acceptation tacite et aggrave votre responsabilité si l’affaire va en
                justice.
              </p>
            </div>

            <h2>Les signaux qui obligent à agir vite</h2>
            <ul className="not-prose space-y-2">
              {[
                'L’artisan commande des matériaux spécifiques non retournables — chaque jour de délai augmente le coût potentiel.',
                'L’acompte réclamé dépasse 30 %.',
                'L’artisan annonce un démarrage imminent malgré votre demande de suspension.',
                'Le devis contient une clause « travaux imprévus au réel » sans plafond.',
                'Vous avez perdu l’accès au devis original ou au formulaire de rétractation.',
              ].map((s) => (
                <li key={s} className="flex items-start gap-2">
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" aria-hidden />
                  <span>{s}</span>
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
