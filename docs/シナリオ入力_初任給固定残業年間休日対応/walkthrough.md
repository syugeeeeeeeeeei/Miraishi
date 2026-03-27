# 修正内容の確認

## 実施日

- 2026-03-27

## 変更サマリー

- シナリオ入力を「初任給（固定残業代込み）」「固定残業時間」「年間休日数」ベースへ拡張した。
- 入力値から初任基本給を逆算し、固定残業代を算出する正規化処理を追加した。
- 固定残業代・変動残業代の時給計算を `÷160` から「年間休日数由来の所定労働時間（月）」へ変更した。
- 結果画面の計算式表示も新しい分母（所定労働時間）に更新した。
- 既存シナリオは、欠損項目を補完して互換維持するようにした。

## 主な変更ファイル

- `src/types/miraishi.d.ts`
- `src/main/lib/validators.ts`
- `src/main/lib/calculator.ts`
- `src/main/lib/calculator.spec.ts`
- `src/renderer/src/components/ScenarioWorkspace/ScenarioInputForm.tsx`
- `src/renderer/src/components/ScenarioWorkspace/PredictionResultTable.tsx`
- `src/renderer/src/store/atoms.ts`

## 実行結果

- `yarn typecheck`: 成功
- `yarn test --run`: 成功（4 files / 22 tests）
