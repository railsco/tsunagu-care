# つなぐケア

ケアマネージャー（介護支援専門員）と利用者家族をつなぐプラットフォーム

## 概要

家族が毎日の介護記録を簡単に入力し、ケアマネがWebダッシュボードで担当利用者の状態を把握できるサービスです。

## プロジェクト構成

```
tsunagu-care/
├── apps/
│   ├── web/                  # ケアマネ向けNext.jsアプリ
│   └── mobile/               # 家族向けExpo (React Native)アプリ
├── packages/
│   ├── shared/               # 共有型定義・ユーティリティ
│   └── supabase/             # Supabase設定・マイグレーション
└── docs/                     # ドキュメント
```

## セットアップ

### 前提条件

- Node.js 18以上
- pnpm 9以上

### インストール

```bash
# 依存関係のインストール
pnpm install

# 環境変数の設定
cp .env.example .env
# .envファイルにSupabaseの認証情報を設定
```

## 開発

```bash
# ケアマネ向けWebアプリの起動
pnpm dev:web

# 家族向けモバイルアプリの起動
pnpm dev:mobile

# 型チェック
pnpm typecheck
```

## データベース

```bash
# マイグレーションの実行
pnpm db:migrate

# シードデータの投入
pnpm db:seed
```

## ライセンス

UNLICENSED - 非公開
