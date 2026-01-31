/**
 * Video Consultation API - ServicesArtisans
 * Manages video rooms for bookings
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'
import {
  createVideoRoom,
  createMeetingToken,
  deleteVideoRoom,
  getRoomInfo,
} from '@/lib/video/daily-client'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST /api/video - Create video room for a booking
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { bookingId, userId, userName, isArtisan } = body

    if (!bookingId || !userId || !userName) {
      return NextResponse.json(
        { error: 'bookingId, userId, and userName are required' },
        { status: 400 }
      )
    }

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        id,
        artisan_id,
        client_email,
        service_description,
        slot:availability_slots(date, start_time, end_time)
      `)
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Check if video is enabled for this booking
    const { data: artisan } = await supabase
      .from('profiles')
      .select('full_name, company_name, video_enabled')
      .eq('id', booking.artisan_id)
      .single()

    const slot = booking.slot as any
    const scheduledTime = new Date(`${slot.date}T${slot.start_time}`)

    // Check if there's already a video room for this booking
    let { data: existingRoom } = await supabase
      .from('video_rooms')
      .select('room_url, room_name')
      .eq('booking_id', bookingId)
      .single()

    let roomUrl: string
    let roomName: string

    if (existingRoom) {
      roomUrl = existingRoom.room_url
      roomName = existingRoom.room_name
    } else {
      // Create new video room
      const roomResult = await createVideoRoom(
        bookingId,
        artisan?.company_name || artisan?.full_name || 'Artisan',
        userName,
        scheduledTime,
        60 // 60 minutes default duration
      )

      roomUrl = roomResult.roomUrl
      roomName = roomResult.roomName

      // Save room to database
      await supabase.from('video_rooms').insert({
        booking_id: bookingId,
        room_url: roomUrl,
        room_name: roomName,
        created_by: userId,
      })
    }

    // Create meeting token for this user
    const token = await createMeetingToken(
      roomName,
      userId,
      userName,
      isArtisan, // Artisan is owner
      120 // 2 hour token validity
    )

    return NextResponse.json({
      roomUrl,
      roomName,
      token,
      scheduledTime: scheduledTime.toISOString(),
    })
  } catch (error) {
    logger.error('Video API error:', error)
    return NextResponse.json(
      { error: 'Failed to create video session' },
      { status: 500 }
    )
  }
}

// DELETE /api/video - End video room
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get('bookingId')

    if (!bookingId) {
      return NextResponse.json(
        { error: 'bookingId is required' },
        { status: 400 }
      )
    }

    // Get room info
    const { data: room } = await supabase
      .from('video_rooms')
      .select('room_name')
      .eq('booking_id', bookingId)
      .single()

    if (room) {
      // Delete from Daily.co
      await deleteVideoRoom(room.room_name)

      // Update database
      await supabase
        .from('video_rooms')
        .update({ ended_at: new Date().toISOString() })
        .eq('booking_id', bookingId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Video DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to end video session' },
      { status: 500 }
    )
  }
}

// GET /api/video - Check if video room exists
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get('bookingId')

    if (!bookingId) {
      return NextResponse.json(
        { error: 'bookingId is required' },
        { status: 400 }
      )
    }

    const { data: room } = await supabase
      .from('video_rooms')
      .select('*')
      .eq('booking_id', bookingId)
      .is('ended_at', null)
      .single()

    if (!room) {
      return NextResponse.json({ exists: false })
    }

    // Check if room still exists on Daily.co
    const roomInfo = await getRoomInfo(room.room_name)

    return NextResponse.json({
      exists: !!roomInfo,
      roomUrl: room.room_url,
      roomName: room.room_name,
    })
  } catch (error) {
    logger.error('Video GET error:', error)
    return NextResponse.json(
      { error: 'Failed to check video room' },
      { status: 500 }
    )
  }
}
