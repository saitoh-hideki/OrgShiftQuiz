-- OrgShift Quiz Database Schema for Supabase
-- Version: 1.0.0
-- Created: 2025-08-11

-- ================================================
-- CORE TABLES
-- ================================================

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'reviewer', 'employee', 'auditor')),
  department TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quizzes
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  source_mix TEXT[], -- ['news', 'policy', 'manual']
  status TEXT DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  deadline TIMESTAMPTZ,
  require_attestation BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questions
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (source_type IN ('news', 'policy', 'manual')),
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  citation_url TEXT,
  citation_quote TEXT,
  policy_doc_id UUID,
  policy_version TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- NEWS TABLES
-- ================================================

-- News Sources
CREATE TABLE news_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- News Articles
CREATE TABLE news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES news_sources(id),
  title TEXT NOT NULL,
  url TEXT UNIQUE NOT NULL,
  content TEXT,
  summary TEXT,
  published_at TIMESTAMPTZ,
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- POLICY TABLES
-- ================================================

-- Policy Documents
CREATE TABLE policy_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  version TEXT NOT NULL,
  effective_date DATE,
  file_url TEXT,
  status TEXT DEFAULT 'draft',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- RESPONSE TABLES
-- ================================================

-- Responses
CREATE TABLE responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES quizzes(id),
  user_id UUID REFERENCES users(id),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  score INTEGER,
  is_complete BOOLEAN DEFAULT FALSE
);

-- Response Items
CREATE TABLE response_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id UUID REFERENCES responses(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id),
  selected_answer TEXT,
  is_correct BOOLEAN,
  answered_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attestations
CREATE TABLE attestations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_doc_id UUID REFERENCES policy_documents(id),
  user_id UUID REFERENCES users(id),
  quiz_id UUID REFERENCES quizzes(id),
  attested_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- ================================================
-- AUDIT & ANALYTICS
-- ================================================

-- Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- ROW LEVEL SECURITY
-- ================================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE attestations ENABLE ROW LEVEL SECURITY;

-- Policies will be added here...