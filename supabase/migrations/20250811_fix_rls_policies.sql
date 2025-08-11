-- Fix RLS Policies for policy_documents table (TEST MODE - No Authentication Required)
-- This migration fixes the row-level security policy violation error

-- Drop existing test policies if they exist
DROP POLICY IF EXISTS test_policy_documents_policy ON policy_documents;
DROP POLICY IF EXISTS test_news_sources_policy ON news_sources;
DROP POLICY IF EXISTS test_news_articles_policy ON news_articles;
DROP POLICY IF EXISTS test_manual_drafts_policy ON manual_drafts;

-- Create simple test policies that allow all operations (no authentication required)
-- For policy_documents table
CREATE POLICY policy_documents_test_policy ON policy_documents
  FOR ALL USING (true);

-- For news_sources table  
CREATE POLICY news_sources_test_policy ON news_sources
  FOR ALL USING (true);

-- For news_articles table
CREATE POLICY news_articles_test_policy ON news_articles
  FOR ALL USING (true);

-- For manual_drafts table
CREATE POLICY manual_drafts_test_policy ON manual_drafts
  FOR ALL USING (true);

-- Verify RLS is enabled
ALTER TABLE policy_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE manual_drafts ENABLE ROW LEVEL SECURITY;
