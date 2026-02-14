import DOMPurify from 'isomorphic-dompurify'

interface CmsContentProps {
  html: string
  className?: string
}

export function CmsContent({ html, className = '' }: CmsContentProps) {
  return (
    <div
      className={`prose prose-gray max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
    />
  )
}
