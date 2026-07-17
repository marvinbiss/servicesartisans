'use client'
import dynamic from 'next/dynamic'

// next/dynamic with `ssr: false` is only allowed inside a Client Component
// (Next 16). Thin client wrapper preserving the original client-only lazy load.
export default dynamic(() => import('./SocialProofBanner'), { ssr: false })
