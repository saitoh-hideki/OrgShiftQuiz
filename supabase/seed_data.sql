-- テスト用のクイズデータを作成
-- このスクリプトは Supabase Dashboard の SQL Editor で実行してください

-- テスト用のクイズを作成
INSERT INTO quizzes (
  id,
  company_id,
  title,
  description,
  source_mix,
  status,
  questions,
  require_attestation,
  target_segment,
  notification_enabled,
  created_at,
  updated_at
) VALUES 
(
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000001',
  '教育デジタル化推進法について',
  '教育分野におけるデジタル技術の活用に関する法律について学ぶクイズです。',
  ARRAY['news'],
  'active',
  3,
  false,
  'all',
  true,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000001',
  '情報セキュリティ基本方針 v2.1',
  '組織の情報セキュリティに関する基本方針を理解するためのクイズです。',
  ARRAY['policy'],
  'active',
  5,
  true,
  'all',
  true,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000001',
  'システム利用マニュアル',
  '社内システムの利用方法について学ぶクイズです。',
  ARRAY['manual'],
  'completed',
  4,
  false,
  'all',
  true,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000001',
  'リモートワーク規程 更新版',
  'リモートワークに関する社内規程について学ぶクイズです。',
  ARRAY['policy'],
  'draft',
  3,
  false,
  'all',
  true,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000001',
  '自治体DX推進計画の改訂について',
  '自治体のデジタル化推進に関する計画について学ぶクイズです。',
  ARRAY['news'],
  'pending_approval',
  4,
  false,
  'all',
  true,
  NOW(),
  NOW()
);

-- テスト用の質問データを作成（最初のクイズ用）
INSERT INTO questions (
  id,
  quiz_id,
  source_type,
  question_text,
  options,
  correct_answer,
  explanation,
  created_at
) 
SELECT 
  gen_random_uuid(),
  q.id,
  'news',
  '教育デジタル化推進法の目的は何ですか？',
  '["教育の質の向上", "コスト削減", "教員の負担軽減", "すべて上記"]',
  'すべて上記',
  '教育デジタル化推進法は、教育の質向上、コスト削減、教員の負担軽減を包括的に目指しています。',
  NOW()
FROM quizzes q 
WHERE q.title = '教育デジタル化推進法について'
LIMIT 1;

-- テスト用のユーザーを作成（既に存在しない場合）
INSERT INTO users (
  id,
  company_id,
  email,
  full_name,
  role
) VALUES 
(
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'test@example.com',
  'テストユーザー',
  'employee'
) ON CONFLICT (id) DO NOTHING;

-- テスト用のクイズ割り当てを作成
INSERT INTO quiz_assignments (
  id,
  quiz_id,
  user_id,
  status,
  assigned_at
)
SELECT 
  gen_random_uuid(),
  q.id,
  '00000000-0000-0000-0000-000000000001',
  'completed',
  NOW()
FROM quizzes q 
WHERE q.status = 'active'
LIMIT 2;

-- テスト用の回答データを作成
INSERT INTO quiz_responses (
  id,
  quiz_id,
  user_id,
  answers,
  score,
  completed_at
)
SELECT 
  gen_random_uuid(),
  q.id,
  '00000000-0000-0000-0000-000000000001',
  '{"question_1": "すべて上記"}',
  100,
  NOW()
FROM quizzes q 
WHERE q.status = 'active'
LIMIT 2;

-- 作成されたデータを確認
SELECT 
  'quizzes' as table_name,
  count(*) as record_count
FROM quizzes
UNION ALL
SELECT 
  'questions' as table_name,
  count(*) as record_count
FROM questions
UNION ALL
SELECT 
  'quiz_assignments' as table_name,
  count(*) as record_count
FROM quiz_assignments
UNION ALL
SELECT 
  'quiz_responses' as table_name,
  count(*) as record_count
FROM quiz_responses;
