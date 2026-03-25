-- Migration 361: Expand devis_requests.urgency CHECK constraint
-- The old constraint only allowed ('normal', 'urgent', 'tres_urgent').
-- The dispatch function (202/303/304) already handles 'flexible', 'semaine', 'mois'.
-- We now store the actual urgency value instead of collapsing everything to 'normal'.

ALTER TABLE devis_requests
  DROP CONSTRAINT IF EXISTS devis_requests_urgency_check;

ALTER TABLE devis_requests
  ADD CONSTRAINT devis_requests_urgency_check
    CHECK (urgency IN ('normal', 'urgent', 'tres_urgent', 'semaine', 'mois', 'flexible'));
