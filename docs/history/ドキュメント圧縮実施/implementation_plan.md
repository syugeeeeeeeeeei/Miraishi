# 実装計画

## 方針
- `readmes` は正本として維持し、修正履歴は `history` に集約する。
- 旧3点セットは削除せず `archive` に退避し、必要時に参照可能な状態を保つ。

## 実装ステップ
1. `docs` 直下のトピックフォルダを走査し、要約・カテゴリ・検証情報を抽出する。
2. `docs/history/` に `README.md` / `index.md` / `timeline.md` / `by_domain/*.md` を生成する。
3. 旧トピックフォルダを `docs/archive/legacy_docs_2026Q1/` へ移動する。
4. `docs/readmes/README.md` に履歴導線を追加する。
5. `docs/archive/README.md` と `docs/history/by_domain/README.md` を追加し、参照先を明確化する。
