-- Function to get member limit for a clinic based on plan
-- Starter: 2 members (Owner + 1)
-- Professional: 5 members
-- Enterprise: Unlimited (-1)
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
    WHEN 'starter' THEN RETURN 2; -- Owner + 1 Member
    WHEN 'professional' THEN RETURN 5;
    WHEN 'enterprise' THEN RETURN -1; -- Unlimited
    ELSE RETURN 2;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if clinic can add more members
-- Checks current members + pending invitations
CREATE OR REPLACE FUNCTION public.can_add_member(p_clinic_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_limit INTEGER;
  v_current_count INTEGER;
  v_pending_invites INTEGER;
BEGIN
  v_limit := get_member_limit(p_clinic_id);
  
  -- -1 means unlimited
  IF v_limit = -1 THEN
    RETURN TRUE;
  END IF;
  
  -- Count current members
  SELECT COUNT(*) INTO v_current_count
  FROM public.clinic_members
  WHERE clinic_id = p_clinic_id;
  
  -- Count pending invitations
  SELECT COUNT(*) INTO v_pending_invites
  FROM public.clinic_invitations
  WHERE clinic_id = p_clinic_id
  AND status = 'pending'
  AND expires_at > now();
  
  RETURN (v_current_count + v_pending_invites) < v_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION public.get_member_limit(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.can_add_member(UUID) TO authenticated, service_role;
