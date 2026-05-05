// @vitest-environment jsdom
/**
 * Tests — ProfileCompleteness
 * Couvre : score 0%, score 100% (retourne null), score partiel, liens vers les tabs.
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode
    href: string
    [key: string]: unknown
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('lucide-react', () => {
  const icon = (name: string) => {
    const I = ({ className }: { className?: string }) => (
      <span data-testid={`icon-${name}`} className={className} />
    )
    I.displayName = name
    return I
  }
  return {
    CheckCircle2: icon('CheckCircle2'),
    Circle: icon('Circle'),
    Building2: icon('Building2'),
    FileText: icon('FileText'),
    Phone: icon('Phone'),
    Mail: icon('Mail'),
    CreditCard: icon('CreditCard'),
    Camera: icon('Camera'),
    MapPin: icon('MapPin'),
    Wrench: icon('Wrench'),
    Euro: icon('Euro'),
    Clock: icon('Clock'),
    Globe: icon('Globe'),
    ChevronRight: icon('ChevronRight'),
  }
})

// ── Import après mocks ─────────────────────────────────────────────────────

import ProfileCompleteness, {
  type CompletenessProvider,
} from '@/components/artisan-dashboard/ProfileCompleteness'

// ── Helpers ────────────────────────────────────────────────────────────────

/** Provider avec tous les champs vides */
const emptyProvider: CompletenessProvider = {}

/** Provider avec tous les champs remplis */
const fullProvider: CompletenessProvider = {
  name: 'Plomberie Martin',
  description: 'Expert en plomberie depuis 20 ans',
  phone: '0612345678',
  email: 'contact@plomberie-martin.fr',
  siret: '12345678901234',
  avatar_url: 'https://example.com/avatar.jpg',
  address_city: 'Paris',
  address_postal_code: '75001',
  services_offered: ['plomberie'],
  service_prices: [{ service: 'plomberie', price: 50 }],
  opening_hours: { lundi: { ouvert: true, debut: '08:00', fin: '18:00' } },
  website: 'https://plomberie-martin.fr',
}

/** Provider partiel : nom + téléphone + email uniquement */
const partialProvider: CompletenessProvider = {
  name: 'Plomberie Martin',
  phone: '0612345678',
  email: 'contact@plomberie-martin.fr',
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('ProfileCompleteness', () => {
  it('affiche un score de 0% quand tous les champs sont vides', () => {
    render(<ProfileCompleteness provider={emptyProvider} />)

    expect(screen.getByText('0%')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
    // Barre rouge (bg-red-500) car < 40
    expect(screen.getByRole('progressbar')).toHaveClass('bg-red-500')
  })

  it('retourne null quand le profil est complet (100%)', () => {
    const { container } = render(<ProfileCompleteness provider={fullProvider} />)
    expect(container.firstChild).toBeNull()
  })

  it('affiche le bon score et liste les champs manquants pour un profil partiel', () => {
    render(<ProfileCompleteness provider={partialProvider} />)

    // Le score doit être 25% (nom=10 + phone=10 + email=5 = 25/100)
    expect(screen.getByText('25%')).toBeInTheDocument()

    // Les champs remplis ne doivent PAS apparaître dans la section "À compléter"
    // Le texte est "À compléter" avec un accent — on utilise une query par classe CSS
    const missingHeader = document.querySelector('.text-charcoal-500.uppercase')!
    const missingSection = missingHeader.closest('div')!
    expect(missingSection).not.toHaveTextContent('Téléphone')

    // Les champs manquants doivent apparaître
    expect(screen.getByText('Description / présentation')).toBeInTheDocument()
    expect(screen.getByText('Numéro SIRET')).toBeInTheDocument()
    expect(screen.getByText('Photo de profil')).toBeInTheDocument()
    expect(screen.getByText('Ville et code postal')).toBeInTheDocument()
    expect(screen.getByText('Services proposés')).toBeInTheDocument()
    expect(screen.getByText('Tarifs')).toBeInTheDocument()
    expect(screen.getByText('Horaires d\u2019ouverture')).toBeInTheDocument()
    expect(screen.getByText('Site web')).toBeInTheDocument()
  })

  it('chaque champ manquant a un lien vers le bon tab profil', () => {
    render(<ProfileCompleteness provider={emptyProvider} />)

    // Vérifier que les liens pointent vers les bons tabs
    const links = screen.getAllByRole('link')

    // On doit avoir 11 liens (un par champ manquant)
    expect(links).toHaveLength(11)

    // Vérifier quelques liens spécifiques
    const descriptionLink = screen.getByText('Description / présentation').closest('a')
    expect(descriptionLink).toHaveAttribute('href', '/espace-artisan/profil?tab=presentation')

    const phoneLink = screen.getByText('Téléphone').closest('a')
    expect(phoneLink).toHaveAttribute('href', '/espace-artisan/profil?tab=contact')

    const servicesLink = screen.getByText('Services proposés').closest('a')
    expect(servicesLink).toHaveAttribute('href', '/espace-artisan/profil?tab=services')

    const hoursLink = screen.getByText('Horaires d\u2019ouverture').closest('a')
    expect(hoursLink).toHaveAttribute('href', '/espace-artisan/profil?tab=disponibilite')

    const avatarLink = screen.getByText('Photo de profil').closest('a')
    expect(avatarLink).toHaveAttribute('href', '/espace-artisan/profil?tab=avatar')

    const addressLink = screen.getByText('Ville et code postal').closest('a')
    expect(addressLink).toHaveAttribute('href', '/espace-artisan/profil?tab=localisation')
  })

  it('affiche la section "Complété" avec le bon compteur pour un profil partiel', () => {
    render(<ProfileCompleteness provider={partialProvider} />)

    // 3 champs remplis sur 11 — le texte est fragmenté par JSX, on utilise le DOM directement
    const completedHeader = document.querySelector('.text-charcoal-400.uppercase')!
    expect(completedHeader).toBeTruthy()
    expect(completedHeader.textContent).toMatch(/3.*\/.*11/)
  })
})
