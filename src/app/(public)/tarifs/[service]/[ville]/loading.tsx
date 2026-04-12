import { Skeleton } from '@/components/ui/Skeleton'

export default function TarifsVilleLoading() {
  return (
    <div className="min-h-screen bg-sand-50">
      <div className="bg-gradient-to-br from-charcoal-900 via-charcoal-800 to-charcoal-900 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Skeleton className="h-10 w-72 mx-auto mb-3 bg-white/10" />
          <Skeleton className="h-6 w-80 mx-auto bg-white/10" />
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl border border-sand-300 overflow-hidden">
          <div className="p-4 border-b border-sand-300">
            <Skeleton className="h-6 w-48" />
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 border-b border-sand-200">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
