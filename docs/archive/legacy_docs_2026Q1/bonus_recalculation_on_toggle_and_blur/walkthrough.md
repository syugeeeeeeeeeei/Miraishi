# 修正内容の確認

## 変更概要

ボーナス設定に対して、
- モード切替ボタン押下時
- 切替先入力欄のフォーカスアウト時
の2タイミングで保存・再計算が走るようにした。

## 具体的な変更

- `ScenarioCard`
  - 保存・再計算処理を `persistScenario` に集約。
  - 最新編集中シナリオを参照するため `useRef` を導入。
  - `handleBonusModeSwitch` を追加し、ボタン切替時に即時保存・再計算。
  - `handleBonusInputBlur` を追加し、入力blur時に保存・再計算。
  - 入力欄 -> モード切替ボタン遷移時の blur 再計算を抑制。

- `ScenarioInputForm`
  - 親から `onBonusModeSwitch` / `onBonusInputBlur` を受け取るように変更。
  - ボーナス切替ボタンの更新処理を親コールバック呼び出しに変更。
  - ボーナス入力欄（固定額 / 月数）の `onBlur` で親へ通知するよう変更。
  - モード切替ボタンに判定用 `data-role` を追加。

## 検証結果

- `yarn typecheck` : 成功
- `yarn test --run src/main/lib/calculator.spec.ts` : 成功（8 tests passed）
