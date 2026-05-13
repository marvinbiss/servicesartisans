import { ExternalLink as ExternalLinkIcon } from 'lucide-react'
import type { AnchorHTMLAttributes, ReactNode } from 'react'

interface ExternalLinkProps extends Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'target' | 'rel'
> {
  /** Destination URL — must be a fully-qualified http(s):// origin */
  href: string
  /** Hide the trailing ↗ icon (rare — use when the link sits inside a
   *  surface that already signals externality, e.g. a "Sources" footer). */
  noIcon?: boolean
  /** Suffix appended to the visible label so SR users hear "ouvre dans
   *  un nouvel onglet". Stays out of the visible text via sr-only. */
  newTabAnnouncement?: string
  children: ReactNode
}

/**
 * Reusable accessible external-link component.
 *
 * - target="_blank" + rel="noopener noreferrer" (security: prevents
 *   reverse-tabnabbing on the opening tab)
 * - trailing ↗ icon (aria-hidden) signals the link leaves the site so
 *   sighted users aren't surprised by a context switch
 * - sr-only "(ouvre dans un nouvel onglet)" so AT users hear the same
 *   signal — WCAG 2.4.4 / 3.2.5
 */
export function ExternalLink({
  href,
  noIcon = false,
  newTabAnnouncement = 'ouvre dans un nouvel onglet',
  children,
  className = '',
  ...rest
}: ExternalLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 ${className}`}
      {...rest}
    >
      <span>{children}</span>
      {!noIcon && <ExternalLinkIcon className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />}
      <span className="sr-only"> ({newTabAnnouncement})</span>
    </a>
  )
}

export default ExternalLink
