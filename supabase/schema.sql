-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  full_name TEXT NOT NULL,
  national_id TEXT,
  phone TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT,
  address TEXT,
  blood_group TEXT,
  medical_history TEXT,
  allergies TEXT
);

-- Enable RLS
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all actions for authenticated and anon users
DROP POLICY IF EXISTS "Allow all actions for authenticated users" ON patients;

CREATE POLICY "Allow all actions for all users" ON patients
  FOR ALL
  USING (true)
  WITH CHECK (true);
