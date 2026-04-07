-- つなぐケア 初期スキーマ
-- ケアマネージャーと利用者家族をつなぐプラットフォーム

-- ============================================
-- 1. テーブル作成
-- ============================================

-- 1.1 organizations（事業所）
CREATE TABLE organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  license_number text,
  address text,
  phone text,
  plan text DEFAULT 'free' CHECK (plan IN ('free', 'standard', 'premium')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE organizations IS '介護事業所';
COMMENT ON COLUMN organizations.license_number IS '事業所番号';
COMMENT ON COLUMN organizations.plan IS '契約プラン: free, standard, premium';

-- 1.2 care_managers（ケアマネージャー）
CREATE TABLE care_managers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES organizations(id),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE care_managers IS 'ケアマネージャー（介護支援専門員）';
COMMENT ON COLUMN care_managers.auth_id IS 'Supabase Auth連携用ユーザーID';

-- 1.3 care_receivers（利用者）
CREATE TABLE care_receivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  care_manager_id uuid REFERENCES care_managers(id),
  name text NOT NULL,
  birth_date date,
  gender text CHECK (gender IN ('male', 'female', 'other')),
  care_level text CHECK (care_level IN ('要支援1', '要支援2', '要介護1', '要介護2', '要介護3', '要介護4', '要介護5')),
  conditions text[],
  address text,
  notes text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE care_receivers IS '介護サービス利用者';
COMMENT ON COLUMN care_receivers.care_level IS '要介護度';
COMMENT ON COLUMN care_receivers.conditions IS '疾患・状態のリスト';

-- 1.4 family_members（家族）
CREATE TABLE family_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  care_receiver_id uuid REFERENCES care_receivers(id),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  relation text NOT NULL,
  role text DEFAULT 'viewer' CHECK (role IN ('primary', 'editor', 'viewer')),
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

COMMENT ON TABLE family_members IS '利用者の家族';
COMMENT ON COLUMN family_members.relation IS '続柄（例: 長男, 長女, 配偶者）';
COMMENT ON COLUMN family_members.role IS '権限: primary=主介護者, editor=編集可, viewer=閲覧のみ';
COMMENT ON COLUMN family_members.is_primary IS '主たる連絡先かどうか';

-- 1.5 daily_logs（日々の記録）
CREATE TABLE daily_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  care_receiver_id uuid REFERENCES care_receivers(id),
  family_member_id uuid REFERENCES family_members(id),
  log_date date NOT NULL,
  mood integer CHECK (mood BETWEEN 1 AND 5),
  appetite integer CHECK (appetite BETWEEN 1 AND 5),
  sleep_quality integer CHECK (sleep_quality BETWEEN 1 AND 5),
  activity_level integer CHECK (activity_level BETWEEN 1 AND 5),
  notes text,
  concerns text,
  photo_urls text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(care_receiver_id, log_date, family_member_id)
);

COMMENT ON TABLE daily_logs IS '家族が入力する日々の介護記録';
COMMENT ON COLUMN daily_logs.mood IS '気分: 1=とても悪い〜5=とても良い';
COMMENT ON COLUMN daily_logs.appetite IS '食欲: 1〜5';
COMMENT ON COLUMN daily_logs.sleep_quality IS '睡眠の質: 1〜5';
COMMENT ON COLUMN daily_logs.activity_level IS '活動量: 1〜5';
COMMENT ON COLUMN daily_logs.concerns IS '気になること';

-- 1.6 feedbacks（ほんね投函）
CREATE TABLE feedbacks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  care_receiver_id uuid REFERENCES care_receivers(id),
  family_member_id uuid REFERENCES family_members(id),
  category text NOT NULL CHECK (category IN ('service', 'schedule', 'cost', 'communication', 'other')),
  content text NOT NULL,
  is_anonymous boolean DEFAULT false,
  status text DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'addressed')),
  manager_notes text,
  created_at timestamptz DEFAULT now(),
  addressed_at timestamptz
);

COMMENT ON TABLE feedbacks IS '家族からのフィードバック（ほんね投函）';
COMMENT ON COLUMN feedbacks.category IS 'カテゴリ: service=サービス内容, schedule=スケジュール, cost=費用, communication=連絡, other=その他';
COMMENT ON COLUMN feedbacks.is_anonymous IS '匿名投稿かどうか';
COMMENT ON COLUMN feedbacks.status IS 'ステータス: unread=未読, read=既読, addressed=対応済み';
COMMENT ON COLUMN feedbacks.manager_notes IS 'ケアマネの対応メモ';

-- 1.7 satisfaction_surveys（月次満足度）
CREATE TABLE satisfaction_surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  care_receiver_id uuid REFERENCES care_receivers(id),
  family_member_id uuid REFERENCES family_members(id),
  survey_month date NOT NULL,
  overall_score integer CHECK (overall_score BETWEEN 1 AND 5),
  care_plan_score integer CHECK (care_plan_score BETWEEN 1 AND 5),
  communication_score integer CHECK (communication_score BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(care_receiver_id, family_member_id, survey_month)
);

COMMENT ON TABLE satisfaction_surveys IS '月次満足度調査';
COMMENT ON COLUMN satisfaction_surveys.survey_month IS '調査対象月（月初日で管理）';
COMMENT ON COLUMN satisfaction_surveys.overall_score IS '総合満足度: 1〜5';
COMMENT ON COLUMN satisfaction_surveys.care_plan_score IS 'ケアプラン満足度: 1〜5';
COMMENT ON COLUMN satisfaction_surveys.communication_score IS 'コミュニケーション満足度: 1〜5';

-- ============================================
-- 2. インデックス
-- ============================================

-- daily_logs: 利用者ごとの日付降順検索用
CREATE INDEX idx_daily_logs_receiver_date ON daily_logs(care_receiver_id, log_date DESC);

-- feedbacks: 利用者ごとのステータス別検索用
CREATE INDEX idx_feedbacks_receiver_status ON feedbacks(care_receiver_id, status);

-- care_receivers: ケアマネごとのアクティブ利用者検索用
CREATE INDEX idx_care_receivers_manager_active ON care_receivers(care_manager_id, is_active);

-- 追加の有用なインデックス
CREATE INDEX idx_care_managers_auth_id ON care_managers(auth_id);
CREATE INDEX idx_family_members_auth_id ON family_members(auth_id);
CREATE INDEX idx_family_members_receiver ON family_members(care_receiver_id);

-- ============================================
-- 3. updated_at 自動更新トリガー
-- ============================================

-- トリガー関数の作成
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 各テーブルにトリガーを適用
CREATE TRIGGER trigger_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_care_managers_updated_at
  BEFORE UPDATE ON care_managers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_care_receivers_updated_at
  BEFORE UPDATE ON care_receivers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_daily_logs_updated_at
  BEFORE UPDATE ON daily_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 4. Row Level Security (RLS)
-- ============================================

-- 全テーブルでRLSを有効化
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_receivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE satisfaction_surveys ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------
-- 4.1 ヘルパー関数（SECURITY DEFINERでRLSをバイパス）
-- --------------------------------------------
-- ※ テーブル間の参照で無限再帰を防ぐために使用

-- 現在のユーザーのcare_manager_idを取得
CREATE OR REPLACE FUNCTION get_my_care_manager_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT id FROM care_managers WHERE auth_id = auth.uid()
$$;

-- 現在のユーザー（家族）に紐づくcare_receiver_idを取得
CREATE OR REPLACE FUNCTION get_my_care_receiver_ids_as_family()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT care_receiver_id FROM family_members WHERE auth_id = auth.uid()
$$;

-- 現在のユーザー（ケアマネ）担当のcare_receiver_idを取得
CREATE OR REPLACE FUNCTION get_my_care_receiver_ids_as_manager()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT id FROM care_receivers WHERE care_manager_id = get_my_care_manager_id()
$$;

-- --------------------------------------------
-- 4.2 organizations ポリシー
-- --------------------------------------------
-- ケアマネは自分の所属事業所を参照可能
CREATE POLICY "managers_view_own_organization"
  ON organizations FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM care_managers WHERE auth_id = auth.uid()
    )
  );

-- --------------------------------------------
-- 4.3 care_managers ポリシー
-- --------------------------------------------
-- 自分のレコードのみ読み書き可能
CREATE POLICY "care_managers_select_own"
  ON care_managers FOR SELECT
  USING (auth_id = auth.uid());

CREATE POLICY "care_managers_update_own"
  ON care_managers FOR UPDATE
  USING (auth_id = auth.uid());

-- --------------------------------------------
-- 4.4 care_receivers ポリシー
-- --------------------------------------------
-- ケアマネ: 担当利用者を参照可能
CREATE POLICY "managers_view_their_receivers"
  ON care_receivers FOR SELECT
  USING (care_manager_id = get_my_care_manager_id());

-- ケアマネ: 担当利用者を作成可能
CREATE POLICY "managers_insert_receivers"
  ON care_receivers FOR INSERT
  WITH CHECK (care_manager_id = get_my_care_manager_id());

-- ケアマネ: 担当利用者を更新可能
CREATE POLICY "managers_update_receivers"
  ON care_receivers FOR UPDATE
  USING (care_manager_id = get_my_care_manager_id());

-- 家族: 紐づく利用者を参照可能
CREATE POLICY "family_view_their_receiver"
  ON care_receivers FOR SELECT
  USING (id IN (SELECT get_my_care_receiver_ids_as_family()));

-- --------------------------------------------
-- 4.5 family_members ポリシー
-- --------------------------------------------
-- 自分のレコードを参照可能
CREATE POLICY "family_view_own"
  ON family_members FOR SELECT
  USING (auth_id = auth.uid());

-- ケアマネ: 担当利用者の家族を参照可能
CREATE POLICY "managers_view_family"
  ON family_members FOR SELECT
  USING (care_receiver_id IN (SELECT get_my_care_receiver_ids_as_manager()));

-- ケアマネ: 担当利用者に家族を追加可能
CREATE POLICY "managers_insert_family"
  ON family_members FOR INSERT
  WITH CHECK (care_receiver_id IN (SELECT get_my_care_receiver_ids_as_manager()));

-- --------------------------------------------
-- 4.6 daily_logs ポリシー
-- --------------------------------------------
-- 家族: 自分の記録を作成可能
CREATE POLICY "family_insert_daily_logs"
  ON daily_logs FOR INSERT
  WITH CHECK (care_receiver_id IN (SELECT get_my_care_receiver_ids_as_family()));

-- 家族: 自分の記録を更新可能
CREATE POLICY "family_update_own_daily_logs"
  ON daily_logs FOR UPDATE
  USING (care_receiver_id IN (SELECT get_my_care_receiver_ids_as_family()));

-- 家族: 同じ利用者の記録を参照可能
CREATE POLICY "family_view_daily_logs"
  ON daily_logs FOR SELECT
  USING (care_receiver_id IN (SELECT get_my_care_receiver_ids_as_family()));

-- ケアマネ: 担当利用者の記録を参照可能
CREATE POLICY "managers_view_daily_logs"
  ON daily_logs FOR SELECT
  USING (care_receiver_id IN (SELECT get_my_care_receiver_ids_as_manager()));

-- --------------------------------------------
-- 4.7 feedbacks ポリシー
-- --------------------------------------------
-- 家族: フィードバックを作成可能
CREATE POLICY "family_insert_feedbacks"
  ON feedbacks FOR INSERT
  WITH CHECK (care_receiver_id IN (SELECT get_my_care_receiver_ids_as_family()));

-- 家族: 自分のフィードバックを参照可能
CREATE POLICY "family_view_own_feedbacks"
  ON feedbacks FOR SELECT
  USING (care_receiver_id IN (SELECT get_my_care_receiver_ids_as_family()));

-- ケアマネ: 担当利用者のフィードバックを参照可能
CREATE POLICY "managers_view_feedbacks"
  ON feedbacks FOR SELECT
  USING (care_receiver_id IN (SELECT get_my_care_receiver_ids_as_manager()));

-- ケアマネ: フィードバックを更新可能（ステータス変更など）
CREATE POLICY "managers_update_feedbacks"
  ON feedbacks FOR UPDATE
  USING (care_receiver_id IN (SELECT get_my_care_receiver_ids_as_manager()));

-- --------------------------------------------
-- 4.8 satisfaction_surveys ポリシー
-- --------------------------------------------
-- 家族: アンケートを作成可能
CREATE POLICY "family_insert_surveys"
  ON satisfaction_surveys FOR INSERT
  WITH CHECK (care_receiver_id IN (SELECT get_my_care_receiver_ids_as_family()));

-- 家族: 自分のアンケートを参照可能
CREATE POLICY "family_view_own_surveys"
  ON satisfaction_surveys FOR SELECT
  USING (care_receiver_id IN (SELECT get_my_care_receiver_ids_as_family()));

-- ケアマネ: 担当利用者のアンケートを参照可能
CREATE POLICY "managers_view_surveys"
  ON satisfaction_surveys FOR SELECT
  USING (care_receiver_id IN (SELECT get_my_care_receiver_ids_as_manager()));
