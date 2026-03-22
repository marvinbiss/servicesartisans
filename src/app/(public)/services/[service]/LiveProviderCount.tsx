'use client'

import { useEffect, useState } from 'react'

interface LiveProviderCountProps {
  initialCount: number
  serviceSlug: string
  className?: string
}

export default function LiveProviderCount({
  initialCount,
  serviceSlug,
  className,
}: LiveProviderCountProps) {
  const [count, setCount] = useState(initialCount)

  useEffect(() => {
    if (initialCount > 0 || !serviceSlug) return
    fetch(`/api/providers/listing?service=${serviceSlug}&limit=1`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (typeof data?.totalCount === 'number' && data.totalCount > 0) {
          setCount(data.totalCount)
        }
      })
      .catch(() => {})
  }, [initialCount, serviceSlug])

  return (
    <span className={className}>
      {count > 0 ? count.toLocaleString('fr-FR') : '—'}
    </span>
  )
}
