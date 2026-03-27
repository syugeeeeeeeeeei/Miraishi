# 修正内容の確認

## 実施内容
- `docs/history` を新設し、以下を追加した。
  - `README.md`
  - `index.md`（64件の集約インデックス）
  - `timeline.md`
  - `by_domain/*.md`（領域別統合サマリー）
- 旧トピック別フォルダを `docs/archive/legacy_docs_2026Q1` へ一括移動した。
- `docs/readmes/README.md` に `history` と `archive` への参照導線を追加した。
- `docs/archive/README.md` と `docs/history/by_domain/README.md` を追加した。

## 圧縮結果
- 旧: `docs` 直下に多数のトピックフォルダ（各3ファイル）
- 新: `docs` 直下は `readmes` / `history` / `archive` の3レイヤー構成へ整理

## 補足
- 旧原本は削除せず退避しているため、必要時に過去文書をそのまま参照可能。
