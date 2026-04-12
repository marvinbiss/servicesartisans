import type { Metadata } from 'next'
import Link from 'next/link'
import {
  GraduationCap,
  ShieldCheck,
  FileCheck2,
  Euro,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Building2,
  Zap,
  Flame,
  Sun,
} from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { SITE_URL, getAlternates } from '@/lib/seo/config'
import { getBreadcrumbSchema, getFAQSchema, getHowToSchema } from '@/lib/seo/jsonld'

export const revalidate = 86400

const path = '/rge/comment-devenir-rge'

export const metadata: Metadata = {
  title: 'Comment devenir artisan RGE en 2026 ? Guide complet',
  description:
    "Guide factuel pour obtenir la qualification RGE : organismes (Qualit'EnR, Qualibat, Qualifelec), 5 étapes, coûts, formation, audit de chantier probatoire, cadre légal (arrêté du 1er décembre 2015).",
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1 as const,
    'max-image-preview': 'large' as const,
    'max-video-preview': -1 as const,
  },
  openGraph: {
    title: 'Comment devenir artisan RGE en 2026 ?',
    description:
      'Guide pédagogique : organismes qualificateurs, 5 étapes pour obtenir la qualification RGE, coûts réels, cadre légal et pièges à éviter.',
    type: 'article',
    locale: 'fr_FR',
    url: `${SITE_URL}${path}`,
  },
  alternates: getAlternates(path),
}

const ORGANISMES = [
  {
    name: "Qualit'EnR",
    icon: Sun,
    scope: 'Énergies renouvelables (pompes à chaleur, bois, solaire thermique, photovoltaïque)',
    badges: ['QualiPAC', 'QualiBois', 'QualiSol', 'QualiPV', 'Chauffage+'],
    who: 'Installateurs de PAC air/eau, PAC géothermiques, chaudières et poêles biomasse, chauffe-eau solaires, capteurs solaires thermiques et modules photovoltaïques.',
    cost: "Environ 1 500 € à 2 500 € par qualification (droits d'entrée + audit), renouvellement annuel autour de 300 € à 600 €. Formation préalable obligatoire non incluse.",
    url: 'https://www.qualit-enr.org',
  },
  {
    name: 'Qualibat',
    icon: Building2,
    scope:
      'Corps de métier du bâtiment (isolation, maçonnerie, menuiserie, ventilation, thermique)',
    badges: ['5911', '5912', '7131', '7141', '8611', '8621'],
    who: "Entreprises générales du bâtiment et corps d'état spécialisés : isolation thermique par l'intérieur ou l'extérieur, menuiseries extérieures, couverture-zinguerie, ventilation mécanique, chaudières gaz/fioul haute performance.",
    cost: "Environ 1 000 € à 2 000 € la première année (instruction + audit documentaire), puis cotisation annuelle d'environ 400 € à 800 € selon le chiffre d'affaires.",
    url: 'https://www.qualibat.com',
  },
  {
    name: 'Qualifelec',
    icon: Zap,
    scope: 'Électrotechnique, photovoltaïque, bornes de recharge IRVE',
    badges: ['RGE SER', 'RGE PV', 'IRVE'],
    who: "Électriciens, installateurs photovoltaïques en autoconsommation ou revente, poseurs de bornes de recharge pour véhicules électriques (mention IRVE requise pour bénéficier du crédit d'impôt IRVE client).",
    cost: 'Environ 900 € à 1 800 € pour une première qualification, cotisation annuelle autour de 300 € à 700 €. Mention IRVE : formation 2 à 3 jours obligatoire.',
    url: 'https://www.qualifelec.fr',
  },
  {
    name: 'Céquami / CertiBat / OPQIBI',
    icon: FileCheck2,
    scope: "Audits énergétiques, bureaux d'études, maîtrise d'œuvre",
    badges: ['Audit RGE', 'MOE', 'Études thermiques'],
    who: "Bureaux d'études thermiques et auditeurs énergétiques habilités à produire les audits réglementaires exigés pour MaPrimeRénov' Parcours Accompagné et les rénovations d'ampleur.",
    cost: 'Qualification auditeur : environ 1 500 € à 3 000 € selon le périmètre. Exigences de références et de compétences techniques plus strictes que pour les installateurs.',
    url: 'https://www.qualibat.com/certibat',
  },
]

const STEPS = [
  {
    name: 'Évaluer son éligibilité',
    text: "Vérifier que l'entreprise dispose d'un SIRET actif (idéalement depuis 2 ans ou plus, certains organismes acceptent les jeunes entreprises avec un dossier renforcé), d'une assurance de responsabilité civile professionnelle et décennale à jour couvrant les travaux visés, et d'au moins deux références de chantiers réalisés dans le domaine de qualification demandé.",
  },
  {
    name: 'Choisir le bon organisme qualificateur',
    text: "Sélectionner l'organisme en fonction de l'activité principale : Qualit'EnR pour les énergies renouvelables, Qualibat pour l'isolation et le gros œuvre thermique, Qualifelec pour l'électricité et le photovoltaïque, Céquami/OPQIBI pour les audits et bureaux d'études. Un même artisan peut cumuler plusieurs qualifications auprès d'organismes différents.",
  },
  {
    name: 'Constituer le dossier administratif',
    text: "Rassembler le KBIS de moins de 3 mois, les attestations fiscales et sociales à jour (URSSAF, impôts, congés payés), l'attestation d'assurance décennale nominative couvrant le domaine visé, les références de 2 chantiers minimum avec procès-verbaux de réception, et l'attestation de formation préalable du responsable technique.",
  },
  {
    name: 'Suivre la formation préalable obligatoire',
    text: "Le responsable technique (ou le dirigeant) doit suivre une formation agréée de 3 à 5 jours selon la qualification visée, dispensée par un organisme de formation habilité. Coût indicatif : 1 500 € à 3 000 € par stagiaire selon le module. La formation se conclut par un QCM et la remise d'une attestation valable 7 ans en général.",
  },
  {
    name: "Passer l'audit de qualification puis l'audit de chantier",
    text: "L'organisme instruit le dossier (1 à 3 mois), délivre la qualification si le dossier est complet, puis diligente un audit de chantier probatoire dans les 24 mois suivant l'attribution. Cet audit porte sur un chantier réel et vérifie la conformité technique de l'installation. Un audit raté peut entraîner la suspension ou le retrait de la qualification.",
  },
]

const COSTS = [
  {
    item: 'Formation préalable obligatoire',
    range: '1 500 € à 3 000 €',
    note: 'Par stagiaire, selon la qualification et le formateur agréé',
  },
  {
    item: "Droits d'entrée + instruction du dossier",
    range: '900 € à 2 500 €',
    note: "Variable selon l'organisme et le nombre de qualifications demandées",
  },
  {
    item: 'Audit de chantier probatoire',
    range: '400 € à 900 €',
    note: "Facturé séparément, à planifier dans les 2 ans suivant l'attribution",
  },
  {
    item: 'Cotisation annuelle de maintien',
    range: '300 € à 800 €',
    note: "Souvent proportionnelle au chiffre d'affaires de l'activité qualifiée",
  },
  {
    item: 'Renouvellement (tous les 4 à 7 ans)',
    range: '500 € à 1 500 €',
    note: "Durée de validité et fréquence variables selon l'organisme",
  },
]

const PITFALLS = [
  {
    title: 'Passer par un organisme non accrédité COFRAC',
    text: "Seuls les organismes accrédités par le COFRAC selon la norme NF EN ISO/IEC 17065 peuvent délivrer une qualification RGE valide aux yeux de l'administration. Vérifier la liste officielle sur cofrac.fr avant toute démarche.",
  },
  {
    title: 'Confondre mention RGE et label commercial',
    text: "Certains groupements ou marques apposent des logos « écologiques » ou « experts rénovation » qui n'ont aucune valeur réglementaire. Seule la qualification délivrée par les organismes listés sur france-renov.gouv.fr ouvre droit aux aides publiques pour le client.",
  },
  {
    title: 'Négliger le renouvellement',
    text: "Les qualifications RGE ont une durée de validité limitée (4 à 7 ans selon l'organisme) et doivent être renouvelées via un dossier allégé et de nouveaux audits. Une qualification expirée entraîne le refus immédiat des primes CEE et MaPrimeRénov' sur les chantiers signés après la date d'échéance.",
  },
  {
    title: "Reporter l'audit de chantier probatoire",
    text: "L'audit doit être planifié activement dans les 24 mois : ne pas attendre que l'organisme relance. L'artisan doit proposer un chantier représentatif du domaine qualifié, avec l'accord du client final pour la visite de l'auditeur.",
  },
  {
    title: 'Sous-estimer la formation du responsable technique',
    text: "La formation préalable est nominative : si le responsable technique quitte l'entreprise, la qualification peut être remise en cause. Prévoir une stratégie de continuité (formation d'un second collaborateur) dès le départ.",
  },
]

const FAQS = [
  {
    question: 'Combien de temps faut-il pour obtenir la qualification RGE ?',
    answer:
      "Entre 3 et 9 mois en moyenne, de la demande initiale à la délivrance effective. Le délai dépend de la rapidité à rassembler le dossier, du calendrier des sessions de formation préalable (souvent limitées) et de la charge d'instruction de l'organisme. L'audit de chantier probatoire intervient ensuite dans un délai de 24 mois après l'attribution.",
  },
  {
    question: 'Puis-je cumuler plusieurs qualifications RGE ?',
    answer:
      "Oui, c'est même fortement recommandé pour les entreprises multi-activités. Un artisan peut détenir simultanément une QualiPAC (Qualit'EnR), une mention 7141 isolation extérieure (Qualibat) et une mention RGE PV (Qualifelec). Chaque qualification est instruite séparément et couvre un périmètre technique distinct.",
  },
  {
    question: "Que se passe-t-il si je rate l'audit de chantier probatoire ?",
    answer:
      "L'organisme peut prononcer une suspension temporaire de la qualification assortie d'un plan d'actions correctives, puis un contre-audit. En cas de non-conformité grave ou récurrente, la qualification est retirée et l'entreprise doit attendre au moins 12 mois avant de représenter un dossier. Les chantiers déjà signés avant le retrait restent en général éligibles aux aides.",
  },
  {
    question: 'Mon entreprise a moins de 2 ans, puis-je obtenir le RGE ?',
    answer:
      "Oui, mais le dossier est examiné avec une vigilance accrue. Il faut démontrer l'expérience individuelle du responsable technique (anciens bulletins de salaire, attestations d'anciens employeurs, diplômes techniques) et fournir les premières références de chantiers réalisés. Les organismes acceptent fréquemment les jeunes entreprises dès qu'un dossier technique solide est constitué.",
  },
  {
    question: "Comment retrouver mon entreprise dans l'annuaire officiel une fois qualifiée ?",
    answer:
      "L'annuaire officiel unifié est disponible sur france-renov.gouv.fr/trouver-un-professionnel. Il consolide les données de tous les organismes certificateurs. L'inscription est automatique après délivrance de la qualification ; compter 2 à 4 semaines entre la notification de l'organisme et l'apparition dans l'annuaire public.",
  },
  {
    question: 'Le label RGE est-il obligatoire pour exercer ?',
    answer:
      "Non. Le RGE n'est pas obligatoire pour exercer une activité de travaux. En revanche, il est obligatoire pour que le client final puisse bénéficier des aides publiques à la rénovation énergétique (MaPrimeRénov', Certificats d'Économies d'Énergie, éco-prêt à taux zéro). Sans qualification RGE, un artisan peut travailler, mais ses clients perdent mécaniquement l'accès à ces dispositifs.",
  },
  {
    question: 'Quel est le cadre légal de la qualification RGE ?',
    answer:
      "Le dispositif RGE est régi par l'arrêté du 1er décembre 2015 modifié, pris en application de l'article L.232-2 du code de l'énergie. Il définit les critères de qualification, les obligations des organismes certificateurs et la liste des travaux éligibles. La charte RGE est pilotée par France Rénov' et l'ADEME sous la tutelle de la DGEC.",
  },
]

export default function CommentDevenirRgePage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Artisans RGE', url: '/rge' },
    { name: 'Comment devenir RGE', url: path },
  ])

  const howToSchema = getHowToSchema(
    STEPS.map((s) => ({ name: s.name, text: s.text })),
    {
      name: 'Comment devenir artisan RGE en 2026',
      description:
        "Procédure en 5 étapes pour obtenir la qualification RGE auprès d'un organisme accrédité COFRAC.",
      totalTime: 'P6M',
    }
  )

  const faqSchema = getFAQSchema(FAQS)

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Comment devenir artisan RGE en 2026 ?',
    url: `${SITE_URL}${path}`,
    inLanguage: 'fr-FR',
    author: { '@type': 'Organization', name: 'ServicesArtisans' },
    publisher: { '@type': 'Organization', name: 'ServicesArtisans' },
    datePublished: '2026-04-09',
    dateModified: '2026-04-09',
    description:
      'Guide pédagogique complet pour les artisans souhaitant obtenir la qualification RGE : organismes qualificateurs, étapes, coûts, cadre légal (arrêté du 1er décembre 2015 modifié), pièges à éviter.',
    about: [
      { '@type': 'Thing', name: 'Qualification RGE' },
      { '@type': 'Thing', name: "Qualit'EnR" },
      { '@type': 'Thing', name: 'Qualibat' },
      { '@type': 'Thing', name: 'Qualifelec' },
    ],
  }

  return (
    <main className="min-h-screen bg-white">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={articleSchema} />
      {howToSchema && <JsonLd data={howToSchema} />}
      {faqSchema && <JsonLd data={faqSchema} />}

      <Breadcrumb
        items={[{ label: 'Artisans RGE', href: '/rge' }, { label: 'Comment devenir RGE' }]}
      />

      {/* HERO */}
      <section className="bg-gradient-to-br from-charcoal-900 via-charcoal-800 to-emerald-900 text-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 rounded-full px-4 py-1.5 mb-5">
            <GraduationCap className="w-4 h-4 text-emerald-300" />
            <span className="text-sm font-medium text-emerald-100">
              Guide artisan &mdash; qualification RGE
            </span>
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-extrabold leading-tight mb-4">
            Comment devenir artisan RGE en 2026&nbsp;?
          </h1>
          <p className="text-lg text-emerald-50/90 max-w-3xl leading-relaxed">
            Guide factuel et non commercial pour obtenir la qualification Reconnu Garant de
            l&rsquo;Environnement&nbsp;: quels organismes&nbsp;? quelles &eacute;tapes&nbsp;?
            combien &ccedil;a co&ucirc;te vraiment&nbsp;? Et surtout, est-ce rentable pour votre
            entreprise&nbsp;?
          </p>
          <p className="text-sm text-emerald-100/70 mt-4 max-w-3xl">
            R&eacute;dig&eacute; sur la base de l&rsquo;arr&ecirc;t&eacute; du 1<sup>er</sup>{' '}
            d&eacute;cembre 2015 modifi&eacute;, de la charte RGE France R&eacute;nov&rsquo; et des
            documents publics des organismes certificateurs.
          </p>
        </div>
      </section>

      {/* QU'EST-CE QUE LE RGE */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center gap-2 mb-6">
          <ShieldCheck className="w-5 h-5 text-emerald-700" aria-hidden="true" />
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900">
            Qu&rsquo;est-ce que le label RGE concr&egrave;tement&nbsp;?
          </h2>
        </div>
        <div className="prose prose-slate max-w-none text-charcoal-700 leading-relaxed">
          <p>
            RGE signifie &laquo;&nbsp;<strong>Reconnu Garant de l&rsquo;Environnement</strong>
            &nbsp;&raquo;. Il ne s&rsquo;agit pas d&rsquo;un label commercial mais d&rsquo;une{' '}
            <strong>mention officielle</strong> attribu&eacute;e par des organismes de qualification
            accr&eacute;dit&eacute;s par le COFRAC (Comit&eacute; fran&ccedil;ais
            d&rsquo;accr&eacute;ditation) selon la norme NF&nbsp;EN&nbsp;ISO/IEC&nbsp;17065.
          </p>
          <p>
            Le dispositif est encadr&eacute; par{' '}
            <strong>
              l&rsquo;arr&ecirc;t&eacute; du 1<sup>er</sup> d&eacute;cembre 2015 modifi&eacute;
            </strong>
            , pris en application des articles L.232-1 et suivants du code de
            l&rsquo;&eacute;nergie. Il d&eacute;finit la liste des travaux &eacute;ligibles aux
            aides publiques &agrave; la r&eacute;novation &eacute;nerg&eacute;tique
            (MaPrimeR&eacute;nov&rsquo;, Certificats d&rsquo;&Eacute;conomies
            d&rsquo;&Eacute;nergie, &eacute;co-pr&ecirc;t &agrave; taux z&eacute;ro) et les
            qualifications exig&eacute;es pour chaque type de chantier.
          </p>
          <p>
            La <strong>gouvernance du dispositif</strong> est assur&eacute;e conjointement par
            France R&eacute;nov&rsquo; (service public de la r&eacute;novation) et l&rsquo;ADEME,
            sous la tutelle de la Direction g&eacute;n&eacute;rale de l&rsquo;&eacute;nergie et du
            climat (DGEC) du Minist&egrave;re de la Transition &eacute;cologique. L&rsquo;annuaire
            officiel unifi&eacute; est publi&eacute; sur <em>france-renov.gouv.fr</em>.
          </p>
          <p>
            Concr&egrave;tement, la mention RGE est d&eacute;livr&eacute;e par{' '}
            <strong>quatre grandes familles d&rsquo;organismes</strong>
            sp&eacute;cialis&eacute;s&nbsp;: Qualit&rsquo;EnR pour les &eacute;nergies
            renouvelables, Qualibat pour les corps de m&eacute;tier du b&acirc;timent, Qualifelec
            pour l&rsquo;&eacute;lectrotechnique et le photovolta&iuml;que, et
            C&eacute;quami/CertiBat/OPQIBI pour les audits et bureaux d&rsquo;&eacute;tudes. Chaque
            organisme d&eacute;livre des qualifications sp&eacute;cifiques qui couvrent un
            p&eacute;rim&egrave;tre technique pr&eacute;cis.
          </p>
        </div>
      </section>

      {/* ORGANISMES QUALIFICATEURS */}
      <section className="bg-sand-50 border-y border-charcoal-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-center gap-2 mb-6">
            <Building2 className="w-5 h-5 text-emerald-700" aria-hidden="true" />
            <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900">
              Les organismes qualificateurs RGE
            </h2>
          </div>
          <p className="text-charcoal-600 mb-8 max-w-3xl leading-relaxed">
            Le choix de l&rsquo;organisme d&eacute;pend de votre activit&eacute; principale. Un
            m&ecirc;me artisan peut cumuler plusieurs qualifications aupr&egrave;s de plusieurs
            organismes pour couvrir l&rsquo;ensemble de ses m&eacute;tiers.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {ORGANISMES.map((org) => {
              const Icon = org.icon
              return (
                <article
                  key={org.name}
                  className="p-6 bg-white rounded-2xl border border-charcoal-200 hover:border-emerald-400 transition"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-emerald-700" aria-hidden="true" />
                    </div>
                    <h3 className="font-heading font-bold text-lg text-charcoal-900">{org.name}</h3>
                  </div>
                  <p className="text-sm font-semibold text-charcoal-800 mb-2">{org.scope}</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {org.badges.map((b) => (
                      <span
                        key={b}
                        className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-xs font-semibold text-emerald-700"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-charcoal-600 mb-3 leading-relaxed">{org.who}</p>
                  <p className="text-xs text-charcoal-900 leading-relaxed">
                    <span className="font-semibold text-charcoal-700">
                      Co&ucirc;ts indicatifs&nbsp;:
                    </span>{' '}
                    {org.cost}
                  </p>
                  <a
                    href={org.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900 transition"
                  >
                    Site officiel &rarr;
                  </a>
                </article>
              )
            })}
          </div>
          <p className="text-xs text-charcoal-900 mt-6 italic">
            Les fourchettes de co&ucirc;ts sont indicatives et doivent &ecirc;tre confirm&eacute;es
            directement aupr&egrave;s de chaque organisme, qui publie ses bar&egrave;mes &agrave;
            jour sur son site.
          </p>
        </div>
      </section>

      {/* 5 ETAPES (HowTo) */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center gap-2 mb-6">
          <CheckCircle2 className="w-5 h-5 text-emerald-700" aria-hidden="true" />
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900">
            Les 5 &eacute;tapes pour obtenir votre qualification RGE
          </h2>
        </div>
        <ol className="space-y-5">
          {STEPS.map((step, i) => (
            <li
              key={step.name}
              className="p-6 bg-white rounded-2xl border border-charcoal-200 flex gap-4"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-600 text-white font-heading font-extrabold flex items-center justify-center">
                {i + 1}
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg text-charcoal-900 mb-2">
                  {step.name}
                </h3>
                <p className="text-charcoal-700 text-sm leading-relaxed">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* COUTS */}
      <section className="bg-sand-50 border-y border-charcoal-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-center gap-2 mb-6">
            <Euro className="w-5 h-5 text-emerald-700" aria-hidden="true" />
            <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900">
              Combien &ccedil;a co&ucirc;te vraiment&nbsp;?
            </h2>
          </div>
          <p className="text-charcoal-600 mb-6 max-w-3xl leading-relaxed">
            Les co&ucirc;ts varient selon l&rsquo;organisme, le nombre de qualifications
            demand&eacute;es et la taille de l&rsquo;entreprise. Voici un ordre de grandeur
            bas&eacute; sur les bar&egrave;mes publics des organismes &agrave; date&nbsp;:
          </p>
          <div className="overflow-hidden rounded-2xl border border-charcoal-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-sand-200 text-charcoal-700">
                <tr>
                  <th className="text-left p-4 font-semibold">Poste de co&ucirc;t</th>
                  <th className="text-left p-4 font-semibold">Fourchette indicative</th>
                  <th className="text-left p-4 font-semibold">Remarque</th>
                </tr>
              </thead>
              <tbody>
                {COSTS.map((row) => (
                  <tr key={row.item} className="border-t border-charcoal-100">
                    <td className="p-4 font-semibold text-charcoal-900 align-top">{row.item}</td>
                    <td className="p-4 text-emerald-700 font-semibold align-top">{row.range}</td>
                    <td className="p-4 text-charcoal-600 align-top">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-charcoal-900 mt-4 italic">
            Budget total moyen pour une premi&egrave;re qualification&nbsp;: entre 3&nbsp;000 &euro;
            et 6&nbsp;000 &euro; la premi&egrave;re ann&eacute;e, formation comprise. Certaines
            formations peuvent &ecirc;tre financ&eacute;es par l&rsquo;OPCO Constructys ou le FAFCEA
            selon le statut de l&rsquo;entreprise.
          </p>
        </div>
      </section>

      {/* COMBIEN CA RAPPORTE */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-emerald-700" aria-hidden="true" />
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900">
            Combien &ccedil;a rapporte concr&egrave;tement&nbsp;?
          </h2>
        </div>
        <div className="prose prose-slate max-w-none text-charcoal-700 leading-relaxed">
          <p>
            La logique est simple et m&eacute;canique&nbsp;: la mention RGE est une{' '}
            <strong>condition r&eacute;glementaire</strong> pour que le client final puisse
            b&eacute;n&eacute;ficier de MaPrimeR&eacute;nov&rsquo;, des Certificats
            d&rsquo;&Eacute;conomies d&rsquo;&Eacute;nergie (CEE) et de
            l&rsquo;&eacute;co-pr&ecirc;t &agrave; taux z&eacute;ro. Sans RGE, le client paie
            l&rsquo;int&eacute;gralit&eacute; du devis sans aide publique.
          </p>
          <p>
            En pratique, cela signifie qu&rsquo;un artisan non-RGE est{' '}
            <strong>mécaniquement exclu</strong> de la majeure partie du march&eacute; de la
            r&eacute;novation &eacute;nerg&eacute;tique performante&nbsp;: isolation, pompes
            &agrave; chaleur, chaudi&egrave;res biomasse, solaire thermique, menuiseries
            performantes, ventilation double flux. Sur ces segments, les clients demandent
            syst&eacute;matiquement un devis d&rsquo;artisan qualifi&eacute; RGE pour ne pas perdre
            leurs aides.
          </p>
          <p>
            Selon les donn&eacute;es publi&eacute;es par France R&eacute;nov&rsquo; et l&rsquo;ANAH,
            plus de{' '}
            <strong>60&nbsp;% des chantiers de r&eacute;novation &eacute;nerg&eacute;tique</strong>{' '}
            en France sont aujourd&rsquo;hui r&eacute;alis&eacute;s avec mobilisation d&rsquo;au
            moins une aide publique. Ne pas &ecirc;tre RGE revient donc &agrave; se couper
            d&rsquo;environ deux tiers du march&eacute; sur les m&eacute;tiers concern&eacute;s.
          </p>
          <p>
            Le retour sur investissement de la qualification d&eacute;pend du volume de chantiers,
            mais le point d&rsquo;&eacute;quilibre est g&eacute;n&eacute;ralement atteint{' '}
            <strong>d&egrave;s les premiers dossiers</strong>
            (un seul chantier &eacute;nerg&eacute;tique couvre habituellement le co&ucirc;t annuel
            de la qualification). Il ne s&rsquo;agit donc pas d&rsquo;un pari mais d&rsquo;un{' '}
            <em>ticket d&rsquo;entr&eacute;e r&eacute;glementaire</em>
            pour exercer dans le secteur de la r&eacute;novation subventionn&eacute;e.
          </p>
        </div>
      </section>

      {/* PIEGES */}
      <section className="bg-amber-50/40 border-y border-amber-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="w-5 h-5 text-amber-700" aria-hidden="true" />
            <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900">
              Pi&egrave;ges &agrave; &eacute;viter
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {PITFALLS.map((p) => (
              <article key={p.title} className="p-5 bg-white rounded-2xl border border-amber-200">
                <h3 className="font-heading font-bold text-charcoal-900 mb-2 flex items-start gap-2">
                  <Flame className="w-4 h-4 text-amber-600 flex-shrink-0 mt-1" aria-hidden="true" />
                  <span>{p.title}</span>
                </h3>
                <p className="text-sm text-charcoal-700 leading-relaxed">{p.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-6">
          Questions fr&eacute;quentes
        </h2>
        <div className="space-y-4">
          {FAQS.map((faq) => (
            <details
              key={faq.question}
              className="group p-5 bg-white rounded-2xl border border-charcoal-200 hover:border-emerald-400 transition"
            >
              <summary className="font-heading font-bold text-charcoal-900 cursor-pointer list-none flex items-start justify-between gap-3">
                <span>{faq.question}</span>
                <span className="text-emerald-600 text-xl font-extrabold group-open:rotate-45 transition-transform">
                  +
                </span>
              </summary>
              <p className="text-sm text-charcoal-700 mt-3 leading-relaxed">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-emerald-700 to-emerald-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold mb-3">Aller plus loin</h2>
          <p className="text-emerald-100 max-w-2xl mx-auto mb-6 leading-relaxed">
            Explorez l&rsquo;annuaire RGE officiel, approfondissez les qualifications ou
            d&eacute;couvrez comment r&eacute;f&eacute;rencer gratuitement votre entreprise sur
            ServicesArtisans.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/rge"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-emerald-800 font-semibold shadow-lg hover:bg-emerald-50 transition"
            >
              Annuaire artisans RGE
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              href="/rge/qualifications"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-emerald-300/50 bg-emerald-800/40 text-white font-semibold hover:bg-emerald-800/60 transition"
            >
              Guides qualifications
            </Link>
            <Link
              href="/rge/sources"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-emerald-300/50 bg-emerald-800/40 text-white font-semibold hover:bg-emerald-800/60 transition"
            >
              Sources et m&eacute;thodologie
            </Link>
            <Link
              href="/espace-artisan"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-emerald-300/50 bg-emerald-800/40 text-white font-semibold hover:bg-emerald-800/60 transition"
            >
              Inscription artisan (gratuite)
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
