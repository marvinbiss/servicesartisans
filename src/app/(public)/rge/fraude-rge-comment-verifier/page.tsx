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
      <section className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-slate-900 text-white py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/30 rounded-full px-4 py-1.5 mb-5">
            <ShieldAlert className="w-4 h-4 text-amber-200" />
            <span className="text-sm font-medium text-amber-100">
              Guide responsable &mdash; sources officielles France R&eacute;nov&rsquo; &amp; DGCCRF
            </span>
          </div>
          <h1 className="font-heading text-3xl md:text-5xl font-extrabold leading-tight mb-5">
            Fraude RGE&nbsp;: comment v&eacute;rifier qu&rsquo;un artisan est vraiment
            certifi&eacute;&nbsp;?
          </h1>
          <p className="text-lg md:text-xl text-emerald-50/90 leading-relaxed">
            Faux labels, attestations bidon, d&eacute;marchage t&eacute;l&eacute;phonique
            ill&eacute;gal, promesses d&rsquo;aides &laquo;&nbsp;100&nbsp;%&nbsp;&raquo;&nbsp;: la
            fraude &agrave; la r&eacute;novation &eacute;nerg&eacute;tique reste un angle mort pour
            de nombreux m&eacute;nages.
          </p>
          <div
            className="speakable-summary mt-6 text-base md:text-lg text-emerald-50/80 leading-relaxed border-l-2 border-emerald-400/40 pl-4"
            data-speakable="true"
          >
            <p>
              Cinq v&eacute;rifications simples suffisent pour filtrer la quasi-totalit&eacute; des
              arnaques&nbsp;: l&rsquo;annuaire France R&eacute;nov&rsquo;, l&rsquo;attestation RGE
              compl&egrave;te, le site de l&rsquo;organisme certificateur, le SIREN et les avis
              ind&eacute;pendants. Sept drapeaux rouges permettent de rep&eacute;rer un dossier
              douteux avant toute signature, et six r&eacute;flexes structurent la r&eacute;action
              si le pi&egrave;ge s&rsquo;est d&eacute;j&agrave; referm&eacute;.
            </p>
          </div>
        </div>
      </section>

      {/* Intro éditoriale */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <p className="text-slate-700 leading-relaxed text-lg mb-4">
          La fraude aux aides &agrave; la r&eacute;novation &eacute;nerg&eacute;tique n&rsquo;est ni
          marginale, ni nouvelle. Chaque ann&eacute;e, la
          <strong> DGCCRF</strong> publie dans son rapport d&rsquo;activit&eacute; un bilan des
          contr&ocirc;les men&eacute;s dans le secteur &laquo;&nbsp;r&eacute;novation
          &eacute;nerg&eacute;tique&nbsp;&raquo;, o&ugrave; figurent des taux d&rsquo;anomalie
          &eacute;lev&eacute;s ainsi que des proc&eacute;dures engag&eacute;es &agrave; la suite de
          signalements via <strong>Signal Conso</strong>. Ces constats sont document&eacute;s par
          l&rsquo;administration elle-m&ecirc;me&nbsp;: nous renvoyons aux rapports officiels
          plut&ocirc;t que d&rsquo;avancer des chiffres reconstitu&eacute;s.
        </p>
        <p className="text-slate-700 leading-relaxed mb-4">
          L&rsquo;objectif de ce guide est simple&nbsp;: donner &agrave; un particulier tous les
          outils pour v&eacute;rifier en quelques minutes qu&rsquo;un artisan est bien reconnu
          &laquo;&nbsp;Reconnu garant de l&rsquo;environnement&nbsp;&raquo; (RGE), rep&eacute;rer
          les signaux qui distinguent un professionnel s&eacute;rieux d&rsquo;un op&eacute;rateur
          douteux, et savoir r&eacute;agir si un dossier a d&eacute;j&agrave; &eacute;t&eacute;
          sign&eacute; dans la pr&eacute;cipitation.
        </p>
        <p className="text-slate-700 leading-relaxed">
          Le label RGE lui-m&ecirc;me est encadr&eacute; par l&rsquo;arr&ecirc;t&eacute; du 1er
          d&eacute;cembre 2015 modifi&eacute;, qui fixe les crit&egrave;res de qualification et la
          liste des organismes accr&eacute;dit&eacute;s par le Cofrac. Les aides auxquelles il
          conditionne l&rsquo;&eacute;ligibilit&eacute; (MaPrimeR&eacute;nov&rsquo;, CEE,
          &eacute;co-PTZ) sont des fonds publics ou quasi publics&nbsp;: leur versement sur la base
          d&rsquo;une fausse qualification est constitutif d&rsquo;escroquerie au sens de
          l&rsquo;article 313-1 du code p&eacute;nal.
        </p>
      </section>

      {/* L'ampleur du problème */}
      <section className="bg-slate-50 border-y border-slate-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-700" />
            </div>
            <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-900">
              L&rsquo;ampleur du probl&egrave;me
            </h2>
          </div>
          <p className="text-slate-700 leading-relaxed mb-4">
            La r&eacute;novation &eacute;nerg&eacute;tique figure depuis plusieurs exercices parmi
            les <strong>priorit&eacute;s d&rsquo;enqu&ecirc;te de la DGCCRF</strong>.
            L&rsquo;administration a multipli&eacute; les proc&eacute;dures &mdash; avertissements,
            injonctions, proc&egrave;s-verbaux p&eacute;naux, sanctions administratives &mdash;
            contre des op&eacute;rateurs se pr&eacute;sentant comme RGE sans l&rsquo;&ecirc;tre,
            d&eacute;marchant ill&eacute;galement par t&eacute;l&eacute;phone ou usurpant les logos
            officiels de MaPrimeR&eacute;nov&rsquo;.
          </p>
          <p className="text-slate-700 leading-relaxed mb-4">
            Les signalements d&eacute;pos&eacute;s sur <strong>Signal Conso</strong>,
            t&eacute;l&eacute;service officiel de la DGCCRF, progressent &eacute;galement
            d&rsquo;ann&eacute;e en ann&eacute;e pour cette cat&eacute;gorie. Le m&ecirc;me constat
            ressort des signalements collect&eacute;s via <em>signal-arnaques.com</em> et des
            alertes publi&eacute;es par les associations de consommateurs (UFC Que Choisir, CLCV,
            Familles Rurales).
          </p>
          <p className="text-slate-700 leading-relaxed">
            Pour les chiffres pr&eacute;cis et actualis&eacute;s, la r&eacute;f&eacute;rence reste
            le <strong>rapport annuel de la DGCCRF</strong>, publi&eacute; sur economie.gouv.fr,
            ainsi que les communications officielles du service public{' '}
            <strong>France R&eacute;nov&rsquo;</strong>. Nous nous gardons de diffuser des chiffres
            que nous ne saurions sourcer&nbsp;: mieux vaut renvoyer &agrave; la source
            qu&rsquo;inventer un ordre de grandeur.
          </p>
        </div>
      </section>

      {/* 5 méthodes de vérification */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-14">
        <h2 className="font-heading text-2xl md:text-4xl font-extrabold text-slate-900 mb-3">
          Les 5 m&eacute;thodes pour v&eacute;rifier qu&rsquo;un artisan est vraiment RGE
        </h2>
        <p className="text-slate-600 max-w-3xl mb-10 leading-relaxed">
          Ces cinq v&eacute;rifications sont cumulatives&nbsp;: chacune filtre un type
          d&rsquo;arnaque diff&eacute;rent. Compter moins de quinze minutes pour les r&eacute;aliser
          toutes.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {METHODS.map((m) => (
            <article
              key={m.n}
              className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0 font-heading font-extrabold text-emerald-700">
                  {m.n}
                </div>
                <div>
                  <h3 className="font-heading text-xl font-bold text-slate-900">{m.title}</h3>
                  <p className="text-sm text-emerald-700 font-medium mt-0.5">{m.lede}</p>
                </div>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{m.body}</p>
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
      <section className="bg-slate-50 border-y border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <Flag className="w-5 h-5 text-red-700" />
            </div>
            <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-900">
              Les 7 drapeaux rouges &agrave; rep&eacute;rer
            </h2>
          </div>
          <p className="text-slate-700 leading-relaxed mb-8">
            Un seul de ces signaux ne suffit pas toujours &agrave; qualifier une arnaque, mais leur
            cumul, lui, est sans ambigu&iuml;t&eacute;.
          </p>
          <ul className="space-y-3">
            {RED_FLAGS.map((f, i) => (
              <li
                key={i}
                className="flex items-start gap-3 bg-white rounded-xl border border-slate-200 p-4"
              >
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0 font-heading font-extrabold text-red-700 text-sm">
                  {i + 1}
                </div>
                <div>
                  <div className="font-semibold text-slate-900 mb-1">{f.title}</div>
                  <p className="text-sm text-slate-700 leading-relaxed">{f.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Que faire si victime */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Search className="w-5 h-5 text-blue-700" />
          </div>
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-900">
            Que faire si vous pensez &ecirc;tre victime d&rsquo;une arnaque RGE&nbsp;?
          </h2>
        </div>
        <p className="text-slate-700 leading-relaxed mb-6">
          La pire des r&eacute;actions est l&rsquo;inaction. Les d&eacute;lais comptent&nbsp;:
          r&eacute;tractation, prescription p&eacute;nale, suspension d&rsquo;un dossier
          MaPrimeR&eacute;nov&rsquo; en cours d&rsquo;instruction. Voici la s&eacute;quence
          recommand&eacute;e.
        </p>
        <ol className="space-y-4">
          {[
            {
              title: 'Arr&ecirc;ter imm&eacute;diatement tout nouveau versement',
              text: 'Premier r&eacute;flexe&nbsp;: ne signer aucun document suppl&eacute;mentaire, ne pas verser d&rsquo;acompte compl&eacute;mentaire, ne pas valider un avenant. Toute somme encore entre vos mains est beaucoup plus facile &agrave; d&eacute;fendre qu&rsquo;un versement d&eacute;j&agrave; effectu&eacute;.',
            },
            {
              title: 'Rassembler l&rsquo;ensemble des documents',
              text: 'Devis, bon de commande, attestation sur l&rsquo;honneur, factures, mails, SMS, compte-rendu d&rsquo;appel, photos du chantier&nbsp;: tout doit &ecirc;tre conserv&eacute; dans un dossier unique, m&ecirc;me les &eacute;l&eacute;ments qui vous paraissent anodins. Un bon dossier est la condition d&rsquo;une proc&eacute;dure efficace.',
            },
            {
              title: 'Signaler &agrave; Signal Conso (signal.conso.gouv.fr) et au 3939',
              text: 'Signal Conso est le t&eacute;l&eacute;service officiel de la DGCCRF. Votre signalement est transmis &agrave; l&rsquo;entreprise, &agrave; la DGCCRF et peut d&eacute;clencher une enqu&ecirc;te. En parall&egrave;le, le 3939 &laquo;&nbsp;Allô Service Public&nbsp;&raquo; donne un premier conseil personnalis&eacute;.',
            },
            {
              title: 'Porter plainte pour escroquerie (article 313-1 du code p&eacute;nal)',
              text: 'Rendez-vous au commissariat ou &agrave; la gendarmerie pour d&eacute;poser plainte. L&rsquo;escroquerie est punie de cinq ans d&rsquo;emprisonnement et 375&nbsp;000 euros d&rsquo;amende, et les circonstances aggravantes (bande organis&eacute;e, usage d&rsquo;une fausse qualit&eacute;) alourdissent les peines. Une plainte est indispensable pour toute action civile ou r&eacute;cup&eacute;ration ult&eacute;rieure.',
            },
            {
              title: 'Contacter une association de consommateurs agr&eacute;&eacute;e',
              text: 'UFC Que Choisir, CLCV, Familles Rurales et les autres associations agr&eacute;&eacute;es au titre de l&rsquo;article L811-1 du code de la consommation disposent de juristes qui peuvent vous orienter gratuitement ou moyennant une adh&eacute;sion modique, et vous assister dans la constitution du dossier.',
            },
            {
              title:
                'Si MaPrimeR&eacute;nov&rsquo; ou CEE d&eacute;j&agrave; vers&eacute;s&nbsp;: alerter l&rsquo;Anah et la DGEC',
              text: 'Si des aides ont d&eacute;j&agrave; &eacute;t&eacute; vers&eacute;es (par l&rsquo;Anah pour MaPrimeR&eacute;nov&rsquo;, par un d&eacute;l&eacute;gataire pour les CEE), signalez la situation &agrave; l&rsquo;Anah et &agrave; la Direction g&eacute;n&eacute;rale de l&rsquo;&eacute;nergie et du climat (DGEC). La suspension du dossier peut &eacute;viter des versements suppl&eacute;mentaires, et la restitution des fonds indus peut &ecirc;tre mise &agrave; la charge de l&rsquo;auteur de la fraude.',
            },
          ].map((s, i) => (
            <li
              key={i}
              className="flex items-start gap-3 bg-white rounded-xl border border-slate-200 p-4"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 font-heading font-extrabold text-blue-700 text-sm">
                {i + 1}
              </div>
              <div>
                <div
                  className="font-semibold text-slate-900 mb-1"
                  dangerouslySetInnerHTML={{ __html: s.title }}
                />
                <p
                  className="text-sm text-slate-700 leading-relaxed"
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
                Droit de r&eacute;tractation &mdash; 14 jours
              </div>
              <p className="text-sm text-emerald-900/90 leading-relaxed">
                Lorsque le devis a &eacute;t&eacute; sign&eacute; hors &eacute;tablissement
                (&agrave; votre domicile, lors d&rsquo;une foire, sur un salon, par
                t&eacute;l&eacute;phone apr&egrave;s d&eacute;marchage), vous disposez d&rsquo;un
                d&eacute;lai de
                <strong> 14 jours calendaires</strong> pour exercer votre droit de
                r&eacute;tractation sans avoir &agrave; vous justifier, en application de
                l&rsquo;article L221-18 du code de la consommation. Le vendeur est tenu de vous
                rembourser l&rsquo;int&eacute;gralit&eacute; des sommes vers&eacute;es dans les 14
                jours suivant la r&eacute;ception de votre r&eacute;tractation. Les clauses
                contraires sont r&eacute;put&eacute;es non &eacute;crites au titre de
                l&rsquo;article L132-1.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Rôle de ServicesArtisans */}
      <section className="bg-slate-50 border-y border-slate-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-emerald-700" />
            </div>
            <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-900">
              Le r&ocirc;le de ServicesArtisans
            </h2>
          </div>
          <p className="text-slate-700 leading-relaxed mb-4">
            ServicesArtisans diffuse environ 50&nbsp;000 fiches d&rsquo;artisans titulaires
            d&rsquo;une qualification RGE. Ces fiches sont int&eacute;gralement sourc&eacute;es du{' '}
            <strong>
              dataset officiel ADEME &laquo;&nbsp;Annuaire des professionnels RGE&nbsp;&raquo;
            </strong>
            , publi&eacute; sur data.gouv.fr sous licence ouverte Etalab 2.0, et
            synchronis&eacute;es de fa&ccedil;on hebdomadaire pour refl&eacute;ter les
            entr&eacute;es, sorties et renouvellements.
          </p>
          <p className="text-slate-700 leading-relaxed mb-4">
            Nous ne sommes pas un organisme certificateur&nbsp;: nous ne d&eacute;livrons aucune
            qualification, nous ne contr&ocirc;lons pas les chantiers et nous ne nous substituons
            pas &agrave; France R&eacute;nov&rsquo; ni &agrave; la DGCCRF. Notre r&ocirc;le se
            limite &agrave; rendre l&rsquo;information publique plus accessible &mdash; par
            m&eacute;tier, par ville, par d&eacute;partement &mdash; et &agrave; renvoyer
            syst&eacute;matiquement aux sources officielles.
          </p>
          <p className="text-slate-700 leading-relaxed">
            En cas de doute sur un artisan de notre annuaire, la v&eacute;rification finale se fait
            toujours sur <em>france-renov.gouv.fr/annuaire-rge</em>&nbsp;: c&rsquo;est la source de
            v&eacute;rit&eacute; &agrave; l&rsquo;instant T. Nos pages d&eacute;taillent notre
            m&eacute;thodologie et nos sources.
          </p>
          <div className="mt-6">
            <Link
              href="/rge/sources"
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-900"
            >
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
              Nos sources et notre m&eacute;thodologie
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
        <h2 className="font-heading text-2xl md:text-4xl font-extrabold text-slate-900 mb-10">
          Questions fr&eacute;quentes
        </h2>
        <div className="space-y-4">
          {FAQ.map((item, idx) => (
            <details
              key={idx}
              className="group bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 transition p-6"
            >
              <summary className="font-heading font-bold text-lg text-slate-900 cursor-pointer list-none flex items-start justify-between gap-4">
                <span>{item.question}</span>
                <span className="text-emerald-600 text-2xl leading-none flex-shrink-0 group-open:rotate-45 transition-transform">
                  +
                </span>
              </summary>
              <p className="text-slate-700 mt-4 leading-relaxed">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Sources officielles */}
      <section className="bg-slate-50 border-y border-slate-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
          <h2 className="font-heading text-xl md:text-2xl font-extrabold text-slate-900 mb-4">
            Sources r&eacute;glementaires et officielles
          </h2>
          <ul className="space-y-3 text-sm text-slate-700">
            <li className="flex items-start gap-2">
              <ExternalLink className="w-4 h-4 text-emerald-700 mt-0.5 flex-shrink-0" />
              <span>
                Arr&ecirc;t&eacute; du 1er d&eacute;cembre 2015 modifi&eacute;, relatif aux
                crit&egrave;res de qualifications requis pour b&eacute;n&eacute;ficier du label
                &laquo;&nbsp;Reconnu garant de l&rsquo;environnement&nbsp;&raquo; (RGE).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <ExternalLink className="w-4 h-4 text-emerald-700 mt-0.5 flex-shrink-0" />
              <span>
                Code de la consommation, articles L221-18 (droit de r&eacute;tractation) et L132-1
                (clauses abusives).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <ExternalLink className="w-4 h-4 text-emerald-700 mt-0.5 flex-shrink-0" />
              <span>
                Code p&eacute;nal, article 313-1 (escroquerie)&nbsp;: cinq ans
                d&rsquo;emprisonnement et 375&nbsp;000 euros d&rsquo;amende.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <ExternalLink className="w-4 h-4 text-emerald-700 mt-0.5 flex-shrink-0" />
              <span>
                Loi n&deg; 2020-901 du 24 juillet 2020 encadrant le d&eacute;marchage
                t&eacute;l&eacute;phonique &mdash; interdiction pour les travaux de
                r&eacute;novation &eacute;nerg&eacute;tique.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <ExternalLink className="w-4 h-4 text-emerald-700 mt-0.5 flex-shrink-0" />
              <span>
                Rapport annuel de la DGCCRF (economie.gouv.fr) &mdash; bilan des contr&ocirc;les
                dans le secteur de la r&eacute;novation &eacute;nerg&eacute;tique.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <ExternalLink className="w-4 h-4 text-emerald-700 mt-0.5 flex-shrink-0" />
              <span>
                France R&eacute;nov&rsquo; &mdash; annuaire officiel des professionnels RGE, tenu
                par l&rsquo;ADEME pour le compte de l&rsquo;&Eacute;tat.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <ExternalLink className="w-4 h-4 text-emerald-700 mt-0.5 flex-shrink-0" />
              <span>
                Signal Conso (signal.conso.gouv.fr) &mdash; t&eacute;l&eacute;service officiel de
                signalement &agrave; la DGCCRF.
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
            Consultez notre annuaire RGE sourc&eacute; du dataset officiel ADEME, notre
            m&eacute;thodologie, et les sources gouvernementales de r&eacute;f&eacute;rence.
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
              rel="noopener noreferrer nofollow"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-emerald-300/60 text-white font-semibold hover:bg-emerald-600/30 transition"
            >
              <ExternalLink className="w-5 h-5" aria-hidden="true" />
              France R&eacute;nov&rsquo;
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
