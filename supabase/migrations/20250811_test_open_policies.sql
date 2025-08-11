-- ================================================================
-- テスト用オープンポリシー設定
-- 警告: このマイグレーションはテスト専用です。本番環境では絶対に使用しないでください。
-- ================================================================

-- テスト用の固定company_id
INSERT INTO companies (id, name, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'TEST COMPANY',
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- RLS有効化（すでに有効な場合もエラーにならない）
-- ================================================================
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE options ENABLE ROW LEVEL SECURITY;
ALTER TABLE segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE response_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE attestations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_quiz_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_quiz_drafts ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- テスト用ポリシー作成（anon roleに全権限付与）
-- ================================================================

-- companies
CREATE POLICY test_select_companies ON companies FOR SELECT TO anon USING (true);
CREATE POLICY test_insert_companies ON companies FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY test_update_companies ON companies FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY test_delete_companies ON companies FOR DELETE TO anon USING (true);

-- departments
CREATE POLICY test_select_departments ON departments FOR SELECT TO anon USING (true);
CREATE POLICY test_insert_departments ON departments FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY test_update_departments ON departments FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY test_delete_departments ON departments FOR DELETE TO anon USING (true);

-- users
CREATE POLICY test_select_users ON users FOR SELECT TO anon USING (true);
CREATE POLICY test_insert_users ON users FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY test_update_users ON users FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY test_delete_users ON users FOR DELETE TO anon USING (true);

-- user_departments
CREATE POLICY test_select_user_departments ON user_departments FOR SELECT TO anon USING (true);
CREATE POLICY test_insert_user_departments ON user_departments FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY test_update_user_departments ON user_departments FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY test_delete_user_departments ON user_departments FOR DELETE TO anon USING (true);

-- quizzes
CREATE POLICY test_select_quizzes ON quizzes FOR SELECT TO anon USING (true);
CREATE POLICY test_insert_quizzes ON quizzes FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY test_update_quizzes ON quizzes FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY test_delete_quizzes ON quizzes FOR DELETE TO anon USING (true);

-- questions
CREATE POLICY test_select_questions ON questions FOR SELECT TO anon USING (true);
CREATE POLICY test_insert_questions ON questions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY test_update_questions ON questions FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY test_delete_questions ON questions FOR DELETE TO anon USING (true);

-- options
CREATE POLICY test_select_options ON options FOR SELECT TO anon USING (true);
CREATE POLICY test_insert_options ON options FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY test_update_options ON options FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY test_delete_options ON options FOR DELETE TO anon USING (true);

-- segments
CREATE POLICY test_select_segments ON segments FOR SELECT TO anon USING (true);
CREATE POLICY test_insert_segments ON segments FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY test_update_segments ON segments FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY test_delete_segments ON segments FOR DELETE TO anon USING (true);

-- quiz_assignments
CREATE POLICY test_select_quiz_assignments ON quiz_assignments FOR SELECT TO anon USING (true);
CREATE POLICY test_insert_quiz_assignments ON quiz_assignments FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY test_update_quiz_assignments ON quiz_assignments FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY test_delete_quiz_assignments ON quiz_assignments FOR DELETE TO anon USING (true);

-- responses
CREATE POLICY test_select_responses ON responses FOR SELECT TO anon USING (true);
CREATE POLICY test_insert_responses ON responses FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY test_update_responses ON responses FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY test_delete_responses ON responses FOR DELETE TO anon USING (true);

-- response_items
CREATE POLICY test_select_response_items ON response_items FOR SELECT TO anon USING (true);
CREATE POLICY test_insert_response_items ON response_items FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY test_update_response_items ON response_items FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY test_delete_response_items ON response_items FOR DELETE TO anon USING (true);

-- attestations
CREATE POLICY test_select_attestations ON attestations FOR SELECT TO anon USING (true);
CREATE POLICY test_insert_attestations ON attestations FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY test_update_attestations ON attestations FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY test_delete_attestations ON attestations FOR DELETE TO anon USING (true);

-- audit_logs
CREATE POLICY test_select_audit_logs ON audit_logs FOR SELECT TO anon USING (true);
CREATE POLICY test_insert_audit_logs ON audit_logs FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY test_update_audit_logs ON audit_logs FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY test_delete_audit_logs ON audit_logs FOR DELETE TO anon USING (true);

-- news_sources
CREATE POLICY test_select_news_sources ON news_sources FOR SELECT TO anon USING (true);
CREATE POLICY test_insert_news_sources ON news_sources FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY test_update_news_sources ON news_sources FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY test_delete_news_sources ON news_sources FOR DELETE TO anon USING (true);

-- news_articles
CREATE POLICY test_select_news_articles ON news_articles FOR SELECT TO anon USING (true);
CREATE POLICY test_insert_news_articles ON news_articles FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY test_update_news_articles ON news_articles FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY test_delete_news_articles ON news_articles FOR DELETE TO anon USING (true);

-- news_quiz_drafts
CREATE POLICY test_select_news_quiz_drafts ON news_quiz_drafts FOR SELECT TO anon USING (true);
CREATE POLICY test_insert_news_quiz_drafts ON news_quiz_drafts FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY test_update_news_quiz_drafts ON news_quiz_drafts FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY test_delete_news_quiz_drafts ON news_quiz_drafts FOR DELETE TO anon USING (true);

-- policy_documents
CREATE POLICY test_select_policy_documents ON policy_documents FOR SELECT TO anon USING (true);
CREATE POLICY test_insert_policy_documents ON policy_documents FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY test_update_policy_documents ON policy_documents FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY test_delete_policy_documents ON policy_documents FOR DELETE TO anon USING (true);

-- policy_quiz_drafts
CREATE POLICY test_select_policy_quiz_drafts ON policy_quiz_drafts FOR SELECT TO anon USING (true);
CREATE POLICY test_insert_policy_quiz_drafts ON policy_quiz_drafts FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY test_update_policy_quiz_drafts ON policy_quiz_drafts FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY test_delete_policy_quiz_drafts ON policy_quiz_drafts FOR DELETE TO anon USING (true);