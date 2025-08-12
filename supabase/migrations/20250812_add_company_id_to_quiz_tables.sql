-- Add company_id to quiz_assignments and quiz_responses tables
-- Version: 1.0.2
-- Created: 2025-08-12

-- Add company_id to quiz_assignments table
ALTER TABLE quiz_assignments 
ADD COLUMN IF NOT EXISTS company_id UUID DEFAULT '00000000-0000-0000-0000-000000000001';

-- Add company_id to quiz_responses table
ALTER TABLE quiz_responses 
ADD COLUMN IF NOT EXISTS company_id UUID DEFAULT '00000000-0000-0000-0000-000000000001';

-- Add indexes for company_id columns
CREATE INDEX IF NOT EXISTS idx_quiz_assignments_company ON quiz_assignments(company_id);
CREATE INDEX IF NOT EXISTS idx_quiz_responses_company ON quiz_responses(company_id);

-- Update existing records to have the default company_id
UPDATE quiz_assignments 
SET company_id = '00000000-0000-0000-0000-000000000001' 
WHERE company_id IS NULL;

UPDATE quiz_responses 
SET company_id = '00000000-0000-0000-0000-000000000001' 
WHERE company_id IS NULL;

-- Add comments
COMMENT ON COLUMN quiz_assignments.company_id IS 'Company ID for multi-tenant support';
COMMENT ON COLUMN quiz_responses.company_id IS 'Company ID for multi-tenant support';
