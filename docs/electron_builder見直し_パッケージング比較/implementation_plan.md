# 実装計画

## 目的
`electron-builder` 継続 / 代替移行の判断材料を、リポジトリ実態に基づいて整理する。

## 進め方
1. 現在設定の確認
- `package.json` の scripts と依存関係を確認
- `electron-builder.yml` / `dev-app-update.yml` の設定確認
- `scripts/deploy-win.mjs` の配布フロー確認

2. 自動アップデート実装の有無確認
- `electron-updater` / `autoUpdater` 関連 API をコード検索
- 設定だけ存在しているのか、実際に起動時チェック等があるのか判定

3. 代替候補の比較
- Electron Forge
- electron-packager（最小構成）
- 継続利用（electron-builder）

4. 推奨方針を提示
- このリポジトリ要件（アイコン + 将来的な自動更新）に対する最小運用コストを優先
