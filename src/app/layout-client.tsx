'use client'
import dynamic from 'next/dynamic'

// Client-only, lazily-loaded chrome/tracking widgets for the root layout.
// `ssr: false` is only permitted inside a Client Component in Next 16, so these
// dynamic() declarations were extracted out of the Server Component `layout.tsx`
// into this module. Behaviour (client-only, code-split) is unchanged.

export const MobileBottomNav = dynamic(() => import('@/components/MobileBottomNav'), { ssr: false })
export const ServiceWorkerRegistration = dynamic(
  () => import('@/components/ServiceWorkerRegistration'),
  { ssr: false }
)
export const CookieConsent = dynamic(() => import('@/components/CookieConsent'), { ssr: false })
export const ScrollToTop = dynamic(() => import('@/components/ui/ScrollToTop'), { ssr: false })
export const WebVitals = dynamic(
  () => import('@/components/WebVitals').then((mod) => ({ default: mod.WebVitals })),
  { ssr: false }
)
export const PageViewTracker = dynamic(() => import('@/components/PageViewTracker'), { ssr: false })
export const PostHogProvider = dynamic(() => import('@/components/PostHogProvider'), { ssr: false })
export const AuthTracker = dynamic(() => import('@/components/AuthTracker'), { ssr: false })
export const ConsentGatedScripts = dynamic(() => import('@/components/ConsentGatedScripts'), {
  ssr: false,
})
export const CompareBar = dynamic(
  () => import('@/components/compare/CompareBar').then((mod) => ({ default: mod.CompareBar })),
  { ssr: false }
)
export const CommandPaletteMount = dynamic(
  () =>
    import('@/components/command-palette/CommandPaletteMount').then((mod) => ({
      default: mod.CommandPaletteMount,
    })),
  { ssr: false }
)
export const CompareProviderWrapperDynamic = dynamic(
  () =>
    import('@/components/compare/CompareProvider').then((mod) => ({
      default: mod.CompareProviderWrapper,
    })),
  { ssr: false }
)
