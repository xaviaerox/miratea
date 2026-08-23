-- ============================================================
-- MIRA — Migration 20260823: Add Parent Legal Consent Tracking
-- ============================================================

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS consent_given BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS consent_timestamp TIMESTAMPTZ;

-- Update create_family_with_parent RPC to optionally support consent params
CREATE OR REPLACE FUNCTION create_family_with_parent(
  p_user_id           UUID,
  p_family_name       TEXT,
  p_display_name      TEXT,
  p_avatar_seed       TEXT DEFAULT NULL,
  p_consent_given     BOOLEAN DEFAULT TRUE,
  p_consent_timestamp TIMESTAMPTZ DEFAULT NOW()
) RETURNS families AS $$
DECLARE
  v_family families;
BEGIN
  INSERT INTO families (name)
  VALUES (p_family_name)
  RETURNING * INTO v_family;

  INSERT INTO profiles (id, family_id, role, display_name, avatar_seed, consent_given, consent_timestamp)
  VALUES (p_user_id, v_family.id, 'parent', p_display_name, p_avatar_seed, p_consent_given, p_consent_timestamp);

  RETURN v_family;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
