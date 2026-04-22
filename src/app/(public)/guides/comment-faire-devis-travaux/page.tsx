import type { Metadata } from 'next'
import Link from 'next/link'
import { FileText, ArrowRight, CheckCircle2, AlertTriangle, Hammer, Clock } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema, getHowToSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'comment-faire-devis-travaux'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Sophie Martin'

export const revalidate = 86400

const TITLE = 'Demander un devis de travaux en 2026'
const DESCRIPTION =
  'Obtenez 3 devis travaux sérieux sous 7 jours : cahier des charges, photos, mentions à exiger et modèle de demande prêt à envoyer. Méthode 2026.'

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
    authors: [`${SITE_URL}/equipe/sophie-martin`],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
}

const tldr = [
  'Rédigez un cahier des charges identique pour les 3 artisans : surface, matériaux, contraintes, délais.',
  'Ajoutez 4-8 photos au minimum (plan d’ensemble + détails des zones sensibles).',
  'Exigez un devis détaillé, pas un prix forfaitaire global — sinon vous ne pouvez pas comparer.',
  'Laissez 7 jours pour la réponse : un artisan sérieux fait le métré, chiffre, rédige — ce n’est pas instantané.',
  'Le devis est gratuit sauf étude technique facturée à l’avance par écrit.',
]

const howToSteps = [
  {
    name: 'Clarifier vos besoins avant tout contact',
    text: "Listez ce qui doit être fait, ce qui ne doit pas l'être, et ce qui est négociable. Pour une rénovation de salle de bain : dimensions (m² au sol et au mur), éléments conservés, remplacés, ajoutés. Matériaux souhaités (marque ou gamme), contraintes (locataire en place, chantier nuit, accès difficile). Délais : disponibilité de démarrage et réception souhaitée. Sans ce cadrage, chaque artisan interprète différemment et les devis sont incomparables.",
  },
  {
    name: 'Photographier le chantier',
    text: "Minimum 4-8 photos : vue d'ensemble, détails des zones concernées, état actuel (moisissure, fissure, ancienne installation), points d'accès (cage d'escalier, ascenseur, parking). Ajoutez un schéma ou plan coté si possible (papier à main levée suffit). Un artisan qui voit avant de chiffrer donne un devis plus précis et sous-estime moins.",
  },
  {
    name: 'Rédiger une demande type que vous envoyez identique à 3 artisans',
    text: 'Le pire est de décrire le chantier de 3 façons différentes. Rédigez une demande factuelle (pas de « voyez ce que vous pouvez faire »), envoyée identique aux 3. Cela permet des devis vraiment comparables et raccourcit les échanges.',
  },
  {
    name: 'Demander un devis détaillé ligne par ligne',
    text: "Précisez dans votre demande que vous attendez : ventilation main-d'œuvre / fournitures / déplacement, quantités, prix unitaire, TVA applicable (20, 10 ou 5,5 %), délai d'exécution, conditions de paiement, validité du devis. Un artisan qui refuse ce niveau de détail n'est pas à considérer.",
  },
  {
    name: 'Organiser une visite de métré physique pour les chantiers >3 000 €',
    text: "Pour les chantiers significatifs, exigez une visite préalable sur site. C'est gratuit pour l'artisan sérieux, c'est la garantie qu'il a vu les contraintes réelles. Un devis établi à distance sur photos pour un gros chantier contiendra presque toujours un « avenant imprévus » au moment des travaux.",
  },
  {
    name: 'Relancer et comparer',
    text: 'Délai standard : 7 jours pour recevoir un devis après visite. Au-delà, relancez par e-mail. Recevoir 3 devis complets prend généralement 10-15 jours. Une fois les 3 reçus, comparez ligne par ligne (voir guide dédié), pas seulement les totaux.',
  },
]

const faqs = [
  {
    question: 'Un artisan peut-il facturer un devis ?',
    answer:
      "La règle est la gratuité du devis pour les prestations courantes à domicile. Un artisan peut facturer un devis si : (1) il effectue une étude technique spécifique (calcul thermique, métré architectural, étude de structure), (2) il vous en informe clairement et par écrit avant l'intervention. Une facturation surprise du devis est abusive et peut être contestée auprès de la DGCCRF.",
  },
  {
    question: 'Combien de temps laisser à l’artisan pour établir le devis ?',
    answer:
      "7 à 10 jours pour un chantier standard (salle de bain, cuisine, isolation combles). 15-20 jours pour un chantier complexe nécessitant sous-traitants ou études (extension, rénovation lourde, PAC géothermique). Relancez au-delà de ce délai. Un artisan sérieux vous prévient s'il ne peut pas tenir les délais.",
  },
  {
    question: 'Faut-il contacter 3 artisans en même temps ?',
    answer:
      "Oui, c'est la méthode la plus efficace. Prévenez chaque artisan que vous consultez 2 autres professionnels — c'est légal, c'est transparent et cela incite à proposer le juste prix. Ne pas les mettre en concurrence pousse chacun à prendre sa marge maximale.",
  },
  {
    question: 'Puis-je envoyer ma demande par SMS ou WhatsApp ?',
    answer:
      "Le premier contact peut passer par SMS, WhatsApp ou téléphone. Mais la demande de devis formalisée doit être écrite (e-mail ou formulaire). C'est le document qui, en cas de litige, prouvera que le chantier demandé correspondait à celui chiffré. Archivez les échanges.",
  },
  {
    question: 'L’artisan refuse de détailler son prix, dois-je insister ?',
    answer:
      "Oui. Un devis sans détail ne vous protège pas : si vous demandez un ajout, l'artisan facturera « en supplément ». Si vous contestez un poste, il répondra « tout est compris dans le forfait ». Un devis forfaitaire global est juridiquement valable mais commercialement risqué. Exigez la ventilation, ou passez à l'artisan suivant.",
  },
  {
    question: 'Que faire si je ne reçois aucun devis après ma demande ?',
    answer:
      "Relancez une fois, par e-mail, en confirmant votre disponibilité pour visite. Si pas de réponse sous 5 jours, passez à 3 autres artisans. Un professionnel qui ne répond pas à une demande sérieuse n'est pas non plus celui qui vous répondra en cas de problème sur le chantier.",
  },
  {
    question: 'Doit-on fournir le budget dans la demande ?',
    answer:
      "Question débattue. L'avantage de donner un ordre d'idée : l'artisan calibre les matériaux et vous propose des alternatives si le budget est serré. L'inconvénient : certains artisans s'alignent systématiquement sur le budget annoncé, même si le chantier réel est moins cher. Bon compromis : donnez une fourchette large (« entre 8 000 et 15 000 € selon matériaux »).",
  },
  {
    question: 'Comment se protéger contre les artisans qui ne tiennent pas les délais ?',
    answer:
      "Exigez que le devis mentionne un délai d'exécution prévisionnel avec planning par phases, et une pénalité de retard contractuelle (10 € par jour ouvré par défaut est raisonnable). Sans pénalité explicite, le retard doit être « significatif et imputable » pour ouvrir droit à indemnisation — beaucoup plus dur à prouver.",
  },
]

const sources = [
  {
    label: 'Service-public.fr — Devis : mentions obligatoires',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F31144',
  },
  {
    label: 'Arrêté du 2 mars 1990 relatif à la publicité des prix des prestations',
    url: 'https://www.legifrance.gouv.fr/loda/id/LEGITEXT000006071745',
  },
  {
    label: 'INC — Guide pratique « Bien choisir son artisan »',
    url: 'https://www.inc-conso.fr',
  },
  {
    label: 'DGCCRF — Fiche pratique devis travaux',
    url: 'https://www.economie.gouv.fr/dgccrf',
  },
]

const relatedGuides = [
  { label: 'Comparer 3 devis d’artisans', href: '/guides/comparer-3-devis-artisans' },
  { label: 'Délai de rétractation devis', href: '/guides/delai-retractation-devis-artisan' },
  { label: 'Vérifier le SIRET d’un artisan', href: '/guides/verifier-siret-artisan' },
  { label: 'Éviter les arnaques d’artisans', href: '/guides/eviter-arnaques-artisan' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Budget & Devis',
    keywords: [
      'demander devis travaux',
      'cahier des charges travaux',
      'devis gratuit artisan',
      'comment faire devis',
      'demande devis',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Faire une demande de devis', url: `/guides/${SLUG}` },
  ])
  const faqSchema = getFAQSchema(faqs)
  const howToSchema = getHowToSchema(howToSteps, {
    name: 'Demander un devis de travaux en 6 étapes',
    description:
      'Méthode structurée pour obtenir 3 devis d’artisans réellement comparables sous 10 jours.',
    totalTime: 'PT1H',
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Faire une demande de devis' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Hammer className="w-3.5 h-3.5" aria-hidden />
              Budget &amp; Devis · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Comment demander un devis de travaux : méthode complète
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Un bon devis, c’est 80 % la qualité de votre demande. Plus votre cahier des charges
              est précis, plus les artisans vous renvoient des chiffrages sérieux et comparables.
              Voici la méthode pour recevoir 3 devis exploitables en 7 à 10 jours, sans relances
              sans fin ni mauvaises surprises à la signature.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Les 4 éléments d’une demande de devis efficace</h2>
            <ul>
              <li>
                <strong>Description factuelle du chantier.</strong> Surface, éléments
                conservés/déposés/ajoutés, matériaux souhaités. Pas de « je ne sais pas trop » :
                écrivez une hypothèse, quitte à la préciser après visite.
              </li>
              <li>
                <strong>Contraintes du lieu.</strong> Étage sans ascenseur, logement occupé,
                chantier en copropriété avec horaires imposés, stationnement payant, accès véhicule
                utilitaire. Ce sont des postes de coût parfois conséquents.
              </li>
              <li>
                <strong>Photos et mesures.</strong> Minimum 4-8 photos et un schéma à main levée.
                Pour un chantier important, un relevé de cotes ou plan de géomètre.
              </li>
              <li>
                <strong>Calendrier.</strong> Date de démarrage acceptable, date de réception
                souhaitée. Un délai flou invite à ne pas répondre ou à placer le chantier après tous
                les autres.
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

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <p className="font-heading text-sm font-semibold text-sand-900 mb-2">
                Modèle — demande de devis par e-mail
              </p>
              <pre className="whitespace-pre-wrap text-sm text-sand-700 bg-sand-50 rounded p-3 border border-sand-200 font-mono leading-relaxed">
                {`Objet : Demande de devis — [type chantier] à [ville]

Bonjour,

Je souhaite obtenir un devis pour les travaux suivants :

Chantier :
- Type : [salle de bain 4m², rénovation cuisine, isolation combles 100m²...]
- Adresse : [ville, étage, contraintes d'accès]
- Éléments à conserver : …
- Éléments à remplacer : …
- Matériaux souhaités : [marque ou gamme]
- Contraintes : [locataire en place, horaires copropriété, etc.]

Délais :
- Démarrage souhaité : [date ou période]
- Réception souhaitée : [date]

Mode d'attribution :
- Je consulte 3 artisans pour comparaison.
- Devis attendu : détaillé (main-d'œuvre, fournitures,
  déplacement séparés, prix unitaires, TVA applicable).

Photos et schéma joints en annexe.

Disponibilités pour une visite de métré :
[3 créneaux proposés]

Merci d'avance pour votre retour.

Cordialement,
[Prénom NOM]
[Téléphone]
[E-mail]`}
              </pre>
            </div>

            <h2>Les mentions à exiger sur le devis reçu</h2>
            <ul className="not-prose space-y-2">
              {[
                'Identité complète de l’entreprise (nom, adresse, SIRET à 14 chiffres, forme juridique)',
                'Numéro et organisme de la décennale (nom assureur + police)',
                'Date d’émission et durée de validité (3 mois standard)',
                'Description détaillée des prestations (quantités, prix unitaires)',
                'Taux de TVA applicable (20, 10, 5,5 %)',
                'Total HT, montant TVA, total TTC',
                'Conditions et échéancier de paiement',
                'Délai d’exécution prévisionnel',
                'Médiateur de la consommation (obligatoire art. L612-1)',
                'Pour chantier RGE : numéro de qualification + organisme + date validité',
              ].map((m) => (
                <li key={m} className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" aria-hidden />
                  <span>{m}</span>
                </li>
              ))}
            </ul>

            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>Rappel.</strong> Une fois signé, le devis devient un contrat. Vous avez 14
                jours pour vous rétracter seulement si la signature a lieu à domicile, à distance ou
                après démarchage (art. L221-18). Lisez attentivement avant de signer.
              </p>
            </div>

            <h2>Les 3 erreurs qui torpillent les demandes de devis</h2>
            <ul>
              <li>
                <strong>Demande trop vague.</strong> « Je voudrais refaire ma salle de bain, c’est
                combien ? » ne produit que des fourchettes larges, jamais un devis ferme. Décrivez
                précisément avant d’envoyer.
              </li>
              <li>
                <strong>Trop d’artisans contactés.</strong> 5 ou 6 artisans qui sentent une mise en
                concurrence démesurée refuseront de se déplacer. Limitez-vous à 3.
              </li>
              <li>
                <strong>Signature précipitée après visite.</strong> Ne signez jamais un devis le
                jour de la visite, même sous pression. Prenez 48 h pour relire et comparer.
              </li>
            </ul>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Clock className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Raccourci : 1 demande, 3 devis
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Décrivez votre projet une fois. Nous transmettons votre demande à des artisans
                    vérifiés (SIRET, décennale, avis). Vous recevez jusqu’à 3 devis comparables sous
                    24-48 h.
                  </p>
                  <Link
                    href="/devis"
                    className="inline-flex items-center gap-1.5 text-primary-700 font-semibold hover:underline"
                  >
                    Décrire mon projet <ArrowRight className="w-4 h-4" aria-hidden />
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
            <Link href="/devis" className="inline-flex items-center gap-1 hover:text-primary-700">
              Demander un devis <FileText className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
