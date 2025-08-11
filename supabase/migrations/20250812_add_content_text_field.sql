-- Add content_text field to policy_documents table
-- This field will store the actual text content extracted from uploaded document files
-- This is essential for generating content-based quizzes

-- Add the content_text field if it doesn't exist
ALTER TABLE policy_documents ADD COLUMN IF NOT EXISTS content_text TEXT;

-- Add other missing fields if they don't exist
ALTER TABLE policy_documents ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE policy_documents ADD COLUMN IF NOT EXISTS file_size BIGINT;
ALTER TABLE policy_documents ADD COLUMN IF NOT EXISTS file_type TEXT;
ALTER TABLE policy_documents ADD COLUMN IF NOT EXISTS original_filename TEXT;

-- Add an index for better performance when searching through document content
CREATE INDEX IF NOT EXISTS idx_policy_documents_content_text 
ON policy_documents USING GIN (to_tsvector('english', content_text));

-- Add comments explaining the purpose of these fields
COMMENT ON COLUMN policy_documents.content_text IS 'Extracted text content from uploaded document files for quiz generation and content analysis';
COMMENT ON COLUMN policy_documents.file_url IS 'Public URL to the uploaded file';
COMMENT ON COLUMN policy_documents.file_size IS 'Size of the uploaded file in bytes';
COMMENT ON COLUMN policy_documents.file_type IS 'MIME type of the uploaded file';
COMMENT ON COLUMN policy_documents.original_filename IS 'Original filename before upload';
