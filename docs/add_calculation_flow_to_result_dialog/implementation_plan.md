# 実装計画

1. 型定義拡張
- `AnnualSalaryDetail` に `calculationTrace` を追加し、ルール情報と中間値を保持できるようにする。

2. 計算エンジン拡張
- `calculator.ts` で既存計算の中間値（課税所得、標準報酬月額、税率帯、翌年基本給など）を収集し、`calculationTrace` として返す。

3. ダイアログUI拡張
- `PredictionResultTable.tsx` の詳細内訳ダイアログに、
  - 変動残業代
  - 額面年収
  - 社会保険料
  - 課税所得・税額
  - 手取り年収
  - 翌年基本給反映
  の6ステップを表示するセクションを追加する。

4. 可読性改善
- 数式を見やすいコードブロック風UIにする。
- ダイアログを縦スクロール対応にして情報量が増えても閲覧しやすくする。

5. 検証
- `yarn typecheck`
- `yarn test`
- `yarn build`
