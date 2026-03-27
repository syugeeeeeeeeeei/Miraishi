# 修正内容の確認

## 1. 計算式の確認結果
- 対象: `src/main/lib/calculator.ts`
- 給与成長率の計算式（`currentBasicSalary * (1 + rate / 100)`）自体は正しいことを確認。

## 2. 実際の不具合原因
- 対象: `src/renderer/src/components/ScenarioWorkspace/ScenarioCard.tsx`
- 保存処理と再計算処理が非同期に並列実行され、古いシナリオ値で再計算されるタイミングがあった。

## 3. 修正内容
- `ScenarioCard`:
  - `handleSaveAndRecalculate` を `async` 化。
  - `await updateScenario(editableScenario)` の後に `await calculatePredictions()` を実行。
  - `onBlur` からは `void handleSaveAndRecalculate()` で呼び出す構成へ変更。

- `ScenarioWorkspace`:
  - `activeScenarios` の `updatedAt` から `scenarioRevisionKey` を作成。
  - 再計算用 `useEffect` の依存配列に `scenarioRevisionKey` を追加し、シナリオ内容更新時にも再計算を実行。

- `calculator.spec.ts`:
  - 給与成長率100%の回帰テストを追加。
  - 年次基本給が `360万 -> 720万 -> 1440万` となることを検証。

## 4. 動作確認結果
以下を実行し、すべて成功。

- `yarn typecheck`
- `yarn test`
- `yarn build`
