# OrgShift Quiz

組織内の方針・ニュース・マニュアルをクイズ形式で配信し、理解度・同意（アテステーション）・意見を即時回収・分析する社内向けプラットフォーム。

## 概要

OrgShift Quizは、現場の「知っている」から「理解して動ける」までを短期間で実現し、誤解や周知漏れを防ぐことを目的としています。

### 主な機能

- 📰 **News**: RSS/APIからニュースを取得しAIクイズ生成
- 📜 **Policy**: 社内方針文書からAIクイズ生成、アテステーション連動
- 📖 **Manual**: 手動/CSVでクイズ作成、AIディストラクター生成
- 🤖 **AI機能**: 自動クイズ生成、誤答分析、再出題
- 📱 **モバイル対応**: iPhone/Androidアプリで回答
- 📊 **分析**: リアルタイム集計、誤答分析、ダッシュボード

## アーキテクチャ

### 技術スタック

- **バックエンド**: Supabase (PostgreSQL, Edge Functions, Auth, Storage)
- **管理UI**: Next.js 14, TypeScript, Tailwind CSS
- **モバイルアプリ**: Expo (React Native)
- **AI**: OpenAI API / Claude API
- **通知**: Push Notifications, Email (Resend)

### プロジェクト構成

```
OrgShiftQuiz/
├── docs/                    # MDAドキュメント
│   ├── ORGSHIFT-QUIZ-SPEC.md  # 統合仕様書
│   ├── AI-FEATURES.md         # AI機能要件
│   ├── DB/
│   │   └── SCHEMA.sql        # DBスキーマ
│   ├── WORKFLOWS/            # ワークフロー詳細
│   └── GUARDRAILS.md         # 禁止事項
├── prompts/                 # AIプロンプト
│   └── claude/
│       ├── BOOTSTRAP.md     # 初期開発指示
│       ├── ITERATE.md       # 差分開発指示
│       └── REVIEW.md        # レビュー観点
├── fixtures/                # テストデータ
│   ├── news_sample.json
│   └── policy_sample.json
├── web/                     # Next.js管理UI (作成予定)
├── mobile/                  # Expoアプリ (作成予定)
├── supabase/                # Supabase設定 (作成予定)
├── .env.example             # 環境変数テンプレート
├── README.md                # 本ファイル
└── CHANGELOG.md             # 変更履歴
```

## セットアップ

### 1. Supabaseプロジェクト作成

1. [Supabase](https://supabase.com)で新規プロジェクト作成
2. Project URLとAPI Keyを取得

### 2. 環境設定

```bash
cp .env.example .env
```

`.env`ファイルを編集:

```env
NEXT_PUBLIC_SUPABASE_URL="your-project-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### 3. データベース初期化

```bash
# Supabase CLIをインストール（未インストールの場合）
brew install supabase/tap/supabase

# データベーススキーマ適用
supabase db push --db-url="your-database-url"
```

### 4. 依存関係インストールと起動

```bash
# Web管理UI
cd web
npm install
npm run dev

# モバイルアプリ
cd mobile
npm install
npx expo start
```

## MDA（Master Development Artifact）

本プロジェクトはMDAアプローチを採用しています。

### MDAの利点

1. **仕様の永続化**: コードとは別に仕様・設計を管理
2. **AI連携**: Claude Code等にMDAを読ませて開発効率化
3. **知識継承**: チーム変更時もコンテキスト保持

### 主要MDAドキュメント

- `docs/ORGSHIFT-QUIZ-SPEC.md`: 全体仕様
- `docs/AI-FEATURES.md`: AI機能要件
- `docs/DB/SCHEMA.sql`: データベース定義
- `prompts/claude/`: AI開発指示

## 開発フロー

### Claude Codeを使った初期開発

1. Claude Codeに`prompts/claude/BOOTSTRAP.md`を読ませる
2. MDAに基づいて自動開発
3. コードレビュー実施

### 機能追加

1. `docs/`に仕様追記
2. `prompts/claude/ITERATE.md`を使用
3. テストとドキュメント更新

## セキュリティ

### 重要なセキュリティ事項

- ✅ RLS（Row Level Security）必須
- ✅ `service_role_key`はサーバーのみ
- ✅ SQLインジェクション対策
- ✅ 環境変数の適切な管理
- ✅ 監査ログの完全性

詳細は`docs/GUARDRAILS.md`を参照。

## コントリビューション

1. Forkしてfeatureブランチ作成
2. MDAドキュメント更新
3. テスト追加
4. Pull Request作成

## ライセンス

MIT License

## サポート

- 問題報告: [Issues](https://github.com/yourusername/orgshift-quiz/issues)
- ドキュメント: `docs/`フォルダ参照

---

*OrgShift Quiz - 組織の理解を深め、行動を変える*