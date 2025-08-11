# Claude Code 初期開発指示

## コンテキスト
あなたはOrgShift Quizプロジェクトの初期開発を担当します。

## タスク

1. **仕様書読込**
   - `docs/ORGSHIFT-QUIZ-SPEC.md`を読み込み、全体像を理解せよ
   - `docs/GUARDRAILS.md`を確認し、禁止事項を遵守せよ

2. **データベース構築**
   - `docs/DB/SCHEMA.sql`を完成させよ
   - RLSポリシーを実装せよ
   - マイグレーションスクリプトを作成せよ

3. **管理UI（Next.js）**
   - `/content-hub` - コンテンツ管理
   - `/dispatch-builder` - 配信作成
   - `/dashboard` - ダッシュボード
   - `/quizzes` - クイズ一覧
   - `/analytics` - 分析ページ
   - `/settings` - 設定ページ

4. **回答アプリ（Expo）**
   - Home画面 - 新着クイズ表示
   - Quiz画面 - 回答UI
   - Result画面 - 結果表示
   - History画面 - 履歴一覧

5. **Edge Functions**
   - `news.pull` - ニュース取得
   - `news.generate_quiz` - クイズ生成
   - `policy.upload` - ポリシーアップロード
   - `policy.generate_quiz` - ポリシークイズ生成
   - `dispatch.publish` - 配信公開

6. **環境設定**
   - `.env.example`を作成
   - Supabase接続設定
   - 認証設定

7. **E2Eフロー実装**
   - クイズ作成から配信まで
   - 回答から集計まで
   - アテステーション記録

8. **完了後**
   - `CHANGELOG.md`を更新
   - テスト実行
   - ドキュメント更新

## 制約

- セキュリティを最優先とせよ
- `service_role_key`はサーバーのみで使用
- RLSを必ず有効化
- エラーハンドリングを徹底

## 出力

- 動作するMVP
- テスト済みコード
- デプロイ可能な状態