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
        // Primary - Marine Profond (Trust, CTAs, links, primary actions)
        primary: {
          50: '#f0f1f8',
          100: '#dde0f0',
          200: '#bcc2e2',
          300: '#96a0d1',
          400: '#6b78bb',
          500: '#4a5899',
          600: '#364180',
          700: '#2b3468',
          800: '#212853',
          900: '#1a2044',
          950: '#0e1229',
        },
        // Secondary - Cuivre (highlights, stars, badges, CTAs)
        secondary: {
          50: '#fdf6f0',
          100: '#faeadb',
          200: '#f4d2b5',
          300: '#edb585',
          400: '#d4924f',
          500: '#c67a3c',
          600: '#b4652a',
          700: '#8f4e22',
          800: '#733f1e',
          900: '#5f351b',
          950: '#331a0c',
        },
        // Accent - Vert Artisan (verified badges, success states)
        accent: {
          50: '#edf5f0',
          100: '#d2e8da',
          200: '#a8d2b8',
          300: '#73b690',
          400: '#479769',
          500: '#2d7a4e',
          600: '#236340',
          700: '#1a4d33',
          800: '#153e2a',
          900: '#103322',
          950: '#081a11',
        },
      },
      fontFamily: {
        sans: ['var(--font-body)', 'Source Sans 3', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['var(--font-heading)', 'DM Serif Display', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      letterSpacing: {
        'tighter': '-0.04em',
        'display': '-0.02em',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(54, 65, 128, 0.3)',
        'glow-lg': '0 0 40px rgba(54, 65, 128, 0.4)',
        'glow-amber': '0 0 30px rgba(198, 122, 60, 0.15)',
        'glow-gold': '0 0 30px rgba(198, 122, 60, 0.4)',
        'glow-blue': '0 0 30px rgba(54, 65, 128, 0.15)',
        'glow-emerald': '0 0 30px rgba(45, 122, 78, 0.15)',
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 10px 40px -10px rgba(0, 0, 0, 0.08)',
        'premium': '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 12px 24px -8px rgba(0, 0, 0, 0.1)',
        'premium-lg': '0 25px 60px -15px rgba(0, 0, 0, 0.15)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.08)',
        'glass-lg': '0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
        'inner-glow': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
        'card-hover': '0 25px 50px -12px rgba(0, 0, 0, 0.12)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #364180 0%, #2b3468 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #c67a3c 0%, #b4652a 100%)',
        'gradient-hero': 'linear-gradient(135deg, #0d1221 0%, #151b2e 50%, #1a2044 100%)',
        'gradient-premium': 'linear-gradient(135deg, #c67a3c 0%, #d4924f 50%, #c67a3c 100%)',
        'gradient-premium-gold': 'linear-gradient(135deg, #b4652a 0%, #c67a3c 25%, #d4924f 50%, #c67a3c 75%, #b4652a 100%)',
        'gradient-premium-blue': 'linear-gradient(135deg, #212853 0%, #364180 50%, #4a5899 100%)',
        'gradient-dark': 'linear-gradient(180deg, #0d1221 0%, #151b2e 100%)',
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
        pulseGlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
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
