'use client'
import dynamic from 'next/dynamic'

// next/dynamic with `ssr: false` is only allowed inside a Client Component
// (Next 16). This thin client wrapper preserves the original client-only,
// lazy-loaded behaviour for the Server Component pages that render this widget.
export default dynamic(() => import('./GeoPageCTA'), { ssr: false })
