import { Shield, Clock, CheckCircle, Star, Search, FileText, ChevronDown } from 'lucide-react'

// ---------------------------------------------------------------------------
// Sidebar de réassurance pour les pages /devis (pattern Lemonade/Wise)
// Desktop: colonne droite sticky. Mobile: section dépliable.
// ---------------------------------------------------------------------------

interface DevisSidebarProps {
  /** Service name for contextual testimonial, e.g. "Plombier" */
  serviceName?: string
  /** Extra FAQ items to display */
  faqItems?: { question: string; answer: string }[]
  /** Show pricing badge */
  priceRange?: { min: number; max: number; unit: string }
}

const defaultFaq = [
  {
    question: 'Le service est-il vraiment gratuit ?',
    answer: 'Oui, la demande de devis est 100 % gratuite et sans engagement. Vous ne payez rien pour recevoir les propositions des artisans.',
  },
  {
    question: 'Combien de devis vais-je recevoir ?',
    answer: "Vous pouvez recevoir jusqu'à 3 devis personnalisés d'artisans différents, selon la disponibilité dans votre zone.",
  },
  {
    question: 'En combien de temps suis-je contacté ?',
    answer: "Les artisans disponibles vous contactent généralement sous 24 à 48 h. En cas d'urgence, précisez-le dans le formulaire.",
  },
]

// Testimonials pool — deterministic pick based on serviceName
const testimonials = [
  {
    name: 'Marie L.',
    city: 'Lyon',
    rating: 5,
    text: "J'ai reçu 3 devis en moins de 24 h. L'artisan choisi était très professionnel. Je recommande !",
    service: null,
  },
  {
    name: 'Thomas D.',
    city: 'Paris',
    rating: 5,
    text: 'Service rapide et efficace. Les devis étaient détaillés et les prix compétitifs.',
    service: 'plombier',
  },
  {
    name: 'Sophie M.',
    city: 'Bordeaux',
    rating: 5,
    text: "Très satisfaite. J'ai pu comparer sereinement et choisir l'artisan qui me convenait.",
    service: 'electricien',
  },
  {
    name: 'Pierre R.',
    city: 'Marseille',
    rating: 4,
    text: 'Devis reçus rapidement. Bon suivi et artisan ponctuel. Je referai appel au service.',
    service: 'serrurier',
  },
  {
    name: 'Isabelle C.',
    city: 'Toulouse',
    rating: 5,
    text: "Gratuit et sans pression. J'ai comparé 3 devis et économisé plus de 400 € sur mes travaux.",
    service: null,
  },
]

function getTestimonial(serviceName?: string) {
  if (serviceName) {
    const serviceSlug = serviceName.toLowerCase()
    const match = testimonials.find((t) => t.service === serviceSlug)
    if (match) return match
  }
  // Deterministic pick based on service name hash
  const hash = serviceName
    ? serviceName.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
    : 0
  return testimonials[hash % testimonials.length]
}

export default function DevisSidebar({ serviceName, faqItems, priceRange }: DevisSidebarProps) {
  const faq = faqItems && faqItems.length > 0 ? faqItems.slice(0, 3) : defaultFaq
  const testimonial = getTestimonial(serviceName)

  return (
    <aside className="space-y-6">
      {/* ─── Process Timeline ─────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-sand-200 p-6 shadow-soft">
        <h3 className="font-heading text-base font-bold text-charcoal-900 mb-5">
          Comment ça marche
        </h3>
        <div className="space-y-5">
          {[
            { icon: Search, step: '1', label: 'Décrivez votre projet', sub: '2 min' },
            { icon: FileText, step: '2', label: 'Recevez vos devis', sub: 'Sous 24 h' },
            { icon: CheckCircle, step: '3', label: 'Choisissez librement', sub: 'Sans engagement' },
          ].map((item, i) => {
            const Icon = item.icon
            return (
              <div key={item.step} className="flex items-start gap-3.5 relative">
                {/* Vertical connector line */}
                {i < 2 && (
                  <div className="absolute left-[15px] top-[32px] w-px h-[calc(100%+4px)] bg-sand-200" />
                )}
                <div className="relative z-10 w-[30px] h-[30px] bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-primary-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-charcoal-900">{item.label}</p>
                  <p className="text-xs text-charcoal-400">{item.sub}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ─── Testimonial ─────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-sand-200 p-6 shadow-soft">
        <div className="flex items-center gap-1 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${i < testimonial.rating ? 'text-secondary-400 fill-secondary-400' : 'text-sand-300'}`}
            />
          ))}
        </div>
        <blockquote className="text-sm text-charcoal-700 leading-relaxed mb-3 italic">
          “{testimonial.text}”
        </blockquote>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-primary-600">
              {testimonial.name.charAt(0)}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-charcoal-900">{testimonial.name}</p>
            <p className="text-xs text-charcoal-400">{testimonial.city}</p>
          </div>
        </div>
      </div>

      {/* ─── Trust Badges ────────────────────────────────── */}
      <div className="bg-accent-50 rounded-2xl border border-accent-100 p-5">
        <div className="space-y-3">
          {[
            { icon: Shield, text: 'Artisans vérifiés SIREN' },
            { icon: Clock, text: '100 % gratuit et sans engagement' },
            { icon: CheckCircle, text: 'Réponse sous 24 h' },
          ].map((badge) => {
            const Icon = badge.icon
            return (
              <div key={badge.text} className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 text-accent-600 flex-shrink-0" />
                <span className="text-sm text-accent-800 font-medium">{badge.text}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ─── Price Range (optional) ──────────────────────── */}
      {priceRange && (
        <div className="bg-secondary-50 rounded-2xl border border-secondary-100 p-5 text-center">
          <p className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-1">
            Tarif indicatif
          </p>
          <p className="text-2xl font-bold text-primary-500">
            {priceRange.min} – {priceRange.max}
          </p>
          <p className="text-xs text-charcoal-500 mt-0.5">{priceRange.unit}</p>
        </div>
      )}

      {/* ─── Mini FAQ ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-sand-200 p-6 shadow-soft">
        <h3 className="font-heading text-base font-bold text-charcoal-900 mb-4">
          Questions fréquentes
        </h3>
        <div className="space-y-2">
          {faq.map((item) => (
            <details
              key={item.question}
              className="group border-b border-sand-100 last:border-0"
            >
              <summary className="flex items-center justify-between cursor-pointer py-3 text-left [&::-webkit-details-marker]:hidden">
                <span className="text-sm font-medium text-charcoal-800 pr-3">
                  {item.question}
                </span>
                <ChevronDown className="w-4 h-4 text-charcoal-400 flex-shrink-0 group-open:rotate-180 transition-transform duration-200" />
              </summary>
              <div className="pb-3 text-xs text-charcoal-500 leading-relaxed">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </aside>
  )
}
