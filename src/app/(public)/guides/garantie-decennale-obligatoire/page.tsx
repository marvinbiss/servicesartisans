import type { Metadata } from 'next'
import Link from 'next/link'
import { ShieldCheck, Home, AlertTriangle, ArrowRight, CheckCircle2, Scale } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema, getHowToSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'garantie-decennale-obligatoire'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-20'
const MODIFIED = '2026-04-20'
const AUTHOR_NAME = 'Sophie Martin'

export const revalidate = 86400

const TITLE = 'Garantie décennale obligatoire 2026'
const DESCRIPTION =
  "Garantie décennale obligatoire 2026 : artisans concernés, ouvrages couverts (loi Spinetta), vérifier l'attestation, recours et exceptions."

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
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
}

const tldr = [
  'Oui, la décennale est obligatoire pour tout professionnel réalisant un ouvrage couvert par la loi Spinetta de 1978 (article 1792 du Code civil) : gros œuvre, étanchéité, chauffage, électricité, plomberie encastrée, menuiseries extérieures.',
  "Elle couvre 10 ans à compter de la réception des travaux, pour les désordres qui compromettent la solidité de l'ouvrage ou le rendent impropre à sa destination.",
  "L'attestation doit être remise AVANT le début du chantier. Vérifier : raison sociale, numéro SIRET, activités couvertes (libellé exact), période de validité, et que la compagnie figure sur la liste ACPR.",
  "Travaux exclus : entretien courant, peinture intérieure décorative, petits ouvrages éphémères. Certains auto-entrepreneurs multi-activités affichent une décennale qui ne couvre PAS l'activité réellement exercée : contrôle du libellé obligatoire.",
  "Sans décennale valide, vous êtes seul face aux désordres dix ans : faites un référé au TGI si l'artisan refuse de fournir l'attestation. Prix moyen d'une décennale artisan : 800-4 000 €/an selon métier et CA.",
]

const howToSteps = [
  {
    name: "Exiger l'attestation d'assurance décennale avant signature du devis",
    text: "Demandez par écrit (email) l'attestation à l'artisan AVANT de signer. Un pro honnête la transmet en 48 h. Un refus ou délai prolongé est un signal d'alerte : beaucoup de sinistres concernent des artisans qui ne l'avaient jamais fournie. Gardez la trace écrite pour preuve en cas de litige ultérieur.",
  },
  {
    name: "Vérifier l'identité de l'entreprise sur l'attestation",
    text: "L'attestation doit mentionner : raison sociale exacte (identique à celle du devis), numéro SIRET à 14 chiffres, adresse siège. Croisez avec le devis et avec la fiche INSEE (societe.com, annuaire-entreprises.data.gouv.fr). Une décennale au nom d'une autre société du même dirigeant ne vous couvre pas.",
  },
  {
    name: 'Contrôler les activités couvertes (point CRITIQUE)',
    text: "L'attestation liste les activités déclarées (exemple : « peinture intérieure, ravalement, isolation par l'extérieur »). Si vous faites poser une ITE mais que seule la peinture figure, vous n'êtes PAS couvert pour l'ITE. Faites préciser par écrit que l'activité exacte de votre chantier est bien mentionnée. En cas de doute, appelez la compagnie d'assurance pour confirmer.",
  },
  {
    name: 'Vérifier la période de validité',
    text: "L'attestation indique une période (exemple : « valable du 01/01/2026 au 31/12/2026 »). Elle doit couvrir la date de démarrage du chantier ET la date de réception. Si le chantier dépasse, demandez l'attestation renouvelée avant l'échéance. Attention : une attestation qui n'a pas été renouvelée est caduque même si la police court encore en théorie.",
  },
  {
    name: "Confirmer l'existence de la compagnie d'assurance",
    text: "Tout assureur opérant en France doit être agréé par l'ACPR (Autorité de contrôle prudentiel et de résolution) ou passeporté. Consultez le registre REGAFI (regafi.fr) pour vérifier que la compagnie inscrite sur l'attestation est un assureur légitime. Des attestations frauduleuses circulent, émises par des entités fantômes : cette vérification prend 2 minutes.",
  },
  {
    name: 'Conserver tous les documents 11 ans',
    text: "Devis, factures, attestation décennale, procès-verbal de réception, photos avant/pendant/après. Minimum 11 ans (la 10e année court jusqu'à son dernier jour). En cas de sinistre, ces documents sont exigés pour déclencher la garantie. Une bonne pratique : scan PDF dans un dossier cloud + impression papier.",
  },
]

const faqs = [
  {
    question: 'Tous les artisans du bâtiment sont-ils obligés de souscrire une décennale ?',
    answer:
      "Non, seuls ceux qui interviennent sur un ouvrage couvert par la loi Spinetta (article 1792 du Code civil) : gros œuvre, charpente, couverture, étanchéité, menuiseries extérieures, plomberie encastrée, chauffage, électricité, isolation, carrelage scellé, terrasses. Sont hors obligation : peintre en finition intérieure décorative (sauf si mise en œuvre d'enduit d'étanchéité ou ITE), carreleur posant du parquet flottant non fixé, nettoyeur, paysagiste sur plantations sans ouvrage maçonné. Dans le doute, demander une attestation : si l'artisan en a une, c'est qu'il entre dans le champ.",
  },
  {
    question: 'La garantie décennale couvre-t-elle tous les dommages ?',
    answer:
      "Non. Elle couvre uniquement : (1) les désordres qui compromettent la SOLIDITÉ de l'ouvrage (fissures structurelles, effondrement partiel, défaut de fondation), (2) les désordres qui le rendent IMPROPRE À SA DESTINATION (toiture qui fuit au point de rendre la pièce inhabitable, chauffage en panne qui empêche de chauffer). Elle NE couvre pas : défauts esthétiques (teinte de peinture, finition d'un joint), dommages d'usage normal, défauts apparents signalés à la réception (couverts par la garantie de parfait achèvement de 1 an), dommages causés par l'utilisateur (chocs, mauvais entretien).",
  },
  {
    question: 'Quelle différence entre décennale, biennale et parfait achèvement ?',
    answer:
      "Trois garanties distinctes qui se cumulent. (1) Parfait achèvement : 1 an après réception, couvre TOUS les désordres signalés par le client (même esthétiques) que l'entreprise doit corriger. (2) Biennale ou « garantie de bon fonctionnement » : 2 ans, concerne les éléments d'équipement dissociables du gros œuvre (volet roulant, chaudière, radiateur, chauffe-eau, robinet). (3) Décennale : 10 ans, dommages compromettant solidité ou destination de l'ouvrage, INDISSOCIABLEMENT liés au gros œuvre. Le même désordre peut basculer de l'une à l'autre selon la gravité : une chaudière tombée en panne la 2e année = biennale ; la même chaudière encastrée qui rend la maison inhabitable la 5e année = décennale.",
  },
  {
    question: 'Comment vérifier rapidement si un artisan est vraiment assuré en décennale ?',
    answer:
      "Quatre contrôles en moins de 5 minutes. (1) Comparez raison sociale + SIRET de l'attestation avec l'annuaire officiel (annuaire-entreprises.data.gouv.fr). (2) Lisez le libellé des activités couvertes : il doit correspondre EXACTEMENT à l'activité du devis. (3) Vérifiez que la date de validité englobe votre chantier. (4) Appelez le standard de la compagnie d'assurance citée (numéro sur leur site officiel, pas celui imprimé sur l'attestation) et donnez le numéro de contrat pour confirmation. En cas d'incohérence sur un seul point, ne signez pas.",
  },
  {
    question: "Que faire si l'artisan refuse de fournir l'attestation ?",
    answer:
      "C'est un signal d'alerte majeur. Démarche en 3 temps. (1) Envoyer une mise en demeure en LRAR exigeant l'attestation sous 8 jours, sans laquelle le devis sera considéré comme caduc. (2) Si l'artisan a déjà démarré, stopper le paiement des acomptes restants et signaler au TGI (référé possible pour contraindre à produire l'attestation, sous astreinte). (3) En parallèle : signaler aux Urssaf et à la CCI (travail illégal possible si absence d'assurance), à la DGCCRF (pratique commerciale trompeuse). Aucun artisan sérieux ne refuse de fournir cette attestation — c'est son meilleur argument commercial.",
  },
  {
    question: 'Combien coûte une décennale pour un artisan et est-elle obligatoirement chère ?',
    answer:
      "Le prix dépend de trois facteurs : métier exercé (couvreur, électricien = bas risque ; étancheur, charpentier, maçon = risque élevé), chiffre d'affaires annuel, antécédents de sinistralité. Ordres de grandeur 2026 (prime annuelle) : peintre 800-1 500 €, électricien 1 000-2 000 €, plombier-chauffagiste 1 500-3 000 €, maçon/couvreur 2 500-5 000 €, étancheur 3 000-8 000 €. Un artisan qui cite un prix « trop bas » comparé à un concurrent peut avoir rogné sur l'assurance : c'est un point à creuser dans la comparaison de devis.",
  },
  {
    question: "Le client peut-il activer directement la décennale de l'artisan ?",
    answer:
      "Oui, c'est le principe même. La décennale est une assurance « pour compte » : vous n'êtes pas signataire mais vous êtes bénéficiaire direct. En cas de désordre dans les 10 ans, vous envoyez : (1) une déclaration de sinistre en LRAR à l'artisan (qui doit la transmettre à son assureur) ET (2) une copie directe à la compagnie d'assurance mentionnée sur l'attestation. Si l'entreprise a disparu (liquidation, faillite), vous pouvez saisir l'assureur directement. Conservez bien l'attestation 11 ans : sans elle, c'est la compagnie qui a la main pour contester la couverture.",
  },
  {
    question: "Si l'artisan fait faillite, la décennale est-elle perdue ?",
    answer:
      "Non. Le contrat d'assurance décennale reste actif même après liquidation de l'entreprise : c'est l'assureur qui continue de couvrir les chantiers réalisés pendant la période de validité. C'est précisément pour cela qu'il est essentiel de garder une copie de l'attestation : elle prouve que votre chantier était couvert au moment de la réception. Si la compagnie d'assurance elle-même a disparu, le Fonds de garantie des assurances obligatoires (FGAO) prend le relais pour les sinistres ouvrant droit à indemnité.",
  },
]

const sources = [
  {
    label: 'Code civil — Article 1792 (principe de la responsabilité décennale)',
    url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006442238',
  },
  {
    label: "Code des assurances — Article L241-1 (obligation d'assurance)",
    url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006797396',
  },
  {
    label: 'Service-public.fr — Assurance décennale du constructeur',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F31059',
  },
  {
    label: "Fédération Française de l'Assurance — Guide décennale",
    url: 'https://www.franceassureurs.fr',
  },
  {
    label: 'REGAFI — Registre des agents financiers agréés ACPR',
    url: 'https://www.regafi.fr',
  },
]

const relatedGuides = [
  {
    label: 'Assurance dommage-ouvrage : obligatoire ou pas ?',
    href: '/guides/assurance-dommage-ouvrage',
  },
  {
    label: "Comment vérifier le SIRET d'un artisan",
    href: '/guides/verifier-siret-artisan',
  },
  {
    label: "Comparer 3 devis d'artisans efficacement",
    href: '/guides/comparer-3-devis-artisans',
  },
  {
    label: 'Labels et qualifications des artisans',
    href: '/guides/labels-qualifications-artisans',
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
    section: 'Réglementation travaux',
    keywords: [
      'garantie décennale',
      'décennale obligatoire',
      'loi Spinetta',
      'article 1792 code civil',
      'attestation décennale artisan',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Garantie décennale obligatoire', url: `/guides/${SLUG}` },
  ])
  const faqSchema = getFAQSchema(faqs)
  const howToSchema = getHowToSchema(howToSteps, {
    name: "Vérifier qu'un artisan est bien couvert par une décennale valide",
    description:
      "Méthode en 6 étapes pour contrôler l'attestation décennale d'un artisan avant de signer et se protéger 10 ans.",
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
            items={[
              { label: 'Guides', href: '/guides' },
              { label: 'Garantie décennale obligatoire' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden />
              Réglementation travaux · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Garantie décennale : quels artisans sont obligés, quels travaux sont couverts
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              La décennale n&apos;est pas une option commerciale&nbsp;: c&apos;est une obligation
              légale qui protège le propriétaire pendant dix ans. Mais tous les artisans n&apos;y
              sont pas soumis, et une attestation mal libellée peut laisser un chantier sans
              couverture réelle. Voici comment vérifier en 5 minutes que votre artisan est bien
              assuré pour l&apos;activité exacte de votre devis.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>D&apos;où vient l&apos;obligation décennale</h2>
            <p>
              La décennale moderne est issue de la <strong>loi Spinetta</strong> du 4 janvier 1978,
              désormais codifiée dans les articles 1792 et suivants du Code civil et les articles
              L241-1 à L242-1 du Code des assurances. Elle traduit un choix de société&nbsp;: la
              construction est une opération techniquement complexe, les désordres peuvent
              apparaître des années après la réception, et il est illégitime de faire porter au
              propriétaire non-sachant le risque d&apos;un défaut d&apos;exécution ou de conception.
            </p>
            <p>
              Concrètement, tout <strong>constructeur</strong> au sens large (entrepreneur,
              architecte, maître d&apos;œuvre, technicien, bureau d&apos;étude) qui intervient sur
              un ouvrage immobilier est présumé responsable pendant dix ans des désordres
              compromettant la solidité ou la destination de cet ouvrage. Et pour garantir la
              solvabilité de cette responsabilité, l&apos;État impose à tout professionnel concerné
              une assurance obligatoire&nbsp;: la garantie décennale.
            </p>

            <h2>Quels travaux sont concernés</h2>
            <h3>Le test des trois critères</h3>
            <p>
              Trois conditions cumulatives permettent de savoir si un chantier est dans le champ de
              la décennale&nbsp;:
            </p>
            <ol>
              <li>
                <strong>Il s&apos;agit d&apos;un ouvrage immobilier</strong>&nbsp;: une construction
                fixée au sol, durablement, par opposition à du mobilier ou à un élément amovible.
              </li>
              <li>
                <strong>Le désordre compromet la solidité ou la destination</strong>&nbsp;: fissures
                structurelles, affaissement, toit qui fuit, chauffage en panne, isolation qui ne
                fonctionne pas.
              </li>
              <li>
                <strong>Le désordre est caché au moment de la réception</strong> (ou se révèle
                après)&nbsp;: un défaut apparent et non signalé au PV de réception relève de la
                garantie de parfait achèvement, pas de la décennale.
              </li>
            </ol>

            <h3>Exemples concrets par métier</h3>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Métier</th>
                    <th className="p-3 border-b border-sand-200">Soumis à décennale ?</th>
                    <th className="p-3 border-b border-sand-200">Exemple de sinistre couvert</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  <tr className="border-b border-sand-100">
                    <td className="p-3 font-semibold">Maçon gros œuvre</td>
                    <td className="p-3">Oui, systématique</td>
                    <td className="p-3">Fissures de fondation, dalle affaissée</td>
                  </tr>
                  <tr className="border-b border-sand-100">
                    <td className="p-3 font-semibold">Couvreur-zingueur</td>
                    <td className="p-3">Oui, systématique</td>
                    <td className="p-3">Infiltration récurrente, faîtage défaillant</td>
                  </tr>
                  <tr className="border-b border-sand-100">
                    <td className="p-3 font-semibold">Plombier-chauffagiste</td>
                    <td className="p-3">Oui (canalisations encastrées, chauffage central)</td>
                    <td className="p-3">Canalisation encastrée qui fuit après 4 ans</td>
                  </tr>
                  <tr className="border-b border-sand-100">
                    <td className="p-3 font-semibold">Électricien</td>
                    <td className="p-3">Oui (installation encastrée)</td>
                    <td className="p-3">Court-circuit structurel, tableau défaillant</td>
                  </tr>
                  <tr className="border-b border-sand-100">
                    <td className="p-3 font-semibold">Isolation (combles, ITE)</td>
                    <td className="p-3">Oui</td>
                    <td className="p-3">ITE qui cloque, pont thermique non traité</td>
                  </tr>
                  <tr className="border-b border-sand-100">
                    <td className="p-3 font-semibold">Carreleur (sol scellé)</td>
                    <td className="p-3">Oui</td>
                    <td className="p-3">Décollement massif, fissures du support</td>
                  </tr>
                  <tr className="border-b border-sand-100">
                    <td className="p-3 font-semibold">Peintre (finition intérieure)</td>
                    <td className="p-3">Non (sauf enduit d&apos;étanchéité)</td>
                    <td className="p-3">Garantie de parfait achèvement seule (1 an)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">Parquet flottant</td>
                    <td className="p-3">Non (élément non scellé)</td>
                    <td className="p-3">Biennale sur bon fonctionnement (2 ans)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>La méthode de vérification en 6 étapes</h2>
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
                <strong>Attention aux attestations « activité générale bâtiment ».</strong> Un
                libellé trop large peut être contesté par l&apos;assureur en cas de sinistre,
                surtout sur une activité technique (étanchéité, isolation extérieure, installation
                pompe à chaleur). Exigez que l&apos;activité précise de votre chantier figure
                nommément dans la liste des activités assurées.
              </p>
            </div>

            <h2>Les trois garanties légales cumulées</h2>
            <p>
              La décennale n&apos;est pas la seule garantie issue d&apos;un chantier. Il en existe
              trois, qui se cumulent et couvrent des périodes et des désordres différents&nbsp;:
            </p>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Garantie</th>
                    <th className="p-3 border-b border-sand-200">Durée</th>
                    <th className="p-3 border-b border-sand-200">Ce qu&apos;elle couvre</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  <tr className="border-b border-sand-100">
                    <td className="p-3 font-semibold">Parfait achèvement</td>
                    <td className="p-3">1 an après réception</td>
                    <td className="p-3">
                      Tous les désordres signalés par le client, y compris esthétiques ou mineurs.
                      L&apos;entreprise doit les reprendre à ses frais.
                    </td>
                  </tr>
                  <tr className="border-b border-sand-100">
                    <td className="p-3 font-semibold">Bon fonctionnement (biennale)</td>
                    <td className="p-3">2 ans</td>
                    <td className="p-3">
                      Éléments d&apos;équipement dissociables du gros œuvre&nbsp;: volets roulants,
                      radiateurs, chauffe-eau, robinetterie, chaudière non encastrée.
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">Décennale</td>
                    <td className="p-3">10 ans</td>
                    <td className="p-3">
                      Désordres affectant la solidité de l&apos;ouvrage ou le rendant impropre à sa
                      destination. Ouvrages et éléments indissociables du gros œuvre.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>Check-list avant de signer un devis</h2>
            <ul className="not-prose space-y-2">
              {[
                'Attestation décennale reçue par écrit AVANT signature',
                'Raison sociale + SIRET identiques au devis',
                'Activité exacte du chantier présente dans la liste des activités couvertes',
                'Période de validité englobant démarrage ET réception prévue',
                "Compagnie d'assurance vérifiée sur REGAFI (regafi.fr)",
                "Attestation datée et signée par la compagnie (pas uniquement par l'artisan)",
                'Copie archivée 11 ans minimum (papier + cloud)',
              ].map((c) => (
                <li key={c} className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" aria-hidden />
                  <span>{c}</span>
                </li>
              ))}
            </ul>

            <h2>Que faire en cas de sinistre dans les 10 ans</h2>
            <p>
              Dès l&apos;apparition d&apos;un désordre, envoyez une déclaration de sinistre en
              <strong> lettre recommandée avec AR</strong> à l&apos;artisan ET une copie à la
              compagnie d&apos;assurance mentionnée sur l&apos;attestation. Indiquez la date
              d&apos;apparition du désordre, sa nature, et joignez des photos datées. Si
              l&apos;artisan est défaillant ou disparu, l&apos;assureur peut être saisi directement
              sur la base du contrat en cours à la date de réception.
            </p>
            <p>
              En cas de refus ou de silence de l&apos;assureur passé deux mois, saisir le{' '}
              <strong>médiateur de l&apos;assurance</strong> (saisine gratuite, délai de réponse 90
              jours). En dernier recours, action judiciaire en responsabilité devant le TGI —
              prescription de 10 ans à compter de la réception.
            </p>

            <div className="not-prose border border-primary-200 bg-primary-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <Scale className="w-5 h-5 text-primary-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-primary-900 m-0">
                <strong>Bonne pratique&nbsp;:</strong> remettre la copie de l&apos;attestation
                décennale avec le <em>procès-verbal de réception des travaux</em>. Ce PV est le
                point de départ du délai de 10 ans&nbsp;; avec l&apos;attestation datée en annexe,
                vous disposez de tous les éléments pour déclencher la garantie pendant toute sa
                durée.
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
            <Home className="w-10 h-10 mx-auto mb-3 opacity-90" aria-hidden />
            <h2 className="font-heading text-2xl font-bold mb-2">
              Trouvez un artisan dont la décennale est vérifiée
            </h2>
            <p className="text-primary-100 mb-5 max-w-xl mx-auto">
              Les artisans présentés sur ServicesArtisans sont identifiés par SIRET officiel et leur
              décennale est exigée. Demandez un devis à un pro vérifié près de chez vous.
            </p>
            <Link
              href="/devis"
              className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-6 py-3 rounded-lg hover:bg-primary-50 transition-colors"
            >
              <ShieldCheck className="w-4 h-4" aria-hidden /> Demander un devis
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
