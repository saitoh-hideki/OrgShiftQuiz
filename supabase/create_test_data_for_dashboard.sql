-- Create test data for dashboard functionality
-- This script creates sample quiz assignments and responses to test the dashboard

-- Insert test quiz assignments
INSERT INTO quiz_assignments (quiz_id, user_id, company_id, status, assigned_at) VALUES
('5bb3d4d7-6689-40aa-aecb-485a17f03143', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'assigned', NOW()),
('5bb3d4d7-6689-40aa-aecb-485a17f03143', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'assigned', NOW()),
('8d74032b-df9d-4c27-a7d4-5ad608611898', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'assigned', NOW()),
('8d74032b-df9d-4c27-a7d4-5ad608611898', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'assigned', NOW())
ON CONFLICT DO NOTHING;

-- Insert test quiz responses
INSERT INTO quiz_responses (quiz_id, user_id, company_id, answers, score, completed_at) VALUES
('5bb3d4d7-6689-40aa-aecb-485a17f03143', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '{"q1": "A", "q2": "B", "q3": "C"}', 85, NOW() - INTERVAL '2 hours'),
('5bb3d4d7-6689-40aa-aecb-485a17f03143', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '{"q1": "A", "q2": "A", "q3": "B"}', 92, NOW() - INTERVAL '1 hour'),
('8d74032b-df9d-4c27-a7d4-5ad608611898', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '{"q1": "C", "q2": "B", "q3": "A"}', 78, NOW() - INTERVAL '30 minutes')
ON CONFLICT DO NOTHING;

-- Update quiz assignments status for completed responses
UPDATE quiz_assignments 
SET status = 'completed', completed_at = NOW(), score = qr.score
FROM quiz_responses qr
WHERE quiz_assignments.quiz_id = qr.quiz_id 
  AND quiz_assignments.user_id = qr.user_id
  AND quiz_assignments.status = 'assigned';

-- Verify the test data
SELECT 
    'Quiz Assignments' as data_type,
    COUNT(*) as total_count,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
    COUNT(CASE WHEN status = 'assigned' THEN 1 END) as assigned_count
FROM quiz_assignments
UNION ALL
SELECT 
    'Quiz Responses' as data_type,
    COUNT(*) as total_count,
    COUNT(score) as scored_count,
    AVG(score)::INTEGER as avg_score
FROM quiz_responses;

-- Show sample data
SELECT 'Quiz Assignments' as table_name, * FROM quiz_assignments LIMIT 5;
SELECT 'Quiz Responses' as table_name, * FROM quiz_responses LIMIT 5;
