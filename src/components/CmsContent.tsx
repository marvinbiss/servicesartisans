import { sanitizeRichHtml } from '@/lib/sanitize-html-content'

interface CmsContentProps {
  html: string
  className?: string
}

export function CmsContent({ html, className = '' }: CmsContentProps) {
  if (!html) {
    return null
  }

  return (
    <div
      className={`prose prose-gray max-w-none prose-headings:text-charcoal-900 prose-a:text-primary-500 prose-img:rounded-lg ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(html) }}
    />
  )
}
