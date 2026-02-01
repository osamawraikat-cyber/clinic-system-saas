-- =====================================================
-- Phase 4: Billing & Subscriptions
-- Add subscriptions table for Stripe billing integration
-- =====================================================

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT DEFAULT 'starter' CHECK (plan IN ('starter', 'professional', 'enterprise')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'trialing')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  trial_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Tenant isolation for subscriptions
CREATE POLICY "Tenant Isolation Policy" ON subscriptions
  FOR ALL USING (clinic_id IN (SELECT get_my_clinic_ids()));

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_clinic_id ON subscriptions(clinic_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);

-- Function to get patient limit for a clinic based on plan
CREATE OR REPLACE FUNCTION get_patient_limit(p_clinic_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_plan TEXT;
BEGIN
  SELECT plan INTO v_plan
  FROM subscriptions
  WHERE clinic_id = p_clinic_id;
  
  -- Default to starter if no subscription found
  IF v_plan IS NULL THEN
    v_plan := 'starter';
  END IF;
  
  CASE v_plan
    WHEN 'starter' THEN RETURN 50;
    WHEN 'professional' THEN RETURN 500;
    WHEN 'enterprise' THEN RETURN -1; -- Unlimited
    ELSE RETURN 50;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if clinic can add more patients
CREATE OR REPLACE FUNCTION can_add_patient(p_clinic_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_limit INTEGER;
  v_current_count INTEGER;
BEGIN
  v_limit := get_patient_limit(p_clinic_id);
  
  -- -1 means unlimited
  IF v_limit = -1 THEN
    RETURN TRUE;
  END IF;
  
  -- Count current patients
  SELECT COUNT(*) INTO v_current_count
  FROM patients
  WHERE clinic_id = p_clinic_id;
  
  RETURN v_current_count < v_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function to enforce patient limit on insert
CREATE OR REPLACE FUNCTION enforce_patient_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT can_add_patient(NEW.clinic_id) THEN
    RAISE EXCEPTION 'Patient limit reached for your plan. Please upgrade to add more patients.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce patient limit
DROP TRIGGER IF EXISTS check_patient_limit ON patients;
CREATE TRIGGER check_patient_limit
  BEFORE INSERT ON patients
  FOR EACH ROW EXECUTE FUNCTION enforce_patient_limit();

-- Insert default starter subscription for existing clinics without one
INSERT INTO subscriptions (clinic_id, plan, status)
SELECT id, 'starter', 'active'
FROM clinics
WHERE id NOT IN (SELECT clinic_id FROM subscriptions WHERE clinic_id IS NOT NULL)
ON CONFLICT (clinic_id) DO NOTHING;
