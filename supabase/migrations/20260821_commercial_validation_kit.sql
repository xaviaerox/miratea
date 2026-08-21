-- Migration: 20260821_commercial_validation_kit.sql
-- Description: Analytics, Early Family Signups, and Feedback Validation Schema for MIRATEA

-- 1. ANALYTICS EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for analytics
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Families can insert their own analytics events"
  ON public.analytics_events
  FOR INSERT
  WITH CHECK (
    family_id IN (
      SELECT family_id FROM public.profiles WHERE id = auth.uid()
    ) OR family_id IS NULL
  );

CREATE POLICY "Families can select their own analytics events"
  ON public.analytics_events
  FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- 2. EARLY FAMILY LEADS TABLE
CREATE TABLE IF NOT EXISTS public.early_family_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_name TEXT NOT NULL,
  email TEXT NOT NULL,
  child_age TEXT,
  neurodivergence TEXT,
  billing_cycle TEXT DEFAULT 'monthly',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for leads
ALTER TABLE public.early_family_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit early family lead"
  ON public.early_family_leads
  FOR INSERT
  WITH CHECK (true);

-- 3. FEEDBACK RESPONSES TABLE
CREATE TABLE IF NOT EXISTS public.feedback_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
  feedback_type TEXT NOT NULL,
  value_rating INT,
  disappear_impact TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.feedback_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Families can submit feedback"
  ON public.feedback_responses
  FOR INSERT
  WITH CHECK (
    family_id IN (
      SELECT family_id FROM public.profiles WHERE id = auth.uid()
    ) OR family_id IS NULL
  );
