import sanitizeHtml from 'sanitize-html'

/**
 * Server-side rich-HTML sanitizer for trusted-author content (CMS pages, email
 * templates). Pure JS (htmlparser2) — no jsdom, so it never crashes on a Vercel
 * serverless cold start, unlike isomorphic-dompurify (which 500'd the artisan
 * provider PUT, 2026-06-07).
 *
 * Keeps presentational HTML + inline styles (emails rely on them), strips every
 * script/event-handler/dangerous-scheme vector.
 */
const ALLOWED_TAGS = [
  ...sanitizeHtml.defaults.allowedTags,
  'img',
  'h1',
  'h2',
  'figure',
  'figcaption',
  'header',
  'footer',
  'article',
  'aside',
  'address',
  'picture',
  'source',
]

export function sanitizeRichHtml(dirty: string): string {
  if (!dirty || typeof dirty !== 'string') {
    return ''
  }

  return sanitizeHtml(dirty, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      '*': [
        'style',
        'class',
        'id',
        'title',
        'dir',
        'lang',
        'align',
        'valign',
        'width',
        'height',
        'colspan',
        'rowspan',
        'role',
        'aria-label',
        'aria-hidden',
        'bgcolor',
        'color',
      ],
      a: ['href', 'name', 'target', 'rel'],
      img: ['src', 'alt', 'srcset', 'sizes', 'loading'],
      source: ['src', 'srcset', 'sizes', 'type', 'media'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: { img: ['http', 'https', 'data'], source: ['http', 'https', 'data'] },
    allowProtocolRelative: false,
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }, true),
    },
  })
}
