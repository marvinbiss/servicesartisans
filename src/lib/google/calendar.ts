import { google } from 'googleapis'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

// OAuth2 client configuration
export function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${SITE_URL}/api/google/callback`
  )
}

// Generate authorization URL
export function getAuthUrl(state: string): string {
  const oauth2Client = getOAuth2Client()

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ],
    state,
    prompt: 'consent', // Force consent to get refresh token
  })
}

// Exchange authorization code for tokens
export async function getTokensFromCode(code: string): Promise<{
  access_token: string
  refresh_token: string
  expiry_date: number
}> {
  const oauth2Client = getOAuth2Client()
  const { tokens } = await oauth2Client.getToken(code)

  return {
    access_token: tokens.access_token!,
    refresh_token: tokens.refresh_token!,
    expiry_date: tokens.expiry_date!,
  }
}

// Get authenticated calendar client
export function getCalendarClient(accessToken: string, refreshToken?: string) {
  const oauth2Client = getOAuth2Client()
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  })

  return google.calendar({ version: 'v3', auth: oauth2Client })
}

// Create calendar event for booking
export interface BookingEventData {
  summary: string
  description: string
  location?: string
  startDateTime: string // ISO string
  endDateTime: string // ISO string
  attendeeEmail?: string
  attendeeName?: string
}

export async function createBookingEvent(
  accessToken: string,
  refreshToken: string,
  eventData: BookingEventData
): Promise<string> {
  const calendar = getCalendarClient(accessToken, refreshToken)

  const event = {
    summary: eventData.summary,
    description: eventData.description,
    location: eventData.location,
    start: {
      dateTime: eventData.startDateTime,
      timeZone: 'Europe/Paris',
    },
    end: {
      dateTime: eventData.endDateTime,
      timeZone: 'Europe/Paris',
    },
    attendees: eventData.attendeeEmail
      ? [{ email: eventData.attendeeEmail, displayName: eventData.attendeeName }]
      : undefined,
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 }, // 24 hours before
        { method: 'popup', minutes: 60 }, // 1 hour before
      ],
    },
    colorId: '9', // Blue color
  }

  const response = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: event,
    sendUpdates: eventData.attendeeEmail ? 'all' : 'none',
  })

  return response.data.id!
}

// Update calendar event
export async function updateCalendarEvent(
  accessToken: string,
  refreshToken: string,
  eventId: string,
  eventData: Partial<BookingEventData>
): Promise<void> {
  const calendar = getCalendarClient(accessToken, refreshToken)

  const updateData: {
    summary?: string
    description?: string
    location?: string
    start?: { dateTime: string; timeZone: string }
    end?: { dateTime: string; timeZone: string }
  } = {}

  if (eventData.summary) updateData.summary = eventData.summary
  if (eventData.description) updateData.description = eventData.description
  if (eventData.location) updateData.location = eventData.location
  if (eventData.startDateTime) {
    updateData.start = {
      dateTime: eventData.startDateTime,
      timeZone: 'Europe/Paris',
    }
  }
  if (eventData.endDateTime) {
    updateData.end = {
      dateTime: eventData.endDateTime,
      timeZone: 'Europe/Paris',
    }
  }

  await calendar.events.patch({
    calendarId: 'primary',
    eventId,
    requestBody: updateData,
  })
}

// Delete calendar event
export async function deleteCalendarEvent(
  accessToken: string,
  refreshToken: string,
  eventId: string
): Promise<void> {
  const calendar = getCalendarClient(accessToken, refreshToken)

  await calendar.events.delete({
    calendarId: 'primary',
    eventId,
  })
}

// Google Calendar Event type
export interface CalendarEvent {
  id?: string | null
  summary?: string | null
  description?: string | null
  location?: string | null
  start?: { dateTime?: string | null; date?: string | null; timeZone?: string | null } | null
  end?: { dateTime?: string | null; date?: string | null; timeZone?: string | null } | null
  attendees?: Array<{ email?: string | null; displayName?: string | null }> | null
  status?: string | null
  created?: string | null
  updated?: string | null
}

// Get upcoming events
export async function getUpcomingEvents(
  accessToken: string,
  refreshToken: string,
  maxResults: number = 10
): Promise<CalendarEvent[]> {
  const calendar = getCalendarClient(accessToken, refreshToken)

  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin: new Date().toISOString(),
    maxResults,
    singleEvents: true,
    orderBy: 'startTime',
  })

  return response.data.items || []
}

// Check if tokens are expired
export function areTokensExpired(expiryDate: number): boolean {
  // Consider expired if less than 5 minutes remaining
  return Date.now() >= expiryDate - 5 * 60 * 1000
}

// Refresh access token
export async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string
  expiry_date: number
}> {
  const oauth2Client = getOAuth2Client()
  oauth2Client.setCredentials({ refresh_token: refreshToken })

  const { credentials } = await oauth2Client.refreshAccessToken()

  return {
    access_token: credentials.access_token!,
    expiry_date: credentials.expiry_date!,
  }
}

// Helper to create event from booking data
export function createEventFromBooking(booking: {
  clientName: string
  clientPhone?: string
  clientEmail?: string
  serviceName: string
  date: string
  startTime: string
  endTime: string
  artisanName: string
}): BookingEventData {
  const startDateTime = new Date(`${booking.date}T${booking.startTime}:00`).toISOString()
  const endDateTime = new Date(`${booking.date}T${booking.endTime}:00`).toISOString()

  return {
    summary: `RDV: ${booking.clientName} - ${booking.serviceName}`,
    description: `Client: ${booking.clientName}
Téléphone: ${booking.clientPhone || 'Non renseigné'}
Email: ${booking.clientEmail || 'Non renseigné'}
Service: ${booking.serviceName}

Réservé via ServicesArtisans`,
    startDateTime,
    endDateTime,
    attendeeEmail: booking.clientEmail,
    attendeeName: booking.clientName,
  }
}
