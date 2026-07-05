-- ============================================
-- Migration: 00004_data_integrity.sql
-- Description: データ整合性・セキュリティの改善
--   - family_members / feedbacks / satisfaction_surveys に updated_at カラムとトリガーを追加
--   - FK の ON DELETE 挙動を修正（退会・退職時に記録が残るように SET NULL）
--   - family_members に (care_receiver_id, auth_id) ユニーク制約を追加
--   - feedbacks_view を追加（匿名フィードバックの投稿者IDをデータ層で秘匿）
-- ============================================

-- --------------------------------------------
-- 1. updated_at カラム + トリガー
-- --------------------------------------------

ALTER TABLE family_members ADD COLUMN updated_at timestamptz DEFAULT now();
ALTER TABLE feedbacks ADD COLUMN updated_at timestamptz DEFAULT now();
ALTER TABLE satisfaction_surveys ADD COLUMN updated_at timestamptz DEFAULT now();

CREATE TRIGGER trigger_family_members_updated_at
  BEFORE UPDATE ON family_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_feedbacks_updated_at
  BEFORE UPDATE ON feedbacks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_satisfaction_surveys_updated_at
  BEFORE UPDATE ON satisfaction_surveys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------
-- 2. ON DELETE 挙動の修正
-- --------------------------------------------
-- 現状はすべて NO ACTION のため、auth.users 削除（退会処理）が
-- care_managers / family_members への CASCADE の時点で子テーブルの FK にブロックされ失敗する。
-- 担当者退職・家族退会でも介護記録そのものは残す方針で SET NULL に変更。
-- ※ care_receiver_id 側の FK は意図的に NO ACTION のまま（利用者は is_active=false のソフトデリート運用）

ALTER TABLE care_receivers
  DROP CONSTRAINT care_receivers_care_manager_id_fkey,
  ADD CONSTRAINT care_receivers_care_manager_id_fkey
    FOREIGN KEY (care_manager_id) REFERENCES care_managers(id) ON DELETE SET NULL;

ALTER TABLE daily_logs
  DROP CONSTRAINT daily_logs_family_member_id_fkey,
  ADD CONSTRAINT daily_logs_family_member_id_fkey
    FOREIGN KEY (family_member_id) REFERENCES family_members(id) ON DELETE SET NULL;

ALTER TABLE feedbacks
  DROP CONSTRAINT feedbacks_family_member_id_fkey,
  ADD CONSTRAINT feedbacks_family_member_id_fkey
    FOREIGN KEY (family_member_id) REFERENCES family_members(id) ON DELETE SET NULL;

ALTER TABLE satisfaction_surveys
  DROP CONSTRAINT satisfaction_surveys_family_member_id_fkey,
  ADD CONSTRAINT satisfaction_surveys_family_member_id_fkey
    FOREIGN KEY (family_member_id) REFERENCES family_members(id) ON DELETE SET NULL;

-- --------------------------------------------
-- 3. family_members ユニーク制約
-- --------------------------------------------
-- 同一利用者に同じ auth ユーザーが重複登録されるのを防ぐ
-- （auth_id が NULL の行は Postgres の仕様上、制約の対象外）

ALTER TABLE family_members
  ADD CONSTRAINT uq_family_members_receiver_auth UNIQUE (care_receiver_id, auth_id);

-- --------------------------------------------
-- 4. feedbacks_view（匿名投稿者の秘匿）
-- --------------------------------------------
-- RLS では特定カラムだけを隠せないため（00003 の Note 参照）、
-- 読み取り専用 VIEW で匿名フィードバックの投稿者情報を NULL 化する。
--   - 投稿者本人には自分の ID・名前が見える（「自分の投稿」表示用）
--   - ケアマネ・他の家族には NULL
-- security_invoker = on により基底テーブルの RLS が呼び出し元の権限で適用される。
-- 投稿者の名前・続柄は VIEW にフラット射影する
-- （CASE 式を通したカラムでは PostgREST が FK を追跡できず embed が使えないため）。
-- INSERT / UPDATE（ステータス変更・対応メモ）は引き続き基底テーブル feedbacks に対して行う。

CREATE VIEW feedbacks_view
WITH (security_invoker = on)
AS
SELECT
  f.id,
  f.care_receiver_id,
  CASE
    WHEN f.is_anonymous AND (f.family_member_id IS DISTINCT FROM get_my_family_member_id())
    THEN NULL
    ELSE f.family_member_id
  END AS family_member_id,
  CASE
    WHEN f.is_anonymous AND (f.family_member_id IS DISTINCT FROM get_my_family_member_id())
    THEN NULL
    ELSE fm.name
  END AS family_member_name,
  CASE
    WHEN f.is_anonymous AND (f.family_member_id IS DISTINCT FROM get_my_family_member_id())
    THEN NULL
    ELSE fm.relation
  END AS family_member_relation,
  f.category,
  f.content,
  f.is_anonymous,
  f.status,
  f.manager_notes,
  f.created_at,
  f.addressed_at,
  f.updated_at
FROM feedbacks f
LEFT JOIN family_members fm ON fm.id = f.family_member_id;

COMMENT ON VIEW feedbacks_view IS 'フィードバック読み取り用VIEW。匿名投稿の family_member_id を投稿者本人以外には NULL で返す';

GRANT SELECT ON feedbacks_view TO authenticated;
