/**
 * Daily.co Video Consultation Client - ServicesArtisans
 * World-class video calling like Doctolib
 */

// Daily.co API configuration
const DAILY_API_KEY = process.env.DAILY_API_KEY
const DAILY_REST_DOMAIN = 'https://api.daily.co/v1'

export interface RoomConfig {
  name: string
  privacy?: 'public' | 'private'
  expiryMinutes?: number
  maxParticipants?: number
  enableChat?: boolean
  enableScreenShare?: boolean
  enableRecording?: boolean
  startVideoOff?: boolean
  startAudioOff?: boolean
}

export interface Room {
  id: string
  name: string
  url: string
  createdAt: string
  config: RoomConfig
}

export interface Participant {
  id: string
  userId: string
  userName: string
  joinedAt: string
  audio: boolean
  video: boolean
  screenShare: boolean
}

// Create a video room for a booking
export async function createVideoRoom(
  bookingId: string,
  _artisanName: string,
  _clientName: string,
  scheduledTime: Date,
  durationMinutes: number = 60
): Promise<{ roomUrl: string; roomName: string }> {
  const roomName = `booking-${bookingId.slice(0, 8)}`

  // Calculate expiry (scheduled time + duration + 30min buffer)
  const expiryTime = new Date(scheduledTime)
  expiryTime.setMinutes(expiryTime.getMinutes() + durationMinutes + 30)

  const response = await fetch(`${DAILY_REST_DOMAIN}/rooms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DAILY_API_KEY}`,
    },
    body: JSON.stringify({
      name: roomName,
      privacy: 'private',
      properties: {
        exp: Math.floor(expiryTime.getTime() / 1000),
        max_participants: 10,
        enable_chat: true,
        enable_screenshare: true,
        enable_recording: 'cloud',
        start_video_off: false,
        start_audio_off: false,
        eject_at_room_exp: true,
        lang: 'fr',
      },
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Failed to create video room: ${error.error || 'Unknown error'}`)
  }

  const room = await response.json()

  return {
    roomUrl: room.url,
    roomName: room.name,
  }
}

// Create a meeting token for a participant
export async function createMeetingToken(
  roomName: string,
  userId: string,
  userName: string,
  isOwner: boolean = false,
  expiryMinutes: number = 120
): Promise<string> {
  const expiryTime = new Date()
  expiryTime.setMinutes(expiryTime.getMinutes() + expiryMinutes)

  const response = await fetch(`${DAILY_REST_DOMAIN}/meeting-tokens`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DAILY_API_KEY}`,
    },
    body: JSON.stringify({
      properties: {
        room_name: roomName,
        user_id: userId,
        user_name: userName,
        is_owner: isOwner,
        exp: Math.floor(expiryTime.getTime() / 1000),
        enable_screenshare: true,
        start_video_off: false,
        start_audio_off: false,
      },
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Failed to create meeting token: ${error.error || 'Unknown error'}`)
  }

  const { token } = await response.json()
  return token
}

// Delete a video room
export async function deleteVideoRoom(roomName: string): Promise<void> {
  const response = await fetch(`${DAILY_REST_DOMAIN}/rooms/${roomName}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${DAILY_API_KEY}`,
    },
  })

  if (!response.ok && response.status !== 404) {
    const error = await response.json()
    throw new Error(`Failed to delete video room: ${error.error || 'Unknown error'}`)
  }
}

// Get room info
export async function getRoomInfo(roomName: string): Promise<Room | null> {
  const response = await fetch(`${DAILY_REST_DOMAIN}/rooms/${roomName}`, {
    headers: {
      Authorization: `Bearer ${DAILY_API_KEY}`,
    },
  })

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error('Failed to get room info')
  }

  return response.json()
}

// Get active participants in a room
export async function getActiveParticipants(roomName: string): Promise<Participant[]> {
  const response = await fetch(
    `${DAILY_REST_DOMAIN}/rooms/${roomName}/presence`,
    {
      headers: {
        Authorization: `Bearer ${DAILY_API_KEY}`,
      },
    }
  )

  if (!response.ok) {
    return []
  }

  const data = await response.json()
  return data.data || []
}

// Check if a room is active
export async function isRoomActive(roomName: string): Promise<boolean> {
  const participants = await getActiveParticipants(roomName)
  return participants.length > 0
}

// Get recording URL for a room
export async function getRecordings(roomName: string): Promise<string[]> {
  const response = await fetch(
    `${DAILY_REST_DOMAIN}/recordings?room_name=${roomName}`,
    {
      headers: {
        Authorization: `Bearer ${DAILY_API_KEY}`,
      },
    }
  )

  if (!response.ok) {
    return []
  }

  const data = await response.json() as { data?: Array<{ download_link: string }> }
  return data.data?.map((r) => r.download_link) || []
}
