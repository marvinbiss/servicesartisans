'use client'

import Link from 'next/link'
import { clsx } from 'clsx'

export interface LogoProps {
  variant?: 'full' | 'icon' | 'text'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  theme?: 'light' | 'dark' | 'auto'
  href?: string
  className?: string
}

const sizes = {
  sm: { icon: 28, text: 'text-lg' },
  md: { icon: 36, text: 'text-xl' },
  lg: { icon: 44, text: 'text-2xl' },
  xl: { icon: 52, text: 'text-3xl' },
}

export default function Logo({
  variant = 'full',
  size = 'md',
  theme = 'auto',
  href = '/',
  className,
}: LogoProps) {
  const { icon: iconSize, text: textSize } = sizes[size]

  // Brand kit "Affûté" (R1) — terracotta SA tile + bicolor wordmark.
  const isDark = theme === 'dark'
  const servicesColor = isDark ? '#FCFAF7' : '#1E1A16'
  const artisansColor = isDark ? '#E0723F' : '#C8492A'

  const LogoIcon = () => (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
    >
      <defs>
        <linearGradient id="logoTileShine" x1="0" y1="0" x2="0.7" y2="0.7">
          <stop offset="0" stopColor="#fff" stopOpacity="0.18" />
          <stop offset="0.46" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Terracotta rounded tile with top-left shine */}
      <rect width="48" height="48" rx="14.4" fill="#C8492A" />
      <rect width="48" height="48" rx="14.4" fill="url(#logoTileShine)" />

      {/* "SA" monogram */}
      <text
        x="24"
        y="25"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="var(--font-heading), 'Schibsted Grotesk', sans-serif"
        fontWeight="800"
        fontSize="22.08"
        letterSpacing="-0.99"
        fill="#fff"
      >
        SA
      </text>
    </svg>
  )

  const LogoText = () => (
    <span className={clsx('font-heading font-extrabold tracking-tight', textSize)}>
      <span style={{ color: servicesColor }}>Services</span>
      <span style={{ color: artisansColor }}>Artisans</span>
    </span>
  )

  const content = (
    <div className={clsx('flex items-center gap-2.5', className)}>
      {(variant === 'full' || variant === 'icon') && <LogoIcon />}
      {(variant === 'full' || variant === 'text') && <LogoText />}
    </div>
  )

  if (href) {
    return (
      <Link
        href={href}
        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded"
      >
        {content}
      </Link>
    )
  }

  return content
}

// Tagline component
export function Tagline({ className }: { className?: string }) {
  return (
    <p className={clsx('text-charcoal-600', className)}>
      Trouvez des artisans RGE certifiés près de chez vous
    </p>
  )
}

// Full brand header with logo and tagline
export function BrandHeader({
  size = 'lg',
  centered = false,
  className,
}: {
  size?: LogoProps['size']
  centered?: boolean
  className?: string
}) {
  return (
    <div className={clsx(centered && 'text-center', className)}>
      <Logo size={size} variant="full" className={centered ? 'justify-center' : ''} />
      <Tagline className={clsx('mt-1', size === 'sm' && 'text-sm', size === 'xl' && 'text-lg')} />
    </div>
  )
}
