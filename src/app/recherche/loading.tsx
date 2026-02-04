import { ProviderCardSkeleton } from '@/components/ui/Skeleton'

export default function RechercheLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
           <ProviderCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
