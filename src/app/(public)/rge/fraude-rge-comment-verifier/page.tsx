import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ShieldCheck,
  AlertTriangle,
  FileCheck2,
  Search,
  Building2,
  Users,
  ArrowRight,
  ExternalLink,
  BookOpen,
  Flag,
  ShieldAlert,
} from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { SITE_URL, getAlternates, SITE_NAME } from '@/lib/seo/config'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'

export const revalidate = 86400

const PAGE_PATH = '/rge/fraude-rge-comment-verifier'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-04-09'
const MODIFIED = '2026-04-09'

export const metadata: Metadata = {
  title: 'Fraude RGE : comment vérifier qu’un artisan est vraiment certifié ?',
  description:
    'Guide pratique pour vérifier la certification RGE d’un artisan et éviter les arnaques à la rénovation énergétique. 5 méthodes de vérification, 7 drapeaux rouges, procédure en cas d’arnaque, sources officielles (France Rénov’, DGCCRF, Signal Conso).',
  alternates: getAlternates(PAGE_PATH),
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1 as const,
    'max-image-preview': 'large' as const,
    'max-video-preview': -1 as const,
  },
  openGraph: {
    title: 'Fraude RGE : comment vérifier qu’un artisan est vraiment certifié ?',
    description:
      'Annuaire France Rénov’, attestation RGE, SIREN, organismes certificateurs : toutes les vérifications à faire avant de signer un devis de rénovation énergétique.',
    type: 'article',
    locale: 'fr_FR',
    url: PAGE_URL,
    siteName: SITE_NAME,
    publishedTime: PUBLISHED,
    modifiedTime: MODIFIED,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fraude RGE : 5 méthodes pour vérifier un artisan certifié',
    description:
      'Comment repérer les faux artisans RGE et que faire en cas d’arnaque à la rénovation énergétique.',
  },
}

type Method = {
  n: number
  title: string
  lede: string
  body: string
  link?: { href: string; label: string; external?: boolean }
}

const METHODS: Method[] = [
  {
    n: 1,
    title: 'L’annuaire officiel France Rénov’',
    lede: 'La source gouvernementale de référence, mise à jour quotidiennement.',
    body: 'L’annuaire des professionnels RGE publié par France Rénov’ est alimenté chaque jour par l’ADEME à partir des fichiers transmis par les organismes certificateurs (Qualit’EnR, Qualibat, Qualifelec, Céquami, OPQIBI). C’est la seule source officielle pour vérifier qu’un artisan est RGE à l’instant T. Recherchez par nom, par SIRET ou par code postal, puis vérifiez que la qualification affichée correspond exactement aux travaux prévus : un artisan qualifié « QualiPAC Chauffage » n’est pas couvert pour de l’isolation des combles.',
    link: {
      href: 'https://france-renov.gouv.fr/annuaire-rge',
      label: 'france-renov.gouv.fr/annuaire-rge',
      external: true,
    },
  },
  {
    n: 2,
    title: 'L’attestation RGE (papier ou PDF)',
    lede: 'Six éléments doivent impérativement y figurer.',
    body: 'Une attestation RGE authentique contient : (1) le numéro de qualification, (2) la mention précise de la qualification (ex : « QualiPAC Chauffage CETI », « Qualibat RGE 8611 »), (3) le nom de l’organisme certificateur (Qualit’EnR, Qualibat, Qualifelec, Céquami, OPQIBI), (4) les dates de début et de fin de validité, (5) le logo RGE « Reconnu garant de l’environnement » accompagné de la signature France Rénov’, (6) le cachet ou la signature de l’organisme. Une attestation sans l’un de ces éléments — ou un simple logo RGE copié-collé sur un devis — est suspecte. La référence au label est encadrée par l’arrêté du 1er décembre 2015 modifié relatif aux critères de qualification.',
  },
  {
    n: 3,
    title: 'Le site de l’organisme certificateur',
    lede: 'Qualit’EnR, Qualibat, Qualifelec publient leurs propres annuaires.',
    body: 'Chaque organisme accrédité par le Cofrac tient un annuaire public de ses qualifiés. Qualit’EnR (pompes à chaleur, solaire, bois énergie), Qualibat (enveloppe du bâtiment, isolation), Qualifelec (électricité et bornes de recharge), Céquami (maîtrise d’œuvre, rénovation globale) et OPQIBI (bureaux d’études) permettent tous de rechercher un professionnel et de télécharger son certificat à jour. En cas de doute entre ce que vous dit l’artisan et ce que vous trouvez dans l’annuaire, c’est l’annuaire qui fait foi.',
  },
  {
    n: 4,
    title: 'Le croisement SIREN / SIRET',
    lede: 'Vérifier l’existence juridique et l’activité réelle déclarée.',
    body: 'Consultez gratuitement annuaire-entreprises.data.gouv.fr ou sirene.insee.fr avec le SIRET communiqué par l’artisan. Vérifiez que l’entreprise est active (pas en cessation), que le code APE correspond bien à une activité du bâtiment (4321A, 4329A, 4331Z, 4339Z, 4391A, 4399C…), que l’adresse du siège existe, et que l’entreprise a au moins quelques années d’ancienneté. Une société créée il y a trois semaines, domiciliée dans un centre d’affaires, et qui prétend être RGE sur une dizaine de qualifications doit déclencher une vérification approfondie.',
    link: {
      href: 'https://annuaire-entreprises.data.gouv.fr',
      label: 'annuaire-entreprises.data.gouv.fr',
      external: true,
    },
  },
  {
    n: 5,
    title: 'Les avis indépendants et signalements',
    lede: 'Recouper plusieurs sources pour détecter les schémas suspects.',
    body: 'Aucun avis isolé ne fait foi, mais un faisceau convergent est un bon indicateur. Croisez Google Maps, Trustpilot (en vérifiant les profils d’auteurs), Signal-Arnaques, les forums de consommateurs (UFC Que Choisir, CLCV) et les décisions publiées par le tribunal de commerce. Cherchez aussi le nom du dirigeant avec les mots-clés « arnaque », « fraude CEE » ou « pompe à chaleur » : les schémas répétitifs finissent presque toujours par ressortir publiquement.',
  },
]

type RedFlag = {
  title: string
  text: string
}

const RED_FLAGS: RedFlag[] = [
  {
    title: 'Démarchage téléphonique non sollicité',
    text: 'Depuis la loi n° 2020-901 du 24 juillet 2020 (article L223-1 du code de la consommation modifié), le démarchage téléphonique est interdit pour les travaux de rénovation énergétique. Un appel non sollicité qui vous propose une prime, une pompe à chaleur ou une isolation est, par construction, hors-la-loi : ne donnez aucune suite, et signalez l’appel.',
  },
  {
    title: '« 1 euro symbolique » ou « reste à charge nul »',
    text: 'Depuis la réforme des aides, le « 1 € symbolique » n’existe plus pour les opérations standards : un reste à charge minimum est obligatoire pour bénéficier de MaPrimeRénov’ et des CEE. Toute promesse de travaux gratuits ou quasi gratuits doit déclencher une alerte immédiate.',
  },
  {
    title: '« 100 % pris en charge par l’État »',
    text: 'Aucune aide publique ne finance à 100 % les travaux pour l’immense majorité des ménages. MaPrimeRénov’ est forfaitaire, les CEE dépendent du cours du cumac, et les deux se cumulent dans la limite d’un plafond. Toute formulation « aide de l’État à 100 % » est une simplification mensongère.',
  },
  {
    title: 'Signature du devis dans la foulée, sans réflexion',
    text: 'La pression à signer immédiatement — « si vous ne signez pas aujourd’hui, vous perdez la prime » — est une technique commerciale déloyale au sens de l’article L121-1 du code de la consommation. Un devis sérieux peut toujours être emporté, relu à tête reposée et comparé à d’autres.',
  },
  {
    title: 'Acompte supérieur à 30 % avant le début des travaux',
    text: 'Aucun texte n’impose un acompte supérieur à 30 % du montant du devis avant intervention. Demander davantage, en particulier la totalité « pour bloquer le matériel », est un signal fort : en cas de défaillance de l’entreprise, les sommes versées sont très difficilement récupérables.',
  },
  {
    title: 'Artisan absent de l’annuaire France Rénov’',
    text: 'Si le nom et le SIRET de l’artisan ne remontent ni dans l’annuaire France Rénov’, ni dans celui de l’organisme certificateur prétendu, il ne peut pas bénéficier du label RGE à cette date. Quelle que soit l’explication (« ça va être mis à jour la semaine prochaine », « on est en renouvellement »), les aides ne seront pas versées.',
  },
  {
    title: 'Pression psychologique et urgence artificielle',
    text: '« Dernier dossier de la région », « offre qui expire demain », « place limitée pour le technicien » : toutes ces formulations visent à empêcher la réflexion et la comparaison. Un professionnel sérieux sait qu’un chantier de rénovation se décide en plusieurs semaines, pas en une soirée.',
  },
]

const FAQ: Array<{ question: string; answer: string }> = [
  {
    question: 'L’artisan n’est plus dans l’annuaire France Rénov’, que faire ?',
    answer:
      'Contactez directement l’organisme certificateur cité sur sa dernière attestation (Qualit’EnR, Qualibat, Qualifelec…) pour savoir si la qualification est suspendue, en renouvellement ou définitivement retirée. Tant qu’elle n’apparaît pas dans l’annuaire officiel à la date de signature du devis, les aides MaPrimeRénov’ et les CEE liées à cette opération ne pourront pas être versées. Si vous avez déjà signé mais que les travaux n’ont pas commencé, vous pouvez exercer votre droit de rétractation dans les 14 jours suivant la signature hors établissement (article L221-18 du code de la consommation).',
  },
  {
    question:
      'Mon artisan était RGE mais sa qualification a expiré pendant les travaux : l’aide est-elle perdue ?',
    answer:
      'La règle générale est que la qualification RGE doit être valide à la date de signature du devis et à la date de facturation pour ouvrir droit aux aides (MaPrimeRénov’, CEE, éco-PTZ). Un retrait ou une non-reconduction survenant en cours de chantier n’annule pas rétroactivement l’éligibilité si les dates de devis et de facture encadrent bien des périodes couvertes. En cas de doute, demandez à France Rénov’ et à l’organisme instructeur une confirmation écrite avant tout versement.',
  },
  {
    question: 'Un sous-traitant non-RGE peut-il réaliser une partie du chantier ?',
    answer:
      'La sous-traitance est possible, mais les textes applicables à MaPrimeRénov’ et aux CEE exigent que l’entreprise titulaire du marché — celle qui facture et signe l’attestation — détienne elle-même la qualification RGE correspondant aux travaux. Le recours à un sous-traitant non qualifié ne fait pas perdre l’aide en soi, à condition que la responsabilité technique et la réception des travaux restent portées par l’entreprise RGE. Méfiez-vous en revanche des montages où l’entreprise « RGE » ne fait que prêter son cachet sans intervenir sur le chantier : c’est la définition même du prête-nom, pénalement répréhensible.',
  },
  {
    question: 'Que risque l’artisan qui frauderait le label RGE ?',
    answer:
      'Un artisan qui usurpe la qualification RGE ou qui fraude sur les pièces d’un dossier CEE / MaPrimeRénov’ s’expose à plusieurs sanctions cumulables : retrait de la qualification par l’organisme certificateur, radiation du registre France Rénov’, poursuites pour escroquerie (article 313-1 du code pénal, cinq ans d’emprisonnement et 375 000 euros d’amende), sanctions administratives de la DGCCRF pour pratiques commerciales trompeuses (articles L121-1 et suivants du code de la consommation), et restitution des primes indûment versées à l’Anah ou à l’obligé CEE.',
  },
  {
    question: 'Comment signaler une arnaque en cours ?',
    answer:
      'Signalez immédiatement les faits sur Signal Conso (signal.conso.gouv.fr), service officiel de la DGCCRF, qui transmet aux services d’enquête compétents. En parallèle, appelez le 3939 « Allô Service Public » pour un premier conseil. Si vous avez déjà subi un préjudice financier, déposez plainte auprès de la police ou de la gendarmerie pour escroquerie (article 313-1 du code pénal) : c’est une étape indispensable pour espérer un remboursement ou une action civile ultérieure.',
  },
  {
    question: 'Puis-je récupérer mon argent si j’ai déjà versé un acompte ?',
    answer:
      'Plusieurs leviers existent. D’abord, le droit de rétractation : si le devis a été signé hors établissement (à domicile, lors d’un salon…), vous disposez de 14 jours pour vous rétracter sans motif (article L221-18 du code de la consommation) et récupérer l’intégralité des sommes versées. Ensuite, les clauses abusives : certaines stipulations du contrat peuvent être réputées non écrites au titre de l’article L132-1 du code de la consommation. Enfin, si l’entreprise est en liquidation, vous pouvez déclarer votre créance au mandataire judiciaire. Dans tous les cas, contactez une association de consommateurs agréée (UFC Que Choisir, CLCV, Familles Rurales) pour être accompagné.',
  },
]

function getArticleSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    image: `${SITE_URL}/opengraph-image`,
    headline: 'Fraude RGE : comment vérifier qu’un artisan est vraiment certifié ?',
    description:
      'Guide pratique pour vérifier la certification RGE d’un artisan et éviter les arnaques à la rénovation énergétique. 5 méthodes de vérification, 7 drapeaux rouges, procédure en cas d’arnaque.',
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
      { '@type': 'Thing', name: 'Label RGE (Reconnu garant de l’environnement)' },
      { '@type': 'Thing', name: 'Arrêté du 1er décembre 2015 modifié' },
      { '@type': 'Thing', name: 'Fraude à la rénovation énergétique' },
      { '@type': 'Thing', name: 'Code de la consommation, articles L221-18 et L132-1' },
      { '@type': 'Thing', name: 'Code pénal, article 313-1' },
    ],
  }
}

export default function FraudeRgeVerifierPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Artisans RGE', url: '/rge' },
    { name: 'Fraude RGE : comment vérifier', url: PAGE_PATH },
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
          { label: 'Artisans RGE', href: '/rge' },
          { label: 'Fraude RGE : comment vérifier' },
        ]}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-charcoal-900 text-white py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/30 rounded-full px-4 py-1.5 mb-5">
            <ShieldAlert className="w-4 h-4 text-amber-200" />
            <span className="text-sm font-medium text-amber-100">
              Guide responsable — sources officielles France Rénov’ &amp; DGCCRF
            </span>
          </div>
          <h1 className="font-heading text-3xl md:text-5xl font-extrabold leading-tight mb-5">
            Fraude RGE&nbsp;: comment vérifier qu’un artisan est vraiment certifié&nbsp;?
          </h1>
          <p className="text-lg md:text-xl text-emerald-50/90 leading-relaxed">
            Faux labels, attestations bidon, démarchage téléphonique illégal, promesses d’aides
            «&nbsp;100&nbsp;%&nbsp;»&nbsp;: la fraude à la rénovation énergétique reste un angle
            mort pour de nombreux ménages.
          </p>
          <div
            className="speakable-summary mt-6 text-base md:text-lg text-emerald-50/80 leading-relaxed border-l-2 border-emerald-400/40 pl-4"
            data-speakable="true"
          >
            <p>
              Cinq vérifications simples suffisent pour filtrer la quasi-totalité des
              arnaques&nbsp;: l’annuaire France Rénov’, l’attestation RGE complète, le site de
              l’organisme certificateur, le SIREN et les avis indépendants. Sept drapeaux rouges
              permettent de repérer un dossier douteux avant toute signature, et six réflexes
              structurent la réaction si le piège s’est déjà refermé.
            </p>
          </div>
        </div>
      </section>

      {/* Intro éditoriale */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <p className="text-charcoal-700 leading-relaxed text-lg mb-4">
          La fraude aux aides à la rénovation énergétique n’est ni marginale, ni nouvelle. Chaque
          année, la
          <strong> DGCCRF</strong> publie dans son rapport d’activité un bilan des contrôles menés
          dans le secteur «&nbsp;rénovation énergétique&nbsp;», où figurent des taux d’anomalie
          élevés ainsi que des procédures engagées à la suite de signalements via{' '}
          <strong>Signal Conso</strong>. Ces constats sont documentés par l’administration
          elle-même&nbsp;: nous renvoyons aux rapports officiels plutôt que d’avancer des chiffres
          reconstitués.
        </p>
        <p className="text-charcoal-700 leading-relaxed mb-4">
          L’objectif de ce guide est simple&nbsp;: donner à un particulier tous les outils pour
          vérifier en quelques minutes qu’un artisan est bien reconnu «&nbsp;Reconnu garant de
          l’environnement&nbsp;» (RGE), repérer les signaux qui distinguent un professionnel sérieux
          d’un opérateur douteux, et savoir réagir si un dossier a déjà été signé dans la
          précipitation.
        </p>
        <p className="text-charcoal-700 leading-relaxed">
          Le label RGE lui-même est encadré par l’arrêté du 1er décembre 2015 modifié, qui fixe les
          critères de qualification et la liste des organismes accrédités par le Cofrac. Les aides
          auxquelles il conditionne l’éligibilité (MaPrimeRénov’, CEE, éco-PTZ) sont des fonds
          publics ou quasi publics&nbsp;: leur versement sur la base d’une fausse qualification est
          constitutif d’escroquerie au sens de l’article 313-1 du code pénal.
        </p>
      </section>

      {/* L'ampleur du problème */}
      <section className="bg-sand-50 border-y border-charcoal-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-700" />
            </div>
            <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900">
              Quelle est l’ampleur de la fraude RGE en France&nbsp;?
            </h2>
          </div>
          <p className="text-charcoal-700 leading-relaxed mb-4">
            La rénovation énergétique figure depuis plusieurs exercices parmi les{' '}
            <strong>priorités d’enquête de la DGCCRF</strong>. L’administration a multiplié les
            procédures — avertissements, injonctions, procès-verbaux pénaux, sanctions
            administratives — contre des opérateurs se présentant comme RGE sans l’être, démarchant
            illégalement par téléphone ou usurpant les logos officiels de MaPrimeRénov’.
          </p>
          <p className="text-charcoal-700 leading-relaxed mb-4">
            Les signalements déposés sur <strong>Signal Conso</strong>, téléservice officiel de la
            DGCCRF, progressent également d’année en année pour cette catégorie. Le même constat
            ressort des signalements collectés via <em>signal-arnaques.com</em> et des alertes
            publiées par les associations de consommateurs (UFC Que Choisir, CLCV, Familles
            Rurales).
          </p>
          <p className="text-charcoal-700 leading-relaxed">
            Pour les chiffres précis et actualisés, la référence reste le{' '}
            <strong>rapport annuel de la DGCCRF</strong>, publié sur economie.gouv.fr, ainsi que les
            communications officielles du service public <strong>France Rénov’</strong>. Nous nous
            gardons de diffuser des chiffres que nous ne saurions sourcer&nbsp;: mieux vaut renvoyer
            à la source qu’inventer un ordre de grandeur.
          </p>
        </div>
      </section>

      {/* 5 méthodes de vérification */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-14">
        <h2 className="font-heading text-2xl md:text-4xl font-extrabold text-charcoal-900 mb-3">
          Comment vérifier qu’un artisan est vraiment RGE&nbsp;? (5 méthodes officielles)
        </h2>
        <p className="text-charcoal-600 max-w-3xl mb-10 leading-relaxed">
          Ces cinq vérifications sont cumulatives&nbsp;: chacune filtre un type d’arnaque différent.
          Compter moins de quinze minutes pour les réaliser toutes.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {METHODS.map((m) => (
            <article
              key={m.n}
              className="bg-white rounded-2xl border border-charcoal-200 p-6 flex flex-col"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0 font-heading font-extrabold text-emerald-700">
                  {m.n}
                </div>
                <div>
                  <h3 className="font-heading text-xl font-bold text-charcoal-900">{m.title}</h3>
                  <p className="text-sm text-emerald-700 font-medium mt-0.5">{m.lede}</p>
                </div>
              </div>
              <p className="text-sm text-charcoal-700 leading-relaxed">{m.body}</p>
              {m.link && (
                <a
                  href={m.link.href}
                  target={m.link.external ? '_blank' : undefined}
                  rel={m.link.external ? 'noopener noreferrer nofollow' : undefined}
                  className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-emerald-700 hover:text-emerald-900"
                >
                  <ExternalLink className="w-4 h-4" aria-hidden="true" />
                  {m.link.label}
                </a>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* 7 drapeaux rouges */}
      <section className="bg-sand-50 border-y border-charcoal-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <Flag className="w-5 h-5 text-red-700" />
            </div>
            <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900">
              Quels sont les 7 signaux d’alerte d’une fraude RGE&nbsp;?
            </h2>
          </div>
          <p className="text-charcoal-700 leading-relaxed mb-8">
            Un seul de ces signaux ne suffit pas toujours à qualifier une arnaque, mais leur cumul,
            lui, est sans ambiguïté.
          </p>
          <ul className="space-y-3">
            {RED_FLAGS.map((f, i) => (
              <li
                key={i}
                className="flex items-start gap-3 bg-white rounded-xl border border-charcoal-200 p-4"
              >
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0 font-heading font-extrabold text-red-700 text-sm">
                  {i + 1}
                </div>
                <div>
                  <div className="font-semibold text-charcoal-900 mb-1">{f.title}</div>
                  <p className="text-sm text-charcoal-700 leading-relaxed">{f.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Que faire si victime */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
            <Search className="w-5 h-5 text-primary-600" />
          </div>
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900">
            Que faire si vous pensez être victime d’une arnaque RGE&nbsp;?
          </h2>
        </div>
        <p className="text-charcoal-700 leading-relaxed mb-6">
          La pire des réactions est l’inaction. Les délais comptent&nbsp;: rétractation,
          prescription pénale, suspension d’un dossier MaPrimeRénov’ en cours d’instruction. Voici
          la séquence recommandée.
        </p>
        <ol className="space-y-4">
          {[
            {
              title: 'Arrêter immédiatement tout nouveau versement',
              text: 'Premier réflexe&nbsp;: ne signer aucun document supplémentaire, ne pas verser d’acompte complémentaire, ne pas valider un avenant. Toute somme encore entre vos mains est beaucoup plus facile à défendre qu’un versement déjà effectué.',
            },
            {
              title: 'Rassembler l’ensemble des documents',
              text: 'Devis, bon de commande, attestation sur l’honneur, factures, mails, SMS, compte-rendu d’appel, photos du chantier&nbsp;: tout doit être conservé dans un dossier unique, même les éléments qui vous paraissent anodins. Un bon dossier est la condition d’une procédure efficace.',
            },
            {
              title: 'Signaler à Signal Conso (signal.conso.gouv.fr) et au 3939',
              text: 'Signal Conso est le téléservice officiel de la DGCCRF. Votre signalement est transmis à l’entreprise, à la DGCCRF et peut déclencher une enquête. En parallèle, le 3939 «&nbsp;Allô Service Public&nbsp;» donne un premier conseil personnalisé.',
            },
            {
              title: 'Porter plainte pour escroquerie (article 313-1 du code pénal)',
              text: 'Rendez-vous au commissariat ou à la gendarmerie pour déposer plainte. L’escroquerie est punie de cinq ans d’emprisonnement et 375&nbsp;000 euros d’amende, et les circonstances aggravantes (bande organisée, usage d’une fausse qualité) alourdissent les peines. Une plainte est indispensable pour toute action civile ou récupération ultérieure.',
            },
            {
              title: 'Contacter une association de consommateurs agréée',
              text: 'UFC Que Choisir, CLCV, Familles Rurales et les autres associations agréées au titre de l’article L811-1 du code de la consommation disposent de juristes qui peuvent vous orienter gratuitement ou moyennant une adhésion modique, et vous assister dans la constitution du dossier.',
            },
            {
              title: 'Si MaPrimeRénov’ ou CEE déjà versés&nbsp;: alerter l’Anah et la DGEC',
              text: 'Si des aides ont déjà été versées (par l’Anah pour MaPrimeRénov’, par un délégataire pour les CEE), signalez la situation à l’Anah et à la Direction générale de l’énergie et du climat (DGEC). La suspension du dossier peut éviter des versements supplémentaires, et la restitution des fonds indus peut être mise à la charge de l’auteur de la fraude.',
            },
          ].map((s, i) => (
            <li
              key={i}
              className="flex items-start gap-3 bg-white rounded-xl border border-charcoal-200 p-4"
            >
              <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0 font-heading font-extrabold text-primary-600 text-sm">
                {i + 1}
              </div>
              <div>
                <div
                  className="font-semibold text-charcoal-900 mb-1"
                  dangerouslySetInnerHTML={{ __html: s.title }}
                />
                <p
                  className="text-sm text-charcoal-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: s.text }}
                />
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-8 bg-emerald-50 border border-emerald-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <FileCheck2 className="w-5 h-5 text-emerald-700 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-semibold text-emerald-900 mb-1">
                Droit de rétractation — 14 jours
              </div>
              <p className="text-sm text-emerald-900/90 leading-relaxed">
                Lorsque le devis a été signé hors établissement (à votre domicile, lors d’une foire,
                sur un salon, par téléphone après démarchage), vous disposez d’un délai de
                <strong> 14 jours calendaires</strong> pour exercer votre droit de rétractation sans
                avoir à vous justifier, en application de l’article L221-18 du code de la
                consommation. Le vendeur est tenu de vous rembourser l’intégralité des sommes
                versées dans les 14 jours suivant la réception de votre rétractation. Les clauses
                contraires sont réputées non écrites au titre de l’article L132-1.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Rôle de ServicesArtisans */}
      <section className="bg-sand-50 border-y border-charcoal-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-emerald-700" />
            </div>
            <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900">
              Le rôle de ServicesArtisans
            </h2>
          </div>
          <p className="text-charcoal-700 leading-relaxed mb-4">
            ServicesArtisans diffuse environ 50&nbsp;000 fiches d’artisans titulaires d’une
            qualification RGE. Ces fiches sont intégralement sourcées du{' '}
            <strong>dataset officiel ADEME «&nbsp;Annuaire des professionnels RGE&nbsp;»</strong>,
            publié sur data.gouv.fr sous licence ouverte Etalab 2.0, et synchronisées de façon
            hebdomadaire pour refléter les entrées, sorties et renouvellements.
          </p>
          <p className="text-charcoal-700 leading-relaxed mb-4">
            Nous ne sommes pas un organisme certificateur&nbsp;: nous ne délivrons aucune
            qualification, nous ne contrôlons pas les chantiers et nous ne nous substituons pas à
            France Rénov’ ni à la DGCCRF. Notre rôle se limite à rendre l’information publique plus
            accessible — par métier, par ville, par département — et à renvoyer systématiquement aux
            sources officielles.
          </p>
          <p className="text-charcoal-700 leading-relaxed">
            En cas de doute sur un artisan de notre annuaire, la vérification finale se fait
            toujours sur <em>france-renov.gouv.fr/annuaire-rge</em>&nbsp;: c’est la source de vérité
            à l’instant T. Nos pages détaillent notre méthodologie et nos sources.
          </p>
          <div className="mt-6">
            <Link
              href="/rge/sources"
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-900"
            >
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
              Nos sources et notre méthodologie
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
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
      </section>

      {/* Sources officielles */}
      <section className="bg-sand-50 border-y border-charcoal-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
          <h2 className="font-heading text-xl md:text-2xl font-extrabold text-charcoal-900 mb-4">
            Sources réglementaires et officielles
          </h2>
          <ul className="space-y-3 text-sm text-charcoal-700">
            <li className="flex items-start gap-2">
              <ExternalLink className="w-4 h-4 text-emerald-700 mt-0.5 flex-shrink-0" />
              <span>
                Arrêté du 1er décembre 2015 modifié, relatif aux critères de qualifications requis
                pour bénéficier du label «&nbsp;Reconnu garant de l’environnement&nbsp;» (RGE).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <ExternalLink className="w-4 h-4 text-emerald-700 mt-0.5 flex-shrink-0" />
              <span>
                Code de la consommation, articles L221-18 (droit de rétractation) et L132-1 (clauses
                abusives).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <ExternalLink className="w-4 h-4 text-emerald-700 mt-0.5 flex-shrink-0" />
              <span>
                Code pénal, article 313-1 (escroquerie)&nbsp;: cinq ans d’emprisonnement et
                375&nbsp;000 euros d’amende.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <ExternalLink className="w-4 h-4 text-emerald-700 mt-0.5 flex-shrink-0" />
              <span>
                Loi n° 2020-901 du 24 juillet 2020 encadrant le démarchage téléphonique —
                interdiction pour les travaux de rénovation énergétique.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <ExternalLink className="w-4 h-4 text-emerald-700 mt-0.5 flex-shrink-0" />
              <span>
                Rapport annuel de la DGCCRF (economie.gouv.fr) — bilan des contrôles dans le secteur
                de la rénovation énergétique.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <ExternalLink className="w-4 h-4 text-emerald-700 mt-0.5 flex-shrink-0" />
              <span>
                France Rénov’ — annuaire officiel des professionnels RGE, tenu par l’ADEME pour le
                compte de l’État.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <ExternalLink className="w-4 h-4 text-emerald-700 mt-0.5 flex-shrink-0" />
              <span>
                Signal Conso (signal.conso.gouv.fr) — téléservice officiel de signalement à la
                DGCCRF.
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* CTAs finaux */}
      <section className="bg-gradient-to-br from-emerald-700 to-emerald-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold mb-4">Aller plus loin</h2>
          <p className="text-emerald-100 max-w-2xl mx-auto mb-8 leading-relaxed">
            Consultez notre annuaire RGE sourcé du dataset officiel ADEME, notre méthodologie, et
            les sources gouvernementales de référence.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/rge"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-emerald-800 font-semibold shadow-lg hover:bg-emerald-50 transition"
            >
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
              Annuaire artisans RGE
            </Link>
            <Link
              href="/rge/sources"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-400 transition"
            >
              <BookOpen className="w-5 h-5" aria-hidden="true" />
              Nos sources RGE
            </Link>
            <Link
              href="/rge/comment-devenir-rge"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-emerald-300/60 text-white font-semibold hover:bg-emerald-600/30 transition"
            >
              <Users className="w-5 h-5" aria-hidden="true" />
              Comment devenir RGE
            </Link>
            <a
              href="https://france-renov.gouv.fr/annuaire-rge"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-emerald-300/60 text-white font-semibold hover:bg-emerald-600/30 transition"
            >
              <ExternalLink className="w-5 h-5" aria-hidden="true" />
              France Rénov’
            </a>
            <a
              href="https://signal.conso.gouv.fr"
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-emerald-300/60 text-white font-semibold hover:bg-emerald-600/30 transition"
            >
              <ExternalLink className="w-5 h-5" aria-hidden="true" />
              Signal Conso
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
