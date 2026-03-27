# 実装計画

1. ホイール感度の調整
- 切替閾値（`WHEEL_SWITCH_THRESHOLD`）を低くする。
- 必要に応じてクールダウン（`WHEEL_SWITCH_COOLDOWN_MS`）も短縮する。

2. スライド方向制御の追加
- スライド方向状態（`left` / `right`）を導入する。
- ホイール確定時に方向を決定し、アニメーションへ渡す。

3. アニメーション定義の更新
- `motion.div` を `variants + custom` 方式へ変更し、方向依存で初期位置と終了位置を切り替える。

4. 既存ナビゲーションとの整合
- 左右ボタン操作でも方向状態を設定して、遷移アニメーションの一貫性を維持する。

5. 検証
- `yarn typecheck`
- `yarn test`
- `yarn build`
