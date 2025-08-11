-- Add missing fields to policy_documents table
-- This migration adds fields that are referenced in the application but missing from the schema

-- Add missing fields to policy_documents table
ALTER TABLE policy_documents 
ADD COLUMN IF NOT EXISTS file_url TEXT,
ADD COLUMN IF NOT EXISTS file_size BIGINT,
ADD COLUMN IF NOT EXISTS file_type TEXT,
ADD COLUMN IF NOT EXISTS original_filename TEXT;

-- Add missing fields to news_articles table if they don't exist
ALTER TABLE news_articles 
ADD COLUMN IF NOT EXISTS source_id UUID REFERENCES news_sources(id) ON DELETE SET NULL;

-- Verify the table structure
COMMENT ON TABLE policy_documents IS 'Policy documents table with file metadata support';
COMMENT ON COLUMN policy_documents.file_url IS 'Public URL to the uploaded file';
COMMENT ON COLUMN policy_documents.file_size IS 'Size of the uploaded file in bytes';
COMMENT ON COLUMN policy_documents.file_type IS 'MIME type of the uploaded file';
COMMENT ON COLUMN policy_documents.original_filename IS 'Original filename before upload';
