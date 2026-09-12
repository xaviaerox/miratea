-- ============================================================
-- MIRA — Migration 20260912: Family Subscriptions & Early Access
-- ============================================================

-- 1. FUNCTION TO SECURELY GET TOTAL FAMILY COUNT (FOR LANDING COUNTER)
CREATE OR REPLACE FUNCTION get_family_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*)::INTEGER FROM public.families);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_family_count() TO anon, authenticated, service_role;

-- 2. FAMILY SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.family_subscriptions (
  family_id UUID PRIMARY KEY REFERENCES public.families(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'early_access', 'premium_monthly', 'premium_annual')) DEFAULT 'free',
  status TEXT NOT NULL CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'incomplete')) DEFAULT 'active',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.family_subscriptions ENABLE ROW LEVEL SECURITY;

-- Members can view their family subscription
DROP POLICY IF EXISTS "family_subscriptions: members read own" ON public.family_subscriptions;
CREATE POLICY "family_subscriptions: members read own" ON public.family_subscriptions
  FOR SELECT USING (
    family_id = get_my_family_id()
  );

-- Service role and parents can update family subscription
DROP POLICY IF EXISTS "family_subscriptions: parent update" ON public.family_subscriptions;
CREATE POLICY "family_subscriptions: parent update" ON public.family_subscriptions
  FOR ALL USING (
    family_id = get_my_family_id() AND is_parent()
  );

-- 3. TRIGGER TO AUTOMATICALLY ASSIGN EARLY ACCESS TO THE FIRST 20 FAMILIES
CREATE OR REPLACE FUNCTION on_family_created_assign_subscription()
RETURNS TRIGGER AS $$
DECLARE
  v_family_count INTEGER;
  v_assigned_plan TEXT;
BEGIN
  SELECT COUNT(*)::INTEGER INTO v_family_count FROM public.families;
  
  -- If total count of families is 20 or less, grant lifetime Early Access Free
  IF v_family_count <= 20 THEN
    v_assigned_plan := 'early_access';
  ELSE
    v_assigned_plan := 'free';
  END IF;

  INSERT INTO public.family_subscriptions (
    family_id,
    plan,
    status
  ) VALUES (
    NEW.id,
    v_assigned_plan,
    'active'
  )
  ON CONFLICT (family_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_assign_family_subscription ON public.families;
CREATE TRIGGER trigger_assign_family_subscription
  AFTER INSERT ON public.families
  FOR EACH ROW
  EXECUTE FUNCTION on_family_created_assign_subscription();

-- Backfill existing families if any
INSERT INTO public.family_subscriptions (family_id, plan, status)
SELECT id, 'early_access', 'active'
FROM public.families
ON CONFLICT (family_id) DO NOTHING;
