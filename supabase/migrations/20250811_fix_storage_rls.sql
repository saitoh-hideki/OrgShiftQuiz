-- Fix RLS Policies for Supabase Storage (TEST MODE - No Authentication Required)
-- This migration fixes the storage row-level security policy violation error

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('policydocuments', 'policydocuments', true)
ON CONFLICT (id) DO NOTHING;

-- Drop ALL existing storage policies to start fresh
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
DROP POLICY IF EXISTS "Test Mode - Allow All Storage Operations" ON storage.objects;
DROP POLICY IF EXISTS "Test Mode - Policydocuments Bucket Access" ON storage.objects;

-- Create comprehensive test policies for storage.objects (no authentication required)
-- This allows all operations on all buckets for testing purposes
CREATE POLICY "Test Mode - Complete Storage Access" ON storage.objects
  FOR ALL USING (true);

-- Alternative: Create specific policies for the policydocuments bucket only
CREATE POLICY "Test Mode - Policydocuments Bucket Full Access" ON storage.objects
  FOR ALL USING (bucket_id = 'policydocuments');

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Verify the storage bucket configuration
SELECT * FROM storage.buckets WHERE id = 'policydocuments';

-- Check if policies were created successfully
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';
