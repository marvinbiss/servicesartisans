'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Star, MapPin, Phone, Mail, Clock, ChevronLeft, ChevronRight,
  CheckCircle, Shield, Award, Calendar, Wrench, Euro, Navigation,
  MessageCircle, Heart, Share2, AlertCircle, Camera, CreditCard,
  Banknote, Users, TrendingUp, ChevronDown, ChevronUp, Zap,
  FileText, Home, BadgeCheck, Timer, ThumbsUp, ExternalLink,
  Globe, Building2
} from 'lucide-react'

interface TimeSlot {
  time: string
  available: boolean
}

interface DayAvailability {
  date: string
  dayName: string
  dayNumber: number
  month: string
  slots: TimeSlot[]
}

interface ServicePrice {
  name: string
  description: string
  price: string
  duration?: string
}

interface PortfolioItem {
  id: string
  title: string
  description: string
  imageUrl: string
  category: string
}

interface Artisan {
  id: string
  business_name: string | null
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  city: string
  postal_code: string
  address?: string
  specialty: string
  description?: string
  average_rating: number
  review_count: number
  hourly_rate?: number
  is_verified: boolean
  is_premium: boolean
  is_center?: boolean
  team_size?: number
  services: string[]
  service_prices: ServicePrice[]
  accepts_new_clients?: boolean
  intervention_zone?: string
  response_time?: string
  experience_years?: number
  certifications?: string[]
  insurance?: string[]
  payment_methods?: string[]
  languages?: string[]
  emergency_available?: boolean
  member_since?: string
  response_rate?: number
  bookings_this_week?: number
  portfolio?: PortfolioItem[]
  faq?: Array<{ question: string; answer: string }>
  // Donnees Pappers
  siret?: string
  siren?: string
  legal_form?: string
  creation_date?: string
  employee_count?: number
  annual_revenue?: number
  phone?: string
  email?: string
  website?: string
  latitude?: number
  longitude?: number
}

interface Review {
  id: string
  author: string
  rating: number
  date: string
  comment: string
  service: string
  hasPhoto?: boolean
  photoUrl?: string
  verified?: boolean
}

// Demo data fallback
const DEMO_ARTISANS: Record<string, Artisan> = {
  'demo-1': {
    id: 'demo-1',
    business_name: 'Plomberie Martin & Fils',
    first_name: null,
    last_name: null,
    avatar_url: null,
    city: 'Le Pre-Saint-Gervais',
    postal_code: '93310',
    address: '1 Rue Delteral',
    specialty: 'Plombier - Chauffagiste',
    description: 'Entreprise familiale de plomberie depuis 1985. Nous intervenons pour tous vos travaux de plomberie, chauffage et depannage urgent. Notre equipe de 3 professionnels qualifies est a votre service 7j/7 pour les urgences. Devis gratuit et intervention rapide garantie.',
    average_rating: 4.6,
    review_count: 234,
    hourly_rate: 55,
    is_verified: true,
    is_premium: true,
    is_center: true,
    team_size: 3,
    services: ['Depannage plomberie', 'Installation sanitaire', 'Chauffage', 'Debouchage', 'Recherche de fuite', 'Chauffe-eau'],
    service_prices: [
      { name: 'Deplacement + diagnostic', description: 'Evaluation sur place du probleme', price: '49€', duration: '30 min' },
      { name: 'Debouchage evier/lavabo', description: 'Debouchage mecanique ou haute pression', price: '80-120€', duration: '1h' },
      { name: 'Debouchage WC', description: 'Intervention debouchage toilettes', price: '90-150€', duration: '1h' },
      { name: 'Reparation fuite', description: 'Reparation fuite robinet, tuyau, joint', price: '80-200€', duration: '1-2h' },
      { name: 'Remplacement chauffe-eau', description: 'Depose ancien + pose nouveau (hors materiel)', price: '250-400€', duration: '3h' },
      { name: 'Installation WC', description: 'Pose WC complet avec raccordements', price: '150-300€', duration: '2h' },
    ],
    accepts_new_clients: true,
    intervention_zone: '20 km',
    response_time: '< 1h',
    experience_years: 38,
    certifications: ['RGE QualiPAC', 'Qualibat', 'Artisan certifie'],
    insurance: ['Garantie decennale AXA', 'RC Professionnelle', 'Garantie biennale'],
    payment_methods: ['Carte bancaire', 'Especes', 'Cheque', 'Virement', 'Cheque energie'],
    languages: ['Francais', 'Anglais'],
    emergency_available: true,
    member_since: '2019',
    response_rate: 98,
    bookings_this_week: 12,
    siret: '12345678901234',
    legal_form: 'SARL',
    creation_date: '1985-03-15',
    employee_count: 3,
    phone: '01 23 45 67 89',
    faq: [
      { question: 'Intervenez-vous le week-end ?', answer: 'Oui, nous intervenons 7j/7 pour les urgences. Les interventions le week-end peuvent faire l\'objet d\'une majoration de 30%.' },
      { question: 'Le devis est-il gratuit ?', answer: 'Oui, le devis est toujours gratuit et sans engagement. Pour les interventions a distance de plus de 20km, des frais de deplacement peuvent s\'appliquer.' },
      { question: 'Quels sont vos delais d\'intervention ?', answer: 'Pour les urgences, nous intervenons sous 1h en moyenne. Pour les travaux planifies, comptez 48-72h selon notre planning.' },
      { question: 'Acceptez-vous les cheques energie ?', answer: 'Oui, nous sommes agrees RGE et acceptons les cheques energie pour les travaux de chauffage eligibles.' },
    ],
  },
  'demo-2': {
    id: 'demo-2',
    business_name: null,
    first_name: 'Jerome',
    last_name: 'DUPONT',
    avatar_url: null,
    city: 'Le Pre-Saint-Gervais',
    postal_code: '93310',
    address: '9 Avenue Faidherbe',
    specialty: 'Electricien',
    description: 'Electricien agree avec plus de 15 ans d\'experience. Specialise dans la mise aux normes electriques, l\'installation de tableaux et le depannage.',
    average_rating: 4.8,
    review_count: 156,
    hourly_rate: 50,
    is_verified: true,
    is_premium: false,
    is_center: false,
    services: ['Mise aux normes', 'Installation tableau electrique', 'Depannage', 'Prises et interrupteurs'],
    service_prices: [
      { name: 'Diagnostic electrique', description: 'Verification installation complete', price: '90€', duration: '1h' },
      { name: 'Remplacement prise/interrupteur', description: 'Fourniture et pose', price: '45-70€', duration: '30 min' },
    ],
    accepts_new_clients: true,
    intervention_zone: '15 km',
    response_time: '< 2h',
    experience_years: 15,
    certifications: ['Consuel', 'Habilitation electrique BR'],
    insurance: ['Garantie decennale', 'RC Professionnelle'],
    payment_methods: ['Carte bancaire', 'Especes', 'Cheque'],
    languages: ['Francais'],
    emergency_available: false,
    member_since: '2020',
    response_rate: 95,
    bookings_this_week: 8,
    faq: [],
  },
}

const DEMO_REVIEWS: Review[] = [
  { id: '1', author: 'Marie L.', rating: 5, date: '15 janvier 2026', comment: 'Intervention rapide et efficace. Le probleme de fuite a ete resolu en moins d\'une heure. Tres professionnel, je recommande vivement !', service: 'Depannage plomberie', verified: true },
  { id: '2', author: 'Pierre D.', rating: 5, date: '12 janvier 2026', comment: 'Excellent travail pour l\'installation de mon nouveau chauffe-eau. Propre, ponctuel et de bons conseils. Prix correct.', service: 'Chauffe-eau', hasPhoto: true, verified: true },
  { id: '3', author: 'Sophie M.', rating: 4, date: '8 janvier 2026', comment: 'Bonne prestation pour le debouchage de mes canalisations. Un peu de retard mais travail bien fait.', service: 'Debouchage', verified: true },
  { id: '4', author: 'Jean-Paul R.', rating: 5, date: '3 janvier 2026', comment: 'Tres satisfait de l\'installation complete de ma salle de bain. Equipe competente et a l\'ecoute.', service: 'Installation sanitaire', hasPhoto: true, verified: true },
  { id: '5', author: 'Isabelle C.', rating: 4, date: '28 decembre 2025', comment: 'Intervention pour une recherche de fuite. Probleme trouve et repare rapidement.', service: 'Recherche de fuite', verified: false },
]

const SIMILAR_ARTISANS = [
  { id: 'demo-7', name: 'Yohan LEROY', specialty: 'Plombier', rating: 4.4, reviews: 92, city: 'Pantin', hourly_rate: 52 },
  { id: 'demo-4', name: 'Serrurier Express 93', specialty: 'Serrurier', rating: 4.3, reviews: 67, city: 'Le Pre-Saint-Gervais', hourly_rate: 60 },
  { id: 'demo-8', name: 'Pierre ROUX', specialty: 'Electricien', rating: 4.6, reviews: 134, city: 'Pantin', hourly_rate: 55 },
]

export default function ArtisanPage() {
  const params = useParams()
  const router = useRouter()
  const artisanId = params.id as string

  const [artisan, setArtisan] = useState<Artisan | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [availability, setAvailability] = useState<DayAvailability[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [calendarOffset, setCalendarOffset] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [activeTab, setActiveTab] = useState<'infos' | 'tarifs' | 'photos' | 'avis'>('infos')
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [showAllPrices, setShowAllPrices] = useState(false)
  const [dataSource, setDataSource] = useState<'api' | 'demo'>('demo')

  useEffect(() => {
    loadArtisan()
    loadAvailability()
  }, [artisanId])

  const loadArtisan = async () => {
    setIsLoading(true)

    try {
      // Essayer de charger depuis l'API avec cache-busting
      const response = await fetch(`/api/artisans/${artisanId}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.artisan) {
          setArtisan(data.artisan)
          setReviews(data.reviews || [])
          setDataSource('api')
          setIsLoading(false)
          return
        }
      }
    } catch (error) {
      console.error('Error loading artisan from API:', error)
    }

    // Fallback vers les donnees demo
    const demoArtisan = DEMO_ARTISANS[artisanId]
    if (demoArtisan) {
      setArtisan(demoArtisan)
      setReviews(DEMO_REVIEWS)
      setDataSource('demo')
    }
    setIsLoading(false)
  }

  const loadAvailability = async (startDate?: Date) => {
    try {
      const params = new URLSearchParams({
        artisanIds: artisanId,
        days: '7',
      })
      if (startDate) {
        params.set('startDate', startDate.toISOString().split('T')[0])
      }

      const response = await fetch(`/api/availability/slots?${params}`)
      if (response.ok) {
        const data = await response.json()
        if (data.availability[artisanId]) {
          setAvailability(data.availability[artisanId])
        }
      }
    } catch (error) {
      console.error('Failed to load availability:', error)
    }
  }

  const loadMoreDays = async (direction: 'prev' | 'next') => {
    const newOffset = direction === 'next' ? calendarOffset + 7 : calendarOffset - 7
    if (newOffset < 0) return

    const startDate = new Date()
    startDate.setDate(startDate.getDate() + newOffset)

    await loadAvailability(startDate)
    setCalendarOffset(newOffset)
  }

  const handleSlotSelect = (date: string, time: string) => {
    setSelectedDate(date)
    setSelectedTime(time)
  }

  const handleBooking = () => {
    if (selectedDate && selectedTime) {
      router.push(`/booking?artisanId=${artisanId}&date=${selectedDate}&time=${selectedTime}`)
    }
  }

  const displayName = artisan?.is_center
    ? artisan.business_name
    : artisan?.business_name || `${artisan?.first_name || ''} ${artisan?.last_name || ''}`.trim()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  if (!artisan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Artisan non trouve</h1>
          <p className="text-gray-600 mb-6">Cet artisan n'existe pas ou n'est plus disponible.</p>
          <Link href="/recherche" className="text-blue-600 hover:underline">
            Retour a la recherche
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:pb-0">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3">
          {/* Breadcrumbs */}
          <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/" className="hover:text-blue-600">Accueil</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/recherche" className="hover:text-blue-600">Recherche</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900">{displayName}</span>
          </div>
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 sm:hidden"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="ml-1">Retour</span>
            </button>
            <div className="hidden sm:block" />
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-2 rounded-full border ${isFavorite ? 'text-red-500 border-red-200 bg-red-50' : 'text-gray-400 border-gray-200 hover:text-gray-600'}`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full border border-gray-200">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0 mx-auto sm:mx-0">
                  {artisan.avatar_url ? (
                    <img
                      src={artisan.avatar_url}
                      alt={displayName || 'Artisan'}
                      className="w-28 h-28 rounded-xl object-cover"
                    />
                  ) : artisan.is_center ? (
                    <div className="w-28 h-28 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <Wrench className="w-14 h-14 text-white" />
                    </div>
                  ) : (
                    <div className="w-28 h-28 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-4xl font-bold">
                      {displayName?.charAt(0) || 'A'}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
                      <p className="text-lg text-blue-600 font-medium">{artisan.specialty}</p>
                    </div>
                    {artisan.emergency_available && (
                      <span className="inline-flex items-center gap-1 text-sm text-orange-700 bg-orange-100 px-3 py-1 rounded-full self-center sm:self-start">
                        <Zap className="w-4 h-4" />
                        Urgences 24/7
                      </span>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(artisan.average_rating)
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-semibold">{artisan.average_rating.toFixed(1)}</span>
                    <span className="text-gray-500">({artisan.review_count} avis{artisan.review_count > 0 ? ' verifies' : ''})</span>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
                    {artisan.is_verified && (
                      <span className="inline-flex items-center gap-1 text-sm text-green-700 bg-green-50 px-3 py-1 rounded-full">
                        <BadgeCheck className="w-4 h-4" />
                        Identite verifiee
                      </span>
                    )}
                    {artisan.is_premium && (
                      <span className="inline-flex items-center gap-1 text-sm text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
                        <Award className="w-4 h-4" />
                        Premium
                      </span>
                    )}
                    {artisan.is_center && artisan.team_size && (
                      <span className="inline-flex items-center gap-1 text-sm text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                        <Users className="w-4 h-4" />
                        {artisan.team_size} professionnels
                      </span>
                    )}
                    {dataSource === 'api' && (
                      <span className="inline-flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                        Donnees verifiees
                      </span>
                    )}
                  </div>

                  {/* Trust Signals */}
                  <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-4 text-sm text-gray-600">
                    {artisan.response_rate && (
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4 text-green-500" />
                        {artisan.response_rate}% de reponse
                      </span>
                    )}
                    {artisan.bookings_this_week && artisan.bookings_this_week > 0 && (
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-blue-500" />
                        {artisan.bookings_this_week} reservations cette semaine
                      </span>
                    )}
                    {artisan.member_since && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        Membre depuis {artisan.member_since}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t">
                {artisan.hourly_rate && (
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <Euro className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">Tarif horaire</p>
                    <p className="font-bold text-lg">{artisan.hourly_rate}€/h</p>
                  </div>
                )}
                {artisan.experience_years && (
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <Award className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">Experience</p>
                    <p className="font-bold text-lg">{artisan.experience_years} ans</p>
                  </div>
                )}
                {artisan.response_time && (
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <Timer className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">Reponse</p>
                    <p className="font-bold text-lg">{artisan.response_time}</p>
                  </div>
                )}
                {artisan.intervention_zone && (
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <Navigation className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">Zone</p>
                    <p className="font-bold text-lg">{artisan.intervention_zone}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="flex border-b overflow-x-auto">
                {[
                  { id: 'infos', label: 'Informations' },
                  { id: 'tarifs', label: 'Tarifs' },
                  { id: 'photos', label: `Photos${artisan.portfolio && artisan.portfolio.length > 0 ? ` (${artisan.portfolio.length})` : ''}` },
                  { id: 'avis', label: `Avis (${artisan.review_count})` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`flex-shrink-0 px-6 py-4 text-center font-medium transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {/* Infos Tab */}
                {activeTab === 'infos' && (
                  <div className="space-y-8">
                    {/* Description */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Presentation</h3>
                      <p className="text-gray-600 leading-relaxed">{artisan.description || 'Artisan qualifie a votre service.'}</p>
                    </div>

                    {/* Informations entreprise (Pappers) */}
                    {(artisan.siret || artisan.legal_form || artisan.creation_date) && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Building2 className="w-5 h-5 text-blue-600" />
                          Informations entreprise
                        </h3>
                        <div className="bg-blue-50 rounded-xl p-4 space-y-2">
                          {artisan.siret && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">SIRET</span>
                              <span className="font-mono text-gray-900">{artisan.siret}</span>
                            </div>
                          )}
                          {artisan.legal_form && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Forme juridique</span>
                              <span className="text-gray-900">{artisan.legal_form}</span>
                            </div>
                          )}
                          {artisan.creation_date && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Date de creation</span>
                              <span className="text-gray-900">
                                {new Date(artisan.creation_date).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                          )}
                          {artisan.employee_count && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Effectif</span>
                              <span className="text-gray-900">{artisan.employee_count} employe(s)</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Services */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Services proposes</h3>
                      <div className="flex flex-wrap gap-2">
                        {artisan.services.map((service, index) => (
                          <span
                            key={index}
                            className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Certifications & Insurance */}
                    <div className="grid sm:grid-cols-2 gap-6">
                      {artisan.certifications && artisan.certifications.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Certifications</h3>
                          <div className="space-y-2">
                            {artisan.certifications.map((cert, index) => (
                              <div key={index} className="flex items-center gap-2 text-green-700">
                                <CheckCircle className="w-5 h-5" />
                                <span>{cert}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {artisan.insurance && artisan.insurance.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Assurances & Garanties</h3>
                          <div className="space-y-2">
                            {artisan.insurance.map((ins, index) => (
                              <div key={index} className="flex items-center gap-2 text-blue-700">
                                <Shield className="w-5 h-5" />
                                <span>{ins}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Payment Methods */}
                    {artisan.payment_methods && artisan.payment_methods.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Moyens de paiement acceptes</h3>
                        <div className="flex flex-wrap gap-3">
                          {artisan.payment_methods.map((method, index) => (
                            <span key={index} className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm">
                              {method === 'Carte bancaire' && <CreditCard className="w-4 h-4" />}
                              {method === 'Especes' && <Banknote className="w-4 h-4" />}
                              {method === 'Cheque' && <FileText className="w-4 h-4" />}
                              {method === 'Virement' && <ExternalLink className="w-4 h-4" />}
                              {method === 'Cheque energie' && <Zap className="w-4 h-4" />}
                              {method}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Contact */}
                    {(artisan.phone || artisan.email || artisan.website) && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact</h3>
                        <div className="space-y-2">
                          {artisan.phone && (
                            <a href={`tel:${artisan.phone}`} className="flex items-center gap-3 text-gray-600 hover:text-blue-600">
                              <Phone className="w-5 h-5" />
                              <span>{artisan.phone}</span>
                            </a>
                          )}
                          {artisan.email && (
                            <a href={`mailto:${artisan.email}`} className="flex items-center gap-3 text-gray-600 hover:text-blue-600">
                              <Mail className="w-5 h-5" />
                              <span>{artisan.email}</span>
                            </a>
                          )}
                          {artisan.website && (
                            <a href={artisan.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-600 hover:text-blue-600">
                              <Globe className="w-5 h-5" />
                              <span>{artisan.website}</span>
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Location */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Zone d'intervention</h3>
                      <div className="bg-gray-100 rounded-xl p-4">
                        <div className="flex items-start gap-3 mb-4">
                          <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-gray-900">{artisan.address}</p>
                            <p className="text-gray-600">{artisan.postal_code} {artisan.city}</p>
                          </div>
                        </div>
                        <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <Navigation className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                            <p className="text-blue-700 font-medium">Rayon d'intervention : {artisan.intervention_zone}</p>
                            <p className="text-blue-600 text-sm">Carte interactive bientot disponible</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* FAQ */}
                    {artisan.faq && artisan.faq.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Questions frequentes</h3>
                        <div className="space-y-2">
                          {artisan.faq.map((item, index) => (
                            <div key={index} className="border rounded-lg overflow-hidden">
                              <button
                                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                              >
                                <span className="font-medium text-gray-900">{item.question}</span>
                                {expandedFaq === index ? (
                                  <ChevronUp className="w-5 h-5 text-gray-400" />
                                ) : (
                                  <ChevronDown className="w-5 h-5 text-gray-400" />
                                )}
                              </button>
                              {expandedFaq === index && (
                                <div className="px-4 pb-4 text-gray-600">{item.answer}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Languages */}
                    {artisan.languages && artisan.languages.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Langues parlees</h3>
                        <p className="text-gray-600">{artisan.languages.join(', ')}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Tarifs Tab */}
                {activeTab === 'tarifs' && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <p className="text-blue-800 text-sm">
                        <strong>Devis gratuit :</strong> Les prix indiques sont donnes a titre indicatif. Chaque situation etant unique, un devis personnalise vous sera propose apres etude de votre demande.
                      </p>
                    </div>

                    {artisan.service_prices.length > 0 ? (
                      <div className="divide-y">
                        {artisan.service_prices.slice(0, showAllPrices ? undefined : 4).map((service, index) => (
                          <div key={index} className="py-4 flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{service.name}</h4>
                              <p className="text-sm text-gray-500">{service.description}</p>
                              {service.duration && (
                                <p className="text-sm text-gray-400 mt-1">
                                  <Clock className="w-4 h-4 inline mr-1" />
                                  Duree estimee : {service.duration}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <span className="text-lg font-bold text-blue-600">{service.price}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>Tarifs disponibles sur demande de devis</p>
                      </div>
                    )}

                    {artisan.service_prices.length > 4 && (
                      <button
                        onClick={() => setShowAllPrices(!showAllPrices)}
                        className="w-full py-3 text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-2"
                      >
                        {showAllPrices ? (
                          <>Voir moins <ChevronUp className="w-5 h-5" /></>
                        ) : (
                          <>Voir tous les tarifs ({artisan.service_prices.length}) <ChevronDown className="w-5 h-5" /></>
                        )}
                      </button>
                    )}

                    <div className="bg-gray-50 rounded-xl p-6 text-center">
                      <h4 className="font-semibold text-gray-900 mb-2">Besoin d'un devis personnalise ?</h4>
                      <p className="text-gray-600 text-sm mb-4">Decrivez votre projet et recevez un devis detaille sous 24h</p>
                      <Link
                        href={`/devis?artisan=${artisanId}`}
                        className="inline-block px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                      >
                        Demander un devis gratuit
                      </Link>
                    </div>
                  </div>
                )}

                {/* Photos Tab */}
                {activeTab === 'photos' && (
                  <div>
                    {artisan.portfolio && artisan.portfolio.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {artisan.portfolio.map((item) => (
                          <div
                            key={item.id}
                            className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity relative group"
                          >
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Camera className="w-10 h-10 text-gray-400" />
                              </div>
                            )}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                              <p className="text-white text-sm font-medium truncate">{item.title}</p>
                              <p className="text-white/80 text-xs">{item.category}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Aucune photo disponible pour le moment</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Avis Tab */}
                {activeTab === 'avis' && (
                  <div className="space-y-6">
                    {/* Rating Summary */}
                    <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                      <div className="text-center">
                        <div className="text-5xl font-bold text-gray-900">{artisan.average_rating.toFixed(1)}</div>
                        <div className="flex items-center justify-center mt-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${
                                i < Math.floor(artisan.average_rating)
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">{artisan.review_count} avis</div>
                      </div>
                      <div className="flex-1 space-y-2 w-full sm:w-auto">
                        {[5, 4, 3, 2, 1].map((stars) => {
                          const percentage = stars === 5 ? 68 : stars === 4 ? 22 : stars === 3 ? 7 : stars === 2 ? 2 : 1
                          return (
                            <div key={stars} className="flex items-center gap-2">
                              <span className="text-sm text-gray-500 w-3">{stars}</span>
                              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                              <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${percentage}%` }} />
                              </div>
                              <span className="text-sm text-gray-500 w-10">{percentage}%</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Reviews List */}
                    {reviews.length > 0 ? (
                      <div className="space-y-4">
                        {reviews.map((review) => (
                          <div key={review.id} className="border rounded-xl p-5">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                  {review.author.charAt(0)}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-semibold text-gray-900">{review.author}</p>
                                    {review.verified && (
                                      <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                        <CheckCircle className="w-3 h-3" />
                                        Verifie
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-500">{review.date}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <span className="inline-block text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-3">
                              {review.service}
                            </span>
                            <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                            {review.hasPhoto && (
                              <div className="mt-3 flex gap-2">
                                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                                  <Camera className="w-6 h-6 text-gray-400" />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Aucun avis pour le moment</p>
                      </div>
                    )}

                    {artisan.review_count > reviews.length && (
                      <button className="w-full py-3 text-blue-600 hover:text-blue-700 font-medium border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                        Voir tous les {artisan.review_count} avis
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Similar Artisans */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Artisans similaires</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                {SIMILAR_ARTISANS.map((similar) => (
                  <Link
                    key={similar.id}
                    href={`/services/artisan/${similar.id}`}
                    className="block p-4 border rounded-xl hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white font-bold">
                        {similar.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 line-clamp-1">{similar.name}</p>
                        <p className="text-sm text-gray-500">{similar.specialty}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="font-medium">{similar.rating}</span>
                        <span className="text-gray-400">({similar.reviews})</span>
                      </div>
                      <span className="text-blue-600 font-medium">{similar.hourly_rate}€/h</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{similar.city}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Booking */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-20">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Prendre rendez-vous</h3>

              {artisan.accepts_new_clients === false ? (
                <div className="text-center py-6">
                  <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">Cet artisan n'accepte pas de nouveaux clients pour le moment.</p>
                  <button className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                    Etre notifie des disponibilites
                  </button>
                </div>
              ) : availability.length === 0 || !availability.some(day => day.slots.length > 0) ? (
                /* Pas de calendrier si aucune disponibilite configuree */
                <div className="text-center py-6">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 mb-2 font-medium">Calendrier non configure</p>
                  <p className="text-gray-500 text-sm mb-4">Cet artisan n'a pas encore configure ses disponibilites en ligne.</p>

                  {/* Contact Alternative */}
                  <div className="space-y-2">
                    {artisan.phone ? (
                      <a
                        href={`tel:${artisan.phone}`}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                      >
                        <Phone className="w-5 h-5" />
                        Appeler pour RDV
                      </a>
                    ) : (
                      <Link
                        href={`/devis?artisan=${artisanId}`}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                      >
                        <FileText className="w-5 h-5" />
                        Demander un devis
                      </Link>
                    )}
                    <button className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      Envoyer un message
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Calendar Navigation */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => loadMoreDays('prev')}
                      disabled={calendarOffset === 0}
                      className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="font-medium text-gray-700">
                      {availability[0]?.month} {new Date().getFullYear()}
                    </span>
                    <button onClick={() => loadMoreDays('next')} className="p-2 hover:bg-gray-100 rounded-lg">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1 mb-4">
                    {availability.slice(0, 7).map((day, index) => {
                      const hasSlots = day.slots.length > 0
                      const isSelected = selectedDate === day.date

                      return (
                        <button
                          key={index}
                          onClick={() => hasSlots && setSelectedDate(day.date)}
                          disabled={!hasSlots}
                          className={`py-2 rounded-lg text-center transition-all ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-lg scale-105'
                              : hasSlots
                              ? 'hover:bg-blue-50 text-gray-700 border border-transparent hover:border-blue-200'
                              : 'text-gray-300 cursor-not-allowed'
                          }`}
                        >
                          <div className="text-xs">{day.dayName.slice(0, 3)}</div>
                          <div className="font-semibold">{day.dayNumber}</div>
                          {hasSlots && !isSelected && (
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mx-auto mt-1" />
                          )}
                        </button>
                      )
                    })}
                  </div>

                  {/* Time Slots */}
                  {selectedDate && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Creneaux disponibles</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {availability
                          .find((d) => d.date === selectedDate)
                          ?.slots.map((slot, index) => (
                            <button
                              key={index}
                              onClick={() => handleSlotSelect(selectedDate, slot.time)}
                              className={`py-2.5 rounded-lg text-sm font-medium transition-all ${
                                selectedTime === slot.time
                                  ? 'bg-blue-600 text-white shadow-lg'
                                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                              }`}
                            >
                              {slot.time}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Book Button */}
                  <button
                    onClick={handleBooking}
                    disabled={!selectedDate || !selectedTime}
                    className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg shadow-blue-600/30 disabled:shadow-none"
                  >
                    {selectedDate && selectedTime ? 'Confirmer le rendez-vous' : 'Selectionnez un creneau'}
                  </button>

                  {selectedDate && selectedTime && (
                    <p className="text-center text-sm text-gray-500 mt-2">
                      {new Date(selectedDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} a {selectedTime}
                    </p>
                  )}

                  {/* Contact Alternative */}
                  <div className="mt-6 pt-6 border-t">
                    <p className="text-sm text-gray-500 text-center mb-3">Ou contactez directement</p>
                    <div className="space-y-2">
                      {artisan.phone ? (
                        <a
                          href={`tel:${artisan.phone}`}
                          className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Phone className="w-4 h-4" />
                          Appeler
                        </a>
                      ) : (
                        <button className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                          <Phone className="w-4 h-4" />
                          Appeler
                        </button>
                      )}
                      <button className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        Envoyer un message
                      </button>
                    </div>
                  </div>

                  {/* Guarantee */}
                  <div className="mt-6 pt-6 border-t">
                    <div className="flex items-start gap-3 text-sm text-gray-600">
                      <Shield className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <p>
                        <strong className="text-gray-900">Reservation securisee</strong><br />
                        Annulation gratuite jusqu'a 24h avant le rendez-vous
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 lg:hidden z-50">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-sm text-gray-500">A partir de</p>
            <p className="text-xl font-bold text-gray-900">
              {artisan.hourly_rate ? `${artisan.hourly_rate}€` : 'Sur devis'}
              {artisan.hourly_rate && <span className="text-sm font-normal text-gray-500">/h</span>}
            </p>
          </div>
          <button
            onClick={() => document.querySelector('.lg\\:col-span-1')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex-1 py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg"
          >
            Reserver
          </button>
        </div>
      </div>
    </div>
  )
}
