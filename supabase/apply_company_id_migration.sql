-- Apply company_id migration for quiz tables
-- This script adds company_id columns to quiz_assignments and quiz_responses tables

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

-- Verify the changes
SELECT 
    'quiz_assignments' as table_name,
    COUNT(*) as total_records,
    COUNT(company_id) as records_with_company_id
FROM quiz_assignments
UNION ALL
SELECT 
    'quiz_responses' as table_name,
    COUNT(*) as total_records,
    COUNT(company_id) as records_with_company_id
FROM quiz_responses;

-- Show table structure
\d quiz_assignments;
\d quiz_responses;
