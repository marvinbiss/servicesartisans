import { Skeleton } from '@/components/ui/Skeleton'

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo placeholder */}
        <div className="flex justify-center mb-8">
          <Skeleton className="h-10 w-40" />
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-5">
          <Skeleton className="h-7 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />

          <div className="space-y-4 pt-2">
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-11 w-full rounded-lg" />
            </div>
            <div>
              <Skeleton className="h-4 w-28 mb-2" />
              <Skeleton className="h-11 w-full rounded-lg" />
            </div>
          </div>

          <Skeleton className="h-11 w-full rounded-lg" />

          <div className="flex justify-center">
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </div>
    </div>
  )
}
