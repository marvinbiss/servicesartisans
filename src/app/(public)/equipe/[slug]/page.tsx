import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Clock, BookOpen, Tag, ShieldCheck, ListChecks } from 'lucide-react'
import { authors, type Author } from '@/lib/data/authors'
import { allArticles } from '@/lib/data/blog/articles'
import { Breadcrumb } from '@/components/seo/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { getPersonSchema, getBreadcrumbSchema, getProfilePageSchema } from '@/lib/seo/jsonld'
import { SITE_URL, getAlternates, getOgDefaults } from '@/lib/seo/config'
import { monthlyAnchorIso } from '@/lib/seo/sprint-helpers'

export const revalidate = 3600

interface PageProps {
  params: Promise<{ slug: string }>
}

function getAuthorBySlug(slug: string): Author | undefined {
  return authors[slug]
}

/** Find articles written by this author (matched by name) */
function getArticlesByAuthor(authorName: string) {
  return Object.entries(allArticles)
    .filter(([, article]) => article.author === authorName)
    .map(([slug, article]) => ({ slug, ...article }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export async function generateStaticParams() {
  return Object.keys(authors).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const author = getAuthorBySlug(slug)
  if (!author) return {}

  const title = `${author.name} — ${author.role} | ServicesArtisans`
  const titleRoot = `${author.name} — ${author.role}`
  const description = `${author.bio.slice(0, 155)}...`

  return {
    title: titleRoot,
    description,
    alternates: getAlternates(`/equipe/${slug}`),
    openGraph: {
      ...getOgDefaults(),
      title,
      description,
      url: `${SITE_URL}/equipe/${slug}`,
      type: 'profile',
    },
  }
}

export default async function AuthorPage({ params }: PageProps) {
  const { slug } = await params
  const author = getAuthorBySlug(slug)
  if (!author) notFound()

  const articles = getArticlesByAuthor(author.name)

  const personSchema = getPersonSchema(author)
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Notre équipe', url: '/equipe' },
    { name: author.name, url: `/equipe/${slug}` },
  ])

  const canonicalUrl = `${SITE_URL}/equipe/${slug}`
  // dateCreated = date of author's first article (stable anchor for the profile),
  // dateModified = date of most recent article (invalidates stale ProfilePage cache).
  // Fallback to current month ISO when the author has no articles yet — avoids
  // emitting a missing signal Google flags as invalid ProfilePage schema.
  const fallbackIso = monthlyAnchorIso().slice(0, 10)
  const articleDates = articles.map((a) => a.date).filter(Boolean)
  const dateCreated = articleDates[articleDates.length - 1] || fallbackIso
  const dateModified = articleDates[0] || fallbackIso
  const profilePageSchema = getProfilePageSchema({
    person: personSchema,
    canonicalUrl,
    dateCreated,
    dateModified,
    articles: articles.slice(0, 30).map((a) => ({
      url: `${SITE_URL}/blog/${a.slug}`,
      title: a.title,
      datePublished: a.date,
    })),
  })

  const breadcrumbItems = [{ label: 'Notre équipe', href: '/equipe' }, { label: author.name }]

  return (
    <>
      <JsonLd data={[profilePageSchema, breadcrumbSchema]} />

      <div className="bg-sand-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Breadcrumb items={breadcrumbItems} className="mb-6" />

          {/* Header */}
          <header className="bg-white rounded-xl border border-sand-200 p-6 md:p-8 mb-8">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-heading font-bold text-2xl md:text-3xl shrink-0">
                {author.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
              <div className="flex-1 min-w-0">
                <h1
                  data-speakable="true"
                  className="font-heading text-2xl md:text-3xl font-bold text-charcoal-900 mb-1"
                >
                  {author.name}
                </h1>
                <p className="text-primary-600 font-medium mb-3">{author.role}</p>
                <div className="flex items-center gap-4 text-sm text-charcoal-500">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {author.yearsExperience} ans sur le sujet
                  </span>
                </div>
              </div>
            </div>

            <p className="text-charcoal-700 leading-relaxed mt-6">{author.bio}</p>
          </header>

          {/* Credentials basis — honest framing */}
          <section className="bg-white rounded-xl border border-sand-200 p-6 md:p-8 mb-8">
            <h2 className="font-heading text-lg font-semibold text-charcoal-900 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary-600" />
              Bases rédactionnelles
            </h2>
            <p className="text-charcoal-700 leading-relaxed text-sm">{author.credentialsBasis}</p>
            <p className="text-xs text-charcoal-500 mt-3">
              {author.name.split(' ')[0]} n&apos;est pas un artisan certifié RGE, Qualibat ou
              Qualifelec&nbsp;— ces qualifications appartiennent aux professionnels qui exécutent
              les travaux cités dans ses guides.
            </p>
          </section>

          {/* Methodology */}
          {author.methodology.length > 0 && (
            <section className="bg-white rounded-xl border border-sand-200 p-6 md:p-8 mb-8">
              <h2 className="font-heading text-lg font-semibold text-charcoal-900 mb-4 flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-primary-600" />
                Méthodologie éditoriale
              </h2>
              <ul className="space-y-2">
                {author.methodology.map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-charcoal-700 leading-relaxed">
                    <span aria-hidden className="text-primary-600 font-bold shrink-0 w-4">
                      ·
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-charcoal-500 mt-4">
                <Link href="/equipe#process-editorial" className="text-primary-700 hover:underline">
                  Voir le process éditorial complet
                </Link>
              </p>
            </section>
          )}

          {/* Expertise */}
          {author.expertise.length > 0 && (
            <section className="bg-white rounded-xl border border-sand-200 p-6 md:p-8 mb-8">
              <h2 className="font-heading text-lg font-semibold text-charcoal-900 mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-primary-600" />
                Domaines d&apos;expertise
              </h2>
              <div className="flex flex-wrap gap-2">
                {author.expertise.map((domain) => (
                  <span
                    key={domain}
                    className="bg-sand-100 text-charcoal-700 px-3 py-1.5 rounded-full text-sm"
                  >
                    {domain}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Articles */}
          {articles.length > 0 && (
            <section className="bg-white rounded-xl border border-sand-200 p-6 md:p-8">
              <h2 className="font-heading text-lg font-semibold text-charcoal-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary-600" />
                Articles rédigés ({articles.length})
              </h2>
              <ul className="divide-y divide-sand-100">
                {articles.map((article) => (
                  <li key={article.slug}>
                    <Link
                      href={`/blog/${article.slug}`}
                      className="flex items-start gap-3 py-3 group hover:bg-sand-50 -mx-2 px-2 rounded-lg transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-charcoal-800 font-medium group-hover:text-primary-600 transition-colors line-clamp-2">
                          {article.title}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-charcoal-500">
                          <span>{article.category}</span>
                          <span>
                            {new Date(article.date).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </span>
                          <span>{article.readTime} de lecture</span>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {articles.length === 0 && (
            <section className="bg-white rounded-xl border border-sand-200 p-6 md:p-8 text-center">
              <BookOpen className="w-8 h-8 text-charcoal-400 mx-auto mb-3" />
              <p className="text-charcoal-500">
                Les articles de {author.name} seront bientôt disponibles.
              </p>
            </section>
          )}
        </div>
      </div>
    </>
  )
}
