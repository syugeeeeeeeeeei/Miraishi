# 実装計画

## 目的
「開発」「品質確認」「ローカル配布」「公開配布」を明確に分け、誤操作しづらいコマンド体系へ簡素化する。

## 手順
1. `package.json` scripts を整理
- `npm run` を `yarn` に統一
- `check` と `test:run` を追加
- `package:win`（非公開）と `release:win`（公開）へ分離

2. `deploy-win.mjs` を安全側へ変更
- 既定 `publish` を `never` に変更
- ログ文言を新コマンド名に合わせて更新

3. `README.md` を更新
- 存在しないコマンド記載を削除
- 現在の運用コマンドを明示

4. 検証
- `yarn run`
- `yarn eslint scripts/deploy-win.mjs`
- `yarn package:win`
- `yarn check`（現状の既存エラー把握を含む）
