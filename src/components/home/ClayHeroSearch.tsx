'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function ClayHeroSearch() {
  const router = useRouter()
  const [service, setService] = useState('')
  const [ville, setVille] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (service) params.set('q', service)
    if (ville) params.set('location', ville)
    router.push(`/services${params.toString() ? `?${params.toString()}` : ''}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      {/* Service input */}
      <div className="flex items-center gap-2 flex-1 min-w-0 bg-white border border-stone-200 rounded-xl px-3 h-11 focus-within:border-clay-400 focus-within:ring-1 focus-within:ring-clay-400/20 transition-all">
        <svg className="w-4 h-4 text-clay-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
        </svg>
        <input
          type="text"
          value={service}
          onChange={e => setService(e.target.value)}
          placeholder="Quel service ?"
          className="w-0 flex-1 bg-transparent text-stone-800 placeholder-stone-400 text-sm outline-none"
        />
      </div>

      {/* Ville input */}
      <div className="flex items-center gap-2 flex-1 min-w-0 bg-white border border-stone-200 rounded-xl px-3 h-11 focus-within:border-clay-400 focus-within:ring-1 focus-within:ring-clay-400/20 transition-all">
        <svg className="w-4 h-4 text-clay-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0 1 15 0Z" />
        </svg>
        <input
          type="text"
          value={ville}
          onChange={e => setVille(e.target.value)}
          placeholder="Ville ou code postal"
          className="w-0 flex-1 bg-transparent text-stone-800 placeholder-stone-400 text-sm outline-none"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="bg-clay-400 hover:bg-clay-600 text-white font-bold text-sm px-5 h-11 rounded-xl shrink-0 transition-colors duration-200"
      >
        Trouver
      </button>
    </form>
  )
}
