# つなぐケア 開発ガイド

ケアマネージャー（Web）と利用者家族（モバイル）をつなぐ介護記録プラットフォーム。
このファイルはどのモデル・エージェント（Claude Opus/Sonnet、Codex等）でも作業を再開できるように書かれている。
**推測で書かず、必ず該当ファイルを読んでから変更すること。**

## 構成

pnpmモノレポ（Node 18+ / pnpm 9+）:

- `apps/web` — ケアマネ向け Next.js 16（App Router, React 19, Tailwind 4, Zustand, Radix UI, Recharts, sonner）
- `apps/mobile` — 家族向け Expo SDK 54（Expo Router, NativeWind, Zustand）
- `packages/shared` — 型定義・定数・ユーティリティ（`@tsunagu-care/shared`）
- `packages/supabase` — マイグレーション（00001〜00004）・seed・RLS
- DBはホスト版Supabase。**この開発機には supabase CLI / Docker がない**（DB操作はリモートかSQLエディタで行う）

## コマンド

```bash
pnpm typecheck            # 全パッケージ型チェック（変更後は必ず実行）
pnpm dev:web              # Webアプリ起動（localhost:3000）
pnpm dev:mobile           # Expoアプリ起動
pnpm --filter web build   # 本番ビルド検証
```

## 絶対に守る設計ルール

1. **フィードバックの読み取りは `feedbacks_view`、書き込みは `feedbacks`**。
   匿名投稿の投稿者秘匿はVIEWで担保している（RLSではカラム単位の秘匿ができない）。
   基底テーブルから直接SELECTすると匿名投稿者のIDが漏れる。
2. **VIEWにCASE式を通したFKカラムはPostgRESTのembed（`family_member:family_members(...)`）が効かない**。
   そのため feedbacks_view は `family_member_name` / `family_member_relation` をフラット射影している。
   ネスト形への変換は `apps/web/src/lib/feedback.ts` の `toFeedbackWithRelations()` を使う。
3. **`Database`型（`packages/shared/src/types/database.ts`）は手書き**。
   スキーマ変更時は migration と同時に必ず更新する。`Relationships` 配列を埋めないと
   embedded selectの型推論が壊れ、全クエリ結果が `never` になる。
4. **`as unknown as` キャスト禁止**（現在0件）。型が通らない場合はキャストせず、
   Database型のRelationships/Row定義の不備を疑うこと。
5. **@supabase/ssr と supabase-js はペアで更新する**（ssr 0.12 は supabase-js ^2.108 がpeer要件）。
   バージョン不整合はジェネリクスの受け渡しが壊れ、全クエリが `never` 型になる形で現れる。
6. **daily_logs の upsert は `onConflict: 'care_receiver_id,log_date,family_member_id'`**（3カラム）。
   ユニーク制約と完全一致させないと実行時エラーになる。
7. **エラーの黙殺禁止**。web は sonner の `toast.error`、mobile は `@/lib/errors` の
   `showError` / `confirmDialog` を使う。`alert()` は使わない。
8. 要介護度のグループ判定・スコア絵文字は `@tsunagu-care/shared` の
   `getCareLevelGroup()` / `getScoreEmoji()` を使う（文字列 `includes` 判定を書かない）。

## Git運用

- mainに直接コミットしない。feature branchを切る。コミットメッセージは日本語で内容が分かるように
- `vercel.json` の削除（作業ツリーに以前からあるD状態）と `.omc/` はコミットに含めない
- 現在の作業ブランチ: `feature/improvement-2026-07`（改善実装10コミット済み・main未マージ）

## 現在の状態と残作業

進捗の正は `STATE.md`（リポジトリ直下・未追跡）。要点:

1. **migration 00004 がリモートSupabase未適用**（最優先）。
   適用まで webのフィードバック表示は動かない（feedbacks_view が存在しないため）。
   適用: Supabase SQLエディタで `packages/supabase/migrations/00004_data_integrity.sql` を実行、
   または CLI環境で `supabase db push`
2. 適用後 `packages/supabase/tests/rls_verification.sql` の5検証を実行
   （seedのauth_id: ケアマネ=`aaaaaaaa-...aaaa`、家族=`11111111-...1111`）
3. Supabaseダッシュボード → Auth → Redirect URLs に本番ドメインの `/reset-password` を追加
4. 実機確認後 main へマージ
5. v1.1候補: プッシュ通知（expo-notifications、実装ゼロ）、満足度調査UI
   （satisfaction_surveysテーブル・型は存在、UIなし）、plan別利用者数制限（上限値の仕様が未定）

## ドキュメント

- DB設計（実装準拠）: `docs/api.md` — 乖離時は `packages/supabase/migrations/` が正
- 改善計画の全文: `~/.claude/plans/sharded-imagining-flute.md`
- 案件メモリ: `~/.claude/projects/-Users-takedagishi/memory/project_tsunagu_care.md`
