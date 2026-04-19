'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import {
  CeePartnerTracking,
  type CeePartnerCtaSurface,
  type CeePartnerLandingViewProps,
} from '@/lib/analytics/tracking'

type PartnerLandingTrackerProps = CeePartnerLandingViewProps & {
  trackDashboardPreview?: boolean
}

export function PartnerLandingTracker({
  source,
  referrer,
  trackDashboardPreview,
}: PartnerLandingTrackerProps) {
  const firedView = useRef(false)
  const firedDashboard = useRef(false)
  const previewRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (firedView.current) return
    firedView.current = true
    const resolvedReferrer =
      referrer ?? (typeof document !== 'undefined' ? document.referrer : undefined)
    CeePartnerTracking.landingView({ source, referrer: resolvedReferrer })
  }, [source, referrer])

  useEffect(() => {
    if (!trackDashboardPreview) return
    const target = previewRef.current
    if (!target || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !firedDashboard.current) {
            firedDashboard.current = true
            CeePartnerTracking.dashboardPreviewView()
            observer.disconnect()
            break
          }
        }
      },
      { threshold: 0.35 }
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [trackDashboardPreview])

  if (!trackDashboardPreview) return null

  return (
    <div
      ref={previewRef}
      aria-hidden="true"
      data-testid="partner-dashboard-preview-sentinel"
      className="sr-only"
    />
  )
}

type PartnerCtaLinkProps = Omit<ComponentPropsWithoutRef<typeof Link>, 'children'> & {
  surface: CeePartnerCtaSurface
  ctaLabel?: string
  children: ReactNode
}

export function PartnerCtaLink({
  surface,
  ctaLabel,
  href,
  onClick,
  children,
  ...rest
}: PartnerCtaLinkProps) {
  const target = typeof href === 'string' ? href : JSON.stringify(href)

  const handleClick: PartnerCtaLinkProps['onClick'] = (event) => {
    CeePartnerTracking.ctaClick({ surface, target, cta_label: ctaLabel })
    onClick?.(event)
  }

  return (
    <Link href={href} onClick={handleClick} {...rest}>
      {children}
    </Link>
  )
}

type PartnerCtaPhoneProps = ComponentPropsWithoutRef<'a'> & {
  surface: CeePartnerCtaSurface
  ctaLabel?: string
}

export function PartnerCtaPhone({
  surface,
  ctaLabel,
  href,
  onClick,
  children,
  ...rest
}: PartnerCtaPhoneProps) {
  const target = href ?? 'tel:unknown'

  const handleClick: PartnerCtaPhoneProps['onClick'] = (event) => {
    CeePartnerTracking.ctaClick({ surface, target, cta_label: ctaLabel })
    onClick?.(event)
  }

  return (
    <a href={href} onClick={handleClick} {...rest}>
      {children}
    </a>
  )
}
