import DOMPurify from 'isomorphic-dompurify'

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
      className={`prose prose-gray max-w-none prose-headings:text-gray-900 prose-a:text-blue-600 prose-img:rounded-lg ${className}`}
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
    />
  )
}
