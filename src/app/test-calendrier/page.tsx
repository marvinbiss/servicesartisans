'use client'

import BookingCalendar from '@/components/BookingCalendar'

export default function TestCalendrierPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Test du Calendrier de Réservation
        </h1>

        <BookingCalendar
          artisanId="test-artisan-123"
          artisanName="Jean Dupont Plomberie"
          serviceName="Plombier"
          onBookingComplete={(booking) => {
            console.log('Réservation effectuée:', booking)
            alert('Réservation confirmée ! Voir la console pour les détails.')
          }}
        />
      </div>
    </div>
  )
}
