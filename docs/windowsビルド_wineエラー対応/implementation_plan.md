# 実装計画

1. 現状調査
- `package.json` の配布スクリプトと `electron-builder.yml` の `win` 設定を確認する。
- `yarn deploy:win` 実行ログから `wine` 要求箇所を特定する。

2. 実装修正
- `electron-builder.yml` の `win` 設定に `signAndEditExecutable: false` を追加し、Linux/WSL 上の不要な実行ファイル編集工程を回避する。
- `scripts/deploy-win.mjs` を追加し、Linux かつ `wine` 未導入時は `--win zip` に自動フォールバックする。
- `package.json` の `deploy:win` を新スクリプト経由へ変更し、`deploy:win:nsis` を追加する。

3. 検証
- `ELECTRON_BUILDER_PUBLISH=never yarn deploy:win` を実行し、`wine` 未導入でも `dist/miraishi-1.0.1-win.zip` が生成されることを確認する。
