'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import {
  Shield,
  Copy,
  Check,
  Code,
  Globe,
  ExternalLink,
  ChevronDown,
  Search,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react'
import { SITE_URL } from '@/lib/seo/config'

interface BadgeClientProps {
  faqItems: { question: string; answer: string }[]
}

interface ProviderResult {
  name: string
  slug: string
  stable_id: string | null
  specialty: string | null
  city: string | null
  is_verified: boolean
  rating: number | null
  reviews: number | null
}

export default function BadgeClient({ faqItems }: BadgeClientProps) {
  // Manual mode state
  const [name, setName] = useState('')
  const [service, setService] = useState('')
  const [style, setStyle] = useState<'light' | 'dark' | 'minimal'>('light')
  const [copied, setCopied] = useState(false)

  // Search mode state
  const [mode, setMode] = useState<'search' | 'manual'>('search')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<ProviderResult[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<ProviderResult | null>(null)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSearchResults([])
      return
    }
    setSearching(true)
    try {
      const res = await fetch(`/api/badge/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setSearchResults(data.results || [])
      setShowResults(true)
    } catch {
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }, [])

  const handleSearchInput = (value: string) => {
    setSearchQuery(value)
    setSelectedProvider(null)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(value), 300)
  }

  const selectProvider = (p: ProviderResult) => {
    setSelectedProvider(p)
    setSearchQuery(p.name)
    setShowResults(false)
  }

  // Build badge URL and embed code
  const isVerifiedBadge = mode === 'search' && selectedProvider
  const displayName = isVerifiedBadge ? selectedProvider.name : name || 'Mon Entreprise'
  const displayService = isVerifiedBadge
    ? selectedProvider.specialty || 'Artisan'
    : service || 'Artisan'

  let badgeUrl: string
  let linkUrl: string

  if (isVerifiedBadge) {
    const param = selectedProvider.slug
      ? `slug=${encodeURIComponent(selectedProvider.slug)}`
      : `id=${encodeURIComponent(selectedProvider.stable_id || '')}`
    badgeUrl = `${SITE_URL}/api/badge/verified?${param}&style=${style}`

    // Build link to artisan page
    const serviceSlug = (selectedProvider.specialty || 'artisan')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
    const citySlug = (selectedProvider.city || 'france')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
    const publicId = selectedProvider.slug || selectedProvider.stable_id || ''
    linkUrl = `${SITE_URL}/services/${serviceSlug}/${citySlug}/${publicId}`
  } else {
    const badgeParams = new URLSearchParams({
      name: displayName,
      service: displayService,
      style,
    })
    badgeUrl = `${SITE_URL}/api/badge?${badgeParams.toString()}`
    const serviceSlug = service
      ? service
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
      : 'artisan'
    linkUrl = `${SITE_URL}/services/${serviceSlug}`
  }

  const badgeW =
    style === 'minimal' ? (isVerifiedBadge ? '220' : '200') : isVerifiedBadge ? '320' : '300'
  const badgeH =
    style === 'minimal' ? (isVerifiedBadge ? '54' : '50') : isVerifiedBadge ? '110' : '100'

  const embedCode = `<a href="${linkUrl}" target="_blank" rel="noopener" title="${displayName} — Artisan sur ServicesArtisans.fr">
  <img src="${badgeUrl}"
       alt="${displayName} — Artisan ${isVerifiedBadge && selectedProvider.is_verified ? 'Vérifié' : 'Référencé'} sur ServicesArtisans"
       width="${badgeW}" height="${badgeH}" loading="lazy" />
</a>`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = embedCode
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  // Preview URL (relative for same-origin)
  const previewBadgeUrl = isVerifiedBadge
    ? `/api/badge/verified?${selectedProvider.slug ? `slug=${encodeURIComponent(selectedProvider.slug)}` : `id=${encodeURIComponent(selectedProvider.stable_id || '')}`}&style=${style}`
    : `/api/badge?${new URLSearchParams({ name: displayName, service: displayService, style }).toString()}`

  return (
    <>
      {/* Mode selector */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tabs */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex bg-sand-100 rounded-xl p-1">
              <button
                onClick={() => setMode('search')}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === 'search' ? 'bg-white text-charcoal-900 shadow-soft' : 'text-charcoal-500 hover:text-charcoal-700'}`}
              >
                <Search className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
                Trouver ma fiche
              </button>
              <button
                onClick={() => setMode('manual')}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === 'manual' ? 'bg-white text-charcoal-900 shadow-soft' : 'text-charcoal-500 hover:text-charcoal-700'}`}
              >
                <Code className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
                Badge personnalisé
              </button>
            </div>
          </div>

          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-2 text-center">
            {mode === 'search' ? 'Trouvez votre fiche artisan' : 'Configurez votre badge'}
          </h2>
          <p className="text-charcoal-500 text-sm text-center mb-10">
            {mode === 'search'
              ? 'Recherchez votre entreprise pour générer un badge avec vos vraies données (note, avis, vérification).'
              : 'Remplissez les champs ci-dessous et votre badge se met à jour en temps réel.'}
          </p>

          <div className="grid md:grid-cols-2 gap-10">
            {/* Form */}
            <div className="space-y-5">
              {mode === 'search' ? (
                <>
                  <div ref={searchRef} className="relative">
                    <label
                      htmlFor="badge-search"
                      className="block text-sm font-medium text-charcoal-700 mb-1.5"
                    >
                      Nom de votre entreprise
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                      <input
                        id="badge-search"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => handleSearchInput(e.target.value)}
                        onFocus={() => searchResults.length > 0 && setShowResults(true)}
                        placeholder="Ex : Dupont Plomberie, Martin Électricité..."
                        className="w-full pl-10 pr-4 py-2.5 border border-sand-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition-shadow"
                        autoComplete="off"
                      />
                    </div>

                    {/* Search results dropdown */}
                    {showResults && (
                      <div className="absolute z-20 w-full mt-1 bg-white border border-sand-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                        {searching ? (
                          <div className="p-4 text-center text-charcoal-500 text-sm">
                            Recherche...
                          </div>
                        ) : searchResults.length === 0 ? (
                          <div className="p-4 text-center text-charcoal-500 text-sm">
                            Aucun résultat. Essayez un autre nom ou passez en mode « Badge
                            personnalisé ».
                          </div>
                        ) : (
                          searchResults.map((p) => (
                            <button
                              key={p.slug || p.stable_id}
                              onClick={() => selectProvider(p)}
                              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-sand-50 transition-colors border-b border-sand-100 last:border-b-0"
                            >
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${p.is_verified ? 'bg-accent-50' : 'bg-sand-100'}`}
                              >
                                <Shield
                                  className={`w-4 h-4 ${p.is_verified ? 'text-accent-600' : 'text-charcoal-400'}`}
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-sm font-medium text-charcoal-900 truncate">
                                  {p.name}
                                </div>
                                <div className="text-xs text-charcoal-500 truncate">
                                  {[p.specialty, p.city].filter(Boolean).join(' — ')}
                                  {p.rating
                                    ? ` — ${p.rating.toFixed(1)}/5 (${p.reviews} avis)`
                                    : ''}
                                </div>
                              </div>
                              {p.is_verified && (
                                <span className="text-xs font-medium text-accent-700 bg-accent-50 px-2 py-0.5 rounded-full flex-shrink-0">
                                  Vérifié
                                </span>
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {selectedProvider && (
                    <div className="bg-accent-50 border border-accent-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Shield className="w-4 h-4 text-accent-600" />
                        <span className="text-sm font-semibold text-accent-800">
                          {selectedProvider.name}
                        </span>
                      </div>
                      <p className="text-xs text-accent-700">
                        {selectedProvider.is_verified ? 'Artisan vérifié' : 'Artisan référencé'} —{' '}
                        {selectedProvider.specialty || 'Artisan'}{' '}
                        {selectedProvider.city ? `à ${selectedProvider.city}` : ''}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div>
                    <label
                      htmlFor="badge-name"
                      className="block text-sm font-medium text-charcoal-700 mb-1.5"
                    >
                      Nom de votre entreprise
                    </label>
                    <input
                      id="badge-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex : Dupont Plomberie"
                      maxLength={40}
                      className="w-full px-4 py-2.5 border border-sand-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition-shadow"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="badge-service"
                      className="block text-sm font-medium text-charcoal-700 mb-1.5"
                    >
                      Métier / Service
                    </label>
                    <input
                      id="badge-service"
                      type="text"
                      value={service}
                      onChange={(e) => setService(e.target.value)}
                      placeholder="Ex : Plombier"
                      maxLength={40}
                      className="w-full px-4 py-2.5 border border-sand-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition-shadow"
                    />
                  </div>
                </>
              )}

              <div>
                <label
                  htmlFor="badge-style"
                  className="block text-sm font-medium text-charcoal-700 mb-1.5"
                >
                  Style du badge
                </label>
                <select
                  id="badge-style"
                  value={style}
                  onChange={(e) => setStyle(e.target.value as 'light' | 'dark' | 'minimal')}
                  className="w-full px-4 py-2.5 border border-sand-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition-shadow bg-white"
                >
                  <option value="light">Clair</option>
                  <option value="dark">Sombre</option>
                  <option value="minimal">Minimal</option>
                </select>
              </div>
            </div>

            {/* Preview */}
            <div>
              <p className="text-sm font-medium text-charcoal-700 mb-3">Aperçu en direct</p>
              <div
                className={`rounded-xl border p-8 flex items-center justify-center min-h-[160px] ${style === 'dark' ? 'bg-charcoal-800 border-charcoal-700' : 'bg-sand-100 border-sand-200'}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewBadgeUrl}
                  alt={`Badge ${displayName}`}
                  width={parseInt(badgeW)}
                  height={parseInt(badgeH)}
                  className="max-w-full h-auto"
                />
              </div>
              {isVerifiedBadge && (
                <p className="text-xs text-charcoal-500 mt-2 text-center">
                  Données en temps réel depuis votre fiche ServicesArtisans
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Embed Code */}
      <section className="py-16 bg-sand-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-2 text-center">
            Code HTML à copier
          </h2>
          <p className="text-charcoal-500 text-sm text-center mb-8">
            Collez ce code dans votre site pour afficher le badge.
            {isVerifiedBadge && ' Les données se mettent à jour automatiquement.'}
          </p>
          <div className="bg-charcoal-900 rounded-xl p-6 relative">
            <div className="flex items-center gap-2 mb-4">
              <Code className="w-4 h-4 text-charcoal-400" />
              <span className="text-charcoal-400 text-sm font-mono">HTML</span>
            </div>
            <pre className="text-accent-400 text-sm font-mono overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
              {embedCode}
            </pre>
            <button
              onClick={handleCopy}
              className="absolute top-4 right-4 flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              aria-label="Copier le code"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-accent-400" />
                  <span className="text-accent-400">Code copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copier le code</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Instructions */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-8 text-center">
            Comment intégrer le badge sur votre site
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '1',
                icon: Search,
                title: 'Trouvez votre fiche',
                desc: 'Recherchez votre entreprise dans notre base ou créez un badge personnalisé avec vos informations.',
              },
              {
                step: '2',
                icon: Copy,
                title: 'Copiez le code HTML',
                desc: 'Cliquez sur le bouton "Copier le code" pour copier le code dans votre presse-papiers.',
              },
              {
                step: '3',
                icon: Code,
                title: 'Collez sur votre site',
                desc: 'Intégrez le code dans votre site WordPress, Wix, Squarespace ou tout autre CMS.',
              },
              {
                step: '4',
                icon: Globe,
                title: 'Badge actif !',
                desc: 'Le badge apparaît avec vos vraies données. Note et avis se mettent à jour automatiquement.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-sand-50 rounded-xl border border-sand-200 p-6 text-center shadow-soft hover:shadow-card-hover transition-shadow"
              >
                <div className="w-10 h-10 bg-primary-400 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                  {item.step}
                </div>
                <item.icon className="w-6 h-6 text-primary-400 mx-auto mb-3" />
                <h3 className="font-heading font-semibold text-charcoal-900 mb-2">{item.title}</h3>
                <p className="text-charcoal-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits — enhanced for link building motivation */}
      <section className="py-16 bg-sand-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-8 text-center">
            Pourquoi afficher le badge ?
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                icon: Shield,
                title: 'Inspirez confiance aux clients',
                desc: 'Le badge "Artisan Vérifié" rassure instantanément vos visiteurs. Les internautes font naturellement davantage confiance aux professionnels qui affichent une preuve de vérification.',
              },
              {
                icon: TrendingUp,
                title: 'Boostez votre référencement SEO',
                desc: "Le badge inclut un lien vers votre fiche ServicesArtisans, ce qui améliore votre visibilité sur Google. C'est un backlink gratuit et permanent.",
              },
              {
                icon: Users,
                title: 'Plus de demandes de devis',
                desc: 'Les artisans qui affichent un badge de confiance reçoivent en moyenne plus de demandes de contact sur leur site.',
              },
              {
                icon: Sparkles,
                title: 'Données en temps réel',
                desc: "Votre note, nombre d'avis et statut de vérification se mettent à jour automatiquement. Aucune maintenance requise de votre part.",
              },
              {
                icon: ExternalLink,
                title: 'Gratuit et sans engagement',
                desc: 'Le badge est 100 % gratuit. Aucun abonnement, aucun frais caché. Vous pouvez le retirer à tout moment.',
              },
              {
                icon: Globe,
                title: 'Compatible avec tous les sites',
                desc: 'Le badge fonctionne sur WordPress, Wix, Squarespace, Shopify, Webflow et tout site acceptant du HTML. Moins de 3 Ko, zero JavaScript.',
              },
            ].map((benefit) => (
              <div
                key={benefit.title}
                className="flex items-start gap-4 bg-white rounded-xl border border-sand-200 p-5 shadow-soft hover:shadow-card-hover transition-shadow"
              >
                <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-charcoal-900 mb-1">
                    {benefit.title}
                  </h3>
                  <p className="text-charcoal-600 text-sm">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-8 text-center">
            Questions fréquentes
          </h2>
          <div className="space-y-4">
            {faqItems.map((item, i) => (
              <details key={i} className="bg-sand-50 rounded-xl border border-sand-200 group">
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <h3 className="text-base font-semibold text-charcoal-900 pr-4">
                    {item.question}
                  </h3>
                  <ChevronDown className="w-5 h-5 text-charcoal-400 flex-shrink-0 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-6 pb-6 text-charcoal-600 text-sm leading-relaxed">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
