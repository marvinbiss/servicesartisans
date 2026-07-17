// @vitest-environment jsdom
/**
 * Tests de rendu RgeBadge.
 * Utilise @testing-library/react (déjà utilisé par d'autres tests — cf. TrustBadge).
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import RgeBadge, { type RgeQualificationProp } from '@/components/artisan/RgeBadge'

const validQualification: RgeQualificationProp = {
  code: 'QPAC',
  nom: 'QualiPAC Module Chauffage',
  organisme: 'Qualit\u2019EnR',
  domaine: 'Pompe a chaleur',
  meta_domaine: 'Energies renouvelables',
  date_debut: '2025-01-01',
  date_fin: '2099-12-31',
  url: 'https://example.com/qualipac',
}

// Date future pour garantir validUntil >= today
const FUTURE_DATE = '2099-12-31'
const PAST_DATE = '2000-01-01'

describe('RgeBadge — cas null / vides', () => {
  it('retourne null si qualifications est null', () => {
    const { container } = render(
      <RgeBadge
        qualifications={null}
        validUntil={FUTURE_DATE}
        organismes={['Qualibat']}
        sourceUrl={null}
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('retourne null si qualifications est undefined', () => {
    const { container } = render(
      <RgeBadge
        qualifications={undefined}
        validUntil={FUTURE_DATE}
        organismes={null}
        sourceUrl={null}
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('retourne null si qualifications est un tableau vide', () => {
    const { container } = render(
      <RgeBadge qualifications={[]} validUntil={FUTURE_DATE} organismes={null} sourceUrl={null} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('retourne null si validUntil est null', () => {
    const { container } = render(
      <RgeBadge
        qualifications={[validQualification]}
        validUntil={null}
        organismes={null}
        sourceUrl={null}
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('retourne null si validUntil est undefined', () => {
    const { container } = render(
      <RgeBadge
        qualifications={[validQualification]}
        validUntil={undefined}
        organismes={null}
        sourceUrl={null}
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('retourne null si validUntil est dans le passé', () => {
    const { container } = render(
      <RgeBadge
        qualifications={[validQualification]}
        validUntil={PAST_DATE}
        organismes={null}
        sourceUrl={null}
      />
    )
    expect(container.firstChild).toBeNull()
  })
})

describe('RgeBadge — mode expanded (default)', () => {
  it('affiche "Certifié RGE" avec data valide', () => {
    render(
      <RgeBadge
        qualifications={[validQualification]}
        validUntil={FUTURE_DATE}
        organismes={['Qualit\u2019EnR']}
        sourceUrl="https://example.com"
      />
    )
    expect(screen.getByText(/Certifi/i)).toBeInTheDocument()
    expect(screen.getByText(/RGE/)).toBeInTheDocument()
  })

  it('affiche le count de qualifications (1 qualif)', () => {
    render(
      <RgeBadge
        qualifications={[validQualification]}
        validUntil={FUTURE_DATE}
        organismes={['Qualit\u2019EnR']}
        sourceUrl={null}
      />
    )
    // "(1 qualif)"
    expect(screen.getByText(/\(1 qualif\)/)).toBeInTheDocument()
  })

  it('affiche le count au pluriel pour plusieurs qualifications', () => {
    const quals: RgeQualificationProp[] = [
      validQualification,
      { ...validQualification, code: 'QSOL', nom: 'QualiSol' },
      { ...validQualification, code: 'QBOIS', nom: 'QualiBois' },
    ]
    render(
      <RgeBadge
        qualifications={quals}
        validUntil={FUTURE_DATE}
        organismes={['Qualit\u2019EnR', 'Qualibat']}
        sourceUrl={null}
      />
    )
    expect(screen.getByText(/\(3 qualifs\)/)).toBeInTheDocument()
  })

  it('affiche le nom de chaque qualification', () => {
    const quals: RgeQualificationProp[] = [
      { ...validQualification, code: 'A', nom: 'QualiPAC Module' },
      { ...validQualification, code: 'B', nom: 'QualiSol CESI' },
    ]
    render(
      <RgeBadge
        qualifications={quals}
        validUntil={FUTURE_DATE}
        organismes={['Qualit\u2019EnR']}
        sourceUrl={null}
      />
    )
    expect(screen.getByText('QualiPAC Module')).toBeInTheDocument()
    expect(screen.getByText('QualiSol CESI')).toBeInTheDocument()
  })

  it('affiche un lien vers sourceUrl quand fourni', () => {
    render(
      <RgeBadge
        qualifications={[validQualification]}
        validUntil={FUTURE_DATE}
        organismes={['Qualibat']}
        sourceUrl="https://data.gouv.fr/rge"
      />
    )
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', 'https://data.gouv.fr/rge')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })
})

describe('RgeBadge — mode compact', () => {
  it('affiche la pastille courte "RGE"', () => {
    render(
      <RgeBadge
        qualifications={[validQualification]}
        validUntil={FUTURE_DATE}
        organismes={['Qualit\u2019EnR']}
        sourceUrl={null}
        compact
      />
    )
    expect(screen.getByText('RGE')).toBeInTheDocument()
  })

  it('n affiche pas "Certifié RGE" complet en mode compact', () => {
    render(
      <RgeBadge
        qualifications={[validQualification]}
        validUntil={FUTURE_DATE}
        organismes={null}
        sourceUrl={null}
        compact
      />
    )
    expect(screen.queryByText(/Certifi\u00e9 RGE/)).not.toBeInTheDocument()
  })

  it('affiche un title attribute accessible avec les détails', () => {
    const { container } = render(
      <RgeBadge
        qualifications={[validQualification]}
        validUntil={FUTURE_DATE}
        organismes={['Qualit\u2019EnR']}
        sourceUrl={null}
        compact
      />
    )
    const pill = container.querySelector('span[title]')
    expect(pill).not.toBeNull()
    expect(pill?.getAttribute('title')).toContain('Certifi')
    expect(pill?.getAttribute('title')).toContain('ADEME')
  })

  it('affiche le multiplicateur ×N quand plusieurs qualifications', () => {
    const quals: RgeQualificationProp[] = [
      validQualification,
      { ...validQualification, code: 'B', nom: 'Q2' },
      { ...validQualification, code: 'C', nom: 'Q3' },
    ]
    render(
      <RgeBadge
        qualifications={quals}
        validUntil={FUTURE_DATE}
        organismes={null}
        sourceUrl={null}
        compact
      />
    )
    expect(screen.getByText('\u00d73')).toBeInTheDocument()
  })

  it('n affiche pas le multiplicateur quand une seule qualification', () => {
    render(
      <RgeBadge
        qualifications={[validQualification]}
        validUntil={FUTURE_DATE}
        organismes={null}
        sourceUrl={null}
        compact
      />
    )
    expect(screen.queryByText(/\u00d71/)).not.toBeInTheDocument()
  })
})
