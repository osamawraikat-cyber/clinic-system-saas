-- Update get_member_limit function
CREATE OR REPLACE FUNCTION public.get_member_limit(p_clinic_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_plan TEXT;
BEGIN
  SELECT plan INTO v_plan
  FROM public.subscriptions
  WHERE clinic_id = p_clinic_id;
  
  -- Default to starter if no subscription found
  IF v_plan IS NULL THEN
    v_plan := 'starter';
  END IF;
  
  CASE v_plan
    WHEN 'starter' THEN RETURN 1; -- Owner only
    WHEN 'professional' THEN RETURN 3; -- Owner + 2 members
    WHEN 'enterprise' THEN RETURN -1; -- Unlimited
    ELSE RETURN 1;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
