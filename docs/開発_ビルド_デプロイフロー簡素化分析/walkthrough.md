# 修正内容の確認

## 現在のフロー（実態）

### 開発
- `yarn dev` で起動。
- `yarn build` は `typecheck` の後に `electron-vite build` を実行。

### 配布
- `yarn deploy:unpack`: ディレクトリ出力（`electron-builder --dir`）。
- `yarn deploy:win`: `scripts/deploy-win.mjs` 経由。
  - Linux かつ wine なし: `--win zip` へフォールバック
  - それ以外: `--win`
  - `publish` は `ELECTRON_BUILDER_PUBLISH` 未指定時 `always`
- `yarn deploy:win:nsis`: NSIS を明示生成（`dotenv -- electron-builder --win --publish always`）。

## 問題点（シンプル化観点）
1. ドキュメント不整合
- `README.md` に `yarn build:win` / `yarn build:mac` が記載されているが、実スクリプトに存在しない。

2. `deploy:win` の既定が危険寄り
- 既定 `publish=always` のため、ローカル配布用途でも公開前提になりやすい。
- GH_TOKEN 未設定時の失敗原因にもなる。

3. Yarn プロジェクト内で `npm run` を多用
- 動作はするが、認知負荷が増える（`yarn` と `npm` の混在）。

4. 未使用アップデータ構成の残存
- `electron-updater` 依存と `dev-app-update.yml` はあるが、`autoUpdater` 実行コードは未実装。

## 推奨見直し（優先度順）

### 優先度A（すぐやる）
1. README の実コマンド化
- 実在スクリプトに合わせて `yarn deploy:win` などへ更新。

2. `deploy:win` の既定を `publish=never` へ
- ローカル配布の安全性を既定値で担保。
- 公開時だけ `release` 用コマンドを使う運用に分離。

3. scripts 内の `npm run` を `yarn` に統一
- 例: `typecheck`, `build`, `deploy:*`。

### 優先度B（次段）
4. コマンド体系を4本に整理
- `dev`
- `check`（lint/typecheck/test:run）
- `package:win`（非公開）
- `release:win`（公開）

5. `postinstall` の要否再確認
- 現在の依存構成で `electron-builder install-app-deps` が不要なら削除。

### 優先度C（要件確定後）
6. 自動アップデート方針を確定
- 今すぐ使わないなら `electron-updater` / `dev-app-update.yml` を一旦外して単純化。
- 使うなら `autoUpdater` 実装を追加して「設定のみ」状態を解消。

## 補足（セキュリティ）
- ローカル `.env` に GitHub トークンを置く運用はありうるが、漏えい時の影響が大きい。
- `publish=always` を既定にしないだけでも、誤公開・トークン依存の事故を減らせる。

## 変更ファイル
- `docs/開発_ビルド_デプロイフロー簡素化分析/task.md`
- `docs/開発_ビルド_デプロイフロー簡素化分析/implementation_plan.md`
- `docs/開発_ビルド_デプロイフロー簡素化分析/walkthrough.md`
