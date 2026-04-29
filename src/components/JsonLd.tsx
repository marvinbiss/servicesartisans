import { safeJsonStringify } from '@/lib/seo/safe-json'

interface JsonLdProps {
  data: Record<string, unknown> | (Record<string, unknown> | null | undefined)[]
  nonce?: string
}

export default function JsonLd({ data, nonce }: JsonLdProps) {
  const jsonLdArray = (Array.isArray(data) ? data : [data]).filter(Boolean)

  return (
    <>
      {jsonLdArray.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: safeJsonStringify(item) }}
        />
      ))}
    </>
  )
}
