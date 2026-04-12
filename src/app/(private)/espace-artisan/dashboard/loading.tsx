export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-sand-50">
      {/* Breadcrumb skeleton */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="h-4 w-48 bg-sand-300 rounded animate-pulse" />
        </div>
      </div>

      {/* Header skeleton */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-8 w-56 bg-white/20 rounded animate-pulse mb-2" />
          <div className="h-5 w-40 bg-white/10 rounded animate-pulse" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar skeleton */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-10 bg-sand-100 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>

          {/* Main content skeleton */}
          <div className="lg:col-span-3 space-y-8">
            {/* Stats skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-sand-300 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="h-10 w-10 bg-sand-300 rounded-lg animate-pulse" />
                    <div className="h-6 w-14 bg-sand-300 rounded-full animate-pulse" />
                  </div>
                  <div className="h-8 w-20 bg-sand-300 rounded animate-pulse mb-1" />
                  <div className="h-4 w-28 bg-sand-300 rounded animate-pulse" />
                </div>
              ))}
            </div>

            {/* Demandes skeleton */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="h-6 w-44 bg-sand-300 rounded animate-pulse" />
                <div className="h-4 w-16 bg-sand-300 rounded animate-pulse" />
              </div>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="border border-sand-300 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="h-5 w-48 bg-sand-300 rounded animate-pulse" />
                        <div className="flex gap-4">
                          <div className="h-4 w-24 bg-sand-300 rounded animate-pulse" />
                          <div className="h-4 w-20 bg-sand-300 rounded animate-pulse" />
                          <div className="h-4 w-28 bg-sand-300 rounded animate-pulse" />
                        </div>
                      </div>
                      <div className="h-7 w-20 bg-sand-300 rounded-full animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
