-- OrgShift Quiz Database Schema for Supabase
-- Version: 1.0.0
-- Created: 2025-08-11
-- Updated: 2025-08-11 (仕様書対応版)

-- ================================================
-- CORE TABLES
-- ================================================

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001', -- TEST MODE
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
  company_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001', -- TEST MODE
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

-- Options
CREATE TABLE options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz Assignments
CREATE TABLE quiz_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed'))
);

-- ================================================
-- NEWS TABLES (仕様書対応版)
-- ================================================

-- News Sources
CREATE TABLE news_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001', -- TEST MODE
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT CHECK (category IN ('education','localgov','it','regional')) DEFAULT 'it',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- News Articles
CREATE TABLE news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001', -- TEST MODE
  source_id UUID REFERENCES news_sources(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  published_at TIMESTAMPTZ,
  summary TEXT,
  topics TEXT[],
  status TEXT CHECK (status IN ('new','queued','needs_review','quiz_generated','approved','rejected','published')) DEFAULT 'new',
  trust_score INTEGER DEFAULT 3,
  hash TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- News Quiz Drafts
CREATE TABLE news_quiz_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES news_articles(id) ON DELETE CASCADE,
  questions JSONB NOT NULL, -- AI生成されたクイズ下書き
  ai_model TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- POLICY TABLES (仕様書対応版)
-- ================================================

-- Policy Documents
CREATE TABLE policy_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001', -- TEST MODE
  title TEXT NOT NULL,
  version TEXT NOT NULL,
  effective_date DATE,
  category TEXT,
  storage_path TEXT NOT NULL,
  summary TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Policy Quiz Drafts
CREATE TABLE policy_quiz_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id UUID REFERENCES policy_documents(id) ON DELETE CASCADE,
  questions JSONB NOT NULL, -- AI生成されたクイズ下書き
  ai_model TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- MANUAL TABLES (仕様書対応版)
-- ================================================

-- Manual Drafts
CREATE TABLE manual_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001', -- TEST MODE
  title TEXT NOT NULL,
  question TEXT NOT NULL,
  correct TEXT NOT NULL,
  distractors TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- TRAY SYSTEM (下書き管理)
-- ================================================

-- Tray Items (News/Policy/Manual の下書きを統合管理)
CREATE TABLE tray_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001', -- TEST MODE
  origin TEXT NOT NULL CHECK (origin IN ('news', 'policy', 'manual')),
  source_id UUID, -- news_articles.id, policy_documents.id, manual_drafts.id
  title TEXT NOT NULL,
  content JSONB NOT NULL, -- 下書き内容
  metadata JSONB, -- 追加情報（版、出典URL等）
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'selected', 'published')),
  created_at TIMESTAMPTZ DEFAULT NOW()
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
-- INDEXES (パフォーマンス向上)
-- ================================================

CREATE INDEX IF NOT EXISTS idx_news_articles_company_created ON news_articles(company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_articles_hash ON news_articles(hash);
CREATE INDEX IF NOT EXISTS idx_policy_documents_company ON policy_documents(company_id);
CREATE INDEX IF NOT EXISTS idx_manual_drafts_company ON manual_drafts(company_id);
CREATE INDEX IF NOT EXISTS idx_tray_items_company_origin ON tray_items(company_id, origin);

-- ================================================
-- ROW LEVEL SECURITY (テストモード用)
-- ================================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE options ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_quiz_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_quiz_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE manual_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tray_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE response_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE attestations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ================================================
-- TEST MODE POLICIES (anon 全権限)
-- ================================================

-- テストモード用の簡易ポリシー（本番では削除）
CREATE POLICY test_users_policy ON users FOR ALL USING (true);
CREATE POLICY test_quizzes_policy ON quizzes FOR ALL USING (true);
CREATE POLICY test_questions_policy ON questions FOR ALL USING (true);
CREATE POLICY test_options_policy ON options FOR ALL USING (true);
CREATE POLICY test_quiz_assignments_policy ON quiz_assignments FOR ALL USING (true);
CREATE POLICY test_news_sources_policy ON news_sources FOR ALL USING (true);
CREATE POLICY test_news_articles_policy ON news_articles FOR ALL USING (true);
CREATE POLICY test_news_quiz_drafts_policy ON news_quiz_drafts FOR ALL USING (true);
CREATE POLICY test_policy_documents_policy ON policy_documents FOR ALL USING (true);
CREATE POLICY test_policy_quiz_drafts_policy ON policy_quiz_drafts FOR ALL USING (true);
CREATE POLICY test_manual_drafts_policy ON manual_drafts FOR ALL USING (true);
CREATE POLICY test_tray_items_policy ON tray_items FOR ALL USING (true);
CREATE POLICY test_responses_policy ON responses FOR ALL USING (true);
CREATE POLICY test_response_items_policy ON response_items FOR ALL USING (true);
CREATE POLICY test_attestations_policy ON attestations FOR ALL USING (true);
CREATE POLICY test_audit_logs_policy ON audit_logs FOR ALL USING (true);