'use client'

import { useState } from 'react'
import { Bot, TrendingUp, BarChart3, Clock, RefreshCw } from 'lucide-react'
import { useAdminFetch } from '@/hooks/admin/useAdminFetch'

interface CrawlStats {
  topPages: { url: string; count: number }[]
  crawlRate: { day: string; count: number }[]
  pageTypes: { page_type: string; count: number }[]
  recentCrawls: { url: string; user_agent: string; created_at: string }[]
  totalCrawls30d: number
}

export default function CrawlStatsPage() {
  const { data, isLoading, error, mutate } = useAdminFetch<CrawlStats>('/api/admin/crawl-stats')
  const [activeTab, setActiveTab] = useState<'top' | 'types' | 'recent'>('top')

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Erreur de chargement : {error.message || 'Impossible de récupérer les données de crawl.'}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bot className="h-7 w-7 text-orange-500" />
            Googlebot Crawl Stats
          </h1>
          <p className="text-gray-500 mt-1">Surveillance du crawl Googlebot — 30 derniers jours</p>
        </div>
        <button
          onClick={() => mutate()}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-sm"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total crawls (30j)</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? '—' : (data?.totalCrawls30d || 0).toLocaleString('fr-FR')}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <BarChart3 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Crawl moyen/jour</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading
                  ? '—'
                  : data?.crawlRate?.length
                    ? Math.round(
                        data.crawlRate.reduce((s, r) => s + r.count, 0) / data.crawlRate.length
                      ).toLocaleString('fr-FR')
                    : '0'}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Types de pages</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? '—' : data?.pageTypes?.length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Crawl Rate Chart (simple bar) */}
      {data?.crawlRate && data.crawlRate.length > 0 && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Crawl par jour</h2>
          <div className="flex items-end gap-1 h-40">
            {[...data.crawlRate].reverse().map((day) => {
              const maxCount = Math.max(...data.crawlRate.map((d) => d.count))
              const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0
              return (
                <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-gray-500">{day.count}</span>
                  <div
                    className="w-full bg-orange-400 rounded-t"
                    style={{ height: `${height}%`, minHeight: day.count > 0 ? '4px' : '0px' }}
                  />
                  <span className="text-[10px] text-gray-400 -rotate-45 origin-top-left whitespace-nowrap">
                    {new Date(day.day).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                    })}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-100 flex">
          {[
            { id: 'top' as const, label: 'Top 100 pages crawlées' },
            { id: 'types' as const, label: 'Distribution par type' },
            { id: 'recent' as const, label: 'Crawls récents' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {isLoading && <p className="text-gray-400 text-center py-8">Chargement...</p>}

          {/* Top 100 crawled pages */}
          {activeTab === 'top' && data?.topPages && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-2 font-medium">#</th>
                    <th className="pb-2 font-medium">URL</th>
                    <th className="pb-2 font-medium text-right">Crawls</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topPages.map((page, i) => (
                    <tr key={page.url} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2 text-gray-400">{i + 1}</td>
                      <td className="py-2 font-mono text-xs truncate max-w-[500px]">{page.url}</td>
                      <td className="py-2 text-right font-semibold">{page.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.topPages.length === 0 && (
                <p className="text-gray-400 text-center py-8">
                  Aucun crawl enregistré pour le moment.
                </p>
              )}
            </div>
          )}

          {/* Page type distribution */}
          {activeTab === 'types' && data?.pageTypes && (
            <div className="space-y-3">
              {data.pageTypes.map((type) => {
                const maxCount = Math.max(...data.pageTypes.map((t) => t.count))
                const width = maxCount > 0 ? (type.count / maxCount) * 100 : 0
                return (
                  <div key={type.page_type} className="flex items-center gap-3">
                    <span className="w-32 text-sm font-medium text-gray-700 truncate">
                      {type.page_type}
                    </span>
                    <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                      <div
                        className="bg-orange-400 h-full rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${Math.max(width, 2)}%` }}
                      >
                        <span className="text-xs text-white font-medium">{type.count}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
              {data.pageTypes.length === 0 && (
                <p className="text-gray-400 text-center py-8">Aucune donnée disponible.</p>
              )}
            </div>
          )}

          {/* Recent crawls */}
          {activeTab === 'recent' && data?.recentCrawls && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-2 font-medium">URL</th>
                    <th className="pb-2 font-medium">User-Agent</th>
                    <th className="pb-2 font-medium text-right">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentCrawls.map((crawl, i) => (
                    <tr
                      key={`${crawl.url}-${i}`}
                      className="border-b border-gray-50 hover:bg-gray-50"
                    >
                      <td className="py-2 font-mono text-xs truncate max-w-[400px]">{crawl.url}</td>
                      <td className="py-2 text-xs text-gray-500 truncate max-w-[300px]">
                        {crawl.user_agent}
                      </td>
                      <td className="py-2 text-right text-gray-500 whitespace-nowrap">
                        {new Date(crawl.created_at).toLocaleString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.recentCrawls.length === 0 && (
                <p className="text-gray-400 text-center py-8">Aucun crawl récent.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
