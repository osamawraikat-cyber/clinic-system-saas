-- Trigger to automatically create a clinic for new users
-- and assign them as owner.

-- 1. Create the function that the trigger will call
CREATE OR REPLACE FUNCTION public.handle_new_user_clinic()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  new_clinic_id UUID;
BEGIN
  -- Create a default "My Clinic" for the new user
  INSERT INTO public.clinics (name)
  VALUES ('My Clinic')
  RETURNING id INTO new_clinic_id;

  -- Add the user as an owner of this new clinic
  INSERT INTO public.clinic_members (user_id, clinic_id, role)
  VALUES (NEW.id, new_clinic_id, 'owner');

  RETURN NEW;
END;
$$;

-- 2. Create the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created_clinic ON auth.users;
CREATE TRIGGER on_auth_user_created_clinic
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_clinic();

-- 3. ONE-TIME FIX: For existing users who have NO clinic membership
-- This fixes the issue for the current user if they are stuck
DO $$
DECLARE
  user_rec RECORD;
  new_clinic_id UUID;
BEGIN
  FOR user_rec IN 
    SELECT id FROM auth.users u
    WHERE NOT EXISTS (SELECT 1 FROM public.clinic_members cm WHERE cm.user_id = u.id)
  LOOP
    -- Create clinic for this orphaned user
    INSERT INTO public.clinics (name)
    VALUES ('My Clinic')
    RETURNING id INTO new_clinic_id;

    -- Assign membership
    INSERT INTO public.clinic_members (user_id, clinic_id, role)
    VALUES (user_rec.id, new_clinic_id, 'owner');
    
    RAISE NOTICE 'Fixed orphaned user: %', user_rec.id;
  END LOOP;
END $$;
