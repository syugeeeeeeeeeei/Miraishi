# 修正内容の確認

## 1. 演算子表記の統一
- 対象: `src/renderer/src/components/ScenarioWorkspace/PredictionResultTable.tsx`
- 計算フロー表示の式テキストを以下へ置換。
  - `*` -> `×`
  - `/` -> `÷`

## 2. 対象範囲
- 時給計算
- 変動残業代計算
- 社会保険料計算
- 所得税/住民税計算
- 翌年基本給反映式
- 成長係数の補足式

## 3. 動作確認結果
- `yarn typecheck` 成功。
