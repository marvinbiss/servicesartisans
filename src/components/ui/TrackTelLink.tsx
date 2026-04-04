'use client'

import { trackEvent } from '@/lib/analytics/tracking'

interface TrackTelLinkProps {
  href: string
  children: React.ReactNode
  source: string
  className?: string
  'aria-label'?: string
}

/**
 * Client wrapper for tel: links in server components.
 * Fires phone_click event on click.
 */
export default function TrackTelLink({ href, children, source, className, 'aria-label': ariaLabel }: TrackTelLinkProps) {
  return (
    <a
      href={href}
      className={className}
      aria-label={ariaLabel}
      onClick={() => {
        trackEvent('phone_click', {
          source,
          value: 15,
          currency: 'EUR',
        })
      }}
    >
      {children}
    </a>
  )
}
