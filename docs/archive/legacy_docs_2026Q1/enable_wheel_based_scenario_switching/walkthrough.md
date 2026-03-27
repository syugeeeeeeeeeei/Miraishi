# 修正内容の確認

## 1. 実装箇所
- 対象: `src/renderer/src/components/ScenarioWorkspace/index.tsx`

## 2. 追加した機能
- ホイールでシナリオを前後切替する機能を追加。
- `onWheel` を ScenarioWorkspace のメイン表示領域へ設定。

## 3. 切替条件の制御
- 入力フォーカス中（`input` / `textarea` / `select` など）は切替無効。
- 修飾キー押下中は切替無効。
- スクロール可能領域に余地がある場合は通常スクロールを優先。
- 境界に到達しているときのみシナリオ切替を許可。

## 4. 操作安定化
- 小さなホイール入力では即時切替しないようデルタ蓄積を導入。
- 連続切替を防ぐためクールダウン時間を追加。

## 5. 動作確認結果
以下を実行し、すべて成功。

- `yarn typecheck`
- `yarn test`
- `yarn build`
