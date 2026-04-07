-- ============================================
-- Migration: 00003_fix_rls_policies.sql
-- Description: RLSポリシーの修正
--   - get_my_family_member_id() ヘルパー関数を追加
--   - daily_logs UPDATE: family_member_id による所有権チェック追加
--   - daily_logs INSERT: family_member_id が現在のユーザーと一致することを確認
--   - feedbacks SELECT: 匿名フィードバックは投稿者本人のみ閲覧可能
-- ============================================

-- 現在のユーザー（家族）のfamily_member idを取得
CREATE OR REPLACE FUNCTION get_my_family_member_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT id FROM family_members WHERE auth_id = auth.uid()
$$;

-- Fix: daily_logs UPDATE should check family_member_id ownership
DROP POLICY IF EXISTS family_update_own_daily_logs ON daily_logs;
CREATE POLICY family_update_own_daily_logs ON daily_logs
  FOR UPDATE TO authenticated
  USING (
    family_member_id = get_my_family_member_id()
  )
  WITH CHECK (
    family_member_id = get_my_family_member_id()
  );

-- Fix: daily_logs INSERT should check family_member_id matches current user
DROP POLICY IF EXISTS family_insert_daily_logs ON daily_logs;
CREATE POLICY family_insert_daily_logs ON daily_logs
  FOR INSERT TO authenticated
  WITH CHECK (
    care_receiver_id IN (SELECT get_my_care_receiver_ids_as_family())
    AND family_member_id = get_my_family_member_id()
  );

-- Fix: feedbacks - hide anonymous feedback author from other family members
-- Note: RLS cannot selectively hide columns. Application layer must strip family_member_id for anonymous feedbacks.
-- However, we can at least ensure family members can only see their own anonymous feedbacks + all non-anonymous ones
DROP POLICY IF EXISTS family_view_own_feedbacks ON feedbacks;
CREATE POLICY family_view_feedbacks ON feedbacks
  FOR SELECT TO authenticated
  USING (
    care_receiver_id IN (SELECT get_my_care_receiver_ids_as_family())
    AND (
      is_anonymous = false
      OR family_member_id = get_my_family_member_id()
    )
  );
