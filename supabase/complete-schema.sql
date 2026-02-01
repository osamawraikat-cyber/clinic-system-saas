-- =====================================================
-- COMPLETE DATABASE SCHEMA FOR CLINIC MANAGEMENT SYSTEM
-- This includes tables from all 3 agents
-- =====================================================

-- Appointments table (Agent 2's responsibility)
CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Visits table (Agent 2's responsibility)
CREATE TABLE IF NOT EXISTS visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  visit_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  symptoms TEXT,
  diagnosis TEXT,
  doctor_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Procedures catalog table (Agent 2's responsibility)
CREATE TABLE IF NOT EXISTS procedures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  default_cost DECIMAL(10, 2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Visit Procedures junction table (links visits to procedures performed)
CREATE TABLE IF NOT EXISTS visit_procedures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  visit_id UUID REFERENCES visits(id) ON DELETE CASCADE,
  procedure_id UUID REFERENCES procedures(id) ON DELETE CASCADE,
  cost DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Invoices table (Agent 3 - Finance)
CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  visit_id UUID REFERENCES visits(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  invoice_number TEXT UNIQUE NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  amount_paid DECIMAL(10, 2) DEFAULT 0,
  status TEXT DEFAULT 'unpaid' CHECK (status IN ('paid', 'unpaid', 'partial')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Payments table (Agent 3 - Finance)
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('cash', 'mobile_money', 'card')),
  transaction_reference TEXT,
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security on all new tables
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create simple policies (allow all for authenticated users - suitable for single-user clinic)
DROP POLICY IF EXISTS "Allow all for all users" ON appointments;
DROP POLICY IF EXISTS "Allow all for all users" ON visits;
DROP POLICY IF EXISTS "Allow all for all users" ON procedures;
DROP POLICY IF EXISTS "Allow all for all users" ON visit_procedures;
DROP POLICY IF EXISTS "Allow all for all users" ON invoices;
DROP POLICY IF EXISTS "Allow all for all users" ON payments;

CREATE POLICY "Allow all for all users" ON appointments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for all users" ON visits FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for all users" ON procedures FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for all users" ON visit_procedures FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for all users" ON invoices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for all users" ON payments FOR ALL USING (true) WITH CHECK (true);

-- Insert some default procedures to get started
INSERT INTO procedures (name, default_cost, description) VALUES
  ('General Consultation', 2000, 'Standard patient consultation'),
  ('Follow-up Visit', 1000, 'Follow-up consultation'),
  ('Lab Test - Blood Work', 1500, 'Complete blood count'),
  ('X-Ray', 2500, 'X-ray imaging'),
  ('Vaccination', 500, 'Standard vaccination')
ON CONFLICT DO NOTHING;
