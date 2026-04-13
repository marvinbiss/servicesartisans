import JsonLd from '@/components/JsonLd'
import { getBreadcrumbSchema } from '@/lib/seo/jsonld'

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'FAQ', url: '/faq' },
  ])

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      {children}
    </>
  )
}
