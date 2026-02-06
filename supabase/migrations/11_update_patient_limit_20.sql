-- Update get_patient_limit to reduce Starter plan limit to 20
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
    WHEN 'starter' THEN RETURN 20;
    WHEN 'professional' THEN RETURN 500;
    WHEN 'enterprise' THEN RETURN -1; -- Unlimited
    ELSE RETURN 20;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
