import type { Metadata } from 'next'
import Link from 'next/link'
import { Award, ArrowRight, ShieldCheck, Leaf, AlertTriangle } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'labels-qualifications-artisans'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Claire Dubois'

export const revalidate = 86400

const TITLE = 'Labels et qualifications artisans 2026'
const DESCRIPTION =
  'Comparez les labels artisans 2026 : RGE, Qualibat, Qualifelec, QualiPAC, Qualibois, Pro du Gaz, Handibat. Quelle qualif pour quel chantier et comment vérifier.'

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
  'RGE = mention officielle État qui ouvre les aides (MaPrimeRénov’, CEE, TVA 5,5 %).',
  'Qualibat = qualification technique bâtiment (maçonnerie, isolation, étanchéité…).',
  'Qualifelec = qualification technique électricité (résidentiel, IRVE, tertiaire).',
  'QualiPAC, Qualibois, QualiSol, QualiPV = qualifications énergétiques spécialisées (via Qualit’EnR).',
  'Tous les labels ne se valent pas : certains sont publics, d’autres privés, d’autres de pure communication.',
]

const qualifs = [
  {
    name: 'RGE (Reconnu Garant de l’Environnement)',
    autorite: 'État français via ADEME',
    gestes: 'Toutes les rénovations énergétiques',
    utilite: 'Indispensable pour MaPrimeRénov’, CEE, éco-PTZ, TVA 5,5 %',
    verif: 'france-renov.gouv.fr/annuaire-rge',
  },
  {
    name: 'Qualibat',
    autorite: 'Organisme privé (agréé COFRAC)',
    gestes: 'Bâtiment gros œuvre, second œuvre, isolation, étanchéité',
    utilite: 'Preuve de capacité technique pour chantiers de bâtiment traditionnel',
    verif: 'qualibat.com',
  },
  {
    name: 'Qualifelec',
    autorite: 'Organisme privé (agréé COFRAC)',
    gestes: 'Installations électriques : résidentiel, tertiaire, IRVE, photovoltaïque',
    utilite: 'Qualification reconnue pour travaux électriques et bornes de recharge',
    verif: 'qualifelec.fr',
  },
  {
    name: 'QualiPAC / Qualibois / QualiSol / QualiPV',
    autorite: 'Qualit’EnR (association agréée par l’État)',
    gestes: 'PAC, chauffage bois/granulés, solaire thermique, photovoltaïque (selon la mention)',
    utilite: 'Accès à MaPrimeRénov’ et CEE pour ces gestes spécifiques',
    verif: 'qualit-enr.org',
  },
  {
    name: 'Professionnel Gaz (PG)',
    autorite: 'Qualigaz Évonia (reconnu GRDF)',
    gestes: 'Installations gaz intérieures chez les particuliers',
    utilite: 'Obligatoire pour travaux gaz ; certification de conformité d’installation',
    verif: 'qualigaz.com',
  },
  {
    name: 'Handibat / Silverbat',
    autorite: 'Privé (CAPEB / Agefiph)',
    gestes: 'Adaptation logement handicap / autonomie',
    utilite: 'Formation spécifique ; condition de certaines aides ANAH accessibilité',
    verif: 'handibat.info',
  },
  {
    name: 'CEKAL',
    autorite: 'Centre d’étude et de contrôle des vitrages isolants',
    gestes: 'Vitrages isolants',
    utilite: 'Certification qualité des vitrages utilisés (pas de l’artisan lui-même)',
    verif: 'cekal.com',
  },
  {
    name: 'OPQIBI',
    autorite: 'Organisme public (OPQ)',
    gestes: 'Ingénierie du bâtiment, bureaux d’études',
    utilite: 'Qualification pour maîtrise d’œuvre, études thermiques, RGE Études',
    verif: 'opqibi.com',
  },
]

const faqs = [
  {
    question: 'Quelle différence entre un label et une qualification ?',
    answer:
      "Le langage courant les confond mais juridiquement ils diffèrent. Une qualification (Qualibat, Qualifelec, Qualit'EnR) est délivrée après contrôle documentaire ET audit de chantier, renouvelé tous les 4 ans. Un label (Handibat, Les Pros de la Performance Énergétique) est une adhésion à une démarche ; le contrôle est plus léger. Un simple logo « Éco-entreprise » auto-apposé ne certifie rien. Privilégiez les qualifications vérifiables sur un annuaire officiel.",
  },
  {
    question: 'RGE est-il un label ou une qualification ?',
    answer:
      "RGE est une mention publique apposée sur une qualification privée. L'État français, via l'ADEME, définit les conditions techniques ; les organismes privés (Qualibat, Qualifelec, Qualit'EnR, OPQIBI) délivrent la qualification et apposent la mention RGE si les conditions sont réunies. Vous ne pouvez donc pas être « RGE » seul : vous êtes « Qualibat RGE 7131 », « QualiPAC RGE », etc.",
  },
  {
    question: 'Un artisan peut-il cumuler plusieurs qualifications ?',
    answer:
      "Oui, c'est même fréquent. Un chauffagiste peut être à la fois QualiPAC (PAC), Qualibois (granulés) et Professionnel Gaz. Un électricien Qualifelec IRVE peut aussi avoir la mention QualiPV pour poser des panneaux solaires. Sur l'annuaire officiel, chaque qualification apparaît séparément avec sa propre date de validité.",
  },
  {
    question: 'Les qualifications sont-elles payantes pour l’artisan ?',
    answer:
      "Oui. Les coûts varient selon l'organisme : 300 à 800 € par qualification (dossier, audits), plus une cotisation annuelle de 300 à 1 500 €. L'artisan les répercute dans ses prix, ce qui explique un écart tarifaire avec un non-qualifié. Ce coût est la contrepartie d'une formation technique, de contrôles documentés et, pour le client, d'une garantie de capacité.",
  },
  {
    question: 'Comment vérifier rapidement si un label est sérieux ?',
    answer:
      "Trois critères. (1) Existe-t-il un annuaire public consultable permettant de vérifier en ligne qu'une entreprise donnée est bien certifiée ? (2) Le délivreur est-il accrédité COFRAC (organisme national d'accréditation) ? (3) Le label est-il reconnu par un texte officiel (arrêté, décret) ou seulement « privé » ? Un label dont la seule preuve est un logo sur un site commercial = non fiable.",
  },
  {
    question: 'Que vaut la mention « Artisan de France » ?',
    answer:
      "La qualité d'artisan est protégée : toute entreprise artisanale doit être inscrite au Répertoire des Métiers. La mention « Maître Artisan », elle, est attribuée par la Chambre de Métiers et d'Artisanat (CMA) aux artisans titulaires d'un diplôme de niveau III et justifiant d'au moins 2 ans de pratique. Vérifiez sur le Répertoire des Métiers (cma-france.fr) ou sur annuaire-entreprises.data.gouv.fr (rubrique « entreprise artisanale »).",
  },
  {
    question: 'Un artisan sans aucune qualification est-il interdit ?',
    answer:
      "Non, sauf pour certaines activités réglementées. L'installation gaz à l'intérieur d'une habitation nécessite l'appellation PG (Professionnel Gaz). Les activités électriques en tertiaire >500 V doivent respecter des habilitations spécifiques. En bâtiment classique (maçonnerie, peinture, carrelage), un artisan peut exercer avec un SIRET actif, une décennale et la compétence démontrée, sans autre qualification. Mais sans RGE, il ne peut pas faire bénéficier d'aides à la rénovation énergétique.",
  },
  {
    question: 'Les qualifications garantissent-elles la qualité du chantier ?',
    answer:
      "Partiellement. Elles garantissent : la formation technique, l'assurance professionnelle, un audit documentaire et d'un chantier par cycle de certification. Elles ne garantissent pas l'exécution d'un chantier donné, le respect du planning ou la relation humaine. Combinez toujours qualification officielle + références récentes + avis vérifiés + comparaison de 3 devis pour choisir.",
  },
]

const sources = [
  {
    label: 'Annuaire officiel RGE (ADEME)',
    url: 'https://france-renov.gouv.fr/annuaire-rge',
  },
  {
    label: 'Qualibat — recherche par SIRET',
    url: 'https://www.qualibat.com/recherche-entreprise',
  },
  {
    label: 'Qualifelec — annuaire',
    url: 'https://www.qualifelec.fr/annuaire',
  },
  {
    label: 'Qualit’EnR — annuaire QualiPAC/QualiBois/QualiSol/QualiPV',
    url: 'https://www.qualit-enr.org/annuaire',
  },
  {
    label: 'COFRAC — liste des organismes accrédités',
    url: 'https://www.cofrac.fr',
  },
]

const relatedGuides = [
  {
    label: 'Qualibat, QualiPAC, Qualifelec : quelle qualification ?',
    href: '/guides/qualibat-qualipac-qualifelec-qui-choisir',
  },
  { label: 'Comment choisir un artisan RGE', href: '/guides/comment-choisir-artisan-rge' },
  { label: 'Vérifier le SIRET d’un artisan', href: '/guides/verifier-siret-artisan' },
  { label: 'Artisan RGE : vérifier et trouver un certifié', href: '/guides/artisan-rge' },
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
      'labels artisans',
      'qualifications artisans',
      'RGE',
      'Qualibat',
      'Qualifelec',
      'Qualit’EnR',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Labels et qualifications', url: `/guides/${SLUG}` },
  ])
  const faqSchema = getFAQSchema(faqs)
  const schemas = [articleSchema, breadcrumbSchema, faqSchema].filter(
    (s): s is Record<string, unknown> => s !== null
  )

  return (
    <>
      <JsonLd data={schemas} />
      <div className="bg-sand-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Breadcrumb
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Labels et qualifications' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Award className="w-3.5 h-3.5" aria-hidden />
              Choisir un artisan · Guide vérifié
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Labels et qualifications des artisans : tout ce qu’il faut savoir en 2026
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              RGE, Qualibat, Qualifelec, Qualit’EnR, Professionnel Gaz, Handibat… une vingtaine de
              mentions peuvent apparaître sur le site d’un artisan. Toutes n’ont ni la même valeur,
              ni la même portée. Voici la lecture à jour pour comprendre chaque qualification,
              savoir laquelle exiger pour votre chantier et où la vérifier en 30 secondes.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Tableau récapitulatif des 8 qualifications principales</h2>
            <p>
              Pour chacune&nbsp;: qui la délivre, pour quel geste, son utilité concrète, où la
              vérifier.
            </p>
            <div className="not-prose overflow-x-auto bg-white border border-sand-200 rounded-xl my-6">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Qualification</th>
                    <th className="p-3 border-b border-sand-200">Autorité</th>
                    <th className="p-3 border-b border-sand-200">Gestes</th>
                    <th className="p-3 border-b border-sand-200">Utilité</th>
                  </tr>
                </thead>
                <tbody>
                  {qualifs.map((q) => (
                    <tr key={q.name} className="border-b border-sand-100 last:border-0 align-top">
                      <td className="p-3 font-semibold text-sand-900">{q.name}</td>
                      <td className="p-3 text-sand-700">{q.autorite}</td>
                      <td className="p-3 text-sand-700">{q.gestes}</td>
                      <td className="p-3 text-sand-700">
                        {q.utilite}
                        <br />
                        <span className="text-xs text-sand-500">Vérification : {q.verif}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2>Pour quel chantier, quelle qualification exiger</h2>
            <ul>
              <li>
                <strong>Pompe à chaleur air-eau.</strong> QualiPAC RGE (obligatoire pour aides) +
                décennale couvrant chauffage.
              </li>
              <li>
                <strong>Isolation combles.</strong> Qualibat 7141 RGE + décennale isolation.
              </li>
              <li>
                <strong>Isolation par l’extérieur.</strong> Qualibat 7131 RGE + décennale ITE +
                assurance tous risques chantier.
              </li>
              <li>
                <strong>Fenêtres.</strong> Qualibat 3521/3522 RGE ou mention équivalente + décennale
                menuiseries.
              </li>
              <li>
                <strong>Panneaux solaires.</strong> QualiPV RGE (module bâti ou élec selon pose) +
                décennale électricité et étanchéité.
              </li>
              <li>
                <strong>Borne de recharge IRVE.</strong> Qualifelec IRVE niveau 1 à 3 selon la
                puissance + décennale installation électrique.
              </li>
              <li>
                <strong>Installation gaz.</strong> Professionnel Gaz (PG) obligatoire + décennale
                gaz.
              </li>
              <li>
                <strong>Maçonnerie / gros œuvre.</strong> Qualibat 2111 ou 2121 recommandé,
                décennale structurelle obligatoire.
              </li>
              <li>
                <strong>Adaptation handicap.</strong> Handibat ou Silverbat pour accéder à certaines
                aides ANAH accessibilité.
              </li>
            </ul>

            <h2>Les 3 erreurs fréquentes de lecture</h2>
            <ul>
              <li>
                <strong>Confondre logo et validité.</strong> Un logo RGE sur un site ne prouve rien.
                Seule la fiche sur france-renov.gouv.fr fait foi, avec date de validité et geste
                couvert.
              </li>
              <li>
                <strong>Confondre RGE général et RGE par geste.</strong> « RGE » seul n’existe pas.
                Un artisan peut être RGE pour l’isolation et pas pour les pompes à chaleur — il faut
                vérifier précisément le geste que vous lui confiez.
              </li>
              <li>
                <strong>Accepter un « label » auto-apposé.</strong> Certaines entreprises affichent
                « Éco-artisan du bâtiment », « N° 1 local », « Certifié qualité ». Si aucune base
                publique ne permet de vérifier, la mention vaut zéro.
              </li>
            </ul>

            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>Fraude fréquente.</strong> L’usurpation de logo RGE est sanctionnée par
                l’art. L441-2 du Code de la consommation (2 ans de prison, 300 000 € d’amende). Si
                un artisan affiche RGE sans figurer dans l’annuaire officiel, signalez à
                signal.conso.gouv.fr.
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
            <ShieldCheck className="w-10 h-10 mx-auto mb-3 opacity-90" aria-hidden />
            <h2 className="font-heading text-2xl font-bold mb-2">
              Un chantier éligible aux aides ?
            </h2>
            <p className="text-primary-100 mb-5 max-w-xl mx-auto">
              Trouvez directement un artisan RGE vérifié pour votre geste, avec qualification en
              cours de validité confirmée par l’ADEME.
            </p>
            <Link
              href="/artisans-rge"
              className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-6 py-3 rounded-lg hover:bg-primary-50 transition-colors"
            >
              <Leaf className="w-4 h-4" aria-hidden /> Annuaire des artisans RGE
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
