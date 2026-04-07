-- ============================================
-- つなぐケア デモデータ
-- ============================================
-- 注意: auth.users の行を先に作成しないと、care_managers / family_members の
-- auth_id 外部キーが参照エラーになります。以下で最低限の auth.users を挿入しています。
-- パスワードは 'password123' の bcrypt ハッシュ（ローカル開発専用）。

-- ============================================
-- 0. auth.users（Supabase Auth ローカル開発用）
-- ============================================
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, aud, role, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES
  -- ケアマネージャー: 田中花子
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000000', 'tanaka.hanako@sakura-care.example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345', NOW(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW()),
  -- ケアマネージャー: 鈴木太郎
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '00000000-0000-0000-0000-000000000000', 'suzuki.taro@sakura-care.example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345', NOW(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW()),
  -- 家族: 山田健一
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'yamada.kenichi@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345', NOW(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW()),
  -- 家族: 山田由美子
  ('11111111-1111-1111-1111-111111111112', '00000000-0000-0000-0000-000000000000', 'yamada.yumiko@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345', NOW(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW()),
  -- 家族: 佐藤美咲
  ('22222222-2222-2222-2222-222222222221', '00000000-0000-0000-0000-000000000000', 'sato.misaki@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345', NOW(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW()),
  -- 家族: 佐藤隆
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'sato.takashi@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345', NOW(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW()),
  -- 家族: 高橋恵子
  ('33333333-3333-3333-3333-333333333331', '00000000-0000-0000-0000-000000000000', 'takahashi.keiko@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345', NOW(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW()),
  -- 家族: 高橋正樹
  ('33333333-3333-3333-3333-333333333332', '00000000-0000-0000-0000-000000000000', 'takahashi.masaki@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345', NOW(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW()),
  -- 家族: 渡辺明
  ('44444444-4444-4444-4444-444444444441', '00000000-0000-0000-0000-000000000000', 'watanabe.akira@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345', NOW(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW()),
  -- 家族: 渡辺真理
  ('44444444-4444-4444-4444-444444444442', '00000000-0000-0000-0000-000000000000', 'watanabe.mari@example.com', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345', NOW(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 1. 事業所
-- ============================================
INSERT INTO organizations (id, name, license_number, address, phone, plan)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'さくら居宅介護支援事業所',
  '1371234567',
  '東京都世田谷区桜丘3-15-8 さくらビル2F',
  '03-5432-1234',
  'standard'
);

-- ============================================
-- 2. ケアマネージャー
-- ============================================
-- ダミーauth_id（実際のSupabase Auth連携時に差し替え）
INSERT INTO care_managers (id, auth_id, organization_id, name, email, phone, is_active)
VALUES
  (
    'b0000000-0000-0000-0000-000000000001',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', -- ダミーauth_id: 田中花子
    'a0000000-0000-0000-0000-000000000001',
    '田中 花子',
    'tanaka.hanako@sakura-care.example.com',
    '090-1234-5678',
    true
  ),
  (
    'b0000000-0000-0000-0000-000000000002',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', -- ダミーauth_id: 鈴木太郎
    'a0000000-0000-0000-0000-000000000001',
    '鈴木 太郎',
    'suzuki.taro@sakura-care.example.com',
    '090-8765-4321',
    true
  );

-- ============================================
-- 3. 利用者（要介護者）
-- ============================================
-- 田中花子担当: 3名
INSERT INTO care_receivers (id, care_manager_id, name, birth_date, gender, care_level, conditions, address, notes, is_active)
VALUES
  (
    'c0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001', -- 田中花子
    '山田 太郎',
    '1938-03-15',
    'male',
    '要介護2',
    ARRAY['認知症', '高血圧'],
    '東京都世田谷区経堂1-5-10',
    '穏やかな性格。囲碁が趣味。朝のラジオ体操を楽しみにしている。甘いものが好き。',
    true
  ),
  (
    'c0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000001', -- 田中花子
    '佐藤 はな',
    '1942-07-22',
    'female',
    '要介護3',
    ARRAY['脳梗塞後遺症', '高血圧', '骨粗鬆症'],
    '東京都世田谷区船橋2-8-3',
    '右半身に軽い麻痺あり。リハビリに意欲的。花を育てることが好き。',
    true
  ),
  (
    'c0000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000001', -- 田中花子
    '高橋 一郎',
    '1945-11-08',
    'male',
    '要介護1',
    ARRAY['糖尿病', '白内障'],
    '東京都世田谷区千歳台4-12-7',
    '元教師。読書が好きだが視力低下で大きな文字の本を好む。食事制限あり。',
    true
  );

-- 鈴木太郎担当: 1名
INSERT INTO care_receivers (id, care_manager_id, name, birth_date, gender, care_level, conditions, address, notes, is_active)
VALUES
  (
    'c0000000-0000-0000-0000-000000000004',
    'b0000000-0000-0000-0000-000000000002', -- 鈴木太郎
    '渡辺 節子',
    '1940-01-30',
    'female',
    '要介護4',
    ARRAY['パーキンソン病', '便秘症'],
    '東京都世田谷区祖師谷5-3-21',
    '動作緩慢、振戦あり。転倒リスク高い。穏やかだが意思表示ははっきりしている。編み物が得意だった。',
    true
  );

-- ============================================
-- 4. 家族
-- ============================================
-- 山田太郎の家族
INSERT INTO family_members (id, auth_id, care_receiver_id, name, email, phone, relation, role, is_primary)
VALUES
  (
    'd0000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111', -- ダミーauth_id
    'c0000000-0000-0000-0000-000000000001',
    '山田 健一',
    'yamada.kenichi@example.com',
    '090-1111-0001',
    '長男',
    'primary',
    true
  ),
  (
    'd0000000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111112', -- ダミーauth_id
    'c0000000-0000-0000-0000-000000000001',
    '山田 由美子',
    'yamada.yumiko@example.com',
    '080-1111-0002',
    '長女',
    'viewer',
    false
  );

-- 佐藤はなの家族
INSERT INTO family_members (id, auth_id, care_receiver_id, name, email, phone, relation, role, is_primary)
VALUES
  (
    'd0000000-0000-0000-0000-000000000003',
    '22222222-2222-2222-2222-222222222221', -- ダミーauth_id
    'c0000000-0000-0000-0000-000000000002',
    '佐藤 美咲',
    'sato.misaki@example.com',
    '090-2222-0001',
    '長女',
    'primary',
    true
  ),
  (
    'd0000000-0000-0000-0000-000000000004',
    '22222222-2222-2222-2222-222222222222', -- ダミーauth_id
    'c0000000-0000-0000-0000-000000000002',
    '佐藤 隆',
    'sato.takashi@example.com',
    '080-2222-0002',
    '長男',
    'viewer',
    false
  );

-- 高橋一郎の家族
INSERT INTO family_members (id, auth_id, care_receiver_id, name, email, phone, relation, role, is_primary)
VALUES
  (
    'd0000000-0000-0000-0000-000000000005',
    '33333333-3333-3333-3333-333333333331', -- ダミーauth_id
    'c0000000-0000-0000-0000-000000000003',
    '高橋 恵子',
    'takahashi.keiko@example.com',
    '090-3333-0001',
    '配偶者',
    'primary',
    true
  ),
  (
    'd0000000-0000-0000-0000-000000000006',
    '33333333-3333-3333-3333-333333333332', -- ダミーauth_id
    'c0000000-0000-0000-0000-000000000003',
    '高橋 正樹',
    'takahashi.masaki@example.com',
    '080-3333-0002',
    '長男',
    'editor',
    false
  );

-- 渡辺節子の家族
INSERT INTO family_members (id, auth_id, care_receiver_id, name, email, phone, relation, role, is_primary)
VALUES
  (
    'd0000000-0000-0000-0000-000000000007',
    '44444444-4444-4444-4444-444444444441', -- ダミーauth_id
    'c0000000-0000-0000-0000-000000000004',
    '渡辺 明',
    'watanabe.akira@example.com',
    '090-4444-0001',
    '長男',
    'primary',
    true
  ),
  (
    'd0000000-0000-0000-0000-000000000008',
    '44444444-4444-4444-4444-444444444442', -- ダミーauth_id
    'c0000000-0000-0000-0000-000000000004',
    '渡辺 真理',
    'watanabe.mari@example.com',
    '080-4444-0002',
    '長女',
    'viewer',
    false
  );

-- ============================================
-- 5. 日々の記録（山田太郎 - 過去14日分）
-- ============================================
-- 自然な変動をつけたスコア（気分・食欲・睡眠・活動量）
INSERT INTO daily_logs (care_receiver_id, family_member_id, log_date, mood, appetite, sleep_quality, activity_level, notes, concerns)
VALUES
  -- 14日前
  (
    'c0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    CURRENT_DATE - INTERVAL '14 days',
    4, 4, 3, 3,
    '朝から機嫌が良く、囲碁の本を読んでいました。',
    NULL
  ),
  -- 13日前
  (
    'c0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    CURRENT_DATE - INTERVAL '13 days',
    4, 5, 4, 4,
    'よく食べ、デイサービスでも活発に過ごしたそうです。',
    NULL
  ),
  -- 12日前
  (
    'c0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    CURRENT_DATE - INTERVAL '12 days',
    3, 3, 3, 3,
    NULL,
    NULL
  ),
  -- 11日前
  (
    'c0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    CURRENT_DATE - INTERVAL '11 days',
    2, 2, 2, 2,
    '少し元気がない様子。食欲も落ちています。',
    '昨晩あまり眠れなかったようで、日中もぼんやりしていることが多かったです。風邪の兆候はないか注意してみます。'
  ),
  -- 10日前
  (
    'c0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    CURRENT_DATE - INTERVAL '10 days',
    3, 3, 3, 2,
    '昨日より少し回復。お粥を食べました。',
    'まだ本調子ではないようです。'
  ),
  -- 9日前
  (
    'c0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    CURRENT_DATE - INTERVAL '9 days',
    4, 4, 4, 3,
    '調子が戻ってきました。好きな煮物をよく食べました。',
    NULL
  ),
  -- 8日前
  (
    'c0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    CURRENT_DATE - INTERVAL '8 days',
    4, 4, 4, 4,
    'ラジオ体操を楽しんでいました。',
    NULL
  ),
  -- 7日前
  (
    'c0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    CURRENT_DATE - INTERVAL '7 days',
    5, 5, 4, 4,
    '孫が遊びに来て、とても喜んでいました。一緒に将棋を指しました。',
    NULL
  ),
  -- 6日前
  (
    'c0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    CURRENT_DATE - INTERVAL '6 days',
    4, 4, 5, 4,
    'ぐっすり眠れたようです。',
    NULL
  ),
  -- 5日前
  (
    'c0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    CURRENT_DATE - INTERVAL '5 days',
    3, 4, 3, 3,
    NULL,
    NULL
  ),
  -- 4日前
  (
    'c0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    CURRENT_DATE - INTERVAL '4 days',
    4, 3, 4, 3,
    '食欲は普通ですが、機嫌は良かったです。',
    NULL
  ),
  -- 3日前
  (
    'c0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    CURRENT_DATE - INTERVAL '3 days',
    3, 4, 3, 4,
    'デイサービスでレクリエーションを楽しんだそうです。',
    NULL
  ),
  -- 2日前
  (
    'c0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    CURRENT_DATE - INTERVAL '2 days',
    4, 4, 4, 4,
    '散歩に出かけ、桜の木を見て喜んでいました。',
    NULL
  ),
  -- 昨日
  (
    'c0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    CURRENT_DATE - INTERVAL '1 day',
    3, 3, 2, 3,
    NULL,
    '夜中にトイレに何度か起きたようです。睡眠の質が少し心配です。'
  ),
  -- 今日
  (
    'c0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    CURRENT_DATE,
    4, 4, 3, 3,
    '朝食をしっかり食べました。今日は穏やかに過ごしています。',
    NULL
  );

-- ============================================
-- 6. フィードバック（ほんね投函）- 3件
-- ============================================
INSERT INTO feedbacks (id, care_receiver_id, family_member_id, category, content, is_anonymous, status, manager_notes, created_at)
VALUES
  -- サービス内容についてのフィードバック
  (
    'e0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001', -- 山田太郎
    'd0000000-0000-0000-0000-000000000001', -- 山田健一
    'service',
    'デイサービスの入浴介助について、もう少し丁寧に体を拭いていただけると嬉しいです。帰宅後に背中が少し湿っていることがあります。',
    false,
    'read',
    NULL,
    CURRENT_TIMESTAMP - INTERVAL '5 days'
  ),
  -- スケジュールについてのフィードバック（匿名）
  (
    'e0000000-0000-0000-0000-000000000002',
    'c0000000-0000-0000-0000-000000000002', -- 佐藤はな
    'd0000000-0000-0000-0000-000000000003', -- 佐藤美咲
    'schedule',
    '訪問リハビリの時間を午前中から午後に変更していただくことは可能でしょうか？母は朝が苦手で、午後の方が調子が良いことが多いです。',
    true,
    'unread',
    NULL,
    CURRENT_TIMESTAMP - INTERVAL '2 days'
  ),
  -- コミュニケーションについてのフィードバック
  (
    'e0000000-0000-0000-0000-000000000003',
    'c0000000-0000-0000-0000-000000000003', -- 高橋一郎
    'd0000000-0000-0000-0000-000000000005', -- 高橋恵子
    'communication',
    'いつもご連絡いただきありがとうございます。できれば月に一度、直接お会いしてお話しする機会があると安心です。電話だけだと伝えにくいこともあるので。',
    false,
    'addressed',
    '来月より月1回の訪問面談を設定することで対応。次回は15日14時に訪問予定。',
    CURRENT_TIMESTAMP - INTERVAL '10 days'
  );

-- ============================================
-- 7. 満足度調査 - 1件
-- ============================================
INSERT INTO satisfaction_surveys (id, care_receiver_id, family_member_id, survey_month, overall_score, care_plan_score, communication_score, comment, created_at)
VALUES
  (
    'f0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001', -- 山田太郎
    'd0000000-0000-0000-0000-000000000001', -- 山田健一
    DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month'),
    4,
    4,
    5,
    '田中さんにはいつも親身になって相談に乗っていただき感謝しています。父も田中さんのことを信頼しているようで、安心してお任せできます。今後ともよろしくお願いいたします。',
    CURRENT_TIMESTAMP - INTERVAL '15 days'
  );
