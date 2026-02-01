-- Add currency column to clinics table
ALTER TABLE clinics 
ADD COLUMN IF NOT EXISTS currency text DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS currency_symbol text DEFAULT '$';

-- Update existing rows to have default values if null (redundant due to default but good for safety)
UPDATE clinics SET currency = 'USD', currency_symbol = '$' WHERE currency IS NULL;
