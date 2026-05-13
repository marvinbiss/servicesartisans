'use client'

/**
 * Command palette — Cmd/Ctrl+K (Linear/Vercel/Stripe pattern).
 *
 * Fonctionnement :
 * - Indexe services + villes top + actions globales (devis, RGE, aides...).
 * - Recherche fuzzy par préfixe + contains, accents-insensitive.
 * - Keyboard nav : ArrowUp/ArrowDown, Enter, Escape.
 * - Mobile : full-height bottom sheet, swipe-to-close.
 *
 * Pourquoi pas un toggle dans le Header :
 * - L'invocation est universelle (Cmd+K) — pas besoin de bouton dédié visible.
 * - On expose tout de même un bouton dans le Header pour découvrabilité (cf.
 *   `Header.tsx`).
 *
 * Bundle : ~3KB gzip (pas de dépendance externe). Chargé dynamiquement par
 * `CommandPaletteMount` pour ne pas peser sur le First Load.
 */
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Wrench,
  MapPin,
  FileText,
  Leaf,
  Calculator,
  HelpCircle,
  Phone,
  ArrowRight,
  X,
  Sparkles,
} from 'lucide-react'
import { services as servicesLight } from '@/lib/data/france-light'
import { villesLight } from '@/lib/data/france-light'

export type CommandItem = {
  id: string
  label: string
  hint?: string
  href: string
  icon: ReactNode
  group: 'Actions' | 'Métiers' | 'Villes' | 'Aides & RGE' | 'Guides'
  keywords?: string[]
}

const STATIC_ACTIONS: CommandItem[] = [
  {
    id: 'action-devis',
    label: 'Demander un devis gratuit',
    hint: 'Décrivez votre projet en 3 minutes',
    href: '/devis',
    icon: <FileText className="w-4 h-4" />,
    group: 'Actions',
    keywords: ['quote', 'demande', 'gratuit'],
  },
  {
    id: 'action-simulateur',
    label: 'Simuler mes aides rénovation',
    hint: 'MaPrimeRénov’, CEE, éco-PTZ',
    href: '/simulateur-aides-renovation',
    icon: <Calculator className="w-4 h-4" />,
    group: 'Aides & RGE',
    keywords: ['maprimerenov', 'cee', 'simulateur', 'aide'],
  },
  {
    id: 'action-rge',
    label: 'Trouver un artisan RGE',
    hint: 'Annuaire officiel ADEME',
    href: '/rge',
    icon: <Leaf className="w-4 h-4" />,
    group: 'Aides & RGE',
    keywords: ['rge', 'ademe', 'certifie'],
  },
  {
    id: 'action-renovation',
    label: 'Rénovation énergétique',
    hint: 'Tous les guides + aides',
    href: '/renovation-energetique',
    icon: <Sparkles className="w-4 h-4" />,
    group: 'Aides & RGE',
    keywords: ['renovation', 'isolation', 'chauffage'],
  },
  {
    id: 'action-faq',
    label: 'Questions fréquentes',
    href: '/faq',
    icon: <HelpCircle className="w-4 h-4" />,
    group: 'Actions',
  },
  {
    id: 'action-contact',
    label: 'Nous contacter',
    href: '/contact',
    icon: <Phone className="w-4 h-4" />,
    group: 'Actions',
  },
]

const FEATURED_GUIDES: CommandItem[] = [
  {
    id: 'guide-pac',
    label: 'Pompe à chaleur — prix 2026',
    href: '/guides/pompe-a-chaleur',
    icon: <Sparkles className="w-4 h-4" />,
    group: 'Guides',
    keywords: ['pac', 'pompe a chaleur', 'air-eau', 'air-air'],
  },
  {
    id: 'guide-fioul',
    label: 'Chaudière fioul — interdiction & aides',
    href: '/guides/chaudiere-fioul-interdite-2026',
    icon: <Sparkles className="w-4 h-4" />,
    group: 'Guides',
    keywords: ['fioul', 'chaudiere', 'interdiction'],
  },
  {
    id: 'guide-thermostat',
    label: 'Thermostat connecté — économies',
    href: '/guides/thermostat-connecte-economie-energie',
    icon: <Sparkles className="w-4 h-4" />,
    group: 'Guides',
    keywords: ['thermostat', 'connecte', 'netatmo', 'tado'],
  },
]

function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()
}

function score(item: CommandItem, query: string): number {
  if (!query) return 0
  const q = normalize(query)
  const label = normalize(item.label)
  const hint = item.hint ? normalize(item.hint) : ''
  const kws = (item.keywords || []).map(normalize)

  if (label.startsWith(q)) return 100
  if (kws.some((k) => k.startsWith(q))) return 90
  if (label.includes(q)) return 70
  if (hint.includes(q)) return 50
  if (kws.some((k) => k.includes(q))) return 40
  return 0
}

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Build searchable item universe — memoized: services + top villes + actions + guides
  const allItems: CommandItem[] = useMemo(() => {
    const serviceItems: CommandItem[] = servicesLight.map((s) => ({
      id: `service-${s.slug}`,
      label: s.name,
      hint: 'Trouver un artisan',
      href: `/services/${s.slug}`,
      icon: <Wrench className="w-4 h-4" />,
      group: 'Métiers',
    }))
    const villeItems: CommandItem[] = villesLight.map((v) => ({
      id: `ville-${v.slug}`,
      label: v.name,
      hint: v.region,
      href: `/${v.slug}`,
      icon: <MapPin className="w-4 h-4" />,
      group: 'Villes',
      keywords: [v.departement || '', v.codePostal || ''],
    }))
    return [...STATIC_ACTIONS, ...FEATURED_GUIDES, ...serviceItems, ...villeItems]
  }, [])

  const results: CommandItem[] = useMemo(() => {
    if (!query) {
      // Empty query: show top actions + guides only
      return [...STATIC_ACTIONS, ...FEATURED_GUIDES]
    }
    const scored = allItems
      .map((item) => ({ item, score: score(item, query) }))
      .filter(({ score: s }) => s > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 24)
    return scored.map(({ item }) => item)
  }, [allItems, query])

  const grouped = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {}
    for (const item of results) {
      ;(groups[item.group] ||= []).push(item)
    }
    return Object.entries(groups)
  }, [results])

  // Auto-focus when opening, reset when closing
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(t)
    }
    setQuery('')
    setActiveIndex(0)
  }, [open])

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  // Lock body scroll & global Escape
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  const select = useCallback(
    (item: CommandItem) => {
      onClose()
      router.push(item.href)
    },
    [router, onClose]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex((i) => Math.min(i + 1, results.length - 1))
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((i) => Math.max(i - 1, 0))
        return
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        const item = results[activeIndex]
        if (item) select(item)
      }
    },
    [activeIndex, results, select, onClose]
  )

  // Keep active item in view
  useEffect(() => {
    if (!listRef.current) return
    const active = listRef.current.querySelector<HTMLElement>('[data-active="true"]')
    active?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  if (!open) return null

  let flatIndex = -1

  return (
    <>
      <div
        className="fixed inset-0 z-modal bg-charcoal-900/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed inset-0 z-modal flex items-start justify-center px-4 pt-[10vh] pointer-events-none">
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Recherche rapide"
          className="pointer-events-auto w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-sand-200 overflow-hidden"
        >
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-sand-200">
            <Search className="w-5 h-5 text-charcoal-400 flex-shrink-0" aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Métier, ville, guide, action…"
              className="flex-1 bg-transparent outline-none text-charcoal-900 placeholder:text-charcoal-400 text-base"
              autoComplete="off"
              spellCheck={false}
              aria-controls="cmdk-results"
              aria-activedescendant={
                results[activeIndex] ? `cmdk-item-${results[activeIndex].id}` : undefined
              }
            />
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-charcoal-400 hover:text-charcoal-700 transition-colors rounded-md"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Results */}
          <div
            ref={listRef}
            id="cmdk-results"
            role="listbox"
            className="max-h-[60vh] overflow-y-auto"
          >
            {results.length === 0 ? (
              <div className="px-6 py-12 text-center text-charcoal-500 text-sm">
                Aucun résultat pour « <span className="font-semibold">{query}</span> ».
                <br />
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    router.push(`/recherche?q=${encodeURIComponent(query)}`)
                  }}
                  className="mt-3 text-primary-500 hover:text-primary-600 font-medium"
                >
                  Lancer une recherche complète →
                </button>
              </div>
            ) : (
              grouped.map(([group, items]) => (
                <div key={group} className="py-2">
                  <p className="px-4 pt-1 pb-1.5 text-[11px] font-semibold tracking-wide uppercase text-charcoal-400">
                    {group}
                  </p>
                  {items.map((item) => {
                    flatIndex++
                    const active = flatIndex === activeIndex
                    return (
                      <button
                        key={item.id}
                        id={`cmdk-item-${item.id}`}
                        type="button"
                        role="option"
                        aria-selected={active}
                        data-active={active}
                        onClick={() => select(item)}
                        onMouseEnter={() => setActiveIndex(flatIndex)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                          active
                            ? 'bg-primary-50 text-charcoal-900'
                            : 'text-charcoal-700 hover:bg-sand-100'
                        }`}
                      >
                        <span
                          className={`flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0 ${
                            active
                              ? 'bg-primary-100 text-primary-600'
                              : 'bg-sand-100 text-charcoal-500'
                          }`}
                        >
                          {item.icon}
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm font-medium truncate">{item.label}</span>
                          {item.hint && (
                            <span className="block text-xs text-charcoal-500 truncate">
                              {item.hint}
                            </span>
                          )}
                        </span>
                        {active && (
                          <ArrowRight className="w-4 h-4 text-primary-500 flex-shrink-0" />
                        )}
                      </button>
                    )
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer hints */}
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-t border-sand-200 bg-sand-50 text-[11px] text-charcoal-500">
            <span className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded border border-sand-300 bg-white font-mono">
                  ↑↓
                </kbd>
                naviguer
              </span>
              <span className="inline-flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded border border-sand-300 bg-white font-mono">
                  ↵
                </kbd>
                ouvrir
              </span>
              <span className="inline-flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded border border-sand-300 bg-white font-mono">
                  esc
                </kbd>
                fermer
              </span>
            </span>
            <span>
              {results.length} résultat{results.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>
    </>
  )
}

export default CommandPalette
