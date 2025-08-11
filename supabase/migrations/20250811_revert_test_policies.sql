-- ================================================================
-- テスト用ポリシーの削除（本番環境復帰用）
-- このマイグレーションを実行してテスト用のオープンポリシーを削除し、
-- 本番用の適切なRLSポリシーを再設定してください。
-- ================================================================

-- ================================================================
-- テスト用ポリシーの削除
-- ================================================================

-- companies
DROP POLICY IF EXISTS test_select_companies ON companies;
DROP POLICY IF EXISTS test_insert_companies ON companies;
DROP POLICY IF EXISTS test_update_companies ON companies;
DROP POLICY IF EXISTS test_delete_companies ON companies;

-- departments
DROP POLICY IF EXISTS test_select_departments ON departments;
DROP POLICY IF EXISTS test_insert_departments ON departments;
DROP POLICY IF EXISTS test_update_departments ON departments;
DROP POLICY IF EXISTS test_delete_departments ON departments;

-- users
DROP POLICY IF EXISTS test_select_users ON users;
DROP POLICY IF EXISTS test_insert_users ON users;
DROP POLICY IF EXISTS test_update_users ON users;
DROP POLICY IF EXISTS test_delete_users ON users;

-- user_departments
DROP POLICY IF EXISTS test_select_user_departments ON user_departments;
DROP POLICY IF EXISTS test_insert_user_departments ON user_departments;
DROP POLICY IF EXISTS test_update_user_departments ON user_departments;
DROP POLICY IF EXISTS test_delete_user_departments ON user_departments;

-- quizzes
DROP POLICY IF EXISTS test_select_quizzes ON quizzes;
DROP POLICY IF EXISTS test_insert_quizzes ON quizzes;
DROP POLICY IF EXISTS test_update_quizzes ON quizzes;
DROP POLICY IF EXISTS test_delete_quizzes ON quizzes;

-- questions
DROP POLICY IF EXISTS test_select_questions ON questions;
DROP POLICY IF EXISTS test_insert_questions ON questions;
DROP POLICY IF EXISTS test_update_questions ON questions;
DROP POLICY IF EXISTS test_delete_questions ON questions;

-- options
DROP POLICY IF EXISTS test_select_options ON options;
DROP POLICY IF EXISTS test_insert_options ON options;
DROP POLICY IF EXISTS test_update_options ON options;
DROP POLICY IF EXISTS test_delete_options ON options;

-- segments
DROP POLICY IF EXISTS test_select_segments ON segments;
DROP POLICY IF EXISTS test_insert_segments ON segments;
DROP POLICY IF EXISTS test_update_segments ON segments;
DROP POLICY IF EXISTS test_delete_segments ON segments;

-- quiz_assignments
DROP POLICY IF EXISTS test_select_quiz_assignments ON quiz_assignments;
DROP POLICY IF EXISTS test_insert_quiz_assignments ON quiz_assignments;
DROP POLICY IF EXISTS test_update_quiz_assignments ON quiz_assignments;
DROP POLICY IF EXISTS test_delete_quiz_assignments ON quiz_assignments;

-- responses
DROP POLICY IF EXISTS test_select_responses ON responses;
DROP POLICY IF EXISTS test_insert_responses ON responses;
DROP POLICY IF EXISTS test_update_responses ON responses;
DROP POLICY IF EXISTS test_delete_responses ON responses;

-- response_items
DROP POLICY IF EXISTS test_select_response_items ON response_items;
DROP POLICY IF EXISTS test_insert_response_items ON response_items;
DROP POLICY IF EXISTS test_update_response_items ON response_items;
DROP POLICY IF EXISTS test_delete_response_items ON response_items;

-- attestations
DROP POLICY IF EXISTS test_select_attestations ON attestations;
DROP POLICY IF EXISTS test_insert_attestations ON attestations;
DROP POLICY IF EXISTS test_update_attestations ON attestations;
DROP POLICY IF EXISTS test_delete_attestations ON attestations;

-- audit_logs
DROP POLICY IF EXISTS test_select_audit_logs ON audit_logs;
DROP POLICY IF EXISTS test_insert_audit_logs ON audit_logs;
DROP POLICY IF EXISTS test_update_audit_logs ON audit_logs;
DROP POLICY IF EXISTS test_delete_audit_logs ON audit_logs;

-- news_sources
DROP POLICY IF EXISTS test_select_news_sources ON news_sources;
DROP POLICY IF EXISTS test_insert_news_sources ON news_sources;
DROP POLICY IF EXISTS test_update_news_sources ON news_sources;
DROP POLICY IF EXISTS test_delete_news_sources ON news_sources;

-- news_articles
DROP POLICY IF EXISTS test_select_news_articles ON news_articles;
DROP POLICY IF EXISTS test_insert_news_articles ON news_articles;
DROP POLICY IF EXISTS test_update_news_articles ON news_articles;
DROP POLICY IF EXISTS test_delete_news_articles ON news_articles;

-- news_quiz_drafts
DROP POLICY IF EXISTS test_select_news_quiz_drafts ON news_quiz_drafts;
DROP POLICY IF EXISTS test_insert_news_quiz_drafts ON news_quiz_drafts;
DROP POLICY IF EXISTS test_update_news_quiz_drafts ON news_quiz_drafts;
DROP POLICY IF EXISTS test_delete_news_quiz_drafts ON news_quiz_drafts;

-- policy_documents
DROP POLICY IF EXISTS test_select_policy_documents ON policy_documents;
DROP POLICY IF EXISTS test_insert_policy_documents ON policy_documents;
DROP POLICY IF EXISTS test_update_policy_documents ON policy_documents;
DROP POLICY IF EXISTS test_delete_policy_documents ON policy_documents;

-- policy_quiz_drafts
DROP POLICY IF EXISTS test_select_policy_quiz_drafts ON policy_quiz_drafts;
DROP POLICY IF EXISTS test_insert_policy_quiz_drafts ON policy_quiz_drafts;
DROP POLICY IF EXISTS test_update_policy_quiz_drafts ON policy_quiz_drafts;
DROP POLICY IF EXISTS test_delete_policy_quiz_drafts ON policy_quiz_drafts;

-- ================================================================
-- 本番用RLSポリシーの再設定
-- 注意: 以下は基本的な例です。実際の本番環境では
-- より厳密なポリシーを設定してください。
-- ================================================================

-- companies: 認証済みユーザーが自社のデータのみアクセス可能
CREATE POLICY prod_select_companies ON companies
  FOR SELECT TO authenticated
  USING (id = auth.jwt() ->> 'company_id'::uuid);

-- quizzes: 認証済みユーザーが自社のクイズのみアクセス可能
CREATE POLICY prod_select_quizzes ON quizzes
  FOR SELECT TO authenticated
  USING (company_id = auth.jwt() ->> 'company_id'::uuid);

CREATE POLICY prod_insert_quizzes ON quizzes
  FOR INSERT TO authenticated
  WITH CHECK (company_id = auth.jwt() ->> 'company_id'::uuid);

CREATE POLICY prod_update_quizzes ON quizzes
  FOR UPDATE TO authenticated
  USING (company_id = auth.jwt() ->> 'company_id'::uuid)
  WITH CHECK (company_id = auth.jwt() ->> 'company_id'::uuid);

-- responses: 認証済みユーザーが自分の回答のみアクセス可能
CREATE POLICY prod_select_responses ON responses
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY prod_insert_responses ON responses
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 他のテーブルも同様に本番用ポリシーを設定してください

-- ================================================================
-- テスト用データのクリーンアップ（オプション）
-- ================================================================
-- テスト用のcompanyとその関連データを削除する場合は以下のコメントを外してください
-- DELETE FROM companies WHERE id = '00000000-0000-0000-0000-000000000001'::uuid;