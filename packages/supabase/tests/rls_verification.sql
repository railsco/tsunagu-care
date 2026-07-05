-- ============================================
-- RLS / migration 00004 検証クエリ
-- ============================================
-- 実行方法（ローカル: supabase db reset 後 / リモート: ステージング環境で）:
--   psql <DB_URL> -f packages/supabase/tests/rls_verification.sql
-- seed.sql 投入済みであることが前提。
-- 各セクションの期待結果をコメントで記載。

-- --------------------------------------------
-- 0. 前提: seedのauth_id（seed.sql より）
--   ケアマネ 田中花子: aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
--   家族 山田健一:     11111111-1111-1111-1111-111111111111
-- --------------------------------------------

-- --------------------------------------------
-- 1. ケアマネ視点: 匿名フィードバックの投稿者がNULLになること
-- 期待: is_anonymous=true の行で family_member_id / family_member_name がすべてNULL
-- --------------------------------------------
BEGIN;
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims = '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "role": "authenticated"}';

SELECT id, is_anonymous, family_member_id, family_member_name
FROM feedbacks_view
WHERE is_anonymous = true;
-- 期待: 全行で family_member_id IS NULL AND family_member_name IS NULL

SELECT count(*) AS "匿名でIDが見える件数（0であるべき）"
FROM feedbacks_view
WHERE is_anonymous = true AND family_member_id IS NOT NULL;
ROLLBACK;

-- --------------------------------------------
-- 2. 家族視点: 他人の匿名投稿は行ごと見えない / 自分の匿名投稿はIDが見える
-- --------------------------------------------
BEGIN;
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

-- 期待: 匿名投稿は自分のもののみ表示され、family_member_id は自分のIDが入る
SELECT id, is_anonymous, family_member_id, family_member_name
FROM feedbacks_view;
ROLLBACK;

-- --------------------------------------------
-- 3. 退会処理: auth.users削除がエラーなく完了し、記録が残ること
-- ※ 破壊的テストのためローカル環境のみで実行
-- --------------------------------------------
BEGIN;
-- 削除前の記録数
SELECT count(*) AS logs_before FROM daily_logs;

-- 家族ユーザーを削除（00004以前はFK違反でエラーになっていた）
DELETE FROM auth.users WHERE id = '11111111-1111-1111-1111-111111111111';

-- 期待: エラーなく完了し、daily_logs の行数は変わらず family_member_id がNULL化
SELECT count(*) AS logs_after FROM daily_logs;
SELECT count(*) AS "NULL化された記録数"
FROM daily_logs WHERE family_member_id IS NULL;
ROLLBACK;

-- --------------------------------------------
-- 4. ユニーク制約: 同一 (care_receiver_id, auth_id) の重複登録が失敗すること
-- 期待: ERROR: duplicate key value violates unique constraint "uq_family_members_receiver_auth"
-- --------------------------------------------
BEGIN;
INSERT INTO family_members (auth_id, care_receiver_id, name, email, relation)
SELECT auth_id, care_receiver_id, name || '（重複）', 'dup_' || email, relation
FROM family_members
WHERE auth_id IS NOT NULL
LIMIT 1;
-- ここでエラーになれば成功
ROLLBACK;

-- --------------------------------------------
-- 5. updated_at トリガー: feedbacks更新でupdated_atが進むこと
-- --------------------------------------------
BEGIN;
UPDATE feedbacks SET status = 'read' WHERE id = (SELECT id FROM feedbacks LIMIT 1);
SELECT id, created_at, updated_at,
       (updated_at > created_at) AS "トリガー動作OK"
FROM feedbacks
ORDER BY updated_at DESC LIMIT 1;
ROLLBACK;
