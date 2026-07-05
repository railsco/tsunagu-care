# データベース設計（実装準拠）

最終更新: 2026-07-06（migration 00004 時点）

Supabase (PostgreSQL 15) を使用。スキーマの正は `packages/supabase/migrations/`、
TypeScript型定義は `packages/shared/src/types/database.ts`。
本ドキュメントはその要約であり、乖離があればマイグレーションが正。

## テーブル一覧

| テーブル | 用途 |
|---|---|
| organizations | 介護事業所 |
| care_managers | ケアマネージャー（Webアプリ利用者） |
| care_receivers | 介護サービス利用者 |
| family_members | 利用者の家族（モバイルアプリ利用者） |
| daily_logs | 家族が入力する日々の介護記録 |
| feedbacks | ほんね投函（家族からのフィードバック） |
| satisfaction_surveys | 月次満足度調査（スキーマのみ・UI未実装） |

### organizations

| カラム | 型 | 備考 |
|---|---|---|
| id | uuid PK | |
| name | text NOT NULL | |
| license_number | text | 事業所番号 |
| address / phone | text | |
| plan | text | 'free' / 'standard' / 'premium'（利用制限は未実装） |
| created_at / updated_at | timestamptz | updated_atはトリガーで自動更新 |

### care_managers

| カラム | 型 | 備考 |
|---|---|---|
| id | uuid PK | |
| auth_id | uuid → auth.users(id) | ON DELETE CASCADE |
| organization_id | uuid → organizations(id) | |
| name | text NOT NULL | |
| email | text UNIQUE NOT NULL | |
| phone | text | |
| is_active | boolean | |

### care_receivers

| カラム | 型 | 備考 |
|---|---|---|
| id | uuid PK | |
| care_manager_id | uuid → care_managers(id) | ON DELETE SET NULL（担当者退職時も利用者は残す） |
| name | text NOT NULL | |
| birth_date | date | |
| gender | text | 'male' / 'female' / 'other' |
| care_level | text | '要支援1'〜'要介護5'（CHECK制約） |
| conditions | text[] | 疾患・状態リスト |
| address / notes | text | |
| is_active | boolean | 削除はソフトデリート（is_active=false）運用 |

### family_members

| カラム | 型 | 備考 |
|---|---|---|
| id | uuid PK | |
| auth_id | uuid → auth.users(id) | ON DELETE CASCADE |
| care_receiver_id | uuid → care_receivers(id) | |
| name / email / phone | text | |
| relation | text NOT NULL | 続柄（長男・配偶者など） |
| role | text | 'primary' / 'editor' / 'viewer' |
| is_primary | boolean | 主たる連絡先 |

制約: UNIQUE (care_receiver_id, auth_id) — 同一利用者への重複登録防止

### daily_logs

| カラム | 型 | 備考 |
|---|---|---|
| id | uuid PK | |
| care_receiver_id | uuid → care_receivers(id) | |
| family_member_id | uuid → family_members(id) | ON DELETE SET NULL（退会後も記録は残す） |
| log_date | date NOT NULL | |
| mood / appetite / sleep_quality / activity_level | integer | 各1〜5（CHECK制約） |
| notes / concerns | text | |
| photo_urls | text[] | Storage `photos/daily-logs/` の公開URL |

制約: UNIQUE (care_receiver_id, log_date, family_member_id)
※ upsert の onConflict はこの3カラムを指定すること

### feedbacks

| カラム | 型 | 備考 |
|---|---|---|
| id | uuid PK | |
| care_receiver_id | uuid → care_receivers(id) | |
| family_member_id | uuid → family_members(id) | ON DELETE SET NULL |
| category | text | 'service' / 'schedule' / 'cost' / 'communication' / 'other' |
| content | text NOT NULL | |
| is_anonymous | boolean | 匿名投稿フラグ |
| status | text | 'unread' / 'read' / 'addressed' |
| manager_notes | text | ケアマネの対応メモ |
| addressed_at | timestamptz | |

### feedbacks_view（読み取り専用VIEW）

feedbacks の全カラム＋投稿者情報のフラット射影。**匿名投稿の投稿者秘匿はこのVIEWで担保**する。

- `family_member_id` / `family_member_name` / `family_member_relation`:
  匿名投稿では投稿者本人以外（ケアマネ含む）に NULL で返る
- `security_invoker = on` のため基底テーブルのRLSが呼び出し元権限で適用される
- **読み取りは必ずこのVIEWを使う**（webのフィードバック一覧・詳細）。
  INSERT / UPDATE（ステータス変更・対応メモ）は基底テーブル `feedbacks` に対して行う

### satisfaction_surveys

月次満足度調査。スキーマ・型定義・seedのみ存在し、**UI/ロジックは未実装**（プッシュ通知と合わせてv1.1で実装予定）。

制約: UNIQUE (care_receiver_id, family_member_id, survey_month)

## RLS（Row Level Security）

全テーブルで有効。SECURITY DEFINER のヘルパー関数で無限再帰を回避:

- `get_my_care_manager_id()` — 自分のケアマネID
- `get_my_family_member_id()` — 自分の家族メンバーID
- `get_my_care_receiver_ids_as_family()` / `get_my_care_receiver_ids_as_manager()`

方針:
- ケアマネ: 自事業所・担当利用者・その家族・記録・フィードバックのみ参照可
- 家族: 自分に紐づく利用者の記録のみ参照可。daily_logs のINSERT/UPDATEは自分の family_member_id 所有分のみ
- 匿名フィードバック: 家族間は投稿者本人のみSELECT可（RLS）、カラム単位の秘匿は feedbacks_view

検証用クエリ: `packages/supabase/tests/rls_verification.sql`

## インデックス

- daily_logs (care_receiver_id, log_date DESC)
- feedbacks (care_receiver_id, status)
- care_receivers (care_manager_id, is_active)
- care_managers (auth_id) / family_members (auth_id) / family_members (care_receiver_id)

## 型生成

supabase CLI＋ローカルDBが使える環境では以下で生成型と手書き型の差分を確認できる:

```bash
pnpm --filter supabase gen:types
# → packages/shared/src/types/database.generated.ts に出力して手動比較
```
