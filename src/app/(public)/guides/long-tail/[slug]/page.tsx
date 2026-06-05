/**
 * @kw-cluster long-tail Bloc 3 (matching-terms multi-cluster)
 * @ahrefs-source tmp/ahrefs/bloc3-longtail-2026-05-04.csv
 * @snapshot 2026-05-04
 * @cap-prerender 50 (top KW par volume) — reste accessible ISR
 *
 * Sprint 3 vague 4 (2026-05-04) — route programmatic Bloc 3 long-tail.
 * Chaque page = 1 KW Ahrefs ranké à intent informationnel/transactionnel
 * mid-tail. Volume 100-68K, KD 0-30. Breadcrumb pointe vers le hub topic
 * (VMC, PAC, Solaire, MPR, CEE, DPE, Isolation) pour cascade PageRank.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, MapPin, BookOpen, Calculator, ShieldCheck } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import EnBrefBox from '@/components/seo/EnBrefBox'
import TldrBlock from '@/components/flagship/TldrBlock'
import { SITE_URL, getAlternates, getOgDefaults } from '@/lib/seo/config'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import {
  getLongTailBySlug,
  getTopLongTailKeywords,
  getTopicHubForSeed,
  type LongTailKw,
} from '@/lib/seo/bloc3-longtail'

export const revalidate = 86400 // 24 h
export const dynamicParams = true

export function generateStaticParams() {
  return getTopLongTailKeywords(50).map((k) => ({ slug: k.slug }))
}

interface PageProps {
  params: Promise<{ slug: string }>
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function buildPath(slug: string): string {
  return `/guides/long-tail/${slug}`
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const kw = getLongTailBySlug(slug)
  if (!kw) return { robots: { index: false, follow: false } }
  const path = buildPath(slug)
  const titleBase = capitalize(kw.keyword)
  const title = `${titleBase} : guide complet 2026 — tarifs, aides, RGE`
  const description = `${titleBase} en 2026 : prix moyens, aides MaPrimeRénov’ et CEE, démarches pas-à-pas, artisans RGE vérifiés. Volume search ${kw.volume.toLocaleString('fr-FR')} req/mois.`
  return {
    title: title.length > 60 ? `${titleBase} 2026 — guide` : title,
    description: description.slice(0, 158),
    alternates: getAlternates(path),
    robots: { index: kw.volume >= 200, follow: true },
    openGraph: {
      ...getOgDefaults(),
      locale: 'fr_FR',
      title,
      description,
      url: `${SITE_URL}${path}`,
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}

function buildFaq(kw: LongTailKw): { question: string; answer: string }[] {
  const subject = kw.keyword
  return [
    {
      question: `Quel est le prix moyen pour ${subject} en 2026 ?`,
      answer: `Le tarif dépend du contexte (zone climatique, configuration logement, marque). Demandez plusieurs devis comparatifs auprès d’artisans RGE référencés ServicesArtisans pour obtenir une fourchette précise sur votre projet ${subject}.`,
    },
    {
      question: `${capitalize(subject)} : quelles aides 2026 ?`,
      answer: `Selon votre revenu fiscal de référence et la nature des travaux, MaPrimeRénov’ (Anah), les Certificats d’Économies d’Énergie (CEE) et l’éco-PTZ peuvent être cumulables. Le simulateur ServicesArtisans calcule votre éligibilité en moins de 2 minutes.`,
    },
    {
      question: `Faut-il un artisan RGE pour ${subject} ?`,
      answer: `Pour bénéficier de MaPrimeRénov’ ou des CEE, l’intervention doit être réalisée par un professionnel RGE (Reconnu Garant de l’Environnement) certifié sur la qualification correspondante (Qualibat, QualiPAC, QualiBois, Qualifelec, etc.). Tous les artisans listés sur ServicesArtisans sont vérifiés via la base ADEME officielle.`,
    },
    {
      question: `Combien de temps prévoir pour ${subject} ?`,
      answer: `La durée varie selon l’ampleur des travaux : de quelques heures pour un dépannage à plusieurs jours/semaines pour une rénovation lourde. Votre artisan RGE vous transmet un planning précis dans le devis.`,
    },
    {
      question: `Comment obtenir un devis ${subject} ?`,
      answer: `Remplissez le formulaire de demande ServicesArtisans (gratuit, sans engagement). Plusieurs artisans RGE de votre département vous proposeront un devis dans les 24 à 48 h.`,
    },
  ]
}

function buildTldrBullets(kw: LongTailKw): string[] {
  const subject = kw.keyword
  const easyWin = kw.kd <= 5
  return [
    `${capitalize(subject)} : volume de recherche ${kw.volume.toLocaleString('fr-FR')} requêtes/mois (Ahrefs ${easyWin ? 'easy win KD ' + kw.kd : 'KD ' + kw.kd}).`,
    `Aides cumulables 2026 : MaPrimeRénov’, Certificats d’Économies d’Énergie, éco-PTZ, TVA réduite à 5,5 %.`,
    `Artisans RGE certifiés (Qualibat, QualiPAC, QualiBois, Qualifelec) — intervention sur tout le territoire.`,
    `Devis gratuit en 2 minutes via le simulateur ServicesArtisans, plusieurs offres comparatives en 24-48 h.`,
  ]
}

export default async function LongTailPage({ params }: PageProps) {
  const { slug } = await params
  const kw = getLongTailBySlug(slug)
  if (!kw) notFound()

  const path = buildPath(slug)
  const titleH1 = capitalize(kw.keyword)
  const topic = getTopicHubForSeed(kw.seed)
  const faqs = buildFaq(kw)
  const faqSchema = getFAQSchema(faqs)
  const tldrBullets = buildTldrBullets(kw)

  const breadcrumbItems = [
    { name: 'Accueil', url: SITE_URL },
    { name: 'Guides', url: `${SITE_URL}/guides` },
    ...(topic ? [{ name: topic.label, url: `${SITE_URL}${topic.href}` }] : []),
    { name: titleH1, url: `${SITE_URL}${path}` },
  ]

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: titleH1,
    inLanguage: 'fr-FR',
    datePublished: '2026-05-04',
    dateModified: '2026-05-04',
    image: `${SITE_URL}/opengraph-image`,
    author: {
      '@type': 'Organization',
      name: 'ServicesArtisans',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'ServicesArtisans',
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.svg` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}${path}` },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['[data-speakable="true"]'],
    },
  }

  return (
    <main className="min-h-screen bg-sand-50">
      <JsonLd data={getBreadcrumbSchema(breadcrumbItems)} />
      <JsonLd data={articleSchema} />
      {faqSchema && <JsonLd data={faqSchema} />}

      <div className="container mx-auto max-w-3xl px-4 py-8">
        <Breadcrumb
          items={breadcrumbItems.map((b) => ({ label: b.name, href: b.url.replace(SITE_URL, '') }))}
        />

        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">
            Guide rénovation énergétique 2026
          </p>
          <h1 className="mt-2 text-3xl md:text-4xl font-heading font-bold text-charcoal-900">
            {titleH1}
          </h1>
          <p className="mt-3 text-base text-charcoal-600">
            Tarifs 2026, aides cumulables et démarches pas-à-pas pour {kw.keyword}. Tous les
            artisans listés sont RGE certifiés et vérifiés via la base ADEME officielle.
          </p>
          <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-charcoal-500">
            <span>
              Auteur : <span className="font-semibold text-charcoal-700">ServicesArtisans</span>{' '}
              <span className="text-charcoal-400">(rédaction éditoriale)</span>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Publié le <time dateTime="2026-05-04">4 mai 2026</time>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Mis à jour le <time dateTime="2026-05-04">4 mai 2026</time>
            </span>
          </p>
        </header>

        <TldrBlock bullets={tldrBullets} />

        <EnBrefBox
          title="En bref"
          summary={`${capitalize(kw.keyword)} reste un chantier accessible en 2026 grâce au cumul MaPrimeRénov’ + CEE + éco-PTZ. ServicesArtisans met en relation avec des artisans RGE certifiés sans frais ni engagement.`}
          keyPoints={[
            'Devis gratuit en 2 minutes',
            'Plusieurs offres comparatives sous 48 h',
            'Artisans RGE vérifiés ADEME',
            'Aides 2026 cumulables (MPR + CEE + éco-PTZ)',
          ]}
        />

        <section className="prose prose-sand max-w-none mt-8" data-speakable="true">
          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mt-8 mb-3">
            Pourquoi s’intéresser à {kw.keyword} en 2026 ?
          </h2>
          <p>
            Le marché de la rénovation énergétique reste l’un des plus structurants en 2026 avec les
            évolutions de MaPrimeRénov’ et le calendrier réglementaire (interdiction location
            DPE&nbsp;G en 2025, DPE&nbsp;F prévue 2028). {capitalize(kw.keyword)} attire{' '}
            <strong>{kw.volume.toLocaleString('fr-FR')} requêtes mensuelles</strong> en France
            (source Ahrefs, mai 2026), preuve d’un intérêt soutenu côté propriétaires comme
            bailleurs.
          </p>

          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mt-8 mb-3">
            Aides 2026 cumulables
          </h2>
          <ul>
            <li>
              <strong>MaPrimeRénov’</strong> : barèmes 2026 par couleur de revenu fiscal (Bleu,
              Jaune, Violet, Rose) et type d’opération.
            </li>
            <li>
              <strong>Certificats d’Économies d’Énergie (CEE)</strong> : prime versée par les
              obligés, cumulable avec MaPrimeRénov’.
            </li>
            <li>
              <strong>Éco-PTZ</strong> : prêt à taux zéro jusqu’à 50&nbsp;000&nbsp;€ pour bouquet de
              travaux ou rénovation globale.
            </li>
            <li>
              <strong>TVA réduite à 5,5&nbsp;%</strong> sur les travaux d’amélioration énergétique
              réalisés par un artisan RGE.
            </li>
          </ul>

          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mt-8 mb-3">
            Artisan RGE : pourquoi c’est obligatoire
          </h2>
          <p>
            Pour bénéficier de MaPrimeRénov’ ou des CEE, l’intervention doit être réalisée par un
            professionnel <strong>RGE (Reconnu Garant de l’Environnement)</strong> certifié sur la
            qualification correspondante (Qualibat, QualiPAC, QualiBois, Qualifelec, QualiPV). Tous
            les artisans listés sur ServicesArtisans sont vérifiés via la base ADEME officielle ; la
            qualification, son numéro et sa date d’expiration sont affichés sur chaque fiche.
          </p>

          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mt-8 mb-3">
            Étapes d’un projet {kw.keyword}
          </h2>
          <ol>
            <li>
              <strong>Demande de devis gratuite</strong> via le formulaire ServicesArtisans
              (2&nbsp;min).
            </li>
            <li>
              <strong>Mise en relation</strong> avec plusieurs artisans RGE de votre département.
            </li>
            <li>
              <strong>Visite technique</strong> et devis détaillés sous 24-48&nbsp;h.
            </li>
            <li>
              <strong>Validation</strong> : signature, démarches administratives (MaPrimeRénov’ +
              CEE) prises en charge.
            </li>
            <li>
              <strong>Travaux</strong> : intervention par l’artisan RGE choisi.
            </li>
            <li>
              <strong>Versement de la prime</strong> après contrôle des justificatifs (facture,
              photos avant/après, attestation sur l’honneur).
            </li>
          </ol>
        </section>

        <section className="mt-10 rounded-xl border border-primary-200 bg-primary-50 p-6">
          <h2 className="font-heading text-xl font-bold text-primary-900">
            Démarrer mon projet {kw.keyword}
          </h2>
          <p className="mt-2 text-sm text-primary-800">
            Devis gratuit, sans engagement, plusieurs artisans RGE en 24-48&nbsp;h.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/devis"
              className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-5 py-3 font-semibold text-white shadow-cta transition hover:bg-primary-600"
            >
              Obtenir mes devis <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/simulateur-aides-renovation"
              className="inline-flex items-center gap-2 rounded-lg border border-primary-300 px-5 py-3 font-semibold text-primary-800 transition hover:bg-white"
            >
              <Calculator className="h-4 w-4" /> Simuler mes aides
            </Link>
            {topic && (
              <Link
                href={topic.href}
                className="inline-flex items-center gap-2 rounded-lg border border-sand-300 bg-white px-5 py-3 font-semibold text-charcoal-700 transition hover:bg-sand-50"
              >
                <BookOpen className="h-4 w-4" /> Hub {topic.label}
              </Link>
            )}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-4">
            Questions fréquentes
          </h2>
          <ul className="space-y-4">
            {faqs.map((f) => (
              <li key={f.question} className="rounded-xl border border-sand-200 bg-white p-5">
                <p className="font-semibold text-charcoal-900">{f.question}</p>
                <p className="mt-2 text-sm text-charcoal-600">{f.answer}</p>
              </li>
            ))}
          </ul>
        </section>

        <footer className="mt-12 flex flex-wrap items-center gap-3 text-xs text-charcoal-500">
          <ShieldCheck className="h-4 w-4 text-accent-500" />
          <span>Artisans RGE vérifiés ADEME · données mises à jour 2026-05-04</span>
          <span>·</span>
          <MapPin className="h-3.5 w-3.5" />
          <span>Couverture France entière</span>
        </footer>
      </div>
    </main>
  )
}
