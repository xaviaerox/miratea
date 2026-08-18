-- ============================================================
-- MIRA — Migration 009: PIN Reset Crypto Token & Expirations
-- Adds pin_reset_token and pin_reset_expires_at to profiles
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS pin_reset_token TEXT,
  ADD COLUMN IF NOT EXISTS pin_reset_expires_at TIMESTAMPTZ;
