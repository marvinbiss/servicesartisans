import JsonLd from '@/components/JsonLd'
import { getBreadcrumbSchema } from '@/lib/seo/jsonld'

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Contact', url: '/contact' },
  ])

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      {children}
    </>
  )
}
