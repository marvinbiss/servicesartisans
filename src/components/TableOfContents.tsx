'use client'

import { useState, useEffect } from 'react'
import { List, ChevronDown, ChevronUp } from 'lucide-react'

interface TocItem {
  id: string
  text: string
  level: 'h2' | 'h3'
}

interface TableOfContentsProps {
  items: TocItem[]
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
    )

    for (const item of items) {
      const el = document.getElementById(item.id)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [items])

  // Count only h2 items for the section count and numbering
  const h2Items = items.filter((item) => item.level === 'h2')

  if (h2Items.length < 3) return null

  // Track h2 numbering
  let h2Counter = 0

  return (
    <nav className="my-8 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Header - clickable on mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 sm:px-6 sm:py-5 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100 text-amber-600">
            <List className="w-4 h-4" />
          </div>
          <span className="font-heading font-bold text-gray-900">Sommaire</span>
          <span className="text-xs text-gray-400 font-medium hidden sm:inline">
            {h2Items.length} sections
          </span>
        </div>
        <span className="sm:hidden text-gray-400">
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </span>
      </button>

      {/* TOC list - always visible on desktop, toggled on mobile */}
      <ol className={`px-5 pb-5 sm:px-6 sm:pb-6 space-y-1 ${isOpen ? 'block' : 'hidden sm:block'}`}>
        {items.map((item) => {
          const isH3 = item.level === 'h3'
          if (!isH3) h2Counter++

          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault()
                  const el = document.getElementById(item.id)
                  if (el) {
                    const y = el.getBoundingClientRect().top + window.scrollY - 80
                    window.scrollTo({ top: y, behavior: 'smooth' })
                  }
                  setIsOpen(false)
                }}
                className={`flex items-start gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 group ${
                  isH3 ? 'ml-6 ' : ''
                }${
                  activeId === item.id
                    ? 'bg-amber-50 text-amber-800 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {isH3 ? (
                  <span
                    className={`shrink-0 w-1.5 h-1.5 rounded-full mt-2 transition-colors ${
                      activeId === item.id
                        ? 'bg-amber-400'
                        : 'bg-gray-300 group-hover:bg-gray-400'
                    }`}
                  />
                ) : (
                  <span
                    className={`shrink-0 flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold mt-px transition-colors ${
                      activeId === item.id
                        ? 'bg-amber-200 text-amber-900'
                        : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-600'
                    }`}
                  >
                    {h2Counter}
                  </span>
                )}
                <span className="leading-snug">{item.text}</span>
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
