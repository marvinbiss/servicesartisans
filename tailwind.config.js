/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary - Terracotta (THE brand color — warm, artisan, distinctive)
        primary: {
          50:  '#FDF1EC',
          100: '#FADDCF',
          200: '#F5BAA0',
          300: '#EF9171',
          400: '#E86B4B',
          500: '#D4553A',
          600: '#C24B2A',
          700: '#A33E22',
          800: '#85321C',
          900: '#6B2916',
          950: '#451A0E',
        },
        // Secondary - Honey Gold (highlights, stars, badges, premium)
        secondary: {
          50: '#fefaec',
          100: '#fcf0c9',
          200: '#f9de8c',
          300: '#f5c94f',
          400: '#f2b523',
          500: '#e8960a',
          600: '#c97308',
          700: '#a8530b',
          800: '#894110',
          900: '#713610',
          950: '#421b05',
        },
        // Clay - Kept for backward compat, aliased to primary
        clay: {
          50:  '#FDF1EC',
          100: '#FADDCF',
          200: '#F5BAA0',
          300: '#EF9171',
          400: '#E86B4B',
          500: '#D4553A',
          600: '#C24B2A',
          700: '#A33E22',
          800: '#85321C',
          900: '#6B2916',
        },
        // Sand - Warm neutrals (backgrounds, surfaces)
        sand: {
          50:  '#FDFAF7',
          100: '#F9F4EE',
          200: '#F4EFE8',
          300: '#EDE8E1',
          400: '#E5DDD4',
          500: '#D5C9BE',
          600: '#B8A99A',
          700: '#9A8879',
          800: '#7D6A5C',
          900: '#614F43',
        },
        // Accent - Forest Green (trust, verified, success — NOT emerald/generic)
        accent: {
          50:  '#F0F7F4',
          100: '#D9EDE3',
          200: '#B5DBC9',
          300: '#85C4A6',
          400: '#55A882',
          500: '#3D8B68',
          600: '#2D7054',
          700: '#245A44',
          800: '#1E4837',
          900: '#1A3C2E',
          950: '#0D2119',
        },
        // Charcoal - Warm dark tones (not pure black)
        charcoal: {
          50:  '#F7F6F5',
          100: '#EEEDEB',
          200: '#D9D7D4',
          300: '#B8B4AF',
          400: '#918C85',
          500: '#706A62',
          600: '#5A544D',
          700: '#45403B',
          800: '#302C28',
          900: '#1C1917',
          950: '#0F0E0C',
        },
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'DM Sans', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['var(--font-heading)', 'Sora', 'DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      // ─── Z-INDEX SYSTEM ─────────────────────────────────────────────
      // Documenté 2026-05-13. Avant : 15 valeurs ad-hoc (z-[51], z-[54],
      // z-[55], z-[56], z-[60], z-[100], z-[1000], z-[9999], z-[10000]).
      // Maintenant : tokens nommés mappés à la pile UI logique.
      //   base       0    background / cards
      //   raised     10   in-component overlays, sticky-header dans card
      //   dropdown   20   selects, autocompletes, popovers
      //   sticky     30   sticky elements dans flow (sticky top, footer ad)
      //   header     40   site header, sticky top bar
      //   nav-mobile 45   MobileBottomNav (au-dessus du content)
      //   modal     50    modal & modal backdrop
      //   sticky-cta 55   StickyMobileCTA (au-dessus de nav-mobile)
      //   over-modal 60   modal au-dessus d'un autre modal
      //   lightbox   100  photo gallery fullscreen, lightbox
      //   toast      200  notifications transients
      //   skip-link 9999  WCAG skip-to-content focus visible
      zIndex: {
        base: '0',
        raised: '10',
        dropdown: '20',
        sticky: '30',
        header: '40',
        'nav-mobile': '45',
        modal: '50',
        'sticky-cta': '55',
        'over-modal': '60',
        lightbox: '100',
        toast: '200',
        'skip-link': '9999',
      },
      letterSpacing: {
        'tighter': '-0.04em',
        'display': '-0.02em',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(232, 107, 75, 0.25)',
        'glow-lg': '0 0 40px rgba(232, 107, 75, 0.35)',
        'glow-amber': '0 0 30px rgba(232, 150, 10, 0.15)',
        'glow-gold': '0 0 30px rgba(232, 150, 10, 0.4)',
        'glow-terra': '0 0 30px rgba(232, 107, 75, 0.2)',
        'glow-green': '0 0 30px rgba(61, 139, 104, 0.15)',
        'soft': '0 2px 15px -3px rgba(28, 25, 23, 0.06), 0 10px 20px -2px rgba(28, 25, 23, 0.03)',
        'soft-lg': '0 10px 40px -10px rgba(28, 25, 23, 0.07)',
        'premium': '0 25px 50px -12px rgba(28, 25, 23, 0.12), 0 12px 24px -8px rgba(28, 25, 23, 0.08)',
        'premium-lg': '0 25px 60px -15px rgba(28, 25, 23, 0.14)',
        'glass': '0 8px 32px rgba(28, 25, 23, 0.06)',
        'glass-lg': '0 8px 32px rgba(28, 25, 23, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
        'glow-clay': '0 0 30px rgba(232, 107, 75, 0.3)',
        'inner-glow': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
        'card-hover': '0 20px 40px -12px rgba(28, 25, 23, 0.1), 0 8px 20px -8px rgba(232, 107, 75, 0.08)',
        'cta': '0 4px 14px 0 rgba(232, 107, 75, 0.3)',
        'cta-hover': '0 8px 25px 0 rgba(212, 85, 58, 0.4)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #E86B4B 0%, #C24B2A 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #e8960a 0%, #c97308 100%)',
        'gradient-hero': 'linear-gradient(135deg, #1C1917 0%, #302C28 50%, #45403B 100%)',
        'gradient-hero-warm': 'linear-gradient(135deg, #6B2916 0%, #C24B2A 50%, #E86B4B 100%)',
        'gradient-premium': 'linear-gradient(135deg, #e8960a 0%, #f2b523 50%, #e8960a 100%)',
        'gradient-premium-gold': 'linear-gradient(135deg, #c97308 0%, #e8960a 25%, #f2b523 50%, #e8960a 75%, #c97308 100%)',
        'gradient-terra': 'linear-gradient(135deg, #C24B2A 0%, #E86B4B 50%, #EF9171 100%)',
        'gradient-sand': 'linear-gradient(180deg, #FDFAF7 0%, #F4EFE8 100%)',
        'gradient-dark': 'linear-gradient(180deg, #1C1917 0%, #302C28 100%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        'gradient-shine': 'linear-gradient(110deg, transparent 25%, rgba(255,255,255,0.1) 50%, transparent 75%)',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-pattern': 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in-down': 'fadeInDown 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.3s ease-out',
        'scale-in-bounce': 'scaleInBounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'bounce-subtle': 'bounceSubtle 2s infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'gradient-x': 'gradient-x 8s ease infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 2.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        scaleInBounce: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '70%': { transform: 'scale(1.02)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(232, 150, 10, 0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(232, 150, 10, 0.6)' },
        },
        pulseSubtle: {
          '0%, 100%': { boxShadow: '0 4px 14px 0 rgba(232, 107, 75, 0.3)' },
          '50%': { boxShadow: '0 8px 30px 0 rgba(212, 85, 58, 0.45)' },
        },
        'gradient-x': {
          '0%, 100%': { 'background-size': '200% 200%', 'background-position': 'left center' },
          '50%': { 'background-size': '200% 200%', 'background-position': 'right center' },
        },
        counter: {
          from: { '--num': '0' },
          to: { '--num': 'var(--target)' },
        },
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      transitionDuration: {
        '400': '400ms',
      },
      transitionTimingFunction: {
        'premium': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'bounce-in': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'bounce-sm': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      backdropBlur: {
        'xs': '2px',
        '3xl': '64px',
      },
    },
  },
  plugins: [],
}
