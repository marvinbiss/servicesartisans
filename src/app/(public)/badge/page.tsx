import { Metadata } from 'next'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { getBreadcrumbSchema } from '@/lib/seo/jsonld'
import { SITE_URL, getAlternates } from '@/lib/seo/config'
import { Shield, TrendingUp, Heart, Monitor, Globe, Smartphone } from 'lucide-react'
import CopyCodeButton from '@/components/ui/CopyCodeButton'

const canonicalUrl = `${SITE_URL}/badge`

export const metadata: Metadata = {
  title: 'Badge Artisan Vérifié — ServicesArtisans',
  description:
    'Affichez le badge "Artisan Vérifié" sur votre site web. Confiance visiteurs, référencement local et backlink gratuit. 3 variantes, 100% gratuit.',
  alternates: getAlternates('/badge'),
  openGraph: {
    locale: 'fr_FR',
    title: 'Badge Artisan Vérifié — ServicesArtisans',
    description:
      'Intégrez le badge Artisan Vérifié sur votre site. Gratuit, sans engagement, compatible tous CMS.',
    url: canonicalUrl,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Badge Artisan Vérifié — ServicesArtisans',
    description: 'Intégrez le badge Artisan Vérifié sur votre site. Gratuit, sans engagement.',
  },
}

export const revalidate = false

/* ------------------------------------------------------------------ */
/*  HTML des 3 badges (inline styles, autonomes)                       */
/* ------------------------------------------------------------------ */

const BADGE_COMPLET = `<a href="https://servicesartisans.fr" target="_blank" rel="noopener"
   style="display:inline-flex;align-items:center;gap:8px;padding:10px 18px;border-radius:10px;background:#f0fdf4;border:1px solid #22c55e;text-decoration:none;color:#15803d;font-family:system-ui;font-size:14px;font-weight:500">
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
  Artisan vérifié — ServicesArtisans.fr
</a>`

const BADGE_COMPACT = `<a href="https://servicesartisans.fr" target="_blank" rel="noopener"
   style="display:inline-flex;align-items:center;gap:5px;padding:6px 12px;border-radius:8px;background:#f0fdf4;border:1px solid #22c55e;text-decoration:none;color:#15803d;font-family:system-ui;font-size:12px;font-weight:600">
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
  Vérifié
</a>`

const BADGE_BANNIERE = `<a href="https://servicesartisans.fr" target="_blank" rel="noopener"
   style="display:block;padding:14px 24px;border-radius:10px;background:#16a34a;text-decoration:none;color:#ffffff;font-family:system-ui;font-size:14px;font-weight:500;text-align:center">
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" style="display:inline-block;vertical-align:middle;margin-right:8px">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
  Artisan vérifié sur ServicesArtisans.fr — Professionnel de confiance
</a>`

/* ------------------------------------------------------------------ */
/*  Composant page                                                     */
/* ------------------------------------------------------------------ */

export default function BadgePage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Badge', url: '/badge' },
  ])

  const badges = [
    {
      id: 'complet',
      title: 'Badge complet',
      subtitle: 'Horizontal — idéal pour le pied de page ou la barre latérale',
      code: BADGE_COMPLET,
    },
    {
      id: 'compact',
      title: 'Badge compact',
      subtitle: 'Petit format — parfait pour un coin de page ou un footer',
      code: BADGE_COMPACT,
    },
    {
      id: 'banniere',
      title: 'Badge bannière',
      subtitle: 'Large — idéal en haut ou bas de page, bien visible',
      code: BADGE_BANNIERE,
    },
  ]

  return (
    <div className="min-h-screen bg-sand-50">
      <JsonLd data={[breadcrumbSchema]} />

      {/* Hero */}
      <section className="relative bg-charcoal-950 text-white overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(34,197,94,0.15) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 110%, rgba(34,197,94,0.08) 0%, transparent 50%)',
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-sand-50 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-28 md:pt-14 md:pb-36">
          <Breadcrumb
            items={[{ label: 'Badge' }]}
            className="mb-6 text-charcoal-400 [&_a]:text-charcoal-400 [&_a:hover]:text-white [&_svg]:text-charcoal-600"
          />
          <div className="text-center">
            <h1 className="font-heading text-4xl md:text-5xl font-extrabold mb-6 tracking-[-0.025em]">
              Affichez votre badge Artisan Vérifié
            </h1>
            <p className="text-xl text-charcoal-400 max-w-3xl mx-auto">
              Montrez à vos clients que vous êtes un professionnel vérifié. Copiez le code
              ci-dessous et intégrez-le sur votre site web.
            </p>
          </div>
        </div>
      </section>

      {/* Badges */}
      <section className="py-16 bg-white -mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className="bg-sand-50 rounded-2xl border border-sand-200 p-6 md:p-8 shadow-soft"
              >
                <h2 className="font-heading text-xl font-bold text-charcoal-900 mb-1">
                  {badge.title}
                </h2>
                <p className="text-charcoal-500 text-sm mb-6">{badge.subtitle}</p>

                {/* Preview */}
                <div className="bg-white rounded-xl border border-sand-200 p-8 flex items-center justify-center mb-6">
                  <div dangerouslySetInnerHTML={{ __html: badge.code }} />
                </div>

                {/* Code block */}
                <div className="bg-charcoal-900 rounded-xl p-5 relative">
                  <pre className="text-green-400 text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all leading-relaxed pr-28">
                    {badge.code}
                  </pre>
                  <div className="absolute top-3 right-3">
                    <CopyCodeButton code={badge.code} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instructions CMS */}
      <section className="py-16 bg-sand-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-2 text-center">
            Comment intégrer le badge sur votre site
          </h2>
          <p className="text-charcoal-500 text-sm text-center mb-10">
            Instructions adaptées aux CMS les plus utilisés par les artisans.
          </p>

          <div className="grid sm:grid-cols-3 gap-6">
            {/* WordPress */}
            <div className="bg-white rounded-xl border border-sand-200 p-6 shadow-soft hover:shadow-card-hover transition-shadow">
              <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center mb-4">
                <Monitor className="w-5 h-5 text-primary-500" />
              </div>
              <h3 className="font-heading font-semibold text-charcoal-900 mb-3">WordPress</h3>
              <ol className="text-charcoal-600 text-sm space-y-2 list-decimal list-inside">
                <li>Allez dans Apparence &gt; Widgets ou ouvrez l&apos;éditeur de page</li>
                <li>Ajoutez un bloc « HTML personnalisé »</li>
                <li>Collez le code du badge</li>
                <li>Enregistrez et publiez</li>
              </ol>
              <p className="text-charcoal-500 text-xs mt-3">
                Compatible Gutenberg, Elementor, Divi et tous les page builders.
              </p>
            </div>

            {/* Wix */}
            <div className="bg-white rounded-xl border border-sand-200 p-6 shadow-soft hover:shadow-card-hover transition-shadow">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mb-4">
                <Globe className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-heading font-semibold text-charcoal-900 mb-3">Wix</h3>
              <ol className="text-charcoal-600 text-sm space-y-2 list-decimal list-inside">
                <li>Ouvrez l&apos;éditeur Wix de votre site</li>
                <li>Cliquez sur + Ajouter &gt; Intégrations &gt; HTML personnalisé</li>
                <li>Collez le code dans la zone de texte</li>
                <li>Redimensionnez le bloc et publiez</li>
              </ol>
            </div>

            {/* Squarespace */}
            <div className="bg-white rounded-xl border border-sand-200 p-6 shadow-soft hover:shadow-card-hover transition-shadow">
              <div className="w-10 h-10 bg-charcoal-100 rounded-lg flex items-center justify-center mb-4">
                <Smartphone className="w-5 h-5 text-charcoal-700" />
              </div>
              <h3 className="font-heading font-semibold text-charcoal-900 mb-3">Squarespace</h3>
              <ol className="text-charcoal-600 text-sm space-y-2 list-decimal list-inside">
                <li>Modifiez la page souhaitée</li>
                <li>Ajoutez un bloc Code (dans la section Basique)</li>
                <li>Collez le code HTML du badge</li>
                <li>Désactivez « Afficher la source » et enregistrez</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Avantages */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-8 text-center">
            Pourquoi intégrer le badge ?
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="text-center bg-green-50 rounded-xl border border-green-200 p-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-green-700" />
              </div>
              <h3 className="font-heading font-semibold text-charcoal-900 mb-2">
                Renforcez la confiance de vos visiteurs
              </h3>
              <p className="text-charcoal-600 text-sm">
                Le badge « Artisan Vérifié » rassure immédiatement vos clients potentiels et
                augmente votre taux de conversion.
              </p>
            </div>

            <div className="text-center bg-green-50 rounded-xl border border-green-200 p-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-green-700" />
              </div>
              <h3 className="font-heading font-semibold text-charcoal-900 mb-2">
                Améliorez votre référencement local
              </h3>
              <p className="text-charcoal-600 text-sm">
                Chaque badge installé crée un backlink de qualité vers votre profil, ce qui améliore
                votre positionnement sur Google.
              </p>
            </div>

            <div className="text-center bg-green-50 rounded-xl border border-green-200 p-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6 text-green-700" />
              </div>
              <h3 className="font-heading font-semibold text-charcoal-900 mb-2">
                100% gratuit, sans engagement
              </h3>
              <p className="text-charcoal-600 text-sm">
                Aucun abonnement, aucun frais caché. Vous pouvez retirer le badge à tout moment. Le
                code HTML est léger et sans JavaScript.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
