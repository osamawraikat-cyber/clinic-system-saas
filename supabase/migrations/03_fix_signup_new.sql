-- ==============================================================================
-- FIX: Secure Clinic Creation RPC
-- ==============================================================================

CREATE OR REPLACE FUNCTION create_clinic_complete(clinic_name TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with privileges of the creator (postgres), bypassing RLS
SET search_path = public -- Secure search path
AS $$
DECLARE
  new_clinic_id UUID;
BEGIN
  -- 1. Create the Clinic
  INSERT INTO clinics (name)
  VALUES (clinic_name)
  RETURNING id INTO new_clinic_id;

  -- 2. Link the Current User as Owner
  INSERT INTO clinic_members (user_id, clinic_id, role)
  VALUES (auth.uid(), new_clinic_id, 'owner');

  RETURN new_clinic_id;
END;
$$;
