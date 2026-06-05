'use client'

import { memo } from 'react'

interface Tab {
  key: string
  label: string
  count: number
}

interface StatusTabsProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (key: string) => void
}

export const StatusTabs = memo(function StatusTabs({
  tabs,
  activeTab,
  onTabChange,
}: StatusTabsProps) {
  return (
    <div className="flex gap-2 flex-wrap" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          role="tab"
          aria-selected={activeTab === tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
            activeTab === tab.key
              ? 'bg-primary-500 text-white shadow-sm'
              : 'bg-white text-charcoal-600 border border-sand-200 hover:bg-sand-50 hover:border-sand-300'
          }`}
        >
          {tab.label}
          <span
            className={`ml-1.5 ${activeTab === tab.key ? 'text-primary-200' : 'text-charcoal-400'}`}
          >
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  )
})
