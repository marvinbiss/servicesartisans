import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createHash } from 'crypto'
import {
  buildGraphUserData,
  getClientContext,
  getFbCookies,
  sendMetaEvent,
} from '@/lib/meta/capi'

vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

const sha256 = (value: string) => createHash('sha256').update(value, 'utf8').digest('hex')

const ORIGINAL_ENV = { ...process.env }

function configure() {
  process.env.META_CAPI_ACCESS_TOKEN = 'test-token'
  process.env.META_DATASET_ID = '1234567890'
  delete process.env.META_TEST_EVENT_CODE
}

function lastFetchBody(fetchMock: ReturnType<typeof vi.fn>) {
  const [, init] = fetchMock.mock.calls.at(-1) as [string, RequestInit]
  return JSON.parse(init.body as string)
}

beforeEach(() => {
  vi.restoreAllMocks()
  process.env = { ...ORIGINAL_ENV }
  delete process.env.META_CAPI_ACCESS_TOKEN
  delete process.env.META_DATASET_ID
  delete process.env.NEXT_PUBLIC_META_PIXEL_ID
  delete process.env.META_TEST_EVENT_CODE
})

afterEach(() => {
  process.env = { ...ORIGINAL_ENV }
})

describe('buildGraphUserData', () => {
  it('hache les identifiants et laisse IP/UA en clair', () => {
    const out = buildGraphUserData({
      email: 'Marvin@Test.FR',
      phone: '06 12 34 56 78',
      firstName: 'Éric',
      city: 'Saint-Denis',
      zip: '93200',
      country: 'fr',
      fbp: 'fb.1.123.456',
      fbc: 'fb.1.123.abc',
      clientIpAddress: '1.2.3.4',
      clientUserAgent: 'Mozilla/5.0',
    })

    expect(out.em).toEqual([sha256('marvin@test.fr')])
    expect(out.ph).toEqual([sha256('33612345678')])
    expect(out.fn).toEqual([sha256('eric')])
    expect(out.ct).toEqual([sha256('saintdenis')])
    expect(out.zp).toEqual([sha256('93200')])
    expect(out.country).toEqual([sha256('fr')])
    // Cookies et contexte réseau ne sont jamais hachés (spec Meta).
    expect(out.fbp).toBe('fb.1.123.456')
    expect(out.fbc).toBe('fb.1.123.abc')
    expect(out.client_ip_address).toBe('1.2.3.4')
    expect(out.client_user_agent).toBe('Mozilla/5.0')
  })

  it('omet les champs absents plutôt que d\'envoyer des valeurs vides', () => {
    const out = buildGraphUserData({ email: 'a@b.fr' })
    expect(out.ph).toBeUndefined()
    expect(out.zp).toBeUndefined()
  })
})

describe('sendMetaEvent', () => {
  it('no-op silencieux quand la CAPI n\'est pas configurée', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const result = await sendMetaEvent({
      eventName: 'Lead',
      eventId: 'evt-1234',
      userData: { email: 'a@b.fr' },
    })

    expect(result).toEqual({ sent: false, reason: 'not_configured' })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('n\'envoie rien si aucun identifiant exploitable', async () => {
    configure()
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const result = await sendMetaEvent({
      eventName: 'Lead',
      eventId: 'evt-1234',
      // IP/UA seuls ne constituent pas un identifiant de correspondance.
      userData: { clientIpAddress: '1.2.3.4', clientUserAgent: 'UA' },
    })

    expect(result).toEqual({ sent: false, reason: 'no_identifier' })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('poste un événement complet avec event_id de déduplication', async () => {
    configure()
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ events_received: 1 }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await sendMetaEvent({
      eventName: 'Lead',
      eventId: 'evt-dedup-1',
      eventSourceUrl: 'https://servicesartisans.fr/artisans',
      userData: { email: 'a@b.fr', phone: '0612345678' },
      customData: { content_name: 'plombier' },
    })

    expect(result).toEqual({ sent: true, eventsReceived: 1 })

    const [url] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://graph.facebook.com/v26.0/1234567890/events')

    const body = lastFetchBody(fetchMock)
    expect(body.access_token).toBe('test-token')
    expect(body.test_event_code).toBeUndefined()
    expect(body.data).toHaveLength(1)

    const event = body.data[0]
    expect(event.event_name).toBe('Lead')
    expect(event.event_id).toBe('evt-dedup-1')
    expect(event.action_source).toBe('website')
    expect(event.event_source_url).toBe('https://servicesartisans.fr/artisans')
    expect(event.custom_data).toEqual({ content_name: 'plombier' })
    expect(typeof event.event_time).toBe('number')
  })

  it('n\'envoie jamais de PII en clair', async () => {
    configure()
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) })
    vi.stubGlobal('fetch', fetchMock)

    await sendMetaEvent({
      eventName: 'Lead',
      eventId: 'evt-pii',
      userData: { email: 'marvin@test.fr', phone: '0612345678', firstName: 'Marvin' },
    })

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    const raw = init.body as string
    expect(raw).not.toContain('marvin@test.fr')
    expect(raw).not.toContain('0612345678')
    expect(raw).not.toContain('33612345678')
    expect(raw).not.toContain('Marvin')
  })

  it('utilise la version Graph API et le test_event_code de l\'environnement', async () => {
    configure()
    process.env.META_GRAPH_API_VERSION = 'v25.0'
    process.env.META_TEST_EVENT_CODE = 'TEST12345'
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) })
    vi.stubGlobal('fetch', fetchMock)

    await sendMetaEvent({
      eventName: 'Lead',
      eventId: 'evt-version',
      userData: { email: 'a@b.fr' },
    })

    const [url] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('/v25.0/')
    expect(lastFetchBody(fetchMock).test_event_code).toBe('TEST12345')
  })

  it('retombe sur NEXT_PUBLIC_META_PIXEL_ID si META_DATASET_ID est absent', async () => {
    process.env.META_CAPI_ACCESS_TOKEN = 'test-token'
    process.env.NEXT_PUBLIC_META_PIXEL_ID = '999888777'
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) })
    vi.stubGlobal('fetch', fetchMock)

    await sendMetaEvent({
      eventName: 'Lead',
      eventId: 'evt-fallback',
      userData: { email: 'a@b.fr' },
    })

    const [url] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('/999888777/events')
  })

  it('ne lève pas quand Meta répond une erreur HTTP', async () => {
    configure()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: { message: 'Invalid parameter', code: 100 } }),
      })
    )

    await expect(
      sendMetaEvent({ eventName: 'Lead', eventId: 'evt-err', userData: { email: 'a@b.fr' } })
    ).resolves.toEqual({ sent: false, reason: 'http_error' })
  })

  it('ne lève pas quand le réseau échoue', async () => {
    configure()
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ECONNRESET')))

    await expect(
      sendMetaEvent({ eventName: 'Lead', eventId: 'evt-net', userData: { email: 'a@b.fr' } })
    ).resolves.toEqual({ sent: false, reason: 'network_error' })
  })
})

describe('getClientContext', () => {
  it('prend la première IP de x-forwarded-for', () => {
    const request = new Request('https://servicesartisans.fr', {
      headers: { 'x-forwarded-for': '1.2.3.4, 10.0.0.1', 'user-agent': 'UA' },
    })
    expect(getClientContext(request)).toEqual({
      clientIpAddress: '1.2.3.4',
      clientUserAgent: 'UA',
    })
  })

  it('retombe sur x-real-ip', () => {
    const request = new Request('https://servicesartisans.fr', {
      headers: { 'x-real-ip': '5.6.7.8' },
    })
    expect(getClientContext(request).clientIpAddress).toBe('5.6.7.8')
  })
})

describe('getFbCookies', () => {
  it('extrait _fbp et _fbc', () => {
    const request = new Request('https://servicesartisans.fr', {
      headers: { cookie: 'a=1; _fbp=fb.1.100.200; _fbc=fb.1.100.CLICKID; b=2' },
    })
    expect(getFbCookies(request)).toEqual({ fbp: 'fb.1.100.200', fbc: 'fb.1.100.CLICKID' })
  })

  it('retourne un objet vide sans cookies', () => {
    expect(getFbCookies(new Request('https://servicesartisans.fr'))).toEqual({})
  })
})
