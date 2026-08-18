-- ============================================================
-- MIRA — Migration 008: Parent PIN Hash for Re-authentication
-- Adds parent_pin_hash column to profiles table
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS parent_pin_hash TEXT;

-- Default PIN hash for demo / initial setup (SHA-256 for '1234')
-- sha256('1234') = '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4'
UPDATE profiles
  SET parent_pin_hash = '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4'
  WHERE role = 'parent' AND parent_pin_hash IS NULL;
