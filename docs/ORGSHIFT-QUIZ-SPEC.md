# **ORGSHIFT QUIZ – MDA統合仕様書（Supabase設定付き 安全版）**

## 1. プロジェクト概要

**OrgShift Quiz** は、組織の方針・ニュース・マニュアルをクイズ形式で配信し、理解度・同意（アテステーション）・意見を即時回収・分析する社内向けプラットフォーム。
現場の「知っている」から「理解して動ける」までを短期間で実現し、誤解や周知漏れを防ぐ。

**特徴**

* コンテンツ混在配信（News / Policy / Manual）
* AI自動クイズ生成（文書やニュースから要点抽出）
* 誤答分析→再出題（理解不足を自動フォロー）
* 管理UI + iPhone回答アプリ連携
* 仕様・プロンプトをMDA化して永続管理

---

## 2. 想定ユーザー

* **Admin**：全体管理、権限設定、監査ログ
* **Editor**：コンテンツ選択、クイズ作成、配信
* **Reviewer**：承認
* **Employee**：受信、回答、同意
* **Auditor**：アテステ記録、配信履歴の監査

---

## 3. ユースケース

1. 新方針やマニュアル改訂の理解度チェックと同意記録
2. 最新ニュース・業界変化の周知と理解確認
3. FAQや現場知識をマニュアル化して出題
4. 誤答率の高い設問を再出題して理解補強

---

## 4. 機能概要

### 4.1 コンテンツタイプ

* **News**：教育・自治体・IT・地域ニュースをRSS/APIで取得 → AI要約 → AI出題
* **Policy**：社内方針文書（PDF/Word/TXT）、版管理、施行日設定、AI出題、アテステ連動
* **Manual**：手入力またはCSVインポート、AIディストラクター生成

### 4.2 管理UI（Web）

* コンテンツハブ：News / Policy / Manualを選び、AI下書き生成→承認→Tray追加
* 配信バスケット：問題束ね、セグメント設定、期限設定、アテステ必須設定、プレビュー、公開
* ダッシュボード：配信状況、回答率、正答率、誤答分析、承認待ち件数
* 集計結果：由来別集計、誤答率TOP、再出題
* 監査ログ
* 設定：会社情報、権限、通知チャネル

### 4.3 回答アプリ（iPhone/Android）

* ホーム：新着配信カード（出典タグ付き）、期限表示
* クイズ回答：設問、選択肢、出典（News）、版情報（Policy）
* アテステ画面：同意チェック必須（Policy）
* 結果：正答/誤答、解説、再出題予定
* 履歴：過去配信、回答履歴、同意履歴

### 4.4 AI機能

* 自動クイズ生成（News/Policy/Manual）
* 誤答分析＆再出題

---

## 5. データ構造（主要テーブル抜粋）

```sql
-- 共通
quizzes(source_mix text[])
questions(source_type text, citation_url text, citation_quote text, policy_doc_id uuid, policy_version text)

-- News
news_sources(...)
news_articles(...)
news_quiz_drafts(...)

-- Policy
policy_documents(...)
policy_quiz_drafts(...)

-- Manual
manual_questions(...)

-- 回答・アテステ
responses(...)
response_items(...)
attestations(...)

-- 監査
audit_logs(...)
```

---

## 6. Edge Functions（代表）

* `news.pull` / `news.generate_quiz` / `news.approve`
* `policy.upload` / `policy.generate_quiz` / `policy.approve`
* `dispatch.build` / `dispatch.publish`
* `responses.submit` / `analysis.wrong_answers` / `reissue.quiz`

---

## 7. 配信フロー

1. News/Policy/Manual選択→AI下書き→承認→Tray追加
2. 配信バスケットで束ねて設定→公開
3. 回答アプリに通知
4. 回答・アテステ収集
5. 集計・誤答分析
6. 再出題

---

## 8. Supabase接続設定（安全版）

本プロジェクトは以下の環境変数を使用して Supabase に接続する。

* `NEXT_PUBLIC_SUPABASE_URL` : Supabase プロジェクト URL
  例: `"https://fvdofdqzfxccbutsyjxh.supabase.co"`
* `NEXT_PUBLIC_SUPABASE_ANON_KEY` : anon key（公開用）
  値は `.env` に保存し、ブラウザ/モバイルアプリから使用
* `SUPABASE_SERVICE_ROLE_KEY` : service role key（管理者用）
  値は `.env` に保存し、**サーバー側のみ**で使用（RLS設定・管理処理）

### `.env` 設定例

```env
NEXT_PUBLIC_SUPABASE_URL="https://fvdofdqzfxccbutsyjxh.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="（anon key）"
SUPABASE_SERVICE_ROLE_KEY="（service role key）"
```

> **注意**
>
> * `SUPABASE_SERVICE_ROLE_KEY` はクライアントコードに埋め込まない。
> * `.env` は `.gitignore` に追加する。
> * 本番環境ではVercelやRenderなどの環境変数機能を使用する。

---

## 9. MDA（Master Development Artifact）構成

```
docs/
  ORGSHIFT-QUIZ-SPEC.md      ← 本仕様書
  AI-FEATURES.md             ← AI生成・誤答分析要件
  DB/SCHEMA.sql              ← Supabase用DDL/RLS
  WORKFLOWS/NEWS_POLICY.md   ← 配信ワークフロー詳細
  GUARDRAILS.md              ← 禁止事項
prompts/
  claude/BOOTSTRAP.md        ← 初期開発指示
  claude/ITERATE.md          ← 差分開発指示
  claude/REVIEW.md           ← レビュー観点
fixtures/
  news_sample.json
  policy_sample.pdf
CHANGELOG.md
README.md
```

---

## 10. Claude Code初期指示（BOOTSTRAP.md）

> 1. `docs/ORGSHIFT-QUIZ-SPEC.md`を読み込み、仕様を理解せよ。
> 2. `docs/DB/SCHEMA.sql`を生成し、Supabaseに適用できる形にせよ。
> 3. Next.jsで管理UI骨組みを作成（/content-hub, /dispatch-builder, /dashboard, /quizzes/...）。
> 4. ExpoでiPhone回答アプリ骨組みを作成（Home, Quiz, Result, History）。
> 5. Edge Functions（news.pull, news.generate_quiz, policy.upload 等）の雛形を生成。
> 6. `.env.example` に環境変数（URL/anon key/service role key）を定義。
> 7. 最低限のE2Eフロー（クイズ作成→配信→回答→集計）を実装。
> 8. 完成後、`CHANGELOG.md`を更新。

---

これを `docs/ORGSHIFT-QUIZ-SPEC.md` に保存すれば、Claude Codeに渡すだけでMDA生成と初期開発が始められます。