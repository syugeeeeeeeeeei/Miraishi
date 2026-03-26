# 修正内容の確認

## 1. データ構造の拡張
- 対象: `src/types/miraishi.d.ts`
- `AnnualSalaryDetail` に `calculationTrace` を追加。
- 追加内容:
  - 計算ルール（成長率、残業割増率、各保険料率など）
  - 中間値（標準報酬月額、課税所得、所得控除合計など）
  - 控除ルール（基礎控除、配偶者控除、扶養控除、その他控除）
  - 所得税ルール（適用帯、税率、控除額）
  - 翌年基本給への反映情報

## 2. 計算ロジックの拡張
- 対象: `src/main/lib/calculator.ts`
- 既存計算結果に加えて、上記 `calculationTrace` を構築して `details` に含めるよう変更。
- 計算ロジック自体（金額算出の本体）は保持しつつ、説明可能な形で中間情報を出力。

## 3. 詳細ダイアログUIの拡張
- 対象: `src/renderer/src/components/ScenarioWorkspace/PredictionResultTable.tsx`
- 既存の収入/控除内訳に加え、`CalculationFlowPanel` を追加。
- 「計算フロー（ルールと実計算式）」として6ステップを表示。
- 各ステップで、
  - ルール文
  - 実数値を埋め込んだ計算式
  を併記する形式へ変更。

## 4. ダイアログ表示性の調整
- モーダルサイズを拡張し、本文をスクロール可能に変更。
- 情報量が多くても実用的に読めるレイアウトへ調整。

## 5. 動作確認結果
以下を実行し、すべて成功。

- `yarn typecheck`
- `yarn test`
- `yarn build`
