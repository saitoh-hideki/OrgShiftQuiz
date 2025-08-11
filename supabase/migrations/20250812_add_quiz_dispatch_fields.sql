-- Add dispatch-related fields to quizzes table
-- Version: 1.0.1
-- Created: 2025-08-12

-- Add missing columns to quizzes table for dispatch functionality
ALTER TABLE quizzes 
ADD COLUMN IF NOT EXISTS target_segment TEXT DEFAULT 'all',
ADD COLUMN IF NOT EXISTS requires_attestation BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS notification_enabled BOOLEAN DEFAULT TRUE;

-- Add score column to quiz_assignments table
ALTER TABLE quiz_assignments 
ADD COLUMN IF NOT EXISTS score INTEGER;

-- Add quiz_responses table if it doesn't exist
CREATE TABLE IF NOT EXISTS quiz_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  answers JSONB NOT NULL,
  score INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quiz_responses_quiz_user ON quiz_responses(quiz_id, user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_responses_user ON quiz_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_responses_completed ON quiz_responses(completed_at);

-- Update existing quizzes table structure to match the expected schema
-- This ensures compatibility with the dispatch builder
COMMENT ON TABLE quizzes IS 'Quiz management table for dispatch and assignment';
COMMENT ON COLUMN quizzes.target_segment IS 'Target segment for quiz distribution';
COMMENT ON COLUMN quizzes.requires_attestation IS 'Whether this quiz requires user attestation';
COMMENT ON COLUMN quizzes.notification_enabled IS 'Whether to send push notifications for this quiz';
