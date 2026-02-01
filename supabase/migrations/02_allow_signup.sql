-- ==============================================================================
-- FIX: Enable Clinic Creation for New Users
-- ==============================================================================

-- 1. Allow any authenticated user to create a NEW clinic
CREATE POLICY "Enable insert for authenticated users" ON clinics
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 2. Allow users to add THEMSELVES to a clinic (e.g. as Owner)
CREATE POLICY "Enable insert for own membership" ON clinic_members
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Optional: Ensure select is also allowed for what they just created (already covered by get_my_clinic_ids, but good to double check)
