'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Star,
  MapPin,
  Clock,
  ShieldCheck,
  Heart,
  Calendar,
  MessageCircle,
  ChevronRight,
  Zap,
  Award,
  ThumbsUp,
} from 'lucide-react'
import { getArtisanUrl } from '@/lib/utils'
import { BLUR_PLACEHOLDER } from '@/lib/data/images'
import { trackEvent } from '@/lib/analytics/tracking'

interface ArtisanProfileCardProps {
  id: string
  stableId?: string
  slug: string
  name: string
  companyName?: string
  profession: string
  location: string
  locationSlug: string
  rating: number
  reviewCount: number
  imageUrl?: string
  coverUrl?: string
  isVerified?: boolean
  isPremium?: boolean
  isAvailableNow?: boolean
  isAvailableToday?: boolean
  nextSlot?: string
  responseTime?: string
  yearsExperience?: number
  completedJobs?: number
  specialties?: string[]
  phone?: string
  priceRange?: string
  badges?: string[]
  variant?: 'card' | 'list' | 'featured' | 'mini'
}

export function ArtisanProfileCard({
  id,
  stableId,
  slug,
  name,
  companyName,
  profession,
  location,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  locationSlug: _locationSlug,
  rating,
  reviewCount,
  imageUrl,
  coverUrl,
  isVerified = false,
  isPremium = false,
  isAvailableNow = false,
  isAvailableToday = false,
  nextSlot,
  responseTime,
  yearsExperience,
  completedJobs,
  specialties = [],
  priceRange,
  badges = [],
  variant = 'card',
}: ArtisanProfileCardProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [imageError, setImageError] = useState(false)

  const href = getArtisanUrl({ stable_id: stableId || id, slug, specialty: profession, city: location })

  // Variant: Featured (homepage, large)
  if (variant === 'featured') {
    return (
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="group relative bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500"
      >
        {/* Cover Image */}
        <div className="relative h-48 bg-gradient-to-br from-primary-400 to-primary-600">
          {coverUrl && !imageError && (
            <Image
              src={coverUrl}
              alt={`Photo de couverture de ${companyName || name} - ${profession} a ${location}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              onError={() => setImageError(true)}
              placeholder="blur"
              blurDataURL={BLUR_PLACEHOLDER}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Premium Badge */}
          {isPremium && (
            <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
              <Award className="w-3.5 h-3.5" />
              Premium
            </div>
          )}

          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.preventDefault()
              setIsFavorite(!isFavorite)
            }}
            className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                isFavorite ? 'text-red-500 fill-red-500' : 'text-charcoal-600'
              }`}
            />
          </button>

          {/* Profile Image */}
          <div className="absolute -bottom-12 left-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-white">
                {imageUrl && !imageError ? (
                  <Image
                    src={imageUrl}
                    alt={`${name} - ${profession} a ${location}`}
                    fill
                    className="object-cover"
                    sizes="96px"
                    onError={() => setImageError(true)}
                    placeholder="blur"
                    blurDataURL={BLUR_PLACEHOLDER}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">{name.charAt(0)}</span>
                  </div>
                )}
              </div>
              {isVerified && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-accent-500 rounded-full flex items-center justify-center border-2 border-white">
                  <ShieldCheck className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          </div>

          {/* Availability */}
          <div className="absolute bottom-4 right-4">
            {isAvailableNow ? (
              <div className="bg-accent-500 text-white text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                Disponible maintenant
              </div>
            ) : isAvailableToday ? (
              <div className="bg-primary-400 text-white text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                <Clock className="w-3 h-3" />
                Dispo aujourd'hui
              </div>
            ) : nextSlot ? (
              <div className="bg-white/90 backdrop-blur-sm text-charcoal-700 text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                <Calendar className="w-3 h-3" />
                {nextSlot}
              </div>
            ) : null}
          </div>
        </div>

        {/* Content */}
        <Link href={href} className="block p-6 pt-16" onClick={() => trackEvent('artisan_listing_click', { artisanId: stableId || id, artisanName: name, source: 'card_featured' })}>
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-xl font-bold text-charcoal-900 font-heading group-hover:text-primary-400 transition-colors">
                {companyName || name}
              </h3>
              <p className="text-charcoal-600">{profession}</p>
            </div>
            {rating !== null && rating > 0 && (
              <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <span className="font-bold text-charcoal-900">{rating.toFixed(1)}</span>
                <span className="text-charcoal-500 text-sm">({reviewCount})</span>
              </div>
            )}
          </div>

          {/* Location & Response */}
          <div className="flex items-center gap-4 text-sm text-charcoal-500 mb-4">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {location}
            </div>
            {responseTime && (
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                Repond en {responseTime}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mb-4">
            {yearsExperience && (
              <div className="text-center">
                <div className="text-lg font-bold text-charcoal-900">{yearsExperience}+</div>
                <div className="text-xs text-charcoal-500">ans d'exp.</div>
              </div>
            )}
            {completedJobs && (
              <div className="text-center">
                <div className="text-lg font-bold text-charcoal-900">{completedJobs}+</div>
                <div className="text-xs text-charcoal-500">missions</div>
              </div>
            )}
          </div>

          {/* Specialties */}
          {specialties.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {specialties.slice(0, 3).map((spec, i) => (
                <span
                  key={i}
                  className="text-xs bg-sand-100 text-charcoal-600 px-2.5 py-1 rounded-full border border-sand-200"
                >
                  {spec}
                </span>
              ))}
              {specialties.length > 3 && (
                <span className="text-xs text-charcoal-500">+{specialties.length - 3}</span>
              )}
            </div>
          )}

          {/* Badges */}
          {(isVerified || badges.length > 0) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {isVerified && (
                <div className="flex items-center gap-1 text-xs text-accent-700 bg-accent-50 px-2 py-1 rounded-full border border-accent-200">
                  <ShieldCheck className="w-3 h-3" />
                  Identite verifiee
                </div>
              )}
              {badges.slice(0, 2).map((badge, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1 text-xs text-primary-700 bg-primary-50 px-2 py-1 rounded-full border border-primary-200"
                >
                  <ThumbsUp className="w-3 h-3" />
                  {badge}
                </div>
              ))}
            </div>
          )}

          {/* CTA Buttons */}
          <div className="flex gap-3 mt-6">
            <Link
              href={`${href}#reserver`}
              className="flex-1 flex items-center justify-center gap-2 bg-primary-400 hover:bg-primary-600 text-white py-3 rounded-xl font-semibold transition-colors shadow-cta"
            >
              <Calendar className="w-4 h-4" />
              Reserver
            </Link>
          </div>
        </Link>
      </motion.article>
    )
  }

  // Variant: List (search results)
  if (variant === 'list') {
    return (
      <motion.article
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="group bg-white rounded-2xl border border-sand-200 overflow-hidden hover:shadow-card-hover hover:border-primary-200 transition-all duration-300"
      >
        <Link href={href} className="flex flex-col sm:flex-row" onClick={() => trackEvent('artisan_listing_click', { artisanId: stableId || id, artisanName: name, source: 'card_list' })}>
          {/* Image */}
          <div className="relative w-full sm:w-56 h-48 sm:h-auto flex-shrink-0">
            {imageUrl && !imageError ? (
              <Image
                src={imageUrl}
                alt={`${name} - ${profession} a ${location}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 100vw, 224px"
                onError={() => setImageError(true)}
                placeholder="blur"
                blurDataURL={BLUR_PLACEHOLDER}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                <span className="text-5xl font-bold text-white/90">{name.charAt(0)}</span>
              </div>
            )}

            {/* Badges overlay */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {isPremium && (
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                  Premium
                </div>
              )}
              {isAvailableNow && (
                <div className="bg-accent-500 text-white text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg">
                  <Zap className="w-3 h-3" />
                  Dispo
                </div>
              )}
            </div>

            {/* Favorite */}
            <button
              onClick={(e) => {
                e.preventDefault()
                setIsFavorite(!isFavorite)
              }}
              className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
            >
              <Heart
                className={`w-4 h-4 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-charcoal-600'}`}
              />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-5">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-charcoal-900 group-hover:text-primary-400 transition-colors">
                    {companyName || name}
                  </h3>
                  {isVerified && <ShieldCheck className="w-5 h-5 text-accent-500" />}
                </div>
                <p className="text-charcoal-600">{profession}</p>
              </div>
              {rating !== null && rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <span className="font-bold">{rating.toFixed(1)}</span>
                  <span className="text-charcoal-500 text-sm">({reviewCount})</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-charcoal-500 mb-3">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {location}
              </span>
              {responseTime && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {responseTime}
                </span>
              )}
              {priceRange && <span>{priceRange}</span>}
            </div>

            {specialties.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {specialties.slice(0, 4).map((spec, i) => (
                  <span key={i} className="text-xs bg-sand-100 text-charcoal-600 px-2 py-0.5 rounded border border-sand-200">
                    {spec}
                  </span>
                ))}
              </div>
            )}

            {/* Quick Stats */}
            <div className="flex items-center gap-4 text-sm">
              {yearsExperience && (
                <span className="text-charcoal-600">
                  <strong>{yearsExperience}</strong> ans d'exp.
                </span>
              )}
              {completedJobs && (
                <span className="text-charcoal-600">
                  <strong>{completedJobs}</strong> missions
                </span>
              )}
            </div>

            {/* Mobile CTAs */}
            <div className="flex gap-2 mt-4 sm:hidden">
              <span className="flex-1 flex items-center justify-center gap-1 bg-primary-400 text-white py-2.5 rounded-lg font-medium text-sm shadow-cta">
                <Calendar className="w-4 h-4" />
                Reserver
              </span>
            </div>
          </div>

          {/* Desktop CTA */}
          <div className="hidden sm:flex items-center pr-5">
            <ChevronRight className="w-6 h-6 text-charcoal-400 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>
      </motion.article>
    )
  }

  // Variant: Mini (suggestions, related)
  if (variant === 'mini') {
    return (
      <Link
        href={href}
        className="flex items-center gap-3 p-3 bg-white rounded-xl border border-sand-200 hover:border-primary-200 hover:shadow-soft transition-all group"
      >
        <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
          {imageUrl && !imageError ? (
            <Image
              src={imageUrl}
              alt={`${name} - ${profession} a ${location}`}
              fill
              className="object-cover"
              sizes="48px"
              onError={() => setImageError(true)}
              placeholder="blur"
              blurDataURL={BLUR_PLACEHOLDER}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
              <span className="font-bold text-white">{name.charAt(0)}</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <h4 className="font-semibold text-charcoal-900 truncate group-hover:text-primary-400 transition-colors">
              {name}
            </h4>
            {isVerified && <ShieldCheck className="w-4 h-4 text-accent-500 flex-shrink-0" />}
          </div>
          <p className="text-sm text-charcoal-500 truncate">{profession} - {location}</p>
        </div>
        {rating !== null && rating > 0 && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="font-semibold text-sm">{rating.toFixed(1)}</span>
          </div>
        )}
      </Link>
    )
  }

  // Default: Card (grid)
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group"
    >
      <Link href={href} className="block" onClick={() => trackEvent('artisan_listing_click', { artisanId: stableId || id, artisanName: name, source: 'card' })}>
        {/* Image */}
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-3">
          {imageUrl && !imageError ? (
            <Image
              src={imageUrl}
              alt={`${name} - ${profession} a ${location}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              onError={() => setImageError(true)}
              placeholder="blur"
              blurDataURL={BLUR_PLACEHOLDER}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 flex items-center justify-center">
              <span className="text-5xl font-bold text-white/90">{name.charAt(0)}</span>
            </div>
          )}

          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          {isPremium && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
              Premium
            </div>
          )}

          <button
            onClick={(e) => {
              e.preventDefault()
              setIsFavorite(!isFavorite)
            }}
            className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          >
            <Heart
              className={`w-4 h-4 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-charcoal-600'}`}
            />
          </button>

          {isAvailableNow ? (
            <div className="absolute bottom-3 left-3 bg-accent-500 text-white text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              Disponible
            </div>
          ) : nextSlot ? (
            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-charcoal-700 text-xs font-medium px-2.5 py-1 rounded-full shadow-lg">
              <Calendar className="w-3 h-3 inline mr-1" />
              {nextSlot}
            </div>
          ) : null}
        </div>

        {/* Content */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-charcoal-900 group-hover:text-primary-400 transition-colors">
                {name}
              </h3>
              {isVerified && <ShieldCheck className="w-4 h-4 text-accent-500" />}
            </div>
            {rating !== null && rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="font-semibold text-sm">{rating.toFixed(1)}</span>
                <span className="text-charcoal-500 text-sm">({reviewCount})</span>
              </div>
            )}
          </div>
          <p className="text-charcoal-600 text-sm">{profession}</p>
          <p className="text-charcoal-500 text-sm flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {location}
          </p>
        </div>
      </Link>
    </motion.article>
  )
}
