# つなぐケア API ドキュメント

## 概要

つなぐケアは Supabase をバックエンドとして使用しています。
認証・認可は Supabase Auth と Row Level Security (RLS) で管理されます。

## 認証

### サインアップ

```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
});
```

### ログイン

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
});
```

### ログアウト

```typescript
const { error } = await supabase.auth.signOut();
```

## データモデル

### profiles（プロフィール）

| カラム | 型 | 説明 |
|--------|------|------|
| id | uuid | ユーザーID（auth.usersと連携） |
| email | text | メールアドレス |
| role | user_role | ロール（care_manager/family） |
| created_at | timestamptz | 作成日時 |
| updated_at | timestamptz | 更新日時 |

### care_managers（ケアマネージャー）

| カラム | 型 | 説明 |
|--------|------|------|
| id | uuid | ケアマネージャーID |
| user_id | uuid | プロフィールID |
| name | text | 氏名 |
| organization | text | 所属組織 |
| phone | text | 電話番号 |
| created_at | timestamptz | 作成日時 |
| updated_at | timestamptz | 更新日時 |

### care_recipients（利用者）

| カラム | 型 | 説明 |
|--------|------|------|
| id | uuid | 利用者ID |
| care_manager_id | uuid | 担当ケアマネージャーID |
| name | text | 氏名 |
| birth_date | date | 生年月日 |
| care_level | care_level | 介護レベル |
| notes | text | 備考 |
| created_at | timestamptz | 作成日時 |
| updated_at | timestamptz | 更新日時 |

### families（家族）

| カラム | 型 | 説明 |
|--------|------|------|
| id | uuid | 家族ID |
| user_id | uuid | プロフィールID |
| care_recipient_id | uuid | 利用者ID |
| name | text | 氏名 |
| relationship | text | 続柄 |
| phone | text | 電話番号 |
| created_at | timestamptz | 作成日時 |
| updated_at | timestamptz | 更新日時 |

### care_records（介護記録）

| カラム | 型 | 説明 |
|--------|------|------|
| id | uuid | 記録ID |
| care_recipient_id | uuid | 利用者ID |
| family_id | uuid | 記録者（家族）ID |
| record_date | date | 記録日 |
| meal_status | meal_status | 食事状態 |
| sleep_status | sleep_status | 睡眠状態 |
| mood | mood_status | 気分 |
| physical_condition | physical_condition | 体調 |
| notes | text | メモ |
| created_at | timestamptz | 作成日時 |
| updated_at | timestamptz | 更新日時 |

## 列挙型

### user_role
- `care_manager`: ケアマネージャー
- `family`: 家族

### care_level
- `support_1`: 要支援1
- `support_2`: 要支援2
- `care_1`: 要介護1
- `care_2`: 要介護2
- `care_3`: 要介護3
- `care_4`: 要介護4
- `care_5`: 要介護5

### meal_status
- `good`: 良好
- `fair`: 普通
- `poor`: 少なめ
- `not_eaten`: 食べていない

### sleep_status
- `good`: よく眠れた
- `fair`: 普通
- `poor`: あまり眠れなかった

### mood_status
- `good`: 良い
- `normal`: 普通
- `poor`: 悪い

### physical_condition
- `good`: 良好
- `normal`: 普通
- `poor`: 悪い
- `needs_attention`: 要注意

## クエリ例

### 担当利用者一覧の取得（ケアマネ向け）

```typescript
const { data, error } = await supabase
  .from('care_recipients')
  .select(`
    *,
    care_records (
      record_date,
      meal_status,
      sleep_status,
      mood,
      physical_condition,
      notes
    )
  `)
  .order('name');
```

### 介護記録の登録（家族向け）

```typescript
const { data, error } = await supabase
  .from('care_records')
  .insert({
    care_recipient_id: 'uuid',
    family_id: 'uuid',
    record_date: '2024-01-15',
    meal_status: 'good',
    sleep_status: 'fair',
    mood: 'good',
    physical_condition: 'normal',
    notes: '今日は調子が良さそうでした',
  });
```

### 利用者の最新記録を取得

```typescript
const { data, error } = await supabase
  .from('care_records')
  .select('*')
  .eq('care_recipient_id', 'uuid')
  .order('record_date', { ascending: false })
  .limit(7);
```
