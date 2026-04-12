interface CmsContentProps {
  html: string
  className?: string
}

export async function CmsContent({ html, className = '' }: CmsContentProps) {
  if (!html) {
    return null
  }

  // Lazy-import to avoid JSDOM crash in Vercel serverless cold start
  const { default: DOMPurify } = await import('isomorphic-dompurify')

  return (
    <div
      className={`prose prose-gray max-w-none prose-headings:text-charcoal-900 prose-a:text-primary-500 prose-img:rounded-lg ${className}`}
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
    />
  )
}
