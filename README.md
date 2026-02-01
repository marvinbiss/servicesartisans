# ServicesArtisans

Plateforme de mise en relation entre particuliers et artisans en France.

## Stack Technique

- **Framework**: Next.js 14 (App Router)
- **Base de donnees**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Paiements**: Stripe
- **Emails**: Resend
- **Monitoring**: Sentry
- **Mobile**: Capacitor (iOS/Android)

## Installation

```bash
# Cloner le repository
git clone https://github.com/marvinbiss/servicesartisans.git
cd servicesartisans

# Installer les dependances
npm install

# Copier le fichier d'environnement
cp .env.example .env.local

# Configurer les variables d'environnement dans .env.local

# Lancer en developpement
npm run dev
```

## Structure du Projet

```
src/
  app/                    # Pages et routes (Next.js App Router)
    (public)/            # Pages publiques
    admin/               # Dashboard administrateur
    api/                 # Routes API
    espace-artisan/      # Espace artisan
    espace-client/       # Espace client
    services/            # Pages services et artisans
  components/            # Composants React
    admin/               # Composants admin
    artisan/             # Composants page artisan
    ui/                  # Composants UI generiques
  hooks/                 # Hooks React personnalises
  lib/                   # Utilitaires et configurations
    supabase/           # Client Supabase
    stripe/             # Integration Stripe
    email/              # Templates email
  middleware/           # Middleware Next.js
scripts/                # Scripts d'import et maintenance
supabase/
  migrations/           # Migrations SQL
```

## Commandes

```bash
# Developpement
npm run dev              # Serveur de developpement
npm run build            # Build production
npm run start            # Demarrer en production
npm run lint             # Linter ESLint

# Tests
npm run test             # Tests Playwright
npm run test:ui          # Tests avec UI
npm run test:headed      # Tests en mode visible

# Mobile (Capacitor)
npm run mobile:sync      # Synchroniser avec les apps natives
npm run mobile:android   # Ouvrir Android Studio
npm run mobile:ios       # Ouvrir Xcode
```

## Variables d'Environnement

Voir `.env.example` pour la liste complete des variables requises.

### Variables Obligatoires

- `NEXT_PUBLIC_SUPABASE_URL` - URL du projet Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Cle anonyme Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Cle service role Supabase
- `STRIPE_SECRET_KEY` - Cle secrete Stripe
- `RESEND_API_KEY` - Cle API Resend

## Deploiement

Le projet est deploye automatiquement sur Vercel a chaque push sur `master`.

### Configuration Vercel

1. Connecter le repository GitHub
2. Configurer les variables d'environnement
3. Le deploiement est automatique

## Architecture

Voir [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) pour les details de l'architecture.

## Contribution

1. Creer une branche depuis `master`
2. Faire les modifications
3. S'assurer que `npm run build` passe
4. Creer une Pull Request

## Licence

Proprietary - Tous droits reserves
