# 修正内容の確認

## 1. 実装箇所
- 対象: `src/renderer/src/components/ScenarioWorkspace/index.tsx`

## 2. ホイール感度の調整
- `WHEEL_SWITCH_THRESHOLD` を `80` から `52` に変更。
- `WHEEL_SWITCH_COOLDOWN_MS` を `280` から `200` に変更。
- これにより、より小さいホイール入力でシナリオ切替が発火しやすくなった。

## 3. スライド方向の明示制御
- `SlideDirection`（`left` / `right`）と `slideDirection` 状態を追加。
- ホイール時は以下の規則で方向を設定。
  - 上スクロール（`deltaY < 0`）: `left`
  - 下スクロール（`deltaY > 0`）: `right`

## 4. アニメーション更新
- `slideVariants` を定義し、`AnimatePresence` と `motion.div` に `custom` で方向を渡す構成へ変更。
- 方向に応じて入場・退場の `x` オフセットを反転するようにした。

## 5. 既存ボタン操作の整合
- `goToNext` / `goToPrev` でも `slideDirection` を設定し、操作手段に依存しない一貫した左右アニメーションに統一。

## 6. 動作確認結果
以下を実行し、すべて成功。

- `yarn typecheck`
- `yarn test`
- `yarn build`
