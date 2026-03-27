# 修正内容の確認

## 変更ファイル
- `electron-builder.yml`
- `package.json`
- `scripts/deploy-win.mjs`

## 変更ポイント
1. `electron-builder.yml`
- `win.signAndEditExecutable: false` を追加。
- Linux/WSL での Windows ビルド時に、不要な実行ファイル編集処理での依存を減らす目的。

2. `package.json`
- `deploy:win` を `node ./scripts/deploy-win.mjs` 経由に変更。
- `deploy:win:nsis` を追加し、従来どおり NSIS 生成を明示実行できるようにした。

3. `scripts/deploy-win.mjs`
- Linux 環境で `wine --version` を実行して可用性を判定。
- `wine` 未導入時は `electron-builder --win zip --publish <mode>` を実行してフォールバック。
- `wine` が使える、または Linux 以外の環境では従来どおり `electron-builder --win --publish <mode>` を実行。
- `ELECTRON_BUILDER_PUBLISH` 環境変数で `publish` モードを切り替え可能（未指定時は `always`）。

## 検証結果
- 実行コマンド: `ELECTRON_BUILDER_PUBLISH=never yarn deploy:win`
- 結果: 成功（終了コード 0）
- 生成物: `dist/miraishi-1.0.1-win.zip`
- `wine is required` エラーは再現せず。
