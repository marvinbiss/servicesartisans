-- Migration 019: Atomic Booking Function
-- Prevents double booking with transaction lock

CREATE OR REPLACE FUNCTION create_booking_atomic(
  p_artisan_id UUID,
  p_slot_id UUID,
  p_client_name TEXT,
  p_client_phone TEXT,
  p_client_email TEXT,
  p_service_description TEXT DEFAULT NULL,
  p_address TEXT DEFAULT NULL,
  p_payment_intent_id TEXT DEFAULT NULL,
  p_deposit_amount INTEGER DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  v_booking_id UUID;
  v_slot RECORD;
  v_existing_booking RECORD;
BEGIN
  -- Acquire advisory lock on the slot to prevent race conditions
  PERFORM pg_advisory_xact_lock(hashtext(p_slot_id::text));

  -- Check if slot exists and is available
  SELECT * INTO v_slot
  FROM availability_slots
  WHERE id = p_slot_id
    AND artisan_id = p_artisan_id
    AND is_available = true
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'SLOT_UNAVAILABLE',
      'message', 'Ce créneau n''est plus disponible'
    );
  END IF;

  -- Check for existing booking on this slot
  SELECT id INTO v_existing_booking
  FROM bookings
  WHERE slot_id = p_slot_id
    AND status IN ('confirmed', 'pending')
  LIMIT 1;

  IF FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'SLOT_ALREADY_BOOKED',
      'message', 'Ce créneau est déjà réservé'
    );
  END IF;

  -- Check for duplicate booking by same client
  SELECT id INTO v_existing_booking
  FROM bookings
  WHERE slot_id = p_slot_id
    AND LOWER(client_email) = LOWER(p_client_email)
    AND status = 'confirmed'
  LIMIT 1;

  IF FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'DUPLICATE_BOOKING',
      'message', 'Vous avez déjà une réservation pour ce créneau'
    );
  END IF;

  -- Create the booking
  INSERT INTO bookings (
    artisan_id,
    slot_id,
    client_name,
    client_phone,
    client_email,
    service_description,
    address,
    payment_intent_id,
    deposit_amount,
    status,
    created_at
  ) VALUES (
    p_artisan_id,
    p_slot_id,
    p_client_name,
    p_client_phone,
    LOWER(p_client_email),
    p_service_description,
    p_address,
    p_payment_intent_id,
    p_deposit_amount,
    'confirmed',
    NOW()
  )
  RETURNING id INTO v_booking_id;

  -- Mark slot as unavailable
  UPDATE availability_slots
  SET is_available = false
  WHERE id = p_slot_id;

  -- Return success with booking info
  RETURN json_build_object(
    'success', true,
    'booking_id', v_booking_id,
    'slot', json_build_object(
      'id', v_slot.id,
      'date', v_slot.date,
      'start_time', v_slot.start_time,
      'end_time', v_slot.end_time
    )
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'DATABASE_ERROR',
      'message', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create index for better performance on slot lookups
CREATE INDEX IF NOT EXISTS idx_bookings_slot_status ON bookings(slot_id, status);
CREATE INDEX IF NOT EXISTS idx_availability_slots_artisan_available ON availability_slots(artisan_id, is_available, date);

-- Webhook events table for idempotency
CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stripe_event_id TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'processing',
    payload JSONB,
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_stripe_id ON webhook_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON webhook_events(status);
