-- ============================================
-- Migration: 00002_manager_insert_policies.sql
-- Description: ケアマネージャーにdaily_logs/feedbacksのINSERT権限を追加
-- ============================================

-- 既存のポリシーを削除（存在する場合）
DROP POLICY IF EXISTS "managers_insert_daily_logs" ON daily_logs;
DROP POLICY IF EXISTS "managers_update_daily_logs" ON daily_logs;
DROP POLICY IF EXISTS "managers_insert_feedbacks" ON feedbacks;

-- --------------------------------------------
-- daily_logs: ケアマネ用INSERTポリシー
-- --------------------------------------------
-- ケアマネ: 担当利用者の日記を作成可能
CREATE POLICY "managers_insert_daily_logs"
  ON daily_logs FOR INSERT
  WITH CHECK (care_receiver_id IN (SELECT get_my_care_receiver_ids_as_manager()));

-- ケアマネ: 担当利用者の日記を更新可能
CREATE POLICY "managers_update_daily_logs"
  ON daily_logs FOR UPDATE
  USING (care_receiver_id IN (SELECT get_my_care_receiver_ids_as_manager()));

-- --------------------------------------------
-- feedbacks: ケアマネ用INSERTポリシー
-- --------------------------------------------
-- ケアマネ: 担当利用者のフィードバックを作成可能
CREATE POLICY "managers_insert_feedbacks"
  ON feedbacks FOR INSERT
  WITH CHECK (care_receiver_id IN (SELECT get_my_care_receiver_ids_as_manager()));
