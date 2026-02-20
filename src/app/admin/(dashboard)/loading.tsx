import { Skeleton } from '@/components/ui/Skeleton'

export default function Loading() {
  return (
    <div className="p-6 space-y-6">
      {/* Page title */}
      <Skeleton className="h-8 w-56" />

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="w-8 h-8 rounded-lg" />
            </div>
            <Skeleton className="h-9 w-20 mb-1" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>

      {/* Main content block */}
      <div className="bg-white rounded-xl border border-gray-200">
        {/* Table header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
        {/* Table rows */}
        <div className="divide-y divide-gray-100">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4">
              <Skeleton className="w-9 h-9 rounded-full shrink-0" />
              <div className="flex-1 grid grid-cols-3 gap-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <Skeleton className="h-7 w-20 rounded-full shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
