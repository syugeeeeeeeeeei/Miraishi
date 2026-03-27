# 修正内容の確認

## 1. 型定義とバリデーション
- 対象: `src/types/miraishi.d.ts`
  - `Bonus` 型を追加（`fixed` / `basicSalaryMonths`）。
  - `Scenario` に `bonus?: Bonus` を追加（後方互換のため optional）。
  - `calculationTrace.rules` に `bonusMode` / `bonusMonths`、`intermediate` に `monthlyBasicSalaryForBonus` を追加。

- 対象: `src/main/lib/validators.ts`
  - `bonusSchema` を追加。
  - `scenarioSchema` に `bonus: bonusSchema.optional()` を追加。

## 2. 計算ロジック
- 対象: `src/main/lib/calculator.ts`
- 追加ロジック:
  - `bonusMode` と `bonusMonths` を取得（未設定時は `fixed` + `2` ヶ月を既定値として扱う）。
  - `monthlyBasicSalaryForBonus = annualBasicSalary / 12` を計算。
  - `bonusMode` が `basicSalaryMonths` の場合、
    `annualBonusCalculated = monthlyBasicSalaryForBonus * bonusMonths`。
  - それ以外は `annualBonusCalculated = scenario.annualBonus`。
- 反映箇所:
  - 額面年収合算
  - `breakdown.income.annualBonus`
  - `calculationTrace`

## 3. 入力UI
- 対象: `src/renderer/src/components/ScenarioWorkspace/ScenarioInputForm.tsx`
- 変更点:
  - ボーナス欄を「固定額 / 基本給連動」ボタンで切替可能に変更。
  - 固定額モード: 円入力。
  - 基本給連動モード: `ヶ月分` 入力（小数対応）。

## 4. 計算フロー表示
- 対象: `src/renderer/src/components/ScenarioWorkspace/PredictionResultTable.tsx`
- 変更点:
  - 額面年収セクションで、ボーナス式をモードに応じて表示。
    - 固定額: `ボーナス = 固定額`
    - 基本給連動: `ボーナス = 月額基本給 × 支給月数`

## 5. テスト
- 対象: `src/main/lib/calculator.spec.ts`
- 追加:
  - 基本給連動（2ヶ月）モード時に、年次成長に応じてボーナスが変動することを検証するテストを追加。

## 6. 動作確認結果
- `yarn typecheck` 成功
- `yarn test` 成功
- `yarn build` 成功
