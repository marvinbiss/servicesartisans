'use client'

import { useEffect, useState } from 'react'

interface Stats {
  artisanCount: number
  reviewCount: number
  averageRating: number
}

interface RealStatsProps {
  className?: string
  showArtisans?: boolean
  showReviews?: boolean
  showRating?: boolean
}

export function RealStats({ 
  className = '', 
  showArtisans = true,
  showReviews = true,
  showRating = true
}: RealStatsProps) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/stats/public')
      .then(res => res.json())
      .then(data => {
        setStats(data)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  if (loading || !stats) return null

  const parts = []
  
  if (showArtisans && stats.artisanCount > 0) {
    parts.push(`${stats.artisanCount.toLocaleString('fr-FR')} artisans`)
  }
  
  if (showRating && stats.averageRating > 0) {
    parts.push(`${stats.averageRating.toFixed(1)}/5 satisfaction`)
  }

  if (parts.length === 0) return null

  return (
    <span className={className}>
      {parts.join(' • ')}
    </span>
  )
}
