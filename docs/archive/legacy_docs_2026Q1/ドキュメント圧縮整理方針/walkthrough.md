# 修正内容の確認

## 実施内容
- `docs` 配下を棚卸しし、`readmes` 以外の履歴ドキュメント構成を確認した。
- 圧縮・整理のための再編方針を策定し、`task.md` / `implementation_plan.md` / `walkthrough.md` に記録した。

## 調査で分かったこと
- `docs/readmes` 以外に `63` 個のトピックフォルダがある。
- それぞれ `task.md` / `implementation_plan.md` / `walkthrough.md` の3点セットで、合計 `189` ファイル。
- 見出し構成は高頻度で重複しており、テンプレート的な記述が多い。
- 既に `docs/readmes` は「長期安定の正本」という設計になっており、履歴系の圧縮先として `history` 層を追加するのが自然。

## 提案した最終像
- 正本: `docs/readmes`（現状維持）
- 履歴要約: `docs/history`（index・timeline・カテゴリ別サマリー）
- 原本退避: `docs/archive/legacy_docs_2026Q1`（段階的に縮退）

## この時点で未実施のこと
- 実ファイル移動（63トピックの `archive` 退避）
- `history` 本体ファイルの生成と自動抽出スクリプト整備

## 次にやると良い順番
1. `docs/history` の雛形を作る。
2. 63トピックを正規化して `history/index.md` に集約する。
3. 問題なければ旧トピック群を `docs/archive` へ移動する。
