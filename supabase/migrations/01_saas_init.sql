/* 
  SaaS Migration Script: Single-Tenant to Multi-Tenant (ClinicSaaS)
  Run this script in the Supabase Dashboard -> SQL Editor
  
  Safety: This script is designed to be non-destructive for existing data.
  It assigns all existing data and users to a new 'Default Clinic'.
*/

-- ==============================================================================
-- 1. Create Core Multi-Tenant Tables
-- ==============================================================================

-- Create Clinics Table
CREATE TABLE IF NOT EXISTS clinics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Clinic Members (Link Users -> Clinics)
CREATE TABLE IF NOT EXISTS clinic_members (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner', 'admin', 'doctor', 'staff')) DEFAULT 'staff',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (user_id, clinic_id) -- Efficient for "My Clinics" queries
);

-- Index for RLS performance
CREATE INDEX IF NOT EXISTS idx_clinic_members_clinic_id ON clinic_members(clinic_id);

-- ==============================================================================
-- 2. Seed Default Clinic & Assign Existing Users
-- ==============================================================================

DO $$
DECLARE
  default_clinic_id UUID;
BEGIN
  -- Create Default Clinic if none exists
  IF NOT EXISTS (SELECT 1 FROM clinics) THEN
    INSERT INTO clinics (name) VALUES ('Default Clinic') RETURNING id INTO default_clinic_id;
  ELSE
    SELECT id INTO default_clinic_id FROM clinics LIMIT 1;
  END IF;

  -- Auto-assign ALL existing users to the default clinic as owners
  -- This prevents existing users from being locked out by RLS
  INSERT INTO clinic_members (clinic_id, user_id, role)
  SELECT default_clinic_id, id, 'owner'
  FROM auth.users
  ON CONFLICT DO NOTHING;

  -- ============================================================================
  -- 3. Add clinic_id to Logic Tables (with Data Migration)
  -- ============================================================================

  -- List of tables to update
  -- patients, appointments, visits, procedures, visit_procedures, invoices, payments

  -- Patients
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'clinic_id') THEN
    ALTER TABLE patients ADD COLUMN clinic_id UUID REFERENCES clinics(id);
    UPDATE patients SET clinic_id = default_clinic_id WHERE clinic_id IS NULL;
    ALTER TABLE patients ALTER COLUMN clinic_id SET NOT NULL;
  END IF;

  -- Appointments
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'clinic_id') THEN
    ALTER TABLE appointments ADD COLUMN clinic_id UUID REFERENCES clinics(id);
    UPDATE appointments SET clinic_id = default_clinic_id WHERE clinic_id IS NULL;
    ALTER TABLE appointments ALTER COLUMN clinic_id SET NOT NULL;
  END IF;
  
  -- Visits
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'visits' AND column_name = 'clinic_id') THEN
    ALTER TABLE visits ADD COLUMN clinic_id UUID REFERENCES clinics(id);
    UPDATE visits SET clinic_id = default_clinic_id WHERE clinic_id IS NULL;
    ALTER TABLE visits ALTER COLUMN clinic_id SET NOT NULL;
  END IF;

  -- Procedures
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'procedures' AND column_name = 'clinic_id') THEN
    ALTER TABLE procedures ADD COLUMN clinic_id UUID REFERENCES clinics(id);
    UPDATE procedures SET clinic_id = default_clinic_id WHERE clinic_id IS NULL;
    ALTER TABLE procedures ALTER COLUMN clinic_id SET NOT NULL;
  END IF;

  -- Visit Procedures
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'visit_procedures' AND column_name = 'clinic_id') THEN
    ALTER TABLE visit_procedures ADD COLUMN clinic_id UUID REFERENCES clinics(id);
    UPDATE visit_procedures SET clinic_id = default_clinic_id WHERE clinic_id IS NULL;
    ALTER TABLE visit_procedures ALTER COLUMN clinic_id SET NOT NULL;
  END IF;

  -- Invoices
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'clinic_id') THEN
    ALTER TABLE invoices ADD COLUMN clinic_id UUID REFERENCES clinics(id);
    UPDATE invoices SET clinic_id = default_clinic_id WHERE clinic_id IS NULL;
    ALTER TABLE invoices ALTER COLUMN clinic_id SET NOT NULL;
  END IF;

  -- Payments
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'clinic_id') THEN
    ALTER TABLE payments ADD COLUMN clinic_id UUID REFERENCES clinics(id);
    UPDATE payments SET clinic_id = default_clinic_id WHERE clinic_id IS NULL;
    ALTER TABLE payments ALTER COLUMN clinic_id SET NOT NULL;
  END IF;

  -- ============================================================================
  -- 4. Unique Constraints per Clinic
  -- ============================================================================

  -- Invoices: invoice_number should be unique per clinic, not globally
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'invoices_invoice_number_key') THEN
    ALTER TABLE invoices DROP CONSTRAINT invoices_invoice_number_key;
    ALTER TABLE invoices ADD CONSTRAINT invoices_invoice_number_clinic_key UNIQUE (clinic_id, invoice_number);
  END IF;

END $$;

-- ==============================================================================
-- 5. Helper Function for RLS
-- ==============================================================================

-- Secure function to get current user's clinic IDs (bypasses RLS to avoid recursion)
CREATE OR REPLACE FUNCTION get_my_clinic_ids()
RETURNS SETOF UUID AS $$
  SELECT clinic_id FROM clinic_members WHERE user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER;

-- ==============================================================================
-- 6. Enable Row Level Security (RLS) & Policies
-- ==============================================================================

ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_members ENABLE ROW LEVEL SECURITY;

-- Drop old "allow all" policies
DROP POLICY IF EXISTS "Allow all for all users" ON appointments;
DROP POLICY IF EXISTS "Allow all for all users" ON visits;
DROP POLICY IF EXISTS "Allow all for all users" ON procedures;
DROP POLICY IF EXISTS "Allow all for all users" ON visit_procedures;
DROP POLICY IF EXISTS "Allow all for all users" ON invoices;
DROP POLICY IF EXISTS "Allow all for all users" ON payments;
DROP POLICY IF EXISTS "Allow all for all users" ON patients; -- Assuming existence

-- 6.1 Administration Policies

-- Users see clinics they belong to
CREATE POLICY "Users can view their own clinic" ON clinics
FOR SELECT USING (
  id IN (SELECT get_my_clinic_ids())
);

-- Users see their own membership
CREATE POLICY "Users can view their own memberships" ON clinic_members
FOR SELECT USING (
  user_id = auth.uid()
);

-- 6.2 Data Isolation Policies (The Magic)
-- Only allow access if the record's clinic_id matches one of the user's clinics

CREATE POLICY "Tenant Isolation Policy" ON patients
FOR ALL USING (clinic_id IN (SELECT get_my_clinic_ids()));

CREATE POLICY "Tenant Isolation Policy" ON appointments
FOR ALL USING (clinic_id IN (SELECT get_my_clinic_ids()));

CREATE POLICY "Tenant Isolation Policy" ON visits
FOR ALL USING (clinic_id IN (SELECT get_my_clinic_ids()));

CREATE POLICY "Tenant Isolation Policy" ON procedures
FOR ALL USING (clinic_id IN (SELECT get_my_clinic_ids()));

CREATE POLICY "Tenant Isolation Policy" ON visit_procedures
FOR ALL USING (clinic_id IN (SELECT get_my_clinic_ids()));

CREATE POLICY "Tenant Isolation Policy" ON invoices
FOR ALL USING (clinic_id IN (SELECT get_my_clinic_ids()));

CREATE POLICY "Tenant Isolation Policy" ON payments
FOR ALL USING (clinic_id IN (SELECT get_my_clinic_ids()));

-- ==============================================================================
-- 7. Smart Triggers (Backward Compatibility)
-- Allows current app code (which doesn't send clinic_id) to keep working
-- by auto-injecting the user's clinic_id on insert.
-- ==============================================================================

CREATE OR REPLACE FUNCTION auto_assign_clinic_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.clinic_id IS NULL THEN
    -- Assign to the user's first clinic
    SELECT clinic_id INTO NEW.clinic_id
    FROM clinic_members
    WHERE user_id = auth.uid()
    LIMIT 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply triggers to all core tables
DROP TRIGGER IF EXISTS set_clinic_id_patients ON patients;
CREATE TRIGGER set_clinic_id_patients BEFORE INSERT ON patients FOR EACH ROW EXECUTE FUNCTION auto_assign_clinic_id();

DROP TRIGGER IF EXISTS set_clinic_id_appointments ON appointments;
CREATE TRIGGER set_clinic_id_appointments BEFORE INSERT ON appointments FOR EACH ROW EXECUTE FUNCTION auto_assign_clinic_id();

DROP TRIGGER IF EXISTS set_clinic_id_visits ON visits;
CREATE TRIGGER set_clinic_id_visits BEFORE INSERT ON visits FOR EACH ROW EXECUTE FUNCTION auto_assign_clinic_id();

DROP TRIGGER IF EXISTS set_clinic_id_invoices ON invoices;
CREATE TRIGGER set_clinic_id_invoices BEFORE INSERT ON invoices FOR EACH ROW EXECUTE FUNCTION auto_assign_clinic_id();

DROP TRIGGER IF EXISTS set_clinic_id_payments ON payments;
CREATE TRIGGER set_clinic_id_payments BEFORE INSERT ON payments FOR EACH ROW EXECUTE FUNCTION auto_assign_clinic_id();

DROP TRIGGER IF EXISTS set_clinic_id_procedures ON procedures;
CREATE TRIGGER set_clinic_id_procedures BEFORE INSERT ON procedures FOR EACH ROW EXECUTE FUNCTION auto_assign_clinic_id();

DROP TRIGGER IF EXISTS set_clinic_id_visit_procedures ON visit_procedures;
CREATE TRIGGER set_clinic_id_visit_procedures BEFORE INSERT ON visit_procedures FOR EACH ROW EXECUTE FUNCTION auto_assign_clinic_id();
